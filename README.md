# APEX XI

An original football (soccer) card-collecting and club-management web app. Zero dependencies,
no build step — plain HTML, CSS and ES modules.

Everything in the game is fictional: clubs, players, nations, crests and the competition itself
are generated procedurally. No affiliation with any real league, club, player or existing game.

## Run it

It uses ES modules, so it needs to be served over HTTP (opening `index.html` from the file system
will not work). One command runs the whole thing — the static game, the account API and the
online match hub:

```bash
node .dev-server.js 8412
```

Then open <http://localhost:8412>.

Node is the only requirement, and there is still nothing to install: the server uses only Node's
standard library, including a hand-rolled WebSocket implementation.

## Playing online

Sign in from **Ultimate XI → Online**. An account gets you two things:

- **Cloud saves.** Your coins, collection, line-up and division rank are mirrored to the server
  on every change, so the same account picks up where it left off on another device. Progress is
  always written locally first, so the game stays fully playable with the server down or with no
  account at all.
- **Online matches.** *Division Online* queues you against a real player near your rung of the
  Apex Division ladder — results settle the same ladder, objectives and rewards as offline.
  *Private lobby* gives you a four-letter code to hand to a friend for a friendly.

Passwords are hashed with scrypt and a per-account salt; the account file is never served over
HTTP. Run locally, accounts live in `server/data/accounts.json` — delete it to reset everything.
Hosted, they belong in a Redis key instead; see [Where accounts are stored](#where-accounts-are-stored).

### Hosting it

**GitHub Pages will not run online play.** Pages is static hosting — it serves files and cannot
run Node, hold a WebSocket, or store accounts. Everything offline still works there (Kick Off,
Ultimate XI, packs, local saves, PWA install); the Online tab simply has nothing to connect to.

Two arrangements do work:

**One host, everything together** — simplest, and needs no code changes. Any platform that runs a
Node process (Render, Railway, Fly.io, a VPS) serves the game *and* the online features from one
origin. The server reads `PORT` from the environment, which is what those platforms set.

```bash
node server/server.js          # PORT comes from the environment
```

**Split: static front end + separate server** — keep the game on GitHub Pages and put only the
server elsewhere. Set the server's origin in `js/net/config.js`:

```js
export const SERVER_ORIGIN = 'https://your-app.onrender.com';
```

and start the server with the page's origin allowed, so the browser permits the cross-origin calls:

```bash
ALLOW_ORIGIN=https://you.github.io node server/server.js
```

The page must be HTTPS for this: browsers block `ws://` from an `https://` page, and
`socketURL()` follows the page's protocol automatically.

### Where accounts are stored

By default the whole account database is one JSON file, `server/data/accounts.json`. That is right
for local play and wrong for hosting: **free tiers have an ephemeral filesystem**, so the file is
wiped on every restart, sleep-wake and redeploy, taking every account and cloud save with it.

Anything hosted should point the server at Redis over HTTP instead. Two environment variables
switch it over — no code change, and no dependency, because the REST API is reachable with plain
`fetch`:

```bash
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=…
```

Create a free database at [Upstash](https://upstash.com), copy those two values out of its
dashboard, and paste them into your host's environment settings (on Render: *Environment* →
*Environment Variables*). `KV_REST_API_URL`/`KV_REST_API_TOKEN` and `REDIS_REST_URL`/
`REDIS_REST_TOKEN` are accepted as aliases, since some platforms inject those names. The whole
database lives under one key, `apexxi:accounts:v1`, which `STORE_KEY` can override.

The database is held in memory and written back on a short debounce, so a burst of saves is one
write. A failed write is retried with a widening backoff rather than dropped, and `SIGTERM` — what
a host sends ahead of a redeploy — flushes anything pending before the process exits.

Two deliberate refusals, both because the alternative loses accounts silently:

- If Redis cannot be read at start-up, the server **exits instead of starting**. Serving from an
  empty database would answer every sign-in with "no account with that name" and then write that
  emptiness back over the real thing.
- Setting only one of the URL and the token is an error, not a quiet fall back to the file.

`GET /api/health` reports which backend is live, whether it survives a restart, how many accounts
are loaded and whether a write is pending — the first thing to check if accounts go missing.

> One process at a time. The whole database is written as a single value, so two instances of the
> server would overwrite each other's accounts; keep the service at one instance (free tiers are
> anyway).

### Playing with someone on another machine

By default the server binds to your own machine. To let a friend on the same network join, point
them at your LAN address (for example `http://192.168.1.20:8412`). Over the open internet you
would need to expose the port yourself — the server has no TLS of its own, so put it behind a
reverse proxy if you do.

### How the netcode works

The server never simulates football. One of the two players is elected host and runs the ordinary
`Match` — identical physics and balance to an offline game — and broadcasts a 20 Hz snapshot of
the ball and all 22 players. The guest never simulates: it holds the same `Match` purely as a
scene and pours snapshots into it, rendering ~100 ms behind so two snapshots always bracket the
render time and can be interpolated rather than snapped to. The guest streams its stick and
buttons back at 33 Hz, with button edges accumulated between packets so a quick tap is never
dropped. The server only relays.

