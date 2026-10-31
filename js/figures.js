/* =========================================================
   Illustrated character, drawn from joint angles.
   Angles are degrees from straight down; positive turns toward the front (right).
   ========================================================= */
const NS = 'http://www.w3.org/2000/svg';
function mk(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const SG = { torso:56, ua:30, fa:28, th:42, sh:40, ft:13, head:12, neck:5 };
const GROUND = 206, RAD = Math.PI / 180;
const FC = { skin:'#C68A5E', skinD:'#9C6641', hair:'#231A15', shirt:'#F4F5F7', shorts:'#1F44C4', shortsD:'#142E8A', shoe:'#F4F5F7', shoeD:'#B7BFCC', glove:'#D7263D', gloveD:'#9E1626', ol:'#14203A', db:'#4A5675' };
const dv = a => [Math.sin(a * RAD), Math.cos(a * RAD)];
const dl = a => [-Math.sin(a * RAD), Math.cos(a * RAD)];
const mv = (p, v, l) => [p[0] + v[0] * l, p[1] + v[1] * l];
const DEFP = { v:'s', t:0, a1:[0,5], a2:[0,5], l1:[0,0], l2:[0,0], f1:0, f2:0, x:0, db:'', gl:0, hit:0, hh:1 };
const P = o => Object.assign({}, DEFP, o);
function lerpPose(A, B, u) {
  const o = { v:B.v, db:B.db, hh:B.hit >= A.hit ? B.hh : A.hh };
  ['t','f1','f2','x','gl','hit'].forEach(k => { o[k] = A[k] + (B[k] - A[k]) * u; });
  ['a1','a2','l1','l2'].forEach(k => { o[k] = [A[k][0] + (B[k][0] - A[k][0]) * u, A[k][1] + (B[k][1] - A[k][1]) * u]; });
  return o;
}
const smooth = u => u * u * (3 - 2 * u);
const tri = u => u < .5 ? smooth(u * 2) : smooth((1 - u) * 2);

function fk(p) {
  const J = {}, hip = [0, 0], tv = [Math.sin(p.t * RAD), -Math.cos(p.t * RAD)];
  const neck = mv(hip, tv, SG.torso);
  J.hip = hip; J.neck = neck; J.head = mv(neck, tv, SG.neck + SG.head);
  if (p.v === 'f') {
    const perp = [Math.cos(p.t * RAD), Math.sin(p.t * RAD)], base = mv(neck, tv, -6);
    J.sh1 = mv(base, perp, -15); J.sh2 = mv(base, perp, 15); J.hp1 = mv(hip, perp, -9); J.hp2 = mv(hip, perp, 9);
    J.el1 = mv(J.sh1, dl(p.a1[0]), SG.ua); J.fa1 = dl(p.a1[0] + p.a1[1]); J.h1 = mv(J.el1, J.fa1, SG.fa);
    J.el2 = mv(J.sh2, dv(p.a2[0]), SG.ua); J.fa2 = dv(p.a2[0] + p.a2[1]); J.h2 = mv(J.el2, J.fa2, SG.fa);
    J.kn1 = mv(J.hp1, dl(p.l1[0]), SG.th); J.an1 = mv(J.kn1, dl(p.l1[0] - p.l1[1]), SG.sh); J.to1 = mv(J.an1, [-1, 0], 9);
    J.kn2 = mv(J.hp2, dv(p.l2[0]), SG.th); J.an2 = mv(J.kn2, dv(p.l2[0] - p.l2[1]), SG.sh); J.to2 = mv(J.an2, [1, 0], 9);
  } else {
    const sh = mv(neck, tv, -7);
    J.sh1 = sh; J.sh2 = [sh[0] - 4, sh[1]]; J.hp1 = hip; J.hp2 = [hip[0] - 4, hip[1]];
    J.el1 = mv(J.sh1, dv(p.a1[0]), SG.ua); J.fa1 = dv(p.a1[0] + p.a1[1]); J.h1 = mv(J.el1, J.fa1, SG.fa);
    J.el2 = mv(J.sh2, dv(p.a2[0]), SG.ua); J.fa2 = dv(p.a2[0] + p.a2[1]); J.h2 = mv(J.el2, J.fa2, SG.fa);
    J.kn1 = mv(J.hp1, dv(p.l1[0]), SG.th); J.an1 = mv(J.kn1, dv(p.l1[0] - p.l1[1]), SG.sh); J.to1 = mv(J.an1, dv(90 + p.f1), SG.ft);
    J.kn2 = mv(J.hp2, dv(p.l2[0]), SG.th); J.an2 = mv(J.kn2, dv(p.l2[0] - p.l2[1]), SG.sh); J.to2 = mv(J.an2, dv(90 + p.f2), SG.ft);
  }
  const pts = [[J.head, SG.head + 1], [J.neck, 11], [J.hip, 11], [J.sh1, 6], [J.el1, 6], [J.h1, 6], [J.el2, 6], [J.h2, 6],
               [J.kn1, 8], [J.kn2, 8], [J.an1, 6], [J.an2, 6], [J.to1, 5], [J.to2, 5]];
  let my = -1e9; pts.forEach(([q, r]) => { my = Math.max(my, q[1] + r); });
  const dx = 110 + p.x, dy = GROUND - my;
  Object.keys(J).forEach(k => { if (k !== 'fa1' && k !== 'fa2') J[k] = [J[k][0] + dx, J[k][1] + dy]; });
  J.tv = tv;
  return J;
}
const f1 = n => n.toFixed(1);
function ln(l, a, b) { l.setAttribute('x1', f1(a[0])); l.setAttribute('y1', f1(a[1])); l.setAttribute('x2', f1(b[0])); l.setAttribute('y2', f1(b[1])); }
const STAR = (() => { let d = ''; for (let i = 0; i < 16; i++) { const r = i % 2 ? 6 : 14, a = i * Math.PI / 8; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d + 'Z'; })();

class Fig {
  constructor(host, label, deco) {
    const s = this.svg = mk('svg', { viewBox:'0 0 220 220', class:'fig', role:'img', 'aria-label':label || '' });
    host.appendChild(s);
    if (deco) { const g = mk('g', {}, s); g.innerHTML = deco; }
    this.shadow = mk('ellipse', { cy:GROUND + 1, rx:40, ry:4.5, fill:'#000', opacity:.14 }, s);
    mk('line', { x1:8, y1:GROUND, x2:212, y2:GROUND, class:'fg-ground' }, s);
    const grp = names => {
      const g = mk('g', {}, s), o = {};
      names.forEach(([n, w]) => { o[n + 'o'] = mk('line', { 'stroke-width':w + 4.5, 'stroke-linecap':'round', stroke:FC.ol }, g); });
      names.forEach(([n, w]) => { o[n] = mk('line', { 'stroke-width':w, 'stroke-linecap':'round' }, g); });
      return o;
    };
    this.L2 = grp([['th',14],['sh',10],['ft',8]]); this.A2 = grp([['ua',9],['fa',8]]); this.H2 = this.hand(s);
    this.T = grp([['torso',24],['shb',15],['hpb',17]]);
    this.T.shorts = mk('line', { 'stroke-width':24, 'stroke-linecap':'butt', stroke:FC.shorts }, s);
    this.HD = this.head(s);
    this.L1 = grp([['th',14],['sh',10],['ft',8]]); this.A1 = grp([['ua',9],['fa',8]]); this.H1 = this.hand(s);
    this.burst = mk('path', { d:STAR, fill:'#fff', stroke:'#1F44C4', 'stroke-width':2.5, 'stroke-linejoin':'round', opacity:0 }, s);
    this.front = null;
  }
  hand(s) {
    const g = mk('g', {}, s), L = (c, w) => mk('line', { stroke:c, 'stroke-width':w, 'stroke-linecap':'round' }, g);
    return { db:[L(FC.ol, 4), L(FC.ol, 13), L(FC.ol, 13), L(FC.db, 9), L(FC.db, 9)],
      glove:mk('circle', { r:8, fill:FC.glove, stroke:FC.ol, 'stroke-width':2.2 }, g),
      fist:mk('circle', { r:4.6, fill:FC.skin, stroke:FC.ol, 'stroke-width':2.2 }, g) };
  }
  head(s) {
    const g = mk('g', {}, s);
    return { hair:mk('circle', { r:SG.head + .5, fill:FC.hair, stroke:FC.ol, 'stroke-width':2.2 }, g),
      face:mk('circle', { r:SG.head - 1.5, fill:FC.skin }, g),
      e1:mk('circle', { r:1.7, fill:FC.ol }, g), e2:mk('circle', { r:1.7, fill:FC.ol }, g),
      mouth:mk('path', { fill:'none', stroke:FC.ol, 'stroke-width':1.6, 'stroke-linecap':'round' }, g) };
  }
  seg(o, n, a, b) { ln(o[n + 'o'], a, b); ln(o[n], a, b); }
  colors(front) {
    const set = (o, n, c) => o[n].setAttribute('stroke', c);
    set(this.L1, 'th', FC.shorts); set(this.L1, 'sh', FC.skin); set(this.L1, 'ft', FC.shoe);
    set(this.A1, 'ua', FC.skin); set(this.A1, 'fa', FC.skin);
    set(this.L2, 'th', front ? FC.shorts : FC.shortsD); set(this.L2, 'sh', front ? FC.skin : FC.skinD); set(this.L2, 'ft', front ? FC.shoe : FC.shoeD);
    set(this.A2, 'ua', front ? FC.skin : FC.skinD); set(this.A2, 'fa', front ? FC.skin : FC.skinD);
    set(this.T, 'torso', FC.shirt); set(this.T, 'shb', FC.shirt); set(this.T, 'hpb', FC.shorts);
    this.H2.glove.setAttribute('fill', front ? FC.glove : FC.gloveD);
    this.H2.fist.setAttribute('fill', front ? FC.skin : FC.skinD);
    ['shb','hpb'].forEach(n => { this.T[n].style.display = this.T[n + 'o'].style.display = front ? '' : 'none'; });
    this.HD.mouth.style.display = this.HD.e2.style.display = front ? '' : 'none';
  }
  drawHand(H, hand, fd, mode, gl) {
    const show = (el, on) => { el.style.display = on ? '' : 'none'; };
    show(H.glove, gl > .5); show(H.fist, gl <= .5);
    H.glove.setAttribute('cx', f1(hand[0])); H.glove.setAttribute('cy', f1(hand[1]));
    H.fist.setAttribute('cx', f1(hand[0])); H.fist.setAttribute('cy', f1(hand[1]));
    H.db.forEach(l => show(l, !!mode));
    if (!mode) return;
    const w = [-fd[1], fd[0]], a = mv(hand, w, -9), b = mv(hand, w, 9);
    ln(H.db[0], a, b);
    ln(H.db[1], mv(a, fd, -6), mv(a, fd, 6)); ln(H.db[2], mv(b, fd, -6), mv(b, fd, 6));
    ln(H.db[3], mv(a, fd, -6), mv(a, fd, 6)); ln(H.db[4], mv(b, fd, -6), mv(b, fd, 6));
  }
  draw(p) {
    const J = fk(p), front = p.v === 'f';
    if (front !== this.front) { this.front = front; this.colors(front); this.T.torso.setAttribute('stroke-width', front ? 28 : 24); this.T.torsoo.setAttribute('stroke-width', front ? 32.5 : 28.5); }
    this.seg(this.L2, 'th', J.hp2, J.kn2); this.seg(this.L2, 'sh', J.kn2, J.an2); this.seg(this.L2, 'ft', J.an2, J.to2);
    this.seg(this.A2, 'ua', J.sh2, J.el2); this.seg(this.A2, 'fa', J.el2, J.h2);
    this.seg(this.T, 'torso', J.hip, J.neck); this.seg(this.T, 'shb', J.sh1, J.sh2); this.seg(this.T, 'hpb', J.hp1, J.hp2);
    const tv = J.tv, waist = mv(J.hip, tv, 11);
    ln(this.T.shorts, mv(J.hip, tv, -4), waist);
    this.T.shorts.setAttribute('stroke-width', front ? 28 : 24);
    this.seg(this.L1, 'th', J.hp1, J.kn1); this.seg(this.L1, 'sh', J.kn1, J.an1); this.seg(this.L1, 'ft', J.an1, J.to1);
    this.seg(this.A1, 'ua', J.sh1, J.el1); this.seg(this.A1, 'fa', J.el1, J.h1);
    this.drawHand(this.H2, J.h2, J.fa2, p.db === '2', p.gl);
    this.drawHand(this.H1, J.h1, J.fa1, p.db, p.gl);
    const H = this.HD, fw = front ? [0, 0] : [-tv[1], tv[0]];
    const hc = front ? mv(J.head, tv, 2.5) : mv(mv(J.head, fw, -2.5), tv, 2);
    H.hair.setAttribute('cx', f1(hc[0])); H.hair.setAttribute('cy', f1(hc[1]));
    const fc = front ? mv(J.head, tv, -1.5) : mv(mv(J.head, fw, 1.6), tv, -1.2);
    H.face.setAttribute('cx', f1(fc[0])); H.face.setAttribute('cy', f1(fc[1]));
    if (front) {
      const pr = [-tv[1], tv[0]], e = mv(J.head, tv, -1);
      const a = mv(e, pr, -4), b = mv(e, pr, 4);
      H.e1.setAttribute('cx', f1(a[0])); H.e1.setAttribute('cy', f1(a[1])); H.e2.setAttribute('cx', f1(b[0])); H.e2.setAttribute('cy', f1(b[1]));
      const m = mv(J.head, tv, -6.5);
      H.mouth.setAttribute('d', `M${f1(m[0] - 3.5)} ${f1(m[1] - 1)} Q${f1(m[0])} ${f1(m[1] + 2.5)} ${f1(m[0] + 3.5)} ${f1(m[1] - 1)}`);
    } else {
      const e = mv(mv(J.head, fw, 6.5), tv, 1.2);
      H.e1.setAttribute('cx', f1(e[0])); H.e1.setAttribute('cy', f1(e[1]));
    }
    const fx = (J.an1[0] + J.an2[0] + J.hip[0]) / 3;
    this.shadow.setAttribute('cx', f1(fx));
    const op = clamp((p.hit - .6) / .4, 0, 1);
    this.burst.setAttribute('opacity', op.toFixed(2));
    if (op > 0) {
      const hd = p.hh === 2 ? J.h2 : J.h1, fd = p.hh === 2 ? J.fa2 : J.fa1, c = mv(hd, fd, 12);
      this.burst.setAttribute('transform', `translate(${f1(c[0])} ${f1(c[1])}) scale(${(.6 + op * .5).toFixed(2)})`);
    }
  }
}

/* Animation loop: requestAnimationFrame plus a watchdog timer so figures never stall */
const ANIMS = new Set();
class Anim {
  constructor(fig, frames, seg = 800, hold = 300, loop = true) {
    Object.assign(this, { fig, frames, seg:Math.max(60, seg), hold, loop, t0:performance.now() });
    this.dur = (loop ? frames.length : frames.length - 1) * (this.seg + hold);
    fig.draw(frames[MOTION ? 0 : Math.min(1, frames.length - 1)]);
  }
  at(t) {
    const n = this.frames.length, per = this.seg + this.hold;
    if (n === 1) return this.frames[0];
    const tt2 = this.loop ? t % (n * per) : Math.min(t, (n - 1) * per - 1);
    const i = Math.floor(tt2 / per), r = tt2 - i * per;
    return lerpPose(this.frames[i % n], this.frames[(i + 1) % n], r < this.hold ? 0 : smooth(Math.min(1, (r - this.hold) / this.seg)));
  }
}
let lastFrame = 0;
function frame(now) {
  lastFrame = now;
  ANIMS.forEach(a => {
    if (!a.fig.svg.isConnected) { ANIMS.delete(a); return; }
    try { a.fig.draw(a.custom ? a.custom(now) : a.at(now - a.t0)); } catch (e) { ANIMS.delete(a); }
  });
}
function rafLoop(now) { frame(now); requestAnimationFrame(rafLoop); }
requestAnimationFrame(rafLoop);
setInterval(() => { const now = performance.now(); if (now - lastFrame > 90 && ANIMS.size && document.visibilityState === 'visible') frame(now); }, 45);
function play(a) { if (MOTION) ANIMS.add(a); return a; }
function stopAnim(a) { if (a) ANIMS.delete(a); }
/* ---------------------------------------------------------
   Character poses. To add one: put img/fig/<name>.webp (and
   optionally <name>_glow.webp) in the folder, add the name to
   FIG_FILES, then point a move at it in IMGMAP below.
   --------------------------------------------------------- */
const FIG_FILES = [
  'guard', 'guard_glow', 'cross', 'cross_glow', 'stand', 'goblet_a',
  'goblet_b', 'goblet_b_glow', 'rdl_a', 'rdl_b', 'rdl_b_glow', 'lunge_a',
  'lunge_b', 'lunge_b_glow', 'bridge_a', 'bridge_b', 'bridge_b_glow', 'calf_a',
  'calf_b', 'calf_b_glow', 'swing_a', 'swing_b', 'swing_b_glow', 'thruster_a',
  'thruster_b', 'thruster_b_glow', 'floor_press_b', 'floor_press_b_glow', 'pushup_a', 'pushup_b',
  'pushup_b_glow', 'press_a', 'press_b', 'press_b_glow', 'lateral_a', 'lateral_b',
  'lateral_b_glow', 'tri_oh_a', 'tri_oh_b', 'tri_oh_b_glow', 'celebrate', 'curl_a',
  'curl_b', 'curl_b_glow', 'deadbug_a', 'deadbug_b', 'deadbug_b_glow', 'def_back',
  'def_back_glow', 'def_roll', 'def_roll_glow', 'def_slip', 'def_slip_glow', 'farmer_a',
  'farmer_b', 'farmer_b_glow', 'hammer_a', 'hammer_b', 'mv_armcircle', 'mv_breathe_a',
  'mv_breathe_b', 'mv_chest_a', 'mv_chest_b', 'mv_crossbody', 'mv_hamstring_a', 'mv_hamstring_b',
  'mv_hips_a', 'mv_hips_b', 'mv_jacks_a', 'mv_jacks_b', 'mv_legswing_a', 'mv_legswing_b',
  'mv_march_a', 'mv_march_b', 'mv_quad', 'mv_sidereach_a', 'mv_sidereach_b', 'mv_squatbw_a',
  'mv_squatbw_b', 'plank_a', 'plank_b', 'plank_b_glow', 'pullover_a', 'pullover_b',
  'pullover_b_glow', 'row1_a', 'row1_b', 'row1_b_glow', 'rowbent_a', 'rowbent_b',
  'rowbent_b_glow', 'twist_a', 'twist_b', 'twist_b_glow', 'box_jab', 'box_jab_glow',
  'box_leadupper', 'box_leadupper_glow', 'box_rearupper', 'box_rearupper_glow', 'box_pivot', 'box_pivot_glow',
  'mv_reach_a', 'mv_reach_b', 'hammer_b_glow', 'floor_press_a', 'box_leadhook', 'box_leadhook_glow',
  'box_rearhook', 'box_rearhook_glow'
];
const FIGIMG = Object.fromEntries(FIG_FILES.map(n => [n, 'img/fig/' + n + '.webp']));
/* Gemini character images replace the drawn figure wherever a matching pose exists */
// Two-frame exercises: show whichever photo is closer to the animated pose
const POSE_KEYS = ['t','x','a1','a2','l1','l2','f1','f2'];
const poseDist = (p, q) => POSE_KEYS.reduce((s, k) => s + (Array.isArray(p[k]) ? Math.abs(p[k][0] - q[k][0]) + Math.abs(p[k][1] - q[k][1]) : Math.abs((p[k] || 0) - (q[k] || 0))), 0);
const twoFrame = id => p => !p ? id + '_a' : (poseDist(p, EX[id].f[0]) <= poseDist(p, EX[id].f[1]) ? id + '_a' : id + '_b');
const FRAME = { stand:'600 / 680', floor:'660 / 360' };
const LYING_EX = ['bridge','floor_press','pushup','pullover','deadbug','plank'];
const straight2 = p => p && p.hit > .55 && p.hh === 2 && p.a2 && Math.abs(p.a2[1]) < 25 ? 'cross' : GUARD_IMG;
const IMGMAP = {
  'scene:fight':[() => 'box_pivot', ['box_pivot','box_jab','cross','box_leadhook','box_rearhook','box_leadupper','box_rearupper','def_slip','def_roll','def_back']],
  'scene:welcome':[straight2, ['box_pivot','cross']],
  'move:stance':[() => 'box_pivot', ['box_pivot']], 'move:bounce':[straight2, ['box_pivot','cross']], 'move:balloon':[straight2, ['box_pivot','cross']],
  'punch:2':[straight2, ['box_pivot','cross']], 'scene:rest':[() => 'stand', ['stand']]
};
['goblet','rdl','lunge','bridge','calf','swing','thruster','pushup','press','lateral','tri_oh',
  'curl','farmer','hammer','pullover','row1','rowbent','deadbug','plank','twist'].forEach(id => {
  IMGMAP['ex:' + id] = [twoFrame(id), [id + '_a', id + '_b'], FRAME[LYING_EX.includes(id) ? 'floor' : 'stand'], true];
});
IMGMAP['ex:floor_press'] = [twoFrame('floor_press'), ['floor_press_a','floor_press_b'], FRAME.floor, true];
/* Warm-up and cool-down moves (front or side photos, no glow frames) */
const twoMove = (id, a, b) => p => !p ? a : (poseDist(p, MOVES[id].f[0]) <= poseDist(p, MOVES[id].f[1]) ? a : b);
[['march'],['jacks'],['sidereach'],['hips'],['squatbw'],['hamstring'],['chest'],['breathe'],['legswing'],
 ['starjump','jacks'],['frog','squatbw'],['reach'],['stars','reach']].forEach(([id, img]) => {
  const n = 'mv_' + (img || id); IMGMAP['move:' + id] = [twoMove(id, n + '_a', n + '_b'), [n + '_a', n + '_b'], FRAME.stand, true];
});
['armcircle','crossbody','quad'].forEach(id => { IMGMAP['move:' + id] = [() => 'mv_' + id, ['mv_' + id], FRAME.stand]; });
IMGMAP['move:hero'] = [twoFrame('plank'), ['plank_a','plank_b'], FRAME.floor, true];
IMGMAP['move:bug'] = [twoFrame('deadbug'), ['deadbug_a','deadbug_b'], FRAME.floor, true];
IMGMAP['scene:celebrate'] = [() => 'celebrate', ['celebrate'], FRAME.stand];
/* Real-movement videos for the Latihan cards (AI-generated from our own pictures, about 50-130 KB each) */
const VIDMAP = { 'punch:1':'vid_jab', 'punch:2':'vid_straight', 'ex:goblet':'vid_goblet', 'move:march':'vid_march' };
const vidObs = 'IntersectionObserver' in window ? new IntersectionObserver(ents => ents.forEach(en => {
  const v = en.target;
  if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (MOTION && !v.dataset.paused) v.play().catch(() => {}); }
  else v.pause();
}), { rootMargin:'80px' }) : null;
function mountVideo(host, key) {
  const v = document.createElement('video');
  const pics = IMGMAP[key] ? IMGMAP[key][1] : [];
  v.className = 'vidfig' + (key.startsWith('punch:') ? ' tall' : '');
  v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.dataset.src = 'img/video/' + VIDMAP[key] + '.mp4';
  if (pics.length && FIGIMG[pics[0]]) v.poster = FIGIMG[pics[0]];
  const label = host.dataset.label; if (label) v.setAttribute('aria-label', label + ', video'); else v.setAttribute('aria-hidden', 'true');
  v.addEventListener('click', () => { if (!v.src) v.src = v.dataset.src; if (v.paused) { delete v.dataset.paused; v.play().catch(() => {}); } else { v.dataset.paused = '1'; v.pause(); } });
  host.classList.add('has-vid'); host.appendChild(v);
  if (vidObs) vidObs.observe(v); else { v.src = v.dataset.src; if (MOTION) v.play().catch(() => {}); }
}
/* Setup wizard and goal pictures (the ruler and heartbeat drawings sit on top of the photo) */
IMGMAP['scene:about'] = [() => 'stand', ['stand'], FRAME.stand];
IMGMAP['scene:health'] = [twoMove('breathe', 'mv_breathe_a', 'mv_breathe_b'), ['mv_breathe_a','mv_breathe_b'], FRAME.stand, true];
IMGMAP['scene:exp'] = [twoFrame('goblet'), ['goblet_a','goblet_b'], FRAME.stand, true];
IMGMAP['goal:fat'] = [twoMove('jacks', 'mv_jacks_a', 'mv_jacks_b'), ['mv_jacks_a','mv_jacks_b'], FRAME.stand, true];
IMGMAP['goal:muscle'] = [twoFrame('curl'), ['curl_a','curl_b'], FRAME.stand, true];
IMGMAP['goal:fight'] = [straight2, ['box_pivot','cross']];
IMGMAP['goal:learn'] = [() => 'box_pivot', ['box_pivot']];
IMGMAP['goal:health'] = [twoMove('sidereach', 'mv_sidereach_a', 'mv_sidereach_b'), ['mv_sidereach_a','mv_sidereach_b'], FRAME.stand, true];
/* Defence moves in the punch guide (single photo each, glow version shows the working muscles) */
['slip','roll','back'].forEach(id => { IMGMAP['punch:' + id] = [() => 'def_' + id, ['def_' + id]]; });
/* Punch guide photos (single picture each; the glow version shows the working muscles). */
[['1','box_jab'],['3','box_leadhook'],['4','box_rearhook'],['5','box_leadupper'],['6','box_rearupper'],['pivot','box_pivot']].forEach(([id, n]) => { IMGMAP['punch:' + id] = [() => n, [n]]; });
class ImgFig {
  constructor(host, label, key, glow, deco) {
    const [pick, keys, ratio, ease] = IMGMAP[key]; this.pick = pick; this.cur = null; this.els = {};
    const d = this.svg = document.createElement('div'); d.className = 'imgfig' + (ease ? ' ease' : '') + (ratio === FRAME.floor ? ' wide' : '');
    if (ratio) d.style.aspectRatio = ratio;
    if (label) { d.setAttribute('role', 'img'); d.setAttribute('aria-label', label); } else d.setAttribute('aria-hidden', 'true');
    keys.forEach(k => { const im = document.createElement('img'); im.src = glow && FIGIMG[k + '_glow'] ? FIGIMG[k + '_glow'] : FIGIMG[k]; im.alt = ''; im.decoding = 'async'; im.draggable = false; d.appendChild(im); this.els[k] = im; });
    if (deco) { const o = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); o.setAttribute('viewBox', '0 0 220 220'); o.setAttribute('class', 'deco'); o.setAttribute('aria-hidden', 'true'); o.innerHTML = /class="ecg"/.test(deco) ? `<g transform="translate(14 0)">${deco}</g>` : deco.replace('M48 54 l14 -7 v14z', 'M48 18 l14 -7 v14z').replace('y1="34" x2="28"', 'y1="8" x2="28"'); d.appendChild(o); }
    host.appendChild(d); this.draw(null);
  }
  draw(p) { const k = this.pick(p); if (k === this.cur) return; this.cur = k; Object.keys(this.els).forEach(n => this.els[n].classList.toggle('on', n === k)); }
  /* Show one picture straight away; hit adds a short forward snap so a punch reads as movement */
  show(k, hit) {
    if (!this.els[k]) return;
    if (k !== this.cur) { this.cur = k; Object.keys(this.els).forEach(n => this.els[n].classList.toggle('on', n === k)); }
    const d = this.svg; d.classList.remove('hit'); if (hit && MOTION) { void d.offsetWidth; d.classList.add('hit'); }
  }
}
/* Picture for each punch in the round player */
const PUNCH_IMG = { 1:'box_jab', 2:'cross', 3:'box_leadhook', 4:'box_rearhook', 5:'box_leadupper', 6:'box_rearupper', slip:'def_slip', roll:'def_roll', back:'def_back', pivot:'box_pivot' };
const GUARD_IMG = 'box_pivot';
/* Decode the round pictures before the bell so the first punch never shows a blank */
function warmFigs(keys) { keys.forEach(k => { if (!FIGIMG[k]) return; const im = new Image(); im.src = FIGIMG[k]; if (im.decode) im.decode().catch(() => {}); }); }
const makeFig = (host, label, deco, key, glow) => key && IMGMAP[key] ? new ImgFig(host, label, key, glow, deco) : new Fig(host, label, deco);

