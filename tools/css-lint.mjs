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

/* v162: a var() with no fallback whose custom property is never set — not in
   any stylesheet, not in an inline style or setProperty in the scripts — is
   invalid at computed time, and the declaration falls back to inherit/initial
   as if it were dropped. `--muted` was asked for 27 times and never defined. */
const allCss = files.map((f) => readFileSync(f, 'utf8')).join('\n');
const jsFiles = [];
const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) { if (e.name !== 'vendor') walk(`${d}/${e.name}`); } else if (e.name.endsWith('.js')) jsFiles.push(`${d}/${e.name}`); } };
walk('js');
const js = jsFiles.map((f) => readFileSync(f, 'utf8')).join('\n') + readFileSync('index.html', 'utf8');
const defined = new Set([...`${allCss}\n${js}`.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]).concat([...js.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)].map((m) => m[1])));
const undef = [...new Set([...allCss.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => m[1]))].filter((v) => !defined.has(v));
for (const v of undef) console.log(`never defined, used without a fallback: var(${v})`);

const n = bad.length + undef.length;
console.log(n ? `css-lint: ${bad.length} of ${decls.length} declarations would be dropped, ${undef.length} variable(s) never defined` : `css-lint: ok (${decls.length} declarations)`);
process.exit(n ? 1 : 0);
