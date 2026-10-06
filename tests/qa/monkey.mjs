/**
 * The monkey (promoted from tests/tmp in v148; nightly in CI): random clicks,
 * selects, sliders and text on every screen, logging any page or console error
 * with the click that caused it. Exits 1 on any problem.
 *
 *   node tests/qa/monkey.mjs [--clicks 40] [--seed 1] [--view desktop|phone] [--screens menu,squad,...]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SEED = Number(arg('--seed', 1)); const CLICKS = Number(arg('--clicks', 40));
const VIEW = arg('--view', 'desktop');
let s = SEED; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(VIEW === 'phone' ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const found = new Map(); let last = '';
const note = (kind, msg) => { const k = `${kind}: ${msg.slice(0, 200)}`; if (!found.has(k)) { found.set(k, last); console.log('  ✗', k, '\n     after', last); } };
page.on('pageerror', (e) => note('pageerror', `${e.message} ${(e.stack || '').split('\n')[1] || ''}`));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|WebSocket/.test(m.text())) note('console', m.text()); });
page.on('dialog', (d) => d.accept().catch(() => {}));
await page.addInitScript(() => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } })));
await page.goto(`${server.url}/`); await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
const screens = arg('--screens', 'menu,squad,career,quick,settings,world,stadiums,builder,pro,street,skills,online,today,trophies,weekend').split(',');
const nav = (n, p = {}) => page.evaluate(async ([n, p]) => { (await import('/js/app.js')).navigate(n, p); }, [n, p]);
for (const sc of screens) {
  last = `navigate(${sc})`;
  try { await nav(sc); } catch (e) { note('nav', `${sc}: ${e.message}`); continue; }
  await page.waitForTimeout(300);
  for (let i = 0; i < CLICKS; i++) { try {
    const cur = await page.evaluate(() => document.getElementById('topTitle')?.textContent || '');
    const inPlay = await page.evaluate(() => !!document.getElementById('gmCanvas'));
    if (inPlay) { await page.waitForTimeout(1500); last = `${sc}: leave match`; await nav('menu').catch(() => {}); await nav(sc).catch(() => {}); await page.waitForTimeout(200); continue; }
    const targets = await page.evaluate(() => {
      const els = [...document.querySelectorAll('button, [role=button], a[href^="#"], [data-go], select, input, [tabindex="0"]')]
        .filter((e) => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return !e.disabled && r.width > 2 && r.height > 2 && st.visibility !== 'hidden' && st.display !== 'none' && e.id !== 'backBtn'; });
      els.forEach((e, i) => e.setAttribute('data-mk', i));
      return els.map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''} "${(e.textContent || e.value || '').trim().slice(0, 24)}"`);
    });
    if (!targets.length) break;
    const k = Math.floor(rnd() * targets.length);
    last = `${sc} (${cur}) click #${i} ${targets[k]}`;
    try {
      const el = page.locator(`[data-mk="${k}"]`).first();
      const tag = await el.evaluate((e) => `${e.tagName}:${e.type || ''}`);
      if (tag.startsWith('SELECT')) await el.selectOption({ index: 0 }).catch(() => {});
      else if (tag === 'INPUT:range') await el.fill(String(Math.round(rnd() * 100))).catch(() => {});
      else if (tag.startsWith('INPUT:text') || tag.startsWith('INPUT:search') || tag.startsWith('INPUT:')) { if (/checkbox|radio/.test(tag)) await el.click({ timeout: 1500 }); else await el.fill(['', 'a', 'Zz 9', '<b>x</b>', '99999999'][Math.floor(rnd() * 5)]).catch(() => {}); }
      else await el.click({ timeout: 1500, noWaitAfter: true });
    } catch { /* covered or detached: fine */ }
    await page.waitForTimeout(120);
    if (rnd() < 0.08) { last = `${sc}: Escape`; await page.keyboard.press('Escape'); }
  } catch (e) { if (/context was destroyed|navigation/i.test(e.message)) { await page.waitForLoadState().catch(() => {}); await page.waitForTimeout(1500); if (!(await page.$('[data-go="squad"]'))) { await page.click('#startBtn', { timeout: 20000 }).catch(() => {}); } } else throw e; } }
  console.log(`  · ${sc}`);
}
await browser.close(); server.stop();
console.log(found.size ? `monkey: ${found.size} problem(s)` : 'monkey: clean');
process.exit(found.size ? 1 : 0);
