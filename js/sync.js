/* =========================================================
   Family sync (Supabase), profile PINs, backup export and import
   Data still lives in this browser first (corner3:*). Sync copies it to the family's
   rows in Supabase and brings back changes made on other devices. Newest change wins;
   the people list, workout log and weight log are merged instead.
   ========================================================= */
const SYNC = { url:'https://kbrniessfsmnyqmbruxy.supabase.co', key:'sb_publishable_lvBaPQUCgmxBKl56xYIUBg_f55mKTaI' };
const LOCAL_ONLY = new Set(['cur','lang','motion','planview','theme','welcomed','fam']);
const syncable = k => !!k && !LOCAL_ONLY.has(k) && k[0] !== '_';
const _rawSet = store.set;
let MT = store.get('_mt', {}), DIRTY = new Set(store.get('_dirty', []));
const saveMeta = () => { _rawSet('_mt', MT); _rawSet('_dirty', [...DIRTY]); };
store.set = (k, v) => {
  _rawSet(k, v);
  if (!syncable(k)) return;
  MT[k] = Date.now(); DIRTY.add(k); saveMeta(); syncSoon();
};
const allLocalKeys = () => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('corner3:')) out.push(k.slice(8)); } return out; };
const famGet = () => store.get('fam', null);
const famSet = f => _rawSet('fam', f);

