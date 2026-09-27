/**
 * The Ultimate XI pack opening, filmed on a phone-sized page (tools/tiktok).
 *   node tools/tiktok/pack.mjs <out dir> [pack id = vault]
 * Every footballer is renamed from the game's made-up name pools first: the
 * clip is public. Frame-exact (stepper.mjs); the sfx the game played are logged
 * for sound.mjs.
 */
import { chromium } from 'playwright';
import { join } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';
import { stepper, logSfx } from './stepper.mjs';

const OUT = process.argv[2] || 'tests/tmp/tiktok/pack'; const PACK = process.argv[3] || 'vault'; const SEED = +(process.argv[4] || 11);
const server = await startServer();
const v = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => t.match(/APP_VERSION = '(v\d+)'/)[1]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('page error', e.message));
await page.addInitScript((v) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
  meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v },
  settings: { quality: 'medium', qualityPicked: true, tutorialDone: true, reduceMotion: false, menuTheme: 'off', sound: true, musicVol: 0, sfxVol: 1 },
})), v);
await logSfx(page);
// a seeded Math.random: the same pulls every run
await page.addInitScript((seed) => { let a = seed; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, SEED);
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn');
await page.evaluate(async () => {
  const { WORLD } = await import('/js/data/generator.js');
  const { FIRST_NAMES, LAST_NAMES } = await import('/js/data/pools.js');
  WORLD.players.forEach((p, i) => { const f = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length]; const l = LAST_NAMES[(i * 13 + 5) % LAST_NAMES.length]; p.name = `${f} ${l}`; p.short = `${f[0]}. ${l}`; });
});
await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.getByText('Continue', { exact: true }).click({ timeout: 1500 }).catch(() => {});
await page.evaluate(async (PACK) => { const st = await import('/js/state.js'); st.update((s) => { s.club.packs = [PACK, 'gold']; }); (await import('/js/app.js')).navigate('squad'); }, PACK);
await page.waitForSelector('#uTabs');
await page.click('[data-utab="store"]'); await page.waitForTimeout(1000);
await page.click('[data-stab="locker"]'); await page.waitForTimeout(1500);
const cam = await stepper(page, join(OUT, 'frames'));
await cam.hold(500);
await page.click(`[data-open-pack="${PACK}"]`, { noWaitAfter: true });
for (let i = 0; i < 60 && !(await page.$('#packRip')); i++) await cam.frame();
await cam.hold(1100);
await page.click('#packRip', { noWaitAfter: true });
await cam.hold(5200);
// then the other pack in the locker, straight after
await page.click('#packNext, .pack-next, [data-pack-next]', { noWaitAfter: true, timeout: 5000 }).catch(() => page.getByText('Add to collection').click({ noWaitAfter: true, timeout: 5000 }).catch(() => console.log('no next button')));
for (let i = 0; i < 90 && !(await page.$('[data-open-pack="gold"]')); i++) await cam.frame();
await cam.hold(400);
await page.click('[data-open-pack="gold"]', { noWaitAfter: true, timeout: 5000 }).catch(() => console.log('no gold pack'));
for (let i = 0; i < 60 && !(await page.$('#packRip')); i++) await cam.frame();
await cam.hold(800);
await page.click('#packRip', { noWaitAfter: true, timeout: 5000 }).catch(() => {});
await cam.hold(6500);
const info = await cam.finish();
console.log('✔ pack', info.frames, 'frames', JSON.stringify(info.log));
await browser.close(); server.stop();
