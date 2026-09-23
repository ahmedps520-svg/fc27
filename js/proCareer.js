/**
 * Player Career (v81): one footballer, from a seventeen-year-old at a
 * second-tier club to retirement and a legacy.
 *
 * The world is a full career world (career.js `newWorld`) run by the same
 * week engine as the Manager Career (`advanceCar(..., { pro: true })`) — the
 * same fixtures, cup, transfers, retirements, regens and awards — with the
 * manager's chair empty: the AI picks the team, and you are one row in it.
 *
 *   selection     the manager picks the eleven on rating and trust; trust
 *                 moves with your match ratings and your training
 *   matches       play them yourself with the camera and controls locked to
 *                 your player, or sim them; either way a rating out of ten
 *   growth        a training drill each week and match XP feed six
 *                 attributes, toward a hidden potential; age takes it back
 *   the agent     clubs come in during the windows (more if you ask to go);
 *                 moves happen in the summer. Loans when you are not playing.
 *   contracts     talks when a deal runs down: wage, years, a role
 *   milestones    debut, first goal, fifties and hundreds, caps, trophies
 *   country       a call-up when you are among your nation's best
 *   the end       retire from 33 (40 is the limit) and see your legacy
 */
import { getState, update } from './state.js';
import * as career from './career.js';
import * as v2 from './careerV2.js';
import * as v3 from './careerV3.js';
import { clamp, hashOf, rateOf, ageOf, addPerson } from './careerPeople.js';
import { simRating } from './game/ratings.js';
import { nations } from './world.js';

export const DRILLS = [
  { id: 'finishing', name: 'Finishing', stats: ['shooting'], blurb: 'Hit the target zone as the bar sweeps.' },
  { id: 'passing', name: 'Passing lanes', stats: ['passing'], blurb: 'Release on the open lane.' },
  { id: 'sprints', name: 'Sprints', stats: ['pace'], blurb: 'Time your burst off the line.' },
  { id: 'dribbling', name: 'Cone dribble', stats: ['dribbling'], blurb: 'Tap through the gates.' },
  { id: 'defending', name: 'Tackling', stats: ['defending'], blurb: 'Win the ball at the right moment.' },
  { id: 'gym', name: 'Gym', stats: ['physical'], blurb: 'Hold the lift in the zone.' },
];
export const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
const STATS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
const W = {
  GK: { defending: 0.5, physical: 0.2, pace: 0.1, passing: 0.2 },
  DEF: { defending: 0.4, physical: 0.25, pace: 0.15, passing: 0.15, dribbling: 0.05 },
  MID: { passing: 0.3, dribbling: 0.25, shooting: 0.15, pace: 0.1, physical: 0.1, defending: 0.1 },
  WIDE: { pace: 0.3, dribbling: 0.3, passing: 0.15, shooting: 0.15, physical: 0.1 },
  FWD: { shooting: 0.35, pace: 0.2, dribbling: 0.2, physical: 0.15, passing: 0.1 },
};
const groupOf = (pos) => (pos === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(pos) ? 'DEF' : ['LW', 'RW', 'LM', 'RM'].includes(pos) ? 'WIDE' : pos === 'ST' ? 'FWD' : 'MID');
/** Overall from the six, weighted by position. */
export function overallOf(stats, pos) {
  const w = W[groupOf(pos)];
  return Math.round(Object.entries(w).reduce((t, [k, v]) => t + stats[k] * v, 0));
}
const START_SHAPE = {
  GK: { defending: 60, physical: 58, pace: 45, passing: 52, shooting: 25, dribbling: 35 },
  DEF: { defending: 60, physical: 60, pace: 58, passing: 52, shooting: 38, dribbling: 48 },
  MID: { passing: 60, dribbling: 58, shooting: 52, pace: 58, physical: 52, defending: 48 },
  WIDE: { pace: 64, dribbling: 60, passing: 55, shooting: 52, physical: 48, defending: 38 },
  FWD: { shooting: 61, pace: 60, dribbling: 57, physical: 56, passing: 50, defending: 32 },
};

export const pro = () => getState().pro;
const W_OF = (p) => p.world;

/** Tier-two clubs to start at (and the weakest top-flight sides for a keeper of a name). */
export function startingClubs() {
  return v2.allClubs().filter((c) => c.tier === 2);
}

