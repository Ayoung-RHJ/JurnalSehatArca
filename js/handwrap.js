/* =========================================================
   Cara Membalut Tangan: hand-wrap step player
   - Latihan card at the start of the boxing section (teen, adult, elder; hidden for kids)
   - Shown once automatically before a person's first boxing session (teen and adult), with "Lewati"
   - Step player: one image per step, caption + coach tip, Back / Next, auto-play ~5 s, Replay,
     left / right hand (right hand mirrors the images)
   ========================================================= */
const WRAP = [
  { t:['Hook the loop over your thumb and run the wrap across the back of your hand toward the wrist.','Kaitkan lubang balutan ke jempol, lalu tarik melintasi punggung tangan ke arah pergelangan.'],
    tip:['Keep your fingers spread the whole time!','Rentangkan jari selama membalut!'] },
  { t:['Wrap the wrist 3 times, snug and flat.','Lilit pergelangan 3 kali, rapat dan rata.'],
    tip:['Wrap a little above the wrist for extra support.','Lilit sedikit ke atas pergelangan untuk topangan ekstra.'] },
  { t:['Cross the back of the hand, then wrap the knuckles 3 times as padding.','Lintasi punggung tangan, lalu lilit buku jari 3 kali sebagai bantalan.'] },
  { t:['Go diagonally down to the wrist and wrap it once.','Tarik diagonal turun ke pergelangan, lalu lilit sekali.'],
    tip:['The wrap always travels from the thumb side to the pinky side.','Balutan selalu bergerak dari sisi jempol ke sisi kelingking.'] },
  { t:['Pass the wrap between the pinky and ring, ring and middle, middle and index finger, returning to the wrist each time.','Selipkan balutan di celah jari: kelingking–manis, manis–tengah, tengah–telunjuk. Setiap kali kembali ke pergelangan.'],
    tip:['One strip per finger gap.','Satu strip di setiap celah jari.'] },
  { t:['Wrap once around the base of the thumb, then back to the wrist.','Lilit sekali di pangkal jempol, lalu kembali ke pergelangan.'] },
  { t:['Crisscross the rest over the back of the hand and close the velcro at the wrist.','Habiskan sisa balutan menyilang di punggung tangan, lalu kunci dengan velcro di pergelangan.'] },
  { t:['Make a fist. Snug, no throbbing or tingling. Thumb outside the fist!','Kepalkan tangan. Harus pas, tidak berdenyut atau kesemutan. Jempol di luar kepalan!'],
    tip:['If your fingers tingle, rewrap looser.','Kalau jari kesemutan, ulangi lebih longgar.'] }
];
const wrapImg = i => `img/wrap/wrap-${i + 1}.webp`;
const wrapAllowed = (p = PROF) => !!p && ageGroup(p.age) !== 'kid';
const wrapFirstTime = (p = PROF) => !!p && ['teen','adult'].includes(ageGroup(p.age)) && !ps.get('wrapseen', false);
const coachName = () => ((PROF && PROF.voice) || 'female') === 'female' ? 'Rani' : 'Bima';

