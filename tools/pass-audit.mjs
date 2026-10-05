/**
 * v142: how many passes arrive. Plays 20 AI-vs-AI matches (4 min, seed 12345)
 * and follows every pass to the first player who controls the ball after it.
 * Prints completion, interceptions (on the way, off the receiver, at the foot),
 * median pass and shot speed and median length.
 *   node tools/pass-audit.mjs
 */
import { Match } from '../js/game/sim.js';
import { WORLD } from '../js/data/generator.js';
const N = 20; const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const CLUBS = WORLD.clubs.slice(0, 10);
let passes = 0, done = 0, lost = 0, out = 0, pending = null, dist = [], m; const where = { lane: 0, receiver: 0, behind: 0 }; let speeds = [];
const realCue = Match.prototype.cue;
Match.prototype.cue = function (k, a) { const r = realCue.call(this, k, a); return r; };
const realPass = Match.prototype.pass;
Match.prototype.pass = function (p, ...rest) {
  const r = realPass.call(this, p, ...rest);
  const b = this.ball;
  if (b.owner !== p) { passes++; speeds.push(Math.hypot(b.vx, b.vy)); pending = { team: p.team, p, t: this.t, x: p.x, y: p.y }; }
  return r;
};
const realShoot = Match.prototype.shoot; let shotSp = [];
Match.prototype.shoot = function (p, ...rest) { const r = realShoot.call(this, p, ...rest); shotSp.push(Math.hypot(this.ball.vx, this.ball.vy, this.ball.vz)); return r; };
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(12345 + i * 7919);
  const home = CLUBS[i % 10]; let away = CLUBS[(i * 3 + 1) % 10].id; if (away === home.id) away = CLUBS[(i + 5) % 10].id;
  m = new Match(home.id, away, { human: null, duration: 240 }); pending = null;
  for (let s = 0; s < 240 * 60 && m.phase !== 'end'; s++) {
    m.update(1 / 60);
    if (pending) {
      const lt = m.ball.owner;
      if (m.phase !== 'play') { out++; pending = null; }
      else if (lt && lt !== pending.p) {
        const travelled = Math.hypot(m.ball.x - pending.x, m.ball.y - pending.y);
        if (lt.team === pending.team) { done++; dist.push(travelled); }
        else {
          lost++;
          // the team-mate nearest where it was cut out: was the pass taken off his toes, or cut out on the way?
          const mate = m.teams[pending.team].players.filter((q) => q !== pending.p).reduce((b, q) => (Math.hypot(q.x - m.ball.x, q.y - m.ball.y) < Math.hypot(b.x - m.ball.x, b.y - m.ball.y) ? q : b));
          const dm = Math.hypot(mate.x - m.ball.x, mate.y - m.ball.y);
          if (dm < 2.5) where.receiver++; else if (travelled < 3) where.behind++; else where.lane++;
        }
        pending = null; }
      else if (m.t - pending.t > 5) { pending = null; }
    }
  }
}
dist.sort((a, b) => a - b);
speeds.sort((a, b) => a - b);
shotSp.sort((a, b) => a - b); console.log('median shot speed', shotSp[shotSp.length >> 1]?.toFixed(1), 'm/s'); console.log('lost: on the way', where.lane, '· off the receiver', where.receiver, '· at once (blocked at the foot)', where.behind, '· median pass speed', speeds[speeds.length >> 1].toFixed(1), 'm/s');
console.log(`passes ${(passes / N).toFixed(1)} a match · completed ${(100 * done / passes).toFixed(1)}% · intercepted ${(100 * lost / passes).toFixed(1)}% · out/stopped ${(100 * out / passes).toFixed(1)}% · median length ${dist[dist.length >> 1].toFixed(1)} m`);
