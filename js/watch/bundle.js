(() => {
  // js/data/pools.js
  var FIRST_NAMES = [
    "Kael",
    "Dario",
    "Emrik",
    "Tobin",
    "Rafe",
    "Nilo",
    "Casian",
    "Odran",
    "Silas",
    "Mateus",
    "Ivo",
    "Renzo",
    "Arlo",
    "Zane",
    "Fabien",
    "Marek",
    "Lukan",
    "Teodor",
    "Anselm",
    "Bram",
    "Corin",
    "Dax",
    "Elian",
    "Ferro",
    "Gustav",
    "Halvar",
    "Ikaro",
    "Jorin",
    "Kiran",
    "Leonel",
    "Milo",
    "Nero",
    "Osric",
    "Pavel",
    "Quillon",
    "Rowan",
    "Soren",
    "Tamir",
    "Ulric",
    "Varro",
    "Wendel",
    "Xandro",
    "Yannic",
    "Zoran",
    "Aldric",
    "Benno",
    "Cyrel",
    "Dorian",
    "Evrin",
    "Florin",
    "Gideon",
    "Hektor",
    "Ilias",
    "Joric",
    "Kasper",
    "Lyron",
    "Mattis",
    "Nevin",
    "Orin",
    "Priam",
    "Rune",
    "Stellan",
    "Tavian",
    "Ansel",
    "Brayon",
    "Ciro",
    "Delmar",
    "Eryk",
    "Fenn",
    "Garrik"
  ], LAST_NAMES = [
    "Vance",
    "Halloran",
    "Voskuil",
    "Marren",
    "Delgadio",
    "Brekker",
    "Ostrand",
    "Fenwick",
    "Calloway",
    "Rethen",
    "Amory",
    "Bexley",
    "Corvain",
    "Drayton",
    "Esparro",
    "Falkner",
    "Grimald",
    "Harkness",
    "Ivarsen",
    "Jansdal",
    "Krauss",
    "Lindqvist",
    "Morrow",
    "Norquist",
    "Oakhart",
    "Pellegrin",
    "Quill",
    "Ravnhorst",
    "Stavros",
    "Thorne",
    "Ulrich",
    "Vantol",
    "Wexler",
    "Yaros",
    "Zabala",
    "Ashcombe",
    "Brannigan",
    "Castellan",
    "Dunmore",
    "Ellwood",
    "Fontaine",
    "Garrow",
    "Hensley",
    "Iverlund",
    "Jorgen",
    "Kessler",
    "Larrion",
    "Mendova",
    "Nystrom",
    "Orvieto",
    "Palladin",
    "Rennick",
    "Sable",
    "Torvald",
    "Ubiali",
    "Verhagen",
    "Wilder",
    "Ystad",
    "Zoric",
    "Alvarine",
    "Brimwood",
    "Carrow",
    "Dagsen",
    "Everly",
    "Fyodrin",
    "Galvain",
    "Hollis",
    "Ivorin",
    "Jarrow",
    "Kolvane",
    "Merrow",
    "Nordahl",
    "Ovaris",
    "Prewitt",
    "Rask",
    "Sunderin",
    "Tessaro",
    "Valmont",
    "Wraye",
    "Zellick"
  ], NATIONS = [
    { name: "Valoria", colors: ["#e63946", "#1d3557"] },
    { name: "Norlund", colors: ["#4cc9f0", "#f8f9fa"] },
    { name: "Astravia", colors: ["#ffd166", "#073b4c"] },
    { name: "Cotania", colors: ["#06d6a0", "#1b2a41"] },
    { name: "Meridia", colors: ["#f77f00", "#003049"] },
    { name: "Sunhaven", colors: ["#fcbf49", "#d62828"] },
    { name: "Kaldoria", colors: ["#8ecae6", "#023047"] },
    { name: "Tervia", colors: ["#b5179e", "#3a0ca3"] },
    { name: "Bramoor", colors: ["#588157", "#dad7cd"] },
    { name: "Zephyria", colors: ["#7209b7", "#4cc9f0"] },
    { name: "Ostmark", colors: ["#e5e5e5", "#212529"] },
    { name: "Cerravia", colors: ["#ef476f", "#ffd166"] },
    { name: "Pyrhelia", colors: ["#ff6b35", "#2b2d42"] },
    { name: "Duskmark", colors: ["#5f0f40", "#9a031e"] },
    { name: "Ferrenza", colors: ["#2a9d8f", "#264653"] },
    { name: "Halvane", colors: ["#a8dadc", "#457b9d"] }
  ], CLUB_BLUEPRINTS = [
    { name: "Ironvale FC", short: "IRV", tier: 1, crest: "shield", pattern: "stripes", device: "keep", founded: 1889, ground: "The Forge", colors: ["#e0294a", "#1a1c22"] },
    { name: "Solaris Athletic", short: "SOL", tier: 2, crest: "circle", pattern: "solid", device: "sun", founded: 1902, ground: "Helios Park", colors: ["#ffb703", "#12263f"] },
    { name: "Duskmoor City", short: "DSK", tier: 3, crest: "hex", pattern: "halves", device: "crescent", founded: 1921, ground: "Blackmoor", colors: ["#9d4edd", "#10101a"] },
    { name: "Verano Sporting", short: "VER", tier: 4, crest: "diamond", pattern: "solid", device: "leaf", founded: 1934, ground: "Estadio Verano", colors: ["#2ec4b6", "#0b132b"] },
    { name: "Kestrel Park", short: "KES", tier: 5, crest: "chevron", pattern: "solid", device: "bird", founded: 1898, ground: "Kestrel Park", colors: ["#ff7f11", "#2f3640"] },
    { name: "Thornbury Union", short: "THB", tier: 6, crest: "shield", pattern: "quarters", device: "thorn", founded: 1876, ground: "Bramble Lane", colors: ["#4f9d3a", "#d4af37"] },
    { name: "Marisol CF", short: "MAR", tier: 7, crest: "circle", pattern: "hoops", device: "wave", founded: 1947, ground: "Puerto Marisol", colors: ["#ff5c8a", "#13315c"] },
    { name: "Aurora Nord", short: "AUR", tier: 8, crest: "triangle", pattern: "solid", device: "star", founded: 1955, ground: "Nordlys Arena", colors: ["#41d3ff", "#2b2d6e"] },
    { name: "Bastion Rovers", short: "BAS", tier: 9, crest: "hex", pattern: "stripes", device: "battlement", founded: 1883, ground: "The Rampart", colors: ["#6c8ea4", "#c9d6df"] },
    { name: "Calderon Zenith", short: "CAL", tier: 10, crest: "diamond", pattern: "halves", device: "peak", founded: 1968, ground: "Cumbre Stadium", colors: ["#ff2e88", "#150d1f"] },
    /* The Meridian League — the second division of the world, added in v68.
     * Ten more clubs with their own kits and grounds; their squads are dealt
     * from the real players who were unattached until then (see generator.js),
     * so nobody's card changed, only where some of them play. */
    { name: "Harbourlight FC", short: "HBL", tier: 1, crest: "shield", pattern: "hoops", device: "wave", founded: 1893, ground: "The Lantern", colors: ["#00b4d8", "#03203c"], league: "Meridian League" },
    { name: "Redcliffe Athletic", short: "RDC", tier: 2, crest: "circle", pattern: "stripes", device: "keep", founded: 1908, ground: "Cliffside Park", colors: ["#d62828", "#f1f1f1"], league: "Meridian League" },
    { name: "Ashgrove Wanderers", short: "ASH", tier: 3, crest: "hex", pattern: "solid", device: "leaf", founded: 1911, ground: "Grove Road", colors: ["#2a9d8f", "#1b1b1e"], league: "Meridian League" },
    { name: "Saltmarsh Town", short: "SLT", tier: 4, crest: "diamond", pattern: "quarters", device: "bird", founded: 1926, ground: "Marsh Lane", colors: ["#e9c46a", "#264653"], league: "Meridian League" },
    { name: "Vireo Sporting", short: "VIR", tier: 5, crest: "chevron", pattern: "halves", device: "star", founded: 1949, ground: "Estadio Vireo", colors: ["#8ac926", "#101820"], league: "Meridian League" },
    { name: "Coldwater United", short: "CWU", tier: 6, crest: "shield", pattern: "solid", device: "crescent", founded: 1881, ground: "The Weir", colors: ["#a2d2ff", "#1d3557"], league: "Meridian League" },
    { name: "Ember Vale", short: "EMB", tier: 7, crest: "triangle", pattern: "stripes", device: "sun", founded: 1932, ground: "Kiln Field", colors: ["#f77f00", "#3d0c02"], league: "Meridian League" },
    { name: "Greywick Rangers", short: "GRW", tier: 8, crest: "circle", pattern: "quarters", device: "battlement", founded: 1874, ground: "Wick Green", colors: ["#adb5bd", "#212529"], league: "Meridian League" },
    { name: "Lumen City", short: "LUM", tier: 9, crest: "hex", pattern: "hoops", device: "peak", founded: 1961, ground: "Lumen Dome", colors: ["#ffd166", "#5a189a"], league: "Meridian League" },
    { name: "Serrano Nova", short: "SRN", tier: 10, crest: "diamond", pattern: "stripes", device: "thorn", founded: 1977, ground: "Campo Nova", colors: ["#ef476f", "#073b4c"], league: "Meridian League" },
    /* The Vanguard League (third division) and the Foundation League (fourth),
     * added in v70 to make the world 40 clubs across four divisions with
     * promotion and relegation between them. Their squads are new cards on
     * their own seeded stream (see generator.js), named from the third wave of
     * real players; nothing that existed before v70 moves. `wave: 3` is how the
     * generator tells them apart from the Meridian clubs, whose squads were
     * dealt from the free pool. */
    { name: "Halden Steel", short: "HAL", tier: 1, crest: "shield", pattern: "stripes", device: "keep", founded: 1899, ground: "Steelworks Park", colors: ["#8d99ae", "#2b2d42"], league: "Vanguard League", wave: 3 },
    { name: "Corvina Rovers", short: "COR", tier: 2, crest: "circle", pattern: "hoops", device: "bird", founded: 1912, ground: "Corvina Field", colors: ["#1b263b", "#e0e1dd"], league: "Vanguard League", wave: 3 },
    { name: "Brightwater Town", short: "BWT", tier: 3, crest: "hex", pattern: "halves", device: "wave", founded: 1904, ground: "Riverside", colors: ["#48cae4", "#023e8a"], league: "Vanguard League", wave: 3 },
    { name: "Oakhurst United", short: "OAK", tier: 4, crest: "diamond", pattern: "solid", device: "leaf", founded: 1887, ground: "The Acorn", colors: ["#6a994e", "#386641"], league: "Vanguard League", wave: 3 },
    { name: "Tidemark FC", short: "TDM", tier: 5, crest: "chevron", pattern: "quarters", device: "crescent", founded: 1931, ground: "Harbour Ground", colors: ["#0077b6", "#caf0f8"], league: "Vanguard League", wave: 3 },
    { name: "Pinecrest Athletic", short: "PIN", tier: 6, crest: "shield", pattern: "hoops", device: "peak", founded: 1920, ground: "Summit Road", colors: ["#2d6a4f", "#d8f3dc"], league: "Vanguard League", wave: 3 },
    { name: "Ravenshaw City", short: "RVS", tier: 7, crest: "triangle", pattern: "stripes", device: "bird", founded: 1896, ground: "Shaw Lane", colors: ["#212529", "#ffd60a"], league: "Vanguard League", wave: 3 },
    { name: "Sable Cross", short: "SBC", tier: 8, crest: "circle", pattern: "quarters", device: "star", founded: 1953, ground: "Cross Park", colors: ["#ff9f1c", "#011627"], league: "Vanguard League", wave: 3 },
    { name: "Windmere Sporting", short: "WND", tier: 9, crest: "hex", pattern: "solid", device: "sun", founded: 1964, ground: "Estadio Windmere", colors: ["#c77dff", "#10002b"], league: "Vanguard League", wave: 3 },
    { name: "Quarry Bank", short: "QRY", tier: 10, crest: "diamond", pattern: "halves", device: "battlement", founded: 1878, ground: "The Quarry", colors: ["#bc6c25", "#283618"], league: "Vanguard League", wave: 3 },
    { name: "Larkspur FC", short: "LRK", tier: 1, crest: "circle", pattern: "stripes", device: "leaf", founded: 1909, ground: "Meadow Lane", colors: ["#7b2cbf", "#e0aaff"], league: "Foundation League", wave: 3 },
    { name: "Ironbridge Town", short: "IRB", tier: 2, crest: "shield", pattern: "solid", device: "keep", founded: 1884, ground: "Bridge Street", colors: ["#9a031e", "#fb8b24"], league: "Foundation League", wave: 3 },
    { name: "Stonefield Wanderers", short: "STF", tier: 3, crest: "hex", pattern: "hoops", device: "battlement", founded: 1891, ground: "Stonefield", colors: ["#adb5bd", "#343a40"], league: "Foundation League", wave: 3 },
    { name: "Marlow Vale", short: "MLW", tier: 4, crest: "diamond", pattern: "quarters", device: "wave", founded: 1927, ground: "Vale Park", colors: ["#00afb9", "#f07167"], league: "Foundation League", wave: 3 },
    { name: "Heathcote Rangers", short: "HTC", tier: 5, crest: "chevron", pattern: "stripes", device: "thorn", founded: 1902, ground: "Heath Road", colors: ["#e63946", "#f1faee"], league: "Foundation League", wave: 3 },
    { name: "Fenwick Albion", short: "FEN", tier: 6, crest: "shield", pattern: "halves", device: "crescent", founded: 1919, ground: "Fen Lane", colors: ["#f4a261", "#264653"], league: "Foundation League", wave: 3 },
    { name: "Dunmore Celtic", short: "DUN", tier: 7, crest: "circle", pattern: "hoops", device: "star", founded: 1888, ground: "Dunmore Park", colors: ["#40916c", "#ffffff"], league: "Foundation League", wave: 3 },
    { name: "Silverlake City", short: "SLK", tier: 8, crest: "triangle", pattern: "solid", device: "sun", founded: 1958, ground: "Lakeside Arena", colors: ["#dee2e6", "#4361ee"], league: "Foundation League", wave: 3 },
    { name: "Crossgate Athletic", short: "CRG", tier: 9, crest: "hex", pattern: "stripes", device: "peak", founded: 1936, ground: "Gate Ground", colors: ["#ffb703", "#023047"], league: "Foundation League", wave: 3 },
    { name: "Ashby Colliery", short: "ASB", tier: 10, crest: "diamond", pattern: "solid", device: "keep", founded: 1871, ground: "Colliery Row", colors: ["#3d405b", "#f2cc8f"], league: "Foundation League", wave: 3 },
    /* The Pioneer League (fifth) and the Grassroots League (sixth), v71:
     * sixty clubs, six divisions. Generated on their own stream after the
     * v70 cards, named from the fourth wave. `wave: 4`. */
    { name: "Northbridge FC", short: "NTH", tier: 1, crest: "shield", pattern: "stripes", device: "keep", founded: 1894, ground: "Bridge Park", colors: ["#1d4ed8", "#f8fafc"], league: "Pioneer League", wave: 4 },
    { name: "Wexcombe Town", short: "WEX", tier: 2, crest: "circle", pattern: "hoops", device: "leaf", founded: 1903, ground: "Combe Lane", colors: ["#16a34a", "#052e16"], league: "Pioneer League", wave: 4 },
    { name: "Estuary Athletic", short: "EST", tier: 3, crest: "hex", pattern: "halves", device: "wave", founded: 1911, ground: "The Mudflats", colors: ["#0ea5e9", "#0c1a2a"], league: "Pioneer League", wave: 4 },
    { name: "Kingsmere United", short: "KGM", tier: 4, crest: "diamond", pattern: "solid", device: "crescent", founded: 1889, ground: "Mere Road", colors: ["#a21caf", "#fdf4ff"], league: "Pioneer League", wave: 4 },
    { name: "Fallowfield Rovers", short: "FAL", tier: 5, crest: "chevron", pattern: "quarters", device: "bird", founded: 1922, ground: "Fallow Ground", colors: ["#ca8a04", "#1c1917"], league: "Pioneer League", wave: 4 },
    { name: "Ironwood City", short: "IWD", tier: 6, crest: "shield", pattern: "hoops", device: "thorn", founded: 1898, ground: "Ironwood Park", colors: ["#57534e", "#f97316"], league: "Pioneer League", wave: 4 },
    { name: "Seabrook Wanderers", short: "SEA", tier: 7, crest: "triangle", pattern: "stripes", device: "sun", founded: 1931, ground: "Brook Field", colors: ["#f43f5e", "#fff1f2"], league: "Pioneer League", wave: 4 },
    { name: "Alder Heath", short: "ALD", tier: 8, crest: "circle", pattern: "quarters", device: "star", founded: 1957, ground: "Heath Park", colors: ["#65a30d", "#1a2e05"], league: "Pioneer League", wave: 4 },
    { name: "Moorgate Sporting", short: "MGT", tier: 9, crest: "hex", pattern: "solid", device: "peak", founded: 1966, ground: "Estadio Moorgate", colors: ["#7c3aed", "#faf5ff"], league: "Pioneer League", wave: 4 },
    { name: "Ashwell Colts", short: "AWC", tier: 10, crest: "diamond", pattern: "halves", device: "battlement", founded: 1880, ground: "The Paddock", colors: ["#b45309", "#fef3c7"], league: "Pioneer League", wave: 4 },
    { name: "Riverton Albion", short: "RVT", tier: 1, crest: "circle", pattern: "stripes", device: "wave", founded: 1907, ground: "Riverton Ground", colors: ["#0369a1", "#e0f2fe"], league: "Grassroots League", wave: 4 },
    { name: "Hollowmere FC", short: "HLM", tier: 2, crest: "shield", pattern: "solid", device: "crescent", founded: 1886, ground: "Hollow Lane", colors: ["#334155", "#cbd5e1"], league: "Grassroots League", wave: 4 },
    { name: "Barrowgate Town", short: "BGT", tier: 3, crest: "hex", pattern: "hoops", device: "keep", founded: 1892, ground: "Barrow Park", colors: ["#dc2626", "#fef2f2"], league: "Grassroots League", wave: 4 },
    { name: "Copperfield United", short: "CPF", tier: 4, crest: "diamond", pattern: "quarters", device: "sun", founded: 1929, ground: "Copper Row", colors: ["#d97706", "#292524"], league: "Grassroots League", wave: 4 },
    { name: "Thistlewood Rangers", short: "THS", tier: 5, crest: "chevron", pattern: "stripes", device: "thorn", founded: 1904, ground: "Thistle Lane", colors: ["#7e22ce", "#fde68a"], league: "Grassroots League", wave: 4 },
    { name: "Greenacre Albion", short: "GRA", tier: 6, crest: "shield", pattern: "halves", device: "leaf", founded: 1917, ground: "Acre Field", colors: ["#15803d", "#dcfce7"], league: "Grassroots League", wave: 4 },
    { name: "Saltire Celtic", short: "SLC", tier: 7, crest: "circle", pattern: "hoops", device: "star", founded: 1890, ground: "Saltire Park", colors: ["#1e3a8a", "#ffffff"], league: "Grassroots League", wave: 4 },
    { name: "Pebblebrook City", short: "PBB", tier: 8, crest: "triangle", pattern: "solid", device: "wave", founded: 1961, ground: "Brookside Arena", colors: ["#0f766e", "#ccfbf1"], league: "Grassroots League", wave: 4 },
    { name: "Cinderford Athletic", short: "CIN", tier: 9, crest: "hex", pattern: "stripes", device: "peak", founded: 1938, ground: "Cinder Ground", colors: ["#f59e0b", "#1c1917"], league: "Grassroots League", wave: 4 },
    { name: "Hawkridge Colliery", short: "HWK", tier: 10, crest: "diamond", pattern: "solid", device: "bird", founded: 1873, ground: "Hawk Row", colors: ["#1f2937", "#fbbf24"], league: "Grassroots League", wave: 4 }
  ], LEAGUE_NAME = "Apex Premier Division", LEAGUES = [LEAGUE_NAME, "Meridian League", "Vanguard League", "Foundation League", "Pioneer League", "Grassroots League"], POSITIONS = {
    GK: { group: "GK", weights: { pace: 0.05, shooting: 0.05, passing: 0.15, dribbling: 0.1, defending: 0.35, physical: 0.3 } },
    CB: { group: "DEF", weights: { pace: 0.1, shooting: 0.02, passing: 0.13, dribbling: 0.05, defending: 0.45, physical: 0.25 } },
    LB: { group: "DEF", weights: { pace: 0.22, shooting: 0.05, passing: 0.2, dribbling: 0.15, defending: 0.28, physical: 0.1 } },
    RB: { group: "DEF", weights: { pace: 0.22, shooting: 0.05, passing: 0.2, dribbling: 0.15, defending: 0.28, physical: 0.1 } },
    CDM: { group: "MID", weights: { pace: 0.08, shooting: 0.08, passing: 0.25, dribbling: 0.14, defending: 0.3, physical: 0.15 } },
    CM: { group: "MID", weights: { pace: 0.12, shooting: 0.14, passing: 0.3, dribbling: 0.22, defending: 0.12, physical: 0.1 } },
    CAM: { group: "MID", weights: { pace: 0.14, shooting: 0.2, passing: 0.28, dribbling: 0.28, defending: 0.04, physical: 0.06 } },
    LM: { group: "MID", weights: { pace: 0.24, shooting: 0.14, passing: 0.22, dribbling: 0.26, defending: 0.08, physical: 0.06 } },
    RM: { group: "MID", weights: { pace: 0.24, shooting: 0.14, passing: 0.22, dribbling: 0.26, defending: 0.08, physical: 0.06 } },
    LW: { group: "FWD", weights: { pace: 0.28, shooting: 0.22, passing: 0.16, dribbling: 0.28, defending: 0.02, physical: 0.04 } },
    RW: { group: "FWD", weights: { pace: 0.28, shooting: 0.22, passing: 0.16, dribbling: 0.28, defending: 0.02, physical: 0.04 } },
    ST: { group: "FWD", weights: { pace: 0.22, shooting: 0.38, passing: 0.08, dribbling: 0.18, defending: 0.01, physical: 0.13 } }
  };
  var RARITY = {
    bronze: { label: "Bronze", color: "#c88a4a", glow: "rgba(200,138,74,.45)" },
    silver: { label: "Silver", color: "#b9c4d0", glow: "rgba(185,196,208,.45)" },
    gold: { label: "Gold", color: "#f4c95d", glow: "rgba(244,201,93,.55)" },
    special: { label: "Special", color: "#ff2e88", glow: "rgba(255,46,136,.65)" },
    star: { label: "Star", color: "#a06bff", glow: "rgba(160,107,255,.7)" },
    icon: { label: "Icon", color: "#7af7ff", glow: "rgba(122,247,255,.75)" }
  };
  function rarityFor(overall) {
    return overall >= 88 ? "special" : overall >= 79 ? "gold" : overall >= 70 ? "silver" : "bronze";
  }
  var ICONS = [
    { name: "Lionel Messi", short: "L. Messi", position: "RW", nation: "Argentina", colors: ["#75aadb", "#ffffff"], trait: "flair", foot: "L" },
    { name: "Cristiano Ronaldo", short: "C. Ronaldo", position: "ST", nation: "Portugal", colors: ["#da291c", "#046a38"], trait: "power", foot: "R" },
    { name: "Neymar Jr", short: "Neymar Jr", position: "LW", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "flair", foot: "R" },
    { name: "Diego Maradona", short: "D. Maradona", position: "CAM", nation: "Argentina", colors: ["#75aadb", "#ffffff"], trait: "flair", foot: "L" },
    { name: "Zinedine Zidane", short: "Z. Zidane", position: "CM", nation: "France", colors: ["#0055a4", "#ef4135"], trait: "engine", foot: "R" },
    { name: "Lothar Matthaus", short: "L. Matthaus", position: "CDM", nation: "Germany", colors: ["#000000", "#dd0000"], trait: "engine", foot: "R" },
    { name: "Paolo Maldini", short: "P. Maldini", position: "CB", nation: "Italy", colors: ["#0064aa", "#ffffff"], trait: "wall", foot: "R" },
    { name: "Gianluigi Buffon", short: "G. Buffon", position: "GK", nation: "Italy", colors: ["#0064aa", "#ffffff"], trait: "keeper", foot: "R" },
    // `added` marks everything appended after the first eight. It exists purely
    // so the generator can hand these ids out after the Stars below, leaving the
    // original twenty named cards pointing at the same players they always did.
    { name: "Roberto Carlos", short: "R. Carlos", position: "LB", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "fullback", foot: "L", added: !0 },
    { name: "Cafu", short: "Cafu", position: "RB", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "fullback", foot: "R", added: !0 },
    { name: "Ryan Giggs", short: "R. Giggs", position: "LM", nation: "Wales", colors: ["#c8102e", "#00b140"], trait: "flair", foot: "L", added: !0 },
    { name: "David Beckham", short: "D. Beckham", position: "RM", nation: "England", colors: ["#ffffff", "#ce1124"], trait: "engine", foot: "R", added: !0 },
    // A 4-3-3 asks for two centre-backs and two central midfielders, and 4-4-2
    // for two strikers, so one Icon per position still could not field an Icon
    // XI. These three are the duplicates that close it.
    { name: "Franz Beckenbauer", short: "F. Beckenbauer", position: "CB", nation: "Germany", colors: ["#000000", "#dd0000"], trait: "wall", foot: "R", added: !0 },
    { name: "Xavi Hernandez", short: "Xavi", position: "CM", nation: "Spain", colors: ["#c60b1e", "#ffc400"], trait: "engine", foot: "R", added: !0 },
    { name: "Ronaldo Nazario", short: "R. Nazario", position: "ST", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "power", foot: "R", added: !0 }
  ], STARS = [
    { name: "Lamine Yamal", short: "L. Yamal", position: "RW", nation: "Spain", colors: ["#c60b1e", "#ffc400"], trait: "flair", foot: "L" },
    { name: "Raphinha", short: "Raphinha", position: "LW", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "flair", foot: "R" },
    { name: "Vinicius Jr", short: "Vinicius Jr", position: "LW", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "flair", foot: "R" },
    { name: "Kylian Mbappe", short: "K. Mbappe", position: "ST", nation: "France", colors: ["#0055a4", "#ef4135"], trait: "power", foot: "R" },
    { name: "Erling Haaland", short: "E. Haaland", position: "ST", nation: "Norway", colors: ["#ba0c2f", "#00205b"], trait: "power", foot: "L" },
    { name: "Jude Bellingham", short: "J. Bellingham", position: "CM", nation: "England", colors: ["#ffffff", "#ce1124"], trait: "engine", foot: "R" },
    { name: "Kevin De Bruyne", short: "K. De Bruyne", position: "CAM", nation: "Belgium", colors: ["#000000", "#fdda24"], trait: "engine", foot: "R" },
    { name: "Federico Valverde", short: "F. Valverde", position: "CM", nation: "Uruguay", colors: ["#0038a8", "#ffffff"], trait: "engine", foot: "R" },
    { name: "Rodri", short: "Rodri", position: "CDM", nation: "Spain", colors: ["#c60b1e", "#ffc400"], trait: "wall", foot: "R" },
    { name: "Virgil van Dijk", short: "V. van Dijk", position: "CB", nation: "Netherlands", colors: ["#ae1c28", "#21468b"], trait: "wall", foot: "R" },
    { name: "Achraf Hakimi", short: "A. Hakimi", position: "RB", nation: "Morocco", colors: ["#c1272d", "#006233"], trait: "engine", foot: "R" },
    { name: "Alisson", short: "Alisson", position: "GK", nation: "Brazil", colors: ["#009c3b", "#ffdf00"], trait: "keeper", foot: "R" },
    // appended after the originals — see the note on ICONS
    { name: "Alphonso Davies", short: "A. Davies", position: "LB", nation: "Canada", colors: ["#ff0000", "#ffffff"], trait: "fullback", foot: "L", added: !0 },
    { name: "Jeremy Doku", short: "J. Doku", position: "LM", nation: "Belgium", colors: ["#000000", "#fdda24"], trait: "flair", foot: "R", added: !0 },
    { name: "Bukayo Saka", short: "B. Saka", position: "RM", nation: "England", colors: ["#ffffff", "#ce1124"], trait: "flair", foot: "L", added: !0 },
    { name: "William Saliba", short: "W. Saliba", position: "CB", nation: "France", colors: ["#0055a4", "#ef4135"], trait: "wall", foot: "R", added: !0 },
    { name: "Declan Rice", short: "D. Rice", position: "CDM", nation: "England", colors: ["#ffffff", "#ce1124"], trait: "wall", foot: "R", added: !0 },
    { name: "Mohamed Salah", short: "M. Salah", position: "RW", nation: "Egypt", colors: ["#c8102e", "#ffffff"], trait: "power", foot: "L", added: !0 },
    { name: "Harry Kane", short: "H. Kane", position: "ST", nation: "England", colors: ["#ffffff", "#ce1124"], trait: "power", foot: "R", added: !0 },
    { name: "Gianluigi Donnarumma", short: "G. Donnarumma", position: "GK", nation: "Italy", colors: ["#0064aa", "#ffffff"], trait: "keeper", foot: "R", added: !0 }
  ], STAR_TRAITS = {
    flair: { pace: 94, shooting: 86, passing: 84, dribbling: 94, defending: 38, physical: 72 },
    power: { pace: 93, shooting: 93, passing: 76, dribbling: 87, defending: 40, physical: 88 },
    engine: { pace: 84, shooting: 84, passing: 92, dribbling: 88, defending: 74, physical: 84 },
    wall: { pace: 78, shooting: 56, passing: 80, dribbling: 68, defending: 92, physical: 91 },
    keeper: { pace: 62, shooting: 38, passing: 82, dribbling: 56, defending: 92, physical: 90 },
    fullback: { pace: 93, shooting: 72, passing: 86, dribbling: 86, defending: 88, physical: 84 }
  }, ICON_TRAITS = {
    flair: { pace: 99, shooting: 92, passing: 91, dribbling: 99, defending: 42, physical: 78 },
    power: { pace: 94, shooting: 99, passing: 82, dribbling: 92, defending: 45, physical: 93 },
    engine: { pace: 88, shooting: 88, passing: 99, dribbling: 94, defending: 78, physical: 88 },
    wall: { pace: 84, shooting: 62, passing: 84, dribbling: 74, defending: 99, physical: 97 },
    keeper: { pace: 68, shooting: 42, passing: 88, dribbling: 62, defending: 99, physical: 95 },
    fullback: { pace: 99, shooting: 84, passing: 93, dribbling: 92, defending: 92, physical: 90 }
  };

  // js/data/realPlayers.js
  var REAL_PLAYERS = [
    ["Thibaut Courtois", "T. Courtois", "Belgium", "GK"],
    ["Andriy Lunin", "A. Lunin", "Ukraine", "GK"],
    ["Dani Carvajal", "D. Carvajal", "Spain", "RB"],
    ["Éder Militão", "É. Militão", "Brazil", "CB"],
    ["Antonio Rüdiger", "A. Rüdiger", "Germany", "CB"],
    ["David Alaba", "D. Alaba", "Austria", "CB"],
    ["Ferland Mendy", "F. Mendy", "France", "LB"],
    ["Fran García", "F. García", "Spain", "LB"],
    ["Trent Alexander-Arnold", "T. Alexander-Arnold", "England", "RB"],
    ["Aurélien Tchouaméni", "A. Tchouaméni", "France", "CDM"],
    ["Eduardo Camavinga", "E. Camavinga", "France", "CM"],
    ["Luka Modrić", "L. Modrić", "Croatia", "CM"],
    ["Dani Ceballos", "D. Ceballos", "Spain", "CM"],
    ["Arda Güler", "A. Güler", "Turkey", "CAM"],
    ["Vinícius Júnior", "V. Júnior", "Brazil", "LW"],
    ["Kylian Mbappé", "K. Mbappé", "France", "ST"],
    ["Rodrygo", "Rodrygo", "Brazil", "RW"],
    ["Brahim Díaz", "B. Díaz", "Morocco", "RW"],
    ["Endrick", "Endrick", "Brazil", "ST"],
    ["Gonzalo García", "G. García", "Spain", "ST"],
    ["Joan García", "J. García", "Spain", "GK"],
    ["Wojciech Szczęsny", "W. Szczęsny", "Poland", "GK"],
    ["Iñaki Peña", "I. Peña", "Spain", "GK"],
    ["Jules Koundé", "J. Koundé", "France", "RB"],
    ["Ronald Araújo", "R. Araújo", "Uruguay", "CB"],
    ["Pau Cubarsí", "P. Cubarsí", "Spain", "CB"],
    ["Andreas Christensen", "A. Christensen", "Denmark", "CB"],
    ["Eric García", "E. García", "Spain", "CB"],
    ["Alejandro Balde", "A. Balde", "Spain", "LB"],
    ["Gerard Martín", "G. Martín", "Spain", "LB"],
    ["Frenkie de Jong", "F. de Jong", "Netherlands", "CM"],
    ["Pedri", "Pedri", "Spain", "CM"],
    ["Fermín López", "F. López", "Spain", "CAM"],
    ["Gavi", "Gavi", "Spain", "CM"],
    ["Marc Casadó", "M. Casadó", "Spain", "CDM"],
    ["Dani Olmo", "D. Olmo", "Spain", "CAM"],
    ["Ferran Torres", "F. Torres", "Spain", "RW"],
    ["Robert Lewandowski", "R. Lewandowski", "Poland", "ST"],
    ["Marcus Rashford", "M. Rashford", "England", "LW"],
    ["Ederson", "Ederson", "Brazil", "GK"],
    ["Stefan Ortega", "S. Ortega", "Germany", "GK"],
    ["Rúben Dias", "R. Dias", "Portugal", "CB"],
    ["John Stones", "J. Stones", "England", "CB"],
    ["Nathan Aké", "N. Aké", "Netherlands", "CB"],
    ["Manuel Akanji", "M. Akanji", "Switzerland", "CB"],
    ["Joško Gvardiol", "J. Gvardiol", "Croatia", "CB"],
    ["Abdukodir Khusanov", "A. Khusanov", "Uzbekistan", "CB"],
    ["Rico Lewis", "R. Lewis", "England", "RB"],
    ["Nico O'Reilly", "N. O'Reilly", "England", "CM"],
    ["Mateo Kovačić", "M. Kovačić", "Croatia", "CM"],
    ["Bernardo Silva", "B. Silva", "Portugal", "CAM"],
    ["Phil Foden", "P. Foden", "England", "RW"],
    ["Jack Grealish", "J. Grealish", "England", "LW"],
    ["Savinho", "Savinho", "Brazil", "RW"],
    ["Omar Marmoush", "O. Marmoush", "Egypt", "ST"],
    ["Antoine Semenyo", "A. Semenyo", "Ghana", "RW"],
    ["Giorgi Mamardashvili", "G. Mamardashvili", "Georgia", "GK"],
    ["Caoimhín Kelleher", "C. Kelleher", "Ireland", "GK"],
    ["Ibrahima Konaté", "I. Konaté", "France", "CB"],
    ["Joe Gomez", "J. Gomez", "England", "CB"],
    ["Andrew Robertson", "A. Robertson", "Scotland", "LB"],
    ["Milos Kerkez", "M. Kerkez", "Hungary", "LB"],
    ["Conor Bradley", "C. Bradley", "Northern Ireland", "RB"],
    ["Jeremie Frimpong", "J. Frimpong", "Netherlands", "RB"],
    ["Ryan Gravenberch", "R. Gravenberch", "Netherlands", "CM"],
    ["Alexis Mac Allister", "A. Mac Allister", "Argentina", "CM"],
    ["Dominik Szoboszlai", "D. Szoboszlai", "Hungary", "CAM"],
    ["Wataru Endo", "W. Endo", "Japan", "CDM"],
    ["Florian Wirtz", "F. Wirtz", "Germany", "CAM"],
    ["Cody Gakpo", "C. Gakpo", "Netherlands", "LW"],
    ["Luis Díaz", "L. Díaz", "Colombia", "LW"],
    ["Darwin Núñez", "D. Núñez", "Uruguay", "ST"],
    ["Federico Chiesa", "F. Chiesa", "Italy", "RW"],
    ["Hugo Ekitiké", "H. Ekitiké", "France", "ST"],
    ["David Raya", "D. Raya", "Spain", "GK"],
    ["Kepa Arrizabalaga", "K. Arrizabalaga", "Spain", "GK"],
    ["Gabriel Magalhães", "G. Magalhães", "Brazil", "CB"],
    ["Jakub Kiwior", "J. Kiwior", "Poland", "CB"],
    ["Ben White", "B. White", "England", "RB"],
    ["Jurrien Timber", "J. Timber", "Netherlands", "RB"],
    ["Riccardo Calafiori", "R. Calafiori", "Italy", "LB"],
    ["Myles Lewis-Skelly", "M. Lewis-Skelly", "England", "LB"],
    ["Martin Ødegaard", "M. Ødegaard", "Norway", "CAM"],
    ["Thomas Partey", "T. Partey", "Ghana", "CDM"],
    ["Mikel Merino", "M. Merino", "Spain", "CM"],
    ["Gabriel Martinelli", "G. Martinelli", "Brazil", "LW"],
    ["Leandro Trossard", "L. Trossard", "Belgium", "LW"],
    ["Kai Havertz", "K. Havertz", "Germany", "ST"],
    ["Gabriel Jesus", "G. Jesus", "Brazil", "ST"],
    ["Viktor Gyökeres", "V. Gyökeres", "Sweden", "ST"],
    ["Noni Madueke", "N. Madueke", "England", "RW"],
    ["Robert Sánchez", "R. Sánchez", "Spain", "GK"],
    ["Filip Jørgensen", "F. Jørgensen", "Denmark", "GK"],
    ["Malo Gusto", "M. Gusto", "France", "RB"],
    ["Reece James", "R. James", "England", "RB"],
    ["Wesley Fofana", "W. Fofana", "France", "CB"],
    ["Trevoh Chalobah", "T. Chalobah", "England", "CB"],
    ["Levi Colwill", "L. Colwill", "England", "CB"],
    ["Benoît Badiashile", "B. Badiashile", "France", "CB"],
    ["Marc Cucurella", "M. Cucurella", "Spain", "LB"],
    ["Moisés Caicedo", "M. Caicedo", "Ecuador", "CDM"],
    ["Enzo Fernández", "E. Fernández", "Argentina", "CM"],
    ["Romeo Lavia", "R. Lavia", "Belgium", "CDM"],
    ["Cole Palmer", "C. Palmer", "England", "CAM"],
    ["João Pedro", "J. Pedro", "Brazil", "ST"],
    ["Pedro Neto", "P. Neto", "Portugal", "RW"],
    ["Jadon Sancho", "J. Sancho", "England", "LW"],
    ["Nicolas Jackson", "N. Jackson", "Senegal", "ST"],
    ["Christopher Nkunku", "C. Nkunku", "France", "CAM"],
    ["Estevão", "Estevão", "Brazil", "RW"],
    ["Liam Delap", "L. Delap", "England", "ST"],
    ["André Onana", "A. Onana", "Cameroon", "GK"],
    ["Altay Bayındır", "A. Bayındır", "Turkey", "GK"],
    ["Matthijs de Ligt", "M. de Ligt", "Netherlands", "CB"],
    ["Lisandro Martínez", "L. Martínez", "Argentina", "CB"],
    ["Harry Maguire", "H. Maguire", "England", "CB"],
    ["Leny Yoro", "L. Yoro", "France", "CB"],
    ["Noussair Mazraoui", "N. Mazraoui", "Morocco", "RB"],
    ["Diogo Dalot", "D. Dalot", "Portugal", "RB"],
    ["Luke Shaw", "L. Shaw", "England", "LB"],
    ["Patrick Dorgu", "P. Dorgu", "Denmark", "LB"],
    ["Casemiro", "Casemiro", "Brazil", "CDM"],
    ["Bruno Fernandes", "B. Fernandes", "Portugal", "CAM"],
    ["Manuel Ugarte", "M. Ugarte", "Uruguay", "CDM"],
    ["Kobbie Mainoo", "K. Mainoo", "England", "CM"],
    ["Mason Mount", "M. Mount", "England", "CAM"],
    ["Matheus Cunha", "M. Cunha", "Brazil", "ST"],
    ["Bryan Mbeumo", "B. Mbeumo", "Cameroon", "RW"],
    ["Amad Diallo", "A. Diallo", "Ivory Coast", "RW"],
    ["Rasmus Højlund", "R. Højlund", "Denmark", "ST"],
    ["Benjamin Šeško", "B. Šeško", "Slovenia", "ST"],
    ["Guglielmo Vicario", "G. Vicario", "Italy", "GK"],
    ["Antonín Kinský", "A. Kinský", "Czech Republic", "GK"],
    ["Cristian Romero", "C. Romero", "Argentina", "CB"],
    ["Micky van de Ven", "M. van de Ven", "Netherlands", "CB"],
    ["Radu Drăgușin", "R. Drăgușin", "Romania", "CB"],
    ["Pedro Porro", "P. Porro", "Spain", "RB"],
    ["Destiny Udogie", "D. Udogie", "Italy", "LB"],
    ["James Maddison", "J. Maddison", "England", "CAM"],
    ["Rodrigo Bentancur", "R. Bentancur", "Uruguay", "CM"],
    ["Pape Matar Sarr", "P. Sarr", "Senegal", "CM"],
    ["Lucas Bergvall", "L. Bergvall", "Sweden", "CM"],
    ["Dejan Kulusevski", "D. Kulusevski", "Sweden", "RW"],
    ["Brennan Johnson", "B. Johnson", "Wales", "RW"],
    ["Son Heung-min", "S. Heung-min", "South Korea", "LW"],
    ["Dominic Solanke", "D. Solanke", "England", "ST"],
    ["Mathys Tel", "M. Tel", "France", "ST"],
    ["Wilson Odobert", "W. Odobert", "France", "LW"],
    ["Mikey Moore", "M. Moore", "England", "LW"],
    ["Manuel Neuer", "M. Neuer", "Germany", "GK"],
    ["Jonas Urbig", "J. Urbig", "Germany", "GK"],
    ["Sven Ulreich", "S. Ulreich", "Germany", "GK"],
    ["Dayot Upamecano", "D. Upamecano", "France", "CB"],
    ["Kim Min-jae", "K. Min-jae", "South Korea", "CB"],
    ["Jonathan Tah", "J. Tah", "Germany", "CB"],
    ["Raphaël Guerreiro", "R. Guerreiro", "Portugal", "LB"],
    ["Konrad Laimer", "K. Laimer", "Austria", "CM"],
    ["Joshua Kimmich", "J. Kimmich", "Germany", "CDM"],
    ["Leon Goretzka", "L. Goretzka", "Germany", "CM"],
    ["Aleksandar Pavlović", "A. Pavlović", "Germany", "CDM"],
    ["Jamal Musiala", "J. Musiala", "Germany", "CAM"],
    ["Michael Olise", "M. Olise", "France", "RW"],
    ["Kingsley Coman", "K. Coman", "France", "LW"],
    ["Serge Gnabry", "S. Gnabry", "Germany", "RW"],
    ["Leroy Sané", "L. Sané", "Germany", "RW"],
    ["Thomas Müller", "T. Müller", "Germany", "CAM"],
    ["Lucas Beraldo", "L. Beraldo", "Brazil", "CB"],
    ["Marquinhos", "Marquinhos", "Brazil", "CB"],
    ["Willian Pacho", "W. Pacho", "Ecuador", "CB"],
    ["Lucas Hernández", "L. Hernández", "France", "CB"],
    ["Nuno Mendes", "N. Mendes", "Portugal", "LB"],
    ["Warren Zaïre-Emery", "W. Zaïre-Emery", "France", "CM"],
    ["Vitinha", "Vitinha", "Portugal", "CM"],
    ["João Neves", "J. Neves", "Portugal", "CM"],
    ["Fabián Ruiz", "F. Ruiz", "Spain", "CM"],
    ["Khvicha Kvaratskhelia", "K. Kvaratskhelia", "Georgia", "LW"],
    ["Bradley Barcola", "B. Barcola", "France", "LW"],
    ["Ousmane Dembélé", "O. Dembélé", "France", "RW"],
    ["Désiré Doué", "D. Doué", "France", "CAM"],
    ["Lee Kang-in", "L. Kang-in", "South Korea", "RW"],
    ["Gonçalo Ramos", "G. Ramos", "Portugal", "ST"],
    ["Randal Kolo Muani", "R. Muani", "France", "ST"],
    ["Jérémy Doku", "J. Doku", "Belgium", "LW"],
    ["Senny Mayulu", "S. Mayulu", "France", "CAM"],
    ["Michele Di Gregorio", "M. Di Gregorio", "Italy", "GK"],
    ["Mattia Perin", "M. Perin", "Italy", "GK"],
    ["Gleison Bremer", "G. Bremer", "Brazil", "CB"],
    ["Pierre Kalulu", "P. Kalulu", "France", "CB"],
    ["Federico Gatti", "F. Gatti", "Italy", "CB"],
    ["Renato Veiga", "R. Veiga", "Portugal", "CB"],
    ["Andrea Cambiaso", "A. Cambiaso", "Italy", "LB"],
    ["Nicolò Savona", "N. Savona", "Italy", "RB"],
    ["Manuel Locatelli", "M. Locatelli", "Italy", "CDM"],
    ["Khéphren Thuram", "K. Thuram", "France", "CM"],
    ["Teun Koopmeiners", "T. Koopmeiners", "Netherlands", "CM"],
    ["Douglas Luiz", "D. Luiz", "Brazil", "CM"],
    ["Kenan Yıldız", "K. Yıldız", "Turkey", "LW"],
    ["Francisco Conceição", "F. Conceição", "Portugal", "RW"],
    ["Nico González", "N. González", "Argentina", "RW"],
    ["Timothy Weah", "T. Weah", "USA", "RW"],
    ["Jonathan David", "J. David", "Canada", "ST"],
    ["Dusan Vlahović", "D. Vlahović", "Serbia", "ST"],
    ["Yann Sommer", "Y. Sommer", "Switzerland", "GK"],
    ["Yosep Martínez", "Y. Martínez", "Spain", "GK"],
    ["Alessandro Bastoni", "A. Bastoni", "Italy", "CB"],
    ["Francesco Acerbi", "F. Acerbi", "Italy", "CB"],
    ["Stefan de Vrij", "S. de Vrij", "Netherlands", "CB"],
    ["Benjamin Pavard", "B. Pavard", "France", "CB"],
    ["Denzel Dumfries", "D. Dumfries", "Netherlands", "RB"],
    ["Federico Dimarco", "F. Dimarco", "Italy", "LB"],
    ["Nicola Zalewski", "N. Zalewski", "Poland", "LB"],
    ["Hakan Çalhanoğlu", "H. Çalhanoğlu", "Turkey", "CM"],
    ["Nicolò Barella", "N. Barella", "Italy", "CM"],
    ["Henrikh Mkhitaryan", "H. Mkhitaryan", "Armenia", "CM"],
    ["Piotr Zieliński", "P. Zieliński", "Poland", "CM"],
    ["Davide Frattesi", "D. Frattesi", "Italy", "CM"],
    ["Kristjan Asllani", "K. Asllani", "Albania", "CDM"],
    ["Lautaro Martínez", "L. Martínez", "Argentina", "ST"],
    ["Marcus Thuram", "M. Thuram", "France", "ST"],
    ["Mehdi Taremi", "M. Taremi", "Iran", "ST"],
    ["Luis Henrique", "L. Henrique", "Brazil", "RW"],
    ["Mike Maignan", "M. Maignan", "France", "GK"],
    ["Marco Sportiello", "M. Sportiello", "Italy", "GK"],
    ["Fikayo Tomori", "F. Tomori", "England", "CB"],
    ["Matteo Gabbia", "M. Gabbia", "Italy", "CB"],
    ["Strahinja Pavlović", "S. Pavlović", "Serbia", "CB"],
    ["Malick Thiaw", "M. Thiaw", "Germany", "CB"],
    ["Theo Hernández", "T. Hernández", "France", "LB"],
    ["Kyle Walker", "K. Walker", "England", "RB"],
    ["Davide Bartesaghi", "D. Bartesaghi", "Italy", "LB"],
    ["Youssouf Fofana", "Y. Fofana", "France", "CDM"],
    ["Tijjani Reijnders", "T. Reijnders", "Netherlands", "CM"],
    ["Ruben Loftus-Cheek", "R. Loftus-Cheek", "England", "CM"],
    ["Christian Pulisic", "C. Pulisic", "USA", "RW"],
    ["Rafael Leão", "R. Leão", "Portugal", "LW"],
    ["Samuel Chukwueze", "S. Chukwueze", "Nigeria", "RW"],
    ["Luka Jović", "L. Jović", "Serbia", "ST"],
    ["Santiago Giménez", "S. Giménez", "Mexico", "ST"],
    ["Álvaro Morata", "Á. Morata", "Spain", "ST"],
    ["João Félix", "J. Félix", "Portugal", "CAM"],
    ["Jan Oblak", "J. Oblak", "Slovenia", "GK"],
    ["Juan Musso", "J. Musso", "Argentina", "GK"],
    ["José María Giménez", "J. Giménez", "Uruguay", "CB"],
    ["Robin Le Normand", "R. Le Normand", "Spain", "CB"],
    ["Clément Lenglet", "C. Lenglet", "France", "CB"],
    ["Nahuel Molina", "N. Molina", "Argentina", "RB"],
    ["Marcos Llorente", "M. Llorente", "Spain", "RB"],
    ["Reinildo Mandava", "R. Mandava", "Mozambique", "LB"],
    ["Rodrigo De Paul", "R. De Paul", "Argentina", "CM"],
    ["Conor Gallagher", "C. Gallagher", "England", "CM"],
    ["Koke", "Koke", "Spain", "CM"],
    ["Pablo Barrios", "P. Barrios", "Spain", "CM"],
    ["Julián Álvarez", "J. Álvarez", "Argentina", "ST"],
    ["Antoine Griezmann", "A. Griezmann", "France", "ST"],
    ["Alexander Sørloth", "A. Sørloth", "Norway", "ST"],
    ["Ángel Correa", "Á. Correa", "Argentina", "RW"],
    ["Giuliano Simeone", "G. Simeone", "Argentina", "RW"],
    ["Thiago Almada", "T. Almada", "Argentina", "CAM"],
    ["Alex Meret", "A. Meret", "Italy", "GK"],
    ["Vanja Milinković-Savić", "V. Milinković-Savić", "Serbia", "GK"],
    ["Alessandro Buongiorno", "A. Buongiorno", "Italy", "CB"],
    ["Amir Rrahmani", "A. Rrahmani", "Kosovo", "CB"],
    ["Giovanni Di Lorenzo", "G. Di Lorenzo", "Italy", "RB"],
    ["Mathías Olivera", "M. Olivera", "Uruguay", "LB"],
    ["Scott McTominay", "S. McTominay", "Scotland", "CM"],
    ["Stanislav Lobotka", "S. Lobotka", "Slovakia", "CDM"],
    ["Billy Gilmour", "B. Gilmour", "Scotland", "CM"],
    ["Frank Anguissa", "F. Anguissa", "Cameroon", "CM"],
    ["Matteo Politano", "M. Politano", "Italy", "RW"],
    ["David Neres", "D. Neres", "Brazil", "LW"],
    ["Noa Lang", "N. Lang", "Netherlands", "LW"],
    ["Romelu Lukaku", "R. Lukaku", "Belgium", "ST"],
    ["Lukáš Hrádecký", "L. Hrádecký", "Finland", "GK"],
    ["Matej Kovář", "M. Kovář", "Czech Republic", "GK"],
    ["Edmond Tapsoba", "E. Tapsoba", "Burkina Faso", "CB"],
    ["Piero Hincapié", "P. Hincapié", "Ecuador", "CB"],
    ["Alejandro Grimaldo", "A. Grimaldo", "Spain", "LB"],
    ["Arthur", "Arthur", "Brazil", "RB"],
    ["Granite Xhaka", "G. Xhaka", "Switzerland", "CM"],
    ["Robert Andrich", "R. Andrich", "Germany", "CDM"],
    ["Exequiel Palacios", "E. Palacios", "Argentina", "CM"],
    ["Aleix García", "A. García", "Spain", "CM"],
    ["Jonas Hofmann", "J. Hofmann", "Germany", "RW"],
    ["Nathan Tella", "N. Tella", "Nigeria", "RW"],
    ["Amine Adli", "A. Adli", "Morocco", "LW"],
    ["Patrik Schick", "P. Schick", "Czech Republic", "ST"],
    ["Victor Boniface", "V. Boniface", "Nigeria", "ST"],
    ["Marco Carnesecchi", "M. Carnesecchi", "Italy", "GK"],
    ["Rui Patrício", "R. Patrício", "Portugal", "GK"],
    ["Isak Hien", "I. Hien", "Sweden", "CB"],
    ["Berat Djimsiti", "B. Djimsiti", "Albania", "CB"],
    ["Odilon Kossounou", "O. Kossounou", "Ivory Coast", "CB"],
    ["Sead Kolašinac", "S. Kolašinac", "Bosnia and Herzegovina", "CB"],
    ["Davide Zappacosta", "D. Zappacosta", "Italy", "RB"],
    ["Raoul Bellanova", "R. Bellanova", "Italy", "RB"],
    ["Marten de Roon", "M. de Roon", "Netherlands", "CM"],
    ["Éderson", "Éderson", "Brazil", "CM"],
    ["Mario Pašalić", "M. Pašalić", "Croatia", "CAM"],
    ["Charles De Ketelaere", "C. De Ketelaere", "Belgium", "CAM"],
    ["Ademola Lookman", "A. Lookman", "Nigeria", "LW"],
    ["Nicolò Zaniolo", "N. Zaniolo", "Italy", "RW"],
    ["Lazar Samardžić", "L. Samardžić", "Serbia", "CAM"],
    ["Gianluca Scamacca", "G. Scamacca", "Italy", "ST"],
    ["Mateo Retegui", "M. Retegui", "Italy", "ST"],
    ["Yassine Bounou", "Y. Bounou", "Morocco", "GK"],
    ["Edouard Mendy", "E. Mendy", "Senegal", "GK"],
    ["Kalidou Koulibaly", "K. Koulibaly", "Senegal", "CB"],
    ["Aymeric Laporte", "A. Laporte", "Spain", "CB"],
    ["João Cancelo", "J. Cancelo", "Portugal", "RB"],
    ["Rúben Neves", "R. Neves", "Portugal", "CM"],
    ["Sergej Milinković-Savić", "S. Milinković-Savić", "Serbia", "CM"],
    ["Marcelo Brozović", "M. Brozović", "Croatia", "CDM"],
    ["Sadio Mané", "S. Mané", "Senegal", "LW"],
    ["Karim Benzema", "K. Benzema", "France", "ST"],
    ["Riyad Mahrez", "R. Mahrez", "Algeria", "RW"],
    ["N'Golo Kanté", "N. Kanté", "France", "CM"],
    ["Fabinho", "Fabinho", "Brazil", "CDM"],
    ["Aleksandar Mitrović", "A. Mitrović", "Serbia", "ST"],
    ["Ivan Toney", "I. Toney", "England", "ST"],
    ["Jota", "Jota", "Portugal", "LW"],
    ["Unai Simón", "U. Simón", "Spain", "GK"],
    ["David Soria", "D. Soria", "Spain", "GK"],
    ["Dani Vivian", "D. Vivian", "Spain", "CB"],
    ["Pau Torres", "P. Torres", "Spain", "CB"],
    ["Dani Parejo", "D. Parejo", "Spain", "CM"],
    ["Mikel Oyarzabal", "M. Oyarzabal", "Spain", "LW"],
    ["Nico Williams", "N. Williams", "Spain", "LW"],
    ["Takefusa Kubo", "T. Kubo", "Japan", "RW"],
    ["Iago Aspas", "I. Aspas", "Spain", "ST"],
    ["Ayoze Pérez", "A. Pérez", "Spain", "ST"],
    ["Isco", "Isco", "Spain", "CAM"],
    ["Sergio Herrera", "S. Herrera", "Spain", "GK"],
    ["Álex Baena", "Á. Baena", "Spain", "CAM"],
    ["Yeremy Pino", "Y. Pino", "Spain", "RW"],
    ["Gregor Kobel", "G. Kobel", "Switzerland", "GK"],
    ["Alexander Nübel", "A. Nübel", "Germany", "GK"],
    ["Nico Schlotterbeck", "N. Schlotterbeck", "Germany", "CB"],
    ["Waldemar Anton", "W. Anton", "Germany", "CB"],
    ["David Raum", "D. Raum", "Germany", "LB"],
    ["Angelo Stiller", "A. Stiller", "Germany", "CM"],
    ["Xavi Simons", "X. Simons", "Netherlands", "CAM"],
    ["Serhou Guirassy", "S. Guirassy", "Guinea", "ST"],
    ["Loïs Openda", "L. Openda", "Belgium", "ST"],
    ["Karim Adeyemi", "K. Adeyemi", "Germany", "LW"],
    ["Donyell Malen", "D. Malen", "Netherlands", "RW"],
    ["Julian Brandt", "J. Brandt", "Germany", "CAM"],
    ["Emre Can", "E. Can", "Germany", "CDM"],
    ["Nadiem Amiri", "N. Amiri", "Germany", "CM"],
    ["Benjamin Sesko", "B. Sesko", "Slovenia", "ST"],
    ["Lucas Chevalier", "L. Chevalier", "France", "GK"],
    ["Brice Samba", "B. Samba", "France", "GK"],
    ["Jonathan Clauss", "J. Clauss", "France", "RB"],
    ["Jean-Clair Todibo", "J. Todibo", "France", "CB"],
    ["Castello Lukeba", "C. Lukeba", "France", "CB"],
    ["Adrien Rabiot", "A. Rabiot", "France", "CM"],
    ["Moussa Diaby", "M. Diaby", "France", "RW"],
    ["Rayan Cherki", "R. Cherki", "France", "CAM"],
    ["Alexandre Lacazette", "A. Lacazette", "France", "ST"],
    ["Wissam Ben Yedder", "W. Ben Yedder", "France", "ST"],
    ["Amine Gouiri", "A. Gouiri", "Algeria", "ST"],
    ["André Silva", "A. Silva", "Portugal", "ST"],
    ["Rafael Silva", "R. Silva", "Portugal", "RW"],
    ["Diogo Costa", "D. Costa", "Portugal", "GK"],
    ["João Palhinha", "J. Palhinha", "Portugal", "CDM"],
    ["Alexander Isak", "A. Isak", "Sweden", "ST"],
    ["Dominik Livaković", "D. Livaković", "Croatia", "GK"],
    ["Josko Gvardiol", "J. Gvardiol", "Croatia", "CB"],
    ["Dušan Vlahović", "D. Vlahović", "Serbia", "ST"],
    ["Dušan Tadić", "D. Tadić", "Serbia", "CAM"],
    ["Victor Osimhen", "V. Osimhen", "Nigeria", "ST"],
    ["Wilfred Ndidi", "W. Ndidi", "Nigeria", "CDM"],
    ["Mohammed Kudus", "M. Kudus", "Ghana", "CAM"],
    ["Sébastien Haller", "S. Haller", "Ivory Coast", "ST"],
    ["Sofyan Amrabat", "S. Amrabat", "Morocco", "CDM"],
    ["Youssef En-Nesyri", "Y. En-Nesyri", "Morocco", "ST"],
    ["Kaoru Mitoma", "K. Mitoma", "Japan", "LW"],
    ["Weston McKennie", "W. McKennie", "USA", "CM"],
    ["Tim Weah", "T. Weah", "USA", "RW"],
    ["Folarin Balogun", "F. Balogun", "USA", "ST"],
    ["Hirving Lozano", "H. Lozano", "Mexico", "RW"],
    ["Edson Álvarez", "E. Álvarez", "Mexico", "CDM"],
    ["Jhon Durán", "J. Durán", "Colombia", "ST"],
    ["James Rodríguez", "J. Rodríguez", "Colombia", "CAM"],
    ["Luis Suárez", "L. Suárez", "Uruguay", "ST"],
    ["Paulo Dybala", "P. Dybala", "Argentina", "CAM"],
    ["Ángel Di María", "Á. Di María", "Argentina", "RW"],
    ["Emiliano Martínez", "E. Martínez", "Argentina", "GK"],
    ["Nicolás Otamendi", "N. Otamendi", "Argentina", "CB"],
    ["Neymar", "Neymar", "Brazil", "LW"],
    ["Richarlison", "Richarlison", "Brazil", "ST"],
    ["Bruno Guimarães", "B. Guimarães", "Brazil", "CM"],
    ["Thiago Silva", "T. Silva", "Brazil", "CB"],
    ["Memphis Depay", "M. Depay", "Netherlands", "ST"],
    ["Paul Pogba", "P. Pogba", "France", "CM"],
    ["Olivier Giroud", "O. Giroud", "France", "ST"],
    ["Yannick Carrasco", "Y. Carrasco", "Belgium", "LW"],
    ["Youri Tielemans", "Y. Tielemans", "Belgium", "CM"],
    ["Jan Vertonghen", "J. Vertonghen", "Belgium", "CB"],
    ["Marc-André ter Stegen", "M. ter Stegen", "Germany", "GK"],
    ["Toni Kroos", "T. Kroos", "Germany", "CM"],
    ["İlkay Gündoğan", "İ. Gündoğan", "Germany", "CM"],
    ["Niclas Füllkrug", "N. Füllkrug", "Germany", "ST"],
    ["Raheem Sterling", "R. Sterling", "England", "LW"],
    ["Jordan Pickford", "J. Pickford", "England", "GK"],
    ["Ollie Watkins", "O. Watkins", "England", "ST"],
    ["Anthony Gordon", "A. Gordon", "England", "LW"],
    ["Eberechi Eze", "E. Eze", "England", "CAM"],
    ["Adam Wharton", "A. Wharton", "England", "CM"],
    ["Mile Svilar", "M. Svilar", "Serbia", "GK"],
    ["Martin Zubimendi", "M. Zubimendi", "Spain", "CDM"],
    ["Álex Remiro", "Á. Remiro", "Spain", "GK"],
    ["Yehvann Diouf", "Y. Diouf", "France", "GK"],
    ["Szczęsny", "Szczęsny", "Poland", "GK"],
    ["Mike Penders", "M. Penders", "Belgium", "GK"],
    ["Bremer", "Bremer", "Brazil", "CB"],
    ["José Giménez", "J. Giménez", "Uruguay", "CB"],
    ["Morten Hjulmand", "M. Hjulmand", "Denmark", "CDM"],
    ["Khephren Thuram", "K. Thuram", "France", "CM"],
    ["İrfan Can Kahveci", "İ. Kahveci", "Turkey", "CAM"],
    ["Morgan Gibbs-White", "M. Gibbs-White", "England", "CAM"],
    ["Iñaki Williams", "I. Williams", "Ghana", "RW"],
    ["Gonçalo Guedes", "G. Guedes", "Portugal", "LW"],
    ["Raúl Jiménez", "R. Jiménez", "Mexico", "ST"],
    ["Luis Sinisterra", "L. Sinisterra", "Colombia", "LW"],
    ["Facundo Pellistri", "F. Pellistri", "Uruguay", "RW"],
    ["Nicolás González", "N. González", "Argentina", "RW"],
    ["Marcos Acuña", "M. Acuña", "Argentina", "LB"],
    ["Leandro Paredes", "L. Paredes", "Argentina", "CM"],
    ["Giovani Lo Celso", "G. Celso", "Argentina", "CM"],
    ["Lucas Paquetá", "L. Paquetá", "Brazil", "CAM"],
    ["Antony", "Antony", "Brazil", "RW"],
    ["Alex Sandro", "A. Sandro", "Brazil", "LB"],
    ["Danilo", "Danilo", "Brazil", "RB"],
    ["Fred", "Fred", "Brazil", "CM"],
    ["Sávio", "Sávio", "Brazil", "RW"],
    ["Mohamed Kudus", "M. Kudus", "Ghana", "CAM"],
    ["Idrissa Gueye", "I. Gueye", "Senegal", "CM"],
    ["Ismaïla Sarr", "I. Sarr", "Senegal", "RW"],
    ["Hakim Ziyech", "H. Ziyech", "Morocco", "RW"],
    ["Nayef Aguerd", "N. Aguerd", "Morocco", "CB"],
    ["Amine Harit", "A. Harit", "Morocco", "CAM"],
    ["Moses Simon", "M. Simon", "Nigeria", "LW"],
    ["Taiwo Awoniyi", "T. Awoniyi", "Nigeria", "ST"],
    ["Kelechi Iheanacho", "K. Iheanacho", "Nigeria", "ST"],
    ["Jordan Ayew", "J. Ayew", "Ghana", "ST"],
    ["Yunus Akgün", "Y. Akgün", "Turkey", "RW"],
    ["Orkun Kökçü", "O. Kökçü", "Turkey", "CM"],
    ["Ferdi Kadıoğlu", "F. Kadıoğlu", "Turkey", "LB"],
    ["İsmail Yüksek", "İ. Yüksek", "Turkey", "CDM"],
    ["Merih Demiral", "M. Demiral", "Turkey", "CB"],
    ["Kerem Aktürkoğlu", "K. Aktürkoğlu", "Turkey", "LW"],
    ["Cengiz Ünder", "C. Ünder", "Turkey", "RW"],
    ["Serdar Azmoun", "S. Azmoun", "Iran", "ST"],
    ["Alireza Jahanbakhsh", "A. Jahanbakhsh", "Iran", "RW"],
    ["Sardar Azmoun", "S. Azmoun", "Iran", "ST"],
    ["Daichi Kamada", "D. Kamada", "Japan", "CAM"],
    ["Ritsu Doan", "R. Doan", "Japan", "RW"],
    ["Ayase Ueda", "A. Ueda", "Japan", "ST"],
    ["Takehiro Tomiyasu", "T. Tomiyasu", "Japan", "CB"],
    ["Maya Yoshida", "M. Yoshida", "Japan", "CB"],
    ["Hidemasa Morita", "H. Morita", "Japan", "CM"],
    ["Junya Ito", "J. Ito", "Japan", "RW"],
    ["Hwang Hee-chan", "H. Hee-chan", "South Korea", "ST"],
    ["Kim Seung-gyu", "K. Seung-gyu", "South Korea", "GK"],
    ["Hwang In-beom", "H. In-beom", "South Korea", "CM"],
    ["Cho Gue-sung", "C. Gue-sung", "South Korea", "ST"],
    ["Kang-in Lee", "K. Lee", "South Korea", "RW"],
    ["Cyle Larin", "C. Larin", "Canada", "ST"],
    ["Tajon Buchanan", "T. Buchanan", "Canada", "RW"],
    ["Stephen Eustáquio", "S. Eustáquio", "Canada", "CM"],
    ["Ismaël Koné", "I. Koné", "Canada", "CM"],
    ["Jonathan Osorio", "J. Osorio", "Canada", "CM"],
    ["Milan Borjan", "M. Borjan", "Canada", "GK"],
    ["Antonee Robinson", "A. Robinson", "USA", "LB"],
    ["Yunus Musah", "Y. Musah", "USA", "CM"],
    ["Tyler Adams", "T. Adams", "USA", "CDM"],
    ["Giovanni Reyna", "G. Reyna", "USA", "CAM"],
    ["Matt Turner", "M. Turner", "USA", "GK"],
    ["Sergiño Dest", "S. Dest", "USA", "RB"],
    ["Ricardo Pepi", "R. Pepi", "USA", "ST"],
    ["Malik Tillman", "M. Tillman", "USA", "CAM"],
    ["Pervis Estupiñán", "P. Estupiñán", "Ecuador", "LB"],
    ["Enner Valencia", "E. Valencia", "Ecuador", "ST"],
    ["Kendry Páez", "K. Páez", "Ecuador", "CAM"],
    ["Moisés Ramírez", "M. Ramírez", "Ecuador", "GK"],
    ["Renato Tapia", "R. Tapia", "Peru", "CDM"],
    ["Gianluca Lapadula", "G. Lapadula", "Italy", "ST"],
    ["Luis Advíncula", "L. Advíncula", "Peru", "RB"],
    ["Pedro Aquino", "P. Aquino", "Peru", "CDM"],
    ["Paolo Guerrero", "P. Guerrero", "Peru", "ST"],
    ["André Carrillo", "A. Carrillo", "Peru", "RW"],
    ["Salomón Rondón", "S. Rondón", "Venezuela", "ST"],
    ["Yangel Herrera", "Y. Herrera", "Venezuela", "CM"],
    ["Darwin Machís", "D. Machís", "Venezuela", "LW"],
    ["Jefferson Savarino", "J. Savarino", "Venezuela", "RW"],
    ["Miguel Almirón", "M. Almirón", "Paraguay", "RW"],
    ["Julio Enciso", "J. Enciso", "Paraguay", "CAM"],
    ["Antonio Sanabria", "A. Sanabria", "Paraguay", "ST"],
    ["Fabián Balbuena", "F. Balbuena", "Paraguay", "CB"],
    ["Kostas Tsimikas", "K. Tsimikas", "Greece", "LB"],
    ["Anastasios Bakasetas", "A. Bakasetas", "Greece", "CAM"],
    ["Giorgos Masouras", "G. Masouras", "Greece", "RW"],
    ["Odysseas Vlachodimos", "O. Vlachodimos", "Greece", "GK"],
    ["Andreas Bouchalakis", "A. Bouchalakis", "Greece", "CM"],
    ["Roland Sallai", "R. Sallai", "Hungary", "RW"],
    ["Peter Gulácsi", "P. Gulácsi", "Hungary", "GK"],
    ["Attila Szalai", "A. Szalai", "Hungary", "CB"],
    ["Willi Orbán", "W. Orbán", "Hungary", "CB"],
    ["Vladimír Coufal", "V. Coufal", "Czech Republic", "RB"],
    ["Tomáš Souček", "T. Souček", "Czech Republic", "CM"],
    ["Adam Hložek", "A. Hložek", "Czech Republic", "ST"],
    ["Alex Král", "A. Král", "Czech Republic", "CM"],
    ["David Hancko", "D. Hancko", "Slovakia", "CB"],
    ["Martin Dúbravka", "M. Dúbravka", "Slovakia", "GK"],
    ["Milan Škriniar", "M. Škriniar", "Slovakia", "CB"],
    ["Ondrej Duda", "O. Duda", "Slovakia", "CAM"],
    ["László Bénes", "L. Bénes", "Slovakia", "CM"],
    ["Ian Hagi", "I. Hagi", "Romania", "CAM"],
    ["Andrei Burcă", "A. Burcă", "Romania", "CB"],
    ["Denis Drăguș", "D. Drăguș", "Romania", "ST"],
    ["Dennis Man", "D. Man", "Romania", "RW"],
    ["Nicușor Bancu", "N. Bancu", "Romania", "LB"],
    ["Andrei Rațiu", "A. Rațiu", "Romania", "RB"],
    ["Dodi Lukebakio", "D. Lukebakio", "Belgium", "RW"],
    ["Arthur Vermeeren", "A. Vermeeren", "Belgium", "CM"],
    ["Amadou Onana", "A. Onana", "Belgium", "CDM"],
    ["Filip Kostić", "F. Kostić", "Serbia", "LM"],
    ["Nemanja Gudelj", "N. Gudelj", "Serbia", "CDM"],
    ["Predrag Rajković", "P. Rajković", "Serbia", "GK"],
    ["Miloš Veljković", "M. Veljković", "Serbia", "CB"],
    ["Josip Stanišić", "J. Stanišić", "Croatia", "RB"],
    ["Ivan Perišić", "I. Perišić", "Croatia", "LW"],
    ["Andrej Kramarić", "A. Kramarić", "Croatia", "ST"],
    ["Bruno Petković", "B. Petković", "Croatia", "ST"],
    ["Lovro Majer", "L. Majer", "Croatia", "CAM"],
    ["Arnaut Danjuma", "A. Danjuma", "Netherlands", "LW"],
    ["Steven Bergwijn", "S. Bergwijn", "Netherlands", "LW"],
    ["Georginio Wijnaldum", "G. Wijnaldum", "Netherlands", "CM"],
    ["Wout Weghorst", "W. Weghorst", "Netherlands", "ST"],
    ["Daley Blind", "D. Blind", "Netherlands", "CB"],
    ["Diogo Jota", "D. Jota", "Portugal", "ST"],
    ["Pedro Gonçalves", "P. Gonçalves", "Portugal", "CAM"],
    ["Rúben Amorim", "R. Amorim", "Portugal", "CAM"],
    ["Rúben Semedo", "R. Semedo", "Portugal", "CB"],
    ["Nuno Tavares", "N. Tavares", "Portugal", "LB"],
    ["Matheus Nunes", "M. Nunes", "Portugal", "CM"],
    ["Otávio", "Otávio", "Portugal", "CAM"],
    ["Gonçalo Inácio", "G. Inácio", "Portugal", "CB"],
    ["António Silva", "A. Silva", "Portugal", "CB"],
    ["Evanilson", "Evanilson", "Brazil", "ST"],
    ["Andreas Pereira", "A. Pereira", "Brazil", "CM"],
    ["Murillo", "Murillo", "Brazil", "CB"],
    ["Vanderson", "Vanderson", "Brazil", "RB"],
    ["Abner", "Abner", "Brazil", "LB"],
    ["Igor Jesus", "I. Jesus", "Brazil", "ST"],
    ["João Gomes", "J. Gomes", "Brazil", "CM"],
    ["Pepê", "Pepê", "Brazil", "RW"],
    ["Paulinho", "Paulinho", "Brazil", "ST"],
    ["Matheus França", "M. França", "Brazil", "CAM"],
    ["Bento", "Bento", "Brazil", "GK"],
    ["Weverton", "Weverton", "Brazil", "GK"],
    ["Everson", "Everson", "Brazil", "GK"],
    ["Gerson", "Gerson", "Brazil", "CM"],
    ["Wendell", "Wendell", "Brazil", "LB"],
    ["Gabriel Barbosa", "G. Barbosa", "Brazil", "ST"],
    ["Everton Ribeiro", "E. Ribeiro", "Brazil", "CAM"],
    ["Savio Moreira", "S. Moreira", "Brazil", "RW"],
    ["André Trindade", "A. Trindade", "Brazil", "CDM"],
    ["Jeremy Sarmiento", "J. Sarmiento", "Ecuador", "LW"],
    ["Ángelo Preciado", "Á. Preciado", "Ecuador", "RB"],
    ["Jackson Porozo", "J. Porozo", "Ecuador", "CB"],
    ["Gonzalo Plata", "G. Plata", "Ecuador", "RW"],
    ["José Cifuentes", "J. Cifuentes", "Ecuador", "CM"],
    ["Alan Franco", "A. Franco", "Ecuador", "CM"],
    ["Ángel Mena", "Á. Mena", "Ecuador", "RW"],
    ["Carlos Gruezo", "C. Gruezo", "Ecuador", "CDM"],
    ["Djorkaeff Reasco", "D. Reasco", "Ecuador", "ST"],
    ["Maximiliano Araújo", "M. Araújo", "Uruguay", "LW"],
    ["Sebastián Cáceres", "S. Cáceres", "Uruguay", "CB"],
    ["Sergio Rochet", "S. Rochet", "Uruguay", "GK"],
    ["Nicolás de la Cruz", "N. de la Cruz", "Uruguay", "CM"],
    ["Matías Viña", "M. Viña", "Uruguay", "LB"],
    ["Giorgian de Arrascaeta", "G. de Arrascaeta", "Uruguay", "CAM"],
    ["Edinson Cavani", "E. Cavani", "Uruguay", "ST"],
    ["Davinson Sánchez", "D. Sánchez", "Colombia", "CB"],
    ["Daniel Muñoz", "D. Muñoz", "Colombia", "RB"],
    ["Jefferson Lerma", "J. Lerma", "Colombia", "CDM"],
    ["Richard Ríos", "R. Ríos", "Colombia", "CM"],
    ["Jhon Arias", "J. Arias", "Colombia", "RW"],
    ["Yerry Mina", "Y. Mina", "Colombia", "CB"],
    ["Rafael Borré", "R. Borré", "Colombia", "ST"],
    ["Jhon Córdoba", "J. Córdoba", "Colombia", "ST"],
    ["Mateus Uribe", "M. Uribe", "Colombia", "CM"],
    ["David Ospina", "D. Ospina", "Colombia", "GK"],
    ["Juan Cuadrado", "J. Cuadrado", "Colombia", "RW"],
    ["Matías Rojas", "M. Rojas", "Paraguay", "CM"],
    ["Omar Alderete", "O. Alderete", "Paraguay", "CB"],
    ["Gustavo Velázquez", "G. Velázquez", "Paraguay", "CB"],
    ["Ramón Sosa", "R. Sosa", "Paraguay", "LW"],
    ["Diego Gómez", "D. Gómez", "Paraguay", "CM"],
    ["Carlos Alcaraz", "C. Alcaraz", "Argentina", "CM"],
    ["Valentín Barco", "V. Barco", "Argentina", "LB"],
    ["Facundo Buonanotte", "F. Buonanotte", "Argentina", "CAM"],
    ["Alejandro Garnacho", "A. Garnacho", "Argentina", "LW"],
    ["Emiliano Buendía", "E. Buendía", "Argentina", "CAM"],
    ["Mauro Icardi", "M. Icardi", "Argentina", "ST"],
    ["Germán Pezzella", "G. Pezzella", "Argentina", "CB"],
    ["Ferran Jutglà", "F. Jutglà", "Spain", "ST"],
    ["Gerard Moreno", "G. Moreno", "Spain", "ST"],
    ["Jesús Navas", "J. Navas", "Spain", "RB"],
    ["Sergio Canales", "S. Canales", "Spain", "CAM"],
    ["Sergio Reguilón", "S. Reguilón", "Spain", "LB"],
    ["Lucas Vázquez", "L. Vázquez", "Spain", "RB"],
    ["Sergi Roberto", "S. Roberto", "Spain", "CM"],
    ["Marco Asensio", "M. Asensio", "Spain", "RW"],
    ["Pablo Sarabia", "P. Sarabia", "Spain", "RW"],
    ["Bryan Gil", "B. Gil", "Spain", "LW"],
    ["Pau Víctor", "P. Víctor", "Spain", "ST"],
    ["Samu Omorodion", "S. Omorodion", "Spain", "ST"],
    ["Abel Ruiz", "A. Ruiz", "Spain", "ST"],
    ["Mats Hummels", "M. Hummels", "Germany", "CB"],
    ["Benjamin Henrichs", "B. Henrichs", "Germany", "RB"],
    ["Robin Gosens", "R. Gosens", "Germany", "LB"],
    ["Pascal Groß", "P. Groß", "Germany", "CM"],
    ["Maximilian Mittelstädt", "M. Mittelstädt", "Germany", "LB"],
    ["Chris Führich", "C. Führich", "Germany", "LW"],
    ["Deniz Undav", "D. Undav", "Germany", "ST"],
    ["Florian Neuhaus", "F. Neuhaus", "Germany", "CM"],
    ["Timo Werner", "T. Werner", "Germany", "ST"],
    ["Marco Reus", "M. Reus", "Germany", "CAM"],
    ["Kevin Trapp", "K. Trapp", "Germany", "GK"],
    ["Oliver Baumann", "O. Baumann", "Germany", "GK"],
    ["Bernd Leno", "B. Leno", "Germany", "GK"],
    ["Maximilian Beier", "M. Beier", "Germany", "ST"],
    ["Ibrahim Osman", "I. Osman", "Ghana", "LW"],
    ["Tariq Lamptey", "T. Lamptey", "Ghana", "RB"],
    ["Daniel Amartey", "D. Amartey", "Ghana", "CB"],
    ["Alexander Djiku", "A. Djiku", "Ghana", "CB"],
    ["Abdul Fatawu", "A. Fatawu", "Ghana", "RW"],
    ["Inaki Williams", "I. Williams", "Ghana", "RW"],
    ["Kamaldeen Sulemana", "K. Sulemana", "Ghana", "LW"],
    ["Osman Bukari", "O. Bukari", "Ghana", "RW"],
    ["Salis Abdul Samed", "S. Samed", "Ghana", "CDM"],
    ["Elisha Owusu", "E. Owusu", "Ghana", "CDM"],
    ["Mohammed Salisu", "M. Salisu", "Ghana", "CB"],
    ["Alidu Seidu", "A. Seidu", "Ghana", "RB"],
    ["Wout Faes", "W. Faes", "Belgium", "CB"],
    ["Zeno Debast", "Z. Debast", "Belgium", "CB"],
    ["Koen Casteels", "K. Casteels", "Belgium", "GK"],
    ["Matz Sels", "M. Sels", "Belgium", "GK"],
    ["Bilal El Khannouss", "B. El Khannouss", "Morocco", "CAM"],
    ["Eliesse Ben Seghir", "E. Ben Seghir", "Morocco", "LW"],
    ["Abde Ezzalzouli", "A. Ezzalzouli", "Morocco", "LW"],
    ["Ismael Saibari", "I. Saibari", "Morocco", "CAM"],
    ["Krépin Diatta", "K. Diatta", "Senegal", "RW"],
    ["Famara Diédhiou", "F. Diédhiou", "Senegal", "ST"],
    ["Abdou Diallo", "A. Diallo", "Senegal", "CB"],
    ["Moussa Niakhaté", "M. Niakhaté", "Senegal", "CB"],
    ["Fodé Ballo-Touré", "F. Ballo-Touré", "Senegal", "LB"],
    ["Seko Fofana", "S. Fofana", "Ivory Coast", "CM"],
    ["Franck Kessié", "F. Kessié", "Ivory Coast", "CM"],
    ["Nicolas Pépé", "N. Pépé", "Ivory Coast", "RW"],
    ["Wilfried Zaha", "W. Zaha", "Ivory Coast", "LW"],
    ["Simon Adingra", "S. Adingra", "Ivory Coast", "LW"],
    ["Evan Ndicka", "E. Ndicka", "Ivory Coast", "CB"],
    ["Serge Aurier", "S. Aurier", "Ivory Coast", "RB"],
    ["Haller", "Haller", "Ivory Coast", "ST"],
    ["Justin Kluivert", "J. Kluivert", "Netherlands", "LW"],
    ["Alban Lafont", "A. Lafont", "France", "GK"],
    ["David Zima", "D. Zima", "Czech Republic", "CB"],
    ["Antonín Barák", "A. Barák", "Czech Republic", "CAM"],
    ["David Doudera", "D. Doudera", "Czech Republic", "RB"],
    ["Borna Sosa", "B. Sosa", "Croatia", "LB"],
    ["Luka Sučić", "L. Sučić", "Croatia", "CM"],
    ["Nikola Vlašić", "N. Vlašić", "Croatia", "CAM"],
    ["Martin Baturina", "M. Baturina", "Croatia", "CAM"],
    ["Giorgi Chakvetadze", "G. Chakvetadze", "Georgia", "CAM"],
    ["Giorgi Kochorashvili", "G. Kochorashvili", "Georgia", "CM"],
    ["Otar Kiteishvili", "O. Kiteishvili", "Georgia", "CAM"],
    ["Zuriko Davitashvili", "Z. Davitashvili", "Georgia", "RW"],
    ["Saba Lobzhanidze", "S. Lobzhanidze", "Georgia", "RW"],
    ["Budimir Shavari", "B. Shavari", "Georgia", "CB"],
    ["Nabil Fekir", "N. Fekir", "France", "CAM"],
    ["Steven Berghuis", "S. Berghuis", "Netherlands", "RW"],
    ["Pepe", "Pepe", "Portugal", "CB"],
    ["Sergio Ramos", "S. Ramos", "Spain", "CB"],
    ["Pepe Reina", "P. Reina", "Spain", "GK"],
    ["David Silva", "D. Silva", "Spain", "CAM"],
    ["Cesc Fàbregas", "C. Fàbregas", "Spain", "CM"],
    ["Thiago Alcântara", "T. Alcântara", "Spain", "CM"],
    ["Jordi Alba", "J. Alba", "Spain", "LB"],
    ["Sergio Busquets", "S. Busquets", "Spain", "CDM"],
    ["Dani Alves", "D. Alves", "Brazil", "RB"],
    ["Marcelo", "Marcelo", "Brazil", "LB"],
    ["Roberto Firmino", "R. Firmino", "Brazil", "ST"],
    ["Raphaël Varane", "R. Varane", "France", "CB"]
  ], REAL_PLAYERS_EXTRA = [
    ["Moise Kean", "M. Kean", "Italy", "ST"],
    ["Jorginho", "Jorginho", "Italy", "CDM"],
    ["Alexis Sánchez", "A. Sánchez", "Chile", "ST"],
    ["Dominik Kotarski", "D. Kotarski", "Croatia", "GK"],
    ["Marko Livaja", "M. Livaja", "Croatia", "ST"],
    ["Mert Müldür", "M. Müldür", "Turkey", "RB"],
    ["Haji Wright", "H. Wright", "USA", "ST"],
    ["Josh Sargent", "J. Sargent", "USA", "ST"],
    ["Abdullah Al-Hamdan", "A. Al-Hamdan", "Saudi Arabia", "ST"],
    ["Kevin Danso", "K. Danso", "Austria", "CB"],
    ["Craig Goodwin", "C. Goodwin", "Australia", "LW"],
    ["Ibrahim Sangaré", "I. Sangaré", "Ivory Coast", "CDM"],
    ["Ezequiel Fernández", "E. Fernández", "Argentina", "CDM"],
    ["Darius Olaru", "D. Olaru", "Romania", "CM"],
    ["Sander Berge", "S. Berge", "Norway", "CDM"],
    ["Jindřich Staněk", "J. Staněk", "Czech Republic", "GK"],
    ["Luis Chávez", "L. Chávez", "Mexico", "CM"],
    ["Maxim De Cuyper", "M. De Cuyper", "Belgium", "LB"],
    ["Ryan Sessegnon", "R. Sessegnon", "England", "LB"],
    ["Jannik Vestergaard", "J. Vestergaard", "Denmark", "CB"],
    ["Heorhiy Sudakov", "H. Sudakov", "Ukraine", "CAM"],
    ["Jamie Leweling", "J. Leweling", "Germany", "RW"],
    ["Nicolò Fagioli", "N. Fagioli", "Italy", "CM"],
    ["Michael Gregoritsch", "M. Gregoritsch", "Austria", "ST"],
    ["Răzvan Marin", "R. Marin", "Romania", "CM"],
    ["Jamie Vardy", "J. Vardy", "England", "ST"],
    ["Viktor Tsyhankov", "V. Tsyhankov", "Ukraine", "RW"],
    ["Lucas Digne", "L. Digne", "France", "LB"],
    ["Fabian Schär", "F. Schär", "Switzerland", "CB"],
    ["Yaser Asprilla", "Y. Asprilla", "Colombia", "CAM"],
    ["Horațiu Moldovan", "H. Moldovan", "Romania", "GK"],
    ["Josip Šutalo", "J. Šutalo", "Croatia", "CB"],
    ["Hassan Tambakti", "H. Tambakti", "Saudi Arabia", "CB"],
    ["Harry Souttar", "H. Souttar", "Australia", "CB"],
    ["Leo Østigård", "L. Østigård", "Norway", "CB"],
    ["Manolis Siopis", "M. Siopis", "Greece", "CDM"],
    ["Uğurcan Çakır", "U. Çakır", "Turkey", "GK"],
    ["Julian Ryerson", "J. Ryerson", "Norway", "RB"],
    ["Adam Gnezda Čerin", "A. Čerin", "Slovenia", "CDM"],
    ["Marco Verratti", "M. Verratti", "Italy", "CM"],
    ["Joakim Mæhle", "J. Mæhle", "Denmark", "RB"],
    ["César Azpilicueta", "C. Azpilicueta", "Spain", "RB"],
    ["Arkadiusz Milik", "A. Milik", "Poland", "ST"],
    ["Kenneth Taylor", "K. Taylor", "Netherlands", "CM"],
    ["Konstantinos Mavropanos", "K. Mavropanos", "Greece", "CB"],
    ["Lukáš Haraslín", "L. Haraslín", "Slovakia", "LW"],
    ["Marcin Bułka", "M. Bułka", "Poland", "GK"],
    ["Brais Méndez", "B. Méndez", "Spain", "CAM"],
    ["Anthony Elanga", "A. Elanga", "Sweden", "RW"],
    ["Kaan Ayhan", "K. Ayhan", "Turkey", "CB"],
    ["Mathew Ryan", "M. Ryan", "Australia", "GK"],
    ["András Schäfer", "A. Schäfer", "Hungary", "CM"],
    ["Habib Diallo", "H. Diallo", "Senegal", "ST"],
    ["Takumi Minamino", "T. Minamino", "Japan", "CAM"],
    ["Marcel Sabitzer", "M. Sabitzer", "Austria", "CM"],
    ["Nicolas Seiwald", "N. Seiwald", "Austria", "CDM"],
    ["Tino Livramento", "T. Livramento", "England", "RB"],
    ["Joaquín Piquerez", "J. Piquerez", "Uruguay", "LB"],
    ["Marwan Al-Sahafi", "M. Al-Sahafi", "Saudi Arabia", "RW"],
    ["Jan Kuchta", "J. Kuchta", "Czech Republic", "ST"],
    ["Petar Sučić", "P. Sučić", "Croatia", "CM"],
    ["Breel Embolo", "B. Embolo", "Switzerland", "ST"],
    ["Bart Verbruggen", "B. Verbruggen", "Netherlands", "GK"],
    ["Tomáš Chorý", "T. Chorý", "Czech Republic", "ST"],
    ["Pedro", "Pedro", "Brazil", "ST"],
    ["Franco Mastantuono", "F. Mastantuono", "Argentina", "CAM"],
    ["Youcef Atal", "Y. Atal", "Algeria", "RB"],
    ["Max Kilman", "M. Kilman", "England", "CB"],
    ["Sandro Tonali", "S. Tonali", "Italy", "CM"],
    ["Patrick Wimmer", "P. Wimmer", "Austria", "LW"],
    ["Mohamed Amoura", "M. Amoura", "Algeria", "ST"],
    ["Brenden Aaronson", "B. Aaronson", "USA", "CAM"],
    ["Abdulelah Al-Malki", "A. Al-Malki", "Saudi Arabia", "CDM"],
    ["Loïc Badé", "L. Badé", "France", "CB"],
    ["Kieran Tierney", "K. Tierney", "Scotland", "LB"],
    ["Bryan Cristante", "B. Cristante", "Italy", "CM"],
    ["Mohammed Al-Owais", "M. Al-Owais", "Saudi Arabia", "GK"],
    ["Ruslan Malinovskyi", "R. Malinovskyi", "Ukraine", "CAM"],
    ["Jacob Ramsey", "J. Ramsey", "England", "CM"],
    ["Jaka Bijol", "J. Bijol", "Slovenia", "CB"],
    ["Stefan Posch", "S. Posch", "Austria", "RB"],
    ["Tyrell Malacia", "T. Malacia", "Netherlands", "LB"],
    ["Jakub Moder", "J. Moder", "Poland", "CM"],
    ["Kyle Walker-Peters", "K. Walker-Peters", "England", "RB"],
    ["Yukinari Sugawara", "Y. Sugawara", "Japan", "RB"],
    ["Nikola Milenković", "N. Milenković", "Serbia", "CB"],
    ["Hannibal Mejbri", "H. Mejbri", "Tunisia", "CM"],
    ["Iliman Ndiaye", "I. Ndiaye", "Senegal", "LW"],
    ["Ezri Konsa", "E. Konsa", "England", "CB"],
    ["Mostafa Mohamed", "M. Mohamed", "Egypt", "ST"],
    ["Azzedine Ounahi", "A. Ounahi", "Morocco", "CM"],
    ["Ernest Nuamah", "E. Nuamah", "Ghana", "RW"],
    ["Iñigo Martínez", "I. Martínez", "Spain", "CB"],
    ["Javi Galán", "J. Galán", "Spain", "LB"],
    ["Giorgio Scalvini", "G. Scalvini", "Italy", "CB"],
    ["Ciro Immobile", "C. Immobile", "Italy", "ST"],
    ["Matteo Ruggeri", "M. Ruggeri", "Italy", "LB"],
    ["Diego Lainez", "D. Lainez", "Mexico", "RW"],
    ["Nicolò Rovella", "N. Rovella", "Italy", "CDM"],
    ["Łukasz Skorupski", "Ł. Skorupski", "Poland", "GK"],
    ["Manu Koné", "M. Koné", "France", "CM"],
    ["Kristoffer Ajer", "K. Ajer", "Norway", "CB"],
    ["Xaver Schlager", "X. Schlager", "Austria", "CM"],
    ["Luka Ivanušec", "L. Ivanušec", "Croatia", "LW"],
    ["Vitaliy Mykolenko", "V. Mykolenko", "Ukraine", "LB"],
    ["Emerson Royal", "E. Royal", "Brazil", "RB"],
    ["Johan Vásquez", "J. Vásquez", "Mexico", "CB"],
    ["Tom Bischof", "T. Bischof", "Germany", "CM"],
    ["Ethan Ampadu", "E. Ampadu", "Wales", "CDM"],
    ["Jarrad Branthwaite", "J. Branthwaite", "England", "CB"],
    ["Abdullah Radif", "A. Radif", "Saudi Arabia", "ST"],
    ["Daniel James", "D. James", "Wales", "RW"],
    ["Michael Kayode", "M. Kayode", "Italy", "RB"],
    ["Mahmoud Trezeguet", "M. Trezeguet", "Egypt", "RW"],
    ["James Ward-Prowse", "J. Ward-Prowse", "England", "CM"],
    ["James Trafford", "J. Trafford", "England", "GK"],
    ["Leon Bailey", "L. Bailey", "Jamaica", "RW"],
    ["Ola Aina", "O. Aina", "Nigeria", "RB"],
    ["Valentin Mihăilă", "V. Mihăilă", "Romania", "LW"],
    ["Konstantinos Koulierakis", "K. Koulierakis", "Greece", "CB"],
    ["Justin Bijlow", "J. Bijlow", "Netherlands", "GK"],
    ["Xherdan Shaqiri", "X. Shaqiri", "Switzerland", "CAM"],
    ["Silvan Widmer", "S. Widmer", "Switzerland", "RB"],
    ["Quilindschy Hartman", "Q. Hartman", "Netherlands", "LB"],
    ["Nawaf Al-Aqidi", "N. Al-Aqidi", "Saudi Arabia", "GK"],
    ["Jordan Henderson", "J. Henderson", "England", "CM"],
    ["Timothy Castagne", "T. Castagne", "Belgium", "RB"],
    ["Ricardo Rodríguez", "R. Rodríguez", "Switzerland", "LB"],
    ["Ante Budimir", "A. Budimir", "Croatia", "ST"],
    ["Nestory Irankunda", "N. Irankunda", "Australia", "RW"],
    ["Christoph Baumgartner", "C. Baumgartner", "Austria", "CAM"],
    ["Yasser Al-Shahrani", "Y. Al-Shahrani", "Saudi Arabia", "LB"],
    ["Marko Arnautović", "M. Arnautović", "Austria", "ST"],
    ["Yusuf Yazıcı", "Y. Yazıcı", "Turkey", "CAM"],
    ["Lucas Beltrán", "L. Beltrán", "Argentina", "ST"],
    ["Ellyes Skhiri", "E. Skhiri", "Tunisia", "CDM"],
    ["Lamine Camara", "L. Camara", "Senegal", "CM"],
    ["Jonas Wind", "J. Wind", "Denmark", "ST"],
    ["Ayrton Lucas", "A. Lucas", "Brazil", "LB"],
    ["Demarai Gray", "D. Gray", "Jamaica", "LW"],
    ["Giacomo Raspadori", "G. Raspadori", "Italy", "ST"],
    ["Nick Pope", "N. Pope", "England", "GK"],
    ["Victor Lindelöf", "V. Lindelöf", "Sweden", "CB"],
    ["Tim Kleindienst", "T. Kleindienst", "Germany", "ST"],
    ["Ryan Christie", "R. Christie", "Scotland", "CAM"],
    ["Keito Nakamura", "K. Nakamura", "Japan", "LW"],
    ["Carlos Baleba", "C. Baleba", "Cameroon", "CDM"],
    ["Ben Brereton Díaz", "B. Díaz", "Chile", "ST"],
    ["Abdülkerim Bardakcı", "A. Bardakcı", "Turkey", "CB"],
    ["Ethan Nwaneri", "E. Nwaneri", "England", "CAM"],
    ["Ladislav Krejčí", "L. Krejčí", "Czech Republic", "CB"],
    ["Vangelis Pavlidis", "V. Pavlidis", "Greece", "ST"],
    ["Nemanja Matić", "N. Matić", "Serbia", "CDM"],
    ["Josip Juranović", "J. Juranović", "Croatia", "RB"],
    ["Roger Ibañez", "R. Ibañez", "Brazil", "CB"],
    ["Riccardo Orsolini", "R. Orsolini", "Italy", "RW"],
    ["Przemysław Frankowski", "P. Frankowski", "Poland", "RB"],
    ["Oleksandr Zinchenko", "O. Zinchenko", "Ukraine", "LB"],
    ["Nasser Al-Dawsari", "N. Al-Dawsari", "Saudi Arabia", "CM"],
    ["Ahmed Hegazi", "A. Hegazi", "Egypt", "CB"],
    ["Dean Henderson", "D. Henderson", "England", "GK"],
    ["Niklas Süle", "N. Süle", "Germany", "CB"],
    ["Kristijan Jakić", "K. Jakić", "Croatia", "CDM"],
    ["Yuri Alberto", "Y. Alberto", "Brazil", "ST"],
    ["Paul Wanner", "P. Wanner", "Germany", "CAM"],
    ["Mattia Zaccagni", "M. Zaccagni", "Italy", "LW"],
    ["Axel Disasi", "A. Disasi", "France", "CB"],
    ["Lewis Ferguson", "L. Ferguson", "Scotland", "CM"],
    ["Crysencio Summerville", "C. Summerville", "Netherlands", "LW"],
    ["Nick Woltemade", "N. Woltemade", "Germany", "ST"],
    ["Marcos Senesi", "M. Senesi", "Argentina", "CB"],
    ["Thomas Lemar", "T. Lemar", "France", "CAM"],
    ["Turki Al-Ammar", "T. Al-Ammar", "Saudi Arabia", "CAM"],
    ["Jerdy Schouten", "J. Schouten", "Netherlands", "CDM"],
    ["Oihan Sancet", "O. Sancet", "Spain", "CAM"],
    ["Antonio Nusa", "A. Nusa", "Norway", "LW"],
    ["Lutsharel Geertruida", "L. Geertruida", "Netherlands", "CB"],
    ["Harvey Elliott", "H. Elliott", "England", "CAM"],
    ["Santiago Castro", "S. Castro", "Argentina", "ST"],
    ["Diego Llorente", "D. Llorente", "Spain", "CB"],
    ["Jan Bednarek", "J. Bednarek", "Poland", "CB"],
    ["Christian Nørgaard", "C. Nørgaard", "Denmark", "CDM"],
    ["Rodrigo Mora", "R. Mora", "Portugal", "CAM"],
    ["Kalvin Phillips", "K. Phillips", "England", "CDM"],
    ["Eric Maxim Choupo-Moting", "E. Choupo-Moting", "Cameroon", "ST"],
    ["Andrija Živković", "A. Živković", "Serbia", "RW"],
    ["Fredrik Aursnes", "F. Aursnes", "Norway", "CM"],
    ["César Montes", "C. Montes", "Mexico", "CB"],
    ["Zeki Amdouni", "Z. Amdouni", "Switzerland", "ST"],
    ["Václav Černý", "V. Černý", "Czech Republic", "RW"],
    ["Mohamed Elneny", "M. Elneny", "Egypt", "CDM"],
    ["Talal Haji", "T. Haji", "Saudi Arabia", "ST"],
    ["Giorgos Giakoumakis", "G. Giakoumakis", "Greece", "ST"],
    ["Anatoliy Trubin", "A. Trubin", "Ukraine", "GK"],
    ["Alex Iwobi", "A. Iwobi", "Nigeria", "CM"],
    ["Tommaso Baldanzi", "T. Baldanzi", "Italy", "CAM"],
    ["Mykola Matviyenko", "M. Matviyenko", "Ukraine", "CB"],
    ["Lucas Perri", "L. Perri", "Brazil", "GK"],
    ["Vincent Aboubakar", "V. Aboubakar", "Cameroon", "ST"],
    ["Dan Ndoye", "D. Ndoye", "Switzerland", "RW"],
    ["Andreas Skov Olsen", "A. Olsen", "Denmark", "RW"],
    ["Axel Witsel", "A. Witsel", "Belgium", "CDM"],
    ["Illan Meslier", "I. Meslier", "France", "GK"],
    ["Moïse Bombito", "M. Bombito", "Canada", "CB"],
    ["Kevin Castaño", "K. Castaño", "Colombia", "CM"],
    ["Callum Wilson", "C. Wilson", "England", "ST"],
    ["Tomáš Suslov", "T. Suslov", "Slovakia", "CM"],
    ["Karol Świderski", "K. Świderski", "Poland", "ST"],
    ["Marc Guéhi", "M. Guéhi", "England", "CB"],
    ["Walter Benítez", "W. Benítez", "Argentina", "GK"],
    ["Geovany Quenda", "G. Quenda", "Portugal", "RW"],
    ["Borja Iglesias", "B. Iglesias", "Spain", "ST"],
    ["Alexis Vega", "A. Vega", "Mexico", "LW"],
    ["Pierre-Emile Højbjerg", "P. Højbjerg", "Denmark", "CDM"],
    ["Lorenzo Pellegrini", "L. Pellegrini", "Italy", "CAM"],
    ["Uriel Antuna", "U. Antuna", "Mexico", "RW"],
    ["Nathan Collins", "N. Collins", "Ireland", "CB"],
    ["Aaron Ramsdale", "A. Ramsdale", "England", "GK"],
    ["Harry Wilson", "H. Wilson", "Wales", "CAM"],
    ["Mohammed Kanno", "M. Kanno", "Saudi Arabia", "CM"],
    ["Jan Paul van Hecke", "J. Paul van Hecke", "Netherlands", "CB"],
    ["Joey Veerman", "J. Veerman", "Netherlands", "CM"],
    ["Ørjan Nyland", "Ø. Nyland", "Norway", "GK"],
    ["Brian Brobbey", "B. Brobbey", "Netherlands", "ST"],
    ["José Gayà", "J. Gayà", "Spain", "LB"],
    ["Joshua Zirkzee", "J. Zirkzee", "Netherlands", "ST"],
    ["Lewis Dunk", "L. Dunk", "England", "CB"],
    ["Oscar Bobb", "O. Bobb", "Norway", "RW"],
    ["Gary Medel", "G. Medel", "Chile", "CDM"],
    ["Christos Tzolis", "C. Tzolis", "Greece", "LW"],
    ["Emil Forsberg", "E. Forsberg", "Sweden", "CAM"],
    ["Elye Wahi", "E. Wahi", "France", "ST"],
    ["Mattéo Guendouzi", "M. Guendouzi", "France", "CM"],
    ["Fábio Vieira", "F. Vieira", "Portugal", "CAM"],
    ["Orel Mangala", "O. Mangala", "Belgium", "CM"],
    ["Wilfried Gnonto", "W. Gnonto", "Italy", "LW"],
    ["Andraž Šporar", "A. Šporar", "Slovenia", "ST"],
    ["Sven Botman", "S. Botman", "Netherlands", "CB"],
    ["Dávid Strelec", "D. Strelec", "Slovakia", "ST"],
    ["Joachim Andersen", "J. Andersen", "Denmark", "CB"],
    ["Guilherme Arana", "G. Arana", "Brazil", "LB"],
    ["Curtis Jones", "C. Jones", "England", "CM"],
    ["Aaron Ramsey", "A. Ramsey", "Wales", "CM"],
    ["Rafa Silva", "R. Silva", "Portugal", "CAM"],
    ["Hugo Larsson", "H. Larsson", "Sweden", "CM"],
    ["Remo Freuler", "R. Freuler", "Switzerland", "CM"],
    ["Reo Hatate", "R. Hatate", "Japan", "CM"],
    ["Mikkel Damsgaard", "M. Damsgaard", "Denmark", "LW"],
    ["Johnny Cardoso", "J. Cardoso", "USA", "CDM"],
    ["Oumar Solet", "O. Solet", "France", "CB"],
    ["Jackson Irvine", "J. Irvine", "Australia", "CM"],
    ["Fotis Ioannidis", "F. Ioannidis", "Greece", "ST"],
    ["Denis Zakaria", "D. Zakaria", "Switzerland", "CDM"],
    ["Saleh Al-Shehri", "S. Al-Shehri", "Saudi Arabia", "ST"],
    ["Michail Antonio", "M. Antonio", "Jamaica", "ST"],
    ["Budu Zivzivadze", "B. Zivzivadze", "Georgia", "ST"],
    ["Domenico Berardi", "D. Berardi", "Italy", "RW"],
    ["Mats Wieffer", "M. Wieffer", "Netherlands", "CDM"],
    ["Matty Cash", "M. Cash", "Poland", "RB"],
    ["Jørgen Strand Larsen", "J. Larsen", "Norway", "ST"],
    ["Johan Bakayoko", "J. Bakayoko", "Belgium", "RW"],
    ["Óscar Mingueza", "Ó. Mingueza", "Spain", "RB"],
    ["Claudio Bravo", "C. Bravo", "Chile", "GK"],
    ["Elliot Anderson", "E. Anderson", "England", "CM"],
    ["Florinel Coman", "F. Coman", "Romania", "LW"],
    ["Cesare Casadei", "C. Casadei", "Italy", "CM"],
    ["Ridle Baku", "R. Baku", "Germany", "RB"],
    ["Chris Wood", "C. Wood", "New Zealand", "ST"],
    ["Ivan Provedel", "I. Provedel", "Italy", "GK"],
    ["Barış Alper Yılmaz", "B. Yılmaz", "Turkey", "RW"],
    ["Jonathan Burkardt", "J. Burkardt", "Germany", "ST"],
    ["Miles Robinson", "M. Robinson", "USA", "CB"],
    ["Kasper Dolberg", "K. Dolberg", "Denmark", "ST"],
    ["Ivan Ilić", "I. Ilić", "Serbia", "CM"],
    ["Jobe Bellingham", "J. Bellingham", "England", "CM"],
    ["Roony Bardghji", "R. Bardghji", "Sweden", "RW"],
    ["Aaron Wan-Bissaka", "A. Wan-Bissaka", "England", "RB"],
    ["Lewis Hall", "L. Hall", "England", "LB"],
    ["Samuele Ricci", "S. Ricci", "Italy", "CDM"],
    ["Alistair Johnston", "A. Johnston", "Canada", "RB"],
    ["Yan Couto", "Y. Couto", "Brazil", "RB"],
    ["Ivan Schranz", "I. Schranz", "Slovakia", "RW"],
    ["Salih Özcan", "S. Özcan", "Turkey", "CDM"],
    ["Ardon Jashari", "A. Jashari", "Switzerland", "CDM"],
    ["Jakub Kamiński", "J. Kamiński", "Poland", "LW"],
    ["Dominic Calvert-Lewin", "D. Calvert-Lewin", "England", "ST"],
    ["Joselu", "Joselu", "Spain", "ST"],
    ["Zeki Çelik", "Z. Çelik", "Turkey", "RB"],
    ["Quinten Timber", "Q. Timber", "Netherlands", "CM"],
    ["Zion Suzuki", "Z. Suzuki", "Japan", "GK"],
    ["Romain Saïss", "R. Saïss", "Morocco", "CB"],
    ["Nicolae Stanciu", "N. Stanciu", "Romania", "CAM"],
    ["John McGinn", "J. McGinn", "Scotland", "CM"],
    ["Artem Dovbyk", "A. Dovbyk", "Ukraine", "ST"],
    ["Ádám Nagy", "Á. Nagy", "Hungary", "CDM"],
    ["Jarell Quansah", "J. Quansah", "England", "CB"],
    ["Arturo Vidal", "A. Vidal", "Chile", "CM"],
    ["Danny Welbeck", "D. Welbeck", "England", "ST"],
    ["Facundo Torres", "F. Torres", "Uruguay", "RW"],
    ["Raphael Veiga", "R. Veiga", "Brazil", "CAM"],
    ["Miguel Gutiérrez", "M. Gutiérrez", "Spain", "LB"],
    ["Mohamed Elyounoussi", "M. Elyounoussi", "Norway", "LW"],
    ["Ayman Yahya", "A. Yahya", "Saudi Arabia", "LW"],
    ["Camilo Vargas", "C. Vargas", "Colombia", "GK"],
    ["Rayan Aït-Nouri", "R. Aït-Nouri", "Algeria", "LB"],
    ["Saša Lukić", "S. Lukić", "Serbia", "CM"],
    ["Ben Davies", "B. Davies", "Wales", "CB"],
    ["Ismaël Bennacer", "I. Bennacer", "Algeria", "CM"],
    ["Ricardo Horta", "R. Horta", "Portugal", "LW"],
    ["Ali Al-Bulaihi", "A. Al-Bulaihi", "Saudi Arabia", "CB"],
    ["Georges Mikautadze", "G. Mikautadze", "Georgia", "ST"],
    ["Matías Soulé", "M. Soulé", "Argentina", "RW"],
    ["Salem Al-Dawsari", "S. Al-Dawsari", "Saudi Arabia", "LW"],
    ["Daizen Maeda", "D. Maeda", "Japan", "LW"],
    ["Kevin Schade", "K. Schade", "Germany", "RW"],
    ["Henry Martín", "H. Martín", "Mexico", "ST"],
    ["Tim Ream", "T. Ream", "USA", "CB"],
    ["Yussuf Poulsen", "Y. Poulsen", "Denmark", "ST"],
    ["Leonardo Balerdi", "L. Balerdi", "Argentina", "CB"],
    ["Nico Elvedi", "N. Elvedi", "Switzerland", "CB"],
    ["George Pușcaș", "G. Pușcaș", "Romania", "ST"],
    ["Jarrod Bowen", "J. Bowen", "England", "RW"],
    ["Can Uzun", "C. Uzun", "Turkey", "CAM"],
    ["Thomas Meunier", "T. Meunier", "Belgium", "RB"],
    ["Tosin Adarabioyo", "T. Adarabioyo", "England", "CB"],
    ["Ruben Vargas", "R. Vargas", "Switzerland", "LW"],
    ["Boulaye Dia", "B. Dia", "Senegal", "ST"],
    ["Victor Kristiansen", "V. Kristiansen", "Denmark", "LB"],
    ["Darío Osorio", "D. Osorio", "Chile", "LW"],
    ["Illia Zabarnyi", "I. Zabarnyi", "Ukraine", "CB"],
    ["Barnabás Varga", "B. Varga", "Hungary", "ST"],
    ["Saud Abdulhamid", "S. Abdulhamid", "Saudi Arabia", "RB"],
    ["Nélson Semedo", "N. Semedo", "Portugal", "RB"],
    ["Arthur Theate", "A. Theate", "Belgium", "CB"],
    ["Morgan Rogers", "M. Rogers", "England", "CAM"],
    ["Valentín Carboni", "V. Carboni", "Argentina", "CAM"],
    ["Angel Gomes", "A. Gomes", "England", "CM"],
    ["Hans Vanaken", "H. Vanaken", "Belgium", "CAM"],
    ["Guillermo Ochoa", "G. Ochoa", "Mexico", "GK"],
    ["Gerónimo Rulli", "G. Rulli", "Argentina", "GK"],
    ["Nordi Mukiele", "N. Mukiele", "France", "RB"],
    ["Ko Itakura", "K. Itakura", "Japan", "CB"],
    ["Diego Carlos", "D. Carlos", "Brazil", "CB"],
    ["Sacha Boey", "S. Boey", "France", "RB"],
    ["Claudio Echeverri", "C. Echeverri", "Argentina", "CAM"],
    ["Gustav Isaksen", "G. Isaksen", "Denmark", "RW"],
    ["Duje Ćaleta-Car", "D. Ćaleta-Car", "Croatia", "CB"],
    ["Facundo Medina", "F. Medina", "Argentina", "CB"],
    ["Calvin Bassey", "C. Bassey", "Nigeria", "CB"],
    ["Ayoub El Kaabi", "A. El Kaabi", "Morocco", "ST"],
    ["Bendegúz Bolla", "B. Bolla", "Hungary", "RB"],
    ["Kyogo Furuhashi", "K. Furuhashi", "Japan", "ST"],
    ["Alphonse Areola", "A. Areola", "France", "GK"],
    ["Firas Al-Buraikan", "F. Al-Buraikan", "Saudi Arabia", "ST"],
    ["Musab Al-Juwayr", "M. Al-Juwayr", "Saudi Arabia", "CM"],
    ["Chris Richards", "C. Richards", "USA", "CB"],
    ["Jorrel Hato", "J. Hato", "Netherlands", "CB"],
    ["Zack Steffen", "Z. Steffen", "USA", "GK"],
    ["Mykhailo Mudryk", "M. Mudryk", "Ukraine", "LW"],
    ["Krzysztof Piątek", "K. Piątek", "Poland", "ST"],
    ["Sultan Al-Ghannam", "S. Al-Ghannam", "Saudi Arabia", "RB"],
    ["Patrick Berg", "P. Berg", "Norway", "CDM"],
    ["Marius Marin", "M. Marin", "Romania", "CDM"],
    ["Christian Eriksen", "C. Eriksen", "Denmark", "CAM"],
    ["Ramy Bensebaini", "R. Bensebaini", "Algeria", "LB"],
    ["Michy Batshuayi", "M. Batshuayi", "Belgium", "ST"],
    ["Iván Fresneda", "I. Fresneda", "Spain", "RB"],
    ["Julián Quiñones", "J. Quiñones", "Mexico", "ST"],
    ["Houssem Aouar", "H. Aouar", "Algeria", "CAM"],
    ["Ben Chilwell", "B. Chilwell", "England", "LB"],
    ["Baghdad Bounedjah", "B. Bounedjah", "Algeria", "ST"],
    ["Roman Yaremchuk", "R. Yaremchuk", "Ukraine", "ST"],
    ["Sebastian Szymański", "S. Szymański", "Poland", "CAM"],
    ["Kasper Schmeichel", "K. Schmeichel", "Denmark", "GK"],
    ["Boubacar Kamara", "B. Kamara", "France", "CDM"],
    ["Robin Olsen", "R. Olsen", "Sweden", "GK"],
    ["Archie Gray", "A. Gray", "England", "CDM"],
    ["Semih Kılıçsoy", "S. Kılıçsoy", "Turkey", "ST"],
    ["Gianluca Mancini", "G. Mancini", "Italy", "CB"],
    ["Carlos Augusto", "C. Augusto", "Brazil", "LB"],
    ["Philipp Lienhart", "P. Lienhart", "Austria", "CB"],
    ["Lorenzo Insigne", "L. Insigne", "Italy", "LW"],
    ["Noah Okafor", "N. Okafor", "Switzerland", "LW"],
    ["Nico Paz", "N. Paz", "Argentina", "CAM"],
    ["Tyrick Mitchell", "T. Mitchell", "England", "LB"]
  ], REAL_PLAYERS_WAVE3 = [
    ["João Neves Jr", "J. Jr", "Portugal", "CM"],
    ["Bruno Zuculini", "B. Zuculini", "Argentina", "CM"],
    ["Steven Berghuis Jr", "S. Jr", "Netherlands", "RW"],
    ["Lucas Beltrán Jr", "L. Jr", "Argentina", "ST"],
    ["Mohamed Dräger", "M. Dräger", "Tunisia", "RB"],
    ["Nabil Fekir Jr", "N. Jr", "France", "CAM"],
    ["Ali Al-Bulaihi Jr", "A. Jr", "Saudi Arabia", "CB"],
    ["Georges-Kévin Nkoudou", "G. Nkoudou", "Cameroon", "LW"],
    ["Dodô Silva", "D. Silva", "Brazil", "RB"],
    ["Riyad Mahrez Jr", "R. Jr", "Algeria", "RW"],
    ["Ritsu Doan Jr", "R. Jr", "Japan", "RW"],
    ["Joel Matip Jr", "J. Jr", "Cameroon", "CB"],
    ["Aaron Boupendza", "A. Boupendza", "Gabon", "ST"],
    ["Brad Stuver", "B. Stuver", "USA", "GK"],
    ["Marcelo Vieira", "M. Vieira", "Brazil", "LB"],
    ["Esequiel Barco", "E. Barco", "Argentina", "LW"],
    ["Battaglia Rodrigo", "B. Rodrigo", "Argentina", "CDM"],
    ["Stephen Eustáquio Jr", "S. Jr", "Canada", "CM"],
    ["Billy Gilmour Jr", "B. Jr", "Scotland", "CM"],
    ["Silas Katompa", "S. Katompa", "DR Congo", "RW"],
    ["Dean Henderson Jr", "D. Jr", "England", "GK"],
    ["Noah Okafor Jr", "N. Jr", "Switzerland", "LW"],
    ["Al Musrati", "A. Musrati", "Libya", "CDM"],
    ["Ali Maâloul", "A. Maâloul", "Tunisia", "LB"],
    ["Raphael Varane Jr", "R. Jr", "France", "CB"],
    ["Fredrik Aursnes Jr", "F. Jr", "Norway", "CM"],
    ["Flaco López", "F. López", "Argentina", "ST"],
    ["Ilias Akhomach", "I. Akhomach", "Morocco", "RW"],
    ["Paulo Oliveira", "P. Oliveira", "Portugal", "CB"],
    ["Roger Fernandes", "R. Fernandes", "Guinea-Bissau", "LW"],
    ["Gautier Larsonneur", "G. Larsonneur", "France", "GK"],
    ["Kevin Zeroli", "K. Zeroli", "Italy", "CM"],
    ["Lee Jae-sung", "L. Jae-sung", "South Korea", "CAM"],
    ["Andrés Herrera", "A. Herrera", "Argentina", "RB"],
    ["Endrick Moreira", "E. Moreira", "Brazil", "ST"],
    ["André Horta", "A. Horta", "Portugal", "CM"],
    ["Filip Jørgensen Jr", "F. Jr", "Denmark", "GK"],
    ["Éderson José", "É. José", "Brazil", "CM"],
    ["Morten Hjulmand Jr", "M. Jr", "Denmark", "CDM"],
    ["Antonio Rüdiger Jr", "A. Jr", "Germany", "CB"],
    ["Iñigo Martínez Jr", "I. Jr", "Spain", "CB"],
    ["Thomas Beelen", "T. Beelen", "Netherlands", "CB"],
    ["Mory Diaw Jr", "M. Jr", "Senegal", "GK"],
    ["Enzo Fernández Jr", "E. Jr", "Argentina", "CM"],
    ["Elliot Anderson Jr", "E. Jr", "Scotland", "CM"],
    ["Krépin Diatta Jr", "K. Jr", "Senegal", "RW"],
    ["Beñat Turrientes", "B. Turrientes", "Spain", "CM"],
    ["Rossi", "Rossi", "Brazil", "GK"],
    ["Willy Kambwala", "W. Kambwala", "France", "CB"],
    ["Alessio Romagnoli", "A. Romagnoli", "Italy", "CB"],
    ["Montassar Talbi", "M. Talbi", "Tunisia", "CB"],
    ["Marcus Edwards", "M. Edwards", "England", "RW"],
    ["Johan Bakayoko Jr", "J. Jr", "Belgium", "RW"],
    ["Fodé Ballo-Touré Jr", "F. Jr", "Senegal", "LB"],
    ["M'Bala Nzola", "M. Nzola", "Angola", "ST"],
    ["Dominic Calvert-Lewin Jr", "D. Jr", "England", "ST"],
    ["Mario Pašalić Jr", "M. Jr", "Croatia", "CM"],
    ["David Neres Jr", "D. Jr", "Brazil", "RW"],
    ["Trincão Francisco", "T. Francisco", "Portugal", "RW"],
    ["Benjamin Henrichs Jr", "B. Jr", "Germany", "RB"],
    ["Thomas Müller Jr", "T. Jr", "Germany", "CAM"],
    ["Abdoulaye Doucouré", "A. Doucouré", "Mali", "CM"],
    ["Radu Dragusin Jr", "R. Jr", "Romania", "CB"],
    ["Mohamed Sherif", "M. Sherif", "Egypt", "ST"],
    ["Hussein Al-Shuwaish", "H. Al-Shuwaish", "Saudi Arabia", "CB"],
    ["Juan Miranda", "J. Miranda", "Spain", "LB"],
    ["Mikkel Damsgaard Jr", "M. Jr", "Denmark", "CAM"],
    ["Brais Méndez Jr", "B. Jr", "Spain", "CAM"],
    ["Igor Jesus Jr", "I. Jr", "Brazil", "ST"],
    ["Angelo Fulgini", "A. Fulgini", "France", "CAM"],
    ["DeAndre Yedlin Jr", "D. Jr", "USA", "RB"],
    ["Ayase Ueda Jr", "A. Jr", "Japan", "ST"],
    ["Waldemar Anton Jr", "W. Jr", "Germany", "CB"],
    ["Lewis Dunk Jr", "L. Jr", "England", "CB"],
    ["Jan Bednarek Jr", "J. Jr", "Poland", "CB"],
    ["Youssef El-Arabi", "Y. El-Arabi", "Morocco", "ST"],
    ["Sead Kolašinac Jr", "S. Jr", "Bosnia and Herzegovina", "CB"],
    ["Hidemasa Morita Jr", "H. Jr", "Japan", "CM"],
    ["Ian Maatsen Jr", "I. Jr", "Netherlands", "LB"],
    ["Tuta Silva", "T. Silva", "Brazil", "CB"],
    ["Frank Anguissa Jr", "F. Jr", "Cameroon", "CM"],
    ["Sofiane Boufal", "S. Boufal", "Morocco", "LW"],
    ["Jeong Woo-yeong", "J. Woo-yeong", "South Korea", "RW"],
    ["Kelechi Iheanacho Jr", "K. Jr", "Nigeria", "ST"],
    ["José Sá", "J. Sá", "Portugal", "GK"],
    ["Nestory Irankunda Jr", "N. Jr", "Australia", "RW"],
    ["Tarik Tissoudali", "T. Tissoudali", "Morocco", "ST"],
    ["Jan Paul van Hecke Jr", "J. Paul van Hecke Jr", "Netherlands", "CB"],
    ["Ashley Phillips", "A. Phillips", "England", "CB"],
    ["Adrien Thomasson", "A. Thomasson", "France", "CAM"],
    ["Son Heung-min Jr", "S. Jr", "South Korea", "LW"],
    ["Roman Yaremchuk Jr", "R. Jr", "Ukraine", "ST"],
    ["Guillermo Ochoa Jr", "G. Jr", "Mexico", "GK"],
    ["Seko Fofana Jr", "S. Jr", "Ivory Coast", "CM"],
    ["Sardar Azmoun Jr", "S. Jr", "Iran", "ST"],
    ["Thiago Santos Silva", "T. Silva", "Brazil", "CDM"],
    ["Orkun Kökçü Jr", "O. Jr", "Turkey", "CM"],
    ["Niklas Süle Jr", "N. Jr", "Germany", "CB"],
    ["Rico Henry", "R. Henry", "England", "LB"],
    ["Hugo Duro", "H. Duro", "Spain", "ST"],
    ["Yoane Wissa", "Y. Wissa", "DR Congo", "ST"],
    ["Kepa Arrizabalaga Jr", "K. Jr", "Spain", "GK"],
    ["Nicolás Tagliafico Jr", "N. Jr", "Argentina", "LB"],
    ["Oliver Christensen", "O. Christensen", "Denmark", "GK"],
    ["Angelo Gabriel", "A. Gabriel", "Brazil", "RW"],
    ["Francis Uzoho", "F. Uzoho", "Nigeria", "GK"],
    ["Daichi Kamada Jr", "D. Jr", "Japan", "CAM"],
    ["Alessandro Bastoni Jr", "A. Jr", "Italy", "CB"],
    ["Emiliano Rigoni", "E. Rigoni", "Argentina", "RW"],
    ["Renato Augusto", "R. Augusto", "Brazil", "CAM"],
    ["Pity Martínez", "P. Martínez", "Argentina", "CAM"],
    ["Paulo Dybala Jr", "P. Jr", "Argentina", "CAM"],
    ["Matt Targett", "M. Targett", "England", "LB"],
    ["Renato Sanches", "R. Sanches", "Portugal", "CM"],
    ["Philipp Lienhart Jr", "P. Jr", "Austria", "CB"],
    ["Hugo Lloris", "H. Lloris", "France", "GK"],
    ["Pedro Neto Jr", "P. Jr", "Portugal", "RW"],
    ["Wojciech Szczęsny Jr", "W. Jr", "Poland", "GK"],
    ["Yahia Fofana", "Y. Fofana", "Ivory Coast", "GK"],
    ["Alban Lafont Jr", "A. Jr", "France", "GK"],
    ["Steve Mandanda", "S. Mandanda", "France", "GK"],
    ["Cássio Ramos", "C. Ramos", "Brazil", "GK"],
    ["Abdou Diallo Jr", "A. Jr", "Senegal", "CB"],
    ["Wissam Ben Yedder Jr", "W. Ben Yedder Jr", "France", "ST"],
    ["Ben Godfrey", "B. Godfrey", "England", "CB"],
    ["Alex Telles", "A. Telles", "Brazil", "LB"],
    ["Sébastien Haller Jr", "S. Jr", "Ivory Coast", "ST"],
    ["Salis Abdul Samed Jr", "S. Jr", "Ghana", "CDM"],
    ["Milton Casco", "M. Casco", "Argentina", "LB"],
    ["Arkadiusz Milik Jr", "A. Jr", "Poland", "ST"],
    ["Rúben Neves Jr", "R. Jr", "Portugal", "CM"],
    ["Marcelo Weigandt", "M. Weigandt", "Argentina", "RB"],
    ["Federico Chiesa Jr", "F. Jr", "Italy", "LW"],
    ["Guus Til", "G. Til", "Netherlands", "CAM"],
    ["Malick Fofana", "M. Fofana", "Belgium", "LW"],
    ["Facundo Buonanotte Jr", "F. Jr", "Argentina", "CAM"],
    ["Lucas Digne Jr", "L. Jr", "France", "LB"],
    ["Lewis Hall Jr", "L. Jr", "England", "LB"],
    ["Felipe Anderson", "F. Anderson", "Brazil", "RW"],
    ["Merlin Röhl", "M. Röhl", "Germany", "CM"],
    ["James McConnell", "J. McConnell", "England", "CM"],
    ["Désiré Doué Jr", "D. Jr", "France", "RW"],
    ["Giovanni Di Lorenzo Jr", "G. Di Lorenzo Jr", "Italy", "RB"],
    ["Kurt Zouma", "K. Zouma", "France", "CB"],
    ["Adrià Pedrosa", "A. Pedrosa", "Spain", "LB"],
    ["Nicolò Fagioli Jr", "N. Jr", "Italy", "CM"],
    ["Vicente Guaita", "V. Guaita", "Spain", "GK"],
    ["Malo Gusto Jr", "M. Jr", "France", "RB"],
    ["Oliver Baumann Jr", "O. Jr", "Germany", "GK"],
    ["Florian Grillitsch", "F. Grillitsch", "Austria", "CDM"],
    ["Calleri Jonathan", "C. Jonathan", "Argentina", "ST"],
    ["Ignacio Fernández", "I. Fernández", "Argentina", "CAM"],
    ["Guillermo Fernández", "G. Fernández", "Argentina", "CM"],
    ["Johan Vásquez Jr", "J. Jr", "Mexico", "CB"],
    ["Pietro Terracciano", "P. Terracciano", "Italy", "GK"],
    ["Divock Origi", "D. Origi", "Belgium", "ST"],
    ["Jorn Berkhout", "J. Berkhout", "Netherlands", "GK"],
    ["Ivan Rakitić", "I. Rakitić", "Croatia", "CM"],
    ["Antonín Barák Jr", "A. Jr", "Czech Republic", "CAM"],
    ["Ander Barrenetxea", "A. Barrenetxea", "Spain", "LW"],
    ["Horațiu Moldovan Jr", "H. Jr", "Romania", "GK"],
    ["John Stones Jr", "J. Jr", "England", "CB"],
    ["Amine Gouiri Jr", "A. Jr", "Algeria", "ST"],
    ["João Moutinho", "J. Moutinho", "Portugal", "CM"],
    ["Arana Guilherme", "A. Guilherme", "Brazil", "LB"],
    ["Tom Lawrence", "T. Lawrence", "Wales", "LW"],
    ["Diant Ramaj", "D. Ramaj", "Kosovo", "GK"],
    ["Maxwel Cornet", "M. Cornet", "Ivory Coast", "LW"],
    ["Semi Ajayi", "S. Ajayi", "Nigeria", "CB"],
    ["Anthony Lopes", "A. Lopes", "Portugal", "GK"],
    ["Ivor Pandur", "I. Pandur", "Croatia", "GK"],
    ["Noah Atubolu Jr", "N. Jr", "Germany", "GK"],
    ["Samuel Chukwueze Jr", "S. Jr", "Nigeria", "RW"],
    ["Benjamin Šeško Jr", "B. Jr", "Slovenia", "ST"],
    ["Marko Dmitrović", "M. Dmitrović", "Serbia", "GK"],
    ["Lucas Chevalier Jr", "L. Jr", "France", "GK"],
    ["Armel Bella-Kotchap", "A. Bella-Kotchap", "Germany", "CB"],
    ["Daniel Muñoz Jr", "D. Jr", "Colombia", "RB"],
    ["Alan Velasco", "A. Velasco", "Argentina", "LW"],
    ["Jadon Sancho Jr", "J. Jr", "England", "LW"],
    ["Connor Goldson", "C. Goldson", "England", "CB"],
    ["Hassan Tambakti Jr", "H. Jr", "Saudi Arabia", "CB"],
    ["Przemysław Frankowski Jr", "P. Jr", "Poland", "RB"],
    ["Sebastián Coates", "S. Coates", "Uruguay", "CB"],
    ["Angelo Stiller Jr", "A. Jr", "Germany", "CM"],
    ["Alexandre Lacazette Jr", "A. Jr", "France", "ST"],
    ["Martin Dubravka Jr", "M. Jr", "Slovakia", "GK"],
    ["Jordan Henderson Jr", "J. Jr", "England", "CM"],
    ["Deivid Washington", "D. Washington", "Brazil", "ST"],
    ["Denis Bouanga", "D. Bouanga", "Gabon", "LW"],
    ["Luis Suárez Charris", "L. Charris", "Colombia", "ST"],
    ["Matheus Reis", "M. Reis", "Brazil", "LB"],
    ["Stefan Bajčetić", "S. Bajčetić", "Spain", "CDM"],
    ["Hugo Souza", "H. Souza", "Brazil", "GK"],
    ["Marvin Ducksch", "M. Ducksch", "Germany", "ST"],
    ["Sultan Al-Ghannam Jr", "S. Jr", "Saudi Arabia", "RB"],
    ["Facundo Pellistri Jr", "F. Jr", "Uruguay", "RW"],
    ["Ben Davies Jr", "B. Jr", "Wales", "LB"],
    ["Pablo Barrios Jr", "P. Jr", "Spain", "CM"],
    ["Jack Butland", "J. Butland", "England", "GK"],
    ["Kudus Mohammed", "K. Mohammed", "Ghana", "CAM"],
    ["Odilon Kossounou Jr", "O. Jr", "Ivory Coast", "CB"],
    ["Luis Palma", "L. Palma", "Honduras", "LW"],
    ["Mark McKenzie", "M. McKenzie", "USA", "CB"],
    ["Vanderson Silva", "V. Silva", "Brazil", "RB"],
    ["Gregor Kobel Jr", "G. Jr", "Switzerland", "GK"],
    ["Takehiro Tomiyasu Jr", "T. Jr", "Japan", "RB"],
    ["Andreas Pereira Jr", "A. Jr", "Brazil", "CAM"],
    ["Bright Osayi-Samuel", "B. Osayi-Samuel", "Nigeria", "RB"],
    ["Walker Zimmerman Jr", "W. Jr", "USA", "CB"],
    ["Igor Thiago", "I. Thiago", "Brazil", "ST"],
    ["Philipp Köhn Jr", "P. Jr", "Switzerland", "GK"],
    ["Jesús Vallejo", "J. Vallejo", "Spain", "CB"],
    ["Tiago Santos", "T. Santos", "Portugal", "RB"],
    ["Yeimar Gómez", "Y. Gómez", "Colombia", "CB"],
    ["Fran Pérez", "F. Pérez", "Spain", "RW"],
    ["Sultan Al-Deayea", "S. Al-Deayea", "Saudi Arabia", "GK"],
    ["Dwight McNeil", "D. McNeil", "England", "LW"],
    ["Davide Calabria", "D. Calabria", "Italy", "RB"],
    ["Kenneth Omeruo", "K. Omeruo", "Nigeria", "CB"],
    ["Victor Osimhen Jr", "V. Jr", "Nigeria", "ST"],
    ["Azzedine Ounahi Jr", "A. Jr", "Morocco", "CM"],
    ["Janis Blaswich Jr", "J. Jr", "Germany", "GK"],
    ["Julian Weigl", "J. Weigl", "Germany", "CDM"],
    ["Nicolás Tagliafico", "N. Tagliafico", "Argentina", "LB"],
    ["Tomás Avilés", "T. Avilés", "Argentina", "CB"],
    ["Yeremy Pino Jr", "Y. Jr", "Spain", "RW"],
    ["Yacine Adli", "Y. Adli", "France", "CM"],
    ["Tosin Adarabioyo Jr", "T. Jr", "England", "CB"],
    ["Kim Young-gwon", "K. Young-gwon", "South Korea", "CB"],
    ["Calvin Stengs", "C. Stengs", "Netherlands", "CAM"],
    ["Arthur Theate Jr", "A. Jr", "Belgium", "CB"],
    ["Kristjan Asllani Jr", "K. Jr", "Albania", "CDM"],
    ["Nouhou Tolo", "N. Tolo", "Cameroon", "LB"],
    ["Hany Mukhtar", "H. Mukhtar", "Germany", "CAM"],
    ["Lionel Messi Jr", "L. Jr", "Argentina", "RW"],
    ["Joe Willock", "J. Willock", "England", "CM"],
    ["Gastón Ávila", "G. Ávila", "Argentina", "CB"],
    ["Raphinha Dias", "R. Dias", "Brazil", "RW"],
    ["Wout Weghorst Jr", "W. Jr", "Netherlands", "ST"],
    ["Oihan Sancet Jr", "O. Jr", "Spain", "CAM"],
    ["Matías Kranevitter", "M. Kranevitter", "Argentina", "CDM"],
    ["Luca Langoni", "L. Langoni", "Argentina", "RW"],
    ["Matz Sels Jr", "M. Jr", "Belgium", "GK"],
    ["Edson Álvarez Jr", "E. Jr", "Mexico", "CDM"],
    ["Diogo Dalot Jr", "D. Jr", "Portugal", "RB"],
    ["Leroy Sané Jr", "L. Jr", "Germany", "RW"],
    ["Bilal El Khannouss Jr", "B. El Khannouss Jr", "Morocco", "CAM"],
    ["Leon Balogun", "L. Balogun", "Nigeria", "CB"],
    ["Alan Varela", "A. Varela", "Argentina", "CDM"],
    ["Samuel Edozie", "S. Edozie", "England", "LW"],
    ["Anatoliy Trubin Jr", "A. Jr", "Ukraine", "GK"],
    ["Nouhou Tolo Jr", "N. Jr", "Cameroon", "LB"],
    ["Anton Stach", "A. Stach", "Germany", "CM"],
    ["Cristián Borja", "C. Borja", "Colombia", "LB"],
    ["Sam Vines", "S. Vines", "USA", "LB"],
    ["Nick Olij Jr", "N. Jr", "Netherlands", "GK"],
    ["Mads Hermansen", "M. Hermansen", "Denmark", "GK"],
    ["Hamed Traorè", "H. Traorè", "Ivory Coast", "CAM"],
    ["Kyogo Furuhashi Jr", "K. Jr", "Japan", "ST"],
    ["Stanley Nwabali", "S. Nwabali", "Nigeria", "GK"],
    ["Michael Zetterer", "M. Zetterer", "Germany", "GK"],
    ["Lee Kang-in Jr", "L. Jr", "South Korea", "CAM"],
    ["John Souttar", "J. Souttar", "Scotland", "CB"],
    ["Seol Young-woo", "S. Young-woo", "South Korea", "RB"],
    ["Mayckel Lahdo", "M. Lahdo", "Sweden", "RW"],
    ["Cristiano Biraghi", "C. Biraghi", "Italy", "LB"],
    ["João Palhinha Jr", "J. Jr", "Portugal", "CDM"],
    ["Jamie Maclaren", "J. Maclaren", "Australia", "ST"],
    ["Tyler Miller", "T. Miller", "USA", "GK"],
    ["Xaver Schlager Jr", "X. Jr", "Austria", "CM"],
    ["Bernard Kamungo", "B. Kamungo", "Tanzania", "RW"],
    ["Alexsandro Ribeiro", "A. Ribeiro", "Brazil", "CB"],
    ["Lawrence Ati-Zigi", "L. Ati-Zigi", "Ghana", "GK"],
    ["Federico Dimarco Jr", "F. Jr", "Italy", "LB"],
    ["Raphael Veiga Jr", "R. Jr", "Brazil", "CAM"],
    ["Ayman Yahya Jr", "A. Jr", "Saudi Arabia", "LW"],
    ["Marius Bülter", "M. Bülter", "Germany", "LW"],
    ["Martin Boyle", "M. Boyle", "Australia", "RW"],
    ["Welington Damascena", "W. Damascena", "Brazil", "LB"],
    ["Mostafa Fathi", "M. Fathi", "Egypt", "RW"],
    ["Reda Belahyane", "R. Belahyane", "Morocco", "CDM"],
    ["Cássio", "Cássio", "Brazil", "GK"],
    ["Lucas Moura", "L. Moura", "Brazil", "RW"],
    ["Matteo Ruggeri Jr", "M. Jr", "Italy", "LB"],
    ["Nampalys Mendy Jr", "N. Jr", "Senegal", "CDM"],
    ["David Hancko Jr", "D. Jr", "Slovakia", "CB"],
    ["Youssouf Sabaly", "Y. Sabaly", "Senegal", "RB"],
    ["Cade Cowell", "C. Cowell", "USA", "LW"],
    ["Sheraldo Becker", "S. Becker", "Suriname", "ST"],
    ["Habib Diallo Jr", "H. Jr", "Senegal", "ST"],
    ["Riley McGree", "R. McGree", "Australia", "CAM"],
    ["Luca de la Torre", "L. de la Torre", "USA", "CM"],
    ["Francesco Camarda", "F. Camarda", "Italy", "ST"],
    ["Khvicha Kvaratskhelia Jr", "K. Jr", "Georgia", "LW"],
    ["Donyell Malen Jr", "D. Jr", "Netherlands", "RW"],
    ["Jhon Duran Jr", "J. Jr", "Colombia", "ST"],
    ["Unai Simón Jr", "U. Jr", "Spain", "GK"],
    ["Mário Rui", "M. Rui", "Portugal", "LB"],
    ["Youcef Belaïli", "Y. Belaïli", "Algeria", "LW"],
    ["Claudio Bravo Jr", "C. Jr", "Chile", "GK"],
    ["Rúben Dias Jr", "R. Jr", "Portugal", "CB"],
    ["Casper Tengstedt", "C. Tengstedt", "Denmark", "ST"],
    ["Matheus Cunha Jr", "M. Jr", "Brazil", "ST"],
    ["Eray Cömert", "E. Cömert", "Switzerland", "CB"],
    ["Jack Stephens", "J. Stephens", "England", "CB"],
    ["Rico Lewis Jr", "R. Jr", "England", "RB"],
    ["Prince Owusu", "P. Owusu", "Germany", "ST"],
    ["Moses Simon Jr", "M. Jr", "Nigeria", "LW"],
    ["Youssef Chermiti", "Y. Chermiti", "Portugal", "ST"],
    ["Pedro Gonçalves Jr", "P. Jr", "Portugal", "CAM"],
    ["Abdullah Al-Hamdan Jr", "A. Jr", "Saudi Arabia", "ST"],
    ["Wes Foderingham", "W. Foderingham", "England", "GK"],
    ["Rubén Blanco", "R. Blanco", "Spain", "GK"],
    ["Ibrahima Konate Jr", "I. Jr", "France", "CB"],
    ["Joe Aribo", "J. Aribo", "Nigeria", "CM"],
    ["Mikey Moore Jr", "M. Jr", "England", "LW"],
    ["Scott Carson", "S. Carson", "England", "GK"],
    ["Patrik Schick Jr", "P. Jr", "Czech Republic", "ST"],
    ["Lorenzo Pellegrini Jr", "L. Jr", "Italy", "CAM"],
    ["Veiga Raphael", "V. Raphael", "Brazil", "CAM"],
    ["Niclas Füllkrug Jr", "N. Jr", "Germany", "ST"],
    ["Caleb Wiley", "C. Wiley", "USA", "LB"],
    ["Ko Itakura Jr", "K. Jr", "Japan", "CB"],
    ["Frenkie de Jong Jr", "F. de Jong Jr", "Netherlands", "CM"],
    ["Aïssa Laïdouni", "A. Laïdouni", "Tunisia", "CM"],
    ["Lewis Koumas", "L. Koumas", "Wales", "ST"],
    ["Kevin Zenón", "K. Zenón", "Argentina", "LW"],
    ["Rúben Neves Silva", "R. Silva", "Portugal", "CM"],
    ["Santi Comesaña", "S. Comesaña", "Spain", "CM"],
    ["Christian Pulisic Jr", "C. Jr", "USA", "RW"],
    ["Cyriel Dessers Jr", "C. Jr", "Nigeria", "ST"],
    ["César Montes Jr", "C. Jr", "Mexico", "CB"],
    ["Pasquale Mazzocchi", "P. Mazzocchi", "Italy", "RB"],
    ["Duje Ćaleta-Car Jr", "D. Jr", "Croatia", "CB"],
    ["Aleksandr Golovin", "A. Golovin", "Russia", "CAM"],
    ["Ruben Loftus-Cheek Jr", "R. Jr", "England", "CM"],
    ["Carney Chukwuemeka", "C. Chukwuemeka", "England", "CM"],
    ["Suso Fernández", "S. Fernández", "Spain", "RW"],
    ["Jordan Morris", "J. Morris", "USA", "LW"],
    ["Harrison Reed", "H. Reed", "England", "CM"],
    ["Mark Travers", "M. Travers", "Ireland", "GK"],
    ["Jerdy Schouten Jr", "J. Jr", "Netherlands", "CDM"],
    ["Matvey Safonov", "M. Safonov", "Russia", "GK"],
    ["Antoine Griezmann Jr", "A. Jr", "France", "CAM"],
    ["Danilo Cataldi", "D. Cataldi", "Italy", "CDM"],
    ["José María Giménez Jr", "J. Jr", "Uruguay", "CB"],
    ["Zeki Çelik Jr", "Z. Jr", "Turkey", "RB"],
    ["Antonio Adán", "A. Adán", "Spain", "GK"],
    ["Chuba Akpom", "C. Akpom", "England", "ST"],
    ["Leandro González Pírez", "L. Pírez", "Argentina", "CB"],
    ["Marcos Acuña Jr", "M. Jr", "Argentina", "LB"],
    ["Sebastián Driussi", "S. Driussi", "Argentina", "ST"],
    ["Nicolas Jackson Jr", "N. Jr", "Senegal", "ST"],
    ["Nicolás de la Cruz Jr", "N. de la Cruz Jr", "Uruguay", "CM"],
    ["Jesús Gallardo", "J. Gallardo", "Mexico", "LB"],
    ["Formose Mendy", "F. Mendy", "Senegal", "CB"],
    ["Bryan Zaragoza", "B. Zaragoza", "Spain", "LW"],
    ["Konrad Laimer Jr", "K. Jr", "Austria", "RB"],
    ["Nasser Al-Dawsari Jr", "N. Jr", "Saudi Arabia", "CM"],
    ["Wesley Gassova", "W. Gassova", "Brazil", "LW"],
    ["Nicolas Höfler", "N. Höfler", "Germany", "CDM"],
    ["Vítor Carvalho", "V. Carvalho", "Portugal", "CM"],
    ["Niklas Stark", "N. Stark", "Germany", "CB"],
    ["Riccardo Sottil", "R. Sottil", "Italy", "LW"],
    ["João Gomes Jr", "J. Jr", "Brazil", "CM"],
    ["Ramy Bensebaini Jr", "R. Jr", "Algeria", "LB"],
    ["Angeliño", "Angeliño", "Spain", "LB"],
    ["Jens Cajuste", "J. Cajuste", "Sweden", "CM"],
    ["Lorenz Assignon", "L. Assignon", "France", "RB"],
    ["Alfred Duncan", "A. Duncan", "Ghana", "CM"],
    ["Youssoufa Moukoko", "Y. Moukoko", "Germany", "ST"],
    ["Ben Doak", "B. Doak", "Scotland", "RW"],
    ["Joe Scally", "J. Scally", "USA", "RB"],
    ["Gleison Bremer Jr", "G. Jr", "Brazil", "CB"],
    ["Filip Kostić Jr", "F. Jr", "Serbia", "LM"],
    ["Shuichi Gonda", "S. Gonda", "Japan", "GK"],
    ["Neymar Jr Santos", "N. Santos", "Brazil", "LW"],
    ["Abel Ruiz Jr", "A. Jr", "Spain", "ST"],
    ["Otávio Monteiro", "O. Monteiro", "Portugal", "CM"],
    ["Piotr Zieliński Jr", "P. Jr", "Poland", "CM"],
    ["Joël Veltman", "J. Veltman", "Netherlands", "RB"],
    ["Wayne Hennessey", "W. Hennessey", "Wales", "GK"],
    ["Trey Nyoni", "T. Nyoni", "England", "CM"],
    ["Morato Silva", "M. Silva", "Brazil", "CB"],
    ["Hwang Hee-chan Jr", "H. Jr", "South Korea", "LW"],
    ["Mohamed Abdelmonem", "M. Abdelmonem", "Egypt", "CB"],
    ["Quentin Merlin", "Q. Merlin", "France", "LB"],
    ["Florian Wirtz Jr", "F. Jr", "Germany", "CAM"],
    ["Achraf Bencharki", "A. Bencharki", "Morocco", "LW"],
    ["Yorbe Vertessen", "Y. Vertessen", "Belgium", "ST"],
    ["Alex Meret Jr", "A. Jr", "Italy", "GK"],
    ["Xande Silva", "X. Silva", "Portugal", "RW"],
    ["Yang Hyun-jun", "Y. Hyun-jun", "South Korea", "LW"],
    ["Maximilian Eggestein", "M. Eggestein", "Germany", "CM"],
    ["Érick Sánchez", "É. Sánchez", "Mexico", "CM"],
    ["Christoph Baumgartner Jr", "C. Jr", "Austria", "CAM"],
    ["Bafodé Diakité", "B. Diakité", "France", "CB"],
    ["Frank Onyeka", "F. Onyeka", "Nigeria", "CM"],
    ["Édouard Mendy", "É. Mendy", "Senegal", "GK"],
    ["Gyasi Zardes", "G. Zardes", "USA", "ST"],
    ["Baptiste Santamaria", "B. Santamaria", "France", "CDM"],
    ["Mohammed Al-Owais Jr", "M. Jr", "Saudi Arabia", "GK"],
    ["Lisandro Martinez Jr", "L. Jr", "Argentina", "CB"],
    ["Anis Ben Slimane", "A. Ben Slimane", "Tunisia", "CM"],
    ["Liam Scales", "L. Scales", "Ireland", "CB"],
    ["Fabio Miretti", "F. Miretti", "Italy", "CM"],
    ["Walter Benítez Jr", "W. Jr", "Argentina", "GK"],
    ["Darío Benedetto", "D. Benedetto", "Argentina", "ST"],
    ["Aaron Cresswell", "A. Cresswell", "England", "LB"],
    ["Umar Sadiq", "U. Sadiq", "Nigeria", "ST"],
    ["Yassine Meriah", "Y. Meriah", "Tunisia", "CB"],
    ["Takefusa Kubo Jr", "T. Jr", "Japan", "RW"],
    ["Iker Muniain", "I. Muniain", "Spain", "CAM"],
    ["Rodrigo Gomes", "R. Gomes", "Portugal", "RW"],
    ["Aleksandar Mitrović Jr", "A. Jr", "Serbia", "ST"],
    ["Steve Clark", "S. Clark", "USA", "GK"],
    ["Harry Souttar Jr", "H. Jr", "Australia", "CB"],
    ["Nicolás Otamendi Jr", "N. Jr", "Argentina", "CB"],
    ["Nicolás Valentini", "N. Valentini", "Argentina", "CB"],
    ["Giacomo Bonaventura", "G. Bonaventura", "Italy", "CAM"],
    ["Saba Lobzhanidze Jr", "S. Jr", "Georgia", "LW"],
    ["Danilo Oliveira", "D. Oliveira", "Brazil", "CM"],
    ["Elisha Owusu Jr", "E. Jr", "Ghana", "CDM"],
    ["Djordje Petrović", "D. Petrović", "Serbia", "GK"],
    ["Jamie Donley", "J. Donley", "Northern Ireland", "CAM"],
    ["Jan Oblak Jr", "J. Jr", "Slovenia", "GK"],
    ["Ilie Sánchez", "I. Sánchez", "Spain", "CDM"],
    ["Kim Jin-su", "K. Jin-su", "South Korea", "LB"],
    ["Dudu Souza", "D. Souza", "Brazil", "LW"],
    ["Willi Orbán Jr", "W. Jr", "Hungary", "CB"],
    ["Mattia Zaccagni Jr", "M. Jr", "Italy", "LW"],
    ["Marcão Teixeira", "M. Teixeira", "Brazil", "CB"],
    ["Gabriel Barbosa Jr", "G. Jr", "Brazil", "ST"],
    ["Rayan Aït-Nouri Jr", "R. Jr", "Algeria", "LB"],
    ["Timon Wellenreuther", "T. Wellenreuther", "Germany", "GK"],
    ["Calvin Ramsay", "C. Ramsay", "Scotland", "RB"],
    ["Aaron Hickey", "A. Hickey", "Scotland", "RB"],
    ["Sam Adekugbe", "S. Adekugbe", "Canada", "LB"],
    ["Miguel Borja", "M. Borja", "Colombia", "ST"],
    ["Karl Hein", "K. Hein", "Estonia", "GK"],
    ["Teun Koopmeiners Jr", "T. Jr", "Netherlands", "CM"],
    ["Jack Harrison", "J. Harrison", "England", "RW"],
    ["Tariq Hamed", "T. Hamed", "Egypt", "CDM"],
    ["Miles Robinson Jr", "M. Jr", "USA", "CB"],
    ["Chris Richards Jr", "C. Jr", "USA", "CB"],
    ["Abdulelah Al-Amri", "A. Al-Amri", "Saudi Arabia", "CB"],
    ["Alexander Ring", "A. Ring", "Finland", "CDM"],
    ["Oliver Skipp", "O. Skipp", "England", "CM"],
    ["Stuart Armstrong", "S. Armstrong", "Scotland", "CM"],
    ["Marek Rodák", "M. Rodák", "Slovakia", "GK"],
    ["Sergej Milinković-Savić Jr", "S. Jr", "Serbia", "CM"],
    ["Gustavo Gómez", "G. Gómez", "Paraguay", "CB"],
    ["Jordan Veretout", "J. Veretout", "France", "CM"],
    ["Martinelli Matheus", "M. Matheus", "Brazil", "CM"],
    ["Antoine Semenyo Jr", "A. Jr", "Ghana", "ST"],
    ["Amine Adli Jr", "A. Jr", "Morocco", "LW"],
    ["Luca Netz", "L. Netz", "Germany", "LB"],
    ["Marcos Alonso", "M. Alonso", "Spain", "LB"],
    ["Jacob Ramsey Jr", "J. Jr", "England", "CM"],
    ["Jarell Quansah Jr", "J. Jr", "England", "CB"],
    ["Edoardo Bove", "E. Bove", "Italy", "CM"],
    ["Rafael Tolói", "R. Tolói", "Italy", "CB"],
    ["Cristian Roldan", "C. Roldan", "USA", "CM"],
    ["Tim Ream Jr", "T. Jr", "USA", "CB"],
    ["Alexander Hilditch", "A. Hilditch", "England", "GK"],
    ["Paul Arriola Jr", "P. Jr", "USA", "RW"],
    ["Nacho Fernández", "N. Fernández", "Spain", "CB"],
    ["Nahuel Molina Jr", "N. Jr", "Argentina", "RB"],
    ["Ronald Araújo Jr", "R. Jr", "Uruguay", "CB"],
    ["Nicolas Raskin", "N. Raskin", "Belgium", "CM"],
    ["Callum Hudson-Odoi", "C. Hudson-Odoi", "England", "LW"],
    ["André Ramalho", "A. Ramalho", "Brazil", "CB"],
    ["Lorenzo Montipò", "L. Montipò", "Italy", "GK"],
    ["Angelo Ogbonna", "A. Ogbonna", "Italy", "CB"],
    ["Samuel Iling-Junior", "S. Iling-Junior", "England", "LW"],
    ["Franco Armani", "F. Armani", "Argentina", "GK"],
    ["Robert Andrich Jr", "R. Jr", "Germany", "CDM"],
    ["Santiago Simón", "S. Simón", "Argentina", "RM"],
    ["Dane Scarlett", "D. Scarlett", "England", "ST"],
    ["Robin Koch", "R. Koch", "Germany", "CB"],
    ["Christian Norgaard Jr", "C. Jr", "Denmark", "CDM"],
    ["Jo Hyeon-woo", "J. Hyeon-woo", "South Korea", "GK"],
    ["Christian Günter", "C. Günter", "Germany", "LB"],
    ["Fábio Cardoso", "F. Cardoso", "Portugal", "CB"],
    ["Rolando Mandragora", "R. Mandragora", "Italy", "CM"],
    ["Nathan Patterson", "N. Patterson", "Scotland", "RB"],
    ["Andrea Belotti", "A. Belotti", "Italy", "ST"],
    ["Petar Musa", "P. Musa", "Croatia", "ST"],
    ["Francisco Conceição Jr", "F. Jr", "Portugal", "RW"],
    ["Tom Cairney", "T. Cairney", "Scotland", "CM"],
    ["Felix Nmecha", "F. Nmecha", "Germany", "CM"],
    ["Luka Ivanušec Jr", "L. Jr", "Croatia", "LW"],
    ["Arboleda Robert", "A. Robert", "Ecuador", "CB"],
    ["Granit Xhaka Jr", "G. Jr", "Switzerland", "CDM"],
    ["Bryan Gil Jr", "B. Jr", "Spain", "LW"],
    ["Juan Musso Jr", "J. Jr", "Argentina", "GK"],
    ["Paulo Bernardo", "P. Bernardo", "Portugal", "CM"],
    ["Sami Al-Najei", "S. Al-Najei", "Saudi Arabia", "CM"],
    ["Julian Ryerson Jr", "J. Jr", "Norway", "RB"],
    ["Thiago Alcantara Jr", "T. Jr", "Spain", "CM"],
    ["Alexander Meyer", "A. Meyer", "Germany", "GK"],
    ["Divin Mubama", "D. Mubama", "England", "ST"],
    ["Kauã Elias", "K. Elias", "Brazil", "ST"],
    ["Calvin Bassey Jr", "C. Jr", "Nigeria", "CB"],
    ["Rodrigo Garro", "R. Garro", "Argentina", "CAM"],
    ["Sadio Mané Jr", "S. Jr", "Senegal", "LW"],
    ["Samuel Soares Jr", "S. Jr", "Portugal", "GK"],
    ["Ricardo Pepi Jr", "R. Jr", "USA", "ST"],
    ["Joelinton", "Joelinton", "Brazil", "CM"],
    ["Iñaki Williams Jr", "I. Jr", "Ghana", "RW"],
    ["Hugo Guillamón", "H. Guillamón", "Spain", "CDM"],
    ["Ellyes Skhiri Jr", "E. Jr", "Tunisia", "CDM"],
    ["Zion Suzuki Jr", "Z. Jr", "Japan", "GK"],
    ["Raphaël Guerreiro Jr", "R. Jr", "Portugal", "LB"],
    ["Ederson Silva Jr", "E. Jr", "Brazil", "GK"],
    ["Ismaël Bennacer Jr", "I. Jr", "Algeria", "CM"],
    ["Wataru Endo Jr", "W. Jr", "Japan", "CDM"],
    ["Karl Darlow", "K. Darlow", "Wales", "GK"],
    ["Breel Embolo Jr", "B. Jr", "Switzerland", "ST"],
    ["Kenny Tete", "K. Tete", "Netherlands", "RB"],
    ["Yuya Kubo", "Y. Kubo", "Japan", "CM"],
    ["Joe Gauci", "J. Gauci", "Australia", "GK"],
    ["Kelleher Jr", "K. Jr", "Ireland", "GK"],
    ["Ederson Silva", "E. Silva", "Brazil", "GK"],
    ["Mayke Rocha", "M. Rocha", "Brazil", "RB"],
    ["Benjamin André", "B. André", "France", "CDM"],
    ["Paulinho Pereira", "P. Pereira", "Brazil", "ST"],
    ["Matteo Darmian", "M. Darmian", "Italy", "RB"],
    ["Timothy Weah Jr", "T. Jr", "USA", "RB"],
    ["Joan Jordán", "J. Jordán", "Spain", "CM"],
    ["Isaac Romero", "I. Romero", "Spain", "ST"],
    ["Calum Chambers", "C. Chambers", "England", "CB"],
    ["Facundo Colidio", "F. Colidio", "Argentina", "ST"],
    ["Jackson Irvine Jr", "J. Jr", "Australia", "CM"],
    ["Pablo Solari", "P. Solari", "Argentina", "RW"],
    ["Willy Boly", "W. Boly", "Ivory Coast", "CB"],
    ["Benjamin Pavard Jr", "B. Jr", "France", "CB"],
    ["Pierre-Emile Hojbjerg Jr", "P. Jr", "Denmark", "CDM"],
    ["Leon Bailey Jr", "L. Jr", "Jamaica", "RW"],
    ["Lamine Yamal Jr", "L. Jr", "Spain", "RW"],
    ["Salem Al-Dawsari Jr", "S. Jr", "Saudi Arabia", "LW"],
    ["Ridvan Yilmaz", "R. Yilmaz", "Turkey", "LB"],
    ["Yahya Attiyat Allah", "Y. Allah", "Morocco", "LB"],
    ["Lucas Ocampos", "L. Ocampos", "Argentina", "RW"],
    ["Xavi Simons Jr", "X. Jr", "Netherlands", "CAM"],
    ["Dani Carvajal Jr", "D. Jr", "Spain", "RB"],
    ["Rabbi Matondo", "R. Matondo", "Wales", "RW"],
    ["Gianluca Mancini Jr", "G. Jr", "Italy", "CB"],
    ["Yann Sommer Jr", "Y. Jr", "Switzerland", "GK"],
    ["Amadou Onana Jr", "A. Jr", "Belgium", "CDM"],
    ["Youssef Maleh", "Y. Maleh", "Morocco", "CM"],
    ["James Tavernier", "J. Tavernier", "England", "RB"],
    ["Taiwo Awoniyi Jr", "T. Jr", "Nigeria", "ST"],
    ["Shogo Taniguchi", "S. Taniguchi", "Japan", "CB"],
    ["Romano Schmid", "R. Schmid", "Austria", "CAM"],
    ["Nemanja Matić Jr", "N. Jr", "Serbia", "CDM"],
    ["Joey Veerman Jr", "J. Jr", "Netherlands", "CM"],
    ["Agustín Marchesín", "A. Marchesín", "Argentina", "GK"],
    ["Richard Ofori", "R. Ofori", "Ghana", "GK"],
    ["Carlos Forbs", "C. Forbs", "Portugal", "RW"],
    ["Quilindschy Hartman Jr", "Q. Jr", "Netherlands", "LB"],
    ["Mory Diaw", "M. Diaw", "Senegal", "GK"],
    ["Quinten Timber Jr", "Q. Jr", "Netherlands", "CM"],
    ["Dani Parejo Jr", "D. Jr", "Spain", "CM"],
    ["Geoffrey Kondogbia", "G. Kondogbia", "Central African Republic", "CDM"],
    ["Emil Forsberg Jr", "E. Jr", "Sweden", "CAM"],
    ["Everton Cebolinha", "E. Cebolinha", "Brazil", "LW"],
    ["Mario Hermoso", "M. Hermoso", "Spain", "CB"],
    ["Iván Marcone", "I. Marcone", "Argentina", "CDM"],
    ["Kostas Tsimikas Jr", "K. Jr", "Greece", "LB"],
    ["Koki Ogawa", "K. Ogawa", "Japan", "ST"],
    ["Ike Ugbo", "I. Ugbo", "Canada", "ST"],
    ["Lesley Ugochukwu", "L. Ugochukwu", "France", "CDM"],
    ["Cho Gue-sung Jr", "C. Jr", "South Korea", "ST"],
    ["Alexander Bah", "A. Bah", "Denmark", "RB"],
    ["Ernest Poku", "E. Poku", "Netherlands", "RW"],
    ["Tyrick Mitchell Jr", "T. Jr", "England", "LB"],
    ["Vitaly Janelt", "V. Janelt", "Germany", "CM"],
    ["Luis Chávez Jr", "L. Jr", "Mexico", "CM"],
    ["Ali Gabr", "A. Gabr", "Egypt", "CB"],
    ["Marc Guéhi Jr", "M. Jr", "England", "CB"],
    ["Samuel Xavier", "S. Xavier", "Brazil", "RB"],
    ["Toby Collyer", "T. Collyer", "England", "CM"],
    ["António Silva Jr", "A. Jr", "Portugal", "CB"],
    ["Javi Guerra", "J. Guerra", "Spain", "CM"],
    ["Marco Silvestri", "M. Silvestri", "Italy", "GK"],
    ["Jean-Ricner Bellegarde", "J. Bellegarde", "France", "CM"],
    ["Sergiño Dest Jr", "S. Jr", "USA", "RB"],
    ["Nicolas Seiwald Jr", "N. Jr", "Austria", "CDM"],
    ["Pepelu", "Pepelu", "Spain", "CDM"],
    ["Henrikh Mkhitaryan Jr", "H. Jr", "Armenia", "CM"],
    ["Emerson Royal Jr", "E. Jr", "Brazil", "RB"],
    ["Ilias Chair", "I. Chair", "Morocco", "CAM"],
    ["Aurélien Tchouaméni Jr", "A. Jr", "France", "CDM"],
    ["Pervis Estupiñán Jr", "P. Jr", "Ecuador", "LB"],
    ["Marcos Llorente Jr", "M. Jr", "Spain", "RB"],
    ["Yusuf Yazıcı Jr", "Y. Jr", "Turkey", "CAM"],
    ["Anass Zaroury", "A. Zaroury", "Morocco", "LW"],
    ["Pedro de la Vega", "P. de la Vega", "Argentina", "RW"],
    ["Bobby De Cordova-Reid", "B. De Cordova-Reid", "Jamaica", "RW"],
    ["Ayrton Lucas Jr", "A. Jr", "Brazil", "LB"],
    ["Franco Israel", "F. Israel", "Uruguay", "GK"],
    ["Gerard Moreno Jr", "G. Jr", "Spain", "ST"],
    ["Armando Broja", "A. Broja", "Albania", "ST"],
    ["Takumi Minamino Jr", "T. Jr", "Japan", "CAM"],
    ["Benjamin Tahirović", "B. Tahirović", "Bosnia and Herzegovina", "CM"],
    ["Fabrício Bruno", "F. Bruno", "Brazil", "CB"],
    ["Hannibal Mejbri Jr", "H. Jr", "Tunisia", "CM"],
    ["Matt Turner Jr", "M. Jr", "USA", "GK"],
    ["Wesley Fofana Jr", "W. Jr", "France", "CB"],
    ["Moritz Nicolas", "M. Nicolas", "Germany", "GK"],
    ["Grischa Prömel", "G. Prömel", "Germany", "CM"],
    ["Alan Lescano", "A. Lescano", "Argentina", "CAM"],
    ["João Pedro Jr", "J. Jr", "Brazil", "ST"],
    ["Nicolas Kühn", "N. Kühn", "Germany", "RW"],
    ["Moussa Sissoko", "M. Sissoko", "France", "CM"],
    ["Frank Onyeka Jr", "F. Jr", "Nigeria", "CM"],
    ["Willian Pacho Jr", "W. Jr", "Ecuador", "CB"],
    ["Atakan Karazor", "A. Karazor", "Germany", "CDM"],
    ["Julio Cascante", "J. Cascante", "Costa Rica", "CB"],
    ["Ricardo Rodríguez Jr", "R. Jr", "Switzerland", "LB"],
    ["Kevin Trapp Jr", "K. Jr", "Germany", "GK"],
    ["Ludovic Blas", "L. Blas", "France", "CAM"],
    ["Evanilson Lima", "E. Lima", "Brazil", "ST"],
    ["Hattan Bahebri", "H. Bahebri", "Saudi Arabia", "RW"],
    ["Germán Pezzella Jr", "G. Jr", "Argentina", "CB"],
    ["Ionuț Radu", "I. Radu", "Romania", "GK"],
    ["Leandro Paredes Jr", "L. Jr", "Argentina", "CDM"],
    ["Emil Krafth", "E. Krafth", "Sweden", "RB"],
    ["Callum Marshall", "C. Marshall", "Northern Ireland", "ST"],
    ["Olivier Boscagli", "O. Boscagli", "France", "CB"],
    ["Kaide Gordon", "K. Gordon", "England", "RW"],
    ["Gustavo Scarpa", "G. Scarpa", "Brazil", "CAM"],
    ["Jorge Cuenca", "J. Cuenca", "Spain", "CB"],
    ["Adam Lallana", "A. Lallana", "England", "CAM"],
    ["Flynn Downes", "F. Downes", "England", "CDM"],
    ["Charles De Ketelaere Jr", "C. De Ketelaere Jr", "Belgium", "CAM"],
    ["Sean Johnson", "S. Johnson", "USA", "GK"],
    ["Andrea Belotti Jr", "A. Jr", "Italy", "ST"],
    ["Aaron Mooy", "A. Mooy", "Australia", "CM"],
    ["Hamari Traoré", "H. Traoré", "Mali", "RB"],
    ["Wellington Rato", "W. Rato", "Brazil", "RW"],
    ["Jon Gallagher", "J. Gallagher", "Ireland", "LB"],
    ["Eduardo Camavinga Jr", "E. Jr", "France", "CM"],
    ["Morgan Rogers Jr", "M. Jr", "England", "CAM"],
    ["Lucas Perri Jr", "L. Jr", "Brazil", "GK"],
    ["Weverton Pereira", "W. Pereira", "Brazil", "GK"],
    ["Daniel Ríos", "D. Ríos", "Mexico", "ST"],
    ["Enzo Le Fée", "E. Le Fée", "France", "CM"],
    ["Boulaye Dia Jr", "B. Jr", "Senegal", "ST"],
    ["Musab Al-Juwayr Jr", "M. Jr", "Saudi Arabia", "CM"],
    ["Kenan Yıldız Jr", "K. Jr", "Turkey", "LW"],
    ["Roland Sallai Jr", "R. Jr", "Hungary", "RW"],
    ["Kosta Nedeljković", "K. Nedeljković", "Serbia", "RB"],
    ["Harry Maguire Jr", "H. Jr", "England", "CB"],
    ["Neto Murara", "N. Murara", "Brazil", "GK"],
    ["Ross Barkley", "R. Barkley", "England", "CM"],
    ["Alan Franco Jr", "A. Jr", "Argentina", "CB"],
    ["Sasa Lukic Jr", "S. Jr", "Serbia", "CM"],
    ["Marten de Roon Jr", "M. de Roon Jr", "Netherlands", "CDM"],
    ["Brice Samba Jr", "B. Jr", "France", "GK"],
    ["Fabien Centonze", "F. Centonze", "France", "RB"],
    ["Vítězslav Jaroš", "V. Jaroš", "Czech Republic", "GK"],
    ["Ryan Hollingshead", "R. Hollingshead", "USA", "LB"],
    ["Josef Martínez", "J. Martínez", "Venezuela", "ST"],
    ["Tomás Araújo", "T. Araújo", "Portugal", "CB"],
    ["Obinna Nwobodo", "O. Nwobodo", "Nigeria", "CDM"],
    ["Geovany Quenda Jr", "G. Jr", "Portugal", "RW"],
    ["Danny Namaso", "D. Namaso", "England", "ST"],
    ["Farès Chaïbi Jr", "F. Jr", "Algeria", "CAM"],
    ["Kamaldeen Sulemana Jr", "K. Jr", "Ghana", "LW"],
    ["Benjamin Bourigeaud Jr", "B. Jr", "France", "CM"],
    ["Robin Zentner", "R. Zentner", "Germany", "GK"],
    ["Daniele Rugani", "D. Rugani", "Italy", "CB"],
    ["Mohamed Elneny Jr", "M. Jr", "Egypt", "CDM"],
    ["Bart Vriends", "B. Vriends", "Netherlands", "CB"],
    ["Serhiy Kryvtsov", "S. Kryvtsov", "Ukraine", "CB"],
    ["Mohamed El Shenawy", "M. El Shenawy", "Egypt", "GK"],
    ["Nawaf Boushal", "N. Boushal", "Saudi Arabia", "CB"],
    ["Joshua Kimmich Jr", "J. Jr", "Germany", "CDM"],
    ["Pepe Reina Jr", "P. Jr", "Spain", "GK"],
    ["Sergio Santos", "S. Santos", "Brazil", "ST"],
    ["Adam Marušić", "A. Marušić", "Montenegro", "RB"],
    ["Chris Führich Jr", "C. Jr", "Germany", "LW"],
    ["Jason Steele Jr", "J. Jr", "England", "GK"],
    ["Asier Illarramendi", "A. Illarramendi", "Spain", "CDM"],
    ["Tobias Lauritsen", "T. Lauritsen", "Norway", "ST"],
    ["Fábio Deivson", "F. Deivson", "Brazil", "GK"],
    ["Alistair Johnston Jr", "A. Jr", "Canada", "RB"],
    ["Drake Callender", "D. Callender", "USA", "GK"],
    ["Álex Moreno", "Á. Moreno", "Spain", "LB"],
    ["Simon Adingra Jr", "S. Jr", "Ivory Coast", "RW"],
    ["Zaidu Sanusi Jr", "Z. Jr", "Nigeria", "LB"],
    ["Max-Alain Gradel", "M. Gradel", "Ivory Coast", "LW"],
    ["Dani Olmo Jr", "D. Jr", "Spain", "CAM"],
    ["Serhou Guirassy Jr", "S. Jr", "Guinea", "ST"],
    ["Zé Rafael", "Z. Rafael", "Brazil", "CM"],
    ["Derek Cornelius", "D. Cornelius", "Canada", "CB"],
    ["Maghnes Akliouche", "M. Akliouche", "France", "RW"],
    ["Bruno Henrique", "B. Henrique", "Brazil", "LW"],
    ["Neco Williams", "N. Williams", "Wales", "RB"],
    ["Karl Toko Ekambi", "K. Ekambi", "Cameroon", "LW"],
    ["Konstantinos Mavropanos Jr", "K. Jr", "Greece", "CB"],
    ["Hugo Ekitiké Jr", "H. Jr", "France", "ST"],
    ["Collins Fai", "C. Fai", "Cameroon", "RB"],
    ["Roberto Firmino Jr", "R. Jr", "Brazil", "ST"],
    ["John Anthony Brooks", "J. Brooks", "USA", "CB"],
    ["Thiago Almada Jr", "T. Jr", "Argentina", "CAM"],
    ["Justin Njinmah", "J. Njinmah", "Germany", "ST"],
    ["Mads Roerslev", "M. Roerslev", "Denmark", "RB"],
    ["Haji Wright Jr", "H. Jr", "USA", "ST"],
    ["Raúl Ruidíaz", "R. Ruidíaz", "Peru", "ST"],
    ["Jesús Ferreira", "J. Ferreira", "USA", "ST"],
    ["Rui Silva Jr", "R. Jr", "Portugal", "GK"],
    ["Rodrigo Villagra", "R. Villagra", "Argentina", "CDM"],
    ["Cristian Medina", "C. Medina", "Argentina", "CM"],
    ["Aleksandar Pavlović Jr", "A. Jr", "Germany", "CDM"],
    ["Sofiane Feghouli", "S. Feghouli", "Algeria", "RW"],
    ["Ángel Di María Jr", "Á. Di María Jr", "Argentina", "RW"],
    ["Youssouf Fofana Jr", "Y. Jr", "France", "CDM"],
    ["Moïse Bombito Jr", "M. Jr", "Canada", "CB"],
    ["Brandon Vazquez", "B. Vazquez", "USA", "ST"],
    ["Murilo Cerqueira", "M. Cerqueira", "Brazil", "CB"],
    ["Saravia Renzo", "S. Renzo", "Argentina", "RB"],
    ["Óscar Mingueza Jr", "Ó. Jr", "Spain", "RB"],
    ["Łukasz Fabiański", "Ł. Fabiański", "Poland", "GK"],
    ["Ben Mee", "B. Mee", "England", "CB"],
    ["Ederson Moraes", "E. Moraes", "Brazil", "GK"],
    ["Borja Iglesias Jr", "B. Jr", "Spain", "ST"],
    ["Rick Karsdorp", "R. Karsdorp", "Netherlands", "RB"],
    ["Luca Pellegrini", "L. Pellegrini", "Italy", "LB"],
    ["Ramiz Zerrouki Jr", "R. Jr", "Algeria", "CDM"],
    ["Rui Patrício Jr", "R. Jr", "Portugal", "GK"],
    ["Taha Yassine Khenissi", "T. Khenissi", "Tunisia", "ST"],
    ["Pau Cubarsí Jr", "P. Jr", "Spain", "CB"],
    ["Eddie Nketiah", "E. Nketiah", "England", "ST"],
    ["Alisson Ramses", "A. Ramses", "Brazil", "GK"],
    ["Nélson Semedo Jr", "N. Jr", "Portugal", "RB"],
    ["Ian Maatsen", "I. Maatsen", "Netherlands", "LB"],
    ["Alexis Sánchez Jr", "A. Jr", "Chile", "ST"],
    ["Mark Flekken", "M. Flekken", "Netherlands", "GK"],
    ["André Trindade Jr", "A. Jr", "Brazil", "CDM"],
    ["Pape Gueye", "P. Gueye", "Senegal", "CM"],
    ["Willian José", "W. José", "Brazil", "ST"],
    ["Ulisses Garcia", "U. Garcia", "Switzerland", "LB"],
    ["Davide Zappacosta Jr", "D. Jr", "Italy", "RB"],
    ["Gavin Bazunu", "G. Bazunu", "Ireland", "GK"],
    ["Jean-Charles Castelletto", "J. Castelletto", "Cameroon", "CB"],
    ["Fagner Lemos", "F. Lemos", "Brazil", "RB"],
    ["Cláudio Ramos", "C. Ramos", "Portugal", "GK"],
    ["Callum McGregor", "C. McGregor", "Scotland", "CM"],
    ["Serge Aurier Jr", "S. Jr", "Ivory Coast", "RB"],
    ["Nicolás Fonseca", "N. Fonseca", "Uruguay", "CDM"],
    ["Talisca Anderson", "T. Anderson", "Brazil", "CAM"],
    ["Willy Boly Jr", "W. Jr", "Ivory Coast", "CB"],
    ["Fikayo Tomori Jr", "F. Jr", "England", "CB"],
    ["Alonso Junior", "A. Junior", "Brazil", "CB"],
    ["Enso González", "E. González", "Paraguay", "LW"],
    ["Mateo Kovacic Jr", "M. Jr", "Croatia", "CM"],
    ["Boubacar Kamara Jr", "B. Jr", "France", "CDM"],
    ["Reinildo Mandava Jr", "R. Jr", "Mozambique", "LB"],
    ["Ahmetcan Kaplan", "A. Kaplan", "Turkey", "CB"],
    ["Federico Valverde Jr", "F. Jr", "Uruguay", "CM"],
    ["Daizen Maeda Jr", "D. Jr", "Japan", "LW"],
    ["Giorgos Giakoumakis Jr", "G. Jr", "Greece", "ST"],
    ["Héctor Fort", "H. Fort", "Spain", "RB"],
    ["Rafinha Alcântara", "R. Alcântara", "Brazil", "RB"],
    ["Fabian Schar Jr", "F. Jr", "Switzerland", "CB"],
    ["Peter Gulácsi Jr", "P. Jr", "Hungary", "GK"],
    ["Martin Terrier", "M. Terrier", "France", "LW"],
    ["Mitchel Bakker", "M. Bakker", "Netherlands", "LB"],
    ["Elias Achouri", "E. Achouri", "Tunisia", "LW"],
    ["Mateusz Bogusz", "M. Bogusz", "Poland", "CAM"],
    ["Kevin Müller", "K. Müller", "Germany", "GK"],
    ["Ryan Jack", "R. Jack", "Scotland", "CM"],
    ["Sofyan Amrabat Jr", "S. Jr", "Morocco", "CDM"],
    ["Pedro Guilherme", "P. Guilherme", "Brazil", "ST"],
    ["Gio Reyna", "G. Reyna", "USA", "CAM"],
    ["Demarai Gray Jr", "D. Jr", "Jamaica", "LW"],
    ["Ismaily Gonçalves", "I. Gonçalves", "Brazil", "LB"],
    ["Ángel Correa Jr", "Á. Jr", "Argentina", "ST"],
    ["Federico Bernardeschi Jr", "F. Jr", "Italy", "RW"],
    ["Joe Willis", "J. Willis", "USA", "GK"],
    ["Ansgar Knauff", "A. Knauff", "Germany", "RW"],
    ["Alejandro Zendejas", "A. Zendejas", "USA", "RW"],
    ["Matty Cash Jr", "M. Jr", "Poland", "RB"],
    ["Maxence Caqueret", "M. Caqueret", "France", "CM"],
    ["Chris Wood Jr", "C. Jr", "New Zealand", "ST"],
    ["Félix Torres", "F. Torres", "Ecuador", "CB"],
    ["Luis Advíncula Jr", "L. Jr", "Peru", "RB"],
    ["Fares Chaibi", "F. Chaibi", "Algeria", "CAM"],
    ["Julián Quiñones Jr", "J. Jr", "Mexico", "ST"],
    ["Rony Rodrigues", "R. Rodrigues", "Brazil", "ST"],
    ["Petar Musa Jr", "P. Jr", "Croatia", "ST"],
    ["Álvaro Carreras", "Á. Carreras", "Spain", "LB"],
    ["DeAndre Yedlin", "D. Yedlin", "USA", "RB"],
    ["Jesurun Rak-Sakyi", "J. Rak-Sakyi", "England", "RW"],
    ["William Carvalho", "W. Carvalho", "Portugal", "CDM"],
    ["Lorran Silva", "L. Silva", "Brazil", "CAM"],
    ["Jordan Pickford Jr", "J. Jr", "England", "GK"],
    ["Ousmane Diomande", "O. Diomande", "Ivory Coast", "CB"],
    ["Sebastian Lletget", "S. Lletget", "USA", "CM"],
    ["Adrien Rabiot Jr", "A. Jr", "France", "CM"],
    ["Gonçalo Borges", "G. Borges", "Portugal", "RW"],
    ["Agustín Palavecino", "A. Palavecino", "Argentina", "CAM"],
    ["Jefferson Lerma Jr", "J. Jr", "Colombia", "CDM"],
    ["Luis Muriel", "L. Muriel", "Colombia", "ST"],
    ["Lautaro Martínez Jr", "L. Jr", "Argentina", "ST"],
    ["Mikel Merino Jr", "M. Jr", "Spain", "CM"],
    ["Everton Ribeiro Jr", "E. Jr", "Brazil", "CAM"],
    ["Koke Resurrección", "K. Resurrección", "Spain", "CM"],
    ["Natan Souza", "N. Souza", "Brazil", "CB"],
    ["Kaelan Casey", "K. Casey", "England", "CB"],
    ["Josh Sargent Jr", "J. Jr", "USA", "ST"],
    ["Jean-Philippe Mateta", "J. Mateta", "France", "ST"],
    ["Takuma Asano", "T. Asano", "Japan", "ST"],
    ["Maximilian Mittelstädt Jr", "M. Jr", "Germany", "LB"],
    ["Fábio Vieira Jr", "F. Jr", "Portugal", "CAM"],
    ["Ahmed Sayed Zizo", "A. Zizo", "Egypt", "RW"],
    ["Luka Jović Jr", "L. Jr", "Serbia", "ST"],
    ["Álvaro Morata Jr", "Á. Jr", "Spain", "ST"],
    ["Aaron Long", "A. Long", "USA", "CB"],
    ["Uriel Antuna Jr", "U. Jr", "Mexico", "RW"],
    ["Park Yong-woo", "P. Yong-woo", "South Korea", "CDM"],
    ["Benoît Badiashile Jr", "B. Jr", "France", "CB"],
    ["Vangelis Pavlidis Jr", "V. Jr", "Greece", "ST"],
    ["Aziz Behich", "A. Behich", "Australia", "LB"],
    ["Cristiano Ronaldo Jr", "C. Jr", "Portugal", "ST"],
    ["Josip Šutalo Jr", "J. Jr", "Croatia", "CB"],
    ["Lisandro López", "L. López", "Argentina", "ST"],
    ["Bernd Leno Jr", "B. Jr", "Germany", "GK"],
    ["Ismael Saibari Jr", "I. Jr", "Morocco", "CAM"],
    ["Devyne Rensch", "D. Rensch", "Netherlands", "RB"],
    ["Adam Hložek Jr", "A. Jr", "Czech Republic", "ST"],
    ["Yeray Álvarez", "Y. Álvarez", "Spain", "CB"],
    ["Karim Adeyemi Jr", "K. Jr", "Germany", "LW"],
    ["Alexis Guendouz", "A. Guendouz", "Algeria", "GK"],
    ["Osman Bukari Jr", "O. Jr", "Ghana", "RW"],
    ["Tajon Buchanan Jr", "T. Jr", "Canada", "RW"],
    ["Nayef Aguerd Jr", "N. Jr", "Morocco", "CB"],
    ["Pablo Maia", "P. Maia", "Brazil", "CDM"],
    ["Yukinari Sugawara Jr", "Y. Jr", "Japan", "RB"],
    ["Rémy Cabella", "R. Cabella", "France", "CAM"],
    ["Jonas Omlin", "J. Omlin", "Switzerland", "GK"],
    ["Rayan Cherki Jr", "R. Jr", "France", "CAM"],
    ["Jordan Morris Jr", "J. Jr", "USA", "LW"],
    ["Gerónimo Rulli Jr", "G. Jr", "Argentina", "GK"],
    ["Simon Banza", "S. Banza", "DR Congo", "ST"],
    ["Lukáš Hrádecký Jr", "L. Jr", "Finland", "GK"],
    ["Jamie Bynoe-Gittens", "J. Bynoe-Gittens", "England", "LW"],
    ["Jon Pacheco", "J. Pacheco", "Spain", "CB"],
    ["Jonathan Gradit", "J. Gradit", "France", "CB"],
    ["Gonzalo Montiel", "G. Montiel", "Argentina", "RB"],
    ["Benjamin Bourigeaud", "B. Bourigeaud", "France", "CM"],
    ["Kyle Walker-Peters Jr", "K. Jr", "England", "RB"],
    ["Miguel Almiron Jr", "M. Jr", "Paraguay", "RW"],
    ["Kye Rowles", "K. Rowles", "Australia", "CB"],
    ["Zack Steffen Jr", "Z. Jr", "USA", "GK"],
    ["Fábio Silva", "F. Silva", "Portugal", "ST"],
    ["Gonçalo Inácio Jr", "G. Jr", "Portugal", "CB"],
    ["Coco Carrasquilla", "C. Carrasquilla", "Panama", "CM"],
    ["Percy Tau", "P. Tau", "South Africa", "CAM"],
    ["Gustavo Henrique", "G. Henrique", "Brazil", "CB"],
    ["Marcos Rojo", "M. Rojo", "Argentina", "CB"],
    ["Anastasios Douvikas", "A. Douvikas", "Greece", "ST"],
    ["Harvey Barnes", "H. Barnes", "England", "LW"],
    ["Nico Elvedi Jr", "N. Jr", "Switzerland", "CB"],
    ["Turki Al-Ammar Jr", "T. Jr", "Saudi Arabia", "CAM"],
    ["Alexander Sørloth Jr", "A. Jr", "Norway", "ST"],
    ["Rodrigo Riquelme", "R. Riquelme", "Spain", "LW"],
    ["Sivert Mannsverk", "S. Mannsverk", "Norway", "CDM"],
    ["Zaracho Matías", "Z. Matías", "Argentina", "CAM"],
    ["Andy Lonergan", "A. Lonergan", "England", "GK"],
    ["Luis Guilherme", "L. Guilherme", "Brazil", "RW"],
    ["Michael Olise Jr", "M. Jr", "France", "RW"],
    ["Gabriel Brazão", "G. Brazão", "Brazil", "GK"],
    ["Dan Bentley", "D. Bentley", "England", "GK"],
    ["Lewis Dobbin", "L. Dobbin", "England", "RW"],
    ["Denis Odoi", "D. Odoi", "Ghana", "RB"],
    ["Hugo Bueno", "H. Bueno", "Spain", "LB"],
    ["Eberechi Eze Jr", "E. Jr", "England", "CAM"],
    ["Marc Casadó Jr", "M. Jr", "Spain", "CDM"],
    ["Ramón Sosa Jr", "R. Jr", "Paraguay", "LW"],
    ["Miguel Merentiel", "M. Merentiel", "Uruguay", "ST"],
    ["Altay Bayindir", "A. Bayindir", "Turkey", "GK"],
    ["Abdullah Al-Khaibari", "A. Al-Khaibari", "Saudi Arabia", "CDM"],
    ["Eric Dier", "E. Dier", "England", "CB"],
    ["Enzo Pérez", "E. Pérez", "Argentina", "CDM"],
    ["Nemanja Gudelj Jr", "N. Jr", "Serbia", "CDM"],
    ["Facundo Farías", "F. Farías", "Argentina", "RW"],
    ["Dani Ceballos Jr", "D. Jr", "Spain", "CM"],
    ["Malcom Oliveira", "M. Oliveira", "Brazil", "RW"],
    ["Reo Hatate Jr", "R. Jr", "Japan", "CM"],
    ["Oh Hyeon-gyu", "O. Hyeon-gyu", "South Korea", "ST"],
    ["Kim Seung-gyu Jr", "K. Jr", "South Korea", "GK"],
    ["Ilkay Gündogan", "I. Gündogan", "Germany", "CM"],
    ["Igor Paixão", "I. Paixão", "Brazil", "LW"],
    ["Fermín López Jr", "F. Jr", "Spain", "CM"],
    ["Sergio Reguilón Jr", "S. Jr", "Spain", "LB"],
    ["Nicolas Cozza", "N. Cozza", "France", "LB"],
    ["Jordi Alba Jr", "J. Jr", "Spain", "LB"],
    ["Karim Benzema Jr", "K. Jr", "France", "ST"],
    ["Majeed Ashimeru", "M. Ashimeru", "Ghana", "CM"],
    ["Facundo Medina Jr", "F. Jr", "Argentina", "CB"],
    ["Cédric Soares", "C. Soares", "Portugal", "RB"],
    ["Marco Reus Jr", "M. Jr", "Germany", "CAM"],
    ["Mikel Oyarzabal Jr", "M. Jr", "Spain", "LW"],
    ["Harry Toffolo", "H. Toffolo", "England", "LB"],
    ["Mohamed Camara", "M. Camara", "Mali", "CDM"],
    ["Hulk Souza", "H. Souza", "Brazil", "ST"],
    ["Erick Pulgar", "E. Pulgar", "Chile", "CDM"],
    ["Dan Gore", "D. Gore", "England", "CM"],
    ["Arnaut Danjuma Jr", "A. Jr", "Netherlands", "LW"],
    ["Henry Martín Jr", "H. Jr", "Mexico", "ST"],
    ["Pedro Rodríguez", "P. Rodríguez", "Spain", "RW"],
    ["Jemerson Nascimento", "J. Nascimento", "Brazil", "CB"],
    ["Alfonso Pedraza", "A. Pedraza", "Spain", "LB"],
    ["Barreal Alejo", "B. Alejo", "Argentina", "LW"],
    ["Robin Le Normand Jr", "R. Le Normand Jr", "Spain", "CB"],
    ["Kim Min-jae Jr", "K. Jr", "South Korea", "CB"],
    ["Lázaro Vinícius", "L. Vinícius", "Brazil", "LW"],
    ["Danny Ings", "D. Ings", "England", "ST"],
    ["Geny Catamo", "G. Catamo", "Mozambique", "RW"],
    ["Marius Wolf", "M. Wolf", "Germany", "RB"],
    ["Adrián San Miguel", "A. Miguel", "Spain", "GK"],
    ["Yuto Nagatomo", "Y. Nagatomo", "Japan", "LB"],
    ["Hans Hateboer", "H. Hateboer", "Netherlands", "RB"],
    ["Cameron Archer", "C. Archer", "England", "ST"],
    ["Matt Miazga", "M. Miazga", "USA", "CB"],
    ["Mikel Vesga", "M. Vesga", "Spain", "CDM"],
    ["Nicolò Barella Jr", "N. Jr", "Italy", "CM"],
    ["Saleh Al-Shehri Jr", "S. Jr", "Saudi Arabia", "ST"],
    ["Jarrad Branthwaite Jr", "J. Jr", "England", "CB"],
    ["Guido Rodríguez", "G. Rodríguez", "Argentina", "CDM"],
    ["Bart Verbruggen Jr", "B. Jr", "Netherlands", "GK"],
    ["João Paulo Mior", "J. Mior", "Brazil", "CDM"],
    ["Youri Tielemans Jr", "Y. Jr", "Belgium", "CM"],
    ["Wendell Nascimento", "W. Nascimento", "Brazil", "LB"],
    ["Raniele Silva", "R. Silva", "Brazil", "CDM"],
    ["Igor Julio", "I. Julio", "Brazil", "CB"],
    ["Abdulrahman Al-Aboud", "A. Al-Aboud", "Saudi Arabia", "RW"],
    ["Rui Silva", "R. Silva", "Portugal", "GK"],
    ["Olivier Deman", "O. Deman", "Belgium", "LB"],
    ["Naïm Sliti", "N. Sliti", "Tunisia", "LW"],
    ["Christos Mandas", "C. Mandas", "Greece", "GK"],
    ["Denzel Dumfries Jr", "D. Jr", "Netherlands", "RB"],
    ["Evan Ndicka Jr", "E. Jr", "Ivory Coast", "CB"],
    ["Alex Roldan", "A. Roldan", "El Salvador", "RB"],
    ["Fabrice Ondoa", "F. Ondoa", "Cameroon", "GK"],
    ["Gernot Trauner", "G. Trauner", "Austria", "CB"],
    ["Fraser Forster", "F. Forster", "England", "GK"],
    ["Manuel Riemann Jr", "M. Jr", "Germany", "GK"],
    ["Yunus Musah Jr", "Y. Jr", "USA", "CM"],
    ["Sacha Boey Jr", "S. Jr", "France", "RB"],
    ["Romelu Lukaku Jr", "R. Jr", "Belgium", "ST"],
    ["Victor Lindelöf Jr", "V. Jr", "Sweden", "CB"],
    ["Mohamed Amine Tougai", "M. Tougai", "Algeria", "CB"],
    ["Thierry Correia", "T. Correia", "Portugal", "RB"],
    ["Abdallah Sima", "A. Sima", "Senegal", "LW"],
    ["Héctor Herrera", "H. Herrera", "Mexico", "CM"],
    ["Ricardo Esgaio", "R. Esgaio", "Portugal", "RB"],
    ["Ismaïla Sarr Jr", "I. Jr", "Senegal", "RW"],
    ["Stephan El Shaarawy", "S. El Shaarawy", "Italy", "LW"],
    ["Lima Ferreira", "L. Ferreira", "Brazil", "CAM"],
    ["Diego López", "D. López", "Spain", "LW"],
    ["Stefan Ortega Moreno", "S. Moreno", "Germany", "GK"],
    ["Ramiro Funes Mori", "R. Mori", "Argentina", "CB"],
    ["Nick Olij", "N. Olij", "Netherlands", "GK"],
    ["Dean Huijsen", "D. Huijsen", "Spain", "CB"],
    ["Nicolò Rovella Jr", "N. Jr", "Italy", "CDM"],
    ["John McGinn Jr", "J. Jr", "Scotland", "CM"],
    ["Hiroki Ito Jr", "H. Jr", "Japan", "CB"],
    ["Rodrigo Aguirre", "R. Aguirre", "Uruguay", "ST"],
    ["Arthur Cabral", "A. Cabral", "Brazil", "ST"],
    ["Carlos Augusto Jr", "C. Jr", "Brazil", "LB"],
    ["Yasser Al-Shahrani Jr", "Y. Jr", "Saudi Arabia", "LB"],
    ["Isco Alarcón", "I. Alarcón", "Spain", "CAM"],
    ["Kevin Schade Jr", "K. Jr", "Germany", "LW"],
    ["Lucas Martínez Quarta", "L. Quarta", "Argentina", "CB"],
    ["Hakan Çalhanoğlu Jr", "H. Jr", "Turkey", "CDM"],
    ["João Mário Neto", "J. Neto", "Portugal", "RB"],
    ["Mats Hummels Jr", "M. Jr", "Germany", "CB"],
    ["Tyrone Mings", "T. Mings", "England", "CB"],
    ["Marcin Bulka Jr", "M. Jr", "Poland", "GK"],
    ["Guglielmo Vicario Jr", "G. Jr", "Italy", "GK"],
    ["Pol Fernández", "P. Fernández", "Argentina", "CM"],
    ["Janis Blaswich", "J. Blaswich", "Germany", "GK"],
    ["Lautaro Blanco", "L. Blanco", "Argentina", "LB"],
    ["Marco Carnesecchi Jr", "M. Jr", "Italy", "GK"],
    ["Nicolò Casale", "N. Casale", "Italy", "CB"],
    ["Kamal Miller", "K. Miller", "Canada", "CB"],
    ["Kendry Paez Jr", "K. Jr", "Ecuador", "CAM"],
    ["Edinson Cavani Jr", "E. Jr", "Uruguay", "ST"],
    ["Serge Gnabry Jr", "S. Jr", "Germany", "RW"],
    ["Cyril Ngonge", "C. Ngonge", "Belgium", "RW"],
    ["Baghdad Bounedjah Jr", "B. Jr", "Algeria", "ST"],
    ["Franco Cristaldo", "F. Cristaldo", "Argentina", "CAM"],
    ["Jorrel Hato Jr", "J. Jr", "Netherlands", "CB"],
    ["Samuel Gigot", "S. Gigot", "France", "CB"],
    ["Hwang In-beom Jr", "H. Jr", "South Korea", "CM"],
    ["Daniel Amartey Jr", "D. Jr", "Ghana", "CB"],
    ["Santiago Bueno", "S. Bueno", "Uruguay", "CB"],
    ["Piquerez Joaquín", "P. Joaquín", "Uruguay", "LB"],
    ["David Carmo", "D. Carmo", "Portugal", "CB"],
    ["Orel Mangala Jr", "O. Jr", "Belgium", "CM"],
    ["Cristhian Mosquera", "C. Mosquera", "Spain", "CB"],
    ["Franck Honorat", "F. Honorat", "France", "RW"],
    ["Ollie Watkins Jr", "O. Jr", "England", "ST"],
    ["Francesco Acerbi Jr", "F. Jr", "Italy", "CB"],
    ["Ernest Nuamah Jr", "E. Jr", "Ghana", "RW"],
    ["Amos Pieper", "A. Pieper", "Germany", "CB"],
    ["Christian Bassogog", "C. Bassogog", "Cameroon", "LW"],
    ["Ross Stewart", "R. Stewart", "Scotland", "ST"],
    ["Daniel Peretz", "D. Peretz", "Israel", "GK"],
    ["Diogo Costa Jr", "D. Jr", "Portugal", "GK"],
    ["Julián Álvarez Jr", "J. Jr", "Argentina", "ST"],
    ["Ghislain Konan", "G. Konan", "Ivory Coast", "LB"],
    ["Kevin Danso Jr", "K. Jr", "Austria", "CB"],
    ["Sékou Mara", "S. Mara", "France", "ST"],
    ["Amine Harit Jr", "A. Jr", "Morocco", "CAM"],
    ["Abdulaziz Al-Bishi", "A. Al-Bishi", "Saudi Arabia", "CDM"],
    ["Marc Guiu", "M. Guiu", "Spain", "ST"],
    ["Léo Pereira", "L. Pereira", "Brazil", "CB"],
    ["Stefan de Vrij Jr", "S. de Vrij Jr", "Netherlands", "CB"],
    ["Ao Tanaka", "A. Tanaka", "Japan", "CM"],
    ["Tomáš Čvančara", "T. Čvančara", "Czech Republic", "ST"],
    ["Dujon Sterling", "D. Sterling", "England", "RB"],
    ["Adam Masina", "A. Masina", "Morocco", "LB"],
    ["Kaoru Mitoma Jr", "K. Jr", "Japan", "LW"],
    ["Yahya Jabrane", "Y. Jabrane", "Morocco", "CDM"],
    ["Luca Orellano", "L. Orellano", "Argentina", "LW"],
    ["Marc Bernal", "M. Bernal", "Spain", "CDM"],
    ["Bruma Armindo", "B. Armindo", "Portugal", "RW"],
    ["Leo Østigård Jr", "L. Jr", "Norway", "CB"],
    ["Rome-Jayden Owusu-Oduro", "R. Owusu-Oduro", "Netherlands", "GK"],
    ["Edmond Tapsoba Jr", "E. Jr", "Burkina Faso", "CB"],
    ["Sven van Beek", "S. van Beek", "Netherlands", "CB"],
    ["Evan Ferguson", "E. Ferguson", "Ireland", "ST"],
    ["Oriol Romeu", "O. Romeu", "Spain", "CDM"],
    ["Gerson Santos", "G. Santos", "Brazil", "CM"],
    ["Finn Dahmen", "F. Dahmen", "Germany", "GK"],
    ["Angel Gomes Jr", "A. Jr", "England", "CM"],
    ["Feras Al-Brikan", "F. Al-Brikan", "Saudi Arabia", "ST"],
    ["Rafa Mir", "R. Mir", "Spain", "ST"],
    ["Trevoh Chalobah Jr", "T. Jr", "England", "CB"],
    ["Aitor Paredes", "A. Paredes", "Spain", "CB"],
    ["Enzo Ebosse", "E. Ebosse", "Cameroon", "CB"],
    ["Rodrigo Battaglia", "R. Battaglia", "Argentina", "CDM"],
    ["Patrick van Aanholt", "P. van Aanholt", "Netherlands", "LB"],
    ["Mahmoud Dahoud", "M. Dahoud", "Syria", "CM"],
    ["Douglas Augusto", "D. Augusto", "Brazil", "CM"],
    ["Jonathan Osorio Jr", "J. Jr", "Canada", "CM"],
    ["Mitchell Weiser", "M. Weiser", "Germany", "RB"],
    ["Rodrigo Muniz", "R. Muniz", "Brazil", "ST"],
    ["Nuno Santos", "N. Santos", "Portugal", "LW"],
    ["Anthony Elanga Jr", "A. Jr", "Sweden", "RW"],
    ["Leonardo Campana", "L. Campana", "Ecuador", "ST"],
    ["Andreas Christensen Jr", "A. Jr", "Denmark", "CB"],
    ["Chancel Mbemba", "C. Mbemba", "DR Congo", "CB"],
    ["Josha Vagnoman", "J. Vagnoman", "Germany", "RB"],
    ["Matheus França Jr", "M. Jr", "Brazil", "CAM"],
    ["Pathé Ciss", "P. Ciss", "Senegal", "CM"],
    ["Exequiel Palacios Jr", "E. Jr", "Argentina", "CM"],
    ["Roger Ibañez Jr", "R. Jr", "Brazil", "CB"],
    ["Starfelt", "Starfelt", "Sweden", "CB"],
    ["Alassane Pléa", "A. Pléa", "France", "ST"],
    ["Nathaniel Atkinson", "N. Atkinson", "Australia", "RB"],
    ["Sam Surridge", "S. Surridge", "England", "ST"],
    ["Frans Krätzig", "F. Krätzig", "Germany", "LB"],
    ["Walker Zimmerman", "W. Zimmerman", "USA", "CB"],
    ["Elye Wahi Jr", "E. Jr", "France", "ST"],
    ["Lucas Paquetá Jr", "L. Jr", "Brazil", "CAM"],
    ["Jorginho Frello", "J. Frello", "Italy", "CDM"],
    ["James McAtee", "J. McAtee", "England", "CAM"],
    ["Pavel Kadeřábek", "P. Kadeřábek", "Czech Republic", "RB"],
    ["Leonardo Bittencourt", "L. Bittencourt", "Germany", "CM"],
    ["Jonas Hofmann Jr", "J. Jr", "Germany", "RW"],
    ["Abdukodir Khusanov Jr", "A. Jr", "Uzbekistan", "CB"],
    ["Luis Suárez Jr", "L. Jr", "Uruguay", "ST"],
    ["Ben Johnson", "B. Johnson", "England", "RB"],
    ["Kingsley Coman Jr", "K. Jr", "France", "LW"],
    ["Alexander Djiku Jr", "A. Jr", "Ghana", "CB"],
    ["Maximilian Wöber", "M. Wöber", "Austria", "CB"],
    ["Elseid Hysaj", "E. Hysaj", "Albania", "RB"],
    ["Jan Bijlow", "J. Bijlow", "Netherlands", "GK"],
    ["Matt O'Riley", "M. O'Riley", "Denmark", "CM"],
    ["Tammy Abraham", "T. Abraham", "England", "ST"],
    ["Abderrazak Hamdallah", "A. Hamdallah", "Morocco", "ST"],
    ["Kasper Schmeichel Jr", "K. Jr", "Denmark", "GK"],
    ["Tom Heaton", "T. Heaton", "England", "GK"],
    ["Giorgio Chiellini", "G. Chiellini", "Italy", "CB"],
    ["Ema Twumasi", "E. Twumasi", "Ghana", "RB"],
    ["Thomas Strakosha Jr", "T. Jr", "Albania", "GK"],
    ["Alexander Isak Jr", "A. Jr", "Sweden", "ST"],
    ["Adam Webster", "A. Webster", "England", "CB"],
    ["Federico Bernardeschi", "F. Bernardeschi", "Italy", "RW"],
    ["Max Kilman Jr", "M. Jr", "England", "CB"],
    ["Houssem Aouar Jr", "H. Jr", "Algeria", "CAM"],
    ["Matthijs de Ligt Jr", "M. de Ligt Jr", "Netherlands", "CB"],
    ["Gustavo Puerta", "G. Puerta", "Colombia", "CM"],
    ["Brenden Aaronson Jr", "B. Jr", "USA", "CAM"],
    ["Michel Araújo", "M. Araújo", "Uruguay", "CM"],
    ["Joachim Andersen Jr", "J. Jr", "Denmark", "CB"],
    ["Christian Kouamé", "C. Kouamé", "Ivory Coast", "ST"],
    ["Theo Hernández Jr", "T. Jr", "France", "LB"],
    ["Jonny Evans", "J. Evans", "Northern Ireland", "CB"],
    ["Adam Ounas", "A. Ounas", "Algeria", "RW"],
    ["Ademola Lookman Jr", "A. Jr", "Nigeria", "LW"],
    ["Richard Ríos Jr", "R. Jr", "Colombia", "CM"],
    ["Manuel Akanji Jr", "M. Jr", "Switzerland", "CB"],
    ["Valentín Castellanos", "V. Castellanos", "Argentina", "ST"],
    ["Aymen Dahmen", "A. Dahmen", "Tunisia", "GK"],
    ["Bertrand Traoré", "B. Traoré", "Burkina Faso", "RW"],
    ["Marcelo Brozović Jr", "M. Jr", "Croatia", "CM"],
    ["Sean Johnson Jr", "S. Jr", "USA", "GK"],
    ["Jordan Ayew Jr", "J. Jr", "Ghana", "ST"],
    ["Nicolas Pallois", "N. Pallois", "France", "CB"],
    ["Arias Jhon", "A. Jhon", "Colombia", "RW"],
    ["Mario Lemina", "M. Lemina", "Gabon", "CDM"],
    ["Milan Borjan Jr", "M. Jr", "Canada", "GK"],
    ["Alessandro Florenzi", "A. Florenzi", "Italy", "RB"],
    ["Carlos Alcaraz Jr", "C. Jr", "Argentina", "CM"],
    ["Mile Svilar Jr", "M. Jr", "Serbia", "GK"],
    ["Craig Dawson", "C. Dawson", "England", "CB"],
    ["Isak Hien Jr", "I. Jr", "Sweden", "CB"],
    ["Samuel Soares", "S. Soares", "Portugal", "GK"],
    ["Ramiz Zerrouki", "R. Zerrouki", "Algeria", "CDM"],
    ["Jesper Lindstrøm", "J. Lindstrøm", "Denmark", "LW"],
    ["Reiss Nelson", "R. Nelson", "England", "LW"],
    ["Deiver Machado", "D. Machado", "Colombia", "LB"],
    ["Vitinha Ferreira", "V. Ferreira", "Portugal", "ST"],
    ["Igor Gomes", "I. Gomes", "Brazil", "CM"],
    ["Jonathan Tah Jr", "J. Jr", "Germany", "CB"],
    ["Jonathan Clauss Jr", "J. Jr", "France", "RB"],
    ["Bruno Varela", "B. Varela", "Portugal", "GK"],
    ["Exequiel Zeballos", "E. Zeballos", "Argentina", "RW"],
    ["Kellyn Acosta", "K. Acosta", "USA", "CDM"],
    ["Marquinhos Oliveira", "M. Oliveira", "Brazil", "LW"],
    ["Moussa Diaby Jr", "M. Jr", "France", "RW"],
    ["Álvaro Fernández", "Á. Fernández", "Spain", "GK"],
    ["Florian Sotoca", "F. Sotoca", "France", "CAM"],
    ["Youssef Msakni", "Y. Msakni", "Tunisia", "LW"],
    ["Michael Kayode Jr", "M. Jr", "Italy", "RB"],
    ["Federico Redondo Jr", "F. Jr", "Argentina", "CDM"],
    ["Mahmoud Trezeguet Jr", "M. Jr", "Egypt", "RW"],
    ["Andriy Lunin Jr", "A. Jr", "Ukraine", "GK"],
    ["Olivier Giroud Jr", "O. Jr", "France", "ST"],
    ["Brad Guzan", "B. Guzan", "USA", "GK"],
    ["Mehdi Taremi Jr", "M. Jr", "Iran", "ST"],
    ["Gianluca Scamacca Jr", "G. Jr", "Italy", "ST"],
    ["Lorenzo Insigne Jr", "L. Jr", "Italy", "LW"],
    ["Harry Amass", "H. Amass", "England", "LB"],
    ["Maarten Paes Jr", "M. Jr", "Netherlands", "GK"],
    ["Toni Martínez", "T. Martínez", "Spain", "ST"],
    ["Nabil Bentaleb", "N. Bentaleb", "Algeria", "CM"],
    ["Hussein El Shahat", "H. El Shahat", "Egypt", "RW"],
    ["Marco Friedl", "M. Friedl", "Austria", "CB"],
    ["Wilfred Ndidi Jr", "W. Jr", "Nigeria", "CDM"],
    ["Neil El Aynaoui", "N. El Aynaoui", "Morocco", "CM"],
    ["Franck Kessié Jr", "F. Jr", "Ivory Coast", "CM"],
    ["Jack Grealish Jr", "J. Jr", "England", "LW"],
    ["Joselu Mato", "J. Mato", "Spain", "ST"],
    ["Yassine Bounou Jr", "Y. Jr", "Morocco", "GK"],
    ["Iván Marcano", "I. Marcano", "Spain", "CB"],
    ["Pascal Groß Jr", "P. Jr", "Germany", "CM"],
    ["Jakub Stolarczyk", "J. Stolarczyk", "Poland", "GK"],
    ["Everson Felipe", "E. Felipe", "Brazil", "GK"],
    ["Jorge Cuenca Jr", "J. Jr", "Spain", "CB"],
    ["Rafael Pires", "R. Pires", "Brazil", "GK"],
    ["Vitaliy Mykolenko Jr", "V. Jr", "Ukraine", "LB"],
    ["Wahbi Khazri", "W. Khazri", "Tunisia", "CAM"],
    ["Denis Zakaria Jr", "D. Jr", "Switzerland", "CDM"],
    ["Jordan Teze", "J. Teze", "Netherlands", "RB"],
    ["Jesús Navas Jr", "J. Jr", "Spain", "RB"],
    ["Ihlas Bebou", "I. Bebou", "Togo", "ST"],
    ["Ilkay Gundogan Jr", "I. Jr", "Germany", "CM"],
    ["Giorgio Scalvini Jr", "G. Jr", "Italy", "CB"],
    ["Kylian Mbappé Jr", "K. Jr", "France", "ST"],
    ["Remko Pasveer", "R. Pasveer", "Netherlands", "GK"],
    ["Eric Maxim Choupo-Moting Jr", "E. Jr", "Cameroon", "ST"],
    ["Moumi Ngamaleu", "M. Ngamaleu", "Cameroon", "RW"],
    ["Castello Lukeba Jr", "C. Jr", "France", "CB"],
    ["Mitchell Duke", "M. Duke", "Australia", "ST"],
    ["Beñat Prados", "B. Prados", "Spain", "CM"],
    ["Danilo Luiz", "D. Luiz", "Brazil", "RB"],
    ["Nico Williams Jr", "N. Jr", "Spain", "LW"],
    ["Ibrahim Osman Jr", "I. Jr", "Ghana", "LW"],
    ["Sam Johnstone Jr", "S. Jr", "England", "GK"],
    ["Óscar de Marcos", "Ó. de Marcos", "Spain", "RB"],
    ["Joe Hart", "J. Hart", "England", "GK"],
    ["Brahim Díaz Jr", "B. Jr", "Morocco", "CAM"],
    ["Aaron Anselmino", "A. Anselmino", "Argentina", "CB"],
    ["Joseph Paintsil", "J. Paintsil", "Ghana", "LW"],
    ["Ganso Paulo Henrique", "G. Henrique", "Brazil", "CAM"],
    ["Matteo Politano Jr", "M. Jr", "Italy", "RW"],
    ["Iñaki Williams Sr", "I. Sr", "Ghana", "RW"],
    ["Cameron Carter-Vickers", "C. Carter-Vickers", "USA", "CB"],
    ["Daniel Bentley", "D. Bentley", "England", "GK"],
    ["Andy Diouf", "A. Diouf", "France", "CM"],
    ["Cristian Roldan Jr", "C. Jr", "USA", "CM"],
    ["Beto Betuncal", "B. Betuncal", "Portugal", "ST"],
    ["Giacomo Raspadori Jr", "G. Jr", "Italy", "ST"],
    ["Alejo Véliz", "A. Véliz", "Argentina", "ST"],
    ["Jørgen Strand Larsen Jr", "J. Jr", "Norway", "ST"],
    ["Giovanni Simeone", "G. Simeone", "Argentina", "ST"],
    ["Ethan Wheatley", "E. Wheatley", "England", "ST"],
    ["Giorgi Mamardashvili Jr", "G. Jr", "Georgia", "GK"],
    ["Fabinho Tavares", "F. Tavares", "Brazil", "CDM"],
    ["Amir Rrahmani Jr", "A. Jr", "Kosovo", "CB"],
    ["Lukas Klostermann", "L. Klostermann", "Germany", "RB"],
    ["Mats Wieffer Jr", "M. Jr", "Netherlands", "CDM"],
    ["Richie Laryea", "R. Laryea", "Canada", "RB"],
    ["Sergi Roberto Jr", "S. Jr", "Spain", "RB"],
    ["Bento Krepski", "B. Krepski", "Brazil", "GK"],
    ["Mathew Ryan Jr", "M. Jr", "Australia", "GK"],
    ["Dani Vivian Jr", "D. Jr", "Spain", "CB"],
    ["Carlos Vela", "C. Vela", "Mexico", "RW"],
    ["Matteo Gabbia Jr", "M. Jr", "Italy", "CB"],
    ["Bechir Ben Saïd", "B. Ben Saïd", "Tunisia", "GK"],
    ["Mohammed Kanno Jr", "M. Jr", "Saudi Arabia", "CM"],
    ["Taylor Harwood-Bellis", "T. Harwood-Bellis", "England", "CB"],
    ["Enzo Díaz", "E. Díaz", "Argentina", "LB"],
    ["Lucas Vázquez Jr", "L. Jr", "Spain", "RB"],
    ["Nathan Aké Jr", "N. Jr", "Netherlands", "CB"],
    ["Arthur Melo", "A. Melo", "Brazil", "CM"],
    ["Nathan Ake", "N. Ake", "Netherlands", "CB"],
    ["Cyle Larin Jr", "C. Jr", "Canada", "ST"],
    ["Rafa Silva Jr", "R. Jr", "Portugal", "CAM"],
    ["Munir El Haddadi", "M. El Haddadi", "Morocco", "ST"],
    ["Mohammed Al-Breik", "M. Al-Breik", "Saudi Arabia", "RB"],
    ["Alex McCarthy", "A. McCarthy", "England", "GK"],
    ["Jeremie Frimpong Jr", "J. Jr", "Netherlands", "RB"],
    ["Kiernan Dewsbury-Hall", "K. Dewsbury-Hall", "England", "CM"],
    ["Abdulaziz Al-Aliwa", "A. Al-Aliwa", "Saudi Arabia", "CM"],
    ["Ayoze Pérez Jr", "A. Jr", "Spain", "RW"],
    ["Seamus Coleman", "S. Coleman", "Ireland", "RB"],
    ["Sergi Canós", "S. Canós", "Spain", "LW"],
    ["Emerson Palmieri", "E. Palmieri", "Italy", "LB"],
    ["Galeno Wenderson", "G. Wenderson", "Brazil", "LW"],
    ["Ahmed Hassan Kouka", "A. Kouka", "Egypt", "ST"],
    ["Morgan Gibbs-White Jr", "M. Jr", "England", "CAM"],
    ["Timo Werner Jr", "T. Jr", "Germany", "ST"],
    ["Raphael Onyedika", "R. Onyedika", "Nigeria", "CDM"],
    ["Moussa Dembélé", "M. Dembélé", "France", "ST"],
    ["Tomas Soucek Jr", "T. Jr", "Czech Republic", "CM"],
    ["Ozan Kabak", "O. Kabak", "Turkey", "CB"],
    ["Diego Gómez Jr", "D. Jr", "Paraguay", "CM"],
    ["Unai Núñez", "U. Núñez", "Spain", "CB"],
    ["Selim Amallah", "S. Amallah", "Morocco", "CAM"],
    ["Lucas Blondel", "L. Blondel", "Argentina", "RB"],
    ["Victor Boniface Jr", "V. Jr", "Nigeria", "ST"],
    ["Danny Welbeck Jr", "D. Jr", "England", "ST"],
    ["Tijjani Reijnders Jr", "T. Jr", "Netherlands", "CM"],
    ["Kevin Vogt", "K. Vogt", "Germany", "CB"],
    ["Murillo Santiago", "M. Santiago", "Brazil", "CB"],
    ["Jawad El Yamiq", "J. El Yamiq", "Morocco", "CB"],
    ["Noussair Mazraoui Jr", "N. Jr", "Morocco", "RB"],
    ["Aníbal Moreno", "A. Moreno", "Argentina", "CDM"],
    ["Moise Kean Jr", "M. Jr", "Italy", "ST"],
    ["Ibrahim Sangaré Jr", "I. Jr", "Ivory Coast", "CDM"],
    ["Bart Nieuwkoop", "B. Nieuwkoop", "Netherlands", "RB"],
    ["Nino Mendes", "N. Mendes", "Brazil", "CB"],
    ["Steve Mandanda Jr", "S. Jr", "France", "GK"],
    ["Vladimir Coufal Jr", "V. Jr", "Czech Republic", "RB"],
    ["Callum Wilson Jr", "C. Jr", "England", "ST"],
    ["Ivan Provedel Jr", "I. Jr", "Italy", "GK"],
    ["Achraf Dari", "A. Dari", "Morocco", "CB"],
    ["Matías Rojas Jr", "M. Jr", "Paraguay", "CAM"],
    ["Devis Epassy", "D. Epassy", "Cameroon", "GK"],
    ["Andrea Cambiaso Jr", "A. Jr", "Italy", "LB"],
    ["Daniel Bragança", "D. Bragança", "Portugal", "CM"],
    ["Chimy Ávila", "C. Ávila", "Argentina", "ST"],
    ["Lukas Kübler", "L. Kübler", "Germany", "RB"],
    ["Iliman Ndiaye Jr", "I. Jr", "Senegal", "LW"],
    ["Marcel Sabitzer Jr", "M. Jr", "Austria", "CM"],
    ["Pierluigi Gollini", "P. Gollini", "Italy", "GK"],
    ["Brooks Lennon", "B. Lennon", "USA", "RB"],
    ["Jorge Figal", "J. Figal", "Argentina", "CB"],
    ["Jarrod Bowen Jr", "J. Jr", "England", "RW"],
    ["Anthony Mandrea", "A. Mandrea", "Algeria", "GK"],
    ["Jota Anderson", "J. Anderson", "Portugal", "RW"],
    ["Josip Stanišić Jr", "J. Jr", "Croatia", "RB"],
    ["Loïc Badé Jr", "L. Jr", "France", "CB"],
    ["Edouard Mendy Jr", "E. Jr", "Senegal", "GK"],
    ["Pablo Sarabia Jr", "P. Jr", "Spain", "RW"],
    ["Kortney Hause", "K. Hause", "England", "CB"],
    ["Corentin Tolisso", "C. Tolisso", "France", "CM"],
    ["Gustav Isaksen Jr", "G. Jr", "Denmark", "RW"],
    ["Matheus Nunes Jr", "M. Jr", "Portugal", "CM"],
    ["Arsen Zakharyan", "A. Zakharyan", "Russia", "CAM"],
    ["Ondřej Lingr", "O. Lingr", "Czech Republic", "CAM"],
    ["Malick Thiaw Jr", "M. Jr", "Germany", "CB"],
    ["Luis Alberto", "L. Alberto", "Spain", "CAM"],
    ["Tim Melia", "T. Melia", "USA", "GK"],
    ["Jens Stage", "J. Stage", "Denmark", "CM"],
    ["Dayot Upamecano Jr", "D. Jr", "France", "CB"],
    ["Dayne St. Clair", "D. Clair", "Canada", "GK"],
    ["Aleksey Miranchuk", "A. Miranchuk", "Russia", "CAM"],
    ["Ali Lajami", "A. Lajami", "Saudi Arabia", "CB"],
    ["Álex Remiro Jr", "Á. Jr", "Spain", "GK"],
    ["Pablo Torre", "P. Torre", "Spain", "CAM"],
    ["James Ward-Prowse Jr", "J. Jr", "England", "CM"],
    ["Michael Zetterer Jr", "M. Jr", "Germany", "GK"],
    ["Manuel Locatelli Jr", "M. Jr", "Italy", "CDM"],
    ["Steven Bergwijn Jr", "S. Jr", "Netherlands", "LW"],
    ["Álex Baena Jr", "Á. Jr", "Spain", "LW"],
    ["Nordin Amrabat", "N. Amrabat", "Morocco", "RW"],
    ["Viktor Gyökeres Jr", "V. Jr", "Sweden", "ST"],
    ["James Rodríguez Jr", "J. Jr", "Colombia", "CAM"],
    ["Dani Pereira", "D. Pereira", "Venezuela", "CM"],
    ["Mathías Olivera Jr", "M. Jr", "Uruguay", "LB"],
    ["Wilfried Singo", "W. Singo", "Ivory Coast", "RB"],
    ["Vincenzo Grifo", "V. Grifo", "Italy", "LW"],
    ["Luis Malagón", "L. Malagón", "Mexico", "GK"],
    ["Borna Barišić", "B. Barišić", "Croatia", "LB"],
    ["Craig Goodwin Jr", "C. Jr", "Australia", "LW"],
    ["George Earthy", "G. Earthy", "England", "CAM"],
    ["Omar Marmoush Jr", "O. Jr", "Egypt", "ST"],
    ["Marcelo Grohe", "M. Grohe", "Brazil", "GK"],
    ["Pepê Aquino", "P. Aquino", "Brazil", "RW"],
    ["Dan-Axel Zagadou", "D. Zagadou", "France", "CB"],
    ["Yuri Berchiche", "Y. Berchiche", "Spain", "LB"],
    ["Adam Idah", "A. Idah", "Ireland", "ST"],
    ["Christopher Wooh Jr", "C. Jr", "Cameroon", "CB"],
    ["Federico Gatti Jr", "F. Jr", "Italy", "CB"],
    ["Alejandro Balde Jr", "A. Jr", "Spain", "LB"],
    ["Ajdin Hrustic", "A. Hrustic", "Australia", "CAM"],
    ["Odsonne Édouard", "O. Édouard", "France", "ST"],
    ["Ricardo Horta Jr", "R. Jr", "Portugal", "LW"],
    ["Noah Mbamba", "N. Mbamba", "Belgium", "CDM"],
    ["Robin Olsen Jr", "R. Jr", "Sweden", "GK"],
    ["Adam Wharton Jr", "A. Jr", "England", "CM"],
    ["Ezequiel Centurión", "E. Centurión", "Argentina", "GK"],
    ["David Raum Jr", "D. Jr", "Germany", "LB"],
    ["Issam Jebali", "I. Jebali", "Tunisia", "ST"],
    ["Jenson Seelt", "J. Seelt", "Netherlands", "CB"],
    ["Greg Taylor", "G. Taylor", "Scotland", "LB"],
    ["Nico González Rodríguez", "N. Rodríguez", "Spain", "CM"],
    ["Pedro Gallese", "P. Gallese", "Peru", "GK"],
    ["Josko Gvardiol Jr", "J. Jr", "Croatia", "CB"],
    ["Alphonse Areola Jr", "A. Jr", "France", "GK"],
    ["Loïs Openda Jr", "L. Jr", "Belgium", "ST"],
    ["Cristian Olivera Jr", "C. Jr", "Uruguay", "RW"],
    ["Karim El Ahmadi", "K. El Ahmadi", "Morocco", "CDM"],
    ["Adam Armstrong", "A. Armstrong", "England", "ST"],
    ["Emam Ashour", "E. Ashour", "Egypt", "CM"],
    ["Frank Fabra", "F. Fabra", "Colombia", "LB"],
    ["Javi Galán Jr", "J. Jr", "Spain", "LB"],
    ["Remko Pasveer Jr", "R. Jr", "Netherlands", "GK"],
    ["Unai Hernández", "U. Hernández", "Spain", "CM"],
    ["Michail Antonio Jr", "M. Jr", "Jamaica", "ST"],
    ["Matheus Cunha Ferreira", "M. Ferreira", "Brazil", "GK"],
    ["Radosław Majecki", "R. Majecki", "Poland", "GK"],
    ["Wesley Saïd", "W. Saïd", "France", "ST"],
    ["Rodrygo Goes", "R. Goes", "Brazil", "RW"],
    ["Marcelo Grohe Jr", "M. Jr", "Brazil", "GK"],
    ["Luiz Araújo", "L. Araújo", "Brazil", "RW"],
    ["Vincent Aboubakar Jr", "V. Jr", "Cameroon", "ST"],
    ["Terem Moffi", "T. Moffi", "Nigeria", "ST"],
    ["Maarten Paes", "M. Paes", "Netherlands", "GK"],
    ["Rodrigo De Paul Jr", "R. De Paul Jr", "Argentina", "CM"],
    ["Jonathan Bamba", "J. Bamba", "Ivory Coast", "LW"],
    ["Daniel Schmidt", "D. Schmidt", "Japan", "GK"],
    ["Ethan Pinnock", "E. Pinnock", "Jamaica", "CB"],
    ["Brian Brobbey Jr", "B. Jr", "Netherlands", "ST"],
    ["Moussa Niakhaté Jr", "M. Jr", "Senegal", "CB"],
    ["Saúl Ñíguez", "S. Ñíguez", "Spain", "CM"],
    ["Samuel Lino", "S. Lino", "Brazil", "LW"],
    ["Alfie Devine", "A. Devine", "England", "CAM"],
    ["Frederik Rønnow", "F. Rønnow", "Denmark", "GK"],
    ["Nicolás Domínguez", "N. Domínguez", "Argentina", "CM"],
    ["Pau López", "P. López", "Spain", "GK"],
    ["Alfie Gilchrist", "A. Gilchrist", "England", "CB"],
    ["Mathias Jensen", "M. Jensen", "Denmark", "CM"],
    ["Yussuf Poulsen Jr", "Y. Jr", "Denmark", "ST"],
    ["Nampalys Mendy", "N. Mendy", "Senegal", "CDM"],
    ["Rodrigo Aliendro", "R. Aliendro", "Argentina", "CM"],
    ["Thomas Strakosha", "T. Strakosha", "Albania", "GK"],
    ["Luuk de Jong", "L. de Jong", "Netherlands", "ST"],
    ["Ezri Konsa Jr", "E. Jr", "England", "CB"],
    ["Paul Onuachu", "P. Onuachu", "Nigeria", "ST"],
    ["Gonçalo Guedes Jr", "G. Jr", "Portugal", "LW"],
    ["Andre Blake", "A. Blake", "Jamaica", "GK"],
    ["Jason Steele", "J. Steele", "England", "GK"],
    ["Iñaki Peña Jr", "I. Jr", "Spain", "GK"],
    ["Ferland Mendy Jr", "F. Jr", "France", "LB"],
    ["Sebastián Boselli", "S. Boselli", "Uruguay", "CB"],
    ["Emiliano Buendia Jr", "E. Jr", "Argentina", "CAM"],
    ["Diego Lainez Jr", "D. Jr", "Mexico", "RW"],
    ["Andrew Omobamidele", "A. Omobamidele", "Ireland", "CB"],
    ["Ferreira Santos", "F. Santos", "Brazil", "LW"],
    ["Arthur Augusto", "A. Augusto", "Brazil", "LB"],
    ["Oscar Bobb Jr", "O. Jr", "Norway", "RW"],
    ["Estêvão Willian", "E. Willian", "Brazil", "RW"],
    ["Harry Kane Jr", "H. Jr", "England", "ST"],
    ["Naouirou Ahamada", "N. Ahamada", "France", "CM"],
    ["Paulo Díaz", "P. Díaz", "Chile", "CB"],
    ["Connor Metcalfe", "C. Metcalfe", "Australia", "CM"],
    ["Leonardo Balerdi Jr", "L. Jr", "Argentina", "CB"],
    ["Alphonso Davies Jr", "A. Jr", "Canada", "LB"],
    ["Abdulrahman Ghareeb", "A. Ghareeb", "Saudi Arabia", "LW"],
    ["Vitor Roque", "V. Roque", "Brazil", "ST"],
    ["Víctor Gómez", "V. Gómez", "Spain", "RB"],
    ["Aihen Muñoz", "A. Muñoz", "Spain", "LB"],
    ["Fran Beltrán", "F. Beltrán", "Spain", "CM"],
    ["Luka Modrić Jr", "L. Jr", "Croatia", "CM"],
    ["Alexis Vega Jr", "A. Jr", "Mexico", "LW"],
    ["Andrey Santos", "A. Santos", "Brazil", "CM"],
    ["Raúl Albiol", "R. Albiol", "Spain", "CB"],
    ["Ismaël Koné Jr", "I. Jr", "Canada", "CM"],
    ["Mathew Leckie", "M. Leckie", "Australia", "RW"],
    ["Matěj Kovář Jr", "M. Jr", "Czech Republic", "GK"],
    ["Pierre-Emerick Aubameyang", "P. Aubameyang", "Gabon", "ST"],
    ["Leonardo Spinazzola", "L. Spinazzola", "Italy", "LB"],
    ["Julen Agirrezabala", "J. Agirrezabala", "Spain", "GK"],
    ["Tommy Doyle", "T. Doyle", "England", "CM"],
    ["Michael Keane", "M. Keane", "England", "CB"],
    ["Marcos Leonardo", "M. Leonardo", "Brazil", "ST"],
    ["Maximilian Beier Jr", "M. Jr", "Germany", "ST"],
    ["Keito Nakamura Jr", "K. Jr", "Japan", "LW"],
    ["Santiago Giménez Jr", "S. Jr", "Mexico", "ST"],
    ["Weston McKennie Jr", "W. Jr", "USA", "CM"],
    ["Marcos Rojo Jr", "M. Jr", "Argentina", "CB"],
    ["Florentino Luís", "F. Luís", "Portugal", "CDM"],
    ["Seifeddine Jaziri", "S. Jaziri", "Tunisia", "ST"],
    ["Rafael Cabral", "R. Cabral", "Brazil", "GK"],
    ["Mostafa Mohamed Jr", "M. Jr", "Egypt", "ST"],
    ["Will Smallbone", "W. Smallbone", "Ireland", "CM"],
    ["Jesús Ferreira Jr", "J. Jr", "USA", "ST"],
    ["Éder Militão Jr", "É. Jr", "Brazil", "CB"],
    ["Nacho Fernández Rodríguez", "N. Rodríguez", "Argentina", "CAM"],
    ["Unai Gómez", "U. Gómez", "Spain", "CM"],
    ["Marc Bartra", "M. Bartra", "Spain", "CB"],
    ["Julian Brandt Jr", "J. Jr", "Germany", "CAM"],
    ["Bryan Cristante Jr", "B. Jr", "Italy", "CM"],
    ["Paulo Gazzaniga", "P. Gazzaniga", "Argentina", "GK"],
    ["Salih Özcan Jr", "S. Jr", "Turkey", "CDM"],
    ["Piero Hincapié Jr", "P. Jr", "Ecuador", "CB"],
    ["Yankuba Minteh", "Y. Minteh", "Gambia", "RW"],
    ["Firas Al-Buraikan Jr", "F. Jr", "Saudi Arabia", "ST"],
    ["N'Golo Kanté Jr", "N. Jr", "France", "CDM"],
    ["Marcos Rocha", "M. Rocha", "Brazil", "RB"],
    ["Zaidu Sanusi", "Z. Sanusi", "Nigeria", "LB"],
    ["Alex Sandro Jr", "A. Jr", "Brazil", "LB"],
    ["Raúl Jiménez Jr", "R. Jr", "Mexico", "ST"],
    ["Ryan Yates", "R. Yates", "England", "CM"],
    ["Mohammed Salisu Jr", "M. Jr", "Ghana", "CB"],
    ["James Tarkowski", "J. Tarkowski", "England", "CB"],
    ["Marcus Thuram Jr", "M. Jr", "France", "ST"],
    ["Matthias Ginter", "M. Ginter", "Germany", "CB"],
    ["Fabiano Parisi", "F. Parisi", "Italy", "LB"],
    ["Anthony Lopes Jr", "A. Jr", "Portugal", "GK"],
    ["Jamal Musiala Jr", "J. Jr", "Germany", "CAM"],
    ["Sikou Niakaté", "S. Niakaté", "Mali", "CB"],
    ["Thomas Partey Jr", "T. Jr", "Ghana", "CDM"],
    ["Gideon Mensah", "G. Mensah", "Ghana", "LB"],
    ["Luciano Acosta", "L. Acosta", "Argentina", "CAM"],
    ["Toti Gomes", "T. Gomes", "Portugal", "CB"],
    ["Ché Adams", "C. Adams", "Scotland", "ST"],
    ["Héctor Bellerín", "H. Bellerín", "Spain", "RB"],
    ["Caio Henrique", "C. Henrique", "Brazil", "LB"],
    ["Adama Traoré", "A. Traoré", "Spain", "RW"],
    ["Warmed Omari", "W. Omari", "France", "CB"],
    ["Nicolás Figal", "N. Figal", "Argentina", "CB"],
    ["Rodrigo Zalazar", "R. Zalazar", "Uruguay", "CAM"],
    ["Issa Diop", "I. Diop", "France", "CB"],
    ["Kevin Kampl", "K. Kampl", "Slovenia", "CDM"],
    ["Dušan Vlahović Jr", "D. Jr", "Serbia", "ST"],
    ["Endrick Felipe", "E. Felipe", "Brazil", "ST"],
    ["Dan Burn", "D. Burn", "England", "CB"],
    ["Nathaniel Clyne", "N. Clyne", "England", "RB"],
    ["Axel Witsel Jr", "A. Jr", "Belgium", "CB"],
    ["Cheick Doucouré", "C. Doucouré", "Mali", "CDM"],
    ["Faris Moumbagna", "F. Moumbagna", "Cameroon", "ST"],
    ["Branco van den Boomen", "B. van den Boomen", "Netherlands", "CM"],
    ["Rui Silva Sousa", "R. Sousa", "Portugal", "GK"],
    ["Valentin Rongier", "V. Rongier", "France", "CM"],
    ["Yvon Mvogo", "Y. Mvogo", "Switzerland", "GK"],
    ["Pierre Kalulu Jr", "P. Jr", "France", "CB"],
    ["Tyler Adams Jr", "T. Jr", "USA", "CDM"],
    ["Philipp Köhn", "P. Köhn", "Switzerland", "GK"],
    ["Yann Bisseck", "Y. Bisseck", "Germany", "CB"],
    ["Lewis Miley", "L. Miley", "England", "CM"],
    ["Julian Gressel", "J. Gressel", "Germany", "RM"],
    ["Nick Lima", "N. Lima", "USA", "RB"],
    ["Niels Nkounkou", "N. Nkounkou", "France", "LB"],
    ["Manu Koné Jr", "M. Jr", "France", "CM"],
    ["Sergio Busquets Jr", "S. Jr", "Spain", "CDM"],
    ["Aitor Fernández", "A. Fernández", "Spain", "GK"],
    ["Abde Ezzalzouli Jr", "A. Jr", "Morocco", "LW"],
    ["Álex Berenguer", "Á. Berenguer", "Spain", "LW"],
    ["Rocco Reitz", "R. Reitz", "Germany", "CM"],
    ["Lucas Höler", "L. Höler", "Germany", "ST"],
    ["Noa Lang Jr", "N. Jr", "Netherlands", "LW"],
    ["Alan Varela Jr", "A. Jr", "Argentina", "CDM"],
    ["Guillermo Maripán", "G. Maripán", "Chile", "CB"],
    ["Omari Forson", "O. Forson", "England", "RW"],
    ["Jean-Philippe Krasso", "J. Krasso", "Ivory Coast", "ST"],
    ["Jacob Murphy", "J. Murphy", "England", "RW"],
    ["Bobby Clark", "B. Clark", "England", "CM"],
    ["Ryan Manning", "R. Manning", "Ireland", "LB"],
    ["Cesare Casadei Jr", "C. Jr", "Italy", "CM"],
    ["Sam Johnstone", "S. Johnstone", "England", "GK"],
    ["Ali Al-Hassan", "A. Al-Hassan", "Saudi Arabia", "CM"],
    ["Marco Farfan", "M. Farfan", "USA", "LB"],
    ["Ola Aina Jr", "O. Jr", "Nigeria", "RB"],
    ["Zakaria Aboukhlal", "Z. Aboukhlal", "Morocco", "RW"],
    ["Guillaume Restes", "G. Restes", "France", "GK"],
    ["Mamadou Sarr", "M. Sarr", "Senegal", "CB"],
    ["Clinton Mata", "C. Mata", "Angola", "RB"],
    ["Shaq Moore", "S. Moore", "USA", "RB"],
    ["Jack Hinshelwood", "J. Hinshelwood", "England", "CM"],
    ["Fábio Costa", "F. Costa", "Brazil", "GK"],
    ["Leandro Brey", "L. Brey", "Argentina", "GK"],
    ["Axel Disasi Jr", "A. Jr", "France", "CB"],
    ["Archie Gray Jr", "A. Jr", "England", "CDM"],
    ["Nathan Tella Jr", "N. Jr", "Nigeria", "RW"],
    ["Juan Jesus", "J. Jesus", "Brazil", "CB"],
    ["Yacine Brahimi", "Y. Brahimi", "Algeria", "CAM"],
    ["Johnny Cardoso Jr", "J. Jr", "USA", "CDM"],
    ["Vinícius Júnior Jr", "V. Jr", "Brazil", "LW"],
    ["Joseph Nonge", "J. Nonge", "Belgium", "CM"],
    ["Bryan Mbeumo Jr", "B. Jr", "Cameroon", "RW"],
    ["Islam Slimani", "I. Slimani", "Algeria", "ST"],
    ["Hiroki Sakai", "H. Sakai", "Japan", "RB"],
    ["Mario Götze", "M. Götze", "Germany", "CAM"],
    ["Keane Lewis-Potter", "K. Lewis-Potter", "England", "LW"],
    ["Berat Djimsiti Jr", "B. Jr", "Albania", "CB"],
    ["Arnau Tenas", "A. Tenas", "Spain", "GK"],
    ["Owen Wijndal", "O. Wijndal", "Netherlands", "LB"],
    ["Adrien Truffert", "A. Truffert", "France", "LB"],
    ["Christopher Wooh", "C. Wooh", "Cameroon", "CB"],
    ["Lutsharel Geertruida Jr", "L. Jr", "Netherlands", "CB"],
    ["Rafael Borré Jr", "R. Jr", "Colombia", "ST"],
    ["Williot Swedberg", "W. Swedberg", "Sweden", "CAM"],
    ["Stefan Savić", "S. Savić", "Montenegro", "CB"],
    ["Wilfried Zaha Jr", "W. Jr", "Ivory Coast", "LW"],
    ["Mike Maignan Jr", "M. Jr", "France", "GK"],
    ["Hugo Larsson Jr", "H. Jr", "Sweden", "CM"],
    ["Will Hughes", "W. Hughes", "England", "CM"],
    ["Shuto Machino", "S. Machino", "Japan", "ST"],
    ["Federico Redondo", "F. Redondo", "Argentina", "CDM"],
    ["Ángel Romero", "Á. Romero", "Paraguay", "ST"],
    ["Ciro Immobile Jr", "C. Jr", "Italy", "ST"],
    ["Sven Mijnans", "S. Mijnans", "Netherlands", "CM"],
    ["Jordy Clasie", "J. Clasie", "Netherlands", "CDM"],
    ["Ahmed Hegazi Jr", "A. Jr", "Egypt", "CB"],
    ["Nathan Collins Jr", "N. Jr", "Ireland", "CB"],
    ["Youssef En-Nesyri Jr", "Y. Jr", "Morocco", "ST"],
    ["Rafael Leão Jr", "R. Jr", "Portugal", "LW"],
    ["Ferran Torres Jr", "F. Jr", "Spain", "LW"],
    ["Sergio Romero", "S. Romero", "Argentina", "GK"],
    ["Nico Schlotterbeck Jr", "N. Jr", "Germany", "CB"],
    ["Jack Hendry", "J. Hendry", "Scotland", "CB"],
    ["Hákon Arnar Haraldsson", "H. Haraldsson", "Iceland", "CAM"],
    ["Jonathan Ikoné", "J. Ikoné", "France", "RW"],
    ["Willian Borges", "W. Borges", "Brazil", "LW"],
    ["Yuri Alberto Jr", "Y. Jr", "Brazil", "ST"],
    ["Alexander Schwolow", "A. Schwolow", "Germany", "GK"],
    ["Enzo Millot", "E. Millot", "France", "CAM"],
    ["Equi Fernández", "E. Fernández", "Argentina", "CDM"],
    ["Hirving Lozano Jr", "H. Jr", "Mexico", "RW"],
    ["Gift Orban", "G. Orban", "Nigeria", "ST"],
    ["Julian Alvarez Jr", "J. Jr", "Argentina", "ST"],
    ["Alex Iwobi Jr", "A. Jr", "Nigeria", "CM"],
    ["Fábio Santos", "F. Santos", "Brazil", "LB"],
    ["Merih Demiral Jr", "M. Jr", "Turkey", "CB"],
    ["Danilo Pereira da Silva", "D. Pereira da Silva", "Brazil", "ST"],
    ["Arnaud Kalimuendo", "A. Kalimuendo", "France", "ST"],
    ["Franco Israel Jr", "F. Jr", "Uruguay", "GK"],
    ["Noah Atubolu", "N. Atubolu", "Germany", "GK"],
    ["Manuel Ugarte Jr", "M. Jr", "Uruguay", "CDM"],
    ["Benjamin Cremaschi", "B. Cremaschi", "USA", "CM"],
    ["Igor Zubeldia", "I. Zubeldia", "Spain", "CB"],
    ["Stanislav Lobotka Jr", "S. Jr", "Slovakia", "CDM"],
    ["Alejandro Grimaldo Jr", "A. Jr", "Spain", "LB"],
    ["Michael Delgado", "M. Delgado", "Brazil", "LW"],
    ["Ferjani Sassi", "F. Sassi", "Tunisia", "CM"],
    ["Steven Gerrard Jr", "S. Jr", "England", "CM"],
    ["Aïssa Mandi", "A. Mandi", "Algeria", "CB"],
    ["Fabio Carvalho", "F. Carvalho", "Portugal", "CAM"],
    ["Amario Cozier-Duberry", "A. Cozier-Duberry", "England", "RW"],
    ["Saïd Benrahma", "S. Benrahma", "Algeria", "LW"],
    ["Memphis Depay Jr", "M. Jr", "Netherlands", "ST"],
    ["Stefan Frei", "S. Frei", "Switzerland", "GK"],
    ["Amadou Haidara", "A. Haidara", "Mali", "CM"],
    ["Cristian Lema", "C. Lema", "Argentina", "CB"],
    ["Arda Güler Jr", "A. Jr", "Turkey", "CAM"],
    ["Mohamed Simakan", "M. Simakan", "France", "CB"],
    ["Emiliano Martinez Jr", "E. Jr", "Argentina", "GK"],
    ["Andries Noppert", "A. Noppert", "Netherlands", "GK"],
    ["Sam Beukema", "S. Beukema", "Netherlands", "CB"],
    ["Keno Ferreira", "K. Ferreira", "Brazil", "LW"],
    ["Roman Bürki", "R. Bürki", "Switzerland", "GK"],
    ["Aymeric Laporte Jr", "A. Jr", "Spain", "CB"],
    ["El Bilal Touré", "E. Touré", "Mali", "ST"],
    ["Kenneth Taylor Jr", "K. Jr", "Netherlands", "CM"],
    ["Ilan Meslier Jr", "I. Jr", "France", "GK"],
    ["Diego Llorente Jr", "D. Jr", "Spain", "CB"],
    ["Cheikhou Kouyaté", "C. Kouyaté", "Senegal", "CDM"],
    ["Junya Ito Jr", "J. Jr", "Japan", "RW"],
    ["Ørjan Nyland Jr", "Ø. Jr", "Norway", "GK"],
    ["Luciano Neves", "L. Neves", "Brazil", "ST"],
    ["Kristian Hlynsson", "K. Hlynsson", "Iceland", "CAM"],
    ["Kristoffer Ajer Jr", "K. Jr", "Norway", "CB"],
    ["Eliesse Ben Seghir Jr", "E. Ben Seghir Jr", "Morocco", "LW"],
    ["Davide Frattesi Jr", "D. Jr", "Italy", "CM"],
    ["Mathys Tel Jr", "M. Jr", "France", "ST"],
    ["Scott McKenna", "S. McKenna", "Scotland", "CB"],
    ["Charlie Patino", "C. Patino", "England", "CM"],
    ["Insigne Marco", "I. Marco", "Italy", "LW"],
    ["Iago Aspas Jr", "I. Jr", "Spain", "ST"],
    ["Jake O'Brien", "J. O'Brien", "Ireland", "CB"],
    ["Christian Eriksen Jr", "C. Jr", "Denmark", "CAM"],
    ["Harry Wilson Jr", "H. Jr", "Wales", "RW"],
    ["Orbelín Pineda", "O. Pineda", "Mexico", "CAM"],
    ["Eljif Elmas", "E. Elmas", "North Macedonia", "CAM"],
    ["Paulinho Sampaio", "P. Sampaio", "Portugal", "ST"],
    ["Kyle Walker Jr", "K. Jr", "England", "RB"],
    ["Jean-Charles Castelletto Jr", "J. Jr", "Cameroon", "CB"],
    ["Brad Guzan Jr", "B. Jr", "USA", "GK"],
    ["Dodi Lukebakio Jr", "D. Jr", "Belgium", "RW"],
    ["Kevin Serna", "K. Serna", "Colombia", "RW"],
    ["Sergio Ramos Jr", "S. Jr", "Spain", "CB"],
    ["Cyriel Dessers", "C. Dessers", "Nigeria", "ST"],
    ["Nabil Bentaleb Jr", "N. Jr", "Algeria", "CM"],
    ["Aaron Wan-Bissaka Jr", "A. Jr", "England", "RB"],
    ["Kalvin Phillips Jr", "K. Jr", "England", "CDM"],
    ["Matheus Bidu", "M. Bidu", "Brazil", "LB"],
    ["Michael Gregoritsch Jr", "M. Jr", "Austria", "ST"],
    ["Owen Beck", "O. Beck", "Wales", "LB"],
    ["Enzo Barrenechea", "E. Barrenechea", "Argentina", "CDM"],
    ["Nawaf Al-Aqidi Jr", "N. Jr", "Saudi Arabia", "GK"],
    ["Mohammed Kudus Jr", "M. Jr", "Ghana", "RW"],
    ["Deybi Flores", "D. Flores", "Honduras", "CDM"],
    ["Djed Spence", "D. Spence", "England", "RB"],
    ["Mario Gila", "M. Gila", "Spain", "CB"],
    ["Ethan Horvath", "E. Horvath", "USA", "GK"],
    ["Nkosi Tafari", "N. Tafari", "USA", "CB"],
    ["Diego Costa Silva", "D. Silva", "Brazil", "ST"],
    ["Alisson Farias", "A. Farias", "Brazil", "CM"],
    ["Sean Longstaff", "S. Longstaff", "England", "CM"],
    ["Drake Callender Jr", "D. Jr", "USA", "GK"],
    ["Julio Enciso Jr", "J. Jr", "Paraguay", "CAM"],
    ["Folarin Balogun Jr", "F. Jr", "USA", "ST"],
    ["Saad Al-Mousa", "S. Al-Mousa", "Saudi Arabia", "CB"],
    ["Thiago Silva Jr", "T. Jr", "Brazil", "CB"],
    ["Gorka Guruzeta", "G. Guruzeta", "Spain", "ST"],
    ["Agustín Rossi", "A. Rossi", "Argentina", "GK"],
    ["Andrej Kramarić Jr", "A. Jr", "Croatia", "ST"],
    ["Jonathan David Jr", "J. Jr", "Canada", "ST"],
    ["Carlos Baleba Jr", "C. Jr", "Cameroon", "CDM"],
    ["Pau Torres Jr", "P. Jr", "Spain", "CB"],
    ["Sven Ulreich Jr", "S. Jr", "Germany", "GK"],
    ["Carlos Auzqui", "C. Auzqui", "Argentina", "RW"],
    ["Robert Taylor", "R. Taylor", "Finland", "LW"],
    ["Lino Sousa", "L. Sousa", "England", "LB"],
    ["Olivier Ntcham", "O. Ntcham", "Cameroon", "CM"],
    ["Dani de Wit", "D. de Wit", "Netherlands", "CM"],
    ["Álvaro Djaló", "Á. Djaló", "Spain", "LW"],
    ["Solly March", "S. March", "England", "RW"],
    ["Nikola Milenković Jr", "N. Jr", "Serbia", "CB"],
    ["James Garner", "J. Garner", "England", "CM"],
    ["Patric Gabarrón", "P. Gabarrón", "Spain", "CB"],
    ["Karim Fegrouche", "K. Fegrouche", "Egypt", "CB"],
    ["Tariq Lamptey Jr", "T. Jr", "Ghana", "RB"],
    ["Marco Sportiello Jr", "M. Jr", "Italy", "GK"],
    ["Roman Celentano", "R. Celentano", "USA", "GK"],
    ["Lyanco Vojnović", "L. Vojnović", "Brazil", "CB"],
    ["Richie Laryea Jr", "R. Jr", "Canada", "RB"],
    ["Wesley França", "W. França", "Brazil", "RB"],
    ["Bono Yassine", "B. Yassine", "Morocco", "GK"],
    ["Albert Rusnák", "A. Rusnák", "Slovakia", "CAM"],
    ["Manuel Neuer Jr", "M. Jr", "Germany", "GK"],
    ["Justin Bijlow Jr", "J. Jr", "Netherlands", "GK"],
    ["Erling Haaland Jr", "E. Jr", "Norway", "ST"],
    ["Nestor Lorenzo", "N. Lorenzo", "Argentina", "CM"],
    ["Tyler Morton", "T. Morton", "England", "CM"],
    ["Otávio Edmilson", "O. Edmilson", "Brazil", "CDM"],
    ["Kalidou Koulibaly Jr", "K. Jr", "Senegal", "CB"],
    ["Robert Lewandowski Jr", "R. Jr", "Poland", "ST"],
    ["Malik Tillman Jr", "M. Jr", "USA", "CAM"],
    ["Matteo Guendouzi Jr", "M. Jr", "France", "CM"],
    ["Timothy Castagne Jr", "T. Jr", "Belgium", "RB"],
    ["Scott McTominay Jr", "S. Jr", "Scotland", "CM"],
    ["Joe Scally Jr", "J. Jr", "USA", "RB"],
    ["Rubens Dias", "R. Dias", "Brazil", "LB"],
    ["Edon Zhegrova", "E. Zhegrova", "Kosovo", "RW"],
    ["Idrissa Gueye Jr", "I. Jr", "Senegal", "CDM"],
    ["Giorgian de Arrascaeta Jr", "G. de Arrascaeta Jr", "Uruguay", "CAM"],
    ["Nicolás Lodeiro", "N. Lodeiro", "Uruguay", "CAM"],
    ["Jamie Leweling Jr", "J. Jr", "Germany", "RW"],
    ["Carlos Fernández", "C. Fernández", "Spain", "ST"],
    ["Manuel Riemann", "M. Riemann", "Germany", "GK"],
    ["Antonee Robinson Jr", "A. Jr", "USA", "LB"],
    ["José Gayà Jr", "J. Jr", "Spain", "LB"],
    ["Chris Smalling", "C. Smalling", "England", "CB"],
    ["Pedro Chirivella", "P. Chirivella", "Spain", "CDM"],
    ["Benjamin Lecomte", "B. Lecomte", "France", "GK"],
    ["Manor Solomon", "M. Solomon", "Israel", "LW"],
    ["Will Lankshear", "W. Lankshear", "England", "ST"],
    ["Hiroki Ito", "H. Ito", "Japan", "CB"],
    ["Weverton Silva", "W. Silva", "Brazil", "GK"],
    ["Luca Ranieri", "L. Ranieri", "Italy", "CB"],
    ["Juan Foyth", "J. Foyth", "Argentina", "CB"],
    ["David Luiz", "D. Luiz", "Brazil", "CB"],
    ["Marko Arnautović Jr", "M. Jr", "Austria", "ST"],
    ["Ludovic Blas Jr", "L. Jr", "France", "CAM"],
    ["Jurriën Timber Jr", "J. Jr", "Netherlands", "RB"],
    ["Abdul Fatawu Jr", "A. Jr", "Ghana", "RW"],
    ["Leon Goretzka Jr", "L. Jr", "Germany", "CM"],
    ["Fran García Jr", "F. Jr", "Spain", "LB"],
    ["Nicolás González Jr", "N. Jr", "Argentina", "RW"],
    ["Cano Germán", "C. Germán", "Argentina", "ST"],
    ["Emre Can Jr", "E. Jr", "Germany", "CDM"],
    ["Youcef Atal Jr", "Y. Jr", "Algeria", "RB"],
    ["Paul Arriola", "P. Arriola", "USA", "RW"],
    ["Todd Cantwell", "T. Cantwell", "England", "CAM"],
    ["Saud Abdulhamid Jr", "S. Jr", "Saudi Arabia", "RB"],
    ["Wajdi Kechrida", "W. Kechrida", "Tunisia", "RB"],
    ["Dylan Bronn", "D. Bronn", "Tunisia", "CB"],
    ["Manuel Lanzini", "M. Lanzini", "Argentina", "CAM"],
    ["Ansu Fati", "A. Fati", "Spain", "LW"],
    ["Diego Carlos Jr", "D. Jr", "Brazil", "CB"],
    ["Mattia Perin Jr", "M. Jr", "Italy", "GK"],
    ["Ivan Toney Jr", "I. Jr", "England", "ST"],
    ["Deniz Undav Jr", "D. Jr", "Germany", "ST"],
    ["Kiliann Sildillia", "K. Sildillia", "France", "RB"],
    ["Jorge Sánchez", "J. Sánchez", "Mexico", "RB"],
    ["Marc Roca", "M. Roca", "Spain", "CM"],
    ["Ashley Young", "A. Young", "England", "LB"]
  ], REAL_PLAYERS_WAVE4 = [
    ["Mikey Johnston", "M. Johnston", "Ireland", "LW"],
    ["Eder Militao", "E. Militao", "Brazil", "CB"],
    ["Kyriani Sabbe", "K. Sabbe", "Belgium", "RB"],
    ["Angel Di Maria Jr", "A. Di Maria Jr", "Portugal", "RW"],
    ["Ederson Jose Jr", "E. Jr", "Brazil", "CM"],
    ["Ayoze Perez", "A. Perez", "Spain", "CAM"],
    ["Martin Valjent", "M. Valjent", "Spain", "CB"],
    ["Wes Burns", "W. Burns", "England", "RM"],
    ["Jose Maria Gimenez", "J. Gimenez", "Uruguay", "CB"],
    ["Florian Lejeune", "F. Lejeune", "Spain", "CB"],
    ["Kwon Kyung-won", "K. Kyung-won", "South Korea", "CB"],
    ["Santiago Gimenez Jr", "S. Jr", "Mexico", "ST"],
    ["Adam Davies", "A. Davies", "Wales", "GK"],
    ["Kevin Mac Allister", "K. Mac Allister", "Belgium", "CB"],
    ["Jasurbek Jaloliddinov", "J. Jaloliddinov", "Uzbekistan", "CAM"],
    ["Joris Kayembe", "J. Kayembe", "Belgium", "LB"],
    ["Raphael Guerreiro", "R. Guerreiro", "Portugal", "LB"],
    ["Casper Nielsen", "C. Nielsen", "Belgium", "CM"],
    ["Sadegh Moharrami", "S. Moharrami", "Iran", "RB"],
    ["Azizbek Turgunboev", "A. Turgunboev", "Uzbekistan", "RW"],
    ["Aurelien Tchouameni", "A. Tchouameni", "France", "CDM"],
    ["Craig Cathcart", "C. Cathcart", "England", "CB"],
    ["Anthony Rouault", "A. Rouault", "Germany", "CB"],
    ["Youcef Belaili", "Y. Belaili", "Algeria", "LW"],
    ["Alan Mozo", "A. Mozo", "Mexico", "RB"],
    ["Mohammad Ghorbani", "M. Ghorbani", "Iran", "CM"],
    ["Michael Ngadeu", "M. Ngadeu", "Cameroon", "CB"],
    ["Ike Ugbo Jr", "I. Jr", "Canada", "ST"],
    ["Israel Reyes", "I. Reyes", "Mexico", "CB"],
    ["Sergio Camello", "S. Camello", "Spain", "ST"],
    ["Sebastiano Esposito", "S. Esposito", "Italy", "ST"],
    ["Tomas Soucek", "T. Soucek", "England", "CM"],
    ["Salvatore Esposito", "S. Esposito", "Italy", "CM"],
    ["Ryan Fraser", "R. Fraser", "Scotland", "LW"],
    ["Nicolas de la Cruz", "N. de la Cruz", "Uruguay", "CAM"],
    ["Arrascaeta", "Arrascaeta", "Brazil", "CAM"],
    ["Josip Sutalo", "J. Sutalo", "Netherlands", "CB"],
    ["Youssef Amyn", "Y. Amyn", "Iraq", "CAM"],
    ["Rogerio Oliveira", "R. Oliveira", "Germany", "LB"],
    ["Abdulfattah Adam", "A. Adam", "Saudi Arabia", "CM"],
    ["Unai Marrero", "U. Marrero", "Spain", "GK"],
    ["Ludwig Augustinsson", "L. Augustinsson", "Belgium", "LB"],
    ["Joe Rodon Jr", "J. Jr", "Wales", "CB"],
    ["Simone Scuffet", "S. Scuffet", "Italy", "GK"],
    ["Max Lowe", "M. Lowe", "England", "LB"],
    ["Ronald Araujo", "R. Araujo", "Uruguay", "CB"],
    ["Fahad Al-Muwallad", "F. Al-Muwallad", "Saudi Arabia", "RW"],
    ["Jhon Duran", "J. Duran", "England", "ST"],
    ["Antonio Silva", "A. Silva", "Portugal", "CB"],
    ["Henry Martin", "H. Martin", "Mexico", "ST"],
    ["Yari Verschaeren", "Y. Verschaeren", "Belgium", "CAM"],
    ["Sead Kolasinac", "S. Kolasinac", "Italy", "CB"],
    ["Kevin Castano", "K. Castano", "Colombia", "CM"],
    ["Baba Rahman", "B. Rahman", "Ghana", "LB"],
    ["Alessio Cerci", "A. Cerci", "Germany", "RW"],
    ["Ilia Gruev", "I. Gruev", "England", "CDM"],
    ["Hussein Ali", "H. Ali", "Iraq", "RB"],
    ["Kouame Autonne", "K. Autonne", "United Arab Emirates", "CB"],
    ["Salih Ozcan", "S. Ozcan", "Germany", "CDM"],
    ["Emile Smith Rowe", "E. Rowe", "England", "CAM"],
    ["Rustam Ashurmatov", "R. Ashurmatov", "Uzbekistan", "CB"],
    ["Frank Magri", "F. Magri", "Cameroon", "ST"],
    ["Alex Remiro", "A. Remiro", "Spain", "GK"],
    ["Mario Gotze", "M. Gotze", "Germany", "CAM"],
    ["Meshaal Barsham", "M. Barsham", "Qatar", "GK"],
    ["Ahmad Nourollahi", "A. Nourollahi", "Iran", "CM"],
    ["Jean-Pierre Nsame", "J. Nsame", "Cameroon", "ST"],
    ["Chris Fuhrich", "C. Fuhrich", "Germany", "LW"],
    ["Lazar Samardzic", "L. Samardzic", "Italy", "CAM"],
    ["Chris Mepham Jr", "C. Jr", "Wales", "CB"],
    ["Saeid Ezatolahi", "S. Ezatolahi", "Iran", "CDM"],
    ["Dudu", "Dudu", "Brazil", "LW"],
    ["Callum Robinson Jr", "C. Jr", "Ireland", "LW"],
    ["Nicolo Barella", "N. Barella", "Italy", "CM"],
    ["Jordan Bos", "J. Bos", "Australia", "LB"],
    ["Tommaso Pobega", "T. Pobega", "Italy", "CM"],
    ["Alvaro Gimenez", "A. Gimenez", "Spain", "ST"],
    ["Kemar Roofe", "K. Roofe", "Scotland", "ST"],
    ["Sherzod Nasrullaev", "S. Nasrullaev", "Uzbekistan", "RB"],
    ["Riyadh Sharahili", "R. Sharahili", "Saudi Arabia", "CB"],
    ["Shoja Khalilzadeh", "S. Khalilzadeh", "Iran", "CB"],
    ["Niklas Sule", "N. Sule", "Germany", "CB"],
    ["Amir Al-Ammari", "A. Al-Ammari", "Iraq", "CM"],
    ["Victor Gomez", "V. Gomez", "Portugal", "RB"],
    ["Maximilian Wober", "M. Wober", "England", "CB"],
    ["Almoez Ali", "A. Ali", "Qatar", "ST"],
    ["Mouez Hassen", "M. Hassen", "Tunisia", "GK"],
    ["Evann Guessand", "E. Guessand", "France", "ST"],
    ["Brais Mendez", "B. Mendez", "Spain", "CAM"],
    ["Troy Parrott", "T. Parrott", "Ireland", "ST"],
    ["Lamare Bogarde", "L. Bogarde", "England", "CB"],
    ["Ivan Perisic", "I. Perisic", "Netherlands", "LW"],
    ["Lucas Hernandez", "L. Hernandez", "France", "CB"],
    ["Kian Fitz-Jim", "K. Fitz-Jim", "Netherlands", "CM"],
    ["Sergi Guardiola", "S. Guardiola", "Spain", "ST"],
    ["Mileta Rajovic", "M. Rajovic", "England", "ST"],
    ["Raghed Al-Najjar", "R. Al-Najjar", "Saudi Arabia", "GK"],
    ["Michael Smith", "M. Smith", "England", "ST"],
    ["Aidan Morris", "A. Morris", "USA", "CM"],
    ["Kusini Yengi", "K. Yengi", "Australia", "ST"],
    ["Nicolas Haas", "N. Haas", "Italy", "CM"],
    ["Borna Barisic", "B. Barisic", "Scotland", "LB"],
    ["Sebastiaan Bornauw", "S. Bornauw", "Germany", "CB"],
    ["Rob Holding", "R. Holding", "England", "CB"],
    ["Diego Rossi", "D. Rossi", "Uruguay", "ST"],
    ["Edson Alvarez Jr", "E. Jr", "Mexico", "CDM"],
    ["Aissa Mandi", "A. Mandi", "Spain", "CB"],
    ["Mamadou Lamine Camara", "M. Camara", "Senegal", "CM"],
    ["Emmanuel Dennis", "E. Dennis", "England", "ST"],
    ["Santiago Arias", "S. Arias", "Colombia", "RB"],
    ["Alex Berenguer", "A. Berenguer", "Spain", "LW"],
    ["Lucas Paqueta Jr", "L. Jr", "Brazil", "CAM"],
    ["Connor Roberts", "C. Roberts", "Wales", "RB"],
    ["Mohamed Hany", "M. Hany", "Egypt", "RB"],
    ["Terem Moffi Jr", "T. Jr", "Nigeria", "ST"],
    ["Isi Palazon", "I. Palazon", "Spain", "RW"],
    ["Tuta", "Tuta", "Germany", "CB"],
    ["Mohammad Mohebi", "M. Mohebi", "Iran", "LW"],
    ["Liberato Cacace", "L. Cacace", "Italy", "LB"],
    ["Miguel Gutierrez", "M. Gutierrez", "Spain", "LB"],
    ["Badredine Bouanani Jr", "B. Jr", "Algeria", "RW"],
    ["Cedric Zesiger", "C. Zesiger", "Germany", "CB"],
    ["Eduardo Vargas", "E. Vargas", "Chile", "ST"],
    ["Daniel Braganca", "D. Braganca", "Portugal", "CM"],
    ["Tomas Araujo", "T. Araujo", "Portugal", "CB"],
    ["Ahmed Bamsaud", "A. Bamsaud", "Saudi Arabia", "LB"],
    ["Khusniddin Alikulov", "K. Alikulov", "Uzbekistan", "CB"],
    ["Sikou Niakate", "S. Niakate", "Portugal", "CB"],
    ["Sergino Dest", "S. Dest", "Netherlands", "RB"],
    ["Szymon Zurkowski", "S. Zurkowski", "Italy", "CM"],
    ["Rafa Mujica", "R. Mujica", "Portugal", "ST"],
    ["Hamza Igamane Jr", "H. Jr", "France", "ST"],
    ["Leandro Barreiro", "L. Barreiro", "Portugal", "CM"],
    ["Alberto Mari", "A. Mari", "Spain", "ST"],
    ["Daniel Maldini", "D. Maldini", "Italy", "CAM"],
    ["Aref Aghasi", "A. Aghasi", "Iran", "CB"],
    ["Gabriel Arias", "G. Arias", "Chile", "GK"],
    ["Kieffer Moore", "K. Moore", "Wales", "ST"],
    ["Viktor Gyokeres Jr", "V. Jr", "Portugal", "ST"],
    ["Thomas Kaminski", "T. Kaminski", "Belgium", "GK"],
    ["Abbosbek Fayzullaev", "A. Fayzullaev", "Uzbekistan", "CAM"],
    ["Nathan Broadhead", "N. Broadhead", "England", "LW"],
    ["Ali McCann", "A. McCann", "Northern Ireland", "CM"],
    ["Vito Mannone", "V. Mannone", "France", "GK"],
    ["Joe Rothwell", "J. Rothwell", "England", "CM"],
    ["Yahya Nader", "Y. Nader", "United Arab Emirates", "CM"],
    ["Tommaso Augello", "T. Augello", "Italy", "LB"],
    ["Mohamed Drager", "M. Drager", "Tunisia", "RB"],
    ["Mohammed Waad", "M. Waad", "Qatar", "CM"],
    ["Andrea Pinamonti", "A. Pinamonti", "Italy", "ST"],
    ["Julian Alvarez", "J. Alvarez", "Argentina", "ST"],
    ["Connor Barron", "C. Barron", "Scotland", "CM"],
    ["Kal Naismith", "K. Naismith", "England", "CB"],
    ["Dante", "Dante", "France", "CB"],
    ["Ahmed Reda Tagnaouti", "A. Tagnaouti", "Morocco", "GK"],
    ["Joao Basso", "J. Basso", "Portugal", "CB"],
    ["Kenny McLean", "K. McLean", "Scotland", "CM"],
    ["Joao Moutinho", "J. Moutinho", "Portugal", "CM"],
    ["Marco Tilio", "M. Tilio", "Australia", "RW"],
    ["Ibrahim Sangare", "I. Sangare", "Ivory Coast", "CDM"],
    ["Mustafa Nadhim", "M. Nadhim", "Iraq", "CB"],
    ["Ahmed Fatouh", "A. Fatouh", "Egypt", "LB"],
    ["Cameron Carter-Vickers Jr", "C. Jr", "USA", "CB"],
    ["Desire Doue", "D. Doue", "France", "CAM"],
    ["Pierre Kunde", "P. Kunde", "Cameroon", "CM"],
    ["Trincao", "Trincao", "Portugal", "RW"],
    ["Ken Sema", "K. Sema", "England", "LM"],
    ["Cristian Olivera", "C. Olivera", "Uruguay", "RW"],
    ["Yerry Mina Jr", "Y. Jr", "Colombia", "CB"],
    ["Hugo Vetlesen", "H. Vetlesen", "Belgium", "CM"],
    ["Santiago Mele", "S. Mele", "Uruguay", "GK"],
    ["Ali Karimi", "A. Karimi", "Iran", "CM"],
    ["Fran Vieites", "F. Vieites", "Spain", "GK"],
    ["Nico Gonzalez Porto", "N. Porto", "Portugal", "CM"],
    ["Youssouf Ndayishimiye", "Y. Ndayishimiye", "France", "CDM"],
    ["Luis Advincula", "L. Advincula", "Argentina", "RB"],
    ["Hossein Hosseini", "H. Hosseini", "Iran", "GK"],
    ["Hong Hyun-seok", "H. Hyun-seok", "South Korea", "CAM"],
    ["James Rodriguez", "J. Rodriguez", "Colombia", "CAM"],
    ["Shahriyar Moghanlou", "S. Moghanlou", "Iran", "ST"],
    ["Maximiliano Araujo", "M. Araujo", "Uruguay", "LW"],
    ["Oscar Trejo", "O. Trejo", "Spain", "CAM"],
    ["Guillermo Varela", "G. Varela", "Uruguay", "RB"],
    ["Piquerez", "Piquerez", "Brazil", "LB"],
    ["Maduka Okoye", "M. Okoye", "Nigeria", "GK"],
    ["Patrik Hrosovsky", "P. Hrosovsky", "Belgium", "CDM"],
    ["Luis Diaz Jr", "L. Jr", "Colombia", "LW"],
    ["Jassem Gaber", "J. Gaber", "Qatar", "CM"],
    ["Otabek Shukurov", "O. Shukurov", "Uzbekistan", "CM"],
    ["Ali Jasim", "A. Jasim", "Iraq", "RW"],
    ["Mohamed Bayo", "M. Bayo", "France", "ST"],
    ["Said Benrahma Jr", "S. Jr", "Algeria", "LW"],
    ["Angelino", "Angelino", "Italy", "LB"],
    ["Ivan Cavaleiro", "I. Cavaleiro", "Portugal", "LW"],
    ["Mohammed Al-Shanqiti", "M. Al-Shanqiti", "Saudi Arabia", "CB"],
    ["Georges-Kevin Nkoudou", "G. Nkoudou", "Cameroon", "LW"],
    ["Pathe Ciss Jr", "P. Jr", "Senegal", "CDM"],
    ["Ben Osborn", "B. Osborn", "England", "LM"],
    ["Rami Rabia", "R. Rabia", "Egypt", "CB"],
    ["Cody Gakpo Jr", "C. Jr", "Netherlands", "LW"],
    ["Emile Heskey Jr", "E. Jr", "England", "ST"],
    ["Rafael Santos Borre", "R. Borre", "Colombia", "ST"],
    ["Odsonne Edouard", "O. Edouard", "England", "ST"],
    ["Grant Hanley", "G. Hanley", "Scotland", "CB"],
    ["Hamza Igamane", "H. Igamane", "Scotland", "ST"],
    ["Ali Adnan", "A. Adnan", "Iraq", "LB"],
    ["Paulo Diaz", "P. Diaz", "Argentina", "CB"],
    ["Che Adams", "C. Adams", "Scotland", "ST"],
    ["Gustaf Nilsson", "G. Nilsson", "Belgium", "ST"],
    ["Julian Carranza", "J. Carranza", "Netherlands", "ST"],
    ["Nathan Ake Jr", "N. Jr", "Netherlands", "CB"],
    ["Bandar Al-Ahbabi", "B. Al-Ahbabi", "United Arab Emirates", "RB"],
    ["Simon Mignolet", "S. Mignolet", "Belgium", "GK"],
    ["Daniel James Jr", "D. Jr", "Wales", "RW"],
    ["Jake Bidwell", "J. Bidwell", "England", "LB"],
    ["Antoni Milambo", "A. Milambo", "Netherlands", "CM"],
    ["Raul Jimenez", "R. Jimenez", "England", "ST"],
    ["Jose Luis Morales", "J. Morales", "Spain", "ST"],
    ["Ousmane Dembele", "O. Dembele", "France", "RW"],
    ["Ismaily", "Ismaily", "France", "LB"],
    ["Roberto Alvarado", "R. Alvarado", "Mexico", "LW"],
    ["Brandon Borrello", "B. Borrello", "Australia", "RW"],
    ["Emiliano Martinez", "E. Martinez", "England", "GK"],
    ["Fabio Deivson", "F. Deivson", "Brazil", "GK"],
    ["Said Benrahma", "S. Benrahma", "England", "LW"],
    ["Munir Mohamedi", "M. Mohamedi", "Morocco", "GK"],
    ["Hamari Traore", "H. Traore", "Spain", "RB"],
    ["Jesus Angulo", "J. Angulo", "Mexico", "LB"],
    ["Kaveh Rezaei", "K. Rezaei", "Iran", "ST"],
    ["Pablo Fornals Jr", "P. Jr", "Spain", "CAM"],
    ["Pascal Gross Jr", "P. Jr", "Germany", "CM"],
    ["Zaid Tahseen", "Z. Tahseen", "Iraq", "CB"],
    ["Kim Ji-soo", "K. Ji-soo", "South Korea", "CB"],
    ["Jed Wallace", "J. Wallace", "England", "RW"],
    ["Sadio Mane", "S. Mane", "Senegal", "LW"],
    ["Yan Couto Jr", "Y. Jr", "Germany", "RB"],
    ["Ryan Fredericks", "R. Fredericks", "England", "RB"],
    ["Ousmane Diomande Jr", "O. Jr", "Ivory Coast", "CB"],
    ["Gianluca Gaetano", "G. Gaetano", "Italy", "CAM"],
    ["Mehdi Ghayedi", "M. Ghayedi", "Iran", "LW"],
    ["Guillermo Maripan", "G. Maripan", "Chile", "CB"],
    ["Luis Sinisterra Jr", "L. Jr", "Colombia", "LW"],
    ["Tiago Tomas", "T. Tomas", "Germany", "LW"],
    ["Galeno", "Galeno", "Portugal", "LW"],
    ["Tom Ince", "T. Ince", "England", "RW"],
    ["Yaser Asprilla Jr", "Y. Jr", "Colombia", "CAM"],
    ["Antonio Rudiger", "A. Rudiger", "Germany", "CB"],
    ["Lukas Hornicek", "L. Hornicek", "Portugal", "GK"],
    ["Tyronne Ebuehi", "T. Ebuehi", "Italy", "RB"],
    ["Antoine Semenyo Ghana", "A. Ghana", "Ghana", "ST"],
    ["Anders Dreyer", "A. Dreyer", "Belgium", "RW"],
    ["Ahmed Al-Kassar", "A. Al-Kassar", "Saudi Arabia", "GK"],
    ["Abdul Fatawu Issahaku", "A. Issahaku", "Ghana", "RW"],
    ["Andy Robertson Jr", "A. Jr", "Scotland", "LB"],
    ["Maximilian Mittelstadt", "M. Mittelstadt", "Germany", "LB"],
    ["Mauricio Isla", "M. Isla", "Chile", "RB"],
    ["William Troost-Ekong", "W. Troost-Ekong", "Nigeria", "CB"],
    ["Nicolas Viola", "N. Viola", "Italy", "CAM"],
    ["Zander Clark", "Z. Clark", "Scotland", "GK"],
    ["Aleix Garcia", "A. Garcia", "Spain", "CM"],
    ["Raul de Tomas", "R. de Tomas", "Spain", "ST"],
    ["Oscar de Marcos", "O. de Marcos", "Spain", "RB"],
    ["Jean-Matteo Bahoya", "J. Bahoya", "Germany", "LW"],
    ["Yasser Ibrahim", "Y. Ibrahim", "Egypt", "CB"],
    ["Mattéo Guendouzi Jr", "M. Jr", "France", "CM"],
    ["Aiden O'Neill", "A. O'Neill", "Australia", "CDM"],
    ["Rebin Sulaka", "R. Sulaka", "Iraq", "CB"],
    ["Jose Sa", "J. Sa", "Portugal", "GK"],
    ["Shane Duffy", "S. Duffy", "England", "CB"],
    ["Luis Chavez", "L. Chavez", "Mexico", "CM"],
    ["Josh Magennis", "J. Magennis", "Northern Ireland", "ST"],
    ["Joakim Maehle", "J. Maehle", "Germany", "LB"],
    ["Benat Prados", "B. Prados", "Spain", "CDM"],
    ["Valentin Carboni", "V. Carboni", "Argentina", "CAM"],
    ["Theo Bair", "T. Bair", "Canada", "ST"],
    ["Park Ji-soo", "P. Ji-soo", "South Korea", "CB"],
    ["Sorba Thomas", "S. Thomas", "Wales", "RW"],
    ["Awer Mabil", "A. Mabil", "Australia", "RW"],
    ["Giovani Lo Celso Jr", "G. Jr", "Argentina", "CAM"],
    ["Johan Mojica Jr", "J. Jr", "Colombia", "LB"],
    ["Aissa Mandi Algeria", "A. Algeria", "Algeria", "CB"],
    ["Soungoutou Magassa", "S. Magassa", "France", "CDM"],
    ["Ali Al-Hamadi", "A. Al-Hamadi", "England", "ST"],
    ["Georginio Rutter", "G. Rutter", "England", "CAM"],
    ["Nicolas Otamendi", "N. Otamendi", "Portugal", "CB"],
    ["Jose Palomino", "J. Palomino", "Italy", "CB"],
    ["Ismael Bennacer", "I. Bennacer", "Algeria", "CM"],
    ["Utkir Yusupov", "U. Yusupov", "Uzbekistan", "GK"],
    ["Sam Byram", "S. Byram", "England", "LB"],
    ["Aihen Munoz", "A. Munoz", "Spain", "LB"],
    ["Ardian Ismajli", "A. Ismajli", "Italy", "CB"],
    ["Sebastian Caceres", "S. Caceres", "Uruguay", "CB"],
    ["Khalid Al-Ghannam", "K. Al-Ghannam", "Saudi Arabia", "RW"],
    ["Rayan Ait-Nouri", "R. Ait-Nouri", "Algeria", "LB"],
    ["Leonardo Pavoletti", "L. Pavoletti", "Italy", "ST"],
    ["Yahya Al-Ghassani", "Y. Al-Ghassani", "United Arab Emirates", "LW"],
    ["Rafael Veiga", "R. Veiga", "Brazil", "CAM"],
    ["Massimo Luongo", "M. Luongo", "England", "CM"],
    ["Pedro Malheiro", "P. Malheiro", "Portugal", "RB"],
    ["Farès Chaibi", "F. Chaibi", "Germany", "CAM"],
    ["Lorenzo Lucca", "L. Lucca", "Italy", "ST"],
    ["Ryan Porteous", "R. Porteous", "England", "CB"],
    ["Ismaila Sarr Jr", "I. Jr", "Senegal", "RW"],
    ["Benjamin Andre", "B. Andre", "France", "CDM"],
    ["Clayton Silva", "C. Silva", "Portugal", "ST"],
    ["Joe Rodon", "J. Rodon", "England", "CB"],
    ["Alvaro Carreras", "A. Carreras", "Portugal", "LB"],
    ["Fabio Lima", "F. Lima", "United Arab Emirates", "CAM"],
    ["Daniel Munoz", "D. Munoz", "England", "RB"],
    ["Ahmed Touba", "A. Touba", "Algeria", "CB"],
    ["Mohamed Kanno", "M. Kanno", "Saudi Arabia", "CDM"],
    ["Lautaro Martinez", "L. Martinez", "Argentina", "ST"],
    ["Jurrien Timber Jr", "J. Jr", "Netherlands", "RB"],
    ["Matteo Guendouzi", "M. Guendouzi", "Italy", "CM"],
    ["Jamal Lewis Jr", "J. Jr", "Northern Ireland", "LB"],
    ["Rui Pedro", "R. Pedro", "Portugal", "ST"],
    ["Liam Kelly", "L. Kelly", "Scotland", "GK"],
    ["Nacho Fernandez", "N. Fernandez", "Argentina", "CAM"],
    ["Festy Ebosele", "F. Ebosele", "Ireland", "RB"],
    ["Ehsan Hajsafi", "E. Hajsafi", "Iran", "LB"],
    ["Matias Vecino", "M. Vecino", "Uruguay", "CM"],
    ["Antonio Sanchez", "A. Sanchez", "Spain", "CM"],
    ["Matheus Franca", "M. Franca", "England", "CAM"],
    ["Jaouen Hadjam", "J. Hadjam", "Algeria", "LB"],
    ["Tosin Oluwakemi", "T. Oluwakemi", "Belgium", "ST"],
    ["Olivier Mbaizo", "O. Mbaizo", "Cameroon", "RB"],
    ["Toni Lato", "T. Lato", "Spain", "LB"],
    ["Jack Clarke", "J. Clarke", "England", "LW"],
    ["Ruben Canedo", "R. Canedo", "United Arab Emirates", "CB"],
    ["Theo Hernandez", "T. Hernandez", "France", "LB"],
    ["Kevin Behrens", "K. Behrens", "Germany", "ST"],
    ["Callum Paterson", "C. Paterson", "England", "ST"],
    ["Daniel Ballard", "D. Ballard", "Northern Ireland", "CB"],
    ["Jean-Clair Todibo Jr", "J. Jr", "France", "CB"],
    ["Adam Smith", "A. Smith", "England", "RB"],
    ["Hulk", "Hulk", "Brazil", "ST"],
    ["Kelechi Nwakali", "K. Nwakali", "Nigeria", "CM"],
    ["Enzo Fernandez", "E. Fernandez", "Argentina", "CM"],
    ["Fabricio Bruno", "F. Bruno", "Brazil", "CB"],
    ["Wendell Jr", "W. Jr", "Brazil", "LB"],
    ["Gabriele Zappa", "G. Zappa", "Italy", "RB"],
    ["Nicolo Zaniolo Jr", "N. Jr", "Italy", "CAM"],
    ["Andrew Moran", "A. Moran", "Ireland", "CAM"],
    ["Davinson Sanchez", "D. Sanchez", "Colombia", "CB"],
    ["Saad Al-Sheeb", "S. Al-Sheeb", "Qatar", "GK"],
    ["Mario Stroeykens", "M. Stroeykens", "Belgium", "CAM"],
    ["Khalifa Al-Hammadi", "K. Al-Hammadi", "United Arab Emirates", "CB"],
    ["Haythem Jouini", "H. Jouini", "Tunisia", "ST"],
    ["Mohamed Hamdy", "M. Hamdy", "Egypt", "CB"],
    ["Copete", "Copete", "Spain", "CB"],
    ["Gabriel Martinelli Jr", "G. Jr", "Brazil", "LW"],
    ["Tanner Tessmann", "T. Tessmann", "USA", "CDM"],
    ["Sebastiano Luperto", "S. Luperto", "Italy", "CB"],
    ["Jason Knight", "J. Knight", "Ireland", "CM"],
    ["Tarek Salman", "T. Salman", "Qatar", "CB"],
    ["Marcos Acuna", "M. Acuna", "Argentina", "LB"],
    ["Eldor Shomurodov", "E. Shomurodov", "Italy", "ST"],
    ["Dávid Hancko", "D. Hancko", "Netherlands", "CB"],
    ["Charles Aranguiz", "C. Aranguiz", "Chile", "CM"],
    ["Abdon Prats", "A. Prats", "Spain", "ST"],
    ["Kyogo Furuhashi Japan", "K. Japan", "Japan", "ST"],
    ["Alexander Nubel Jr", "A. Jr", "Germany", "GK"],
    ["Lewis Cook", "L. Cook", "England", "CM"],
    ["Carlos Soler", "C. Soler", "England", "CM"],
    ["Theo Leoni", "T. Leoni", "Belgium", "CM"],
    ["Salem Al-Najdi", "S. Al-Najdi", "Saudi Arabia", "RW"],
    ["Seny Dieng", "S. Dieng", "Senegal", "GK"],
    ["Manu Kone", "M. Kone", "Italy", "CM"],
    ["Abdul Mumin", "A. Mumin", "Spain", "CB"],
    ["Oston Urunov", "O. Urunov", "Uzbekistan", "RW"],
    ["Francisco Conceicao", "F. Conceicao", "Portugal", "RW"],
    ["Liam Cooper", "L. Cooper", "Scotland", "CB"],
    ["Ibrahim Sulemana", "I. Sulemana", "Ghana", "CM"],
    ["Joel Ordonez", "J. Ordonez", "Belgium", "CB"],
    ["Nicolo Zaniolo", "N. Zaniolo", "England", "CAM"],
    ["Bobir Abdikholikov", "B. Abdikholikov", "Uzbekistan", "ST"],
    ["Mateo Joseph", "M. Joseph", "England", "ST"],
    ["Imran Louza", "I. Louza", "England", "CM"],
    ["Fran Perez", "F. Perez", "Spain", "RW"],
    ["Matheus Martins", "M. Martins", "England", "LW"],
    ["Joel Piroe", "J. Piroe", "England", "ST"],
    ["Fabian Bredlow", "F. Bredlow", "Germany", "GK"],
    ["Chumi", "Chumi", "Spain", "CB"],
    ["Nadir Zortea", "N. Zortea", "Italy", "RB"],
    ["Guillermo Martinez", "G. Martinez", "Mexico", "ST"],
    ["Nikola Krstovic", "N. Krstovic", "Italy", "ST"],
    ["Karim Boudiaf", "K. Boudiaf", "Qatar", "CDM"],
    ["Richard Rios", "R. Rios", "Colombia", "CM"],
    ["Bechir Ben Said", "B. Ben Said", "Tunisia", "GK"],
    ["Jacopo Fazzini", "J. Fazzini", "Italy", "CM"],
    ["Nicolas Gonzalez", "N. Gonzalez", "Argentina", "LW"],
    ["Abdullah Madu", "A. Madu", "Saudi Arabia", "CB"],
    ["Zito Luvumbo", "Z. Luvumbo", "Italy", "LW"],
    ["Predrag Rajkovic", "P. Rajkovic", "Spain", "GK"],
    ["Sergino Dest Jr", "S. Jr", "USA", "RB"],
    ["Youssouf Sabaly Jr", "Y. Jr", "Senegal", "RB"],
    ["Elia Caprile", "E. Caprile", "Italy", "GK"],
    ["George Saville Jr", "G. Jr", "Northern Ireland", "CM"],
    ["Liam Palmer", "L. Palmer", "England", "RB"],
    ["Mika Godts", "M. Godts", "Netherlands", "LW"],
    ["Zidane Iqbal", "Z. Iqbal", "Iraq", "CM"],
    ["Eldor Shomurodov Jr", "E. Jr", "Uzbekistan", "ST"],
    ["Jayson Molumby", "J. Molumby", "Ireland", "CM"],
    ["Akram Afif", "A. Afif", "Qatar", "LW"],
    ["Mostafa Shobeir", "M. Shobeir", "Egypt", "GK"],
    ["Abduvokhid Nematov", "A. Nematov", "Uzbekistan", "GK"],
    ["Ali Gholizadeh", "A. Gholizadeh", "Iran", "LW"],
    ["Adama Boiro", "A. Boiro", "Spain", "LB"],
    ["Bruno Guimaraes", "B. Guimaraes", "Brazil", "CM"],
    ["Arnau Martinez", "A. Martinez", "Spain", "RB"],
    ["Loic Bade", "L. Bade", "France", "CB"],
    ["Koki Machida", "K. Machida", "Japan", "CB"],
    ["Mohamed-Ali Cho", "M. Cho", "France", "RW"],
    ["Jeremie Boga", "J. Boga", "France", "LW"],
    ["Kosta Nedeljkovic", "K. Nedeljkovic", "England", "RB"],
    ["Walter Benitez", "W. Benitez", "Netherlands", "GK"],
    ["Bailey Peacock-Farrell", "B. Peacock-Farrell", "Northern Ireland", "GK"],
    ["Chimy Avila", "C. Avila", "Spain", "ST"],
    ["Samu Costa", "S. Costa", "Spain", "CDM"],
    ["Di'Shon Bernard", "D. Bernard", "England", "CB"],
    ["Zeno Debast Anderlecht", "Z. Anderlecht", "Belgium", "CB"],
    ["Hamdi Fathi", "H. Fathi", "Egypt", "CDM"],
    ["Ryan Gravenberch Jr", "R. Jr", "Netherlands", "CM"],
    ["Jaden Philogene", "J. Philogene", "England", "LW"],
    ["Abdelkarim Hassan", "A. Hassan", "Qatar", "LB"],
    ["Tomoki Iwata", "T. Iwata", "Scotland", "CDM"],
    ["Clement Lenglet", "C. Lenglet", "England", "CB"],
    ["Raul Albiol", "R. Albiol", "Spain", "CB"],
    ["Darren Randolph", "D. Randolph", "England", "GK"],
    ["Angel Correa", "A. Correa", "Argentina", "ST"],
    ["Omid Ebrahimi", "O. Ebrahimi", "Iran", "CDM"],
    ["Lewis Miller", "L. Miller", "Australia", "RB"],
    ["Jordan James", "J. James", "Wales", "CM"],
    ["Glen Kamara", "G. Kamara", "England", "CM"],
    ["Augusto Batalla", "A. Batalla", "Spain", "GK"],
    ["Lucas Beltran", "L. Beltran", "Argentina", "ST"],
    ["Chidera Ejuke", "C. Ejuke", "Nigeria", "LW"],
    ["Boualem Khoukhi", "B. Khoukhi", "Qatar", "CB"],
    ["Tom Bradshaw", "T. Bradshaw", "Wales", "ST"],
    ["Jesus Ferreira", "J. Ferreira", "USA", "ST"],
    ["Inigo Ruiz de Galarreta", "I. Ruiz de Galarreta", "Spain", "CDM"],
    ["Ahmed Aboul Fotouh", "A. Fotouh", "Egypt", "LB"],
    ["Romain Saiss", "R. Saiss", "Morocco", "CB"],
    ["Sean Steur", "S. Steur", "Netherlands", "CM"],
    ["Ondrej Lingr", "O. Lingr", "Netherlands", "CAM"],
    ["Conor Washington", "C. Washington", "Northern Ireland", "ST"],
    ["Ibrahim Adel", "I. Adel", "Egypt", "LW"],
    ["Ilkay Gundogan", "I. Gundogan", "Germany", "CM"],
    ["Yassine Benzia", "Y. Benzia", "Algeria", "CAM"],
    ["Callum Robinson", "C. Robinson", "England", "LW"],
    ["Farrukh Sayfiev", "F. Sayfiev", "Uzbekistan", "LB"],
    ["Unai Gomez", "U. Gomez", "Spain", "CM"],
    ["Farès Chaibi Jr", "F. Jr", "Algeria", "CAM"],
    ["Guido Rodriguez", "G. Rodriguez", "England", "CDM"],
    ["Mohamed El-Shenawy", "M. El-Shenawy", "Egypt", "GK"],
    ["Marvin Johnson", "M. Johnson", "England", "LB"],
    ["Silas Katompa Mvumpa", "S. Mvumpa", "Germany", "RW"],
    ["Ivan Balliu", "I. Balliu", "Spain", "RB"],
    ["Filippo Terracciano", "F. Terracciano", "Italy", "RB"],
    ["Jasur Yakhshiboev", "J. Yakhshiboev", "Uzbekistan", "LW"],
    ["Taher Mohamed", "T. Mohamed", "Egypt", "LW"],
    ["Jamilu Collins", "J. Collins", "Nigeria", "LB"],
    ["Justin Diehl", "J. Diehl", "Germany", "LW"],
    ["Igor Sergeev", "I. Sergeev", "Uzbekistan", "ST"],
    ["Otavio", "Otavio", "Portugal", "CAM"],
    ["George Saville", "G. Saville", "England", "CM"],
    ["Daniel Arzani", "D. Arzani", "Australia", "LW"],
    ["Gerardo Arteaga", "G. Arteaga", "Mexico", "LB"],
    ["Dani Rodriguez", "D. Rodriguez", "Spain", "CAM"],
    ["Colin Coosemans", "C. Coosemans", "Belgium", "GK"],
    ["Jose Gaya", "J. Gaya", "Spain", "LB"],
    ["Alessandro Circati", "A. Circati", "Australia", "CB"],
    ["Sergio Leon", "S. Leon", "Spain", "ST"],
    ["Song Bum-keun", "S. Bum-keun", "South Korea", "GK"],
    ["Guela Doue", "G. Doue", "France", "RB"],
    ["Cheick Doucoure", "C. Doucoure", "England", "CDM"],
    ["Diego Lopez", "D. Lopez", "Spain", "RW"],
    ["Raul Jimenez Jr", "R. Jr", "Mexico", "ST"],
    ["Keanu Baccus", "K. Baccus", "Australia", "CDM"],
    ["Jaidon Anthony", "J. Anthony", "England", "LW"],
    ["Marcus Tavernier", "M. Tavernier", "England", "LW"],
    ["Kai Havertz Jr", "K. Jr", "Germany", "ST"],
    ["Marcelino Nunez", "M. Nunez", "Chile", "CM"],
    ["Alex Moreno", "A. Moreno", "England", "LB"],
    ["Pedro Goncalves", "P. Goncalves", "Portugal", "CAM"],
    ["Anel Ahmedhodzic", "A. Ahmedhodzic", "England", "CB"],
    ["Kim Tae-hwan", "K. Tae-hwan", "South Korea", "RB"],
    ["Ze Pedro", "Z. Pedro", "Portugal", "CB"],
    ["Luiz Henrique", "L. Henrique", "Brazil", "RW"],
    ["Odiljon Hamrobekov", "O. Hamrobekov", "Uzbekistan", "CDM"],
    ["Paul Smyth", "P. Smyth", "Northern Ireland", "RW"],
    ["Niclas Fullkrug Jr", "N. Jr", "Germany", "ST"],
    ["Mauro Junior", "M. Junior", "Netherlands", "LB"],
    ["Pablo Rosario", "P. Rosario", "France", "CDM"],
    ["Yannick Gerhardt", "Y. Gerhardt", "Germany", "CM"],
    ["Jens Grahl", "J. Grahl", "Germany", "GK"],
    ["Josh Cullen", "J. Cullen", "Ireland", "CDM"],
    ["Angus Gunn", "A. Gunn", "Scotland", "GK"],
    ["Crysencio Summerville Jr", "C. Jr", "England", "LW"],
    ["Vitor Carvalho", "V. Carvalho", "Portugal", "CDM"],
    ["Gianluca Caprari", "G. Caprari", "Italy", "LW"],
    ["Kaine Kesler-Hayden", "K. Kesler-Hayden", "England", "RB"],
    ["Christian Mawissa", "C. Mawissa", "France", "CB"],
    ["Carlos Cuesta", "C. Cuesta", "Colombia", "CB"],
    ["Warren Zaire-Emery", "W. Zaire-Emery", "France", "CM"],
    ["Moise Bombito", "M. Bombito", "Canada", "CB"],
    ["Umar Eshmurodov", "U. Eshmurodov", "Uzbekistan", "CB"],
    ["Anis Hadj Moussa", "A. Moussa", "Netherlands", "RW"],
    ["Hendrik Van Crombrugge", "H. Van Crombrugge", "Belgium", "GK"],
    ["Haitham Asiri", "H. Asiri", "Saudi Arabia", "RW"],
    ["Jack Colback", "J. Colback", "England", "CM"],
    ["Leroy Sane", "L. Sane", "Germany", "RW"],
    ["Oussama Idrissi", "O. Idrissi", "Morocco", "LW"],
    ["Ederson Jose", "E. Jose", "Italy", "CM"],
    ["Hugo Ekitike Jr", "H. Jr", "Germany", "ST"],
    ["Jordan Lotomba", "J. Lotomba", "France", "RB"],
    ["Rhian Brewster", "R. Brewster", "England", "ST"],
    ["Tolu Arokodare Jr", "T. Jr", "Nigeria", "ST"],
    ["Carlos Rodriguez", "C. Rodriguez", "Mexico", "CM"],
    ["Ahmed El-Shenawy", "A. El-Shenawy", "Egypt", "GK"],
    ["Devis Vasquez", "D. Vasquez", "Italy", "GK"],
    ["Raphael Onyedika Jr", "R. Jr", "Nigeria", "CDM"],
    ["Ali Mabkhout", "A. Mabkhout", "United Arab Emirates", "ST"],
    ["Ali Maaloul", "A. Maaloul", "Tunisia", "LB"],
    ["Mukhtar Ali", "M. Ali", "Saudi Arabia", "CM"],
    ["Hamza Rafia", "H. Rafia", "Tunisia", "CAM"],
    ["Steven Davis", "S. Davis", "Northern Ireland", "CM"],
    ["Assim Madibo", "A. Madibo", "Qatar", "CDM"],
    ["Saman Ghoddos", "S. Ghoddos", "Iran", "CAM"],
    ["Alessandro Deiola", "A. Deiola", "Italy", "CM"],
    ["Vedat Muriqi", "V. Muriqi", "Spain", "ST"],
    ["Abdulla Ramadan", "A. Ramadan", "United Arab Emirates", "CM"],
    ["Adam Idah Jr", "A. Jr", "Ireland", "ST"],
    ["Ahmed Alaaeldin", "A. Alaaeldin", "Qatar", "RW"],
    ["Stole Dimitrievski", "S. Dimitrievski", "Spain", "GK"],
    ["Savinho Jr", "S. Jr", "Brazil", "RW"],
    ["Dango Ouattara", "D. Ouattara", "England", "RW"],
    ["Paul Dummett", "P. Dummett", "England", "CB"],
    ["Vaclav Cerny", "V. Cerny", "Scotland", "RW"],
    ["Philipp Kohn", "P. Kohn", "France", "GK"],
    ["Leif Davis", "L. Davis", "England", "LB"],
    ["Alexis Saelemaekers", "A. Saelemaekers", "Italy", "RW"],
    ["Fran Garcia", "F. Garcia", "Spain", "LB"],
    ["Barry Bannan", "B. Bannan", "England", "CM"],
    ["Bobby Decordova-Reid", "B. Decordova-Reid", "England", "CAM"],
    ["Ali Abdi", "A. Abdi", "France", "LB"],
    ["Ali Abdi Jr", "A. Jr", "Tunisia", "LB"],
    ["Luis Vazquez", "L. Vazquez", "Belgium", "ST"],
    ["Akram Tawfik", "A. Tawfik", "Egypt", "CM"],
    ["Stephen Eustaquio", "S. Eustaquio", "Portugal", "CM"],
    ["Wilfried Singo Jr", "W. Jr", "Ivory Coast", "RB"],
    ["Hwang Ui-jo", "H. Ui-jo", "South Korea", "ST"],
    ["Andy Irving", "A. Irving", "England", "CM"],
    ["Badredine Bouanani", "B. Bouanani", "France", "RW"],
    ["Cameron Burgess Jr", "C. Jr", "Australia", "CB"],
    ["Hector Bellerin", "H. Bellerin", "Spain", "RB"],
    ["Manuel Lazzari", "M. Lazzari", "Italy", "RB"],
    ["Mohamed Farsi", "M. Farsi", "Algeria", "RB"],
    ["Kwasi Sibo", "K. Sibo", "Ghana", "CM"],
    ["Nicolo Fagioli", "N. Fagioli", "Italy", "CM"],
    ["Max Aarons", "M. Aarons", "England", "RB"],
    ["David Brooks", "D. Brooks", "Wales", "CAM"],
    ["Nino", "Nino", "Brazil", "CB"],
    ["Luciano Rodriguez", "L. Rodriguez", "Uruguay", "ST"],
    ["Dario Osorio", "D. Osorio", "Chile", "RW"],
    ["Vaclav Cerny Jr", "V. Jr", "Germany", "RW"],
    ["Jordan Thompson", "J. Thompson", "Northern Ireland", "CM"],
    ["Danilo Pereira", "D. Pereira", "Portugal", "CDM"],
    ["Jamie Shackleton", "J. Shackleton", "England", "RB"],
    ["Franck Kessie", "F. Kessie", "Ivory Coast", "CM"],
    ["Vanderson Jr", "V. Jr", "Brazil", "RB"],
    ["Ferran Jutgla", "F. Jutgla", "Belgium", "ST"],
    ["Mohanad Ali", "M. Ali", "Iraq", "ST"],
    ["Gabriel Magalhaes Jr", "G. Jr", "Brazil", "CB"],
    ["Mark Travers Jr", "M. Jr", "Ireland", "GK"],
    ["Junior Hoilett", "J. Hoilett", "Canada", "LW"],
    ["Mahmoud Hamada", "M. Hamada", "Egypt", "LB"],
    ["Sam Morsy", "S. Morsy", "England", "CDM"],
    ["Andre Silva", "A. Silva", "Spain", "ST"],
    ["Anthony Ralston", "A. Ralston", "Scotland", "RB"],
    ["Saidou Sow", "S. Sow", "France", "CB"],
    ["Lukasz Fabianski Jr", "L. Jr", "England", "GK"],
    ["Mario Pasalic", "M. Pasalic", "Italy", "CM"],
    ["Darwin Nunez Jr", "D. Jr", "Uruguay", "ST"],
    ["Milad Mohammadi", "M. Mohammadi", "Iran", "LB"],
    ["Artem Dovbyk Jr", "A. Jr", "Italy", "ST"],
    ["Goncalo Ramos", "G. Ramos", "Portugal", "ST"],
    ["Conor Hazard", "C. Hazard", "Northern Ireland", "GK"],
    ["Edson Alvarez", "E. Alvarez", "England", "CDM"],
    ["Salman Al-Faraj", "S. Al-Faraj", "Saudi Arabia", "CM"],
    ["Majid Hosseini", "M. Hosseini", "Iran", "CB"],
    ["Yuki Soma", "Y. Soma", "Japan", "LW"],
    ["Ali Khaseif", "A. Khaseif", "United Arab Emirates", "GK"],
    ["Philip Billing", "P. Billing", "England", "CM"],
    ["Marcel Ruiz", "M. Ruiz", "Mexico", "CM"],
    ["Nehuen Perez", "N. Perez", "Argentina", "CB"],
    ["Omari Hutchinson", "O. Hutchinson", "England", "RW"],
    ["Massimo Luongo Jr", "M. Jr", "Australia", "CM"],
    ["Nilson Angulo", "N. Angulo", "Belgium", "LW"],
    ["Hamed Traore", "H. Traore", "England", "CAM"],
    ["Unai Simon", "U. Simon", "Spain", "GK"],
    ["Lamine Camara Jr", "L. Jr", "Senegal", "CM"],
    ["Lois Openda", "L. Openda", "Germany", "ST"],
    ["John Egan", "J. Egan", "Ireland", "CB"],
    ["Radoslaw Majecki", "R. Majecki", "France", "GK"],
    ["Pape Abou Cisse", "P. Cisse", "Senegal", "CB"],
    ["Emanuel Emegha", "E. Emegha", "France", "ST"],
    ["Caio Canedo", "C. Canedo", "United Arab Emirates", "ST"],
    ["Ryoya Morishita", "R. Morishita", "Japan", "LB"],
    ["Matheus Pereira", "M. Pereira", "Brazil", "CAM"],
    ["Alireza Beiranvand", "A. Beiranvand", "Iran", "GK"],
    ["Ali Ahmed", "A. Ahmed", "Canada", "LW"],
    ["Amirhossein Hosseinzadeh", "A. Hosseinzadeh", "Iran", "LW"],
    ["Alexis Mac Allister Jr", "A. Mac Allister Jr", "Argentina", "CM"],
    ["Mathias Olivera", "M. Olivera", "Uruguay", "LB"],
    ["Leandro Trossard Jr", "L. Jr", "Belgium", "LW"],
    ["Jack Taylor", "J. Taylor", "England", "CM"],
    ["Krepin Diatta", "K. Diatta", "France", "RW"],
    ["Isaac Price", "I. Price", "Northern Ireland", "CM"],
    ["Timothy Chandler", "T. Chandler", "Germany", "RB"],
    ["Luka Ivanusec", "L. Ivanusec", "Netherlands", "LW"],
    ["Christian Kouame", "C. Kouame", "Ivory Coast", "ST"],
    ["Alex Scott", "A. Scott", "England", "CM"],
    ["Joaquin Piquerez", "J. Piquerez", "Uruguay", "LB"],
    ["Siebe Van der Heyden", "S. Van der Heyden", "Spain", "CB"],
    ["Adam Aznou", "A. Aznou", "Morocco", "LB"],
    ["Jordan Hugill", "J. Hugill", "England", "ST"],
    ["Aleix Garcia Jr", "A. Jr", "Spain", "CM"],
    ["Lloyd Kelly", "L. Kelly", "England", "CB"],
    ["Luis Suarez Colombia", "L. Colombia", "Spain", "ST"],
    ["Aymen Hussein", "A. Hussein", "Iraq", "ST"],
    ["Matt Doherty", "M. Doherty", "Ireland", "RB"],
    ["Nahitan Nandez", "N. Nandez", "Uruguay", "RB"],
    ["Youri Baas", "Y. Baas", "Netherlands", "LB"],
    ["Rui Patricio Jr", "R. Jr", "Italy", "GK"],
    ["Cristian Borja", "C. Borja", "Portugal", "LB"],
    ["Joao Gomes", "J. Gomes", "Brazil", "CM"],
    ["Pablo Maffeo", "P. Maffeo", "Spain", "RB"],
    ["Liam Cullen", "L. Cullen", "Wales", "ST"],
    ["Osama Faisal", "O. Faisal", "Egypt", "ST"],
    ["Ismaila Sarr", "I. Sarr", "England", "RW"],
    ["Jaminton Campaz", "J. Campaz", "Colombia", "LW"],
    ["Ransford-Yeboah Konigsdorffer", "R. Konigsdorffer", "Ghana", "ST"],
    ["Maarten Vandevoordt", "M. Vandevoordt", "Belgium", "GK"],
    ["Antoine Mendy", "A. Mendy", "France", "RB"],
    ["Adam Marusic", "A. Marusic", "Italy", "RB"],
    ["Johan Vasquez", "J. Vasquez", "Mexico", "CB"],
    ["Robin Koch Jr", "R. Jr", "Germany", "CB"],
    ["Florentino Luis", "F. Luis", "Portugal", "CDM"],
    ["Jeremie Boga Jr", "J. Jr", "Ivory Coast", "LW"],
    ["Chiedozie Ogbene", "C. Ogbene", "Ireland", "RW"],
    ["Fisayo Dele-Bashiru", "F. Dele-Bashiru", "Nigeria", "CM"],
    ["Joseph Wollacott", "J. Wollacott", "Ghana", "GK"],
    ["Yassine Kechta", "Y. Kechta", "Morocco", "CM"],
    ["Ollie Cooper", "O. Cooper", "Wales", "CM"],
    ["Pep Biel", "P. Biel", "Belgium", "CAM"],
    ["Adam Masina Jr", "A. Jr", "Morocco", "LB"],
    ["Brayan Cortes", "B. Cortes", "Chile", "GK"],
    ["Dion Charles", "D. Charles", "Northern Ireland", "ST"],
    ["Ezequiel Barco", "E. Barco", "Argentina", "LW"],
    ["Amad Diallo Jr", "A. Jr", "Ivory Coast", "RW"],
    ["Khalil Ibrahim", "K. Ibrahim", "United Arab Emirates", "LW"],
    ["Hossein Kanaanizadegan", "H. Kanaanizadegan", "Iran", "CB"],
    ["Joel Chima Fujita", "J. Fujita", "Japan", "CM"],
    ["Kamil Grabara", "K. Grabara", "Germany", "GK"],
    ["Ander Herrera", "A. Herrera", "Spain", "CM"],
    ["Javi Galan", "J. Galan", "Spain", "LB"],
    ["Igor Lichnovsky", "I. Lichnovsky", "Chile", "CB"],
    ["Ali Saleh", "A. Saleh", "United Arab Emirates", "RW"],
    ["Max Gradel", "M. Gradel", "Ivory Coast", "LW"],
    ["Roberto Soldado", "R. Soldado", "Spain", "ST"],
    ["Jakub Jankto", "J. Jankto", "Italy", "LM"],
    ["Francesco Pio Esposito", "F. Esposito", "Italy", "ST"],
    ["Jhon Cordoba", "J. Cordoba", "Colombia", "ST"],
    ["Gabriel Suazo", "G. Suazo", "Chile", "LB"],
    ["Robbie Brady", "R. Brady", "Ireland", "LB"],
    ["Romeo Vermant", "R. Vermant", "Belgium", "ST"],
    ["Jamal Lewis", "J. Lewis", "England", "LB"],
    ["Hakon Haraldsson", "H. Haraldsson", "France", "CAM"],
    ["Marwan Attia", "M. Attia", "Egypt", "CDM"],
    ["Stephen Eustaquio Jr", "S. Jr", "Canada", "CM"],
    ["Riccardo Calafiori Jr", "R. Jr", "Italy", "CB"],
    ["Matias Fernandez-Pardo", "M. Fernandez-Pardo", "France", "LW"],
    ["Shea Charles", "S. Charles", "Northern Ireland", "CDM"],
    ["Steven Benda", "S. Benda", "England", "GK"],
    ["Moteb Al-Harbi", "M. Al-Harbi", "Saudi Arabia", "LB"],
    ["Pathe Ciss", "P. Ciss", "Spain", "CDM"],
    ["Hussain Al-Qahtani", "H. Al-Qahtani", "Saudi Arabia", "RM"],
    ["Rony", "Rony", "Brazil", "LW"],
    ["Sammie Szmodics", "S. Szmodics", "Ireland", "CAM"],
    ["Bassam Al-Rawi", "B. Al-Rawi", "Qatar", "CB"],
    ["Couhaib Driouech", "C. Driouech", "Netherlands", "RW"],
    ["Charlie Savage", "C. Savage", "Wales", "CM"],
    ["Hicham Boudaoui Jr", "H. Jr", "Algeria", "CM"],
    ["Craig Gordon", "C. Gordon", "Scotland", "GK"],
    ["Cherif Ndiaye", "C. Ndiaye", "Senegal", "ST"],
    ["Aissa Laidouni", "A. Laidouni", "Tunisia", "CM"],
    ["Marc-Andre ter Stegen", "M. ter Stegen", "Germany", "GK"],
    ["Niclas Fullkrug", "N. Fullkrug", "England", "ST"],
    ["Inaki Williams Jr", "I. Jr", "Ghana", "ST"],
    ["Ismael Kone", "I. Kone", "Canada", "CM"],
    ["Santiago Gimenez", "S. Gimenez", "Netherlands", "ST"],
    ["Trai Hume", "T. Hume", "Northern Ireland", "RB"],
    ["Tyrese Campbell", "T. Campbell", "England", "ST"],
    ["Junior Firpo", "J. Firpo", "England", "LB"],
    ["Agustin Canobbio", "A. Canobbio", "Uruguay", "RW"],
    ["Roberto Piccoli Jr", "R. Jr", "Italy", "ST"],
    ["Sergio Arribas", "S. Arribas", "Spain", "CAM"],
    ["Douglas Santos", "D. Santos", "Brazil", "LB"],
    ["Adama Traore", "A. Traore", "England", "RW"],
    ["Brahim Diaz", "B. Diaz", "Morocco", "CAM"],
    ["Antonio Raillo", "A. Raillo", "Spain", "CB"],
    ["Viktor Tsygankov", "V. Tsygankov", "Spain", "RW"],
    ["Ermedin Demirovic", "E. Demirovic", "Germany", "ST"],
    ["Bjorn Meijer", "B. Meijer", "Belgium", "LB"],
    ["Mamadou Coulibaly", "M. Coulibaly", "France", "CDM"],
    ["Lois Openda Jr", "L. Jr", "Belgium", "ST"],
    ["Remy Cabella", "R. Cabella", "France", "CAM"],
    ["Rafael Leao Jr", "R. Jr", "Portugal", "LW"],
    ["Alphonso Davies Canada", "A. Canada", "Canada", "LB"],
    ["Chris-Kevin Nadje", "C. Nadje", "Netherlands", "ST"],
    ["Daniel Munoz Jr", "D. Jr", "Belgium", "RB"],
    ["Mujaid Sadick", "M. Sadick", "Belgium", "CB"],
    ["Igor Matanovic", "I. Matanovic", "Germany", "ST"],
    ["Won Du-jae", "W. Du-jae", "South Korea", "CDM"],
    ["Aster Vranckx", "A. Vranckx", "Belgium", "CM"],
    ["Pablo Fornals", "P. Fornals", "England", "CAM"],
    ["Martin Hongla", "M. Hongla", "Cameroon", "CDM"],
    ["Koen Casteels Jr", "K. Jr", "Belgium", "GK"],
    ["Mattia Felici", "M. Felici", "Italy", "LW"],
    ["Mohamed Ali Ben Romdhane", "M. Ali Ben Romdhane", "Tunisia", "CM"],
    ["Santi Comesana", "S. Comesana", "Spain", "CM"],
    ["Maxence Lacroix", "M. Lacroix", "Germany", "CB"],
    ["Ryan Flamingo", "R. Flamingo", "Netherlands", "CB"],
    ["Jacob Shaffelburg", "J. Shaffelburg", "Canada", "LW"],
    ["Vicente Iborra", "V. Iborra", "Spain", "CM"],
    ["Sasa Lukic", "S. Lukic", "England", "CM"],
    ["Mohamed Abdel Shafy", "M. Shafy", "Egypt", "LB"],
    ["Osame Sahraoui", "O. Sahraoui", "France", "LW"],
    ["Jehad Thakri", "J. Thakri", "Saudi Arabia", "CB"],
    ["Ivan Jaime", "I. Jaime", "Portugal", "CAM"],
    ["Ciaron Brown", "C. Brown", "Northern Ireland", "CB"],
    ["Joao Cancelo", "J. Cancelo", "Portugal", "RB"],
    ["Fahad Talib", "F. Talib", "Iraq", "GK"],
    ["Jeff Chabot", "J. Chabot", "Germany", "CB"],
    ["Estevao Willian", "E. Willian", "Brazil", "RW"],
    ["Matheus Magalhaes", "M. Magalhaes", "Portugal", "GK"],
    ["Yeray Alvarez", "Y. Alvarez", "Spain", "CB"],
    ["Jean Michael Seri", "J. Seri", "Ivory Coast", "CM"],
    ["Kristoffer Lund", "K. Lund", "USA", "LB"],
    ["Matte Smets", "M. Smets", "Belgium", "CB"],
    ["Will Vaulks", "W. Vaulks", "England", "CM"],
    ["Mathieu Choiniere", "M. Choiniere", "Canada", "CM"],
    ["Assane Diao", "A. Diao", "Spain", "RW"],
    ["Francis Amuzu", "F. Amuzu", "Belgium", "LW"],
    ["Harib Abdalla", "H. Abdalla", "United Arab Emirates", "RW"],
    ["Ismail Jakobs", "I. Jakobs", "Senegal", "LB"],
    ["Chadi Riad", "C. Riad", "Morocco", "CB"],
    ["Luis Romo", "L. Romo", "Mexico", "CM"],
    ["Takuma Asano Jr", "T. Jr", "Japan", "RW"],
    ["Vincent Janssen", "V. Janssen", "Belgium", "ST"],
    ["Razvan Marin", "R. Marin", "Italy", "CM"],
    ["Cedric Bakambu", "C. Bakambu", "Spain", "ST"],
    ["Anthony Musaba", "A. Musaba", "England", "LW"],
    ["Cesar Montes", "C. Montes", "Mexico", "CB"],
    ["Ricardo Rodriguez", "R. Rodriguez", "Spain", "LB"],
    ["Hassan Al-Haydos", "H. Al-Haydos", "Qatar", "CAM"],
    ["Anton Gaaei", "A. Gaaei", "Netherlands", "RB"],
    ["Ahmed Yasser Rayan", "A. Rayan", "Egypt", "ST"],
    ["Karim El Debes", "K. El Debes", "Egypt", "CM"],
    ["Hamad Al-Yami", "H. Al-Yami", "Saudi Arabia", "CB"],
    ["Finn Azaz", "F. Azaz", "Ireland", "CAM"],
    ["Maxime Crepeau", "M. Crepeau", "Canada", "GK"],
    ["Taty Castellanos", "T. Castellanos", "Italy", "ST"],
    ["Cesar Tarrega", "C. Tarrega", "Spain", "CB"],
    ["Umar Sadiq Jr", "U. Jr", "Nigeria", "ST"],
    ["Oliver Norwood", "O. Norwood", "England", "CDM"],
    ["Orkun Kokcu", "O. Kokcu", "Portugal", "CM"],
    ["Nordin Jackers", "N. Jackers", "Belgium", "GK"],
    ["Jaume Domenech", "J. Domenech", "Spain", "GK"],
    ["Paul Izzo", "P. Izzo", "Australia", "GK"],
    ["Brian Rodriguez", "B. Rodriguez", "Uruguay", "LW"],
    ["Rais M'Bolhi", "R. M'Bolhi", "Algeria", "GK"],
    ["Johan Mojica", "J. Mojica", "Spain", "LB"],
    ["Mahmoud Kahraba", "M. Kahraba", "Egypt", "ST"],
    ["Vladimir Coufal", "V. Coufal", "England", "RB"],
    ["Rodrigo Echeverria", "R. Echeverria", "Chile", "CM"],
    ["Marco Brescianini", "M. Brescianini", "Italy", "CM"],
    ["Dominic Iorfa", "D. Iorfa", "England", "CB"],
    ["Harry Clarke", "H. Clarke", "England", "RB"],
    ["Nathan Jones", "N. Jones", "England", "CM"],
    ["Melvin Bard", "M. Bard", "France", "LB"],
    ["Abakar Sylla", "A. Sylla", "France", "CB"],
    ["Josh Brownhill", "J. Brownhill", "England", "CM"],
    ["Majed Hassan", "M. Hassan", "United Arab Emirates", "CDM"],
    ["Gustavo Gomez", "G. Gomez", "Brazil", "CB"],
    ["Yahia Attiyat Allah", "Y. Allah", "Morocco", "LB"],
    ["Ethan Ampadu Jr", "E. Jr", "Wales", "CDM"],
    ["Patrick Yazbek", "P. Yazbek", "Australia", "CM"],
    ["Andre Onana Jr", "A. Jr", "Cameroon", "GK"],
    ["Ryan Porteous Jr", "R. Jr", "Scotland", "CB"],
    ["James Forrest", "J. Forrest", "Scotland", "RW"],
    ["Andre Trindade", "A. Trindade", "Brazil", "CDM"],
    ["Pedro Miguel", "P. Miguel", "Qatar", "RB"],
    ["Chris Mepham", "C. Mepham", "England", "CB"],
    ["Nicolas Kuhn", "N. Kuhn", "Scotland", "RW"],
    ["Patric", "Patric", "Italy", "CB"],
    ["Jayden Bogle", "J. Bogle", "England", "RB"],
    ["Um Ji-sung", "U. Ji-sung", "South Korea", "LW"],
    ["Orbelin Pineda", "O. Pineda", "Mexico", "CAM"],
    ["Jorge Carrascal", "J. Carrascal", "Colombia", "CAM"],
    ["Rubin Colwill", "R. Colwill", "Wales", "CAM"],
    ["Zakaria El Ouahdi", "Z. El Ouahdi", "Morocco", "RB"],
    ["Ross McCausland", "R. McCausland", "Scotland", "RW"],
    ["Unai Nunez", "U. Nunez", "Spain", "CB"],
    ["Maximilian Arnold", "M. Arnold", "Germany", "CM"],
    ["Bashar Resan", "B. Resan", "Iraq", "CM"],
    ["Hirving Lozano Mexico", "H. Mexico", "Mexico", "RW"],
    ["Milos Kerkez Jr", "M. Jr", "England", "LB"],
    ["Guido Rodriguez Jr", "G. Jr", "Argentina", "CDM"],
    ["James Beadle", "J. Beadle", "England", "GK"],
    ["Samuel Piette", "S. Piette", "Canada", "CDM"],
    ["Nasser Al-Omran", "N. Al-Omran", "Saudi Arabia", "CB"],
    ["Lyndon Dykes", "L. Dykes", "Scotland", "ST"],
    ["Andre Silva Leipzig", "A. Leipzig", "Germany", "ST"],
    ["Morgan Sanson", "M. Sanson", "France", "CM"],
    ["Abdelkader Bedrane", "A. Bedrane", "Algeria", "CB"],
    ["Willi Orban", "W. Orban", "Germany", "CB"],
    ["Caoimhin Kelleher Jr", "C. Jr", "Ireland", "GK"],
    ["Antoine Makoumbou", "A. Makoumbou", "Italy", "CDM"],
    ["Daniel Munoz Colombia", "D. Colombia", "Colombia", "RB"],
    ["Jaloliddin Masharipov", "J. Masharipov", "Uzbekistan", "LW"],
    ["Yusuf Abdurisag", "Y. Abdurisag", "Qatar", "RW"],
    ["Krepin Diatta Jr", "K. Jr", "Senegal", "RW"],
    ["Saeid Sadeghi", "S. Sadeghi", "Iran", "LM"],
    ["Kim Moon-hwan", "K. Moon-hwan", "South Korea", "RB"],
    ["Djordje Petrovic", "D. Petrovic", "France", "GK"],
    ["Nathan Broadhead Jr", "N. Jr", "Wales", "LW"],
    ["Gaetan Laborde", "G. Laborde", "France", "ST"],
    ["Eric Garcia", "E. Garcia", "Spain", "CB"],
    ["Lee Myung-jae", "L. Myung-jae", "South Korea", "LB"],
    ["Enes Unal", "E. Unal", "England", "ST"],
    ["Illan Meslier Jr", "I. Jr", "France", "GK"],
    ["Waleed Al-Ahmed", "W. Al-Ahmed", "Saudi Arabia", "RW"],
    ["Peter Gulacsi", "P. Gulacsi", "Germany", "GK"],
    ["Tolu Arokodare", "T. Arokodare", "Belgium", "ST"],
    ["Lucas Paqueta", "L. Paqueta", "England", "CAM"],
    ["Walter Benitez Jr", "W. Jr", "Argentina", "GK"],
    ["Pedro Rodriguez", "P. Rodriguez", "Italy", "LW"],
    ["Portu", "Portu", "Spain", "RW"],
    ["Kevin Alvarez", "K. Alvarez", "Mexico", "RB"],
    ["Pietro Pellegri", "P. Pellegri", "Italy", "ST"],
    ["Tomas Cuello", "T. Cuello", "Brazil", "LW"],
    ["Enzo Le Fee", "E. Le Fee", "Italy", "CM"],
    ["Omar Mascarell", "O. Mascarell", "Spain", "CDM"],
    ["Mohammed Muntari", "M. Muntari", "Qatar", "ST"],
    ["Jamie Paterson", "J. Paterson", "England", "CAM"],
    ["Soufiane Rahimi", "S. Rahimi", "Morocco", "ST"],
    ["Jeffrey Schlupp", "J. Schlupp", "Ghana", "LM"],
    ["Goncalo Inacio", "G. Inacio", "Portugal", "CB"],
    ["Garang Kuol", "G. Kuol", "Australia", "LW"],
    ["Ben Brereton Diaz", "B. Diaz", "Chile", "ST"],
    ["Cesar Huerta", "C. Huerta", "Mexico", "LW"],
    ["Genki Haraguchi", "G. Haraguchi", "Japan", "CM"],
    ["Alvaro Montero", "A. Montero", "Colombia", "GK"],
    ["Edgar Gonzalez", "E. Gonzalez", "Spain", "CB"],
    ["Nabil Emad Dunga", "N. Dunga", "Egypt", "CDM"],
    ["Kaishu Sano", "K. Sano", "Japan", "CDM"],
    ["Patrick Schulte", "P. Schulte", "USA", "GK"],
    ["Erick Sanchez", "E. Sanchez", "Mexico", "CM"],
    ["Jesurun Rak-Sakyi Jr", "J. Jr", "England", "RW"],
    ["Matias Soule", "M. Soule", "Italy", "RW"],
    ["Aitor Ruibal", "A. Ruibal", "Spain", "RW"],
    ["Alfie Doughty", "A. Doughty", "England", "LB"],
    ["Dilane Bakwa", "D. Bakwa", "France", "RW"],
    ["Mohammed Al-Yami", "M. Al-Yami", "Saudi Arabia", "GK"],
    ["Kiko Bondoso", "K. Bondoso", "Portugal", "LW"],
    ["Ahmed Al-Rawi", "A. Al-Rawi", "Qatar", "ST"],
    ["Brandon Mechele", "B. Mechele", "Belgium", "CB"],
    ["Yira Sor", "Y. Sor", "Belgium", "LW"],
    ["Moussa Niakhate", "M. Niakhate", "Senegal", "CB"],
    ["Oscar Hojlund", "O. Hojlund", "Germany", "CDM"],
    ["Nedim Bajrami", "N. Bajrami", "Scotland", "CAM"],
    ["Badra Ali Sangare", "B. Sangare", "Ivory Coast", "GK"],
    ["Ahmed Yahya", "A. Yahya", "Iraq", "RB"],
    ["Abdulellah Al-Malki", "A. Al-Malki", "Saudi Arabia", "CDM"],
    ["Andre Castro", "A. Castro", "Portugal", "CM"],
    ["Ivan Martin", "I. Martin", "Spain", "CM"],
    ["Fabio Cardoso", "F. Cardoso", "Portugal", "CB"],
    ["Reece James Wolves", "R. Wolves", "England", "LB"],
    ["Paxten Aaronson", "P. Aaronson", "USA", "CAM"],
    ["Alexander Nubel", "A. Nubel", "Germany", "GK"],
    ["Kenny Dougall", "K. Dougall", "England", "CM"],
    ["Dara O'Shea", "D. O'Shea", "England", "CB"],
    ["Abdallah Sima Jr", "A. Jr", "Senegal", "LW"],
    ["Romain Perraud", "R. Perraud", "Spain", "LB"],
    ["Murilo", "Murilo", "Brazil", "CB"],
    ["Tanguy Ndombele", "T. Ndombele", "France", "CM"],
    ["Bryan Heynen", "B. Heynen", "Belgium", "CM"],
    ["Oussama Targhalline", "O. Targhalline", "Morocco", "CDM"],
    ["Nicolas Tagliafico", "N. Tagliafico", "Argentina", "LB"],
    ["Mattias Svanberg", "M. Svanberg", "Germany", "CM"],
    ["Nicolas Otamendi Jr", "N. Jr", "Argentina", "CB"],
    ["Emmanuel Gyasi", "E. Gyasi", "Italy", "LW"],
    ["Hasan Abdulkareem", "H. Abdulkareem", "Iraq", "CM"],
    ["George Hirst", "G. Hirst", "England", "ST"],
    ["Aissa Mandi Jr", "A. Jr", "France", "CB"],
    ["Raul Rangel", "R. Rangel", "Mexico", "GK"],
    ["Zeno Debast Jr", "Z. Jr", "Belgium", "CB"],
    ["Bafode Diakite", "B. Diakite", "France", "CB"],
    ["Cassio", "Cassio", "Brazil", "GK"],
    ["Pepe Aquino", "P. Aquino", "Portugal", "RW"],
    ["Fatawu Issahaku", "F. Issahaku", "Ghana", "RW"],
    ["Bertrand Traore", "B. Traore", "Netherlands", "RW"],
    ["Zeki Celik", "Z. Celik", "Italy", "RB"],
    ["Rui Patricio", "R. Patricio", "Portugal", "GK"],
    ["Alisson Becker Jr", "A. Jr", "Brazil", "GK"],
    ["Sultan Adil", "S. Adil", "United Arab Emirates", "ST"],
    ["Jamie Gittens", "J. Gittens", "Germany", "LW"],
    ["Liam Millar", "L. Millar", "Canada", "LW"],
    ["Abdulaziz Hatem", "A. Hatem", "Qatar", "CM"],
    ["Dominik Greif", "D. Greif", "Spain", "GK"],
    ["Marlon Freitas", "M. Freitas", "Brazil", "CDM"],
    ["Amr El Solia", "A. El Solia", "Egypt", "CM"],
    ["Filip Jorgensen", "F. Jorgensen", "Spain", "GK"],
    ["Pascal Struijk", "P. Struijk", "England", "CB"],
    ["Ziyad Al-Johani", "Z. Al-Johani", "Saudi Arabia", "CM"],
    ["Lawrence Shankland", "L. Shankland", "Scotland", "ST"],
    ["Jon Aramburu", "J. Aramburu", "Spain", "RB"],
    ["Jules Kounde", "J. Kounde", "France", "CB"],
    ["Igor Paixao", "I. Paixao", "Netherlands", "LW"],
    ["Hicham Boudaoui", "H. Boudaoui", "France", "CM"],
    ["Josh Windass", "J. Windass", "England", "CAM"],
    ["Scott McKenna Jr", "S. Jr", "Scotland", "CB"],
    ["Jesus Gallardo", "J. Gallardo", "Mexico", "LB"],
    ["Sergi Darder", "S. Darder", "Spain", "CAM"],
    ["Benat Turrientes", "B. Turrientes", "Spain", "CM"],
    ["Nelson Semedo", "N. Semedo", "Portugal", "RB"],
    ["Luis Malagon", "L. Malagon", "Mexico", "GK"],
    ["Sofiane Diop", "S. Diop", "France", "CAM"],
    ["Homam Ahmed", "H. Ahmed", "Qatar", "LB"],
    ["Marcin Bulka", "M. Bulka", "France", "GK"],
    ["Ibrahim Bayesh", "I. Bayesh", "Iraq", "LW"],
    ["Oumar Diakite", "O. Diakite", "Ivory Coast", "ST"],
    ["Kerem Akturkoglu", "K. Akturkoglu", "Portugal", "LW"],
    ["Manu Kone Jr", "M. Jr", "France", "CM"],
    ["Unai Lopez", "U. Lopez", "Spain", "CM"],
    ["Conor Bradley Jr", "C. Jr", "Northern Ireland", "RB"],
    ["Ali Al-Hamadi Jr", "A. Jr", "Iraq", "ST"],
    ["Alex Palmer", "A. Palmer", "England", "GK"],
    ["Conor Chaplin", "C. Chaplin", "England", "CAM"],
    ["Erik Jorgens", "E. Jorgens", "United Arab Emirates", "CB"],
    ["Baek Seung-ho", "B. Seung-ho", "South Korea", "CM"],
    ["Karim Konate", "K. Konate", "Ivory Coast", "ST"],
    ["Andre Almeida", "A. Almeida", "Spain", "CAM"],
    ["Leo Pereira", "L. Pereira", "Brazil", "CB"],
    ["Adam Taggart", "A. Taggart", "Australia", "ST"],
    ["Karim Fouad", "K. Fouad", "Egypt", "CB"],
    ["Bae Jun-ho", "B. Jun-ho", "South Korea", "CAM"],
    ["Lee Dong-gyeong", "L. Dong-gyeong", "South Korea", "CAM"],
    ["Naim Sliti", "N. Sliti", "Tunisia", "LW"],
    ["Valentin Barco", "V. Barco", "Argentina", "LB"],
    ["Paulo Diaz Chile", "P. Chile", "Chile", "CB"],
    ["Claudio Ramos", "C. Ramos", "Portugal", "GK"],
    ["Gjivai Zechiel", "G. Zechiel", "Netherlands", "CM"],
    ["Habib Diarra", "H. Diarra", "France", "CM"],
    ["Nathaniel Brown", "N. Brown", "Germany", "LB"],
    ["Andi Zeqiri", "A. Zeqiri", "Belgium", "ST"],
    ["Danny Ward", "D. Ward", "Wales", "GK"],
    ["Alvaro Garcia", "A. Garcia", "Spain", "LW"],
    ["Omar Kamal", "O. Kamal", "Egypt", "RB"],
    ["Joao Palhinha", "J. Palhinha", "Portugal", "CDM"],
    ["Shayne Lavery", "S. Lavery", "Northern Ireland", "ST"],
    ["Patrick Bamford", "P. Bamford", "England", "ST"],
    ["Equi Fernandez", "E. Fernandez", "Argentina", "CM"],
    ["Nicolo Rovella", "N. Rovella", "Italy", "CDM"],
    ["Khalid Eisa", "K. Eisa", "United Arab Emirates", "GK"],
    ["Hassan Al-Tambakti", "H. Al-Tambakti", "Saudi Arabia", "CB"],
    ["Mike Tresor", "M. Tresor", "Belgium", "CAM"],
    ["Amir Abedzadeh", "A. Abedzadeh", "Iran", "GK"],
    ["Thiago Santos", "T. Santos", "France", "CB"],
    ["Sebastian Nanasi", "S. Nanasi", "France", "LW"],
    ["Pascal Gross", "P. Gross", "Germany", "CM"],
    ["Ryan Gauld", "R. Gauld", "Scotland", "CAM"],
    ["Kike Perez", "K. Perez", "Spain", "CM"],
    ["Marc Guehi", "M. Guehi", "England", "CB"],
    ["Maxi Gomez", "M. Gomez", "Uruguay", "ST"],
    ["Jhon Lucumi", "J. Lucumi", "Colombia", "CB"],
    ["Marek Rodak", "M. Rodak", "England", "GK"],
    ["Cameron Burgess", "C. Burgess", "England", "CB"],
    ["Alen Sherri", "A. Sherri", "Italy", "GK"],
    ["Alex Baena", "A. Baena", "Spain", "LW"],
    ["Wojciech Szczesny", "W. Szczesny", "Italy", "GK"],
    ["Cristhian Stuani", "C. Stuani", "Spain", "ST"],
    ["Diego Valdes", "D. Valdes", "Chile", "CAM"],
    ["Thorgan Hazard", "T. Hazard", "Belgium", "LW"],
    ["Roger Marti", "R. Marti", "Spain", "ST"],
    ["Roberto Piccoli", "R. Piccoli", "Italy", "ST"],
    ["Thilo Kehrer", "T. Kehrer", "France", "CB"],
    ["Jorge Sanchez", "J. Sanchez", "Mexico", "RB"],
    ["Yuya Osako", "Y. Osako", "Japan", "ST"],
    ["Khojimat Erkinov", "K. Erkinov", "Uzbekistan", "RW"],
    ["Sergio Gomez", "S. Gomez", "Spain", "LM"],
    ["Joe Allen", "J. Allen", "Wales", "CM"],
    ["Mohamed Diomande", "M. Diomande", "Scotland", "CM"],
    ["Fahad Al-Rashidi", "F. Al-Rashidi", "Saudi Arabia", "LB"],
    ["David Lopez", "D. Lopez", "Spain", "CB"],
    ["Tom Davies", "T. Davies", "England", "CM"],
    ["Mohamed Tougai", "M. Tougai", "Algeria", "CB"],
    ["Wesley Franca", "W. Franca", "Brazil", "RB"],
    ["Luis Suarez", "L. Suarez", "Uruguay", "ST"],
    ["Willy Gnonto", "W. Gnonto", "England", "RW"],
    ["Geronimo Rulli", "G. Rulli", "Argentina", "GK"],
    ["Rasmus Kristensen", "R. Kristensen", "Germany", "RB"],
    ["Nnamdi Collins", "N. Collins", "Germany", "RB"],
    ["Jalal Hassan", "J. Hassan", "Iraq", "GK"],
    ["Julian Quinones", "J. Quinones", "Mexico", "ST"],
    ["Joao Mario Porto", "J. Porto", "Portugal", "RB"],
    ["Jefte", "Jefte", "Scotland", "LB"],
    ["Enzo Perez", "E. Perez", "Argentina", "CDM"],
    ["Paddy McNair", "P. McNair", "Northern Ireland", "CB"],
    ["Killian Sardella", "K. Sardella", "Belgium", "RB"],
    ["Cristobal Campos", "C. Campos", "Chile", "GK"],
    ["Ramin Rezaeian", "R. Rezaeian", "Iran", "RB"],
    ["Cameron Dawson", "C. Dawson", "England", "GK"],
    ["Sebastien Haller", "S. Haller", "Ivory Coast", "ST"],
    ["Marcus Forss", "M. Forss", "England", "ST"],
    ["Bruma", "Bruma", "Portugal", "RW"],
    ["Nicolas Pepe", "N. Pepe", "Ivory Coast", "RW"],
    ["Sergi Canos", "S. Canos", "Spain", "LW"],
    ["Beraldo", "Beraldo", "Brazil", "CB"],
    ["Keisuke Osako", "K. Osako", "Japan", "GK"],
    ["Joao Pedro Junior", "J. Junior", "England", "ST"],
    ["Michel Adopo", "M. Adopo", "Italy", "CM"],
    ["Lukasz Fabianski", "L. Fabianski", "England", "GK"],
    ["Alexis Sanchez", "A. Sanchez", "Chile", "ST"],
    ["Dara O'Shea Jr", "D. Jr", "Ireland", "CB"],
    ["Joel Drommel", "J. Drommel", "Netherlands", "GK"],
    ["Alberto Dossena", "A. Dossena", "Italy", "CB"],
    ["Ruben Dias Jr", "R. Jr", "Portugal", "CB"],
    ["Davy Klaassen", "D. Klaassen", "Netherlands", "CAM"],
    ["Gustavo Hamer", "G. Hamer", "England", "CAM"],
    ["Victor Davila", "V. Davila", "Chile", "LW"],
    ["Ibrahim Salah", "I. Salah", "Morocco", "RW"]
  ], NATION_COLORS = {
    Albania: ["#e41e20", "#000000"],
    Algeria: ["#006233", "#ffffff"],
    Angola: ["#ce1126", "#000000"],
    Argentina: ["#75aadb", "#ffffff"],
    Armenia: ["#d90012", "#0033a0"],
    Australia: ["#00843d", "#ffcd00"],
    Austria: ["#ed2939", "#ffffff"],
    Belgium: ["#fdda24", "#000000"],
    "Bosnia and Herzegovina": ["#002395", "#fecb00"],
    Brazil: ["#009c3b", "#ffdf00"],
    "Burkina Faso": ["#ef2b2d", "#009e49"],
    Cameroon: ["#007a5e", "#ce1126"],
    Canada: ["#d80621", "#ffffff"],
    "Central African Republic": ["#003082", "#ffce00"],
    Chile: ["#d52b1e", "#0039a6"],
    Colombia: ["#fcd116", "#003893"],
    "Costa Rica": ["#002b7f", "#ce1126"],
    Croatia: ["#ff0000", "#ffffff"],
    "Czech Republic": ["#11457e", "#d7141a"],
    "DR Congo": ["#007fff", "#f7d618"],
    Denmark: ["#c60c30", "#ffffff"],
    Ecuador: ["#ffdd00", "#034ea2"],
    Egypt: ["#ce1126", "#000000"],
    "El Salvador": ["#0f47af", "#ffffff"],
    England: ["#ffffff", "#ce1124"],
    Estonia: ["#0072ce", "#000000"],
    Finland: ["#003580", "#ffffff"],
    France: ["#002395", "#ed2939"],
    Gabon: ["#009e60", "#fcd116"],
    Gambia: ["#ce1126", "#0c1c8c"],
    Georgia: ["#ffffff", "#ff0000"],
    Germany: ["#000000", "#dd0000"],
    Ghana: ["#006b3f", "#fcd116"],
    Greece: ["#0d5eaf", "#ffffff"],
    Guinea: ["#ce1126", "#009460"],
    "Guinea-Bissau": ["#ce1126", "#fcd116"],
    Honduras: ["#0073cf", "#ffffff"],
    Hungary: ["#436f4d", "#cd2a3e"],
    Iceland: ["#02529c", "#dc1e35"],
    Iran: ["#239f40", "#da0000"],
    Iraq: ["#ce1126", "#007a3d"],
    Ireland: ["#169b62", "#ff883e"],
    Israel: ["#0038b8", "#ffffff"],
    Italy: ["#008c45", "#0064aa"],
    "Ivory Coast": ["#f77f00", "#009e60"],
    Jamaica: ["#009b3a", "#fed100"],
    Japan: ["#bc002d", "#ffffff"],
    Kosovo: ["#244aa5", "#d0a650"],
    Libya: ["#239e46", "#e70013"],
    Mali: ["#14b53a", "#fcd116"],
    Mexico: ["#006847", "#ce1126"],
    Montenegro: ["#c40308", "#d4af3a"],
    Morocco: ["#c1272d", "#006233"],
    Mozambique: ["#007168", "#fce100"],
    Netherlands: ["#ff6c00", "#21468b"],
    "New Zealand": ["#000000", "#ffffff"],
    Nigeria: ["#008751", "#ffffff"],
    "North Macedonia": ["#d20000", "#ffe600"],
    "Northern Ireland": ["#ffffff", "#c8102e"],
    Norway: ["#ba0c2f", "#00205b"],
    Panama: ["#005293", "#da121a"],
    Paraguay: ["#d52b1e", "#0038a8"],
    Peru: ["#d91023", "#ffffff"],
    Poland: ["#ffffff", "#dc143c"],
    Portugal: ["#da291c", "#046a38"],
    Qatar: ["#8a1538", "#ffffff"],
    Romania: ["#002b7f", "#fcd116"],
    Russia: ["#ffffff", "#d52b1e"],
    "Saudi Arabia": ["#006c35", "#ffffff"],
    Scotland: ["#005eb8", "#ffffff"],
    Senegal: ["#00853f", "#fdef42"],
    Serbia: ["#c6363c", "#0c4076"],
    Slovakia: ["#0b4ea2", "#ee1c25"],
    Slovenia: ["#005ce6", "#ffffff"],
    "South Africa": ["#007a4d", "#ffb612"],
    "South Korea": ["#cd2e3a", "#0047a0"],
    Spain: ["#c60b1e", "#ffc400"],
    Suriname: ["#377e3f", "#b40a2d"],
    Sweden: ["#006aa7", "#fecc00"],
    Switzerland: ["#d52b1e", "#ffffff"],
    Syria: ["#ce1126", "#007a3d"],
    Tanzania: ["#1eb53a", "#00a3dd"],
    Togo: ["#006a4e", "#ffce00"],
    Tunisia: ["#e70013", "#ffffff"],
    Turkey: ["#e30a17", "#ffffff"],
    USA: ["#3c3b6e", "#b22234"],
    Ukraine: ["#0057b7", "#ffd700"],
    "United Arab Emirates": ["#00732f", "#ff0000"],
    Uruguay: ["#7bafd4", "#ffffff"],
    Uzbekistan: ["#0099b5", "#1eb53a"],
    Venezuela: ["#ffcc00", "#00247d"],
    Wales: ["#00ab39", "#c8102e"]
  };

  // js/data/generator.js
  function mulberry32(seed) {
    return function() {
      seed |= 0, seed = seed + 1831565813 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var WORLD_SEED = 27110;
  function makeRand(seed) {
    let r = mulberry32(seed);
    return {
      next: r,
      int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      // bell-ish curve so most players sit mid-range
      around: (mid, spread) => {
        let g = (r() + r() + r()) / 3 - 0.5;
        return Math.round(mid + g * spread * 2);
      }
    };
  }
  var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v)), ROSTER_SHAPE = [
    "GK",
    "GK",
    "GK",
    "LB",
    "LB",
    "CB",
    "CB",
    "CB",
    "CB",
    "RB",
    "RB",
    "CDM",
    "CDM",
    "CM",
    "CM",
    "CM",
    "CAM",
    "LM",
    "RM",
    "ST",
    "ST"
  ], DEPTH_SHAPE = ["LW", "LW", "RW", "RW", "LM", "RM", "CAM", "ST", "CM", "CB"], STAT_KEYS = ["pace", "shooting", "passing", "dribbling", "defending", "physical"], PROFILES = {
    GK: [-18, -30, -6, -12, 10, 6],
    CB: [-8, -26, -6, -16, 14, 10],
    LB: [8, -16, 0, 2, 6, -4],
    RB: [8, -16, 0, 2, 6, -4],
    CDM: [-6, -10, 4, -2, 10, 6],
    CM: [0, 0, 8, 4, -2, -2],
    CAM: [2, 6, 8, 10, -18, -8],
    LM: [10, 0, 4, 8, -12, -8],
    RM: [10, 0, 4, 8, -12, -8],
    LW: [14, 6, 0, 12, -22, -10],
    RW: [14, 6, 0, 12, -22, -10],
    ST: [8, 16, -8, 6, -26, 4]
  };
  function weightedOverall(position, stats) {
    let w = POSITIONS[position].weights, total = 0;
    for (let k of STAT_KEYS) total += stats[k] * w[k];
    return Math.round(total);
  }
  function marketValue(overall, age) {
    let base = Math.pow(1.135, overall - 58) * 9e4, ageMod = age <= 23 ? 1.35 : age <= 27 ? 1.1 : age <= 30 ? 0.85 : 0.5, raw = base * ageMod;
    return Math.round(raw / 5e4) * 5e4 || 5e4;
  }
  function footFor(id) {
    return id * 2654435761 % 100 < 22 ? "L" : "R";
  }
  var idCounter = 0;
  function makePlayer(rand, position, baseLevel, clubId) {
    let profile2 = PROFILES[position], stats = {};
    STAT_KEYS.forEach((key, i) => {
      stats[key] = clamp(rand.around(baseLevel + profile2[i], 7), 24, 99);
    });
    let overall = weightedOverall(position, stats), guard = 0;
    for (; Math.abs(overall - baseLevel) > 2 && guard++ < 24; ) {
      let delta = baseLevel - overall > 0 ? 1 : -1, w = POSITIONS[position].weights, key = STAT_KEYS.slice().sort((a, b) => w[b] - w[a])[guard % 3];
      stats[key] = clamp(stats[key] + delta * 2, 24, 99), overall = weightedOverall(position, stats);
    }
    overall = clamp(overall, 60, 99);
    let age = rand.int(17, 35), nation = rand.pick(NATIONS), first = rand.pick(FIRST_NAMES), last2 = rand.pick(LAST_NAMES), id = ++idCounter;
    return {
      id: "p".concat(id),
      name: "".concat(first, " ").concat(last2),
      short: "".concat(first[0], ". ").concat(last2),
      position,
      overall,
      stats,
      rarity: rarityFor(overall),
      clubId,
      nation: nation.name,
      nationColors: nation.colors,
      age,
      foot: footFor(id),
      value: marketValue(overall, age),
      form: 0
    };
  }
  function namedCard(def, stats, overall, rarity, value, id) {
    return {
      id: "p".concat(id),
      name: def.name,
      // spelled out on the blueprint: initialising "Neymar Jr" gives "N. Jr"
      short: def.short,
      position: def.position,
      overall,
      stats: { ...stats },
      rarity,
      clubId: null,
      nation: def.nation,
      nationColors: def.colors,
      age: 29,
      // named cards state their own foot; the rest fall back to the hash
      foot: def.foot || footFor(id),
      value,
      form: 0
    };
  }
  function buildFixtures(clubIds, rand) {
    let teams = clubIds.slice(), n = teams.length, rounds = [], rotating = teams.slice(1);
    for (let r = 0; r < n - 1; r++) {
      let pairs = [], order = [teams[0], ...rotating];
      for (let i = 0; i < n / 2; i++) {
        let home = order[i], away = order[n - 1 - i];
        pairs.push(r % 2 === 0 ? { home, away } : { home: away, away: home });
      }
      rounds.push(pairs), rotating.unshift(rotating.pop());
    }
    let second = rounds.map((round) => round.map((m) => ({ home: m.away, away: m.home }))), shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(rand.next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    return [...shuffle(rounds), ...shuffle(second)].map((matches, i) => ({
      matchday: i + 1,
      matches: matches.map((m) => ({ ...m, played: !1, homeGoals: null, awayGoals: null }))
    }));
  }
  var SBC_LEGENDS = [
    ["Thierry Henry", "T. Henry", "France", "ST", 91, 27],
    ["Ronaldinho", "Ronaldinho", "Brazil", "LW", 91, 26],
    ["Andrés Iniesta", "A. Iniesta", "Spain", "CM", 90, 28],
    ["Andrea Pirlo", "A. Pirlo", "Italy", "CDM", 89, 30],
    ["Steven Gerrard", "S. Gerrard", "England", "CM", 89, 27],
    ["Sergio Agüero", "S. Agüero", "Argentina", "ST", 89, 26],
    ["Didier Drogba", "D. Drogba", "Ivory Coast", "ST", 89, 29],
    ["Iker Casillas", "I. Casillas", "Spain", "GK", 89, 27],
    ["Wayne Rooney", "W. Rooney", "England", "ST", 88, 25],
    ["Frank Lampard", "F. Lampard", "England", "CAM", 88, 28],
    ["Philipp Lahm", "P. Lahm", "Germany", "RB", 88, 28],
    ["Carles Puyol", "C. Puyol", "Spain", "CB", 88, 29]
  ], CORE = CLUB_BLUEPRINTS.filter((bp) => !bp.league);
  function buildWorld() {
    var _a, _b;
    idCounter = 0;
    let rand = makeRand(WORLD_SEED), clubs = [], players = [];
    CORE.forEach((bp, index) => {
      let clubId = "c".concat(index + 1), clubLevel = 83 - (bp.tier - 1) * 1.7, roster = [];
      ROSTER_SHAPE.forEach((pos, slot) => {
        let depthPenalty = slot % 3 === 2 ? 6 : slot % 3 === 1 ? 2 : 0, p = makePlayer(rand, pos, clubLevel - depthPenalty, clubId);
        players.push(p), roster.push(p.id);
      });
      let starPos = rand.pick(["ST", "CAM", "LW", "RW", "CM"]), star = makePlayer(rand, starPos, clamp(clubLevel + 9, 60, 94), clubId);
      star.overall = clamp(star.overall + 3, 60, 99), star.rarity = rarityFor(star.overall), star.value = marketValue(star.overall, star.age), players.push(star), roster.push(star.id), clubs.push({
        id: clubId,
        name: bp.name,
        short: bp.short,
        tier: bp.tier,
        crest: { shape: bp.crest, colors: bp.colors, pattern: bp.pattern, device: bp.device },
        league: bp.league || LEAGUE_NAME,
        division: 1,
        founded: bp.founded,
        ground: bp.ground,
        roster,
        budget: Math.round((12 - bp.tier) * 65e5 + 8e6)
      });
    }), CLUB_BLUEPRINTS.filter((bp) => bp.league).forEach((bp, i) => {
      clubs.push({
        id: "c".concat(CORE.length + i + 1),
        name: bp.name,
        short: bp.short,
        tier: bp.tier,
        crest: { shape: bp.crest, colors: bp.colors, pattern: bp.pattern, device: bp.device },
        league: bp.league,
        division: LEAGUES.indexOf(bp.league) + 1,
        founded: bp.founded,
        ground: bp.ground,
        roster: [],
        // dealt (Meridian) or generated (wave 3) at the end of buildWorld
        budget: Math.round((12 - bp.tier) * (bp.wave === 4 ? 9e5 : bp.wave === 3 ? 2e6 : 5e6) + (bp.wave === 4 ? 12e5 : bp.wave === 3 ? 25e5 : 6e6))
      });
    });
    let freeAgents = [];
    for (let i = 0; i < 34; i++) {
      let pos = rand.pick(Object.keys(POSITIONS)), p = makePlayer(rand, pos, rand.around(74, 11), null);
      players.push(p), freeAgents.push(p.id);
    }
    CORE.forEach((bp, index) => {
      let club = clubs[index], clubLevel = 83 - (bp.tier - 1) * 1.7;
      DEPTH_SHAPE.forEach((pos, slot) => {
        let p = makePlayer(rand, pos, clubLevel - slot % 3, club.id);
        players.push(p), club.roster.push(p.id);
      });
    });
    for (let i = 0; i < 60; i++) {
      let pos = rand.pick(Object.keys(POSITIONS)), p = makePlayer(rand, pos, rand.around(75, 10), null);
      players.push(p), freeAgents.push(p.id);
    }
    ["ST", "ST", "LW", "RW", "CAM", "CAM", "CM", "CDM", "CB", "CB", "LB", "GK"].forEach((pos) => {
      let p = makePlayer(rand, pos, rand.int(88, 93), null);
      p.overall = clamp(p.overall + 2, 88, 99), p.rarity = rarityFor(p.overall), p.value = marketValue(p.overall, p.age), players.push(p), freeAgents.push(p.id);
    });
    let icons = [], stars = [], named = [
      ...ICONS.map((def) => ({ def, tier: "icon" })),
      ...STARS.map((def) => ({ def, tier: "star" }))
    ];
    for (let wave2 of [!1, !0])
      for (let { def, tier } of named) {
        if (!!def.added !== wave2) continue;
        let p = tier === "icon" ? namedCard(def, ICON_TRAITS[def.trait], 99, "icon", 25e7, ++idCounter) : namedCard(def, STAR_TRAITS[def.trait], 92, "star", 12e7, ++idCounter);
        players.push(p), freeAgents.push(p.id), (tier === "icon" ? icons : stars).push(p.id);
      }
    let THIN = ["LB", "RB", "LM", "RM", "LB", "RB", "LM", "RM", "GK", "CB"];
    CORE.forEach((bp, index) => {
      let club = clubs[index], clubLevel = 83 - (bp.tier - 1) * 1.7;
      THIN.forEach((pos, slot) => {
        let p = makePlayer(rand, pos, clubLevel - slot % 4, club.id);
        players.push(p), club.roster.push(p.id);
      });
    });
    for (let i = 0; i < 70; i++) {
      let p = makePlayer(rand, rand.pick(THIN), rand.around(76, 9), null);
      players.push(p), freeAgents.push(p.id);
    }
    for (let pos of ["LB", "RB", "LM", "RM"])
      for (let i = 0; i < 5; i++) {
        let p = makePlayer(rand, pos, rand.int(82, 90), null);
        p.rarity = rarityFor(p.overall), p.value = marketValue(p.overall, p.age), players.push(p), freeAgents.push(p.id);
      }
    for (let i = 0; i < 80; i++) {
      let p = makePlayer(rand, rand.pick(Object.keys(POSITIONS)), rand.around(74, 11), null);
      players.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(players);
    let fixtures = buildFixtures(clubs.slice(0, CORE.length).map((c) => c.id), rand), wave = makeRand(WORLD_SEED ^ 708529245), wavePlayers = [], WAVE_SHAPE = ["GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "ST"];
    CORE.forEach((bp, index) => {
      let club = clubs[index], clubLevel = 83 - (bp.tier - 1) * 1.7;
      WAVE_SHAPE.forEach((pos, slot) => {
        let p = makePlayer(wave, pos, clubLevel - 3 - slot % 3 * 1.5, club.id);
        players.push(p), wavePlayers.push(p), club.roster.push(p.id);
      });
    });
    let WAVE_POOL = ["GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CM", "CAM", "CAM", "LM", "RM", "LW", "LW", "RW", "RW", "ST", "ST", "ST"];
    for (let i = 0; i < 200; i++) {
      let p = makePlayer(wave, wave.pick(WAVE_POOL), wave.around(75, 10), null);
      players.push(p), wavePlayers.push(p), freeAgents.push(p.id);
    }
    for (let pos of [...Object.keys(POSITIONS), "ST", "CAM", "LW", "RW", "CB", "CM", "GK"]) {
      let p = makePlayer(wave, pos, wave.int(84, 91), null);
      p.rarity = rarityFor(p.overall), p.value = marketValue(p.overall, p.age), players.push(p), wavePlayers.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(wavePlayers, REAL_PLAYERS_EXTRA);
    let newClubs = clubs.filter((c) => c.league === "Meridian League");
    if (newClubs.length) {
      let dealable = freeAgents.map((id) => players.find((p) => p.id === id)).filter((p) => p && p.rarity !== "icon" && p.rarity !== "star" && p.overall < 88 && !p.sbc), WANT = [
        "GK",
        "GK",
        "GK",
        "CB",
        "CB",
        "CB",
        "CB",
        "LB",
        "LB",
        "RB",
        "RB",
        "CDM",
        "CDM",
        "CM",
        "CM",
        "CM",
        "CAM",
        "CAM",
        "LM",
        "RM",
        "LW",
        "LW",
        "RW",
        "RW",
        "ST",
        "ST",
        "ST"
      ], byPos = /* @__PURE__ */ new Map();
      for (let p of dealable)
        byPos.has(p.position) || byPos.set(p.position, []), byPos.get(p.position).push(p);
      for (let q of byPos.values()) q.sort((a, b) => b.overall - a.overall || (a.id < b.id ? -1 : 1));
      let counts = new Map(WANT.map((pos) => [pos, 0]));
      for (let pos of WANT) counts.set(pos, counts.get(pos) + 1);
      let dealt = /* @__PURE__ */ new Set();
      for (let [pos, n] of counts) {
        let q = byPos.get(pos) || [];
        for (let r = 0; r < n; r++) {
          let order = r % 2 ? newClubs.slice().reverse() : newClubs;
          for (let club of order) {
            let p = q.shift();
            if (!p) break;
            p.clubId = club.id, club.roster.push(p.id), dealt.add(p.id);
          }
        }
      }
      for (let i = freeAgents.length - 1; i >= 0; i--) dealt.has(freeAgents[i]) && freeAgents.splice(i, 1);
    }
    let sbcRand = makeRand(WORLD_SEED ^ 6014396), sbcCards = [];
    for (let [name2, short, nation, pos, overall, age] of SBC_LEGENDS) {
      let p = makePlayer(sbcRand, pos, overall, null);
      p.name = name2, p.short = short, p.nation = nation, p.age = age, p.nationColors = NATION_COLORS[nation] || p.nationColors, p.overall = overall;
      for (let k of Object.keys(p.stats)) p.stats[k] = clamp(Math.round(p.stats[k] + (overall - 80) * 0.6), 40, 99);
      p.rarity = "special", p.sbc = !0, p.value = marketValue(overall, age), players.push(p), sbcCards.push(p.id);
    }
    let w3 = makeRand(WORLD_SEED ^ 3833456), w3Players = [], W3_SHAPE = [
      "GK",
      "GK",
      "GK",
      "CB",
      "CB",
      "CB",
      "CB",
      "LB",
      "LB",
      "RB",
      "RB",
      "CDM",
      "CDM",
      "CM",
      "CM",
      "CM",
      "CAM",
      "CAM",
      "LM",
      "RM",
      "LW",
      "LW",
      "RW",
      "RW",
      "ST",
      "ST",
      "ST"
    ];
    for (let club of clubs) {
      if (((_a = CLUB_BLUEPRINTS.find((bp) => bp.name === club.name)) == null ? void 0 : _a.wave) !== 3) continue;
      let base = (club.division === 3 ? 76 : 70) - (club.tier - 1) * 1.2;
      W3_SHAPE.forEach((pos, slot) => {
        let depth = slot % 3 === 2 ? 5 : slot % 3 === 1 ? 2 : 0, p = makePlayer(w3, pos, base - depth, club.id);
        players.push(p), w3Players.push(p), club.roster.push(p.id);
      });
      let star = makePlayer(w3, w3.pick(["ST", "CAM", "LW", "RW", "CM"]), clamp(base + 7, 60, 84), club.id);
      players.push(star), w3Players.push(star), club.roster.push(star.id);
    }
    let W3_POOL = ["GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "ST"];
    for (let i = 0; i < 380; i++) {
      let p = makePlayer(w3, w3.pick(W3_POOL), w3.around(72, 10), null);
      players.push(p), w3Players.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(w3Players, REAL_PLAYERS_WAVE3);
    let w4 = makeRand(WORLD_SEED ^ 4934513), w4Players = [];
    for (let club of clubs) {
      if (((_b = CLUB_BLUEPRINTS.find((bp) => bp.name === club.name)) == null ? void 0 : _b.wave) !== 4) continue;
      let base = (club.division === 5 ? 68 : 65) - (club.tier - 1) * 0.7;
      W3_SHAPE.forEach((pos, slot) => {
        let depth = slot % 3 === 2 ? 4 : slot % 3 === 1 ? 2 : 0, p = makePlayer(w4, pos, base - depth, club.id);
        players.push(p), w4Players.push(p), club.roster.push(p.id);
      });
      let star = makePlayer(w4, w4.pick(["ST", "CAM", "LW", "RW", "CM"]), clamp(base + 6, 60, 78), club.id);
      players.push(star), w4Players.push(star), club.roster.push(star.id);
    }
    for (let i = 0; i < 480; i++) {
      let p = makePlayer(w4, w4.pick(W3_POOL), w4.around(70, 9), null);
      players.push(p), w4Players.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(w4Players, REAL_PLAYERS_WAVE4);
    let byId = Object.fromEntries(players.map((p) => [p.id, p]));
    return {
      leagueName: LEAGUE_NAME,
      clubs,
      clubsById: Object.fromEntries(clubs.map((c) => [c.id, c])),
      players,
      playersById: byId,
      freeAgents,
      icons,
      stars,
      sbcCards,
      leagues: LEAGUES,
      fixtures
    };
  }
  var POS_FALLBACK = {
    GK: ["GK"],
    CB: ["CB", "CDM", "LB", "RB"],
    LB: ["LB", "RB", "CB", "LM", "LW", "CDM"],
    RB: ["RB", "LB", "CB", "RM", "RW", "CDM"],
    CDM: ["CDM", "CM", "CB"],
    CM: ["CM", "CDM", "CAM"],
    CAM: ["CAM", "CM", "LW", "RW", "ST"],
    LM: ["LM", "LW", "CAM", "CM", "LB", "RW"],
    RM: ["RM", "RW", "CAM", "CM", "RB", "LW"],
    LW: ["LW", "RW", "LM", "CAM", "ST"],
    RW: ["RW", "LW", "RM", "CAM", "ST"],
    ST: ["ST", "CAM", "LW", "RW", "CM"]
  };
  function nameTheWorld(players, list = REAL_PLAYERS) {
    let pool = /* @__PURE__ */ new Map();
    for (let row of list)
      pool.has(row[3]) || pool.set(row[3], []), pool.get(row[3]).push(row);
    let take = (pos) => {
      for (let p of POS_FALLBACK[pos] || [pos]) {
        let q = pool.get(p);
        if (q && q.length) return q.shift();
      }
      let best = null;
      for (let [p, q] of pool) p !== "GK" && q.length && (!best || q.length > best.length) && (best = q);
      return best || (best = pool.get("GK")), best && best.length ? best.shift() : null;
    }, order = ["GK", "CDM", "CAM", "LB", "RB", "CM", "LW", "RW", "ST", "CB", "LM", "RM"], byPos = new Map(order.map((p) => [p, []]));
    for (let p of players)
      p.rarity === "icon" || p.rarity === "star" || (byPos.get(p.position) || []).push(p);
    for (let pos of order)
      for (let p of byPos.get(pos)) {
        let row = take(pos);
        row && ([p.name, p.short, p.nation] = row, p.nationColors = NATION_COLORS[row[2]] || p.nationColors);
      }
    return players;
  }
  var WORLD = buildWorld(), getPlayer = (id) => WORLD.playersById[id], getClub = (id) => id ? WORLD.clubsById[id] : null;
  var rosterOf = (clubId) => WORLD.clubsById[clubId].roster.map(getPlayer);

  // js/data/packs.js
  var PACKS = [
    { id: "bronze", cat: "free", name: "Bronze", cost: 0, size: 4, odds: { bronze: 0.68, silver: 0.28, gold: 0.04, special: 0 }, note: "4 cards" },
    { id: "silver", cat: "standard", name: "Silver", cost: 2e3, size: 4, odds: { bronze: 0.32, silver: 0.52, gold: 0.15, special: 0.01 }, note: "4 cards" },
    /* Sold for what it does, not what it rolls. A squad cannot be fielded without
       a keeper, and the odds of one turning up in a four-card pack are about one
       in four — which is a long way to go for the single card the game will not
       let you play without. Two cards, one of them certainly a GK. */
    {
      id: "keeper",
      cat: "standard",
      name: "Keeper",
      cost: 3500,
      size: 2,
      odds: { bronze: 0.1, silver: 0.44, gold: 0.44, special: 0.02 },
      forcePosition: "GK",
      note: "2 cards",
      promise: "1 guaranteed goalkeeper"
    },
    /* The cheap gamble. One card, and the odds are deliberately top-heavy for the
       price — this is the pack you open because the last match paid for it, and
       the whole point is that it is over in one reveal. */
    {
      id: "dip",
      cat: "standard",
      name: "Lucky Dip",
      cost: 5e3,
      size: 1,
      odds: { bronze: 0.14, silver: 0.36, gold: 0.38, special: 0.12 },
      note: "1 card · high variance"
    },
    /* The Keeper pack's mirror. A squad with no striker is not blocked the way
       a squad with no keeper is, so this sells convenience rather than rescue —
       same shape, same price, the position everyone actually wants. */
    {
      id: "striker",
      cat: "standard",
      name: "Striker",
      cost: 3500,
      size: 2,
      odds: { bronze: 0.1, silver: 0.44, gold: 0.44, special: 0.02 },
      forcePosition: "ST",
      note: "2 cards",
      promise: "1 guaranteed striker"
    },
    /* Cheap bulk below Gold. Six bodies with no bronze in the bottom slot —
       bought for challenge fodder and early-save depth, not for headlines. */
    {
      id: "stack",
      cat: "standard",
      name: "Silver Stack",
      cost: 4500,
      size: 6,
      odds: { bronze: 0.2, silver: 0.58, gold: 0.2, special: 0.02 },
      floor: "silver",
      note: "6 · silver min"
    },
    { id: "gold", cat: "standard", name: "Gold", cost: 7500, size: 5, odds: { bronze: 0.06, silver: 0.36, gold: 0.53, special: 0.05 }, floor: "gold", note: "5 · gold min" },
    /* The bulk option, and the only pack that pays for the gap between Gold and
       Prime. Eight cards at Gold-ish odds is worse per card than Prime and far
       better per Apex — it is the one to buy when a squad-building challenge wants
       bodies rather than a headline. */
    {
      id: "builder",
      cat: "premium",
      name: "Squad Builder",
      cost: 15e3,
      size: 8,
      odds: { bronze: 0.04, silver: 0.4, gold: 0.51, special: 0.05 },
      floor: "gold",
      tone: "gold",
      note: "8 · gold min"
    },
    /* The step between Gold and Prime that did not exist: three cards that are
       all at least useful (78+) without Prime's price or its special odds. */
    {
      id: "form",
      cat: "premium",
      name: "Form Signing",
      cost: 12e3,
      size: 3,
      odds: { bronze: 0, silver: 0.1, gold: 0.78, special: 0.12 },
      minOverall: 78,
      tone: "gold",
      note: "3 · 78+ min"
    },
    /* A guaranteed special for less than Prime, in exchange for volume: two
       cards, one of them certainly special-or-better. The cheapest certain
       special in the store, and deliberately nothing else. */
    {
      id: "double",
      cat: "premium",
      name: "Double Down",
      cost: 21e3,
      size: 2,
      odds: { bronze: 0, silver: 0.1, gold: 0.7, special: 0.2 },
      floor: "special",
      tone: "special",
      note: "2 cards · special min",
      promise: "1 guaranteed Special"
    },
    { id: "prime", cat: "premium", name: "Prime", cost: 3e4, size: 3, odds: { bronze: 0, silver: 0.06, gold: 0.72, special: 0.22 }, minOverall: 82, tone: "special", note: "3 · 82+ min" },
    /* The other end of Lucky Dip: one card, no floor, no guarantee, and odds
       that are genuinely top-heavy. It is the most volatile thing in the store —
       a quarter of the time it is the best single card you can buy without
       paying Limited money, and the rest of the time you paid Prime prices for
       one gold. Priced so that is a real decision rather than an obvious yes. */
    {
      id: "gamble",
      cat: "premium",
      name: "High Roller",
      cost: 26e3,
      size: 1,
      odds: { bronze: 0, silver: 0, gold: 0.74, special: 0.26 },
      minOverall: 79,
      tone: "special",
      note: "1 card · 79+ min",
      promise: "Best single-card odds in the store"
    },
    /* Eleven cards, one whole squad's worth, at odds a shade under Gold. The
       bulk option above Squad Builder — bought to fill a squad or feed a
       challenge in one go rather than to chase a headline. */
    {
      id: "eleven",
      cat: "premium",
      name: "The Eleven",
      cost: 45e3,
      size: 11,
      odds: { bronze: 0, silver: 0.33, gold: 0.6, special: 0.07 },
      floor: "special",
      tone: "gold",
      note: "11 · one special min"
    },
    {
      id: "stars",
      cat: "limited",
      name: "Limited: Stars",
      cost: 4e4,
      size: 3,
      limited: !0,
      guarantee: "star",
      odds: { bronze: 0, silver: 0, gold: 0.55, special: 0.45 },
      note: "3 cards · 79+ min",
      promise: "1 guaranteed 92-rated Star"
    },
    {
      id: "limited",
      cat: "limited",
      name: "Limited: Icons",
      cost: 75e3,
      size: 3,
      limited: !0,
      guarantee: "icon",
      odds: { bronze: 0, silver: 0, gold: 0.3, special: 0.7 },
      note: "3 cards · 79+ min",
      promise: "1 guaranteed 99-rated Icon"
    },
    /* One card, Limited money, no guarantee stamped on it — the odds ARE the
       promise. Sits between High Roller (26k, one card, 26% special) and the
       guaranteed Star/Icon packs: nearly always special, never certain. */
    {
      id: "wildcard",
      cat: "limited",
      name: "Limited: Wildcard",
      cost: 55e3,
      size: 1,
      limited: !0,
      odds: { bronze: 0, silver: 0, gold: 0.1, special: 0.9 },
      minOverall: 86,
      tone: "special",
      note: "1 card · 86+ min",
      promise: "90% special or better"
    },
    /* The top of the objective ladder pays this, and almost nothing else does.
       It is in the store so it has a stated price, but 200,000 Apex is roughly
       forty division wins — the intended way to hold one is to earn it. */
    {
      id: "legend",
      cat: "limited",
      name: "Limited: Legends",
      cost: 2e5,
      size: 5,
      limited: !0,
      guarantee: "icon",
      odds: { bronze: 0, silver: 0, gold: 0.14, special: 0.86 },
      note: "5 cards · 84+ min",
      promise: "1 guaranteed Icon · best odds in the game"
    }
  ], FREE_MS = 360 * 60 * 1e3;
  var packTone = (p) => p.tone || p.guarantee || p.id, RARITY_RANK = { bronze: 0, silver: 1, gold: 2, special: 3, star: 4, icon: 5 };
  function rollRarity(odds) {
    let r = Math.random(), acc = 0;
    for (let [rarity, chance] of Object.entries(odds))
      if (acc += chance, r <= acc) return rarity;
    return "silver";
  }
  function drawPlayer(rarity, seen, only = null) {
    let matches = (p) => !p.sbc && p.rarity === rarity && (!only || only(p)), src = WORLD.players.filter(matches);
    src.length || (src = only ? WORLD.players.filter((p) => !p.sbc && only(p)) : WORLD.players.filter((p) => !p.sbc));
    let fresh = seen ? src.filter((p) => !seen.has(p.id)) : src, from = fresh.length ? fresh : src;
    return from[Math.floor(Math.random() * from.length)];
  }
  function filterOf(f) {
    return f ? (p) => {
      var _a;
      return (!f.nations || f.nations.includes(p.nation)) && (!f.leagues || p.clubId && f.leagues.includes((_a = WORLD.clubsById[p.clubId]) == null ? void 0 : _a.league)) && (!f.clubs || f.clubs.includes(p.clubId)) && (!f.positions || f.positions.includes(p.position)) && (!f.minOverall || p.overall >= f.minOverall);
    } : null;
  }
  function openPack(pack, seen = /* @__PURE__ */ new Set(), needGK = !1) {
    let scope = filterOf(pack.filter), draw2 = (rarity, extra = null) => {
      let p = drawPlayer(rarity, seen, scope && extra ? (p2) => scope(p2) && extra(p2) : scope || extra), dup = seen.has(p.id);
      return seen.add(p.id), { p, dup };
    }, pulls = [];
    for (let i = 0; i < pack.size; i++) pulls.push(draw2(rollRarity(pack.odds)));
    pack.floor && !pulls.some((x) => RARITY_RANK[x.p.rarity] >= RARITY_RANK[pack.floor]) && (pulls[pulls.length - 1] = draw2(pack.floor)), pack.minOverall && pulls.forEach((x, i) => {
      x.p.overall < pack.minOverall && (pulls[i] = draw2(
        Math.random() < 0.25 ? "special" : "gold",
        (p) => p.overall >= pack.minOverall
      ));
    }), pack.limited && pulls.forEach((x, i) => {
      (x.p.rarity === "bronze" || x.p.rarity === "silver") && (pulls[i] = draw2(Math.random() < 0.6 ? "special" : "gold"));
    });
    let wantPos = pack.forcePosition || (needGK ? "GK" : null);
    if (wantPos && !pulls.some((x) => x.p.position === wantPos) && (pulls[0] = draw2(rollRarity(pack.odds), (p) => p.position === wantPos)), pack.guarantee) {
      let lo = wantPos ? 1 : 0, at = lo + Math.floor(Math.random() * Math.max(1, pulls.length - lo));
      pulls[at] = draw2(pack.guarantee);
    }
    return pulls;
  }
  var dupValue = (p) => Math.round(p.value / 25e3);

  // js/game/sim.js
  var PITCH = { w: 105, h: 68 }, GOAL_HALF = 5.5, CY = PITCH.h / 2, BOX_W = 16.5, BOX_HALF = 20, PRESETS = {
    authentic: {
      id: "authentic",
      name: "Authentic",
      blurb: "Heavier ball, disciplined shape, physics-driven rebounds.",
      passSpeed: 0.93,
      // the ball takes its time
      control: 0.9,
      // looser first touch
      hands: 0.95,
      // keepers spill more
      deflect: 0.3,
      // and a parry mostly goes where it was hit
      tackle: 1.08,
      // defenders win what real defenders win
      discipline: 1.15
      // hold the line instead of chasing
    },
    competitive: {
      id: "competitive",
      name: "Competitive",
      blurb: "Quicker passing, tighter control, keepers steer their saves.",
      passSpeed: 1.1,
      control: 1.12,
      // deliberately not raised: "sharper rebounds" is the steering below, not
      // better shot-stopping. Giving keepers both put the mode a third of a goal
      // a match under Authentic, which is backwards for the attacking preset.
      hands: 1,
      deflect: 0.85,
      tackle: 0.94,
      discipline: 0.9
    }
  }, SHAPES = {
    "4-4-2": [
      { x: 0.045, y: 0.5, role: "GK" },
      { x: 0.2, y: 0.16, role: "DEF" },
      { x: 0.16, y: 0.38, role: "DEF" },
      { x: 0.16, y: 0.62, role: "DEF" },
      { x: 0.2, y: 0.84, role: "DEF" },
      { x: 0.44, y: 0.13, role: "MID" },
      { x: 0.38, y: 0.4, role: "MID" },
      { x: 0.38, y: 0.6, role: "MID" },
      { x: 0.44, y: 0.87, role: "MID" },
      { x: 0.66, y: 0.36, role: "FWD" },
      { x: 0.66, y: 0.64, role: "FWD" }
    ],
    "4-3-3": [
      { x: 0.045, y: 0.5, role: "GK" },
      { x: 0.2, y: 0.15, role: "DEF" },
      { x: 0.16, y: 0.38, role: "DEF" },
      { x: 0.16, y: 0.62, role: "DEF" },
      { x: 0.2, y: 0.85, role: "DEF" },
      { x: 0.4, y: 0.28, role: "MID" },
      { x: 0.34, y: 0.5, role: "MID" },
      { x: 0.4, y: 0.72, role: "MID" },
      { x: 0.68, y: 0.16, role: "FWD" },
      { x: 0.72, y: 0.5, role: "FWD" },
      { x: 0.68, y: 0.84, role: "FWD" }
    ],
    "4-2-3-1": [
      { x: 0.045, y: 0.5, role: "GK" },
      { x: 0.2, y: 0.15, role: "DEF" },
      { x: 0.16, y: 0.38, role: "DEF" },
      { x: 0.16, y: 0.62, role: "DEF" },
      { x: 0.2, y: 0.85, role: "DEF" },
      { x: 0.32, y: 0.38, role: "MID" },
      { x: 0.32, y: 0.62, role: "MID" },
      { x: 0.56, y: 0.16, role: "MID" },
      { x: 0.54, y: 0.5, role: "MID" },
      { x: 0.56, y: 0.84, role: "MID" },
      { x: 0.74, y: 0.5, role: "FWD" }
    ],
    "3-5-2": [
      { x: 0.045, y: 0.5, role: "GK" },
      { x: 0.17, y: 0.28, role: "DEF" },
      { x: 0.14, y: 0.5, role: "DEF" },
      { x: 0.17, y: 0.72, role: "DEF" },
      { x: 0.46, y: 0.1, role: "MID" },
      { x: 0.36, y: 0.34, role: "MID" },
      { x: 0.32, y: 0.5, role: "MID" },
      { x: 0.36, y: 0.66, role: "MID" },
      { x: 0.46, y: 0.9, role: "MID" },
      { x: 0.68, y: 0.38, role: "FWD" },
      { x: 0.68, y: 0.62, role: "FWD" }
    ],
    "5-3-2": [
      { x: 0.045, y: 0.5, role: "GK" },
      { x: 0.24, y: 0.1, role: "DEF" },
      { x: 0.15, y: 0.3, role: "DEF" },
      { x: 0.12, y: 0.5, role: "DEF" },
      { x: 0.15, y: 0.7, role: "DEF" },
      { x: 0.24, y: 0.9, role: "DEF" },
      { x: 0.4, y: 0.3, role: "MID" },
      { x: 0.36, y: 0.5, role: "MID" },
      { x: 0.4, y: 0.7, role: "MID" },
      { x: 0.66, y: 0.38, role: "FWD" },
      { x: 0.66, y: 0.62, role: "FWD" }
    ]
  }, FORMATION_NAMES = Object.keys(SHAPES), SHAPE = SHAPES["4-4-2"], ROLE_OF = {
    GK: "GK",
    CB: "DEF",
    LB: "DEF",
    RB: "DEF",
    CDM: "MID",
    CM: "MID",
    CAM: "MID",
    LM: "MID",
    RM: "MID",
    LW: "FWD",
    RW: "FWD",
    ST: "FWD"
  }, MENTALITY = { defensive: 0.72, balanced: 1, attacking: 1.32 }, PRESSING = { low: 0.7, normal: 1, high: 1.4 }, BENCH_SIZE = 5, MAX_SUBS = 3, GRAV = 16, GOAL_HEIGHT = 2.44, TUNE = { drop: 2, squeeze: 0.93, counter: !0, sweeper: !0, runs: !0, keeperDist: !0 }, clamp2 = (v, lo, hi) => Math.max(lo, Math.min(hi, v)), dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), strongSide = (p) => p.ref.foot === "L" ? -1 : 1;
  function pickXI(clubId) {
    let pool = rosterOf(clubId).slice().sort((a, b) => b.overall - a.overall), take = (list, n, used2) => pool.filter((p) => list.includes(p.position) && !used2.has(p)).slice(0, n), used = /* @__PURE__ */ new Set(), add = (arr) => (arr.forEach((p) => used.add(p)), arr), xi = [
      ...add(take(["GK"], 1, used)),
      ...add(take(["CB", "LB", "RB"], 4, used)),
      ...add(take(["CDM", "CM", "CAM", "LM", "RM"], 4, used)),
      ...add(take(["ST", "LW", "RW"], 2, used))
    ];
    for (let p of pool) {
      if (xi.length >= 11) break;
      used.has(p) || (xi.push(p), used.add(p));
    }
    return xi.slice(0, 11);
  }
  function attributesOf(ref) {
    return {
      maxSpeed: 5.4 + ref.stats.pace / 100 * 3.8,
      // 1 is fresh, 0 is spent. A strong physical player empties slower and
      // fills faster, which is most of what the stat is for.
      stamina: 1,
      stamCost: 1.35 - ref.stats.physical / 100 * 0.6
    };
  }
  function makeTeam(clubId, side, isHuman, custom = null) {
    var _a, _b;
    let club = getClub(clubId), xi = ((_a = custom == null ? void 0 : custom.xi) == null ? void 0 : _a.length) === 11 ? custom.xi : pickXI(clubId), dir = side === 0 ? 1 : -1, players = xi.map((ref, i) => {
      let s = SHAPE[i], sx = side === 0 ? s.x : 1 - s.x, sy = side === 0 ? s.y : 1 - s.y;
      return {
        ref,
        num: i + 1,
        team: side,
        role: s.role,
        sx,
        sy,
        x: sx * PITCH.w,
        y: sy * PITCH.h,
        vx: 0,
        vy: 0,
        dirX: dir,
        dirY: 0,
        ...attributesOf(ref),
        touchLock: 0,
        stumble: 0,
        holdT: 0,
        slide: 0,
        diveT: 0,
        diveDir: 0,
        skillT: 0,
        injured: !1,
        runUntil: 0
      };
    }), onPitch = new Set(xi.map((r) => r.id)), bench = ((_b = custom == null ? void 0 : custom.bench) != null && _b.filter(Boolean).length ? custom.bench.filter(Boolean) : null) || rosterOf(clubId).filter((r) => !onPitch.has(r.id)).sort((a, b) => b.overall - a.overall).slice(0, BENCH_SIZE);
    return {
      clubId,
      club,
      name: (custom == null ? void 0 : custom.name) || club.name,
      short: (custom == null ? void 0 : custom.short) || club.short,
      colors: (custom == null ? void 0 : custom.colors) || club.crest.colors,
      dir,
      side,
      isHuman,
      players,
      bench,
      subsLeft: MAX_SUBS,
      score: 0,
      shots: 0,
      onTarget: 0,
      poss: 0,
      scorers: [],
      formation: "4-4-2",
      // a custom squad may bring an instruction with it — the Apex Division uses
      // this to make the CPU press and push up the higher you climb
      tactics: { mentality: "balanced", pressing: "normal", ...(custom == null ? void 0 : custom.tactics) || {} }
    };
  }
  var Match = class {
    constructor(homeId, awayId, opts = {}) {
      var _a, _b, _c;
      this.mode = opts.mode || "single", this.human = opts.human === null ? null : (_a = opts.human) != null ? _a : 0, this.teams = [
        makeTeam(homeId, 0, this.human === 0, opts.homeSquad || null),
        makeTeam(awayId, 1, this.human === 1, opts.awaySquad || null)
      ], this.human === null ? this.controllers = [] : this.mode === "versus" ? (this.controllers = [
        { team: 0, activeIdx: 10, charge: 0, passCharge: 0 },
        { team: 1, activeIdx: 10, charge: 0, passCharge: 0 }
      ], this.teams[1].isHuman = !0) : this.mode === "coop" ? this.controllers = [
        { team: 0, activeIdx: 10, charge: 0, passCharge: 0 },
        { team: 0, activeIdx: 9, charge: 0, passCharge: 0 }
      ] : this.controllers = [{ team: this.human, activeIdx: 10, charge: 0, passCharge: 0 }], this.duration = (_b = opts.duration) != null ? _b : 240, this.skill = (_c = opts.skill) != null ? _c : 1, this.momentum = 0, this.preset = PRESETS[opts.preset] || PRESETS.authentic, this.ball = { x: PITCH.w / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null }, this.stoppages = 0, this.stoppage = null, this.t = 0, this.half = 1, this.phase = "kickoff", this.phaseT = 1.4, this.banner = "KICK OFF", this.activeIdx = 10, this.basis = null, this.charge = 0, this.feed = [], this.cues = [], this.setPiece = null, this.injuries = [], this.fouls = [0, 0], this.lastOwnerTeam = null, this.kickoffSide = 1, this.resetPositions(0);
    }
    /* ------------------------------ state ------------------------------ */
    get humanTeam() {
      return this.human === null ? null : this.teams[this.human];
    }
    /** Player held by seat 0 — kept for anything that only knows about one human. */
    /**
     * The one side a person is playing, or null if that is not a thing here.
     *
     * Couch versus and online both seat a human on each team, and there is no CPU
     * to raise the game of; co-op seats two people on the same team, which is
     * still one human side. Momentum below needs to know the difference.
     */
    get soloHumanSide() {
      if (this.human === null || !this.controllers.length) return null;
      let t = this.controllers[0].team;
      return this.controllers.every((c) => c.team === t) ? t : null;
    }
    /**
     * How hard the CPU on `team` is trying *right now*.
     *
     * `skill` is the match's baseline — `divisionSkill` sets it from the rung you
     * are on, 0.8 at the bottom to 1.9 at the top, 0.11 a rung. Momentum adds up
     * to 0.45 on top, so a side under full momentum plays about four rungs above
     * its own, using the same lever the ladder already uses.
     *
     * **Only the side you are not on gets it.** `skill` drives the off-ball AI of
     * *both* teams — your own ten team-mates included — so adding it globally
     * would have sharpened your press in exact step with theirs and largely
     * cancelled itself out. The boost is asked for by team for that reason.
     *
     * **And it only ever adds.** Momentum is clamped to 0 at the bottom, so the
     * floor is the baseline the match was created with: cruising cannot make the
     * opposition worse than the division it belongs to.
     */
    aiSkillFor(team) {
      let mgr = this.mgrSide === team && typeof this.mgrPerf == "number" ? (this.mgrPerf - 0.5) * 0.44 : 0, me = this.soloHumanSide;
      return me === null || team === me ? this.skill + mgr : this.skill + 0.45 * this.momentum + mgr;
    }
    /**
     * Momentum: the CPU raises its game when the match has stopped being one.
     *
     * A three-goal lead with two minutes left is the most boring state this game
     * can be in — the result is settled and nothing that happens next matters.
     * Rather than hand the player a win that plays itself, the opposition starts
     * pressing harder, closing quicker and shooting sooner the further ahead you
     * get, so seeing out a big lead is its own thing to do.
     *
     * One goal is a match, so nothing happens there. It ramps from two, and tops
     * out at a four-goal lead.
     *
     * Rise is quicker than fall on purpose: going 3-0 up should be answered
     * within a few seconds, while the CPU pulling one back should not instantly
     * hand the advantage straight back to you — the lead has to actually be
     * defended for a while before the game eases off again.
     *
     * AI-vs-AI is skipped outright. That is the configuration every balance sweep
     * runs, and it is the baseline the whole economy is tuned against; quietly
     * moving it whenever one CPU went two up would invalidate every number in
     * this file's header.
     */
    updateMomentum(dt) {
      let me = this.soloHumanSide;
      if (me === null) {
        this.momentum = 0;
        return;
      }
      let lead = this.teams[me].score - this.teams[1 - me].score, target = Math.max(0, Math.min(1, (lead - 1) / 3)), rate = target > this.momentum ? 1.1 : 0.3;
      this.momentum += (target - this.momentum) * Math.min(1, rate * dt);
    }
    get active() {
      return this.playerOf(this.controllers[0]);
    }
    /** Every player currently under human control. */
    get actives() {
      return this.controllers.map((c) => this.playerOf(c)).filter(Boolean);
    }
    playerOf(c) {
      return c ? this.teams[c.team].players[c.activeIdx] : null;
    }
    isControlled(p) {
      return this.controllers.some((c) => this.playerOf(c) === p);
    }
    minute() {
      return Math.min(90, Math.floor(this.t / this.duration * 90));
    }
    possession() {
      let total = this.teams[0].poss + this.teams[1].poss || 1, h = Math.round(this.teams[0].poss / total * 100);
      return [h, 100 - h];
    }
    resetPositions(kickoffSide) {
      this.kickoffSide = kickoffSide;
      for (let team of this.teams) {
        for (let p of team.players)
          p.x = p.sx * PITCH.w, p.y = p.sy * PITCH.h, p.vx = p.vy = 0, p.touchLock = p.stumble = p.holdT = p.slide = 0, p.celebrating = !1, p.diveT = 0;
        let half = team.dir > 0;
        for (let p of team.players)
          half && p.x > PITCH.w / 2 - 2 && (p.x = PITCH.w / 2 - 2 - (p.role === "FWD" ? 3 : 8)), !half && p.x < PITCH.w / 2 + 2 && (p.x = PITCH.w / 2 + 2 + (p.role === "FWD" ? 3 : 8));
      }
      let takers = this.teams[kickoffSide].players, taker = takers.find((p) => p.role === "FWD") || takers.find((p) => p.role === "MID") || takers[10];
      taker.x = PITCH.w / 2 - this.teams[kickoffSide].dir * 1.6, taker.y = CY, this.kickoffTaker = taker, this.selectForKickoff(), Object.assign(this.ball, {
        x: PITCH.w / 2,
        y: CY,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        owner: null,
        lastTouch: null,
        inNet: null,
        curl: 0
      }), this.kickoffTaker = taker;
    }
    startPlay() {
      (this.phase === "goal" || this.phase === "kickoff") && (this.ball.owner = this.kickoffTaker, this.kickoffTaker.touchLock = 0, this.cue("whistle", 1)), this.phase = "play", this.banner = "";
    }
    /* ------------------------------ update ----------------------------- */
    update(dt, input) {
      var _a, _b;
      if (this.phase === "end") return;
      let seats = Array.isArray(input) ? input : [input];
      if (this.phase !== "play") {
        if (this.phaseT -= dt, this.phase === "goal" && this.updateCelebration(dt), (_a = this.setPiece) != null && _a.human && this.phaseT > 0) {
          let c = this.controllers.find((k) => k.team === this.setPiece.team), inp = c ? seats[this.controllers.indexOf(c)] || seats[0] : null;
          if (c && inp && this.readSetPieceInput(c, inp, dt)) return;
        }
        if (this.phaseT <= 0) {
          if (this.phase === "corner") {
            this.takeCorner();
            return;
          }
          if (this.phase === "penalty") {
            this.takePenalty();
            return;
          }
          if (this.phase === "freekick") {
            this.takeFreeKick();
            return;
          }
          if (this.phase === "throwin") {
            this.takeThrowIn();
            return;
          }
          this.phase === "goal" && this.resetPositions((_b = this.pendingKickoff) != null ? _b : 0), this.phase === "half" && (this.half = 2, this.resetPositions(0)), this.startPlay();
        }
        return;
      }
      if (this.t += dt, this.updateMomentum(dt), this.half === 1 && this.t >= this.duration / 2) {
        this.phase = "half", this.phaseT = 1.8, this.banner = "HALF TIME", this.cue("whistle", 2);
        return;
      }
      if (this.t >= this.duration) {
        this.phase = "end", this.banner = "FULL TIME", this.cue("whistle", 3);
        return;
      }
      if (this.ball.owner && (this.teams[this.ball.owner.team].poss += dt), this.ball.owner) {
        let t = this.ball.owner.team;
        if (t !== this.lastOwnerTeam) {
          let ownHalf = (this.ball.x - PITCH.w / 2) * this.teams[t].dir < 0;
          this.lastOwnerTeam !== null && ownHalf && (this.possessT || 0) > 2.5 && this.t - (this.lastCounterAt || -99) > 12 && (this.teams[t].counterT = 2.8, this.lastCounterAt = this.t, this.cue("counter", t)), this.lastOwnerTeam = t, this.possessT = 0;
        }
        this.possessT = (this.possessT || 0) + dt;
      }
      for (let team of this.teams) team.counterT = Math.max(0, (team.counterT || 0) - dt);
      this._tick = (this._tick || 0) + 1, this.chasers = [this.nearestTo(0, this.ball, !0), this.nearestTo(1, this.ball, !0)], this.chasers2 = [
        this.pressingOf(0) >= 1.4 ? this.secondNearest(0, this.ball) : null,
        this.pressingOf(1) >= 1.4 ? this.secondNearest(1, this.ball) : null
      ], this.supporters = [null, null];
      let carrier = this.ball.owner;
      if (carrier) {
        let mates = this.teams[carrier.team].players.filter((q) => q !== carrier && q.role !== "GK").sort((a, z) => dist(a, carrier) - dist(z, carrier));
        this.supporters[carrier.team] = [mates[0], mates[1]];
      }
      this.controllers.forEach((c, i) => {
        let inp = seats[i] || seats[0];
        inp && this.handleSeat(c, dt, inp);
      });
      for (let team of this.teams)
        for (let p of team.players)
          p.touchLock = Math.max(0, p.touchLock - dt), p.stumble = Math.max(0, p.stumble - dt), p.slide = Math.max(0, p.slide - dt), p.skillT = Math.max(0, (p.skillT || 0) - dt), !this.isControlled(p) && this.think(p, dt);
      for (let team of this.teams)
        for (let p of team.players)
          this.integrate(p, dt), this.fatigue(p, dt);
      this.separate(), this.updateBall(dt), this.switchOnPossession();
    }
    /**
     * Control follows the ball whenever your side has it — including a teammate
     * receiving your pass. Off the ball nothing moves on its own; you pick with L1/R1.
     */
    switchOnPossession() {
      let o = this.ball.owner;
      if (!o) return;
      let seats = this.controllers.filter((c) => c.team === o.team);
      if (!seats.length || seats.some((c) => this.playerOf(c) === o)) return;
      let best = seats[0], bestD = 1 / 0;
      for (let c of seats) {
        let d2 = dist(this.playerOf(c), o);
        d2 < bestD && (bestD = d2, best = c);
      }
      let i = this.teams[best.team].players.indexOf(o);
      i >= 0 && (best.activeIdx = i), this.dedupeSeats();
    }
    /** Two people must never end up steering the same footballer. */
    dedupeSeats() {
      for (let i = 1; i < this.controllers.length; i++) {
        let c = this.controllers[i], taken = this.controllers.slice(0, i).map((o) => this.playerOf(o));
        if (!taken.includes(this.playerOf(c))) continue;
        let best = null, bestD = 1 / 0;
        for (let p of this.teams[c.team].players) {
          if (p.role === "GK" || taken.includes(p)) continue;
          let d2 = dist(p, this.ball);
          d2 < bestD && (bestD = d2, best = p);
        }
        best && (c.activeIdx = this.teams[c.team].players.indexOf(best));
      }
    }
    /* -------------------------- substitutions -------------------------- */
    /**
     * Bring a bench player on for someone on the pitch.
     *
     * The shirt stays where it is — same slot, same role, same shape duty — and
     * only the card underneath it changes, so a substitution can never leave a
     * formation with a hole in it. Position, velocity and possession are all
     * inherited: swapping a man carrying the ball hands the ball to the man
     * coming on rather than dropping it, which is wrong but is a great deal
     * better than a loose ball appearing from nowhere.
     *
     * @param {number} teamIdx
     * @param {number} pitchIdx index into `team.players`
     * @param {number} benchIdx index into `team.bench`
     * @returns {boolean} whether it happened
     */
    substitute(teamIdx, pitchIdx, benchIdx) {
      var _a;
      let team = this.teams[teamIdx];
      if (!team || team.subsLeft <= 0) return !1;
      let p = team.players[pitchIdx], incoming = (_a = team.bench) == null ? void 0 : _a[benchIdx];
      return !p || !incoming || p.role === "GK" && incoming.position !== "GK" ? !1 : (team.bench[benchIdx] = p.ref, p.ref = incoming, Object.assign(p, attributesOf(incoming)), p.touchLock = 0, p.stumble = 0, p.slide = 0, p.diveT = 0, p.injured = !1, p.skillT = 0, team.subsLeft -= 1, this.cue("whistle"), !0);
    }
    /* ----------------------------- movement ---------------------------- */
    /**
     * Stamina.
     *
     * Drained by how hard a player is running rather than by whether a button is
     * held, so the CPU tires on the same terms a person does. It costs nothing to
     * jog: the drain only bites above roughly two-thirds of a player's top speed,
     * which is the point at which a footballer is actually working. Recovery is
     * slower than the drain, so a match spent sprinting has a price late on.
     *
     * A tired player is slower, never stopped — 82% of top speed at zero is
     * enough to feel and not enough to make the game unplayable.
     *
     * The three numbers below were swept AI-vs-AI, not chosen by feel. They land
     * the league on 2.25 goals and 12.4 shots a match, against 3.20 and 12.5
     * before stamina existed, and leave the players who chase the ball all game
     * near empty at full time while a holding midfielder is barely touched.
     */
    fatigue(p, dt) {
      let effort = Math.hypot(p.vx, p.vy) / p.maxSpeed;
      effort > 0.66 ? p.stamina -= (effort - 0.66) * p.stamCost * 0.06 * dt : p.stamina += (0.66 - effort) * 0.075 * dt, p.stamina = clamp2(p.stamina, 0, 1);
    }
    integrate(p, dt) {
      p.slide > 0 ? (p.x += p.vx * dt, p.y += p.vy * dt, p.vx *= 0.94, p.vy *= 0.94) : (p.x += p.vx * dt, p.y += p.vy * dt), p.x = clamp2(p.x, 0.5, PITCH.w - 0.5), p.y = clamp2(p.y, 0.5, PITCH.h - 0.5);
      let sp = Math.hypot(p.vx, p.vy);
      sp > 0.6 && (p.dirX = p.vx / sp, p.dirY = p.vy / sp);
    }
    drive(p, dx, dy, dt, factor = 1) {
      if (p.slide > 0) return;
      let m = Math.hypot(dx, dy), tired = 0.82 + p.stamina * 0.18, speed = p.maxSpeed * factor * tired * (p.stumble > 0 ? 0.45 : 1), tx = m > 1e-3 ? dx / m * speed : 0, ty = m > 1e-3 ? dy / m * speed : 0, k = Math.min(1, dt * 9);
      p.vx += (tx - p.vx) * k, p.vy += (ty - p.vy) * k;
    }
    moveTo(p, x, y, dt, factor = 1) {
      let dx = x - p.x, dy = y - p.y, d2 = Math.hypot(dx, dy);
      this.drive(p, dx, dy, dt, d2 < 1.6 ? factor * (d2 / 1.6) : factor);
    }
    separate() {
      let all = [...this.teams[0].players, ...this.teams[1].players];
      for (let i = 0; i < all.length; i++)
        for (let j = i + 1; j < all.length; j++) {
          let a = all[i], b = all[j], dx = b.x - a.x, dy = b.y - a.y, d2 = Math.hypot(dx, dy) || 0.01;
          if (d2 < 2.1) {
            let push2 = (2.1 - d2) / 2;
            a.x -= dx / d2 * push2, a.y -= dy / d2 * push2, b.x += dx / d2 * push2, b.y += dy / d2 * push2;
          }
        }
      this.protectKeeper();
    }
    /**
     * While a keeper is holding the ball, opponents are kept out of a ring around
     * them until the ball is released — you cannot stand over a goal kick.
     */
    protectKeeper() {
      let o = this.ball.owner;
      if (!o || o.role !== "GK") return;
      let R = 7.5;
      for (let p of this.teams[1 - o.team].players) {
        let dx = p.x - o.x, dy = p.y - o.y, d2 = Math.hypot(dx, dy) || 0.01;
        if (d2 >= R) continue;
        let push2 = R - d2;
        p.x += dx / d2 * push2, p.y += dy / d2 * push2, p.vx *= 0.2, p.vy *= 0.2, p.x = clamp2(p.x, 0.5, PITCH.w - 0.5), p.y = clamp2(p.y, 0.5, PITCH.h - 0.5);
      }
    }
    /* ------------------------------ human ------------------------------ */
    /** Drive one seat's player. Called once per controller per frame. */
    handleSeat(c, dt, input) {
      var _a, _b;
      let p = this.playerOf(c);
      if (!p) return;
      let raw = input.axis(), B = this.basis, fwd = -raw.y, aim = B ? { x: B.rx * raw.x + B.fx * fwd, y: B.ry * raw.x + B.fy * fwd } : { x: raw.x, y: fwd };
      if (this.drive(p, aim.x, aim.y, dt, input.held("sprint") ? 1.24 : 1), input.pressed("switch") && this.cycleActive(c), this.ball.owner === p) {
        if (input.held("pass") && (c.passCharge = Math.min(1, c.passCharge + dt / 0.7)), input.released("pass") && (this.pass(p, aim, !1, Math.max(0.3, c.passCharge)), c.passCharge = 0), input.pressed("through") ? this.pass(p, aim, !0, 0.5) : input.pressed("lob") ? this.pass(p, aim, !0, 0.55, !0) : input.pressed("cross") && this.cross(p, aim), input.pressed("skill") && this.skillMove(p, aim), input.held("shoot") && (c.charge = Math.min(1, c.charge + dt / 0.85)), input.released("shoot")) {
          let curled = input.held("curl");
          this.shoot(p, aim, Math.max(0.28, c.charge), {
            loft: curled ? 1.35 : 1,
            curl: curled ? 34 : 0
          }), c.charge = 0;
        }
      } else
        c.charge = 0, c.passCharge = 0, (input.pressed("pass") || input.pressed("through") || input.pressed("cross") || input.pressed("shoot")) && this.tackle(p);
      this.charge = ((_a = this.controllers[0]) == null ? void 0 : _a.charge) || 0, this.passCharge = ((_b = this.controllers[0]) == null ? void 0 : _b.passCharge) || 0;
    }
    /** L1 / R1 — jump to whoever is closest to the ball, skipping the other seat's man. */
    cycleActive(c = this.controllers[0]) {
      if (!c) return;
      let taken = this.controllers.filter((o) => o !== c).map((o) => this.playerOf(o)), best = null, bestD = 1 / 0;
      for (let p of this.teams[c.team].players) {
        if (p.role === "GK" || taken.includes(p)) continue;
        let d2 = dist(p, this.ball);
        d2 < bestD && (bestD = d2, best = p);
      }
      best && (c.activeIdx = this.teams[c.team].players.indexOf(best));
    }
    /**
     * Re-slot a side into a different shape, keeping the same eleven players and
     * giving each slot the best natural fit still available.
     */
    applyFormation(teamIdx, name2) {
      let shape = SHAPES[name2];
      if (!shape) return;
      let team = this.teams[teamIdx], used = /* @__PURE__ */ new Set(), take = (role) => {
        let best = null, bestScore = -1;
        for (let p of team.players) {
          if (used.has(p)) continue;
          let nat = ROLE_OF[p.ref.position] || "MID";
          if (nat === "GK" != (role === "GK")) continue;
          let s = (nat === role ? 300 : 0) + p.ref.overall;
          s > bestScore && (bestScore = s, best = p);
        }
        return best || (best = team.players.find((p) => !used.has(p))), used.add(best), best;
      };
      for (let slot of shape) {
        let p = take(slot.role);
        p && (p.role = slot.role, p.sx = teamIdx === 0 ? slot.x : 1 - slot.x, p.sy = teamIdx === 0 ? slot.y : 1 - slot.y);
      }
      team.formation = name2;
    }
    setTactic(teamIdx, key, value) {
      let t = this.teams[teamIdx].tactics;
      key in t && (t[key] = value);
    }
    mentalityOf(teamIdx) {
      var _a;
      return (_a = MENTALITY[this.teams[teamIdx].tactics.mentality]) != null ? _a : 1;
    }
    pressingOf(teamIdx) {
      var _a;
      return (_a = PRESSING[this.teams[teamIdx].tactics.pressing]) != null ? _a : 1;
    }
    /** Only ever called at a restart, so you never lose the controlled player mid-play. */
    selectForKickoff() {
      if (!this.kickoffTaker) return;
      let seat = this.controllers.find((c) => c.team === this.kickoffSide);
      if (!seat) return;
      let i = this.teams[seat.team].players.indexOf(this.kickoffTaker);
      i >= 0 && (seat.activeIdx = i), this.dedupeSeats();
    }
    /* ------------------------------- ball ------------------------------ */
    updateBall(dt) {
      let b = this.ball;
      if (b.owner) {
        let o = b.owner;
        if (b.z = 0.16, b.vz = 0, o.role === "GK") {
          if (o.holdT += dt, b.x = o.x + o.dirX * 1.1, b.y = o.y + o.dirY * 1.1, b.vx = b.vy = 0, o.holdT > 0.9) {
            o.holdT = 0;
            let team = this.teams[o.team], free = team.players.filter((q) => q !== o && q.role !== "GK" && dist(q, o) < 34).map((q) => [q, this.nearestTo(1 - o.team, q)]).filter(([q, f]) => !f || dist(q, f) > 7).sort((x, y) => dist(x[0], o) - dist(y[0], o))[0];
            TUNE.keeperDist && free && Math.random() < 0.7 ? this.pass(o, { x: free[0].x - o.x, y: free[0].y - o.y }, !1, 0.45) : this.pass(o, { x: team.dir, y: (Math.random() - 0.5) * 0.5 }, !0, 0.85);
          }
          return;
        }
        let speed = Math.hypot(o.vx, o.vy), dx = b.x - o.x, dy = b.y - o.y, gap = Math.hypot(dx, dy), skill = o.ref.stats.dribbling / 100, lead = 0.85 + speed * 0.13, off = 0.34 * strongSide(o), tx = o.x + o.dirX * lead + o.dirY * off, ty = o.y + o.dirY * lead - o.dirX * off, stiff = (30 + skill * 26) * this.preset.control, damp2 = 10;
        if (b.vx += ((tx - b.x) * stiff - b.vx * damp2) * dt, b.vy += ((ty - b.y) * stiff - b.vy * damp2) * dt, b.x += b.vx * dt, b.y += b.vy * dt, o.touchT = (o.touchT || 0) - dt, o.touchT <= 0 && speed > 1.2) {
          let foe = this.nearestTo(1 - o.team, o), tight = foe && dist(o, foe) < 4 ? 0.75 : 1, push2 = (0.7 + speed * 0.18) * (1.3 - skill * 0.4);
          b.vx += o.dirX * push2, b.vy += o.dirY * push2, o.touchT = (0.3 + Math.random() * 0.16) * tight * (1.25 - skill * 0.33), this.cue("touch");
        }
        b.lastTouch = o;
        return;
      }
      if (b.curl) {
        let sp = Math.hypot(b.vx, b.vy);
        if (sp > 1.5) {
          let k = b.curl * sp / 26, vx0 = b.vx, vy0 = b.vy;
          b.vx += -vy0 / sp * k * dt, b.vy += vx0 / sp * k * dt;
        }
        b.curl *= Math.pow(0.55, dt), b.z <= 0 && (b.curl = 0);
      }
      b.x += b.vx * dt, b.y += b.vy * dt, b.z += b.vz * dt, b.vz -= GRAV * dt, b.z <= 0 && (b.z = 0, b.vz < -1.2 ? (b.vz = -b.vz * 0.42, b.vx *= 0.8, b.vy *= 0.8) : b.vz = 0);
      let damp = Math.pow(b.z > 0.4 ? 0.998 : 0.986, dt * 60);
      if (b.vx *= damp, b.vy *= damp, b.z === 0 && Math.hypot(b.vx, b.vy) < 0.5 && (b.vx = 0, b.vy = 0), b.noTouch = Math.max(0, (b.noTouch || 0) - dt), b.noTouch > 0) {
        this.bounds();
        return;
      }
      let best = null, bestD = 1 / 0;
      if (b.z < 2.5)
        for (let team of this.teams)
          for (let p of team.players) {
            if (p.touchLock > 0) continue;
            let r = p.role === "GK" ? p.diveT > 0 ? 2.6 : 1.68 : p.slide > 0 ? 2.2 : b.z > 0.8 ? 2.15 : 1.7, d2 = dist(p, b);
            d2 < r && d2 < bestD && (bestD = d2, best = p);
          }
      if (best) {
        let speed = Math.hypot(b.vx, b.vy), limit = best.role === "GK" ? 70 : 15 + best.ref.stats.dribbling * 0.17;
        if (speed > limit) {
          if (bestD < 1.5) {
            b.shotBy && b.shotBy.team !== best.team && (b.shotBy = null);
            let a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 1.1, s = speed * 0.42;
            b.vx = Math.cos(a) * s, b.vy = Math.sin(a) * s, b.lastTouch = best, best.touchLock = 0.3;
          }
        } else if (best.role === "GK" && b.shotBy && best.team !== b.shotBy.team) {
          if (this.teams[b.shotBy.team].onTarget++, !this.keeperContact(best, speed)) return;
          b.shotBy = null, b.owner = best, b.lastTouch = best, best.holdT = 0, best.diveT = 0;
        } else {
          if (b.shotBy = null, b.z > 0.85 && best.role !== "GK") {
            let goalX = this.teams[best.team].dir > 0 ? PITCH.w : 0;
            if (Math.hypot(goalX - best.x, CY - best.y) < 19) {
              b.lastTouch = best, this.cue("header"), this.shoot(best, null, 0.5, { loft: 0.2, placed: !0 });
              return;
            }
          }
          b.owner = best, b.lastTouch = best, best.holdT = 0;
        }
      }
      this.bounds();
    }
    /**
     * The frame is solid. Posts are vertical cylinders at each side of the goal,
     * the bar is the line across the top — a ball hitting either rebounds back
     * into play instead of sailing through.
     */
    hitFrame() {
      let b = this.ball, R = 0.11 + 0.11;
      for (let gx of [0, PITCH.w])
        if (!(Math.abs(b.x - gx) > 1.4)) {
          for (let py of [CY - GOAL_HALF, CY + GOAL_HALF]) {
            if (b.z > GOAL_HEIGHT + 0.1) continue;
            let dx = b.x - gx, dy = b.y - py, d2 = Math.hypot(dx, dy);
            if (d2 > R || d2 < 1e-4) continue;
            let nx = dx / d2, ny = dy / d2, vn = b.vx * nx + b.vy * ny;
            if (!(vn > 0))
              return b.vx -= 2 * vn * nx, b.vy -= 2 * vn * ny, b.vx *= 0.62, b.vy *= 0.62, b.x = gx + nx * (R + 0.01), b.y = py + ny * (R + 0.01), b.curl = 0, b.shotBy = null, this.cue("post"), !0;
          }
          if (Math.abs(b.y - CY) < GOAL_HALF + 0.2 && Math.abs(b.z - GOAL_HEIGHT) < 0.22 && b.vz > -40)
            return b.vz = -Math.abs(b.vz) * 0.55 - 1.2, b.vx *= 0.7, b.vy *= 0.7, b.z = GOAL_HEIGHT - 0.24, b.curl = 0, b.shotBy = null, this.cue("post"), !0;
        }
      return !1;
    }
    bounds() {
      let b = this.ball;
      if (!b.inNet && this.hitFrame()) return;
      let attackerSide = b.lastTouch ? b.lastTouch.team : 0;
      if (b.y < 0.4 || b.y > PITCH.h - 0.4) {
        b.shotBy && (this.cue("shotWide", b.shotBy), b.shotBy = null), this.startThrowIn(1 - attackerSide, b.x, b.y), this.markStoppage("throwin");
        return;
      }
      if (b.x < 0.4 || b.x > PITCH.w - 0.4) {
        let leftGoal = b.x < 0.4;
        if (Math.abs(b.y - CY) < GOAL_HALF && b.z < GOAL_HEIGHT) {
          this.scoreGoal(leftGoal ? 1 : 0, leftGoal ? -1 : 1, leftGoal ? 0 : PITCH.w);
          return;
        }
        let defending = leftGoal ? 0 : 1;
        if (b.shotBy && b.shotBy.team !== defending && (this.cue("shotWide", b.shotBy), b.shotBy = null), b.lastTouch && b.lastTouch.team === defending) {
          this.startCorner(1 - defending, b.y < CY ? 0 : PITCH.h, leftGoal ? 0 : PITCH.w), this.markStoppage("corner");
          return;
        }
        let side = this.teams[defending], gk = side.players.find((p) => p.role === "GK") || side.players[0];
        b.x = clamp2(b.x, 3, PITCH.w - 3), b.y = clamp2(b.y, 6, PITCH.h - 6), b.z = 0, gk.x = leftGoal ? 6 : PITCH.w - 6, gk.y = b.y, b.vx = b.vy = b.vz = 0, b.owner = gk, b.lastTouch = gk, gk.holdT = 0, this.markStoppage("goalkick");
      }
    }
    /** Record a dead-ball restart. Called by bounds() and scoreGoal, read by whoever polls. */
    markStoppage(kind) {
      this.stoppages += 1, this.stoppage = kind, this.autoSubInjured(0), this.autoSubInjured(1);
    }
    /**
     * Corner kick. Everyone is placed for the set piece, then the taker whips it
     * in when the phase timer expires.
     */
    startCorner(attacking, cornerY, cornerX) {
      let b = this.ball, atk = this.teams[attacking], def = this.teams[1 - attacking];
      b.x = cornerX < PITCH.w / 2 ? 0.6 : PITCH.w - 0.6, b.y = cornerY < CY ? 0.6 : PITCH.h - 0.6, b.z = 0, b.vx = b.vy = b.vz = 0, b.owner = null, b.curl = 0, b.shotBy = null;
      let goalX = cornerX < PITCH.w / 2 ? 0 : PITCH.w, inw = goalX < PITCH.w / 2 ? 1 : -1, taker = atk.players.filter((p) => p.role !== "GK").sort((a, z) => Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(z.x - b.x, z.y - b.y))[0];
      taker.x = b.x + inw * 1.4, taker.y = b.y + (b.y < CY ? 1.2 : -1.2), taker.vx = taker.vy = 0;
      let ATTACK_IN_BOX = 4, DEFEND_IN_BOX = 5, attackers = atk.players.filter((p) => p !== taker && p.role !== "GK").sort((a, z) => z.ref.stats.physical + z.ref.overall - (a.ref.stats.physical + a.ref.overall));
      attackers.forEach((p, i) => {
        p.vx = p.vy = 0, i < ATTACK_IN_BOX ? (p.x = goalX + inw * (5.5 + i % 2 * 5), p.y = CY + (i - (ATTACK_IN_BOX - 1) / 2) * 3.6) : i === ATTACK_IN_BOX ? (p.x = goalX + inw * 20, p.y = CY + (b.y < CY ? -6 : 6)) : (p.x = clamp2(goalX + inw * (34 + (i - ATTACK_IN_BOX) * 9), 6, PITCH.w - 6), p.y = clamp2(CY + (i % 3 - 1) * 12, 6, PITCH.h - 6));
      });
      let defenders = def.players.filter((p) => p.role !== "GK").sort((a, z) => z.ref.stats.defending - a.ref.stats.defending), gk = def.players.find((p) => p.role === "GK");
      gk && (gk.vx = gk.vy = 0, gk.x = goalX + inw * 1.6, gk.y = CY), defenders.forEach((p, i) => {
        if (p.vx = p.vy = 0, i < DEFEND_IN_BOX) {
          let t = attackers[i];
          t ? (p.x = t.x - inw * 1.6, p.y = t.y + (i % 2 ? 1.3 : -1.3)) : (p.x = goalX + inw * 5, p.y = CY + (i - 2) * 3.2);
        } else i === DEFEND_IN_BOX ? (p.x = goalX + inw * 12, p.y = CY) : (p.x = clamp2(goalX + inw * (26 + (i - DEFEND_IN_BOX) * 10), 5, PITCH.w - 5), p.y = clamp2(CY + (i % 3 - 1) * 14, 5, PITCH.h - 5));
      }), this.cue("whistle", 1), this.cue("cornerKick", attacking), this.cornerTaker = taker, this.phase = "corner", this.banner = "CORNER", this.setPiece = this.beginSetPiece("corner", attacking, taker, 1.5), this.corners = (this.corners || 0) + 1, this.teams[attacking].cornerCount = (this.teams[attacking].cornerCount || 0) + 1;
    }
    /** Whip the corner into the six-yard area and let the crowd of bodies attack it. */
    takeCorner() {
      let taker = this.cornerTaker;
      if (this.setPiece = null, this.phase = "play", this.banner = "", !taker) return;
      let team = this.teams[taker.team], b = this.ball, goalX = Math.abs(b.x - 0) < Math.abs(b.x - PITCH.w) ? 0 : PITCH.w, inw = goalX === 0 ? 1 : -1;
      b.owner = taker, taker.touchLock = 0;
      let tx = goalX + inw * (7 + Math.random() * 4), ty = CY + (Math.random() - 0.5) * 9, dx = tx - b.x, dy = ty - b.y, D = Math.hypot(dx, dy) || 1, T = clamp2(D / 18, 0.8, 1.8);
      this.release(taker, dx / T, dy / T, 0.5 * GRAV * T), this.ball.noTouch = 0.24, this.cornerTaker = null;
    }
    giveTo(side, x, y) {
      let b = this.ball;
      b.vx = b.vy = 0, b.x = clamp2(x, 1, PITCH.w - 1), b.y = clamp2(y, 1, PITCH.h - 1);
      let p = this.nearestTo(side, b, !0);
      p && (p.x = b.x - this.teams[side].dir * 1.2, p.y = b.y, p.touchLock = 0, b.owner = p, b.lastTouch = p);
    }
    scoreGoal(side, inw = 1, goalLineX = PITCH.w) {
      this.markStoppage("goal");
      let team = this.teams[side];
      team.score++, this.ball.shotBy && this.ball.shotBy.team === side && team.onTarget++, this.ball.shotBy = null;
      let scorer = this.ball.lastTouch && this.ball.lastTouch.team === side ? this.ball.lastTouch : null;
      scorer && team.scorers.push({ name: scorer.ref.name, minute: this.minute() }), this.feed.unshift("".concat(this.minute(), "'  ").concat(team.short, " — ").concat(scorer ? scorer.ref.name : "own goal")), this.banner = "GOAL", this.goalTeam = side, this.phase = "goal", this.phaseT = 4.2, this.cue("goal"), this.cue("net"), this.pendingKickoff = 1 - side, this.celebrant = scorer, this.celebT = 0, this.scorerName = scorer ? scorer.ref.name : "Own goal";
      let goalX = team.dir > 0 ? PITCH.w : 0, from = scorer || this.ball;
      this.celebSpot = {
        x: goalX - team.dir * 12,
        y: from.y < CY ? 7 : PITCH.h - 7
      };
      let b = this.ball;
      this.netHit = {
        x: b.x,
        y: b.y,
        z: Math.max(0.2, b.z),
        vx: b.vx,
        vy: b.vy,
        vz: b.vz,
        at: this.t
      }, b.owner = null, b.inNet = { inw, back: goalLineX + inw * 1.75 };
      for (let p of team.players) p.celebrating = !0;
    }
    /** Ball flight after it has crossed the line: the net drags it to a stop. */
    settleBallInNet(dt) {
      let b = this.ball;
      if (!b.inNet) return;
      b.x += b.vx * dt, b.y += b.vy * dt, b.z += b.vz * dt, b.vz -= GRAV * dt;
      let drag = Math.pow(0.045, dt);
      b.vx *= drag, b.vy *= drag, b.vz *= drag, b.z <= 0 && (b.z = 0, b.vz = Math.abs(b.vz) * 0.25, b.vz < 0.4 && (b.vz = 0));
      let { inw, back } = b.inNet;
      b.x = inw > 0 ? Math.min(b.x, back) : Math.max(b.x, back), b.y = clamp2(b.y, CY - GOAL_HALF + 0.25, CY + GOAL_HALF - 0.25), b.z = Math.min(b.z, GOAL_HEIGHT - 0.2);
    }
    /**
     * Runs while phase === 'goal'. The scorer sprints off, team-mates chase them
     * down, the conceding side trudges back into shape.
     */
    updateCelebration(dt) {
      this.celebT += dt, this.settleBallInNet(dt);
      let hero = this.celebrant, scoring = this.goalTeam;
      for (let team of this.teams)
        for (let p of team.players) {
          if (p.role === "GK") {
            let gx = team.dir > 0 ? 2.5 : PITCH.w - 2.5;
            this.moveTo(p, gx, CY, dt, 0.45);
          } else if (p.team === scoring)
            if (hero && p === hero) this.moveTo(p, this.celebSpot.x, this.celebSpot.y, dt, 1.12);
            else if (hero) {
              let i = team.players.indexOf(p);
              this.moveTo(p, hero.x - Math.cos(i) * 3.2, hero.y - Math.sin(i * 1.7) * 3.2, dt, 1);
            } else this.moveTo(p, p.sx * PITCH.w, p.sy * PITCH.h, dt, 0.6);
          else
            this.moveTo(p, p.sx * PITCH.w, p.sy * PITCH.h, dt, 0.45);
          p.touchLock = 0.5, this.integrate(p, dt);
        }
      this.separate();
    }
    /* ------------------------------ actions ---------------------------- */
    /** Queue an audio cue for the presentation layer. */
    cue(name2, arg) {
      this.cues.length < 24 && this.cues.push({ name: name2, arg });
    }
    release(p, vx, vy, vz = 0) {
      let b = this.ball;
      b.owner = null, b.lastTouch = p, b.shotBy = null, b.noTouch = 0.13, b.curl = 0, b.shotId = (b.shotId || 0) + 1, b.vx = vx, b.vy = vy, b.vz = vz, b.x = p.x + p.dirX * 1.3, b.y = p.y + p.dirY * 1.3, b.z = vz > 0 ? 0.35 : b.z, p.touchLock = 0.3;
    }
    /**
     * Lofted ball forward. Inside crossing range it hangs one up in the box for a
     * header; from deeper it becomes a long diagonal to the furthest teammate in
     * range rather than a rocket at the opponent's area from your own half.
     */
    cross(p, aim) {
      let team = this.teams[p.team], goalX = team.dir > 0 ? PITCH.w : 0, aimY = aim && Math.abs(aim.y) > 0.2 ? CY + aim.y * 9 : p.y > CY ? CY - 5 : CY + 5, RANGE = 40, tx = goalX - team.dir * 9, ty = aimY, best = null, bestD = 1 / 0;
      for (let t of team.players) {
        if (t === p || t.role === "GK" || Math.abs(t.x - goalX) > 24) continue;
        let d2 = Math.hypot(t.x - tx, t.y - ty);
        d2 < bestD && (bestD = d2, best = t);
      }
      if (best) {
        let rough = clamp2(Math.hypot(best.x - p.x, best.y - p.y) / 20, 0.6, 1.9);
        tx = best.x + best.vx * rough * 0.85 + team.dir * 0.4, ty = best.y + best.vy * rough * 0.85;
      }
      if (Math.hypot(tx - p.x, ty - p.y) > RANGE) {
        let out = null, bestAdv = -1 / 0;
        for (let t of team.players) {
          if (t === p || t.role === "GK" || Math.hypot(t.x - p.x, t.y - p.y) > RANGE) continue;
          let adv = (t.x - p.x) * team.dir;
          adv > bestAdv && (bestAdv = adv, out = t);
        }
        out ? (tx = out.x + team.dir * 3, ty = out.y) : (tx = p.x + team.dir * 26, ty = clamp2(p.y + (aim ? aim.y * 10 : 0), 4, PITCH.h - 4));
      }
      let dx = tx - p.x, dy = ty - p.y, D = Math.hypot(dx, dy) || 1, T = clamp2(D / 20, 0.6, 1.9);
      this.cue("cross"), this.release(p, dx / T, dy / T, 0.5 * GRAV * T), this.ball.noTouch = 0.26;
    }
    /**
     * @param {number} power 0-1. Reaches further and arrives harder, and is a
     *   little less accurate at the top end — a 50-yard ball should not be a
     *   certainty.
     */
    /** How well a player executes right now: tired legs and injuries blunt technique. */
    formOf(p) {
      var _a;
      return 1 - (1 - ((_a = p.stamina) != null ? _a : 1)) * 0.3 - (p.injured ? 0.25 : 0);
    }
    pass(p, aim, through, power = 0.35, lob = !1) {
      let team = this.teams[p.team], reach = 14 + power * 44, ax = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.x : p.dirX, ay = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.y : p.dirY, am = Math.hypot(ax, ay) || 1;
      ax /= am, ay /= am;
      let best = null, bestScore = -1 / 0;
      for (let t of team.players) {
        if (t === p) continue;
        let dx2 = t.x - p.x, dy2 = t.y - p.y, d3 = Math.hypot(dx2, dy2);
        if (d3 < 3 || d3 > reach) continue;
        let align = dx2 / d3 * ax + dy2 / d3 * ay, forward = (t.x - p.x) * team.dir / 40, score = align * 2.6 - d3 / 45 + forward * (through ? 1.2 : 0.5) + (t.role === "GK" ? -2.5 : 0);
        score > bestScore && (bestScore = score, best = t);
      }
      if (this.cue("pass"), !best) {
        let punt = (16 + power * 22) * this.preset.passSpeed;
        this.release(p, ax * punt, ay * punt);
        return;
      }
      let tx = best.x, ty = best.y;
      through && (tx += team.dir * 9, ty += best.vy * 0.4);
      let dx = tx - p.x, dy = ty - p.y, d2 = Math.hypot(dx, dy) || 1, err = (100 - p.ref.stats.passing) / 100 * (0.13 + power * 0.1) * (this.weakFoot(p) ? 1.55 : 1) * (2 - this.formOf(p)) * (Math.random() - 0.5) * 2, c = Math.cos(err), s = Math.sin(err), nx = (dx * c - dy * s) / d2, ny = (dx * s + dy * c) / d2, speed = clamp2((d2 * 1.35 + 9) * (0.8 + power * 0.6) * this.preset.passSpeed, 14, 48);
      if (lob) {
        let T = clamp2(d2 / 17, 0.7, 1.7);
        this.cue("lob", p), this.release(p, nx * (d2 / T), ny * (d2 / T), 0.5 * GRAV * T), this.ball.noTouch = 0.3;
        return;
      }
      this.release(p, nx * speed, ny * speed);
    }
    /**
     * @param {object} opts
     *   loft  multiplier on how much the strike lifts (0 = drilled along the floor)
     *   curl  bend the flight sideways; sign picked from aim, or inward towards goal
     *   placed  a header or a set piece — no weak-foot penalty, because the ball
     *           is not at anyone's feet when it is struck
     */
    shoot(p, aim, power, opts = {}) {
      let { loft = 1, curl = 0, placed = !1 } = opts, team = this.teams[p.team], dx = (team.dir > 0 ? PITCH.w : 0) - p.x, dy = CY + (aim && Math.abs(aim.y) > 0.2 ? aim.y * GOAL_HALF * 0.9 : 0) - p.y, d2 = Math.hypot(dx, dy) || 1, acc = p.ref.stats.shooting / 100, weak = !placed && this.weakFoot(p), spread = ((1.05 - acc) * 0.3 + d2 / 230 + (1 - power) * 0.06) * (weak ? 1.5 : 1) * (2 - this.formOf(p));
      {
        let angle = Math.atan2(GOAL_HALF * 2 * Math.abs(dx), d2 * d2 - GOAL_HALF * GOAL_HALF) || 0.01, foe = this.nearestTo(1 - p.team, p), close = foe && dist(p, foe) < 2 ? 0.66 : 1, xg = clamp2(0.92 * Math.exp(-d2 / 11) * Math.min(1, angle / 0.9) * close, 0.02, 0.8);
        team.xg = (team.xg || 0) + xg, xg >= 0.25 && (team.bigChances = (team.bigChances || 0) + 1, this.cue("bigChance", p));
      }
      let err = (Math.random() - 0.5) * 2 * spread, c = Math.cos(err), s = Math.sin(err), nx = (dx * c - dy * s) / d2, ny = (dx * s + dy * c) / d2;
      this.cue("shot", power);
      let speed = (21 + power * 17 + acc * 6) * (weak ? 0.93 : 1), rise = (0.9 + power * 6.4) * loft + (curl ? 2.4 : 0);
      if (this.release(p, nx * speed, ny * speed, rise), curl) {
        let sign = aim && Math.abs(aim.y) > 0.2 ? -Math.sign(aim.y) : Math.sign(CY - p.y) || 1;
        this.ball.curl = sign * curl * (0.55 + acc * 0.6);
      }
      this.ball.shotBy = p, team.shots++;
    }
    /**
     * One tackle, not two.
     *
     * This used to be a standing challenge and a separate slide, distinguished by
     * a boolean nobody could actually feel the difference of — same button-press
     * shape, similar range, and a foul chance that was just a flat coin flip
     * decoupled from how the tackle was actually made. There is one challenge now,
     * and it always commits: a lunge towards the ball, the way a slide always
     * looked.
     *
     * The foul risk is what replaces the old two-tackle split, and it is tied to
     * something real: `d`, how far away the ball was when you committed. A dive
     * thrown in from point-blank range is a fair, well-timed challenge that
     * either wins the ball or simply loses the duel — that is not a foul, that is
     * defending. A dive launched from near the edge of your reach is a lunge at
     * something you were not actually going to reach in time, which is what a
     * mistimed tackle *is* in real football — arriving late. `frac` stands in for
     * that lateness, and both the foul chance and the recovery cost scale off it,
     * so a reckless committal costs you twice: the whistle, and the time spent
     * picking yourself up.
     */
    tackle(p) {
      let b = this.ball, owner = b.owner, REACH = 3.1;
      if (p.slide = 0.42, p.vx = p.dirX * p.maxSpeed * 1.7, p.vy = p.dirY * p.maxSpeed * 1.7, !owner || owner.team === p.team) return;
      if (owner.role === "GK") {
        p.stumble = 0.35;
        return;
      }
      if (owner.skillT > 0) {
        p.stumble = 0.6, this.cue("skill", owner);
        return;
      }
      let d2 = dist(p, owner);
      if (d2 > REACH) return;
      let frac = d2 / REACH, win = (p.ref.stats.defending + 16) / (p.ref.stats.defending + owner.ref.stats.dribbling + 16) * this.preset.tackle;
      if (Math.random() < win)
        b.owner = p, b.lastTouch = p, owner.touchLock = 0.55, owner.stumble = 0.35;
      else {
        p.stumble = 0.45 + frac * 0.7;
        let chance = 0.21 * frac * frac;
        Math.random() < chance && (this.fouls[p.team] += 1, this.cue("foul", p), !owner.injured && Math.random() < 0.125 && this.injure(owner), this.inPenaltyArea(owner, p.team) ? this.awardPenalty(1 - p.team, p) : this.awardFreeKick(1 - p.team, owner, p));
      }
    }
    /** A player is hurt: he stays on, diminished, until someone takes him off. */
    injure(p) {
      p.injured = !0, p.maxSpeed *= 0.62, p.stumble = Math.max(p.stumble, 0.9), this.injuries.push({ team: p.team, name: p.ref.name, id: p.ref.id, minute: this.minute() }), this.cue("injury", p);
    }
    /** The CPU brings an injured man off at the next dead ball, if it can. */
    autoSubInjured(teamIdx) {
      let team = this.teams[teamIdx];
      if (team.isHuman || team.subsLeft <= 0) return;
      let i = team.players.findIndex((q) => q.injured && q.role !== "GK");
      if (i < 0) return;
      let bench = team.bench.map((r, j) => [r, j]).filter(([r]) => r && r.position !== "GK").sort((a, b) => b[0].overall - a[0].overall);
      if (!bench.length) return;
      let p = team.players[i];
      this.substitute(teamIdx, i, bench[0][1]) && (p.injured = !1, this.cue("sub", p));
    }
    /** A feint: a burst sideways that a lunging tackler cannot follow. Costs legs. */
    skillMove(p, aim) {
      if (p.skillT > 0 || p.stumble > 0 || p.stamina < 0.15) return;
      let side = aim && Math.abs(aim.x * p.dirY - aim.y * p.dirX) > 0.2 ? Math.sign(aim.x * p.dirY - aim.y * p.dirX) : Math.random() < 0.5 ? -1 : 1, skill = p.ref.stats.dribbling / 100;
      p.skillT = 0.28 + skill * 0.2, p.vx += p.dirY * side * (4.5 + skill * 3) + p.dirX * 1.5, p.vy += -p.dirX * side * (4.5 + skill * 3) + p.dirY * 1.5, p.stamina = Math.max(0, p.stamina - 0.04), this.cue("skill", p);
    }
    /* -------------------------- free kicks & throw-ins ------------------- *
     * Fouls used to exist only inside the box, because there was nowhere else
     * for one to go. Now a foul anywhere is a free kick with a wall, and every
     * ball over the line is a throw-in taken by a person if a person is
     * playing. Both share the same waiting mechanism as corners and penalties:
     * `phaseT` is the AI's delay, or the person's time limit.                 */
    awardFreeKick(attacking, at, offender) {
      let atk = this.teams[attacking], def = this.teams[1 - attacking], goalX = atk.dir > 0 ? PITCH.w : 0, b = this.ball;
      Object.assign(b, { x: clamp2(at.x, 2, PITCH.w - 2), y: clamp2(at.y, 2, PITCH.h - 2), z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null, inNet: null, curl: 0, shotBy: null });
      let toGoal = Math.hypot(goalX - b.x, CY - b.y), shootingRange = toGoal < 32, taker = atk.players.filter((q) => q.role !== "GK").sort((x, y) => shootingRange ? y.ref.stats.shooting - x.ref.stats.shooting : dist(x, b) - dist(y, b))[0];
      taker.x = b.x - atk.dir * 2.6, taker.y = b.y + (b.y < CY ? -0.8 : 0.8), taker.vx = taker.vy = 0, taker.touchLock = 0, offender && (offender.stumble = Math.max(offender.stumble, 0.6));
      let wallN = toGoal < 24 ? 4 : shootingRange ? 3 : 0, wx = goalX - b.x, wy = CY - b.y, wd = Math.hypot(wx, wy) || 1;
      def.players.filter((q) => q.role !== "GK").sort((x, y) => y.ref.stats.physical - x.ref.stats.physical).forEach((q, i) => {
        if (q.vx = q.vy = 0, q.touchLock = 0.5, i < wallN) {
          let across = (i - (wallN - 1) / 2) * 1.1;
          q.x = clamp2(b.x + wx / wd * 9.15 + -wy / wd * across, 1, PITCH.w - 1), q.y = clamp2(b.y + wy / wd * 9.15 + wx / wd * across, 1, PITCH.h - 1);
        } else if (dist(q, b) < 9.15) {
          let ax = q.x - b.x, ay = q.y - b.y, ad = Math.hypot(ax, ay) || 1;
          q.x = clamp2(b.x + ax / ad * 9.5, 1, PITCH.w - 1), q.y = clamp2(b.y + ay / ad * 9.5, 1, PITCH.h - 1);
        }
      });
      let gk = def.players.find((q) => q.role === "GK");
      gk && (gk.x = goalX - atk.dir * 1.2, gk.y = CY + (b.y - CY) * 0.15, gk.vx = gk.vy = 0), toGoal < 40 && atk.players.filter((q) => q !== taker && q.role !== "GK").sort((x, y) => y.ref.stats.physical + y.ref.overall - (x.ref.stats.physical + x.ref.overall)).slice(0, 3).forEach((q, i) => {
        q.vx = q.vy = 0, q.x = clamp2(goalX - atk.dir * (8 + i * 2.5), 2, PITCH.w - 2), q.y = clamp2(CY + (i - 1) * 4.5, 2, PITCH.h - 2);
      }), this.cue("whistle", 1), this.cue("freekick", { team: attacking, dist: Math.round(toGoal) }), this.phase = "freekick", this.banner = "FREE KICK", this.setPiece = this.beginSetPiece("freekick", attacking, taker, shootingRange ? 1.9 : 1.2), this.markStoppage("freekick");
    }
    /** The AI's free kick: shoot over the wall in range, otherwise deliver or play short. */
    takeFreeKick() {
      let sp = this.setPiece;
      if (this.setPiece = null, this.phase = "play", this.banner = "", !sp) return;
      let p = sp.taker, atk = this.teams[p.team], goalX = atk.dir > 0 ? PITCH.w : 0, toGoal = Math.hypot(goalX - p.x, CY - p.y);
      if (this.ball.owner = p, p.touchLock = 0, toGoal < 30 && Math.abs(this.ball.y - CY) < 22) {
        let side = Math.random() < 0.5 ? -1 : 1;
        this.shoot(p, { x: atk.dir, y: side * 0.7 }, 0.78 + Math.random() * 0.2, { loft: 1.5, curl: 30, placed: !0 });
      } else toGoal < 44 ? this.cross(p, null) : this.pass(p, { x: atk.dir, y: (Math.random() - 0.5) * 0.8 }, !1, 0.5);
    }
    startThrowIn(side, x, y) {
      let b = this.ball, team = this.teams[side];
      b.x = clamp2(x, 1, PITCH.w - 1), b.y = y < CY ? 0.3 : PITCH.h - 0.3, b.z = 0, b.vx = b.vy = b.vz = 0, b.owner = null, b.lastTouch = null, b.curl = 0, b.shotBy = null;
      let thrower = this.nearestTo(side, b, !0);
      thrower && (thrower.x = b.x, thrower.y = y < CY ? 0.4 : PITCH.h - 0.4, thrower.vx = thrower.vy = 0, thrower.touchLock = 0, team.players.filter((q) => q !== thrower && q.role !== "GK").sort((a, z) => dist(a, b) - dist(z, b)).slice(0, 2).forEach((q, i) => {
        q.x = clamp2(b.x + team.dir * (i ? -6 : 7), 2, PITCH.w - 2), q.y = clamp2(b.y + (y < CY ? 1 : -1) * (5 + i * 4), 2, PITCH.h - 2), q.vx = q.vy = 0;
      }), this.cue("throwin", side), this.phase = "throwin", this.banner = "", this.setPiece = this.beginSetPiece("throwin", side, thrower, 0.9));
    }
    takeThrowIn() {
      let sp = this.setPiece;
      if (this.setPiece = null, this.phase = "play", this.banner = "", !sp) return;
      let p = sp.taker;
      this.ball.owner = p, p.touchLock = 0, this.pass(p, { x: this.teams[p.team].dir, y: (CY - p.y) / PITCH.h }, !1, 0.3), this.ball.vz = 3.2, this.ball.z = 1.6;
    }
    /**
     * Common set-piece bookkeeping. A person taking it gets a generous window
     * (the AI timer becomes a deadline) and the play screen shows the taker UI;
     * the CPU takes it when the short timer expires.
     */
    beginSetPiece(kind, team, taker, aiDelay) {
      let human = this.controllers.some((c) => c.team === team);
      if (this.phaseT = human ? kind === "throwin" ? 6 : 9 : aiDelay, human) {
        let c = this.controllers.find((k) => k.team === team);
        c && (c.activeIdx = this.teams[team].players.indexOf(taker));
      }
      return { kind, team, taker, human, aim: { x: this.teams[team].dir, y: 0 }, charge: 0, action: null };
    }
    /**
     * Read a person's stick and buttons during a set piece. Returns true while
     * the phase should keep waiting (the take happens here, on release).
     */
    readSetPieceInput(c, input, dt) {
      let sp = this.setPiece, raw = input.axis(), B = this.basis, fwd = -raw.y;
      Math.hypot(raw.x, raw.y) > 0.2 && (sp.aim = B ? { x: B.rx * raw.x + B.fx * fwd, y: B.ry * raw.x + B.fy * fwd } : { x: raw.x, y: fwd });
      let kinds = sp.kind === "throwin" ? ["pass", "through"] : ["shoot", "pass", "cross", "through"];
      for (let a of kinds)
        if (input.held(a) && (sp.action = a, sp.charge = Math.min(1, sp.charge + dt / 0.8)), input.released(a))
          return this.takeSetPiece(a, sp.aim, Math.max(0.3, sp.charge)), !0;
      return this.charge = sp.charge, !0;
    }
    /** A person takes the dead ball. Also what the watch and tests call. */
    takeSetPiece(action, aim, power = 0.6) {
      let sp = this.setPiece;
      if (!sp) return !1;
      let p = sp.taker, team = this.teams[p.team], goalX = team.dir > 0 ? PITCH.w : 0;
      this.setPiece = null, this.phase = "play", this.banner = "", this.ball.owner = p, p.touchLock = 0, this.charge = 0;
      let a = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim : { x: team.dir, y: 0 };
      if (sp.kind === "penalty")
        return this.shoot(p, { x: team.dir, y: clamp2(a.y * 1.4, -1, 1) }, clamp2(power, 0.45, 1), { loft: 0.16 + power * 0.5, placed: !0 }), this.penaltyTaker = null, !0;
      if (sp.kind === "throwin")
        return this.pass(p, a, action === "through", clamp2(power, 0.3, 0.7)), this.ball.vz = 3.2, this.ball.z = 1.6, !0;
      if (action === "shoot") {
        let toGoal = Math.hypot(goalX - p.x, CY - p.y);
        this.shoot(p, { x: team.dir, y: clamp2(a.y, -1, 1) }, power, { loft: toGoal < 30 ? 1.5 : 1, curl: 26, placed: !0 });
      } else action === "cross" ? this.cross(p, a) : this.pass(p, a, action === "through", power);
      return sp.kind === "corner" && (this.cornerTaker = null), !0;
    }
    /** Is `pt` inside the box that `defending` is protecting? */
    inPenaltyArea(pt, defending) {
      let goalX = this.teams[defending].dir > 0 ? 0 : PITCH.w;
      return Math.abs(pt.x - goalX) < BOX_W && Math.abs(pt.y - CY) < BOX_HALF;
    }
    /**
     * Set a penalty. Everyone but the taker and the keeper leaves the box, the
     * ball goes on the spot, and the taker is the best finisher on the pitch —
     * which is what a manager would do and saves inventing a taker order.
     */
    awardPenalty(attacking, conceded) {
      let atk = this.teams[attacking], goalX = atk.dir > 0 ? PITCH.w : 0, spotX = goalX + (atk.dir > 0 ? -11 : 11), b = this.ball;
      Object.assign(b, {
        x: spotX,
        y: CY,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        owner: null,
        lastTouch: null,
        inNet: null,
        curl: 0,
        shotBy: null
      });
      let taker = atk.players.filter((p) => p.role !== "GK").sort((x, y) => y.ref.stats.shooting - x.ref.stats.shooting)[0];
      taker.x = spotX - atk.dir * 2.2, taker.y = CY, taker.vx = taker.vy = 0, taker.touchLock = 0;
      let n = 0;
      for (let t of [0, 1])
        for (let p of this.teams[t].players) {
          if (p === taker) continue;
          if (p.role === "GK") {
            t === attacking ? (p.x = this.teams[t].dir > 0 ? 6 : PITCH.w - 6, p.y = CY) : (p.x = goalX + (atk.dir > 0 ? -0.7 : 0.7), p.y = CY), p.vx = p.vy = 0;
            continue;
          }
          let side = n % 2 ? 1 : -1;
          p.x = spotX - atk.dir * (7 + n % 3 * 2.2), p.y = clamp2(CY + side * (5 + n % 4 * 3.4), 3, PITCH.h - 3), p.vx = p.vy = 0, p.touchLock = 0.4, n += 1;
        }
      this.penaltyTaker = taker, this.conceded = conceded, this.phase = "penalty", this.banner = "PENALTY", this.setPiece = this.beginSetPiece("penalty", attacking, taker, 1.6), this.cue("penaltyAwarded", attacking), this.cue("whistle", 1), this.penalties = (this.penalties || 0) + 1;
    }
    /** Strike the penalty once the phase timer runs out. */
    takePenalty() {
      let p = this.penaltyTaker;
      if (this.setPiece = null, !p) {
        this.startPlay();
        return;
      }
      let goalX = this.teams[p.team].dir > 0 ? PITCH.w : 0;
      this.ball.owner = p, p.touchLock = 0;
      let side = Math.random() < 0.5 ? -1 : 1, spread = (100 - p.ref.stats.shooting) / 100, aimY = CY + side * (GOAL_HALF - 1.1) + (Math.random() - 0.5) * spread * 5.2;
      this.shoot(
        p,
        { x: goalX > PITCH.w / 2 ? 1 : -1, y: (aimY - CY) / 12 },
        0.72 + Math.random() * 0.22,
        { loft: 0.16, placed: !0 }
      ), this.penaltyTaker = null, this.phase = "play";
    }
    /* -------------------------------- AI ------------------------------- */
    nearestTo(side, pt, outfieldOnly = !1) {
      let best = null, bestD = 1 / 0;
      for (let p of this.teams[side].players) {
        if (outfieldOnly && p.role === "GK") continue;
        let d2 = dist(p, pt);
        d2 < bestD && (bestD = d2, best = p);
      }
      return best;
    }
    /** Second-closest outfielder — the extra presser when pressing is set high. */
    secondNearest(side, pt) {
      let first = this.nearestTo(side, pt, !0), best = null, bestD = 1 / 0;
      for (let p of this.teams[side].players) {
        if (p.role === "GK" || p === first) continue;
        let d2 = dist(p, pt);
        d2 < bestD && (bestD = d2, best = p);
      }
      return best;
    }
    shapeTarget(p) {
      let team = this.teams[p.team], b = this.ball, weHave = b.owner && b.owner.team === p.team, shift = (b.x - PITCH.w / 2) / (PITCH.w / 2) * team.dir * 13 * (weHave ? 1.3 : 0.85) * this.mentalityOf(p.team), drop = weHave ? 0 : TUNE.drop * (2 - this.mentalityOf(p.team)), squeeze = weHave ? 1 : TUNE.squeeze, x = clamp2(p.sx * PITCH.w + team.dir * (shift - drop), 3, PITCH.w - 3);
      return p.role === "DEF" && (x = this.holdLine(team, x)), {
        x,
        // shift harder towards the ball's side so the block visibly slides across
        y: clamp2(CY + (p.sy * PITCH.h - CY) * squeeze + (b.y - CY) * 0.42, 3, PITCH.h - 3)
      };
    }
    think(p, dt) {
      var _a;
      if (p.role === "GK") return this.thinkGK(p, dt);
      let b = this.ball, team = this.teams[p.team];
      if (b.owner === p) return this.thinkOnBall(p, dt);
      let weHave = b.owner && b.owner.team === p.team, press = this.pressingOf(p.team), isChaser = this.chasers[p.team] === p || ((_a = this.chasers2) == null ? void 0 : _a[p.team]) === p, target = this.shapeTarget(p), goalX = team.dir > 0 ? PITCH.w : 0;
      if (!weHave && (isChaser || !b.owner && dist(p, b) < 14 * press)) {
        this.moveTo(p, b.x + b.vx * 0.25, b.y + b.vy * 0.25, dt, 1.06), b.owner && b.owner.team !== p.team && dist(p, b.owner) < 2.4 && Math.random() < 1.1 * this.aiSkillFor(p.team) * press * dt && this.tackle(p);
        return;
      }
      p.runT = (p.runT || Math.random() * 4) + dt;
      let jitterX = Math.sin(p.runT * 0.62 + p.num * 1.3) * 3.2, jitterY = Math.sin(p.runT * 0.83 + p.num * 2.1) * 4.4;
      if (TUNE.counter && weHave && team.counterT > 0 && p.role !== "DEF") {
        let lane = clamp2(p.sy * PITCH.h + (p.num % 2 ? 6 : -6), 5, PITCH.h - 5);
        this.moveTo(p, clamp2(target.x + team.dir * 22, 4, PITCH.w - 4), lane, dt, 1.1);
        return;
      }
      if (TUNE.runs && weHave && p.role === "MID" && b.owner && b.owner !== p) {
        let finalThird = (b.x - PITCH.w / 2) * team.dir > 12;
        if (p.runClock = (p.runClock || 0) - dt, p.runClock <= 0 && finalThird && dist(p, b.owner) < 22 && Math.random() < 0.35 * dt && (p.runClock = 4 + Math.random() * 3, p.runUntil = 1.6, p.runY = clamp2(b.owner.y + (p.y > b.owner.y ? 9 : -9), 5, PITCH.h - 5)), p.runUntil > 0) {
          p.runUntil -= dt, this.moveTo(p, clamp2(b.owner.x + team.dir * 16, 4, PITCH.w - 4), p.runY, dt, 1.12);
          return;
        }
      }
      if (weHave && p.role === "FWD") {
        let burst = Math.sin(p.runT * 0.85 + p.num) > 0.2 ? 4 : 0;
        this.moveTo(
          p,
          clamp2(target.x + team.dir * (8 + burst), 4, PITCH.w - 4),
          clamp2(target.y + jitterY, 4, PITCH.h - 4),
          dt,
          0.95
        );
        return;
      }
      if (weHave && p.role === "DEF" && (p.sy < 0.3 || p.sy > 0.7) && Math.abs(b.y - p.y) < 26) {
        this.moveTo(
          p,
          clamp2(target.x + team.dir * 9, 4, PITCH.w - 4),
          clamp2(target.y, 3, PITCH.h - 3),
          dt,
          0.9
        );
        return;
      }
      if (!weHave && p.role === "DEF") {
        let gx = team.dir > 0 ? 0 : PITCH.w;
        if (Math.abs(b.x - gx) < 24) {
          let mark = this.markFor(p);
          if (mark) {
            let gs = Math.sign(gx - mark.x) || 1, tx = this.holdLine(team, mark.x + gs * 3.2), ty = mark.y + Math.sign(CY - mark.y) * 0.7;
            this.moveTo(p, clamp2(tx, 2, PITCH.w - 2), clamp2(ty, 2, PITCH.h - 2), dt, 1.02);
            return;
          }
          let tuck = CY + (target.y - CY) * 0.62;
          this.moveTo(p, this.holdLine(team, target.x), clamp2(tuck, 3, PITCH.h - 3), dt, 0.95);
          return;
        }
      }
      this.moveTo(
        p,
        clamp2(target.x + jitterX, 3, PITCH.w - 3),
        clamp2(target.y + jitterY, 3, PITCH.h - 3),
        dt,
        weHave ? 0.85 : 0.92
      );
    }
    /** Defenders never collapse onto their own keeper — hold a line off the goal. */
    holdLine(team, x) {
      let gx = team.dir > 0 ? 0 : PITCH.w, MIN = 7.5 * this.preset.discipline;
      return team.dir > 0 ? Math.max(x, gx + MIN) : Math.min(x, gx - MIN);
    }
    /**
     * Is this player about to strike the ball with his weaker foot?
     *
     * Read off where the ball actually is relative to which way he is facing,
     * rather than off the direction of the pass — so it changes shot to shot as
     * he shifts it, which is the point. A ball dead in front of him is neither
     * foot and never counts as weak.
     */
    weakFoot(p) {
      let b = this.ball, across = (b.x - p.x) * p.dirY + (b.y - p.y) * -p.dirX;
      return Math.abs(across) < 0.15 ? !1 : Math.sign(across) !== strongSide(p);
    }
    /** Nearest opponent no other defender has claimed this tick. */
    markFor(p) {
      let gx = this.teams[p.team].dir > 0 ? 0 : PITCH.w, reach = 18 * this.preset.discipline, best = null, bestD = 1 / 0;
      for (let f of this.teams[1 - p.team].players) {
        if (f.role === "GK" || Math.abs(f.x - gx) > 26 || f._markTick === this._tick && f._markedBy !== p) continue;
        let d2 = dist(p, f);
        d2 < bestD && d2 < reach && (bestD = d2, best = f);
      }
      return best && (best._markedBy = p, best._markTick = this._tick), best;
    }
    thinkOnBall(p, dt) {
      let team = this.teams[p.team], goalX = team.dir > 0 ? PITCH.w : 0, toGoal = Math.hypot(goalX - p.x, CY - p.y), foe = this.nearestTo(1 - p.team, p), pressure = foe ? dist(p, foe) : 99;
      if (toGoal < 24 && (pressure > 2.4 || toGoal < 13) && Math.random() < (1.7 - toGoal / 26) * this.aiSkillFor(p.team) * dt) {
        let far = toGoal > 17;
        this.shoot(p, null, 0.55 + Math.random() * 0.45, {
          loft: 0.32 + Math.random() * 0.3,
          curl: far && Math.random() < 0.3 ? 26 : 0
        });
        return;
      }
      let wide = p.y < 20 || p.y > PITCH.h - 20;
      if (wide && Math.abs(goalX - p.x) < 32 && Math.random() < 2.2 * this.aiSkillFor(p.team) * dt && team.players.some((t) => t !== p && t.role !== "GK" && Math.abs(t.x - goalX) < 22)) {
        this.cross(p, null);
        return;
      }
      if (TUNE.counter && team.counterT > 0 && toGoal > 26 && Math.random() < 2.4 * dt) {
        let runner = team.players.find((t) => t !== p && t.role !== "GK" && (t.x - p.x) * team.dir > 12 && dist(t, p) < 42);
        if (runner) {
          this.pass(p, { x: runner.x - p.x, y: runner.y - p.y }, !0, 0.7);
          return;
        }
      }
      if (pressure < 3.6 && Math.random() < 2.6 * dt) {
        this.pass(p, { x: team.dir, y: (Math.random() - 0.5) * 0.6 }, toGoal > 45, 0.75);
        return;
      }
      let tx = goalX, ty = wide && Math.abs(goalX - p.x) < 45 ? clamp2(p.y, 7, PITCH.h - 7) : CY + (p.y - CY) * 0.55;
      foe && pressure < 8 && (tx += (p.x - foe.x) * 0.5, ty += (p.y - foe.y) * 1.4), this.moveTo(p, clamp2(tx, 2, PITCH.w - 2), clamp2(ty, 3, PITCH.h - 3), dt, 1);
    }
    thinkGK(p, dt) {
      let team = this.teams[p.team], b = this.ball, goalX = team.dir > 0 ? 0 : PITCH.w, inward = team.dir > 0 ? 1 : -1;
      if (b.owner === p) {
        this.drive(p, inward, 0, dt, 0.3);
        return;
      }
      let loose = !b.owner && b.noTouch <= 0, dGoal = Math.hypot(b.x - goalX, b.y - CY);
      if (TUNE.sweeper && loose && dGoal < 26 && b.z < 0.9 && !(b.vx * inward < -6)) {
        let mine = this.nearestTo(p.team, b, !0);
        if (mine && dist(p, b) < dist(mine, b) - 1.5) {
          this.moveTo(p, b.x + b.vx * 0.15, b.y + b.vy * 0.15, dt, 1.12);
          return;
        }
      }
      if (loose && b.z > 1 && b.vz < 0 && dGoal < 9 && Math.abs(b.y - CY) < GOAL_HALF + 3) {
        let tAir = b.vz < -0.1 ? Math.max(0, b.z / -b.vz) : 0.5;
        this.moveTo(p, b.x + b.vx * tAir, b.y + b.vy * tAir, dt, 1.15);
        return;
      }
      let dx = b.x - goalX, dy = b.y - CY, d2 = Math.hypot(dx, dy) || 1, closing = b.vx * inward < -1, standOff = clamp2(d2 * 0.18, 1.6, 5.5), tx = goalX + inward * standOff, ty = CY + dy * (standOff / d2), urgency = 1.06;
      if (!b.owner && closing && d2 < 30) {
        p.readId !== b.shotId && (p.readId = b.shotId, p.readErr = (Math.random() - 0.5) * 2 * (1.34 - p.ref.overall / 100) * 6, p.reactT = 0.07 + (1.05 - p.ref.overall / 100) * 0.18), p.reactT = Math.max(0, (p.reactT || 0) - dt);
        let t = (tx - b.x) / b.vx;
        if (p.reactT <= 0 && t > 0 && t < 2.2) {
          let cross = b.y + b.vy * t + p.readErr;
          ty = cross, urgency = 1.12;
          let gap = cross - p.y;
          p.diveT <= 0 && t < 0.62 && Math.abs(gap) > 0.85 && Math.abs(gap) < 4.4 && (p.diveT = 0.75, p.diveDir = Math.sign(gap), p.diveHigh = b.z + b.vz * t > 1.15, p.vy = p.diveDir * (9.5 + p.ref.stats.defending * 0.035), p.vx = inward * -0.8);
        }
      } else d2 < 13 && b.owner && b.owner.team !== p.team && (tx = goalX + inward * clamp2(d2 * 0.34, 2, 5.5), ty = b.y, urgency = 1.1);
      if (p.diveT > 0) {
        p.diveT -= dt, p.vx *= 0.94, p.vy *= 0.965;
        return;
      }
      ty = clamp2(ty, CY - GOAL_HALF - 2.5, CY + GOAL_HALF + 2.5), tx = team.dir > 0 ? clamp2(tx, 1, BOX_W - 2) : clamp2(tx, PITCH.w - BOX_W + 2, PITCH.w - 1), this.moveTo(p, tx, ty, dt, urgency);
    }
    /**
     * Where a keeper steers a parry.
     *
     * Reflecting the shot puts the ball straight back out in front of goal,
     * which is exactly where the striker is standing — for a long time that was
     * the cheapest goal in this game. A keeper does not do that. He puts it round
     * the post, out for a throw, or wide of the box away from anyone in an
     * attacking shirt, and this picks whichever of a fan of angles is emptiest.
     *
     * Returns a unit vector in pitch space.
     */
    deflectionAim(gk) {
      let inward = this.teams[gk.team].dir > 0 ? 1 : -1, best = { x: inward, y: 0 }, bestScore = -1 / 0;
      for (let i = 0; i <= 10; i++) {
        let a = -1.35 + i / 10 * 2.7, dx = inward * Math.cos(a), dy = Math.sin(a), score = Math.abs(a) * 0.9;
        for (let team of this.teams)
          for (let q of team.players) {
            if (q === gk) continue;
            let rx = q.x - gk.x, ry = q.y - gk.y, along = rx * dx + ry * dy;
            if (along < 1 || along > 22) continue;
            let off = Math.abs(rx * dy - ry * dx), near = Math.max(0, 1 - off / 5);
            score += (q.team === gk.team ? 0.8 : -2.6) * near * (1 - along / 26);
          }
        score > bestScore && (bestScore = score, best = { x: dx, y: dy });
      }
      return best;
    }
    /**
     * Keeper contact. A tame shot is gathered; anything struck with real pace is
     * parried away — often wide, which is what turns into a corner.
     * @returns {boolean} true if the keeper kept hold of it
     */
    keeperContact(gk, speed) {
      let b = this.ball, inward = this.teams[gk.team].dir > 0 ? 1 : -1, hands = gk.ref.overall / 100 * this.preset.hands, holdable = 17 + hands * 13;
      if (speed < holdable && gk.diveT <= 0 && Math.random() < 0.55 + hands * 0.35)
        return this.cue("save"), !0;
      this.cue("save");
      let side = Math.sign(b.y - CY) || (Math.random() < 0.5 ? -1 : 1), out = speed * (0.34 + Math.random() * 0.2);
      if (Math.random() < 0.45)
        b.vx = -inward * (2 + Math.random() * 4), b.vy = side * out * 1.1, b.vz = 2 + Math.random() * 3;
      else {
        let wide = Math.random() < 0.62, raw = { x: inward * (wide ? 0.45 : 0.9), y: side * (wide ? 1.05 : 0.5) }, aim = this.deflectionAim(gk), w = clamp2(this.preset.deflect * (0.55 + hands * 0.5), 0, 1), dx = raw.x * (1 - w) + aim.x * w, dy = raw.y * (1 - w) + aim.y * w, m = Math.hypot(dx, dy) || 1;
        b.vx = dx / m * out, b.vy = dy / m * out, b.vz = 1.5 + Math.random() * 2.5;
      }
      return b.owner = null, b.lastTouch = gk, b.shotBy = null, b.noTouch = 0.18, gk.touchLock = 0.35, this.parries = (this.parries || 0) + 1, !1;
    }
  }, BOX = { w: BOX_W, half: BOX_HALF };

  // js/game/input.js
  var KEYSETS = {
    primary: {
      Space: "pass",
      KeyJ: "cross",
      KeyK: "shoot",
      KeyL: "through",
      KeyU: "lob",
      KeyH: "skill",
      KeyQ: "switch",
      KeyE: ["switch", "curl"],
      KeyI: "curl",
      ShiftLeft: "sprint",
      Escape: "pause",
      KeyP: "pause"
    },
    secondary: {
      Numpad1: "pass",
      Enter: "pass",
      Numpad2: "shoot",
      Numpad3: "cross",
      Numpad5: "through",
      Numpad6: "lob",
      Numpad4: "skill",
      Numpad0: ["switch", "curl"],
      NumpadDecimal: "curl",
      NumpadAdd: "sprint",
      ShiftRight: "sprint",
      Escape: "pause"
    }
  }, MOVE_SETS = {
    primary: {
      KeyW: [0, -1],
      KeyS: [0, 1],
      KeyA: [-1, 0],
      KeyD: [1, 0]
    },
    secondary: {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0]
    }
  }, PAD_ACTIONS = {
    0: "pass",
    1: "shoot",
    2: "cross",
    3: "through",
    4: "switch",
    5: ["switch", "curl"],
    6: "skill",
    7: "sprint",
    8: "lob",
    9: "pause"
  }, ACTIONS = ["pass", "shoot", "cross", "through", "lob", "skill", "switch", "curl", "sprint", "pause"], Input = class {
    /**
     * @param {{pad?: number|null, keys?: 'primary'|'secondary'}} opts
     *   pad  index to bind to, or null to grab the first connected one
     *   keys which keyboard set this seat uses, so two people can share one board
     */
    constructor(opts = {}) {
      var _a;
      this.padIndex = (_a = opts.pad) != null ? _a : null, this.keyMap = KEYSETS[opts.keys || "primary"], this.moveMap = MOVE_SETS[opts.keys || "primary"], this.keys = /* @__PURE__ */ new Set(), this.touchVec = { x: 0, y: 0 }, this.touchButtons = /* @__PURE__ */ new Set(), this.pad = null, this.padName = "", this.vec = { x: 0, y: 0 }, this.now = /* @__PURE__ */ new Set(), this.was = /* @__PURE__ */ new Set(), this.heldFor = Object.fromEntries(ACTIONS.map((a) => [a, 0])), this._down = (e) => {
        e.repeat || (this.keys.add(e.code), (this.keyMap[e.code] || this.moveMap[e.code]) && e.preventDefault());
      }, this._up = (e) => this.keys.delete(e.code), this._blur = () => this.keys.clear(), window.addEventListener("keydown", this._down), window.addEventListener("keyup", this._up), window.addEventListener("blur", this._blur);
    }
    destroy() {
      window.removeEventListener("keydown", this._down), window.removeEventListener("keyup", this._up), window.removeEventListener("blur", this._blur);
    }
    /** Call once per frame before reading anything. */
    poll(dt = 0) {
      var _a, _b, _c, _d, _e;
      let live2 = (navigator.getGamepads ? [...navigator.getGamepads()] : []).filter((g) => g && g.connected);
      this.pad = this.padIndex === null ? live2[0] || null : live2[this.padIndex] || null, this.padName = this.pad ? this.pad.id : "", this.was = this.now, this.now = /* @__PURE__ */ new Set();
      let x = 0, y = 0;
      for (let [code, v] of Object.entries(this.moveMap))
        this.keys.has(code) && (x += v[0], y += v[1]);
      if (this.pad) {
        let ax = this.pad.axes[0] || 0, ay = this.pad.axes[1] || 0;
        Math.hypot(ax, ay) > 0.22 && (x += ax, y += ay), (_a = this.pad.buttons[12]) != null && _a.pressed && (y -= 1), (_b = this.pad.buttons[13]) != null && _b.pressed && (y += 1), (_c = this.pad.buttons[14]) != null && _c.pressed && (x -= 1), (_d = this.pad.buttons[15]) != null && _d.pressed && (x += 1);
      }
      x += this.touchVec.x, y += this.touchVec.y;
      let mag = Math.hypot(x, y);
      this.vec = mag > 1 ? { x: x / mag, y: y / mag } : { x, y };
      let fire = (a) => {
        Array.isArray(a) ? a.forEach((x2) => this.now.add(x2)) : this.now.add(a);
      };
      for (let code of this.keys) {
        let a = this.keyMap[code];
        a && fire(a);
      }
      if (this.pad)
        for (let [i, a] of Object.entries(PAD_ACTIONS))
          (_e = this.pad.buttons[i]) != null && _e.pressed && fire(a);
      for (let a of this.touchButtons) this.now.add(a);
      for (let a of ACTIONS)
        this.heldFor[a] = this.now.has(a) ? this.heldFor[a] + dt : 0;
    }
    axis() {
      return this.vec;
    }
    moving() {
      return Math.hypot(this.vec.x, this.vec.y) > 0.14;
    }
    held(a) {
      return this.now.has(a);
    }
    pressed(a) {
      return this.now.has(a) && !this.was.has(a);
    }
    released(a) {
      return !this.now.has(a) && this.was.has(a);
    }
    /** How long an action was held before this frame released it. */
    heldTime(a) {
      return this.heldFor[a];
    }
    setTouchVec(x, y) {
      this.touchVec = { x, y };
    }
    setTouchButton(a, on) {
      on ? this.touchButtons.add(a) : this.touchButtons.delete(a);
    }
  };

  // js/kits.js
  var CVD = {
    deutan: [[0.367, 0.861, -0.228], [0.28, 0.673, 0.047], [-0.012, 0.043, 0.969]],
    protan: [[0.152, 1.053, -0.205], [0.115, 0.786, 0.099], [-4e-3, -0.048, 1.052]],
    tritan: [[1.256, -0.077, -0.179], [-0.078, 0.931, 0.147], [5e-3, 0.691, 0.304]]
  }, hexToRgb = (hex) => {
    let h = String(hex).replace("#", ""), n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }, clamp3 = (v) => Math.max(0, Math.min(255, v));
  function simulate(rgb2, type) {
    let m = CVD[type];
    return m ? m.map((row) => clamp3(row[0] * rgb2[0] + row[1] * rgb2[1] + row[2] * rgb2[2])) : rgb2;
  }
  function distance(a, b) {
    let rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
    return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
  }
  var luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  function clash(hexA, hexB, vision = "all") {
    let a = hexToRgb(hexA), b = hexToRgb(hexB), types = vision === "all" ? ["normal", "deutan", "protan", "tritan"] : [vision];
    for (let t of types) {
      let sa = t === "normal" ? a : simulate(a, t), sb = t === "normal" ? b : simulate(b, t);
      if (distance(sa, sb) < 150 && Math.abs(luma(sa) - luma(sb)) < 70) return !0;
    }
    return !1;
  }
  function pickAwayHex(homeHex, awayColors, vision = "normal") {
    let tryCols = [...awayColors || [], "#f2f4f8", "#1b1d24", "#ffd23f", "#00c2ff"];
    for (let c of tryCols) if (c && !clash(homeHex, c, vision)) return c;
    return "#f2f4f8";
  }

  // js/game/render3d.js
  var CY2 = PITCH.h / 2, GOAL_H = 2.44, NEAR = 0.6, MARGIN = 6, rgb = (hex) => {
    let n = parseInt(hex.replace("#", ""), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  };
  var shade = (c, k) => "rgb(".concat(Math.min(255, c[0] * k) | 0, ",").concat(Math.min(255, c[1] * k) | 0, ",").concat(Math.min(255, c[2] * k) | 0, ")"), darken = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  function kitColours(match) {
    let home = match.teams[0].colors[0], away = pickAwayHex(home, match.teams[1].colors, match.vision || "normal");
    return [home, away];
  }
  var SKINS = [[245, 208, 176], [226, 176, 133], [198, 137, 96], [150, 94, 60], [98, 62, 40]], HAIRS = [[28, 22, 20], [58, 38, 24], [122, 84, 42], [20, 18, 18], [90, 66, 44]], GK_KIT = "#c6f24a";
  function makeCamera() {
    return {
      x: PITCH.w / 2,
      y: -30,
      z: 17,
      tx: PITCH.w / 2,
      ty: CY2 * 0.82,
      tz: 0,
      hfov: 48
    };
  }
  function updateCamera(cam, match, dt) {
    let b = match.phase === "goal" && match.celebrant ? match.celebrant : match.ball, k = 1 - Math.exp(-dt * 2.8), wantX = Math.max(16, Math.min(PITCH.w - 16, b.x)), wantY = -30 + b.y * 0.3, wantLook = Math.max(10, Math.min(48, b.y * 0.82 + 7));
    cam.x += (wantX - cam.x) * k, cam.y += (wantY - cam.y) * k, cam.tx = cam.x, cam.ty += (wantLook - cam.ty) * k;
  }
  var SAFE = {
    x0: -3,
    x1: PITCH.w + 3,
    // between the two goal-end stands
    y1: PITCH.h + 3
    // in front of the far stand (near side is open)
  };
  function groundBasis(cam) {
    let fx = cam.tx - cam.x, fy = cam.ty - cam.y, l = Math.hypot(fx, fy) || 1;
    return fx /= l, fy /= l, { fx, fy, rx: fy, ry: -fx };
  }
  function setupView(cam, w, h) {
    let fx = cam.tx - cam.x, fy = cam.ty - cam.y, fz = cam.tz - cam.z, fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl, fy /= fl, fz /= fl;
    let rx = fy, ry = -fx, rl = Math.hypot(rx, ry) || 1;
    rx /= rl, ry /= rl;
    let ux = ry * fz, uy = -rx * fz, uz = rx * fy - ry * fx, fromW = w / 2 / Math.tan(cam.hfov * Math.PI / 360), fromH = h / 2 / Math.tan(48 * Math.PI / 360), f = Math.max(fromW, fromH);
    return { cam, fx, fy, fz, rx, ry, ux, uy, uz, f, cx: w / 2, cy: h / 2, w, h };
  }
  var tmp = { x: 0, y: 0, z: 0, s: 0 };
  function project(V, x, y, z, out) {
    let dx = x - V.cam.x, dy = y - V.cam.y, dz = z - V.cam.z, zc = dx * V.fx + dy * V.fy + dz * V.fz;
    if (zc < NEAR) return null;
    let s = V.f / zc;
    return out.x = V.cx + (dx * V.rx + dy * V.ry) * s, out.y = V.cy - (dx * V.ux + dy * V.uy + dz * V.uz) * s, out.z = zc, out.s = s, out;
  }
  var camBuf = Array.from({ length: 8 }, () => ({ xc: 0, yc: 0, zc: 0 })), clipBuf = Array.from({ length: 10 }, () => ({ xc: 0, yc: 0, zc: 0 }));
  function poly(ctx, V, co, fill) {
    let n = co.length / 3;
    for (let i = 0; i < n; i++) {
      let dx = co[i * 3] - V.cam.x, dy = co[i * 3 + 1] - V.cam.y, dz = co[i * 3 + 2] - V.cam.z, c = camBuf[i];
      c.xc = dx * V.rx + dy * V.ry, c.yc = dx * V.ux + dy * V.uy + dz * V.uz, c.zc = dx * V.fx + dy * V.fy + dz * V.fz;
    }
    let m = 0;
    for (let i = 0; i < n; i++) {
      let a = camBuf[i], b = camBuf[(i + 1) % n], ain = a.zc >= NEAR, bin = b.zc >= NEAR;
      if (ain) {
        let o = clipBuf[m++];
        o.xc = a.xc, o.yc = a.yc, o.zc = a.zc;
      }
      if (ain !== bin) {
        let t = (NEAR - a.zc) / (b.zc - a.zc), o = clipBuf[m++];
        o.xc = a.xc + (b.xc - a.xc) * t, o.yc = a.yc + (b.yc - a.yc) * t, o.zc = NEAR;
      }
    }
    if (!(m < 3)) {
      ctx.beginPath();
      for (let i = 0; i < m; i++) {
        let c = clipBuf[i], s = V.f / c.zc, sx = V.cx + c.xc * s, sy = V.cy - c.yc * s;
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.closePath(), ctx.fillStyle = fill, ctx.fill();
    }
  }
  function groundLine(ctx, V, x1, y1, x2, y2, width, fill) {
    let dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * (width / 2), ny = dx / l * (width / 2);
    poly(ctx, V, [
      x1 + nx,
      y1 + ny,
      0,
      x2 + nx,
      y2 + ny,
      0,
      x2 - nx,
      y2 - ny,
      0,
      x1 - nx,
      y1 - ny,
      0
    ], fill);
  }
  var LIGHT = (() => {
    let l = [-0.32, -0.55, 0.77], m = Math.hypot(...l);
    return [l[0] / m, l[1] / m, l[2] / m];
  })(), FACES = [
    { idx: [1, 5, 7, 3], n: "px" },
    { idx: [0, 2, 6, 4], n: "nx" },
    { idx: [2, 3, 7, 6], n: "py" },
    { idx: [0, 4, 5, 1], n: "ny" },
    { idx: [4, 6, 7, 5], n: "pz" }
  ], corner = Array.from({ length: 8 }, () => [0, 0, 0]), faceBuf = new Array(12);
  function box(ctx, V, cx, cy, cz, hx, hy, hz, cos, sin, col) {
    for (let i = 0; i < 8; i++) {
      let sx = i & 1 ? hx : -hx, sy = i & 2 ? hy : -hy, sz = i & 4 ? hz : -hz, c = corner[i];
      c[0] = cx + sx * cos - sy * sin, c[1] = cy + sx * sin + sy * cos, c[2] = cz + sz;
    }
    for (let face of FACES) {
      let nx = 0, ny = 0, nz = 0;
      face.n === "px" ? (nx = cos, ny = sin) : face.n === "nx" ? (nx = -cos, ny = -sin) : face.n === "py" ? (nx = -sin, ny = cos) : face.n === "ny" ? (nx = sin, ny = -cos) : nz = 1;
      let [i0, i1, i2, i3] = face.idx, mx = (corner[i0][0] + corner[i2][0]) / 2, my = (corner[i0][1] + corner[i2][1]) / 2, mz = (corner[i0][2] + corner[i2][2]) / 2;
      if ((V.cam.x - mx) * nx + (V.cam.y - my) * ny + (V.cam.z - mz) * nz <= 0) continue;
      let lambert = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2], k = 0.52 + 0.48 * Math.max(0, lambert), ids = face.idx;
      for (let v = 0; v < 4; v++) {
        let c = corner[ids[v]];
        faceBuf[v * 3] = c[0], faceBuf[v * 3 + 1] = c[1], faceBuf[v * 3 + 2] = c[2];
      }
      poly(ctx, V, faceBuf, shade(col, k));
    }
  }
  var ringA = [], ringB = [], limbBuf = new Array(12);
  function limb(ctx, V, ax, ay, az, bx, by, bz, rA, rB, col, sides = 6) {
    let dx = bx - ax, dy = by - ay, dz = bz - az, dl = Math.hypot(dx, dy, dz) || 1;
    dx /= dl, dy /= dl, dz /= dl;
    let refZ = Math.abs(dz) < 0.9, rx0 = refZ ? 0 : 1, ry0 = 0, rz0 = refZ ? 1 : 0, ux = dy * rz0 - dz * ry0, uy = dz * rx0 - dx * rz0, uz = dx * ry0 - dy * rx0, ul = Math.hypot(ux, uy, uz) || 1;
    ux /= ul, uy /= ul, uz /= ul;
    let vx = dy * uz - dz * uy, vy = dz * ux - dx * uz, vz = dx * uy - dy * ux;
    for (let i = 0; i < sides; i++) {
      let t = i / sides * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), nx = ux * c + vx * s, ny = uy * c + vy * s, nz = uz * c + vz * s;
      ringA[i] = [ax + nx * rA, ay + ny * rA, az + nz * rA, nx, ny, nz], ringB[i] = [bx + nx * rB, by + ny * rB, bz + nz * rB];
    }
    for (let i = 0; i < sides; i++) {
      let j = (i + 1) % sides, a0 = ringA[i], a1 = ringA[j], b0 = ringB[i], b1 = ringB[j], nx = (a0[3] + a1[3]) / 2, ny = (a0[4] + a1[4]) / 2, nz = (a0[5] + a1[5]) / 2, mx = (a0[0] + b1[0]) / 2, my = (a0[1] + b1[1]) / 2, mz = (a0[2] + b1[2]) / 2;
      if ((V.cam.x - mx) * nx + (V.cam.y - my) * ny + (V.cam.z - mz) * nz <= 0) continue;
      let k = 0.5 + 0.5 * Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      limbBuf[0] = a0[0], limbBuf[1] = a0[1], limbBuf[2] = a0[2], limbBuf[3] = a1[0], limbBuf[4] = a1[1], limbBuf[5] = a1[2], limbBuf[6] = b1[0], limbBuf[7] = b1[1], limbBuf[8] = b1[2], limbBuf[9] = b0[0], limbBuf[10] = b0[1], limbBuf[11] = b0[2], poly(ctx, V, limbBuf, shade(col, k));
    }
  }
  function sphere(ctx, V, x, y, z, r, col) {
    let c = project(V, x, y, z, tmp);
    if (!c) return;
    let rad = r * c.s;
    if (rad < 0.4) return;
    let g = ctx.createRadialGradient(
      c.x - rad * 0.35,
      c.y - rad * 0.4,
      rad * 0.1,
      c.x,
      c.y,
      rad
    );
    g.addColorStop(0, shade(col, 1.15)), g.addColorStop(1, shade(col, 0.62)), ctx.fillStyle = g, ctx.beginPath(), ctx.arc(c.x, c.y, rad, 0, 7), ctx.fill();
  }
  var STAND_FRONT_Z = 1.9, STAND_BACK_Z = 15, STAND_DEPTH = 22, ROOF_Z = 19.5, CROWD_COLS = [
    [206, 212, 224],
    [58, 66, 86],
    [150, 40, 52],
    [30, 40, 62],
    [214, 176, 92],
    [92, 104, 128],
    [176, 62, 88],
    [40, 82, 74],
    [232, 232, 236],
    [70, 54, 46]
  ];
  function mulberry(seed) {
    return () => {
      seed |= 0, seed = seed + 1831565813 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function buildCrowd() {
    let rand = mulberry(97531), rows = 13, fans = [], bank = (kind, from, to, step) => {
      for (let r = 0; r < rows; r++) {
        let t = r / (rows - 1), depth = MARGIN + t * STAND_DEPTH, z = STAND_FRONT_Z + t * (STAND_BACK_Z - STAND_FRONT_Z) + 0.35;
        for (let u = from; u < to; u += step) {
          if (rand() < 0.12) continue;
          let jitter = (rand() - 0.5) * step * 0.35, col = CROWD_COLS[rand() * CROWD_COLS.length | 0];
          fans.push({ kind, u: u + jitter, depth, z, col, s: 0.22 + rand() * 0.1 });
        }
      }
    };
    return bank("far", -22, PITCH.w + 22, 1.05), bank("left", -18, PITCH.h + 18, 1.05), bank("right", -18, PITCH.h + 18, 1.05), fans;
  }
  var CROWD = null;
  function fanPos(f) {
    return f.kind === "far" ? [f.u, PITCH.h + f.depth] : f.kind === "left" ? [-f.depth, f.u] : [PITCH.w + f.depth, f.u];
  }
  function drawStadium(ctx, V, quality) {
    CROWD || (CROWD = buildCrowd());
    let lowQ = quality === "low", banks = [
      { kind: "far", a: [-22, PITCH.h], b: [PITCH.w + 22, PITCH.h], n: [0, 1] },
      { kind: "left", a: [0, -18], b: [0, PITCH.h + 18], n: [-1, 0] },
      { kind: "right", a: [PITCH.w, PITCH.h + 18], b: [PITCH.w, -18], n: [1, 0] }
    ];
    for (let bk of banks) {
      let [nx, ny] = bk.n, f0 = [bk.a[0] + nx * MARGIN, bk.a[1] + ny * MARGIN], f1 = [bk.b[0] + nx * MARGIN, bk.b[1] + ny * MARGIN], bd = MARGIN + STAND_DEPTH, b0 = [bk.a[0] + nx * bd, bk.a[1] + ny * bd], b1 = [bk.b[0] + nx * bd, bk.b[1] + ny * bd];
      poly(ctx, V, [
        f0[0],
        f0[1],
        0,
        f1[0],
        f1[1],
        0,
        f1[0],
        f1[1],
        STAND_FRONT_Z,
        f0[0],
        f0[1],
        STAND_FRONT_Z
      ], "rgb(30,36,48)"), poly(ctx, V, [
        f0[0],
        f0[1],
        STAND_FRONT_Z,
        f1[0],
        f1[1],
        STAND_FRONT_Z,
        b1[0],
        b1[1],
        STAND_BACK_Z,
        b0[0],
        b0[1],
        STAND_BACK_Z
      ], "rgb(44,50,64)"), poly(ctx, V, [
        b0[0],
        b0[1],
        STAND_BACK_Z,
        b1[0],
        b1[1],
        STAND_BACK_Z,
        b1[0],
        b1[1],
        ROOF_Z,
        b0[0],
        b0[1],
        ROOF_Z
      ], "rgb(24,28,38)");
      let r0 = [b0[0] - nx * 9, b0[1] - ny * 9], r1 = [b1[0] - nx * 9, b1[1] - ny * 9];
      poly(ctx, V, [
        b0[0],
        b0[1],
        ROOF_Z,
        b1[0],
        b1[1],
        ROOF_Z,
        r1[0],
        r1[1],
        ROOF_Z - 1.2,
        r0[0],
        r0[1],
        ROOF_Z - 1.2
      ], "rgb(18,21,29)");
    }
    let skip = lowQ ? 3 : 1, cx = V.cam.x, cy = V.cam.y;
    for (let i = 0; i < CROWD.length; i += skip) {
      let f = CROWD[i], [px, py] = fanPos(f), dx = px - cx, dy = py - cy;
      if (dx * V.fx + dy * V.fy < -2) continue;
      if (lowQ) {
        let d2 = dx * dx + dy * dy;
        if (d2 > 9025 || d2 > 3600 && i & 1) continue;
      }
      let s = f.s;
      poly(ctx, V, [
        px - s,
        py,
        f.z - s,
        px + s,
        py,
        f.z - s,
        px + s,
        py,
        f.z + s,
        px - s,
        py,
        f.z + s
      ], shade(f.col, 0.85));
    }
  }
  var TURF_A = [46, 122, 62], TURF_B = [38, 104, 54], LINE = "rgba(255,255,255,.82)";
  function drawPitch(ctx, V, quality) {
    let stripes = quality === "low" ? 10 : 18, m = MARGIN;
    poly(ctx, V, [
      -m,
      -m,
      0,
      PITCH.w + m,
      -m,
      0,
      PITCH.w + m,
      PITCH.h + m,
      0,
      -m,
      PITCH.h + m,
      0
    ], "rgb(22,52,32)");
    let sw = PITCH.w / stripes;
    for (let i = 0; i < stripes; i++)
      poly(ctx, V, [
        i * sw,
        0,
        0,
        (i + 1) * sw,
        0,
        0,
        (i + 1) * sw,
        PITCH.h,
        0,
        i * sw,
        PITCH.h,
        0
      ], shade(i % 2 ? TURF_A : TURF_B, 1));
    let lw = 0.14;
    groundLine(ctx, V, 0, 0, PITCH.w, 0, lw, LINE), groundLine(ctx, V, 0, PITCH.h, PITCH.w, PITCH.h, lw, LINE), groundLine(ctx, V, 0, 0, 0, PITCH.h, lw, LINE), groundLine(ctx, V, PITCH.w, 0, PITCH.w, PITCH.h, lw, LINE), groundLine(ctx, V, PITCH.w / 2, 0, PITCH.w / 2, PITCH.h, lw, LINE);
    let segs = quality === "low" ? 20 : 40;
    for (let i = 0; i < segs; i++) {
      let a0 = i / segs * Math.PI * 2, a1 = (i + 1) / segs * Math.PI * 2;
      groundLine(
        ctx,
        V,
        PITCH.w / 2 + Math.cos(a0) * 9.15,
        CY2 + Math.sin(a0) * 9.15,
        PITCH.w / 2 + Math.cos(a1) * 9.15,
        CY2 + Math.sin(a1) * 9.15,
        lw,
        LINE
      );
    }
    for (let side of [0, 1]) {
      let gx = side === 0 ? 0 : PITCH.w, inw = side === 0 ? 1 : -1, bx = gx + inw * BOX.w;
      groundLine(ctx, V, gx, CY2 - BOX.half, bx, CY2 - BOX.half, lw, LINE), groundLine(ctx, V, gx, CY2 + BOX.half, bx, CY2 + BOX.half, lw, LINE), groundLine(ctx, V, bx, CY2 - BOX.half, bx, CY2 + BOX.half, lw, LINE);
      let sx = gx + inw * 5.5;
      groundLine(ctx, V, gx, CY2 - 9.16, sx, CY2 - 9.16, lw, LINE), groundLine(ctx, V, gx, CY2 + 9.16, sx, CY2 + 9.16, lw, LINE), groundLine(ctx, V, sx, CY2 - 9.16, sx, CY2 + 9.16, lw, LINE);
    }
  }
  function drawGoals(ctx, V, quality) {
    let post = [242, 244, 250];
    for (let side of [0, 1]) {
      let gx = side === 0 ? 0 : PITCH.w, inw = side === 0 ? -1 : 1;
      if (box(ctx, V, gx, CY2 - GOAL_HALF, GOAL_H / 2, 0.09, 0.09, GOAL_H / 2, 1, 0, post), box(ctx, V, gx, CY2 + GOAL_HALF, GOAL_H / 2, 0.09, 0.09, GOAL_H / 2, 1, 0, post), box(ctx, V, gx, CY2, GOAL_H, 0.09, GOAL_HALF, 0.09, 1, 0, post), quality === "low") continue;
      let back = gx + inw * 1.9;
      poly(ctx, V, [
        back,
        CY2 - GOAL_HALF,
        0,
        back,
        CY2 + GOAL_HALF,
        0,
        back,
        CY2 + GOAL_HALF,
        GOAL_H * 0.86,
        back,
        CY2 - GOAL_HALF,
        GOAL_H * 0.86
      ], "rgba(226,236,250,.16)"), poly(ctx, V, [
        gx,
        CY2 - GOAL_HALF,
        GOAL_H,
        back,
        CY2 - GOAL_HALF,
        GOAL_H * 0.86,
        back,
        CY2 - GOAL_HALF,
        0,
        gx,
        CY2 - GOAL_HALF,
        0
      ], "rgba(226,236,250,.11)"), poly(ctx, V, [
        gx,
        CY2 + GOAL_HALF,
        GOAL_H,
        back,
        CY2 + GOAL_HALF,
        GOAL_H * 0.86,
        back,
        CY2 + GOAL_HALF,
        0,
        gx,
        CY2 + GOAL_HALF,
        0
      ], "rgba(226,236,250,.11)");
    }
  }
  function playerLook(p, kitRgb, shortsRgb) {
    if (!p._look) {
      let h = 0;
      for (let ch of p.ref.id) h = h * 31 + ch.charCodeAt(0) | 0;
      h = Math.abs(h), p._look = { skin: SKINS[h % SKINS.length], hair: HAIRS[(h >> 3) % HAIRS.length] };
    }
    return {
      skin: p._look.skin,
      hair: p._look.hair,
      kit: kitRgb,
      shorts: shortsRgb,
      sock: darken(kitRgb, 0.8)
    };
  }
  var BOOT = [26, 26, 32], HIP_Z = 0.92, SHOULDER_Z = 1.44, THIGH = 0.44, SHIN = 0.44, UPPER_ARM = 0.29, FOREARM = 0.27;
  function drawPlayerHi(ctx, V, p, look, phase, sides = 6) {
    let fine = sides > 4, cos = p.dirX, sin = p.dirY, sp = Math.hypot(p.vx, p.vy), gait = Math.min(1, sp / 6.5), lean = Math.min(0.12, sp / 70), wx = (f, l) => p.x + f * cos - l * sin, wy = (f, l) => p.y + f * sin + l * cos, legSwing = 0.62 * gait, armSwing = 0.5 * gait, leg = (side, ph) => {
      let s = Math.sin(ph), hipA = s * legSwing, kneeA = hipA - (Math.max(0, -s) * 1.15 + 0.12) * gait - 0.08, lat = side * 0.11, hipF = lean, kneeF = hipF + Math.sin(hipA) * THIGH, kneeZ = HIP_Z - Math.cos(hipA) * THIGH, ankF = kneeF + Math.sin(kneeA) * SHIN, ankZ = Math.max(0.07, kneeZ - Math.cos(kneeA) * SHIN);
      limb(
        ctx,
        V,
        wx(hipF, lat),
        wy(hipF, lat),
        HIP_Z,
        wx(kneeF, lat),
        wy(kneeF, lat),
        kneeZ,
        0.105,
        0.075,
        look.skin,
        sides
      ), limb(
        ctx,
        V,
        wx(kneeF, lat),
        wy(kneeF, lat),
        kneeZ,
        wx(ankF, lat),
        wy(ankF, lat),
        ankZ,
        0.075,
        0.055,
        look.sock,
        sides
      ), fine && limb(
        ctx,
        V,
        wx(ankF, lat),
        wy(ankF, lat),
        ankZ,
        wx(ankF + 0.17, lat),
        wy(ankF + 0.17, lat),
        0.035,
        0.055,
        0.05,
        BOOT,
        4
      );
    }, arm = (side, ph) => {
      let shA = Math.sin(ph) * armSwing, elA = shA + 0.75 * gait + 0.25, lat = side * 0.2, shF = lean * 0.5, elF = shF + Math.sin(shA) * UPPER_ARM, elZ = SHOULDER_Z - Math.cos(shA) * UPPER_ARM, haF = elF + Math.sin(elA) * FOREARM, haZ = elZ - Math.cos(elA) * FOREARM, latOut = side * 0.235;
      limb(
        ctx,
        V,
        wx(shF, lat),
        wy(shF, lat),
        SHOULDER_Z,
        wx(elF, latOut),
        wy(elF, latOut),
        elZ,
        0.075,
        0.055,
        look.kit,
        sides
      ), limb(
        ctx,
        V,
        wx(elF, latOut),
        wy(elF, latOut),
        elZ,
        wx(haF, latOut),
        wy(haF, latOut),
        haZ,
        0.052,
        0.042,
        look.skin,
        sides
      ), fine && sphere(ctx, V, wx(haF, latOut), wy(haF, latOut), haZ - 0.03, 0.055, look.skin);
    };
    leg(-1, phase + Math.PI), arm(1, phase + Math.PI), leg(1, phase), limb(
      ctx,
      V,
      wx(lean, 0),
      wy(lean, 0),
      HIP_Z - 0.06,
      wx(lean, 0),
      wy(lean, 0),
      HIP_Z + 0.26,
      0.19,
      0.17,
      look.shorts,
      sides
    ), limb(
      ctx,
      V,
      wx(lean, 0),
      wy(lean, 0),
      HIP_Z + 0.2,
      wx(lean * 1.6, 0),
      wy(lean * 1.6, 0),
      SHOULDER_Z + 0.05,
      0.16,
      0.215,
      look.kit,
      sides
    ), arm(-1, phase), limb(
      ctx,
      V,
      wx(lean * 1.6, 0),
      wy(lean * 1.6, 0),
      SHOULDER_Z,
      wx(lean * 1.6, 0),
      wy(lean * 1.6, 0),
      SHOULDER_Z + 0.17,
      0.06,
      0.055,
      look.skin,
      4
    );
    let hz = SHOULDER_Z + 0.29;
    sphere(ctx, V, wx(lean * 1.6, 0), wy(lean * 1.6, 0), hz, 0.115, look.skin), fine && sphere(ctx, V, wx(lean * 1.6 - 0.03, 0), wy(lean * 1.6 - 0.03, 0), hz + 0.045, 0.105, look.hair);
  }
  function drawPlayerLo(ctx, V, p, look, phase) {
    drawPlayerHi(ctx, V, p, look, phase, 4);
  }
  function shadowAt(ctx, V, x, y, r) {
    let c = project(V, x + 0.25, y + 0.2, 0, tmp);
    if (!c) return;
    let rx = r * c.s;
    rx > 400 || (ctx.fillStyle = "rgba(0,0,0,.32)", ctx.beginPath(), ctx.ellipse(c.x, c.y, rx, rx * 0.42, 0, 0, 7), ctx.fill());
  }
  function draw(ctx, match, cam, w, h, quality, dt, opts = {}) {
    let V = setupView(cam, w, h), sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#080c16"), sky.addColorStop(1, "#0e1a20"), ctx.fillStyle = sky, ctx.fillRect(0, 0, w, h), drawStadium(ctx, V, quality), drawPitch(ctx, V, quality), drawGoals(ctx, V, quality);
    let kits = kitColours(match).map(rgb), shorts = kits.map((c) => darken(c, 0.62)), gk = rgb(GK_KIT), gkShorts = darken(gk, 0.6), active = match.active, b = match.ball, items = [];
    for (let t = 0; t < 2; t++)
      for (let p of match.teams[t].players) {
        let sc = project(V, p.x, p.y, 0.9, tmp);
        sc && (sc.x < -160 || sc.x > w + 160 || sc.y < -220 || sc.y > h + 260 || items.push({ kind: "p", p, team: t, depth: sc.z }));
      }
    let bs = project(V, b.x, b.y, b.z || 0, tmp);
    bs && items.push({ kind: "b", depth: bs.z }), items.sort((a, z) => z.depth - a.depth);
    for (let it of items)
      it.kind === "p" ? shadowAt(ctx, V, it.p.x, it.p.y, 0.46) : shadowAt(ctx, V, b.x, b.y, 0.3);
    for (let it of items) {
      if (it.kind === "b") {
        drawBall(ctx, V, b);
        continue;
      }
      let p = it.p, isGK = p.role === "GK", look = playerLook(p, isGK ? gk : kits[it.team], isGK ? gkShorts : shorts[it.team]);
      p._phase = (p._phase || 0) + Math.hypot(p.vx, p.vy) * dt * 2.4, quality === "low" ? drawPlayerLo(ctx, V, p, look, p._phase) : drawPlayerHi(ctx, V, p, look, p._phase), p === active && drawMarker(ctx, V, p, match.teams[it.team].colors[0]);
    }
    match.phase !== "play" && match.banner && !opts.hideBanner && drawBanner(ctx, match, w, h, kits);
  }
  function drawBall(ctx, V, b) {
    let c = project(V, b.x, b.y, (b.z || 0) + 0.16, tmp);
    if (!c) return;
    let r = Math.max(1.6, Math.min(80, 0.19 * c.s)), g = ctx.createRadialGradient(c.x - r * 0.35, c.y - r * 0.4, r * 0.15, c.x, c.y, r);
    g.addColorStop(0, "#ffffff"), g.addColorStop(1, "#b9c4d2"), ctx.fillStyle = g, ctx.beginPath(), ctx.arc(c.x, c.y, r, 0, 7), ctx.fill();
  }
  function drawMarker(ctx, V, p, colour) {
    let c = project(V, p.x, p.y, 2.42, tmp);
    if (!c) return;
    let s = Math.max(4, Math.min(60, 0.34 * c.s));
    ctx.fillStyle = colour, ctx.strokeStyle = "rgba(0,0,0,.45)", ctx.lineWidth = 1, ctx.beginPath(), ctx.moveTo(c.x, c.y + s), ctx.lineTo(c.x - s * 0.9, c.y - s * 0.5), ctx.lineTo(c.x + s * 0.9, c.y - s * 0.5), ctx.closePath(), ctx.fill(), ctx.stroke();
  }
  function drawBanner(ctx, match, w, h, kits) {
    let isGoal = match.banner === "GOAL";
    ctx.fillStyle = "rgba(4,8,16,.5)", ctx.fillRect(0, 0, w, h), ctx.textAlign = "center", ctx.textBaseline = "middle";
    let goalKit = kits[match.goalTeam];
    ctx.fillStyle = isGoal && goalKit ? shade(goalKit, 1.25) : "#fff", ctx.font = "800 ".concat(Math.round(Math.min(w * 0.11, 96)), 'px "Bahnschrift", system-ui, sans-serif'), ctx.fillText(match.banner, w / 2, h / 2);
  }

  // js/data/commentary.js
  var L = {
    kickoff: [
      "And we are under way.",
      "{team} get us started.",
      "The referee blows and the ball is rolling.",
      "Here we go — {team} kick off.",
      "First touch of the match. Let us see what we have got.",
      "The whistle goes. Ninety minutes of this, condensed.",
      "Away we go at {venue}."
    ],
    secondHalf: [
      "Second half. {score} the score, everything still to play for.",
      "Back out for the second half.",
      "We go again. {team} restart it.",
      "Second period under way, {score}.",
      "The sides swap ends and we restart, still {score}."
    ],
    pass: [],
    // too frequent to voice
    shot: [
      "{player} has a go!",
      "Struck by {player}…",
      "{player} pulls the trigger!",
      "Shot! {player}!",
      "{player} lets fly from {dist} metres.",
      "Hit early by {player}.",
      "{player} shapes to shoot — and does.",
      "A sight of goal for {player}.",
      "{player} tries his luck.",
      "Effort from {player}!"
    ],
    shotWide: [
      "Wide. {player} will want that one back.",
      "Off target from {player}.",
      "Dragged wide by {player}.",
      "Over the bar. {player} leans back and it climbs.",
      "Not far away from {player}, but away it goes.",
      "{player} skews it wide of the far post.",
      "It flashes across the face of goal and out.",
      "Into the stand. {player} knew as he hit it.",
      "A yard wide. {player} holds his head.",
      "High and wide from {player}."
    ],
    save: [
      "Saved! {keeper} gets down well.",
      "Good hands from {keeper}.",
      "{keeper} turns it away!",
      "Kept out by {keeper}.",
      "What a stop from {keeper}!",
      "{keeper} palms it clear.",
      "Strong save. {keeper} was equal to it.",
      "{keeper} stands tall and blocks it.",
      "Tipped over by {keeper}!",
      "{keeper} gathers at the second attempt.",
      "The keeper reads it. {keeper} makes it look routine.",
      "Fingertips from {keeper} — that was going in."
    ],
    post: [
      "Off the post!",
      "The woodwork! {team} so close.",
      "Crossbar! It rattles the frame.",
      "Against the upright and away.",
      "Inches. The post saves {opp}.",
      "The bar shakes and {team} cannot believe it."
    ],
    goal: [
      "GOAL! {player} for {team}!",
      "{player} scores! {score}!",
      "It is in! {player} makes it {score}.",
      "GOAL {team}! {player} finishes it.",
      "{player}! What a finish! {score}.",
      "That is a goal. {player}, {minute} minutes, {score}.",
      "In the net! {player} sends the {team} end wild.",
      "{player} buries it. {score}.",
      "Composed by {player}. {team} lead.",
      "The keeper had no chance. {player}, {score}.",
      "{player}! {team} have their goal.",
      "Clinical. {player} does not miss those."
    ],
    ownGoal: ["Own goal! That is unfortunate. {score}.", "It goes in off a defender. {score}.", "A dreadful deflection and it is {score}."],
    cross: [
      "Whipped in…",
      "{player} delivers.",
      "A cross from the right.",
      "Into the box from {player}.",
      "Floated towards the far post.",
      "{player} swings it in.",
      "Driven low across the six-yard box."
    ],
    header: ["A header!", "Met with the head!", "Up goes the header.", "Powered towards goal with the head!"],
    bigChance: [
      "Big chance here!",
      "This is a real opportunity for {team}.",
      "{player} is through!",
      "One on one!",
      "He has to score here.",
      "A gilt-edged chance for {player}.",
      "Open goal, almost.",
      "The keeper is exposed."
    ],
    cornerKick: [
      "Corner to {team}.",
      "{team} win a corner.",
      "A corner. Bodies into the box.",
      "Set piece for {team} — a corner.",
      "The flag goes up for a corner.",
      "{team} will take this from the left.",
      "Another corner for {team}."
    ],
    freekick: [
      "Free kick to {team}, {dist} metres out.",
      "Foul. {team} have a free kick.",
      "A free kick in a dangerous area for {team}.",
      "The referee awards the free kick.",
      "{team} with a set piece {dist} metres from goal.",
      "A wall is being built.",
      "The ball is placed. {team} to take.",
      "This is shooting range.",
      "Free kick. Cross or shot from here."
    ],
    penaltyAwarded: [
      "PENALTY! The referee points to the spot.",
      "Penalty to {team}!",
      "He gives it. A penalty for {team}.",
      "Brought down in the box — penalty!",
      "The referee has no doubt. Penalty.",
      "Spot kick for {team}."
    ],
    throwin: ["Throw-in, {team}.", "Out for a throw.", "{team} throw.", "A throw-in near the halfway line.", "Long throw coming?"],
    foul: [
      "Foul by {player}.",
      "That is a foul. {player} was late.",
      "{player} goes through the back of him.",
      "A cynical one from {player}.",
      "The referee blows. {player} in the book?",
      "Late, from {player}.",
      "Free kick for that. {player} penalised.",
      "A clumsy challenge from {player}.",
      "{player} catches him. No arguments."
    ],
    injury: [
      "{player} is down, and he is not getting up quickly.",
      "That looks like a problem for {player}.",
      "The physio is on for {player}.",
      "{player} is struggling. He may not last.",
      "A worry for {team} — {player} is hurt.",
      "{player} limps back into position."
    ],
    sub: [
      "A change for {team}: {player} comes off.",
      "Substitution. {player} makes way.",
      "{team} bring on fresh legs for {player}.",
      "{player} is replaced.",
      "The board goes up: {player} off."
    ],
    counter: [
      "And {team} break!",
      "A counter-attack on!",
      "{team} are away — space to run into.",
      "Turnover, and {team} go quickly.",
      "They have won it and they are off.",
      "{team} pour forward.",
      "Numbers up for {team} on the break."
    ],
    skill: ["Lovely feet from {player}.", "A step-over and he is away.", "Sold him! {player} dances past.", "Quick feet by {player}.", "{player} shifts it and goes."],
    lob: ["A chip over the top from {player}.", "Lifted over the line by {player}.", "Dinked forward.", "{player} floats one in behind."],
    tackle: ["Won cleanly.", "A good challenge.", "Strong in the tackle.", "Dispossessed.", "He wins it back."],
    halftime: [
      "Half time. {score}.",
      "The whistle goes for the interval, {score}.",
      "That is the first half done. {score}.",
      "Half time, and {team} will be the happier side.",
      "Forty-five minutes gone: {score}."
    ],
    fulltime: [
      "Full time! {score}.",
      "That is it. It finishes {score}.",
      "The final whistle. {score}.",
      "All over. {team} take it, {score}.",
      "The referee ends it at {score}.",
      "Done. {score} the final score."
    ],
    clock: [
      "{minute} minutes played.",
      "We are {minute} minutes in, {score}.",
      "Coming up to {minute} minutes.",
      "{minute} gone. {score}.",
      "A quarter of the way in, {score}.",
      "Ten to go. {score}.",
      "Into the last five, {score}.",
      "{minute} minutes and {team} are on top."
    ],
    possession: [
      "{team} are seeing a lot of the ball.",
      "{team} dominating possession.",
      "Patient from {team} — keeping it.",
      "{team} have had {poss}% of the ball.",
      "It is all {team} at the moment.",
      "{team} are passing it around nicely."
    ],
    momentum: [
      "{team} have their tails up.",
      "The pressure is building on {opp}.",
      "{team} are turning the screw.",
      "This is {team}'s spell.",
      "{opp} cannot get out of their half.",
      "Wave after wave from {team}."
    ],
    weather: ["Perfect conditions for football.", "The floodlights are on and the surface looks quick.", "A good crowd in tonight."],
    penaltyScored: ["Coolly taken. {player} scores from the spot.", "Penalty converted by {player}.", "{player} sends the keeper the wrong way."],
    penaltyMissed: ["Saved! {keeper} keeps the penalty out!", "He has missed it! {player} puts the penalty wide.", "Off the post from the spot!"],
    keeperClaim: ["Claimed by {keeper}.", "{keeper} comes and takes it.", "Safe hands. {keeper} gathers."],
    late: ["Time is running out for {opp}.", "Into the closing stages, {score}.", "{team} looking to see this out.", "Stoppage time approaches."],
    comeback: ["{team} are level! {score}.", "Back in it! {score}.", "The comeback is on for {team}."],
    lead: ["{team} edge ahead, {score}.", "{team} take the lead.", "Advantage {team}: {score}."],
    extend: ["{team} extend their lead, {score}.", "Two clear now for {team}.", "That should settle it. {score}."]
  };
  var LINE_COUNT = Object.values(L).reduce((n, a) => n + a.length, 0), last = /* @__PURE__ */ new Map();
  function say(key, ctx = {}) {
    let pool = L[key];
    if (!pool || !pool.length) return "";
    let i = Math.floor(Math.random() * pool.length);
    return pool.length > 1 && i === last.get(key) && (i = (i + 1) % pool.length), last.set(key, i), pool[i].replace(/\{(\w+)\}/g, (_, k) => {
      var _a;
      return (_a = ctx[k]) != null ? _a : "";
    });
  }

  // js/watch/match.js
  var HOME_ID = WORLD.clubs[0].id, DURATION = 60, LEVELS = {
    easy: { label: "Easy", skill: 0.72, pay: 0.7 },
    normal: { label: "Normal", skill: 1, pay: 1 },
    hard: { label: "Hard", skill: 1.3, pay: 2 }
  };
  function playMatch(app2, awayId, onDone, level2 = "normal") {
    let lv = LEVELS[level2] || LEVELS.normal;
    app2.innerHTML = '\n    <div class="w-match">\n      <canvas id="wPitch"></canvas>\n      <div class="w-hud"><span id="wClock">0\'</span><b id="wScore">0 – 0</b></div>\n      <div class="w-comm" id="wComm" hidden></div>\n      <div class="w-sp" id="wSp" hidden></div>\n      <button class="w-kick" id="wKick">KICK</button>\n    </div>';
    let canvas = app2.querySelector("#wPitch"), ctx = canvas.getContext("2d", { alpha: !1 }), clockEl = app2.querySelector("#wClock"), scoreEl = app2.querySelector("#wScore"), commEl = app2.querySelector("#wComm"), spEl = app2.querySelector("#wSp"), commT = 0, lastComm = -9, WATCH_CUES = { goal: "goal", save: "save", post: "post", bigChance: "bigChance", cornerKick: "cornerKick", freekick: "freekick", penaltyAwarded: "penaltyAwarded", injury: "injury", shotWide: "shotWide" }, commentate = (c) => {
      var _a, _b, _c, _d, _e;
      let key = WATCH_CUES[c.name];
      if (!key || c.name !== "goal" && match.t - lastComm < 2) return;
      lastComm = match.t;
      let t = typeof c.arg == "number" ? c.arg : (_c = (_a = c.arg) == null ? void 0 : _a.team) != null ? _c : (_b = c.arg) != null && _b.ref ? c.arg.team : 0, team = match.teams[t] || match.teams[0], gk = match.teams[1 - (team.side || 0)].players.find((q) => q.role === "GK"), line = say(key, {
        player: (_d = c.arg) != null && _d.ref ? c.arg.ref.short : team.short,
        team: team.short,
        opp: match.teams[1 - team.side].short,
        score: "".concat(match.teams[0].score, "–").concat(match.teams[1].score),
        minute: match.minute(),
        dist: ((_e = c.arg) == null ? void 0 : _e.dist) || "",
        keeper: gk ? gk.ref.short : "the keeper"
      });
      line && (commEl.textContent = line, commEl.hidden = !1, commT = 3);
    }, match = new Match(HOME_ID, awayId, { duration: DURATION, mode: "single", human: 0, preset: "authentic", skill: lv.skill }), input = new Input({ keys: "primary" }), cam = makeCamera(), tighten = () => {
      let b = match.ball;
      cam.x = Math.max(12, Math.min(PITCH.w - 12, b.x)), cam.y = b.y - 21, cam.z = 11.5, cam.tx = cam.x, cam.ty = b.y + 3, cam.hfov = 33;
    };
    tighten(), match.basis = groundBasis(cam);
    let fit = () => {
      let r = window.devicePixelRatio || 1, w = canvas.clientWidth || app2.clientWidth, h = canvas.clientHeight || app2.clientHeight;
      return canvas.width = Math.round(w * r), canvas.height = Math.round(h * r), ctx.setTransform(r, 0, 0, r, 0, 0), { w, h };
    }, size = fit(), onResize = () => {
      size = fit();
    };
    window.addEventListener("resize", onResize);
    let dragId = null, origin = { x: 0, y: 0 }, R = 26;
    canvas.addEventListener("pointerdown", (e) => {
      var _a;
      dragId = e.pointerId, origin = { x: e.clientX, y: e.clientY }, (_a = canvas.setPointerCapture) == null || _a.call(canvas, e.pointerId), e.preventDefault();
    }), canvas.addEventListener("pointermove", (e) => {
      if (e.pointerId !== dragId) return;
      let dx = Math.max(-1, Math.min(1, (e.clientX - origin.x) / R)), dy = Math.max(-1, Math.min(1, (e.clientY - origin.y) / R));
      input.setTouchVec(dx, dy);
    });
    let release = (e) => {
      e.pointerId === dragId && (dragId = null, input.setTouchVec(0, 0));
    };
    canvas.addEventListener("pointerup", release), canvas.addEventListener("pointercancel", release);
    let kick = app2.querySelector("#wKick"), shootingRange = () => {
      let me = match.active;
      if (!me) return !1;
      let goalX = match.teams[0].dir > 0 ? PITCH.w : 0;
      return Math.abs(me.x - goalX) < 30;
    };
    kick.addEventListener("pointerdown", (e) => {
      var _a;
      e.preventDefault(), (_a = navigator.vibrate) == null || _a.call(navigator, 6);
      let sp = match.setPiece;
      if (sp && sp.human && sp.team === 0) {
        let a = Math.hypot(input.axis().x, input.axis().y) > 0.2 ? { x: input.axis().x, y: -input.axis().y } : { x: 1, y: 0 }, goalX = PITCH.w, near = Math.abs(sp.taker.x - goalX) < 30, act2 = sp.kind === "penalty" || sp.kind === "freekick" && near ? "shoot" : sp.kind === "corner" ? "cross" : "pass";
        match.takeSetPiece(act2, a, 0.7);
        return;
      }
      let act = shootingRange() ? "shoot" : "pass";
      input.setTouchButton(act, !0), kick.dataset.act = act, input.setTouchButton("sprint", !0);
    });
    let kickUp = () => {
      input.setTouchButton("shoot", !1), input.setTouchButton("pass", !1), input.setTouchButton("sprint", !1);
    };
    kick.addEventListener("pointerup", kickUp), kick.addEventListener("pointercancel", kickUp), kick.addEventListener("pointerleave", kickUp);
    let raf = null, last2 = performance.now(), ended = !1, lastScore = "0 – 0", frame = (now) => {
      var _a;
      let dt = Math.min(0.05, (now - last2) / 1e3);
      if (last2 = now, input.poll(dt), !ended) {
        for (match.update(dt, [input]), updateCamera(cam, match, dt), tighten(), match.basis = groundBasis(cam); match.cues.length; ) {
          let c = match.cues.shift();
          c.name === "goal" && ((_a = navigator.vibrate) == null || _a.call(navigator, [16, 40, 24])), commentate(c);
        }
        commT > 0 && (commT -= dt, commT <= 0 && (commEl.hidden = !0));
        let sp = match.setPiece;
        if (sp && sp.human && sp.team === 0) {
          let what = sp.kind === "penalty" ? "PENALTY · KICK to shoot" : sp.kind === "corner" ? "CORNER · KICK to cross" : sp.kind === "throwin" ? "THROW · KICK to throw" : "FREE KICK · KICK to take";
          spEl.textContent = "".concat(what, " · ").concat(Math.ceil(match.phaseT)), spEl.hidden = !1;
        } else spEl.hidden = !0;
        match.phase === "end" && (ended = !0, finish());
      }
      draw(ctx, match, cam, size.w, size.h, "low", dt, { hideBanner: !1 }), clockEl.textContent = "".concat(match.minute(), "'");
      let sc = "".concat(match.teams[0].score, " – ").concat(match.teams[1].score);
      sc !== lastScore && (lastScore = sc, scoreEl.textContent = sc), raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    function finish() {
      var _a;
      let [h, a] = match.teams, won = h.score > a.score, reward = Math.round((200 + h.score * 60 + (won ? 150 : 0)) * lv.pay);
      (_a = navigator.vibrate) == null || _a.call(navigator, won ? [20, 60, 30] : 14);
      let panel = document.createElement("div");
      panel.className = "w-end", panel.innerHTML = '\n      <div>\n        <p class="w-title">'.concat(won ? "Win" : h.score === a.score ? "Draw" : "Loss", '</p>\n        <div class="w-big">').concat(h.score, " – ").concat(a.score, '</div>\n        <p class="w-sub">+◈ ').concat(reward.toLocaleString(), '</p>\n        <button class="w-btn" id="wBack">Done</button>\n      </div>'), app2.querySelector(".w-match").appendChild(panel), panel.querySelector("#wBack").addEventListener("click", () => {
        var _a2;
        cancelAnimationFrame(raf), window.removeEventListener("resize", onResize), (_a2 = input.destroy) == null || _a2.call(input), onDone(reward, { goals: h.score, won, level: level2 });
      });
    }
  }

  // js/watch/pens.js
  var buzz = (p) => {
    var _a;
    try {
      (_a = navigator.vibrate) == null || _a.call(navigator, p);
    } catch {
    }
  };
  function playPens(app2, opts, onDone) {
    let { oppShort, onEvent = () => {
    } } = opts, you = [], them = [], round = 0, phase = "shoot", raf = null, markerX = 0, dir = 1, speed = 0.9, live2 = !0;
    app2.innerHTML = '\n    <div class="w-pens">\n      <div class="w-pens-top">\n        <div class="w-pens-side"><span>YOU</span><div class="w-dots" id="wYou"></div></div>\n        <div class="w-pens-side"><span>'.concat(oppShort, '</span><div class="w-dots" id="wThem"></div></div>\n      </div>\n      <div class="w-goal" id="wGoal">\n        <div class="w-net"></div>\n        <div class="w-keeper" id="wKeeper">▲</div>\n        <div class="w-marker" id="wMarker"></div>\n        <div class="w-ball" id="wBall" hidden>●</div>\n      </div>\n      <p class="w-pens-msg" id="wMsg">Tap to shoot</p>\n      <div class="w-dive" id="wDive" hidden>\n        <button class="w-btn ghost" data-dive="0">◀</button>\n        <button class="w-btn ghost" data-dive="1">▲</button>\n        <button class="w-btn ghost" data-dive="2">▶</button>\n      </div>\n    </div>');
    let $ = (s) => app2.querySelector(s), goal = $("#wGoal"), marker = $("#wMarker"), keeper = $("#wKeeper"), ball = $("#wBall"), msg = $("#wMsg"), dive = $("#wDive"), paintDots = () => {
      let dots = (arr) => {
        let n = Math.max(5, arr.length);
        return Array.from({ length: n }, (_, i) => '<i class="'.concat(i < arr.length ? arr[i] ? "g" : "m" : "", '"></i>')).join("");
      };
      $("#wYou").innerHTML = dots(you), $("#wThem").innerHTML = dots(them);
    };
    paintDots();
    let third = (x) => x < 0.33 ? 0 : x > 0.67 ? 2 : 1, place = (el, x) => {
      el.style.left = "".concat(8 + x * 84, "%");
    };
    place(keeper, 0.5);
    let last2 = performance.now(), sweep = (now) => {
      let dt = Math.min(0.05, (now - last2) / 1e3);
      last2 = now, phase === "shoot" && live2 && (markerX += dir * speed * 2 * dt, markerX >= 1 && (markerX = 1, dir = -1), markerX <= 0 && (markerX = 0, dir = 1), place(marker, markerX)), raf = requestAnimationFrame(sweep);
    };
    raf = requestAnimationFrame(sweep);
    let decided = () => {
      let y = you.filter(Boolean).length, t = them.filter(Boolean).length, yLeft = Math.max(0, 5 - you.length), tLeft = Math.max(0, 5 - them.length);
      return you.length < 5 || them.length < 5 ? y > t + tLeft || t > y + yLeft : you.length === them.length && y !== t ? !0 : you.length >= 8 && them.length >= 8;
    }, shootAt = (x) => {
      if (phase !== "shoot" || !live2) return;
      live2 = !1;
      let aim = third(x), guess = Math.random() < 0.55 ? aim : Math.floor(Math.random() * 3);
      place(keeper, guess === 0 ? 0.12 : guess === 2 ? 0.88 : 0.5), place(ball, x), ball.hidden = !1;
      let corner2 = x < 0.2 || x > 0.8, pGoal = guess === aim ? corner2 ? 0.5 : aim === 1 ? 0.22 : 0.3 : corner2 ? 0.94 : 0.8, scored = Math.random() < pGoal;
      setTimeout(() => {
        you.push(scored), paintDots(), scored ? (onEvent("pengoal"), buzz([14, 40, 22]), msg.textContent = "GOAL") : (buzz(30), msg.textContent = "Saved"), round += 1, speed = Math.min(2.4, 0.9 + round * 0.22), setTimeout(next, 700);
      }, 260);
    };
    goal.addEventListener("pointerdown", (e) => {
      e.preventDefault(), shootAt(markerX);
    });
    let diveTo = (side) => {
      if (phase !== "dive" || !live2) return;
      live2 = !1;
      let aim = Math.random() < 0.7 ? Math.floor(Math.random() * 3) : 1;
      place(keeper, side === 0 ? 0.12 : side === 2 ? 0.88 : 0.5), place(ball, aim === 0 ? 0.1 : aim === 2 ? 0.9 : 0.5), ball.hidden = !1;
      let saved = side === aim ? Math.random() < 0.72 : Math.random() < 0.08;
      setTimeout(() => {
        them.push(!saved), paintDots(), saved ? (onEvent("pensave"), buzz([10, 30, 10, 30, 20]), msg.textContent = "SAVED!") : (buzz(12), msg.textContent = "They score"), setTimeout(next, 700);
      }, 260);
    };
    dive.querySelectorAll("[data-dive]").forEach((b) => b.addEventListener("click", () => diveTo(+b.dataset.dive)));
    function next() {
      if (ball.hidden = !0, place(keeper, 0.5), decided()) {
        finish();
        return;
      }
      phase === "shoot" ? (phase = "dive", dive.hidden = !1, marker.hidden = !0, msg.textContent = "Pick a side") : (phase = "shoot", dive.hidden = !0, marker.hidden = !1, msg.textContent = "Tap to shoot"), live2 = !0;
    }
    function finish() {
      cancelAnimationFrame(raf);
      let y = you.filter(Boolean).length, t = them.filter(Boolean).length, won = y > t;
      won && onEvent("penwin");
      let reward = y * 120 + (won ? 300 : 0);
      buzz(won ? [20, 60, 30] : 14);
      let panel = document.createElement("div");
      panel.className = "w-end", panel.innerHTML = '\n      <div>\n        <p class="w-title">'.concat(won ? "Shootout won" : "Shootout lost", '</p>\n        <div class="w-big">').concat(y, " – ").concat(t, '</div>\n        <p class="w-sub">+◈ ').concat(reward.toLocaleString(), '</p>\n        <button class="w-btn" id="wBack">Done</button>\n      </div>'), app2.querySelector(".w-pens").appendChild(panel), panel.querySelector("#wBack").addEventListener("click", () => onDone(reward));
    }
  }

  // js/watch/daily.js
  var KEY = "apexxi.watch.daily.v1", POOL = [
    { id: "play1", ev: "match", n: 1, text: "Play a match", pay: 250 },
    { id: "play2", ev: "match", n: 2, text: "Play 2 matches", pay: 450 },
    { id: "goal2", ev: "goal", n: 2, text: "Score 2 goals", pay: 400 },
    { id: "goal4", ev: "goal", n: 4, text: "Score 4 goals", pay: 700 },
    { id: "win1", ev: "win", n: 1, text: "Win a match", pay: 500 },
    { id: "pack1", ev: "pack", n: 1, text: "Open a pack", pay: 250 },
    { id: "pack2", ev: "pack", n: 2, text: "Open 2 packs", pay: 450 },
    { id: "pen3", ev: "pengoal", n: 3, text: "Score 3 penalties", pay: 350 },
    { id: "penw", ev: "penwin", n: 1, text: "Win a shootout", pay: 500 },
    { id: "save1", ev: "pensave", n: 1, text: "Save a penalty", pay: 300 },
    { id: "hard1", ev: "hardwin", n: 1, text: "Win on Hard", pay: 900 },
    { id: "gold1", ev: "goldcard", n: 1, text: "Pull a gold card", pay: 400 }
  ], today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10), d = null, read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  }, write = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {
    }
  };
  function pickFor(date) {
    let h = 0;
    for (let ch of date) h = h * 31 + ch.charCodeAt(0) >>> 0;
    let list = POOL.slice(), out = [];
    for (; out.length < 3 && list.length; ) {
      h = h * 1103515245 + 12345 >>> 0;
      let i = h % list.length, o = list.splice(i, 1)[0];
      out.some((x) => x.ev === o.ev) || out.push(o.id);
    }
    return out;
  }
  function tick() {
    d = d || read() || { date: "", streak: 0, ids: [], prog: {}, done: [], bonus: 0 };
    let t = today();
    return d.date === t ? !1 : (d.streak = d.date === yesterday() ? d.streak + 1 : 1, d.date = t, d.ids = pickFor(t), d.prog = {}, d.done = [], d.bonus = 100 * Math.min(7, d.streak), write(), !0);
  }
  var streak = () => (tick(), d.streak);
  function claimBonus() {
    tick();
    let b = d.bonus || 0;
    return d.bonus = 0, write(), b;
  }
  function objectives() {
    return tick(), d.ids.map((id) => {
      let o = POOL.find((x) => x.id === id), have = Math.min(o.n, d.prog[o.ev] || 0);
      return { ...o, have, done: d.done.includes(id), complete: have >= o.n };
    });
  }
  function event(ev, n = 1) {
    tick(), d.prog[ev] = (d.prog[ev] || 0) + n;
    let pay = 0;
    for (let id of d.ids) {
      let o = POOL.find((x) => x.id === id);
      o.ev !== ev || d.done.includes(id) || (d.prog[ev] || 0) < o.n || (d.done.push(id), pay += o.pay);
    }
    return write(), pay;
  }

  // js/data/liveDefault.js
  var LIVE_DEFAULT = {
    version: 1,
    season: {
      id: "s1",
      name: "Season 1 · Kick-Off",
      from: "2026-09-14",
      to: "2026-10-25"
      // tiers: optional override of data/season.js DEFAULT_TIERS
    },
    events: [
      {
        id: "falcons",
        name: "Green Falcons Week",
        blurb: "The Saudi national side takes over the store. Falcons Packs pull only Saudi internationals; the featured card is the captain.",
        theme: "#006c35",
        pack: {
          id: "ev-falcons",
          name: "Falcons Pack",
          cost: 6e3,
          size: 4,
          floor: "silver",
          odds: { bronze: 0.2, silver: 0.45, gold: 0.3, special: 0.05 },
          filter: { nations: ["Saudi Arabia"] },
          note: "4 · Saudi only",
          promise: "Saudi internationals only"
        },
        featured: { player: "Salem Al-Dawsari", boost: 4, chance: 0.12 },
        objectives: [
          { id: "ev-falcons-1", metric: "eventPack", need: 1, text: "Open a Falcons Pack", apex: 1500, xp: 120 },
          { id: "ev-falcons-2", metric: "win", need: 3, text: "Win 3 matches this week", apex: 2500, xp: 200 },
          { id: "ev-falcons-3", metric: "goal", need: 8, text: "Score 8 goals this week", apex: 2e3, xp: 160 }
        ]
      },
      {
        id: "meridian",
        name: "Meridian Rising",
        blurb: "The new league’s best in one pack. Meridian Packs draw only from the ten new clubs.",
        theme: "#00b4d8",
        pack: {
          id: "ev-meridian",
          name: "Meridian Pack",
          cost: 5500,
          size: 4,
          floor: "silver",
          odds: { bronze: 0.2, silver: 0.45, gold: 0.32, special: 0.03 },
          filter: { leagues: ["Meridian League"] },
          note: "4 · Meridian League",
          promise: "Meridian League only"
        },
        featured: { player: "Nico Williams", boost: 3, chance: 0.1 },
        objectives: [
          { id: "ev-meridian-1", metric: "eventPack", need: 2, text: "Open 2 Meridian Packs", apex: 2e3, xp: 160 },
          { id: "ev-meridian-2", metric: "clean", need: 2, text: "Keep 2 clean sheets", apex: 2500, xp: 200 },
          { id: "ev-meridian-3", metric: "played", need: 6, text: "Play 6 matches this week", apex: 1500, xp: 120 }
        ]
      },
      {
        id: "keepers",
        name: "Wall Week",
        blurb: "Goalkeepers and defenders, 80 and up. Build the back line you never pull.",
        theme: "#f4c95d",
        pack: {
          id: "ev-wall",
          name: "Wall Pack",
          cost: 7e3,
          size: 3,
          floor: "gold",
          odds: { bronze: 0, silver: 0.2, gold: 0.7, special: 0.1 },
          filter: { positions: ["GK", "CB", "LB", "RB"], minOverall: 80 },
          note: "3 · defenders 80+",
          promise: "Defenders and keepers, 80+"
        },
        featured: { player: "Alisson", boost: 3, chance: 0.08 },
        objectives: [
          { id: "ev-wall-1", metric: "clean", need: 3, text: "Keep 3 clean sheets", apex: 3e3, xp: 240 },
          { id: "ev-wall-2", metric: "eventPack", need: 1, text: "Open a Wall Pack", apex: 1500, xp: 120 },
          { id: "ev-wall-3", metric: "win", need: 4, text: "Win 4 matches this week", apex: 2500, xp: 200 }
        ]
      },
      {
        id: "strikers",
        name: "Finishing School",
        blurb: "Forwards only. Big odds on gold, and the featured card is the best finisher in the world.",
        theme: "#ff2e88",
        pack: {
          id: "ev-strikers",
          name: "Striker Pack",
          cost: 7e3,
          size: 3,
          floor: "gold",
          odds: { bronze: 0, silver: 0.15, gold: 0.73, special: 0.12 },
          filter: { positions: ["ST", "LW", "RW", "CAM"], minOverall: 80 },
          note: "3 · attackers 80+",
          promise: "Attackers, 80+"
        },
        featured: { player: "Erling Haaland", boost: 3, chance: 0.06 },
        objectives: [
          { id: "ev-strikers-1", metric: "goal", need: 12, text: "Score 12 goals this week", apex: 3e3, xp: 240 },
          { id: "ev-strikers-2", metric: "bigwin", need: 1, text: "Win by three or more", apex: 2e3, xp: 160 },
          { id: "ev-strikers-3", metric: "eventPack", need: 1, text: "Open a Striker Pack", apex: 1500, xp: 120 }
        ]
      }
    ]
  };

  // js/data/season.js
  var DEFAULT_TIERS = Array.from({ length: 30 }, (_, i) => {
    let t = i + 1;
    return t === 30 ? { ultimate: 6, pack: "limited", label: "Season finale" } : t === 20 ? { pack: "prime", apex: 4e3, label: "Milestone" } : t === 10 ? { pack: "gold", apex: 2e3, label: "Milestone" } : t % 5 === 0 ? { pack: "gold" } : t % 3 === 0 ? { pack: "silver" } : t % 7 === 0 ? { pack: "dip" } : { apex: 400 + Math.floor(t / 4) * 200 };
  }), tierOf = (xp) => Math.min(30, Math.floor((xp || 0) / 250)), tierProgress = (xp) => tierOf(xp) >= 30 ? 1 : (xp || 0) % 250 / 250;

  // js/live.js
  var live = LIVE_DEFAULT, fetchedAt = 0, day = (d2 = /* @__PURE__ */ new Date()) => d2.toISOString().slice(0, 10);
  function isoWeek(d2 = /* @__PURE__ */ new Date()) {
    let t = new Date(Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate())), dayNum = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - yearStart) / 864e5 + 1) / 7);
  }
  var inWindow = (x, today3) => (!x.from || today3 >= x.from) && (!x.to || today3 <= x.to);
  function adopt(data, at = Date.now()) {
    return !data || typeof data != "object" || !Array.isArray(data.events) ? !1 : (live = data, fetchedAt = at, !0);
  }
  async function refresh() {
    try {
      let res = await fetch("events.json", { cache: "no-store" });
      if (!res.ok) return null;
      let data = await res.json();
      return adopt(data) ? data : null;
    } catch {
      return null;
    }
  }
  function activeEvent(now = /* @__PURE__ */ new Date()) {
    let today3 = day(now), hit = live.events.filter((e) => e.from || e.to).find((e) => inWindow(e, today3));
    if (hit) return hit;
    let rotation = live.events.filter((e) => !e.from && !e.to);
    return rotation.length ? rotation[isoWeek(now) % rotation.length] : live.events[0] || null;
  }

  // js/watch/pack.js
  function openPackScreen(app2, pack, drawn, opts) {
    let { rarity, dupValue: dupValue2, onDone } = opts, order = drawn.map((d2, i2) => ({ d: d2, i: i2 })).sort((a, b) => a.d.p.overall - b.d.p.overall || a.i - b.i).map((o) => o.d), best = order[order.length - 1].p, colour = (r) => {
      var _a;
      return ((_a = rarity[r]) == null ? void 0 : _a.color) || "#c9a227";
    };
    app2.innerHTML = '\n    <div class="w-screen">\n      <div class="w-pack">\n        <p class="w-title">'.concat(pack.name, '</p>\n        <div class="w-packet" id="wPacket" style="--rar:').concat(colour(best.rarity), '">UXI</div>\n        <p class="w-sub">Tap to rip · ').concat(order.length, " card").concat(order.length > 1 ? "s" : "", "</p>\n      </div>\n    </div>");
    let packet = app2.querySelector("#wPacket"), i = 0, coins = 0, flash = () => {
      let f = document.createElement("div");
      f.className = "w-flash", document.body.appendChild(f), setTimeout(() => f.remove(), 420);
    }, showNext = () => {
      var _a;
      if (i >= order.length) {
        onDone(order.length, coins);
        return;
      }
      let { p, dup } = order[i];
      dup && (coins += dupValue2(p));
      let big = p.rarity === "icon" || p.rarity === "star" || p.rarity === "special";
      (_a = navigator.vibrate) == null || _a.call(navigator, big ? [18, 50, 26, 50, 34] : 12), big && flash(), app2.querySelector(".w-pack").innerHTML = '\n      <p class="w-title">'.concat(i + 1, " of ").concat(order.length, '</p>\n      <div class="w-card-out" style="--rar:').concat(colour(p.rarity), '">\n        <div class="ov">').concat(p.overall, '</div>\n        <div class="po">').concat(p.position, '</div>\n        <div class="nm">').concat(p.short, "</div>\n        ").concat(dup ? '<div class="w-count">already yours · ◈'.concat(dupValue2(p), "</div>") : "", '\n      </div>\n      <button class="w-btn" id="wNext">').concat(i === order.length - 1 ? "Done" : "Next", "</button>"), app2.querySelector("#wNext").addEventListener("click", () => {
        i += 1, showNext();
      });
    };
    packet.addEventListener("click", () => {
      var _a;
      (_a = navigator.vibrate) == null || _a.call(navigator, 20), packet.classList.add("rip"), setTimeout(() => {
        flash(), showNext();
      }, 480);
    }, { once: !0 });
  }

  // js/watch/store.js
  var KEY2 = "apexxi.watch.v1", START_APEX = 5e3, state = null, token = null, profile = null, solo = !1, lastSync = 0, blank = () => ({
    club: { apex: START_APEX, collection: [], packs: ["bronze"], freeAt: 0, packsOpened: 0 }
  }), readLocal = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY2)) || null;
    } catch {
      return null;
    }
  }, writeLocal = () => {
    try {
      localStorage.setItem(KEY2, JSON.stringify({ state, token, profile, solo }));
    } catch {
    }
  }, save = () => state || blank(), ready = () => !!(token || solo), name = () => (profile == null ? void 0 : profile.name) || "", syncLabel = () => solo ? "this watch" : lastSync ? "just now" : "phone account";
  async function boot() {
    let stored = readLocal();
    stored ? (state = stored.state || blank(), token = stored.token || null, profile = stored.profile || null, solo = !!stored.solo) : state = blank(), token && await pull();
  }
  async function pair(code) {
    var _a;
    try {
      let res = await fetch("./api/pair/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      }), body = await res.json();
      return res.ok ? (token = body.token, profile = body.profile, solo = !1, (_a = body.save) != null && _a.club && (state = { club: { ...blank().club, ...body.save.club } }), writeLocal(), { ok: !0 }) : { error: body.error || "Pairing failed." };
    } catch {
      return { error: "No connection to the game." };
    }
  }
  function goSolo() {
    solo = !0, state = state || blank(), writeLocal();
  }
  async function pull() {
    var _a;
    try {
      let res = await fetch("./api/save", { headers: { Authorization: "Bearer ".concat(token) } });
      if (!res.ok) {
        res.status === 401 && (token = null, writeLocal());
        return;
      }
      let body = await res.json();
      (_a = body.save) != null && _a.club && (state = { ...body.save, club: { ...blank().club, ...body.save.club } }, lastSync = Date.now(), writeLocal());
    } catch {
    }
  }
  var pushT = null;
  function push() {
    writeLocal(), token && (clearTimeout(pushT), pushT = setTimeout(async () => {
      try {
        await fetch("./api/save", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer ".concat(token) },
          body: JSON.stringify({ save: state })
        }), lastSync = Date.now();
      } catch {
      }
    }, 1200));
  }
  function stat(key) {
    state.club.watchStats || (state.club.watchStats = { packs: 0, wins: 0 }), state.club.watchStats[key] = (state.club.watchStats[key] | 0) + 1, push();
  }
  var DAILY = [
    { apex: 300 },
    { apex: 500 },
    { pack: "bronze" },
    { apex: 800 },
    { pack: "silver" },
    { apex: 1200 },
    { pack: "gold", apex: 1e3 }
  ], today2 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  function dailyStatus() {
    let t = today2(), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10), d2 = state.club.daily || (state.club.daily = { last: null, streak: 0, best: 0, claimedOn: null });
    d2.last !== t && (d2.streak = d2.last === y ? d2.streak + 1 : 1, d2.last = t, d2.best = Math.max(d2.best | 0, d2.streak), push());
    let day2 = (d2.streak - 1) % 7 + 1;
    return { day: day2, streak: d2.streak, claimable: d2.claimedOn !== t, reward: DAILY[day2 - 1] };
  }
  function claimDaily() {
    let st = dailyStatus();
    return st.claimable ? (state.club.daily.claimedOn = today2(), st.reward.apex && (state.club.apex = (state.club.apex || 0) + st.reward.apex), st.reward.pack && (state.club.packs = state.club.packs || []).push(st.reward.pack), state.club.season || (state.club.season = { id: null, xp: 0, claimed: [] }), state.club.season.xp = (state.club.season.xp | 0) + 50, push(), st.reward) : null;
  }
  function earn(apex) {
    state.club.apex = Math.max(0, (state.club.apex || 0) + apex), push();
  }
  function buy(pack) {
    state.club.apex = Math.max(0, (state.club.apex || 0) - pack.cost), pack.cost === 0 && (state.club.freeAt = Date.now() + FREE_MS), push();
  }
  function consume(packId) {
    let i = (state.club.packs || []).indexOf(packId);
    i >= 0 && state.club.packs.splice(i, 1), push();
  }
  function addCards(drawn) {
    let coll = new Set(state.club.collection || []);
    for (let { p, dup } of drawn) dup || coll.add(p.id);
    state.club.collection = [...coll], state.club.packsOpened = (state.club.packsOpened || 0) + 1, state.club.watchStats || (state.club.watchStats = { packs: 0, wins: 0 }), state.club.watchStats.packs = (state.club.watchStats.packs | 0) + 1, push();
  }

  // js/watch/app.js
  var app = document.getElementById("wApp"), tab = "club", buzz2 = (ms = 8) => {
    var _a;
    try {
      (_a = navigator.vibrate) == null || _a.call(navigator, ms);
    } catch {
    }
  }, shell = (inner, withTabs = !0) => {
    app.innerHTML = '\n    <div class="w-screen" id="wScreen">'.concat(inner, "</div>\n    ").concat(withTabs ? '\n      <nav class="w-tabs">\n        '.concat([["club", "◉"], ["play", "⚽"], ["packs", "▤"]].map(([id, ic]) => '<button class="w-tab '.concat(tab === id ? "on" : "", '" data-tab="').concat(id, '">').concat(ic, "</button>")).join(""), "\n      </nav>") : ""), app.querySelectorAll("[data-tab]").forEach((el) => el.addEventListener("click", () => {
      buzz2(), tab = el.dataset.tab, render();
    }));
  };
  function pairScreen(err = "") {
    shell('\n    <p class="w-title">Pair your watch</p>\n    <p class="w-sub">On your phone: Ultimate XI → Online → <b>Pair a watch</b>. Enter the six digits.</p>\n    <input class="w-code" id="wPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="––––––">\n    <button class="w-btn" id="wPair">Pair</button>\n    <button class="w-btn ghost" id="wSolo">Play without an account</button>\n    '.concat(err ? '<p class="w-err">'.concat(err, "</p>") : "", "\n  "), !1), app.querySelector("#wPair").addEventListener("click", async () => {
      buzz2(12);
      let code = app.querySelector("#wPin").value.replace(/\D/g, "");
      if (code.length !== 6) {
        pairScreen("Six digits, from the phone.");
        return;
      }
      let r = await pair(code);
      if (r.error) {
        pairScreen(r.error);
        return;
      }
      buzz2(30), tab = "club", render();
    }), app.querySelector("#wSolo").addEventListener("click", () => {
      goSolo(), buzz2(), render();
    });
  }
  function clubScreen() {
    var _a;
    let s = save(), coll = s.club.collection || [], cards = coll.map((id) => WORLD.playersById[id]).filter(Boolean).sort((a, b) => b.overall - a.overall), best = cards[0], packs = s.club.packs || [], bonus = claimBonus();
    bonus && (earn(bonus), buzz2([10, 30, 10]));
    let objs = objectives();
    shell('\n    <p class="w-title">'.concat(name() || "Your club", '</p>\n    <div class="w-card">\n      <div class="w-big">◈ ').concat((s.club.apex || 0).toLocaleString(), '</div>\n      <div class="w-sub">Apex balance').concat(bonus ? ' · <b class="w-up">+'.concat(bonus, " streak</b>") : "", "</div>\n    </div>\n    ").concat((() => {
      let d2 = dailyStatus();
      return '\n      <button class="w-btn '.concat(d2.claimable ? "" : "ghost", '" id="wDaily" ').concat(d2.claimable ? "" : "disabled", ">\n        ").concat(d2.claimable ? "Claim day ".concat(d2.day, ": ").concat(d2.reward.pack ? "".concat(d2.reward.pack, " pack") : "").concat(d2.reward.pack && d2.reward.apex ? " + " : "").concat(d2.reward.apex ? "◈".concat(d2.reward.apex) : "") : "Day ".concat(d2.day, " claimed"), "\n      </button>");
    })(), "\n    ").concat((() => {
      var _a2;
      let xp = ((_a2 = s.club.season) == null ? void 0 : _a2.xp) | 0, t = tierOf(xp);
      return '\n      <div class="w-row"><span>Season</span><b>Tier '.concat(t, "/").concat(30, '</b></div>\n      <div class="w-track"><i style="width:').concat(Math.round(100 * tierProgress(xp)), '%"></i></div>');
    })(), "\n    ").concat((() => {
      let ev = activeEvent();
      return ev ? '<div class="w-ev" style="--ev:'.concat(ev.theme || "#22c55e", '"><span>This week</span><b>').concat(ev.name, "</b></div>") : "";
    })(), '\n    <div class="w-row"><span>Day streak</span><b>🔥 ').concat(streak(), '</b></div>\n    <p class="w-title" style="margin-top:8px">Today</p>\n    ').concat(objs.map((o) => '\n      <div class="w-obj '.concat(o.done ? "done" : "", '">\n        <span>').concat(o.text, "</span>\n        <b>").concat(o.done ? "✓" : "".concat(o.have, "/").concat(o.n), '</b>\n        <i style="width:').concat(Math.round(100 * o.have / o.n), '%"></i>\n      </div>')).join(""), '\n    <div class="w-row"><span>Cards</span><b>').concat(coll.length, '</b></div>\n    <div class="w-row"><span>Packs waiting</span><b>').concat(packs.length, "</b></div>\n    ").concat(best ? '<div class="w-row"><span>Best card</span><b>'.concat(best.overall, " ").concat(best.short, "</b></div>") : "", "\n    ").concat(cards.length ? '<p class="w-title" style="margin-top:8px">Squad</p>\n      <div class="w-grid">'.concat(cards.slice(0, 12).map((p) => {
      var _a2;
      return '\n        <div class="w-mini" style="--rar:'.concat(((_a2 = RARITY[p.rarity]) == null ? void 0 : _a2.color) || "#888", '">\n          <b>').concat(p.overall, "</b><span>").concat(p.position, "</span><em>").concat(p.short, "</em>\n        </div>");
    }).join(""), "</div>") : "", '\n    <div class="w-row"><span>Synced</span><b>').concat(syncLabel(), "</b></div>\n  ")), (_a = app.querySelector("#wDaily")) == null || _a.addEventListener("click", () => {
      claimDaily() && (buzz2([12, 40, 20]), clubScreen());
    });
  }
  var report = (ev, n = 1) => {
    let pay = event(ev, n);
    pay && (earn(pay), buzz2([10, 30, 10, 30, 10]));
  }, level = "normal";
  function playScreen() {
    let clubs = WORLD.clubs;
    shell('\n    <p class="w-title">Kick Off · 60 seconds</p>\n    <div class="w-chips">'.concat(Object.entries(LEVELS).map(([id, l]) => '<button class="w-chip '.concat(level === id ? "on" : "", '" data-level="').concat(id, '">').concat(l.label, "</button>")).join(""), '</div>\n    <button class="w-btn" data-pens>⚽ Penalties</button>\n    <p class="w-sub" style="margin-top:8px">Pick an opponent. Drag to run, tap KICK.</p>\n    ').concat(clubs.map((c) => '\n      <button class="w-btn ghost" data-club="'.concat(c.id, '" style="text-align:left">\n        ').concat(c.short, " · ").concat(c.name, "\n      </button>")).join(""), "\n  ")), app.querySelectorAll("[data-level]").forEach((el) => el.addEventListener("click", () => {
      buzz2(), level = el.dataset.level, playScreen();
    })), app.querySelector("[data-pens]").addEventListener("click", () => {
      buzz2(14);
      let opp = clubs[Math.floor(Math.random() * clubs.length)];
      playPens(app, { oppShort: opp.short, onEvent: (ev) => report(ev) }, (reward) => {
        reward && earn(reward), tab = "play", render();
      });
    }), app.querySelectorAll("[data-club]").forEach((el) => el.addEventListener("click", () => {
      buzz2(14), playMatch(app, el.dataset.club, (reward, stats) => {
        reward && earn(reward), report("match"), stats != null && stats.goals && report("goal", stats.goals), stats != null && stats.won && (report("win"), stat("wins"), stats.level === "hard" && report("hardwin")), tab = "play", render();
      }, level);
    }));
  }
  var WATCH_PACKS = ["bronze", "silver", "dip", "gold", "prime"];
  function packsScreen() {
    let s = save(), owned = s.club.packs || [], list = WATCH_PACKS.map((id) => PACKS.find((p) => p.id === id)).filter(Boolean);
    shell('\n    <p class="w-title">Packs</p>\n    <div class="w-row"><span>Balance</span><b>◈ '.concat((s.club.apex || 0).toLocaleString(), "</b></div>\n    ").concat(owned.length ? '\n      <button class="w-btn" data-open="'.concat(owned[0], '">Open ').concat((PACKS.find((p) => p.id === owned[0]) || {}).name || "pack", " (").concat(owned.length, ")</button>") : "", "\n    ").concat(list.map((p) => {
      let afford = (s.club.apex || 0) >= p.cost, free = p.cost === 0 && Date.now() >= (s.club.freeAt || 0);
      return '\n        <button class="w-btn ghost" data-buy="'.concat(p.id, '"\n                ').concat(afford || free ? "" : 'disabled style="opacity:.4"', ">\n          ").concat(p.name, " · ").concat(p.cost === 0 ? free ? "FREE" : "soon" : "◈".concat(p.cost.toLocaleString()), '\n          <span class="w-count"> ').concat(p.size, " card").concat(p.size === 1 ? "" : "s", "</span>\n        </button>");
    }).join(""), "\n  ")), app.querySelectorAll("[data-buy]").forEach((el) => el.addEventListener("click", () => {
      let pack = PACKS.find((p) => p.id === el.dataset.buy), s2 = save();
      pack.cost === 0 && Date.now() < (s2.club.freeAt || 0) || (s2.club.apex || 0) < pack.cost || (buzz2(18), buy(pack), runPack(pack));
    })), app.querySelectorAll("[data-open]").forEach((el) => el.addEventListener("click", () => {
      let pack = PACKS.find((p) => p.id === el.dataset.open);
      buzz2(18), consume(pack.id), runPack(pack);
    }));
  }
  function runPack(pack) {
    let s = save(), seen = new Set(s.club.collection || []), drawn = openPack(pack, seen);
    openPackScreen(app, pack, drawn, {
      rarity: RARITY,
      tone: packTone(pack),
      dupValue,
      onDone: (added, coins) => {
        addCards(drawn), coins && earn(coins), report("pack"), drawn.some(({ p }) => ["gold", "special", "star", "icon"].includes(p.rarity)) && report("goldcard"), tab = "packs", render();
      }
    });
  }
  function render() {
    if (!ready()) {
      pairScreen();
      return;
    }
    tab === "play" ? playScreen() : tab === "packs" ? packsScreen() : clubScreen();
  }
  var BOOT_MS = 6e3;
  Promise.race([Promise.all([boot(), refresh().catch(() => null)]), new Promise((r) => setTimeout(r, BOOT_MS))]).catch(() => {
  }).then(() => {
    var _a;
    try {
      render(), window.__apexWatchBooted = !0;
    } catch (e) {
      (_a = window.__apexWatchFail) == null || _a.call(window, (e == null ? void 0 : e.message) || String(e));
    }
  });
})();
