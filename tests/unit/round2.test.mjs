import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { WORLD, getPlayer } from '../../js/data/generator.js';
import { TIER_XP, TIERS, DEFAULT_TIERS, tierOf, tierProgress, rewardText } from '../../js/data/season.js';
import { weekendWindow, currentWeekend, rankFor, RANKS, WL_MATCHES } from '../../js/weekend.js';
import { activeEvent, eventPack, isoWeek, season, adopt, liveData, eventKey } from '../../js/live.js';
import { LIVE_DEFAULT } from '../../js/data/liveDefault.js';
import { ACHIEVEMENTS, evaluateAll } from '../../js/data/achievements.js';
import { chemistryFor, moddedRef, linksFor, CHEM_STEP } from '../../js/data/chemistry.js';
import { CHALLENGES, evaluate } from '../../js/data/challenges.js';
import { openPack, filterOf } from '../../js/data/packs.js';
import { apexCost, evolve, evolveInfo, EVOLVE_MAX } from '../../js/evolve.js';
import * as progress from '../../js/progress.js';
import { readFileSync } from 'node:fs';

beforeEach(() => { resetStorage(); resetAll(); adopt(LIVE_DEFAULT); });

test('season pass: thirty tiers, 250 XP each, milestones at 10/20/30', () => {
  assert.equal(TIERS, 30);
  assert.equal(DEFAULT_TIERS.length, 30);
  assert.equal(tierOf(0), 0);
  assert.equal(tierOf(TIER_XP * 3 + 10), 3);
  assert.equal(tierOf(1e9), 30);
  assert.ok(tierProgress(125) > 0.49 && tierProgress(125) < 0.51);
  assert.ok(DEFAULT_TIERS[9].label && DEFAULT_TIERS[19].label && DEFAULT_TIERS[29].ultimate);
  assert.equal(rewardText({ apex: 1500, pack: 'gold' }), '◈ 1,500 + gold pack');
});

test('weekend window: Friday 18:00 to Monday 06:00 UTC, one id per weekend', () => {
  const fri = new Date('2026-09-18T19:00:00Z');
  const sun = new Date('2026-09-20T12:00:00Z');
  const monEarly = new Date('2026-09-21T05:00:00Z');
  const tue = new Date('2026-09-22T12:00:00Z');
  const friBefore = new Date('2026-09-18T10:00:00Z');
  assert.equal(weekendWindow(fri).open, true);
  assert.equal(weekendWindow(sun).open, true);
  assert.equal(weekendWindow(monEarly).open, true);
  assert.equal(weekendWindow(tue).open, false);
  assert.equal(weekendWindow(friBefore).open, false);
  assert.equal(weekendWindow(fri).id, weekendWindow(monEarly).id);
  assert.equal(weekendWindow(tue).id, '2026-09-25', 'a Tuesday waits for the coming Friday');
  assert.equal(rankFor(0).name, 'Bronze');
  assert.equal(rankFor(9).name, 'Apex');
  assert.equal(rankFor(6).name, 'Gold');
  assert.equal(RANKS.length, 5);
  assert.equal(WL_MATCHES, 10);
});

test('currentWeekend rolls a finished, unclaimed tally into pending', () => {
  const club = { weekend: { id: '2026-09-11', played: 4, wins: 3, claimed: false } };
  const { window: w, tally } = currentWeekend(club, new Date('2026-09-19T12:00:00Z'));
  assert.equal(w.id, '2026-09-18');
  assert.equal(tally.played, 0);
  assert.equal(club.weekendPending.wins, 3);
});

test('live content: the rotation always has an event, and events.json matches the bundled default', () => {
  assert.equal(liveData().events.length, 4);
  const seen = new Set();
  for (let wk = 0; wk < 8; wk++) {
    const d = new Date(Date.UTC(2026, 8, 7 + wk * 7));
    const ev = activeEvent(d);
    assert.ok(ev && ev.pack, 'an event every week');
    seen.add(ev.id);
    assert.ok(eventKey(ev, d).startsWith(ev.id));
  }
  assert.equal(seen.size, 4, 'the rotation cycles through all four');
  assert.ok(isoWeek(new Date('2026-01-01T00:00:00Z')) >= 1);
  const file = JSON.parse(readFileSync('events.json', 'utf8'));
  assert.deepEqual(file, JSON.parse(JSON.stringify(LIVE_DEFAULT)), 'events.json is the bundled default until edited');
  const se = season(new Date('2026-09-20T00:00:00Z'));
  assert.equal(se.id, 's1');
  assert.equal(se.tiers.length, 30);
  assert.equal(se.active, true);
  // a dated event beats the rotation
  adopt({ ...LIVE_DEFAULT, events: [{ id: 'dated', name: 'Dated', from: '2026-09-20', to: '2026-09-21', pack: null }, ...LIVE_DEFAULT.events] });
  assert.equal(activeEvent(new Date('2026-09-20T10:00:00Z')).id, 'dated');
  assert.notEqual(activeEvent(new Date('2026-09-23T10:00:00Z')).id, 'dated');
  assert.equal(adopt('garbage'), false);
});

