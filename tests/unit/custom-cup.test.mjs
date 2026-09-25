/**
 * v118 (backlog #16): the Custom Cup. A cup is drawn from any 4, 8 or 16
 * teams; your ties are played, the rest are seeded from the two ratings (so
 * the same cup settles the same way); a drawn tie of yours goes to penalties;
 * out of it, the cup plays itself out to a champion; it pays nothing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { getState, update } = await import('../../js/state.js');
const cupMod = await import('../../js/customCup.js');
const { createCup, cup, yourTie, onResult, allTeams, CUP_SIZES, matchParams } = cupMod;

const ids = (n) => allTeams().slice(0, n).map((t) => t.id);

test('only 4, 8 or 16 teams, and yours among them', () => {
  assert.ok(createCup({ name: 'x', ids: ids(6), you: ids(6)[0] }).error);
  assert.ok(createCup({ name: 'x', ids: ids(8), you: 'nobody' }).error);
  for (const n of CUP_SIZES) {
    const c = createCup({ name: 'Test', ids: ids(n), you: ids(n)[0], seed: 1 });
    assert.equal(c.rounds[0].length, n / 2);
    const flat = c.rounds[0].flatMap((t) => [t.a, t.b]).sort();
    assert.deepEqual(flat, ids(n).slice().sort(), 'everyone drawn once');
  }
});

test('win every tie: you lift it, round by round', () => {
  createCup({ name: 'Run', ids: ids(8), you: ids(8)[3], seed: 7 });
  const apex0 = getState().club.apex;
  let r; let rounds = 0;
  while (yourTie()) { r = onResult(2, 0); rounds += 1; }
  assert.equal(rounds, 3);
  assert.ok(r.champion && cup().done && cup().champion === ids(8)[3]);
  assert.equal(getState().club.apex, apex0, 'a cup pays nothing');
});

test('lose: out, and the cup plays itself out to a champion', () => {
  createCup({ name: 'Short', ids: ids(16), you: ids(16)[0], seed: 3 });
  const r = onResult(0, 1);
  assert.equal(r.won, false);
  const c = cup();
  assert.ok(c.out && c.done && c.champion && c.champion !== ids(16)[0]);
  assert.equal(c.rounds.length, 4);
  assert.equal(yourTie(), null);
});

test('a draw of yours goes to penalties; the rest of the cup settles the same way twice', () => {
  const a = createCup({ name: 'Same', ids: ids(8), you: ids(8)[1], seed: 11 });
  const r = onResult(1, 1);
  assert.equal(r.pens, true);
  const first = JSON.stringify(cup().rounds);
  createCup({ name: 'Same', ids: ids(8), you: ids(8)[1], seed: 11 }); onResult(1, 1);
  assert.equal(JSON.stringify(cup().rounds), first);
  void a;
});

test('your match: you at home, both squads travelling', () => {
  createCup({ name: 'Play', ids: ids(4), you: ids(4)[2], seed: 5 });
  const p = matchParams(['w1', 'w2']);
  assert.ok(p.customCup && p.homeSquad?.xi?.length >= 11 && p.awaySquad?.xi?.length >= 11);
  assert.equal(p.homeSquad.name, allTeams().find((t) => t.id === ids(4)[2]).name);
});
