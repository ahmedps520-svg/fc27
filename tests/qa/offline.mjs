/**
 * Offline play (v87): install once online, cut the network, reload, and use
 * the game — every lazily-loaded screen, a quick match to full time, a street
 * match, the skill games, a career week. Everything must come out of the
 * service worker's cache.
 *
 *   node tests/qa/offline.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`page: ${e.message}`));
  if (process.env.DBG) page.on('requestfailed', (r) => console.log('FAILED', r.url().replace(/^https?:\/\/[^/]+/, ''), r.failure()?.errorText));
  page.on('console', (m) => { if (process.env.DBG) console.log('C', m.type(), m.text()); if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|WebSocket|ws:\/\/|socket/i.test(m.text())) errors.push(`console: ${m.text()}`); });
  await page.addInitScript(() => { if (!localStorage.getItem('apexxi.save.v1')) localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } })); });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 30000 });
  // wait for the worker to install and fill its cache (polled from here:
  // waitForFunction would take an async predicate's Promise as truthy)
  const filled = async () => page.evaluate(async () => {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (!reg?.active || reg.active.state !== 'activated') return false;
    for (const k of await caches.keys()) { const c = await caches.open(k); if ((await c.keys()).length > 120) return true; }
    return false;
  });
  for (let i = 0; i < 120 && !(await filled()); i++) await page.waitForTimeout(500);
  if (!(await filled())) throw new Error('the service worker never finished installing');
  console.log('  · service worker installed and the cache filled');
  if (process.env.DBG) console.log('CACHE', await page.evaluate(async () => { const out = []; for (const k of await caches.keys()) { const c = await caches.open(k); const ks = (await c.keys()).map((r) => new URL(r.url).pathname); out.push([k, ks.length, ks.includes('/js/screens/splash.js'), ks.includes('/js/screens/menu.js'), (await navigator.serviceWorker.getRegistration()).active.state]); } return out; }));

  // the server goes away for real (Chromium's offline emulation fails a
  // navigation before the worker can answer it, which no real phone does)
  server.stop();
  await page.waitForTimeout(500);
  await page.reload();
  await page.waitForSelector('#startBtn', { timeout: 30000 }).catch(async (e) => {
    console.log('DEBUG', await page.evaluate(() => [document.title, document.body?.innerText?.slice(0, 200), !!navigator.serviceWorker.controller]));
    await page.screenshot({ path: 'tests/tmp/offline-fail.png' });
    throw e;
  });
  await page.click('#startBtn');
  await page.waitForSelector('.menu-screen', { timeout: 15000 });
  console.log('  · offline: the title screen and the menu');
  for (const s of ['squad', 'career', 'quick', 'settings', 'today', 'trophies', 'world', 'street', 'skills', 'stadiums', 'builder', 'pro']) {
    await page.evaluate((s) => import('/js/app.js').then((a) => a.navigate(s)), s);
    await page.waitForFunction(() => !document.body.classList.contains('screen-loading') && document.getElementById('screen').children.length > 0, null, { timeout: 15000 });
    await page.waitForTimeout(250);
  }
  console.log('  · offline: every screen loaded from the cache');
  // a quick match to full time
  await page.evaluate(() => import('/js/app.js').then((a) => a.navigate('play', { mode: 'single', homeId: 'c1', awayId: 'c2', duration: 60 })));
  await page.waitForFunction(() => window.__apexDbg && !window.__apexDbg().loading, null, { timeout: 90000 });
  await page.evaluate(() => { const m = window.__apexMatch; if (m.phase === 'kickoff') m.startPlay(); m.half = 2; m.t = m.duration - 0.3; });
  await page.waitForFunction(() => !!document.querySelector('.gm-panel'), null, { timeout: 60000 });
  console.log('  · offline: a quick match played to full time');
  // a street match
  await page.evaluate(async () => { const S = await import('/js/streetMode.js'); S.createBaller({ name: 'Off Line', number: 9 }); (await import('/js/app.js')).navigate('street'); });
  await page.waitForSelector('#stTabs', { timeout: 15000 });
  await page.click('#stTabs [data-tab="quick"]');
  await page.waitForSelector('#stQuick', { timeout: 15000 });
  await page.click('#stQuick');
  await page.waitForFunction(() => window.__apexDbg && !window.__apexDbg().loading && window.__apexMatch?.teams[0].players.length <= 5, null, { timeout: 90000 });
  console.log('  · offline: a street match started');
  // a career week
  await page.evaluate(async () => { const c = await import('/js/career.js'); c.startCareer({ name: 'Off Line', nation: 'England', age: 40 }, 'mci'); c.advanceWeek(null); });
  console.log('  · offline: a career started and a week simulated');
  await ctx.close();
} catch (e) {
  errors.push(e.message.split('\n')[0]);
} finally {
  await browser.close();
  try { server.stop(); } catch { /* already stopped */ }
}
for (const e of errors) console.log('  ✗', e);
console.log(errors.length ? `offline: ${errors.length} problem(s)` : 'offline: ok');
process.exit(errors.length ? 1 : 0);
