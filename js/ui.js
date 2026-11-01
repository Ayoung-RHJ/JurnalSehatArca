/* =========================================================
   Header, language, tabs
   ========================================================= */
function paintChrome() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === LANG));
  const me = PROFILES.find(p => p.id === CUR);
  $('#whoBtn').innerHTML = me ? avatarFor(me) : I('me');
  $('#whoBtn').setAttribute('aria-label', tt('Switch person', 'Ganti orang'));
  $('#themeBtn').setAttribute('aria-label', tt('Light or dark mode', 'Mode terang atau gelap'));
  $('#tabs').innerHTML = [['home', tt('Home','Beranda')],['plan', tt('Plan','Program')],['workouts', tt('Workouts','Latihan')],['progress', tt('Journal','Jurnal')],['me', tt('Me','Saya')]]
    .map(([k, t]) => `<a href="#${k}" data-tab="${k}">${I(k === 'progress' ? 'book' : k)}<span>${t}</span></a>`).join('');
  let v = location.hash.slice(1) || 'home'; if (typeof ALIAS !== 'undefined' && ALIAS[v]) v = ALIAS[v];
  document.querySelectorAll('.tabs a').forEach(a => a.dataset.tab === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  document.body.classList.toggle('nomotion', !MOTION);
}
document.addEventListener('click', e => {
  const lb = e.target.closest('[data-lang]');
  if (!lb) return;
  LANG = lb.dataset.lang; store.set('lang', LANG);
  if (PROF) { PROF.lang = LANG; saveProf(); }
  paintChrome();
  if (!$('#welcome').hidden) renderWelcome();
  if (!$('#settings').hidden) renderSettings();
  if (!$('#builder').hidden && BW) renderBuilder();
  if (!$('#wizard').hidden && WZ) wzRender();
  else if (!$('#picker').hidden) renderPicker();
  else route();
});
$('#whoBtn').addEventListener('click', () => openPicker());

/* =========================================================
   Who's training: profile picker
   ========================================================= */
function openPicker() { $('#picker').hidden = false; document.body.classList.add('locked'); renderPicker(); }
function closePicker() { $('#picker').hidden = true; document.body.classList.remove('locked'); }
function renderPicker() {
  if (PKPIN) { $('#pkIn').innerHTML = pinPromptHTML(); setTimeout(() => { const i = $('#pkPin'); if (i && document.activeElement !== i) i.focus(); }, 30); return; }
  $('#pkIn').innerHTML = `<div class="sheet-top"><div class="lang" role="group"><button data-lang="en" aria-pressed="${LANG === 'en'}">EN</button><button data-lang="id" aria-pressed="${LANG === 'id'}">ID</button></div></div>
    <img class="hero-logo" src="${LOGO}" alt="Jurnal Sehat Kita"><h1 class="h1">${tt('Who’s training today?','Siapa yang latihan hari ini?')}</h1>
    <p class="lede">${tt('Everyone gets their own check-up, plan, history and coach on this device.','Setiap orang punya cek awal, program, catatan, dan pelatih sendiri di perangkat ini.')}</p>
    <div class="people">${PROFILES.map(p => { const pr = store.get('p:' + p.id + ':profile', {}) || {};
      return `<button class="person" data-person="${p.id}">${avatarFor(p)}<b>${p.pin && p.id !== CUR ? I('lock', 'sm') + ' ' : ''}${esc(p.name)}</b>${pr.age ? `<span class="agechip">${ageLabel(pr.age)}</span>` : ''}<span style="display:block">${pr.goal ? L(GOAL[pr.goal].n) : ''}</span></button>`; }).join('')}
      <button class="person add" data-person="new"><div><b>${I('plus', 'lg')}</b><span>${tt('Add person','Tambah orang')}</span></div></button></div>
    ${CUR && PROF ? `<div class="wz-nav"><button class="btn ghost" data-person="close">${tt('Back','Kembali')}</button></div>` : ''}`;
}
$('#picker').addEventListener('click', e => {
  const b = e.target.closest('[data-person]'); if (!b) return;
  const id = b.dataset.person;
  if (id === 'close') return closePicker();
  if (id === 'new') { closePicker(); return openWizard(true); }
  const pr = PROFILES.find(x => x.id === id);
  if (pr && pr.pin && id !== CUR) { PKPIN = { id, err:'' }; return renderPicker(); }
  openPerson(id);
});
function openPerson(id) {
  CUR = id; store.set('cur', id); PROF = ps.get('profile', null);
  if (PROF && PROF.lang) { LANG = PROF.lang; store.set('lang', LANG); }
  closePicker(); paintChrome();
  if (!PROF) return openWizard(false);
  PLANSEL = null;
  if (location.hash !== '#home') location.hash = '#home'; else route();
}

/* =========================================================
   Check-up wizard
   ========================================================= */
const WZ_DEFAULT = { name:'', sex:'', age:'', h:'', w:'', hq:{ heart:'no', chest:'no', dizzy:'no', bp:'no', surgery:'no', preg:'no' }, joints:[],
  box:'none', lift:'none', act:'low', goal:'', tw:'', weeks:12, why:'', days:[1,3,5], min:30, kgMin:2, kgMax:10, bench:'yes',
  voice:'female', push:'steady', calls:'numbers', stance:'orthodox', adj:0 };
const HQ = [
  ['heart',['Has a doctor ever said you have a heart condition?','Apakah dokter pernah bilang kamu punya masalah jantung?']],
  ['chest',['Do you feel chest pain when you’re active?','Apakah dadamu terasa sakit saat beraktivitas?']],
  ['dizzy',['Do you lose your balance from dizziness, or have you ever fainted?','Apakah kamu pernah pusing sampai hilang keseimbangan, atau pingsan?']],
  ['bp',['Do you take medicine for blood pressure or a heart condition?','Apakah kamu minum obat tekanan darah atau jantung?']],
  ['surgery',['Have you had surgery or a serious injury in the last 6 months?','Apakah kamu operasi atau cedera serius dalam 6 bulan terakhir?']],
  ['preg',['Are you pregnant, or did you give birth in the last 6 months?','Apakah kamu sedang hamil, atau melahirkan dalam 6 bulan terakhir?']]
];
const JOINTS = [['shoulder',['Shoulder','Bahu']],['wrist',['Wrist','Pergelangan tangan']],['lowerback',['Lower back','Punggung bawah']],['knee',['Knee','Lutut']]];
const STEPS_WZ = ['welcome','about','health','exp','goal','sched','equip','coach','result'];
const wzSteps = D => ageGroup(D.age) === 'kid' ? ['welcome','about','health','exp','sched','coach','result'] : STEPS_WZ;
let WZ = null;
function openWizard(isNew) {
  const base = isNew ? {} : (PROF || {});
  WZ = { i:0, shown:-1, isNew:!!isNew, D:JSON.parse(JSON.stringify(Object.assign({}, WZ_DEFAULT, base))), err:'' };
  $('#wizard').hidden = false; document.body.classList.add('locked'); wzRender();
}
function closeWizard() { $('#wizard').hidden = true; document.body.classList.remove('locked'); WZ = null; }
const wseg = (k, opts, cur) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-wseg="${k}" data-val="${v}" aria-pressed="${String(cur) === String(v)}">${t}</button>`).join('')}</div>`;
const wchips = (k, opts, cur) => `<div class="chips">${opts.map(([v, t]) => `<button class="chip-b" data-wchip="${k}" data-val="${v}" aria-pressed="${cur.map(String).includes(String(v))}">${t}</button>`).join('')}</div>`;
const art = (kind, id) => `<div class="art-fig">${figHost(kind, id, '')}</div>`;

