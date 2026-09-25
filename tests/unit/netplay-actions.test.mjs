/**
 * v108: every button the sim reads from a person reaches the host from a
 * guest — the chip (LOB added to a held SHOOT), SKILL, JOCKEY and PRESS were
 * dropped on the wire — and the mask stays readable by a build that only
 * knows the first eight bits.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { InputSender, RemoteInput } = await import('../../js/net/netplay.js');
const { ACTIONS } = await import('../../js/game/input.js');

function wire() {
  const held = new Set();
  const local = { held: (a) => held.has(a), axis: () => ({ x: 0, y: 0 }) };
  const packets = [];
  const tx = new InputSender(local, 0, (m) => packets.push(m));
  const rx = new RemoteInput();
  const frame = () => { tx.tick(1 / 60); for (const m of packets.splice(0)) rx.accept(m); rx.poll(1 / 60); };
  return { held, frame, rx, packets, tx };
}

test('every action a person can hold reaches the host', () => {
  for (const a of ACTIONS.filter((x) => x !== 'pause')) {
    const w = wire(); w.frame(); w.held.add(a); w.frame();
    assert.ok(w.rx.held(a) && w.rx.pressed(a), `${a} is held and pressed on the host`);
    w.held.delete(a); w.frame();
    assert.ok(w.rx.released(a), `${a} is released on the host`);
  }
});

test('the chip survives the wire: LOB still held on the frame SHOOT lets go', () => {
  const w = wire(); w.held.add('shoot'); w.frame(); w.frame();
  w.held.add('lob'); w.frame();
  w.held.delete('shoot'); w.frame();
  assert.ok(w.rx.released('shoot') && w.rx.held('lob'));
});

test('the first eight bits mean what they always meant (a build behind reads them the same)', () => {
  const OLD = ['pass', 'shoot', 'cross', 'through', 'switch', 'curl', 'sprint', 'pause'];
  const w = wire(); w.held.add('curl'); w.held.add('lob'); w.held.add('sprint');
  const out = []; const tx = new InputSender({ held: (a) => w.held.has(a), axis: () => ({ x: 0, y: 0 }) }, 0, (m) => out.push(m));
  tx.tick(1 / 60);
  const oldReads = OLD.filter((a, i) => out[0].h & (1 << i));
  assert.deepEqual(oldReads, ['curl', 'sprint']);
});

/* v111: the guest never simulates, so the scorer's celebration and the goal's
   clock have to come over the wire, or a guest sees the generic cheer frozen
   mid-hop. */
test('a guest sees the scorer’s own celebration and the goal clock running', async () => {
  const { encodeSnapshot, SnapshotView } = await import('../../js/net/netplay.js');
  const { Match, setField } = await import('../../js/game/sim.js');
  const { WORLD } = await import('../../js/data/generator.js');
  setField('full');
  const host = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0, celebration: 'backflip' });
  const guest = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { duration: 600, human: 0 });
  const scorer = host.teams[0].players[9];
  host.phase = 'play'; host.ball.lastTouch = scorer; host.scoreGoal(0);
  host.celebT = 1.25;
  const snap = encodeSnapshot(host);
  new SnapshotView(guest).apply(snap, snap, 0);
  const g = guest.teams[0].players[9];
  assert.equal(g.celebKind, 'backflip');
  assert.equal(guest.celebT, 1.25);
  assert.equal(guest.teams[1].players[9].celebKind ?? null, null);
  // an older host's snapshot, without the fields, leaves the guest on the plain cheer
  const old = { ...snap }; delete old.ck; delete old.ct;
  new SnapshotView(guest).apply(old, old, 0);
  assert.equal(g.celebKind, null);
});
