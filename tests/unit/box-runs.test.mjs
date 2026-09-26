/**
 * v133 — CPU attackers attack the box on crosses: near post, far post, spot.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');

function wideCarrier() {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  m.phase = 'play';
  const team = m.teams[0];
  const goalX = team.dir > 0 ? PITCH.w : 0;
  const c = team.players.find((p) => p.role === 'MID');
  c.x = goalX - team.dir * 18; c.y = 6;
  m.ball.owner = c; m.ball.x = c.x; m.ball.y = c.y;
  // the attack has pushed up: forwards and midfielders 20-30 m out, spread across
  team.players.filter((p) => p !== c && (p.role === 'FWD' || p.role === 'MID')).forEach((p, i) => { p.x = goalX - team.dir * (20 + (i % 3) * 5); p.y = 14 + i * 7; });
  return { m, team, c, goalX };
}

test('with a team-mate wide in the crossing zone, three men are sent to the near post, far post and spot', () => {
  const { m, c, goalX, team } = wideCarrier();
  m.supporters = [[team.players.find((p) => p !== c && p.role !== 'GK'), null], null];
  const runs = m.pickBoxRuns(c, 1 / 60);
  assert.ok(runs && runs.size === 3, `runs: ${runs?.size}`);
  const tags = [...runs.values()].map((s) => s.tag).sort();
  assert.deepEqual(tags, ['far', 'near', 'spot']);
  for (const [q, s] of runs) {
    assert.ok(q !== c && q.role !== 'GK' && q.role !== 'DEF');
    assert.ok(Math.abs(s.x - goalX) < 12, `${s.tag} is in the box`);
  }
  const near = [...runs.values()].find((s) => s.tag === 'near');
  const far = [...runs.values()].find((s) => s.tag === 'far');
  assert.ok(Math.abs(near.y - c.y) < Math.abs(far.y - c.y), 'the near post is on the ball side');
  assert.ok(!runs.has(m.supporters[0][0]), 'the carrier keeps his short option');
});

test('no runs from midfield or from the middle of the pitch', () => {
  const { m, c, team, goalX } = wideCarrier();
  c.x = goalX - team.dir * 50;
  assert.equal(m.pickBoxRuns(c, 1 / 60), null, 'too far out');
  c.x = goalX - team.dir * 18; c.y = CY;
  m.teams[0].boxRun = null;
  assert.equal(m.pickBoxRuns(c, 1 / 60), null, 'central: a shot or a pass, not a cross');
});