/* =========================================================
   Poses
   ========================================================= */
const STAND = P({});
const GUARD = P({ t:6, a1:[25,125], a2:[15,145], l1:[16,22], l2:[-16,18], f2:-25, gl:1 });
const GUARD_DIP = P({ ...GUARD, t:9, l1:[24,38], l2:[-12,34], x:2 });
const GUARD_UP = P({ ...GUARD, t:3, l1:[14,16], l2:[-18,12], x:-2, f2:-35 });
const PZ = {
  '1': P({ ...GUARD, t:12, a1:[88,0], hit:1, hh:1, x:3 }),
  '2': P({ ...GUARD, t:22, a2:[86,0], l2:[-8,12], f2:-50, hit:1, hh:2, x:4 }),
  '3': P({ ...GUARD, t:2, a1:[85,70], hit:1, hh:1 }),
  '4': P({ ...GUARD, t:18, a2:[85,70], f2:-50, hit:1, hh:2 }),
  '5': P({ ...GUARD, t:2, a1:[45,110], l1:[18,24], hit:1, hh:1 }),
  '6': P({ ...GUARD, t:14, a2:[45,110], f2:-50, hit:1, hh:2 }),
  slip: P({ ...GUARD, t:26, l1:[26,36], l2:[-12,30] }),
  roll: P({ ...GUARD, t:34, l1:[40,64], l2:[-4,58] }),
  back: P({ ...GUARD, x:-18 }),
  pivot: P({ ...GUARD, t:2, l2:[-32,10], x:6 })
};
const LY = { t:-90, l1:[135,105], l2:[130,100], x:-6 };
const SEAT = { t:-30, l1:[125,95], l2:[125,95] };
const CEL1 = P({ v:'f', a1:[160,15], a2:[160,15], l1:[6,0], l2:[6,0], gl:1 });
const CEL2 = P({ v:'f', a1:[145,35], a2:[170,0], l1:[10,0], l2:[3,0], gl:1 });

