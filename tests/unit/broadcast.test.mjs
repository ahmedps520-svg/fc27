/**
 * v83 — the broadcast: the commentary banks, derbies, the broadcast clock and
 * stoppage board, goal and full-time context, the pundit, the dressing room,
 * the stat sheet and ratings, heat maps and momentum off a real match, the
 * seasonal themes, the playlist and the voice picker.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll } from '../../js/state.js';
import { Match, PITCH, setField } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';
import { COMMENTARY, LINE_COUNT } from '../../js/data/commentary.js';
import { CO, CONTEXT, AR, VOICE_LINE_COUNT } from '../../js/data/commentaryVoices.js';
import * as C from '../../js/broadcast/context.js';
import { previewText, teamRating } from '../../js/broadcast/pregame.js';
import { reaction, teamStats } from '../../js/broadcast/postmatch.js';
import { createHeat, createMomentum } from '../../js/broadcast/graphics.js';
import { pickVoices, lineFrom, banks } from '../../js/broadcast/voice.js';
import { themeForDate, activeTheme, decorationHTML } from '../../js/seasonal.js';
import { TRACKS } from '../../js/audio.js';
import { rateMatch } from '../../js/game/ratings.js';

beforeEach(() => { resetStorage(); resetAll(); setField('full'); });
const seeded = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const withSeed = (seed, fn) => { const r = Math.random; Math.random = seeded(seed); try { return fn(); } finally { Math.random = r; } };

test('commentary: 600+ lines across two voices and two languages, placeholders all known', () => {
  const en = LINE_COUNT + VOICE_LINE_COUNT.co + VOICE_LINE_COUNT.context;
  assert.ok(en >= 450, `${en} English lines`);
  assert.ok(en + VOICE_LINE_COUNT.ar >= 600, `${en + VOICE_LINE_COUNT.ar} lines in all`);
  assert.ok(VOICE_LINE_COUNT.ar >= 250, `${VOICE_LINE_COUNT.ar} Arabic lines`);
  const KNOWN = new Set(['player', 'team', 'opp', 'minute', 'score', 'keeper', 'dist', 'venue', 'poss', 'goals', 'derby', 'weather', 'tactic']);
  const all = [COMMENTARY, CO, CONTEXT, AR.pbp, AR.co, AR.context].flatMap((b) => Object.values(b).flat());
  for (const line of all) for (const [, k] of line.matchAll(/\{(\w+)\}/g)) assert.ok(KNOWN.has(k), `unknown placeholder {${k}} in "${line}"`);
  // the Arabic play-by-play covers every key the play screen calls most
  for (const k of ['kickoff', 'goal', 'shot', 'save', 'foul', 'card', 'halftime', 'fulltime', 'offside', 'cornerKick']) assert.ok(AR.pbp[k]?.length, `ar pbp ${k}`);
  assert.equal(lineFrom(banks('ar').pbp, 'goal', { player: 'X', score: '1–0', team: 'T', minute: 9 }).includes('{'), false);
});

test('derbies: every club has exactly one rival in its league, both ways', () => {
  const rival = new Map();
  for (const a of WORLD.clubs) for (const b of WORLD.clubs) if (a !== b && C.derbyOf(a, b, WORLD.clubs)) { assert.ok(!rival.has(a.id), `${a.id} has two`); rival.set(a.id, b.id); }
  for (const [a, b] of rival) { assert.equal(rival.get(b), a); assert.equal(WORLD.clubs.find((c) => c.id === a).league, WORLD.clubs.find((c) => c.id === b).league); }
  assert.ok(rival.size >= WORLD.clubs.length - 12, `${rival.size} clubs have a derby`);
  const [a, b] = [...rival][0].map((id) => WORLD.clubs.find((c) => c.id === id));
  assert.match(C.derbyOf(a, b, WORLD.clubs), /derby$/);
});

test('the broadcast clock: the board at 43, stoppage shown as 45+N, the whistle on the last added minute', () => {
  assert.deepEqual(C.broadcastMinute(1, 0.5, 0), { minute: 22, plus: 0 });
  assert.equal(C.clockLabel(C.broadcastMinute(1, 0.999, 3)), "45+3'");
  assert.equal(C.clockLabel(C.broadcastMinute(2, 0.2, 0)), "54'");
  let prev = -1;
  for (let f = 0; f < 1; f += 0.001) { const b = C.broadcastMinute(2, f, 4); const v = b.minute + b.plus; assert.ok(v >= prev); prev = v; }
  assert.equal(prev, 94);
  assert.equal(C.addedMinutes({}), 1);
  assert.equal(C.addedMinutes({ goals: 9, cards: 9, subs: 9, injuries: 9, stoppages: 99 }), 6);
  assert.ok(C.addedMinutes({ goals: 2, subs: 3, stoppages: 20 }) >= 3);
});

test('goal and full-time context', () => {
  assert.deepEqual(C.goalKeys({ scorerGoals: 3, minute: 30, score: [3, 0], team: 0 }), ['hatTrick']);
  assert.ok(C.goalKeys({ scorerGoals: 1, minute: 89, score: [2, 1], team: 0 }).includes('lateWinner'));
  assert.ok(C.goalKeys({ scorerGoals: 1, minute: 88, score: [1, 1], team: 1 }).includes('lateEqualiser'));
  assert.deepEqual(C.goalKeys({ scorerGoals: 1, minute: 10, score: [0, 1], team: 1, derby: 'd' }), ['opener', 'derbyGoal']);
  assert.ok(C.goalKeys({ own: true, scorerGoals: 3, score: [1, 0], team: 0 }).every((k) => k !== 'hatTrick'));
  const ft = C.fullTimeKeys({ score: [3, 0], trail: [0, 0], ratings: [70, 80] });
  assert.ok(ft.includes('upset') && ft.includes('bigWin') && ft.includes('cleanSheet'));
  assert.ok(C.fullTimeKeys({ score: [2, 1], trail: [1, 0] }).includes('comebackWin'));
  assert.deepEqual(C.fullTimeKeys({ score: [1, 1] }), []);
  assert.ok(C.fullTimeKeys({ score: [1, 0], final: true })[0] === 'finalWin');
  assert.equal(C.weatherKey({ weather: 'rain' }), 'weatherRain');
  assert.equal(C.weatherKey({ weather: 'clear', time: 'night' }), 'night');
});

test('offside margin, form, and the pundit', () => {
  const defs = [{ x: 90 }, { x: 80 }, { x: 70 }];
  assert.equal(C.offsideMargin({ x: 81 }, defs, 1), 1);
  assert.equal(C.offsideMargin({ x: 79.5 }, defs, 1), -0.5);
  const fm = C.formMap({ inForm: ['p1'], career: { pl: { 'A B': { ratings: [8, 7.8, 7.5] }, 'C D': { ratings: [5.8, 6, 5.5] } } } });
  assert.equal(C.formOf(fm, { id: 'p1' }), 'hot');
  assert.equal(C.formOf(fm, { id: 'x', name: 'A B' }), 'hot');
  assert.equal(C.formOf(fm, { id: 'y', name: 'C D' }), 'cold');
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 60, human: null });
  const [h, a] = m.teams;
  const en = previewText({ home: h, away: a, weather: 'rain' });
  const star = [...h.players.slice(0, 11)].sort((x, y) => y.ref.overall - x.ref.overall)[0].ref.name;
  assert.ok(en.includes(star) && /rain/i.test(en) && /prediction/i.test(en));
  assert.ok(/[؀-ۿ]/.test(previewText({ home: h, away: a, lang: 'ar' })));
  assert.ok(teamRating(h) > 40);
});

test('a played match: stat sheet, ratings, heat maps and a momentum series', () => {
  withSeed(5, () => {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[2].id, { duration: 120, human: null });
    const heat = createHeat(); const mom = createMomentum();
    for (let i = 0; i < 60 * 400 && m.phase !== 'end'; i++) {
      m.update(1 / 60);
      while (m.cues.length) { const c = m.cues.shift(); if (c.name === 'shot') mom.event(c.arg?.team ?? 0, 0.2); }
      heat.sample(m, 1 / 60, PITCH); mom.step(m, 1 / 60, PITCH);
    }
    assert.equal(m.phase, 'end');
    const rows = teamStats(m);
    assert.equal(rows.length, 10);
    assert.ok(Number(rows.find((r) => r[0] === 'Passes')[1]) > 10);
    assert.ok(Number(rows.find((r) => r[0] === 'Distance (km)')[1]) > 1);
    const rated = rateMatch(m);
    assert.ok(rated.potm && rated.players.length >= 22);
    assert.ok(heat.total(0) > 500 && heat.total(1) > 500);
    const s = mom.series();
    assert.ok(s.length > 20 && s.every((v) => v >= -1 && v <= 1));
  });
});

test('the dressing room reads the result', () => {
  assert.match(reaction({ mine: 0, theirs: 2 }).scene, /Silence/);
  assert.match(reaction({ mine: 1, theirs: 1 }).scene, /Quiet/);
  assert.match(reaction({ mine: 4, theirs: 0 }).scene, /Music/);
  assert.match(reaction({ mine: 2, theirs: 1, final: true }).scene, /trophy/);
  assert.ok(/[؀-ۿ]/.test(reaction({ mine: 1, theirs: 0, lang: 'ar' }).quote));
  assert.deepEqual(reaction({ mine: 2, theirs: 1 }), reaction({ mine: 2, theirs: 1 }), 'the same match reads the same');
});

test('seasonal themes by date, and the Settings override', () => {
  assert.equal(themeForDate(new Date(2026, 8, 23)), 'nationalDay');
  assert.equal(themeForDate(new Date(2026, 2, 1)), 'ramadan');
  assert.equal(themeForDate(new Date(2027, 1, 20)), 'ramadan');
  assert.equal(themeForDate(new Date(2026, 11, 15)), 'winter');
  assert.equal(themeForDate(new Date(2026, 6, 1)), null);
  assert.equal(activeTheme('off', new Date(2026, 8, 23)), null);
  assert.equal(activeTheme('winter', new Date(2026, 6, 1)), 'winter');
  assert.match(decorationHTML('ramadan', { lang: 'ar' }), /رمضان كريم/);
  assert.match(decorationHTML('nationalDay'), /National Day/);
  assert.equal(decorationHTML(null), '');
});

test('the playlist and the two voices', () => {
  assert.ok(TRACKS.length >= 5);
  assert.equal(new Set(TRACKS.map((t) => t.name)).size, TRACKS.length);
  for (const t of TRACKS) { assert.ok(t.chords.length >= 3 && t.bars > 8 && t.bar > 1); for (const c of t.chords) assert.ok(c.every((f) => f > 80 && f < 1200)); }
  const vs = [{ name: 'A', lang: 'en-GB', localService: true }, { name: 'B', lang: 'en-US', localService: true }, { name: 'C', lang: 'ar-SA', localService: false }];
  const en = pickVoices(vs, 'en'); assert.ok(en.pbp && en.co && en.pbp !== en.co);
  const ar = pickVoices(vs, 'ar'); assert.equal(ar.pbp.name, 'C'); assert.equal(ar.co.name, 'C');
  assert.deepEqual(pickVoices([], 'ar'), { pbp: null, co: null });
});

test('no commentary line is left with a hole in it when the context is the default one', () => {
  const base = { venue: 'V', derby: 'the A–B derby', weather: 'rain', score: '1–0', minute: 10, team: 'A', opp: 'B', player: 'him', goals: 1, dist: 20, poss: 50, keeper: 'K', tactic: 'a shape' };
  for (const bank of [COMMENTARY, CO, CONTEXT, AR.pbp, AR.co, AR.context]) {
    for (const [key, pool] of Object.entries(bank)) for (let i = 0; i < pool.length; i++) {
      const line = pool[i].replace(/\{(\w+)\}/g, (_, k) => base[k] ?? '');
      assert.ok(!/\s{2,}|\s[.,!?]|of will|for\s*$/.test(line.replace(/\s+—/g, ' —')) || /\.\.\./.test(line), `${key}[${i}]: "${line}"`);
    }
  }
});
