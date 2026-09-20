/**
 * The playable World Tournament: take a nation through the draw.
 *
 * The draw is the world's own (`worldTournamentDraw`), so the groups are the
 * same ones the simulated edition shows; the difference is that your side's
 * matches are played, not hashed, and every other result is hashed the
 * usual way. State lives in the save (`club.tournament`) and survives a
 * reload mid-tournament. One edition at a time; finishing (or quitting)
 * clears it, and the honours go to the trophy room through `progress`.
 */
import { getState, update } from './state.js';
import { worldTournamentDraw, nationSquad, nations } from './world.js';
import { hashStr } from './data/stadiums.js';
import { pend } from './progress.js';

const STAGES = ['group', 'r16', 'qf', 'sf', 'final', 'done'];

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function poisson(lambda, r) { const L = Math.exp(-lambda); let k = 0; let p = 1; do { k += 1; p *= r(); } while (p > L && k < 9); return k - 1; }
function simTie(edition, tag, a, b, allowDraw) {
  const rr = rng(hashStr(`wtp|${edition}|${tag}|${a}|${b}`));
  const all = nations();
  const ra = all.find((n) => n.nation === a)?.rating || 70;
  const rb = all.find((n) => n.nation === b)?.rating || 70;
  const edge = (ra - rb) / 10;
  const ga = poisson(Math.max(0.3, 1.3 + edge), rr);
  const gb = poisson(Math.max(0.3, 1.2 - edge), rr);
  let winner = ga > gb ? a : gb > ga ? b : null;
  if (!winner && !allowDraw) winner = rr() < 0.5 ? a : b;
  return { home: a, away: b, gh: ga, ga: gb, winner, played: true };
}

export const current = () => getState().club?.tournament || null;

/** Start an edition with your nation. */
export function start(nation) {
  const edition = 100 + (Math.floor(Date.now() / 86_400_000) % 1000);
  const draw = worldTournamentDraw(edition);
  const gi = draw.groups.findIndex((g) => g.includes(nation));
  if (gi < 0) return null;
  const group = draw.groups[gi];
  const others = group.filter((n) => n !== nation);
  const t = {
    edition, nation, groupIndex: gi, groups: draw.groups, stage: 'group', round: 0,
    // my three group games, in order; the other three games of the group are hashed
    fixtures: others.map((o, i) => ({ home: i % 2 ? o : nation, away: i % 2 ? nation : o, played: false })),
    otherGames: [[others[0], others[1]], [others[1], others[2]], [others[0], others[2]]].map(([a, b], i) => simTie(edition, `g${gi}o${i}`, a, b, true)),
    knockout: [],          // my knockout ties as they happen
    bracket: null,         // the sixteen after the groups
    out: false, champion: false,
  };
  update((s) => { s.club.tournament = t; });
  return t;
}

export function quit() { update((s) => { s.club.tournament = null; }); }

/** My next match, or null when the tournament is over for me. */
export function nextMatch() {
  const t = current();
  if (!t || t.out || t.stage === 'done') return null;
  if (t.stage === 'group') return t.fixtures.find((f) => !f.played) || null;
  return t.knockout.find((k) => !k.played) || null;
}

/** The group table for my group, from my played games plus the hashed others. */
export function groupTable(t = current()) {
  if (!t) return [];
  const g = t.groups[t.groupIndex];
  const rows = Object.fromEntries(g.map((n) => [n, { id: n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]));
  const apply = (m) => {
    if (!m.played) return;
    const h = rows[m.home]; const a = rows[m.away];
    h.p++; a.p++; h.gf += m.gh; h.ga += m.ga; a.gf += m.ga; a.ga += m.gh;
    if (m.gh > m.ga) { h.w++; a.l++; h.pts += 3; } else if (m.gh < m.ga) { a.w++; h.l++; a.pts += 3; } else { h.d++; a.d++; h.pts++; a.pts++; }
  };
  t.fixtures.forEach(apply); t.otherGames.forEach(apply);
  return Object.values(rows).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.id.localeCompare(y.id));
}

/** Everyone else's group tables, hashed. */
function otherGroupOrder(t, gi) {
  const g = t.groups[gi];
  const rows = Object.fromEntries(g.map((n) => [n, { id: n, pts: 0, gd: 0, gf: 0 }]));
  for (const [i, j] of [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]]) {
    const m = simTie(t.edition, `g${gi}`, g[i], g[j], true);
    const h = rows[m.home]; const a = rows[m.away];
    h.gf += m.gh; a.gf += m.ga; h.gd += m.gh - m.ga; a.gd += m.ga - m.gh;
    if (m.gh > m.ga) h.pts += 3; else if (m.gh < m.ga) a.pts += 3; else { h.pts++; a.pts++; }
  }
  return Object.values(rows).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.id.localeCompare(y.id)).map((r) => r.id);
}

