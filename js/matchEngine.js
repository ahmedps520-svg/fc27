import { rosterOf, getClub } from './data/generator.js';

/* ------------------------------------------------------------------ *
 * A lightweight event-driven simulation: no physics, just weighted
 * dice rolls per minute biased by each side's attack / midfield /
 * defence ratings, producing a commentary feed and a box score.
 * ------------------------------------------------------------------ */

const rnd = () => Math.random();
const pick = (a) => a[Math.floor(rnd() * a.length)];

/** Best XI + departmental ratings for a club (or an explicit player list). */
export function buildSide(clubId, playersOverride = null) {
  const club = getClub(clubId);
  const pool = (playersOverride || rosterOf(clubId)).slice();

  const byPos = (groups) => pool.filter((p) => groups.includes(p.position))
    .sort((a, b) => b.overall - a.overall);

  const gk = byPos(['GK'])[0];
  const def = byPos(['CB', 'LB', 'RB']).slice(0, 4);
  const mid = byPos(['CDM', 'CM', 'CAM', 'LM', 'RM']).slice(0, 3);
  const att = byPos(['ST', 'LW', 'RW']).slice(0, 3);

  const xi = [gk, ...def, ...mid, ...att].filter(Boolean);
  const avg = (arr, key = 'overall') =>
    arr.length ? arr.reduce((s, p) => s + (key === 'overall' ? p.overall : p.stats[key]), 0) / arr.length : 65;

  return {
    clubId,
    name: club ? club.name : 'Select XI',
    short: club ? club.short : 'XI',
    crest: club ? club.crest : { shape: 'shield', colors: ['#41d3ff', '#2b2d6e'] },
    xi,
    scorersPool: [...att, ...mid].filter(Boolean),
    creators: [...mid, ...att].filter(Boolean),
    keeper: gk,
    attack: avg(att.length ? att : pool.slice(0, 3), 'shooting') * 0.6 + avg(att, 'pace') * 0.4,
    midfield: avg(mid, 'passing') * 0.6 + avg(mid) * 0.4,
    defence: avg(def, 'defending') * 0.7 + avg(def) * 0.3,
    keeping: gk ? gk.overall : 65,
    rating: Math.round(avg(xi)),
  };
}

const GOAL_LINES = [
  '{p} rifles it into the roof of the net!',
  'A cool finish from {p} — the keeper had no chance.',
  '{p} arrives at the back post and taps it home!',
  'What a strike from {p}! Straight into the top corner.',
  '{p} rounds the keeper and rolls it in.',
  'Deflected in off {p} — they will all count.',
  '{p} buries the rebound from six yards!',
  'Clinical from {p}, first time on the volley.',
];
const ASSIST_LINES = [
  ' Superb ball in from {a}.',
  ' {a} with the assist.',
  ' Laid on a plate by {a}.',
  '',
  '',
];
const SAVE_LINES = [
  '{p} forces a fingertip save from {k}!',
  '{k} is equal to the {p} effort — big hands.',
  'Denied! {k} throws himself across goal to stop {p}.',
  '{p} tests {k} from range but it is held.',
];
const MISS_LINES = [
  '{p} drags it wide of the far post.',
  'Over the bar from {p} — should have hit the target.',
  '{p} strikes the outside of the upright!',
  'A snapshot from {p} sails into the stands.',
  'Blocked! The defence throws a body in front of {p}.',
];
const NEUTRAL_LINES = [
  '{t} keep the ball moving patiently across the back line.',
  'Scrappy passage of play in midfield.',
  '{t} win a corner but it is cleared at the near post.',
  'A heavy touch from {p} lets the move break down.',
  '{t} press high and force a hurried clearance.',
  'The referee waves away appeals for a free kick.',
  '{p} goes into the book for a cynical trip.',
  '{t} switch play but the cross is overhit.',
];

const fill = (tpl, map) => tpl.replace(/\{(\w)\}/g, (_, k) => map[k] ?? '');

/**
 * Simulate a full match.
 * @returns {{home, away, homeGoals, awayGoals, events, stats, motm}}
 */
