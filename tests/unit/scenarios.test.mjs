/**
 * v197 — scenarios (js/scenarios.js): a real Match picked up at the minute,
 * with the score, its scorers and the red cards (the short side reshaped and
 * its man parked), no cue left over from before you took over; stars judged
 * at full time; a star paying once; every star paying the Prime pack once.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { Match } from '../../js/game/sim.js';
import * as sc from '../../js/scenarios.js';

beforeEach(() => { resetStorage(); resetAll(); });

test('every scenario names two different real clubs, a sensible clock and three known star goals', () => {
  assert.equal(sc.SCENARIOS.length, 10);
  assert.equal(new Set(sc.SCENARIOS.map((x) => x.id)).size, 10);
  for (const s of sc.SCENARIOS) {
    const { you, them } = sc.sidesOf(s);
    assert.notEqual(you.club.id, them.club.id, s.id);
    const p = sc.scenarioParams(s);
    assert.ok(s.minute >= 46 && s.minute < 90, `${s.id}: second half, so no half-time to sit through`);
    assert.ok(Math.abs(p.duration * (90 - s.minute) / 90 - s.secs) < 1, `${s.id}: ${s.secs}s left to play`);
    assert.equal(s.stars.length, 3);
    for (const k of s.stars) assert.ok(sc.GOALS[k], `${s.id}: ${k}`);
  }
  const hold = sc.sidesOf(sc.scenarioById('giant-killers'));
  assert.ok(hold.them.rating - hold.you.rating >= 15, 'giant-killers is a mismatch');
});

test('staging: the minute, the half, the score with its scorers, the reds, the side behind kicks off', () => {
  const s = sc.scenarioById('cup-final');          // 70', 0–1, you a man down
  const p = sc.scenarioParams(s);
  const m = new Match(p.homeId, p.awayId, { duration: p.duration, skill: p.skill });
  sc.stageScenario(m, s);
  assert.equal(m.minute(), 70); assert.equal(m.half, 2);
  assert.deepEqual([m.teams[0].score, m.teams[1].score], [0, 1]);
  assert.equal(m.teams[1].scorers.length, 1); assert.ok(m.teams[1].scorers[0].minute < 70);
  assert.deepEqual(m.reds, [1, 0]);
  const off = m.teams[0].players.filter((x) => x.sentOff);
  assert.equal(off.length, 1); assert.equal(off[0].parked, true); assert.notEqual(off[0].role, 'GK');
  assert.equal(m.cues.length, 0, 'no whistle for a card shown before you took over');
  assert.equal(m.phase, 'kickoff'); assert.equal(m.kickoffSide, 0, 'the side behind kicks off');

  const t = sc.scenarioById('man-up');             // theirs a man down
  const q = sc.scenarioParams(t);
  const m2 = new Match(q.homeId, q.awayId, { duration: q.duration, skill: q.skill });
  sc.stageScenario(m2, t);
  assert.deepEqual(m2.reds, [0, 1]);
  // it plays on from there: a few seconds of sim, the clock moves on from 60'
  for (let i = 0; i < 400; i++) m2.update(1 / 60);
  assert.ok(m2.minute() >= 60 && m2.minute() < 90, `minute ${m2.minute()}`);
});

test('stars at full time, paid the first time each is earned; every star earns a Prime pack once', () => {
  const late = sc.scenarioById('late-show');       // 0–1: noLoss, win, by2
  assert.deepEqual(sc.starsFor(late, 1, 1), [true, false, false]);
  assert.deepEqual(sc.starsFor(late, 3, 1), [true, true, true]);
  const cb = sc.scenarioById('comeback');          // 1–3: score2, noLoss, win
  assert.deepEqual(sc.starsFor(cb, 3, 3), [true, true, false], 'two goals since the start');
  assert.deepEqual(sc.starsFor(cb, 2, 3), [false, false, false]);
  const ten = sc.scenarioById('ten-men');          // 1–0: win, winClean, by2
  assert.deepEqual(sc.starsFor(ten, 2, 1), [true, false, false], 'conceded since the start');

  update((s) => { s.club.apex = 0; });
  let r = sc.settleScenario('late-show', 1, 1);
  assert.equal(r.apex, sc.STAR_APEX);
  r = sc.settleScenario('late-show', 2, 1);
  assert.equal(r.apex, sc.STAR_APEX, 'only the new star pays');
  r = sc.settleScenario('late-show', 0, 2);
  assert.equal(r.apex, 0); assert.deepEqual(sc.scenarioRecord('late-show').stars, [true, true, false], 'a star once earned is kept');
  assert.equal(sc.scenarioRecord('late-show').tries, 3);
  assert.equal(getState().club.apex, 2 * sc.STAR_APEX);

  // every star of every scenario: the pack, once
  const packs = getState().club.packs.length;
  for (const s of sc.SCENARIOS) sc.settleScenario(s.id, s.score[0] + 4, s.score[1]);
  assert.equal(sc.totalStars(), 30);
  assert.equal(getState().club.packs.length, packs + 1); assert.equal(getState().club.packs.at(-1), 'prime');
  for (const s of sc.SCENARIOS) sc.settleScenario(s.id, s.score[0] + 4, s.score[1]);
  assert.equal(getState().club.packs.length, packs + 1, 'once');
});
