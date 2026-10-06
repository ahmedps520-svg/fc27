/** v149 — every club's end has its own song, made from its name. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { clubSong } = await import('../../js/audio.js');
const { WORLD } = await import('../../js/data/generator.js');

test('a club always sings the same song, ending on its root, in a range a crowd can sing', () => {
  const a = clubSong('Northbridge United'); const b = clubSong('Northbridge United');
  assert.deepEqual(a, b);
  const notes = a.steps.flat().filter((v) => typeof v === 'number');
  assert.ok(notes.length >= 4);
  assert.ok(notes.every((n) => n >= 57 && n <= 76), notes.join(','));
  const last = a.steps[a.steps.length - 1];
  assert.ok(last.length === 1 && typeof last[0] === 'number', 'the line ends on a sung note, not a rest');
  assert.ok(notes.every((n) => n >= last[0]), 'and that note is the root: nothing is sung below it');
});

test('clubs mostly sing different songs', () => {
  const songs = new Set(WORLD.clubs.slice(0, 60).map((c) => JSON.stringify(clubSong(c.name).steps)));
  assert.ok(songs.size >= 57, `${songs.size} different songs for 60 clubs`);
});
