/**
 * v113 (backlog #15): the advantage rule. A foul on a man breaking forward in
 * the other half, out of shooting range and with nobody else on him, is
 * played on; if his side loses the ball within 2.5 s the free kick comes back
 * to where the foul was. Measured over 480 seeded AI matches: goals level
 * (2.15 → 2.05 on one set of dice, 2.03 → 2.18 on another), a free kick and
 * a stoppage fewer a match; the sweep goldens were re-recorded for it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { Match, PITCH, setField } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

function scene({ x = 70, vx = 6, crowd = false } = {}) {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: null });
  m.phase = 'play';
  const atk = m.teams[0]; const dir = atk.dir;
  for (const t of m.teams) for (const q of t.players) { q.x = t === atk ? (dir > 0 ? 10 : PITCH.w - 10) : (dir > 0 ? 20 : PITCH.w - 20); q.y = 5 + t.players.indexOf(q) * 5; q.vx = q.vy = 0; }
  const carrier = atk.players[9]; const off = m.teams[1].players[5];
  carrier.x = dir > 0 ? x : PITCH.w - x; carrier.y = 20; carrier.vx = vx * dir; carrier.vy = 0;
  off.x = carrier.x - dir * 2; off.y = 20;
  if (crowd) { const q = m.teams[1].players[6]; q.x = carrier.x + dir * 3; q.y = 21; }
  m.ball.owner = carrier; m.ball.x = carrier.x; m.ball.y = carrier.y;
  return { m, carrier, off, dir };
}

test('who gets advantage: breaking, in the other half, out of shooting range, nobody else on him', () => {
  const a = scene(); assert.equal(a.m.advantageFor(a.carrier, a.off), true);
  const own = scene({ x: 40 }); assert.equal(own.m.advantageFor(own.carrier, own.off), false, 'own half: free kick');
  const range = scene({ x: 80 }); assert.equal(range.m.advantageFor(range.carrier, range.off), false, 'within 30 m of goal: the free kick is the chance');
  const slow = scene({ vx: 1 }); assert.equal(slow.m.advantageFor(slow.carrier, slow.off), false, 'not going anywhere');
  const busy = scene({ crowd: true }); assert.equal(busy.m.advantageFor(busy.carrier, busy.off), false, 'another man on him');
});

test('advantage lost: the free kick comes back to the spot, to the side that was fouled', () => {
  const { m, carrier, off } = scene();
  m.advantage = { team: 0, x: carrier.x, y: carrier.y, offender: off, t: 2.5 };
  const spot = { x: carrier.x, y: carrier.y };
  m.ball.owner = m.teams[1].players[2];             // they win it back
  m.updateAdvantage(1 / 60);
  assert.equal(m.phase, 'freekick');
  assert.equal(m.setPiece.team, 0);
  assert.ok(Math.abs(m.ball.x - spot.x) < 0.01 && Math.abs(m.ball.y - spot.y) < 0.01);
  assert.equal(m.advantage, null);
});

test('advantage played: after 2.5 s it is over, and a stoppage ends it at once', () => {
  const { m, carrier, off } = scene();
  m.advantage = { team: 0, x: carrier.x, y: carrier.y, offender: off, t: 2.5 };
  for (let i = 0; i < 160; i++) m.updateAdvantage(1 / 60);
  assert.equal(m.advantage, null); assert.equal(m.phase, 'play');
  m.advantage = { team: 0, x: carrier.x, y: carrier.y, offender: off, t: 2.5 };
  m.markStoppage('throwin');
  assert.equal(m.advantage, null);
});

test('the offender cannot have another go while it runs', () => {
  const { m, carrier, off } = scene();
  m.advantage = { team: 0, x: carrier.x, y: carrier.y, offender: off, t: 2.5 };
  off.x = carrier.x; off.y = carrier.y + 0.5;
  const r = Math.random; Math.random = () => 0;       // a tackle that would always win
  try { m.tackle(off); } finally { Math.random = r; }
  assert.equal(m.ball.owner, carrier);
});
