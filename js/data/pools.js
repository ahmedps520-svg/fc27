// Invented name / place pools. Nothing here maps to a real player, club or league.

export const FIRST_NAMES = [
  'Kael', 'Dario', 'Emrik', 'Tobin', 'Rafe', 'Nilo', 'Casian', 'Odran', 'Silas', 'Mateus',
  'Ivo', 'Renzo', 'Arlo', 'Zane', 'Fabien', 'Marek', 'Lukan', 'Teodor', 'Anselm', 'Bram',
  'Corin', 'Dax', 'Elian', 'Ferro', 'Gustav', 'Halvar', 'Ikaro', 'Jorin', 'Kiran', 'Leonel',
  'Milo', 'Nero', 'Osric', 'Pavel', 'Quillon', 'Rowan', 'Soren', 'Tamir', 'Ulric', 'Varro',
  'Wendel', 'Xandro', 'Yannic', 'Zoran', 'Aldric', 'Benno', 'Cyrel', 'Dorian', 'Evrin', 'Florin',
  'Gideon', 'Hektor', 'Ilias', 'Joric', 'Kasper', 'Lyron', 'Mattis', 'Nevin', 'Orin', 'Priam',
  'Rune', 'Stellan', 'Tavian', 'Ansel', 'Brayon', 'Ciro', 'Delmar', 'Eryk', 'Fenn', 'Garrik',
];

export const LAST_NAMES = [
  'Vance', 'Halloran', 'Voskuil', 'Marren', 'Delgadio', 'Brekker', 'Ostrand', 'Fenwick',
  'Calloway', 'Rethen', 'Amory', 'Bexley', 'Corvain', 'Drayton', 'Esparro', 'Falkner',
  'Grimald', 'Harkness', 'Ivarsen', 'Jansdal', 'Krauss', 'Lindqvist', 'Morrow', 'Norquist',
  'Oakhart', 'Pellegrin', 'Quill', 'Ravnhorst', 'Stavros', 'Thorne', 'Ulrich', 'Vantol',
  'Wexler', 'Yaros', 'Zabala', 'Ashcombe', 'Brannigan', 'Castellan', 'Dunmore', 'Ellwood',
  'Fontaine', 'Garrow', 'Hensley', 'Iverlund', 'Jorgen', 'Kessler', 'Larrion', 'Mendova',
  'Nystrom', 'Orvieto', 'Palladin', 'Rennick', 'Sable', 'Torvald', 'Ubiali', 'Verhagen',
  'Wilder', 'Ystad', 'Zoric', 'Alvarine', 'Brimwood', 'Carrow', 'Dagsen', 'Everly',
  'Fyodrin', 'Galvain', 'Hollis', 'Ivorin', 'Jarrow', 'Kolvane', 'Merrow', 'Nordahl',
  'Ovaris', 'Prewitt', 'Rask', 'Sunderin', 'Tessaro', 'Valmont', 'Wraye', 'Zellick',
];

// Fictional nations. Each carries a two-tone flag used across the UI.
export const NATIONS = [
  { name: 'Valoria', colors: ['#e63946', '#1d3557'] },
  { name: 'Norlund', colors: ['#4cc9f0', '#f8f9fa'] },
  { name: 'Astravia', colors: ['#ffd166', '#073b4c'] },
  { name: 'Cotania', colors: ['#06d6a0', '#1b2a41'] },
  { name: 'Meridia', colors: ['#f77f00', '#003049'] },
  { name: 'Sunhaven', colors: ['#fcbf49', '#d62828'] },
  { name: 'Kaldoria', colors: ['#8ecae6', '#023047'] },
  { name: 'Tervia', colors: ['#b5179e', '#3a0ca3'] },
  { name: 'Bramoor', colors: ['#588157', '#dad7cd'] },
  { name: 'Zephyria', colors: ['#7209b7', '#4cc9f0'] },
  { name: 'Ostmark', colors: ['#e5e5e5', '#212529'] },
  { name: 'Cerravia', colors: ['#ef476f', '#ffd166'] },
  { name: 'Pyrhelia', colors: ['#ff6b35', '#2b2d42'] },
  { name: 'Duskmark', colors: ['#5f0f40', '#9a031e'] },
  { name: 'Ferrenza', colors: ['#2a9d8f', '#264653'] },
  { name: 'Halvane', colors: ['#a8dadc', '#457b9d'] },
];

