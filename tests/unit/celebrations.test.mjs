/**
 * v110 (backlog #15): goal celebrations. Sixteen, each a pose both figures
 * can take; a person's side does the one they picked, everyone else picks by
 * who they are — never Math.random, so the balance sweep's dice never move.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { CELEBRATIONS, celebPose, pickCelebration, armDirs } = await import('../../js/game/celebrations.js');
const { Match, setField } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

test('sixteen celebrations, unique ids, names and blurbs', () => {
  assert.ok(CELEBRATIONS.length >= 15);
  assert.equal(new Set(CELEBRATIONS.map((c) => c.id)).size, CELEBRATIONS.length);
  for (const c of CELEBRATIONS) assert.ok(c.name && c.blurb, c.id);
});

test('every pose is finite at every moment, running in or arrived', () => {
  for (const c of CELEBRATIONS) {
    for (let t = 0; t < 4.2; t += 0.05) {
      for (const moving of [true, false]) {
        const P = celebPose(c.id, t, moving);
        for (const k of ['lift', 'lean', 'roll', 'spin', 'flip', 'kneel', 'belly', 'mouth']) assert.ok(Number.isFinite(P[k]), `${c.id} ${k} at ${t}`);
        for (const a of [P.armL, P.armR]) {
          const d = armDirs(a);
          for (const v of [d.upper, d.fore]) assert.ok(Math.abs(Math.hypot(...v) - 1) < 1e-6, `${c.id} arm is a unit direction`);
        }
        assert.ok(P.lift >= 0 && P.lift < 1.2 && P.kneel >= 0 && P.kneel <= 1 && P.belly >= 0 && P.belly <= 1);
      }
    }
  }
});

test('a pick is the person’s own, or the same every time for the same scorer and goal count', () => {
  assert.equal(pickCelebration('backflip', 'x', 0), 'backflip');
  assert.equal(pickCelebration('random', 'p123', 2), pickCelebration('random', 'p123', 2));
  assert.equal(pickCelebration('nonsense', 'p123', 2), pickCelebration(null, 'p123', 2));
  const seen = new Set(); for (let i = 0; i < 200; i++) seen.add(pickCelebration(null, `player${i}`, i));
  assert.ok(seen.size >= 12, `the CPU's scorers use most of them (${seen.size})`);
});

test('the scorer celebrates their own way; the person’s side does the picked one; no dice are thrown', () => {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0, celebration: 'shush' });
  const mine = m.teams[0].players[9]; const theirs = m.teams[1].players[9];
  const draw0 = Math.random; let calls = 0; Math.random = () => { calls++; return draw0(); };
  try {
    m.phase = 'play'; m.ball.lastTouch = mine; m.scoreGoal(0);
    const a = calls;
    m.phase = 'play'; m.ball.lastTouch = theirs; m.scoreGoal(1);
    assert.equal(mine.celebKind, 'shush');
    assert.ok(CELEBRATIONS.some((c) => c.id === theirs.celebKind), theirs.celebKind);
    // the pick itself throws no dice: a match with no choice set draws exactly as many
    const n = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0 });
    calls = 0; n.phase = 'play'; n.ball.lastTouch = n.teams[0].players[9]; n.scoreGoal(0);
    assert.equal(calls, a);
  } finally { Math.random = draw0; }
});
