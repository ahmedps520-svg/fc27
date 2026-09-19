/**
 * The world's season: four divisions, promotion and relegation, running on
 * the calendar.
 *
 * Forty clubs play a double round robin in each division — eighteen rounds,
 * one a day — and at the end of it two go up and two come down. Every result
 * is decided from a hash of the fixture and the season, weighted by the two
 * clubs' ratings, so every device sees the same tables on the same day with
 * nothing stored and nothing fetched. Yesterday's round is history; today's
 * fixtures are on the World screen and can be played.
 *
 * The clubs' `division` on the world object is where they *started* (the
 * blueprint); where they are *now* comes from here. Cards, chemistry and the
 * SBCs keep the blueprint league, because a card must not change what it
 * counts for overnight.
 */
import { WORLD, clubRating } from './data/generator.js';
import { LEAGUES } from './data/pools.js';
import { hashStr } from './data/stadiums.js';

export const ROUNDS = 18;
export const DAY_MS = 86_400_000;
/** Season 1 kicked off on the first of September 2026. */
export const EPOCH_DAY = Math.floor(Date.UTC(2026, 8, 1) / DAY_MS);
const UP = 2;
const DOWN = 2;

const dayOf = (now) => Math.floor(now / DAY_MS);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Poisson by inverse transform — the goals a side scores at an expected rate. */
function poisson(lambda, r) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do { k += 1; p *= r(); } while (p > L && k < 9);
  return k - 1;
}

/**
 * Round-robin fixtures for ten clubs: nine rounds by the circle method, then
 * the same nine with home and away swapped. Every pair meets twice, once at
 * each ground.
 */
export function roundRobin(ids) {
  const n = ids.length;
  const list = ids.slice();
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      round.push(r % 2 ? [b, a] : [a, b]);
    }
    rounds.push(round);
    list.splice(1, 0, list.pop());          // rotate all but the first
  }
  return rounds.concat(rounds.map((round) => round.map(([h, a]) => [a, h])));
}

const ratingOf = (id) => clubRating(id);

/** One result, decided once and for all by who, where and when. */
export function result(season, division, round, home, away) {
  const r = rng(hashStr(`w|${season}|${division}|${round}|${home}|${away}`));
  const rh = ratingOf(home);
  const ra = ratingOf(away);
  const edge = (rh - ra) / 11;
  const gh = poisson(Math.max(0.25, 1.32 + edge + 0.22), r);
  const ga = poisson(Math.max(0.25, 1.18 - edge), r);
  return [gh, ga];
}

function emptyRow(id) {
  return { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
}

function applyResult(table, home, away, gh, ga) {
  const h = table[home];
  const a = table[away];
  h.p += 1; a.p += 1; h.gf += gh; h.ga += ga; a.gf += ga; a.ga += gh;
  if (gh > ga) { h.w += 1; a.l += 1; h.pts += 3; h.form.push('W'); a.form.push('L'); }
  else if (gh < ga) { a.w += 1; h.l += 1; a.pts += 3; a.form.push('W'); h.form.push('L'); }
  else { h.d += 1; a.d += 1; h.pts += 1; a.pts += 1; h.form.push('D'); a.form.push('D'); }
}

/** Standings order: points, goal difference, goals for, then the name. */
export function sortTable(rows) {
  return rows.slice().sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf
    || WORLD.clubsById[x.id].name.localeCompare(WORLD.clubsById[y.id].name));
}

/** A division's table after `played` rounds of a season. */
export function divisionTable(season, division, ids, played) {
  const fixtures = roundRobin(ids);
  const table = Object.fromEntries(ids.map((id) => [id, emptyRow(id)]));
  for (let r = 0; r < Math.min(played, ROUNDS); r++) {
    for (const [h, a] of fixtures[r]) {
      const [gh, ga] = result(season, division, r, h, a);
      applyResult(table, h, a, gh, ga);
    }
  }
  return sortTable(Object.values(table));
}

const compCache = new Map();
/**
 * Who is in which division at the start of a season: the blueprint order for
 * season 0, then every finished season's promotions and relegations applied
 * in turn. Cached, and cheap anyway — a season is ninety results a division.
 */
export function composition(season) {
  if (compCache.has(season)) return compCache.get(season);
  let divs = LEAGUES.map((league, i) => WORLD.clubs.filter((c) => c.division === i + 1).map((c) => c.id));
  for (let s = 0; s < season; s++) {
    const tables = divs.map((ids, d) => divisionTable(s, d + 1, ids, ROUNDS).map((row) => row.id));
    const next = tables.map((t) => t.slice());
    for (let d = 0; d < divs.length - 1; d++) {
      const down = next[d].splice(next[d].length - DOWN, DOWN);
      const up = next[d + 1].splice(0, UP);
      next[d].push(...up);
      next[d + 1].unshift(...down);
    }
    divs = next;
  }
  compCache.set(season, divs);
  return divs;
}

/** The season and the day within it for a moment in time. */
export function calendar(now = Date.now()) {
  const d = Math.max(0, dayOf(now) - EPOCH_DAY);
  return { season: Math.floor(d / ROUNDS), played: d % ROUNDS, day: d };
}

/**
 * Everything the World screen shows for today: each division's standings so
 * far, today's fixtures, and who moved at the end of last season.
 */
export function worldState(now = Date.now()) {
  const { season, played } = calendar(now);
  const divs = composition(season);
  const divisions = divs.map((ids, i) => {
    const fixtures = roundRobin(ids);
    return {
      division: i + 1,
      name: LEAGUES[i],
      clubs: ids,
      table: divisionTable(season, i + 1, ids, played),
      today: fixtures[played] || [],
      round: played + 1,
      // the two that go up and the two that go down, as things stand
      upZone: i === 0 ? 0 : UP,
      downZone: i === divs.length - 1 ? 0 : DOWN,
    };
  });
  let movers = { promoted: [], relegated: [] };
  if (season > 0) {
    const before = composition(season - 1);
    const after = divs;
    const posBefore = Object.fromEntries(before.flatMap((ids, d) => ids.map((id) => [id, d])));
    for (let d = 0; d < after.length; d++) {
      for (const id of after[d]) {
        if (posBefore[id] > d) movers.promoted.push(id);
        else if (posBefore[id] < d) movers.relegated.push(id);
      }
    }
  }
  return { season: season + 1, round: played + 1, rounds: ROUNDS, divisions, movers };
}

/** Which division a club plays in right now (1 = top). */
export function liveDivisionOf(clubId, now = Date.now()) {
  const divs = composition(calendar(now).season);
  const i = divs.findIndex((ids) => ids.includes(clubId));
  return i < 0 ? (WORLD.clubsById[clubId]?.division || 1) : i + 1;
}
