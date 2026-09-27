/**
 * v138: the real clubs wear original colours and badges (js/data/clubLook.js).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { CAREER_CLUBS } = await import('../../js/data/careerDb.js');
const { COUNTRIES } = await import('../../js/data/countries.js');
const { allClubs } = await import('../../js/careerV2.js');
const { clubKey, farFromReal, PALETTE, lookCrest } = await import('../../js/data/clubLook.js');
const { crestSVG, CREST_PARTS } = await import('../../js/components/crest.js');

const every = [...allClubs(), ...COUNTRIES.flatMap((c) => c.clubs)];

test('no real club wears its real colours', () => {
  // a club in both tables is dealt once, against Manager Career's pair, and Kick Off reuses it
  const career = new Set(CAREER_CLUBS.map((c) => clubKey(c.name)));
  for (const c of every.filter((x) => !(x.country && x.id?.startsWith('kc-') && career.has(clubKey(x.name))))) {
    assert.ok(c.realColors, `${c.name} kept what it steers away from`);
    assert.ok(PALETTE.some((p) => p[0] === c.colors[0] && p[1] === c.colors[1]), `${c.name} wears a palette pair`);
    assert.ok(farFromReal(c.colors, c.realColors), `${c.name}: ${c.colors} is too close to ${c.realColors}`);
  }
});

test('a league is not four of the same pair', () => {
  const by = new Map();
  for (const c of CAREER_CLUBS) { const k = `${c.league}|${c.colors}`; by.set(k, (by.get(k) || 0) + 1); }
  for (const [k, n] of by) assert.equal(n, 1, `${k} is dealt ${n} times`);
});

test('the same club looks the same in Manager Career and in Kick Off', () => {
  const career = new Map(CAREER_CLUBS.map((c) => [clubKey(c.name), c]));
  let shared = 0;
  for (const c of COUNTRIES.flatMap((x) => x.clubs)) {
    const k = career.get(clubKey(c.name));
    if (!k) continue;
    shared += 1;
    assert.deepEqual([c.colors, c.shape, c.pattern, c.device], [k.colors, k.shape, k.pattern, k.device], c.name);
  }
  assert.ok(shared >= 20, `${shared} clubs found in both`);
});

test('every look is one the crest generator can draw, at both sizes', () => {
  for (const c of every.slice(0, 60)) {
    const cr = lookCrest(c);
    assert.ok(CREST_PARTS.shape.includes(cr.shape) && CREST_PARTS.pattern.includes(cr.pattern) && CREST_PARTS.device.includes(cr.device), c.name);
    for (const size of [20, 64]) {
      const svg = crestSVG(cr, c.short, size);
      assert.match(svg, /^\s*<svg[\s\S]*<\/svg>\s*$/);
      assert.ok(!svg.includes('undefined'), `${c.name} at ${size}`);
    }
  }
});
