/* =========================================================
   Jurnal Sehat Kita: other activities, puasa check-in and stats, daily reminders
   Activities live in the same per-person log as guided sessions (kind:'act'),
   so streaks, weekly minutes, energy and the calendar count them automatically.
   ========================================================= */
Object.assign(IP, {
  run:'<circle cx="14.5" cy="4.5" r="1.9"/><path d="m8 21 3-5.5 3 2.5V22M6 12.5l3-3.5 4 .5 2.5 3 3 .5M11 15.5l2-6"/>',
  waves:'<path d="M3 9c1.5 0 1.5-1.2 3-1.2S7.5 9 9 9s1.5-1.2 3-1.2S13.5 9 15 9s1.5-1.2 3-1.2S19.5 9 21 9M3 14c1.5 0 1.5-1.2 3-1.2S7.5 14 9 14s1.5-1.2 3-1.2 1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2M3 19c1.5 0 1.5-1.2 3-1.2S7.5 19 9 19s1.5-1.2 3-1.2 1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2"/>',
  bike:'<circle cx="6" cy="16" r="3.6"/><circle cx="18" cy="16" r="3.6"/><path d="M6 16 9.5 9h5l3.5 7M9.5 9 12 16h-6M13 5.5h2.5l-1 3.5"/>',
  ball:'<circle cx="12" cy="12" r="8.5"/><path d="m12 7.5 3.5 2.5-1.3 4h-4.4L8.5 10ZM12 3.5v4M15.5 10l4.3-1.2M14.2 14l2.6 4.2M9.8 14l-2.6 4.2M8.5 10 4.2 8.8"/>',
  shuttle:'<path d="M14.5 9.5 20 4M9 15l-4 4.5M8.2 11.8l4 4 5.3-8.5-.8-.8Z"/><circle cx="7" cy="17" r="2.6"/>',
  book:'<path d="M4 5.5A2 2 0 0 1 6 3.5h13.5v15H6a2 2 0 0 0-2 2Z"/><path d="M4 20.5a2 2 0 0 0 2 2h13.5v-4M8.5 8h7M8.5 11.5h5"/>',
  award:'<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.4-1.6 7.1 5-2.6 5 2.6-1.6-7.1M12 6.5l.8 1.6 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3Z"/>',
  edit:'<path d="M4 20h4.2L19.5 8.7a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8Z"/><path d="m13.8 6 4.2 4.2"/>',
  trash:'<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14M10 10.5v6.5M14 10.5v6.5"/>',
  route:'<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18h7.3a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6h7.3"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
});

/* ---------- Activities ---------- */
const ACTS = [
  { k:'run',   n:['Running','Lari'], ic:'run', dist:'km', met:9.8 },
  { k:'walk',  n:['Walking','Jalan kaki'], ic:'feet', dist:'km', met:3.5 },
  { k:'swim',  n:['Swimming','Renang'], ic:'waves', dist:'m', met:7 },
  { k:'bike',  n:['Cycling','Bersepeda'], ic:'bike', dist:'km', met:7.5 },
  { k:'badm',  n:['Badminton','Bulu tangkis'], ic:'shuttle', met:5.5 },
  { k:'futsal',n:['Futsal or football','Futsal atau sepak bola'], ic:'ball', met:7 },
  { k:'senam', n:['Aerobics','Senam'], ic:'stretch', met:5 },
  { k:'yoga',  n:['Yoga or stretching','Yoga atau peregangan'], ic:'stretch', met:2.5 },
  { k:'other', n:['Other','Lainnya'], ic:'heart', met:4 }
];
const actOf = k => ACTS.find(a => a.k === k) || ACTS[ACTS.length - 1];
/* Estimated kcal: run and walk use speed when a distance is given (ACSM equations), others a MET value */
function actKcalEst(at, min, dist, kg) {
  const a = actOf(at); kg = kg || curW() || 60; let met = a.met;
  if (dist && min && (at === 'run' || at === 'walk')) {
    const v = dist * 1000 / min;            // metres per minute
    met = at === 'run' ? (0.2 * v + 3.5) / 3.5 : (0.1 * v + 3.5) / 3.5;
    met = clamp(met, 2, 18);
  }
  return Math.round(met * kg * (min || 0) / 60);
}
const actTitle = e => e.name ? e.name : L(actOf(e.at).n);
const paceTxt = e => (e.at === 'run' || e.at === 'walk') && e.dist && e.min ? (() => { const p = e.min / e.dist, m = Math.floor(p), s = Math.round((p - m) * 60); return `${m}:${pad(s === 60 ? 0 : s)} /km`; })() : '';
const distTxt = e => e.dist ? (actOf(e.at).dist === 'm' ? `${nfmt(Math.round(e.dist))} m` : `${String(+e.dist.toFixed(2)).replace('.', LANG === 'id' ? ',' : '.')} km`) : '';
const numIn = v => { const n = parseFloat(String(v || '').replace(',', '.')); return isFinite(n) ? n : null; };