// 10 fictional clubs. `tier` drives squad quality (1 = strongest).
/**
 * `crest` is the outline, `pattern` the field drawn inside it and `device` the
 * charge sitting on top — see `components/crest.js`. Each club gets its own
 * combination, and the device is picked to mean something about the name.
 * `founded` is flavour, shown on the club cards.
 */
export const CLUB_BLUEPRINTS = [
  { name: 'Ironvale FC',       short: 'IRV', tier: 1,  crest: 'shield',   pattern: 'stripes',  device: 'keep',       founded: 1889, ground: 'The Forge',        colors: ['#e0294a', '#1a1c22'] },
  { name: 'Solaris Athletic',  short: 'SOL', tier: 2,  crest: 'circle',   pattern: 'solid',    device: 'sun',        founded: 1902, ground: 'Helios Park',      colors: ['#ffb703', '#12263f'] },
  { name: 'Duskmoor City',     short: 'DSK', tier: 3,  crest: 'hex',      pattern: 'halves',   device: 'crescent',   founded: 1921, ground: 'Blackmoor',        colors: ['#9d4edd', '#10101a'] },
  { name: 'Verano Sporting',   short: 'VER', tier: 4,  crest: 'diamond',  pattern: 'solid',    device: 'leaf',       founded: 1934, ground: 'Estadio Verano',   colors: ['#2ec4b6', '#0b132b'] },
  { name: 'Kestrel Park',      short: 'KES', tier: 5,  crest: 'chevron',  pattern: 'solid',    device: 'bird',       founded: 1898, ground: 'Kestrel Park',     colors: ['#ff7f11', '#2f3640'] },
  { name: 'Thornbury Union',   short: 'THB', tier: 6,  crest: 'shield',   pattern: 'quarters', device: 'thorn',      founded: 1876, ground: 'Bramble Lane',     colors: ['#4f9d3a', '#d4af37'] },
  { name: 'Marisol CF',        short: 'MAR', tier: 7,  crest: 'circle',   pattern: 'hoops',    device: 'wave',       founded: 1947, ground: 'Puerto Marisol',   colors: ['#ff5c8a', '#13315c'] },
  { name: 'Aurora Nord',       short: 'AUR', tier: 8,  crest: 'triangle', pattern: 'solid',    device: 'star',       founded: 1955, ground: 'Nordlys Arena',    colors: ['#41d3ff', '#2b2d6e'] },
  { name: 'Bastion Rovers',    short: 'BAS', tier: 9,  crest: 'hex',      pattern: 'stripes',  device: 'battlement', founded: 1883, ground: 'The Rampart',      colors: ['#6c8ea4', '#c9d6df'] },
  { name: 'Calderon Zenith',   short: 'CAL', tier: 10, crest: 'diamond',  pattern: 'halves',   device: 'peak',       founded: 1968, ground: 'Cumbre Stadium',   colors: ['#ff2e88', '#150d1f'] },
];

export const LEAGUE_NAME = 'Apex Premier Division';

// position -> which stats matter, used for weighted overall + chemistry groups
export const POSITIONS = {
  GK: { group: 'GK', weights: { pace: 0.05, shooting: 0.05, passing: 0.15, dribbling: 0.10, defending: 0.35, physical: 0.30 } },
  CB: { group: 'DEF', weights: { pace: 0.10, shooting: 0.02, passing: 0.13, dribbling: 0.05, defending: 0.45, physical: 0.25 } },
  LB: { group: 'DEF', weights: { pace: 0.22, shooting: 0.05, passing: 0.20, dribbling: 0.15, defending: 0.28, physical: 0.10 } },
  RB: { group: 'DEF', weights: { pace: 0.22, shooting: 0.05, passing: 0.20, dribbling: 0.15, defending: 0.28, physical: 0.10 } },
  CDM:{ group: 'MID', weights: { pace: 0.08, shooting: 0.08, passing: 0.25, dribbling: 0.14, defending: 0.30, physical: 0.15 } },
  CM: { group: 'MID', weights: { pace: 0.12, shooting: 0.14, passing: 0.30, dribbling: 0.22, defending: 0.12, physical: 0.10 } },
  CAM:{ group: 'MID', weights: { pace: 0.14, shooting: 0.20, passing: 0.28, dribbling: 0.28, defending: 0.04, physical: 0.06 } },
  LM: { group: 'MID', weights: { pace: 0.24, shooting: 0.14, passing: 0.22, dribbling: 0.26, defending: 0.08, physical: 0.06 } },
  RM: { group: 'MID', weights: { pace: 0.24, shooting: 0.14, passing: 0.22, dribbling: 0.26, defending: 0.08, physical: 0.06 } },
  LW: { group: 'FWD', weights: { pace: 0.28, shooting: 0.22, passing: 0.16, dribbling: 0.28, defending: 0.02, physical: 0.04 } },
  RW: { group: 'FWD', weights: { pace: 0.28, shooting: 0.22, passing: 0.16, dribbling: 0.28, defending: 0.02, physical: 0.04 } },
  ST: { group: 'FWD', weights: { pace: 0.22, shooting: 0.38, passing: 0.08, dribbling: 0.18, defending: 0.01, physical: 0.13 } },
};

