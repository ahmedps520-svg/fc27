# The near relay (v202)

A small server near the players that carries an online match's snapshots and
inputs when the two phones cannot link up directly. The main server on Render
keeps accounts, saves, matchmaking, results and spectators, and is the fallback
on every packet. When the relay is off or slower, nothing changes.

```
phone A ──┐                         ┌── phone B
          ├─ direct link (WebRTC) ──┤        1st choice
          ├─ near relay ────────────┤        2nd: relay.js on the spare PC, via Cloudflare
          └─ main server (Render) ──┘        3rd: always there
```

## What runs where

| Where | What | Settings |
|---|---|---|
| Spare PC | `node relay.js` (needs `ws.js` beside it), Node 22+ | `relay.env` beside it: `RELAY_SECRET`, optional `RELAY_PORT` (8790), `RELAY_HOST` (127.0.0.1), `RELAY_LOG` |
| Spare PC | `cloudflared` as a service | tunnel token; public hostname `relay.apexxi.online` → `http://localhost:8790` |
| Render | the main server | `RELAY_URL=https://relay.apexxi.online`, `RELAY_SECRET` (the same value) |

`RELAY_SECRET` is at least 32 random characters. It is set by hand on both
machines and never put in the repo or a chat.

## How a match chooses

1. Every 30 s the main server asks `RELAY_URL/health`.
2. While the relay is up, a client that can (caps `relay`: the web game from
   v202, the iPhone app from the 1.2 build that has v202) gets `relayHi` after
   sign-in, times five round trips to the relay and five to the main server,
   and reports them (`rtt`). It measures again every 4 minutes.
3. At kick-off the main server adds a relay ticket to each player's match card
   only if the relay's summed round trips beat the main server's by 15 ms
   (`relayWins`). `RELAY_FORCE=1` skips the comparison, for trying it out.
4. Each phone opens the relay with its ticket. A packet goes direct if the
   direct link is up, else through the relay if everyone it must reach is on
   the relay, else through the main server.

## Checking it

- `https://relay.apexxi.online/health` → `{"ok":true,...}`
- `https://fc27.onrender.com/api/health` → `"relay": {"up": true, ...}`
- In a match, the bar shows `· near server` when the relay carries it.
- Render's log prints `— near relay` on each match that uses it.

## Tests

`tests/unit/relay.test.mjs` (tickets, the relay, the main server's choice, the
client); `node tests/qa/relay-match.mjs` (two browsers, the relay killed
mid-match).
