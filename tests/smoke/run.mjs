/**
 * The smoke test: does the game actually work, end to end, in a browser.
 *
 * Boots the phone build, plays a short match on the real WebGL renderer,
 * buys and opens a pack through the UI, checks the save landed locally and
 * in the cloud, then boots the watch build and opens a pack there. Any
 * uncaught page error fails the run. Runs against the real server on a
 * scratch data directory, so it never touches server/data.
 *
 *   npm run test:smoke            # headless
 *   SMOKE_SLOW=1 npm run test:smoke   # keep the browser slower for a look
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { startServer } from './server.mjs';

const ARGS = [
  '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows', '--autoplay-policy=no-user-gesture-required',
];
const RESET = 'econ-2curr-1';
const step = (s) => console.log(`  · ${s}`);

const server = await startServer();
const browser = await chromium.launch({ args: ARGS });
let failed = false;
const pageErrors = [];
const watchErrors = (page, tag) => {
  page.on('pageerror', (e) => pageErrors.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR/.test(m.text())) pageErrors.push(`${tag} console: ${m.text()}`); });
};
const text = async (page, sel = 'body') => (await page.innerText(sel)).replace(/\s+/g, ' ');

try {
  /* ------------------------------ phone ------------------------------ */
  console.log('phone');
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  watchErrors(page, 'phone');
  // a fresh save that has already had the one-time economy wipe, so the pack
  // flow below is the everyday one and not the apology card
  // the release-notes card and the tutorial both sit over the menu on a first
  // run; they have their own tests in spirit, this one wants the game
  const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text())
    .then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
  await page.addInitScript(({ tag, notes }) => {
    if (!localStorage.getItem('apexxi.save.v1')) {
      localStorage.setItem('apexxi.save.v1', JSON.stringify({
        meta: { reset: tag }, flags: { notesSeen: notes },
        settings: { quality: 'low', reduceMotion: true, tutorialDone: true },
      }));
    }
  }, { tag: RESET, notes: notesVersion });

  const t0 = Date.now();
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 20000 });
  step(`splash in ${Date.now() - t0}ms`);
  await page.click('#startBtn');
  await page.waitForSelector('[data-go="squad"]', { timeout: 10000 });
  step('menu');

  // ---- pack: buy the free bronze, open it, keep the cards
  await page.click('[data-go="squad"]');
  await page.waitForSelector('[data-utab="store"]', { timeout: 10000 });
  await page.click('[data-utab="store"]');
  await page.waitForSelector('[data-buy-pack="bronze"]', { timeout: 10000 });
  await page.click('[data-buy-pack="bronze"]');
  await page.waitForSelector('[data-stab="locker"]', { timeout: 10000 });
  await page.click('[data-stab="locker"]');
  await page.waitForSelector('[data-open-pack="bronze"]', { timeout: 10000 });
  await page.click('[data-open-pack="bronze"]');
  await page.waitForSelector('#packRip', { timeout: 10000 });
  await page.click('#packRip', { force: true });
  for (let i = 0; i < 12; i++) {
    const open = await page.evaluate(() => { const o = document.getElementById('packOverlay'); return !!o && !o.hidden; });
    if (!open) break;
    const next = await page.$('#packNext');
    if (next) await next.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
  }
  const collection = await page.evaluate(() => JSON.parse(localStorage.getItem('apexxi.save.v1')).club.collection.length);
  assert.ok(collection >= 3, `pack landed in the collection (${collection})`);
  step(`pack opened: ${collection} cards saved locally`);

  // ---- match: a 12-second kick off on the real renderer
  await page.evaluate(async () => {
    const app = await import('/js/app.js');
    const { getState, update } = await import('/js/state.js');
    update((s) => { s.settings.quality = 'low'; });
    void getState;
    app.navigate('play', { homeId: 'c1', awayId: 'c2', duration: 12, skill: 1, mode: 'single' });
  });
  await page.waitForSelector('#gmCanvas', { timeout: 10000 });
  const glInfo = await page.waitForFunction(() => {
    const c = document.getElementById('gmCanvas');
    return c && c.width > 0 ? `${c.width}x${c.height}` : null;
  }, null, { timeout: 15000 }).then((h) => h.jsonValue());
  step(`match canvas ${glInfo}`);
  /* Software WebGL runs this scene at a few frames a second, so the clock
   * crawls; a full match would take minutes. Full time is the 2D path's job in
   * the unit tests — here the question is whether the real renderer draws,
   * the veil lifts and the sim moves under it. */
  const minute = await page.waitForFunction(() => {
    const ft = document.querySelector('.gm-ft');
    const clock = document.body.innerText.match(/\b(\d+)'/);
    const veil = document.getElementById('gmLoad');
    return ft ? 'full time' : (clock && +clock[1] >= 3 && veil?.hidden) ? `${clock[1]}'` : null;
  }, null, { timeout: 90000 }).then((h) => h.jsonValue());
  step(`renderer drawing, match at ${minute}`);
  await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('menu'); });
  await page.waitForSelector('[data-go="squad"]', { timeout: 10000 });
  assert.equal(await page.evaluate(() => document.body.classList.contains('in-game')), false, 'in-game class released');

  // ---- cloud: register, push the save, read it back
  const name = `smoke${Date.now().toString(36).slice(-6)}`;
  const cloud = await page.evaluate(async (n) => {
    const reg = await fetch('./api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, pass: 'smoke-pass-123' }) }).then((r) => r.json());
    if (!reg.token) return { error: reg.error };
    const save = JSON.parse(localStorage.getItem('apexxi.save.v1'));
    const put = await fetch('./api/save', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${reg.token}` }, body: JSON.stringify({ save }) });
    const back = await fetch('./api/save', { headers: { Authorization: `Bearer ${reg.token}` } }).then((r) => r.json());
    return { put: put.status, cards: back.save?.club?.collection?.length, apex: back.save?.club?.apex };
  }, name);
  assert.equal(cloud.put, 200, `cloud save accepted: ${JSON.stringify(cloud)}`);
  assert.equal(cloud.cards, collection, 'the cloud holds the same collection');
  step(`cloud save round-trips (${cloud.cards} cards, ◈${cloud.apex})`);
  await ctx.close();

  /* ------------------------------ watch ------------------------------ */
  console.log('watch');
  const wctx = await browser.newContext({ viewport: { width: 162, height: 197 }, hasTouch: true, isMobile: true });
  const w = await wctx.newPage();
  watchErrors(w, 'watch');
  await w.goto(`${server.url}/watch`);
  await w.waitForFunction(() => window.__apexWatchBooted === true, null, { timeout: 15000 });
  step('watch booted');
  await w.click('#wSolo');
  await w.click('[data-tab="packs"]');
  await w.click('[data-open="bronze"]', { force: true });
  await w.waitForSelector('.w-packet', { timeout: 5000 });
  await w.click('.w-packet', { force: true });
  for (let i = 0; i < 8; i++) {
    const btn = await w.$('text=Next') || await w.$('text=Done');
    if (!btn) { await w.waitForTimeout(400); continue; }
    await btn.click({ force: true });
    await w.waitForTimeout(300);
    if (!(await w.$('.w-pack'))) break;
  }
  await w.click('[data-tab="club"]');
  const club = await text(w, '#wApp');
  assert.match(club, /Cards [1-9]/, `watch collection: ${club}`);
  step('watch pack opened and banked');
  await wctx.close();
} catch (e) {
  failed = true;
  console.error('\nSMOKE FAILED:', e.message);
} finally {
  await browser.close();
  server.stop();
}
if (pageErrors.length) { failed = true; console.error('page errors:\n  ' + pageErrors.join('\n  ')); }
console.log(failed ? '\nsmoke: FAIL' : '\nsmoke: ok');
process.exit(failed ? 1 : 0);
