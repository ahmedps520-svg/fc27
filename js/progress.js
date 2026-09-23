/**
 * Progress: the one place a thing that happened turns into everything it
 * counts for.
 *
 * A match ends, a pack opens, a challenge is submitted — the screen that did
 * it calls one function here, and this feeds the counters achievements read,
 * the season XP, the week's event objectives, the Weekend League tally and
 * the daily login. Screens never touch those directly, so a new reward
 * system is a new paragraph here and nowhere else.
 *
 * Everything pays into `club.pending` — a list of things to claim on the
 * Today hub — rather than straight into the balance, so a player sees what
 * they earned and why, and the hub has a reason to exist.
 */
import { getState, update } from './state.js';
import { levelFromXP, levelReward, bump as bumpTask } from './tasks.js';
import { WORLD } from './data/generator.js';
import { ACHIEVEMENTS, evaluateAll } from './data/achievements.js';
import { XP, TIER_XP, TIERS } from './data/season.js';
import { activeEvent, eventKey, season } from './live.js';
import { currentWeekend, WL_MATCHES, rankFor } from './weekend.js';

const today = (d = new Date()) => d.toISOString().slice(0, 10);

/** Rewards on the seven-day login calendar; day 7 repeats. */
export const DAILY = [
  { apex: 300 }, { apex: 500 }, { pack: 'bronze' }, { apex: 800 },
  { pack: 'silver' }, { apex: 1200 }, { pack: 'gold', apex: 1000 },
];

/* ------------------------------------------------------------------ */
function stats(s) {
  if (!s.club.stats) s.club.stats = {};
  return s.club.stats;
}
const bump = (s, k, n = 1) => { stats(s)[k] = (stats(s)[k] | 0) + n; };
const peak = (s, k, v) => { stats(s)[k] = Math.max(stats(s)[k] | 0, v); };

/** Add season XP; returns the tiers crossed. */
export function addXP(s, n, why = '') {
  const se = season();
  if (!s.club.season || s.club.season.id !== se.id) {
    if (s.club.season?.xp) peak(s, 'bestTier', Math.floor(s.club.season.xp / TIER_XP));
    s.club.season = { id: se.id, xp: 0, claimed: [] };
  }
  const before = Math.floor(s.club.season.xp / TIER_XP);
  s.club.season.xp += n;
  // v80: the club level counts every XP point for good, and pays each level as it comes
  if (n > 0) {
    const lb = levelFromXP(s.club.xpTotal || 0).level;
    s.club.xpTotal = (s.club.xpTotal || 0) + n;
    const la = levelFromXP(s.club.xpTotal).level;
    for (let l = lb + 1; l <= la; l++) {
      const r = levelReward(l);
      s.club.apex += r.apex; for (const pk of r.packs) s.club.packs.push(pk);
      pend(s, { kind: 'level', title: `Club level ${l}`, sub: r.text, apex: 0 });
    }
  }
  const after = Math.min(TIERS, Math.floor(s.club.season.xp / TIER_XP));
  peak(s, 'bestTier', after);
  if (n) s.club.xpLog = [...(s.club.xpLog || []).slice(-9), { n, why, at: Date.now() }];
  return Math.max(0, after - before);
}

/** Event objective progress for the active event; pays into pending. */
function eventGain(s, gain) {
  const ev = activeEvent();
  if (!ev?.objectives) return;
  const key = eventKey(ev);
  if (!s.club.events) s.club.events = {};
  const slot = s.club.events[key] || (s.club.events[key] = { done: {}, claimed: [] });
  for (const o of ev.objectives) {
    if (slot.claimed.includes(o.id)) continue;
    const had = slot.done[o.id] | 0;
    if (had >= o.need) continue;
    const now = Math.min(o.need, had + (gain[o.metric] | 0));
    slot.done[o.id] = now;
    if (now >= o.need) {
      slot.claimed.push(o.id);
      bump(s, 'eventObjectives');
      addXP(s, o.xp || XP.eventObjective, o.text);
      pend(s, { kind: 'event', title: o.text, sub: ev.name, apex: o.apex || 0 });
    }
  }
}

/** Queue a claimable reward. */
export function pend(s, item) {
  if (!Array.isArray(s.club.pending)) s.club.pending = [];
  s.club.pending.push({ id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), ...item });
}

