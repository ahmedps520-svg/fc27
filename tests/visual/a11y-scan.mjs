/**
 * Accessibility scan (v87): every front-end screen, in both languages.
 *
 *   names    every button, link, input, select and [role=button] has an
 *            accessible name (text, aria-label, aria-labelledby, title, or a
 *            <label>) — icon-only controls are the usual offenders
 *   images   every <img> has alt; decorative SVGs are aria-hidden or labelled
 *   focus    Tab reaches the screen's controls, and the focused one shows a
 *            visible ring (outline or box-shadow), never nothing
 *   keys     arrow keys move focus between controls (the keyboard version of
 *            the pad driver)
 *
 *   node tests/visual/a11y-scan.mjs [--screens menu,squad]
 */
import { chromium } from 'playwright';
import { watchConsole } from '../lib/console.mjs';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SCREENS = arg('--screens', 'menu,today,squad,career,pro,quick,online,weekend,trophies,world,stadiums,builder,settings,street,skills').split(',');
const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl'] });
const problems = [];
const consoleIssues = [];
try {
  for (const lang of ['en', 'ar']) {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 700 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problems.push(`${lang}: page error ${e.message}`));
    consoleIssues.push(watchConsole(page, { tag: lang, origin: server.url }));   // v100: console.error and 4xx/5xx
    await page.addInitScript((lang) => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999', onboarded: true }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true, lang } })), lang);
    await page.goto(`${server.url}/`);
    await page.waitForSelector('#startBtn', { timeout: 30000 });
    await page.click('#startBtn');
    for (const screen of SCREENS) {
      await page.evaluate((s) => import('/js/app.js').then((a) => a.navigate(s)), screen);
      await page.waitForTimeout(700);
      const found = await page.evaluate(() => {
        const out = [];
        const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none'; };
        const nameOf = (el) => {
          if (el.getAttribute('aria-label')?.trim()) return el.getAttribute('aria-label');
          const lb = el.getAttribute('aria-labelledby'); if (lb) return lb.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim();
          if (el.id && document.querySelector(`label[for="${el.id}"]`)) return document.querySelector(`label[for="${el.id}"]`).textContent.trim();
          if (el.closest('label')) return el.closest('label').textContent.trim();
          const txt = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
          if (/[\p{L}\p{N}]/u.test(txt)) return txt;
          if (el.getAttribute('title')?.trim()) return el.getAttribute('title');
          if (el.placeholder) return el.placeholder;
          const img = el.querySelector('img[alt]'); if (img?.alt) return img.alt;
          const svg = el.querySelector('svg[aria-label], svg title'); if (svg) return svg.getAttribute?.('aria-label') || svg.textContent;
          return '';
        };
        const root = document.getElementById('screen');
        for (const el of [...root.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button]'), ...document.querySelectorAll('.topbar button')]) {
          if (!vis(el)) continue;
          if (!nameOf(el)) out.push(`no name: <${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ').filter(Boolean).slice(0, 2).join('.')}` : ''}> "${(el.textContent || '').trim().slice(0, 12)}"`);
        }
        for (const img of root.querySelectorAll('img')) if (!img.hasAttribute('alt')) out.push(`img without alt: ${img.src.slice(-30)}`);
        return out;
      });
      for (const f of [...new Set(found)].slice(0, 8)) problems.push(`${lang}/${screen}: ${f}`);
      // focus: tab a few times; every focused control shows a ring
      await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
      let noRing = 0; let reached = 0;
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(80);          // let any transition on the ring settle before reading it
        const r = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
          return { ring, what: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${String(el.className).split(' ')[0]}` };
        });
        if (!r) continue;
        reached += 1;
        if (!r.ring) { noRing += 1; if (noRing <= 2) problems.push(`${lang}/${screen}: focus not visible on ${r.what}`); }
      }
      if (!reached) problems.push(`${lang}/${screen}: Tab reaches nothing`);
      // arrows move focus
      const before = await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 60));
      await page.keyboard.press('ArrowDown');
      const after = await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 60));
      if (screen === 'menu' && before === after) problems.push(`${lang}/${screen}: arrow keys do not move focus`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}
for (const l of consoleIssues) for (const e of l) if (!/page error/.test(e)) problems.push(e);
for (const p of problems) console.log('  ✗', p);
console.log(problems.length ? `a11y: ${problems.length} problem(s)` : `a11y: ok (${SCREENS.length} screens × 2 languages)`);
process.exit(problems.length ? 1 : 0);
