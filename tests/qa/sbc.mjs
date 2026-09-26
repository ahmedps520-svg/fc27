/**
 * SBCs end to end (v120): every group folds open, and Start opens a challenge
 * in each of them. Until v120 only the first group's Start did anything — the
 * click was listened for on the first list alone — and nothing tested it.
 *
 *   node tests/qa/sbc.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { watchConsole } from '../lib/console.mjs';

const server = await startServer();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`page error ${e.message}`));
const consoleIssues = watchConsole(page, { tag: 'sbc', origin: server.url });
await page.addInitScript(() => localStorage.setItem('apexxi.save.v1', JSON.stringify({
  meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' },
  settings: { reduceMotion: true, tutorialDone: true, quality: 'low' },
})));
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.evaluate(async () => (await import('/js/app.js')).navigate('squad'));
await page.click('[data-utab=challenges]');
await page.waitForSelector('.sbc-grp');

const groups = await page.$$eval('.sbc-grp', (ds) => ds.map((d) => d.dataset.sbcgrp));
if (groups.length < 3) problems.push(`expected 3 SBC groups, found ${groups.length}`);
const open = await page.$$eval('.sbc-grp[open]', (ds) => ds.length);
if (open !== 1) problems.push(`${open} groups open on arrival (want 1)`);

for (const g of groups) {
  const sel = `.sbc-grp[data-sbcgrp="${g}"]`;
  if (!(await page.$eval(sel, (d) => d.open))) await page.click(`${sel} > summary`);
  await page.waitForTimeout(200);
  const others = await page.$$eval('.sbc-grp[open]', (ds) => ds.map((d) => d.dataset.sbcgrp));
  if (others.length !== 1 || others[0] !== g) problems.push(`${g}: open groups after unfolding it: ${others.join(',')}`);
  const start = await page.$(`${sel} [data-sbc]`);
  if (!start) { problems.push(`${g}: no Start button`); continue; }
  const id = await start.getAttribute('data-sbc');
  await start.click();
  const opened = await page.waitForSelector('#sbcBack', { timeout: 4000 }).then(() => true, () => false);
  if (!opened) { problems.push(`${g}: Start on ${id} did not open the challenge`); continue; }
  console.log(`✔ ${g}: ${id} opens`);
  await page.click('#sbcBack');
  await page.waitForSelector('.sbc-grp');
  // the group you came back from is still the open one
  const back = await page.$$eval('.sbc-grp[open]', (ds) => ds.map((d) => d.dataset.sbcgrp));
  if (back[0] !== g) problems.push(`${g}: came back to ${back.join(',') || 'nothing'} open`);
}

await browser.close(); server.stop();
const issues = [...problems, ...consoleIssues];
if (issues.length) { console.error(`✘ SBC\n  - ${issues.join('\n  - ')}`); process.exit(1); }
console.log('✔ every SBC group unfolds and starts');