function wzRender() {
  const D = WZ.D, ST = wzSteps(D), s = ST[WZ.i], total = ST.length - 1;
  let h = `<div class="sheet-top"><div class="lang" role="group"><button data-lang="en" aria-pressed="${LANG === 'en'}">EN</button><button data-lang="id" aria-pressed="${LANG === 'id'}">ID</button></div></div>`;
  if (WZ.i > 0 && WZ.i < total) h += `<div class="wz-bar">${Array.from({ length:total - 1 }, (_, k) => `<i class="${k < WZ.i ? 'on' : ''}"></i>`).join('')}</div><p class="small">${tt('Step','Langkah')} ${WZ.i} ${tt('of','dari')} ${total - 1}</p>`;
  if (s === 'welcome') {
    h += `<img class="hero-logo" src="${LOGO}" alt="Jurnal Sehat Kita">` + art('scene', 'welcome') + `<div class="today-day" style="font-size:clamp(3.4rem,16vw,6.5rem)">${WZ.isNew && PROFILES.length ? tt('New fighter','Petarung baru') : tt('Your check-up','Cek awalmu')}</div>
      <p class="lede">${tt('A good trainer asks before they push. Answer a few questions about your body, health, goal and schedule, and Jurnal Sehat Kita builds a weekly plan around you.','Pelatih yang baik bertanya dulu sebelum menantang. Jawab beberapa pertanyaan tentang badan, kesehatan, tujuan, dan jadwalmu, lalu Jurnal Sehat Kita menyusun program mingguan khusus untukmu.')}</p>
      <div class="note info">${tt('Your answers are saved on this device, and shared with your family only if you turn on Family sync. It takes about 3 minutes.','Jawabanmu tersimpan di perangkat ini, dan dibagikan ke keluarga hanya jika Sinkron keluarga dinyalakan. Sekitar 3 menit.')}</div>`;
  } else if (s === 'about') {
    const b = bmiOf(D);
    h += art('scene', 'about') + `<h1 class="h1">${tt('About you','Tentang kamu')}</h1>
      <label class="lbl-top" for="w-name">${tt('What should your coach call you?','Pelatih harus memanggilmu apa?')}</label><input class="inp" id="w-name" data-k="name" value="${esc(D.name)}" autocomplete="given-name">
      <span class="lbl-top">${tt('Sex','Jenis kelamin')}</span>${wseg('sex', [['female', tt('Female','Perempuan')],['male', tt('Male','Laki-laki')]], D.sex)}
      <p class="small">${tt('Used for starting weights and energy estimates.','Dipakai untuk beban awal dan perkiraan energi.')}</p>
      <div class="row3">
        <div><label class="lbl-top" for="w-age">${tt('Age','Usia')}</label><input class="inp" id="w-age" data-k="age" data-num inputmode="numeric" value="${esc(D.age)}"></div>
        ${ageGroup(D.age) === 'kid' ? '' : `<div><label class="lbl-top" for="w-h">${tt('Height (cm)','Tinggi (cm)')}</label><input class="inp" id="w-h" data-k="h" data-num inputmode="decimal" value="${esc(D.h)}"></div>
        <div><label class="lbl-top" for="w-w">${tt('Weight (kg)','Berat (kg)')}</label><input class="inp" id="w-w" data-k="w" data-num inputmode="decimal" value="${esc(D.w)}"></div>`}
      </div><div class="bmi" id="wzBmi">${b && !isMinor(D) ? `<b>${b.toFixed(1)}</b><span>BMI, ${bmiCat(b)}</span>` : ''}</div>${ageGroup(D.age) === 'kid' ? `<div class="note info">${kidSupTxt()}</div>` : isTeen(D) ? `<div class="note info">${teenTxt()}</div>` : ''}`;
  } else if (s === 'health') {
    h += art('scene', 'health') + `<h1 class="h1">${tt('Health check','Cek kesehatan')}</h1><p class="lede">${tt('The standard questions a trainer asks before your first session. A yes doesn’t stop you training. It makes your plan gentler.','Pertanyaan standar pelatih sebelum sesi pertama. Jawaban ya tidak menghentikan latihanmu, hanya membuat programnya lebih ringan.')}</p>
      <div class="fields">${HQ.filter(([k]) => k !== 'preg' || (D.sex === 'female' && !isMinor(D))).map(([k, q]) => `<div class="q"><span>${L(q)}</span>${wseg('hq.' + k, [['no', tt('No','Tidak')],['yes', tt('Yes','Ya')]], D.hq[k])}</div>`).join('')}</div>
      <span class="lbl-top">${tt('Any joint that hurts or needs extra care?','Ada sendi yang sakit atau perlu dijaga?')}</span>${wchips('joints', JOINTS.map(([k, n]) => [k, L(n)]), D.joints)}
      <p class="small">${tt('The app swaps out exercises that load a sore joint.','Aplikasi mengganti latihan yang membebani sendi yang sakit.')}</p>
      ${healthFlag(D) ? `<div class="note">${tt('Please get a doctor’s OK before training hard. Your plan starts in gentle mode: longer rests, calm coaching and no burnout rounds.','Mintalah izin dokter sebelum latihan berat. Programmu dimulai dalam mode ringan: istirahat lebih lama, pelatih lebih tenang, tanpa ronde burnout.')}</div>` : ''}`;
  } else if (s === 'exp') {
    const lv = [['none', tt('Never','Belum pernah')],['some', tt('A little','Sedikit')],['regular', tt('Regularly','Rutin')]];
    h += art('scene', 'exp') + `<h1 class="h1">${tt('Experience','Pengalaman')}</h1>
      <span class="lbl-top">${tt('Boxing or shadow boxing','Tinju atau shadow boxing')}</span>${wseg('box', lv, D.box)}
      ${ageGroup(D.age) === 'kid' ? '' : `<span class="lbl-top">${tt('Training with weights','Latihan beban')}</span>${wseg('lift', lv, D.lift)}`}
      <span class="lbl-top">${tt('How active is a normal day?','Seberapa aktif harimu biasanya?')}</span>${wseg('act', [['low', tt('Mostly sitting','Banyak duduk')],['light', tt('On my feet a bit','Cukup bergerak')],['active', tt('Very active','Sangat aktif')]], D.act)}`;
  } else if (s === 'goal') {
    if (isMinor(D) && D.goal === 'fat') D.goal = '';
    h += (D.goal ? art('goal', D.goal) : '') + `<h1 class="h1">${tt('Your goal','Tujuanmu')}</h1><div class="choices">${Object.entries(GOAL).filter(([k]) => k !== 'play' && !(k === 'fat' && isMinor(D))).map(([k, g]) =>
      `<button class="choice" data-wseg="goal" data-val="${k}" aria-pressed="${D.goal === k}"><span class="choice-ic">${ICONS[k]}</span><div><b>${L(g.n)}</b><span>${L(g.d)}</span></div></button>`).join('')}</div>
      ${isTeen(D) ? `<div class="note info">${teenTxt()}</div>` : ''}${(D.goal === 'fat' || D.goal === 'muscle') && !isMinor(D) ? `<label class="lbl-top" for="w-tw">${tt('Target weight in kg (optional)','Target berat dalam kg (opsional)')}</label><input class="inp" id="w-tw" data-k="tw" data-num inputmode="decimal" value="${esc(D.tw)}" style="max-width:180px">` : ''}
      <span class="lbl-top">${tt('By when?','Kapan targetnya?')}</span>${wseg('weeks', [[8, tt('8 weeks','8 minggu')],[12, tt('12 weeks','12 minggu')],[16, tt('16 weeks','16 minggu')]], D.weeks)}
      <label class="lbl-top" for="w-why">${tt('Why does this matter to you?','Kenapa ini penting buatmu?')}</label>
      <textarea class="inp" id="w-why" data-k="why" maxlength="90" placeholder="${tt('For example: keep up with my kids, feel strong again','Misalnya: bisa main dengan anak, merasa kuat lagi')}">${esc(D.why)}</textarea>
      <p class="small">${tt('Your coach reminds you of this when it gets hard.','Pelatihmu akan mengingatkan ini saat latihan terasa berat.')}</p>`;
  } else if (s === 'sched') {
    if (ageGroup(D.age) === 'kid' && !(D.min <= 20)) D.min = 20;
    h += calSVG(D.days) + `<h1 class="h1">${tt('Your week','Minggumu')}</h1><span class="lbl-top">${tt('Which days can you train?','Hari apa saja kamu bisa latihan?')}</span>
      ${wchips('days', DOW.map(d => [d, dayShort(d)]), D.days)}
      <p class="small">${D.days.length} ${tt('days picked. 3 to 4 days is a great start. Keep at least one rest day.','hari dipilih. 3 sampai 4 hari adalah awal yang bagus. Sisakan minimal satu hari istirahat.')}</p>
      <span class="lbl-top">${tt('Minutes per session','Menit per sesi')}</span>${wseg('min', ageGroup(D.age) === 'kid' ? [[15,'15'],[20,'20']] : [[20,'20'],[30,'30'],[45,'45'],[60,'60']], D.min)}`;
  } else if (s === 'equip') {
    h += dbArt(D.kgMin, D.kgMax) + `<h1 class="h1">${tt('Your dumbbells','Dumbbell kamu')}</h1>
      <div class="row2"><div><label class="lbl-top" for="w-kmin">${tt('Lightest pair (kg)','Pasangan teringan (kg)')}</label><input class="inp" id="w-kmin" data-k="kgMin" data-num inputmode="decimal" value="${esc(D.kgMin)}"></div>
      <div><label class="lbl-top" for="w-kmax">${tt('Heaviest pair (kg)','Pasangan terberat (kg)')}</label><input class="inp" id="w-kmax" data-k="kgMax" data-num inputmode="decimal" value="${esc(D.kgMax)}"></div></div>
      <p class="small">${tt('With adjustable dumbbells, enter the lightest and heaviest setting. Suggested weights never go above what you own.','Kalau dumbbell-nya bisa diatur, isi setelan teringan dan terberat. Saran beban tidak akan melebihi yang kamu punya.')}</p>
      <span class="lbl-top">${tt('Do you have a bench or sturdy chair?','Punya bangku atau kursi yang kokoh?')}</span>${wseg('bench', [['yes', tt('Yes','Ya')],['no', tt('No','Tidak')]], D.bench)}${isTeen(D) ? `<div class="note info">${tt('Teens: suggested weights stay at 5 kg or less, so technique comes first.','Remaja: saran beban maksimal 5 kg, supaya teknik didahulukan.')}</div>` : ''}`;
  } else if (s === 'coach') {
    h += `<h1 class="h1">${tt('Pick your coach','Pilih pelatihmu')}</h1>
      <div class="coaches">${['female','male'].map(g => `<button class="coach-card" data-wseg="voice" data-val="${g}" aria-pressed="${D.voice === g}">${avatarSVG({ sex:g, coach:true })}<b>Coach ${COACHN[g]}</b><span>${g === 'female' ? tt('Female voice','Suara perempuan') : tt('Male voice','Suara laki-laki')}</span></button>`).join('')}</div>
      <p style="margin:10px 0 0"><button class="btn ghost sm" id="wzTest">${tt('Test voice','Tes suara')}</button></p>
      <span class="lbl-top">${tt('How hard should your coach push?','Seberapa keras pelatih mendorongmu?')}</span>
      ${wseg('push', [['calm', `<span class="flames">${FLAME}</span>${tt('Calm','Tenang')}`],['steady', `<span class="flames">${FLAME + FLAME}</span>${tt('Steady','Sedang')}`],['hard', `<span class="flames">${FLAME + FLAME + FLAME}</span>${tt('Hard push','Keras')}`]].filter(o => !(ageGroup(D.age) === 'kid' && o[0] === 'hard')), D.push)}
      <span class="lbl-top">${tt('Combo calls in boxing rounds','Panggilan kombo saat ronde tinju')}</span>${wseg('calls', [['numbers', tt('Numbers','Angka')],['names', tt('Punch names','Nama pukulan')],['off', tt('Off','Mati')]], D.calls)}
      <span class="lbl-top">${tt('Stance','Kuda-kuda')}</span>${wseg('stance', [['orthodox','Orthodox'],['southpaw','Southpaw']], D.stance)}
      <p class="small">${tt('Right-handed people usually box orthodox (left foot forward). Left-handed people often prefer southpaw.','Orang yang tidak kidal biasanya orthodox (kaki kiri di depan). Orang kidal sering memilih southpaw.')}</p>
      <div class="duo">${figHost('move', 'stance', '')}${feetSVG(D.stance)}</div>`;
  } else {
    h += art('scene', 'celebrate') + wzResult(D);
  }
  h += `<div class="wz-err" role="alert">${WZ.err || ''}</div><div class="wz-nav">
    ${WZ.i > 0 ? `<button class="btn ghost" data-wz="back">${tt('Back','Kembali')}</button>` : (PROFILES.length ? `<button class="btn ghost" data-wz="close">${tt('Cancel','Batal')}</button>` : '')}
    <button class="btn primary" data-wz="next">${s === 'welcome' ? tt('Start check-up','Mulai cek awal') : s === 'result' ? tt('Start my plan','Mulai programku') : tt('Next','Lanjut')}</button></div>`;
  $('#wzIn').innerHTML = h;
  mountFigs($('#wzIn'));
  if (WZ.shown !== WZ.i) { $('#wizard').scrollTop = 0; WZ.shown = WZ.i; }
}
function wzResult(D) {
  if (isMinor(D)) return wzResultYoung(D);
  const b = bmiOf(D), mult = { low:1.2, light:1.375, active:1.55 }[D.act];
  const bmr = 10 * D.w + 6.25 * D.h - 5 * D.age + (D.sex === 'male' ? 5 : -161), tdee = Math.round(bmr * mult / 10) * 10, sch = schedule(D);
  let goalTxt = tt(`You burn roughly <b>${tdee} kcal a day</b> before training.`, `Kamu membakar sekitar <b>${tdee} kkal per hari</b> sebelum latihan.`);
  if (D.goal === 'fat') { const fl = D.sex === 'male' ? 1500 : 1200, lo = Math.max(fl, tdee - 500), hi = Math.max(fl, tdee - 300);
    goalTxt = tt(`You burn roughly <b>${tdee} kcal a day</b>. For steady fat loss, eating about ${lo} to ${hi} kcal works for most people.`, `Kamu membakar sekitar <b>${tdee} kkal per hari</b>. Untuk menurunkan lemak dengan stabil, makan sekitar ${lo} sampai ${hi} kkal cocok untuk kebanyakan orang.`); }
  else if (D.goal === 'muscle') goalTxt = tt(`You burn roughly <b>${tdee} kcal a day</b>. To build muscle, eat about ${tdee + 200} to ${tdee + 300} kcal with protein at every meal.`, `Kamu membakar sekitar <b>${tdee} kkal per hari</b>. Untuk membangun otot, makan sekitar ${tdee + 200} sampai ${tdee + 300} kkal dengan protein di setiap makan.`);
  let target = '';
  if (D.tw && D.goal === 'fat' && D.tw < D.w) {
    const minW = Math.ceil(18.5 * Math.pow(D.h / 100, 2)); let tw = D.tw, note = '';
    if (tw < minW) { note = `<div class="note">${tt(`${tw} kg would be below the healthy range for your height, so the plan aims for ${minW} kg instead.`, `${tw} kg di bawah rentang sehat untuk tinggimu, jadi program menargetkan ${minW} kg.`)}</div>`; tw = minW; D.tw = minW; }
    const wks = Math.ceil((D.w - tw) / .5), dt = new Date(); dt.setDate(dt.getDate() + wks * 7);
    target = note + `<p>${tt(`At a safe pace of about 0.5 kg a week, reaching <b>${tw} kg</b> takes about <b>${wks} weeks</b> (around ${niceDate(dt)}).`, `Dengan laju aman sekitar 0,5 kg per minggu, mencapai <b>${tw} kg</b> butuh sekitar <b>${wks} minggu</b> (sekitar ${niceDate(dt)}).`)}${wks > D.weeks ? ' ' + tt(`That’s longer than the ${D.weeks} weeks you picked, so the plan goes for steady progress instead of a crash.`, `Itu lebih lama dari ${D.weeks} minggu yang kamu pilih, jadi program memilih kemajuan stabil, bukan cara instan.`) : ''}</p>`;
  } else if (D.tw && D.goal === 'muscle' && D.tw > D.w) {
    const wks = Math.ceil((D.tw - D.w) / .25), dt = new Date(); dt.setDate(dt.getDate() + wks * 7);
    target = `<p>${tt(`Lean muscle comes at about 0.25 kg a week. Reaching <b>${D.tw} kg</b> takes about <b>${wks} weeks</b> (around ${niceDate(dt)}).`, `Otot bertambah sekitar 0,25 kg per minggu. Mencapai <b>${D.tw} kg</b> butuh sekitar <b>${wks} minggu</b> (sekitar ${niceDate(dt)}).`)}</p>`;
  }
  const flags = [];
  if (healthFlag(D)) flags.push(tt('Gentle mode is on because of your health answers. Please get a doctor’s OK, then redo the check-up.','Mode ringan aktif karena jawaban kesehatanmu. Mintalah izin dokter, lalu ulangi cek awal.'));
  else if (D.age >= 60) flags.push(tt('Gentle mode is on: longer rests and calm coaching.','Mode ringan aktif: istirahat lebih lama dan pelatih lebih tenang.'));
  if (D.joints.length) flags.push(tt('Exercises that load your ','Latihan yang membebani ') + D.joints.map(j => L(JOINTS.find(x => x[0] === j)[1]).toLowerCase()).join(tt(' and ',' dan ')) + tt(' are swapped for safer ones.',' diganti dengan yang lebih aman.'));
  if (lowImpact(D) && !healthFlag(D)) flags.push(tt('Your warm-up uses low-impact moves, no jumping.','Pemanasanmu memakai gerakan ringan, tanpa lompat.'));
  if (sch.conflicts) flags.push(tt('Some training days are back to back on the same muscles. Spreading your days out would help recovery.','Beberapa hari latihan berurutan melatih otot yang sama. Menyebar hari latihan akan membantu pemulihan.'));
  const box = D.box === 'none' ? tt('You’ll start with stance practice and simple 1-2 combos.','Kamu mulai dengan latihan kuda-kuda dan kombo 1-2 sederhana.') : D.box === 'some' ? tt('Combos start at intermediate.','Kombo dimulai di level menengah.') : tt('Combos start at advanced.','Kombo dimulai di level mahir.');
  return `<h1 class="h1">${tt('Your plan','Programmu')}, ${esc(D.name || '')}</h1>
    <div class="stats"><div class="stat"><b>${b.toFixed(1)}</b><span>BMI, ${bmiCat(b)}</span></div>
      <div class="stat"><b>${D.days.length}</b><span>${tt('days a week','hari seminggu')}</span></div><div class="stat"><b>${D.min}</b><span>${tt('minutes each','menit per sesi')}</span></div></div>
    <p class="small">${tt('BMI is a rough guide. Many Asian health bodies use a lower cut-off, counting 23 and above as above the healthy range.','BMI hanya panduan kasar. Banyak lembaga kesehatan di Asia memakai batas lebih rendah: 23 ke atas sudah di atas rentang sehat.')}</p>
    <h2 class="h2">${L(GOAL[D.goal].n)}</h2><p>${goalTxt}</p>${target}
    ${flags.map(f => `<div class="note">${f}</div>`).join('')}
    <h2 class="h2">${tt('Your week','Minggumu')}</h2>
    <div class="pweek">${DOW.map(d => { const t = sch.map[d]; return `<div class="pday${t ? '' : ' rest'}"><b>${dayShort(d)}</b><div><strong>${t ? L(TYPES[t].n) : tt('Rest','Istirahat')}</strong></div><em></em></div>`; }).join('')}</div>
    <p class="small">${tt('Every session starts with a warm-up you can’t skip.','Setiap sesi dimulai dengan pemanasan yang tidak bisa dilewati.')} ${box} ${tt('No muscle group is trained hard two days in a row.','Tidak ada kelompok otot yang dilatih berat dua hari berturut-turut.')}</p>
    <h2 class="h2">${tt('9-week cycle','Siklus 9 minggu')}</h2>
    <p>${tt('Weeks 1–2 Foundation, 3–5 Build, 6–8 Push, week 9 Recover and re-check. After each session, tell your coach how it felt and the next one adapts.','Minggu 1–2 Fondasi, 3–5 Membangun, 6–8 Tantangan, minggu 9 Pemulihan dan cek ulang. Setelah tiap sesi, beri tahu pelatih rasanya, dan sesi berikutnya menyesuaikan.')}</p>`;
}
function wzResultYoung(D) {
  const kid = ageGroup(D.age) === 'kid', sch = schedule(D), t0 = Object.values(sch.map)[0], ses = t0 ? buildSession(t0, Object.assign({}, D, { start:dkey(new Date()) }), 1) : null;
  return `<h1 class="h1">${tt('Your plan','Programmu')}, ${esc(D.name || '')}</h1>
    <div class="stats"><div class="stat"><b>${D.days.length}</b><span>${tt('days a week','hari seminggu')}</span></div><div class="stat"><b>${ses ? ses.min : D.min}</b><span>${tt('minutes each','menit per sesi')}</span></div></div>
    ${kid ? `<p>${tt('Every session is a game: a warm-up, short boxing play rounds, fun moves like frog squats and superhero planks, then a calm stretch. No weights, ever. Finish a session to earn up to 3 stars.','Setiap sesi adalah permainan: pemanasan, ronde tinju singkat, gerakan seru seperti squat katak dan plank pahlawan, lalu peregangan santai. Tanpa beban sama sekali. Selesaikan sesi untuk dapat hingga 3 bintang.')}</p><div class="note">${kidSupTxt()}</div>`
      : `<p>${teenTxt()}</p>`}
    ${healthFlag(D) ? `<div class="note">${tt('Please get a doctor’s OK before training hard. The plan starts in gentle mode.','Mintalah izin dokter sebelum latihan berat. Program dimulai dalam mode ringan.')}</div>` : ''}
    <h2 class="h2">${tt('Your week','Minggumu')}</h2>
    <div class="pweek">${DOW.map(d => { const t = sch.map[d]; return `<div class="pday${t ? '' : ' rest'}"><b>${dayShort(d)}</b><div><strong>${t ? L(TYPES[t].n) : tt('Rest','Istirahat')}</strong></div><em></em></div>`; }).join('')}</div>
    <p class="small">${tt('Every session starts with a warm-up you can’t skip.','Setiap sesi dimulai dengan pemanasan yang tidak bisa dilewati.')}</p>`;
}
function wzValidate() {
  const D = WZ.D, s = wzSteps(D)[WZ.i];
  if (s === 'about') {
    if (!String(D.name).trim()) return tt('Add the name your coach should use.','Isi nama panggilanmu.');
    if (!D.sex) return tt('Pick female or male.','Pilih perempuan atau laki-laki.');
    if (!(D.age >= 6 && D.age <= 90)) return tt('Enter an age between 6 and 90.','Isi usia antara 6 dan 90.');
    if (ageGroup(D.age) === 'kid') return '';
    if (!(D.h >= 120 && D.h <= 220)) return tt('Enter your height in centimetres, for example 170.','Isi tinggi dalam sentimeter, misalnya 170.');
    if (!(D.w >= 30 && D.w <= 250)) return tt('Enter your weight in kilograms, for example 72.','Isi berat dalam kilogram, misalnya 72.');
  }
  if (s === 'goal' && !D.goal) return tt('Pick the goal that matters most right now.','Pilih tujuan yang paling penting sekarang.');
  if (s === 'sched') { if (!D.days.length) return tt('Pick at least one training day.','Pilih minimal satu hari latihan.'); if (D.days.length > 6) return tt('Keep at least one rest day so your body can recover.','Sisakan minimal satu hari istirahat supaya badan pulih.'); }
  if (s === 'equip') { if (!(D.kgMax > 0)) return tt('Enter your heaviest dumbbell in kg.','Isi dumbbell terberatmu dalam kg.'); if (D.kgMin > D.kgMax) return tt('Your lightest pair can’t be heavier than your heaviest.','Pasangan teringan tidak boleh lebih berat dari yang terberat.'); }
  return '';
}
function wzFinish() {
  const D = WZ.D;
  if (WZ.isNew || !CUR) {
    const id = 'p' + Date.now();
    PROFILES.push({ id, name:D.name, sex:D.sex, color:PROFILES.length % PCOLORS.length });
    CUR = id; store.set('cur', id); D.start = dkey(new Date()); D.adj = 0;
  } else {
    const me = PROFILES.find(p => p.id === CUR); if (me) { me.name = D.name; me.sex = D.sex; }
    D.start = (PROF && PROF.start) || dkey(new Date()); D.adj = (PROF && PROF.adj) || 0;
  }
  store.set('profiles', PROFILES);
  if (isMinor(D)) { D.tw = ''; if (D.goal === 'fat') D.goal = 'health'; }
  if (ageGroup(D.age) === 'kid') { D.goal = 'play'; if (D.push === 'hard') D.push = 'steady'; if (!(D.min <= 20)) D.min = 20; }
  if (!(D.tw !== '' && ((D.goal === 'fat' && D.tw < D.w) || (D.goal === 'muscle' && D.tw > D.w)))) D.tw = '';
  D.lang = LANG;
  const old = getW().length ? curW() : null;
  if (D.tw && (!D.wplan || !PROF || PROF.tw !== D.tw)) D.wplan = { d:dkey(new Date()), kg:D.w };
  if (!D.tw) delete D.wplan;
  PROF = D; saveProf();
  if (D.w > 0) { if (old !== D.w) addW(D.w); if (!ps.get('w0', null)) ps.set('w0', D.w); }
  closeWizard(); paintChrome(); PLANSEL = null;
  if (location.hash !== '#home') location.hash = '#home'; else route();
}
$('#wizard').addEventListener('click', e => {
  if (!WZ) return;
  const D = WZ.D;
  const sg = e.target.closest('[data-wseg]');
  if (sg) { const k = sg.dataset.wseg, raw = sg.dataset.val, v = /^\d+$/.test(raw) ? Number(raw) : raw;
    if (k.startsWith('hq.')) D.hq[k.slice(3)] = v; else D[k] = v;
    if (k === 'voice') { audio(); say(tt(`Hi, I’m Coach ${COACHN[v]}.`, `Halo, saya Coach ${COACHN[v]}.`), { voice:v }); }
    WZ.err = ''; wzRender(); return; }
  const ch = e.target.closest('[data-wchip]');
  if (ch) { const k = ch.dataset.wchip, raw = ch.dataset.val, v = /^\d+$/.test(raw) ? Number(raw) : raw;
    D[k] = D[k].includes(v) ? D[k].filter(x => x !== v) : D[k].concat(v); WZ.err = ''; wzRender(); return; }
  if (e.target.id === 'wzTest') { audio(); say(tt(`Hi ${D.name || 'there'}, I’m Coach ${COACHN[D.voice]}. Let’s get to work.`, `Hai ${D.name || ''}, saya Coach ${COACHN[D.voice]}. Ayo mulai latihan.`), { voice:D.voice }); return; }
  const nav = e.target.closest('[data-wz]'); if (!nav) return;
  if (nav.dataset.wz === 'close') { closeWizard(); if (!PROF) openPicker(); return; }
  if (nav.dataset.wz === 'back') { WZ.i--; WZ.err = ''; wzRender(); return; }
  const err = wzValidate(); if (err) { WZ.err = err; wzRender(); return; }
  if (wzSteps(WZ.D)[WZ.i] === 'result') return wzFinish();
  WZ.i++; WZ.err = ''; wzRender();
});
$('#wizard').addEventListener('input', e => {
  const t = e.target.closest('[data-k]'); if (!t || !WZ) return;
  WZ.D[t.dataset.k] = t.hasAttribute('data-num') ? (t.value === '' ? '' : Number(t.value.replace(',', '.'))) : t.value;
  if ((t.dataset.k === 'h' || t.dataset.k === 'w') && !isMinor(WZ.D)) { const b = bmiOf(WZ.D), el = $('#wzBmi'); if (el) el.innerHTML = b ? `<b>${b.toFixed(1)}</b><span>BMI, ${bmiCat(b)}</span>` : ''; }
});
$('#wizard').addEventListener('change', e => { if (WZ && (e.target.id === 'w-kmin' || e.target.id === 'w-kmax' || e.target.id === 'w-age')) wzRender(); });

