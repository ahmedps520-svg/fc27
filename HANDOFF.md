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
- Right hand gets named buttons, colour-ringed: with the ball PASS / THROUGH /
  CROSS / SHOOT, off it TACKLE / SWITCH, with the cross and shoot slots
  hidden — there is one tackle now, not a TACKLE/SLIDE pair, see "One tackle,
  not two" below. Swapped from `match.ball.owner.team` each frame.
- The shoot button fills its rim with the charge held on the shot.
- A press sets the input before it asks for pointer capture: capture can be
  refused and must never be what decides whether the press counted. Releasing
  clears both bindings of the slot, since the context can flip mid-press.
- Sizing keys off `(pointer: coarse)`, not width — see "Touch button sizing"
  below for why the old width breakpoint was silently dead on real phones.

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

### The Apex Division difficulty
The ladder used to field a **real club**: division 10 played the worst club in
the world, Apex Elite the best. The best club in the world is rated 86, and an
Ultimate XI with an Icon in it is 90+ — so *the ceiling of the entire ladder sat
below a decent squad*. It was possible to reach division 5 unbeaten winning 6-0,
9-0, 4-0, which is exactly what a player reported.

`divisionOpponent(divIdx, yourRating)` in `ultimate.js` builds the opponent to
measure instead: ~0.88x your rating at division 10, level around division 5,
1.10x by Apex Elite. Cards are **cloned off real players and scaled**, not picked
from the world — there are only 68 players above 88 in existence and they are the
Icons and Stars the player is collecting, so drawing from that pool would field
an opponent made of the cards you are trying to win.

**The most important thing measured here, and the reason rating alone was never
going to fix it:** AI against AI, a *thirteen-point* rating advantage is worth
about four points of win rate — this sim compresses stat gaps hard. A human, by
contrast, beats a same-rated CPU nearly every time. So the dominant lever is CPU
**competence**, not CPU ratings:
- `divisionSkill()` — how often the CPU commits to a shot, pass or cross.
- `tactics.pressing` — `high` from division 5 up. `PRESSING.high` is 1.4, which
  is the threshold at which the sim sends a *second* presser at the carrier. That
  is what takes time on the ball away from a human, and it shows up in the sweep
  as the attack drying up (goals for 1.20 → 0.47) rather than as more defeats.

`tools/ladder.mjs` measures this — a stated-rating squad against the real
opponent at every rung, reporting win rate. `sweep.mjs` asks whether a *match* is
balanced; this asks whether the *ladder* is, which is a different question and
the one that was got wrong. **A flat line of high win rates is the bug it exists
to catch.** Read the shape, not the absolute numbers: both sides are AI, and a
person plays better than the CPU by a very large margin.

Two seeds, 40 matches a rung, a 90-rated squad, after the change (win % is the
mean of the two seeds):

| Division | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | Elite |
|---|---|---|---|---|---|---|---|---|---|---|---|
| opponent | 79 | 81 | 83 | 85 | 87 | 89 | 91 | 93 | 95 | 97 | 99 |
| win % | 58 | 43 | 47 | 40 | 22 | 20 | 29 | 18 | 22 | 15 | 18 |

Per-rung noise is large — the rungs are only two rating points apart, and single
seeds disagree by up to 23 points on one row. **Judge the slope end to end**
(58% down to ~17%), not one row against its neighbour.

Against a 96-rated squad the opponent rating saturates at 99 from division 3 up.
That is fine and deliberate: past that point `divisionSkill` and the pressing
keep climbing, and neither is capped.

### Release notes
`js/data/patchNotes.js` is the single source. Two readers: `screens/notes.js`
shows the newest entry as a card over the menu the first time a device opens a
build, and `notes.html` renders the whole archive as a page. Neither holds its
own copy of the text, so a release cannot ship with a card that says one thing
and a page that says another.

Each entry carries **two lengths of the same story**: `summary` is one sentence
for the in-game card, written for someone who wants to get back to playing;
`detail` is the full page — why it changed and what it cost.

**Shipping a release is: add an entry at the top of `RELEASES` with `version` set
to the new `APP_VERSION`.** That is the whole job. The card compares against
`flags.notesSeen` and announces itself once per device; the page picks it up on
its own. `notes.html` is in `BUILD_FILES` so editing it moves the build hash, and
in the `ASSETS` list so it works offline.

The card lives on the **menu**, not the title screen. The title screen already
owns one interruption — the update gate — and stacking a second in front of a
START button is how a game gets a reputation for being in the way. By the time
the card fires the menu is drawn behind it, so dismissing it leaves you where you
were already heading. It marks itself seen when *shown*, not when dismissed: a
player who closes the app mid-read should not be handed it again every launch.

Because it fires **once**, there has to be a way back to it. Settings links to
`notes.html` ("What's new → Changelog"); before that link existed, dismissing
the card put the release history permanently out of reach from inside the app,
even though the full archive was sitting there being served.

### Momentum — the CPU raises its game when you are cruising
`updateMomentum` / `aiSkillFor(team)` in `sim.js`. A three-goal lead with two
minutes left is the most boring state this game can produce: the result is
settled and nothing that happens next matters. Momentum ramps the opposition's
`skill` up the further ahead you go, so seeing out a big lead is itself
something to do.

It rides the lever the ladder already uses. `divisionSkill` is 0.8 at the bottom
rung to 1.9 at the top, 0.11 a rung; momentum adds up to **0.45**, so a side
under full momentum plays about four rungs above its own — inside a range that
is already balanced, rather than a new multiplier nobody has tuned.

