import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STADIUMS, stadiumFor, atmosphereFor } from '../../js/data/stadiums.js';
import { groundClass, groundProfile, landscapeFor, GROUND_CLASSES } from '../../js/data/grounds.js';
import { growOnPromotion, groundCapacity } from '../../js/builder.js';

test('every class of ground exists, from community grounds to arenas', () => {
  const seen = new Set(STADIUMS.map((s) => groundClass(s)));
  for (const c of GROUND_CLASSES) assert.ok(seen.has(c.id), `${c.id} grounds exist`);
  const comm = STADIUMS.filter((s) => groundClass(s) === 'community');
  assert.ok(comm.length >= 12, 'a proper set of small grounds');
  assert.ok(comm.every((s) => s.capacity < 7000));
});

test('profiles are deterministic and sane', () => {
  for (const s of STADIUMS) {
    const a = groundProfile(s); const b = groundProfile(s);
    assert.deepEqual(a, b);
    assert.ok(a.opened >= 1880 && a.opened <= 2021, `${s.name} opened ${a.opened}`);
    assert.ok(a.record >= s.capacity * 0.99, 'a record crowd at least fills the ground');
    assert.ok(a.recordYear >= a.opened && a.recordYear <= 2025);
    assert.ok(['box', 'deep', 'stanchion'].includes(a.goalStyle));
    assert.ok(a.grass.length > 0.8 && a.grass.length < 1.8 && a.grass.density > 0.5 && a.grass.density <= 1);
    assert.ok(a.orientation >= 0 && a.orientation < 360);
  }
});

test('the landscape follows the club\'s country, and the builder wins', () => {
  const big = STADIUMS.find((s) => s.capacity > 60000);
  assert.equal(landscapeFor(big, { country: 'Saudi Arabia' }), 'desert');
  assert.equal(landscapeFor(big, { country: 'Switzerland' }), 'mountains');
  assert.equal(landscapeFor(big, { country: 'England' }), 'city');
  const small = STADIUMS.find((s) => s.capacity < 5000);
  assert.equal(landscapeFor(small, { country: 'England' }), 'suburbs');
  assert.equal(landscapeFor({ ...big, landscape: 'coast' }, { country: 'Qatar' }), 'coast');
  // a dealt ground carries who plays there
  const st = stadiumFor({ id: 'kc-x', name: 'Al Test', country: 'Qatar', level: 0.8 });
  assert.equal(st.host.country, 'Qatar');
});

test('winter brings frost and the odd snow match; the desert never does', () => {
  let snow = 0; let frost = 0; let summerCold = 0; let desert = 0;
  for (let i = 0; i < 2000; i++) {
    const w = atmosphereFor(`s${i}`, {}, { month: 0 });
    if (w.weather === 'snow') snow++;
    if (w.frost) frost++;
    const s = atmosphereFor(`s${i}`, {}, { month: 6 });
    if (s.weather === 'snow' || s.frost) summerCold++;
    const d = atmosphereFor(`s${i}`, {}, { month: 0, warm: true });
    if (d.weather === 'snow' || d.frost) desert++;
  }
  assert.ok(snow > 100 && snow < 350, `snow ${snow}/2000`);
  assert.ok(frost > 50, `frost ${frost}/2000`);
  assert.equal(summerCold, 0);
  assert.equal(desert, 0);
  // the old rolls are untouched without a month
  assert.deepEqual(atmosphereFor('x', {}).weather, atmosphereFor('x', {}, {}).weather);
  assert.equal(atmosphereFor('x', { weather: 'snow' }).weather, 'snow');
});

test('promotion grows a career ground', () => {
  const car = { season: 3, ground: { level: 1, income: 0 } };
  const before = groundCapacity(car);
  const to = growOnPromotion(car);
  assert.ok(to > before);
  assert.equal(groundCapacity(car), to);
  assert.deepEqual(car.ground.promoted, { season: 3, from: before, to });
  const top = { season: 1, ground: { level: 7 } };
  assert.equal(growOnPromotion(top), null);
});
