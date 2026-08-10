/**
 * Deterministic AI-vs-AI balance sweep.
 *
 * The rule in HANDOFF.md is that match balance is never judged by feel. This is
 * how it gets judged instead: run the simulation with no human, many times, and
 * count what came out.
 *
 * The important part is the seeding. `sim.js` calls `Math.random` directly all
 * over, so two runs of *identical* code differ by half a goal a match at sixty
 * matches — which is larger than most of the changes being measured. That has
 * twice made noise look like a result: a passing tweak appeared to shift the
 * league by 13% and did not, and an off-ball change appeared to add goals on one
 * sample and remove them on the next. Replacing `Math.random` with a seeded
 * generator, reseeded identically per fixture, makes a before/after comparison
 * exact — same fixtures, same dice, only the code differs.
 *
 * Nothing in the game is modified; the substitution lives and dies in this
 * process.
 *
 *   node tools/sweep.mjs                          # 60 matches, default seed
 *   node tools/sweep.mjs 120 777                 # 120 matches, seed 777
 *   node tools/sweep.mjs 120 777 competitive     # ...on the Competitive preset
 *
 * To compare a change: run it on a clean checkout, apply the change, run it
 * again with the same arguments. Anything that does not move a number across
 * two different seeds has not moved it at all.
 */
import { Match, PITCH } from '../js/game/sim.js';
import { WORLD } from '../js/data/generator.js';

const N = Number(process.argv[2] || 60);
const SEED = Number(process.argv[3] || 12345);
const PRESET = process.argv[4] || 'authentic';
const DURATION = 240;          // what Apex Division and Quick Match use

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Crossing is counted by wrapping the method, because the match keeps no tally
// of it and an off-ball change that claims to produce crosses has to be made to
// prove it.
const realCross = Match.prototype.cross;
let crosses = 0;
let crossesWithTarget = 0;
Match.prototype.cross = function wrappedCross(p, aim) {
  crosses += 1;
  const team = this.teams[p.team];
  const goalX = team.dir > 0 ? PITCH.w : 0;
  if (team.players.some((t) => t !== p && t.role !== 'GK' && Math.abs(t.x - goalX) < 18)) {
    crossesWithTarget += 1;
  }
  return realCross.call(this, p, aim);
};

const total = { goals: 0, shots: 0, onTarget: 0, poss: 0 };
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(SEED + i * 7919);

  const home = WORLD.clubs[i % WORLD.clubs.length];
  let awayId = WORLD.clubs[(i * 3 + 1) % WORLD.clubs.length].id;
  if (awayId === home.id) awayId = WORLD.clubs[(i + 5) % WORLD.clubs.length].id;

  const m = new Match(home.id, awayId, { human: null, duration: DURATION, preset: PRESET });
  const steps = Math.ceil(DURATION * 60);
  for (let s = 0; s < steps && m.phase !== 'end'; s++) m.update(1 / 60);

  total.goals += m.teams[0].score + m.teams[1].score;
  total.shots += m.teams[0].shots + m.teams[1].shots;
  total.onTarget += m.teams[0].onTarget + m.teams[1].onTarget;
  total.poss += m.possession()[0];
}

const per = (v) => (v / N).toFixed(2);
console.log(`${N} matches, seed ${SEED}, ${PRESET}`);
console.log(`  goals        ${per(total.goals)}        (target 2-3)`);
console.log(`  shots        ${per(total.shots)}       (target ~11)`);
console.log(`  on target    ${per(total.onTarget)}`);
console.log(`  conversion   ${((total.goals / total.shots) * 100).toFixed(1)}%`);
console.log(`  home poss    ${per(total.poss)}%`);
console.log(`  crosses      ${per(crosses)}        (${per(crossesWithTarget)} with a man in the box)`);
