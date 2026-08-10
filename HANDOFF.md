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
the bottom of this file. Treat the exact figures once recorded here with
suspicion: every sweep run before `tools/sweep.mjs` existed was unseeded, and
successive runs of that same code produced 2.08, 3.02 and 2.50 goals a match.
Stamina does bring goals down and does not touch possession — that much survived
every sample — but if the numbers matter, re-measure with the seeded tool. The first attempt used a drain rate that emptied a sprinting
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

### The theme, and where it used to stop
The title screen and the menu are built on one idea — heavy italic condensed
type over a pair of bold green lines sweeping up to the right. That idea used to
stop at the menu: opening Ultimate XI, Kick Off or Settings dropped you into a
stack of grey glass panels that could have belonged to any app.

`components/screenHead.js` is the piece that carries it through the door. Every
mode screen opens with one banner: kicker, italic title, one line of small
print, the cover's swoosh, and a **motif** — a line drawing unique to that
screen, all four authored on the same 300x120 canvas at the same stroke weight
so they read as one set rather than four unrelated drawings. Ultimate XI gets
the division ladder and reports which rung you are on; Kick Off gets the centre
circle; Settings gets faders; Career gets a fixture grid. Tones come from the
same `.tone-a`..`.tone-d` classes the menu tiles use, so a screen keeps the
colour of the tile that opened it.

Below the banner, `.panel-head h2` carries a short accent bar. It is a small
thing and it is most of why a page of panels now reads as this game.

**The accent picker is gone and is not coming back.** Green is the cover, the
app icon, every swoosh and the mark on the top bar; a magenta build was a
different game wearing the badge, and every screen designed afterwards had to be
checked against five palettes instead of one. `GREEN` in `app.js` is the only
palette, `:root` in the CSS states it too so the first paint is not a cyan
flash, and `settings.accent` no longer exists (old saves carrying one are simply
ignored).

### Gameplay presets
`PRESETS` in `sim.js` — one object, two tunings, six multipliers each, all
centred on 1 so the old behaviour is roughly the midpoint and *neither* preset
is "the game as it was". Kick Off runs **Authentic**, Ultimate XI runs
**Competitive**; `play.js` derives it from `params.ultimate`, which both sides
of an online match compute from the same flag, so host and guest never disagree.
Anything constructing a `Match` without a `preset` gets Authentic.

The knobs are `passSpeed`, `control` (dribble stiffness), `hands` (keeper
shot-stopping), `deflect` (how much a parry is steered — see below), `tackle`
and `discipline`. Two things were got wrong on the way in and are worth not
repeating:
- **`hands` and `deflect` double-count.** Giving Competitive keepers both better
  hands and better deflection control put the *attacking* preset a third of a
  goal a match below Authentic. `hands` stays at 1 there; "sharper rebounds"
  means steering, not shot-stopping.
- **`discipline` reads backwards if you wire it to the marking radius the
  obvious way.** Low discipline was implemented as defenders chasing *further*,
  which made the loose preset better at winning the ball back. It multiplies the
  radius now: high discipline tracks the runner, low discipline leaves space.

Swept at 120 matches on seeds 12345 and 777. Authentic 2.40/2.43 goals, 13.0
shots, 18.5%/18.8% conversion. Competitive 2.34/2.40 goals, 12.2 shots,
19.3%/19.7%. Baseline before this batch was 2.76/2.37 — the ~0.15 drop is the
deflection fix removing rebound tap-ins and is the point of it.

### Keeper deflection control
A parry used to reflect the shot, which put the ball back out in front of goal
into the striker's feet — for a long time the cheapest goal in the game.
`deflectionAim` scores a fan of eleven angles from post to post, penalising any
line an opponent is standing in and rewarding one a team-mate is on, and the
result is blended against the raw physics direction by
`preset.deflect * (0.55 + hands * 0.5)`. So on Authentic a parry is mostly
physics and a scramble is a real possibility; on Competitive a good keeper puts
it where he means to. The tip-round-the-post branch is untouched — it was
already correct.

### Dynamic dribbling and foot preference
Every card carries `foot`. It is hashed off the id in `generator.js`, **not
drawn from `rand`** — taking a number from the generator's stream there would
have shifted every name, stat and nation after it, and saved collections store
ids whose cards have to keep being the same cards. About 22% left-footed; the
named Icons and Stars state their own.