/** Create the footballer and his world. */
export function startPro({ name, nation, position, foot = 'R', look = {}, clubId }) {
  const club = v2.clubOf(clubId) || startingClubs()[0];
  const world = career.newWorld({ name: 'The gaffer', ai: true }, club.id);
  const g = groupOf(position);
  const noise = (k) => (hashOf(`${name}|${k}`) % 5) - 2;
  const stats = Object.fromEntries(STATS.map((k) => [k, START_SHAPE[g][k] + noise(k)]));
  const ovr = overallOf(stats, position);
  const pot = clamp(76 + (hashOf(`pot|${name}|${nation}`) % 17), 78, 93);
  const person = addPerson(world, name, { age: 17, base: ovr, pos: position, nation, pot, pro: true });
  person.stats = stats; person.foot = foot; person.pro = true;
  world.squads[club.id].push([name, position, nation, { years: 2, signed: 1, wage: 2000 }]);
  const p = {
    v: 1, name, nation, position, foot, look,
    world, xp: 0, attrXp: Object.fromEntries(STATS.map((k) => [k, 0])),
    trust: 0.3, status: 'prospect', form: [],
    season: blankSeason(), totals: { apps: 0, goals: 0, assists: 0, mins: 0, motm: 0, caps: 0, intlGoals: 0, ratingSum: 0 },
    clubs: [{ id: club.id, from: 1, apps: 0, goals: 0 }], trophies: [], milestones: [], history: [], offers: [], loan: null, pending: null,
    contract: { years: 2, wage: 2000, role: 'prospect' }, request: false, drillWeek: null, retired: false, peak: ovr, lastMatch: null,
  };
  update((s) => { s.pro = p; });
  milestone('Signed a first professional contract with ' + club.name);
  return getState().pro;
}
const blankSeason = () => ({ apps: 0, goals: 0, assists: 0, mins: 0, ratings: [], motm: 0 });

/** The pro's live numbers. */
export function me(p = pro()) {
  const w = W_OF(p);
  const person = w.people[p.name];
  return { name: p.name, position: person.pos, nation: p.nation, age: ageOf(w, p.name), overall: rateOf(w, p.name), stats: person.stats, potential: w.pot[p.name], club: v2.clubOf(w.clubId) };
}
export const potentialWord = (p = pro()) => {
  const pot = p.world.pot[p.name]; const r = rateOf(p.world, p.name);
  const room = pot - r;
  return room >= 15 ? 'Exceptional' : room >= 9 ? 'Very high' : room >= 4 ? 'High' : room > 0 ? 'Close to his peak' : 'At his peak';
};

/* ------------------------------ selection ------------------------------ */
/** Will the manager pick me this week? 'start' | 'bench' | 'out'. */
export function selection(p = pro()) {
  const w = W_OF(p);
  v2.useCar(w);
  const { xi, bench } = v3.pickXI(w);
  const mine = rateOf(w, p.name); const pos = w.people[p.name].pos;
  if (w.people[p.name].injured) return 'out';
  if (xi.includes(p.name)) {
    // the manager's doubts: a low-trust youngster can still be left out
    return p.trust < 0.2 && mine < ratingAt(w, xi, pos) + 2 ? 'bench' : 'start';
  }
  // trust can win a place the numbers alone would not
  const rival = ratingAt(w, xi, pos);
  if (rival && mine + (p.trust - 0.5) * 12 >= rival) return 'start';
  // the academy lad sits on the bench to learn; so does anyone the manager rates
  return bench.includes(p.name) || p.trust > 0.25 || ageOf(w, p.name) <= 21 ? 'bench' : 'out';
}
function ratingAt(w, xi, pos) {
  const g = groupOf(pos);
  const same = xi.filter((n) => groupOf(posOf(w, n)) === g || (g === 'WIDE' && ['MID', 'FWD'].includes(groupOf(posOf(w, n)))));
  return same.length ? Math.min(...same.map((n) => rateOf(w, n))) : 0;
}
const posOf = (w, n) => { for (const r of w.squads[w.clubId] || []) if (r[0] === n) return r[1]; return 'CM'; };