Four things about it are deliberate, and all four are load-bearing:

- **It only ever adds.** Momentum is clamped at 0, so the floor is the baseline
  the match was created with. Being 3-0 down never makes the opposition kinder.
  A lead of one does nothing at all — one goal is still a match.
- **Only the side you are not on gets it.** `skill` drives the off-ball AI of
  *both* teams, your own ten team-mates included, so the first cut of this
  raised the boost globally and largely cancelled itself out — your press
  sharpened in exact step with theirs. That is why the boost is asked for by
  team rather than read off the match.
- **Rise is quicker than fall** (1.1/s against 0.3/s). Going three up should be
  answered within a few seconds; the CPU pulling one back should not hand the
  advantage straight back, so a lead has to actually be defended before the
  game eases off.
- **Two-human matches and AI-vs-AI are skipped outright**, via `soloHumanSide`.
  Couch versus and online seat a person on each team so there is no CPU to
  raise; co-op seats two on one team and still counts as one human side.
  AI-vs-AI matters most: that is the configuration every sweep runs and the
  baseline the economy is tuned against. Because it is gated out, **the sweep is
  bit-identical to the previous build on both seeds** — verified, not assumed.

Verifying it needs a stub input (`axis/held/pressed/released`) and a forced
scoreline; `soloHumanSide`, `momentum` and `aiSkillFor` are all readable off the
match, so a few seconds of stepped updates is enough to see the ramp.

### Packs
`PACKS` in `screens/squad.js`. Two things used to be written longhand in the
opener and are now declared on the pack, because neither is a property of the
pack that happened to want it first:

- **`floor`** — at least one card of that rarity or better. Was
  `pack.id === 'gold'`.
- **`minOverall`** — nothing below that rating survives. Was
  `pack.id === 'prime'`.
- **`forcePosition`** — one card is certainly that position. Shares the
  mechanism with the `needGK` argument, which exists because a squad with no
  keeper cannot be fielded at all.
- **`tone`** — the colour it wears. Store and locker used to derive this from
  the id, which silently required every pack to be *named* after a rarity;
  Keeper, Lucky Dip and Squad Builder are not, and fell through to a default
  grey that looked broken next to the rest.

A store that grows by adding an `id ===` check to the opener for every new pack
is a store that stops growing, which is the whole reason for the above. There
are twelve packs now; adding a thirteenth should be one entry in `PACKS` and
nothing else.

**The Store is three sub-tabs**: Packs, Locker, Icon Exchange (`#sSubs`,
`storeTab`). They were one page about two thousand pixels long, so buying a pack
meant scrolling past twelve of them to find the one you had just bought. They
are separate jobs — spending, opening, and the one thing Apex cannot buy — and
each fits a screen alone. Same shape as the Club tab's row, and the locker count
rides on the Locker tab because "you have packs waiting" is the reason to go
there. Buying leaves you on Packs, since the next thing you do is usually buy
another.

**The store art is a pack, not a swatch.** A foil face with two card edges
fanned behind it and the pack size on the front — the fan says "this contains
cards" before a word is read, and the count is the number a buyer wants ahead of
the odds. The frame is `overflow: visible` because the fan sits outside it; the
face clips its own foil. The foil sweeps once on hover and is fenced behind
`hover: hover`, since it is the only motion in the store.

**The reveal sorts worst-to-best** (`runPackAnimation`). It used to run in draw
order, so a 92 could walk out first and leave three bronzes to sit through —
the pack peaked and then apologised for four cards. Sorting turns the same pull
into a climb and leaves the card everything built towards on screen at the end.
Nothing about *what* you got changes, only when you see it. `drawn` is sorted
alongside `pulls` because `dup` is looked up by index and the two lists have to
keep pointing at the same card. This is also why `openPack` putting the
guaranteed card in a random slot no longer matters — that existed to stop the
reveal always ending on the same beat, which was the right worry for an
unsorted order and is the wrong one now.

**`minOverall` was a false promise before it was a field.** The replacement
draw picked rarity `gold`, and gold starts at 79 — so Prime, whose store card
reads "82+ min", was handing over 79s and 80s. Measured over 400 opens it held
to its own number **42%** of the time. Constraining the redraw to clear the bar
takes that to 100%. If a pack's note states a number, open 400 of them and check
the number before believing it.

The buy button is deliberately the **last child** of `.store-pack`:
`margin-top: auto` on it is what puts every price in a row on one baseline, and
anything placed after it pushes it back off. That is what the "or win 12
division matches" line under Limited: Icons was doing.

### The App panel is first in Settings, on purpose
Everything in it — Support, the changelog, the build stamp, Force update — is
what someone opens Settings to find when something is *wrong*. It used to be
last, and that made it effectively unreachable on the device most likely to need
it: the Settings screen is ~2000px tall, a phone in landscape shows ~430px of
it, so the panel sat three screens down behind sim speed, sound and graphics —
the settings a player changes once and never opens again. A support address
nobody can find is not a support address.

If a panel is added to Settings, add it **after** App, not before it.

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

### The objective ladder
`js/data/objectives.js` holds **32** rungs in order; the player carries
**seven** (`SLATE_SIZE`). `ultimate.objClaimed` records which rungs are
finished — that is what the "6/32 done" counter reads, not the slate. `ultimate.objRefresh` is a
timestamp; `refreshObjectives()` compares it on sight and refills **only the
completed slots**, dealing the next unclaimed rungs in. An objective you are
midway through keeps its progress and its place.

