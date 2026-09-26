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
  // v135: the desktop run signs in (its order is emailed); the phone run stays signed out
  if (label === 'desktop') await page.evaluate(async () => { const api = await import('/js/net/api.js'); await api.register(`shopqa${Date.now() % 1e6}`, 'shop-pass-123'); });
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
  const wantLine = label === 'desktop' ? /Saved on the server/ : /sign in/i;
  if (!wantLine.test(receipt)) problems.push(`${label}: receipt line wrong (${receipt})`);
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
// v135: the endpoint itself — signed out is refused, three an hour, a reference is emailed once
const post = (body, token) => fetch(`${server.url}/api/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
if ((await post({ bundle: 'ult-20', ref: 'AX-SIGNEDOT' })).status !== 401) problems.push('a signed-out purchase was not refused');
const reg = await fetch(`${server.url}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `shopqb${Date.now() % 1e6}`, pass: 'shop-pass-123' }) }).then((r) => r.json());
const r1 = await post({ bundle: 'ult-20', ref: 'AX-DUPEREFA' }, reg.token).then((r) => r.json());
const r2 = await post({ bundle: 'ult-20', ref: 'AX-DUPEREFA' }, reg.token).then((r) => r.json());
if (r2.mail !== 'duplicate') problems.push(`a repeated reference was mailed again (${JSON.stringify(r1)} / ${JSON.stringify(r2)})`);
await post({ bundle: 'ult-20', ref: 'AX-THIRDREF' }, reg.token);
const r4 = await post({ bundle: 'ult-20', ref: 'AX-FOURTHRF' }, reg.token);
if (r4.status !== 429) problems.push(`a fourth purchase in the hour was allowed (${r4.status})`);
const mails = readdirSync(join(server.dataDir, 'outbox'));
if (mails.length !== 3) problems.push(`expected three emails in the outbox (the desktop order and two direct), found ${mails.length}`);
const html = mails.map((f) => readFileSync(join(server.dataDir, 'outbox', f), 'utf8')).find((h) => h.includes('$9.99')) || '';
if (!html.includes('You just got a purchase') || !html.includes('$9.99')) problems.push('the email is not the receipt');
if (/4242|cvv/i.test(html)) problems.push('the email carries card details');
const ledger = JSON.parse(readFileSync(join(server.dataDir, 'store-ledger.json'), 'utf8'));
if (ledger.cents !== 999 + 199 * 2 || ledger.count !== 3) problems.push(`ledger ${JSON.stringify(ledger)}`);
await browser.close(); server.stop();
if (problems.length) { console.error(`✘ shop\n  - ${problems.join('\n  - ')}`); process.exit(1); }
console.log(`✔ the Ultimate shop: checkout, receipt, signed-out and rate limits, three store emails (${join(server.dataDir, 'outbox')}), balance untouched`);
