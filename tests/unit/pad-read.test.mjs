/**
 * v123 — one controller reader for the menus and the match (js/game/padRead.js).
 * A real pad is often not in slot 0 and often not in the standard layout; the
 * simulated pad the other tests use always was both.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activePad, normPad, readPad, resetPadRead } from '../../js/game/padRead.js';

const B = (n, on = []) => Array.from({ length: n }, (_, i) => ({ pressed: on.includes(i), value: on.includes(i) ? 1 : 0 }));
const pad = (index, { mapping = 'standard', buttons = 17, on = [], axes = [0, 0, 0, 0], id = 'Pad' } = {}) =>
  ({ index, id, connected: true, mapping, buttons: B(buttons, on), axes: [...axes], timestamp: 0 });

test('a standard pad is read exactly as it is', () => {
  const p = pad(0, { on: [0] });
  assert.equal(normPad(p), p);
  assert.equal(normPad(null), null);
});

test('the pad in use wins over whatever sits in slot 0', () => {
  resetPadRead();
  const phantom = pad(0, { id: 'Steam Virtual Gamepad' });
  const real = pad(1, { id: 'Xbox Wireless Controller' });
  assert.equal(activePad([phantom, real]).index, 0, 'before any press: the first standard pad');
  real.buttons = B(17, [0]);
  assert.equal(activePad([phantom, real]).index, 1, 'pressing A on the real pad makes it the one');
  real.buttons = B(17);
  assert.equal(activePad([phantom, real]).index, 1, 'and it stays the one after the press');
  // a headset that reports two "buttons" is never a pad
  resetPadRead();
  const headset = { index: 0, id: 'Headset', connected: true, mapping: '', buttons: B(2), axes: [] };
  assert.equal(activePad([headset, pad(2)]).index, 2);
  assert.equal(activePad([headset]), null);
});

test('a stick resting off-centre does not steal the pad on first sight', () => {
  resetPadRead();
  const drifty = pad(0, { axes: [0.9, 0, 0, 0] });
  const used = pad(1);
  activePad([drifty, used]);
  used.buttons = B(17, [12]);
  assert.equal(activePad([drifty, used]).index, 1);
});

test('an XInput pad read raw (Firefox, Linux): D-pad on axes 6/7, Start on 7, right stick on 3/4', () => {
  const raw = pad(0, { mapping: '', buttons: 11, on: [7], axes: [0, 0, -1, 0.4, -0.8, -1, 0, 1], id: '045e-028e-Microsoft X-Box 360 pad' });
  const n = normPad(raw);
  assert.equal(n.mapping, 'standard');
  assert.ok(n.buttons[13].pressed, 'D-pad down from axis 7');
  assert.ok(!n.buttons[12].pressed && !n.buttons[14].pressed && !n.buttons[15].pressed);
  assert.ok(n.buttons[9].pressed, 'Start (raw 7) is standard 9');
  assert.ok(!n.buttons[7].pressed, 'raw Start is not read as R2');
  assert.deepEqual(n.axes, [0, 0, 0.4, -0.8], 'right stick from axes 3 and 4');
  const left = normPad(pad(0, { mapping: '', buttons: 11, axes: [0, 0, -1, 0, 0, 1, -1, 0] }));
  assert.ok(left.buttons[14].pressed, 'D-pad left from axis 6');
  assert.ok(left.buttons[7].pressed, 'R2 pulled (raw axis 5) is standard 7');
});

test('a hat-switch D-pad: centred reads nothing, each direction reads its button', () => {
  const at = (v) => normPad(pad(0, { mapping: '', buttons: 14, axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, v] }));
  const dirs = (n) => [12, 13, 14, 15].filter((i) => n.buttons[i].pressed);
  assert.deepEqual(dirs(at(1.2857)), [], 'centred');
  assert.deepEqual(dirs(at(-1)), [12], 'up');
  assert.deepEqual(dirs(at(-0.4286)), [15], 'right');
  assert.deepEqual(dirs(at(0.1429)), [13], 'down');
  assert.deepEqual(dirs(at(0.7143)), [14], 'left');
  assert.deepEqual(dirs(at(-0.7143)).sort(), [12, 15], 'up-right is both');
});

test('a PlayStation pad read raw: ✕ is still the confirm button', () => {
  const ds4 = pad(0, { mapping: '', buttons: 14, on: [1], axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857], id: '054c-09cc-Wireless Controller' });
  const n = normPad(ds4);
  assert.ok(n.buttons[0].pressed, '✕ (raw 1) is standard 0');
  assert.ok(!n.buttons[2].pressed);
  const circle = normPad({ ...ds4, buttons: B(14, [2]) });
  assert.ok(circle.buttons[1].pressed, '○ (raw 2) is standard 1 — back');
});

test('readPad is the two together', () => {
  resetPadRead();
  const raw = pad(3, { mapping: '', buttons: 11, axes: [0, 0, -1, 0, 0, -1, 1, 0] });
  const n = readPad([raw]);
  assert.equal(n.index, 3);
  assert.ok(n.buttons[15].pressed, 'D-pad right');
});
