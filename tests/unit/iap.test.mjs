/**
 * v205 — App Store purchases (js/iap.js) against a stand-in for the StoreKit
 * plugin: each purchase credited exactly once and only then finished, a
 * cancel and an Ask-to-Buy wait credit nothing, the Starter Pack once, the
 * Season Pass as an entitlement (refund included), its paid track and its
 * celebration; and the product list the same as the one App Store Connect
 * is given (app/store/iap.json).
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resetStorage } from './_dom.mjs';

globalThis.APEX_APP_STORE = true;          // the App Store build (platform.js reads it on import)
const calls = { finished: [], unfinished: [], purchases: [], next: null };
globalThis.Capacitor = { Plugins: { NativePurchases: {
  getProducts: async ({ productIdentifiers }) => ({ products: productIdentifiers.map((id) => ({ identifier: id, priceString: '$X', price: 1, currencyCode: 'USD' })) }),
  purchaseProduct: async ({ productIdentifier, autoAcknowledgePurchases }) => {
    assert.equal(autoAcknowledgePurchases, false, 'never finished before it is credited');
    const n = calls.next; calls.next = null;
    if (n instanceof Error) throw n;
    return n || { transactionId: String(Date.now() + Math.random()), productIdentifier };
  },
  finishTransaction: async ({ transactionId }) => { calls.finished.push(transactionId); },
  getUnfinishedTransactions: async () => ({ transactions: calls.unfinished }),
  getPurchases: async () => ({ purchases: calls.purchases }),
  restorePurchases: async () => {},
  addListener: async () => ({ remove() {} }),
} } };

const { getState, resetAll, loadState } = await import('../../js/state.js');
const iap = await import('../../js/iap.js');
const progress = await import('../../js/progress.js');
const { locked } = await import('../../js/cosmetics.js');
const { season } = await import('../../js/live.js');
const { PREMIUM_TIERS, TIER_XP } = await import('../../js/data/season.js');
const P = (id) => iap.PRODUCTS.find((p) => p.id === id);

beforeEach(() => { resetStorage(); resetAll(); loadState(); calls.finished = []; calls.unfinished = []; calls.purchases = []; calls.next = null; });

test('the products are the ones App Store Connect is given, at the owner\'s prices', () => {
  const cfg = JSON.parse(fs.readFileSync(new URL('../../app/store/iap.json', import.meta.url), 'utf8'));
  assert.equal(cfg.prefix, iap.PREFIX);
  assert.deepEqual(cfg.products.map((p) => p.id), iap.PRODUCTS.filter((p) => p.type !== 'subscription').map((p) => p.id));
  assert.deepEqual(cfg.subscriptions.map((p) => p.id), iap.PRODUCTS.filter((p) => p.type === 'subscription').map((p) => p.id));
  assert.equal(cfg.subscriptions[0].baseTerritory, 'SAU'); assert.equal(Number(cfg.subscriptions[0].price), 15, '15 riyals');
  assert.ok(cfg.subscriptions[0].name.length <= 30 && cfg.subscriptions[0].description.length <= 45);
  for (const c of cfg.products) {  // the one-time products
    const p = P(c.id);
    assert.equal(Number(c.usd), p.usd, c.id);
    assert.equal(c.type, p.type === 'nonconsumable' ? 'NON_CONSUMABLE' : 'CONSUMABLE', c.id);
    assert.ok(c.name.length <= 30 && c.description.length <= 45, `${c.id}: Apple's limits`);
  }
  assert.deepEqual(iap.PRODUCTS.filter((p) => p.shelf === 'ultimate').map((p) => [p.grant.ultimate, p.usd]), [[20, 1.99], [55, 4.99], [110, 9.99], [240, 19.99], [650, 49.99]]);
  assert.deepEqual(iap.PRODUCTS.filter((p) => p.shelf === 'apex').map((p) => [p.grant.apex, p.usd]), [[10000, 0.99], [60000, 4.99], [130000, 9.99], [280000, 19.99], [750000, 49.99]]);
  assert.deepEqual(P('starter').grant, { ultimate: 20, apex: 10000, packs: ['prime'], starter: true });
  assert.equal(P('starter').usd, 0.99); assert.equal(P('pass.s2').usd, 4.99);
  assert.equal(iap.iapAvailable(), true);
});

test('a purchase is credited once and finished; the same transaction again only finishes', async () => {
  const before = getState().club.apex;
  calls.next = { transactionId: '1001', productIdentifier: iap.PREFIX + 'apex60k' };
  const r = await iap.buy(P('apex60k'));
  assert.equal(r.ok, true);
  assert.equal(getState().club.apex, before + 60000);
  assert.deepEqual(calls.finished, ['1001']);
  // it comes back unfinished on the next launch (say the finish was lost): finished again, not credited again
  calls.unfinished = [{ transactionId: '1001', productIdentifier: iap.PREFIX + 'apex60k' }];
  await iap.creditUnfinished();
  assert.equal(getState().club.apex, before + 60000);
  assert.deepEqual(calls.finished, ['1001', '1001']);
  // one bought and not finished (the app was closed mid-purchase) is credited on the sweep
  calls.unfinished = [{ transactionId: '1002', productIdentifier: iap.PREFIX + 'ult110' }];
  const got = await iap.creditUnfinished();
  assert.equal(got.length, 1); assert.equal(getState().club.ultimate, 110);
  // not ours: ignored
  assert.equal(await iap.settle({ transactionId: '9', productIdentifier: 'com.other.thing' }), null);
});

test('a cancel or an Ask-to-Buy wait credits nothing', async () => {
  const before = JSON.stringify(getState().club);
  calls.next = new Error('User cancelled');
  assert.deepEqual(await iap.buy(P('ult20')), { cancelled: true });
  calls.next = new Error('Transaction pending');
  assert.deepEqual(await iap.buy(P('ult20')), { pending: true });
  assert.equal(JSON.stringify(getState().club), before);
  assert.deepEqual(calls.finished, []);
});

test('the Starter Pack: its contents, once per player', async () => {
  const s0 = { apex: getState().club.apex, packs: getState().club.packs.length };
  calls.next = { transactionId: '2001', productIdentifier: iap.PREFIX + 'starter' };
  assert.equal((await iap.buy(P('starter'))).ok, true);
  const s = getState().club;
  assert.equal(s.ultimate, 20); assert.equal(s.apex, s0.apex + 10000); assert.equal(s.packs.length, s0.packs + 1); assert.equal(s.packs.at(-1), 'prime');
  assert.equal(s.starterBought, true);
  assert.ok((await iap.buy(P('starter'))).error, 'not offered twice');
});

test('the Season Pass: an entitlement, refunds included; its paid track and its celebration', async () => {
  assert.equal(locked('celebration', 'crown'), true, 'the Crown is the pass holder\'s');
  calls.next = { transactionId: '3001', productIdentifier: iap.PREFIX + 'pass.s2' };
  assert.equal((await iap.buy(P('pass.s2'))).ok, true);
  assert.equal(getState().club.pass.s2, true);
  assert.equal(locked('celebration', 'crown'), false);
  // the paid track: nothing past the tier reached, each tier once
  const se = season();
  assert.equal(se.id, 's2', 'Season 2 is the live season');
  getState().club.season = { id: se.id, xp: TIER_XP * 5 + 10, claimed: [] };
  const ult0 = getState().club.ultimate || 0;
  assert.deepEqual(progress.claimPremiumTier(1), PREMIUM_TIERS[0]);
  assert.equal(progress.claimPremiumTier(1), null, 'once');
  assert.equal(progress.claimPremiumTier(6), null, 'not reached yet');
  progress.claimPremiumTier(2); progress.claimPremiumTier(5);
  assert.equal(getState().club.ultimate, ult0 + PREMIUM_TIERS[1].ultimate);
  assert.equal(getState().club.packs.at(-1), 'prime');
  // StoreKit's list of what this Apple ID owns is the truth: a refund takes it away
  calls.purchases = [];
  await iap.syncEntitlements();
  assert.equal(getState().club.pass.s2, false);
  assert.equal(progress.claimPremiumTier(3), null, 'no pass, no paid rewards');
  calls.purchases = [{ transactionId: '3001', productIdentifier: iap.PREFIX + 'pass.s2' }];
  await iap.syncEntitlements();
  assert.equal(getState().club.pass.s2, true, 'restored');
  // a revoked transaction arriving through the update listener takes it away too
  await iap.settle({ transactionId: '3001', productIdentifier: iap.PREFIX + 'pass.s2', revocationDate: '2026-12-01T00:00:00Z' });
  assert.equal(getState().club.pass.s2, false);
});

test('the paid track is about 100 ✦, six Prime packs, a Vault Icon at 30 and the Crown at 1', () => {
  assert.equal(PREMIUM_TIERS.length, 30);
  assert.equal(PREMIUM_TIERS[0].celebration, 'crown');
  assert.equal(PREMIUM_TIERS[29].pack, 'vault');
  assert.equal(PREMIUM_TIERS.filter((r) => r.pack === 'prime').length, 6);
  const ult = PREMIUM_TIERS.reduce((a, r) => a + (r.ultimate || 0), 0);
  assert.ok(ult >= 95 && ult <= 110, `${ult}`);
});

test('purchases stay on the device: the cloud copy leaves them out, and adopting a cloud save keeps this device\'s', async () => {
  const { cloudCopy } = await import('../../js/net/api.js');
  const { adoptCloudSave } = await import('../../js/state.js');
  calls.next = { transactionId: '4001', productIdentifier: iap.PREFIX + 'starter' };
  await iap.buy(P('starter'));
  calls.next = { transactionId: '4002', productIdentifier: iap.PREFIX + 'pass.s2' };
  await iap.buy(P('pass.s2'));
  const s = getState();
  const c = cloudCopy(s);
  assert.equal(c.club.starterBought, undefined); assert.equal(c.club.pass, undefined);
  assert.equal(c.club.ultimate, s.club.ultimate, 'balances travel as always');
  assert.equal(s.club.starterBought, true, 'the device keeps its own copy');
  adoptCloudSave(JSON.parse(JSON.stringify(c)));
  assert.equal(getState().club.starterBought, true); assert.equal(getState().club.pass.s2, true);
});

test('APEX Club: a monthly drop with every payment, once each; ◈ 2,000 a day while it runs; lapsed or refunded, nothing', async () => {
  const progress2 = await import('../../js/progress.js');
  const club = P('club.monthly');
  assert.equal(club.type, 'subscription');
  const until = new Date(Date.now() + 30 * 864e5).toISOString();
  calls.next = { transactionId: '5001', productIdentifier: iap.PREFIX + 'club.monthly', expirationDate: until };
  assert.equal((await iap.buy(club)).ok, true);
  const s = getState();
  assert.equal(iap.isMember(s), true);
  const drops = () => getState().club.pending.filter((p) => p.kind === 'club');
  assert.equal(drops().length, 1);
  assert.deepEqual({ u: drops()[0].ultimate, a: drops()[0].apex, p: drops()[0].packs }, { u: 80, a: 40000, p: ['prime', 'prime', 'gold'] });
  // the same payment again (redelivered): no second drop; a renewal (a new transaction): another
  await iap.settle({ transactionId: '5001', productIdentifier: iap.PREFIX + 'club.monthly', expirationDate: until });
  assert.equal(drops().length, 1);
  const later = new Date(Date.now() + 60 * 864e5).toISOString();
  await iap.settle({ transactionId: '5002', productIdentifier: iap.PREFIX + 'club.monthly', expirationDate: later });
  assert.equal(drops().length, 2);
  assert.equal(getState().club.member.until, Date.parse(later));
  // the daily Apex: once a day
  const a0 = getState().club.apex;
  const day = Date.now();
  assert.equal(progress2.claimClubDaily(day), 2000);
  assert.equal(progress2.claimClubDaily(day), 0, 'once a day');
  assert.equal(progress2.claimClubDaily(day + 864e5), 2000, 'and again tomorrow');
  assert.equal(getState().club.apex, a0 + 4000);
  // StoreKit says it has lapsed (or was refunded): no member, no daily
  calls.purchases = [];
  await iap.syncEntitlements();
  assert.equal(iap.isMember(getState()), false);
  assert.equal(progress2.claimClubDaily(day + 2 * 864e5), 0);
  // a refund arriving through the update listener ends it too
  calls.purchases = [{ transactionId: '5002', productIdentifier: iap.PREFIX + 'club.monthly', expirationDate: later }];
  await iap.syncEntitlements();
  assert.equal(iap.isMember(getState()), true);
  await iap.settle({ transactionId: '5002', productIdentifier: iap.PREFIX + 'club.monthly', revocationDate: '2026-12-02T00:00:00Z' });
  assert.equal(iap.isMember(getState()), false);
  // and the membership never reaches the cloud copy
  const { cloudCopy } = await import('../../js/net/api.js');
  assert.equal(cloudCopy(getState()).club.member, undefined);
});
