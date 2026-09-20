/**
 * The social layer, against the real server: guilds and friends over HTTP,
 * invites, spectating and emotes over the socket. Three accounts: A hosts,
 * B is A's friend and joins on an invite, C watches.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const json = (r) => r.json();
const post = (url, path, body, token) => fetch(url + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
}).then(json);
const get = (url, path, token) => fetch(url + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(json);

/** A tiny client: every message lands in a list, and `wait` resolves on the next of a type. */
function client(url, token) {
  const ws = new WebSocket(url.replace('http', 'ws') + '/ws');
  const got = [];
  const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    got.push(m);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].t === m.t) { waiters.splice(i, 1)[0].res(m); }
  });
  const wait = (t, ms = 4000) => {
    const had = got.find((m) => m.t === t);
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => {
      const w = { t, res };
      waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${t}' within ${ms}ms`)); } }, ms);
    });
  };
  const send = (m) => ws.send(JSON.stringify(m));
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { ws, got, wait, send, open, async auth() { await open; send({ t: 'auth', token }); return wait('ready'); }, close: () => ws.close() };
}

const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n}-${i + 1}`);

test('guilds, friends, invites, spectating and emotes', async () => {
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const names = ['a', 'b', 'c'].map((x) => `soc${x}${stamp}`);
    const toks = [];
    for (const n of names) {
      const r = await post(url, '/api/register', { name: n, pass: 'social-pass-123' });
      assert.ok(r.token, `registered ${n}: ${JSON.stringify(r)}`);
      toks.push(r.token);
    }
    const [A, B, C] = toks;

    // ---- guilds over HTTP
    const empty = await get(url, '/api/guild', A);
    assert.equal(empty.guild, null);
    assert.equal(empty.objectives.length, 3, 'three weekly objectives, even before joining');
    const bad = await post(url, '/api/guild', { action: 'create', name: '<script>' }, A);
    assert.ok(bad.error, 'a guild name is letters, numbers and spaces');
    const made = await post(url, '/api/guild', { action: 'create', name: 'Night Owls' }, A);
    assert.ok(made.view?.guild?.code, `guild created: ${JSON.stringify(made)}`);
    const code = made.view.guild.code;
    assert.equal(made.view.guild.tag, 'NIG');
    const joined = await post(url, '/api/guild', { action: 'join', code: code.toLowerCase() }, B);
    assert.equal(joined.view.guild.members.length, 2, 'B joined by code');
    const dup = await post(url, '/api/guild', { action: 'create', name: 'night owls' }, C);
    assert.ok(dup.error, 'guild names are unique, case-insensitively');
    const board = await get(url, '/api/guild/board');
    assert.equal(board.rows[0].name, 'Night Owls');
    assert.equal(board.rows[0].members, 2);
    const early = await post(url, '/api/guild', { action: 'claim', id: 'wins' }, A);
    assert.ok(early.error, 'nothing to claim yet');

    // ---- friends over HTTP
    const noSelf = await post(url, '/api/friends', { action: 'add', name: names[0] }, A);
    assert.ok(noSelf.error, 'cannot befriend yourself');
    const ghost = await post(url, '/api/friends', { action: 'add', name: 'nobody-here-xyz' }, A);
    assert.ok(ghost.error, 'friend must exist');
    const fr = await post(url, '/api/friends', { action: 'add', name: names[1] }, A);
    assert.equal(fr.rows.length, 1);
    assert.equal(fr.rows[0].name, names[1]);
    assert.equal(fr.rows[0].online, false, 'B is not connected yet');
    assert.equal(fr.rows[0].guild, 'NIG', 'a friend row shows the guild tag');

    // ---- sockets: invite, join, spectate, emote
    const a = client(url, A); const b = client(url, B); const c = client(url, C);
    await Promise.all([a.auth(), b.auth(), c.auth()]);
    const live = await get(url, '/api/friends', null, A).catch(() => null);
    const fr2 = await get(url, '/api/friends', A);
    assert.equal(fr2.rows[0].online, true, 'B shows online once connected');

    a.send({ t: 'host', club: 'c1', squad: squad(1), divIdx: 0 });
    const hosting = await a.wait('hosting');
    assert.match(hosting.code, /^[A-Z0-9]{4}$/);

    // an invite to a stranger is refused; to a friend it carries the code and nothing else
    a.send({ t: 'invite', to: names[2] });
    const nf = await a.wait('inviteFail');
    assert.match(nf.error, /friends/i);
    a.send({ t: 'invite', to: names[1] });
    const inv = await b.wait('invited');
    assert.equal(inv.from, names[0]);
    assert.equal(inv.code, hosting.code);
    assert.deepEqual(Object.keys(inv).sort(), ['code', 'from', 't'], 'an invite is a code and a name, nothing free-text');
    await a.wait('inviteSent');

    b.send({ t: 'join', code: inv.code, club: 'c2', squad: squad(2), divIdx: 0 });
    const [ma, mb] = await Promise.all([a.wait('match'), b.wait('match')]);
    assert.equal(ma.matchId, mb.matchId);
    assert.equal(ma.host, true);

    const list = await get(url, '/api/live');
    assert.equal(list.rows.length, 1);
    assert.equal(list.rows[0].matchId, ma.matchId);
    assert.equal(list.rows[0].spectators, 0);

    c.send({ t: 'spectate', matchId: 999999 });
    assert.match((await c.wait('spectateFail')).error, /over/);
    c.send({ t: 'spectate', matchId: ma.matchId });
    const sp = await c.wait('spectating');
    assert.equal(sp.host.name, names[0]);
    assert.equal(sp.guest.name, names[1]);
    assert.equal(sp.host.squad.length, 11);
    assert.equal((await get(url, '/api/live')).rows[0].spectators, 1);
    assert.equal((await a.wait('spectators')).n, 1, 'the host is told someone is watching');

    // the host's picture reaches the guest and the spectator; the guest's input reaches only the host
    a.send({ t: 'snap', f: 1, b: [0, 0, 0] });
    const [sb, sc] = await Promise.all([b.wait('snap'), c.wait('snap')]);
    assert.equal(sb.f, 1); assert.equal(sc.f, 1);
    b.send({ t: 'in', f: 2 });
    assert.equal((await a.wait('in')).f, 2);
    await new Promise((r) => setTimeout(r, 150));
    assert.ok(!c.got.some((m) => m.t === 'in'), 'a spectator never sees inputs');

    // nothing a spectator sends reaches the players
    c.send({ t: 'snap', f: 99 }); c.send({ t: 'in', f: 99 }); c.send({ t: 'evt', k: 'pausereq', name: 'x' });
    await new Promise((r) => setTimeout(r, 150));
    assert.ok(!a.got.some((m) => m.f === 99 || m.k === 'pausereq'), 'host got nothing from the spectator');
    assert.ok(!b.got.some((m) => m.f === 99), 'guest got nothing from the spectator');

    // emotes: ids only, to the opponent and the spectators
    a.send({ t: 'emote', id: 'gg' });
    const [eb, ec] = await Promise.all([b.wait('emote'), c.wait('emote')]);
    assert.deepEqual(eb, { t: 'emote', id: 'gg', from: names[0] });
    assert.deepEqual(ec, { t: 'emote', id: 'gg', from: names[0] });
    b.send({ t: 'emote', id: 'hello there free text' });
    b.send({ t: 'emote', id: 'nice' });
    const ea = await a.wait('emote');
    assert.equal(ea.id, 'nice', 'unknown ids are dropped, known ones relayed');

    // a result from the host counts for the guild week
    a.send({ t: 'result', scored: 3, conceded: 1, divIdx: 0 });
    await a.wait('recorded');
    const gv = await get(url, '/api/guild', B);
    const goals = gv.objectives.find((o) => o.id === 'goals');
    const wins = gv.objectives.find((o) => o.id === 'wins');
    // both players are in the guild, so the week counts both validated sides: 3 + 1 goals, one win, two matches
    assert.equal(goals.have, 4, 'goals scored by every member count for the guild');
    assert.equal(wins.have, 1);
    assert.equal(gv.objectives.find((o) => o.id === 'matches').have, 2);
    assert.equal(gv.rank, 1);

    // the match ending tells the spectator
    a.send({ t: 'leave' });
    const gone = await c.wait('oppLeft');
    assert.equal(gone.reason, 'ended');
    assert.equal((await get(url, '/api/live')).rows.length, 0);

    // leaving the guild
    const left = await post(url, '/api/guild', { action: 'leave' }, B);
    assert.equal(left.view.guild, null);
    const rm = await post(url, '/api/friends', { action: 'remove', name: names[1] }, A);
    assert.equal(rm.rows.length, 0);

    a.close(); b.close(); c.close();
  } finally { stop(); }
});
