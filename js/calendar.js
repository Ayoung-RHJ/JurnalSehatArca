/* =========================================================
   Calendar: Indonesian holidays, Hijri dates, puasa Sunnah
   ========================================================= */
/* Official lists from the SKB 3 Menteri. n = libur nasional, c = cuti bersama.
   Add the next year here each September when the new SKB is signed. */
const HOLI = {
  // 2026 (SKB 1497/2/5 Tahun 2025)
  '2026-01-01':['n','Tahun Baru 2026 Masehi','New Year 2026'],
  '2026-01-16':['n','Isra Mikraj Nabi Muhammad SAW','Isra Mi’raj'],
  '2026-02-16':['c','Cuti bersama Tahun Baru Imlek','Chinese New Year leave'],
  '2026-02-17':['n','Tahun Baru Imlek 2577 Kongzili','Chinese New Year'],
  '2026-03-18':['c','Cuti bersama Hari Suci Nyepi','Nyepi leave'],
  '2026-03-19':['n','Hari Suci Nyepi (Tahun Baru Saka 1948)','Nyepi, Day of Silence'],
  '2026-03-20':['c','Cuti bersama Idulfitri','Eid al-Fitr leave'],
  '2026-03-21':['n','Idulfitri 1447 H','Eid al-Fitr'],
  '2026-03-22':['n','Idulfitri 1447 H','Eid al-Fitr'],
  '2026-03-23':['c','Cuti bersama Idulfitri','Eid al-Fitr leave'],
  '2026-03-24':['c','Cuti bersama Idulfitri','Eid al-Fitr leave'],
  '2026-04-03':['n','Wafat Yesus Kristus','Good Friday'],
  '2026-04-05':['n','Kebangkitan Yesus Kristus (Paskah)','Easter Sunday'],
  '2026-05-01':['n','Hari Buruh Internasional','Labour Day'],
  '2026-05-14':['n','Kenaikan Yesus Kristus','Ascension Day'],
  '2026-05-15':['c','Cuti bersama Kenaikan Yesus Kristus','Ascension Day leave'],
  '2026-05-27':['n','Iduladha 1447 H','Eid al-Adha'],
  '2026-05-28':['c','Cuti bersama Iduladha','Eid al-Adha leave'],
  '2026-05-31':['n','Hari Raya Waisak 2570 BE','Vesak Day'],
  '2026-06-01':['n','Hari Lahir Pancasila','Pancasila Day'],
  '2026-06-16':['n','Tahun Baru Islam 1448 H','Islamic New Year'],
  '2026-08-17':['n','Proklamasi Kemerdekaan RI','Independence Day'],
  '2026-08-25':['n','Maulid Nabi Muhammad SAW','Prophet’s Birthday'],
  '2026-12-25':['n','Kelahiran Yesus Kristus','Christmas Day'],
  '2026-12-26':['c','Cuti bersama Kelahiran Yesus Kristus','Christmas leave'],
  // 2027 (SKB 1205/3/2 Tahun 2026)
  '2027-01-01':['n','Tahun Baru 2027 Masehi','New Year 2027'],
  '2027-01-05':['n','Isra Mikraj Nabi Muhammad SAW 1448 H','Isra Mi’raj'],
  '2027-02-05':['c','Cuti bersama Tahun Baru Imlek','Chinese New Year leave'],
  '2027-02-06':['n','Tahun Baru Imlek 2578 Kongzili','Chinese New Year'],
  '2027-03-08':['n','Hari Suci Nyepi (Tahun Baru Saka 1949)','Nyepi, Day of Silence'],
  '2027-03-09':['c','Cuti bersama Idulfitri','Eid al-Fitr leave'],
  '2027-03-10':['n','Idulfitri 1448 H','Eid al-Fitr'],
  '2027-03-11':['n','Idulfitri 1448 H','Eid al-Fitr'],
  '2027-03-12':['c','Cuti bersama Idulfitri','Eid al-Fitr leave'],
  '2027-03-15':['c','Cuti bersama Idulfitri','Eid al-Fitr leave'],
  '2027-03-25':['c','Cuti bersama Wafat Yesus Kristus','Good Friday leave'],
  '2027-03-26':['n','Wafat Yesus Kristus','Good Friday'],
  '2027-03-28':['n','Kebangkitan Yesus Kristus (Paskah)','Easter Sunday'],
  '2027-05-01':['n','Hari Buruh Internasional','Labour Day'],
  '2027-05-06':['n','Kenaikan Yesus Kristus','Ascension Day'],
  '2027-05-17':['n','Iduladha 1448 H','Eid al-Adha'],
  '2027-05-18':['c','Cuti bersama Iduladha','Eid al-Adha leave'],
  '2027-05-19':['c','Cuti bersama Hari Raya Waisak','Vesak leave'],
  '2027-05-20':['n','Hari Raya Waisak 2571 BE','Vesak Day'],
  '2027-06-01':['n','Hari Lahir Pancasila','Pancasila Day'],
  '2027-06-06':['n','Tahun Baru Islam 1449 H','Islamic New Year'],
  '2027-08-15':['n','Maulid Nabi Muhammad SAW','Prophet’s Birthday'],
  '2027-08-17':['n','Proklamasi Kemerdekaan RI','Independence Day'],
  '2027-12-24':['c','Cuti bersama Kelahiran Yesus Kristus','Christmas leave'],
  '2027-12-25':['n','Kelahiran Yesus Kristus','Christmas Day'],
  '2027-12-26':['n','Isra Mikraj Nabi Muhammad SAW 1449 H','Isra Mi’raj']
};
const HOLI_YEARS = [2026, 2027];

