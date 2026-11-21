/**
 * v204 — Season 2: every save starts again once (state.js applySeason), with
 * the club's name, badge and colours, stadium designs, trophy cabinet and
 * settings kept and Style items no longer owned taken off; cloud saves too;
 * the server resets online records once and refuses Season 1 saves from the
 * old iPhone apps. And the App Store app's welcome gift: once, App Store only.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resetStorage } from './_dom.mjs';
import * as storage from '../../js/storage.js';
import { resetAll, getState, loadState, adoptCloudSave, grantAppGift, SEASON, SEASON_PREMIUM, APP_GIFT } from '../../js/state.js';
import { COSMETICS } from '../../js/cosmetics.js';
import { claimPending } from '../../js/progress.js';
import { WORLD } from '../../js/data/generator.js';

const require = createRequire(import.meta.url);
const KEY = 'apexxi.save.v1';
beforeEach(() => { resetStorage(); resetAll(); });

const seasonOne = () => ({
  meta: { reset: 'econ-2curr-1' },
  settings: { commentary: false, celebration: 'whirlwind', lang: 'ar' },
  flags: { notesSeen: 'v203' },
  club: {
    apex: 987654, ultimate: 140, collection: WORLD.players.slice(0, 20).map((p) => p.id), packs: ['prime', 'prime'], packsOpened: 80,
    lineup: WORLD.players.slice(0, 11).map((p) => p.id), cosmetics: { owned: ['kit:fade', 'celeb:whirlwind'] }, draft: { step: 'pick' },
    identity: { name: 'Riyadh Royals', short: 'RRO', crest: { shape: 'shield', pattern: 'solid', device: 'star', colors: ['#123456', '#fedcba'] }, kit: { home: { shirt: '#123456', pattern: 'fade' }, away: { shirt: '#ffffff', pattern: 'hoops' } } },
    stadium: { design: { pattern: 'diamonds', name: 'Home' }, saved: [{ pattern: 'waves' }, { pattern: 'stripes' }] },
    cabinet: [{ kind: 'league', title: 'Premier Division title', key: 's1', at: 1 }],
  },
  ultimate: { played: 55, divIdx: 3 },
  career: { clubId: WORLD.clubs[0].id, season: 4 }, pro: { name: 'x' }, street: { tour: 3 }, skills: { juggle: 99 },
});

test('a Season 1 save starts again once; name, badge, colours, stadiums, cabinet and settings stay', () => {
  storage.setItem(KEY, JSON.stringify(seasonOne()));
  loadState();
  const s = getState();
  assert.equal(SEASON, 2);
  assert.equal(s.meta.season, 2);
  assert.equal(s.club.apex, 5000);
  assert.equal(s.club.ultimate, 0);
  assert.deepEqual(s.club.collection, []);
  assert.deepEqual(s.club.packs, ['gold', 'silver', 'silver', 'bronze'], 'the new-manager start');
  assert.ok(s.club.lineup.every((x) => x === null));
  assert.equal(s.club.cosmetics, undefined, 'Style items are bought again');
  assert.equal(s.club.draft, undefined);
  assert.equal(s.ultimate.played || 0, 0);
  for (const k of ['career', 'pro', 'street', 'skills']) assert.equal(s[k], null, k);
  assert.equal(s.club.identity.name, 'Riyadh Royals');
  assert.deepEqual(s.club.identity.crest.colors, ['#123456', '#fedcba']);
  assert.equal(s.club.identity.kit.home.pattern, 'plain', 'a premium pattern no longer owned comes off');
  assert.equal(s.club.identity.kit.away.pattern, 'hoops', 'a free one stays');
  assert.equal(s.club.stadium.design.name, 'Home');
  assert.equal(s.club.stadium.design.pattern, 'stripes');
  assert.deepEqual(s.club.stadium.saved.map((d) => d.pattern), ['stripes', 'stripes']);
  assert.equal(s.club.cabinet.length, 1, 'Season 1 silverware stays');
  assert.equal(s.settings.commentary, false); assert.equal(s.settings.lang, 'ar');
  assert.equal(s.settings.celebration, undefined);
  assert.equal(s.flags.season2, true); assert.equal(s.flags.notesSeen, 'v203');
  // written straight away, and never again
  assert.equal(JSON.parse(storage.getItem(KEY)).meta.season, 2);
  const saved = JSON.parse(storage.getItem(KEY));
  saved.club.apex = 7777; storage.setItem(KEY, JSON.stringify(saved));
  loadState();
  assert.equal(getState().club.apex, 7777, 'a Season 2 save is not wiped again');
});

test('a new player starts in Season 2 with nothing to explain; a Season 1 cloud save is wiped as it is adopted', () => {
  loadState();
  assert.equal(getState().meta.season, 2);
  assert.ok(!getState().flags.season2);
  adoptCloudSave(seasonOne());
  const s = getState();
  assert.equal(s.club.apex, 5000); assert.deepEqual(s.club.collection, []); assert.equal(s.meta.season, 2); assert.equal(s.flags.season2, true);
  adoptCloudSave({ ...seasonOne(), meta: { reset: 'econ-2curr-1', season: 2 } });
  assert.equal(getState().club.apex, 987654, 'a Season 2 cloud save is taken as it is');
});

test('the premium lists the wipe uses match the Style shop', () => {
  for (const kind of ['kit', 'celebration', 'pitch']) {
    assert.deepEqual([...SEASON_PREMIUM[kind]].sort(), COSMETICS.filter((c) => c.kind === kind).map((c) => c.value).sort(), kind);
  }
});

test('the App Store welcome gift: once, App Store only, claimed on Today', () => {
  loadState();
  const s = getState();
  assert.equal(grantAppGift(s, false), false, 'the website never gives it');
  assert.equal(s.club.pending?.length || 0, 0);
  assert.equal(grantAppGift(s, true), true);
  assert.equal(grantAppGift(s, true), false, 'once');
  const gift = s.club.pending.find((p) => p.kind === 'gift');
  assert.ok(gift);
  const before = { apex: s.club.apex, ult: s.club.ultimate || 0, packs: s.club.packs.length };
  claimPending(gift.id);
  const after = getState();
  assert.equal(after.club.apex, before.apex + APP_GIFT.apex);
  assert.equal(after.club.ultimate, before.ult + APP_GIFT.ultimate);
  assert.equal(after.club.packs.length, before.packs + 3);
  assert.deepEqual(after.club.packs.slice(-3), ['prime', 'gold', 'gold']);
  assert.deepEqual(APP_GIFT, { apex: 15000, ultimate: 30, packs: ['prime', 'gold', 'gold'] });
});

test('the server: online records start again once; Season 1 saves are refused', () => {
  const store = require('../../server/store.js');
  const guard = require('../../server/guard.js');
  const d = { accounts: { a: { name: 'A', online: { played: 40, wins: 30, draws: 0, losses: 10, goalsFor: 90, goalsAgainst: 20, points: 90, divIdx: 7 }, pens: { w: 3, l: 1 }, weekend: { x: 1 }, skills: { j: 5 }, coop: { p: {} }, ghostRecord: { w: 1, d: 0, l: 0 }, friends: ['B'], guild: 'G' } }, ghosts: { a: { name: 'A' } } };
  assert.equal(store.startSeason(d, 2), true);
  const a = d.accounts.a;
  assert.deepEqual(a.online, { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, divIdx: 0 });
  for (const k of ['pens', 'weekend', 'skills', 'coop', 'ghostRecord']) assert.equal(a[k], undefined, k);
  assert.deepEqual(a.friends, ['B']); assert.equal(a.guild, 'G');
  assert.deepEqual(d.ghosts, {});
  a.online.played = 5;
  assert.equal(store.startSeason(d, 2), false, 'once');
  assert.equal(a.online.played, 5);
  const prev = { meta: { season: 2 }, club: { apex: 100 } };
  const old = guard.sanitiseSave({ meta: { reset: 'econ-2curr-1' }, club: { apex: 900000 } }, prev, 0, null);
  assert.equal(old.save, prev); assert.equal(old.refused, 'season');
  assert.equal(guard.sanitiseSave({ meta: { season: 2 }, club: { apex: 200 } }, prev, 0, null).save.club.apex, 200);
});
