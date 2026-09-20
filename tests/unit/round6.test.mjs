import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { WORLD } from '../../js/data/generator.js';
import { supplyIndex, demandIndex, price, trade, kindOf, report } from '../../js/economy.js';
import * as tourney from '../../js/tournament.js';
import { nationalStadium, stadiumFor } from '../../js/data/stadiums.js';

beforeEach(() => { resetStorage(); resetAll(); });

test('the market: scarce kinds cost more, and selling a kind lowers its price', () => {
  const sup = supplyIndex();
  assert.ok(Object.keys(sup).length > 10);
  assert.ok(Object.values(sup).every((v) => v >= 0.6 && v <= 1.8));
  const p = WORLD.players.find((x) => x.position === 'ST' && x.overall >= 79 && x.overall <= 85 && x.clubId);
  const before = price(p);
  assert.ok(before > 0);
  for (let i = 0; i < 10; i++) trade(p, 'sell');
  const after = price(p);
  assert.ok(after < before, `dumping strikers lowers the price (${before} → ${after})`);
  assert.ok(demandIndex(kindOf(p)) < 1);
  for (let i = 0; i < 30; i++) trade(p, 'buy');
  assert.ok(price(p) > after, 'buying lifts it again');
  assert.ok(demandIndex(kindOf(p)) <= 1.5);
  const r = report();
  assert.ok(r.length > 10 && r[0].index >= r[r.length - 1].index);
});

test('the demand tally decays over time', () => {
  const p = WORLD.players.find((x) => x.position === 'GK' && x.clubId);
  for (let i = 0; i < 10; i++) trade(p, 'buy');
  const hot = demandIndex(kindOf(p));
  update((s) => { s.club.market.at = Date.now() - 3 * 86_400_000; });
  // reading through price() decays the tally
  price(p);
  const later = demandIndex(kindOf(p), getState());
  assert.ok(later < hot, `decayed (${hot} → ${later})`);
});

test('the playable tournament runs from the draw to a final', () => {
  const t = tourney.start('Saudi Arabia');
  assert.ok(t && t.stage === 'group' && t.fixtures.length === 3);
  assert.ok(t.groups[t.groupIndex].includes('Saudi Arabia'));
  // win every group game 3-0
  for (let i = 0; i < 3; i++) { assert.ok(tourney.nextMatch()); tourney.onResult(3, 0); }
  let c = tourney.current();
  assert.equal(c.stage, 'r16');
  assert.ok(c.bracket && c.bracket.length === 8);
  assert.ok(tourney.groupTable(c)[0].id === 'Saudi Arabia');
  for (const stage of ['qf', 'sf', 'final', 'done']) {
    const m = tourney.nextMatch();
    assert.ok(m && !m.played, `a knockout tie to play (${stage})`);
    const p = tourney.matchParams();
    assert.ok(p.homeSquad.xi.length === 11 && p.awaySquad.xi.length === 11 && p.showpiece === 'wonder');
    const r = tourney.onResult(2, 1);
    c = tourney.current();
    assert.equal(c.stage, stage);
    if (stage === 'done') assert.ok(r.champion && c.champion);
  }
  assert.ok(getState().club.pending.some((x) => /champions/.test(x.title)), 'the win banks a reward');
  tourney.quit();
  assert.equal(tourney.current(), null);
});

test('losing a knockout tie ends the tournament', () => {
  tourney.start('Brazil');
  for (let i = 0; i < 3; i++) tourney.onResult(2, 0);
  assert.equal(tourney.current().stage, 'r16');
  const r = tourney.onResult(0, 1);
  assert.ok(r.out && tourney.current().out);
  assert.equal(tourney.nextMatch(), null);
});

test('national stadiums are distinct, deterministic, and used for national sides', () => {
  const a = nationalStadium('Saudi Arabia', 80, ['#006c35', '#ffffff']);
  assert.deepEqual(a, nationalStadium('Saudi Arabia', 80, ['#006c35', '#ffffff']));
  const b = nationalStadium('Brazil', 91, ['#009c3b', '#ffdf00']);
  assert.notEqual(a.id, b.id);
  assert.ok(b.size > a.size);
  const st = stadiumFor({ id: 'nat-Saudi Arabia', name: 'Saudi Arabia', national: true, rating: 80, colors: ['#006c35', '#ffffff'] });
  assert.ok(st.national && /Saudi Arabia/.test(st.name));
  assert.ok(stadiumFor({ id: 'x' }, { showpiece: 'wonder' }).wonder);
});