/** The XI actually fielded, with me in or out as selected. */
export function lineupFor(p = pro(), sel = selection(p)) {
  const w = W_OF(p);
  const { xi, bench } = v3.pickXI(w);
  let out = xi.slice();
  if (sel === 'start' && !out.includes(p.name)) {
    const g = groupOf(w.people[p.name].pos);
    let i = out.findIndex((n) => groupOf(posOf(w, n)) === g && n !== out[0]);
    if (i < 0) i = out.length - 1;
    out[i] = p.name;
  }
  if (sel !== 'start') out = out.filter((n) => n !== p.name);
  return { xi: out, bench: bench.filter((n) => !out.includes(n)) };
}

/* ------------------------------ training ------------------------------ */
/** A drill result 0–100. Once a week. */
export function trainDrill(drillId, score) {
  const d = DRILLS.find((x) => x.id === drillId); if (!d) return null;
  let out = null;
  update((s) => {
    const p = s.pro; const w = p.world;
    if (p.drillWeek === `${w.season}-${w.week}`) return;
    p.drillWeek = `${w.season}-${w.week}`;
    const sc = clamp(score, 0, 100);
    for (const k of d.stats) p.attrXp[k] += sc / 18;
    p.trust = clamp(p.trust + (sc - 55) / 1500, 0, 1);
    const grew = applyGrowth(p);
    out = { score: sc, grew };
  });
  return out;
}
/** Spend attribute XP: each point costs more the higher the stat and the nearer the ceiling. */
function applyGrowth(p) {
  const w = p.world; const person = w.people[p.name];
  const age = ageOf(w, p.name);
  const pot = w.pot[p.name];
  const grew = [];
  for (const k of STATS) {
    const cur = person.stats[k];
    const room = pot - overallOf(person.stats, person.pos);
    if (room < -1) break;                                  // past his ceiling: no more
    const cost = 4 + Math.max(0, cur - 50) / 7 + (room <= 0 ? 12 : room < 4 ? 4 : 0) + (age >= 29 ? 6 : 0);
    while (p.attrXp[k] >= cost && person.stats[k] < 99) { p.attrXp[k] -= cost; person.stats[k] += 1; grew.push(k); }
  }
  const before = person.base;
  person.base = overallOf(person.stats, person.pos);
  if (person.base > (p.peak || 0)) p.peak = person.base;
  if (person.base > before) news(p, `${p.name} moves up to ${person.base} overall.`);
  return grew;
}
/** Match XP to the attributes a position uses. */
function matchXp(p, rating, mins) {
  const person = p.world.people[p.name];
  const w = W[groupOf(person.pos)];
  const xp = Math.max(0, (rating - 4.5) * 3) * Math.min(1, mins / 90 + 0.2);
  for (const [k, v] of Object.entries(w)) p.attrXp[k] += xp * v * 1.2;
  p.xp += Math.round(xp * 10);
}
/** Age takes it back: from 30, a little every season, pace first. */
function ageDecline(p) {
  const w = p.world; const person = w.people[p.name]; const age = ageOf(w, p.name);
  if (age < 30) return;
  const loss = age >= 34 ? 3 : age >= 32 ? 2 : 1;
  person.stats.pace = Math.max(30, person.stats.pace - loss - 1);
  person.stats.physical = Math.max(30, person.stats.physical - loss);
  for (const k of ['dribbling', 'shooting']) if (Math.random() < 0.5) person.stats[k] = Math.max(30, person.stats[k] - 1);
  person.base = overallOf(person.stats, person.pos);
}

/* ------------------------------ the week ------------------------------ */
/**
 * Play the week. `played` is what a real match produced for me —
 * `{ score: [home, away], rating, goals, assists, mins, motm, possession }` —
 * or null to simulate my week.
 */
