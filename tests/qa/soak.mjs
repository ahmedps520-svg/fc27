/**
 * The soak (v87): one browser session, hundreds of matches back to back
 * across every mode, each with a random set of settings — quality, language,
 * commentary language, reduced motion (so the pre-match show runs and is
 * skipped), colour filter, text size, battery saver, the governor, sprint
 * toggle, assists. Every match is played to its full-time card and left for
 * the menu. Fails on any page error; reports the heap every 25 matches so a
 * leak shows as a staircase.
 *
 *   node tests/qa/soak.mjs [--matches 200] [--seed 7]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('--matches', 200));
let seed = Number(arg('--seed', 7));
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

const MODES = [
  { name: 'quick', params: (i) => ({ mode: 'single', homeId: `c${1 + (i % 20)}`, awayId: `c${21 + (i % 20)}`, duration: 60 }) },
  { name: 'versus', params: (i) => ({ mode: 'versus', homeId: `c${2 + (i % 9)}`, awayId: `c${12 + (i % 9)}`, duration: 60 }) },
  { name: 'final', params: () => ({ mode: 'single', homeId: 'c1', awayId: 'c3', duration: 60, final: true }) },
  { name: 'fives', params: (i) => ({ mode: 'single', homeId: `c${1 + (i % 6)}`, awayId: `c${7 + (i % 6)}`, duration: 60, field: 'fives' }) },
  { name: 'futsal', params: (i) => ({ mode: 'single', homeId: `c${3 + (i % 6)}`, awayId: `c${9 + (i % 6)}`, duration: 60, field: 'futsal' }) },
  { name: 'street', setup: async (page) => page.evaluate(async () => { const S = await import('/js/streetMode.js'); if (!(await import('/js/state.js')).getState().street?.name) S.createBaller({ name: 'Soak Baller', number: 7 }); }),
    params: (i) => ({ mode: 'single', homeId: 'c1', awayId: 'c2', duration: 60, field: pick(['street3', 'street4', 'street5']), street: { venueId: 'rooftop', game: null } }) },
  { name: 'practice', params: () => ({ mode: 'single', homeId: 'c1', awayId: 'c2', duration: 24 * 3600, practice: { focus: pick(['free', 'freekick', 'penalty', 'corner']) } }), practice: true },
];

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const errors = [];
page.on('pageerror', (e) => errors.push(`page: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|WebSocket|WebGL/.test(m.text())) errors.push(`console: ${m.text().slice(0, 200)}`); });
await page.addInitScript(() => { if (!localStorage.getItem('apexxi.save.v1')) localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true, sound: false, commVoice: false } })); });
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn', { timeout: 60000 });
await page.click('#startBtn');
const counts = {};
const t0 = Date.now();
try {
  for (let i = 0; i < N; i++) {
    const m = pick(MODES);
    counts[m.name] = (counts[m.name] || 0) + 1;
    const settings = {
      quality: pick(['low', 'low', 'medium']), reduceMotion: rnd() < 0.7, lang: pick(['en', 'en', 'ar']), commLang: pick(['auto', 'en', 'ar']),
      colorFilter: pick(['none', 'none', 'protan', 'deutan', 'tritan']), textScale: pick([0.9, 1, 1, 1.15, 1.3]), battery: rnd() < 0.2, governor: rnd() < 0.9,
      sprintToggle: rnd() < 0.3, shootAssist: rnd() < 0.3 ? 1 : 0, passAssist: pick([0, 1, 1, 2]), subtitles: rnd() < 0.8, broadcastGfx: rnd() < 0.85, pregame: pick(['full', 'short', 'off']),
      oneHanded: rnd() < 0.15, menuTheme: pick(['auto', 'off', 'ramadan', 'winter', 'nationalDay']),
    };
    await page.evaluate((st) => import('/js/state.js').then((s) => s.update((x) => { Object.assign(x.settings, st); })), settings);
    if (m.setup) await m.setup(page);
    const params = m.params(i);
    await page.evaluate((p) => { window.__apexMatch = null; window.__apexDbg = null; return import('/js/app.js').then((a) => a.navigate('play', p)); }, params);
    await page.waitForFunction(() => window.__apexMatch && window.__apexDbg && !window.__apexDbg().loading, null, { timeout: 120000 });
    // the pre-match show, when it runs, is skipped the way a person would
    await page.evaluate(() => document.getElementById('pgSkip')?.click());
    await page.waitForTimeout(400 + Math.floor(rnd() * 900));
    if (m.practice) {
      await page.evaluate(() => document.querySelector('[data-prac="corner"]')?.click());
      await page.waitForTimeout(300);
    } else {
      await page.evaluate(() => { const mt = window.__apexMatch; if (mt.phase === 'kickoff') mt.startPlay(); mt.half = 2; mt.t = mt.duration - 0.3; });
      await page.waitForFunction(() => !!document.querySelector('.gm-panel'), null, { timeout: 60000 });
      // open a full-time tab now and then
      if (rnd() < 0.3) await page.evaluate(() => document.querySelector('[data-pm="ratings"]')?.click());
    }
    await page.evaluate(() => import('/js/app.js').then((a) => a.navigate('menu')));
    await page.waitForTimeout(150);
    if ((i + 1) % 25 === 0 || i === N - 1) {
      await cdp.send('HeapProfiler.collectGarbage');
      const { usedSize } = await cdp.send('Runtime.getHeapUsage');
      console.log(`  · ${i + 1}/${N} matches · heap ${(usedSize / 1048576).toFixed(1)} MB · ${errors.length} errors · ${Math.round((Date.now() - t0) / 1000)} s`);
    }
    if (errors.length > 20) break;
  }
} catch (e) {
  errors.push(`driver: ${e.message.split('\n')[0]}`);
}
await browser.close();
server.stop();
console.log(`  modes: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
for (const e of [...new Set(errors)].slice(0, 20)) console.log('  ✗', e);
console.log(errors.length ? `soak: ${errors.length} problem(s)` : `soak: ok (${N} matches)`);
process.exit(errors.length ? 1 : 0);
