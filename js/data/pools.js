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
  /* The Meridian League — the second division of the world, added in v68.
   * Ten more clubs with their own kits and grounds; their squads are dealt
   * from the real players who were unattached until then (see generator.js),
   * so nobody's card changed, only where some of them play. */
  { name: 'Harbourlight FC',   short: 'HBL', tier: 1,  crest: 'shield',   pattern: 'hoops',    device: 'wave',       founded: 1893, ground: 'The Lantern',      colors: ['#00b4d8', '#03203c'], league: 'Meridian League' },
  { name: 'Redcliffe Athletic', short: 'RDC', tier: 2,  crest: 'circle',   pattern: 'stripes',  device: 'keep',       founded: 1908, ground: 'Cliffside Park',   colors: ['#d62828', '#f1f1f1'], league: 'Meridian League' },
  { name: 'Ashgrove Wanderers', short: 'ASH', tier: 3,  crest: 'hex',      pattern: 'solid',    device: 'leaf',       founded: 1911, ground: 'Grove Road',       colors: ['#2a9d8f', '#1b1b1e'], league: 'Meridian League' },
  { name: 'Saltmarsh Town',    short: 'SLT', tier: 4,  crest: 'diamond',  pattern: 'quarters', device: 'bird',       founded: 1926, ground: 'Marsh Lane',       colors: ['#e9c46a', '#264653'], league: 'Meridian League' },
  { name: 'Vireo Sporting',    short: 'VIR', tier: 5,  crest: 'chevron',  pattern: 'halves',   device: 'star',       founded: 1949, ground: 'Estadio Vireo',    colors: ['#8ac926', '#101820'], league: 'Meridian League' },
  { name: 'Coldwater United',  short: 'CWU', tier: 6,  crest: 'shield',   pattern: 'solid',    device: 'crescent',   founded: 1881, ground: 'The Weir',         colors: ['#a2d2ff', '#1d3557'], league: 'Meridian League' },
  { name: 'Ember Vale',        short: 'EMB', tier: 7,  crest: 'triangle', pattern: 'stripes',  device: 'sun',        founded: 1932, ground: 'Kiln Field',       colors: ['#f77f00', '#3d0c02'], league: 'Meridian League' },
  { name: 'Greywick Rangers',  short: 'GRW', tier: 8,  crest: 'circle',   pattern: 'quarters', device: 'battlement', founded: 1874, ground: 'Wick Green',       colors: ['#adb5bd', '#212529'], league: 'Meridian League' },
  { name: 'Lumen City',        short: 'LUM', tier: 9,  crest: 'hex',      pattern: 'hoops',    device: 'peak',       founded: 1961, ground: 'Lumen Dome',       colors: ['#ffd166', '#5a189a'], league: 'Meridian League' },
  { name: 'Serrano Nova',      short: 'SRN', tier: 10, crest: 'diamond',  pattern: 'stripes',  device: 'thorn',      founded: 1977, ground: 'Campo Nova',       colors: ['#ef476f', '#073b4c'], league: 'Meridian League' },
  /* The Vanguard League (third division) and the Foundation League (fourth),
   * added in v70 to make the world 40 clubs across four divisions with
   * promotion and relegation between them. Their squads are new cards on
   * their own seeded stream (see generator.js), named from the third wave of
   * real players; nothing that existed before v70 moves. `wave: 3` is how the
   * generator tells them apart from the Meridian clubs, whose squads were
   * dealt from the free pool. */
  { name: 'Halden Steel',      short: 'HAL', tier: 1,  crest: 'shield',   pattern: 'stripes',  device: 'keep',       founded: 1899, ground: 'Steelworks Park',  colors: ['#8d99ae', '#2b2d42'], league: 'Vanguard League', wave: 3 },
  { name: 'Corvina Rovers',    short: 'COR', tier: 2,  crest: 'circle',   pattern: 'hoops',    device: 'bird',       founded: 1912, ground: 'Corvina Field',    colors: ['#1b263b', '#e0e1dd'], league: 'Vanguard League', wave: 3 },
  { name: 'Brightwater Town',  short: 'BWT', tier: 3,  crest: 'hex',      pattern: 'halves',   device: 'wave',       founded: 1904, ground: 'Riverside',        colors: ['#48cae4', '#023e8a'], league: 'Vanguard League', wave: 3 },
  { name: 'Oakhurst United',   short: 'OAK', tier: 4,  crest: 'diamond',  pattern: 'solid',    device: 'leaf',       founded: 1887, ground: 'The Acorn',        colors: ['#6a994e', '#386641'], league: 'Vanguard League', wave: 3 },
  { name: 'Tidemark FC',       short: 'TDM', tier: 5,  crest: 'chevron',  pattern: 'quarters', device: 'crescent',   founded: 1931, ground: 'Harbour Ground',   colors: ['#0077b6', '#caf0f8'], league: 'Vanguard League', wave: 3 },
  { name: 'Pinecrest Athletic', short: 'PIN', tier: 6,  crest: 'shield',   pattern: 'hoops',    device: 'peak',       founded: 1920, ground: 'Summit Road',      colors: ['#2d6a4f', '#d8f3dc'], league: 'Vanguard League', wave: 3 },
  { name: 'Ravenshaw City',    short: 'RVS', tier: 7,  crest: 'triangle', pattern: 'stripes',  device: 'bird',       founded: 1896, ground: 'Shaw Lane',        colors: ['#212529', '#ffd60a'], league: 'Vanguard League', wave: 3 },
  { name: 'Sable Cross',       short: 'SBC', tier: 8,  crest: 'circle',   pattern: 'quarters', device: 'star',       founded: 1953, ground: 'Cross Park',       colors: ['#ff9f1c', '#011627'], league: 'Vanguard League', wave: 3 },
  { name: 'Windmere Sporting', short: 'WND', tier: 9,  crest: 'hex',      pattern: 'solid',    device: 'sun',        founded: 1964, ground: 'Estadio Windmere', colors: ['#c77dff', '#10002b'], league: 'Vanguard League', wave: 3 },
  { name: 'Quarry Bank',       short: 'QRY', tier: 10, crest: 'diamond',  pattern: 'halves',   device: 'battlement', founded: 1878, ground: 'The Quarry',       colors: ['#bc6c25', '#283618'], league: 'Vanguard League', wave: 3 },
  { name: 'Larkspur FC',       short: 'LRK', tier: 1,  crest: 'circle',   pattern: 'stripes',  device: 'leaf',       founded: 1909, ground: 'Meadow Lane',      colors: ['#7b2cbf', '#e0aaff'], league: 'Foundation League', wave: 3 },
  { name: 'Ironbridge Town',   short: 'IRB', tier: 2,  crest: 'shield',   pattern: 'solid',    device: 'keep',       founded: 1884, ground: 'Bridge Street',    colors: ['#9a031e', '#fb8b24'], league: 'Foundation League', wave: 3 },
  { name: 'Stonefield Wanderers', short: 'STF', tier: 3, crest: 'hex',    pattern: 'hoops',    device: 'battlement', founded: 1891, ground: 'Stonefield',       colors: ['#adb5bd', '#343a40'], league: 'Foundation League', wave: 3 },
  { name: 'Marlow Vale',       short: 'MLW', tier: 4,  crest: 'diamond',  pattern: 'quarters', device: 'wave',       founded: 1927, ground: 'Vale Park',        colors: ['#00afb9', '#f07167'], league: 'Foundation League', wave: 3 },
  { name: 'Heathcote Rangers', short: 'HTC', tier: 5,  crest: 'chevron',  pattern: 'stripes',  device: 'thorn',      founded: 1902, ground: 'Heath Road',       colors: ['#e63946', '#f1faee'], league: 'Foundation League', wave: 3 },
  { name: 'Fenwick Albion',    short: 'FEN', tier: 6,  crest: 'shield',   pattern: 'halves',   device: 'crescent',   founded: 1919, ground: 'Fen Lane',         colors: ['#f4a261', '#264653'], league: 'Foundation League', wave: 3 },
  { name: 'Dunmore Celtic',    short: 'DUN', tier: 7,  crest: 'circle',   pattern: 'hoops',    device: 'star',       founded: 1888, ground: 'Dunmore Park',     colors: ['#40916c', '#ffffff'], league: 'Foundation League', wave: 3 },
  { name: 'Silverlake City',   short: 'SLK', tier: 8,  crest: 'triangle', pattern: 'solid',    device: 'sun',        founded: 1958, ground: 'Lakeside Arena',   colors: ['#dee2e6', '#4361ee'], league: 'Foundation League', wave: 3 },
  { name: 'Crossgate Athletic', short: 'CRG', tier: 9, crest: 'hex',      pattern: 'stripes',  device: 'peak',       founded: 1936, ground: 'Gate Ground',      colors: ['#ffb703', '#023047'], league: 'Foundation League', wave: 3 },
  { name: 'Ashby Colliery',    short: 'ASB', tier: 10, crest: 'diamond',  pattern: 'solid',    device: 'keep',       founded: 1871, ground: 'Colliery Row',     colors: ['#3d405b', '#f2cc8f'], league: 'Foundation League', wave: 3 },
  /* The Pioneer League (fifth) and the Grassroots League (sixth), v71:
   * sixty clubs, six divisions. Generated on their own stream after the
   * v70 cards, named from the fourth wave. `wave: 4`. */
  { name: 'Northbridge FC',    short: 'NTH', tier: 1,  crest: 'shield',   pattern: 'stripes',  device: 'keep',       founded: 1894, ground: 'Bridge Park',      colors: ['#1d4ed8', '#f8fafc'], league: 'Pioneer League', wave: 4 },
  { name: 'Wexcombe Town',     short: 'WEX', tier: 2,  crest: 'circle',   pattern: 'hoops',    device: 'leaf',       founded: 1903, ground: 'Combe Lane',       colors: ['#16a34a', '#052e16'], league: 'Pioneer League', wave: 4 },
  { name: 'Estuary Athletic',  short: 'EST', tier: 3,  crest: 'hex',      pattern: 'halves',   device: 'wave',       founded: 1911, ground: 'The Mudflats',     colors: ['#0ea5e9', '#0c1a2a'], league: 'Pioneer League', wave: 4 },
  { name: 'Kingsmere United',  short: 'KGM', tier: 4,  crest: 'diamond',  pattern: 'solid',    device: 'crescent',   founded: 1889, ground: 'Mere Road',        colors: ['#a21caf', '#fdf4ff'], league: 'Pioneer League', wave: 4 },
  { name: 'Fallowfield Rovers', short: 'FAL', tier: 5, crest: 'chevron',  pattern: 'quarters', device: 'bird',       founded: 1922, ground: 'Fallow Ground',    colors: ['#ca8a04', '#1c1917'], league: 'Pioneer League', wave: 4 },
  { name: 'Ironwood City',     short: 'IWD', tier: 6,  crest: 'shield',   pattern: 'hoops',    device: 'thorn',      founded: 1898, ground: 'Ironwood Park',    colors: ['#57534e', '#f97316'], league: 'Pioneer League', wave: 4 },
  { name: 'Seabrook Wanderers', short: 'SEA', tier: 7, crest: 'triangle', pattern: 'stripes',  device: 'sun',        founded: 1931, ground: 'Brook Field',      colors: ['#f43f5e', '#fff1f2'], league: 'Pioneer League', wave: 4 },
  { name: 'Alder Heath',       short: 'ALD', tier: 8,  crest: 'circle',   pattern: 'quarters', device: 'star',       founded: 1957, ground: 'Heath Park',       colors: ['#65a30d', '#1a2e05'], league: 'Pioneer League', wave: 4 },
  { name: 'Moorgate Sporting', short: 'MGT', tier: 9,  crest: 'hex',      pattern: 'solid',    device: 'peak',       founded: 1966, ground: 'Estadio Moorgate', colors: ['#7c3aed', '#faf5ff'], league: 'Pioneer League', wave: 4 },
  { name: 'Ashwell Colts',     short: 'AWC', tier: 10, crest: 'diamond',  pattern: 'halves',   device: 'battlement', founded: 1880, ground: 'The Paddock',      colors: ['#b45309', '#fef3c7'], league: 'Pioneer League', wave: 4 },
  { name: 'Riverton Albion',   short: 'RVT', tier: 1,  crest: 'circle',   pattern: 'stripes',  device: 'wave',       founded: 1907, ground: 'Riverton Ground',  colors: ['#0369a1', '#e0f2fe'], league: 'Grassroots League', wave: 4 },
  { name: 'Hollowmere FC',     short: 'HLM', tier: 2,  crest: 'shield',   pattern: 'solid',    device: 'crescent',   founded: 1886, ground: 'Hollow Lane',      colors: ['#334155', '#cbd5e1'], league: 'Grassroots League', wave: 4 },
  { name: 'Barrowgate Town',   short: 'BGT', tier: 3,  crest: 'hex',      pattern: 'hoops',    device: 'keep',       founded: 1892, ground: 'Barrow Park',      colors: ['#dc2626', '#fef2f2'], league: 'Grassroots League', wave: 4 },
  { name: 'Copperfield United', short: 'CPF', tier: 4, crest: 'diamond',  pattern: 'quarters', device: 'sun',        founded: 1929, ground: 'Copper Row',       colors: ['#d97706', '#292524'], league: 'Grassroots League', wave: 4 },
  { name: 'Thistlewood Rangers', short: 'THS', tier: 5, crest: 'chevron', pattern: 'stripes',  device: 'thorn',      founded: 1904, ground: 'Thistle Lane',     colors: ['#7e22ce', '#fde68a'], league: 'Grassroots League', wave: 4 },
  { name: 'Greenacre Albion',  short: 'GRA', tier: 6,  crest: 'shield',   pattern: 'halves',   device: 'leaf',       founded: 1917, ground: 'Acre Field',       colors: ['#15803d', '#dcfce7'], league: 'Grassroots League', wave: 4 },
  { name: 'Saltire Celtic',    short: 'SLC', tier: 7,  crest: 'circle',   pattern: 'hoops',    device: 'star',       founded: 1890, ground: 'Saltire Park',     colors: ['#1e3a8a', '#ffffff'], league: 'Grassroots League', wave: 4 },
  { name: 'Pebblebrook City',  short: 'PBB', tier: 8,  crest: 'triangle', pattern: 'solid',    device: 'wave',       founded: 1961, ground: 'Brookside Arena',  colors: ['#0f766e', '#ccfbf1'], league: 'Grassroots League', wave: 4 },
  { name: 'Cinderford Athletic', short: 'CIN', tier: 9, crest: 'hex',     pattern: 'stripes',  device: 'peak',       founded: 1938, ground: 'Cinder Ground',    colors: ['#f59e0b', '#1c1917'], league: 'Grassroots League', wave: 4 },
  { name: 'Hawkridge Colliery', short: 'HWK', tier: 10, crest: 'diamond', pattern: 'solid',    device: 'bird',       founded: 1873, ground: 'Hawk Row',         colors: ['#1f2937', '#fbbf24'], league: 'Grassroots League', wave: 4 },
  /* v72: the hundred-club world. Forty more clubs — two into each of the
   * first six divisions and the whole of the Highland (7th) and Lowland
   * (8th) Leagues, so the divisions are 12, 12, 12, 12, 13, 13, 13, 13.
   * `division` is explicit here (the league name alone no longer says it);
   * `wave: 5`. Generated on their own stream, named from the fifth wave. */
  { name: 'Vantage City', short: 'VAN', tier: 3, crest: 'shield', pattern: 'stripes', device: 'peak', founded: 1901, ground: 'Vantage Arena', colors: ['#0f172a', '#38bdf8'], league: 'Apex Premier Division', division: 1, wave: 5 },
  { name: 'Corsair Athletic', short: 'CSR', tier: 5, crest: 'circle', pattern: 'halves', device: 'wave', founded: 1896, ground: 'The Harbourside', colors: ['#7f1d1d', '#fde68a'], league: 'Apex Premier Division', division: 1, wave: 5 },
  { name: 'Ridgeway Rovers', short: 'RDG', tier: 4, crest: 'hex', pattern: 'hoops', device: 'peak', founded: 1908, ground: 'Ridgeway Park', colors: ['#065f46', '#a7f3d0'], league: 'Meridian League', division: 2, wave: 5 },
  { name: 'Stellar FC', short: 'STL', tier: 6, crest: 'triangle', pattern: 'solid', device: 'star', founded: 1953, ground: 'Stellar Dome', colors: ['#312e81', '#c7d2fe'], league: 'Meridian League', division: 2, wave: 5 },
  { name: 'Brookhaven United', short: 'BRH', tier: 3, crest: 'shield', pattern: 'quarters', device: 'leaf', founded: 1897, ground: 'Haven Road', colors: ['#1d4ed8', '#fef3c7'], league: 'Vanguard League', division: 3, wave: 5 },
  { name: 'Pennywell Town', short: 'PNW', tier: 7, crest: 'diamond', pattern: 'stripes', device: 'keep', founded: 1885, ground: 'Penny Lane', colors: ['#78350f', '#fde68a'], league: 'Vanguard League', division: 3, wave: 5 },
  { name: 'Holloway Rangers', short: 'HOL', tier: 4, crest: 'circle', pattern: 'stripes', device: 'battlement', founded: 1890, ground: 'Holloway Ground', colors: ['#4c1d95', '#f5f3ff'], league: 'Foundation League', division: 4, wave: 5 },
  { name: 'Duneside FC', short: 'DUN', tier: 8, crest: 'chevron', pattern: 'halves', device: 'sun', founded: 1934, ground: 'Dune Park', colors: ['#b45309', '#fff7ed'], league: 'Foundation League', division: 4, wave: 5 },
  { name: 'Lakeshore City', short: 'LKS', tier: 2, crest: 'hex', pattern: 'solid', device: 'wave', founded: 1912, ground: 'Lakeshore Stadium', colors: ['#0e7490', '#ecfeff'], league: 'Pioneer League', division: 5, wave: 5 },
  { name: 'Ferncliffe Athletic', short: 'FRN', tier: 6, crest: 'shield', pattern: 'hoops', device: 'thorn', founded: 1899, ground: 'Cliff Road', colors: ['#166534', '#dcfce7'], league: 'Pioneer League', division: 5, wave: 5 },
  { name: 'Kingswood Wanderers', short: 'KGW', tier: 9, crest: 'diamond', pattern: 'quarters', device: 'keep', founded: 1888, ground: 'Kings Field', colors: ['#1e3a8a', '#fbbf24'], league: 'Pioneer League', division: 5, wave: 5 },
  { name: 'Norbury Town', short: 'NRB', tier: 3, crest: 'circle', pattern: 'halves', device: 'crescent', founded: 1905, ground: 'Norbury Park', colors: ['#9f1239', '#fecdd3'], league: 'Grassroots League', division: 6, wave: 5 },
  { name: 'Eastmoor Colts', short: 'EMC', tier: 7, crest: 'triangle', pattern: 'stripes', device: 'bird', founded: 1961, ground: 'The Moor', colors: ['#0f766e', '#99f6e4'], league: 'Grassroots League', division: 6, wave: 5 },
  { name: 'Redbrook FC', short: 'RDB', tier: 10, crest: 'hex', pattern: 'solid', device: 'wave', founded: 1922, ground: 'Brook Lane', colors: ['#b91c1c', '#fee2e2'], league: 'Grassroots League', division: 6, wave: 5 },
  { name: 'Ashford Vale', short: 'ASV', tier: 1, crest: 'shield', pattern: 'stripes', device: 'leaf', founded: 1894, ground: 'Vale Ground', colors: ['#15803d', '#f0fdf4'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Bramford Albion', short: 'BRF', tier: 2, crest: 'circle', pattern: 'hoops', device: 'keep', founded: 1887, ground: 'Bramford Road', colors: ['#1e40af', '#dbeafe'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Crestwood Town', short: 'CRW', tier: 3, crest: 'hex', pattern: 'halves', device: 'peak', founded: 1910, ground: 'Crest Park', colors: ['#7c2d12', '#fed7aa'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Elmstead Rovers', short: 'ELM', tier: 4, crest: 'diamond', pattern: 'solid', device: 'thorn', founded: 1902, ground: 'Elm Lane', colors: ['#3f6212', '#ecfccb'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Foxhollow United', short: 'FOX', tier: 5, crest: 'chevron', pattern: 'quarters', device: 'bird', founded: 1926, ground: 'Hollow Field', colors: ['#c2410c', '#ffedd5'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Glenmere Athletic', short: 'GLM', tier: 6, crest: 'shield', pattern: 'hoops', device: 'wave', founded: 1898, ground: 'Glen Road', colors: ['#0c4a6e', '#e0f2fe'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Harlow Green', short: 'HRG', tier: 7, crest: 'triangle', pattern: 'stripes', device: 'leaf', founded: 1931, ground: 'Green Lane', colors: ['#166534', '#bbf7d0'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Ironhurst Colliery', short: 'IRH', tier: 8, crest: 'circle', pattern: 'solid', device: 'battlement', founded: 1876, ground: 'Hurst Row', colors: ['#292524', '#f5f5f4'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Juniper Town', short: 'JUN', tier: 9, crest: 'hex', pattern: 'halves', device: 'sun', founded: 1948, ground: 'Juniper Park', colors: ['#5b21b6', '#ede9fe'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Kettlewell FC', short: 'KTW', tier: 10, crest: 'diamond', pattern: 'stripes', device: 'crescent', founded: 1907, ground: 'Kettle Ground', colors: ['#0369a1', '#f0f9ff'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Langford City', short: 'LNG', tier: 11, crest: 'shield', pattern: 'quarters', device: 'star', founded: 1919, ground: 'Langford Road', colors: ['#be123c', '#ffe4e6'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Marlow Heath', short: 'MLH', tier: 12, crest: 'circle', pattern: 'hoops', device: 'peak', founded: 1883, ground: 'Heath Lane', colors: ['#4d7c0f', '#f7fee7'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Nettleby Rangers', short: 'NTL', tier: 13, crest: 'hex', pattern: 'solid', device: 'keep', founded: 1895, ground: 'Nettle Park', colors: ['#1f2937', '#fbbf24'], league: 'Highland League', division: 7, wave: 5 },
  { name: 'Oakridge Albion', short: 'OKR', tier: 1, crest: 'shield', pattern: 'stripes', device: 'leaf', founded: 1900, ground: 'Oakridge Ground', colors: ['#14532d', '#dcfce7'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Pemberton FC', short: 'PMB', tier: 2, crest: 'circle', pattern: 'halves', device: 'keep', founded: 1889, ground: 'Pember Lane', colors: ['#7f1d1d', '#fecaca'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Quarry Vale', short: 'QRV', tier: 3, crest: 'hex', pattern: 'hoops', device: 'battlement', founded: 1912, ground: 'The Vale', colors: ['#44403c', '#e7e5e4'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Rosemont United', short: 'RSM', tier: 4, crest: 'diamond', pattern: 'solid', device: 'sun', founded: 1933, ground: 'Rosemont Park', colors: ['#be185d', '#fce7f3'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Silverdale Town', short: 'SVD', tier: 5, crest: 'chevron', pattern: 'quarters', device: 'wave', founded: 1904, ground: 'Dale Road', colors: ['#075985', '#e0f2fe'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Thornfield FC', short: 'THF', tier: 6, crest: 'shield', pattern: 'stripes', device: 'thorn', founded: 1896, ground: 'Thorn Park', colors: ['#3730a3', '#e0e7ff'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Underhill Rovers', short: 'UDH', tier: 7, crest: 'triangle', pattern: 'hoops', device: 'peak', founded: 1921, ground: 'Underhill', colors: ['#9a3412', '#ffedd5'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Vale Royal', short: 'VLR', tier: 8, crest: 'circle', pattern: 'solid', device: 'crescent', founded: 1947, ground: 'Royal Field', colors: ['#6d28d9', '#f5f3ff'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Westbrook City', short: 'WBK', tier: 9, crest: 'hex', pattern: 'halves', device: 'star', founded: 1929, ground: 'Westbrook Lane', colors: ['#0d9488', '#ccfbf1'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Yewtree Athletic', short: 'YEW', tier: 10, crest: 'diamond', pattern: 'stripes', device: 'leaf', founded: 1886, ground: 'Yew Lane', colors: ['#365314', '#ecfccb'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Zealand Park', short: 'ZLP', tier: 11, crest: 'shield', pattern: 'hoops', device: 'bird', founded: 1955, ground: 'Zealand Ground', colors: ['#1e3a8a', '#dbeafe'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Amberley Colts', short: 'AMB', tier: 12, crest: 'circle', pattern: 'quarters', device: 'sun', founded: 1963, ground: 'Amber Park', colors: ['#d97706', '#fffbeb'], league: 'Lowland League', division: 8, wave: 5 },
  { name: 'Blackfen Wanderers', short: 'BFN', tier: 13, crest: 'hex', pattern: 'stripes', device: 'keep', founded: 1891, ground: 'Fen Road', colors: ['#111827', '#f9fafb'], league: 'Lowland League', division: 8, wave: 5 },
];

export const LEAGUE_NAME = 'Apex Premier Division';
/** The four divisions of the world, top first. Index + 1 is the division number. */
export const LEAGUES = [LEAGUE_NAME, 'Meridian League', 'Vanguard League', 'Foundation League', 'Pioneer League', 'Grassroots League', 'Highland League', 'Lowland League'];

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
  { name: 'Lionel Messi',      short: 'L. Messi',    position: 'RW',  nation: 'Argentina', colors: ['#75aadb', '#ffffff'], trait: 'flair', foot: 'L' },
  { name: 'Cristiano Ronaldo', short: 'C. Ronaldo',  position: 'ST',  nation: 'Portugal',  colors: ['#da291c', '#046a38'], trait: 'power', foot: 'R' },
  { name: 'Neymar Jr',         short: 'Neymar Jr',   position: 'LW',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'flair', foot: 'R' },
  { name: 'Diego Maradona',    short: 'D. Maradona', position: 'CAM', nation: 'Argentina', colors: ['#75aadb', '#ffffff'], trait: 'flair', foot: 'L' },
  { name: 'Zinedine Zidane',   short: 'Z. Zidane',   position: 'CM',  nation: 'France',    colors: ['#0055a4', '#ef4135'], trait: 'engine', foot: 'R' },
  { name: 'Lothar Matthaus',   short: 'L. Matthaus', position: 'CDM', nation: 'Germany',   colors: ['#000000', '#dd0000'], trait: 'engine', foot: 'R' },
  { name: 'Paolo Maldini',     short: 'P. Maldini',  position: 'CB',  nation: 'Italy',     colors: ['#0064aa', '#ffffff'], trait: 'wall', foot: 'R' },
  { name: 'Gianluigi Buffon',  short: 'G. Buffon',   position: 'GK',  nation: 'Italy',     colors: ['#0064aa', '#ffffff'], trait: 'keeper', foot: 'R' },
  // `added` marks everything appended after the first eight. It exists purely
  // so the generator can hand these ids out after the Stars below, leaving the
  // original twenty named cards pointing at the same players they always did.
  { name: 'Roberto Carlos',    short: 'R. Carlos',   position: 'LB',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'fullback', foot: 'L', added: true },
  { name: 'Cafu',              short: 'Cafu',        position: 'RB',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'fullback', foot: 'R', added: true },
  { name: 'Ryan Giggs',        short: 'R. Giggs',    position: 'LM',  nation: 'Wales',     colors: ['#c8102e', '#00b140'], trait: 'flair', foot: 'L',    added: true },
  { name: 'David Beckham',     short: 'D. Beckham',  position: 'RM',  nation: 'England',   colors: ['#ffffff', '#ce1124'], trait: 'engine', foot: 'R',   added: true },
  // A 4-3-3 asks for two centre-backs and two central midfielders, and 4-4-2
  // for two strikers, so one Icon per position still could not field an Icon
  // XI. These three are the duplicates that close it.
  { name: 'Franz Beckenbauer', short: 'F. Beckenbauer', position: 'CB', nation: 'Germany', colors: ['#000000', '#dd0000'], trait: 'wall', foot: 'R',   added: true },
  { name: 'Xavi Hernandez',    short: 'Xavi',        position: 'CM',  nation: 'Spain',     colors: ['#c60b1e', '#ffc400'], trait: 'engine', foot: 'R',   added: true },
  { name: 'Ronaldo Nazario',   short: 'R. Nazario',  position: 'ST',  nation: 'Brazil',    colors: ['#009c3b', '#ffdf00'], trait: 'power', foot: 'R',    added: true },
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
  { name: 'Lamine Yamal',    short: 'L. Yamal',    position: 'RW',  nation: 'Spain',       colors: ['#c60b1e', '#ffc400'], trait: 'flair', foot: 'L' },
  { name: 'Raphinha',        short: 'Raphinha',    position: 'LW',  nation: 'Brazil',      colors: ['#009c3b', '#ffdf00'], trait: 'flair', foot: 'R' },
  { name: 'Vinicius Jr',     short: 'Vinicius Jr', position: 'LW',  nation: 'Brazil',      colors: ['#009c3b', '#ffdf00'], trait: 'flair', foot: 'R' },
  { name: 'Kylian Mbappe',   short: 'K. Mbappe',   position: 'ST',  nation: 'France',      colors: ['#0055a4', '#ef4135'], trait: 'power', foot: 'R' },
  { name: 'Erling Haaland',  short: 'E. Haaland',  position: 'ST',  nation: 'Norway',      colors: ['#ba0c2f', '#00205b'], trait: 'power', foot: 'L' },
  { name: 'Jude Bellingham', short: 'J. Bellingham', position: 'CM', nation: 'England',    colors: ['#ffffff', '#ce1124'], trait: 'engine', foot: 'R' },
  { name: 'Kevin De Bruyne', short: 'K. De Bruyne', position: 'CAM', nation: 'Belgium',    colors: ['#000000', '#fdda24'], trait: 'engine', foot: 'R' },
  { name: 'Federico Valverde', short: 'F. Valverde', position: 'CM', nation: 'Uruguay',    colors: ['#0038a8', '#ffffff'], trait: 'engine', foot: 'R' },
  { name: 'Rodri',           short: 'Rodri',       position: 'CDM', nation: 'Spain',       colors: ['#c60b1e', '#ffc400'], trait: 'wall', foot: 'R' },
  { name: 'Virgil van Dijk', short: 'V. van Dijk', position: 'CB',  nation: 'Netherlands', colors: ['#ae1c28', '#21468b'], trait: 'wall', foot: 'R' },
  { name: 'Achraf Hakimi',   short: 'A. Hakimi',   position: 'RB',  nation: 'Morocco',     colors: ['#c1272d', '#006233'], trait: 'engine', foot: 'R' },
  { name: 'Alisson',         short: 'Alisson',     position: 'GK',  nation: 'Brazil',      colors: ['#009c3b', '#ffdf00'], trait: 'keeper', foot: 'R' },
  // appended after the originals — see the note on ICONS
  { name: 'Alphonso Davies', short: 'A. Davies',   position: 'LB',  nation: 'Canada',      colors: ['#ff0000', '#ffffff'], trait: 'fullback', foot: 'L', added: true },
  { name: 'Jeremy Doku',     short: 'J. Doku',     position: 'LM',  nation: 'Belgium',     colors: ['#000000', '#fdda24'], trait: 'flair', foot: 'R',    added: true },
  { name: 'Bukayo Saka',     short: 'B. Saka',     position: 'RM',  nation: 'England',     colors: ['#ffffff', '#ce1124'], trait: 'flair', foot: 'L',    added: true },
  { name: 'William Saliba',  short: 'W. Saliba',   position: 'CB',  nation: 'France',      colors: ['#0055a4', '#ef4135'], trait: 'wall', foot: 'R',     added: true },
  { name: 'Declan Rice',     short: 'D. Rice',     position: 'CDM', nation: 'England',     colors: ['#ffffff', '#ce1124'], trait: 'wall', foot: 'R',     added: true },
  { name: 'Mohamed Salah',   short: 'M. Salah',    position: 'RW',  nation: 'Egypt',       colors: ['#c8102e', '#ffffff'], trait: 'power', foot: 'L',    added: true },
  { name: 'Harry Kane',      short: 'H. Kane',     position: 'ST',  nation: 'England',     colors: ['#ffffff', '#ce1124'], trait: 'power', foot: 'R',    added: true },
  { name: 'Gianluigi Donnarumma', short: 'G. Donnarumma', position: 'GK', nation: 'Italy', colors: ['#0064aa', '#ffffff'], trait: 'keeper', foot: 'R',   added: true },
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
