/**
 * v145 — keeper distribution: rolled short, thrown to a man further off,
 * punted or drop-kicked long from the hands, kicked off the grass after a goal
 * kick or a back pass.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH, TUNE } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');

function keeperWithBall(hands, mateAt) {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.phase = 'play';
  const team = m.teams[0]; const gk = team.players.find((p) => p.role === 'GK');
  const own = team.dir > 0 ? 0 : PITCH.w;
  gk.x = own + team.dir * 8; gk.y = CY; gk.dirX = team.dir; gk.dirY = 0;
  // everyone far away, opponents deep in their own half
  for (const t of m.teams) for (const p of t.players) if (p !== gk && p.role !== 'GK') { p.x = PITCH.w / 2 + team.dir * (t === team ? 10 : 30); p.y = 4; }
  const mate = team.players.find((p) => p.role === 'DEF');
  if (mateAt) { mate.x = gk.x + team.dir * mateAt; mate.y = CY + 8; }
  m.ball.owner = gk; gk.inHands = hands;
  return { m, gk, mate, team };
}

test('from his hands, a free man 25 m off gets it thrown: from shoulder height, landing near him', () => {
  const real = Math.random; Math.random = () => 0.1;
  try {
    const { m, gk, mate } = keeperWithBall(true, 25);
    m.distribute(gk);
    assert.equal(m.ball.gkKind, 'throw');
    assert.ok(m.ball.z > 1.5);
    // fly it: the first bounce is within a few metres of him
    const b = m.ball; let land = null;
    for (let i = 0; i < 120 && !land; i++) { const z = b.z; m.updateBall(1 / 60); if (z > 0.2 && b.z <= 0.05) land = { x: b.x, y: b.y }; if (b.owner) break; }
    const at = land || b;
    assert.ok(Math.hypot(at.x - mate.x, at.y - mate.y) < 4, `landed ${Math.hypot(at.x - mate.x, at.y - mate.y).toFixed(1)} m from him`);
  } finally { Math.random = real; }
});

test('from his hands with nobody free, it goes long and high — a punt or a drop-kick', () => {
  const real = Math.random; Math.random = () => 0.9;
  try {
    const { m, gk, team } = keeperWithBall(true, 0);
    const x0 = gk.x;
    m.distribute(gk);
    assert.ok(['punt', 'dropkick'].includes(m.ball.gkKind), m.ball.gkKind);
    assert.ok(m.ball.vz > 5, 'up in the air');
    for (let i = 0; i < 200 && m.ball.z > 0; i++) m.updateBall(1 / 60);
    assert.ok((m.ball.x - x0) * team.dir > 35, `travelled ${((m.ball.x - x0) * team.dir).toFixed(0)} m`);
  } finally { Math.random = real; }
});

test('off the grass (a goal kick, or a back pass) he never throws it', () => {
  const real = Math.random; Math.random = () => 0.1;
  try {
    const { m, gk } = keeperWithBall(false, 25);
    m.distribute(gk);
    assert.ok(['pass', 'kick'].includes(m.ball.gkKind), m.ball.gkKind);
  } finally { Math.random = real; }
  assert.equal(TUNE.keeperDist, true);
});
