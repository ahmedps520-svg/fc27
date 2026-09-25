/**
 * v115 (backlog #16): the kit designer. An undesigned club looks exactly as
 * it did (badge colour, shorts ×0.6, socks ×0.8, plain); a saved kit is
 * cleaned before it reaches a shader; each pattern marks a sensible share of
 * the shirt; and the club's match squad carries the kit into the sim.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { kitOf, isDefaultKit, patternMask, shade, KIT_PATTERNS, KIT_SWATCHES, kitSVG } = await import('../../js/data/kitDesign.js');

test('an undesigned club runs out as it always did', () => {
  const k = kitOf(null, ['#41d3ff', '#0b1020']);
  assert.deepEqual(k.home, { shirt: '#41d3ff', trim: '#0b1020', shorts: shade('#41d3ff', 0.6), socks: shade('#41d3ff', 0.8), pattern: 'plain' });
  assert.equal(k.away.shirt, '#0b1020');
  assert.ok(isDefaultKit(null, ['#41d3ff', '#0b1020']));
  assert.ok(!isDefaultKit({ home: { pattern: 'hoops' } }, ['#41d3ff', '#0b1020']));
});

test('a saved kit is cleaned: bad colours and unknown patterns fall back', () => {
  const k = kitOf({ home: { shirt: 'red; }', trim: '#FFFFFF', pattern: 'tartan' }, away: { socks: '#00ff00' } }, ['#112233', '#445566']);
  assert.equal(k.home.shirt, '#112233');
  assert.equal(k.home.trim, '#ffffff');
  assert.equal(k.home.pattern, 'plain');
  assert.equal(k.away.socks, '#00ff00');
});

test('every pattern marks a sensible share of the shirt; plain marks none', () => {
  for (const [pid] of KIT_PATTERNS) {
    let on = 0; const n = 100;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (patternMask(pid, (i + 0.5) / n, (j + 0.5) / n)) on++;
    const share = on / (n * n);
    if (pid === 'plain') assert.equal(share, 0);
    else assert.ok(share > 0.08 && share < 0.6, `${pid}: ${(share * 100).toFixed(0)}%`);
  }
  assert.equal(new Set(KIT_SWATCHES).size, KIT_SWATCHES.length);
  assert.ok(kitSVG(kitOf(null).home).startsWith('<svg'));
});

test('the club’s match squad carries its kit into the match', async () => {
  const { Match, setField } = await import('../../js/game/sim.js');
  const { WORLD } = await import('../../js/data/generator.js');
  setField('full');
  const kit = kitOf({ home: { pattern: 'stripes', trim: '#f4f4f4' } }, ['#d7263d', '#151515']);
  const xi = WORLD.clubs[0].players?.slice?.(0, 11);
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0, homeSquad: { name: 'Mine', short: 'MIN', colors: ['#d7263d', '#151515'], kit, xi: xi?.length === 11 ? xi : undefined } });
  assert.equal(m.teams[0].kit.home.pattern, 'stripes');
  assert.equal(m.teams[1].kit, null);
});