test('event packs honour their filter, and every featured player exists', () => {
  for (const ev of LIVE_DEFAULT.events) {
    const pack = eventPack(ev);
    const only = filterOf(pack.filter);
    for (let i = 0; i < 15; i++) {
      const drawn = openPack(pack, new Set());
      assert.equal(drawn.length, pack.size);
      for (const { p } of drawn) assert.ok(only(p), `${ev.id}: ${p.name} (${p.nation}, ${p.position}, ${p.overall}) outside the filter`);
    }
    assert.ok(WORLD.players.some((p) => p.name === ev.featured.player), `${ev.featured.player} is a real card`);
  }
});

test('achievements: 40+, unique ids, every getter runs on a fresh save', () => {
  assert.ok(ACHIEVEMENTS.length >= 40, `${ACHIEVEMENTS.length} achievements`);
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  const all = evaluateAll(getState(), WORLD.playersById);
  assert.ok(all.every((a) => Number.isFinite(a.have) && a.have >= 0 && a.have <= a.need));
  assert.equal(all.filter((a) => a.complete).length, 0, 'a fresh save has earned nothing');
});

test('progress: a match feeds stats, XP, the event and achievements; rewards are claimed once', () => {
  update((s) => { s.club.collection.push(WORLD.players[0].id); });
  const r = progress.onMatch({ mode: 'ultimate', scored: 4, conceded: 0, possession: 61 });
  const s = getState();
  assert.equal(s.club.stats.wins, 1);
  assert.equal(s.club.stats.hatTricks, 1);
  assert.equal(s.club.stats.cleanSheets, 1);
  assert.equal(s.club.stats.bigWins, 1);
  assert.ok(s.club.season.xp > 0);
  assert.equal(typeof r.tiers, 'number');
  assert.ok(s.club.achievements['first-win'], 'the first win unlocks');
  assert.ok(s.club.achievements['first-card']);
  const apexBefore = s.club.apex;
  const a = progress.claimAchievement('first-win');
  assert.equal(a.id, 'first-win');
  assert.equal(getState().club.apex, apexBefore + a.apex);
  assert.equal(progress.claimAchievement('first-win'), null, 'never twice');
  // event objective progress landed under this week's key
  const ev = activeEvent();
  const slot = getState().club.events[eventKey(ev)];
  assert.ok(slot && Object.keys(slot.done).length > 0);
});

test('progress: daily login pays once a day and builds a streak', () => {
  const d1 = progress.dailyStatus(new Date('2026-09-19T08:00:00Z'));
  assert.equal(d1.day, 1);
  assert.equal(d1.claimable, true);
  const before = getState().club.apex;
  const r = progress.claimDaily(new Date('2026-09-19T08:00:00Z'));
  assert.ok(r.apex);
  assert.equal(getState().club.apex, before + r.apex);
  assert.equal(progress.claimDaily(new Date('2026-09-19T20:00:00Z')), null);
  const d2 = progress.dailyStatus(new Date('2026-09-20T08:00:00Z'));
  assert.equal(d2.streak, 2);
  assert.equal(d2.claimable, true);
  const d9 = progress.dailyStatus(new Date('2026-09-25T08:00:00Z'));
  assert.equal(d9.streak, 1, 'a missed day resets');
});

test('progress: season tiers are claimable in order and only once', () => {
  update((s) => { progress.addXP(s, TIER_XP * 2 + 5, 'test'); });
  assert.equal(tierOf(getState().club.season.xp), 2);
  assert.ok(progress.claimTier(1));
  assert.ok(progress.claimTier(2));
  assert.equal(progress.claimTier(2), null);
  assert.equal(progress.claimTier(3), null, 'not reached');
  assert.equal(progress.claimableCount() >= 0, true);
});

