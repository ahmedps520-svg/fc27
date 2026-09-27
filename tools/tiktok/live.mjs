/**
 * Film a live AI-vs-AI match on any build of the game (tools/tiktok), for the
 * before/after clip: the earliest build in the history against today's, the
 * same way, same size, the game's own camera.
 *   node tools/tiktok/live.mjs <build dir> <out dir> [--secs 20] [--skip 30] [--w 1080] [--h 1920] [--seed 5]
 * The build's own server serves it. Both sides are put on the AI by serving
 * play.js with `human: null` passed to the Match (the sim has supported that
 * since the first build in the history). The clock is manual, as in film.mjs:
 * each frame is exactly 1/30 s after the last. The first --skip seconds run
 * without grabbing, to get past the kick-off.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';

const [DIR, OUT] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DRIVE = process.argv.includes('--drive');
const SECS = +arg('--secs', 20); const SKIP = +arg('--skip', 30); const W = +arg('--w', 1080); const H = +arg('--h', 1920); const SEED = +arg('--seed', 5); const WAIT = +arg('--wait', 5);
mkdirSync(OUT, { recursive: true });
const server = await startServer(undefined, { cwd: resolve(DIR) });
const v = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => t.match(/APP_VERSION = '(v\d+)'/)[1]);
console.log('build', v);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('page error', e.message));
const play = readFileSync(join(DIR, 'js/screens/play.js'), 'utf8').replace(/const match = new Match\(([^,]+), ([^,]+), \{/, 'const match = window.__liveMatch = new Match($1, $2, { human: null,');
await page.route('**/js/screens/play.js', (r) => r.fulfill({ body: play, contentType: 'text/javascript' }));
// every sound the match asks for, logged on the (manual) clock, for the clip's sound (sound.mjs)
const audio = readFileSync(join(DIR, 'js/audio.js'), 'utf8')
  .replace('export function sfx(name, ...args) {', 'export function sfx(name, ...args) {\n  (window.__sfxLog ||= []).push([performance.now(), "sfx", name, ...args.filter((a) => typeof a !== "object")]);');
// v27's own server drops the 14 MB scanned model mid-transfer; hand it over directly so the build shows the players it shipped with
await page.route('**/assets/candidates/player.glb', (r) => r.fulfill({ body: readFileSync(join(DIR, 'assets/candidates/player.glb')), contentType: 'model/gltf-binary' }));
await page.route('**/js/audio.js', (r) => r.fulfill({ body: audio, contentType: 'text/javascript' }));
await page.addInitScript(({ v, SEED }) => {
  localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v }, settings: { quality: 'high', qualityPicked: true, graphicsAsked: true, tutorialDone: true, pregame: 'off', sound: false, commentary: false } }));
  let a = SEED; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const realRAF = window.requestAnimationFrame.bind(window); const realNow = performance.now.bind(performance);
  let cbs = []; let fake = null; window.__manual = false;
  window.requestAnimationFrame = (cb) => { if (!window.__manual) return realRAF(cb); cbs.push(cb); return cbs.length; };
  performance.now = () => (window.__manual && fake != null ? fake : realNow());
  window.__tick = (ms) => { if (fake == null) fake = realNow(); fake += ms; const run = cbs; cbs = []; for (const cb of run) cb(fake); };
}, { v, SEED });
await page.goto(`${server.url}/`);
await page.click('#startBtn');
await page.waitForTimeout(2500);
await page.evaluate(async () => {
  const { WORLD } = await import('/js/data/generator.js');
  (await import('/js/app.js')).navigate('play', { homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id, duration: 600, skill: 1, mode: 'single' });
});
await page.waitForFunction(() => window.__liveMatch && (window.__liveMatch.phase === 'play' || window.__liveMatch.phase === 'kickoff') && !(document.getElementById('gmLoad') && !document.getElementById('gmLoad').hidden), null, { timeout: 1200000 });
// the early builds have no load curtain to wait on: give the load (the scanned models) real time
await page.waitForTimeout(WAIT * 1000);
await page.evaluate(() => { window.__manual = true; });
// --drive: the first build's loop holds the kick-off when both sides are on the AI (it waits on a seat
// that is not there), so its own Match is stepped here instead, two 1/60 s steps a frame, as its loop would
const grab = () => page.evaluate((DRIVE) => { if (DRIVE) { window.__liveMatch.update(1 / 60, []); window.__liveMatch.update(1 / 60, []); } window.__tick(1000 / 30); return document.querySelector('#gmCanvas').toDataURL('image/jpeg', 0.92); }, DRIVE);
for (let i = 0; i < SKIP * 30; i++) await page.evaluate((DRIVE) => { if (DRIVE) { window.__liveMatch.update(1 / 60, []); window.__liveMatch.update(1 / 60, []); } window.__tick(1000 / 30); }, DRIVE);
await grab();
const T0 = await page.evaluate(() => { window.__sfxLog = []; return performance.now(); });
const log = [];
for (let i = 0; i < SECS * 30; i++) {
  const url = await grab();
  writeFileSync(join(OUT, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  if (i % 30 === 0) { const s = await page.evaluate(() => [window.__liveMatch.teams[0].score, window.__liveMatch.teams[1].score, window.__liveMatch.phase, +window.__liveMatch.t.toFixed(1)]); log.push([i, ...s]); console.log(i, s.join(' ')); }
}
writeFileSync(join(OUT, 'log.json'), JSON.stringify({ v, log }));
writeFileSync(join(OUT, 'cues.json'), JSON.stringify(await page.evaluate((T0) => window.__sfxLog.map(([t, ...r]) => [(t - T0) / 1000 - 1 / 30, ...r]), T0)));
await browser.close(); server.stop();
