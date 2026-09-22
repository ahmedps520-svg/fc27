/**
 * Camera and visual regression shots.
 *
 * Plays a real match in software WebGL, and for each ground it visits it
 * frames every camera preset and every set-piece and celebration angle, saves
 * a screenshot of each, and checks the picture:
 *
 *  - not a black frame (the mean brightness and the share of pure-black
 *    pixels);
 *  - the pitch fills a sensible share of it (grass-coloured pixels), so a
 *    camera that ends up inside a stand, under the pitch or pointing at the
 *    sky fails instead of shipping;
 *  - the rig itself reports a pose outside the ground's geometry as a fail.
 *
 * The PNGs land in tests/tmp/shots/ and CI uploads them as an artifact, so a
 * camera change can be looked at, not just passed.
 *
 *   node tests/visual/camera-shots.mjs [--venues forge,bramble] [--quality low] [--out tests/tmp/shots]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../smoke/server.mjs';
import { decodePNG } from '../lib/png.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const VENUES = arg('--venues', 'forge,bramble').split(',');
const QUALITY = arg('--quality', 'low');
const OUT = arg('--out', 'tests/tmp/shots');
mkdirSync(OUT, { recursive: true });

const PRESETS = ['broadcast', 'tele', 'coop', 'dynamic', 'pro', 'e2e', 'tactical'];
/* Each set piece is staged straight through the sim's own entry points, so
   the shot is of the real restart and the rig reaches it the normal way. */
const SET_PIECES = {
  corner: (m) => m.startCorner(0, 0, m.teams[0].dir > 0 ? 105 : 0),
  freekick: (m) => { const d = m.teams[0].dir; m.awardFreeKick(0, { x: d > 0 ? 80 : 25, y: 30 }, m.teams[1].players[4]); },
  penalty: (m) => m.awardPenalty(0, m.teams[1].players[3]),
  throwin: (m) => m.startThrowIn(0, 40, 0),
  celebrate: (m) => m.scoreGoal(0, 1, m.teams[0].dir > 0 ? 105 : 0),
};

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const failures = [];
const rows = [];

for (const venue of VENUES) {
  const page = await browser.newPage({ viewport: { width: 480, height: 270 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => failures.push(`${venue}: page error ${e.message}`));
  await page.addInitScript((q) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
    meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' },
    settings: { quality: q, reduceMotion: true, tutorialDone: true, camera: { preset: 'broadcast' } },
  })), QUALITY);
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async (v) => {
    const app = await import('/js/app.js');
    app.navigate('play', { homeId: 'c1', awayId: 'c4', venueId: v, duration: 1200, skill: 1, mode: 'single', atmo: { time: 'day', weather: 'clear' } });
  }, venue);
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexCam, null, { timeout: 90000 });
  await page.addStyleTag({ content: '#gmRoot > :not(canvas) { visibility: hidden !important; }' });
  // past the walkout and the kick-off
  await page.waitForFunction(() => window.__apexMatch?.phase === 'play', null, { timeout: 120000 });

  const shoot = async (name, minGrass, maxGrass) => {
    const buf = await page.screenshot({ type: 'png', timeout: 150000 });
    writeFileSync(join(OUT, `${venue}-${name}.png`), buf);
    const png = decodePNG(buf);
    const { width, height, channels, data } = png;
    let black = 0, grass = 0, lum = 0;
    const n = width * height;
    for (let i = 0; i < n; i++) {
      const o = i * channels; const r = data[o], g = data[o + 1], b = data[o + 2];
      if (r + g + b < 6) black++;
      if (g > r * 1.08 && g > b * 1.02 && g > 40) grass++;
      lum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    const st = await page.evaluate(() => {
      const c = window.__apexCam; const p = c.pose;
      return { mode: c.mode, phase: window.__apexMatch.phase, pose: [p.x, p.y, p.z].map((v) => +v.toFixed(1)) };
    });
    const row = { venue, name, mode: st.mode, phase: st.phase, pose: st.pose.join(','), black: +(100 * black / n).toFixed(2), grass: +(100 * grass / n).toFixed(1), lum: +(lum / n).toFixed(0) };
    rows.push(row);
    if (row.black > 3) failures.push(`${venue}/${name}: ${row.black}% pure black`);
    if (row.lum < 18) failures.push(`${venue}/${name}: mean brightness ${row.lum}`);
    if (row.grass < minGrass || row.grass > maxGrass) failures.push(`${venue}/${name}: pitch covers ${row.grass}% of the frame (want ${minGrass}–${maxGrass}%)`);
    if (st.pose.some((v) => !Number.isFinite(v))) failures.push(`${venue}/${name}: camera pose not finite`);
  };

  for (const preset of PRESETS) {
    await page.evaluate((p) => { window.__apexCam.setSettings({ preset: p }); window.__apexCam.snap(); }, preset);
    await page.waitForFunction(() => window.__apexCam.modeTime > 0.6 || window.__apexCam.mode !== 'play', null, { timeout: 240000, polling: 200 });
    await shoot(preset, 12, 99.5);
  }
  await page.evaluate(() => { window.__apexCam.setSettings({ preset: 'broadcast' }); window.__apexCam.snap(); });
  for (const [kind, stage] of Object.entries(SET_PIECES)) {
    await page.waitForFunction(() => window.__apexMatch.phase === 'play', null, { timeout: 300000, polling: 250 });
    await page.evaluate(`(${stage.toString()})(window.__apexMatch)`);
    // the blended transition, then the shot — in match time: software GL draws a
    // few frames a second, so a wall-clock wait catches the camera mid-move
    await page.waitForFunction((k) => { const c = window.__apexCam; return (c.mode === k && c.modeTime > 1.8) || (k !== 'celebrate' && window.__apexMatch.phase === 'play'); }, kind === 'celebrate' ? 'celebrate' : kind, { timeout: 240000, polling: 200 });
    await shoot(kind, 6, 99.5);
    if (kind !== 'celebrate' && rows.at(-1).mode !== kind) failures.push(`${venue}/${kind}: the rig was in '${rows.at(-1).mode}' mode (sim phase ${rows.at(-1).phase})`);
  }
  await page.close();
}

await browser.close(); server.stop();
console.table(rows);
writeFileSync(join(OUT, 'report.json'), JSON.stringify({ rows, failures }, null, 2));
if (failures.length) { console.log('camera shots: FAIL'); for (const f of failures) console.log('  ✗', f); process.exit(1); }
console.log(`camera shots: ok (${rows.length} frames in ${OUT})`);
