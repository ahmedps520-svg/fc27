/**
 * The gameplay bug bash, as a test: AI-vs-AI matches with every invariant a
 * player would notice checked on every frame.
 *
 *  - nothing goes NaN, and nobody leaves the ground;
 *  - the ball never sits inside a post;
 *  - a goal is only ever given for a ball that crossed the line between the
 *    posts and under the bar, and one that did is always given;
 *  - every restart is the right one, in the right place, to the right side:
 *    a throw-in from the touchline to the side that did not touch it last, a
 *    corner from the corner to the attackers, a goal kick to the defending
 *    keeper in his own box;
 *  - no dead ball lasts forever, no ball lies loose and untouched in play,
 *    and no outfield player stands frozen through open play;
 *  - a player who goes down gets back up.
 *
 * Seeded, so a failure names a seed and a frame that reproduce it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match, PITCH, GOAL_HALF, GOAL_HEIGHT } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';

const CY = PITCH.h / 2;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runMatch(seed, homeId, awayId) {
  const realRandom = Math.random;
  Math.random = mulberry32(seed);
  const errs = [];
  try {
    const m = new Match(homeId, awayId, { human: null, duration: 240 });
    const dt = 1 / 30;
    let frame = 0;
    let phaseT = 0; let lastPhase = m.phase;
    let looseT = 0;
    const still = new Map();              // player -> { x, y, t }
    let prevBall = { x: m.ball.x, y: m.ball.y, z: m.ball.z };
    let prevScore = 0; let prevPhase = m.phase;
    const fail = (msg) => { if (errs.length < 12) errs.push(`seed ${seed} frame ${frame} (${m.phase}): ${msg}`); };
    while (m.phase !== 'end' && frame < 30 * 60 * 12) {
      const b0 = { x: m.ball.x, y: m.ball.y, z: m.ball.z, vx: m.ball.vx, vy: m.ball.vy };
      const phase0 = m.phase;
      const stop0 = m.stoppages;
      m.update(dt);
      frame += 1;
      const b = m.ball;
      // finite, and on the ground
      for (const v of [b.x, b.y, b.z, b.vx, b.vy, b.vz]) if (!Number.isFinite(v)) { fail('ball state not finite'); break; }
      for (const t of m.teams) for (const p of t.players) {
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) fail(`${p.name} position not finite`);
        else if (p.x < -9 || p.x > PITCH.w + 9 || p.y < -9 || p.y > PITCH.h + 9) fail(`${p.name} left the ground at ${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        if (p.downT > 3) fail(`${p.name} down for ${p.downT.toFixed(1)} s`);
      }
      // never inside a post
      if (b.z < GOAL_HEIGHT - 0.2) {
        for (const gx of [0, PITCH.w]) for (const py of [CY - GOAL_HALF, CY + GOAL_HALF]) {
          if (Math.hypot(b.x - gx, b.y - py) < 0.12) fail(`ball inside the post at ${gx},${py}`);
        }
      }
      const score = m.teams[0].score + m.teams[1].score;
      // a goal is given only for a ball over the line, between the posts and under the bar
      if (score > prevScore) {
        const x = b0.x; const y = b0.y;
        const nearLine = Math.min(Math.abs(x), Math.abs(PITCH.w - x)) < 3 || b.inNet;
        if (!nearLine) fail(`goal given with the ball at ${x.toFixed(1)},${y.toFixed(1)}`);
        // where it crossed the line, not where it was a frame before
        const lineX = b0.x < PITCH.w / 2 ? 0 : PITCH.w;
        const yc = Math.abs(b0.vx) > 0.5 ? b0.y + (lineX - b0.x) * (b0.vy / b0.vx) : b0.y;
        if (Math.abs(yc - CY) > GOAL_HALF + 0.3) fail(`goal given with the ball crossing wide of the posts (y ${yc.toFixed(2)})`);
      }
      // a ball that was in play and went between the posts under the bar is a goal
      if (phase0 === 'play' && m.stoppages > stop0 && m.stoppage !== 'goal') {
        const crossed = (b0.x > 0.4 && prevBall.x > 0.4 && b0.x < 1.6) || (b0.x < PITCH.w - 0.4 && b0.x > PITCH.w - 1.6);
        if (crossed && Math.abs(b0.y - CY) < GOAL_HALF - 0.3 && b0.z < GOAL_HEIGHT - 0.3 && Math.hypot(b0.x - prevBall.x, 0) > 0.05 && (m.stoppage === 'goalkick' || m.stoppage === 'corner')) {
          fail(`ball went out between the posts under the bar (y ${b0.y.toFixed(2)}, z ${b0.z.toFixed(2)}) and gave a ${m.stoppage}`);
        }
      }
      // restarts: right kind, right place, right side
      if (m.stoppages > stop0) {
        const k = m.stoppage;
        if (k === 'throwin') {
          if (m.phase !== 'throwin') fail(`a throw-in stoppage but the phase is ${m.phase}`);
          if (!(b.y < 1 || b.y > PITCH.h - 1)) fail(`throw-in taken from y ${b.y.toFixed(1)}, not the touchline`);
        } else if (k === 'corner') {
          if (m.phase !== 'corner') fail(`a corner stoppage but the phase is ${m.phase}`);
          const atCorner = (b.x < 1.5 || b.x > PITCH.w - 1.5) && (b.y < 1.5 || b.y > PITCH.h - 1.5);
          if (!atCorner) fail(`corner taken from ${b.x.toFixed(1)},${b.y.toFixed(1)}`);
          const sp = m.setPiece; if (sp) {
            const atk = m.teams[sp.team]; const goalX = atk.dir > 0 ? PITCH.w : 0;
            if (Math.abs(b.x - goalX) > 2) fail('corner given to the defending side');
          }
        } else if (k === 'goalkick') {
          const gk = b.owner;
          if (!gk || gk.role !== 'GK') fail('goal kick, but the keeper does not have the ball');
          else {
            const own = m.teams[gk.team].dir > 0 ? 0 : PITCH.w;
            if (Math.abs(gk.x - own) > 17) fail(`goal kick taken ${Math.abs(gk.x - own).toFixed(1)} m from the keeper's own goal`);
          }
        }
      }
      // nothing stays dead forever
      if (m.phase !== lastPhase) { phaseT = 0; lastPhase = m.phase; } else phaseT += dt;
      if (['corner', 'freekick', 'throwin', 'penalty', 'kickoff'].includes(m.phase) && phaseT > 20) { fail(`${m.phase} has lasted ${phaseT.toFixed(0)} s`); phaseT = -1e9; }
      // nor lies loose and untouched in open play
      const moving = Math.hypot(b.vx, b.vy) > 0.05;
      if (m.phase === 'play' && !b.owner && !moving) looseT += dt; else looseT = 0;
      if (looseT > 12) { fail(`ball loose and still for 12 s at ${b.x.toFixed(1)},${b.y.toFixed(1)}`); looseT = -1e9; }
      // no outfield player frozen through open play
      if (m.phase === 'play') {
        for (const t of m.teams) for (const p of t.players) {
          if (p.role === 'GK' || p.sentOff || p.off) continue;
          const s = still.get(p);
          if (!s || Math.hypot(p.x - s.x, p.y - s.y) > 0.25) still.set(p, { x: p.x, y: p.y, t: 0 });
          else if ((s.t += dt) > 45) { fail(`${p.name} (${p.role}) has not moved for 45 s of open play at ${p.x.toFixed(1)},${p.y.toFixed(1)}`); s.t = -1e9; }
        }
      } else still.clear();
      prevBall = b0; prevScore = score; prevPhase = phase0;
    }
    if (m.phase !== 'end') errs.push(`seed ${seed}: the match never reached full time (${m.phase})`);
  } finally {
    Math.random = realRandom;
  }
  return errs;
}

test('AI matches hold every gameplay invariant', () => {
  const clubs = WORLD.clubs.slice(0, 10);
  const errs = [];
  for (let i = 0; i < 8; i++) {
    const home = clubs[i % clubs.length]; const away = clubs[(i * 3 + 1) % clubs.length];
    errs.push(...runMatch(9000 + i * 77, home.id, away.id === home.id ? clubs[(i + 5) % 10].id : away.id));
  }
  assert.deepEqual(errs, []);
});

/* The restarts, directly: the ball is sent out from each kind of place with a
   known last touch, and the restart that follows is checked. Open play
   hardly ever produces a throw-in (the AI keeps it in; see HANDOFF v77), so
   these are not left to chance. */
