(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const JUP = 'https://lite-api.jup.ag/tokens/v2', SF = 'https://www.stonkfun.xyz', SFAPI = SF + '/api/public/v1/tokens';
const SOLM = 'So11111111111111111111111111111111111111112';
const PADS = new Set(['stonkfun']), PAIRD_CUT = .10, HOOKS_CUT = .90;
const BAD = /fuck|shit|cunt|n[i1]gg|fag|retard|porn|nazi|hitler|pedo|rape|kys|\bsex\b|cum\b/i;
const usd = v => v == null || !isFinite(v) ? '—' : v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? '$' + (v / 1e3).toFixed(1) + 'K' : v >= 1 ? '$' + v.toFixed(0) : '$' + v.toFixed(2);
const usd2 = v => v == null || !isFinite(v) ? '—' : v >= 1000 ? usd(v) : v >= 1 ? '$' + v.toFixed(2) : '$' + v.toFixed(3);
const price = v => v == null || !isFinite(v) ? '—' : v >= 1 ? '$' + v.toFixed(2) : v >= .01 ? '$' + v.toFixed(4) : '$' + v.toPrecision(3);
const pct = v => v == null || !isFinite(v) ? '—' : (v > 0 ? '+' : '') + (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)) + '%';
const fmtN = v => v == null || !isFinite(v) ? '—' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'K' : Math.round(v).toLocaleString('en-US');
const ago = t => { if (!t) return '—'; const s = Math.max(0, (Date.now() - new Date(t)) / 1000); return s < 60 ? Math.round(s) + 's' : s < 3600 ? Math.round(s / 60) + 'm' : s < 86400 ? Math.round(s / 3600) + 'h' : Math.round(s / 86400) + 'd' };
const short = a => a ? a.slice(0, 4) + '…' + a.slice(-4) : '';
const padName = p => p === 'paird' ? 'Paird' : p === 'stonkfun' ? 'StonkFun' : p === 'pump.fun' ? 'pump.fun' : (p || '—');
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 1800) };
const tile = s => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#112529"/><text x="32" y="41" text-anchor="middle" font-family="Arial" font-weight="700" font-size="24" fill="#39d6a3">${String(s || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?'}</text></svg>`);
const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d } catch (e) { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pcdn = (m, v = '128x128') => 'https://images.pump.fun/coin-image/' + m + '?variant=' + v;
function countTo(el, to, fmt, dur = 900) { if (!el || to == null || !isFinite(to)) return; const from = el._v || 0; el._v = to; const t0 = performance.now(); const f = n => { const k = Math.min(1, (n - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(f) }; requestAnimationFrame(f) }

/* =================== intro =================== */
// the animation lives in paird3d.js (WebGL). This only tracks loading and closes it.
const LOADED = new Set();
const INTRO = { done: false, t0: performance.now() };
function introProgress() { if (INTRO.done) return; const b = $('#ildB'); if (b) b.style.width = Math.max(10, LOADED.size / 3 * 100) + '%' }
function closeIntro(fast) {
  if (INTRO.done) return; INTRO.done = true;
  const el = $('#intro'); document.body.classList.remove('locked'); if (!el) return;
  document.body.classList.add('entering'); setTimeout(() => document.body.classList.remove('entering'), 2200);
  if (window.__mx3dIntro) window.__mx3dIntro.exit(fast === true);
  else { el.classList.add('out'); setTimeout(() => el.remove(), 950) }
  revealAll();
}
window.__mx = { loaded: () => LOADED.size, close: () => closeIntro(false), isHome: () => VIEW === 'home' };
(function intro() {
  const el = $('#intro'); if (!el) return;
  $('#iskip').onclick = e => { e.stopPropagation(); closeIntro(true) };
  el.addEventListener('click', () => { if (performance.now() - INTRO.t0 > 900) closeIntro(true) });
  addEventListener('keydown', e => { if (!INTRO.done && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) closeIntro(true) });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setTimeout(() => closeIntro(true), 400); return }
  // 2D fallback only when WebGL is missing, or the 3D module never shows up
  let gl = false; try { const c = document.createElement('canvas'); gl = !!(c.getContext('webgl2') || c.getContext('webgl')) } catch (e) { }
  const fb = () => { if (INTRO.done || (window.__mx3d && window.__mx3d.intro)) return; el.classList.add('fb'); setTimeout(() => closeIntro(false), 1900) };
  if (!gl) setTimeout(fb, 300);
  else { const t = performance.now(), w = () => { if (INTRO.done || window.__mx3d) { if (window.__mx3d && !window.__mx3d.intro) fb(); return } if (performance.now() - t > 12000) return fb(); setTimeout(w, 250) }; setTimeout(w, 250) }
})();

/* =================== data =================== */
const abs = u => !u ? '' : /^https?:/.test(u) ? u : SF + (u.startsWith('/') ? '' : '/') + u;
const fromJup = t => ({ mint: t.id, sym: String(t.symbol || '').replace(/^\$+/, ''), name: t.name, jimg: t.icon, pad: t.launchpad, mcap: t.mcap, price: t.usdPrice, liq: t.liquidity, holders: t.holderCount, hch: t.stats1h?.holderChange, organic: t.organicScore, dev: t.dev, created: t.firstPool?.createdAt || t.createdAt, gpool: t.graduatedPool,
  c5: t.stats5m?.priceChange, c1: t.stats1h?.priceChange, c24: t.stats24h?.priceChange,
  v1: t.stats1h ? (t.stats1h.buyVolume || 0) + (t.stats1h.sellVolume || 0) : undefined, jv24: t.stats24h ? (t.stats24h.buyVolume || 0) + (t.stats24h.sellVolume || 0) : undefined,
  b1: t.stats1h?.numBuys, s1: t.stats1h?.numSells, bv1: t.stats1h?.buyVolume, sv1: t.stats1h?.sellVolume, tr1: t.stats1h?.numTraders,
  tw: t.twitter, tg: t.telegram, top10: t.audit?.topHoldersPercentage, mintOff: t.audit?.mintAuthorityDisabled, freezeOff: t.audit?.freezeAuthorityDisabled, jt: Date.now() });
const fromSF = t => ({ mint: t.mint, sym: String(t.symbol || '').replace(/^\$+/, ''), name: t.name, simg: abs(t.imageUrl), pad: 'stonkfun', mcap: t.market?.marketCapUsd, price: t.market?.priceUsd, liq: t.market?.liquidityUsd, v24: t.market?.volume24hUsd, peak: t.market?.peakMarketCapUsd, created: t.createdAt, pool: t.pool,
  quote: t.quote?.symbol, qmint: t.quote?.mint, qlogo: abs(t.quote?.logoUrl), qcat: t.quote?.categoryLabel, prog: t.graduationProgress, status: t.status, tfee: t.transferFee?.bps, sx: t.links?.twitter, sweb: t.links?.website, stg: t.links?.telegram });
const ok = c => c && c.mint && !BAD.test((c.sym || '') + ' ' + (c.name || ''));
async function get(u, ms = 10000) { const ac = new AbortController(); const to = setTimeout(() => ac.abort(), ms); try { const r = await fetch(u, { cache: 'no-store', signal: ac.signal }); if (!r.ok) throw new Error(r.status); return await r.json() } finally { clearTimeout(to) } }
let JQ = Promise.resolve(), JNEXT = 0;
function jdirect(path) {
  const run = async () => {
    for (let i = 0; i < 4; i++) {
      const w = JNEXT - Date.now(); if (w > 0) await sleep(w); JNEXT = Date.now() + 500;
      try { return await get(`${JUP}/${path}`) } catch (e) { if (String(e.message) !== '429') throw e; JNEXT = Date.now() + 1500 * (i + 1) }
    }
    throw new Error('429');
  };
  const p = JQ.then(run); JQ = p.catch(() => { }); return p;
}
async function jget(path) { try { return await get('/api/jup?p=' + encodeURIComponent(path), 12000) } catch (e) { return jdirect(path) } }
const ALL = new Map(), GOOD = {}, PREV = new Map();
const S = { new: [], top: [], vol: [] };
let TAB = 'new', SORT = 'def', Q = '', PAIR = '', REMOTE = [], SFTOTAL = null;
let WATCH = store.get('paird.watch', []); if (!Array.isArray(WATCH)) WATCH = [];
const SEEN = new Set(); let FIRST = true;
function keep(list) {
  return list.filter(ok).map(c => {
    const o = ALL.get(c.mint) || {}; const n = { ...o };
    for (const k in c) if (c[k] !== undefined && c[k] !== null && c[k] !== '') n[k] = c[k];
    if (o.pad === 'stonkfun' || c.pad === 'stonkfun') n.pad = 'stonkfun';
    ALL.set(c.mint, n); return n;
  });
}
const byNew = (a, b) => new Date(b.created || 0) - new Date(a.created || 0);
const sfList = j => keep((j.data?.tokens || []).map(fromSF));
async function loadSFNew() {
  try {
    const j = await get(`${SFAPI}?sort=newest&pageSize=30&page=1`); SFTOTAL = j.data?.pagination?.total ?? SFTOTAL; const L = sfList(j);
    const fresh = []; L.forEach(c => { if (!SEEN.has(c.mint)) { SEEN.add(c.mint); if (!FIRST) fresh.push(c.mint) } });
    S.new = [...new Set([...S.new, ...L.map(c => c.mint)])].map(m => ALL.get(m)).filter(Boolean).sort(byNew).slice(0, 90).map(c => c.mint);
    FIRST = false; if (TAB === 'new') grid(fresh); stats();
    fresh.slice(0, 2).forEach((m, i) => setTimeout(() => { const c = ALL.get(m); if (c) drop(c) }, 400 + i * 1100));
  } catch (e) { if (!S.new.length && TAB === 'new') $('#grid').innerHTML = '<div class="empty">StonkFun isn\'t answering right now. Try again in a moment.</div>' }
  finally { LOADED.add('n'); introProgress() }
}
async function loadSFTop() { try { S.top = sfList(await get(`${SFAPI}?sort=marketCap&pageSize=60&page=1`)).map(c => c.mint); if (TAB === 'top') grid(); stats() } catch (e) { } finally { LOADED.add('t'); introProgress() } }
async function loadSFVol() { try { S.vol = sfList(await get(`${SFAPI}?sort=volume&pageSize=60&page=1`)).map(c => c.mint); if (TAB === 'vol') grid(); strip(); stats() } catch (e) { } finally { LOADED.add('v'); introProgress() } }
async function loadSFMore() { for (const p of [2, 3]) { try { sfList(await get(`${SFAPI}?sort=newest&pageSize=50&page=${p}`)); stats() } catch (e) { } await sleep(700) } }
async function enrich() {
  const now = Date.now();
  const pri = [...new Set([...S.vol.slice(0, 40), ...S.top.slice(0, 30), ...S.new.slice(0, 40), ...WATCH])];
  const need = pri.filter(m => { const c = ALL.get(m); return !c || !c.jt || now - c.jt > 45000 }).slice(0, 100);
  if (!need.length) return;
  try { const r = await jget('search?query=' + need.join(',')); keep(r.filter(t => need.includes(t.id)).map(t => { const c = fromJup(t); delete c.pad; return c })); need.forEach(m => { const c = ALL.get(m); if (c && !c.jt) c.jt = now }); grid(); if (VIEW === 'watch') wgrid(); stats() } catch (e) { }
}

/* =================== images =================== */
// pump.fun's image server has every pump.fun coin (valid sizes: 64, 86, 128, 256, 300, 400)
const wsrv = (u, n = 160) => 'https://wsrv.nl/?url=' + encodeURIComponent(u) + `&w=${n}&h=${n}&fit=cover&default=1`;
const apiImg = c => '/api/img?mint=' + encodeURIComponent(c.mint) + (c.simg || c.jimg ? '&u=' + encodeURIComponent(c.simg || c.jimg) : '') + (c.pad === 'pump.fun' ? '&pad=pump.fun' : '');
const isPump = c => c.pad === 'pump.fun' || /pump$/.test(c.mint || '');
const srcs = (c, sz = 'm') => {
  const L = []; const v = sz === 's' ? '86x86' : sz === 'l' ? '256x256' : '128x128';
  if (isPump(c) && c.mint) L.push(pcdn(c.mint, v));
  if (GOOD[c.mint]) L.push(GOOD[c.mint]);
  if (c.simg) L.push(c.simg); if (c.jimg) L.push(c.jimg);
  const o = c.simg || c.jimg; if (o) L.push(wsrv(o, sz === 'l' ? 300 : 160));
  if (c.mint && c.mint.length >= 32) L.push(apiImg(c));
  return [...new Set(L)];
};
window.__ai = (el, sym) => {
  const n = (el.dataset.alt || '').split('|').filter(Boolean);
  if (n.length) { el.dataset.alt = n.slice(1).join('|'); el.src = n[0]; return }
  el.onerror = null; const api = el.dataset.api; el.src = tile(sym);
  // one more try a bit later: brand-new coins sometimes publish their image a few seconds after launch
  if (api && !el.dataset.retried) { el.dataset.retried = 1; setTimeout(() => { if (!el.isConnected) return; const t = new Image(); t.onload = () => { el.src = t.src }; t.src = api + '&r=' + Date.now() }, 12000) }
};
window.__ok = (el, m) => { if (m && !el.src.startsWith('data:') && !el.src.includes('images.pump.fun')) GOOD[m] = el.src };
const img = (c, cls = '', id = '', sz = 'm') => {
  const L = srcs(c, sz); const sym = esc((c.sym || '').replace(/['\\]/g, '')); const idA = id ? ` id="${id}"` : '';
  return L.length ? `<img${idA} class="${cls}" src="${esc(L[0])}" data-alt="${esc(L.slice(1).join('|'))}" data-api="${c.mint && c.mint.length >= 32 ? esc(apiImg(c)) : ''}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="__ok(this,'${esc(c.mint || '')}')" onerror="__ai(this,'${sym}')">` : `<img${idA} class="${cls}" src="${tile(c.sym)}" alt="">`;
};


/* =================== home renders =================== */
const qChip = c => c.quote ? `<span class="qt" title="Paired with ${esc(c.quote)}">${c.qlogo ? `<img src="${esc(c.qlogo)}" alt="" onerror="this.remove()">` : '⇄'}${esc(c.quote)}</span>` : '';
function pairsAgg() {
  const m = new Map();
  for (const c of ALL.values()) {
    if (c.pad !== 'stonkfun' || !c.quote) continue;
    const o = m.get(c.quote) || { q: c.quote, logo: c.qlogo, cat: c.qcat, n: 0, mc: 0, vol: 0, coins: [] };
    o.n++; o.mc += c.mcap || 0; o.vol += c.v24 || 0; o.coins.push(c); if (!o.logo && c.qlogo) o.logo = c.qlogo; if (!o.cat && c.qcat) o.cat = c.qcat; m.set(c.quote, o);
  }
  return [...m.values()].sort((a, b) => b.vol - a.vol || b.n - a.n || b.mc - a.mc);
}
let MPKEY = '';
function mostPaird() {
  const L = pairsAgg(); if (!L.length) return;
  $('#nPairs').textContent = L.length;
  const top = L.slice(0, 8), key = top.map(x => x.q + x.n + Math.round(x.vol / 1000)).join() + PAIR;
  if (key !== MPKEY) {
    MPKEY = key;
    $('#mp').innerHTML = top.map((x, i) => `<div class="pcard${PAIR === x.q ? ' on' : ''}" data-pair="${esc(x.q)}"><span class="rk">#${i + 1}</span><div class="ph">${x.logo ? `<img src="${esc(x.logo)}" alt="" onerror="this.style.visibility='hidden'">` : '<img alt="">'}<div style="min-width:0"><b>${esc(x.q)}</b><span>${esc(x.cat || 'pair')}</span></div></div>
      <div class="pn"><div><b>${x.n}</b><span>coins paird</span></div><div><b>${usd(x.vol)}</b><span>24h volume</span></div><div><b>${usd(x.mc)}</b><span>market cap</span></div></div>
      <div class="stk">${x.coins.sort((a, b) => (b.mcap || 0) - (a.mcap || 0)).slice(0, 7).map(c => img(c, '', '', 's')).join('')}</div><span class="go">Open pair →</span></div>`).join('');
    $('#pchips').innerHTML = L.slice(8, 40).map(x => `<button data-pair="${esc(x.q)}" class="${PAIR === x.q ? 'on' : ''}">${x.logo ? `<img src="${esc(x.logo)}" alt="" onerror="this.style.visibility='hidden'">` : '<img alt="">'}${esc(x.q)}<i>${x.n}</i></button>`).join('');
    const tot = L.reduce((a, x) => a + x.n, 0);
    $('#mpNote').textContent = `${tot} StonkFun coins on the board, paired with ${L.length} different assets · tap one to see its coins`;
  }
  PLIST = L;
}
function stats() {
  const all = [...ALL.values()].filter(c => c.pad === 'stonkfun');
  $('#nAll').textContent = all.length;
  if (SFTOTAL != null) countTo($('#bTot'), SFTOTAL, v => Math.round(v).toLocaleString('en-US'));
  const L = pairsAgg(); countTo($('#bPairs'), L.length, v => Math.round(v));
  countTo($('#bVol'), all.reduce((a, c) => a + (c.v24 || 0), 0), usd);
  mostPaird(); justPaired(); mmap(); if (VIEW === 'launch') pairList(); if (VIEW === 'pair' && CURP) pairView(CURP); if (VIEW === 'check' && !$('#kCoin').dataset.filled) checkCoins();
}
let STRIPKEY = '';
function strip() {
  if (!$('#strip')) return;
  const L = S.vol.slice(0, 18).map(m => ALL.get(m)).filter(Boolean); if (!L.length) return;
  const key = L.map(c => c.mint).join(); if (key === STRIPKEY) return; STRIPKEY = key;
  const one = L.map(c => `<a class="tc" href="#/coin/${c.mint}" data-m="${c.mint}"><div class="im">${img(c, '', '', 'l')}${c.quote ? `<span class="pp sf"><i></i>${esc(c.quote)}</span>` : ''}<span class="chg ${(c.c1 || 0) < 0 ? 'dn' : 'up'}">${c.c1 != null ? pct(c.c1) : usd(c.v24)}</span></div><div class="bd"><b>$${esc((c.sym || '').slice(0, 14))}</b><span>${usd(c.mcap)} · vol ${usd(c.v24)} / 24h</span></div></a>`).join('');
  $('#strip').innerHTML = `<div class="mq-in" style="--dur:${L.length * 4.5}s">${one}${one}</div>`;
}
/* live drops on the hero rings: every new StonkFun coin, with its pair */
function drop(c) {
  dispatchEvent(new CustomEvent('mx:pulse', { detail: { kind: 'new' } }));
  const box = $('#drops'); if (!box || VIEW !== 'home' || document.hidden || !INTRO.done) return;
  const d = document.createElement('div'); d.className = 'hdrop';
  d.innerHTML = `${img(c, '', '', 's')}<b>$${esc((c.sym || '').slice(0, 10))}</b><span>${c.quote ? 'paired with ' + esc(c.quote) : 'just launched'}</span>`;
  box.prepend(d); while (box.children.length > 3) box.lastChild.remove(); setTimeout(() => d.remove(), 5600);
}
/* real pairs for the rings in the intro and the hero */
window.__mxPairs = () => {
  const seen = new Set(), out = [];
  for (const m of [...S.vol, ...S.top, ...S.new]) { const c = ALL.get(m); if (!c || seen.has(m) || !c.quote || !c.qlogo || !(c.simg || c.jimg)) continue; seen.add(m); out.push({ k: m, r: out.length, img: srcs(c, 'm')[0], q: c.qlogo, sym: c.sym, quote: c.quote }); if (out.length >= 24) break }
  return out;
};
/* just paired: the newest StonkFun coins and what they're paired with */
let JPKEY = '';
function justPaired() {
  const L = S.new.map(m => ALL.get(m)).filter(c => c && c.quote).slice(0, 8); if (!L.length) return;
  const key = L.map(c => c.mint).join(); if (key === JPKEY) { $$('#jp .jr').forEach(r => { const c = ALL.get(r.dataset.m); if (c) { r.querySelector('.ag').textContent = ago(c.created) + ' ago'; r.querySelector('.mc2').textContent = usd(c.mcap) } }); return }
  const old = new Set($$('#jp .jr').map(r => r.dataset.m)); JPKEY = key;
  $('#jp').innerHTML = L.map(c => `<a class="jr${old.size && !old.has(c.mint) ? ' fresh' : ''}" href="#/coin/${c.mint}" data-m="${c.mint}"><span class="pr2">${img(c, '', '', 's')}<i class="lk"></i>${c.qlogo ? `<img src="${esc(c.qlogo)}" alt="" onerror="this.style.visibility='hidden'">` : '<img alt="">'}</span><b>$${esc((c.sym || '').slice(0, 12))}</b><span class="pw">paired with <em>${esc(c.quote)}</em></span><span class="mc2 num">${usd(c.mcap)}</span><span class="ag">${ago(c.created)} ago</span></a>`).join('');
}
/* pair page */
function pairView(q) {
  const P = pairsAgg().find(x => x.q === q);
  const coins = [...ALL.values()].filter(c => c.quote === q).sort((a, b) => (b.v24 || 0) - (a.v24 || 0) || (b.mcap || 0) - (a.mcap || 0));
  const logo = P?.logo || coins.find(c => c.qlogo)?.qlogo;
  $('#pHead').innerHTML = `${logo ? `<img src="${esc(logo)}" alt="" onerror="this.style.visibility='hidden'">` : ''}<div style="min-width:0"><h2>${esc(q)}</h2><div class="note">${esc(P?.cat || 'pair')} · quote asset on StonkFun</div></div>
    <div class="pact"><a class="btn pri" href="#/launch/${encodeURIComponent(q)}">Pair a coin with ${esc(q)}</a><button class="btn gh" id="pShare">Share</button></div>`;
  $('#pStats').innerHTML = [st('Coins paird', coins.length ? String(coins.length) : '—'), st('24h volume', usd(coins.reduce((a, c) => a + (c.v24 || 0), 0))), st('Market cap', usd(coins.reduce((a, c) => a + (c.mcap || 0), 0))), st('Top coin', coins[0] ? '$' + (coins[0].sym || '') : '—')].join('');
  $('#pGrid').innerHTML = coins.length ? coins.slice(0, 72).map(c => card(c)).join('') : `<div class="empty">No coins on the board are paired with ${esc(q)} right now. Be the first.</div>`;
  $('#pShare').onclick = () => window.open('https://x.com/intent/post?text=' + encodeURIComponent(`${coins.length} StonkFun coins are paired with ${q} right now.\n\npair yours. get paid in ${q}.\n${location.origin}/#/pair/${encodeURIComponent(q)}`), '_blank', 'noopener');
  if (!coins.length && P == null) { get(`${SFAPI}?q=${encodeURIComponent(q)}&pageSize=50&page=1`).then(j => { sfList(j); if (VIEW === 'pair') pairView(q) }).catch(() => { }) }
}

/* the hero's live pair panel follows the rings */
let LPK = '';
function livePair(p) {
  const c = p && ALL.get(p.k); if (!c) return; LPK = c.mint;
  const L = window.__mxPairs ? window.__mxPairs() : []; const i = L.findIndex(x => x.k === c.mint);
  $('#lpIdx').textContent = i >= 0 ? `${i + 1} / ${L.length}` : '';
  $('#lpRow').innerHTML = `${img(c, '', '', 'm')}<b>$${esc((c.sym || '').slice(0, 12))}</b><span class="lk2"></span>${c.qlogo ? `<img src="${esc(c.qlogo)}" alt="" onerror="this.style.visibility='hidden'">` : ''}<b class="q">${esc(c.quote)}</b>`;
  const pd = paidDay(c);
  $('#lpSt').innerHTML = `<span>mcap <b>${usd(c.mcap)}</b></span><span>24h vol <b>${usd(c.v24 ?? c.jv24)}</b></span>${c.tfee != null ? `<span>fee <b>${c.tfee / 100}%</b></span>` : ''}${pd != null ? `<span class="hi">holders would get <b>${usd2(pd)}/day</b> in ${esc(c.quote)} on Paird</span>` : ''}`;
  $('#lpCoin').href = '#/coin/' + c.mint; $('#lpGo').href = '#/launch/' + encodeURIComponent(c.quote); $('#lpGo').textContent = 'Pair yours with ' + c.quote;
  $('#slA').textContent = '$' + (c.sym || '').slice(0, 10); $('#slB').textContent = c.quote;
}
addEventListener('mx:pair', e => livePair(e.detail));
$('#lpPrev').addEventListener('click', () => window.__mxHero && window.__mxHero.prev());
$('#lpNext').addEventListener('click', () => window.__mxHero && window.__mxHero.next());

/* the split demo */
const HK = [['holders', 'Holders', '#39d6a3'], ['drop', 'The Drop', '#9ff3d6'], ['burn', 'Burn', '#fb7185'], ['you', 'You', '#69aac1'], ['team', 'Team', '#e6fbf4']];
const PRESETS = { holders: { holders: 60, drop: 30 }, drop: { drop: 70, holders: 20 }, burn: { burn: 70, holders: 20 }, builder: { you: 50, holders: 40 }, balanced: { holders: 30, drop: 20, burn: 20, you: 20 } };
function sbar(el, sp, labels = true) {
  const parts = HK.filter(h => sp[h[0]] > 0).map(h => `<i style="width:${sp[h[0]]}%;background:${h[2]}" title="${h[1]} ${sp[h[0]]}%">${labels && sp[h[0]] >= 8 ? h[1] + ' ' + sp[h[0]] + '%' : ''}</i>`);
  el.innerHTML = parts.join('') + `<i style="width:10%;background:#21414d;color:#8aa3ad" title="Paird 10%">${labels ? 'Paird 10%' : ''}</i>`;
}
function preset(p) {
  const sp = PRESETS[p]; sbar($('#sbar'), sp);
  $('#sleg').innerHTML = HK.filter(h => sp[h[0]]).map(h => `<span style="--c:${h[2]}">${h[1]} ${sp[h[0]]}%</span>`).join('') + '<span style="--c:#21414d">Paird 10%</span>';
  $$('#preset button').forEach(b => b.classList.toggle('on', b.dataset.p === p));
}
$('#preset').addEventListener('click', e => { const b = e.target.closest('button'); if (b) preset(b.dataset.p) });
preset('holders');
/* =================== stonk market map (squarified treemap) =================== */
let MMB = 'v24';
function squarify(vals, X, Y, W, H) {
  const out = [], total = vals.reduce((a, v) => a + v.v, 0); if (!total) return out;
  let items = vals.map(v => ({ ...v, a: v.v * W * H / total })), x = X, y = Y, w = W, h = H;
  while (items.length) {
    const side = Math.min(w, h); let row = [], best = Infinity, i = 0;
    while (i < items.length) {
      const r = [...row, items[i]], sum = r.reduce((a, b) => a + b.a, 0), mx = Math.max(...r.map(b => b.a)), mn = Math.min(...r.map(b => b.a));
      const worst = Math.max(side * side * mx / (sum * sum), sum * sum / (side * side * mn)); if (worst > best) break; best = worst; row = r; i++;
    }
    items = items.slice(row.length);
    const sum = row.reduce((a, b) => a + b.a, 0), th = sum / side; let o = 0;
    for (const b of row) { const len = b.a / th; out.push(w >= h ? { ...b, x, y: y + o, w: th, h: len } : { ...b, x: x + o, y, w: len, h: th }); o += len }
    if (w >= h) { x += th; w -= th } else { y += th; h -= th }
  }
  return out;
}
const heat = v => { if (v == null || !isFinite(v)) return 'rgb(21,42,48)'; const k = Math.max(-1, Math.min(1, v / 25)), t = Math.pow(Math.abs(k), .65), n = [19, 42, 48], to = k >= 0 ? [30, 168, 126] : [206, 62, 94]; return `rgb(${n.map((x, i) => Math.round(x + (to[i] - x) * t)).join(',')})` };
function mmap() {
  const box = $('#mmap'); if (!box || VIEW !== 'home') return;
  const L = [...ALL.values()].filter(c => c.sym && (c[MMB] || 0) > 0 && c.pad === 'stonkfun').sort((a, b) => b[MMB] - a[MMB]).slice(0, 40);
  const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
  if (!L.length) { if (ALL.size) box.innerHTML = `<div class="empty" style="position:absolute;inset:0;display:grid;place-items:center">${MMB === 'v24' ? 'No 24h volume reported for these coins yet.' : 'No market caps reported yet.'}</div>`; return }
  box.querySelectorAll('.skel,.empty').forEach(e => e.remove());
  const have = new Map([...box.querySelectorAll('.mt')].map(e => [e.dataset.m, e])), keepSet = new Set();
  for (const r of squarify(L.map(c => ({ c, v: c[MMB] })), 0, 0, W, H)) {
    const c = r.c; keepSet.add(c.mint);
    let el = have.get(c.mint); if (!el) { el = document.createElement('div'); el.className = 'mt new'; el.dataset.m = c.mint; box.appendChild(el) }
    const m = Math.min(r.w, r.h), fs = Math.max(10, Math.min(26, m / 5.2)), is = Math.min(58, m * .36);
    el.style.cssText = `left:${r.x.toFixed(1)}px;top:${r.y.toFixed(1)}px;width:${r.w.toFixed(1)}px;height:${r.h.toFixed(1)}px;background-color:${heat(c.c1)};--fs:${fs.toFixed(1)}px;--is:${is.toFixed(0)}px`;
    el.classList.toggle('xs', r.w < 74 || r.h < 56 || is < 18); el.classList.toggle('xxs', r.w < 36 || r.h < 22);
    const key = (c.sym || '') + '|' + pct(c.c1) + '|' + (is >= 18);
    if (el._k !== key) { el._k = key; el.innerHTML = `${is >= 18 ? img(c, '', '', 's') : ''}<b>$${esc((c.sym || '').slice(0, 10))}</b><span>${pct(c.c1)}</span>` }
  }
  have.forEach((e, m) => { if (!keepSet.has(m)) e.remove() });
  const tot = L.reduce((a, c) => a + (c[MMB] || 0), 0);
  $('#mmNote').textContent = `${L.length} coins · ${usd(tot)} ${MMB === 'v24' ? 'traded in 24h' : 'combined market cap'} · colour = 1h change · tap a tile`;
}
$('#mmBy').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; MMB = b.dataset.b; $$('#mmBy button').forEach(x => x.classList.toggle('on', x === b)); mmap() });
$('#mmap').addEventListener('click', e => { const t = e.target.closest('.mt'); if (t) location.hash = '#/coin/' + t.dataset.m });
{ let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(mmap, 150) }) }
(function mtip() {
  const tip = $('#mtip'), box = $('#mmap'); let cur = '';
  box.addEventListener('pointermove', e => {
    const t = e.target.closest('.mt'); if (!t) { tip.classList.remove('on'); cur = ''; return }
    const c = ALL.get(t.dataset.m); if (!c) return;
    if (cur !== c.mint) { cur = c.mint; tip.innerHTML = `<div class="h">${img(c, '', '', 's')}<div><b>$${esc((c.sym || '').slice(0, 14))}</b><br>${esc((c.name || '').slice(0, 30))}</div></div>
      <div class="r"><span>Paired with</span><b>${esc(c.quote || '—')}</b></div><div class="r"><span>Market cap</span><b>${usd(c.mcap)}</b></div><div class="r"><span>Volume 24h</span><b>${usd(c.v24)}</b></div>
      <div class="r"><span>1h change</span><b class="${(c.c1 || 0) < 0 ? 'dn' : 'up'}">${pct(c.c1)}</b></div><div class="r"><span>Holders</span><b>${fmtN(c.holders)}</b></div>` }
    const x = Math.min(innerWidth - tip.offsetWidth - 12, e.clientX + 16), y = Math.min(innerHeight - tip.offsetHeight - 12, e.clientY + 16);
    tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('on');
  });
  box.addEventListener('pointerleave', () => { tip.classList.remove('on'); cur = '' });
})();


/* =================== board =================== */
let PLIST = [];
const xUrl = c => c.sx || (c.tw && /^https?:/.test(c.tw) ? c.tw : c.tw ? 'https://x.com/' + String(c.tw).replace(/^@/, '') : '');
const tgUrl = c => c.stg || (c.tg && /^https?:/.test(c.tg) ? c.tg : '');
const webUrl = c => c.sweb || '';
const socials = c => { const a = []; const x = xUrl(c), w = webUrl(c), t = tgUrl(c); if (x) a.push(`<span data-href="${esc(x)}" title="X">𝕏</span>`); if (w) a.push(`<span data-href="${esc(w)}" title="Website">↗</span>`); if (t) a.push(`<span data-href="${esc(t)}" title="Telegram">✈</span>`); return a.length ? `<span class="soc">${a.join('')}</span>` : '' };
const isGrad = c => c.gpool || c.status === 'graduated' || c.status === 'migrated' || (c.prog != null && c.prog >= 1);
function card(c, fresh) {
  const chg = c.c1 ?? c.c5;
  const pv = PREV.get(c.mint); const fl = pv && c.mcap && Math.abs(c.mcap - pv) / pv > .003 ? (c.mcap > pv ? 'fu' : 'fd') : '';
  const prog = c.prog != null ? Math.max(2, Math.min(100, c.prog * 100)) : Math.max(3, Math.min(100, (c.mcap || 0) / 70000 * 100));
  const W = WATCH.includes(c.mint);
  return `<a class="cc${fresh ? ' fresh' : ''}" href="#/coin/${c.mint}" data-m="${c.mint}">
    <span class="star${W ? ' on' : ''}" role="button" data-star="${c.mint}" title="Watch">${W ? '★' : '☆'}</span>
    <div class="im">${img(c)}</div><div style="min-width:0">
    <div class="nm"><b>${esc((c.name || '').slice(0, 26))}</b><span>$${esc((c.sym || '').slice(0, 12))}</span></div>
    <div class="sub">${ago(c.created)} ago ${qChip(c)}${isGrad(c) ? '<span class="gd">graduated</span>' : ''}</div>
    <div class="mc"><span>mcap <b class="${fl}">${usd(c.mcap)}</b></span><span class="${(chg || 0) < 0 ? 'dn' : 'up'} num">${chg != null ? pct(chg) : ''}</span></div>
    <div class="bar sfb" title="${c.prog != null ? 'curve ' + Math.round(prog) + '%' : 'market cap'}"><i style="width:${prog}%"></i></div>
    <div class="ft"><span style="display:flex;gap:6px;align-items:center">${c.quote ? `<span class="badge" title="What this coin trades against">pays in ${esc(c.quote)}</span>` : ''}${socials(c)}</span><span>${c.holders != null ? fmtN(c.holders) + ' holders · ' : ''}vol ${usd(c.v24)}</span></div></div></a>`;
}
function list(tab) {
  let L;
  if (Q) { const q = Q.toLowerCase(); const loc = [...ALL.values()].filter(c => c.pad === 'stonkfun' && ((c.sym || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q) || (c.quote || '').toLowerCase() === q || c.mint === Q)); const set = new Set(loc.map(c => c.mint)); L = [...loc, ...REMOTE.filter(m => !set.has(m)).map(m => ALL.get(m)).filter(Boolean)] }
  else if (tab === 'watch') L = WATCH.map(m => ALL.get(m) || { mint: m, sym: '…', name: 'Loading' });
  else if (tab === 'grad') L = [...ALL.values()].filter(c => c.pad === 'stonkfun' && isGrad(c)).sort((a, b) => (b.mcap || 0) - (a.mcap || 0)).slice(0, 72);
  else if (PAIR) L = [...ALL.values()].filter(c => c.quote === PAIR).sort(tab === 'new' ? byNew : (a, b) => (b[tab === 'vol' ? 'v24' : 'mcap'] || 0) - (a[tab === 'vol' ? 'v24' : 'mcap'] || 0));
  else L = (S[tab] || []).map(m => ALL.get(m)).filter(Boolean);
  if (PAIR) L = L.filter(c => c.quote === PAIR);
  if (SORT !== 'def') L = [...L].sort((a, b) => SORT === 'age' ? byNew(a, b) : SORT === 'paid' ? (paidDay(b) ?? -1) - (paidDay(a) ?? -1) : SORT === 'quote' ? String(a.quote || '').localeCompare(String(b.quote || '')) : SORT === 'coin' ? String(a.sym || '').localeCompare(String(b.sym || '')) : (b[SORT] ?? -1e18) - (a[SORT] ?? -1e18));
  return L;
}
const paidDay = c => c.tfee != null && (c.v24 ?? c.jv24) != null ? (c.v24 ?? c.jv24) * c.tfee / 10000 * HOOKS_CUT : null;
const EXCOL = [['', ''], ['coin', 'Coin'], ['quote', 'Pair'], ['mcap', 'Mcap', 1], ['v24', 'Vol 24h', 1], ['c1', '1h', 1, 'c5'], ['tfee', 'Fee', 1], ['paid', 'Paid / day on Paird', 1], ['age', 'Age', 1, 'c8']];
function row(c, fresh) {
  const W = WATCH.includes(c.mint), pd = paidDay(c), chg = c.c1;
  return `<a class="exr${fresh ? ' fresh' : ''}" href="#/coin/${c.mint}" data-m="${c.mint}"><span class="star${W ? ' on' : ''}" role="button" data-star="${c.mint}" title="Watch">${W ? '★' : '☆'}</span>
    <span class="co"><span class="pr2">${img(c, '', '', 's')}<i class="lk"></i>${c.qlogo ? `<img src="${esc(c.qlogo)}" alt="" onerror="this.style.visibility='hidden'">` : '<img alt="">'}</span><span style="min-width:0"><b>$${esc((c.sym || '').slice(0, 12))}</b><span class="nm2">${esc((c.name || '').slice(0, 28))}</span></span></span>
    <span class="pq2">${esc(c.quote || '—')}</span><span class="n">${usd(c.mcap)}</span><span class="n">${usd(c.v24 ?? c.jv24)}</span><span class="n c5 ${(chg || 0) < 0 ? 'dn' : 'up'}">${chg != null ? pct(chg) : '—'}</span><span class="n">${c.tfee != null ? c.tfee / 100 + '%' : '—'}</span><span class="pd">${pd != null ? usd2(pd) : '—'}</span><span class="ag">${ago(c.created)}</span></a>`;
}
function grid(fresh = []) {
  const L = list(TAB);
  const msg = PAIR && !Q ? 'No coins on the board are paired with ' + esc(PAIR) + ' right now.' : Q ? 'No coin matches that yet. Paste a full address to open any coin.' : TAB === 'watch' ? 'Nothing saved yet. Tap ☆ on any coin to watch it.' : TAB === 'grad' ? 'No graduated coins on the board yet.' : 'Reading StonkFun…';
  const hd = `<div class="exh">${EXCOL.map(([k, t, r, cl]) => `<span class="${r ? 'r ' : ''}${cl || ''}${k && SORT === (k === 'age' ? 'age' : k) ? ' on' : ''}" data-sortk="${k}">${t}</span>`).join('')}</div>`;
  $('#grid').innerHTML = L.length ? hd + L.map(c => row(c, fresh.includes(c.mint))).join('') : `<div class="empty">${msg}</div>`;
  $('#bCount').innerHTML = `${L.length} coins · StonkFun${PAIR ? ` · paired with <b style="color:var(--a2)">${esc(PAIR)}</b> <a href="#" data-clrpair="1" style="color:var(--a)">✕</a>` : ''}`;
  L.forEach(c => c.mcap && PREV.set(c.mint, c.mcap));
}
function wgrid() { const L = WATCH.map(m => ALL.get(m) || { mint: m, sym: '…', name: 'Loading' }); $('#wgrid').innerHTML = L.length ? L.map(c => card(c)).join('') : '<div class="empty">Nothing saved yet. Tap ☆ on any coin to watch it.</div>' }
function setTab(t) { TAB = t; $$('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === t)); grid() }
function setPair(q) { PAIR = q; MPKEY = ''; mostPaird(); grid() }
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.t) });
$('#sort').addEventListener('change', e => { SORT = e.target.value; grid() });
$('#grid').addEventListener('click', e => { const h = e.target.closest('[data-sortk]'); if (!h || !h.dataset.sortk) return; e.preventDefault(); SORT = SORT === h.dataset.sortk ? 'def' : h.dataset.sortk; const o = [...$('#sort').options].find(o => o.value === SORT); $('#sort').value = o ? SORT : 'def'; grid() });
let QT;
$('#q').addEventListener('input', e => {
  Q = e.target.value.trim(); REMOTE = [];
  if (VIEW !== 'home') location.hash = '#/board'; else grid();
  clearTimeout(QT); if (Q.length < 2) return;
  QT = setTimeout(async () => {
    const q = Q; try { const j = await get(`${SFAPI}?q=${encodeURIComponent(q)}&pageSize=30&page=1`); if (q !== Q) return; REMOTE = sfList(j).map(c => c.mint); grid() } catch (e) { }
  }, 400);
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(Q)) location.hash = '#/coin/' + Q });

