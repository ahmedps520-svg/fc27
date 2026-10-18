/**
 * v196 — the Draft (js/draft.js): the entry, a formation from three, a
 * captain from five, ten slots from five each with no footballer twice,
 * offers that never re-roll, four knockout rounds that get harder, penalties
 * on a draw, a defeat ending it, the reward by wins, and nothing drafted
 * joining the club.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { getPlayer } from '../../js/data/generator.js';
import { FORMATIONS, POSITIONS } from '../../js/data/pools.js';
import * as draft from '../../js/draft.js';

beforeEach(() => { resetStorage(); resetAll(); });
const ID = { name: 'Test XI', short: 'TXI', crest: { shape: 'shield', pattern: 'solid', device: 'star', colors: ['#fff', '#000'] }, kit: null };
const fund = (n) => update((s) => { s.club.apex = n; });

/** Draft a whole squad, taking the first card each time. */
function draftAll(seed = 7) {
  fund(10000);
  const r = draft.startDraft(Date.now(), seed);
  assert.ok(r.draft, JSON.stringify(r));
  draft.chooseFormation(r.draft.formations[0]);
  draft.chooseCaptain(draft.draftState().offer[0]);
  while (draft.draftState().step === 'pick') draft.choosePick(draft.draftState().offer[0]);
  return draft.draftState();
}

test('the entry is paid once, and only with the Apex for it', () => {
  fund(draft.DRAFT_ENTRY - 1);
  assert.ok(draft.startDraft().error);
  assert.equal(getState().club.apex, draft.DRAFT_ENTRY - 1);
  fund(draft.DRAFT_ENTRY + 5);
  assert.ok(draft.startDraft().draft);
  assert.equal(getState().club.apex, 5);
  fund(99999);
  assert.match(draft.startDraft().error, /Finish/, 'one draft at a time');
});

test('a formation from three, a captain from five in a slot of his own, ten more from five each, no footballer twice', () => {
  fund(10000);
  const d0 = draft.startDraft(Date.now(), 1234).draft;
  assert.equal(d0.formations.length, 3);
  for (const f of d0.formations) assert.ok(FORMATIONS[f]);
  assert.ok(draft.chooseFormation('nope').error);
  draft.chooseFormation(d0.formations[1]);
  let d = draft.draftState();
  assert.equal(d.step, 'captain'); assert.equal(d.offer.length, 5);
  for (const id of d.offer) assert.ok(getPlayer(id).overall >= 84, 'captains are 84+');
  const cap = getPlayer(d.offer[2]);
  draft.chooseCaptain(cap.id);
  d = draft.draftState();
  const capSlot = d.lineup.indexOf(cap.id);
  assert.equal(FORMATIONS[d.formation][capSlot].pos, cap.position, 'the captain plays his own position');
  let picks = 0;
  while (d.step === 'pick') {
    assert.equal(d.offer.length, 5, `slot ${d.slot}`);
    const want = FORMATIONS[d.formation][d.slot].pos;
    for (const id of d.offer) {
      const p = getPlayer(id);
      assert.ok(p.overall >= 76 && !p.sbc);
      assert.equal(POSITIONS[p.position].group, POSITIONS[want].group, `${p.position} offered for ${want}`);
      assert.equal(p.position === 'GK', want === 'GK');
    }
    // the offer is saved: reading it again never re-rolls
    assert.deepEqual(draft.draftState().offer, d.offer);
    assert.ok(draft.choosePick('not-on-offer').error);
    draft.choosePick(d.offer[picks % 5]);
    picks += 1; d = draft.draftState();
  }
  assert.equal(picks, 10);
  assert.equal(d.step, 'cup'); assert.equal(d.opps.length, 4); assert.equal(new Set(d.opps).size, 4);
  const names = d.lineup.map((id) => getPlayer(id).name.toLowerCase());
  assert.equal(new Set(names).size, 11, 'eleven different footballers');
  const { rating, chem } = draft.draftRating(d);
  assert.ok(rating >= 76 && chem >= 0 && chem <= 100, `${rating} rated, ${chem} chemistry`);
});

test('the same seed drafts the same offers', () => {
  const a = draftAll(99).lineup;
  resetStorage(); resetAll();
  assert.deepEqual(draftAll(99).lineup, a);
});

test('four rounds that get harder; penalties settle a draw; a defeat ends it; the reward by wins', () => {
  const d = draftAll(5);
  const squad = draft.draftSquad(ID);
  assert.equal(squad.xi.length, 11); assert.equal(squad.name, 'Test XI');
  assert.ok(squad.xi.every((p) => typeof p.chem === 'number'), 'chemistry baked in');
  const o0 = draft.draftOpponent(d, 4);
  assert.equal(o0.name, 'Round of 16');
  assert.equal(o0.squad.xi.length, 11);
  assert.equal(draft.settleDraft(2, 1).won, true);
  const o1 = draft.draftOpponent(draft.draftState(), 4);
  assert.ok(o1.skill > o0.skill, 'sharper each round');
  const pens = draft.settleDraft(1, 1, true);
  assert.equal(pens.won, true); assert.equal(pens.pens, true); assert.equal(pens.next, 'Semi-final');
  const out = draft.settleDraft(0, 0, false);
  assert.deepEqual([out.won, out.done, out.wins], [false, true, 2], 'lost on penalties: out');
  assert.equal(draft.settleDraft(3, 0), null, 'nothing to play once it is done');

  const before = getState().club;
  const apex = before.apex; const packs = before.packs.length; const had = before.collection.length;
  const r = draft.collectDraft();
  assert.equal(r.wins, 2); assert.equal(r.pack, 'gold');
  assert.equal(getState().club.apex, apex + draft.DRAFT_REWARDS[2].apex);
  assert.equal(getState().club.packs.length, packs + 1);
  assert.equal(getState().club.draft, null);
  assert.deepEqual(getState().club.draftStats, { runs: 1, best: 2, titles: 0 });
  assert.equal(getState().club.collection.length, had, 'drafted cards never join the club');
  for (const id of d.lineup) assert.ok(!getState().club.collection.includes(id));
  assert.equal(draft.collectDraft(), null, 'collected once');
});

test('four wins is a title; walking away pays the wins so far', () => {
  draftAll(11);
  for (let i = 0; i < 4; i++) draft.settleDraft(1, 0);
  assert.equal(draft.draftState().step, 'done');
  const r = draft.collectDraft();
  assert.equal(r.pack, 'prime'); assert.equal(getState().club.draftStats.titles, 1);

  draftAll(12);
  draft.settleDraft(3, 2);
  draft.abandonDraft();
  assert.equal(draft.collectDraft().wins, 1);
  // walking away mid-draft
  fund(5000); draft.startDraft(); draft.abandonDraft();
  assert.equal(draft.collectDraft().apex, draft.DRAFT_REWARDS[0].apex);
});

test('a round still under way when the Draft screen opens again is a defeat', () => {
  draftAll(21);
  assert.equal(draft.settleUnfinished(), null, 'nothing under way yet');
  draft.markKickoff();
  draft.settleDraft(2, 0);
  assert.equal(draft.settleUnfinished(), null, 'that round finished');
  draft.markKickoff();
  const r = draft.settleUnfinished();
  assert.equal(r.won, false); assert.equal(draft.draftState().step, 'done');
  assert.deepEqual(draft.draftState().results.map((x) => x.won), [true, false]);
});
