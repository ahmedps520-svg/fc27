/**
 * v200 — movement the eye reads (render only; the match is untouched): the
 * head follows the ball (rig.js updateLook) within a human range, lets the
 * body come round for a ball behind, and is fixed on the ball he has; the
 * body leans into a burst and back against a hard stop (updateBank's surge);
 * and the pose turns the head, hair and face by the look.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
import * as THREE from '../../js/vendor/three.module.js';
import { updateLook, updateBank, buildPlayer, posePlayer } from '../../js/game/rig.js';

const settle = (fn, secs = 2) => { let v; for (let i = 0; i < secs * 60; i++) v = fn(1 / 60); return v; };
const player = (o = {}) => ({ x: 50, y: 30, vx: 0, vy: 0, dirX: 1, dirY: 0, ...o });

test('the head finds the ball: to his left is positive, capped near 70°, a ball behind is left to the body', () => {
  const p = player();
  const ball = { x: 60, y: 40 };                         // 45° to his left
  assert.ok(Math.abs(settle((dt) => updateLook(p, ball, dt)) - Math.PI / 4) < 0.02);
  const q = player();
  assert.ok(settle((dt) => updateLook(q, { x: 50, y: 10 }, dt)) < -1.15, 'to his right, as far as a neck goes');
  assert.ok(settle((dt) => updateLook(q, { x: 50, y: 10 }, dt)) >= -1.2 - 1e-9);
  const r = player();
  assert.ok(Math.abs(settle((dt) => updateLook(r, { x: 30, y: 31 }, dt))) < 0.01, 'behind him: no craning');
  // smoothed: one frame moves part of the way, not all of it
  const s = player();
  const one = updateLook(s, ball, 1 / 60);
  assert.ok(one > 0 && one < Math.PI / 4 * 0.2, `${one}`);
  // the ball at his feet, a fall, a dive, a celebration: eyes front
  const own = player(); const b2 = { x: 60, y: 40 }; b2.owner = own;
  assert.ok(Math.abs(settle((dt) => updateLook(own, b2, dt))) < 0.01);
  for (const k of [{ downT: 1 }, { diveT: 0.5 }, { celebrating: true }]) {
    const t = player(k);
    assert.ok(Math.abs(settle((dt) => updateLook(t, ball, dt))) < 0.01, JSON.stringify(k));
  }
});

test('the body leans into a burst and back against a hard stop', () => {
  const p = player();
  for (let i = 0; i < 30; i++) { p.vx = Math.min(8, p.vx + 8 / 30); updateBank(p, 1 / 60); }
  assert.ok(p._surge > 0.02, `driving off: ${p._surge}`);
  for (let i = 0; i < 60; i++) updateBank(p, 1 / 60);        // cruising
  assert.ok(Math.abs(p._surge) < 0.01, `steady: ${p._surge}`);
  for (let i = 0; i < 20; i++) { p.vx = Math.max(0, p.vx - 8 / 20); updateBank(p, 1 / 60); }
  assert.ok(p._surge < -0.02, `braking: ${p._surge}`);
  assert.ok(Math.abs(p._surge) <= 0.06);
});

test('the pose turns the head, the hair and the face by the look, and leaves the hips alone', () => {
  const rig = buildPlayer(new THREE.Color(0xd7263d), new THREE.Color(0x151515), new THREE.Color(0xc99a74), new THREE.Color(0x1d140d), new THREE.Color(0xd7263d), { height: 1, girth: 1, shoulders: 1 }, { face: true });
  const p = player();
  posePlayer(rig, p, 0, true); posePlayer(rig, p, 0, true);      // the first pose settles the figure's own state
  const head0 = rig.parts.head.rotation.z; const hips0 = rig.parts.hips.quaternion.clone();
  p._look = 0.8;
  posePlayer(rig, p, 0, true);
  assert.ok(Math.abs(rig.parts.head.rotation.z - head0 - 0.8) < 1e-9, 'the head turns by the look');
  assert.ok(Math.abs(rig.parts.hair.rotation.z - head0 - 0.8) < 1e-9, 'the hair with it');
  // the eyes move round to the new facing
  const ex = rig.parts.eyeL.position.x - rig.parts.head.position.x; const ey = rig.parts.eyeL.position.y - rig.parts.head.position.y;
  assert.ok(ey > 0.04, `eyes towards his left (${ex.toFixed(3)}, ${ey.toFixed(3)})`);
  assert.ok(rig.parts.hips.quaternion.angleTo(hips0) < 1e-6, 'the hips do not');
});

test('a ball off the post or the bar is handed to the renderer to shake the frame; the bounce is the same', async () => {
  const { Match, PITCH, GOAL_HALF, GOAL_HEIGHT } = await import('../../js/game/sim.js');
  const { WORLD } = await import('../../js/data/generator.js');
  const CY = PITCH.h / 2;
  const strike = (setup) => {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
    m.phase = 'play'; m.banner = '';
    for (const t of m.teams) for (const p of t.players) { p.x = PITCH.w / 2; p.y = CY; }     // nobody near the goal
    Object.assign(m.ball, { owner: null, lastTouch: null, inNet: null, curl: 0, noTouch: 1 }, setup);
    for (let i = 0; i < 20 && !m.frameHit; i++) m.update(1 / 60);
    return m;
  };
  const post = strike({ x: 1.2, y: CY + GOAL_HALF, z: 1, vx: -25, vy: 0, vz: 0 });
  assert.ok(post.frameHit, 'the post');
  assert.equal(post.frameHit.gx, 0); assert.ok(post.frameHit.speed > 10); assert.ok(!post.frameHit.bar);
  assert.ok(post.ball.vx > 0, 'and the ball came back off it');
  const bar = strike({ x: PITCH.w - 1.2, y: CY, z: GOAL_HEIGHT, vx: 25, vy: 0, vz: 0 });
  assert.ok(bar.frameHit?.bar, 'the bar');
  assert.equal(bar.frameHit.gx, PITCH.w);
});