export function advancePro(played = null) {
  let res = null;
  update((s) => {
    const p = s.pro; if (!p || p.retired) return;
    const w = p.world;
    v2.useCar(w); v3.ensureV3(w);
    const fx = career.myFixture(w);
    const sel = selection(p);
    const lu = lineupFor(p, sel);
    let myLine = null; let score = null;
    if (fx) {
      if (played) score = played.score;
      else score = v2.simScoreV2(w, fx.home, fx.away);
      const [mg, tg] = fx.isHome ? score : [score[1], score[0]];
      if (played && sel !== 'out') myLine = { rating: played.rating, goals: played.goals, assists: played.assists, mins: played.mins, motm: !!played.motm };
      else if (sel !== 'out') {
        const mins = sel === 'start' ? (Math.random() < 0.8 ? 90 : 60 + Math.floor(Math.random() * 25)) : (Math.random() < 0.4 + p.trust * 0.4 ? 10 + Math.floor(Math.random() * 30) : 0);
        if (mins) {
          const share = shareOfGoals(p);
          let goals = 0; let assists = 0;
          for (let g = 0; g < mg; g++) { if (Math.random() < share * (mins / 90)) goals += 1; else if (Math.random() < share * 0.8 * (mins / 90)) assists += 1; }
          const rating = simRating({ pos: w.people[p.name].pos, won: mg > tg, lost: mg < tg, scored: mg, conceded: tg, goals, assists, form: avgForm(p) - 6.5 });
          myLine = { rating: Math.round((6 + (rating - 6) * Math.min(1, 0.4 + mins / 90)) * 10) / 10, goals, assists, mins, motm: rating >= 8.3 };
        }
      }
      const extra = { xi: lu.xi, subs: myLine && sel === 'bench' ? [p.name] : [], ratings: myLine ? { [p.name]: myLine.rating } : {}, goals: Array(myLine?.goals || 0).fill(p.name), assists: Array(myLine?.assists || 0).fill(p.name), possession: played?.possession ?? 50 };
      career.advanceCar(w, score, { extra, pro: true });
    } else {
      career.advanceCar(w, null, { pro: true });
    }
    if (myLine) recordLine(p, myLine, sel);
    // a week on the sidelines is not held against him; training still counts
    // season rolled over inside the engine?
    if (w.week === 1 && p.lastSeason !== w.season) seasonTurn(p);
    internationalBreak(p);
    agentWeek(p);
    res = { fx, sel, line: myLine, score };
    p.lastMatch = res;
  });
  return res;
}
const avgForm = (p) => (p.form.length ? p.form.reduce((a, b) => a + b, 0) / p.form.length : 6.5);
function shareOfGoals(p) {
  const pos = p.world.people[p.name].pos; const r = rateOf(p.world, p.name);
  const base = pos === 'ST' ? 0.34 : ['LW', 'RW', 'CAM'].includes(pos) ? 0.2 : ['CM', 'LM', 'RM'].includes(pos) ? 0.09 : pos === 'GK' ? 0 : 0.04;
  return base * (r / 75);
}
function recordLine(p, line, sel) {
  const s = p.season; const t = p.totals;
  const first = t.apps === 0;
  s.apps += 1; t.apps += 1; s.mins += line.mins; t.mins += line.mins;
  s.goals += line.goals; t.goals += line.goals; s.assists += line.assists; t.assists += line.assists;
  s.ratings.push(line.rating); t.ratingSum += line.rating;
  if (line.motm) { s.motm += 1; t.motm += 1; }
  p.form = [...p.form, line.rating].slice(-5);
  const club = p.clubs[p.clubs.length - 1]; club.apps += 1; club.goals += line.goals;
  p.trust = clamp(p.trust + (line.rating - 6.4) * 0.035 + (sel === 'start' ? 0.005 : 0), 0, 1);
  matchXp(p, line.rating, line.mins);
  applyGrowth(p);
  if (first) milestone(`Professional debut for ${v2.clubOf(p.world.clubId)?.name}`);
  if (line.goals && t.goals === line.goals) milestone('First professional goal');
  if (line.goals >= 3) milestone(`Hat-trick against ${oppName(p)}`);
  for (const n of [50, 100, 200, 300, 500]) if (t.apps === n) milestone(`${n} career appearances`);
  for (const n of [10, 25, 50, 100, 150, 200, 300]) if (t.goals >= n && t.goals - line.goals < n) milestone(`${n} career goals`);
  p.status = p.trust > 0.75 ? 'key' : p.trust > 0.5 ? 'starter' : p.trust > 0.3 ? 'rotation' : 'prospect';
}
const oppName = (p) => { const fx = p.lastMatch?.fx; if (!fx) return 'the opposition'; return v2.clubOf(fx.isHome ? fx.away : fx.home)?.name || 'the opposition'; };
function milestone(text) {
  update((s) => { const p = s.pro; if (!p) return; p.milestones = [...p.milestones, { season: p.world.season, week: p.world.week, text }].slice(-80); news(p, text); });
}
function news(p, text) { v3.news(p.world, text, 'pro'); }

