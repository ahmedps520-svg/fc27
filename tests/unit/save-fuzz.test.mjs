/**
 * v87 — save fuzzing. Whatever is in storage, loading must not throw, must
 * leave a save the game can run on, and must never quietly drop progress it
 * could have kept: damaged saves are set aside and the newest backup restored.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import * as storage from '../../js/storage.js';
import { resetAll, getState, loadState, update, replaceSave } from '../../js/state.js';
import * as safety from '../../js/saveSafety.js';
import { WORLD } from '../../js/data/generator.js';

const KEY = 'apexxi.save.v1';
const RESET = 'econ-2curr-1';
beforeEach(() => { resetStorage(); resetAll(); });

const healthy = (s) => {
  assert.ok(s && typeof s === 'object');
  for (const k of ['settings', 'club', 'flags', 'ultimate']) assert.equal(typeof s[k], 'object', k);
  assert.ok(Array.isArray(s.club.collection) && Array.isArray(s.club.lineup) && Array.isArray(s.club.bench) && Array.isArray(s.club.packs));
  assert.ok(Array.isArray(s.ultimate.objectives) && s.ultimate.objectives.every((o) => o.metric));
  assert.equal(typeof s.club.apex, 'number');
};
let seed = 99;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

test('garbage in storage: never throws, always playable', () => {
  for (const raw of ['{', 'null', '[]', '42', '"x"', 'true', '{"club": 5}', '{"club": {"collection": "abc", "lineup": {}, "bench": 3}}',
    '{"settings": null, "flags": [], "ultimate": {"objectives": 7}}', '\u0000\u0001garbage', '{"club":{"apex":"lots"}}', 'x'.repeat(5000)]) {
    storage.setItem(KEY, raw);
    assert.doesNotThrow(() => loadState(), raw.slice(0, 30));
    healthy(getState());
  }
});

test('a damaged save is kept aside and the newest backup comes back', () => {
  update((s) => { s.meta.reset = RESET; s.club.apex = 12345; s.club.collection = WORLD.players.slice(0, 20).map((p) => p.id); });
  loadState();                                 // a clean load takes today's backup
  assert.equal(safety.listBackups().length, 1);
  storage.setItem(KEY, '{"club": {"apex": 1');   // the write that went wrong
  loadState();
  assert.equal(getState().club.apex, 12345, 'the backup is back');
  assert.equal(getState().club.collection.length, 20);
  assert.ok(safety.corruptStashed(), 'the damaged file is kept, not thrown away');
});

test('old shapes survive: missing sections, the old single balance, retired settings', () => {
  const ids = WORLD.players.slice(0, 8).map((p) => p.id);
  storage.setItem(KEY, JSON.stringify({ meta: { reset: RESET }, club: { apex: 900, collection: [...ids, 'no-such-card'], lineup: [ids[0], 'gone', null] }, settings: { models: 'simple' } }));
  loadState();
  const s = getState();
  healthy(s);
  assert.equal(s.club.apex, 900);
  assert.deepEqual(s.club.collection, ids, 'real cards kept, unknown ones dropped');
  assert.equal(s.club.lineup[1], null);
  assert.equal(s.settings.models, 'realistic');
  assert.equal(s.settings.pregame, 'full', 'new settings arrive with their defaults');
});

test('random mutations of a real save never break loading', () => {
  update((s) => { s.meta.reset = RESET; s.club.collection = WORLD.players.slice(0, 30).map((p) => p.id); s.ultimate.played = 12; });
  const base = JSON.parse(JSON.stringify(getState()));
  const paths = [];
  const walk = (o, p) => { if (!o || typeof o !== 'object' || p.length > 3) return; for (const k of Object.keys(o)) { paths.push([...p, k]); walk(o[k], [...p, k]); } };
  walk(base, []);
  const junk = [null, undefined, 0, -1, 1e308, NaN, '', 'x', [], {}, [null], { a: 1 }, true];
  for (let i = 0; i < 400; i++) {
    const s = JSON.parse(JSON.stringify(base));
    for (let j = 0; j < 1 + Math.floor(rnd() * 4); j++) {
      const path = paths[Math.floor(rnd() * paths.length)];
      let o = s; for (const k of path.slice(0, -1)) { o = o?.[k]; if (!o || typeof o !== 'object') break; }
      if (o && typeof o === 'object') { if (rnd() < 0.3) delete o[path.at(-1)]; else o[path.at(-1)] = junk[Math.floor(rnd() * junk.length)]; }
    }
    storage.setItem(KEY, JSON.stringify(s));
    assert.doesNotThrow(() => loadState(), `mutation ${i}`);
    healthy(getState());
  }
});

test('export, import, and an import can be undone from the backups', () => {
  update((s) => { s.meta.reset = RESET; s.club.apex = 777; });
  const file = safety.exportSave(getState(), 'v87');
  assert.equal(safety.parseSaveFile(file).save.club.apex, 777);
  for (const bad of ['', 'nope', '[]', '{"hello":1}', 'x'.repeat(9 * 1024 * 1024)]) assert.ok(safety.parseSaveFile(bad).error, bad.slice(0, 10));
  update((s) => { s.club.apex = 5; });
  assert.ok(replaceSave(safety.parseSaveFile(file).save));
  assert.equal(getState().club.apex, 777);
  const undo = safety.listBackups().find((b) => b.manual);
  assert.equal(JSON.parse(undo.data).club.apex, 5, 'what the import replaced is kept');
  const sum = safety.summary(getState());
  assert.match(sum.lines[0], /777/);
});

test('a long career saves and loads back whole', async () => {
  const c = await import('../../js/career.js');
  const v2 = await import('../../js/careerV2.js');
  c.startCareer({ name: 'Fuzz Manager', nation: 'England', age: 44 }, 'mci');
  for (let i = 0; i < 38 * 4; i++) {
    const car = getState().career;
    if (car.review) { update((s) => { s.career.review = null; }); continue; }
    if (car.expiring?.length) { update((s) => c.releaseExpired(s.career)); continue; }
    const fx = c.myFixture(car); c.advanceWeek(fx ? v2.simScoreV2(car, fx.home, fx.away) : null);
  }
  const raw = storage.getItem(KEY);
  assert.ok(raw.length < 2.5 * 1024 * 1024, `${Math.round(raw.length / 1024)} KB`);
  const season = getState().career.season;
  resetAll(); storage.setItem(KEY, raw); loadState();
  assert.equal(getState().career.season, season);
  assert.ok(season >= 3);
});
