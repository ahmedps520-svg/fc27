/**
 * v103 (backlog #21): team-mates offer themselves, and the ball goes to the
 * man who is open. tools/support-audit.mjs has the match-scale numbers (pass
 * completion 57.6% → 62.1% over 40 seeded matches); these hold the two
 * mechanisms on a still picture.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { Match, PITCH, setField } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

function scene() {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 600 });
  m.phase = 'play'; m.isOffside = () => false;
  for (const t of m.teams) for (const [i, q] of t.players.entries()) { q.x = t === m.teams[0] ? 5 + i : PITCH.w - 5 - i; q.y = 3 + i * 3; q.vx = q.vy = 0; }
  const [us, them] = m.teams;
  const c = us.players[6]; c.x = 50; c.y = 34; c.dirX = us.dir; c.dirY = 0;
  m.ball.owner = c; m.ball.x = c.x; m.ball.y = c.y;
  return { m, us, them, c };
}

test('the pass goes to the open man, not the marked one beside him', () => {
  let open = 0;
  for (let k = 0; k < 20; k++) {
    const { m, us, them, c } = scene();
    const a = us.players[7]; a.x = c.x + us.dir * 15; a.y = 30;       // marked, lane cut
    const b = us.players[8]; b.x = c.x + us.dir * 15; b.y = 38;       // open
    const d1 = them.players[5]; d1.x = a.x - us.dir * 0.5; d1.y = a.y + 0.6;
    const d2 = them.players[6]; d2.x = c.x + us.dir * 7; d2.y = 31.8;
    let target = null;
    const real = m.release.bind(m); m.release = (p, vx, vy) => { target = vy > 0 ? 'b' : 'a'; return real(p, vx, vy); };
    m.pass(c, { x: us.dir, y: 0 }, false, 0.5);
    if (target === 'b') open += 1;
  }
  assert.ok(open >= 18, `the open man got it ${open}/20 times`);
});

test('manual pass assist still sends it where it was aimed', () => {
  const { m, us, them, c } = scene();
  const a = us.players[7]; a.x = c.x + us.dir * 15; a.y = 34;          // dead ahead, marked
  const b = us.players[8]; b.x = c.x + us.dir * 15; b.y = 42;          // open, off the line
  const d = them.players[5]; d.x = a.x; d.y = a.y + 0.8;
  m.controllers = [{ team: 0, activeIdx: us.players.indexOf(c) }];
  let vyOut = null; const real = m.release.bind(m); m.release = (p, vx, vy) => { vyOut = vy; return real(p, vx, vy); };
  m.pass(c, { x: us.dir, y: 0 }, false, 0.5, false, 0);
  assert.ok(Math.abs(vyOut) < 1.5, 'straight ahead, to the man the stick pointed at');
});

test('a supporter moves to a spot with a clear lane from the carrier', () => {
  const { m, us, them, c } = scene();
  const s = us.players[7]; s.x = c.x + us.dir * 10; s.y = 34;
  // a wall of defenders straight ahead of the carrier
  for (const [i, o] of them.players.slice(1, 5).entries()) { o.x = c.x + us.dir * 5; o.y = 32 + i * 1.3; }
  const spot = m.supportSpot(s, c, { x: s.x, y: s.y }, null);
  const vx = spot.x - c.x; const vy = spot.y - c.y; const L = vx * vx + vy * vy;
  let lane = 99;
  for (const o of them.players) { const u = Math.max(0, Math.min(1, ((o.x - c.x) * vx + (o.y - c.y) * vy) / L)); lane = Math.min(lane, Math.hypot(c.x + vx * u - o.x, c.y + vy * u - o.y)); }
  assert.ok(lane > 2.2, `the lane to the chosen spot is ${lane.toFixed(1)} m clear`);
});
