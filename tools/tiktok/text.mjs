/**
 * Render the clips' type to PNGs (tools/tiktok): node tools/tiktok/text.mjs <list.json> <out dir>
 * list: [{ name, kind: 'hook'|'end', text, top?, small? }]
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [LIST, OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
for (const c of JSON.parse(readFileSync(LIST, 'utf8'))) {
  const q = new URLSearchParams({ kind: c.kind || 'hook', text: c.text || '', ...(c.top ? { top: c.top } : {}), ...(c.small ? { small: 1 } : {}) });
  await page.goto(`${pathToFileURL(resolve('tools/tiktok/text.html'))}?${q}`);
  await page.evaluate(() => window.__ready);
  await page.screenshot({ path: join(OUT, `${c.name}.png`), omitBackground: !['end', 'bg'].includes(c.kind) });
  console.log('✔', c.name);
}
await browser.close();
