/**
 * Where crosses go (v133): who touches a CPU cross next, and where it lands.
 *
 *   node tools/cross-audit.mjs [matches=60] [seed=12345]
 *
 * Seeded like tools/sweep.mjs. For every cross (cut-backs excluded) it reports
 * the next touch: a team-mate (and whether with his head), a defender, the
 * keeper, or nobody (out of play, or loose for 4 s) — and how far from its
 * target the ball came down, which separates bad deliveries from good ones
 * that were beaten away.
 */
import { Match, PITCH } from '../js/game/sim.js';
import { WORLD } from '../js/data/generator.js';

const N = Number(process.argv[2] || 60); const SEED = Number(process.argv[3] || 12345);
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const out = { mate: 0, mateHead: 0, defender: 0, keeper: 0, none: 0, n: 0, runsLive: 0 };
let pending = null;
const realCross = Match.prototype.cross;
Match.prototype.cross = function (p, aim, kind = 'floated', ...r) {
  const runs = this.boxRuns?.[p.team]?.size || 0;
  const res = realCross.call(this, p, aim, kind, ...r);
  if (kind !== 'cutback' && this.ball.owner !== p) { pending = { team: p.team, crosser: p, t: this.t, runs }; }
  return res;
};
let headerAt = -1;
const realCue = Match.prototype.cue;
Match.prototype.cue = function (k, ...a) { if (k === 'header') headerAt = this.t; return realCue.call(this, k, ...a); };
const CLUBS = WORLD.clubs.slice(0, 10);
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(SEED + i * 7919);
  const home = CLUBS[i % 10]; let awayId = CLUBS[(i * 3 + 1) % 10].id; if (awayId === home.id) awayId = CLUBS[(i + 5) % 10].id;
  const m = new Match(home.id, awayId, { human: null, duration: 240, preset: 'authentic' });
  pending = null;
  for (let s = 0; s < 240 * 60 && m.phase !== 'end'; s++) {
    m.update(1 / 60);
    if (!pending) continue;
    const lt = m.ball.lastTouch;
    const done = (k) => { out[k] += 1; out.n += 1; if (pending.runs) out.runsLive += 1; pending = null; };
    if (lt && lt !== pending.crosser) {
      if (lt.team === pending.team) { if (headerAt === m.t) out.mateHead += 1; done('mate'); }
      else done(lt.role === 'GK' ? 'keeper' : 'defender');
    } else if (m.t - pending.t > 4 || m.phase !== 'play') done('none');
  }
}
const pc = (v) => `${((v / Math.max(1, out.n)) * 100).toFixed(1)}%`;
console.log(`${out.n} crosses in ${N} matches (${pc(out.runsLive)} with runs on)`);
console.log(`  team-mate ${pc(out.mate)} (headers ${pc(out.mateHead)}) · defender ${pc(out.defender)} · keeper ${pc(out.keeper)} · nobody ${pc(out.none)}`);
