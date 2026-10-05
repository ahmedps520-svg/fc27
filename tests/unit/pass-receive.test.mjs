/**
 * v142 — a pass is played to someone: he goes to meet it, his team-mates leave
 * it to him, and the CPU does not play it into a defender standing in the lane.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');

function setup() {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.phase = 'play';
  const team = m.teams[0];
  const [a, r] = team.players.filter((p) => p.role === 'MID');
  // everyone else well out of the way
  for (const t of m.teams) for (const p of t.players) if (p !== a && p !== r && p.role !== 'GK') { p.x = PITCH.w / 2 + (t === team ? -30 : 30) * team.dir; p.y = 4 + Math.random() * 3; }
  a.x = PITCH.w / 2; a.y = CY; a.dirX = team.dir; a.dirY = 0;
  r.x = a.x + team.dir * 18; r.y = CY + 8; r.vx = team.dir * 6; r.vy = 0;   // running away up the pitch
  m.ball.owner = a; m.ball.x = a.x; m.ball.y = a.y;
  return { m, team, a, r };
}

test('the man a pass is meant for is the pass target until somebody touches it', () => {
  const { m, a, r } = setup();
  m.pass(a, { x: r.x - a.x, y: r.y - a.y }, false, 0.4);
  assert.equal(m.passTarget(), r);
  m.ball.lastTouch = m.teams[1].players[3];
  assert.equal(m.passTarget(), null, 'touched by someone else: a loose ball');
});

test('he comes to meet the ball on its path instead of carrying on with his run', () => {
  const { m, a, r } = setup();
  m.pass(a, { x: r.x - a.x, y: r.y - a.y }, false, 0.4);
  const mp = m.meetPoint(r);
  const b = m.ball; const s = Math.hypot(b.vx, b.vy);
  // the meeting point lies on the ball's line
  const cross = ((mp.x - b.x) * b.vy - (mp.y - b.y) * b.vx) / s;
  assert.ok(Math.abs(cross) < 0.3, `off the line by ${cross.toFixed(2)} m`);
  // he was running away up the pitch; within half a second he has turned back towards it
  for (let i = 0; i < 30; i++) m.update(1 / 60);
  assert.ok(m.ball.owner === r || r.vx * m.teams[0].dir < 0, `still running away (vx ${r.vx.toFixed(2)})`);
  for (let i = 0; i < 120 && !m.ball.owner; i++) m.update(1 / 60);
  assert.equal(m.ball.owner, r);
});

test('a CPU passer sees a defender standing in the lane, and finds the open man instead', () => {
  const { m, team, a, r } = setup();
  const d = m.teams[1].players.find((p) => p.role === 'DEF');
  d.x = a.x + team.dir * 9; d.y = CY + 4;            // in the lane to r
  const blocked = m.pickPassTarget(a, team.dir, 0, false, 0.75, 1, 47, 2.6);
  assert.equal(blocked.best, r);
  assert.ok(blocked.lane < 1.7, `lane ${blocked.lane.toFixed(2)} m: the CPU holds this one and looks again`);
  const r2 = team.players.find((p) => p.role === 'FWD');
  r2.x = a.x + team.dir * 18; r2.y = CY - 8;        // the mirror image, with nobody in the way
  const open = m.pickPassTarget(a, team.dir, 0, false, 0.75, 1, 47, 2.6);
  assert.equal(open.best, r2, 'he finds the open man');
  assert.ok(open.lane > 3);
});
