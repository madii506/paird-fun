// paird 3D: the pairing intro (two rings roll in and snap together on a real pair), then the live rings in the hero
// and the live hero bull that reacts to real launches and level-ups.
import * as THREE from './three.module.min.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { RoomEnvironment } from './RoomEnvironment.js';

const $ = s => document.querySelector(s);
const MX = window.__mx || {};
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FIX = new URLSearchParams(location.search).get('mxt'); // test hook: freeze the intro at a time
const TAN = Math.tan(THREE.MathUtils.degToRad(13)); // half of the 26° field of view
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease3 = k => 1 - Math.pow(1 - k, 3), ease4 = k => 1 - Math.pow(1 - k, 4);
const easeIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const backOut = k => { const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2) };

/* ---------------- the pair: two linked voxel rings (the PFP symbol) ---------------- */
function bullVoxels() {
  const ro = 9.6, ri = 6.1, off = 7.2, V = [], COL = [];
  for (let x = -20; x <= 20; x++) for (let y = -13; y <= 13; y++) {
    const da = Math.hypot(x + off, y), db = Math.hypot(x - off, y), ina = da <= ro && da >= ri, inb = db <= ro && db >= ri;
    if (!ina && !inb) continue;
    const a = ina && inb ? y >= 0 : ina; // over at the top, under at the bottom
    for (let z = -1; z <= 1; z++) { V.push([x, y, z]); COL.push(a ? 0 : 1) }
  }
  const mn = [0, 1, 2].map(k => Math.min(...V.map(v => v[k]))), mx = [0, 1, 2].map(k => Math.max(...V.map(v => v[k])));
  const c = mn.map((m, k) => (m + mx[k]) / 2), cen = v => [v[0] - c[0], v[1] - c[1], v[2] - c[2]];
  return { V: V.map(cen), COL, G: [[0, 0, -3000]], minY: mn[1] - c[1] - .5, maxY: mx[1] - c[1] + .5, h: mx[1] - mn[1] + 1, w: mx[0] - mn[0] + 1 };
}
const BULL = bullVoxels();
const N = BULL.V.length;
const GEO = new RoundedBoxGeometry(1, 1, 1, 2, .14);
const STEEL = new THREE.Color(0xe8f2f5), MINT = new THREE.Color(0x39d6a3), CORAL = new THREE.Color(0xfb7185), PALE = new THREE.Color(0x9ff3d6);
const REST = BULL.COL.map(k => k === 0 ? new THREE.Color(0x39d6a3) : new THREE.Color(0xeef6f3));