Three effects:
- The ball sits 0.34 m to the strong side rather than dead in front, so a
  right-footed winger carries it on his right (`updateBall`).
- `weakFoot(p)` reads which side of the body the ball is actually on, from the
  player's own facing — so it changes shot to shot as he shifts it. Weak foot
  costs 50% accuracy on a shot, 55% on a pass, and 7% shot pace. Headers and
  penalties pass `placed: true` and skip it, because the ball is not at anyone's
  feet when it is struck.
- Touch interval and knock size scale with `dribbling` and shorten under
  pressure. **Both multipliers are centred on skill 0.75**, so a typical gold
  card behaves exactly as it did before and only the ends of the range moved.
  That is deliberate — it is how the mechanic went in without moving balance.

### The loading screen
Two jobs, and the second is the real one. The obvious job is to look like a game
instead of dumping you onto a pitch the instant the screen changes. The
important job is that a match used to start on the built-in figures and swap to
the scanned players the moment the 14 MB model finished downloading — the
opening seconds looked cheap and then abruptly did not.

So the veil waits on **two floors, not a deadline**: a randomised 5–7 s *and*
`gl.ready`, the promise `createRenderer` now returns, which settles when the
model has landed or failed. `LOAD_CEILING` (22 s) is the escape hatch, because a
model that never arrives must not lock someone out of their own match. While it
is up the sim is frozen but the scene still renders, so shaders compile behind
it rather than hitching on the first touch. Frames drawn during loading are
excluded from `countFrame`, or they would skew the average the end-of-match
graphics prompt is judged on.

**Online is deliberately excluded from the 5–7 s floor.** The rule everywhere in
`play.js` is that an online match cannot be frozen because the other player is
still out there; a six-second stall on one machine only is a desync with an
animation on top. Online keeps the veil but only for as long as the assets
genuinely take.

### Half time
The sim gives the `half` phase 1.8 s and then teleports everyone back to their
starting spots, which from the pitch looked like the game had glitched. `play.js`
now catches the transition into `half` and opens the pause menu on
**substitutions** — the frozen branch never calls `match.update`, so `phaseT`
simply stops and nothing moves until the second half is asked for. Online is
excluded for the same reason pausing is.

The 2D renderer's phase banner takes a `hideBanner` option now, or HALF TIME gets
painted across a half-time menu that already says HALF TIME.

### Your club
`club.identity` — a name, three letters, and a crest of shape/pattern/device plus
two colours. It is deliberately **not a new system**: that object is exactly what
`crestSVG` has always consumed and exactly what `makeTeam`'s custom-squad path
has always accepted, and the two colours are what the kit shader tints every
shirt from. The Your Club tab is a form over it.

Two things to know:
- `clubIdentity()` in `squad.js` fills in from defaults rather than trusting
  storage. Saves written before this existed have no identity, and a *half*-set
  one is worse than none — a missing `crest.colors` reaches the kit shader as
  `undefined[0]`.
- `sideOf()` in `play.js` exists because a custom squad borrows a real club's id
  purely so the fixture has something to hang off, which meant the scoreboard
  showed Ironvale's crest over your own Ultimate XI.

The picker rebuilds each swatch through `innerHTML` on a wrapper span. `crestSVG`
returns a string with leading whitespace, so parsing it and taking the first
*node* hands back the whitespace, not the badge.

### The pitch, and the four white pools
The turf is **three** textures, and that split is the point. `pitchTexture` is
the colour — stripes, wear and markings, low frequency, so a modest resolution
covers 105x68 m without looking soft. `turfDetail` is a small tiling square of
blade noise used as a normal map, repeated once every 2.6 m; baking blades into
the colour map instead would need a canvas about 7000 px square. `pitchRoughness`
carries the mow: real broadcast turf reads as stripes because the two mowing
directions catch the light differently, which is a *specular* difference far more
than a colour one. `__pitchCanvas()` is exported purely so the artwork can be
dumped flat and looked at without a camera or a bloom pass in the way.

Things that were wrong and are worth not redoing:
- **Stripe gradients belong at the seam, not across the band.** A gradient run
  over the full width of each stripe puts a shade change down the middle and
  makes sixteen stripes read as thirty-two.
- **Grain patches have to stay under about a metre.** At 2.4 m a circle reads as
  a circle and the pitch looks mouldy.
- **The corner arcs and both penalty arcs were simply missing** for the whole
  life of this renderer. They are drawn now.