test('progress: the weekend tally and its claim', () => {
  const s0 = getState();
  const w = weekendWindow();
  update((st) => { st.club.weekend = { id: w.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, claimed: false }; });
  void s0;
  if (w.open) {
    progress.onMatch({ mode: 'weekend', scored: 2, conceded: 1, weekend: true });
    assert.equal(getState().club.weekend.wins, 1);
  }
  // a finished weekend, pending, pays its rank
  update((st) => { st.club.weekendPending = { id: '2020-01-03', played: 10, wins: 7, draws: 0, losses: 3, claimed: false }; });
  const before = getState().club.apex;
  const got = progress.claimWeekend();
  assert.equal(got.rank.name, 'Elite');
  assert.equal(getState().club.apex, before + got.rank.apex);
  assert.equal(progress.claimWeekend(), null);
});

test('chemistry: deterministic, bounded, and league links count', () => {
  const s = getState();
  const xi = WORLD.clubs[0].roster.slice(0, 11);
  const chem = chemistryFor(xi, s.club.formation);
  assert.equal(chem.per.length, 11);
  assert.ok(chem.team >= 0 && chem.team <= 100);
  const p = getPlayer(xi[0]);
  const hi = moddedRef(p, { chem: 3, level: 0 });
  const lo = moddedRef(p, { chem: 0, level: 0 });
  const neutral = moddedRef(p, { chem: 1.5, level: 0 });
  for (const k of Object.keys(p.stats)) {
    assert.ok(hi.stats[k] >= neutral.stats[k] && neutral.stats[k] >= lo.stats[k]);
    assert.ok(Math.abs(hi.stats[k] / p.stats[k] - 1) <= 1.5 * CHEM_STEP + 3e-4);   // two-decimal rounding
    assert.equal(neutral.stats[k], p.stats[k]);
  }
  assert.equal(moddedRef(p, { chem: 3, level: 2 }).overall, Math.min(99, p.overall + 2));
  assert.deepEqual(moddedRef(p, { chem: 2, level: 1 }), moddedRef(p, { chem: 2, level: 1 }));
  assert.equal(p.stats, getPlayer(xi[0]).stats, 'the card itself is never touched');
  const links = linksFor(xi[0], xi);
  assert.ok(links.club >= 1 && links.league >= 1);
});

test('challenges: fourteen or more, and every legend reward is a real SBC card', () => {
  assert.ok(CHALLENGES.length >= 14, `${CHALLENGES.length} challenges`);
  const legends = new Set(WORLD.sbcCards.map((id) => getPlayer(id).name));
  for (const c of CHALLENGES) {
    if (c.reward.card) assert.ok(legends.has(c.reward.card), `${c.id} rewards ${c.reward.card}`);
    // every requirement evaluates on an arbitrary eleven
    const cards = WORLD.players.slice(0, 11);
    const chem = chemistryFor(cards.map((p) => p.id), '4-3-3');
    const { rows } = evaluate(c, cards, chem);
    assert.equal(rows.length, c.reqs.length);
  }
  // Saudi XI is satisfiable from the world
  const saudis = WORLD.players.filter((p) => p.nation === 'Saudi Arabia' && !p.sbc);
  assert.ok(saudis.length >= 7);
  const meridian = WORLD.players.filter((p) => p.clubId && WORLD.clubsById[p.clubId].league === 'Meridian League');
  assert.ok(meridian.length >= 8);
});

test('evolve: cost climbs with level and rating; dupes and apex both pay; capped at five', () => {
  const p = WORLD.players.find((x) => x.overall === 75 && !x.sbc);
  const q = WORLD.players.find((x) => x.overall === 90 && !x.sbc);
  assert.ok(apexCost(q, 0) > apexCost(p, 0));
  assert.ok(apexCost(p, 3) > apexCost(p, 0));
  update((s) => { s.club.collection.push(p.id); s.club.dupes = { [p.id]: 1 }; s.club.apex = 100000; });
  assert.equal(evolve(p.id, 'dupe').ok, true);
  assert.equal(evolve(p.id, 'dupe').ok, false, 'no dupe left');
  assert.equal(evolve(p.id, 'apex').ok, true);
  assert.equal(evolveInfo(p.id).level, 2);
  for (let i = 0; i < 3; i++) evolve(p.id, 'apex');
  assert.equal(evolveInfo(p.id).level, EVOLVE_MAX);
  assert.equal(evolve(p.id, 'apex').ok, false);
  assert.equal(getState().club.stats.maxed, 1);
});
