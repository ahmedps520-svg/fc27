/**
 * Round 8 look-see: one frame of each new ground feature, at High, saved to
 * tests/tmp/r8/. Not a regression test — a picture to look at.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { startServer } from '../smoke/server.mjs';
const OUT = 'tests/tmp/r8'; mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TIER = arg('--tier', 'high');
const ONLY = arg('--only', '');
const SHOTS = [
  { name: 'community-day', venue: 'stationrd', atmo: { time: 'day', weather: 'clear' }, cam: 'broadcast' },
  { name: 'community-behind', venue: 'parish', atmo: { time: 'dusk', weather: 'clear' }, cam: 'e2e' },
  { name: 'town-night', venue: 'hawkrow', atmo: { time: 'night', weather: 'clear' }, cam: 'broadcast' },
  { name: 'snow-night', venue: 'forge', atmo: { time: 'night', weather: 'snow' }, cam: 'broadcast' },
  { name: 'snow-day-pro', venue: 'bramble', atmo: { time: 'day', weather: 'snow' }, cam: 'pro' },
  { name: 'frost-night', venue: 'helios', atmo: { time: 'night', weather: 'clear', frost: true }, cam: 'tele' },
  { name: 'rain-puddles', venue: 'kestrel', atmo: { time: 'dusk', weather: 'rain' }, cam: 'dynamic' },
  { name: 'corner-flag', venue: 'forge', atmo: { time: 'day', weather: 'clear' }, stage: 'corner' },
  { name: 'dugouts', venue: 'verano', atmo: { time: 'day', weather: 'clear' }, pose: { x: 40, y: -16, z: 5, tx: 52.5, ty: -2, tz: 1, hfov: 55 } },
  { name: 'photographers', venue: 'verano', atmo: { time: 'night', weather: 'clear' }, pose: { x: 92, y: 20, z: 6, tx: 107, ty: 34, tz: 0.8, hfov: 50 } },
  { name: 'halftime', venue: 'forge', atmo: { time: 'day', weather: 'clear' }, half: true, cam: 'tactical' },
  { name: 'flares-away-end', venue: 'forge', atmo: { time: 'night', weather: 'clear' }, goal: true, pose: { x: 72, y: 22, z: 11, tx: 118, ty: 52, tz: 7, hfov: 55 } },
  { name: 'goal-flares', venue: 'forge', atmo: { time: 'night', weather: 'clear' }, goal: true, cam: 'broadcast' },
].filter((s) => !ONLY || ONLY.split(',').includes(s.name));
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const errors = [];
for (const sh of SHOTS) {
  const page = await browser.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`${sh.name}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::|Failed to load/.test(m.text())) errors.push(`${sh.name}: console ${m.text().slice(0, 200)}`); });
  await page.addInitScript((q) => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' }, settings: { quality: q, reduceMotion: true, tutorialDone: true } })), TIER);
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async (s) => { const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c4', venueId: s.venue, duration: 1200, skill: 1, mode: 'single', atmo: s.atmo }); }, sh);
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexCam, null, { timeout: 240000 });
  await page.addStyleTag({ content: '#gmRoot > :not(canvas) { visibility: hidden !important; }' });
  await page.waitForFunction(() => window.__apexMatch?.phase === 'play', null, { timeout: 300000, polling: 250 });
  await page.evaluate((s) => {
    const m = window.__apexMatch; const c = window.__apexCam;
    if (s.cam) { c.setSettings({ preset: s.cam }); c.snap(); }
    if (s.stage === 'corner') m.startCorner(0, 0, m.teams[0].dir > 0 ? 105 : 0);
    if (s.half) { m.phase = 'half'; m.phaseT = 60; }
    if (s.goal) m.scoreGoal(0, 1, m.teams[0].dir > 0 ? 105 : 0);
    if (s.pose) { const gl = window.__apexGL; const pose = { ...s.pose }; const r = gl.render.bind(gl); gl.render = (mm, cam, dt) => r(mm, pose, dt); }
  }, sh);
  const want = sh.half || sh.goal ? 4 : 1.5;
  await page.waitForFunction((w) => window.__apexCam.modeTime > w || window.__apexGL.__t > w, want, { timeout: 300000, polling: 300 }).catch(() => {});
  writeFileSync(`${OUT}/${sh.name}.png`, await page.screenshot({ type: 'png', timeout: 240000 }));
  console.log('shot', sh.name);
  await page.close();
}
await browser.close(); server.stop();
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
console.log('r8 shots ok');
