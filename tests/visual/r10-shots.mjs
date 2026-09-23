/**
 * R10 (v80) visual pass: every new Ultimate XI panel on a phone, in both
 * orientations, plus a Quickfire Fives match on the real renderer. Fails on
 * any page error or any panel wider than the viewport.
 *
 *   node tests/visual/r10-shots.mjs      → tests/tmp/r10/*.png
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { mkdirSync } from 'node:fs';

const OUT = 'tests/tmp/r10';
mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];
const server = await startServer();
const browser = await chromium.launch({ args: ARGS });
const errors = [];
let bad = 0;
try {
  const notes = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
  for (const [tag, vp] of [['land', { width: 844, height: 390 }], ['port', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) errors.push(`${tag} console: ${m.text()}`); });
    await page.addInitScript(({ notes }) => {
      if (!localStorage.getItem('apexxi.save.v1')) localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notes }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
    }, { notes });
    await page.goto(`${server.url}/`);
    await page.waitForSelector('#startBtn', { timeout: 20000 });
    await page.click('#startBtn');
    // a club to look at: sixty golds, a promo card, an evolution running, some XP
    await page.evaluate(async () => {
      const st = await import('/js/state.js');
      const g = await import('/js/data/generator.js');
      const pr = await import('/js/data/promos.js');
      const golds = g.WORLD.players.filter((p) => p.rarity === 'gold' && !p.sbc).slice(0, 60).map((p) => p.id);
      const promo = pr.campaignCards()[5];
      st.update((s) => { s.club.collection = [...golds, promo.id]; s.club.apex = 400000; s.club.xpTotal = 9000; });
      const hub = await import('/js/squadHub.js');
      hub.applyBuild(hub.buildSquad());
      const evo = await import('/js/evolutions.js');
      const cand = golds.map(g.getPlayer).find((p) => p.position === 'ST' && p.overall <= 83 && !st.getState().club.lineup.includes(p.id)) || golds.map(g.getPlayer).find((p) => p.position === 'ST');
      evo.startEvolution('clinical', cand.id);
      const modes = await import('/js/modes.js');
      modes.settleFives(3, 1); modes.settleClash(modes.clashWeek()[0].id, 'pro', 2, 0);
      (await import('/js/app.js')).navigate('squad');
    });
    const shot = async (name, go) => {
      await go();
      await page.waitForTimeout(500);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) { bad += 1; errors.push(`${tag}/${name}: page is ${over}px wider than the viewport`); }
      // clipped inside a panel counts too: overflow: hidden hides it from scrollWidth
      const wide = await page.evaluate(() => [...document.querySelectorAll('.panel, .panel *')].filter((el) => el.offsetParent && el.getBoundingClientRect().right > window.innerWidth + 1 && !el.closest('.store-row, .rank-strip, .lvl-track, .subtabs, .tabs, .chips, .mkt-list')).slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`));
      if (wide.length) { bad += 1; errors.push(`${tag}/${name}: past the right edge: ${wide.join(', ')}`); }
      await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: false });
    };
    const tab = (id) => page.click(`[data-utab="${id}"]`);
    await shot('squad', async () => { await page.evaluate(() => document.getElementById('squadHub')?.scrollIntoView()); });
    await shot('pitch', async () => { await page.evaluate(() => document.getElementById('pitch')?.scrollIntoView()); });
    await shot('evos', async () => { await page.click('[data-ctab="evos"]'); });
    await shot('modes', async () => { await tab('division'); await page.evaluate(() => document.querySelector('.fives-card')?.scrollIntoView()); });
    await shot('clash', async () => { await page.evaluate(() => document.querySelector('.clash-card')?.scrollIntoView()); });
    await shot('tasks', async () => { await tab('objectives'); });
    await shot('market', async () => { await tab('store'); await page.click('[data-stab="market"]'); });
    await shot('market-detail', async () => { await page.click('[data-listing]'); await page.waitForSelector('#mktDetail'); await page.evaluate(() => document.getElementById('mktDetail').scrollIntoView()); });
    await shot('binder', async () => { await page.click('[data-stab="binder"]'); });
    await shot('store', async () => { await page.click('[data-stab="packs"]'); await page.evaluate(() => document.querySelector('.cat-promo')?.scrollIntoView()); });
    if (tag === 'land') {
      // a Quickfire Fives match on the real renderer
      await tab('division');
      await page.click('#playFives');
      await page.waitForFunction(() => window.__apexMatch && window.__apexMatch.t > 3, null, { timeout: 150000 });
      const info = await page.evaluate(() => ({ n: window.__apexMatch.teams.map((t) => t.players.length), w: window.__apexMatch.constructor && (window.__apexMatch.pitchW || null) }));
      if (info.n.join() !== '5,5') { bad += 1; errors.push(`fives fielded ${info.n}`); }
      await page.screenshot({ path: `${OUT}/${tag}-fives-match.png` });
      await page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
      await page.waitForSelector('.gm-panel', { timeout: 120000 }).catch(() => {});
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/${tag}-fives-ft.png` });
      const ft = await page.evaluate(() => document.querySelector('.gm-panel')?.innerText || '');
      if (!/Quickfire Fives/i.test(ft)) { bad += 1; errors.push('the full-time panel has no Fives result'); }
      console.log('  fives full time:', ft.replace(/\s+/g, ' ').slice(0, 160));
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.stop?.();
}
for (const e of errors) console.log('  ✗', e);
console.log(errors.length ? `r10 shots: ${errors.length} problem(s)` : 'r10 shots: clean');
process.exit(errors.length || bad ? 1 : 0);
