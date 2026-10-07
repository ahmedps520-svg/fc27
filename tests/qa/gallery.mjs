import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling'] });
const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
const page = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
page.on('pageerror', (e) => console.log('pageerror', e.message));
const s = { meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notesVersion }, settings: { quality: 'medium', reduceMotion: false, tutorialDone: true, models: 'simple' } };
await page.addInitScript((sv) => localStorage.setItem('apexxi.save.v1', JSON.stringify(sv)), s);
await page.goto(`${server.url}/`); await page.tap('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.evaluate(async () => (await import('/js/app.js')).navigate('play', { homeId: 'c1', awayId: 'c2', duration: 240, skill: 1, mode: 'single', atmo: { weather: 'clear', time: 'day' } }));
await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 240000 });
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed += 1; };
try {
  // a goal: the ball into the net
  await page.evaluate(() => { const m = window.__apexMatch; const t = m.teams[0]; const gx = t.dir > 0 ? 105 : 0; const p = t.players.find((q) => q.role === 'FWD'); p.x = gx - t.dir * 8; p.y = 34; m.ball.owner = null; m.ball.x = gx - t.dir * 3; m.ball.y = 34; m.ball.z = 0.4; m.ball.vx = t.dir * 25; m.ball.vy = 0.5; m.ball.vz = 0; m.ball.lastTouch = p; for (const k of m.teams[1].players) if (k.role === 'GK') k.y = 30; });
  await page.waitForFunction(() => window.__apexMatch.teams[0].score + window.__apexMatch.teams[1].score > 0, null, { timeout: 60000 });
  // to full time
  // the celebration and its replay first (slow on a software GPU), then jump the clock
  await page.waitForFunction(() => window.__apexMatch.phase === 'play' && !document.querySelector('.gm-replay-on'), null, { timeout: 400000 });
  await page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.3; });
  await page.waitForSelector('[data-o="keepGoals"]', { timeout: 180000 });
  check(true, 'full time offers "Keep these goals"');
  await page.evaluate(() => document.querySelector('[data-o="keepGoals"]').click());
  await page.waitForTimeout(1500);
  const n = await page.evaluate(async () => (await (await import('/js/goalGallery.js')).listGoals()).length);
  check(n >= 1, `kept: ${n} in the gallery`);
  await page.evaluate(async () => (await import('/js/app.js')).navigate('trophies'));
  await page.waitForSelector('#goalGallery:not([hidden]) [data-goal]', { timeout: 20000 });
  check(true, 'the Trophy Room lists it');
  await page.evaluate(() => document.querySelector('#goalGallery [data-goal]').click());
  await page.waitForFunction(() => window.__apexMatch && document.querySelector('.gm-replay-on'), null, { timeout: 240000 }).then(() => check(true, 'it plays back as a replay'), () => check(false, 'it plays back as a replay'));
  await page.waitForSelector('#goalGallery', { timeout: 240000 }).then(() => check(true, 'and returns to the Trophy Room'), () => check(false, 'returns to the Trophy Room'));
} catch (e) { check(false, e.message.split('\n')[0]); }
await browser.close(); server.stop();
console.log(failed ? `gallery: ${failed} failed` : 'gallery: ok');
process.exit(failed ? 1 : 0);