/* =================== ⌘K palette =================== */
const ICO = { pair: '<circle cx="8.5" cy="12" r="5"/><circle cx="15.5" cy="12" r="5"/>', how: '<path d="M4 6h16M4 12h10M4 18h6"/>', home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>', ladder: '<path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10"/>', map: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h9M12 8h9"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', plus: '<path d="M12 5v14M5 12h14"/>', calc: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/>', q: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>', filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>', addr: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>' };
const ico = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICO[k] || ''}</svg>`;
const PAGES = [['Home', '#/', 'home'], ['The board', '#/board', 'grid'], ['Most paird pairs', '#/pairs', 'pair'], ['Stonk market map', '#/map', 'map'], ['How Paird pays', '#/how', 'how'], ['Watchlist', '#/watch', 'star'], ['Pair a coin', '#/launch', 'plus'], ['Payout check', '#/check', 'calc'], ['FAQ', '#/faq', 'q']];
const CK = { open: false, sel: 0, items: [], q: '', remote: [], busy: false, t: null };
function ckOpen(pref = '') { const m = $('#cmdk'); m.hidden = false; requestAnimationFrame(() => m.classList.add('on')); CK.open = true; CK.q = pref; CK.sel = 0; CK.remote = []; $('#ckq').value = pref; ckRender(); setTimeout(() => $('#ckq').focus(), 30) }
function ckClose() { const m = $('#cmdk'); m.classList.remove('on'); CK.open = false; setTimeout(() => { if (!CK.open) m.hidden = true }, 200) }
function ckItems() {
  const raw = CK.q.trim(), q = raw.toLowerCase(), out = [];
  if (!q) {
    const top = S.vol.map(m => ALL.get(m)).filter(Boolean).slice(0, 5);
    if (top.length) out.push({ g: 'Most traded right now' }, ...top.map(c => ({ c })));
    out.push({ g: 'Go to' }, ...PAGES.map(p => ({ p }))); return out;
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw)) out.push({ g: 'Address' }, { addr: raw });
  const rank = c => { const s = (c.sym || '').toLowerCase(); return s === q ? 0 : s.startsWith(q) ? 1 : s.includes(q) ? 2 : 3 };
  const loc = [...ALL.values()].filter(c => (c.quote || '').toLowerCase() === q || (c.sym || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q) || c.mint === raw).sort((a, b) => rank(a) - rank(b) || (b.mcap || 0) - (a.mcap || 0));
  const seen = new Set(loc.map(c => c.mint)), rem = CK.remote.map(m => ALL.get(m)).filter(c => c && !seen.has(c.mint));
  const coins = [...loc, ...rem].slice(0, 12);
  if (coins.length) out.push({ g: 'Coins' + (CK.busy ? ' · searching…' : '') }, ...coins.map(c => ({ c })));
  else out.push({ g: 'Coins' }, { msg: CK.busy ? 'Searching StonkFun and Jupiter…' : 'No coin matches yet. Paste a full address to open any coin.' });
  out.push({ g: 'Actions' }, { act: 'filter', label: `Filter the board for “${raw}”` });
  const pg = PAGES.filter(p => p[0].toLowerCase().includes(q)); if (pg.length) out.push({ g: 'Go to' }, ...pg.map(p => ({ p })));
  return out;
}
const ckSel = () => CK.items.filter(x => !x.g && !x.msg);
function ckRender() {
  CK.items = ckItems(); const n = ckSel().length; CK.sel = Math.max(0, Math.min(CK.sel, n - 1)); let k = -1;
  $('#ckl').innerHTML = CK.items.map(x => {
    if (x.g) return `<div class="ck-g">${esc(x.g)}</div>`; if (x.msg) return `<div class="ck-none">${esc(x.msg)}</div>`;
    k++; const on = k === CK.sel ? ' on' : '';
    if (x.c) { const c = x.c; return `<div class="ck-i${on}" data-k="${k}">${img(c, '', '', 's')}<div class="tx"><b>$${esc((c.sym || '').slice(0, 14))} <span style="color:var(--dim);font-weight:500">${esc((c.name || '').slice(0, 28))}</span></b><span>${padName(c.pad)}${c.quote ? ' · paired with ' + esc(c.quote) : ''} · ${short(c.mint)}</span></div><div class="rt"><b>${usd(c.mcap)}</b><span>${c.quote ? 'pays in ' + esc(c.quote) : ''}</span></div></div>` }
    if (x.addr) return `<div class="ck-i${on}" data-k="${k}"><span class="ic">${ico('addr')}</span><div class="tx"><b>Open coin ${esc(short(x.addr))}</b><span>Reads it live from StonkFun and Jupiter</span></div></div>`;
    if (x.act) return `<div class="ck-i${on}" data-k="${k}"><span class="ic">${ico('filter')}</span><div class="tx"><b>${esc(x.label)}</b><span>Shows every match on the board</span></div></div>`;
    return `<div class="ck-i${on}" data-k="${k}"><span class="ic">${ico(x.p[2])}</span><div class="tx"><b>${esc(x.p[0])}</b><span>${esc(x.p[1].replace('#', 'paird'))}</span></div></div>`;
  }).join('');
  $('#ckl .ck-i.on')?.scrollIntoView({ block: 'nearest' });
}
function ckGo(x) {
  if (!x) return; ckClose();
  if (x.c) location.hash = '#/coin/' + x.c.mint; else if (x.addr) location.hash = '#/coin/' + x.addr; else if (x.p) location.hash = x.p[1];
  else if (x.act === 'filter') { Q = CK.q.trim(); $('#q').value = Q; REMOTE = CK.remote.slice(); location.hash = '#/board'; grid(); goMarket() }
}
$('#ckq').addEventListener('input', e => {
  CK.q = e.target.value; CK.sel = 0; CK.remote = []; const q = CK.q.trim(); clearTimeout(CK.t);
  CK.busy = q.length >= 2; ckRender(); if (!CK.busy) return;
  CK.t = setTimeout(async () => {
    const [a, b] = await Promise.allSettled([jget('search?query=' + encodeURIComponent(q)), get(`${SFAPI}?q=${encodeURIComponent(q)}&pageSize=20&page=1`)]);
    if (q !== CK.q.trim()) return;
    const L = [...(a.status === 'fulfilled' ? keep(a.value.filter(t => PADS.has(t.launchpad)).map(fromJup)) : []), ...(b.status === 'fulfilled' ? keep((b.value.data?.tokens || []).map(fromSF)) : [])];
    CK.remote = [...new Set(L.map(c => c.mint))]; CK.busy = false; if (CK.open) ckRender();
  }, 300);
});
$('#ckq').addEventListener('keydown', e => {
  const n = ckSel().length;
  if (e.key === 'ArrowDown') { e.preventDefault(); CK.sel = (CK.sel + 1) % Math.max(1, n); ckRender() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); CK.sel = (CK.sel - 1 + n) % Math.max(1, n); ckRender() }
  else if (e.key === 'Enter') { e.preventDefault(); ckGo(ckSel()[CK.sel]) }
  else if (e.key === 'Escape') { e.preventDefault(); ckClose() }
});
$('#ckl').addEventListener('click', e => { const i = e.target.closest('.ck-i'); if (i) ckGo(ckSel()[+i.dataset.k]) });
$('#ckl').addEventListener('mousemove', e => { const i = e.target.closest('.ck-i'); if (i && +i.dataset.k !== CK.sel) { CK.sel = +i.dataset.k; $$('#ckl .ck-i').forEach(x => x.classList.toggle('on', x === i)) } });
$('#cmdk').addEventListener('click', e => { if (e.target.id === 'cmdk') ckClose() });
$('#qbtn').addEventListener('click', () => ckOpen()); $('#qbtn2').addEventListener('click', () => ckOpen());
$('#qk').textContent = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!INTRO.done) return; CK.open ? ckClose() : ckOpen(); return }
  if (e.key === '/' && !CK.open && INTRO.done && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { e.preventDefault(); ckOpen() }
});


/* watchlist + delegated clicks */
function toggleWatch(m) {
  const i = WATCH.indexOf(m); if (i >= 0) WATCH.splice(i, 1); else WATCH.unshift(m); store.set('paird.watch', WATCH);
  const on = WATCH.includes(m);
  $$(`[data-star="${m}"]`).forEach(s => { s.classList.toggle('on', on); s.textContent = on ? '★' : '☆' });
  if (CUR === m) $('#cStar').textContent = on ? '★ Watching' : '☆ Watch';
  $('#nWatch').textContent = WATCH.length; toast(on ? 'Added to your watchlist' : 'Removed from your watchlist');
  if (TAB === 'watch') grid(); if (VIEW === 'watch') wgrid(); if (on) enrich();
}
document.addEventListener('click', e => {
  const s = e.target.closest('[data-star]'); if (s) { e.preventDefault(); e.stopPropagation(); toggleWatch(s.dataset.star); return }
  const h = e.target.closest('[data-href]'); if (h) { e.preventDefault(); e.stopPropagation(); window.open(h.dataset.href, '_blank', 'noopener'); return }
  if (e.target.closest('[data-clrpair]')) { e.preventDefault(); setPair(''); return }
  const pc = e.target.closest('[data-pair]'); if (pc) { location.hash = '#/pair/' + encodeURIComponent(pc.dataset.pair); return }
  if (e.target.closest('[data-paird]')) { e.preventDefault(); location.hash = '#/launch'; toast('No Paird coins yet. Pairing opens with $PAIRD.'); return }
  if (e.target.closest('[data-connect]')) connect();
}, true);
if (matchMedia('(pointer:fine)').matches) {
  document.addEventListener('pointermove', e => { const c = e.target.closest?.('.cc'); if (!c) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; c.style.setProperty('--ry', ((x - .5) * 6).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg'); c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%') });
  document.addEventListener('pointerout', e => { const c = e.target.closest?.('.cc'); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg') } });
}

/* =================== coin page =================== */
let JUP_READY = null, CUR = null;
function loadJupPlugin() {
  if (JUP_READY) return JUP_READY;
  JUP_READY = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://plugin.jup.ag/plugin-v1.js'; s.async = true; s.onload = () => res(); s.onerror = () => { JUP_READY = null; rej(new Error('load')) }; document.head.appendChild(s); setTimeout(() => rej(new Error('timeout')), 12000) });
  return JUP_READY;
}
const st = (k, v, cls = '') => `<div class="st"><span>${k}</span><b class="${cls}">${esc(v)}</b></div>`;
const kv = (k, v, cls = '') => v == null || v === '' ? '' : `<div class="kv"><span>${k}</span><b class="${cls}">${v}</b></div>`;
function renderCoin(c) {
  const mint = c.mint;
  $('#cImg').outerHTML = img(c, '', 'cImg', 'l');
  $('#cName').textContent = '$' + (c.sym || '?'); $('#cPad').innerHTML = c.pad === 'stonkfun' ? '<span class="pp sf"><i></i>StonkFun</span>' : ''; $('#cQuote').innerHTML = qChip(c);
  $('#cSub').textContent = c.name || '';
  $('#cMint').innerHTML = `${short(mint)} <span style="color:var(--a)">copy address</span>`; $('#cMint').onclick = () => { navigator.clipboard?.writeText(mint).then(() => toast('Address copied'), () => toast('Copy failed')) };
  $('#cStar').textContent = WATCH.includes(mint) ? '★ Watching' : '☆ Watch'; $('#cStar').onclick = () => toggleWatch(mint);
  $('#cShare').onclick = () => window.open('https://x.com/intent/post?text=' + encodeURIComponent(`$${c.sym}${c.quote ? ' · paired with ' + c.quote : ''} · ${usd(c.mcap)} mcap\n\nfound on paird. pair it, get paid in it.\n${location.origin}/#/coin/${mint}`), '_blank', 'noopener');
  const L = [['StonkFun', `${SF}/token/${mint}`], ['DEX Screener', `https://dexscreener.com/solana/${mint}`], ['Solscan', `https://solscan.io/token/${mint}`], ['Jupiter', `https://jup.ag/swap/SOL-${mint}`]];
  if (xUrl(c)) L.push(['𝕏', xUrl(c)]); if (webUrl(c)) L.push(['Website', webUrl(c)]); if (tgUrl(c)) L.push(['Telegram', tgUrl(c)]);
  $('#cLinks').innerHTML = L.map(([k, u]) => `<a class="btn gh xs" href="${esc(u)}" target="_blank" rel="noopener">${esc(k)} ↗</a>`).join('');
  $('#cStats').innerHTML = [st('Price', price(c.price)), st('Market cap', usd(c.mcap)), st('Liquidity', usd(c.liq)), st('Holders', fmtN(c.holders) + (c.hch != null ? ' ' + pct(c.hch) : '')),
    st('5m change', pct(c.c5), (c.c5 || 0) < 0 ? 'dn' : 'up'), st('1h change', pct(c.c1), (c.c1 || 0) < 0 ? 'dn' : 'up'), st('24h change', pct(c.c24), (c.c24 || 0) < 0 ? 'dn' : 'up'), st('Age', ago(c.created)),
    st('Volume 24h', usd(c.v24 ?? c.jv24)), st('Volume 1h', usd(c.v1)), st('Trades 1h', c.b1 != null ? fmtN((c.b1 || 0) + (c.s1 || 0)) : '—'), st('Peak mcap', usd(c.peak))].join('');
  if (c.b1 != null || c.s1 != null) { const b = c.bv1 || 0, s = c.sv1 || 0, t = b + s || 1; $('#cPress').innerHTML = `<div class="hd"><span class="up">Buys ${fmtN(c.b1)} · ${usd(b)}</span><span>Last hour</span><span class="dn">${usd(s)} · ${fmtN(c.s1)} Sells</span></div><div class="tr"><i style="width:${b / t * 100}%;background:var(--up)"></i><i style="width:${s / t * 100}%;background:var(--dn)"></i></div>` } else $('#cPress').innerHTML = '';
  // the pair
  const same = c.quote ? [...ALL.values()].filter(x => x.quote === c.quote).length : 0;
  $('#cPair').innerHTML = c.quote ? `<h4>Paired with</h4><div class="pq">${c.qlogo ? `<img src="${esc(c.qlogo)}" alt="" onerror="this.style.visibility='hidden'">` : ''}<div><b>${esc(c.quote)}</b><span class="note">${esc(c.qcat || 'quote asset')} · ${same} coin${same === 1 ? '' : 's'} on the board pair with it</span></div></div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn gh xs" data-pair="${esc(c.quote)}">See its coins</button><a class="btn pri xs" href="#/launch/${encodeURIComponent(c.quote)}">Pair a coin with ${esc(c.quote)}</a><a class="btn gh xs" href="#/launch/${encodeURIComponent(c.sym || '')}" data-pairsym="${esc(mint)}">Pair with $${esc((c.sym || '').slice(0, 10))}</a></div>`
    : `<h4>Paired with</h4><div class="note">StonkFun hasn't reported this coin's pair yet.</div>`;
  // what its fees would pay, on Paird
  const v = c.v24 ?? c.jv24, fee = c.tfee != null ? c.tfee / 10000 : null;
  $('#cPaid').innerHTML = fee != null && v != null ? `<h4>If it ran on Paird</h4><div class="big num" id="cPaidV">${usd2(v * fee * HOOKS_CUT)}</div><div class="note">a day to its payouts, paid in ${esc(c.quote || 'its pair')}: ${usd(v)} of 24h volume × its ${c.tfee / 100}% fee × 90%.</div>
    <div style="margin-top:10px">${kv('Fees, 24h', usd2(v * fee))}${kv('To payouts (90%)', usd2(v * fee * HOOKS_CUT), '')}${kv('To Paird (10%)', usd2(v * fee * PAIRD_CUT))}</div>`
    : `<h4>If it ran on Paird</h4><div class="note">Needs this coin's fee and 24h volume from StonkFun. ${fee == null ? 'Its fee isn\'t reported yet.' : 'Volume isn\'t reported yet.'}</div>`;
  $('#cMore').innerHTML = `<h4>Details</h4>` + [kv('Launchpad', padName(c.pad)), kv('Pair', c.quote ? esc(c.quote) : null), c.prog != null ? kv('Curve', (c.prog * 100).toFixed(1) + '%') : '', c.tfee != null ? kv('Fee', c.tfee / 100 + '%') : '',
    kv('Status', isGrad(c) ? '<span class="up">graduated</span>' : 'on the curve'), c.top10 != null ? kv('Top 10 holders', (+c.top10).toFixed(1) + '%') : '', c.mintOff != null ? kv('Mint authority', c.mintOff ? '<span class="up">off</span>' : '<span class="dn">on</span>') : '', c.freezeOff != null ? kv('Freeze authority', c.freezeOff ? '<span class="up">off</span>' : '<span class="dn">on</span>') : '',
    kv('Address', `<a href="https://solscan.io/token/${esc(mint)}" target="_blank" rel="noopener" style="color:var(--a)">${esc(short(mint))} ↗</a>`)].join('');
}
async function coin(mint) {
  CUR = mint;
  let c = ALL.get(mint);
  if (c) renderCoin(c); else { $('#cName').textContent = 'Loading…'; ['#cSub', '#cStats', '#cMore', '#cPress', '#cLinks', '#cPad', '#cQuote', '#cPair', '#cPaid'].forEach(s => $(s).innerHTML = '') }
  $('#chart').innerHTML = `<iframe src="https://dexscreener.com/solana/${encodeURIComponent(mint)}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=5" title="chart" loading="lazy"></iframe>`;
  const jt = $('#jup'); jt.style.minHeight = ''; jt.innerHTML = '<div class="skel" style="height:420px"></div>'; $('#jupNote').textContent = 'Swaps run through Jupiter. You sign in your own wallet.';
  loadJupPlugin().then(() => { if (CUR !== mint) return; jt.innerHTML = ''; window.Jupiter.init({ displayMode: 'integrated', integratedTargetId: 'jup', formProps: { initialInputMint: SOLM, initialOutputMint: mint } }) })
    .catch(() => { if (CUR !== mint) return; jt.style.minHeight = '0'; jt.innerHTML = `<a class="btn pri" style="width:100%;height:48px" href="https://jup.ag/swap/SOL-${encodeURIComponent(mint)}" target="_blank" rel="noopener">Trade on Jupiter ↗</a>`; $('#jupNote').textContent = 'Opens Jupiter in a new tab. You sign in your own wallet.' });
  if (!c || c.quote == null) { try { const j = await get(`${SFAPI}?q=${mint}&pageSize=5&page=1`); const t = (j.data?.tokens || []).find(x => x.mint === mint); if (t) c = keep([fromSF(t)])[0] } catch (e) { } }
  try { const r = await jget('search?query=' + mint); const t = r.find(x => x.id === mint); if (t) { const j = fromJup(t); if (c && c.pad === 'stonkfun') delete j.pad; c = keep([j])[0] } } catch (e) { }
  if (CUR !== mint) return;
  renderCoin(c || { mint, sym: '?', name: 'Coin not found yet' });
}