/* one steel material with two extras: a per-voxel glow (for the neon chart) and a level-up wave that runs up the bull */
function steel() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .42, metalness: .12 });
  const u = { uWaveY: { value: -99 }, uWaveA: { value: 0 }, uWaveC: { value: MINT.clone() } }; m.userData.u = u;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'attribute float aGlow;\nvarying float vGlow;\nvarying float vIY;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;\n#ifdef USE_INSTANCING\nvIY = instanceMatrix[3].y;\n#else\nvIY = 0.0;\n#endif');
    sh.fragmentShader = 'uniform float uWaveY;\nuniform float uWaveA;\nuniform vec3 uWaveC;\nvarying float vGlow;\nvarying float vIY;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow + uWaveC * uWaveA * (1.0 - smoothstep(0.0, 2.4, abs(vIY - uWaveY)));');
  };
  return m;
}
function makeBull() {
  const mat = steel(), M = new THREE.InstancedMesh(GEO, mat, N);
  // each InstancedMesh gets its own geometry so it can carry its own per-voxel glow
  const glow = new THREE.InstancedBufferAttribute(new Float32Array(N), 1); glow.setUsage(THREE.DynamicDrawUsage);
  const geo = GEO.clone(); geo.setAttribute('aGlow', glow); M.geometry = geo;
  const m4 = new THREE.Matrix4();
  BULL.V.forEach((v, i) => { m4.makeTranslation(v[0], v[1], v[2]); M.setMatrixAt(i, m4); M.setColorAt(i, REST[i]) });
  M.instanceMatrix.setUsage(THREE.DynamicDrawUsage); M.instanceColor.setUsage(THREE.DynamicDrawUsage);
  const gm = new THREE.MeshStandardMaterial({ color: 0x0b2a22, emissive: 0x39d6a3, emissiveIntensity: 2.2, roughness: .4 });
  const ggeo = GEO.clone(); ggeo.setAttribute('aGlow', new THREE.InstancedBufferAttribute(new Float32Array(BULL.G.length), 1));
  const GM = new THREE.InstancedMesh(ggeo, gm, BULL.G.length);
  BULL.G.forEach((v, i) => { m4.makeTranslation(v[0], v[1], v[2]); GM.setMatrixAt(i, m4) });
  const grp = new THREE.Group(); grp.add(M, GM);
  return { grp, M, GM, mat, gm, glow };
}
function stage(canvas, dprMax) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, dprMax)); R.setClearColor(0, 0);
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1; R.outputColorSpace = THREE.SRGBColorSpace;
  const S = new THREE.Scene(); const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(new RoomEnvironment(), .02).texture; S.environmentIntensity = 1.6; pm.dispose();
  S.add(new THREE.HemisphereLight(0xffffff, 0x0b2026, .35));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-6, 10, 16); S.add(key);
  const rim = new THREE.DirectionalLight(0x39d6a3, 1.4); rim.position.set(10, -3, -6); S.add(rim);
  const rim2 = new THREE.DirectionalLight(0x69aac1, 1.2); rim2.position.set(-10, -6, -4); S.add(rim2);
  const low = new THREE.PointLight(0x39d6a3, 240, 90, 2); low.position.set(4, -14, 12); S.add(low);
  const cam = new THREE.PerspectiveCamera(26, 1, .1, 800);
  return { R, S, cam, key };
}
// the pose both scenes share, so the intro bull lands exactly where the hero bull lives
const POSE = { ry: .22, rx: .08 };
const heroFill = () => innerWidth < 820 ? .5 : .46; // shape height as a share of the stage height
let HERO = null;


