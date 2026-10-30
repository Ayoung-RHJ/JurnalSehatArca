/* =========================================================
   Quick workout and My workouts
   ========================================================= */
Object.assign(IP, { up:'<path d="m6 14.5 6-6 6 6"/>', down:'<path d="m6 9.5 6 6 6-6"/>', x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>' });
const kidSupTxt = () => tt('Kids train with a grown-up nearby. Bodyweight only, no weights, and never more than 20 minutes.','Anak berlatih dengan orang dewasa di dekatnya. Tanpa beban, dan tidak lebih dari 20 menit.');
const teenTxt = () => tt('Teen plan: technique first. Combos are called a little slower, dumbbells stay light, reps stay between 10 and 15, and there are no weight-loss targets.','Program remaja: teknik dulu. Kombo dipanggil lebih pelan, dumbbell tetap ringan, repetisi 10 sampai 15, dan tanpa target turun berat.');
const getMyW = () => ps.get('myw', []);
function qwState() {
  const q = Object.assign({ focus:'full', min:20, eq:'db' }, ps.get('qw', {}));
  if (isKid()) { q.min = Math.min(q.min, 20); q.eq = 'bw'; }
  return q;
}
function sesParts(s) {
  const parts = [`${tt('warm-up','pemanasan')} ${Math.max(1, Math.round(s.warm.length * s.warmSecs / 60))} ${tt('min','mnt')}`];
  if (s.box) parts.push(`${s.box.rounds} × ${fmt(s.box.len)} ${tt('rounds','ronde')}`);
  if (s.play) parts.push(`${s.play.moves.length} ${tt('play moves','gerakan main')}`);
  if (s.ex.length) parts.push(`${s.ex.length} ${tt('exercises','latihan')}`);
  if (s.cool.length) parts.push(tt('cool-down','pendinginan'));
  return parts.join(', ');
}
function quickHTML() {
  const q = qwState(), kid = isKid(), s = quickSession(q, PROF);
  const chip = (attr, v, label, cur) => `<button class="chip-b" ${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${label}</button>`;
  return `<section class="qw" id="qw" aria-labelledby="qwT"><div class="qw-h"><span class="tc-ic">${I('bolt')}</span><div><h2 id="qwT">${tt('Quick workout','Latihan singkat')}</h2><p>${kid ? tt('Pick how long you want to play.','Pilih berapa lama mau bermain.') : tt('Pick a focus and how much time you have.','Pilih fokus dan waktu yang kamu punya.')}</p></div></div>
    ${kid ? '' : `<span class="lbl-top">${tt('Focus','Fokus')}</span><div class="chips">${Object.entries(QFOCUS).map(([k, v]) => chip('data-qf', k, L(v.n), q.focus)).join('')}</div>`}
    <span class="lbl-top">${tt('Time','Waktu')}</span><div class="chips">${(kid ? [10,15,20] : [10,15,20,30,45]).map(m => chip('data-qm', m, m + ' ' + tt('min','mnt'), q.min)).join('')}</div>
    ${kid || q.focus === 'mob' ? '' : `<span class="lbl-top">${tt('Equipment','Alat')}</span><div class="chips">${chip('data-qe', 'db', tt('Dumbbells','Dumbbell'), q.eq)}${chip('data-qe', 'bw', tt('Bodyweight only','Tanpa alat'), q.eq)}</div>`}
    <div class="qw-prev"><b>${tt('About','Sekitar')} ${s.min} ${tt('minutes','menit')}</b><span>${sesParts(s)}</span>${s.ex.length ? `<span class="qw-ex">${s.ex.map(e => EX[e.id].n).join(', ')}</span>` : ''}</div>
    ${recoveryNote(s.gr || [])}
    <button class="btn primary block" data-quick>${I('play')}${tt('Start quick workout','Mulai latihan singkat')}</button></section>`;
}
function mywHTML() {
  const l = getMyW();
  return `<section class="myw" aria-labelledby="mywT"><div class="myw-h"><h2 class="h2" id="mywT">${tt('My workouts','Latihanku')}</h2><button class="btn ghost sm" data-myw-new>${I('plus')}${tt('New workout','Latihan baru')}</button></div>
    ${l.length ? `<div class="myw-list">${l.map(w => { const s = myWorkoutSession(w, PROF);
      return `<div class="myw-card"><div class="myw-t"><b>${esc(w.name)}</b><span>${tt('About','Sekitar')} ${s.min} ${tt('min','mnt')}: ${sesParts(s)}</span></div>
        <div class="myw-a"><button class="btn ghost sm" data-myw-edit="${w.id}">${tt('Edit','Ubah')}</button><button class="btn primary sm" data-myw-start="${w.id}" aria-label="${tt('Start','Mulai')} ${esc(w.name)}">${I('play')}${tt('Start','Mulai')}</button></div></div>`; }).join('')}</div>`
      : `<div class="empty">${tt('Build your own session: choose rounds and exercises, give it a name, and it’s saved here for next time.','Susun sesimu sendiri: pilih ronde dan latihan, beri nama, lalu tersimpan di sini untuk lain kali.')}</div>`}</section>`;
}
document.addEventListener('click', e => {
  const q = e.target.closest('[data-qf],[data-qm],[data-qe]');
  if (q) { const s = qwState(); if (q.dataset.qf) s.focus = q.dataset.qf; if (q.dataset.qm) s.min = Number(q.dataset.qm); if (q.dataset.qe) s.eq = q.dataset.qe;
    ps.set('qw', s); const el = $('#qw'); if (el) { el.outerHTML = quickHTML(); const b = $(`#qw [${Object.keys(q.dataset)[0].replace(/[A-Z]/g, c => '-' + c.toLowerCase()).replace(/^/, 'data-')}="${Object.values(q.dataset)[0]}"]`); if (b) b.focus(); } return; }
  if (e.target.closest('[data-quick]')) return startSession(null, quickSession(qwState(), PROF));
  const ms = e.target.closest('[data-myw-start]'); if (ms) { const w = getMyW().find(x => x.id === ms.dataset.mywStart); if (w) startSession(null, myWorkoutSession(w, PROF)); return; }
  const me = e.target.closest('[data-myw-edit]'); if (me) return openBuilder(me.dataset.mywEdit);
  if (e.target.closest('[data-myw-new]')) return openBuilder(null);
});

/* Builder */
let BW = null, BERR = '';
function openBuilder(id) {
  const kid = isKid(), w = id && getMyW().find(x => x.id === id);
  BW = w ? JSON.parse(JSON.stringify(w)) : kid ? { name:'', rounds:2, moves:['balloon','frog','hero'], cool:true }
    : { name:'', eq:'db', rounds:3, len:120, brest:60, ex:[], sets:3, reps:12, cool:true };
  BERR = ''; $('#builder').hidden = false; document.body.classList.add('locked'); renderBuilder(); $('#builder').scrollTop = 0;
  setTimeout(() => { const n = $('#bdName'); if (n && !BW.name) n.focus(); }, 60);
}
function closeBuilder() { $('#builder').hidden = true; document.body.classList.remove('locked'); BW = null; route(); }
function renderBuilder() {
  const p = PROF, kid = isKid(p), teen = isTeen(p), gentle = isGentle(p), av = avoidList(p), excl = (p.cfg && p.cfg.excl) || [];
  const s = myWorkoutSession(Object.assign({ name:BW.name || '-', ex:[] }, BW), p);
  const opt = (k, opts, f) => `<select class="inp sel" data-bw="${k}" id="bw-${k}">${opts.map(v => `<option value="${v}"${String(BW[k]) === String(v) ? ' selected' : ''}>${f ? f(v) : v}</option>`).join('')}</select>`;
  const row = (lbl, ctrl, sub) => `<div class="field"><div class="lbl">${lbl}${sub ? `<span class="small" style="display:block;font-weight:400">${sub}</span>` : ''}</div>${ctrl}</div>`;
  const list = kid ? BW.moves : BW.ex, nm = id => kid ? L(MOVES[id].n) : EX[id].n;
  const items = list.length ? `<ol class="bd-list">${list.map((id, i) => `<li><span class="bd-n">${i + 1}</span><b>${nm(id)}</b><span class="bd-act">
      <button class="icon-btn sm" data-bmv="${i}:-1" aria-label="${tt('Move up','Naikkan')}"${i ? '' : ' disabled'}>${I('up')}</button><button class="icon-btn sm" data-bmv="${i}:1" aria-label="${tt('Move down','Turunkan')}"${i < list.length - 1 ? '' : ' disabled'}>${I('down')}</button><button class="icon-btn sm" data-brm="${i}" aria-label="${tt('Remove','Hapus')} ${nm(id)}">${I('x')}</button></span></li>`).join('')}</ol>`
    : `<p class="small">${tt('No moves yet. Add some below.','Belum ada gerakan. Tambahkan di bawah.')}</p>`;
  let add;
  if (kid) add = `<select class="inp sel" id="bdAdd" aria-label="${tt('Add a move','Tambah gerakan')}"><option value="">${tt('Add a play move','Tambah gerakan main')}</option>${KIDPLAY.filter(k => !BW.moves.includes(k)).map(k => `<option value="${k}">${L(MOVES[k].n)}</option>`).join('')}</select>`;
  else add = `<select class="inp sel" id="bdAdd" aria-label="${tt('Add an exercise','Tambah latihan')}"><option value="">${tt('Add an exercise','Tambah latihan')}</option>${GROUPS.map(([g, gl]) => {
      const ks = Object.keys(EX).filter(k => EX[k].g === g && !blocked(k, av) && !excl.includes(k) && !BW.ex.includes(k) && (BW.eq !== 'bw' || BW_OK.includes(k)));
      return ks.length ? `<optgroup label="${L(gl)}">${ks.map(k => `<option value="${k}">${EX[k].n}</option>`).join('')}</optgroup>` : ''; }).join('')}</select>`;
  const lens = [60,90,120,150,180].filter(v => !(gentle && v > 120) && !(teen && v > 150));
  $('#bdIn').innerHTML = `<div class="st-top"><h1>${BW.id ? tt('Edit workout','Ubah latihan') : tt('New workout','Latihan baru')}</h1><button class="btn ghost sm" data-bd="cancel">${tt('Cancel','Batal')}</button><button class="btn primary sm" data-bd="save">${tt('Save','Simpan')}</button></div>
    <label class="lbl-top" for="bdName">${tt('Name','Nama')}</label><input class="inp" id="bdName" maxlength="40" value="${esc(BW.name)}" placeholder="${kid ? tt('For example: Saturday play','Misalnya: Main hari Sabtu') : tt('For example: Lunch break boxing','Misalnya: Tinju jam istirahat')}">
    ${BERR ? `<div class="note" role="alert">${BERR}</div>` : ''}
    <div class="st-prev">${I(kid ? 'star' : 'workouts')}<div><small>${tt('Preview','Pratinjau')}</small><b>${tt('About','Sekitar')} ${s.min} ${tt('minutes','menit')}</b><span>${sesParts(s)}</span></div></div>
    <div class="note info">${I('lock', 'sm')} ${tt('A warm-up is added at the start automatically and can’t be skipped.','Pemanasan otomatis ditambahkan di awal dan tidak bisa dilewati.')}${kid ? ' ' + tt('Kids’ workouts are trimmed to fit 20 minutes.','Latihan anak dipangkas supaya muat 20 menit.') : ''}</div>
    ${recoveryNote(s.gr || [])}
    <h2 class="h2">${tt('Boxing','Tinju')}</h2>
    <div class="fields">${row(tt('Rounds','Ronde'), opt('rounds', kid ? [0,1,2,3] : [0,1,2,3,4,5,6,8,10,12]), kid ? tt('One-minute play rounds with simple combos.','Ronde main 1 menit dengan kombo sederhana.') : tt('0 means no boxing.','0 berarti tanpa tinju.'))}
      ${kid ? '' : row(tt('Round length','Durasi ronde'), opt('len', lens, v => fmt(v))) + row(tt('Rest between rounds','Istirahat antar ronde'), opt('brest', [30,45,60,75,90].filter(v => !(gentle && v < 75)), v => v + ' ' + tt('s','dtk')))}</div>
    <h2 class="h2">${kid ? tt('Play moves','Gerakan main') : tt('Exercises','Latihan')}</h2>
    ${kid ? '' : `<div class="seg bd-eq" role="group">${[['db', tt('Dumbbells','Dumbbell')],['bw', tt('Bodyweight only','Tanpa alat')]].map(([v, t]) => `<button data-beq="${v}" aria-pressed="${BW.eq === v}">${t}</button>`).join('')}</div>`}
    ${items}${add}
    ${kid ? '' : `<div class="fields" style="margin-top:14px">${row(tt('Sets per exercise','Set per latihan'), opt('sets', teen ? [1,2,3] : [1,2,3,4,5]))}${row(tt('Reps per set','Repetisi per set'), opt('reps', teen ? [10,12,14] : [6,8,10,12,14,16,18,20]), tt('Timed holds keep their seconds.','Latihan tahan tetap memakai detik.'))}</div>
      ${teen ? `<div class="note info">${teenTxt()}</div>` : ''}`}
    <h2 class="h2">${tt('Cool-down','Pendinginan')}</h2>
    <div class="seg" role="group">${[['on', tt('On','Nyala')],['off', tt('Off','Mati')]].map(([v, t]) => `<button data-bcool="${v}" aria-pressed="${(BW.cool !== false) === (v === 'on')}">${t}</button>`).join('')}</div>
    <div class="st-foot">${BW.id ? `<button class="btn ghost" data-bd="delete">${tt('Delete','Hapus')}</button>` : ''}<button class="btn primary" data-bd="save">${tt('Save workout','Simpan latihan')}</button></div>`;
}
function bdRe(focusSel) { BERR = ''; renderBuilder(); if (focusSel) { const n = $(focusSel); if (n) n.focus(); } }
$('#builder').addEventListener('input', e => { if (e.target.id === 'bdName' && BW) BW.name = e.target.value; });
$('#builder').addEventListener('change', e => {
  if (!BW) return; const t = e.target, kid = isKid();
  if (t.dataset.bw) { BW[t.dataset.bw] = Number(t.value); return bdRe('#' + t.id); }
  if (t.id === 'bdAdd' && t.value) { (kid ? BW.moves : BW.ex).push(t.value); return bdRe('#bdAdd'); }
});
$('#builder').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !BW) return;
  const kid = isKid(), list = kid ? BW.moves : BW.ex;
  if (b.dataset.bmv) { const [i, d] = b.dataset.bmv.split(':').map(Number), j = i + d; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; return bdRe(`[data-bmv="${j}:${d}"]`); }
  if (b.dataset.brm) { list.splice(Number(b.dataset.brm), 1); return bdRe('#bdAdd'); }
  if (b.dataset.beq) { BW.eq = b.dataset.beq; if (BW.eq === 'bw') { const before = BW.ex.length; BW.ex = BW.ex.filter(k => BW_OK.includes(k)); bdRe(); if (BW.ex.length < before) { BERR = tt('Exercises that need dumbbells were removed.','Latihan yang butuh dumbbell dihapus.'); renderBuilder(); } return; } return bdRe(); }
  if (b.dataset.bcool) { BW.cool = b.dataset.bcool === 'on'; return bdRe(); }
  if (b.dataset.bd === 'cancel') return closeBuilder();
  if (b.dataset.bd === 'delete') { if (confirm(tt(`Delete “${BW.name}”?`, `Hapus “${BW.name}”?`))) { ps.set('myw', getMyW().filter(x => x.id !== BW.id)); closeBuilder(); } return; }
  if (b.dataset.bd === 'save') {
    BW.name = String(BW.name || '').trim();
    if (!BW.name) { BERR = tt('Give your workout a name.','Beri nama latihanmu.'); renderBuilder(); const n = $('#bdName'); if (n) n.focus(); return; }
    if (!BW.rounds && !list.length) { BERR = kid ? tt('Add at least one boxing round or play move.','Tambahkan minimal satu ronde tinju atau gerakan main.') : tt('Add at least one boxing round or exercise.','Tambahkan minimal satu ronde tinju atau latihan.'); return renderBuilder(); }
    const all = getMyW();
    if (BW.id) { const i = all.findIndex(x => x.id === BW.id); if (i >= 0) all[i] = BW; }
    else { if (all.length >= 12) { BERR = tt('You can keep up to 12 workouts. Delete one first.','Maksimal 12 latihan. Hapus satu dulu.'); return renderBuilder(); } BW.id = 'w' + Date.now(); all.push(BW); }
    ps.set('myw', all); closeBuilder();
  }
});
