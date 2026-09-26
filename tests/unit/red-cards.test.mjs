/**
 * v134 — red cards: a second yellow, denying a clear chance, serious foul
 * play; the man leaves and his side reshapes a man short.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');

const fresh = () => { const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 }); m.phase = 'play'; return m; };

test('a second yellow is a red: he is parked off the pitch and his side is a man short', () => {
  const m = fresh();
  const p = m.teams[1].players.find((q) => q.role === 'DEF');
  m.book(p);
  assert.equal(p.cards, 1); assert.ok(!p.sentOff);
  m.book(p);
  assert.ok(p.sentOff && p.parked, 'off');
  assert.equal(m.reds[1], 1);
  const last = m.bookings[m.bookings.length - 1];
  assert.ok(last.red && last.why === 'second yellow');
  m.update(1 / 60);
  assert.ok(p.x < -100, 'he is not on the grass');
  assert.equal(m.teams[1].down, 1);
});

test('a defender off: the nearest midfielder drops into his slot and his job', () => {
  const m = fresh();
  const team = m.teams[0];
  const def = team.players.find((q) => q.role === 'DEF');
  const slot = { sx: def.sx, sy: def.sy };
  const mids = team.players.filter((q) => q.role === 'MID').length;
  m.sendOff(def, 'serious foul play');
  const cover = team.players.find((q) => !q.parked && q.sx === slot.sx && q.sy === slot.sy);
  assert.ok(cover && cover.role === 'DEF', 'someone has his slot');
  assert.equal(team.players.filter((q) => q.role === 'MID' && !q.parked).length, mids - 1);
});

test('keepers are never sent off; a sent-off man is never a taker, never substituted, never switched to', () => {
  const m = fresh();
  const gk = m.teams[0].players.find((q) => q.role === 'GK');
  m.sendOff(gk, 'denied a goal-scoring chance');
  assert.ok(!gk.sentOff);
  const st = m.teams[0].players.find((q) => q.role === 'FWD');
  m.sendOff(st, 'serious foul play');
  assert.equal(m.substitute(0, m.teams[0].players.indexOf(st), 0), false);
  m.resetPositions(0);
  assert.notEqual(m.kickoffTaker, st);
});

test('denying a clear chance: through on goal with nobody covering, yes; a defender goal-side, no', () => {
  const m = fresh();
  const atk = m.teams[0]; const def = m.teams[1];
  const goalX = atk.dir > 0 ? PITCH.w : 0;
  const v = atk.players.find((q) => q.role === 'FWD');
  const o = def.players.find((q) => q.role === 'DEF');
  // everyone else in defence well behind the play
  for (const q of def.players) if (q !== o && q.role !== 'GK') { q.x = goalX - atk.dir * 60; q.y = CY; }
  v.x = goalX - atk.dir * 24; v.y = CY; v.vx = atk.dir * 6; v.vy = 0;
  o.x = v.x - atk.dir * 1; o.y = CY + 1;
  assert.equal(m.deniedChance(v, o), true);
  const cover = def.players.find((q) => q !== o && q.role === 'DEF');
  cover.x = goalX - atk.dir * 10; cover.y = CY + 3;
  assert.equal(m.deniedChance(v, o), false, 'a covering defender');
  cover.x = goalX - atk.dir * 60;
  v.vx = -atk.dir * 3;
  assert.equal(m.deniedChance(v, o), false, 'going away from goal');
});
