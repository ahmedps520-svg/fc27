/**
 * Store screenshots (R15 launch assets, v96): real frames from the real game,
 * not mock-ups. Each is captured at a store size in landscape (the game only
 * plays in landscape) and written as a JPEG to assets/store/, where the
 * landing page (landing.html) uses them.
 *
 * No shot shows a player's name: player cards and the match HUD carry real
 * footballers' names, which a public image must not. That is why there is no
 * pack-reveal shot.
 *
 *   node tools/store-shots.mjs [--size 1920x1080] [--quality medium] [--only title,match]
 *
 * A software GPU draws a 1080p match at a frame every few seconds, so every
 * match shot waits on the simulation's state, never on the wall clock.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { startServer } from '../tests/smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const [W, H] = arg('--size', '1920x1080').split('x').map(Number);
const QUALITY = arg('--quality', 'medium');
const ONLY = arg('--only', '');
const OUT = 'assets/store';
// the release-notes card shows once per version; a store shot never wants it
const VERSION = readFileSync('js/app.js', 'utf8').match(/APP_VERSION = '([^']+)'/)[1];
mkdirSync(OUT, { recursive: true });

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const want = (n) => !ONLY || ONLY.split(',').includes(n);
const shots = [];

async function fresh() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('  page error:', e.message));
  await page.addInitScript(([q, v]) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
    meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v, hintMatches: 9 },
    settings: { quality: q, tutorialDone: true, pregame: 'off', camera: { preset: 'broadcast' } },
  })), [QUALITY, VERSION]);
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn');
  return page;
}
const save = async (page, name) => {
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 86, timeout: 240000 });
  shots.push(name); console.log(`  ✓ ${name}`);
};
const toMenu = async (page) => { await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]'); };
const go = (page, name, params = {}) => page.evaluate(async ([n, p]) => (await import('/js/app.js')).navigate(n, p), [name, params]);

if (want('title')) {
  const page = await fresh();
  await page.waitForTimeout(2500);            // the entrance animation settles
  await save(page, '01-title');
  await page.close();
}

if (want('menu')) {
  const page = await fresh(); await toMenu(page);
  await page.waitForTimeout(1500);
  await save(page, '02-menu');
  await page.close();
}

if (want('match')) {
  const page = await fresh(); await toMenu(page);
  await go(page, 'play', { homeId: 'c1', awayId: 'c4', duration: 1200, skill: 1, mode: 'single', atmo: { time: 'night', weather: 'clear' } });
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexCam, null, { timeout: 240000 });
  // no controls, and no player's name: the cards and the HUD name real footballers
  // (the owner's call in-game), which a public store image must not
  await page.addStyleTag({ content: '#gmRoot > :not(canvas):not(.gm-hud), .gm-stam, .gm-tools, #toasts { visibility: hidden !important; }' });
  // past the walkout, into open play, with the ball well away from the centre spot
  await page.waitForFunction(() => { const m = window.__apexMatch; return m?.phase === 'play' && Math.abs(m.ball.x - 52.5) > 14 && m.ball.owner; }, null, { timeout: 600000, polling: 300 });
  await save(page, '03-match');
  // a goal, staged through the sim's own entry point, and its celebration camera
  await page.evaluate(() => { const m = window.__apexMatch; m.scoreGoal(0, 1, m.teams[0].dir > 0 ? 105 : 0); });
  await page.waitForFunction(() => { const c = window.__apexCam; return c.mode === 'celebrate' && c.modeTime > 1.6; }, null, { timeout: 600000, polling: 300 });
  await save(page, '04-goal');
  await page.close();
}

if (want('street')) {
  const page = await fresh(); await toMenu(page);
  await go(page, 'street');
  await page.fill('#stName', 'Rooftop Rafi');
  await page.click('.cs-swatches[data-key="style"] [data-i="4"]').catch(() => {});
  await page.waitForTimeout(1500);
  await save(page, '05-street');
  await page.close();
}

if (want('stadiums')) {
  const page = await fresh(); await toMenu(page);
  await go(page, 'stadiums');
  await page.waitForTimeout(6000);
  await save(page, '06-grounds');
  await page.close();
}

await browser.close(); server.stop();
console.log(`store shots: ${shots.length} written to ${OUT}/ at ${W}×${H}`);