/* ---------------- real StonkFun pairs inside the two ring holes ---------------- */
const OFF = 7.2, HOLE = 5.5;
function holes(parent, cls) {
  const box = document.createElement('div'); box.className = cls; box.innerHTML = '<i><img alt=""></i><i><img alt=""></i>'; parent.appendChild(box);
  const [a, b] = box.querySelectorAll('i'), ia = a.firstChild, ib = b.firstChild;
  const seen = new Set(), ready = []; let idx = -1, nextAt = 0, lastFeed = -1e9, shownAt = -1e9;
  const v = new THREE.Vector3(), w = new THREE.Vector3();
  function feed(now) {
    if (now - lastFeed < 600) return; lastFeed = now;
    const L = (window.__mxPairs && window.__mxPairs()) || [];
    for (const p of L) {
      if (seen.has(p.k)) continue; seen.add(p.k);
      const i1 = new Image(), i2 = new Image(); let n = 0; i1.referrerPolicy = i2.referrerPolicy = 'no-referrer';
      const done = () => { if (++n === 2) { ready.push(p); ready.sort((x, y) => x.r - y.r) } }; i1.onload = i2.onload = done; i1.src = p.img; i2.src = p.q;
    }
  }
  function show(p) { ia.src = p.img; ib.src = p.q; shownAt = performance.now(); window.__mxPairNow = p; dispatchEvent(new CustomEvent('mx:pair', { detail: p })) }
  return {
    has: () => ready.length > 0,
    feed,
    cycle(now, every, hold) {
      feed(now); if (!ready.length) return; nextAt = Math.min(nextAt, now + every);
      if (hold) { if (idx !== 0) { idx = 0; show(ready[0]) } return }
      if (now >= nextAt) { idx = (idx + 1) % ready.length; show(ready[idx]); nextAt = now + every }
    },
    place(grp, cam, W, H, alpha) {
      grp.updateMatrixWorld();
      for (const [el, x] of [[a, -OFF], [b, OFF]]) {
        v.set(x, 0, 1.6).applyMatrix4(grp.matrixWorld); const d = cam.position.distanceTo(v); w.copy(v).project(cam);
        const px = (w.x * .5 + .5) * W, py = (-w.y * .5 + .5) * H, dia = 2 * HOLE * grp.scale.x / (2 * d * TAN) * H;
        el.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) translate(-50%,-50%)`; el.style.width = el.style.height = Math.max(0, dia).toFixed(1) + 'px';
      }
      box.style.opacity = alpha;
      const k = clamp((performance.now() - shownAt) / 420), e = backOut(k);
      ia.style.opacity = ib.style.opacity = Math.min(1, k * 2.2); ia.style.transform = ib.style.transform = `scale(${(.6 + .4 * e).toFixed(3)})`;
    },
    next() { nextAt = 0 },
    prev() { if (ready.length) { idx = (idx - 2 + ready.length * 2) % ready.length; nextAt = 0 } },
    list: () => ready
  };
}

/* ======================================================================
   INTRO: the pairing. Two rings roll in from opposite sides like coins,
   real StonkFun coins spin in one, real pair assets in the other, the
   rings snap together, and the slots land on a real live pair.
   ====================================================================== */
function intro() {
  const el = $('#intro'), cv = $('#ic3'); if (!el || !cv || REDUCE) return false;
  let st; try { st = stage(cv, 1.5) } catch (e) { return false }
  const { R, S, cam } = st;
  const FLOOR = BULL.minY - 1.0;
  // two separate rings, so each can roll in on its own; the notches where they cross are hidden at the snap
  const ro = 9.6, ri = 6.1, off = 7.2, RA = [], RB = [];
  for (let x = -20; x <= 20; x++) for (let y = -13; y <= 13; y++) {
    const da = Math.hypot(x + off, y), db = Math.hypot(x - off, y), ina = da <= ro && da >= ri, inb = db <= ro && db >= ri;
    for (let z = -1; z <= 1; z++) { if (ina) RA.push([x, y, z, inb && y < 0]); if (inb) RB.push([x, y, z, ina && y >= 0]) }
  }
  const U = RA.concat(RB), cx0 = (Math.min(...U.map(v => v[0])) + Math.max(...U.map(v => v[0]))) / 2, cy0 = (Math.min(...U.map(v => v[1])) + Math.max(...U.map(v => v[1]))) / 2;
  const mat = steel(), G = new THREE.Group(); S.add(G);
  const m4 = new THREE.Matrix4(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  function ringMesh(L, col, home) {
    const geo = GEO.clone(), glow = new THREE.InstancedBufferAttribute(new Float32Array(L.length), 1); glow.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aGlow', glow);
    const M = new THREE.InstancedMesh(geo, mat, L.length);
    L.forEach((v, i) => { m4.makeTranslation(v[0] - cx0 - home, v[1] - cy0, v[2]); M.setMatrixAt(i, m4); M.setColorAt(i, col) });
    const pv = new THREE.Group(); pv.position.x = home; pv.add(M); G.add(pv);
    return { M, pv, glow, L, home };
  }
  const RA_ = ringMesh(RA, new THREE.Color(0x39d6a3), -off - cx0), RB_ = ringMesh(RB, new THREE.Color(0xeef6f3), off - cx0);
  const B = { grp: G, mat };

  // ---- floor, light streaks and the snap ring ----
  S.fog = new THREE.Fog(0x050d10, 80, 260);
  const grid = new THREE.GridHelper(320, 128, 0x1f5a4c, 0x12303a); grid.position.y = FLOOR; grid.material.transparent = true; grid.material.opacity = 0; grid.material.depthWrite = false; S.add(grid);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 96), new THREE.MeshBasicMaterial({ color: 0x9ff3d6, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = FLOOR + .05; S.add(ring);
  const streak = (c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(60, .35), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.y = FLOOR + .3; S.add(m); return m };
  const sA = streak(0x39d6a3), sB = streak(0xe6fbf4);

  // ---- the two slots: real coins on the left, real pair assets on the right ----
  const box = document.createElement('div'); box.className = 'iholes islots'; box.innerHTML = '<i><img alt=""></i><i><img alt=""></i>'; el.appendChild(box);
  const [sa, sb] = box.querySelectorAll('i'), ia = sa.firstChild, ib = sb.firstChild;
  const coins = [], quotes = [], cseen = new Set(), qseen = new Set(); let finalP = null, lastFeed = -1e9, nextSwap = 0, landed = 0;
  const load = (u, arr) => { const im = new Image(); im.referrerPolicy = 'no-referrer'; im.onload = () => arr.push(u); im.src = u };
  function feed(now) {
    if (now - lastFeed < 450) return; lastFeed = now;
    const L = (window.__mxPairs && window.__mxPairs()) || [];
    for (const p of L) { if (!cseen.has(p.img)) { cseen.add(p.img); load(p.img, coins) } if (!qseen.has(p.q)) { qseen.add(p.q); load(p.q, quotes) } }
    if (!finalP && L[0]) finalP = L[0];
  }
  const pick = a => a[(Math.random() * a.length) | 0];

  // ---- render loop ----
  let W = 0, H = 0;
  const size = () => { W = innerWidth; H = innerHeight; R.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix() };
  size(); addEventListener('resize', size);
  const t0 = performance.now(); let exitAt = 0, exitDur = 900, gone = false, from = null, to = null, locked = 0, revealed = false;
  const v = new THREE.Vector3(), w = new THREE.Vector3();
  const fit = (h) => h / (2 * TAN);
  const bullD = () => Math.max(fit(BULL.h / (W > H ? .42 : .34)), BULL.w / (.78 * 2 * TAN * (W / H)));
  const LOCK = 3.4, LAND = LOCK + 1.25; // rings snap at LOCK, the slots land on a real pair at LAND
  const easeOut = k => 1 - Math.pow(1 - k, 3);

  function frame(now) {
    if (gone) return;
    const t = FIX != null && +FIX < 90 ? +FIX : (now - t0) / 1000;
    feed(now);
    // camera: a slow push in, a hint of an angle that straightens out
    const ck = easeIO(clamp(t / (LOCK + .8))), D = bullD() * THREE.MathUtils.lerp(1.35, 1, ck), ang = THREE.MathUtils.lerp(.22, 0, ck);
    cam.position.set(Math.sin(ang) * D, D * .06 * (1 - ck), Math.cos(ang) * D); cam.lookAt(0, 0, 0);
    S.fog.near = D * 1.05; S.fog.far = D * 2.3;
    grid.material.opacity = .55 * clamp(t / .9) * (1 - clamp((t - LOCK - .8) / 1.4) * .5);

    // the roll in: each ring rolls along the floor from its side and decelerates into place
    // roll in, pause a beat face to face, then snap together
    const es = easeOut(clamp((t - .3) / 2.3));
    let dist = t < 2.6 ? 6 + 58 * (1 - es) : t < LOCK - .25 ? 6 + Math.sin(t * 38) * .12 : 6 * (1 - Math.pow(clamp((t - (LOCK - .25)) / .25), 2));
    if (t >= LOCK) dist = 0;
    const recoil = t > LOCK ? -Math.sin(clamp((t - LOCK) / .3) * Math.PI) * .7 : 0;
    RA_.pv.position.x = RA_.home - dist - recoil; RB_.pv.position.x = RB_.home + dist + recoil;
    RA_.pv.rotation.z = dist / ro; RB_.pv.rotation.z = -dist / ro;               // rolling like coins
    const wob = Math.sin(t * 7) * .35 * (1 - es) + (t > 2.6 && t < LOCK ? Math.sin(t * 9) * .06 : 0); RA_.pv.rotation.y = wob; RB_.pv.rotation.y = -wob;
    const hop = Math.abs(Math.sin(dist / 6)) * .9 * (1 - es); RA_.pv.position.y = RB_.pv.position.y = hop;
    sA.position.x = RA_.pv.position.x - 34; sB.position.x = RB_.pv.position.x + 34;
    sA.material.opacity = sB.material.opacity = .5 * (1 - es) * clamp(t / .6);

    // the snap: the crossing notches drop out so the rings interlock, a flash, a ring across the floor, a wave
    if (t >= LOCK && !locked) {
      locked = now;
      for (const R_ of [RA_, RB_]) { R_.L.forEach((q, i) => { if (q[3]) R_.M.setMatrixAt(i, ZERO) }); R_.M.instanceMatrix.needsUpdate = true }
    }
    const lk = locked ? (now - locked) / 1000 : -1;
    const glowAmt = lk >= 0 ? Math.max(0, 1 - lk * 1.6) : 0;
    for (const R_ of [RA_, RB_]) { R_.glow.array.fill(glowAmt * .9 + (1 - es) * .25); R_.glow.needsUpdate = true }
    if (lk >= 0) {
      const rk = clamp(lk / 1.6); ring.scale.setScalar(4 + rk * 75); ring.material.opacity = (1 - rk) * .85;
      const wk = clamp((lk - .15) / 1.5); mat.userData.u.uWaveY.value = BULL.minY - 3 + wk * (BULL.h + 6); mat.userData.u.uWaveA.value = 1.8 * (1 - wk * .6) * (wk < 1 && wk > 0 ? 1 : 0);
    }
    // settle into the hero's pose, then breathe
    const tk = easeIO(clamp((t - LOCK - .4) / 1.5));
    G.rotation.y = tk * POSE.ry + (t > LOCK + 1.9 ? Math.sin((t - LOCK - 1.9) * .5) * .1 : 0);
    G.rotation.x = tk * POSE.rx;

    // exit: fly to the hero stage, matching its size and pose
    if (exitAt) {
      const k = clamp((now - exitAt) / exitDur), ek = easeIO(k);
      if (to) { G.position.lerpVectors(from.p, to.p, ek); G.scale.setScalar(THREE.MathUtils.lerp(from.s, to.s, ek)); G.rotation.y = THREE.MathUtils.lerp(from.ry, POSE.ry, ek); G.rotation.x = THREE.MathUtils.lerp(from.rx, POSE.rx, ek) }
      const heroOK = !HERO || (HERO.rendered && HERO.rendered()) || now - exitAt > exitDur + 1500;
      if (to && k >= .78 && heroOK && !revealed) { revealed = now; HERO && HERO.reveal() }
      const fo = revealed ? clamp((now - revealed) / 320) : 0;
      cv.style.opacity = to ? 1 - fo : 1 - ek;
      if (!to) G.scale.setScalar(1 + ek * .6);
      if (k >= 1 && (!to || fo >= 1)) { finish(); return }
    }
    R.render(S, cam);

    // the slots: spin fast while rolling, slow down after the snap, land on a real pair
    if (coins.length && quotes.length) {
      if (t < LAND) {
        const iv = THREE.MathUtils.lerp(55, 360, easeIO(clamp((t - 1.6) / (LAND - 1.6))));
        if (now >= nextSwap) { ia.src = pick(coins); ib.src = pick(quotes); nextSwap = now + iv }
      } else if (!landed && finalP) { landed = now; ia.src = finalP.img; ib.src = finalP.q; window.__mxPairNow = finalP }
    }
    const show = clamp((t - .5) / .5) * (exitAt ? Math.max(0, 1 - (now - exitAt) / 380) : 1);
    G.updateMatrixWorld();
    [[sa, ia, RA_], [sb, ib, RB_]].forEach(([el2, im, R_]) => {
      R_.pv.getWorldPosition(v); const d = cam.position.distanceTo(v); w.copy(v).project(cam);
      const px = (w.x * .5 + .5) * W, py = (-w.y * .5 + .5) * H, dia = 2 * HOLE * G.scale.x / (2 * d * TAN) * H;
      const sx = Math.max(.05, Math.abs(Math.cos(R_.pv.rotation.y)));
      el2.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) translate(-50%,-50%) scaleX(${sx.toFixed(3)}) rotate(${(-R_.pv.rotation.z * 57.3).toFixed(1)}deg)`;
      el2.style.width = el2.style.height = Math.max(0, dia).toFixed(1) + 'px';
      const fast = t < LAND ? clamp(1 - (t - LOCK) / 1.2) : 0, pop = landed ? clamp((now - landed) / 420) : 1;
      im.style.filter = fast > .05 ? `blur(${(fast * 1.6).toFixed(2)}px)` : '';
      im.style.transform = landed ? `scale(${(.7 + .3 * backOut(pop)).toFixed(3)})` : '';
    });
    box.style.opacity = coins.length && quotes.length ? show : 0;
    if (!exitAt && (FIX == null || +FIX >= 90) && MX.loaded && ((t > LAND + 1.6 && MX.loaded() >= 2) || t > LAND + 3.5)) MX.close && MX.close();
    requestAnimationFrame(frame);
  }
  function finish() {
    gone = true; removeEventListener('resize', size);
    try { R.dispose(); R.forceContextLoss() } catch (e) { }
    el.remove(); HERO && HERO.show();
  }
  // called by app.js when the intro closes (auto, click, skip or key)
  window.__mx3dIntro = {
    exit(fast) {
      if (exitAt) return; exitAt = performance.now(); exitDur = fast ? 900 : 1400;
      el.classList.add('leaving');
      const t = (exitAt - t0) / 1000;
      const stageEl = $('#hb'), home = MX.isHome ? MX.isHome() : true;
      if (t < LOCK + .3 || !stageEl || !home) { to = null; HERO && HERO.show(); return }
      const r = stageEl.getBoundingClientRect();
      const Dz = cam.position.z, halfH = Dz * TAN, halfW = halfH * cam.aspect;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const tx = (cx / W * 2 - 1) * halfW + cam.position.x, ty = (1 - cy / H * 2) * halfH + cam.position.y;
      const curPx = BULL.h / (2 * halfH) * H, wantPx = HERO && HERO.px ? HERO.px() : r.height * heroFill();
      from = { p: G.position.clone(), s: G.scale.x, ry: G.rotation.y, rx: G.rotation.x };
      to = { p: new THREE.Vector3(tx, ty, 0), s: wantPx / curPx };
      HERO && HERO.start();
    }
  };
  requestAnimationFrame(frame);
  return true;
}

