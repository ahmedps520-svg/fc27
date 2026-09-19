/**
 * Career V2 — the parts of being a manager that are not the ninety minutes.
 *
 * Everything here hangs off the career slice `getState().career` and is
 * called from career.js at the moments it already has: week advance, season
 * end, a transfer completing. The pieces:
 *
 *   tier two      every country has a second division of real-club names whose
 *                 squads are dealt from the world's real players; bottom two go
 *                 down, top two come up, and so can you
 *   the cup       a knockout of every club in the country, one round every
 *                 fifth week of the calendar
 *   offers        AI clubs bid for your players in the windows; you accept,
 *                 counter or refuse
 *   AI transfers  clubs deal among themselves every window, so the league is
 *                 not a photograph
 *   youth         three academy prospects who train, grow and can be promoted
 *   scouting      point a scout at a league; four weeks later, three targets
 *   development   the young grow toward a potential, the old fade, once a season
 *   the board     objectives set from where the club stands; miss them badly
 *                 and you are out, with offers from elsewhere if your name is
 *                 worth anything
 *   press         a question after every match; the answer moves morale and
 *                 the board's patience
 */
import { WORLD } from './data/generator.js';
import { CAREER_CLUBS, CAREER_SQUADS } from './data/careerDb.js';
import { pend } from './progress.js';

/* ------------------------------------------------------------------ *
 * Tier two
 * ------------------------------------------------------------------ */
/* Three a country: the world has ~400 real players who are on no top-tier
 * career squad, which is eighteen squads of fourteen and not a name more. */
export const TIER2 = {
  'Premier League': ['Leeds United', 'Sheffield United', 'Leicester City'],
  'La Liga': ['Real Zaragoza', 'Deportivo La Coruña', 'Málaga'],
  'Serie A': ['Sampdoria', 'Palermo', 'Bari'],
  Bundesliga: ['Hamburger SV', 'Schalke 04', 'Hertha BSC'],
  'Ligue 1': ['Saint-Étienne', 'Bordeaux', 'Metz'],
  'Saudi Pro League': ['Al-Faisaly', 'Al-Batin', 'Al-Qadsiah'],
};
const T2_COLORS = [['#ffffff', '#1d428a'], ['#6c1d45', '#99d6ea'], ['#ee2737', '#000000'], ['#d71920', '#ffffff'], ['#003090', '#fdbe11'], ['#00a650', '#fff200']];
const shortOf = (name) => name.replace(/^\d+\.\s*/, '').replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase().padEnd(3, 'X');

/** Every club: the real top tiers plus the second tiers, with `tier`. */
let ALL_CLUBS = null;
export function allClubs() {
  if (ALL_CLUBS) return ALL_CLUBS;
  const t1 = CAREER_CLUBS.map((c) => ({ ...c, tier: 1 }));
  const t2 = [];
  for (const [league, names] of Object.entries(TIER2)) {
    const country = CAREER_CLUBS.find((c) => c.league === league)?.country || 'England';
    names.forEach((name, i) => t2.push({
      id: `t2-${league.replace(/\W+/g, '').toLowerCase()}-${i}`, name, short: shortOf(name),
      league: `${league} 2`, tier: 2, parent: league, country, colors: T2_COLORS[i % T2_COLORS.length],
      shape: ['shield', 'circle', 'hex'][i % 3],
    }));
  }
  ALL_CLUBS = [...t1, ...t2];
  return ALL_CLUBS;
}
export const clubOf = (id) => allClubs().find((c) => c.id === id) || null;
export const tier2Of = (league) => `${league} 2`;
export const topOf = (league) => (league.endsWith(' 2') ? league.slice(0, -2) : league);

/**
 * Squads for the second tier, dealt from real players not on any top-tier
 * career squad: rated 62–76, 18 per club, sorted so the pool is used evenly.
 * Deterministic (sorted by id) so every save sees the same second tier.
 */
