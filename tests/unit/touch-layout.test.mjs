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
