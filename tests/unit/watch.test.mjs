import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import * as daily from '../../js/watch/daily.js';
import { LEVELS } from '../../js/watch/match.js';

beforeEach(() => resetStorage());

test('difficulty levels pay in proportion to the fight', () => {
  assert.ok(LEVELS.easy.skill < LEVELS.normal.skill && LEVELS.normal.skill < LEVELS.hard.skill);
  assert.ok(LEVELS.hard.pay > LEVELS.normal.pay && LEVELS.easy.pay < LEVELS.normal.pay);
});

test('a day has three different objectives and a streak that pays once', () => {
  // daily.js keeps module state; a fresh storage means a fresh day for this test
  const first = daily.tick();
  const objs = daily.objectives();
  assert.equal(objs.length, 3);
  assert.equal(new Set(objs.map((o) => o.ev)).size, 3, 'three different events');
  assert.equal(daily.objectives().map((o) => o.id).join(), objs.map((o) => o.id).join(), 'stable through the day');
  if (first) {
    const bonus = daily.claimBonus();
    assert.ok(bonus >= 100);
    assert.equal(daily.claimBonus(), 0, 'claimed once');
  }
  assert.ok(daily.streak() >= 1);
});

test('events count towards objectives and pay exactly at completion', () => {
  daily.tick();
  const o = daily.objectives().find((x) => !x.done);
  let paid = 0;
  for (let i = 0; i < o.n; i++) paid += daily.event(o.ev);
  assert.equal(paid, o.pay);
  assert.equal(daily.event(o.ev), 0, 'no double pay');
  assert.ok(daily.objectives().find((x) => x.id === o.id).done);
});
