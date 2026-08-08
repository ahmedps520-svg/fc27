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

**Live and durable since 2026-08-08.** An Upstash database is wired into
Render's environment, and `/api/health` reports
`backend: redis (fluent-guppy-206491.upstash.io key apexxi:accounts:v1)` with
`durable: true`. If that ever reads `file (...)` again, the two environment
variables have gone missing from the service and accounts are being lost on
every restart.

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

**This is as far as procedural geometry goes**, and it is now the *fallback*
rather than the default — see "Scanned players" below. The built-in figures are
still built every match and stay visible until the 14 MB model has actually
arrived, so a kick-off never waits on a download and a failed fetch costs
nothing but the look.

### Stamina
Added to the simulation, which had none. Drained by how hard a player is
actually running rather than by whether a sprint button is held, so the CPU
tires on the same terms a person does; the drain only bites above two-thirds of
top speed, and recovery is slower than the drain. A spent player runs at 82% of
his top speed — slower, never stopped. `physical` sets how fast he empties and
refills. The bar in the match HUD follows whoever you are steering, which means
the name on it changes when control switches; that is correct, not a bug.

The three constants were **swept AI-vs-AI, not chosen by feel**, per the rule at
the bottom of this file. The figures first recorded here — 2.08 goals, 12.0
shots — came off a 24-match sweep and were not reliable; re-measured over 40
matches the same code gives **3.02 goals and 11.95 shots**, against 3.20 and
12.5 before stamina. The conclusion stands, the numbers were noise. See the
sweep-size rule at the bottom. The first attempt used a drain rate that emptied a sprinting
player in 26 seconds — remember that a match is 240 real seconds standing in for
90 minutes, so anything per-second has to be budgeted against that, not against
a real 90 minutes.

Stamina rides the wire as slot 7 of each player in a snapshot. Those slots are
positional and **append-only**, same rule as `PHASES`.

### Scanned players (`js/game/playerModel.js`)
One Mixamo character, loaded once, `SkeletonUtils.clone`d twenty-two times, one
`AnimationMixer` each. Four things are worth knowing before touching it:

- **Two nested objects, not one.** The outer object carries the player's
  position and heading; the inner one carries the y-up-centimetres to
  z-up-metres correction. They cannot be the same object: tipping the model and
  then spinning it about its own axis rolls the player flat onto the grass
  instead of turning him. That is exactly what the first attempt did.
- **The character's forward is -Y once tipped**, so the heading is
  `atan2(dirY, dirX) + π/2`. The sign is easy to get wrong and the symptom —
  everyone running backwards — is easy to miss at match camera distance.
- **The kit is painted per mesh, not per pixel.** The asset splits shirt,
  shorts, socks, body, boots and hair into separate meshes sharing two
  materials, so the garment is known from the mesh name. An earlier plan
  isolated the kit by lightness and saturation in the shared atlas; that was
  never needed and would have been fragile. `recolour` keeps the cloth's own
  brightness and puts the new colour under it, so folds and seams survive.
- **Variation is uniforms, not assets.** Skin tone, hair colour, baldness,
  height, build, head shape, sock colour and boot colour are all seeded off the
  player's name and id, so a given footballer is always himself. Facial bones do
  not exist on this rig, so a "different face" is head scale on three axes —
  enough at match distance, and the honest ceiling without a second asset.
- **Root motion is cancelled by pinning the hips.** The clips walk the character
  across the floor; the match owns where he is.
- **Never map a movement state onto a clip whose name contains an action.** The
  sprint state was pointed at `strike_foward_jog`, which is a jog *with a strike
  in it*, so every sprinting player kicked at thin air for the whole match. There
  is no sprint clip in this set: walking, jogging and sprinting are all
  `jog_forward` with `timeScale` set from the player's ground speed, which also
  cures foot sliding.

### Crests (`js/components/crest.js`)
A badge is an outline, a field pattern, a device and a name band — the first
version had the outline and the name only, which is why every club looked like a
placeholder. All four now come from `CLUB_BLUEPRINTS`, and each club's device
means something about its name. Two things to keep in mind:
- **There are two builds, chosen by `size`.** Under 28px the device and the band
  are dropped and the initials are drawn large, because the badge has to survive
  being 20px in the match scoreline.
- **The band takes the ink colour and the letters take the field colour.** Doing
  it the other way round paints dark text onto a dark band.

### The first-goal freeze (online)
Reported as "when the first goal scores in online the other opponent's screen
freezes for the whole game", and that is exactly what happened.

`goalTeam` and `scorerName` are written by the simulation. A guest never
simulates, so both were `undefined` there, and nothing in the snapshot carried
them. The moment a snapshot moved the guest's phase to `goal`, the frame loop
ran `match.teams[match.goalTeam]` — `teams[undefined]` — and threw a TypeError
reading `.colors` (and `.dir`, a few lines earlier, in `captureGoal`).

What turned one line into a dead match: `raf = requestAnimationFrame(frame)`
was the **last statement of the frame body**, so anything that threw above it
skipped the request and the loop was never scheduled again. The socket stayed
up and the host played on, which is why it looked like a freeze rather than a
crash.

