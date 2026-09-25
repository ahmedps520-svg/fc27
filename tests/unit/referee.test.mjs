/**
 * v112 (backlog #15): the referee. Presentation only — moved from what the
 * match already knows — so the sim is untouched (the sweep checks that). He
 * keeps up with play off the ball, stays on the grass and off the players,
 * and shows a card when someone is booked.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { Match, PITCH, setField } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');
const { createReferee, updateReferee } = await import('../../js/game/referee.js');

function play(seconds, seed = 7) {
  setField('full');
  let a = seed; Math.random = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: null });
  const r = createReferee(m);
  const trace = [];
  for (let i = 0; i < seconds * 60; i++) { m.update(1 / 60); updateReferee(r, m, 1 / 60); if (i % 30 === 0) trace.push({ phase: m.phase, rx: r.x, ry: r.y, bx: m.ball.x, by: m.ball.y, near: Math.min(...m.teams.flatMap((t) => t.players.map((q) => Math.hypot(q.x - r.x, q.y - r.y)))) }); }
  return { m, r, trace };
}

test('he stays on the grass, keeps up with play, and keeps off the players', () => {
  const { trace } = play(120);
  const live = trace.filter((s) => s.phase === 'play').slice(4);
  for (const s of trace) assert.ok(s.rx >= 0.9 && s.rx <= PITCH.w - 0.9 && s.ry >= 0.4 && s.ry <= PITCH.h - 0.4, 'on the pitch');
  const off = live.map((s) => Math.hypot(s.rx - s.bx, s.ry - s.by)).sort((a, b) => a - b);
  const median = off[Math.floor(off.length / 2)];
  assert.ok(median > 6 && median < 28, `median distance from the ball ${median.toFixed(1)} m`);
  const close = live.filter((s) => s.near < 1.0).length / live.length;
  assert.ok(close < 0.08, `inside a metre of a player ${(close * 100).toFixed(1)}% of the time`);
});

test('a booking: he stops, faces the player and holds the card up, then plays on', () => {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: null });
  const r = createReferee(m);
  for (let i = 0; i < 60; i++) updateReferee(r, m, 1 / 60);
  const q = m.teams[1].players[5]; q.x = r.x + 10; q.y = r.y;
  m.bookings.push({ team: 1, name: q.ref.name, minute: 3 });
  for (let i = 0; i < 60; i++) updateReferee(r, m, 1 / 60);
  assert.ok(r.card && r.celebKind === 'refcard' && r.celebrating);
  assert.ok(r.dirX > 0.9, 'looking at the booked man');
  assert.ok(Math.hypot(r.vx, r.vy) < 0.5, 'standing still');
  for (let i = 0; i < 3 * 60; i++) updateReferee(r, m, 1 / 60);
  assert.equal(r.card, null); assert.equal(r.celebKind, null);
});