let AF = null;   // activity form state
function openAct(ts) {
  const e = ts ? getLog().find(x => x.ts === ts && x.kind === 'act') : null;
  AF = e ? { ts:e.ts, at:e.at, name:e.name || '', d:e.d, min:e.min, dist:e.dist || '', kcal:e.kest ? '' : (e.kcal ?? ''), hr:e.hr || '', note:e.note || '', edit:true }
    : { at:'run', name:'', d:dkey(new Date()), min:'', dist:'', kcal:'', hr:'', note:'' };
  $('#actSheet').hidden = false; document.body.classList.add('locked'); renderAct();
  setTimeout(() => { const f = $('#acIn [data-at][aria-pressed="true"]'); if (f) f.focus(); }, 40);
}
function closeAct() { $('#actSheet').hidden = true; document.body.classList.remove('locked'); AF = null; }
function renderAct(err) {
  const a = actOf(AF.at), est = AF.min ? actKcalEst(AF.at, numIn(AF.min), a.dist === 'm' ? null : numIn(AF.dist)) : 0;
  $('#acIn').innerHTML = `<div class="sheet-top"><button class="icon-btn" data-ac="close" aria-label="${tt('Close','Tutup')}">${I('close')}</button></div>
    <h1 class="h1">${AF.edit ? tt('Edit activity','Ubah aktivitas') : tt('Log an activity','Catat aktivitas')}</h1>
    <p class="lede">${tt('Running, swimming, walking, sport with friends: everything counts toward your week.','Lari, renang, jalan kaki, olahraga bareng teman: semuanya dihitung untuk minggumu.')}</p>
    <div class="act-types" role="group" aria-label="${tt('Activity','Aktivitas')}">${ACTS.map(x => `<button data-at="${x.k}" aria-pressed="${x.k === AF.at}">${I(x.ic)}<span>${L(x.n)}</span></button>`).join('')}</div>
    <div class="fields act-f">
      ${AF.at === 'other' ? `<label class="field"><span class="lbl">${tt('Name','Nama aktivitas')}</span><input class="inp" id="afName" maxlength="40" value="${esc(AF.name)}" placeholder="${tt('e.g. hiking','mis. mendaki')}"></label>` : ''}
      <label class="field"><span class="lbl">${tt('Date','Tanggal')}</span><input class="inp" id="afD" type="date" max="${dkey(new Date())}" value="${AF.d}"></label>
      <label class="field"><span class="lbl">${tt('Duration (minutes)','Durasi (menit)')}</span><input class="inp" id="afMin" inputmode="numeric" value="${esc(String(AF.min))}" placeholder="30"></label>
      ${a.dist ? `<label class="field"><span class="lbl">${tt('Distance','Jarak')} (${a.dist})<span class="opt">${tt('optional','opsional')}</span></span><input class="inp" id="afDist" inputmode="decimal" value="${esc(String(AF.dist))}" placeholder="${a.dist === 'm' ? '500' : '5'}"></label>` : ''}
      <label class="field"><span class="lbl">${tt('Calories from your watch (kcal)','Kalori dari jam tangan (kkal)')}<span class="opt">${tt('optional','opsional')}</span></span><input class="inp" id="afKcal" inputmode="numeric" value="${esc(String(AF.kcal))}" placeholder="${est || ''}">
        <small class="hint" id="afEst">${est ? tt(`Leave it empty and we estimate about ${est} kcal.`, `Kosongkan dan kami perkirakan sekitar ${est} kkal.`) : ''}</small></label>
      <label class="field"><span class="lbl">${tt('Average heart rate (bpm)','Detak jantung rata-rata (bpm)')}<span class="opt">${tt('optional','opsional')}</span></span><input class="inp" id="afHr" inputmode="numeric" value="${esc(String(AF.hr))}"></label>
      <label class="field"><span class="lbl">${tt('Note','Catatan')}<span class="opt">${tt('optional','opsional')}</span></span><textarea class="inp" id="afNote" rows="2" maxlength="200" placeholder="${tt('How did it go?','Bagaimana rasanya?')}">${esc(AF.note)}</textarea></label>
    </div>
    ${err ? `<div class="note" role="alert">${err}</div>` : ''}
    <div class="wz-nav">${AF.edit ? `<button class="btn ghost" data-ac="del">${I('trash')}${tt('Delete','Hapus')}</button>` : `<button class="btn ghost" data-ac="close">${tt('Cancel','Batal')}</button>`}<button class="btn primary" data-ac="save">${I('check')}${tt('Save','Simpan')}</button></div>`;
}
function readAct() {
  const g = id => { const el = $('#' + id); return el ? el.value : ''; };
  Object.assign(AF, { name:g('afName').trim(), d:g('afD') || AF.d, min:g('afMin'), dist:g('afDist'), kcal:g('afKcal'), hr:g('afHr'), note:g('afNote') });
}
function saveAct() {
  readAct();
  const min = numIn(AF.min), dist = numIn(AF.dist), kcal = numIn(AF.kcal), hr = numIn(AF.hr), a = actOf(AF.at);
  if (!min || min < 1 || min > 600) return renderAct(tt('Enter how many minutes, between 1 and 600.','Isi durasi dalam menit, antara 1 dan 600.'));
  if (AF.d > dkey(new Date())) return renderAct(tt('The date can’t be in the future.','Tanggal tidak boleh di masa depan.'));
  if (dist != null && (dist < 0 || dist > (a.dist === 'm' ? 20000 : 400))) return renderAct(tt('That distance looks too large. Check the unit.','Jaraknya terlalu besar. Cek satuannya.'));
  if (kcal != null && (kcal < 0 || kcal > 6000)) return renderAct(tt('Calories should be between 0 and 6000.','Kalori antara 0 dan 6000.'));
  if (hr != null && (hr < 30 || hr > 230)) return renderAct(tt('Heart rate should be between 30 and 230.','Detak jantung antara 30 dan 230.'));
  if (AF.at === 'other' && !AF.name) return renderAct(tt('Give the activity a name.','Beri nama aktivitasnya.'));
  const d = AF.d, used = new Set(getLog().map(x => x.ts));
  let base = AF.ts || Date.parse(d + 'T' + (d === dkey(new Date()) ? new Date().toTimeString().slice(0, 8) : '12:00:00'));
  if (!AF.ts) while (used.has(base)) base++;          // every entry keeps its own id
  const e = { ts:base, d, kind:'act', at:AF.at, name:AF.at === 'other' ? AF.name : undefined, title:AF.at === 'other' ? AF.name : L(a.n), min:Math.round(min),
    dist:dist || undefined, kcal:kcal != null ? Math.round(kcal) : actKcalEst(AF.at, min, a.dist === 'm' ? null : dist), kest:kcal == null || undefined,
    hr:hr ? Math.round(hr) : undefined, note:AF.note.trim() || undefined, gr:[] };
  const l = getLog().filter(x => x.ts !== e.ts); l.push(e);
  l.sort((x, y) => (y.d > x.d ? 1 : y.d < x.d ? -1 : (y.ts || 0) - (x.ts || 0)));
  ps.set('log', l.slice(0, 400));
  closeAct(); route();
}
function delAct() {
  if (!confirm(tt('Delete this activity?','Hapus aktivitas ini?'))) return;
  ps.set('log', getLog().filter(x => x.ts !== AF.ts));
  ps.set('logdel', [...new Set(ps.get('logdel', []).concat(AF.ts))].slice(-500));
  closeAct(); route();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ac]');
  if (b) { const a = b.dataset.ac; if (a === 'close') closeAct(); else if (a === 'save') saveAct(); else if (a === 'del') delAct(); return; }
  const t = e.target.closest('[data-at]'); if (t && AF) { readAct(); AF.at = t.dataset.at; if (!actOf(AF.at).dist) AF.dist = ''; renderAct(); const f = $(`#acIn [data-at="${AF.at}"]`); if (f) f.focus(); return; }
  const o = e.target.closest('[data-act-open]'); if (o) { openAct(o.dataset.actOpen ? Number(o.dataset.actOpen) : null); return; }
});
document.addEventListener('input', e => {
  if (!AF || !['afMin','afDist'].includes(e.target.id)) return;
  const a = actOf(AF.at), m = numIn($('#afMin').value), d = $('#afDist') ? numIn($('#afDist').value) : null, est = m ? actKcalEst(AF.at, m, a.dist === 'm' ? null : d) : 0;
  $('#afEst').textContent = est ? tt(`Leave it empty and we estimate about ${est} kcal.`, `Kosongkan dan kami perkirakan sekitar ${est} kkal.`) : '';
  $('#afKcal').placeholder = est || '';
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && AF) closeAct(); });

