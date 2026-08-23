import { WORLD } from './data/generator.js';
import { dealSlate, LADDER, REFRESH_MS, ULTIMATE_RUNGS } from './data/objectives.js';
import { pushSave } from './net/api.js';

const KEY = 'apexxi.save.v1';

/** What a brand new manager starts with, and what the reset below hands back. */
const START_APEX = 5_000;

/**
 * Bump this when a change makes existing Ultimate XI saves invalid, and every
 * save is wiped back to a fresh start exactly once. `flags.apology` is then set
 * so the mode can explain itself the next time it is opened, rather than the
 * player finding an empty club and drawing their own conclusions.
 *
 * `econ-2curr-1`: the split into Apex and Ultimate, packs repriced, and match
 * pay moved onto division and possession. Squads built against the old prices
 * were worth several times what the new ones cost to assemble.
 */
const RESET_TAG = 'econ-2curr-1';

const defaults = () => ({
  settings: {
    simSpeed: 'normal',      // instant | fast | normal
    commentary: true,
    reduceMotion: false,
    // Everything ships at the top setting. A phone that cannot hold it says so
    // in the frame rate, and the one-time prompt after the first full match
    // offers to turn it down — better than starting everyone on "safe" and
    // having nobody ever find out what the game actually looks like.
    quality: 'ultra',           // auto | low | high | ultra   (3D detail in a match)
    models: 'realistic',        // realistic | simple          (scanned mesh vs built-in figures)
    showFps: false,             // live frame counter in the match HUD
    graphicsAsked: false,       // the post-match "keep these graphics?" prompt fires once, ever
    sound: true,
    musicVol: 0.5,
    sfxVol: 0.9,
  },
  club: {                     // Squad Builder progress
    // Two balances. Apex is the one you earn and spend. Ultimate is the
    // premium currency: it is displayed, it is never granted, and nothing
    // costs it yet — it is here so the save format and the HUD already know
    // about it when it does become obtainable.
    apex: START_APEX,
    ultimate: 0,
    collection: [],           // player ids pulled from packs
    formation: '4-3-3',
    lineup: Array(11).fill(null),
    // Five seats. Stamina without a bench is a punishment with no answer to it.
    bench: Array(5).fill(null),
    packsOpened: 0,
    // A starting bundle, because the first thing the game asks for is eleven
    // players in the right positions and one pack cannot cover that. Only new
    // saves get these: an existing save brings its own `packs` through the
    // merge in loadState.
    packs: ['gold', 'silver', 'silver', 'bronze'],
    challengesDone: [],       // one-off SBCs already claimed
    /* The club you actually take onto the pitch.
     *
     * Ultimate XI used to be called "Ultimate XI" in a fixed cyan, on every
     * save, for everybody — the one mode built entirely out of your choices had
     * no identity of its own. The shape here is exactly what `crestSVG` already
     * consumes and exactly what `makeTeam`'s custom-squad path already accepts,
     * so this is a stored preference rather than a new system: the badge draws
     * itself and the two colours are what the kit shader tints from. */
    identity: {
      name: 'Ultimate XI',
      short: 'UXI',
      crest: { shape: 'shield', pattern: 'solid', device: 'star', colors: ['#41d3ff', '#0b1020'] },
    },
  },
  flags: {                    // one-off UI state that has to outlive a reload
    apology: false,           // show the "we reset your club" card once
    // which build's release notes this device has already been shown. Compared
    // against the newest entry in data/patchNotes.js, so a new release
    // announces itself exactly once and an existing one never does.
    notesSeen: null,
  },
  meta: { reset: RESET_TAG }, // which wipe this save has already been through
  career: null,               // set once a career is started
  ultimate: freshUltimate(),  // Ultimate XI progression
});

/* ---------------------------------------------------------------- *
 * Ultimate XI — Apex Division ladder, objectives and rewards
 * ---------------------------------------------------------------- */