/* ---- merging for lists that grow on more than one device ---- */
const byKey = (a, b, key, preferB) => { const m = new Map(); (preferB ? a.concat(b) : b.concat(a)).forEach(x => { if (x) m.set(key(x), x); }); return [...m.values()]; };
function mergeVal(k, local, remote, remoteNewer) {
  if (/^p:[^:]+:puasa$/.test(k) && local && remote && typeof local === 'object' && typeof remote === 'object' && !Array.isArray(local)) {
    const m = Object.assign({}, local); Object.keys(remote).forEach(d => { if (!m[d] || (remote[d].at || 0) >= (m[d].at || 0)) m[d] = remote[d]; }); return m;
  }
  if (!Array.isArray(local) || !Array.isArray(remote)) return undefined;
  if (/^p:[^:]+:logdel$/.test(k)) return [...new Set(local.concat(remote))].slice(-500);
  if (k === 'profiles') return byKey(local, remote, x => x.id, remoteNewer);
  if (k === 'pdel') return [...new Set(local.concat(remote))];
  if (/^p:[^:]+:log$/.test(k)) return byKey(local, remote, x => x.ts || (x.d + '|' + x.title + '|' + x.min), remoteNewer)
    .sort((x, y) => (y.d > x.d ? 1 : y.d < x.d ? -1 : (y.ts || 0) - (x.ts || 0))).slice(0, 400);
  if (/^p:[^:]+:wlog$/.test(k)) return byKey(local, remote, x => x.d, remoteNewer).sort((x, y) => x.d < y.d ? -1 : 1).slice(-104);
  return undefined;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---- talking to Supabase ---- */
async function rpc(fn, body) {
  const r = await fetch(SYNC.url + '/rest/v1/rpc/' + fn, { method:'POST', headers:{ 'Content-Type':'application/json', apikey:SYNC.key }, body:JSON.stringify(body) });
  if (!r.ok) { let m = ''; try { const j = await r.json(); m = j.message || j.msg || ''; } catch (e) {} throw new Error(m || 'HTTP ' + r.status); }
  return r.json();
}
let SYNC_BUSY = false, SYNC_T = null, SYNC_STATE = '';
function syncSoon(ms = 4000) { if (!famGet()) return; clearTimeout(SYNC_T); SYNC_T = setTimeout(() => syncNow(), ms); }
async function syncNow(full) {
  const F = famGet(); if (!F || !F.code || SYNC_BUSY) return;
  if (!navigator.onLine) { SYNC_STATE = 'offline'; paintSync(); return; }
  SYNC_BUSY = true; SYNC_STATE = 'busy'; paintSync();
  try {
    // 1. pull (a 7-day overlap covers phones whose clocks are a little off; a full pull once a day)
    const dayOld = !F.full || Date.now() - F.full > 864e5;
    const since = full || dayOld || !F.since ? null : new Date(F.since - 7 * 864e5).toISOString();
    const rows = await rpc('fit_pull', { code:F.code, since });
    let changed = false, maxT = F.since || 0; const remote = new Set();
    rows.forEach(r => {
      const k = String(r.k || '').slice(8), rt = Date.parse(r.t) || 0; remote.add(k);
      if (rt > maxT) maxT = rt;
      if (!syncable(k)) return;
      const lt = MT[k] || 0, has = localStorage.getItem('corner3:' + k) !== null, local = store.get(k, null);
      if (has && same(local, r.v)) { if (rt > lt) MT[k] = rt; DIRTY.delete(k); return; }
      const m = has && r.v !== null ? mergeVal(k, local, r.v, rt >= lt) : undefined;
      if (m !== undefined) {
        _rawSet(k, m); MT[k] = Math.max(lt, rt); changed = true;
        if (!same(m, r.v)) { MT[k] = Date.now(); DIRTY.add(k); } else DIRTY.delete(k);
        return;
      }
      if (lt > rt && has) return;                    // ours is newer; it goes up in the push
      _rawSet(k, r.v === null ? null : r.v); MT[k] = rt; DIRTY.delete(k); changed = true;
    });
    // People deleted on any device stay deleted everywhere
    const del = new Set(store.get('pdel', [])), pl = store.get('profiles', []);
    if (del.size && pl.some(p => del.has(p.id))) { store.set('profiles', pl.filter(p => !del.has(p.id))); changed = true; }
    // Deleted activities stay deleted after a merge
    store.get('profiles', []).forEach(p => { const gone = new Set(store.get('p:' + p.id + ':logdel', [])), lg = store.get('p:' + p.id + ':log', []);
      if (gone.size && lg.some(e => gone.has(e.ts))) { store.set('p:' + p.id + ':log', lg.filter(e => !gone.has(e.ts))); changed = true; } });
    // First connection on this device: everything we have that the family doesn't goes up
    if (full) allLocalKeys().forEach(k => { if (syncable(k) && !remote.has(k)) { MT[k] = MT[k] || Date.now(); DIRTY.add(k); } });
    saveMeta();
    // 2. push
    const keys = [...DIRTY].filter(syncable);
    for (let i = 0; i < keys.length; i += 400) {
      const part = keys.slice(i, i + 400), snap = part.map(k => MT[k]);
      await rpc('fit_push', { code:F.code, rows:part.map(k => ({ key:'corner3:' + k, value:store.get(k, null), updated_at:new Date(MT[k] || Date.now()).toISOString() })) });
      part.forEach((k, j) => { if (MT[k] === snap[j]) DIRTY.delete(k); });
    }
    saveMeta();
    famSet(Object.assign(famGet() || F, { since:maxT || Date.now(), at:Date.now(), full:full || dayOld ? Date.now() : F.full, err:'' }));
    SYNC_STATE = 'ok';
    if (changed) afterRemoteChange();
  } catch (e) {
    const f = famGet(); if (f) famSet(Object.assign(f, { err:String(e.message || e) }));
    SYNC_STATE = navigator.onLine ? 'err' : 'offline';
  } finally { SYNC_BUSY = false; paintSync(); }
}
function afterRemoteChange() {
  PROFILES = store.get('profiles', []);
  if (CUR && !PROFILES.find(p => p.id === CUR)) { CUR = null; _rawSet('cur', null); }
  PROF = CUR ? ps.get('profile', null) : null;
  if (typeof HIJ !== 'undefined') HIJ = store.get('hijri', HIJ);
  const busy = (typeof S !== 'undefined' && S) || (typeof WZ !== 'undefined' && WZ) || !$('#settings').hidden || !$('#builder').hidden;
  if (busy) return;
  if (!$('#picker').hidden) { renderPicker(); return; }
  if (document.body.dataset.view === 'me' && document.activeElement && document.activeElement.matches('input')) { paintSync(); return; }
  route();
}
addEventListener('online', () => syncSoon(500));
addEventListener('offline', () => { SYNC_STATE = 'offline'; paintSync(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncSoon(800); });
setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 120000);
setTimeout(() => syncNow(), 1500);

/* ---- status line in Me ---- */
function syncStatusTxt() {
  const F = famGet(); if (!F) return '';
  if (SYNC_STATE === 'busy') return tt('Syncing…','Menyinkronkan…');
  if (SYNC_STATE === 'offline' || !navigator.onLine) return tt('Offline. Changes are saved here and sync when you’re back online.','Offline. Perubahan tersimpan di sini dan disinkronkan saat online lagi.');
  if (F.err) return /8 characters|at least/i.test(F.err) ? tt('The family code is too short. Use at least 8 characters.','Kode keluarga terlalu pendek. Pakai minimal 8 karakter.')
    : tt('Couldn’t sync: ','Gagal sinkron: ') + F.err + '. ' + tt('Check the connection and tap Sync now.','Cek koneksi lalu ketuk Sinkron sekarang.');
  if (F.at) { const d = new Date(F.at); return tt('Last synced ','Terakhir sinkron ') + (dkey(d) === dkey(new Date()) ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : niceDate(d)) + '.'; }
  return '';
}
function paintSync() { const el = $('#syncStat'); if (el) el.textContent = syncStatusTxt(); }

/* ---- profile PINs (a simple lock between family members, not real security) ---- */
async function pinHash(id, pin) {
  const s = 'fitrhj:' + id + ':' + pin;
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return 'f' + h.toString(16); }
}
const profOf = id => PROFILES.find(p => p.id === id) || {};
let PKPIN = null;   // { id, err }
function pinPromptHTML() {
  const p = profOf(PKPIN.id);
  return `<div class="pin-box"><h1 class="h1">${tt('Enter PIN','Masukkan PIN')}</h1><p class="lede">${tt(`${esc(p.name)}’s profile is locked.`, `Profil ${esc(p.name)} dikunci.`)}</p>
    <input class="inp pin-in" id="pkPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="PIN">
    ${PKPIN.err ? `<div class="note" role="alert">${PKPIN.err}</div>` : ''}
    <div class="wz-nav"><button class="btn ghost" data-pin="back">${tt('Back','Kembali')}</button><button class="btn primary" data-pin="ok">${tt('Open','Buka')}</button></div>
    <p class="small"><button class="linkish" data-pin="forgot">${tt('Forgot the PIN?','Lupa PIN?')}</button></p></div>`;
}
async function pinCheck() {
  const p = profOf(PKPIN.id), v = ($('#pkPin').value || '').trim();
  if (p.pin && (await pinHash(p.id, v)) === p.pin) { const id = PKPIN.id; PKPIN = null; return openPerson(id); }
  PKPIN.err = tt('That PIN isn’t right. Try again.','PIN salah. Coba lagi.'); renderPicker(); setTimeout(() => { const i = $('#pkPin'); if (i) i.focus(); }, 30);
}
function pinForgot() {
  const p = profOf(PKPIN.id), F = famGet();
  if (F && F.code) {
    const c = prompt(tt(`Type the family code to remove ${p.name}’s PIN.`, `Ketik kode keluarga untuk menghapus PIN ${p.name}.`));
    if (c == null) return;
    if (c.trim().toLowerCase() !== F.code.trim().toLowerCase()) { PKPIN.err = tt('That family code isn’t right.','Kode keluarga salah.'); return renderPicker(); }
  } else if (!confirm(tt(`Remove ${p.name}’s PIN? Their data stays.`, `Hapus PIN ${p.name}? Datanya tetap ada.`))) return;
  PROFILES = PROFILES.map(x => x.id === p.id ? Object.assign({}, x, { pin:undefined }) : x); store.set('profiles', PROFILES);
  const id = PKPIN.id; PKPIN = null; openPerson(id);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pin]'); if (!b || !PKPIN) return;
  const a = b.dataset.pin;
  if (a === 'back') { PKPIN = null; renderPicker(); }
  else if (a === 'ok') pinCheck();
  else if (a === 'forgot') pinForgot();
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'pkPin') pinCheck(); });