/* ------------------------------ country ------------------------------ */
let bars = null;
/** The rating that gets you into your nation's squad: its 23rd best. */
export function callUpBar(nation) {
  if (!bars) bars = {};
  if (bars[nation] == null) {
    const n = nations().find((x) => x.nation === nation);
    const pool = n ? [...n.xi, ...n.bench] : [];
    const all = pool.map((q) => q.overall).sort((a, b) => b - a);
    bars[nation] = all.length >= 18 ? all[Math.min(all.length - 1, 22)] : 66;
  }
  return bars[nation];
}
function internationalBreak(p) {
  const w = p.world;
  if (w.week % 8 !== 0) return;
  const r = rateOf(w, p.name);
  const bar = callUpBar(p.nation);
  const inForm = avgForm(p) >= 6.7;
  if (!(r >= bar + 2 || (r >= bar - 1 && inForm))) return;
  const first = p.totals.caps === 0;
  p.totals.caps += 1;
  const g = Math.random() < shareOfGoals(p) * 1.3 ? 1 : 0;
  p.totals.intlGoals += g;
  if (first) milestone(`First senior call-up and cap for ${p.nation}`);
  else news(p, `${p.name} wins cap number ${p.totals.caps} for ${p.nation}${g ? ' — and scores' : ''}.`);
  for (const n of [25, 50, 100]) if (p.totals.caps === n) milestone(`${n} caps for ${p.nation}`);
}

/* ------------------------------ the agent ------------------------------ */
function agentWeek(p) {
  const w = p.world;
  if (!v2.inWindow(w.week, w.fixtures.length)) return;
  const r = rateOf(w, p.name);
  const chance = (p.request ? 0.55 : 0.2) + (avgForm(p) >= 7 ? 0.15 : 0);
  if (Math.random() > chance || p.offers.filter((o) => o.state === 'open').length >= 3) return;
  const here = v2.clubOf(w.clubId);
  const pool = v2.allClubs().filter((c) => c.id !== w.clubId && !p.offers.some((o) => o.club === c.id && o.state === 'open'))
    .map((c) => ({ c, avg: v2.squadOverall(w.squads[c.id] || [], w) }))
    .filter(({ avg }) => avg <= r + 5 && avg >= r - 6);
  if (!pool.length) return;
  const { c, avg } = pool[Math.floor(Math.random() * pool.length)];
  const role = r >= avg + 2 ? 'key' : r >= avg - 1 ? 'starter' : 'rotation';
  const wage = Math.round(Math.max(3000, (r - 50) ** 2.2 * 12) / 500) * 500;
  const loanable = ageOf(w, p.name) <= 21 && p.trust < 0.45 && c.tier >= (here?.tier || 1);
  const kind = loanable && Math.random() < 0.5 ? 'loan' : 'transfer';
  p.offers.push({ id: `${w.season}-${w.week}-${c.id}`, club: c.id, kind, role, wage, years: kind === 'loan' ? 1 : 2 + Math.floor(Math.random() * 3), state: 'open', week: w.week, season: w.season });
  news(p, `${kind === 'loan' ? 'Loan' : 'Transfer'} interest from ${c.name}.`);
}
/** Ask the agent to find a move (or stop looking). */
export function setTransferRequest(on) { update((s) => { if (s.pro) s.pro.request = !!on; if (s.pro && on) s.pro.trust = clamp(s.pro.trust - 0.1, 0, 1); }); }
/** Accept an offer: the move happens in the summer. Reject: it goes away. */
export function answerOffer(id, accept) {
  update((s) => {
    const p = s.pro; const o = p?.offers.find((x) => x.id === id);
    if (!o || o.state !== 'open') return;
    if (!accept) { o.state = 'rejected'; return; }
    for (const x of p.offers) if (x.state === 'open' && x !== o) x.state = 'lapsed';
    o.state = 'agreed';
    p.pending = { club: o.club, kind: o.kind, role: o.role, wage: o.wage, years: o.years };
    news(p, `Agreed: ${o.kind === 'loan' ? 'a season on loan at' : 'a move to'} ${v2.clubOf(o.club)?.name} in the summer.`);
  });
}

