/**
 * v197: scenarios — a match picked up part-way through.
 *
 * Each one hands you a side at a given minute with the score already on the
 * board, sometimes a man or two already sent off (or one of theirs), and three
 * goals to reach by full time: a star each. A star pays the first time it is
 * earned; every star of every scenario earns a Prime pack, once.
 *
 * The sides are real clubs of the world, picked by strength (their best
 * eleven's rating, strongest first), so a scenario is the same match for
 * everyone. `stageScenario` sets the clock, the score, the goals already
 * scored and the red cards on a freshly built Match (play.js), using the
 * sim's own `sendOff` so the short side reshapes exactly as it would after a
 * red in play.
 */
import { getState, update } from './state.js';
import { WORLD } from './data/generator.js';

export const STAR_APEX = 500;
export const ALL_STARS_PACK = 'prime';

/** What a star asks for, judged at full time: s/c the final score, g/l your goals and theirs since the start. */
export const GOALS = {
  score1: { text: 'Score at least once', ok: (r) => r.g >= 1 },
  score2: { text: 'Score at least twice', ok: (r) => r.g >= 2 },
  noLoss: { text: 'Avoid defeat', ok: (r) => r.s >= r.c },
  win: { text: 'Win', ok: (r) => r.s > r.c },
  winClean: { text: 'Win without conceding again', ok: (r) => r.s > r.c && r.l === 0 },
  by2: { text: 'Win by two or more', ok: (r) => r.s - r.c >= 2 },
  by3: { text: 'Win by three or more', ok: (r) => r.s - r.c >= 3 },
};

/**
 * `you`/`them`: a club by strength rank, 0 the strongest of the hundred.
 * `down`: men already sent off, yours and theirs. `secs`: real seconds left to
 * play, whatever the minute — the match's length is worked back from it.
 */
export const SCENARIOS = [
  { id: 'late-show', name: 'The Late Show', brief: 'A goal down with ten minutes left, against a side just like yours.', you: 30, them: 31, minute: 80, score: [0, 1], down: [0, 0], secs: 75, skill: 1.0, stars: ['noLoss', 'win', 'by2'] },
  { id: 'ten-men', name: 'Ten Men', brief: 'Your centre-back has gone for a second yellow. Protect the lead.', you: 30, them: 28, minute: 55, score: [1, 0], down: [1, 0], secs: 110, skill: 1.0, stars: ['win', 'winClean', 'by2'] },
  { id: 'mountain', name: 'Mountain to Climb', brief: 'Two down on the hour to one of the best sides in the world.', you: 40, them: 8, minute: 60, score: [0, 2], down: [0, 0], secs: 100, skill: 1.1, stars: ['score1', 'noLoss', 'win'] },
  { id: 'hold-line', name: 'Hold the Line', brief: 'A shock lead against the champions. Twenty minutes to hang on.', you: 60, them: 1, minute: 70, score: [1, 0], down: [0, 0], secs: 90, skill: 1.2, stars: ['noLoss', 'win', 'winClean'] },
  { id: 'nine-lives', name: 'Nine Lives', brief: 'Two men sent off, still level. Make it count.', you: 20, them: 30, minute: 65, score: [2, 2], down: [2, 0], secs: 90, skill: 1.0, stars: ['noLoss', 'win', 'by2'] },
  { id: 'stoppage', name: 'Into Stoppage Time', brief: 'Level in the 86th minute. One chance may be all you get.', you: 25, them: 25, minute: 86, score: [1, 1], down: [0, 0], secs: 60, skill: 1.1, stars: ['win', 'winClean', 'by2'] },
  { id: 'man-up', name: 'Man Advantage', brief: 'Their midfielder is off. Thirty minutes to make the extra man tell.', you: 50, them: 20, minute: 60, score: [0, 0], down: [0, 1], secs: 100, skill: 1.15, stars: ['win', 'by2', 'by3'] },
  { id: 'comeback', name: 'Comeback Kings', brief: 'Three-one down just before the hour. They think it is over.', you: 15, them: 35, minute: 58, score: [1, 3], down: [0, 0], secs: 110, skill: 1.0, stars: ['score2', 'noLoss', 'win'] },
  { id: 'giant-killers', name: 'Giant Killers', brief: 'From the bottom of the pyramid, level with the very best. A quarter of an hour to go.', you: 85, them: 0, minute: 75, score: [1, 1], down: [0, 0], secs: 85, skill: 1.25, stars: ['noLoss', 'win', 'winClean'] },
  { id: 'cup-final', name: 'Cup Final', brief: 'A goal down, a man down, twenty minutes from losing the final.', you: 10, them: 5, minute: 70, score: [0, 1], down: [1, 0], secs: 100, skill: 1.2, stars: ['score1', 'noLoss', 'win'], final: true },
];
export const scenarioById = (id) => SCENARIOS.find((x) => x.id === id) || null;

