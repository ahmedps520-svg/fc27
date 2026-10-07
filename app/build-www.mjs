/**
 * v184: the App Store build's web files.
 *
 * Copies the game into app/www and puts one line in front of every page's
 * scripts: `APEX_APP_STORE = true`, which the game reads at load time to swap
 * every real person, club and league for an original one (js/platform.js),
 * hide the paid store items, skip the service worker and talk to the server
 * at APEX_SERVER rather than the page's own origin. The web build is untouched.
 *
 *   node build-www.mjs                        # server: https://fc27.onrender.com
 *   APEX_SERVER=https://example.com node build-www.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'www');
const SERVER = (process.env.APEX_SERVER || 'https://fc27.onrender.com').replace(/\/$/, '');

const PAGES = ['index.html', 'notes.html', 'privacy.html'];
const FILES = ['manifest.webmanifest', 'events.json', 'LICENSE'];
const DIRS = ['js', 'styles', 'assets', 'icons'];
// what the app never needs: email artwork for the store's receipts, notes for people
const SKIP = (rel) => rel.startsWith('assets/email') || /(^|\/)README[^/]*\.md$/.test(rel) || rel.endsWith('.DS_Store');

if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(SERVER)) throw new Error(`APEX_SERVER must be an https origin, got ${SERVER}`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyDir(rel) {
  for (const ent of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    const r = `${rel}/${ent.name}`;
    if (SKIP(r)) continue;
    if (ent.isDirectory()) copyDir(r);
    else { fs.mkdirSync(path.join(OUT, rel), { recursive: true }); fs.copyFileSync(path.join(ROOT, r), path.join(OUT, r)); }
  }
}
for (const d of DIRS) copyDir(d);
for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));

const FLAG = `<script>window.APEX_APP_STORE = true; window.APEX_SERVER = ${JSON.stringify(SERVER)};</script>`;
for (const page of PAGES) {
  let html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  // before the first script (the import map in index.html), so it is set before any module loads
  const at = html.search(/<script\b/i);
  html = at < 0 ? html.replace('</head>', `  ${FLAG}\n</head>`) : `${html.slice(0, at)}${FLAG}\n  ${html.slice(at)}`;
  fs.writeFileSync(path.join(OUT, page), html);
}

let bytes = 0; let n = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { bytes += fs.statSync(p).size; n++; } } })(OUT);
console.log(`www: ${n} files, ${(bytes / 1048576).toFixed(1)} MB, server ${SERVER}`);
