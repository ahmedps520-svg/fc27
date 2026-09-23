/**
 * v86 — the match runs in fixed 1/60 s steps. A press must reach the sim once:
 * not lost on a drawn frame with no step (120 Hz), not doubled on a frame with two.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
globalThis.addEventListener ??= () => {};
globalThis.removeEventListener ??= () => {};
globalThis.navigator.getGamepads = () => [];
const { Input, SimLatch } = await import('../../js/game/input.js');

test('a press survives a frame with no step, and fires once across two steps', () => {
  const inp = new Input(); const l = new SimLatch(inp);
  // frame 1 (120 Hz): the key goes down, no step runs
  inp.keys.add('Space'); inp.poll(1 / 120); l.absorb();
  const code = Object.keys(inp.keyMap).find((k) => inp.keyMap[k] === 'shoot' || (Array.isArray(inp.keyMap[k]) && inp.keyMap[k].includes('shoot')));
  inp.keys.clear(); inp.keys.add(code); inp.poll(1 / 120); l.absorb();
  // frame 2: still down, now a step runs — it sees the press
  inp.poll(1 / 120); l.absorb();
  assert.equal(l.pressed('shoot'), true, 'the step sees the press made on a frame without one');
  l.clear();
  assert.equal(l.pressed('shoot'), false, 'and a second step in the same frame does not see it again');
  assert.equal(l.held('shoot'), true);
  // release on a frame with no step: the next step still sees it
  inp.keys.clear(); inp.poll(1 / 120); l.absorb(); inp.poll(1 / 120); l.absorb();
  assert.equal(l.released('shoot'), true);
  l.clear();
  assert.equal(l.released('shoot'), false);
});
