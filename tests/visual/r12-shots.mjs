/**
 * R12 (v82) visual pass: the street screen from creating a baller to a tour
 * game played to full time, the skill games (a drill, the shootout, the
 * practice arena with a staged free kick), the Button map in Settings, and
 * split touch for two on a tablet. Phone, both orientations, plus a tablet.
 * Fails on any page error, a page wider than the screen, or anything clipped
 * past a panel's edge.
 *
 *   node tests/visual/r12-shots.mjs      → tests/tmp/r12/*.png
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { mkdirSync } from 'node:fs';

const OUT = 'tests/tmp/r12';
mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];
const server = await startServer();
const browser = await chromium.launch({ args: ARGS });
const errors = [];
const nav = (page, route, params) => page.evaluate(async ([r, p]) => (await import('/js/app.js')).navigate(r, p), [route, params]);
try {
  const notes = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
  const views = [['port', { width: 390, height: 844 }], ['land', { width: 844, height: 390 }], ['tab', { width: 1180, height: 820 }]];
  for (const [tag, vp] of views) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: tag !== 'tab', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) errors.push(`${tag} console: ${m.text()}`); });
    await page.addInitScript(({ notes }) => {
      if (!localStorage.getItem('apexxi.save.v1')) localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notes }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
    }, { notes });
    try {
      await page.goto(`${server.url}/`);
      await page.waitForSelector('#startBtn', { timeout: 20000 });
      await page.click('#startBtn');
      page.setDefaultTimeout(12000);
      const check = async (name) => {
        await page.waitForTimeout(450);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 1) errors.push(`${tag}/${name}: page is ${over}px wider than the viewport`);
        const wide = await page.evaluate(() => [...document.querySelectorAll('.panel *, .chub *, .cfix *, .drill-stage *')].filter((el) => el.offsetParent && el.getBoundingClientRect().right > window.innerWidth + 1
          && !el.closest('.cnav, .chips, .ltable, .store-row, .st-venues, .st-lock')).slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`));
        if (wide.length) errors.push(`${tag}/${name}: past the right edge: ${wide.join(', ')}`);
        await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
      };

      if (tag === 'tab') {
        // split touch: two people, one tablet
        await nav(page, 'play', { mode: 'versus', homeId: 'c1', awayId: 'c2', duration: 60 });
        await page.waitForFunction(() => window.__apexMatch && window.__apexMatch.t > 1, null, { timeout: 90000 });
        const halves = await page.$$eval('.gm-split .split-half', (els) => els.map((e) => e.getBoundingClientRect().width));
        if (halves.length !== 2) errors.push(`tab: split touch shows ${halves.length} halves`);
        await page.screenshot({ path: `${OUT}/tab-split.png`, timeout: 60000 });
        await ctx.close();
        continue;
      }

      // ---- street: create a baller, every tab
      await nav(page, 'street');
      await page.waitForSelector('#stForm');
      await page.fill('#stName', 'Zed Tester');
      await check('street-create');
      await page.click('#stCreate');
      await page.waitForSelector('#stTabs');
      for (const t of await page.$$eval('#stTabs [data-tab]', (els) => els.map((e) => e.dataset.tab))) {
        await page.click(`#stTabs [data-tab="${t}"]`);
        await check(`street-${t}`);
      }
      if (tag === 'land') {
        await page.click('#stTabs [data-tab="tour"]');
        await page.click('[data-tour="0:0"]');
        await page.waitForFunction(() => window.__apexMatch && window.__apexMatch.t > 2, null, { timeout: 150000 });
        const cage = await page.evaluate(() => ({ n: window.__apexMatch.teams[0].players.length, off: window.__apexMatch.isOffside(window.__apexMatch.teams[0].players[1]) }));
        if (cage.off) errors.push('street: offside is on');
        await page.screenshot({ path: `${OUT}/${tag}-street-match.png` });
        await page.evaluate(() => { const m = window.__apexMatch; m.teams[0].score = 3; m.half = 2; m.t = m.duration - 0.6; });
        await page.waitForSelector('.gm-panel', { timeout: 120000 });
        await page.waitForTimeout(700);
        const ft = await page.evaluate(() => document.querySelector('.gm-panel')?.innerText || '');
        if (!/style/i.test(ft)) errors.push('street full time shows no style');
        await page.screenshot({ path: `${OUT}/${tag}-street-ft.png` });
        const played = await page.evaluate(async () => Object.keys((await import('/js/state.js')).getState().street.tour || {}).length);
        if (!played) errors.push('the tour game did not count');
      }

      // ---- skill games
      await nav(page, 'skills');
      await page.waitForSelector('#skTabs');
      await check('skills-drills');
      await page.click('[data-drill="slalom"]');
      await page.waitForSelector('#drillCv');
      await page.waitForTimeout(1500);
      await check('skills-drill-live');
      await page.click('#drillQuit');
      await page.click('#skTabs [data-tab="pens"]'); await check('skills-pens');
      await page.click('#skTabs [data-tab="practice"]'); await check('skills-practice');
      if (tag === 'land') {
        await page.click('[data-practice="freekick"]');
        await page.waitForFunction(() => window.__apexMatch && window.__apexMatch.phase === 'freekick', null, { timeout: 150000 }).catch(() => {});
        await page.waitForTimeout(2500);
        const st = await page.evaluate(() => ({ bar: !document.getElementById('gmPractice')?.hidden, phase: window.__apexMatch.phase }));
        if (!st.bar) errors.push('practice: no practice bar');
        if (st.phase !== 'freekick') errors.push(`practice: no staged free kick (${st.phase})`);
        await page.screenshot({ path: `${OUT}/${tag}-practice.png` });
      }

      // ---- settings: the Button map
      await nav(page, 'settings');
      await page.waitForSelector('#rebind');
      await page.$eval('#rebind', (el) => el.scrollIntoView());
      await check('settings-rebind');
    } catch (e) {
      errors.push(`${tag}: ${e.message.split('\n')[0]}`);
      await page.screenshot({ path: `${OUT}/${tag}-FAIL.png` }).catch(() => {});
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.stop?.();
}
for (const e of errors) console.log('  ✗', e);
console.log(errors.length ? `r12 shots: ${errors.length} problem(s)` : 'r12 shots: clean');
process.exit(errors.length ? 1 : 0);
