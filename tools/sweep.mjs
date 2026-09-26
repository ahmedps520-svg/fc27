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
Match.prototype.cross = function wrappedCross(p, aim, kind = 'floated', ...rest) {
  crosses += 1;
  const team = this.teams[p.team];
  const goalX = team.dir > 0 ? PITCH.w : 0;
  if (team.players.some((t) => t !== p && t.role !== 'GK' && Math.abs(t.x - goalX) < 18)) {
    crossesWithTarget += 1;
  }
  const r = realCross.call(this, p, aim, ...rest);
  // v133: a cross (not a cut-back, which is a pass along the ground) is "completed"
  // when the next player to touch it is a team-mate of the crosser
  if (kind !== 'cutback' && this.ball.owner !== p) pending = { team: p.team, crosser: p, t: this.t };
  return r;
};
/* v133: headers at goal and headed goals. An attacking header cues 'header'
   with the header as the ball's last touch and then shoots; a defensive
   clearance cues it too, but shoots nothing — so a header counts at goal only
   when the ball comes off him as a shot. */
let pending = null; let crossDone = 0; let crossMissed = 0;
let headersAtGoal = 0; let headedGoals = 0; let lastHeader = null;
const realCue = Match.prototype.cue;
Match.prototype.cue = function wrappedCue(kind, ...a) {
  if (kind === 'header') lastHeader = { p: this.ball.lastTouch, t: this.t, shot: false };
  return realCue.call(this, kind, ...a);
};
const realShoot = Match.prototype.shoot;
Match.prototype.shoot = function wrappedShoot(p, ...a) {
  if (lastHeader && lastHeader.p === p && lastHeader.t === this.t) { lastHeader.shot = true; headersAtGoal += 1; }
  return realShoot.call(this, p, ...a);
};
const realGoal = Match.prototype.scoreGoal;
Match.prototype.scoreGoal = function wrappedGoal(side, ...a) {
  const scorer = this.ball.lastTouch;
  if (lastHeader?.shot && lastHeader.p === scorer && scorer?.team === side && this.t - lastHeader.t < 3) headedGoals += 1;
  return realGoal.call(this, side, ...a);
};

const total = { goals: 0, shots: 0, onTarget: 0, poss: 0, fouls: 0, yellows: 0, corner: 0, throwin: 0, goalkick: 0, freekick: 0, penalty: 0, offside: 0 };
/* v79: every restart, counted where the sim rules on it. */
const realMark = Match.prototype.markStoppage;
Match.prototype.markStoppage = function wrappedMark(kind) {
  if (kind in total) total[kind] += 1;
  return realMark.call(this, kind);
};
const realPen = Match.prototype.awardPenalty;
Match.prototype.awardPenalty = function wrappedPen(...a) { total.penalty += 1; return realPen.apply(this, a); };
/* The original ten clubs, always. v68 grew the world to twenty; the sweep
 * keeps measuring the same fixtures with the same squads so its goldens mean
 * the same thing before and after — the new league is content, not balance. */
const CLUBS = WORLD.clubs.slice(0, 10);

for (let i = 0; i < N; i++) {
  Math.random = mulberry32(SEED + i * 7919);

  const home = CLUBS[i % CLUBS.length];
  let awayId = CLUBS[(i * 3 + 1) % CLUBS.length].id;
  if (awayId === home.id) awayId = CLUBS[(i + 5) % CLUBS.length].id;

  const m = new Match(home.id, awayId, { human: null, duration: DURATION, preset: PRESET });
  const steps = Math.ceil(DURATION * 60);
  pending = null; lastHeader = null;
  for (let s = 0; s < steps && m.phase !== 'end'; s++) {
    m.update(1 / 60);
    if (pending) {
      const lt = m.ball.lastTouch;
      if (lt && lt !== pending.crosser) { if (lt.team === pending.team) crossDone += 1; else crossMissed += 1; pending = null; }
      else if (m.t - pending.t > 4 || m.phase !== 'play') { crossMissed += 1; pending = null; }
    }
  }

  total.goals += m.teams[0].score + m.teams[1].score;
  total.shots += m.teams[0].shots + m.teams[1].shots;
  total.onTarget += m.teams[0].onTarget + m.teams[1].onTarget;
  total.poss += m.possession()[0];
  total.fouls += m.fouls[0] + m.fouls[1];
  total.yellows += m.bookings.length;
  total.offside += m.offsides ? m.offsides[0] + m.offsides[1] : 0;
}

const per = (v) => (v / N).toFixed(2);
console.log(`${N} matches, seed ${SEED}, ${PRESET}`);
console.log(`  goals        ${per(total.goals)}        (target 2-3)`);
console.log(`  shots        ${per(total.shots)}       (target 11-15)`);
console.log(`  on target    ${per(total.onTarget)}`);
console.log(`  conversion   ${((total.goals / total.shots) * 100).toFixed(1)}%`);
console.log(`  home poss    ${per(total.poss)}%`);
console.log(`  crosses      ${per(crosses)}        (${per(crossesWithTarget)} with a man in the box)`);
console.log(`  cross comp   ${((crossDone / Math.max(1, crossDone + crossMissed)) * 100).toFixed(1)}%       (a team-mate's the next touch; cut-backs not counted)`);
console.log(`  headers      ${per(headersAtGoal)} at goal, ${per(headedGoals)} headed goals`);
/* Restarts and discipline, beside what a real match of the same number of
 * shots would have: real top-flight football averages about 25 shots, 22
 * fouls, 10 corners, 44 throw-ins, 17 goal kicks, 4 offsides and 3.8 yellows
 * a match, so each line shows the real count scaled to this sweep's shots. */
const scale = (total.shots / N) / 25;
const vs = (k, real) => `${per(total[k]).padEnd(7)} (real, scaled to these shots: ${(real * scale).toFixed(1)})`;
console.log(`  on target %  ${((total.onTarget / total.shots) * 100).toFixed(1)}%       (real ~34%)`);
console.log(`  fouls        ${vs('fouls', 22)}`);
console.log(`  yellows      ${vs('yellows', 3.8)}`);
console.log(`  corners      ${vs('corner', 10)}`);
console.log(`  throw-ins    ${vs('throwin', 44)}`);
console.log(`  goal kicks   ${vs('goalkick', 17)}`);
console.log(`  offsides     ${vs('offside', 4)}`);
console.log(`  free kicks   ${per(total.freekick)}`);
console.log(`  penalties    ${per(total.penalty)}`);
