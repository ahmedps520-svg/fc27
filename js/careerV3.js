/**
 * Career V3 (v81) — the Manager Career's depth, and the living world both
 * careers share. Everything takes the career object (`car`) and mutates it;
 * callers do that inside `update`. Nothing here imports career.js.
 *
 * The manager's week:
 *   training      a schedule (light / balanced / intense) moves fitness and
 *                 sharpness; individual plans lean a player's growth toward an
 *                 attribute or retrain him for a new position
 *   playing time  every player has a squad role (crucial … prospect) and an
 *                 expectation of minutes that goes with it; falling short costs
 *                 morale, and an unhappy player asks to leave
 *   interactions  praise, criticism, a promise of games, a talk about form —
 *                 each lands according to the player's temperament; a broken
 *                 promise is remembered
 *   the media     stories about form, unrest and milestones move morale
 *   scouting      up to three scouts, each with a rating (1–5 stars, which is
 *                 how close their potential estimates are) and a region
 *   money         a finance hub: wage budget, tickets (the Stadium Builder's
 *                 seats), television, prize money, shirts, transfers, agent
 *                 fees, facilities; release and sell-on clauses
 *   facilities    training ground, academy, medical, scouting HQ: levels 1–5
 *   the board     five pillars — success, finance, youth, brand, style
 *
 * The world's season end:
 *   potential rises and falls with form and minutes; the old retire and are
 *   replaced by generated youngsters; AI clubs sack managers; champions,
 *   cup winners and awards are recorded; a news feed; and the save is pruned
 *   so a twentieth season costs what the first did.
 */
import { clamp, hashOf, rateOf, ageOf, potOf, valueIn, cardByName, newName, addPerson, nationForLeague } from './careerPeople.js';
import * as v2 from './careerV2.js';

export const ROLES = [
  { id: 'crucial', name: 'Crucial', share: 0.85 },
  { id: 'important', name: 'Important', share: 0.65 },
  { id: 'rotation', name: 'Rotation', share: 0.35 },
  { id: 'sporadic', name: 'Sporadic', share: 0.12 },
  { id: 'prospect', name: 'Prospect', share: 0.2 },
];
export const TRAINING = {
  light: { name: 'Light', fit: 0.06, sharp: -0.02, growth: 0.8, injury: 0.4 },
  balanced: { name: 'Balanced', fit: 0.02, sharp: 0.03, growth: 1, injury: 1 },
  intense: { name: 'Intense', fit: -0.05, sharp: 0.06, growth: 1.25, injury: 1.8 },
};
export const PLAN_FOCUS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
export const REGIONS = ['Europe', 'Middle East', 'South America', 'Africa', 'Youth (worldwide)'];
export const FACILITIES = [
  { id: 'training', name: 'Training ground', blurb: 'Faster growth for every player.' },
  { id: 'youth', name: 'Academy', blurb: 'Better prospects, more of them.' },
  { id: 'medical', name: 'Medical centre', blurb: 'Fitness comes back quicker.' },
  { id: 'scouting', name: 'Scouting HQ', blurb: 'Scouts report faster and closer to the truth.' },
];
export const facilityCost = (level) => 15_000_000 * level * level;
export const PILLARS = [
  { id: 'success', name: 'Success' }, { id: 'finance', name: 'Finance' }, { id: 'youth', name: 'Youth' },
  { id: 'brand', name: 'Brand' }, { id: 'style', name: 'Style of play' },
];

