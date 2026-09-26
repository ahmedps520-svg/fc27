/**
 * v126 — the store: a core set always on the shelf, four packs on rotation a
 * week, a Promo shelf for what is new, updated, back or seasonal; the National
 * Day pack and the Saudi Icons.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { PACKS, CORE_PACKS, ROTATION_SIZE, rotationFor, storeCatalog, samplePulls, __openPackForTest } = await import('../../js/data/packs.js');
const { WORLD, getPlayer } = await import('../../js/data/generator.js');
const { EVENT_CAMPAIGNS } = await import('../../js/data/promos.js');
const { SAUDI_ICONS } = await import('../../js/data/pools.js');

const WEEK = 7 * 86_400_000;

test('the shelf is the core set plus four on rotation — not all twenty-eight', () => {
  const now = Date.parse('2026-10-05T12:00:00Z');
  const cat = storeCatalog(now);
  const ids = cat.map((x) => x.pack.id);
  for (const id of CORE_PACKS) assert.ok(ids.includes(id), `core pack ${id} on the shelf`);
  const rot = ids.filter((id) => !CORE_PACKS.has(id));
  assert.equal(rot.length, ROTATION_SIZE);
  assert.ok(cat.length < PACKS.length - 8, `${cat.length} on the shelf of ${PACKS.length}`);
  assert.ok(!ids.includes('nationalday'), 'the National Day pack is not on outside its season');
  for (const x of cat) if (!CORE_PACKS.has(x.pack.id)) assert.ok(x.leavesIn > 0 && x.leavesIn <= WEEK, 'a rotating pack says when it leaves');
});

test('every rotating pack comes round, and a week always shows the same four', () => {
  const week = 2960;
  assert.deepEqual(rotationFor(week), rotationFor(week));
  const seen = new Set();
  for (let w = week; w < week + 8; w++) for (const id of rotationFor(w)) seen.add(id);
  const rotating = PACKS.filter((p) => !CORE_PACKS.has(p.id) && !p.season).map((p) => p.id);
  for (const id of rotating) assert.ok(seen.has(id), `${id} comes round within eight weeks`);
});

test('the Promo shelf badges: back this week, and the season pack in its window', () => {
  const now = Date.parse('2026-10-05T12:00:00Z');
  const cat = storeCatalog(now);
  const back = cat.filter((x) => x.badge === 'back');
  assert.ok(back.length >= 1, 'something is back this week');
  const nd = storeCatalog(now, { season: 'nationalDay' }).find((x) => x.pack.id === 'nationalday');
  assert.equal(nd?.badge, 'season');
});

test('the Saudi Icons: eleven, appended last, Icon rarity, every id before them unchanged', () => {
  const icons = WORLD.icons.map(getPlayer).filter((p) => p.saudiIcon);
  assert.equal(icons.length, SAUDI_ICONS.length);
  assert.equal(icons.length, 11);
  const maxBefore = Math.max(...WORLD.players.filter((p) => !p.saudiIcon).map((p) => Number(p.id.slice(1))));
  for (const p of icons) {
    assert.equal(p.rarity, 'icon'); assert.equal(p.nation, 'Saudi Arabia');
    assert.ok(Number(p.id.slice(1)) > maxBefore, `${p.name} (${p.id}) comes after every other card`);
    assert.ok(p.overall >= 90 && p.overall <= 97);
  }
  assert.deepEqual([...new Set(icons.map((p) => p.position))].sort(), ['CAM', 'CB', 'CM', 'GK', 'LB', 'LW', 'RB', 'ST'], 'a whole XI');
});

test('the National Day pack: one National Day card or a Saudi Icon, Saudi filler', () => {
  const pack = PACKS.find((p) => p.id === 'nationalday');
  let icons = 0; let nd = 0;
  for (let i = 0; i < 240; i++) {
    const pulls = __openPackForTest(pack);
    assert.equal(pulls.length, 3);
    for (const { p } of pulls) assert.equal(p.nation, 'Saudi Arabia', `${p.name} is Saudi`);
    const promo = pulls[0].p;
    if (promo.saudiIcon) icons += 1; else { assert.equal(promo.rarity, 'nationalday'); nd += 1; }
  }
  assert.ok(icons > 5 && icons < 45, `${icons} Saudi Icons in 240 packs (1 in 12 is 20)`);
  assert.ok(nd > 190);
  const shelf = samplePulls(pack);
  assert.ok(shelf[0].saudiIcon, 'the shelf shows an Icon it can pull');
  const c = EVENT_CAMPAIGNS[0];
  assert.ok(!getPlayer('pr:nationalday:' + WORLD.players.find((p) => p.nation === 'France').id), 'a non-Saudi card has no National Day version');
  assert.equal(c.id, 'nationalday');
});
