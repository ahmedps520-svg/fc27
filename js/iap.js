/**
 * v205: real-money purchases in the App Store app — StoreKit 2 through the
 * `@capgo/native-purchases` Capacitor plugin (app/package.json). The website
 * keeps its test-mode card shop (data/shop.js) and never reaches this file's
 * buy path: `iapAvailable()` is true only in the iPhone app with the plugin.
 *
 * What is sold (the owner's prices; Apple sets each country's price from the
 * US one):
 *   ✦ Ultimate   20 $1.99 · 55 $4.99 · 110 $9.99 · 240 $19.99 · 650 $49.99
 *   ◈ Apex       10,000 $0.99 · 60,000 $4.99 · 130,000 $9.99 · 280,000 $19.99 · 750,000 $49.99
 *   Starter      $0.99, once per save: 20 ✦ + a Prime pack + ◈ 10,000
 *   Season Pass  $4.99, Season 2's paid track (data/season.js PREMIUM_TIERS); non-consumable
 * Ultimate buys Icons and Style items, never a pack; Apex buys packs, whose
 * odds the store shows on each pack before you buy (Apple 3.1.1).
 *
 * How a purchase is credited, exactly once:
 *   1. StoreKit verifies the transaction on the device (the plugin rejects an
 *      unverified one) and it comes back here unfinished;
 *   2. it is credited to the save and its id written to a small ledger kept
 *      on this device only (`apexxi.iap.v1`) — never in the save, so nothing
 *      about purchases reaches our server (App Privacy stays as it is);
 *   3. then, and only then, it is finished. A purchase interrupted between 1
 *      and 3 (the app killed) comes back unfinished on the next launch and is
 *      credited then; one already in the ledger is just finished.
 * The Season Pass is an entitlement: whatever StoreKit says this Apple ID
 * owns is the truth on this device, refunds included; Restore Purchases asks
 * the App Store again.
 */
import { APP_STORE } from './platform.js';
import { getState, update } from './state.js';

export const PREFIX = 'online.apexxi.game.';
export const PASS_SEASON = 's2';

/** `id` is the part after PREFIX. `grant` is what lands in the save. */
export const PRODUCTS = [
  { id: 'ult20', shelf: 'ultimate', type: 'consumable', usd: 1.99, grant: { ultimate: 20 }, name: '20 Ultimate' },
  { id: 'ult55', shelf: 'ultimate', type: 'consumable', usd: 4.99, grant: { ultimate: 55 }, bonus: 5, name: '55 Ultimate' },
  { id: 'ult110', shelf: 'ultimate', type: 'consumable', usd: 9.99, grant: { ultimate: 110 }, bonus: 10, tag: 'Popular', name: '110 Ultimate' },
  { id: 'ult240', shelf: 'ultimate', type: 'consumable', usd: 19.99, grant: { ultimate: 240 }, bonus: 40, name: '240 Ultimate' },
  { id: 'ult650', shelf: 'ultimate', type: 'consumable', usd: 49.99, grant: { ultimate: 650 }, bonus: 150, tag: 'Best value', name: '650 Ultimate' },
  { id: 'apex10k', shelf: 'apex', type: 'consumable', usd: 0.99, grant: { apex: 10000 }, name: '10,000 Apex' },
  { id: 'apex60k', shelf: 'apex', type: 'consumable', usd: 4.99, grant: { apex: 60000 }, name: '60,000 Apex' },
  { id: 'apex130k', shelf: 'apex', type: 'consumable', usd: 9.99, grant: { apex: 130000 }, tag: 'Popular', name: '130,000 Apex' },
  { id: 'apex280k', shelf: 'apex', type: 'consumable', usd: 19.99, grant: { apex: 280000 }, name: '280,000 Apex' },
  { id: 'apex750k', shelf: 'apex', type: 'consumable', usd: 49.99, grant: { apex: 750000 }, tag: 'Best value', name: '750,000 Apex' },
  { id: 'starter', shelf: 'starter', type: 'consumable', usd: 0.99, grant: { ultimate: 20, apex: 10000, packs: ['prime'], starter: true }, once: true, name: 'Starter Pack' },
  { id: 'pass.s2', shelf: 'pass', type: 'nonconsumable', usd: 4.99, grant: { pass: PASS_SEASON }, name: 'Season 2 Pass' },
  // v206: APEX Club, auto-renewing monthly (15 riyals: Saudi Arabia is the base price)
  { id: 'club.monthly', shelf: 'club', type: 'subscription', sar: 14.99, grant: { club: true }, name: 'APEX Club' },
];

