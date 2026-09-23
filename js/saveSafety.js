/**
 * Save safety (v87): nothing a player has earned is lost to a bad write, a
 * damaged file, or a wrong choice between two devices.
 *
 *   backups   up to three automatic copies, one a day, kept beside the save
 *   corrupt   a save that will not parse is kept aside (never overwritten)
 *             and the newest good backup is restored in its place
 *   export    the save as a file, with a small header naming the game and
 *             the build; import reads it back (and backs up what it replaces)
 *   summary   what a save holds, in words, for the restore list and the
 *             cloud-conflict screen
 *
 * Works on raw storage only — state.js decides when to call it — so it can be
 * tested and cannot form an import cycle.
 */
import * as storage from './storage.js';

export const SAVE_KEY = 'apexxi.save.v1';
const BACKUPS = 'apexxi.backups';
const CORRUPT = 'apexxi.save.corrupt';
const KEEP = 3;
const DAY = 86400000;

const read = (k) => { try { return storage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { storage.setItem(k, v); return true; } catch { return false; } };

/** The automatic backups, newest first: [{ at, data }] (data is the raw JSON string). */
export function listBackups() {
  try { const b = JSON.parse(read(BACKUPS) || '[]'); return Array.isArray(b) ? b.filter((x) => x && typeof x.data === 'string') : []; } catch { return []; }
}

/**
 * Keep today's copy of a save that just loaded cleanly. One a day, three kept;
 * if storage is full the oldest go first and, failing that, nothing breaks.
 */
export function backupDaily(raw, now = Date.now()) {
  if (!raw || raw.length < 20) return false;
  const list = listBackups();
  if (list[0] && now - list[0].at < DAY) return false;
  const next = [{ at: now, data: raw }, ...list].slice(0, KEEP);
  while (next.length && !write(BACKUPS, JSON.stringify(next))) next.pop();
  return next.length > 0;
}

/** Keep a copy on demand (before an import or a cloud swap replaces the save). */
export function backupNow(raw, now = Date.now()) {
  if (!raw) return false;
  const next = [{ at: now, data: raw, manual: true }, ...listBackups()].slice(0, KEEP + 1);
  while (next.length && !write(BACKUPS, JSON.stringify(next))) next.pop();
  return next.length > 0;
}

/** A save that will not parse is set aside, once, never overwritten by a later one. */
export function stashCorrupt(raw) {
  if (!raw || read(CORRUPT)) return;
  write(CORRUPT, raw);
}
export const corruptStashed = () => !!read(CORRUPT);

/** The newest backup that parses into an object, or null. */
export function newestGoodBackup() {
  for (const b of listBackups()) {
    try { const o = JSON.parse(b.data); if (o && typeof o === 'object' && !Array.isArray(o)) return { ...b, save: o }; } catch { /* next one */ }
  }
  return null;
}

/** The save as a file's contents. */
export function exportSave(saveObj, version = '') {
  return JSON.stringify({ game: 'apex-xi', kind: 'save', version, at: new Date().toISOString(), save: saveObj }, null, 0);
}

/**
 * Read a save file. Accepts our export format or a bare save object. Returns
 * { save } or { error } — never throws, whatever it is handed.
 */
export function parseSaveFile(text) {
  if (typeof text !== 'string' || !text.trim()) return { error: 'The file is empty.' };
  if (text.length > 8 * 1024 * 1024) return { error: 'That file is too large to be a save.' };
  let o;
  try { o = JSON.parse(text); } catch { return { error: 'That file is not a save (it is not valid JSON).' }; }
  const save = o && o.game === 'apex-xi' ? o.save : o;
  if (!save || typeof save !== 'object' || Array.isArray(save)) return { error: 'That file is not an APEX XI save.' };
  if (!save.club && !save.ultimate && !save.career && !save.settings) return { error: 'That file does not look like an APEX XI save.' };
  return { save, version: o?.version || null };
}

/** What a save holds, briefly, for a person choosing between two. */
export function summary(s) {
  if (!s || typeof s !== 'object') return { lines: ['Empty'], weight: 0 };
  const c = s.club || {}; const u = s.ultimate || {};
  const lines = [];
  lines.push(`${(c.collection?.length || 0)} cards · ◈ ${(c.apex || 0).toLocaleString()}`);
  if (u.played) lines.push(`${u.played} Ultimate XI matches`);
  if (s.career?.season) lines.push(`Manager Career: season ${s.career.season}${s.career.clubName ? ` at ${s.career.clubName}` : ''}`);
  if (s.pro?.name) lines.push(`Player Career: ${s.pro.name}`);
  if (s.street?.name) lines.push(`Street: ${s.street.name}`);
  const at = s.meta?.savedAt;
  return { lines, savedAt: at || null, weight: (u.played || 0) * 10 + (c.collection?.length || 0) + (c.packsOpened || 0) * 2 };
}
