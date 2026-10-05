/**
 * v144–v146: what the renderer reads off the ball and the sim for the figures —
 * kicks, a keeper's throw, headers — and the tackle pose.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectKicks, tacklePose, headerPose, kickFoot, HEADER_DUR } from '../../js/game/kick.js';

const world = (ball, players) => ({ ball: { owner: null, z: 0, vx: 0, vy: 0, vz: 0, ...ball }, teams: [{ players }, { players: [] }] });
const man = (o = {}) => ({ x: 0, y: 0, dirX: 1, dirY: 0, role: 'MID', ref: { foot: 'R' }, ...o });

test('a ball struck away from a man\'s feet is his kick', () => {
  const p = man(); const m = world({ x: 0.8, y: 0 }, [p]); const st = {};
  detectKicks(m, 1 / 60, st);
  m.ball.vx = 20; m.ball.x = 1.2;
  assert.equal(detectKicks(m, 1 / 60, st), p);
  assert.ok(p._kick && kickFoot(p._kick));
});

test('a dribble touch is not a kick', () => {
  const p = man(); const m = world({ x: 0.8, y: 0, vx: 5 }, [p]); const st = {};
  detectKicks(m, 1 / 60, st);
  m.ball.vx = 7.5;
  assert.equal(detectKicks(m, 1 / 60, st), null);
});

test('a ball leaving at shoulder height by a keeper is a throw; by anyone else it is not a kick', () => {
  const gk = man({ role: 'GK' }); const m = world({ x: 0.5, y: 0, z: 1.8 }, [gk]); const st = {};
  detectKicks(m, 1 / 60, st); m.ball.vx = 15;
  assert.equal(detectKicks(m, 1 / 60, st), gk);
  assert.ok(gk._throw && !gk._kick);
});

test('a ball turned sharply at head height next to a man is his header, and he jumps for it', () => {
  const p = man(); const m = world({ x: 0.4, y: 0, z: 2.1, vx: -12, vz: -2 }, [p]); const st = {};
  detectKicks(m, 1 / 60, st);
  m.ball.vx = 9; m.ball.vz = 1;
  assert.equal(detectKicks(m, 1 / 60, st), p);
  const h = headerPose(p._header);
  assert.ok(h.hop > 0.1, `off the ground (${h.hop.toFixed(2)} m)`);
  assert.equal(headerPose({ t: HEADER_DUR, rise: 0.3 }), null);
});

test('a slide goes to the grass, a standing tackle is a lunge', () => {
  const slide = tacklePose({ slide: 0.6, slideMax: 0.8, ref: { foot: 'R' } });
  const lunge = tacklePose({ slide: 0.3, slideMax: 0.42, ref: { foot: 'L' } });
  assert.ok(slide.full && slide.drop > 0.4 && slide.lean < 0);
  assert.ok(!lunge.full && lunge.drop < 0.2 && lunge.lead === -1);
  assert.equal(tacklePose({ slide: 0 }), null);
});
