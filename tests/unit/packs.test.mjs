import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
import { PACKS, PACK_BY_ID, rollRarity, drawPlayer, openPack, dupValue, RARITY_RANK, packTone } from '../../js/data/packs.js';
import { WORLD } from '../../js/data/generator.js';

test('every pack is well formed and its odds sum to one', () => {
  const ids = new Set();
  for (const p of PACKS) {
    assert.ok(!ids.has(p.id), `duplicate pack id ${p.id}`); ids.add(p.id);
    assert.ok(p.size >= 1 && p.size <= 12, `${p.id} size`);
    assert.ok(p.cost >= 0);
    const sum = Object.values(p.odds).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-6, `${p.id} odds sum ${sum}`);
    for (const r of Object.keys(p.odds)) assert.ok(r in RARITY_RANK, `${p.id} odds name ${r}`);
    assert.equal(typeof packTone(p), 'string');
  }
  assert.equal(PACK_BY_ID('nope'), PACKS[0]);
  assert.equal(PACK_BY_ID('gold').id, 'gold');
});

test('rollRarity only ever returns a rarity the odds name', () => {
  const odds = { bronze: 0.5, silver: 0.3, gold: 0.2 };
  for (let i = 0; i < 500; i++) assert.ok(rollRarity(odds) in odds);
});

test('drawPlayer prefers cards you do not own and honours a filter', () => {
  const golds = WORLD.players.filter((p) => p.rarity === 'gold');
  const seen = new Set(golds.slice(1).map((p) => p.id));
  for (let i = 0; i < 20; i++) assert.equal(drawPlayer('gold', seen).id, golds[0].id);
  const gk = drawPlayer('silver', new Set(), (p) => p.position === 'GK');
  assert.equal(gk.position, 'GK');
});

test('openPack delivers the advertised size, floor and guarantee', () => {
  for (const pack of PACKS) {
    for (let i = 0; i < 25; i++) {
      const drawn = openPack(pack, new Set());
      assert.equal(drawn.length, pack.size, `${pack.id} size`);
      for (const { p, dup } of drawn) {
        assert.ok(p && p.id, 'a real card');
        assert.equal(dup, false, 'nothing is a dup of an empty collection');
        if (pack.minOverall) assert.ok(p.overall >= pack.minOverall, `${pack.id} promised ${pack.minOverall}+ got ${p.overall}`);
        if (pack.limited) assert.ok(RARITY_RANK[p.rarity] >= RARITY_RANK.gold, `${pack.id} limited got ${p.rarity}`);
      }
      // `floor` promises that at least one card clears the bar (see openPack)
      if (pack.floor) assert.ok(drawn.some(({ p }) => RARITY_RANK[p.rarity] >= RARITY_RANK[pack.floor]), `${pack.id} floor ${pack.floor}`);
      if (pack.guarantee) assert.ok(drawn.some(({ p }) => p.rarity === pack.guarantee), `${pack.id} guarantee ${pack.guarantee}`);
      if (pack.forcePosition) assert.ok(drawn.some(({ p }) => p.position === pack.forcePosition), `${pack.id} guarantee`);
    }
  }
});

test('a needGK pack always carries a keeper; a full collection pays in dups', () => {
  for (let i = 0; i < 30; i++) {
    const drawn = openPack(PACK_BY_ID('bronze'), new Set(), true);
    assert.ok(drawn.some(({ p }) => p.position === 'GK'));
  }
  const all = new Set(WORLD.players.map((p) => p.id));
  const drawn = openPack(PACK_BY_ID('silver'), all);
  assert.ok(drawn.every(({ dup }) => dup));
  for (const { p } of drawn) assert.ok(dupValue(p) > 0 && Number.isInteger(dupValue(p)));
});
