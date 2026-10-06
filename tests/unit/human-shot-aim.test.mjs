/**
 * v166 — a person's shot with the stick fully to one side aims inside the
 * post, not at it, so the strike's own error does not put half of them wide.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { Match, PITCH } = await import('../../js/game/sim.js');
const { CY } = await import('../../js/game/field.js');
const { WORLD } = await import('../../js/data/generator.js');

test('a full stick to the side aims at the corner, inside the post', () => {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: 0, duration: 240 });
  m.phase = 'play';
  const t = m.teams[0]; const gx = t.dir > 0 ? PITCH.w : 0;
  const p = t.players.find((q) => q.role === 'FWD');
  for (const tm of m.teams) for (const q of tm.players) if (q !== p && q.role !== 'GK') { q.x = PITCH.w / 2 - t.dir * 20; q.y = 5; }
  p.x = gx - t.dir * 12; p.y = CY; m.ball.owner = p; m.ball.x = p.x; m.ball.y = p.y;
  let aimed = null;
  m.shoot = (who, aim) => { aimed = aim; };
  const inp = { _p: new Set(['shoot']), _r: new Set(), _h: new Set(['shoot']),
    axis: () => ({ x: t.dir * 0.2, y: 1 }), pressed(a) { return this._p.has(a); }, released(a) { return this._r.has(a); }, held(a) { return this._h.has(a); },
    value() { return 1; }, rstick() { return { x: 0, y: 0 }; }, takeGesture() { return null; }, clear() { this._p.clear(); this._r.clear(); } };
  for (let s = 0; s < 30 && !aimed; s++) {
    if (s === 20) { inp._h.clear(); inp._r.add('shoot'); }
    m.update(1 / 60, [inp]); inp.clear();
  }
  assert.ok(aimed, 'the shot was taken');
  assert.ok(Math.abs(aimed.y) > 0.6 && Math.abs(aimed.y) <= 0.8, `aim ${aimed.y.toFixed(2)} of the way to the post`);
});
