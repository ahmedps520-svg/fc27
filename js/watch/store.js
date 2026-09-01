/**
 * The watch's copy of the save, and how it reaches the account.
 *
 * Deliberately not the phone's `state.js`: that module owns a much larger
 * shape, a migration history and a localStorage key the phone is also using.
 * The watch keeps its own small slice under its own key and pushes it to the
 * same cloud save, so a pack opened on the wrist is in the collection on the
 * phone — and nothing the watch does can corrupt what the phone stores
 * locally.
 *
 * Sync is deliberately simple: pull on boot, push after anything that changes
 * the collection or the balance. The server's own guards bound what a push can
 * claim, which is what makes this safe to do from a second device.
 */
const KEY = 'apexxi.watch.v1';
const START_APEX = 5_000;
const FREE_MS = 6 * 60 * 60 * 1000;

let state = null;
let token = null;
let profile = null;
let solo = false;
let lastSync = 0;

const blank = () => ({
  club: { apex: START_APEX, collection: [], packs: ['bronze'], freeAt: 0, packsOpened: 0 },
});

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
};
const writeLocal = () => {
  try { localStorage.setItem(KEY, JSON.stringify({ state, token, profile, solo })); } catch { /* full or private */ }
};

export const save = () => state || blank();
export const ready = () => !!(token || solo);
export const name = () => profile?.name || '';
export const syncLabel = () => (solo ? 'this watch' : lastSync ? 'just now' : 'phone account');

/** Boot: restore whatever this watch remembers, then refresh from the account. */
export async function boot() {
  const stored = readLocal();
  if (stored) {
    state = stored.state || blank();
    token = stored.token || null;
    profile = stored.profile || null;
    solo = !!stored.solo;
  } else {
    state = blank();
  }
  if (token) await pull();
}

/** Trade a six-digit code from the phone for this watch's own token. */
export async function pair(code) {
  try {
    const res = await fetch('./api/pair/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const body = await res.json();
    if (!res.ok) return { error: body.error || 'Pairing failed.' };
    token = body.token;
    profile = body.profile;
    solo = false;
    if (body.save?.club) state = { club: { ...blank().club, ...body.save.club } };
    writeLocal();
    return { ok: true };
  } catch {
    return { error: 'No connection to the game.' };
  }
}

export function goSolo() { solo = true; state = state || blank(); writeLocal(); }

async function pull() {
  try {
    const res = await fetch('./api/save', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { if (res.status === 401) { token = null; writeLocal(); } return; }
    const body = await res.json();
    if (body.save?.club) {
      // the account is the truth on arrival; the watch's own slice is a cache
      state = { ...body.save, club: { ...blank().club, ...body.save.club } };
      lastSync = Date.now();
      writeLocal();
    }
  } catch { /* offline: play on with what is here */ }
}

/* Pushes are debounced: opening a five-card pack changes the save five times
 * in a second, and the account does not need to hear about each one. */
let pushT = null;
function push() {
  writeLocal();
  if (!token) return;
  clearTimeout(pushT);
  pushT = setTimeout(async () => {
    try {
      await fetch('./api/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ save: state }),
      });
      lastSync = Date.now();
    } catch { /* try again after the next change */ }
  }, 1200);
}

export function earn(apex) {
  state.club.apex = Math.max(0, (state.club.apex || 0) + apex);
  push();
}

export function buy(pack) {
  state.club.apex = Math.max(0, (state.club.apex || 0) - pack.cost);
  if (pack.cost === 0) state.club.freeAt = Date.now() + FREE_MS;
  push();
}

export function consume(packId) {
  const i = (state.club.packs || []).indexOf(packId);
  if (i >= 0) state.club.packs.splice(i, 1);
  push();
}

/** Bank a pack's contents; duplicates pay coins exactly as they do on the phone. */
export function addCards(drawn) {
  const coll = new Set(state.club.collection || []);
  for (const { p, dup } of drawn) if (!dup) coll.add(p.id);
  state.club.collection = [...coll];
  state.club.packsOpened = (state.club.packsOpened || 0) + 1;
  push();
}