/* ------------------------------ contracts ------------------------------ */
/** What the club offers at renewal, and a push for more. */
export function renewalOffer(p = pro()) {
  const w = p.world; const r = rateOf(w, p.name);
  const base = Math.round(Math.max(3000, (r - 50) ** 2.2 * 12) / 500) * 500;
  return { wage: Math.round(base * (0.9 + p.trust * 0.3) / 500) * 500, years: r >= 80 ? 4 : 3, role: p.status };
}
export function negotiate(ask) {
  let out = null;
  update((s) => {
    const p = s.pro; if (!p?.talks) return;
    const off = renewalOffer(p);
    const tol = 1 + 0.12 + p.trust * 0.25;
    if (ask.wage <= off.wage * tol) {
      p.contract = { years: ask.years || off.years, wage: ask.wage, role: off.role };
      setRowContract(p, p.contract);
      p.talks = null;
      out = { ok: true, note: `Signed: ${p.contract.years} years at ${ask.wage.toLocaleString()} a week.` };
      news(p, `${p.name} signs a new ${p.contract.years}-year deal.`);
    } else {
      p.talks.rounds = (p.talks.rounds || 0) + 1;
      out = p.talks.rounds >= 3 ? { ok: false, note: 'The club will not go higher. Leave on a free, or take their offer.', final: true } : { ok: false, note: `Too much. They would stretch to about ${Math.round(off.wage * tol / 500) * 500}.` };
    }
  });
  return out;
}
export function leaveOnFree() {
  update((s) => {
    const p = s.pro; if (!p?.talks) return;
    p.talks = null;
    // the agent always finds somewhere: a club where he would play
    const w = p.world; const r = rateOf(w, p.name);
    const c = v2.allClubs().filter((x) => x.id !== w.clubId).map((x) => ({ x, avg: v2.squadOverall(w.squads[x.id] || [], w) }))
      .sort((a, b) => Math.abs(a.avg - (r - 1)) - Math.abs(b.avg - (r - 1)))[0].x;
    moveTo(p, c.id, { kind: 'transfer', wage: renewalOffer(p).wage, years: 2, role: 'starter' });
  });
}
function setRowContract(p, c) {
  const row = p.world.squads[p.world.clubId].find((r) => r[0] === p.name);
  if (row) row[3] = { years: c.years, signed: p.world.season, wage: c.wage };
}

/* ------------------------------ the summer ------------------------------ */
function seasonTurn(p) {
  const w = p.world;
  p.lastSeason = w.season;
  const last = w.world.awards[w.world.awards.length - 1];
  const prevSeason = w.season - 1;
  const avg = p.season.ratings.length ? p.season.ratings.reduce((a, b) => a + b, 0) / p.season.ratings.length : 0;
  // trophies won while I was there
  const champ = w.world.champions.find((c) => c.season === prevSeason && c.club === w.clubId);
  if (champ && p.season.apps >= 5) { p.trophies.push({ season: prevSeason, name: `${champ.league} title`, club: w.clubId }); milestone(`Won the ${champ.league}`); }
  const cup = w.world.cups.find((c) => c.season === prevSeason && c.club === w.clubId);
  if (cup && p.season.apps >= 3) { p.trophies.push({ season: prevSeason, name: 'Cup', club: w.clubId }); milestone('Won the Cup'); }
  if (last?.pots?.name === p.name) { p.trophies.push({ season: prevSeason, name: 'Player of the season', club: w.clubId }); milestone('Player of the season'); }
  if (last?.boot?.name === p.name) { p.trophies.push({ season: prevSeason, name: 'Golden boot', club: w.clubId }); milestone('Golden boot'); }
  if (last?.young?.name === p.name) { p.trophies.push({ season: prevSeason, name: 'Young player of the season', club: w.clubId }); milestone('Young player of the season'); }
  p.history.push({ season: prevSeason, club: w.clubId, age: ageOf(w, p.name) - 1, ovr: rateOf(w, p.name), ...p.season, avg: Math.round(avg * 100) / 100 });
  p.history = p.history.slice(-30);
  p.season = blankSeason();
  // the body
  ageDecline(p);
  // a move agreed in a window, or a loan coming home
  if (p.loan) {
    const back = p.loan.from;
    moveTo(p, back, { kind: 'return', wage: p.contract.wage, years: p.contract.years, role: p.status });
    p.loan = null;
  }
  if (p.pending) { moveTo(p, p.pending.club, p.pending); p.pending = null; }
  // the contract clock
  const row = w.squads[w.clubId].find((r) => r[0] === p.name);
  if (row) {
    p.contract.years = row[3].years;
    if (row[3].years <= 0) { row[3].years = 1; p.contract.years = 1; p.talks = { rounds: 0 }; news(p, 'Your contract is up. Time to talk.'); }
  }
  // the AI renews most of the rest of the dressing room; the others move on
  const mine = w.squads[w.clubId];
  for (let i = mine.length - 1; i >= 0; i--) {
    const r = mine[i]; if (r[0] === p.name || r[3].years > 0) continue;
    if (Math.random() < 0.7) r[3] = { ...r[3], years: 1 + Math.floor(Math.random() * 3), signed: w.season };
    else mine.splice(i, 1);
  }
  w.expiring = [];
  p.offers = p.offers.filter((o) => o.state === 'open' && o.season === w.season);
  if (ageOf(w, p.name) >= 40) retire('The body has decided.');
}