/* =========================================================
   Views
   ========================================================= */
function blocksHTML(ses) {
  const li = [`<li>${tt('Warm-up','Pemanasan')}, ${ses.warm.length} ${tt('moves','gerakan')} <span class="lock">${tt('Required','Wajib')}</span></li>`];
  if (ses.box) li.push(`<li>${tt('Boxing','Tinju')}<span>${ses.box.rounds} × ${fmt(ses.box.len)}, ${L(LEVEL[ses.box.level])}</span></li>`);
  if (ses.play) li.push(`<li>${tt('Play moves','Gerakan main')}<span>${ses.play.moves.length} × ${ses.play.laps}</span></li>`);
  if (ses.ex.length) li.push(`<li>${tt('Strength','Kekuatan')}<span>${ses.ex.length} ${tt('exercises','latihan')} × ${ses.ex[0].sets} set</span></li>`);
  if (ses.cool.length) li.push(`<li>${tt('Cool-down','Pendinginan')}<span>${ses.cool.length} ${tt('stretches','peregangan')}</span></li>`);
  return `<ul class="blocks">${li.join('')}</ul>`;
}
function goalHTML() {
  const p = PROF; if (!p.tw) return '';
  const w0 = ps.get('w0', p.w), w = curW(), span = Math.abs(w0 - p.tw) || 1, right = Math.sign(w0 - w) === Math.sign(w0 - p.tw);
  const done = clamp(right ? Math.abs(w0 - w) / span * 100 : 0, 0, 100);
  return `<div class="session"><div class="h3">${L(GOAL[p.goal].n)}: ${w} kg → ${p.tw} kg</div><div class="goal-bar"><i style="width:${done.toFixed(0)}%"></i></div>
    <p class="small">${done.toFixed(0)}% ${tt('of the way. Log your weight once a week in the Log tab.','tercapai. Catat beratmu seminggu sekali di tab Catatan.')}</p></div>`;
}
function greeting(ses) {
  const h = new Date().getHours(), n = esc(PROF.name);
  const hi = h < 11 ? tt('Good morning','Selamat pagi') : h < 15 ? tt('Good afternoon','Selamat siang') : h < 18 ? tt('Good afternoon','Selamat sore') : tt('Good evening','Selamat malam');
  if (!ses) return `${hi}, ${n}! ${tt('Rest day today. Your muscles are rebuilding.','Hari ini istirahat. Ototmu sedang membangun diri.')}`;
  const focus = TYPES[ses.type].g.filter(g => g !== 'core').map(g => L(GNAME[g])).join(tt(' and ',' dan '));
  return `${hi}, ${n}! ${tt('Today we box', 'Hari ini kita tinju')}${focus ? tt(' and train ', ' dan latih ') + focus : tt(' and work your core', ' dan latih core')}. ${tt('Ready?','Siap?')}`;
}
function coachMsg(ses) {
  if (ses && ses.kid) return tt(`Let’s play, ${esc(PROF.name)}! Warm-up, boxing games, fun moves, then a calm stretch. Earn your stars!`, `Ayo main, ${esc(PROF.name)}! Pemanasan, permainan tinju, gerakan seru, lalu peregangan santai. Kumpulkan bintangmu!`);
  if (!ses) return tt('Rest day today. Your muscles are rebuilding. A short mobility session is always fine.','Hari ini istirahat. Ototmu sedang membangun diri. Sesi mobilitas singkat selalu boleh.');
  const focus = TYPES[ses.type].g.filter(g => g !== 'core').map(g => L(GNAME[g])).join(tt(' and ',' dan '));
  return `${tt('Today we box', 'Hari ini kita tinju')}${focus ? tt(' and train ', ' dan latih ') + focus : tt(' and work your core', ' dan latih core')}. ${tt('Warm-up first, then we go. Ready?','Pemanasan dulu, lalu kita mulai. Siap?')}`;
}
/* Home banners: the words are part of each picture, so the slides show the picture only.
   The alt text carries the words (and an English version) for screen readers. */
