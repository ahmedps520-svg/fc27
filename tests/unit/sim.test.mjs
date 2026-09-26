import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match, PITCH, GOAL_HALF, PRESETS, SHAPES, FORMATION_NAMES, BENCH_SIZE } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';

function seeded(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const realRandom = Math.random;
const run = (seed, opts = {}) => {
  Math.random = seeded(seed);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 60, ...opts });
    // the clock stops for half time and restarts, so give it slack
    for (let s = 0; s < 60 * 60 * 3 && m.phase !== 'end'; s++) m.update(1 / 60);
    return m;
  } finally { Math.random = realRandom; }
};

test('pitch constants are the ones the renderers and the sim agree on', () => {
  assert.equal(PITCH.w, 105);
  assert.equal(PITCH.h, 68);
  assert.equal(GOAL_HALF, 5.5);
  assert.ok(PRESETS.authentic && PRESETS.competitive);
  assert.equal(FORMATION_NAMES.length, Object.keys(SHAPES).length);
  for (const name of FORMATION_NAMES) assert.equal(SHAPES[name].length, 11, `${name} fields eleven`);
});

test('a match fields eleven a side plus a bench and ends on the clock', () => {
  const m = run(1);
  assert.equal(m.phase, 'end');
  for (const t of m.teams) {
    assert.equal(t.players.length, 11);
    assert.ok(t.bench.length <= BENCH_SIZE);
    assert.equal(t.players.filter((p) => p.role === 'GK').length, 1);
  }
});

test('the same seed replays the same match, a different seed does not', () => {
  const a = run(42);
  const b = run(42);
  const c = run(43);
  const line = (m) => [m.teams[0].score, m.teams[1].score, m.teams[0].shots, m.teams[1].shots, m.ball.x.toFixed(3)].join(',');
  assert.equal(line(a), line(b));
  assert.notEqual(line(a), line(c));
});

test('the ball and every player stay inside a sane world', () => {
  const m = run(7);
  assert.ok(m.ball.x > -10 && m.ball.x < PITCH.w + 10);
  assert.ok(m.ball.y > -10 && m.ball.y < PITCH.h + 10);
  for (const t of m.teams) for (const p of t.players) {
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), 'no NaN positions');
    if (!p.sentOff) assert.ok(p.x > -8 && p.x < PITCH.w + 8 && p.y > -8 && p.y < PITCH.h + 8);   // v134: a man sent off is parked off the pitch
  }
});

test('goals are counted as goals: score never exceeds shots on target', () => {
  for (const seed of [3, 4, 5]) {
    const m = run(seed);
    for (const t of m.teams) assert.ok(t.score <= t.onTarget, `seed ${seed}: ${t.score} goals from ${t.onTarget} on target`);
  }
});

test('possession is a split of one hundred', () => {
  const [h, a] = run(9).possession();
  assert.ok(Math.abs(h + a - 100) < 0.01);
});

test('the CPU skill knob is applied', () => {
  const m = run(11, { skill: 1.3 });
  assert.equal(m.skill, 1.3);
  assert.ok(m.aiSkillFor(0) >= 1.3 - 1e-9);
});

test('a human seat is respected and the CPU side is the other one', () => {
  Math.random = seeded(5);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: 1, duration: 30 });
    assert.equal(m.human, 1);
    assert.ok(m.teams[1].players.length === 11);
  } finally { Math.random = realRandom; }
});