/* =================== pair a coin =================== */
let LIMG = '', LPAIR = null, SPL = { holders: 60, drop: 30, burn: 0, you: 0, team: 0 };
function pairList() {
  const q = ($('#lPairQ').value || '').trim().toLowerCase();
  const base = [{ q: 'SOL', logo: '', cat: 'Solana', n: 0 }, ...PLIST];
  const L = base.filter(x => !q || x.q.toLowerCase().includes(q) || (x.cat || '').toLowerCase().includes(q)).slice(0, 40);
  $('#lPairL').innerHTML = L.map(x => `<div data-pq="${esc(x.q)}">${x.logo ? `<img src="${esc(x.logo)}" alt="" onerror="this.style.visibility='hidden'">` : '<img alt="">'}<b>${esc(x.q)}</b><span>${esc(x.cat || '')}${x.n ? ' · ' + x.n + ' coins' : ''}</span></div>`).join('') || '<div>No pair matches. Paste a coin address on the board to find it.</div>';
}
function setLPair(q) {
  LPAIR = PLIST.find(x => x.q === q) || (q === 'SOL' ? { q: 'SOL', logo: '', cat: 'Solana', n: 0 } : { q, logo: '', cat: '', n: 0 });
  $('#lPairQ').value = LPAIR.q; $('#lPairL').classList.remove('on');
  $('#lPairN').innerHTML = `Your coin trades against <b style="color:var(--a2)">${esc(LPAIR.q)}</b> and pays in it.${LPAIR.n ? ` ${LPAIR.n} coins on the board pair with it today.` : ''}`; lprev();
}
$('#lPairQ').addEventListener('focus', () => { pairList(); $('#lPairL').classList.add('on') });
$('#lPairQ').addEventListener('input', () => { pairList(); $('#lPairL').classList.add('on') });
$('#lPairQ').addEventListener('blur', () => setTimeout(() => $('#lPairL').classList.remove('on'), 180));
$('#lPairL').addEventListener('mousedown', e => { const d = e.target.closest('[data-pq]'); if (d) setLPair(d.dataset.pq) });
function sliders() {
  $('#lHooks').innerHTML = HK.map(h => `<div class="sl" style="--c:${h[2]}"><span>${h[1]}</span><input class="range" type="range" min="0" max="90" step="5" value="${SPL[h[0]]}" data-hk="${h[0]}"><b>${SPL[h[0]]}%</b></div>`).join('');
}
$('#lHooks').addEventListener('input', e => {
  const r = e.target.closest('[data-hk]'); if (!r) return; const k = r.dataset.hk; let v = +r.value;
  const others = HK.reduce((a, h) => a + (h[0] === k ? 0 : SPL[h[0]]), 0); if (v + others > 90) v = 90 - others; SPL[k] = v; r.value = v;
  r.parentElement.querySelector('b').textContent = v + '%'; lprev();
});
function lprev() {
  const tot = HK.reduce((a, h) => a + SPL[h[0]], 0);
  $('#lLeft').textContent = tot < 90 ? `· ${90 - tot}% unassigned` : '· 90% assigned';
  sbar($('#lBar'), SPL, false); $('#lTeamF').style.display = SPL.team > 0 ? '' : 'none';
  const q = LPAIR ? LPAIR.q : 'SOL';
  const c = { mint: '', sym: ($('#lTk').value || 'TICKER').toUpperCase().replace(/^\$/, ''), name: $('#lName').value || 'Your coin', mcap: 4200, c1: 0, pad: 'paird', quote: q, qlogo: LPAIR?.logo, holders: 1, v24: 0, created: new Date().toISOString() };
  $('#lPrev').innerHTML = card(c).replace(/<span class="star[^>]*>.*?<\/span>/, '').replace(/<div class="im">.*?<\/div>/, `<div class="im"><img src="${LIMG || tile(c.sym)}" alt=""><span class="pp" style="color:var(--mx)"><i style="background:var(--a)"></i>paird</span></div>`).replace(/href="[^"]*"/, '');
  $('#lSum').innerHTML = HK.filter(h => SPL[h[0]]).map(h => kv(`<span style="display:inline-flex;align-items:center;gap:7px"><i style="width:10px;height:10px;border-radius:3px;background:${h[2]};display:inline-block"></i>${h[1]}</span>`, SPL[h[0]] + '% · in ' + esc(q))).join('') + kv('Paird', '10%') + (tot < 90 ? kv('Unassigned', (90 - tot) + '% · goes to Holders', 'dn') : '');
}
let TK;
function tkCheck() {
  const tk = $('#lTk').value.trim().toUpperCase().replace(/^\$/, ''); const out = $('#tkCheck'); clearTimeout(TK);
  if (tk.length < 2) { out.innerHTML = ''; return }
  out.innerHTML = `Checking <b>$${esc(tk)}</b> on StonkFun and Jupiter…`;
  TK = setTimeout(async () => {
    const [a, b] = await Promise.allSettled([get(`${SFAPI}?q=${encodeURIComponent(tk)}&pageSize=100&page=1`), jget('search?query=' + encodeURIComponent(tk))]);
    if ($('#lTk').value.trim().toUpperCase().replace(/^\$/, '') !== tk) return;
    const sf = a.status === 'fulfilled' ? (a.value.data?.tokens || []).filter(t => String(t.symbol).toUpperCase() === tk).length : null;
    const jp = b.status === 'fulfilled' ? b.value.filter(t => String(t.symbol).toUpperCase() === tk).length : null;
    const part = (n, w) => n == null ? `${w} didn't answer` : n ? `<b>${n}</b> on ${w}` : `none on ${w}`;
    out.innerHTML = (sf || jp) ? `<b>$${esc(tk)}</b> is taken: ${part(sf, 'StonkFun')}, ${part(jp, 'Solana (Jupiter)')}. Or pair with it instead.` : `<b style="color:var(--up)">$${esc(tk)} looks clean.</b> ${part(sf, 'StonkFun')} and ${part(jp, 'Solana (Jupiter)')} with this exact ticker.`;
  }, 500);
}
['lName', 'lTk', 'lDesc'].forEach(id => $('#' + id).addEventListener('input', lprev));
$('#lTk').addEventListener('input', tkCheck);
$('#lImg').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; LIMG = URL.createObjectURL(f); $('#lDrop').innerHTML = `<img src="${LIMG}" alt="">`; lprev() });
$('#lDrop').addEventListener('dragover', e => { e.preventDefault(); $('#lDrop').style.borderColor = 'var(--a)' });
$('#lDrop').addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) { LIMG = URL.createObjectURL(f); $('#lDrop').innerHTML = `<img src="${LIMG}" alt="">`; lprev() } });
sliders();

