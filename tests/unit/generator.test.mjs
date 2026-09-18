import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { WORLD, getPlayer, getClub, rosterOf, clubRating } from '../../js/data/generator.js';
import { REAL_PLAYERS, REAL_PLAYERS_EXTRA } from '../../js/data/realPlayers.js';

/* The world is content, and content that people own. These pin the shape of
 * it, and the first one pins the *identity* of every card that existed before
 * the second wave — change that hash and somebody's saved Vinicius is a Rodri. */
const ORIGINAL_CARDS = 731;
const ORIGINAL_HASH = 'sha256:7df7feb2';   // first 8 hex of the digest; recorded at v66

test('the original 731 cards are byte-stable', () => {
  const rows = WORLD.players.slice(0, ORIGINAL_CARDS)
    .map((p) => [p.id, p.name, p.nation, p.overall, p.position, p.clubId, p.rarity, p.value].join('|'));
  const digest = createHash('sha256').update(rows.join('\n')).digest('hex').slice(0, 8);
  assert.equal(`sha256:${digest}`, ORIGINAL_HASH,
    'the first 731 players changed — ids, names or ratings that people own moved');
});

test('world shape', () => {
  assert.equal(WORLD.clubs.length, 10);
  assert.equal(WORLD.players.length, 1100);
  const ids = new Set(WORLD.players.map((p) => p.id));
  assert.equal(ids.size, WORLD.players.length, 'ids are unique');
  assert.equal(WORLD.icons.length, 15);
  assert.equal(WORLD.stars.length, 20);
});

test('every card is a real person with a flag', () => {
  const real = new Set([...REAL_PLAYERS, ...REAL_PLAYERS_EXTRA].map((r) => r[0]));
  const unnamed = WORLD.players.filter((p) => !real.has(p.name) && p.rarity !== 'icon' && p.rarity !== 'star');
  assert.equal(unnamed.length, 0, `generated names left: ${unnamed.slice(0, 5).map((p) => p.name)}`);
  for (const p of WORLD.players) {
    assert.ok(Array.isArray(p.nationColors) && p.nationColors.length === 2, `${p.name} has flag colours`);
    assert.ok(p.overall >= 40 && p.overall <= 99);
  }
});

test('no real name is on two cards', () => {
  const seen = new Map();
  for (const p of WORLD.players) seen.set(p.name, (seen.get(p.name) || 0) + 1);
  const dupes = [...seen].filter(([, n]) => n > 1);
  assert.deepEqual(dupes, []);
});

test('rosters, lookups and ratings', () => {
  for (const c of WORLD.clubs) {
    const roster = rosterOf(c.id);
    assert.ok(roster.length >= 30, `${c.name} has a squad`);
    assert.ok(roster.every((p) => p && p.clubId === c.id));
    assert.ok(roster.filter((p) => p.position === 'GK').length >= 2);
    const r = clubRating(c.id);
    assert.ok(r >= 60 && r <= 95, `${c.name} rating ${r}`);
  }
  assert.equal(getClub(null), null);
  assert.equal(getPlayer(WORLD.players[0].id), WORLD.players[0]);
  // tier one is the strongest club; the bench of the second wave never enters its XI
  const ratings = WORLD.clubs.map((c) => clubRating(c.id));
  assert.equal(Math.max(...ratings), ratings[0]);
});

test('fixtures are a double round robin', () => {
  const n = WORLD.clubs.length;
  assert.equal(WORLD.fixtures.length, (n - 1) * 2);
  for (const day of WORLD.fixtures) {
    const seen = new Set();
    for (const f of day.matches) { seen.add(f.home); seen.add(f.away); assert.notEqual(f.home, f.away); }
    assert.equal(seen.size, n, 'every club plays every matchday');
  }
});