/* Hijri months */
const HMON = { en:['Muharram','Safar','Rabi al-Awwal','Rabi al-Akhir','Jumada al-Ula','Jumada al-Akhirah','Rajab','Sha’ban','Ramadan','Shawwal','Dhu al-Qa’dah','Dhu al-Hijjah'],
  id:['Muharam','Safar','Rabiulawal','Rabiulakhir','Jumadilawal','Jumadilakhir','Rajab','Syakban','Ramadan','Syawal','Zulkaidah','Zulhijah'] };
/* First day of Hijri months as set by Kemenag (sidang isbat, or the SKB holiday dates).
   Months not listed fall back to the Umm al-Qura calculation. Add new isbat results here. */
const KEMENAG = [
  ['2025-12-21',1447,7], ['2026-02-19',1447,9], ['2026-03-21',1447,10], ['2026-05-18',1447,12],
  ['2026-06-16',1448,1], ['2026-08-14',1448,3], ['2026-12-10',1448,7], ['2027-03-10',1448,10], ['2027-05-08',1448,12],
  ['2027-06-06',1449,1], ['2027-08-04',1449,3], ['2027-11-30',1449,7]
];
const dnum = d => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
const pdk = s => new Date(s + 'T00:00:00');
const KEM_N = KEMENAG.map(([s, y, m]) => [dnum(pdk(s)), y, m]);
let HIJ = store.get('hijri', { m:'kemenag', adj:0 });
const saveHij = () => store.set('hijri', HIJ);
const UQF = (() => { try { const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day:'numeric', month:'numeric', year:'numeric', timeZone:'UTC' }); return f.resolvedOptions().calendar === 'islamic-umalqura' ? f : null; } catch (e) { return null; } })();
function hijriCalc(n) {           // n = day number since 1970-01-01
  if (UQF) {
    const p = UQF.formatToParts(new Date(n * 864e5 + 432e5)), g = t => parseInt((p.find(x => x.type === t) || {}).value, 10);
    return { y:g('year'), m:g('month'), d:g('day') };
  }
  // Tabular (civil) fallback for browsers without the Umm al-Qura calendar
  let l = n + 2440588 - 1948440 + 10632; const k = Math.floor((l - 1) / 10631); l = l - 10631 * k + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const m = Math.floor(24 * l / 709);
  return { y:30 * k + j - 30, m, d:l - Math.floor(709 * m / 24) };
}
function hijri(d) { return hijriN(dnum(d)); }
/* Kemenag mode: each announced month start re-anchors the calculation, and the same shift carries on
   until the next announcement. Umm al-Qura mode: plain calculation, with an optional ±1 day correction. */