/* The hundred clubs by the rating of their best eleven, strongest first. */
let RANKED = null;
const strength = (c) => {
  const xi = c.roster.map((id) => WORLD.playersById[id]).filter(Boolean).sort((a, b) => b.overall - a.overall).slice(0, 11);
  return Math.round(xi.reduce((t, p) => t + p.overall, 0) / Math.max(1, xi.length));
};
function ranked() {
  if (!RANKED) RANKED = WORLD.clubs.map((c) => ({ club: c, rating: strength(c) })).sort((a, b) => b.rating - a.rating || a.club.id.localeCompare(b.club.id));
  return RANKED;
}
/** The two clubs of a scenario, with their ratings. */
export function sidesOf(sc) {
  const r = ranked();
  const at = (i) => r[Math.max(0, Math.min(r.length - 1, i))];
  let you = at(sc.you); let them = at(sc.them);
  if (you.club === them.club) them = at(sc.them + 1);
  return { you: { ...you }, them: { ...them } };
}

/** What navigate('play', …) needs. The whole match's length is worked back from the seconds left. */
export function scenarioParams(sc) {
  const { you, them } = sidesOf(sc);
  return { mode: 'single', homeId: you.club.id, awayId: them.club.id, skill: sc.skill,
    duration: Math.round((sc.secs * 90) / (90 - sc.minute)), final: !!sc.final, scenario: { id: sc.id } };
}

/**
 * Put a freshly built match where the scenario starts: the minute, the half,
 * the score (with scorers, so the full-time card adds up), the red cards —
 * a defender of yours, a midfielder of theirs — and nobody hearing a whistle
 * for cards shown before you took over. The side behind kicks off.
 */
export function stageScenario(match, sc) {
  match.t = match.duration * (sc.minute / 90);
  match.half = sc.minute >= 45 ? 2 : 1;
  sc.score.forEach((n, side) => {
    const team = match.teams[side];
    const shooters = team.players.filter((p) => p.role === 'FWD' || p.role === 'MID');
    for (let i = 0; i < n; i++) {
      const p = shooters[i % Math.max(1, shooters.length)] || team.players[10];
      team.scorers.push({ name: p.ref.name, id: p.ref.id, assist: null, assistName: null, minute: Math.max(1, Math.round(((i + 1 + side * 0.5) / (n + 1)) * (sc.minute - 4))) });
    }
    team.score = n;
  });
  sc.down.forEach((n, side) => {
    const order = side === 0 ? ['DEF', 'MID', 'FWD'] : ['MID', 'DEF', 'FWD'];
    for (let i = 0; i < n; i++) {
      const p = order.map((r) => match.teams[side].players.find((q) => q.role === r && !q.sentOff)).find(Boolean);
      match.sendOff(p, 'second yellow');
    }
  });
  match.cues.length = 0;
  match.resetPositions(sc.score[0] < sc.score[1] ? 0 : sc.score[0] > sc.score[1] ? 1 : 0);
  match.phase = 'kickoff'; match.phaseT = 1.4; match.banner = `${sc.minute}'`;
}

/** Stars for a full-time score. */
export function starsFor(sc, s, c) {
  const r = { s, c, g: s - sc.score[0], l: c - sc.score[1] };
  return sc.stars.map((k) => GOALS[k].ok(r));
}

export function scenarioRecord(id, st = getState()) {
  return st.club.scenarios?.[id] || { stars: [false, false, false], tries: 0, best: null };
}
export const totalStars = (st = getState()) => SCENARIOS.reduce((t, sc) => t + scenarioRecord(sc.id, st).stars.filter(Boolean).length, 0);

/**
 * Full time. Every star reached for the first time pays STAR_APEX; the last
 * of all thirty stars earns the Prime pack, once. A star is kept once earned.
 */
export function settleScenario(id, s, c) {
  const sc = scenarioById(id); if (!sc) return null;
  const now = starsFor(sc, s, c);
  let out = null;
  update((st) => {
    const all = st.club.scenarios || (st.club.scenarios = {});
    const rec = all[id] || (all[id] = { stars: [false, false, false], tries: 0, best: null });
    rec.tries += 1;
    const fresh = now.map((ok, i) => ok && !rec.stars[i]);
    rec.stars = rec.stars.map((had, i) => had || now[i]);
    const got = now.filter(Boolean).length;
    if (!rec.best || got > rec.best.stars) rec.best = { stars: got, s, c };
    const apex = fresh.filter(Boolean).length * STAR_APEX;
    st.club.apex += apex;
    let pack = null;
    const total = SCENARIOS.reduce((t, x) => t + (all[x.id]?.stars.filter(Boolean).length || 0), 0);
    if (total === SCENARIOS.length * 3 && !st.club.scenarioPack) { st.club.scenarioPack = true; st.club.packs.push(ALL_STARS_PACK); pack = ALL_STARS_PACK; }
    out = { stars: now, fresh, apex, pack, total };
  });
  return out;
}
