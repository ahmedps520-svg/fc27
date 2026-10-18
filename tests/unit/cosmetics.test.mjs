/**
 * v198 — cosmetics (js/cosmetics.js): Apex only (the ✦ path wired but shut,
 * and never on the App Store build); bought once; nothing that was free gets
 * a lock; Use puts each kind on; the CPU's celebrations are what they were;
 * every new kit pattern draws everywhere and passes the server's kit check;
 * stadium codes carry the new pitch patterns and old codes still load.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import * as cos from '../../js/cosmetics.js';
import { KIT_PATTERNS, kitOf, patternMask } from '../../js/data/kitDesign.js';
import { CELEBRATIONS, pickCelebration, celebPose } from '../../js/game/celebrations.js';
import * as B from '../../js/builder.js';

const require = createRequire(import.meta.url);
const guard = require('../../server/guard.js');
beforeEach(() => { resetStorage(); resetAll(); });

test('paid in Apex only, once; the ✦ path is shut', () => {
  assert.equal(cos.payable('apex'), true);
  assert.equal(cos.payable('ultimate'), false, 'not until ULTIMATE_SALES, and never on the App Store build');
  assert.equal(cos.payable('usd'), false);
  const it = cos.cosmeticById('kit:fade');
  update((s) => { s.club.apex = it.price.apex - 1; s.club.ultimate = 9999; });
  assert.match(cos.buyCosmetic(it.id).error, /need/);
  assert.ok(cos.buyCosmetic(it.id, 'ultimate').error, 'no ✦ sales');
  assert.equal(getState().club.ultimate, 9999);
  update((s) => { s.club.apex = it.price.apex + 10; });
  assert.ok(cos.buyCosmetic(it.id).item);
  assert.equal(getState().club.apex, 10);
  assert.ok(cos.owns(it.id));
  assert.match(cos.buyCosmetic(it.id).error, /Already/);
  assert.ok(cos.buyCosmetic('nope').error);
});

test('only the new things are for sale: nothing that was free gets a lock', () => {
  for (const [pid] of KIT_PATTERNS.slice(0, 6)) assert.equal(cos.locked('kit', pid), false, pid);
  for (const c of CELEBRATIONS.filter((x) => !x.premium)) assert.equal(cos.locked('celebration', c.id), false, c.id);
  for (const p of B.PATTERNS.slice(0, 5)) assert.equal(cos.locked('pitch', p), false, p);
  for (const it of cos.COSMETICS) {
    assert.equal(cos.locked(it.kind, it.value), true, it.id);
    assert.ok(it.price.apex >= 5000 && it.price.apex <= 15000, it.id);
  }
  // every item is a real option of its menu
  for (const it of cos.COSMETICS) {
    if (it.kind === 'kit') assert.ok(KIT_PATTERNS.some(([p]) => p === it.value));
    if (it.kind === 'celebration') assert.ok(CELEBRATIONS.some((c) => c.id === it.value && c.premium));
    if (it.kind === 'pitch') assert.ok(B.PATTERNS.includes(it.value));
  }
});

test('Use puts each kind on', () => {
  update((s) => { s.club.apex = 100000; });
  for (const id of ['kit:chevron', 'celeb:archer', 'pitch:waves']) cos.buyCosmetic(id);
  assert.equal(cos.useCosmetic('kit:quarters'), false, 'not owned');
  cos.useCosmetic('kit:chevron');
  assert.equal(kitOf(getState().club.identity.kit, ['#d7263d', '#151515']).home.pattern, 'chevron');
  cos.useCosmetic('celeb:archer');
  assert.equal(getState().settings.celebration, 'archer');
  cos.useCosmetic('pitch:waves', { defaultDesign: () => B.defaultDesign(['#d7263d', '#151515']) });
  assert.equal(B.normalise(getState().club.stadium.design).pattern, 'waves');
  for (const id of ['kit:chevron', 'celeb:archer', 'pitch:waves']) assert.ok(cos.inUse(id), id);
});

test("the CPU's celebrations are the original sixteen, as before; the new ones only by choice", () => {
  const premium = new Set(CELEBRATIONS.filter((c) => c.premium).map((c) => c.id));
  const old = CELEBRATIONS.filter((c) => !c.premium).map((c) => c.id);
  for (let i = 0; i < 500; i++) {
    const k = pickCelebration(null, `p${i}`, i % 5);
    assert.ok(!premium.has(k), k);
  }
  // the same arithmetic as v110, over the original list
  let h = 2166136261; for (const ch of 'p42') h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  assert.equal(pickCelebration('random', 'p42', 1), old[(h >>> 8) % old.length]);
  assert.equal(pickCelebration('whirlwind', 'p42', 0), 'whirlwind');
  for (const id of premium) {
    const P = celebPose(id, 0.7, false);
    for (const v of [P.lift, P.lean, P.spin, P.armL.raise, P.armR.bend]) assert.ok(Number.isFinite(v), id);
  }
});

test('new kit patterns: a real mask, kept by kitOf, passed by the server; a pattern it does not know is still dropped', () => {
  for (const [pid] of KIT_PATTERNS.slice(6)) {
    let on = 0; for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) on += patternMask(pid, (i + 0.5) / 20, (j + 0.5) / 20) ? 1 : 0;
    assert.ok(on > 20 && on < 380, `${pid}: ${on}/400 cells in the trim`);
    const k = kitOf({ home: { shirt: '#1e5bd8', trim: '#f4f4f4', pattern: pid } });
    assert.equal(k.home.pattern, pid);
    const clean = guard.cleanKit({ home: { ...k.home }, away: { ...k.away } });
    assert.equal(clean?.home.pattern, pid, `server keeps ${pid}`);
  }
  assert.equal(guard.cleanKit({ home: { shirt: '#111111', trim: '#222222', shorts: '#333333', socks: '#444444', pattern: 'tartan' }, away: { shirt: '#111111', trim: '#222222', shorts: '#333333', socks: '#444444', pattern: 'plain' } }), null);
});

test('stadium codes carry the new pitch patterns; a code from before v198 still loads', () => {
  for (const p of ['waves', 'chevron', 'diamonds', 'rings']) {
    const d = { ...B.defaultDesign(['#d7263d', '#151515']), pattern: p };
    assert.equal(B.decode(B.encode(d), ['#d7263d', '#151515']).pattern, p);
  }
  // encoded the way v197 would have: the same bits, pattern index 3 ('rings')
  const old = B.encode({ ...B.defaultDesign(['#d7263d', '#151515']), pattern: 'rings' });
  assert.equal(B.decode(old).pattern, 'rings');
  assert.equal(B.PATTERNS.length, 8, 'three bits: no room for a ninth');
});