/** Record my result and move the tournament on. Returns what happened. */
export function onResult(scored, conceded) {
  const t = current();
  if (!t) return null;
  const out = { advanced: false, out: false, champion: false, stage: t.stage };
  update((s) => {
    const tt = s.club.tournament;
    if (tt.stage === 'group') {
      const f = tt.fixtures.find((x) => !x.played);
      if (!f) return;
      const mine = f.home === tt.nation;
      f.gh = mine ? scored : conceded; f.ga = mine ? conceded : scored; f.played = true;
      if (tt.fixtures.every((x) => x.played)) {
        // the groups are done: build the sixteen
        const orders = tt.groups.map((g, gi) => (gi === tt.groupIndex ? groupTable(tt).map((r) => r.id) : otherGroupOrder(tt, gi)));
        const myPos = orders[tt.groupIndex].indexOf(tt.nation);
        if (myPos > 1) { tt.out = true; tt.stage = 'done'; out.out = true; return; }
        const pairs = [];
        for (let i = 0; i < 8; i += 2) { pairs.push([orders[i][0], orders[i + 1][1]]); pairs.push([orders[i + 1][0], orders[i][1]]); }
        tt.bracket = pairs;
        tt.stage = 'r16';
        const mine2 = pairs.find(([a, b]) => a === tt.nation || b === tt.nation);
        tt.knockout.push({ home: mine2[0], away: mine2[1], stage: 'r16', played: false });
        out.advanced = true;
      }
      return;
    }
    const k = tt.knockout.find((x) => !x.played);
    if (!k) return;
    const mine = k.home === tt.nation;
    k.gh = mine ? scored : conceded; k.ga = mine ? conceded : scored; k.played = true;
    const won = scored > conceded || (scored === conceded && hashStr(`pens|${tt.edition}|${tt.stage}`) % 2 === 0);
    k.winner = won ? tt.nation : (mine ? k.away : k.home);
    if (!won) { tt.out = true; tt.stage = 'done'; out.out = true; return; }
    const idx = STAGES.indexOf(tt.stage);
    const next = STAGES[idx + 1];
    if (next === 'done') { tt.stage = 'done'; tt.champion = true; out.champion = true; pend(s, { title: `World Tournament champions with ${tt.nation}`, apex: 25000, pack: 'special' }); return; }
    // the rest of the bracket is hashed round by round; my opponent is whoever comes through the tie paired with mine
    const survivors = advanceOthers(tt, idx);
    tt.stage = next;
    const opp = survivors.find((n) => n !== tt.nation);
    tt.knockout.push({ home: tt.nation, away: opp, stage: next, played: false });
    out.advanced = true; out.stage = next;
  });
  return out;
}

/* The other ties of the current round, hashed, returning the two sides of
   my next tie (me and the winner of the tie paired with mine). */
function advanceOthers(tt, stageIdx) {
  const size = { 1: 16, 2: 8, 3: 4, 4: 2 }[stageIdx];
  // rebuild the round's pairs: r16 from the bracket, later rounds by winners
  let pairs = tt.bracket.map((p) => p.slice());
  let winners = null;
  for (let r = 1; r <= stageIdx; r++) {
    winners = pairs.map(([a, b], i) => {
      if (a === tt.nation || b === tt.nation) return tt.nation;
      return simTie(tt.edition, `p${r}`, a, b, false).winner;
    });
    const next = [];
    for (let i = 0; i < winners.length; i += 2) next.push([winners[i], winners[i + 1]]);
    pairs = next;
  }
  void size;
  return pairs.find(([a, b]) => a === tt.nation || b === tt.nation) || [tt.nation, winners?.find((n) => n !== tt.nation)];
}

/** Match params for my next fixture. */
export function matchParams() {
  const t = current();
  const m = nextMatch();
  if (!t || !m) return null;
  const home = nationSquad(m.home); const away = nationSquad(m.away);
  if (!home || !away) return null;
  return { homeSquad: home, awaySquad: away, tournament: true, showpiece: 'wonder', final: t.stage === 'final', duration: 240, skill: 1, mode: 'single' };
}
