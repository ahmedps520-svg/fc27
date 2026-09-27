/**
 * Render the trailer's cards and captions (cards.html) to frames.
 *
 *   node tools/trailer/cards.mjs <cards.json> <out dir>
 *   cards.json: [{ name, card: title|line|cap|end, text, kicker, frames, fadeOut }]
 *
 * Captions ('cap') come out as PNGs with transparency, to lay over footage;
 * everything else as JPEGs. Every CSS animation is paused and set to the
 * frame's time, so the motion is exact at 30 fps however slow the machine.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [LIST, OUT] = process.argv.slice(2);
const cards = JSON.parse(readFileSync(LIST, 'utf8'));
const PAGE = pathToFileURL(resolve('tools/trailer/cards.html')).href;
const browser = await chromium.launch();
for (const c of cards) {
  const dir = join(OUT, c.name); mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const qs = new URLSearchParams({ card: c.card, text: c.text || '', kicker: c.kicker || '' });
  await page.goto(`${PAGE}?${qs}`);
  await page.evaluate(() => window.__ready);
  const alpha = c.card === 'cap';
  for (let f = 0; f < c.frames; f++) {
    const fade = c.fadeOut ? Math.max(0, Math.min(1, (c.frames - f) / c.fadeOut)) : 1;
    await page.evaluate(({ ms, fade }) => { window.__at(ms); document.body.style.opacity = String(fade); }, { ms: (f * 1000) / 30, fade });
    await page.screenshot({ path: join(dir, `f${String(f).padStart(4, '0')}.${alpha ? 'png' : 'jpg'}`), omitBackground: alpha, ...(alpha ? {} : { type: 'jpeg', quality: 95 }) });
  }
  console.log(`✔ ${c.name}: ${c.frames} frames`);
  await page.close();
}
await browser.close();
