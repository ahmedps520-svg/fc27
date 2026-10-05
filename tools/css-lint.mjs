/**
 * Declarations the browser throws away (v141). A CSS declaration the parser
 * cannot read is dropped silently — `font: 700 10px/1 inherit` (inherit is not
 * a family) made the match's name strip and several online and account screen
 * labels render at the wrong size for many versions without a single error.
 * Every declaration in every stylesheet is put to Chromium's own parser with
 * CSS.supports(property, value); one it rejects would be dropped.
 * (A value that uses var() is accepted at parse time whatever it holds, so a
 * bad fallback inside var() can still slip through.)
 *
 *   node tools/css-lint.mjs            (exit 1 if anything would be dropped)
 */
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';

const files = readdirSync('styles').filter((f) => f.endsWith('.css')).map((f) => `styles/${f}`);
const decls = [];
for (const file of files) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const re = /\{([^{}]*)\}/g; let m;
  while ((m = re.exec(css))) {
    const line = css.slice(0, m.index).split('\n').length;
    for (const d of m[1].split(';')) {
      const i = d.indexOf(':'); if (i < 0) continue;
      const prop = d.slice(0, i).trim(); const value = d.slice(i + 1).replace(/!important/i, '').trim();
      // vendor-prefixed properties are there for another engine (iOS Safari): Chromium cannot judge them
      if (!prop || prop.startsWith('--') || prop.startsWith('-') || !/^[a-z-]+$/i.test(prop) || !value) continue;
      decls.push({ file, line, prop, value });
    }
  }
}
const browser = await chromium.launch();
const page = await browser.newPage();
// keyframe selectors (from/to/50%) carry declarations too: they are checked the same way
const bad = await page.evaluate((decls) => decls.filter((d) => !CSS.supports(d.prop, d.value)), decls);
await browser.close();
for (const d of bad) console.log(`${d.file}:${d.line}  ${d.prop}: ${d.value.slice(0, 80)}`);
console.log(bad.length ? `css-lint: ${bad.length} of ${decls.length} declarations would be dropped` : `css-lint: ok (${decls.length} declarations)`);
process.exit(bad.length ? 1 : 0);
