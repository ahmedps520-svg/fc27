/**
 * v143 — the weather plays: rain is quick, snow holds the ball up, wind moves
 * a ball in the air. Clear weather (and no venue at all) is the game as it was.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');
const { atmosphereFor, conditionsNote } = await import('../../js/data/stadiums.js');


/** Roll a ball along the ground from the centre spot with nobody near it; how far does it go? */
function roll(atmo, v = 15) {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.phase = 'play';
  if (atmo) m.venue = { atmo };
  for (const t of m.teams) for (const p of t.players) { p.x = 5; p.y = 3; p.touchLock = 99; }
  const b = m.ball; b.owner = null; b.x = PITCH.w / 2 - 30; b.y = CY; b.z = 0; b.vx = v; b.vy = 0; b.vz = 0;
  for (let i = 0; i < 600 && Math.hypot(b.vx, b.vy) > 0; i++) m.updateBall(1 / 60);
  return { dist: b.x - (PITCH.w / 2 - 30), m };
}

test('no venue and a clear day roll the ball the same distance', () => {
  assert.equal(roll(null).dist, roll({ weather: 'clear', wind: { x: 0, y: 0 } }).dist);
});

test('rain runs a ball on further, snow stops it sooner', () => {
  const clear = roll({ weather: 'clear' }).dist; const rain = roll({ weather: 'rain' }).dist; const snow = roll({ weather: 'snow' }).dist;
  assert.ok(rain > clear * 1.05, `rain ${rain.toFixed(1)} vs clear ${clear.toFixed(1)}`);
  assert.ok(snow < clear * 0.85, `snow ${snow.toFixed(1)} vs clear ${clear.toFixed(1)}`);
});

test('the weather turning mid-match changes the pitch from that minute', () => {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.venue = { atmo: { weather: 'clear', change: { minute: 45, to: 'rain' } } };
  const dry = m.surface().drag;
  m.t = m.duration * 0.6;
  assert.ok(m.surface().drag > dry, 'wetter, quicker after the change');
});

test('wind carries a ball in the air, not one on the ground', () => {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.phase = 'play'; m.venue = { atmo: { weather: 'clear', wind: { x: 0, y: 5 } } };
  for (const t of m.teams) for (const p of t.players) { p.x = 5; p.y = 3; p.touchLock = 99; }
  const b = m.ball; b.owner = null; b.x = 30; b.y = CY; b.z = 1; b.vx = 20; b.vy = 0; b.vz = 9;
  for (let i = 0; i < 60; i++) m.updateBall(1 / 60);
  assert.ok(b.y - CY > 0.2, `blown ${(b.y - CY).toFixed(2)} m sideways`);
  const { m: g } = roll({ weather: 'clear', wind: { x: 0, y: 5 } });
  assert.equal(g.ball.y, CY, 'a ball on the ground is not');
});

test('every match has a seeded wind, mostly light, and the loading card says when the conditions matter', () => {
  const a = atmosphereFor('fixture-1'); const b = atmosphereFor('fixture-1');
  assert.deepEqual(a.wind, b.wind);
  const speeds = Array.from({ length: 300 }, (_, i) => atmosphereFor(`f${i}`).wind.speed).sort((x, y) => x - y);
  assert.ok(speeds[150] < 2.5 && speeds[299] <= 6);
  assert.match(conditionsNote({ weather: 'rain', wind: { speed: 0 } }), /skids/);
  assert.match(conditionsNote({ weather: 'clear', wind: { speed: 4 } }), /Wind/);
  assert.equal(conditionsNote({ weather: 'clear', wind: { speed: 1 } }), '');
});
