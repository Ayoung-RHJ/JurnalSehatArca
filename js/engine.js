/* =========================================================
   Plan logic
   ========================================================= */
const TYPES = {
  FBA: { n:['Full body A','Seluruh tubuh A'], g:['push','pull','legs','core'], ex:['goblet','floor_press','row1','rdl','press','plank'] },
  FBB: { n:['Full body B','Seluruh tubuh B'], g:['push','pull','legs','core'], ex:['lunge','pushup','rowbent','bridge','curl','deadbug'] },
  UPA: { n:['Upper body A','Tubuh atas A'], g:['push','pull'], ex:['floor_press','row1','press','curl','tri_oh','farmer'] },
  UPB: { n:['Upper body B','Tubuh atas B'], g:['push','pull'], ex:['pushup','rowbent','lateral','pullover','hammer','plank'] },
  LOA: { n:['Legs and core A','Kaki dan core A'], g:['legs','core'], ex:['goblet','rdl','bridge','calf','deadbug','twist'] },
  LOB: { n:['Legs and core B','Kaki dan core B'], g:['legs','core'], ex:['lunge','swing','bridge','calf','twist','plank'] },
  BOX: { n:['Boxing and core','Tinju dan core'], g:['core'], light:['push'], ex:['deadbug','twist','plank'], box:1 },
  MOB: { n:['Mobility and recovery','Mobilitas dan pemulihan'], g:[], ex:[] }
};
const GNAME = { push:['chest and shoulders','dada dan bahu'], pull:['back and arms','punggung dan lengan'], legs:['legs','kaki'], core:['core','core'] };
const LEVEL = { beginner:['beginner','pemula'], intermediate:['intermediate','menengah'], advanced:['advanced','mahir'] };
const SEQ = { 1:['FBA'], 2:['FBA','FBB'], 3:['FBA','BOX','FBB'], 4:['UPA','LOA','UPB','LOB'], 5:['UPA','LOA','BOX','UPB','LOB'], 6:['UPA','LOA','BOX','UPB','LOB','BOX'] };
const HARD = ['push','pull','legs'];
const GROUPS = [['push',['Chest, shoulders, triceps','Dada, bahu, trisep']],['pull',['Back, biceps, grip','Punggung, bisep, genggaman']],['legs',['Legs and glutes','Kaki dan bokong']],['core',['Core','Core']]];
function perms(a) { if (a.length < 2) return [a]; const out = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(r => out.push([x].concat(r)))); return out; }
function conflicts(map) {
  let n = 0;
  for (let d = 0; d < 7; d++) { const a = map[d], b = map[(d + 1) % 7]; if (a && b && TYPES[a].g.some(g => HARD.includes(g) && TYPES[b].g.includes(g))) n++; }
  return n;
}
function schedule(p) {
  if (ageGroup(p.age) === 'kid') { const map = {}; (p.days || []).forEach(d => { map[d] = 'PLAY'; }); return { map, conflicts:0 }; }
  const days = DOW.filter(d => (p.days || []).includes(d));
  let seq = SEQ[days.length] || [];
  if (days.length === 2 && ((days[1] - days[0] + 7) % 7 === 1 || (days[0] - days[1] + 7) % 7 === 1)) seq = ['UPA','LOA'];
  let best = null, bestN = 1e9; const seen = new Set();
  perms(seq).forEach(o => {
    const k = o.join(); if (seen.has(k)) return; seen.add(k);
    const map = {}; days.forEach((d, i) => { map[d] = o[i]; });
    const n = conflicts(map); if (n < bestN) { bestN = n; best = map; }
  });
  return { map:best || {}, conflicts:bestN === 1e9 ? 0 : bestN };
}
function weekNo(p = PROF) { const s = new Date(p.start + 'T00:00:00'), now = new Date(); now.setHours(0, 0, 0, 0); return Math.max(1, Math.floor((now - s) / 864e5 / 7) + 1); }
const PHASES = [
  { n:['Foundation','Fondasi'], d:['Learn the moves, light weights, build the habit.','Pelajari gerakan, beban ringan, bangun kebiasaan.'] },
  { n:['Build','Membangun'], d:['More sets and longer rounds. Add weight when sets feel easy.','Set lebih banyak dan ronde lebih panjang. Tambah beban kalau set terasa mudah.'] },
  { n:['Push','Tantangan'], d:['Your hardest weeks. More reps, faster combos.','Minggu terberatmu. Repetisi lebih banyak, kombo lebih cepat.'] },
  { n:['Recover and re-check','Pemulihan dan cek ulang'], d:['A lighter week so your body adapts. Redo your check-up at the end.','Minggu lebih ringan supaya badan beradaptasi. Ulangi cek awal di akhir minggu.'] }
];
function phaseOf(wk) { const c = ((wk - 1) % 9) + 1; const i = c <= 2 ? 0 : c <= 5 ? 1 : c <= 8 ? 2 : 3; return { i, c, n:L(PHASES[i].n), d:L(PHASES[i].d) }; }
const bmiOf = p => p.w && p.h ? p.w / Math.pow(p.h / 100, 2) : 0;
const bmiCat = b => b < 18.5 ? tt('below the healthy range','di bawah rentang sehat') : b < 25 ? tt('in the healthy range','dalam rentang sehat') : b < 30 ? tt('above the healthy range','di atas rentang sehat') : tt('well above the healthy range','jauh di atas rentang sehat');
const healthFlag = p => !!p.hq && Object.entries(p.hq).some(([k, v]) => v === 'yes' && (k !== 'preg' || p.sex === 'female'));
const isGentle = p => healthFlag(p) || !!(p.cfg && p.cfg.gentle === true) || (p.age >= 60 && !(p.cfg && p.cfg.gentle === false));
const lowImpact = p => isGentle(p) || bmiOf(p) >= 30 || (p.joints || []).includes('knee');
function avoidList(p) { const a = (p.joints || []).slice(); if (p.sex === 'female' && p.hq && p.hq.preg === 'yes') a.push('preg'); return a; }
function blocked(id, av) { const e = EX[id]; return (e.avoid || []).some(j => av.includes(j)) || (av.includes('preg') && !!(e.supine || e.prone || id === 'twist')); }
function exList(type, p) {
  const C = p.cfg || {}, excl = C.excl || [], swap = C.swap || {};
  let ids = TYPES[type].ex.slice();
  if ((p.goal === 'fat' || p.goal === 'fight') && (type === 'FBB' || type === 'LOB')) ids.splice(2, 0, 'thruster');
  const av = avoidList(p), bad = id => blocked(id, av) || excl.includes(id), out = [];
  ids = ids.map(id => { const w = swap[id]; return w && EX[w] && EX[w].g === EX[id].g && !bad(w) ? w : id; });
  ids.forEach(id => {
    if (!bad(id)) { if (!out.includes(id)) out.push(id); return; }
    const g = EX[id].g;
    const alt = Object.keys(EX).find(k => EX[k].g === g && !bad(k) && !out.includes(k) && !ids.includes(k)) || Object.keys(EX).find(k => EX[k].g === g && !bad(k) && !out.includes(k));
    if (alt) out.push(alt);
  });
  return out;
}
function suggestKg(id, p) {
  const sz = EX[id].sz; if (!sz) return 0;
  const T = { none:{ S:2, M:4, L:6 }, some:{ S:4, M:8, L:12 }, regular:{ S:6, M:12, L:18 } }[p.lift || 'none'];
  const kg = Math.max(1, Math.round(T[sz] * (p.sex === 'female' ? .7 : 1) * (p.age >= 55 ? .8 : 1) * (isGentle(p) ? .8 : 1)));
  return clamp(kg, p.kgMin || 1, Math.min(p.kgMax || 40, isTeen(p) ? 5 : 99));
}
const GOAL = {
  fat:    { n:['Lose fat','Turunkan lemak'], d:['More rounds, shorter rests, higher reps','Lebih banyak ronde, istirahat singkat, repetisi tinggi'], reps:14, rest:45 },
  muscle: { n:['Build muscle','Bangun otot'], d:['Heavier sets, longer rests, more volume','Beban lebih berat, istirahat lebih lama, volume lebih banyak'], reps:10, rest:75 },
  fight:  { n:['Boxing fitness','Kebugaran tinju'], d:['Speed, power and stamina for the ring','Kecepatan, tenaga, dan stamina untuk ring'], reps:12, rest:45 },
  learn:  { n:['Learn to box','Belajar tinju'], d:['Clean technique first, slower combo calls','Teknik rapi dulu, panggilan kombo lebih pelan'], reps:10, rest:60 },
  health: { n:['Stay healthy','Tetap sehat'], d:['A balanced plan to feel good and manage stress','Program seimbang supaya badan enak dan stres terkendali'], reps:12, rest:60 }
};
function boxLevel(p, ph) { if (p.box === 'regular') return 'advanced'; if (p.box === 'some') return ph.c <= 4 ? 'intermediate' : 'advanced'; return ph.c <= 4 ? 'beginner' : 'intermediate'; }
function buildSession(type, p, wk) {
  if (type === 'PLAY' || (ageGroup(p.age) === 'kid' && type !== 'MOB')) return playSession(p, wk);
  const T = TYPES[type], ph = phaseOf(wk), gentle = isGentle(p), G = GOAL[p.goal] || GOAL.health;
  const ix = { 20:0, 30:1, 45:2, 60:3 }[p.min] ?? 1, adj = p.adj || 0;
  const warm = ['march','armcircle','hips','squatbw','legswing','bounce'];
  if (ix >= 1) warm.splice(2, 0, 'sidereach');
  if (ix >= 2) warm.splice(1, 0, lowImpact(p) ? 'reach' : 'jacks');
  const C = p.cfg || {};
  const warmSecs = [40,45,45,55][ix] + Math.max(0, C.warmPlus || 0);
  const cool = C.cool === false ? [] : ['hamstring','quad','chest','crossbody','breathe'].slice(0, [3,4,5,5][ix]);
  let rounds = type === 'MOB' ? 0 : (T.box ? [5,7,9,12][ix] : [2,3,3,4][ix]);
  if (rounds) rounds = Math.max(1, rounds + adj - (ph.i === 3 && rounds > 2 ? 1 : 0));
  const rOv = T.box ? C.roundsBox : C.roundsMix;
  if (type !== 'MOB' && rOv != null) rounds = T.box ? Math.max(1, rOv) : rOv;
  const lenT = { none:[90,120,150,120], some:[120,150,180,120], regular:[150,180,180,150] }[p.box || 'none'];
  const len0 = gentle ? Math.min(C.len || lenT[ph.i], 120) : (C.len || lenT[ph.i]), level = capLvl(p, C.level || boxLevel(p, ph));
  const len = isTeen(p) ? Math.min(len0, 150) : len0;
  const box = rounds ? { rounds, len, rest:gentle ? Math.max(75, C.brest || 75) : (C.brest || 60), level, pace:{ beginner:5, intermediate:4, advanced:3 }[level] + (p.goal === 'learn' || isTeen(p) ? 1 : 0),
    burn:!gentle && !isTeen(p) && (p.goal === 'fat' || p.goal === 'fight') && ph.i >= 1, stance:p.box === 'none' && ph.c <= 2 } : null;
  const n = type === 'MOB' ? 0 : (T.box ? [2,2,3,3][ix] : [3,4,5,6][ix]);
  const sets0 = T.box ? 2 : [2,3,3,2][ph.i] + (p.goal === 'muscle' && ix >= 2 && ph.i < 3 ? 1 : 0);
  const reps0 = Math.max(6, G.reps + (ph.i === 2 ? 2 : 0) + adj * 2);
  const sets = isTeen(p) ? Math.min(3, C.sets || sets0) : (C.sets || sets0), reps = isTeen(p) ? clamp(C.reps || reps0, 10, 15) : (C.reps || reps0);
  const secs = Math.max(20, [30,40,45,30][ph.i] + adj * 5 - (gentle ? 10 : 0));
  const rest = (T.box ? 30 : G.rest) + (gentle ? 30 : 0), kgs = ps.get('weights', {});
  const ex = exList(type, p).slice(0, n).map(id => ({ id, sets, rest, reps:id === 'twist' ? Math.max(16, reps + 4) : reps, secs:EX[id].secs ? secs : 0, kg:kgs[id] || suggestKg(id, p) }));
  const lift = ex.reduce((a, e) => a + e.sets * ((e.secs || e.reps * (EX[e.id].side ? 2 : 1) * EX[e.id].tempo / 1000) + e.rest + 4), 0) + (ex.length ? 60 : 0);
  const est = warm.length * warmSecs + (box ? (box.stance ? 15 : 0) + box.rounds * box.len + (box.rounds - 1) * box.rest : 0) + lift + cool.length * 30;
  return { type, name:L(T.n), wk, phase:ph, gentle, warm, warmSecs, box, ex, cool, min:Math.round(est / 60) };
}
const sessionFor = (date, p = PROF) => { const t = schedule(p).map[date.getDay()]; return t ? buildSession(t, typeof fastAdj === 'function' ? fastAdj(p, date) : p, weekNo(p)) : null; };