const LATIN = new Set(['Brazil', 'Argentina', 'Uruguay', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Paraguay', 'Venezuela', 'Mexico']);
const AFRICA = new Set(['Nigeria', 'Senegal', 'Ghana', 'Ivory Coast', 'Cameroon', 'Morocco', 'Egypt', 'Algeria', 'Tunisia', 'Mali', 'Guinea', 'DR Congo']);
const MIDEAST = new Set(['Saudi Arabia', 'Qatar', 'United Arab Emirates', 'Iraq', 'Iran', 'Jordan', 'Kuwait', 'Oman', 'Bahrain']);

/* ------------------------------------------------------------------ */
/** Bring any career object up to v81's shape. Idempotent. */
export function ensureV3(car) {
  if (!car) return car;
  car.people = car.people || {};
  car.pot = car.pot || {};
  car.pl = car.pl || {};
  car.training = car.training || 'balanced';
  car.plans = car.plans || {};
  car.scouts = car.scouts || [{ id: 's1', name: 'Head scout', rating: 2, region: null, weeks: 0, reports: [] }];
  car.loans = car.loans || [];
  car.clauses = car.clauses || {};
  car.sellOns = car.sellOns || {};
  car.fac = car.fac || { training: 1, youth: 1, medical: 1, scouting: 1 };
  car.fin = car.fin || { season: blankLedger(), history: [] };
  car.setPieces = car.setPieces || { pen: null, fk: null, corner: null };
  car.world = car.world || { managers: {}, champions: [], cups: [], awards: [], news: [], retired: 0, regens: 0 };
  car.scorers = car.scorers || {};
  car.styleLog = car.styleLog || { poss: 0, n: 0, goals: 0 };
  if (car.board && !car.board.pillars) car.board.pillars = pillarTargets(car);
  return car;
}
const blankLedger = () => ({ tickets: 0, tv: 0, prize: 0, merch: 0, sales: 0, buys: 0, wages: 0, facilities: 0, agents: 0 });

/** Book an income (+) or cost (−) in this season's ledger and the bank. */
export function book(car, kind, amount) {
  ensureV3(car);
  car.fin.season[kind] = (car.fin.season[kind] || 0) + Math.abs(amount);
  car.coins += amount;
}

/* ------------------------------ the squad ------------------------------ */
export function plOf(car, name) {
  const pl = car.pl[name] || (car.pl[name] = { morale: 0.65, fit: 0.9, sharp: 0.6, apps: 0, mins: 0, goals: 0, assists: 0, ratings: [], promise: null, broken: 0, request: false });
  return pl;
}
const rowsOf = (car) => car.squads[car.clubId] || [];

/** Squad roles by standing in the dressing room: rating, then age for the young. */
export function hierarchy(car) {
  const all = rowsOf(car).map((r) => ({ name: r[0], pos: r[1], rating: rateOf(car, r[0]), age: ageOf(car, r[0]) })).sort((a, b) => b.rating - a.rating);
  const out = {};
  // one keeper plays: the first choice is ranked with everyone, the rest are cover
  const keepers = all.filter((r) => r.pos === 'GK');
  const outfield = all.filter((r) => r.pos !== 'GK');
  outfield.forEach((r, i) => {
    out[r.name] = i < 3 ? 'crucial' : i < 10 ? 'important' : r.age <= 20 ? 'prospect' : i < 15 ? 'rotation' : 'sporadic';
  });
  keepers.forEach((r, i) => {
    const better = outfield.filter((o) => o.rating > r.rating).length;
    out[r.name] = i === 0 ? (better < 3 ? 'crucial' : 'important') : r.age <= 20 ? 'prospect' : 'sporadic';
  });
  return out;
}
export const roleById = (id) => ROLES.find((r) => r.id === id) || ROLES[2];

/** The eleven the manager would pick: best by rating × fitness, a keeper in goal. */
export function pickXI(car, clubId = car.clubId) {
  const G = { GK: 'GK', CB: 'DF', LB: 'DF', RB: 'DF', CDM: 'MF', CM: 'MF', CAM: 'MF', LM: 'MF', RM: 'MF', LW: 'FW', RW: 'FW', ST: 'FW' };
  const want = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW'];
  const mine = clubId === car.clubId;
  const posOf = (r) => (mine && car.plans[r[0]]?.to && car.plans[r[0]].done ? car.plans[r[0]].to : r[1]);
  const rest = (car.squads[clubId] || []).map((r) => ({ name: r[0], pos: posOf(r), score: rateOf(car, r[0]) * (mine ? 0.75 + 0.25 * plOf(car, r[0]).fit : 1) - (mine && plOf(car, r[0]).injured ? 100 : 0) }))
    .sort((a, b) => b.score - a.score);
  const xi = [];
  for (const g of want) {
    const i = rest.findIndex((p) => G[p.pos] === g);
    xi.push(i >= 0 ? rest.splice(i, 1)[0] : rest.shift());
  }
  return { xi: xi.filter(Boolean).map((p) => p.name), bench: rest.slice(0, 7).map((p) => p.name) };
}

/* ------------------------------ the week ------------------------------ */
/** Training, fitness, plans, playing-time expectations, promises, the media. Weekly. */
export function weekV3(car, { pro = false } = {}) {
  ensureV3(car);
  const tr = TRAINING[car.training] || TRAINING.balanced;
  const med = car.fac.medical;
  const roles = hierarchy(car);
  for (const r of rowsOf(car)) {
    const name = r[0]; const pl = plOf(car, name);
    pl.fit = clamp(pl.fit + tr.fit + 0.02 * med, 0.35, 1);
    pl.sharp = clamp(pl.sharp + tr.sharp, 0.2, 1);
    if (pl.injured) { pl.injured -= 1; if (pl.injured <= 0) pl.injured = 0; }
    else if (Math.random() < 0.004 * tr.injury * (1.2 - med * 0.12)) pl.injured = 1 + Math.floor(Math.random() * 4);
    // an individual plan
    const plan = car.plans[name];
    if (plan && !plan.done) {
      plan.weeks += 1;
      if (plan.to && plan.weeks >= 8) { plan.done = true; r[1] = plan.to; news(car, `${name} has retrained as a ${plan.to}.`, 'squad'); }
      if (plan.focus && plan.weeks % 6 === 0) { car.dev[name] = (car.dev[name] | 0) + (Math.random() < 0.35 * tr.growth ? 1 : 0); }
    }
    // playing time against the role
    const role = roleById(roles[name]);
    const share = pl.apps ? pl.mins / Math.max(1, (car.week || 1) * 90) : 0;
    if (car.week > 6 && share < role.share - 0.3) pl.morale = clamp(pl.morale - 0.03, 0, 1);
    else if (share >= role.share) pl.morale = clamp(pl.morale + 0.01, 0, 1);
    // promises
    if (pl.promise && car.week >= pl.promise.by) {
      if (pl.apps - pl.promise.from >= pl.promise.need) { pl.morale = clamp(pl.morale + 0.1, 0, 1); news(car, `${name} got the games he was promised.`, 'squad'); }
      else { pl.morale = clamp(pl.morale - 0.3, 0, 1); pl.broken += 1; news(car, `${name} feels let down: the promised games never came.`, 'squad'); }
      pl.promise = null;
    }
    if (pl.morale < 0.25 && !pl.request) { pl.request = true; news(car, `${name} has handed in a transfer request.`, 'squad'); }
  }
  if (pro) return;                 // a pro's world: the dressing room only, no money or media to run
  // the media: one story a week, sometimes
  if (Math.random() < 0.3) mediaStory(car, roles);
  // scouts
  for (const s of car.scouts) scoutWeek(car, s);
  // wages and the steady incomes
  const wages = weeklyWages(car);
  book(car, 'wages', -wages);
  const tier = v2.clubOf(car.clubId)?.tier || 1;
  const rep = car.stats?.rep ?? 50;
  book(car, 'tv', (tier === 1 ? 2_600_000 : 700_000) + rep * 25_000);
  book(car, 'merch', Math.round(rep * rep * 450));
  book(car, 'facilities', -Object.values(car.fac).reduce((t, l) => t + l * 120_000, 0));
}
export function weeklyWages(car) {
  return rowsOf(car).reduce((t, r) => t + wageOf(car, r[0]), 0);
}
export const wageOf = (car, name) => Math.max(4000, Math.round(valueIn(car, name) / 250 / 1000) * 1000);
/** What the board lets you spend on wages a week: a share of last season's income, or the current bill with headroom. */
export function wageBudget(car) {
  const last = car.fin?.history?.[car.fin.history.length - 1];
  const income = last ? (last.tickets + last.tv + last.prize + last.merch) : 0;
  const weeks = car.fixtures?.length || 40;
  return Math.max(Math.round(weeklyWages(car) * 1.1), Math.round(income * 0.7 / weeks));
}

function mediaStory(car, roles) {
  const rows = rowsOf(car); if (!rows.length) return;
  const r = rows[Math.floor(Math.random() * rows.length)]; const name = r[0]; const pl = plOf(car, name);
  const avg = avgRating(pl);
  if (avg >= 7.3) { pl.morale = clamp(pl.morale + 0.05, 0, 1); news(car, `The papers can't get enough of ${name}: ${avg.toFixed(1)} a match lately.`, 'media'); }
  else if (avg && avg < 6.0) { pl.morale = clamp(pl.morale - 0.04, 0, 1); news(car, `Pundits question ${name}'s place after a poor run.`, 'media'); }
  else if (pl.morale < 0.4 && roles[name] !== 'sporadic') news(car, `Word from the training ground: ${name} is unsettled.`, 'media');
}
export const avgRating = (pl) => (pl.ratings.length ? pl.ratings.reduce((a, b) => a + b, 0) / pl.ratings.length : 0);

/* ------------------------------ interactions ------------------------------ */
const persona = (name) => { const h = hashOf(name); return { temper: ((h >>> 9) % 100) / 100, prof: 0.35 + ((h >>> 3) % 100) / 150 }; };
export const TALKS = [
  { id: 'praise', name: 'Praise his form' },
  { id: 'criticise', name: 'Demand more' },
  { id: 'promise', name: 'Promise him games' },
  { id: 'form', name: 'Discuss his form' },
];
export function talk(car, name, kind) {
  ensureV3(car);
  const pl = plOf(car, name); const p = persona(name); const avg = avgRating(pl);
  if (pl.talkedWeek === `${car.season}-${car.week}`) return { ok: false, note: 'You have already spoken to him this week.' };
  pl.talkedWeek = `${car.season}-${car.week}`;
  let d = 0; let note = '';
  if (kind === 'praise') { d = avg >= 6.8 || !avg ? 0.08 : -0.03; note = d > 0 ? 'He appreciated that.' : 'He knows he has not earned it — it rang hollow.'; }
  else if (kind === 'criticise') { const lands = Math.random() < p.prof; d = lands ? 0.03 : -0.08 - p.temper * 0.08; if (lands) pl.boost = 3; note = lands ? 'He took it on board and wants to prove you wrong.' : 'He did not take it well.'; }
  else if (kind === 'promise') {
    if (pl.promise) return { ok: false, note: 'He is still waiting on the last promise.' };
    pl.promise = { need: 4, by: Math.min((car.fixtures?.length || 38), car.week + 8), from: pl.apps };
    d = 0.12; note = 'Four games in the next eight weeks. He will hold you to it.';
  } else { d = avg >= 7 ? 0.04 : avg && avg < 6.2 ? (Math.random() < 0.5 ? 0.02 : -0.03) : 0.01; note = avg ? `His average is ${avg.toFixed(1)}. ${avg >= 7 ? 'He knows he is flying.' : avg < 6.2 ? 'He accepts there is work to do.' : 'Steady, he says.'}` : 'Nothing to go on yet.'; }
  pl.morale = clamp(pl.morale + d, 0, 1);
  if (pl.morale >= 0.45 && pl.request && kind !== 'criticise') { pl.request = false; note += ' He has withdrawn his transfer request.'; }
  return { ok: true, note, delta: d };
}

/* ------------------------------ plans ------------------------------ */
export function setPlan(car, name, { focus = null, to = null } = {}) {
  ensureV3(car);
  if (!focus && !to) { delete car.plans[name]; return; }
  car.plans[name] = { focus, to, weeks: 0, done: false };
}

/* ------------------------------ scouting ------------------------------ */
export function hireScout(car) {
  ensureV3(car);
  if (car.scouts.length >= 3) return { ok: false, note: 'Three scouts is the budget.' };
  const rating = 1 + Math.floor(Math.random() * 5);
  const fee = rating * 2_000_000;
  if (car.coins < fee) return { ok: false, note: 'Not enough in the bank.' };
  book(car, 'facilities', -fee);
  const id = `s${Date.now() % 1e6}${car.scouts.length}`;
  const names = ['Ruiz', 'Okafor', 'Haddad', 'Lindqvist', 'Moreau', 'Baptista', 'Kowalski', 'Al-Rashid', 'Tanaka', 'Quinn'];
  car.scouts.push({ id, name: `${names[hashOf(id) % names.length]} (scout)`, rating, region: null, weeks: 0, reports: [] });
  return { ok: true, note: `Hired a ${rating}★ scout for ${Math.round(fee / 1e6)}M.` };
}
export function fireScout(car, id) { car.scouts = car.scouts.filter((s) => s.id !== id); }
export function assignScout(car, id, region) {
  const s = car.scouts.find((x) => x.id === id); if (!s) return;
  s.region = region; s.weeks = 0;
}
function inRegion(car, name, region) {
  const nat = cardByName(name)?.nation || car.people?.[name]?.nation;
  if (region === 'Youth (worldwide)') return ageOf(car, name) <= 20;
  if (region === 'Middle East') return MIDEAST.has(nat);
  if (region === 'South America') return LATIN.has(nat);
  if (region === 'Africa') return AFRICA.has(nat);
  return !MIDEAST.has(nat) && !LATIN.has(nat) && !AFRICA.has(nat);
}
function scoutWeek(car, s) {
  if (!s.region) return;
  s.weeks += 1;
  const need = Math.max(2, 6 - Math.floor((s.rating + car.fac.scouting) / 2));
  if (s.weeks < need) return;
  s.weeks = 0;
  const pool = [];
  for (const [cid, rows] of Object.entries(car.squads)) {
    if (cid === car.clubId) continue;
    for (const r of rows) if (inRegion(car, r[0], s.region)) pool.push([cid, r]);
  }
  if (!pool.length) return;
  const score = ([, r]) => potOf(car, r[0]) + (27 - ageOf(car, r[0])) * 0.5 + Math.random() * 6;
  pool.sort((a, b) => score(b) - score(a));
  const [cid, r] = pool[Math.floor(Math.random() * Math.min(12, pool.length))];
  const truth = potOf(car, r[0]);
  const err = (6 - s.rating - (car.fac.scouting - 1) * 0.5) * 2;
  const shown = clamp(Math.round(truth + (Math.random() - 0.5) * 2 * err), rateOf(car, r[0]), 97);
  s.reports = [{ name: r[0], position: r[1], club: cid, age: ageOf(car, r[0]), rating: rateOf(car, r[0]), potential: shown, range: Math.round(err), value: valueIn(car, r[0]), week: car.week, season: car.season }, ...s.reports].slice(0, 6);
}

/* ------------------------------ loans ------------------------------ */
/** Send one of my players out on loan to a club (for the rest of the season). */
export function loanOut(car, name, toId) {
  ensureV3(car);
  const rows = rowsOf(car); const i = rows.findIndex((r) => r[0] === name);
  if (i < 0 || !car.squads[toId]) return { ok: false, note: 'Cannot loan him there.' };
  const row = rows.splice(i, 1)[0];
  car.squads[toId].push(row);
  car.loans.push({ name, from: car.clubId, to: toId, out: true, season: car.season, gap: squadRank(car, toId, name) });
  news(car, `${name} joins ${v2.clubOf(toId)?.name} on loan for the rest of the season.`, 'transfer');
  return { ok: true, note: `${name} is off to ${v2.clubOf(toId)?.name}. He comes back in the summer.` };
}
/** Borrow an AI club's player until the summer, paying half his wages. */
export function loanIn(car, name, fromId) {
  ensureV3(car);
  const rows = car.squads[fromId] || []; const i = rows.findIndex((r) => r[0] === name);
  if (i < 0) return { ok: false, note: 'He is not there.' };
  if (rateOf(car, name) > squadAvg(car, fromId) + 2) return { ok: false, note: `${v2.clubOf(fromId)?.short} will not loan a first-teamer.` };
  const fee = Math.round(valueIn(car, name) * 0.08 / 1e5) * 1e5;
  if (car.coins < fee) return { ok: false, note: 'Not enough for the loan fee.' };
  book(car, 'buys', -fee);
  const row = rows.splice(i, 1)[0];
  rowsOf(car).push(row);
  car.loans.push({ name, from: fromId, to: car.clubId, out: false, season: car.season });
  news(car, `${name} arrives on loan from ${v2.clubOf(fromId)?.name}.`, 'transfer');
  return { ok: true, note: `${name} is yours until the summer.` };
}
const squadAvg = (car, cid) => v2.squadOverall(car.squads[cid] || [], car);
/** Where a player would rank in a squad: 0 = the best man there. */
function squadRank(car, cid, name) {
  const me = rateOf(car, name);
  return (car.squads[cid] || []).filter((r) => rateOf(car, r[0]) > me).length;
}
function returnLoans(car) {
  for (const l of car.loans) {
    const holder = l.out ? l.to : car.clubId;
    const rows = car.squads[holder] || []; const i = rows.findIndex((r) => r[0] === l.name);
    if (i < 0) continue;
    const row = rows.splice(i, 1)[0];
    (car.squads[l.from] = car.squads[l.from] || []).push(row);
    if (l.out) {
      // games at the loan club grow him: a regular starter (rank < 11) gets most
      const played = l.gap < 11;
      if (played && ageOf(car, l.name) <= 24) { car.dev[l.name] = (car.dev[l.name] | 0) + 1 + (Math.random() < 0.5 ? 1 : 0); car.pot[l.name] = (car.pot[l.name] ?? potOf(car, l.name)) + 1; }
      news(car, `${l.name} is back from his loan${played ? ', a better player for it' : ' having barely played'}.`, 'transfer');
    }
  }
  car.loans = [];
}

/* ------------------------------ clauses ------------------------------ */
/** Agent's cut on a signing, paid on top of the fee. */
export const agentFee = (fee) => Math.round(fee * 0.07 / 1e5) * 1e5;
export function setClauses(car, name, { release = null, sellOn = null } = {}) {
  ensureV3(car);
  car.clauses[name] = { ...(car.clauses[name] || {}), ...(release != null ? { release } : {}), ...(sellOn != null ? { sellOn } : {}) };
}
/** A release clause met by a bid: the player goes, no say. Returns true when it fired. */
export function checkRelease(car, offer) {
  const c = car.clauses?.[offer.player];
  if (!c?.release || offer.fee < c.release) return false;
  const rows = rowsOf(car); const i = rows.findIndex((r) => r[0] === offer.player);
  if (i < 0) return false;
  const row = rows.splice(i, 1)[0];
  (car.squads[offer.from] = car.squads[offer.from] || []).push(row);
  book(car, 'sales', c.release);
  offer.state = 'done';
  news(car, `${v2.clubOf(offer.from)?.name} trigger ${offer.player}'s release clause.`, 'transfer');
  return true;
}
/** Sold with a sell-on: remember who has him and what we are owed on his next move. */
export function noteSellOn(car, name, pct, buyer) { ensureV3(car); car.sellOns[name] = { pct, club: buyer }; }
/** An AI transfer happened: pay out any sell-on we hold. */
export function onAiTransfer(car, deal) {
  const so = car.sellOns?.[deal.player];
  if (!so || so.club !== deal.from) return;
  const cut = Math.round(deal.fee * so.pct / 100 / 1e5) * 1e5;
  book(car, 'sales', cut);
  news(car, `Sell-on clause: ${deal.player}'s move to ${v2.clubOf(deal.to)?.short} earns us ${Math.round(cut / 1e6)}M.`, 'transfer');
  delete car.sellOns[deal.player];
}

/* ------------------------------ facilities ------------------------------ */
export function upgradeFacility(car, id) {
  ensureV3(car);
  const lv = car.fac[id]; if (!lv || lv >= 5) return { ok: false, note: 'Already at the top level.' };
  const cost = facilityCost(lv);
  if (car.coins < cost) return { ok: false, note: 'Not enough in the bank.' };
  book(car, 'facilities', -cost);
  car.fac[id] = lv + 1;
  return { ok: true, note: `${FACILITIES.find((f) => f.id === id).name} is now level ${lv + 1}.` };
}

/* ------------------------------ matches ------------------------------ */
/**
 * My match is over. `ratings` maps name → rating for everyone who played
 * (from a real match or `simRatingsFor`), `scorers` names, and possession.
 */
export function recordMatch(car, { xi, bench = [], subs = [], ratings = {}, goals = [], assists = [], possession = 50, scored = 0 }) {
  ensureV3(car);
  for (const n of xi) { const pl = plOf(car, n); pl.apps += 1; pl.mins += 90; pl.fit = clamp(pl.fit - 0.08, 0.35, 1); pl.sharp = clamp(pl.sharp + 0.05, 0, 1); }
  for (const n of subs) { const pl = plOf(car, n); pl.apps += 1; pl.mins += 25; }
  for (const [n, r] of Object.entries(ratings)) { const pl = plOf(car, n); pl.ratings = [...pl.ratings, r].slice(-8); pl.last = r; }
  for (const n of goals) { plOf(car, n).goals += 1; car.scorers[n] = (car.scorers[n] || 0) + 1; milestone(car, n, 'goals'); }
  for (const n of assists) plOf(car, n).assists += 1;
  for (const n of xi) milestone(car, n, 'apps');
  car.styleLog.poss += possession; car.styleLog.n += 1; car.styleLog.goals += scored;
}
function milestone(car, name, kind) {
  const pl = plOf(car, name); const v = kind === 'goals' ? pl.goals : pl.apps;
  if ((kind === 'apps' && [50, 100, 200].includes(v)) || (kind === 'goals' && [10, 25, 50, 100].includes(v))) news(car, `${name} reaches ${v} ${kind === 'goals' ? 'goals' : 'appearances'} for the club.`, 'milestone');
}
/** Ratings and scorers for my eleven when a match is simulated. */
export function simMatchFor(car, xi, myGoals, theirGoals) {
  const ratings = {}; const goals = []; const assists = [];
  if (!xi.length) return { ratings, goals, assists };
  const w = xi.map((n) => ({ n, w: shootWeight(car, n) }));
  const tot = w.reduce((t, x) => t + x.w, 0);
  const pick = (skip) => { let r = Math.random() * tot; for (const x of w) { r -= x.w; if (r <= 0 && x.n !== skip) return x.n; } return w[w.length - 1].n; };
  for (let g = 0; g < myGoals; g++) { const s = pick(); goals.push(s); if (Math.random() < 0.7) assists.push(pick(s)); }
  for (const n of xi) {
    const pos = posOfName(car, n);
    const gs = goals.filter((x) => x === n).length; const as = assists.filter((x) => x === n).length;
    let r = 6.2 + (Math.random() - 0.5) * 1.2 + (avgRating(plOf(car, n)) ? (avgRating(plOf(car, n)) - 6.5) * 0.3 : 0);
    r += gs * 1.0 + as * 0.7 + (myGoals > theirGoals ? 0.4 : myGoals < theirGoals ? -0.35 : 0);
    if (pos === 'GK' || ['CB', 'LB', 'RB'].includes(pos)) r += theirGoals === 0 ? 0.6 : -0.25 * theirGoals;
    ratings[n] = Math.round(clamp(r, 3, 10) * 10) / 10;
  }
  return { ratings, goals, assists };
}
const posOfName = (car, n) => { for (const rows of Object.values(car.squads)) for (const r of rows) if (r[0] === n) return r[1]; return car.people?.[n]?.pos || 'CM'; };
function shootWeight(car, n) {
  const pos = posOfName(car, n);
  const base = pos === 'ST' ? 5 : ['LW', 'RW', 'CAM'].includes(pos) ? 3 : ['CM', 'LM', 'RM'].includes(pos) ? 1.5 : pos === 'GK' ? 0.02 : 0.6;
  return base * (rateOf(car, n) / 75);
}
/** Goals for AI-vs-AI results, for the golden boot. */
export function tallySimGoals(car, clubId, goals) {
  const { xi } = pickXI(car, clubId);
  if (!xi.length) return;
  const w = xi.map((n) => ({ n, w: shootWeight(car, n) })); const tot = w.reduce((t, x) => t + x.w, 0);
  for (let g = 0; g < goals; g++) { let r = Math.random() * tot; for (const x of w) { r -= x.w; if (r <= 0) { car.scorers[x.n] = (car.scorers[x.n] || 0) + 1; break; } } }
}

/* ------------------------------ the board ------------------------------ */
export function pillarTargets(car) {
  const rep = car.stats?.rep ?? 50;
  return {
    success: { text: car.board?.text || 'Meet the league target.' },
    finance: { text: 'Finish the season with money in the bank — no worse than 10% down.', start: car.coins },
    youth: { text: 'Give academy players (21 and under) at least 20 appearances between them.', need: 20 },
    brand: { text: `Grow the club's reputation past ${Math.min(99, rep + 3)}.`, need: Math.min(99, rep + 3) },
    style: { text: rep >= 60 ? 'Control matches: 52% possession on average.' : 'Be dangerous: score 1.3 a game.', poss: rep >= 60 ? 52 : null, gpg: rep >= 60 ? null : 1.3 },
  };
}
/** Score the five pillars 0–100 (season end or live). */
export function pillarScores(car, pos = null) {
  ensureV3(car);
  const t = car.board?.pillars || pillarTargets(car);
  const finish = car.board?.finish || 10;
  const p = pos ?? (v2.leagueClubIds(car, car.leagueOf?.[car.clubId]).length ? null : null);
  const success = pos == null ? 50 : clamp(100 - (pos - finish) * 18, 0, 100);
  const finance = clamp(50 + ((car.coins - (t.finance.start ?? car.coins)) / Math.max(1, t.finance.start || 1)) * 500, 0, 100);
  const youthApps = rowsOf(car).filter((r) => ageOf(car, r[0]) <= 21).reduce((s, r) => s + plOf(car, r[0]).apps, 0);
  const youth = clamp((youthApps / (t.youth.need || 20)) * 100, 0, 100);
  const brand = clamp(50 + ((car.stats?.rep ?? 50) - (t.brand.need - 3)) * 12, 0, 100);
  const sl = car.styleLog || { n: 0 };
  const style = !sl.n ? 50 : t.style.poss ? clamp(50 + (sl.poss / sl.n - t.style.poss) * 6, 0, 100) : clamp(50 + (sl.goals / sl.n - t.style.gpg) * 80, 0, 100);
  void p;
  return { success, finance, youth, brand, style, overall: Math.round((success * 2 + finance + youth + brand + style) / 6) };
}

/* ------------------------------ youth tournament ------------------------------ */
export function youthTournament(car) {
  ensureV3(car);
  const kids = [...(car.youth || []).map((y) => y.rating), ...rowsOf(car).filter((r) => ageOf(car, r[0]) <= 19).map((r) => rateOf(car, r[0]))];
  const strength = (kids.length ? kids.reduce((a, b) => a + b, 0) / kids.length : 55) + car.fac.youth * 2;
  let round = 0; const ROUNDS = ['group stage', 'quarter-final', 'semi-final', 'final'];
  while (round < 4 && Math.random() < clamp((strength - 50) / 30, 0.2, 0.85)) round += 1;
  const won = round >= 4;
  const reached = won ? 'won it' : `went out in the ${ROUNDS[Math.min(3, round)]}`;
  if (won) { book(car, 'prize', 3_000_000); (car.youth = car.youth || []).push(youthProspect(car, 8)); }
  news(car, `Youth tournament: the academy ${reached}.`, 'youth');
  car.youthCup = { season: car.season, round, won };
  return car.youthCup;
}
/** A generated academy prospect: better with a better academy. */
export function youthProspect(car, bonus = 0) {
  const nation = nationForLeague(car.leagueOf?.[car.clubId]);
  const name = newName(car, nation);
  const pos = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'ST'][Math.floor(Math.random() * 13)];
  const base = 48 + Math.floor(Math.random() * 8) + car.fac.youth;
  const pot = clamp(66 + Math.floor(Math.random() * 16) + car.fac.youth * 2 + bonus, base + 5, 94);
  addPerson(car, name, { age: 16 + Math.floor(Math.random() * 2), base, pos, nation, pot });
  return { name, position: pos, nation, age: ageOf(car, name), rating: base, potential: pot, weeks: 0, regen: true };
}

/* ------------------------------ season end: the world ------------------------------ */
export function seasonEndV3(car, table) {
  ensureV3(car);
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  // prize money and the ledger
  const n = table.length || 20;
  const tier = v2.clubOf(car.clubId)?.tier || 1;
  book(car, 'prize', Math.max(0, (n - pos + 1)) * (tier === 1 ? 2_500_000 : 700_000));
  const pillars = pillarScores(car, pos);
  car.lastPillars = pillars;
  if (car.board) car.board.patience = clamp(car.board.patience + (pillars.overall - 50) / 250, 0, 1);
  car.fin.history = [...car.fin.history, { season: car.season, ...car.fin.season, end: car.coins }].slice(-20);
  youthTournament(car);
  awards(car, table);
  retirementsAndRegens(car);
  aiManagers(car, table);
  potentialShift(car);
  returnLoans(car);
  squadFloor(car);
  car.freeAgents = [];                                   // whoever is left drifts out of the game
  prune(car);
}

/** Never fewer than sixteen: the academy makes up the numbers, with a keeper among them. */
export const SQUAD_FLOOR = 16;
export function squadFloor(car) {
  const rows = rowsOf(car);
  let added = 0;
  const hasGK = () => rows.filter((r) => r[1] === 'GK').length >= 2;
  while (rows.length < SQUAD_FLOOR || !hasGK()) {
    const y = (car.youth || []).shift() || youthProspect(car);
    if (!car.people?.[y.name]) addPerson(car, y.name, { age: y.age, base: y.rating, pos: y.position, nation: y.nation, pot: y.potential });
    const pos = !hasGK() ? 'GK' : y.position;
    if (car.people[y.name]) car.people[y.name].pos = pos;
    rows.push([y.name, pos, y.nation, { years: 3, signed: car.season + 1, youth: true }]);
    added += 1;
    if (added > 20) break;
  }
  if (added) news(car, `${added} academy player${added > 1 ? 's' : ''} step${added > 1 ? '' : 's'} up to make up the first-team numbers.`, 'youth');
  return added;
}
/** Called after the new season has begun (fresh table, fresh board). */
export function seasonStartV3(car) {
  ensureV3(car);
  car.fin.season = blankLedger();
  car.scorers = {};
  car.styleLog = { poss: 0, n: 0, goals: 0 };
  for (const pl of Object.values(car.pl)) { pl.apps = 0; pl.mins = 0; pl.goals = 0; pl.assists = 0; pl.fit = Math.max(pl.fit, 0.9); }
  if (car.board) car.board.pillars = pillarTargets(car);
}

function awards(car, table) {
  const league = car.leagueOf?.[car.clubId];
  const ids = new Set(table.map((r) => r.id));
  const inLeague = [];
  for (const id of ids) for (const r of car.squads[id] || []) inLeague.push({ name: r[0], club: id });
  const boot = Object.entries(car.scorers).filter(([nm]) => inLeague.some((x) => x.name === nm)).sort((a, b) => b[1] - a[1])[0];
  const clubPos = Object.fromEntries(table.map((r, i) => [r.id, i + 1]));
  const score = (x) => rateOf(car, x.name) + (car.scorers[x.name] || 0) * 0.35 - (clubPos[x.club] - 1) * 0.25 + (x.club === car.clubId ? avgRating(plOf(car, x.name)) - 6.5 : 0);
  const pots = inLeague.slice().sort((a, b) => score(b) - score(a))[0];
  const young = inLeague.filter((x) => ageOf(car, x.name) <= 21).sort((a, b) => score(b) - score(a))[0];
  const champ = table[0]?.id;
  const a = { season: car.season, league, champion: champ, pots: pots && { name: pots.name, club: pots.club }, boot: boot && { name: boot[0], goals: boot[1], club: inLeague.find((x) => x.name === boot[0])?.club }, young: young && { name: young.name, club: young.club }, manager: champ === car.clubId ? car.manager?.name : managerOf(car, champ) };
  car.world.awards = [...car.world.awards, a].slice(-20);
  car.world.champions = [...car.world.champions, { season: car.season, league, club: champ }].slice(-60);
  if (car.cup?.winner) car.world.cups = [...car.world.cups, { season: car.season, club: car.cup.winner }].slice(-20);
  news(car, `${v2.clubOf(champ)?.name} are champions of the ${league}.`, 'world');
  if (a.pots) news(car, `Player of the season: ${a.pots.name} (${v2.clubOf(a.pots.club)?.short}).`, 'award');
  if (a.boot) news(car, `Golden boot: ${a.boot.name} with ${a.boot.goals}.`, 'award');
}

export function managerOf(car, clubId) {
  ensureV3(car);
  const m = car.world.managers[clubId];
  if (m) return m.name;
  const pool = ['R. Castell', 'M. Oyelaran', 'J. Van Dessel', 'A. Bertolini', 'S. Al-Mansour', 'T. Grayling', 'F. Duvall', 'K. Hollmann', 'P. Arriola', 'D. Kerrigan', 'L. Montané', 'H. Saeed'];
  const name = pool[hashOf(clubId) % pool.length];
  car.world.managers[clubId] = { name, since: 1 };
  return name;
}
function aiManagers(car, table) {
  const ids = table.map((r) => r.id);
  const bottom = ids.slice(-3);
  const first = ['Nuno', 'Ralf', 'Enzo', 'Yusuf', 'Graham', 'Pedro', 'Mikel', 'Sami', 'Lars', 'Bruno', 'Ivan', 'Omar'];
  const last = ['Albiol', 'Brenner', 'Carvalho', 'Dunmore', 'Ekberg', 'Ferrand', 'Gallardo', 'Hassan', 'Ilić', 'Jansen', 'Kouyaté', 'Lorente'];
  for (const id of ids) {
    if (id === car.clubId) continue;
    const cur = managerOf(car, id);
    const sack = bottom.includes(id) ? 0.6 : 0.06;
    if (Math.random() < sack) {
      const nm = `${first[Math.floor(Math.random() * first.length)][0]}. ${last[Math.floor(Math.random() * last.length)]}`;
      car.world.managers[id] = { name: nm, since: car.season + 1 };
      news(car, `${v2.clubOf(id)?.name} part ways with ${cur}; ${nm} takes over.`, 'world');
    }
  }
}

function retirementsAndRegens(car) {
  for (const [cid, rows] of Object.entries(car.squads)) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const name = rows[i][0];
      if (car.people?.[name]?.pro) continue;          // your pro retires when you say so
      const age = ageOf(car, name);
      const r = rateOf(car, name);
      const pr = age >= 39 ? 1 : age >= 34 ? (age - 33) * 0.22 + (r < 70 ? 0.15 : 0) : 0;
      if (pr && Math.random() < pr) {
        rows.splice(i, 1);
        car.world.retired += 1;
        if (cid === car.clubId || r >= 82) news(car, `${name} (${age}) retires${cid === car.clubId ? ' from our squad' : ''}.`, 'world');
      }
    }
    // clubs keep eighteen: free agents first, then a youngster from the club's own region
    const nation = nationForLeague(car.leagueOf?.[cid] || v2.clubOf(cid)?.league);
    if (cid === car.clubId) continue;                 // mine I fill myself (academy, transfers) — see squadFloor
    const fa = car.freeAgents || [];
    while (rows.length < 18 && fa.length) {
      const row = fa.splice(Math.floor(Math.random() * fa.length), 1)[0];
      if (ageOf(car, row[0]) >= 35) continue;
      row[3] = { years: 1 + Math.floor(Math.random() * 3), signed: car.season + 1 };
      rows.push(row);
    }
    while (rows.length < 18) {
      const avg = v2.squadOverall(rows, car);
      const name = newName(car, nation);
      const pos = needPos(rows);
      const base = clamp(Math.round(avg - 8 + Math.random() * 6), 50, 80);
      addPerson(car, name, { age: 17 + Math.floor(Math.random() * 3), base, pos, nation });
      rows.push([name, pos, nation, { years: 3, signed: car.season + 1 }]);
      car.world.regens += 1;
    }
  }
}
function needPos(rows) {
  const g = (p) => (p === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(p) ? 'D' : ['ST', 'LW', 'RW'].includes(p) ? 'F' : 'M');
  const c = { GK: 0, D: 0, M: 0, F: 0 }; for (const r of rows) c[g(r[1])] += 1;
  if (c.GK < 2) return 'GK';
  if (c.D < 6) return ['CB', 'CB', 'LB', 'RB'][Math.floor(Math.random() * 4)];
  if (c.M < 6) return ['CM', 'CDM', 'CAM', 'LM', 'RM'][Math.floor(Math.random() * 5)];
  return ['ST', 'LW', 'RW'][Math.floor(Math.random() * 3)];
}

