import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const app = readFileSync('js/app.js', 'utf8');
const sw = readFileSync('sw.js', 'utf8');
const notes = readFileSync('js/data/patchNotes.js', 'utf8');
const version = app.match(/APP_VERSION = '(v\d+)'/)[1];

test('the app, the service worker cache and the release notes agree on the version', () => {
  assert.equal(sw.match(/CACHE = 'apexxi-(v\d+)'/)[1], version);
  assert.equal(notes.match(/RELEASES = \[\s*\{\s*version: '(v\d+)'/)[1], version, 'top patch-notes entry');
});

test('every precached file exists and the boot graph is in the list', () => {
  const listed = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]).filter((f) => !f.endsWith('/'));
  for (const f of listed) assert.ok(existsSync(f), `sw.js precaches ./${f} which does not exist`);
  for (const must of ['index.html', 'js/app.js', 'js/state.js', 'js/data/generator.js', 'js/storage.js', 'js/crash.js', 'js/watch/bundle.js', 'watch.html']) {
    assert.ok(listed.includes(must), `sw.js precache is missing ./${must}`);
  }
});

test('the watch bundle is built from the current watch sources', () => {
  const bundle = readFileSync('js/watch/bundle.js', 'utf8');
  for (const marker of ['apexxi.watch.v1', 'apexxi.watch.daily.v1', '__apexWatchBooted', 'w-pens']) {
    assert.ok(bundle.includes(marker), `bundle lacks ${marker} — run npm run build:watch`);
  }
});
