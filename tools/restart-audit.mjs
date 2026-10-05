/**
 * Where the restarts come from (v140): AI-vs-AI matches seeded as the sweep is,
 * and for every corner, throw-in and goal kick the last thing that happened to
 * the ball before it went out — a save, a block, a clearance, a tackle, a pass,
 * a cross, a shot. Real football has ~6 corners, ~26 throw-ins and ~10 goal
 * kicks a match (scaled to the sweep's shots: tools/sweep.mjs); the match had
 * a third of that, and this says which kind of moment never sends it out.
 *
 *   node tools/restart-audit.mjs [matches=40] [seed=12345]
 */
import { Match } from '../js/game/sim.js';
import { WORLD } from '../js/data/generator.js';

const N = Number(process.argv[2] || 40); const SEED = Number(process.argv[3] || 12345);
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const CLUBS = WORLD.clubs.slice(0, 10);
const EVENTS = ['save', 'block', 'clear', 'tackle', 'pass', 'through', 'cross', 'shot', 'header', 'lob', 'touch', 'heavyTouch', 'post'];
let last = null; let m = null;
const tally = { corner: {}, throwin: {}, goalkick: {} };
const counts = {};
const realCue = Match.prototype.cue;
Match.prototype.cue = function (kind, ...a) {
  counts[kind] = (counts[kind] || 0) + 1;
  if (EVENTS.includes(kind)) last = { kind, t: this.t };
  return realCue.call(this, kind, ...a);
};
const realMark = Match.prototype.markStoppage;
Match.prototype.markStoppage = function (kind) {
  if (tally[kind]) {
    const k = last && this.t - last.t < 3 ? last.kind : 'other';
    tally[kind][k] = (tally[kind][k] || 0) + 1;
  }
  return realMark.call(this, kind);
};
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(SEED + i * 7919);
  const home = CLUBS[i % 10]; let away = CLUBS[(i * 3 + 1) % 10].id; if (away === home.id) away = CLUBS[(i + 5) % 10].id;
  m = new Match(home.id, away, { human: null, duration: 240 }); last = null;
  for (let s = 0; s < 240 * 60 && m.phase !== 'end'; s++) m.update(1 / 60);
}
const per = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / N).toFixed(2)}`).join(' · ');
for (const k of Object.keys(tally)) console.log(`${k.padEnd(9)} ${(Object.values(tally[k]).reduce((a, b) => a + b, 0) / N).toFixed(2)} a match — after: ${per(tally[k])}`);
console.log('events a match:', EVENTS.filter((e) => counts[e]).map((e) => `${e} ${(counts[e] / N).toFixed(1)}`).join(' · '));
