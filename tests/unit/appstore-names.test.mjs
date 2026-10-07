/**
 * v184 — the App Store build carries no real person, club or league
 * (platform.js), and still works: every Career squad finds its cards, every
 * challenge finds its legend, and nobody shares a name. Run in child processes,
 * because the build flag is read once, as the modules load.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const run = (...args) => JSON.parse(execFileSync(process.execPath, [new URL('../appstore/names-check.mjs', import.meta.url).pathname, ...args], { encoding: 'utf8', maxBuffer: 64e6 }));
const web = run();
const app = run('--app');

test('the web build is untouched: real names, real leagues', () => {
  assert.ok(web.leagues.includes('Premier League'));
  assert.ok(web.people.includes('Lionel Messi'));
});

test('no real person, club or league in the App Store build', () => {
  const real = new Set([...web.people, ...web.clubs, ...web.leagues]);
  const leaks = [...app.people, ...app.clubs, ...app.leagues].filter((n) => real.has(n));
  assert.deepEqual(leaks.slice(0, 10), []);
});

test('the App Store build still holds together', () => {
  assert.ok(app.unique, 'every card has its own name');
  assert.deepEqual(app.careerMissing.slice(0, 5), [], 'every Career squad member resolves to a card');
  assert.deepEqual(app.rewardsMissing, [], 'every challenge legend resolves');
  assert.equal(new Set(app.clubs).size, app.clubs.length, 'every club has its own name');
});