/* =================== payout check =================== */
function checkCoins() {
  const L = S.vol.map(m => ALL.get(m)).filter(c => c && c.tfee != null && c.v24 > 0).slice(0, 40); if (!L.length) return;
  const sel = $('#kCoin'); sel.dataset.filled = 1;
  sel.innerHTML = '<option value="">Set it yourself</option>' + L.map(c => `<option value="${c.mint}">$${esc((c.sym || '').slice(0, 12))} · ${esc(c.quote || 'SOL')} · ${usd(c.v24)} / 24h · ${c.tfee / 100}% fee</option>`).join('');
  if (!sel.value && L[0]) { sel.value = L[0].mint; pickCoin() }
}
let KQ = 'the pair';
function pickCoin() {
  const c = ALL.get($('#kCoin').value); if (!c) { KQ = 'the pair'; check(); return }
  KQ = c.quote || 'SOL';
  $('#kVol').max = Math.max(2000000, Math.ceil(c.v24 * 1.5)); $('#kVol').value = Math.round(c.v24); $('#kFee').value = Math.min(3, Math.max(.1, c.tfee / 100)); check();
}
$('#kCoin').addEventListener('change', pickCoin);
function check() {
  const v = +$('#kVol').value, f = +$('#kFee').value / 100, bag = +$('#kBag').value / 100;
  $('#kVolV').textContent = usd(v); $('#kFeeV').textContent = (f * 100).toFixed(2) + '%'; $('#kBagV').textContent = (bag * 100).toFixed(2) + '%'; $('#kPair').textContent = KQ;
  const all = v * f * HOOKS_CUT, me = all * bag;
  countTo($('#kOut'), me, usd2, 500); countTo($('#kAll'), all, usd2, 500);
  $('#kOdds').textContent = (bag * 100).toFixed(2) + '%';
  $('#kOutN').textContent = `${usd(v)} of daily volume × ${(f * 100).toFixed(2)}% fee × 90% to payouts × your ${(bag * 100).toFixed(2)}% of supply, if the whole 90% goes to Holders. ${(me * 365) >= 1 ? 'About ' + usd(me * 365) + ' a year.' : ''}`;
  $('#kShare').onclick = () => window.open('https://x.com/intent/post?text=' + encodeURIComponent(`holding ${(bag * 100).toFixed(2)}% of a coin doing ${usd(v)} a day would pay me ${usd2(me)} a day in ${KQ} on paird.\n\npair it. get paid in it.\n${location.origin}`), '_blank', 'noopener');
}
['kVol', 'kFee', 'kBag'].forEach(id => $('#' + id).addEventListener('input', check));

