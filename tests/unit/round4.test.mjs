import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLD } from '../../js/data/generator.js';
import { LEAGUES } from '../../js/data/pools.js';
import { STADIUMS, stadiumFor, atmosphereFor, hashStr } from '../../js/data/stadiums.js';
import { roundRobin, roundsOf, divisionTable, composition, worldState, liveDivisionOf, result, ROUNDS, clubWorldCup, worldTournament, worldTournamentDraw } from '../../js/world.js';
import { resolveQuality, classifyGPU } from '../../js/game/render3d.js';

/* ---- stadiums ---- */
test('every club has its own ground and the definitions are sound', () => {
  assert.ok(STADIUMS.length >= 112);
  assert.equal(new Set(STADIUMS.map((s) => s.id)).size, STADIUMS.length, 'ids unique');
  for (const s of STADIUMS) {
    assert.ok(s.size >= 0 && s.size <= 1, `${s.id} size`);
    assert.ok(['none', 'cantilever', 'ring', 'arch', 'dome'].includes(s.roof), `${s.id} roof`);
    assert.ok(['stripes', 'checks', 'diagonal', 'rings', 'plain'].includes(s.pattern), `${s.id} pattern`);
    assert.ok(['lattice', 'mast', 'rim'].includes(s.pylons), `${s.id} pylons`);
    assert.equal(s.seats.length, 2);
    assert.ok(s.capacity > 4000 && s.fill > 0 && s.fill <= 1);
  }
  const seen = new Set();
  for (const c of WORLD.clubs) {
    const st = stadiumFor(c);
    assert.equal(st.name, c.ground, `${c.name} plays at its own ground`);
    seen.add(st.id);
  }
  assert.equal(seen.size, 100, 'a hundred different grounds for a hundred clubs');
  assert.equal(STADIUMS.filter((s) => s.showpiece).length, 12);
  assert.equal(STADIUMS.filter((s) => s.wonder).length, 8);
});

test('foreign clubs are dealt a ground by hash, in their colours, and finals go to an arena', () => {
  const a = stadiumFor({ id: 'mci', name: 'Manchester City', colors: ['#6cabdd', '#1c2c5b'], level: 0.95 });
  const b = stadiumFor({ id: 'mci', name: 'Manchester City', colors: ['#6cabdd', '#1c2c5b'], level: 0.95 });
  assert.deepEqual(a, b, 'deterministic');
  assert.deepEqual(a.seats, ['#6cabdd', '#1c2c5b']);
  assert.ok(a.size > 0.7, 'a big club gets a big ground');
  const small = stadiumFor({ id: 'x', name: 'Tiny', level: 0.1 });
  assert.ok(small.size < 0.35);
  assert.ok(stadiumFor({ id: 'c1' }, { showpiece: true }).showpiece);
});

test('atmosphere is deterministic, varied, and can be forced', () => {
  const a = atmosphereFor('c1|c2|100');
  assert.deepEqual(a, atmosphereFor('c1|c2|100'));
  const times = new Set(); const weathers = new Set();
  for (let i = 0; i < 200; i++) { const x = atmosphereFor(`seed${i}`); times.add(x.time); weathers.add(x.weather); }
  assert.equal(times.size, 3); assert.equal(weathers.size, 3);
  const f = atmosphereFor('any', { time: 'day', weather: 'rain' });
  assert.equal(f.time, 'day'); assert.equal(f.weather, 'rain'); assert.equal(f.wet, true);
  assert.equal(hashStr('abc'), hashStr('abc'));
});

/* ---- the world season ---- */
test('a division plays a double round robin', () => {
  const ids = WORLD.clubs.slice(0, 10).map((c) => c.id);
  const rr = roundRobin(ids);
  assert.equal(rr.length, 18);
  assert.equal(roundsOf(13), 26); assert.equal(roundsOf(12), 22);
  const odd = roundRobin(['a', 'b', 'c', 'd', 'e']);
  assert.equal(odd.length, 10);
  assert.ok(odd.every((round) => round.length === 2), 'an odd division has one bye a round');
  const meet = new Map();
  for (const round of rr) {
    assert.equal(round.length, 5);
    const inRound = new Set(round.flat());
    assert.equal(inRound.size, 10, 'everyone plays once a round');
    for (const [h, a] of round) meet.set(`${h}>${a}`, (meet.get(`${h}>${a}`) || 0) + 1);
  }
  assert.equal(meet.size, 90, 'each pair meets once at each ground');
  assert.ok([...meet.values()].every((n) => n === 1));
});