export function tier2Squads() {
  const used = new Set(Object.values(CAREER_SQUADS).flat().map((r) => r[0]));
  const pool = WORLD.players
    .filter((p) => !p.sbc && p.rarity !== 'icon' && p.rarity !== 'star' && !used.has(p.name) && p.overall >= 55 && p.overall <= 80)
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  const byPos = { GK: [], DEF: [], MID: [], FWD: [] };
  const group = (pos) => (pos === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(pos) ? 'DEF' : ['ST', 'LW', 'RW'].includes(pos) ? 'FWD' : 'MID');
  for (const p of pool) byPos[group(p.position)].push(p);
  const SHAPE = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];
  const out = {};
  for (const c of allClubs().filter((x) => x.tier === 2)) {
    out[c.id] = SHAPE.map((g) => {
      let p = byPos[g].shift();
      // keepers are the scarce group: a defender pulls the gloves on
      if (!p && g === 'GK') { p = byPos.DEF.shift(); return p ? [p.name, 'GK', p.nation] : null; }
      return p ? [p.name, p.position, p.nation] : null;
    }).filter(Boolean);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Calendar: league rounds with a cup round every fifth week
 * ------------------------------------------------------------------ */
/** Byes allowed: a round is [[home, away], ...] pairs. */
export function roundRobin(ids) {
  const list = ids.slice();
  if (list.length % 2) list.push(null);
  const n = list.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i], b = list[n - 1 - i];
      if (a && b) round.push(r % 2 ? [b, a] : [a, b]);
    }
    rounds.push(round);
    list.splice(1, 0, list.pop());
  }
  return [...rounds, ...rounds.map((rd) => rd.map(([h, a]) => [a, h]))];
}

/** Clubs in a league this season (tier moves are applied to `car.leagueOf`). */
export const leagueClubIds = (car, league) => Object.entries(car.leagueOf || {}).filter(([, l]) => l === league).map(([id]) => id);

/**
 * Build the season's fixture list: `{ type: 'league', pairs }` rounds with a
 * `{ type: 'cup', round }` slotted after every fifth league round. The cup
 * bracket is drawn at season start from every club in the country.
 */
export function buildCalendar(car, league) {
  const ids = leagueClubIds(car, league);
  const leagueRounds = roundRobin(ids).map((pairs) => ({ type: 'league', pairs }));
  const country = clubOf(car.clubId)?.country;
  const cupIds = allClubs().filter((c) => c.country === country).map((c) => c.id);
  const rounds = Math.ceil(Math.log2(cupIds.length));
  const cal = [];
  let cupRound = 0;
  leagueRounds.forEach((r, i) => {
    cal.push(r);
    if ((i + 1) % 5 === 0 && cupRound < rounds) cal.push({ type: 'cup', round: cupRound++ });
  });
  while (cupRound < rounds) cal.push({ type: 'cup', round: cupRound++ });
  car.cup = { alive: cupIds.slice().sort(() => Math.random() - 0.5), out: [], results: [], rounds, winner: null };
  return cal;
}

/* ------------------------------------------------------------------ *
 * Ratings helpers (mirror career.js without importing it — no cycles)
 * ------------------------------------------------------------------ */
const ratingOf = (name) => WORLD.players.find((p) => p.name === name)?.overall || 72;
export function squadOverall(rows) {
  const top = rows.map((r) => ratingOf(r[0])).sort((a, b) => b - a).slice(0, 11);
  return top.length ? Math.round(top.reduce((s, v) => s + v, 0) / top.length) : 60;
}
export function simScoreV2(car, h, a) {
  const d = squadOverall(car.squads[h] || []) - squadOverall(car.squads[a] || []) + 2;
  const g = () => { const r = Math.random(); return r < 0.34 ? 0 : r < 0.68 ? 1 : r < 0.88 ? 2 : r < 0.97 ? 3 : 4; };
  let hg = g(); let ag = g();
  if (d > 3 && Math.random() < d / 14) hg += 1;
  if (d < -3 && Math.random() < -d / 14) ag += 1;
  return [hg, ag];
}

