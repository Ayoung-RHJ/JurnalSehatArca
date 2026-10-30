/* =========================================================
   First-visit welcome (shown once per device)
   ========================================================= */
const WELCOME = {
  id:{ t:'Selamat datang di Jurnal Sehat Kita!', p:[
    'Jurnal Sehat Kita hadir untuk seluruh keluarga: ayah, ibu, kakek, nenek, sampai si kecil. Di sini kita bergerak bersama agar tubuh tetap bugar, hati tetap gembira, dan pikiran tetap jernih. Catat latihan, olahraga, dan puasa sunnah, lalu saling menyemangati.',
    'Kami percaya kesehatan yang baik adalah awal dari hidup yang sejahtera. Tubuh yang kuat membuat pikiran lebih cerah, semangat lebih besar, dan setiap hari terasa lebih bermakna.',
    'Mulailah dari langkah kecil, lakukan bersama, dan rayakan setiap kemajuan. Ayo sehat bersama keluarga!'], b:'Mulai bersama' },
  en:{ t:'Welcome to Jurnal Sehat Kita!', p:[
    'Jurnal Sehat Kita is here for the whole family: dad, mom, grandpa, grandma, all the way down to the little ones. Here we move together so our bodies stay fit, our hearts stay happy and our minds stay clear. Log workouts, sport and Sunnah fasts, and cheer each other on.',
    'We believe good health is where a good life begins. A strong body brightens the mind, lifts the spirit and makes every day feel more meaningful.',
    'Start with small steps, do it together and celebrate every bit of progress. Let’s get healthy as a family!'], b:'Start together' }
};
function renderWelcome() {
  const w = WELCOME[LANG] || WELCOME.en;
  $('#wcIn').innerHTML = `<div class="wc-top"><div class="lang" role="group" aria-label="Language"><button data-lang="en" aria-pressed="${LANG === 'en'}">EN</button><button data-lang="id" aria-pressed="${LANG === 'id'}">ID</button></div>
    <img src="${LOGO}" alt="Jurnal Sehat Kita"></div>
    <div class="wc-body"><h2 id="wcTitle">${w.t}</h2>${w.p.map(x => `<p>${x}</p>`).join('')}
    <button class="btn primary block" id="wcGo">${w.b}</button></div>`;
}
function openWelcome() { $('#welcome').hidden = false; document.body.classList.add('wlock'); renderWelcome(); setTimeout(() => { const b = $('#wcGo'); if (b) b.focus(); }, 50); }
function closeWelcome() { store.set('welcomed', 1); $('#welcome').hidden = true; document.body.classList.remove('wlock'); }
$('#welcome').addEventListener('click', e => { if (e.target.closest('#wcGo')) closeWelcome(); });
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (!$('#welcome').hidden) closeWelcome(); else if (!$('#builder').hidden) closeBuilder(); else if (!$('#settings').hidden) closeSettings(); });

/* Boot */
paintChrome();
if (!PROF && PROFILES.length > 1) openPicker();
else if (!PROF && PROFILES.length === 1) { CUR = PROFILES[0].id; store.set('cur', CUR); PROF = ps.get('profile', null); route(); }
else if (PROF && PROFILES.length > 1) { route(); openPicker(); }
else route();
if (!store.get('welcomed', 0)) openWelcome();
