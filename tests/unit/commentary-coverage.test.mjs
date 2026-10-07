/**
 * v177 — every line the match can call for is in every voice.
 *
 * v175 added kinds of save to the written feed that the recorded pack and the
 * Arabic desk had no lines for, and the voice went quiet on saves until v176.
 * This reads the keys play.js asks for (its CUE_KEY map and its own comment()
 * calls) and checks each one against the written feed, the Arabic desk and the
 * recorded pack — directly or through the director's BASE_KEY fallback — and
 * that every pack line has its clip on disk.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import './_dom.mjs';

const root = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const { COMMENTARY } = await import('../../js/data/commentary.js');
const { AR } = await import('../../js/data/commentaryVoices.js');
const { PACK_US, packClips } = await import('../../js/data/voicePackUS.js');

const play = read('js/screens/play.js');
const keys = new Set([...play.match(/const CUE_KEY = \{([\s\S]*?)\};/)[1].matchAll(/:\s*'(\w+)'/g)].map((m) => m[1]));
for (const m of play.matchAll(/comment\('(\w+)'/g)) keys.add(m[1]);
for (const m of play.matchAll(/(?:catch|over|round): '(\w+)'/g)) keys.add(m[1]);
const base = Object.fromEntries([...read('js/broadcast/director.js').match(/BASE_KEY = \{([^}]*)\}/)[1].matchAll(/(\w+): '(\w+)'/g)].map((m) => [m[1], m[2]]));
const has = (bank, k) => !!(bank?.[k]?.length || bank?.[base[k]]?.length);

test('play.js asks for a known set of lines', () => {
  assert.ok(keys.size >= 40, `${keys.size} keys`);
  for (const k of ['save', 'saveCatch', 'tipOver', 'tipRound', 'goal', 'keeperThrow']) assert.ok(keys.has(k), k);
});

test('the written feed has lines for every one', () => {
  for (const k of keys) assert.ok(COMMENTARY[k]?.length, `feed: ${k}`);
});

test('the Arabic desk can say every one', () => {
  for (const k of keys) assert.ok(has(AR.pbp, k), `Arabic: ${k}`);
});

test('the recorded pack can say every one, and every clip it names exists', () => {
  for (const k of keys) assert.ok(has(PACK_US.pbp, k), `pack: ${k}`);
  for (const { file } of packClips(PACK_US)) assert.ok(existsSync(new URL(`assets/voice/${PACK_US.id || 'us'}/${file}`, root)), `clip ${file}`);
});
