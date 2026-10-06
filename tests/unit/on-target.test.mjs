/**
 * v172 — a keeper's touch makes a shot "on target" only when it was going in.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH, GOAL_HALF } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');

function shotAt(yAtLine) {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.phase = 'play';
  const att = m.teams[0]; const def = m.teams[1];
  const gx = att.dir > 0 ? PITCH.w : 0; const inw = att.dir;
  const striker = att.players.find((p) => p.role === 'FWD');
  const gk = def.players.find((p) => p.role === 'GK');
  for (const t of m.teams) for (const p of t.players) if (p !== gk) { p.x = PITCH.w / 2; p.y = 5; }
  // the ball 2 m out, 20 m/s straight at the line, crossing it at yAtLine; the keeper beside its path
  const b = m.ball;
  b.owner = null; b.x = gx - inw * 2; b.y = yAtLine; b.z = 0.6; b.vx = inw * 20; b.vy = 0; b.vz = 0; b.px = b.x; b.py = b.y; b.pz = b.z;
  b.shotBy = striker; b.lastTouch = striker;
  gk.x = b.x + inw * 0.4; gk.y = yAtLine - 0.6; gk.diveT = 0; gk.touchLock = 0;
  const before = att.onTarget;
  m.update(1 / 60);
  return { counted: att.onTarget - before, touched: b.shotBy === null || b.owner === gk };
}

test('a save from a shot going in is on target', () => {
  const r = shotAt(CY + 1);
  assert.ok(r.touched, 'the keeper got to it');
  assert.equal(r.counted, 1);
});

test('a keeper touching a ball already going wide does not make it on target', () => {
  const r = shotAt(CY + GOAL_HALF + 1.2);
  assert.ok(r.touched, 'the keeper got to it');
  assert.equal(r.counted, 0);
});
