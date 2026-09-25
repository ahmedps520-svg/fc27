/**
 * v107 (backlog #20): the kick modifiers that touch flicks ride on. A chip is
 * SHOOT held with LOB added before letting go, a finesse shot the same with
 * CURL; LOB pressed while SHOOT is held must be the chip's modifier, not a
 * lob pass of its own (it was: the ball left as a lofted pass the moment LOB
 * went down, and the shot never came). None of it is reachable by the CPU.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
globalThis.addEventListener ??= () => {};
globalThis.removeEventListener ??= () => {};
const { Match, PITCH, setField } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

const DT = 1 / 60;
function seat() {
  const s = { vec: { x: 0, y: 0 }, r: { x: 0, y: 0 }, held_: new Set(), was: new Set() };
  return {
    s,
    axis: () => s.vec, rstick: () => s.r, value: () => 1,
    held: (a) => s.held_.has(a), pressed: (a) => s.held_.has(a) && !s.was.has(a), released: (a) => !s.held_.has(a) && s.was.has(a),
    takeGesture: () => null,
    tick() { s.was = new Set(s.held_); },
  };
}
function setup() {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0 });
  m.phase = 'play'; m.isOffside = () => false; m.basis = null;
  const c = m.controllers[0];
  const me = m.teams[0].players[9]; c.activeIdx = m.teams[0].players.indexOf(me); c.lockId = null;
  for (const t of m.teams) for (const q of t.players) { q.x = t === m.teams[0] ? 10 : PITCH.w - 10; q.y = 5 + t.players.indexOf(q) * 5; q.vx = q.vy = 0; }
  const gx = m.teams[0].dir > 0 ? PITCH.w : 0;
  me.x = gx - m.teams[0].dir * 18; me.y = PITCH.h / 2; me.dirX = m.teams[0].dir; me.dirY = 0;
  m.ball.owner = me; m.ball.x = me.x; m.ball.y = me.y;
  const kicks = [];
  const shoot = m.shoot.bind(m); m.shoot = (p, aim, pw, o = {}) => { kicks.push({ kind: 'shot', ...o }); return shoot(p, aim, pw, o); };
  const pass = m.pass.bind(m); m.pass = (p, aim, th, pw, lob) => { kicks.push({ kind: lob ? 'lob pass' : th ? 'through' : 'pass' }); return pass(p, aim, th, pw, lob); };
  return { m, c, me, kicks };
}
/** Play a script: a list of sets of held actions, one per frame. */
function play(frames) {
  const { m, c, kicks } = setup(); const s = seat(); s.s.vec = { x: m.teams[0].dir, y: 0 };
  for (const held of frames) { s.s.held_ = new Set(held); m.handleSeat(c, DT, s); s.tick(); }
  return kicks;
}
const hold = (n, set) => Array.from({ length: n }, () => set);

test('SHOOT held, LOB added, SHOOT let go: a chip, and no lob pass', () => {
  const k = play([...hold(10, ['shoot']), ...hold(3, ['shoot', 'lob']), ['lob'], []]);
  assert.deepEqual(k.map((x) => x.kind), ['shot']);
  assert.equal(k[0].chip, true);
});
test('SHOOT held, CURL added: a finesse shot', () => {
  const k = play([...hold(10, ['shoot']), ...hold(3, ['shoot', 'curl']), ['curl'], []]);
  assert.deepEqual(k.map((x) => x.kind), ['shot']);
  assert.ok(k[0].curl > 0 && !k[0].chip);
});
test('LOB on its own is still a lob pass; THROUGH during a PASS hold is a through ball', () => {
  assert.deepEqual(play([['lob'], []]).map((x) => x.kind), ['lob pass']);
  assert.deepEqual(play([...hold(4, ['pass']), ['pass', 'through'], []]).map((x) => x.kind), ['through']);
  assert.deepEqual(play([...hold(4, ['pass']), ['pass', 'lob'], []]).map((x) => x.kind), ['lob pass']);
});
