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
    version: 'v94',
    date: '2026-09-24',
    tag: 'Fix',
    title: 'Controller fix',
    lede: 'Starting to remap a controller button and then leaving Settings with the mouse or a tap no longer leaves your controller unresponsive everywhere.',
    entries: [
      {
        head: 'Controller',
        summary: 'While Settings waits for you to press a button to remap, the menus stop listening to the controller. If you left Settings without pressing one, they never started listening again. Leaving any screen now always gives the controller back.',
        detail: '',
      },
    ],
  },
  {
    version: 'v93',
    date: '2026-09-24',
    tag: 'Balance',
    title: 'Fairer packs',
    lede: 'We measured every pack in the store against what it actually gives, and fixed the three that were poor value.',
    entries: [
      {
        head: 'High Roller',
        summary: 'Now 18,000 (was 26,000), with a Special more often than not and an 83+ minimum. Its label said it had "the best single-card odds in the store", and it gave a 90+ card only about one time in five.',
        detail: 'Its label now just says what it is: one card, usually a Special.',
      },
      {
        head: 'Lucky Dip and Prime',
        summary: 'Lucky Dip\'s single card is better (Specials 12% → 20%): its best card used to average lower than a Silver pack\'s at two and a half times the price. Prime has more Specials (22% → 30%), so it now sits fairly beside Double Down.',
        detail: 'Every other pack was already in a sensible order of value for price, and no pack\'s cards sell for more than the pack costs.',
      },
    ],
  },
  {
    version: 'v92',
    date: '2026-09-24',
    tag: 'Polish',
    title: 'First impressions',
    lede: 'Fixes from playing the game as a brand-new player on a phone and a desktop.',
    entries: [
      {
        head: 'Main menu',
        summary: 'The Kick Off button is readable again: its text was dark on a dark wash that covered the green.',
        detail: '',
      },
      {
        head: 'Weekend League',
        summary: 'Between weekends the screen now explains the next one, instead of showing "Last weekend · Bronze · 0 wins" to everybody.',
        detail: 'Results from a weekend you played are still waiting on the Today screen once it closes.',
      },
      {
        head: 'Today',
        summary: 'The season rewards show the tiers around your progress, with a button to see all thirty, so the Today screen is much shorter on a phone.',
        detail: '',
      },
      {
        head: 'Career',
        summary: 'The Manager and Player cards say what each mode is ("Run a club", "Be the player") instead of an old version label.',
        detail: '',
      },
    ],
  },
  {
    version: 'v91',
    date: '2026-09-24',
    tag: 'Couch',
    title: 'Four at one screen',
    lede: 'Up to four people can play on one screen, on the same team or against each other, with a new screen for choosing sides.',
    entries: [
      {
        head: 'Choose sides',
        summary: 'In Quick Match, choose Co-op or Versus and press Kick Off. Every controller gets a token, and so do the two halves of the keyboard. Push yours left for the home team or right for the away team, press A when ready, and Start to kick off.',
        detail: 'Controllers plugged in while the screen is open appear straight away, and any mix works: two against two, three against the CPU, or one of you against three friends. If everyone is on the same side it is co-op. On a tablet with no controllers, the split-screen touch controls work as before.',
      },
      {
        head: 'In the match',
        summary: 'Each player has a coloured marker (white, amber, cyan and pink), and the top bar shows who is on a controller and who is on the keyboard.',
        detail: 'Each controller only moves its own player, and vibration goes only to the controller whose player made the tackle or took the shot. Your button remapping now applies to every controller, not just the first.',
      },
    ],
  },
  {
    version: 'v90',
    date: '2026-09-23',
    tag: 'Controller',
    title: 'The full controller scheme',
    lede: 'Defending gets its own buttons, the right stick does skill moves and switching, the D-pad changes tactics, and you can tune the sticks and the vibration.',
    entries: [
      {
        head: 'Defending',
        summary: 'Shoot now slide-tackles when you do not have the ball, and pass or cross is a standing tackle. Hold the skill trigger to jockey (shadow the carrier without diving in) and hold the through-ball button to send a team-mate to press.',
        detail: 'A slide reaches further than a standing tackle, but if you miss you are down for longer, and a late slide is a clearer foul. The CPU\'s players are unchanged: these are your controls, not theirs. On a keyboard, G jockeys and F sends a team-mate; on touch, the SLIDE, JOCKEY and PRESS buttons appear while you defend.',
      },
      {
        head: 'Right stick and D-pad',
        summary: 'Flick the right stick for a skill move that way when you have the ball, or to switch to the team-mate that way when you do not. The D-pad changes tactics: up is more attacking, down more defensive, right is all-out attack and left parks the bus.',
        detail: 'On a pad with sticks the D-pad no longer moves your player; the left stick does. A pad without sticks still moves with its D-pad.',
      },
      {
        head: 'Feel and settings',
        summary: 'New in Settings: stick deadzone and response curve, and vibration on goals, shots and tackles. Pulling the controller out pauses the match.',
        detail: 'Vibration only goes to the controller whose player made the tackle or took the shot; a goal shakes every controller. On controllers with pressure-sensitive buttons, a lighter press charges a shot or pass more slowly. The Controller layout panel in Settings lists the whole scheme in your controller\'s own button names.',
      },
      {
        head: 'Fixes',
        summary: 'Choosing a controller button to remap no longer binds the A button you pressed to choose it.',
        detail: 'A handful of server tests that failed now and then have been fixed: two tests could end up on the same port.',
      },
    ],
  },
  {
    version: 'v89',
    date: '2026-09-23',
    tag: 'Controller',
    title: 'Play the whole game from the sofa',
    lede: 'Every screen now works with just a controller: menus, tabs, sliders, typing, pack reveals and building your line-up.',
    entries: [
      {
        head: 'Everywhere',
        summary: 'A confirms and B goes back (and closes pop-ups such as release notes or save choices). The bumpers switch tabs, the right stick scrolls, and Start takes you home.',
        detail: 'Every card, pitch slot, listing and drill can now be selected. To build a line-up, press A on a pitch slot, then A on the card that goes in it.',
      },
      {
        head: 'Typing and sliders',
        summary: 'Press A on a text box to type with an on-screen keyboard: A types, X deletes, Y switches to capitals, Start finishes and B cancels. Left and right move a slider.',
        detail: 'Number boxes get a number pad. Messages between players are still preset phrases only.',
      },
      {
        head: 'Quick actions and buttons',
        summary: 'X and Y do the obvious thing on busy screens, for example skipping a pack reveal, searching the market or changing the sort order. A badge shows which button does what while a controller is in use.',
        detail: 'Button names match your controller: PlayStation symbols, Xbox letters, or plain numbers for pads that name neither.',
      },
    ],
  },
  {
    version: 'v88',
    date: '2026-09-23',
    tag: 'Fixes',
    title: 'Builder, controller and touch fixes',
    lede: 'Fixes for problems found by playing the last release on a phone, a keyboard and a controller.',
    entries: [
      {
        head: 'Stadium Builder',
        summary: 'The 3D preview in the Stadium Builder works again after you change something. Since v87 it could go blank after the first change.',
        detail: 'The builder redraws the stadium on the same canvas after every change. The memory fix in v87 released the graphics context on the way out, so the next preview had nothing to draw with. The builder now keeps the context and hands it on.',
      },
      {
        head: 'Controller',
        summary: 'B (or Circle) goes back from every screen, including the Trophy Room, where a controller player could get stuck.',
        detail: 'A new automatic check walks every screen with a simulated controller to make sure each one can be reached and left without a mouse.',
      },
      {
        head: 'Touch',
        summary: 'Fixed a rare case where the on-screen stick stopped responding until you lifted every finger. Tips no longer name keyboard keys on a phone, and the "No pad" label is hidden on touch screens.',
        detail: '',
      },
    ],
  },
  {
    version: 'v87',
    date: '2026-09-23',
    tag: 'Performance',
    title: 'Faster, steadier, for everyone',
    lede: 'The game starts about four times faster, holds its frame rate better on slower phones, keeps your save safe, and gains a full set of accessibility options.',
    entries: [
      {
        head: 'Starts faster',
        summary: 'A first launch on a phone now reaches the title screen in about 1.7 seconds on 4G (it was about 7). Each mode downloads the first time you open it, and after that everything opens instantly, including offline.',
        detail: 'The first download is less than half the size it was (461 KB against 1,092 KB, 45 requests against 116). The loading bar now shows real progress (the ground built, the players in, the graphics ready) with tips to read while you wait.',
      },
      {
        head: 'Holds its frame rate',
        summary: 'When a device starts to struggle, the game quietly turns effects down before the frame rate drops, and turns them back up when it recovers.',
        detail: 'Players far from the camera or behind it animate at a lower rate, and a memory leak that grew with every match is fixed. Battery mode (Settings) caps the game at 30 fps with a lighter picture.',
      },
      {
        head: 'Accessibility',
        summary: 'New in Settings: text size, colour-vision filters for the match, subtitles for all commentary, a one-handed touch layout, sprint as hold or toggle, shooting and passing assists, and full keyboard and controller navigation with a clear focus ring.',
        detail: 'Every switch has a label for screen readers, and reduced motion now applies everywhere. The assists only ever help people: the CPU plays by the same rules as before.',
      },
      {
        head: 'Your save is safe',
        summary: 'Download your save to a file, restore it or an automatic backup from Settings, and choose which save to keep if your cloud save and this device disagree.',
        detail: 'A damaged save is set aside and the newest backup is used instead, and the game tells you once that it did. The server checks every request more strictly and limits how fast requests can arrive.',
      },
    ],
  },
  {
    version: 'v86',
    date: '2026-09-23',
    tag: 'Fixes',
    title: 'Everyone turns',
    lede: 'The CPU\'s players are as light on their feet as yours now, and a round of bug fixes across the game.',
    entries: [
      {
        head: 'Agile CPU players',
        summary: 'The CPU\'s players turn and change direction properly: a 180 at a sprint in half a second (it was over one and a half), and they no longer run in circles around a loose ball.',
        detail: 'A movement bug made every CPU player turn at about a sixth of the rate it was meant to, so at a sprint it swung through an eight-metre circle. On a small pitch that meant two players could circle a loose ball for ten seconds. With the fix, more tackles land and more shots come in, so the balance was retuned and measured over 240 AI-vs-AI matches: about 2.2 goals a match, fewer penalties, and defenders who are more careful in their own box.',
      },
      {
        head: 'The same match on every device',
        summary: 'The match now runs at a fixed 60 steps a second whatever your frame rate, so a slow phone and a fast monitor play the same game.',
        detail: 'Before this, the CPU turned twice as sharply at 30 fps as at 60. Button presses are held until the game has seen them, so none are lost on a high-refresh screen and none fire twice on a slow one.',
      },
      {
        head: 'Substitutions',
        summary: 'A player who has been substituted can no longer come back on, and a substitute now looks like himself instead of the player he replaced.',
        detail: 'The CPU used to bring an injured player off and, at the next injury, send the same man straight back on, healed and rested.',
      },
      {
        head: 'Menus',
        summary: 'Fixed an error when leaving a screen at the same moment it opened another; the quick-match controller check could keep running after you left.',
        detail: 'Found by a new test that clicks at random through every screen on a phone and a desktop.',
      },
    ],
  },
  {
    version: 'v85',
    date: '2026-09-23',
    tag: 'Grounds',
    title: 'The world outside the ground',
    lede: 'The land around every stadium is rebuilt: real streets in the city, real mountains, and trees and rocks everywhere.',
    entries: [
      {
        head: 'City and coast',
        summary: 'Streets on a proper grid, with lane markings, zebra crossings, street lights, parked cars, parks, and towers of every height whose windows light up at night.',
        detail: 'The coast adds a sea, a beach, a promenade of palms, rocks along the shore and a lighthouse. Buildings are drawn in batches that the camera can skip when they are out of view, and window detail fades out in the distance so far towers do not shimmer.',
      },
      {
        head: 'Mountains',
        summary: 'A real range: sharp ridges, snow on the peaks (and lower when it snows), bare rock on the steep faces, meadows, and pine forest below, with a village of chalets by the ground.',
        detail: 'The old mountains were cones that the fog washed out to white paper. Distance haze is now built into the land\'s colours, so far ridges fade towards the sky but keep their shape. The view reaches 3 km, where it used to be cut off at 900 m and left a hard band along the horizon.',
      },
      {
        head: 'Suburbs and desert',
        summary: 'Suburbs have streets lined with gable-roofed houses, gardens and a wood beyond; the desert has dunes, flat-topped red mesas, low sandstone buildings and palms.',
        detail: 'Every landscape plants its own trees (palms by the sea and in the desert, pines in the mountains, broadleaf trees in the suburbs and city parks), with a simpler model for distant trees. The strips between the plaza and the first streets are now planted instead of left bare.',
      },
      {
        head: 'Grounds gallery',
        summary: 'A new Aerial camera circles high above the ground so you can see the land around it.',
        detail: 'Orbit stays inside the bowl as before, and Fly still goes anywhere.',
      },
      {
        head: 'Performance',
        summary: 'The Low tier builds a much lighter landscape, about half the triangles of High.',
        detail: 'Low drops street lights, parked cars and rooftop details, and only the nearest trees get the full model.',
      },
    ],
  },
  {
    version: 'v84',
    date: '2026-09-23',
    tag: 'Hotfix',
    title: 'Your player answers the stick again',
    lede: 'The player you control turned like a brick, swung out wide instead of going back the way you pushed, and the arrow keys did nothing. All fixed.',
    entries: [
      {
        head: 'Movement',
        summary: 'Your player now goes where you push, at once: a 180 at a jog in under a tenth of a second (it was 1.6 s), out of a flat-out sprint in about 0.1 s (it was 1.7 s), and straight back toward the camera when you pull back — it used to curve off sideways.',
        detail: 'The weight a sprint carries is kept as a slight softening at full speed. The CPU\'s players keep their own heavier model. A half push on a touch stick is already full speed; a light touch walks.',
      },
      {
        head: 'Controls',
        summary: 'Settings → Button map has a Responsiveness slider: higher turns sharper, lower carries more weight at a sprint. On a keyboard the arrow keys move your player (they used to be player two\'s only).',
        detail: 'The controller stick\'s deadzone is rescaled, so just past it is a gentle push rather than a jump.',
      },
    ],
  },
  {
    version: 'v83',
    date: '2026-09-23',
    tag: 'Broadcast',
    title: 'Every match on television: the show, two voices, graphics and the story after',
    lede: 'A pre-match show from the flyover to the coin toss, two commentators in English or Arabic with subtitles, a full graphics package with '
        + 'stoppage time and reviews, heat maps at the break, and a full time with the player of the match, ratings, the dressing room and a result card to share. '
        + 'Plus seasonal menus and a playlist.',
    entries: [
      {
        head: 'Before kick-off',
        summary: 'A flyover of the ground, both team sheets with the shape, faces and ratings, a studio preview from our pundit, the walk-out with the anthem, the handshakes and the coin toss.',
        detail: 'Skip it any time, or set it to the walk-out only (Settings → Broadcast). It stays off under reduced motion.',
      },
      {
        head: 'In the match',
        summary: 'Name straps for the man on the ball after a restart, card and substitution boards, stat pop-ups, a momentum bar, the fourth official\'s board and a 45+2 clock, and a review panel that draws the lines for a tight offside.',
        detail: 'Stoppage time comes from what stopped the half — goals, cards, changes, injuries, dead balls. Replays open and close on a logo wipe and show which angle you are watching; the highlights play over their own music.',
      },
      {
        head: 'Two voices',
        summary: 'A play-by-play caller and a co-commentator who speak through your device, with more than 750 lines between them — derbies, finals, the weather, hat-tricks, late winners, comebacks, men in form — and a full Arabic commentary. Subtitles show who said what.',
        detail: 'Voices are your device\'s own speech; where there is no Arabic voice, the Arabic commentary runs on subtitles.',
      },
      {
        head: 'After the whistle',
        summary: 'Heat maps for both sides at half time; at full time the player of the match, ratings for all 22, the full stat sheet, the match\'s momentum, the dressing room\'s reaction, a trophy lift for a won final, and a result card to share.',
        detail: 'The card is drawn in the game and goes to your share sheet, or downloads.',
      },
      {
        head: 'The menu',
        summary: 'Seasonal themes — National Day, Ramadan nights with lanterns, and winter snow — and a music player with six tracks made in the game.',
        detail: 'Themes follow the date, or pick one (or none) in Settings → Broadcast.',
      },
    ],
  },
  {
    version: 'v82',
    date: '2026-09-23',
    tag: 'New modes',
    title: 'Street, futsal, parties with friends, skill games and a button map',
    lede: 'Small-sided football in six original cages and halls, a street tour with bosses and a baller of your own, futsal, '
        + 'co-op and 2 v 2 online, pro five-a-side for your Player Career pro, two players on one tablet, skill games with leaderboards, '
        + 'a practice arena and a penalty shootout — and every control can be moved, on keyboard or pad.',
    entries: [
      {
        head: 'Street',
        summary: 'Three, four or five a side in a walled cage: the ball comes back off the walls, there is no offside, restarts are instant, and tricks, wall passes and chains of both score style points on top of the goals.',
        detail: 'Six venues of our own: a Riyadh rooftop, a dune court, a harbour cage, a neon hall, an underpass and a beach where the sand kills the bounce. Create your baller, unlock boots, kits and hair, beat two crews and a boss at each tour stop — a beaten boss joins your crew.',
      },
      {
        head: 'Futsal',
        summary: 'A hard court, a heavy low-bounce ball, kick-ins along the floor instead of throws.',
        detail: 'Quick Match with the neon hall, or Street → Quick → Futsal.',
      },
      {
        head: 'Play together',
        summary: 'Parties on the Online screen: a co-op season (two friends, one team, ten-match seasons recorded for both), 2 v 2, and pro five-a-side where up to ten people each play only their Player Career pro. Two on one tablet get a half of the screen each.',
        detail: 'The host runs the match; if someone drops, the CPU takes their man until they reconnect to the same seat. A five-letter code is the only thing typed between players.',
      },
      {
        head: 'Skill games and practice',
        summary: 'Four skill games — a dribbling slalom, free kicks at targets, crossing, and passing gates — each with an online leaderboard; a stand-alone penalty shootout; and a practice arena with free roam, free kicks, penalties and corners.',
        detail: 'Leaderboards only take scores a game can actually produce.',
      },
      {
        head: 'Controls',
        summary: 'Settings → Button map: move any control to any key or pad button. On-screen prompts follow what you last touched — keyboard, Xbox-style or PlayStation-style pad, or touch.',
        detail: 'The Watch gains a street one-v-one.',
      },
    ],
  },
  {
    version: 'v81',
    date: '2026-09-23',
    tag: 'Career',
    title: 'Player Career, and a Manager Career with a whole club behind it',
    lede: 'Create a footballer and live his career from seventeen to retirement — and as a manager, run the training ground, the dressing room, '
        + 'the scouts, the books and the facilities, in a world that ages, retires, replaces and remembers.',
    entries: [
      {
        head: 'Player Career',
        summary: 'Create your player — name, nation (Saudi Arabia included), position, foot and look — and start at a second-tier club. Play only him, with the camera and controls locked on, or sim the week; every match ends with a rating out of ten.',
        detail: 'Win the manager\'s trust to start, train once a week in a timing drill, grow toward a hidden potential, field calls from clubs through your agent, go on loan, talk contracts, earn caps, collect milestones and trophies, and retire with a legacy score.',
      },
      {
        head: 'The manager\'s week',
        summary: 'A training schedule with fitness and sharpness, individual plans and position retraining, set-piece takers, a squad hierarchy with playing-time expectations, and talks with players — praise, criticism, a promise of games — that land by temperament.',
        detail: 'Unhappy players hand in transfer requests. Broken promises are remembered.',
      },
      {
        head: 'Club business',
        summary: 'A finance hub (tickets from your own ground, television, shirts, prize money, wages, fees), a wage budget, four facilities to upgrade, three scouts with star ratings and regions, loans in and out, release clauses and sell-on clauses, agent fees, and a board that judges five pillars.',
        detail: 'The pillars: success, finance, youth, brand and style of play. Success counts double.',
      },
      {
        head: 'A living world',
        summary: 'Players age, peak, decline and retire; generated youngsters from each club\'s own part of the world take their places; potential moves with form and minutes; AI clubs change managers; champions, cup winners and awards are recorded; there is a news feed.',
        detail: 'Ten seasons simulate in well under a second each and the save stays small. Twenty seasons cost what the first did.',
      },
      {
        head: 'The big moments',
        summary: 'A press room with the question typed out, a signing announcement in the club\'s colours, and a trophy lift with confetti.',
        detail: 'All of it respects reduced motion.',
      },
    ],
  },
  {
    version: 'v80',
    date: '2026-09-23',
    tag: 'Ultimate XI',
    title: 'Promo cards, Evolutions, Quickfire Fives, a transfer market and a squad hub',
    lede: 'Ultimate XI grows up: In-Forms and a Team of the Week from the world\'s own matches, three weekly campaigns, Icons in three tiers, '
        + 'cards you evolve by playing, five-a-side on a small pitch, a week of curated squads to beat, a real market, a binder of sets, '
        + 'daily and weekly tasks with a club level — and a squad hub that builds your team for you. Every bit of it earned by playing.',
    entries: [
      {
        head: 'Cards',
        summary: 'In-Form cards for the players who shone in the world\'s round of matches, a Team of the Week, and a weekly campaign — Future Stars, Heroes of the Desert or Winter Legends — each with its own animated design. Icons now come in Early, Peak and Prime.',
        detail: 'Promo cards are versions of a real card: you can own both, but only field one of them. The campaign, In-Form and Legends Vault packs promise their promo slot and show its odds on the pack.',
      },
      {
        head: 'Evolutions',
        summary: 'Six tracks — Pace Merchant, Engine Room Graduate, Wall Builder, Clinical Upgrade, Last Line and Rising Talent. Pick a card that fits, play with him, and each stage adds stats, sometimes a signature trait, and a stage of glow to the card. Three can run at once.',
        detail: 'Stages count goals, assists, wins, clean sheets and appearances in any Ultimate XI match: Division, Fives, Squad Clash or the Weekend League.',
      },
      {
        head: 'New ways to play',
        summary: 'Quickfire Fives: your keeper and four outfielders, two and a half minutes on a small pitch, paid on the spot. Squad Clash: twelve curated squads a week at the difficulty you choose, ranked and paid weekly. Division wins now pay weekly too, and the Weekend League asks for ten qualification points first.',
        detail: 'Qualification points: a Division or Fives win is one, a Squad Clash win two. Once you have played a weekend match you stay in for that weekend.',
      },
      {
        head: 'Market and binder',
        summary: 'A transfer market with filters, buy-now and bids, a price range on every card so nothing trades at a silly price, and a fourteen-day price graph. The binder keeps every card you have ever owned and pays for finished sets.',
        detail: 'The market is offline and honest: the other side is the market itself, refreshed every four hours. Sales pay 5% tax. There is no real money anywhere in the game.',
      },
      {
        head: 'Squad hub and objectives',
        summary: 'Chemistry lines between neighbours on the pitch, a manager whose nation or league adds chemistry, a rating and chemistry breakdown, five saved squads and a Build me a squad button. Three daily and five weekly tasks, and a club level that pays at every level up to 100.',
        detail: 'On the watch: Quickfire Fives on the wrist, your Fives record, and the market price of your best card.',
      },
    ],
  },
  {
    version: 'v79',
    date: '2026-09-23',
    tag: 'Gameplay',
    title: 'Momentum, first touches, traits, tactics, offside — and throw-ins',
    lede: 'Players carry momentum and plant a foot to turn, the first touch can let you down, shots dip and knuckle, crosses come three ways, '
        + 'there is offside, cards carry signature traits, every side has real tactics and roles, the CPU adapts to the score, and there are thirteen skill moves.',
    entries: [
      {
        head: 'Movement and the ball',
        summary: 'No more turning on a dime at full sprint; shoulder-to-shoulder duels that the stronger man wins; trips and pushes from behind; a first touch that depends on the player and the pass; driven, ground and lofted passes; through balls weighted by how long you hold; shots that dip or knuckle; volleys, headers you have to time, and the odd overhead kick.',
        detail: 'Keepers dive as far as their rating lets them. A ball dribbled over the line is out, and a clearance can end up in the stand.',
      },
      {
        head: 'Traits',
        summary: 'Twelve signature traits — Finesse Finisher, Engine, Rock at the Back, Quick Step, Sweeper Keeper, Pinged Pass, Aerial Threat, Trickster, Anchor, Cannon, Velvet Touch and Dead Ball — each changing what the player does in a match, with an elite tier for the best. Shown on every card with his skill stars.',
        detail: 'Traits are dealt from the card itself, so a player always has the same ones.',
      },
      {
        head: 'Tactics',
        summary: 'Defensive style (high press, balanced, deep block), build-up (short, balanced, long ball, counter), width and line height, and a role for every player — inverted wing-back, box-to-box, false nine, target man, ball-playing defender and more. Change them in Team Management, or flick between five quick tactics with 1–5 or the ⚑ button.',
        detail: 'Ultimate XI keeps your instructions for the next match.',
      },
      {
        head: 'A smarter CPU',
        summary: 'The CPU uses the same tactics, changes them at half-time depending on the score, goes all out when losing late and runs the clock down when winning, presses a bad touch or a back pass, holds a line for offside, overlaps and makes third-man runs. Difficulty now changes how good its decisions are, not its players.',
        detail: 'Offside is in: a forward beyond the second-last defender when the ball is played is flagged.',
      },
      {
        head: 'Skill moves and restarts',
        summary: 'Thirteen skill moves, from a ball roll to the rainbow flick, unlocked by a player\'s skill stars: hold Skill, point the stick, add Sprint, Curl or Lob and let go — or swipe the SKILL button on a phone. And throw-ins, corners, goal kicks, fouls and offsides now happen at believable rates instead of hardly at all.',
        detail: 'The full list of moves and their combos is in Settings → Controls.',
      },
    ],
  },
  {
    version: 'v78',
    date: '2026-09-22',
    tag: 'Grounds',
    title: 'Every ground a place: village recs to giant arenas, a pitch that lives through the season',
    lede: 'Grounds now come in four kinds and each is built for what it is; the pitch has its own grass, mowing, wear, frost and snow; '
        + 'the touchline has flags, dugouts, a tunnel and the people who work the match; the crowd has a proper away end, flags, scarves and flares; '
        + 'and a new Grounds gallery lets you fly round all of them.',
    entries: [
      {
        head: 'Four kinds of ground',
        summary: 'Community grounds with one stand, a rail and a fence; town grounds with terraces and floodlight masts; modern bowls; and the giant arenas. Eight new community grounds, and a Career club\'s ground now grows when it is promoted.',
        detail: 'Every ground has its own floodlights (a roof ring, four corner pylons, masts down the side or roof masts), its own goals '
              + '(box, deep or stanchion), faces its own way so the sun and the stands\' shadows fall differently, and has the country outside it: '
              + 'a skyline, suburbs, the coast, mountains or the desert.',
      },
      {
        head: 'The pitch through a season',
        summary: 'Grass length and density by ground, each club mows its own pattern, goalmouths wear to bare earth as the season goes on, slides tear divots, heavy rain leaves puddles, winter nights bring frost, and snow matches are played with an orange ball on cleared lines.',
        detail: 'The lines fade a little on grounds that do not re-mark every week. Close up, the grass is now proper blades instead of flat cards.',
      },
      {
        head: 'Round the pitch',
        summary: 'Corner flags that move in the wind, dugouts and technical areas, the tunnel the teams walk out of, ballboys, stewards, photographers behind the goals and camera crews; at half-time the groundstaff come out and the sprinklers run.',
        detail: 'The boards switch to a scrolling run in the home club\'s colours every so often and at every goal.',
      },
      {
        head: 'The crowd',
        summary: 'A proper away end with a gap of empty seats either side, flags and scarves in each side\'s colours, flares (smoke and light only) at a goal, songs that change with the score, groans at a near miss, boos at a foul, and sell-outs for the big games.',
        detail: 'A small crowd leaves empty seats; a final or a clash of two strong sides fills the ground.',
      },
      {
        head: 'The Grounds gallery',
        summary: 'Every ground grouped by kind, with its capacity, the year it opened, its record crowd, floodlights, goals and mowing — and a Fly camera to tour it: drag to look, scroll or pinch to move, WASD on a keyboard. Day, dusk, night, rain, snow and a winter-night frost.',
        detail: 'The history is invented, like the grounds themselves.',
      },
    ],
  },
  {
    version: 'v77',
    date: '2026-09-22',
    tag: 'Cameras',
    title: 'A new match camera, set-piece angles, and a bug hunt',
    lede: 'The match camera is rebuilt from scratch with seven presets and sliders, every restart has its own angle, replays pick their '
        + 'best angles on their own, and a sweep through every screen, ground and rule turned up a list of bugs that are now fixed.',
    entries: [
      {
        head: 'Seven cameras',
        summary: 'Broadcast, Tele Broadcast, Co-op, Dynamic, Pro, End to End and Tactical, with height, zoom and angle sliders in Settings and a camera button (or V) in the match to switch on the fly.',
        detail: 'The camera now eases after play on a spring that never overshoots, looks ahead in the direction of the attack, '
              + 'holds still while the ball moves around inside a small box, and pulls wider when the play spreads out.',
      },
      {
        head: 'Set pieces and replays',
        summary: 'Corners, free kicks, penalties, throw-ins, goal kicks and kick-offs each get their own angle with a smooth move in and out, the celebration camera circles the scorer, and replays choose two or three angles for you: goal-line, reverse, keeper\'s eye, overhead and a slow tracking shot.',
        detail: 'A long-range strike gets three angles, a tap-in two. The camera never goes through a stand, a roof or the goal net on any of the 112 grounds.',
      },
      {
        head: 'Bugs fixed',
        summary: 'A shot straight at a post could go through it; the ball and players sank into the raised middle of the pitch; a roulette flung the player across the pitch; menus ran off small phones and Arabic hid tiles; a damaged save could crash the game on start.',
        detail: 'The goal frame is now tested along the ball\'s whole path, so a post is solid at any speed and a ball clipping the inside of one goes in off it. '
              + 'The crossbar only stops a ball that reaches the goal line. The player marker is hidden over celebrations and replays. '
              + 'Cloud saves get the same repairs as a save on this device, and the graphics renderer choice stays with the device.',
      },
    ],
  },
  {
    version: 'v76',
    date: '2026-09-22',
    tag: 'Grass and nets',
    title: 'A pitch with depth, goals with nets, defenders with a temper',
    lede: 'The grass is lit rather than painted and has real relief and blades near the camera; the goals are heavier with a proper '
        + 'frame and a net that has a roof and moves like cord; and some defenders now fly in, send you to the floor and give away penalties.',
    entries: [
      {
        head: 'The pitch',
        summary: 'Richer greens, mow stripes that shift with the light as the camera moves, a crowned and gently uneven surface, parallax depth in the blades, and real grass standing up in front of the camera on High and above.',
        detail: 'The stripes used to be painted into a flat picture, so they never changed as the view moved. They are now '
              + 'the same grass lying two ways and catching the light differently, which is what a mown pitch actually is.',
      },
      {
        head: 'The goals',
        summary: 'Heavier posts and crossbar, a rear frame the net hangs from, a roof on the net, and netting that bags, bulges on a strike and swings afterwards instead of snapping back like a board.',
        detail: 'The net takes tension but goes slack under compression, like cord. A shot into the back shakes the roof too.',
      },
      {
        head: 'Fouls you can see',
        summary: 'Every player has a temperament: hard defenders lunge from further out and more often, and sides that are losing late get nastier. A foul puts the man on the grass for a moment; in the box it is a penalty; the worst lunges are booked.',
        detail: 'Measured over 120 AI matches: about 2.5 fouls, 0.3 penalties and a few bookings per match. A booked player '
              + 'calms down. The balance sweep was re-run deliberately: goals 2.13 → 2.15, shots 12.3 → 12.9.',
      },
    ],
  },
  {
    version: 'v75',
    date: '2026-09-20',
    tag: 'Kick Off',
    title: 'Pick a country, then a club',
    lede: 'Kick Off is sorted by country now: fifty-six of them from Spain down to India, each with its real clubs and '
        + 'real footballers, plus International for the national teams.',
    entries: [
      {
        head: 'Kick Off by country',
        summary: 'Choose a country (strongest first, Spain to India) and then a club within it — Real Madrid, Bayern, Flamengo, Al Hilal, Mohun Bagan and 170 more — or International for France, Spain, Saudi Arabia and every other national XI.',
        detail: 'Every club fields eleven real footballers of its country. The six countries Manager Career curates use those '
              + 'curated squads for the clubs they share; every other club is dealt the best players of its nationality, so the '
              + 'names and the flag are right even where a squad is an approximation of who plays there this season. Badges '
              + 'are drawn in each club\'s colours by the game\'s own crest generator. Strength runs downhill with the '
              + 'list: a Spanish club is a five-star side, an Indian one a one-star side.',
      },
      {
        head: 'More players',
        summary: 'Eighty-five more real-name players for the countries the pool was thin on: India, China, Slovakia, Romania, Paraguay, Peru, Hungary, Ireland and Iraq.',
        detail: 'World: 6,413 players.',
      },
    ],
  },
  {
    version: 'v74',
    date: '2026-09-20',
    tag: 'Fixes',
    title: 'Four tiers, phones sorted, your ground everywhere',
    lede: 'Graphics are Low, Medium, High and Ultra on a desktop or tablet, Performance and Fidelity on a phone. '
        + 'The iPhone camera shows the whole pitch again, your designed stadium is your home in Kick Off too, '
        + 'the rotate-your-device wall is gone, and the touchline manager is never a white ghost.',
    entries: [
      {
        head: 'Graphics tiers',
        summary: 'Desktops and tablets: Auto, Low, Medium, High, Ultra. Phones: Performance or Fidelity. The old Ultra is gone and Ultra+ is now Ultra.',
        detail: 'A save on the old Ultra is on the new Ultra. Performance is Medium, the tier tuned for a phone\'s '
              + 'frame rate; Fidelity is everything the desktop Ultra does and will work a phone hard. The FPS '
              + 'counter shows only the frame rate now.',
      },
      {
        head: 'Phones',
        summary: 'A phone in landscape is wider than a television, and the camera was zooming in to fit; it now keeps the same vertical view and shows more of the pitch. Every screen works in portrait and the rotate-your-device wall is gone.',
        detail: 'The Stadium Builder previews at Low on a phone: rebuilding the ground on every slider tick at High '
              + 'emptied an iPhone\'s graphics memory and Safari reloaded the page, which is what \'the game '
              + 'restarted\' was.',
      },
      {
        head: 'Your ground, your manager',
        summary: 'A stadium you designed is your home in Kick Off as well as Ultimate XI and Career. A manager model whose textures failed to load never stands on the touchline as a white figure; the suit figure stands in.',
        detail: 'The white manager was the model without its textures, which the site\'s security policy was '
              + 'refusing until v73; v74 also makes sure it can never show untextured.',
      },
    ],
  },
  {
    version: 'v73',
    date: '2026-09-20',
    tag: 'Feel',
    title: 'The ball in the air, SBC, cards everywhere',
    lede: 'Shots climb and bend, chips float over the keeper, four skill moves on one button. Squad Building Challenges become SBC with '
        + 'twelve quick ones and sixteen new legends, nine new packs, 700 more players, and cards where there was text. '
        + 'Players are lit properly, the wet pitch is grass again, photo mode has a way out, and iPhones can see their buttons.',
    entries: [
      {
        head: 'Gameplay',
        summary: 'A full-power strike rises to head height and beyond, curl bends twice as far, hold the lob button with a shot to chip the keeper, and the skill button does four tricks: feint, stepovers, roulette and nutmeg. The AI bends and chips too.',
        detail: 'The ball was glued to the floor and barely bent. Lift on a strike nearly doubled, the Magnus '
              + 'curl was retuned so a finesse shot swerves a yard or two on its way in, and a chipped ball is '
              + 'slow, high and dipping. Skill moves are picked by where the stick points: sideways feints, '
              + 'forward stepovers with a burst, backward a roulette with the ball glued to the foot, and a '
              + 'defender in the way gets nutmegged. Every trick can fail on a heavy touch for a player who is '
              + 'not a dribbler. The balance sweep was re-run deliberately: goals per match went from 2.10 to 2.13.',
      },
      {
        head: 'SBC',
        summary: 'Squad Building Challenges are now SBC: twelve quick ones that take two to seven cards, sixteen new legend challenges with sixteen new legend cards, and every legend shown as the card you win.',
        detail: 'The quick SBCs are the sink for the bronzes and silvers every pack drops and can be repeated all '
              + 'day. The legends include Totti, Cannavaro, van der Sar, Thuram, Zanetti, Xavi, Kaká, Nesta, Vieira, '
              + 'Eto\'o, Rivaldo, Ballack, Torres, Villa, van Nistelrooy and Ronaldo Nazário. SBC Fodder is a new '
              + '1,500 pack of six bodies made for them.',
      },
      {
        head: 'More to pull',
        summary: 'Nine new packs — SBC Fodder, Youth Academy, Back Four, Engine Room, Premier Pick, Nations Week, Mega, Limited: Wonder — and 700 more real-name free agents. Every pack on the shelf shows three cards it could hand you.',
        detail: 'Nations Week rotates through twelve countries a week at a time. Youth Academy is 21-and-under only, '
              + 'Back Four and Engine Room are by position, Premier Pick is the top division, Mega is a dozen cards '
              + 'in one reveal and Wonder guarantees a Star with an 84 floor.',
      },
      {
        head: 'Cards, not text',
        summary: 'The Wall Week and every event show the featured card and three cards from the pack; objectives, weekend ranks and Season rewards show the pack; a nation\'s XI and the stars of each division are cards.',
        detail: 'Wherever a name or a pack was a line of text, it is now the thing itself.',
      },
      {
        head: 'Looks and fixes',
        summary: 'A rim light and a fill light on the players, a wet pitch that is grass rather than marble, the Light figures option removed (scanned models from Medium up), the crowd rises end by end on a goal, photo mode has a close button, the rotate hint can be dismissed, and the HUD keeps clear of the iPhone notch.',
        detail: 'Also fixed: the scanned player models\' textures were being refused by the site\'s security policy, '
              + 'so on the live site players could fall back to the plain figures — they load now. A WebGPU match '
              + 'renderer is available as a beta from Settings; it draws the core scene only and Auto keeps WebGL2.',
      },
    ],
  },
  {
    version: 'v72',
    date: '2026-09-20',
    tag: 'Your ground',
    title: 'The Stadium Builder, a hundred clubs, the World Tournament',
    lede: 'Design your own stadium and grow it in Career. A hundred clubs across eight divisions with 5,612 real-name players, '
        + 'a World Tournament and a Club World Cup, eight wonder stadiums for the finals, a transfer market with real prices, '
        + 'guilds and friends, spectating, emotes, replay clips, and a graphics push from colour grading to an Ultra+ tier.',
    entries: [
      {
        head: 'Stadium Builder',
        summary: 'Design your home ground: bowl, up to three tiers, up to 100,000 seats, roof, floodlights, colours, pitch pattern, your name in the seats, the facade, and a city, desert, coast or mountain setting. Save designs, share them by code, and in Career let the board build it bigger.',
        detail: 'The builder shows the ground in 3D as you change it, in daylight, at dusk or at night, '
              + 'and it becomes your home in Ultimate XI. A share code carries the shape and the colours '
              + 'only — whoever loads it sees their own club\'s name in the seats. In Career the ground '
              + 'starts at 15,000 and grows one expansion a season: the board pays in full while the '
              + 'club is on its target, the club pays otherwise, and every home match pays a gate that '
              + 'grows with the bowl.',
      },
      {
        head: 'A hundred clubs, thirty-two nations',
        summary: 'Eight divisions and 100 clubs, 5,612 real-name players, every club with its own ground, 32 national teams in a World Tournament with groups and knockouts you can play through, a Club World Cup, and eight wonder stadiums for the finals.',
        detail: 'The Highland and Lowland Leagues join below Grassroots, and forty more clubs spread across '
              + 'every division. The World Tournament is drawn every fourth season from four pots into eight '
              + 'groups; pick a nation and play it from the group stage to the final, at the wonders — grounds '
              + 'with giant screens, LED ribbons, roofs that close when it rains and pyrotechnics at kick-off. '
              + 'The transfer market now prices players by supply and demand: what the world lacks costs '
              + 'more, and what everyone is buying climbs.',
      },
      {
        head: 'Graphics',
        summary: 'Colour grading for every time of day, god rays at dusk and haze under the floodlights, weather that turns mid-match, turf that takes boot marks, dust and rain splashes, faces that celebrate, a crowd with arms at Ultra, and an Ultra+ cinematic tier for desktops.',
        detail: 'A quarter of matches see the weather change during play — rain arriving, or a wet first '
              + 'half clearing — and the pitch, the sky and the wonder roofs respond. The menu hero renders '
              + 'through WebGPU where the browser has it, with WebGL2 otherwise; the match itself stays on '
              + 'WebGL2 for now. Medium is unchanged so phones keep their frame rate.',
      },
      {
        head: 'Together',
        summary: 'Guilds with weekly objectives and a guild board, a friends list with invites to your lobby, spectator mode for live matches, emotes in online games, and highlights saved as a WebM clip.',
        detail: 'Found a guild or join one by code; wins, goals and matches from everyone count toward '
              + 'the same three weekly objectives, and each member claims the pack. Friends who are online '
              + 'can be invited straight into your lobby, and any live match can be watched — spectators '
              + 'see the host\'s picture and can never touch the game. Everything one player can say to '
              + 'another is one of eight emotes, shown in your language; there is no free-text chat, by '
              + 'design. The watch shows the ground and your guild\'s objectives.',
      },
    ],
  },
  {
    version: 'v71',
    date: '2026-09-19',
    tag: 'Spectacle',
    title: 'Sixty clubs, the walk-out, the World',
    lede: 'Six divisions and 3,092 players, a continental cup and national teams, the walk-out and the anthem, '
        + 'stadiums with a skyline, tifos and fireworks, photo mode, Arabic, and a first launch that hands you a squad.',
    entries: [
      {
        head: 'The World, twice the size',
        summary: 'Sixty clubs across six divisions, 3,092 real-name players, a Continental Cup for the top eight, national teams and a Nations Cup, and a Hall of Fame.',
        detail: 'The Pioneer and Grassroots Leagues join below the Foundation League, each club with '
              + 'its own ground. Last season\'s top eight play a knockout across the season at the '
              + 'arenas. Every nation with a full side gets a team built from the pool — Saudi Arabia '
              + 'among them — and the eight best play a Nations Cup in the international break; any '
              + 'tie or friendly can be played. The Trophy Room opens with the Icons and an honours '
              + 'board of every finished season.',
      },
      {
        head: 'Spectacle',
        summary: 'Stadium exteriors and a skyline, tifos and club-coloured ends, the walk-out with an anthem, a half-time show camera, fireworks for finals, a pitch that wears as the match goes on, and a stadium showcase.',
        detail: 'The broadcast camera now sees the outside of the ground and the town behind it. '
              + 'The home end raises a banner at kick-off and wears the colours; the away corner wears '
              + 'theirs. Before kick-off both sides line up on the halfway line while a generated '
              + 'anthem plays. Finals end in fireworks and confetti. Every ground can be walked round '
              + 'in 3D from the Stadiums screen, in any weather.',
      },
      {
        head: 'Graphics',
        summary: 'Motion blur and depth of field on replays, real reflections on a wet pitch at Ultra, kicks, slides and celebrations on the scanned models, cloth on shirts, and a photo mode that saves a PNG.',
        detail: 'Replays and the celebration cut run through a frame-blend and a shallower lens. '
              + 'In the rain at Ultra the pitch reflects the stands and the floodlights — a second '
              + 'render from a mirrored camera, not a screen-space guess. Pause any match for Photo '
              + 'Mode: orbit, zoom, six filters, and a PNG straight to your downloads.',
      },
      {
        head: 'For everyone',
        summary: 'Arabic with a right-to-left layout, larger text, colour-safe kits, and a first launch that hands you a starter squad and a guided match.',
        detail: 'Settings has a language switch; Arabic mirrors the layout. Colour-safe kits pick '
              + 'the away strip so it stays distinct for deutan, protan and tritan vision. A new save '
              + 'is dealt sixteen cards and a full XI, offered a guided match that teaches the '
              + 'controls one at a time, and lands on Today with its first rewards waiting.',
      },
    ],
  },
  {
    version: 'v70',
    date: '2026-09-19',
    tag: 'Big budget',
    title: 'Forty grounds, four divisions',
    lede: 'Every club has its own stadium now, in daylight, at dusk, at night and in the rain. '
        + 'The world is forty clubs across four divisions with promotion and relegation, '
        + 'the crowd moves, the shirts carry names, the stands sing, and your best player stands on the menu.',
    entries: [
      {
        head: 'Stadiums',
        summary: 'Forty distinct grounds plus four showpiece arenas, each built from a one-line definition; day, dusk, night, cloud and rain.',
        detail: 'Roof styles (open, cantilever, ring, dome, the arch), one or two tiers, lit rims '
              + 'or corner pylons, five ways of mowing the pitch, seats and facades in the club\'s '
              + 'colours. Time and weather come from the fixture and the day: a wet pitch mirrors '
              + 'the floodlights, rain falls through the beams, and by day the lights are simply '
              + 'off. Kick Off lets you choose the conditions. Career clubs and your Ultimate XI '
              + 'are dealt a ground of their own; finals and the Weekend League go to the arenas.',
      },
      {
        head: 'Graphics',
        summary: 'A crowd that sways, waves and jumps; numbers and names on shirts; four replay angles; a Medium tier and GPU detection.',
        detail: 'The crowd is animated in the vertex shader, so thirty thousand people cost what '
              + 'a still crowd cost. Every shirt has its number and surname printed on the back. '
              + 'Goals replay from a different camera each time — pitchside, behind the goal, the '
              + 'high wide, the reverse — and the highlights cycle them. Auto reads the GPU\'s name '
              + 'and picks Low, Medium or High; Medium keeps the lighting passes, beams and rain at '
              + 'a native pixel ratio for modern phones.',
      },
      {
        head: 'The World',
        summary: 'Forty clubs, four divisions, a round a day, two up and two down. 2,052 real-name players.',
        detail: 'The Vanguard and Foundation Leagues join the Apex Premier Division and the '
              + 'Meridian League, each with ten clubs, their own grounds and squads named from a '
              + 'third wave of real players. Every division plays a double round robin at one round '
              + 'a day, and at the end of each season two go up and two come down — decided the '
              + 'same way on every device, with nothing stored. The tables are on the World screen '
              + '(from Kick Off or Today) and any of today\'s fixtures can be played. Nothing you '
              + 'owned before changed.',
      },
      {
        head: 'Menu, cards, sound',
        summary: 'Your best player stands on the title screen in 3D. Foil on Special, Star and Icon cards that tilts with your finger. Packs turn the card over. Chants, rain and a PA announcer.',
        detail: 'The menu figure loads after the menu is ready and never on a low-tier device. '
              + 'Foil cards react to the pointer or a touch. The pack reveal flips the card in 3D. '
              + 'The stands clap and sing between plays and after goals, rain has its own sound, '
              + 'and the announcer — the browser\'s own voice, nothing recorded — welcomes you to '
              + 'the ground and names the scorer. All of it generated, none of it downloaded.',
      },
    ],
  },
  {
    version: 'v69',
    date: '2026-09-19',
    tag: 'Football',
    title: 'The football, and the job',
    lede: 'Set pieces you take yourself, smarter teams and keepers, commentary, a celebration cut, '
        + 'highlights — and a career with a second tier, a cup, offers, an academy and a board.',
    entries: [
      {
        head: 'Dead balls are yours',
        summary: 'Corners, free kicks, penalties and throw-ins: aim with the stick, hold the button for the kick.',
        detail: 'Fouls anywhere are free kicks now, with a wall ten yards off; a shot over it, a '
              + 'cross or a short ball, your choice. Throw-ins are taken, not teleported. Penalties '
              + 'let you pick a side and load the power. On a phone the buttons relabel themselves '
              + 'for the moment. The CPU takes its own with a wall and an idea.',
      },
      {
        head: 'Teams that think',
        summary: 'Counter-attacks, off-the-ball runs, a block that drops and narrows, sweeper-keepers, distribution with intent.',
        detail: 'Win it deep and the whole side breaks. Midfielders time runs beyond the ball. '
              + 'Keepers come for loose balls and claim crosses, then roll it to a free full-back '
              + 'instead of always launching it. Injuries happen — a limping player is slower and '
              + 'less accurate, and the CPU replaces him at the next stoppage. Tired legs blunt '
              + 'passing and shooting. Skill move (H / L2) and lob (U / Select) are new controls; '
              + 'the tutorial and the pause menu explain them.',
      },
      {
        head: 'Presentation',
        summary: 'A commentary feed of 200+ lines, a camera cut for goals, half-time facts with expected goals, highlights, a sound switch.',
        detail: 'The voice in the gantry reacts to shots, saves, fouls, chances, breaks and the '
              + 'clock. Goals cut to a pitch-level camera beside the scorer. Half time opens on the '
              + 'stat sheet — possession, shots, expected goals, big chances, corners, fouls — and '
              + 'full time offers a highlights reel of every goal. Sound on/off lives in the pause menu.',
      },
      {
        head: 'Career, second season and beyond',
        summary: 'Second tiers with promotion and relegation, a national cup, offers for your players, AI transfers, an academy, scouting, development, a board that can sack you, press conferences.',
        detail: 'Every country has a second division of real clubs whose squads are real players. '
              + 'Two go down and two come up — including you. A knockout cup runs every fifth week. '
              + 'In the windows clubs bid for your best players; you accept, counter or refuse, and '
              + 'the other clubs trade among themselves. Three academy prospects train and can be '
              + 'promoted; a scout reports on any league in four weeks; the young grow and the old '
              + 'fade each summer. The board sets an objective from where your squad ranks and '
              + 'loses patience if you fall well short — miss it and you are out, with interviews '
              + 'elsewhere. A press question follows every match. League titles, cups, promotions '
              + 'and graduates pay Apex and packs into Ultimate XI.',
      },
      {
        head: 'Online',
        summary: 'A Weekend League queue that pairs you by record, and reconnects that keep the match alive.',
        detail: 'Find an opponent from the Weekend League screen and you are matched with someone '
              + 'on a similar number of wins this weekend. Drop your connection mid-match and the '
              + 'server holds your seat for 45 seconds while your opponent\'s game pauses; come '
              + 'back and it resumes where it was.',
      },
      {
        head: 'Balance re-baselined',
        summary: 'The new team AI changed the football on purpose; the sweep was re-recorded and stays inside its targets.',
        detail: 'Sixty AI-vs-AI matches on two seeds: 2.10 and 2.20 goals a match, 12.7 shots, '
              + 'against 2.45 and 12.4 before. Blocks that drop and counter-attacks were tuned '
              + 'until the game landed back inside 2–3 goals and about 11–13 shots. The watch shows '
              + 'a line of commentary for the big moments and prompts you at set pieces.',
      },
    ],
  },
  {
    version: 'v68',
    date: '2026-09-19',
    tag: 'Live',
    title: 'Something to come back for',
    lede: 'A Today hub with daily rewards, weekly events and a 30-tier Season Pass; '
        + 'Weekend League; a trophy room; card evolution; twelve legend SBCs; and ten new clubs.',
    entries: [
      {
        head: 'Today',
        summary: 'Daily login calendar, the week\'s event, Season Pass and everything to claim, in one place.',
        detail: 'The new tile on the menu. A seven-day login calendar that pays coins and packs, '
              + 'the event that is on this week with its own objectives, your Season Pass tiers to '
              + 'claim, the weekend, and the top of your objective slate. The watch shows the '
              + 'same daily reward, season tier and event card.',
      },
      {
        head: 'Live events and the Season Pass',
        summary: 'A themed pack, three objectives and a featured card every week; 30 tiers of rewards for XP.',
        detail: 'Green Falcons Week, Meridian Rising, Wall Week and Finishing School rotate, each '
              + 'with a pack that only pulls its theme and a featured card that lands evolved. XP '
              + 'comes from every match, objective, challenge and login; each tier is 250 XP and '
              + 'the finale pays Ultimate. All of it is data the server serves, so a new event '
              + 'never needs an update.',
      },
      {
        head: 'Weekend League',
        summary: 'Ten matches from Friday evening to Monday morning; wins set your rank, the rank pays.',
        detail: 'Against squads built to your division offline, and any online division match '
              + 'inside the window counts too — the server keeps its own validated tally and a '
              + 'board for the weekend. Bronze to Apex; rewards are claimed on Monday.',
      },
      {
        head: 'Trophy room',
        summary: 'Fifty achievements across collecting, matches, career, online, the weekend and the watch.',
        detail: 'Each one is a shelf in the cabinet with a bronze, silver or gold cup, a progress bar '
              + 'and an Apex reward to collect. Every one also pays Season XP the moment it unlocks.',
      },
      {
        head: 'Evolve',
        summary: 'Take any card up five levels with duplicates or Apex — +1 overall and +1% on every stat per level.',
        detail: 'Duplicates pulled from packs are banked as material now as well as paying coins. '
              + 'The price in Apex climbs with the level and the rating. Open any card you own to '
              + 'see its path; the squad shows the evolved rating.',
      },
      {
        head: 'Chemistry on the pitch, and twelve legends',
        summary: 'Links by club, nation and league now change how your XI plays, slightly; twelve new SBCs pay unique legend cards.',
        detail: 'A card at full chemistry plays a shade above its printed stats and one with none a '
              + 'shade below — never more than about two per cent, and only for your own squad. '
              + 'Saudi XI, Bronze to Silver, League Mix, Meridian XI, Wonderkids, Old Guard, The Wall, '
              + 'Strike Force, Engine Room, World Tour, Samba and Tiki-Taka each pay a legend that '
              + 'exists nowhere else: Henry, Ronaldinho, Iniesta, Pirlo, Gerrard, Agüero, Drogba, '
              + 'Casillas, Rooney, Lampard, Lahm and Puyol.',
      },
      {
        head: 'The Meridian League',
        summary: 'Ten new clubs with their own kits and grounds — twenty in the world now.',
        detail: 'Harbourlight, Redcliffe, Ashgrove, Saltmarsh, Vireo, Coldwater, Ember Vale, Greywick, '
              + 'Lumen City and Serrano Nova. Their squads are the real players who were free agents, '
              + 'so nothing you own changed except where some of them play; league links count for '
              + 'chemistry and the Meridian Pack pulls only from them.',
      },
    ],
  },
  {
    version: 'v67',
    date: '2026-09-18',
    tag: 'Foundation',
    title: 'Faster to load, harder to break',
    lede: 'The game boots in a quarter of the time on a slow connection, the black '
        + 'flicker has a cause and a fix, and errors get a proper screen instead of a blank one.',
    entries: [
      {
        head: 'A quarter of the wait',
        summary: 'Cold start on a slow phone line: 15 seconds to about 3.5, and 2.6 MB down to about half a megabyte.',
        detail: 'The 3D engine is no longer part of booting the game — it loads the first '
              + 'time you kick off, behind the loading screen you already see, and is '
              + 'warmed quietly a few seconds after the menu appears. Everything the '
              + 'server sends is compressed now, and files that have not changed are '
              + 'not sent again at all. The menu backdrop is a third of its old size '
              + 'at the same look.',
      },
      {
        head: 'The black flicker',
        summary: 'The floodlight beams could paint a NaN — a black wedge — for one frame. Fixed at the source.',
        detail: 'The beam shader computed the cone\'s rim from a normal that could, by '
              + 'one rounding error, come out a hair past one; the maths turned that '
              + 'into a negative base for a power function, which is not-a-number, '
              + 'and an additive not-a-number renders black. It only happened on the '
              + 'triangles facing the lens that exact frame — a hard-edged dark wedge '
              + 'where the beams cross the goalmouth, gone the next frame. The value '
              + 'is clamped now, and the post pass also refuses to pass a NaN on to '
              + 'the bloom, so no other material can do the same trick.',
      },
      {
        head: 'A screen when things go wrong',
        summary: 'Errors show a card with Carry on / Reload / Back to menu, and send a report.',
        detail: 'Uncaught errors used to leave a stuck screen. Now a card explains, '
              + 'offers the three things that help, and posts a clipped report so the '
              + 'next build can fix it. Blocked storage (private browsing) no longer '
              + 'stops the game: it plays from memory and tells you once that progress '
              + 'will not be kept. Signing in still saves to the cloud regardless.',
      },
      {
        head: 'Three bugs the new tests found',
        summary: 'Claiming the free pack, opening a Star or Icon pack, and the store timer all threw.',
        detail: 'The pack engine moved into its own file in v65 and left three names '
              + 'behind: the free-pack timer, the guarantee slot and the countdown '
              + 'formatter. Any of them threw the moment they were reached. A real '
              + 'test suite runs on every push now — unit tests, a browser smoke test '
              + 'of phone and watch, a balance-sweep gate and a black-pixel scan of the '
              + 'renderer — which is how these were caught, and how the next ones will be.',
      },
    ],
  },
  {
    version: 'v66',
    date: '2026-09-11',
    tag: 'Watch + World',
    title: 'The watch boots, the world grows',
    lede: 'The Apple Watch build actually opens now, penalties and daily objectives on '
        + 'the wrist, and 369 more real players in every pack.',
    entries: [
      {
        head: 'Watch: no more black screen',
        summary: 'The watch app is one plain script now, and it tells you if anything goes wrong.',
        detail: 'The wrist browser is a stripped WebKit with no console: when one of fifteen '
              + 'module files failed to load or a line of modern syntax was refused, all it '
              + 'showed was black. The watch now gets a single bundled script in old, boring '
              + 'syntax, a loading screen the moment the page opens, and an on-screen error '
              + 'with a Retry button if the app cannot start. /watch works without the .html.',
      },
      {
        head: '369 more real players',
        summary: 'Every club has a deeper squad and the free pool is half again as big — all real names.',
        detail: 'A second wave of real footballers, including the Saudi national side, '
              + 'joins the world: fifteen squad players per club and a wide free pool with a '
              + 'run of headline cards for the packs. Nothing you already own changed — the '
              + 'new cards are appended after the old ones and named from their own list, '
              + 'and the balance sweep is byte-identical to v65.',
      },
      {
        head: 'Penalties',
        summary: 'A shootout on the watch: tap the sweep to shoot, pick a side to save.',
        detail: 'Five each, sudden death after. Corners score more and get saved more; the '
              + 'middle beats a keeper who has already gone. The marker speeds up every '
              + 'round. 120 Apex a goal, 300 for the win.',
      },
      {
        head: 'Daily objectives and a streak',
        summary: 'Three small things to do today, and a bonus for showing up.',
        detail: 'The Club glance now shows a day streak (100 Apex a day, up to 700) and '
              + 'three objectives drawn fresh each day — play, score, win on Hard, open a '
              + 'pack, save a penalty. They pay out on the spot with a buzz. Plus a difficulty '
              + 'picker (Hard pays double), every club as an opponent, a Lucky Dip in the '
              + 'wrist store, and your best twelve cards on the Club screen.',
      },
    ],
  },
  {
    version: 'v65',
    date: '2026-08-28',
    tag: 'Watch',
    title: 'APEX XI on your wrist',
    lede: 'A watch build with real 2D Kick Off matches and pack openings, '
        + 'paired to your account with a six-digit code.',
    entries: [
      {
        head: 'Football on a watch face',
        summary: 'A 60-second Kick Off, played with a drag and one button.',
        detail: 'It is the same simulation the phone runs — same physics, same AI, same '
              + 'balance — drawn in 2D and framed close so the football fills a 40mm '
              + 'screen. Drag anywhere to run, and one button kicks: it shoots near their '
              + 'goal and passes everywhere else, so there is nothing to learn and nothing '
              + 'to miss with a thumb. Goals buzz.',
      },
      {
        head: 'Packs, the good part only',
        summary: 'Four packs, the sealed packet, the rip, and the card.',
        detail: 'The wrist store is Bronze, Silver, Gold and Prime — no odds tables to '
              + 'scroll. The packet breathes in the colour of the best card inside, one tap '
              + 'tears it open, and each card lands with a flash and a tap of the Taptic '
              + 'engine that gets longer the rarer it is. Worst first, best last. Anything '
              + 'you pull is in your collection on the phone.',
      },
      {
        head: 'Six digits to pair',
        summary: 'No password typing on a watch.',
        detail: 'On the phone: Ultimate XI → Online → Pair a watch, which shows a code. '
              + 'Type it once on the watch and it holds its own sign-in, so your coins and '
              + 'cards are the same on both. The code lasts three minutes and works once. '
              + 'There is also a play-without-an-account option if you just want a game.',
      },
    ],
  },
  {
    version: 'v64',
    date: '2026-08-28',
    tag: 'Security',
    title: 'Locking the doors',
    lede: 'Coin editing, forged results, password guessing and a few other '
        + 'open doors are shut.',
    entries: [
      {
        head: 'Balances that have to be earned',
        summary: 'The server now checks what a save claims against what playing can '
               + 'actually produce.',
        detail: 'Saves were stored exactly as the game sent them, which is how one account '
              + 'arrived with nineteen million coins. Balances are now checked on the way '
              + 'in: absolute ceilings, a generous hourly limit on how fast a balance can '
              + 'grow, and collections de-duplicated. Nothing an honest player does comes '
              + 'near the limits — a full sell-off or the 200,000-coin objective lands '
              + 'untouched — and anything above them is trimmed and logged.',
      },
      {
        head: 'Results that need a match',
        summary: 'The leaderboard now only accepts a scoreline from a game that was '
               + 'actually played.',
        detail: 'It was possible to sign in, report a 9–0 win without ever being in a '
              + 'match, and repeat. Results must now come from a live match, are accepted '
              + 'once per fixture, and are taken from the machine that ran the simulation.',
      },
      {
        head: 'Accounts that are harder to break into',
        summary: 'Password guessing is throttled, tokens expire, new passwords are '
               + 'eight characters.',
        detail: 'Wrong passwords are limited per account and per connection — and only '
              + 'wrong ones count, so signing in normally is never affected, including '
              + 'from a shared or mobile connection where someone else is guessing. '
              + 'Sign-in tokens now expire, so one that leaks does not work forever. '
              + 'Existing passwords keep working; new ones need eight characters.',
      },
    ],
  },
  {
    version: 'v63',
    date: '2026-08-28',
    tag: 'Career',
    title: 'Kick off on the touchline',
    lede: 'Career matches now open on the manager camera — you, from behind, '
        + 'watching your team — with C flipping to the TV broadcast.',
    entries: [
      {
        head: 'The touchline first',
        summary: 'The mode is about standing there, so that is the first thing you see.',
        detail: 'Every career match starts over your manager\'s shoulder, his back to the '
              + 'camera and his eyes on the pitch — a facing bug that could start him '
              + 'looking into the lens went with it, the model\'s rest orientation was '
              + 'simply the opposite of what the loader assumed. The camera button (or C) '
              + 'still flips to the broadcast view and back whenever you want the TV '
              + 'picture.',
      },
    ],
  },
  {
    version: 'v62',
    date: '2026-08-28',
    tag: 'Career',
    title: 'The touchline is yours to walk',
    lede: 'You control the manager now, shouts have a cooldown, careers work '
        + 'properly on phones, and the career hub got a full redesign.',
    entries: [
      {
        head: 'Walk him yourself',
        summary: 'The manager moves when you move him — stick, arrow keys, or the '
               + 'on-screen arrows on touch. No more autopilot, no more glancing at the camera.',
        detail: 'The figure walks the technical area under your control and stops when you '
              + 'stop, facing the pitch. The over-the-shoulder glance at the lens was a '
              + 'turning bug — for a frame between facings he swept through the camera-'
              + 'facing angle — and turns now ease through the pitch side only.',
      },
      {
        head: 'A voice, not a firehose',
        summary: 'Shouts have an eight-second cooldown, counted down on the wheel itself.',
        detail: 'Spamming all four buttons made every shout meaningless. After a shout the '
              + 'wheel dims and its hub counts back down to SHOUT; picks and hotkeys are '
              + 'refused until it does, and fresh options arrive with the reopening.',
      },
      {
        head: 'Career on a phone, fixed',
        summary: 'The player touch controls no longer appear in career matches, and the '
               + 'whole touchline HUD is sized for a phone.',
        detail: 'A career match was showing the stick and the PASS/SHOOT buttons of a '
              + 'played match — controls wired to nothing, covering the pitch. Career '
              + 'matches now show only what a manager has: the wheel, the meters, the '
              + 'camera toggle and two walk arrows, all sized down for phone screens.',
      },
      {
        head: 'The hub, redesigned',
        summary: 'A proper club banner in your colours, chips for the season\'s vitals, '
               + 'and a segmented nav that stops covering the page.',
        detail: 'The career menu borrowed the Ultimate XI dock\'s styling, which pins '
              + 'itself over the bottom of the screen — that was most of what looked '
              + 'broken. The hub now has its own header (crest, colours, coins, position, '
              + 'record, morale) over an in-flow segmented nav, and the next fixture is a '
              + 'proper matchday hero card in both clubs\' colours.',
      },
    ],
  },
  {
    version: 'v61',
    date: '2026-08-27',
    tag: 'Career',
    title: 'The manager has a face',
    lede: 'A real 3D manager model walks the technical area — idling, '
        + 'prowling, shouting, celebrating and stamping.',
    entries: [
      {
        head: 'One model, seven moods',
        summary: 'The supplied manager model now acts the match: walking with play, '
               + 'shouting with your shouts, celebrating goals, stamping at conceding.',
        detail: 'The model arrived as seven 65MB files, one animation each. They were '
              + 'merged into a single 1.6MB file — the 8192-pixel texture carried almost '
              + 'all of that weight and reads identically at 1024 — with the clips renamed '
              + 'and wired to the match: idle instruction-waving on the spot, a walk that '
              + 'tracks play up and down the technical area, the shout when you use the '
              + 'wheel, the celebration when it goes in, and the ground stomp when it goes '
              + 'in at the wrong end. Loaded on demand, only in Career, never part of the '
              + 'offline bundle.',
      },
    ],
  },
  {
    version: 'v60',
    date: '2026-08-27',
    tag: 'Career',
    title: 'Career, release cut',
    lede: 'Ten more clubs, negotiations with manners and a patience bar, plain-'
        + 'money bids, and a touchline HUD rebuilt for release.',
    entries: [
      {
        head: 'Thirty-five clubs',
        summary: 'Every league filled out — the Saudi Pro League alone grew to six.',
        detail: 'Newcastle, Aston Villa, Villarreal, Athletic Club, Roma, RB Leipzig, '
              + 'Stuttgart, Monaco, Al Shabab and Al Ettifaq join, taking the career world '
              + 'to 35 clubs across six leagues. One real manager remains on the board — '
              + 'Pep — alongside the full custom builder; the calendar reads in months now, '
              + 'two to a matchday.',
      },
      {
        head: 'Negotiations you can read',
        summary: 'Type money like a human — 60m, 500k — see both numbers side by '
               + 'side, and watch their patience run out.',
        detail: 'The offer box takes plain shorthand and echoes exactly what it means '
              + 'while you type. Their number and yours sit side by side, and above them a '
              + 'patience bar drains with every rejected round. Insult them with a joke '
              + 'number and the meeting ends on the spot — and that player\'s people stop '
              + 'taking your calls for ten months, shown right on his market row.',
      },
      {
        head: 'A touchline HUD worth shipping',
        summary: 'The shout wheel is a proper diamond of four big buttons, numbered '
               + '1–4 on the keyboard, with labelled morale and performance meters.',
        detail: 'The four shouts sit clear of each other with their hotkeys stitched on, '
              + 'C flips between broadcast and manager cam, and the two meters carry their '
              + 'names and live numbers, shifting colour as they move. Career also joined '
              + 'the game tutorial — three new steps cover the touchline, the meters and '
              + 'the market\'s manners.',
      },
    ],
  },
  {
    version: 'v59',
    date: '2026-08-27',
    tag: 'Career',
    title: 'Manager Career',
    lede: 'Take a real club, stand on the touchline, and answer for the '
        + 'results. Career Mode V1 is live.',
    entries: [
      {
        head: 'A real football world',
        summary: '25 real clubs across six leagues, squads of real footballers, '
               + 'and 500 million Club Coins to spend.',
        detail: 'Manchester City to Al Hilal, every club carries its real players — the '
              + 'same people, ratings and values as the rest of the game — in leagues with '
              + 'a real table to climb. Pick a real manager (Guardiola, Ancelotti, Klopp '
              + 'and more) or build your own, face and suit included: the model you make is '
              + 'the one standing in your technical area on matchday. Player Mode is on the '
              + 'board too, honestly labelled: under construction.',
      },
      {
        head: 'The touchline is the game',
        summary: 'Matches are AI against AI. You manage: four rotating shouts, '
              + 'a morale meter and a performance meter the players actually obey.',
        detail: 'A career match is 90 seconds a half of real football you do not control '
              + 'directly. The command wheel offers four options that follow the situation '
              + '— PRESS and DROP BACK while defending, SHOOT and CROSS in their box, '
              + 'ENCOURAGE and CALM DOWN after conceding — refreshing every ten seconds, or '
              + 'five after you use it. Shouts change the team\'s real tactics and its '
              + 'performance level, and they cost: DEMAND MORE lifts performance while it '
              + 'dents morale, and morale is what performance keeps getting pulled back '
              + 'toward. At half time the squad huddles for a team talk — four choices, '
              + 'same trade-offs, personalities included. Two cameras: the TV broadcast, '
              + 'or a third-person view standing behind your own manager.',
      },
      {
        head: 'A market with stages',
        summary: 'Search, shortlist, bid, get countered, agree terms — then he joins.',
        detail: 'Transfers are negotiations, not purchases. The selling club prices on '
              + 'rating, age, form and how long the contract has left — a player with a '
              + 'season to run comes cheap, and everyone at the table knows it. Agree a fee '
              + 'and the player still wants his wage and his years. Contracts then matter: '
              + 'they run down season by season, expiring players want new terms or leave, '
              + 'and a squad with low morale is a squad that rejects renewals.',
      },
    ],
  },
  {
    version: 'v58',
    date: '2026-08-27',
    tag: 'Online',
    title: 'Direct connections and the shared whistle',
    lede: 'Online matches now connect player-to-player when they can, pausing '
        + 'is a shared, refereed act, and the store grew five packs.',
    entries: [
      {
        head: 'Peer to peer, with the old road kept',
        summary: 'Two players connect directly to each other when the network allows '
               + 'it, which for nearby players cuts the delay enormously.',
        detail: 'Until now every kick crossed to the server and back — twice, once per '
              + 'player — even between two people in the same city. Matches now open a '
              + 'direct browser-to-browser channel and move the match traffic onto it; the '
              + 'HUD shows "direct" next to the ping when it is on. The server connection '
              + 'is not replaced, it is the fallback: if a direct path cannot be made (some '
              + 'mobile networks refuse), or dies mid-match, packets simply take the old '
              + 'route again — no interruption, just today\'s latency instead of the better '
              + 'one. Nothing about matchmaking, accounts or fairness changed.',
      },
      {
        head: 'Pausing is queued, like a real substitution',
        summary: 'Ask for a pause and both screens say so; the match stops at the next '
              + 'dead ball, both players get the menu and one shared 20-second clock.',
        detail: 'Any pause input — the pad\'s Options button, Esc, the HUD button — now '
              + 'queues a pause instead of pretending to stop a match the other player is '
              + 'still playing. Both screens show who asked. At the next stoppage — throw-in, '
              + 'corner, goal kick, goal — the game freezes for both, the pause menu opens '
              + 'on both, and a single synchronized 20-second countdown runs before play '
              + 'resumes for both on the same beat. If the ball stubbornly stays in, the '
              + 'pause forces through after 40 seconds. Duplicate requests are ignored, a '
              + 'disconnect clears everything, and one player can never be paused while '
              + 'the other plays on.',
      },
      {
        head: 'The pause menu is alive',
        summary: 'While a match is paused, recent play runs back behind the menu.',
        detail: 'Whenever the world is genuinely stopped — an offline pause, half time, the '
              + 'shared online pause — the menu no longer sits over a freeze-frame. The last '
              + 'few seconds of play loop behind it on a slow pitchside camera, in every '
              + 'mode. Too early for any footage and the camera drifts over the stadium '
              + 'instead.',
      },
      {
        head: 'Five more packs',
        summary: 'Striker, Silver Stack, Form Signing, Double Down, and Limited: Wildcard.',
        detail: 'Each one fills a real gap rather than restating an existing pack: Striker '
              + 'is the Keeper pack\'s mirror (two cards, one guaranteed ST); Silver Stack '
              + 'is cheap bulk with no bronze floor-outs; Form Signing is three 78+ cards '
              + 'between Gold and Prime money; Double Down is the cheapest guaranteed '
              + 'Special in the store; Limited: Wildcard is one 86+ card at 90% special-or-'
              + 'better — the odds are the promise.',
      },
    ],
  },
  {
    version: 'v57',
    date: '2026-08-26',
    tag: 'Online',
    title: 'About 50ms off the lag',
    lede: 'Online matches run tighter, and the ping in the HUD is now the number '
        + 'you actually feel.',
    entries: [
      {
        head: 'The delay you never asked for',
        summary: 'The guest used to watch the match a flat 100ms in the past. It now works '
               + 'out how much of a cushion the connection really needs.',
        detail: 'In an online match one player runs the simulation and the other watches it '
              + 'arrive, slightly behind, so the gaps between packets can be smoothed over. '
              + 'That cushion was a fixed 100 milliseconds, sized for the worst connection '
              + 'anybody might have, and everyone paid it. It is now measured from the packets '
              + 'themselves: a steady connection gets about 66ms, a jumpy one still gets the '
              + 'full cushion it needs. The host also sends the world half again as often '
              + '(30 times a second), and the guest sends its controls more often too. '
              + 'Together that is roughly 50 milliseconds off how late your own input looks.',
      },
      {
        head: 'An honest ping',
        summary: 'The HUD now shows the round trip to your opponent, not to the server.',
        detail: 'It used to show how far you are from the server, which is about half the '
              + 'story — what you feel is your input reaching your opponent and the match '
              + 'coming back, which is your distance plus theirs. The number is now measured '
              + 'by bouncing a ping off the other player, so it is the real thing, and the '
              + 'colours moved to match: green under 90ms, amber under 190ms.',
      },
    ],
  },
  {
    version: 'v56',
    date: '2026-08-26',
    tag: 'Interface',
    title: 'New menu art, shot in the engine',
    lede: 'The main menu now sits on a night match photographed inside the '
        + 'game itself, at full screen resolution.',
    entries: [
      {
        head: 'Sharp this time',
        summary: 'The old backdrop was a small image stretched across a big screen. '
               + 'This one is drawn at 2560 wide.',
        detail: 'The art is a frame from the game\'s own renderer, taken from a camera the '
              + 'game never actually uses: down at pitch level near the halfway line, wide '
              + 'lens, floodlight in shot, the crowd banked up behind. It is then graded to '
              + 'night, the floodlights are bloomed, the green brand streaks are laid over it '
              + 'and the lower half is darkened so the tiles and the small print stay '
              + 'readable. Everything on screen is the real stadium, the real crowd and the '
              + 'real turf shader — nothing was borrowed from anywhere else.',
      },
    ],
  },
  {
    version: 'v55',
    date: '2026-08-26',
    tag: 'Fix',
    title: 'The page takes the wheel',
    lede: 'The wheel now scrolls the page whenever nothing under the pointer '
        + 'can scroll instead — whatever the reason.',
    entries: [
      {
        head: 'No more diagnosing',
        summary: 'If nothing under the pointer can take the scroll, the page takes it.',
        detail: 'The mouse wheel has had three separate causes now — a leftover scroll lock '
              + 'after a match, panels clipping their artwork and latching the gesture, and '
              + 'whatever was still wrong after both of those were fixed. So the game has '
              + 'stopped trying to name the cause. Every wheel event is now checked: if there '
              + 'is a real list under the pointer with somewhere to go, it scrolls, exactly as '
              + 'before; if there is not, the page is scrolled directly rather than left to '
              + 'the browser to decide. Matches and pinch-zoom are untouched.',
      },
      {
        head: 'Scroll check',
        summary: 'Settings → App has a readout that says what the wheel actually did.',
        detail: 'None of the three causes ever reproduced on a test machine, which is what '
              + 'made each one take so long. Settings now has a Scroll check panel: open it, '
              + 'move the wheel, and it shows whether the page received the scroll, how far it '
              + 'moved, what element handled it and how much room the page has. A screenshot '
              + 'of that panel is worth more than any description of the symptom.',
      },
    ],
  },
  {
    version: 'v54',
    date: '2026-08-26',
    tag: 'Content',
    title: 'Everyone on a card is real',
    lede: 'All 731 players now carry a real footballer\'s name and nationality. '
        + 'No rating, stat or squad changed.',
    entries: [
      {
        head: 'Real names, real countries',
        summary: 'The invented names are gone. Every card names a real player, with '
               + 'their real country and flag.',
        detail: 'The world used to be filled with generated names from generated countries. '
              + 'It now names 696 real footballers, on top of the 35 Icons and Stars that '
              + 'always did — 731 real people, no name used twice. Countries came with them, '
              + 'so the flags on the cards are real flags. Keepers are matched to keeper '
              + 'cards; elsewhere a card takes the closest position still free, because the '
              + 'game wants far more wide midfielders than the real game has.',
      },
      {
        head: 'Your squad did not change',
        summary: 'Ratings, stats, positions, clubs, values and your collection are '
               + 'exactly as they were — only the names on the fronts are new.',
        detail: 'The cards are built first and named second, which is what makes this safe: '
              + 'nothing that decides how a card plays was touched, and a card keeps its id, '
              + 'so a collection points at the same cards it always did. An 85-rated '
              + 'right-back is the same 85-rated right-back this morning and tonight, with a '
              + 'different person on the front. Chemistry is worked out from clubs and '
              + 'nations, and clubs are unchanged, so squads keep their links.',
      },
      {
        head: 'What is not real',
        summary: 'Clubs, leagues, ratings and the drawn faces are all still invented.',
        detail: 'The clubs, leagues and competitions stay fictional, and so do the ratings '
              + 'and stats — those are the game\'s numbers, not a claim about anybody\'s '
              + 'ability. The portraits are still drawn from the card id and are deliberately '
              + 'not likenesses: the list these names came from carried image search links '
              + 'rather than photographs, and player photography belongs to whoever shot it. '
              + 'None of the players named are affiliated with or endorse the game.',
      },
    ],
  },
  {
    version: 'v53',
    date: '2026-08-26',
    tag: 'Fix',
    title: 'The wheel, for real this time',
    lede: 'The mouse wheel now scrolls from anywhere on the page, not just from '
        + 'the bar at the bottom.',
    entries: [
      {
        head: 'What was actually wrong',
        summary: 'Panels that clip their own artwork were swallowing the wheel. '
               + 'They no longer can.',
        detail: 'Hiding overflow in CSS does not just hide a scrollbar — it makes the box a '
              + 'scroll container, and a box clipping two pixels of a gradient has two pixels '
              + 'of scrolling to do. The browser latches the wheel onto the first such box '
              + 'under the pointer, scrolls it those two pixels, and then refuses to pass the '
              + 'rest of the gesture on to the page. The banner at the top of every screen was '
              + 'one of these, which is why the wheel appeared dead everywhere, and the pitch, '
              + 'the menu tiles and the team cards were others. Those boxes now clip without '
              + 'becoming scrollers, so there is nothing left to latch onto. Lists that are '
              + 'meant to scroll — your collection, the store shelves — are untouched and '
              + 'still scroll under the pointer as before.',
      },
      {
        head: 'And a guard, so it cannot come back',
        summary: 'If a panel ever traps the wheel again, the page scrolls anyway.',
        detail: 'This is the third separate cause of "the mouse wheel does not work", and all '
              + 'three were invisible in review. There is now a check that notices when the '
              + 'wheel is over a box that hides its overflow with no real list between there '
              + 'and the page, and scrolls the page itself in that case. It stays out of the '
              + 'way of genuine scrollers, of pinch-zoom and of matches.',
      },
    ],
  },
  {
    version: 'v52',
    date: '2026-08-26',
    tag: 'Interface',
    title: 'One card, the right one',
    lede: 'Packs now reveal only your best pull, and the menu is wearing the '
        + 'real cover art.',
    entries: [
      {
        head: 'The reveal stops at the best card',
        summary: 'A pack shows you the card you actually care about and then ends. '
               + 'Everything else still lands in your locker.',
        detail: 'A twelve-card pack used to be twelve reveals, and because the order runs '
              + 'worst to best, the eleven you sat through first were by construction the '
              + 'eleven you wanted least. Now the show is one card long: the highest-rated '
              + 'pull in the pack, with the full walkout, the fireworks and the rarity glow. '
              + 'Nothing about what you get has changed — every card is still added and every '
              + 'duplicate is still paid out at the same rate, and the locker has the complete '
              + 'list — but the pack is a moment now instead of a queue.',
      },
      {
        head: 'The cover art is the menu',
        summary: 'The main menu now sits on the real APEX XI key art.',
        detail: 'The menu backdrop was a frame grabbed out of the match renderer and graded to '
              + 'look like cover art. It has been replaced with the actual artwork, unretouched, '
              + 'with a much lighter scrim over it so the stadium, the lasers and the player all '
              + 'read. The duplicate wordmark that used to sit on top of it is gone — the art '
              + 'carries its own.',
      },
    ],
  },
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
