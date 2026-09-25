/**
 * v105 (backlog #20): the arc touch pad. At every landscape screen from a
 * first-gen SE to a tablet, the buttons are at least 48 px, never touch
 * (10 px between round buttons at the least), stay on the screen, and sit
 * within ~45 mm of the resting right thumb (a CSS px is ~0.17 mm on a phone).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arcLayout } from '../../js/components/touchLayout.js';

for (const [W, H] of [[568, 320], [667, 375], [844, 390], [932, 430], [1180, 820]]) {
  test(`${W}×${H}: big enough, apart, on screen, in reach`, () => {
    const L = arcLayout(W, H);
    const c = Object.fromEntries(Object.entries(L).map(([k, p]) => [k, { x: W - p.right - p.size / 2, y: H - p.bottom - p.size / 2, r: p.size / 2 }]));
    const rest = c.sprint;
    for (const [k, p] of Object.entries(c)) {
      assert.ok(p.r * 2 >= 48, `${k} is ${p.r * 2} px`);
      assert.ok(p.x - p.r >= 0 && p.y - p.r >= 0 && p.x + p.r <= W && p.y + p.r <= H, `${k} is on the screen`);
      if (H < 500) assert.ok(Math.hypot(p.x - rest.x, p.y - rest.y) * 0.17 <= 45, `${k} is within reach`);
      for (const [j, q] of Object.entries(c)) if (j < k) assert.ok(Math.hypot(p.x - q.x, p.y - q.y) - p.r - q.r >= 9.5, `${k} and ${j} keep a gap`);
    }
    assert.ok(W - Math.min(...Object.values(c).map((p) => p.x - p.r)) < W * 0.62, 'the pad leaves the left of the screen to the stick');
  });
}

/* v106: the player's own layout (the editor). The plain arc is untouched by
   an empty one; whatever is asked for, the buttons stay on screen, right of
   the stick's half, under the HUD row and apart; and a layout read back from
   where the buttons are puts them there again. */
import { fitLayout, offsetsFrom, isCustom } from '../../js/components/touchLayout.js';
const SLOTS = ['sprint', 'pass', 'through', 'shoot', 'cross', 'lob', 'skill'];
const circles = (L, W, H) => Object.entries(L).map(([k, p]) => ({ k, x: W - p.right - p.size / 2, y: H - p.bottom - p.size / 2, r: p.size / 2 }));

test('an empty or default layout is the plain arc', () => {
  assert.equal(isCustom(null), false);
  assert.equal(isCustom({ scale: 1, offsets: { pass: { dx: 0, dy: 0 } } }), false);
  assert.equal(isCustom({ scale: 1.1 }), true);
  assert.deepEqual(arcLayout(844, 390, { user: { scale: 1, offsets: {} } }), arcLayout(844, 390));
});

for (const [W, H] of [[568, 320], [844, 390], [1180, 820]]) {
  for (const scale of [0.8, 1.3]) {
    for (const [name, off] of [['all on one spot', () => ({ dx: -2, dy: -1 })], ['all flung off screen', () => ({ dx: -30, dy: -30 })], ['scattered', (i) => ({ dx: Math.sin(i * 2.3) * 3, dy: Math.cos(i * 1.7) * 3 })]]) {
      test(`${W}×${H} at ${scale * 100}%, ${name}: on screen, clear of the stick and the HUD, apart`, () => {
        const offsets = Object.fromEntries(SLOTS.map((k, i) => [k, off(i)]));
        const c = circles(arcLayout(W, H, { user: { scale, offsets } }), W, H);
        for (const p of c) {
          assert.ok(p.r * 2 >= 48, `${p.k} ${p.r * 2}px`);
          assert.ok(p.x - p.r >= W * 0.46 - 0.5 && p.x + p.r <= W + 0.5, `${p.k} x`);
          assert.ok(p.y - p.r >= 55.5 && p.y + p.r <= H + 0.5, `${p.k} y`);
        }
        for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) {
          assert.ok(Math.hypot(c[i].x - c[j].x, c[i].y - c[j].y) - c[i].r - c[j].r >= 9, `${c[i].k} and ${c[j].k} keep a gap`);
        }
      });
    }
  }
}

test('offsets read back from the screen put the buttons where they were', () => {
  const user = { scale: 1.15, offsets: { shoot: { dx: -0.8, dy: 0.3 }, lob: { dx: 1.2, dy: -0.4 } } };
  const L = arcLayout(844, 390, { user });
  const again = arcLayout(844, 390, { user: { scale: 1.15, offsets: offsetsFrom(L, 844, 390, 1.15) } });
  for (const k of SLOTS) { assert.ok(Math.abs(again[k].right - L[k].right) <= 1 && Math.abs(again[k].bottom - L[k].bottom) <= 1, k); }
});

test('the dragged button holds its place; the others make way', () => {
  const L = arcLayout(844, 390);
  const moved = { ...L, through: { ...L.through, right: L.pass.right, bottom: L.pass.bottom } };
  const out = fitLayout(moved, 844, 390, { pin: 'through' });
  assert.deepEqual([out.through.right, out.through.bottom], [L.pass.right, L.pass.bottom]);
  assert.notDeepEqual([out.pass.right, out.pass.bottom], [L.pass.right, L.pass.bottom]);
});