export const FORMATIONS = {
  '4-3-3': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'LB',  x: 15, y: 74 }, { pos: 'CB', x: 38, y: 78 }, { pos: 'CB', x: 62, y: 78 }, { pos: 'RB', x: 85, y: 74 },
    { pos: 'CM',  x: 28, y: 52 }, { pos: 'CDM', x: 50, y: 58 }, { pos: 'CM', x: 72, y: 52 },
    { pos: 'LW',  x: 18, y: 25 }, { pos: 'ST', x: 50, y: 18 }, { pos: 'RW', x: 82, y: 25 },
  ],
  '4-4-2': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'LB',  x: 15, y: 74 }, { pos: 'CB', x: 38, y: 78 }, { pos: 'CB', x: 62, y: 78 }, { pos: 'RB', x: 85, y: 74 },
    { pos: 'LM',  x: 15, y: 50 }, { pos: 'CM', x: 38, y: 54 }, { pos: 'CM', x: 62, y: 54 }, { pos: 'RM', x: 85, y: 50 },
    { pos: 'ST',  x: 36, y: 20 }, { pos: 'ST', x: 64, y: 20 },
  ],
  '4-2-3-1': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'LB',  x: 15, y: 74 }, { pos: 'CB', x: 38, y: 78 }, { pos: 'CB', x: 62, y: 78 }, { pos: 'RB', x: 85, y: 74 },
    { pos: 'CDM', x: 36, y: 60 }, { pos: 'CDM', x: 64, y: 60 },
    { pos: 'LM',  x: 16, y: 38 }, { pos: 'CAM', x: 50, y: 36 }, { pos: 'RM', x: 84, y: 38 },
    { pos: 'ST',  x: 50, y: 15 },
  ],
  '3-5-2': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'CB',  x: 26, y: 78 }, { pos: 'CB', x: 50, y: 80 }, { pos: 'CB', x: 74, y: 78 },
    { pos: 'LM',  x: 12, y: 52 }, { pos: 'CM', x: 34, y: 56 }, { pos: 'CDM', x: 50, y: 62 },
    { pos: 'CM',  x: 66, y: 56 }, { pos: 'RM', x: 88, y: 52 },
    { pos: 'ST',  x: 36, y: 20 }, { pos: 'ST', x: 64, y: 20 },
  ],
};

export const RARITY = {
  bronze:  { label: 'Bronze',  color: '#c88a4a', glow: 'rgba(200,138,74,.45)'  },
  silver:  { label: 'Silver',  color: '#b9c4d0', glow: 'rgba(185,196,208,.45)' },
  gold:    { label: 'Gold',    color: '#f4c95d', glow: 'rgba(244,201,93,.55)'  },
  special: { label: 'Special', color: '#ff2e88', glow: 'rgba(255,46,136,.65)'  },
  star:    { label: 'Star',    color: '#a06bff', glow: 'rgba(160,107,255,.7)'  },
  icon:    { label: 'Icon',    color: '#7af7ff', glow: 'rgba(122,247,255,.75)' },
};

/**
 * Icons are never derived from a rating — they are stamped on by hand in the
 * generator. A 97 turning up in the ordinary league would otherwise silently
 * become an icon, and the whole point of the tier is that there are exactly
 * eight of them in the world.
 */
export function rarityFor(overall) {
  if (overall >= 88) return 'special';
  if (overall >= 79) return 'gold';
  if (overall >= 70) return 'silver';
  return 'bronze';
}

/**
 * The eight Icons. Every one is 99 rated and unattached, and they exist only
 * in Limited Edition packs.
 *
 * These are real footballers, named at the project owner's explicit direction
 * after the alternative was offered and declined. Worth knowing what that
 * means: names and likenesses of real players are licensed property, and the
 * football games that carry them pay a great deal for the right. This is a
 * personal project, but it is publicly deployed. If a rights holder ever
 * objects, swapping this list back to invented names is a single edit here and
 * nothing else in the codebase needs to change.
 *
 * Nations carry their own flag colours rather than drawing from NATIONS, which
 * is the fictional list the rest of the world is built from.
 */
