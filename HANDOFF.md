# APEX XI — where things stand

Written 2026-08-03, so work can continue from another machine.

**Live:** https://fc27.onrender.com (Render, one service serving the static game, the
`/api` account endpoints and the `/ws` match hub from a single origin).

**Run locally:** `node .dev-server.js` then open http://localhost:8412
(it hands straight over to `server/server.js`). No build step, no npm install —
there are no dependencies.

---

## Changed in the most recent session, not yet deployed

Everything below is on the local machine only.

### Online play (new)
- `server/` — zero-dependency Node server: hand-rolled RFC 6455 WebSocket
  (`ws.js`), scrypt-hashed accounts and cloud saves (`store.js`), matchmaking and
  match relay (`server.js`).
- `js/net/` — `api.js` (session + cloud save), `socket.js` (persistent connection,
  auto-reconnect), `netplay.js` (host-authoritative netcode), `config.js`
  (where the server lives; empty means same origin).
- `js/screens/online.js` — sign-in, matchmaking, private lobbies, leaderboard.
  Rendered as the **Online** tab inside Ultimate XI.
- Netcode is **host-authoritative**: one player runs the real `Match` and ships
  20 Hz snapshots; the guest never simulates and interpolates ~100 ms behind.
  The server relays and never simulates anything.

### Matchmaking
Same division only at first, widening on a timer (±1 after 8 s, ±3 after 16 s,
anyone after 25 s), widening if *either* player has waited. A 3 s sweep re-checks
waiting players so two lone people eventually find each other.

### Fixes
- **Goal replay** — the fault was pacing, not framing. Slow-motion kicked in at
  `t > 0.68` while the goal landed at `t ≈ 0.71`, so it dropped to 0.3x exactly as
  the ball stopped and ground through ~84 static frames: 44% of the replay was a
  still image of the ball in the net. Speed is now keyed off
  `GOAL_T = PRE/(PRE+POST)`, plus a deliberate 2 s hold on the finish.
- **Replay camera** — used to aim "behind the goal" at `goalX + 9`, three units
  inside the end stand. Now stays in the open near-side ground and is hard-clamped
  to a `SAFE` box in `render3d.js`.
- **Tower behind the goals** — `rotation.set(x, y, z)` applies X last, so the Z
  term only rolled the LED boards instead of turning them; at ±90° the goal-end
  runs stood on end as 80-unit towers. Both end boards removed.
- **Career Mode** locked ("under construction") at both the tile and the route.
- **Ultra quality** added — renders at 2x native (4x the pixels), 4K shadows,
  ~3x crowd, 22 terrace rows.

### Models groundwork
`GLTFLoader` (r160) vendored, `.glb`/`.gltf` MIME types added, `GET /api/models`
lists `assets/candidates/`, and `model-preview.html` auto-discovers dropped files,
normalises each to 1.8 m, plays its idle clip and reports triangles and clips.

---

## Open items

1. **Render's free tier has an ephemeral filesystem.** `server/data/accounts.json`
   is wiped on every restart, sleep-wake and redeploy, so accounts and cloud saves
   silently vanish. This is the most important thing left. Needs a hosted
   key-value store — Upstash Redis has a REST API that works with plain `fetch`,
   which would keep the zero-dependency setup intact. Configurable entirely
   through a web dashboard.
2. **Player models.** Free, directly-downloadable *footballer* models don't exist:
   Poly.pizza has none, Sketchfab and Mixamo have good ones but need a login.
   Get a `.glb` from Mixamo (free Adobe account, and it supplies run/idle/kick
   animations), drop it in `assets/candidates/`, and the preview page will show it.
   Budget roughly 15k triangles per model — there are 22 on the pitch.
3. **CPU attackers don't make runs into the box**, so headers off crosses are rare.
   Long-standing, never requested. Note that a previous off-ball AI rewrite
   destroyed possession (shots fell 17 → 2.8) and had to be reverted — change this
   only with an AI-vs-AI sweep measuring goals, shots and turnovers.

## Rules that keep biting

- **Never re-balance the match by feel.** Always sweep AI-vs-AI
  (`new Match(a, b, {human: null})` stepped at 1/60) and measure goals, shots and
  turnovers per match. Target is roughly 2–3 goals and ~11 shots.
- **Cameras must stay inside the bowl.** Only the near touchline is open; the far
  touchline and both goal ends are stands. Outside
  `x ∈ [-6, PITCH.w+6]`, `y < PITCH.h+6` is inside terracing.
- `server/data/` is gitignored — it holds password hashes. Keep it that way.