/** Potential moves with form and minutes; growth heads toward it, the old decline. Replaces v2.developSquads. */
function potentialShift(car) {
  const growth = 0.85 + car.fac.training * 0.08;
  for (const [cid, rows] of Object.entries(car.squads)) {
    const mine = cid === car.clubId;
    const ranked = rows.map((r) => r[0]).sort((a, b) => rateOf(car, b) - rateOf(car, a));
    for (const r of rows) {
      const name = r[0]; const age = ageOf(car, name); const cur = rateOf(car, name); const pot = potOf(car, name);
      // the Player Career's own man grows through his attributes (proCareer.js), not here
      if (car.people?.[name]?.pro) continue;
      let minutes; let form = 0;
      if (mine) { const pl = plOf(car, name); minutes = pl.mins / Math.max(1, (car.fixtures?.length || 38) * 90); form = avgRating(pl) ? avgRating(pl) - 6.6 : 0; }
      else minutes = ranked.indexOf(name) < 11 ? 0.8 : ranked.indexOf(name) < 16 ? 0.35 : 0.1;
      // dynamic potential
      if (age <= 24) {
        if (minutes > 0.5 && form > 0.3) car.pot[name] = Math.min(96, pot + 1 + (form > 0.8 ? 1 : 0));
        else if (minutes < 0.15) car.pot[name] = Math.max(cur, pot - 1 - (Math.random() < 0.4 ? 1 : 0));
        else if (!mine && Math.random() < 0.15) car.pot[name] = clamp(pot + (Math.random() < 0.5 ? 1 : -1), cur, 95);
      }
      // growth and decline
      let d = 0;
      if (age <= 27 && cur < pot) {
        const room = pot - cur;
        const want = Math.min(room, (age <= 21 ? 3 : age <= 24 ? 2 : 1) * (0.5 + minutes) * growth + (car.plans?.[name]?.focus && mine ? 0.4 : 0));
        d = Math.floor(want) + (Math.random() < want % 1 ? 1 : 0);
      } else if (age >= 31) d = Math.random() < 0.65 ? -1 - (age >= 34 ? 1 : 0) : 0;
      if (d) car.dev[name] = (car.dev[name] | 0) + d;
    }
  }
}

