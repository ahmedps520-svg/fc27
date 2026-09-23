/**
 * Evolutions (v80).
 *
 * Pick a card that fits a track, play Ultimate XI matches, and the card grows
 * along a path you can see: each stage is an in-match challenge (goals,
 * assists, wins, clean sheets, appearances) and pays out stat points, a
 * rating point or two, sometimes a signature trait, and a stage of glow on
 * the card. Up to three tracks can run at once, one card each. A finished
 * evolution is the card's for good.
 *
 * The older one-level-at-a-time upgrade (`evolve.js`, dupes or Apex) is still
 * there and stacks with this; these are the ones you earn by playing.
 */
import { getState, update } from './state.js';
import { bump } from './tasks.js';
import { getPlayer } from './data/generator.js';

export const MAX_ACTIVE = 3;

const S = (metric, n, text) => ({ metric, n, text });
export const EVO_TRACKS = [
  {
    id: 'pace', name: 'Pace Merchant', blurb: 'A quick player made quicker — and harder to catch on the turn.',
    fits: (p) => p.position !== 'GK' && p.overall <= 82 && p.stats.pace <= 90,
    stages: [
      { need: S('wins', 2, 'Win 2 matches'), give: { ovr: 1, stats: { pace: 3 } } },
      { need: S('goals', 3, 'Score 3 goals with him'), give: { ovr: 1, stats: { pace: 2, dribbling: 2 }, trait: 'quick' } },
      { need: S('apps', 5, 'Play 5 matches with him'), give: { ovr: 1, stats: { pace: 2, shooting: 1 } } },
    ],
  },
  {
    id: 'engine', name: 'Engine Room Graduate', blurb: 'A midfielder who runs all day and passes on the move.',
    fits: (p) => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position) && p.overall <= 81,
    stages: [
      { need: S('assists', 2, 'Make 2 assists with him'), give: { ovr: 1, stats: { passing: 3 } } },
      { need: S('apps', 4, 'Play 4 matches with him'), give: { ovr: 1, stats: { physical: 3, passing: 1 }, trait: 'engine' } },
      { need: S('wins', 3, 'Win 3 matches'), give: { ovr: 1, stats: { dribbling: 2, passing: 1 } } },
    ],
  },
  {
    id: 'wall', name: 'Wall Builder', blurb: 'A defender who stops getting beaten.',
    fits: (p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.position) && p.overall <= 81,
    stages: [
      { need: S('cleanSheets', 1, 'Keep a clean sheet'), give: { ovr: 1, stats: { defending: 3 } } },
      { need: S('wins', 3, 'Win 3 matches'), give: { ovr: 1, stats: { physical: 2, defending: 1 }, trait: 'rock' } },
      { need: S('apps', 5, 'Play 5 matches with him'), give: { ovr: 1, stats: { pace: 1, defending: 2 } } },
    ],
  },
  {
    id: 'clinical', name: 'Clinical Upgrade', blurb: 'A forward who stops missing.',
    fits: (p) => ['ST', 'LW', 'RW', 'CAM'].includes(p.position) && p.overall <= 83,
    stages: [
      { need: S('goals', 3, 'Score 3 goals with him'), give: { ovr: 1, stats: { shooting: 3 } } },
      { need: S('wins', 3, 'Win 3 matches'), give: { ovr: 1, stats: { shooting: 2, dribbling: 1 }, trait: 'finesse' } },
      { need: S('goals', 4, 'Score 4 more goals with him'), give: { ovr: 1, stats: { shooting: 2, physical: 1 } } },
    ],
  },
  {
    id: 'lastline', name: 'Last Line', blurb: 'A keeper who comes for everything.',
    fits: (p) => p.position === 'GK' && p.overall <= 82,
    stages: [
      { need: S('cleanSheets', 1, 'Keep a clean sheet'), give: { ovr: 1, stats: { defending: 3 } } },
      { need: S('apps', 3, 'Play 3 matches with him'), give: { ovr: 1, stats: { pace: 3, passing: 2 }, trait: 'sweeper' } },
      { need: S('wins', 3, 'Win 3 matches'), give: { ovr: 1, stats: { defending: 2, physical: 1 } } },
    ],
  },
  {
    id: 'rising', name: 'Rising Talent', blurb: 'A young player given the minutes to grow.',
    fits: (p) => p.age <= 21 && p.overall <= 78,
    stages: [
      { need: S('apps', 3, 'Play 3 matches with him'), give: { ovr: 2, stats: {} } },
      { need: S('involve', 3, 'Score or assist 3 times with him'), give: { ovr: 2, stats: {} } },
      { need: S('wins', 4, 'Win 4 matches'), give: { ovr: 2, stats: {} } },
    ],
  },
];
export const trackById = (id) => EVO_TRACKS.find((t) => t.id === id);