/** Move the pro to another club (a transfer, a loan, or a loan ending). */
function moveTo(p, clubId, { kind, wage, years, role }) {
  const w = p.world;
  const from = w.clubId;
  const rows = w.squads[from] || []; const i = rows.findIndex((r) => r[0] === p.name);
  const row = i >= 0 ? rows.splice(i, 1)[0] : [p.name, w.people[p.name].pos, p.nation, {}];
  row[3] = { years: kind === 'loan' ? (p.contract.years || 1) : years, signed: w.season, wage };
  (w.squads[clubId] = w.squads[clubId] || []).push(row);
  w.clubId = clubId;
  if (kind === 'loan') p.loan = { from, until: w.season };
  else if (kind !== 'return') p.contract = { years, wage, role };
  p.trust = role === 'key' ? 0.7 : role === 'starter' ? 0.55 : 0.4;
  p.status = role;
  if (kind !== 'return') p.clubs.push({ id: clubId, from: w.season, apps: 0, goals: 0, loan: kind === 'loan' });
  // the calendar and the table follow me to the new league
  const league = w.leagueOf[clubId];
  const ids = v2.leagueClubIds(w, league);
  if (!ids.every((id) => w.table[id]) || w.fixtures.length === 0) {
    w.table = Object.fromEntries(ids.map((id) => [id, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]));
    w.fixtures = v2.buildCalendar(w, league);
    w.week = 1;
  }
  v2.setBoardObjectives(w);
  p.lastSigning = { club: clubId, kind, season: w.season };
  if (kind !== 'return') news(p, `${p.name} joins ${v2.clubOf(clubId)?.name}${kind === 'loan' ? ' on loan' : ''}.`);
}

/* ------------------------------ the end ------------------------------ */
export const canRetire = (p = pro()) => ageOf(p.world, p.name) >= 33;
export function retire(why = 'On his own terms.') {
  update((s) => {
    const p = s.pro; if (!p || p.retired) return;
    p.retired = { season: p.world.season, age: ageOf(p.world, p.name), why };
    p.legacy = legacy(p);
  });
}
/** The legacy score and tier: apps, goals, trophies, caps, peak. */
export function legacy(p = pro()) {
  const t = p.totals;
  const trophies = p.trophies.length;
  const titles = p.trophies.filter((x) => /title|Cup/.test(x.name)).length;
  const awards = p.trophies.filter((x) => /Player|boot/.test(x.name)).length;
  const score = Math.round(t.apps * 0.4 + t.goals * 1.2 + t.assists * 0.6 + titles * 25 + awards * 30 + t.caps * 1.5 + t.intlGoals * 2 + Math.max(0, (p.peak || 60) - 70) * 6);
  const tier = score >= 900 ? 'Icon' : score >= 600 ? 'Legend' : score >= 380 ? 'Club great' : score >= 200 ? 'Fan favourite' : 'Journeyman';
  return { score, tier, trophies, titles, awards, peak: p.peak, apps: t.apps, goals: t.goals, assists: t.assists, caps: t.caps, intlGoals: t.intlGoals,
    avg: t.apps ? Math.round((t.ratingSum / t.apps) * 100) / 100 : 0, clubs: p.clubs.length };
}
export function endPro() { update((s) => { s.pro = null; }); }
