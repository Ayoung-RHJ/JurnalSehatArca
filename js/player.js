/* =========================================================
   Session player
   ========================================================= */
let S = null;
const PL = $('#player');
const COMBOS = {
  beginner:['1','1-1','1-2','1-2-1','2-3','1-1-2','1-2-3','1-2-back','3-2'],
  intermediate:['1-2-3-2','1-6-3-2','3-2-3','1-2-slip-2','1-1-2-3','2-3-2','5-2','1-2-5-2','1-2-roll-2','4-3-2'],
  advanced:['1-2-3-2-5-2','1-2-roll-2-3-2','3-4-3-2','1-6-3-2-roll-2','slip-slip-2-3-2','1-2-3-roll-3-2','6-3-2-3','1-1-2-roll-2-3-2','1-2-pivot-2-3']
};
const poolFor = lv => lv === 'beginner' ? COMBOS.beginner : lv === 'intermediate' ? COMBOS.beginner.slice(2).concat(COMBOS.intermediate) : COMBOS.intermediate.concat(COMBOS.advanced);
const IDLE = [GUARD, GUARD_DIP, GUARD_UP, GUARD, P({ ...GUARD_DIP, x:-3 }), GUARD_UP];
function flatten(ses) {
  const out = [], w = ses.warm.length;
  ses.warm.forEach((id, i) => out.push({ k:'timed', blk:'warm', id, secs:ses.warmSecs, i, of:w, locked:true }));
  if (ses.box) {
    const b = ses.box;
    if (b.stance) out.push({ k:'timed', blk:'stance', id:'stance', secs:15 });
    for (let r = 1; r <= b.rounds; r++) { out.push({ k:'round', r, of:b.rounds, len:b.len, b }); if (r < b.rounds) out.push({ k:'brest', secs:b.rest, next:r + 1 }); }
  }
  if (ses.ex.length) {
    if (ses.box) out.push({ k:'rest', secs:60, grab:true });
    ses.ex.forEach((e, i) => {
      out.push({ k:'intro', e, i, of:ses.ex.length });
      for (let s = 1; s <= e.sets; s++) { out.push({ k:'set', e, s, i, of:ses.ex.length }); if (s < e.sets || i < ses.ex.length - 1) out.push({ k:'rest', secs:e.rest }); }
    });
  }
  if (ses.play) { const P = ses.play, n = P.moves.length * P.laps; let i = 0; if (ses.box) out.push({ k:'rest', secs:30 });
    for (let lap = 0; lap < P.laps; lap++) P.moves.forEach(id => { out.push({ k:'timed', blk:'play', id, secs:P.secs, i, of:n }); i++; if (i < n) out.push({ k:'rest', secs:P.rest }); }); }
  ses.cool.forEach((id, i) => out.push({ k:'timed', blk:'cool', id, secs:ses.coolSecs || 30, i, of:ses.cool.length }));
  out.push({ k:'finish' });
  return out;
}
function startSession(type, given) {
  audio(); keepAwake(true);
  const ses = given || buildSession(type, fastAdj(PROF, new Date()), weekNo());
  S = { ses, steps:flatten(ses), i:0, el:0, paused:false, last:performance.now(), fig:null, anim:null, timers:[], log:{ sets:0, rounds:0 }, started:Date.now(), logged:false };
  if (S.steps.some(x => x.k === 'round')) warmFigs(IMGMAP['scene:fight'][1]);
  PL.hidden = false; document.body.classList.add('locked');
  renderStep();
}
function setFig(host, frames, seg, hold, key, glow) { stopAnim(S.anim); S.fig = makeFig(host, '', null, key, glow); S.anim = play(new Anim(S.fig, frames, seg, hold, true)); }
const topBar = (left, right) => `<div class="run-top"><span>${left}</span><span>${right || ''}</span><button data-pl="end">${tt('End','Selesai')}</button></div>`;
const coachLine = () => `<div class="coachline">${coachAv()}<p id="plSay" aria-live="polite"></p></div>`;
function clearTimers() { (S.timers || []).forEach(clearTimeout); S.timers = []; }
function repState(st, el) {
  const x = EX[st.e.id], d = x.tempo, R = st.e.reps, sides = x.side ? 2 : 1, sw = 3500;
  let t = el - 2000, side = 1;
  if (t < 0) return { ph:'ready', pose:x.f[0] };
  if (t >= R * d) {
    if (sides === 1) return { ph:'done', pose:x.f[0] };
    if (t < R * d + sw) return { ph:'switch', pose:x.f[0] };
    t -= R * d + sw; side = 2;
    if (t >= R * d) return { ph:'done', pose:x.f[0] };
  }
  return { ph:'rep', rep:Math.floor(t / d) + 1, side, sides, R, pose:lerpPose(x.f[0], x.f[1], tri((t % d) / d)) };
}
function renderStep() {
  const st = S.steps[S.i], box = $('#plIn');
  clearTimers();
  Object.assign(S, { el:0, paused:false, bp:{}, mid:0, late:0, warned:0, burn:0, rep:null, sw:0, nextCall:2200, nextTalk:10000, animEnd:0, last:performance.now() });
  stopAnim(S.anim); S.anim = null; S.fig = null; PL.scrollTop = 0;
  if (st.k === 'timed') {
    const m = MOVES[st.id];
    PL.dataset.phase = st.blk === 'warm' ? 'warm' : st.blk === 'cool' ? 'cool' : st.blk === 'play' ? 'work' : 'lift';
    const label = st.blk === 'play' ? `${tt('Play','Main')} ${st.i + 1} ${tt('of','dari')} ${st.of}` : st.blk === 'warm' ? `${tt('Warm-up','Pemanasan')} ${st.i + 1} ${tt('of','dari')} ${st.of}` : st.blk === 'cool' ? `${tt('Cool-down','Pendinginan')} ${st.i + 1} ${tt('of','dari')} ${st.of}` : tt('Boxing','Tinju');
    box.innerHTML = topBar(label, st.locked ? I('lock') : '') + `<h2 class="pl-name">${L(m.n)}</h2><p class="pl-cue">${L(m.cue)}</p>
      ${st.id === 'stance' ? `<div class="pl-media"><div id="plFig"></div>${feetSVG(PROF.stance)}</div>` : '<div class="pl-fig" id="plFig"></div>'}
      <div class="clock" id="plClock">${fmt(st.secs)}</div>
      ${st.locked ? `<p class="pl-lock">${tt('The warm-up can’t be skipped. It protects your joints and muscles.','Pemanasan tidak bisa dilewati. Ini melindungi sendi dan ototmu.')}${S.ses.kid && S.i === 0 ? ' ' + tt('Train with a grown-up nearby.','Berlatih dengan orang dewasa di dekatmu.') : ''}</p>` : ''}
      ${coachLine()}
      <div class="ctrl ${st.locked ? 'one' : ''}"><button data-pl="pause">${tt('Pause','Jeda')}</button>${st.locked ? '' : `<button data-pl="skip">${tt('Skip','Lewati')}</button><button data-pl="end">${tt('End','Selesai')}</button>`}</div>`;
    setFig($('#plFig'), m.f, m.seg, m.hold, 'move:' + st.id);
    const pre = S.i === 0 ? tt(`Hi ${PROF.name}. ${S.ses.name} today. ${S.ses.kid ? 'Make sure a grown-up is nearby. ' : ''}Warm-up first. `, `Hai ${PROF.name}. Hari ini ${S.ses.name}. ${S.ses.kid ? 'Pastikan ada orang dewasa di dekatmu. ' : ''}Pemanasan dulu. `) : '';
    say(`${pre}${L(m.n)}. ${L(m.cue)}`, { rate:1.02 });
  } else if (st.k === 'round') {
    PL.dataset.phase = 'work';
    box.innerHTML = topBar(`${tt('Round','Ronde')} ${st.r} ${tt('of','dari')} ${st.of}`, tt('Fight','Tarung')) + `<div class="pl-media"><div id="plFig"></div><div id="plFeet">${feetSVG(PROF.stance)}</div></div>
      <div class="clock big" id="plClock">${fmt(st.len)}</div><div class="combo" id="plCombo" aria-live="polite"><div class="msg">${tt('Round','Ronde')} ${st.r}</div></div>
      ${coachLine()}<div class="ctrl"><button data-pl="pause">${tt('Pause','Jeda')}</button><button data-pl="skip">${tt('Skip','Lewati')}</button><button data-pl="end">${tt('End','Selesai')}</button></div>`;
    setFig($('#plFig'), IDLE, 230, 40, 'scene:fight');
    if (S.fig && S.fig.svg) S.fig.svg.classList.toggle('mirror', PROF.stance === 'southpaw');
    bell(1);
  } else if (st.k === 'brest' || st.k === 'rest') {
    PL.dataset.phase = 'rest';
    const nx = S.steps[S.i + 1], prev = S.steps[S.i - 1];
    let next = '';
    if (st.k === 'brest') next = `${tt('Up next','Berikutnya')}<b>${tt('Round','Ronde')} ${st.next}</b>`;
    else if (nx && nx.k === 'intro') next = `${tt('Up next','Berikutnya')}<b>${EX[nx.e.id].n}</b>`;
    else if (nx && nx.k === 'set') next = `${tt('Up next','Berikutnya')}<b>${EX[nx.e.id].n}</b>Set ${nx.s} ${tt('of','dari')} ${nx.e.sets}${nx.e.kg && EX[nx.e.id].sz ? ', ' + nx.e.kg + ' kg' : ''}`;
    else if (nx && nx.k === 'timed') next = `${tt('Up next','Berikutnya')}<b>${nx.blk === 'play' ? L(MOVES[nx.id].n) : tt('Cool-down','Pendinginan')}</b>`;
    const fig = st.k === 'brest' ? '' : (nx && (nx.k === 'set' || nx.k === 'intro') ? `<div class="pl-fig" id="plFig" style="width:min(44vw,180px)"></div>` : '');
    box.innerHTML = topBar(st.k === 'brest' ? tt('Boxing','Tinju') : S.ses.kid ? tt('Play','Main') : tt('Strength','Kekuatan'), st.grab ? tt('Grab your dumbbells','Ambil dumbbell') : tt('Rest','Istirahat')) + fig + `<div class="clock big" id="plClock">${fmt(st.secs)}</div>
      <p class="next-up">${next}</p>${coachLine()}<div class="ctrl"><button data-pl="pause">${tt('Pause','Jeda')}</button><button data-pl="more">+15 ${tt('s','dtk')}</button><button data-pl="skip">${tt('Skip rest','Lewati')}</button></div>`;
    if (fig) setFig($('#plFig'), EX[nx.e.id].f, EX[nx.e.id].tempo / 2 - 150, 300, 'ex:' + nx.e.id);
    if (st.k === 'brest') S.timers.push(setTimeout(() => { if (S && S.steps[S.i] === st) say(line('rest')); }, 900));
    else if (st.grab) say(tt('Great boxing. Grab your dumbbells.', 'Tinju yang bagus. Ambil dumbbell kamu.'));
    else if (prev && prev.k === 'set') say(line('done'));
    else if (prev && prev.blk === 'play') say(pick(L([['Great job!','Super!','Nice moves!'],['Hebat!','Keren!','Gerakan bagus!']])) + (nx && nx.blk === 'play' ? ' ' + tt('Next: ','Berikutnya: ') + L(MOVES[nx.id].n) : ''));
  } else if (st.k === 'intro') {
    const e = st.e, x = EX[e.id];
    PL.dataset.phase = 'lift';
    box.innerHTML = topBar(`${tt('Strength','Kekuatan')} ${st.i + 1} ${tt('of','dari')} ${st.of}`, '') + `<h2 class="pl-name">${x.n}</h2>
      <div class="pl-media"><div class="figbox" id="plFig"></div><div>${mmap(x.m, x.s)}</div></div>${mmKey(x.m, x.s)}
      <ol class="pl-how">${L(x.how).map(h => `<li>${h}</li>`).join('')}</ol>
      <p class="pl-plan">${e.sets} set × ${e.secs ? e.secs + tt(' seconds',' detik') : e.reps + tt(' reps',' repetisi') + (x.side ? tt(' each side',' per sisi') : '')}, ${tt('rest','istirahat')} ${e.rest} ${tt('s','dtk')}</p>
      ${x.sz && e.kg ? `<div class="weight"><button data-pl="w-" aria-label="${tt('Less weight','Kurangi beban')}">−</button><output id="plKg">${e.kg} kg</output><button data-pl="w+" aria-label="${tt('More weight','Tambah beban')}">+</button></div>` : ''}
      ${coachLine()}<button class="wide" data-pl="go">${tt('Start set 1','Mulai set 1')}</button>`;
    setFig($('#plFig'), x.f, x.tempo / 2 - 150, 300, 'ex:' + e.id, true);
    say(tt(`Next: ${x.n}. ${L(x.cue)}`, `Berikutnya: ${x.n}. ${L(x.cue)}`));
  } else if (st.k === 'set') {
    const e = st.e, x = EX[e.id];
    PL.dataset.phase = 'work';
    box.innerHTML = topBar(x.n, `Set ${st.s} ${tt('of','dari')} ${e.sets}`) + `<div class="pl-fig" id="plFig"></div>
      <div class="clock big" id="plClock">${e.secs ? fmt(e.secs) : '0'}</div>
      <p class="pl-sub" id="plSub">${e.secs ? tt('Hold it','Tahan') : tt(`Get ready. ${e.reps} reps${x.side ? ' each side' : ''}`, `Bersiap. ${e.reps} repetisi${x.side ? ' per sisi' : ''}`)}${e.kg && x.sz ? `, ${e.kg} kg` : ''}</p>
      ${coachLine()}<div class="ctrl"><button data-pl="pause">${tt('Pause','Jeda')}</button><button data-pl="done">${tt('Done','Selesai set')}</button><button data-pl="end">${tt('End','Selesai')}</button></div>`;
    if (e.secs) setFig($('#plFig'), x.f, 1200, 600, 'ex:' + e.id);
    else {
      S.fig = makeFig($('#plFig'), x.n, null, 'ex:' + e.id); S.fig.draw(x.f[0]);
      S.anim = play({ fig:S.fig, custom:now => repState(st, S.el + (S.paused ? 0 : Math.max(0, now - S.last))).pose });
    }
    say(st.s === 1 ? line('set') : `Set ${st.s}. ${line('set')}`);
  } else if (st.k === 'finish') finishSession(true);
}
function next() { hush(); S.i++; if (S.i >= S.steps.length) return; renderStep(); }
function setClock(rem) { const c = $('#plClock'); if (c) c.textContent = fmt(rem); }
function beeps(rem) { const s = Math.ceil(rem); if (s <= 3 && s >= 1 && !S.bp[s]) { S.bp[s] = 1; beep(); } }
function chipsFor(parts) {
  const st = PROF.stance;
  return parts.map((p, i) => isNaN(p) ? `<span class="chip def" data-ci="${i}"><b>${L(PUNCH[p])}</b><small>&nbsp;</small></span>`
    : `<span class="chip" data-ci="${i}"><b>${p}</b><small>${L(PUNCH[p])}<br>${((+p % 2 === 1) !== (st === 'southpaw')) ? tt('Left','Kiri') : tt('Right','Kanan')}</small></span>`).join('');
}
function callCombo(st) {
  const pool = poolFor(st.b.level); let c;
  do { c = pick(pool); } while (pool.length > 1 && c === S.lastCombo);
  S.lastCombo = c;
  const parts = c.split('-'), combo = $('#plCombo');
  combo.innerHTML = chipsFor(parts);
  if (PROF.calls === 'numbers') say(parts.map(p => isNaN(p) ? L(PUNCH[p]) : p).join(', '), { rate:1.15, quiet:true });
  else if (PROF.calls === 'names') say(parts.map(p => L(PUNCH[p])).join(', '), { rate:1.15, quiet:true });
  clearTimers();
  const chipsOff = () => { combo.querySelectorAll('.chip').forEach(ch => ch.classList.remove('now')); const f = $('#plFeet'); if (f) f.innerHTML = feetSVG(PROF.stance); };
  let total;
  if (S.fig && S.fig.show) {
    /* Picture sequencer: one picture per punch at the pace of the call, the chip and feet change at the same moment */
    const step = { beginner:600, intermediate:480 }[st.b.level] || 420, lead = 200, hitFor = Math.round(step * .62);
    stopAnim(S.anim); S.anim = null; S.fig.show(GUARD_IMG);
    parts.forEach((p, i) => {
      const t = lead + i * step;
      S.timers.push(setTimeout(() => {
        if (!S || S.steps[S.i] !== st) return;
        S.fig.show(PUNCH_IMG[p] || GUARD_IMG, true);
        combo.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('now', ch.dataset.ci === String(i)));
        const f = $('#plFeet'); if (f) f.innerHTML = feetSVG(PROF.stance, PIV[p]);
      }, t));
      S.timers.push(setTimeout(() => { if (S && S.steps[S.i] === st) S.fig.show(GUARD_IMG); }, t + hitFor));
    });
    total = lead + parts.length * step;
    S.timers.push(setTimeout(() => { if (S && S.steps[S.i] === st) chipsOff(); }, total + 100));
  } else {
    const seg = st.b.level === 'beginner' ? 280 : 230, hold = st.b.level === 'beginner' ? 180 : 130, per = seg + hold;
    const frames = [GUARD]; parts.forEach(p => { frames.push(PZ[p]); frames.push(GUARD); });
    stopAnim(S.anim); S.anim = play(new Anim(S.fig, frames, seg, hold, false)); total = S.anim.dur;
    parts.forEach((p, i) => {
      S.timers.push(setTimeout(() => {
        if (!S || S.steps[S.i] !== st) return;
        combo.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('now', ch.dataset.ci === String(i)));
        const f = $('#plFeet'); if (f) f.innerHTML = feetSVG(PROF.stance, PIV[p]);
      }, (2 * i) * per + hold));
    });
    S.timers.push(setTimeout(() => { if (S && S.steps[S.i] === st) chipsOff(); }, total + 100));
  }
  S.animEnd = performance.now() + total + 150;
  S.nextCall = S.el + Math.max(st.b.pace * 1000, total + 700) + (Math.random() * 1000 - 500);
}
function finishSet() { S.log.sets++; ding(); next(); }