/** The finished and in-progress boosts on a card, as one object. */
export function evoBoostOf(club, id) {
  const done = club?.evoDone?.[id];
  const live = Object.entries(club?.evos || {}).find(([, e]) => e.card === id);
  const acc = { ovr: 0, stats: {}, traits: [], stage: 0 };
  const add = (g) => { acc.ovr += g.ovr || 0; for (const [k, v] of Object.entries(g.stats || {})) acc.stats[k] = (acc.stats[k] || 0) + v; if (g.trait) acc.traits.push(g.trait); };
  for (const g of done?.gives || []) { add(g); acc.stage += 1; }
  const t = live && trackById(live[0]);
  if (t) for (let i = 0; i < live[1].stage; i++) { add(t.stages[i].give); acc.stage += 1; }
  return acc;
}

/** A card with its evolutions applied — what the pitch and the card face show. */
export function evolvedRef(club, p) {
  if (!p) return p;
  const b = evoBoostOf(club, p.id);
  if (!b.ovr && !b.traits.length && !Object.keys(b.stats).length) return p;
  const stats = { ...p.stats };
  for (const [k, v] of Object.entries(b.stats)) stats[k] = Math.min(99, stats[k] + v);
  for (const k of Object.keys(stats)) stats[k] = Math.min(99, stats[k] + b.ovr * 0.5);
  return { ...p, stats, overall: Math.min(99, p.overall + b.ovr), extraTraits: b.traits, evoStage: Math.min(4, b.stage) };
}

export function startEvolution(trackId, cardId) {
  const s = getState();
  const t = trackById(trackId); const p = getPlayer(cardId);
  if (!t || !p) return { ok: false, why: 'Unknown track or card.' };
  if (!s.club.collection.includes(cardId)) return { ok: false, why: 'You do not own this card.' };
  const evos = s.club.evos || {};
  if (evos[trackId]) return { ok: false, why: 'That track is already running.' };
  if (Object.keys(evos).length >= MAX_ACTIVE) return { ok: false, why: `Only ${MAX_ACTIVE} evolutions at once.` };
  if (Object.values(evos).some((e) => e.card === cardId)) return { ok: false, why: 'That card is already evolving.' };
  if ((s.club.evoDone?.[cardId]?.tracks || []).includes(trackId)) return { ok: false, why: 'That card has done this track.' };
  if (!t.fits(evolvedRef(s.club, p))) return { ok: false, why: 'That card does not fit this track.' };
  update((st) => { st.club.evos = { ...(st.club.evos || {}), [trackId]: { card: cardId, stage: 0, prog: 0, started: Date.now() } }; });
  return { ok: true };
}
export function cancelEvolution(trackId) {
  update((st) => { if (st.club.evos) delete st.club.evos[trackId]; });
}

/**
 * After an Ultimate XI match: move every running track on. `m` is the
 * finished Match, `side` the human's team, `xiIds` the card ids that started.
 * Returns the stages completed, for the result screen.
 */
export function recordEvoMatch(m, side, xiIds) {
  const s = getState();
  const evos = s.club.evos || {};
  if (!Object.keys(evos).length) return [];
  const mine = m.teams[side]; const opp = m.teams[1 - side];
  const win = mine.score > opp.score;
  const clean = opp.score === 0;
  const done = [];
  update((st) => {
    for (const [trackId, e] of Object.entries(st.club.evos || {})) {
      const t = trackById(trackId);
      if (!t) { delete st.club.evos[trackId]; continue; }
      const played = xiIds.includes(e.card);
      const goals = mine.scorers.filter((g) => g.id === e.card).length;
      const assists = mine.scorers.filter((g) => g.assist === e.card).length;
      const need = t.stages[e.stage]?.need;
      if (!need) continue;
      const inc = { wins: played && win ? 1 : 0, goals, assists, apps: played ? 1 : 0, cleanSheets: played && clean ? 1 : 0, involve: goals + assists }[need.metric] || 0;
      e.prog += inc;
      while (t.stages[e.stage] && e.prog >= t.stages[e.stage].need.n) {
        e.prog -= t.stages[e.stage].need.n;
        e.stage += 1;
        done.push({ track: t.name, stage: e.stage, card: e.card });
        if (e.stage >= t.stages.length) {
          const rec = st.club.evoDone?.[e.card] || { gives: [], tracks: [] };
          rec.gives.push(...t.stages.map((x) => x.give)); rec.tracks.push(trackId);
          st.club.evoDone = { ...(st.club.evoDone || {}), [e.card]: rec };
          delete st.club.evos[trackId];
          break;
        }
      }
    }
  });
  if (done.length) bump('evo', done.length);
  return done;
}
