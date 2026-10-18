/**
 * v196: the Draft — an Ultimate XI run with cards you do not own.
 *
 * Pay the entry, pick a formation from three, a captain from five, then the
 * other ten one slot at a time, each from five cards for that slot. The
 * squad then plays four knockout rounds against themed sides (modes.js
 * `clashSquad`) that get stronger each round; a draw goes to penalties and a
 * defeat ends the run. The wins set the reward. The drafted cards are never
 * added to the club: what you keep is the reward.
 *
 * Every offer is drawn once and saved with the run, so leaving and coming
 * back never re-rolls a choice.
 */
import { getState, update } from './state.js';
import { WORLD, getPlayer } from './data/generator.js';
import { FORMATIONS, POSITIONS } from './data/pools.js';
import { chemistryFor, moddedRef } from './data/chemistry.js';
import { CLASH_THEMES, clashSquad } from './modes.js';
import { divisionSkill } from './ultimate.js';

export const DRAFT_ENTRY = 3000;
export const DRAFT_ROUNDS = ['Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
/** By wins, 0–4. With the entry, a run that goes out first costs ◈2,400; a title nets ◈5,000 and a Prime pack. */
export const DRAFT_REWARDS = [
  { wins: 0, apex: 600, pack: null },
  { wins: 1, apex: 1500, pack: 'silver' },
  { wins: 2, apex: 3000, pack: 'gold' },
  { wins: 3, apex: 5000, pack: 'gold' },
  { wins: 4, apex: 8000, pack: 'prime' },
];
export const DRAFT_DURATION = 180;
/** Each round's side, against your draft's rating, and how much sharper it plays than your division. */
const ROUND_RATING = [-3, -1, 1, 3];
const ROUND_SKILL = [-0.1, 0, 0.1, 0.2];
const OFFER = 5;

function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rngFor = (d, salt) => { let h = d.seed >>> 0; for (const c of String(salt)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return mulberry32(h); };

/* The cards a draft can offer: no SBC rewards, nothing below 76. */
let POOL = null;
const pool = () => POOL || (POOL = WORLD.players.filter((p) => !p.sbc && p.overall >= 76));
const tierOf = (p) => (p.rarity === 'icon' ? 'icon' : p.overall >= 88 ? 'elite' : p.overall >= 84 ? 'high' : 'base');
const groupOf = (pos) => POSITIONS[pos]?.group;
const baseName = (p) => String(p.name).toLowerCase();

/**
 * Five cards for one slot. Each is rolled a tier first — mostly 76–83, a
 * quarter 84–87, now and then an 88+, rarely an icon — then a card of the
 * slot's position in it (its group when the position has none), never a
 * footballer already in the squad or already on offer.
 */
function offerFor(pos, taken, rnd, odds) {
  const out = [];
  const seen = new Set(taken);
  for (let i = 0; i < OFFER; i++) {
    const r = rnd();
    const tier = r < odds.icon ? 'icon' : r < odds.icon + odds.elite ? 'elite' : r < odds.icon + odds.elite + odds.high ? 'high' : 'base';
    const fits = (p) => !seen.has(baseName(p));
    let c = pool().filter((p) => p.position === pos && tierOf(p) === tier && fits(p));
    if (!c.length) c = pool().filter((p) => groupOf(p.position) === groupOf(pos) && tierOf(p) === tier && fits(p) && (pos === 'GK') === (p.position === 'GK'));
    if (!c.length) c = pool().filter((p) => p.position === pos && fits(p));
    if (!c.length) continue;
    const p = c[Math.floor(rnd() * c.length)];
    seen.add(baseName(p)); out.push(p.id);
  }
  return out;
}
const PICK_ODDS = { icon: 0.015, elite: 0.08, high: 0.25 };
const CAPTAIN_ODDS = { icon: 0.06, elite: 0.5, high: 0.44 };

export const draftState = () => getState().club.draft || null;

/** The squad as drafted so far: names already in it, the slot being filled next. */
const takenNames = (d) => d.lineup.filter(Boolean).map((id) => baseName(getPlayer(id) || { name: id }));
const nextSlot = (d) => d.lineup.findIndex((x) => !x);

export function startDraft(now = Date.now(), seed = (Math.random() * 2 ** 32) >>> 0) {
  let out = null;
  update((s) => {
    if (s.club.draft) { out = { error: 'Finish the draft you are in first.' }; return; }
    if ((s.club.apex | 0) < DRAFT_ENTRY) { out = { error: `A draft costs ◈${DRAFT_ENTRY.toLocaleString()}.` }; return; }
    s.club.apex -= DRAFT_ENTRY;
    const d = { v: 1, seed, at: now, step: 'formation', formations: [], formation: null, offer: [], lineup: Array(11).fill(null), captain: null, round: 0, wins: 0, results: [], opps: [] };
    const rnd = rngFor(d, 'formations');
    d.formations = Object.keys(FORMATIONS).sort(() => rnd() - 0.5).slice(0, 3);
    s.club.draft = d;
    out = { draft: d };
  });
  return out;
}

export function chooseFormation(name) {
  let out = null;
  update((s) => {
    const d = s.club.draft;
    if (!d || d.step !== 'formation' || !d.formations.includes(name)) { out = { error: 'Not a choice.' }; return; }
    d.formation = name;
    // five captains, each for a different slot of the shape where it can
    const rnd = rngFor(d, 'captain');
    const slots = [...new Set(FORMATIONS[name].map((x) => x.pos))].sort(() => rnd() - 0.5);
    const offer = [];
    for (let i = 0; i < OFFER; i++) {
      const [id] = offerFor(slots[i % slots.length], offer.map((x) => baseName(getPlayer(x))), rnd, CAPTAIN_ODDS);
      if (id) offer.push(id);
    }
    d.offer = offer; d.step = 'captain';
    out = { draft: d };
  });
  return out;
}

/** The slot a captain takes: one of his own position, else his group's. */
function captainSlot(formation, p) {
  const slots = FORMATIONS[formation];
  let i = slots.findIndex((x) => x.pos === p.position);
  if (i < 0) i = slots.findIndex((x) => groupOf(x.pos) === groupOf(p.position) && (x.pos === 'GK') === (p.position === 'GK'));
  return i < 0 ? 1 : i;
}

function offerNext(d) {
  const slot = nextSlot(d);
  if (slot < 0) {
    // drafted: four rounds, four different themed sides
    const rnd = rngFor(d, 'opps');
    d.opps = CLASH_THEMES.map((x) => x.id).sort(() => rnd() - 0.5).slice(0, DRAFT_ROUNDS.length);
    d.offer = []; d.slot = null; d.step = 'cup';
    return;
  }
  d.slot = slot;
  d.offer = offerFor(FORMATIONS[d.formation][slot].pos, takenNames(d), rngFor(d, `slot${slot}`), PICK_ODDS);
}

export function chooseCaptain(id) {
  let out = null;
  update((s) => {
    const d = s.club.draft;
    if (!d || d.step !== 'captain' || !d.offer.includes(id)) { out = { error: 'Not a choice.' }; return; }
    const p = getPlayer(id);
    d.captain = id;
    d.lineup[captainSlot(d.formation, p)] = id;
    d.step = 'pick';
    offerNext(d);
    out = { draft: d };
  });
  return out;
}

export function choosePick(id) {
  let out = null;
  update((s) => {
    const d = s.club.draft;
    if (!d || d.step !== 'pick' || !d.offer.includes(id) || d.slot == null) { out = { error: 'Not a choice.' }; return; }
    d.lineup[d.slot] = id;
    offerNext(d);
    out = { draft: d };
  });
  return out;
}

/** The draft's rating and chemistry, as the squad screen counts them. */
export function draftRating(d = draftState()) {
  if (!d?.formation) return { rating: 0, chem: 0, per: [] };
  const c = chemistryFor(d.lineup, d.formation);
  return { rating: c.rating, chem: c.team, per: c.per };
}

/** The eleven handed to the match: chemistry baked into copies, like ultimateSquad(). */
export function draftSquad(identity, d = draftState()) {
  if (!d || d.step !== 'cup') return null;
  const { per } = draftRating(d);
  const xi = d.lineup.map((id, i) => moddedRef(getPlayer(id), { chem: per[i] }));
  return { xi, bench: [], name: identity.name, short: identity.short, colors: identity.crest.colors, crest: identity.crest, kit: identity.kit };
}

/** This round's side and how hard it plays: rated off your draft, sharpened off your division. */
export function draftOpponent(d = draftState(), divIdx = getState().ultimate?.divIdx || 0) {
  if (!d || d.step !== 'cup') return null;
  const { rating } = draftRating(d);
  const target = Math.max(60, Math.min(95, rating + ROUND_RATING[d.round]));
  const base = Math.max(0.9, Math.min(1.5, divisionSkill(divIdx)));
  return { squad: clashSquad(d.opps[d.round], target), skill: Math.round((base + ROUND_SKILL[d.round]) * 100) / 100, round: d.round, name: DRAFT_ROUNDS[d.round] };
}

/**
 * Kick-off: the round is under way. A round still under way when the Draft
 * screen next opens (the app was closed mid-match) was left unfinished, and
 * counts as a defeat, as leaving from the pause menu does — otherwise a
 * losing round could be replayed by closing the app.
 */
export function markKickoff() { update((s) => { const d = s.club.draft; if (d?.step === 'cup') d.live = d.round; }); }
export function settleUnfinished() {
  const d = draftState();
  return d?.step === 'cup' && d.live === d.round ? settleDraft(0, 1) : null;
}

/**
 * A round's result. A draw is decided on penalties (`pensWon`); a defeat, or
 * the fourth win, ends the run and leaves the reward to collect.
 */
export function settleDraft(scored, conceded, pensWon = null) {
  let out = null;
  update((s) => {
    const d = s.club.draft;
    if (!d || d.step !== 'cup') return;
    const pens = scored === conceded;
    const won = scored > conceded || (pens && !!pensWon);
    d.results.push({ round: d.round, opp: d.opps[d.round], scored, conceded, pens, won });
    if (won) d.wins += 1;
    d.round += 1; d.live = null;
    if (!won || d.round >= DRAFT_ROUNDS.length) d.step = 'done';
    out = { won, pens, wins: d.wins, done: d.step === 'done', champion: d.wins >= DRAFT_ROUNDS.length, next: d.step === 'done' ? null : DRAFT_ROUNDS[d.round] };
  });
  return out;
}

/** Walk away: the run ends where it stands, and pays for the wins so far. */
export function abandonDraft() {
  update((s) => { const d = s.club.draft; if (d && d.step !== 'done') d.step = 'done'; });
}

export const rewardFor = (wins) => DRAFT_REWARDS[Math.max(0, Math.min(DRAFT_REWARDS.length - 1, wins | 0))];

export function collectDraft() {
  let got = null;
  update((s) => {
    const d = s.club.draft;
    if (!d || d.step !== 'done') return;
    const r = rewardFor(d.wins);
    s.club.apex += r.apex;
    if (r.pack) s.club.packs.push(r.pack);
    const st = s.club.draftStats || (s.club.draftStats = { runs: 0, best: 0, titles: 0 });
    st.runs += 1; st.best = Math.max(st.best, d.wins); if (d.wins >= DRAFT_ROUNDS.length) st.titles += 1;
    s.club.draft = null;
    got = { ...r, wins: d.wins };
  });
  return got;
}