export const ICONS = [
  { name: 'Lionel Messi',      short: 'L. Messi',    position: 'RW',  nation: 'Argentina', colors: ['#75aadb', '#ffffff'], trait: 'flair' },
  { name: 'Cristiano Ronaldo', short: 'C. Ronaldo',  position: 'ST',  nation: 'Portugal',  colors: ['#da291c', '#046a38'], trait: 'power' },
  { name: 'Neymar Jr',         short: 'Neymar Jr',   position: 'LW',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'flair' },
  { name: 'Diego Maradona',    short: 'D. Maradona', position: 'CAM', nation: 'Argentina', colors: ['#75aadb', '#ffffff'], trait: 'flair' },
  { name: 'Zinedine Zidane',   short: 'Z. Zidane',   position: 'CM',  nation: 'France',    colors: ['#0055a4', '#ef4135'], trait: 'engine' },
  { name: 'Lothar Matthaus',   short: 'L. Matthaus', position: 'CDM', nation: 'Germany',   colors: ['#000000', '#dd0000'], trait: 'engine' },
  { name: 'Paolo Maldini',     short: 'P. Maldini',  position: 'CB',  nation: 'Italy',     colors: ['#0064aa', '#ffffff'], trait: 'wall' },
  { name: 'Gianluigi Buffon',  short: 'G. Buffon',   position: 'GK',  nation: 'Italy',     colors: ['#0064aa', '#ffffff'], trait: 'keeper' },
  // `added` marks everything appended after the first eight. It exists purely
  // so the generator can hand these ids out after the Stars below, leaving the
  // original twenty named cards pointing at the same players they always did.
  { name: 'Roberto Carlos',    short: 'R. Carlos',   position: 'LB',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'fullback', added: true },
  { name: 'Cafu',              short: 'Cafu',        position: 'RB',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'fullback', added: true },
  { name: 'Ryan Giggs',        short: 'R. Giggs',    position: 'LM',  nation: 'Wales',     colors: ['#c8102e', '#00b140'], trait: 'flair',    added: true },
  { name: 'David Beckham',     short: 'D. Beckham',  position: 'RM',  nation: 'England',   colors: ['#ffffff', '#ce1124'], trait: 'engine',   added: true },
  // A 4-3-3 asks for two centre-backs and two central midfielders, and 4-4-2
  // for two strikers, so one Icon per position still could not field an Icon
  // XI. These three are the duplicates that close it.
  { name: 'Franz Beckenbauer', short: 'F. Beckenbauer', position: 'CB', nation: 'Germany', colors: ['#000000', '#dd0000'], trait: 'wall',   added: true },
  { name: 'Xavi Hernandez',    short: 'Xavi',        position: 'CM',  nation: 'Spain',     colors: ['#c60b1e', '#ffc400'], trait: 'engine',   added: true },
  { name: 'Ronaldo Nazario',   short: 'R. Nazario',  position: 'ST',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'power',    added: true },
];

/**
 * The Stars: twelve current players at 92, one tier below the Icons and the
 * whole point of the cheaper Limited pack, which guarantees one of them.
 *
 * Real names, same decision and the same caveats as the Icons above — see the
 * note there. Twelve of them across every line, so the guarantee is worth
 * having whatever hole is left in a squad.
 */
