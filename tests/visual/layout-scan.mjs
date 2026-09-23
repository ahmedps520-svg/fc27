/**
 * Small-phone and right-to-left layout scan.
 *
 * Opens every screen on the narrowest phones still in use, in English and in
 * Arabic (right to left), and flags what a player would see as broken:
 *
 *  - the page scrolls sideways;
 *  - a visible element hangs off either edge of the screen (inside a
 *    container that scrolls or clips sideways is fine — that is a rail);
 *  - two buttons overlap each other.
 *
 * Screenshots of every screen go to tests/tmp/layout/.
 *
 *   node tests/visual/layout-scan.mjs [--screens menu,squad] [--langs en,ar]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SCREENS = arg('--screens', 'menu,today,squad,career,pro,quick,online,street,skills,weekend,trophies,world,stadiums,builder,settings').split(',');
const LANGS = arg('--langs', 'en,ar').split(',');
const PHONES = [
  { name: 'se1', width: 320, height: 568 },
  { name: 'se2', width: 375, height: 667 },
  { name: 'p14', width: 390, height: 844 },
];
const OUT = arg('--out', 'tests/tmp/layout');
mkdirSync(OUT, { recursive: true });

const server = await startServer();
const browser = await chromium.launch();
const problems = [];

for (const lang of LANGS) {
  for (const ph of PHONES) {
    const ctx = await browser.newContext({ viewport: { width: ph.width, height: ph.height }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problems.push(`${lang}/${ph.name}: page error ${e.message}`));
    await page.addInitScript((l) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
      meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' },
      settings: { lang: l, reduceMotion: true, tutorialDone: true, quality: 'low' },
    })), lang);
    await page.goto(`${server.url}/`);
    await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
    for (const screen of SCREENS) {
      await page.evaluate(async (s) => { const app = await import('/js/app.js'); app.navigate(s); }, screen);
      await page.waitForTimeout(900);
      const found = await page.evaluate(() => {
        const W = innerWidth; const out = [];
        const docW = document.documentElement.scrollWidth;
        if (docW > W + 1) out.push(`page scrolls sideways (${docW}px wide)`);
        const clipsX = (el) => {
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) {
              const r = a.getBoundingClientRect();
              if (r.left >= -1 && r.right <= W + 1) return true;
            }
          }
          return false;
        };
        const visible = (el) => {
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 2 && r.height > 2 && !el.closest('[hidden]');
        };
        const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
        const all = [...document.querySelectorAll('#screen *, header *, .topbar *')];
        let off = 0;
        for (const el of all) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          if ((r.right > W + 2 || r.left < -2) && !clipsX(el)) {
            // report only the outermost offender
            const parentOff = el.parentElement && (() => { const pr = el.parentElement.getBoundingClientRect(); return pr.right > W + 2 || pr.left < -2; })();
            if (!parentOff && off++ < 4) out.push(`${desc(el)} runs off the ${r.right > W + 2 ? 'right' : 'left'} edge (${Math.round(r.left)}…${Math.round(r.right)} of ${W})`);
          }
        }
        const btns = [...document.querySelectorAll('#screen button, #screen [role=button], #screen a, header button')].filter(visible);
        let ov = 0;
        for (let i = 0; i < btns.length; i++) {
          for (let j = i + 1; j < btns.length; j++) {
            const a = btns[i]; const b = btns[j];
            if (a.contains(b) || b.contains(a)) continue;
            if (clipsX(a) || clipsX(b)) continue;
            const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
            const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
            const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
            if (ix > 4 && iy > 4) {
              const frac = (ix * iy) / Math.min(ra.width * ra.height, rb.width * rb.height);
              if (frac > 0.25 && ov++ < 4) out.push(`${desc(a)} overlaps ${desc(b)} (${Math.round(frac * 100)}%)`);
            }
          }
        }
        return out;
      });
      writeFileSync(join(OUT, `${lang}-${ph.name}-${screen}.png`), await page.screenshot({ type: 'png' }));
      for (const f of found) problems.push(`${lang}/${ph.name}/${screen}: ${f}`);
    }
    await ctx.close();
  }
}
await browser.close(); server.stop();
if (problems.length) { console.log(`layout: ${problems.length} problems`); for (const p of problems) console.log('  ✗', p); process.exit(1); }
console.log(`layout: ok (${SCREENS.length} screens × ${PHONES.length} phones × ${LANGS.length} languages)`);
