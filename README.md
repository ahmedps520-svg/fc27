# APEX XI

An original football (soccer) card-collecting and club-management web app. Zero dependencies,
no build step — plain HTML, CSS and ES modules.

Everything in the game is fictional: clubs, players, nations, crests and the competition itself
are generated procedurally. No affiliation with any real league, club, player or existing game.

## Run it

It uses ES modules, so it needs to be served over HTTP (opening `index.html` from the file system
will not work).

```bash
py -m http.server 8412
```

Then open <http://localhost:8412>.

## What's in it

| Screen | What it does |
| --- | --- |
| **Main Menu** | Card tiles into each mode, world stats, and a resume-career shortcut. |
| **Squad Builder** | Four pack tiers with rarity-weighted pulls and a walkout animation, a drag-and-drop formation pitch (4-3-3, 4-4-2, 4-2-3-1, 3-5-2), live squad rating and chemistry, plus quick-sell. |
| **Career Mode** | Pick one of 10 clubs, play or sim an 18-matchday season, league table, fixtures, results, and a transfer market on a budget. |
| **Quick Match** | A **playable** full-screen 3D match you control with a gamepad, keyboard or touch. |
| **Career match sim** | Minute-by-minute event sim: possession, shots, on target, corners, commentary feed, goal flashes, and a man-of-the-match result screen. |

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
requests fullscreen; the ⛶ button toggles it. On a touch device an on-screen stick and four face
buttons appear instead.

Match length (2 / 4 / 7 min) and CPU difficulty (Easy / Pro / Elite) are set before kick-off.

### The engine

Rendering runs on **three.js** (WebGL, vendored locally in `js/vendor/`, MIT licensed) — real
meshes, lambert shading, a directional sun with soft shadow maps, and the crowd as a single
`InstancedMesh` so thousands of seats cost one draw call. Measured 1.55 ms/frame at 720p against
3.9 ms for the old canvas path, with a denser crowd.

A canvas-2D renderer (`render3d.js`) is kept as an automatic fallback if a machine refuses a WebGL
context. All geometry is still generated in code — no downloaded models or textures.

Players are jointed figures, not boxes: hips and shoulders drive thighs, shins, upper arms and
forearms through tapered prisms, with knees and elbows that bend across the run cycle and spheres
for the head and hands. Feet, hair and hands are full-detail only. Everything is depth-sorted back
to front and frustum-culled.

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

- **254 players** — name, position, overall (60–99), six stats (pace / shooting / passing /
  dribbling / defending / physical), rarity tier, club, fictional nationality, age, market value.
  Overall is a position-weighted blend of the six stats, not a separate number.
- **10 clubs** — name, procedural crest (geometric shape + two-colour palette), 22-player roster,
  budget, league. Squad quality scales with club tier.
- **1 league** — 18 matchdays of double round-robin fixtures, W/D/L/GF/GA/GD/points table.
- **34 free agents** on top of club rosters, feeding packs and the transfer market.

Rarity is derived from overall: bronze < 70, silver 70–78, gold 79–87, special 88+.

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
