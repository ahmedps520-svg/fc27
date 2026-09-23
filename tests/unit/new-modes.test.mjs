/**
 * v82 — new modes: the street cages (walls, style, quick restarts), futsal,
 * the watch's 1v1, practice parking, the skill drills, the street tour,
 * party squads, and rebinding.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { Match, PITCH, FIELD, setField } from '../../js/game/sim.js';
import { FIELDS } from '../../js/game/field.js';
import { WORLD } from '../../js/data/generator.js';
import { createDrill, step, DRILLS } from '../../js/game/drills.js';
import * as S from '../../js/streetMode.js';
import { STREET_VENUES, venueDef } from '../../js/data/street.js';
import { partySquads } from '../../js/net/partySquads.js';
import * as I from '../../js/game/input.js';

beforeEach(() => { resetStorage(); resetAll(); setField('full'); });
const seeded = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const withSeed = (seed, fn) => { const r = Math.random; Math.random = seeded(seed); try { return fn(); } finally { Math.random = r; } };
const run = (m, secs = 400) => { for (let i = 0; i < 60 * secs && m.phase !== 'end'; i++) m.update(1 / 60); return m; };

test('street cages: the ball never leaves, walls get used, style is counted, restarts are quick', () => {
  withSeed(12, () => {
    for (const f of ['street3', 'street4', 'street5']) {
      const m = new Match(WORLD.clubs[0].id, WORLD.clubs[4].id, { duration: 90, human: null, field: f });
      assert.equal(m.teams[0].players.length, FIELDS[f].players);
      let out = 0; let maxPhase = 0; let phaseT = 0; let last = m.phase;
      for (let i = 0; i < 60 * 300 && m.phase !== 'end'; i++) {
        m.update(1 / 60);
        const b = m.ball;
        if (!b.inNet && m.phase === 'play' && (b.x < -0.5 || b.x > PITCH.w + 0.5 || b.y < -0.5 || b.y > PITCH.h + 0.5)) out++;
        if (m.phase === last && m.phase !== 'play' && m.phase !== 'goal' && m.phase !== 'kickoff' && m.phase !== 'half') { phaseT += 1 / 60; maxPhase = Math.max(maxPhase, phaseT); } else phaseT = 0;
        last = m.phase;
      }
      assert.equal(m.phase, 'end');
      assert.equal(out, 0, `${f}: the ball stays in the cage`);
      assert.ok(m.wallHits > 5, `${f}: walls in play (${m.wallHits})`);
      assert.ok(maxPhase < 1.2, `${f}: restarts are quick (${maxPhase.toFixed(2)} s)`);
      const st = m.styleOf(0);
      assert.ok(st.points >= (m.teams[0].score * 100), 'every goal is worth at least 100 style');
    }
  });
});

test('futsal: kick-ins along the floor, and the low-bounce ball', () => {
  withSeed(4, () => {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 60, human: null, field: 'futsal' });
    assert.equal(FIELD.kickIn, true);
    assert.ok(FIELD.ball.bounce < 0.42);
    m.startThrowIn(0, 10, 0);
    m.takeThrowIn();
    assert.equal(m.ball.z, 0, 'a kick-in, not a throw');
    assert.equal(m.ball.vz, 0);
    run(m);
    assert.equal(m.phase, 'end');
  });
});

test('the watch 1v1: one each, no keepers, goals come', () => {
  withSeed(8, () => {
    let goals = 0;
    for (let i = 0; i < 4; i++) {
      const m = run(new Match(WORLD.clubs[i].id, WORLD.clubs[i + 3].id, { duration: 60, human: null, field: 'street1' }));
      assert.equal(m.teams[0].players.length, 1);
      assert.notEqual(m.teams[0].players[0].role, 'GK');
      goals += m.teams[0].score + m.teams[1].score;
    }
    assert.ok(goals > 4, `${goals} goals in four minutes`);
  });
});

test('practice: the opposition is parked bar the keeper, no offside, and a wall is kept for a free kick', () => {
  withSeed(2, () => {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 3600, human: null });
    m.park(1);
    for (let i = 0; i < 60 * 20; i++) m.update(1 / 60);
    const away = m.teams[1].players;
    for (const p of away) if (p.role !== 'GK') assert.ok(p.x < -100, 'parked men stay off the pitch');
    assert.ok(away.find((p) => p.role === 'GK').x > 50, 'the keeper is in his goal');
    assert.equal(m.isOffside(m.teams[0].players[9]), false);
    m.awardFreeKick(0, { x: 80, y: 34 }, null);
    m.update(1 / 60);
    assert.ok(away.some((p) => p.role !== 'GK' && p.x > 0), 'a wall stands for the free kick');
  });
});

test('skill drills: each one finishes and scores within its ceiling', () => {
  const ceilings = { slalom: 1600, freekicks: 750, crossing: 900, passing: 12000 };
  for (const d of DRILLS) {
    const rnd = seeded(7);
    const g = createDrill(d.id, rnd);
    let t = 0; let hold = 0;
    while (!g.done && t < 90) {
      // a simple bot: run right (slalom weaving), strike at 60% power every second
      const ctl = { ax: 1, ay: d.id === 'slalom' ? Math.sin(t * 2.2) : 0, sprint: false, released: false, power: 0 };
      if (d.id === 'freekicks') { ctl.ax = 0.3; ctl.ay = -0.2; }
      if (d.id === 'passing' && g.gates) { const gt = g.gates[g.lit]; const dx = gt.x - g.me.x; const dy = gt.y - g.me.y; const L = Math.hypot(dx, dy); ctl.ax = dx / L; ctl.ay = dy / L; }
      hold += 1 / 60;
      if (hold > 0.8) { ctl.released = true; ctl.power = 0.62; hold = 0; }
      step(g, 1 / 60, ctl); t += 1 / 60;
    }
    assert.ok(g.done, `${d.id} ends`);
    assert.ok(g.score >= 0 && g.score <= ceilings[d.id], `${d.id} score ${g.score}`);
  }
});

test('street: a baller, the tour unlocks in order, bosses recruit and unlock cosmetics', () => {
  S.createBaller({ name: 'Zed', number: 7 });
  const st = getState().street;
  assert.equal(S.ballerCard(st).overall, 70);
  assert.equal(S.myCrew(3, st).xi.length, 3);
  assert.ok(S.myCrew(5, st).xi.some((p) => p.id === 'street-baller'));
  let view = S.tourView(getState().street);
  assert.equal(view[0].unlocked, true); assert.equal(view[1].unlocked, false);
  const v0 = STREET_VENUES[0];
  const crew0 = st.crew.length;
  for (const g of [0, 1, 2]) S.settleStreet({ venueId: v0.id, game: g, scored: 3, conceded: 1, style: 900 });
  view = S.tourView(getState().street);
  assert.equal(view[0].done, true);
  assert.equal(view[0].stars, 9);
  assert.equal(view[1].unlocked, true);
  const after = getState().street;
  assert.equal(after.crew.length, crew0 + 1, 'the boss joined');
  assert.ok(after.owned.includes('boots-gold'), 'the boss cosmetic');
  S.equip('boots-gold');
  assert.equal(getState().street.equipped.boots, 'boots-gold');
  S.equip('kit-grid');
  assert.notEqual(getState().street.equipped.kit, 'kit-grid', 'a locked cosmetic cannot be worn');
  assert.ok(venueDef(v0).street && venueDef(v0).surface.base);
});

test('party squads are the same on every machine, with every pro locked', () => {
  const seats = [{ seat: 0, team: 0, name: 'a', pro: { name: 'A Pro', position: 'ST', overall: 80, stats: { pace: 80, shooting: 82, passing: 70, dribbling: 78, defending: 40, physical: 70 } } }, { seat: 1, team: 1, name: 'b', pro: null }, { seat: 2, team: 0, name: 'c', pro: null }];
  const setup = { field: 'fives', home: WORLD.clubs[0].id, away: WORLD.clubs[1].id };
  const x = partySquads(setup, seats); const y = partySquads(setup, seats);
  assert.deepEqual(x.home.xi.map((p) => p.id), y.home.xi.map((p) => p.id));
  assert.equal(x.home.xi.length, 5); assert.equal(x.away.xi.length, 5);
  assert.equal(x.home.xi[0].position, 'GK');
  assert.deepEqual(x.locks, { 0: 'pty-0', 1: 'pty-1', 2: 'pty-2' });
  setField('fives');
  const m = new Match(setup.home, setup.away, { homeSquad: x.home, awaySquad: x.away, seats: seats.map((s) => ({ team: s.team })), field: 'fives' });
  assert.deepEqual(m.controllers.map((c) => c.team), [0, 1, 0]);
});

test('rebinding moves a control and the prompts follow the device', () => {
  I.setBindings({ keys: { shoot: 'KeyO' }, pad: { shoot: 3 } });
  assert.equal(I.keyMapFor().KeyO, 'shoot');
  assert.equal(I.keyMapFor().KeyK, undefined, 'the old key is freed');
  assert.equal(I.promptFor('shoot', 'keyboard'), 'O');
  assert.ok(['Y', '△'].includes(I.promptFor('shoot', 'pad')));
  assert.equal(I.promptFor('shoot', 'touch'), 'SHOOT');
  I.setBindings({ keys: {}, pad: {} });
  assert.equal(I.keyMapFor().KeyK, 'shoot');
});