/* ---- backup ---- */
function exportBackup() {
  const data = {}; allLocalKeys().filter(syncable).forEach(k => { data[k] = store.get(k, null); });
  const blob = new Blob([JSON.stringify({ app:'JurnalSehatKita', v:1, at:new Date().toISOString(), data }, null, 1)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'JurnalSehatKita-backup-' + dkey(new Date()) + '.json';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function importBackup(file) {
  const rd = new FileReader();
  rd.onload = () => {
    let j; try { j = JSON.parse(rd.result); } catch (e) { j = null; }
    if (!j || !['FitRHJ','JurnalSehatKita'].includes(j.app) || !j.data || typeof j.data !== 'object') { alert(tt('This isn’t a Jurnal Sehat Kita backup file.','Ini bukan file cadangan Jurnal Sehat Kita.')); return; }
    const n = (j.data.profiles || []).length, when = j.at ? niceDate(new Date(j.at)) : '';
    if (!confirm(tt(`Restore the backup from ${when} with ${n} people? It replaces the same data on this device${famGet() ? ' and for the whole family' : ''}.`, `Pulihkan cadangan ${when} berisi ${n} orang? Data yang sama di perangkat ini${famGet() ? ' dan seluruh keluarga' : ''} akan diganti.`))) return;
    Object.keys(j.data).filter(syncable).forEach(k => store.set(k, j.data[k]));
    PROFILES = store.get('profiles', []);
    if (!CUR || !PROFILES.find(p => p.id === CUR)) { CUR = PROFILES[0] ? PROFILES[0].id : null; _rawSet('cur', CUR); }
    PROF = CUR ? ps.get('profile', null) : null;
    if (typeof HIJ !== 'undefined') HIJ = store.get('hijri', HIJ);
    route(); alert(tt('Backup restored.','Cadangan dipulihkan.'));
  };
  rd.readAsText(file);
}

/* ---- Me: family sync, PIN and backup sections ---- */
function meExtraHTML() {
  const F = famGet(), me = profOf(CUR);
  const sync = F ? `<p>${tt('This device is in your family sync. Use the same code on every family member’s device.','Perangkat ini sudah tersambung ke sinkron keluarga. Pakai kode yang sama di perangkat setiap anggota keluarga.')}</p>
      <p class="small" id="syncStat" aria-live="polite">${syncStatusTxt()}</p>
      <div class="btn-row"><button class="btn primary sm" data-sync="now">${tt('Sync now','Sinkron sekarang')}</button><button class="btn ghost sm" data-sync="off">${tt('Stop syncing this device','Hentikan sinkron di perangkat ini')}</button></div>`
    : `<p>${tt('Keep everyone’s progress the same on every phone. Pick one family code, at least 8 characters, and type it on each family member’s device.','Samakan kemajuan semua orang di setiap ponsel. Pilih satu kode keluarga, minimal 8 karakter, lalu ketik di perangkat setiap anggota keluarga.')}</p>
      <div class="fields"><div class="field"><div class="lbl">${tt('Family code','Kode keluarga')}<span class="small" style="display:block;font-weight:400">${tt('Anyone with this code can see and change your family’s data. Share it only with family.','Siapa pun yang punya kode ini bisa melihat dan mengubah data keluarga. Bagikan hanya ke keluarga.')}</span></div>
        <div class="tw-row"><input class="inp" id="famCode" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${tt('e.g. a short family phrase','mis. frasa keluarga')}"><button class="btn primary sm" data-sync="on">${tt('Connect','Sambungkan')}</button></div></div></div>
      <p class="small" id="syncStat" role="alert"></p>`;
  const pin = me.pin ? `<p>${tt('A PIN is set. It’s asked when someone switches to your profile.','PIN sudah dipasang. PIN diminta saat orang lain pindah ke profilmu.')}</p>
      <div class="btn-row"><button class="btn ghost sm" data-mepin="change">${tt('Change PIN','Ganti PIN')}</button><button class="btn ghost sm" data-mepin="remove">${tt('Remove PIN','Hapus PIN')}</button></div>`
    : `<p>${tt('Add a 4-digit PIN so others in the family don’t open your profile by mistake.','Pasang PIN 4 angka supaya anggota keluarga lain tidak membuka profilmu tanpa sengaja.')}</p><button class="btn ghost sm" data-mepin="change">${tt('Add PIN','Pasang PIN')}</button>`;
  return `<h2 class="h2">${tt('Family sync','Sinkron keluarga')}</h2>${sync}
    <h2 class="h2">${tt('Profile PIN','PIN profil')}</h2>${pin}
    <p class="small">${tt('A PIN is a simple lock between family members, not strong security.','PIN adalah kunci sederhana antar anggota keluarga, bukan pengaman yang kuat.')}</p>
    <h2 class="h2">${tt('Backup','Cadangan')}</h2>
    <p>${tt('Save a file with everyone’s profiles, plans and history, or restore one.','Simpan file berisi profil, program, dan catatan semua orang, atau pulihkan dari file.')}</p>
    <div class="btn-row"><button class="btn ghost sm" data-backup="export">${tt('Export backup','Ekspor cadangan')}</button><button class="btn ghost sm" data-backup="import">${tt('Import backup','Impor cadangan')}</button></div>
    <input type="file" id="bkFile" accept="application/json,.json" hidden>`;
}
document.addEventListener('click', async e => {
  const s = e.target.closest('[data-sync]');
  if (s) {
    const a = s.dataset.sync;
    if (a === 'on') {
      const code = ($('#famCode').value || '').trim();
      if (code.length < 8) { $('#syncStat').textContent = tt('Use at least 8 characters.','Pakai minimal 8 karakter.'); $('#famCode').focus(); return; }
      if (!navigator.onLine) { $('#syncStat').textContent = tt('You’re offline. Connect to the internet first.','Kamu offline. Sambungkan ke internet dulu.'); return; }
      famSet({ code }); s.disabled = true; $('#syncStat').textContent = tt('Connecting…','Menyambungkan…');
      await syncNow(true);
      const F = famGet();
      if (F && F.err) { const msg = syncStatusTxt(); famSet(null); renderMe(); $('#syncStat').textContent = msg; return; }
      PROFILES = store.get('profiles', []); renderMe();
    } else if (a === 'now') syncNow();
    else if (a === 'off' && confirm(tt('Stop syncing this device? Everything stays on this device and in the family sync.','Hentikan sinkron di perangkat ini? Semua data tetap ada di perangkat ini dan di sinkron keluarga.'))) { famSet(null); renderMe(); }
    return;
  }
  const mp = e.target.closest('[data-mepin]');
  if (mp) {
    if (mp.dataset.mepin === 'remove') { if (!confirm(tt('Remove your PIN?','Hapus PIN-mu?'))) return; PROFILES = PROFILES.map(x => x.id === CUR ? Object.assign({}, x, { pin:undefined }) : x); }
    else {
      const a = prompt(tt('New 4-digit PIN','PIN baru 4 angka')); if (a == null) return;
      if (!/^\d{4}$/.test(a.trim())) { alert(tt('Use exactly 4 digits.','Pakai tepat 4 angka.')); return; }
      const b = prompt(tt('Type the PIN again','Ketik PIN sekali lagi')); if (b == null) return;
      if (a.trim() !== b.trim()) { alert(tt('The two PINs don’t match.','Kedua PIN tidak sama.')); return; }
      const h = await pinHash(CUR, a.trim()); PROFILES = PROFILES.map(x => x.id === CUR ? Object.assign({}, x, { pin:h }) : x);
    }
    store.set('profiles', PROFILES); renderMe(); return;
  }
  const bk = e.target.closest('[data-backup]');
  if (bk) { if (bk.dataset.backup === 'export') exportBackup(); else $('#bkFile').click(); }
});
document.addEventListener('change', e => { if (e.target.id === 'bkFile' && e.target.files[0]) { importBackup(e.target.files[0]); e.target.value = ''; } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'famCode') { const b = $('[data-sync="on"]'); if (b) b.click(); } });
