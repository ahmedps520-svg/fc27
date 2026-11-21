/**
 * v205 — the App Store app's shop in a real browser, with a stand-in for the
 * StoreKit plugin: the Shop tab appears only in the app build, prices come
 * from the store, a bundle and the Starter Pack credit and finish, the
 * Season Pass turns on its paid track on Today, the website shows none of it.
 * `--shot` also writes app/store/iap-review.png (the screenshot App Review
 * asks for with each in-app purchase), the whole shop at iPad Pro 12.9" landscape.
 *
 *   node tests/qa/iap-shop.mjs [--shot]
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const step = (s) => console.log(`  · ${s}`);
const SHOT = process.argv.includes('--shot');
const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2'] });
const errors = [];
const notes = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
const save = { meta: { reset: 'econ-2curr-1', season: 2 }, flags: { notesSeen: notes, appGift: true }, settings: { quality: 'min', reduceMotion: true, tutorialDone: true, models: 'simple' } };

const PRICES = { ult20: '$1.99', ult55: '$4.99', ult110: '$9.99', ult240: '$19.99', ult650: '$49.99', apex10k: '$0.99', apex60k: '$4.99', apex130k: '$9.99', apex280k: '$19.99', apex750k: '$49.99', starter: '$0.99', 'pass.s2': '$4.99', 'club.monthly': '14.99 SAR' };
async function boot({ app, scale = 1, viewport = { width: 932, height: 430 } }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(({ s, app, prices }) => {
    localStorage.setItem('apexxi.save.v1', JSON.stringify(s));
    if (!app) return;
    window.APEX_APP_STORE = true;
    let n = 5000;
    window.__iap = { finished: [], entitled: [] };
    window.Capacitor = { Plugins: { NativePurchases: {
      getProducts: async ({ productIdentifiers }) => ({ products: productIdentifiers.map((id) => ({ identifier: id, priceString: prices[id.replace('online.apexxi.game.', '')], price: 1, currencyCode: 'USD' })) }),
      purchaseProduct: async ({ productIdentifier }) => { if (productIdentifier.endsWith('pass.s2')) window.__iap.entitled.push(productIdentifier); return { transactionId: String(++n), productIdentifier }; },
      finishTransaction: async ({ transactionId }) => { window.__iap.finished.push(transactionId); },
      getUnfinishedTransactions: async () => ({ transactions: [] }),
      getPurchases: async () => ({ purchases: window.__iap.entitled.map((p) => ({ transactionId: '1', productIdentifier: p })) }),
      restorePurchases: async () => {},
      addListener: async () => ({ remove() {} }),
    } } };
  }, { s: save, app, prices: PRICES });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 20000 });
  await page.click('#startBtn');
  await page.waitForSelector('.menu-screen', { timeout: 15000 });
  return { ctx, page };
}
const go = (page, name) => page.evaluate(async (n) => { const app = await import('/js/app.js'); app.navigate(n); }, name);
const club = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('apexxi.save.v1')).club);

try {
  // the website: no Shop tab
  const web = await boot({ app: false });
  await go(web.page, 'squad');
  await web.page.waitForSelector('[data-utab="store"]', { timeout: 10000 });
  await web.page.click('[data-utab="store"]');
  await web.page.waitForSelector('#sSubs', { timeout: 10000 });
  assert.equal(await web.page.$('[data-stab="shop"]'), null, 'no App Store shop on the website');
  await web.ctx.close();
  step('website: no Shop tab');

  if (SHOT) {
    // the review screenshot: the whole shop at once, at iPad Pro 12.9" landscape (2732 × 2048)
    const shot = await boot({ app: true, scale: 2, viewport: { width: 1366, height: 1024 } });
    await go(shot.page, 'squad');
    await shot.page.waitForSelector('[data-utab="store"]', { timeout: 10000 });
    await shot.page.click('[data-utab="store"]');
    await shot.page.waitForSelector('[data-stab="shop"]', { timeout: 10000 });
    await shot.page.click('[data-stab="shop"]');
    await shot.page.waitForFunction(() => document.querySelector('[data-iap="apex750k"] .ult-price')?.textContent.includes('$'), null, { timeout: 10000 });
    await shot.page.evaluate(() => document.querySelector('.iap-shop')?.scrollIntoView({ block: 'start' }));
    await shot.page.screenshot({ path: new URL('../../app/store/iap-review.png', import.meta.url).pathname });
    await shot.ctx.close();
    step('wrote app/store/iap-review.png');
  }
  const { ctx, page } = await boot({ app: true });
  await go(page, 'squad');
  await page.waitForSelector('[data-utab="store"]', { timeout: 10000 });
  await page.click('[data-utab="store"]');
  await page.waitForSelector('[data-stab="shop"]', { timeout: 10000 });
  assert.equal(await page.$('[data-stab="ultimate"]'), null, 'the test-mode card shop stays off the app');
  await page.click('[data-stab="shop"]');
  await page.waitForFunction(() => document.querySelector('[data-iap="apex60k"] .ult-price')?.textContent.includes('$'), null, { timeout: 10000 });
  const shown = await page.$$eval('[data-iap]', (els) => els.map((e) => e.dataset.iap));
  assert.deepEqual(shown.sort(), Object.keys(PRICES).sort(), 'every product on the shelf');
  step(`shop: ${shown.length} products at the App Store's prices`);

  const before = await club(page);
  await page.click('[data-iap="apex60k"]');
  await page.waitForFunction((a) => JSON.parse(localStorage.getItem('apexxi.save.v1')).club.apex === a + 60000, before.apex, { timeout: 10000 });
  await page.waitForSelector('[data-iap="starter"]');
  await page.click('[data-iap="starter"]');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('apexxi.save.v1')).club.starterBought === true, null, { timeout: 10000 });
  await page.waitForFunction(() => !document.querySelector('[data-iap="starter"]'), null, { timeout: 10000 });
  const after = await club(page);
  assert.equal(after.ultimate, 20); assert.equal(after.apex, before.apex + 70000); assert.equal(after.packs.at(-1), 'prime');
  assert.equal((await page.evaluate(() => window.__iap.finished)).length, 2, 'each purchase finished once credited');
  step('◈ 60,000 and the Starter Pack credited and finished; the Starter Pack leaves the shelf');

  // the Season Pass: bought, then its paid track on Today
  await page.click('[data-iap="pass.s2"]');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('apexxi.save.v1')).club.pass?.s2 === true, null, { timeout: 10000 });
  await page.evaluate(async () => { const st = await import('/js/state.js'); st.update((s) => { s.club.season = { id: 's2', xp: 1300, claimed: [] }; }); });
  await go(page, 'today');
  await page.waitForSelector('.season', { timeout: 10000 });
  await page.waitForSelector('.tiers-pass [data-ptier="1"]', { timeout: 10000 });
  await page.click('.tiers-pass [data-ptier="1"]');
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('apexxi.save.v1')).club.season.premium || []).includes(1), null, { timeout: 10000 });
  step('Season Pass bought; its paid track on Today, tier 1 (the Crown) claimed');
  assert.deepEqual(errors, [], errors.join('\n'));
  await ctx.close();
  console.log('iap shop: ok');
} finally {
  await browser.close();
  server.stop();
}
