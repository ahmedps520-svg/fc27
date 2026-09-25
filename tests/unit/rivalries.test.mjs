/**
 * v119 (backlog #16): real rivalries. Every pair names two clubs that exist
 * in the team data, reads the same both ways round, and the broadcast calls
 * the real derby ahead of the generated world's own pairs.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { rivalryOf, RIVAL_PAIRS } = await import('../../js/data/rivalries.js');
const { COUNTRIES } = await import('../../js/data/countries.js');

test('every rival is a real team in the data, and the name reads both ways round', () => {
  const ids = new Set(COUNTRIES.flatMap((c) => c.clubs.map((t) => t.id)));
  for (const [a, b] of RIVAL_PAIRS) {
    assert.ok(ids.has(a) && ids.has(b), `${a} v ${b}`);
    assert.ok(rivalryOf(a, b) && rivalryOf(a, b) === rivalryOf(b, a));
  }
  assert.equal(rivalryOf('kc-england-mci', 'kc-england-mun'), 'the Manchester derby');
  assert.equal(rivalryOf('kc-england-mci', 'kc-england-liv'), null);
  assert.equal(rivalryOf('kc-england-mci', 'kc-england-mci'), null);
  assert.equal(rivalryOf(undefined, 'kc-england-mun'), null);
});

test('a derby is presentation: the sim does not know about it', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../../js/game/sim.js', import.meta.url), 'utf8');
  assert.ok(!/rivalr/i.test(src), 'sim.js never reads a rivalry');
});