function hijriN(n) {
  if (HIJ.m !== 'kemenag') return Object.assign(hijriCalc(n - (HIJ.adj || 0)), { set:false });
  const adj = 0;
  let a = null; for (const k of KEM_N) { if (k[0] <= n) a = k; else break; }
  const nx = KEM_N.find(k => k[0] > n);
  if (nx && nx[0] === n + 1) {   // the day before an announced month start is always the last day of the month before
    const pm = nx[2] === 1 ? 12 : nx[2] - 1, py = nx[2] === 1 ? nx[1] - 1 : nx[1];
    const prev = n - 1 >= (a ? a[0] : -1e9) && a && a[1] === py && a[2] === pm ? n - a[0] + 1 : null;
    return { y:py, m:pm, d:prev || clamp(hijriN0(n - 1, a, adj).d + 1, 29, 30), set:!!prev };
  }
  return hijriN0(n, a, adj);
}
function hijriN0(n, a, adj) {
  if (!a) return Object.assign(hijriCalc(n - adj), { set:false });
  const diff = n - a[0];
  if (diff < 29) return { y:a[1], m:a[2], d:diff + 1, set:true };
  const h = hijriCalc(n - kemShift(a) - adj);
  if (h.y === a[1] && h.m === a[2]) return { y:a[1], m:a[2], d:Math.min(30, diff + 1), set:diff < 30 };
  return Object.assign(h, { set:false });
}
const KEM_SHIFT = new Map();
function kemShift(a) {           // days between the calculated and the announced start of this month
  if (KEM_SHIFT.has(a[0])) return KEM_SHIFT.get(a[0]);
  let s = 0; for (const t of [0, 1, -1, 2, -2]) { const h = hijriCalc(a[0] - t); if (h.y === a[1] && h.m === a[2] && h.d === 1) { s = t; break; } }
  KEM_SHIFT.set(a[0], s); return s;
}
const hijriTxt = h => `${h.d} ${HMON[LANG][h.m - 1]} ${h.y} H`;

/* Fasting days */
const FASTN = {
  mon:['Sunnah fast: Monday','Puasa sunnah Senin'], thu:['Sunnah fast: Thursday','Puasa sunnah Kamis'], bidh:['Sunnah fast: Ayyamul Bidh','Puasa sunnah Ayyamul Bidh'],
  arafah:['Sunnah fast: Arafah','Puasa sunnah Arafah'], tasua:['Sunnah fast: Tasu’a','Puasa sunnah Tasu’a'], asyura:['Sunnah fast: Ashura','Puasa sunnah Asyura'],
  syawal:['Sunnah fast: six days of Syawal','Puasa sunnah 6 hari Syawal']
};
function dayInfo(d) {
  const k = dkey(d), h = hijri(d), dow = d.getDay(), hl = HOLI[k];
  const ramadan = h.m === 9, eid = (h.m === 10 && h.d === 1) || (h.m === 12 && h.d === 10), tasyrik = h.m === 12 && h.d >= 11 && h.d <= 13;
  const fast = [];
  if (!ramadan && !eid && !tasyrik) {
    if (dow === 1) fast.push('mon');
    if (dow === 4) fast.push('thu');
    if (h.d >= 13 && h.d <= 15) fast.push('bidh');
    if (h.m === 12 && h.d === 9) fast.push('arafah');
    if (h.m === 1 && h.d === 9) fast.push('tasua');
    if (h.m === 1 && h.d === 10) fast.push('asyura');
    if (h.m === 10 && h.d >= 2 && h.d <= 7) fast.push('syawal');
  }
  return { k, d, h, hol:hl ? { t:hl[0], n:LANG === 'id' ? hl[1] : hl[2] } : null, ramadan, eid, tasyrik, fast, fasting:ramadan || fast.length > 0 };
}
/* Training on fasting days: 'plan' keeps the session, 'light' switches on gentle mode for that day */
const fastMode = (p = PROF) => (p && p.fast) || 'plan';
function fastAdj(p, d) {
  if (!p || fastMode(p) !== 'light' || ageGroup(p.age) === 'kid' || !dayInfo(d || new Date()).fasting) return p;
  return Object.assign({}, p, { cfg:Object.assign({}, p.cfg || {}, { gentle:true }) });
}
function fastTip(p = PROF) {
  if (ageGroup(p.age) === 'kid') return tt('Learning to fast? Keep play easy today and drink plenty of water at berbuka and sahur.','Sedang belajar puasa? Mainnya santai saja hari ini dan minum air yang cukup saat berbuka dan sahur.');
  return tt('Fasting today? Train 30 to 60 minutes before berbuka, or 1 to 2 hours after. Drink plenty of water between berbuka and sahur. Stop if you feel dizzy.',
    'Puasa hari ini? Latihan 30 sampai 60 menit sebelum berbuka, atau 1 sampai 2 jam sesudahnya. Minum air yang cukup antara berbuka dan sahur. Berhenti kalau pusing.');
}
/* Short tags for a day (used on Home and in the calendar) */
function dayTags(I0) {
  const out = [];
  if (I0.hol) out.push(['hol' + (I0.hol.t === 'c' ? ' cuti' : ''), I0.hol.t === 'c' ? tt('Joint leave: ','Cuti bersama: ') + I0.hol.n.replace(/^Cuti bersama /, '').replace(/ leave$/, '') : I0.hol.n]);
  if (I0.ramadan) out.push(['fast', tt(`Ramadan, day ${I0.h.d}`, `Ramadan hari ke-${I0.h.d}`)]);
  if (I0.eid) out.push(['nofast', tt('Eid: no fasting today','Hari raya: tidak berpuasa')]);
  if (I0.tasyrik) out.push(['nofast', tt('Tasyrik day: no fasting','Hari Tasyrik: tidak berpuasa')]);
  I0.fast.forEach(f => out.push(['fast', L(FASTN[f])]));
  return out;
}
const tagHTML = tags => tags.map(([c, t]) => `<span class="dtag ${c}">${c.startsWith('fast') ? I('moon', 'sm') : c.startsWith('hol') ? I('star', 'sm') : I('info', 'sm')}${esc(t)}</span>`).join('');

