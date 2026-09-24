/**
 * v102 (feel): the built-in figures step instead of skating. Held here with
 * the two numbers tools/gait-audit.mjs reports: how fast a foot on the grass
 * moves (it used to slide along at the body's own speed, 1.0×), and the
 * largest jump a foot makes in one frame beyond the body's own movement (a
 * pop — the first cut of the foot plant made 0.4 m ones).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const R = await import('../../js/game/rig.js');
const THREE = await import('../../js/vendor/three.module.js');

function run(speed, travelDeg, faceDeg, turn = false) {
  const col = new THREE.Color('#d33a3a');
  const fig = R.buildPlayer(col, col, col, col, col, { height: 1, girth: 1, shoulders: 1 });
  const p = { x: 0, y: 0, vx: 0, vy: 0, dirX: 1, dirY: 0, _phase: 0 };
  const dt = 1 / 60; let prev = null; let slip = 0; let n = 0; let pop = 0;
  for (let i = 0; i < 360; i++) {
    const h = turn ? Math.PI * Math.min(1, (i * dt) / 1.2) : travelDeg * Math.PI / 180;
    p.vx = Math.cos(h) * speed; p.vy = Math.sin(h) * speed;
    const f = faceDeg == null ? h : faceDeg * Math.PI / 180; p.dirX = Math.cos(f); p.dirY = Math.sin(f);
    p.x += p.vx * dt; p.y += p.vy * dt;
    const g = R.gaitOf(p); p._phase += R.strideRate(g.sp) * Math.min(1, g.sp / 1.2) * dt; R.updateBank(p, dt);
    R.posePlayer(fig, p, p._phase, true, 0);
    const feet = [fig.parts.footL.position.clone(), fig.parts.footR.position.clone()];
    if (prev && i > 20) {
      for (const k of [0, 1]) {
        pop = Math.max(pop, feet[k].distanceTo(prev[k]) - speed * dt);
        if (feet[k].z < 0.06 && prev[k].z < 0.06) { slip += Math.hypot(feet[k].x - prev[k].x, feet[k].y - prev[k].y) / dt / speed; n += 1; }
      }
    }
    prev = feet;
  }
  return { slip: n ? slip / n : 0, pop, grounded: n };
}

for (const [name, sp, tr, fc, turn] of [['jog', 3, 0, null], ['sprint', 8.5, 0, null], ['backpedal', 3, 180, 0], ['jockey sideways', 2.4, 90, 180], ['hard turn', 6.5, 0, null, true]]) {
  test(`${name}: a foot on the grass stays put, and no foot pops`, () => {
    const r = run(sp, tr, fc, turn);
    assert.ok(r.grounded > 20, `feet reach the grass (${r.grounded} frames)`);
    assert.ok(r.slip < 0.3, `planted foot slides at ${r.slip.toFixed(2)}× the body speed`);
    assert.ok(r.pop < 0.15, `a foot jumps ${r.pop.toFixed(2)} m in one frame`);
  });
}

test('the stride rhythm is a real one: longer strides at speed, not only faster legs', () => {
  const cyc = (v) => R.strideRate(v) / (2 * Math.PI);
  assert.ok(Math.abs(cyc(3) - 1.3) < 0.1, `jog ${cyc(3).toFixed(2)} cycles/s`);
  assert.ok(Math.abs(cyc(9) - 2.2) < 0.15, `sprint ${cyc(9).toFixed(2)} cycles/s`);
  assert.ok(9 / cyc(9) > 1.6 * (3 / cyc(3)), 'a sprint stride is much longer than a jog stride (real: ~2.3 m vs ~4.1 m)');
});

test('a backpedal and a sideways move are read as such', () => {
  const back = R.gaitOf({ vx: -3, vy: 0, dirX: 1, dirY: 0 });
  assert.equal(back.dir, -1); assert.ok(back.mf < -0.9);
  const side = R.gaitOf({ vx: 0, vy: 2, dirX: 1, dirY: 0 });
  assert.ok(Math.abs(side.mf) < 0.1 && side.ml > 0.9);
});
