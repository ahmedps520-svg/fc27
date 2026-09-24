/**
 * v97: a repeatable SBC is a sink, never a mint. Seven quick SBCs paid a pack
 * holding as many cards as they took (or more) and four more paid one only a
 * card or two short; farmed, they returned up to ~35× what the cards had cost
 * in packs (tools/sbc-audit.mjs has the numbers). The rule the audit
 * supports: a quick repeatable pays Apex only, and a repeatable that pays a
 * pack takes at least six more cards than the pack gives back.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { CHALLENGES, sizeOf } = await import('../../js/data/challenges.js');
const { PACKS } = await import('../../js/data/packs.js');

test('every repeatable SBC takes far more cards than it gives back', () => {
  for (const c of CHALLENGES.filter((x) => x.repeatable)) {
    if (!c.reward.pack) continue;
    const pack = PACKS.find((p) => p.id === c.reward.pack);
    assert.ok(pack, `${c.id}: unknown pack ${c.reward.pack}`);
    assert.ok(sizeOf(c) - pack.size >= 6, `${c.id}: takes ${sizeOf(c)} cards, its ${pack.id} pack gives ${pack.size} back`);
  }
});

test('no repeatable SBC hands out a card', () => {
  for (const c of CHALLENGES.filter((x) => x.repeatable)) assert.ok(!c.reward.card, c.id);
});