function ptick() {
  if (!S) return;
  const now = performance.now(), dt = Math.min(1000, now - S.last); S.last = now;
  if (S.paused || PL.hidden) return;
  const st = S.steps[S.i]; if (!st) return;
  S.el += dt; const el = S.el;
  if (st.k === 'timed') {
    const rem = st.secs - el / 1000; setClock(rem); beeps(rem);
    if (!S.mid && el > st.secs * 550 && st.blk === 'warm') { S.mid = 1; say(line('warm')); }
    if (['legswing','quad','crossbody'].includes(st.id) && !S.sw && el > st.secs * 500) { S.sw = 1; say(tt('Switch sides','Ganti sisi')); }
    if (rem <= 0) { beep(true); next(); }
  } else if (st.k === 'round') {
    const rem = st.len - el / 1000, ph = rem <= 10 ? 'warn' : 'work';
    if (PL.dataset.phase !== ph) PL.dataset.phase = ph;
    setClock(rem);
    if (S.animEnd && now > S.animEnd && !S.burn) { S.animEnd = 0; stopAnim(S.anim); S.anim = play(new Anim(S.fig, IDLE, 230, 40)); }
    if (rem <= 10 && !S.warned) { S.warned = 1; clap(); }
    if (rem <= 30 && rem > 20 && !S.late && st.len > 60) { S.late = 1; S.nextCall = el + 2600; say(line('late')); }
    if (st.b.burn && rem <= 20 && !S.burn) {
      S.burn = 1; clearTimers(); $('#plCombo').innerHTML = `<div class="msg">${tt('Burnout! Fast 1-2s to the bell','Burnout! 1-2 cepat sampai bel')}</div>`; say(tt('Burnout! Fast one twos!','Burnout! Satu dua cepat!'));
      stopAnim(S.anim); S.animEnd = 0;
      if (S.fig && S.fig.show) { let n = 0; S.anim = null; S.timers.push(setInterval(() => { if (!S || S.paused) return; S.fig.show(PUNCH_IMG[n++ % 2 ? 2 : 1], true); }, 260)); }
      else S.anim = play(new Anim(S.fig, [GUARD, PZ['1'], GUARD, PZ['2']], 120, 30));
    }
    if (!S.burn && el >= S.nextCall && rem > 2.5) {
      const gap = { calm:28000, steady:20000, hard:14000 }[S.ses.gentle ? 'calm' : (PROF.push || 'steady')];
      if (el >= S.nextTalk) { say(line('round')); S.nextTalk = el + gap; S.nextCall = el + 2400; } else callCombo(st);
    }
    if (rem <= 0) { S.log.rounds++; bell(1); next(); }
  } else if (st.k === 'brest' || st.k === 'rest') {
    const rem = st.secs - el / 1000; setClock(rem); beeps(rem);
    if (rem <= 0) { beep(true); next(); }
  } else if (st.k === 'set') {
    const e = st.e, x = EX[e.id];
    if (e.secs) {
      const rem = e.secs - el / 1000; setClock(rem); beeps(rem);
      if (!S.mid && rem <= e.secs / 2) { S.mid = 1; say(line('hold')); }
      if (!S.late && rem <= 10 && e.secs > 15) { S.late = 1; say(line('push')); }
      if (rem <= 0) finishSet();
      return;
    }
    const r = repState(st, el);
    if (r.ph === 'done') return finishSet();
    if (r.ph === 'switch') { if (!S.sw) { S.sw = 1; say(tt('Switch sides','Ganti sisi')); $('#plClock').innerHTML = I('swap'); $('#plSub').textContent = tt(`Switch sides. ${e.reps} more reps.`, `Ganti sisi. ${e.reps} repetisi lagi.`); } return; }
    if (r.ph !== 'rep') return;
    const key = r.side * 100 + r.rep;
    if (S.rep !== key) {
      S.rep = key; $('#plClock').textContent = r.rep;
      if (r.rep === 1) $('#plSub').textContent = tt(`of ${r.R} reps`, `dari ${r.R} repetisi`) + (r.sides === 2 ? (r.side === 1 ? tt(', first side',', sisi pertama') : tt(', second side',', sisi kedua')) : '') + (e.kg && x.sz ? `, ${e.kg} kg` : '');
      const left = r.R - r.rep;
      if (left === 2) say(line('push'));
      else if (left === 0 && r.side === r.sides && PROF.push === 'hard' && !S.ses.gentle) say(tt('Last one! Everything you’ve got!','Terakhir! Keluarkan semua tenagamu!'));
      else say(String(r.rep), { rate:1.25 });
    }
  }
}
setInterval(ptick, 100);

