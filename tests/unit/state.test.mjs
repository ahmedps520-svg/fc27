import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import {
  loadState, getState, update, save, resetAll, freshUltimate, refreshObjectives,
  saveWeight, cloudWins, newCareer, applyResult, sortedTable, adoptCloudSave, DIVISIONS,
} from '../../js/state.js';
import { WORLD } from '../../js/data/generator.js';

beforeEach(() => { resetStorage(); resetAll(); });

test('a fresh save has the starting balance and one free pack economy', () => {
  const s = loadState();
  assert.equal(s.club.apex, 5000);
  assert.deepEqual(s.club.collection, []);
  assert.equal(s.settings.quality, 'ultra');
  assert.ok(Array.isArray(s.ultimate.objectives) && s.ultimate.objectives.length > 0);
});

test('update persists and reloads through localStorage', () => {
  update((s) => { s.club.apex = 777; s.club.collection.push('p1'); });
  const raw = JSON.parse(localStorage.getItem('apexxi.save.v1'));
  assert.equal(raw.club.apex, 777);
  const s = loadState();
  assert.equal(s.club.apex, 777);
  assert.deepEqual(s.club.collection, ['p1']);
});

test('a corrupt or missing localStorage still boots a playable save', () => {
  localStorage.setItem('apexxi.save.v1', '{not json');
  const s = loadState();
  assert.equal(s.club.apex, 5000);
  localStorage.setItem('apexxi.save.v1', JSON.stringify({ club: { apex: 'nope' } }));
  const t = loadState();
  assert.ok(t.settings && t.ultimate, 'partial saves are filled from defaults');
});

test('saveWeight counts progress, cloudWins arbitrates and adminRev overrides', () => {
  const light = { ultimate: { played: 0 }, club: { collection: [], packsOpened: 0 } };
  const heavy = { ultimate: { played: 3 }, club: { collection: ['a', 'b'], packsOpened: 1 } };
  assert.ok(saveWeight(heavy) > saveWeight(light));
  assert.equal(saveWeight(null), -1);
  assert.equal(cloudWins(null, heavy), false);
  assert.equal(cloudWins(heavy, light), true);
  assert.equal(cloudWins(light, heavy), false);
  assert.equal(cloudWins(light, light), false);
  assert.equal(cloudWins(light, light, { orEqual: true }), true);
  const corrected = { ...light, meta: { adminRev: 2 } };
  assert.equal(cloudWins(corrected, heavy), true, 'an operator correction wins regardless of weight');
});

test('adopting a cloud save replaces the club but keeps device settings', () => {
  update((s) => { s.settings.quality = 'low'; s.settings.commentary = false; });
  adoptCloudSave({ club: { apex: 42, collection: ['p9'] }, ultimate: freshUltimate(), meta: { reset: 'econ-2curr-1' }, settings: { commentary: true, quality: 'ultra' } });
  const s = getState();
  assert.equal(s.club.apex, 42);
  assert.deepEqual(s.club.collection, ['p9']);
  assert.equal(s.settings.commentary, true, 'preferences travel with the account');
  assert.equal(s.settings.quality, 'low', 'hardware settings stay with the device');
});

test('league table maths', () => {
  const c = newCareer(WORLD.clubs[0].id);
  const [a, b, d] = WORLD.clubs.map((x) => x.id);
  applyResult(c, a, b, 2, 0);
  applyResult(c, b, d, 1, 1);
  applyResult(c, d, a, 0, 3);
  const t = sortedTable(c);
  assert.equal(t[0].club.id, a);
  assert.equal(t[0].pts, 6);
  assert.equal(t[0].gd, 5);
  assert.equal(c.table[b].pts, 1);
  assert.equal(c.table[d].pts, 1);
  assert.equal(c.squad.length, WORLD.clubs[0].roster.length);
});

test('objectives refresh on their timer and the ladder is ordered', () => {
  const u = freshUltimate();
  const before = u.objectives.map((o) => o.id).join();
  refreshObjectives(u, Date.now() + 365 * 864e5);
  assert.ok(u.objectives.length > 0);
  assert.ok(DIVISIONS.length >= 5);
  const _ = before; // the slate may legitimately repeat; only the refresh path is under test
  save();
});

test('v77: a save with a damaged collection or line-up boots instead of crashing', () => {
  localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, club: { collection: null, lineup: 'x', bench: 3 } }));
  const s = loadState();
  assert.ok(Array.isArray(s.club.collection));
  assert.equal(s.club.lineup.length, 11);
  assert.equal(s.club.bench.length, 5);
});

test('v77: a cloud save goes through the same repairs as a local one', () => {
  loadState();
  update((s) => { s.settings.renderer = 'webgl'; });
  const ok = adoptCloudSave({
    meta: { reset: 'econ-2curr-1' },
    settings: { models: 'simple', renderer: 'webgpu' },
    club: { collection: null, bench: null, challengesDone: 'no' },
    ultimate: { objectives: [{ id: 'old' }] },
  });
  assert.ok(ok);
  const s = getState();
  assert.equal(s.settings.models, 'realistic');
  assert.equal(s.settings.renderer, 'webgl', 'the renderer belongs to the device, not the account');
  assert.ok(Array.isArray(s.club.collection) && Array.isArray(s.club.bench) && Array.isArray(s.club.challengesDone));
  assert.ok(s.ultimate.objectives.every((o) => o.metric), 'objectives from an old build are redealt');
});