const PUNCH = { 1:['Jab','Jab'], 2:['Straight','Straight'], 3:['Lead hook','Hook depan'], 4:['Rear hook','Hook belakang'], 5:['Lead uppercut','Uppercut depan'], 6:['Rear uppercut','Uppercut belakang'],
  slip:['Slip','Slip'], roll:['Roll','Roll'], back:['Step back','Mundur'], pivot:['Pivot','Pivot'] };
const PUNCH_HOW = {
  1:['Snap your lead hand straight out, turn the fist over at the end, and bring it straight back to your cheek.','Lontarkan tangan depan lurus, putar kepalan di ujung, lalu tarik kembali lurus ke pipi.'],
  2:['Push off your back foot, turn your rear hip and shoulder, and drive the rear hand straight. Back heel lifts.','Dorong dari kaki belakang, putar pinggul dan bahu belakang, pukul lurus dengan tangan belakang. Tumit belakang terangkat.'],
  3:['Lift your lead elbow to shoulder height, turn your lead hip and foot, and swing the fist in a short arc.','Angkat siku depan setinggi bahu, putar pinggul dan kaki depan, ayunkan kepalan dalam busur pendek.'],
  4:['Turn hard on your back foot and bring the rear fist around in a short arc, elbow up.','Putar kuat di kaki belakang dan ayunkan kepalan belakang dalam busur pendek, siku terangkat.'],
  5:['Dip slightly on your lead side, then drive up through your legs and bring the lead fist up under an imaginary chin.','Turunkan badan sedikit ke sisi depan, lalu dorong naik dari kaki dan angkat kepalan depan ke dagu bayangan.'],
  6:['Dip slightly, then turn your rear hip and drive the rear fist upward, palm facing you.','Turunkan badan sedikit, putar pinggul belakang dan dorong kepalan belakang ke atas, telapak menghadap kamu.'],
  slip:['Turn your shoulders slightly and move your head just off the center line, as if a straight punch is coming.','Putar bahu sedikit dan geser kepala keluar dari garis tengah, seolah ada pukulan lurus datang.'],
  roll:['Bend your knees and move your head in a U shape under an imaginary hook, guard tight.','Tekuk lutut dan gerakkan kepala membentuk huruf U di bawah hook bayangan, guard tetap rapat.'],
  back:['Push off the front foot and take one small step back. Guard stays up.','Dorong dari kaki depan dan mundur satu langkah kecil. Guard tetap naik.'],
  pivot:['Turn on the ball of your lead foot and swing your back foot around to change the angle.','Berputar di ujung kaki depan dan ayunkan kaki belakang untuk mengubah sudut.']
};
const PIV = { '2':'rear', '3':'lead', '4':'rear', '5':'lead', '6':'rear', pivot:'lead' };
const PATH = { 1:'M6 15 L50 15', 2:'M6 15 L50 15', 3:'M8 26 Q28 -6 50 14', 4:'M8 26 Q28 -6 50 14', 5:'M10 28 Q30 30 44 4', 6:'M10 28 Q30 30 44 4' };