The trade-off is the usual one for host-authoritative play: the guest sees the world a fraction of
a second late, and the host has no input delay. It keeps the match engine honest and the server
cheap. Pausing does not stop an online match, and if someone quits the other player is awarded
the win.

## What's in it

| Screen | What it does |
| --- | --- |
| **Main Menu** | Card tiles into each mode, world stats, and a resume-career shortcut. |
| **Squad Builder** | Four pack tiers with rarity-weighted pulls and a walkout animation, a drag-and-drop formation pitch (4-3-3, 4-4-2, 4-2-3-1, 3-5-2), live squad rating and chemistry, plus quick-sell. Tap an empty slot and the collection reorders around who can actually play there; filters by rarity and by line, and sorting by rating, position, value or name. A new save starts with four packs so there is an XI to field. |
| **Career Mode** | Pick one of 10 clubs, play or sim an 18-matchday season, league table, fixtures, results, and a transfer market on a budget. |
| **Quick Match** | A **playable** full-screen 3D match you control with a gamepad, keyboard or touch. |
| **Career match sim** | Minute-by-minute event sim: possession, shots, on target, corners, commentary feed, goal flashes, and a man-of-the-match result screen. |

### Packs

The collection holds one of each player, so a pull you already own would otherwise be worth
nothing and simply vanish between the reveal and the collection — a five-card pack routinely
handed over two. Cards you do not own are drawn first, across the whole batch when several packs
are opened at once. Only when an entire rarity is exhausted does a repeat come back, and it is
paid out at its sell value, labelled on the card and counted in the results. Whatever the pack
says on the front is what lands. A pack also guarantees a goalkeeper while you have none, since
an XI without one cannot be fielded at all.

## Playing a Quick Match

Full-screen 3D, 11-a-side, broadcast camera: it sits outside the near touchline and dollies along
the pitch with the ball, panning across and easing in for far-side play.

Controls are **camera-relative**: up on the stick moves your player up the screen, right moves
right. Input is mapped through the camera's own ground axes each frame, so the stick keeps
agreeing with the picture even as the camera dollies and pans.

You control the player under the floating chevron. **Control follows the ball whenever your side
has it**, including a teammate receiving your pass. Off the ball nothing moves on its own — you
pick the presser yourself with L1 or R1.

| Action | Gamepad | Keyboard |
| --- | --- | --- |
| Move | Left stick / D-pad | WASD or arrows |
| Pass · tackle | ✕ | Space |
| Shoot — hold for power | ◯ | K |
| **Curl it up and bend** | **◯ + R1** | K + I |
| Cross | □ | J |
| Through ball | △ | L |
| Switch player | L1 or R1 | Q / E |
| Sprint | R2 | Shift |
| Pause | Options | Esc or P |

### Shooting

The ball is a real projectile: gravity, bounce, air drag, and Magnus spin. How long you hold ◯
sets both power and height — a tap is a driven shot that stays near the floor, a full hold is
much harder and rises to roughly the height of the crossbar. Overcook it from close range and it
clears the bar, which is the point.

Holding **R1 with ◯** whips it: extra lift plus sidespin, so the flight bends through the air and
straightens as it slows. Measured at full charge: ~43 m/s off the boot, peaking about 5 m high with
~13 m of sideways bend.

A DualSense works over USB or Bluetooth through the browser Gamepad API — plug it in, press any
button, and the chip top-right flips to **Pad ✓**. No pairing code or driver needed. Kick-off
requests fullscreen; the ⛶ button toggles it.

**On a phone or tablet** the controls are the ones mobile football settles on. The left half of
the screen is the stick — it appears wherever your thumb lands rather than sitting in a corner
waiting to be found — and the right hand gets named buttons that change with the situation:

| With the ball | Off the ball |
| --- | --- |
| **PASS** · **THROUGH** · **CROSS** · **SHOOT** (hold for power, the rim fills as it charges) | **TACKLE** · **SWITCH** · **SLIDE** |

**SPRINT** is the big one under the thumb in both. SWITCH matters: off the ball nothing presses on
its own, so without it defending on touch was not possible at all.

Match length (2 / 4 / 7 min) and CPU difficulty (Easy / Pro / Elite) are set before kick-off.

### The engine

Rendering runs on **three.js** (WebGL, vendored locally in `js/vendor/`, MIT licensed) — real
meshes, lambert shading, a directional sun with soft shadow maps, and the crowd as a single
`InstancedMesh` so thousands of seats cost one draw call. Measured 1.55 ms/frame at 720p against
3.9 ms for the old canvas path, with a denser crowd.

A canvas-2D renderer (`render3d.js`) is kept as an automatic fallback if a machine refuses a WebGL
context. All geometry is still generated in code — no downloaded models or textures.

