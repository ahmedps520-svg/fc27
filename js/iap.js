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
];
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

/**
 * Credit a verified transaction once and finish it. Returns the product, or
 * null for one that is not ours or was already credited (still finished).
 */
export async function settle(tx, { finish = true } = {}) {
  const product = productOf(tx?.productIdentifier);
  const id = tx?.transactionId;
  if (!product || !id) return null;
  if (tx.revocationDate) { if (product.grant.pass) setPass(product.grant.pass, false); if (finish) await finishTx(id); return null; }
  let fresh = false;
  if (product.type === 'nonconsumable') {
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
    const r = await plugin().getProducts({ productIdentifiers: PRODUCTS.map((p) => PREFIX + p.id), productType: 'inapp' });
    products = {};
    for (const p of r?.products || []) products[p.identifier] = { priceString: p.priceString, price: p.price, currency: p.currencyCode };
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
    const tx = await plugin().purchaseProduct({ productIdentifier: PREFIX + product.id, productType: 'inapp', quantity: 1, autoAcknowledgePurchases: false });
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
    const owned = (r?.purchases || []).some((t) => t.productIdentifier === PREFIX + `pass.${PASS_SEASON}` && !t.revocationDate);
    if (!!getState().club.pass?.[PASS_SEASON] !== owned) setPass(PASS_SEASON, owned);
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
