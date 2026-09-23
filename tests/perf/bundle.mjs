/**
 * Bundle size: what the game weighs, and what a player downloads before the
 * START button.
 *
 *   total   every file the service worker precaches, raw and gzipped
 *   boot    the files the browser actually requested before START appeared,
 *           gzipped, largest first
 *
 *   node tests/perf/bundle.mjs            → a table
 *   node tests/perf/bundle.mjs --json     → one line of JSON (for before/after)
 */
import { chromium } from 'playwright';
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { startServer } from '../smoke/server.mjs';

const json = process.argv.includes('--json');
const sw = readFileSync('sw.js', 'utf8');
const files = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]).filter((f) => { try { return statSync(f).isFile(); } catch { return false; } });
const gz = (f) => gzipSync(readFileSync(f), { level: 6 }).length;
let raw = 0; let zipped = 0;
for (const f of files) { raw += statSync(f).size; zipped += /\.(js|css|html|json|svg|webmanifest)$/.test(f) ? gz(f) : statSync(f).size; }

const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl'] });
const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn', { timeout: 60000 });
await page.waitForTimeout(1500);
const boot = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => new URL(r.name).pathname.slice(1)));
await browser.close(); server.stop();
const bootFiles = [...new Set(['index.html', ...boot])].filter((f) => { try { return statSync(f).isFile(); } catch { return false; } });
const rows = bootFiles.map((f) => ({ f, gz: /\.(js|css|html|json|svg)$/.test(f) ? gz(f) : statSync(f).size })).sort((a, b) => b.gz - a.gz);
const bootKB = Math.round(rows.reduce((n, r) => n + r.gz, 0) / 1024);
const out = { precacheFiles: files.length, rawKB: Math.round(raw / 1024), gzKB: Math.round(zipped / 1024), bootFiles: rows.length, bootKB };
if (json) console.log(JSON.stringify(out));
else {
  console.log(`precache: ${files.length} files · ${out.rawKB} KB raw · ${out.gzKB} KB gzipped`);
  console.log(`before START: ${rows.length} files · ${bootKB} KB gzipped`);
  for (const r of rows.slice(0, 15)) console.log(`  ${String(Math.round(r.gz / 1024)).padStart(5)} KB  ${r.f}`);
}
