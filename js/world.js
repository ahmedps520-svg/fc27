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
import { WORLD, clubRating, getPlayer } from './data/generator.js';
import { NATION_COLORS } from './data/realPlayers.js';
import { SHAPES } from './game/sim.js';
import { LEAGUES } from './data/pools.js';
import { hashStr } from './data/stadiums.js';

/* v72: divisions are no longer all ten clubs. A season is `ROUNDS` days —
 * long enough for the biggest division's double round robin (13 clubs, 26
 * rounds with a bye each); a twelve-club division finishes its 22 rounds
 * and rests. `roundsOf(n)` is a division's own length. */
export const ROUNDS = 26;
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
  const list = ids.slice();
  if (list.length % 2) list.push(null);      // a bye, for an odd division
  const n = list.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      if (a === null || b === null) continue;
      round.push(r % 2 ? [b, a] : [a, b]);
    }
    rounds.push(round);
    list.splice(1, 0, list.pop());          // rotate all but the first
  }
  return rounds.concat(rounds.map((round) => round.map(([h, a]) => [a, h])));
}
export const roundsOf = (n) => (n % 2 ? n : n - 1) * 2;

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
  for (let r = 0; r < Math.min(played, fixtures.length); r++) {
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
    // the two that go down swap with the two that come up, so sizes never change
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
      round: Math.min(played + 1, fixtures.length),
      rounds: fixtures.length,
      resting: played >= fixtures.length,
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

/* ------------------------------ the continental cup ------------------------------ *
 * The top eight of the top division — last season's table, or the blueprint
 * order in the first season — play a straight knockout across the season:
 * quarter-finals on day 6, semi-finals on day 12, the final on day 17, at
 * the showpiece arenas. A draw goes to penalties, decided by the same hash. */
export const CUP_DAYS = [5, 11, 16];          // 0-based days within the season
export const CUP_ROUNDS = ['Quarter-finals', 'Semi-finals', 'Final'];

function cupResult(season, round, home, away) {
  const [gh, ga] = result(season, 9, 100 + round, home, away);
  if (gh !== ga) return { gh, ga, winner: gh > ga ? home : away };
  const r = rng(hashStr(`pens|${season}|${round}|${home}|${away}`));
  const ph = 3 + Math.floor(r() * 3);
  const pa = ph === 5 ? 3 + Math.floor(r() * 2) : ph + 1 + Math.floor(r() * (5 - ph));
  const homeWins = r() < 0.5;
  return { gh, ga, pens: homeWins ? [Math.max(ph, pa), Math.min(ph, pa)] : [Math.min(ph, pa), Math.max(ph, pa)], winner: homeWins ? home : away };
}

/** Who qualified for this season's cup: last season's top eight. */
export function cupEntrants(season) {
  if (season === 0) return composition(0)[0].slice(0, 8);
  return divisionTable(season - 1, 1, composition(season - 1)[0], ROUNDS).slice(0, 8).map((r) => r.id);
}

/**
 * The cup as it stands after `played` days of the season (all of it when
 * `played` is omitted). Ties are seeded 1v8, 2v7, 3v6, 4v5.
 */
export function continentalCup(season, played = ROUNDS) {
  const e = cupEntrants(season);
  let alive = [[e[0], e[7]], [e[3], e[4]], [e[1], e[6]], [e[2], e[5]]];
  const rounds = [];
  for (let r = 0; r < 3; r++) {
    const day = CUP_DAYS[r];
    const done = played > day;
    const ties = alive.map(([h, a]) => (done ? { home: h, away: a, ...cupResult(season, r, h, a) } : { home: h, away: a }));
    rounds.push({ name: CUP_ROUNDS[r], day, done, today: played === day, ties });
    if (!done) break;
    const w = ties.map((t) => t.winner);
    alive = [];
    for (let i = 0; i < w.length; i += 2) alive.push([w[i], w[i + 1]]);
  }
  const final = rounds[2];
  return { entrants: e, rounds, winner: final?.done ? final.ties[0].winner : null };
}

/* --------------------------------- nations --------------------------------- *
 * National teams built from the pool: every nation with a keeper and enough
 * outfielders gets a side, its best XI picked into a 4-3-3 from every card
 * in the world (club players and free agents alike, never the Icons, who
 * are retired). Rated like a club. */
const NATION_SHAPE = SHAPES['4-3-3'];
const ROLE_OF = { GK: 'GK', CB: 'DF', LB: 'DF', RB: 'DF', CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'FWD', RW: 'FWD', ST: 'FWD' };
let nationCache = null;
export function nations() {
  if (nationCache) return nationCache;
  const byNation = new Map();
  for (const p of WORLD.players) {
    if (p.rarity === 'icon' || p.sbc) continue;
    if (!byNation.has(p.nation)) byNation.set(p.nation, []);
    byNation.get(p.nation).push(p);
  }
  const out = [];
  for (const [nation, pool] of byNation) {
    const sorted = pool.slice().sort((a, b) => b.overall - a.overall);
    const xi = [];
    const used = new Set();
    for (const slot of NATION_SHAPE) {
      const want = slot.role === 'GK' ? 'GK' : slot.role === 'DEF' ? 'DF' : slot.role === 'MID' ? 'MID' : 'FWD';
      let pick = sorted.find((p) => !used.has(p.id) && (slot.role === 'GK' ? p.position === 'GK' : ROLE_OF[p.position] === want && p.position !== 'GK'));
      if (!pick) pick = sorted.find((p) => !used.has(p.id) && (slot.role === 'GK') === (p.position === 'GK'));
      if (!pick) break;
      used.add(pick.id); xi.push(pick);
    }
    if (xi.length < 11) continue;
    const bench = sorted.filter((p) => !used.has(p.id)).slice(0, 7);
    const rating = Math.round(xi.reduce((s, p) => s + p.overall, 0) / 11);
    const colors = NATION_COLORS[nation] || xi[0].nationColors || ['#ffffff', '#222222'];
    out.push({ nation, short: nationShort(nation), colors, xi, bench, rating, poolSize: pool.length });
  }
  out.sort((a, b) => b.rating - a.rating || a.nation.localeCompare(b.nation));
  nationCache = out;
  return out;
}
function nationShort(n) {
  const map = { 'United Arab Emirates': 'UAE', 'Saudi Arabia': 'KSA', 'South Korea': 'KOR', 'Ivory Coast': 'CIV', 'Czech Republic': 'CZE', 'Northern Ireland': 'NIR', 'Bosnia and Herzegovina': 'BIH', 'North Macedonia': 'MKD', 'DR Congo': 'COD', 'South Africa': 'RSA', 'New Zealand': 'NZL', 'USA': 'USA', 'Costa Rica': 'CRC', 'El Salvador': 'SLV', 'Burkina Faso': 'BFA', 'Central African Republic': 'CAF', 'Guinea-Bissau': 'GNB' };
  return map[n] || n.slice(0, 3).toUpperCase();
}
/** A national side as a squad the match screen can field. */
export function nationSquad(nation) {
  const n = nations().find((x) => x.nation === nation);
  if (!n) return null;
  return {
    id: `nat-${nation}`, name: nation, short: n.short, colors: n.colors, rating: n.rating, national: true,
    crest: { shape: 'circle', pattern: 'halves', device: 'star', colors: n.colors },
    xi: n.xi, bench: n.bench,
  };
}

/* The international break: days 8 and 9 of every season, when the eight
 * best national sides play a Nations Cup — quarters and semis on the first
 * day, the final on the second. Results by the same hash. */
export const BREAK_DAYS = [7, 8];
export function nationsCup(season, played = ROUNDS) {
  const top = nations().slice(0, 8);
  const ids = top.map((n) => n.nation);
  const tie = (r, a, b) => {
    const rr = rng(hashStr(`nations|${season}|${r}|${a}|${b}`));
    const ra = top.find((n) => n.nation === a).rating;
    const rb = top.find((n) => n.nation === b).rating;
    const edge = (ra - rb) / 10;
    const ga = poisson(Math.max(0.3, 1.3 + edge), rr);
    const gb = poisson(Math.max(0.3, 1.2 - edge), rr);
    const winner = ga > gb ? a : gb > ga ? b : (rr() < 0.5 ? a : b);
    return { home: a, away: b, gh: ga, ga: gb, pens: ga === gb, winner };
  };
  const rounds = [];
  let alive = [[ids[0], ids[7]], [ids[3], ids[4]], [ids[1], ids[6]], [ids[2], ids[5]]];
  for (let r = 0; r < 3; r++) {
    const day = r < 2 ? BREAK_DAYS[0] : BREAK_DAYS[1];
    const done = played > day;
    const ties = alive.map(([a, b]) => (done ? tie(r, a, b) : { home: a, away: b }));
    rounds.push({ name: CUP_ROUNDS[r], day, done, today: played === day, ties });
    if (!done) break;
    const w = ties.map((t) => t.winner);
    alive = [];
    for (let i = 0; i < w.length; i += 2) alive.push([w[i], w[i + 1]]);
  }
  return { teams: top, rounds, winner: rounds[2]?.done ? rounds[2].ties[0].winner : null };
}

/* --------------------------------- honours --------------------------------- *
 * Every finished season's champions, by division, plus the cup winners —
 * the board in the Hall of Fame. */
export function honours(now = Date.now()) {
  const { season } = calendar(now);
  const list = [];
  for (let s = season - 1; s >= Math.max(0, season - 12); s--) {
    const divs = composition(s);
    list.push({
      season: s + 1,
      champions: divs.map((ids, d) => divisionTable(s, d + 1, ids, ROUNDS)[0].id),
      cup: continentalCup(s).winner,
      nationsCup: nationsCup(s).winner,
    });
  }
  return list;
}

/* ------------------------------ the club world cup ------------------------------ *
 * Eight clubs on days 21, 23 and 25 of the season, at the arenas: last
 * season's champions of the top four divisions, the continental cup winner,
 * and the next three best of the top flight — a straight knockout. */
export const CWC_DAYS = [20, 22, 24];
export function clubWorldCup(season, played = ROUNDS) {
  let entrants;
  if (season === 0) entrants = composition(0)[0].slice(0, 8);
  else {
    const prev = composition(season - 1);
    const champs = prev.slice(0, 4).map((ids, d) => divisionTable(season - 1, d + 1, ids, ROUNDS)[0].id);
    const cup = continentalCup(season - 1).winner;
    const top = divisionTable(season - 1, 1, prev[0], ROUNDS).map((r) => r.id);
    entrants = [];
    for (const id of [...champs, cup, ...top]) if (id && !entrants.includes(id) && entrants.length < 8) entrants.push(id);
  }
  let alive = [[entrants[0], entrants[7]], [entrants[3], entrants[4]], [entrants[1], entrants[6]], [entrants[2], entrants[5]]];
  const rounds = [];
  for (let r = 0; r < 3; r++) {
    const day = CWC_DAYS[r];
    const done = played > day;
    const ties = alive.map(([h, a]) => (done ? { home: h, away: a, ...cupResultTagged(season, 'cwc', r, h, a) } : { home: h, away: a }));
    rounds.push({ name: CUP_ROUNDS[r], day, done, today: played === day, ties });
    if (!done) break;
    const w = ties.map((t) => t.winner);
    alive = [];
    for (let i = 0; i < w.length; i += 2) alive.push([w[i], w[i + 1]]);
  }
  return { entrants, rounds, winner: rounds[2]?.done ? rounds[2].ties[0].winner : null };
}
function cupResultTagged(season, tag, round, home, away) {
  const [gh, ga] = result(season, tag === 'cwc' ? 8 : 9, 200 + round, home, away);
  if (gh !== ga) return { gh, ga, winner: gh > ga ? home : away };
  const r = rng(hashStr(`pens|${tag}|${season}|${round}|${home}|${away}`));
  const homeWins = r() < 0.5;
  return { gh, ga, pens: homeWins ? [5, 4] : [4, 5], winner: homeWins ? home : away };
}

/* ------------------------------ the World Tournament ------------------------------ *
 * Thirty-two nations, drawn into eight groups of four by a seeded draw
 * (pot by rating), three group rounds, then a sixteen-team knockout. This is
 * the *simulated* edition every fourth season (the calendar's world year);
 * the playable one, where you take a nation through it, lives in
 * tournament.js and uses the same draw. */
export const WT_EVERY = 4;
export function worldTournamentDraw(edition) {
  const top = nations().slice(0, 32);
  const r = rng(hashStr(`wt|${edition}`));
  const pots = [0, 1, 2, 3].map((p) => top.slice(p * 8, p * 8 + 8).map((n) => n.nation));
  const groups = Array.from({ length: 8 }, () => []);
  for (const pot of pots) {
    const order = pot.slice();
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    order.forEach((n, i) => groups[i].push(n));
  }
  return { edition, groups, teams: top };
}
function nationTie(edition, tag, a, b, allowDraw) {
  const rr = rng(hashStr(`wt|${edition}|${tag}|${a}|${b}`));
  const all = nations();
  const ra = all.find((n) => n.nation === a)?.rating || 70;
  const rb = all.find((n) => n.nation === b)?.rating || 70;
  const edge = (ra - rb) / 10;
  const ga = poisson(Math.max(0.3, 1.3 + edge), rr);
  const gb = poisson(Math.max(0.3, 1.2 - edge), rr);
  let winner = ga > gb ? a : gb > ga ? b : null;
  let pens = false;
  if (!winner && !allowDraw) { winner = rr() < 0.5 ? a : b; pens = true; }
  return { home: a, away: b, gh: ga, ga: gb, winner, pens };
}
/** The whole simulated tournament for an edition (all results known). */
export function worldTournament(edition) {
  const draw = worldTournamentDraw(edition);
  const groups = draw.groups.map((g, gi) => {
    const table = Object.fromEntries(g.map((n) => [n, { id: n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }]));
    const matches = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]].map(([i, j]) => nationTie(edition, `g${gi}`, g[i], g[j], true));
    for (const m of matches) applyResult(table, m.home, m.away, m.gh, m.ga);
    const order = Object.values(table).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.id.localeCompare(y.id));
    return { teams: g, matches, table: order };
  });
  // round of 16: winner of A v runner-up of B, and so on
  let alive = [];
  for (let i = 0; i < 8; i += 2) {
    alive.push([groups[i].table[0].id, groups[i + 1].table[1].id]);
    alive.push([groups[i + 1].table[0].id, groups[i].table[1].id]);
  }
  const knockout = [];
  const names = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];
  for (let r = 0; r < 4; r++) {
    const ties = alive.map(([a, b]) => nationTie(edition, `k${r}`, a, b, false));
    knockout.push({ name: names[r], ties });
    const w = ties.map((t) => t.winner);
    alive = [];
    for (let i = 0; i < w.length; i += 2) alive.push([w[i], w[i + 1]]);
  }
  return { ...draw, groups, knockout, winner: knockout[3].ties[0].winner };
}
