/**
 * R13 (v83) visual pass: the broadcast. With reduced motion off (the smoke
 * suite runs with it on, which skips the show), phone landscape and portrait:
 *
 *   - the pre-match show stage by stage: flyover, both team sheets, the
 *     pundit, the walk-out, the handshakes, the toss — then kick-off
 *   - in the match: subtitles, the momentum bar, a name strap, a card, a stat
 *     pop-up, the review panel, the stoppage board and the 45+N clock
 *   - half time with both heat maps drawn
 *   - full time: the player of the match, every tab, the result card
 *   - the menu under each seasonal theme with the music player, and the
 *     Broadcast section of Settings
 *
 * Fails on a page error, a page wider than the screen, or a missing piece.
 *   node tests/visual/r13-shots.mjs      → tests/tmp/r13/*.png
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { mkdirSync } from 'node:fs';

const OUT = 'tests/tmp/r13';
mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];
const server = await startServer();
const browser = await chromium.launch({ args: ARGS });
const errors = [];
const nav = (page, route, params) => page.evaluate(async ([r, p]) => (await import('/js/app.js')).navigate(r, p), [route, params]);
try {
  const notes = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
  for (const [tag, vp] of [['land', { width: 844, height: 390 }], ['port', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) errors.push(`${tag} console: ${m.text()}`); });
    await page.addInitScript(({ notes }) => {
      if (!localStorage.getItem('apexxi.save.v1')) localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notes }, settings: { quality: 'low', reduceMotion: false, tutorialDone: true, commVoice: false } }));
    }, { notes });
    const shot = async (name) => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) errors.push(`${tag}/${name}: page is ${over}px wider than the viewport`);
      await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, timeout: 60000 });
    };
    try {
      await page.goto(`${server.url}/`);
      await page.waitForSelector('#startBtn', { timeout: 20000 });
      await page.click('#startBtn');
      page.setDefaultTimeout(15000);

      // ---- the menu under each theme, and the music player
      for (const th of ['nationalDay', 'ramadan', 'winter']) {
        await page.evaluate(async (th) => { const st = await import('/js/state.js'); st.update((s) => { s.settings.menuTheme = th; }); (await import('/js/app.js')).navigate('menu'); }, th);
        await page.waitForSelector(`.menu-screen.theme-${th} .season-deco`);
        await page.waitForTimeout(300);
        await shot(`menu-${th}`);
      }
      const before = await page.textContent('#mpName');
      await page.click('#mpNext');
      const after = await page.textContent('#mpName');
      if (before === after) errors.push(`${tag}: the music player did not skip`);
      await page.click('#mpMute');
      if (!/🔇/.test(await page.textContent('#mpMute'))) errors.push(`${tag}: mute did not show`);
      await page.click('#mpMute');
      await nav(page, 'settings');
      await page.waitForSelector('#broadcastSet');
      await page.$eval('#broadcastSet', (el) => el.scrollIntoView());
      await page.waitForTimeout(250);
      await shot('settings-broadcast');

      if (tag === 'port') { await ctx.close(); continue; }

      // ---- the pre-match show
      await nav(page, 'play', { mode: 'single', homeId: 'c1', awayId: 'c2', duration: 120, final: true });
      await page.waitForFunction(() => window.__apexPregame && window.__apexPregame.stage(), null, { timeout: 150000 });
      const seen = new Set();
      for (let i = 0; i < 400 && seen.size < 7; i++) {
        const st = await page.evaluate(() => window.__apexPregame?.stage() || null);
        if (!st) break;
        if (!seen.has(st)) { seen.add(st); await page.waitForTimeout(700); await shot(`pre-${st}`); }
        await page.waitForTimeout(150);
      }
      for (const st of ['flyover', 'sheet0', 'sheet1', 'pundit', 'walkout', 'handshake', 'coin']) if (!seen.has(st)) errors.push(`pre-match: never saw ${st}`);
      await page.waitForFunction(() => !window.__apexPregame?.stage() && window.__apexMatch.t > 1, null, { timeout: 60000 });

      // ---- in the match
      await page.waitForFunction(() => window.__apexBC?.desk.log().length > 0, null, { timeout: 30000 }).catch(() => errors.push('no commentary line in the first seconds'));
      const g = () => page.evaluate(() => Object.keys(window.__apexBC.gfx.counts()));
      await page.evaluate(() => {
        const bc = window.__apexBC; const m = window.__apexMatch;
        const p = m.teams[0].players[9];
        bc.gfx.card('yellow', p.ref.name, m.teams[0]);
        bc.gfx.review('offside', { margin: 0.18, verdict: 'Offside — the flag stands', dir: 1 });
        bc.gfx.strap(p, m.teams[0], '1 goal · 2 shots');
      });
      await page.waitForTimeout(700);
      await shot('match-graphics');
      if (!(await page.$('#bcMom:not([hidden])'))) errors.push('no momentum bar');
      if (!(await page.$('#bcSubtitle'))) errors.push('no subtitle element');
      // to the board: 43 minutes into the half
      await page.evaluate(() => { const m = window.__apexMatch; m.t = m.duration / 2 * 0.97; });
      await page.waitForFunction(() => window.__apexBC.added()[1] > 0, null, { timeout: 30000 });
      await page.waitForTimeout(500);
      await shot('stoppage');
      await page.waitForFunction(() => /45\+\d'/.test(document.getElementById('gmClock').textContent), null, { timeout: 60000 }).catch(() => errors.push('the clock never showed 45+'));
      // half time: heat maps
      await page.waitForSelector('.pause.is-half', { timeout: 90000 });
      await page.waitForTimeout(500);
      const heat = await page.evaluate(() => [...document.querySelectorAll('canvas[data-heat]')].map((c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 120) lit++; return lit; }));
      if (heat.length !== 2 || heat.some((n) => n < 50)) errors.push(`half-time heat maps not drawn: ${heat}`);
      await shot('halftime');
      const kinds = await g();
      for (const k of ['card', 'review', 'strap', 'stoppage']) if (!kinds.includes(k)) errors.push(`graphics: no ${k}`);
      // second half to full time
      await page.evaluate(async () => { const b = [...document.querySelectorAll('[data-nav]')].find((x) => /Second Half/.test(x.textContent)); b?.click(); });
      await page.waitForFunction(() => window.__apexMatch.half === 2 && window.__apexMatch.phase === 'play', null, { timeout: 60000 });
      await page.evaluate(() => { const m = window.__apexMatch; m.teams[0].score += 2; m.teams[0].scorers.push({ id: m.teams[0].players[9].ref.id, name: m.teams[0].players[9].ref.name, minute: 50 }, { id: m.teams[0].players[9].ref.id, name: m.teams[0].players[9].ref.name, minute: 70 }); m.t = m.duration - 0.8; });
      await page.waitForSelector('.gm-panel .pm-potm', { timeout: 120000 });
      // the final was won: the trophy lift comes over the full-time card
      await page.waitForSelector('.cer-trophy', { timeout: 8000 }).catch(() => errors.push('final won but no trophy scene'));
      await page.waitForTimeout(1200);
      await shot('trophy');
      await page.click('.cer-trophy [data-ok]').catch(() => {});
      await page.waitForSelector('.cer-trophy', { state: 'detached', timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(900);
      await shot('ft-potm');
      for (const tab of ['ratings', 'stats', 'momentum', 'room']) {
        await page.click(`[data-pm="${tab}"]`);
        await page.waitForTimeout(250);
        if (await page.$(`[data-pane="${tab}"][hidden]`)) errors.push(`full time: ${tab} did not open`);
        await shot(`ft-${tab}`);
      }
      await page.click('[data-o="share"]');
      await page.waitForFunction(() => !!window.__apexShareCard, null, { timeout: 10000 });
      const card = await page.evaluate(() => window.__apexShareCard.toDataURL('image/png').length);
      if (card < 20000) errors.push(`result card looks empty (${card} bytes)`);
      await page.evaluate(() => { const a = document.createElement('img'); a.src = window.__apexShareCard.toDataURL(); a.id = 'rcImg'; a.style.cssText = 'position:fixed;inset:0;margin:auto;width:360px;z-index:99999'; document.body.appendChild(a); });
      await page.waitForTimeout(300);
      await shot('result-card');
      await page.evaluate(() => document.getElementById('rcImg')?.remove());
      const said = await page.evaluate(() => window.__apexBC?.desk.log().length || 0);
      console.log(`  commentary lines said: ${said}; graphics: ${[...new Set(kinds)].join(', ')}`);
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
console.log(errors.length ? `r13 shots: ${errors.length} problem(s)` : 'r13 shots: clean');
process.exit(errors.length ? 1 : 0);
