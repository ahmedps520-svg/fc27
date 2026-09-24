/**
 * v96: the landing page links only to files that exist, loads nothing from
 * another site, and every picture has alt text.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const html = readFileSync(new URL('landing.html', root), 'utf8');

test('every local file the landing page uses exists', () => {
  const refs = [...html.matchAll(/(?:src|srcset|href)="([^"#]+)"/g)].map((m) => m[1].split(' ')[0]).filter((u) => !/^https?:|^mailto:/.test(u));
  assert.ok(refs.length > 8);
  for (const r of refs) assert.ok(existsSync(new URL(r.replace(/^\.\//, ''), root)), `${r} is missing`);
});

test('nothing is loaded from another site', () => {
  assert.doesNotMatch(html, /(?:src|srcset|href)="https?:/);
  assert.doesNotMatch(html, /url\(\s*['"]?https?:/);
});

test('every image has alt text (empty only for decoration)', () => {
  for (const m of html.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt="/, m[0]);
  const shots = [...html.matchAll(/<img\b[^>]*assets\/store[^>]*>/g)];
  assert.ok(shots.length >= 4);
  for (const m of shots) assert.match(m[0], /\balt="[^"]{10,}"/, 'a screenshot says what it shows');
});