const SLIDES = [
  { k:'hajj', img:'img/slides/hajj.webp' },
  { k:'umra', img:'img/slides/umra.webp' },
  { k:'child', img:'img/slides/child.webp' },
  { k:'generasi', img:'img/slides/generasi.webp' }
];
const SLIDE_ALT = {
  hajj:['Physical preparation to answer His call: a couple in ihram jogging at the Kaaba','Persiapan fisik untuk memenuhi panggilan-Nya: pasangan berihram berlari kecil di depan Ka’bah'],
  umra:['Because Allah enables those He calls: a family of three generations in ihram at the Kaaba','Karena Allah memampukan mereka yang dipanggil: keluarga tiga generasi berihram di depan Ka’bah'],
  child:['Everyone needs a strong body to be great: kids playing basketball, doing karate and drawing','Semua butuh fisik yang kuat untuk menjadi hebat: anak-anak bermain basket, karate, dan menggambar'],
  generasi:['A blessed generation: grandmother, mothers and daughter together','Generasi yang berkah: nenek, ibu, dan anak perempuan bersama']
};
function carouselHTML() {
  const n = SLIDES.length;
  return `<section class="car" aria-roledescription="carousel" aria-label="${tt('Highlights','Sorotan')}">
    <div class="car-track" id="carTrack">${SLIDES.map((s, i) => `<div class="car-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} ${tt('of','dari')} ${n}"><img src="${s.img}" alt="${esc(L(SLIDE_ALT[s.k]))}" ${i ? 'loading="lazy"' : ''}></div>`).join('')}</div>
    <div class="car-dots" role="group" aria-label="${tt('Choose slide','Pilih slide')}">${SLIDES.map((s, i) => `<button data-car="${i}" aria-label="${tt('Slide','Slide')} ${i + 1}" aria-current="${i === 0}"></button>`).join('')}</div></section>`;
}
let CAR = { i:0, timer:null, paused:false };
function carGo(i, smooth = true) {
  const tr = $('#carTrack'); if (!tr) return;
  const n = document.querySelectorAll('#carTrack .car-slide').length || 1;
  CAR.i = (i + n) % n;
  tr.scrollTo({ left:CAR.i * tr.clientWidth, behavior:smooth && MOTION ? 'smooth' : 'auto' });
}
function carInit() {
  clearInterval(CAR.timer); CAR.i = 0; CAR.paused = false;
  const tr = $('#carTrack'); if (!tr) return;
  const car = tr.parentElement;
  let raf = 0;
  tr.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
    const i = Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth)); CAR.i = i;
    car.querySelectorAll('[data-car]').forEach((d, k) => d.setAttribute('aria-current', k === i)); }); }, { passive:true });
  ['pointerenter','focusin','touchstart'].forEach(ev => car.addEventListener(ev, () => { CAR.paused = true; }, { passive:true }));
  ['pointerleave','focusout'].forEach(ev => car.addEventListener(ev, () => { CAR.paused = false; }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!MOTION || reduce) return;
  CAR.timer = setInterval(() => {
    if (!tr.isConnected) { clearInterval(CAR.timer); return; }
    if (CAR.paused || document.hidden || S || $('#carTrack').children.length < 2) return;
    carGo(CAR.i + 1);
  }, 6000);
}
document.addEventListener('click', e => { const d = e.target.closest('[data-car]'); if (d) { CAR.paused = true; carGo(Number(d.dataset.car)); } });
const TYPE_IC = { BOX:'glove', MOB:'stretch', PLAY:'glove', QUICK:'bolt', CUSTOM:'workouts' };
function ringHTML(done, goal) {
  const r = 50, c = 2 * Math.PI * r, pct = goal ? Math.min(1, done / goal) : 0;
  return `<div class="ring" role="img" aria-label="${tt(`${done} of ${goal} training days this week`, `${done} dari ${goal} hari latihan minggu ini`)}">
    <svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="${r}"/><circle class="val" cx="60" cy="60" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-off="${(c * (1 - pct)).toFixed(1)}"/></svg>
    <div class="ring-c"><b>${done}/${goal}</b><span>${tt('days','hari')}</span></div>${pct >= 1 ? `<span class="ring-star">${I('star')}</span>` : ''}</div>`;
}
function wkStrip(sch, ws) {
  const t = dkey(new Date());
  return `<div class="wk">${weekDates().map(x => { const k = dkey(x), on = ws.days.has(k), pl = !!sch.map[x.getDay()];
    return `<div class="${on ? 'on' : pl ? 'plan' : ''}${k === t ? ' now' : ''}">${dayLetter(x.getDay())}<i>${on ? I('check') : ''}</i></div>`; }).join('')}</div>`;
}
function sparkHTML() {
  const l = getW().slice(-8), cur = curW(), w0 = ps.get('w0', PROF.w), d = cur && w0 ? +(cur - w0).toFixed(1) : 0;
  const ws0 = wstatus(), sub = ws0 ? `${L(STLBL[ws0.key])}, ${tt('target','target')} ${PROF.tw} kg` : PROF.tw ? `${tt('Target','Target')} ${PROF.tw} kg` : (l.length > 1 ? `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d)} kg ${tt('since start','sejak mulai')}` : tt('Log once a week','Catat seminggu sekali'));
  let svg = '';
  if (l.length >= 2) {
    const vals = l.map(x => x.kg).concat(PROF.tw ? [PROF.tw] : []), lo = Math.min(...vals), hi = Math.max(...vals), W = 200, H = 64, p = 6;
    const X = i => p + i * (W - p * 2) / (l.length - 1), Y = v => p + (hi - v) / ((hi - lo) || 1) * (H - p * 2);
    const pts = l.map((x, i) => `${X(i).toFixed(1)},${Y(x.kg).toFixed(1)}`).join(' ');
    svg = `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${PROF.tw ? `<line class="tg" x1="0" x2="${W}" y1="${Y(PROF.tw).toFixed(1)}" y2="${Y(PROF.tw).toFixed(1)}"/>` : ''}
      <polygon class="sa" points="${X(0).toFixed(1)},${H} ${pts} ${X(l.length - 1).toFixed(1)},${H}"/><polyline class="sl" points="${pts}" vector-effect="non-scaling-stroke"/></svg>`;
  } else svg = `<span class="small" style="flex:1">${tt('Two weigh-ins draw your trend line.','Dua kali timbang akan menggambar grafik tren.')}</span>`;
  return `<a class="mini-w" href="#progress" data-go="progress"><div class="mw-txt"><span class="lab">${I('scale')}${tt('Weight','Berat badan')}</span><b>${cur || '–'} kg</b><small>${sub}</small></div>${svg}<span class="go">${I('chev')}</span></a>`;
}
function renderToday() {
  const p = PROF, now = new Date(), wk = weekNo(), ph = phaseOf(wk), ses = sessionFor(now), doneToday = getLog().some(e => e.d === dkey(now)), ws = weekStats(), sch = schedule(p);
  const me = PROFILES.find(x => x.id === CUR) || {}, h = now.getHours();
  const hi = h < 11 ? tt('Good morning','Selamat pagi') : h < 15 ? tt('Good afternoon','Selamat siang') : h < 18 ? tt('Good afternoon','Selamat sore') : tt('Good evening','Selamat malam');
  const goal = (p.days || []).length, done = ws.days.size;
  const left = Math.max(0, goal - done);
  const weekMsg = done >= goal ? tt('Weekly goal reached. Great work.','Target mingguan tercapai. Kerja bagus.')
    : left === 1 ? tt('One more training day to hit your goal.','Satu hari latihan lagi untuk capai target.')
    : tt(`${left} more training days to hit your goal.`, `${left} hari latihan lagi untuk capai target.`);
  const s = ses || buildSession('MOB', p, wk), ic = TYPE_IC[s.type] || 'workouts', dInfo = dayInfo(now), dTags = dayTags(dInfo);
  const pills = [`<span class="pill lock">${I('lock')}${tt('Warm-up','Pemanasan')} ${Math.round(s.warm.length * s.warmSecs / 60)} ${tt('min','mnt')}</span>`];
  if (s.box) pills.push(`<span class="pill">${I('glove')}${s.box.rounds} × ${fmt(s.box.len)}</span>`);
  if (s.play) pills.push(`<span class="pill">${I('star')}${s.play.moves.length} ${tt('play moves','gerakan main')}</span>`);
  if (s.ex.length) pills.push(`<span class="pill">${I('workouts')}${s.ex.length} ${tt('exercises','latihan')} × ${s.ex[0].sets}</span>`);
  if (s.cool.length) pills.push(`<span class="pill">${I('stretch')}${tt('Cool-down','Pendinginan')}</span>`);
  const fig = ses ? (ses.type === 'BOX' ? figHost('scene', 'fight') : ses.ex.length ? figHost('ex', ses.ex[0].id) : figHost('scene', 'fight')) : figHost('scene', 'rest');
  const card = `<section class="today-card" aria-labelledby="tcT">
      ${doneToday ? `<span class="done-badge">${I('check')}${tt('Trained today','Sudah latihan hari ini')}</span>` : ''}
      <div class="tc-top"><span class="tc-ic">${I(ic)}</span><div class="tc-txt"><p class="lab">${ses ? tt('Today’s session','Sesi hari ini') : tt('Rest day','Hari istirahat')}</p>
        <h2 id="tcT">${ses ? ses.name : tt('Mobility and recovery','Mobilitas dan pemulihan')}</h2><p>${tt('About','Sekitar')} ${s.min} ${tt('minutes','menit')}${s.gentle ? tt(', gentle mode',', mode ringan') : ''}</p></div>
        <div class="tc-fig">${fig}</div></div>
      <div class="pills">${pills.join('')}</div>
      ${dTags.length ? `<div class="dtags">${tagHTML(dTags)}</div>` : ''}
      ${dInfo.fasting && !doneToday ? `<p class="small tc-fast">${fastTip(p)}</p>` : ''}
      <div class="tc-coach">${coachAv()}<p>${coachMsg(ses)}</p></div>
      <button class="btn ${ses ? 'primary' : 'ghost'} block" data-start="${s.type}">${I('play')}${ses ? tt('Start today’s session','Mulai sesi hari ini') : tt('Start mobility','Mulai mobilitas')}</button>${wrapLinkHTML(s.type)}</section>`;
  $('#v-home').innerHTML = `
    <div class="hello"><div class="hello-txt"><p class="hello-date">${dayName(now.getDay())}, ${niceDate(now)}</p><h1 class="hello-t">${hi}, ${esc(p.name)}</h1></div>
      <button class="hello-av" data-who aria-label="${tt('Switch person','Ganti orang')}">${avatarSVG({ sex:p.sex, color:PCOLORS[(me.color || 0) % PCOLORS.length], age:p.age })}</button></div>
    ${carouselHTML()}
    ${fastHomeCard(now)}
    ${homeDalilHTML(now)}
    <section class="hero-card" aria-label="${tt('This week','Minggu ini')}"><div class="hero-row">${ringHTML(done, goal)}
      <div class="hero-txt"><h2>${tt('This week','Minggu ini')}</h2><p>${weekMsg}</p><p>${tt(`Week ${wk}, ${ph.n.toLowerCase()} phase`, `Minggu ${wk}, fase ${ph.n.toLowerCase()}`)}</p></div></div>
      ${wkStrip(sch, ws)}</section>
    ${tilesHTML(ws)}
    ${isKid() ? '' : `<p class="fine">${tt('Energy is an estimate: MET value × body weight × time.','Energi adalah perkiraan: nilai MET × berat badan × waktu.')}</p>`}
    ${card}
    ${isKid() ? `<div class="note info">${kidSupTxt()}</div>` : sparkHTML()}
    <h2 class="sec-t">${tt('Quick actions','Aksi cepat')}</h2>
    <div class="quick">
      <button class="qa" data-act-open=""><span class="qi">${I('run')}</span>${tt('Log activity','Catat aktivitas')}</button>
      ${isKid() ? `<button class="qa" data-go="workouts"><span class="qi">${I('bolt')}</span>${tt('Quick play','Main singkat')}</button>` : `<button class="qa" data-go="progress" data-focus="1"><span class="qi">${I('scale')}</span>${tt('Log weight','Catat berat')}</button>`}
      <button class="qa" data-start="MOB"><span class="qi">${I('stretch')}</span>${tt('Mobility','Mobilitas')}</button>
      <button class="qa" data-go="workouts"><span class="qi">${I('glove')}</span>${tt('Punch guide','Panduan pukulan')}</button>
      <button class="qa" data-voice-test><span class="qi">${I('voice')}</span>${tt('Coach','Pelatih')} ${COACHN[p.voice] || 'Rani'}</button>
    </div>
    ${p.why ? `<div class="why">${esc(p.why)}<small>${tt('Your reason','Alasanmu')}</small></div>` : ''}`;
  mountFigs($('#v-home'));
  carInit();
  requestAnimationFrame(() => requestAnimationFrame(() => { const v = $('#v-home .ring .val'); if (v) v.style.strokeDashoffset = v.dataset.off; }));
}
function cfgPills() {
  const C = PROF.cfg || {}, out = [];
  if (C.roundsBox != null) out.push(`${C.roundsBox} ${tt('rounds','ronde')}`);
  if (C.roundsMix != null) out.push(C.roundsMix ? `${C.roundsMix} ${tt('rounds on strength days','ronde di hari kekuatan')}` : tt('No boxing on strength days','Tanpa tinju di hari kekuatan'));
  if (C.len) out.push(fmt(C.len) + ' ' + tt('rounds','ronde'));
  if (C.brest) out.push(C.brest + ' ' + tt('s rest','dtk istirahat'));
  if (C.level) out.push(L(LEVEL[C.level]));
  if (C.sets) out.push(C.sets + ' ' + tt('sets','set'));
  if (C.reps) out.push(C.reps + ' ' + tt('reps','repetisi'));
  if (C.warmPlus) out.push(tt('Longer warm-up','Pemanasan lebih lama'));
  if (C.cool === false) out.push(tt('No cool-down','Tanpa pendinginan'));
  const n = (C.excl || []).length + Object.keys(C.swap || {}).length; if (n) out.push(`${n} ${tt('exercise changes','perubahan latihan')}`);
  return out.map(t => `<span class="pill">${t}</span>`).join('');
}
let PLANSEL = null;
function renderPlan() {
  const p = PROF, sch = schedule(p), wk = weekNo(), ph = phaseOf(wk), today = new Date().getDay();
  if (PLANSEL === null) PLANSEL = today;
  const sel = sch.map[PLANSEL], ses = sel ? buildSession(sel, p, wk) : null;
  const rec = GROUPS.map(([g, label]) => `<tr><td>${L(label)}</td>${DOW.map(d => { const t = sch.map[d];
    const c = t && TYPES[t].g.includes(g) ? 'hard' : t && (TYPES[t].light || []).includes(g) ? 'light' : ''; return `<td>${c ? `<span class="dot ${c}"></span>` : ''}</td>`; }).join('')}</tr>`).join('');
  const viewSeg = `<div class="seg pview" role="group" aria-label="${tt('Plan view','Tampilan program')}">${[['week', tt('Week','Minggu')],['month', tt('Calendar','Kalender')]].map(([v, t]) => `<button data-pview="${v}" aria-pressed="${PLANVIEW === v}">${t}</button>`).join('')}</div>`;
  if (PLANVIEW === 'month') { $('#v-plan').innerHTML = `<h1 class="h1">${tt('Your plan','Programmu')}</h1>${viewSeg}${calHTML()}`; return; }
  $('#v-plan').innerHTML = `
    <h1 class="h1">${tt('Your plan','Programmu')}</h1>${viewSeg}<p class="lede">${tt(`Week ${wk}, ${ph.n} phase.`, `Minggu ${wk}, fase ${ph.n}.`)} ${ph.d}</p>
    <div class="plan-adj"><button class="btn ghost sm" data-settings="">${I('plan')}${tt('Adjust plan','Atur program')}</button>${cfgPills()}</div>
    <div class="phases">${Array.from({ length:9 }, (_, k) => `<i class="p${phaseOf(k + 1).i}${k + 1 === ph.c ? ' cur' : ''}"></i>`).join('')}</div>
    <div class="phase-key">${PHASES.map(x => `<span>${L(x.n).split(' ')[0]}</span>`).join('')}</div>
    <div class="pweek">${DOW.map(d => { const t = sch.map[d], s = t ? buildSession(t, p, wk) : null;
      return `<button class="pday${t ? '' : ' rest'}${d === today ? ' today' : ''}" data-pday="${d}" aria-pressed="${d === PLANSEL}"><b>${dayShort(d)}</b>
        <div><strong>${t ? L(TYPES[t].n) : tt('Rest','Istirahat')}</strong><small>${t ? TYPES[t].g.map(g => L(GNAME[g])).concat(s && s.box ? [tt('boxing','tinju')] : []).join(', ') : tt('Recover, walk, stretch','Pulih, jalan santai, peregangan')}</small></div><em>${s ? s.min + ' ' + tt('min','mnt') : ''}</em></button>`; }).join('')}</div>
    <div class="session preview">${ses ? `<div class="h3">${dayName(PLANSEL)}: ${ses.name}</div>${blocksHTML(ses)}
      ${ses.ex.length ? `<ol>${ses.ex.map(e => `<li>${L(EX[e.id].n)} <small>${e.sets} × ${e.secs ? e.secs + ' ' + tt('s','dtk') : e.reps + (EX[e.id].side ? tt(' each side',' per sisi') : '')}${e.kg && EX[e.id].sz ? ', ' + e.kg + ' kg' : ''}</small></li>`).join('')}</ol>` : ''}
      <button class="btn primary block" data-start="${ses.type}">${tt('Start this session','Mulai sesi ini')}</button>${wrapLinkHTML(ses.type)}`
      : `<div class="h3">${dayName(PLANSEL)}: ${tt('rest','istirahat')}</div><p>${tt('Rest days are part of the plan. Muscles repair and get stronger between sessions.','Hari istirahat adalah bagian dari program. Otot memperbaiki diri dan makin kuat di antara sesi.')}</p><button class="btn ghost block" data-start="MOB">${tt('Start a mobility session','Mulai sesi mobilitas')}</button>`}</div>
    <h2 class="h2">${tt('Recovery check','Cek pemulihan')}</h2>
    <div class="table-wrap"><table class="rec"><thead><tr><th>${tt('Muscles','Otot')}</th>${DOW.map(d => `<th>${dayLetter(d)}</th>`).join('')}</tr></thead><tbody>${rec}</tbody></table></div>
    <p class="small"><span class="dot hard"></span> ${tt('trained hard','dilatih berat')} &nbsp; <span class="dot light"></span> ${tt('light work from boxing rounds','beban ringan dari ronde tinju')}</p>
    ${sch.conflicts ? `<div class="note">${tt('Some days hit the same muscles back to back. In Me, redo the check-up and spread your training days out.','Beberapa hari melatih otot yang sama berturut-turut. Di menu Saya, ulangi cek awal dan sebar hari latihanmu.')}</div>`
      : `<div class="note ok">${tt('Every muscle group gets at least 48 hours to recover before it’s trained hard again.','Setiap kelompok otot mendapat minimal 48 jam pemulihan sebelum dilatih berat lagi.')}</div>`}`;
}
function renderLearn() {
  const st = PROF.stance, hand = n => ((n % 2 === 1) !== (st === 'southpaw')) ? tt('left','kiri') : tt('right','kanan');
  const groups = [['push',['Push: chest, shoulders, triceps','Dorong: dada, bahu, trisep']],['pull',['Pull: back, biceps, grip','Tarik: punggung, bisep, genggaman']],['legs',['Legs and glutes','Kaki dan bokong']],['core',['Core','Core']]];
  $('#v-workouts').innerHTML = `
    <h1 class="h1">${tt('Workouts','Latihan')}</h1><p class="lede">${tt('Quick sessions, your own workouts, and every move your coach will ask for. Watch the figure, then copy it slowly in front of a mirror.','Sesi singkat, latihanmu sendiri, dan semua gerakan yang akan diminta pelatih. Perhatikan gambarnya, lalu tiru pelan-pelan di depan cermin.')}</p>
    ${quickHTML()}${mywHTML()}
    <h2 class="h2" style="margin-top:34px">${tt('Move library','Pustaka gerakan')}</h2>
    ${wrapCardHTML()}
    <h2 class="h2">${tt('Stance','Kuda-kuda')}</h2>
    <div class="card"><div class="duo">${figHost('move', 'stance', L(MOVES.stance.n), '', true)}${feetSVG(st)}</div><p>${L(MOVES.stance.cue)}</p><p class="small">${tt('You box','Kamu memakai')} ${st}. ${tt('Change this in Me.','Ubah di menu Saya.')}</p></div>
    <h2 class="h2">${tt('Punches','Pukulan')}</h2><p class="lede">${tt('Coaches call combos by number. Odd numbers are your lead hand, even numbers your rear hand.','Pelatih memanggil kombo dengan angka. Angka ganjil untuk tangan depan, angka genap untuk tangan belakang.')}</p>
    <div class="cards">${[1,2,3,4,5,6].map(n => { const gk = (n === 2 ? 'cross' : PUNCH_IMG[n]) + '_glow';
      return `<div class="card ptab-card"><div class="seg ptabs" role="group" aria-label="${tt('Show','Tampilkan')}">
          <button data-ptab="gerak" aria-pressed="true">${tt('Movement','Gerakan')}</button><button data-ptab="otot" aria-pressed="false">${tt('Muscles','Otot')}</button><button data-ptab="kaki" aria-pressed="false">${tt('Feet','Kaki')}</button></div>
        <div class="pview" data-pv="gerak">${figHost('punch', n, L(PUNCH[n]))}</div>
        <div class="pview" data-pv="otot" hidden>${FIGIMG[gk] ? `<img src="${FIGIMG[gk]}" alt="${tt('Muscles used','Otot yang bekerja')}: ${PMUS[n][0].map(x => L(MNAME[x])).join(', ')}" loading="lazy">` : ''}</div>
        <div class="pview" data-pv="kaki" hidden>${footAnim(st, n)}</div>
      <div class="h3" style="margin-top:8px"><span class="num-badge">${n}</span>${L(PUNCH[n])} <svg class="path" viewBox="0 0 56 30" aria-hidden="true"><path d="${PATH[n]}"/></svg></div>
      ${mmKey(PMUS[n][0], PMUS[n][1])}
      <p class="small">${tt('Your','Tangan')} ${hand(n)} ${tt('hand','')}</p><p>${L(PUNCH_HOW[n])}</p></div>`; }).join('')}</div>
    <h2 class="h2">${tt('Defence','Bertahan')}</h2>
    <div class="cards">${['slip','roll','back','pivot'].map(k => `<div class="card">${figHost('punch', k, L(PUNCH[k]), '', !!IMGMAP['punch:' + k])}<div class="h3" style="margin-top:8px">${L(PUNCH[k])}</div><p>${L(PUNCH_HOW[k])}</p></div>`).join('')}</div>
    ${isKid() ? '' : groups.map(([g, label]) => `<h2 class="h2">${L(label)}</h2><div class="cards">${Object.keys(EX).filter(k => EX[k].g === g).map(k => { const e = EX[k];
      return `<div class="card"><div class="duo">${figHost('ex', k, e.n, '', true)}<div>${mmap(e.m, e.s)}</div></div><div class="h3" style="margin-top:10px">${e.n}</div>${mmKey(e.m, e.s)}<ol>${L(e.how).map(x => `<li>${x}</li>`).join('')}</ol></div>`; }).join('')}</div>`).join('')}
    ${isKid() ? `<h2 class="h2">${tt('Play moves','Gerakan main')}</h2><div class="cards">${KIDPLAY.map(k => `<div class="card">${figHost('move', k, L(MOVES[k].n))}<div class="h3" style="margin-top:8px">${L(MOVES[k].n)}</div><p>${L(MOVES[k].cue)}</p></div>`).join('')}</div>` : ''}
    <h2 class="h2">${tt('Warm-up and cool-down','Pemanasan dan pendinginan')}</h2>
    <div class="cards">${['march','jacks','reach','armcircle','sidereach','hips','legswing','squatbw','bounce','hamstring','quad','chest','crossbody','breathe'].map(k =>
      `<div class="card">${figHost('move', k, L(MOVES[k].n))}<div class="h3" style="margin-top:8px">${L(MOVES[k].n)}</div><p>${L(MOVES[k].cue)}</p></div>`).join('')}</div>`;
  mountFigs($('#v-workouts'));
}

