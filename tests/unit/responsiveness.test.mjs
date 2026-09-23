/**
 * v84 hotfix — the controlled player must answer the stick. Measured through
 * the real Input class for all three devices (keyboard keys, the touch stick's
 * vector, and a gamepad via a stubbed Gamepad API), with and without the ball,
 * on an otherwise empty pitch so nothing but the controls is measured.
 *
 *   top speed       standstill to 90% of sprint speed          ≤ 0.35 s
 *   180 at a jog    to 80% of the old speed the other way       ≤ 0.15 s
 *   180 at sprint   the same out of a flat-out run              ≤ 0.25 s
 *   90 at a jog     heading within reach of the new line        ≤ 0.15 s
 *   straight back   from standing, facing forward, in 0.5 s     ≥ 2.5 m
 *
 * and the person's player turns quicker than the CPU model does, and the
 * Responsiveness setting moves the numbers the right way.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

globalThis.addEventListener ??= () => {};
globalThis.removeEventListener ??= () => {};
globalThis.matchMedia ??= () => ({ matches: false, addEventListener() {} });
let PAD = null;
globalThis.navigator.getGamepads = () => (PAD ? [PAD] : []);
const { Match, PITCH, setField } = await import('../../js/game/sim.js');
const { Input } = await import('../../js/game/input.js');
const { WORLD } = await import('../../js/data/generator.js');

const DT = 1 / 60;
function setup(withBall, responsiveness) {
  setField('full');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0, responsiveness });
  m.phase = 'play';
  m.isOffside = () => false; m.noteOffside = () => {};
  const c = m.controllers[0];
  const p = m.teams[0].players[9];
  c.activeIdx = m.teams[0].players.indexOf(p); c.lockId = p.ref.id;
  p.x = PITCH.w / 2; p.y = PITCH.h / 2; p.vx = 0; p.vy = 0; p.stamina = 1;
  for (const t of m.teams) for (const q of t.players) if (q !== p) { q.x = t === m.teams[0] ? 2 : PITCH.w - 2; q.y = 2; q.maxSpeed = 0.01; q.accel = 0.01; }
  if (withBall) m.ball.owner = p; else { m.ball.owner = null; m.ball.x = 3; m.ball.y = 3; }
  m.basis = null;
  return { m, p };
}
function device(kind) {
  const inp = new Input();
  return {
    inp,
    set(x, y, sprint) {
      inp.keys.clear(); inp.touchVec = { x: 0, y: 0 }; inp.touchButtons.clear(); PAD = null;
      if (kind === 'keyboard') { if (x > 0) inp.keys.add('KeyD'); if (x < 0) inp.keys.add('KeyA'); if (y < 0) inp.keys.add('KeyW'); if (y > 0) inp.keys.add('KeyS'); if (sprint) inp.keys.add('ShiftLeft'); }
      if (kind === 'touch') { inp.touchVec = { x, y }; if (sprint) inp.touchButtons.add('sprint'); }
      if (kind === 'pad') {
        const b = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
        if (sprint) b[7] = { pressed: true, value: 1 };
        PAD = { id: 'Xbox Wireless Controller', connected: true, axes: [x, y, 0, 0], buttons: b, index: 0 };
      }
    },
  };
}
function run(m, inp, secs, until) {
  for (let i = 0; i < Math.round(secs / DT); i++) {
    inp.poll(DT); m.phase = 'play'; m.update(DT, inp);
    if (until?.()) return (i + 1) * DT;
  }
  return Infinity;
}
function measure(kind, withBall, responsiveness) {
  const out = {};
  { const { m, p } = setup(withBall, responsiveness); const d = device(kind); d.set(1, 0, true);
    const top = p.maxSpeed * 1.24 * 0.9;
    out.toTop = run(m, d.inp, 3, () => Math.hypot(p.vx, p.vy) >= top); }
  for (const [name, sprint] of [['jog180', false], ['sprint180', true]]) {
    const { m, p } = setup(withBall, responsiveness); const d = device(kind); d.set(1, 0, sprint); run(m, d.inp, 2.5); d.set(-1, 0, sprint);
    const v0 = Math.hypot(p.vx, p.vy);
    out[name] = run(m, d.inp, 3, () => p.vx < -0.8 * v0);
  }
  { const { m, p } = setup(withBall, responsiveness); const d = device(kind); d.set(1, 0, false); run(m, d.inp, 2); d.set(0, -1, false);
    const v0 = Math.hypot(p.vx, p.vy);
    // screen-up is +y on the pitch when there is no camera basis
    out.jog90 = run(m, d.inp, 3, () => p.vy > 0.8 * v0 && Math.abs(p.vx) < 0.3 * v0); }
  { const { m, p } = setup(withBall, responsiveness); p.dirX = 1; p.dirY = 0; const d = device(kind); const x0 = p.x; d.set(-1, 0, false); run(m, d.inp, 0.5);
    out.back = x0 - p.x; }
  return out;
}

for (const kind of ['keyboard', 'touch', 'pad']) {
  for (const withBall of [false, true]) {
    test(`${kind}${withBall ? ' with the ball' : ''}: light and responsive`, () => {
      const r = measure(kind, withBall);
      assert.ok(r.toTop <= 0.35, `to top speed ${r.toTop}s`);
      assert.ok(r.jog180 <= 0.15, `180 at a jog ${r.jog180}s`);
      assert.ok(r.sprint180 <= 0.25, `180 at a sprint ${r.sprint180}s`);
      assert.ok(r.jog90 <= 0.15, `90 at a jog ${r.jog90}s`);
      assert.ok(r.back >= 2.5, `straight back ${r.back.toFixed(2)} m in 0.5 s`);
    });
  }
}

test('a light touch on the stick walks; half a push is full speed', () => {
  for (const [mag, lo, hi] of [[0.12, 0.3, 0.45], [0.5, 0.95, 1.01], [1, 0.95, 1.01]]) {
    const { m, p } = setup(false); const d = device('touch'); d.set(mag, 0, false); run(m, d.inp, 1);
    const frac = Math.hypot(p.vx, p.vy) / p.maxSpeed;
    assert.ok(frac >= lo && frac <= hi, `stick ${mag} → ${frac.toFixed(2)} of top speed`);
  }
});

test('the person turns quicker than the CPU model, and the Responsiveness setting is honoured', () => {
  // the CPU's own turn at a jog, through drive() directly
  const { m, p } = setup(false);
  for (let i = 0; i < 120; i++) { m.drive(p, 1, 0, DT); p.x += p.vx * DT; }
  const v0 = Math.hypot(p.vx, p.vy);
  let cpu = Infinity;
  for (let i = 0; i < 300; i++) { m.drive(p, -1, 0, DT); if (p.vx < -0.8 * v0) { cpu = (i + 1) * DT; break; } }
  const human = measure('keyboard', false).jog180;
  assert.ok(human < cpu, `human ${human}s vs CPU ${cpu}s`);
  const low = measure('keyboard', false, 0); const high = measure('keyboard', false, 1);
  assert.ok(low.sprint180 > high.sprint180, `sprint 180: low ${low.sprint180}s, high ${high.sprint180}s`);
  assert.ok(low.sprint180 <= 0.5, 'even the heaviest setting turns within half a second');
});

test('v86: the CPU is light on its feet too — quick turns, and it never orbits a target', () => {
  const { m, p } = setup(false);
  const turn = (factor, dir, until) => {
    p.x = 50; p.y = 34; p.vx = 0; p.vy = 0;
    for (let i = 0; i < 180; i++) { m.drive(p, 1, 0, DT, factor); p.x += p.vx * DT; p.y += p.vy * DT; }
    const v0 = Math.hypot(p.vx, p.vy);
    for (let i = 0; i < 300; i++) { m.drive(p, dir[0], dir[1], DT, factor); p.x += p.vx * DT; p.y += p.vy * DT; if (until(v0)) return (i + 1) * DT; }
    return Infinity;
  };
  const jog180 = turn(0.6, [-1, 0], (v0) => p.vx < -0.8 * v0);
  const sprint180 = turn(1.1, [-1, 0], (v0) => p.vx < -0.8 * v0);
  const sprint90 = turn(1.1, [0, 1], (v0) => p.vy > 0.8 * v0 && Math.abs(p.vx) < 0.3 * v0);
  assert.ok(jog180 <= 0.35, `CPU 180 at a jog ${jog180}s (was 1.2 s)`);
  assert.ok(sprint180 <= 0.6, `CPU 180 at a sprint ${sprint180}s (was 1.65 s)`);
  assert.ok(sprint90 <= 0.3, `CPU 90 at a sprint ${sprint90}s (was 0.9 s)`);
  // a loose ball four metres to his side at full tilt: he used to circle it for ever
  p.x = 50; p.y = 34; p.vx = 0; p.vy = 0;
  for (let i = 0; i < 180; i++) { m.drive(p, 1, 0, DT, 1.1); p.x += p.vx * DT; }
  const tx = p.x; const ty = p.y + 4; let reached = Infinity;
  for (let i = 0; i < 300; i++) { m.moveTo(p, tx, ty, DT, 1.1); p.x += p.vx * DT; p.y += p.vy * DT; if (Math.hypot(p.x - tx, p.y - ty) < 0.8) { reached = (i + 1) * DT; break; } }
  assert.ok(reached <= 1, `reaches a point 4 m to the side in ${reached}s`);
});
