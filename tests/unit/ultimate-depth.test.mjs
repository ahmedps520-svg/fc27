/**
 * v80 — Ultimate XI depth: promo cards, evolutions, the market, the binder,
 * the modes, tasks and the club level, the squad hub, and the five-a-side field.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update, save } from '../../js/state.js';
import { WORLD, getPlayer } from '../../js/data/generator.js';
import { RARITY } from '../../js/data/pools.js';
import * as promos from '../../js/data/promos.js';
import { PACKS, openPack } from '../../js/data/packs.js';
import * as market from '../../js/market.js';
import * as evo from '../../js/evolutions.js';
import * as modes from '../../js/modes.js';
import * as tasks from '../../js/tasks.js';
import * as binder from '../../js/binder.js';
import * as hub from '../../js/squadHub.js';
import { chemistryFor, chemLinks } from '../../js/data/chemistry.js';
import { Match, setField, PITCH, FIELD, GOAL_HALF } from '../../js/game/sim.js';
import { guideValue, valueFromPrice } from '../../js/data/cardValue.js';

beforeEach(() => { resetStorage(); resetAll(); });

const golds = () => WORLD.players.filter((p) => p.rarity === 'gold' && !p.sbc);

test('promo cards resolve lazily, carry their base and a registered rarity', () => {
  for (const c of promos.CAMPAIGNS) {
    const cards = promos.campaignCards(c);
    assert.ok(cards.length > 100, `${c.name} has ${cards.length} cards`);
    const p = cards[0];
    assert.equal(getPlayer(p.id).id, p.id, 'resolves by id');
    assert.ok(RARITY[p.rarity], `rarity ${p.rarity} is registered`);
    assert.ok(getPlayer(promos.baseOf(p)), 'the base card exists');
    assert.ok(!WORLD.players.includes(p), 'variants never join the world roster');
  }
  const wk = promos.weekNow();
  const a = promos.weekCards('totw', wk).map((p) => p.id);
  assert.deepEqual(promos.weekCards('totw', wk).map((p) => p.id), a, 'team of the week is deterministic');
  assert.equal(a.length, 11);
  assert.ok(promos.weekCards('inform', wk).length >= 11);
  const early = promos.iconTierCards('early')[0];
  const prime = getPlayer(promos.baseOf(early));
  assert.ok(early.overall < prime.overall, 'an Early icon is below its Prime');
});

test('promo packs promise their slot and show odds that sum to 100', () => {
  const camp = PACKS.find((p) => p.id === 'campaign');
  assert.ok(camp && camp.variant);
  const got = openPack(camp, new Set());
  const ids = got.map((x) => x.p.id);
  assert.ok(ids.some((id) => getPlayer(id)?.baseId), 'the promo slot is a promo card');
  for (const p of PACKS.filter((x) => x.variantOdds)) {
    const sum = p.variantOdds.reduce((a, [, w]) => a + w, 0);
    assert.ok(Math.abs(sum - 1) < 1e-6 || Math.abs(sum - 100) < 1e-6, `${p.id} odds sum to ${sum}`);
  }
});

test('market prices stay inside the range, and the range blocks exploits', () => {
  const p = golds()[0];
  const r = market.priceRange(p);
  assert.ok(r.min < r.value && r.value < r.max);
  const list = market.search({});
  assert.ok(list.length >= 30, 'the market has listings');
  for (const l of list) {
    const rr = market.priceRange(l.p);
    assert.ok(l.buyNow >= rr.min && l.buyNow <= rr.max, 'buy-now within range');
    assert.ok(l.start <= l.buyNow);
  }
  update((s) => { s.club.apex = 10_000_000; s.club.collection = [p.id]; s.club.lineup = Array(11).fill(null); });
  assert.equal(market.listCard(p.id, r.max + 10, r.max + 10).ok, false, 'over the ceiling is refused');
  assert.equal(market.listCard(p.id, r.min - 10, r.value).ok, false, 'under the floor is refused');
  assert.equal(market.listCard(p.id, r.value, r.value, 1).ok, true);
  assert.ok(!getState().club.collection.includes(p.id), 'a listed card leaves the club');
  const apex0 = getState().club.apex;
  const ev = market.settle(Date.now() + 2 * 3600_000);
  const sold = ev.find((e) => e.kind === 'sold');
  if (sold) assert.equal(getState().club.apex - apex0, Math.round(sold.amount * (1 - market.TAX)), 'sales pay tax');
  else assert.ok(getState().club.collection.includes(p.id), 'unsold comes back');
  // buy now
  const l = list[0];
  const before = getState().club.apex;
  assert.equal(market.buyNow(l).ok, true);
  assert.equal(getState().club.apex, before - l.buyNow);
  assert.ok(!market.search({}).some((x) => x.id === l.id), 'a bought listing is gone');
  // bids at or over buy-now are refused
  const l2 = market.search({})[0];
  assert.equal(market.placeBid(l2, l2.buyNow).ok, false);
  assert.ok(market.historySVG(p.id).startsWith('<svg'));
  assert.equal(market.history(p.id).pts.length, 14);
});

test('the watch guide value agrees with the market rounding', () => {
  const p = golds()[3];
  assert.ok(guideValue(p) >= 150);
  assert.equal(valueFromPrice(0), 150);
  assert.equal(valueFromPrice(25_000_000) % 500, 0);
});

test('evolutions: fit, progress with the card on the pitch, and boost the card for good', () => {
  const p = golds().find((x) => x.position === 'ST' && x.overall <= 83);
  update((s) => { s.club.collection = [p.id]; });
  assert.equal(evo.startEvolution('lastline', p.id).ok, false, 'a striker does not fit the keeper track');
  assert.equal(evo.startEvolution('clinical', p.id).ok, true);
  assert.equal(evo.startEvolution('clinical', p.id).ok, false, 'one card per track');
  const fake = (goals) => ({ teams: [{ score: goals, scorers: Array.from({ length: goals }, () => ({ id: p.id })) }, { score: 0, scorers: [] }] });
  let done = evo.recordEvoMatch(fake(3), 0, [p.id]);
  assert.equal(done.length, 1, 'three goals finish stage one');
  let ref = evo.evolvedRef(getState().club, p);
  assert.equal(ref.overall, p.overall + 1);
  assert.ok(ref.stats.shooting > p.stats.shooting);
  // stage two is wins: three of them
  for (let i = 0; i < 3; i++) done = evo.recordEvoMatch(fake(1), 0, [p.id]);
  ref = evo.evolvedRef(getState().club, p);
  assert.ok(ref.extraTraits.includes('finesse'), 'the stage trait arrives');
  // a match without him in the XI does not count for wins
  const st = getState().club.evos.clinical.stage;
  evo.recordEvoMatch({ teams: [{ score: 1, scorers: [] }, { score: 0, scorers: [] }] }, 0, []);
  assert.equal(getState().club.evos.clinical.stage, st);
  for (let i = 0; i < 2; i++) evo.recordEvoMatch(fake(2), 0, [p.id]);
  assert.ok(!getState().club.evos.clinical, 'the finished track closes');
  assert.equal(evo.evolvedRef(getState().club, p).overall, p.overall + 3, 'and the card keeps it');
});

test('Quickfire Fives, Squad Clash and qualification points', () => {
  const r = modes.settleFives(3, 1);
  assert.equal(r.apex, modes.FIVES.reward.win + 3 * modes.FIVES.reward.goal);
  assert.equal(getState().club.fives.won, 1);
  assert.equal(modes.qualification().points, 1);
  const week = modes.clashWeek();
  assert.equal(week.length, 12);
  assert.equal(new Set(week.map((t) => t.id)).size, 12);
  const opp = modes.clashSquad(week[0].id, 80);
  assert.equal(opp.xi.length, 11);
  assert.ok(Math.abs(opp.rating - 80) <= 6, `clash squad near target: ${opp.rating}`);
  const c = modes.settleClash(week[0].id, 'legend', 2, 0);
  assert.equal(c.pts, 240 + 16 + 25);
  assert.equal(modes.clashStatus().points, c.pts);
  assert.equal(modes.qualification().points, 3);
  for (let i = 0; i < 7; i++) modes.noteDivisionResult(true);
  assert.equal(modes.qualification().qualified, true);
  assert.equal(modes.rivalsStatus().current.wins, 7);
  const pick = modes.fivesPick(opp.xi);
  assert.equal(pick.length, 5);
  assert.equal(pick.filter((p) => p.position === 'GK').length, 1);
});

test('tasks move with play, pay once, and the club level pays every level', () => {
  const b = tasks.taskBoard();
  assert.equal(b.daily.length, 3);
  assert.equal(b.weekly.length, 5);
  const t = b.daily[0];
  tasks.bump(t.metric, t.need);
  const apex0 = getState().club.apex;
  const r = tasks.claimTask(t.id);
  assert.equal(r.ok, true);
  assert.equal(getState().club.apex >= apex0 + t.apex, true);
  assert.equal(tasks.claimTask(t.id).ok, false, 'once only');
  assert.deepEqual(tasks.levelFromXP(0), { level: 1, into: 0, need: 400 });
  assert.equal(tasks.levelFromXP(400).level, 2);
  const gained = tasks.addClubXP(5000);
  assert.ok(gained.length >= 7);
  assert.ok(gained.some((g) => g.level === 5 && g.packs.includes('gold')));
});

test('the binder remembers every card and pays a set once', () => {
  const set = binder.sets().find((s) => s.id === 'stars');
  update((s) => { s.club.collection = set.ids.slice(0, set.need); });
  save();
  update((s) => { s.club.collection = []; });
  const pr = binder.setProgress(set);
  assert.equal(pr.done, true, 'sold cards still count');
  const apex0 = getState().club.apex;
  assert.equal(binder.claimSet('stars').ok, true);
  assert.equal(getState().club.apex, apex0 + set.reward.apex);
  assert.equal(binder.claimSet('stars').ok, false);
});

test('squad hub: the builder fields eleven different footballers, the manager adds chemistry, squads save and load', () => {
  const pool = golds().slice(0, 60).map((p) => p.id);
  const promo = promos.campaignCards(promos.CAMPAIGNS[0]).find((c) => pool.includes(c.baseId));
  update((s) => { s.club.collection = promo ? [...pool, promo.id] : pool; });
  const b = hub.buildSquad();
  assert.equal(b.lineup.filter(Boolean).length, 11);
  const bases = b.lineup.map((id) => promos.baseOf(getPlayer(id)));
  assert.equal(new Set(bases).size, 11, 'never the same footballer twice');
  assert.equal(getPlayer(b.lineup[0]).position === 'GK' || b.lineup.some((id) => getPlayer(id).position === 'GK'), true);
  hub.applyBuild(b);
  const s = getState().club;
  const before = chemistryFor(s.lineup, s.formation);
  const nation = getPlayer(s.lineup.find(Boolean)).nation;
  const m = hub.MANAGERS.find((x) => x.nation === nation) || hub.MANAGERS[0];
  const after = chemistryFor(s.lineup, s.formation, m);
  assert.ok(after.team >= before.team);
  assert.ok(after.parts.every((x, i) => !x || after.per[i] <= 3), 'never past the cap');
  assert.ok(chemLinks(s.lineup, s.formation).length >= 10, 'neighbours are linked');
  hub.saveSquad(0, 'A');
  update((st) => { st.club.lineup = Array(11).fill(null); st.club.collection = st.club.collection.filter((id) => id !== b.lineup[3]); });
  const missing = hub.loadSquad(0);
  assert.equal(missing, 1, 'a sold card leaves a gap');
  assert.equal(getState().club.lineup.filter(Boolean).length, 10);
  assert.equal(hub.setManager('m-cuervo'), false, 'locked managers cannot be picked');
});

test('the five-a-side field: five a side, small goals, and the full field restored after', () => {
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 150, field: 'fives', human: null });
  assert.equal(FIELD.players, 5);
  assert.equal(PITCH.w, 60);
  assert.ok(GOAL_HALF < 3);
  assert.equal(m.teams[0].players.length, 5);
  assert.equal(m.teams[1].players.filter((p) => p.role === 'GK').length, 1);
  let steps = 0;
  while (m.phase !== 'end' && steps < 60 * 60 * 8) { m.update(1 / 60); steps++; }
  assert.equal(m.phase, 'end', 'the match finishes');
  for (const t of m.teams) for (const p of t.players) {
    assert.ok(p.x >= -3 && p.x <= PITCH.w + 3 && p.y >= -3 && p.y <= PITCH.h + 3, 'players stay on the small pitch');
  }
  const full = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 60, human: null });
  assert.equal(FIELD.players, 11);
  assert.equal(PITCH.w, 105);
  assert.equal(full.teams[0].players.length, 11);
  setField('full');
});

test('the market cannot be farmed: no elite listings, nobody pays over the buyer cap', () => {
  for (let k = 0; k < 6; k++) {
    for (const l of market.search({}, Date.now() + k * market.SLOT_MS)) assert.ok(l.p.overall < market.ELITE, `${l.p.name} ${l.p.overall} listed`);
  }
  const p = golds().find((x) => x.overall < 85);
  const r = market.priceRange(p);
  update((s) => { s.club.collection = [p.id]; s.club.lineup = Array(11).fill(null); });
  assert.equal(market.listCard(p.id, r.max, r.max, 24).ok, true);
  let t = Date.now();
  for (let h = 0; h < 30; h++) { t += 3600_000; market.settle(t); }
  assert.ok(!getState().club.mkt.trades.some((x) => x.side === 'sell'), 'a listing at the ceiling never sells');
  assert.ok(getState().club.collection.includes(p.id), 'and comes back unsold');
});

test('the market never shows an ended listing, at any point in a slot', () => {
  update((s) => { s.club.apex = 10_000_000; });
  const slot = Math.floor(Date.now() / market.SLOT_MS);
  for (const into of [0.01, 0.5, 0.95, 0.999]) {
    const now = (slot + into) * market.SLOT_MS;
    const list = market.search({}, now);
    assert.ok(list.length > 0);
    for (const l of list) assert.ok(l.ends > now, 'listing still open');
    assert.equal(market.buyNow(list[0], now).ok, true, `buyable at ${into} of the slot`);
  }
});
