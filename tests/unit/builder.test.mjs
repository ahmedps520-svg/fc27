import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../../js/builder.js';

test('a design round-trips through a share code, and the code carries no text', () => {
  const d = B.defaultDesign(['#c81e3c', '#1a1c22']);
  Object.assign(d, { capacity: 87000, tiers: 3, landscape: 'coast', facadeStyle: 'glass', suffix: 4, roof: 'dome', pylons: 'rim', pattern: 'rings', bowl: 'open', lettering: false });
  const code = B.encode(d);
  assert.match(code, /^SB1(-[A-Z2-9]{4}){6}$/);
  assert.deepEqual(B.decode(code), B.normalise(d));
  assert.deepEqual(B.decode(code.toLowerCase().replace(/-/g, ' ')), B.normalise(d), 'spacing and case do not matter');
  // every field at both ends of its range
  for (const cap of [B.CAP_MIN, B.CAP_MAX]) for (const tiers of B.TIERS) {
    const e = { ...d, capacity: cap, tiers };
    assert.deepEqual(B.decode(B.encode(e)), B.normalise(e));
  }
  assert.equal(B.decode('nonsense'), null);
  assert.equal(B.decode(''), null);
  const tampered = code.slice(0, -1) + (code.endsWith('A') ? 'B' : 'A');
  assert.equal(B.decode(tampered), null, 'a flipped symbol fails the checksum');
});

test('normalise forces every field into range', () => {
  const d = B.normalise({ capacity: 999999, tiers: 9, roof: 'thatch', seats: ['red', '#ABCDEF'], landscape: 'moon', suffix: 99, lettering: 'yes' });
  assert.equal(d.capacity, B.CAP_MAX);
  assert.equal(d.tiers, 2);
  assert.equal(d.roof, 'cantilever');
  assert.equal(d.seats[1], '#abcdef');
  assert.equal(d.landscape, 'city');
  assert.equal(d.suffix, B.SUFFIXES.length - 1);
  assert.equal(d.lettering, true);
  assert.equal(B.normalise({ capacity: 12 }).capacity, B.CAP_MIN);
  assert.equal(B.normalise({ capacity: 30499 }).capacity, 30000);
});

test('toDef is a stadium the renderer understands, named for the club', () => {
  const d = B.defaultDesign();
  const def = B.toDef(d, { clubName: 'Night Owls', short: 'NIG' });
  assert.equal(def.name, 'Night Owls Stadium');
  assert.equal(def.lettering, 'NIGHT OWLS');
  assert.equal(def.capacity, 30000);
  assert.ok(def.size > 0.3 && def.size < 0.4);
  assert.equal(def.bowl, true);
  assert.equal(def.custom, true);
  const capped = B.toDef(d, { clubName: 'X', capacity: 15000, fill: 0.74 });
  assert.equal(capped.capacity, 15000);
  assert.equal(capped.fill, 0.74);
  assert.equal(B.toDef({ ...d, lettering: false }).lettering, '');
  assert.equal(B.sizeFor(B.CAP_MAX), 1);
});

test('career expansions: the board pays on target, the club pays otherwise, one a season', () => {
  const car = { season: 1, coins: 50_000_000, board: { finish: 6, patience: 0.8 } };
  assert.equal(B.groundCapacity(car), 15000);
  assert.equal(B.gateIncome(car), Math.round(15000 * 0.74 * B.TICKET));
  // below target: the club pays
  let o = B.expansionOffer(car, 9);
  assert.equal(o.boardPays, false); assert.equal(o.clubCanPay, true);
  let r = B.expand(car, 9);
  assert.equal(r.ok, true); assert.equal(r.boardPaid, false);
  assert.equal(car.coins, 50_000_000 - 12_000_000);
  assert.equal(B.groundCapacity(car), 22000);
  // the same season: no
  r = B.expand(car, 1);
  assert.equal(r.ok, false);
  // next season, on target: the board pays
  car.season = 2;
  o = B.expansionOffer(car, 3);
  assert.equal(o.boardPays, true);
  r = B.expand(car, 3);
  assert.equal(r.ok, true); assert.equal(r.boardPaid, true);
  assert.equal(car.coins, 38_000_000, 'the board paid, not the club');
  assert.equal(B.groundCapacity(car), 30000);
  // too poor and off target
  car.season = 3; car.coins = 1000;
  r = B.expand(car, 10);
  assert.equal(r.ok, false);
  // the gate grows with the ground
  const before = car.coins;
  const gate = B.bankGate(car);
  assert.equal(gate, Math.round(30000 * 0.80 * B.TICKET));
  assert.equal(car.coins, before + gate);
  assert.equal(car.ground.income, gate);
  // the top of the ladder
  car.ground.level = B.GROUND_LEVELS.length - 1;
  assert.equal(B.expansionOffer(car, 1).done, true);
  assert.equal(B.groundCapacity(car), 100000);
});