/** Achievements that just completed get a pending reward, once. */
function checkAchievements(s) {
  if (!s.club.achievements) s.club.achievements = {};
  const all = evaluateAll(s, WORLD.playersById);
  for (const a of all) {
    if (!a.complete || s.club.achievements[a.id]) continue;
    s.club.achievements[a.id] = { at: Date.now(), claimed: false };
    addXP(s, a.xp, a.name);
  }
}

/* ------------------------------------------------------------------ *
 * Hooks
 * ------------------------------------------------------------------ */
/**
 * A match has finished. `mode`: 'single' | 'ultimate' | 'career' | 'weekend'
 * | 'online'. Scores are from the player's point of view.
 */
export function onMatch({ mode, scored, conceded, online = false, possession = 50, weekend = false, sub = null }) {
  const won = scored > conceded;
  const drew = scored === conceded;
  let tiers = 0;
  // v80: the daily and weekly tasks
  bumpTask('played'); if (won) bumpTask('win'); bumpTask('goal', scored); if (conceded === 0) bumpTask('clean');
  if (sub === 'fives') bumpTask('fives'); if (sub === 'clash') bumpTask('clash');
  update((s) => {
    bump(s, 'matches'); if (won) bump(s, 'wins');
    bump(s, 'goals', scored);
    if (conceded === 0) bump(s, 'cleanSheets');
    if (scored >= 3) bump(s, 'hatTricks');
    if (won && scored - conceded >= 3) bump(s, 'bigWins');
    if (online) { bump(s, 'onlineMatches'); if (won) bump(s, 'onlineWins'); }
    if (mode === 'career') { bump(s, 'careerMatches'); if (won) bump(s, 'careerWins'); }
    tiers += addXP(s, XP.match + (won ? XP.win : 0) + Math.min(XP.goalCap, scored * XP.goal), 'match');
    eventGain(s, { played: 1, win: won ? 1 : 0, goal: scored, clean: conceded === 0 ? 1 : 0, bigwin: won && scored - conceded >= 3 ? 1 : 0 });

    // Weekend League: the tally, when a match counts for it
    const { window: w, tally } = currentWeekend(s.club);
    if ((weekend || (online && mode === 'ultimate')) && w.open && tally.played < WL_MATCHES) {
      tally.played += 1;
      if (won) tally.wins += 1; else if (drew) tally.draws += 1; else tally.losses += 1;
      tally.goalsFor += scored; tally.goalsAgainst += conceded;
      bump(s, 'wlPlayed');
      peak(s, 'wlBest', tally.wins);
      tiers += addXP(s, XP.weekendMatch, 'weekend');
    }
    checkAchievements(s);
  });
  return { tiers };
}

/** Packs opened: `drawn` is the openPack result, `pack` the pack def. */
export function onPack(pack, drawn) {
  bumpTask('pack');
  update((s) => {
    if (pack.event) {
      eventGain(s, { eventPack: 1 });
      const ev = activeEvent();
      const feat = ev?.featured;
      if (feat && ev.id === pack.event) {
        const hit = drawn.find(({ p }) => p.name === feat.player);
        if (hit) {
          if (!s.club.upgrades) s.club.upgrades = {};
          s.club.upgrades[hit.p.id] = Math.max(s.club.upgrades[hit.p.id] | 0, feat.boost | 0);
          bump(s, 'featured');
          pend(s, { kind: 'featured', title: `Featured: ${hit.p.name} +${feat.boost}`, sub: ev.name, apex: 0 });
        }
      }
    }
    // duplicates are evolve material now as well as coins
    if (!s.club.dupes) s.club.dupes = {};
    for (const { p, dup } of drawn) if (dup) s.club.dupes[p.id] = (s.club.dupes[p.id] | 0) + 1;
    checkAchievements(s);
  });
}

export function onSbc(challenge) {
  update((s) => {
    bump(s, 'sbcDone');
    if (challenge.reward?.card) bump(s, 'sbcLegends');
    addXP(s, XP.sbc, challenge.name);
    checkAchievements(s);
  });
}

export function onObjective(count = 1) {
  update((s) => { addXP(s, XP.objective * count, 'objective'); checkAchievements(s); });
}

export function onCareer(kind) {
  update((s) => {
    if (kind === 'start') bump(s, 'careers');
    if (kind === 'sign') bump(s, 'careerSigns');
    if (kind === 'season') bump(s, 'careerSeasons');
    checkAchievements(s);
  });
}