The four blown-out white pools at the corners of every camera angle took four
wrong guesses to find, so the answer is written down: **it was a specular
highlight on the grass, not the lights.** Turf roughness was 0.74 with a
roughness map taking the glossy stripes to 0.41, and at a grazing angle that
behaves like a mirror. It is 0.9 now with the map held in a narrow band. Ruled
out along the way, in order: the spotlight intensity (changing it barely moved
the pools), aiming the lamps diagonally across the pitch (worse — four spot axes
land *somewhere*, and moving them off the centre just relocates four hotspots
onto four corners), the volumetric beam cones, and the distance falloff. The
quick way to have found it: remove the lamps entirely and see if the pools go.

Two real bugs did fall out of that hunt and are fixed. The beam cone shader read
`1.0 - vUv.y`, but a cone's tip is at uv.y = 1 and the tip is the end held up at
the lamp — so every beam was brightest at its wide base, the end that punches
through the pitch. And the lamps now use `decay: 0`: four masts are standing in
for a rig of dozens of luminaires covering the surface evenly, so modelling their
inverse-square models the wrong thing, and any exponent that looks right in the
middle clips at the edges.

### The perimeter boards
The run is laid end to end **once**. It used to be eight sponsor panels wrapped
five times down a 125 m touchline, which is why the same three adverts came back
every few metres and the ground looked like one company had bought the stadium.
There are 24 sponsors now, dealt from a shuffled deck that only reshuffles when
it empties, and four different **panel layouts** — varying the composition does
more for the illusion than varying the names.

A run that long at legible resolution is wider than a texture is allowed to be
(some mobile GL contexts cap at 4096, and an oversized canvas comes back blank
rather than merely soft), so the run splits into as many mesh segments as
`renderer.capabilities.maxTextureSize` demands, each with its own texture.

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

### The cinematic render path
`js/game/cinematic.js` is one full-screen pass doing ambient occlusion, far-field
depth of field, vignette, grain and chromatic aberration from the colour buffer
and the depth buffer. One pass rather than a chain, because each pass is another
read and write of a buffer that is up to three times native resolution.

**There is no ray tracing and there cannot be.** WebGL has no ray query and a
browser cannot reach the hardware that would make it real time. This is the
screen-space family of tricks, which is what shipped in console games for a
decade and is a long way from nothing.

Four things here were got wrong first and are worth not repeating:
- **The depth attachment must come from the buffer handed to the pass.**
  EffectComposer swaps its two targets and does not reset them between frames,
  so the scene lands in a different one on alternate frames. Both get a
  `DepthTexture`; the pass reads `readBuffer.depthTexture`.
- **Depth of field is far field only, with a dead zone.** The first version
  blurred either side of the focal plane and put a seven-pixel smear across the
  foreground grass. A broadcast camera on a football match is stopped down and a
  long way back: the whole playing surface is sharp and only the crowd is soft.
- **The focal length is recomputed every frame.** `renderGL` rewrites
  `camera.fov` each frame to hold its framing, so caching pixels-per-unit at
  resize left the occlusion radius wrong at every zoom but the boot one.
- **Diagnose with `debug: true`** on the pass options rather than by reasoning
  about it. It dumps raw depth, stretched depth and linear distance into the
  three colour channels, which is one screenshot and an answer.

Also in this path: additive cones on the floodlights for the beam haze, which is
the most expensive-looking thing on screen for four transparent draws, and a
turf roughness of 0.74 rather than 0.97 so the stripes catch a sheen.

Ultra runs 12 AO taps plus the bokeh; High runs 8 and no bokeh. **Neither has
been measured on a real device** — the FPS counter in Settings is how that gets
answered.

### The update gate
`/api/version` returns a short hash of everything the server serves — every js,
css and html file plus `index.html`, `sw.js` and the manifest. It changes when
the code changes and at no other time: **not** the process start time, because
this host spins down when idle and a restart with identical code must not tell
every player there is an update, and **not** a hand-bumped constant, because the
point is that pushing a commit is enough.

The client stores the build it last launched on. On the title screen it asks the
server; if the answer differs, START is replaced by an update panel and nothing
gets past it — Enter, a gamepad button and the button itself are all blocked
until the install runs. A first run records the build silently, and a failed
request (offline) never blocks: the game runs perfectly well without a server.