/** Play the cup round the calendar has reached. `myScore` is [mine, theirs] when I played. */
export function playCupRound(car, round, myScore) {
  const cup = car.cup;
  if (!cup || cup.alive.length < 2) return;
  const next = [];
  const alive = cup.alive.slice();
  if (alive.length % 2) next.push(alive.pop());           // a bye
  for (let i = 0; i < alive.length; i += 2) {
    const [h, a] = [alive[i], alive[i + 1]];
    const mine = h === car.clubId || a === car.clubId;
    let [hg, ag] = mine && myScore ? (h === car.clubId ? myScore : [myScore[1], myScore[0]]) : simScoreV2(car, h, a);
    let pens = null;
    if (hg === ag) { pens = Math.random() < 0.5 ? 'h' : 'a'; }
    const winner = hg > ag || pens === 'h' ? h : a;
    cup.results.push({ round, h, a, hg, ag, pens, winner });
    next.push(winner);
    cup.out.push(winner === h ? a : h);
  }
  cup.alive = next;
  if (next.length === 1) {
    cup.winner = next[0];
    if (cup.winner === car.clubId) {
      car.stats.cups = (car.stats.cups | 0) + 1;
      pend(carState(), { kind: 'career', title: 'Cup winners!', sub: 'Career crossover', apex: 8000, pack: 'gold' });
    }
  }
}
/** My cup tie this round, if any. */
export function myCupTie(car) {
  const cup = car.cup;
  if (!cup || !cup.alive.includes(car.clubId) || cup.alive.length < 2) return null;
  const alive = cup.alive.slice();
  if (alive.length % 2) alive.pop();
  const i = alive.indexOf(car.clubId);
  if (i < 0) return null;
  const h = alive[i - (i % 2)], a = alive[i - (i % 2) + 1];
  return { home: h, away: a, isHome: h === car.clubId };
}

// progress.pend needs the full state; career functions get the slice
const carState = () => ({ club: stateClub() });
let stateClub = () => ({});
/** career.js hands over a getter for the club slice so rewards can be queued. */
export const bindState = (fn) => { stateClub = fn; };

/* ------------------------------------------------------------------ *
 * Transfer windows: offers for my players, deals between AI clubs
 * ------------------------------------------------------------------ */
export const inWindow = (week, total) => week <= 3 || (week >= Math.floor(total / 2) && week < Math.floor(total / 2) + 3);

const valueOf = (name) => WORLD.players.find((p) => p.name === name)?.value || 5_000_000;

/** AI clubs come for my best players. One offer a window week, if any. */
export function generateOffers(car, week) {
  if (!inWindow(week, car.fixtures.length)) return;
  car.offers = (car.offers || []).filter((o) => o.until >= week);
  if (Math.random() > 0.55 || car.offers.length >= 2) return;
  const mine = car.squads[car.clubId].slice().sort((x, y) => ratingOf(y[0]) - ratingOf(x[0])).slice(0, 6);
  const target = mine[Math.floor(Math.random() * mine.length)];
  if (!target || car.offers.some((o) => o.player === target[0])) return;
  const buyers = allClubs().filter((c) => c.id !== car.clubId && c.tier === 1);
  const buyer = buyers[Math.floor(Math.random() * buyers.length)];
  const value = valueOf(target[0]);
  car.offers.push({
    id: `${week}-${target[0]}`, player: target[0], from: buyer.id, fee: Math.round(value * (0.85 + Math.random() * 0.5) / 1e5) * 1e5,
    until: week + 2, rounds: 0, state: 'open',
  });
}

/** Accept / counter / reject an offer. Counter asks for `fee`. */
export function respondToOffer(car, id, action, fee = 0) {
  const o = (car.offers || []).find((x) => x.id === id);
  if (!o || o.state !== 'open') return { ok: false, note: 'That offer is gone.' };
  if (action === 'reject') { o.state = 'rejected'; return { ok: true, note: 'Rejected. They will look elsewhere.' }; }
  const value = valueOf(o.player);
  if (action === 'counter') {
    o.rounds += 1;
    if (fee <= o.fee) return { ok: false, note: 'A counter has to ask for more.' };
    if (fee <= value * 1.45 && Math.random() < 0.7 - o.rounds * 0.2) { o.fee = fee; return { ok: true, note: `They will pay ${Math.round(fee / 1e6)}M. Accept to complete.`, raised: true }; }
    if (o.rounds >= 2 || fee > value * 1.8) { o.state = 'withdrawn'; return { ok: false, note: 'They have walked away from the deal.' }; }
    const mid = Math.round((o.fee + fee) / 2 / 1e5) * 1e5;
    o.fee = mid;
    return { ok: false, note: `They come back at ${Math.round(mid / 1e6)}M.` };
  }
  // accept
  const rows = car.squads[car.clubId];
  const i = rows.findIndex((r) => r[0] === o.player);
  if (i < 0) return { ok: false, note: 'He is no longer yours.' };
  const row = rows.splice(i, 1)[0];
  row[3] = { years: 3, signed: car.season };
  (car.squads[o.from] = car.squads[o.from] || []).push(row);
  car.coins += o.fee;
  o.state = 'done';
  car.stats.sold = (car.stats.sold | 0) + 1;
  car.morale = Math.max(0.05, car.morale - 0.03);
  return { ok: true, note: `${o.player} sold for ${Math.round(o.fee / 1e6)}M.` };
}

