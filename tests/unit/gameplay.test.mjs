/** v79: gameplay feel and AI — the pieces, and the football they make. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match, PITCH } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';
import { SKILL_MOVES, pickSkill } from '../../js/game/skills.js';
import { adaptFor, defaultRole, ROLES, QUICK_TACTICS, rolesFor } from '../../js/game/tactics.js';
import { traitsOf, skillStars, TRAITS } from '../../js/data/traits.js';

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clubs = WORLD.clubs.slice(0, 10);

test('thirteen skill moves, gated by stars, each direction covered', () => {
  assert.ok(SKILL_MOVES.length >= 10);
  for (const s of [1, 2, 3, 4, 5]) {
    for (const dir of ['fwd', 'back', 'side', 'none']) {
      for (const mod of [null, 'sprint', 'curl', 'lob']) {
        const m = pickSkill(dir, mod, s, false);
        assert.ok(m.stars <= s, `${m.id} needs ${m.stars} stars, the player has ${s}`);
      }
    }
  }
  assert.equal(pickSkill('fwd', 'lob', 5, true).id, 'rainbow');
  assert.equal(pickSkill('fwd', 'sprint', 4, true).id, 'nutmeg');
  assert.notEqual(pickSkill('fwd', 'lob', 3, true).id, 'rainbow', 'a three-star cannot rainbow');
});

test('traits: original names, elite only on elite cards, stars 1–5', () => {
  for (const t of Object.values(TRAITS)) assert.ok(t.name && t.blurb);
  for (const p of WORLD.players.slice(0, 2000)) {
    const tr = traitsOf(p);
    assert.ok(tr.length <= 3);
    if (tr.some((x) => x.elite)) assert.ok(p.overall >= 86);
    const st = skillStars(p);
    assert.ok(st >= 1 && st <= 5);
  }
});

test('tactics: roles fit their slots, the CPU chases late and sees games out', () => {
  for (const [id, r] of Object.entries(ROLES)) assert.ok(['DEF', 'MID', 'FWD'].includes(r.pos), id);
  assert.ok(rolesFor('FWD').some((r) => r.id === 'false-nine'));
  assert.equal(adaptFor(-1, 0.9, false).mentality, 'allout');
  assert.equal(adaptFor(1, 0.9, false).tempo, 'slow');
  assert.equal(adaptFor(-1, 0.5, true).mentality, 'attacking');
  assert.equal(adaptFor(0, 0.5, false), null);
  const p = WORLD.players.find((q) => q.position === 'CB');
  assert.ok(['centre-back', 'ball-playing'].includes(defaultRole(p, { role: 'DEF', x: 0.16, y: 0.4 })));
  assert.equal(QUICK_TACTICS.length, 5);
});

test('momentum: a sprinter cannot reverse on the spot', () => {
  const m = new Match(clubs[0].id, clubs[1].id, { human: null, duration: 240 });
  const p = m.teams[0].players[9];
  p.vx = p.maxSpeed; p.vy = 0; p.dirX = 1; p.dirY = 0; p.slide = 0; p.downT = 0; p.stumble = 0;
  let planted = false;
  for (let i = 0; i < 6; i++) { m.drive(p, -1, 0, 1 / 60); planted ||= p.planted; }
  assert.ok(p.vx > 0, `after 0.1 s asked to turn round he is still going forwards (vx ${p.vx.toFixed(2)})`);
  assert.equal(planted, true, 'he plants a foot to brake');
});

test('offside: a pass to a man beyond the line gives the defenders a free kick', () => {
  const realRandom = Math.random; Math.random = mulberry32(99);
  try {
    const m = new Match(clubs[0].id, clubs[1].id, { human: null, duration: 240 });
    let g = 0; while (m.phase !== 'play' && g++ < 3000) m.update(1 / 30);
    const atk = m.teams[0]; const def = m.teams[1];
    // back line at x 70, the ball at 55, a striker alone at 85
    def.players.forEach((q, i) => { if (q.role !== 'GK') { q.x = 70; q.y = 46 + i * 2; } });
    const passer = atk.players[6]; const striker = atk.players[10];
    atk.players.forEach((q) => { if (q !== passer && q !== striker && q.role !== 'GK') { q.x = 40; } });
    passer.x = 55; passer.y = 34; striker.x = 85; striker.y = 30;
    Object.assign(m.ball, { owner: passer, x: 56, y: 34, z: 0.16 });
    const off0 = m.offsides[0];
    m.pass(passer, { x: striker.x - passer.x, y: striker.y - passer.y }, false, 0.9);
    for (let i = 0; i < 120 && m.offsides[0] === off0 && m.phase === 'play'; i++) m.update(1 / 60);
    assert.equal(m.offsides[0], off0 + 1, 'the flag went up');
    assert.equal(m.phase, 'freekick');
    assert.equal(m.setPiece?.team, 1, 'the defenders have the free kick');
  } finally { Math.random = realRandom; }
});

test('AI play produces every kind of restart', () => {
  const realRandom = Math.random;
  const seen = { throwin: 0, corner: 0, goalkick: 0, freekick: 0, offside: 0, fouls: 0 };
  const mark = Match.prototype.markStoppage;
  Match.prototype.markStoppage = function (k) { if (k in seen) seen[k]++; return mark.call(this, k); };
  try {
    for (let i = 0; i < 12; i++) {
      Math.random = mulberry32(500 + i);
      const m = new Match(clubs[i % 10].id, clubs[(i + 3) % 10].id, { human: null, duration: 240 });
      let f = 0; while (m.phase !== 'end' && f < 30000) { m.update(1 / 60); f++; }
      seen.offside += m.offsides[0] + m.offsides[1];
      seen.fouls += m.fouls[0] + m.fouls[1];
    }
  } finally { Math.random = realRandom; Match.prototype.markStoppage = mark; }
  for (const [k, v] of Object.entries(seen)) assert.ok(v / 12 > (k === 'offside' ? 0.15 : 1), `${k}: ${(v / 12).toFixed(2)} a match`);
  assert.ok(seen.throwin / 12 > 5, 'throw-ins happen');
});
