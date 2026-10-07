/**
 * v182: your goals, kept.
 *
 * The highlights after a match used to vanish with it. "Keep these goals" on
 * the full-time screen stores each goal's tape (the same frames the replay
 * plays) with what it takes to stage it again: the two clubs, their squads, the
 * ground and the weather. The Trophy Room lists them and plays any one back.
 *
 * The tapes live in IndexedDB (a goal is a few hundred KB of positions — too
 * much for the save in localStorage), newest first, at most MAX of them. With
 * no IndexedDB (a private window) the gallery is simply empty and saving says so.
 */
const DB = 'apexxi-goals';
const STORE = 'goals';
export const MAX = 24;

let dbp = null;
function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no IndexedDB')); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  dbp.catch(() => { dbp = null; });
  return dbp;
}

const tx = async (mode, fn) => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(out?.result ?? out);
    t.onerror = () => reject(t.error);
  });
};

/** Positions to two decimals: a quarter of the size, and nothing the eye can see. */
const q = (v) => Math.round(v * 100) / 100;
export function packFrames(frames) {
  return frames.map((f) => ({ b: f.b.map(q), p: f.p.map((r) => r.map(q)) }));
}

/** The parts of a match's params that stage it again — never a career, a weekend or an Ultimate result. */
const KEEP = ['homeId', 'awayId', 'homeSquad', 'awaySquad', 'venueId', 'atmo', 'atmoSeed', 'street', 'fives', 'field', 'clash', 'mode'];
export function stageOf(params) {
  const out = {};
  for (const k of KEEP) if (params[k] !== undefined) out[k] = params[k];
  try { return structuredClone(out); } catch { return JSON.parse(JSON.stringify(out)); }
}

/** Keep these goals. Returns how many were stored. */
export async function keepGoals(entries) {
  const now = Date.now();
  await tx('readwrite', (s) => {
    entries.forEach((e, i) => s.put({ ...e, id: `${now}-${i}`, savedAt: now + i }));
  });
  // newest MAX only
  const all = await listGoals();
  if (all.length > MAX) await tx('readwrite', (s) => { for (const e of all.slice(MAX)) s.delete(e.id); });
  return entries.length;
}

/** Every kept goal, newest first. Never throws: no storage is an empty gallery. */
export async function listGoals() {
  try {
    const all = await tx('readonly', (s) => s.getAll());
    return (all || []).sort((a, b) => b.savedAt - a.savedAt);
  } catch { return []; }
}

export async function getGoal(id) {
  try { return await tx('readonly', (s) => s.get(id)); } catch { return null; }
}

export async function deleteGoal(id) {
  try { await tx('readwrite', (s) => s.delete(id)); return true; } catch { return false; }
}
