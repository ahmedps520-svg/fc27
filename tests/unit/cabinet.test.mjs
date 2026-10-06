/** v152 — the trophy cabinet: one entry per real win, and old careers' trophies read back. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
const { addTrophy, cabinet } = await import('../../js/cabinet.js');

test('a win goes in once, however often it is recorded', () => {
  const club = {};
  addTrophy(club, { kind: 'league', title: 'Premier Division title', sub: 'x', key: 'car:1:2:league' });
  addTrophy(club, { kind: 'league', title: 'Premier Division title', sub: 'x', key: 'car:1:2:league' });
  addTrophy(club, { kind: 'cup', title: 'Cup winners', key: 'car:1:2:cup' });
  assert.equal(club.cabinet.length, 2);
});

test('an old save shows the titles its careers already won, without doubling a recorded one', () => {
  const s = {
    club: { cabinet: [{ kind: 'league', title: 'Premier Division title', key: 'car:7:2:league', at: 5 }] },
    career: { started: 7, history: [{ season: 1, pos: 3 }, { season: 2, pos: 1 }, { season: 3, pos: 1 }] },
    pro: { name: 'Sam', trophies: [{ season: 4, name: 'Premier Division title' }, { season: 4, name: 'Cup' }, { season: 5, name: 'Golden boot' }] },
  };
  const list = cabinet(s);
  assert.equal(list.filter((t) => t.key.startsWith('car:')).length, 2, 'seasons 2 (recorded) and 3 (read back)');
  assert.deepEqual(list.filter((t) => t.key.startsWith('pro:')).map((t) => t.kind).sort(), ['award', 'cup', 'league']);
  assert.deepEqual(cabinet({ club: {} }), []);
});