let HW = null;   // { i, hand:'L'|'R', auto, timer, then }
function openWrap(opts = {}) {
  let el = $('#wrapSheet');
  if (!el) { el = document.createElement('div'); el.id = 'wrapSheet'; el.className = 'sheet'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="sheet-in" id="hwIn"></div>'; document.body.appendChild(el); }
  HW = { i:0, hand:store.get('wraphand', 'L'), auto:false, timer:null, then:opts.then || null };
  el.setAttribute('aria-label', tt('How to wrap your hands','Cara membalut tangan'));
  el.hidden = false; document.body.classList.add('locked'); renderWrap();
  setTimeout(() => { const b = $('#hwIn [data-hw="next"]'); if (b) b.focus(); }, 40);
}
function closeWrap(go) {
  if (!HW) return; clearInterval(HW.timer); const then = HW.then; HW = null;
  $('#wrapSheet').hidden = true; document.body.classList.remove('locked');
  if (PROF) ps.set('wrapseen', true);
  if (go && then) then();
}
function renderWrap() {
  const s = WRAP[HW.i], last = HW.i === WRAP.length - 1, n = WRAP.length;
  $('#hwIn').innerHTML = `<div class="sheet-top"><button class="icon-btn" data-hw="close" aria-label="${tt('Close','Tutup')}">${I('close')}</button></div>
    <h1 class="h1">${tt('How to wrap your hands','Cara membalut tangan')}</h1>
    <p class="lede">${tt('For 180" (4.5 m) wraps. Repeat on the other hand. Needed when you hit a bag or pads; for shadow boxing you can train without wraps.','Untuk balutan 180" (4,5 m). Ulangi untuk tangan satunya. Wajib jika memukul samsak atau pad. Untuk shadow boxing, boleh tanpa balutan.')}</p>
    <div class="hw-top"><div class="seg" role="group" aria-label="${tt('Hand','Tangan')}">${[['L', tt('Left hand','Tangan kiri')], ['R', tt('Right hand','Tangan kanan')]].map(([v, t]) => `<button data-hwhand="${v}" aria-pressed="${HW.hand === v}">${t}</button>`).join('')}</div>
      <button class="btn ghost sm" data-hw="auto" aria-pressed="${HW.auto}">${I(HW.auto ? 'clock' : 'play')}${HW.auto ? tt('Auto-play on','Putar otomatis aktif') : tt('Auto-play','Putar otomatis')}</button></div>
    <div class="hw-dots" aria-hidden="true">${WRAP.map((_, k) => `<i class="${k === HW.i ? 'on' : k < HW.i ? 'done' : ''}"></i>`).join('')}</div>
    <figure class="hw-fig"><img src="${wrapImg(HW.i)}" alt="${tt('Step','Langkah')} ${HW.i + 1}: ${esc(L(s.t))}" class="${HW.hand === 'R' ? 'mirror' : ''}">
      <figcaption><span class="hw-n">${tt('Step','Langkah')} ${HW.i + 1} ${tt('of','dari')} ${n}</span><b>${esc(L(s.t))}</b></figcaption></figure>
    ${s.tip ? `<div class="coachline hw-tip">${coachAv()}<p><b>${coachName()}:</b> ${esc(L(s.tip))}</p></div>` : ''}
    <div class="wz-nav hw-nav"><button class="btn ghost" data-hw="back"${HW.i ? '' : ' disabled'}>${tt('Back','Kembali')}</button>
      ${last ? `<button class="btn ghost" data-hw="replay">${tt('Replay','Ulangi')}</button><button class="btn primary" data-hw="done">${HW.then ? tt('Start training','Mulai latihan') : tt('Done','Selesai')}</button>`
        : `<button class="btn primary" data-hw="next">${tt('Next','Lanjut')}</button>`}</div>
    ${HW.then ? `<p class="hw-skip"><button class="linkish" data-hw="skip">${tt('Skip, I’m not using wraps today','Lewati, hari ini tidak pakai balutan')}</button></p>` : ''}
    <div class="sr-only" aria-live="polite">${tt('Step','Langkah')} ${HW.i + 1}: ${esc(L(s.t))}</div>`;
  // preload the next picture so Next is instant
  if (!last) { const im = new Image(); im.src = wrapImg(HW.i + 1); }
}
function wrapStep(d) {
  if (!HW) return; HW.i = Math.max(0, Math.min(WRAP.length - 1, HW.i + d)); renderWrap();
  if (HW.i === WRAP.length - 1) stopAuto();
}
function stopAuto() { if (!HW) return; clearInterval(HW.timer); HW.timer = null; if (HW.auto) { HW.auto = false; renderWrap(); } }
document.addEventListener('click', e => {
  const o = e.target.closest('[data-wrap-open]'); if (o) { openWrap(); return; }
  if (!HW) return;
  const h = e.target.closest('[data-hwhand]'); if (h) { HW.hand = h.dataset.hwhand; store.set('wraphand', HW.hand); renderWrap(); return; }
  const b = e.target.closest('[data-hw]'); if (!b) return;
  const a = b.dataset.hw;
  if (a === 'close') closeWrap(false);
  else if (a === 'skip' || a === 'done') closeWrap(true);
  else if (a === 'next') { stopAutoQuiet(); wrapStep(1); }
  else if (a === 'back') { stopAutoQuiet(); wrapStep(-1); }
  else if (a === 'replay') { HW.i = 0; renderWrap(); }
  else if (a === 'auto') {
    if (HW.auto) return stopAuto();
    HW.auto = true; if (HW.i === WRAP.length - 1) HW.i = 0; renderWrap();
    HW.timer = setInterval(() => { if (!HW || $('#wrapSheet').hidden) return; wrapStep(1); }, 5000);
  }
});
function stopAutoQuiet() { if (HW && HW.auto) { clearInterval(HW.timer); HW.timer = null; HW.auto = false; } }
document.addEventListener('keydown', e => {
  if (!HW || $('#wrapSheet').hidden) return;
  if (e.key === 'Escape') closeWrap(false);
  else if (e.key === 'ArrowRight') { stopAutoQuiet(); wrapStep(1); }
  else if (e.key === 'ArrowLeft') { stopAutoQuiet(); wrapStep(-1); }
});

/* Latihan card (first thing in the boxing part of the library) */
function wrapCardHTML() {
  if (!wrapAllowed()) return '';
  return `<h2 class="h2">${tt('Before boxing','Persiapan')}</h2>
    <button class="card hw-card" data-wrap-open><img src="${wrapImg(7)}" alt="" loading="lazy">
      <span><b>${tt('How to wrap your hands','Cara membalut tangan')}</b>
      <small>${tt('8 steps, about 2 minutes. Needed for bag or pad work.','8 langkah, sekitar 2 menit. Wajib untuk samsak atau pad.')}</small></span>${I('chev')}</button>`;
}
/* Small link next to a boxing session's start button */
const wrapLinkHTML = type => type === 'BOX' && wrapAllowed() ? `<p class="hw-link"><button class="linkish" data-wrap-open>${I('glove', 'sm')} ${tt('How to wrap your hands','Cara membalut tangan')}</button></p>` : '';

/* First boxing session for a teen or adult: show the guide once, then start */
const _startSession = startSession;
startSession = function (type, given) {
  const isBox = type === 'BOX' || (given && given.type === 'BOX');
  if (isBox && wrapFirstTime()) { openWrap({ then:() => _startSession(type, given) }); return; }
  return _startSession(type, given);
};
