/**
 * Camera regression. One real AI match drives a camera rig for every ground
 * in the world (plus a three-tier, 100k custom bowl) under every preset, and
 * every frame of every rig must be: finite, outside every stand, roof and
 * net, looking at the pitch, and continuous — no frame-to-frame jump bigger
 * than a real camera could make. A camera change that clips into a stand,
 * snaps, or produces NaN fails here before it ships.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match, PITCH } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';
import { STADIUMS } from '../../js/data/stadiums.js';
import { createCameraRig, venueBounds, cameraInside, CAMERA_PRESETS, smoothDamp, directReplay, collideCamera } from '../../js/game/camera.js';

test('the spring never overshoots and settles', () => {
  const st = { v: 0 };
  let x = 0;
  let max = 0;
  for (let i = 0; i < 300; i++) { x = smoothDamp(x, 10, st, 0.3, 1 / 60); max = Math.max(max, x); }
  assert.ok(max <= 10 + 1e-9, `no overshoot (${max})`);
  assert.ok(Math.abs(x - 10) < 1e-3, `settled (${x})`);
});

test('collision pushes a camera out of stands and nets', () => {
  const b = venueBounds({ size: 0.9, tiers: 3, roof: 'ring' });
  assert.ok(cameraInside({ x: 50, y: PITCH.h + 12, z: 8 }, b), 'inside the far stand');
  assert.ok(cameraInside({ x: -10, y: 30, z: 5 }, b), 'inside an end stand');
  assert.ok(cameraInside({ x: -1, y: 34, z: 1.2 }, b), 'inside a goal');
  assert.ok(!cameraInside({ x: 50, y: -30, z: 17 }, b), 'the gantry is clear');
  assert.ok(!cameraInside({ x: 50, y: 34, z: 80 }, b), 'high above the pitch is clear');
  assert.ok(cameraInside({ x: -20, y: 34, z: 60 }, b), 'but not over the top of a stand: the walls go all the way up');
  const c = collideCamera({ x: 50, y: PITCH.h + 12, z: 8 }, b);
  assert.ok(!cameraInside(c, b), 'and collide leaves it outside');
});

test('the director picks two or three angles', () => {
  const frames = Array.from({ length: 300 }, (_, i) => ({ b: [60 + i * 0.1, 34, i > 250 ? 1.8 : 0] }));
  const near = directReplay({ frames, goalX: PITCH.w, seq: 0 });
  assert.ok(near.length >= 2 && near.length <= 3);
  for (const p of near) { assert.ok(p.angle >= 0 && p.angle <= 5); assert.ok(p.speed > 0 && p.speed <= 1); }
  const far = directReplay({ frames: Array.from({ length: 300 }, () => ({ b: [70, 34, 0] })), goalX: PITCH.w, seq: 0 });
  assert.equal(far.length, 3, 'a strike from distance gets three looks');
});

test('every preset on every ground: finite, outside, on the pitch, continuous', () => {
  const grounds = [...STADIUMS, { id: 'custom-max', size: 1, tiers: 3, roof: 'dome' }, { id: 'custom-min', size: 0.1, tiers: 1, roof: 'none' }];
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 240, human: null, skill: 1 });
  // a controller, so Dynamic and Pro have someone to follow
  m.controllers = m.controllers?.length ? m.controllers : [{ team: 0, activeIdx: 6 }];
  const rigs = [];
  for (const g of grounds) {
    const bounds = venueBounds(g);
    for (const p of CAMERA_PRESETS) {
      rigs.push({ g: g.id, p: p.id, bounds, rig: createCameraRig({ settings: { preset: p.id }, bounds }), last: null });
    }
  }
  const dt = 1 / 30;
  const phases = new Set();
  let worstJump = 0;
  let worstAt = '';
  for (let f = 0; f < 30 * 150 && m.phase !== 'end'; f++) {
    m.update(dt, []);
    phases.add(m.phase === 'play' && m.stoppage === 'goalkick' ? 'goalkick' : m.phase);
    for (const r of rigs) {
      const c = r.rig.update(m, dt, {});
      for (const k of ['x', 'y', 'z', 'tx', 'ty', 'tz', 'hfov']) {
        if (!Number.isFinite(c[k])) assert.fail(`${r.p} at ${r.g}: ${k} is ${c[k]} on frame ${f}`);
      }
      if (cameraInside({ ...c }, r.bounds)) assert.fail(`${r.p} at ${r.g}: camera inside geometry on frame ${f} (${c.x.toFixed(1)}, ${c.y.toFixed(1)}, ${c.z.toFixed(1)}) phase ${m.phase}`);
      assert.ok(c.tx > -15 && c.tx < PITCH.w + 15 && c.ty > -15 && c.ty < PITCH.h + 15, `${r.p} at ${r.g}: looking off the pitch`);
      assert.ok(c.hfov > 15 && c.hfov < 80, `${r.p}: fov ${c.hfov}`);
      if (r.last && f > 2) {
        const jump = Math.hypot(c.x - r.last.x, c.y - r.last.y, c.z - r.last.z);
        if (jump > worstJump) { worstJump = jump; worstAt = `${r.p} at ${r.g} frame ${f} phase ${m.phase}`; }
      }
      r.last = { x: c.x, y: c.y, z: c.z };
    }
  }
  // 2.5 m in one frame at 30 fps is 75 m/s — a cut, not a camera move
  assert.ok(worstJump < 2.5, `largest frame-to-frame move ${worstJump.toFixed(2)} m (${worstAt})`);
  assert.ok(phases.has('play') && phases.size >= 3, `the match went through set pieces too: ${[...phases].join(', ')}`);
});
