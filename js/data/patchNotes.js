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
