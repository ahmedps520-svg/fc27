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

### v131 — the store email in the game's look (owner's ask: "sharp glowing lines just like the game")
- `tools/email/art.mjs` renders:
  - `assets/email/header.jpg`: the screen-head banner (the swoosh with a
    glow filter, the ladder motif, the ring and the wordmark);
  - `divider.png`: a lit rule;
  - `footer.png`: the swoosh.
  The header is converted to a JPEG, about 37 KB.
- `purchaseEmail` uses them via `PUBLIC_ORIGIN` (default
  https://fc27.onrender.com) with `?v=131`. The type and panels glow via
  text-shadow/box-shadow (Apple Mail).
- Owner notes: the $1.99 test arrived in Junk; the earlier $49.99 predated
  the key. DNS: DMARC `p=quarantine`, relaxed alignment; Resend DKIM on
  the root is aligned.

### v130 — the store email's outcome is visible
- The owner set `RESEND_API_KEY` on Render but no email arrived.
- DNS is fine: apexxi.online's MX is iCloud; Resend's DKIM
  (`resend._domainkey`) and `send.` MX/SPF are present.
- Changes so the reason is visible without Render's logs:
  - `/api/purchase` now awaits `sendMail` (8 s cap) and returns
    `mail: 'resend' | 'outbox' | 'pending' | 'failed: <Resend message>'`;
  - the receipt shows it (`receiptLine`);
  - `sendMail` reads Resend's error body;
  - `/api/health` gains `mail: 'resend'|'outbox'` (never the key).

### v129 — the Ultimate shop, test mode (owner's ask)
- The owner asked for "micro transactions, with a fake place holder for now
  credit card cvv and everything else", plus one email per purchase to
  support@apexxi.online with the game's design, a "you just got a purchase"
  message and a fake balance update.
- The owner chose "No, show only": a test purchase does **not** change
  `club.ultimate`.
- `js/data/shop.js`:
  - `TEST_MODE`, `TEST_CARD` (4242…), `BUNDLES` (5), `checkCard` (Luhn,
    expiry, CVV length by brand, name, postcode);
  - `cardBrand`, `formatCard`, `formatExp`, `orderRef` (`AX-XXXXXXXX`).
- `js/components/checkout.js` `openCheckout(bundle)`:
  - an overlay with a live card preview;
  - inputs have no `name` and use `autocomplete=off`;
  - on Pay the fields are blanked, then `reportPurchase({bundle, ref,
    club})` is sent — **no card data**;
  - the receipt shows only the brand and last four, computed locally.
- Store subtab `ultimate` in `squad.js` (`ultimateShopView`).
  `checkoutOverlay` is removed on navigate. Both new files are precached.
- `server/shop.js` + `POST /api/purchase`:
  - the server prices from its own table; a unit test holds it equal to
    the client's;
  - rate limit `buy:<ip>` is 5 per 10 minutes;
  - the running test balance is in `<data>/store-ledger.json`;
  - `purchaseEmail()` builds table/inline-style HTML in the game's
    colours, plus a text part.
- Sending:
  - with `RESEND_API_KEY`, it posts to Resend. `MAIL_FROM` defaults to
    `APEX XI Store <store@apexxi.online>`, which must be on a domain
    verified in Resend; `STORE_INBOX` overrides the recipient.
  - without a key, the email is written to `<data>/outbox/<ref>.html`.
- The owner made the Resend account and verified apexxi.online.
  `render.yaml` now declares `RESEND_API_KEY` (`sync: false`, set it in the
  Render dashboard) and `MAIL_FROM`. The live game is served by the same
  Render service, so `SERVER_ORIGIN` is not needed there.
- The store ledger lives on the instance's disk and resets on each deploy.
- **Until `RESEND_API_KEY` is set on Render, no email is sent.**
  The game on GitHub Pages only reaches the server if `SERVER_ORIGIN`
  is set; otherwise the receipt says "Not sent (offline)".
- Tests: `tests/unit/shop.test.mjs`; `tests/qa/shop.mjs` (a CI step,
  desktop and phone). `startServer()` now returns `dataDir`.

### v128 — the curtain on tab switches too (owner's ask)
- `app.js` `veil(redraw)`: raises the curtain, runs `redraw`, then lifts it
  the same way `navigate` does.
- Used wherever the tab actually changes; clicking the open tab still
  redraws, without the veil:
  - `squad.js`: `#uTabs`, `#sSubs`, `#cSubs`;
  - the tab rows in `career.js`, `pro.js`, `street.js`, `skills.js`;
  - `world.js` `[data-tab]`.
- Checked in a browser: Club → Division → Online → Club, the veil goes up
  every time and lifts after 3–260 ms, no errors.

### v127 — a loading curtain on every screen change (owner's ask)
- `app.js`: `curtainFor(name)` raises `#screenCurtain` (a blurred and
  darkened veil with a spinning SVG ring and an "A") on every navigation
  where `current !== name`, except to `play`.
- It lifts after the new screen has rendered and these have loaded:
  - its `<img>`s;
  - `document.fonts.ready`;
  - for the menu, the key art (`preloadImage`, cached).
- Timing is `CURTAIN_MIN_MS` 260 and `CURTAIN_MAX_MS` 2500.
- It also goes up immediately when a screen module still has to be
  fetched; the old 150ms spinner is hidden.
- It blocks pointer events while on. Playwright waits for it, and the
  whole QA suite was run against it.

### v126 — owner's National Day / store / menu asks
**Owner's requests:**
- National Day and the other seasonal themes were "stretched out bad quality
  flags".
- Add Saudi packs and player icons.
- Fix the theme and add a Saudi song.
- The anthem is official and not copyrighted (owner's word; verified public
  domain via the US Navy Band recording).
- The menu background is low bitrate with old models, and the menu player
  model is outdated.
- Remove old packs, add a Promo section, and retire packs over time.

**Seasonal (`seasonal.js`):**
- Root cause: the v83 SVGs used `preserveAspectRatio="none"` (the pennants)
  and `slice` (the palms and lanterns), so wide screens smeared or cropped
  them.
- Now everything is fixed-size, tiled with SVG `<pattern>`s or placed:
  - National Day: a Najdi parapet band, two palms (160×220), five firework
    bursts, confetti, and the chip with `nationalDayNumber()` (year − 1930,
    so 96 in 2026).
  - Ramadan: a gold 8-point-star band, 6 lanterns (sway plus flame glow;
    the last two hidden under 700px), a crescent and star, twinkles.
  - Winter: an icicle fringe band, 26 six-arm SVG flakes with sway, a snow
    drift.
- Reduced motion freezes them all.
- The palm hides when the menu hero is live (`:has`).

**Cards (`pools.js`, `generator.js`, `promos.js`):**
- `SAUDI_ICONS`: 11, rated 91–97, with a `saudiIcon` flag.
  - Appended after sbc2, so ids p6414–p6424 and no earlier id moves.
  - The sweep is identical. `generator.test` counts were updated.
- `EVENT_CAMPAIGNS.nationalday` is outside the weekly rotation, so
  `campaignNow` is unchanged:
  - Saudi, 68+, filler "Jr/Nassr/Shabab" names excluded;
  - +10;
  - rarity `nationalday`, with its own card CSS.
- `.pcard.sa-icon` is green and gold.

**Store (`packs.js`, `squad.js` storeView):**
- 13 `CORE_PACKS` plus `rotationFor(week)`: 4 of the 15 others, shuffled per
  cycle so every pack comes round.
- `season` packs only appear in their theme.
- `storeCatalog()` returns badges: new/updated (by `added`/`updated` within
  14 days), back, season. Non-core packs show a leaves-in countdown.
- The Promo shelf leads.
- The `nationalday` pack:
  - variant slot: an ND card, or 1/12 a Saudi Icon;
  - Saudi filler with silver/gold only, because only one Saudi special
    exists, so two special rolls would repeat him (this was caught by
    `packs.test`);
  - `tests/unit/store-rotation.test.mjs`.

**Music (`audio.js`):**
- `TRACKS` gains file tracks (`{ file, plays }`), played by
  `playFileTrack`. The fetch and decode go through the `loadVoice` cache.
- `preferTrack('green-nights')` runs on National Day.
- `startAnthemFile()` plays `assets/music/anthem-sa.mp3` (US Navy Band,
  public domain, see `assets/music/CREDITS.md`). It is used for a Saudi side
  or on National Day, falls back to the generated anthem, and is precached.
- `tools/music/khaleeji.mjs` renders `green-nights.mp3` and
  `ardah-walkout.mp3` offline: Karplus–Strong oud and qanun, membrane drums,
  claps, riq, strings, Schroeder reverb. `ardah-walkout` is rendered but not
  wired yet (the anthem took the walk-out).

**Menu hero (`menuHero.js`):**
- The WebGPU branch drew a cylinder stand-in; that was the "outdated model".
  It is removed.
- High/Ultra use the scanned model (`makeRig` + `poseRig`) with the card's
  hair.
- Medium uses the built figure.
- `canvas.dataset.figure` is 'scanned' or 'built'.

**Key art:**
- `tools/keyart/shoot.mjs` is self-contained: its own server, and it
  patches the `updateCamera` hook in via `page.route`, so the shipped code is
  never touched. See the result below.

### v125 — dreads, braids, bun, mohawk; portrait hair on the scanned model (owner's ask)
**Styles:**
- `face.js`: `style` 6 dreads, 7 braids, 8 bun, 9 mohawk. About 30% of
  players get one, picked by `(h>>>26)%10 < 3 → 6 + ((h>>>3 ^ h>>>19) % 4)`,
  which gives an even split. The other ~70% keep the original 0–5 pick.
- **This changes the portraits for those ~30% of players.**
- `LOOK_STYLES` names all ten. The SVG draws the four new silhouettes.
- The Pro and Street creators offer all ten.

**Built figure (`rig.js`):**
- `HAIR_STYLES = 10`.
- New pieces:
  - dreads: 11 locks around the back;
  - braids: 5 rows plus 2 plaits;
  - bun: a knot at the back;
  - mohawk: a strip.
- Braids, bun and mohawk sit on the tight buzz cap.

**Scanned model (`playerModel.js`):**
- The sculpted `Ch38_Hair` is hidden whenever there is a ref.
- A `hairGeometry(style, false)` mesh is parented to the Head bone:
  - `apexHair`, position (0, 11.21, 4.02) cm in bone space;
  - basis x→z, y→x, z→y;
  - scale (10.3, 9.5, 11.2).
- The colour is the portrait's.
- There is no beard on the scanned model: the jaw is further forward, and
  the shape read as a mask.
- Head measured: centre (0, 165, 1.5), radii 9.2 fwd, 8.4 lat, 11.4 up.
- Fitted by eye on `tools/hair-shots.mjs`, which now writes
  `hair-rig.png` and `hair-model.png`.
- `trait.bald` now only applies without a ref.

### v124 — hair variety on the built figure (backlog #17)
**Owner feedback:** no reply yet on whether the v123 controller fix works on
their setup. Ask again.

**`rig.js`:**
- `hairGeometry(style, beard)` returns the portrait's six silhouettes
  (face.js `style`: 0 crop, 1 fringe, 2 quiff, 3 long at the back, 4 buzz,
  5 afro) plus an optional beard.
- The pieces are merged into ONE non-indexed geometry in the hair mesh's
  unit space: +x facing, +z up, head centre at z ≈ -0.21. The per-frame
  placement and scale are untouched, and there are no extra draw calls.
- Cached per style and beard; styles wrap mod 6.
- The cap moved back (−0.18, 0, 0.08), so the hairline sits above the eyes.
  The old cap hung over them, which changes style 0 for everyone.
- `buildPlayer(..., { hairStyle, beard })`. renderGL `simpleRig` and
  menuHero pass `faceOf(ref)`. The manager, referee and scanned models are
  unchanged.
- `tools/hair-shots.mjs` draws the contact sheet (6 styles × beard ×
  front/side).
- `tests/unit/hair.test.mjs` (3).

**Next for #17:**
- Hair variety on the scanned model: hide its hair mesh and attach a
  `hairGeometry` mesh to the head bone.
- The 3D trophy room.

### v123 — controller support in the menus (owner: "fix controller support so they can use it in menu too")
**Root cause:**
- Every reader took the first connected gamepad (`live[0]` or
  `pads.find(connected)`) and assumed the standard mapping:
  `padMenu.js`, `splash.js`, `Input.poll` and `sideSelect.js`.
- With a virtual pad in slot 0 (Steam, a DS4Windows ghost, a headset
  exposing HID buttons), the menus read a device nobody touched.
  `tests/qa/pad-real.mjs` on the v122 code: "A on the title did not reach
  the menu", for both layouts.
- Raw (`mapping: ''`) pads were a second failure:
  - Firefox and generic pads put the D-pad on axes 6/7 or a hat axis 9.
  - Start is raw 7.
  - A raw DS4 has □ on 0 and ✕ on 1.
  - The menu only read buttons 12–15, so the D-pad did nothing.

**Fix: `js/game/padRead.js` (new, precached):**
- `activePad()` picks the connected pad (≥4 buttons) whose buttons or
  sticks changed last. A first sighting doesn't count, so a drifting stick
  can't steal focus. Before any press, it takes the first standard pad.
- `normPad()`:
  - a standard pad is returned untouched;
  - a raw pad is mapped to the standard layout: hat or 6/7 D-pad →
    buttons 12–15; the XInput raw layout → Start 9, Back 8, triggers from
    axes 2/5 → 6/7, right stick 3/4 → 2/3; the Sony raw layout → ✕ 0, ○ 1,
    □ 2, △ 3.
- `readPad = normPad(activePad())`.
- Used by padMenu, splash and `Input.poll` (when no seat is assigned; seats
  keep their index but are normalised). sideSelect normalises each pad and
  skips non-pads.

**Tests:**
- `tests/unit/pad-read.test.mjs` (7).
- `tests/qa/pad-real.mjs`, a new CI step: phantom in slot 0, raw pad in
  slot 1, xpad and ds4. It covers the title A, the ring moving on the D-pad,
  A opening a screen, and B/Start going back.

### v122 — less text, part 2, and the pause menu bug
**Found by screenshots of a real match** (landscape phone, 844×390):
- **Pause menu.** The touch pad (`.gm-touch`) was drawn over the pause menu:
  SKILL, LOB, THROUGH and SHOOT sat on top of the Team Management and
  Substitutions options.
  - `setPaused` toggles `root.gm-paused`.
  - CSS hides `.gm-touch` and `#gmHints` under it, and under any visible
    `.gm-overlay` (via `:has`).
  - `.is-pause` now has a dark gradient backdrop; it was `background: none`,
    and the bench list was unreadable over the pitch.
- **In-match tips.** `HINTS` in play.js are now a `<kbd>` chip plus a few
  words, set with innerHTML. Key names go through `esc`. The touch variants
  name the on-screen buttons.
- **Career ground.** The expansion paragraph became `facts` chips, plus an
  `about` explaining why the board says no.

**Checked:**
- Full time with the split bars renders.
- Unit, pad-reach, layout, a11y, SBC and the bot are all green.

**Left:**
- Data `.hint` lines remain: offers, cup survivors, promotion moves, event
  and SBC briefs. They are content, not explanation.

### v121 — recorded commentary (owner's pick: the American pack)
**How it was made:**
- huggingface.co opened once the owner allowed it; this container picked it
  up mid-session.
- Kokoro-82M (onnx-community, Apache-2.0) runs via `kokoro-js` installed in
  the scratchpad, not in the game's deps. Node needs `NODE_USE_ENV_PROXY=1`
  to fetch through the proxy.
- ffmpeg comes from the `imageio-ffmpeg` wheel.
- The owner heard 11 sample voices and chose the American pack: Mike
  (`am_michael`, the caller) and Harper (`af_heart`, the analyst).

**Files:**
- `js/data/voicePackUS.js` (new, precached):
  - name-free lines per event key for pbp, co and context;
  - `packClips()` lists every file; context lines are rendered for both
    speakers;
  - `VOICE_PACKS`.
- `tools/voice-pack.mjs --kokoro <dir>` renders
  `assets/voice/us/*.mp3`: 359 clips, 3.13 MB, 48 kbps mono, silence
  trimmed, loudnorm -16 LUFS. It skips existing files, so to change a line,
  delete its file and re-run. The file index is the contract.
- `audio.js`:
  - `loadVoice` (cached fetch plus decode), `playVoice` and `stopVoice`;
  - voices go to master, not the effects bus;
  - the crowd ducks to 0.55 while a voice speaks.
- `broadcast/voice.js`:
  - `packLine()` and `clipUrl()`;
  - the desk plays `item.file` through `playVoice`, never falling back to
    device speech mid-match. A clip older than 4.5 s is dropped. A goal cuts
    the current clip.
  - `warm()` preloads the goal and kick-off clips.
- `director.js`: `pack` is set when lang is `en` and `settings.commPack` is
  not `'device'`. `line()` keeps the feed's named text but voices the pack
  line.
- `play.js`: with a pack, the robot PA (`announce`) is caption-only.
- Settings → Commentators: American / Device voice, plus a ▶ Hear button.
- MP3s are not precached; the service worker's network-first fetch caches
  each clip on first play.

**Tests and checks:**
- `tests/unit/voice-pack.test.mjs`: every clip exists and there are no
  extras; no placeholders; keys are real; no repeats; the desk subtitle
  equals the clip.
- Verified in Chromium: decode and play; the ▶ Hear button; a Quick Match
  fetched the warm set and played a context line under "Mike".

**Next:**
- The owner's less-text pass continues: pause menu, in-match notes and the
  remaining `.hint` data lines.
- A second pack is possible (bm_george plus bf_emma sampled well).
- An Arabic pack is not possible with Kokoro.

### v120 — owner's asks: responsiveness locked, fewer words, bug hunt
**Owner's requests (2026-09-26):**
- Lock responsiveness for everyone, because it was an edge.
- Too much text: start with Squad / Ultimate XI / Career and the in-match
  HUD and results.
- Hunt the bugs.
- Replace the commentary voice with recorded AI voice packs.
- Only responsiveness gets locked; assists stay as they are.

**Responsiveness:**
- `sim.js` exports `RESPONSIVENESS = 0.7`. The `Match` ignores
  `opts.responsiveness`.
- The Settings slider, the state default and play.js's pass-through are
  removed.
- `responsiveness.test.mjs` now asserts that 0 and 1 are ignored.
- `pad-reach` slides `#padDead` instead.

**Fewer words (`js/components/facts.js`, new, precached):**
- `facts([[icon, text, tone]])` draws icon chips. `about(text)` is a
  `<details>` ⓘ in the panel head. `bigStat(value, label, icon, tone)` draws
  a big number with a label.
- The icons are drawn in the menu's line style.
- Applied to `uxiHub.js`, `squad.js`, `career.js`, `careerDepth.js`, and
  play.js's full-time screen:
  - the next fixture is a VS strip;
  - the full-time stats have split bars (`.gm-stats.split`, `--l`);
  - Pro and Street results and the career record use `bigStat`;
  - the Binder is a tile grid (`.bset.open` spans the row);
  - evolution tracks show a lock chip.
- Left for v121/122: the remaining `.hint` data lines (fixture, offers,
  cup-alive list), the pause menu and other in-match notes.

**Bug found (the worst): SBC Start was dead outside the Quick group.**
- `squad.js` listened on `querySelector('.sbc-list')`, which is only the
  first list, so every Squad and Legend SBC's Start did nothing.
- Now delegated on `#sbcGroups`.
- The groups are `<details>`, one open at a time (`sbcOpen`). The page on a
  390px phone went from 13,212 px to 2,277 px.
- New CI step `tests/qa/sbc.mjs`.

**Sweeps before the fixes:** unit, balance sweep (identical), bot, cup,
pad-reach, touch-audit, touch-editor, layout, a11y and the 20-match soak all
passed. The SBC bug was found by eye on screenshots; no test covered it.

**Commentary voice packs: blocked, plan ready.**
- The owner chose recorded AI voice packs.
- Higgsfield: 0.1 credits on the free plan against 0.3 per clip. Three
  packs of about 300 clips each is about 270 credits.
- Kokoro-82M (Apache-2.0) is the plan. huggingface.co answers 403 through
  the egress proxy. The owner added it to the environment, but this
  container kept its start-up policy.
- Fetching the weights via npm was refused by the permission classifier as a
  bypass. Do not retry that.
- On a fresh container:
  1. `curl huggingface.co` first. Also needs `cdn-lfs.huggingface.co` and
     `cas-bridge.xethub.hf.co`.
  2. Get `onnx-community/Kokoro-82M-v1.0-ONNX` via pip `kokoro-onnx`.
- Design:
  - 184 of the 238 play-by-play lines carry `{player}`/`{team}`, so a pack
    needs its own name-free bank per event key. Subtitles show exactly what
    is spoken.
  - Two speakers per pack, about 25 keys × 5 lines.
  - Opus files under `assets/voice/<pack>/`, loaded lazily. They should not
    go in the service-worker precache, to keep the install small.
  - `broadcast/voice.js` plays the clips through the audio bus and falls
    back to device speech.
  - A Settings select to choose the pack.

### v119 — real rivalries (backlog #16), and the v118 CI red explained
**v118 CI.** The run on `01ad46e` failed in `touch-editor.mjs`: the Done tap
did not close the editor, and 7 checks cascaded from it.
- The editor code was unchanged since v117, which passed, and the test
  passes locally.
- The test now waits for the overlay to detach, and retries once with a log
  line (`Done: first tap not taken`) before failing.
- The re-run on `7aa91da` was all green. The retry line did **not** appear,
  so it was a one-off.
- Listener-leak audit of every screen mount: all `window`/`document`
  listeners are removed on cleanup; only the two v118 root listeners had
  leaked.

**Rivalries (`js/data/rivalries.js`, new, precached):**
- 17 pairs of real-club ids from `countries.js`, each with a plain name
  ("the Manchester derby", "the Glasgow derby", "the great Spanish
  rivalry"), no branded titles.
- `rivalryOf(idA, idB)` is symmetric; null for unknown, identical or
  missing ids.

**Where it shows:**
- `play.js` sets `match.rivalry` from the travelling squads' ids. The world
  ids only anchor the pitch; I checked that the anchor clubs 0 and 1 are
  not themselves a generated derby.
- A derby counts as `bigGame`: sell-out, the walkout, the tifo.
- The crowd bed floor goes 0.3 → 0.42.
- Chants come every 14–30 s instead of 28–58 s.
- `broadcast/director.js` prefers `match.rivalry` over `derbyOf`, so the
  existing `derby`/`derbyGoal` commentary and the pre-match preview name it.
- Kick Off shows the name above the head-to-head when you pick two rivals.

It is presentation only, and a unit test asserts `sim.js` never mentions a
rivalry. The sweep is identical.

**Tests:** new `tests/unit/rivalries.test.mjs`:
- every pair exists in the team data;
- names are symmetric;
- negatives return null;
- the sim does not know about rivalries.

Browser check: picking Liverpool v United showed "The north-west rivalry" on
Kick Off, and the same on `match.rivalry` and the director.

### v118 — Custom Cup (backlog #16: tournament creator), and stacked click handlers fixed
**`js/customCup.js`** (new, precached):
- Teams come from `countries.js`: every country's clubs plus the nations,
  by stable id (`kc-england-mci`, `nat-Brazil`).
- `createCup({ name, ids, you, seed })`: 4, 8 or 16 teams, and yours among
  them. The name is trimmed to 32 characters. The draw is a seeded shuffle
  into ties.
- `onResult(scored, conceded)` records your tie. A draw goes to penalties
  from the cup's seed.
- `advance()` settles the rest of the round with `simTie` (Poisson on the
  rating gap, seeded per cup/round/tie, the same approach as
  `tournament.js`) and pairs the winners.
- Out of the cup, it plays out to a champion.
- `matchParams()` puts you at home, with both squads travelling as in Quick
  Match.
- It's saved in `club.customCup` and **pays nothing**, so the economy is
  untouched.

**Screen (`js/screens/cup.js`, route `cup`, a "Custom Cup" button on Kick
Off):**
- The creator: name, size (4/8/16), country select, team chips (44 px),
  a picked list with a ★ to choose yours, Fill at random, Clear, and Draw.
- The bracket: your next tie with Play, rounds as columns (horizontal
  scroll on a phone), a champion panel, Abandon/Make another.
- `play.js` calls `customCup.onResult` at full time, shows a
  "Through / Out / winners" line (the cup name escaped, since it's the
  player's text), and quit returns to `cup`.

**Real bug found building it: stacked click handlers.** Screens that put a
click listener on the screen `root` without removing it stacked one more
listener per visit, because `root` outlives each render.
- Kick Off: measured 1, 2, 3 teams per arrow press on visits 1–3.
- Evolutions (`uxiHub.js` `mountEvos`, mounted from `squad.js` with no
  cleanup returned): a tap could start a track twice.

Both now use an `AbortController` whose `abort()` is the mount's cleanup
(`squad.js` returns `mountEvos`'s cleanup). The cup screen was built the
same way. Audit: the only other root listener, squad's drag, was already
removed.

**Tests:**
- New `tests/unit/custom-cup.test.mjs` covers:
  - sizes and your team;
  - everyone drawn once;
  - a winning run gives 3 rounds and the trophy, with Apex unchanged;
  - losing plays it out to a champion;
  - a drawn tie goes to penalties, and the same cup settles identically;
  - the match parameters.
- New `tests/qa/cup.mjs` (in CI):
  - Kick Off moves one team per press on three visits;
  - make and draw a 4-team cup;
  - the cup name renders as text;
  - play the semi (fast-forwarded, 2–0);
  - "Through" shows at full time;
  - back on the bracket in the final;
  - no console errors.

### v117 — polish: the play-session bot fixed, shooting exercised, FPS reported
**The bot's touch bug.** `tests/qa/play-session.mjs` `touch.up(id)` sent
`touchEnd` listing the fingers that *remained*. Probed on a blank page, CDP's
touchEnd releases exactly the points it lists, so:
- each tap lifted the stick and SPRINT (both re-pressed the next loop);
- it never lifted the tapping finger, so the first tap of the session (a
  PASS) stayed down for good;
- every later "tap" on SHOOT arrived as that finger moving: 8–20 shots tried
  per touch session, 0 presses.

The game itself was checked separately: a second finger on SHOOT, alone,
with the stick held, and with SPRINT held too, fires every time. Fix: `up`
sends touchEnd with just the lifted point.

**Shooting exercised.** Three scripted chances per device (at 20/40/60 s the
ball goes to the controlled man 22 m out, defenders within 8 m pushed off);
the bot still carries and shoots with the device's own controls. `chances`
is in the output.

**FPS.** `window.__apexFps()` (new, `play.js`) is the match's own frame
average, stalls excluded. The session has always read it, and it was always
null.

**This session (844×390 touch, 1280×720 keyboard/pad, SwiftShader):**

| Device | FPS | Shots tried | Shots | Notes |
|---|---|---|---|---|
| touch | 5.3 | 3 | 2 | |
| keyboard | 5.1 | 12 | 2 | scored |
| pad | 5.5 | 10 | 1 | |

0 errors on every device. Keyboard and pad tries outnumber shots because at
~5 fps the bot's press can land after the ball is gone. That's the harness,
not the game.

### v116 — the kit online and in the stands (backlog #16/#17)
**Online:**
- The client sends `kit: clubIdentity().kit` with queue, room and join.
- The server stores `peer.kit = guard.cleanKit(m.kit)` in all three join
  handlers and forwards it in the match card's `opp.kit`.
- `cleanKit` accepts only `{home, away}`, each with `shirt/trim/shorts/socks`
  as `#rrggbb` and `pattern` in the six names. Anything else drops that kit
  to `null`, extra fields are stripped, and no text passes between players.
- `online.js` `squadOf(..., kit)` runs it through `kitOf` for both sides.
  Before, the opponent always wore the stock pink "Rival" kit; now it's
  their design, or their badge colours if they sent none.

**Stands (`renderGL.js`):**
- `matchStrips(match)` is now the one module-level decision on who wears
  what (home kit, away kit on a clash, `pickAwayHex` fallback). The players
  and the crowd both read it.
- The home fans take the shirt, plus the trim for a patterned kit (else the
  badge's second colour).
- The away fans take the away side's actual strip. Before it was a separate
  `pickAwayKit` colour that could differ from the players; that function is
  removed.

**Tests:**
- `guard.test.mjs`: `cleanKit` passes a good kit and drops bad colours,
  markup in the pattern, half kits, strings and extra fields.
- `tests/qa/bot.mjs` online flow: the guest designs a hooped yellow kit
  before joining, and the host's `teams[1].kit.home` must match. It passed.

### v115 — the kit designer (backlog #16)
**Before.** A club's kit was the badge's first colour. Shorts ×0.6 and
socks ×0.8 of it, no pattern, no away kit of its own; the other side got a
`pickAwayHex` colour.

**`js/data/kitDesign.js`** (new, precached):
- `KIT_PATTERNS`: plain, stripes, hoops, halves, sash, pinstripe.
- `KIT_SWATCHES`: 16 football colours.
- `kitOf(saved, crestColors)` returns `{ home, away }`, each `{ shirt,
  trim, shorts, socks, pattern }`.
  - Colours are hex-validated and patterns whitelisted.
  - Defaults reproduce the old look exactly: home from `colors[0]`, away
    from `colors[1]`, shorts/socks via `shade(×0.6/×0.8)`.
- `patternMask(pattern, u, v)` is the one definition of each pattern.
- `paintKit(g, strip, size)` draws the patterns on the shirt canvas as
  shapes (a 64-cell raster lost the pinstripe).
- `kitSVG` draws the preview.

**Save and squad:**
- `club.identity.kit` holds only the side(s) the player has touched.
- `clubIdentity()` resolves `kit`, and `ultimateSquad` passes `kit` into the
  match (`makeTeam` → `team.kit`).
- The badge and name editors now save through `identityToSave()`, which
  keeps the raw kit. Otherwise a resolved default kit would have been frozen
  into the save and stopped following later badge-colour changes.

**Club tab → Kit** (`squad.js` `kitView`):
- a Home/Away switch, a live preview, pattern buttons (each previewed in
  your colours), and four swatch rows;
- "Back to the badge's colours" deletes that side;
- swatches are 32 px with a 44 px tap area on touch.

**Renderer:**
- `renderGL` builds `strips[2]`. Home wears `team.kit.home`, or a plain
  badge colour. The away side wears its designed home kit unless it
  `clash()`es (the colour-blind-safe test) with the home shirt, then its
  away kit, then a plain `pickAwayHex`.
- Built figure: `kitTexture(base, no, name, size, strip)` paints the
  pattern under the name and number; the cache key includes pattern and
  trim.
- Model: `recolour()` takes pattern, trim and the shirt mesh's bind-pose
  bounding box. The tint shader normalises `position` to the box (u across,
  v down) and applies the same masks in GLSL. The program cache key is
  `apex-tint-v3-<pattern>`.
- Checked on contact sheets of all six patterns on both figures.

**Tests:** new `tests/unit/kit-design.test.mjs` covers:
- an undesigned kit equals the old look;
- saved kits are cleaned;
- each pattern marks 8–60% of the shirt;
- a match squad's kit reaches `team.kit`.

**Not done:**
- Online matches don't send your kit (the lobby carries name + ids only),
  so the opponent sees your badge colours.
- Career clubs keep their real colours.

### v114 — polish: online cards and advantage, the alerts moved
**Online (`netplay.js`).** The snapshot gains three optional fields:
- `bk`: the bookings count;
- `bl`: the latest booking `{team, name, minute}`;
- `av`: 0/1, whether advantage is being played.

The guest:
- pads `bookings` up to `bk` with `bl`, so the referee's card and the HUD
  card both fire;
- keeps one `advantage` object while `av` is 1, so the referee signals once
  per advantage and the pill shows.

It is backward compatible both ways, and a unit test covers bookings,
the stable advantage object, and no duplicates.

**HUD collisions (found by a 568×320 touch check with both showing).**
- The booking card, top right, covered SKILL on the arc pad.
- The advantage pill, top centre, sat on the player strip.
- Both are now in `.gm-alerts`, a column at `top: 80px; left: 14px` under
  the player strip, with the card at `max-width: min(46vw, 320px)`.
- Re-checked: no overlap with the score bug, the strip, the HUD buttons or
  the pad. The hints (top right) and the feed (bottom) are clear.

**Sweeps:** soak 20/20 with 0 errors; QA bot ok (online 2-client and 2v2);
touch audit 0 problems; UI audit shows only the known owner-decision
variants (two nav styles, the danger button, the menu wordmark).

**Evolution tracks near the 60-match line: measured, left as the owner's
call.**
- RW clinical is slow because RWs score about 0.15–0.18 a match against
  0.28–0.32 for LWs. There are also half as many RW slots in the
  formations (~134 vs ~279 per 120 matches).
- A right-footed left winger cutting inside onto his strong foot scores
  more; that's real (inverted wingers) and not a bug.
- If the owner wants RW clinical faster, the lever is the track's stage-2
  goal count for RW (`js/evolutions.js`), not the sim.
- CAM pace (~52–56) is involvement-driven, and CAMs are rarely involved.

### v113 — the advantage rule (backlog #15), sweep re-baselined deliberately
**Rule (`sim.js`).** This applies only in the tackle-foul branch, the main
foul path. The aggression fouls at ~1052 and ~3075 and the ~1090 shoulder
foul still stop play.

`advantageFor(owner, offender)` is true only when all of these hold:
- the foul is in the fouled side's attacking half;
- `owner.vx·dir ≥ 3.5`, so he is breaking;
- he is ≥ 30 m from goal (inside that, the free kick is the better chance);
- no opponent other than the offender is within 6 m.

When it is true:
- The carrier gets `stumble 0.2` and keeps the ball; the offender gets
  `stumble 1.0`.
- `this.advantage = { team, x, y, offender, t: 2.5 }` is set, and the
  `advantage` cue fires.
- `tackle()` returns at once for that offender while it runs.
- `updateAdvantage(dt)` runs in play:
  - opponents on the ball → `awardFreeKick(team, spot, offender)` and
    `advantageBack++`;
  - t ≤ 0 → it is over.
- `markStoppage` clears it.
- Penalties and bookings are unchanged. The injury roll is kept in the same
  place so the dice order around it doesn't change.
- Counters: `advantages[]` and `advantageBack[]`.
- Switch: `TUNE.advantage` (default true).

**How it was tuned (measured, not by feel):**

| Version | Advantage played (share of fouls) | Called back |
|---|---|---|
| First cut (4 m of space) | 41% | 58% |
| + offender barred from re-tackling | — | — (his re-wins fell from 23 to 6) |
| + breaking pace, 6 m of space, out of shooting range | 25% | 53% |

- The call-backs are mostly other defenders closing within ~1.3 s (median).
  This game presses hard, and the fouled side never loses out because the
  free kick comes back.
- **Goals**, over 240 matches per arm with `TUNE.advantage` off vs on:
  2.15 → 2.05 on one set of dice, 2.03 → 2.18 on another, so neutral. Free
  kicks are about −1 a match and stoppages −0.8.
- Goldens re-recorded (`tests/sweep-check.mjs --update`): seed 12345 goals
  1.90, free kicks 7.82.

**Presentation:**
- The referee sweeps both arms forward for 1.2 s (`celebKind 'refadv'`).
- An "Advantage" pill (`#gmAdv`) shows at top centre while it runs.
- Commentary gains `advantage` lines in English and Arabic plus a co-comm
  pool. The advantage line is exempt from the one-line-a-second limit,
  since it comes right after the foul line.

**Economy audit (`tools/evo-audit.mjs`).** `release.mjs` refused v113 on
the evolution audit: `clinical` as RW, mean 80.8 against the 60 limit. At
60 matches RW gets only ~65 appearances, so the audit is dice-driven near
the line. At 240 matches:
- with advantage, every track passes (RW clinical 51.7, RW goals 0.17);
- the *pre-v113* code **fails** (`pace` as CAM, 56 → over the line).

The default is now **120 matches**; with advantage it passes (RW clinical
58.3, CAM pace 51.6) and takes ~1m46s. **For the owner:** RW-clinical
(48–58 across samples) and CAM-pace (~52–56) sit just under 60 whatever
this release does. They are the next evolution tracks to look at if one
trips.

**Tests:**
- New `tests/unit/advantage.test.mjs` covers: who gets advantage (the five
  conditions); the call-back puts the free kick at the spot for the fouled
  side; it expires after 2.5 s and a stoppage clears it; the offender can't
  re-tackle.
- `setpieces.test.mjs` has the new TUNE default.

### v112 — a referee on the pitch, and the booking card (backlog #15)
**Before.** There was no referee figure at all. Bookings (yellows only,
one per player, at `sim.js` ~1052, ~2516 and ~3040) reached the screen only
as a commentary line. That line is rate-limited to one a second, so a busy
moment could drop it.

**`js/game/referee.js`** (new, precached). It is presentation only: the
renderer moves him from `match.ball`, `match.phase` and
`match.bookings`, and the sim is untouched (the sweep is identical).
- **In play:** 15 m off the ball on the side nearer the middle, at `(±0.62,
  ±0.78)·15`.
- **Dead ball:** 7 m.
- **Goal, kickoff or half-time:** near the centre circle.
- He runs at up to 7.2 m/s and eases in. He is pushed off any player inside
  2 m, clamped to the pitch, and turns towards the ball or the booked man.
- **A new booking:** `card = { t: 2.5, player }`. He stops, turns to the
  player, and sets `celebKind = 'refcard'` (a hidden pose in
  `celebrations.js`: right arm straight up) so both figures raise the arm.

**Renderer:**
- Figures: `buildPlayer` all in black for Low/Med; `makeRig` with a black
  kit (`index 23`) for High/Ultra, created in the model-load callback. The
  built figure is hidden once the models are in.
- The yellow card is a 7.5×10.5 cm plane at the raised hand (`parts.handR`
  / `mixamorigRightHand`) and faces the camera.
- He is hidden in replays and at full time, and absent on the street.

**HUD (`play.js`):** `#gmBooking` sits top right under the HUD buttons. The
card flips in with the name and "TEAM · booked N'" for 3 s; there is no
animation under reduced motion.

**Tests:** new `tests/unit/referee.test.mjs`.
- Over 120 s of AI play he stays on the pitch, his median distance to the
  ball is 6–28 m, and he is inside 1 m of a player less than 8% of samples.
- A booking gives the card, he faces the player and stands still, and it
  clears after 2.5 s.

**Not done (the rest of this #15 item):**
- The *advantage* rule. It is a real rules change (the sim decides whether
  to stop for a foul), so it needs measuring against the sweep.
- A red card or second yellow: the sim books each man at most once.
- Online guests don't get `bookings` in snapshots, so they see no card.

### v111 — polish: the Mixamo root turned about the wrong axes
**Found while building v110.** `playerModel.js` posed the root with Euler
angles in three's default XYZ order: `rotation.x` for the sprint lean and
the foul fall, `rotation.y` for the roulette, `rotation.z` for the heading.
In XYZ, x and y turn about the parent (world) axes, not the player's own.

A headless check on the model in two facings (+x, −y) showed:
- **fouled:** tipped about world X, then `position.z = −0.72`, which is
  under the turf. On High/Ultra a fouled player **vanished** for the fall.
- **sprint lean:** facing −y leaned *backwards*; facing ±x rolled sideways.
- **roulette:** turned about a horizontal world axis, so it tumbled instead
  of spinning.

**Fix:** new `orientRoot(rig, p, turn, pitch)`. The root quaternion is
heading (+ strafe + roulette) about +Z, then `pitch` about the player's own
left-right axis `(−sin, cos, 0)`, pivoting at the boots with no sink.
- `downT` uses pitch `flat·0.92·π/2`: face down, above the grass.
- The sprint uses pitch ≤ 0.14.
- No `root.rotation.*` writes remain.
- Re-checked the same way: fouled face-down in both facings, both sprints
  lean forward, the roulette is upright.

**Online (`netplay.js`):** the snapshot gains optional `ck:
[playerIndex, celebKind]` and `ct: celebT`. The guest sets `celebKind`,
`celebrant` and `celebT`, so the celebration shows and animates. It is
backward compatible both ways. A unit test covers the round trip and an
old-host snapshot. (`downT` and `spinT` still aren't sent, so a guest sees
no fall and no roulette; not changed here.)

**Airplane on Mixamo:** `celebrateRig` adds `C.roll` about the player's
forward axis.

**Sweeps:** unit tests, sweep identical, soak, QA bot; see the report.

### v110 — goal celebrations: 16, and a picker (backlog #15)
**Before.** There was one celebration: everyone on the scoring side hopped
with both arms up (`rig.js` `cheer`), the scorer ran to the corner, and the
Mixamo figure played its `celebrate` clip.

**`js/game/celebrations.js`** (new, precached):
- `CELEBRATIONS`: 16 entries of `{ id, name, blurb }`. The names are our own.
- `pickCelebration(choice, seedId, nth)`: a person's valid choice, or else
  one of three "favourites" from an FNV hash of the scorer's id, rotating by
  the team's goal count. No `Math.random`.
- `celebPose(kind, t, moving)` is renderer-neutral. It returns `{ lift, lean,
  roll, spin, flip, kneel, belly, armL, armR, mouth }`, with each arm as
  `{ raise, fwd, bend }`.
- `armDirs(a)`: unit directions `[forward, outward, up]` for the upper arm
  and forearm.
  - The upper arm is raised sideways, then swung forwards.
  - The elbow folds the forearm towards forward-up-in (`t = [0.6, -0.55,
    0.6]` minus its component along the upper arm).
  - Both renderers use it. Before this helper, hand-to-head poses pointed
    outward.

**Sim:**
- `opts.celebration`, stored as `this.celebration` (default `'random'`).
- In `scoreGoal`, the scorer gets
  `celebKind = pickCelebration(own side ? this.celebration : null, ref.id,
  team.score)`.
- It is cleared with `celebrating` at the restart.
- Movement is unchanged: everyone still runs to `celebSpot`. So stamina,
  positions and the sweep are byte-identical; `Ice Cold` stands still only
  once there.

**`rig.js` (Low/Med):**
- `C = celebPose(...)` for the scorer only.
- `face` adds `C.spin`.
- `lean` adds `TORSO·sin(C.lean)/1.7`, and `shZ` drops by
  `TORSO·(1 − cos)`.
- `bank` adds `roll·TORSO`.
- Kneel lowers the hips by 0.42 and the leg IK squats.
- Lift raises the whole group, boots and all. Raising the hips stretched the
  legs.
- `flip` rotates the group about the hip point across the player's own
  lateral axis.
- `belly` reuses `poseDown` mid-hold.
- Arms go through `armDirs`.

**`playerModel.js` (High/Ultra):**
- `actionFor` puts a scorer with a non-corner kind on `idle` (or `run` while
  moving), and `celebrateRig` poses over it after the mixer.
- The root quaternion is heading + spin, then a pitch about the player's own
  lateral axis. `root.rotation.x` is XYZ order, so it tips about *world* X;
  the existing sprint lean and the `downT` fall do too, which is worth a
  look.
- The position keeps the hip point fixed through a pitch or flip.
- Arm and forearm bones are swung (`setFromUnitVectors` on their +Y) to the
  `armDirs` directions, and their twist is kept.
- `setCelebClock(m.celebT)` is set by `renderGL` before `poseRig`.
- `rig.figure` is now on the rig.

**Settings:** a "Goal celebration" select (Random plus the 16) below Sprint,
with the blurb as the sub-line; `play.js` passes it into the match.

**Tests and tools:**
- New `tests/unit/celebrations.test.mjs`:
  - ids are unique;
  - every pose is finite and in range at 0–4.2 s, moving or not, with unit
    arm directions;
  - picks are deterministic, and 200 scorers use at least 12 kinds;
  - `scoreGoal` gives the person's side its pick and draws exactly as many
    randoms as a match with no pick.
- New `tools/celeb-shots.mjs` writes contact sheets (both figures, 4×4) to
  `tests/tmp/celeb/`. It was used to fix the forearm fold, the spin-jump
  stretch, the double flip lift and chest-height hands.

**Known:**
- An online guest sees the generic cheer for the scorer, because snapshots
  don't carry `celebKind`.
- `roll` (the airplane bank) isn't applied on the Mixamo figure.
- Knee Slide on the Mixamo figure sinks it 0.3 m rather than truly kneeling.

### v109 — set-piece aim guide (backlog #15: penalty and free-kick aiming)
**Finding.** A person's dead ball had no aim feedback at all.
`readSetPieceInput` turned the stick into `sp.aim`, but nothing drew it.
Penalties, free kicks, corners and throws were all aimed blind; only the
charge ring showed power. Keepers (dives, parries, catches), headers,
volleys and bicycles already exist in `sim.js`, so this was the biggest fun
gap in #15.

**Sim (`js/game/sim.js`):**
- `shotSpread(p, d, power, { curl, weak, sloppy })`: the angular-error
  formula lifted out of `shoot()` unchanged (same expression, same order).
  The sweep is byte-identical.
- `setPieceGuide()` returns `null` unless `setPiece.human`. Otherwise it
  returns:
  - `{ kind, action, x, y }`;
  - `dir`, the stick, or straight at goal with no stick;
  - `len`: `9 + 30·charge`, or `6 + 16·charge` for a throw;
  - `goal`, for a penalty or a free kick within 35 m: `{ x, y, spread,
    power }`. `y` is the exact target `shoot()` would use: penalty
    `aim.y·1.4` clamped, free kick `aim.y`, with the same `|ay| > 0.2`
    gate and `GOAL_HALF·0.9`. `spread` is `d·tan(shotSpread)` at the power
    held so far, with penalty power clamped 0.45–1 and the free-kick shot
    counted as curled.
  - For a penalty or a held SHOOT, `shot: true`, and `dir`/`len` run to
    the target.
- It reads no randomness. `placed` kicks skip the weak-foot roll, so the
  guide never calls `weakFoot`.

**Renderer (`js/game/renderGL.js`):**
- The guide is a flat ground arrow (shaft plus tip).
- Colour follows the held button: pass blue, through yellow, cross orange,
  shoot red. With no button it is white; a shot is always red.
- The goal band is a vertical plane on the goal line, `2·spread` wide
  (clipped to the posts, at least 0.5 m).
- The aim line is 0.16 m wide.
- The materials skip tone mapping and fog, since the first cut was nearly
  invisible through post.
- The guide is hidden in replays. It is not drawn by the WebGPU beta
  renderer.

**Tests:** new `tests/unit/setpiece-guide.test.mjs`:
- no guide unless a person is taking it;
- the penalty target follows the stick and stays inside the posts;
- more power or a better finisher narrows the spread;
- a deep free kick gives an arrow only, and the arrow grows with the hold;
- at 22 m a free kick can be a shot;
- a shot's arrow ends on the target.

Checked visually with headless screenshots of a penalty and a 24 m free
kick.

**Not changed:** how set pieces play; no balance knobs. Whether the guide
makes human penalties score more is worth measuring once there's a
scripted-human bot (it's also on the difficulty list).

### v108 — polish: online buttons, QA flakes, small UI fixes
**Online (`js/net/netplay.js`).** The wire mask sent only pass, shoot,
cross, through, switch, curl, sprint and pause. So a guest's LOB (a lob pass,
or the chip with SHOOT), SKILL (held tricks), JOCKEY and PRESS never reached
the host.
- `lob`, `skill`, `jockey` and `press` are appended as bits 8–11.
- It is backward compatible both ways: an old host iterates its own
  8-name list and ignores the extra bits; an old guest never sets them.
- Touch flicks work for a guest now, because they ride on `lob`, `curl` and
  `through`.
- Still not sent: the touch SKILL *swipe* gesture (`setGesture`), which is
  local-only. A guest's swipe does nothing online, but a held SKILL + stick
  does.
- New `tests/unit/netplay-actions.test.mjs`:
  - every `ACTIONS` entry but pause round-trips held, pressed and released;
  - the chip ordering (LOB still held on SHOOT's release) survives;
  - an 8-bit reader still reads the first eight bits the same.
- The QA bot's online 2-client and 2v2 runs pass.

**CI fix for v107.** CI on `00dc196` failed in `tests/qa/touch-editor.mjs`.
The chip flick scored on the CI runner; the goal celebration and replay
stopped `match.t`, and the next flick's frame wait (on `match.t`) timed out.
Four fixes:
- The wait now counts drawn frames (rAF).
- The ball is taken back as soon as each kick registers.
- Each flick starts from open play: the preceding synthetic SHOOT press can
  slide in and concede a free kick, which put the pad in set-piece mode and
  turned the chip into a plain shot.
- Opponents within 15 m are moved off, so nobody wins it back at ~2 fps.

Three consecutive local runs were green. Merged to main as `0dd7da6`.

**Play session bot (`tests/qa/play-session.mjs`).** A bot tap now lasts at
least two drawn frames (`window.__apexFrames`). At SwiftShader's ~2 fps a
260 ms press fell between polls: "4 shots tried, 0 taken" was the bot, not
the game (checked: an 800 ms pad hold shoots).

The touch run stalling at 3' on a free kick is the machine's speed, not a
regression:
- a manual touch free kick works;
- v106 and v107 both measure ~2 fps at 844×390 on this container.

**UI audit fixes:**
- `.setting-row span` (12 px, the grey description style) also caught the
  row's `.tag`, so the version tag read 12 px against 11 everywhere else. It
  is now `.setting-row div > span`.
- The builder's `#bldLoad` sat beside a 40 px input as a stretched `.sm`
  button (the only 40 px `.sm`). It is now a plain `.btn.ghost`.

**Sweeps this release:** soak 20/20, 0 errors; QA bot ok; UI audit (the
remaining single-screen variants are the owner-decision nav styles and the
danger Reset); layout and a11y scans (see the verification line in the
report).

### v107 — touch redesign, part 3: flicks, and the chip fixed (backlog #20)
**The bug.** In `sim.js` `handleSeat`, `input.pressed('lob')` fired a lob
pass even while SHOOT was held. The documented chip (SHOOT held + LOB, let
go) therefore never happened: the ball left as a lofted pass the moment LOB
went down. This was true on keyboard, pad and touch alike.
- Fix: the lob pass needs `!input.held('shoot')`.
- The CPU never goes through `handleSeat`, so the sweep is identical.
- New `tests/unit/touch-flick.test.mjs` covers:
  - chip = shot with `chip:true` and no pass;
  - finesse = shot with `curl`;
  - LOB alone is still a lob pass;
  - THROUGH or LOB during a PASS hold gives a through or lob pass.

**Flicks (`play.js`, the touch buttons):**
- On SHOOT or PASS, in open play with the ball (`attacking === true`, and
  the slot bound to its own action), a finger that travels 30 px becomes a
  flick. The sim sees nothing new: a flick holds the same modifier a
  keyboard would.
  - SHOOT up (`-dy > 0.8·|dx|`) holds LOB, giving a chip.
  - SHOOT sideways holds CURL, giving a finesse shot.
  - SHOOT down does nothing.
  - PASS up holds LOB, giving a lofted pass (it fires immediately).
  - PASS any other way holds THROUGH, giving a through ball (it fires
    immediately).
- The modifier is released two animation frames after the button, so the
  sim reads it on the shot's release.
- `data-flick` shows a badge over the button (CHIP, FINESSE, LOFTED or
  THROUGH), with a 12 ms buzz if vibration is on.
- A hint (touch wording) and a loading tip teach it. The keyboard/pad hint
  now mentions the chip.
- Online guests: `net/netplay.js` does not carry `lob`, so a guest's chip
  (any device) still doesn't reach the host. Curl and through do. Adding
  `lob` to its ACTIONS mask is a protocol change; not done here.

**QA:** `tests/qa/touch-editor.mjs` (in CI) now also flicks with CDP touch
in the live match. It waits on sim frames, not wall-clock, since SwiftShader
is slow, and counts only the human's kicks.
- SHOOT up → chip, with the CHIP badge.
- Sideways → finesse.
- PASS flick → through.
- PASS tap → pass.

**Next:** #20 is done apart from polish. Due next is a polish/bug-fix
release (v108): features v105–v107 have shipped since the last one.

### v106 — touch redesign, part 2: the layout editor (backlog #20)
**`js/components/touchLayout.js`:**
- `arcLayout(W, H, { user, pin })` takes `settings.touchLayout = { scale,
  offsets: { slot: { dx, dy } } }`.
  - `scale` is clamped to 0.8–1.3 and multiplies B before the rings are
    worked out, so the arc widens with the buttons.
  - Offsets are in units of B, screen-wise (dx right, dy down), measured
    from the arc's position for that scale. A layout made on an SE lands in
    the same relative place on a tablet.
- With no layout, or a default one (`isCustom` false), the output is the
  plain v105 arc, byte for byte. The touch audit is unchanged.
- `fitLayout(L, W, H, { pin })` keeps every button:
  - on screen (4 px margin);
  - right of the stick zone (46% of W);
  - under the HUD row (56 px);
  - at least 10 px from its neighbours.

  It pushes overlapping pairs apart along the centre line (the `pin`ned
  button does not move), clamps, and repeats (≤ 300 passes).
- `offsetsFrom(layout, W, H, scale)` is the inverse: positions on screen
  back to offsets.
- `applyTouchLayout(pad, W, H, user, pin)` now returns the layout.

**`js/components/touchEditor.js`** (new, precached):
- `openTouchEditor(current)` resolves to the new layout, `null` (plain
  arc) or `undefined` (cancelled).
- It is a full-screen overlay: a stand-in pitch, the stick half shaded, a
  bar in the HUD row (Size slider, Reset, Cancel, Done) and the real
  `.tbtn` classes.
- A pointer drag moves one button with `pin`, so the others make way. On
  release (and on a slider change or arrow-key nudge) the on-screen layout
  is written back as offsets for every button, so what you let go of is
  what gets saved.
- Transitions are off in the editor. The `.is-down` scale transition could
  stick mid-way and skew sizes.

**Wiring:**
- Settings → Accessibility has a "Touch buttons" row with a Customise
  button, below the one-handed rows.
- `play.js` passes `getState().settings.touchLayout` to `applyTouchLayout`.
  One-handed mode still clears it.

**Tests:**
- Unit (`tests/unit/touch-layout.test.mjs`):
  - a default layout equals the arc;
  - at 3 screens × 2 scales × {all on one spot, all flung off screen,
    scattered}, every button is on screen, clear of the stick and HUD,
    ≥ 48 px and ≥ 9 px apart;
  - `offsetsFrom` round-trips;
  - the pinned button holds.
- New `tests/qa/touch-editor.mjs` (in CI), on 844×390 touch with CDP
  finger events:
  - SHOOT follows a 120 px drag;
  - 120% scales the buttons;
  - Done saves;
  - in a match every button is within 0 px of where the editor left it and
    the buttons are ≥ 10 px apart;
  - SHOOT answers a press;
  - Reset + Done clears the setting;
  - there are no console errors.

**Next on #20:** gestures, e.g. swipe on SHOOT to aim or chip, swipe on
PASS for a through ball.

### v105 — touch redesign, part 1: the arc pad (backlog #20)
New `tools/touch-audit.mjs` (in CI, exits 1 on a problem). It runs a live
match at 568×320, 667×375, 844×390 and 932×430 (touch, DPR 1) and measures
every visible `.tbtn` and HUD button:
- size (under 44 px, and under 48);
- the gap to the nearest neighbour, as circle-to-circle for the round pad;
- overlap with the score bug, player strip, tips, feed, `.bc-strap` and
  `.bc-sub`;
- reach from the right thumb's rest, in **mm** (0.17 mm per CSS px; a
  comfortable reach is ≤ 45 mm).

Screenshots go to `tests/tmp/touch/`.

*Metric note.* The first cut used square gaps (diagonal round neighbours
read as touching) and a 170 px reach bar (≈ 29 mm). That flagged the old
SKILL/LOB as out of reach and missed the new layout's real overlap. With
mm, the old worst was SKILL at 43 mm: at the edge, not beyond.

**Before:**
- One fixed grid on every phone: 72 px buttons, SPRINT 90, SKILL/LOB 50.
  On a 568×320 SE the pad took about half the width.
- HUD icon buttons were 32×32.
- The broadcast name strap sat over CROSS and LOB on an SE.

**`js/components/touchLayout.js`** (new, precached):
- `arcLayout(W, H)` sizes buttons by height: B = clamp(56, 0.19H, 84);
  SPRINT = 1.22B at the corner; SKILL/LOB = max(48, 0.7B).
- Placement is around the thumb rest (the SPRINT centre):
  - PASS, THROUGH and SHOOT at 4°, 47° and 90° on R1 = max(clear of
    SPRINT, (B + 10)/(2·sin 21.5°)) + 1, so 43° neighbours keep 10 px;
  - CROSS, LOB and SKILL at 8°, 40° and 68° on R2 = R1 + B/2 + max(B, s)/2
    + 10.
- `applyTouchLayout` writes inline right/bottom/size (and `--tb-font`) and
  adds `.tpad.arc`. play.js calls it on mount and on resize.
- `clearTouchLayout` is used when `one-hand` is on; that layout keeps its
  CSS grid.

**After:** 0 problems at all four sizes. Every button is ≥ 48 px, gaps are
≥ 10 px, and the furthest button is 38 mm from the thumb (Pro Max).
`tests/unit/touch-layout.test.mjs` holds this at five sizes, including a
1180×820 tablet.

**Also:**
- HUD `.icon-btn.sm` gets an `::after` with inset −6 px on coarse pointers,
  a 44 px hit area.
- On touch (`#gmRoot:has(#gmTouch:not([hidden]))`), the strap moves to
  top: 88 px (below the player strip) and the subtitles to 136 px.
- Vibration:
  - `rumbleCue` now treats a missing `settings.rumble` as on. It returned
    unless the value was truthy, so older saves never rumbled although
    Settings showed the switch on.
  - Phones buzz `min(60, 0.4 × pad ms)` on the same cues where
    `navigator.vibrate` exists (Android; iOS web has no Vibration API).
  - The button tick (8 ms) respects the switch, and the Settings copy says
    so.

Unit tests 213/213; sweep identical; layout, a11y and play session clean.

**Next for #20:** a layout editor (drag, size, reset, stored in settings),
and gestures beyond the SKILL swipe (e.g. swipe-to-shoot power and
direction on SHOOT).

### v104 — fix: v103 starved the strikers (CI caught it through the evolution audit)
**What happened.** v103's CI failed on main at "every evolution track can be
finished". The audit's per-position table showed why: ST goals per match
(Competitive, 180 s) fell 0.49 → 0.15, and CM assists 0.14 → 0.07. The new
`openness()` term in `pass()` penalised a lane-cut, marked receiver, and a
centre-forward is nearly always both, so the ball stopped going to him. Two
tracks went over 60 matches (clinical as ST: 62; engine as CDM: 94). The
release script did not run the economy audits, so this was not seen before
the merge.

**Fix in `pass()`:**
- A through ball is scored by the room ≤ 6 m around the spot 8 m ahead of
  the runner: `(room − 3) × 0.2 × weight`. It no longer counts the lane to
  his feet or his marker, since it is played into space.
- In the final third (receiver within 36 m × scale of goal), openness counts
  at 0.35 × (`risk`).

**After:**

| Measure | Value |
|---|---|
| ST goals / match | 0.29 (noisy: ~45 ST samples in 60 matches) |
| Sweep, goals / shots (12345) | 2.07 / 13.97 |
| Sweep, goals / shots (777) | 1.95 / 14.93 |
| Pass completion | 58.8% (v103 before this: 62.1%; pre-v103: 57.6%) |

Completion fell back because risk in the final third is realistic.
Supporters still raise the short options (0.73 → 0.88 per moment) and cut
the nobody-open moments (19.9% → 18.5%). The sweep was re-baselined
deliberately again.

**Engine Room without CDM.** CDM assists are 0.03–0.04 a match, so "2
assists" took ~70 matches (58 before v103, already borderline). `engine`
now fits CM/CAM/LM/RM. A CDM mid-track keeps it; `startEvolution` checks
`fits` only at the start.

**So it can't recur:** `npm run test:economy` (the SBC and evolution audits)
is a new script, and `tools/release.mjs` runs it after the sweep.

Unit tests 208/208; SBC audit 0.40×; evolution audit ✓; play session clean
on all three devices.

### v103 — team-mate support play (backlog #21)
**Measured first.** New `tools/support-audit.mjs` plays seeded AI matches
(the sweep's fixtures, Authentic, 240 s) and samples 4×/s during possession.
- A team-mate counts as *open* when he is 6–28 m from the carrier, no
  opponent is within 2.2 m of the lane, and none is within 3 m of him.
- Passes are followed to where they end, via a `pass` wrapper and the next
  owner.

Baseline, 40 matches, seed 12345:

| Measure | Value |
|---|---|
| Open options per moment | 2.09 (≤16 m: 0.73) |
| Moments with nobody open | 19.9% |
| Nearest team-mate | 10.8 m |
| Passes completed | 57.6% (real ~80%) |

**Two causes, two fixes.**
1. `this.supporters` (the two nearest team-mates, picked every frame since
   v69) was never used. `think` now sends them to `supportSpot(p, carrier,
   home, otherSupporter)`, re-chosen every 0.35 s or when the carrier
   changes.
   - Candidates: 9 angles (−150° to 150° from the attacking direction) × 3
     radii (9, 13, 17 m × scale), forward ones onside.
   - Score: lane (≤5) + 0.55 × room (≤8) + 1.4 × forwardness − 0.22 × stray
     (beyond 10 m from his shape slot) − 0.07 × travel − 3 if within 7 m of
     the other supporter.
   - Priority: after the counter, overlap, third-man and run branches;
     before the FWD/DEF shape moves.
   - Gated by `TUNE.support`.
2. `pass()` picked the receiver by angle, distance, forwardness and width,
   never by openness. Now: + `openness(t)` = ((min(lane, 4) − 2) × 0.35 +
   (min(mark, 5) − 2.5) × 0.15) × weight.
   - Weight: CPU = `decisionQuality`; a person's assist 1 = 0.6, assist 2
     = 1; manual (0) = 0.
   - This also makes pass assist 2 do what its v87 comment always claimed
     ("the best open man").

**After** (40 matches, seed 12345): open options 2.18 (short 0.87), nobody
open 18.7%, nearest mate 9.3 m, completion **62.1%**, possession 2.9 → 3.1 s.
Seed 777 is similar (59.9%).

**Sweep re-baselined deliberately:**

| Seed | Goals | Shots |
|---|---|---|
| 12345 | 2.22 → 1.98 | 14.17 → 14.58 |
| 777 | 1.92 → 1.88 | 14.73 → 13.75 |

Careful passing means fewer scrappy chances. `shotRate` 0.75 and 0.8 were
tried: more shots, no more goals (1.83–1.90), so it stays at 0.7. Goals
within ±0.2 of the 2.0 floor are sampling noise at 60 matches.

**Still ~18 points short of real completion.** At skill 1.0, 16% of CPU
passes are deliberately random (v79's decision-quality lever, `Math.random()
> q`), and that stays. The rest is pass physics and interceptions: next
levers if needed.

**Found by the unit tests:** in the practice arena, a goal brought all ten
parked opponents back onto the pitch for the celebration and walk-back. The
dead-ball phases return early from `update`, before the end-of-frame
`repark`. `update` is now a wrapper that calls `step` and then reparks.
Parked men are also excluded from supporters.

**Tests:** `tests/unit/support.test.mjs` covers three things:
- the open man gets it 18/20 times;
- manual assist still goes where aimed;
- a supporter picks a spot with a lane over 2.2 m clear.

The watch bundle was rebuilt (it contains sim.js). Unit tests 208/208; the
QA bot and play session are clean.

### v102 — feel: players step instead of skating (backlog #19, part 1)
**Measured problem.** New `tools/gait-audit.mjs` poses the built-in rig frame
by frame and tracks a foot while it is on the grass (boot z < 0.09). That
foot moved at 0.99–1.06× the body's speed in jog, sprint, backpedal and
sideways jockey. The legs were a rhythm played along the *facing* at
`phase += speed × 2.4`, with no relation to the ground.

**The stepper** (`rig.js`, the `leg()` inside `posePlayer`). Each foot is
either *planted*, pinned where it landed, or *swinging* on a smoothstep arc
from its last plant to a predicted one. The prediction is home plus velocity
× (time to the next mid-stance), so a backpedal steps backwards and a jockey
steps sideways with no special case. Thigh and shin come from two-bone IK
(hip → ankle, knee bent forward).
- **Timing:**
  - Cadence: `strideRate(sp) = 2π·0.77·sp^0.478`, fitted to real running
    (1.3 cycles/s at 3 m/s, 2.2 at 9 m/s).
  - Duty: `0.7 × cadence / sp`, clamped 0.15–0.6. That is ~0.3 at a jog and
    ~0.18 at a sprint, as in real running.
  - Touch-down: the foot lands with 40% of the stance ahead.
- **Posture:** hip drops 0.07 × gait (soft knees). Without it, a leg of the
  rig's length reaches only ±0.24 m along the ground, and planted feet
  hung in the air.
- **Rules learned the hard way** (each was a visible bug on the way):
  - Overreach on a *planted* foot lifts the heel (toe-off) and keeps the
    spot. A *swinging* foot out of reach stretches toward its target;
    forcing it to the reach sphere's bottom made 0.4 m drops.
  - A swing starts from the ankle's real height (`f.fromZ`), not from
    standing height.
  - A plant more than 2.5 m from home (a kick-off reset, a replay seek) is
    dropped outright.
  - Standing still (under 0.35 m/s): feet settle under the hips in 5 cm
    steps.
- **Also:**
  - `gaitOf(p)` gives movement in the player's frame (mf, ml) and `dir`
    (−1 on a backpedal).
  - `updateBank(p, dt)` smooths the lateral acceleration into `p._bank`,
    which shifts the shoulders, head and arms into a turn.
  - Arm pump grows with speed.
  - Lean is × mf: forward only when running forward, slightly back on a
    backpedal.

**Numbers** (`tools/gait-audit.mjs`, and `tests/unit/gait.test.mjs` holds
them):

| Move | Foot speed on grass (× body), before | After | Worst one-frame jump, after (old rig) |
|---|---|---|---|
| Jog | 1.00 | 0.08 | 0.07 m (0.06) |
| Sprint | 1.06 | 0.19 | 0.11 m (0.34) |
| Backpedal | 1.00 | 0.07 | 0.07 m (0.06) |
| Jockey | 1.06 | 0.05 | 0.06 m (0.02) |

What remains is swing feet skimming at touch-down and lift-off. The test
bars are slip < 0.3 and jumps < 0.15 m across all five moves (the four
above plus a hard turn).

**Mixamo models (High/Ultra).** They have only a forward run clip.
`poseRig` now plays it at `timeScale × dir` (reversed on a backpedal) and
turns the root 60% of `atan2(ml, |mf|)` toward a sideways move. No foot
plant: the clip owns the legs.

**Clips.** `tools/gait-clips.mjs` records `before.webm` and `after.webm` (git
HEAD's rig vs the working tree) of one figure going jog → sprint → hard turn
→ backpedal → jockey, plus still strips, into `tests/tmp/gait/`.

The sweep is identical (render-only change). The play session was clean on
all three devices.

**Still open for #19:** proper turn animations on the models (they have no
turn clips); a plant-and-cut on hard direction changes (the sim turns in
~0.15 s, and the stepper follows but has no dedicated "cut" step).

### v101 — R15 visual consistency audit
New `tools/ui-audit.mjs` (kept). It visits all 15 screens at 1280 px. For each
component kind it records every visible instance's computed style: primary,
ghost, small and big buttons, screen titles, panel headings, panels, text
inputs, selects, tabs and tags. Variants are listed with the screens they
appear on; variants on only one or two screens are marked. The report goes to
`tests/tmp/ui-audit.md`.

**Before:** 11 one-off variants.
- *Consistent:* buttons, panels, panel headings and screen titles.
- *Deliberate, kept:*
  - the danger ghost button (Settings, Reset);
  - the menu wordmark (86 px);
  - the version tag in Settings (12 px vs 11 px).
- *Drift, fixed:*
  - Text inputs came in 3 styles: 12/13.3/16 px, radius 8/9/11, height
    34–39, three backgrounds.
  - Selects came in 4 styles: 12/13/14/16 px, radius 8/9/10/12, height 31–40.
  - The fix is one rule at the end of `main.css`: 16 px, 40 px tall,
    radius 12 (the buttons'), `--line` border and the field background, with
    an accent focus ring.
  - 16 px is required, not taste: since v100 the page is zoomable, and iOS
    Safari zooms into any field under 16 px on focus.
  - After the fix, inputs and selects each have 1 variant.
- *Not changed, for the owner:* the in-screen navigation has two styles for
  one role. `.subtab` (Squad → Store) is uppercase with 2 px tracking and
  weight 800. `.cnav-b` (Skills, Street, Career, Pro) is sentence case,
  weight 600. The bottom `.tabs` is a separate, deliberate tier. Unifying the
  first two would change four screens' look, so it is left as a design call.

**Found while checking the audit on phones.** The Stadium Builder's time
switch (`.bld-time`, absolute) sat on the screen title on every phone. The
≤760 px rule made `.bld-view` `position: static`, so the switch anchored to
the page. It is now `relative`. `tests/visual/layout-scan.mjs` has a new
check, "a control sitting on a screen's title". It fails on the old CSS for
all three phones and passes now.

Layout, a11y, pad-reach and unit tests (198/198) OK.

### v100 — R15 final hardening: console errors, Lighthouse, server security review
**Zero console errors, now enforced.** New `tests/lib/console.mjs`:
- `watchConsole` counts uncaught exceptions, `console.error`, and any 4xx/5xx
  from our own origin. It allows only software-GPU WebGL noise and the
  browser's automatic favicon.ico guess.
- `watchResponses` is the response half, for scripts that keep their own
  console filter.

The old per-script filters hid "Failed to load resource" and net::ERR, which
is exactly how a 404 would have gone unseen.

Wired into:
- `watchConsole`: pad-reach, a11y-scan, layout-scan (these caught only
  exceptions before);
- `watchResponses`: bot (every flow, online and party included), smoke, soak.

Result: 0 console errors and 0 failed requests across pad-reach, a11y,
layout, smoke, bot, offline and a 10-match soak.

**Lighthouse 13** (mobile, simulated 4× CPU, run locally; not in CI because
performance under simulated throttling is too noisy for a gate):

| Page | Measure | Before | After |
|---|---|---|---|
| Game (`/`) | Performance | 47 | 77 |
| Game (`/`) | Accessibility | 92 | 100 |
| Game (`/`) | Best practices | 100 | 100 |
| Game (`/`) | SEO | 100 | 100 |
| Game (`/`) | Total blocking time | 4,950 ms | 300 ms |
| Game (`/`) | Time to interactive | 12.7 s | 4.1 s |
| `landing.html` | All four categories | — | 100 |

- *Performance.* Almost all of it was painting the splash canvas, not script:
  `splash.js` was 9.4 s total, of which 0.15 s was scripting. Three
  full-viewport radial gradients plus 70 motes were drawn at up to 2× DPR on
  every display frame. It is now drawn at 0.5× resolution and capped at
  ~30 fps, with drift speed kept, and looks the same (checked against a
  capture).
- *Remaining cost.* A 709 ms long task in `app.js` (world generation at boot)
  and a 3.1 s first paint are the next things to look at.
- *Accessibility.* The only failure was `meta-viewport`
  (`user-scalable=no, maximum-scale=1`). Pinch-zoom is now allowed in menus:
  - `html` has `touch-action: manipulation`, so double-tap zoom stays off;
  - `.gm` (a match) is `touch-action: none`;
  - Safari's `gesturestart` is prevented only while `body.in-game`.
- *PWA.* Lighthouse 12+ has no PWA category. Installability is covered by
  `tests/unit/pwa.test.mjs` (v95) and `tests/qa/offline.mjs`.

**Server security review.** Findings are ordered by severity; each is fixed
and held by the new `tests/unit/server-exposure.test.mjs`.
1. **Remote crash with one request.** `decodeURIComponent` on the raw path
   threw on a malformed escape (`GET /%E0%A4%A`) outside any handler, killing
   the process and every live match on it. Now it answers 400.
2. **The repository was served.** The static server served everything under
   the repo root except `server/data`: `/.git/config` returned 200, meaning
   the whole history, plus the server source, tests, tools, HANDOFF, README
   and package.json. Now there is an allowlist:
   - top-level pages: index, notes, watch, landing, maintenance,
     model-preview, manifest, sw.js, events.json, LICENSE;
   - the directories `js/ styles/ assets/ icons/`;
   - no dot-segments anywhere.

   Anything else is a 404, not a 403, so probes learn nothing. The sw.js
   precache list is entirely inside the allowlist.
3. **Path containment.** `startsWith(ROOT)` accepted a sibling directory with
   the same prefix; it now requires `ROOT + path.sep`.
4. **Rate limits bypassable.** `clientIP` took the *first* X-Forwarded-For
   entry, which the client writes, so every request could claim a new
   address and walk through the per-address sign-in and API limits. Now it
   takes the *last* entry (the one the single proxy appends), and only when
   `TRUST_PROXY=1`; otherwise it uses the socket address. `render.yaml` sets
   `TRUST_PROXY: "1"` and the README documents it. The test harness sets it
   too, because the fuzz and QA tests stand in for many players via XFF.

Checked and fine:
- the WebSocket upgrade has no Origin check, but auth is a token *in a
  message*, never a cookie, so a foreign page cannot act as a signed-in
  player;
- `accountByName` is used only inside the pairing claim, not exposed as an
  endpoint;
- CSP (hashed inline scripts), `nosniff`, `frame-ancestors 'none'`, body
  limits, scrypt and the failure-only login throttles are as v87 left them.

**Owner note.** A GitHub Pages deployment exists ("pages build and
deployment" runs on main). Pages serves the repo as static files, so the
allowlist above does not apply there: HANDOFF, tests and the server source
are public on Pages. `server/data` is gitignored, so no secrets are exposed,
but if the repo is private, that is worth knowing.

### v99 — difficulty above 1.0 buys shot selection, not volume
In `sim.js`, the AI shooting branch (the carrier `think`, "toGoal < 31")
works like this:
- **Skill ≤ 1.0:** unchanged. The shot rate is × skill, as before. The sweep
  runs at 1.0 and is byte-identical.
- **Skill above 1.0:** `over = clamp(skill − 1, 0, 0.9)` changes three things.
  - Rate multiplier: 1 + over × (1.2 in the box (< 16 m) / 0.2 at 16–22 m /
    −0.7 beyond), floored at 0.25.
  - With probability `over`, it aims for the post the keeper is not covering.
  - Spread tightens by `sloppy: −0.45 × over`.

`tools/difficulty-audit.mjs` now has `--levels` plus xG and on-target columns.
Measured against a stand-in AI held at 1.0, 80 matches per level, same dice;
the old code was measured in a clean worktree of main:

| Skill 1.9 | Before | After |
|---|---|---|
| CPU xG / match (1.0: 0.49) | 0.51 | 0.54 |
| CPU on target (1.0: 2.7) | 2.7 | 3.0 |
| CPU goals (1.0: 0.80) | 0.80 | 0.88 |
| CPU shots (1.0: 5.7) | 6.8 | 5.5 |

W/D/L at 80 matches is within noise, about ±0.15 points a match; one pair of
identical-settings levels differed by 0.3. Judge this lever by xG and on
target, not results.

The effect is real but small, because shot choice is a small part of chance
creation. The bigger levers for a follow-up, all gated on over > 0 so the
sweep holds:
- build-up decision quality: `decisionQuality` already clamps at 0.99 from
  1.83;
- off-ball runs;
- CPU defending: pressing and tackle success, not tackle rate.

Against a person, defending is probably most of what "hard" feels like, and a
stand-in AI cannot measure it. Needs a scripted-human bot, or real play.

### v98 — R15 balance audit, part 2b: evolutions, career money scale, the difficulty curve
Four new tools in `tools/`, all kept; the first two run in CI (see below).

**`evo-audit.mjs`: evolutions.** 60 seeded AI matches (Competitive, 180 s)
record per-position goals, assists, win and clean-sheet rates. Each track is
then played 4,000 times, for every position its own `fits` accepts.

*Before:* 13 track/position pairs needed more than 60 matches, and several
effectively never finished (500-match cap):
- pace (goals stage) as CB, LB, RB, CDM, CM, RM, CAM;
- clinical as CAM;
- rising ("involve" stage) as GK, CB, LB, RB, CDM.

*Fix:*
- `pace` accepts ST/LW/RW/LM/RM/CAM only, and its stage 2 is now involve 3.
- `clinical` accepts ST/LW/RW only.
- `rising` stage 2 is now wins 3.

*After:* every pair finishes in 15–58 matches (worst: engine as CDM, 58).
Rising is 22–25 matches for +6 at every position. Rates are AI rates; a
person's chosen card is more involved, so real numbers are lower.

*Stacking* is bounded by the tracks' own caps. The best chain is a
19-year-old CDM going 70 → 85, or 90 with the five paid levels. The paid
levels cost ◈11.6k (a 65) to ◈36.3k (a 90) for all five. No change there.

The tool exits 1 if any pair needs more than 60 matches.

**`career-audit.mjs`: career money.** Four careers (top, middle and bottom of
a first tier, plus a second-tier club) run 5 seasons untouched. The
manager's own matches get a simulated score, so home gates are paid.
- *Found:* `valueIn` priced world cards by `card.value`. That is the Ultimate
  XI coin price (`marketValue`, an 83 ≈ 2m), not a career fee
  (`valueOfRating`, an 83 ≈ 15m). Clubs of world cards were about 7× cheaper
  in wages and fees; Newcastle's wage bill was 1.7m a season against City's
  31m.
- *Fix:* the career values everyone with `valueOfRating`. Best players now
  cost 42–60m at every audited club, and wage bills are 7–25m a season.
- *Kept for the owner, as numbers:* clubs are still rich.

  | Measure | Value |
  |---|---|
  | Income, doing nothing | ~90–140m a season |
  | Wages as share of income | ~15–25% (real clubs ~55–70%) |
  | Surplus a season | +35m to +100m (0.6–1.7 best players) |
  | `START_COINS` | 500m (~10 best players) |

  Tightening it means cutting TV and merch, or starting budgets, and the
  builder, facilities and scout prices would all need to follow. That is a
  design call, not a bug. The audit's bars pass: no club goes broke, and none
  banks more than 3 best players a season.

**`difficulty-audit.mjs`: the AI curve.** The CPU is set to every skill the
game uses (Kick Off 0.7/1/1.35, Clash 0.8–1.55, UXI 0.8–1.9). It plays a
stand-in, the same AI held at 1.0. Each fixture is played from both ends,
30 matches per level. Findings:
- Below 1.0 the lever works: at 0.7 the CPU loses 40% of matches.
- Above 1.0 results are flat within noise. CPU goals stay around 0.6–0.8 a
  match from 1.0 up to 1.9. Higher skill only raises the shot count
  (5.9 → 7.3) from poorer positions, since `aiSkillFor` multiplies the shot
  and tackle rates.
- `decisionQuality` clamps at 0.99 from skill 1.83, so Division 1 and Apex
  Elite differ only in shot and tackle rates.
- Next, a match-engine change: skill above 1 should buy shot selection and
  finishing, not shot volume. Measure it with this tool at `--per 80` or more,
  and keep skill 1.0 untouched so the sweep stays identical.

**`sbc-audit.mjs` and `evo-audit.mjs` are CI steps.** The timeout was raised
to 55 min after the v97 run was cancelled at 40.

**Play session (v97):** clean on all three devices, 0 errors. The touch run
ended at a free kick with the countdown running. That is not a bug: the bot
does not take set pieces, and it is taken automatically at zero.

Unit tests 195/195; sweep identical; QA bot career and pro seasons OK.

### v97 — R15 balance audit, part 2a: repeatable SBCs were a money loop
New `tools/sbc-audit.mjs` (kept). It plays every repeatable SBC with the real
`CHALLENGES`, `evaluate`, `openPack` and `dupValue`:
1. Start from 10 silver packs of cards (◈20,000 at shop price).
2. Submit the cheapest cards that meet the brief, as often as possible.
3. Open whatever the reward pack gives, feed it back in, and repeat until dry.

The loop runs two ways: all repeatables together, and each one alone, because
a farmer picks whichever pays best. The bar: a pile worked through the
repeatables must pay back less than its packs cost (< 1×). The tool exits 1
if any plan fails.

**Before.** Seven quick SBCs (first-steps, bronze-trio, two-keepers,
silver-lining, young-blood, defenders-three, front-two) paid a pack with at
least as many cards as they took. First Steps took 3 cards for a 4-card
bronze pack plus ◈300. Together they paid **◈690k–760k from ◈20k of packs
(~35×)**. They only stopped when the player pool ran out and every pull was a
duplicate. Also, `onSbc` adds season-pass XP each time.

**First fix.** Pack removed from those seven. All-together dropped to 0.60×,
but single-challenge plans still broke the bar:

| Plan | Payback |
|---|---|
| five-a-side (5 in, 4 back) | 1.26× |
| two-nations | 1.35× |
| seven-up (7 in, a 5-card gold back) | 1.12× |

**Rule adopted.** Every quick repeatable (the starter group) pays Apex only,
with the Apex amounts unchanged. The two eleven-card sinks (`starter`,
`bronzes`) keep their packs. New `tests/unit/sbc-sink.test.mjs` holds it: a
repeatable that pays a pack must take at least 6 more cards than the pack
holds, and no repeatable pays a card.

**After.** Worst plan 0.40× (seven-up alone), all together 0.36×. Quick-selling
the same pile pays 0.06×, so SBCs still pay 2–6× what selling would. One-off
SBCs (first-gold, the eleven-card and legend ones) are untouched. The
completion toast no longer prints "undefined pack".

**Also in this release:**
- The v96 play-session finding: the harness pressed START with a mouse click
  on the phone run, so the game rightly assumed a keyboard. The harness now
  taps.
- The touch version of the skill tip was "SKILL (hold SKILL)"; it now says to
  swipe the SKILL button.
- `.gm-hints` has its own line-height, so three-line tips no longer spill
  over the border.

**Still to do in part 2:** evolutions, the AI difficulty curve, and career
finances.

**Watch.** One local `npm run test:unit` run had 1 failure (194/195). Four
reruns were clean, so the flaky test is not identified yet. If it shows up in
CI, the log names it.

### v96 — R15 launch assets, part 2: store shots and landing page, plus three fixes
**Play-session finding (v95 session, 844×390 touch):** `.gm-setpiece` covered
the rotating hint. `.gm-setpiece:not([hidden]) ~ .gm-hints` now hides the hint
while a set piece is up; the banner carries its own controls.

**Found in the store shots:**
- **Clipped wordmark.** The italic XI on the title and menu wordmarks lost the
  top of its I. With `background-clip: text`, the gradient only paints inside
  the span's box, and the italic leans past it. The fix is
  `padding-right: .16em; margin-right: -.16em` on both `.t2` rules.
- **Loose checkbox.** `.cs-form label { display: grid }` outranked
  `.cs-check`. The Facial hair box sat alone mid-form with its label on the
  line below, on the Street, Career and Pro creation forms. The fix is
  `.cs-form .cs-check` plus a sized checkbox.

**Store shots.** New `tools/store-shots.mjs` (kept). It captures real frames
at 1920×1080 into `assets/store/`:
- title, menu, a night match (broadcast camera), a staged goal celebration,
  Street create, and the Grounds showcase;
- match shots hide every DOM overlay except the scorebug.

Store images must show no player names: cards and the in-match HUD carry real
footballers' names, the owner's in-game call. That is why there is no
pack-reveal shot; the first attempt showed a real player's card. The match
shots wait on sim state, not the clock. Software GL draws 1080p at a frame
every few seconds; the two match shots took about 9 minutes.

**Landing page.** `landing.html` at the root:
- one file, inline CSS, nothing from another origin;
- not precached, since it is for people who have not installed the game;
- its claims were checked against the code, correcting two: eleven divisions,
  not ten, and the real skill games;
- no real names; the footer keeps the fiction note and points to
  Settings → Credits;
- new `tests/unit/landing.test.mjs` checks that every local file exists,
  nothing is loaded off-site, and screenshots have real alt text;
- checked at 1280 and 390 wide: no horizontal scroll, no failed requests.

Unit tests 193/193, sweep identical, layout and a11y scans OK.

**Still to do in R15:**
- balance audit part 2 (SBCs, evolutions, the AI curve, career finances);
- final hardening (zero console errors, Lighthouse, server review);
- the Rounds 7–15 report.

### v95 — R15 launch assets, part 1: attract demo, credits, PWA check
- **Attract demo.** `splash.js` starts the timer: 40 s idle on the title opens
  `play` with `{ attract: true, duration: 150 }`, using two random clubs of
  tier ≤ 2. Any pointer move, wheel, key, pad button or stick push restarts
  the timer. The demo is not armed:
  - with an update pending (`blocked`);
  - while the tab is hidden;
  - with `reduceMotion` or `battery` on;
  - under automation. `navigator.webdriver` sets the delay to 0 (off); a test
    turns it on with `window.__apexAttractMs`.
- In `play.js`, `attract`:
  - runs with `human: null` (CPU v CPU);
  - skips the pregame show, keeping the walkout;
  - skips hints, the half-time pause and the pad-unplugged pause;
  - hides the touch controls, the pause button and the hints (`.attract`);
  - shows a `.gm-attract` banner.
- **Leaving the demo.** Any key, pointerdown or new pad button calls
  `navigate('splash')`. So do the final whistle (before `finish()`, so nothing
  is paid, recorded or graphics-prompted) and a hard cap (`attractSecs`,
  180 s).
- **Credits.** A panel at the end of Settings (not the menu), `#credits`:
  three.js (MIT), the Mixamo player rig, the Meshy manager model,
  synthesised audio, system fonts, Apache-2.0.
- **PWA icons verified, not replaced.** New `tests/unit/pwa.test.mjs`
  decodes the PNGs. It checks that:
  - every manifest and `<link>` icon is its declared size and not blank;
  - the maskable icon and the apple-touch icon have no see-through pixel;
  - the theme colours agree;
  - sw.js precaches the manifest and every icon.

  All of it passed first time; no icon changed.
- **CI.** `tests/qa/attract.mjs` is a new step. It checks, in order:
  - idle starts the demo, CPU v CPU, and it kicks off and plays;
  - there are no controls on screen;
  - a pad button returns to the title;
  - it comes back, and a key returns to the title;
  - the final whistle returns to the title;
  - Apex and `hintMatches` are unchanged;
  - there are 0 page errors.

  SwiftShader draws the walkout at under 1 fps at 720p, and the sim takes at
  most 4 steps per frame. The test therefore runs at 640×360 and uses a
  3-second match for the whistle case.
- Sweep identical; unit tests 190/190; smoke, layout and a11y scans OK.
- Still to do in R15: store screenshots and a landing page; balance audit
  part 2 (SBCs, evolutions, the AI curve, career finances); final hardening
  (console errors, Lighthouse, server review); the Rounds 7–15 report.

### v94 — fix: a controller left dead after leaving Settings mid-rebind
Found through CI: v90 and v91's `pad-reach` runs failed on the rebind check.
The test pressed Y for 70 ms, which fell between the capture's per-frame
samples on CI's slow software renderer; that was fixed separately, test-only.
The failure then cascaded, because Settings was left listening:
`body.pad-capture` stayed on, the menu pad driver stood down, and every later
pad step failed. That is a real bug. A player who starts a pad rebind and
leaves Settings with the mouse, a tap or Back has a dead controller
everywhere.
- Settings' `mount` now returns a cleanup that stops a pending capture
  (`mountRebind` returns it).
- `navigate()` removes `pad-capture` on every screen change, so no screen can
  leave the driver off behind it.
- `pad-reach` checks it: start a pad rebind, navigate away without a press,
  and the ring still moves on the D-pad.

### v93 — R15 balance audit, part 1: packs, earning rates, a month of play
`tools/economy-audit.mjs` (new, kept) reads the real tables: `PACKS` and
`openPack` (1,500 seeded openings each), `DIVISIONS` and `matchApex`,
`FIVES.reward`, `DAILY`, and quick-sell (value ÷ 25,000). It prints three
tables. Output after the fixes:

```
1. Packs — price against quick-sell value (mean over 1500 opens)

pack              price   sells for   ratio   special%   best card mean   a 90+
campaign          25,000        225    0.01     100.0%             84.3    16.7%
inform            18,000        215    0.01     100.0%             83.8    12.3%
vault            120,000     10,000    0.08     100.0%             93.2   100.0%
bronze                 0         65     free       0.0%             74.1     0.0%
fodder             1,500        104    0.07       0.0%             76.0     0.0%
silver             2,000        117    0.06       4.4%             78.5     3.5%
keeper             3,500         91    0.03       3.7%             79.4     3.3%
dip                5,000         89    0.02      18.7%             79.8    15.9%
striker            3,500         90    0.03       3.4%             79.2     2.7%
stack              4,500        211    0.05      10.3%             81.0     8.2%
gold               7,500        290    0.04      23.7%             84.1    19.3%
youth              6,000        178    0.03       5.9%             80.4     3.9%
defence            6,000        177    0.03       7.5%             81.5     7.1%
midfield           6,000        134    0.02       7.3%             80.4     5.1%
builder           15,000        457    0.03      33.5%             85.6    28.2%
form              12,000        274    0.02      34.5%             85.4    28.5%
double            21,000        321    0.02     100.0%             91.4    78.7%
prime             30,000        489    0.02      81.6%             90.7    72.2%
premier           14,000        280    0.02      33.1%             85.5    21.5%
nations           12,000        272    0.02      27.5%             84.7    18.6%
mega              20,000        710    0.04      51.5%             87.7    44.3%
gamble            18,000        199    0.01      62.5%             88.7    51.6%
eleven            45,000        806    0.02     100.0%             91.7    83.8%
stars             40,000      5,099    0.13     100.0%             92.5   100.0%
limited           75,000     10,397    0.14     100.0%             99.0   100.0%
wildcard          55,000        248    0.00      92.8%             91.2    76.3%
wonder            90,000      5,450    0.06     100.0%             93.2   100.0%
legend           200,000     10,906    0.05     100.0%             99.0   100.0%

2. Earning in a match — Apex per real minute (a won match's pack counted at shop price)

mode                               win      draw     loss    per min (win / loss)
Ultimate XI · Division 10           2,600      210       90    578 / 20
Ultimate XI · Division 7            3,300      455      195    733 / 43
Ultimate XI · Division 4            4,600      910      390    1,022 / 87
Ultimate XI · Apex Elite            9,500    2,625    1,125    2,111 / 250
Quickfire Fives (2 goals for)       1,200      700      500    300 / 125
Street (3 stars / 1 star)             950        0      300    238 / 75
Kick Off friendly (2 goals)           320      320      320    58 / 58
Skills drill (good score)             150        0       60    67 / 27

3. A month of play — through the Ultimate XI ladder, with the daily login

player     matches/day  win%   Apex/day (cash + packs)   month total   division reached   days to a Legends Vault
casual               3   45%        5,449 (2,083 cash)       163,480   Division 9         57.6
regular              8   52%       15,983 (7,883 cash)       479,475   Division 5         15.2
grinder             20   58%       60,844 (42,411 cash)     1,825,330   Division 1         2.8

(Season-pass tiers, objectives, challenges and events come on top; they are paced by the calendar, not by matches.)
```

What it means, and what changed:
- **No money loop.** Every pack quick-sells for 1–14% of its price.
- **Three packs were out of line and are fixed** (packs.js, odds and prices
  only; the sweep is identical):
  - High Roller 26,000 → 18,000, specials 26% → 55%, minimum 79 → 83. Its
    promise, "Best single-card odds in the store", was false (a 90+ 20% of
    the time, the Gold pack's rate) and now reads "One card, usually a
    Special".
  - Lucky Dip odds up (specials 12% → 20%): its best card averaged below a
    2,000 Silver pack's.
  - Prime specials 22% → 30%: 72% for a 90+, beside Double Down's 79%.
- **Earning per minute** (a won match's Silver pack counted at its shop
  price):
  - The Ultimate XI ladder dominates by design, from 578/min in Division
    10 to 2,111/min in Apex Elite.
  - Fives about 300, Street about 240, drills about 70. Friendlies about 60
    are deliberately pocket money.
  - At the bottom of the ladder, cash alone (133/min) is below Fives, and
    the pack on every win makes up the difference. Left as is.
- **A month**: a casual player (3 matches a day) can afford the Legends
  Vault from cash in about 58 days, a regular (8) in about 15, a grinder (20)
  in about 3. The grinder number is the one to watch if the vault is meant to
  stay aspirational; left for a decision (see "Open decisions").
- **Not yet audited**: SBC cost against reward (needs a solver for the
  cheapest qualifying eleven), evolution difficulty, the AI difficulty curve,
  career finances. Next part of the audit.

#### Open decisions
- The Legends Vault is 2.8 days of cash for someone playing 20 Division
  matches a day. Raise it, cap it per week, or leave the top end fast?

### v92 — polish: the new-player walkthrough (R15 item 1, first pass)
`tests/tmp/newplayer.mjs` (throwaway; its screenshots are in tests/tmp/newplayer)
starts from an empty save on a phone (390×844) and a desktop, through the
splash, the welcome card, skipping to Today, and then every main screen. Fixed:
- **Kick Off tile unreadable.** The generic `.tile::after` scrim (a dark
  wash under every tile's words, for the image-backed tiles) also covered
  the green PLAY door, so its dark text sat on near-black.
  `.tile.t-play::after { display: none }`.
- **Weekend League said "Last weekend · Bronze · 0 wins" to everyone between
  weekends.** `currentWeekend()` already rolls the tally to the *upcoming*
  window (the finished one moves to `weekendPending`). While closed, the
  screen now explains the next weekend and hides the empty wins and pips.
- **Today was 3,600 px on a phone**, most of it the 30-tier season grid. It
  now shows a 9-tier window starting at the first unclaimed reward or the
  current tier, with "Show all 30 tiers" (`showAllTiers`).
- **Career** showed "New in v81" as the Player Mode kicker. It is now
  "Run a club" / "Be the player".
- A scan for other version labels in player-facing strings found none.
- **Play session (v91)** is clean on all three devices.

### v91 — R15 controller support, part 3: four at one screen
- **Side select** (`js/components/sideSelect.js`): one token per connected pad,
  keyed by its Gamepad API `index` so hot-plugging doesn't reshuffle anyone,
  plus WASD and the arrows.
  - Controls: left/right move a token between home, not playing and away;
    A is ready, Start (or Enter) kicks off, B backs out.
  - At most 4 people playing. The first two pads start where the chosen
    mode would put them.
  - The first sample of a pad records what's already held, so the A that
    opened the screen isn't a ready press. Sets `body.pad-capture` so the
    menu's pad driver stands down.
  - Returns `[{ team, pad, keys }]`, home seats then away.
- **Quick Match**: Co-op or Versus opens it unless the device is touch-only
  with no pads (that keeps the split-screen touch mode). The mode is then
  derived from the seats (mixed sides = versus, one side = co-op).
- **play.js** `params.localSeats` → one `Input` per seat
  (`new Input({ padSlot, keys })`). `padSlot` binds a pad by Gamepad `index`;
  -1 means no pad. `keys: 'none'` is an empty key set, so a controller seat
  ignores the keyboard. `Match({ seats })` uses the multi-seat path the
  online party already used. The HUD chip lists every seat.
- **Every pad seat gets your remapped buttons** (it used to be only the
  first). The second keyboard half keeps the defaults.
- **Renderer**: four seat markers (white, amber, cyan, pink).
- **Tests**: `pad-reach.mjs` plugs in a second simulated pad, chooses
  Versus, readies both and kicks off with Start, and checks the seats are
  `[0, 1]`. The Gamepad stub is now a list (`window.__pads`). A one-off
  four-player check (two pads and both keyboard halves, 2 v 2): all four
  seats and markers present, each seat moved only by its own device.

Controller support for R15 is complete: menus (v89), the in-match scheme
(v90) and couch play (v91). Left of R15: the new-player playthrough and
rough edges, the visual consistency audit, the balance/economy audit,
launch assets (attract mode, store screenshots, landing page, credits,
verify the existing PWA icons without replacing them), and final hardening
(zero console errors across QA, Lighthouse/PWA scores, a server security
review), then the Round 7–15 report.

### v90 — R15 controller support, part 2: the in-match scheme
None of it is reachable by the CPU (the sweep is identical); it's all in
`handleSeat` and the input layer.
- **Defending** (sim.js):
  - `tackle(p, { slide })`: the slide reaches 4.3 m (standing 3.1), lunges
    at 2.05× top speed, keeps him down for 0.8 s, and multiplies the foul
    chance by 1.3. Called with no options it is byte-for-byte the CPU's
    tackle, dice included.
  - Buttons: shoot = slide, pass or cross = standing tackle. `jockey` (held)
    means 0.62× speed, facing the carrier, no lunge. `press` (held) sets
    `c.press2`; `think()` sends `pressMate(side)`, the nearest free
    non-person team-mate, at the carrier.
- **Right stick** (`input.rstick()`): a flick (from under 0.35 to over 0.72)
  is `skillMove` with the ball, or `switchToward` without it (bearing first,
  then distance).
- **Pad map**: Y = through / press; LT = skill / jockey. On the keyboard,
  G = jockey and F = press.
- **D-pad**: no longer movement on a pad with axes. `play.js dpadTactics()`
  steps `QUICK_TACTICS`: up more attacking, down more defensive, right
  all-out attack, left park the bus.
- **Stick tuning** `setPadTuning({ deadzone, curve })`: a radial deadzone,
  then the power curve. Settings `padDeadzone` (0.22) and `padCurve` (1).
- **Analogue power**: charge rate × (0.6 + 0.4 × `input.value(a)`). It is 1
  on keys and digital buttons, so nothing changes unless a button reports
  pressure.
- **Rumble**: `input.rumble(ms, strong, weak)` through `vibrationActuator`.
  A goal or post goes to every pad; a shot, slide, foul, save, header,
  volley or bicycle only to the seat whose player it was. Settings `rumble`.
- **Hot-plug**: `gamepaddisconnected` pauses an offline match (toast);
  `gamepadconnected` is announced.
- **Settings**: a "Controller layout" panel generated from the live bindings
  in the pad's own glyphs, plus deadzone and response sliders and a vibration
  switch.
- **Remap fix**: the pad capture now waits for every button to come up (the
  A that chose the row used to bind itself). The menu driver stands down
  during capture (`body.pad-capture`) but keeps tracking held buttons.
- **Touch** while defending: SLIDE (shoot slot), JOCKEY (skill), PRESS
  (cross). A new hint lists the defending set.
- **Bug found by the new test, my own**: `dpadTactics` updated its "was held"
  copy before comparing. Fixed before release.
- **Test flake fixed**: `tests/smoke/server.mjs` picked random ports in
  8400–8799. Parallel unit files sometimes collided and a test talked to
  another file's server ("fetch failed", a different test each run). It now
  takes an OS-assigned free port and refuses to talk to a server that isn't
  its own child.

Tests: `tests/unit/controller.test.mjs` (6) covers slide reach, button roles,
jockey speed and facing, press, right-stick switch and skill, D-pad, deadzone,
curve and right stick. `pad-reach.mjs` adds rebinding by pad and an in-match
check (D-pad raises the tactic, unplugging pauses).

### v89 — R15 controller support, part 1: every screen by pad
`js/padMenu.js` is the front-end driver.
- **What the ring moves over.** It now includes inputs, sliders and every
  `data-*` click target the screens delegate on (slots, players, listings,
  drills and so on; the list came from `grep closest('[data-`).
  Wrappers that contain other stops are skipped, except card-like elements
  (`CARDLIKE`).
- **Modal layers own the ring.** `modalLayer()` picks the on-screen keyboard,
  or the known modal classes anywhere in the document (the release notes
  mount inside `#screen`), or else the last big fixed child of `<body>` that
  holds a button. B closes the layer (its close control, or Escape).
- **Buttons.**
  - LB/RB step the first visible tab strip (`.tabs`, `[role=tablist]` or
    `.seg` with one `.on`).
  - X/Y press `[data-pad="x"|"y"]`, with a glyph badge while a pad is in
    use. Assigned so far: pack Skip = X, market Search = Y, collection and
    transfer sort = Y.
  - The right stick scrolls; left/right move a focused slider.
- **Text entry.** A on a text field opens `components/osk.js` (the on-screen
  keyboard). It is not chat: player-to-player text stays preset phrases.
- **Glyphs.** `padKindOf(id)` picks PlayStation, Xbox or generic (numbers).
- **Cost.** The list is built only on input, or every 250 ms to follow the
  layout. Building it every tick cost 10 ms a tick on Grounds at 4× CPU; idle
  now shows no long tasks.

`tests/qa/pad-reach.mjs` is **in CI now** (about 1 minute) and fails if a
controller can't reach a screen or a control. It uses a simulated Gamepad API:
- Declared routes from the menu to all 14 screens, each walked with the D-pad
  and A (`ROUTES`). Add a route when you add a screen.
- On every screen, every control is checked as reachable on the pad driver's
  focus graph (`__padMenu.peek`).
- Feature checks: RB switches tab; a card goes into the line-up (slot, then
  card); a slider moves; a name is typed with the keyboard; B closes a modal.
- `--explore` runs the full breadth-first walk (tens of minutes; for finding
  routes nobody listed).

Next (v90): the in-match controller scheme, deadzone and sensitivity settings,
rumble, hot-plug auto-pause, and a layout screen with remapping. Then (v91)
four controllers in local play with a side-select screen.

### v88 — fixes from the first post-release play session
New standing practice: after every release, play one full match each on phone
touch, desktop keyboard and a simulated controller
(`tests/qa/play-session.mjs`: a simple bot through each device's real input
path, with CDP touch events for the phone), then fix the worst thing found.
Also new: `tests/qa/pad-reach.mjs`, a controller-only walk of the app (simulated
Gamepad API). It is **not in CI yet**: it still reports focus failures in long
scrolling lists, and those need the v89 controller work before it can gate.
- **Stadium Builder blank after the first change (v87 regression).** R14's
  leak fix made `dispose()` call `forceContextLoss()`. The builder rebuilds
  on the *same* canvas, which hands the same, now-lost context to the next
  renderer, so three.js threw in `onFirstUse` (`getProgramInfoLog` is null
  when the context is lost). `dispose({ keepContext: true })` from the
  builder. Play and Grounds get a fresh canvas each mount and still force the
  loss.
- **Pad B stranded you on screens with nothing focusable** (the Trophy Room):
  `tick()` returned before reading B/Start. Back and home are read first now.
- **Touch stick could die**: an unguarded `setPointerCapture` throw left
  `stickId` set with no stick shown, so every later touch was ignored. All
  capture calls are guarded.
- The quick-tactics hint named keys 1–5 on every device. The "No pad" chip
  is hidden on touch devices until a pad is connected.
- Test hooks: `window.__padMenu` (list / focus / peek) and `window.__apexScreen`.

### v87 — Round 14: performance, stability, accessibility
Built earlier as the "R14 WIP" stash, paused for the v84 hotfix, the v85
landscapes and the v86 bug pass, then re-applied on top of them. Its own
"v84" labels became v87. Conflicts were merged by hand in sim.js (assists +
responsiveness), renderGL.js (the substitute-rig swap + animation LOD),
play.js (SimLatch + governor), settings.js and state.js. **app.js merged
without a conflict marker but declared `token` twice** (the stash's lazy-load
`navToken` and v86's navigation guard). Unit tests can't see that; the boot
test caught it. v86's mount guard now reuses `navToken`.

What is in it:
- **Code-split**: title and menu ship with the boot; every other screen is
  a dynamic import behind `SCREENS` loaders, with a spinner if the chunk is
  slow. Patch notes load only when the card is shown.
- **Frame governor** (game/governor.js): drops effects (post chain, shadow
  updates, resolution) before the frame rate drops, and restores them.
  **Battery mode**: 30 fps cap, light picture. **Animation LOD** for model
  rigs: far or behind-camera players pose every 2–4 frames, staggered.
- **The leak**: shared module-level geometries, materials and kit textures
  are now disposed with the renderer.
- **Real loading bar** (`gl.progress`) with tips.
- **Stability**: save fuzz (corrupt, old, huge) and server fuzz unit tests.
  Damaged saves are set aside and the newest backup is used, with a one-time
  notice. Export/import and restore from backup live in Settings. A
  cloud-save conflict chooser keeps the loser as a backup. Server has token
  buckets, validation on every endpoint, own-property account lookups, and
  Weekend League results only for the window open now.
- **Accessibility**: text size S/M/L/XL, colour-vision filters (SVG,
  in-match), subtitles, one-handed touch layout, sprint hold/toggle, shoot
  timing assist and pass assist 0/1/2 (people only; the CPU never reads
  them, so the sweep is identical), keyboard focus ring everywhere,
  switch labels, reduced motion everywhere. New tests: `a11y-scan.mjs`,
  `qa/offline.mjs`, `qa/soak.mjs`, all in CI (soak at 20 matches).

**WebWorker for the sim: measured, not done.** The sim costs 0.062 ms a step
median, 0.29 ms p99, 1.07 ms p99.9 (57,600 steps, `tests/tmp/simcost.mjs`).
Even at 6× CPU throttle that is about 2 ms against a 16.7 ms frame. Rendering is
the whole cost, and a worker would put a snapshot round-trip between
the sim and the renderer, the replay tape, subs and tactics for no frame-time
gain. Revisit only if the p99 grows past about 3 ms.

Before (v86 on main) → after, same machine:

| | v86 | v87 |
|---|---|---|
| cold boot, 4× CPU, typical 4G | 6,991 ms | 1,719 ms |
| cold boot, 4× CPU, Slow 4G | 6,900 ms | 3,538 ms |
| warm boot | 1,301 ms | 1,147 ms |
| boot download | 1,092 KB, 116 requests | 461 KB, 45 requests |
| precache (gz) | 2,501 KB | 2,417 KB |
| heap after 20 matches | 58.9 MB (+2.43/match) | 14.7 MB (+0.12/match) |
| gl-fps Low/Med/High/Ultra | 1.7 / 1.0 / 0.5 / 0.1 | 1.7 / 1.4 / 0.6 / 0.1 |

Soak (`qa/soak.mjs --seed 7`, random modes and settings): 184 matches before
the harness's hour ran out (futsal 33, final 30, versus 29, fives 27, practice
24, quick 21, street 20). 0 page errors, heap 16.9 → 18.2 MB and flat. Also
green: unit 180, sweep identical, smoke, QA, layout, a11y scan, offline QA.

### v86 — bug pass: everyone turns, fixed sim step, subs, navigation
**Everyone turns (the CPU's "brick").** `drive()` capped the target heading at
`omega·dt` and then blended the whole velocity 15% of the way towards it
(`k = dt·accel`). The two compounded, so the CPU's real turn rate was about
`omega·k` ≈ 1 rad/s: an eight-metre circle at a sprint. It was also
frame-rate dependent (twice as sharp at 30 fps). A loose ball inside that
circle was orbited indefinitely; the new sim fuzzer (`tests/tmp/simfuzz.mjs`)
found two street1 players circling one for over ten seconds. Fixed properly:
the velocity is *rotated* by the capped turn and only the speed is eased. A
target inside the turning circle (`2·(v/omega)·|sin da| > dist`) makes him ease
off to the speed at which the turn reaches it. The user asked for all players
to feel light, not only the controlled one, and for a deliberate retune.

| CPU (drive) | v85 | v86 |
|---|---|---|
| 180° at a jog | 1.18 s | 0.23 s |
| 180° at a sprint | 1.65 s | 0.47 s |
| 90° at a sprint | 0.92 s | 0.15 s |
| reach a point 4 m to the side at a sprint | never (orbits) | 0.43 s |

(The person's player, `driveHuman`, still turns a sprint 180° in 0.12 s: quicker
than the CPU, as required. Tested in `responsiveness.test.mjs`.)

**The retune (deliberate, measured, sweep re-baselined).** With agile
defenders there were more challenges, so fouls went 4.7 → 11 a match, free kicks
5 → 12 and penalties 0.10 → 0.4. Agile attackers reached shooting range more,
so shots went 11.8 → 15.5. Three new TUNE knobs, each measured with a copy of
the sweep over 60–120 matches on both seeds:
- `tackleRate 0.6`: how often the CPU commits to a challenge in range.
- `boxCare 0.35`: foul chance for a tackle, trip or shove *inside the
  defender's own box* (nobody dives in there). This fixed the penalty rate.
- `shotRate 0.7`: the open-play shot hazard. It saturates (a man in range
  shoots within frames anyway), so it moves shots less than you'd expect.

Result, golden seed 12345: goals 2.22, shots 14.2, conversion 15.6%, fouls
8.4, yellows 1.7, penalties 0.22. Before this change: 1.95 / 11.8 / 16.5% /
4.7 / 1.3 / 0.10. The shots target in the sweep printout is now "11-15":
conversion fell towards the real ~11%, so more shots are needed to keep goals
in the 2-3 band. Corners (1.7) and throw-ins (5) remain well under real-scaled,
as before this change; not touched here. Re-tune with a copy of the sweep, not
by feel.

**Fixed sim step.** play.js now runs `match.update(1/60)` from an accumulator
(up to 4 steps a frame), so every device plays the match the sweep measures.
Presses reach the sim through `SimLatch` (input.js): edges are collected
between steps and cleared after each, so a press is never lost on a 120 Hz
frame with no step and never doubled on a frame with two. The UI (pause, menus)
still reads the raw `Input` every frame. Tested in `simlatch.test.mjs`.

**Substitutions.** Once off, off: `substitute()` refuses a player who has come
off (`cameOff(id)`, from `pst[id].off`). The CPU's injury sub picked "best on
the bench", which was often the injured man it had just taken off, and sent
him back on healed. The pause menu greys those players out and marks them
OFF. The figure is rebuilt when a substitute comes on (`simpleRig` /
`modelRig` in renderGL, keyed by `rig.refId`), so he no longer wears the
replaced player's face, hair, build and name. Sweep moved by noise only (goals
1.95 → 1.97) and was re-baselined. Tested in `subs.test.mjs`.

**Navigation.** `navigate()` keeps a sequence number. A screen that navigates
while still mounting used to have its cleanup assigned over the new screen's,
which leaked the new screen's listeners and left the old screen's timers
running (quick match's 900 ms pad poll threw on a missing `#tsSeatH`). Found
by the new random-click monkey (`tests/tmp/monkey.mjs`, desktop and phone).

### v85 — the land round every ground
Reported: "the city backdrop has no streets, mountains don't look like mountains,
and there are no trees or rocks". The old skyline boxes, ridge cones, dunes and
palms in renderGL.js are gone; everything outside the stadium is now one call to
`buildLandscape()` in **js/game/landscape.js** (new, precached).

- **City / coast:** a street grid with merged asphalt, kerbed pavement slabs,
  dashed centre lines and zebra crossings (polygonOffset so they don't z-fight),
  street lights and parked cars near the ground, downtown towers, parks, and
  rooftop details. Windows are drawn in the building shader from world position
  (`buildingMaterial`, cache key `apex-building-*`), fade out with `fwidth` at
  distance, and light up at night. The coast adds a sea, a beach, promenade
  palms, shore rocks and a lighthouse, with no blocks on the sea side.
- **Mountains:** a sectored polar heightfield (`terrainRing`) built from ridged
  and fbm noise, with a 650 m ramp so the peaks sit above the far roof. Snow
  above 340 m (60 m when it snows), bare rock on steep slopes, alpine meadow,
  forest floor, pines below 150 m and rocks. There's a chalet village along the
  near streets (`edgeHouses`, shared with the suburbs).
- **Suburbs:** gable-roofed houses along the block edges, garden trees, a wood
  and a line of hills. The old suburbs code in groundDressing.js is deleted.
- **Desert:** dunes (`ridged*58`), flat-topped banded red mesas beyond 850 m,
  low sandstone buildings, palms and rocks.
- **Trees and rocks:** instanced in 8 angular sectors, each with its own
  bounding sphere so culling works, with a near LOD and a far LOD. The strips
  between the plaza and the first streets are planted (`plantFringe`), with a
  lawn in the city.
- **Haze** is baked into vertex and instance colours with `fog:false`, because
  FogExp2 turned the mountains into white paper at these distances. Terrain uses
  `envMapIntensity 0.15`, because the sky PMREM bleached the rock and mesas.
- **Camera far plane 900 → 3000 m.** The hard band on the horizon was the far
  plane clipping the land. The sky gradient now ends in the fog colour at the
  horizon.
- **Holes under the stadium:** the ground disc is a ring and the plaza a frame,
  both open over the stadium's own surround (`floor` rect passed from
  renderGL). A full sheet there shaded every pitch pixel twice and cost about
  150 ms a frame on SwiftShader.
- **Tiers:** Low uses 0.35× the counts, no lights, cars or rooftop details, a
  110 m tree LOD radius and Lambert materials. Medium also uses Lambert. Low
  has about half the triangles of High (unit-tested).
- **Grounds gallery:** new **Aerial** camera (a high, wide orbit), because
  the Orbit view never leaves the bowl and the land can't be seen from it.
- `gl.scene` getter added for perf harnesses.

Verification: unit 167 (9 new in landscape.test.mjs), sweep identical for both
seeds, smoke ok, QA ok, layout ok. Venue matrix: 70 venue/tier frames, 0
black and 0 errors. Every landscape was shot day and night from the broadcast,
gallery, outward, street and top cameras (`tests/visual/landscape-shots.mjs`),
and from the Grounds screen with snow.

Fixed-resolution render cost (ms/frame, SwiftShader, night, broadcast camera,
`tests/tmp/landbench.mjs`; v84 → v85):

| tier | city | mountains | desert |
|---|---|---|---|
| low | 750 → 762 | 706 → 666 | 703 → 642 |
| medium | 788 → 892 | 829 → 826 | 866 → 847 |
| high | 1349 → 1402 | 1419 → 1287 | 1448 → 1296 |

gl-fps (SwiftShader, in-app): Low 1.9, Medium 0.9, High 0.5, Ultra 0.3 (v84:
1.8 / 1.3 / 0.7 / 0.1). This is noisy because the frame-time governor moves
the resolution; trust the fixed bench above.

### v84 — hotfix: the controlled player's movement
Reported: "doesn't move backwards, doesn't run properly and barely turns".
Reproduced through the real `Input` class for keyboard, the touch vector and
a stubbed gamepad (`tests/unit/responsiveness.test.mjs`), on an empty pitch:

| | v83 | v84 |
|---|---|---|
| standstill → 90% sprint speed | 0.18 s | 0.07 s |
| 180° at a jog (to 80% speed back) | 1.58 s | 0.07 s |
| 180° at a sprint | 1.70 s | 0.12 s |
| 90° at a jog | 0.88 s | 0.05 s |
| back from standing, 0.5 s | 3.8 m | 4.2 m |
| browser, keyboard, sprint 180 (match time) | 781 ms | 102 ms |
| browser, "back" alignment with the camera | −0.07 (sideways) | 1.00 |

- **Cause**: the v79 `drive()` (heading turns at `p.turn` rad/s, shrinking
  with speed; a "planted foot" brake for a sharp change over 70% speed) was
  used for the person's player too. A reversal swung round in a wide arc,
  so pulling back sent the player sideways.
- **Fix**: `Match.driveHuman` — the velocity chases the stick with an
  exponential blend at 16–34/s (by `responsiveness`, default 0.7), softened
  to 30–65% of that by a smoothed sprint momentum (`p.humanMom`, builds at
  2.5/s, fades at 4/s). Only `handleSeat` calls it; the CPU keeps `drive()`,
  so the **sweep is byte-identical**. Analogue: half a push is full speed,
  a light touch walks (min 35%). Pad deadzone (0.22) is now radial and
  rescaled. Arrow keys move in solo play (`Input({ arrows })`; they were only
  in the player-two set). `settings.responsiveness` + a slider in Settings →
  Button map; `Match` option `responsiveness`.
- Checked and not involved: animation root motion (the rig pins the hips to
  the sim position every frame), fatigue (now 0.9–1.0 for a person),
  per-frame rates (all rates are per second via `exp(-rate*dt)`). The
  frame-time governor and the rest of R14 were not in this build — they are
  parked in `git stash` ("R14 WIP") and come back after the hotfix.
- Tests: 8 in `responsiveness.test.mjs` — every device with and without the
  ball, analogue mapping, the person quicker than the CPU model, and the
  slider honoured.

### v83 — broadcast presentation (Round 13)
**Sweep byte-identical**: nothing in the broadcast writes to the match. The
new code lives in `js/broadcast/` and play.js only calls into it.
- **director.js** is the one object play.js talks to: `cue`, `line`,
  `tick(dt, live)`, `clock()`, `goal`, `kickoff`, `halfTime`/`halfTimeHTML`/
  `drawHeat`, `fullTime`, `wipe`, `destroy`. `window.__apexBC` in a match.
  Created when the loading veil lifts, not for practice or spectators;
  graphics and the broadcast clock are **offline only** (online keeps the
  plain minute, because the stoppage board must agree on two machines).
- **Clock** (`context.js broadcastMinute`): the sim half is fixed length; the
  board goes up at 43' (`BOARD_AT`) with `addedMinutes(goals, cards, subs,
  injuries, dead balls)` (1–6), and the rest of the half is displayed as
  43' → 45+N, so the whistle lands on the last added minute. The goal list
  still uses `match.minute()` (a goal in added time reads 45'/90').
- **Voice** (`voice.js`): `createDesk` — two speakers (Tom Hale / Nadia
  Farouk; Arabic فهد السالم / ليلى ناصر, all invented), two platform voices
  where available, a two-item queue that drops lines older than 4 s, goals
  interrupt, a timeout guard because some platforms never fire `onend`. No
  voice for the language (or none at all, as in headless Chromium) → subtitles
  only. Lines: `data/commentary.js` (233, play-by-play) + `data/
  commentaryVoices.js` CO 141, CONTEXT 103, AR 293 → 770. Settings:
  `commVoice`, `subtitles`, `commLang` (auto follows the game language).
  With subtitles on the old text feed is hidden (`#gmRoot.bc-subtitled`).
- **Context** (`context.js`): derbies are generated — clubs in each league
  sorted by id and paired 0–1, 2–3 — named "the Ironvale–Solaris derby";
  `goalKeys` (hat-trick, brace, late winner/equaliser, opener, derby goal);
  `fullTimeKeys` (final win, comeback, upset by ≥5 rating, big win, goalfest,
  clean sheet); `formMap` (career `pl[name].ratings` avg ≥7.3 hot / ≤6.1
  cold, plus the week's In-Form cards); `offsideMargin` — an offside within
  0.9 m gets the review panel (it confirms the sim's call; it never
  overturns one).
- **Graphics** (`graphics.js`): stoppage board, sub board (subs detected by
  a slot's `ref.id` changing, so AI and injury subs show too), card (yellow
  only — the sim has no red cards), name strap (first touch after a restart,
  25 s cooldown), stat pop-ups at the quarter hours, momentum bar
  (`createMomentum`: territory + decaying shot/chance/corner/goal events,
  series every 2 s for the full-time graph), review panel, logo wipe, heat
  maps (`createHeat`, 24×16 per side in its attacking direction, sampled at
  2 Hz). `gfx.counts()` for tests.
- **Pre-match** (`pregame.js`): flyover 4 s, sheets 4.5 s each, pundit 5.5 s
  (`previewText`, Omar Reyes / خالد الراشد), walk-out (the existing 7 s
  one), handshake 2.4 s, coin 2.8 s. The show never advances while the
  walk-out runs; `pastWalkout()` hands back. The XIs stay lined up until the
  show ends, then `resetPositions(0)`. The toss is cosmetic and always ends
  with the home side kicking off (the sim's rule): an away win "picks ends".
  `pregame: full | short | off`; skipped under reduced motion, online, for
  guided matches and practice. `#gmRoot.pregame-on` hides the match HUD.
- **Full time** (`postmatch.js`): POTM reveal, tabs Ratings / Stats (the
  sim's counts + summed `pst`) / Momentum / Dressing room (`reaction`, seeded
  by the score), and `drawResultCard` (1080² canvas) → `navigator.share` with
  a file, else a download. A won `params.final` gets `trophyScene` over the
  card after 1.8 s. Not shown for street matches (they have their own card).
- **Menu**: `js/seasonal.js` — National Day (20–26 Sep), Ramadan (a per-year
  table 2025–2030; a year not listed shows no Ramadan theme), winter
  (Dec–Feb); `menuTheme` setting. Plain green/white pennants and palms, no
  flag or emblem; lanterns and a crescent for Ramadan. `audio.js` TRACKS
  (6 generated tracks) with `nextTrack`/`prevTrack`/`setMusicMuted`
  (remembered in `localStorage apexxi.music`) and a highlights bed
  (`startHighlightsBed`) under the full-time highlights.
- **Bug found on the way**: I first reused the class name `bc-subs` (the sub
  board's) as the match root's "subtitles on" flag, which gave the whole
  match view the sub board's absolute position and size. Renamed to
  `bc-subtitled`. The r13 script caught it; worth remembering that `.bc-*`
  names are global.
- **Tests**: `tests/unit/broadcast.test.mjs` (9), `tests/visual/r13-shots.mjs`
  (reduced motion off: every pre-match stage, graphics, the 45+ clock, heat
  maps drawn, every full-time tab, the result card, the trophy, all three
  themes, the music player, Settings).

### v82 — new modes (Round 12)
**Sweep byte-identical** (seeds 12345, 777): every addition is gated on a
field spec or an option that the 11-a-side sweep never sets.
- **Fields** (`js/game/field.js`): `futsal` is 42x25 with `kickIn` (restarts
  along the floor, `vz = 0`) and `ball { bounce: 0.2, drag: 0.982 }`; the sim
  now reads bounce/drag from `FIELD.ball`. `street1/3/4/5` carry
  `walls: true, street: true`.
- **Sim** (`js/game/sim.js`): `SHAPES4/3/1` and `smallFrom(xi, n)` for small
  sides; `walls()` rebounds the ball (e = 0.62, the goal mouth open) and counts
  `wallHits`; `styleOf(team)` / `styleEvent` — skills +25/+40, off the wall
  +10, chained x5 at most, a goal 100 + 50 x chain; street restarts wait 2.5 s
  for a person and at most 0.5 s for the CPU. Practice: `park(team)` sends
  everyone but the keeper off the pitch (a wall is un-parked for a free kick),
  `noOffside`. Parties: `opts.seats` makes one controller per seat; a
  controller with `ai` set is a dropped seat the CPU drives.
- **Street** (`js/data/street.js` venues, `js/game/streetDressing.js` court
  texture + cage, `js/streetMode.js` baller/crews/tour/cosmetics,
  `js/screens/street.js`). renderGL: `STREET` venues skip the bowl, boards,
  banks, tifo and pylons and use the court texture. Beach sand overrides the
  ball (bounce 0.14, drag 0.972). Boss beaten → his best player joins the
  crew and his cosmetic unlocks.
- **Parties** (`server/party.js`, `js/net/party.js`, `js/net/partySquads.js`,
  `js/screens/partyPanel.js`): coop2 / duo / pro5. The server stamps each
  guest `in` with its seat (`sq`) and fans the host's snapshots out; drops are
  held 45 s (`evt dropped/resumed`, `partyRejoin`); a host drop ends the party.
  Co-op results are recorded once per match on both accounts
  (`store.recordCoop`, `profile.coop`). Pro payloads pass `cleanPro` (name,
  position, six numbers) or are dropped. No free text: only a party code.
- **Skills** (`js/game/drills.js`, `js/screens/skills.js`): four drills, the
  shootout, the practice arena. `/api/skills` GET/POST with per-game ceilings
  (`SKILL_MAX` slalom 1600, freekicks 750, crossing 900, passing 12000).
  Practice set pieces skip the kickoff before staging (it would undo them).
  A running drill sets `body.in-drill`, which hides the top bar (the stage is
  fixed inside a transformed screen and the bar covered its Quit button).
- **Input** (`js/game/input.js`): `ACTIONS`, `setBindings` /
  `getBindings` (saved in `settings.controls`, applied at boot), `keyMapFor`,
  `padMapFor`, `promptFor(action, device)`, `lastDevice` / `onDeviceChange`,
  `padGlyph` (Xbox / PlayStation by pad id). HINTS and set-piece text use the
  prompts. Split touch (`buildSplitTouch`) for two players on a coarse-pointer
  screen at least 900 px wide.
- **Watch**: a street 1v1 (`field: 'street1'`, no keepers).
- **Tests**: `tests/unit/new-modes.test.mjs` (8), `tests/unit/party.test.mjs`
  (party relay with five real sockets: 2v2, drop + reconnect, pro5 3v2, host
  drop, co-op season, dedupe; skill boards), a QA `party` flow (co-op with
  two browsers, then 2v2 with four), `street`/`skills` in the layout scan,
  `tests/visual/r12-shots.mjs`. The QA bot now gives each browser its own
  `x-forwarded-for`, because it registers more accounts than the per-address
  limit (5/hour) allows.
- **Known, honest**: futsal still stops a lot — about 50 restarts in a
  2-minute match even after widening the court to 42x25; the CPU's small-sided
  passing goes out of play too often. Worth a look at the AI's pass range for
  small fields rather than a bigger court. Street games run about 4-6 goals
  in 2 minutes; the watch 1v1 about 5 per minute.

### v81 — career depth (Round 11)
**Sweep byte-identical** (seeds 12345, 777). The sim gained counting only:
`Match.pst[cardId]` (passes, shots, won tackles, saves, distance, on/off
time), `minutesOf`, named set-piece takers (`custom.takers { pen, fk, corner }`
→ `namedTaker`) and the player lock (`lockPlayer(cardId)`, `lockSeats`,
locked seats skip auto-switching and only take their own man's restarts).
- **Ratings** (`js/game/ratings.js`): `rateMatch(m)` → players rated 3–10
  (base 6, goals/assists, tallies, clean sheets, result, cards; cameos pulled
  toward 6) and the player of the match; `simRating` for simmed games.
- **People** (`js/careerPeople.js`, imported by every career module, imports
  none): a name → card Map (the old `WORLD.players.find` per call), `ageOf`
  moving with seasons, `rateOf` (base + `car.dev`), dynamic `potOf`,
  `valueIn`, regional generated names, `addPerson` for regens and your pro.
  `careerV2` now rates through it (`useCar(car)`, `squadOverall(rows, car)`).
- **Engine**: `career.newWorld(manager, clubId)` builds a world;
  `advanceCar(car, score, { extra, pro })` is the week (the Manager Career's
  `advanceWeek` wraps it; `extra` = XI, subs, ratings, scorers, possession
  from a played match — play.js `careerExtra`). Out-of-contract AI players
  become free agents clubs sign before generating youngsters.
- **careerV3.js**: training schedules + fitness/sharpness/injuries, plans
  (focus or retrain in 8 weeks), hierarchy (keepers ranked apart) and
  playing-time morale, talks/promises/requests, media stories, scouts
  (1–3, 1–5★, regions, reports with ± error), loans in/out (home at season
  end, growth by games), release clauses (fire on a bid), sell-ons (paid on
  the AI move), agent fees 7 %, a ledger (`book`) and wage budget, four
  facilities (15M × level²), five board pillars (success ×2), youth
  tournament, awards (champion, POTS, golden boot from simmed scorers, young
  player), AI manager changes, retirements from 34, regens to 18 a squad,
  `squadFloor` (16, two keepers), pruning. Economy: TV 2.6M (tier 1) + rep ×
  25k a round, shirts rep² × 450, prize by position.
- **Player Career** (`js/proCareer.js`, screen `js/screens/pro.js`, route
  `pro`): `startPro`, six attributes → position-weighted overall, hidden
  potential 78–93, weekly drill (0–100, a timing bar) + match XP, trust →
  selection (`start`/`bench`/`out`; the young always make the bench), agent
  offers in windows (moves and loans happen in the summer), contract talks,
  milestones, call-ups (nation's 23rd best via `world.nations()`), age decline
  from 30, retire from 33 (forced at 40), `legacy()` score and tier.
  Matches: play.js `params.pro { cardId, swapped }` — your side is fielded
  as home, `venueSquad` is the real host; camera preset `lock`.
- **Scenes** (`js/components/ceremony.js`): `pressScene`, `signingScene`,
  `trophyScene` (confetti canvas; reduced motion → still). Faces take a
  `look` override (`faceOf`).
- **Screens**: career hub tabs Training, Dressing room, Finance (with
  facilities), World; Scouting shows the network; Transfers adds Loans; the
  Board shows the pillars; offers can carry a 15 % sell-on; contract terms a
  release clause; `⇆ Careers` switches between the two careers.
- Fixed on the way: the career squad and market rows overflowed a 390 px
  phone (pre-existing).
- Tests: `tests/unit/career-depth.test.mjs` (10 seasons of each career:
  stability, < 450 KB, < 15 s; the lock; ratings; takers; manager systems;
  people). Visual: `tests/visual/r11-shots.mjs`. QA bot: new `pro` flow.
  Layout scan includes `pro`.
- Measured: 10 manager seasons ≈ 0.4 s, 164 KB; a 19-season pro career
  ≈ 1.2 s, 221 KB.

### v80 — Ultimate XI depth (Round 10)
**Sweep byte-identical** for seeds 12345 and 777. The field became
configurable without moving a single full-pitch number (the cross "wide"
threshold is `20 * (PITCH.h / 68)` so it is exactly 20 m on a full pitch).
- **Field** (`js/game/field.js`): `PITCH`, `CY`, `GOAL_HALF`, `GOAL_HEIGHT`,
  `BOX`, `FIELD`, `SCALE` are live bindings set by `setField('full' | 'fives'
  | 'futsal')`, called by `new Match(..., { field })`. The sim, camera and all
  three renderers read them. Fives: 60×38, 2.5 m half-goal, 5 a side
  (`SHAPES5` 1-2-1 / 2-2 / 2-1-1, `fivesFrom(xi)` picks GK/DEF/2 MID/FWD),
  no offside; keeper reach, pickup, shot spread and read error scale with the
  goal. About 2.5 goals per 150 s match.
- **Scorers** are `{ name, id, assist, assistName, minute }`; `ball.passer`
  feeds the assist and is cleared on a turnover.
- **Promo cards** (`js/data/promos.js`): ids `pr:<campaign>:<id>`,
  `if:<week>:<id>`, `tw:<week>:<id>`, `ic:<early|peak>:<id>`, resolved lazily
  through `setVariantResolver` in `getPlayer` and never in rosters.
  `weekPerformers(week)` sims a deterministic world round for TOTW (11) and
  In-Forms (24). Campaigns rotate weekly (Future Stars / Heroes of the Desert /
  Winter Legends). `baseOf(card)` — one footballer per lineup (squad `place`).
  Packs `campaign`, `inform`, `vault` carry `variant` + `variantOdds`.
- **Evolutions** (`js/evolutions.js`): six tracks × three stages, three at
  once; `recordEvoMatch` runs after every Ultimate XI match (Division, Fives,
  Clash, Weekend); `evolvedRef` applies boosts before chemistry in
  `ultimateSquad`. Fixed during the round: a running track's boost read
  `live.track`, which does not exist (the track is the key).
- **Modes** (`js/modes.js`, UI `js/screens/uxiHub.js` under Division):
  Quickfire Fives (`params.fives`, `field: 'fives'`, venue `stationrd`),
  Squad Clash (16 themes, 12 a week, 5 levels, weekly rank paid the next
  week), Division weekly rewards (`noteDivisionResult`), Weekend League
  qualification (10 points per weekend window; gated in `screens/weekend.js`).
- **Market** (`js/market.js`): offline, deterministic listings per 4 h slot,
  price range 0.5×–3× value on list/bid/buy, 5 % tax, bids escrowed,
  14-day history graph. `data/cardValue.js` is the pure rounding the watch
  shares. Market value follows real-world worth (economy `price`), not
  rating — a rating floor was tried and made every pack resell for 1.5–3×
  its cost, so it was dropped. Instead cards rated `ELITE` (88+) are never
  listed by the market, and its buyers pay at most `BUYER_CAP` (1.3×) value,
  which closes the buy-and-relist-at-3× farm. Resale of every pack stays
  below its price (best: Limited 0.79×). **Binder** (`js/binder.js`): `club.everOwned` (written by `save()`),
  sets pay once.
- **Tasks** (`js/tasks.js`): 3 daily + 5 weekly dealt by hash, `bump(metric)`
  from progress/market/evolutions/binder; club level from lifetime XP
  (`club.xpTotal`), paid every level, packs at 5/10/25.
- **Squad hub** (`js/squadHub.js`): 20 invented managers unlocking by club
  level; `chemistryFor(lineup, formation, manager)` adds +1 on nation or league
  (capped) and returns `parts` for the breakdown; `chemLinks` draws the pitch
  lines; five saved squads; `buildSquad()` tries every formation × anchors.
  SBCs use the raw chemistry (no manager).
- **Watch**: Quickfire Fives button (`playMatch(..., { field: 'fives' })`),
  Fives record (phone + wrist), best card's guide market price.
- Tests: `tests/unit/ultimate-depth.test.mjs` (10). Visual:
  `tests/visual/r10-shots.mjs` (every new panel, both orientations, a live
  Fives match to full time).
- Verified: unit 123/123, sweep identical, smoke, QA bot, layout scan
  (12 screens × 3 phones × 2 languages), r10-shots clean (it now also flags
  anything clipped past a panel's right edge — the squad hub was, in portrait,
  from the manager list's long labels; `.sb-layout` is `minmax(0, 1fr)` now).
- FPS (SwiftShader, CI-class): Low 1.7 · Medium 1.1 · High 0.4 · Ultra 0.1.
- Next: R11 career depth (task list).

### v79 — gameplay feel and AI (Round 9)
**Sweep re-baselined deliberately** — this round rebuilds the football. The
sweep now also reports restarts and discipline beside real top-flight
averages scaled to the sweep's shots (real: 25 shots, 22 fouls, 10 corners,
44 throw-ins, 17 goal kicks, 4 offsides, 3.8 yellows a match):

| per match (seed 12345 / 777) | v78 | v79 | real, scaled |
|---|---|---|---|
| goals | 2.12 / 2.05 | 1.95 / 2.03 | — |
| shots | 12.95 | 11.83 / 11.62 | — |
| on target | 76 % | 45 % | ~34 % |
| fouls | 1.85 | 4.73 | 10.4 |
| yellows | 0.28 | 1.30 | 1.8 |
| corners | 1.47 | 2.08 | 4.7 |
| throw-ins | 0.25 | 8.87 | 20.8 |
| goal kicks | 0.53 | 3.78 | 8.0 |
| offsides | — | 0.60 | 1.9 |

Every restart is now between ~30 % and ~75 % of the real rate (it was
1–30 %); the rest is the AI still keeping the ball on the grass more than
people do. Sim cost 0.05 → 0.07 ms a step.
- **Momentum** (`drive`): per-player `accel`, `turn` (rad/s, far less at a
  sprint), a plant-and-brake (`p.planted`) when asked to reverse above 70 %
  speed; keepers exempt. **Duels** (`separate` → `duel`): opponents share
  the separation push by `strength`; a contested ball can knock the weaker
  man off it; a push from behind or a trip on a beaten defender is a foul;
  pinned on the touchline the ball often goes out off one of them.
- **Ball**: first touch (`control`, speed, height, a man close) can be
  heavy → loose ball + a press trigger; driven/ground passes, through-ball
  lead 5–17 m by hold, pressure and distance error, Pinged Pass; shots aim
  at a corner (CPU), dip (power > 0.75) and knuckle (Cannon / long range);
  spread ×1.5; crosses `floated | driven | cutback` (CPU picks, human: stick
  back = cut-back, curl held = driven) with crossing error and blocks;
  volleys (0.42–0.85 m), timed headers (Aerial Threat), bicycle kicks
  (4★+); defenders head crosses clear, sometimes behind; clearances; won
  tackles poke it loose 55 %; keepers catch less, parries tipped round go
  behind (`noTouch` 0.6); dive reach and speed by rating.
- **Offside**: `offsideLine`, `isOffside`, `noteOffside` on every pass and
  cross; the next receiver in the watch set is flagged → indirect free
  kick; `offsides[]`. AI forwards keep level (`onsideX`) except a third of
  runs that go early; the back line holds flat when defending.
- **Bugs fixed**: a dribble could carry the ball over the goal line (owned
  balls were never bounds-checked) and a shot from there was released
  inside the net and given; throw-ins were taken from outside the line and
  counted twice; a goal from a cross was not "on target".
- **Traits** (`js/data/traits.js`): 12 original traits dealt from the card
  (max 3, elite "+" only on 86+), skill stars 1–5; sim reads `p.tr`.
- **Tactics** (`js/game/tactics.js`): defensive styles, build-ups, width,
  line, 15 roles with in/out-of-possession offsets and behaviour flags
  (overlap, runs, target…), five quick tactics, `adaptFor` (half-time and
  last fifth: all-out / see it out with `tempo: 'slow'` — keeper holds,
  corner-flag shielding, slower restarts). `decisionQuality` = difficulty.
  Pressing triggers on heavy touches and back passes; third-man runs.
  Pause → Team Management has all of it; `setQuickTactic`, keys 1–5, ⚑.
  Ultimate XI saves `club.tactics`; roles validated against slot role.
- **Skill moves** (`js/game/skills.js`): 13 moves, star-gated, picked by
  stick direction relative to facing + modifier held during a skill hold
  (fires on release; the lob pass is swallowed); touch: swipe the SKILL
  button (`input.setGesture`). Settings → Controls lists them.
- **Tests**: `tests/unit/gameplay.test.mjs`; sweep reports restarts.

### v78 — grounds and pitch realism (Round 8)
**Sweep untouched** (no sim change): byte-identical on 12345 and 777.
- **Ground data** (`js/data/grounds.js`, new): `groundClass` by capacity —
  community < 7k, town < 20k, bowl < 50k, arena (showpieces/wonders always
  arena); `groundProfile(def, host)` → klass, landscape (country lists →
  desert / coast / mountains, else city for bowl+arena, suburbs below; the
  builder's own landscape wins), floodlights (`rim` / `lattice` corners /
  `side` masts / `mast`), goalStyle box|deep|stanchion, grass {length,
  density, lineFade}, orientation 0–359°, mowing (a host club mows its own
  pattern), opened / record / recordYear (fictional, deterministic).
  `stadiumFor` now returns `host: {id, name, country}` (named grounds are a
  shallow copy). Eight community grounds added (1,200–3,800); stadium count
  120; the round4 capacity floor is now 1,000.
- **Renderer** (`renderGL.js`): `profileFields()` folds the profile into the
  venue spec. Community class builds one 46 m far stand, no ends, no bowl,
  no outer shell, no tifo, and seats only there. Sun azimuth rotated by the
  ground's orientation (not at night); terrace steps cast shadows on High+
  by day, back walls on Medium+. `pitchTexture(…, {seasonWear, lineFade,
  frost, snow})`: bare-earth goalmouths/centre by season, worn line gaps,
  frost sparkle + frosted edges, snow cover with lines cleared to grass.
  `lightingFor` wraps `lightingBase`: snow = paler/denser fog, exposure
  ×0.8 night/×0.9 day, beams ×0.35, no haze; snowy turf colour 0.5 at night
  (full albedo bloomed the frame white). Orange ball in snow. Tufts: blade
  fans instead of cards, scaled by grass length/density, none in snow, and
  the back-face normal flip fixed (black specks close up). Goal styles
  change NET_DEPTH (2.0 / 2.7 / 2.25) and REAR_H (0.72 / 0.94 / 0.3 ×
  bar). LED boards cycle to a scrolling home-colour run every 30 s (7 s)
  and through a goal; the near run has a 4 m gap for the tunnel.
  Crowd: away block `along` 0.72–0.86 (community 0.60–0.66) ~90 % away
  colours with empty segregation rows either side; `sectionOf` follows;
  flags on poles and scarves (`uScarf`, up at kick-off and goals);
  `m.crowdStir` (set by play.js on post/save/shotWide/foul) lifts the
  crowd; divots painted from `m.divots` (slides and fouls); sell-out when
  `match.venue.bigGame`.
- **`js/game/groundDressing.js`** (new): corner flags (CPU-waved, wind by
  weather/class), dugouts + dashed technical areas, telescopic tunnel,
  ballboys, stewards, crouched photographers, camera crews, rail/banks/
  perimeter fence + hedge at small grounds, side floodlight masts (never on
  the camera side except the corners), suburbs (houses, roofs, trees),
  puddles (rain intensity > 0.62), snow piles + flakes, half-time
  groundstaff and six sprinklers (not in rain/snow/frost), flares (additive
  points, lit at a goal in the away block and home end). `update(m, dt,
  cam)` from the render loop; disposed with the renderer.
- **Weather**: `atmosphereFor(seed, force, {month, warm})` — Dec–Feb: snow
  1 in 9 (hash byte 4, so old rolls are unchanged), frost on clear winter
  nights, never in the desert; `force.frost` honoured. `WEATHER_LABEL.snow`.
  play.js derives month/season fraction from the Career week (Aug→May) or
  today's date, passes `seasonWear`, `bigGame` (showpiece/final/two ≥84
  sides). Kick Off gains Snow.
- **Audio**: crowd ooh on the woodwork and near misses, boos on fouls and
  cards; chants `winning` / `losing` / `level` chosen by the scoreline.
- **Walkout**: the sides walk out of the tunnel in pairs for 4.2 s, camera
  at the tunnel mouth, then the old line-up pan.
- **Career**: promotion from a second tier grows the ground a level free
  (`builder.growOnPromotion`, `ground.promoted`), shown on the Career
  ground panel; Career home games always use the club's own (default or
  designed) ground so growth is visible.
- **Grounds gallery** (`screens/stadiums.js`, route unchanged): class
  filters, stats (capacity, opened, record, floodlights, goals, mowing,
  outside, roof), Orbit/Fly camera (drag look, wheel/pinch move, WASD Q/E,
  Shift fast), snow and a winter-night toggle.
- **Tests**: `tests/unit/grounds.test.mjs`; `tests/visual/r8-shots.mjs`
  (look-see of every new feature, not in CI).

### v77 — cameras and bug bash (Round 7)
**Sweep re-baselined deliberately** (seed 12345: goals 2.15 → 2.12, conversion
16.6 % → 16.3 %; seed 777: goals 2.10 → 2.05) — the posts are now solid
(swept collision), so shots that used to pass through a post now rebound.
- **Camera rig** (`js/game/camera.js`, new): presets `broadcast` (default),
  `tele`, `coop`, `dynamic`, `pro`, `e2e`, `tactical`; settings
  `{preset, height 0.6–1.6, zoom 0.7–1.4, angle −15..15}` saved in
  `settings.camera` (`cameraSettings()` clamps). `smoothDamp` is the closed
  form critically damped spring (no overshoot); focus has look-ahead (ball
  velocity + 4.5 m towards the attacked goal) and a dead-zone box; auto zoom
  from the 8th-nearest player to the ball. Dynamic/Pro follow the
  controlled player through their own 0.35 s spring (a switch of player
  used to teleport the camera 6.5 m in a frame); body speed capped 45 m/s.
  Modes play / kickoff / corner / freekick / penalty / throwin / goalkick /
  celebrate; a mode change lengthens the springs for ~1.1 s (the blend).
  Celebration orbits `m.celebrant` from the current bearing.
  `directReplay(clip)` picks 2–3 passes from 0 pitchside, 1 behind goal,
  2 aerial, 3 reverse, 4 goal-line, 5 keeper's eye (`render3d.replayAngle`).
  `window.__apexCam` exposes the rig (`modeTime` is match seconds in the
  current mode — the regression shots wait on it, not the wall clock).
- **Collision**: `venueBounds(def)` + `collideCamera` — stand faces are
  full-height walls (convex legal space: a camera allowed over a small
  stand's roof snapped 25 m when it came back down), goal volume exited
  through the nearest face, near-side boards z ≥ 1.6, z ≥ 0.35. Photo mode,
  the half-time orbit and replays go through it too.
- **UI**: Settings camera segment + three sliders + reset; match HUD 🎥
  button and the V key cycle presets with a toast.
- **Bugs found and fixed**:
  1. Ball through the post (`sim.js hitFrame`): sampled test vs a 44 cm band
     at 0.3–1.2 m/frame, and the goal line judged 40 cm short of the post →
     dead-centre shots passed through, shots overlapping the post by ≤15 cm
     scored without touching it. Now swept along last→current position
     (`b.px/py/pz`, extended to the line when the frame crosses it).
  2. Phantom crossbar: any ball at bar height within 1.4 m in front of the
     goal bounced down. Now only a path crossing the goal line.
  3. v76 crown buried ball/players/tufts by up to 25 cm mid-pitch and lifted
     the goal mouth 16 cm up the posts: `surfaceAt(x,y)` in renderGL lifts
     ball, procedural rigs (`rig.groundZ`), GLB roots, tufts, markers; the
     crown tapers to 0 over the last 9 m before each goal line.
  4. Roulette (`rig.js`): the group was rotated about the world origin, so
     the figure swung across the pitch for 0.7 s. Now pivots on the player.
  5. The controlled-player marker showed over goal celebrations, half/full
     time and replays.
  6. Small phones: grid `1fr` tracks grew to content width, so Today,
     Weekend League, Kick Off, the builder and the menu rail ran off 320–390
     px screens; the Ultimate XI dock overflowed at 320 px.
  7. RTL: `[dir=rtl] .hub` two-column rule outranked the phone layout and
     pushed Arabic players' menu tiles off the left edge (now ≥761 px only).
  8. Save: a save with a non-array collection/line-up crashed at start (the
     repair ran outside the try); cloud saves skipped the objectives/bench/
     SBC/Light-figures repairs (`repairSave()` now shared); the WebGPU
     renderer choice is now per device like quality.
  9. CI: the Ultra black-patch scan timed out on v76 (screenshots past 30 s
     on SwiftShader) — fixed on main as a hotfix; the scan was clean.
- **Found, not changed (Round 9)**: AI play almost never puts the ball out
  for a throw-in (0 in 4 matches, v75 too) and goal kicks are rare; passes
  target 4 m inside the lines and players clamp at 0.5 m. Restarts are
  correct when they happen (directed test). Changing it moves the balance,
  so it belongs to the gameplay round.
- **Tests**: `tests/unit/camera.test.mjs` (spring, collision, director,
  every preset × every ground incl. custom min/max, 150 s AI match each, no
  frame jump > 2.5 m); `tests/unit/sim-invariants.test.mjs` (8 seeded AI
  matches, every-frame invariants + directed restarts); two new state tests.
  `tests/visual/camera-shots.mjs` (7 presets + 5 set pieces × forge,
  bramble: not black, pitch share, rig mode) and `tests/visual/layout-scan.mjs`
  (12 screens × 320/375/390 × en/ar: sideways scroll, off-edge, overlapping
  buttons) run in CI and upload screenshots as the `visual-regression`
  artifact. `tests/visual/venue-matrix.mjs` walks all 112 grounds rotating
  tier × time × weather (too slow for CI; run by hand).

### v76 — pitch depth, goals and nets, aggressive AI
**Sweep re-baselined deliberately** (seed 12345: goals 2.13 → 2.15, shots
12.30 → 12.93, on target 9.58 → 9.90, conversion 17.3 % → 16.6 %) — the AI
now tackles by temperament, which changes every contested ball.
- **Aggression** (`sim.js`): `aggressionOf(ref)` per player (physical +
  defending − dribbling, +0.16 for defenders, −0.4 for keepers, ±0.12 seeded
  wobble; defenders ~0.6–0.9, forwards ~0.3); `Match.aggressionOf(p)` adds a
  chase term when behind (up to +0.3, growing late) and halves after a
  booking. AI commit distance `1.9 + 1.5·agg` m, rate `(0.75 + 1.4·agg)·
  skill·press·dt`. Foul chance `(0.1 + 0.28·agg)·frac²`. On a foul the
  fouled man gets `downT = downMax = 1.1 + 0.9·frac` (ticked every frame
  whatever the phase — a foul goes straight to a set piece, and a timer
  that only ran during play left him lying through the free kick; cleared
  on every reset), a push in the tackle direction, and a yellow when
  `frac > 0.82` (`bookings`, cue `card`, commentary). 120 AI matches: 0.41
  penalties / 2.9 fouls per match before the last ease, ~0.3 after.
- **Falls**: `rig.js poseDown` (prone along the facing, arms out, gathers
  and rises over the last 28 %), `playerModel.js` tips `root` flat
  (`rotation.x`, `position.z`) or plays a `down`/`fall` clip if the asset
  has one; `drive()` refuses a man who is down.
- **Pitch** (`renderGL.js`): two mow greens a real step apart
  (`#3d9a4e` / `#1c6530`); one turf shader hook for every tier — the stripe
  lie tilts the normal per band in view space (`uStripe`), a 3–6 step
  parallax march through a blade height map (`turfDetail` now returns
  `{normal, height}`; `uPara` in blade-map uv) with trough shading; the
  pitch plane is subdivided (52×34 Low … 210×136 High+) and displaced — a
  16 cm crown plus three octaves of undulation, lifted +9 cm so the hollows
  never dip under the apron (they did: a black organic patch), apron
  lowered to −6 cm; crossed-card grass tufts (10k Medium / 18k High / 30k
  Ultra) with sky normals (vertical cards lit from above were black),
  shrinking continuously with distance from `uEye` (a full-size plateau
  made a carpet with a visible ring). `customProgramCacheKey` is a plain
  string — capturing three's default off the material loses `this` and
  threw every frame. No backticks in GLSL comments inside template
  literals (it closed the literal).
- **Goals**: posts/bar radius 0.06 → 0.105, rear uprights, ground stays,
  sloping top rails and a rear bar (`REAR_H = 0.72·GOAL_H`); the curtain
  hangs from the rails with a belly; a separate roof cloth pinned round
  the frame with a 12 cm sag; a strike impulses every net at that goal.
  `net.js`: home pull 0.06 → 0.012, drag 0.978, gravity −11, constraints
  pull at 0.5 when stretched and 0.12 when slack.
- Not done: the camera can sit inside a stand (seen behind the goal) — the
  next round's camera collision.

### v75 — Kick Off by country
- **`data/countries.js`**: `COUNTRIES` (56, strongest first: Spain … India;
  `rank` 1-based), each with real clubs `{id: 'kc-<country>-<short>', name,
  short, colors, shape, country}`; `INTERNATIONAL` pseudo-country =
  `internationalTeams()` (every `nations()` XI, 67). `clubSquad(club)` deals
  a country once and caches: career-curated squads (`squadOf(careerId)`)
  for clubs whose name matches a `CAREER_CLUBS` entry, topped up by position
  from the country's pool then free agents (the PSG career file has no
  keeper); every other club gets the country's players (excluding
  Icons/Stars/SBC) dealt round-robin by position group (needs GK 2 / DF 6 /
  MF 6 / FW 4), thin countries borrow the free agents nearest 60 overall,
  and the dealt clubs are **scaled on copies** to `target = 85 - 0.52·rank
  - 1.5·clubIndex` (k clamped 0.72–1.12) so the list runs Spain 84 → India
  56. `clubSheet` (ATT/MID/DEF/OVR, stars `(ovr-56)/6`, talisman),
  `matchSquad` (the custom squad the match takes; crest = solid in club
  colours). No player appears at two clubs of one country.
- **Wave 7** (`tools/real-players-wave7.json`, 85 kept after the
  accent-insensitive dedupe): free agents on `WORLD_SEED ^ 0x7d7d75`
  rated `around(64, 7)`, nation from the list. World 6413 players.
- **Kick Off screen** (`quickmatch.js`): `pick.home/away = {country, idx}`;
  country row (◀ flag select ▶), team card with ◀ ▶, a rail of the
  country's badges, h2h; Randomise picks a country and a team per side;
  the two sides cannot be the same team; the match is launched with
  `homeSquad/awaySquad` custom squads (world ids only anchor the pitch).
  `.teamsel` aligns `start` (a 67-flag International rail used to push its
  card up).
- Tests: `tests/unit/countries.test.mjs` (≥50 countries, order, unique ids,
  every club 11 real names with a keeper and no duplicates within a
  country, ratings downhill, International has France/Spain/Saudi
  Arabia). Headless: `tests/tmp/kickoff-check.mjs` (select, cycle, India
  v England national team to kick-off, phone layout).
- Not done: real ground names per club (the venue is dealt by rating and
  colours as for any custom squad); the World screen's fictional 100-club
  pyramid is unchanged and still what Career V1 fixtures and the sweep run
  on.

### v74 — tiers, phones, the ground in Kick Off
- **Tiers** (`render3d.js`, `settings.js`): the menu offers Auto / Low /
  Medium / High / Ultra on desktop and tablet; internally Ultra is the
  `cinema` tier (the old `ultra` is gone from menus; `resolveQuality` maps
  a saved `'ultra'` → `'cinema'` and `'min'` → `'low'`; Auto on a weak
  device can still land on the internal `min`). `deviceClass()` = phone
  (touch, shorter screen side < 600 CSS px) / tablet / desktop. A phone
  sees Performance (`medium`) and Fidelity (`cinema`) only, and Auto on a
  phone is Medium. **Developer unlock**: the faint dot under the last
  Settings panel (`#devDot`) asks for a code; `549999` sets
  `sessionStorage['apexxi.devUnlock']` and every tier appears until the
  tab closes; clicking the dot again locks it. The code is in
  `settings.js` (`DEV_CODE`) — it is a convenience gate, not security.
- **Camera**: `camera.fov = hfov / min(max(1, aspect), 16/9) * 1.45` in
  both renderers — on a 19.5:9 phone the vertical field used to shrink to
  32° (a zoom); it now stays at the 16:9 value and shows more of the sides.
- **Rotate hint** removed (index.html, app.js, `portraitOk`). Every screen
  works in portrait.
- **Venue** (`play.js venueOf`): the designed ground is used for Ultimate
  XI, Career home games and any offline Kick Off with the human on the home
  side (`humanHome`), unless `params.venueId` claims the venue; named after
  the player's identity when no custom squad is home.
- **Builder on phones**: preview at `low` (a rebuild per change at High
  exhausted iOS GPU memory → Safari reloaded the page = "the game
  restarts").
- **Manager**: a GLB whose materials have no map and a white colour is
  dropped and the suit rig stands in (the white figure reported was the
  model with its textures refused by the pre-v73 CSP).
- **FPS readout**: just the number; the draw/prog/tex fingerprints stay in
  the console.
- Verified headlessly (`tests/tmp/v74-check.mjs`): phone tiers, wrong and
  right code, desktop tiers, the Kick Off venue name, the FPS text, the
  iPhone match framing; `mgr-check.mjs` renders a career match with the
  textured manager model.

### Round 7 (v73) — gameplay feel, SBC, packs, cards, phone fixes
**Sweep re-baselined on purpose** (`tests/golden/sweep-*.txt`, `node
tests/sweep-check.mjs --update`): the user asked for the ball to climb and
bend and for skill moves, which changes every AI shot. Before → after on
seed 12345: goals 2.10 → 2.13, shots 12.73 → 12.37, on target 9.50 → 9.58,
conversion 16.5 % → 17.3 %, crosses 1.85 → 2.48. The first calibration
(curl `k = curl·sp/20`, curled loft 1.35) sank goals to 1.73 and put a
finesse shot 8 m in the air; the shipped values are `k = curl·sp/58`, decay
`0.5^dt`, human curl 46 with loft 0.9 and +1.2 lift, AI curl 30 on 40 % of
shots from range. Probe (`tests/tmp/physics-probe.mjs`): full-power shot
peaks 3.25 m, finesse 3.4 m, chip 2.96 m over 1.2 s.

- **Sim** (`game/sim.js`): `shoot()` takes `chip` (speed 13–19, rise
  7.5–10.5); lift `(1.3 + 8.2·power)·loft`; air drag 0.9985/frame;
  dribble push `0.8 + 0.26·speed`; `skillMove(p, aim)` picks feint /
  stepover / roulette / nutmeg from the stick direction and a defender
  within 2.2 m ahead, fails on `rand > 0.5 + 0.5·dribbling` (heavy touch,
  stumble), sets `skillKind`, `spinT` (renderer spins the figure — rig.js
  `grp.rotation.z`, playerModel.js `root.rotation.y`) and `burst`
  (applied when its timer runs out). AI chips when the keeper is off his
  line (`gkOut`). Input: shoot + `lob` held = chip; shoot + `curl` held =
  finesse.
- **Renderer**: rim light (behind the far stand, 1.1 at night) + fill
  (camera side, 0.42) for the figures; rig materials `envMapIntensity
  0.55`; wet pitch `uWet` 0.34 → 0.16, cap 0.28 → 0.13, wet roughness 0.74
  → 0.8, envMap 0.6 → 0.45. **Crowd**: `aCrowd` is now vec3 (phase, along,
  section: 1 home end / 0 away corner / 0.5 neutral — same ranges as
  `sectionCol`); `uSide` = who scored (set on the goal phase from the score
  change); each seat rises on its own `stagger`, half the seated stand up
  (`aCrowd.x < 0.55`), the other end sits still; heads turn on a slow
  phase (`apexCrowdHead` program). `useModels` is High/Ultra/cinema only — Medium with the
  scanned models measured 2.5M tris / 202 textures and p95 1493 ms against
  the figures' 660k / 983 ms, so the tier keeps the figures; the Light
  figures *option* is gone (settings row and
  `MODEL_NOTE` removed; `loadState` migrates `models: 'simple'`).
- **CSP bug**: `connect-src` lacked `blob:`, so GLTFLoader's texture
  fetches were refused (16 console errors per match in the headless run;
  on the live site the scanned models may have fallen back). Fixed in
  `server/server.js`. gl-scan/gfx runs are clean after it.
- **Phones**: rotate hint has "Continue in portrait" (`portraitOk`, per
  session); `.gm-hud`, `.gm-emotes`, `.gm-queue`, `.photo-bar`, `.tpad`
  respect `env(safe-area-inset-*)`; `.gm:fullscreen` uses `100dvh`.
  **Photo mode**: `.photo-exit` (fixed, top-right, z 60 — the canvas
  intercepted clicks below 40), Esc/Backspace and the pause input close
  it; `closePhoto` is idempotent. Verified headlessly on an iPhone-sized
  page (`tests/tmp/phone-check.mjs`).
- **SBC** (`data/challenges.js`): `group` field + `GROUPS` (starter /
  standard / legend), `groupOf`, `sizeOf(c)` (the size requirement or 11)
  — the tray, the cap and the button read it; twelve quick SBCs (2–7
  cards, repeatable), sixteen legend SBCs paying `SBC_LEGENDS_2`
  (generator.js, stream `WORLD_SEED ^ 0x5bc6`, appended after wave 6 so
  every existing id is untouched — `sbcCards` is 28). Zidane, Maldini,
  Buffon, Cafu and Roberto Carlos were already Icons, so Totti, Cannavaro,
  van der Sar, Thuram and Zanetti stand in. i18n `nav.challenges` = "SBC".
- **Packs** (`data/packs.js`): `filterOf` takes `maxAge` and
  `nationOfWeek` (`nationOfWeek()` rotates 12 nations weekly; the shelf
  shows which); nine packs added (fodder, youth, defence, midfield,
  premier, nations, mega 12, wonder); `samplePulls(pack, n, day)` — three
  deterministic cards a pack could hand you, shown under every pack, in
  the event shelf and on Today.
- **Wave 6** (`tools/real-players-wave6.json`, 700 kept after an
  accent-insensitive dedupe — 'Kylian Mbappe' vs 'Kylian Mbappé' had
  slipped through the exact-match dedupe): 700 free agents on
  `WORLD_SEED ^ 0x6c6c73`. World: 6328 players, 3286 free agents; first
  5612 pinned (generator test).
- **Cards where there was text**: `playerCard` size `showcase` (six-stat
  row `.pc-row`), `cardStrip(players, {size, cls, boost})`,
  `components/packArt.js` (`packArt(idOrPack, {size: xs|sm|md, label})`
  reusing the store's `.sp-art`). Used on Today (event featured card +
  pack pulls, objectives), SBC list (legend as a card + pack art), store
  ("Could pull"), weekend ranks, world tables ("stars of the division")
  and nation XIs.
- **Builder**: designs per target — `target` 'club' (`club.stadium.design`)
  or 'career' (`career.ground.design`, career club colours/name);
  `navigate('builder', { target: 'career' })` from the Club tab; play.js
  reads the career design for career fixtures. Bug fixed: a local `t`
  (orbit clock) shadowed the i18n `t` and crashed on any change.
- **i18n**: builder and social panel strings (EN/AR, ~50 keys).
- **WebGPU match renderer (beta)** (`game/renderGPU.js`): r170
  WebGPURenderer, `createRenderer` is async; pitch canvas with markings,
  goals, bowl from the def (tiers/roof/seats/facade), static instanced
  crowd + empty seats, capsule figures with leg swing and the roulette
  lean, ball, hemisphere/sun/rim/spot lights with shadows, fog, ACES. No
  grading/god rays/haze/reflection/trample/tifo/wonders/scanned models —
  the GLSL passes still need a node-material port. Opt-in:
  `settings.renderer === 'webgpu'` (Settings seg "WebGPU (beta)"); on a
  browser without WebGPU it runs on the renderer's WebGL2 backend, which
  is how it is verified headlessly (`tests/tmp/gpu-match.mjs`). Known:
  the night look is too bright (exposure/hemisphere not yet matched).
- **Verification**: 90 unit tests, sweep (re-baselined), smoke, QA bot,
  headless screenshots of Today/SBC/store/weekend/world/nation/builder,
  iPhone portrait + photo mode, WebGPU match.
- **Frame cost, SwiftShader 844×390** (p95; ratios transfer, absolutes do
  not): min 250 ms (323 calls, 98k tris) · low 1033 ms (348, 232k) ·
  medium 933 ms (1013, 660k, figures) · high 1733 ms (448, 2.8M, scanned
  models + 202 textures) · ultra 3317 ms (498, 4.0M) · cinema 3958 ms.
  Medium is unchanged from v72 (983 ms) within noise: the crowd per-seat
  math and the two extra lights cost nothing measurable. High is up from
  1200 ms because the scanned models are now on by default there (the
  benchmark used to run the figures); with the models on Medium it was
  1493 ms, which is why Medium keeps the figures.
- Not done / next: WebGPU parity (node-material ports of the turf, crowd
  and cinematic passes; night exposure); per-club designs in Career are one
  per career, not per club changed by `takeJob`; i18n for career prose;
  the watch has no SBC view; the Season Pass tier tiles still name packs
  as text.

### Round 6 (v72) — Stadium Builder, a hundred clubs, World Tournament, graphics, social
**Sweep byte-identical.** First 3092 cards pinned unchanged (generator test).
90 unit tests, sweep, smoke, QA bot (now with a spectator and an emote) all green.

- **World** (`data/pools.js`, `data/generator.js`, `world.js`): wave 5 = 40
  blueprints with an explicit `division` (1–8; `DIV_BASE` budgets), stream
  `WORLD_SEED ^ 0x5a5a72`, 28+1 cards a club + 1400 free agents named from
  `REAL_PLAYERS_WAVE5` (4141; `tools/real-players-wave5.json`). `LEAGUES` has
  eight (Highland, Lowland added); division sizes 12,12,12,12,13,13,13,13 —
  odd divisions get a bye per round (`roundRobin`), `ROUNDS = 26`. Totals:
  100 clubs, 5612 players, 2526 free agents. `clubWorldCup(season, played)`
  (CWC_DAYS 20/22/24, eight entrants); `worldTournamentDraw(edition)` (32 of
  the 51 nations, four pots, eight groups) and `worldTournament(edition)`
  (groups → R16 → final), every fourth season (`WT_EVERY`).
- **Playable World Tournament** (`js/tournament.js`): `club.tournament`
  state `{edition, nation, groups, stage, fixtures, otherGames, knockout,
  bracket, out, champion}`; `start(nation)`, `nextMatch()`, `groupTable()`,
  `onResult(scored, conceded)` (25,000 apex + a special pack for the title),
  `matchParams()` plays at the wonders (`showpiece: 'wonder'`). World screen
  tab 9; play.js prints the `tourney` line on the end card and quits back to
  `world` tab 9.
- **Economy** (`js/economy.js`): `kindOf(p)` = position group × rating band;
  `supplyIndex(kind)` from world want-vs-have (damped, 0.6–1.8);
  `demandIndex(kind)` from `club.market.{buy,sell}` tallies with a 12-hour
  half-life (decays on read); `price(p)`, `trade(p, side)`, `report()`. Wired
  into pack duplicate value, squad sells, pack opens, and career asking prices.
- **Stadiums** (`data/stadiums.js`): 40 more club defs (112 total), eight
  wonders (`wonder: true`, some `retractable`; `WONDERS`), `nationalStadium()`
  for national XIs; `stadiumFor(club, { showpiece: 'wonder' })`.
- **Stadium Builder** (`js/builder.js`, `screens/builder.js`): a design is
  `{suffix, capacity 5k–100k, tiers 1–3, bowl, roof, pylons, pattern, seats[2],
  facade, facadeStyle, landscape, lettering}`; `normalise`, `toDef(design,
  {clubName, short, capacity, fill})` → a stadium def with `lettering`,
  `landscape`, `facadeStyle`, `custom: true`; `encode`/`decode` share codes
  (`SB1-XXXX×6`, base31 without lookalikes, checksum; **no text in the code**
  — the receiver's own club name goes in the seats). State
  `club.stadium = { design, saved[≤8] }`. The screen rebuilds the real
  renderer on every change (debounced 260 ms; Ultra/cinema capped to High for
  rebuild speed) on a wide orbit. Entry points: Stadiums showcase ("Design
  your own"), the Ultimate XI identity editor, the Career Club tab.
  **Venue**: `play.js venueOf` uses the design for Ultimate XI home matches
  (`params.ultimate`, not online) and Career home fixtures, where capacity is
  the expansion level. **Career**: `GROUND_LEVELS` 15k→100k in eight steps,
  `expansionOffer(car, pos)` — the board pays when `pos <= board.finish` and
  patience ≥ 0.55, else the club pays from coins; one expansion a season
  (`car.ground = {level, income, expandedSeason}`); `bankGate(car)` on every
  home league match = capacity × fill × `TICKET` (42), `groundFill` 0.74 +
  0.03/level. Club tab "The ground" panel. Tests `tests/unit/builder.test.mjs`.
- **Renderer** (`renderGL.js`): `lightingFor` returns `grade` (lift/gamma/
  gain/saturation/temperature per time-of-day → `cine.setGrade`), `haze`
  (three additive planes at night), `godrays` (radial-blur ShaderPass toward
  the projected sun on clear dusk, High+); `cinema` tier (Ultra + 2.5–3×
  ratio, DOF, stronger god rays; Settings "Ultra+", desktop only); crowd arms
  InstancedMesh at Ultra (`apexCrowdArms`); trample canvas as `turfMat.bumpMap`
  (High+); `bootFx` dust/splash particles; **weather turns**: `atmo.change =
  {minute, to}` set by `venueOf` for ~25 % of matches (seeded) → `weatherStep`
  lerps `rainLevel` over 30 s (rain mesh, turf roughness/envMap, fog);
  wonders: giant screens (canvas score/clock), LED ribbon, retractable roof
  slabs (close when `rainLevel > 0.3`), pyro at kick-off and goals; faces on
  the simple rig (`eyeL/eyeR/mouth`, mouth opens on celebrate); **builder
  support**: `tiers` up to 3 (`SPLITS`, `GAP_D/GAP_Z` totals), seat lettering
  mosaic on the far top tier + a lit name sign under the far roof, landscapes
  (city towers; coast = sea plane + lighthouse + towers on one side; mountains
  = 14 cones on a 520–720 m ring; desert = dunes + palms), facade styles
  (glass/brick/mesh change the shell material). Replay afterimage passes are
  off unless `setReplay(true)`.
- **WebGPU** (`js/game/gpu.js`, `js/vendor/three.webgpu.js` r170, 1.68 MB,
  lazy, not precached — release SKIP list): `pickRenderer()` → 'webgpu' when
  `navigator.gpu` gives an adapter and `settings.renderer !== 'webgl'`; the
  **menu hero** uses it (`menuHero.js startWebGPU`, `canvas.dataset.api`);
  the match renderer stays WebGL2 (its custom GLSL passes would need a TSL
  port — that is the next graphics job). Settings: Renderer seg auto/WebGL.
- **Social** (`server/store.js`, `server/server.js`, `screens/online.js`):
  `db.guilds`; routes `/api/guild` (GET view; POST create/join/leave/claim),
  `/api/guild/board`, `/api/friends` (GET; POST add/remove), `/api/live`.
  `GUILD_OBJECTIVES` wins 15 / goals 40 / matches 30 per `weekId()`, tallied
  in `recordResult` from validated host results (both sides count when both
  are members); `claimGuildObjective` → `{reward: {pack, apex, title}}` which
  the client `pend`s. WS: `invite {to}` (friends only; the lobby code is all
  that travels), `spectate {matchId}` (≤8 per match; host's `snap`/`evt`
  copied, nothing a spectator sends is relayed), `unspectate`, `emote {id}`
  (`EMOTE_IDS`, rate-limited; to the opponent and spectators), and
  `spectators {n}` to the host. **Client**: Guild and Friends cards, Live
  list, invite toast with Join, `spectating` → play with `online.spectate`
  (no sender, no P2P, no pause requests, no result, "Spectating" badge, "Back
  online"); emote button in the HUD (`js/data/emotes.js`, 8 ids, EN/AR text —
  the only thing players can say to each other); **clip export**: "Save
  highlights as a clip" records `canvas.captureStream(30)` with MediaRecorder
  through the highlights reel and downloads a WebM. **Bug found by the QA
  bot**: a match that had gone browser-to-browser sent no snapshots through
  the hub, so spectators saw nothing — the host now copies snapshots up while
  `spectators > 0 && p2pActive()`. Tests `tests/unit/social.test.mjs` (real
  server, three sockets). i18n is untouched for the new screens (English).
- **Watch**: `.w-venue` thumbnail + ground name on the match card; guild
  objectives on the Club glance (`store.guild()`, 60 s cache); bundle rebuilt.
- **Perf**: gl-scan dusk + night clean (0 black pixels).
- **Frame cost, SwiftShader 844×390** (software GL; ratios and scene counts
  are what transfer): min p95 283 ms (323 calls, 98k tris) · low 933 ms (348,
  232k) · medium 983 ms (1013, 660k) · high 1200 ms (1028, 940k) · ultra
  4166 ms (1078, 2.1M) · cinema 5600 ms (1078, 2.1M, DOF + god rays at 2.5–3×
  ratio). Rain: medium 967 ms (1014) · ultra 3583 ms (2150 calls, 4.2M — the
  reflection pass doubles the scene) · cinema 8337 ms (2159, 4.2M). Against
  v71, Medium is +6 % draw calls / +2 % triangles and the same frame time
  within noise — the boot particles and trample map are High+, faces are
  High+ (gated this round), god rays and haze are High+. Cinema costs 29× min
  in the clear and 14× Medium in the rain; it is desktop-only by design.
- Not done / next: match renderer on WebGPU (TSL port of the turf/crowd/cine
  passes); per-seat crowd is still the instanced sway + arms (no individual
  seated→standing animation); the builder's designs are per save, not per
  career club; guild chat is deliberately absent (emotes only) and stays so;
  spectators of a `direct` match cost the host one extra upload stream.

### Round 5 (v71) — scale, spectacle, polish, QA bot, Arabic, onboarding
**Sweep byte-identical.** First 2052 cards pinned unchanged (generator test).

- **Scale**: 20 more blueprints (`wave: 4`, Pioneer/Grassroots Leagues),
  `LEAGUES` has six; wave-4 stream `WORLD_SEED ^ 0x4b4b71`, 28 cards a club +
  480 free agents, named from `REAL_PLAYERS_WAVE4` (1044 after dedupe;
  `tools/real-players-wave4.json`, build script `WAVE4`). World: 60 clubs,
  3092 players, 1126 free agents. 20 more stadium defs (64 total).
- **world.js**: `continentalCup(season, played)` — last season's top eight
  (blueprint order in season 0), QF/SF/F on days 6/12/17 (`CUP_DAYS`), pens by
  hash; `nations()` — every nation with a full 4-3-3 from the pool (Icons/SBC
  excluded), rated, cached; `nationSquad(nation)` → a playable custom squad;
  `nationsCup(season, played)` on `BREAK_DAYS` 8/9 for the top eight;
  `honours(now)` — champions per division + cup winners for the last 12
  seasons. World screen tabs 6 (cup), 7 (nations), 8 (one nation: XI +
  friendly picker). Trophy Room opens with the Hall of Fame (Icons + honours).
- **Renderer (renderGL.js)**: exteriors (instanced facade blocks + lit
  glazing on three sides) and a skyline (60/90 towers on a 260–380 m ring,
  far half only); tifo mesh over the far lower tier (`gl.tifo(up)`, fades at
  26–29 s); crowd colours by section (`sectionCol`: far centre + left = home,
  0.64–0.71 = away corner); pitch wear (21×14 tally of ball position, painted
  every 30 s of play into the colour canvas); planar reflection at Ultra when
  wet (mirror camera → half-res RT, mixed in the turf shader by fresnel ×
  `uWet` 0.34, capped 0.28 — 0.55/0.6 was a mirror); fireworks/confetti Points
  (`gl.fireworks(seconds)`, 700/1400 particles); cloth on simple-rig shirts at
  High+ (`rig.cloth` uniform = speed); replay blur = afterimage ShaderPass
  pair (`afterimage.damp` 0.55 while `gl.setReplay(true)`, DOF raised too);
  `gl.snapshot(match, cam, cssFilter)` → PNG blob via a 2D canvas.
- **play.js**: `walkout` (7 s wall-clock, `lineUp()` both XIs on the halfway
  line, `walkoutCamera`, `startAnthem(seed)`, tifo up; skipped online / guest /
  reduceMotion — the smoke and QA suites run with reduceMotion); half-time
  show = `orbitCamera` while paused at half (not career); `photo` mode from
  the pause menu (orbit by drag, wheel zoom, six CSS filters, Save PNG, Done);
  fireworks at full time when `params.final || weekend || showpiece`; sim cues
  set `p._act/_actT` so scanned models play kick/tackle/header one-shots
  (`playerModel.js` ACTIONS + `ONE_SHOT`, sprint lean on `root.rotation.x`);
  `window.__apexMatch` exposed right after construction (QA bot winds the
  clock: set `half = 2` and `t = duration − 0.6`, or the sim calls half time).
- **audio.js**: `startAnthem(seed)/stopAnthem()` — saw-stack chords, brass
  melody, timpani, crowd swell, ~10 s, key and shape from the seed.
- **render3d.js**: `orbitCamera(cam, t, radius, height, speed)`,
  `walkoutCamera(cam, t, dur)`; `kitColours` uses `kits.js`.
- **kits.js**: `clash(a, b, vision)` with Machado-style deutan/protan/tritan
  matrices; `pickAwayHex(home, awayColors, vision)`; `match.vision = 'all'`
  when `settings.colorSafeKits`.
- **Stadium showcase** (`screens/stadiums.js`): builds a still `Match` for
  the club and runs `createRenderer` with an orbit; time/weather segments
  rebuild the screen; "Play here". Linked from Kick Off.
- **i18n** (`js/i18n.js`): `t(key)`, dictionaries EN/AR (~130 keys: menu,
  Today, Kick Off, World, Trophies, Stadiums, Settings accessibility, pause
  menu, end card, photo, squad dock, onboarding, guide steps); `applyLanguage`
  sets `lang`/`dir`/`.rtl`/`.large-text` (called from `applyTheme`). RTL CSS
  under `[dir="rtl"]` (hub mirrored, hero on the left, tables). Deep screens
  (career prose, commentary, patch notes, settings body) stay English — the
  next pass is to route them through `t()`.
- **Settings**: Accessibility section — Language, Larger text (`html.large-text`
  118%), Colour-safe kits, Reduce motion (moved here).
- **Onboarding** (`js/onboarding.js`): `needsOnboarding()` (no `flags.onboarded`,
  no tutorialDone, empty collection); `dealStarter()` 16 free agents 68–80 into a
  4-3-3 lineup + bench; welcome overlay from the menu; guided match
  (`params.guided`, `GUIDE_STEPS` six lessons on `#gmHints.guide`, advancing on
  the input); `finishOnboarding` pends two rewards and lands on Today.
- **QA bot** (`tests/qa/bot.mjs`, `npm run test:qa`, in CI): onboarding
  (skip path + guided match), Ultimate XI (gold pack, XI, division match to
  the end, ladder counted), career (manager → club → a whole season through
  `#simWeek`/`#acceptReview`/`#renewDone`, job offers if sacked), weekend
  (plays if the window is open, else renders), online (two contexts register
  via `api.register`, host lobby code → join → both reach kick-off and full
  time), watch. 2D path by default (`--gl` for WebGL); `--only a,b`; the last
  uncaught error's stack is captured via `window.__lastErr`. **Bug it found
  and fixed**: a sacked manager taking a job in another league crashed the
  career hub (`car.table[car.clubId]` undefined → "reading 'pts'") because
  `takeJob` never rebuilt the table/calendar for the new league — now it
  does (careerV2.js), with a regression test. Two false alarms were the bot's
  own (winding the clock in the first half calls half time; the season
  boundary is `acceptReview`, not `nextSeason`).
- **Perf**: see the report; Ultra now carries the reflection pass in rain
  (second scene render at half res) and the skyline/exterior instances.

### Big-budget round (v70) — stadiums, atmosphere, graphics, audio, menu, forty clubs
**Sweep byte-identical** (12345 and 777 unchanged from v69). Nothing in the sim
moved; the first 1112 cards are untouched (`tests/unit/generator.test.mjs`
pins both the 731-card hash and that no pre-v70 card changed club).

- **Scale** (`js/data/pools.js`, `js/data/generator.js`, `tools/build-real-players.py`,
  `tools/real-players-wave3.json`): 20 new blueprints tagged `wave: 3` in two
  new leagues (`LEAGUES` is now four; `club.division` = index + 1). Their
  squads (27 + a star each) and 380 more free agents are generated on their
  own stream (`WORLD_SEED ^ 0x3a7e70`) *after* the SBC cards and named from
  `REAL_PLAYERS_WAVE3` (1732 names after dedupe against the source list, the
  extra list, Icons/Stars and the SBC legends). World: 40 clubs, 2052 players,
  646 free agents. The Meridian deal filters `c.league === 'Meridian League'`
  now — the old `!== LEAGUE_NAME` would have dealt into the new clubs and
  moved cards. Third-division ratings top out around 78, fourth around 72.
- **Stadiums** (`js/data/stadiums.js`): 44 defs (`id, name, capacity, size,
  tiers, roof, bowl, seats, facade, pattern, pylons, fill`, four `showpiece`).
  `stadiumFor(club, {showpiece})`: world clubs by `ground` name; anything else
  by hash of id/name, sized by `level` 0..1, seats recoloured to the club.
  `atmosphereFor(seed, force)` → `{time, weather, intensity, wet}`; roughly
  62% night / 22% day / 16% dusk, 18% rain. `play.js#venueOf(params)` builds
  `match.venue = {stadium, atmo, label}` from the home side (custom squads →
  own ground by name; `weekend/online/final` → an arena); `params.atmo` forces
  time/weather (Kick Off has pickers); `params.atmoSeed` overrides the seed
  (default `home|away|dayIndex|careerWeek`). The loading veil shows the venue
  line; commentary `venue` uses the stadium name.
- **Renderer** (`js/game/renderGL.js`): `specFromDef(def, seed)` replaces
  `stadiumSpec` when `match.venue` exists (legacy path kept for the perf
  harness). `lightingFor(atmo)` → hemi/sun/fog/flood/beams/exposure; floodlight
  SpotLights are scaled by `flood` and not added at all by day; beams only at
  night/dusk. `skyTexture(atmo)` draws day/overcast/dusk/night. `mow(g, W, H,
  pattern, …)` shared by colour + roughness maps. Two tiers via `terraceAt(t)`
  (`TIER_SPLIT 0.55`, gap 2.2 m back / 3 m up) shared by terrace boxes, seats
  and crowd. Roof styles: cantilever (0.68 depth), ring/dome (0.86 + corner
  `RingGeometry` caps; dome adds a translucent rim), arch (torus over the far
  stand), `pylons: 'rim'` = lamp boxes along roof edges, no masts. Wet turf:
  roughness 0.74 / envMap 0.6 (0.58/1.1 blew the near corners out white — same
  failure the v6x comment warns about). Rain: one `LineSegments` of N streaks
  (1200/2600/4200/7000 by tier, none on min) wrapped in a 70×70×34 m box around
  the camera target by a time uniform. **Crowd animation**: the two instanced
  materials get `onBeforeCompile` with `uTime/uWave/uJump/uExcite` and an
  instanced `aCrowd` (phase, position-around-the-bowl); `customProgramCacheKey`
  is set so three does not share the program. Wave every 40–90 s of open play
  (11 s round), jump on `phase === 'goal'`. **Kit texture**: `rig.js#kitTexture`
  — torso cylinder u=0 faces forward (verified numerically), so the number is
  centred at u=0.5 with the name above; on every tier but min. `renderer.info`
  now accumulates across composer passes (`autoReset=false`, reset per frame).
- **rig.js**: `buildPlayer/buildFor/posePlayer/poseDive/kitTexture` moved out
  of renderGL.js unchanged so the menu can build a figure without the match
  renderer. renderGL imports them.
- **Quality** (`render3d.js#resolveQuality(setting, env?)`): five tiers
  (`min low medium high ultra`); `classifyGPU(name)` from
  `WEBGL_debug_renderer_info` → strong/mid/weak/unknown; Auto: strong desktop →
  high, strong phone → medium, mid phone → medium, weak → low, ≤2 cores/2 GB →
  min (or low on a strong GPU). Ultra is never automatic. `medium` in the
  renderer: pixel ratio ≤1.5, shadow 1024, terrace 11 rows / step 1.2, cine 5
  samples, no DOF. Realistic models on medium only if `settings.models ===
  'realistic'` explicitly. Settings has the Medium button + note.
- **Replays** (`render3d.js#replayCamera(cam, ball, goalX, t, angle)`): angle
  0 = old sweep, 1 behind goal, 2 high wide, 3 low reverse from the far
  touchline; `clip.angle = goalClips.length % 4`.
- **Audio** (`js/audio.js`): `startRain/setRain/stopRain` (hiss + patter bands,
  gusting LFO); `chant(kind, level)` (`clap`, `hum`, `goal`: clap noise bursts +
  four detuned saws through a vowel bandpass, one at a time via `chantUntil`);
  `announce(text)` via `speechSynthesis` (queued, en voice preferred, silent
  where unsupported), `silenceAnnouncer()`. play.js: rain when `atmo.wet`, PA
  welcome as the veil lifts (not online), chants every 28–58 s of open play and
  on goals, PA names the scorer; all torn down with the crowd.
- **Menu hero** (`js/menuHero.js`): `heroPlayer()` = best owned card (else the
  world's best); `mountHero(canvas)` lazy-imports three + rig.js after 700 ms +
  idle, skipped on reduceMotion or Auto→low/min; alpha canvas, turntable yaw
  ±0.55 rad, breathing; `disposeHero()` on unmount. ≥1000 px the hub gets a
  250 px right margin for the figure; below that he stands behind the tiles;
  ≤480 px hidden.
- **Cards** (`playerCard.js`, main.css): foil `::before` (conic rainbow +
  grating, `mix-blend-mode: screen`) on special/star/icon; one document-level
  pointer listener sets `--tx/--ty` and `.is-tilting`. Pack reveal: `.walkout-card
  .flipping` with a `.card-back` (rotateY 180 → 0). Touch: `(pointer: coarse)`
  raises seg/btn/tile min heights.
- **The World** (`js/world.js`, `js/screens/world.js`): `EPOCH_DAY` =
  2026-09-01, `ROUNDS 18`, one round per UTC day; `roundRobin(ids)` (circle
  method, then mirrored); `result(season, div, round, home, away)` = Poisson
  goals from a hash, expected 1.32+edge+0.22 home vs 1.18−edge with edge =
  Δrating/11; `composition(season)` applies 2 up / 2 down per finished season
  (cached; 40 seasons ≈ 80 ms); `worldState(now)` → divisions with table,
  today's fixtures, up/down zones, movers; `liveDivisionOf`. Cards/chemistry/
  SBCs keep the blueprint league on purpose. Screen: 4 tabs, table, today's
  fixtures with the ground and a Play button, last season's movers. Linked
  from Kick Off ("League tables") and a Today panel — **not** from the menu.
- **Kick Off**: rails grouped by division with a numbered tag; card shows the
  league and capacity; Kick-off (Auto/Day/Dusk/Night) and Weather
  (Auto/Clear/Cloud/Rain) segments.
- **Tests**: `tests/unit/round4.test.mjs` (stadium defs, hashing, atmosphere,
  round robin, result bias, promotion/relegation invariants, calendar, GPU
  classification, Auto tiers). `tests/perf/gl-scan.mjs` takes `--time
  --weather --home`. New `tests/perf/gl-fps.mjs` reports fps + draw calls +
  triangles per tier on SwiftShader (ratios, not absolutes — see the header).
- **Verified headlessly**: six stadium/time/weather/tier screenshot combos
  (no page errors), menu hero live on desktop + landscape phone, World, Kick
  Off, Today, store; smoke suite green (phone + watch); gl-scan on night-clear,
  night-rain and day.
- **Frame cost, SwiftShader 844×390** (software GL; only the ratios and the
  scene counts transfer to real hardware): min 111 ms · low 278 ms (343 calls,
  230k tris) · medium ~1.1 s (957 calls, 648k tris) · high ~0.9 s (972 calls,
  928k tris) · ultra ~3 s (1021 calls, 1.98M tris). Low costs a fifth of Ultra
  in raster work and a fifth of the triangles; Medium about a third. 2D path
  at 4× CPU throttle unchanged from v69 (`tests/perf/fps.mjs`).
- **Watch**: bundle rebuilt by the release script (pools/generator/realPlayers
  are in it); the watch does not load the renderer, stadiums or the world.
- Not done / next: crowd shader is per-instance sway only (no seated→standing
  transition); kit numbers are not on the scanned GLB model (its shirt is a
  recoloured material, no UV map for a print); `job` icons/typography kept on
  the existing tokens rather than a new icon set; no stadium editor.

### Football + career round (v69) — set pieces, AI, presentation, Career V2, WL queue, reconnects
**The balance sweep was RE-BASELINED on purpose.** Both goldens in
`tests/golden/` were re-recorded (`node tests/sweep-check.mjs --update`) after
the team-AI work: 12345 → goals 2.10 / shots 12.73; 777 → 2.20 / 12.75 (was
2.45 / 12.4 and 2.42 / 12.3). Inside the targets (2–3 goals, ~11 shots). What
changed the football: the defending block drops/narrows (`TUNE.drop 2`,
`squeeze 0.93`), counters, off-ball runs, sweeper-keepers with distribution,
free kicks everywhere, injuries, fatigue on technique. The bisect that found
the numbers: with `drop 5 / squeeze 0.86` goals fell to 0.4; counters that
fired on every possession change (not just real turnovers) cost another 0.7.
`export const TUNE` in sim.js is the knob set; `tests/unit/setpieces.test.mjs`
pins the defaults so a tweak is a deliberate act. Rule stays: sweep first,
feel second.

- **Set pieces** (sim.js): phases `freekick` and `throwin` join corner/penalty.
  `beginSetPiece(kind, team, taker, aiDelay)` fills `match.setPiece` — when a
  controller owns that team, `human: true` and `phaseT` is a 9 s (6 s throw)
  deadline; `readSetPieceInput` reads that seat's stick/buttons each frame and
  `takeSetPiece(action, aim, power)` fires on release. AI takes on the short
  timer (`takeFreeKick`, `takeThrowIn`, existing `takeCorner/takePenalty`).
  Fouls: `tackle()` → `awardFreeKick` outside the box (wall at 9.15 m, 3–4 men
  in range), penalty inside; `fouls[]` tallied; 1-in-8 fouls injure
  (`injure()`: maxSpeed ×0.62, `formOf()` −0.25; `autoSubInjured` at every
  `markStoppage` for CPU sides). xG per shot on `team.xg`/`team.bigChances`.
  New actions `lob` (through+loft) and `skill` (`skillMove`: sidestep burst,
  tackles miss while `skillT > 0`); keys U/H, pad Select/L2, touch buttons.
  New cues: foul, freekick, throwin, cornerKick, penaltyAwarded, injury, sub,
  counter (rate-limited 12 s), skill, lob, shotWide, bigChance.
- **Presentation** (play.js): `data/commentary.js` (208 lines, `say(key,
  ctx)`), `comment()` feed on `#gmFeed` + log in Match Facts; celebration cut
  via `render3d.celebrationCamera` during phase `goal` (not in manager cam);
  `#gmSetPiece` prompt + touch relabel maps `SET_PIECE`/`THROW_IN`; half time
  opens `facts` (xG, big chances, corners, fouls); `goalClips[]` →
  `playHighlights()` chains replays; pause item `sound`; first three matches
  show rotating control hints (`flags.hintMatches`). Tutorial has a "Skill, lob
  and set pieces" step.
- **Career V2** (`js/careerV2.js`, save shape `v: 3`, old v2 saves still
  load — `car.leagueOf` absent means legacy paths): `TIER2` (3 real clubs per
  country, squads dealt from unused real players 55–80, keeper fallback = a
  defender labelled GK), `allClubs()`/`clubOf` (careerClub → clubOf),
  `buildCalendar` (typed rounds `{type:'league',pairs}` / `{type:'cup',round}`,
  cup every 5th week, bracket of the whole country), `playCupRound`,
  `generateOffers`/`respondToOffer` (accept/counter/reject; counters can raise
  or lose the buyer), `aiTransfers` (2–3 per window week), youth
  (`refillYouth/trainYouth/promoteYouth` → `car.devBoost`), `scout/tickScouting`,
  `developSquads` (`car.dev` per name, applied in `resolveEntry`),
  `setBoardObjectives/boardReview/seasonReviewV2` (sack if objective missed and
  patience < 0.35 and no title/promotion/cup; job offers by rep), `takeJob`,
  press (`PRESS`, `answerPress`; `car.pressPending` after my match). The other
  tier is not simulated weekly: `syntheticOrder` ranks it by strength at season
  end. Crossover: `progress.pend` on title (20k + prime), promotion, cup (8k +
  gold), season complete, academy graduate. Screens: tabs Offers/Academy/
  Scouting/Cup/Board, review card with job offers, press card on the overview.
- **Online**: `server/matchmaking.js` (`findPairs`: division queue widens by
  wait; WL queue pairs by weekend wins, never across queues/weekends; unit-
  testable). `queue` accepts `wl:{id,wins}`; pair card carries `kind:'weekend'`
  + `wl`. Reconnect: on close mid-match the peer record stays `dropped` for
  `RECONNECT_GRACE_MS` (45 s); opponent gets `evt dropped/resumed`; a re-auth
  by the same account adopts the record (`peer.adopted`) and gets `rejoined`.
  play.js: host pauses via the sync-pause with the grace as countdown, cuts to
  3 s on resume; `closed` no longer ends the match. weekend.js has "Find an
  opponent online" (`online.queueWeekend`).
- **Watch**: `w-comm` one-line commentary on big cues; `w-sp` set-piece prompt;
  KICK takes the dead ball (`takeSetPiece`) with a sensible action.
- Perf after the round (tests/perf): cold boot 3.9 s / 622 KB / 62 requests
  (more modules than v67's 3.3 s / 553 KB — commentary, careerV2, matchmaking
  client bits; still a quarter of v66); sim 4.1 ms per match-second; 2D path
  56 fps at 4× CPU throttle. GL fps still not measurable headlessly.

### Live game round (v68) — Today, events, Season Pass, Weekend League, trophies, evolve, 20 clubs
**One hub for everything that counts: `js/progress.js`.** A match, a pack, an
SBC, a career milestone, an evolve, a login — the screen that did it calls one
`progress.onX()` and that feeds `club.stats` (what achievements read), season
XP, the week's event objectives, the Weekend League tally and the pending
rewards list. Never bump those from a screen. Claims (`claimTier`,
`claimAchievement`, `claimWeekend`, `claimPending`, `claimDaily`) also live
here. `claimableCount()` is the menu badge.

- **World is 20 clubs.** `CLUB_BLUEPRINTS` entries with a `league` field are
  the Meridian League. **Every generation loop runs over `CORE` (the first
  ten)**; the new clubs are created empty and their squads are dealt from the
  free-agent pool at the end of `buildWorld` (snake draft by position, no
  random numbers). Icons/Stars/88+ stay free. So: 1112 players (1100 + 12
  SBC legends), first 731 identity-identical (the generator test now hashes
  without clubId — `sha256:d81ab6b3`), `WORLD.fixtures` is still the original
  league's 18 rounds, and **`tools/sweep.mjs` runs `WORLD.clubs.slice(0,10)`**
  so the goldens are unchanged. `WORLD.sbcCards` are `sbc: true` and
  `drawPlayer` never returns them.
- **Chemistry** moved to `js/data/chemistry.js` (squad.js re-exports
  `chemistryFor`). League links: 4+ league-mates is a link. `moddedRef(p,
  {chem, level})` returns a copy with stats ×(1+(chem−1.5)·0.012)×(1+level·0.01)
  and overall+level. Applied ONLY in `ultimateSquad()` (the custom squad path
  → makeTeam `custom.xi`); club XIs and the sweep are untouched.
- **Evolve**: `js/evolve.js` — 5 levels, pay with a banked dupe
  (`club.dupes[id]`, banked by `progress.onPack`; coins still paid) or Apex
  (`apexCost`: 600 + 90/point above 60, ×(1+0.6·level)). `club.upgrades[id]`.
  Detail overlay has the panel; slots show the evolved rating with ▲.
- **Live content**: `events.json` (site root, served static, fetched
  `no-store` at boot by `js/live.js`, kept in `flags.live` for offline).
  Bundled fallback `js/data/liveDefault.js` — **keep both in step; the unit
  test asserts events.json equals the default until deliberately edited**.
  Dated events win; undated ones rotate by ISO week. Event packs: `pack.filter`
  (`nations/leagues/clubs/positions/minOverall`) via `packs.filterOf`; the
  store shows an event shelf (`eventShelf`, `findPack`). Featured card: pulled
  from the event pack ⇒ `upgrades[id] = max(boost)`.
- **Season Pass**: `js/data/season.js` (30 tiers × 250 XP, XP table,
  DEFAULT_TIERS overridable by `events.json.season.tiers`). `club.season =
  {id, xp, claimed}`; a new season id resets XP (best tier kept in stats).
- **Weekend League**: `js/weekend.js` — window Fri 18:00 → Mon 06:00 UTC, id =
  the Friday. `club.weekend` tally (10 matches), `weekendPending` for an
  unclaimed finished weekend. Screen `screens/weekend.js` launches division
  opponents with `params.weekend = id` (play.js result block → onMatch weekend).
  Online: play.js sends `wl` with the result; server `store.recordWeekend`
  (validated host results only, 10 cap, last 4 weekends kept) and
  `GET /api/weekend?id=`.
- **Achievements**: `js/data/achievements.js` — 50 rows `{get, need}` over the
  save; `screens/trophies.js` cabinet. Watch feeds `club.watchStats`.
- **Daily login**: 7-day calendar in progress.js (`DAILY`), also claimable on
  the watch (`watch/store.js dailyStatus/claimDaily`, same table — keep in
  step). Watch club screen shows season tier (from the synced save) and the
  event card (fetches events.json).
- Screens: `today.js`, `trophies.js`, `weekend.js`; menu rail has Today (badge
  = claimable count) and Trophies. `adoptCloudSave`/`loadState` fill the new
  club fields from defaults, so old saves migrate by merge.

### Foundation round (v67) — tests, CI, release script, flicker, perf, resilience
**Run `npm test` before anything else now.** It is: `test:unit` (node:test,
`tests/unit/*.test.mjs`), `test:sweep` (both seeds diffed against
`tests/golden/`), `test:smoke` (Playwright: phone boot → pack buy/open → GL
match → cloud round-trip → watch pack; real server on a scratch
`APEX_DATA_DIR`). CI (`.github/workflows/ci.yml`) runs those plus
`tools/release.mjs --check` (version/cache/notes/precache parity, watch bundle
freshness) and `tests/perf/gl-scan.mjs` (black-pixel scan at Ultra).
`devDependencies` exist now (esbuild, playwright) — runtime is still zero-dep;
`node_modules/` is ignored.

- **Release**: `node tools/release.mjs [vNN]` bumps APP_VERSION + CACHE,
  rebuilds the watch bundle, verifies the top patch-notes entry is that
  version, checks the sw.js precache list against `js/` + `styles/`, and runs
  unit + sweep. It refuses on any failure. It does not commit. HANDOFF still by
  hand. `--check` is the CI mode; `--no-tests` skips the test run.
- **Three real bugs found by the smoke test** (all from the v65 packs.js
  extraction, all `X is not defined`): `FREE_MS` (free pack claim), `wantGK`
  (Star/Icon guarantee packs), `fmtLeft`/`hasKeeper` (store timer). packs.js now
  exports FREE_MS/fmtLeft/hasKeeper; `ownedIds` lives in squad.js (needs
  getState, and the watch bundle must not pull state.js).
- **Black flicker — diagnosed from the shader, not a screenshot.** The beam
  cone material (`renderGL.js`, the additive ShaderMaterial) computed
  `rim = 1 - abs(dot(normalize(vNormalV), z))`; abs(dot) can exceed 1 by
  rounding → `pow(negative, 1.5)` = NaN → additive NaN = black pixel. The failing
  set is the cone triangles facing the lens *that frame*: hard-edged wedge,
  crosses the goalmouth, gone next frame; strongest on Ultra (uStrength 0.2,
  most supersampled pixels). Fix: `clamp(rim, 0, 1)` + `max(vUv.y, 0)`.
  Defence in depth: `cinematic.js` now launders a NaN *input* (base) to fog
  colour before the bloom can smear it — the old backstop fell back to `base`,
  which was no help when base itself was NaN. It does NOT reproduce under
  SwiftShader (pow(-tiny) comes out 0 there), so the scan is a regression
  guard, not a proof. If it is reported again on real hardware: the mechanism
  class is "NaN from a custom shader"; the remaining custom shaders are the
  beam, cinematic, and any `onBeforeCompile` — audit `pow`, `normalize`,
  `sqrt`, division.
- **Perf** (tests/perf/boot.mjs, throttled Slow-4G + 4x CPU, phone viewport):
  cold boot **14.96 s / 2584 KB / 63 requests → 3.3–3.5 s / 357 KB / 47
  requests** (553 KB once the key art is preloaded during the splash — that is
  spent while the START screen is up, so the menu opens with its backdrop
  already there; the modulepreload hints made no measurable difference on
  this profile and are kept for high-latency lines). How: (1) `renderGL.js` (and three.js, 1.3 MB) is a dynamic import
  in play.js `mount`, loaded behind the existing veil; app.js warms it 6 s after
  boot unless `navigator.connection.saveData`. `running` is hoisted so a
  renderer is never created into a torn-down screen. (2) Server: gzip (in-memory
  cache keyed on mtime/size, 64 MB cap) + weak ETag + `Cache-Control: no-cache`
  (revalidate → 304). Was `no-store` with no compression. (3) modulepreload
  hints for the heavy leaves + low-priority preload of the key art. (4) keyart
  2560→1600 q82 (554 KB → 199 KB; master in tools/keyart/keyart-2560.jpg).
  `tests/perf/fps.mjs`: sim costs 4.3 ms CPU per match-second (0.07 ms/step);
  2D path at 4x CPU throttle 40 fps. GL fps is not measurable headlessly.
- **Resilience**: `js/storage.js` (probe once; memory fallback; `persistent()`)
  — state.js uses it; app.js toasts once if storage is blocked. `js/crash.js`:
  window `error` + `unhandledrejection` → card (Carry on / Reload / Back to
  menu) + `sendBeacon('api/crash')`, max 3 reports per load, dedupes repeats,
  ignores noise (Script error, ResizeObserver, AbortError…). `navigate()` wraps
  `mount` in try/catch → card + fall back to menu. Server: `POST /api/crash`,
  `guard.crashAllowed` 6/min per IP, clipped fields, appended to
  `$APEX_DATA_DIR/crashes.log` (4 MB cap, oldest half dropped).
- `adoptCloudSave` now keeps the device's `quality`/`models` (hardware
  settings) and takes the rest from the cloud — a phone on Low was being put
  back to Ultra by signing in.
- store.js honours `APEX_DATA_DIR` (tests point it at a temp dir).
- SW precache list gained net.js/storage.js/crash.js/watch bundle (the watch
  module files are no longer listed — the bundle is what the watch loads).

### Watch boot fix + content (v66) — `js/watch/bundle.js`
- **The watch is served as ONE classic script.** `watch.html` loads
  `js/watch/bundle.js` (committed, built by `node tools/build-watch.mjs` =
  esbuild, target safari12, IIFE) — NOT the ES modules. Rebuild the bundle after
  any change under `js/watch/` or to anything it imports (sim, generator,
  packs, render3d, input). The watchOS web viewer has no console; a failed
  module import or refused syntax was the black screen the owner reported.
- `watch.html` has an inline (CSP-hashed — `inlineScriptHashes()` now reads
  it) bootstrap: loading splash, `window.onerror`/`unhandledrejection` printed
  on screen with a Retry button, 12s watchdog, `Object.fromEntries` polyfill.
  `app.js` sets `window.__apexWatchBooted` after first render; boot races
  `store.boot()` against 6s so a hung fetch never blocks the menu.
  `<meta name="disabled-adaptations" content="watch">` opts out of the reader
  layout. `/watch` is aliased to `watch.html` in server.js.
- watch.css: no `position: fixed`, no `inset` shorthand (old WebKit), and
  `[hidden]{display:none!important}` because `.w-dive` is display:flex.
- New on the wrist: `daily.js` (streak + 3 seeded objectives/day, its OWN key
  `apexxi.watch.daily.v1`, never in the cloud save; pays through `store.earn`),
  `pens.js` (shootout), difficulty `LEVELS` in match.js (skill 0.72/1/1.3, pay
  ×0.7/1/2, passed as `Match` `skill`), all clubs as opponents, Lucky Dip in
  WATCH_PACKS, squad grid of best 12 on Club.
- **World second wave**: generator.js appends 369 players AFTER fixtures on a
  separate seeded stream (`WORLD_SEED ^ 0x2a3b4c5d`), named from
  `REAL_PLAYERS_EXTRA` (tools/real-players-extra.json, curated, seeded shuffle
  in build-real-players.py; includes 20 Saudi internationals). First 731 cards
  and both sweeps (12345, 777) verified byte-identical. World is now 1100
  players; new saves start with a 57-man roster (`newCareer` copies it).

### Watch mode (v65) — `/watch.html`
Served by the same deploy; opens in Apple Watch mirroring or any small screen.
NOT a watchOS app (watchOS has no third-party browser) — that was the owner's
explicit choice from the options.

- `js/watch/` is its own small app: `app.js` (three screens + tab dots),
  `store.js` (its OWN localStorage key `apexxi.watch.v1` and its own sync —
  deliberately not state.js, so the watch can never corrupt the phone's local
  save), `match.js`, `pack.js`. `styles/watch.css` is laid out for the smallest
  face (40mm = 162x197 CSS px) and simply breathes on bigger ones.
- **`js/data/packs.js` is new and shared**: PACKS, openPack, drawPlayer,
  rollRarity, dupValue, packTone, RARITY_RANK moved out of screens/squad.js so
  the phone store and the watch store cannot drift on odds. squad.js re-exports
  PACK_BY_ID and __openPackForTest so existing importers and tooling are
  unchanged.
- Match: the real `Match` + the 2D fallback renderer, with a **tightened
  camera** (`tighten()` — hfov 33, 21m behind the ball). The broadcast camera
  at 162px is twenty-two specks; that was the first thing that had to change.
  Controls: drag anywhere = stick (origin under the thumb), one button that
  shoots inside 30m of goal and passes otherwise, and holds sprint while down.
- Pairing: `/api/pair/new` (phone, authed) mints a 6-digit code, three-minute
  TTL, single use, deleted on first claim right or wrong; `/api/pair/claim`
  trades it for a token. `store.mintToken` issues a SECOND token
  (`acct.extra[]`, max 5, same TTL) rather than rotating — pairing a watch must
  not sign the phone out.

Test note: Playwright refuses to click the packet because it is animated
(`element is not stable`) — use `{force:true}`, it is not a bug.

### Security pass (v64) — `server/guard.js`
The threat model: the client is authoritative over its own save and always will
be. The server's job is to bound the damage and kill the cheap attacks.

**Fixed, each one a thing that worked before:**
- **Cloud saves were stored verbatim** (`putSave(acct, body.save)`) — the
  19-million-coin incident. Now sanitised: absolute ceilings, a **rolling
  hourly gain budget** (1M/hour, tracked in `acct.guard`, server-side so a
  tampered client cannot edit the thing measuring it), collection de-duped and
  capped, 256KB size cap. Clamps are logged with the account name.
- **Result forgery.** `case 'result'` recorded when `peer.isHost || !peer.opponent`
  — that second clause meant *a peer with no match at all* could post results on
  a loop. Now: must be in a match, once per pairing (`peer.reported`), scores
  clamped, host's copy authoritative.
- **No auth rate limiting.** Now per-account (8 wrong guesses, slow refill) and
  per-address (40 failures / 15 min), **charged on failure only**.
- **Relay payloads unbounded** — 24KB ceiling on snap/in/evt (a snapshot is ~1KB);
  club/squad rebuilt field by field before being relayed to an opponent.
- **No flood limit** on the socket: 200 msg/s sustained (a match produces ~80).
- **Tokens: O(n) scan, never expired.** Indexed Map, 60-day TTL, and
  `TOKEN_EPOCH` in the environment revokes every token issued before it — the
  "sign everyone out" switch, for the day a token leaks.
- **Security headers + CSP** on every page, with `frame-ancestors 'none'`.

**The two traps, both found by testing rather than reading:**
1. The first limiter charged *every* login attempt per IP — one wrong password
   locked out everyone behind a shared address (carrier NAT: most of the
   player base). Only failures are charged now, and a correct password is free.
2. The first CSP had `script-src 'self'` and **the game did not boot**: the
   import map in index.html is inline, and import maps have to be. The policy
   now names SHA-256 hashes of each inline block, computed from disk at boot
   (`inlineScriptHashes()`), so it stays correct when the HTML changes.

**Verified after:** honest save byte-identical round trip; a 250k sell-off and a
200k objective payout kept in full; 19M clamped and unable to ratchet; forged
results ignored; 200KB relay dropped; flood closed; the bystander on the
attacker's IP still signs in; the game boots clean under CSP (no violations,
service worker registers); and a full real online match still records for both
players.

**Not addressed on purpose:** the client can still lie about a match it played
alone (offline economy), because verifying it means simulating every match
server-side, which this hosting cannot afford. The hourly budget is what bounds
that.

### Manager cam is the career default (v63)
`camMode` starts as 'manager' when `careerCtx` is set, 'broadcast' everywhere
else. And the model's rest forward is **-y** — at yaw 0 it faces the lens — so
the yaw offset is `atan2(dirY,dirX) + PI/2`, not minus. If the model is ever
replaced, re-check which way it faces at zero rotation before trusting any
offset; the tell is the very first frame of a career match.

### Career mobile + control pass (v62)
- Career matches skip the whole player touch layer (`pointer: coarse` init is
  gated on `mode !== 'career'`) — the wheel, meters, cam toggle and two
  `.mgr-walk` arrows are the entire touch surface.
- The manager is player-driven: `input.axis().x` + the touch arrows, clamped to
  the technical area. No autopilot. Facing rule: travel direction while
  walking, the pitch while standing.
- The look-at-camera bug was yaw SNAPPING: raw `rotation.z` assignment jumped
  between facings and single frames landed lens-side. renderGL now eases yaw
  through the shortest arc (±π ties resolve pitch-side by construction of the
  three facings used).
- Shouts: `SHOUT_COOLDOWN = 8`; wheel gets `.cooling` (dimmed, inert), the hub
  counts down, keys and taps refused in `applyShout`.
- The career hub's nav was the bug: it used class `tabs`, which is the Ultimate
  dock (position: fixed, bottom) — pinned over content with no padding rule.
  The redesign is `.chub` (club-colour banner + chips) + `.cnav` (in-flow
  segmented nav). NEVER put class="tabs" on an in-flow nav.

### The manager model (v61)
`assets/manager.glb` (1.6MB, committed) is the owner's Meshy "Executive" model.
The source was a 457MB release zip — SEVEN 65MB GLBs, one animation each, all
weight in one 8192x8192 PNG. `tools` has no script for this; the merge lives in
the session log and in this description: identical rigs verified by node-name
list, base file kept whole, each other file's animation samplers/accessors/
bufferViews appended and remapped, clips renamed (idle/walk/stroll/run/shout/
celebrate/stomp), texture re-encoded 1024 JPEG. renderGL plays them via a tiny
state machine off `managerFig.pose`/`walk` with 0.28s crossfades.

The hard-won rule: **scale by measurement, not by the file's units.** The first
cut trusted the bind-pose bounding box and produced a 15-metre manager. The
loader now applies scale, re-measures the world bbox, corrects, and repeats —
two passes — then drops feet to z=0. Any replacement model gets this for free.

The original release stays at github.com/ahmedps520-svg/fc27/releases/tag/1.

### Career release cut (v60)
- Real managers list is Pep ONLY (tools/build-career-db.py MANAGERS) — the
  licensed-likeness caution, applied on the owner's call. Custom stays full.
- 35 clubs (added new/avl/vil/ath/rom/rbl/vfb/mon/shb/ett). Pool has ~99 spare.
- Money inputs everywhere in negotiation take shorthand via `parseAmount`
  ('60m', '500k', '1.2b') and echo the parsed value live (#negEcho).
- Negotiation tension: `neg.tension` rises per rejection (more for lowballs);
  at 1.0 talks end. An offer under 34% of ask (or 30% of wage floor) ends talks
  instantly. Any walk-away freezes the player via `car.frozen[name] = week+5`
  (TALKS_FREEZE_WEEKS) — 5 rounds at MONTHS_PER_WEEK=2 = the "10 months". The
  market row shows the countdown badge instead of the Offer button
  (`frozenOut()`).
- Touchline HUD rebuilt: diamond wheel with a hub, numbered slots, keys 1-4
  (and C for camera) via a window keydown listener that is removed in the match
  teardown. Meters carry names + live values.
- `assets/manager.glb`, if present, replaces the suit rig (GLTFLoader, scaled
  to 1.85m, y-up -> z-up, clip 0 loops; silent fallback). NOT in the SW
  precache on purpose — see assets/README-manager-model.md. The web uploader
  caps at 25MB; a git push takes up to 100MB, which is how a 30MB model gets in.
- Tutorial: three Career steps; currentScreen() learned to recognise the
  career screen (.cm-modes/.career-head).

### Manager Career V1 (v59)
The pieces and where they live:
- `tools/build-career-db.py` -> `js/data/careerDb.js` (GENERATED): 25 real clubs
  in 6 leagues; squads are the real players curated for each club, filled to 16
  from the source pools (fill players are real people, maybe not at that club).
  CAREER_RATINGS states career ratings for the 20 names that only exist as
  99/92 Icon/Star cards. Edit the tool, never the output.
- `js/career.js` (engine): resolveEntry matches career rows to WORLD cards **by
  name** — one footballer, one set of numbers everywhere. startCareer,
  advanceWeek (sims the rest of the round, moves the table/week/season),
  contracts (season-decremented; expiries renew or leave), staged transfers
  (askingPrice: short contract = cheap; respondToFee counters; respondToTerms
  has wage floors), 500M start (`START_COINS`).
- `js/screens/career.js`: mode select (Player Mode = honest UNDER CONSTRUCTION
  card), real managers + custom builder, club select, 6-tab hub, market UI,
  renewals, season end. Old v1 career slice is ignored (render checks
  `career.v === 2`); the old state.js career fns still exist, unused.
- play.js `mode:'career'`: `human:null` (AI vs AI — the sweep path), 90s
  duration, `mgr` block owns morale/perf/wheel/talk/figure/cameras.
- sim: `mgrSide`/`mgrPerf` move aiSkillFor by ±0.22 for the managed team only.
  Sweeps stay byte-identical (fields absent outside careers). Shouts also set
  REAL tactics temporarily (press/mentality), reverted after 14s.
- renderGL: `match.managerFig` -> a suit-dressed buildPlayer rig (thighs/shins/
  arms rematerialed as trousers/jacket — the player rig assumes bare thighs).
  Posed via posePlayer; celebrate/shout reuse the cheer pose. GL path only.

Traps hit and fixed here:
- **`match.human` is null in careers matches.** paintPause's panelFor indexed
  `teams[match.human]` -> throw inside setPaused -> the half-time branch died
  half-done every frame, silently (the loop's finally re-arms). Every seat read
  is now `match.human ?? mgr?.side ?? 0`. If a new UI reads the human seat, use
  that expression.
- The manager camera must aim THROUGH the figure (over the shoulder), not sit
  where he stands, or he is out of frustum and "the manager cam has no manager".

Testing: full flow verified headless (webgl off = 2D renderer, real speed):
mode select -> Pep -> Al Nassr (Ronaldo/Mané in squad) -> market search ->
staged deal (lowball countered, counter accepted, wage floor rejected then met,
Rodrygo signs, 500M->492M) -> matchday (wheel contextual + rotates, shout
lands, meters move) -> half-time talk at 45' (4 options) -> FT -> hub at week 2
with table/morale updated. GL run for the touchline figure + both cameras.

### P2P, the pause queue, the reel, five packs (v58)

**P2P (`js/net/p2p.js`).** WebRTC DataChannel between the two browsers, unordered
and non-retransmitting, carrying `snap` and `in` only. Signaling rides the hub's
verbatim `evt` relay (`k:'rtc'`) — zero server changes. `sendMatch()` picks the
channel when open, the websocket when not, **per packet**, so a channel dying
mid-match degrades silently to today's behaviour. Inbound DC packets go through
`net.injectMessage`, which now also filters ws-delivered `snap`/`in` by `ts` so
the two routes cannot reorder each other. Rules that matter:
- only `snap`/`in` are accepted off the channel — a peer cannot inject hub
  messages (results, oppLeft) through it;
- the guest says hello (retrying — the two clients enter the match seconds
  apart), only the host offers, and only once (`if (dc) return` — a double
  offer was a real race, seen as `setRemoteDescription ... wrong state`);
- `?nop2p=1` disables it (tested fallback path, support tool);
- no TURN on purpose: pairs STUN cannot connect stay on the relay by design.

**Pause queue (host-authoritative, all in play.js).** Online pause input =
request. Guest asks via `evt k:'pausereq'`; the queue, the stoppage ruling and
the 20s countdown live on the host and reach the guest as snapshot fields
(`pq` name while queued, `pz` [name, tenths] while counting) — a state can
never race the world it describes. The sim's new `stoppages`/`stoppage` ledger
(`markStoppage` in sim.js: throwin/corner/goalkick/goal) plus phase checks is
what "dead ball" means; the goal phase is excluded (the replay owns both
screens) and the kickoff after it converts instead; 40s in queue force-converts.
While counting the host freezes the sim but keeps streaming **one frozen
snapshot** (`pauseSnap`) with a live countdown — encoding the live scene would
ship the reel's mutations to the guest's buffer. Dedupe is one `if` in
`requestPause`. Disconnect (`oppLeft`) clears everything.

**The traps that cost time here, written down:**
- the step block's `else if` chain matters: the sim must not advance during a
  goal replay, and the host must not broadcast during one. Restructuring the
  loop, keep `!replay` on both.
- `pressed()` needs the key held across a poll frame — Playwright's
  `keyboard.press` (≈2ms) vanishes at high fps and lands at low fps. Test
  keys with down/120ms/up. Not a game bug; humans hold keys 80ms+.
- headless GL runs ~1.5fps and the dt cap makes game time crawl 10x slower
  than the wall clock — a "the ball never goes out" mystery was just that.
  Launch the harness with `--disable-webgl` to get the 2D renderer and real
  speed, plus the three `--disable-*background*` throttling flags.

**Pause reel.** When the world is genuinely stopped (offline pause, half time,
online synced pause — NOT the online menu over live play), the last ~7s of the
goal-replay tape loops behind the menu on a slow dolly; under ~2.5s of tape it
is camera drift over the frozen scene. Live state captured before the first
applied frame, restored on resume, same contract as the goal replay.

**Packs:** striker (forcePosition generalised beyond GK), stack, form, double,
wildcard — ids are save keys, never rename. 17 total.

**Tested** (two real clients vs `.dev-server.js`): p2p up with ~99% packets
direct on both sides; `?nop2p=1` relay fallback playing normally; guest and
host requests; both requesting (first name wins, second refused); banner on
both without the menu opening on the non-requester; conversion at a real
stoppage and via the 40s valve; 20/20 countdown on both; menu pinned (Esc and
resume refused) during the hold; auto-resume both; banners cleared; a second
pause afterwards; disconnect during queued and during active pause both ending
the match cleanly with nothing stuck; offline pause immediate with no banner;
reel visibly animating behind the menu while the clock stands still; resume;
store rendering all 17 packs with the tutorial's keeper target intact; sim
sweep byte-identical.

### Server region: Frankfurt, and the trap in moving
Players are in Saudi Arabia; the service was created in Singapore. Render has no
Middle East region, so Frankfurt is the closest and roughly halves the round
trip. A region cannot be changed on an existing service — `render.yaml` (new)
is a blueprint pinned to `frankfurt` so the replacement is one click, and
`tools/migrate-store.mjs` (new) copies the account key between two Redis REST
endpoints (dry run by default, refuses a non-empty destination without --force).

**The trap, written large in the README:** saves and session tokens are
per-origin browser storage. If the new service answers on a different hostname,
every player without an account looks wiped and everyone else is signed out. The
move is only safe behind a custom domain that can be repointed;
`*.onrender.com` names cannot move between services.

Worth knowing before spending on this: for two players *in the same country*,
a WebRTC DataChannel between the browsers beats any region choice by an order of
magnitude — Riyadh to Riyadh direct is tens of milliseconds against ~200 ms
relayed through Frankfurt. The region move is the safe, boring win; P2P is the
real one.

### Online latency: what was cut, and what is left (v57)
Measured budget for the **guest** before this (the host feels none of it):
input sent every 33 ms, host snapshots every 50 ms, guest rendering a flat
100 ms in the past — about 150-190 ms of self-inflicted delay before the network
is even involved. Changed:
- `SnapshotView` sizes its own buffer from measured packet **arrivals** (not from
  a ping — a link that is late but even needs a small buffer, one that bursts
  needs a big one). Unit-measured: 66 ms on a steady 33 ms stream, 77 ms with
  mild jitter, 129 ms when bursty, 120 ms on a 60 ms stream. Was a flat 100 ms.
- snapshots 20 -> 30 Hz (`SNAP_MS` in netplay.js is the only place the rate lives),
  input 30 -> 50 Hz, positions and velocities quantised to 0.1 (was 0.01), which
  pays for roughly a fifth of the extra packets.
- The HUD now shows **end-to-end** RTT — this client to the opponent and back,
  bounced off the peer through the hub's verbatim `evt` relay, so it needed
  nothing from the server. It used to show client-to-server, which read as about
  half the lag people were actually feeling. Quality bands moved to 90/190 to
  match. An opponent on an older build never answers and it falls back to the
  server ping.

Net: about 50 ms off the guest's input latency on a good line. What is left is
geography and the relay: every packet goes to Singapore and back even for two
players in the same city. The real next step is a WebRTC DataChannel between
the two browsers with the hub kept for matchmaking and signalling; after that,
client-side prediction of the guest's own player.

Tested with two real clients against `server/server.js` (sign-up, seeded squads,
matchmaking, kick-off): no errors, both sides in the match, HUD reading the peer
number. Note the headless number is dominated by the opponent's frame time -
that is honest, the readout includes the opponent's main thread.

### Maintenance page (v57)
`maintenance.html` is a standalone notice and **nothing else** — no server mode, no polling, no
self-redirect. An earlier cut of this had a `MAINTENANCE=1` server flag that answered every route
with 503 and a page that polled its way back in; it was removed on the owner's call because Render
has its own maintenance switch and two mechanisms fighting over the same job is worse than one.

The thing to remember if it comes up again: a platform maintenance switch redirects **off** the
service it is disabling, so the page cannot be hosted on that service. GitHub Pages off this repo
is the intended home, which is also why the page keeps relative asset paths (they resolve inside a
copy of the repo) and an absolute "Try again" target with a `?back=` override.

### Menu key art is engine-shot and reproducible (v56)
`assets/keyart.jpg` is now a 2560x1440 frame from the game's own renderer,
graded. The pipeline and its rules live in `tools/keyart/README.md` — read that
before replacing the art. Three things it records that cost time here:
- shoot at display size (the "low quality" complaint was a 1672px image stretched
  across a 2560px screen);
- put the darkening in the image, not the CSS scrim, or the art turns to grey wash;
- the shoot needs a temporary `globalThis.__keyart` hook in `updateCamera`
  (`js/game/render3d.js`) which is **not committed** — add it, shoot, remove it.

`.menu-wordmark` is visible again: it was hidden only because the previous art
had its own lockup baked in. That coupling is now commented at
`body.on-menu::before`.

### Render builds: the Node version is pinned, do not unpin it
A deploy failed with:

    Requesting Node.js version >=18
    Using Node.js version 26.8.0
    error apexxi@1.0.0: The engine "node" is incompatible with this module.
    Expected version ">=18". Got "26.8.0-alpha.0.0.0"

`engines.node` was `>=18`, Render resolved that to the newest build it had —
a **prerelease**, `26.8.0-alpha.0.0.0` — and then yarn's own engine check
rejected it, because a semver range without a prerelease tag never matches a
prerelease version. So the range asked for a version that the range itself
forbids, and every deploy failed the moment Render's newest Node went alpha.

Fixed with `.node-version` (22.11.0, LTS) and `engines.node: ">=18 <27"`. The
file is what Render actually reads; the range is the belt.

This is worth remembering when a fix "does not work in production": a failed
build leaves the **previous** build serving, so the site keeps working and keeps
being wrong. Check the deploy log before re-debugging the code.

### The wheel, cause four — stop diagnosing (v55)
Three fixes had shipped (stuck `body.in-game`; `overflow: hidden` latching,
fixed with `overflow: clip`) and the reporter's wheel was still dead after a
redeploy. So `js/app.js` no longer tries to identify the cause: the capture-phase
`wheel` listener walks from the target for a scroller that is `auto|scroll` and
has room **in the wheel's direction**, and if it does not find one it
`preventDefault()`s and sets `document.scrollingElement.scrollTop` itself. The
page scrolls unless something under the pointer genuinely can.

Cost: no smooth-scroll easing on frames it handles. Worth it.

`wheelDiagnostics()` (exported from app.js) keeps the last six events, and
Settings → App → **Scroll check** renders them live: page scrollTop, how much
room the page has, whether the page took the event or an element did, the
element chain with each one's overflow and scroll room, viewport size, DPR and
user agent. It exists because none of the four causes ever reproduced here — if
this comes back a fifth time, ask for a screenshot of that panel first rather
than guessing again.

### Every player is a real footballer (v54)
`js/data/realPlayers.js` holds 696 real players — name, short name, country,
position — and `NATION_COLORS` holds flag colours for the 60 countries. It is
**generated**: `tools/build-real-players.py` reads `tools/real-players-source.json`
(the list the owner supplied) and writes the module. Edit the tool, not the
output.

`nameTheWorld` in `generator.js` runs at the end of `buildWorld` and overwrites
`name`, `short`, `nation` and `nationColors` on every generated card. Rules that
matter:
- **Build first, name second.** Ratings, stats, positions, clubs, ages and
  values are untouched, which is the entire reason no save changed strength.
  Never move naming earlier, into `makePlayer`, where it could feed the numbers.
- **Ids are unchanged**, so saved collections keep pointing at the same cards.
- **Order is the identity.** Both lists are walked in fixed order. Re-sorting
  `REAL_PLAYERS`, or inserting a row anywhere but the end, deals every existing
  save a different set of names.
- Icons and Stars are skipped (already real). The 20 people who appeared both
  there and in the source list were dropped from the source at build time, so
  nobody is on two cards — which is also why the counts land exactly: 696
  names for 696 generated cards.
- Keepers are strict: only real GKs get GK cards. The list has ~12 more keepers
  than the world has keeper cards, and those spill onto outfield cards at the
  very end rather than leaving invented names behind.

Not changed, deliberately: clubs and leagues stay fictional (licensing), and the
faces stay procedural and seeded by card id — **never** try to make a portrait
resemble the person named on the card.

Chemistry: nation links are sparser than they were (60 countries instead of 16),
but club links carry most of it — an auto-filled XI from an 80-card collection
still measured 91 chemistry. The `8 different nations` challenge is easier now;
`5 from one nation` is slightly easier too (Spain and Brazil are bigger blocks
than any fictional nation was). Left alone rather than silently re-tuned.

### The mouse wheel, cause number three (v53)
`overflow: hidden` **is** a scroll container. A box that clips a couple of
pixels of decoration therefore has a couple of pixels of scrollable overflow,
and Chrome latches a wheel gesture onto the first such box under the pointer:
it scrolls the box its two pixels and will not chain the rest of the gesture to
the page. `.screen-head` — on every screen — had 50px of clipped artwork, which
is exactly why the report was "the wheel does not work anywhere", and `.pitch`,
`.tile`, `.ts-card` and `.sp-face` each had their own.

Fixed at the end of `styles/main.css`: those boxes are switched to
`overflow: clip`, which clips identically and is **not** a scroll container. The
earlier `hidden` declarations stay put as the fallback for Safari < 16, so the
override has to come last in the file.

**Rule: clipping for looks is `clip`. `hidden` only when something inside is
meant to be scrolled.**

Backstop in `js/app.js`: a capture-phase `wheel` listener that fires only when
the pointer is over a hidden-overflow box with overflow to hide, no genuine
scroller sits between it and the page, and the page still has room — then it
preventDefaults and scrolls the window itself. Verified by forcing the bug back
on with `.pitch{overflow:hidden!important}` and watching the page scroll anyway,
while the collection list still scrolls itself and leaves the page alone.

To check for a regression: walk every screen and look for elements where
`getComputedStyle(n).overflowY === 'hidden'` and `n.scrollHeight > n.clientHeight`.
A clean app has none. That scan is what found all five.

### The pack reveal shows one card (v52)
`runPackAnimation` sorts worst-first and then starts at the **last** index, so
the only card that walks out is the highest-rated pull. The other pulls are
untouched: `openPack` still banks all of them, duplicates still pay out, and the
closing toast still reports the counts. Two things went with it — the per-card
`1 / N` counter (now `Best of N`) and the whole `showSummary` "Skip all" screen,
which had no reason to exist once the reveal is a single card.

If a future change wants the full list back, put it behind a button on the final
card rather than reinstating the queue — the queue was the complaint.

### The menu key art is the supplied artwork (v52)
`assets/keyart.jpg` is the cover image as provided, not an engine reshoot. Two
consequences live in `styles/main.css`:
- the `body.on-menu::before` scrim is deliberately light at the top (.10) and
  only gets heavy at the bottom, where the tiles need contrast;
- `.menu-wordmark` is hidden while the menu art is showing, because the art has
  its own APEX XI lockup and two titles stacked looked like a bug. The `<h1>` is
  still in the markup — if the art is ever swapped for something without a
  lockup, delete the `display:none` rule and it comes straight back.
A `max-height: 620px` query pushes the framing down to 78% so a short landscape
phone crops the lockup off the top cleanly instead of slicing it behind the top
bar.

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

**The Packs tab is shelves, not a grid** (`cat` on each pack: free /
standard / premium / limited). Twelve identical rectangles in a wall is a
spreadsheet; a shop has sections. Each shelf is a panel with a name and a
one-line pitch, packs inside are half again bigger, and the row scrolls
sideways when it must so no shelf dictates the layout of the one below. The
art idles on a slow staggered bob (`packFloat`) — the foil sweep on hover is
still the only fast motion. The free bronze has a shelf to itself because it
is the one everybody comes back for.

**The free bronze is a six-hour clock, not a ratio.** The old gate was
`packsOpened % 3` — but *claiming* never increments `packsOpened`, only
opening does, so whenever the count sat on a multiple of three the button
could be pressed forever, banking a bronze per click. `club.freeAt` is a
timestamp; a timestamp cannot be farmed by not opening things. The button
shows the countdown, and old saves merge in at `freeAt: 0` — claimable at
once, which is the right greeting anyway.

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

**The rip comes first** (`#packRip` in `runPackAnimation`). The pack arrives
sealed — breathing, glowing in the colour of the *best* card inside, which is a
deliberate tell — and nothing happens until it is torn. One rip per opening,
even Open All. Reduce Motion tears instantly. The celebration (`celebrate`) is
reserved for special/star/icon: stage shake plus confetti in the pull's own
colours, and bronze gets nothing on purpose — if every card explodes, none do.

A testing trap that cost a debugging round: **a hand-seeded save without
`meta.reset` gets the economy wipe applied on load**, silently replacing
whatever packs the test planted with the starter silver. The celebrate path
looked broken when the test had simply never fed it a special. Seed
`meta: { reset: 'econ-2curr-1' }` in any fabricated save.

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
which is also why it survives the app being shut for a week. The cadence is
**six hours** (`REFRESH_MS`, was twelve): a finished slot is dead space — it
pays nothing and asks nothing — and six hours of it per rung is enough.

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

### Ultra Low ('min')
The graphics tier below Low, for hardware Low still stutters on. Setting value
is `'min'`; the UI says "Ultra Low". Two flags in `createRenderer` carry it:
`lo` (everything Low already skips — Ultra Low skips it too) and `potato` (what
it goes further on). **New quality gates must test `lo`, not `!== 'low'`** —
that is the whole reason `lo` exists, so a future gate cannot accidentally put
min on the fancy path.

What `potato` adds beyond `lo`: render ratio capped at **0.8** (sub-native,
stretched — the single biggest win on a weak GPU; `safeRatio`'s 0.75 floor
still applies), goal-net cloth at 9x4 with one solver step, terrace 4 rows,
crowd 3 rows at step 3.0 — **sparse, not absent**, because an empty bowl reads
as broken while a quiet Tuesday crowd reads as a choice. Scanned player models
are forced off in play.js (`useModels`), and the canvas-2D fallback renders at
1x. `resolveQuality` passes `'min'` through but Auto never chooses it — like
Ultra, it is only ever an explicit request.

Measured on SwiftShader (CPU rasterising both, so a fair relative proxy): the
same kickoff scene runs **1 FPS on Low, 3-4 FPS on Ultra Low** — the tier is
three to four times cheaper, not just fewer checkboxes.

### The scroll-wheel bug, actually found
Three reports, two wrong fixes, and the real cause was `body.in-game`, which
carries `overflow: hidden` for the match. It was added in the play screen's
mount and removed deep in its cleanup — **after** `gl.dispose()` and the crowd
audio teardown. Either of those throwing (real GPU drivers do; SwiftShader in
tests does not) skipped the removal, and the page was left unscrollable
everywhere until a reload. Never reproduced here because no test scrolled
*after playing a match*.

Three layers now: the class is removed **first** in the cleanup; every risky
teardown step is individually guarded so one throw cannot skip the rest; and
`navigate()` owns the class outright — `toggle('in-game', name === 'play')` —
so arriving anywhere that is not the match clears it whatever happened to the
match. Verified by forcing the stuck class and navigating: it clears, and the
wheel scrolls.

The general lesson: **state a screen sets on `document.body` must be owned by
navigation, not by the screen's own cleanup.** A cleanup can die; navigation
always runs. The tutorial-scrim fix (v45) was real but was a second, smaller
cause of the same symptom.

### The desktop width and the key art
`.screen` was capped at 1180px — tablet sizing on every monitor, which read as
"the boxes are really small" on a PC. The cap is 1520px now, and `min-width:
1400px` media rules scale the hub doors and wordmark up with it.

The menu backdrop (`assets/keyart.jpg`, `body.on-menu::before`) is a frame shot
with the game's **own renderer** via Playwright — its real stadium, floodlights
and crowd — graded dark at capture (multiply + green overlay + top/bottom
scrims baked in). Own-engine art has no trademark problem (the user's reference
had a real Nike swoosh in it) and no AI-typo'd text baked in. It lives on
`body`, not inside `.screen`, because a fixed layer inside the screen would
ride the entry animation's containing block (see below). ~130KB, precached in
`sw.js`. Regenerate with a bigger crowd/lower camera any time: the capture
script pattern is in the session notes — boot, kick off, drawImage the canvas,
grade in a 2D canvas, `toDataURL('image/jpeg')`.

### The hub layout
Asked for explicitly, with an FC Mobile screenshot as the reference: *"i want
the game to look like that but not exactly... same menu options just the same
layout basically"*. So the menu is now a **hub** — a rail of small utility
tiles (Career, Settings) beside two big doors (Ultimate XI, Kick Off) — and the
Ultimate XI tabs are a **bottom dock**, icon over label, fixed to the viewport
edge. The shape every mobile football game trains thumbs on.

The content rule from the two reverts below **still stands**: same four
destinations, no counters, no statistics. Only the space moved, to where
sessions actually go. Kick Off is the one solid block of APEX green in the app,
which is what makes it read as "press this first" without copy; the dock keeps
the accent gradient line across its top — the cover's diagonal carried down.

**The dock is the same DOM the pills were** — same ids, same `data-utab`, same
handler; only CSS knows it moved, which is why the tutorial and the pad kept
working unmodified. `.screen:has(#uTabs)` supplies the floor space.

**The containing-block trap, because it will bite again**: `screenIn` animates
`transform`, and a filling animation keeps the element computing an *identity
matrix* even though its last keyframe says `none`. Any transform — identity
included — makes `.screen` the containing block for `position: fixed`, which
pinned the dock to the page instead of the viewport, 1,650px down. app.js
clears the element's own animation on `animationend` (and `navigate` re-arms
it); the class stays on so the panel stagger scoped under it is untouched.

### The menu — four doors, nothing else (history)
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

### Editing the database by hand does not work
This cost a real incident, so it is worth stating plainly: **the save is
client-authoritative.** On sign-in the device compares its copy against the
cloud's with `saveWeight`, and `saveWeight` scores *progress* — matches, cards,
packs opened. **It does not look at `apex`.**

So correcting a balance in the account database changes nothing the comparison
can see. The weights come out identical, the device keeps its own copy, and
`state.js` then pushes that copy straight back up over the correction. It looks
like it worked, and it silently did not — an exploited balance survived both a
hand edit and a redeploy that way.

`meta.adminRev` is the way out, and `cloudWins()` in `state.js` is the one place
the rule lives. A higher `adminRev` on the cloud copy wins **regardless of
weight**: a deliberate correction is not a conflict to arbitrate, it is an
instruction. Once adopted the device carries the same number, so it applies
exactly once and normal weight arbitration resumes.

Both callers go through `cloudWins` — the background resume in `app.js` and
sign-in in `online.js`, which differ only in whether an equal weight counts as
a win (`orEqual`). They used to hold two copies of the comparison; a rule that
lives twice is a rule that will disagree with itself.

### Correcting a balance
`tools/set-apex.mjs`. Closing an exploit does not unwind the balances it
produced, and there was no way to correct one without hand-editing the account
database.

    node tools/set-apex.mjs <name>                 # report, changes nothing
    node tools/set-apex.mjs <name> 30000           # still a dry run
    node tools/set-apex.mjs <name> 30000 --apply   # writes

**Dry run is the default and `--apply` is the only thing that writes.** It
calls into `server/store.js` rather than reimplementing the backend choice, so
it cannot drift from where the server actually keeps accounts — and it needs the
same environment: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for the
hosted database, neither for `server/data/accounts.json`. It prints which
backend it reached before doing anything, because **pointing it at the wrong
store is the one mistake it cannot catch for you** — a dev machine with no Redis
env silently edits a local file and reports success.

`accountByName` was added to the store for this. It is deliberately **not**
reachable over HTTP: nothing in `server.js` calls it, and an endpoint taking a
name would be an account enumeration oracle.

`--wipe` puts the club back to a brand new one — the whole-account reset.
It sends **empty** `club`/`ultimate`/`flags` rather than a club the tool built
itself: `adoptCloudSave` merges what it receives over the client's own
`defaults()`, so empty objects come out as exactly a new club, decided by the
game rather than by a copy of the game's starting values living in a tool that
would go stale the next time they were tuned. It keeps the account, and keeps
their audio and graphics settings — those are not the punishment.

`meta.reset` is carried across deliberately. It is the marker for the old
economy-wipe apology, and a save without it makes the client re-run that wipe
and show a note apologising for something that did not happen.

Verified against the real client, not by reading it: a device holding
19,000,000 Apex, 4 cards, 620 unopened packs and 4,359 opened adopts the shell
and lands on 5,000 Apex, no cards, the standard starting bundle, division 0 and
seven fresh objectives — with `weightWouldHaveWon: false` in the same run,
which is the proof that weight alone could never have applied it.

`--clear-packs` empties the locker as well, and the report itemises it. **Coins
are only the first place exploited money goes**: spent, it becomes unopened
packs, which are the same value wearing a different hat and are invisible in a
balance. The account that prompted this had been reset to 30,000 Apex and was
sitting on 612 Lucky Dips and 8 Limited: Legends — millions, parked. Cards
already in the collection are not touched by either flag, and the tool says so
on every run.

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

- **`js/game/net.js` is a complete Verlet cloth simulation for goal netting that
  nothing imports.** It was in the service worker's precache list *twice*, so
  every install downloaded it for nothing; that is now removed. The file is kept
  because it works and the nets are still static — wiring it up is a real visual
  improvement waiting to be picked up.

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