Three things about the install were learned the hard way:
- **The bar is driven by the wall clock, not by counting steps.** The first
  version advanced a fixed amount per `setTimeout` and assumed the timers would
  fire on schedule. Clearing the cache stalls the main thread in bursts, the
  timers got starved, and a bar budgeted at 2.6 seconds took **58**.
- **The cache deletion is started and never awaited.** It holds a 14 MB model
  among several hundred files and took over six seconds. Nothing depends on it
  finishing — the worker is unregistered first, the reload is cache-busted, and
  the next worker's `activate` deletes every cache that is not its own anyway.
- **The tail creeps rather than parking at 99%.** Unregistering the worker can
  take a couple of seconds on its own, and a bar frozen at 99 reads as a hang,
  which is the one thing an update screen must never look like.

Settings → Force update runs the same installer rather than a second copy of it.

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
  every return to the foreground and hourly, and tells a waiting worker to
  `skip-waiting`. It deliberately does **not** reload on `controllerchange` any
  more: that could yank someone out of a match. The title screen's update gate
  is the only place the app restarts itself, and only because a button was
  pressed.
- Settings → **Force update** unregisters every worker, deletes every cache and
  reloads with a cache-busting query. That is the escape hatch for a device that
  is *already* stuck, since a stuck device cannot be fixed by the thing that is
  stuck.

`APP_VERSION` in `app.js` is shown in Settings so a bug report can say which
build it came from. Bump it with `CACHE`.

### Substitutions, penalties, Ultimate and SBCs
Four features added together; each is small on its own and they lean on each
other, so they are described in one place.

- **Bench and subs.** Five seats in the Ultimate XI screen, three changes per
  match from the pause menu. A substitution keeps the shirt and swaps the card
  underneath — same slot, same role, same shape duty — so it can never leave a
  hole in a formation, and every attribute that comes off the card is
  recomputed. A club side gets a bench off its own roster or only one side of
  the pitch would have the feature. Guest asks, host acts, same as formations.
- **Penalties.** Fouls exist *only* inside the box and *only* on a failed
  tackle. That is a limit, not an oversight: with no free-kick set piece, a foul
  anywhere else would be a turnover with a whistle on it. Swept on two seeds —
  0.17 and 0.22 penalties a match against ~0.27 in real football, goals 2.72
  against 2.45.
- **The shootout** (`screens/shootout.js`) is its own machine, not a `Match`
  phase, and is offered only on a drawn Kick Off. It does not touch the
  scoreline; football does not either.
- **Ultimate** is paid only for wins in Division 1 (1) and Apex Elite (2), plus
  one objective. Its only sink is the **Icon Exchange** in the store: 20 for the
  specific Icon you want, against a pack that gives a random one. Ten Apex Elite
  wins per Icon, on purpose.
- **SBCs** (`data/challenges.js`) are about the *set*, not positions — no
  formation puzzle, no chemistry links to line up, because those stop being fun
  with a partial collection. A requirement is a function of the eleven cards
  plus their chemistry, so a new challenge is one row.

Two bugs worth not repeating, both found by driving the UI rather than looking
at it: the shootout's Continue button stayed `disabled` because only the
carry-on branch re-enabled it, and the Icon Exchange's click listener was bound
after the store tab's `return` in `mount`, so it never ran and buying did
nothing while looking perfectly correct.

### The thin positions
LM and RM had no `special` cards in the entire world and full-backs had one or
two, so a Prime pack literally could not find a right-back worth playing. A
pass in `buildWorld` now adds ten full-back / wide / keeper / centre-back
squad players per club, seventy free agents drawn from the same shape, and a
guaranteed run of 82-90 rated cards in each of LB, RB, LM and RM. The world
went 446 → 731 players and every position now has gold, special, star and icon
cards in it.

### The menu — four doors, nothing else
Twice now the answer has been *less*. A hub of division, record, squad rating,
chemistry, best card, locker count and next objective was reverted on sight —
*"janky and cluttered and there is too many things happening at once"* — and
then the wordmark, the club/player count and the three counters went too. The
title screen already says APEX XI at forty times the size; repeating it above a
row of statistics nobody opened the app to read pushed the only thing anyone
came for below the fold on a phone.

What is there now is the wordmark — set exactly as the cover sets it, heavy
800 italic, white APEX against a green XI — four tiles, and the small print.
The wordmark came back after being removed with the counters; the counters were
the problem, not the name. The
tiles carry the cover's swoosh in their right third — clear of the left-aligned
text, with a scrim under it so it can never take a bite out of a word.

