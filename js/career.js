/**
 * Manager Career engine — the state and rules; the screens live in
 * screens/career.js and the matchday experience in screens/play.js.
 *
 * One principle everywhere: a footballer is the same person in every corner of
 * the game. A career squad entry is resolved BY NAME to the generated card the
 * rest of the game already uses, so ratings, stats, feet and ages agree with
 * Ultimate XI — with one stated exception (CAREER_RATINGS) for the twenty
 * names that exist only as 99/92 trading cards.
 *
 * The career slice lives in the ordinary save (state.career, shape v2). The
 * old locked-away career was v1 (no `.manager`); it was never reachable from
 * the menu, so v2 simply replaces it rather than migrating.
 */
import { WORLD } from './data/generator.js';
import { CAREER_CLUBS, CAREER_SQUADS, CAREER_RATINGS, REAL_MANAGERS } from './data/careerDb.js';
import { getState, update } from './state.js';

export { CAREER_CLUBS, REAL_MANAGERS };
export const careerClub = (id) => CAREER_CLUBS.find((c) => c.id === id);
export const START_COINS = 500_000_000;

/* ------------------------------------------------------------------ *
 * Player resolution
 * ------------------------------------------------------------------ */
let byName = null;
const nameIndex = () => {
  if (!byName) { byName = new Map(); for (const p of WORLD.players) byName.set(p.name, p); }
  return byName;
};

const round3 = (n) => Math.round(n / 1000) * 1000;

/** Market value for a stated rating — same curve the generator uses in spirit. */
function valueFor(overall, age) {
  const base = Math.max(1, overall - 58) ** 3 * 950;
  const ageMod = age <= 23 ? 1.35 : age <= 27 ? 1.15 : age <= 30 ? 1 : age <= 33 ? 0.62 : 0.34;
  return round3(base * ageMod);
}

/**
 * Deterministic personality from the name — hidden numbers that decide how a
 * player takes praise and criticism. Professionalism dampens everything;
 * temperament is how hard criticism lands; spark is how much pressure lifts.
 */
function personality(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
  h = Math.abs(h);
  return {
    prof: 0.35 + ((h >>> 3) % 100) / 150,        // 0.35..1.0
    temper: ((h >>> 9) % 100) / 100,             // 0 placid .. 1 volatile
    spark: ((h >>> 17) % 100) / 100,             // responds to being pushed
  };
}

/** A career squad entry, resolved to live numbers. */
export function resolveEntry(row, contract) {
  const [name, position, nation] = row;
  const card = nameIndex().get(name);
  const overall = CAREER_RATINGS[name] || card?.overall || 74;
  const age = card?.age ?? 27;
  const value = CAREER_RATINGS[name] ? valueFor(overall, age) : (card?.value ?? valueFor(overall, age));
  return {
    name,
    short: card?.short || name,
    position,
    nation,
    age,
    overall,
    stats: card?.stats || { pace: 70, shooting: 66, passing: 70, dribbling: 70, defending: 62, physical: 70 },
    foot: card?.foot || 'R',
    value,
    wage: round3(Math.max(4000, Math.round(value / 250))),     // weekly
    persona: personality(name),
    contract: contract || null,
    form: 0,          // -2..2, drifts with results
    morale: 0.65,     // 0..1
  };
}

const contractFor = (name, season = 1) => {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { years: 1 + (h % 4), signed: season };                 // 1..4 seasons left
};

export function squadOf(clubId, careerSquads = null) {
  const rows = careerSquads?.[clubId] || CAREER_SQUADS[clubId];
  return rows.map((r) => resolveEntry(r.slice(0, 3), r[3] || contractFor(r[0])));
}

export const clubOverall = (clubId, squads = null) => {
  const sq = squadOf(clubId, squads);
  const top = sq.map((p) => p.overall).sort((a, b) => b - a).slice(0, 11);
  return Math.round(top.reduce((s, v) => s + v, 0) / top.length);
};

/* ------------------------------------------------------------------ *
 * Fixtures: double round robin inside the club's league, byes allowed
 * ------------------------------------------------------------------ */
export function leagueClubs(league) { return CAREER_CLUBS.filter((c) => c.league === league); }

export function makeFixtures(league) {
  const ids = leagueClubs(league).map((c) => c.id);
  const teams = ids.length % 2 ? [...ids, null] : [...ids];      // null = bye
  const n = teams.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i]; const b = teams[n - 1 - i];
      if (a && b) pairs.push(r % 2 ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    teams.splice(1, 0, teams.pop());                             // rotate
  }
  return [...rounds, ...rounds.map((rd) => rd.map(([h, a]) => [a, h]))];
}

