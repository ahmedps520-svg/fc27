/**
 * Render the App Store trailer's type (cards.html) to frames, for each format.
 *
 *   node tools/trailer/appstore/titles.mjs [--formats iphone,ipad,wide] [--out tests/tmp/as/cards]
 *
 * Writes <out>/<format>/<name>/f####.png, transparent except the end card.
 * Every CSS animation is paused and set to the frame's time (cards.html
 * __at), so the motion is exact at 30 fps. The list below is the cut's
 * (cut.py), in its order.
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'tests/tmp/as/cards');
const SIZES = { iphone: [1920, 886], ipad: [1600, 1200], wide: [1920, 1080] };
const FORMATS = arg('--formats', Object.keys(SIZES).join(',')).split(',');
// name, card, text, kicker, frames, out (ms a caption starts to leave; 0: never)
export const TITLES = [
  { name: 'slam', card: 'slam', text: 'BUILD YOUR XI · PLAY ONLINE', frames: 60 },
  { name: 'cap-play', card: 'cap', kicker: 'FULL 3D FOOTBALL', text: 'EVERY STRIKE. *EVERY* *ROAR.*', frames: 114, out: 3560 },
  { name: 'cap-pack', card: 'cap', kicker: 'ULTIMATE XI', text: 'OPEN PACKS. *BUILD* *YOUR* *XI.*', frames: 114, out: 3560 },
  { name: 'cap-weather', card: 'cap', kicker: 'DAY · NIGHT · RAIN · SNOW', text: 'WHATEVER THE *WEATHER*', frames: 57, out: 1640 },
  { name: 'cap-career', card: 'cap', kicker: 'CAREER', text: 'TAKE A CLUB TO *GLORY*', frames: 57, out: 1640 },
  { name: 'cap-online', card: 'cap', kicker: 'ONLINE', text: 'CHALLENGE YOUR *FRIENDS*', frames: 57, out: 1640 },
  { name: 'cap-lights', card: 'cap', kicker: 'UNDER THE LIGHTS', text: '', frames: 54, out: 1560 },
  { name: 'w-ultimate', card: 'word', text: 'ULTIMATE XI', frames: 30 },
  { name: 'w-career', card: 'word', text: 'CAREER', frames: 30 },
  { name: 'w-online', card: 'word', text: 'ONLINE', frames: 30 },
  { name: 'w-street', card: 'word', text: 'STREET', frames: 30 },
  { name: 'end', card: 'end', frames: 54 },
];

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const PAGE = pathToFileURL(resolve('tools/trailer/appstore/cards.html')).href;
  const browser = await chromium.launch();
  for (const f of FORMATS) {
    const [W, H] = SIZES[f];
    for (const c of TITLES) {
      const dir = join(OUT, f, c.name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
      const page = await browser.newPage({ viewport: { width: W, height: H } });
      const qs = new URLSearchParams({ card: c.card, text: c.text || '', kicker: c.kicker || '', out: String(c.out || 0) });
      await page.goto(`${PAGE}?${qs}`);
      await page.evaluate(() => window.__ready);
      for (let i = 0; i < c.frames; i++) {
        await page.evaluate((ms) => window.__at(ms), (i * 1000) / 30);
        await page.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`), omitBackground: c.card !== 'end' });
      }
      await page.close();
    }
    console.log(`✔ ${f}: ${TITLES.length} titles`);
  }
  await browser.close();
}
