/** v150 — a promo card knows its campaign, for its own reveal. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { campaignOfCard, CAMPAIGNS, campaignCards } = await import('../../js/data/promos.js');

test('a promo card id names its campaign; any other card has none', () => {
  for (const c of CAMPAIGNS) {
    const card = campaignCards(c)[0];
    assert.ok(card, `${c.id} has cards`);
    assert.equal(campaignOfCard(card.id)?.id, c.id);
    assert.equal(campaignOfCard(card.id).colors.length, 2);
  }
  assert.equal(campaignOfCard('p123'), null);
  assert.equal(campaignOfCard(undefined), null);
});
