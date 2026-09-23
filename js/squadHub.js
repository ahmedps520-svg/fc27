/**
 * The squad hub's logic (v80): managers, saved squads and the auto-builder.
 * The screen is in screens/squad.js; the chemistry itself in data/chemistry.js.
 *
 *  - **Managers** are invented people. Each has a nation and a league, and a
 *    card sharing either gains a point of chemistry (never past the cap).
 *    More of them join the shortlist as the club levels up.
 *  - **Saved squads**: five slots, each a formation, an eleven and a bench.
 *    Loading one skips any card no longer in the collection.
 *  - **Build me a squad** tries every formation against a handful of anchors
 *    (no anchor, the collection's biggest nations and leagues) and keeps the
 *    eleven with the best rating-plus-chemistry score.
 */
import { getState, update } from './state.js';
import { getPlayer, getClub } from './data/generator.js';
import { FORMATIONS, POSITIONS } from './data/pools.js';
import { chemistryFor } from './data/chemistry.js';
import { baseOf } from './data/promos.js';
import { levelFromXP } from './tasks.js';

const L = {
  apex: 'Apex Premier Division', mer: 'Meridian League', van: 'Vanguard League', fnd: 'Foundation League',
  pio: 'Pioneer League', grs: 'Grassroots League', hig: 'Highland League', low: 'Lowland League',
};
const M = (id, name, nation, league, unlock = 1) => ({ id, name, nation, league: L[league], unlock });
export const MANAGERS = [
  M('m-harwell', 'Tom Harwell', 'England', 'apex'),
  M('m-ortuno', 'Iker Ortuño', 'Spain', 'mer'),
  M('m-bellandi', 'Marco Bellandi', 'Italy', 'van'),
  M('m-cavaco', 'Rui Cavaco', 'Portugal', 'fnd'),
  M('m-dauphin', 'Luc Dauphin', 'France', 'pio'),
  M('m-rehbach', 'Jonas Rehbach', 'Germany', 'grs'),
  M('m-quaresma', 'Tiago Quaresma', 'Brazil', 'hig'),
  M('m-sotelo', 'Nicolás Sotelo', 'Argentina', 'low'),
  M('m-alfahad', 'Khalid Al-Fahad', 'Saudi Arabia', 'apex', 5),
  M('m-vanhulst', 'Pieter van Hulst', 'Netherlands', 'mer', 5),
  M('m-declercq', 'Arne Declercq', 'Belgium', 'van', 5),
  M('m-benali', 'Youssef Benali', 'Morocco', 'fnd', 10),
  M('m-arriaga', 'Diego Arriaga', 'Mexico', 'pio', 10),
  M('m-whitlock', 'Sam Whitlock', 'USA', 'grs', 10),
  M('m-kaya', 'Emre Kaya', 'Turkey', 'hig', 15),
  M('m-hayashi', 'Kenji Hayashi', 'Japan', 'low', 15),
  M('m-ndiaye', 'Ousmane Ndiaye', 'Senegal', 'apex', 20),
  M('m-lindgaard', 'Mads Lindgaard', 'Denmark', 'mer', 20),
  M('m-ferreyra', 'Álvaro Ferreyra', 'Uruguay', 'van', 25),
  M('m-cuervo', 'Andrés Cuervo', 'Colombia', 'apex', 30),
];
export const managerById = (id) => MANAGERS.find((m) => m.id === id) || null;
export function managersOpen(club = getState().club) {
  const lvl = levelFromXP(club.xpTotal || 0).level;
  return MANAGERS.map((m) => ({ ...m, open: lvl >= m.unlock }));
}
/** The club's manager, or none. */
export const managerOf = (club = getState().club) => managerById(club?.manager);
export function setManager(id) {
  const m = managerById(id);
  if (id && (!m || !managersOpen().find((x) => x.id === id)?.open)) return false;
  update((s) => { s.club.manager = m ? m.id : null; });
  return true;
}