const MOVES = {
  stance: { n:['Your stance','Kuda-kuda'], cue:['Feet shoulder-width, lead foot forward, back heel up. Knees soft, hands at your cheeks, chin down.','Kaki selebar bahu, kaki depan di depan, tumit belakang terangkat. Lutut sedikit ditekuk, tangan di pipi, dagu turun.'], f:[P({ gl:1 }), GUARD, GUARD_DIP, GUARD_UP, GUARD], seg:550, hold:450 },
  march: { n:['March in place','Jalan di tempat'], cue:['Lift your knees to hip height and swing your arms. Easy pace.','Angkat lutut setinggi pinggul dan ayunkan lengan. Santai saja.'], f:[P({ l1:[60,75], a1:[-25,60], a2:[30,60] }), P({ l2:[60,75], a1:[30,60], a2:[-25,60] })], seg:450, hold:80 },
  jacks: { n:['Jumping jacks','Jumping jack'], cue:['Jump your feet out as your arms go up, then back in. Land softly.','Lompat buka kaki sambil angkat tangan, lalu kembali. Mendarat pelan.'], f:[P({ v:'f', a1:[8,0], a2:[8,0], l1:[3,0], l2:[3,0] }), P({ v:'f', a1:[160,0], a2:[160,0], l1:[18,0], l2:[18,0] })], seg:320, hold:80 },
  reach: { n:['Step and reach','Langkah dan raih'], cue:['Step one foot out to the side and reach both arms overhead. Step back in. No jumping.','Langkahkan satu kaki ke samping dan raih ke atas dengan dua tangan. Kembali. Tanpa lompat.'], f:[P({ v:'f', a1:[8,0], a2:[8,0], l1:[3,0], l2:[3,0] }), P({ v:'f', a1:[165,0], a2:[165,0], l1:[3,0], l2:[20,0] })], seg:500, hold:150 },
  armcircle: { n:['Arm circles','Putar lengan'], cue:['Arms straight out to the sides. Small circles forward, then backward.','Rentangkan lengan ke samping. Putar kecil ke depan, lalu ke belakang.'], f:[P({ v:'f', a1:[90,0], a2:[90,0], l1:[6,0], l2:[6,0] }), P({ v:'f', a1:[106,0], a2:[106,0], l1:[6,0], l2:[6,0] }), P({ v:'f', a1:[90,0], a2:[90,0], l1:[6,0], l2:[6,0] }), P({ v:'f', a1:[74,0], a2:[74,0], l1:[6,0], l2:[6,0] })], seg:230, hold:0 },
  sidereach: { n:['Side reach','Raih ke samping'], cue:['Reach one arm overhead and lean to the side. Switch sides slowly.','Angkat satu tangan ke atas dan condongkan badan ke samping. Ganti sisi pelan-pelan.'], f:[P({ v:'f', t:-14, a1:[10,5], a2:[165,0], l1:[8,0], l2:[8,0] }), P({ v:'f', t:14, a1:[165,0], a2:[10,5], l1:[8,0], l2:[8,0] })], seg:1000, hold:400 },
  hips: { n:['Hip circles','Putar pinggul'], cue:['Hands on hips, feet wide. Draw big slow circles with your hips.','Tangan di pinggang, kaki terbuka. Putar pinggul besar dan pelan.'], f:[P({ v:'f', t:-8, a1:[45,-95], a2:[45,-95], l1:[10,0], l2:[10,0], x:4 }), P({ v:'f', t:8, a1:[45,-95], a2:[45,-95], l1:[10,0], l2:[10,0], x:-4 })], seg:800, hold:100 },
  legswing: { n:['Leg swings','Ayun kaki'], cue:['Hold a wall or chair. Swing one leg forward and back, relaxed. Switch legs halfway.','Pegang dinding atau kursi. Ayunkan satu kaki maju mundur dengan santai. Ganti kaki di tengah waktu.'], f:[P({ l1:[-30,5], a2:[85,0] }), P({ l1:[55,5], a2:[85,0] })], seg:600, hold:80 },
  squatbw: { n:['Bodyweight squats','Squat tanpa beban'], cue:['Arms forward for balance. Sit back and down, then stand tall. Slow and easy.','Tangan ke depan untuk keseimbangan. Duduk ke belakang lalu berdiri tegak. Pelan dan santai.'], f:[P({ a1:[80,0], a2:[80,0] }), P({ t:30, l1:[85,115], l2:[85,115], a1:[85,0], a2:[85,0] })], seg:900, hold:200 },
  bounce: { n:['Guard and bounce','Guard dan memantul'], cue:['Get in your stance and bounce lightly on the balls of your feet. Throw a few easy jabs.','Ambil kuda-kuda dan memantul ringan di ujung kaki. Lempar beberapa jab santai.'], f:[GUARD, GUARD_DIP, GUARD_UP, PZ['1'], GUARD, GUARD_DIP, GUARD_UP], seg:240, hold:60 },
  hamstring: { n:['Hamstring stretch','Peregangan paha belakang'], cue:['Feet together, knees soft. Fold forward slowly and let your arms hang. Breathe.','Kaki rapat, lutut sedikit ditekuk. Membungkuk pelan dan biarkan tangan menggantung. Tarik napas.'], f:[P({ t:20, l1:[5,4], l2:[5,4], a1:[20,0], a2:[20,0] }), P({ t:85, l1:[8,6], l2:[8,6], a1:[0,0], a2:[0,0] })], seg:1800, hold:1200 },
  quad: { n:['Quad stretch','Peregangan paha depan'], cue:['Hold a wall. Pull one heel toward your glutes, knees together. Switch legs halfway.','Pegang dinding. Tarik satu tumit ke arah bokong, lutut rapat. Ganti kaki di tengah waktu.'], f:[P({ l1:[-5,160], a1:[-35,10], a2:[80,0] }), P({ l1:[-10,165], a1:[-38,10], a2:[80,0] })], seg:1600, hold:800 },
  chest: { n:['Chest opener','Buka dada'], cue:['Open your arms wide and squeeze your shoulder blades together. It undoes all that punching.','Buka lengan lebar dan rapatkan tulang belikat. Melepas tegang setelah banyak memukul.'], f:[P({ v:'f', a1:[20,0], a2:[20,0], l1:[6,0], l2:[6,0] }), P({ v:'f', a1:[100,0], a2:[100,0], l1:[6,0], l2:[6,0] })], seg:1500, hold:900 },
  crossbody: { n:['Shoulder stretch','Peregangan bahu'], cue:['Pull one arm across your chest with the other hand. Switch sides halfway.','Tarik satu lengan menyilang dada dengan tangan lainnya. Ganti sisi di tengah waktu.'], f:[P({ v:'f', a1:[-70,0], a2:[30,-100], l1:[6,0], l2:[6,0] }), P({ v:'f', a1:[-78,0], a2:[34,-104], l1:[6,0], l2:[6,0] })], seg:1500, hold:900 },
  breathe: { n:['Deep breaths','Napas dalam'], cue:['Breathe in as your arms rise, out as they come down. Let your heart rate settle.','Tarik napas saat lengan naik, buang saat turun. Biarkan detak jantung turun.'], f:[P({}), P({ a1:[175,0], a2:[175,0] })], seg:3000, hold:600 }
};
