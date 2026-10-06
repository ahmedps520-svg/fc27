/**
 * v152: the trophy cabinet — everything you have actually won, in one place.
 *
 * Silverware used to be scattered: a Manager Career's titles lived in its
 * history, a Player Career's in its own list, a Custom Cup or a World
 * Tournament win only as a one-off reward card. Each of those moments now
 * also puts a trophy in `club.cabinet`, and the trophies from careers played
 * before the cabinet existed are read back out of their histories, so an old
 * save's shelf is not empty.
 *
 *   kind   'league' | 'cup' | 'world' | 'custom' | 'award' — which trophy model stands for it
 *   title  what it is ("Premier Division title"), sub  who and when
 *   key    one per real win, so a replayed save or a re-read history never doubles it
 */
import { getState } from './state.js';

/** Put a trophy in the cabinet of a club slice (`state.club`). */
export function addTrophy(club, { kind, title, sub = '', key }) {
  if (!club) return;
  if (!Array.isArray(club.cabinet)) club.cabinet = [];
  if (key && club.cabinet.some((t) => t.key === key)) return;
  club.cabinet.push({ kind, title, sub, key: key || `${kind}:${Date.now()}`, at: Date.now() });
}

const PRO_KIND = (name) => (/title/i.test(name) ? 'league' : /^cup$/i.test(name) ? 'cup' : 'award');

/** Every trophy, oldest first: the cabinet's own, plus those only the old histories know about. */
export function cabinet(s = getState()) {
  const out = [...(s.club?.cabinet || [])];
  const has = new Set(out.map((t) => t.key));
  const add = (t) => { if (!has.has(t.key)) { has.add(t.key); out.push(t); } };
  for (const t of s.pro?.trophies || []) {
    add({ kind: PRO_KIND(t.name), title: t.name, sub: `${s.pro.name || 'Player Career'} · season ${t.season}`, key: `pro:${s.pro.name || ''}:${t.season}:${t.name}`, at: 0 });
  }
  for (const h of s.career?.history || []) {
    if (h.pos === 1) add({ kind: 'league', title: 'League title', sub: `Manager Career · season ${h.season}`, key: `car:${s.career.started || 0}:${h.season}:league`, at: 0 });
  }
  return out.sort((a, b) => (a.at || 0) - (b.at || 0));
}