/* ------------------------------------------------------------------ *
 * Career lifecycle
 * ------------------------------------------------------------------ */
export function startCareer(manager, clubId) {
  const club = careerClub(clubId);
  // every squad in MY league is materialised (rows + contract), because
  // transfers and contract expiries have to be able to change them
  const squads = {};
  for (const c of CAREER_CLUBS) {
    squads[c.id] = CAREER_SQUADS[c.id].map((r) => [...r.slice(0, 3), contractFor(r[0])]);
  }
  update((s) => {
    s.career = {
      v: 2,
      manager,
      clubId,
      coins: START_COINS,
      season: 1,
      week: 1,
      fixtures: makeFixtures(club.league),
      table: Object.fromEntries(leagueClubs(club.league).map((c) =>
        [c.id, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }])),
      squads,
      results: [],
      morale: 0.65,                 // team morale, carried between matches
      shortlist: [],
      negotiation: null,            // the in-flight transfer, if any
      stats: { w: 0, d: 0, l: 0, seasons: 0, trophies: 0, rep: 50 },
      history: [],
    };
  });
  return getState().career;
}

export const myFixture = (car) => {
  const round = car.fixtures[car.week - 1];
  if (!round) return null;
  const m = round.find(([h, a]) => h === car.clubId || a === car.clubId);
  return m ? { home: m[0], away: m[1], isHome: m[0] === car.clubId } : null;  // null = bye week
};

const applyRow = (t, hg, ag) => { t.p++; t.gf += hg; t.ga += ag;
  if (hg > ag) { t.w++; t.pts += 3; } else if (hg < ag) { t.l++; } else { t.d++; t.pts++; } };

/** Rating-weighted scoreline for a fixture the manager does not play in. */
export function simScore(homeId, awayId, squads) {
  const d = clubOverall(homeId, squads) - clubOverall(awayId, squads) + 2;   // home edge
  const g = () => { const r = Math.random(); return r < 0.34 ? 0 : r < 0.68 ? 1 : r < 0.88 ? 2 : r < 0.97 ? 3 : 4; };
  let hg = g(); let ag = g();
  if (d > 3 && Math.random() < d / 14) hg += 1;
  if (d < -3 && Math.random() < -d / 14) ag += 1;
  return [hg, ag];
}

/** Record my result, sim the rest of the round, advance the week. */
export function advanceWeek(myScore) {
  update((s) => {
    const car = s.career; if (!car) return;
    const round = car.fixtures[car.week - 1] || [];
    for (const [h, a] of round) {
      const mine = h === car.clubId || a === car.clubId;
      const [hg, ag] = mine && myScore ? myScore : simScore(h, a, car.squads);
      applyRow(car.table[h], hg, ag);
      applyRow(car.table[a], ag, hg);
      car.results.push({ week: car.week, h, a, hg, ag });
      if (mine && myScore) {
        const win = (h === car.clubId ? hg > ag : ag > hg);
        const draw = hg === ag;
        car.stats[win ? 'w' : draw ? 'd' : 'l'] += 1;
        car.stats.rep = Math.max(1, Math.min(99, car.stats.rep + (win ? 2 : draw ? 0 : -1)));
        car.morale = Math.max(0.05, Math.min(1, car.morale + (win ? 0.08 : draw ? -0.01 : -0.09)));
      }
    }
    car.week += 1;
    if (car.week > car.fixtures.length) endSeason(car);
  });
}

/** Contracts tick, expiries leave, the calendar resets. */
function endSeason(car) {
  const table = sortedCareerTable(car);
  const champion = table[0]?.id === car.clubId;
  if (champion) car.stats.trophies += 1;
  car.history.push({ season: car.season, pos: table.findIndex((r) => r.id === car.clubId) + 1, pts: car.table[car.clubId].pts });
  car.stats.seasons += 1;
  for (const [cid, rows] of Object.entries(car.squads)) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const c = rows[i][3];
      c.years -= 1;
      // expiry: my players go through the renewal screen; elsewhere the club
      // quietly re-signs most and loses some to the void of "another club"
      if (c.years <= 0 && cid !== car.clubId) {
        if (Math.random() < 0.6) c.years = 1 + Math.floor(Math.random() * 3);
        else rows.splice(i, 1);
      }
    }
  }
  car.expiring = car.squads[car.clubId].filter((r) => r[3].years <= 0).map((r) => r[0]);
  car.season += 1;
  car.week = 1;
  car.fixtures = makeFixtures(careerClub(car.clubId).league);
  for (const id of Object.keys(car.table)) car.table[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
}

