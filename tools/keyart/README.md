# Menu key art

`assets/keyart.jpg` is a frame from the game's own renderer, shot from a camera
the game never uses, then graded. Two steps:

1. **Shoot** — `node tools/keyart/shoot.mjs` with the app served on :8413.
   It starts a Quick Match at 2560x1440 on the `high` tier with the scanned
   player models, then grabs frames from several low pitchside camera poses.

   The poses are fed in through `globalThis.__keyart`, which **is not in the
   shipped code**: the shoot needs a temporary hook at the top of
   `updateCamera` in `js/game/render3d.js`:

   ```js
   if (globalThis.__keyart) {
     const b = match.ball, k = globalThis.__keyart;
     cam.x = b.x + k.dx; cam.y = b.y + k.dy; cam.z = k.z;
     cam.tx = b.x + k.tdx; cam.ty = b.y + k.tdy; cam.tz = k.tz;
     cam.hfov = k.hfov;
     return;
   }
   ```

   Add it, shoot, then take it back out. It is deliberately not committed: the
   broadcast camera is gameplay, and a debug hook into it is not something to
   leave in a build.

2. **Grade** — `python3 tools/keyart/grade.py <frame.jpg> [out.jpg]`, which
   crops, grades to night, screens a bloom over the floodlights, lays in the
   green brand streaks, scrims the lower half hard (the tiles and the small
   print live there) and adds grain so a 2560-wide gradient does not band.
   Defaults to writing `assets/keyart.jpg`.

Rules of thumb learned the hard way:
- **Shoot at the size it will be displayed.** The complaint that started this
  was "low quality", and the cause was a 1672px-wide image stretched across a
  2560px screen.
- Most of the darkening belongs in the *image*, not in the CSS scrim. A scrim
  heavy enough to make bright art safe turns it into a grey wash.
- If the art ever carries its own APEX XI lockup, hide `.menu-wordmark` on the
  menu again — see the comment on `body.on-menu::before`.
