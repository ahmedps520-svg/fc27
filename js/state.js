import { WORLD } from './data/generator.js';
import { pushSave } from './net/api.js';

const KEY = 'apexxi.save.v1';

const defaults = () => ({
  settings: {
    simSpeed: 'normal',      // instant | fast | normal
    commentary: true,
    reduceMotion: false,
    accent: 'cyan',
    quality: 'auto',            // auto | high | low  (3D detail in Quick Match)
    sound: true,
    musicVol: 0.5,
    sfxVol: 0.9,
  },
  club: {                     // Squad Builder progress
    coins: 12_500,
    collection: [],           // player ids pulled from packs
    formation: '4-3-3',
    lineup: Array(11).fill(null),
    packsOpened: 0,
    packs: [],                // unopened packs you own: ['silver', 'gold', ...]
  },
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
    packsOwed: 0,
  };
}

export function freshObjectives() {
  return [
    { id: 'win3', text: 'Win 3 Apex Division matches', need: 3, done: 0, coins: 1200, pack: 'silver' },
    { id: 'score8', text: 'Score 8 goals in the division', need: 8, done: 0, coins: 1500, pack: 'gold' },
    { id: 'streak3', text: 'Win 3 in a row', need: 3, done: 0, coins: 2500, pack: 'gold' },
    { id: 'clean2', text: 'Keep 2 clean sheets', need: 2, done: 0, coins: 1800, pack: 'silver' },
    { id: 'div5', text: 'Reach Division 5', need: 1, done: 0, coins: 4000, pack: 'prime' },
  ];
}

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
      if (!Array.isArray(state.ultimate.objectives)) state.ultimate.objectives = freshObjectives();
    }
  } catch {
    state = defaults();
  }
  // A save from an older world could reference ids that no longer exist.
  if (!Array.isArray(state.club.packs)) state.club.packs = [];
  state.club.collection = state.club.collection.filter((id) => WORLD.playersById[id]);
  state.club.lineup = state.club.lineup.map((id) => (id && WORLD.playersById[id] ? id : null));
  return state;
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
  if (!Array.isArray(state.ultimate.objectives)) state.ultimate.objectives = freshObjectives();
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