Nothing runs on a timer. The refresh happens when `objectivesView()` is drawn,
which is also why it survives the app being shut for a week.

**Objectives are matched by `metric`, not by id.** That is what lets 32 rungs
reuse six ways a match can feed one, so adding a rung is a line of data rather
than a branch in `settleDivisionMatch`. `streak` and `rank` are *set-to* rather
than added-to — your best run and the division you have reached are states, not
tallies, and a loss must not walk them backwards once banked.

The **deepest rungs are the only objectives that pay Ultimate** — they ask for
Division 1, Division 2, Apex Elite, seven in a row, 75 goals and 40 wins.
`legend` (Limited: Legends) sits at the bottom of the ladder.

**How many that is comes from `ULTIMATE_RUNGS`, not from prose.** It is counted
off the table (`LADDER.filter(e => e.ultimate).length`) and re-exported through
`state.js` next to `LADDER_SIZE`, because the copy in this file and in the
Objectives tab both said "the last six" and both went stale the moment a rung
was added. If a number about the ladder appears in a sentence, derive it.

**Array order is the ladder; ids are only save keys.** The eight rungs added
later (`l25`-`l32`) sit where they belong on the difficulty curve rather than
bolted on the end, so the ids run out of sequence in the table on purpose —
renumbering the originals would strand every save that has claimed them. Apex
rewards are strictly increasing down the array; keep it that way when
inserting. Three of the new rungs pay the packs added alongside them (Keeper,
Lucky Dip, Squad Builder), which is how a new pack gets a route that is not the
store.

Old saves are migrated by detecting objectives with no `metric` and redealing
from the top — the slate is lost, nothing else is. Adding rungs needs no
migration at all: `dealSlate` skips anything in `objClaimed`, so an existing
save simply starts being dealt the new ones.

The tab shows the climb as one bar (`.obj-climb`) with a marker where the
Ultimate rungs begin, and highlights any objective at **70% or more** — that is
the one worth playing another match for, and it used to read exactly like one
at 5%.

### The Club tab
Squad and the identity editor were two top-level tabs sitting next to each
other, which put "pick your eleven" at the same level as "play a match". They
are one **Club** tab now with its own second row: Squad, Club Badge, Club Name.

Two things to know if you touch it:
- `clubTab` is separate module state from `tab`. The squad wiring is the
  *fallback* at the end of `mount()`, so the identity editor's block is gated on
  `tab === 'club' && clubTab !== 'squad'` — gating it on `tab === 'club'` alone
  would return early and the squad's own listeners would never attach. This is
  the same shape as the long-standing store-tab gotcha noted below.
- The second row is styled as a rule with an underline rather than as pills, on
  purpose: two rows of pills stacked read as one run of fourteen buttons instead
  of as a hierarchy.

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

### The black flicker
**Status: unsolved after seven attempts. Do not write an eighth theory — the
detector now covers three fault classes and a report from it settles which.**

**Read this before touching it.** The refined symptom, which arrived late and
contradicts how the earlier attempts were framed:

- **A split second, repeated many times a session.** It is not one dramatic
  event, it is a fast recurring flicker. This is why it never survives a
  screenshot — nobody can press a key inside one frame.
- **Ultra only.** Desktop and iPad alike. In patches, not whole frames.
- On the reporter's machine the render is **1920x945 css at ratio 2.00 ->
  3840x1890**, i.e. 7.3 MP, comfortably inside the 9 MP budget, so the v38 cap
  never engaged there and that fix is irrelevant to them.

**A screenshot was misread, and it cost a release.** A frame was sent showing a
hard-edged dark wedge across the goalmouth; it was diagnosed as the occlusion
term clipping, and v40 capped that term. The reporter then pointed out the
photo did **not** contain the artefact at all — the wedge was ordinary stadium
shadow, and the flicker simply had not been captured. v40's shading change was
reverted. The lesson is worth more than the fix was: **confirm a frame actually
contains the artefact before diagnosing from it**, because a normal frame of
this scene has plenty of legitimately dark geometry to mistake for one.

Still true from that screenshot, and still useful: the badge read **98 FPS**,
and the resolution line above. Nothing else from it should be trusted.

**The detector** (`checkDrawCall` in `screens/play.js`) counts three fault
classes separately, each on a counter three already maintains, so watching them
is free — no `readPixels`, which would stall the pipeline every frame to answer
what these answer for nothing. The badge shows each, so one photo names the
fault:

- **`N draw`** — the frame issued almost no draw calls. We failed to draw it.
- **`N prog`** — a shader was compiled *during* play. three builds a material's
  program the first time it is drawn and the object can render black while that
  happens. `warmUp()` exists to do all of it behind the loading screen, so a
  moving counter means warmUp missed a material — this is the original v33
  compilation theory finally being *measured* rather than assumed.
- **`N tex`** — a texture or geometry was uploaded during play. An object whose
  texture is not resident yet draws black, and a texture is a rectangle, which
  is the reported shape.

Measured silent across 75 seconds of Ultra play, so any non-zero count is
signal, not noise.

**A silent detector is itself a result**: it means the frame was drawn in full,
with nothing newly compiled or uploaded, and the fault is either in what the
shading produced or in what the browser did with a finished frame. The test run
that produced that silence had no goal and no replay in it, though, so the
events most likely to introduce a new material — a celebration, a replay camera
cut, a substitution — are **not yet covered**. Reproducing across a goal is the
next thing to try.

