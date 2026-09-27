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

/* v137 (feel part 2): the plant-and-cut and turning on the spot. */
function cutRun(turnDeg, speed = 7, over = 0) {
  const col = new THREE.Color('#d33a3a');
  const fig = R.buildPlayer(col, col, col, col, col, { height: 1, girth: 1, shoulders: 1 });
  const p = { x: 0, y: 0, vx: speed, vy: 0, dirX: 1, dirY: 0, _phase: 0 };
  const dt = 1 / 60; let cuts = 0; let lastId = 0; let from = Infinity; let held = 0; let pop = 0; let prev = null; let pinned = null; let drift = 0;
  for (let i = 0; i < 240; i++) {
    // the sharpest turns the sim makes take a few frames; `over` stretches that into a curve
    const k = Math.max(0, Math.min(1, (i - 120) / ((over || 0.05) * 60)));
    const h = (turnDeg * Math.PI / 180) * k;
    p.vx = Math.cos(h) * speed; p.vy = Math.sin(h) * speed; p.dirX = Math.cos(h); p.dirY = Math.sin(h);
    p.x += p.vx * dt; p.y += p.vy * dt;
    const g = R.gaitOf(p); p._phase += R.strideRate(g.sp) * Math.min(1, g.sp / 1.2) * dt; R.updateBank(p, dt);
    if (p._cut && p._cut.id !== lastId) { cuts += 1; lastId = p._cut.id; from = i + 1; }
    R.posePlayer(fig, p, p._phase, true, 0);
    const feet = [fig.parts.footL.position.clone(), fig.parts.footR.position.clone()];
    // the outside foot (the right one on a cut to his left), for as long as it is held
    const out = p._cut && fig.feet[p._cut.side > 0 ? 'L' : 'R'];
    if (out && out.held) {
      held += 1;
      if (!pinned) pinned = { x: out.x, y: out.y }; else drift = Math.max(drift, Math.hypot(out.x - pinned.x, out.y - pinned.y));
    } else pinned = null;
    // from the cut on: the frame the velocity whips round jolts the swing prediction, and did before cuts existed (0.27 m)
    if (prev && i > from) for (const j of [0, 1]) pop = Math.max(pop, feet[j].distanceTo(prev[j]) - speed * dt);
    prev = feet;
  }
  return { cuts, pop, drift, held };
}

test('a hard change of direction is a plant-and-cut: the outside foot holds, nothing pops', () => {
  for (const deg of [100, -110, 140]) {
    const r = cutRun(deg);
    assert.equal(r.cuts, 1, `${deg}°: one cut (${r.cuts})`);
    assert.ok(r.held >= 4, `${deg}°: the outside foot is planted (${r.held} frames)`);
    assert.ok(r.drift < 0.02, `${deg}°: the planted foot stays put (${r.drift.toFixed(3)} m)`);
    // a leg whipped round to catch up after the plant moves fast, but never jumps (0.15 m on straight running)
    assert.ok(r.pop < 0.2, `${deg}°: no foot jumps (${r.pop.toFixed(2)} m)`);
  }
});

test('a gentle curve is not a cut', () => {
  assert.equal(cutRun(90, 7, 1.5).cuts, 0);
  assert.equal(cutRun(40).cuts, 0);
  assert.equal(cutRun(120, 3).cuts, 0, 'not at a jog');
});

test('turning on the spot: one foot at a time, each lifted clear', () => {
  const col = new THREE.Color('#d33a3a');
  const fig = R.buildPlayer(col, col, col, col, col, { height: 1, girth: 1, shoulders: 1 });
  const p = { x: 0, y: 0, vx: 0, vy: 0, dirX: 1, dirY: 0, _phase: 0 };
  const dt = 1 / 60; let both = 0; let lifted = 0; let prev = null;
  for (let i = 0; i < 90; i++) {
    const f = Math.PI * Math.min(1, i / 20); p.dirX = Math.cos(f); p.dirY = Math.sin(f);
    R.updateBank(p, dt); R.posePlayer(fig, p, 0, true, 0);
    const feet = [{ ...fig.feet.L }, { ...fig.feet.R }].map((q) => ({ x: q.x, y: q.y, z: q.z ?? 0 }));
    if (prev) {
      const moved = feet.map((q, j) => Math.hypot(q.x - prev[j].x, q.y - prev[j].y) > 0.004);
      if (moved[0] && moved[1]) both += 1;
      if (feet.some((q) => q.z > 0.11)) lifted += 1;
    }
    prev = feet;
  }
  assert.ok(both <= 2, `both feet moving at once on ${both} frames`);
  assert.ok(lifted > 5, `the stepping foot leaves the grass (${lifted} frames)`);
});
