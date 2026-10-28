// Resolves a coin's logo from every source we know and streams the image back.
// /api/img?mint=<mint>&u=<optional image url>
const RPCS = ['https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'];
const GATES = ['https://gateway.pinata.cloud/ipfs/', 'https://ipfs.io/ipfs/', 'https://dweb.link/ipfs/', 'https://ipfs.filebase.io/ipfs/', 'https://4everland.io/ipfs/', 'https://w3s.link/ipfs/', 'https://nftstorage.link/ipfs/'];
const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function withTimeout(ms) { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms); return { signal: ac.signal, done: () => clearTimeout(t) } }
async function fetchT(url, ms, opts = {}) { const t = withTimeout(ms); try { return await fetch(url, { ...opts, signal: t.signal, headers: { 'user-agent': 'Mozilla/5.0 aura-img', ...(opts.headers || {}) } }) } finally { t.done() } }
function variants(u) {
  if (!u) return [];
  if (u.startsWith('ipfs://')) u = 'https://ipfs.io/ipfs/' + u.slice(7).replace(/^ipfs\//, '');
  let cid = null;
  const a = u.match(/\/ipfs\/([^?#]+)/); if (a) cid = a[1];
  const b = !cid && u.match(/^https?:\/\/([a-z0-9]{40,})\.ipfs\.[^/]+(\/[^?#]*)?/i); if (b) cid = b[1] + (b[2] && b[2] !== '/' ? b[2] : '');
  if (cid) return [...new Set([u, ...GATES.map(g => g + cid)])];
  if (/gateway\.irys\.xyz\/|arweave\.net\//.test(u)) { const id = u.split('?')[0].split('/').pop(); return [...new Set([u, 'https://arweave.net/' + id, 'https://gateway.irys.xyz/' + id])] }
  return [u];
}
async function firstImage(urls) {
  return Promise.any(urls.map(async u => {
    const r = await fetchT(u, 12000); const ct = r.headers.get('content-type') || '';
    if (!r.ok || !(ct.startsWith('image/') || ct === 'application/octet-stream')) throw new Error('bad');
    const b = Buffer.from(await r.arrayBuffer()); if (b.length < 64) throw new Error('tiny');
    return { b, ct: ct.startsWith('image/') ? ct : 'image/png' };
  }));
}
async function firstJson(urls) {
  return Promise.any(urls.map(async u => { const r = await fetchT(u, 9000); if (!r.ok) throw new Error('bad'); const j = await r.json(); if (!j || typeof j !== 'object') throw new Error('bad'); return j }));
}
async function metadataUri(mint) {
  for (const rpc of RPCS) {
    try {
      const r = await fetchT(rpc, 5000, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getAccountInfo', params: [mint, { encoding: 'jsonParsed' }] }) });
      const j = await r.json(); const ext = j?.result?.value?.data?.parsed?.info?.extensions || [];
      const md = ext.find(e => e.extension === 'tokenMetadata'); if (md?.state?.uri) return md.state.uri;
      if (j?.result) return null;
    } catch (e) { }
  }
  return null;
}
async function jupIcon(mint) { try { const r = await fetchT('https://lite-api.jup.ag/tokens/v2/search?query=' + mint, 5000); const a = await r.json(); return (a.find(t => t.id === mint) || {}).icon || null } catch (e) { return null } }

module.exports = async (req, res) => {
  const mint = String(req.query.mint || ''); const hint = String(req.query.u || '');
  if (!MINT_RE.test(mint)) { res.status(400).end('bad mint'); return }
  const tries = [];
  if (/pump$/.test(mint) || req.query.pad === 'pump.fun') tries.push(firstImage(['https://images.pump.fun/coin-image/' + mint + '?variant=256x256']));
  if (/^https?:\/\/|^ipfs:\/\//.test(hint)) tries.push(firstImage(variants(hint)));
  tries.push((async () => { const i = await jupIcon(mint); if (!i) throw new Error('none'); return firstImage(variants(i)) })());
  tries.push((async () => { const uri = await metadataUri(mint); if (!uri) throw new Error('none'); const m = await firstJson(variants(uri)); const im = m.image || m.properties?.files?.[0]?.uri; if (!im) throw new Error('none'); return firstImage(variants(im)) })());
  // every source races; the first real image wins
  try { const { b, ct } = await Promise.any(tries); res.setHeader('content-type', ct); res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'); res.setHeader('access-control-allow-origin', '*'); res.status(200).end(b); return } catch (e) { }
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('cache-control', 'public, max-age=60, s-maxage=120'); res.status(404).end('no image');
};
