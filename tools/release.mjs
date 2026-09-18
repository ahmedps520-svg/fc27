/**
 * One command to cut a release.
 *
 *   node tools/release.mjs            # bump to the next version and check everything
 *   node tools/release.mjs v70        # bump to a named version
 *   node tools/release.mjs --check    # no changes: verify the tree is release-consistent (CI)
 *
 * What "release-consistent" means, and what this refuses to ship without:
 *   - APP_VERSION (js/app.js) and CACHE (sw.js) name the same version
 *   - js/data/patchNotes.js has an entry for that version at the top
 *   - the service worker's precache list names every file the app is made of
 *   - the watch bundle is rebuilt from the current sources
 *   - the unit tests and the balance sweep pass
 *
 * It does not commit or push: the diff it leaves is the release, reviewed like
 * any other. HANDOFF.md still gets its section by hand — that is the one
 * thing here a script cannot write.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
const wr = (f, s) => writeFileSync(path.join(ROOT, f), s);
const check = process.argv.includes('--check');
const named = process.argv.slice(2).find((a) => /^v\d+$/.test(a));
const problems = [];

const appSrc = rd('js/app.js');
const swSrc = rd('sw.js');
const current = appSrc.match(/export const APP_VERSION = '(v\d+)'/)?.[1];
const swVersion = swSrc.match(/const CACHE = 'apexxi-(v\d+)'/)?.[1];
if (!current || !swVersion) { console.error('could not read APP_VERSION / CACHE'); process.exit(2); }

let target = current;
if (!check) {
  target = named || `v${Number(current.slice(1)) + 1}`;
  if (target !== current) {
    wr('js/app.js', appSrc.replace(`APP_VERSION = '${current}'`, `APP_VERSION = '${target}'`));
    wr('sw.js', swSrc.replace(`CACHE = 'apexxi-${swVersion}'`, `CACHE = 'apexxi-${target}'`));
    console.log(`version ${current} -> ${target}`);
  }
}
if (rd('sw.js').match(/const CACHE = 'apexxi-(v\d+)'/)?.[1] !== target) problems.push(`sw.js CACHE is not ${target}`);

/* ---- patch notes: the top entry must be this version ---- */
const notes = rd('js/data/patchNotes.js');
const top = notes.match(/export const RELEASES = \[\s*\{\s*version: '(v\d+)'/)?.[1];
if (top !== target) problems.push(`js/data/patchNotes.js: top entry is ${top}, expected ${target} — write the release notes first`);

/* ---- precache list: every app file the worker should know about ---- */
const listed = new Set([...rd('sw.js').matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]));
const walk = (dir, out = []) => {
  for (const e of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
};
const SKIP = [/^js\/package\.json$/, /^js\/vendor\/three\.LICENSE/, /^js\/vendor\/jsm\/(?!postprocessing|shaders|loaders\/GLTFLoader|utils\/SkeletonUtils)/, /\.md$/, /^js\/watch\/(?!bundle\.js)/];
const wanted = [...walk('js'), ...walk('styles')].filter((f) => !SKIP.some((r) => r.test(f)));
for (const f of wanted) if (!listed.has(f)) problems.push(`sw.js: precache list is missing ./${f}`);
for (const f of listed) {
  if (f.endsWith('/')) continue;
  try { statSync(path.join(ROOT, f)); } catch { problems.push(`sw.js: precache lists ./${f}, which does not exist`); }
}

/* ---- watch bundle ---- */
const before = rd('js/watch/bundle.js');
const built = spawnSync(process.execPath, ['tools/build-watch.mjs'], { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
if (built.status !== 0) problems.push(`watch bundle failed to build:\n${built.stderr}`);
else if (check && rd('js/watch/bundle.js') !== before) { wr('js/watch/bundle.js', before); problems.push('js/watch/bundle.js is stale — run npm run build:watch'); }

/* ---- tests ---- */
const run = (label, args) => {
  console.log(`\n▶ ${label}`);
  const r = spawnSync('npm', args, { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) problems.push(`${label} failed`);
};
if (!process.argv.includes('--no-tests')) {
  run('unit tests', ['run', 'test:unit']);
  run('balance sweep', ['run', 'test:sweep']);
}

if (problems.length) {
  console.error(`\n✘ not releasable as ${target}:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`\n✔ ${target} is release-consistent${check ? '' : ' — now add the HANDOFF.md section, commit, and merge to main'}`);
