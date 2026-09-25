import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const guard = require('../../server/guard.js');

test('token buckets: a burst is allowed, then refused, failures can be charged', () => {
  const key = `t:${Math.random()}`;
  for (let i = 0; i < 3; i++) assert.equal(guard.allow(key, 3, 0), true);
  assert.equal(guard.allow(key, 3, 0), false);
  assert.equal(guard.peek(key, 3, 0), false);
  const k2 = `s:${Math.random()}`;
  guard.spend(k2, 1, 0); guard.spend(k2, 1, 0);
  assert.equal(guard.peek(k2, 1, 0), false, 'spend can drive a bucket negative');
});

test('sanitiseSave clamps balances, dedupes collections and caps size', () => {
  const { save, notes } = guard.sanitiseSave(
    { club: { apex: 99e9, ultimate: -5, collection: ['a', 'a', 'b', 7, 'c'], packs: ['bronze'] } },
    null, 0, null);
  assert.ok(save.club.apex <= 10_000_000);
  assert.equal(save.club.ultimate, 0);
  assert.deepEqual(save.club.collection, ['a', 'b', 'c']);
  assert.ok(notes.length >= 2);
  const big = guard.sanitiseSave({ club: { blob: 'x'.repeat(guard.MAX_SAVE_BYTES + 10) } }, { kept: true }, 0, null);
  assert.deepEqual(big.save, { kept: true });
  assert.deepEqual(guard.sanitiseSave('junk', { kept: 1 }, 0, null).save, { kept: 1 });
  assert.equal(guard.sanitiseSave(null, null, 0, null).save, null);
});

test('sanitiseSave holds a rise to the hourly budget but never touches spending', () => {
  const gain = { since: 0, spent: 0 };
  const prev = { club: { apex: 100_000 } };
  const up = guard.sanitiseSave({ club: { apex: 5_000_000 } }, prev, 0, gain);
  assert.ok(up.save.club.apex <= 100_000 + 1_000_000);
  const down = guard.sanitiseSave({ club: { apex: 10 } }, prev, 0, gain);
  assert.equal(down.save.club.apex, 10);
});

test('checkResult refuses anyone without a live match and clamps the score', () => {
  assert.equal(guard.checkResult({}, { scored: 1 }).ok, false);
  assert.equal(guard.checkResult({ acct: {} }, { scored: 1 }).ok, false);
  const peer = { acct: {}, opponent: {}, matchId: 1 };
  const r = guard.checkResult(peer, { scored: 999, conceded: -4, divIdx: 99 });
  assert.equal(r.ok, true);
  assert.equal(r.scored, 30);
  assert.equal(r.conceded, 0);
  assert.equal(r.divIdx, 20);
  assert.equal(guard.checkResult({ ...peer, reported: true }, { scored: 1 }).ok, false);
});

test('wire hygiene: clubs and squads are cut down to size', () => {
  const c = guard.cleanClub({ name: 'x'.repeat(80), short: 'ABCDEFG', colors: ['red', '#123456'] });
  assert.equal(c.name.length, 24);
  assert.equal(c.short.length, 4);
  assert.equal(c.colors[0], '#22c55e');
  assert.equal(c.colors[1], '#123456');
  assert.equal(guard.cleanClub(null), null);
  const sq = guard.cleanSquad([...Array(40).keys()].map((i) => `p${i}`).concat([5, 'x'.repeat(30)]));
  assert.ok(sq.length <= 24 && sq.every((id) => typeof id === 'string'));
  assert.equal(guard.cleanSquad('nope'), null);
  assert.ok(guard.MAX_RELAY_BYTES >= 8192);
});

test('v116: a kit on the wire is colours and a pattern name, or nothing', () => {
  const good = { home: { shirt: '#D7263D', trim: '#f4f4f4', shorts: '#151515', socks: '#d7263d', pattern: 'stripes' }, away: { shirt: '#f4f4f4', trim: '#d7263d', shorts: '#f4f4f4', socks: '#f4f4f4', pattern: 'plain' } };
  const k = guard.cleanKit(good);
  assert.equal(k.home.shirt, '#d7263d');
  assert.equal(k.home.pattern, 'stripes');
  assert.deepEqual(Object.keys(k.home).sort(), ['pattern', 'shirt', 'shorts', 'socks', 'trim']);
  // anything else is dropped whole: no text, no markup, no extra fields riding along
  assert.equal(guard.cleanKit({ ...good, home: { ...good.home, shirt: 'red' } }), null);
  assert.equal(guard.cleanKit({ ...good, home: { ...good.home, pattern: '<img src=x>' } }), null);
  assert.equal(guard.cleanKit({ home: good.home }), null);
  assert.equal(guard.cleanKit('hello'), null);
  assert.equal(guard.cleanKit(null), null);
  const extra = guard.cleanKit({ ...good, note: 'hi', home: { ...good.home, name: 'free text' } });
  assert.equal(extra.note, undefined); assert.equal(extra.home.name, undefined);
});