Ruled out by evidence, not by argument: allocation (inside budget on the
failing machine), shadow-frustum edges (three returns *fully lit* outside the
frustum, never dark), and the occlusion ceiling (v40, reverted — the frame it
was diagnosed from did not contain the bug).

---

**Superseded: the occlusion ceiling.** Diagnosed from a frame that did not
contain the artefact. Reverted.

A screenshot from the reporter settled three things at once, and every one of
them contradicted a previous theory:

1. The console line read `ultra: 1920x945 css, ratio 2.00 -> 3840x1890,
   maxTex 16384`. That is **7.3 MP, inside the 9 MP budget**, so the v38 cap
   never engaged on that machine. The allocation theory was irrelevant to the
   person reporting it.
2. The FPS badge read **98 FPS with no suspect count**. The detector was clean,
   so the frame was drawn, in full, at rate.
3. The artefact was **in the frame**: a hard-edged dark wedge across the
   goalmouth on an otherwise perfect picture.

Drawn, complete, at 98 fps, and dark. That is not allocation, not compositing,
not a lost context, not a dropped frame — it is **shading**, and it retires the
whole "the frame never arrived" family that four fixes had been aimed at.

The occlusion term multiplies the pixel, and its ceiling was `0.92`:

```glsl
ao = 1.0 - clamp((ao / float(TAPS)) * uAoStrength, 0.0, 0.92);
col *= ao;
```

0.92 means the pass was permitted to take **any pixel to 8% brightness**, which
is black. Nothing ambient occlusion describes is a 92% loss of light, so that
headroom bought no picture and left the pass one bad estimate from painting a
region out — and bad estimates are cheap here, because the normal comes from the
depth buffer's slope, which degenerates at grazing angles and near the precision
floor. Where it degenerates every tap reads occluded, the sum saturates, and a
whole region hits the ceiling together: a dark patch with hard edges following
the depth discontinuities.

**Ultra asked for the strongest term** — `ao: 1.05` against High's `0.9` — so
Ultra saturated first. That is the Ultra-only report, explained, having been the
one fact no previous theory could account for.

Ceiling is now `0.55` and Ultra's strength `0.95`. The worst a wrong estimate
can do is halve a pixel: a visible shading error, never a hole. Real contact
darkening lives well under 0.55 and is unchanged — verified by rendering a match
at Ultra and checking the shading under players still reads.

**If a dark patch survives this**, it cannot be the occlusion term clipping, so
go to the DOF blur (`dofPx`, Ultra-only at `dof: 0.85`) and the light shafts.
And keep reading the badge: the detector staying clean is what says the fault is
in shading rather than delivery.

---

**Superseded: a NaN in the normal reconstruction.** A real defect and fixed at
source, but the ceiling above is what turned a bad estimate into black.

`CinematicPass` reconstructs a normal from the depth buffer's slope, and did it
with `normalize(cross(dFdx(pos), dFdy(pos)))`. That cross product collapses to
zero wherever the two slopes are parallel or flat — a surface square to the
camera, a run of pixels at one depth, the precision floor near the far plane —
and `normalize` of a zero vector is 0/0.

The NaN then runs: into `ao`, through a `clamp` that is **not** required to
launder it (drivers differ, which is exactly the kind of thing that shows on one
machine and not another), and into `col *= ao`, where a NaN pixel rasterises
**black**. A region of degenerate slopes is a region of NaN, which is a black
patch. That is the reported artefact, arrived at from the code rather than from
the symptom.

Fixed at source — length-checked, falling back to a camera-facing normal — plus
a backstop before `gl_FragColor` that catches a NaN from anywhere else in the
pass and returns the ungraded scene instead. GLSL ES 1.0 has no `isnan()`, so
the backstop uses the property that defines NaN: it is the only value neither
`>= 0` nor `< 0`. Losing a frame's occlusion beats a black hole.

**Why this is not obviously the whole answer:** the AO path runs on High too,
and the report is Ultra-only. Either the report is narrower than the bug, or the
extra Ultra taps (12 against 8) and stronger `uAoStrength` (1.05 against 0.9)
make it visible rather than causing it. If Ultra is now clean, that is settled.
If it is not, **the detector is the next move, not a seventh theory.**

---

**Superseded: the Ultra render budget.** Real over-allocation, measured and
fixed, but it did not stop the flashes.

**It only happens on Ultra**, on desktop and iPad alike, in patches rather than
whole frames, at no particular moment. That combination is the whole diagnosis,
and it is what the older notes below were missing.

Ultra asked for `max(2, dpr)` — *at least* twice the CSS size whatever the
display, so a plain 1x desktop monitor supersampled 2x. Everything downstream
squares that:

- `EffectComposer` keeps **two** full-size targets, and they are `HalfFloat` —
  eight bytes a pixel, not four.
- Both carry a 32-bit `DepthTexture` for the cinematic pass.
- `UnrealBloomPass` adds a mip chain.

Measured per target, and the pair is only part of the total:

| display | old | new |
| --- | --- | --- |
| 1080p | 8.3 MP / 63 MB | unchanged |
| 1440p | 14.7 MP / 113 MB | 9.0 MP / 69 MB |
| 4K | 33.2 MP / 253 MB | 9.0 MP / 69 MB |
| 5K ultrawide | 29.5 MP / 225 MB | 9.0 MP / 69 MB |

