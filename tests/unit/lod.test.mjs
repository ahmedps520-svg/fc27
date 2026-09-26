/**
 * v132 — levels of detail for the scanned players, the per-tier triangle cap,
 * and Auto quality on phones.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickLods, capFor, LOD_TRIS } from '../../js/game/lodPolicy.js';
import { resolveQuality } from '../../js/game/quality.js';

const field = (n = 23, cur = 2) => Array.from({ length: n }, (_, i) => ({ d: 8 + i * 4, ahead: true, cur }));
const counts = (lv) => ({ full: lv.filter((x) => x === 0).length, light: lv.filter((x) => x === 1).length, built: lv.filter((x) => x === 2).length });
const cost = (lv) => lv.reduce((a, x) => a + LOD_TRIS[x], 0);

test('High: a few full scans near the lens, light ones next, built figures far off', () => {
  const c = counts(pickLods(field(), 'high'));
  assert.deepEqual(c, { full: 4, light: 8, built: 11 });
  // the broadcast lens sits back: nobody is near enough for the full scan
  assert.equal(counts(pickLods(field().map((e) => ({ ...e, d: e.d + 30 })), 'high')).full, 0);
});

test('Ultra: never a built figure; replays and close-ups open the counts', () => {
  assert.equal(counts(pickLods(field(), 'cinema')).built, 0);
  assert.equal(counts(pickLods(field(), 'cinema', true)).full, 23);
  assert.ok(counts(pickLods(field(), 'high', true)).full >= 10);
});

test('every tier stays under its cap, and the cap is well under the old 23 full scans', () => {
  const old = 23 * LOD_TRIS[0];
  for (const tier of ['high', 'cinema']) for (const close of [false, true]) {
    const lv = pickLods(field(), tier, close);
    assert.ok(cost(lv) <= capFor(tier, close), `${tier} ${close ? 'close' : 'play'}: ${cost(lv)} > ${capFor(tier, close)}`);
  }
  assert.ok(capFor('high') < old * 0.4, `High in play: ${capFor('high')} vs ${old}`);
  assert.ok(capFor('cinema') < old * 0.6);
  assert.equal(capFor('medium'), 23 * LOD_TRIS[2], 'Low and Medium: the built figure for everyone');
});

test('behind the lens is never given the full scan; a player holds his level at the line', () => {
  const list = field(); list[0].ahead = false;
  assert.notEqual(pickLods(list, 'high')[0], 0);
  // two players straddling the full-scan distance: the one who has it keeps it
  const edge = [{ d: 25, ahead: true, cur: 0 }, { d: 23, ahead: true, cur: 1 }];
  const lv = pickLods([...edge, ...field(21).map((e) => ({ ...e, d: e.d + 40 }))], 'high');
  assert.equal(lv[0], 0, 'at 25 m with the full scan: still inside 24 m / 0.88');
});

test('Auto on a phone: Medium on a capable GPU, Low on a budget one, never High', () => {
  const phone = { phone: true, touch: true, small: true, cores: 8, memory: 8 };
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'Apple GPU' }), 'medium');
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'Adreno (TM) 740' }), 'medium');
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'Mali-G52' }), 'low');
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'Adreno (TM) 740', memory: 3 }), 'low');
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'NVIDIA GeForce RTX 4090' }), 'medium', 'even a desktop-class GPU name');
  assert.equal(resolveQuality('high', { ...phone }), 'high', 'an explicit choice is kept');
});
