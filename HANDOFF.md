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

### Durable accounts (was open item 1)
`server/store.js` now picks its backend from the environment: Redis over HTTP
when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are both set,
otherwise the old JSON file. The REST API is reached with plain `fetch`, so
there is still nothing to install. Details in the README under *Where accounts
are stored*; the short version:

- Whole database under one key (`apexxi:accounts:v1`, override with `STORE_KEY`),
  held in memory, written on a 400 ms debounce.
- Failed writes retry with a widening backoff (1 s → 30 s) instead of being
  dropped; `SIGTERM` flushes anything pending, which is what a host sends before
  a redeploy.
- Unreadable storage at start-up **exits the process**. Serving an empty database
  would tell everyone their account does not exist and then write that over the
  real one. Half-configured credentials are an error too, not a quiet fall back.
- `GET /api/health` says which backend is live, whether it is durable, how many
  accounts are loaded and whether a write is pending.
- One instance only: the database is written as a single value, so two servers
  would clobber each other.

**Still to do on the live site:** create the Upstash database and paste the two
values into Render's environment settings. Until that happens the deployment
keeps using the ephemeral file and accounts still vanish on restart — the server
logs a warning at start-up when it notices it is doing that on a host.

### Squad building
- **The world had no wingers.** Club rosters are a 4-4-2 squad list, so LW/RW
  only ever appeared among free agents: 9 of them in 254 players, against a
  4-3-3 that needs two. A second generation pass adds wide and attacking depth
  per club, a wider free pool and twelve marquee free agents — 426 players,
  LW 5→32 and RW 4→31, specials 6→18. It runs *after* the original passes so
  every existing id still points at the same player (verified: 0 of the
  original 254 changed).
  AI-vs-AI over 40 matches before and after: goals 2.50 → 2.35, shots
  12.30 → 12.32, possession 50.5 → 50.3. Club ratings move by at most a point
  and every club moves together.
- **Pack pulls were being thrown away.** The collection holds one of each
  player and duplicates were dropped on the floor — 60 cards from twelve gold
  packs produced 50 players, and the pack said nothing about it. Draws now
  avoid what you already own across the whole batch, and a genuine repeat (only
  when a rarity is exhausted) pays its sell value and says so on the card and
  in the results.
- Tapping an empty slot reorders the collection around who can play there, with
  Fits / Near / Out of position on each card; filters by line and sorting were
  added alongside the rarity chips.
- New saves start with four packs, and a pack guarantees a keeper while you own
  none. A fresh save now opens into a full XI at 74–78 rated, 64–70 chemistry.

### Menu, audio, icons
- **Back arrow showed on the main menu.** `.icon-btn` sets `display: grid`,
  which outranks the browser's own `[hidden] { display: none }` — an attribute
  selector loses to a class. There is now one global `[hidden]` rule with
  `!important`; the per-component `[hidden]` rules dotted around the stylesheet
  were the same bug being patched one element at a time.
- **Audio.** The music loop was being scheduled into a suspended context, whose
  clock is stopped: 19 notes were queued at the same instant before the first
  click and arrived together on unlock, and a context suspended by
  backgrounding the tab never came back for the rest of the session. Nothing is
  scheduled unless the context is running, `onstatechange` rebuilds the loop,
  and the unlock is attempted from any gesture (tap, key, scroll, wheel, pad
  button), on regaining focus, and once speculatively at load — which is enough
  for an installed PWA to start with no interaction at all. The one-gesture
  rule itself is not something a page can opt out of.
- **Icons** are now the real key art. The master lives at
  `assets/brand/icon-source.png` (1024px) and `tools/make-icons.js` resamples
  the five outputs from it — the script grew a PNG reader and a Lanczos
  resampler so it still runs on plain Node with nothing installed. The maskable
  icon is inset to 88%, which keeps the whole AXI wordmark inside the circle
  Android masks it to (checked against a circular mask). The favicon is a crop
  of the ball on its own: at 16px the full composition is green mush, while the
  ball still reads as a football. `sw.js` cache bumped to `apexxi-v4`.

### Touch controls
Rebuilt on the layout every mobile football game uses, because the old one was
close to unplayable: a fixed 104px ring, four 46px buttons wearing PlayStation
glyphs, and — the real problem — **no switch button at all**, so off the ball,
where nothing presses unless you pick the presser, defending could not be done.

- Left half of the screen is the stick; it spawns under the thumb wherever that
  lands, clamped away from the screen edges.
- Right hand gets named buttons, 68px (sprint 88px), colour-ringed: with the
  ball PASS / THROUGH / CROSS / SHOOT, off it TACKLE / SWITCH / SLIDE with the
  cross slot hidden. Swapped from `match.ball.owner.team` each frame.
- The shoot button fills its rim with the charge held on the shot.
- A press sets the input before it asks for pointer capture: capture can be
  refused and must never be what decides whether the press counted. Releasing
  clears both bindings of the slot, since the context can flip mid-press.

### Player models
Rebuilt from real proportions. The old figure was a barrel: a round 0.4 m
capsule torso, the same measurement from every angle, with the head sunk into
it. Now the torso is a cone section that is 0.42 m across the shoulders and
0.26 m front to back, with its own sleeves, shorts as a second section over the
thighs, socks, and a flat wedge for a boot. Height, girth and shoulder width are
seeded per player off his name.

Two things worth knowing if you touch this code:
- `ovalSegment` rolls a part about its own length so the wide axis lies across
  the shoulders. That roll is derived for a bone that is roughly vertical. The
  diving keeper is the one place it does not hold, so the dive uses a round
  cross-section, where the roll cannot be wrong.
- Cone sections take their wide face at the geometry's +Y, so the wide end has
  to be named second. Naming it first is what made the first attempt look like
  it was wearing a dress.

**This is as far as procedural geometry goes.** What FC has is photogrammetry:
scanned meshes with albedo, normal and roughness textures, on a skinned rig with
mocapped animation. None of that can be authored from code here. The path to it
is the one already set up in `assets/candidates/` — a rigged `.glb` (Mixamo is
free, needs an Adobe login, and supplies run/idle/kick), then GLTFLoader plus
skinning wired into `renderGL`, 22 instances sharing one geometry.

---

## Open items

1. **Player models, for real.** The procedural figures are now properly
   proportioned, but photoreal needs a scanned mesh and textures, which cannot
   be authored from code. Free, directly-downloadable *footballer* models don't
   exist: Poly.pizza has none, Sketchfab and Mixamo have good ones but need a
   login. Get a `.glb` from Mixamo (free Adobe account, and it supplies
   run/idle/kick animations), drop it in `assets/candidates/`, and the preview
   page will show it. Budget roughly 15k triangles per model — there are 22 on
   the pitch. Wiring it in means GLTFLoader plus a skinned rig in `renderGL`,
   replacing `buildPlayer`/`posePlayer`.
2. **CPU attackers don't make runs into the box**, so headers off crosses are rare.
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
