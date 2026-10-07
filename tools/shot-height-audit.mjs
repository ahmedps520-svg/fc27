/**
 * v174: how high shots are when a keeper meets them, how high goals go in,
 * and how many are tipped over the bar, over 40 CPU matches.
 *   node tools/shot-height-audit.mjs
 * Before v174 no goal went in above 1.6 m (p75 0.53 m) and nothing was tipped
 * over; after, p90 1.26 m, 9 of 162 above 1.6 m, 7 tipped over.
 */
import '../tests/unit/_dom.mjs';
const { Match } = await import('../js/game/sim.js');
const { WORLD } = await import('../js/data/generator.js');
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
let tips = 0, saves = 0, own = 0;
for (let i = 0; i < 40; i++) {
  Math.random = mulberry32(50 + i);
  const C = WORLD.clubs; const m = new Match(C[i % 20].id, C[20 + (i % 20)].id, { human: null, duration: 360 });
  const kc = m.keeperContact.bind(m);
  m.keeperContact = (gk, sp) => { const z = m.ball.z; (globalThis.Z ||= []).push([z, Math.abs(m.ball.x - (m.teams[gk.team].dir > 0 ? 0 : 105))]); const r = kc(gk, sp); saves++; if (z > 2 && m.ball.vz >= 6 && Math.abs(m.ball.vx) < 3.6) tips++; return r; };
  const sg = m.scoreGoal.bind(m); m.scoreGoal = (side, ...a) => { if (m.ball.lastTouch?.role === 'GK' && m.ball.lastTouch.team !== side) own++; return sg(side, ...a); };
  for (let k = 0; k < 360 * 60 * 1.5 && m.phase !== 'end'; k++) m.update(1 / 60);
}
console.log(`40 matches: ${saves} saves, ${tips} tipped over the bar, goals off a keeper's last touch ${own}`);
const Z = globalThis.Z.map((a) => a[0]).sort((a, b) => a - b); console.log('height at contact p50/p75/p90/p97/max', [0.5, 0.75, 0.9, 0.97, 1].map((q) => Z[Math.min(Z.length - 1, Math.floor(q * Z.length))].toFixed(2)).join(' / '));
const X = globalThis.Z.filter((a) => a[0] > 1.6).map((a) => a[1].toFixed(1)); console.log('distance off the line for the high ones', X.join(' '));
// heights at which goals go in (second pass)
const GZ = [];
for (let i = 0; i < 40; i++) {
  Math.random = mulberry32(50 + i);
  const C = WORLD.clubs; const m = new Match(C[i % 20].id, C[20 + (i % 20)].id, { human: null, duration: 360 });
  const sg = m.scoreGoal.bind(m); m.scoreGoal = (...a) => { GZ.push(m.ball.z); return sg(...a); };
  for (let k = 0; k < 360 * 60 * 1.5 && m.phase !== 'end'; k++) m.update(1 / 60);
}
GZ.sort((a, b) => a - b);
console.log(`${GZ.length} goals, height over the line p25/p50/p75/p90/max`, [0.25, 0.5, 0.75, 0.9, 1].map((q) => GZ[Math.min(GZ.length - 1, Math.floor(q * GZ.length))].toFixed(2)).join(' / '), `· above 1.6 m: ${GZ.filter((z) => z > 1.6).length}`);
