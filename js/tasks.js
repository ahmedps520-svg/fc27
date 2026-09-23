/**
 * Objectives, the whole shelf (v80): daily, weekly, the season (the Season
 * Pass, progress.js) and milestones (the objective ladder and achievements) —
 * plus a club level with its own reward track.
 *
 *  - **Daily**: three a day, dealt from a pool by the date, reset at midnight UTC.
 *  - **Weekly**: five a week, bigger asks, reset on the week boundary.
 *  - **Club level**: every XP point the club ever earns counts (the Season Pass
 *    uses the same XP and resets; this does not). Each level pays Apex, every
 *    fifth a pack, every twenty-fifth something special, up to level 100.
 *
 * A task is `{ id, text, metric, need, apex, xp, pack? }`; `bump(metric, n)` is
 * called from the places things happen (a match, a pack, a trade, an
 * evolution stage) and moves every live task with that metric.
 */
import { getState, update } from './state.js';

const DAY = 86_400_000; const WEEK = 7 * DAY;
const T = (id, text, metric, need, apex, xp, pack = null) => ({ id, text, metric, need, apex, xp, pack });

export const DAILY_POOL = [
  T('d-win', 'Win a match', 'win', 1, 800, 60),
  T('d-play2', 'Play 2 matches', 'played', 2, 600, 50),
  T('d-goals', 'Score 4 goals', 'goal', 4, 900, 60),
  T('d-fives', 'Play a Quickfire Fives match', 'fives', 1, 700, 50),
  T('d-clash', 'Play a Squad Clash match', 'clash', 1, 900, 60),
  T('d-pack', 'Open a pack', 'pack', 1, 500, 40),
  T('d-market', 'Buy or sell on the market', 'trade', 1, 700, 50),
  T('d-clean', 'Keep a clean sheet', 'clean', 1, 900, 60),
  T('d-evo', 'Complete an evolution stage', 'evo', 1, 1000, 70),
];
export const WEEKLY_POOL = [
  T('w-win5', 'Win 5 matches', 'win', 5, 5000, 300, 'gold'),
  T('w-goals15', 'Score 15 goals', 'goal', 15, 5000, 300),
  T('w-fives5', 'Play 5 Quickfire Fives matches', 'fives', 5, 4000, 250),
  T('w-clash6', 'Play 6 Squad Clash matches', 'clash', 6, 6000, 350, 'inform'),
  T('w-packs5', 'Open 5 packs', 'pack', 5, 3000, 200),
  T('w-trade3', 'Make 3 market trades', 'trade', 3, 4000, 250),
  T('w-clean3', 'Keep 3 clean sheets', 'clean', 3, 5000, 300, 'gold'),
  T('w-evo3', 'Complete 3 evolution stages', 'evo', 3, 6000, 350, 'campaign'),
  T('w-sets', 'Complete a binder set', 'set', 1, 5000, 300),
];

function h32(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
const deal = (pool, n, key) => pool.slice().sort((a, b) => h32(`${key}|${a.id}`) - h32(`${key}|${b.id}`)).slice(0, n);

export const dayKey = (now = Date.now()) => Math.floor(now / DAY);
export const weekKey = (now = Date.now()) => Math.floor(now / WEEK);

function board(s, now) {
  const b = s.club.tasks || (s.club.tasks = {});
  const d = dayKey(now); const w = weekKey(now);
  if (b.day !== d) { b.day = d; b.daily = deal(DAILY_POOL, 3, `d${d}`).map((t) => ({ id: t.id, have: 0, claimed: false })); }
  if (b.week !== w) { b.week = w; b.weekly = deal(WEEKLY_POOL, 5, `w${w}`).map((t) => ({ id: t.id, have: 0, claimed: false })); }
  return b;
}
const defOf = (id) => DAILY_POOL.find((t) => t.id === id) || WEEKLY_POOL.find((t) => t.id === id);

/** The live tasks with their definitions. */
export function taskBoard(now = Date.now()) {
  let out;
  update((s) => {
    const b = board(s, now);
    const view = (list) => list.map((x) => ({ ...defOf(x.id), have: Math.min(x.have, defOf(x.id).need), claimed: x.claimed }));
    out = { daily: view(b.daily), weekly: view(b.weekly), dayEndsIn: (dayKey(now) + 1) * DAY - now, weekEndsIn: (weekKey(now) + 1) * WEEK - now };
  });
  return out;
}

/** Something happened: move every live task that counts it. */
export function bump(metric, n = 1, now = Date.now()) {
  if (!n) return;
  update((s) => {
    const b = board(s, now);
    for (const x of [...b.daily, ...b.weekly]) if (defOf(x.id)?.metric === metric && !x.claimed) x.have += n;
  });
}

export function claimTask(id, now = Date.now()) {
  let res = { ok: false };
  update((s) => {
    const b = board(s, now);
    const x = [...b.daily, ...b.weekly].find((t) => t.id === id);
    const d = defOf(id);
    if (!x || !d || x.claimed || x.have < d.need) return;
    x.claimed = true;
    s.club.apex += d.apex;
    if (d.pack) s.club.packs.push(d.pack);
    res = { ok: true, apex: d.apex, pack: d.pack, xp: d.xp };
  });
  if (res.ok) addClubXP(res.xp);
  return res;
}

/* -------------------------------- club level -------------------------------- */
export const LEVEL_MAX = 100;
/** XP from one level to the next: 400 at level 1, rising 60 a level. */
export const xpForLevel = (l) => 400 + (l - 1) * 60;
export function levelFromXP(xp) {
  let l = 1; let left = xp || 0;
  while (l < LEVEL_MAX && left >= xpForLevel(l)) { left -= xpForLevel(l); l += 1; }
  return { level: l, into: left, need: l >= LEVEL_MAX ? 0 : xpForLevel(l) };
}
/** What reaching a level pays. */
export function levelReward(l) {
  if (l % 25 === 0) return { apex: 25000, packs: ['vault'], text: 'Legends Vault + ◈25,000' };
  if (l % 10 === 0) return { apex: 10000, packs: ['campaign'], text: 'Campaign pack + ◈10,000' };
  if (l % 5 === 0) return { apex: 4000, packs: ['gold'], text: 'Gold pack + ◈4,000' };
  return { apex: 800 + l * 40, packs: [], text: `◈${(800 + l * 40).toLocaleString()}` };
}
/** Add club XP; levels reached are paid straight away. Returns the levels gained. */
export function addClubXP(n) {
  if (!n) return [];
  const gained = [];
  update((s) => {
    const before = levelFromXP(s.club.xpTotal || 0).level;
    s.club.xpTotal = (s.club.xpTotal || 0) + n;
    const after = levelFromXP(s.club.xpTotal).level;
    for (let l = before + 1; l <= after; l++) {
      const r = levelReward(l);
      s.club.apex += r.apex; for (const pk of r.packs) s.club.packs.push(pk);
      gained.push({ level: l, ...r });
    }
  });
  return gained;
}
export function clubLevel() { return levelFromXP(getState().club.xpTotal || 0); }
