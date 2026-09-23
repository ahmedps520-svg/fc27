/**
 * v90 — the in-match controller scheme: slide vs standing tackle, jockey,
 * the team-mate press, right-stick switching and skill flicks, the D-pad
 * off the stick, and stick tuning. None of it is reachable by the CPU, so the
 * balance sweep stays identical (checked by the sweep itself).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
globalThis.addEventListener ??= () => {};
globalThis.removeEventListener ??= () => {};
let PAD = null;
globalThis.navigator.getGamepads = () => (PAD ? [PAD] : []);
const { Match, PITCH, setField } = await import('../../js/game/sim.js');
const { Input, setPadTuning } = await import('../../js/game/input.js');
const { WORLD } = await import('../../js/data/generator.js');

const DT = 1 / 60;
/** A seat that holds exactly what it is told to. */
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
  const me = m.teams[0].players[6]; c.activeIdx = m.teams[0].players.indexOf(me); c.lockId = null;
  const them = m.teams[1].players[9];
  for (const t of m.teams) for (const q of t.players) { q.x = t === m.teams[0] ? 10 : PITCH.w - 10; q.y = 5 + t.players.indexOf(q) * 5; q.vx = q.vy = 0; q.stamina = 1; }
  me.x = 50; me.y = 34; them.x = 53.5; them.y = 34; me.dirX = 1; me.dirY = 0;
  m.ball.owner = them; m.ball.x = them.x; m.ball.y = them.y;
  return { m, c, me, them };
}

test('a slide reaches a carrier a standing tackle cannot', () => {
  let slideWins = 0; let standWins = 0;
  for (let i = 0; i < 60; i++) {
    for (const slide of [false, true]) {
      const { m, me, them } = setup();
      them.x = me.x + 3.8;                      // beyond a standing tackle's reach (3.1), inside a slide's (4.3)
      m.ball.owner = them;
      m.tackle(me, { slide });
      const won = m.ball.owner !== them;
      if (slide) slideWins += won ? 1 : 0; else standWins += won ? 1 : 0;
      if (slide) assert.ok(me.slide >= 0.8, 'a slide keeps him down longer');
    }
  }
  assert.equal(standWins, 0, 'a standing tackle never reaches 3.8 m');
  assert.ok(slideWins > 10, `a slide wins it from 3.8 m some of the time (${slideWins}/60)`);
});

test('shoot slides and pass stands when defending; jockey never lunges', () => {
  const a = setup(); const s = seat(); s.s.held_.add('shoot'); a.m.handleSeat(a.c, DT, s);
  assert.ok(a.me.slide >= 0.8, 'shoot is the slide');
  const b = setup(); const t = seat(); t.s.held_.add('pass'); b.m.handleSeat(b.c, DT, t);
  assert.ok(b.me.slide > 0 && b.me.slide < 0.8, 'pass is the standing tackle');
  const j = setup(); const u = seat(); u.s.held_.add('jockey'); u.s.held_.add('pass'); j.m.handleSeat(j.c, DT, u);
  assert.equal(j.me.slide || 0, 0, 'no lunge while jockeying');
});

test('jockey is slower and square on to the carrier', () => {
  const run = (jockey) => {
    const { m, c, me, them } = setup(); them.y = 40;
    const s = seat(); s.s.vec = { x: 0, y: -1 }; if (jockey) s.s.held_.add('jockey');
    for (let i = 0; i < 60; i++) { m.handleSeat(c, DT, s); me.x += me.vx * DT; me.y += me.vy * DT; s.tick(); }
    return { speed: Math.hypot(me.vx, me.vy), facing: (me.dirX * (them.x - me.x) + me.dirY * (them.y - me.y)) / Math.hypot(them.x - me.x, them.y - me.y) };
  };
  const free = run(false); const jock = run(true);
  assert.ok(jock.speed < free.speed * 0.75, `jockeying is slower (${jock.speed.toFixed(1)} vs ${free.speed.toFixed(1)} m/s)`);
  assert.ok(jock.facing > 0.95, 'and he faces the carrier');
});

test('Press sends the nearest free team-mate at the carrier', () => {
  const { m, c, me, them } = setup();
  const mate = m.teams[0].players[7]; mate.x = them.x - 12; mate.y = them.y + 6;
  const s = seat(); s.s.held_.add('press');
  m.handleSeat(c, DT, s);
  assert.equal(m.pressMate(0), mate);
  const d0 = Math.hypot(mate.x - them.x, mate.y - them.y);
  m.chasers = [null, null]; m.chasers2 = [null, null]; m.supporters = [null, null];   // what update() fills in each frame
  for (let i = 0; i < 40; i++) { m.think(mate, DT); mate.x += mate.vx * DT; mate.y += mate.vy * DT; }
  assert.ok(Math.hypot(mate.x - them.x, mate.y - them.y) < d0 - 3, 'the team-mate closes the carrier down');
  assert.notEqual(mate, me, 'never your own player');
});

test('a right-stick flick switches to the team-mate that way, and is a skill move with the ball', () => {
  const { m, c, me } = setup();
  const up = m.teams[0].players[8]; up.x = me.x + 2; up.y = me.y + 15;
  const down = m.teams[0].players[5]; down.x = me.x; down.y = me.y - 15;
  const s = seat(); s.s.r = { x: 0, y: -1 };            // stick up = +y on the pitch without a camera basis
  m.handleSeat(c, DT, s);
  assert.equal(m.playerOf(c), up, 'switched to the man the flick pointed at');
  // with the ball: a flick is a trick
  const b = setup(); b.m.ball.owner = b.me; b.me.stamina = 1;
  const t = seat(); t.s.r = { x: 1, y: 0 };
  b.m.handleSeat(b.c, DT, t);
  assert.ok(b.me.skillT > 0, 'a skill move fired');
});

test('the D-pad no longer moves the player on a pad with sticks; deadzone and curve apply', () => {
  const b = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
  b[15] = { pressed: true, value: 1 };
  PAD = { id: 'Xbox', connected: true, axes: [0, 0, 0, 0], buttons: b, index: 0 };
  const inp = new Input(); inp.poll(DT);
  assert.deepEqual(inp.axis(), { x: 0, y: 0 }, 'D-pad right is tactics, not movement');
  PAD.axes = [0.2, 0, 0, 0]; inp.poll(DT);
  assert.equal(inp.axis().x, 0, '0.2 is inside the default deadzone');
  setPadTuning({ deadzone: 0.1 }); inp.poll(DT);
  assert.ok(inp.axis().x > 0, 'and outside a smaller one');
  setPadTuning({ deadzone: 0.1, curve: 2 }); inp.poll(DT); const fine = inp.axis().x;
  setPadTuning({ deadzone: 0.1, curve: 0.6 }); inp.poll(DT); const quick = inp.axis().x;
  assert.ok(quick > fine, 'a lower curve is quicker off the centre');
  PAD.axes = [0, 0, 0.9, 0]; inp.poll(DT);
  assert.ok(inp.rstick().x > 0.5, 'the right stick reads');
  setPadTuning({}); PAD = null;
});
