# TikTok clips (tools/tiktok)

Batch 1 (six clips, 1080x1920, under 9 MB each) was cut with these tools.
They live on the orphan branch `tiktok-batch-1`, which is never merged.

    node tools/trailer/scenes.mjs 30 tests/tmp/tiktok/scenes        # 40 s: record AI matches, with sound cues
    node tools/trailer/film.mjs --shots <list> --out tests/tmp/tiktok/render --w 1080 --h 1920
    node tools/tiktok/pack.mjs | watch.mjs | live.mjs | menus.mjs   # screens, watch app, old builds
    node tools/tiktok/text.mjs tests/tmp/tiktok/text.json tests/tmp/tiktok/text
    python3 tools/tiktok/cut.py <clip|all>                          # clips.py holds the six edits

## What took the time in batch 1, and how to avoid it next time

1. **Rendering 1080x1920 on SwiftShader: 3–10 s a frame.** Five browsers on four cores
   each slowed the others, because SwiftShader is multi-threaded. Next time:
   - run at most **two** film processes at once;
   - render **720x1280** and upscale; that's about half the pixels, and TikTok recompresses anyway;
   - render only the frames the edit uses (the lists have `from`/`to`; trim them to the cut).
2. **Match loads: 3–10 min per club pairing.** film.mjs loads one match per (home, away, time,
   weather) group. Pick every scene of a batch from one or two pairings (`scenes.mjs` names
   carry the match number; see the clubs in each JSON).
3. **Blind camera iteration.** Four rounds were lost to framing. Known good in portrait:
   - `vfollow`: behind the ball, looking down the attack. Use it for nearly everything.
   - `vorbit`: celebrations.
   - `vhigh`: long shots.
   - `goal`: post level. It works when the ball is already in the net (`w-post`).
   - `vnet3`: beside the post. The bulge is visible, but the shot is small.
   - Bad: `vnet` and `vnet2` (goal frame and advertising boards in the way), and `vtight`
     when the owner is far from the ball.
   - Bad: any camera when the ball is within ~12 m of a touchline (the boards fill the bottom).
     Pick central stretches; clips.py's history has the query.
   - Test new cameras at **540x960, 2–3 frames**, in one list, before a full render.
4. **The game's own goal replay** played over the shot that followed any goal. film.mjs now
   stops it while filming. If shots look like someone else's camera, suspect a game system
   taking over the camera.
5. **Screens: use `stepper.mjs`, not a real-time screencast** (6 fps). Playwright's
   `clock.install()` keeps running in real time unless it is followed by `pauseAt()`.
   stepper.mjs does this.
6. **Old builds (live.mjs):**
   - v27 has no clamp for tall windows, so film it in 16:9.
   - Its kick-off stalls with both sides on the AI; pass `--drive`.
   - Its server drops the 14 MB player model, so live.mjs serves it directly.
   - v27 on a portrait phone shows only the rotate wall; `menus.mjs` captures that.
7. **Public footage:** player names are replaced from the name pools. pack.mjs does this, and
   watch.mjs patches the watch bundle to do it.

## Reuse

- `tests/tmp/tiktok/shots*.json` are the batch-1 shot lists. They are gitignored; the clip
  specs in clips.py name every shot and frame range, so they can be rebuilt from it.
- The size budget is in cut.py (`MAX_BYTES`, two-pass). The cap is read as 9,000,000 bytes.
- Sound is always the game's: sim cues are replayed through js/audio.js offline (sound.mjs),
  and commentary uses assets/voice/us.