At 4K the whole chain came to roughly a gigabyte. An allocation that size either
fails — and an incomplete framebuffer draws nothing, which is a black region —
or evicts something else and thrashes, which is a black region that moves and
returns. Both match the report, and both are Ultra-only, which nothing else
was.

`safeRatio` in `renderGL.js` caps it against two ceilings: `maxTextureSize`
(hard — a target wider than the driver allows simply does not allocate, and
plenty of cards report 8192, which a 5K screen at 2x clears easily), and a 9 MP
budget. 9 MP is chosen so **1080p and every phone and tablet keep exactly the
ratio they had** — no visual change for most people — while 1440p falls to
~1.55x and 4K lands near native, which is the "cap at native" the earlier note
predicted, reached by a rule instead of a number per resolution.

`resize()` recomputes it, and **must also call `composer.setPixelRatio`**: the
composer copies the ratio at construction and sizes its own targets by that
copy, so changing only the renderer resizes the canvas and not the buffers
drawn into it. Dragging a window onto a 4K screen is how a session that started
inside the budget ends up outside it.

Kick-off logs the chosen ratio and the resulting buffer size, because "what is
it actually rendering at" is the first question worth asking about a graphics
report and there is no way to answer it from outside.

**If it survives this, the resolution is the thing to ask for first.** At 1080p
and below the cap changes nothing, so a 1080p reporter rules the budget out and
sends you to the detector; DOF is the other Ultra-only variable (`dof: 0.85`,
zero on High) and is where to look next.

---

**The detector: four theories were tried before the above, none confirmed. Use
it before writing a fifth.**

**It happens on desktop too, not only iPad.** That is the single most useful
fact anyone has produced about this bug and it arrived late, so read the
theories below knowing it invalidates most of what they assumed:

- The tile-based-GPU reasoning is dead. Desktop GPUs are immediate-mode and
  have no tile grid, so "stair-stepped edges on the GPU's tiles" cannot be the
  mechanism on both.
- iOS memory pressure is dead for the same reason.
- The shader-compilation stall and the `backdrop-filter` compositor theory are
  both still *possible* on desktop, but neither is now favoured, because
  neither explains why a desktop with gigabytes of VRAM and a fast compositor
  shows the same artefact as a tablet.

**The detector** (`checkDrawCall` in `screens/play.js`) exists to stop the
guessing. A black frame is either a frame we failed to draw or a frame we drew
that the browser failed to present, and those want completely different fixes.
It reads `renderer.info.render.calls` — a counter three already maintains, so
it is free, unlike `readPixels`, which would stall the pipeline every frame to
answer the same question. A frame that issues under 35% of the running normal
while `phase === 'play'` is counted and logged with the match clock and phase.
Turn on **Show FPS** and the badge carries the count.

Read it like this:
- **Suspect frames climbing in step with the flashes** → the fault is ours, in
  the render loop. Look at what stops issuing draws: a culled scene, a NaN
  camera matrix, a composer target unbound.
- **Flashes with the counter stuck at zero** → we drew a normal frame and it
  did not reach the screen. That is presentation: compositing, the swap chain,
  or an overlay on top of the canvas. `backdrop-filter` was removed for exactly
  this reason and can be re-examined; so can `.gm-overlay`, which is
  full-screen, near-opaque and fires **on every goal**.

It is deliberately quiet — measured across 45 seconds of normal play it
reported nothing, so a non-zero count is a real signal rather than noise.

Worth ruling out early next time, because both are cheap and neither has been
checked: whether it happens with the picture completely **static** (paused with
the overlay up — a flash there exonerates the whole animation path), and
whether dropping 3D detail to **High or Low** stops it (Low skips the composer
entirely, so a clean Low is a strong pointer at post-processing).

---

**Superseded theory: `backdrop-filter` over the live canvas.** Reported
still happening after the shader fix below shipped, so that was not it either.

A `backdrop-filter` makes the compositor copy the pixels *behind* the element
into its own layer, blur them, and composite the result back. Behind the match
HUD those pixels are a WebGL canvas being rewritten every frame, so iOS samples
a surface the GPU is still writing to, sixty times a second. When the sample
lands before the canvas has resolved, the element composites over nothing: a
black rectangle with **tile-aligned edges**, in whatever region the compositor
was working on — which matches the report far better than either GPU theory
below. It explains the tile-stepped edges without needing a driver failure at
all, and it explains why the position moves: it follows the compositor's
invalidation, not our geometry.

Three elements had it and all three sat over the canvas: `.gm-bug` (the
scoreline, whose clock changes every second, forcing a repaint), the in-HUD
`.icon-btn.sm` buttons, and `.gm-overlay` — full-screen, and it appears **on a
goal**, which is a plausible "sometimes, mid-match" trigger. All three are now
flat backgrounds. It cost almost nothing: they were already 82-86% opaque, so
the blur behind them was barely visible, and a few points of extra opacity buys
back the contrast.

Menus keep their blur. There is no live canvas under those, so none of this
applies — the rule is only "nothing over the match canvas".

**Not reproduced here** (no iPad, and SwiftShader will not show a compositor
fault), so this is again a reasoned fix rather than a confirmed one — the third.
If it *still* happens, that is genuinely useful information, because it rules
out the whole compositing path: ask whether it survives dropping 3D detail to
High, and whether it ever fires while the picture is completely static (paused
with the overlay up). A static-picture flicker would mean the canvas itself, not
anything layered on it.

