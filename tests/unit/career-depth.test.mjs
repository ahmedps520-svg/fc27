/**
 * v81 — career depth: the Manager Career's new systems, the living world, the
 * Player Career, the player lock, match ratings — and ten seasons of each
 * for stability, save size and speed.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import * as career from '../../js/career.js';
import * as v2 from '../../js/careerV2.js';
import * as v3 from '../../js/careerV3.js';
import * as P from '../../js/proCareer.js';
import { rateOf, ageOf } from '../../js/careerPeople.js';
import { Match } from '../../js/game/sim.js';
import { rateMatch } from '../../js/game/ratings.js';
import { WORLD } from '../../js/data/generator.js';

beforeEach(() => { resetStorage(); resetAll(); });

const seeded = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const withSeed = (seed, fn) => { const r = Math.random; Math.random = seeded(seed); try { return fn(); } finally { Math.random = r; } };

test('ten Manager Career seasons: stable, small, quick, and the world lives', () => {
  withSeed(81, () => {
    career.startCareer({ name: 'Test', nation: 'England', age: 40 }, 'mci');
    const t0 = Date.now();
    let guard = 0;
    while (getState().career.season <= 10 && guard++ < 2000) {
      const car = getState().career;
      if (car.review) { update((s) => { if (s.career.review.sacked) v2.takeJob(s.career, s.career.review.offers[0] || s.career.clubId); s.career.review = null; }); continue; }
      if (car.expiring?.length) { update((s) => career.releaseExpired(s.career)); continue; }
      const fx = career.myFixture(car);
      career.advanceWeek(fx ? v2.simScoreV2(car, fx.home, fx.away) : null);
      const c = getState().career;
      assert.ok(Number.isFinite(c.coins), 'money stays a number');
      assert.ok(c.squads[c.clubId].length >= 11, `squad of ${c.squads[c.clubId].length} in S${c.season} W${c.week}`);
    }
    const ms = Date.now() - t0;
    const c = getState().career;
    assert.equal(c.season, 11);
    assert.ok(ms < 15000, `ten seasons in ${ms} ms`);
    const kb = JSON.stringify(c).length / 1024;
    assert.ok(kb < 450, `save ${kb.toFixed(0)} KB`);
    assert.equal(c.world.awards.length, 10, 'an awards night every season');
    assert.ok(c.world.retired > 20 && c.world.regens > 20, 'players retire and new ones arrive');
    assert.ok(c.world.news.length <= 60);
    assert.ok(c.fin.history.length === 10);
    assert.ok(Object.values(c.squads).every((rows) => rows.every((r) => typeof r[0] === 'string' && r[3])), 'every squad row is whole');
    assert.ok(Object.values(c.world.managers).length > 0, 'AI clubs have managers');
  });
});

test('ten Player Career seasons: he grows, ages, moves, and retires with a legacy', () => {
  withSeed(17, () => {
    const club = P.startingClubs().find((c) => c.league.startsWith('Saudi'));
    P.startPro({ name: 'Rakan Test', nation: 'Saudi Arabia', position: 'ST', clubId: club.id });
    const start = P.me();
    assert.equal(start.age, 17);
    assert.ok(start.overall >= 55 && start.overall <= 65, `starts at ${start.overall}`);
    let weeks = 0; const t0 = Date.now();
    while (getState().pro.world.season <= 10 && weeks++ < 1500) {
      const p = getState().pro;
      if (p.talks) { const o = P.renewalOffer(p); P.negotiate({ wage: o.wage, years: o.years }); }
      const open = p.offers.filter((o) => o.state === 'open');
      if (open.length && weeks % 7 === 0) P.answerOffer(open[0].id, true);
      P.trainDrill(P.DRILLS[weeks % 6].id, 70);
      P.advancePro();
    }
    const p = getState().pro;
    const now = P.me(p);
    assert.equal(now.age, 27, 'ten seasons older');
    assert.ok(now.overall > start.overall + 8, `grew from ${start.overall} to ${now.overall}`);
    assert.ok(p.totals.apps > 40, `${p.totals.apps} appearances`);
    assert.ok(p.history.length === 10);
    assert.ok(p.milestones.some((m) => /debut/i.test(m.text)));
    assert.ok(Date.now() - t0 < 15000);
    assert.ok(JSON.stringify(p).length / 1024 < 450);
    P.retire('Test over.');
    const L = getState().pro.legacy;
    assert.ok(L && L.score > 0 && typeof L.tier === 'string');
  });
});

test('the player lock keeps the stick on one man, and he only takes his own restarts', () => {
  withSeed(5, () => {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 60 });
    const target = m.teams[0].players[6];
    assert.equal(m.lockPlayer(target.ref.id), true);
    for (let i = 0; i < 60 * 40; i++) {
      m.update(1 / 60, { axis: () => ({ x: 0, y: 0 }), held: () => false, pressed: () => false, released: () => false, poll() {} });
      const c = m.controllers[0];
      if (!c.benched) assert.equal(m.teams[0].players[c.activeIdx], target, `stays on him at t=${m.t.toFixed(1)}`);
      if (m.setPiece?.team === 0 && m.setPiece.human) assert.equal(m.setPiece.taker, target, 'a locked seat only takes his own set pieces');
    }
  });
});

test('match ratings: bounded, a player of the match, scorers above the pack', () => {
  withSeed(9, () => {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 60, human: null });
    for (let i = 0; i < 60 * 60 * 3 && m.phase !== 'end'; i++) m.update(1 / 60);
    const r = rateMatch(m);
    assert.ok(r.players.length >= 22);
    for (const x of r.players) assert.ok(x.rating >= 3 && x.rating <= 10);
    assert.ok(r.potm);
    const scorer = r.players.find((x) => x.goals > 0);
    if (scorer) assert.ok(scorer.rating >= 6.5, 'a scorer rates well');
    assert.ok(r.players.every((x) => x.mins >= 0 && x.mins <= 91));
  });
});

test('a named penalty taker takes the penalty', () => {
  withSeed(3, () => {
    const club = WORLD.clubs[0];
    const xi = club.roster.map((id) => WORLD.playersById[id]).sort((a, b) => b.overall - a.overall);
    const gk = xi.find((p) => p.position === 'GK'); const out = xi.filter((p) => p !== gk).slice(0, 10);
    const weakest = out.slice().sort((a, b) => a.stats.shooting - b.stats.shooting)[0];
    const m = new Match(club.id, WORLD.clubs[1].id, { human: null, homeSquad: { xi: [gk, ...out], takers: { pen: weakest.id } } });
    m.awardPenalty(0, null);
    assert.equal(m.penaltyTaker.ref.id, weakest.id);
  });
});

test('manager systems: talks, promises, facilities, loans, release clauses and sell-ons', () => {
  withSeed(11, () => {
    career.startCareer({ name: 'T', nation: 'England', age: 40 }, 'mci');
    update((s) => {
      const c = s.career; v3.ensureV3(c);
      const name = c.squads[c.clubId][5][0];
      assert.equal(v3.talk(c, name, 'promise').ok, true);
      assert.ok(v3.plOf(c, name).promise);
      assert.equal(v3.talk(c, name, 'praise').ok, false, 'one talk a week');
      const coins = c.coins;
      assert.equal(v3.upgradeFacility(c, 'training').ok, true);
      assert.equal(c.fac.training, 2);
      assert.equal(c.coins, coins - v3.facilityCost(1));
      // loans out and home again at season's end
      const young = c.squads[c.clubId].find((r) => ageOf(c, r[0]) <= 23)?.[0];
      if (young) {
        const host = v2.allClubs().find((x) => x.tier === 2).id;
        assert.equal(v3.loanOut(c, young, host).ok, true);
        assert.ok(c.squads[host].some((r) => r[0] === young));
      }
      // a release clause met is a player gone
      const star = c.squads[c.clubId][0][0];
      v3.setClauses(c, star, { release: 1_000_000 });
      const offer = { player: star, from: 'rma', fee: 2_000_000, state: 'open' };
      assert.equal(v3.checkRelease(c, offer), true);
      assert.ok(c.squads.rma.some((r) => r[0] === star));
      // a sell-on pays when he moves on
      v3.noteSellOn(c, star, 20, 'rma');
      const before = c.coins;
      v3.onAiTransfer(c, { player: star, from: 'rma', to: 'bar', fee: 50_000_000 });
      assert.equal(c.coins - before, 10_000_000);
    });
    // season end brings loans home
    update((s) => { const c = s.career; const table = career.sortedCareerTable(c); v3.seasonEndV3(c, table); });
    const c = getState().career;
    assert.equal(c.loans.length, 0);
    assert.ok(c.squads[c.clubId].length >= v3.SQUAD_FLOOR);
  });
});

test('people: ages move with seasons, regens have names from their region', () => {
  const car = career.newWorld({ name: 'x' }, 'mci');
  const n = car.squads.mci[0][0];
  const a1 = ageOf(car, n); car.season = 4; assert.equal(ageOf(car, n), a1 + 3);
  car.leagueOf.mci = 'Saudi Pro League';
  const y = v3.youthProspect(car);
  assert.ok(car.people[y.name] && /^(Faisal|Salem|Nawaf|Abdulrahman|Turki|Hamad|Yazeed|Rakan|Majed|Ziyad|Omar|Khalid) /.test(y.name), y.name);
  assert.ok(rateOf(car, y.name) >= 45);
});
