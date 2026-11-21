/**
 * v206 — every pack's ceiling (data/packs.js packCap), with the real draw:
 * nothing above it comes out, the shelf shows nothing above it, cheap packs
 * never reach the top of the game, and the promises the packs make still
 * hold (Prime 82+, Form 78+, Double Down's Special, Gold's gold, the Limited
 * packs' Star and Icon).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
import '../../js/data/promos.js';
import { PACKS, PACK_BY_ID, packCap, samplePulls, __openPackForTest as openPack, RARITY_RANK } from '../../js/data/packs.js';

const N = 300;
const opens = (id, n = N) => Array.from({ length: n }, () => openPack(PACK_BY_ID(id), new Set()));

test('nothing comes out of a pack above its ceiling, and the shelf shows nothing above it', () => {
  for (const pk of PACKS) {
    const cap = packCap(pk);
    if (!cap) continue;
    for (const pulls of opens(pk.id, 150)) {
      const slots = pk.variant ? pulls.slice(1) : pulls;          // a promo pack's slot 0 is its promise
      for (const x of slots) assert.ok(x.p.overall <= cap, `${pk.id}: ${x.p.overall} > ${cap}`);
    }
    if (!pk.variant) for (const p of samplePulls(pk, 3)) assert.ok(p.overall <= cap, `${pk.id} shelf shows ${p.overall}`);
  }
});

test('cheap packs stay cheap: the free Bronze tops out at 74, Silver at 80, Gold at 85; no 90 under 30,000', () => {
  assert.equal(packCap(PACK_BY_ID('bronze')), 74);
  assert.equal(packCap(PACK_BY_ID('silver')), 80);
  assert.equal(packCap(PACK_BY_ID('gold')), 85);
  for (const pk of PACKS) if (pk.cost < 30000 && !pk.variant && packCap(pk)) assert.ok(packCap(pk) < 90, `${pk.id} (${pk.cost})`);
  for (const id of ['bronze', 'fodder', 'silver']) assert.ok(samplePulls(PACK_BY_ID(id), 3).every((p) => p.overall < 81), `${id}'s shelf`);
  // an event pack from events.json is capped by its price
  assert.equal(packCap({ id: 'ev-x', cost: 6000 }), 83);
  assert.equal(packCap({ id: 'ev-y', cost: 0 }), 74);
});

test('the packs\' promises still hold under their ceilings', () => {
  for (const pulls of opens('prime')) assert.ok(pulls.every((x) => x.p.overall >= 82), 'Prime: 82+');
  for (const pulls of opens('form')) assert.ok(pulls.every((x) => x.p.overall >= 78), 'Form: 78+');
  for (const pulls of opens('gamble')) assert.ok(pulls.every((x) => x.p.overall >= 83), 'High Roller: 83+');
  for (const pulls of opens('double')) assert.ok(pulls.some((x) => RARITY_RANK[x.p.rarity] >= RARITY_RANK.special), 'Double Down: a Special');
  for (const pulls of opens('gold')) assert.ok(pulls.some((x) => RARITY_RANK[x.p.rarity] >= RARITY_RANK.gold), 'Gold: a gold');
  for (const pulls of opens('stars', 60)) assert.ok(pulls.some((x) => x.p.rarity === 'star'), 'Stars: a Star');
  for (const pulls of opens('limited', 60)) assert.ok(pulls.some((x) => x.p.rarity === 'icon'), 'Limited: an Icon');
  for (const id of ['vault', 'stars', 'limited', 'wonder', 'legend']) assert.equal(packCap(PACK_BY_ID(id)), null, `${id} keeps its promise uncapped`);
});