### The earlier shader-compilation theory (did not fix it)
three builds a material's
GPU program the first time that material is *drawn*, not when it is created.
This scene has many distinct programs — turf with its normal and roughness maps,
the kit-tint and skin-tint variants, the instanced crowd, the boards, the light
shafts, the nets — and on a tablet each compile is tens of milliseconds on the
main thread mid-frame. A frame that stalls that long is presented half-drawn:
the tiles that made it are there, the rest are black, edges on the GPU's tile
grid. It re-fires whenever another variant is first seen — a substitute entering
the frustum, a replay cutting the camera somewhere new — which matches "a lot,
in a different spot every time" far better than memory pressure did.

`warmUp()` in `renderGL.js` calls `compileAsync` (falling back to `compile`)
before resolving `ready`, so the loading screen — which was waiting anyway —
absorbs the cost. **Two call sites, and the ordering matters:** the models path
compiles after its rigs are in the scene; the no-models path is called at the
*end* of `createRenderer`, because the ball and the markers are added after the
model block and their programs have to be in the same batch. The post-processing
passes are not covered by `compile()`, but they run every frame behind the veil,
so they are warm by kick-off.

Still not reproduced here — no iPad, and SwiftShader will not show a tile
failure. If it survives this, the next suspects are a resize firing mid-play and
the compositor presenting before the GL command buffer completes.

### The earlier memory theory (did not fix it)
A player on an iPad reports a large black rectangle appearing for a split second
mid-match, in a different place each time, starting after the graphics work. The
screenshot shows **stair-stepped edges on a tile grid** — that is the GPU's
tiling, not our geometry, so it is a frame that failed to resolve rather than
anything being drawn black.

**It has not been reproduced here** — there is no iPad on this machine, and
SwiftShader will not show a driver-level tile failure. What was done is to
remove the two allocations that were provably wasted, on the theory that this is
memory pressure:

- **`antialias` is now off above Low.** Every tier above Low renders through the
  composer, so the canvas's own multisample buffer is never what you see — but
  it was still being allocated and resolved at native resolution every frame.
  This is correct regardless of the flicker; verified the picture is unchanged.
- **Ultra's shadow map 4096 → 2048** (and High 2048 → 1536). The shadow camera
  covers 160x140 units, so 2048 is ~13 texels/metre — past the point where more
  shows on a player-sized object, and 4096 is 67 MB competing with the composer
  targets, the bloom mip chain and a 14 MB model.
- `CinematicPass` now carries `uDepthValid`. With no depth attachment three binds
  a default texture, every sample reads zero, everything linearises to the near
  plane "touching" everything else, and the occlusion term paints a dark slab.
  It should never fire — both targets get an attachment at construction — but if
  it does the frame now comes through ungraded instead of black.

**If it persists**, the next thing to ask the player is whether dropping 3D
detail to High (which turns off the depth-of-field and halves the render
resolution) stops it. If High is clean and Ultra is not, it is memory or
bandwidth and the answer is to cap the Ultra pixel ratio at native. If it
happens on High too, suspect the composer chain rather than memory.

### Stadium variety
`stadiumSpec(seed)` in `renderGL.js` invents a ground: terracing depth and
height, roof or open, curved corners or not, seat palette, attendance, and
whether the floodlights are tall corner pylons or short masts over a roof.

The seed is `hashName(home.name + '|' + away.name)` — **the two team names, not
the club ids**. Ultimate XI always fields `WORLD.clubs[0]` against
`WORLD.clubs[1]` with custom squads, so club ids would have given one stadium
forever; the names vary because `divisionOpponent` fields a different club on
every rung, which is what makes climbing the ladder walk through eleven grounds.

Two things are deliberate:
- **Size and attendance are independent draws.** A packed small ground and a
  half-empty bowl are both real, and both beat every stadium being sold out.
- **Only the two *far* corners curve.** The near touchline is open because the
  camera lives there — closing the near corners would put terracing in front of
  the lens.

The lamps themselves do **not** vary. They are the scene's main illumination and
were tuned carefully (see below); only the mast geometry changes with the ground.

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

**"Make the menu nicer" means feel, not content.** Asked for it again, the
answer was a staggered deal-in on the tiles, a snappier press, and hover fenced
behind `hover: hover` — on a phone there is no hover state to enter, so the
lift only ever appeared *after* a tap, as something left behind. Nothing was
added to the screen. Given this has been reverted twice, treat any proposal
that puts information here as needing evidence first.
The wordmark came back after being removed with the counters; the counters were
the problem, not the name. The
tiles carry the cover's swoosh in their right third — clear of the left-aligned
text, with a scrim under it so it can never take a bite out of a word.

### Selling a card, and why it paid twice
`[data-sell]` in `squad.js`. The handler credited the coins **unconditionally**
and removed the id with a `filter`, which is a no-op once the card is already
gone. A second click on the same button therefore removed nothing and paid in
full — again, and again. Someone reached three million Apex with an auto-clicker.

Measured, before and after, by dispatching fifty clicks at one button:

| | cards removed | Apex paid |
| --- | --- | --- |
| before | 1 | 4,700 |
| after | 1 | 48 |

Two faults, and it needed both to be this bad:

1. **The payout was not conditional on the removal.** The check and the credit
   are now the same statement inside one `update`: the amount is decided by
   whether the `splice` happened, so there is no window between "is it still
   mine" and "pay me". `paid` staying zero means the click sold nothing, and it
   then does nothing at all — no coins, no toast, no sound, so a held button is
   silent rather than lucrative.
