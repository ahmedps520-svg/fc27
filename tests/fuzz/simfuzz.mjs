/**
 * The sim fuzzer (promoted from tests/tmp in v148; nightly in CI): seeded
 * AI-vs-AI matches on every field and preset, checking every frame that
 * nothing is NaN, nobody leaves the world or moves impossibly fast, the ball
 * never dies in open play, and every match reaches full time. Exits 1 on any
 * problem.
 *
 *   node tests/fuzz/simfuzz.mjs [matches per field and preset=6] [fields=all]
 */
import '../unit/_dom.mjs';
const { Match, PITCH } = await import('../../js/game/sim.js');
const { FIELDS } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const N = Number(process.argv[2] || 6);
const problems = new Map();
const flag = (k, ctx) => { if (!problems.has(k)) { problems.set(k, ctx); console.log('  ✗', k, ctx); } };
for (const field of (process.argv[3] || Object.keys(FIELDS).join(',')).split(',')) {
  for (const preset of ['authentic', 'competitive', 'arcade']) {
    for (let i = 0; i < N; i++) {
      Math.random = mulberry32(99 + i * 131 + field.length * 7);
      const clubs = WORLD.clubs; const h = clubs[i % clubs.length].id; const a = clubs[(i + 3) % clubs.length].id;
      let m;
      try { m = new Match(h, a, { human: null, duration: 90, preset, field }); } catch (e) { flag(`construct ${field}: ${e.message}`, ''); continue; }
      const ctx = () => `${field}/${preset}/#${i} t=${m.t.toFixed(1)} phase=${m.phase}`;
      let steps = 0; let still = 0; let lastB = null; let goalsSeen = 0;
      try {
        for (; steps < 90 * 60 * 4 && m.phase !== 'end'; steps++) {
          m.update(1 / 60);
          const b = m.ball;
          if (![b.x, b.y, b.z, b.vx, b.vy, b.vz].every(Number.isFinite)) { flag('ball NaN', ctx()); break; }
          if (b.x < -25 || b.x > PITCH.w + 25 || b.y < -25 || b.y > PITCH.h + 25 || b.z < -0.5 || b.z > 80) flag(`ball out of world ${field}`, `${ctx()} ${b.x.toFixed(1)},${b.y.toFixed(1)},${b.z.toFixed(1)}`);
          for (const t of m.teams) for (const p of t.players) {
            if (p.sentOff) continue;                       // parked off the pitch, on purpose (v134)
            if (![p.x, p.y, p.vx, p.vy].every(Number.isFinite)) { flag('player NaN', `${ctx()} ${p.ref.name}`); break; }
            if (p.x < -30 || p.x > PITCH.w + 30 || p.y < -30 || p.y > PITCH.h + 30) flag(`player far off ${field}`, `${ctx()} ${p.ref.name} ${p.x.toFixed(1)},${p.y.toFixed(1)} role ${p.role}`);
            if (Math.hypot(p.vx, p.vy) > (p.slide > 0 ? 16 : 14)) flag(`player too fast ${field} ${p.role} dive=${p.diveT > 0} slide=${p.slide > 0}`, `${ctx()} ${Math.hypot(p.vx, p.vy).toFixed(1)}`);
          }
          if (b.owner && !m.teams.some((t) => t.players.includes(b.owner))) flag('ball owned by a ghost', ctx());
          // stuck: ball not moving and no owner for a long time in open play
          const key = `${b.x.toFixed(1)},${b.y.toFixed(1)}`;
          if (m.phase === 'play' && !b.owner && key === lastB) still++; else still = 0;
          lastB = key;
          if (still > 60 * 8) { flag(`ball dead in open play ${field}`, `${ctx()} ball ${b.x.toFixed(1)},${b.y.toFixed(1)},${b.z.toFixed(2)} v ${Math.hypot(b.vx,b.vy).toFixed(2)} | ` + m.teams.map((t) => t.players.map((p) => `${JSON.stringify({ burst: p.burst, skillT: p.skillT, spinT: p.spinT, slide: p.slide, stumble: p.stumble, run: p.run, runTo: p.runTo, chaser: m.chasers.includes(p), noTouch: b.noTouch, tx: p.tx, ty: p.ty })} ${p.role}@${p.x.toFixed(1)},${p.y.toFixed(1)} v${Math.hypot(p.vx,p.vy).toFixed(1)} lock${(p.touchLock||0).toFixed(1)} down${(p.downT||0).toFixed(1)}`).join(' ')).join(' || ') + ` W${PITCH.w} H${PITCH.h} sp=${JSON.stringify(m.setPiece)}`); still = 0; }
          const g = m.teams[0].score + m.teams[1].score;
          if (g < goalsSeen) flag('score went down', ctx());
          goalsSeen = g;
        }
      } catch (e) { flag(`throws ${field}/${preset}: ${e.message}`, `${ctx()} ${e.stack.split('\n')[1]}`); continue; }
      if (m.phase !== 'end') flag(`never ended ${field}`, ctx());
      for (const t of m.teams) {
        const own = t.scorers.length; if (own > t.score) flag('more scorers than goals', `${ctx()} ${own}>${t.score}`);
        const pc = t.players.length; if (pc > (FIELDS[field].players)) flag('too many players', `${ctx()} ${pc}`);
      }
      const poss = m.possession(); if (!poss.every(Number.isFinite) || Math.abs(poss[0] + poss[1] - 100) > 1.5) flag('possession does not add up', `${ctx()} ${poss}`);
    }
  }
  console.log('  ·', field);
}
console.log(problems.size ? `simfuzz: ${problems.size} problem(s)` : 'simfuzz: clean');
process.exit(problems.size ? 1 : 0);
