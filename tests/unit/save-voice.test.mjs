/**
 * v176 — the kinds of save (v175) are said aloud: the recorded pack and the
 * Arabic desk have lines for a save, and a finer key falls back to it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { AR } = await import('../../js/data/commentaryVoices.js');
const { PACK_US } = await import('../../js/data/voicePackUS.js');
const { packLine, lineFrom } = await import('../../js/broadcast/voice.js');
const src = (await import('node:fs')).readFileSync(new URL('../../js/broadcast/director.js', import.meta.url), 'utf8');

test('the Arabic desk has its own lines for each kind of save', () => {
  for (const k of ['saveCatch', 'tipOver', 'tipRound']) assert.match(lineFrom(AR.pbp, k, { keeper: 'K' }), /K/, k);
});

test('the recorded pack has no lines for the finer kinds, so the director falls back to its save', () => {
  for (const k of ['saveCatch', 'tipOver', 'tipRound']) {
    assert.equal(packLine(PACK_US, 'pbp', k, 'pbp'), null);
    assert.match(src, new RegExp(`${k}: 'save'`), `${k} has a fallback`);
  }
  assert.ok(packLine(PACK_US, 'pbp', 'save', 'pbp'), 'the pack says a save');
});