Three fixes, and the third is the one that matters most:
1. `gt` and `sn` ride in the snapshot, so the guest knows who scored — its goal
   card and replay camera were wrong even when they did not throw.
2. `scoringTeam()` falls back to whichever score moved, so a missing field is
   never read as `teams[undefined]` again.
3. **The frame is wrapped, and the next one is requested from a `finally`.** A
   throw now costs one frame and logs once, not the rest of the match.

Confirmed both ways. In a real two-client match the guest froze at 55' and 0-0
while the host played on to 58' with the link still reading 4 ms. Goals are too
rare to test on (four test matches finished 0-0), so the repeatable version
takes the last snapshot a live guest received, flips its phase to `goal`, and
hands it back to that guest's own socket — the same packet a scoring host
sends. Before: `TypeError: Cannot read properties of undefined (reading 'dir')`
and a clock stuck on 1' for the next 28 seconds. After: no error, clock runs
2' → 12' straight through. Repeated with `gt`/`sn`/`st` stripped from the packet,
standing in for a host on the old build: still fine, which is the score-delta
fallback doing its job. The script is `goalpacket.mjs` in the session scratch.

Also folded in: shots and shots-on-target ride in the snapshot and the guest
rebuilds its scorer list from `gt`/`sn`, so its match facts and full-time screen
show real numbers instead of zeroes; the replay advances against the clock
rather than per frame, so a guest at 30 fps no longer sits out twice as much of
the match as the host; and a stale stream during a replay no longer claims to
be "reconnecting…", since the host stops broadcasting while it plays one.

---

## Open items

1. **Scanned players on a real phone.** The integration is done and the models
   render, but the triangle budget was never measured on hardware — 48,140 each,
   twenty-two of them, is 1.06 M triangles a frame. The game now ships on Ultra
   with Realistic models and asks the player once, after their first full match,
   whether to keep that. If a phone turns out to be hopeless, the honest fix is
   a decimated second asset, not a different default.

2. **The crest devices are geometry, not artwork.** Ten hand-written SVG paths.
   They read at size and they are distinct, but a designer would do better, and
   the format (one path function per device) makes replacing any one of them a
   contained change.
3. **CPU attackers don't make runs into the box**, so headers off crosses are rare.
   Long-standing, never requested. Note that a previous off-ball AI rewrite
   destroyed possession (shots fell 17 → 2.8) and had to be reverted — change this
   only with an AI-vs-AI sweep measuring goals, shots and turnovers.

### Hold to pass
Pass charges while held and fires on release, exactly like the shot, on all
three input types — they all land on the same `pass` action, so there is nothing
per-device about it. Power buys reach (14m at zero, 58m at full) and pace, and
costs a little accuracy at the top. Three things are load-bearing:
- **A tap has a 0.3 floor.** One frame of hold would otherwise be a three-yard
  nudge, and a quick pass has to keep playing the way it always did.
- **Losing the ball clears the charge**, or a hold started in possession would
  bank a pass you never meant to make.
- **The CPU passes through the same function** and never holds a button, so its
  power is stated explicitly at 0.75 — which reproduces the flat 48m range it
  had before power existed. That was the point: add the mechanic, don't move the
  balance.

### The crowd
People, not capsules: a seated figure of about sixty triangles, two instanced
meshes sharing one set of transforms — bodies tinted with a shirt colour, heads
with a skin tone. One mesh could not do that, because an instance carries a
single colour, and a face the colour of the shirt is what made the old crowd
read as jellybeans. A third of them stand, all of them vary in size and angle.

Authored **Z-up, facing +Y**, the same convention the seats use, so a spectator
takes the identical `rotation.set(0, 0, face)` its seat gets. The first version
built them Y-up and tipped them, and the facing rotation then rolled the whole
stand onto its side.

### Two currencies and the reset
`club.coins` is gone. `club.apex` is the earned, spendable balance; `club.ultimate`
is displayed everywhere and granted nowhere — it exists so the save format, the
wallet and the settings screen already know about it before it means anything.

`state.js` carries a `RESET_TAG`. Bump it and every save is wiped back to a fresh
start exactly once, and `flags.apology` is set so Ultimate XI can explain itself
the next time it is opened. Two things about that wipe are load-bearing:
- **It persists immediately.** The first version only reset in memory, so it
  re-ran on every load — which would have taken back anything earned in between.
- **It leaves career alone.** The reset is about the Ultimate XI economy.

Match pay is `matchApex(div, {won, drew, poss})`: the division sets the purse,
possession scales it 0.8x to 1.2x across the realistic 35–65% band. A loss with
all the ball still pays a fraction of a win without it.

### Icons and Limited Edition
Eight players in the world are `rarity: 'icon'`, all 99, all unattached,
appended last in the generator for the usual id-stability reason. `rarityFor`
deliberately never returns `'icon'` — the tier is stamped on by hand, or a 97
turning up in the league would silently join it.

There is a second named tier below them: twenty **Stars** at 92, also real
players, also unattached. Fifteen Icons and twenty Stars, covering every
position in both tiers — a pure Icon XI fills a 4-3-3 or a 4-4-2 on exact
positions, which is why there are two centre-backs, two central midfielders and
two strikers among them rather than a tidy one-per-position twelve.