test('results are deterministic and favour the better side', () => {
  assert.deepEqual(result(3, 1, 4, 'c1', 'c10'), result(3, 1, 4, 'c1', 'c10'));
  let strong = 0; let weak = 0;
  for (let s = 0; s < 60; s++) { const [h, a] = result(s, 1, 0, 'c1', 'c10'); strong += h; weak += a; }
  assert.ok(strong > weak, `tier one outscores tier ten over sixty games (${strong} v ${weak})`);
});

test('promotion and relegation keep every division at ten clubs', () => {
  for (const season of [0, 1, 5, 20]) {
    const divs = composition(season);
    assert.equal(divs.length, LEAGUES.length);
    assert.deepEqual(divs.map((ids) => ids.length), [12, 12, 12, 12, 13, 13, 13, 13]);
    assert.equal(new Set(divs.flat()).size, 100, 'nobody in two divisions, nobody missing');
  }
  // the two that finished bottom of the top flight in season 0 are in division 2 in season 1
  const table0 = divisionTable(0, 1, composition(0)[0], ROUNDS).map((r) => r.id);
  const down = table0.slice(-2);
  for (const id of down) assert.ok(composition(1)[1].includes(id), `${id} was relegated`);
  const table1 = divisionTable(0, 2, composition(0)[1], ROUNDS).map((r) => r.id);
  for (const id of table1.slice(0, 2)) assert.ok(composition(1)[0].includes(id), `${id} was promoted`);
});

test('the world state reads the calendar', () => {
  const day = 86_400_000;
  const epoch = Date.UTC(2026, 8, 1);
  const s0 = worldState(epoch);
  assert.equal(s0.season, 1); assert.equal(s0.round, 1);
  assert.ok(s0.divisions[0].table.every((r) => r.p === 0));
  const s5 = worldState(epoch + day * 5);
  assert.equal(s5.round, 6);
  assert.ok(s5.divisions[0].table.every((r) => r.p === 5));
  const s24 = worldState(epoch + day * 24);
  assert.ok(s24.divisions[0].resting && !s24.divisions[4].resting, 'a twelve-club division rests while a thirteen-club one plays on');
  const s1 = worldState(epoch + day * ROUNDS);
  assert.equal(s1.season, 2);
  assert.equal(s1.movers.promoted.length, 14);
  assert.equal(s1.movers.relegated.length, 14);
  assert.ok([1, 2, 3, 4].includes(liveDivisionOf('c1', epoch + day * 40)));
});

/* ---- quality tiers ---- */
test('GPU names classify and Auto lands on a sensible tier', () => {
  assert.equal(classifyGPU('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)'), 'strong');
  assert.equal(classifyGPU('Apple M2'), 'strong');
  assert.equal(classifyGPU('Apple A12 GPU'), 'mid');
  assert.equal(classifyGPU('Adreno (TM) 740'), 'strong');
  assert.equal(classifyGPU('Adreno (TM) 650'), 'mid');
  assert.equal(classifyGPU('Adreno (TM) 506'), 'weak');
  assert.equal(classifyGPU('Mali-G78'), 'mid');
  assert.equal(classifyGPU('Mali-G52'), 'weak');
  assert.equal(classifyGPU('Google SwiftShader'), 'weak');
  assert.equal(classifyGPU(''), 'unknown');
  const phone = { touch: true, small: true, cores: 8, memory: 6 };
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'Adreno (TM) 740' }), 'medium');
  assert.equal(resolveQuality('auto', { ...phone, gpu: 'Mali-G52' }), 'low');
  assert.equal(resolveQuality('auto', { ...phone, gpu: '' }), 'low');
  assert.equal(resolveQuality('auto', { touch: false, small: false, cores: 12, memory: 16, gpu: 'NVIDIA GeForce GTX 1660' }), 'high');
  assert.equal(resolveQuality('auto', { touch: false, small: false, cores: 2, memory: 2, gpu: 'Mali-400' }), 'min');
  assert.equal(resolveQuality('ultra', {}), 'ultra');
  assert.equal(resolveQuality('medium', {}), 'medium');
});


test('the club world cup and the world tournament are deterministic and complete', () => {
  const c = clubWorldCup(1);
  assert.equal(c.entrants.length, 8);
  assert.equal(new Set(c.entrants).size, 8);
  assert.ok(c.winner);
  assert.deepEqual(clubWorldCup(1), c);
  const d = worldTournamentDraw(3);
  assert.equal(d.groups.length, 8);
  assert.ok(d.groups.every((g) => g.length === 4));
  assert.equal(new Set(d.groups.flat()).size, 32);
  assert.ok(d.groups.flat().includes('Saudi Arabia'), 'Saudi Arabia is one of the 32');
  const t = worldTournament(3);
  assert.equal(t.knockout.length, 4);
  assert.ok(t.winner);
  assert.deepEqual(worldTournament(3).winner, t.winner);
});
