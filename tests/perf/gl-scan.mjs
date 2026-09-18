/**
 * The black-patch scan: the regression test for the flicker.
 *
 * A NaN in any pass comes out of the pipe as an exactly-black pixel, and a
 * lit stadium at night has almost none of those — fog and tone mapping keep
 * even the shadows off zero. So this plays a match at Ultra on software
 * WebGL, screenshots it repeatedly, and counts pure-black pixels inside the
 * pitch region of the frame. A healthy build counts a handful (line art
 * edges); a build with the beam NaN counted whole wedges.
 *
 *   node tests/perf/gl-scan.mjs [--root <dir>] [--frames 16]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { decodePNG } from '../lib/png.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const server = await startServer(undefined, { cwd: arg('--root', process.cwd()) });
const FRAMES = Number(arg('--frames', 16));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const page = await browser.newPage({ viewport: { width: 480, height: 270 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.addInitScript(() => localStorage.setItem('apexxi.save.v1', JSON.stringify({
  meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' },
  settings: { quality: 'ultra', reduceMotion: true, tutorialDone: true },
})));
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c4', duration: 40, skill: 1, mode: 'single' }); });
await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 60000 });
// hide the HUD so only the picture is measured
await page.addStyleTag({ content: '#gmRoot > :not(canvas) { visibility: hidden !important; }' });

const counts = [];
for (let i = 0; i < FRAMES; i++) {
  const png = decodePNG(await page.screenshot({ type: 'png' }));
  const { width, height, channels, data } = png;
  let black = 0, total = 0;
  for (let y = Math.floor(height * 0.30); y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      total += 1;
      if (data[o] === 0 && data[o + 1] === 0 && data[o + 2] === 0) black += 1;
    }
  }
  counts.push(black);
  process.stdout.write(`frame ${i + 1}: ${black} black px (${(100 * black / total).toFixed(3)}%)\n`);
  await page.waitForTimeout(700);
}
await browser.close(); server.stop();
const max = Math.max(...counts), mean = counts.reduce((a, b) => a + b, 0) / counts.length;
console.log(`max ${max} · mean ${mean.toFixed(1)} black pixels per frame below the horizon`);
process.exit(max > 400 ? 1 : 0);