/* =========================================================
   Weight plan: safe pace line, target date, status
   ========================================================= */
const pd = s => new Date(s + 'T00:00:00');
const daysBetween = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return dkey(d); };
const shortDate = s => { const d = pd(s); return d.getDate() + ' ' + MON[LANG][d.getMonth()]; };
const isKid = p => ageGroup((p || PROF).age) === 'kid';
function wplan(p = PROF) {
  if (!p || !p.tw || isMinor(p)) return null;
  const l = getW(); let A = p.wplan;
  if (!A || !A.d) { const s = l.find(x => x.d >= (p.start || '')) || l[0]; A = s ? { d:s.d, kg:s.kg } : { d:dkey(new Date()), kg:p.w }; }
  const loss = p.tw < A.kg, rate = loss ? -.5 : .25, wks = Math.max(1, Math.ceil(Math.abs(p.tw - A.kg) / Math.abs(rate)));
  const tDate = addDays(A.d, wks * 7);
  const at = d => { const v = A.kg + rate * daysBetween(A.d, d) / 7; return loss ? Math.max(p.tw, v) : Math.min(p.tw, v); };
  return { A, T:p.tw, loss, rate, wks, tDate, at };
}
function trend(l) {
  const last = l[l.length - 1]; if (!last) return null;
  const pts = l.filter(x => daysBetween(x.d, last.d) <= 35);
  if (pts.length < 3 || daysBetween(pts[0].d, last.d) < 14) return null;
  const xs = pts.map(x => daysBetween(pts[0].d, x.d) / 7), ys = pts.map(x => x.kg), n = xs.length;
  const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0); if (!sxx) return null;
  return xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / sxx;   // kg per week
}
function wstatus(p = PROF) {
  const P = wplan(p), l = getW(), last = l[l.length - 1]; if (!P || !last) return null;
  const exp = P.at(last.d), gap = P.loss ? exp - last.kg : last.kg - exp;   // positive = ahead
  const done = P.loss ? last.kg <= P.T : last.kg >= P.T;
  return { P, last, exp, gap, key:done ? 'done' : gap > .5 ? 'ahead' : gap < -.5 ? 'behind' : 'on', slope:trend(l) };
}
const STLBL = { ahead:['Ahead of plan','Lebih cepat dari rencana'], on:['On track','Sesuai rencana'], behind:['Behind plan','Di belakang rencana'], done:['Target reached','Target tercapai'] };
function wchart() {
  const p = PROF, l = getW(), st = wstatus(), P = st ? st.P : wplan();
  if (!l.length) return `<div class="empty">${tt('Log your first weigh-in to start your chart.','Catat timbangan pertamamu untuk memulai grafik.')}</div>`;
  if (!P && l.length < 2) return `<p class="small">${tt('Log a second weigh-in to see your trend.','Catat berat kedua untuk melihat tren.')}</p>${setTargetBtn()}`;
  const W = 340, H = 210, pl = 34, pr = 12, pt = 16, pb = 26, today = dkey(new Date());
  const act = (P ? l.filter(x => x.d >= addDays(P.A.d, -56)) : l).slice(-30);
  let x0 = act[0].d, x1 = act[act.length - 1].d;
  if (P) { if (P.A.d < x0) x0 = P.A.d; if (P.tDate > x1) x1 = P.tDate; }
  if (today > x1) x1 = today;
  const span = Math.max(7, daysBetween(x0, x1));
  const vals = act.map(x => x.kg).concat(P ? [P.A.kg, P.T] : []);
  let lo = Math.floor(Math.min(...vals) - .8), hi = Math.ceil(Math.max(...vals) + .8);
  const step = hi - lo > 12 ? 4 : hi - lo > 6 ? 2 : 1;
  const X = d => pl + daysBetween(x0, d) / span * (W - pl - pr), Y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  let g = '';
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) g += `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${pl - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end">${v}</text>`;
  if (P) {
    const ds = [P.A.d, addDays(P.A.d, Math.round(P.wks * 7 / 2)), P.tDate];
    const up = ds.map(d => `${X(d).toFixed(1)},${Y(P.at(d) + .5).toFixed(1)}`), dn = ds.slice().reverse().map(d => `${X(d).toFixed(1)},${Y(P.at(d) - .5).toFixed(1)}`);
    g += `<polygon class="band" points="${up.concat(dn).join(' ')}"/>`;
    g += `<line class="tgt" x1="${pl}" x2="${W - pr}" y1="${Y(P.T).toFixed(1)}" y2="${Y(P.T).toFixed(1)}"/>`;
    g += `<line class="plan" x1="${X(P.A.d).toFixed(1)}" y1="${Y(P.A.kg).toFixed(1)}" x2="${X(P.tDate).toFixed(1)}" y2="${Y(P.T).toFixed(1)}"/>`;
    g += `<circle class="tdot" cx="${X(P.tDate).toFixed(1)}" cy="${Y(P.T).toFixed(1)}" r="4.5"/>`;
    g += `<text class="tlab" x="${(X(P.tDate) - 7).toFixed(1)}" y="${(Y(P.T) + (P.loss ? 15 : -8)).toFixed(1)}" text-anchor="end">${tt('Target','Target')} ${P.T} kg</text>`;
  }
  if (today >= x0 && today <= x1) g += `<line class="now" x1="${X(today).toFixed(1)}" x2="${X(today).toFixed(1)}" y1="${pt}" y2="${H - pb}"/>`;
  const pts = act.map(x => `${X(x.d).toFixed(1)},${Y(x.kg).toFixed(1)}`).join(' ');
  if (act.length > 1) g += `<polyline class="act" points="${pts}"/>`;
  g += act.map((x, i) => i === act.length - 1 ? '' : `<circle class="pt" cx="${X(x.d).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="3"/>`).join('');
  const L1 = act[act.length - 1];
  g += `<circle class="last" cx="${X(L1.d).toFixed(1)}" cy="${Y(L1.kg).toFixed(1)}" r="5.5"/><text class="llab" x="${Math.min(W - pr - 2, X(L1.d) + 8).toFixed(1)}" y="${(Y(L1.kg) - 9).toFixed(1)}" text-anchor="${X(L1.d) > W - 60 ? 'end' : 'start'}">${L1.kg} kg</text>`;
  g += `<text x="${pl}" y="${H - 8}">${shortDate(x0)}</text><text x="${W - pr}" y="${H - 8}" text-anchor="end">${shortDate(x1)}</text>`;
  const svg = `<svg class="wc" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tt('Weight chart: your weigh-ins compared with the safe plan line','Grafik berat: timbanganmu dibandingkan garis rencana aman')}">${g}</svg>`;
  const legend = `<div class="wc-key"><span><i class="k-act"></i>${tt('Your weight','Beratmu')}</span>${P ? `<span><i class="k-plan"></i>${tt(`Safe plan, ${Math.abs(P.rate)} kg a week`, `Rencana aman, ${String(Math.abs(P.rate)).replace('.', ',')} kg per minggu`)}</span><span><i class="k-band"></i>${tt('On-track zone','Zona sesuai rencana')}</span>` : ''}</div>`;
  let head = '';
  if (st) {
    const g2 = Math.abs(st.gap).toFixed(1).replace('.', LANG === 'id' ? ',' : '.');
    const msg = { done:tt(`You’ve reached ${P.T} kg. Set a new target or switch to keeping it steady.`, `Kamu sudah mencapai ${P.T} kg. Pasang target baru atau jaga berat tetap stabil.`),
      ahead:tt(`${g2} kg ahead of the plan line.`, `${g2} kg lebih cepat dari garis rencana.`),
      on:tt('Within half a kilo of the plan line. Keep going.', 'Dalam setengah kilo dari garis rencana. Lanjutkan.'),
      behind:tt(`${g2} kg behind the plan line. Steady weeks still get you there.`, `${g2} kg di belakang garis rencana. Minggu-minggu yang konsisten tetap membawamu ke sana.`) }[st.key];
    const wkNow = Math.min(P.wks, Math.max(1, Math.ceil((daysBetween(P.A.d, today) + 1) / 7)));
    let pace = '';
    if (st.slope != null && st.key !== 'done') {
      const s = st.slope, right = P.loss ? s < -0.05 : s > 0.05;
      if (P.loss && s < -1) pace = tt('You’re losing more than 1 kg a week. That’s faster than the safe pace, so make sure you’re eating enough to train well.','Beratmu turun lebih dari 1 kg per minggu. Itu lebih cepat dari laju aman, jadi pastikan makanmu cukup untuk latihan.');
      else if (!P.loss && s > .5) pace = tt('You’re gaining more than 0.5 kg a week. Slower gains keep it lean.','Beratmu naik lebih dari 0,5 kg per minggu. Kenaikan lebih pelan menjaga tetap ramping.');
      else if (right) { const wl = Math.ceil(Math.abs(P.T - st.last.kg) / Math.abs(s)); pace = tt(`At your pace over the last few weeks, you’d reach ${P.T} kg around ${niceDate(pd(addDays(st.last.d, wl * 7)))}.`, `Dengan lajumu beberapa minggu terakhir, kamu akan mencapai ${P.T} kg sekitar ${niceDate(pd(addDays(st.last.d, wl * 7)))}.`); }
      else pace = tt('Your last few weigh-ins are moving away from the target. One week doesn’t decide anything, so keep logging.','Beberapa timbangan terakhir menjauh dari target. Satu minggu tidak menentukan apa pun, terus catat.');
    }
    head = `<div class="wst ${st.key}"><div class="wst-top"><span class="wchip ${st.key}">${st.key === 'done' ? I('star') : st.key === 'behind' ? I('clock') : I('check')}${L(STLBL[st.key])}</span><span class="small">${tt('Week','Minggu')} ${wkNow} ${tt('of','dari')} ${P.wks}</span></div>
      <p class="wst-msg">${msg}</p>
      <div class="wst-grid"><div><small>${tt('Now','Sekarang')}</small><b>${st.last.kg} kg</b></div><div><small>${tt('Plan for today','Rencana hari ini')}</small><b>${(+P.at(today).toFixed(1))} kg</b></div><div><small>${tt('Target date','Tanggal target')}</small><b>${shortDate(P.tDate)}</b></div></div>
      ${pace ? `<p class="small" style="margin:10px 0 0">${pace}</p>` : ''}</div>`;
  }
  return head + svg + legend + (P ? '' : setTargetBtn());
}
const setTargetBtn = () => isMinor() ? '' : `<p style="margin:10px 0 0"><button class="btn ghost sm" data-settings="weight">${I('target')}${tt('Set a target weight','Pasang target berat')}</button></p>`;

