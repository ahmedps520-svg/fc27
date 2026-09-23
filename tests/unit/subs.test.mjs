/**
 * v86 — once off, off. A substituted player cannot come back on: the CPU used
 * to bring an injured man off and, at the next injury, send him straight back
 * on (its pick is "best on the bench", and he was) — cured and with fresh legs.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { Match } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

test('a player who has come off cannot go back on', () => {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0 });
  const team = m.teams[0];
  const bi = team.bench.findIndex((r) => r && r.position !== 'GK');
  const pi = team.players.findIndex((p) => p.role !== 'GK');
  const going = team.players[pi].ref;
  assert.ok(m.substitute(0, pi, bi));
  assert.ok(m.cameOff(going.id));
  assert.equal(team.bench[bi], going, 'he takes the seat');
  const pj = team.players.findIndex((p, k) => k !== pi && p.role !== 'GK');
  assert.equal(m.substitute(0, pj, bi), false, 'and cannot come back on');
});

test('the CPU never sends an injured man back on', () => {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: null });
  const team = m.teams[1];
  const outfield = team.players.map((p, i) => [p, i]).filter(([p]) => p.role !== 'GK');
  const [a] = outfield[0]; const [b] = outfield[1];
  const hurtA = a.ref;
  a.injured = true; m.autoSubInjured(1);
  assert.notEqual(team.players[outfield[0][1]].ref, hurtA, 'the first injured man comes off');
  b.injured = true; m.autoSubInjured(1);
  assert.ok(!team.players.some((p) => p.ref === hurtA), 'and is not the one who replaces the second');
});
