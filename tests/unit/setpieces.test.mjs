import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match, PITCH, TUNE } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';
import { COMMENTARY, LINE_COUNT, say } from '../../js/data/commentary.js';

function seeded(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const realRandom = Math.random;
/** A stub input: axis + button set, the Input contract the sim reads. */
const stub = (buttons = new Set(), axis = { x: 0, y: 0 }) => ({
  axis: () => axis, held: (a) => buttons.has(a), pressed: () => false, released: (a) => buttons.has(`rel:${a}`), poll() {},
});

test('the ball over the touchline is a throw-in phase, taken by the AI after a beat', () => {
  Math.random = seeded(3);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
    m.startPlay();
    Object.assign(m.ball, { x: 50, y: -0.5, z: 0, vx: 0, vy: -3, vz: 0, owner: null, lastTouch: m.teams[0].players[5] });
    m.update(1 / 60, stub());
    assert.equal(m.phase, 'throwin');
    assert.equal(m.setPiece.kind, 'throwin');
    assert.equal(m.setPiece.team, 1, 'the other side throws');
    assert.equal(m.setPiece.human, false);
    for (let i = 0; i < 90 && m.phase === 'throwin'; i++) m.update(1 / 60, stub());
    assert.equal(m.phase, 'play');
    assert.equal(m.setPiece, null);
  } finally { Math.random = realRandom; }
});

test('a foul outside the box is a free kick with a wall; a person takes it with the buttons', () => {
  Math.random = seeded(9);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: 0, duration: 240 });
    m.startPlay();
    const victim = m.teams[0].players[9];
    const offender = m.teams[1].players[6];
    victim.x = 80; victim.y = 30; offender.x = 82; offender.y = 30;
    m.awardFreeKick(0, victim, offender);
    assert.equal(m.phase, 'freekick');
    assert.equal(m.setPiece.human, true, 'the human side is taking it');
    assert.ok(m.phaseT > 5, 'a person gets a window');
    // the wall stands ten yards off between ball and goal
    const wall = m.teams[1].players.filter((q) => q.role !== 'GK' && Math.abs(Math.hypot(q.x - m.ball.x, q.y - m.ball.y) - 9.15) < 1.2);
    assert.ok(wall.length >= 3, `wall of ${wall.length}`);
    // waiting: the phase holds while nothing is pressed
    for (let i = 0; i < 30; i++) m.update(1 / 60, stub());
    assert.equal(m.phase, 'freekick');
    // hold shoot for a few frames, then release
    const held = new Set(['shoot']);
    for (let i = 0; i < 20; i++) m.update(1 / 60, stub(held));
    assert.ok(m.setPiece.charge > 0.3);
    m.update(1 / 60, stub(new Set(['rel:shoot'])));
    assert.equal(m.phase, 'play');
    assert.equal(m.teams[0].shots, 1, 'the free kick was a shot');
    assert.ok(m.teams[0].xg > 0, 'xG recorded');
  } finally { Math.random = realRandom; }
});

test('a human corner and penalty can be taken through takeSetPiece; the AI window expires on its own', () => {
  Math.random = seeded(4);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: 0, duration: 240 });
    m.startPlay();
    m.startCorner(0, 0, PITCH.w);
    assert.equal(m.phase, 'corner');
    assert.ok(m.takeSetPiece('cross', { x: 1, y: 0 }, 0.6));
    assert.equal(m.phase, 'play');
    m.awardPenalty(0, m.teams[1].players[3]);
    assert.equal(m.phase, 'penalty');
    assert.ok(m.takeSetPiece('shoot', { x: 1, y: 0.6 }, 0.8));
    assert.equal(m.teams[0].shots, 1);
    // the AI side's set piece runs on the short timer
    const ai = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
    ai.startPlay();
    ai.startCorner(1, 60, 0);
    assert.equal(ai.setPiece.human, false);
    for (let i = 0; i < 120 && ai.phase === 'corner'; i++) ai.update(1 / 60, stub());
    assert.equal(ai.phase, 'play');
  } finally { Math.random = realRandom; }
});

test('injuries diminish a player and the CPU substitutes him at the next stoppage', () => {
  Math.random = seeded(5);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
    m.startPlay();
    const p = m.teams[1].players[7];
    const speed = p.maxSpeed;
    m.injure(p);
    assert.equal(p.injured, true);
    assert.ok(p.maxSpeed < speed);
    assert.equal(m.injuries.length, 1);
    assert.ok(m.formOf(p) < 0.8);
    const before = m.teams[1].subsLeft;
    m.markStoppage('throwin');
    assert.equal(m.teams[1].subsLeft, before - 1, 'the CPU used a sub');
    assert.ok(!m.teams[1].players.some((q) => q.injured));
  } finally { Math.random = realRandom; }
});

test('skill move and lob exist as actions, counters fire, tuning knobs are the defaults', () => {
  Math.random = seeded(6);
  try {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: 0, duration: 240 });
    m.startPlay();
    const p = m.teams[0].players[10];
    m.ball.owner = p;
    p.stamina = 1;
    m.skillMove(p, { x: 1, y: 0 });
    assert.ok(p.skillT > 0);
    const sp = { ...m.ball };
    m.pass(p, { x: 1, y: 0 }, true, 0.5, true);
    assert.ok(m.ball.vz > 0, 'a lob leaves the ground');
    void sp;
    assert.deepEqual(TUNE, { drop: 2, squeeze: 0.93, counter: true, sweeper: true, runs: true, keeperDist: true, shotRate: 0.7, tackleRate: 0.6, boxCare: 0.35, support: true });
  } finally { Math.random = realRandom; }
});

test('commentary: 200+ lines, every key fills its placeholders', () => {
  assert.ok(LINE_COUNT >= 200, `${LINE_COUNT} lines`);
  const ctx = { player: 'A', team: 'B', opp: 'C', minute: 12, score: '1–0', keeper: 'K', dist: 20, poss: 60, venue: 'V' };
  for (const key of Object.keys(COMMENTARY)) {
    for (let i = 0; i < 6; i++) {
      const line = say(key, ctx);
      if (COMMENTARY[key].length) assert.ok(line && !/\{\w+\}/.test(line), `${key}: ${line}`);
    }
  }
});
