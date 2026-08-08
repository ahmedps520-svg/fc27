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
};

export function rarityFor(overall) {
  if (overall >= 88) return 'special';
  if (overall >= 79) return 'gold';
  if (overall >= 70) return 'silver';
  return 'bronze';
}
