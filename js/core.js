/* =========================================================
   Basics, storage, language
   ========================================================= */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + pad(s % 60); };
const dkey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const DOW = [1,2,3,4,5,6,0];
const LOGO = document.querySelector('.brand-logo').src;

/* Line icons (24px grid, 1.8 stroke, currentColor) */
const IP = {
  home:'<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11h4.5v-6h4v6h4.5V9"/>',
  plan:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M7.5 17.2h6"/>',
  workouts:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  progress:'<path d="M4 4v16h16"/><path d="m7.5 15 3.5-4 3 2.5 5-6.5"/>',
  me:'<circle cx="12" cy="8.2" r="3.9"/><path d="M4.5 20.5c1.4-3.8 4.3-5.6 7.5-5.6s6.1 1.8 7.5 5.6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M2.5 12h2M19.5 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon:'<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  flame:'<path d="M12 3c.6 3.3 5 5.4 5 10.3a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.4-5 .3 1.6 1 2.6 2 3.1C11.4 8.6 12 6 12 3Z"/>',
  bolt:'<path d="M13 2.5 5 13.5h6.5L10.8 21.5l8.2-11h-6.5L13 2.5Z"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><path d="M12 12h.01"/>',
  play:'<path d="M8 5.5v13l10.5-6.5Z"/>',
  scale:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.2 9.2a5.4 5.4 0 0 1 7.6 0M12 11.5l1.6-2.6"/>',
  stretch:'<circle cx="12" cy="4.6" r="1.9"/><path d="M4.5 9.2 12 10.6l7.5-1.4M12 10.6v4.6l-3.4 5.8M12 15.2l3.4 5.8"/>',
  glove:'<path d="M7 13.5V9a5 5 0 0 1 5-5h1.3A4.7 4.7 0 0 1 18 8.7v4.6a3 3 0 0 1-3 3H8.5"/><path d="M7 11.3a2.1 2.1 0 0 0-2.1 2.1v.4c0 1.2.9 2.1 2.1 2.1"/><rect x="8" y="16.3" width="8.2" height="4.2" rx="1"/><path d="M11 8.6h4"/>',
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c1-3.4 3.4-5 6.2-5s5.2 1.6 6.2 5"/><path d="M15.6 4.9a3.4 3.4 0 0 1 0 6.2M17.6 15.2c1.9.7 3.1 2.2 3.7 4.8"/>',
  voice:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a7.8 7.8 0 0 1 0 11"/>',
  chev:'<path d="m9 5.5 6.5 6.5L9 18.5"/>',
  swap:'<path d="M4 9h15l-4-4M20 15H5l4 4"/>',
  star:'<path d="m12 3.3 2.7 5.4 5.9.9-4.3 4.1 1 5.9L12 16.8l-5.3 2.8 1-5.9-4.3-4.1 5.9-.9Z"/>',
  heart:'<path d="M12 20s-7.6-4.6-7.6-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.6 2.6C19.6 15.4 12 20 12 20Z"/>',
  feet:'<path d="M8.3 3.5c1.9 0 2.9 2 2.9 4.9s-1 5.8-2.9 5.8S5.4 11.3 5.4 8.4s1-4.9 2.9-4.9ZM15.7 9.8c1.9 0 2.9 2 2.9 4.9s-1 5.8-2.9 5.8-2.9-2.9-2.9-5.8 1-4.9 2.9-4.9Z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.9h.01"/>'
};
const I = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${IP[n] || ''}</svg>`;
let FOCUS_W = false;


const store = {
  get(k, d) { try { const v = localStorage.getItem('corner3:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { if (v === null) localStorage.removeItem('corner3:' + k); else localStorage.setItem('corner3:' + k, JSON.stringify(v)); } catch (e) {} }
};
let LANG = store.get('lang', 'id');
const tt = (en, id) => LANG === 'id' ? id : en;
const L = x => Array.isArray(x) ? (LANG === 'id' ? x[1] : x[0]) : x;
const DAYN = { en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], id:['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'] };
const MON = { en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], id:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'] };
const dayName = d => DAYN[LANG][d], dayShort = d => DAYN[LANG][d].slice(0, 3), dayLetter = d => DAYN[LANG][d][0];
const niceDate = d => d.getDate() + ' ' + MON[LANG][d.getMonth()] + ' ' + d.getFullYear();
let MOTION = store.get('motion', true);

/* Profiles: every person gets their own namespace on this device */
let PROFILES = store.get('profiles', []);
let CUR = store.get('cur', null);
const ps = {
  get: (k, d) => CUR ? store.get('p:' + CUR + ':' + k, d) : d,
  set: (k, v) => { if (CUR) store.set('p:' + CUR + ':' + k, v); }
};
(function migrate() {
  try {
    const old = localStorage.getItem('corner2:profile');
    if (old && !PROFILES.length) {
      const id = 'p' + Date.now(), pr = JSON.parse(old);
      PROFILES = [{ id, name:pr.name, sex:pr.sex, color:0 }];
      ['profile','log','weights','wlog','w0'].forEach(k => { const v = localStorage.getItem('corner2:' + k); if (v) localStorage.setItem('corner3:p:' + id + ':' + k, v); });
      store.set('profiles', PROFILES); store.set('cur', id); CUR = id;
    }
  } catch (e) {}
})();
if (CUR && !PROFILES.find(p => p.id === CUR)) CUR = null;
/* Jurnal Sehat Kita: everyone switches to Indonesian once; the EN toggle still works afterwards */
try {
  if (!localStorage.getItem('corner3:_id1')) {
    LANG = 'id'; localStorage.setItem('corner3:lang', '"id"');
    PROFILES.forEach(p => { const k = 'corner3:p:' + p.id + ':profile', v = JSON.parse(localStorage.getItem(k) || 'null'); if (v && v.lang !== 'id') { v.lang = 'id'; localStorage.setItem(k, JSON.stringify(v)); } });
    localStorage.setItem('corner3:_id1', '1');
  }
} catch (e) {}
let PROF = CUR ? ps.get('profile', null) : null;
if (PROF && PROF.lang) LANG = PROF.lang;
const saveProf = () => ps.set('profile', PROF);

/* Theme */
function applyTheme(t) {
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  const dark = t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  $('#themeBtn').innerHTML = I(dark ? 'sun' : 'moon');
}
applyTheme(store.get('theme', null));
$('#themeBtn').addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark'; store.set('theme', next); applyTheme(next);
});

/* =========================================================
   Sound, coach voice, wake lock
   ========================================================= */
let ac;
function audio() {
  if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(freq, dur, type = 'sine', vol = .3, when = 0) {
  const c = audio(); if (!c) return;
  const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
}
function bell(n = 1) { for (let i = 0; i < n; i++) { const w = i * .5; tone(830, 1.6, 'sine', .4, w); tone(1660, 1, 'sine', .14, w); tone(2490, .6, 'sine', .07, w); } }
function beep(high) { tone(high ? 1320 : 880, .14, 'square', .1); }
function ding() { tone(1320, .5, 'sine', .25); tone(1980, .35, 'sine', .08); }
function clap() { for (let i = 0; i < 3; i++) tone(2200, .05, 'square', .18, i * .16); }

let VOICES = [];
const hasSpeech = 'speechSynthesis' in window;
function loadVoices() { if (hasSpeech) VOICES = speechSynthesis.getVoices(); }
if (hasSpeech) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const FEM = /\bfemale\b|samantha|victoria|karen|moira|tessa|fiona|zira|susan|hazel|serena|allison|\bava\b|joanna|salli|kimberly|libby|sonia|jenny|\baria\b|google us english|damayanti|gadis|google bahasa/i;
const MAL = /\bmale\b|daniel|\balex\b|fred|david|\bmark\b|george|james|rishi|oliver|aaron|arthur|gordon|\bguy\b|ryan|thomas|\bardi\b/i;
function coachVoice(g, lang) {
  const pool = VOICES.filter(v => new RegExp('^' + lang, 'i').test(v.lang));
  const want = g === 'male' ? MAL : FEM, avoid = g === 'male' ? FEM : MAL;
  const exact = pool.find(v => want.test(v.name) && !avoid.test(v.name));
  return { v:exact || pool[0] || null, exact:!!exact };
}
const COACHN = { female:'Rani', male:'Bima' };
function say(text, opt = {}) {
  const sub = $('#plSay'); if (sub && !opt.quiet && !/^\d+$/.test(text)) sub.textContent = text;
  if (!hasSpeech || !text) return;
  const p = PROF || {};
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text), g = opt.voice || p.voice || 'female';
  const { v, exact } = coachVoice(g, LANG);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = LANG === 'id' ? 'id-ID' : 'en-US';
  u.pitch = exact ? 1 : (g === 'male' ? .72 : 1.25);
  u.rate = opt.rate || 1.06;
  speechSynthesis.speak(u);
}
const hush = () => { if (hasSpeech) speechSynthesis.cancel(); };
let wake = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) wake = await navigator.wakeLock.request('screen');
    else if (!on && wake) { await wake.release(); wake = null; }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S) keepAwake(true); });