/** Two or three deals between AI clubs each window week, money-balanced by rating. */
export function aiTransfers(car, week) {
  if (!inWindow(week, car.fixtures.length)) return [];
  const clubs = allClubs().filter((c) => c.id !== car.clubId && car.squads[c.id]?.length >= 14);
  const deals = [];
  const n = 2 + Math.floor(Math.random() * 2);
  for (let k = 0; k < n; k++) {
    const buyer = clubs[Math.floor(Math.random() * clubs.length)];
    const seller = clubs[Math.floor(Math.random() * clubs.length)];
    if (!buyer || !seller || buyer === seller || car.squads[seller.id].length <= 15) continue;
    // buyers shop a tier up or level; a second-tier club rarely lands a star
    const rows = car.squads[seller.id];
    const pick = rows[Math.floor(Math.random() * rows.length)];
    if (buyer.tier === 2 && ratingOf(pick[0]) > 78) continue;
    rows.splice(rows.indexOf(pick), 1);
    pick[3] = { years: 2 + Math.floor(Math.random() * 3), signed: car.season };
    car.squads[buyer.id].push(pick);
    deals.push({ week, player: pick[0], from: seller.id, to: buyer.id, fee: valueOf(pick[0]) });
  }
  car.transferNews = [...deals, ...(car.transferNews || [])].slice(0, 12);
  return deals;
}

/* ------------------------------------------------------------------ *
 * Youth academy and scouting
 * ------------------------------------------------------------------ */
const takenNames = (car) => new Set(Object.values(car.squads).flat().map((r) => r[0]).concat((car.youth || []).map((y) => y.name)));

/** Three prospects: real players aged 19 or under who are on nobody's books here. */
export function refillYouth(car) {
  car.youth = car.youth || [];
  const taken = takenNames(car);
  const pool = WORLD.players.filter((p) => p.age <= 19 && !p.sbc && !taken.has(p.name)).sort(() => Math.random() - 0.5);
  while (car.youth.length < 3 && pool.length) {
    const p = pool.pop();
    const potential = Math.min(94, Math.max(p.overall + 6, 70 + Math.floor(Math.random() * 20)));
    car.youth.push({ name: p.name, position: p.position, nation: p.nation, age: p.age, rating: Math.max(52, p.overall - 8), potential, weeks: 0 });
  }
}
/** Training: a little growth every week, faster when the club is happy. */
export function trainYouth(car) {
  for (const y of car.youth || []) {
    y.weeks += 1;
    if (y.rating < y.potential && Math.random() < 0.5 + car.morale * 0.3) y.rating += 1;
  }
}
export function promoteYouth(car, name) {
  const i = (car.youth || []).findIndex((y) => y.name === name);
  if (i < 0) return false;
  const y = car.youth.splice(i, 1)[0];
  car.squads[car.clubId].push([y.name, y.position, y.nation, { years: 3, signed: car.season, youth: true }]);
  car.devBoost = { ...(car.devBoost || {}), [y.name]: y.rating };
  car.stats.youthPromoted = (car.stats.youthPromoted | 0) + 1;
  pend(carState(), { kind: 'career', title: `Academy graduate: ${y.name}`, sub: 'Career crossover', apex: 1500, pack: 'silver' });
  return true;
}

