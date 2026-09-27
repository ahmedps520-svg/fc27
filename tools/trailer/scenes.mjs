/**
 * The trailer's match footage, found rather than staged (tools/trailer).
 *
 *   node tools/trailer/scenes.mjs [matches=30] [out=tests/tmp/trailer/scenes]
 *
 * Plays whole AI matches in Node (the sim alone, fast), keeps the last few
 * seconds of every frame in a ring buffer, and when something worth showing
 * happens — a headed goal, a goal from outside the box, a big save, a foul
 * that brings a man down — writes that stretch out as a scene: every player,
 * the ball and the match state at 30 frames a second, full precision.
 * film.mjs then plays a scene back onto the real game in a browser, frame by
 * frame, with its own cameras. Nothing about the sim is changed; the footage
 * is football the game actually played.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Match, PITCH } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';

const N = Number(process.argv[2] || 30);
const OUT = process.argv[3] || 'tests/tmp/trailer/scenes';
mkdirSync(OUT, { recursive: true });

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const r3 = (v) => Math.round((v || 0) * 1000) / 1000;
const PF = ['x', 'y', 'vx', 'vy', 'dirX', 'dirY', 'diveT', 'downT', 'downMax', 'slide', 'spinT', 'skillT', 'stamina', 'stumble', 'holdT'];
// the sim's sound cues since the last kept frame (play.js turns these into sfx)
let heard = [];
const cueArg = (a) => (typeof a === 'number' || typeof a === 'string' ? a : a && typeof a === 'object' && Number.isFinite(a.power) ? a.power : undefined);
function frame(m) {
  const cu = heard; heard = [];
  const all = [...m.teams[0].players, ...m.teams[1].players];
  const b = m.ball;
  return {
    t: r3(m.t),
    ph: m.phase, pt: r3(m.phaseT), bn: m.banner || '',
    s: [m.teams[0].score, m.teams[1].score],
    b: [r3(b.x), r3(b.y), r3(b.z), r3(b.vx), r3(b.vy), r3(b.vz)], o: b.owner ? all.indexOf(b.owner) : -1,
    p: all.map((p) => [...PF.map((k) => r3(p[k])), p.celebrating ? 1 : 0, p.celebKind || '', p.skillKind || '', p.sentOff ? 1 : 0]),
    gt: m.goalTeam ?? -1, ct: r3(m.celebT), cb: m.celebrant ? all.indexOf(m.celebrant) : -1,
    nh: m.netHit ? { ...m.netHit } : null,
    bk: m.bookings.length ? m.bookings[m.bookings.length - 1] : null, bkn: m.bookings.length,
    cu,
  };
}

const CLUBS = WORLD.clubs.slice(0, 10);
const found = [];
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(90210 + i * 7919);
  const home = CLUBS[i % 10].id; let away = CLUBS[(i * 3 + 1) % 10].id; if (away === home) away = CLUBS[(i + 5) % 10].id;
  const m = new Match(home, away, { human: null, duration: 240 });
  const ring = []; heard = []; const PRE = 6.5 * 30; const POST = 3.4 * 30;
  let pending = null;             // an event waiting for its after-frames
  const cueLog = [];
  const realCue = m.cue.bind(m);
  m.cue = (k, a) => { cueLog.push({ k, t: m.t, p: a && a.ref ? a : null }); return realCue(k, a); };
  let step = 0; let lastShot = null; let lastHeader = null;
  while (m.phase !== 'end' && step < 240 * 60 + 600) {
    const g0 = m.teams[0].score + m.teams[1].score;
    const bk0 = m.bookings.length; const fouls0 = m.fouls[0] + m.fouls[1];
    m.update(1 / 60); step++;
    for (const c of m.cues.splice(0)) heard.push(c.arg === undefined || cueArg(c.arg) === undefined ? [c.name] : [c.name, cueArg(c.arg)]);
    for (const c of cueLog.splice(0)) {
      if (c.k === 'header') lastHeader = { t: c.t, p: m.ball.lastTouch };
      if (c.k === 'shot') lastShot = { t: c.t, p: m.ball.shotBy, x: m.ball.shotBy?.x, y: m.ball.shotBy?.y };
      if (c.k === 'save' && !pending) pending = { kind: 'save', left: 40, at: ring.length };
    }
    if (step % 2) continue;                        // 30 frames a second
    ring.push(frame(m)); if (ring.length > PRE + POST) ring.shift();
    const goals = m.teams[0].score + m.teams[1].score;
    if (goals > g0 && !pending) {
      const sc = m.ball.lastTouch; const side = m.goalTeam;
      const gx = m.teams[side].dir > 0 ? PITCH.w : 0;
      let kind = 'goal';
      if (lastHeader && m.t - lastHeader.t < 2.5 && lastHeader.p === sc) kind = 'header';
      else if (lastShot && lastShot.p === sc && Math.abs(gx - lastShot.x) > 17) kind = 'longshot';
      pending = { kind, left: POST };
    }
    if (m.fouls[0] + m.fouls[1] > fouls0 && !pending) pending = { kind: m.bookings.length > bk0 ? 'booking' : 'foul', left: 60 };
    if (pending && --pending.left <= 0) {
      const name = `${String(found.length).padStart(3, '0')}-${pending.kind}-m${i}`;
      writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ home, away, kind: pending.kind, frames: ring.slice() }));
      found.push(name); pending = null; ring.length = 0;
    }
  }
}
const count = found.reduce((a, n) => { const k = n.split('-')[1]; a[k] = (a[k] || 0) + 1; return a; }, {});
console.log(`${found.length} scenes from ${N} matches:`, count);