/* =================== wallet =================== */
async function connect() {
  const p = window.phantom?.solana || window.solflare || window.backpack || window.solana;
  if (!p) { window.open('https://phantom.com/download', '_blank', 'noopener'); return }
  try { const r = await p.connect(); const k = (r?.publicKey || p.publicKey)?.toString(); if (k) { window.__wallet = k; $$('[data-connect]').forEach(b => b.textContent = short(k)); toast('Wallet connected') } } catch (e) { toast('Connection cancelled') }
}

/* =================== router =================== */
let VIEW = 'home', CURP = '';
function goMarket() { requestAnimationFrame(() => $('#market').scrollIntoView({ behavior: 'smooth', block: 'start' })) }
const ANCH = { pairs: '#pairsSec', map: '#mapSec', how: '#howSec' };
function route() {
  const h = location.hash.replace(/^#/, '') || '/'; const [, r, arg] = h.split('/');
  const view = r === 'coin' ? 'coin' : ['launch', 'check', 'faq', 'watch', 'pair'].includes(r) ? r : 'home';
  const prevView = VIEW; VIEW = view;
  $$('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + view));
  const nav = r === 'board' || ANCH[r] ? r : view === 'pair' ? 'pairs' : view;
  $$('#nav a,#mob a').forEach(a => a.classList.toggle('on', a.dataset.r === nav));
  if (view !== 'coin') CUR = null;
  if (view === 'coin' && arg) coin(arg);
  if (view === 'launch') { pairList(); if (arg) setLPair(decodeURIComponent(arg)); else lprev() }
  if (view === 'check') { checkCoins(); check() }
  if (view === 'watch') { wgrid(); enrich() }
  if (view === 'pair') { CURP = decodeURIComponent(arg || ''); pairView(CURP) } else CURP = '';
  if (ANCH[r]) requestAnimationFrame(() => $(ANCH[r]).scrollIntoView({ behavior: 'smooth', block: 'start' }));
  else if (r === 'board') { grid(); if (prevView !== 'home') scrollTo(0, 0); goMarket() }
  else scrollTo({ top: 0, behavior: 'auto' });
  if (view === 'home') { revealAll(); requestAnimationFrame(mmap) }
}
addEventListener('hashchange', route);
let IO = null;
function revealAll() { if (!('IntersectionObserver' in window)) { $$('.rv').forEach(e => e.classList.add('rv-in')); return } if (!IO) IO = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('rv-in'); IO.unobserve(x.target) } }), { rootMargin: '0px 0px -40px 0px' }); $$('.rv:not(.rv-in)').forEach(e => IO.observe(e)) }