/**
 * v206: APEX Club — what a member gets. The monthly drop arrives with every
 * subscription payment (the first and each renewal: one per transaction, on
 * Today); the daily Apex can be claimed once a day while the membership runs.
 */
export const CLUB = { monthly: { ultimate: 80, apex: 40000, packs: ['prime', 'prime', 'gold'] }, daily: { apex: 2000 } };
export const productOf = (fullId) => PRODUCTS.find((p) => PREFIX + p.id === fullId) || null;

const plugin = () => globalThis.Capacitor?.Plugins?.NativePurchases || null;
export const iapAvailable = () => APP_STORE && !!plugin();

/* ------------------------------- the ledger ------------------------------ */
const LEDGER = 'apexxi.iap.v1';
function ledger() {
  try { const l = JSON.parse(globalThis.localStorage?.getItem(LEDGER) || '{}'); return Array.isArray(l.done) ? l : { done: [] }; } catch { return { done: [] }; }
}
const credited = (txId) => ledger().done.includes(String(txId));
function remember(txId) {
  const l = ledger();
  l.done.push(String(txId));
  if (l.done.length > 500) l.done = l.done.slice(-500);
  try { globalThis.localStorage?.setItem(LEDGER, JSON.stringify(l)); } catch { /* storage blocked: StoreKit's own finish still stops a repeat */ }
}

/** Put a product's contents in a save. Pure apart from the save it is given; the tests call it directly. */
export function applyGrant(s, product) {
  const g = product.grant;
  if (g.ultimate) s.club.ultimate = (s.club.ultimate || 0) + g.ultimate;
  if (g.apex) s.club.apex = (s.club.apex || 0) + g.apex;
  if (Array.isArray(g.packs)) s.club.packs.push(...g.packs);
  if (g.starter) s.club.starterBought = true;
  if (g.pass) s.club.pass = { ...(s.club.pass || {}), [g.pass]: true };
}

/** v206: a subscription payment — the membership runs to its expiry, and the month's drop waits on Today. */
export function applyClub(s, tx) {
  const until = Date.parse(tx?.expirationDate || '') || (Date.now() + 31 * 864e5);
  s.club.member = { until: Math.max(until, s.club.member?.until || 0) };
  if (!Array.isArray(s.club.pending)) s.club.pending = [];
  s.club.pending.unshift({ id: `club-${tx?.transactionId || Date.now()}`, at: Date.now(), kind: 'club', title: 'APEX Club — monthly drop', sub: '80 ✦ · 2 Prime packs · a Gold pack · ◈ 40,000', ...CLUB.monthly });
}

/**
 * Credit a verified transaction once and finish it. Returns the product, or
 * null for one that is not ours or was already credited (still finished).
 */
export async function settle(tx, { finish = true } = {}) {
  const product = productOf(tx?.productIdentifier);
  const id = tx?.transactionId;
  if (!product || !id) return null;
  if (tx.revocationDate) {
    if (product.grant.pass) setPass(product.grant.pass, false);
    if (product.grant.club) update((s) => { s.club.member = { until: 0 }; });
    if (finish) await finishTx(id);
    return null;
  }
  let fresh = false;
  if (product.type === 'subscription') {
    if (tx.expirationDate && Date.parse(tx.expirationDate) < Date.now() && credited(id)) { if (finish) await finishTx(id); return null; }
    if (!credited(id)) { update((s) => applyClub(s, tx)); remember(id); fresh = true; }
  } else if (product.type === 'nonconsumable') {
    update((s) => applyGrant(s, product));         // an entitlement: saying it twice changes nothing
    fresh = !credited(id);
    if (fresh) remember(id);
  } else if (!credited(id)) {
    update((s) => applyGrant(s, product));
    remember(id);
    fresh = true;
  }
  if (finish) await finishTx(id);
  return fresh ? product : null;
}

async function finishTx(id) {
  try { await plugin()?.finishTransaction({ transactionId: String(id) }); } catch { /* finished already, or comes back next launch and is only finished then */ }
}

function setPass(seasonId, on) {
  update((s) => { s.club.pass = { ...(s.club.pass || {}), [seasonId]: !!on }; });
}

/* ------------------------------ the shop's calls ------------------------------ */
let products = null;           // id -> { priceString, price, currency }
let listeners = [];