PL.addEventListener('click', e => {
  const b = e.target.closest('[data-pl]'); if (!b || !S) return;
  const a = b.dataset.pl, st = S.steps[S.i];
  if (a === 'pause') { S.paused = !S.paused; hush(); b.textContent = S.paused ? tt('Resume','Lanjut') : tt('Pause','Jeda'); S.last = performance.now(); return; }
  if (a === 'skip') { if (st.locked) return; next(); return; }
  if (a === 'more') { st.secs += 15; return; }
  if (a === 'done') return finishSet();
  if (a === 'go') return next();
  if (a === 'w-' || a === 'w+') {
    const ex = st.e, w = clamp(ex.kg + (a === 'w+' ? 1 : -1), 1, isTeen(PROF) ? 8 : 80);
    S.steps.forEach(s => { if (s.e && s.e.id === ex.id) s.e.kg = w; });
    const all = ps.get('weights', {}); all[ex.id] = w; ps.set('weights', all);
    $('#plKg').textContent = w + ' kg'; return;
  }
  if (a === 'end') { if (st.k === 'finish' || S.logged) return closePlayer(); if (confirm(tt('End this session now? Your finished work is saved.','Akhiri sesi sekarang? Latihan yang sudah selesai tetap tersimpan.'))) finishSession(false); return; }
  if (a === 'feel') {
    const f = b.dataset.f, l = getLog();
    if (l[0] && l[0].ts === S.logTs) { l[0].feel = f; ps.set('log', l); }
    if (!S.felt) { PROF.adj = clamp((PROF.adj || 0) + (f === 'easy' ? 1 : f === 'hard' ? -1 : 0), -2, 2); saveProf(); S.felt = f; }
    PL.querySelectorAll('[data-pl="feel"]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#feelNote').textContent = f === 'easy' ? tt('Got it. Your next session gets a little harder.','Oke. Sesi berikutnya sedikit lebih berat.') : f === 'hard' ? tt('Got it. Your next session eases off a little.','Oke. Sesi berikutnya sedikit lebih ringan.') : tt('Perfect. We keep building at this pace.','Pas. Kita lanjut dengan tempo ini.');
    return;
  }
  if (a === 'close') closePlayer();
});
function finishSession(complete) {
  hush(); clearTimers(); stopAnim(S.anim); keepAwake(false);
  const min = Math.max(1, Math.round((Date.now() - S.started) / 60000)), warmDone = S.i >= S.ses.warm.length;
  const stars = S.ses.kid ? (warmDone ? 1 : 0) + (S.i >= Math.floor(S.steps.length / 2) ? 1 : 0) + (complete ? 1 : 0) : 0;
  if (!S.logged && (warmDone || S.log.sets || S.log.rounds)) { S.logTs = Date.now(); addLog({ ts:S.logTs, d:dkey(new Date()), t:TYPES[S.ses.type] ? S.ses.type : '', title:S.ses.name, min, r:S.log.rounds, s:S.log.sets, early:!complete, gr:S.ses.gr, met:S.ses.met, stars:stars || undefined }); }
  S.logged = true;
  if (complete) { bell(3); setTimeout(() => { if (S) say(tt(`Session done, ${PROF.name}. `, `Sesi selesai, ${PROF.name}. `) + line('done')); }, 1600); }
  PL.dataset.phase = 'lift';
  $('#plIn').innerHTML = `<div class="finish"><div class="art-fig">${figHost('scene', 'celebrate', '')}</div><h2>${complete ? tt('Done','Selesai') : tt('Stopped','Berhenti')}</h2>
    ${S.ses.kid ? `<div class="stars-row" role="img" aria-label="${stars} ${tt('stars','bintang')}">${[1,2,3].map(n => I('star', n <= stars ? 'got' : '')).join('')}</div><p>${tt(`You earned ${stars} ${stars === 1 ? 'star' : 'stars'}!`, `Kamu dapat ${stars} bintang!`)}</p>` : `<p>${min} ${tt('minutes','menit')}. ${S.log.rounds} ${tt('rounds','ronde')}, ${S.log.sets} set.</p>`}
    ${coachLine()}
    ${finishDalil(complete)}
    <p><b>${tt('How did that feel?','Bagaimana rasanya?')}</b></p>
    <div class="feel"><button data-pl="feel" data-f="easy">${tt('Too easy','Terlalu mudah')}</button><button data-pl="feel" data-f="right">${tt('Just right','Pas')}</button><button data-pl="feel" data-f="hard">${tt('Too hard','Terlalu berat')}</button></div>
    <p class="small" id="feelNote" aria-live="polite"></p>
    <button class="btn primary block" data-pl="close">${tt('Back to home','Kembali ke beranda')}</button></div>`;
  mountFigs($('#plIn'));
  S.steps = [{ k:'finish' }]; S.i = 0;
}
function closePlayer() {
  hush(); if (S) { clearTimers(); stopAnim(S.anim); } keepAwake(false); S = null; PL.hidden = true; document.body.classList.remove('locked');
  if (location.hash !== '#home') location.hash = '#home'; else route();
}