/* ------------------------------- saved squads ------------------------------- */
export const SAVED_MAX = 5;
export function savedSquads(club = getState().club) {
  return (club.savedSquads || []).slice(0, SAVED_MAX);
}
export function saveSquad(slot, name) {
  update((s) => {
    const list = (s.club.savedSquads || []).slice(0, SAVED_MAX);
    while (list.length <= slot) list.push(null);
    list[slot] = { name: (name || `Squad ${slot + 1}`).slice(0, 24), formation: s.club.formation,
      lineup: s.club.lineup.slice(), bench: (s.club.bench || []).slice(), manager: s.club.manager || null, at: Date.now() };
    s.club.savedSquads = list;
  });
}
/** Load a saved squad; cards since sold leave a gap. Returns how many were missing. */
export function loadSquad(slot) {
  let missing = 0;
  update((s) => {
    const sq = (s.club.savedSquads || [])[slot];
    if (!sq) return;
    const own = new Set(s.club.collection);
    const keep = (id) => { if (id && !own.has(id)) { missing += 1; return null; } return id || null; };
    s.club.formation = FORMATIONS[sq.formation] ? sq.formation : s.club.formation;
    s.club.lineup = sq.lineup.map(keep);
    s.club.bench = (sq.bench || []).map(keep);
    if (sq.manager !== undefined) s.club.manager = sq.manager;
  });
  return missing;
}
export function deleteSquad(slot) {
  update((s) => { if (s.club.savedSquads?.[slot]) s.club.savedSquads[slot] = null; });
}

/* ------------------------------- auto-builder ------------------------------- */
const fit = (p, pos) => (p.position === pos ? 0 : POSITIONS[p.position].group === POSITIONS[pos].group ? 1 : 2);

function fill(cards, formation, anchor) {
  const slots = FORMATIONS[formation];
  const used = new Set();
  const lineup = Array(slots.length).fill(null);
  const leagueOf = (p) => (p.clubId ? getClub(p.clubId)?.league : null);
  const bonus = (p) => (!anchor ? 0 : (anchor.nation && p.nation === anchor.nation) || (anchor.league && leagueOf(p) === anchor.league) ? 3 : 0);
  // hardest slots first: the ones with fewest exact fits
  const order = slots.map((s, i) => [i, cards.filter((p) => p.position === s.pos).length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  for (const i of order) {
    const pos = slots[i].pos;
    let best = null; let bestScore = -1e9;
    for (const p of cards) {
      if (used.has(baseOf(p))) continue;
      const f = fit(p, pos);
      if (pos === 'GK' ? p.position !== 'GK' : p.position === 'GK') continue;
      const sc = p.overall - f * 6 + bonus(p);
      if (sc > bestScore) { bestScore = sc; best = p; }
    }
    if (best) { lineup[i] = best.id; used.add(baseOf(best)); }
  }
  return lineup;
}

/**
 * The best eleven the collection can make. `formation` fixes the shape, or
 * null tries them all. Returns `{ formation, lineup, bench, rating, chem }`.
 */
export function buildSquad({ formation = null, club = getState().club } = {}) {
  const cards = [...new Set(club.collection)].map(getPlayer).filter(Boolean);
  if (!cards.length) return null;
  const mgr = managerOf(club);
  const count = (key) => { const c = {}; for (const p of cards) { const k = key(p); if (k) c[k] = (c[k] || 0) + 1; } return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 4).map((x) => x[0]); };
  const anchors = [null,
    ...count((p) => p.nation).map((n) => ({ nation: n })),
    ...count((p) => (p.clubId ? getClub(p.clubId)?.league : null)).map((l) => ({ league: l }))];
  if (mgr) anchors.push({ nation: mgr.nation }, { league: mgr.league });
  let best = null;
  for (const f of formation ? [formation] : Object.keys(FORMATIONS)) {
    for (const a of anchors) {
      const lineup = fill(cards, f, a);
      const ch = chemistryFor(lineup, f, mgr);
      const score = ch.rating + ch.team * 0.08 + ch.placedCount * 5;
      if (!best || score > best.score) best = { formation: f, lineup, rating: ch.rating, chem: ch.team, score };
    }
  }
  // the bench: a keeper if there is one, then the best of the rest
  const used = new Set(best.lineup.filter(Boolean).map((id) => baseOf(getPlayer(id))));
  const rest = cards.filter((p) => !used.has(baseOf(p))).sort((a, b) => b.overall - a.overall);
  const bench = [];
  const gk = rest.find((p) => p.position === 'GK');
  if (gk) { bench.push(gk.id); used.add(baseOf(gk)); }
  for (const p of rest) { if (bench.length >= 5) break; if (!used.has(baseOf(p))) { bench.push(p.id); used.add(baseOf(p)); } }
  while (bench.length < 5) bench.push(null);
  return { formation: best.formation, lineup: best.lineup, bench, rating: best.rating, chem: best.chem };
}
export function applyBuild(b) {
  if (!b) return;
  update((s) => { s.club.formation = b.formation; s.club.lineup = b.lineup.slice(); s.club.bench = b.bench.slice(); });
}
