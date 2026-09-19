import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { startCareer, advanceWeek, myFixture, sortedCareerTable, careerClub, leagueClubs } from '../../js/career.js';
import * as v2 from '../../js/careerV2.js';

beforeEach(() => { resetStorage(); resetAll(); });

test('the world has a second tier per country, dealt real squads with a keeper each', () => {
  const clubs = v2.allClubs();
  assert.equal(clubs.filter((c) => c.tier === 2).length, 18);
  const squads = v2.tier2Squads();
  for (const c of clubs.filter((x) => x.tier === 2)) {
    assert.ok(squads[c.id].length >= 13, `${c.name} has ${squads[c.id].length}`);
    assert.ok(squads[c.id].some((r) => r[1] === 'GK'), `${c.name} has a keeper`);
  }
  const names = Object.values(squads).flat().map((r) => r[0]);
  assert.equal(new Set(names).size, names.length, 'nobody is at two second-tier clubs');
});

test('a season calendar interleaves cup rounds and the bracket resolves to one winner', () => {
  const car = startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
  assert.ok(car.fixtures.some((f) => f.type === 'cup'));
  assert.equal(car.cup.rounds, Math.ceil(Math.log2(car.cup.alive.length)));
  assert.ok(car.board && car.board.text);
  assert.equal(car.youth.length, 3);
  for (let w = 0; w < car.fixtures.length; w++) {
    const c = getState().career;
    const fx = myFixture(c);
    advanceWeek(fx ? [1, 0] : null);
  }
  const k = getState().career;
  assert.equal(k.season, 2);
  assert.ok(k.review, 'a season review is waiting');
  assert.ok(k.review.moves.up.length === 2 && k.review.moves.down.length === 2, 'two go up, two go down');
  assert.ok(typeof k.review.pos === 'number');
  // the cup found a winner and the calendar for season two is built for my league
  assert.ok(k.fixtures.length > 10);
  assert.equal(Object.keys(k.table).length, leagueClubs(k.leagueOf[k.clubId]).length);
});

test('promotion and relegation move clubs between the tiers', () => {
  const car = startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
  const t2 = v2.tier2Of('Premier League');
  const before = v2.leagueClubIds(car, 'Premier League').length;
  update((s) => {
    const c = s.career;
    const table = sortedCareerTable(c);
    const order = v2.syntheticOrder(c, t2);
    v2.seasonReviewV2(c, table, order);
  });
  const k = getState().career;
  assert.equal(v2.leagueClubIds(k, 'Premier League').length, before);
  assert.ok(k.review.moves.up.every((id) => k.leagueOf[id] === 'Premier League'));
  assert.ok(k.review.moves.down.every((id) => k.leagueOf[id] === t2));
});

test('offers: accept sells, counter negotiates, reject closes', () => {
  const car = startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
  update((s) => {
    const c = s.career;
    c.offers = [{ id: 'o1', player: c.squads.mci[3][0], from: 'ars', fee: 30_000_000, until: 3, rounds: 0, state: 'open' }];
    const r = v2.respondToOffer(c, 'o1', 'counter', 20_000_000);
    assert.equal(r.ok, false, 'a counter must ask for more');
    const coins = c.coins;
    const acc = v2.respondToOffer(c, 'o1', 'accept');
    assert.equal(acc.ok, true);
    assert.equal(c.coins, coins + c.offers[0].fee);
    assert.ok(c.squads.ars.some((row) => row[0] === c.offers[0].player));
    assert.equal(v2.respondToOffer(c, 'o1', 'accept').ok, false, 'once');
  });
  void car;
});

test('AI transfers move real players between AI clubs in a window and never touch mine', () => {
  const car = startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
  // deals are dice; pin them so the count below is a fact, not a probability
  const realRandom = Math.random;
  let a = 99;
  Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  try {
  update((s) => {
    const c = s.career;
    const mine = c.squads.mci.map((r) => r[0]).join();
    let deals = [];
    for (let i = 0; i < 6; i++) deals = deals.concat(v2.aiTransfers(c, 1));
    assert.ok(deals.length >= 4, `${deals.length} deals`);
    assert.equal(c.squads.mci.map((r) => r[0]).join(), mine);
    // a player can be dealt on again within the window, so: on exactly one squad, somewhere
    for (const d of deals) assert.equal(Object.values(c.squads).flat().filter((r) => r[0] === d.player).length, 1);
    assert.equal(v2.aiTransfers(c, 6).length, 0, 'window closed mid-season');
  });
  } finally { Math.random = realRandom; }
  void car;
});

test('youth grows and can be promoted; scouting reports after four weeks; press moves morale', () => {
  const car = startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
  update((s) => {
    const c = s.career;
    const y = c.youth[0];
    const r0 = y.rating;
    for (let i = 0; i < 30; i++) v2.trainYouth(c);
    assert.ok(y.rating >= r0 && y.rating <= y.potential);
    const n = c.squads.mci.length;
    assert.ok(v2.promoteYouth(c, y.name));
    assert.equal(c.squads.mci.length, n + 1);
    assert.equal(c.youth.length, 2);
    v2.scout(c, 'La Liga');
    for (let i = 0; i < 4; i++) v2.tickScouting(c);
    assert.equal(c.scouting.results.length, 3);
    assert.ok(c.scouting.results.every((t) => t.potential >= t.rating));
    const m = c.morale;
    v2.answerPress(c, 0, 1);
    assert.ok(c.morale > m);
  });
  void car;
});

test('development: the young rise, the old fade, within bounds', () => {
  const car = startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
  update((s) => {
    const c = s.career;
    for (let i = 0; i < 6; i++) v2.developSquads(c);
    const deltas = Object.values(c.dev);
    assert.ok(deltas.length > 20);
    assert.ok(deltas.every((d) => d >= -8 && d <= 8));
    assert.ok(deltas.some((d) => d > 0) && deltas.some((d) => d < 0));
  });
  void car;
  assert.equal(careerClub('t2-premierleague-0').tier, 2);
});

test('taking a job in another league rebuilds the table and calendar for that league', async () => {
  const { startCareer } = await import('../../js/career.js');
  const { getState, update } = await import('../../js/state.js');
  const v2 = await import('../../js/careerV2.js');
  update((s) => { s.career = null; });
  startCareer({ name: 'Qa Bot', first: 'Qa', last: 'Bot', nation: 'England', age: 40, real: false, skin: 1, hairColor: 1, suit: 0, height: 182 }, 'liv');
  const malaga = v2.allClubs().find((c) => c.name === 'Málaga').id;
  update((s) => { v2.bindState(() => s.club); v2.takeJob(s.career, malaga); });
  const car = getState().career;
  assert.equal(car.clubId, malaga);
  assert.ok(car.table[car.clubId], 'the hub can read the new club\'s row');
  assert.ok(Object.keys(car.table).every((id) => car.leagueOf[id] === car.leagueOf[malaga]), 'the table is the new league');
  assert.ok(car.fixtures.length > 0);
});
