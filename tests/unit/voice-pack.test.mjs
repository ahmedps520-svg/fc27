/**
 * v121 — the recorded commentary pack. Every line the pack can say has its
 * clip on disk, no line tries to say a name it was never given, every key is
 * an event the desk really calls, and the desk shows exactly what it plays.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, readdirSync } from 'node:fs';
import './_dom.mjs';

const { PACK_US, packClips, VOICE_PACKS } = await import('../../js/data/voicePackUS.js');
const { COMMENTARY } = await import('../../js/data/commentary.js');
const { CO, CONTEXT } = await import('../../js/data/commentaryVoices.js');
const { packLine, createDesk } = await import('../../js/broadcast/voice.js');

const DIR = new URL('../../assets/voice/us/', import.meta.url);

test('every clip the pack can play is on disk, and nothing else is', () => {
  const clips = packClips(PACK_US);
  assert.ok(clips.length > 300, `${clips.length} clips`);
  let bytes = 0;
  for (const c of clips) {
    const f = new URL(c.file, DIR);
    assert.ok(existsSync(f), `missing ${c.file} ("${c.text}")`);
    const n = statSync(f).size;
    assert.ok(n > 2000, `${c.file} is ${n} bytes — a silent render?`);
    bytes += n;
  }
  const extra = readdirSync(DIR).filter((f) => !clips.some((c) => c.file === f));
  assert.deepEqual(extra, [], 'clips on disk the pack never plays');
  assert.ok(bytes < 8 * 1024 * 1024, `pack is ${(bytes / 1048576).toFixed(1)} MB`);
});

test('no line asks for a name, and every key is an event the desk calls', () => {
  for (const [bank, real] of [['pbp', COMMENTARY], ['co', CO], ['context', CONTEXT]]) {
    for (const [key, lines] of Object.entries(PACK_US[bank])) {
      assert.ok(key in real, `${bank}.${key} is not a commentary key`);
      assert.ok(lines.length >= 1);
      for (const l of lines) assert.ok(!/[{}]/.test(l), `${bank}.${key}: "${l}" has a placeholder`);
    }
  }
  // the moments that matter most never go unsaid
  for (const k of ['goal', 'save', 'shot', 'kickoff', 'halftime', 'fulltime', 'penaltyAwarded', 'card']) {
    assert.ok(PACK_US.pbp[k]?.length, `pbp.${k} missing`);
  }
  assert.equal(VOICE_PACKS.us, PACK_US);
});

test('packLine picks a real clip and does not repeat itself', () => {
  const files = new Set(packClips(PACK_US).map((c) => c.file));
  let prev = null;
  for (let i = 0; i < 40; i++) {
    const l = packLine(PACK_US, 'pbp', 'goal', 'pbp');
    assert.ok(files.has(l.file), l.file);
    assert.ok(PACK_US.pbp.goal.includes(l.text));
    assert.notEqual(l.file, prev, 'the same goal call twice running');
    prev = l.file;
  }
  assert.ok(files.has(packLine(PACK_US, 'context', 'derby', 'pbp').file), 'context lines exist for the caller');
  assert.ok(files.has(packLine(PACK_US, 'context', 'derby', 'co').file), 'and for the analyst');
  assert.equal(packLine(PACK_US, 'pbp', 'pass', 'pbp'), null, 'a key the pack leaves out is unsaid');
});

test('the desk shows the pack line it plays, under the pack speaker name', async () => {
  const el = document.createElement('div');
  const desk = createDesk({ lang: 'en', voice: true, subtitles: true, el, pack: PACK_US });
  const l = packLine(PACK_US, 'pbp', 'save', 'pbp');
  desk.say('pbp', l.text, 1, l.file);
  assert.deepEqual(desk.log().at(-1), { speaker: 'pbp', text: l.text });
  assert.match(el.innerHTML, new RegExp(PACK_US.speakers.pbp));
  desk.destroy();
});
