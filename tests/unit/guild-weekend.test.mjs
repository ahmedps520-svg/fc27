/**
 * v195 — guild weekends (server/store.js): inside the Friday 18:00 → Monday
 * 06:00 UTC window members' validated wins add to the guild's total, each
 * account's first GW_CAP only; outside it nothing counts; once it shuts the
 * places are frozen and every member who played claims the reward for the
 * guild's place, once. Store-level, against a scratch data folder, with the
 * clock passed in.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
process.env.APEX_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'apex-gw-'));
const store = require('../../server/store.js');
const guard = require('../../server/guard.js');

const SAT = Date.parse('2026-10-17T12:00:00Z');          // inside the 2026-10-16 weekend
const THU = Date.parse('2026-10-15T12:00:00Z');          // before it opens
const TUE = Date.parse('2026-10-20T12:00:00Z');          // after it shut
const NEXT_SUN = Date.parse('2026-10-25T12:00:00Z');     // the next one, still open
const LATER = Date.parse('2026-10-27T12:00:00Z');        // the next one shut too
const acct = (name) => store.register(name, 'guild-weekend-1').account;
const win = (a, now, n = 1) => { for (let i = 0; i < n; i++) store.recordResult(a, { scored: 2, conceded: 1, divIdx: 3 }, now); };
const loss = (a, now) => store.recordResult(a, { scored: 0, conceded: 1, divIdx: 3 }, now);

test('the server reckons the same window as the client', async () => {
  const { weekendWindow } = await import('../../js/weekend.js');
  for (const t of ['2026-10-16T17:59:59Z', '2026-10-16T18:00:00Z', '2026-10-18T23:00:00Z', '2026-10-19T05:59:59Z', '2026-10-19T06:00:00Z', '2026-10-22T09:00:00Z']) {
    const s = guard.weekendWindow(new Date(t)); const c = weekendWindow(new Date(t));
    assert.equal(s.id, c.id, t); assert.equal(s.open, c.open, t); assert.equal(s.closesAt, c.closesAt.getTime(), t);
    assert.equal(guard.weekendIdNow(new Date(t)), c.open ? c.id : null);
  }
});

test('guild weekends: counted in the window, capped per account, frozen, claimed once by those who played', async () => {
  await store.load();
  const stamp = Date.now().toString(36).slice(-5);
  const [a, b, c, d, e, f] = ['a', 'b', 'c', 'd', 'e', 'f'].map((x) => acct(`gw${x}${stamp}`));
  const red = store.createGuild(a, `Red ${stamp}`).guild;
  store.joinGuild(b, red.code); store.joinGuild(c, red.code);
  const blue = store.createGuild(d, `Blue ${stamp}`).guild;
  store.joinGuild(e, blue.code);
  const green = store.createGuild(f, `Green ${stamp}`).guild;

  // before the window opens: the week counts it, the weekend does not
  win(a, THU);
  assert.equal(store.guildWeekendView(a, THU).open, false);
  assert.equal(store.guildWeekendView(a, SAT).guild.wins, 0);

  // Saturday: Red 3 + 2 (B played and lost too), Blue 4, Green only lost
  win(a, SAT, 3); win(b, SAT, 2); loss(b, SAT); loss(c, SAT);
  win(d, SAT, 2); win(e, SAT, 2);
  loss(f, SAT);
  let v = store.guildWeekendView(a, SAT);
  assert.equal(v.open, true); assert.equal(v.id, '2026-10-16');
  assert.deepEqual([v.guild.wins, v.guild.rank, v.guild.of], [5, 1, 2], 'Green has no win: unranked');
  assert.equal(v.guild.you, 3);
  assert.deepEqual(v.guild.top.map((x) => x.wins), [3, 2], 'C lost: not among the winners');
  assert.deepEqual(v.board.map((r) => [r.name, r.wins]), [[red.name, 5], [blue.name, 4]]);

  // the cap: E's wins past GW_CAP do not count, wherever E plays them
  win(e, SAT, store.GW_CAP + 4);
  v = store.guildWeekendView(e, SAT);
  assert.equal(v.guild.wins, 2 + store.GW_CAP, 'D 2 + E capped');
  assert.equal(v.guild.you, store.GW_CAP);
  store.leaveGuild(e); store.joinGuild(e, red.code);
  win(e, SAT, 3);
  assert.equal(store.guildWeekendView(a, SAT).guild.wins, 5, 'a capped account adds nothing to its new guild either');
  store.leaveGuild(e); store.joinGuild(e, blue.code);

  // nothing to claim while it is open (the weekend before had nobody)
  assert.ok(store.claimGuildWeekend(a, SAT).error);

  // Tuesday: shut and frozen — Blue first, Red second
  v = store.guildWeekendView(a, TUE);
  assert.equal(v.open, false); assert.equal(v.boardId, '2026-10-16');
  assert.deepEqual(v.board.map((r) => r.name), [blue.name, red.name]);
  assert.deepEqual([v.last.rank, v.last.of, v.last.claimable], [2, 2, true]);
  assert.equal(v.last.pack, 'gold'); assert.equal(v.last.apex, 4000);
  // results after the close change nothing
  win(a, TUE, 40);
  assert.equal(store.guildWeekendView(a, TUE).last.wins, 5);

  const r = store.claimGuildWeekend(a, TUE);
  assert.equal(r.reward.rank, 2); assert.equal(r.reward.pack, 'gold'); assert.equal(r.reward.apex, 4000);
  assert.match(store.claimGuildWeekend(a, TUE).error, /Already/);
  assert.equal(store.claimGuildWeekend(c, TUE).reward.rank, 2, 'C played (and lost): still a claim');
  assert.equal(store.claimGuildWeekend(d, TUE).reward.pack, 'prime', 'Blue won it');
  assert.match(store.claimGuildWeekend(f, TUE).error, /no weekend result/, 'Green: no win, no reward');

  // a member who joined after it shut did not play for it
  const late = acct(`gwl${stamp}`);
  store.joinGuild(late, red.code);
  assert.match(store.claimGuildWeekend(late, TUE).error, /played for the guild/);
  assert.equal(store.guildWeekendView(late, TUE).last.played, false);

  // Blue folding now moves nobody: Red stays second
  store.leaveGuild(d); store.leaveGuild(e);
  assert.equal(store.claimGuildWeekend(b, TUE).reward.rank, 2);

  // the next weekend: last weekend's reward is still claimable while it runs; then it is gone
  win(c, NEXT_SUN);
  v = store.guildWeekendView(c, NEXT_SUN);
  assert.equal(v.id, '2026-10-23'); assert.equal(v.guild.wins, 1); assert.equal(v.last.id, '2026-10-16');
  assert.equal(store.guildWeekendView(c, LATER).last.id, '2026-10-23');

  // a deleted account's name leaves the record; the total stays
  store.deleteAccount(c, 'guild-weekend-1');
  const g = store.guildWeekendView(a, NEXT_SUN);
  assert.equal(g.guild.wins, 1); assert.deepEqual(g.guild.top, []);

  // no guild: the board, no guild line
  const lone = acct(`gwn${stamp}`);
  const nv = store.guildWeekendView(lone, SAT);
  assert.equal(nv.guild, null); assert.equal(nv.last, null); assert.ok(nv.board.length >= 1);
  assert.equal(store.guildWeekendView(null, SAT).guild, null, 'signed out: the board only');
  await store.shutdown();
});