/* hero pixel field */
(function field() {
  const cv = $('#hf'), hero = $('.hero'); if (!cv || !hero) return;
  const ctx = cv.getContext('2d'); let W = 0, H = 0, D = 1, vis = true, mx = -1e3, my = -1e3;
  const P = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: 2 + Math.random() * 3.5, v: .02 + Math.random() * .06, ph: Math.random() * 6.28, dx: 0, dy: 0 }));
  const size = () => { D = Math.min(2, devicePixelRatio || 1); W = hero.clientWidth; H = hero.clientHeight; cv.width = W * D; cv.height = H * D; ctx.setTransform(D, 0, 0, D, 0, 0) };
  size(); addEventListener('resize', size);
  if ('IntersectionObserver' in window) new IntersectionObserver(e => vis = e[0].isIntersecting).observe(hero);
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; const x = mx / r.width - .5, y = my / r.height - .5; hero.querySelectorAll('.vx').forEach((v, i) => v.style.translate = `${x * (12 + i * 6)}px ${y * (10 + i * 5)}px`) });
  hero.addEventListener('pointerleave', () => { mx = my = -1e3 });
  let last = performance.now();
  function f(n) {
    const dt = Math.min(50, n - last) / 16; last = n;
    if (vis && !document.hidden && VIEW === 'home' && W) {
      if (hero.clientWidth !== W || hero.clientHeight !== H) size();
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.v * dt / 100 * 1.4; if (p.y < -.05) { p.y = 1.05; p.x = Math.random() }
        let x = p.x * W + p.dx, y = p.y * H + p.dy; const ddx = x - mx, ddy = y - my, d2 = ddx * ddx + ddy * ddy;
        if (d2 < 9000) { const k = (1 - d2 / 9000) * 2.2; p.dx += ddx / Math.sqrt(d2 + 1) * k; p.dy += ddy / Math.sqrt(d2 + 1) * k }
        p.dx *= .94; p.dy *= .94;
        const a = .15 + .35 * (.5 + .5 * Math.sin(n / 600 + p.ph));
        ctx.fillStyle = `rgba(57,214,163,${a})`; ctx.fillRect(Math.round(x), Math.round(y), p.s, p.s);
      }
    }
    requestAnimationFrame(f);
  }
  requestAnimationFrame(f);
})();

