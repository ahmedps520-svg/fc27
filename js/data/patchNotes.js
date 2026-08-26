/**
 * Release notes.
 *
 * One source, two readers. `screens/notes.js` shows the newest entry as a card
 * over the menu the first time a player opens a build; `notes.html` renders the
 * whole archive as a full page. Neither has its own copy of the text, so an
 * update cannot ship with a card that says one thing and a page that says
 * another.
 *
 * Adding a release: put it at the **top** of the array, set `version` to the new
 * `APP_VERSION`, and that is the whole job — the card appears for everyone who
 * has not already seen that version, and the page picks it up on its own.
 *
 * Each entry carries two lengths of the same story. `summary` is what the
 * in-game card shows: one sentence, no jargon, written for someone who wants to
 * get back to playing. `detail` is the full page: why it changed and what it
 * cost, written for someone who chose to click through.
 */
export const RELEASES = [
  {
    version: 'v51',
    date: '2026-08-26',
    tag: 'Interface',
    title: 'Rip the pack open',
    lede: 'Packs are torn open by hand now, big pulls get confetti and a '
        + 'screen shake, and the menu art got a proper reshoot.',
    entries: [
      {
        head: 'The rip',
        summary: 'A pack sits in your hand first — breathing, glowing in its rarity colour — '
               + 'and does not open until you tear the strip off it.',
        detail: 'Opening a pack used to start the card show immediately, which made the pack '
              + 'itself weightless — you never touched the thing you bought. Now it arrives '
              + 'sealed: the packet floats in front of you with its tear-strip along the top, '
              + 'lit in the colour of the best card inside (which is itself a tell worth '
              + 'watching for). Tap it and the strip tears away, the packet bursts, and the '
              + 'reveal begins. One rip per opening, however many packs you open at once, and '
              + 'Reduce Motion tears instantly.',
      },
      {
        head: 'Fireworks for the cards that earn them',
        summary: 'Special, Star and Icon reveals shake the stage and drop confetti in the '
               + 'card\u2019s own colours. Bronze does not.',
        detail: 'If every card explodes, none of them do — so the celebration is reserved for '
              + 'the tiers that deserve one. When a Special or better walks out, the stage '
              + 'jolts and confetti falls in the pull\u2019s colours. Everything respects '
              + 'Reduce Motion.',
      },
      {
        head: 'The menu art, reshot',
        summary: 'The backdrop is a tighter, moodier frame — bigger players, a full crowd, '
               + 'and the green light streaks from the cover carried into the scene.',
        detail: 'The first backdrop was an honest frame but a flat one: a wide shot that was '
              + 'mostly distant turf. The reshoot crops in so the players and the stands '
              + 'carry the frame, and grades the club\u2019s green light streaks across the '
              + 'scene — the same diagonals the cover and the tiles wear. Still shot with the '
              + 'game\u2019s own renderer, still about 100KB.',
      },
    ],
  },
  {
    version: 'v50',
    date: '2026-08-26',
    tag: 'Performance',
    title: 'Ultra Low',
    lede: 'A graphics tier below Low, for hardware that Low still stutters on. '
        + 'Measured three to four times cheaper than Low on the same scene.',
    entries: [
      {
        head: 'Everything turned down at once',
        summary: 'Settings → 3D detail → Ultra Low: sub-native resolution, no shadows, no '
               + 'lighting passes, flat turf, a sparse crowd and the light player figures.',
        detail: 'Low still carried real costs: native resolution, its own antialiasing '
              + 'buffer, a full crowd and detailed turf. Ultra Low goes through every one of '
              + 'them. The match renders at 80% of your screen\u2019s pixels and stretches '
              + 'up — the single biggest saving on a weak GPU — with no shadows, no '
              + 'post-processing, flat pitch colour, minimal netting simulation, a thin '
              + 'terrace and a deliberately sparse crowd rather than none, because an empty '
              + 'bowl reads as broken while a quiet Tuesday crowd reads as a choice. Player '
              + 'models are always the light built-in figures on this tier.\n\nMeasured on '
              + 'the same scene with the same software renderer, Ultra Low runs three to four '
              + 'times faster than Low. It looks like a highlights reel from 2004, and that '
              + 'is the deal: every part of the game — every mode, every rule, every reward — '
              + 'is identical, only the picture is cheaper.',
      },
    ],
  },
  {
    version: 'v49',
    date: '2026-08-26',
    tag: 'Fix',
    title: 'The scroll wheel, found at last',
    lede: 'The mouse wheel really was dying — after a match, everywhere, until '
        + 'a reload. Found, fixed, and the menu got its key art.',
    entries: [
      {
        head: 'Scrolling no longer dies after a match',
        summary: 'Leaving a match could silently lock the whole page against scrolling until '
               + 'you reloaded. That was the wheel bug all along.',
        detail: 'During a match the page deliberately locks scrolling — there is nothing to '
              + 'scroll and a stray wheel would fight the camera. The unlock ran at the very '
              + 'end of the match teardown, after the graphics engine had been shut down, and '
              + 'if that shutdown failed on your graphics driver the unlock never ran. From '
              + 'then on nothing anywhere would scroll until a full reload, which is exactly '
              + 'what was reported — three times — and never reproduced in testing, because '
              + 'the tests never played a match first. The unlock now runs before anything '
              + 'that can fail, every risky teardown step is isolated so one failure cannot '
              + 'skip the rest, and navigation itself clears the lock as a backstop whenever '
              + 'you arrive anywhere that is not the match. Even a crashed match cannot take '
              + 'scrolling with it now.',
      },
      {
        head: 'Desktop gets desktop sizes',
        summary: 'The app was capped at tablet width on any monitor. It now fills a desktop '
               + 'properly and the menu doors scale up with it.',
        detail: 'Every screen was limited to 1,180 pixels wide — sized for a tablet, and on a '
              + 'desktop monitor it used barely six tenths of the screen, which is why '
              + 'everything looked small. The cap is now 1,520 pixels, the grids inside '
              + 'simply take the extra room, and on large screens the menu doors and their '
              + 'text grow to match.',
      },
      {
        head: 'The menu has key art',
        summary: 'The main menu now sits over a stadium backdrop — shot with the game\u2019s '
               + 'own renderer, graded dark so everything on top stays readable.',
        detail: 'The backdrop is a real frame from the match engine — this game\u2019s own '
              + 'stadium, floodlights and crowd, not stock art — captured at night settings '
              + 'and graded down into the app\u2019s palette so the wordmark and doors sit on '
              + 'it cleanly. It weighs about as much as one player portrait and is cached for '
              + 'offline play like everything else.',
      },
    ],
  },
  {
    version: 'v48',
    date: '2026-08-26',
    tag: 'Interface',
    title: 'The hub, the dock, and a store with shelves',
    lede: 'The whole game moves to the layout your thumbs already know — and '
        + 'objectives refresh twice as fast.',
    entries: [
      {
        head: 'A hub menu and a bottom dock',
        summary: 'The menu is now a rail of small tiles beside two big doors, and Ultimate '
               + 'XI\u2019s tabs live in a dock along the bottom edge, icon over label.',
        detail: 'The same four destinations and the same six tabs — nothing was added and '
              + 'nothing renamed — but the space now goes where sessions actually go. Kick '
              + 'Off and Ultimate XI are the two big doors; Career and Settings hold the '
              + 'rail. Kick Off is the one solid block of APEX green in the app, which is '
              + 'what makes it read as "press this first" without a word of copy, and the '
              + 'dock carries the cover\u2019s diagonal as a gradient line across its top. '
              + 'It is the layout every mobile football game trains thumbs on, wearing this '
              + 'game\u2019s colours.',
      },
      {
        head: 'The store has shelves',
        summary: 'Packs are half again bigger, sorted into named sections — On the house, '
              + 'Standard, Premium, Limited & Icons — and they sway gently instead of '
              + 'sitting in a flat grid.',
        detail: 'Twelve identical rectangles in a wall is a spreadsheet; a shop has '
              + 'sections. Each shelf has a name and a one-line pitch, the packs inside are '
              + 'much bigger, and a shelf scrolls sideways on its own when it needs to. The '
              + 'free bronze gets a shelf to itself because it is the one everybody comes '
              + 'back for.',
      },
      {
        head: 'Objectives refresh every six hours',
        summary: 'Finished objectives are replaced twice as fast — every six hours instead '
               + 'of twelve.',
        detail: 'A finished slot is dead space: it pays nothing and asks nothing, and '
              + 'twelve hours of it per rung was too long to stare at a tick. Unfinished '
              + 'objectives still keep their progress and their place, exactly as before.',
      },
      {
        head: 'The free bronze is on a clock',
        summary: 'One free bronze every six hours, with the countdown on the button — and '
               + 'the trick that banked unlimited free packs is gone.',
        detail: 'The free pack used to unlock by a count of packs you had opened — but '
              + 'claiming a pack never advanced that count, so at the right moment the '
              + 'button could be pressed forever and bank a bronze per click. It is a '
              + 'timer now: one every six hours, the button says how long is left, and a '
              + 'clock cannot be farmed by hoarding.',
      },
    ],
  },
  {
    version: 'v47',
    date: '2026-08-23',
    tag: 'Fix',
    title: 'Corrections to a club now actually stick',
    lede: 'Putting a balance right on the server did nothing — the game handed '
        + 'the old number straight back. Fixed.',
    entries: [
      {
        head: 'The server can correct a club again',
        summary: 'A balance corrected on the server was being overwritten by the copy on the '
               + 'player\u2019s own device, so the correction never took effect.',
        detail: 'When you sign in, the game compares the club stored on your device with the '
              + 'one stored on the server and keeps whichever has more progress in it. That '
              + 'comparison counts matches played, cards owned and packs opened — it never '
              + 'looked at your balance. So a balance corrected on the server scored exactly '
              + 'the same as the old one, the device decided its own copy was just as good, '
              + 'kept it, and then uploaded it back over the correction. It looked like it had '
              + 'worked and it had not.\n\nCorrections now carry a marker that the game '
              + 'honours ahead of the progress comparison, because a correction is not a '
              + 'conflict to be settled — it is an instruction. It applies once, on the next '
              + 'sign-in, and after that the usual "keep the fuller save" rule resumes as '
              + 'before. Nothing about ordinary play changes: if you play on two devices, the '
              + 'one with more progress still wins.',
      },
    ],
  },
  {
    version: 'v46',
    date: '2026-08-23',
    tag: 'Fix',
    title: 'Selling a player paid every click',
    lede: 'A card you sold could be sold again, and again, without ever leaving '
        + 'your club. That is fixed.',
    entries: [
      {
        head: 'Sold cards now actually leave, and only pay once',
        summary: 'Selling paid out on every click rather than once per card, and the player '
               + 'stayed on screen afterwards — so the same card could be sold indefinitely.',
        detail: 'Two things were wrong and it needed both to be as bad as it was. The coins '
              + 'were handed over whether or not there was still a card there to remove, so a '
              + 'second click on the same button paid in full for nothing. And the line that '
              + 'refreshes your balance was looking for something that only exists on the '
              + 'Store screens, so it failed on the Club screen before the squad could redraw '
              + '— which is why the sold player never disappeared and the Sell button stayed '
              + 'there, live, ready to be clicked again. With an auto-clicker that was a money '
              + 'printer, and at least one club reached three million Apex.\n\nThe payment is '
              + 'now decided by whether the card was actually removed, in the same step, so '
              + 'there is no gap between the two for a second click to slip into. A click on a '
              + 'card that is already gone now does nothing at all — no coins, no message, no '
              + 'sound. Measured with fifty rapid clicks on one card: it used to pay 4,700 and '
              + 'now pays 48, once.',
      },
      {
        head: 'The tutorial can no longer get stuck over the game',
        summary: 'If a tour step ever fails, the tour closes itself instead of leaving an '
               + 'invisible layer that swallows clicks and scrolling.',
        detail: 'The tour dims the screen with a layer that absorbs clicks on purpose. If a '
              + 'step failed to draw, that layer could be left behind with nothing visible on '
              + 'it — no way to see it and no way to dismiss it, while every click and scroll '
              + 'went nowhere. It now fails closed: any step that cannot be drawn shuts the '
              + 'tour down and hands the game back.',
      },
    ],
  },
  {
    version: 'v45',
    date: '2026-08-23',
    tag: 'Interface',
    title: 'The Store splits in three',
    lede: 'Packs, Locker and Icon Exchange are separate tabs now — and the '
        + 'tutorial no longer stops your mouse wheel working.',
    entries: [
      {
        head: 'Packs · Locker · Icon Exchange',
        summary: 'The Store is three tabs instead of one very long page, with the number of '
               + 'unopened packs shown on the Locker tab.',
        detail: 'All three used to be stacked on a single page around two thousand pixels '
              + 'long, which meant buying a pack and then scrolling past twelve of them to '
              + 'find the one you had just bought. They are three different jobs — spending, '
              + 'opening, and the one place that sells an exact Icon — and each fits on a '
              + 'screen by itself. The Locker tab carries a count when you have packs waiting, '
              + 'since that is the reason to go and look. Buying a pack leaves you on Packs, '
              + 'because the next thing you usually do is buy another.',
      },
      {
        head: 'The tutorial no longer blocks scrolling',
        summary: 'The mouse wheel and touch scrolling both work while the tour is open.',
        detail: 'The tour dims the screen with a layer that deliberately absorbs clicks, so a '
              + 'stray tap cannot half-navigate the game behind it and leave the tour pointing '
              + 'at a screen that is no longer there. That layer was absorbing scrolling too, '
              + 'and since the tour starts itself the first time you open this version, the '
              + 'first thing it did for a lot of people was appear to break the mouse wheel. '
              + 'Scrolling now passes through, which is safe because the highlight ring is '
              + 'repositioned every frame and simply follows whatever it is pointing at.',
      },
    ],
  },
  {
    version: 'v44',
    date: '2026-08-23',
    tag: 'New',
    title: 'A guided tour of the whole game',
    lede: 'New players now get walked through every mode, from Kick Off to '
        + 'Ultimate XI — and anyone can replay it from Settings.',
    entries: [
      {
        head: 'Twenty steps, ten chapters',
        summary: 'A spotlight tour that highlights each part of the game in turn and explains '
               + 'it in a sentence or two, starting with Kick Off and finishing with the '
               + 'objective ladder.',
        detail: 'It runs on the real interface rather than showing pictures of it: each step '
              + 'moves the game to the right screen, opens the right tab, and puts a ring '
              + 'around the actual thing being described while everything else dims. Chapters '
              + 'go Welcome, Kick Off, Ultimate XI, Your squad, Packs, Apex Division, '
              + 'Objectives, Challenges, Settings, Done — and each is short, so nothing arrives '
              + 'all at once.\n\nThe two control chapters lay the buttons out as a map: the '
              + 'key or pad button on the left, what it does on the right, for both moving and '
              + 'passing and for defending. Every step has Back, Next and a progress bar of '
              + 'chapter markers, and **Skip section** jumps straight past a chapter you '
              + 'already understand. Escape, Enter and the arrow keys all work. It can be '
              + 'closed at any point.',
      },
      {
        head: 'Start or replay it whenever you like',
        summary: 'Settings now has Replay tutorial as its very first row.',
        detail: 'The tour runs itself once, the first time a new save reaches the menu, and '
              + 'after that it lives at the top of Settings — the first row of the first '
              + 'panel, because someone who does not know how the game works should not have '
              + 'to know where to look for help. A brand new save gets the tour rather than '
              + 'the changelog, since release notes for a version you have never run are noise '
              + 'if you have not played the game at all.',
      },
    ],
  },
  {
    version: 'v43',
    date: '2026-08-23',
    tag: 'Interface',
    title: 'Screens that move, packs that look like packs',
    lede: 'Opening something now looks like going somewhere, and the store art '
        + 'is a foil pack with cards in it rather than a coloured rectangle.',
    entries: [
      {
        head: 'Screens arrive and leave',
        summary: 'The screen you are leaving is pushed away as the new one rises in, so opening '
               + 'a tile feels like moving rather than like a page reloading.',
        detail: 'The old screen used not to go anywhere — it was simply replaced, and the new '
              + 'one faded up over the gap. Nothing acknowledged the thing you had just '
              + 'pressed, which is what made it feel instant in the wrong way. Now the screen '
              + 'you are leaving stays on show for a moment and travels: heading deeper it '
              + 'recedes, as though you moved past it, and coming back to the menu it drops '
              + 'towards you instead, so the direction you are going is legible without a '
              + 'label. The panels on the arriving screen come in one after another rather '
              + 'than as one slab. None of it delays anything — the screen is fully there and '
              + 'usable from the first frame, the animation is only what you see on the way. '
              + 'Reduce Motion turns all of it off.',
      },
      {
        head: 'The store art is an actual pack',
        summary: 'Each pack is now a foil packet with cards fanned out behind it and the number '
               + 'of cards printed on the front.',
        detail: 'The art was a coloured rectangle with the letters UXI on it, which told you '
              + 'nothing and looked the same on every pack but the colour. It is now a foil '
              + 'face with a torn tear-strip along the top and two card edges fanning out '
              + 'behind, so it reads as something containing cards before you have read a '
              + 'word — and the pack size sits on the front, which is the first number anyone '
              + 'wants and used to be buried in the small text. On anything with a mouse, a '
              + 'highlight sweeps across the foil when you hover it.',
      },
    ],
  },
  {
    version: 'v42',
    date: '2026-08-23',
    tag: 'Progression',
    title: 'Eight more objectives, two more packs, best card last',
    lede: 'The ladder runs to thirty-two rungs, the store has twelve packs, and '
        + 'a pack now builds to its best card instead of spending it first.',
    entries: [
      {
        head: 'The best card in a pack comes out last',
        summary: 'Packs now reveal worst to best, so every card is better than the one before '
               + 'and the pack finishes on its biggest name.',
        detail: 'Cards used to appear in whatever order they were drawn, which meant a 92 could '
              + 'walk out first and leave you three bronzes to sit through afterwards — the '
              + 'pack peaked in the first second and then apologised for the rest. They are now '
              + 'ordered by rating, so a pack climbs and the card it was building towards is '
              + 'the one still on screen at the end. Nothing about what you get has changed, '
              + 'only when you see it.',
      },
      {
        head: 'Eight more objectives',
        summary: 'The ladder is thirty-two rungs instead of twenty-four, with the new ones '
               + 'spread through it rather than bolted on the end.',
        detail: 'The new rungs sit where they belong on the curve — a couple early, several '
               + 'through the middle grind, and one more in the deep end that pays Ultimate for '
               + 'reaching Division 2. Three of them pay the packs added in the last update, so '
               + 'Keeper, Lucky Dip and Squad Builder can be earned rather than only bought. If '
               + 'you have already finished objectives, nothing is lost or repeated: the ones '
               + 'you have claimed stay claimed and you simply start being dealt the new ones.',
      },
      {
        head: 'The Objectives tab shows the whole climb',
        summary: 'A bar across the top tracks progress through all thirty-two, and anything you '
               + 'are close to finishing is now highlighted.',
        detail: 'The per-objective bars tell you how one slot is going, but there was nowhere '
              + 'to see how the ladder itself was going — which is what the rewards are '
              + 'actually attached to. There is now a single bar for the whole run, with a '
              + 'marker showing where the Ultimate-paying rungs begin. Objectives at 70% or '
              + 'more are picked out and tell you how many are left, because the one you are '
              + 'two goals away from is the reason to play another match and it used to look '
              + 'exactly like one you had barely started.',
      },
      {
        head: 'High Roller and The Eleven',
        summary: 'A one-card gamble with the best single-card odds in the store, and an '
               + 'eleven-card pack for filling a squad in one go.',
        detail: 'High Roller (26,000) is a single card, nothing below 79, and about a quarter '
              + 'of the time it is the best one card you can buy without paying Limited money — '
              + 'the rest of the time you paid Prime prices for one gold, which is what makes '
              + 'it a decision. The Eleven (45,000) is a whole squad\u2019s worth in one pack '
              + 'with a guaranteed special, for filling out a side or feeding a squad-building '
              + 'challenge rather than chasing a headline.',
      },
      {
        head: 'The menu opens rather than appears',
        summary: 'The tiles deal in one after another, and pressing one now feels like it '
               + 'happened when your finger landed.',
        detail: 'Four doors arriving in sequence reads as the app opening; four doors already '
              + 'there reads as a page load, and this is the screen you see most. The press '
              + 'response is also much faster now, and the lift-on-hover is limited to devices '
              + 'that actually have a pointer — on a phone there is no hover to enter, so it '
              + 'only ever appeared after a tap, as something left behind. Nothing has been '
              + 'added to the menu itself.',
      },
    ],
  },
  {
    version: 'v41',
    date: '2026-08-23',
    tag: 'Diagnostics',
    title: 'Undoing a wrong call, and widening the net',
    lede: 'The last release was diagnosed from a screenshot that turned out not '
        + 'to contain the glitch at all. That change is reverted, and the '
        + 'built-in check now watches for three faults instead of one.',
    entries: [
      {
        head: 'Last release\u2019s shading change is reverted',
        summary: 'v40 softened the contact shading based on a photo that, it turns out, showed '
               + 'a perfectly normal frame. The original look is back.',
        detail: 'A frame was sent showing a dark wedge across the goalmouth, and it was read as '
              + 'the shading effect blacking out an area. It was not — it was ordinary stadium '
              + 'shadow, and the real flicker simply had not been caught. Since the reason for '
              + 'the change was wrong, the change is undone and the contact shading looks '
              + 'exactly as it did before. The separate fix from the release before, which '
              + 'stopped an invalid number reaching the screen, stays: that one was a genuine '
              + 'defect regardless of this.',
      },
      {
        head: 'The frame check now names which fault it found',
        summary: 'With Show FPS on, the badge reports three different problems separately, so a '
               + 'single photo of it identifies the cause.',
        detail: 'The flicker lasts a split second and repeats, which is exactly why it never '
              + 'survives a screenshot — you cannot press a key inside one frame. So the game '
              + 'watches for it instead, and it now distinguishes three separate faults rather '
              + 'than one. The badge will read something like "98 FPS - 2 draw" or "- 3 prog" '
              + 'or "- 1 tex". "draw" means the frame was never properly drawn. "prog" means a '
              + 'piece of graphics code was built mid-match, which can leave an object black '
              + 'for a frame while it happens — that work is supposed to be finished during the '
              + 'loading screen, so any count here points straight at what was missed. "tex" '
              + 'means an image was sent to the graphics card mid-match, and an object whose '
              + 'image has not arrived draws black. All three are read from counters the engine '
              + 'already keeps, so none of it costs any performance, and across a full match of '
              + 'normal play all three stay at zero.',
      },
    ],
  },
  {
    version: 'v40',
    date: '2026-08-23',
    tag: 'Graphics',
    title: 'The black patches were the shading, not a glitch',
    lede: 'A screenshot from a machine it happens on settled it: the frame was '
        + 'being drawn perfectly, at 98 frames a second, and then shaded almost '
        + 'to black in patches.',
    entries: [
      {
        head: 'Contact shading can no longer darken a pixel to nothing',
        summary: 'The shading effect was allowed to take part of the picture down to 8% '
               + 'brightness, which looks black. It is now limited to half, so a mistake shows '
               + 'as slightly dark rather than as a hole.',
        detail: 'Every previous attempt at this assumed a frame was going missing — memory, '
              + 'drivers, the browser failing to show it. A screenshot ended that: the frame '
              + 'was complete, running at 98 frames a second, the built-in frame checker was '
              + 'reporting nothing wrong, and the dark wedge was simply part of the picture. So '
              + 'it was never a lost frame. It was shading.\n\nThe effect responsible is the '
              + 'soft contact darkening that grounds players on the grass and puts shade in the '
              + 'folds of the net. It works by comparing each pixel against its neighbours, and '
              + 'it was allowed to darken one by up to 92% — down to almost nothing. Real '
              + 'contact shading is nowhere near that strong, so the headroom was doing no good '
              + 'and left the effect one bad reading away from blacking out an area. Bad '
              + 'readings are easy to come by: the calculation relies on depth, which loses '
              + 'accuracy at shallow viewing angles and at distance, and where it does, every '
              + 'comparison reports "fully shadowed" at once and a whole region goes dark '
              + 'together with a hard edge.\n\nUltra asked for the strongest version of this '
              + 'effect of any setting, which is why it happened there and not on High — the '
              + 'one detail no earlier explanation could account for. The effect is now capped '
              + 'at half brightness and Ultra no longer asks for extra strength. Genuine '
              + 'contact shadows sit well inside the new limit and look exactly as before; the '
              + 'difference is that a bad reading is now a slightly dark patch instead of a '
              + 'black one.',
      },
    ],
  },
  {
    version: 'v39',
    date: '2026-08-23',
    tag: 'Graphics',
    title: 'A divide-by-zero in the lighting pass',
    lede: 'Found an actual bug this time rather than a plausible story: one '
        + 'calculation could divide by zero, and a pixel that does that comes '
        + 'out black.',
    entries: [
      {
        head: 'The black patches, again — but this one is a real defect',
        summary: 'The shading pass could produce an invalid number in flat areas, and pixels '
               + 'holding an invalid number draw as black. Fixed at the source, with a safety '
               + 'net behind it.',
        detail: 'The lighting pass works out which way each pixel faces by comparing how depth '
              + 'changes across the screen. Where the picture is flat — a surface square to the '
              + 'camera, a run of pixels all at the same distance, or far enough away that the '
              + 'depth buffer runs out of precision — that comparison gives zero, and the next '
              + 'step divided by it. Dividing by zero gives an invalid number, an invalid '
              + 'number multiplied into a colour stays invalid, and a pixel holding one is '
              + 'drawn black. A patch of screen where that happens is a black patch, which is '
              + 'exactly what has been reported.\n\nIt is fixed where it starts: the '
              + 'calculation now checks before dividing and falls back to a sensible default. '
              + 'There is also a net at the end of the pass that catches an invalid pixel from '
              + 'anywhere else and shows the normal picture for it instead — so the worst case '
              + 'is now one frame slightly less shaded, rather than a black hole. Worth being '
              + 'straight: this is the sixth attempt at this bug, but it is the first one that '
              + 'fixes something demonstrably broken in the code rather than something that '
              + 'merely fitted the symptoms.',
      },
    ],
  },
  {
    version: 'v38',
    date: '2026-08-23',
    tag: 'Graphics',
    title: 'Found it: Ultra was asking for too much',
    lede: 'The black patches only ever happened on Ultra, and Ultra was quietly '
        + 'rendering at four times the area of your screen.',
    entries: [
      {
        head: 'Ultra no longer renders itself off a cliff',
        summary: 'On a 1440p or 4K screen Ultra was allocating hundreds of megabytes more than '
               + 'it needed. It now scales that back — and on 1080p screens, phones and tablets '
               + 'nothing changes at all.',
        detail: 'Ultra supersamples: it draws the match larger than your screen and shrinks it '
              + 'down, which is what makes the edges clean. The problem was the "larger" had no '
              + 'ceiling — it always asked for at least double, whatever you were playing on, '
              + 'so a 4K screen was being drawn at 7680x4320. That is thirty-three million '
              + 'pixels, and the match keeps several full-size buffers of it at once for the '
              + 'lighting and blur passes, each one eight bytes a pixel. The total came to '
              + 'roughly a gigabyte of graphics memory. When a card cannot find that much, the '
              + 'buffer either fails outright — and something that failed to allocate draws '
              + 'nothing, which is a black patch — or it succeeds by pushing something else '
              + 'out, and then keeps fighting for the space, which is a black patch that moves '
              + 'around and comes back. That is exactly what was being reported, and it '
              + 'explains why it only ever happened on Ultra.\n\nThere is now a ceiling: the '
              + 'card\'s own maximum buffer size, and a cap on total pixels. It is set so that '
              + '1080p and below, and every phone and tablet, keep precisely the quality they '
              + 'already had — most people will see no difference whatsoever. A 1440p screen '
              + 'renders a little under 1.6x instead of 2x, and 4K renders at about its own '
              + 'resolution, which is still the full Ultra effect chain, just not four times '
              + 'the area of the screen it is being shown on.',
      },
    ],
  },
  {
    version: 'v37',
    date: '2026-08-23',
    tag: 'Diagnostics',
    title: 'Hunting the black flash properly',
    lede: 'Three attempts at this have missed. Rather than a fourth guess, this '
        + 'build can tell us which half of the problem it is in.',
    entries: [
      {
        head: 'The game now watches for the black frame itself',
        summary: 'Turn on Show FPS and the badge reports any frame that looks wrong, so the '
               + 'cause can be narrowed down instead of guessed at.',
        detail: 'The black flash turns out to happen on desktop as well as iPad, which rules '
              + 'out most of what the last three fixes assumed — they were all built on it '
              + 'being a tablet graphics problem. A frame that goes black is one of two very '
              + 'different faults: either the game failed to draw it, or the game drew it and '
              + 'the browser failed to put it on screen. Those need opposite fixes, and until '
              + 'now there was no way to tell which was happening. The match now counts the '
              + 'drawing work it issues each frame and flags any frame that falls far below '
              + 'normal, with the match clock alongside it. If the count climbs when you see a '
              + 'flash, the fault is in the game; if you see flashes and the count stays at '
              + 'zero, the game drew a perfectly good frame that never arrived. It reads a '
              + 'counter that already existed, so it costs no performance, and across a full '
              + 'match of normal play it reports nothing at all.',
      },
    ],
  },
  {
    version: 'v36',
    date: '2026-08-23',
    tag: 'Gameplay',
    title: 'Three new packs, and an opponent who fights back',
    lede: 'Go three up and the other lot start playing like it. Plus Keeper, '
        + 'Lucky Dip and Squad Builder packs, a store that lines up properly, '
        + 'and a fix for online controls being the wrong way round.',
    entries: [
      {
        head: 'The CPU raises its game when you are cruising',
        summary: 'The further ahead you get, the harder the opposition presses — so a big '
               + 'lead is something you have to see out rather than something that plays itself.',
        detail: 'A three-goal lead with two minutes left was the most boring state this game '
              + 'could produce: the result was settled and nothing that happened next mattered. '
              + 'From two goals up the opposition now starts closing quicker, tackling more and '
              + 'shooting sooner, topping out at a four-goal lead — about four divisions worth '
              + 'of extra competence, on the same dial the ladder itself uses. Three things it '
              + 'deliberately does not do: it never goes below the difficulty the match started '
              + 'at, so being behind never makes the opposition go easy on you; a one-goal lead '
              + 'does nothing at all, because one goal is still a match; and it never touches '
              + 'your own team-mates, only the side you are playing against. It stays off '
              + 'entirely in online and couch matches, where both teams already have a person '
              + 'on them.',
      },
      {
        head: 'Keeper, Lucky Dip and Squad Builder',
        summary: 'Three new packs: a guaranteed goalkeeper, a cheap one-card gamble, and an '
               + 'eight-card bulk pack between Gold and Prime.',
        detail: 'Keeper (3,500) hands over a goalkeeper, certainly — a squad cannot be fielded '
              + 'without one and the odds of one turning up in a four-card pack were about one '
              + 'in four. Lucky Dip (5,000) is a single card with deliberately top-heavy odds '
              + 'for the price: the whole point is that it is over in one reveal. Squad Builder '
              + '(15,000) is eight cards with a gold minimum, worse per card than Prime and far '
              + 'better per Apex — the one to buy when a squad-building challenge wants bodies '
              + 'rather than a headline. It also fills the gap between Gold and Prime, which '
              + 'was a jump from 7,500 straight to 30,000.',
      },
      {
        head: 'Prime now actually keeps its promise',
        summary: 'Prime packs said "82+ min" and delivered it about two times in five. Now it '
               + 'is every time.',
        detail: 'When a Prime pack rolled a card below 82 it redrew at gold rarity — and gold '
              + 'starts at 79, so the replacement could be a 79, 80 or 81 and frequently was. '
              + 'Measured over four hundred opens, only 42% of Prime packs held to the number '
              + 'printed on the card that sold them. The redraw is now constrained to clear the '
              + 'bar, which takes that to 100%.',
      },
      {
        head: 'The store lines up, and online controls are the right way round',
        summary: 'Pack prices now sit on one line across each row, packs have their own '
               + 'colours and artwork, and online no longer shows you the wrong buttons.',
        detail: 'Two unrelated fixes. In the store, cards carry different amounts of text — '
              + 'only some have a guarantee line — and the buy buttons landed at whatever '
              + 'height their own content ran out at, so a row of packs read as a row of things '
              + 'at slightly wrong heights; every price now sits on one baseline. Online, the '
              + 'touch buttons read the wrong seat: both machines build the same two-seat match '
              + 'and the labels were always taken from the host\'s side, so if you joined a '
              + 'match you saw PASS and SHOOT while defending and TACKLE while on the ball, and '
              + 'the power rings filled with your opponent\'s shot rather than yours.',
      },
      {
        head: 'Another go at the black flash',
        summary: 'The blurred panels over the pitch have been made flat, which is a much better '
               + 'suspect for the black rectangles than anything tried so far.',
        detail: 'The last two attempts at this treated it as a graphics-driver problem. It is '
              + 'more likely never to have been one. The scoreline, the HUD buttons and the '
              + 'full-screen goal card all blurred whatever was behind them, and what is behind '
              + 'them is the pitch being redrawn sixty times a second — which forces the system '
              + 'to keep sampling a picture that is still being painted. When that sample comes '
              + 'back too early the panel composites over nothing, and you get a black '
              + 'rectangle with hard stepped edges exactly like the ones being reported. Those '
              + 'three are flat now, which costs almost nothing because they were already nearly '
              + 'opaque. Menus keep their blur — there is no live pitch behind those. This is '
              + 'still a reasoned fix rather than a confirmed one, so if it persists, that '
              + 'genuinely narrows things down.',
      },
    ],
  },
  {
    version: 'v35',
    date: '2026-08-15',
    tag: 'App',
    title: 'Support, and a changelog you can get back to',
    lede: 'The App panel is the first thing in Settings now instead of the last, '
        + 'and it has a way to email us and a link to these notes.',
    entries: [
      {
        head: 'Email support from inside the game',
        summary: 'Settings opens on a Support row with a Send email button, so getting hold of '
               + 'us does not mean hunting for an address.',
        detail: 'There was already a support address in the App panel, but that panel was last '
              + 'on a screen about two thousand pixels tall, and a phone held sideways shows '
              + 'about four hundred of them at a time. It sat three screens down, behind the '
              + 'sim-speed, sound and graphics panels — the settings people change once and '
              + 'never open again. The App panel is now first, so Support, the changelog, the '
              + 'build stamp and Force update are all on screen the moment Settings opens.',
      },
      {
        head: 'The changelog has a permanent home',
        summary: 'A Changelog button in Settings opens the full release history, any time.',
        detail: 'These notes appeared once, as a card over the menu, the first time you opened '
              + 'a new build. Dismiss it and there was no way back to them from inside the game '
              + 'at all — the full archive existed but nothing linked to it. Settings links to '
              + 'it now.',
      },
    ],
  },
  {
    version: 'v34',
    date: '2026-08-14',
    tag: 'Gameplay',
    title: 'One tackle, and bigger touch buttons',
    lede: 'Standing tackle and slide tackle were the same move wearing two names — '
        + 'now there is one, fouls only happen on a mistimed one, and touch controls '
        + 'are sized for the screens people actually play on.',
    entries: [
      {
        head: 'A single committed tackle',
        summary: 'Tackling is now one action, on every button that used to throw a pass, '
               + 'through ball, cross, or shot while off the ball — and it always commits, '
               + 'the way a slide used to.',
        detail: 'There used to be two tackle methods with a boolean between them: a standing '
              + 'version with a short reach and a low foul chance, and a sliding version with a '
              + 'lunge and a flat 34% chance of conceding a penalty in the box, regardless of '
              + 'whether the challenge was actually late. Nothing about pressing one button over '
              + 'the other read as a different move, and a flat foul chance meant a clean, '
              + 'well-timed slide was punished exactly as often as a reckless one. Both are gone. '
              + 'There is one tackle now, and it always lunges. Whether it concedes a foul is '
              + 'driven by how far the defender was from the ball carrier the moment the tackle '
              + 'was committed, as a fraction of the reach — close in, a fair contest for the '
              + 'ball; a late stretch from further out, a foul risk that rises with the square of '
              + 'that distance. A bad tackle is now one that was thrown from too far away, not a '
              + 'coin flip.',
      },
      {
        head: 'Touch buttons sized for the screen they are actually on',
        summary: 'Touch controls are noticeably bigger on iPhone and iPad, with iPad getting its '
               + 'own larger tier instead of sharing sizing with phones.',
        detail: 'The old "make small screens smaller" rule keyed off CSS width, but this match '
              + 'only ever plays in landscape, where a phone\'s width is its long edge — an '
              + 'iPhone in landscape is wider than the breakpoint that was supposed to catch it, '
              + 'so the rule almost never fired, and iPads never had a sizing tier of their own at '
              + 'all. Sizing now keys off pointer type instead: any touch device gets bigger '
              + 'buttons than the desktop default, phones (short landscape height) get a tier '
              + 'tuned for a cramped screen, and tablets (tall landscape height) get the biggest '
              + 'tier of all. The old tackle/slide split also freed up a button slot, which went '
              + 'straight to making TACKLE bigger rather than sitting empty.',
      },
    ],
  },
  {
    version: 'v33',
    date: '2026-08-10',
    tag: 'Performance',
    title: 'Shaders built before kick-off',
    lede: 'A second go at the black flash some devices show mid-match — this '
        + 'time at the thing that actually stalls a frame.',
    entries: [
      {
        head: 'Everything is compiled during the loading screen',
        summary: 'The graphics code the match needs is now built up front instead of the first '
               + 'time each piece happens to appear on screen.',
        detail: 'Graphics drivers build a shader the first time the thing that uses it is '
              + 'actually drawn. This match has a lot of them — the turf, each kit and skin tint, '
              + 'the crowd, the boards, the light shafts, the nets — and on a tablet each one can '
              + 'take tens of milliseconds, on the main thread, in the middle of a frame. A frame '
              + 'that stalls that long gets shown half-drawn: the parts that finished are there '
              + 'and the rest is black. It would fire again every time something new came into '
              + 'view — a substitute, a replay cutting the camera somewhere new — which is why it '
              + 'kept happening and in a different place each time. They are all built during the '
              + 'loading screen now, which was already waiting anyway.',
      },
    ],
  },
  {
    version: 'v32',
    date: '2026-08-10',
    tag: 'Balance',
    title: 'Shorter division matches',
    lede: 'Apex Division and online matches are three minutes instead of four.',
    entries: [
      {
        head: 'Three minutes a match',
        summary: 'Division and online matches are a quarter shorter, so a session gets through '
               + 'more of the ladder.',
        detail: 'Four minutes was long enough to drag. Three is not simply "as short as '
              + 'possible", though: a shorter match has less football in it, and past a point '
              + 'that is boring in a different way. Measured over forty matches at each length, '
              + 'four minutes gives 2.38 goals a game with one in ten finishing goalless, three '
              + 'minutes gives 1.85 with one in twenty, and two minutes collapses to 1.20 with a '
              + 'quarter of matches ending 0-0. Three is where it stops dragging without '
              + 'starting to feel empty.',
      },
    ],
  },
  {
    version: 'v31',
    date: '2026-08-10',
    tag: 'Graphics',
    title: 'Every fixture, a different ground',
    lede: 'Stadiums are built to order now — big and small, open and covered, '
        + 'packed and half empty, some closing their corners into a bowl.',
    entries: [
      {
        head: 'No two fixtures share a stadium',
        summary: 'The ground is invented from the two teams playing, so every fixture has its '
               + 'own — and the same fixture always looks the same place twice.',
        detail: 'Every match used to be played in one identical stadium: the same three stands, '
              + 'the same height, the same roof, the same crowd, every time. The terracing depth '
              + 'and height, the roof, the seat colours and the floodlights are all drawn from '
              + 'the fixture now. Because the Apex Division fields a different opponent club on '
              + 'every rung, climbing the ladder walks you through eleven different grounds.',
      },
      {
        head: 'Curved corners on the big ones',
        summary: 'The larger stadiums close their corners into a bowl instead of being three '
               + 'separate stands with a gap you can see the night through.',
        detail: 'Quarter-rings of terracing join the far stand to each side, with the crowd '
              + 'swept round them and spaced by arc length so the density matches the straight '
              + 'banks. Only the far corners — the near touchline stays open because that is '
              + 'where the camera lives.',
      },
      {
        head: 'Attendance is its own thing',
        summary: 'Some grounds are packed, some are half empty, and it has nothing to do with '
               + 'how big they are.',
        detail: 'Size and attendance are drawn independently on purpose. A packed small ground '
              + 'and a half-full bowl are both real, and both more interesting than every '
              + 'stadium in the game being sold out. Small grounds are open terracing too, so '
              + 'you can see the sky over the far end — which is most of what makes one read as '
              + 'a smaller place than the last.',
      },
    ],
  },
  {
    version: 'v30',
    date: '2026-08-10',
    tag: 'Progression',
    title: 'Objectives that keep coming',
    lede: 'A ladder of 24, seven at a time, refreshing twice a day — and the '
        + 'last six pay Ultimate.',
    entries: [
      {
        head: 'A 24-rung ladder',
        summary: 'You hold seven objectives at a time out of twenty-four, and the counter now '
               + 'reads how far through the whole ladder you are.',
        detail: 'The old seven were fixed: finish them and objectives were over. There are '
              + 'twenty-four now, in order, and they get harder and pay better the further down '
              + 'you go — from a silver pack and pocket change at the top to a Limited pack and '
              + 'a five-figure sum at the bottom.',
      },
      {
        head: 'Finished ones refresh every 12 hours',
        summary: 'Complete an objective and it is replaced at the next refresh, twice a day. '
               + 'Ones you are midway through keep their progress and their place.',
        detail: 'Only the finished slots are refilled — a refresh rewards finishing things '
              + 'rather than resetting the board, so a long objective you are grinding is never '
              + 'taken away from you. The countdown is on the tab, and it only lights up when '
              + 'there is actually something waiting to be swapped out. Nothing runs in the '
              + 'background: the clock is stored and checked when you look, so it works after '
              + 'the app has been closed for a week.',
      },
      {
        head: 'The last six pay Ultimate',
        summary: 'Ultimate was only obtainable by winning in Division 1 and Apex Elite. The '
               + 'bottom six rungs of the ladder now pay it too.',
        detail: 'Between them they are worth 50 Ultimate — but they ask for Division 1, Apex '
              + 'Elite, seven wins in a row, 75 goals and 40 division wins, so it is a season\u2019s '
              + 'work rather than an afternoon. A new Limited: Legends pack sits at the very '
              + 'bottom, with the best odds in the game.',
      },
    ],
  },
  {
    version: 'v28',
    date: '2026-08-10',
    tag: 'Interface',
    title: 'One Club tab',
    lede: 'Squad and Your Club were two tabs doing one job. They are now one '
        + 'tab with three faces.',
    entries: [
      {
        head: 'Squad, Club Badge and Club Name live together',
        summary: 'The Club tab opens on your eleven, with the badge and the name a tap away on '
               + 'its own second row.',
        detail: 'Picking your eleven and picking your badge are the same job — running your '
              + 'club — but they sat at the same level as "play a match" and "buy a pack", which '
              + 'made the top row longer without making anything easier to find. The second row '
              + 'is deliberately a different shape from the first: condensed capitals on a rule '
              + 'with the accent underlining the open one, rather than a second set of pills, so '
              + 'two navigations stacked together read as a hierarchy instead of as one long run '
              + 'of buttons.',
      },
      {
        head: 'The name page shows the scoreboard',
        summary: 'Choosing your three letters now previews the actual in-match scoreboard, badge '
               + 'and all.',
        detail: 'Three letters is what fits beside the score during a match, so that is the '
              + 'thing they should be chosen against. The preview is the real component, not a '
              + 'drawing of it, and it updates as you type.',
      },
    ],
  },
  {
    version: 'v27',
    date: '2026-08-10',
    tag: 'Housekeeping',
    title: 'A pass over the small things',
    lede: 'A code and interface audit — a missing reward, cards that did not '
        + 'look clickable, and a module every device was downloading for nothing.',
    entries: [
      {
        head: 'Objectives now show their Ultimate reward',
        summary: 'Reaching Apex Elite pays 6 Ultimate. The objectives list was the one place '
               + 'that never said so.',
        detail: 'Ultimate is the currency you cannot grind, and the Icon Exchange is what it '
              + 'buys — so the two places that pay it need to advertise it. The challenges list '
              + 'already did; the objectives list showed only the Apex and the pack.',
      },
      {
        head: 'Submission cards look clickable',
        summary: 'The cards you pick from when building a squad challenge now respond to hover '
               + 'and touch.',
        detail: 'They carried no styling at all, so a clickable card showed a text cursor and '
              + 'gave no sign that tapping it would do anything.',
      },
      {
        head: 'A dead module off the download',
        summary: 'An unused physics module was being cached on every device, and listed twice.',
        detail: 'A cloth simulation written for goal netting was never wired up, but it sat in '
              + 'the offline file list — twice — so every install downloaded and stored code '
              + 'nothing runs. The file is still in the project for whenever the nets get built; '
              + 'it just is not shipped any more.',
      },
    ],
  },
  {
    version: 'v26',
    date: '2026-08-10',
    tag: 'Performance',
    title: 'Cutting the memory the match holds',
    lede: 'Chasing the black flicker some devices show mid-match. Two large '
        + 'allocations were being made for nothing.',
    entries: [
      {
        head: 'No more wasted antialiasing buffer',
        summary: 'The game was asking the browser for a multisampled canvas it never actually '
               + 'drew to. On a tablet that is tens of megabytes of graphics memory, every frame, '
               + 'for no picture at all.',
        detail: 'Every detail level above Low renders through a chain of post-processing passes: '
              + 'the scene goes into an off-screen buffer, the passes work on it, and the result '
              + 'is drawn as a single image at the end. The canvas\u2019s own multisample buffer is '
              + 'never what you see — but it was still being allocated and resolved every frame. '
              + 'The picture is unchanged; the antialiasing was already being done further down '
              + 'the chain.',
      },
      {
        head: 'A smaller shadow map at Ultra',
        summary: 'Ultra now uses a 2048 shadow map instead of 4096 — 67 MB of graphics memory '
               + 'back, with no visible difference.',
        detail: 'The shadow camera covers about 160 by 140 metres, so 2048 works out at roughly '
              + 'thirteen shadow pixels per metre. That is already past the point where more '
              + 'resolution shows up on something the size of a footballer, while the larger map '
              + 'had to share memory with the post-processing buffers and a 14 MB player model.',
      },
      {
        head: 'The lens pass can no longer guess',
        summary: 'If the depth information is ever missing for a frame, the picture now comes '
               + 'through ungraded instead of being darkened.',
        detail: 'The occlusion and depth-of-field pass reads how far away every pixel is. Given '
              + 'nothing to read, it would previously treat the whole frame as touching itself '
              + 'and shade a dark slab across it. It now detects that and passes the frame '
              + 'through untouched.',
      },
    ],
  },
  {
    version: 'v25',
    date: '2026-08-10',
    tag: 'Balance',
    title: 'The division fights back',
    lede: 'Apex Division opponents are now built to match the squad you field. '
        + 'The ladder is a contest instead of a formality.',
    entries: [
      {
        head: 'Opponents that scale with you',
        summary: 'Division matches now field a side built against your own squad rating, so '
               + 'improving your team raises the bar instead of lowering it.',
        detail: 'The ladder used to put you against a real club — the worst in the world at '
              + 'division 10, the best at Apex Elite. The best club in the world is rated 86, so '
              + 'the ceiling of the entire ladder sat below any Ultimate XI with an Icon in it. '
              + 'You could climb to division 5 without losing a match and win 6-0, 9-0, 4-0. The '
              + 'opponent is now built to measure: about 0.88x your rating at division 10, level '
              + 'with you around division 5, and 1.10x by Apex Elite — where you are the '
              + 'underdog and are expected to lose some.',
      },
      {
        head: 'They press you from division 5 up',
        summary: 'From division 5 the CPU sends a second man at whoever has the ball. You will '
               + 'not get time to pick a pass.',
        detail: 'Rating alone could never have fixed this. Measured over hundreds of simulated '
              + 'matches, a thirteen-point rating advantage is worth only about four points of '
              + 'win rate — while a human beats a same-rated CPU nearly every time. Competence '
              + 'is the lever that matters, so the higher divisions press harder, push further '
              + 'up the pitch, and commit to their chances more often.',
      },
      {
        head: 'You can see what you are walking into',
        summary: 'The division screen names your next opponent, their rating against yours, and '
               + 'whether you are favourite.',
        detail: 'A difficulty that moves with your squad has to be stated out loud, or a sudden '
              + 'hard match reads as the game cheating. The result screen also now tells you '
              + 'where the ladder stands — how many wins from promotion, or that one more defeat '
              + 'sends you down.',
      },
    ],
  },
  {
    version: 'v24',
    date: '2026-08-10',
    tag: 'Presentation',
    title: 'Release notes, in the game',
    lede: 'Every update now introduces itself when you open the game — and links '
        + 'to the full story if you want it.',
    entries: [
      {
        head: 'What\u2019s new, once per build',
        summary: 'A card appears after the title screen the first time you open a new version, '
               + 'summarising what changed.',
        detail: 'It shows up over the main menu rather than in front of the START button, so it '
              + 'never stands between you and the game — the menu is already drawn behind it, and '
              + 'dismissing it leaves you exactly where you were heading. Each build announces '
              + 'itself exactly once per device.',
      },
      {
        head: 'The full notes',
        summary: 'Every card links through to a page carrying the complete history, with the '
               + 'reasoning behind each change.',
        detail: 'The in-game card is the short version: one sentence per change, written for '
              + 'someone who wants to get back to playing. This page is the long one — what '
              + 'changed, why, and what it cost. Both are built from the same source, so they '
              + 'cannot drift apart.',
      },
    ],
  },
  {
    version: 'v23',
    date: '2026-08-10',
    tag: 'Presentation',
    title: 'Kick-off, properly',
    lede: 'A loading screen that actually waits, a half time worth taking, '
        + 'and a club that belongs to you.',
    entries: [
      {
        head: 'A real loading screen',
        summary: 'Matches now open on a proper loading screen instead of starting rough and '
               + 'sharpening up a few seconds later.',
        detail: 'The match used to begin on simple stand-in figures and swap to the scanned '
              + 'players the moment the 14 MB model finished downloading, so the opening seconds '
              + 'looked cheap and then abruptly did not. The loading screen waits on two things '
              + 'now — a short deliberate pause, and the models genuinely being ready — so the '
              + 'picture you kick off with is the picture you keep. The match is held completely '
              + 'still behind it, and the scene renders anyway so the shaders are compiled before '
              + 'your first touch rather than stuttering on it.',
      },
      {
        head: 'Half time is a break',
        summary: 'The whistle goes, the score comes up, and the game waits for you — with '
               + 'substitutions open.',
        detail: 'Half time used to last 1.8 seconds and then teleport everyone back to their '
              + 'starting positions with no warning, which read as a glitch rather than an '
              + 'interval. It now stops the match dead, announces itself, and opens the pause '
              + 'menu on the substitutions panel, because a spent full-back at forty-five minutes '
              + 'is exactly the decision a half-time break exists for. Nothing moves until you '
              + 'ask for the second half. Online matches are excluded — the other player is '
              + 'still out there, and a break on one machine only is not a break.',
      },
      {
        head: 'Your club',
        summary: 'Give your Ultimate XI a name, a badge and a kit. Worn on the pitch and shown '
               + 'to whoever you play online.',
        detail: 'A new Your Club tab in Ultimate XI: a club name, a three-letter code, one of '
              + 'twelve kit palettes, and a crest built from a shape, a pattern and a device. '
              + 'Every option previews itself wearing the rest of your club rather than in '
              + 'isolation. The kit colours are the ones the shirts are actually tinted with, so '
              + 'what you pick is what runs out onto the grass. It also fixes the scoreboard, '
              + 'which had been showing a stock club crest over your own squad.',
      },
    ],
  },
  {
    version: 'v22',
    date: '2026-08-10',
    tag: 'Graphics',
    title: 'The pitch, rebuilt',
    lede: 'Real turf, a stadium that has more than one sponsor, and the end of '
        + 'those blown-out white patches.',
    entries: [
      {
        head: 'Turf that looks like turf',
        summary: 'The pitch is grass now rather than two shades of green — blades, mown gloss, '
               + 'and wear where a pitch actually wears.',
        detail: 'The surface is built from three layers instead of one flat image: colour for the '
              + 'stripes and markings, a fine blade texture repeated across the whole pitch, and '
              + 'a gloss layer carrying the mow. That last one matters most — real broadcast turf '
              + 'reads as stripes because the two mowing directions catch the floodlights '
              + 'differently, which is a shine difference far more than a colour one. The '
              + 'goalmouths, penalty spots and centre circle are worn. The corner arcs and both '
              + 'penalty arcs are also drawn for the first time; they had been missing entirely.',
      },
      {
        head: 'A stadium with more than one advertiser',
        summary: 'The perimeter boards no longer repeat the same three adverts every few metres.',
        detail: 'There were eight boards, tiled five times down a 125-metre touchline. There are '
              + 'twenty-four sponsors now, dealt so a name cannot appear twice in a row, across '
              + 'four different board layouts — because every hoarding being laid out identically '
              + 'is what made ten sponsors read as one company buying the whole ground.',
      },
      {
        head: 'The white patches are gone',
        summary: 'Those blown-out bright areas at the corners of every camera angle have been '
               + 'fixed.',
        detail: 'They were not the floodlights, which is why they survived several attempts to '
              + 'tune the lighting. The grass was simply too shiny: at a low camera angle a '
              + 'surface that glossy behaves like a mirror. Two genuine bugs turned up while '
              + 'chasing it — the light shafts from the pylons were brightest at the wrong end, '
              + 'the end that passes through the pitch, and the floodlights fell off with '
              + 'distance as though there were only four of them.',
      },
    ],
  },
  {
    version: 'v21',
    date: '2026-08-10',
    tag: 'Interface',
    title: 'One game, all the way through',
    lede: 'The cover art no longer stops at the main menu.',
    entries: [
      {
        head: 'Every screen looks like the game now',
        summary: 'Ultimate XI, Kick Off and Settings each open with a banner in the title '
               + 'screen’s style, with artwork of their own.',
        detail: 'The title screen and the menu are built on one idea — heavy italic type over '
              + 'bold green lines sweeping up to the right — and that idea used to stop at the '
              + 'menu. Every mode screen now opens on a banner carrying it through, with a line '
              + 'drawing unique to that screen: the division ladder for Ultimate XI, the centre '
              + 'circle for Kick Off, faders for Settings. Ultimate XI’s reports which rung '
              + 'you are on. Panel headings picked up the same green mark.',
      },
      {
        head: 'One colour',
        summary: 'The accent picker is gone. The game is green.',
        detail: 'Green is the cover, the app icon, every swoosh and the mark in the corner of the '
              + 'screen. A magenta build was a different game wearing the badge, and every screen '
              + 'designed afterwards had to be checked against five palettes instead of one.',
      },
    ],
  },
  {
    version: 'v20',
    date: '2026-08-10',
    tag: 'Gameplay',
    title: 'Two ways to play',
    lede: 'Kick Off and Ultimate XI no longer play the same, keepers stop '
        + 'gifting rebounds, and your strong foot matters.',
    entries: [
      {
        head: 'Authentic and Competitive',
        summary: 'Kick Off plays a heavier, more realistic game. Ultimate XI plays a faster, '
               + 'sharper one.',
        detail: 'The same engine, tuned two ways, because the two modes want opposite things. '
              + 'Kick Off is a game of football: the ball is heavier, defenders hold their shape, '
              + 'a tackle carries real risk and a parry goes where physics sends it. Ultimate XI '
              + 'is a competition and has to be readable: passes arrive quicker, the touch is '
              + 'tighter, keepers steer their saves and defenders leave more space. Both were '
              + 'measured over 240 simulated matches before shipping.',
      },
      {
        head: 'Keepers know where to put it',
        summary: 'A save no longer drops the ball at the striker’s feet.',
        detail: 'Parries used to reflect the shot straight back out in front of goal — for a long '
              + 'time the cheapest goal in the game. A keeper now picks where to put it: round '
              + 'the post, out for a throw, or wide of the box away from anyone in an attacking '
              + 'shirt. How much control he gets depends on the mode and on how good he is.',
      },
      {
        head: 'Dribbling, and a strong foot',
        summary: 'Good dribblers keep the ball closer, and every player now has a strong foot '
               + 'that costs him accuracy when he uses the other one.',
        detail: 'Touch frequency and the size of each knock now scale with a player’s '
              + 'dribbling, and everybody shortens up under pressure — so a high rating finally '
              + 'feels different rather than just winning more duels. Every card also carries a '
              + 'strong foot. The ball sits on that side as he carries it, and striking with the '
              + 'wrong one costs real accuracy and a little power.',
      },
      {
        head: 'Skip a replay on touch',
        summary: 'The replay banner now has a SKIP button.',
        detail: 'Bailing out of a replay was a controller-only gesture, which on a phone meant '
              + 'sitting through every one of them.',
      },
    ],
  },
];

/** The build a first-time reader should be shown. */
export const LATEST = RELEASES[0];

export function releaseFor(version) {
  return RELEASES.find((r) => r.version === version) || null;
}
