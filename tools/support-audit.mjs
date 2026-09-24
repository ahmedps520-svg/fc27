/**
 * Support audit (v103, backlog #21): does the man on the ball have someone to
 * give it to?
 *
 * Seeded AI-vs-AI matches (the sweep's fixtures, Authentic, 240 s). Four
 * times a second while a side has the ball, the carrier's team-mates are
 * counted as *open* when they are 6–28 m away, nobody from the other side is
 * within 2.2 m of the line between them (the lane), and nobody is within
 * 3 m of the receiver. Passes are followed to where they end: a team-mate
 * (completed) or the other side (lost).
 *
 *   node tools/support-audit.mjs [--matches 40] [--seed 12345] [--human]
 *
 * --human seats a (stand-in) person on the home side, so the figures can be
 * read for the team-mates of someone holding the stick: the stand-in is the
 * same AI, but the side counts as having a person on it.
 */
import '../tests/unit/_dom.mjs';
const { Match, PITCH } = await import('../js/game/sim.js');
const { WORLD } = await import('../js/data/generator.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const N = arg('--matches', 40); const SEED = arg('--seed', 12345);
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const segDist = (p, a, b) => {
  const vx = b.x - a.x; const vy = b.y - a.y; const L = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L));
  return Math.hypot(a.x + vx * t - p.x, a.y + vy * t - p.y);
};

let lastPass = null;
const realPass = Match.prototype.pass;
Match.prototype.pass = function (p, ...rest) { lastPass = { team: p.team, from: p }; return realPass.call(this, p, ...rest); };

const CLUBS = WORLD.clubs.slice(0, 10);
const T = { samples: 0, open: 0, none: 0, short: 0, completed: 0, lost: 0, possessions: 0, possT: 0, nearest: 0, goals: 0 };
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(SEED + i * 7919);
  const home = CLUBS[i % CLUBS.length];
  let awayId = CLUBS[(i * 3 + 1) % CLUBS.length].id;
  if (awayId === home.id) awayId = CLUBS[(i + 5) % CLUBS.length].id;
  const m = new Match(home.id, awayId, { human: null, duration: 240 });
  lastPass = null;
  let owner = null; let ownTeam = null; let possStart = 0;
  for (let s = 0; s < 240 * 60 && m.phase !== 'end'; s++) {
    m.update(1 / 60);
    const o = m.ball.owner;
    if (o && o !== owner) {
      if (lastPass && lastPass.from !== o) { if (o.team === lastPass.team) T.completed += 1; else T.lost += 1; lastPass = null; }
      if (o.team !== ownTeam) { if (ownTeam != null) { T.possessions += 1; T.possT += m.t - possStart; } ownTeam = o.team; possStart = m.t; }
      owner = o;
    }
    if (!o || m.phase !== 'play' || s % 15) continue;
    const mates = m.teams[o.team].players.filter((q) => q !== o && q.role !== 'GK');
    const opp = m.teams[1 - o.team].players;
    let open = 0; let short = 0;
    for (const q of mates) {
      const d = dist(q, o);
      if (d < 6 || d > 28) continue;
      const lane = Math.min(...opp.map((x) => segDist(x, o, q)));
      const mark = Math.min(...opp.map((x) => dist(x, q)));
      if (lane >= 2.2 && mark >= 3) { open += 1; if (d <= 16) short += 1; }
    }
    T.samples += 1; T.open += open; T.short += short; if (!open) T.none += 1;
    T.nearest += Math.min(...mates.map((q) => dist(q, o)));
  }
  T.goals += m.teams[0].score + m.teams[1].score;
}
const pct = (a, b) => `${(100 * a / Math.max(1, b)).toFixed(1)}%`;
console.log(`${N} matches, seed ${SEED}`);
console.log(`  open team-mates per moment on the ball   ${(T.open / T.samples).toFixed(2)}  (short, ≤16 m: ${(T.short / T.samples).toFixed(2)})`);
console.log(`  moments with nobody open                 ${pct(T.none, T.samples)}`);
console.log(`  nearest team-mate to the carrier         ${(T.nearest / T.samples).toFixed(1)} m`);
console.log(`  passes completed                         ${pct(T.completed, T.completed + T.lost)} of ${T.completed + T.lost}`);
console.log(`  average possession                       ${(T.possT / Math.max(1, T.possessions)).toFixed(1)} s`);
console.log(`  goals a match                            ${(T.goals / N).toFixed(2)}`);