Players are built to a real footballer's proportions rather than eyeballed: head a shade under an
eighth of standing height, shoulders 0.42 m across but only 0.26 m front to back, waist narrower
than both, hip at 0.94 m and knee at 0.50 m. Keeping the width and the depth of the torso apart is
most of the work — a chest with the same measurement from every angle is a barrel, which is what
the earlier figure looked like. The shirt is a cone section from shoulders to waist with its own
sleeves, the shorts are a second one over the top of the thighs, socks run knee to ankle and the
boot is a flat wedge. Height, girth and shoulder width are seeded per player off his name, so
twenty-two men are not one man copied. Hair, hands and boots are full-detail only.

These are still hand-built meshes with flat colours — no scans, no textures, no downloaded models.
That sets the ceiling: they read as footballers at broadcast distance, not as photographs of one.

The stadium is procedural — three raked stands (the fourth is where the camera sits), each with a
front wall, seating deck, back wall and roof, plus a deterministic crowd of a few thousand small
quads. The crowd is culled beyond 95 m and drops to half density past 60 m, where a seat is a
pixel or two anyway.

The ball has real height: crosses are lofted with an arc, meeting one above waist height in the box
produces a header at goal, and a ball over the crossbar is a goal kick rather than a goal. Shot
accuracy comes from the shooter's stats and distance, keepers hold the ball-to-goal line and read
each shot once with an error scaled to their rating, defenders block, and a control limit stops a
driven ball being plucked out of the air. AI-vs-AI it settles at roughly 2.9 goals and 17.7 shots
per match at 16% conversion.

### Graphics quality

**Auto** picks Low on phones and tablets — a coarse pointer, a viewport under 760px, or two cores
or fewer. Low keeps the same skeleton but squares off the limbs, drops hands, boots and hair,
thins the crowd to a third, halves the pitch stripes and circle segments, drops the goal nets, and
caps the pixel ratio at 1.25 instead of 2. Settings → **3D detail** forces High or Low.
Measured over a full match at 720p: 3.0 ms per frame at High, 1.6 ms at Low.

## Data model

Generated once from a fixed seed (`js/data/generator.js`), so saved careers keep pointing at the
same players across reloads.

- **426 players** — name, position, overall (60–99), six stats (pace / shooting / passing /
  dribbling / defending / physical), rarity tier, club, fictional nationality, age, market value.
  Overall is a position-weighted blend of the six stats, not a separate number.
- **10 clubs** — name, procedural crest (geometric shape + two-colour palette), 32-player roster,
  budget, league. Squad quality scales with club tier.
- **1 league** — 18 matchdays of double round-robin fixtures, W/D/L/GF/GA/GD/points table.
- **106 free agents** on top of club rosters, feeding packs and the transfer market. Twelve of
  them are marquee names in the special tier, unattached so pulling one never hangs on a club.

Rarity is derived from overall: bronze < 70, silver 70–78, gold 79–87, special 88+.

Players are generated in two passes. The first builds each club's 4-4-2 squad list, which has no
winger in it — that left nine LW/RW in the whole world and made the 4-3-3 unfillable. The second
adds wide and attacking depth plus the wider free pool, and it runs *after* the first on purpose:
ids are handed out in generation order, so appending keeps every saved collection pointing at the
same players.

## Layout

```
index.html
styles/main.css
js/
  app.js                 screen router, theme, toasts
  vendor/three.module.js three.js (MIT) — vendored, see three.LICENSE.txt
  state.js               localStorage save + career helpers
  matchEngine.js         career-mode match simulation
  data/pools.js          name/nation/club/formation/rarity tables
  data/generator.js      seeded world generation
  game/sim.js            real-time match: physics, AI, keeper, possession
  game/input.js          gamepad + keyboard + touch, unified
  game/renderGL.js       three.js scene: meshes, lights, shadows, instanced crowd
  game/render3d.js       canvas-2D fallback renderer
  components/playerCard.js   reusable card + SVG radar chart
  components/crest.js        procedural crests and flags
  screens/               splash, menu, squad, career, quickmatch, play, match, settings
```

## Notes

- Progress is saved to `localStorage` under `apexxi.save.v1`. Settings → **Reset save** wipes it.
- Chemistry: 2 points for an exact position match, 1 for the right positional group, plus 1 for
  club/nation links with the rest of the XI. Team chemistry is the total out of 33, scaled to 100.
- Sim speed (normal / fast / instant) and full-commentary toggle are in Settings, along with four
  accent colours and a reduce-motion switch.
- **Sound needs one interaction first.** Every browser blocks audio until the page has been
  touched — there is no setting or trick that gets around it. The game takes the first chance it
  is given: a tap, a key, a scroll, a pad button, anything, and it tries again each time the tab
  comes back to the foreground, so audio also recovers after a phone locks or a tab is
  backgrounded. Installed as a PWA it usually starts on its own. Nothing is scheduled while audio
  is blocked, because a suspended context has a stopped clock and everything queued against it
  arrives at once when it resumes.
- The icon set is generated from one master: `node tools/make-icons.js` resamples
  `assets/brand/icon-source.png` (1024px) into all five PNGs. The PNG reader, the Lanczos
  resampler and the PNG writer in that script are hand-rolled on zlib, so there is still nothing
  to install. The maskable icon is inset to 88% because Android crops it to its own shape, and
  the favicon is a crop of the ball alone — the full composition is unreadable at 16px.
