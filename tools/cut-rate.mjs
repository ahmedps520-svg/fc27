/**
 * How often the plant-and-cut fires (v137, feel part 2): a whole AI match in
 * Node, js/game/rig.js's updateBank/updateCut run on every player every frame,
 * cuts counted per player-minute of play. Render side only: the sim never
 * sees it. Tuned to ~8 a minute (the sharpest turns at pace, not every re-steer).
 *
 *   node tools/cut-rate.mjs [seed=7]
 */
import '../tests/unit/_dom.mjs';
const { Match } = await import('../js/game/sim.js');
const { WORLD } = await import('../js/data/generator.js');
const R = await import('../js/game/rig.js');
let seed = +(process.argv[2] || 7);
Math.random = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
let cuts = 0; let frames = 0; const dt = 1 / 60; const at = [];
for (let i = 0; i < 240 * 60; i++) {
  m.update(dt);
  if (m.phase !== 'play') continue;
  for (const tm of m.teams) for (const p of tm.players) {
    const had = p._cut?.id; R.updateBank(p, dt);
    if (p._cut && p._cut.id !== had) { cuts++; at.push(Math.hypot(p.vx, p.vy)); }
  }
  frames++;
}
const mins = frames / 3600;
at.sort((a, b) => a - b);
console.log(`${cuts} cuts in ${mins.toFixed(1)} min of play: ${(cuts / mins / 22).toFixed(1)} a player-minute, median speed ${at[at.length >> 1]?.toFixed(1)} m/s`);