2. **`root.querySelector('.coin-chip').textContent` threw on every sell.** The
   chip only exists in the Store views and the Sell button is on the **Club**
   tab, so the line threw before `rerenderPitch()` could run — which is why the
   sold player *stayed on screen with a live Sell button*. That is the half the
   report described as "the players won't go", and it is what turned a payout
   bug into a farm. Null-guarded now.

**The lesson worth keeping: anything that pays out must be conditional on the
state change it is paying for, in the same transaction.** Cards are unique in
`collection` — the pack opener and the Icon Exchange both check `includes`
before pushing — so removing one index is removing the card.

### The guided tour
`js/tutorial.js`. A spotlight walk through the **real** interface rather than a
slideshow of pictures of it: every step points at an element that is genuinely
on screen, and the tour gets there by calling `navigate` and clicking the same
tab buttons a player would. It cannot drift out of sync with the app the way a
hand-drawn walkthrough does — rename a tab and the tour breaks in testing
instead of quietly teaching the wrong thing.

Twenty steps across ten chapters, Welcome through to Done, with **Skip section**
jumping to the next chapter. Content is one `STEPS` array: `screen` is navigated
to, `tab` is clicked, `target` is the selector to spotlight. Omit `target` for a
centred card, which is how a chapter introduces itself.

Three things carry the whole thing and each has a reason:

- **The hole is the dimmer.** One element with `box-shadow: 0 0 0 9999px` —
  everything outside it is shadow. No SVG mask, no four-panel edge rig, and it
  moves and resizes as a single box. A step with no target has nothing to cast
  that shadow *from*, so the scrim takes a background instead
  (`.tut.no-target`); the first attempt at this was a clever 0x0 hole and it
  silently dimmed nothing.
- **Positioning runs every frame**, not once per step. Steps land mid screen
  transition, panels stagger in underneath, `scrollIntoView` is still gliding,
  and the page scrolls. One `getBoundingClientRect` a frame on one element is
  cheaper than any of the ways of being wrong.
- **The card is clamped into the viewport.** This is the line that stops the
  tour dead-ending: positioned purely relative to its target, a target below
  the fold puts the card *and the Next button on it* off-screen, where there is
  no way forward and no way out but a reload. Caught by driving all twenty
  steps in a browser and asserting the card is on screen at each one — worth
  keeping that test if these are edited.

The spotlight is also clipped to the viewport, because a target taller than the
screen (the store grid is ~1000px of packs) would otherwise put the ring off
both edges and dim nothing, which reads as the tour having broken.

**A new save gets the tour, not the changelog.** Both are pending on a first
launch — a fresh save has never seen this build either — and `menu.js` runs
exactly one of them, because two overlays on one frame is how a first launch
becomes a wall of things to dismiss. The notes are marked seen on the way past
so they do not ambush the second launch. `settings.tutorialDone` is set **on
sight, not on completion**: someone who closes it after two steps has decided,
and being handed it again every launch is worse than missing it.

**It does not freeze the page.** The scrim has to swallow clicks — a stray tap
landing on a tile behind it would navigate away and leave the tour pointing at a
screen that is no longer there — but swallowing clicks swallowed the wheel with
them, and a tour that stops the mouse wheel working reads as the app having
hung. Wheel is forwarded to the window by hand and `touch-action: pan-y` hands
touch drags back to the browser. Scrolling is safe precisely because the
spotlight is repositioned every frame, so it tracks rather than being left
behind.

Steps can drive the Store's own sub-tab row with `stab`, looked up separately
from `tab` because the row does not exist until its parent tab has rendered.

Settings → **Replay tutorial**, first row of the first panel.

### Screen transitions
`ghostOut()` in `app.js`. Navigation replaced `innerHTML` outright, so the old
screen did not leave, it ceased — the new one faded up over whatever was behind
it, which is why opening a tile read as a page load rather than as going
somewhere. Nothing acknowledged the thing you had just pressed.

The outgoing nodes are **moved**, not cloned, into a fixed-position `.screen-ghost`
sitting on the old screen's bounding rect. Moving is cheaper than cloning and
pixel-identical, and it is safe because `activeCleanup()` has already run by
that point — those listeners are finished with, and the ghost is dropped a few
hundred ms later either way.

**`navigate` stays synchronous.** The DOM swap does not wait on an animation, so
no caller has to learn that navigating became async, and a second navigation
landing mid-transition simply replaces the ghost. The cleanup is belt and
braces: `animationend` plus a `setTimeout`, because an interrupted animation
never fires `animationend` and a leaked ghost would sit over the app eating
nothing but looking wrong.

Direction is read off the destination — the hub is the only place you go *back*
to, so `menu`/`splash` reverse it. Going in pushes the old screen away from you,
coming back drops it towards you.

Skipped for `play` (a WebGL canvas that is being disposed; ghosting it means
carrying a dead canvas for the length of an animation) and for `splash`, and
disabled entirely under `reduceMotion`.

Panels inside the incoming screen stagger, capped at six — past that the last
panel is waiting on an animation nobody is still watching, and a stagger that
outlasts attention reads as lag.

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

## Found in an audit, not yet fixed