/* Training plan for any date (same weekly pattern, phase from the profile start) */
function weekNoAt(p, d) { const s = pdk(p.start || dkey(new Date())); return Math.max(1, Math.floor((dnum(d) - dnum(s)) / 7) + 1); }
function planAt(p, d) {
  if (p.start && dkey(d) < p.start) return null;
  const t = schedule(p).map[d.getDay()]; return t || null;
}

/* Month view */
let CALM = null, CALSEL = null;
function calHTML() {
  const p = PROF, now = new Date(), todayK = dkey(now);
  if (!CALM) CALM = { y:now.getFullYear(), m:now.getMonth() };
  if (!CALSEL) CALSEL = todayK;
  const first = new Date(CALM.y, CALM.m, 1), lead = (first.getDay() + 6) % 7, days = new Date(CALM.y, CALM.m + 1, 0).getDate();
  const logDays = new Map(); getLog().forEach(e => { if (!logDays.has(e.d)) logDays.set(e.d, []); logDays.get(e.d).push(e); });
  const h1 = hijri(first), h2 = hijri(new Date(CALM.y, CALM.m, days));
  const hRange = h1.m === h2.m ? `${HMON[LANG][h1.m - 1]} ${h1.y} H` : `${HMON[LANG][h1.m - 1]}${h1.y !== h2.y ? ' ' + h1.y : ''} – ${HMON[LANG][h2.m - 1]} ${h2.y} H`;
  let cells = '', nHol = 0, nFast = 0;
  for (let i = 0; i < lead; i++) cells += '<span class="cd blank" aria-hidden="true"></span>';
  for (let n = 1; n <= days; n++) {
    const d = new Date(CALM.y, CALM.m, n), x = dayInfo(d), k = x.k, t = planAt(p, d), done = logDays.has(k);
    if (x.hol) nHol++; if (x.fasting) nFast++;
    const cls = ['cd', x.hol ? (x.hol.t === 'c' ? 'cuti' : 'hol') : '', d.getDay() === 0 ? 'sun' : '', k === todayK ? 'today' : '', k < todayK ? 'past' : ''].filter(Boolean).join(' ');
    const lbl = [niceDate(d), hijriTxt(x.h)].concat(dayTags(x).map(z => z[1]), done ? [tt('trained','sudah latihan')] : t ? [L(TYPES[t].n)] : []).join(', ');
    cells += `<button class="${cls}" data-cday="${k}" aria-pressed="${k === CALSEL}" aria-label="${esc(lbl)}"><b>${n}</b><small>${x.h.d}</small>
      <span class="cd-m">${done ? `<i class="mk done">${I('check')}</i>` : t ? `<i class="mk plan"></i>` : ''}${x.fasting ? `<i class="mk fast"></i>` : ''}</span></button>`;
  }
  const wkHead = DOW.map(d => `<span class="${d === 0 ? 'sun' : ''}">${dayShort(d)}</span>`).join('');
  const yrs = HOLI_YEARS.includes(CALM.y) ? '' : `<div class="note info">${tt(`Public holidays for ${CALM.y} aren’t loaded yet. They’re added once the government signs that year’s SKB.`, `Libur nasional ${CALM.y} belum dimuat. Akan ditambahkan setelah SKB tahun itu ditandatangani.`)}</div>`;
  return `<div class="cal" aria-label="${tt('Calendar','Kalender')}">
    <div class="cal-top"><button class="icon-btn" data-cnav="-1" aria-label="${tt('Previous month','Bulan sebelumnya')}"><span class="flip">${I('chev')}</span></button>
      <div class="cal-ttl"><h2>${MONF[LANG][CALM.m]} ${CALM.y}</h2><small>${hRange}</small></div>
      <button class="icon-btn" data-cnav="1" aria-label="${tt('Next month','Bulan berikutnya')}">${I('chev')}</button></div>
    ${CALM.y !== now.getFullYear() || CALM.m !== now.getMonth() ? `<p class="cal-back"><button class="btn ghost sm" data-cnav="0">${tt('Back to today','Kembali ke hari ini')}</button></p>` : ''}
    <div class="cal-grid" role="group"><div class="cal-wk" aria-hidden="true">${wkHead}</div><div class="cal-days">${cells}</div></div>
    <div class="cal-key small"><span><i class="mk plan"></i>${tt('Training day','Hari latihan')}</span><span><i class="mk done">${I('check')}</i>${tt('Done','Selesai')}</span>
      <span><i class="mk fast"></i>${tt('Fasting day','Hari puasa')}</span><span><i class="sw hol"></i>${tt('Public holiday','Libur nasional')}</span><span><i class="sw cuti"></i>${tt('Joint leave','Cuti bersama')}</span></div>
    <p class="small">${tt(`This month: ${nHol} holiday and leave days, ${nFast} fasting days.`, `Bulan ini: ${nHol} hari libur dan cuti, ${nFast} hari puasa.`)}</p>
    ${yrs}
  </div>
  <div id="calDay">${calDayHTML(pdk(CALSEL))}</div>
  <h2 class="h2">${tt('Calendar settings','Pengaturan kalender')}</h2>
  <div class="fields">
    <div class="field"><div class="lbl">${tt('Hijri dates','Tanggal Hijriah')}<span class="small" style="display:block;font-weight:400">${tt('Kemenag follows the government’s sidang isbat; months not announced yet are estimated. Umm al-Qura is the Saudi calculation.','Kemenag mengikuti sidang isbat pemerintah; bulan yang belum diumumkan berupa perkiraan. Umm al-Qura adalah perhitungan Arab Saudi.')}</span></div>
      <div class="seg" role="group">${[['kemenag','Kemenag'],['uq','Umm al-Qura']].map(([v, t]) => `<button data-hij="m" data-val="${v}" aria-pressed="${HIJ.m === v}">${t}</button>`).join('')}</div></div>
    ${HIJ.m === 'uq' ? `<div class="field"><div class="lbl">${tt('Correct by a day','Koreksi satu hari')}<span class="small" style="display:block;font-weight:400">${tt('Use this if the Hijri date is a day off from what your mosque announces.','Pakai ini kalau tanggal Hijriah selisih satu hari dari pengumuman masjidmu.')}</span></div>
      <div class="seg" role="group">${[[-1,'−1'],[0,'0'],[1,'+1']].map(([v, t]) => `<button data-hij="adj" data-val="${v}" aria-pressed="${(HIJ.adj || 0) === v}">${t}</button>`).join('')}</div></div>` : ''}
    <div class="field"><div class="lbl">${tt('Training on fasting days','Latihan saat puasa')}<span class="small" style="display:block;font-weight:400">${ageGroup(p.age) === 'kid' ? tt('Kids’ play sessions are already light.','Sesi main anak sudah ringan.') : tt('Lighter switches on gentle mode on those days: shorter rounds and longer rests.','Lebih ringan menyalakan mode ringan di hari itu: ronde lebih pendek dan istirahat lebih lama.')}</span></div>
      <div class="seg" role="group">${[['plan', tt('As planned','Sesuai program')],['light', tt('Lighter','Lebih ringan')]].map(([v, t]) => `<button data-fastm="${v}" aria-pressed="${fastMode() === v}"${ageGroup(p.age) === 'kid' ? ' disabled' : ''}>${t}</button>`).join('')}</div></div>
  </div>`;
}
const MONF = { en:['January','February','March','April','May','June','July','August','September','October','November','December'], id:['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'] };
function calDayHTML(d) {
  const p = PROF, x = dayInfo(d), k = x.k, todayK = dkey(new Date()), t = planAt(p, d), tags = dayTags(x);
  const logs = getLog().filter(e => e.d === k);
  const isToday = k === todayK, future = k > todayK;
  let train = '';
  if (logs.length) train = `<ul class="blocks">${logs.map(e => `<li>${I('check', 'sm')} ${esc(e.title || '')}<span>${e.min || 0} ${tt('min','mnt')}${e.early ? tt(', stopped early',', berhenti lebih awal') : ''}</span></li>`).join('')}</ul>`;
  if (t && (isToday || future) && !(isToday && logs.length)) {
    const s = buildSession(t, fastAdj(p, d), weekNoAt(p, d)), light = fastAdj(p, d) !== p;
    train += `<p class="cday-plan">${I(TYPE_IC[t] || 'workouts')}<span><b>${s.name}</b><small>${tt('About','Sekitar')} ${s.min} ${tt('min','mnt')}${light ? tt(', lighter because you’re fasting',', lebih ringan karena puasa') : ''}</small></span></p>`
      + (isToday ? `<button class="btn primary block" data-start="${t}">${I('play')}${tt('Start this session','Mulai sesi ini')}</button>` : '');
  } else if (!t && !logs.length) train = `<p class="small">${future || isToday ? tt('Rest day. A walk or a mobility session is a good choice.','Hari istirahat. Jalan santai atau sesi mobilitas pilihan yang baik.') : tt('No training logged.','Tidak ada latihan tercatat.')}</p>`;
  else if (t && !logs.length && !future && !isToday) train = `<p class="small">${tt(`Planned: ${L(TYPES[t].n)}. Not logged.`, `Rencana: ${L(TYPES[t].n)}. Tidak tercatat.`)}</p>`;
  return `<section class="session cday" aria-live="polite"><div class="h3">${dayName(d.getDay())}, ${niceDate(d)}</div>
    <p class="small cday-h">${hijriTxt(x.h)}${HIJ.m === 'kemenag' && !x.h.set ? tt(' (estimate, not yet set by Kemenag)',' (perkiraan, belum ditetapkan Kemenag)') : ''}</p>
    ${tags.length ? `<div class="dtags">${tagHTML(tags)}</div>` : ''}
    ${x.fasting && k <= todayK ? `<div class="cday-fast"><b>${k === todayK ? tt('Fasting today?','Puasa hari ini?') : tt('Did you fast?','Apakah kamu puasa?')}</b>${fastQ(d, true)}</div>`
      : (() => { const f = fastAt(k); return f && FASTED(f.s) ? `<p class="small">${I('moon', 'sm')} ${tt('Fast recorded','Puasa tercatat')}${f.k ? ' (' + (f.k === 'lain' ? tt('other','lainnya') : f.k) + ')' : ''}</p>` : ''; })()}
    ${train}
    ${x.fasting && (isToday || future) && (t || logs.length) ? `<div class="note info">${fastTip(p)}</div>` : ''}
    ${x.fast.includes('syawal') ? `<p class="small">${tt('Any six days in Syawal count. They don’t have to be in a row.','Enam hari mana saja di bulan Syawal. Tidak harus berturut-turut.')}</p>` : ''}</section>`;
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-cday]'); if (c) { CALSEL = c.dataset.cday; document.querySelectorAll('[data-cday]').forEach(b => b.setAttribute('aria-pressed', String(b === c))); const box = $('#calDay'); box.innerHTML = calDayHTML(pdk(CALSEL));
    const r = box.getBoundingClientRect(); if (r.top > innerHeight - 160) box.scrollIntoView({ behavior:MOTION && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block:'start' }); return; }
  const nv = e.target.closest('[data-cnav]'); if (nv) { const n = Number(nv.dataset.cnav), now = new Date();
    if (!n) { CALM = { y:now.getFullYear(), m:now.getMonth() }; CALSEL = dkey(now); }
    else { const d = new Date(CALM.y, CALM.m + n, 1); CALM = { y:d.getFullYear(), m:d.getMonth() }; CALSEL = dkey(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() ? now : d); }
    renderPlan(); return; }
  const hj = e.target.closest('[data-hij]'); if (hj) { HIJ[hj.dataset.hij] = hj.dataset.hij === 'adj' ? Number(hj.dataset.val) : hj.dataset.val; saveHij(); renderPlan(); return; }
  const fm = e.target.closest('[data-fastm]'); if (fm) { PROF.fast = fm.dataset.fastm; saveProf(); renderPlan(); return; }
  const pv = e.target.closest('[data-pview]'); if (pv) { PLANVIEW = pv.dataset.pview; store.set('planview', PLANVIEW); renderPlan(); return; }
});
let PLANVIEW = store.get('planview', 'week');