/** Keep the save small: forget people nobody employs, trim the logs. */
function prune(car) {
  const live = new Set();
  for (const rows of Object.values(car.squads)) for (const r of rows) live.add(r[0]);
  for (const y of car.youth || []) live.add(y.name);
  for (const l of car.loans || []) live.add(l.name);
  for (const k of Object.keys(car.people)) if (!live.has(k) && !car.people[k].pro) delete car.people[k];
  for (const k of Object.keys(car.pot)) if (!live.has(k)) delete car.pot[k];
  for (const k of Object.keys(car.dev || {})) if (!live.has(k)) delete car.dev[k];
  for (const k of Object.keys(car.devBoost || {})) if (!live.has(k)) delete car.devBoost[k];
  const mine = new Set(rowsOf(car).map((r) => r[0]));
  for (const k of Object.keys(car.pl)) if (!mine.has(k)) delete car.pl[k];
  for (const k of Object.keys(car.plans)) if (!mine.has(k)) delete car.plans[k];
  for (const k of Object.keys(car.clauses)) if (!mine.has(k)) delete car.clauses[k];
  for (const k of Object.keys(car.sellOns)) if (!live.has(k)) delete car.sellOns[k];
  car.results = (car.results || []).filter((r) => r.season === car.season || r.season == null).slice(-60);
  car.world.news = car.world.news.slice(0, 60);
}

export function news(car, text, kind = 'world') {
  ensureV3(car);
  car.world.news = [{ season: car.season, week: car.week, text, kind }, ...car.world.news].slice(0, 60);
}
