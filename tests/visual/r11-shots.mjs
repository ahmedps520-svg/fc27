/**
 * R11 (v81) visual pass: every Manager Career tab (old and new), the Player
 * Career from creation to the hub's tabs and a training drill, the three
 * ceremonies, and a Player Career match with the stick locked to your man —
 * played to full time. Phone, both orientations. Fails on any page error,
 * a page wider than the screen, or anything clipped past a panel's edge.
 *
 *   node tests/visual/r11-shots.mjs      → tests/tmp/r11/*.png
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { mkdirSync } from 'node:fs';

const OUT = 'tests/tmp/r11';
mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];
const server = await startServer();
const browser = await chromium.launch({ args: ARGS });
const errors = [];
try {
  const notes = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
  for (const [tag, vp] of [['port', { width: 390, height: 844 }], ['land', { width: 844, height: 390 }]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
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
      const wide = await page.evaluate(() => [...document.querySelectorAll('.panel *, .chub *, .cfix *, .ceremony *')].filter((el) => el.offsetParent && el.getBoundingClientRect().right > window.innerWidth + 1
        && !el.closest('.cnav, .chips, .ltable, .cer-wall, .cer-wipe, .scout-leagues, .store-row, .rank-strip, .cc-grid')).slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`));
      if (wide.length) errors.push(`${tag}/${name}: past the right edge: ${wide.join(', ')}`);
      await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
    };
    // ---- Manager Career: a season in, every tab
    await page.evaluate(async () => {
      const c = await import('/js/career.js'); const v2 = await import('/js/careerV2.js');
      c.startCareer({ name: 'Test Manager', nation: 'England', age: 44 }, 'mci');
      const st = await import('/js/state.js');
      for (let i = 0; i < 30; i++) {
        const car = st.getState().career;
        if (car.review) { st.update((s) => { s.career.review = null; }); continue; }
        if (car.expiring?.length) { st.update((s) => c.releaseExpired(s.career)); continue; }
        const fx = c.myFixture(car); c.advanceWeek(fx ? v2.simScoreV2(car, fx.home, fx.away) : null);
      }
      (await import('/js/app.js')).navigate('career');
    });
    await page.waitForSelector('#cTabs');
    const tabs = await page.$$eval('#cTabs [data-tab]', (els) => els.map((e) => e.dataset.tab));
    for (const t of tabs) {
      await page.click(`#cTabs [data-tab="${t}"]`);
      if (t === 'dressing') { const b = await page.$('[data-talkto]'); if (b) await b.click(); }
      await check(`mgr-${t}`);
    }
    // the press room scene
    await page.click('#cTabs [data-tab="overview"]');
    await page.evaluate(async () => { const st = await import('/js/state.js'); st.update((s) => { s.career.pressPending = true; }); (await import('/js/app.js')).navigate('career'); });
    const pr = await page.$('#pressRoom');
    if (pr) { await pr.click(); await page.waitForSelector('.cer-press'); await check('scene-press'); await page.click('.cer-press [data-a="0"]'); }
    else errors.push(`${tag}: no press room button`);
    // the trophy and the signing scenes
    await page.evaluate(async () => { const c = await import('/js/components/ceremony.js'); c.trophyScene({ title: 'Premier League champions', club: { name: 'Test', short: 'TST', crest: { shape: 'shield', pattern: 'solid', device: 'star', colors: ['#6cabdd', '#1c2c5b'] } }, sub: 'Season 1' }); });
    await page.waitForSelector('.cer-trophy'); await check('scene-trophy'); await page.click('.cer-trophy [data-ok]'); await page.waitForTimeout(900);
    // ---- the careers switcher and the Player Career
    await page.click('#careerModes'); await check('modes');
    await page.click('#cmPlayer');
    await page.waitForSelector('#proForm');
    await page.fill('#prName', 'Rakan Tester');
    await page.selectOption('#prPos', 'ST');
    await page.click('#proClubs [data-club]');
    await check('pro-create');
    await page.click('#prStart');
    await page.waitForSelector('.cer-sign'); await check('scene-signing'); await page.click('.cer-sign [data-ok]');
    await page.waitForSelector('#proTabs');
    for (let i = 0; i < 6; i++) { await page.click('#proSim'); await page.waitForTimeout(150); }
    for (const t of ['overview', 'training', 'stats', 'agent', 'country', 'world']) { await page.click(`#proTabs [data-tab="${t}"]`); await check(`pro-${t}`); }
    // a drill: three stops
    await page.click('#proTabs [data-tab="training"]');
    for (let i = 0; i < 3; i++) { await page.waitForTimeout(250); const go = await page.$('#drillGo:not([disabled])'); if (go) await go.click(); }
    await page.waitForTimeout(900);
    const drilled = await page.evaluate(async () => { const st = await import('/js/state.js'); const p = st.getState().pro; return p.drillWeek === `${p.world.season}-${p.world.week}`; });
    if (!drilled) errors.push(`${tag}: the drill did not register`);
    if (tag === 'land') {
      // a Player Career match: make sure he starts, lock, play, full time
      await page.evaluate(async () => { const st = await import('/js/state.js'); st.update((s) => { s.pro.trust = 1; const pp = s.pro.world.people[s.pro.name]; for (const k of Object.keys(pp.stats)) pp.stats[k] = 88; pp.base = 88; }); (await import('/js/app.js')).navigate('pro'); });
      await page.click('#proTabs [data-tab="overview"]');
      let ok = await page.$('#proPlay');
      for (let i = 0; i < 8 && !ok; i++) { await page.click('#proSim'); await page.waitForTimeout(200); ok = await page.$('#proPlay'); }
      if (!ok) { errors.push('never selected to start'); }
      else {
        await ok.click();
        await page.waitForFunction(() => window.__apexMatch && window.__apexMatch.t > 2, null, { timeout: 150000 });
        const lock = await page.evaluate(() => { const m = window.__apexMatch; const c = m.controllers[0]; return { locked: !!c.lockId, on: m.teams[c.team].players[c.activeIdx]?.ref.id === c.lockId }; });
        if (!lock.locked || !lock.on) errors.push(`the stick is not locked to the pro: ${JSON.stringify(lock)}`);
        await page.screenshot({ path: `${OUT}/${tag}-pro-match.png` });
        await page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
        await page.waitForSelector('.gm-panel', { timeout: 120000 });
        await page.waitForTimeout(700);
        const ft = await page.evaluate(() => document.querySelector('.gm-panel')?.innerText || '');
        if (!/rating|player of the match/i.test(ft)) errors.push('full time shows no Player Career rating');
        await page.screenshot({ path: `${OUT}/${tag}-pro-ft.png` });
        const apps = await page.evaluate(async () => (await import('/js/state.js')).getState().pro.totals.apps);
        if (!apps) errors.push('the played match did not count');
        console.log('  pro FT:', ft.replace(/\s+/g, ' ').slice(0, 140));
      }
    }
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
console.log(errors.length ? `r11 shots: ${errors.length} problem(s)` : 'r11 shots: clean');
process.exit(errors.length ? 1 : 0);