/* =========================================================
   Program settings
   ========================================================= */
const CFGK = ['roundsBox','roundsMix','len','brest','level','sets','reps','warmPlus','cool','excl','swap'];
const cfg = () => (PROF.cfg = PROF.cfg || {});
const withCfg = (patch) => Object.assign({}, PROF, { cfg:Object.assign({}, PROF.cfg || {}, patch) });
const mixType = () => Object.values(schedule(PROF).map).find(t => t !== 'BOX') || 'FBA';
function autoOf(key) {
  const p = withCfg({ [key]:undefined }), wk = weekNo();
  const bx = buildSession('BOX', p, wk), mx = buildSession(mixType(), p, wk), rep = mx.ex.find(e => !e.secs);
  return { roundsBox:bx.box && bx.box.rounds, roundsMix:mx.box ? mx.box.rounds : 0, len:(bx.box || {}).len, brest:(bx.box || {}).rest, level:(bx.box || {}).level,
    sets:mx.ex[0] && mx.ex[0].sets, reps:rep && rep.reps }[key];
}
function planBase() {
  const p = withCfg({ excl:[], swap:{} }), ids = new Set();
  Object.values(schedule(PROF).map).forEach(t => exList(t, p).forEach(id => ids.add(id)));
  return ids;
}
function planNow() { const ids = new Set(); Object.values(schedule(PROF).map).forEach(t => exList(t, PROF).forEach(id => ids.add(id))); return ids; }
let STERR = '';
function openSettings(sec) {
  $('#settings').hidden = false; document.body.classList.add('locked'); STERR = ''; renderSettings();
  const el = sec && $('#st-' + sec); $('#settings').scrollTop = el ? el.offsetTop - 70 : 0;
}
function closeSettings() { $('#settings').hidden = true; document.body.classList.remove('locked'); route(); }
function renderSettings() {
  const p = PROF, C = cfg(), wk = weekNo(), kid = isKid(p), gentle = isGentle(p);
  const ses = sessionFor(new Date()), nxt = ses || (() => { for (let i = 1; i < 8; i++) { const d = new Date(); d.setDate(d.getDate() + i); const s = sessionFor(d); if (s) return Object.assign(s, { when:d }); } return null; })();
  const sel = (key, opts, fmtv) => { const a = autoOf(key);
    return `<select class="inp sel" data-cfg="${key}" id="cf-${key}" aria-label="${key}"><option value="">${tt('Auto','Otomatis')}${a != null ? ` (${fmtv ? fmtv(a) : a})` : ''}</option>${opts.map(v => `<option value="${v}"${String(C[key]) === String(v) ? ' selected' : ''}>${fmtv ? fmtv(v) : v}</option>`).join('')}</select>`; };
  const seg = (attr, key, opts, cur) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button ${attr}="${key}" data-val="${v}" aria-pressed="${String(cur) === String(v)}">${t}</button>`).join('')}</div>`;
  const row = (lbl, ctrl, sub) => `<div class="field"><div class="lbl">${lbl}${sub ? `<span class="small" style="display:block;font-weight:400">${sub}</span>` : ''}</div>${ctrl}</div>`;
  const secs = v => fmt(v), lvl = v => L(LEVEL[v]);
  // Weight goal
  let wsec = '';
  if (!isMinor(p)) {
    const P = wplan(), cw = curW(), minW = p.h ? Math.ceil(18.5 * Math.pow(p.h / 100, 2)) : 0;
    wsec = `<h2 class="h2" id="st-weight">${tt('Weight goal','Target berat')}</h2>
      <div class="fields"><div class="field"><div class="lbl">${tt('Target weight (kg)','Target berat (kg)')}<span class="small" style="display:block;font-weight:400">${tt(`Now ${cw} kg. Leave empty for no target.`, `Sekarang ${cw} kg. Kosongkan jika tanpa target.`)}</span></div>
        <div class="tw-row"><input class="inp" id="stTw" inputmode="decimal" value="${p.tw || ''}" placeholder="kg"><button class="btn primary sm" data-st="tw">${tt('Save','Simpan')}</button></div></div></div>
      ${P ? `<p class="small">${tt(`Plan: ${P.loss ? 'lose' : 'gain'} about ${Math.abs(P.rate)} kg a week from ${P.A.kg} kg, reaching ${P.T} kg in about ${P.wks} weeks, around ${niceDate(pd(P.tDate))}.`, `Rencana: ${P.loss ? 'turun' : 'naik'} sekitar ${String(Math.abs(P.rate)).replace('.', ',')} kg per minggu dari ${P.A.kg} kg, mencapai ${P.T} kg dalam sekitar ${P.wks} minggu, sekitar ${niceDate(pd(P.tDate))}.`)}</p>` : ''}
      <p class="small">${tt(`For safety the plan never goes faster than 0.5 kg a week down or 0.25 kg up, and never below a healthy weight for your height (${minW} kg).`, `Demi keamanan, rencana tidak pernah lebih cepat dari turun 0,5 kg atau naik 0,25 kg per minggu, dan tidak di bawah berat sehat untuk tinggimu (${minW} kg).`)}</p>`;
  }
  // Exercises
  const base = planBase(), now = planNow(), av = avoidList(p), excl = C.excl || [], swap = C.swap || {};
  const exRows = GROUPS.map(([g, gl]) => {
    const ids = Object.keys(EX).filter(k => EX[k].g === g);
    return `<h3 class="st-g">${L(gl)}</h3><div class="fields">${ids.map(id => {
      const e = EX[id], bl = blocked(id, av), ex = excl.includes(id), sw = swap[id] && !blocked(swap[id], av) && !excl.includes(swap[id]) ? swap[id] : null;
      let tag = bl ? tt('Skipped for a sore joint','Dilewati karena sendi') : ex ? tt('Excluded','Dikecualikan') : sw && base.has(id) ? tt('Swapped for ','Diganti dengan ') + EX[sw].n : now.has(id) ? tt('In your plan','Di programmu') : '';
      const alts = ids.filter(k => k !== id && !blocked(k, av) && !excl.includes(k));
      const swapCtl = base.has(id) && !bl && !ex ? `<select class="inp sel sm" data-swap="${id}" aria-label="${tt('Swap','Ganti')} ${e.n}"><option value="">${tt('Keep','Tetap')}</option>${alts.map(k => `<option value="${k}"${sw === k ? ' selected' : ''}>${EX[k].n}</option>`).join('')}</select>` : '';
      return `<div class="field exrow"><div class="lbl">${e.n}${tag ? `<span class="extag${ex ? ' off' : now.has(id) ? ' on' : ''}">${tag}</span>` : ''}</div>
        <div class="exctl">${swapCtl}${bl ? '' : `<button class="chip-b sm" data-excl="${id}" aria-pressed="${ex}">${ex ? tt('Excluded','Dikecualikan') : tt('Exclude','Kecualikan')}</button>`}</div></div>`; }).join('')}</div>`; }).join('');
  const custom = CFGK.some(k => C[k] != null && !(Array.isArray(C[k]) && !C[k].length) && !(typeof C[k] === 'object' && !Array.isArray(C[k]) && !Object.keys(C[k]).length));
  const sch = schedule(p);
  $('#stIn').innerHTML = `<div class="st-top"><h1>${tt('Program settings','Pengaturan program')}</h1><button class="btn primary sm" data-st="done">${tt('Done','Selesai')}</button></div>
    <div class="st-prev">${nxt ? `${I(TYPE_IC[nxt.type] || 'workouts')}<div><small>${ses ? tt('Today','Hari ini') : tt('Next','Berikutnya') + ', ' + dayName(nxt.when.getDay())}</small><b>${nxt.name}</b><span>${tt('About','Sekitar')} ${nxt.min} ${tt('min','mnt')}${nxt.box ? `, ${nxt.box.rounds} × ${fmt(nxt.box.len)}` : ''}${nxt.ex.length ? `, ${nxt.ex.length} ${tt('exercises','latihan')} × ${nxt.ex[0].sets}` : ''}</span></div>` : ''}</div>
    <p class="small">${tt('Changes save straight away and shape every session from now on. Auto follows your check-up and the 9-week cycle.','Perubahan langsung tersimpan dan berlaku untuk sesi berikutnya. Otomatis mengikuti cek awal dan siklus 9 minggu.')}</p>
    ${STERR ? `<div class="note" role="alert">${STERR}</div>` : ''}
    ${wsec}
    <h2 class="h2" id="st-sched">${tt('Schedule','Jadwal')}</h2>
    <div class="fields">${row(tt('Training days','Hari latihan'), `<div class="chips">${DOW.map(d => `<button class="chip-b" data-sday="${d}" aria-pressed="${p.days.includes(d)}">${dayShort(d)}</button>`).join('')}</div>`)}
      ${row(tt('Minutes per session','Menit per sesi'), seg('data-sset', 'min', kid ? [[15,'15'],[20,'20']] : [[20,'20'],[30,'30'],[45,'45'],[60,'60']], p.min))}</div>
    <div class="note ${sch.conflicts ? '' : 'ok'}">${sch.conflicts ? tt('Some days now train the same muscles back to back. Spread your days out for 48 hours of recovery.','Beberapa hari melatih otot yang sama berturut-turut. Sebar hari latihan supaya ada 48 jam pemulihan.') : tt('Every muscle group still gets 48 hours to recover.','Setiap kelompok otot tetap mendapat 48 jam pemulihan.')}</div>
    ${kid ? '' : `<h2 class="h2" id="st-box">${tt('Boxing','Tinju')}</h2>
    <div class="fields">${row(tt('Rounds on boxing days','Ronde di hari tinju'), sel('roundsBox', [3,4,5,6,7,8,9,10,12]))}
      ${row(tt('Rounds on strength days','Ronde di hari kekuatan'), sel('roundsMix', [0,1,2,3,4,5,6]), tt('0 skips boxing on those days.','0 berarti tanpa tinju di hari itu.'))}
      ${row(tt('Round length','Durasi ronde'), sel('len', isTeen(p) ? [60,90,120,150] : [60,90,120,150,180], secs), gentle ? tt('Gentle mode caps rounds at 2:00.','Mode ringan membatasi ronde maksimal 2:00.') : '')}
      ${row(tt('Rest between rounds','Istirahat antar ronde'), sel('brest', [30,45,60,75,90], v => v + ' ' + tt('s','dtk')), gentle ? tt('Gentle mode keeps at least 75 s.','Mode ringan minimal 75 dtk.') : '')}
      ${row(tt('Combo level','Level kombo'), sel('level', isTeen(p) ? ['beginner','intermediate'] : ['beginner','intermediate','advanced'], lvl))}</div>
    <h2 class="h2" id="st-str">${tt('Strength','Kekuatan')}</h2>
    <div class="fields">${row(tt('Sets per exercise','Set per latihan'), sel('sets', isTeen(p) ? [1,2,3] : [1,2,3,4,5]))}
      ${row(tt('Reps per set','Repetisi per set'), sel('reps', isTeen(p) ? [10,12,14] : [6,8,10,12,14,16,18,20]), tt('Timed holds like the plank keep their seconds.','Latihan tahan seperti plank tetap memakai detik.'))}</div>
    <h2 class="h2" id="st-ex">${tt('Exercises','Latihan')}</h2>
    <p class="small">${tt('Swap an exercise for another in the same muscle group, or exclude it. Swaps stay in the same group, so the 48-hour recovery plan still works.','Ganti latihan dengan yang lain di kelompok otot yang sama, atau kecualikan. Penggantian tetap di kelompok yang sama, jadi rencana pemulihan 48 jam tetap berjalan.')}</p>
    ${exRows}`}
    <h2 class="h2" id="st-warm">${tt('Warm-up and cool-down','Pemanasan dan pendinginan')}</h2>
    ${isMinor(p) ? `<div class="note info">${kid ? kidSupTxt() : teenTxt()}</div>` : ''}
    <div class="fields">${kid ? '' : row(tt('Gentle mode','Mode ringan'), healthFlag(p) ? `<span class="pill lock">${I('lock')}${tt('On','Nyala')}</span>` : seg('data-cset', 'gentle', [['on', tt('On','Nyala')],['off', tt('Off','Mati')]], gentle ? 'on' : 'off'), healthFlag(p) ? tt('On because of your health answers. Redo the check-up after your doctor’s OK.','Aktif karena jawaban kesehatanmu. Ulangi cek awal setelah izin dokter.') : tt('Longer rests, calmer coaching, rounds up to 2:00. On by default from age 60.','Istirahat lebih lama, pelatih lebih tenang, ronde maksimal 2:00. Otomatis aktif mulai usia 60.'))}${row(tt('Warm-up length','Durasi pemanasan'), seg('data-cset', 'warmPlus', [[0, tt('Standard','Standar')],[15, '+15 ' + tt('s','dtk')],[30, '+30 ' + tt('s','dtk')]], C.warmPlus || 0), tt(`Per move. Today: about ${Math.round(((ses || nxt || {}).warm || []).length * (((ses || nxt || {}).warmSecs) || 45) / 60)} minutes.`, `Per gerakan. Hari ini: sekitar ${Math.round(((ses || nxt || {}).warm || []).length * (((ses || nxt || {}).warmSecs) || 45) / 60)} menit.`))}
      ${row(tt('Cool-down','Pendinginan'), seg('data-cset', 'cool', [['on', tt('On','Nyala')],['off', tt('Off','Mati')]], C.cool === false ? 'off' : 'on'))}</div>
    <div class="note info">${I('lock', 'sm')} ${tt('The warm-up can be made longer but never shorter or skipped. It protects your joints and muscles.','Pemanasan bisa diperpanjang, tapi tidak bisa dipersingkat atau dilewati. Ini melindungi sendi dan ototmu.')}</div>
    ${C.cool === false ? `<div class="note">${tt('Cool-down is off. A few minutes of stretching after training helps you recover, so turn it back on when you can.','Pendinginan mati. Beberapa menit peregangan setelah latihan membantu pemulihan, nyalakan lagi kalau bisa.')}</div>` : ''}
    <h2 class="h2" id="st-coach">${tt('Coach','Pelatih')}</h2>
    <div class="fields">${row(tt('Coach','Pelatih'), seg('data-sset', 'voice', [['female','Rani'],['male','Bima']], p.voice))}
      ${row(tt('Push level','Tingkat dorongan'), seg('data-sset', 'push', [['calm', tt('Calm','Tenang')],['steady', tt('Steady','Sedang')],['hard', tt('Hard','Keras')]].filter(o => !(isMinor(p) && o[0] === 'hard')), p.push))}
      ${row(tt('Combo calls','Panggilan kombo'), seg('data-sset', 'calls', [['numbers', tt('Numbers','Angka')],['names', tt('Names','Nama')],['off', tt('Off','Mati')]], p.calls))}
      ${row(tt('Stance','Kuda-kuda'), seg('data-sset', 'stance', [['orthodox','Orthodox'],['southpaw','Southpaw']], p.stance))}</div>
    <p><button class="btn ghost sm" data-voice-test>${I('voice')}${tt('Test voice','Tes suara')}</button></p>
    <div class="st-foot">${custom ? `<button class="btn ghost" data-st="reset">${tt('Reset to recommended','Kembalikan ke rekomendasi')}</button>` : ''}<button class="btn primary" data-st="done">${tt('Done','Selesai')}</button></div>`;
}
function stSave() { saveProf(); STERR = ''; renderSettings(); }
$('#settings').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const C = cfg();
  if (b.dataset.st === 'done') return closeSettings();
  if (b.dataset.st === 'reset') { if (confirm(tt('Reset program settings to the recommended values? Your target weight and coach stay.','Kembalikan pengaturan program ke rekomendasi? Target berat dan pelatih tetap.'))) { PROF.cfg = {}; stSave(); } return; }
  if (b.dataset.st === 'tw') {
    const raw = ($('#stTw').value || '').trim().replace(',', '.');
    if (!raw) { PROF.tw = ''; delete PROF.wplan; return stSave(); }
    let v = Number(raw), cw = curW(), minW = Math.ceil(18.5 * Math.pow(PROF.h / 100, 2));
    if (!(v >= 30 && v <= 250)) { STERR = tt('Enter a target between 30 and 250 kg.','Isi target antara 30 dan 250 kg.'); return renderSettings(); }
    if (Math.abs(v - cw) < .5) { STERR = tt('That’s your current weight. Pick a target at least half a kilo away, or leave it empty.','Itu berat sekarang. Pilih target minimal setengah kilo berbeda, atau kosongkan.'); return renderSettings(); }
    let note = '';
    if (v < minW) { note = tt(`${v} kg is below the healthy range for your height, so the plan aims for ${minW} kg.`, `${v} kg di bawah rentang sehat untuk tinggimu, jadi program menargetkan ${minW} kg.`); v = minW; }
    PROF.tw = v; PROF.wplan = { d:dkey(new Date()), kg:cw }; saveProf(); STERR = note; return renderSettings();
  }
  if (b.dataset.sday) {
    const d = Number(b.dataset.sday), on = PROF.days.includes(d);
    if (on && PROF.days.length === 1) { STERR = tt('Keep at least one training day.','Sisakan minimal satu hari latihan.'); return renderSettings(); }
    if (!on && PROF.days.length >= 6) { STERR = tt('Keep at least one rest day so your body can recover.','Sisakan minimal satu hari istirahat supaya badan pulih.'); return renderSettings(); }
    PROF.days = on ? PROF.days.filter(x => x !== d) : PROF.days.concat(d); return stSave();
  }
  if (b.dataset.sset) { const k = b.dataset.sset, v = /^\d+$/.test(b.dataset.val) ? Number(b.dataset.val) : b.dataset.val; PROF[k] = v;
    if (k === 'voice') { audio(); say(tt(`Hi, I’m Coach ${COACHN[v]}.`, `Halo, saya Coach ${COACHN[v]}.`), { voice:v }); }
    paintChrome(); return stSave(); }
  if (b.dataset.cset) { const k = b.dataset.cset, v = b.dataset.val; if (k === 'cool') C.cool = v === 'on' ? undefined : false; else if (k === 'gentle') { const want = v === 'on', def = PROF.age >= 60; C.gentle = want === def ? undefined : want; } else C[k] = Number(v) || undefined; return stSave(); }
  if (b.dataset.excl) {
    const id = b.dataset.excl, ex = C.excl || [], g = EX[id].g, av = avoidList(PROF);
    if (!ex.includes(id)) {
      const left = Object.keys(EX).filter(k => EX[k].g === g && k !== id && !ex.includes(k) && !blocked(k, av));
      if (!left.length) { STERR = tt('Keep at least one exercise in each muscle group.','Sisakan minimal satu latihan di setiap kelompok otot.'); return renderSettings(); }
      C.excl = ex.concat(id);
      if (C.swap) { delete C.swap[id]; Object.keys(C.swap).forEach(k => { if (C.swap[k] === id) delete C.swap[k]; }); }
    } else C.excl = ex.filter(x => x !== id);
    return stSave();
  }
});
$('#settings').addEventListener('change', e => {
  const C = cfg(), s = e.target;
  if (s.dataset.cfg) { const k = s.dataset.cfg, v = s.value; C[k] = v === '' ? undefined : (/^\d+$/.test(v) ? Number(v) : v); const id = s.id; stSave(); const n = document.getElementById(id); if (n) n.focus(); return; }
  if (s.dataset.swap) { const id = s.dataset.swap; C.swap = C.swap || {}; if (s.value) C.swap[id] = s.value; else delete C.swap[id]; stSave(); const n = $(`[data-swap="${id}"]`); if (n) n.focus(); }
});
document.addEventListener('click', e => { const s = e.target.closest('[data-settings]'); if (s && $('#settings').hidden) openSettings(s.dataset.settings); });

