/**
 * Custom Cup (v118, backlog #16 — the tournament creator).
 *
 * Name a cup, pick 4, 8 or 16 teams from any country (or nations), say which
 * one is yours, and it is drawn into a knockout bracket. Your ties are played;
 * everyone else's are settled the way the rest of the world's are — a seeded
 * scoreline from the two ratings, the same every time for the same cup. A
 * drawn tie of yours goes to penalties, decided from the cup's own seed.
 *
 * The cup lives in the save (`club.customCup`) and survives a reload between
 * rounds. It pays nothing: it is a way to play, not a way to earn, so no
 * economy number moves.
 */
import { getState, update } from './state.js';
import { COUNTRIES, internationalTeams, clubSheet, matchSquad, internationalSquad } from './data/countries.js';
import { hashStr } from './data/stadiums.js';

export const CUP_SIZES = [4, 8, 16];
const ROUND_NAMES = { 16: 'Round of 16', 8: 'Quarter-finals', 4: 'Semi-finals', 2: 'Final' };

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function poisson(lambda, r) { const L = Math.exp(-lambda); let k = 0; let p = 1; do { k += 1; p *= r(); } while (p > L && k < 9); return k - 1; }

let all = null;
/** Every team a cup can take: every country's clubs, then the nations. */
export function allTeams() {
  if (!all) all = [...COUNTRIES.flatMap((c) => c.clubs), ...internationalTeams()];
  return all;
}
export const teamById = (id) => allTeams().find((t) => t.id === id) || null;
export const ratingOf = (team) => (team?.national ? team.rating || 75 : clubSheet(team).overall);
export const roundName = (teamsLeft) => ROUND_NAMES[teamsLeft] || `Round of ${teamsLeft}`;

export const cup = () => getState().club?.customCup || null;

/** Draw a new cup. Returns the cup, or a reason it cannot be drawn. */
export function createCup({ name, ids, you, seed = Date.now() }) {
  const list = [...new Set(ids || [])].filter((id) => teamById(id));
  if (!CUP_SIZES.includes(list.length)) return { error: `A cup needs 4, 8 or 16 teams — this has ${list.length}.` };
  if (!list.includes(you)) return { error: 'Pick the team you will play as.' };
  const title = String(name || '').trim().slice(0, 32) || 'The Cup';
  const s = hashStr(`${title}|${list.join(',')}|${seed}`);
  const r = rng(s);
  const order = list.slice();
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const ties = [];
  for (let i = 0; i < order.length; i += 2) ties.push({ a: order[i], b: order[i + 1] });
  const c = { name: title, you, seed: s, rounds: [ties], done: false, champion: null, out: false };
  update((st) => { st.club.customCup = c; });
  return c;
}

export function quitCup() { update((st) => { st.club.customCup = null; }); }

/** Your tie in the round being played, if you are still in it. */
export function yourTie(c = cup()) {
  if (!c || c.done || c.out) return null;
  return c.rounds[c.rounds.length - 1].find((t) => (t.a === c.you || t.b === c.you) && !t.winner) || null;
}

/** Settle a tie that is not yours: a scoreline from the ratings, seeded by the cup. */
function simTie(c, tie, roundIdx) {
  const r = rng(hashStr(`${c.seed}|${roundIdx}|${tie.a}|${tie.b}`));
  const edge = (ratingOf(teamById(tie.a)) - ratingOf(teamById(tie.b))) / 10;
  const ga = poisson(Math.max(0.3, 1.3 + edge), r);
  const gb = poisson(Math.max(0.3, 1.2 - edge), r);
  let winner = ga > gb ? tie.a : gb > ga ? tie.b : null;
  let pens = false;
  if (!winner) { winner = r() < 0.5 ? tie.a : tie.b; pens = true; }
  return { ...tie, ga, gb, winner, pens };
}

/** Finish the round being played (everyone but you), and draw the next one from its winners. */
function advance(c) {
  const idx = c.rounds.length - 1;
  c.rounds[idx] = c.rounds[idx].map((t) => (t.winner ? t : simTie(c, t, idx)));
  const winners = c.rounds[idx].map((t) => t.winner);
  if (winners.length === 1) { c.done = true; c.champion = winners[0]; return; }
  const next = [];
  for (let i = 0; i < winners.length; i += 2) next.push({ a: winners[i], b: winners[i + 1] });
  c.rounds.push(next);
}

/**
 * Your result is in: record it (a draw goes to penalties, from the cup's
 * seed), settle the rest of the round, and move on. Out of the cup, the rest
 * of it is played out to a champion. Returns what happened, for the result
 * screen.
 */
export function onResult(scored, conceded) {
  const c = structuredClone(cup());
  if (!c) return null;
  const tie = yourTie(c);
  if (!tie) return null;
  const idx = c.rounds.length - 1;
  const youA = tie.a === c.you;
  const [ga, gb] = youA ? [scored, conceded] : [conceded, scored];
  let winner = ga > gb ? tie.a : gb > ga ? tie.b : null;
  let pens = false;
  if (!winner) { pens = true; winner = rng(hashStr(`${c.seed}|pens|${idx}`))() < 0.5 ? tie.a : tie.b; }
  const at = c.rounds[idx].indexOf(c.rounds[idx].find((t) => t.a === tie.a && t.b === tie.b));
  c.rounds[idx][at] = { ...tie, ga, gb, winner, pens };
  const stage = roundName(c.rounds[idx].length * 2);
  const won = winner === c.you;
  advance(c);
  if (!won) { c.out = true; while (!c.done) advance(c); }
  update((st) => { st.club.customCup = c; });
  return { won, pens, stage, champion: c.done && c.champion === c.you, done: c.done };
}

/** The match for your next tie: you at home, as the picked teams' squads travel in Quick Match. */
export function matchParams(worldIds) {
  const c = cup(); const tie = yourTie(c);
  if (!tie) return null;
  const them = tie.a === c.you ? tie.b : tie.a;
  const sq = (t) => (t.national ? internationalSquad(t) : matchSquad(t));
  return {
    homeId: worldIds[0], awayId: worldIds[1],
    homeSquad: sq(teamById(c.you)), awaySquad: sq(teamById(them)),
    duration: 240, skill: 1, mode: 'single', customCup: true,
    final: c.rounds[c.rounds.length - 1].length === 1,
  };
}