export const STARS = [
  { name: 'Lamine Yamal',    short: 'L. Yamal',    position: 'RW',  nation: 'Spain',       colors: ['#c60b1e', '#ffc400'], trait: 'flair' },
  { name: 'Raphinha',        short: 'Raphinha',    position: 'LW',  nation: 'Brazil',      colors: ['#009c3b', '#ffdf00'], trait: 'flair' },
  { name: 'Vinicius Jr',     short: 'Vinicius Jr', position: 'LW',  nation: 'Brazil',      colors: ['#009c3b', '#ffdf00'], trait: 'flair' },
  { name: 'Kylian Mbappe',   short: 'K. Mbappe',   position: 'ST',  nation: 'France',      colors: ['#0055a4', '#ef4135'], trait: 'power' },
  { name: 'Erling Haaland',  short: 'E. Haaland',  position: 'ST',  nation: 'Norway',      colors: ['#ba0c2f', '#00205b'], trait: 'power' },
  { name: 'Jude Bellingham', short: 'J. Bellingham', position: 'CM', nation: 'England',    colors: ['#ffffff', '#ce1124'], trait: 'engine' },
  { name: 'Kevin De Bruyne', short: 'K. De Bruyne', position: 'CAM', nation: 'Belgium',    colors: ['#000000', '#fdda24'], trait: 'engine' },
  { name: 'Federico Valverde', short: 'F. Valverde', position: 'CM', nation: 'Uruguay',    colors: ['#0038a8', '#ffffff'], trait: 'engine' },
  { name: 'Rodri',           short: 'Rodri',       position: 'CDM', nation: 'Spain',       colors: ['#c60b1e', '#ffc400'], trait: 'wall' },
  { name: 'Virgil van Dijk', short: 'V. van Dijk', position: 'CB',  nation: 'Netherlands', colors: ['#ae1c28', '#21468b'], trait: 'wall' },
  { name: 'Achraf Hakimi',   short: 'A. Hakimi',   position: 'RB',  nation: 'Morocco',     colors: ['#c1272d', '#006233'], trait: 'engine' },
  { name: 'Alisson',         short: 'Alisson',     position: 'GK',  nation: 'Brazil',      colors: ['#009c3b', '#ffdf00'], trait: 'keeper' },
  // appended after the originals — see the note on ICONS
  { name: 'Alphonso Davies', short: 'A. Davies',   position: 'LB',  nation: 'Canada',      colors: ['#ff0000', '#ffffff'], trait: 'fullback', added: true },
  { name: 'Jeremy Doku',     short: 'J. Doku',     position: 'LM',  nation: 'Belgium',     colors: ['#000000', '#fdda24'], trait: 'flair',    added: true },
  { name: 'Bukayo Saka',     short: 'B. Saka',     position: 'RM',  nation: 'England',     colors: ['#ffffff', '#ce1124'], trait: 'flair',    added: true },
  { name: 'William Saliba',  short: 'W. Saliba',   position: 'CB',  nation: 'France',      colors: ['#0055a4', '#ef4135'], trait: 'wall',     added: true },
  { name: 'Declan Rice',     short: 'D. Rice',     position: 'CDM', nation: 'England',     colors: ['#ffffff', '#ce1124'], trait: 'wall',     added: true },
  { name: 'Mohamed Salah',   short: 'M. Salah',    position: 'RW',  nation: 'Egypt',       colors: ['#c8102e', '#ffffff'], trait: 'power',    added: true },
  { name: 'Harry Kane',      short: 'H. Kane',     position: 'ST',  nation: 'England',     colors: ['#ffffff', '#ce1124'], trait: 'power',    added: true },
  { name: 'Gianluigi Donnarumma', short: 'G. Donnarumma', position: 'GK', nation: 'Italy', colors: ['#0064aa', '#ffffff'], trait: 'keeper',   added: true },
];

/** Star radars — the same shapes as the Icons, a rung down. */
export const STAR_TRAITS = {
  flair:  { pace: 94, shooting: 86, passing: 84, dribbling: 94, defending: 38, physical: 72 },
  power:  { pace: 93, shooting: 93, passing: 76, dribbling: 87, defending: 40, physical: 88 },
  engine: { pace: 84, shooting: 84, passing: 92, dribbling: 88, defending: 74, physical: 84 },
  wall:   { pace: 78, shooting: 56, passing: 80, dribbling: 68, defending: 92, physical: 91 },
  keeper:   { pace: 62, shooting: 38, passing: 82, dribbling: 56, defending: 92, physical: 90 },
  fullback: { pace: 93, shooting: 72, passing: 86, dribbling: 86, defending: 88, physical: 84 },
};

/** What an icon is best at. Every icon is 99 overall; these shape the radar. */
export const ICON_TRAITS = {
  flair:  { pace: 99, shooting: 92, passing: 91, dribbling: 99, defending: 42, physical: 78 },
  power:  { pace: 94, shooting: 99, passing: 82, dribbling: 92, defending: 45, physical: 93 },
  engine: { pace: 88, shooting: 88, passing: 99, dribbling: 94, defending: 78, physical: 88 },
  wall:   { pace: 84, shooting: 62, passing: 84, dribbling: 74, defending: 99, physical: 97 },
  keeper:   { pace: 68, shooting: 42, passing: 88, dribbling: 62, defending: 99, physical: 95 },
  fullback: { pace: 99, shooting: 84, passing: 93, dribbling: 92, defending: 92, physical: 90 },
};