export const DIVISIONS = [
  { id: 10, name: 'Division 10', need: 2, reward: 600 },
  { id: 9, name: 'Division 9', need: 2, reward: 800 },
  { id: 8, name: 'Division 8', need: 3, reward: 1000 },
  { id: 7, name: 'Division 7', need: 3, reward: 1300 },
  { id: 6, name: 'Division 6', need: 3, reward: 1600 },
  { id: 5, name: 'Division 5', need: 4, reward: 2000 },
  { id: 4, name: 'Division 4', need: 4, reward: 2600 },
  { id: 3, name: 'Division 3', need: 4, reward: 3200 },
  { id: 2, name: 'Division 2', need: 5, reward: 4000 },
  { id: 1, name: 'Division 1', need: 5, reward: 5200 },
  { id: 0, name: 'Apex Elite', need: 6, reward: 7500 },
];

export function freshUltimate() {
  return {
    divIdx: 0,          // index into DIVISIONS, 0 = Division 10
    progress: 0,        // wins banked toward the next division
    played: 0, wins: 0, draws: 0, losses: 0,
    streak: 0, bestStreak: 0,
    goalsFor: 0, goalsAgainst: 0,
    objectives: freshObjectives(),
    /* Which rungs of the ladder have been finished, and when the finished slots
       get refilled. Kept separately from the slate so the counter can read
       "6/24 done" — progress through the whole ladder, not through the seven
       currently on screen. */
    objClaimed: [],
    objRefresh: Date.now() + REFRESH_MS,
    packsOwed: 0,
  };
}

export function freshObjectives() {
  return dealSlate([]);
}

/**
 * Refill the finished slots, if the clock says so.
 *
 * Only the completed ones are replaced. An objective you are halfway through
 * keeps its progress and its place — a refresh rewards finishing things, it does
 * not reset the board. Returns true if anything actually changed.
 */
export function refreshObjectives(u, now = Date.now()) {
  if (!Array.isArray(u.objectives)) return false;
  if (!u.objRefresh) { u.objRefresh = now + REFRESH_MS; return false; }
  if (now < u.objRefresh) return false;

  const keep = u.objectives.filter((o) => o.done < o.need);
  u.objRefresh = now + REFRESH_MS;
  if (keep.length === u.objectives.length) return false;   // nothing was finished
  u.objectives = dealSlate(u.objClaimed || [], keep);
  return true;
}

/** Everything the ladder has, for the "x/32 done" counter. */
export const LADDER_SIZE = LADDER.length;
/** Re-exported so screens do not have to reach past state.js for one number. */
export { ULTIMATE_RUNGS };

let state = defaults();

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...defaults(), ...parsed };
      state.settings = { ...defaults().settings, ...(parsed.settings || {}) };
      state.club = { ...defaults().club, ...(parsed.club || {}) };
      state.ultimate = { ...freshUltimate(), ...(parsed.ultimate || {}) };
      state.flags = { ...defaults().flags, ...(parsed.flags || {}) };
      state.meta = { ...(parsed.meta || {}) };
      /* Objectives changed shape: they carry a `metric` now and are dealt from
         a 24-rung ladder. A save written before that holds the old seven, whose
         ids mean nothing to the new matcher, so it is redealt from the top.
         Nothing else in the save is touched — cards, coins and division stand. */
      if (!Array.isArray(state.ultimate.objectives)
          || !state.ultimate.objectives.every((o) => o && o.metric)) {
        state.ultimate.objectives = freshObjectives();
        state.ultimate.objClaimed = [];
        state.ultimate.objRefresh = Date.now() + REFRESH_MS;
      }
      if (!Array.isArray(state.ultimate.objClaimed)) state.ultimate.objClaimed = [];
      /* A stored refresh time can outlive the interval that set it — a save made
         while the gap was 24 hours would otherwise sit on that timer long after
         it became 12. Clamp it: the next refresh is never further away than one
         full interval from now. */
      const due = state.ultimate.objRefresh;
      if (!due || due > Date.now() + REFRESH_MS) state.ultimate.objRefresh = Date.now() + REFRESH_MS;
      // Persist the wipe the moment it happens. Leaving it in memory would mean
      // re-running it on the next load — and by then the player may have earned
      // something, which the second wipe would take back off them.
      if (applyReset(state)) {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
      }
    }
  } catch {
    state = defaults();
  }
  // A save from an older world could reference ids that no longer exist.
  if (!Array.isArray(state.club.packs)) state.club.packs = [];
  if (!Array.isArray(state.club.bench)) state.club.bench = Array(5).fill(null);
  if (!Array.isArray(state.club.challengesDone)) state.club.challengesDone = [];
  state.club.collection = state.club.collection.filter((id) => WORLD.playersById[id]);
  state.club.lineup = state.club.lineup.map((id) => (id && WORLD.playersById[id] ? id : null));
  state.club.bench = state.club.bench.map((id) => (id && WORLD.playersById[id] ? id : null));
  return state;
}