/* =================== faq =================== */
(function faq() {
  const list = $('#faqList'); if (!list) return;
  const D = $$('#faqList details'); D.forEach(d => { d._q = d.querySelector('summary').innerHTML; d._t = d.textContent.toLowerCase() });
  let cat = 'all', q = '';
  const rx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function apply() {
    let shown = 0;
    $$('#faqList .fqg').forEach(g => {
      const okC = cat === 'all' || g.dataset.c === cat; let n = 0;
      g.querySelectorAll('details').forEach(d => {
        const m = okC && (!q || d._t.includes(q)); d.style.display = m ? '' : 'none'; if (m) n++;
        d.querySelector('summary').innerHTML = q ? d._q.replace(new RegExp('(' + rx(q) + ')', 'gi'), '<mark>$1</mark>') : d._q;
        if (q && m) d.open = true;
      });
      g.style.display = n ? '' : 'none'; shown += n;
    });
    $('#fqNone').style.display = shown ? 'none' : ''; syncAll();
  }
  function syncAll() { const vis = D.filter(d => d.style.display !== 'none'); $('#fqAll').textContent = vis.length && vis.every(d => d.open) ? 'Collapse all' : 'Expand all' }
  $('#fqCats').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; $$('#fqCats button').forEach(x => x.classList.toggle('on', x === b)); apply() });
  $('#fq').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); apply() });
  $('#fqAll').addEventListener('click', () => { const vis = D.filter(d => d.style.display !== 'none'); const open = !vis.every(d => d.open); vis.forEach(d => d.open = open); syncAll() });
  D.forEach(d => d.addEventListener('toggle', syncAll));
})();


/* =================== boot =================== */
$('#nWatch').textContent = WATCH.length;
$$('aside .nav a, aside .slab, aside .sbtn').forEach((e, i) => e.style.setProperty('--d', i));
route(); revealAll();
loadSFNew(); setTimeout(loadSFVol, 200); setTimeout(loadSFTop, 400); setTimeout(loadSFMore, 2500);
setTimeout(enrich, 2500);
const every = (fn, ms) => setInterval(() => { if (!document.hidden) fn() }, ms);
every(loadSFNew, 10000); every(loadSFVol, 45000); every(loadSFTop, 60000); every(enrich, 40000); every(stats, 15000);
})();
