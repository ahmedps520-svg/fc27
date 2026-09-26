/**
 * The Ultimate shop, end to end (v129): Store → Ultimate → a bundle → the
 * checkout refuses an empty form → the test card → Pay → the receipt, the
 * store's email in the server's outbox, and the balance untouched.
 *
 *   node tests/qa/shop.mjs
 */
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../smoke/server.mjs';
import { watchConsole } from '../lib/console.mjs';

const server = await startServer();
const browser = await chromium.launch();
const appVersion = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => (t.match(/APP_VERSION = '(v\d+)'/) || [])[1]);
const problems = [];
const OUT = 'tests/tmp/shop';
for (const [label, vp] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 375, height: 740 }]]) {
  const page = await browser.newPage({ viewport: vp });
  page.on('pageerror', (e) => problems.push(`${label}: page error ${e.message}`));
  const issues = watchConsole(page, { tag: label, origin: server.url });
  await page.addInitScript((v) => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v }, settings: { quality: 'low', tutorialDone: true, reduceMotion: true } })), appVersion);
  await page.goto(server.url + '/');
  await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.waitForFunction(() => !document.querySelector('#screenCurtain.on'));
  await page.click('[data-go="squad"]'); await page.waitForSelector('#uTabs');
  await page.waitForFunction(() => !document.querySelector('#screenCurtain.on'));
  await page.click('[data-utab="store"]'); await page.waitForFunction(() => !document.querySelector('#screenCurtain.on'));
  await page.click('[data-stab="ultimate"]'); await page.waitForFunction(() => !document.querySelector('#screenCurtain.on'));
  const before = await page.$eval('#ultCoins', (e) => e.textContent);
  if (await page.locator('.ult-b').count() !== 5) problems.push(`${label}: expected five bundles`);
  await page.screenshot({ path: join(OUT, `${label}-shelf.png`) });
  await page.click('[data-buy-ult="ult-110"]'); await page.waitForSelector('.co-layer.in');
  await page.click('.co-pay');
  const errs = await page.$$eval('[data-err]', (s) => s.filter((x) => x.textContent).length);
  if (errs < 4) problems.push(`${label}: an empty form showed ${errs} errors`);
  await page.click('[data-co-fill]');
  await page.screenshot({ path: join(OUT, `${label}-checkout.png`) });
  const named = await page.$$eval('.co-sheet input', (i) => i.filter((x) => x.name).length);
  if (named) problems.push(`${label}: card inputs carry a name (a real form submit could send them)`);
  await page.click('.co-pay');
  await page.waitForSelector('.co-done', { timeout: 8000 }).catch(() => problems.push(`${label}: no receipt`));
  const receipt = await page.$eval('.co-receipt', (e) => e.textContent).catch(() => '');
  if (!/AX-[A-Z2-9]{8}/.test(receipt)) problems.push(`${label}: receipt has no order reference`);
  if (!/Sent to the store/.test(receipt)) problems.push(`${label}: the server was not told (${receipt})`);
  if (!/•••• 4242/.test(receipt)) problems.push(`${label}: receipt does not show the card's last four`);
  await page.screenshot({ path: join(OUT, `${label}-receipt.png`) });
  if (await page.$('#coNumber')) problems.push(`${label}: the card field is still in the page`);
  await page.click('.co-done [data-co-close]'); await page.waitForTimeout(300);
  if (await page.$('#checkoutOverlay')) problems.push(`${label}: Done did not close the sheet`);
  const after = await page.$eval('#ultCoins', (e) => e.textContent);
  if (after !== before) problems.push(`${label}: the Ultimate balance changed (${before} → ${after}) in test mode`);
  problems.push(...issues);
  await page.close();
}
await new Promise((r) => setTimeout(r, 400));
const mails = readdirSync(join(server.dataDir, 'outbox'));
if (mails.length !== 2) problems.push(`expected two emails in the outbox, found ${mails.length}`);
const html = readFileSync(join(server.dataDir, 'outbox', mails[0]), 'utf8');
if (!html.includes('You just got a purchase') || !html.includes('$9.99')) problems.push('the email is not the receipt');
if (/4242|cvv/i.test(html)) problems.push('the email carries card details');
const ledger = JSON.parse(readFileSync(join(server.dataDir, 'store-ledger.json'), 'utf8'));
if (ledger.cents !== 1998 || ledger.count !== 2) problems.push(`ledger ${JSON.stringify(ledger)}`);
await browser.close(); server.stop();
if (problems.length) { console.error(`✘ shop\n  - ${problems.join('\n  - ')}`); process.exit(1); }
console.log(`✔ the Ultimate shop: checkout, receipt, two store emails (${join(server.dataDir, 'outbox')}), balance untouched`);