/** Prices as this player's App Store shows them, or null when the store cannot be reached. */
export async function loadProducts() {
  if (!iapAvailable()) return null;
  try {
    products = {};
    for (const productType of ['inapp', 'subs']) {
      const ids = PRODUCTS.filter((p) => (p.type === 'subscription') === (productType === 'subs')).map((p) => PREFIX + p.id);
      const r = await plugin().getProducts({ productIdentifiers: ids, productType });
      for (const p of r?.products || []) products[p.identifier] = { priceString: p.priceString, price: p.price, currency: p.currencyCode };
    }
    return products;
  } catch { return null; }
}
export const priceOf = (product) => products?.[PREFIX + product.id]?.priceString || null;

/**
 * Buy one. Resolves { ok: true, product } once it is credited, { cancelled }
 * when the player backed out, { pending } when it waits on Ask to Buy (it is
 * credited when it arrives, through the update listener), or { error }.
 */
export async function buy(product) {
  if (!iapAvailable()) return { error: 'Purchases are only in the App Store app.' };
  if (product.once && getState().club.starterBought) return { error: 'You already have this one.' };
  try {
    const tx = await plugin().purchaseProduct({ productIdentifier: PREFIX + product.id, productType: product.type === 'subscription' ? 'subs' : 'inapp', quantity: 1, autoAcknowledgePurchases: false });
    const got = await settle(tx);
    return { ok: true, product: got || product };
  } catch (err) {
    const m = String(err?.message || err || '');
    if (/cancel/i.test(m)) return { cancelled: true };
    if (/pending/i.test(m)) return { pending: true };
    return { error: m || 'The purchase did not go through.' };
  }
}

/** Ask the App Store again what this Apple ID owns (the Season Pass), then credit anything unfinished. */
export async function restore() {
  if (!iapAvailable()) return { error: 'Purchases are only in the App Store app.' };
  try { await plugin().restorePurchases(); } catch (err) { return { error: String(err?.message || err) }; }
  await syncEntitlements();
  await creditUnfinished();
  return { ok: true, pass: !!getState().club.pass?.[PASS_SEASON] };
}

/** The Season Pass from StoreKit's own list of what this Apple ID owns. */
export async function syncEntitlements() {
  if (!iapAvailable()) return;
  try {
    const r = await plugin().getPurchases({ onlyCurrentEntitlements: true });
    const list = r?.purchases || [];
    const owned = list.some((t) => t.productIdentifier === PREFIX + `pass.${PASS_SEASON}` && !t.revocationDate);
    if (!!getState().club.pass?.[PASS_SEASON] !== owned) setPass(PASS_SEASON, owned);
    // v206: APEX Club runs to the latest expiry StoreKit reports for this Apple ID (0 when it has lapsed or was refunded)
    const sub = list.filter((t) => t.productIdentifier === PREFIX + 'club.monthly' && !t.revocationDate)
      .map((t) => Date.parse(t.expirationDate || '') || 0).reduce((a, b) => Math.max(a, b), 0);
    if ((getState().club.member?.until || 0) !== sub) update((s) => { s.club.member = { until: sub }; });
  } catch { /* offline: keep what the save says */ }
}

/** Anything bought and not yet finished (the app was closed mid-purchase, Ask to Buy approved later). */
export async function creditUnfinished() {
  if (!iapAvailable()) return [];
  const got = [];
  try {
    const r = await plugin().getUnfinishedTransactions();
    for (const tx of r?.transactions || []) { const p = await settle(tx); if (p) got.push(p); }
  } catch { /* next launch */ }
  for (const p of got) for (const fn of listeners) fn(p);
  return got;
}

/** v206: Apple's own page for managing (and cancelling) subscriptions. */
export async function manageSubscriptions() {
  try { await plugin()?.manageSubscriptions(); return true; } catch { return false; }
}
export const isMember = (s = getState(), now = Date.now()) => (s.club.member?.until || 0) > now;

/** Hear about purchases credited outside a buy() call (to show a toast). */
export function onCredited(fn) { listeners.push(fn); return () => { listeners = listeners.filter((x) => x !== fn); }; }

let started = false;
/** Once at boot, in the app: credit what is waiting, listen for the rest, check the pass. */
export async function startIap() {
  if (started || !iapAvailable()) return;
  started = true;
  try {
    await plugin().addListener('transactionUpdated', async (tx) => {
      const p = await settle(tx);
      if (p) for (const fn of listeners) fn(p);
    });
  } catch { /* an older plugin: the unfinished sweep below still catches them */ }
  await creditUnfinished();
  await syncEntitlements();
}