/** Send the scout to a league; four weeks later three targets are known. */
export function scout(car, league) {
  car.scouting = { league, weeksLeft: 4, results: null };
}
export function tickScouting(car) {
  const s = car.scouting;
  if (!s || s.results) return;
  s.weeksLeft -= 1;
  if (s.weeksLeft > 0) return;
  const clubs = allClubs().filter((c) => c.league === s.league && c.id !== car.clubId);
  const rows = clubs.flatMap((c) => (car.squads[c.id] || []).map((r) => ({ name: r[0], position: r[1], nation: r[2], club: c.id, rating: ratingOf(r[0]), age: WORLD.players.find((p) => p.name === r[0])?.age || 26 })));
  rows.sort((a, b) => (b.rating + (28 - b.age) * 0.6) - (a.rating + (28 - a.age) * 0.6));
  s.results = rows.slice(0, 3).map((r) => ({ ...r, potential: Math.max(r.rating, Math.min(95, r.rating + Math.max(0, 27 - r.age) * 1.5)), value: valueOf(r.name) }));
}

/* ------------------------------------------------------------------ *
 * Development, the board, the season review
 * ------------------------------------------------------------------ */
/** Once a season: the young grow, the old fade. Stored as per-name deltas the resolver applies. */
export function developSquads(car) {
  car.dev = car.dev || {};
  for (const rows of Object.values(car.squads)) {
    for (const r of rows) {
      const p = WORLD.players.find((x) => x.name === r[0]);
      if (!p) continue;
      const age = p.age + (car.season - 1);
      const cur = car.dev[r[0]] | 0;
      let d = 0;
      if (age <= 23) d = Math.random() < 0.7 ? 1 + (Math.random() < 0.3 ? 1 : 0) : 0;
      else if (age >= 31) d = Math.random() < 0.6 ? -1 - (age >= 34 ? 1 : 0) : 0;
      if (d) car.dev[r[0]] = Math.max(-8, Math.min(8, cur + d));
    }
  }
}

/** What the board expects, from where the squad ranks in its league. */
export function setBoardObjectives(car) {
  const league = car.leagueOf[car.clubId];
  const ids = leagueClubIds(car, league);
  const rank = ids.map((id) => [id, squadOverall(car.squads[id] || [])]).sort((a, b) => b[1] - a[1]).findIndex(([id]) => id === car.clubId) + 1;
  const n = ids.length;
  const finish = rank <= 1 ? 1 : rank <= 3 ? 3 : rank <= n / 2 ? Math.ceil(n / 2) : n - 2;
  car.board = {
    finish, cup: rank <= 3 ? 'semi' : 'quarter', patience: 1, expectation: rank,
    text: finish === 1 ? 'Win the league.' : finish <= 3 ? `Finish in the top ${finish}.` : finish >= n - 2 ? 'Avoid relegation.' : `Finish in the top half (${finish}).`,
  };
}

/** Mid-season check: far below the objective and patience runs out. */
export function boardReview(car, table) {
  if (!car.board) return null;
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  const n = table.length;
  const gap = pos - car.board.finish;
  const drift = gap > n / 3 ? -0.14 : gap > 2 ? -0.06 : gap <= 0 ? 0.05 : 0;
  car.board.patience = Math.max(0, Math.min(1, car.board.patience + drift + (car.pressMood || 0)));
  car.pressMood = 0;
  return car.board.patience;
}

