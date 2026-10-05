/**
 * v145: how keepers give the ball away. 20 AI matches (4 min, seed 12345);
 * for every distribution its kind (roll, pass, throw, punt, drop-kick, kick)
 * and whether his side has the ball 3 seconds later.
 *   node tools/keeper-audit.mjs [matches=20]
 */
import { Match } from '../js/game/sim.js';
import { WORLD } from '../js/data/generator.js';

const N = Number(process.argv[2] || 20);
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const CLUBS = WORLD.clubs.slice(0, 10);
const kinds = {}; let pend = [];
const real = Match.prototype.distribute;
Match.prototype.distribute = function (o) { real.call(this, o); pend.push({ kind: this.ball.gkKind, team: o.team, t: this.t, x: o.x }); };
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(12345 + i * 7919);
  const home = CLUBS[i % 10]; let away = CLUBS[(i * 3 + 1) % 10].id; if (away === home.id) away = CLUBS[(i + 5) % 10].id;
  const m = new Match(home.id, away, { human: null, duration: 240 }); pend = [];
  for (let s = 0; s < 240 * 60 && m.phase !== 'end'; s++) {
    m.update(1 / 60);
    pend = pend.filter((d) => {
      if (m.t - d.t < 3) return true;
      const k = kinds[d.kind] || (kinds[d.kind] = { n: 0, kept: 0, gain: 0 });
      const own = m.ball.owner ? m.ball.owner.team : m.ball.lastTouch?.team;
      k.n++; if (own === d.team) { k.kept++; k.gain += Math.abs(m.ball.x - d.x); }
      return false;
    });
  }
}
for (const [k, v] of Object.entries(kinds)) console.log(`${k.padEnd(9)} ${(v.n / N).toFixed(2)} a match · kept ${(100 * v.kept / v.n).toFixed(0)}% · ${(v.gain / Math.max(1, v.kept)).toFixed(0)} m upfield when kept`);