### What the accent picker owns
Hard-coding the swoosh green left the accent picker with nothing visible to
change: *"when i put yellow it stays green nothing changes."* The line is now
drawn in one place and it is worth keeping there —

- **The interface follows `--accent`:** both swooshes, both wordmarks' XI, the
  START button, tile tones, icons and CTAs, the update bar. `--accent-deep` is
  the shade each one grades into; the deep shades are picked per colour rather
  than derived, because derived ones went muddy on the warm accents.
- **The APEX SPORTS mark does not.** A logo that changes colour with a
  preference is not a logo. The roundel and its `SPORTS` rule hold the brand
  green at every accent — they are the only hard-coded greens left in the
  stylesheet, and a grep for `#23c55e` should only ever find them.

The default accent is `green`, which is what the cover was drawn in.

The header badge is the publisher mark at 30px: dark disc, green ring, white A.
It used to be a rounded square filled with a gradient from the user's accent to
near-white, which on the amber accent read as a stray yellow box next to the
title.

**Tile icons are drawn, not typed.** They were ⬢ ▦ ⚡ ⚙ and a padlock emoji —
characters borrowed from whatever font the device had, so they rendered as
Apple's artwork on an iPad and as something else everywhere else, and none of
them said anything about the mode they sat on. A hexagon is not a squad and a
lightning bolt is not a kick-off. They are now line drawings of a card, a
trophy, a ball and a set of faders, on one 24-unit grid at one stroke weight.

**The publisher mark** (`.mark` on the splash) is a dark disc with a green rim,
an A built from two heavy angled bars, and a clipped diagonal accent behind it,
beside a two-line lockup. The old one was a thin outlined A on a plain white
disc, which punched a white hole in the artwork.

Careful with the CSS block around `.brand-mark`: `.coin-chip` lives directly
under it and was deleted by a careless replace-through-to-the-next-comment,
which silently removed the wallet pills from the header.

## Rules that keep biting

- **Never re-balance the match by feel.** Always sweep AI-vs-AI
  (`new Match(a, b, {human: null})` stepped at 1/60) and measure goals, shots and
  turnovers per match. Target is roughly 2–3 goals and ~11 shots.
- **Sweep with `node tools/sweep.mjs`, and always on two different seeds.**
  `sim.js` calls `Math.random` directly, so unseeded runs of *identical* code
  differ by half a goal a match even at sixty matches. That is larger than most
  changes being measured, and it has already produced two false results in this
  project: a passing tweak that looked 13% apart on 20 matches and was within 3%
  on 40, and an off-ball change that looked like it added goals on one sample
  and removed them on the next. The tool substitutes a seeded generator so
  before and after play the same fixtures with the same dice.

  **A caveat found while adding penalties:** seeding makes runs *reproducible*,
  but a change that consumes a different number of random draws desynchronises
  the stream from the first difference onward, so before/after is only exact for
  changes that do not alter RNG consumption. Anything that adds a dice roll —
  fouls, a new AI branch — still needs two seeds and a tolerance for drift.

  **Anything that does not move a number across two different seeds has not
  moved it.** Run the sweep on a clean checkout, apply the change, run it again
  with the same arguments, and compare. Sixty matches per seed is the working
  minimum.
- **Cameras must stay inside the bowl.** Only the near touchline is open; the far
  touchline and both goal ends are stands. Outside
  `x ∈ [-6, PITCH.w+6]`, `y < PITCH.h+6` is inside terracing.
- `server/data/` is gitignored — it holds password hashes. Keep it that way.
- **Bump `CACHE` in `sw.js` and `APP_VERSION` in `app.js` on every release.**
  The cache name is what evicts the previous build. `APP_VERSION` is only a
  human-readable label — the authority on what is deployed is the build hash
  shown under it in Settings, which the server derives from the bytes it is
  serving and which therefore cannot be forgotten.
- **New modules must be added to `ASSETS` in `sw.js`.** Network-first means a
  missing entry does not break an online player, so the omission is invisible
  until someone opens the game offline.
- **The graphics prompt fires once, ever.** `settings.graphicsAsked` is set the
  moment the card is rendered, whatever the player then answers. Asking after
  every match would be worse than the stutter it is asking about.
