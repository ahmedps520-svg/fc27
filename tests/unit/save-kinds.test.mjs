/**
 * v175 — a save is commentated as what it was: held, tipped over, or turned
 * round the post; and a keeper's touch records which.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { say, COMMENTARY } = await import('../../js/data/commentary.js');
const { Match, PITCH } = await import('../../js/game/sim.js');
const { WORLD } = await import('../../js/data/generator.js');

test('every kind of save has its own lines, and the generic ones no longer claim a tip-over', () => {
  for (const k of ['saveCatch', 'tipOver', 'tipRound', 'save']) assert.ok(say(k, { keeper: 'K' }).includes('K'), k);
  assert.ok(!COMMENTARY.save.some((l) => /tipped over|over the bar/i.test(l)));
});

test('a keeper touch records the kind of save', () => {
  const kinds = new Set();
  for (let i = 0; i < 60; i++) {
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
    const gk = m.teams[1].players.find((p) => p.role === 'GK');
    const lineX = m.teams[1].dir > 0 ? 0 : PITCH.w;
    Object.assign(m.ball, { x: lineX + m.teams[1].dir * 3, y: 34, z: i % 2 ? 2.2 : 0.5, vx: -m.teams[1].dir * 30, vy: 0, vz: 0, shotBy: m.teams[0].players[9] });
    m.keeperContact(gk, 30);
    kinds.add(m.saveKind);
  }
  for (const k of ['over', 'round', 'parry']) assert.ok(kinds.has(k), `saw ${[...kinds]}`);
});
