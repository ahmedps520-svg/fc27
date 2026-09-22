/**
 * Every ground, every sky, every tier: the bug-bash matrix.
 *
 * Builds a match at each stadium in turn, rotating through time of day,
 * weather and quality tier so that every combination turns up across the
 * run, and checks one frame of each for a black or blank picture, a pitch
 * that is missing from the broadcast view, and any page error or console
 * error on the way.
 *
 *   node tests/visual/venue-matrix.mjs [--tiers low,medium,high,cinema] [--only forge,bramble] [--every 1]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../smoke/server.mjs';
import { decodePNG } from '../lib/png.mjs';
import { STADIUMS } from '../../js/data/stadiums.js';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TIERS = arg('--tiers', 'low,medium,high,cinema').split(',');
const ONLY = arg('--only', '');
const EVERY = Number(arg('--every', 1));
const OUT = arg('--out', 'tests/tmp/venues');
mkdirSync(OUT, { recursive: true });
const TIMES = ['day', 'dusk', 'night'];
const WEATHERS = ['clear', 'overcast', 'rain'];
const venues = (ONLY ? ONLY.split(',') : STADIUMS.map((s) => s.id)).filter((_, i) => i % EVERY === 0);

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const problems = [];
const rows = [];
let page = null;
const fresh = async () => {
  if (page) await page.close();
  page = await browser.newPage({ viewport: { width: 400, height: 225 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) problems.push(`console: ${m.text().slice(0, 160)}`); });
  await page.addInitScript(() => localStorage.setItem('apexxi.save.v1', JSON.stringify({
    meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' },
    settings: { quality: 'low', reduceMotion: true, tutorialDone: true },
  })));
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
};
await fresh();

for (let i = 0; i < venues.length; i++) {
  const venue = venues[i];
  const tier = TIERS[i % TIERS.length];
  const time = TIMES[i % 3]; const weather = WEATHERS[Math.floor(i / 3) % 3];
  const tag = `${venue}/${tier}/${time}/${weather}`;
  const before = problems.length;
  try {
    // a fresh page every few grounds keeps GPU memory from piling up across the run
    if (i && i % 12 === 0) await fresh();
    await page.evaluate(async ({ venue, tier, time, weather }) => {
      const st = await import('/js/state.js');
      st.update((s) => { s.settings.quality = tier; });
      const app = await import('/js/app.js');
      app.navigate('play', { homeId: 'c1', awayId: 'c4', venueId: venue, duration: 40, skill: 1, mode: 'single', atmo: { time, weather } });
    }, { venue, tier, time, weather });
    await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexCam, null, { timeout: 180000 });
    await page.addStyleTag({ content: '#gmRoot > :not(canvas) { visibility: hidden !important; }' });
    await page.evaluate(() => { window.__apexCam.setSettings({ preset: 'broadcast' }); window.__apexCam.snap(); });
    const buf = await page.screenshot({ type: 'png', timeout: 240000 });
    writeFileSync(join(OUT, `${String(i).padStart(3, '0')}-${venue}-${tier}-${time}-${weather}.png`), buf);
    const { width, height, channels, data } = decodePNG(buf);
    let black = 0, grass = 0, lum = 0; const n = width * height;
    for (let k = 0; k < n; k++) {
      const o = k * channels; const r = data[o], g = data[o + 1], b = data[o + 2];
      if (r + g + b < 6) black++;
      if (g > r * 1.05 && g > b * 1.0 && g > 30) grass++;
      lum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    const row = { tag, black: +(100 * black / n).toFixed(2), grass: +(100 * grass / n).toFixed(1), lum: Math.round(lum / n) };
    rows.push(row);
    if (row.black > 3) problems.push(`${tag}: ${row.black}% pure black`);
    if (row.lum < 14) problems.push(`${tag}: mean brightness ${row.lum}`);
    if (row.grass < 15) problems.push(`${tag}: pitch only ${row.grass}% of the broadcast frame`);
    await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('menu'); });
    await page.waitForTimeout(300);
  } catch (e) {
    problems.push(`${tag}: ${e.message.split('\n')[0]}`);
    await fresh();
  }
  for (let k = before; k < problems.length; k++) if (!problems[k].startsWith(venue)) problems[k] = `${tag}: ${problems[k]}`;
  process.stdout.write(`${tag} ${rows.at(-1)?.tag === tag ? `black ${rows.at(-1).black}% grass ${rows.at(-1).grass}% lum ${rows.at(-1).lum}` : 'FAILED'}\n`);
}
await browser.close(); server.stop();
writeFileSync(join(OUT, 'report.json'), JSON.stringify({ rows, problems }, null, 2));
if (problems.length) { console.log(`venues: ${problems.length} problems`); for (const p of problems) console.log('  ✗', p); process.exit(1); }
console.log(`venues: ok (${rows.length} grounds)`);