/** Season end: promotion/relegation, the verdict, and what carries over. */
export function seasonReviewV2(car, table, otherOrder = []) {
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  const league = car.leagueOf[car.clubId];
  const top = topOf(league);
  const isT2 = league.endsWith(' 2');
  const review = { pos, league, champion: pos === 1, cup: car.cup?.winner === car.clubId, cupRound: cupRoundReached(car), objective: car.board?.text, met: pos <= (car.board?.finish || 99), promoted: false, relegated: false, sacked: false, offers: [] };

  // movement between the tiers
  const t2 = tier2Of(top);
  if (!isT2) {
    const down = table.slice(-2).map((r) => r.id);
    const up = otherOrder.slice(0, 2);
    for (const id of down) car.leagueOf[id] = t2;
    for (const id of up) car.leagueOf[id] = top;
    review.relegated = down.includes(car.clubId);
    review.moves = { down, up };
  } else {
    const upMine = table.slice(0, 2).map((r) => r.id);
    const downTop = otherOrder.slice(-2);
    for (const id of upMine) car.leagueOf[id] = top;
    for (const id of downTop) car.leagueOf[id] = t2;
    review.promoted = upMine.includes(car.clubId);
    review.moves = { down: downTop, up: upMine };
  }

  // the board's verdict
  const patience = car.board?.patience ?? 1;
  if (!review.met && patience < 0.35 && !review.promoted && !review.champion && !review.cup) review.sacked = true;
  if (review.sacked) {
    const rep = car.stats.rep;
    const pool = allClubs().filter((c) => c.id !== car.clubId && (rep >= 60 ? c.tier === 1 : c.tier === 2));
    review.offers = pool.sort(() => Math.random() - 0.5).slice(0, 3).map((c) => c.id);
    car.stats.sackings = (car.stats.sackings | 0) + 1;
  }
  // crossover rewards
  if (review.champion) pend(carState(), { kind: 'career', title: `${top} champions!`, sub: 'Career crossover', apex: 20000, pack: 'prime' });
  else if (review.promoted) pend(carState(), { kind: 'career', title: 'Promoted!', sub: 'Career crossover', apex: 10000, pack: 'gold' });
  else pend(carState(), { kind: 'career', title: `Season ${car.season} complete`, sub: 'Career crossover', apex: 3000 + Math.max(0, 10 - pos) * 400, pack: pos <= 4 ? 'gold' : 'silver' });
  car.review = review;
  return review;
}
const cupRoundReached = (car) => (car.cup ? car.cup.results.filter((r) => r.h === car.clubId || r.a === car.clubId).length : 0);

/** The other tier's finishing order, from squad strength with a little luck — it is not simulated week by week. */
export function syntheticOrder(car, league) {
  return leagueClubIds(car, league)
    .map((id) => [id, squadOverall(car.squads[id] || []) + (Math.random() - 0.5) * 6])
    .sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** Take a job after a sacking (or move on): squads stay, the seat changes. */
export function takeJob(car, clubId) {
  car.clubId = clubId;
  car.coins = Math.max(car.coins, 100_000_000);
  car.morale = 0.6;
  car.review = null;
  car.offers = [];
}

/* ------------------------------------------------------------------ *
 * Press conferences
 * ------------------------------------------------------------------ */
export const PRESS = [
  { q: 'That result — what did you make of it?', a: [
    ['We deserved more.', { morale: 0.04, board: -0.02, rep: 0 }], ['Credit to the players.', { morale: 0.06, board: 0.01, rep: 1 }], ['No comment.', { morale: -0.02, board: -0.03, rep: -1 }]] },
  { q: 'There is talk of pressure from the board.', a: [
    ['I only answer to results.', { morale: 0.02, board: 0.02, rep: 1 }], ['The board and I are aligned.', { morale: 0, board: 0.05, rep: 0 }], ['Ask them.', { morale: 0.01, board: -0.06, rep: 0 }]] },
  { q: 'Any transfer news you can share?', a: [
    ['We are always looking.', { morale: -0.02, board: 0.01, rep: 1 }], ['I trust this squad.', { morale: 0.06, board: 0, rep: 0 }], ['Next question.', { morale: 0, board: -0.02, rep: -1 }]] },
  { q: 'The fans want more from this team.', a: [
    ['So do I.', { morale: -0.03, board: 0.02, rep: 1 }], ['They will get it.', { morale: 0.04, board: 0.02, rep: 1 }], ['The fans should be patient.', { morale: 0.02, board: -0.03, rep: -1 }]] },
  { q: 'Your star man was quiet today.', a: [
    ['He will come good.', { morale: 0.05, board: 0, rep: 0 }], ['Nobody is guaranteed a place.', { morale: -0.05, board: 0.02, rep: 1 }], ['The whole team was quiet.', { morale: -0.02, board: -0.01, rep: 0 }]] },
];
export function pressQuestion(car) { return PRESS[(car.week + car.season) % PRESS.length]; }
export function answerPress(car, qi, ai) {
  const q = PRESS[qi]; const [, eff] = q.a[ai];
  car.morale = Math.max(0.05, Math.min(1, car.morale + eff.morale));
  car.pressMood = (car.pressMood || 0) + eff.board;
  car.stats.rep = Math.max(1, Math.min(99, car.stats.rep + eff.rep));
  car.pressDone = car.week;
}