export function sortedCareerTable(car) {
  return Object.keys(car.table)
    .map((id) => ({ id, club: careerClub(id), ...car.table[id], gd: car.table[id].gf - car.table[id].ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

/* ------------------------------------------------------------------ *
 * Transfers — staged, priced by football economics
 * ------------------------------------------------------------------ */
/** What the selling club wants. Short contracts come cheap: a player with a
 *  season left is walking soon and everybody at the table knows it. */
export function askingPrice(entry, contract) {
  const years = contract?.years ?? 2;
  const contractMod = years <= 1 ? 0.55 : years === 2 ? 0.9 : 1.1 + (years - 3) * 0.08;
  const formMod = 1 + (entry.form || 0) * 0.05;
  return round3(entry.value * contractMod * formMod * 1.18);      // clubs open high
}

/** Every player on every other club, resolved, for the market screens. */
export function marketPool(car) {
  const out = [];
  for (const club of CAREER_CLUBS) {
    if (club.id === car.clubId) continue;
    for (const row of car.squads[club.id]) {
      out.push({ ...resolveEntry(row.slice(0, 3), row[3]), clubId: club.id, club });
    }
  }
  return out;
}

/**
 * The staged deal. `state`: fee -> terms -> done/off. Each submission gets an
 * answer at once (the week is the career's clock and a whole week per reply
 * would make signing anyone take a season) but never a rubber stamp: clubs
 * counter, players have wage floors, and either can walk away.
 */
export function openNegotiation(car, playerName, fromClubId) { /* stored on the slice */
  return { player: playerName, from: fromClubId, state: 'fee', rounds: 0, agreedFee: 0 };
}

export function respondToFee(neg, offer, entry, contract) {
  const ask = askingPrice(entry, contract);
  neg.rounds += 1;
  if (offer >= ask * 0.92) { neg.state = 'terms'; neg.agreedFee = offer; return { ok: true, note: 'Fee agreed. Now the player wants terms.' }; }
  if (neg.rounds >= 3) { neg.state = 'off'; return { ok: false, note: 'The club has ended negotiations.' }; }
  const counter = round3(Math.max(ask * (0.98 - neg.rounds * 0.03), offer * 1.12));
  neg.counter = counter;
  return { ok: false, note: `Rejected. They would accept around ${fmtCoins(counter)}.`, counter };
}

export function respondToTerms(neg, wage, years, entry) {
  const wants = Math.round(entry.wage * (1.1 + (entry.overall >= 86 ? 0.25 : 0)));
  const yearMod = years >= 3 ? 0.94 : years === 2 ? 1 : 1.08;     // security is worth money
  const floor = round3(wants * yearMod);
  if (wage >= floor) { neg.state = 'done'; neg.wage = wage; neg.years = years; return { ok: true }; }
  neg.rounds += 1;
  if (neg.rounds >= 5) { neg.state = 'off'; return { ok: false, note: 'The player has walked away.' }; }
  return { ok: false, note: `Not enough. His side wants ${fmtCoins(floor)} a week on ${years} year${years === 1 ? '' : 's'}.`, floor };
}

/** Move the player, take the money. The one place a transfer becomes real. */
export function completeTransfer(car, neg) {
  const rows = car.squads[neg.from];
  const i = rows.findIndex((r) => r[0] === neg.player);
  if (i < 0 || car.coins < neg.agreedFee) return false;
  const row = rows.splice(i, 1)[0];
  row[3] = { years: neg.years, signed: car.season, wage: neg.wage };
  car.squads[car.clubId].push(row);
  car.coins -= neg.agreedFee;
  return true;
}

export function renewContract(car, name, years) {
  const row = car.squads[car.clubId].find((r) => r[0] === name);
  if (!row) return false;
  const entry = resolveEntry(row.slice(0, 3), row[3]);
  // low team morale is when renewals get rejected — the squad watches results
  if (car.morale < 0.35 && entry.persona.temper > 0.6 && Math.random() < 0.5) return false;
  row[3] = { years, signed: car.season, wage: round3(entry.wage * 1.1) };
  return true;
}

export function releaseExpired(car) {
  const rows = car.squads[car.clubId];
  for (let i = rows.length - 1; i >= 0; i--) if (rows[i][3].years <= 0) rows.splice(i, 1);
  car.expiring = [];
}

export const fmtCoins = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
};