/* ======================================================================
   HERO: the live bull. Turns with your cursor, voxels part where you
   point, and a wave runs up it on every real launch or level-up.
   ====================================================================== */
function hero() {
  const cv = $('#hb'); if (!cv) return null;
  let st; try { st = stage(cv, 1.75) } catch (e) { cv.closest('.stage')?.classList.add('nogl'); return null }
  const { R, S, cam } = st; R.toneMappingExposure = 1.22;
  const B = makeBull(); S.add(B.grp);
  // pedestal: a ring with the four levels orbiting it
  const pedW = new THREE.Group(); pedW.position.y = BULL.minY - 1.6; pedW.rotation.x = .32; S.add(pedW);
  const ped = new THREE.Group(); pedW.add(ped);
  const tor = new THREE.Mesh(new THREE.TorusGeometry(19, .09, 8, 200), new THREE.MeshBasicMaterial({ color: 0x39d6a3, transparent: true, opacity: .75 })); tor.rotation.x = Math.PI / 2; ped.add(tor);
  const tor2 = new THREE.Mesh(new THREE.TorusGeometry(22.5, .05, 6, 200), new THREE.MeshBasicMaterial({ color: 0x69aac1, transparent: true, opacity: .35 })); tor2.rotation.x = Math.PI / 2; ped.add(tor2);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(18.9, 120), new THREE.MeshBasicMaterial({ color: 0x0d2a2a, transparent: true, opacity: .55, depthWrite: false })); disc.rotation.x = -Math.PI / 2; ped.add(disc);
  const LC = [0x39d6a3, 0xeef6f3, 0x69aac1, 0x9ff3d6];
  const orb = LC.map((c, i) => { const m = new THREE.Mesh(GEO, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .9, metalness: .5, roughness: .3 })); m.scale.setScalar(.9); ped.add(m); return m });

  let W = 0, H = 0, vis = true, shown = false, alive = true;
  const D = () => Math.max((BULL.h / heroFill()) / (2 * TAN), (BULL.w / .84) / (2 * TAN * Math.max(.3, cam.aspect || 1)));
  const size = () => { const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return; W = r.width; H = r.height; R.setSize(W, H, false); cam.aspect = W / H; cam.position.set(0, 0, D()); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix() };
  size(); if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
  if ('IntersectionObserver' in window) new IntersectionObserver(e => { vis = e[0].isIntersecting }).observe(cv);

  // pointer: turn toward it, and part the voxels under it
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, on: false, wx: 0, wy: 0 };
  const off = new Float32Array(N * 3); let settled = true;
  const hostEl = cv.closest('.hero') || cv;
  hostEl.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); ptr.tx = clamp(((e.clientX - r.left) / r.width - .5) * 2, -1.4, 1.4); ptr.ty = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1.4, 1.4);
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; ptr.on = inside;
    if (inside) { const halfH = cam.position.z * TAN; ptr.wx = ((e.clientX - r.left) / r.width * 2 - 1) * halfH * cam.aspect; ptr.wy = (1 - (e.clientY - r.top) / r.height * 2) * halfH }
  });
  hostEl.addEventListener('pointerleave', () => { ptr.tx = ptr.ty = 0; ptr.on = false });
  cv.addEventListener('click', () => pulse('tap'));
  const HH = holes(cv.parentElement, 'hholes'); let manualUntil = 0;
  window.__mxHero = { next() { manualUntil = performance.now() + 12000; HH.next() }, prev() { manualUntil = performance.now() + 12000; HH.prev() } };

  // waves: one per real event, queued so bursts of launches don't blur together
  const waves = []; let lastWave = 0;
  function pulse(kind) { if (waves.length < 4) waves.push({ kind, at: 0 }) }
  addEventListener('mx:pulse', e => pulse(e.detail?.kind || 'new'));

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3(), inv = new THREE.Matrix4(), pl = new THREE.Vector3();
  let tShow = performance.now(), last = tShow, wave = null, drawn = false;
  try { R.compile(S, cam) } catch (e) { }
  function frame(now) {
    if (!alive) return;
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const homeOn = MX.isHome ? MX.isHome() : true;
    if (!shown || !vis || document.hidden || !homeOn || !W) return;
    if (cv.clientWidth !== W || cv.clientHeight !== H) size();
    const t = (now - tShow) / 1000;
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 4); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 4);
    const sk = Math.min(1, (window.scrollY || 0) / 650), se = sk * sk * (3 - 2 * sk); // scroll: the rings tilt back and lift away
    B.grp.rotation.y = POSE.ry + Math.sin(t * .45) * .16 + ptr.x * .5 + se * .7;
    B.grp.rotation.x = POSE.rx + ptr.y * .18 + se * .65;
    B.grp.position.y = Math.sin(t * 1.1) * .35 + se * 4;
    B.grp.scale.setScalar(1 - se * .12);
    ped.rotation.y = t * .25; orb.forEach((o, i) => { const a = t * .5 + i * Math.PI / 2; o.position.set(Math.cos(a) * 22.5, .2 + Math.sin(t * 2 + i) * .3, Math.sin(a) * 22.5); o.rotation.set(t, t * .7, 0) });
    // voxels part around the pointer (in the bull's own space)
    B.grp.updateMatrixWorld(); inv.copy(B.M.matrixWorld).invert();
    pl.set(ptr.wx, ptr.wy, 8).applyMatrix4(inv);
    let moving = false; const R2 = 30;
    for (let i = 0; i < N; i++) {
      const v = BULL.V[i], j = i * 3; let fx = 0, fy = 0, fz = 0;
      if (ptr.on) { const dx = v[0] - pl.x, dy = v[1] - pl.y, d2 = dx * dx + dy * dy; if (d2 < R2) { const k = (1 - d2 / R2) * 2.6, d = Math.sqrt(d2) + .3; fx = dx / d * k; fy = dy / d * k; fz = k * .9 } }
      for (let a = 0; a < 3; a++) { const f = a === 0 ? fx : a === 1 ? fy : fz, o = off[j + a]; off[j + a] = o + (f - o) * Math.min(1, dt * 9); if (Math.abs(off[j + a]) > .003 || Math.abs(f - o) > .003) moving = true }
      if (moving || !settled) { pos.set(v[0] + off[j], v[1] + off[j + 1], v[2] + off[j + 2]); m4.compose(pos, q, sc); B.M.setMatrixAt(i, m4) }
    }
    if (moving || !settled) B.M.instanceMatrix.needsUpdate = true; settled = !moving;
    // the wave
    if (!wave && waves.length && t - lastWave > .35) { wave = waves.shift(); wave.at = t; lastWave = t }
    const u = B.mat.userData.u;
    if (wave) {
      const k = (t - wave.at) / 1.15; const c = wave.kind === 'lvl' ? PALE : wave.kind === 'tap' ? new THREE.Color(0x69aac1) : MINT;
      u.uWaveC.value.copy(c); u.uWaveY.value = BULL.minY - 3 + k * (BULL.h + 6); u.uWaveA.value = (wave.kind === 'lvl' ? 2.4 : 1.7) * (1 - k * .5);
      B.gm.emissiveIntensity = 2.2 + Math.max(0, 1 - Math.abs(k - .62) * 4) * 4;
      tor.material.opacity = .75 + Math.max(0, 1 - k * 2) * .25; tor.scale.setScalar(1 + Math.max(0, 1 - k * 2) * .04);
      if (k >= 1) { wave = null; u.uWaveA.value = 0 }
    } else B.gm.emissiveIntensity = 2.2 + Math.sin(t * 2.2) * .4;
    R.render(S, cam); drawn = true;
    HH.cycle(now, performance.now() < manualUntil ? 1e12 : 3400, false); HH.place(B.grp, cam, W, H, HH.has() && cv.style.opacity === '1' ? 1 : 0);
  }
  requestAnimationFrame(frame);
  return {
    start() { if (!shown) { shown = true; tShow = performance.now(); size() } },
    reveal() { cv.style.opacity = '1'; cv.closest('.stage')?.classList.add('live') },
    show() { this.start(); this.reveal() },
    rendered: () => drawn,
    px() { return BULL.h / (2 * D() * TAN) * (H || cv.getBoundingClientRect().height) },
    pulse,
  };
}

/* ---------------- boot ---------------- */
try { HERO = hero() } catch (e) { HERO = null }
const started = (() => { try { return intro() } catch (e) { console.warn('intro', e); return false } })();
if (!started) HERO && HERO.show();
window.__mx3d = { ok: true, intro: started, hero: !!HERO };