/* ---------- Puasa ---------- */
/* Per person: corner3:p:<id>:puasa = { 'YYYY-MM-DD': { s:'y'|'half'|'n'|'h'|'', k:'qadha'|'nazar'|'lain'|undefined, at:time } } */
const fastLog = (id = CUR) => store.get('p:' + id + ':puasa', {}) || {};
const fastAt = (d, id) => { const x = fastLog(id)[typeof d === 'string' ? d : dkey(d)]; return x && x.s ? x : null; };
const FASTED = s => s === 'y' || s === 'half';
function setFast(d, s, k) {
  const m = fastLog(); m[d] = { s, k:k || undefined, at:Date.now() }; ps.set('puasa', m);
}
const FAST_ANS = [['y', ['Yes, fasting','Ya, puasa']], ['n', ['Not today','Tidak']], ['h', ['Excused','Berhalangan']]];
function fastQ(d, compact) {
  const x = dayInfo(d), k = dkey(d), cur = fastAt(k), kid = ageGroup(PROF.age) === 'kid';
  const opts = FAST_ANS.slice(0, 1).concat(kid ? [['half', ['Half day','Setengah hari']]] : [], FAST_ANS.slice(1));
  return `<div class="fq-btns" role="group" aria-label="${tt('Fasting answer','Jawaban puasa')}">${opts.map(([v, n]) => `<button class="btn ${cur && cur.s === v ? 'primary' : 'ghost'} sm" data-fast="${v}" data-fd="${k}" aria-pressed="${!!(cur && cur.s === v)}">${L(n)}</button>`).join('')}</div>
    ${!compact ? `<p class="small">${tt('“Excused” covers being ill, travelling or haid. It never breaks your streak.','“Berhalangan” untuk sakit, dalam perjalanan, atau haid. Tidak memutus rangkaianmu.')}</p>` : ''}`;
}
function fastHomeCard(now) {
  const x = dayInfo(now); if (!x.fasting) return '';
  const k = dkey(now), cur = fastAt(k), tags = dayTags(x).filter(t => t[0] === 'fast').map(t => t[1]).join(', ');
  const who = PROFILES.filter(p => { const f = fastAt(k, p.id); return f && FASTED(f.s); });
  const fam = PROFILES.length > 1 && who.length ? `<p class="small fam-today">${I('users', 'sm')} ${tt(`${who.length} of ${PROFILES.length} in the family are fasting today`, `${who.length} dari ${PROFILES.length} anggota keluarga puasa hari ini`)}: ${who.map(p => esc(p.name)).join(', ')}</p>` : '';
  if (cur) return `<section class="fast-card done" aria-label="${tt('Fasting today','Puasa hari ini')}"><div class="fc-h">${I('moon')}<div><b>${FASTED(cur.s) ? tt('Fasting today. May it be accepted.','Puasa hari ini. Semoga diterima.') : cur.s === 'h' ? tt('Excused today.','Berhalangan hari ini.') : tt('Not fasting today.','Tidak puasa hari ini.')}</b><small>${esc(tags)}</small></div>
      <button class="linkish" data-fast-edit="${k}">${tt('Change','Ubah')}</button></div>${fam}</section>`;
  return `<section class="fast-card" aria-label="${tt('Fasting today','Puasa hari ini')}"><div class="fc-h">${I('moon')}<div><b>${tt('Are you fasting today?','Apakah kamu puasa hari ini?')}</b><small>${esc(tags)}</small></div></div>${fastQ(now)}${fam}</section>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-fast]');
  if (b) { setFast(b.dataset.fd, b.dataset.fast); if (b.dataset.fast === 'y' || b.dataset.fast === 'half') toast(tt('Recorded. May your fast be accepted.','Tercatat. Semoga puasamu diterima.')); route(); return; }
  const ed = e.target.closest('[data-fast-edit]');
  if (ed) { const m = fastLog(); m[ed.dataset.fastEdit] = { s:'', at:Date.now() }; ps.set('puasa', m); route(); return; }
  const ex = e.target.closest('[data-fast-extra]');
  if (ex) { const d = ex.dataset.fastExtra, k = $('#fxKind') ? $('#fxKind').value : 'lain'; setFast(d, 'y', k); route(); return; }
});

/* Stats */
function fastStats(id = CUR) {
  const lg = fastLog(id), today = new Date(), tk = dkey(today), start = new Date(today.getFullYear(), today.getMonth(), 1);
  let marked = 0, fasted = 0, excused = 0;
  for (let d = new Date(start); dkey(d) <= tk; d.setDate(d.getDate() + 1)) {
    const k = dkey(d), x = dayInfo(new Date(d)); const a = lg[k] && lg[k].s;
    if (x.fasting) { if (a === 'h') excused++; else { marked++; if (FASTED(a)) fasted++; } }
    else if (FASTED(a)) fasted++;                 // qadha, nazar and other fasts count toward the total
  }
  // streak over marked fasting days, newest first
  let streak = 0; const d = new Date(today);
  for (let i = 0; i < 400; i++, d.setDate(d.getDate() - 1)) {
    const k = dkey(d), x = dayInfo(new Date(d)), a = lg[k] && lg[k].s;
    if (!x.fasting) { if (FASTED(a)) streak++; continue; }
    if (FASTED(a)) streak++; else if (a === 'h' || (k === tk && !a)) continue; else break;
  }
  const year = Object.keys(lg).filter(k => k.startsWith(String(today.getFullYear())) && FASTED(lg[k].s)).length;
  const total = Object.keys(lg).filter(k => FASTED(lg[k].s)).length;
  return { marked, fasted, excused, pct:marked ? Math.round(fasted / marked * 100) : 0, streak, year, total, badges:fastBadges(lg) };
}
function fastBadges(lg) {
  const days = Object.keys(lg).filter(k => lg[k].s).sort(), out = new Set();
  if (!days.length) return out;
  const yes = k => lg[k] && FASTED(lg[k].s);
  // Istiqamah Senin–Kamis: 8 in a row (4 weeks), excused days skipped
  let run = 0, best = 0; const d = pdk(days[0]), end = new Date();
  for (; d <= end; d.setDate(d.getDate() + 1)) {
    const g = d.getDay(); if (g !== 1 && g !== 4) continue;
    const k = dkey(d), x = dayInfo(new Date(d)); if (x.ramadan || !x.fast.length) continue;
    const a = lg[k] && lg[k].s; if (FASTED(a)) { run++; best = Math.max(best, run); } else if (a === 'h' || k === dkey(end)) continue; else run = 0;
  }
  if (best >= 8) out.add('istiqamah');
  const bidh = {}, syw = {}, ram = {};
  days.forEach(k => {
    const h = hijri(pdk(k)), id = h.y + '-' + h.m;
    if (yes(k) && h.m !== 9 && h.d >= 13 && h.d <= 15) bidh[id] = (bidh[id] || 0) + 1;
    if (yes(k) && h.m === 10 && h.d >= 2) syw[h.y] = (syw[h.y] || 0) + 1;
    if (yes(k) && h.m === 12 && h.d === 9) out.add('arafah');
    if (yes(k) && h.m === 1 && h.d === 10) out.add('asyura');
    if (h.m === 9) { ram[h.y] = ram[h.y] || { y:0, n:0 }; if (yes(k)) ram[h.y].y++; else ram[h.y].n++; }
  });
  if (Object.values(bidh).some(n => n >= 3)) out.add('bidh');
  if (Object.values(syw).some(n => n >= 6)) out.add('syawal');
  if (Object.values(ram).some(r => r.y >= 29 && r.n === 0)) out.add('ramadan');
  const total = days.filter(yes).length;
  [10, 30, 100].forEach(n => { if (total >= n) out.add('t' + n); });
  return out;
}
const BADGES = [
  ['istiqamah', ['Steady Mon–Thu','Istiqamah Senin–Kamis'], ['4 weeks in a row','4 minggu berturut-turut']],
  ['bidh', ['Full Ayyamul Bidh','Ayyamul Bidh lengkap'], ['13th, 14th and 15th','Tanggal 13, 14, dan 15']],
  ['arafah', ['Arafah','Arafah'], ['Fasted on 9 Zulhijah','Puasa 9 Zulhijah']],
  ['asyura', ['Ashura','Asyura'], ['Fasted on 10 Muharam','Puasa 10 Muharam']],
  ['syawal', ['Six days of Syawal','6 hari Syawal'], ['Six days after Eid','Enam hari setelah Idulfitri']],
  ['ramadan', ['Full Ramadan','Ramadan penuh'], ['Every day of Ramadan','Setiap hari Ramadan']],
  ['t10', ['10 fasting days','10 hari puasa'], ['A good start','Awal yang baik']],
  ['t30', ['30 fasting days','30 hari puasa'], ['A habit is forming','Kebiasaan mulai terbentuk']],
  ['t100', ['100 fasting days','100 hari puasa'], ['MasyaAllah','MasyaAllah']]
];
function familyFastHTML() {
  if (PROFILES.length < 2) return '';
  const now = new Date(), pre = dkey(now).slice(0, 7);
  const rows = PROFILES.map((p, i) => { const lg = fastLog(p.id); return { p, n:Object.keys(lg).filter(k => k.startsWith(pre) && FASTED(lg[k].s)).length, c:PCOLORS[(p.color || i) % PCOLORS.length] }; })
    .sort((a, b) => a.p.name.localeCompare(b.p.name));
  const total = rows.reduce((a, r) => a + r.n, 0);
  if (!total) return `<div class="fam-fast"><h3 class="h3">${tt('Our family this month','Keluarga kita bulan ini')}</h3><p class="small">${tt('No fasting days recorded yet this month. The first one starts it.','Belum ada puasa tercatat bulan ini. Yang pertama akan memulainya.')}</p></div>`;
  return `<div class="fam-fast"><h3 class="h3">${tt('Our family this month','Keluarga kita bulan ini')}</h3>
    <p class="ff-total"><b>${total}</b> ${tt('fasting days together','hari puasa bersama')}</p>
    <div class="ff-bar" role="img" aria-label="${esc(rows.filter(r => r.n).map(r => r.p.name + ' ' + r.n).join(', '))}">${rows.filter(r => r.n).map(r => `<span style="flex:${r.n};background:${r.c}"></span>`).join('')}</div>
    <ul class="ff-list">${rows.map(r => `<li><span class="ff-av">${avatarFor(r.p)}</span><span class="ff-n">${esc(r.p.name)}</span><b>${r.n}</b><i style="background:${r.c}"></i></li>`).join('')}</ul>
    <p class="small">${tt('Everyone adds to the same total. It’s about encouraging each other, not a race.','Setiap orang menambah total yang sama. Untuk saling menyemangati, bukan berlomba.')}</p></div>`;
}
function fastSectionHTML() {
  const st = fastStats(), kid = ageGroup(PROF.age) === 'kid', today = dkey(new Date());
  return `<h2 class="h2">${tt('Fasting','Puasa')}</h2>
    <div class="tiles">
      <div class="tile"><div class="tile-h">${I('moon')}${tt('This month','Bulan ini')}</div><b>${st.fasted}</b><small>${st.marked ? tt(`of ${st.marked} fasting days, ${st.pct}%`, `dari ${st.marked} hari puasa, ${st.pct}%`) : tt('days','hari')}</small></div>
      <div class="tile"><div class="tile-h">${I('flame')}${tt('Fasting streak','Rangkaian puasa')}</div><b>${st.streak}</b><small>${tt('fasting days in a row','hari puasa berturut-turut')}</small></div>
      <div class="tile"><div class="tile-h">${I('star')}${tt('This year','Tahun ini')}</div><b>${st.year}</b><small>${tt('days fasted','hari berpuasa')}</small></div>
      <div class="tile"><div class="tile-h">${I('award')}${tt('Badges','Lencana')}</div><b>${st.badges.size}</b><small>${tt(`of ${BADGES.length}`, `dari ${BADGES.length}`)}</small></div></div>
    <ul class="badges">${BADGES.map(([k, n, s]) => `<li class="${st.badges.has(k) ? 'got' : ''}"><span class="bd-ic">${I(st.badges.has(k) ? 'award' : 'lock')}</span><b>${L(n)}</b><small>${L(s)}</small></li>`).join('')}</ul>
    ${kid ? `<p class="small">${tt('Learning to fast counts too. Half days are recorded as fasting.','Belajar puasa juga dihitung. Puasa setengah hari tercatat sebagai puasa.')}</p>` : ''}
    ${familyFastHTML()}
    <details class="fx"><summary>${tt('Record another fast (qadha, nazar, other)','Catat puasa lain (qadha, nazar, lainnya)')}</summary>
      <div class="inline-form"><input class="inp" type="date" id="fxD" max="${today}" value="${today}" aria-label="${tt('Date','Tanggal')}">
        <select class="inp" id="fxKind" aria-label="${tt('Kind','Jenis')}"><option value="qadha">Qadha</option><option value="nazar">Nazar</option><option value="lain">${tt('Other','Lainnya')}</option></select>
        <button class="btn primary sm" data-fast-extra-btn>${I('check')}${tt('Save','Simpan')}</button></div></details>`;
}
document.addEventListener('click', e => {
  if (!e.target.closest('[data-fast-extra-btn]')) return;
  const d = $('#fxD').value; if (!d || d > dkey(new Date())) return;
  setFast(d, 'y', $('#fxKind').value); toast(tt('Fast recorded.','Puasa tercatat.')); route();
});

/* ---------- Ayat and hadith ---------- */
const FAST_TAGS = ['puasa','ramadan','mon','thu','bidh','arafah','asyura','tasua','syawal'];
function pickDalil(pref, maxLen) {
  const seen = store.get('_dseen', []);
  let pool = DALIL.filter(d => (!maxLen || d.idn.length <= maxLen));
  const want = pool.filter(d => d.tags.some(t => pref.includes(t)));
  if (want.length) pool = want;
  const fresh = pool.filter(d => !seen.includes(d.id));
  const pickFrom = fresh.length ? fresh : pool, d = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  store.set('_dseen', seen.filter(x => x !== d.id).concat(d.id).slice(-14));
  return d;
}
function dayDalilTags(now) {
  const x = dayInfo(now);
  if (!x.fasting) return DALIL_GENERAL;
  const spec = x.fast.concat(x.ramadan ? ['ramadan'] : []);
  return Math.random() < .6 ? spec.concat(spec.length ? [] : ['puasa']) : ['puasa'].concat(spec);
}
const DALIL_GENERAL = ['kuat','gerak','sehat','makan','syukur','istirahat','semangat','istiqamah','bersih'];
let DALIL_NOW = null;
function dalilCardHTML(d, small) {
  return `<figure class="dalil${small ? ' sm' : ''}"><figcaption class="dl-h">${I('book')}<span>${small ? tt('Reminder','Pengingat') : tt('Today’s reminder','Pengingat hari ini')}</span>${small ? '' : `<button class="linkish" data-dalil-next aria-label="${tt('Show another reminder','Tampilkan pengingat lain')}">${tt('Another','Lainnya')}</button>`}</figcaption>
    <p class="dl-ar" lang="ar" dir="rtl">${esc(d.ar)}</p>
    <blockquote class="dl-tr">${esc(LANG === 'id' ? d.idn : d.en)}</blockquote>
    <cite class="dl-src">${esc(d.src)}</cite></figure>`;
}
function homeDalilHTML(now) {
  if (!DALIL_NOW || DALIL_NOW.day !== dkey(now)) DALIL_NOW = { day:dkey(now), d:pickDalil(dayDalilTags(now)) };
  return dalilCardHTML(DALIL_NOW.d);
}
document.addEventListener('click', e => {
  if (!e.target.closest('[data-dalil-next]')) return;
  DALIL_NOW = { day:dkey(new Date()), d:pickDalil(dayDalilTags(new Date())) };
  const box = $('#v-home .dalil'); if (box) box.outerHTML = dalilCardHTML(DALIL_NOW.d);
});
function dalilSpeech(d) {
  const sur = d.k === 'q' ? d.src.replace(/^QS\.\s*/, '').replace(/\s*\[.*$/, '') : '';
  const pre = d.k === 'q' ? tt(`Allah says in surah ${sur}: `, `Allah berfirman dalam surah ${sur}: `) : d.who === 'a' ? '' : tt('The Prophet said: ', 'Rasulullah bersabda: ');
  return (pre + (LANG === 'id' ? d.idn : d.en)).replace(/ﷺ/g, '').replace(/[…“”"]/g, '').replace(/\s+/g, ' ').trim();
}
/* Reminder at the end of a guided session: shown on the finish screen and read out by the coach */
function finishDalil(complete) {
  const x = dayInfo(new Date()), tags = x.fasting ? ['puasa'].concat(x.fast) : ['kuat','gerak','istiqamah','sehat','syukur','istirahat'];
  const d = pickDalil(tags, 150);
  if (complete) setTimeout(() => { if (S && S.steps && S.steps[0] && S.steps[0].k === 'finish') say(dalilSpeech(d), { rate:.98 }); }, 6500);
  return dalilCardHTML(d, true);
}

/* small toast for confirmations */
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600);
}