export function simulateMatch(homeSide, awaySide, opts = {}) {
  const { chemHome = 0, chemAway = 0 } = opts;

  const boost = (side, chem) => ({
    ...side,
    attack: side.attack * (1 + chem / 900),
    midfield: side.midfield * (1 + chem / 900),
    defence: side.defence * (1 + chem / 900),
  });
  const H = boost(homeSide, chemHome);
  const A = boost(awaySide, chemAway);

  const HOME_ADV = 2.5;
  const midTotal = (H.midfield + HOME_ADV) + A.midfield;
  const homePossShare = (H.midfield + HOME_ADV) / midTotal;

  const events = [];
  const stats = {
    home: { shots: 0, onTarget: 0, corners: 0, fouls: 0, cards: 0, possession: 0 },
    away: { shots: 0, onTarget: 0, corners: 0, fouls: 0, cards: 0, possession: 0 },
  };
  const scorers = {};
  const assists = {};
  let hg = 0;
  let ag = 0;
  let homeMinutes = 0;

  // ~0.26 shots per minute in possession -> roughly 22-26 shots across a match
  const chanceRate = (atk, def) => {
    const edge = (atk - def) / 100;
    return Math.max(0.12, Math.min(0.44, 0.26 + edge * 0.30));
  };

  events.push({ minute: 0, type: 'kickoff', text: `Kick off at ${H.name}. ${H.name} in the home colours against ${A.name}.` });

  for (let minute = 1; minute <= 90; minute++) {
    const homeHasBall = rnd() < homePossShare;
    if (homeHasBall) homeMinutes++;

    const atkSide = homeHasBall ? H : A;
    const defSide = homeHasBall ? A : H;
    const key = homeHasBall ? 'home' : 'away';
    const box = stats[key];

    if (rnd() > chanceRate(atkSide.attack, defSide.defence)) {
      // quiet minute — occasional colour commentary
      if (rnd() < 0.11) {
        const line = pick(NEUTRAL_LINES);
        if (line.includes('book')) { box.fouls++; box.cards++; }
        if (line.includes('corner')) box.corners++;
        events.push({
          minute, type: 'note', side: key,
          text: fill(line, { t: atkSide.name, p: pick(atkSide.xi)?.name ?? 'the winger' }),
        });
      }
      continue;
    }

    const shooter = weightedShooter(atkSide);
    box.shots++;

    // shot quality vs. defence + keeper -> ~12% of shots become goals,
    // another ~36% are on target and saved, the rest miss.
    const quality = (shooter.stats.shooting * 0.55 + shooter.overall * 0.45) / 100;
    const resist = (defSide.defence * 0.5 + defSide.keeping * 0.5) / 100;
    const goalP = Math.max(0.035, Math.min(0.30, 0.115 + (quality - resist) * 0.55));
    const roll = rnd();

    if (roll < goalP) {
      box.onTarget++;
      hg += homeHasBall ? 1 : 0;
      ag += homeHasBall ? 0 : 1;
      scorers[shooter.id] = (scorers[shooter.id] || 0) + 1;

      let assistTxt = '';
      const creator = pick(atkSide.creators.filter((p) => p.id !== shooter.id));
      if (creator && rnd() < 0.68) {
        assists[creator.id] = (assists[creator.id] || 0) + 1;
        assistTxt = fill(pick(ASSIST_LINES), { a: creator.name });
      }
      events.push({
        minute, type: 'goal', side: key, playerId: shooter.id,
        score: `${hg}-${ag}`,
        text: fill(pick(GOAL_LINES), { p: shooter.name }) + assistTxt,
      });
    } else if (roll < goalP + 0.36) {
      box.onTarget++;
      events.push({
        minute, type: 'save', side: key,
        text: fill(pick(SAVE_LINES), { p: shooter.name, k: defSide.keeper?.name ?? 'the keeper' }),
      });
      if (rnd() < 0.4) box.corners++;
    } else {
      events.push({ minute, type: 'miss', side: key, text: fill(pick(MISS_LINES), { p: shooter.name }) });
    }

    if (minute === 45) events.push({ minute: 45, type: 'half', text: `Half time: ${H.short} ${hg} - ${ag} ${A.short}` });
  }

  stats.home.possession = Math.round((homeMinutes / 90) * 100);
  stats.away.possession = 100 - stats.home.possession;

  events.push({
    minute: 90, type: 'full',
    text: `Full time: ${H.name} ${hg} - ${ag} ${A.name}`,
  });

  return {
    home: homeSide, away: awaySide,
    homeGoals: hg, awayGoals: ag,
    events: events.sort((a, b) => a.minute - b.minute),
    stats,
    scorers, assists,
    motm: manOfTheMatch(H, A, scorers, assists, hg, ag),
  };
}

function weightedShooter(side) {
  // forwards shoot far more often than midfielders
  const pool = side.scorersPool.length ? side.scorersPool : side.xi;
  const weights = pool.map((p) => {
    const base = p.position === 'ST' ? 5 : ['LW', 'RW', 'CAM'].includes(p.position) ? 3.4 : 1.6;
    return base * (0.55 + p.stats.shooting / 130);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function manOfTheMatch(H, A, scorers, assists, hg, ag) {
  const all = [...H.xi.map((p) => [p, 'home']), ...A.xi.map((p) => [p, 'away'])];
  let best = null;
  let bestScore = -1;
  for (const [p, side] of all) {
    const won = side === 'home' ? hg > ag : ag > hg;
    const clean = side === 'home' ? ag === 0 : hg === 0;
    let score = p.overall / 22 + rnd() * 2.4;
    score += (scorers[p.id] || 0) * 3.6 + (assists[p.id] || 0) * 2.2;
    if (won) score += 0.9;
    if (clean && ['GK', 'CB', 'LB', 'RB'].includes(p.position)) score += 1.4;
    if (score > bestScore) { bestScore = score; best = { player: p, side, goals: scorers[p.id] || 0, assists: assists[p.id] || 0 }; }
  }
  best.rating = Math.min(10, Math.max(6.4, +(bestScore / 1.35).toFixed(1)));
  return best;
}

/** Fast result-only sim used for the other fixtures on a matchday. */
export function quickResult(homeId, awayId) {
  const h = buildSide(homeId);
  const a = buildSide(awayId);
  const diff = (h.attack + h.midfield + h.defence + 8) - (a.attack + a.midfield + a.defence);
  const hxg = Math.max(0.25, 1.42 + diff / 42);
  const axg = Math.max(0.2, 1.15 - diff / 42);
  return { homeGoals: poisson(hxg), awayGoals: poisson(axg) };
}

function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do { k++; p *= rnd(); } while (p > L);
  return Math.min(k - 1, 7);
}