- **A substituted player keeps the old man's face.** `substitute()` swaps
  `p.ref`, but the scanned-model rig in `renderGL.js` was built once from the
  *original* `ref` — skin, hair, height, socks and boots are baked into it. Bring
  on a visibly different player and he runs out wearing the previous one's
  appearance. Fixing it means rebuilding the rig mid-match (expensive) or making
  the per-player traits live uniforms.
- **`js/game/net.js` is a complete Verlet cloth simulation for goal netting that
  nothing imports.** It was in the service worker's precache list *twice*, so
  every install downloaded it for nothing; that is now removed. The file is kept
  because it works and the nets are still static — wiring it up is a real visual
  improvement waiting to be picked up.
- **A benched player comes back on fresh.** Stamina lives on the pitch object,
  not the card, so subbing a tired player off and straight back on restores him.
  Bounded by `MAX_SUBS`, so it is an oddity rather than an exploit.

### One tackle, not two
There used to be two tackle methods in `sim.js`, `tackle(p, sliding)` split on
a boolean: standing (short reach, no lunge, 10% box-foul chance) and sliding
(longer reach, forward lunge at 1.7x max speed, a flat 34% box-foul chance).
Pressing either input button produced a challenge that felt the same and, on
the sim side, mostly *was* the same — the flat foul rate on the slide meant a
clean, well-timed slide was punished exactly as often as a reckless one, which
is the opposite of what a foul chance should be doing.

`tackle(p)` is now one method, always lunges (what used to be slide-only
physics), and the foul chance is driven by `frac = dist(p, owner) / REACH` —
distance to the ball carrier at the moment the tackle is committed, as a
fraction of the reach. Close in is a fair contest for the ball; a stretch from
near the edge of reach is treated as reckless, and the foul chance rises with
`frac²`. There is no `sliding` parameter anymore, on the call site or the
method — every off-ball press of pass/through/cross/shoot, and the AI's own
press logic, calls the same `tackle(p)`.

**The foul-chance constant is not a guess.** The first version used `0.38` and
a measurement script modeled on `tools/sweep.mjs` (monkey-patching
`Match.prototype.awardPenalty` to count calls over 120 seeded AI-vs-AI matches,
two seeds) showed it nearly doubled the penalty rate against the pre-change
baseline — 0.28/match vs. 0.15/match. Root cause: the AI's own tackle-commit
distance gate (`dist < 2.4`) sits well inside the unified `REACH = 3.1`, so
AI-thrown tackles land with `frac` biased toward the upper half of its range
far more than a naive "average tackle distance" estimate would suggest. Retuned
to `0.21`, re-measured at 0.183/match on both seeds — close to baseline and
seed-stable. If this method is touched again, re-run that kind of measurement
rather than adjusting the constant by feel; the project's standing rule (below)
about never re-balancing by feel applies just as much to foul chance as to
goals or shots.

Touch, keyboard and pad all still ride the same four action strings
(pass/through/cross/shoot) for the tackle trigger — see "Touch button sizing"
below for the one place this almost drifted.

### Touch button sizing
Buttons were too small on iPhone and iPad. The existing "shrink on small
screens" rule was `@media (max-width: 640px)`, and it was **functionally dead
on real devices**: this match only ever plays in landscape, where a phone's
width is its *long* edge — an iPhone 15 in landscape is 932px wide, nearly
300px past the breakpoint that was supposed to catch it. iPads never had a
sizing tier of their own at all, on any query.

Replaced with three tiers keyed off `(pointer: coarse)` — true on touchscreens
regardless of size, false on a desktop mouse, which is the axis that actually
means "this needs a bigger target":
- **Base `(pointer: coarse)`**: every touch device gets bigger than the mouse
  default (84px, sprint 106px).
- **`(pointer: coarse) and (min-height: 620px)`**: tablet-class landscape —
  the tallest common iPhone landscape height is ~430px and the shortest common
  iPad landscape height is ~744px, so 620px sits cleanly between them. Biggest
  tier (100px, sprint 124px).
- **`(pointer: coarse) and (max-height: 440px)`**: phone-class landscape,
  replacing the old dead `max-width: 640px` rule with the axis that actually
  varies for a landscape-only screen (72px, sprint 90px).

Removing the standing/slide split (above) also freed a button slot — the old
SHOOT-while-defending slot is hidden now rather than duplicating TACKLE, and
that space went to making TACKLE itself bigger.

**Verified live** on an emulated iPhone 15 landscape (932x430) via Playwright:
the defending HUD shows exactly three buttons — SWITCH, TACKLE, SPRINT — at
the phone-tier sizing, confirming both the single-tackle-button layout and the
`(pointer: coarse)` media query actually apply in a running browser, not just
on paper. The iPad tier (`min-height: 620px`, 100px/124px) was reasoned the
same way from real device dimensions but **not** screenshotted — Playwright's
`page.screenshot()` hung indefinitely on the 1180x820 iPad viewport in this
sandbox specifically (canvas renders, `#gmCanvas` appears, the screenshot call
itself never returns even at 45s), while the same script's iPhone viewport
screenshots correctly every time. Looks like a headless/sandbox rendering
quirk at that canvas size rather than anything wrong with the CSS, but if a
report ever says iPad buttons are still small, check the actual applied rule
in devtools before assuming the reasoning was wrong.

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
- **Bump `CACHE` in `sw.js` and `APP_VERSION` in `app.js` on every release, and
  add a matching entry at the top of `RELEASES` in `js/data/patchNotes.js`.**
  Without the third one the update ships silently — the in-game card and the
  notes page both key off that version.
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