test('every way out of play gives the right restart', () => {
  const clubs = WORLD.clubs;
  const cases = [
    // [name, ball {x,y,z,vx,vy,vz}, last touch team, expect]
    ['touchline, team 0 last', { x: 50, y: 1.2, z: 0, vx: 0, vy: -12, vz: 0 }, 0, { phase: 'throwin', team: 1 }],
    ['far touchline, team 1 last', { x: 30, y: PITCH.h - 1.2, z: 0, vx: 0, vy: 12, vz: 0 }, 1, { phase: 'throwin', team: 0 }],
    ['wide of the left post, attacker last', { x: 1.5, y: 12, z: 0, vx: -14, vy: 0, vz: 0 }, 1, { stoppage: 'goalkick', keeperTeam: 0 }],
    ['wide of the left post, defender last', { x: 1.5, y: 12, z: 0, vx: -14, vy: 0, vz: 0 }, 0, { phase: 'corner', team: 1 }],
    ['over the right bar, attacker last', { x: PITCH.w - 1.5, y: CY, z: 3.4, vx: 14, vy: 0, vz: 1 }, 0, { stoppage: 'goalkick', keeperTeam: 1 }],
    ['between the right posts', { x: PITCH.w - 1.5, y: CY + 2, z: 0.5, vx: 16, vy: 0, vz: 0 }, 0, { goal: 0 }],
    ['between the left posts', { x: 1.5, y: CY - 3, z: 1.2, vx: -16, vy: 0, vz: 0 }, 1, { goal: 1 }],
  ];
  const errs = [];
  for (const [name, bs, touch, want] of cases) {
    const realRandom = Math.random; Math.random = mulberry32(4242);
    try {
      const m = new Match(clubs[0].id, clubs[1].id, { human: null, duration: 240 });
      let guard = 0;
      while (m.phase !== 'play' && guard++ < 3000) m.update(1 / 30);
      const toucher = m.teams[touch].players.find((p) => p.role !== 'GK');
      Object.assign(m.ball, bs, { owner: null, lastTouch: toucher, shotBy: null, curl: 0, noTouch: 5 });
      const s0 = m.stoppages; const g0 = [m.teams[0].score, m.teams[1].score];
      for (let i = 0; i < 30 && m.stoppages === s0; i++) m.update(1 / 30);
      if (m.stoppages === s0) { errs.push(`${name}: the ball never went out`); continue; }
      if (want.phase && m.phase !== want.phase) errs.push(`${name}: phase ${m.phase}, want ${want.phase}`);
      if (want.team !== undefined && m.setPiece && m.setPiece.team !== want.team) errs.push(`${name}: given to team ${m.setPiece.team}, want ${want.team}`);
      if (want.stoppage && m.stoppage !== want.stoppage) errs.push(`${name}: ${m.stoppage}, want ${want.stoppage}`);
      if (want.keeperTeam !== undefined && !(m.ball.owner?.role === 'GK' && m.ball.owner.team === want.keeperTeam)) errs.push(`${name}: the ball is not with team ${want.keeperTeam}'s keeper`);
      if (want.goal !== undefined && m.teams[want.goal].score !== g0[want.goal] + 1) errs.push(`${name}: no goal for team ${want.goal} (stoppage ${m.stoppage})`);
      if (want.goal === undefined && (m.teams[0].score !== g0[0] || m.teams[1].score !== g0[1])) errs.push(`${name}: a goal was given`);
    } finally { Math.random = realRandom; }
  }
  assert.deepEqual(errs, []);
});
