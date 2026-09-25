/**
 * v109 (backlog #15): the set-piece aim guide. A person's dead ball shows
 * where the stick points and, when the kick can be a shot, where on the goal
 * line it is aimed and how far it can stray — the same spread the strike is
 * then drawn from. Nothing here is read by the CPU's own set pieces (the
 * sweep stays identical).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { Match, PITCH, GOAL_HALF, setField } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

function penalty(human = 0) {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human });
  m.awardPenalty(0, 1);
  if (!m.setPiece) m.setPiece = m.beginSetPiece('penalty', 0, m.teams[0].players[9], 1);
  return m;
}

test('no guide without a person taking it', () => {
  const m = penalty(null);
  if (m.setPiece) m.setPiece.human = false;
  assert.equal(m.setPieceGuide(), null);
});

test('a penalty: the target follows the stick across the goal, inside the posts', () => {
  const m = penalty();
  const sp = m.setPiece; assert.ok(sp?.human, 'the person takes it');
  const CY = PITCH.h / 2;
  sp.aim = { x: m.teams[0].dir, y: 0 };
  const mid = m.setPieceGuide().goal;
  assert.ok(Math.abs(mid.y - CY) < 1e-9, 'straight is the middle');
  sp.aim = { x: m.teams[0].dir, y: 0.7 };
  const right = m.setPieceGuide().goal;
  assert.ok(right.y > CY + 1 && right.y <= CY + GOAL_HALF, `aimed at ${right.y.toFixed(2)}`);
  assert.ok(right.spread > 0 && right.spread < GOAL_HALF * 2, `spread ${right.spread.toFixed(2)} m`);
});

test('more power on the hold narrows the spread; a better finisher is truer', () => {
  const m = penalty(); const sp = m.setPiece;
  sp.aim = { x: m.teams[0].dir, y: 0.6 };
  sp.charge = 0.4; const soft = m.setPieceGuide().goal.spread;
  sp.charge = 0.95; const hard = m.setPieceGuide().goal.spread;
  assert.ok(hard < soft, `${hard.toFixed(3)} < ${soft.toFixed(3)}`);
  const stats = sp.taker.ref.stats; const was = stats.shooting;
  stats.shooting = 95; const good = m.setPieceGuide().goal.spread;
  stats.shooting = 55; const poor = m.setPieceGuide().goal.spread;
  stats.shooting = was;
  assert.ok(good < poor);
});

test('a free kick from deep is an arrow, not a shot; the arrow grows with the hold', () => {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0 });
  const taker = m.teams[0].players[6];
  m.ball.x = m.teams[0].dir > 0 ? 30 : PITCH.w - 30; m.ball.y = PITCH.h / 2;
  m.setPiece = m.beginSetPiece('freekick', 0, taker, 1);
  const g0 = m.setPieceGuide();
  assert.equal(g0.goal, null);
  m.setPiece.charge = 0.8;
  assert.ok(m.setPieceGuide().len > g0.len);
  // within range it is a shot as well
  m.ball.x = m.teams[0].dir > 0 ? PITCH.w - 22 : 22;
  assert.ok(m.setPieceGuide().goal, 'a free kick at 22 m can be a shot');
});

test('the arrow of a shot runs to the target on the goal line', () => {
  const m = penalty(); const sp = m.setPiece;
  sp.aim = { x: m.teams[0].dir, y: 0.7 };
  const g = m.setPieceGuide();
  assert.ok(g.shot);
  const endX = g.x + g.dir.x * g.len; const endY = g.y + g.dir.y * g.len;
  assert.ok(Math.abs(endX - g.goal.x) < 1e-6 && Math.abs(endY - g.goal.y) < 1e-6);
});
