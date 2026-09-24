/**
 * Visual consistency audit (R15, v101): the same component should look the
 * same on every screen. For each kind — primary and ghost buttons, small
 * buttons, screen titles, panel headings, panels, inputs, tabs, chips — every
 * visible instance on every screen is measured (font size, weight, family,
 * corner radius, height, padding, colours), and each variant is listed with
 * the screens it appears on. A variant used on only one or two screens is
 * usually a one-off that drifted; the report marks them.
 *
 *   node tools/ui-audit.mjs [--width 1280] [--screens menu,squad,…]
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { startServer } from '../tests/smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SCREENS = arg('--screens', 'menu,today,squad,career,pro,quick,online,street,skills,weekend,trophies,world,stadiums,builder,settings').split(',');
const W = Number(arg('--width', 1280));
const KINDS = {
  'button.primary': '#screen .btn.primary:not(.sm):not(.big)',
  'button.ghost': '#screen .btn.ghost:not(.sm):not(.big)',
  'button.sm': '#screen .btn.sm',
  'button.big': '#screen .btn.big',
  'title (screen head)': '#screen .sh-title, #screen .screen-head h1, #screen h1',
  'panel heading': '#screen .panel-head h2',
  panel: '#screen .panel',
  'text input': '#screen input[type=text], #screen input:not([type]), #screen input[type=number], #screen input[type=search]',
  select: '#screen select',
  tab: '#screen .tabs .tab, #screen .cnav-b, #screen .subtab',
  'tag/chip': '#screen .tag',
};
const PROPS = {
  'button.primary': ['fontSize', 'fontWeight', 'borderRadius', 'height', 'paddingLeft', 'backgroundImage|backgroundColor', 'color'],
  'button.ghost': ['fontSize', 'fontWeight', 'borderRadius', 'height', 'paddingLeft', 'borderColor', 'color'],
  'button.sm': ['fontSize', 'fontWeight', 'borderRadius', 'height', 'paddingLeft'],
  'button.big': ['fontSize', 'fontWeight', 'borderRadius', 'height'],
  'title (screen head)': ['fontSize', 'fontWeight', 'fontStyle', 'fontFamily', 'letterSpacing'],
  'panel heading': ['fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform', 'color'],
  panel: ['borderRadius', 'paddingTop', 'paddingLeft', 'borderTopWidth'],
  'text input': ['fontSize', 'borderRadius', 'height', 'paddingLeft', 'backgroundColor'],
  select: ['fontSize', 'borderRadius', 'height', 'paddingLeft'],
  tab: ['fontSize', 'fontWeight', 'letterSpacing', 'textTransform'],
  'tag/chip': ['fontSize', 'fontWeight', 'borderRadius', 'paddingLeft'],
};

const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl'] });
const page = await (await browser.newContext({ viewport: { width: W, height: 900 } })).newPage();
const version = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => (t.match(/APP_VERSION = '(v\d+)'/) || [])[1]);
await page.addInitScript((v) => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v, onboarded: true }, settings: { reduceMotion: true, tutorialDone: true, quality: 'low' } })), version);
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');

const seen = {};           // kind → variantKey → { screens: Set, sample, count }
for (const screen of SCREENS) {
  await page.evaluate(async (s) => (await import('/js/app.js')).navigate(s), screen);
  await page.waitForTimeout(900);
  const got = await page.evaluate(([kinds, props]) => {
    const out = {};
    const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 2 && r.height > 2 && !el.closest('[hidden]'); };
    const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 3).join('.')} “${(el.textContent || '').trim().slice(0, 24)}”`;
    for (const [kind, sel] of Object.entries(kinds)) {
      for (const el of document.querySelectorAll(sel)) {
        if (!vis(el)) continue;
        const cs = getComputedStyle(el);
        const v = props[kind].map((p) => {
          if (p === 'height') return `h ${Math.round(el.getBoundingClientRect().height)}`;
          if (p.includes('|')) { const [a, b] = p.split('|'); return cs[a] !== 'none' ? 'gradient' : cs[b]; }
          if (p === 'fontFamily') return cs.fontFamily.split(',')[0].replace(/"/g, '');
          return `${p.replace(/([A-Z])/g, '-$1').toLowerCase()} ${cs[p]}`;
        }).join(' · ');
        (out[kind] ||= []).push({ v, d: desc(el) });
      }
    }
    return out;
  }, [KINDS, PROPS]);
  for (const [kind, list] of Object.entries(got)) {
    for (const { v, d } of list) {
      const k = (seen[kind] ||= {}); const e = (k[v] ||= { screens: new Set(), sample: d, count: 0 });
      e.screens.add(screen); e.count += 1;
    }
  }
}
await browser.close(); server.stop();

let report = `# UI consistency audit (${W}px wide, ${SCREENS.length} screens)\n`;
let oneOffs = 0;
for (const kind of Object.keys(KINDS)) {
  const variants = Object.entries(seen[kind] || {}).sort((a, b) => b[1].count - a[1].count);
  if (!variants.length) continue;
  report += `\n## ${kind} — ${variants.length} variant${variants.length > 1 ? 's' : ''}\n`;
  for (const [i, [v, e]] of variants.entries()) {
    const odd = i > 0 && e.screens.size <= 2;
    if (odd) oneOffs += 1;
    report += `${odd ? '◀ ' : '  '}${String(e.count).padStart(3)}× on ${e.screens.size} screen${e.screens.size > 1 ? 's' : ''} (${[...e.screens].join(', ')})\n      ${v}\n      e.g. ${e.sample}\n`;
  }
}
report += `\n${oneOffs} variant(s) used on only one or two screens (◀)\n`;
writeFileSync('tests/tmp/ui-audit.md', report);
console.log(report);
