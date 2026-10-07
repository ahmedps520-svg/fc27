/**
 * v178 — a tip over the bar is read off the ball (like kicks and headers): a
 * high ball near a keeper suddenly climbing gives him a flung-up arm.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { detectKicks, tipArm, TIP_DUR } = await import('../../js/game/kick.js');

const scene = (vzAfter) => {
  const gk = { role: 'GK', x: 102, y: 35, dirX: -1, dirY: 0, diveT: 0 };
  const def = { role: 'DEF', x: 90, y: 30, dirX: 1, dirY: 0 };
  const m = { ball: { owner: null, x: 102.5, y: 36, z: 2.2, vx: 20, vy: 0, vz: -1 }, teams: [{ players: [def] }, { players: [gk] }] };
  const st = {};
  detectKicks(m, 1 / 60, st);
  Object.assign(m.ball, { vx: -3, vz: vzAfter });
  detectKicks(m, 1 / 60, st);
  return gk;
};

test('a high ball climbing off a keeper is a tip: his arm goes up and comes down', () => {
  const gk = scene(7);
  assert.ok(gk._tip, 'tip detected');
  const mid = tipArm({ t: TIP_DUR * 0.35 });
  assert.ok(mid.up > 0.9, `up ${mid.up}`);
  assert.equal(tipArm({ t: TIP_DUR }), null);
});

test('a high ball that does not climb is not a tip', () => {
  assert.equal(scene(-2)._tip, undefined);
});