function renderLog() {
  const l = getLog(), ws = weekStats(), sch = schedule(PROF), FEELS = { easy:tt('felt easy','terasa mudah'), right:tt('felt right','terasa pas'), hard:tt('felt hard','terasa berat') };
  $('#v-progress').innerHTML = `<div class="jr-head"><h1 class="h1">${tt('Journal','Jurnal')}</h1><button class="btn primary sm" data-act-open="">${I('plus')}${tt('Log activity','Catat aktivitas')}</button></div>
    <section class="hero-card" aria-label="${tt('This week','Minggu ini')}"><div class="hero-row">${ringHTML(ws.days.size, (PROF.days || []).length)}
      <div class="hero-txt"><h2>${tt('This week','Minggu ini')}</h2><p>${ws.n} ${tt('sessions','sesi')}, ${ws.min} ${tt('minutes','menit')}</p></div></div>${wkStrip(sch, ws)}</section>
    ${tilesHTML(ws)}
    ${isKid() ? '' : `<p class="fine">${tt('Energy uses your watch’s number when you enter one; otherwise it’s an estimate from MET value × body weight × time.','Energi memakai angka dari jam tanganmu kalau diisi; selain itu perkiraan dari nilai MET × berat badan × waktu.')}</p>`}
    ${fastSectionHTML()}
    ${isKid() ? '' : `<h2 class="h2">${tt('Weight','Berat badan')}</h2><p class="small">${tt('Weigh yourself once a week, same day, in the morning.','Timbang seminggu sekali, di hari yang sama, pagi hari.')}</p>
    <div class="inline-form"><input class="inp" id="wIn" inputmode="decimal" placeholder="${curW() || 'kg'}" aria-label="${tt('Today’s weight in kg','Berat hari ini dalam kg')}"><button class="btn primary sm" id="wSave">${I('check')}${tt('Log weight','Catat berat')}</button></div>
    ${wchart()}`}
    <h2 class="h2">${tt('Entries','Catatan')}</h2>
    ${l.length ? `<ul class="log-list">${l.slice(0, 60).map(e => { const d = pdk(e.d);
      if (e.kind === 'act') { const a = actOf(e.at), bits = [distTxt(e), paceTxt(e), e.hr ? e.hr + ' bpm' : ''].filter(Boolean).join(', ');
        return `<li class="act"><span class="la-ic">${I(a.ic)}</span><div><b>${esc(actTitle(e))}</b><span>${dayShort(d.getDay())} ${d.getDate()} ${MON[LANG][d.getMonth()]}${bits ? ', ' + bits : ''}</span>${e.note ? `<q>${esc(e.note)}</q>` : ''}</div>
          <em>${e.min} ${tt('min','mnt')}<span class="kc">${e.kest ? '≈ ' : ''}${nfmt(e.kcal || 0)} ${tt('kcal','kkal')}${e.kest ? '' : ' ' + I('heart', 'sm')}</span></em>
          <button class="icon-btn sm" data-act-open="${e.ts}" aria-label="${tt('Edit','Ubah')} ${esc(actTitle(e))}">${I('edit')}</button></li>`; }
      return `<li><div><b>${esc(e.t ? L(TYPES[e.t].n) : e.title)}</b><span>${dayShort(d.getDay())} ${d.getDate()} ${MON[LANG][d.getMonth()]}, ${e.r || 0} ${tt('rounds','ronde')}, ${e.s || 0} set${e.early ? tt(', ended early',', selesai lebih awal') : ''}${e.feel ? ', ' + FEELS[e.feel] : ''}</span></div><em>${e.min} ${tt('min','mnt')}${isKid() ? `<span class="kc">${Array.from({ length:e.stars || 0 }, () => I('star')).join('')}</span>` : `<span class="kc">≈ ${nfmt(kcalOf(e))} ${tt('kcal','kkal')}</span>`}</em></li>`; }).join('')}</ul>`
      : `<div class="empty">${tt('Nothing yet. Finish a session or log an activity and it shows up here.','Belum ada catatan. Selesaikan sesi atau catat aktivitas, dan muncul di sini.')}</div>`}
    <p class="small" style="margin-top:18px">${tt('Saved on this device for each person, and shared with the family when Family sync is on.','Tersimpan di perangkat ini untuk tiap orang, dan dibagikan ke keluarga saat Sinkron keluarga aktif.')}</p>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const v = $('#v-progress .ring .val'); if (v) v.style.strokeDashoffset = v.dataset.off; }));
  if (FOCUS_W) { FOCUS_W = false; setTimeout(() => { const w = $('#wIn'); if (w) { w.scrollIntoView({ block:'center' }); w.focus({ preventScroll:true }); } }, 60); }
}
function renderMe() {
  const p = PROF, b = bmiOf({ h:p.h, w:curW() }), me = PROFILES.find(x => x.id === CUR) || {};
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-pset="${k}" data-val="${v}" aria-pressed="${String(p[k]) === String(v)}">${t}</button>`).join('')}</div>`;
  $('#v-me').innerHTML = `<div class="me-card">${avatarSVG({ sex:p.sex, color:PCOLORS[(me.color || 0) % PCOLORS.length], age:p.age })}<div><h1>${esc(p.name)}</h1><span class="agechip">${I('me', 'sm')}${ageLabel(p.age)}</span></div></div>
    <p class="lede" style="margin-top:4px">${p.age} ${tt('years','tahun')}${isMinor(p) ? '' : `, ${p.h} cm, ${curW()} kg, BMI ${b.toFixed(1)}`}. ${tt('Goal','Tujuan')}: ${L(GOAL[p.goal].n).toLowerCase()}. ${p.days.length} ${tt('days a week','hari seminggu')}, ${p.min} ${tt('minutes','menit')}.</p>
    ${isGentle(p) && !isKid(p) ? `<div class="note">${healthFlag(p) ? tt('Gentle mode is on. When your doctor says you’re good to go, redo the check-up.','Mode ringan aktif. Kalau dokter sudah mengizinkan, ulangi cek awal.') : tt('Gentle mode is on: longer rests, calmer coaching and shorter rounds. You can change it in Program settings.','Mode ringan aktif: istirahat lebih lama, pelatih lebih tenang, dan ronde lebih pendek. Bisa diubah di Pengaturan program.')}</div>` : ''}${isKid(p) ? `<div class="note">${kidSupTxt()}</div>` : isTeen(p) ? `<div class="note info">${teenTxt()}</div>` : ''}
    <h2 class="h2">${tt('Program and coach','Program dan pelatih')}</h2>
    <button class="qa me-set" data-settings=""><span class="qi">${I('plan')}</span><span><b>${tt('Program settings','Pengaturan program')}</b><small>${tt('Days, rounds, sets, exercises, warm-up, coach Rani or Bima','Hari, ronde, set, latihan, pemanasan, pelatih Rani atau Bima')}</small></span>${I('chev')}</button>
    <h2 class="h2">${tt('Display','Tampilan')}</h2>
    <div class="fields"><div class="field"><div class="lbl">${tt('Animations','Animasi')}<span class="small" style="display:block;font-weight:400">${tt('Turn off only if movement bothers you.','Matikan hanya kalau gerakan mengganggu.')}</span></div><div class="seg" role="group"><button data-motion="1" aria-pressed="${MOTION}">${tt('On','Nyala')}</button><button data-motion="0" aria-pressed="${!MOTION}">${tt('Off','Mati')}</button></div></div></div>
    <h2 class="h2">${tt('Plan','Program')}</h2><p>${tt('Changed your weight, health, goal or schedule? Redo the check-up. Your week number and history stay.','Berat, kesehatan, tujuan, atau jadwal berubah? Ulangi cek awal. Nomor minggu dan catatanmu tetap tersimpan.')}</p>
    <button class="btn primary" id="meRedo">${tt('Redo check-up','Ulangi cek awal')}</button>
    ${meExtraHTML()}
    <h2 class="h2">${tt('People on this device','Orang di perangkat ini')}</h2>
    <p><button class="btn ghost" id="meSwitch">${tt('Switch or add person','Ganti atau tambah orang')}</button></p>
    <p class="small">${tt('Delete removes this person’s check-up, plan, history and weights from this device.','Hapus akan menghilangkan cek awal, program, catatan, dan berat orang ini dari perangkat.')}</p>
    <button class="btn ghost" id="meDelete">${tt('Delete','Hapus')} ${esc(p.name)}</button>`;
}
const RENDER = { home:renderToday, plan:renderPlan, workouts:renderLearn, progress:renderLog, me:renderMe };
const ALIAS = { today:'home', learn:'workouts', log:'progress' };
function route() {
  paintChrome();
  if (!PROF) { if (WZ || !$('#picker').hidden) return; if (PROFILES.length) openPicker(); else openWizard(true); return; }
  let v = location.hash.slice(1); if (ALIAS[v]) { history.replaceState(null, '', '#' + ALIAS[v]); v = ALIAS[v]; } if (!RENDER[v]) v = 'home';
  document.body.dataset.view = v;
  Object.keys(RENDER).forEach(k => { const el = $('#v-' + k); el.hidden = k !== v; if (k !== v) el.innerHTML = ''; });
  RENDER[v]();
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
document.addEventListener('click', e => {
  const st = e.target.closest('[data-start]'); if (st) return startSession(st.dataset.start);
  const pd = e.target.closest('[data-pday]'); if (pd) { PLANSEL = Number(pd.dataset.pday); renderPlan(); return; }
  const psb = e.target.closest('[data-pset]'); if (psb) { PROF[psb.dataset.pset] = psb.dataset.val; saveProf(); renderMe(); paintChrome(); return; }
  const mo = e.target.closest('[data-motion]'); if (mo) { MOTION = mo.dataset.motion === '1'; store.set('motion', MOTION); renderMe(); paintChrome(); return; }
  if (e.target.id === 'meTest') { audio(); say(tt(`Hi ${PROF.name}, I’m Coach ${COACHN[PROF.voice]}. Let’s get to work.`, `Hai ${PROF.name}, saya Coach ${COACHN[PROF.voice]}. Ayo mulai latihan.`)); return; }
  if (e.target.id === 'meRedo') return openWizard(false);
  if (e.target.id === 'meSwitch') return openPicker();
  if (e.target.id === 'meDelete' && confirm(tt(`Delete ${PROF.name} from this device?`, `Hapus ${PROF.name} dari perangkat ini?`))) {
    ['profile','log','weights','wlog','w0','myw','qw'].forEach(k => ps.set(k, null));
    store.set('pdel', [...new Set(store.get('pdel', []).concat(CUR))]);
    PROFILES = PROFILES.filter(x => x.id !== CUR); store.set('profiles', PROFILES);
    CUR = null; store.set('cur', null); PROF = null; route(); return;
  }
  const who = e.target.closest('[data-who]'); if (who) return openPicker();
  const go = e.target.closest('[data-go]'); if (go) { if (go.dataset.focus) FOCUS_W = true; const h = '#' + go.dataset.go; if (location.hash !== h) location.hash = h; else route(); return; }
  if (e.target.closest('[data-voice-test]')) { audio(); say(tt(`Hi ${PROF.name}, I’m Coach ${COACHN[PROF.voice]}. Let’s get to work.`, `Hai ${PROF.name}, saya Coach ${COACHN[PROF.voice]}. Ayo mulai latihan.`)); return; }
  if (e.target.id === 'wSave') { const v = Number(($('#wIn').value || '').replace(',', '.')); if (v >= 30 && v <= 250) { addW(v); PROF.w = v; saveProf(); renderLog(); } else $('#wIn').focus(); }
});