/**
 * The one-time wipe. Career is deliberately left alone: the reset is about the
 * Ultimate XI economy, and taking someone's season off them would be a second
 * apology to write.
 */
function applyReset(s) {
  if (s.meta?.reset === RESET_TAG) return false;
  s.club.apex = START_APEX;
  s.club.ultimate = 0;
  s.club.collection = [];
  s.club.lineup = Array(11).fill(null);
  s.club.bench = Array(5).fill(null);
  s.club.packsOpened = 0;
  s.club.packs = ['silver'];      // something to open the moment they read the note
  delete s.club.coins;            // the old single balance
  s.ultimate = freshUltimate();
  s.flags = { ...s.flags, apology: true };
  s.meta = { ...s.meta, reset: RESET_TAG };
  return true;
}

export const getState = () => state;

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage full or blocked — keep playing in memory */ }
  // Local first, cloud second: the game never waits on the network to save.
  pushSave(state);
}

/**
 * Replace local progress with a copy pulled from the account. Used once, right
 * after signing in — the cloud is the source of truth across devices.
 */
export function adoptCloudSave(cloud) {
  if (!cloud || typeof cloud !== 'object') return false;
  state = { ...defaults(), ...cloud };
  state.settings = { ...defaults().settings, ...(cloud.settings || {}) };
  state.club = { ...defaults().club, ...(cloud.club || {}) };
  state.ultimate = { ...freshUltimate(), ...(cloud.ultimate || {}) };
  state.flags = { ...defaults().flags, ...(cloud.flags || {}) };
  state.meta = { ...(cloud.meta || {}) };
  if (!Array.isArray(state.ultimate.objectives)) state.ultimate.objectives = freshObjectives();
  // a save pulled from the cloud may predate the wipe even when this device's
  // local copy did not
  applyReset(state);
  if (!Array.isArray(state.club.packs)) state.club.packs = [];
  state.club.collection = state.club.collection.filter((id) => WORLD.playersById[id]);
  state.club.lineup = state.club.lineup.map((id) => (id && WORLD.playersById[id] ? id : null));
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  return true;
}

/** Rough "how much progress is this" score, used to resolve save conflicts. */
export function saveWeight(s) {
  if (!s) return -1;
  const u = s.ultimate || {};
  const c = s.club || {};
  return (u.played || 0) * 10 + (c.collection?.length || 0) + (c.packsOpened || 0) * 2;
}

export function update(fn) {
  fn(state);
  save();
  return state;
}

export function resetAll() {
  state = defaults();
  save();
}

/* ---------------------------------------------------------------- *
 * Career helpers
 * ---------------------------------------------------------------- */
export function newCareer(clubId) {
  const club = WORLD.clubsById[clubId];
  state.career = {
    clubId,
    season: 1,
    matchday: 1,
    budget: club.budget,
    squad: club.roster.slice(),
    results: [],                                  // { matchday, home, away, hg, ag }
    table: Object.fromEntries(WORLD.clubs.map((c) => [c.id, blankRow()])),
    transfersIn: [],
    transfersOut: [],
    sold: [],                                     // ids sold away, hidden from market
    history: [],
  };
  save();
  return state.career;
}

export const blankRow = () => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

export function applyResult(career, homeId, awayId, hg, ag) {
  const H = career.table[homeId];
  const A = career.table[awayId];
  H.p++; A.p++;
  H.gf += hg; H.ga += ag;
  A.gf += ag; A.ga += hg;
  if (hg > ag) { H.w++; H.pts += 3; A.l++; }
  else if (hg < ag) { A.w++; A.pts += 3; H.l++; }
  else { H.d++; A.d++; H.pts++; A.pts++; }
}

export function sortedTable(career) {
  return WORLD.clubs
    .map((c) => ({ club: c, ...career.table[c.id], gd: career.table[c.id].gf - career.table[c.id].ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.club.name.localeCompare(b.club.name));
}
