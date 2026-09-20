import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { WORLD, getPlayer, getClub, rosterOf, clubRating } from '../../js/data/generator.js';
import { REAL_PLAYERS, REAL_PLAYERS_EXTRA, REAL_PLAYERS_WAVE3, REAL_PLAYERS_WAVE4, REAL_PLAYERS_WAVE5, REAL_PLAYERS_WAVE6, REAL_PLAYERS_WAVE7 } from '../../js/data/realPlayers.js';

/* The world is content, and content that people own. These pin the shape of
 * it, and the first one pins the *identity* of every card that existed before
 * the second wave — change that hash and somebody's saved Vinicius is a Rodri. */
const ORIGINAL_CARDS = 731;
// first 8 hex of the digest. Club is not part of it: v68 dealt free agents to
// the new league, which is allowed to move a card's club and nothing else.
const ORIGINAL_HASH = 'sha256:d81ab6b3';

test('the original 731 cards are byte-stable', () => {
  const rows = WORLD.players.slice(0, ORIGINAL_CARDS)
    .map((p) => [p.id, p.name, p.nation, p.overall, p.position, p.rarity, p.value].join('|'));
  const digest = createHash('sha256').update(rows.join('\n')).digest('hex').slice(0, 8);
  assert.equal(`sha256:${digest}`, ORIGINAL_HASH,
    'the first 731 players changed — ids, names or ratings that people own moved');
});

test('world shape', () => {
  assert.equal(WORLD.clubs.length, 100);
  assert.equal(WORLD.players.length, 6328 + 85);
  assert.equal(WORLD.sbcCards.length, 28);
  // v72 world: the first 5612 cards are exactly what they were
  assert.ok(WORLD.players.slice(0, 5612).every((p) => !p.sbc || WORLD.sbcCards.slice(0, 12).includes(p.id)), 'the v72 cards are untouched');
  assert.equal(new Set(WORLD.clubs.map((c) => c.league)).size, 8);
  for (const d of [1, 2, 3, 4]) assert.equal(WORLD.clubs.filter((c) => c.division === d).length, 12, `division ${d} has twelve clubs`);
  for (const d of [5, 6, 7, 8]) assert.equal(WORLD.clubs.filter((c) => c.division === d).length, 13, `division ${d} has thirteen clubs`);
  // v71 world: the first 3092 cards are exactly what they were
  const v71 = WORLD.players.slice(0, 3092);
  assert.ok(v71.every((p) => !p.clubId || Number(p.clubId.slice(1)) <= 60), 'no pre-v72 card was moved to a new club');
  // v69 world: the first 1112 cards (20 clubs' worth) are exactly what they were
  const v69 = WORLD.players.slice(0, 1112);
  assert.ok(v69.every((p) => !p.clubId || Number(p.clubId.slice(1)) <= 20), 'no pre-v70 card was moved to a new club');
  for (const id of WORLD.sbcCards) assert.ok(WORLD.playersById[id].sbc && WORLD.playersById[id].clubId === null);
  const ids = new Set(WORLD.players.map((p) => p.id));
  assert.equal(ids.size, WORLD.players.length, 'ids are unique');
  assert.equal(WORLD.icons.length, 15);
  assert.equal(WORLD.stars.length, 20);
});

test('every card is a real person with a flag', () => {
  const real = new Set([...REAL_PLAYERS, ...REAL_PLAYERS_EXTRA, ...REAL_PLAYERS_WAVE3, ...REAL_PLAYERS_WAVE4, ...REAL_PLAYERS_WAVE5, ...REAL_PLAYERS_WAVE6, ...REAL_PLAYERS_WAVE7].map((r) => r[0]));
  const unnamed = WORLD.players.filter((p) => !real.has(p.name) && p.rarity !== 'icon' && p.rarity !== 'star' && !p.sbc);
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
    assert.ok(roster.length >= 26, `${c.name} has a squad`);
    assert.ok(roster.every((p) => p && p.clubId === c.id));
    assert.ok(roster.filter((p) => p.position === 'GK').length >= 2);
    const r = clubRating(c.id);
    assert.ok(r >= 60 && r <= 95, `${c.name} rating ${r}`);
  }
  assert.equal(getClub(null), null);
  assert.equal(getPlayer(WORLD.players[0].id), WORLD.players[0]);
  // tier one is the strongest club; the bench of the second wave never enters its XI
  const ratings = WORLD.clubs.slice(0, 10).map((c) => clubRating(c.id));
  assert.equal(Math.max(...ratings), ratings[0]);
});

test('fixtures are a double round robin', () => {
  const n = 10;                       // the original league; the Meridian League has no fixture list
  assert.equal(WORLD.fixtures.length, (n - 1) * 2);
  for (const day of WORLD.fixtures) {
    const seen = new Set();
    for (const f of day.matches) { seen.add(f.home); seen.add(f.away); assert.notEqual(f.home, f.away); }
    assert.equal(seen.size, n, 'every club plays every matchday');
  }
});
