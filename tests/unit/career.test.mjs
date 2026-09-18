import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState } from '../../js/state.js';
import {
  CAREER_CLUBS, REAL_MANAGERS, careerClub, START_COINS, leagueClubs, makeFixtures, startCareer,
  myFixture, simScore, advanceWeek, sortedCareerTable, askingPrice, respondToFee, respondToTerms,
  frozenOut, TALKS_FREEZE_WEEKS, parseAmount, fmtCoins, MONTHS_PER_WEEK, squadOf, clubOverall, resolveEntry,
} from '../../js/career.js';

beforeEach(() => { resetStorage(); resetAll(); });

test('the career world: 35 real clubs across 6 leagues, Pep only', () => {
  assert.equal(CAREER_CLUBS.length, 35);
  assert.equal(new Set(CAREER_CLUBS.map((c) => c.league)).size, 6);
  assert.equal(REAL_MANAGERS.length, 1);
  for (const c of CAREER_CLUBS) {
    assert.ok(squadOf(c.id).length >= 16, `${c.name} squad`);
    const ov = clubOverall(c.id);
    assert.ok(ov > 55 && ov < 95, `${c.name} overall ${ov}`);
  }
});

test('fixtures: every club in the league plays every other twice, once at home', () => {
  for (const league of new Set(CAREER_CLUBS.map((c) => c.league))) {
    const clubs = leagueClubs(league).map((c) => c.id);
    const rounds = makeFixtures(league);
    const seen = new Map();
    for (const round of rounds) for (const [h, a] of round) {
      assert.notEqual(h, a);
      seen.set(`${h}>${a}`, (seen.get(`${h}>${a}`) || 0) + 1);
    }
    for (const h of clubs) for (const a of clubs) if (h !== a) assert.equal(seen.get(`${h}>${a}`), 1, `${league}: ${h} v ${a}`);
  }
});

test('starting a career and playing a week', () => {
  const club = CAREER_CLUBS[0];
  const car = startCareer({ name: 'Test', nation: 'England', age: 40 }, club.id);
  assert.equal(car.coins, START_COINS);
  assert.equal(car.week, 1);
  assert.ok(car.squads[club.id].length > 10);
  const fx = myFixture(car);
  assert.ok(fx === null || fx.home === club.id || fx.away === club.id);
  advanceWeek([2, 1]);
  const after = getState().career;
  assert.equal(after.week, 2);
  const table = sortedCareerTable(after);
  assert.ok(table.length === leagueClubs(club.league).length);
  const played = table.reduce((n, r) => n + r.p, 0);
  assert.ok(played >= table.length - 2, 'the round was simulated for everyone');
});

test('simScore is plausible football', () => {
  const [a, b] = CAREER_CLUBS;
  for (let i = 0; i < 50; i++) {
    const [h, g] = simScore(a.id, b.id);
    assert.ok(Number.isInteger(h) && Number.isInteger(g) && h >= 0 && g >= 0 && h <= 6 && g <= 6);
  }
});

test('asking price follows the contract, and a fee negotiation has teeth', () => {
  const entry = { value: 50_000_000, form: 0 };
  const shortDeal = askingPrice(entry, { years: 1 });
  const longDeal = askingPrice(entry, { years: 4 });
  assert.ok(shortDeal < longDeal);
  const club = CAREER_CLUBS[0];
  const car = startCareer({ name: 'T', nation: 'Spain', age: 50 }, club.id);
  const ask = askingPrice(entry, { years: 2 });
  const neg = { player: 'Someone', rounds: 0, tension: 0, state: 'fee' };
  const ok = respondToFee(car, neg, ask, entry, { years: 2 });
  assert.equal(ok.ok, true);
  assert.equal(neg.state, 'terms');
  const neg2 = { player: 'Cheap', rounds: 0, tension: 0, state: 'fee' };
  const insult = respondToFee(car, neg2, ask * 0.1, entry, { years: 2 });
  assert.equal(insult.ok, false);
  assert.equal(neg2.state, 'off');
  assert.ok(frozenOut(car, 'Cheap'), 'an insulting bid freezes the player out');
  assert.equal(TALKS_FREEZE_WEEKS * MONTHS_PER_WEEK, 10, 'ten months');
  const neg3 = { player: 'Low', rounds: 0, tension: 0, state: 'fee' };
  const low = respondToFee(car, neg3, ask * 0.5, entry, { years: 2 });
  assert.equal(low.ok, false);
  assert.ok(neg3.tension > 0 && neg3.counter > ask * 0.5);
});

test('money shorthand', () => {
  assert.equal(parseAmount('500k'), 500_000);
  assert.equal(parseAmount('200m'), 200_000_000);
  assert.equal(parseAmount('1.5B'), 1_500_000_000);
  assert.equal(parseAmount('12,500'), 12500);
  assert.ok(Number.isNaN(parseAmount('lots')));
  assert.equal(fmtCoins(1_500_000), '1.5M');
  assert.equal(fmtCoins(2_000_000), '2M');
  assert.equal(fmtCoins(12_000), '12K');
});

test('resolveEntry names a real card with a contract', () => {
  const club = CAREER_CLUBS[0];
  const first = squadOf(club.id)[0];
  const entry = resolveEntry([first.name, first.position, first.nation], { years: 2 });
  assert.equal(entry.name, first.name);
  assert.ok(entry.overall > 40 && entry.value > 0 && entry.wage >= 4000);
  assert.deepEqual(entry.contract, { years: 2 });
  const stranger = resolveEntry(['Nobody Atall', 'CM', 'Wales'], null);
  assert.equal(stranger.overall, 74, 'an unknown name gets the default rating');
  assert.equal(careerClub(club.id), club);
});
