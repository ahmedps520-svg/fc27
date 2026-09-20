import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, INTERNATIONAL, countryNames, countryByName, clubSquad, clubSheet, matchSquad, internationalTeams, internationalSquad } from '../../js/data/countries.js';
import { REAL_PLAYERS, REAL_PLAYERS_EXTRA, REAL_PLAYERS_WAVE3, REAL_PLAYERS_WAVE4, REAL_PLAYERS_WAVE5, REAL_PLAYERS_WAVE6, REAL_PLAYERS_WAVE7 } from '../../js/data/realPlayers.js';
import { CAREER_SQUADS } from '../../js/data/careerDb.js';

test('fifty-plus countries, Spain first, India last, International after them', () => {
  assert.ok(COUNTRIES.length >= 50, `${COUNTRIES.length} countries`);
  assert.equal(COUNTRIES[0].name, 'Spain');
  assert.equal(COUNTRIES[COUNTRIES.length - 1].name, 'India');
  const names = countryNames();
  assert.equal(names[names.length - 1], INTERNATIONAL);
  assert.equal(new Set(names).size, names.length, 'no country twice');
  for (const c of COUNTRIES) assert.ok(c.clubs.length >= 2, `${c.name} has at least two clubs`);
  const ids = COUNTRIES.flatMap((c) => c.clubs.map((k) => k.id));
  assert.equal(new Set(ids).size, ids.length, 'club ids are unique');
});

test('every club fields eleven real footballers and the ratings run downhill', () => {
  const real = new Set([...REAL_PLAYERS, ...REAL_PLAYERS_EXTRA, ...REAL_PLAYERS_WAVE3, ...REAL_PLAYERS_WAVE4, ...REAL_PLAYERS_WAVE5, ...REAL_PLAYERS_WAVE6, ...REAL_PLAYERS_WAVE7].map((r) => r[0]));
  for (const rows of Object.values(CAREER_SQUADS)) for (const r of rows) real.add(r[0]);
  let prevTop = 99;
  for (const c of COUNTRIES) {
    const seen = new Set();
    for (const club of c.clubs) {
      const { xi, bench } = clubSquad(club);
      assert.equal(xi.length, 11, `${club.name} XI`);
      assert.ok(xi.some((p) => p.position === 'GK'), `${club.name} has a keeper`);
      for (const p of [...xi, ...bench]) {
        assert.ok(real.has(p.name), `${p.name} at ${club.name} is a real name`);
        assert.ok(!seen.has(p.name), `${p.name} is at two clubs in ${c.name}`);
        seen.add(p.name);
      }
      const sq = matchSquad(club);
      assert.equal(sq.xi.length, 11); assert.ok(sq.crest.colors.length === 2);
    }
    const top = clubSheet(c.clubs[0]).overall;
    if (c.rank > 6) assert.ok(top <= prevTop + 3, `${c.name} (${top}) is not stronger than the country above (${prevTop})`);
    prevTop = c.rank > 6 ? Math.min(prevTop, top) : prevTop;
  }
  assert.ok(clubSheet(countryByName('Spain').clubs[0]).overall > clubSheet(countryByName('India').clubs[0]).overall + 20);
});

test('International lists the national teams', () => {
  const teams = internationalTeams();
  assert.ok(teams.length >= 32);
  for (const n of ['France', 'Spain', 'Saudi Arabia']) assert.ok(teams.some((t) => t.name === n), `${n} is there`);
  const sq = internationalSquad(teams.find((t) => t.name === 'Saudi Arabia'));
  assert.equal(sq.xi.length, 11);
  assert.ok(sq.national);
});