export function onEvolve(level, max) {
  update((s) => { bump(s, 'evolves'); if (level >= max) bump(s, 'maxed'); checkAchievements(s); });
}

export function onChemistry(team) {
  if (team < 100) return;
  update((s) => { if (!(stats(s).perfectChem | 0)) { bump(s, 'perfectChem'); checkAchievements(s); } });
}

/* ------------------------------------------------------------------ *
 * Daily login
 * ------------------------------------------------------------------ */
/** The calendar as it stands; call before rendering. Rolls the day over. */
export function dailyStatus(now = new Date()) {
  const t = today(now);
  const y = today(new Date(now.getTime() - 864e5));
  let out;
  update((s) => {
    const d = s.club.daily || (s.club.daily = { last: null, streak: 0, best: 0, claimedOn: null });
    if (d.last !== t) {
      d.streak = d.last === y ? d.streak + 1 : 1;
      d.last = t;
      d.best = Math.max(d.best | 0, d.streak);
    }
    out = { streak: d.streak, best: d.best, day: ((d.streak - 1) % 7) + 1, claimable: d.claimedOn !== t };
  });
  return out;
}

/** Claim today's login reward. Returns the reward or null. */
export function claimDaily(now = new Date()) {
  const st = dailyStatus(now);
  if (!st.claimable) return null;
  const reward = DAILY[st.day - 1];
  update((s) => {
    s.club.daily.claimedOn = today(now);
    if (reward.apex) s.club.apex += reward.apex;
    if (reward.pack) s.club.packs.push(reward.pack);
    addXP(s, XP.daily, 'daily login');
    checkAchievements(s);
  });
  return reward;
}

/* ------------------------------------------------------------------ *
 * Claims
 * ------------------------------------------------------------------ */
export function claimPending(id) {
  let got = null;
  update((s) => {
    const i = (s.club.pending || []).findIndex((p) => p.id === id);
    if (i < 0) return;
    [got] = s.club.pending.splice(i, 1);
    if (got.apex) s.club.apex += got.apex;
    if (got.pack) s.club.packs.push(got.pack);
    if (got.ultimate) s.club.ultimate = (s.club.ultimate || 0) + got.ultimate;
  });
  return got;
}

export function claimAchievement(id) {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  let ok = false;
  update((s) => {
    const rec = s.club.achievements?.[id];
    if (!a || !rec || rec.claimed) return;
    rec.claimed = true;
    s.club.apex += a.apex;
    ok = true;
  });
  return ok ? a : null;
}

export function claimTier(tier) {
  const se = season();
  let reward = null;
  update((s) => {
    const sp = s.club.season;
    if (!sp || sp.id !== se.id) return;
    if (tier < 1 || tier > TIERS || Math.floor(sp.xp / TIER_XP) < tier || sp.claimed.includes(tier)) return;
    reward = se.tiers[tier - 1];
    sp.claimed.push(tier);
    if (reward.apex) s.club.apex += reward.apex;
    if (reward.pack) s.club.packs.push(reward.pack);
    if (reward.ultimate) s.club.ultimate = (s.club.ultimate || 0) + reward.ultimate;
  });
  return reward;
}

export function claimWeekend() {
  let out = null;
  update((s) => {
    const { window: w } = currentWeekend(s.club);
    const done = s.club.weekendPending || (!w.open && s.club.weekend?.played ? s.club.weekend : null);
    if (!done || done.claimed) return;
    const rank = rankFor(done.wins);
    done.claimed = true;
    s.club.apex += rank.apex;
    for (const p of rank.packs) s.club.packs.push(p);
    if (rank.ultimate) s.club.ultimate = (s.club.ultimate || 0) + rank.ultimate;
    if (s.club.weekendPending === done) s.club.weekendPending = null;
    out = { rank, tally: done };
  });
  return out;
}

/** Everything waiting to be claimed, for badges. */
export function claimableCount() {
  const s = getState();
  const se = season();
  const tier = Math.floor((s.club.season?.id === se.id ? s.club.season.xp : 0) / TIER_XP);
  const tiers = Math.max(0, Math.min(TIERS, tier) - (s.club.season?.claimed?.length || 0));
  const ach = Object.values(s.club.achievements || {}).filter((r) => !r.claimed).length;
  const pending = (s.club.pending || []).length;
  const daily = dailyStatus().claimable ? 1 : 0;
  return tiers + ach + pending + daily;
}