**Named cards are emitted in two waves.** Ids are handed out in creation order,
and the original eight Icons and twelve Stars are already in people's
collections, so anything added later carries `added: true` and is generated
after *both* original lists. Appending four Icons in place would have shifted
every Star by four and quietly turned a saved Vinicius into a Rodri. There is a
check for this in the scratchpad (`idcheck.mjs`): it walks every id from the
previous build and asserts it still resolves to the same player. Run it after
touching the generator.

The two Limited packs do not roll for their headline card, they **promise** it.
`guarantee` names a rarity that replaces exactly one card in the pack after
every other rule has run, so Limited: Stars is always one 92 and Limited: Icons
is always one 99 — which random one is the only thing left to chance. Twelve
wins is too far to come to be told no. Measured over 3,000 opens of each
through the real draw code: 100% contain exactly one, none contain zero, and
none hand over the set. `__openPackForTest` is exported so that can be repeated.

**The Icons name real footballers**, at the project owner's explicit direction:
an original-name set was built first, the exposure was put to them, and they
asked for the real names. Worth keeping in mind if this ever goes further than a
personal project — player names and likenesses are licensed property, and the
football games that carry them pay heavily for the right. Two things limit the
exposure deliberately, and should stay:
- **No likenesses.** The card portraits are the same procedural faces every
  other player gets, hashed off the name. They do not resemble anyone. Drawing
  or importing real portraits is a materially different thing from using a name.
- **The disclaimer in Settings says so**, naming the Icons as the exception to
  "everything here is fictional" and disclaiming endorsement.

Reverting is one edit: `ICONS` in `pools.js` is a plain list, and nothing else
in the codebase knows or cares what the names are.

### Updates and the stale-cache problem
Symptom: a deployed change never reaches the installed app. An installed PWA is
almost never fully closed, so the page keeps talking to the worker it launched
with; a new worker downloads, installs, and then waits politely forever.

What is in place now, all of it needed:
- `sw.js` serves **network-first**, and precaches with `cache: 'reload'` so a new
  worker cannot populate itself out of a stale HTTP cache.
- Navigations are refetched with `cache: 'reload'`, so a home-screen launch
  always gets the current shell.
- `CACHE` is the eviction mechanism — `activate` deletes every cache that is not
  the current name, so **bump it on every release**.
- The page registers with `updateViaCache: 'none'`, calls `update()` on load, on
  every return to the foreground and hourly, tells a waiting worker to
  `skip-waiting`, and reloads once on `controllerchange`.
- Settings → **Force update** unregisters every worker, deletes every cache and
  reloads with a cache-busting query. That is the escape hatch for a device that
  is *already* stuck, since a stuck device cannot be fixed by the thing that is
  stuck.

`APP_VERSION` in `app.js` is shown in Settings so a bug report can say which
build it came from. Bump it with `CACHE`.

### The thin positions
LM and RM had no `special` cards in the entire world and full-backs had one or
two, so a Prime pack literally could not find a right-back worth playing. A
pass in `buildWorld` now adds ten full-back / wide / keeper / centre-back
squad players per club, seventy free agents drawn from the same shape, and a
guaranteed run of 82-90 rated cards in each of LB, RB, LM and RM. The world
went 446 → 731 players and every position now has gold, special, star and icon
cards in it.

### The menu
It was a title, three zeroes and four tiles on the top third of a tablet
screen. Below the tiles it now carries your division and record, squad rating
and chemistry, your best card in its own rarity colour, what is unopened in the
locker, and the objective you are nearest to finishing — each one a button into
the place that changes it. All of it is suppressed for a save with nothing in
it: a row of zeroes is worse than the space it fills.

## Rules that keep biting

- **Never re-balance the match by feel.** Always sweep AI-vs-AI
  (`new Match(a, b, {human: null})` stepped at 1/60) and measure goals, shots and
  turnovers per match. Target is roughly 2–3 goals and ~11 shots.
- **Sweep at least 40 matches, in multiples of ten.** The sweep pairs clubs by
  index against a ten-club league, so anything that is not a whole number of
  cycles over-weights the first few fixtures. A 20-match run made three settings
  look 13% apart when a 40-match run put them within 3% — which is noise, and
  tuning against it is worse than not tuning at all.
- **Cameras must stay inside the bowl.** Only the near touchline is open; the far
  touchline and both goal ends are stands. Outside
  `x ∈ [-6, PITCH.w+6]`, `y < PITCH.h+6` is inside terracing.
- `server/data/` is gitignored — it holds password hashes. Keep it that way.
- **Bump `CACHE` in `sw.js` and `APP_VERSION` in `app.js` on every release.**
  The cache name is what evicts the previous build.
- **New modules must be added to `ASSETS` in `sw.js`.** Network-first means a
  missing entry does not break an online player, so the omission is invisible
  until someone opens the game offline.
- **The graphics prompt fires once, ever.** `settings.graphicsAsked` is set the
  moment the card is rendered, whatever the player then answers. Asking after
  every match would be worse than the stutter it is asking about.
