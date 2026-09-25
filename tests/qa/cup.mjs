/**
 * v118: the Custom Cup, end to end (and Kick Off's controls on a revisit). From Kick Off: make a 4-team cup (fill at
 * random, star a team), draw it, play the semi-final (fast-forwarded to full
 * time with you ahead), and land back on the bracket with your team through
 * to the final — no console errors on the way.
 *
 *   node tests/qa/cup.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { watchConsole } from '../lib/console.mjs';

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed += 1; };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const errs = watchConsole(page, { origin: server.url });
await page.addInitScript(() => { if (!sessionStorage.getItem('s')) { localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999', hintMatches: 9 }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } })); sessionStorage.setItem('s', '1'); } });
try {
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  /* v118 regression: every visit to Kick Off used to stack another click
     handler on the screen root — the third visit moved three teams per press */
  const nav = (n) => page.evaluate(async (x) => (await import('/js/app.js')).navigate(x), n);
  let steps = [];
  for (let v = 0; v < 3; v++) {
    await nav('quick'); await page.waitForSelector('#tsHome');
    const list = await page.evaluate(() => [...document.querySelectorAll('#tsRailH .ts-chip')].map((c) => c.title));
    const before = await page.evaluate(() => document.querySelector('#tsHome .ts-name').textContent);
    await page.click('#tsHome [data-cycle="home"][data-dir="1"]');
    const after = await page.evaluate(() => document.querySelector('#tsHome .ts-name').textContent);
    steps.push(list.indexOf(after) - list.indexOf(before));
    await page.click('#tsHome [data-cycle="home"][data-dir="-1"]');
    await nav('menu');
  }
  check(steps.every((x) => x === 1), `one press, one team, on every visit to Kick Off (${steps.join(', ')})`);
  await nav('quick');
  await page.click('#cupBtn');
  await page.waitForSelector('#cupName');
  await page.fill('#cupName', 'Test <b>Cup</b>');
  await page.click('[data-size="4"]');
  await page.click('.cup-chip');                       // the first team in the list is picked, and starred as yours
  await page.click('#cupFill');
  check(await page.evaluate(() => document.querySelectorAll('.cup-entry').length === 4 && !!document.querySelector('.cup-entry.you')), 'four teams picked, one of them yours');
  await page.click('#cupDraw');
  await page.waitForSelector('#cupPlay');
  check(await page.evaluate(() => document.querySelectorAll('.cup-tie').length === 2), 'drawn into two semi-finals');
  check(await page.evaluate(() => !document.querySelector('.cup-bracket b, .panel-head b') && document.body.textContent.includes('Test <b>Cup</b>')), 'the name is shown as text, not markup');
  await page.click('#cupPlay');
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 240000 });
  // full time, you 2–0 up
  await page.evaluate(() => { const m = window.__apexMatch; m.teams[0].score = 2; m.teams[1].score = 0; m.half = 2; m.t = m.duration - 0.2; });
  await page.waitForSelector('[data-o="quit"]', { timeout: 120000 });
  check(await page.evaluate(() => /Through/.test(document.querySelector('.tourney-line')?.textContent || '')), 'the full-time screen says you are through');
  await page.click('[data-o="quit"]');
  await page.waitForSelector('.cup-bracket', { timeout: 30000 });
  const st = await page.evaluate(async () => { const c = (await import('/js/state.js')).getState().club.customCup; return { rounds: c.rounds.length, final: c.rounds[1]?.[0], you: c.you }; });
  check(st.rounds === 2 && (st.final.a === st.you || st.final.b === st.you), 'back on the bracket, you in the final');
  check(!errs.length, `no console errors${errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''}`);
} catch (e) { console.error(e); failed += 1; }
await browser.close(); server.stop();
console.log(failed ? `\n${failed} check(s) failed` : '\ncup: all checks passed');
process.exitCode = failed ? 1 : 0;