/* Logs, per person */
const getLog = () => ps.get('log', []);
function addLog(e) { const l = getLog(); l.unshift(e); ps.set('log', l.slice(0, 400)); }
function streak() { const days = new Set(getLog().map(e => e.d)), d = new Date(); if (!days.has(dkey(d))) d.setDate(d.getDate() - 1); let n = 0; while (days.has(dkey(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
function weekDates() { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return Array.from({ length:7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x; }); }
function weekHTML() { const days = new Set(getLog().map(e => e.d)), t = dkey(new Date()); return '<div class="week">' + weekDates().map(x => { const k = dkey(x); return `<div class="day${days.has(k) ? ' on' : ''}${k === t ? ' now' : ''}">${dayLetter(x.getDay())}<i></i></div>`; }).join('') + '</div>'; }
/* Energy estimate: MET x body weight (kg) x hours, using standard MET values per session type */
const MET = { BOX:5.5, FBA:5, FBB:5, UPA:4.5, UPB:4.5, LOA:5, LOB:5, MOB:2.5 };
function wAt(d) { const l = getW(); let kg = null; l.forEach(x => { if (x.d <= d) kg = x.kg; }); return kg || (l[0] && l[0].kg) || (PROF && PROF.w) || 0; }
const kcalOf = e => e.kcal != null ? e.kcal : Math.round((e.met || MET[e.t] || 4.5) * wAt(e.d) * (e.min || 0) / 60);
function weekStats() { const keys = new Set(weekDates().map(dkey)), l = getLog().filter(e => keys.has(e.d));
  return { n:l.length, min:l.reduce((a, e) => a + (e.min || 0), 0), kcal:l.reduce((a, e) => a + kcalOf(e), 0), stars:l.reduce((a, e) => a + (e.stars || 0), 0), days:new Set(l.map(e => e.d)) }; }
const nfmt = n => Number(n).toLocaleString(LANG === 'id' ? 'id-ID' : 'en-US');
function tilesHTML(ws) {
  const t = (ic, lab, val, sub) => `<div class="tile"><div class="tile-h">${I(ic)}${lab}</div><b>${val}</b><small>${sub}</small></div>`;
  const st = streak();
  return `<div class="tiles">${t('flame', tt('Streak','Beruntun'), st, st === 1 ? tt('day','hari') : tt('days','hari'))}
    ${isKid() ? `<div class="tile"><div class="tile-h">${I('star', 'fillstar')}${tt('Stars','Bintang')}</div><b>${ws.stars}</b><small>${tt('this week','minggu ini')}</small></div>` : t('bolt', tt('Energy','Energi'), nfmt(ws.kcal), tt('kcal this week, est.','kkal minggu ini, perkiraan'))}
    ${t('clock', tt('Minutes','Menit'), ws.min, tt('this week','minggu ini'))}
    ${t('target', tt('Sessions','Sesi'), ws.n, tt('this week','minggu ini'))}</div>`;
}
const getW = () => ps.get('wlog', []);
function addW(kg) { const l = getW().filter(x => x.d !== dkey(new Date())); l.push({ d:dkey(new Date()), kg }); l.sort((a, b) => a.d < b.d ? -1 : 1); ps.set('wlog', l.slice(-104)); }
const curW = () => { const l = getW(); return l.length ? l[l.length - 1].kg : (PROF && PROF.w); };

/* =========================================================
   Phase 3: age groups, kids' play moves, quick and custom sessions
   ========================================================= */
const isTeen = p => ageGroup((p || PROF).age) === 'teen';
const isMinor = p => { const g = ageGroup((p || PROF).age); return g === 'kid' || g === 'teen'; };
const capLvl = (p, lv) => isTeen(p) && lv === 'advanced' ? 'intermediate' : lv;
Object.assign(MOVES, {
  starjump: { n:['Star jumps','Lompat bintang'], cue:['Jump out wide like a star, then back in. Land softly like a cat.','Lompat buka seperti bintang, lalu rapat lagi. Mendarat pelan seperti kucing.'], f:MOVES.jacks.f, seg:MOVES.jacks.seg, hold:MOVES.jacks.hold },
  frog: { n:['Frog squats','Squat katak'], cue:['Sit down low like a frog, then stand up tall.','Jongkok rendah seperti katak, lalu berdiri tegak.'], f:MOVES.squatbw.f, seg:MOVES.squatbw.seg, hold:MOVES.squatbw.hold },
  balloon: { n:['Punch the balloons','Pukul balon'], cue:['Hands up by your cheeks. Punch the balloons in front of you, left, right, left, right.','Tangan di pipi. Pukul balon di depanmu, kiri, kanan, kiri, kanan.'], f:[GUARD, PZ['1'], GUARD, PZ['2']], seg:300, hold:200 },
  hero: { n:['Superhero plank','Plank pahlawan'], cue:['On your forearms, body straight like a superhero flying. Knees down is fine.','Bertumpu di lengan bawah, badan lurus seperti pahlawan terbang. Lutut di lantai juga boleh.'], f:EX.plank.f, seg:1200, hold:600 },
  bug: { n:['Upside-down bug','Kumbang terbalik'], cue:['Lie on your back, arms and legs up. Slowly stretch one arm and the other leg out, then switch.','Berbaring, tangan dan kaki ke atas. Pelan-pelan luruskan satu tangan dan kaki seberangnya, lalu ganti.'], f:EX.deadbug.f, seg:1200, hold:300 },
  duck: { n:['Duck under the rope','Merunduk di bawah tali'], cue:['Bend your knees and duck under a pretend rope. Keep your hands up.','Tekuk lutut dan merunduk di bawah tali bayangan. Tangan tetap di atas.'], f:[GUARD, PZ.roll, GUARD], seg:420, hold:260 },
  stars: { n:['Reach for the stars','Raih bintang'], cue:['Step out and reach up as high as you can, then step back in.','Melangkah ke samping dan raih setinggi mungkin, lalu kembali.'], f:MOVES.reach.f, seg:MOVES.reach.seg, hold:MOVES.reach.hold }
});
const KIDPLAY = ['balloon','frog','starjump','duck','hero','bug','stars'];
const WARM_STD = ['march','armcircle','jacks','sidereach','hips','squatbw','legswing','bounce'];
const WARM_LOW = ['march','armcircle','reach','sidereach','hips','squatbw','legswing','bounce'];
const COOLS = ['hamstring','quad','chest','crossbody','breathe'];
const BW_OK = ['pushup','plank','deadbug','lunge','bridge','calf'];
GOAL.play = { n:['Play and move','Bermain dan bergerak'], d:['Fun boxing games and bodyweight play','Permainan tinju seru dan gerakan tanpa beban'], reps:10, rest:45 };
TYPES.PLAY = { n:['Play and box','Main dan tinju'], g:[], ex:[] };
MET.PLAY = 5;
function estSecs(s) {
  const lift = s.ex.reduce((a, e) => a + e.sets * ((e.secs || e.reps * (EX[e.id].side ? 2 : 1) * EX[e.id].tempo / 1000) + e.rest + 4), 0) + (s.ex.length ? 60 : 0);
  const play = s.play ? s.play.moves.length * s.play.laps * (s.play.secs + s.play.rest) + (s.box ? 30 : 0) : 0;
  return s.warm.length * s.warmSecs + (s.box ? (s.box.stance ? 15 : 0) + s.box.rounds * s.box.len + (s.box.rounds - 1) * s.box.rest : 0) + lift + play + s.cool.length * (s.coolSecs || 30);
}
const groupsOf = s => [...new Set(s.ex.map(e => EX[e.id].g).filter(g => HARD.includes(g)))];
/* Kids: play-based, bodyweight only, never more than 20 minutes */
function playSession(p, wk, min, custom) {
  const C = p.cfg || {}, M = Math.min(20, min || p.min || 20);
  const warm = ['march','armcircle','reach','squatbw','bounce'].slice(0, M <= 10 ? 4 : 5), warmSecs = 35 + Math.max(0, C.warmPlus || 0);
  const rounds = custom ? custom.rounds : (M >= 20 ? 3 : M >= 15 ? 2 : 1);
  const box = rounds ? { rounds, len:60, rest:30, level:'beginner', pace:6, burn:false, stance:!custom && wk <= 2 } : null;
  let moves = custom ? custom.moves.slice() : KIDPLAY.slice((wk - 1) % KIDPLAY.length).concat(KIDPLAY).slice(0, 5);
  const cool = (custom ? custom.cool === false : C.cool === false) ? [] : ['quad','crossbody','breathe'];
  const ses = { type:'PLAY', name:custom ? custom.name : L(TYPES.PLAY.n), wk, phase:phaseOf(wk), gentle:false, kid:true, warm, warmSecs, box, ex:[], cool, met:5,
    play:moves.length ? { moves, secs:30, laps:2, rest:15 } : null };
  while (ses.play && estSecs(ses) > M * 60 && ses.play.moves.length > 2) ses.play.moves.pop();
  if (ses.play && estSecs(ses) > M * 60) ses.play.laps = 1;
  while (ses.box && estSecs(ses) > M * 60 && ses.box.rounds > 1) ses.box.rounds--;
  ses.min = Math.round(estSecs(ses) / 60); ses.gr = [];
  return ses;
}
/* Build any session from explicit parts (quick workouts and My workouts) */
function makeSession(o, p) {
  const C = p.cfg || {}, gentle = isGentle(p), teen = isTeen(p), G = GOAL[p.goal] || GOAL.health, wk = weekNo(p), ph = phaseOf(wk), kgs = ps.get('weights', {});
  const warm = (lowImpact(p) ? WARM_LOW : WARM_STD).slice(0, Math.max(4, o.warmN || 5));
  const warmSecs = (gentle ? 45 : 40) + Math.max(0, C.warmPlus || 0);
  let len = o.len || (gentle ? 90 : 120); if (gentle) len = Math.min(len, 120); if (teen) len = Math.min(len, 150);
  const level = capLvl(p, o.level || boxLevel(p, ph));
  const box = o.rounds ? { rounds:o.rounds, len, rest:Math.max(gentle ? 75 : 30, o.brest || 60), level, pace:{ beginner:5, intermediate:4, advanced:3 }[level] + (teen || p.goal === 'learn' ? 1 : 0), burn:false, stance:false } : null;
  let sets = o.sets || 3, reps = o.reps || G.reps; if (teen) { sets = Math.min(sets, 3); reps = clamp(reps, 10, 15); }
  const rest = G.rest + (gentle ? 30 : 0);
  const ex = (o.ex || []).map(id => ({ id, sets, rest, reps:id === 'twist' ? Math.max(16, reps + 4) : reps, secs:EX[id].secs ? (gentle ? 30 : 40) : 0, kg:o.bw || !EX[id].sz ? 0 : (kgs[id] || suggestKg(id, p)) }));
  const cool = o.cool === false ? [] : COOLS.slice(0, o.coolN || 4);
  const ses = { type:o.type, name:o.name, wk, phase:ph, gentle, warm, warmSecs, box, ex, cool, coolSecs:o.coolSecs, met:o.met || 5 };
  ses.min = Math.round(estSecs(ses) / 60); ses.gr = groupsOf(ses);
  return ses;
}
const QFOCUS = { box:{ g:['core'], n:['Boxing','Tinju'], met:5.5 }, upper:{ g:['push','pull'], n:['Upper body','Tubuh atas'] }, lower:{ g:['legs'], n:['Lower body','Tubuh bawah'] },
  core:{ g:['core'], n:['Core','Core'] }, full:{ g:['push','pull','legs','core'], n:['Full body','Seluruh tubuh'] }, mob:{ g:[], n:['Mobility','Mobilitas'], met:2.5 } };
function qwPool(p, groups, bw) {
  const av = avoidList(p), excl = (p.cfg && p.cfg.excl) || [];
  const by = groups.map(g => Object.keys(EX).filter(k => EX[k].g === g && !blocked(k, av) && !excl.includes(k) && (!bw || BW_OK.includes(k))));
  const out = []; for (let i = 0; i < 8; i++) by.forEach(l => { if (l[i]) out.push(l[i]); });
  return out;
}
function quickSession(o, p) {
  if (isKid(p)) return Object.assign(playSession(p, weekNo(p), Math.min(20, o.min)), { type:'QUICK', name:tt('Quick play', 'Main singkat') });
  const f = QFOCUS[o.focus] || QFOCUS.full, T = o.min * 60, bw = o.eq === 'bw' || f === QFOCUS.mob, C = p.cfg || {};
  const name = tt(`Quick ${L(f.n).toLowerCase()}, ${o.min} min`, `${L(f.n)} singkat, ${o.min} menit`);
  const base = { type:'QUICK', name, met:f.met || 5, bw, cool:C.cool === false ? false : true, warmN:o.min <= 10 ? 4 : o.min <= 20 ? 5 : 7, coolN:o.min <= 10 ? 3 : 4, sets:o.min <= 15 ? 2 : 3 };
  if (f === QFOCUS.mob) {
    const s = makeSession(Object.assign(base, { cool:true, coolN:5 }), p);
    s.coolSecs = Math.max(30, Math.min(90, Math.floor((T - s.warm.length * s.warmSecs) / 5)));
    s.min = Math.round(estSecs(s) / 60); return s;
  }
  const pool = qwPool(p, f.g, bw);
  let rounds = f === QFOCUS.box ? 1 : (o.min >= 30 ? 2 : o.min >= 20 ? 1 : 0), n = f === QFOCUS.box ? Math.min(2, pool.length) : 1;
  const mk = () => makeSession(Object.assign({}, base, { rounds, ex:pool.slice(0, n) }), p);
  let s = mk();
  if (f === QFOCUS.box) { while (rounds < 12) { rounds++; const t = mk(); if (estSecs(t) > T + 60) { rounds--; break; } s = t; } }
  else { while (n < pool.length) { n++; const t = mk(); if (estSecs(t) > T + 60) { n--; break; } s = t; } }
  return mk();
}
function myWorkoutSession(w, p) {
  if (isKid(p)) return Object.assign(playSession(p, weekNo(p), 20, w), { type:'CUSTOM' });
  return makeSession({ type:'CUSTOM', name:w.name, rounds:w.rounds, len:w.len, brest:w.brest, ex:w.ex, sets:w.sets, reps:w.reps, cool:w.cool, bw:w.eq === 'bw', met:w.rounds && !w.ex.length ? 5.5 : 5 }, p);
}
/* 48-hour recovery check for anything outside the weekly plan */
function recentHard() {
  const cut = Date.now() - 48 * 3600e3, out = new Set();
  getLog().forEach(e => { if (e.ts < cut) return; (e.gr || (TYPES[e.t] ? TYPES[e.t].g.filter(g => HARD.includes(g)) : [])).forEach(g => out.add(g)); });
  return out;
}
function recoveryNote(groups) {
  const r = recentHard(), hit = groups.filter(g => r.has(g));
  if (!hit.length) return '';
  return `<div class="note">${tt(`You trained ${hit.map(g => L(GNAME[g])).join(' and ')} hard in the last 48 hours. Those muscles are still recovering, so pick another focus or keep it light.`, `Kamu melatih ${hit.map(g => L(GNAME[g])).join(' dan ')} dengan berat dalam 48 jam terakhir. Otot itu masih pulih, jadi pilih fokus lain atau buat ringan.`)}</div>`;
}
