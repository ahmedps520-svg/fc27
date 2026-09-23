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
    { name: "Hawkridge Colliery", short: "HWK", tier: 10, crest: "diamond", pattern: "solid", device: "bird", founded: 1873, ground: "Hawk Row", colors: ["#1f2937", "#fbbf24"], league: "Grassroots League", wave: 4 },
    /* v72: the hundred-club world. Forty more clubs — two into each of the
     * first six divisions and the whole of the Highland (7th) and Lowland
     * (8th) Leagues, so the divisions are 12, 12, 12, 12, 13, 13, 13, 13.
     * `division` is explicit here (the league name alone no longer says it);
     * `wave: 5`. Generated on their own stream, named from the fifth wave. */
    { name: "Vantage City", short: "VAN", tier: 3, crest: "shield", pattern: "stripes", device: "peak", founded: 1901, ground: "Vantage Arena", colors: ["#0f172a", "#38bdf8"], league: "Apex Premier Division", division: 1, wave: 5 },
    { name: "Corsair Athletic", short: "CSR", tier: 5, crest: "circle", pattern: "halves", device: "wave", founded: 1896, ground: "The Harbourside", colors: ["#7f1d1d", "#fde68a"], league: "Apex Premier Division", division: 1, wave: 5 },
    { name: "Ridgeway Rovers", short: "RDG", tier: 4, crest: "hex", pattern: "hoops", device: "peak", founded: 1908, ground: "Ridgeway Park", colors: ["#065f46", "#a7f3d0"], league: "Meridian League", division: 2, wave: 5 },
    { name: "Stellar FC", short: "STL", tier: 6, crest: "triangle", pattern: "solid", device: "star", founded: 1953, ground: "Stellar Dome", colors: ["#312e81", "#c7d2fe"], league: "Meridian League", division: 2, wave: 5 },
    { name: "Brookhaven United", short: "BRH", tier: 3, crest: "shield", pattern: "quarters", device: "leaf", founded: 1897, ground: "Haven Road", colors: ["#1d4ed8", "#fef3c7"], league: "Vanguard League", division: 3, wave: 5 },
    { name: "Pennywell Town", short: "PNW", tier: 7, crest: "diamond", pattern: "stripes", device: "keep", founded: 1885, ground: "Penny Lane", colors: ["#78350f", "#fde68a"], league: "Vanguard League", division: 3, wave: 5 },
    { name: "Holloway Rangers", short: "HOL", tier: 4, crest: "circle", pattern: "stripes", device: "battlement", founded: 1890, ground: "Holloway Ground", colors: ["#4c1d95", "#f5f3ff"], league: "Foundation League", division: 4, wave: 5 },
    { name: "Duneside FC", short: "DUN", tier: 8, crest: "chevron", pattern: "halves", device: "sun", founded: 1934, ground: "Dune Park", colors: ["#b45309", "#fff7ed"], league: "Foundation League", division: 4, wave: 5 },
    { name: "Lakeshore City", short: "LKS", tier: 2, crest: "hex", pattern: "solid", device: "wave", founded: 1912, ground: "Lakeshore Stadium", colors: ["#0e7490", "#ecfeff"], league: "Pioneer League", division: 5, wave: 5 },
    { name: "Ferncliffe Athletic", short: "FRN", tier: 6, crest: "shield", pattern: "hoops", device: "thorn", founded: 1899, ground: "Cliff Road", colors: ["#166534", "#dcfce7"], league: "Pioneer League", division: 5, wave: 5 },
    { name: "Kingswood Wanderers", short: "KGW", tier: 9, crest: "diamond", pattern: "quarters", device: "keep", founded: 1888, ground: "Kings Field", colors: ["#1e3a8a", "#fbbf24"], league: "Pioneer League", division: 5, wave: 5 },
    { name: "Norbury Town", short: "NRB", tier: 3, crest: "circle", pattern: "halves", device: "crescent", founded: 1905, ground: "Norbury Park", colors: ["#9f1239", "#fecdd3"], league: "Grassroots League", division: 6, wave: 5 },
    { name: "Eastmoor Colts", short: "EMC", tier: 7, crest: "triangle", pattern: "stripes", device: "bird", founded: 1961, ground: "The Moor", colors: ["#0f766e", "#99f6e4"], league: "Grassroots League", division: 6, wave: 5 },
    { name: "Redbrook FC", short: "RDB", tier: 10, crest: "hex", pattern: "solid", device: "wave", founded: 1922, ground: "Brook Lane", colors: ["#b91c1c", "#fee2e2"], league: "Grassroots League", division: 6, wave: 5 },
    { name: "Ashford Vale", short: "ASV", tier: 1, crest: "shield", pattern: "stripes", device: "leaf", founded: 1894, ground: "Vale Ground", colors: ["#15803d", "#f0fdf4"], league: "Highland League", division: 7, wave: 5 },
    { name: "Bramford Albion", short: "BRF", tier: 2, crest: "circle", pattern: "hoops", device: "keep", founded: 1887, ground: "Bramford Road", colors: ["#1e40af", "#dbeafe"], league: "Highland League", division: 7, wave: 5 },
    { name: "Crestwood Town", short: "CRW", tier: 3, crest: "hex", pattern: "halves", device: "peak", founded: 1910, ground: "Crest Park", colors: ["#7c2d12", "#fed7aa"], league: "Highland League", division: 7, wave: 5 },
    { name: "Elmstead Rovers", short: "ELM", tier: 4, crest: "diamond", pattern: "solid", device: "thorn", founded: 1902, ground: "Elm Lane", colors: ["#3f6212", "#ecfccb"], league: "Highland League", division: 7, wave: 5 },
    { name: "Foxhollow United", short: "FOX", tier: 5, crest: "chevron", pattern: "quarters", device: "bird", founded: 1926, ground: "Hollow Field", colors: ["#c2410c", "#ffedd5"], league: "Highland League", division: 7, wave: 5 },
    { name: "Glenmere Athletic", short: "GLM", tier: 6, crest: "shield", pattern: "hoops", device: "wave", founded: 1898, ground: "Glen Road", colors: ["#0c4a6e", "#e0f2fe"], league: "Highland League", division: 7, wave: 5 },
    { name: "Harlow Green", short: "HRG", tier: 7, crest: "triangle", pattern: "stripes", device: "leaf", founded: 1931, ground: "Green Lane", colors: ["#166534", "#bbf7d0"], league: "Highland League", division: 7, wave: 5 },
    { name: "Ironhurst Colliery", short: "IRH", tier: 8, crest: "circle", pattern: "solid", device: "battlement", founded: 1876, ground: "Hurst Row", colors: ["#292524", "#f5f5f4"], league: "Highland League", division: 7, wave: 5 },
    { name: "Juniper Town", short: "JUN", tier: 9, crest: "hex", pattern: "halves", device: "sun", founded: 1948, ground: "Juniper Park", colors: ["#5b21b6", "#ede9fe"], league: "Highland League", division: 7, wave: 5 },
    { name: "Kettlewell FC", short: "KTW", tier: 10, crest: "diamond", pattern: "stripes", device: "crescent", founded: 1907, ground: "Kettle Ground", colors: ["#0369a1", "#f0f9ff"], league: "Highland League", division: 7, wave: 5 },
    { name: "Langford City", short: "LNG", tier: 11, crest: "shield", pattern: "quarters", device: "star", founded: 1919, ground: "Langford Road", colors: ["#be123c", "#ffe4e6"], league: "Highland League", division: 7, wave: 5 },
    { name: "Marlow Heath", short: "MLH", tier: 12, crest: "circle", pattern: "hoops", device: "peak", founded: 1883, ground: "Heath Lane", colors: ["#4d7c0f", "#f7fee7"], league: "Highland League", division: 7, wave: 5 },
    { name: "Nettleby Rangers", short: "NTL", tier: 13, crest: "hex", pattern: "solid", device: "keep", founded: 1895, ground: "Nettle Park", colors: ["#1f2937", "#fbbf24"], league: "Highland League", division: 7, wave: 5 },
    { name: "Oakridge Albion", short: "OKR", tier: 1, crest: "shield", pattern: "stripes", device: "leaf", founded: 1900, ground: "Oakridge Ground", colors: ["#14532d", "#dcfce7"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Pemberton FC", short: "PMB", tier: 2, crest: "circle", pattern: "halves", device: "keep", founded: 1889, ground: "Pember Lane", colors: ["#7f1d1d", "#fecaca"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Quarry Vale", short: "QRV", tier: 3, crest: "hex", pattern: "hoops", device: "battlement", founded: 1912, ground: "The Vale", colors: ["#44403c", "#e7e5e4"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Rosemont United", short: "RSM", tier: 4, crest: "diamond", pattern: "solid", device: "sun", founded: 1933, ground: "Rosemont Park", colors: ["#be185d", "#fce7f3"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Silverdale Town", short: "SVD", tier: 5, crest: "chevron", pattern: "quarters", device: "wave", founded: 1904, ground: "Dale Road", colors: ["#075985", "#e0f2fe"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Thornfield FC", short: "THF", tier: 6, crest: "shield", pattern: "stripes", device: "thorn", founded: 1896, ground: "Thorn Park", colors: ["#3730a3", "#e0e7ff"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Underhill Rovers", short: "UDH", tier: 7, crest: "triangle", pattern: "hoops", device: "peak", founded: 1921, ground: "Underhill", colors: ["#9a3412", "#ffedd5"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Vale Royal", short: "VLR", tier: 8, crest: "circle", pattern: "solid", device: "crescent", founded: 1947, ground: "Royal Field", colors: ["#6d28d9", "#f5f3ff"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Westbrook City", short: "WBK", tier: 9, crest: "hex", pattern: "halves", device: "star", founded: 1929, ground: "Westbrook Lane", colors: ["#0d9488", "#ccfbf1"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Yewtree Athletic", short: "YEW", tier: 10, crest: "diamond", pattern: "stripes", device: "leaf", founded: 1886, ground: "Yew Lane", colors: ["#365314", "#ecfccb"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Zealand Park", short: "ZLP", tier: 11, crest: "shield", pattern: "hoops", device: "bird", founded: 1955, ground: "Zealand Ground", colors: ["#1e3a8a", "#dbeafe"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Amberley Colts", short: "AMB", tier: 12, crest: "circle", pattern: "quarters", device: "sun", founded: 1963, ground: "Amber Park", colors: ["#d97706", "#fffbeb"], league: "Lowland League", division: 8, wave: 5 },
    { name: "Blackfen Wanderers", short: "BFN", tier: 13, crest: "hex", pattern: "stripes", device: "keep", founded: 1891, ground: "Fen Road", colors: ["#111827", "#f9fafb"], league: "Lowland League", division: 8, wave: 5 }
  ], LEAGUE_NAME = "Apex Premier Division", LEAGUES = [LEAGUE_NAME, "Meridian League", "Vanguard League", "Foundation League", "Pioneer League", "Grassroots League", "Highland League", "Lowland League"], POSITIONS = {
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
  ], REAL_PLAYERS_WAVE5 = [
    ["Ben Foster", "B. Foster", "England", "GK"],
    ["Viktor Tsygankov Ukraine", "V. Ukraine", "Ukraine", "RW"],
    ["Ramin Rezaeian Iran", "R. Iran", "Iran", "RB"],
    ["Nedim Bajrami Albania", "N. Albania", "Albania", "CAM"],
    ["Souffian El Karouani", "S. El Karouani", "Netherlands", "LB"],
    ["Ylber Ramadani", "Y. Ramadani", "Italy", "CDM"],
    ["Kike Barja", "K. Barja", "Spain", "LW"],
    ["Ante Rebic", "A. Rebic", "Italy", "ST"],
    ["John Cordoba", "J. Cordoba", "Russia", "ST"],
    ["Joel Pereira", "J. Pereira", "Poland", "LB"],
    ["Joseph Wollacott Ghana", "J. Ghana", "Ghana", "GK"],
    ["Borre", "Borre", "Brazil", "ST"],
    ["Lorenzo Montipo Verona", "L. Verona", "Italy", "GK"],
    ["Robert Bozenik", "R. Bozenik", "Portugal", "ST"],
    ["Sergio Ramos Monterrey", "S. Monterrey", "Mexico", "CB"],
    ["Daniel Wass", "D. Wass", "Denmark", "RB"],
    ["Jamie Maclaren Australia", "J. Australia", "Australia", "ST"],
    ["Patrick Mortensen", "P. Mortensen", "Denmark", "ST"],
    ["Marek Rodak Slovakia", "M. Slovakia", "Slovakia", "GK"],
    ["Pietro Terracciano Fiorentina", "P. Fiorentina", "Italy", "GK"],
    ["Gotoku Sakai", "G. Sakai", "Japan", "RB"],
    ["Jan Bednarek Poland", "J. Poland", "Poland", "CB"],
    ["Blati Toure", "B. Toure", "Egypt", "CDM"],
    ["Rayan Ait-Nouri Jr", "R. Jr", "England", "LB"],
    ["Valeriy Bondar", "V. Bondar", "Ukraine", "CB"],
    ["Moses Simon Nantes", "M. Nantes", "France", "LW"],
    ["Saeid Sadeghi Iran", "S. Iran", "Iran", "LM"],
    ["Hwang In-beom Feyenoord", "H. Feyenoord", "Netherlands", "CM"],
    ["Gabriel Gudmundsson Sweden", "G. Sweden", "Sweden", "LB"],
    ["Karim Adeyemi Dortmund", "K. Dortmund", "Germany", "LW"],
    ["Joshua King", "J. King", "France", "ST"],
    ["Benjamin Bouchouari", "B. Bouchouari", "France", "CM"],
    ["Ricardo Marin", "R. Marin", "Mexico", "ST"],
    ["Liam Delap Jr", "L. Jr", "England", "ST"],
    ["Mohammed Al-Rubaie", "M. Al-Rubaie", "Saudi Arabia", "GK"],
    ["Marcel Sabitzer2", "M. Sabitzer2", "Austria", "CM"],
    ["Martinelli Flu", "M. Flu", "Brazil", "CM"],
    ["Akash Mishra", "A. Mishra", "India", "LB"],
    ["Zeno Debast Sporting", "Z. Sporting", "Portugal", "CB"],
    ["Kristoffer Nordfeldt", "K. Nordfeldt", "Sweden", "GK"],
    ["Sem Steijn", "S. Steijn", "Netherlands", "CAM"],
    ["Yazan Al-Naimat", "Y. Al-Naimat", "Jordan", "ST"],
    ["Denis Odoi Ghana", "D. Ghana", "Ghana", "RB"],
    ["Hassane Kamara", "H. Kamara", "Italy", "LB"],
    ["Joe Gauci Australia", "J. Australia", "Australia", "GK"],
    ["Talleres Guido Herrera", "T. Herrera", "Argentina", "GK"],
    ["Yusuf Abdurisag Qatar", "Y. Qatar", "Qatar", "RW"],
    ["Antoine Semenyo Ghana2", "A. Ghana2", "Ghana", "ST"],
    ["Manfred Ugalde CR", "M. CR", "Costa Rica", "ST"],
    ["Iliman Ndiaye Senegal", "I. Senegal", "Senegal", "CAM"],
    ["Denil Maldonado", "D. Maldonado", "Honduras", "CB"],
    ["Kaan Ayhan Galatasaray", "K. Galatasaray", "Turkey", "CM"],
    ["Gianluca Caprari Monza", "G. Monza", "Italy", "LW"],
    ["Mohammed Salisu Monaco", "M. Monaco", "France", "CB"],
    ["Milan Borjan Canada", "M. Canada", "Canada", "GK"],
    ["Lamine Camara Senegal", "L. Senegal", "Senegal", "CM"],
    ["Gio Reyna USA", "G. USA", "USA", "CAM"],
    ["Ben Old NZ", "B. NZ", "New Zealand", "LW"],
    ["Nicolas Pepe CIV", "N. CIV", "Ivory Coast", "RW"],
    ["Lukas Haraslin", "L. Haraslin", "Czech Republic", "LW"],
    ["Jesper Lindstrom", "J. Lindstrom", "England", "RW"],
    ["Eduard Atuesta", "E. Atuesta", "USA", "CDM"],
    ["Ali Al-Hamadi Iraq", "A. Iraq", "Iraq", "ST"],
    ["Junior Mwanga", "J. Mwanga", "France", "CDM"],
    ["Guido Carrillo", "G. Carrillo", "Argentina", "ST"],
    ["Breel Embolo Monaco", "B. Monaco", "France", "ST"],
    ["Jesse Lingard", "J. Lingard", "South Korea", "CAM"],
    ["Tiago Djalo", "T. Djalo", "Portugal", "CB"],
    ["Andri Gudjohnsen Iceland", "A. Iceland", "Iceland", "ST"],
    ["Minnesota Robin Lod Minnesota", "M. Minnesota", "USA", "CAM"],
    ["Abdulelah Al-Amri Nassr", "A. Nassr", "Saudi Arabia", "CB"],
    ["Samuel Piette Canada", "S. Canada", "Canada", "CDM"],
    ["Kerim Alajbegovic", "K. Alajbegovic", "Bosnia and Herzegovina", "LW"],
    ["Edouard Mendy Ahli", "E. Ahli", "Saudi Arabia", "GK"],
    ["Kevin Rodriguez", "K. Rodriguez", "Ecuador", "ST"],
    ["Bremen Michael Zetterer", "B. Zetterer", "Germany", "GK"],
    ["Oswin Appollis", "O. Appollis", "South Africa", "LW"],
    ["Adam Obert", "A. Obert", "Italy", "LB"],
    ["Juan Musso Atletico", "J. Atletico", "Spain", "GK"],
    ["Diego Tarzia", "D. Tarzia", "Argentina", "LW"],
    ["Saeid Ezatolahi Iran", "S. Iran", "Iran", "CDM"],
    ["Badra Ali Sangare CIV", "B. CIV", "Ivory Coast", "GK"],
    ["Lukas Cerv", "L. Cerv", "Czech Republic", "CM"],
    ["Alex Moreno Jr", "A. Jr", "England", "LB"],
    ["Cincinnati Roman Celentano", "C. Celentano", "USA", "GK"],
    ["Alexander Barboza", "A. Barboza", "Brazil", "CB"],
    ["Ronald Hernandez", "R. Hernandez", "Venezuela", "RB"],
    ["Moi Gomez", "M. Gomez", "Spain", "CAM"],
    ["Hacken Peter Abrahamsson", "H. Abrahamsson", "Sweden", "GK"],
    ["Alexander Callens", "A. Callens", "Peru", "CB"],
    ["Independiente del Valle Moises Ramirez IDV", "I. del Valle Moises Ramirez IDV", "Ecuador", "GK"],
    ["Amar Dedic Bosnia", "A. Bosnia", "Bosnia and Herzegovina", "RB"],
    ["Sami Al-Najei Nassr", "S. Nassr", "Saudi Arabia", "CM"],
    ["Theo Leoni Anderlecht", "T. Anderlecht", "Belgium", "CM"],
    ["Zakaria Aboukhlal Toulouse", "Z. Toulouse", "France", "RW"],
    ["Andres Llinas", "A. Llinas", "Colombia", "CB"],
    ["Ryoya Morishita Japan", "R. Japan", "Japan", "LB"],
    ["Marcelino Moreno", "M. Moreno", "Argentina", "CAM"],
    ["Kwon Kyung-won Korea", "K. Korea", "South Korea", "CB"],
    ["Ridvan Yilmaz Venezia", "R. Venezia", "Italy", "LB"],
    ["Ahmed Al-Rawi Qatar", "A. Qatar", "Qatar", "ST"],
    ["Jesse Joronen", "J. Joronen", "Italy", "GK"],
    ["Ransford-Yeboah Konigsdorffer Ghana", "R. Ghana", "Ghana", "ST"],
    ["Michal Skoras", "M. Skoras", "Belgium", "RW"],
    ["Kevin Danois", "K. Danois", "France", "CM"],
    ["Jose Enamorado", "J. Enamorado", "Colombia", "LW"],
    ["Fernando Inter", "F. Inter", "Brazil", "CDM"],
    ["Elif Elmas", "E. Elmas", "North Macedonia", "CAM"],
    ["Levent Mercan", "L. Mercan", "Turkey", "LB"],
    ["Kamil Grosicki Pogon", "K. Pogon", "Poland", "LW"],
    ["Thomas Delaney", "T. Delaney", "Denmark", "CM"],
    ["Damian Bobadilla", "D. Bobadilla", "Paraguay", "CDM"],
    ["Mohamed-Ali Cho Nice", "M. Nice", "France", "RW"],
    ["Maximiliano Araujo Sporting", "M. Sporting", "Portugal", "LW"],
    ["Sofyan Amrabat Morocco", "S. Morocco", "Morocco", "CDM"],
    ["Gernot Trauner Feyenoord", "G. Feyenoord", "Netherlands", "CB"],
    ["Johann Obiang", "J. Obiang", "Gabon", "LB"],
    ["Fabian Schar Swiss", "F. Swiss", "Switzerland", "CB"],
    ["Sorba Thomas Nantes", "S. Nantes", "France", "RW"],
    ["Mainz Robin Zentner", "M. Zentner", "Germany", "GK"],
    ["Giovanni Di Lorenzo Napoli", "G. Di Lorenzo Napoli", "Italy", "RB"],
    ["Caleb Ekuban", "C. Ekuban", "Italy", "ST"],
    ["Francisco Conceicao Juve", "F. Juve", "Italy", "RW"],
    ["Vozinha", "Vozinha", "Cape Verde", "GK"],
    ["Vangelis Pavlidis Benfica", "V. Benfica", "Portugal", "ST"],
    ["Alexander Bah Benfica", "A. Benfica", "Portugal", "RB"],
    ["Eduard Bello", "E. Bello", "Venezuela", "RW"],
    ["Nouhou Tolo Cameroon", "N. Cameroon", "Cameroon", "LB"],
    ["Ali Gholizadeh Iran", "A. Iran", "Iran", "LW"],
    ["Kendry Paez", "K. Paez", "Ecuador", "CAM"],
    ["Igor Kumbulla", "I. Kumbulla", "Belgium", "CB"],
    ["Slavia Jindrich Stanek Slavia", "S. Slavia", "Czech Republic", "GK"],
    ["Riley McGree Australia", "R. Australia", "Australia", "CAM"],
    ["Ramy Bensebaini Algeria", "R. Algeria", "Algeria", "LB"],
    ["Abdulfattah Adam Ettifaq", "A. Ettifaq", "Saudi Arabia", "CM"],
    ["Ruben Vinagre", "R. Vinagre", "Poland", "LB"],
    ["Houssem Aouar Algeria", "H. Algeria", "Algeria", "CAM"],
    ["Stoppila Sunzu", "S. Sunzu", "Zambia", "CB"],
    ["Marcelo Brozovic", "M. Brozovic", "Croatia", "CDM"],
    ["Marcus Tavernier Jr", "M. Jr", "England", "LW"],
    ["Patrick Schulte USA", "P. USA", "USA", "GK"],
    ["Rajaei Ayed", "R. Ayed", "Jordan", "CM"],
    ["Mehdi Ghayedi Iran", "M. Iran", "Iran", "LW"],
    ["Aissa Mandi Lille", "A. Lille", "France", "CB"],
    ["Xherdan Shaqiri Chicago", "X. Chicago", "USA", "CAM"],
    ["Sergi Gomez", "S. Gomez", "Spain", "CB"],
    ["Serhou Guirassy Dortmund", "S. Dortmund", "Germany", "ST"],
    ["Serhou Guirassy Guinea", "S. Guinea", "Guinea", "ST"],
    ["Marius Hoibraten", "M. Hoibraten", "Japan", "CB"],
    ["Marko Pjaca", "M. Pjaca", "Croatia", "LW"],
    ["Rosario Central Jorge Broun", "R. Broun", "Argentina", "GK"],
    ["Yuri Dyupin", "Y. Dyupin", "Russia", "GK"],
    ["Robert Sanchez", "R. Sanchez", "England", "GK"],
    ["Thomas Dahnert", "T. Dahnert", "Germany", "GK"],
    ["Vladimir Jovovic", "V. Jovovic", "Montenegro", "LW"],
    ["Wang Shangyuan", "W. Shangyuan", "China", "CM"],
    ["Stijn Spierings", "S. Spierings", "France", "CDM"],
    ["Ricardo Esgaio Sporting", "R. Sporting", "Portugal", "RB"],
    ["Sebastian Caceres America", "S. America", "Mexico", "CB"],
    ["Diego Coppola", "D. Coppola", "Italy", "CB"],
    ["Filip Kostic", "F. Kostic", "Turkey", "LM"],
    ["Brian Rodriguez Uruguay", "B. Uruguay", "Uruguay", "LW"],
    ["Jota Silva Vitoria", "J. Vitoria", "Portugal", "RW"],
    ["Ricardo Pereira", "R. Pereira", "England", "RB"],
    ["Isaac Hayden", "I. Hayden", "Jamaica", "CDM"],
    ["Antonio Sivera Alaves", "A. Alaves", "Spain", "GK"],
    ["Alexis Saelemaekers Roma", "A. Roma", "Italy", "RW"],
    ["Alan Franco Galo", "A. Galo", "Brazil", "CM"],
    ["Gustav Isaksen Denmark", "G. Denmark", "Denmark", "RW"],
    ["Manfred Ugalde", "M. Ugalde", "Russia", "ST"],
    ["Hassan Al-Haydos Qatar", "H. Qatar", "Qatar", "CAM"],
    ["Oliver Sorensen", "O. Sorensen", "Denmark", "CM"],
    ["Daizen Maeda Japan", "D. Japan", "Japan", "LW"],
    ["Assim Madibo Qatar", "A. Qatar", "Qatar", "CDM"],
    ["Adrian Bernabe", "A. Bernabe", "Italy", "CM"],
    ["Adam Hlozek", "A. Hlozek", "Germany", "ST"],
    ["Mariano", "Mariano", "Brazil", "RB"],
    ["Janik Haberer", "J. Haberer", "Germany", "CM"],
    ["Garry Rodrigues", "G. Rodrigues", "Cape Verde", "LW"],
    ["Youssouf Fofana Milan", "Y. Milan", "Italy", "CDM"],
    ["Moritz Broschinski", "M. Broschinski", "Germany", "ST"],
    ["Adam Bareiro", "A. Bareiro", "Argentina", "ST"],
    ["Ruben Garcia", "R. Garcia", "Spain", "RW"],
    ["Alassane Plea", "A. Plea", "Germany", "ST"],
    ["Jordan Ayew Leicester", "J. Leicester", "England", "RW"],
    ["Yeferson Soteldo", "Y. Soteldo", "Venezuela", "LW"],
    ["Kevin Kelsy", "K. Kelsy", "Ukraine", "ST"],
    ["Nathan Patterson Jr", "N. Jr", "England", "RB"],
    ["Josimar Alcocer", "J. Alcocer", "Costa Rica", "LW"],
    ["Balthazar Pierret", "B. Pierret", "Italy", "CDM"],
    ["Ilaix Moriba Guinea", "I. Guinea", "Guinea", "CM"],
    ["Matteo Guendouzi Lazio", "M. Lazio", "Italy", "CM"],
    ["Patrick Osterhage", "P. Osterhage", "Germany", "CM"],
    ["Fernandinho", "Fernandinho", "Brazil", "CDM"],
    ["Sofyan Amrabat Fener", "S. Fener", "Turkey", "CDM"],
    ["Sahal Abdul Samad", "S. Samad", "India", "CAM"],
    ["Mauro Luna Diale", "M. Diale", "Argentina", "LW"],
    ["Brian Aguirre", "B. Aguirre", "Argentina", "RW"],
    ["Carl Johansson", "C. Johansson", "Germany", "CB"],
    ["Ismael Kandouss", "I. Kandouss", "Belgium", "CB"],
    ["Edouard Mendy Senegal", "E. Senegal", "Senegal", "GK"],
    ["Ivan Gil", "I. Gil", "Spain", "CAM"],
    ["Tim Skarke", "T. Skarke", "Germany", "LW"],
    ["Manuel Gulde", "M. Gulde", "Germany", "CB"],
    ["Carlos Gonzalez", "C. Gonzalez", "Mexico", "ST"],
    ["Patrizio Masini", "P. Masini", "Italy", "CM"],
    ["Alfredo Morelos", "A. Morelos", "Colombia", "ST"],
    ["Wayne Hennessey Jr", "W. Jr", "England", "GK"],
    ["Orri Oskarsson Iceland", "O. Iceland", "Iceland", "ST"],
    ["Waleed Al-Ahmed Ittihad", "W. Ittihad", "Saudi Arabia", "RW"],
    ["Kye Rowles Australia", "K. Australia", "Australia", "CB"],
    ["Wang Shenchao", "W. Shenchao", "China", "RB"],
    ["Luke Thomas", "L. Thomas", "England", "LB"],
    ["Derek Cornelius Canada", "D. Canada", "Canada", "CB"],
    ["Charlotte Kristijan Kahlina", "C. Kahlina", "USA", "GK"],
    ["Cassio Cruzeiro", "C. Cruzeiro", "Brazil", "GK"],
    ["Amirhossein Hosseinzadeh Iran", "A. Iran", "Iran", "LW"],
    ["Gabriel Suazo Toulouse", "G. Toulouse", "France", "LB"],
    ["Tolu Arokodare Nigeria", "T. Nigeria", "Nigeria", "ST"],
    ["Nico Elvedi Swiss", "N. Swiss", "Switzerland", "CB"],
    ["Arkadiusz Milik Poland", "A. Poland", "Poland", "ST"],
    ["Yann Sommer Swiss", "Y. Swiss", "Switzerland", "GK"],
    ["Renan Lodi", "R. Lodi", "Saudi Arabia", "LB"],
    ["Dominik Livakovic Croatia", "D. Croatia", "Croatia", "GK"],
    ["Danilo Cataldi Fiorentina", "D. Fiorentina", "Italy", "CDM"],
    ["Ethan Horvath USA", "E. USA", "USA", "GK"],
    ["Osman Bukari Ghana", "O. Ghana", "Ghana", "RW"],
    ["Simon Mignolet Brugge", "S. Brugge", "Belgium", "GK"],
    ["Nordsjaelland Andreas Schjelderup", "N. Schjelderup", "Denmark", "LW"],
    ["Andras Schafer Hungary", "A. Hungary", "Hungary", "CM"],
    ["Dudu Palmeiras", "D. Palmeiras", "Brazil", "LW"],
    ["Richard Ofori Ghana", "R. Ghana", "Ghana", "GK"],
    ["Joao Virginia", "J. Virginia", "England", "GK"],
    ["Emmanuel Banda", "E. Banda", "Zambia", "CM"],
    ["Falaye Sacko", "F. Sacko", "Mali", "LB"],
    ["Igor Akinfeev", "I. Akinfeev", "Russia", "GK"],
    ["Warren Kamanzi", "W. Kamanzi", "France", "RB"],
    ["Daniel Birligea", "D. Birligea", "Romania", "ST"],
    ["Hector Moreno", "H. Moreno", "Mexico", "CB"],
    ["Laszlo Kleinheisler", "L. Kleinheisler", "Hungary", "CM"],
    ["Marwan Hamdy", "M. Hamdy", "Egypt", "ST"],
    ["Keito Nakamura Japan", "K. Japan", "Japan", "LW"],
    ["Flaco Lopez", "F. Lopez", "Brazil", "ST"],
    ["Thomas Meunier Lille", "T. Lille", "France", "RB"],
    ["Odilon Kossounou Leverkusen", "O. Leverkusen", "Germany", "CB"],
    ["Kevin Castaneda", "K. Castaneda", "Mexico", "CAM"],
    ["Jose Sagredo", "J. Sagredo", "Bolivia", "LB"],
    ["Jamilu Collins Nigeria", "J. Nigeria", "Nigeria", "LB"],
    ["Diego Garcia", "D. Garcia", "Spain", "ST"],
    ["Mohamed Konate", "M. Konate", "Burkina Faso", "ST"],
    ["Hossein Hosseini Iran", "H. Iran", "Iran", "GK"],
    ["Laszlo Benes", "L. Benes", "Slovakia", "CM"],
    ["Risto Radunovic", "R. Radunovic", "Montenegro", "LB"],
    ["Conor Coady", "C. Coady", "England", "CB"],
    ["Joel Veltman", "J. Veltman", "England", "RB"],
    ["Joan Garcia Espanyol", "J. Espanyol", "Spain", "GK"],
    ["Francisco Trincao Sporting", "F. Sporting", "Portugal", "RW"],
    ["Justin Bijlow Feyenoord", "J. Feyenoord", "Netherlands", "GK"],
    ["Pape Gueye Senegal", "P. Senegal", "Senegal", "CM"],
    ["Daniel Munoz Palace", "D. Palace", "England", "RB"],
    ["Zakaria El Ouahdi Genk", "Z. El Ouahdi Genk", "Belgium", "RB"],
    ["Almoez Ali Qatar", "A. Qatar", "Qatar", "ST"],
    ["Jonas Wind Denmark", "J. Denmark", "Denmark", "ST"],
    ["Adam Nagy", "A. Nagy", "Hungary", "CDM"],
    ["Charles De Ketelaere Atalanta", "C. De Ketelaere Atalanta", "Italy", "CAM"],
    ["Alejo Veliz", "A. Veliz", "Spain", "ST"],
    ["Gonzalo Carneiro", "G. Carneiro", "Uruguay", "ST"],
    ["Ezgjan Alioski", "E. Alioski", "North Macedonia", "LB"],
    ["Pere Milla", "P. Milla", "Spain", "LW"],
    ["Nicolas de la Cruz Flamengo", "N. de la Cruz Flamengo", "Brazil", "CAM"],
    ["Aissa Laidouni Tunisia", "A. Tunisia", "Tunisia", "CM"],
    ["Julien Le Cardinal", "J. Le Cardinal", "France", "CB"],
    ["Junior Hoilett Canada", "J. Canada", "Canada", "LW"],
    ["Takehiro Tomiyasu Japan", "T. Japan", "Japan", "CB"],
    ["Mohamed Farsi Algeria", "M. Algeria", "Algeria", "RB"],
    ["Matias Vina Uruguay", "M. Uruguay", "Uruguay", "LB"],
    ["Ognjen Cancarevic", "O. Cancarevic", "Armenia", "GK"],
    ["Orbelin Pineda Mexico", "O. Mexico", "Mexico", "CAM"],
    ["Seny Dieng Senegal", "S. Senegal", "Senegal", "GK"],
    ["Dylan Tavares", "D. Tavares", "Cape Verde", "LB"],
    ["Leo Scienza", "L. Scienza", "Germany", "RW"],
    ["Estoril Marcelo Carne", "E. Carne", "Portugal", "GK"],
    ["Milan Djuric", "M. Djuric", "Italy", "ST"],
    ["Gaston Hernandez", "G. Hernandez", "Argentina", "CB"],
    ["Hakon Evjen", "H. Evjen", "Norway", "CM"],
    ["Baba Rahman Ghana", "B. Ghana", "Ghana", "LB"],
    ["Dylan Bronn Tunisia", "D. Tunisia", "Tunisia", "CB"],
    ["Bojan Miovski MKD", "B. MKD", "North Macedonia", "ST"],
    ["Denis Zakaria Monaco", "D. Monaco", "France", "CDM"],
    ["Ermal Krasniqi", "E. Krasniqi", "Kosovo", "LW"],
    ["Kerem Demirbay", "K. Demirbay", "Turkey", "CM"],
    ["Jordan Ferri", "J. Ferri", "France", "CM"],
    ["Dennis Hadzikadunic", "D. Hadzikadunic", "Bosnia and Herzegovina", "CB"],
    ["Dusan Vlahovic Serbia", "D. Serbia", "Serbia", "ST"],
    ["Jean-Charles Castelletto Nantes", "J. Nantes", "France", "CB"],
    ["Darko Brasanac", "D. Brasanac", "Spain", "CM"],
    ["Antonino Gallo", "A. Gallo", "Italy", "LB"],
    ["Jordy Caicedo", "J. Caicedo", "Ecuador", "ST"],
    ["Ado Onaiwu", "A. Onaiwu", "France", "ST"],
    ["Angel Romero", "A. Romero", "Paraguay", "RW"],
    ["Che Adams Torino", "C. Torino", "Italy", "ST"],
    ["Takumi Minamino Japan", "T. Japan", "Japan", "CAM"],
    ["Alex Kral Czech", "A. Czech", "Czech Republic", "CM"],
    ["Gleison Bremer Juve", "G. Juve", "Italy", "CB"],
    ["Mohamed Amoura Algeria", "M. Algeria", "Algeria", "ST"],
    ["Chuba Akpom Jr", "C. Jr", "England", "ST"],
    ["Jofre Carreras", "J. Carreras", "Spain", "RW"],
    ["Arouna Sangante", "A. Sangante", "France", "CB"],
    ["Lech Bartosz Mrozek", "L. Mrozek", "Poland", "GK"],
    ["Ahmed Musa", "A. Musa", "Nigeria", "LW"],
    ["Chrislain Matsima", "C. Matsima", "Germany", "CB"],
    ["Jordan Bos Australia", "J. Australia", "Australia", "LB"],
    ["Mamadou Fofana", "M. Fofana", "Mali", "CB"],
    ["Soungoutou Magassa Monaco", "S. Monaco", "France", "CDM"],
    ["Bard Finne", "B. Finne", "Norway", "ST"],
    ["Ivan Toney Ahli", "I. Ahli", "Saudi Arabia", "ST"],
    ["Douglas Luiz Juve", "D. Juve", "Italy", "CM"],
    ["Jubal", "Jubal", "France", "CB"],
    ["Gustaf Nilsson Sweden", "G. Sweden", "Sweden", "ST"],
    ["Olivier Giroud LAFC", "O. LAFC", "USA", "ST"],
    ["Max Geschwill", "M. Geschwill", "Germany", "CB"],
    ["Przemyslaw Tyton", "P. Tyton", "Netherlands", "GK"],
    ["Tigres Nahuel Guzman", "T. Guzman", "Mexico", "GK"],
    ["Loris Benito", "L. Benito", "Switzerland", "CB"],
    ["Kamil Grabara Poland", "K. Poland", "Poland", "GK"],
    ["Markus Kolke", "M. Kolke", "Germany", "GK"],
    ["Ibrahim Sangare Jr", "I. Jr", "England", "CDM"],
    ["Abdou Diallo Senegal", "A. Senegal", "Senegal", "CB"],
    ["Bobadilla", "Bobadilla", "Brazil", "CDM"],
    ["Ademola Lookman Nigeria", "A. Nigeria", "Nigeria", "LW"],
    ["Tajon Buchanan Inter", "T. Inter", "Italy", "RW"],
    ["Yan Couto Dortmund", "Y. Dortmund", "Germany", "RB"],
    ["Abde Rebbach", "A. Rebbach", "Spain", "LW"],
    ["Yukinari Sugawara Japan", "Y. Japan", "Japan", "RB"],
    ["Kouame Autonne UAE", "K. UAE", "United Arab Emirates", "CB"],
    ["Ali Karimi Iran", "A. Iran", "Iran", "CM"],
    ["Jeremie Frimpong Leverkusen", "J. Leverkusen", "Germany", "RB"],
    ["Remy Descamps", "R. Descamps", "France", "GK"],
    ["Kaoru Mitoma Brighton", "K. Brighton", "England", "LW"],
    ["Michel-Ange Balikwisha", "M. Balikwisha", "Belgium", "LW"],
    ["Manu Sanchez", "M. Sanchez", "Spain", "LB"],
    ["Braga Paulo Oliveira Braga", "B. Braga", "Portugal", "CB"],
    ["Gremio Marchesin", "G. Marchesin", "Brazil", "GK"],
    ["Lassina Traore", "L. Traore", "Ukraine", "ST"],
    ["Teemu Pukki Minnesota", "T. Minnesota", "USA", "ST"],
    ["Raphael Veiga Palmeiras", "R. Palmeiras", "Brazil", "CAM"],
    ["Cengiz Under", "C. Under", "Turkey", "RW"],
    ["Anthony Losilla", "A. Losilla", "Germany", "CDM"],
    ["Luis Abram", "L. Abram", "Peru", "CB"],
    ["Vincent Sierro", "V. Sierro", "France", "CM"],
    ["Martin Valjent Jr", "M. Jr", "Spain", "CB"],
    ["Davide Zappacosta Atalanta", "D. Atalanta", "Italy", "RB"],
    ["Niklas Hedl", "N. Hedl", "Austria", "GK"],
    ["Evann Guessand Nice", "E. Nice", "France", "ST"],
    ["Marco Brescianini Atalanta", "M. Atalanta", "Italy", "CM"],
    ["Anthony Elanga Sweden", "A. Sweden", "Sweden", "RW"],
    ["Sergej Milinkovic-Savic", "S. Milinkovic-Savic", "Serbia", "CM"],
    ["Mathias Kjolo", "M. Kjolo", "Netherlands", "CM"],
    ["Jacopo Seghetti", "J. Seghetti", "Italy", "GK"],
    ["Nawaf Al-Aqidi Nassr", "N. Nassr", "Saudi Arabia", "GK"],
    ["Eduardo Salvio Pumas", "E. Pumas", "Mexico", "RW"],
    ["Joao Klauss", "J. Klauss", "USA", "ST"],
    ["Denis Alibec", "D. Alibec", "Romania", "ST"],
    ["Hamdi Fathi Wakrah", "H. Wakrah", "Egypt", "CDM"],
    ["Sanfrecce Keisuke Osako Sanfrecce", "S. Sanfrecce", "Japan", "GK"],
    ["Kaishu Sano Japan", "K. Japan", "Japan", "CDM"],
    ["Alonso Martinez CR", "A. CR", "Costa Rica", "ST"],
    ["Lin Liangming", "L. Liangming", "China", "LW"],
    ["Kosta Nedeljkovic Serbia", "K. Serbia", "Serbia", "RB"],
    ["Moussa Diaby Ittihad", "M. Ittihad", "Saudi Arabia", "RW"],
    ["Angelino Roma", "A. Roma", "Italy", "LB"],
    ["Franck Kessie CIV", "F. CIV", "Ivory Coast", "CM"],
    ["Marco Ruben", "M. Ruben", "Argentina", "ST"],
    ["Harry Winks", "H. Winks", "England", "CDM"],
    ["Ben Johnson Jr", "B. Jr", "England", "RB"],
    ["Fabio Vieira", "F. Vieira", "Portugal", "CAM"],
    ["Alex Arce", "A. Arce", "Paraguay", "ST"],
    ["Carlos Zambrano", "C. Zambrano", "Peru", "CB"],
    ["Pogon Efthymios Koulouris", "P. Koulouris", "Poland", "ST"],
    ["Sao Paulo Rafael Sao Paulo", "S. Paulo", "Brazil", "GK"],
    ["Genki Haraguchi Japan", "G. Japan", "Japan", "CM"],
    ["Felix Uduokhai", "F. Uduokhai", "Turkey", "CB"],
    ["Matus Bero", "M. Bero", "Germany", "CM"],
    ["Ahmed Touba Algeria", "A. Algeria", "Algeria", "CB"],
    ["Talal Haji Nassr", "T. Nassr", "Saudi Arabia", "ST"],
    ["Ismael Saibari PSV", "I. PSV", "Netherlands", "CM"],
    ["Yaser Asprilla Girona", "Y. Girona", "Spain", "CAM"],
    ["Paulista", "Paulista", "Spain", "CB"],
    ["Renaldo Cephas", "R. Cephas", "Jamaica", "LW"],
    ["Yang Hyun-jun Korea", "Y. Korea", "South Korea", "LW"],
    ["Welington", "Welington", "Brazil", "LB"],
    ["Ayoub El Kaabi Morocco", "A. El Kaabi Morocco", "Morocco", "ST"],
    ["Mattias Svanberg Sweden", "M. Sweden", "Sweden", "CM"],
    ["Ismaila Sarr Senegal", "I. Senegal", "Senegal", "RW"],
    ["Lamine Camara Monaco", "L. Monaco", "France", "CM"],
    ["Jindrich Stanek", "J. Stanek", "Czech Republic", "GK"],
    ["Lucas Da Cunha", "L. Da Cunha", "Italy", "CM"],
    ["Andre Carrillo Peru", "A. Peru", "Peru", "RW"],
    ["Aleksandar Trajkovski", "A. Trajkovski", "North Macedonia", "ST"],
    ["Hulk Galo", "H. Galo", "Brazil", "ST"],
    ["Sofiane Diop Nice", "S. Nice", "France", "CAM"],
    ["Panagiotis Retsos", "P. Retsos", "Greece", "CB"],
    ["Juanlu Sanchez", "J. Sanchez", "Spain", "RB"],
    ["Fran Beltran", "F. Beltran", "Spain", "CDM"],
    ["Konstantin Tyukavin", "K. Tyukavin", "Russia", "ST"],
    ["Fiorentina David de Gea", "F. David de Gea", "Italy", "GK"],
    ["Anass Zaroury Morocco", "A. Morocco", "Morocco", "LW"],
    ["Moises Fortaleza", "M. Fortaleza", "Brazil", "LW"],
    ["Amar Dedic", "A. Dedic", "Austria", "RB"],
    ["Stanislav Lobotka Slovakia", "S. Slovakia", "Slovakia", "CDM"],
    ["Marcel Sabitzer Austria", "M. Austria", "Austria", "CM"],
    ["Marcelo Diaz", "M. Diaz", "Chile", "CDM"],
    ["Andriy Lunin Ukraine", "A. Ukraine", "Ukraine", "GK"],
    ["Boavista Bracali", "B. Bracali", "Portugal", "GK"],
    ["Mohammed Kudus Ghana", "M. Ghana", "Ghana", "CAM"],
    ["Bryan Acosta", "B. Acosta", "Honduras", "CM"],
    ["Akor Adams", "A. Adams", "France", "ST"],
    ["Hiroki Sakai Japan", "H. Japan", "Japan", "RB"],
    ["Marvin Park", "M. Park", "Spain", "RB"],
    ["Andrea Carboni", "A. Carboni", "Italy", "CB"],
    ["Diego Porcel", "D. Porcel", "Argentina", "LB"],
    ["Ahmed Kendouci", "A. Kendouci", "Algeria", "CM"],
    ["Valentin Mihaila", "V. Mihaila", "Italy", "LW"],
    ["Felix Passlack", "F. Passlack", "Germany", "RB"],
    ["Matheus Magalhaes Braga", "M. Braga", "Portugal", "GK"],
    ["Fahad Al-Muwallad Ittihad", "F. Ittihad", "Saudi Arabia", "RW"],
    ["Bibras Natcho", "B. Natcho", "Serbia", "CM"],
    ["Nikola Milenkovic", "N. Milenkovic", "England", "CB"],
    ["Roberto Lopez", "R. Lopez", "Spain", "CM"],
    ["Adam Hlozek Czech", "A. Czech", "Czech Republic", "ST"],
    ["Atlas Camilo Vargas Atlas", "A. Atlas", "Mexico", "GK"],
    ["Leicester Danny Ward", "L. Ward", "England", "GK"],
    ["Anthony Nwakaeme", "A. Nwakaeme", "Turkey", "LW"],
    ["Joao Mario Porto2", "J. Porto2", "Portugal", "RB"],
    ["Ricardo Chavez", "R. Chavez", "Mexico", "RB"],
    ["Duje Caleta-Car", "D. Caleta-Car", "France", "CB"],
    ["Agustin Canobbio Uruguay", "A. Uruguay", "Uruguay", "RW"],
    ["Jaime Mata", "J. Mata", "Spain", "ST"],
    ["Johan Vasquez Genoa", "J. Genoa", "Italy", "CB"],
    ["Khephren Thuram Juve", "K. Juve", "Italy", "CM"],
    ["Bae Jun-ho Korea", "B. Korea", "South Korea", "CAM"],
    ["Thiago Heleno", "T. Heleno", "Brazil", "CB"],
    ["Rade Krunic", "R. Krunic", "Serbia", "CM"],
    ["Cesar Huerta Mexico", "C. Mexico", "Mexico", "LW"],
    ["Walid Cheddira", "W. Cheddira", "Spain", "ST"],
    ["Lameck Banda", "L. Banda", "Italy", "LW"],
    ["Julio Gonzalez", "J. Gonzalez", "Mexico", "GK"],
    ["Nicolas Janvier", "N. Janvier", "Turkey", "CM"],
    ["NYCFC Santiago Rodriguez", "N. Rodriguez", "USA", "CAM"],
    ["Bart van Rooij", "B. van Rooij", "Netherlands", "RB"],
    ["Yahia Attiyat Allah Morocco", "Y. Morocco", "Morocco", "LB"],
    ["Alex Scott Jr", "A. Jr", "England", "CM"],
    ["Maxime Crepeau Canada", "M. Canada", "Canada", "GK"],
    ["Mehmet Can Aydin", "M. Aydin", "Turkey", "RB"],
    ["Darko Velkovski", "D. Velkovski", "North Macedonia", "CB"],
    ["Joel Pohjanpalo", "J. Pohjanpalo", "Italy", "ST"],
    ["Brítez", "Brítez", "Brazil", "CB"],
    ["Colo Colo Brayan Cortes Colo", "C. Colo", "Chile", "GK"],
    ["Emil Holm", "E. Holm", "Italy", "RB"],
    ["Andrea Cambiaso Juve", "A. Juve", "Italy", "LB"],
    ["Okay Yokuslu", "O. Yokuslu", "Turkey", "CDM"],
    ["Benjamin Sesko Slovenia", "B. Slovenia", "Slovenia", "ST"],
    ["Brenden Aaronson USA", "B. USA", "USA", "LW"],
    ["Sadio Mane Senegal", "S. Senegal", "Senegal", "LW"],
    ["Ze Pedro Porto", "Z. Porto", "Portugal", "CB"],
    ["Kirian Rodriguez", "K. Rodriguez", "Spain", "CM"],
    ["Jakob Breum", "J. Breum", "Netherlands", "RW"],
    ["Felix Nmecha Dortmund", "F. Dortmund", "Germany", "CM"],
    ["Albion Rrahmani Kosovo", "A. Kosovo", "Kosovo", "ST"],
    ["Toaster Nsabata", "T. Nsabata", "Zambia", "GK"],
    ["Joao Mario Besiktas", "J. Besiktas", "Turkey", "CM"],
    ["Mirko Ivanic", "M. Ivanic", "Serbia", "CAM"],
    ["Federico Valverde Uruguay", "F. Uruguay", "Uruguay", "CM"],
    ["Santiago Gimenez Mexico", "S. Mexico", "Mexico", "ST"],
    ["Kjell Scherpen", "K. Scherpen", "Netherlands", "GK"],
    ["Marcus Thuram Inter", "M. Inter", "Italy", "ST"],
    ["Yuya Osako Japan", "Y. Japan", "Japan", "ST"],
    ["Jordan Veretout Lyon", "J. Lyon", "France", "CM"],
    ["Nediljko Labrovic Croatia", "N. Croatia", "Croatia", "GK"],
    ["William Osula", "W. Osula", "England", "ST"],
    ["Olivier Ntcham Cameroon", "O. Cameroon", "Cameroon", "CM"],
    ["Salman Al-Faraj Hilal", "S. Hilal", "Saudi Arabia", "CM"],
    ["Gaetano Castrovilli", "G. Castrovilli", "Italy", "CAM"],
    ["Bartosz Kapustka", "B. Kapustka", "Poland", "CM"],
    ["Liston Colaco", "L. Colaco", "India", "LW"],
    ["Barnabas Varga", "B. Varga", "Hungary", "ST"],
    ["Kyriani Sabbe Brugge", "K. Brugge", "Belgium", "RB"],
    ["Marin Pongracic Croatia", "M. Croatia", "Croatia", "CB"],
    ["Ismaily Lille", "I. Lille", "France", "LB"],
    ["Dominik Kohr", "D. Kohr", "Germany", "CB"],
    ["Koni De Winter", "K. De Winter", "Italy", "CB"],
    ["Finn Surman", "F. Surman", "New Zealand", "CB"],
    ["Derek Cornelius OM", "D. OM", "France", "CB"],
    ["Brahim Diaz Morocco", "B. Morocco", "Morocco", "CAM"],
    ["Alexis Sanchez Chile", "A. Chile", "Chile", "ST"],
    ["Renato Sanches Benfica", "R. Benfica", "Portugal", "CM"],
    ["Giorgi Loria", "G. Loria", "Georgia", "GK"],
    ["Akram Afif Qatar", "A. Qatar", "Qatar", "LW"],
    ["Nice Marcin Bulka Nice", "N. Nice", "France", "GK"],
    ["Franculino", "Franculino", "Denmark", "ST"],
    ["John Ruddy", "J. Ruddy", "England", "GK"],
    ["Donyell Malen Dortmund", "D. Dortmund", "Germany", "RW"],
    ["Jalal Hassan Iraq", "J. Iraq", "Iraq", "GK"],
    ["George Edmundson", "G. Edmundson", "England", "CB"],
    ["Aref Aghasi Iran", "A. Iran", "Iran", "CB"],
    ["Ezequiel Barco Spartak", "E. Spartak", "Russia", "LW"],
    ["Hotaru Yamaguchi", "H. Yamaguchi", "Japan", "CM"],
    ["Smail Prevljak", "S. Prevljak", "Bosnia and Herzegovina", "ST"],
    ["Ibrahim Adel Pyramids", "I. Pyramids", "Egypt", "LW"],
    ["Javi Rodriguez", "J. Rodriguez", "Spain", "CB"],
    ["Tolu Arokodare Genk", "T. Genk", "Belgium", "ST"],
    ["Marinho", "Marinho", "Brazil", "RW"],
    ["Anders Dreyer Denmark", "A. Denmark", "Denmark", "RW"],
    ["Marco Di Cesare", "M. Di Cesare", "Argentina", "CB"],
    ["Adam Masina Morocco", "A. Morocco", "Morocco", "LB"],
    ["Mauro Junior PSV", "M. PSV", "Netherlands", "LB"],
    ["Nediljko Labrovic", "N. Labrovic", "Germany", "GK"],
    ["Marcus Ingvartsen", "M. Ingvartsen", "Denmark", "ST"],
    ["Marko Ivezic", "M. Ivezic", "Germany", "CB"],
    ["Frederic Guilbert", "F. Guilbert", "Italy", "RB"],
    ["Kim Young-gwon Korea", "K. Korea", "South Korea", "CB"],
    ["Elias Jelert FCK", "E. FCK", "Denmark", "RB"],
    ["Billy Gilmour Napoli", "B. Napoli", "Italy", "CDM"],
    ["Adrien Truffert Rennes", "A. Rennes", "France", "LB"],
    ["Yerry Mina Colombia", "Y. Colombia", "Colombia", "CB"],
    ["Max Dean", "M. Dean", "Belgium", "ST"],
    ["Finn van Breemen", "F. van Breemen", "Switzerland", "CB"],
    ["Kosta Barbarouses", "K. Barbarouses", "New Zealand", "RW"],
    ["Saint-Etienne Gautier Larsonneur", "S. Larsonneur", "France", "GK"],
    ["Victor Lindelof", "V. Lindelof", "Sweden", "CB"],
    ["Ludwig Augustinsson Sweden", "L. Sweden", "Sweden", "LB"],
    ["Bruno Gomes", "B. Gomes", "Brazil", "RB"],
    ["Joao Victor Vasco", "J. Vasco", "Brazil", "CB"],
    ["Oh Hyeon-gyu Korea", "O. Korea", "South Korea", "ST"],
    ["Cyriel Dessers Nigeria", "C. Nigeria", "Nigeria", "ST"],
    ["Paulo Diaz Chile2", "P. Chile2", "Chile", "CB"],
    ["Victor Guzman", "V. Guzman", "Mexico", "CB"],
    ["Joao Gomes Jr", "J. Jr", "England", "CM"],
    ["Heorhiy Bushchan", "H. Bushchan", "Ukraine", "GK"],
    ["Velez Tomas Marchiori", "V. Marchiori", "Argentina", "GK"],
    ["Jan Schoppner", "J. Schoppner", "Germany", "CDM"],
    ["Miguel de la Fuente", "M. de la Fuente", "Spain", "ST"],
    ["Jhonder Cadiz", "J. Cadiz", "Venezuela", "ST"],
    ["Mohammed Waad Qatar", "M. Qatar", "Qatar", "CM"],
    ["Callum Styles", "C. Styles", "Hungary", "CM"],
    ["Ryan Manning Jr", "R. Jr", "England", "LB"],
    ["Ivan Marcano", "I. Marcano", "Portugal", "CB"],
    ["Romeo Vermant Brugge", "R. Brugge", "Belgium", "ST"],
    ["Stefan Lainer Austria", "S. Austria", "Austria", "RB"],
    ["Arezo", "Arezo", "Brazil", "ST"],
    ["Maksim Glushenkov", "M. Glushenkov", "Russia", "LW"],
    ["Alvaro Carreras Benfica", "A. Benfica", "Portugal", "LB"],
    ["Patrick Erras", "P. Erras", "Germany", "CB"],
    ["Moumi Ngamaleu Cameroon", "M. Cameroon", "Cameroon", "RW"],
    ["Majeed Ashimeru Anderlecht", "M. Anderlecht", "Belgium", "CM"],
    ["Zack Steffen USA", "Z. USA", "USA", "GK"],
    ["Teboho Mokoena", "T. Mokoena", "South Africa", "CDM"],
    ["Kamal Miller Canada", "K. Canada", "Canada", "CB"],
    ["Logan Costa", "L. Costa", "Spain", "CB"],
    ["Braithwaite Gremio", "B. Gremio", "Brazil", "ST"],
    ["Nicolo Rovella Lazio", "N. Lazio", "Italy", "CDM"],
    ["Pedro Amaral", "P. Amaral", "Portugal", "LB"],
    ["Edison Flores", "E. Flores", "Peru", "LW"],
    ["Darko Lazovic", "D. Lazovic", "Italy", "LW"],
    ["Thierno Barry", "T. Barry", "Spain", "ST"],
    ["Vitor Carvalho Braga", "V. Braga", "Portugal", "CDM"],
    ["Gilberto", "Gilberto", "Brazil", "RB"],
    ["Yoann Cathline", "Y. Cathline", "Netherlands", "LW"],
    ["Vanderson Monaco", "V. Monaco", "France", "RB"],
    ["Estudiantes Fernando Muslera Estudiantes", "E. Estudiantes", "Argentina", "GK"],
    ["Nicolas Jackson Senegal", "N. Senegal", "Senegal", "ST"],
    ["Julian Quinones Mexico", "J. Mexico", "Mexico", "ST"],
    ["Zito Luvumbo Angola", "Z. Angola", "Angola", "LW"],
    ["Badredine Bouanani Nice", "B. Nice", "France", "RW"],
    ["Christian Cueva", "C. Cueva", "Peru", "CAM"],
    ["Youssef Maleh Empoli", "Y. Empoli", "Italy", "CM"],
    ["Rodrigo Huescas", "R. Huescas", "Mexico", "RB"],
    ["Giuseppe Pezzella", "G. Pezzella", "Italy", "LB"],
    ["Mahmoud Gad", "M. Gad", "Egypt", "GK"],
    ["Alejandro Catena", "A. Catena", "Spain", "CB"],
    ["Nicola Leali", "N. Leali", "Italy", "GK"],
    ["Como Pepe Reina Como", "C. Como", "Italy", "GK"],
    ["Michael Santos", "M. Santos", "Argentina", "ST"],
    ["Kelechi Iheanacho Sevilla", "K. Sevilla", "Spain", "ST"],
    ["Mojmir Chytil Slavia", "M. Slavia", "Czech Republic", "ST"],
    ["Ismael Diawara", "I. Diawara", "Mali", "GK"],
    ["Eric Davis", "E. Davis", "Panama", "LB"],
    ["Marco Grull", "M. Grull", "Germany", "LW"],
    ["Philadelphia Andre Blake", "P. Blake", "USA", "GK"],
    ["Malmo Johan Dahlin", "M. Dahlin", "Sweden", "GK"],
    ["Miles Robinson Cincy", "M. Cincy", "USA", "CB"],
    ["Dayne St. Clair Canada", "D. Canada", "Canada", "GK"],
    ["Raphael Onyedika Brugge", "R. Brugge", "Belgium", "CDM"],
    ["Juan Jose Perea", "J. Perea", "Switzerland", "ST"],
    ["Sasa Kalajdzic", "S. Kalajdzic", "England", "ST"],
    ["Samuel Dahl", "S. Dahl", "Sweden", "LB"],
    ["Marwin Hitz", "M. Hitz", "Switzerland", "GK"],
    ["Lucas Villalba", "L. Villalba", "Brazil", "CB"],
    ["Steven Bergwijn Ittihad", "S. Ittihad", "Saudi Arabia", "LW"],
    ["Sead Kolasinac Atalanta", "S. Atalanta", "Italy", "CB"],
    ["Ahmed Hegazi Ittihad", "A. Ittihad", "Saudi Arabia", "CB"],
    ["Mateo Retegui Atalanta", "M. Atalanta", "Italy", "ST"],
    ["Cassiano", "Cassiano", "Portugal", "ST"],
    ["Mislav Orsic", "M. Orsic", "Croatia", "LW"],
    ["Samson Baidoo", "S. Baidoo", "Austria", "CB"],
    ["Marin Pongracic", "M. Pongracic", "Italy", "CB"],
    ["Barreal", "Barreal", "Brazil", "LW"],
    ["Ramon Sosa Paraguay", "R. Paraguay", "Paraguay", "LW"],
    ["Emmanuel Gyasi Empoli", "E. Empoli", "Italy", "LW"],
    ["Tyler Adams Bournemouth", "T. Bournemouth", "England", "CDM"],
    ["Diego Valdes America", "D. America", "Mexico", "CAM"],
    ["Junior Hernandez", "J. Hernandez", "Colombia", "LW"],
    ["Mohamed Elyounoussi FCK", "M. FCK", "Denmark", "LW"],
    ["Fran Gonzalez", "F. Gonzalez", "Spain", "GK"],
    ["Haythem Jouini Tunisia", "H. Tunisia", "Tunisia", "ST"],
    ["Kevin Mac Allister Union", "K. Mac Allister Union", "Belgium", "CB"],
    ["Junior Santiago Mele Junior", "J. Junior", "Colombia", "GK"],
    ["America Luis Malagon America", "A. America", "Mexico", "GK"],
    ["Yacine Adli Mali", "Y. Mali", "Mali", "CM"],
    ["Leandro Cabrera", "L. Cabrera", "Spain", "CB"],
    ["Weston McKennie USA", "W. USA", "USA", "CM"],
    ["Mikael Anderson", "M. Anderson", "Iceland", "RW"],
    ["Mathis Amougou", "M. Amougou", "France", "CM"],
    ["Alberth Elis", "A. Elis", "Honduras", "RW"],
    ["Rafinha", "Rafinha", "Brazil", "RB"],
    ["Nemanja Gudelj Serbia", "N. Serbia", "Serbia", "CDM"],
    ["Stefan Savic", "S. Savic", "Turkey", "CB"],
    ["Jon Gorenc Stankovic", "J. Stankovic", "Austria", "CB"],
    ["Kings Kangwa", "K. Kangwa", "Zambia", "CM"],
    ["Grischa Promel", "G. Promel", "Germany", "CM"],
    ["Anass Salah-Eddine", "A. Salah-Eddine", "Netherlands", "LB"],
    ["Rodrigo Bentancur Uruguay", "R. Uruguay", "Uruguay", "CM"],
    ["Alexis Canelo", "A. Canelo", "Argentina", "ST"],
    ["Emil Krafth Sweden", "E. Sweden", "Sweden", "RB"],
    ["Lazaros Rota", "L. Rota", "Greece", "RB"],
    ["Stefan Tarnovanu", "S. Tarnovanu", "Romania", "GK"],
    ["Olivier Boscagli PSV", "O. PSV", "Netherlands", "CB"],
    ["Omar El Hilali", "O. El Hilali", "Spain", "RB"],
    ["Keven Schlotterbeck", "K. Schlotterbeck", "Germany", "CB"],
    ["Bruno Martins Indi", "B. Indi", "Netherlands", "CB"],
    ["Alassane Ndao", "A. Ndao", "Turkey", "RW"],
    ["Elisha Owusu Ghana", "E. Ghana", "Ghana", "CDM"],
    ["Dejan Joveljic", "D. Joveljic", "USA", "ST"],
    ["Chiquinho", "Chiquinho", "Portugal", "CAM"],
    ["Abdul Fatawu Ghana", "A. Ghana", "Ghana", "RW"],
    ["Ali Jasim Iraq", "A. Iraq", "Iraq", "RW"],
    ["Drissa Camara", "D. Camara", "Italy", "CDM"],
    ["Empoli Devis Vasquez Empoli", "E. Empoli", "Italy", "GK"],
    ["Tolima Christopher Fiermarin", "T. Fiermarin", "Colombia", "GK"],
    ["Mads Pedersen", "M. Pedersen", "Germany", "LB"],
    ["Mustafa Eskihellac", "M. Eskihellac", "Turkey", "LB"],
    ["Joe Lolley", "J. Lolley", "Australia", "RW"],
    ["Djibril Sow", "D. Sow", "Spain", "CM"],
    ["Abdulrahman Al-Aboud Ittihad", "A. Ittihad", "Saudi Arabia", "CAM"],
    ["Soualiho Meite", "S. Meite", "Greece", "CDM"],
    ["Taty Castellanos Lazio", "T. Lazio", "Italy", "ST"],
    ["Victor Davila Chile", "V. Chile", "Chile", "LW"],
    ["Milan Gajic", "M. Gajic", "Russia", "RB"],
    ["Ali Abdi Tunisia", "A. Tunisia", "Tunisia", "LB"],
    ["Jacob Bruun Larsen", "J. Larsen", "Germany", "LW"],
    ["Alexandre Olliero", "A. Olliero", "France", "GK"],
    ["Stephy Mavididi", "S. Mavididi", "England", "LW"],
    ["Alexis Vega Toluca", "A. Toluca", "Mexico", "LW"],
    ["Noussair Mazraoui Morocco", "N. Morocco", "Morocco", "RB"],
    ["Viti Rozada", "V. Rozada", "Spain", "RB"],
    ["Nick Viergever", "N. Viergever", "Netherlands", "CB"],
    ["Marco Grull Rapid", "M. Rapid", "Austria", "LW"],
    ["Ghislain Konan CIV", "G. CIV", "Ivory Coast", "LB"],
    ["Roman Yevgenyev", "R. Yevgenyev", "Russia", "CB"],
    ["Zhang Yuning", "Z. Yuning", "China", "ST"],
    ["Ola Solbakken", "O. Solbakken", "Italy", "RW"],
    ["Andre Franco", "A. Franco", "Portugal", "CAM"],
    ["Josip Sutalo Ajax", "J. Ajax", "Netherlands", "CB"],
    ["Rodinei", "Rodinei", "Greece", "RB"],
    ["Tariq Lamptey Ghana", "T. Ghana", "Ghana", "RB"],
    ["Independiente Rodrigo Rey Independiente", "I. Independiente", "Argentina", "GK"],
    ["Amath Ndiaye", "A. Ndiaye", "Spain", "RW"],
    ["Guga", "Guga", "Brazil", "RB"],
    ["Sarpreet Singh", "S. Singh", "New Zealand", "CAM"],
    ["Oliver Burke", "O. Burke", "Germany", "ST"],
    ["Ayase Ueda Japan", "A. Japan", "Japan", "ST"],
    ["Cedric Zesiger Augsburg", "C. Augsburg", "Germany", "CB"],
    ["Kevin Quevedo", "K. Quevedo", "Peru", "RW"],
    ["Rodrigo Becao", "R. Becao", "Turkey", "CB"],
    ["Malang Sarr", "M. Sarr", "France", "CB"],
    ["Botond Balogh", "B. Balogh", "Italy", "CB"],
    ["Jordan Zemura", "J. Zemura", "Italy", "LB"],
    ["Mikayil Faye", "M. Faye", "France", "CB"],
    ["Quentin Merlin OM", "Q. OM", "France", "LB"],
    ["Steven Zuber", "S. Zuber", "Switzerland", "LM"],
    ["Alberto Paleari Torino", "A. Torino", "Italy", "GK"],
    ["Pochettino", "Pochettino", "Brazil", "CAM"],
    ["Carl Starfelt", "C. Starfelt", "Spain", "CB"],
    ["Saman Ghoddos Iran", "S. Iran", "Iran", "CAM"],
    ["Berat Djimsiti Atalanta", "B. Atalanta", "Italy", "CB"],
    ["Armindo Sieb", "A. Sieb", "Germany", "ST"],
    ["Gabriel Pec", "G. Pec", "USA", "RW"],
    ["Mahmoud Al-Mardi", "M. Al-Mardi", "Jordan", "RW"],
    ["Tanguy Nianzou", "T. Nianzou", "Spain", "CB"],
    ["Gabriel Suazo Chile", "G. Chile", "Chile", "LB"],
    ["Matias Tissera", "M. Tissera", "Argentina", "ST"],
    ["Corinthians Hugo Souza Corinthians", "C. Corinthians", "Brazil", "GK"],
    ["Christian Gytkjaer", "C. Gytkjaer", "Italy", "ST"],
    ["Steve Kapuadi", "S. Kapuadi", "Poland", "CB"],
    ["Ehsan Haddad", "E. Haddad", "Jordan", "LB"],
    ["Jagiellonia Slawomir Abramowicz", "J. Abramowicz", "Poland", "GK"],
    ["Peer Koopmeiners", "P. Koopmeiners", "Netherlands", "CM"],
    ["Cruzeiro Cassio Cruzeiro2", "C. Cruzeiro2", "Brazil", "GK"],
    ["Dion Beljo", "D. Beljo", "Germany", "ST"],
    ["Roger Martinez", "R. Martinez", "Argentina", "ST"],
    ["Carlos Vicente", "C. Vicente", "Spain", "RW"],
    ["Frank Feller", "F. Feller", "Germany", "GK"],
    ["Lamine Camara2", "L. Camara2", "Ivory Coast", "CM"],
    ["Issam Jebali Tunisia", "I. Tunisia", "Tunisia", "ST"],
    ["Alex Munoz", "A. Munoz", "Spain", "LB"],
    ["Guillermo Ochoa Mexico", "G. Mexico", "Mexico", "GK"],
    ["Christian Bassogog Cameroon", "C. Cameroon", "Cameroon", "RW"],
    ["Alexander Bernhardsson", "A. Bernhardsson", "Germany", "RW"],
    ["Angel Gomes Lille", "A. Lille", "France", "CM"],
    ["Charlie Cresswell", "C. Cresswell", "France", "CB"],
    ["Grant-Leon Ranos", "G. Ranos", "Armenia", "ST"],
    ["Matteo Ruggeri Atalanta", "M. Atalanta", "Italy", "LB"],
    ["Yassine Benzia Algeria", "Y. Algeria", "Algeria", "CAM"],
    ["Senne Lynen", "S. Lynen", "Germany", "CDM"],
    ["Wahbi Khazri Tunisia", "W. Tunisia", "Tunisia", "CAM"],
    ["Lassine Sinayoko Mali", "L. Mali", "Mali", "ST"],
    ["Paulo Diaz River", "P. River", "Argentina", "CB"],
    ["Mohamed Magdy Afsha", "M. Afsha", "Egypt", "CAM"],
    ["Malik Tillman USA", "M. USA", "USA", "CAM"],
    ["Amad Diallo CIV", "A. CIV", "Ivory Coast", "RW"],
    ["Bruno Ecuele Manga", "B. Manga", "Gabon", "CB"],
    ["Borja Iglesias Celta", "B. Celta", "Spain", "ST"],
    ["Karim Konate Salzburg", "K. Salzburg", "Austria", "ST"],
    ["Nicolas Tagliafico Lyon", "N. Lyon", "France", "LB"],
    ["Amaury Escoto", "A. Escoto", "Mexico", "CB"],
    ["Richie Laryea Canada", "R. Canada", "Canada", "RB"],
    ["Ibrahim Sulemana Ghana", "I. Ghana", "Ghana", "CM"],
    ["Kevin Mbabu", "K. Mbabu", "Switzerland", "RB"],
    ["Evidence Makgopa", "E. Makgopa", "South Africa", "ST"],
    ["Luis Sinisterra Colombia", "L. Colombia", "Colombia", "LW"],
    ["Gustavo Sa", "G. Sa", "Portugal", "CM"],
    ["Nasser Al-Omran Ettifaq", "N. Ettifaq", "Saudi Arabia", "CB"],
    ["Mathias De Amorim", "M. De Amorim", "Portugal", "CM"],
    ["David Strelec", "D. Strelec", "Slovakia", "ST"],
    ["Moussa Dembele", "M. Dembele", "Saudi Arabia", "ST"],
    ["Onur Bulut", "O. Bulut", "Turkey", "RM"],
    ["Maxime Busi", "M. Busi", "France", "RB"],
    ["Mohammed Salisu Ghana", "M. Ghana", "Ghana", "CB"],
    ["Andreas Weimann", "A. Weimann", "Austria", "ST"],
    ["Zion Suzuki Japan", "Z. Japan", "Japan", "GK"],
    ["Eray Comert", "E. Comert", "Spain", "CB"],
    ["Frank Magri Cameroon", "F. Cameroon", "Cameroon", "ST"],
    ["Esperance Amanallah Memmiche", "E. Memmiche", "Tunisia", "GK"],
    ["Ola Aina Nigeria", "O. Nigeria", "Nigeria", "RB"],
    ["Malik Tillman PSV", "M. PSV", "Netherlands", "CAM"],
    ["Max Crocombe", "M. Crocombe", "New Zealand", "GK"],
    ["Gyrano Kerk", "G. Kerk", "Belgium", "RW"],
    ["Mohammed Al-Yami Ahli", "M. Ahli", "Saudi Arabia", "GK"],
    ["Nizar Al-Rashdan", "N. Al-Rashdan", "Jordan", "CDM"],
    ["Angus Gunn Jr", "A. Jr", "England", "GK"],
    ["Toronto Federico Bernardeschi", "T. Bernardeschi", "USA", "RW"],
    ["Joan Garcia", "J. Garcia", "Spain", "GK"],
    ["Jonathan Osorio Toronto", "J. Toronto", "USA", "CM"],
    ["Liberato Cacace NZ", "L. NZ", "New Zealand", "LB"],
    ["Luka Lochoshvili", "L. Lochoshvili", "Georgia", "CB"],
    ["Felix Beijmo", "F. Beijmo", "Denmark", "RB"],
    ["Omid Alishah", "O. Alishah", "Iran", "LW"],
    ["Kasey McAteer", "K. McAteer", "England", "RW"],
    ["Alexis Sanchez Udinese", "A. Udinese", "Italy", "ST"],
    ["Piotr Zielinski Poland", "P. Poland", "Poland", "CM"],
    ["Alexander Dominguez", "A. Dominguez", "Ecuador", "GK"],
    ["Renato Steffen", "R. Steffen", "Switzerland", "RW"],
    ["Ludovic Ajorque", "L. Ajorque", "France", "ST"],
    ["Lee Myung-jae Korea", "L. Korea", "South Korea", "LB"],
    ["Weston McKennie Juve", "W. Juve", "Italy", "CM"],
    ["Hwang Ui-jo Korea", "H. Korea", "South Korea", "ST"],
    ["Ryan Fraser Jr", "R. Jr", "England", "LW"],
    ["Marcus Edwards Sporting", "M. Sporting", "Portugal", "RW"],
    ["Patrick Dorgu Denmark", "P. Denmark", "Denmark", "LB"],
    ["Jasper Cillessen", "J. Cillessen", "Spain", "GK"],
    ["Karim Boudiaf Qatar", "K. Qatar", "Qatar", "CDM"],
    ["Nicolas Hofler", "N. Hofler", "Germany", "CDM"],
    ["Kristian Eriksen", "K. Eriksen", "Norway", "ST"],
    ["Abdoul Tapsoba", "A. Tapsoba", "Burkina Faso", "ST"],
    ["Can Keles", "C. Keles", "Turkey", "LW"],
    ["Dominik Schmid", "D. Schmid", "Switzerland", "LB"],
    ["Ernest Nuamah Ghana", "E. Ghana", "Ghana", "RW"],
    ["Yussuf Poulsen Denmark", "Y. Denmark", "Denmark", "ST"],
    ["Isak Hien Atalanta", "I. Atalanta", "Italy", "CB"],
    ["Lloyd Palun", "L. Palun", "Gabon", "RB"],
    ["Ernest Muci Albania", "E. Albania", "Albania", "LW"],
    ["Anthony Contreras", "A. Contreras", "Costa Rica", "ST"],
    ["Alireza Beiranvand Iran", "A. Iran", "Iran", "GK"],
    ["Jose Castillo", "J. Castillo", "Mexico", "LB"],
    ["Adam Le Fondre", "A. Le Fondre", "Australia", "ST"],
    ["Viktor Gyokeres Sweden", "V. Sweden", "Sweden", "ST"],
    ["Hamza Khabba", "H. Khabba", "Morocco", "ST"],
    ["Michel Vlap", "M. Vlap", "Netherlands", "CAM"],
    ["Georgi Dzhikiya", "G. Dzhikiya", "Russia", "CB"],
    ["Mamadou Lamine Camara3", "M. Camara3", "Mali", "CM"],
    ["Damian Diaz", "D. Diaz", "Ecuador", "CAM"],
    ["Zan Celar Slovenia", "Z. Slovenia", "Slovenia", "ST"],
    ["Takuma Asano Japan", "T. Japan", "Japan", "RW"],
    ["Felix Correia", "F. Correia", "Portugal", "LW"],
    ["Illia Zabarnyi Jr", "I. Jr", "England", "CB"],
    ["Chicago Hugo Cuypers", "C. Cuypers", "USA", "ST"],
    ["Otar Kakabadze", "O. Kakabadze", "Georgia", "RB"],
    ["Marko Arnautovic Austria", "M. Austria", "Austria", "ST"],
    ["Juraj Kucka", "J. Kucka", "Slovakia", "CM"],
    ["Ioannis Pittas", "I. Pittas", "Sweden", "ST"],
    ["Kamil Grabara Copenhagen", "K. Copenhagen", "Denmark", "GK"],
    ["Jakov Medic", "J. Medic", "Germany", "CB"],
    ["Ahmed Aboul Fotouh Ahly", "A. Ahly", "Egypt", "LB"],
    ["Norbert Gyomber", "N. Gyomber", "Slovakia", "CB"],
    ["Joel Ordonez Brugge", "J. Brugge", "Belgium", "CB"],
    ["Luis Malagon Mexico", "L. Mexico", "Mexico", "GK"],
    ["Lazaro", "Lazaro", "Brazil", "LW"],
    ["Kaique Rocha", "K. Rocha", "Brazil", "CB"],
    ["Rahul Bheke", "R. Bheke", "India", "RB"],
    ["Hussein El Shahat Ahly", "H. El Shahat Ahly", "Egypt", "RW"],
    ["Arne Engels", "A. Engels", "Germany", "CM"],
    ["Santos Gabriel Brazao", "S. Brazao", "Brazil", "GK"],
    ["Meschack Elia", "M. Elia", "DR Congo", "RW"],
    ["Eduardo Vargas Galo", "E. Galo", "Brazil", "ST"],
    ["Timi Elsnik", "T. Elsnik", "Slovenia", "CM"],
    ["Manuel Akanji Swiss", "M. Swiss", "Switzerland", "CB"],
    ["Jim Allevinah", "J. Allevinah", "Gabon", "LW"],
    ["Piero Quispe Pumas", "P. Pumas", "Mexico", "CAM"],
    ["Fredrik Bjorkan", "F. Bjorkan", "Norway", "LB"],
    ["Pape Diong", "P. Diong", "France", "CM"],
    ["Marash Kumbulla Albania", "M. Albania", "Albania", "CB"],
    ["Gregore", "Gregore", "Brazil", "CDM"],
    ["Robin Hack", "R. Hack", "Germany", "LW"],
    ["Georgios Kyriakopoulos", "G. Kyriakopoulos", "Italy", "LB"],
    ["Martin Vitik", "M. Vitik", "Czech Republic", "CB"],
    ["Rodrigo Rodrigues", "R. Rodrigues", "Tunisia", "ST"],
    ["Armin Gigovic", "A. Gigovic", "Germany", "CDM"],
    ["Brandon Borrello Australia", "B. Australia", "Australia", "RW"],
    ["Pablo Solari River", "P. River", "Argentina", "RW"],
    ["Jeroen Zoet", "J. Zoet", "Netherlands", "GK"],
    ["Houston Hector Herrera", "H. Herrera", "USA", "CM"],
    ["Brice Maubleu", "B. Maubleu", "France", "GK"],
    ["Maximiliano Salas", "M. Salas", "Argentina", "ST"],
    ["Jean-Noel Amonome", "J. Amonome", "Gabon", "GK"],
    ["Yvan Neyou", "Y. Neyou", "Spain", "CDM"],
    ["Kevin Danso Austria", "K. Austria", "Austria", "CB"],
    ["Nicolo Savona", "N. Savona", "Italy", "RB"],
    ["Pohang Jeon Min-gwang", "P. Min-gwang", "South Korea", "CB"],
    ["Franjo Ivanovic", "F. Ivanovic", "Belgium", "ST"],
    ["Alexander Djiku Fener", "A. Fener", "Turkey", "CB"],
    ["Anibal Moreno", "A. Moreno", "Brazil", "CDM"],
    ["Denis Vavro", "D. Vavro", "Slovakia", "CB"],
    ["Javier Mendez", "J. Mendez", "Uruguay", "CB"],
    ["Nemanja Stojic", "N. Stojic", "Serbia", "CB"],
    ["Yangel Herrera Venezuela", "Y. Venezuela", "Venezuela", "CM"],
    ["Cameron Puertas", "C. Puertas", "Belgium", "CAM"],
    ["Willy Semedo", "W. Semedo", "Cape Verde", "ST"],
    ["Devis Epassy Cameroon", "D. Cameroon", "Cameroon", "GK"],
    ["Giorgi Gvelesiani", "G. Gvelesiani", "Georgia", "CB"],
    ["Mattia Bottani", "M. Bottani", "Switzerland", "CAM"],
    ["Danil Krugovoy", "D. Krugovoy", "Russia", "LB"],
    ["Marcos Senesi Jr", "M. Jr", "England", "CB"],
    ["Anthony Caci", "A. Caci", "Germany", "LB"],
    ["Patrik Schick Czech", "P. Czech", "Czech Republic", "ST"],
    ["Young Boys David von Ballmoos", "Y. David von Ballmoos", "Switzerland", "GK"],
    ["Ismail Yuksek", "I. Yuksek", "Turkey", "CDM"],
    ["Nonato", "Nonato", "Brazil", "CM"],
    ["Josip Misic", "J. Misic", "Croatia", "CM"],
    ["Wesley Said", "W. Said", "France", "ST"],
    ["Baghdad Bounedjah Sadd", "B. Sadd", "Qatar", "ST"],
    ["Shakhtar Dmytro Riznyk", "S. Riznyk", "Ukraine", "GK"],
    ["James Justin", "J. Justin", "England", "RB"],
    ["Adalberto Carrasquilla", "A. Carrasquilla", "Panama", "CM"],
    ["Adam Marusic Montenegro", "A. Montenegro", "Montenegro", "RB"],
    ["Tommy Smith", "T. Smith", "New Zealand", "CB"],
    ["Daniel Gazdag Philly", "D. Philly", "USA", "CAM"],
    ["Odilon Kossounou CIV", "O. CIV", "Ivory Coast", "CB"],
    ["Christopher Wooh Cameroon", "C. Cameroon", "Cameroon", "CB"],
    ["Salih Ozcan Dortmund", "S. Dortmund", "Germany", "CDM"],
    ["Tanguy Coulibaly", "T. Coulibaly", "France", "LW"],
    ["Duncan McGuire", "D. McGuire", "USA", "ST"],
    ["Leganes Marko Dmitrovic Jr", "L. Jr", "Spain", "GK"],
    ["Sofiane Boufal Union", "S. Union", "Belgium", "LW"],
    ["Elias Achouri Tunisia", "E. Tunisia", "Tunisia", "LW"],
    ["Nehuen Perez Porto", "N. Porto", "Portugal", "CB"],
    ["Ole Romeny", "O. Romeny", "Netherlands", "ST"],
    ["Oliver Torres", "O. Torres", "Mexico", "CM"],
    ["Kristijan Jakic", "K. Jakic", "Germany", "CDM"],
    ["Carles Perez", "C. Perez", "Spain", "RW"],
    ["Universidad Catolica Sebastian Perez", "U. Perez", "Chile", "GK"],
    ["Samu Costa Jr", "S. Jr", "Spain", "CDM"],
    ["Fisayo Dele-Bashiru Nigeria", "F. Nigeria", "Nigeria", "CM"],
    ["Jacob Widell Zetterstrom", "J. Zetterstrom", "Sweden", "GK"],
    ["Martin Odegaard", "M. Odegaard", "Norway", "CAM"],
    ["Carlos Martinez", "C. Martinez", "Costa Rica", "RB"],
    ["Juan Cabal", "J. Cabal", "Italy", "CB"],
    ["Haris Tabakovic", "H. Tabakovic", "Bosnia and Herzegovina", "ST"],
    ["Andraz Sporar Slovenia", "A. Slovenia", "Slovenia", "ST"],
    ["Jesus Orozco", "J. Orozco", "Mexico", "CB"],
    ["Martin Erlic", "M. Erlic", "Italy", "CB"],
    ["Stefan Savic Montenegro", "S. Montenegro", "Montenegro", "CB"],
    ["Yunus Musah USA", "Y. USA", "USA", "CM"],
    ["Matt O'Riley Jr", "M. Jr", "England", "CM"],
    ["Fisayo Dele-Bashiru Lazio", "F. Lazio", "Italy", "CM"],
    ["Jordy Makengo", "J. Makengo", "Germany", "LB"],
    ["Michele Cerofolini", "M. Cerofolini", "Italy", "GK"],
    ["Jean-Philippe Mateta Jr", "J. Jr", "England", "ST"],
    ["Omri Gandelman", "O. Gandelman", "Belgium", "CM"],
    ["Fabricio Bustos", "F. Bustos", "Argentina", "RB"],
    ["Lukas Kalvach", "L. Kalvach", "Czech Republic", "CDM"],
    ["Kian Fitz-Jim Ajax", "K. Ajax", "Netherlands", "CM"],
    ["Diego Medina", "D. Medina", "Bolivia", "CB"],
    ["Loum Tchaouna", "L. Tchaouna", "Italy", "RW"],
    ["Oussama Idrissi Pachuca", "O. Pachuca", "Mexico", "LW"],
    ["Domagoj Vida", "D. Vida", "Greece", "CB"],
    ["Aubrey Modiba", "A. Modiba", "South Africa", "LB"],
    ["Caio Henrique Monaco", "C. Monaco", "France", "LB"],
    ["Dimitry Bertaud", "D. Bertaud", "France", "GK"],
    ["Alianza Lima Angelo Campos", "A. Campos", "Peru", "GK"],
    ["Ahmed Hassan Kouka Zamalek", "A. Zamalek", "Egypt", "ST"],
    ["Morato", "Morato", "England", "CB"],
    ["Lameck Banda Zambia", "L. Zambia", "Zambia", "LW"],
    ["Diego Rossi Columbus", "D. Columbus", "USA", "LW"],
    ["Matisse Samoise", "M. Samoise", "Belgium", "RB"],
    ["Lawrence Ennali", "L. Ennali", "Poland", "RW"],
    ["Majed Hassan UAE", "M. UAE", "United Arab Emirates", "CDM"],
    ["Felix Torres Santos", "F. Santos", "Mexico", "CB"],
    ["Hicham Boudaoui Nice", "H. Nice", "France", "CM"],
    ["Daniel Podence", "D. Podence", "Greece", "LW"],
    ["Oscar Fraulo", "O. Fraulo", "Netherlands", "CM"],
    ["Andre Trindade Jr", "A. Jr", "England", "CDM"],
    ["Chidera Ejuke Sevilla", "C. Sevilla", "Spain", "LW"],
    ["Jonathan Buatu", "J. Buatu", "Angola", "CB"],
    ["Ivan Ilic Serbia", "I. Serbia", "Serbia", "CM"],
    ["Gilberto Sepulveda", "G. Sepulveda", "Mexico", "CB"],
    ["Gornik Zabrze Daniel Bielica", "G. Bielica", "Poland", "GK"],
    ["Assane Diao Senegal", "A. Senegal", "Senegal", "RW"],
    ["Andrey Santos Strasbourg", "A. Strasbourg", "France", "CM"],
    ["Kaan Kairinen Finland", "K. Finland", "Finland", "CM"],
    ["Marco Sala", "M. Sala", "Italy", "LB"],
    ["Yahia Fofana CIV", "Y. CIV", "Ivory Coast", "GK"],
    ["Sadiq Umar2", "S. Umar2", "Nigeria", "ST"],
    ["Zhang Linpeng", "Z. Linpeng", "China", "CB"],
    ["Hamad Al-Yami Ahli", "H. Ahli", "Saudi Arabia", "CB"],
    ["Volodymyr Brazhko", "V. Brazhko", "Ukraine", "CM"],
    ["Marc Vidal", "M. Vidal", "Spain", "GK"],
    ["Ellyes Skhiri Tunisia", "E. Tunisia", "Tunisia", "CDM"],
    ["Lennard Maloney", "L. Maloney", "Germany", "CDM"],
    ["Mory Diaw Le Havre", "M. Diaw Le Havre", "France", "GK"],
    ["Konstantinos Tsimikas", "K. Tsimikas", "Greece", "LB"],
    ["Johan Vasquez Mexico", "J. Mexico", "Mexico", "CB"],
    ["Brian Olivan", "B. Olivan", "Spain", "LB"],
    ["Harold Preciado", "H. Preciado", "Mexico", "ST"],
    ["James Rodriguez Colombia", "J. Colombia", "Colombia", "CAM"],
    ["Bram Nuytinck", "B. Nuytinck", "Netherlands", "CB"],
    ["Pape Matar Sarr Senegal", "P. Senegal", "Senegal", "CM"],
    ["Gunay Guvenc", "G. Guvenc", "Turkey", "GK"],
    ["Axel Tuanzebe", "A. Tuanzebe", "England", "RB"],
    ["Martin Dubravka", "M. Dubravka", "England", "GK"],
    ["Federico Baschirotto", "F. Baschirotto", "Italy", "CB"],
    ["Carlo Boukhalfa", "C. Boukhalfa", "Germany", "CM"],
    ["Folarin Balogun USA", "F. USA", "USA", "ST"],
    ["Scott McKenna FCK", "S. FCK", "Denmark", "CB"],
    ["Vitor Reis", "V. Reis", "Brazil", "CB"],
    ["Cheick Conde", "C. Conde", "Switzerland", "CDM"],
    ["Bologna Lukasz Skorupski", "B. Skorupski", "Italy", "GK"],
    ["Sultan Al-Ghannam Nassr", "S. Nassr", "Saudi Arabia", "RB"],
    ["Adrian Martinez", "A. Martinez", "Argentina", "ST"],
    ["Jean-Pierre Nsame YB", "J. YB", "Switzerland", "ST"],
    ["Marcinho", "Marcinho", "Japan", "LW"],
    ["Di'Shon Bernard Jamaica", "D. Jamaica", "Jamaica", "CB"],
    ["Robin Lod", "R. Lod", "Finland", "CAM"],
    ["Guus Til PSV", "G. PSV", "Netherlands", "CAM"],
    ["Erling Haaland Norway", "E. Norway", "Norway", "ST"],
    ["Pathe Ciss Senegal", "P. Senegal", "Senegal", "CDM"],
    ["Juan Fernando Quintero", "J. Quintero", "Argentina", "CAM"],
    ["Lucas Ribeiro", "L. Ribeiro", "South Africa", "CAM"],
    ["Percy Tau South Africa", "P. Africa", "South Africa", "RW"],
    ["Bilal El Khannouss Genk", "B. El Khannouss Genk", "Belgium", "CAM"],
    ["Semih Kilicsoy", "S. Kilicsoy", "Turkey", "ST"],
    ["Enes Unal Jr", "E. Jr", "England", "ST"],
    ["Alex Telles Botafogo", "A. Botafogo", "Brazil", "LB"],
    ["Kenneth Taylor Ajax", "K. Ajax", "Netherlands", "CM"],
    ["Jose Palomino Cagliari", "J. Cagliari", "Italy", "CB"],
    ["Naim Sliti Tunisia", "N. Tunisia", "Tunisia", "LW"],
    ["Pierluigi Gollini Roma", "P. Roma", "Italy", "GK"],
    ["Jaydee Canvot", "J. Canvot", "France", "CB"],
    ["Ahmed Sayed Zizo Zamalek", "A. Zamalek", "Egypt", "RW"],
    ["Stephan El Shaarawy Roma", "S. El Shaarawy Roma", "Italy", "LW"],
    ["Wilfried Singo Monaco", "W. Monaco", "France", "RB"],
    ["John Yeboah", "J. Yeboah", "Ecuador", "RW"],
    ["Milos Veljkovic", "M. Veljkovic", "Serbia", "CB"],
    ["Thomas Kristensen", "T. Kristensen", "Italy", "CB"],
    ["Ulrik Saltnes", "U. Saltnes", "Norway", "CM"],
    ["Yan Sasse", "Y. Sasse", "Tunisia", "LW"],
    ["Carlos Baleba Cameroon", "C. Cameroon", "Cameroon", "CDM"],
    ["Paxten Aaronson USA", "P. USA", "USA", "CAM"],
    ["Ulisses Garcia Swiss", "U. Swiss", "Switzerland", "LB"],
    ["Gustavo del Prete", "G. del Prete", "Mexico", "ST"],
    ["George Puscas", "G. Puscas", "Romania", "ST"],
    ["Ousmane Diao", "O. Diao", "Denmark", "CB"],
    ["Christian Gunter", "C. Gunter", "Germany", "LB"],
    ["Alexander Sorloth Sweden", "A. Sweden", "Sweden", "ST"],
    ["Tomas Vlcek Slavia", "T. Slavia", "Czech Republic", "CB"],
    ["Andre Blake Jamaica", "A. Jamaica", "Jamaica", "GK"],
    ["Qazim Laci Albania", "Q. Albania", "Albania", "CM"],
    ["Jose Gragera", "J. Gragera", "Spain", "CDM"],
    ["Taha Ali", "T. Ali", "Sweden", "LW"],
    ["Leo Ostigard", "L. Ostigard", "France", "CB"],
    ["Esquivel", "Esquivel", "Brazil", "LB"],
    ["Samuel Chukwueze Milan", "S. Milan", "Italy", "RW"],
    ["Shogo Taniguchi Japan", "S. Japan", "Japan", "CB"],
    ["Arnor Traustason", "A. Traustason", "Iceland", "CM"],
    ["Dominik Szoboszlai Hungary", "D. Hungary", "Hungary", "CAM"],
    ["Jesper Karlsson", "J. Karlsson", "Italy", "LW"],
    ["Ibrahima Kone", "I. Kone", "Mali", "ST"],
    ["Arijanet Muric Kosovo", "A. Kosovo", "Kosovo", "GK"],
    ["Alexis Vega Mexico", "A. Mexico", "Mexico", "LW"],
    ["Michail Antonio Jamaica", "M. Jamaica", "Jamaica", "ST"],
    ["Yeltsin Tejeda", "Y. Tejeda", "Costa Rica", "CDM"],
    ["Jonathan Calleri", "J. Calleri", "Brazil", "ST"],
    ["Keylor Navas Costa Rica", "K. Rica", "Costa Rica", "GK"],
    ["Betim Fazliji", "B. Fazliji", "Kosovo", "CDM"],
    ["Fernando Pacheco", "F. Pacheco", "Spain", "GK"],
    ["Goncalo Guedes", "G. Guedes", "England", "LW"],
    ["Sverrir Ingason", "S. Ingason", "Iceland", "CB"],
    ["Joris Kayembe Genk", "J. Genk", "Belgium", "LB"],
    ["Marshall Munetsi", "M. Munetsi", "France", "CM"],
    ["Oumar Diakite Reims", "O. Reims", "France", "ST"],
    ["Milos Kerkez Bournemouth", "M. Bournemouth", "England", "LB"],
    ["David Jurasek", "D. Jurasek", "Germany", "LB"],
    ["Iker Bravo", "I. Bravo", "Italy", "ST"],
    ["Ludwig Augustinsson Anderlecht", "L. Anderlecht", "Belgium", "LB"],
    ["Enzo Perez Estudiantes", "E. Estudiantes", "Argentina", "CDM"],
    ["Johann Gudmundsson", "J. Gudmundsson", "Iceland", "CM"],
    ["Nahuel Tenaglia", "N. Tenaglia", "Spain", "RB"],
    ["Vahan Bichakhchyan", "V. Bichakhchyan", "Armenia", "LW"],
    ["Tommaso Baldanzi Roma", "T. Roma", "Italy", "CAM"],
    ["Alexis Claude-Maurice", "A. Claude-Maurice", "Germany", "RW"],
    ["Abdullah Al-Mayouf", "A. Al-Mayouf", "Saudi Arabia", "GK"],
    ["Ignacio Rivero", "I. Rivero", "Mexico", "CM"],
    ["Joseph Paintsil LA", "J. Paintsil LA", "USA", "LW"],
    ["Aaron Hickey Jr", "A. Jr", "England", "RB"],
    ["Giorgi Mamardashvili Georgia", "G. Georgia", "Georgia", "GK"],
    ["Faris Moumbagna OM", "F. OM", "France", "ST"],
    ["Chris Wood NZ", "C. NZ", "New Zealand", "ST"],
    ["Mukhtar Ali Nassr", "M. Nassr", "Saudi Arabia", "CM"],
    ["Ferreira", "Ferreira", "Brazil", "LW"],
    ["Krepin Diatta Senegal", "K. Senegal", "Senegal", "RW"],
    ["Mauricio", "Mauricio", "Brazil", "CAM"],
    ["Said Benrahma Lyon", "S. Lyon", "France", "LW"],
    ["Adam Masina Torino", "A. Torino", "Italy", "CB"],
    ["Alessio Cragno Verona", "A. Verona", "Italy", "GK"],
    ["Luis Sinisterra Bournemouth", "L. Bournemouth", "England", "LW"],
    ["Luis Cardenas", "L. Cardenas", "Mexico", "GK"],
    ["Nikolai Alho", "N. Alho", "Finland", "RB"],
    ["Valentin Rosier", "V. Rosier", "Spain", "RB"],
    ["Etoile Youssef Abdelli", "E. Abdelli", "Tunisia", "ST"],
    ["Joseph Paintsil Ghana", "J. Ghana", "Ghana", "LW"],
    ["Pontus Jansson", "P. Jansson", "Sweden", "CB"],
    ["Mika Biereth", "M. Biereth", "Austria", "ST"],
    ["Julio Enciso Paraguay", "J. Paraguay", "Paraguay", "CAM"],
    ["Manuel Ugarte Uruguay", "M. Uruguay", "Uruguay", "CDM"],
    ["Romelu Lukaku Napoli", "R. Napoli", "Italy", "ST"],
    ["Martin Erlic Croatia", "M. Croatia", "Croatia", "CB"],
    ["Borja Mayoral", "B. Mayoral", "Spain", "ST"],
    ["Abdulaziz Hatem Qatar", "A. Qatar", "Qatar", "CM"],
    ["Lautaro Giannetti", "L. Giannetti", "Italy", "CB"],
    ["Cesar Huerta Pumas", "C. Pumas", "Mexico", "LW"],
    ["Jean Butez", "J. Butez", "Italy", "GK"],
    ["Vitinha Genoa", "V. Genoa", "Italy", "ST"],
    ["Wu Lei", "W. Lei", "China", "ST"],
    ["Dinko Horkas", "D. Horkas", "Spain", "GK"],
    ["Ross Sykes", "R. Sykes", "Belgium", "CB"],
    ["Fizo Ramadan", "F. Ramadan", "Egypt", "CAM"],
    ["Ritsu Doan Japan", "R. Japan", "Japan", "RW"],
    ["Manuel Locatelli Juve", "M. Juve", "Italy", "CDM"],
    ["Hugo Magnetti", "H. Magnetti", "France", "CDM"],
    ["Hussain Al-Qahtani Shabab", "H. Shabab", "Saudi Arabia", "RM"],
    ["Ivan Perisic PSV", "I. PSV", "Netherlands", "LW"],
    ["Mostafa Mohamed Nantes2", "M. Nantes2", "Egypt", "ST"],
    ["Rennes Steve Mandanda", "R. Mandanda", "France", "GK"],
    ["Takashi Usami", "T. Usami", "Japan", "CAM"],
    ["Adam Dzwigala", "A. Dzwigala", "Germany", "CB"],
    ["Pontus Almqvist", "P. Almqvist", "Italy", "RW"],
    ["Claudio Ramos Porto", "C. Porto", "Portugal", "GK"],
    ["Enrico Delprato", "E. Delprato", "Italy", "CB"],
    ["Bryan Cristante Roma", "B. Roma", "Italy", "CDM"],
    ["Mehdi Taremi Iran", "M. Iran", "Iran", "ST"],
    ["Felipe Anderson Palmeiras", "F. Palmeiras", "Brazil", "RW"],
    ["Youssef Msakni Tunisia", "Y. Tunisia", "Tunisia", "LW"],
    ["Strahinja Pavlovic Serbia", "S. Serbia", "Serbia", "CB"],
    ["Mirlind Daku", "M. Daku", "Albania", "ST"],
    ["Zeno Van den Bosch", "Z. Van den Bosch", "Belgium", "CB"],
    ["Daniel Arzani Australia", "D. Australia", "Australia", "LW"],
    ["Carles Alena", "C. Alena", "Spain", "CM"],
    ["Jonathan Osorio Canada", "J. Canada", "Canada", "CM"],
    ["Emiliano Amor", "E. Amor", "Chile", "CB"],
    ["Cieran Slicker", "C. Slicker", "England", "GK"],
    ["Internacional Rochet Inter", "I. Inter", "Brazil", "GK"],
    ["Carmelo Algaranaz", "C. Algaranaz", "Bolivia", "ST"],
    ["Mason Greenwood", "M. Greenwood", "France", "RW"],
    ["Alan Minda", "A. Minda", "Ecuador", "LW"],
    ["Jon Aramburu Venezuela", "J. Venezuela", "Venezuela", "RB"],
    ["Kevin Castano Colombia", "K. Colombia", "Colombia", "CM"],
    ["Wataru Endo Japan", "W. Japan", "Japan", "CDM"],
    ["Jean-Philippe Gbamin", "J. Gbamin", "Saudi Arabia", "CDM"],
    ["Zhu Chenjie", "Z. Chenjie", "China", "CB"],
    ["Caleb Okoli", "C. Okoli", "England", "CB"],
    ["Logan Costa Cape Verde", "L. Verde", "Cape Verde", "CB"],
    ["Igor Vekic", "I. Vekic", "Slovenia", "GK"],
    ["Konyaspor Adil Demirbag", "K. Demirbag", "Turkey", "CB"],
    ["Martin Payero", "M. Payero", "Italy", "CM"],
    ["Joaquin Piquerez Uruguay", "J. Uruguay", "Uruguay", "LB"],
    ["Kevin Mier", "K. Mier", "Colombia", "GK"],
    ["Ajdin Hrustic Australia", "A. Australia", "Australia", "CAM"],
    ["Rapid Niklas Hedl Rapid", "R. Rapid", "Austria", "GK"],
    ["Boulaye Dia Senegal", "B. Senegal", "Senegal", "ST"],
    ["Diego Lainez Mexico", "D. Mexico", "Mexico", "RW"],
    ["Maxim", "Maxim", "Turkey", "CAM"],
    ["Danny da Costa", "D. da Costa", "Germany", "RB"],
    ["Tomas Soucek Czech", "T. Czech", "Czech Republic", "CM"],
    ["Miroslav Stevanovic", "M. Stevanovic", "Switzerland", "RW"],
    ["Enzo Tchato", "E. Tchato", "France", "RB"],
    ["Clement Lenglet Atletico", "C. Atletico", "Spain", "CB"],
    ["Aaron Appindangoye", "A. Appindangoye", "Gabon", "CB"],
    ["Roberto Alvarado Chivas", "R. Chivas", "Mexico", "LW"],
    ["Habib Diarra Senegal", "H. Senegal", "Senegal", "CM"],
    ["Shuichi Gonda Japan", "S. Japan", "Japan", "GK"],
    ["Michael Ngadeu Cameroon", "M. Cameroon", "Cameroon", "CB"],
    ["Maxence Lacroix Jr", "M. Jr", "England", "CB"],
    ["Emil Kornvig", "E. Kornvig", "Norway", "CM"],
    ["Facundo Pellistri Pana", "F. Pana", "Greece", "RW"],
    ["Mateusz Skrzypczak", "M. Skrzypczak", "Poland", "CB"],
    ["Rally Bwalya", "R. Bwalya", "Zambia", "CAM"],
    ["Casa Pia Patrick Sequeira", "C. Sequeira", "Portugal", "GK"],
    ["Gabriel Charpentier", "G. Charpentier", "Italy", "ST"],
    ["Adam Obert Slovakia", "A. Slovakia", "Slovakia", "LB"],
    ["Matteo Cancellieri", "M. Cancellieri", "Italy", "RW"],
    ["NEC Jasper Cillessen NEC", "N. NEC", "Netherlands", "GK"],
    ["Meshaal Barsham Qatar", "M. Qatar", "Qatar", "GK"],
    ["Oumar Diakite CIV", "O. CIV", "Ivory Coast", "ST"],
    ["Alexander Schlager", "A. Schlager", "Austria", "GK"],
    ["Hernan Galindez Ecuador", "H. Ecuador", "Ecuador", "GK"],
    ["Elias Olafsson Iceland", "E. Iceland", "Iceland", "GK"],
    ["Zini", "Zini", "Angola", "ST"],
    ["Marten de Roon Atalanta", "M. de Roon Atalanta", "Italy", "CDM"],
    ["Jefferson Lerma Colombia", "J. Colombia", "Colombia", "CDM"],
    ["Ismael Saibari Morocco", "I. Morocco", "Morocco", "CM"],
    ["Cherif Ndiaye Senegal", "C. Senegal", "Senegal", "ST"],
    ["Beto", "Beto", "England", "ST"],
    ["Kevin Csoboth", "K. Csoboth", "Hungary", "LW"],
    ["Celta Vicente Guaita Jr", "C. Jr", "Spain", "GK"],
    ["Christian Norgaard", "C. Norgaard", "England", "CDM"],
    ["Rokas Pukstas", "R. Pukstas", "Croatia", "CM"],
    ["Jefferson Lerma Palace", "J. Palace", "England", "CDM"],
    ["Rafa Marin", "R. Marin", "Italy", "CB"],
    ["Tim Kleindienst Gladbach", "T. Gladbach", "Germany", "ST"],
    ["Valentin Atangana", "V. Atangana", "France", "CDM"],
    ["Ulises Ortegoza", "U. Ortegoza", "Argentina", "CM"],
    ["Tamerlan Musaev", "T. Musaev", "Russia", "ST"],
    ["Ivan Kalyuzhnyi", "I. Kalyuzhnyi", "Ukraine", "CM"],
    ["Mexx Meerdink", "M. Meerdink", "Netherlands", "ST"],
    ["Pedro Zenit", "P. Zenit", "Russia", "RW"],
    ["Boulaye Dia Lazio", "B. Lazio", "Italy", "ST"],
    ["Luigi Sepe", "L. Sepe", "Italy", "GK"],
    ["Allan Saint-Maximin", "A. Saint-Maximin", "Turkey", "LW"],
    ["Jorge Rodriguez", "J. Rodriguez", "Mexico", "CDM"],
    ["Mandela Keita", "M. Keita", "Italy", "CDM"],
    ["Mats Hummels Roma", "M. Roma", "Italy", "CB"],
    ["Emil Breivik", "E. Breivik", "Norway", "CM"],
    ["Dylan Batubinsika", "D. Batubinsika", "France", "CB"],
    ["Legia Kacper Tobiasz", "L. Tobiasz", "Poland", "GK"],
    ["Dara O'Shea Ipswich", "D. Ipswich", "England", "CB"],
    ["Luis Perez", "L. Perez", "Spain", "RB"],
    ["Amir Abedzadeh Iran", "A. Iran", "Iran", "GK"],
    ["Hugo", "Hugo", "Brazil", "LB"],
    ["Osama Faisal Pyramids", "O. Pyramids", "Egypt", "ST"],
    ["Vitor Bueno", "V. Bueno", "Mexico", "CAM"],
    ["Pavel Kaderabek", "P. Kaderabek", "Germany", "RB"],
    ["Tomoaki Makino", "T. Makino", "Japan", "CB"],
    ["Marino Hinestroza", "M. Hinestroza", "Colombia", "LW"],
    ["Celso Borges", "C. Borges", "Costa Rica", "CM"],
    ["Leon Avdullahu", "L. Avdullahu", "Switzerland", "CDM"],
    ["Martim Fernandes", "M. Fernandes", "Portugal", "RB"],
    ["Carlos Rotondi", "C. Rotondi", "Mexico", "LW"],
    ["Hugo Moura", "H. Moura", "Brazil", "CDM"],
    ["Magnus Eriksson", "M. Eriksson", "Sweden", "CAM"],
    ["Maximiliano Meza Monterrey", "M. Monterrey", "Mexico", "RW"],
    ["Bersant Celina", "B. Celina", "Sweden", "CAM"],
    ["Omid Ebrahimi Iran", "O. Iran", "Iran", "CDM"],
    ["Diego Rossi Uruguay", "D. Uruguay", "Uruguay", "ST"],
    ["Tim Payne", "T. Payne", "New Zealand", "RB"],
    ["Givairo Read", "G. Read", "Netherlands", "RB"],
    ["Ko Itakura Gladbach", "K. Gladbach", "Germany", "CB"],
    ["Max Bruns", "M. Bruns", "Netherlands", "CB"],
    ["Wendell Porto", "W. Porto", "Portugal", "LB"],
    ["America Jorge Soto", "A. Soto", "Colombia", "GK"],
    ["Anwar Ali", "A. Ali", "India", "CB"],
    ["Bruno Duarte", "B. Duarte", "Serbia", "ST"],
    ["Leonardo Pavoletti Cagliari", "L. Cagliari", "Italy", "ST"],
    ["Dario Osorio Chile", "D. Chile", "Chile", "RW"],
    ["Arrascaeta Flamengo", "A. Flamengo", "Brazil", "CAM"],
    ["Paulinho Toluca", "P. Toluca", "Mexico", "ST"],
    ["Nasser Djiga", "N. Djiga", "Serbia", "CB"],
    ["Eduardo Salvio", "E. Salvio", "Argentina", "RW"],
    ["Andrea Carboni Venezia", "A. Venezia", "Italy", "CB"],
    ["Kaio Jorge", "K. Jorge", "Brazil", "ST"],
    ["Odilon Kossounou Atalanta", "O. Atalanta", "Italy", "CB"],
    ["Ben Old", "B. Old", "France", "LW"],
    ["Sotirios Papagiannopoulos", "S. Papagiannopoulos", "Sweden", "CB"],
    ["Hakon Valdimarsson", "H. Valdimarsson", "England", "GK"],
    ["Ion Nicolaescu", "I. Nicolaescu", "Netherlands", "ST"],
    ["Sergej Milinkovic-Savic Hilal", "S. Hilal", "Saudi Arabia", "CM"],
    ["Alexsandro Ribeiro Lille", "A. Lille", "France", "CB"],
    ["Levan Shengelia", "L. Shengelia", "Georgia", "LW"],
    ["Gonzalo Plata Ecuador", "G. Ecuador", "Ecuador", "RW"],
    ["Abdelkader Bedrane Algeria", "A. Algeria", "Algeria", "CB"],
    ["Tomas Vaclik", "T. Vaclik", "Czech Republic", "GK"],
    ["Fernando Beltran", "F. Beltran", "Mexico", "CM"],
    ["Joao Cancelo Hilal", "J. Hilal", "Saudi Arabia", "RB"],
    ["Hugo Marques", "H. Marques", "Angola", "GK"],
    ["Carlos Palacios", "C. Palacios", "Chile", "CAM"],
    ["Thorgan Hazard Anderlecht", "T. Anderlecht", "Belgium", "LW"],
    ["Abdoulaye Toure", "A. Toure", "France", "CM"],
    ["Reda Slim", "R. Slim", "Morocco", "LW"],
    ["Patrick Sequeira Costa Rica", "P. Rica", "Costa Rica", "GK"],
    ["Ange-Yoan Bonny", "A. Bonny", "Italy", "ST"],
    ["Sylla Ndiaye", "S. Ndiaye", "Spain", "ST"],
    ["Craig Goodwin Australia", "C. Australia", "Australia", "LW"],
    ["Michael Gregoritsch Austria", "M. Austria", "Austria", "ST"],
    ["Ahmed Al-Ghamdi", "A. Al-Ghamdi", "Saudi Arabia", "CM"],
    ["Joe Lumley", "J. Lumley", "England", "GK"],
    ["LASK Tobias Lawal", "L. Lawal", "Austria", "GK"],
    ["Albert Gudmundsson", "A. Gudmundsson", "Italy", "CAM"],
    ["Wolfsburg Kamil Grabara Wolfsburg", "W. Wolfsburg", "Germany", "GK"],
    ["Munir Mohamedi Morocco", "M. Morocco", "Morocco", "GK"],
    ["Tarek Salman Qatar", "T. Qatar", "Qatar", "CB"],
    ["Oscar Rodriguez", "O. Rodriguez", "Spain", "CAM"],
    ["Vincent Janssen Antwerp", "V. Antwerp", "Belgium", "ST"],
    ["Andre Ramalho", "A. Ramalho", "Brazil", "CB"],
    ["Alvaro Fernandez Sevilla", "A. Sevilla", "Spain", "GK"],
    ["Alex Kral", "A. Kral", "Spain", "CM"],
    ["Saul Coco", "S. Coco", "Spain", "CB"],
    ["Abdullah Al-Hamdan Hilal", "A. Hilal", "Saudi Arabia", "ST"],
    ["Gerrit Holtmann", "G. Holtmann", "Germany", "LW"],
    ["Milton Casco River", "M. River", "Argentina", "LB"],
    ["Junior Alonso", "J. Alonso", "Brazil", "CB"],
    ["Remo Freuler Swiss", "R. Swiss", "Switzerland", "CM"],
    ["Robert Ivanov", "R. Ivanov", "Finland", "CB"],
    ["Loic Nego", "L. Nego", "Hungary", "RB"],
    ["Jacopo Fazzini Empoli", "J. Empoli", "Italy", "CM"],
    ["Alaa Bellaarouch", "A. Bellaarouch", "France", "GK"],
    ["Javier Hernandez", "J. Hernandez", "Mexico", "ST"],
    ["Wout Faes Jr", "W. Jr", "England", "CB"],
    ["Kevin Lopez", "K. Lopez", "Honduras", "LB"],
    ["Pachuca Carlos Moreno", "P. Moreno", "Mexico", "GK"],
    ["Piero Quispe", "P. Quispe", "Peru", "CAM"],
    ["Lewis Ferguson Bologna", "L. Bologna", "Italy", "CM"],
    ["Yusuf Kabadayi", "Y. Kabadayi", "Germany", "LW"],
    ["Bashar Resan Iraq", "B. Iraq", "Iraq", "CM"],
    ["Christopher Trimmel", "C. Trimmel", "Germany", "RB"],
    ["Roberto Alvarado Mexico", "R. Mexico", "Mexico", "LW"],
    ["Dany Mota", "D. Mota", "Italy", "ST"],
    ["Petros Mantalos", "P. Mantalos", "Greece", "CAM"],
    ["Keisuke Osako Japan", "K. Japan", "Japan", "GK"],
    ["Raniele", "Raniele", "Brazil", "CDM"],
    ["Toni Fruk", "T. Fruk", "Croatia", "CAM"],
    ["Batista Mendy", "B. Mendy", "Turkey", "CDM"],
    ["Kike Salas", "K. Salas", "Spain", "CB"],
    ["Sergi Cardona", "S. Cardona", "Spain", "LB"],
    ["Zito Luvumbo Cagliari", "Z. Cagliari", "Italy", "LW"],
    ["Paulo Gazzaniga Jr", "P. Jr", "Spain", "GK"],
    ["Alanyaspor Ui-jo Hwang Alanya", "A. Alanya", "Turkey", "ST"],
    ["Raoul Bellanova Atalanta", "R. Atalanta", "Italy", "RB"],
    ["Lukas Lerager", "L. Lerager", "Denmark", "CM"],
    ["Kevin Mbabu FCM", "K. FCM", "Denmark", "RB"],
    ["Theo Bongonda", "T. Bongonda", "DR Congo", "LW"],
    ["Omar Traore", "O. Traore", "Germany", "RB"],
    ["Santiago Hezze", "S. Hezze", "Greece", "CDM"],
    ["Andres Fernandez", "A. Fernandez", "Spain", "GK"],
    ["Terem Moffi Nigeria", "T. Nigeria", "Nigeria", "ST"],
    ["Tim Ream USA", "T. USA", "USA", "CB"],
    ["Razvan Sava", "R. Sava", "Italy", "GK"],
    ["Arouca Ignacio Fontan", "A. Fontan", "Portugal", "GK"],
    ["Lasse Nielsen", "L. Nielsen", "Sweden", "CB"],
    ["Zakaria Aboukhlal Morocco", "Z. Morocco", "Morocco", "RW"],
    ["Leonardo Sequeira", "L. Sequeira", "Uruguay", "ST"],
    ["Mallorca Dominik Greif Jr", "M. Jr", "Spain", "GK"],
    ["Ederson Atalanta", "E. Atalanta", "Italy", "CM"],
    ["Morten Hjulmand Denmark", "M. Denmark", "Denmark", "CDM"],
    ["Strasbourg Djordje Petrovic Strasbourg", "S. Strasbourg", "France", "GK"],
    ["Tim Weah USA", "T. USA", "USA", "RW"],
    ["Kim Seung-gyu Korea", "K. Korea", "South Korea", "GK"],
    ["Cristian Gamboa", "C. Gamboa", "Germany", "RB"],
    ["Jannik Vestergaard Denmark", "J. Denmark", "Denmark", "CB"],
    ["Andre Carrillo", "A. Carrillo", "Brazil", "RW"],
    ["Anatoliy Trubin Ukraine", "A. Ukraine", "Ukraine", "GK"],
    ["Dusan Vlahovic", "D. Vlahovic", "Italy", "ST"],
    ["Ronald Araujo Uruguay", "R. Uruguay", "Uruguay", "CB"],
    ["Gustavo Gomez Palmeiras", "G. Palmeiras", "Brazil", "CB"],
    ["Steve Mounie", "S. Mounie", "Germany", "ST"],
    ["Kingsley Coman Nassr", "K. Nassr", "Saudi Arabia", "RW"],
    ["Tiago Silva", "T. Silva", "Portugal", "CM"],
    ["Ferran Jutgla Brugge", "F. Brugge", "Belgium", "ST"],
    ["Edwin Cardona", "E. Cardona", "Colombia", "CAM"],
    ["Lukas Daschner", "L. Daschner", "Germany", "CAM"],
    ["Jani Atanasov", "J. Atanasov", "North Macedonia", "CM"],
    ["Quilindschy Hartman Feyenoord", "Q. Feyenoord", "Netherlands", "LB"],
    ["Morten Thorsby Norway", "M. Norway", "Norway", "CM"],
    ["Guillermo Maripan Torino", "G. Torino", "Italy", "CB"],
    ["Tomas Aviles", "T. Aviles", "USA", "CB"],
    ["Moises Caicedo", "M. Caicedo", "Ecuador", "CDM"],
    ["Amadou Diawara", "A. Diawara", "Guinea", "CDM"],
    ["Adam Armstrong Jr", "A. Jr", "England", "ST"],
    ["Juan Brunetta Santos", "J. Santos", "Mexico", "CAM"],
    ["Seydouba Cisse Guinea", "S. Guinea", "Guinea", "CM"],
    ["Reo Hatate Japan", "R. Japan", "Japan", "CM"],
    ["Otero", "Otero", "Brazil", "RW"],
    ["Ivan Marcone", "I. Marcone", "Argentina", "CDM"],
    ["Koki Machida Japan", "K. Japan", "Japan", "CB"],
    ["Erik Thommy", "E. Thommy", "USA", "CAM"],
    ["Yasir Al-Shahrani Fateh", "Y. Fateh", "Saudi Arabia", "LB"],
    ["Duvan Vergara", "D. Vergara", "Colombia", "LW"],
    ["Grant Kekana", "G. Kekana", "South Africa", "CB"],
    ["Khalid Eisa UAE", "K. UAE", "United Arab Emirates", "GK"],
    ["Ismail Saibari2", "I. Saibari2", "Morocco", "CM"],
    ["Edson Alvarez Mexico", "E. Mexico", "Mexico", "CDM"],
    ["Marcos Lopez", "M. Lopez", "Peru", "LB"],
    ["Wajdi Kechrida Tunisia", "W. Tunisia", "Tunisia", "RB"],
    ["Ahmed Alaaeldin Qatar", "A. Qatar", "Qatar", "RW"],
    ["Pierre Kunde Cameroon", "P. Cameroon", "Cameroon", "CM"],
    ["Fredrik Aursnes Norway", "F. Norway", "Norway", "CM"],
    ["Rafal Augustyniak", "R. Augustyniak", "Poland", "CDM"],
    ["Andrea Petagna", "A. Petagna", "Italy", "ST"],
    ["Karim Konate CIV", "K. CIV", "Ivory Coast", "ST"],
    ["Ermedin Demirovic Bosnia", "E. Bosnia", "Bosnia and Herzegovina", "ST"],
    ["Devyne Rensch Ajax", "D. Ajax", "Netherlands", "RB"],
    ["Florentino Luis Benfica", "F. Benfica", "Portugal", "CDM"],
    ["Falcao", "Falcao", "Colombia", "ST"],
    ["Eray Comert Swiss", "E. Swiss", "Switzerland", "CB"],
    ["Vitaliy Buyalskyi", "V. Buyalskyi", "Ukraine", "CAM"],
    ["Leandro Gonzalez Pirez", "L. Pirez", "Argentina", "CB"],
    ["Ryan Mendes", "R. Mendes", "Cape Verde", "RW"],
    ["Percy Tau Ahly", "P. Ahly", "Egypt", "RW"],
    ["Brajan Gruda", "B. Gruda", "England", "CAM"],
    ["Denis Zakaria Swiss", "D. Swiss", "Switzerland", "CDM"],
    ["Ricardo Rodriguez Swiss", "R. Swiss", "Switzerland", "LB"],
    ["Adnan Januzaj", "A. Januzaj", "Spain", "RW"],
    ["Kannemann", "Kannemann", "Brazil", "CB"],
    ["Goncalo Inacio Sporting", "G. Sporting", "Portugal", "CB"],
    ["Elkeson", "Elkeson", "China", "ST"],
    ["Ondrej Lingr Feyenoord", "O. Feyenoord", "Netherlands", "CAM"],
    ["Bertug Yildirim", "B. Yildirim", "Spain", "ST"],
    ["Karim Fouad Ahly", "K. Ahly", "Egypt", "CB"],
    ["Roberto Gagliardini", "R. Gagliardini", "Italy", "CDM"],
    ["Umut Tohumcu", "U. Tohumcu", "Germany", "CM"],
    ["Magomed Ozdoev", "M. Ozdoev", "Greece", "CM"],
    ["Sergio Barreto", "S. Barreto", "Argentina", "CB"],
    ["Hong Jeong-ho", "H. Jeong-ho", "South Korea", "CB"],
    ["Andreas Pereira Fulham", "A. Fulham", "England", "CAM"],
    ["Nikola Krstovic2", "N. Krstovic2", "Serbia", "ST"],
    ["Ibrahim Dresevic", "I. Dresevic", "Kosovo", "CB"],
    ["Islam Slimani Algeria", "I. Algeria", "Algeria", "ST"],
    ["Manuel Lazzari Lazio", "M. Lazio", "Italy", "RB"],
    ["Nathan Zeze", "N. Zeze", "France", "CB"],
    ["Agustin Almendra", "A. Almendra", "Argentina", "CM"],
    ["Morten Frendrup", "M. Frendrup", "Italy", "CM"],
    ["Cristobal Campos Chile", "C. Chile", "Chile", "GK"],
    ["Oleksandr Svatok", "O. Svatok", "Ukraine", "CB"],
    ["Abdallah Al-Fakhouri", "A. Al-Fakhouri", "Jordan", "GK"],
    ["Atlanta Brad Guzan", "A. Guzan", "USA", "GK"],
    ["Tasos Douvikas", "T. Douvikas", "Greece", "ST"],
    ["Julian Brandt Dortmund", "J. Dortmund", "Germany", "CAM"],
    ["Youssef El Fahli", "Y. El Fahli", "Morocco", "ST"],
    ["Toni Martinez", "T. Martinez", "Spain", "ST"],
    ["Mattia Zaccagni Lazio", "M. Lazio", "Italy", "LW"],
    ["Olympiacos Ayoub El Kaabi Oly", "O. Ayoub El Kaabi Oly", "Greece", "ST"],
    ["Sebastian Caceres Uruguay", "S. Uruguay", "Uruguay", "CB"],
    ["Ricardo Horta Braga", "R. Braga", "Portugal", "LW"],
    ["Bryan Mbeumo Brentford", "B. Brentford", "England", "RW"],
    ["Andres Andrade", "A. Andrade", "Panama", "CB"],
    ["Albert Gudmundsson Iceland", "A. Iceland", "Iceland", "CAM"],
    ["Matheus Doria", "M. Doria", "Mexico", "CB"],
    ["Gabriel Barbosa Flamengo", "G. Flamengo", "Brazil", "ST"],
    ["Ruben Vargas Swiss", "R. Swiss", "Switzerland", "LW"],
    ["Robin Hranac", "R. Hranac", "Germany", "CB"],
    ["Hakon Haraldsson Lille", "H. Lille", "France", "CAM"],
    ["Ngal'ayel Mukau", "N. Mukau", "France", "CM"],
    ["Luis Diaz Colombia", "L. Colombia", "Colombia", "LW"],
    ["Anthony Jung", "A. Jung", "Germany", "CB"],
    ["Aidan Morris USA", "A. USA", "USA", "CM"],
    ["Alexander Sorloth Norway", "A. Norway", "Norway", "ST"],
    ["Franco Armani River", "F. River", "Argentina", "GK"],
    ["Karl Toko Ekambi Cameroon", "K. Cameroon", "Cameroon", "LW"],
    ["Couhaib Driouech PSV", "C. PSV", "Netherlands", "RW"],
    ["Krzysztof Piatek", "K. Piatek", "Turkey", "ST"],
    ["Lukas Haraslin Slovakia", "L. Slovakia", "Slovakia", "LW"],
    ["Harry Souttar Australia", "H. Australia", "Australia", "CB"],
    ["Pawel Dawidowicz", "P. Dawidowicz", "Italy", "CB"],
    ["Antonio Sivera", "A. Sivera", "Spain", "GK"],
    ["Georginio Rutter Jr", "G. Jr", "England", "CAM"],
    ["Vitaliy Mykolenko Ukraine", "V. Ukraine", "Ukraine", "LB"],
    ["Lucas Perri Brazil", "L. Brazil", "Brazil", "GK"],
    ["Seiya Maikuma", "S. Maikuma", "Netherlands", "RB"],
    ["Giorgio Scalvini Atalanta", "G. Atalanta", "Italy", "CB"],
    ["Angel Sepulveda", "A. Sepulveda", "Mexico", "ST"],
    ["Thapelo Maseko", "T. Maseko", "South Africa", "LW"],
    ["Nair Tiknizyan", "N. Tiknizyan", "Russia", "LB"],
    ["Gabriel Xavier", "G. Xavier", "Brazil", "CB"],
    ["Ahmed Reda Tagnaouti Wydad", "A. Wydad", "Morocco", "GK"],
    ["Johan Bakayoko PSV", "J. PSV", "Netherlands", "RW"],
    ["Dani Raba", "D. Raba", "Spain", "CAM"],
    ["Max Gradel CIV", "M. CIV", "Ivory Coast", "LW"],
    ["Filip Uremovic", "F. Uremovic", "Croatia", "CB"],
    ["Leo Vaisanen", "L. Vaisanen", "Finland", "CB"],
    ["Maximo Perrone", "M. Perrone", "Italy", "CDM"],
    ["Amin Bukhari", "A. Bukhari", "Saudi Arabia", "GK"],
    ["Matias Catalan", "M. Catalan", "Argentina", "CB"],
    ["Club Africain Ghaith Wahabi", "C. Wahabi", "Tunisia", "ST"],
    ["Lukas Hradecky Finland", "L. Finland", "Finland", "GK"],
    ["Cristian Medina Estudiantes", "C. Estudiantes", "Argentina", "CM"],
    ["Rick Karsdorp PSV", "R. PSV", "Netherlands", "RB"],
    ["Mario Pasalic Atalanta", "M. Atalanta", "Italy", "CM"],
    ["Christos Tzolis Brugge", "C. Brugge", "Belgium", "LW"],
    ["Keno", "Keno", "Brazil", "LW"],
    ["Jhon Duran Colombia", "J. Colombia", "Colombia", "ST"],
    ["Stefan Ristovski", "S. Ristovski", "North Macedonia", "RB"],
    ["David Hancko Slovakia", "D. Slovakia", "Slovakia", "CB"],
    ["Jordan Larsson", "J. Larsson", "Denmark", "ST"],
    ["Sergio Gonzalez", "S. Gonzalez", "Spain", "CB"],
    ["Berat Djimsiti Albania", "B. Albania", "Albania", "CB"],
    ["David Zima Slavia", "D. Slavia", "Czech Republic", "CB"],
    ["Junior Sornoza", "J. Sornoza", "Ecuador", "CAM"],
    ["Gabriel Paulista", "G. Paulista", "Turkey", "CB"],
    ["Josip Juranovic Croatia", "J. Croatia", "Croatia", "RB"],
    ["Salvatore Sirigu", "S. Sirigu", "Italy", "GK"],
    ["Istanbul Basaksehir Deniz Turuc", "I. Turuc", "Turkey", "CAM"],
    ["Arthur Theate Rennes", "A. Rennes", "France", "CB"],
    ["Viktor Gyokeres Sporting", "V. Sporting", "Portugal", "ST"],
    ["Patrick Agyemang", "P. Agyemang", "USA", "ST"],
    ["Lukasz Skorupski Poland", "L. Poland", "Poland", "GK"],
    ["Oussama Targhalline Le Havre", "O. Targhalline Le Havre", "France", "CDM"],
    ["Alberto Moleiro", "A. Moleiro", "Spain", "CAM"],
    ["Oier Zarraga", "O. Zarraga", "Italy", "CM"],
    ["Jorge Sanchez Mexico", "J. Mexico", "Mexico", "RB"],
    ["Edoardo Goldaniga", "E. Goldaniga", "Italy", "CB"],
    ["Sebastian Nanasi Malmo", "S. Malmo", "Sweden", "LW"],
    ["Andreas Schjelderup Norway", "A. Norway", "Norway", "LW"],
    ["Mohammed Muntari Qatar", "M. Qatar", "Qatar", "ST"],
    ["Franco Israel Uruguay", "F. Uruguay", "Uruguay", "GK"],
    ["Seattle Stefan Frei", "S. Frei", "USA", "GK"],
    ["Morgan Guilavogui Guinea", "M. Guinea", "Guinea", "ST"],
    ["Aleksandar Mitrovic Hilal", "A. Hilal", "Saudi Arabia", "ST"],
    ["Stevan Jovetic", "S. Jovetic", "Montenegro", "ST"],
    ["Michal Sadilek", "M. Sadilek", "Netherlands", "CM"],
    ["Ivan Schranz Slovakia", "I. Slovakia", "Slovakia", "RW"],
    ["Fabian Balbuena", "F. Balbuena", "Paraguay", "CB"],
    ["Dante Nice", "D. Nice", "France", "CB"],
    ["Matias Palacios", "M. Palacios", "United Arab Emirates", "CAM"],
    ["Lumbardh Dellova", "L. Dellova", "Kosovo", "CB"],
    ["Alvaro Zamora", "A. Zamora", "Costa Rica", "LW"],
    ["Petar Ratkov Serbia", "P. Serbia", "Serbia", "ST"],
    ["Alex Iwobi Nigeria", "A. Nigeria", "Nigeria", "CM"],
    ["Benedikt Pichler", "B. Pichler", "Germany", "ST"],
    ["Parma Zion Suzuki Parma", "P. Parma", "Italy", "GK"],
    ["Raul Rangel Mexico", "R. Mexico", "Mexico", "GK"],
    ["Alfon Gonzalez", "A. Gonzalez", "Spain", "LW"],
    ["Yahya Nader UAE", "Y. UAE", "United Arab Emirates", "CM"],
    ["Mohamed Bayo Guinea", "M. Guinea", "Guinea", "ST"],
    ["Frank Onyeka Augsburg", "F. Augsburg", "Germany", "CM"],
    ["Bertrand Traore Ajax", "B. Ajax", "Netherlands", "RW"],
    ["Javi Puado", "J. Puado", "Spain", "ST"],
    ["Aymen Dahmen Tunisia", "A. Tunisia", "Tunisia", "GK"],
    ["Eddie Afonso", "E. Afonso", "Angola", "LB"],
    ["Aitor Fernandez Real", "A. Real", "Spain", "GK"],
    ["Jerome Opoku", "J. Opoku", "Turkey", "CB"],
    ["Marcel Ruiz Mexico", "M. Mexico", "Mexico", "CM"],
    ["Ernest Nuamah Lyon", "E. Lyon", "France", "RW"],
    ["Ladislav Krejci Czech", "L. Czech", "Czech Republic", "CB"],
    ["Kim Min-jae Korea", "K. Korea", "South Korea", "CB"],
    ["Wilfried Singo CIV", "W. CIV", "Ivory Coast", "RB"],
    ["Isaac Price Standard", "I. Standard", "Belgium", "CM"],
    ["Erik Jorgens UAE", "E. UAE", "United Arab Emirates", "CB"],
    ["Andy Delort Algeria", "A. Algeria", "Algeria", "ST"],
    ["Marcel Ruiz Toluca", "M. Toluca", "Mexico", "CM"],
    ["Kaiki", "Kaiki", "Brazil", "LB"],
    ["Bobby De Cordova-Reid Jamaica", "B. De Cordova-Reid Jamaica", "Jamaica", "CAM"],
    ["Enock Mwepu", "E. Mwepu", "Zambia", "CM"],
    ["Josep Martinez", "J. Martinez", "Italy", "GK"],
    ["Orlando Mosquera", "O. Mosquera", "Panama", "GK"],
    ["Marwan Attia Ahly", "M. Ahly", "Egypt", "CDM"],
    ["Nkosinathi Sibisi", "N. Sibisi", "South Africa", "CB"],
    ["Alexandros Paschalakis", "A. Paschalakis", "Greece", "GK"],
    ["Merchas Doski", "M. Doski", "Iraq", "CB"],
    ["Sydney FC Andrew Redmayne", "S. Redmayne", "Australia", "GK"],
    ["Martin Boyle Australia", "M. Australia", "Australia", "RW"],
    ["Mujaid Sadick Genk", "M. Genk", "Belgium", "CB"],
    ["Teji Savanier", "T. Savanier", "France", "CAM"],
    ["Jorge Carrascal Colombia", "J. Colombia", "Colombia", "CAM"],
    ["Michael Svoboda", "M. Svoboda", "Italy", "CB"],
    ["Matheuzinho", "Matheuzinho", "Brazil", "RB"],
    ["Ryan Yates Jr", "R. Jr", "England", "CM"],
    ["Nikola Vujnovic", "N. Vujnovic", "Montenegro", "CB"],
    ["Sergei Pinyaev", "S. Pinyaev", "Russia", "LW"],
    ["Mauricio Isla Chile", "M. Chile", "Chile", "RB"],
    ["San Lorenzo Gaston Gomez", "S. Gomez", "Argentina", "GK"],
    ["Gautier Lloris", "G. Lloris", "France", "CB"],
    ["Robin Olsen Sweden", "R. Sweden", "Sweden", "GK"],
    ["Ugochukwu Iwu", "U. Iwu", "Armenia", "CDM"],
    ["Jordan Siebatcheu", "J. Siebatcheu", "Germany", "ST"],
    ["Dennis Man Romania", "D. Romania", "Romania", "RW"],
    ["Mabululu", "Mabululu", "Angola", "ST"],
    ["Diant Ramaj Ajax", "D. Ajax", "Netherlands", "GK"],
    ["Kees Smit", "K. Smit", "Netherlands", "CM"],
    ["Leopold Querfeld", "L. Querfeld", "Austria", "CB"],
    ["Mathias Dyngeland", "M. Dyngeland", "Norway", "GK"],
    ["Jhon Janer Lucumi", "J. Lucumi", "Colombia", "CB"],
    ["Predrag Rajkovic Serbia", "P. Serbia", "Serbia", "GK"],
    ["Jean-Ricner Bellegarde Angers", "J. Angers", "France", "CAM"],
    ["Jorge Sanchez Cruz Azul", "J. Azul", "Mexico", "RB"],
    ["Cedric Bakambu DRC", "C. DRC", "DR Congo", "ST"],
    ["Frank Onyeka Nigeria", "F. Nigeria", "Nigeria", "CM"],
    ["Ylber Ramadani Albania", "Y. Albania", "Albania", "CDM"],
    ["Edo Kayembe", "E. Kayembe", "DR Congo", "CM"],
    ["Maximilian Wittek", "M. Wittek", "Germany", "LB"],
    ["Jesper Karlstrom Sweden", "J. Sweden", "Sweden", "CDM"],
    ["Ipswich Leif Davis", "I. Davis", "England", "LB"],
    ["Marc Kempf", "M. Kempf", "Italy", "CB"],
    ["Diego Valdes Chile", "D. Chile", "Chile", "CAM"],
    ["Rey Manaj Albania", "R. Albania", "Albania", "ST"],
    ["Yerson Mosquera", "Y. Mosquera", "England", "CB"],
    ["Mostafa Shobeir Ahly", "M. Ahly", "Egypt", "GK"],
    ["Filip Kostic Serbia", "F. Serbia", "Serbia", "LM"],
    ["Moise Bombito Canada", "M. Canada", "Canada", "CB"],
    ["Berke Ozer", "B. Ozer", "Turkey", "GK"],
    ["Franco Cervi", "F. Cervi", "Spain", "LW"],
    ["Tomas Suslov Slovakia", "T. Slovakia", "Slovakia", "CAM"],
    ["Gladbach Moritz Nicolas", "G. Nicolas", "Germany", "GK"],
    ["Amine Adli Morocco", "A. Morocco", "Morocco", "LW"],
    ["Cameron Burgess Australia", "C. Australia", "Australia", "CB"],
    ["Noa Lang PSV", "N. PSV", "Netherlands", "LW"],
    ["Rubens", "Rubens", "Brazil", "LB"],
    ["Marius Bulter", "M. Bulter", "Germany", "ST"],
    ["Emiliano Marcondes", "E. Marcondes", "England", "CAM"],
    ["Maxi Gomez Uruguay", "M. Uruguay", "Uruguay", "ST"],
    ["Twente Lars Unnerstall Twente", "T. Twente", "Netherlands", "GK"],
    ["Stephen Eustaquio Canada", "S. Canada", "Canada", "CM"],
    ["Rafael Carioca", "R. Carioca", "Mexico", "CDM"],
    ["Andre Fluminense", "A. Fluminense", "Brazil", "CDM"],
    ["Nicolas Pepe Villarreal", "N. Villarreal", "Spain", "RW"],
    ["Tommaso Pobega Bologna", "T. Bologna", "Italy", "CM"],
    ["Hamza Rafia Tunisia", "H. Tunisia", "Tunisia", "CAM"],
    ["Alistair Johnston Canada", "A. Canada", "Canada", "RB"],
    ["Philip Billing Jr", "P. Jr", "England", "CM"],
    ["Israel Reyes Mexico", "I. Mexico", "Mexico", "CB"],
    ["Weverton Palmeiras", "W. Palmeiras", "Brazil", "GK"],
    ["Saidou Sow Strasbourg", "S. Strasbourg", "France", "CB"],
    ["Diego Reyes", "D. Reyes", "Mexico", "CB"],
    ["Brandon Fernandes", "B. Fernandes", "India", "CAM"],
    ["Pascal Gross Dortmund", "P. Dortmund", "Germany", "CM"],
    ["Gijs Smal", "G. Smal", "Netherlands", "LB"],
    ["Kamory Doumbia Mali", "K. Mali", "Mali", "CAM"],
    ["Anderson Lopes", "A. Lopes", "Japan", "ST"],
    ["Vedat Muriqi Kosovo", "V. Kosovo", "Kosovo", "ST"],
    ["Andres Vombergar", "A. Vombergar", "Argentina", "ST"],
    ["Lubambo Musonda", "L. Musonda", "Zambia", "RB"],
    ["Nermin Zolotic", "N. Zolotic", "Portugal", "CB"],
    ["Ruben Pena", "R. Pena", "Spain", "RB"],
    ["Angel Correa Jr", "A. Jr", "Spain", "ST"],
    ["Will Smallbone Jr", "W. Jr", "England", "CM"],
    ["Zapelli", "Zapelli", "Brazil", "CAM"],
    ["Guela Doue Strasbourg", "G. Strasbourg", "France", "RB"],
    ["Cerezo Kim Jin-hyeon", "C. Jin-hyeon", "Japan", "GK"],
    ["Amir Murillo", "A. Murillo", "France", "RB"],
    ["Lukas Kubler", "L. Kubler", "Germany", "RB"],
    ["Ferraresi", "Ferraresi", "Brazil", "CB"],
    ["Bruno Guimaraes Jr", "B. Jr", "England", "CM"],
    ["Vancouver Ryan Gauld Vancouver", "V. Vancouver", "USA", "CAM"],
    ["Martin Hongla Cameroon", "M. Cameroon", "Cameroon", "CDM"],
    ["David Moller Wolfe Norway", "D. Norway", "Norway", "LB"],
    ["Mehdi Ghayedi Esteghlal", "M. Esteghlal", "Iran", "LW"],
    ["Lars Unnerstall", "L. Unnerstall", "Netherlands", "GK"],
    ["Aaron Ramsdale Southampton", "A. Southampton", "England", "GK"],
    ["Moussa Niakhate Senegal", "M. Senegal", "Senegal", "CB"],
    ["Takefusa Kubo Japan", "T. Japan", "Japan", "RW"],
    ["Sven Kums", "S. Kums", "Belgium", "CDM"],
    ["Evan Ndicka Roma", "E. Roma", "Italy", "CB"],
    ["Terem Moffi Nice", "T. Nice", "France", "ST"],
    ["Romell Quioto", "R. Quioto", "Honduras", "ST"],
    ["Paul Nebel", "P. Nebel", "Germany", "RW"],
    ["Luiz Henrique Botafogo", "L. Botafogo", "Brazil", "RW"],
    ["Ilias Chair Morocco", "I. Morocco", "Morocco", "CAM"],
    ["Janis Blaswich Salzburg", "J. Salzburg", "Austria", "GK"],
    ["Enric Llansana", "E. Llansana", "Netherlands", "CDM"],
    ["Scott McTominay Napoli", "S. Napoli", "Italy", "CM"],
    ["Marcin Bulka Poland", "M. Poland", "Poland", "GK"],
    ["Baghdad Bounedjah Algeria", "B. Algeria", "Algeria", "ST"],
    ["Jeremie Boga Nice", "J. Nice", "France", "LW"],
    ["Yellu Santiago", "Y. Santiago", "Spain", "CB"],
    ["Zakaria Sanogo", "Z. Sanogo", "Burkina Faso", "LW"],
    ["Kialonda Gaspar Angola", "K. Angola", "Angola", "CB"],
    ["Matz Sels Forest", "M. Forest", "England", "GK"],
    ["Kayserispor Miguel Cardoso", "K. Cardoso", "Turkey", "LW"],
    ["Piero Hincapie", "P. Hincapie", "Germany", "CB"],
    ["Andi Zeqiri Standard", "A. Standard", "Belgium", "ST"],
    ["Romain Del Castillo", "R. Del Castillo", "France", "RW"],
    ["Jaminton Campaz Colombia", "J. Colombia", "Colombia", "LW"],
    ["Mohamed Tougai Algeria", "M. Algeria", "Algeria", "CB"],
    ["Alvaro Valles Real", "A. Real", "Spain", "GK"],
    ["Jack Harrison Jr", "J. Jr", "England", "RW"],
    ["Srdjan Babic", "S. Babic", "Serbia", "CB"],
    ["Marko Livaja Hajduk", "M. Hajduk", "Croatia", "ST"],
    ["Yanis Hamache", "Y. Hamache", "Algeria", "LB"],
    ["Peter Gulacsi Hungary", "P. Hungary", "Hungary", "GK"],
    ["Zenit Denis Adamov", "Z. Adamov", "Russia", "GK"],
    ["Ali Olwan", "A. Olwan", "Jordan", "ST"],
    ["Lars-Jorgen Salvesen", "L. Salvesen", "Norway", "ST"],
    ["Abdullah Madu Ittihad", "A. Ittihad", "Saudi Arabia", "CB"],
    ["Tokmac Nguen", "T. Nguen", "Sweden", "ST"],
    ["Christian Pulisic USA", "C. USA", "USA", "RW"],
    ["Karoy Anderson", "K. Anderson", "Jamaica", "CDM"],
    ["Marcus Pedersen Norway", "M. Norway", "Norway", "RB"],
    ["Caglar Soyuncu", "C. Soyuncu", "Turkey", "CB"],
    ["Philipp Sander", "P. Sander", "Germany", "CDM"],
    ["Alexandre Lacazette Lyon", "A. Lyon", "France", "ST"],
    ["Ahmed Bamsaud Ittihad", "A. Ittihad", "Saudi Arabia", "LB"],
    ["Rahim Ali", "R. Ali", "India", "ST"],
    ["Teun Koopmeiners Juve", "T. Juve", "Italy", "CAM"],
    ["Rosenborg Sander Tangvik", "R. Tangvik", "Norway", "GK"],
    ["Fernando Tapia", "F. Tapia", "Mexico", "GK"],
    ["Djene Dakonam", "D. Dakonam", "Spain", "CB"],
    ["Matias Fernandez-Pardo Lille", "M. Lille", "France", "LW"],
    ["Gedeon Kalulu", "G. Kalulu", "DR Congo", "RB"],
    ["Mahmoud Saber", "M. Saber", "Egypt", "CM"],
    ["Jan Oblak Slovenia", "J. Slovenia", "Slovenia", "GK"],
    ["Amadou Kone", "A. Kone", "France", "RB"],
    ["Elvis Rexhbecaj", "E. Rexhbecaj", "Germany", "CM"],
    ["Vito van Crooij", "V. van Crooij", "Netherlands", "RW"],
    ["Axel Tuanzebe DRC", "A. DRC", "DR Congo", "CB"],
    ["Konstantinos Mavropanos Greece", "K. Greece", "Greece", "CB"],
    ["Enzo Perez River", "E. River", "Argentina", "CDM"],
    ["Zinedine Ferhat", "Z. Ferhat", "France", "RW"],
    ["Yannick Carrasco Shabab", "Y. Shabab", "Saudi Arabia", "LW"],
    ["Adam Smith Jr", "A. Jr", "England", "RB"],
    ["Igor Lichnovsky Chile", "I. Chile", "Chile", "CB"],
    ["Jesus Ferreira Dallas", "J. Dallas", "USA", "ST"],
    ["Nabil Emad Dunga Zamalek", "N. Zamalek", "Egypt", "CDM"],
    ["Moussa Camara", "M. Camara", "Guinea", "GK"],
    ["Wilfred Ndidi Nigeria", "W. Nigeria", "Nigeria", "CDM"],
    ["Anis Ben Slimane Tunisia", "A. Ben Slimane Tunisia", "Tunisia", "CM"],
    ["Davy Klaassen Ajax", "D. Ajax", "Netherlands", "CAM"],
    ["Lukas Podolski", "L. Podolski", "Poland", "LW"],
    ["Hans Vanaken Brugge", "H. Brugge", "Belgium", "CAM"],
    ["Ryan Flamingo PSV", "R. PSV", "Netherlands", "CB"],
    ["Christian Kouame Fiorentina", "C. Fiorentina", "Italy", "ST"],
    ["Luis Suarez Uruguay", "L. Uruguay", "Uruguay", "ST"],
    ["Alfonso Espino", "A. Espino", "Spain", "LB"],
    ["Domen Crnigoj", "D. Crnigoj", "Italy", "CM"],
    ["Ruben Neves", "R. Neves", "Saudi Arabia", "CDM"],
    ["NY Red Bulls Emil Forsberg NYRB", "N. NYRB", "USA", "CAM"],
    ["Keysher Fuller", "K. Fuller", "Costa Rica", "RB"],
    ["Lee Dong-gyeong Korea", "L. Korea", "South Korea", "CAM"],
    ["Maksim Osipenko", "M. Osipenko", "Russia", "CB"],
    ["Kasper Schmeichel Anderlecht", "K. Anderlecht", "Belgium", "GK"],
    ["Henrik Meister", "H. Meister", "France", "ST"],
    ["Amine Oudrhiri", "A. Oudrhiri", "Portugal", "CDM"],
    ["Nabil Bentaleb Lille", "N. Lille", "France", "CM"],
    ["Orri Oskarsson FCK", "O. FCK", "Denmark", "ST"],
    ["Akram Tawfik Ahly", "A. Ahly", "Egypt", "CM"],
    ["Lilian Brassier Brest", "L. Brest", "France", "CB"],
    ["Iván Balliu Albania", "I. Albania", "Albania", "RB"],
    ["Julian Malatini", "J. Malatini", "Germany", "CB"],
    ["Diogo Costa Porto", "D. Porto", "Portugal", "GK"],
    ["Enric Franquesa", "E. Franquesa", "Spain", "LB"],
    ["Ibrahima Sory Conte", "I. Conte", "Guinea", "LW"],
    ["Martin Braithwaite", "M. Braithwaite", "Spain", "ST"],
    ["Aaron Wan-Bissaka DRC", "A. DRC", "DR Congo", "RB"],
    ["Bernardo Bochum", "B. Bochum", "Germany", "CB"],
    ["Jiang Guangtai", "J. Guangtai", "China", "CB"],
    ["Jhon Arias Flu", "J. Flu", "Brazil", "RW"],
    ["Bento Brazil", "B. Brazil", "Brazil", "GK"],
    ["Andreas Skov Olsen Brugge", "A. Brugge", "Belgium", "RW"],
    ["Miha Blazic", "M. Blazic", "Slovenia", "CB"],
    ["Igor Rabello", "I. Rabello", "Brazil", "CB"],
    ["Tomas Suslov", "T. Suslov", "Italy", "CAM"],
    ["Mees Hilgers", "M. Hilgers", "Netherlands", "CB"],
    ["Gaetano Oristanio", "G. Oristanio", "Italy", "CAM"],
    ["Nantes Alban Lafont", "N. Lafont", "France", "GK"],
    ["Rebin Sulaka Iraq", "R. Iraq", "Iraq", "CB"],
    ["Vitinho Botafogo", "V. Botafogo", "Brazil", "RB"],
    ["Standard Arnaud Bodart", "S. Bodart", "Belgium", "GK"],
    ["Fred Rodrigues", "F. Rodrigues", "Turkey", "CM"],
    ["Abdelkarim Hassan Qatar", "A. Qatar", "Qatar", "LB"],
    ["Luis Suarez Miami", "L. Miami", "USA", "ST"],
    ["Mert Muldur", "M. Muldur", "Turkey", "RB"],
    ["Peque Fernandez", "P. Fernandez", "Spain", "CAM"],
    ["Luca Philipp", "L. Philipp", "Germany", "GK"],
    ["Takumi Minamino Monaco", "T. Monaco", "France", "CAM"],
    ["Elbasan Rashani", "E. Rashani", "Kosovo", "LW"],
    ["Oladapo Afolayan", "O. Afolayan", "Germany", "LW"],
    ["Alejandro Frances", "A. Frances", "Spain", "RB"],
    ["Guillermo Maripan Chile", "G. Chile", "Chile", "CB"],
    ["Nilson Angulo Ecuador", "N. Ecuador", "Ecuador", "LW"],
    ["Killian Sardella Anderlecht", "K. Anderlecht", "Belgium", "RB"],
    ["Samuel Essende", "S. Essende", "Germany", "ST"],
    ["Tom Rothe", "T. Rothe", "Germany", "LB"],
    ["Jonathan Tah Leverkusen", "J. Leverkusen", "Germany", "CB"],
    ["Jonatan Braut Brunes", "J. Brunes", "Poland", "ST"],
    ["Jaime Mata Las Palmas", "J. Palmas", "Spain", "ST"],
    ["Zlatko Tripic", "Z. Tripic", "Norway", "LW"],
    ["Berat Ozdemir", "B. Ozdemir", "Turkey", "CDM"],
    ["Illia Zabarnyi Ukraine", "I. Ukraine", "Ukraine", "CB"],
    ["Victor Boniface Leverkusen", "V. Leverkusen", "Germany", "ST"],
    ["Berkane Larbi Naji", "B. Naji", "Morocco", "CM"],
    ["Kennedy Musonda", "K. Musonda", "Zambia", "LW"],
    ["Munir El Haddadi Morocco", "M. El Haddadi Morocco", "Morocco", "ST"],
    ["Yehor Yarmolyuk", "Y. Yarmolyuk", "England", "CM"],
    ["Tigran Barseghyan", "T. Barseghyan", "Armenia", "RW"],
    ["Alex Remiro Jr", "A. Jr", "Spain", "GK"],
    ["Marwan Al-Sahafi Nassr", "M. Nassr", "Saudi Arabia", "LW"],
    ["Carlos Romero", "C. Romero", "Spain", "LB"],
    ["Lazar Samardzic Serbia", "L. Serbia", "Serbia", "CAM"],
    ["Bruma Braga", "B. Braga", "Portugal", "RW"],
    ["Mario Martin", "M. Martin", "Spain", "CDM"],
    ["Hwang Hee-chan Korea", "H. Korea", "South Korea", "RW"],
    ["Meshari Al-Nemer", "M. Al-Nemer", "Saudi Arabia", "CM"],
    ["Manu Kone Roma", "M. Roma", "Italy", "CM"],
    ["Claudio Echeverri River", "C. River", "Argentina", "CAM"],
    ["Caio Canedo UAE", "C. UAE", "United Arab Emirates", "ST"],
    ["Willy Boly CIV", "W. CIV", "Ivory Coast", "CB"],
    ["Lyon Lucas Perri Lyon", "L. Lyon", "France", "GK"],
    ["Pumas Julio Gonzalez Pumas", "P. Pumas", "Mexico", "GK"],
    ["Thiago Almada Botafogo", "T. Botafogo", "Brazil", "CAM"],
    ["Alan Franco Ecuador", "A. Ecuador", "Ecuador", "CM"],
    ["Gabriel Strefezza", "G. Strefezza", "Italy", "RW"],
    ["Yunus Akgun", "Y. Akgun", "Turkey", "RW"],
    ["Adrian Ortola", "A. Ortola", "Spain", "GK"],
    ["Granit Xhaka Swiss", "G. Swiss", "Switzerland", "CDM"],
    ["Ruslan Malinovskyi Ukraine", "R. Ukraine", "Ukraine", "CAM"],
    ["Daniel Braganca Sporting", "D. Sporting", "Portugal", "CM"],
    ["Matteo Pessina", "M. Pessina", "Italy", "CM"],
    ["Eric Ramirez", "E. Ramirez", "Venezuela", "ST"],
    ["Mohammad Mohebi Iran", "M. Iran", "Iran", "LW"],
    ["Nestory Irankunda Australia", "N. Australia", "Australia", "RW"],
    ["Ivan Ilic", "I. Ilic", "Italy", "CM"],
    ["Partizan Aleksandar Jovanovic", "P. Jovanovic", "Serbia", "GK"],
    ["Maximiliano Araujo Uruguay", "M. Uruguay", "Uruguay", "LW"],
    ["Samuel Soares Benfica", "S. Benfica", "Portugal", "GK"],
    ["Esteban Pavez", "E. Pavez", "Chile", "CDM"],
    ["Milan Mijatovic", "M. Mijatovic", "Montenegro", "GK"],
    ["Stephen Eustaquio Porto", "S. Porto", "Portugal", "CM"],
    ["Shahriyar Moghanlou Iran", "S. Iran", "Iran", "ST"],
    ["Vangelis Pavlidis Greece", "V. Greece", "Greece", "ST"],
    ["Dereck Kutesa", "D. Kutesa", "Switzerland", "LW"],
    ["Samuele Birindelli", "S. Birindelli", "Italy", "RB"],
    ["Woyo Coulibaly", "W. Coulibaly", "Italy", "RB"],
    ["Anthoni", "Anthoni", "Brazil", "GK"],
    ["Giangiacomo Magnani", "G. Magnani", "Italy", "CB"],
    ["Heerenveen Andries Noppert Heerenveen", "H. Heerenveen", "Netherlands", "GK"],
    ["Alassane Ndao Antalya", "A. Antalya", "Turkey", "RW"],
    ["Wilder Cartagena", "W. Cartagena", "Peru", "CDM"],
    ["Lucero", "Lucero", "Brazil", "ST"],
    ["Gerardo Arteaga Mexico", "G. Mexico", "Mexico", "LB"],
    ["Andre Onana Cameroon", "A. Cameroon", "Cameroon", "GK"],
    ["Mahmoud Trezeguet Trabzon", "M. Trabzon", "Egypt", "LW"],
    ["Son Heung-min Korea", "S. Korea", "South Korea", "LW"],
    ["Miguel Trauco", "M. Trauco", "Peru", "LB"],
    ["Elia Caprile Napoli", "E. Napoli", "Italy", "GK"],
    ["Casper Nielsen Brugge", "C. Brugge", "Belgium", "CM"],
    ["Ayoze Perez Villarreal", "A. Villarreal", "Spain", "ST"],
    ["Hatayspor Rigoberto Rivas", "H. Rivas", "Turkey", "LW"],
    ["Clement Akpa", "C. Akpa", "France", "CB"],
    ["Matthis Abline", "M. Abline", "France", "ST"],
    ["Mohanad Lasheen", "M. Lasheen", "Egypt", "CDM"],
    ["Hamed Traore Auxerre", "H. Auxerre", "France", "CAM"],
    ["Sergio Akieme", "S. Akieme", "France", "LB"],
    ["Gabriel Gudmundsson", "G. Gudmundsson", "France", "LB"],
    ["Kevin Lomonaco", "K. Lomonaco", "Argentina", "CB"],
    ["Moises Ramirez", "M. Ramirez", "Ecuador", "GK"],
    ["Angel Di Maria Benfica", "A. Di Maria Benfica", "Portugal", "RW"],
    ["Leonardo Balerdi OM", "L. OM", "France", "CB"],
    ["Florian Wirtz Leverkusen", "F. Leverkusen", "Germany", "CAM"],
    ["Benedikt Gimber", "B. Gimber", "Germany", "CB"],
    ["Jeppe Okkels", "J. Okkels", "Sweden", "LW"],
    ["Ibrahim Sissoko", "I. Sissoko", "France", "ST"],
    ["Julian Araujo", "J. Araujo", "England", "RB"],
    ["Jo Hyeon-woo Korea", "J. Korea", "South Korea", "GK"],
    ["Orel Mangala Lyon", "O. Lyon", "France", "CM"],
    ["Gerrit Nauber", "G. Nauber", "Netherlands", "CB"],
    ["Youssef El Motie", "Y. El Motie", "Morocco", "GK"],
    ["Victor Kristiansen Denmark", "V. Denmark", "Denmark", "LB"],
    ["Pervis Estupinan Ecuador", "P. Ecuador", "Ecuador", "LB"],
    ["Thaciano", "Thaciano", "Brazil", "CAM"],
    ["Emile Smith Rowe Fulham", "E. Fulham", "England", "CAM"],
    ["Sofiane Bendebka", "S. Bendebka", "Saudi Arabia", "CM"],
    ["Veljko Birmancevic Serbia", "V. Serbia", "Serbia", "LW"],
    ["Can Bozdogan", "C. Bozdogan", "Netherlands", "CM"],
    ["Salem Al-Najdi Ahli", "S. Ahli", "Saudi Arabia", "RW"],
    ["Mojmir Chytil", "M. Chytil", "Czech Republic", "ST"],
    ["Silvan Widmer Swiss", "S. Swiss", "Switzerland", "RB"],
    ["Przemyslaw Frankowski", "P. Frankowski", "France", "RB"],
    ["Everaldo", "Everaldo", "Brazil", "ST"],
    ["Kawasaki Jung Sung-ryong", "K. Sung-ryong", "Japan", "GK"],
    ["Felix Horn Myhre", "F. Myhre", "Norway", "CM"],
    ["Antonee Robinson USA", "A. USA", "USA", "LB"],
    ["Thilo Kehrer Monaco", "T. Monaco", "France", "CB"],
    ["Persepolis Alireza Beiranvand Persepolis", "P. Persepolis", "Iran", "GK"],
    ["Hordur Magnusson", "H. Magnusson", "Iceland", "CB"],
    ["Leandro Paredes Roma", "L. Roma", "Italy", "CDM"],
    ["Kim Moon-hwan Korea", "K. Korea", "South Korea", "RB"],
    ["Semi Ajayi Nigeria", "S. Nigeria", "Nigeria", "CB"],
    ["Jack Clarke Jr", "J. Jr", "England", "LW"],
    ["Alessandro Circati Australia", "A. Australia", "Australia", "CB"],
    ["Christian Kouame CIV", "C. CIV", "Ivory Coast", "ST"],
    ["Gabriel Avalos Paraguay", "G. Paraguay", "Paraguay", "ST"],
    ["Vitoria Bruno Varela", "V. Varela", "Portugal", "GK"],
    ["Ivan Prtajin", "I. Prtajin", "Germany", "ST"],
    ["Isaak Toure", "I. Toure", "Italy", "CB"],
    ["Marin Sverko", "M. Sverko", "Italy", "CB"],
    ["Milad Mohammadi Iran", "M. Iran", "Iran", "LB"],
    ["Filip Bundgaard", "F. Bundgaard", "Denmark", "ST"],
    ["Djordje Petrovic Serbia", "D. Serbia", "Serbia", "GK"],
    ["Cyle Larin Mallorca", "C. Mallorca", "Spain", "ST"],
    ["Amir Rrahmani Kosovo", "A. Kosovo", "Kosovo", "CB"],
    ["Famalicao Luiz Junior Famalicao", "F. Famalicao", "Portugal", "GK"],
    ["Paul Onuachu Trabzon", "P. Trabzon", "Turkey", "ST"],
    ["Kenedy", "Kenedy", "Spain", "LW"],
    ["Ivan Perisic Croatia", "I. Croatia", "Croatia", "LW"],
    ["Maduka Okoye Nigeria", "M. Nigeria", "Nigeria", "GK"],
    ["Matty Cash Poland", "M. Poland", "Poland", "RB"],
    ["Cristian Zapata", "C. Zapata", "Colombia", "CB"],
    ["Guido Burgstaller", "G. Burgstaller", "Austria", "ST"],
    ["Oleksandr Zubkov", "O. Zubkov", "Ukraine", "RW"],
    ["Iqraam Rayners", "I. Rayners", "South Africa", "ST"],
    ["Julen Agirrezabala Jr", "J. Jr", "Spain", "GK"],
    ["Hakan Calhanoglu Turkey", "H. Turkey", "Turkey", "CDM"],
    ["Felix Agu", "F. Agu", "Germany", "LB"],
    ["Anton Salétros AIK", "A. AIK", "Sweden", "CM"],
    ["Cristian Tarragona", "C. Tarragona", "Argentina", "ST"],
    ["Ladislav Krejci", "L. Krejci", "Spain", "CB"],
    ["Lucas Olaza", "L. Olaza", "Spain", "LB"],
    ["Seol Young-woo Korea", "S. Korea", "South Korea", "RB"],
    ["Ali Khaseif UAE", "A. UAE", "United Arab Emirates", "GK"],
    ["Arnau Danjuma", "A. Danjuma", "Spain", "LW"],
    ["Piquerez Palmeiras", "P. Palmeiras", "Brazil", "LB"],
    ["Stefano Turati", "S. Turati", "Italy", "GK"],
    ["Radoslaw Murawski", "R. Murawski", "Poland", "CDM"],
    ["Antwerp Senne Lammens", "A. Lammens", "Belgium", "GK"],
    ["Salih Ucan", "S. Ucan", "Turkey", "CM"],
    ["Lyanco", "Lyanco", "Brazil", "CB"],
    ["Ibrahim Salah Rennes", "I. Rennes", "France", "RW"],
    ["Jacob Greaves", "J. Greaves", "England", "CB"],
    ["Jackson Irvine St Pauli", "J. Pauli", "Germany", "CM"],
    ["Gil Santos", "G. Santos", "Brazil", "CB"],
    ["Munir Las Palmas", "M. Palmas", "Spain", "RW"],
    ["Ko Itakura Japan", "K. Japan", "Japan", "CB"],
    ["Sparta Nick Olij Sparta", "S. Sparta", "Netherlands", "GK"],
    ["Claudio Aquino", "C. Aquino", "Argentina", "CAM"],
    ["Boubacar Kouyate", "B. Kouyate", "Mali", "CB"],
    ["Matteo Politano Napoli", "M. Napoli", "Italy", "RW"],
    ["Kevin Theophile-Catherine", "K. Theophile-Catherine", "Croatia", "CB"],
    ["Gonzalo Piovi", "G. Piovi", "Mexico", "CB"],
    ["Arseniy Batagov", "A. Batagov", "Turkey", "CB"],
    ["Roberto Fernandez Bolivia", "R. Bolivia", "Bolivia", "LW"],
    ["Davide Frattesi Inter", "D. Inter", "Italy", "CM"],
    ["Antoine Makoumbou Cagliari", "A. Cagliari", "Italy", "CDM"],
    ["Braian Romero", "B. Romero", "Argentina", "ST"],
    ["Le Havre Arthur Desmas", "L. Desmas", "France", "GK"],
    ["Sam Lammers", "S. Lammers", "Netherlands", "ST"],
    ["Andrea Colpani", "A. Colpani", "Italy", "CAM"],
    ["Julian Carranza Feyenoord", "J. Feyenoord", "Netherlands", "ST"],
    ["Youssouf Sabaly Senegal", "Y. Senegal", "Senegal", "RB"],
    ["Besiktas Mert Gunok Besiktas", "B. Besiktas", "Turkey", "GK"],
    ["Cacapa", "Cacapa", "Brazil", "CB"],
    ["Servette Jeremy Frick", "S. Frick", "Switzerland", "GK"],
    ["Jeong Woo-yeong Korea", "J. Korea", "South Korea", "RW"],
    ["Anuar Tuhami", "A. Tuhami", "Spain", "CM"],
    ["Christian Rasmussen", "C. Rasmussen", "Netherlands", "RW"],
    ["Andy Najar", "A. Najar", "Honduras", "RB"],
    ["Allan Nyom", "A. Nyom", "Spain", "RB"],
    ["Matej Vydra", "M. Vydra", "Czech Republic", "ST"],
    ["Pierluigi Gollini Genoa", "P. Genoa", "Italy", "GK"],
    ["Umut Bozok", "U. Bozok", "Turkey", "ST"],
    ["Facundo Colidio River", "F. River", "Argentina", "ST"],
    ["Dilane Bakwa Strasbourg", "D. Strasbourg", "France", "RW"],
    ["Homam Ahmed Qatar", "H. Qatar", "Qatar", "LB"],
    ["Kevin Diks", "K. Diks", "Denmark", "RB"],
    ["Igor Paixao Feyenoord", "I. Feyenoord", "Netherlands", "LW"],
    ["Jens Petter Hauge", "J. Hauge", "Norway", "LW"],
    ["Ibrahim Osman Feyenoord", "I. Feyenoord", "Netherlands", "LW"],
    ["Dai Wai-tsun", "D. Wai-tsun", "China", "LW"],
    ["Joe Aribo Jr", "J. Jr", "England", "CM"],
    ["Mario Balotelli", "M. Balotelli", "Italy", "ST"],
    ["Sergino Dest PSV", "S. PSV", "Netherlands", "RB"],
    ["Alonso Martinez", "A. Martinez", "USA", "ST"],
    ["Joey Veerman PSV", "J. PSV", "Netherlands", "CM"],
    ["Eduardo Aguirre", "E. Aguirre", "Mexico", "ST"],
    ["Artem Dovbyk Ukraine", "A. Ukraine", "Ukraine", "ST"],
    ["Hjalmar Ekdal Dif", "H. Dif", "Sweden", "CB"],
    ["Herve Koffi", "H. Koffi", "France", "GK"],
    ["Andres Cubas", "A. Cubas", "Paraguay", "CDM"],
    ["Vitao", "Vitao", "Brazil", "CB"],
    ["David Ospina Colombia", "D. Colombia", "Colombia", "GK"],
    ["Gustavo Cabral", "G. Cabral", "Mexico", "CB"],
    ["Alejandro Zendejas America", "A. America", "Mexico", "RW"],
    ["Bodo Glimt Nikita Haikin", "B. Haikin", "Norway", "GK"],
    ["Marwane Saadane", "M. Saadane", "Saudi Arabia", "CB"],
    ["Otar Kiteishvili Georgia", "O. Georgia", "Georgia", "CAM"],
    ["Bradley Locko", "B. Locko", "France", "LB"],
    ["Sam Adekugbe Canada", "S. Canada", "Canada", "LB"],
    ["Samuel Chukwueze Nigeria", "S. Nigeria", "Nigeria", "RW"],
    ["Kamaldeen Sulemana Ghana", "K. Ghana", "Ghana", "LW"],
    ["Maxim De Cuyper Brugge", "M. De Cuyper Brugge", "Belgium", "LB"],
    ["Luca de la Torre USA", "L. de la Torre USA", "USA", "CM"],
    ["Julien Duranville", "J. Duranville", "Germany", "RW"],
    ["Abdallah Sima Senegal", "A. Senegal", "Senegal", "LW"],
    ["Mathew Leckie Australia", "M. Australia", "Australia", "RW"],
    ["Mario Lemina Gabon", "M. Gabon", "Gabon", "CDM"],
    ["Andre Silva Vitoria", "A. Vitoria", "Portugal", "ST"],
    ["Amir Al-Ammari Iraq", "A. Iraq", "Iraq", "CM"],
    ["Vid Belec", "V. Belec", "Slovenia", "GK"],
    ["Wes Foderingham Jr", "W. Jr", "England", "GK"],
    ["AIK Kristoffer Nordfeldt AIK", "A. AIK", "Sweden", "GK"],
    ["Tomas Chory", "T. Chory", "Czech Republic", "ST"],
    ["Leon Bailey Jamaica", "L. Jamaica", "Jamaica", "RW"],
    ["Gaddi Aguirre", "G. Aguirre", "Mexico", "CB"],
    ["Gustav Isaksen Lazio", "G. Lazio", "Italy", "RW"],
    ["Josimar Dias", "J. Dias", "Cape Verde", "GK"],
    ["Sphephelo Sithole", "S. Sithole", "South Africa", "CM"],
    ["Nick Pope Jr", "N. Jr", "England", "GK"],
    ["Equi Fernandez Boca", "E. Boca", "Argentina", "CDM"],
    ["Rayan Ait-Nouri Algeria", "R. Algeria", "Algeria", "LB"],
    ["Henri Avagyan", "H. Avagyan", "Armenia", "GK"],
    ["Keinan Davis", "K. Davis", "Italy", "ST"],
    ["Erick Sanchez Mexico", "E. Mexico", "Mexico", "CM"],
    ["Musab Al-Juwayr Hilal", "M. Hilal", "Saudi Arabia", "CM"],
    ["Teemu Pukki", "T. Pukki", "Finland", "ST"],
    ["Martin Dubravka Slovakia", "M. Slovakia", "Slovakia", "GK"],
    ["Iker Munoz", "I. Munoz", "Spain", "CM"],
    ["Nilson Angulo Anderlecht", "N. Anderlecht", "Belgium", "LW"],
    ["Przemyslaw Frankowski Poland", "P. Poland", "Poland", "RB"],
    ["Taylor Booth", "T. Booth", "Netherlands", "RW"],
    ["Edinson Cavani Boca", "E. Boca", "Argentina", "ST"],
    ["Omar Kamal Ahly", "O. Ahly", "Egypt", "RB"],
    ["Trabzonspor Ugurcan Cakir Trabzon", "T. Trabzon", "Turkey", "GK"],
    ["Augsburg Finn Dahmen", "A. Dahmen", "Germany", "GK"],
    ["Kalidou Koulibaly Senegal", "K. Senegal", "Senegal", "CB"],
    ["Zymer Bytyqi", "Z. Bytyqi", "Kosovo", "CAM"],
    ["Siyanda Xulu", "S. Xulu", "South Africa", "CB"],
    ["Kenny Lala", "K. Lala", "France", "RB"],
    ["Ehsan Hajsafi AEK", "E. AEK", "Greece", "LB"],
    ["Varela", "Varela", "Brazil", "RB"],
    ["Kjetil Haug", "K. Haug", "France", "GK"],
    ["Carlos Miguel", "C. Miguel", "England", "GK"],
    ["Murilo Palmeiras", "M. Palmeiras", "Brazil", "CB"],
    ["Enis Bardhi", "E. Bardhi", "Turkey", "CAM"],
    ["Godoy Cruz Franco Petroli", "G. Petroli", "Argentina", "GK"],
    ["Hajduk Ivan Lucic", "H. Lucic", "Croatia", "GK"],
    ["Gianluca Mancini Roma", "G. Roma", "Italy", "CB"],
    ["Amir Hadziahmetovic", "A. Hadziahmetovic", "Bosnia and Herzegovina", "CM"],
    ["Sebastian Walukiewicz", "S. Walukiewicz", "Italy", "CB"],
    ["Ali Al-Hassan Nassr", "A. Nassr", "Saudi Arabia", "CM"],
    ["Lyle Foster", "L. Foster", "South Africa", "ST"],
    ["Steeve Yago", "S. Yago", "Burkina Faso", "CB"],
    ["Emil Audero Como", "E. Como", "Italy", "GK"],
    ["Mateus Uribe Colombia", "M. Colombia", "Colombia", "CM"],
    ["Gregor Kobel Swiss", "G. Swiss", "Switzerland", "GK"],
    ["Sepp van den Berg", "S. van den Berg", "England", "CB"],
    ["Joao Marcelo", "J. Marcelo", "Brazil", "CB"],
    ["Amr El Solia Ahly", "A. El Solia Ahly", "Egypt", "CM"],
    ["Danilo Luiz Juve", "D. Juve", "Italy", "RB"],
    ["Union SG Anthony Moris", "U. Moris", "Belgium", "GK"],
    ["Vyacheslav Karavaev", "V. Karavaev", "Russia", "RB"],
    ["Jeonbuk Song Bum-keun Jeonbuk", "J. Jeonbuk", "South Korea", "GK"],
    ["Dirk Proper", "D. Proper", "Netherlands", "CM"],
    ["Leon Rodolfo Cota", "L. Cota", "Mexico", "GK"],
    ["Franck Kessie Ahli", "F. Ahli", "Saudi Arabia", "CM"],
    ["Alan Matturro", "A. Matturro", "Italy", "CB"],
    ["Abakar Sylla Strasbourg", "A. Strasbourg", "France", "CB"],
    ["Cedric Zesiger Swiss", "C. Swiss", "Switzerland", "CB"],
    ["Lucas Passerini", "L. Passerini", "Argentina", "ST"],
    ["Hossam Ashraf", "H. Ashraf", "Egypt", "ST"],
    ["Mateo Kovacic Croatia", "M. Croatia", "Croatia", "CM"],
    ["Igor Vinicius", "I. Vinicius", "Brazil", "RB"],
    ["Diogo Leite", "D. Leite", "Germany", "CB"],
    ["Gianluca Gaetano Cagliari", "G. Cagliari", "Italy", "CAM"],
    ["Lecce Wladimiro Falcone", "L. Falcone", "Italy", "GK"],
    ["Christian Fruchtl", "C. Fruchtl", "Italy", "GK"],
    ["Nicolas Viola Cagliari", "N. Cagliari", "Italy", "CAM"],
    ["Shavy Babicka", "S. Babicka", "France", "ST"],
    ["Krzysztof Piatek Poland", "K. Poland", "Poland", "ST"],
    ["Mamadou Coulibaly Monaco", "M. Monaco", "France", "CDM"],
    ["Saba Goglichidze", "S. Goglichidze", "Italy", "CB"],
    ["Zakaria El Ouahdi Morocco", "Z. El Ouahdi Morocco", "Morocco", "RB"],
    ["Marko Grujic", "M. Grujic", "Portugal", "CM"],
    ["Jonas Fohrenbach", "J. Fohrenbach", "Germany", "LB"],
    ["Tijuana Antonio Rodriguez", "T. Rodriguez", "Mexico", "GK"],
    ["Andraz Sporar", "A. Sporar", "Greece", "ST"],
    ["Dimitry Bertaud DRC", "D. DRC", "DR Congo", "GK"],
    ["Jeffrey Gouweleeuw", "J. Gouweleeuw", "Germany", "CB"],
    ["Tobias Sana", "T. Sana", "Sweden", "LW"],
    ["Mohanad Ali Iraq", "M. Iraq", "Iraq", "ST"],
    ["Lautaro Di Lollo", "L. Di Lollo", "Argentina", "CB"],
    ["Cristian Olivera Uruguay", "C. Uruguay", "Uruguay", "RW"],
    ["Huracan Hernan Galindez", "H. Galindez", "Argentina", "GK"],
    ["Jorgen Strand Larsen", "J. Larsen", "England", "ST"],
    ["Daniel Munoz Col", "D. Col", "Colombia", "RB"],
    ["Issiaga Sylla", "I. Sylla", "Guinea", "LB"],
    ["Alexander Prass Austria", "A. Austria", "Austria", "LB"],
    ["Michal Sadilek Czech", "M. Czech", "Czech Republic", "CM"],
    ["Remy Cabella Lille", "R. Lille", "France", "CAM"],
    ["Barcelona SC Javier Burrai", "B. Burrai", "Ecuador", "GK"],
    ["Mergim Berisha", "M. Berisha", "Germany", "ST"],
    ["Cameron Carter-Vickers USA", "C. USA", "USA", "CB"],
    ["Edmond Tapsoba Burkina", "E. Burkina", "Burkina Faso", "CB"],
    ["Beni Mukendi", "B. Mukendi", "Angola", "CM"],
    ["Sebastian Walukiewicz Poland", "S. Poland", "Poland", "CB"],
    ["Christian Burgess", "C. Burgess", "Belgium", "CB"],
    ["Chadi Riad Jr", "C. Jr", "England", "CB"],
    ["Patrik Carlgren", "P. Carlgren", "France", "GK"],
    ["Joel Graterol", "J. Graterol", "Venezuela", "GK"],
    ["Rami Rabia Ahly", "R. Ahly", "Egypt", "CB"],
    ["Diego Lainez Tigres", "D. Tigres", "Mexico", "RW"],
    ["Sam Morsy Jr", "S. Jr", "England", "CDM"],
    ["Leonardo Fernandez", "L. Fernandez", "Uruguay", "CAM"],
    ["Lorenzo Pellegrini Roma", "L. Roma", "Italy", "CAM"],
    ["Mahmoud Hamada Zamalek", "M. Zamalek", "Egypt", "LB"],
    ["Emre Kilinc", "E. Kilinc", "Turkey", "RM"],
    ["Soteldo", "Soteldo", "Brazil", "LW"],
    ["Patrik Hrosovsky Genk", "P. Genk", "Belgium", "CDM"],
    ["Lee Kang-in Korea", "L. Korea", "South Korea", "CAM"],
    ["Santiago Ascacibar", "S. Ascacibar", "Argentina", "CDM"],
    ["Kendall Waston", "K. Waston", "Costa Rica", "CB"],
    ["Vanja Milinkovic-Savic", "V. Milinkovic-Savic", "Italy", "GK"],
    ["Nico Gonzalez Porto2", "N. Porto2", "Portugal", "CM"],
    ["Carlos Izquierdoz", "C. Izquierdoz", "Argentina", "CB"],
    ["Jhon Cordoba Colombia", "J. Colombia", "Colombia", "ST"],
    ["Leo Roman", "L. Roman", "Spain", "GK"],
    ["Adrian Barisic", "A. Barisic", "Switzerland", "CB"],
    ["Leonardo Castro", "L. Castro", "Colombia", "ST"],
    ["Sergi Cardona Villarreal", "S. Villarreal", "Spain", "LB"],
    ["Philipp Hofmann", "P. Hofmann", "Germany", "ST"],
    ["Scott McKenna Las Palmas", "S. Palmas", "Spain", "CB"],
    ["Bernard Tekpetey", "B. Tekpetey", "Greece", "LW"],
    ["Jelle Bataille", "J. Bataille", "Belgium", "RB"],
    ["Jasper Schendelaar", "J. Schendelaar", "Netherlands", "GK"],
    ["Mamadou Lamine Camara Senegal", "M. Senegal", "Senegal", "CM"],
    ["Mario Gila Lazio", "M. Lazio", "Italy", "CB"],
    ["Dorgeles Nene", "D. Nene", "Austria", "LW"],
    ["Pawel Dawidowicz Poland", "P. Poland", "Poland", "CB"],
    ["Amine Adli Leverkusen", "A. Leverkusen", "Germany", "LW"],
    ["Tyler Adams USA", "T. USA", "USA", "CDM"],
    ["Kim Young-gwon Ulsan", "K. Ulsan", "South Korea", "CB"],
    ["Ben Brereton Diaz Jr", "B. Jr", "England", "ST"],
    ["N'Golo Kante", "N. Kante", "Saudi Arabia", "CDM"],
    ["Amor Layouni", "A. Layouni", "Sweden", "LW"],
    ["Lassana Coulibaly", "L. Coulibaly", "Italy", "CM"],
    ["Nene Dorgeles Mali", "N. Mali", "Mali", "LW"],
    ["Guillermo Viscarra", "G. Viscarra", "Bolivia", "GK"],
    ["Otavio Ataide", "O. Ataide", "Portugal", "CB"],
    ["Anders Christiansen", "A. Christiansen", "Sweden", "CM"],
    ["Raul Moro", "R. Moro", "Spain", "LW"],
    ["Jovane Cabral", "J. Cabral", "Cape Verde", "LW"],
    ["Matheus Pereira Cruzeiro", "M. Cruzeiro", "Brazil", "CAM"],
    ["Lloyd Kelly Jr", "L. Jr", "England", "CB"],
    ["Phillipp Mwene", "P. Mwene", "Germany", "LB"],
    ["Sturm Kjell Scherpen Sturm", "S. Sturm", "Austria", "GK"],
    ["Samuele Ricci Torino", "S. Torino", "Italy", "CDM"],
    ["Mohamed Zrida", "M. Zrida", "Morocco", "CM"],
    ["Joachim Andersen Fulham", "J. Fulham", "England", "CB"],
    ["Monsalve", "Monsalve", "Brazil", "CAM"],
    ["Michele Di Gregorio Juve", "M. Di Gregorio Juve", "Italy", "GK"],
    ["Sasa Lukic Serbia", "S. Serbia", "Serbia", "CM"],
    ["Abdulla Ramadan UAE", "A. UAE", "United Arab Emirates", "CM"],
    ["Brandon Mechele Brugge", "B. Brugge", "Belgium", "CB"],
    ["Gabri Martinez", "G. Martinez", "Portugal", "LW"],
    ["Elisha Owusu Auxerre", "E. Auxerre", "France", "CDM"],
    ["David Garcia", "D. Garcia", "Spain", "CB"],
    ["Gabriel Rojas", "G. Rojas", "Argentina", "LB"],
    ["Sam Johnstone Wolves", "S. Wolves", "England", "GK"],
    ["Luiz Araujo", "L. Araujo", "Brazil", "RW"],
    ["Vasilije Adzic", "V. Adzic", "Italy", "CAM"],
    ["Mathias Olivera Napoli", "M. Napoli", "Italy", "LB"],
    ["Nicusor Bancu", "N. Bancu", "Romania", "LB"],
    ["Benjamin Nygren", "B. Nygren", "Denmark", "LW"],
    ["Jesper Karlsson Sweden", "J. Sweden", "Sweden", "LW"],
    ["William Troost-Ekong Nigeria", "W. Nigeria", "Nigeria", "CB"],
    ["Ferjani Sassi Tunisia", "F. Tunisia", "Tunisia", "CM"],
    ["Ismail Jakobs Senegal", "I. Senegal", "Senegal", "LB"],
    ["Jesus Medina", "J. Medina", "Russia", "CAM"],
    ["Tyler Dibling", "T. Dibling", "England", "RW"],
    ["Sorriso", "Sorriso", "Portugal", "CB"],
    ["Yunis Abdelhamid ASSE", "Y. ASSE", "France", "CB"],
    ["LA Galaxy Riqui Puig", "L. Puig", "USA", "CM"],
    ["Erick Gutierrez", "E. Gutierrez", "Mexico", "CM"],
    ["Sardar Azmoun Iran", "S. Iran", "Iran", "ST"],
    ["Andrija Zivkovic Serbia", "A. Serbia", "Serbia", "RW"],
    ["Tomas Pekhart", "T. Pekhart", "Poland", "ST"],
    ["Evan Ferguson Jr", "E. Jr", "England", "ST"],
    ["Arnaud Kalimuendo Rennes", "A. Rennes", "France", "ST"],
    ["Jamie Gittens Dortmund", "J. Dortmund", "Germany", "LW"],
    ["Amine Salama", "A. Salama", "France", "LW"],
    ["Duvan Zapata", "D. Zapata", "Italy", "ST"],
    ["Santiago Moreno", "S. Moreno", "USA", "RW"],
    ["Milos Kerkez Hungary", "M. Hungary", "Hungary", "LB"],
    ["Puebla Jesus Rodriguez", "P. Rodriguez", "Mexico", "GK"],
    ["Luis Advincula Peru", "L. Peru", "Peru", "RB"],
    ["Terrence Mashego", "T. Mashego", "South Africa", "LB"],
    ["Luka Modric", "L. Modric", "Croatia", "CM"],
    ["Taha Yassine Khenissi Tunisia", "T. Tunisia", "Tunisia", "ST"],
    ["Bouly Junior Sambou", "B. Sambou", "Morocco", "ST"],
    ["Matthew Garbett", "M. Garbett", "New Zealand", "CM"],
    ["Pape Gueye Villarreal", "P. Villarreal", "Spain", "CM"],
    ["Andre Calisir", "A. Calisir", "Armenia", "CB"],
    ["Anirudh Thapa", "A. Thapa", "India", "CM"],
    ["Dortmund Gregor Kobel Dortmund", "D. Dortmund", "Germany", "GK"],
    ["Soufiane Rahimi Morocco", "S. Morocco", "Morocco", "ST"],
    ["Marash Kumbulla", "M. Kumbulla", "Spain", "CB"],
    ["Hugo Larsson Sweden", "H. Sweden", "Sweden", "CM"],
    ["Pietro Comuzzo", "P. Comuzzo", "Italy", "CB"],
    ["Santos Carlos Acevedo Santos", "S. Santos", "Mexico", "GK"],
    ["Varazdat Haroyan", "V. Haroyan", "Armenia", "CB"],
    ["Santa Clara Gabriel Batista", "S. Batista", "Portugal", "GK"],
    ["Rafiu Durosinmi", "R. Durosinmi", "Czech Republic", "ST"],
    ["Benjamin Andre Lille", "B. Lille", "France", "CDM"],
    ["Suwon Kim Byung-ji", "S. Byung-ji", "South Korea", "GK"],
    ["Guilherme Arana Galo", "G. Galo", "Brazil", "LB"],
    ["Duje Caleta-Car Croatia", "D. Croatia", "Croatia", "CB"],
    ["Idrissa Gueye Senegal", "I. Senegal", "Senegal", "CDM"],
    ["Francesco Zampano", "F. Zampano", "Italy", "RB"],
    ["Keke Topp", "K. Topp", "Germany", "ST"],
    ["Cecilio Waterman", "C. Waterman", "Panama", "ST"],
    ["Jose Angel Carmona", "J. Carmona", "Spain", "RB"],
    ["Lewis Miller Australia", "L. Australia", "Australia", "RB"],
    ["Neymar Santos", "N. Santos", "Brazil", "LW"],
    ["Adrian Beck", "A. Beck", "Germany", "CAM"],
    ["Taison", "Taison", "Greece", "LW"],
    ["Mike Maignan Milan", "M. Milan", "Italy", "GK"],
    ["Zan Vipotnik", "Z. Vipotnik", "Slovenia", "ST"],
    ["Ayman Yahya Nassr", "A. Nassr", "Saudi Arabia", "LW"],
    ["Kamory Doumbia", "K. Doumbia", "France", "CAM"],
    ["Felix Lemarechal", "F. Lemarechal", "France", "CAM"],
    ["Edoardo Corvi", "E. Corvi", "Italy", "GK"],
    ["Joris Kayembe DRC", "J. DRC", "DR Congo", "LB"],
    ["Renzo Garces", "R. Garces", "Peru", "CB"],
    ["Daniel Cataño", "D. Cataño", "Colombia", "CAM"],
    ["Ardon Jashari Brugge", "A. Brugge", "Belgium", "CDM"],
    ["Valeriy Bondar Shakhtar", "V. Shakhtar", "Ukraine", "CB"],
    ["Newells Keylor Navas", "N. Navas", "Argentina", "GK"],
    ["Ali Al-Bulaihi Hilal", "A. Hilal", "Saudi Arabia", "CB"],
    ["Andreas Skov Olsen Denmark", "A. Denmark", "Denmark", "RW"],
    ["Alvaro Rodriguez", "A. Rodriguez", "Spain", "ST"],
    ["Junior Adamu", "J. Adamu", "Germany", "ST"],
    ["Irfan Can Kahveci", "I. Kahveci", "Turkey", "CAM"],
    ["Henry Vaca", "H. Vaca", "Bolivia", "LW"],
    ["Arijan Ademi", "A. Ademi", "North Macedonia", "CDM"],
    ["Kabaso Chongo", "K. Chongo", "Zambia", "CB"],
    ["Christian Mawissa Monaco", "C. Monaco", "France", "CB"],
    ["Kaku", "Kaku", "United Arab Emirates", "CAM"],
    ["Olivier Mbaizo Cameroon", "O. Cameroon", "Cameroon", "RB"],
    ["Tajon Buchanan Villarreal", "T. Villarreal", "Spain", "RW"],
    ["Amir Richardson", "A. Richardson", "Italy", "CM"],
    ["Victor Osimhen Galatasaray", "V. Galatasaray", "Turkey", "ST"],
    ["Cesar Perez", "C. Perez", "Chile", "CM"],
    ["Diego Enriquez", "D. Enriquez", "Peru", "GK"],
    ["Deniz Gul", "D. Gul", "Sweden", "ST"],
    ["Wout Weghorst Ajax", "W. Ajax", "Netherlands", "ST"],
    ["Hattan Bahebri Shabab", "H. Shabab", "Saudi Arabia", "RW"],
    ["Bafode Diakite Lille", "B. Lille", "France", "CB"],
    ["Marcus Danielson", "M. Danielson", "Sweden", "CB"],
    ["Taulant Seferi", "T. Seferi", "Albania", "LW"],
    ["Andrija Radulovic", "A. Radulovic", "Montenegro", "LW"],
    ["Monza Stefano Turati Monza", "M. Monza", "Italy", "GK"],
    ["Marcao", "Marcao", "Spain", "CB"],
    ["Sandesh Jhingan", "S. Jhingan", "India", "CB"],
    ["Francisco Ortega", "F. Ortega", "Greece", "LB"],
    ["Jesse Marsch", "J. Marsch", "Canada", "CB"],
    ["Luka Jovic Serbia", "L. Serbia", "Serbia", "ST"],
    ["Jonas Svensson", "J. Svensson", "Turkey", "RB"],
    ["Yasser Al-Mosailem", "Y. Al-Mosailem", "Saudi Arabia", "GK"],
    ["Etienne Youte", "E. Youte", "France", "CB"],
    ["Rade Krunic Bosnia", "R. Bosnia", "Bosnia and Herzegovina", "CM"],
    ["Brest Marco Bizot", "B. Bizot", "France", "GK"],
    ["Jacob Shaffelburg Canada", "J. Canada", "Canada", "LW"],
    ["Pierre Ekwah", "P. Ekwah", "France", "CDM"],
    ["Armando Broja Albania", "A. Albania", "Albania", "ST"],
    ["Lucas Torro", "L. Torro", "Spain", "CDM"],
    ["Dennis Ayensa", "D. Ayensa", "Belgium", "ST"],
    ["Enzo Le Fee Roma", "E. Le Fee Roma", "Italy", "CM"],
    ["Genk Maarten Vandevoordt Genk", "G. Genk", "Belgium", "GK"],
    ["Benjamin Pavard Inter", "B. Inter", "Italy", "CB"],
    ["Badredine Bouanani Algeria", "B. Algeria", "Algeria", "RW"],
    ["Vasco Leo Jardim", "V. Jardim", "Brazil", "GK"],
    ["Cyle Larin Canada", "C. Canada", "Canada", "ST"],
    ["Abel Bretones", "A. Bretones", "Spain", "LB"],
    ["Juarez Sebastian Jurado", "J. Jurado", "Mexico", "GK"],
    ["Jorrel Hato Ajax", "J. Ajax", "Netherlands", "CB"],
    ["FAR Hamza El Moussaoui", "F. Hamza El Moussaoui", "Morocco", "LB"],
    ["Richard Sanchez", "R. Sanchez", "Mexico", "CDM"],
    ["Fiston Mayele", "F. Mayele", "DR Congo", "ST"],
    ["Nacional Kaique", "N. Kaique", "Portugal", "GK"],
    ["Samsunspor Carlo Holse", "S. Holse", "Turkey", "RW"],
    ["Jonathan dos Santos", "J. dos Santos", "Mexico", "CM"],
    ["Zidane Iqbal Iraq", "Z. Iraq", "Iraq", "CM"],
    ["Nemanja Matic", "N. Matic", "France", "CDM"],
    ["Thijs Dallinga", "T. Dallinga", "Italy", "ST"],
    ["Mateus Fernandes", "M. Fernandes", "England", "CM"],
    ["Olimpia Gaston Olveira", "O. Olveira", "Paraguay", "GK"],
    ["Sasa Lukic Fulham", "S. Fulham", "England", "CM"],
    ["Taras Romanczuk", "T. Romanczuk", "Poland", "CDM"],
    ["Matej Kovar", "M. Kovar", "Germany", "GK"],
    ["Bogdan Racovitan", "B. Racovitan", "Romania", "CB"],
    ["Pablo Athletico", "P. Athletico", "Brazil", "ST"],
    ["Kasper Dolberg Anderlecht", "K. Anderlecht", "Belgium", "ST"],
    ["Jakub Kiwior Poland", "J. Poland", "Poland", "CB"],
    ["Mike van der Hoorn", "M. van der Hoorn", "Netherlands", "CB"],
    ["Troy Parrott AZ", "T. AZ", "Netherlands", "ST"],
    ["Ethan Pinnock Jamaica", "E. Jamaica", "Jamaica", "CB"],
    ["Evan Ndicka CIV", "E. CIV", "Ivory Coast", "CB"],
    ["Sergio Rochet Uruguay", "S. Uruguay", "Uruguay", "GK"],
    ["Deiver Machado Colombia", "D. Colombia", "Colombia", "LB"],
    ["Akihiro Ienaga", "A. Ienaga", "Japan", "RW"],
    ["Fernando Zampedri", "F. Zampedri", "Chile", "ST"],
    ["Liam Millar Canada", "L. Canada", "Canada", "LW"],
    ["Ousmane Diomande CIV", "O. CIV", "Ivory Coast", "CB"],
    ["Joao Paulo", "J. Paulo", "Brazil", "GK"],
    ["Elias Olafsson", "E. Olafsson", "Denmark", "GK"],
    ["Hwang In-beom Korea", "H. Korea", "South Korea", "CM"],
    ["Jose Fajardo", "J. Fajardo", "Panama", "ST"],
    ["James Milner", "J. Milner", "England", "CM"],
    ["Freddie Woodman", "F. Woodman", "England", "GK"],
    ["Lanus Nahuel Losada", "L. Losada", "Argentina", "GK"],
    ["Ivan Villar", "I. Villar", "Spain", "GK"],
    ["Abdallah Nasib", "A. Nasib", "Jordan", "CB"],
    ["Bahia Marcos Felipe Bahia", "B. Bahia", "Brazil", "GK"],
    ["Lucas Tousart", "L. Tousart", "Germany", "CM"],
    ["Guadalajara Raul Rangel Chivas", "G. Chivas", "Mexico", "GK"],
    ["Cristian Casseres Venezuela", "C. Venezuela", "Venezuela", "CM"],
    ["Kingsley Ehizibue", "K. Ehizibue", "Italy", "RB"],
    ["Vissel Yuya Osako Kobe", "V. Kobe", "Japan", "ST"],
    ["Patson Daka Zambia", "P. Zambia", "Zambia", "ST"],
    ["Jacob Bruun Larsen Denmark", "J. Denmark", "Denmark", "LW"],
    ["Valentin Mihaila Romania", "V. Romania", "Romania", "LW"],
    ["Tinga", "Tinga", "Brazil", "RB"],
    ["Gianluca Busio", "G. Busio", "Italy", "CM"],
    ["Andre Ferreira", "A. Ferreira", "Spain", "GK"],
    ["Jassem Gaber Qatar", "J. Qatar", "Qatar", "CM"],
    ["Juan Cruz Leganes", "J. Leganes", "Spain", "LW"],
    ["Sam Johnstone Palace", "S. Palace", "England", "GK"],
    ["Hugo Sotelo", "H. Sotelo", "Spain", "CM"],
    ["Benjamin Kuscevic", "B. Kuscevic", "Chile", "CB"],
    ["Hicham Boudaoui Algeria", "H. Algeria", "Algeria", "CM"],
    ["Carlos Mane", "C. Mane", "Turkey", "LW"],
    ["Ben Brereton Chile", "B. Chile", "Chile", "ST"],
    ["Claudinho", "Claudinho", "Russia", "CAM"],
    ["Guram Kashia", "G. Kashia", "Georgia", "CB"],
    ["Jesus Angulo Mexico", "J. Mexico", "Mexico", "LB"],
    ["Jordan Larsson Sweden", "J. Sweden", "Sweden", "ST"],
    ["Yazan Al-Arab", "Y. Al-Arab", "Jordan", "CB"],
    ["LAFC Hugo Lloris", "L. Lloris", "USA", "GK"],
    ["Nemanja Jovic", "N. Jovic", "Serbia", "ST"],
    ["Antoine Conte", "A. Conte", "Guinea", "CB"],
    ["Florent Hadergjonaj", "F. Hadergjonaj", "Kosovo", "RB"],
    ["Jorman Campuzano", "J. Campuzano", "Colombia", "CDM"],
    ["Robert Zulj", "R. Zulj", "Austria", "CAM"],
    ["Marcos Felipe", "M. Felipe", "Brazil", "GK"],
    ["Jesus Gallardo Mexico", "J. Mexico", "Mexico", "LB"],
    ["Denzell Garcia", "D. Garcia", "Mexico", "RB"],
    ["Kristoffer Haugen", "K. Haugen", "Norway", "LB"],
    ["Michael Boxall", "M. Boxall", "New Zealand", "CB"],
    ["Kwasi Sibo Ghana", "K. Ghana", "Ghana", "CM"],
    ["Jusuf Gazibegovic", "J. Gazibegovic", "Austria", "RB"],
    ["Zeki Celik Roma", "Z. Roma", "Italy", "RB"],
    ["Igor Jesus Botafogo", "I. Botafogo", "Brazil", "ST"],
    ["Przemyslaw Placheta", "P. Placheta", "Poland", "LW"],
    ["Yoel Barcenas", "Y. Barcenas", "Panama", "LW"],
    ["Martin Bjornbak", "M. Bjornbak", "Norway", "CB"],
    ["Anders Dreyer Anderlecht", "A. Anderlecht", "Belgium", "RW"],
    ["Riyad Mahrez Algeria", "R. Algeria", "Algeria", "RW"],
    ["Pascal Gross Brighton", "P. Brighton", "England", "CM"],
    ["Igor Lichnovsky America", "I. America", "Mexico", "CB"],
    ["Ramon Sosa", "R. Sosa", "England", "LW"],
    ["Rio Ave Jhonatan Luiz", "R. Luiz", "Portugal", "GK"],
    ["Ardon Jashari Swiss", "A. Swiss", "Switzerland", "CDM"],
    ["Columbus Cucho Hernandez", "C. Hernandez", "USA", "ST"],
    ["Gianluca Scamacca Atalanta", "G. Atalanta", "Italy", "ST"],
    ["Yassine Bounou Hilal", "Y. Hilal", "Saudi Arabia", "GK"],
    ["Lorenzo Montipo", "L. Montipo", "Italy", "GK"],
    ["Chuki", "Chuki", "Spain", "CAM"],
    ["Bastos Angola", "B. Angola", "Angola", "CB"],
    ["Daniel Bachmann", "D. Bachmann", "England", "GK"],
    ["Antoine Semenyo Bournemouth", "A. Bournemouth", "England", "RW"],
    ["Fernando Muslera", "F. Muslera", "Turkey", "GK"],
    ["Timo Horn", "T. Horn", "Germany", "GK"],
    ["Mikael Ishak", "M. Ishak", "Poland", "ST"],
    ["Hannibal Mejbri Tunisia", "H. Tunisia", "Tunisia", "CAM"],
    ["Sebastian Szymanski", "S. Szymanski", "Turkey", "CAM"],
    ["Connor Metcalfe Australia", "C. Australia", "Australia", "CM"],
    ["Etrit Berisha Albania", "E. Albania", "Albania", "GK"],
    ["Asamoah Gyan", "A. Gyan", "Ghana", "ST"],
    ["Moussa Djenepo", "M. Djenepo", "Mali", "LW"],
    ["Hiroaki Okuno", "H. Okuno", "Japan", "CM"],
    ["Christantus Uche", "C. Uche", "Spain", "CM"],
    ["Lautaro Martinez Inter", "L. Inter", "Italy", "ST"],
    ["Alan Douglas", "A. Douglas", "China", "ST"],
    ["Nikola Vlasic", "N. Vlasic", "Italy", "CAM"],
    ["Ainsley Maitland-Niles", "A. Maitland-Niles", "France", "RB"],
    ["Samir Ujkani", "S. Ujkani", "Kosovo", "GK"],
    ["Marlon Freitas Botafogo", "M. Botafogo", "Brazil", "CDM"],
    ["Sinaly Diomande", "S. Diomande", "France", "CB"],
    ["Sivasspor Rey Manaj", "S. Manaj", "Turkey", "ST"],
    ["Jacques Ekomie", "J. Ekomie", "France", "LB"],
    ["Jerdy Schouten PSV", "J. PSV", "Netherlands", "CDM"],
    ["Pantelis Hatzidiakos", "P. Hatzidiakos", "Greece", "CB"],
    ["Abdul Fatawu Leicester", "A. Leicester", "England", "RW"],
    ["PAOK Andrija Zivkovic", "P. Zivkovic", "Greece", "RW"],
    ["Lucas Torreira", "L. Torreira", "Turkey", "CDM"],
    ["William Gomes", "W. Gomes", "Brazil", "LW"],
    ["Moise Kean Fiorentina", "M. Fiorentina", "Italy", "ST"],
    ["Mario Mitaj", "M. Mitaj", "Albania", "LB"],
    ["Deyverson", "Deyverson", "Brazil", "ST"],
    ["Atletico Nacional Harlen Castillo", "A. Castillo", "Colombia", "GK"],
    ["Dallas Petar Musa", "D. Musa", "USA", "ST"],
    ["Jens Toornstra", "J. Toornstra", "Netherlands", "CM"],
    ["Sebastian Coates", "S. Coates", "Uruguay", "CB"],
    ["Fabio Cardoso Espanyol", "F. Espanyol", "Spain", "CB"],
    ["Freiburg Noah Atubolu", "F. Atubolu", "Germany", "GK"],
    ["Ilaix Moriba", "I. Moriba", "Spain", "CM"],
    ["Mohammed Al-Breik Hilal", "M. Hilal", "Saudi Arabia", "RB"],
    ["Fernando Gorriaran", "F. Gorriaran", "Mexico", "CM"],
    ["Mamadou Diambou", "M. Diambou", "Austria", "CDM"],
    ["Daniel Mosquera", "D. Mosquera", "Italy", "ST"],
    ["Kaio Cesar", "K. Cesar", "Portugal", "LW"],
    ["Sekou Sylla", "S. Sylla", "Guinea", "CB"],
    ["Galeno Porto", "G. Porto", "Portugal", "LW"],
    ["Norman Theuerkauf", "N. Theuerkauf", "Germany", "CB"],
    ["Brian Rodriguez America", "B. America", "Mexico", "LW"],
    ["Mattia Viti", "M. Viti", "Italy", "CB"],
    ["Stanis Idumbo", "S. Idumbo", "Spain", "RW"],
    ["Gabriel Veron", "G. Veron", "Brazil", "LW"],
    ["Ahmed Yasser Rayan Ahly", "A. Ahly", "Egypt", "ST"],
    ["Facundo Mura", "F. Mura", "Argentina", "RB"],
    ["Ibrahim Sehic", "I. Sehic", "Bosnia and Herzegovina", "GK"],
    ["Brandon Aguilera", "B. Aguilera", "Costa Rica", "CAM"],
    ["Saud Abdulhamid Hilal", "S. Hilal", "Saudi Arabia", "RB"],
    ["Kamil Piatkowski", "K. Piatkowski", "Austria", "CB"],
    ["Viljami Sinisalo", "V. Sinisalo", "Finland", "GK"],
    ["Felix Torres", "F. Torres", "Brazil", "CB"],
    ["Leonardo Sigali", "L. Sigali", "Argentina", "CB"],
    ["Pablo Rosario Nice", "P. Nice", "France", "CDM"],
    ["Ignacio Malcorra", "I. Malcorra", "Argentina", "CAM"],
    ["Ayase Ueda Feyenoord", "A. Feyenoord", "Netherlands", "ST"],
    ["Bruma Benfica", "B. Benfica", "Portugal", "RW"],
    ["Vasil Kusej", "V. Kusej", "Czech Republic", "LW"],
    ["Tarik Tissoudali Morocco", "T. Morocco", "Morocco", "ST"],
    ["Alvaro Fernandez GK", "A. GK", "Spain", "GK"],
    ["Koen Casteels Wolfsburg", "K. Wolfsburg", "Germany", "GK"],
    ["Milot Rashica Kosovo", "M. Kosovo", "Kosovo", "LW"],
    ["Christopher Wooh Rennes", "C. Rennes", "France", "CB"],
    ["Jordan Lotomba Nice", "J. Nice", "France", "RB"],
    ["Um Ji-sung Korea", "U. Korea", "South Korea", "LW"],
    ["Romain Saiss Morocco", "R. Morocco", "Morocco", "CB"],
    ["Kevin Escamilla", "K. Escamilla", "Mexico", "CM"],
    ["Noah Holm", "N. Holm", "Norway", "ST"],
    ["Viktor Johansson", "V. Johansson", "England", "GK"],
    ["Cyrille Bayala", "C. Bayala", "Burkina Faso", "LW"],
    ["Niko Jankovic", "N. Jankovic", "Croatia", "CAM"],
    ["Abner Vinicius", "A. Vinicius", "France", "LB"],
    ["Jarne Steuckers", "J. Steuckers", "Belgium", "CAM"],
    ["Shavy Babicka Gabon", "S. Gabon", "Gabon", "ST"],
    ["Show", "Show", "Angola", "CDM"],
    ["Mohamed Sherif Ahly", "M. Ahly", "Egypt", "ST"],
    ["Kacper Urbanski Poland", "K. Poland", "Poland", "CAM"],
    ["Evanilson Jr", "E. Jr", "England", "ST"],
    ["Nuno Tavares Lazio", "N. Lazio", "Italy", "LB"],
    ["Phillipp Mwene Austria", "P. Austria", "Austria", "LB"],
    ["Zineddine Belaid", "Z. Belaid", "Algeria", "CB"],
    ["Igor Coronado", "I. Coronado", "Brazil", "CAM"],
    ["Marko Stamenic", "M. Stamenic", "New Zealand", "CM"],
    ["Marcel Sabitzer Dortmund", "M. Dortmund", "Germany", "CM"],
    ["Orlando Facundo Torres Orlando", "O. Orlando", "USA", "LW"],
    ["Luis Chavez Mexico", "L. Mexico", "Mexico", "CM"],
    ["Gimnasia Nelson Insfran", "G. Insfran", "Argentina", "GK"],
    ["Josue Casimir", "J. Casimir", "France", "LW"],
    ["Benjamin Tahirovic", "B. Tahirovic", "Bosnia and Herzegovina", "CDM"],
    ["Tomas Cvancara", "T. Cvancara", "Germany", "ST"],
    ["Mickael Nade", "M. Nade", "France", "CB"],
    ["Sergio Canales Monterrey", "S. Monterrey", "Mexico", "CAM"],
    ["Uros Spajic", "U. Spajic", "Serbia", "CB"],
    ["Jackson Irvine Australia", "J. Australia", "Australia", "CM"],
    ["Mohamed Kanno Hilal", "M. Hilal", "Saudi Arabia", "CDM"],
    ["Gernot Trauner Austria", "G. Austria", "Austria", "CB"],
    ["Jamiro Monteiro", "J. Monteiro", "Cape Verde", "CM"],
    ["Sikou Niakate Braga", "S. Braga", "Portugal", "CB"],
    ["Alessandro Bianco", "A. Bianco", "Italy", "CDM"],
    ["Matte Smets Genk", "M. Genk", "Belgium", "CB"],
    ["Patrick Mainka", "P. Mainka", "Germany", "CB"],
    ["Brann Mathias Dyngeland Brann", "B. Brann", "Norway", "GK"],
    ["Angel Mena", "A. Mena", "Mexico", "RW"],
    ["Hussein Ali Iraq", "H. Iraq", "Iraq", "RB"],
    ["Ali Mabkhout UAE", "A. UAE", "United Arab Emirates", "ST"],
    ["Salis Abdul Samed Ghana", "S. Ghana", "Ghana", "CDM"],
    ["Serge Aurier CIV", "S. CIV", "Ivory Coast", "RB"],
    ["Salomon Rondon", "S. Rondon", "Venezuela", "ST"],
    ["Danilo D'Ambrosio", "D. D'Ambrosio", "Italy", "CB"],
    ["Coba da Costa", "C. da Costa", "Spain", "LW"],
    ["Joe Bell", "J. Bell", "New Zealand", "CDM"],
    ["Gauthier Gallon", "G. Gallon", "France", "GK"],
    ["Reinaldo", "Reinaldo", "Brazil", "LB"],
    ["Mark McKenzie USA", "M. USA", "USA", "CB"],
    ["Ibrahim Bayesh Iraq", "I. Iraq", "Iraq", "LW"],
    ["Eliesse Ben Seghir Monaco", "E. Ben Seghir Monaco", "France", "LW"],
    ["Canobbio", "Canobbio", "Brazil", "RW"],
    ["Atletico Mineiro Everson Galo", "A. Galo", "Brazil", "GK"],
    ["Noah Sadiki", "N. Sadiki", "Belgium", "CM"],
    ["Savarino", "Savarino", "Brazil", "CAM"],
    ["Marko Jankovic", "M. Jankovic", "Montenegro", "CM"],
    ["Julian Alvarez Atletico", "J. Atletico", "Spain", "ST"],
    ["Darwin Machis", "D. Machis", "Venezuela", "LW"],
    ["Ademola Lookman Atalanta", "A. Atalanta", "Italy", "LW"],
    ["Lassine Sinayoko", "L. Sinayoko", "France", "ST"],
    ["Austin Sebastian Driussi", "A. Driussi", "USA", "CAM"],
    ["Fabio Lima UAE", "F. UAE", "United Arab Emirates", "CAM"],
    ["Fahad Talib Iraq", "F. Iraq", "Iraq", "GK"],
    ["Zurich Yanick Brecher", "Z. Brecher", "Switzerland", "GK"],
    ["Rafael Romo", "R. Romo", "Venezuela", "GK"],
    ["Antoine Mendy Nice", "A. Nice", "France", "RB"],
    ["Dango Ouattara Burkina", "D. Burkina", "Burkina Faso", "RW"],
    ["Brede Moe", "B. Moe", "Norway", "CB"],
    ["Khuliso Mudau", "K. Mudau", "South Africa", "RB"],
    ["Aleksandr Golovin Monaco", "A. Monaco", "France", "CAM"],
    ["Ramon Juarez", "R. Juarez", "Mexico", "CB"],
    ["Antonio Sanabria Paraguay", "A. Paraguay", "Paraguay", "ST"],
    ["Ander Guevara", "A. Guevara", "Spain", "CM"],
    ["Majid Hosseini Iran", "M. Iran", "Iran", "CB"],
    ["Tammy Abraham Milan", "T. Milan", "Italy", "ST"],
    ["Hidemasa Morita Sporting", "H. Sporting", "Portugal", "CM"],
    ["Fabio Silva", "F. Silva", "Spain", "ST"],
    ["Irvin Cardona", "I. Cardona", "Spain", "ST"],
    ["Salih Ozcan Turkey", "S. Turkey", "Turkey", "CDM"],
    ["Anouar Ait El Hadj", "A. Ait El Hadj", "Belgium", "CAM"],
    ["Gustavo Gomez Paraguay", "G. Paraguay", "Paraguay", "CB"],
    ["Philipp Kohn Monaco", "P. Monaco", "France", "GK"],
    ["Baris Alper Yilmaz", "B. Yilmaz", "Turkey", "RW"],
    ["Fernandinho China", "F. China", "China", "CM"],
    ["Kim Ji-soo Korea", "K. Korea", "South Korea", "CB"],
    ["Necaxa Ezequiel Unsain", "N. Unsain", "Mexico", "GK"],
    ["Mostafa Mohamed Nantes", "M. Nantes", "France", "ST"],
    ["Raghed Al-Najjar Nassr", "R. Nassr", "Saudi Arabia", "GK"],
    ["Bryan Reyna", "B. Reyna", "Peru", "LW"],
    ["Tiquinho Soares", "T. Soares", "Brazil", "ST"],
    ["Josh Dasilva", "J. Dasilva", "England", "CM"],
    ["Salem Al-Dawsari Hilal", "S. Hilal", "Saudi Arabia", "LW"],
    ["Jesus Owono", "J. Owono", "Spain", "GK"],
    ["Naby Keita", "N. Keita", "Guinea", "CM"],
    ["Union Berlin Frederik Ronnow", "U. Ronnow", "Germany", "GK"],
    ["Joe Bursik", "J. Bursik", "England", "GK"],
    ["Tomas Holes", "T. Holes", "Czech Republic", "CDM"],
    ["Rayan", "Rayan", "Brazil", "LW"],
    ["Santiago Bueno Uruguay", "S. Uruguay", "Uruguay", "CB"],
    ["Walter Bou", "W. Bou", "Argentina", "ST"],
    ["Gent Davy Roef", "G. Roef", "Belgium", "GK"],
    ["Brandon Thomas", "B. Thomas", "Greece", "ST"],
    ["Molde Jacob Karlstrom", "M. Karlstrom", "Norway", "GK"],
    ["Luiz Junior", "L. Junior", "Spain", "GK"],
    ["Joel Pohjanpalo Finland", "J. Finland", "Finland", "ST"],
    ["Matias Vecino Uruguay", "M. Uruguay", "Uruguay", "CM"],
    ["David Carmo Olympiacos", "D. Olympiacos", "Greece", "CB"],
    ["Attila Fiola", "A. Fiola", "Hungary", "RB"],
    ["Oscar Mingueza", "O. Mingueza", "Spain", "RB"],
    ["Baek Seung-ho Korea", "B. Korea", "South Korea", "CM"],
    ["Taras Stepanenko", "T. Stepanenko", "Ukraine", "CDM"],
    ["Seifeddine Jaziri Tunisia", "S. Tunisia", "Tunisia", "ST"],
    ["Yassine Meriah Tunisia", "Y. Tunisia", "Tunisia", "CB"],
    ["Panathinaikos Bart Schenkeveld", "P. Schenkeveld", "Greece", "CB"],
    ["Ryan Christie Jr", "R. Jr", "England", "CAM"],
    ["Elias Mokwana", "E. Mokwana", "South Africa", "LW"],
    ["Enzo Loiodice", "E. Loiodice", "Spain", "CDM"],
    ["Carlos Coronel", "C. Coronel", "Paraguay", "GK"],
    ["Jorgen Strand Larsen Norway", "J. Norway", "Norway", "ST"],
    ["Nathan Silva", "N. Silva", "Mexico", "CB"],
    ["Robin Propper", "R. Propper", "Netherlands", "CB"],
    ["Ali Gabr Pyramids", "A. Pyramids", "Egypt", "CB"],
    ["Bart Nieuwkoop Feyenoord", "B. Feyenoord", "Netherlands", "RB"],
    ["Roberto Fernandez", "R. Fernandez", "Paraguay", "GK"],
    ["Hendrik Van Crombrugge Genk", "H. Van Crombrugge Genk", "Belgium", "GK"],
    ["Park Yong-woo Korea", "P. Korea", "South Korea", "CDM"],
    ["Li Yuanyi", "L. Yuanyi", "China", "CM"],
    ["Henry Martin Mexico", "H. Mexico", "Mexico", "ST"],
    ["Andriy Yarmolenko", "A. Yarmolenko", "Ukraine", "RW"],
    ["Roger Fernandes Braga", "R. Braga", "Portugal", "RW"],
    ["Eduard Spertsyan", "E. Spertsyan", "Russia", "CAM"],
    ["Nampalys Mendy Senegal", "N. Senegal", "Senegal", "CDM"],
    ["Joachim Andersen Denmark", "J. Denmark", "Denmark", "CB"],
    ["Armando Obispo", "A. Obispo", "Netherlands", "CB"],
    ["Georges Mikautadze Georgia", "G. Georgia", "Georgia", "ST"],
    ["Lucas Rosa", "L. Rosa", "Spain", "RB"],
    ["Paul Onuachu Jr", "P. Jr", "England", "ST"],
    ["Romano Schmid Austria", "R. Austria", "Austria", "CAM"],
    ["Vinicius Lopes", "V. Lopes", "Portugal", "ST"],
    ["Botafogo John Victor", "B. Victor", "Brazil", "GK"],
    ["Darko Churlinov", "D. Churlinov", "North Macedonia", "LW"],
    ["Hamari Traore Mali", "H. Mali", "Mali", "RB"],
    ["Radovan Pankov", "R. Pankov", "Poland", "CB"],
    ["Vlad Chiriches", "V. Chiriches", "Romania", "CB"],
    ["Strahinja Erakovic", "S. Erakovic", "Russia", "CB"],
    ["Ali Gholizadeh Lech", "A. Lech", "Poland", "LW"],
    ["Nahuel Molina Atletico", "N. Atletico", "Spain", "RB"],
    ["Timothy Weah Juve", "T. Juve", "Italy", "RW"],
    ["Robert Andrich Leverkusen", "R. Leverkusen", "Germany", "CDM"],
    ["Caio Alexandre", "C. Alexandre", "Brazil", "CM"],
    ["Sergio Carreira", "S. Carreira", "Spain", "RB"],
    ["Hidemasa Morita Japan", "H. Japan", "Japan", "CM"],
    ["Enyimba Olorunleke Ojo", "E. Ojo", "Nigeria", "GK"],
    ["Alessandro Gabrielloni", "A. Gabrielloni", "Italy", "ST"],
    ["Ole Selnaes", "O. Selnaes", "Norway", "CDM"],
    ["Niko Sigur", "N. Sigur", "Canada", "CM"],
    ["Marcelo Diaz U", "M. U", "Chile", "CDM"],
    ["Kenan Yildiz", "K. Yildiz", "Italy", "LW"],
    ["Marco Sportiello Milan", "M. Milan", "Italy", "GK"],
    ["Alieu Fadera", "A. Fadera", "Italy", "LW"],
    ["Kotoko Frederick Asare", "K. Asare", "Ghana", "GK"],
    ["Jeanuel Belocian", "J. Belocian", "Germany", "CB"],
    ["Miguel Almiron", "M. Almiron", "England", "RW"],
    ["Toluca Tiago Volpi", "T. Volpi", "Mexico", "GK"],
    ["Andreas Hanche-Olsen", "A. Hanche-Olsen", "Germany", "CB"],
    ["Hearts of Oak Richmond Ayi", "H. of Oak Richmond Ayi", "Ghana", "GK"],
    ["Mert Gunok", "M. Gunok", "Turkey", "GK"],
    ["Shuto Machino Japan", "S. Japan", "Japan", "ST"],
    ["Oliver Antman", "O. Antman", "Finland", "RW"],
    ["Gustaf Nilsson Brugge", "G. Brugge", "Belgium", "ST"],
    ["Gerson Flamengo", "G. Flamengo", "Brazil", "CM"],
    ["Simon Sohm", "S. Sohm", "Italy", "CM"],
    ["Quinten Timber Feyenoord", "Q. Feyenoord", "Netherlands", "CM"],
    ["Manvir Singh", "M. Singh", "India", "ST"],
    ["Shkelqim Vladi", "S. Vladi", "Switzerland", "ST"],
    ["Gustavo Mantuan", "G. Mantuan", "Russia", "LW"],
    ["Sebastien Haller Utrecht", "S. Utrecht", "Netherlands", "ST"],
    ["Lukas Hornicek Braga", "L. Braga", "Portugal", "GK"],
    ["Boubakary Soumare", "B. Soumare", "England", "CDM"],
    ["Pape Abou Cisse Senegal", "P. Senegal", "Senegal", "CB"],
    ["Giacomo Raspadori Napoli", "G. Napoli", "Italy", "ST"],
    ["Kiel Timon Weiner", "K. Weiner", "Germany", "GK"],
    ["Birger Meling", "B. Meling", "Norway", "LB"],
    ["Estevao Palmeiras", "E. Palmeiras", "Brazil", "RW"],
    ["Danilo dos Santos", "D. dos Santos", "England", "CM"],
    ["Bryan Oviedo", "B. Oviedo", "Costa Rica", "LB"],
    ["Ivan Jaime Benfica", "I. Benfica", "Portugal", "CAM"],
    ["Francisco Calvo", "F. Calvo", "Costa Rica", "CB"],
    ["Raphael Varane", "R. Varane", "Italy", "CB"],
    ["Javier Aquino", "J. Aquino", "Mexico", "RB"],
    ["Carlos Bacca", "C. Bacca", "Colombia", "ST"],
    ["Bruno Miranda", "B. Miranda", "Bolivia", "ST"],
    ["Luis Romo Mexico", "L. Mexico", "Mexico", "CM"],
    ["Franco Israel Sporting", "F. Sporting", "Portugal", "GK"],
    ["Anass Zaroury Lens", "A. Lens", "France", "LW"],
    ["Mazatlan Ricardo Gutierrez", "M. Gutierrez", "Mexico", "GK"],
    ["Mateo Cassierra", "M. Cassierra", "Russia", "ST"],
    ["Marcelo Herrera", "M. Herrera", "Argentina", "LB"],
    ["Nelson Semedo Jr", "N. Jr", "England", "RB"],
    ["Everton Ribeiro Flamengo", "E. Flamengo", "Brazil", "CAM"],
    ["Piero Hincapie Ecuador", "P. Ecuador", "Ecuador", "CB"],
    ["Konstantinos Karetsas", "K. Karetsas", "Greece", "CAM"],
    ["Yerry Mina Cagliari", "Y. Cagliari", "Italy", "CB"],
    ["Kevin Vogt Union", "K. Union", "Germany", "CB"],
    ["Antoni Milambo Feyenoord", "A. Feyenoord", "Netherlands", "CM"],
    ["Inter Miami Drake Callender", "I. Callender", "USA", "GK"],
    ["Yasin Ayari", "Y. Ayari", "Sweden", "CM"],
    ["Anatoliy Trubin Benfica", "A. Benfica", "Portugal", "GK"],
    ["Bamba Dieng Senegal", "B. Senegal", "Senegal", "ST"],
    ["William Boving", "W. Boving", "Austria", "LW"],
    ["Luka Elsnik", "L. Elsnik", "Slovenia", "CM"],
    ["Georges-Kevin Nkoudou Cameroon", "G. Cameroon", "Cameroon", "LW"],
    ["Eduardo Quaresma", "E. Quaresma", "Portugal", "CB"],
    ["Daniel Jebbison", "D. Jebbison", "England", "ST"],
    ["Bertrand Traore Burkina", "B. Burkina", "Burkina Faso", "RW"],
    ["Utrecht Vasilis Barkas", "U. Barkas", "Netherlands", "GK"],
    ["Ardian Ismajli Empoli", "A. Empoli", "Italy", "CB"],
    ["Alexander Jeremejeff", "A. Jeremejeff", "Greece", "ST"],
    ["Jonathan David Lille", "J. Lille", "France", "ST"],
    ["Hans Nicolussi Caviglia", "H. Caviglia", "Italy", "CDM"],
    ["Teofilo Gutierrez", "T. Gutierrez", "Colombia", "ST"],
    ["Nayef Aguerd Morocco", "N. Morocco", "Morocco", "CB"],
    ["Eirik Hestad", "E. Hestad", "Norway", "CM"],
    ["Armando Izzo", "A. Izzo", "Italy", "CB"],
    ["Kiko Femenia", "K. Femenia", "Spain", "RB"],
    ["Alexander Prass Sturm", "A. Sturm", "Austria", "LB"],
    ["St Louis Roman Burki", "S. Burki", "USA", "GK"],
    ["Levi Garcia", "L. Garcia", "Greece", "LW"],
    ["Khalifa Al-Hammadi UAE", "K. UAE", "United Arab Emirates", "CB"],
    ["Mohammed Al-Owais Hilal", "M. Hilal", "Saudi Arabia", "GK"],
    ["Mayke", "Mayke", "Brazil", "RB"],
    ["Yira Sor Genk", "Y. Genk", "Belgium", "LW"],
    ["Carlos Rodriguez Mexico", "C. Mexico", "Mexico", "CM"],
    ["Bjorn Meijer Brugge", "B. Brugge", "Belgium", "LB"],
    ["Everton Ribeiro Bahia", "E. Bahia", "Brazil", "CAM"],
    ["Inaki Williams Ghana", "I. Ghana", "Ghana", "ST"],
    ["Zan Karnicnik", "Z. Karnicnik", "Slovenia", "RB"],
    ["Rodrigo Zalazar Uruguay", "R. Uruguay", "Uruguay", "CAM"],
    ["Cesar Azpilicueta", "C. Azpilicueta", "Spain", "RB"],
    ["Yunis Abdelhamid", "Y. Abdelhamid", "France", "CB"],
    ["Edgar Barcenas", "E. Barcenas", "Panama", "RW"],
    ["Alexander Isak Sweden", "A. Sweden", "Sweden", "ST"],
    ["Nikola Krstovic Montenegro", "N. Montenegro", "Montenegro", "ST"],
    ["Manolis Saliakas", "M. Saliakas", "Germany", "RB"],
    ["Nicolas Seiwald Austria", "N. Austria", "Austria", "CDM"],
    ["Mohamed El-Shenawy Ahly", "M. Ahly", "Egypt", "GK"],
    ["Mohamed Elneny Jazira", "M. Jazira", "Egypt", "CM"],
    ["Ismael Kone OM", "I. OM", "France", "CM"],
    ["Teddy Teuma", "T. Teuma", "France", "CM"],
    ["Gatito Fernandez", "G. Fernandez", "Paraguay", "GK"],
    ["Erik Lira", "E. Lira", "Mexico", "CDM"],
    ["Mohamed Ali Ben Romdhane Tunisia", "M. Ali Ben Romdhane Tunisia", "Tunisia", "CM"],
    ["Noor Al-Rawabdeh", "N. Al-Rawabdeh", "Jordan", "CM"],
    ["Ivan Ordets", "I. Ordets", "Germany", "CB"],
    ["Pablo Maffeo Jr", "P. Jr", "Spain", "RB"],
    ["Omar Alderete Paraguay", "O. Paraguay", "Paraguay", "CB"],
    ["Filip Jorgensen Denmark", "F. Denmark", "Denmark", "GK"],
    ["Yasser Ibrahim Ahly", "Y. Ahly", "Egypt", "CB"],
    ["Fabricio Bruno Flamengo", "F. Flamengo", "Brazil", "CB"],
    ["Bartosz Bereszynski", "B. Bereszynski", "Poland", "RB"],
    ["Kashima Ryotaro Araki", "K. Araki", "Japan", "CAM"],
    ["Mahmoud Kahraba Ahly", "M. Ahly", "Egypt", "ST"],
    ["Nashville Hany Mukhtar", "N. Mukhtar", "USA", "CAM"],
    ["Samuel Essende DRC", "S. DRC", "DR Congo", "ST"],
    ["Ao Tanaka Japan", "A. Japan", "Japan", "CM"],
    ["Christopher Jullien", "C. Jullien", "France", "CB"],
    ["George Hirst Jr", "G. Jr", "England", "ST"],
    ["Ulsan Jo Hyeon-woo Ulsan", "U. Ulsan", "South Korea", "GK"],
    ["Bruno Henrique Flamengo", "B. Flamengo", "Brazil", "LW"],
    ["Gil Vicente Andrew", "G. Andrew", "Portugal", "GK"],
    ["Luis Milla", "L. Milla", "Spain", "CM"],
    ["Pierre-Emile Hojbjerg", "P. Hojbjerg", "France", "CDM"],
    ["Elias Montiel", "E. Montiel", "Mexico", "CM"],
    ["Guido Pizarro", "G. Pizarro", "Mexico", "CDM"],
    ["Luis Vazquez Anderlecht", "L. Anderlecht", "Belgium", "ST"],
    ["Wojciech Szczesny Poland", "W. Poland", "Poland", "GK"],
    ["Andres Guardado", "A. Guardado", "Mexico", "CM"],
    ["Theo Bair Canada", "T. Canada", "Canada", "ST"],
    ["Arthur Cabral Benfica", "A. Benfica", "Portugal", "ST"],
    ["Andreas Gruber", "A. Gruber", "Austria", "LW"],
    ["Niccolo Pisilli", "N. Pisilli", "Italy", "CM"],
    ["Jon Moncayola", "J. Moncayola", "Spain", "CM"],
    ["Kasper Dolberg Denmark", "K. Denmark", "Denmark", "ST"],
    ["Javi Munoz", "J. Munoz", "Spain", "CM"],
    ["Ali Ahmed Canada", "A. Canada", "Canada", "LW"],
    ["Osame Sahraoui Lille", "O. Lille", "France", "LW"],
    ["Afonso Sousa", "A. Sousa", "Poland", "CAM"],
    ["Alphonso Davies Canada2", "A. Canada2", "Canada", "LB"],
    ["Rafa Mujica Arouca", "R. Arouca", "Portugal", "ST"],
    ["Samuel Moutoussamy", "S. Moutoussamy", "DR Congo", "CDM"],
    ["Ignacio", "Ignacio", "Brazil", "CB"],
    ["Juan Cruz", "J. Cruz", "Spain", "LB"],
    ["Jesus Corona", "J. Corona", "Mexico", "RW"],
    ["Roberto Piccoli Cagliari", "R. Cagliari", "Italy", "ST"],
    ["Julian Ryerson Norway", "J. Norway", "Norway", "RB"],
    ["Andre Ayew Ghana", "A. Ghana", "Ghana", "LW"],
    ["Kelechi Iheanacho Nigeria", "K. Nigeria", "Nigeria", "ST"],
    ["Kristoffer Olsson", "K. Olsson", "Denmark", "CM"],
    ["Al Ain Soufiane Rahimi Ain", "A. Ain", "United Arab Emirates", "ST"],
    ["Hauke Wahl", "H. Wahl", "Germany", "CB"],
    ["Ferdi Kadioglu Turkey", "F. Turkey", "Turkey", "LB"],
    ["Bernabei", "Bernabei", "Brazil", "LB"],
    ["Flamengo Agustin Rossi", "F. Rossi", "Brazil", "GK"],
    ["Lucas Holer", "L. Holer", "Germany", "ST"],
    ["Horatiu Moldovan", "H. Moldovan", "Romania", "GK"],
    ["Warren Bondo", "W. Bondo", "Italy", "CM"],
    ["Zeki Celik Turkey", "Z. Turkey", "Turkey", "RB"],
    ["Jesus Sagredo", "J. Sagredo", "Bolivia", "RB"],
    ["Mohamed Reda", "M. Reda", "Egypt", "LB"],
    ["Jawad El Yamiq Morocco", "J. El Yamiq Morocco", "Morocco", "CB"],
    ["Bandar Al-Ahbabi UAE", "B. UAE", "United Arab Emirates", "RB"],
    ["Lovro Majer Croatia", "L. Croatia", "Croatia", "CAM"],
    ["Monaco Radoslaw Majecki Monaco", "M. Monaco", "France", "GK"],
    ["Nasser Maher", "N. Maher", "Egypt", "CM"],
    ["Ismail Yuksek Fener", "I. Fener", "Turkey", "CDM"],
    ["Matheus Reis Sporting", "M. Sporting", "Portugal", "LB"],
    ["Midtjylland Jonas Lossl", "M. Lossl", "Denmark", "GK"],
    ["Fagner", "Fagner", "Brazil", "RB"],
    ["Ante Budimir Croatia", "A. Croatia", "Croatia", "ST"],
    ["Facundo Torres Uruguay", "F. Uruguay", "Uruguay", "LW"],
    ["Ismael Bennacer Algeria", "I. Algeria", "Algeria", "CM"],
    ["Marseille Geronimo Rulli OM", "M. OM", "France", "GK"],
    ["Rasmus Hojlund Denmark", "R. Denmark", "Denmark", "ST"],
    ["Facundo Pellistri Uruguay", "F. Uruguay", "Uruguay", "RW"],
    ["Elias Hernandez", "E. Hernandez", "Mexico", "CM"],
    ["Martin Adam", "M. Adam", "Hungary", "ST"],
    ["Willum Willumsson", "W. Willumsson", "Netherlands", "CM"],
    ["Gedson Fernandes", "G. Fernandes", "Turkey", "CM"],
    ["Khalil Ibrahim UAE", "K. UAE", "United Arab Emirates", "LW"],
    ["Erik Janza", "E. Janza", "Slovenia", "LB"],
    ["Marcus Pedersen", "M. Pedersen", "Italy", "RB"],
    ["Pedro Guilherme Flamengo", "P. Flamengo", "Brazil", "ST"],
    ["Kassoum Ouattara", "K. Ouattara", "France", "LB"],
    ["Gustaf Lagerbielke", "G. Lagerbielke", "Sweden", "CB"],
    ["Jon Dagur Thorsteinsson", "J. Thorsteinsson", "Iceland", "LW"],
    ["Alessandro Vogliacco", "A. Vogliacco", "Italy", "CB"],
    ["Stanley Nsoki", "S. Nsoki", "Germany", "CB"],
    ["Kusini Yengi Australia", "K. Australia", "Australia", "ST"],
    ["Kaoru Mitoma Japan", "K. Japan", "Japan", "LW"],
    ["Amrinder Singh", "A. Singh", "India", "GK"],
    ["Conrad Harder", "C. Harder", "Portugal", "ST"],
    ["Geny Catamo Sporting", "G. Sporting", "Portugal", "RW"],
    ["Arthur Masuaku", "A. Masuaku", "Turkey", "LB"],
    ["Daniel Gretarsson", "D. Gretarsson", "Iceland", "CB"],
    ["Tete Morente", "T. Morente", "Italy", "LW"],
    ["Sunil Chhetri", "S. Chhetri", "India", "ST"],
    ["Sampson Dweh", "S. Dweh", "Czech Republic", "CB"],
    ["Santiago Nunez", "S. Nunez", "Argentina", "CB"],
    ["Elfsborg Michael Baidoo", "E. Baidoo", "Sweden", "CM"],
    ["Cerro Porteno Alexis Martin Arias", "C. Arias", "Paraguay", "GK"],
    ["Nicolo Casale", "N. Casale", "Italy", "CB"],
    ["Damion Lowe", "D. Lowe", "Jamaica", "CB"],
    ["Adrian Ramos", "A. Ramos", "Colombia", "ST"],
    ["Daniel Schmidt Japan", "D. Japan", "Japan", "GK"],
    ["Harib Abdalla UAE", "H. UAE", "United Arab Emirates", "RW"],
    ["Elias Jelert", "E. Jelert", "Turkey", "RB"],
    ["Rasmus Kristensen Denmark", "R. Denmark", "Denmark", "RB"],
    ["Vladyslav Vanat", "V. Vanat", "Ukraine", "ST"],
    ["Tim Iroegbunam", "T. Iroegbunam", "England", "CM"],
    ["Universidad de Chile Cristobal Campos U", "U. de Chile Cristobal Campos U", "Chile", "GK"],
    ["Khalid Al-Ghannam Nassr", "K. Nassr", "Saudi Arabia", "RW"],
    ["Ruben Aguilar", "R. Aguilar", "France", "RB"],
    ["Andrei Burca", "A. Burca", "Romania", "CB"],
    ["Ze Rafael Palmeiras", "Z. Palmeiras", "Brazil", "CM"],
    ["Nikola Vasilj Bosnia", "N. Bosnia", "Bosnia and Herzegovina", "GK"],
    ["Francisco Moura", "F. Moura", "Portugal", "LB"],
    ["Andre Ayew", "A. Ayew", "France", "LW"],
    ["Tom Cannon", "T. Cannon", "England", "ST"],
    ["Etrit Berisha", "E. Berisha", "Italy", "GK"],
    ["Cristian Borja Braga", "C. Braga", "Portugal", "LB"],
    ["Lassina Traore Burkina", "L. Burkina", "Burkina Faso", "ST"],
    ["Adam Gnezda Cerin", "A. Cerin", "Slovenia", "CDM"],
    ["William Cruzeiro", "W. Cruzeiro", "Brazil", "RB"],
    ["Jan Vertonghen Anderlecht", "J. Anderlecht", "Belgium", "CB"],
    ["Franco Mastantuono River", "F. River", "Argentina", "CAM"],
    ["Basel Marwin Hitz Basel", "B. Basel", "Switzerland", "GK"],
    ["Mattia Bani", "M. Bani", "Italy", "CB"],
    ["Loyce Mbaba", "L. Mbaba", "Gabon", "GK"],
    ["David Jurasek Czech", "D. Czech", "Czech Republic", "LB"],
    ["Juan Carlos Kaliffa", "J. Kaliffa", "Turkey", "CB"],
    ["Junya Ito Reims", "J. Reims", "France", "RW"],
    ["Maghnes Akliouche Monaco", "M. Monaco", "France", "RW"],
    ["Anthony Mandrea Algeria", "A. Algeria", "Algeria", "GK"],
    ["Ismael Kone Canada", "I. Canada", "Canada", "CM"],
    ["Valladolid Karl Hein", "V. Hein", "Spain", "GK"],
    ["Javi Hernandez", "J. Hernandez", "Spain", "LB"],
    ["Youssef En-Nesyri Morocco", "Y. Morocco", "Morocco", "ST"],
    ["Ali Abdi Nice", "A. Nice", "France", "LB"],
    ["Yuma Suzuki", "Y. Suzuki", "Japan", "ST"],
    ["Jordan Morris Seattle", "J. Seattle", "USA", "LW"],
    ["Aron Donnum", "A. Donnum", "France", "LW"],
    ["Stefano Sabelli", "S. Sabelli", "Italy", "RB"],
    ["Ritsu Doan Freiburg", "R. Freiburg", "Germany", "RW"],
    ["Xu Xin", "X. Xin", "China", "CM"],
    ["Carlos Caceda", "C. Caceda", "Peru", "GK"],
    ["David Torres", "D. Torres", "Spain", "CB"],
    ["Bruno Pacheco", "B. Pacheco", "Brazil", "LB"],
    ["Bright Osayi-Samuel Nigeria", "B. Nigeria", "Nigeria", "RB"],
    ["Derlis Gonzalez", "D. Gonzalez", "Paraguay", "RW"],
    ["Lucas Moura SPFC", "L. SPFC", "Brazil", "RW"],
    ["Ahmad Nourollahi Iran", "A. Iran", "Iran", "CM"],
    ["Edgar Badia", "E. Badia", "Spain", "GK"],
    ["Arturo Vidal Chile", "A. Chile", "Chile", "CM"],
    ["David Hancko Feyenoord", "D. Feyenoord", "Netherlands", "CB"],
    ["Daniel Batz", "D. Batz", "Germany", "GK"],
    ["Bilal El Khannouss Morocco", "B. El Khannouss Morocco", "Morocco", "CAM"],
    ["Rui Silva Sporting", "R. Sporting", "Portugal", "GK"],
    ["David Brooks Jr", "D. Jr", "England", "RW"],
    ["Mathew Ryan Australia", "M. Australia", "Australia", "GK"],
    ["Ever Banega", "E. Banega", "Argentina", "CM"],
    ["Didier Ndong", "D. Ndong", "Gabon", "CM"],
    ["Marcos Andre", "M. Andre", "Spain", "ST"],
    ["Andres Mosquera Marmolejo", "A. Marmolejo", "Colombia", "GK"],
    ["Eyupspor Umut Bozok Eyup", "E. Eyup", "Turkey", "ST"],
    ["Eliesse Ben Seghir Morocco", "E. Ben Seghir Morocco", "Morocco", "LW"],
    ["Kalidou Koulibaly Hilal", "K. Hilal", "Saudi Arabia", "CB"],
    ["Bojan Miovski", "B. Miovski", "Spain", "ST"],
    ["Dailon Livramento", "D. Livramento", "Italy", "ST"],
    ["Ivan Leguizamon", "I. Leguizamon", "Argentina", "LW"],
    ["Youssef Amyn Iraq", "Y. Iraq", "Iraq", "CAM"],
    ["Kevin Alvarez Mexico", "K. Mexico", "Mexico", "RB"],
    ["Hernani", "Hernani", "Italy", "CM"],
    ["Joe Aribo Nigeria", "J. Nigeria", "Nigeria", "CM"],
    ["Visar Musliu", "V. Musliu", "North Macedonia", "CB"],
    ["Sandro Ramirez", "S. Ramirez", "Spain", "ST"],
    ["Brendan Chardonnet", "B. Chardonnet", "France", "CB"],
    ["Maurits Kjaergaard", "M. Kjaergaard", "Austria", "CM"],
    ["Gift Orban Lyon", "G. Lyon", "France", "ST"],
    ["Marko Dmitrovic", "M. Dmitrovic", "Spain", "GK"],
    ["Teddy Boulhendi", "T. Boulhendi", "France", "GK"],
    ["Damian Rodriguez", "D. Rodriguez", "Spain", "CM"],
    ["Orkun Kokcu Turkey", "O. Turkey", "Turkey", "CM"],
    ["Alisson Santana", "A. Santana", "Brazil", "LW"],
    ["Luis Haquin", "L. Haquin", "Bolivia", "CB"],
    ["Dries Mertens", "D. Mertens", "Turkey", "CAM"],
    ["Brice Samba Lens", "B. Lens", "France", "GK"],
    ["Kamil Grosicki", "K. Grosicki", "Poland", "LW"],
    ["Eric Bailly", "E. Bailly", "Spain", "CB"],
    ["Victor Gomez Braga", "V. Braga", "Portugal", "RB"],
    ["Anton Gaaei Ajax", "A. Ajax", "Netherlands", "RB"],
    ["Alexander Bah Denmark", "A. Denmark", "Denmark", "RB"],
    ["Santiago Arias Colombia", "S. Colombia", "Colombia", "RB"],
    ["Christoph Baumgartner Austria", "C. Austria", "Austria", "CAM"],
    ["Luis Mejia Panama", "L. Panama", "Panama", "GK"],
    ["Leo Petrot", "L. Petrot", "France", "LB"],
    ["Oussama Benbot", "O. Benbot", "Algeria", "GK"],
    ["Patrick Yazbek Australia", "P. Australia", "Australia", "CM"],
    ["Luke Woolfenden", "L. Woolfenden", "England", "CB"],
    ["Payet", "Payet", "Brazil", "CAM"],
    ["Pablo Mari", "P. Mari", "Italy", "CB"],
    ["Samir Caetano", "S. Caetano", "Mexico", "CB"],
    ["Myron Boadu", "M. Boadu", "Germany", "ST"],
    ["Ali Maaloul Tunisia", "A. Tunisia", "Tunisia", "LB"],
    ["Junior Alonso Paraguay", "J. Paraguay", "Paraguay", "CB"],
    ["Ahmed Al-Kassar Ahli", "A. Ahli", "Saudi Arabia", "GK"],
    ["Unai Garcia", "U. Garcia", "Spain", "CB"],
    ["Riccardo Orsolini Bologna", "R. Bologna", "Italy", "RW"],
    ["Kasper Hogh", "K. Hogh", "Norway", "ST"],
    ["Joseph Okumu", "J. Okumu", "France", "CB"],
    ["Carlos Lampe", "C. Lampe", "Bolivia", "GK"],
    ["Luka Sucic", "L. Sucic", "Croatia", "CM"],
    ["Arthur Hyppolito", "A. Hyppolito", "Germany", "RB"],
    ["Pol Lozano", "P. Lozano", "Spain", "CM"],
    ["Renato Tapia Peru", "R. Peru", "Peru", "CDM"],
    ["Oliver Edvardsen", "O. Edvardsen", "Netherlands", "LW"],
    ["Halil Akbunar", "H. Akbunar", "Turkey", "RW"],
    ["Jose Maria Gimenez Uruguay", "J. Uruguay", "Uruguay", "CB"],
    ["Ruben van Bommel", "R. van Bommel", "Netherlands", "LW"],
    ["Haitham Asiri Ahli", "H. Ahli", "Saudi Arabia", "RW"],
    ["Wesley Franca Flamengo", "W. Flamengo", "Brazil", "RB"],
    ["Nicolas Figal", "N. Figal", "Argentina", "CB"],
    ["Al Sadd Guilherme Torres", "A. Torres", "Qatar", "CM"],
    ["Stefan Lainer", "S. Lainer", "Germany", "RB"],
    ["Antalyaspor Sam Larsson", "A. Larsson", "Turkey", "LW"],
    ["Kiki Kouyate", "K. Kouyate", "France", "CB"],
    ["Sergio Pena", "S. Pena", "Peru", "CM"],
    ["Mohamed Abdelmonem Ahly", "M. Ahly", "Egypt", "CB"],
    ["Diego Conde", "D. Conde", "Spain", "GK"],
    ["Antonio Marchesano", "A. Marchesano", "Switzerland", "CAM"],
    ["Taulant Xhaka", "T. Xhaka", "Switzerland", "CDM"],
    ["Jaden Philogene Jr", "J. Jr", "England", "LW"],
    ["Joris Chotard", "J. Chotard", "France", "CM"],
    ["Chris Richards USA", "C. USA", "USA", "CB"],
    ["Jemerson", "Jemerson", "Brazil", "CB"],
    ["Dango Ouattara Jr", "D. Jr", "England", "RW"],
    ["Salvador Agra", "S. Agra", "Portugal", "RW"],
    ["Lallianzuala Chhangte", "L. Chhangte", "India", "RW"],
    ["Kevin Zenon", "K. Zenon", "Argentina", "LW"],
    ["Igor Nikic", "I. Nikic", "Montenegro", "GK"],
    ["Adnan Januzaj Sevilla", "A. Sevilla", "Spain", "RW"],
    ["Sebastian Szymanski Poland", "S. Poland", "Poland", "CAM"],
    ["Eren Dinkci", "E. Dinkci", "Germany", "LW"],
    ["Yoann Salmier", "Y. Salmier", "France", "CB"],
    ["Florian Muller", "F. Muller", "Germany", "GK"],
    ["Leo Ostigard Norway", "L. Norway", "Norway", "CB"],
    ["Bahereba Guirassy", "B. Guirassy", "France", "ST"],
    ["Lugano Amir Saipi", "L. Saipi", "Switzerland", "GK"],
    ["Stefan Strandberg", "S. Strandberg", "Norway", "CB"],
    ["Shoja Khalilzadeh Iran", "S. Iran", "Iran", "CB"],
    ["Jordan Morris USA", "J. USA", "USA", "LW"],
    ["Carlinhos", "Carlinhos", "Brazil", "ST"],
    ["Jhegson Mendez", "J. Mendez", "Ecuador", "CDM"],
    ["Goztepe Romulo Cardoso", "G. Cardoso", "Turkey", "ST"],
    ["Stiven Barreiro", "S. Barreiro", "Mexico", "CB"],
    ["Peter Pekarik", "P. Pekarik", "Slovakia", "RB"],
    ["Karol Mets", "K. Mets", "Germany", "CB"],
    ["Ersin Destanoglu Besiktas", "E. Besiktas", "Turkey", "GK"],
    ["Marcos Rojo Boca", "M. Boca", "Argentina", "CB"],
    ["Rodrigo Gomes Estoril", "R. Estoril", "Portugal", "RW"],
    ["Emirhan Topcu", "E. Topcu", "Turkey", "CB"],
    ["Isaac Schmidt", "I. Schmidt", "Germany", "LW"],
    ["Arber Hoxha", "A. Hoxha", "Croatia", "LW"],
    ["William Tesillo", "W. Tesillo", "Colombia", "CB"],
    ["Luka Jovic", "L. Jovic", "Italy", "ST"],
    ["Wilmar Barrios", "W. Barrios", "Russia", "CDM"],
    ["Ali Lajami Nassr", "A. Nassr", "Saudi Arabia", "CB"],
    ["Ramiz Zerrouki Feyenoord", "R. Feyenoord", "Netherlands", "CDM"],
    ["Antonio Nusa Norway", "A. Norway", "Norway", "LW"],
    ["Mohammad Ghorbani Iran", "M. Iran", "Iran", "CM"],
    ["Esteban Lepaul", "E. Lepaul", "France", "ST"],
    ["Karol Swiderski", "K. Swiderski", "Poland", "ST"],
    ["Nikola Moro", "N. Moro", "Italy", "CM"],
    ["Asmir Begovic", "A. Begovic", "England", "GK"],
    ["Felicio Milson", "F. Milson", "Angola", "RW"],
    ["Samet Akaydin", "S. Akaydin", "Turkey", "CB"],
    ["Suso", "Suso", "Spain", "RW"],
    ["Formose Mendy Senegal", "F. Senegal", "Senegal", "RB"],
    ["Lucas Chavez", "L. Chavez", "Bolivia", "LW"],
    ["Julian Ryerson Dortmund", "J. Dortmund", "Germany", "RB"],
    ["Oscar Dorley", "O. Dorley", "Czech Republic", "CDM"],
    ["Libertad Martin Silva", "L. Silva", "Paraguay", "GK"],
    ["Diego Luna", "D. Luna", "USA", "CAM"],
    ["Nathan Ngoumou", "N. Ngoumou", "Germany", "RW"],
    ["Mario Pasalic Croatia", "M. Croatia", "Croatia", "CM"],
    ["Gideon Mensah Ghana", "G. Ghana", "Ghana", "LB"],
    ["Reims Yehvann Diouf Reims", "R. Reims", "France", "GK"],
    ["Matej Kovar Czech", "M. Czech", "Czech Republic", "GK"],
    ["Arijanet Muric", "A. Muric", "England", "GK"],
    ["David Brekalo", "D. Brekalo", "Slovenia", "CB"],
    ["Garang Kuol Australia", "G. Australia", "Australia", "LW"],
    ["Ahmed Samy", "A. Samy", "Egypt", "CB"],
    ["Villarreal Alfonso Pedraza", "V. Pedraza", "Spain", "LB"],
    ["Coutinho", "Coutinho", "Brazil", "CAM"],
    ["Leandro Barreiro Benfica", "L. Benfica", "Portugal", "CM"],
    ["Yuki Soma Japan", "Y. Japan", "Japan", "LW"],
    ["Joakim Maehle Denmark", "J. Denmark", "Denmark", "LB"],
    ["Marcos Ledesma", "M. Ledesma", "Argentina", "GK"],
    ["Merlin Rohl", "M. Rohl", "Germany", "CM"],
    ["Stefan Medina", "S. Medina", "Mexico", "CB"],
    ["Jonathan Mensah", "J. Mensah", "Ghana", "CB"],
    ["Kaveh Rezaei Iran", "K. Iran", "Iran", "ST"],
    ["Ugurcan Cakir", "U. Cakir", "Turkey", "GK"],
    ["Gvidas Gineitis", "G. Gineitis", "Italy", "CM"],
    ["Musa Al-Taamari", "M. Al-Taamari", "Jordan", "RW"],
    ["Aleksandar Mitrovic", "A. Mitrovic", "Serbia", "ST"],
    ["Phillip Tietz", "P. Tietz", "Germany", "ST"],
    ["Robin Le Normand Atletico", "R. Le Normand Atletico", "Spain", "CB"],
    ["Sokratis Papastathopoulos", "S. Papastathopoulos", "Greece", "CB"],
    ["Ali Saleh UAE", "A. UAE", "United Arab Emirates", "RW"],
    ["Azzedine Ounahi Morocco", "A. Morocco", "Morocco", "CM"],
    ["Tajon Buchanan Canada", "T. Canada", "Canada", "RW"],
    ["Dario Osorio FCM", "D. FCM", "Denmark", "RW"],
    ["Manu Morlanes", "M. Morlanes", "Spain", "CM"],
    ["Aleksandr Sobolev", "A. Sobolev", "Russia", "ST"],
    ["Gift Orban Nigeria", "G. Nigeria", "Nigeria", "ST"],
    ["Robin Knoche", "R. Knoche", "Germany", "CB"],
    ["Viktor Johansson Sweden", "V. Sweden", "Sweden", "GK"],
    ["Karol Linetty", "K. Linetty", "Italy", "CM"],
    ["Andre-Pierre Gignac", "A. Gignac", "Mexico", "ST"],
    ["Paul Nardi", "P. Nardi", "Belgium", "GK"],
    ["Austria Wien Dominik Fitz", "A. Fitz", "Austria", "CAM"],
    ["Joao Moutinho Braga", "J. Braga", "Portugal", "CM"],
    ["Emil Ceide", "E. Ceide", "Norway", "LW"],
    ["El Bilal Toure", "E. Toure", "Mali", "ST"],
    ["Josue Pesqueira", "J. Pesqueira", "Poland", "CAM"],
    ["Moteb Al-Harbi Shabab", "M. Shabab", "Saudi Arabia", "LB"],
    ["Josh Sargent USA", "J. USA", "USA", "ST"],
    ["Bryan Gonzalez", "B. Gonzalez", "Mexico", "LB"],
    ["Adam Aznou Morocco", "A. Morocco", "Morocco", "LB"],
    ["Kike Garcia", "K. Garcia", "Spain", "ST"],
    ["Afimico Pululu", "A. Pululu", "Poland", "ST"],
    ["Youcef Atal Algeria", "Y. Algeria", "Algeria", "RB"],
    ["Sandi Lovric", "S. Lovric", "Italy", "CM"],
    ["Ciro Immobile Besiktas", "C. Besiktas", "Turkey", "ST"],
    ["Mikkel Desler", "M. Desler", "France", "RB"],
    ["Vladimir Coufal Czech", "V. Czech", "Czech Republic", "RB"],
    ["Fenerbahce Dominik Livakovic Fener", "F. Fener", "Turkey", "GK"],
    ["Tiago Palacios", "T. Palacios", "Argentina", "LW"],
    ["Kaua Elias", "K. Elias", "Brazil", "ST"],
    ["AZ Rome-Jayden Owusu-Oduro", "A. Owusu-Oduro", "Netherlands", "GK"],
    ["Steve Rouiller", "S. Rouiller", "Switzerland", "CB"],
    ["Chuba Akpom Ajax", "C. Ajax", "Netherlands", "ST"],
    ["Robert Morales", "R. Morales", "Paraguay", "ST"],
    ["Melvin Bard Nice", "M. Nice", "France", "LB"],
    ["Eren Elmali", "E. Elmali", "Turkey", "LB"],
    ["Abdulellah Al-Malki Hilal", "A. Hilal", "Saudi Arabia", "CDM"],
    ["Jordan Torunarigha", "J. Torunarigha", "Belgium", "CB"],
    ["Kepa Arrizabalaga Bournemouth", "K. Bournemouth", "England", "GK"],
    ["Lewin Blum", "L. Blum", "Switzerland", "RB"],
    ["Abdel Abqar", "A. Abqar", "Spain", "CB"],
    ["Alan Benitez", "A. Benitez", "Paraguay", "RB"],
    ["Wilker Angel", "W. Angel", "Venezuela", "CB"],
    ["Matej Jurasek", "M. Jurasek", "Czech Republic", "LW"],
    ["Ali Adnan Iraq", "A. Iraq", "Iraq", "LB"],
    ["Robert Navarro", "R. Navarro", "Spain", "CAM"],
    ["Evanilson Porto", "E. Porto", "Portugal", "ST"],
    ["Daniel Hakans", "D. Hakans", "Finland", "LW"],
    ["Asger Sorensen", "A. Sorensen", "Czech Republic", "CB"],
    ["Silas Katompa DRC", "S. DRC", "DR Congo", "RW"],
    ["Elian Irala", "E. Irala", "Argentina", "CDM"],
    ["Sander Berge Norway", "S. Norway", "Norway", "CM"],
    ["Alejandro Marques", "A. Marques", "Portugal", "ST"],
    ["Pavel Sulc", "P. Sulc", "Czech Republic", "CAM"],
    ["Joaquim Pereira", "J. Pereira", "Mexico", "CB"],
    ["Carlos Forbs Ajax", "C. Ajax", "Netherlands", "RW"],
    ["Ruben Botta", "R. Botta", "Argentina", "CAM"],
    ["Matheus Cunha Wolves", "M. Wolves", "England", "ST"],
    ["Amine Gouiri Rennes", "A. Rennes", "France", "ST"],
    ["Albert Rusnak", "A. Rusnak", "USA", "CAM"],
    ["Daniil Fomin", "D. Fomin", "Russia", "CDM"],
    ["Juan Camilo Hernandez", "J. Hernandez", "Colombia", "ST"],
    ["Mikkel Damsgaard Denmark", "M. Denmark", "Denmark", "CAM"],
    ["Sascha Horvath", "S. Horvath", "Austria", "CAM"],
    ["Javi Galan Atletico", "J. Atletico", "Spain", "LB"],
    ["Philipp Treu", "P. Treu", "Germany", "LB"],
    ["Morgan Sanson Nice", "M. Nice", "France", "CM"],
    ["Emre Can Dortmund", "E. Dortmund", "Germany", "CDM"],
    ["Shuto Machino Kiel", "S. Kiel", "Germany", "ST"],
    ["Mustafa Nadhim Iraq", "M. Iraq", "Iraq", "CB"],
    ["Noah Okafor Swiss", "N. Swiss", "Switzerland", "LW"],
    ["Tomas Durso", "T. Durso", "Argentina", "GK"],
    ["Ondrej Duda Slovakia", "O. Slovakia", "Slovakia", "CM"],
    ["Yacine Adli Fiorentina", "Y. Fiorentina", "Italy", "CM"],
    ["Robson Matheus", "R. Matheus", "Bolivia", "CM"],
    ["Wei Shihao", "W. Shihao", "China", "RW"],
    ["Sebastiano Esposito Empoli", "S. Empoli", "Italy", "ST"],
    ["Otavio Galo", "O. Galo", "Brazil", "CDM"],
    ["Jens Odgaard", "J. Odgaard", "Italy", "CAM"],
    ["Mads Hermansen Denmark", "M. Denmark", "Denmark", "GK"],
    ["Alen Sherri Cagliari", "A. Cagliari", "Italy", "GK"],
    ["Luciano Rodriguez Uruguay", "L. Uruguay", "Uruguay", "ST"],
    ["Patrick Wimmer Austria", "P. Austria", "Austria", "RW"],
    ["Mikael Uhre", "M. Uhre", "USA", "ST"],
    ["Cedric Hountondji", "C. Hountondji", "France", "CB"],
    ["Oussama Targhalline Morocco", "O. Morocco", "Morocco", "CDM"],
    ["Oussama Idrissi Morocco", "O. Morocco", "Morocco", "LW"],
    ["Waldemar Anton Dortmund", "W. Dortmund", "Germany", "CB"],
    ["Sergio Romero Boca", "S. Boca", "Argentina", "GK"],
    ["Alvaro Morata", "A. Morata", "Italy", "ST"],
    ["Robert Rojas", "R. Rojas", "Paraguay", "RB"],
    ["Andy Delort", "A. Delort", "France", "ST"],
    ["Getsel Montes", "G. Montes", "Honduras", "CB"],
    ["Rasmus Falk", "R. Falk", "Denmark", "CM"],
    ["Nacho Fernandez River", "N. River", "Argentina", "CAM"],
    ["Faisal Al-Ghamdi", "F. Al-Ghamdi", "Saudi Arabia", "GK"],
    ["Wanderson", "Wanderson", "Brazil", "LW"],
    ["Ferdi Kadioglu", "F. Kadioglu", "England", "LB"],
    ["Luiz Gustavo", "L. Gustavo", "Brazil", "CDM"],
    ["Hjalmar Ekdal", "H. Ekdal", "Sweden", "CB"],
    ["Miguel Merentiel Boca", "M. Boca", "Argentina", "ST"],
    ["Andreas Albers", "A. Albers", "Germany", "ST"],
    ["Stanley Nwabali Nigeria", "S. Nigeria", "Nigeria", "GK"],
    ["Elijah Just", "E. Just", "New Zealand", "LW"],
    ["Jorge Benguche", "J. Benguche", "Honduras", "ST"],
    ["Faris Moumbagna Cameroon", "F. Cameroon", "Cameroon", "ST"],
    ["Leo Duarte", "L. Duarte", "Turkey", "CB"],
    ["Gelson Dala", "G. Dala", "Angola", "ST"],
    ["Georges Mikautadze Lyon", "G. Lyon", "France", "ST"],
    ["Amine El Ouazzani", "A. El Ouazzani", "Portugal", "ST"],
    ["Odin Bjortuft", "O. Bjortuft", "Norway", "CB"],
    ["Ibrahim Salah Morocco", "I. Morocco", "Morocco", "RW"],
    ["Enzo Le Fee Rennes", "E. Le Fee Rennes", "France", "CM"],
    ["Montpellier Benjamin Lecomte", "M. Lecomte", "France", "GK"],
    ["Miguel Almiron Paraguay", "M. Paraguay", "Paraguay", "RW"],
    ["Diego Costa", "D. Costa", "Brazil", "ST"],
    ["Dan Ndoye Swiss", "D. Swiss", "Switzerland", "LW"],
    ["Riyadh Sharahili Ahli", "R. Ahli", "Saudi Arabia", "CB"],
    ["Roland Sallai Hungary", "R. Hungary", "Hungary", "RW"],
    ["Borna Sosa Croatia", "B. Croatia", "Croatia", "LB"],
    ["Himad Abdelli", "H. Abdelli", "France", "CAM"],
    ["Paulo Dybala Roma", "P. Roma", "Italy", "CAM"],
    ["Marcelo Saracchi", "M. Saracchi", "Argentina", "LB"],
    ["Cade Cowell USA", "C. USA", "USA", "LW"],
    ["Mert Muldur Fener", "M. Fener", "Turkey", "RB"],
    ["Petar Sucic", "P. Sucic", "Croatia", "CM"],
    ["Sebastien Haller CIV", "S. CIV", "Ivory Coast", "ST"],
    ["Warren Madrigal", "W. Madrigal", "Costa Rica", "ST"],
    ["Rui Patricio Atalanta", "R. Atalanta", "Italy", "GK"],
    ["Fabio Pereyra", "F. Pereyra", "Argentina", "CB"],
    ["Enner Valencia Ecuador", "E. Ecuador", "Ecuador", "ST"],
    ["Andi Zeqiri Swiss", "A. Swiss", "Switzerland", "ST"],
    ["Albert Sambi Lokonga", "A. Lokonga", "Spain", "CM"],
    ["Stanko Juric", "S. Juric", "Spain", "CDM"],
    ["Alvaro Recoba", "A. Recoba", "Uruguay", "CAM"],
    ["Kelvin Amian", "K. Amian", "France", "RB"],
    ["Hicham Boudaoui2", "H. Boudaoui2", "Algeria", "CM"],
    ["Salis Abdul Samed Lens", "S. Lens", "France", "CDM"],
    ["Song Bum-keun Korea", "S. Korea", "South Korea", "GK"],
    ["Morten Thorsby", "M. Thorsby", "Italy", "CM"],
    ["Mirlind Kryeziu", "M. Kryeziu", "Switzerland", "CB"],
    ["Edwin Rodriguez", "E. Rodriguez", "Honduras", "CAM"],
    ["Once Caldas Dayro Moreno", "O. Moreno", "Colombia", "ST"],
    ["Khvicha Kvaratskhelia Georgia", "K. Georgia", "Georgia", "LW"],
    ["Justin Kluivert Jr", "J. Jr", "England", "RW"],
    ["Sebastian Nanasi Strasbourg", "S. Strasbourg", "France", "LW"],
    ["Nelson Weiper", "N. Weiper", "Germany", "ST"],
    ["Thiago Maia", "T. Maia", "Brazil", "CDM"],
    ["Chris Richards Palace", "C. Palace", "England", "CB"],
    ["Carlos Forbs Jr", "C. Jr", "England", "RW"],
    ["Gabriel Sara", "G. Sara", "Turkey", "CM"],
    ["Marcelo Brozovic Nassr", "M. Nassr", "Saudi Arabia", "CDM"],
    ["Adamo Nagalo", "A. Nagalo", "Netherlands", "CB"],
    ["Mathias Olivera Uruguay", "M. Uruguay", "Uruguay", "LB"],
    ["Jean Lucas", "J. Lucas", "Brazil", "CM"],
    ["Ehsan Hajsafi Iran", "E. Iran", "Iran", "LB"],
    ["Deportivo Cali Alejandro Rodriguez", "D. Rodriguez", "Colombia", "GK"],
    ["Giorgos Vagiannidis", "G. Vagiannidis", "Greece", "RB"],
    ["Nair Tiknizyan Armenia", "N. Armenia", "Armenia", "LB"],
    ["Leo Godoy", "L. Godoy", "Brazil", "RB"],
    ["Bruno Onyemaechi", "B. Onyemaechi", "Nigeria", "LB"],
    ["Veljko Birmancevic", "V. Birmancevic", "Czech Republic", "LW"],
    ["Tiago Orobo", "T. Orobo", "South Korea", "ST"],
    ["Cristian Calderon", "C. Calderon", "Mexico", "LB"],
    ["Jonathan Ikone", "J. Ikone", "Italy", "RW"],
    ["Hiroki Ito Japan", "H. Japan", "Japan", "CB"],
    ["Kieran Trippier", "K. Trippier", "England", "RB"],
    ["Aziz Behich Australia", "A. Australia", "Australia", "LB"],
    ["Jorge Saenz", "J. Saenz", "Spain", "CB"],
    ["Red Star Omri Glazer", "R. Glazer", "Serbia", "GK"],
    ["Paul Izzo Australia", "P. Australia", "Australia", "GK"],
    ["Nicolas Otamendi Benfica", "N. Benfica", "Portugal", "CB"],
    ["Eldor Shomurodov Basaksehir", "E. Basaksehir", "Turkey", "ST"],
    ["Isak Hien Sweden", "I. Sweden", "Sweden", "CB"],
    ["Yan Junling", "Y. Junling", "China", "GK"],
    ["Charles Aranguiz Sivas", "C. Sivas", "Turkey", "CM"],
    ["Emanuel Emegha Strasbourg", "E. Strasbourg", "France", "ST"],
    ["Lukas Provod", "L. Provod", "Czech Republic", "CM"],
    ["Paul Onuachu Nigeria", "P. Nigeria", "Nigeria", "ST"],
    ["Jean-Charles Castelletto Cameroon", "J. Cameroon", "Cameroon", "CB"],
    ["Girona Daley Blind Jr", "G. Jr", "Spain", "CB"],
    ["Alessio Cragno", "A. Cragno", "Italy", "GK"],
    ["Razvan Marin Cagliari", "R. Cagliari", "Italy", "CM"],
    ["Kenneth Omeruo Nigeria", "K. Nigeria", "Nigeria", "CB"],
    ["DC United Christian Benteke", "D. Benteke", "USA", "ST"],
    ["Adrien Rabiot OM", "A. OM", "France", "CM"],
    ["Jhon Sanchez", "J. Sanchez", "Ecuador", "LW"],
    ["Brian White", "B. White", "USA", "ST"],
    ["Mohammad Abu Hasheesh", "M. Hasheesh", "Jordan", "RB"],
    ["Philip Zinckernagel", "P. Zinckernagel", "Norway", "RW"],
    ["Rony Palmeiras", "R. Palmeiras", "Brazil", "LW"],
    ["Sergino Dest USA", "S. USA", "USA", "RB"],
    ["Aarhus Jesper Hansen", "A. Hansen", "Denmark", "GK"],
    ["Kristoffer Ajer Norway", "K. Norway", "Norway", "CB"],
    ["Emmanuel Sabbi", "E. Sabbi", "France", "ST"],
    ["Aissa Mandi Algeria2", "A. Algeria2", "Algeria", "CB"],
    ["Zaidu Sanusi Nigeria", "Z. Nigeria", "Nigeria", "LB"],
    ["Victor Boniface Nigeria", "V. Nigeria", "Nigeria", "ST"],
    ["Jhon Lucumi Colombia", "J. Colombia", "Colombia", "CB"],
    ["Pedro Goncalves Sporting", "P. Sporting", "Portugal", "CAM"],
    ["Pawel Bochniewicz", "P. Bochniewicz", "Netherlands", "CB"],
    ["Tyias Browning", "T. Browning", "China", "CB"],
    ["Cherif Ndiaye Red Star", "C. Star", "Serbia", "ST"],
    ["Josh Griffiths", "J. Griffiths", "England", "GK"],
    ["Elye Wahi OM", "E. OM", "France", "ST"],
    ["Rafael Leao Milan", "R. Milan", "Italy", "LW"],
    ["Song Min-kyu", "S. Min-kyu", "South Korea", "LW"],
    ["Rodrigo Echeverria Chile", "R. Chile", "Chile", "CM"],
    ["Josko Gvardiol Croatia", "J. Croatia", "Croatia", "CB"],
    ["Nuno Santos Sporting", "N. Sporting", "Portugal", "LW"],
    ["Dimitris Giannoulis", "D. Giannoulis", "Greece", "LB"],
    ["Bamba Dieng", "B. Dieng", "France", "ST"],
    ["Domagoj Bradaric", "D. Bradaric", "Italy", "LB"],
    ["Saad Al-Sheeb Qatar", "S. Qatar", "Qatar", "GK"],
    ["Suat Serdar", "S. Serdar", "Italy", "CM"],
    ["Federico Mancuello", "F. Mancuello", "Argentina", "CM"],
    ["Urawa Shusaku Nishikawa", "U. Nishikawa", "Japan", "GK"],
    ["Hossein Kanaanizadegan Iran", "H. Iran", "Iran", "CB"],
    ["Feyenoord Timon Wellenreuther Feyenoord", "F. Feyenoord", "Netherlands", "GK"],
    ["Jhon Arias Colombia", "J. Colombia", "Colombia", "RW"],
    ["Yann Gboho", "Y. Gboho", "France", "CAM"],
    ["Gabriel Arias Chile", "G. Chile", "Chile", "GK"],
    ["Mohamed Bayo Lille", "M. Lille", "France", "ST"],
    ["Fahad Al-Rashidi Ittihad", "F. Ittihad", "Saudi Arabia", "LB"],
    ["Niklas Sule Dortmund", "N. Dortmund", "Germany", "CB"],
    ["Auxerre Donovan Leon", "A. Leon", "France", "GK"],
    ["Aleksa Terzic", "A. Terzic", "Austria", "LB"],
    ["Ahmed Nabil Koka", "A. Koka", "Egypt", "CM"],
    ["Jack Stephens Jr", "J. Jr", "England", "CB"],
    ["Arthur Masuaku DRC", "A. DRC", "DR Congo", "LB"],
    ["Dusan Tadic", "D. Tadic", "Turkey", "LW"],
    ["David Moller Wolfe", "D. Wolfe", "Netherlands", "LB"],
    ["Cho Gue-sung Korea", "C. Korea", "South Korea", "ST"],
    ["Wilfried Zaha CIV", "W. CIV", "Ivory Coast", "LW"],
    ["Ali Dembele", "A. Dembele", "Italy", "LW"],
    ["Jeroen Zoet AZ", "J. AZ", "Netherlands", "GK"],
    ["Andrej Kramaric Croatia", "A. Croatia", "Croatia", "ST"],
    ["Pierre Lees-Melou", "P. Lees-Melou", "France", "CM"],
    ["Ersin Destanoglu", "E. Destanoglu", "Turkey", "GK"],
    ["Alexander Meyer Dortmund", "A. Dortmund", "Germany", "GK"],
    ["Bastos", "Bastos", "Brazil", "CB"],
    ["Adam Bareiro Paraguay", "A. Paraguay", "Paraguay", "ST"],
    ["Fabian Rieder", "F. Rieder", "Switzerland", "CAM"],
    ["Cagliari Simone Scuffet Cagliari", "C. Cagliari", "Italy", "GK"],
    ["Christos Tzolis Greece", "C. Greece", "Greece", "LW"],
    ["Vaclav Cerny Czech", "V. Czech", "Czech Republic", "RW"],
    ["Krepin Diatta Monaco", "K. Monaco", "France", "RW"],
    ["Santiago Pierotti", "S. Pierotti", "Italy", "RW"],
    ["Takuma Asano Mallorca", "T. Mallorca", "Spain", "RW"],
    ["Koki Saito", "K. Saito", "Netherlands", "LW"],
    ["Josip Stanisic", "J. Stanisic", "Croatia", "RB"],
    ["Leo Sauer", "L. Sauer", "Slovakia", "LW"],
    ["Abde Ezzalzouli Morocco", "A. Morocco", "Morocco", "LW"],
    ["Anel Ahmedhodzic Bosnia", "A. Bosnia", "Bosnia and Herzegovina", "CB"],
    ["Sevilla Orjan Nyland", "S. Nyland", "Spain", "GK"],
    ["Rodrigo Ely", "R. Ely", "Brazil", "CB"],
    ["Jesper Karlstrom", "J. Karlstrom", "Italy", "CDM"],
    ["Joel Monteiro", "J. Monteiro", "Switzerland", "LW"],
    ["Irfan Can Egribayat", "I. Egribayat", "Turkey", "GK"],
    ["Jose Contreras", "J. Contreras", "Venezuela", "GK"],
    ["Pierre-Emile Hojbjerg Denmark", "P. Denmark", "Denmark", "CDM"],
    ["Joaquin Correa", "J. Correa", "Italy", "ST"],
    ["Marco Tilio Australia", "M. Australia", "Australia", "RW"],
    ["Kevin Carlos", "K. Carlos", "Switzerland", "ST"],
    ["Hakim Ziyech Morocco", "H. Morocco", "Morocco", "RW"],
    ["Maximiliano Falcon", "M. Falcon", "Chile", "CB"],
    ["Lucas Zelarayan", "L. Zelarayan", "Armenia", "CAM"],
    ["Jayden Oosterwolde", "J. Oosterwolde", "Turkey", "LB"],
    ["Exequiel Palacios Leverkusen", "E. Leverkusen", "Germany", "CM"],
    ["Andy Pelmard", "A. Pelmard", "Italy", "CB"],
    ["Francis Amuzu Anderlecht", "F. Anderlecht", "Belgium", "LW"],
    ["Emanuele Valeri", "E. Valeri", "Italy", "LB"],
    ["Darlington Nagbe", "D. Nagbe", "USA", "CM"],
    ["Leverkusen Lukas Hradecky", "L. Hradecky", "Germany", "GK"],
    ["Maximiliano Silvera", "M. Silvera", "Uruguay", "ST"],
    ["Marcelo Martins", "M. Martins", "Bolivia", "ST"],
    ["Adam Buksa", "A. Buksa", "Poland", "ST"],
    ["Nicolo Zaniolo Atalanta", "N. Atalanta", "Italy", "CAM"],
    ["Leandro Fernandez", "L. Fernandez", "Chile", "ST"],
    ["Rakow Vladan Kovacevic", "R. Kovacevic", "Poland", "GK"],
    ["Diber Cambindo", "D. Cambindo", "Mexico", "ST"],
    ["Lucas Cavallini", "L. Cavallini", "Mexico", "ST"],
    ["Real Sociedad Orri Oskarsson", "R. Oskarsson", "Spain", "ST"],
    ["Vasilis Barkas Greece", "V. Greece", "Greece", "GK"],
    ["Thiago Almada Atlanta", "T. Atlanta", "USA", "CAM"],
    ["Promise David", "P. David", "Belgium", "ST"],
    ["Andras Schafer", "A. Schafer", "Germany", "CM"],
    ["Juan Pablo Vargas", "J. Vargas", "Costa Rica", "CB"],
    ["Jesus Areso", "J. Areso", "Spain", "RB"],
    ["Mamadou Diakhon", "M. Diakhon", "France", "ST"],
    ["Tomas Vlcek", "T. Vlcek", "Czech Republic", "CB"],
    ["Nathan Tella Leverkusen", "N. Leverkusen", "Germany", "RW"],
    ["Ali Yavuz Kol", "A. Kol", "Turkey", "CM"],
    ["Federico Gattoni", "F. Gattoni", "Argentina", "CB"],
    ["Real Salt Lake Chicho Arango", "R. Arango", "USA", "ST"],
    ["German Cano", "G. Cano", "Brazil", "ST"],
    ["Tanguy Ndombele Nice", "T. Nice", "France", "CM"],
    ["Franco Jara", "F. Jara", "Argentina", "ST"],
    ["Al Duhail Edmilson Junior", "A. Junior", "Qatar", "LW"],
    ["Alanzinho", "Alanzinho", "Portugal", "LW"],
    ["Sandro Tonali Jr", "S. Jr", "England", "CM"],
    ["Mark Travers Bournemouth", "M. Bournemouth", "England", "GK"],
    ["Gaetan Laborde Nice", "G. Nice", "France", "ST"],
    ["Zeno Debast Anderlecht2", "Z. Anderlecht2", "Belgium", "CB"],
    ["Hussein Faisal", "H. Faisal", "Egypt", "RW"],
    ["Philippe Keny", "P. Keny", "Turkey", "ST"],
    ["Moses Simon Nigeria", "M. Nigeria", "Nigeria", "LW"],
    ["Thomas Delaine", "T. Delaine", "France", "LB"],
    ["Kaheim Dixon", "K. Dixon", "Jamaica", "ST"],
    ["Aymen Hussein Iraq", "A. Iraq", "Iraq", "ST"],
    ["Hiroki Sakai Urawa", "H. Urawa", "Japan", "RB"],
    ["Abdulkerim Bardakci", "A. Bardakci", "Turkey", "CB"],
    ["Issa Soumare", "I. Soumare", "France", "ST"],
    ["Mohamed Benkhemassa", "M. Benkhemassa", "Algeria", "CDM"],
    ["Clayton Rio Ave", "C. Ave", "Portugal", "ST"],
    ["Denso Kasius", "D. Kasius", "Netherlands", "RB"],
    ["Alejandro Zendejas USA", "A. USA", "USA", "RW"],
    ["Roger Ibanez", "R. Ibanez", "Saudi Arabia", "CB"],
    ["Nahuel Ferraresi", "N. Ferraresi", "Venezuela", "CB"],
    ["Nicolas Ibanez", "N. Ibanez", "Mexico", "ST"],
    ["Andrej Ilic", "A. Ilic", "Germany", "ST"],
    ["Jonathan David Canada", "J. Canada", "Canada", "ST"],
    ["Wendel", "Wendel", "Russia", "CM"],
    ["Frank Anguissa Cameroon", "F. Cameroon", "Cameroon", "CM"],
    ["Venezia Filip Stankovic", "V. Stankovic", "Italy", "GK"],
    ["Florian Thauvin", "F. Thauvin", "Italy", "RW"],
    ["Fidan Aliti", "F. Aliti", "Kosovo", "CB"],
    ["Mohamed Amoura Union", "M. Union", "Belgium", "ST"],
    ["Alex Iwobi Fulham", "A. Fulham", "England", "CAM"],
    ["Kristjan Asllani Albania", "K. Albania", "Albania", "CDM"],
    ["Matteo Dams", "M. Dams", "Netherlands", "LB"],
    ["Esteban Alvarado", "E. Alvarado", "Costa Rica", "GK"],
    ["Aguibou Camara", "A. Camara", "Guinea", "CAM"],
    ["Maximilian Beier Dortmund", "M. Dortmund", "Germany", "ST"],
    ["Ridgeciano Haps", "R. Haps", "Italy", "LB"],
    ["Augustine Boakye", "A. Boakye", "France", "CAM"],
    ["Youcef Belaili Algeria", "Y. Algeria", "Algeria", "LW"],
    ["Patrick Pentz", "P. Pentz", "Austria", "GK"],
    ["Rasmus Schuller", "R. Schuller", "Finland", "CM"],
    ["Fujimoto Kanya", "F. Kanya", "Portugal", "LW"],
    ["Youcef Atal2", "Y. Atal2", "Algeria", "RB"],
    ["Jesus Rivas", "J. Rivas", "Mexico", "CM"],
    ["Viking Patrik Gunnarsson", "V. Gunnarsson", "Norway", "GK"],
    ["Luis Lopez Honduras", "L. Honduras", "Honduras", "GK"],
    ["Samu Omorodion Porto", "S. Porto", "Portugal", "ST"],
    ["Yassine Bounou Morocco", "Y. Morocco", "Morocco", "GK"],
    ["Nabil Bentaleb Algeria", "N. Algeria", "Algeria", "CM"],
    ["Seoul Kim Jin-ya", "S. Jin-ya", "South Korea", "RB"],
    ["Yasser Al-Shahrani Hilal", "Y. Hilal", "Saudi Arabia", "LB"],
    ["Robin Hranac Czech", "R. Czech", "Czech Republic", "CB"],
    ["Eduard Spertsyan Armenia", "E. Armenia", "Armenia", "CAM"],
    ["Vanja Drkusic", "V. Drkusic", "Slovenia", "CB"],
    ["Morten Hjulmand Sporting", "M. Sporting", "Portugal", "CDM"],
    ["Loic Bade Jr", "L. Jr", "Spain", "CB"],
    ["Victor Nelsson", "V. Nelsson", "Turkey", "CB"],
    ["Enzo Ebosse Cameroon", "E. Cameroon", "Cameroon", "LB"],
    ["Kevin Stoger", "K. Stoger", "Germany", "CM"],
    ["Jerome Roussillon", "J. Roussillon", "Germany", "LB"],
    ["Niklas Dorsch", "N. Dorsch", "Germany", "CM"],
    ["Florian Tardieu", "F. Tardieu", "France", "CM"],
    ["Lucas Cepeda", "L. Cepeda", "Chile", "LW"],
    ["Ramy Bensebaini Dortmund", "R. Dortmund", "Germany", "LB"],
    ["Jay Idzes", "J. Idzes", "Italy", "CB"],
    ["Anzor Mekvabishvili", "A. Mekvabishvili", "Georgia", "CDM"],
    ["Ahmed El-Shenawy Pyramids", "A. Pyramids", "Egypt", "GK"],
    ["Zaid Tahseen Iraq", "Z. Iraq", "Iraq", "CB"],
    ["Kasper Schmeichel Denmark", "K. Denmark", "Denmark", "GK"],
    ["Ousmane Diomande Sporting", "O. Sporting", "Portugal", "CB"],
    ["Andi Zeqiri Genk", "A. Genk", "Belgium", "ST"],
    ["Marko Arnautovic", "M. Arnautovic", "Italy", "ST"],
    ["Haji Wright USA", "H. USA", "USA", "ST"],
    ["Mergim Vojvoda", "M. Vojvoda", "Kosovo", "RB"],
    ["Jose Martinez", "J. Martinez", "Brazil", "CDM"],
    ["Dominik Livakovic", "D. Livakovic", "Turkey", "GK"],
    ["Jean Meneses", "J. Meneses", "Mexico", "LW"],
    ["Fares Chaibi Algeria", "F. Algeria", "Algeria", "CAM"],
    ["Rodrigo Cabral", "R. Cabral", "Argentina", "CAM"],
    ["Kacper Urbanski", "K. Urbanski", "Italy", "CAM"],
    ["Alexis Vega Chivas", "A. Chivas", "Mexico", "LW"],
    ["Edin Visca", "E. Visca", "Turkey", "RW"],
    ["Kelechi Nwakali Nigeria", "K. Nigeria", "Nigeria", "CM"],
    ["Aldo Rocha", "A. Rocha", "Mexico", "CM"],
    ["Ahmed Fatouh Zamalek", "A. Zamalek", "Egypt", "LB"],
    ["Filip Djuricic", "F. Djuricic", "Greece", "CAM"],
    ["German Berterame", "G. Berterame", "Mexico", "ST"],
    ["Brian Brobbey Ajax", "B. Ajax", "Netherlands", "ST"],
    ["Logi Tomasson", "L. Tomasson", "Iceland", "LB"],
    ["Kialonda Gaspar", "K. Gaspar", "Italy", "CB"],
    ["Pol Lirola", "P. Lirola", "France", "RB"],
    ["Yasuto Wakizaka", "Y. Wakizaka", "Japan", "CAM"],
    ["Cesar Tarrega Jr", "C. Jr", "Spain", "CB"],
    ["Elhan Kastrati", "E. Kastrati", "Albania", "GK"],
    ["Odsonne Edouard Jr", "O. Jr", "England", "ST"],
    ["Tanner Tessmann USA", "T. USA", "USA", "CDM"],
    ["Boli Bolingoli", "B. Bolingoli", "Belgium", "LB"],
    ["Tomas Belmonte", "T. Belmonte", "Argentina", "CDM"],
    ["Ozan Kabak Turkey", "O. Turkey", "Turkey", "CB"],
    ["Adam Marusic Lazio", "A. Lazio", "Italy", "RB"],
    ["Mathias Pereira Lage", "M. Lage", "France", "CM"],
    ["Bochum Patrick Drewes", "B. Drewes", "Germany", "GK"],
    ["Marvin Friedrich", "M. Friedrich", "Germany", "CB"],
    ["Charlie Taylor", "C. Taylor", "England", "LB"],
    ["Igoh Ogbu", "I. Ogbu", "Czech Republic", "CB"],
    ["Fortaleza Joao Ricardo", "F. Ricardo", "Brazil", "GK"],
    ["Lee Jae-sung Korea", "L. Korea", "South Korea", "CAM"],
    ["Edin Dzeko Bosnia", "E. Bosnia", "Bosnia and Herzegovina", "ST"],
    ["Moussa Niakhate Lyon", "M. Lyon", "France", "CB"],
    ["Rasmus Lauritsen", "R. Lauritsen", "Denmark", "CB"],
    ["Andrej Kramaric", "A. Kramaric", "Germany", "ST"],
    ["Mario Dorgeles", "M. Dorgeles", "Denmark", "RW"],
    ["Fedor Chalov", "F. Chalov", "Russia", "ST"],
    ["Anton Miranchuk", "A. Miranchuk", "Russia", "CAM"],
    ["Kristoffer Lund USA", "K. USA", "USA", "LB"],
    ["Michel Adopo Cagliari", "M. Cagliari", "Italy", "CM"],
    ["Mile Svilar Roma", "M. Roma", "Italy", "GK"],
    ["Tommaso Augello Cagliari", "T. Cagliari", "Italy", "LB"],
    ["Marnon Busch", "M. Busch", "Germany", "RB"],
    ["Mohamed Hamdy Pyramids", "M. Pyramids", "Egypt", "CB"],
    ["Patric Lazio", "P. Lazio", "Italy", "CB"],
    ["Endre Botka", "E. Botka", "Hungary", "CB"],
    ["Albert Gronbaek", "A. Gronbaek", "France", "CAM"],
    ["Youssouf Ndayishimiye Nice", "Y. Nice", "France", "CB"],
    ["Jhoanner Chavez", "J. Chavez", "Ecuador", "LB"],
    ["Montreal Josef Martinez Montreal", "M. Montreal", "USA", "ST"],
    ["Habib Diallo Senegal", "H. Senegal", "Senegal", "ST"],
    ["Alexander Sorloth", "A. Sorloth", "Spain", "ST"],
    ["Sparta Peter Vindahl", "S. Vindahl", "Czech Republic", "GK"],
    ["Lorenzo Colombo", "L. Colombo", "Italy", "ST"],
    ["Marlon Fossey", "M. Fossey", "Belgium", "RB"],
    ["Ricardo Pepi PSV", "R. PSV", "Netherlands", "ST"],
    ["Joao Pedro Galvao", "J. Galvao", "Brazil", "RB"],
    ["Gaston Martirena", "G. Martirena", "Argentina", "RB"],
    ["Eduardo Vargas Chile", "E. Chile", "Chile", "ST"],
    ["Steven Berghuis Ajax", "S. Ajax", "Netherlands", "RW"],
    ["Ramiro Vaca", "R. Vaca", "Bolivia", "CAM"],
    ["Josip Juranovic", "J. Juranovic", "Germany", "RB"],
    ["Eric Smith", "E. Smith", "Germany", "CB"],
    ["Bruno Henrique Inter", "B. Inter", "Brazil", "CM"],
    ["Emiliano Martinez Uruguay", "E. Uruguay", "Uruguay", "CM"],
    ["Guillermo Martinez Mexico", "G. Mexico", "Mexico", "ST"],
    ["Daniel Amartey Ghana", "D. Ghana", "Ghana", "CB"],
    ["Alhassan Yusuf", "A. Yusuf", "Belgium", "CM"],
    ["Eric Maxim Choupo-Moting Cameroon", "E. Cameroon", "Cameroon", "ST"],
    ["Nathan Tella Nigeria", "N. Nigeria", "Nigeria", "RW"],
    ["Liu Dianzuo", "L. Dianzuo", "China", "GK"],
    ["Jhon Solis", "J. Solis", "Spain", "CM"],
    ["Hugo Bolin", "H. Bolin", "Sweden", "CM"],
    ["Milutin Osmajic", "M. Osmajic", "Montenegro", "ST"],
    ["Junya Ito Japan", "J. Japan", "Japan", "RW"],
    ["Rafael Santos Borre Colombia", "R. Colombia", "Colombia", "ST"],
    ["Cauly", "Cauly", "Brazil", "CAM"],
    ["Ramadan Sobhi", "R. Sobhi", "Egypt", "LW"],
    ["Santa Fe Hugo Rodallega", "S. Rodallega", "Colombia", "ST"],
    ["Lucas Stassin", "L. Stassin", "France", "ST"],
    ["Glen Kamara Finland", "G. Finland", "Finland", "CDM"],
    ["Tomas Araujo Benfica", "T. Benfica", "Portugal", "CB"],
    ["Ilan Kebbal", "I. Kebbal", "Algeria", "CAM"],
    ["Mahamadou Doumbia", "M. Doumbia", "Belgium", "CDM"],
    ["Alexander Prass", "A. Prass", "Germany", "LB"],
    ["Oliver Baumann Hoffenheim", "O. Hoffenheim", "Germany", "GK"],
    ["Matija Sarkic", "M. Sarkic", "England", "GK"],
    ["Lewis Holtby", "L. Holtby", "Germany", "CM"],
    ["Hakon Valdimarsson Iceland", "H. Iceland", "Iceland", "GK"],
    ["David Duris", "D. Duris", "Slovakia", "LW"],
    ["Amadou Haidara Mali", "A. Mali", "Mali", "CM"],
    ["Alberto Grassi", "A. Grassi", "Italy", "CDM"],
    ["Uriel Antuna Mexico", "U. Mexico", "Mexico", "RW"],
    ["Oli McBurnie", "O. McBurnie", "Spain", "ST"],
    ["Jaouen Hadjam Algeria", "J. Algeria", "Algeria", "LB"],
    ["Radu Dragusin", "R. Dragusin", "Romania", "CB"],
    ["Juan Brunetta", "J. Brunetta", "Mexico", "CAM"],
    ["Kazimcan Karatas", "K. Karatas", "Turkey", "LB"],
    ["Andre Silva SPFC", "A. SPFC", "Brazil", "ST"],
    ["Saad Al-Nasser", "S. Al-Nasser", "Saudi Arabia", "CB"],
    ["Jake O'Brien Lyon", "J. Lyon", "France", "CB"],
    ["Elias Saad", "E. Saad", "Germany", "LW"],
    ["Elber", "Elber", "Japan", "LW"],
    ["Fredrik Aursnes Benfica", "F. Benfica", "Portugal", "CM"],
    ["Hamza Rafia Lecce", "H. Lecce", "Italy", "CAM"],
    ["Glen Kamara Rennes", "G. Rennes", "France", "CDM"],
    ["Lima Flu", "L. Flu", "Brazil", "CAM"],
    ["Riyad Mahrez Ahli", "R. Ahli", "Saudi Arabia", "RW"],
    ["Rasmus Nicolaisen", "R. Nicolaisen", "France", "CB"],
    ["Lucas Romero", "L. Romero", "Brazil", "CDM"],
    ["Kaishu Sano Mainz", "K. Mainz", "Germany", "CDM"],
    ["Lille Lucas Chevalier Lille", "L. Lille", "France", "GK"],
    ["Alex Suarez", "A. Suarez", "Spain", "CB"],
    ["Tylel Tati", "T. Tati", "France", "CB"],
    ["Nacional Luis Mejia", "N. Mejia", "Uruguay", "GK"],
    ["Tyronne Ebuehi Empoli", "T. Empoli", "Italy", "RB"],
    ["Steven Fortes", "S. Fortes", "Cape Verde", "CB"],
    ["Abdullah Radif Ahli", "A. Ahli", "Saudi Arabia", "ST"],
    ["Kristian Thorstvedt", "K. Thorstvedt", "Norway", "CAM"],
    ["Bechir Ben Said Tunisia", "B. Ben Said Tunisia", "Tunisia", "GK"],
    ["Oliver Sail", "O. Sail", "New Zealand", "GK"],
    ["Jean-Pierre Nsame Cameroon", "J. Cameroon", "Cameroon", "ST"],
    ["Mattia Felici Cagliari", "M. Cagliari", "Italy", "LW"],
    ["Brondby Patrick Pentz Brondby", "B. Brondby", "Denmark", "GK"],
    ["Yves Bissouma", "Y. Bissouma", "Mali", "CDM"],
    ["Ivica Ivusic", "I. Ivusic", "Croatia", "GK"],
    ["Esteghlal Roozbeh Cheshmi", "E. Cheshmi", "Iran", "CDM"],
    ["Jose Martinez Venezuela", "J. Venezuela", "Venezuela", "CDM"],
    ["Ibrahima Kone Guinea", "I. Guinea", "Guinea", "GK"],
    ["Alberto Dossena Como", "A. Como", "Italy", "CB"],
    ["Ismaila Sarr Palace", "I. Palace", "England", "RW"],
    ["Brayan Cortes Chile", "B. Chile", "Chile", "GK"],
    ["Tsuyoshi Watanabe", "T. Watanabe", "Belgium", "CB"],
    ["Matija Nastasic", "M. Nastasic", "Spain", "CB"],
    ["Luciano", "Luciano", "Brazil", "ST"],
    ["Mark Flekken Jr", "M. Jr", "England", "GK"],
    ["Lucas Beltran Fiorentina", "L. Fiorentina", "Italy", "ST"],
    ["Abdukodir Khusanov Lens", "A. Lens", "France", "CB"],
    ["Yuri Alberto Corinthians", "Y. Corinthians", "Brazil", "ST"],
    ["Achraf Hakimi Morocco", "A. Morocco", "Morocco", "RB"],
    ["Johannes Eggestein", "J. Eggestein", "Germany", "ST"],
    ["Kenny Rocha Santos", "K. Santos", "Cape Verde", "CM"],
    ["Sultan Adil UAE", "S. UAE", "United Arab Emirates", "ST"],
    ["Deiver Machado Lens", "D. Lens", "France", "LB"],
    ["Cristaldo", "Cristaldo", "Brazil", "CAM"],
    ["Jorge Herrando", "J. Herrando", "Spain", "CB"],
    ["Benjamin Kallman", "B. Kallman", "Finland", "ST"],
    ["Archie Brown", "A. Brown", "Belgium", "LB"],
    ["Luuk de Jong PSV", "L. de Jong PSV", "Netherlands", "ST"],
    ["Marius Wolf Augsburg", "M. Augsburg", "Germany", "RB"],
    ["Lucien Agoume", "L. Agoume", "Spain", "CM"],
    ["Ondrej Lingr Czech", "O. Czech", "Czech Republic", "CAM"],
    ["Altay Bayindir Turkey", "A. Turkey", "Turkey", "GK"],
    ["Andre Luis", "A. Luis", "Portugal", "ST"],
    ["Thiago Fernandez", "T. Fernandez", "Argentina", "RW"],
    ["Domingos Duarte", "D. Duarte", "Spain", "CB"],
    ["Shamar Nicholson", "S. Nicholson", "Jamaica", "ST"],
    ["Lautaro Valenti", "L. Valenti", "Italy", "CB"],
    ["Magnus Wolff Eikrem", "M. Eikrem", "Norway", "CAM"],
    ["Oh Hyeon-gyu Genk", "O. Genk", "Belgium", "ST"],
    ["Federico Ravaglia", "F. Ravaglia", "Italy", "GK"],
    ["Alhassan Yusuf Nigeria", "A. Nigeria", "Nigeria", "CM"],
    ["Ajax Remko Pasveer Ajax", "A. Ajax", "Netherlands", "GK"],
    ["Christian Walton", "C. Walton", "England", "GK"],
    ["Alvaro Fidalgo", "A. Fidalgo", "Mexico", "CM"],
    ["Miralem Pjanic", "M. Pjanic", "Bosnia and Herzegovina", "CM"],
    ["Riku Handa", "R. Handa", "Japan", "LB"],
    ["San Jose Cristian Espinoza", "S. Espinoza", "USA", "RW"],
    ["Tommy Doyle Jr", "T. Jr", "England", "CM"],
    ["Filip Ugrinic", "F. Ugrinic", "Switzerland", "CM"],
    ["Seko Fofana CIV", "S. CIV", "Ivory Coast", "CM"],
    ["Artem Dovbyk Roma", "A. Roma", "Italy", "ST"],
    ["Runar Alex Runarsson", "R. Runarsson", "Iceland", "GK"],
    ["Pablo Duran", "P. Duran", "Spain", "ST"],
    ["Dimitris Kourbelis", "D. Kourbelis", "Greece", "CDM"],
    ["Gaetan Perrin", "G. Perrin", "France", "LW"],
    ["Cesar Montes Mexico", "C. Mexico", "Mexico", "CB"],
    ["Svetozar Markovic", "S. Markovic", "Serbia", "CB"],
    ["Louis Leroux", "L. Leroux", "France", "CM"],
    ["Franco Calderon", "F. Calderon", "Chile", "CB"],
    ["Houssem Aouar Ittihad", "H. Ittihad", "Saudi Arabia", "CAM"],
    ["Sebastiano Luperto Cagliari", "S. Cagliari", "Italy", "CB"],
    ["Breel Embolo Swiss", "B. Swiss", "Switzerland", "ST"],
    ["Djurgarden Jacob Rinne", "D. Rinne", "Sweden", "GK"],
    ["Oscar Gloukh", "O. Gloukh", "Austria", "CAM"],
    ["Xaver Schlager Austria", "X. Austria", "Austria", "CM"],
    ["Orjan Nyland Norway", "O. Norway", "Norway", "GK"],
    ["Chadi Riad Morocco", "C. Morocco", "Morocco", "CB"],
    ["Ulises Rivas", "U. Rivas", "Mexico", "CDM"],
    ["Nahuel Bustos", "N. Bustos", "Argentina", "ST"],
    ["Fidel Escobar", "F. Escobar", "Panama", "CB"],
    ["Munir Leganes", "M. Leganes", "Spain", "RW"],
    ["Marvin Pieringer", "M. Pieringer", "Germany", "ST"],
    ["Angelo Preciado", "A. Preciado", "Ecuador", "RB"],
    ["Queretaro Guillermo Allison", "Q. Allison", "Mexico", "GK"],
    ["Colorado Rafael Navarro", "C. Navarro", "USA", "ST"],
    ["Mothobi Mvala", "M. Mvala", "South Africa", "CB"],
    ["Gregoire Coudert", "G. Coudert", "France", "GK"],
    ["Jesus Ferreira USA", "J. USA", "USA", "ST"],
    ["Belgrano Nahuel Losada Belgrano", "B. Belgrano", "Argentina", "GK"],
    ["Charles Pickel", "C. Pickel", "DR Congo", "CM"],
    ["Dynamo Kyiv Vladyslav Vanat Kyiv", "D. Kyiv", "Ukraine", "ST"],
    ["Bara Marei", "B. Marei", "Jordan", "CB"],
    ["Charles-Andreas Brym", "C. Brym", "Netherlands", "RW"],
    ["Alan Mozo Mexico", "A. Mexico", "Mexico", "RB"],
    ["Aimar Oroz", "A. Oroz", "Spain", "CAM"],
    ["Alireza Jahanbakhsh Iran", "A. Iran", "Iran", "RW"],
    ["Toby Alderweireld", "T. Alderweireld", "Belgium", "CB"],
    ["Kim Tae-hwan Korea", "K. Korea", "South Korea", "RB"],
    ["Andreas Cornelius", "A. Cornelius", "Denmark", "ST"],
    ["Anas Zniti", "A. Zniti", "Morocco", "GK"],
    ["Sikou Niakate Mali", "S. Mali", "Mali", "CB"],
    ["Gabriele Zappa Cagliari", "G. Cagliari", "Italy", "RB"],
    ["Umar Sadiq Nigeria", "U. Nigeria", "Nigeria", "ST"],
    ["Junior Santos", "J. Santos", "Brazil", "ST"],
    ["Bartlomiej Dragowski", "B. Dragowski", "Poland", "GK"],
    ["Cristo Gonzalez", "C. Gonzalez", "Portugal", "ST"],
    ["Solomon Kvirkvelia", "S. Kvirkvelia", "Georgia", "CB"],
    ["Rani Khedira", "R. Khedira", "Germany", "CDM"],
    ["Zuriko Davitashvili Georgia", "Z. Georgia", "Georgia", "LW"],
    ["Henry Martin America", "H. America", "Mexico", "ST"],
    ["Nico Schlotterbeck Dortmund", "N. Dortmund", "Germany", "CB"],
    ["Milan Skriniar", "M. Skriniar", "Slovakia", "CB"],
    ["Tim Siersleben", "T. Siersleben", "Germany", "CB"],
    ["Ignace Van der Brempt", "I. Van der Brempt", "Italy", "RB"],
    ["Becir Omeragic", "B. Omeragic", "France", "CB"],
    ["Adam Ounas Algeria", "A. Algeria", "Algeria", "RW"],
    ["Gabriel Pereira", "G. Pereira", "Denmark", "CB"],
    ["Mitchell Duke Australia", "M. Australia", "Australia", "ST"],
    ["Suresh Singh Wangjam", "S. Wangjam", "India", "CM"],
    ["Matias Catalan Chile", "M. Chile", "Chile", "CB"],
    ["Koki Ogawa Japan", "K. Japan", "Japan", "ST"],
    ["Vito Mannone Lille", "V. Lille", "France", "GK"],
    ["Dodi", "Dodi", "Brazil", "CM"],
    ["Lukasz Fabianski Nottm", "L. Nottm", "England", "GK"],
    ["Krasnodar Stanislav Agkatsev", "K. Agkatsev", "Russia", "GK"],
    ["Antonio Milic", "A. Milic", "Poland", "CB"],
    ["Agustin Palavecino", "A. Palavecino", "Mexico", "CAM"],
    ["Mathieu Choiniere Canada", "M. Canada", "Canada", "CM"],
    ["Ahmed Sami", "A. Sami", "Egypt", "CB"],
    ["Cristian Martinez", "C. Martinez", "Panama", "CM"],
    ["Racing Gabriel Arias Racing", "R. Racing", "Argentina", "GK"],
    ["Plzen Martin Jedlicka", "P. Jedlicka", "Czech Republic", "GK"],
    ["Yassine Kechta Morocco", "Y. Morocco", "Morocco", "CM"],
    ["Stefan Bell", "S. Bell", "Germany", "CB"],
    ["Jesurun Rak-Sakyi Palace", "J. Palace", "England", "RW"],
    ["Ernest Muci", "E. Muci", "Turkey", "LW"],
    ["Francis Uzoho Nigeria", "F. Nigeria", "Nigeria", "GK"],
    ["Petar Stojanovic", "P. Stojanovic", "Slovenia", "RB"],
    ["Darwin Nunez Uruguay", "D. Uruguay", "Uruguay", "ST"],
    ["Cedric Kipre", "C. Kipre", "France", "CB"],
    ["Guilherme Santos", "G. Santos", "Brazil", "LW"],
    ["Pietro Pellegri Empoli", "P. Empoli", "Italy", "ST"],
    ["Go Ahead Jari De Busser", "G. Jari De Busser", "Netherlands", "GK"],
    ["Willum Willumsson Iceland", "W. Iceland", "Iceland", "CM"],
    ["Junior Messias", "J. Messias", "Italy", "RW"],
    ["Ayrton Lucas Flamengo", "A. Flamengo", "Brazil", "LB"],
    ["Hakan Calhanoglu", "H. Calhanoglu", "Italy", "CDM"],
    ["Lawrence Ati-Zigi Ghana", "L. Ghana", "Ghana", "GK"],
    ["Sporting Cristal Renato Solis", "S. Solis", "Peru", "GK"],
    ["Seydouba Cisse", "S. Cisse", "Spain", "CM"],
    ["Achraf Dari Morocco", "A. Morocco", "Morocco", "CB"],
    ["Flynn Downes Jr", "F. Jr", "England", "CDM"],
    ["Rodrigo Rey", "R. Rey", "Argentina", "GK"],
    ["Willi Orban Hungary", "W. Hungary", "Hungary", "CB"],
    ["Ziyad Al-Johani Ahli", "Z. Ahli", "Saudi Arabia", "CM"],
    ["Arttu Hoskonen", "A. Hoskonen", "Finland", "CB"],
    ["Thomas Partey Ghana", "T. Ghana", "Ghana", "CDM"],
    ["Patson Daka", "P. Daka", "England", "ST"],
    ["Aiden O'Neill Australia", "A. Australia", "Australia", "CDM"],
    ["Gerardo Arteaga Monterrey", "G. Monterrey", "Mexico", "LB"],
    ["Alan Mozo Chivas", "A. Chivas", "Mexico", "RB"],
    ["Amine Gouiri Algeria", "A. Algeria", "Algeria", "ST"],
    ["Greg Leigh", "G. Leigh", "Jamaica", "LB"],
    ["Maximilian Wober Austria", "M. Austria", "Austria", "CB"],
    ["CSKA Igor Akinfeev CSKA", "C. CSKA", "Russia", "GK"],
    ["Zsolt Nagy", "Z. Nagy", "Hungary", "LM"],
    ["Andres Gudino", "A. Gudino", "Mexico", "GK"],
    ["Isak Bergmann Johannesson", "I. Johannesson", "Iceland", "CM"],
    ["Alan Patrick", "A. Patrick", "Brazil", "CAM"],
    ["Umut Nayir", "U. Nayir", "Turkey", "ST"],
    ["Kasey Palmer", "K. Palmer", "Jamaica", "CAM"],
    ["Matthias Seidl", "M. Seidl", "Austria", "CM"],
    ["Ismael Doukoure", "I. Doukoure", "France", "CB"],
    ["Dexter Lembikisa", "D. Lembikisa", "Jamaica", "RB"],
    ["Aleix Garcia Leverkusen", "A. Leverkusen", "Germany", "CM"],
    ["Daniel Gazdag", "D. Gazdag", "Hungary", "CAM"],
    ["Sandro Lauper", "S. Lauper", "Switzerland", "CDM"],
    ["Renato Steffen Lugano", "R. Lugano", "Switzerland", "RW"],
    ["Djigui Diarra", "D. Diarra", "Mali", "GK"],
    ["Theo Hernandez Milan", "T. Milan", "Italy", "LB"],
    ["Sebastian Nanasi Sweden", "S. Sweden", "Sweden", "LW"],
    ["Rais M'Bolhi Algeria", "R. Algeria", "Algeria", "GK"],
    ["Yahya Al-Ghassani UAE", "Y. UAE", "United Arab Emirates", "LW"],
    ["Stole Dimitrievski MKD", "S. MKD", "North Macedonia", "GK"],
    ["Toulouse Guillaume Restes", "T. Restes", "France", "GK"],
    ["Wydad Ayoub El Amloud", "W. Ayoub El Amloud", "Morocco", "CB"],
    ["Mauro Arambarri", "M. Arambarri", "Spain", "CDM"],
    ["Johan Mojica Colombia", "J. Colombia", "Colombia", "LB"],
    ["Andri Gudjohnsen", "A. Gudjohnsen", "Belgium", "ST"],
    ["Tayyip Talha Sanuc", "T. Sanuc", "Turkey", "CB"],
    ["Diego Gomez Miami", "D. Miami", "USA", "CM"],
    ["Frankie Musonda", "F. Musonda", "Zambia", "CB"],
    ["Joao Basso Santos", "J. Santos", "Brazil", "CB"],
    ["Ismael Diaz", "I. Diaz", "Panama", "ST"],
    ["Yeray Alvarez Jr", "Y. Jr", "Spain", "CB"],
    ["Mohamed Elyounoussi Norway", "M. Norway", "Norway", "LW"],
    ["Hernan Lopez", "H. Lopez", "USA", "CAM"],
    ["Dodi Lukebakio Sevilla", "D. Sevilla", "Spain", "RW"],
    ["Diadie Samassekou Mali", "D. Mali", "Mali", "CDM"],
    ["Kwadwo Duah", "K. Duah", "Switzerland", "ST"],
    ["Momodou Sonko", "M. Sonko", "Belgium", "RW"],
    ["George Ilenikhena", "G. Ilenikhena", "France", "ST"],
    ["Ali Lotfi", "A. Lotfi", "Egypt", "GK"],
    ["Yokohama Jun Amano", "Y. Amano", "Japan", "CAM"],
    ["Jeffrey Schlupp Ghana", "J. Ghana", "Ghana", "LM"],
    ["Ruben Canedo UAE", "R. UAE", "United Arab Emirates", "CB"],
    ["Miguel Navarro", "M. Navarro", "Venezuela", "LB"],
    ["Francisco Fydriszewski", "F. Fydriszewski", "Ecuador", "ST"],
    ["Joan Sastre", "J. Sastre", "Greece", "RB"],
    ["Morgan Guilavogui", "M. Guilavogui", "Germany", "ST"],
    ["Herve Koffi Burkina", "H. Burkina", "Burkina Faso", "GK"],
    ["Piotr Zielinski Inter", "P. Inter", "Italy", "CM"],
    ["Alberto Moreno", "A. Moreno", "Italy", "LB"],
    ["Diego Rico", "D. Rico", "Spain", "LB"],
    ["Jeffrey de Lange", "J. de Lange", "France", "GK"],
    ["Dodo", "Dodo", "Italy", "RB"],
    ["Manu Bueno", "M. Bueno", "Spain", "CM"],
    ["Neblu", "Neblu", "Angola", "GK"],
    ["Lee Ho-jae", "L. Ho-jae", "South Korea", "ST"],
    ["Firas Al-Buraikan Ahli", "F. Ahli", "Saudi Arabia", "ST"],
    ["Merih Demiral Ahli", "M. Ahli", "Saudi Arabia", "CB"],
    ["Tijjani Noslin", "T. Noslin", "Italy", "ST"],
    ["Josef Martinez", "J. Martinez", "Venezuela", "ST"],
    ["Agustin Marchesin Boca", "A. Boca", "Argentina", "GK"],
    ["Koki Ogawa NEC", "K. NEC", "Netherlands", "ST"],
    ["Niclas Eliasson", "N. Eliasson", "Greece", "RW"],
    ["Stefan Posch Austria", "S. Austria", "Austria", "RB"],
    ["Raja Zakaria El Wardi", "R. Zakaria El Wardi", "Morocco", "LW"],
    ["Gaziantep Deian Sorescu", "G. Sorescu", "Turkey", "RW"],
    ["Fabrice Ondoa Cameroon", "F. Cameroon", "Cameroon", "GK"],
    ["Hong Hyun-seok Korea", "H. Korea", "South Korea", "CAM"],
    ["Alberto Paleari", "A. Paleari", "Italy", "GK"],
    ["Charalampos Lykogiannis", "C. Lykogiannis", "Italy", "LB"],
    ["Villasanti", "Villasanti", "Brazil", "CDM"],
    ["Michael", "Michael", "Brazil", "LW"],
    ["Athletico Bento Athletico", "A. Athletico", "Brazil", "GK"],
    ["Antonin Kinsky", "A. Kinsky", "Czech Republic", "GK"],
    ["Aljoscha Kemlein", "A. Kemlein", "Germany", "CM"],
    ["Chiquinho Olympiacos", "C. Olympiacos", "Greece", "CAM"],
    ["Charles Aranguiz Chile", "C. Chile", "Chile", "CM"],
    ["Talles Magno", "T. Magno", "Brazil", "LW"],
    ["Angers Yahia Fofana Angers", "A. Angers", "France", "GK"],
    ["Spartak Alexander Sobolev Spartak", "S. Spartak", "Russia", "ST"],
    ["Alan Varela Porto", "A. Porto", "Portugal", "CDM"],
    ["Fiete Arp", "F. Arp", "Germany", "ST"],
    ["German Pezzella", "G. Pezzella", "Argentina", "CB"],
    ["Andrea Belotti Benfica", "A. Benfica", "Portugal", "ST"],
    ["Alisson SPFC", "A. SPFC", "Brazil", "CM"],
    ["Bilal El Khannouss Leicester", "B. El Khannouss Leicester", "England", "CAM"],
    ["Dinamo Ivan Nevistic", "D. Nevistic", "Croatia", "GK"],
    ["Ricardo Goss", "R. Goss", "South Africa", "GK"],
    ["Jonas Hofmann Leverkusen", "J. Leverkusen", "Germany", "RW"],
    ["Marc Gual", "M. Gual", "Poland", "ST"],
    ["Raul Garcia de Haro", "R. Garcia de Haro", "Spain", "ST"],
    ["Subhasish Bose", "S. Bose", "India", "LB"],
    ["Jose Sa Jr", "J. Jr", "England", "GK"],
    ["Adrian Sut", "A. Sut", "Romania", "CDM"],
    ["Jordan Henderson Ajax", "J. Ajax", "Netherlands", "CM"],
    ["Nicolas Oroz", "N. Oroz", "Argentina", "CAM"],
    ["Joao Pedro", "J. Pedro", "England", "ST"],
    ["Leo Vasco", "L. Vasco", "Brazil", "CB"],
    ["Mikkel Kaufmann", "M. Kaufmann", "Germany", "ST"],
    ["Xavier Mbuyamba", "X. Mbuyamba", "Netherlands", "CB"],
    ["Sofiane Boufal Morocco", "S. Morocco", "Morocco", "LW"],
    ["Kamo Hovhannisyan", "K. Hovhannisyan", "Armenia", "RB"],
    ["Fredy", "Fredy", "Angola", "CM"],
    ["Christian Pulisic Milan", "C. Milan", "Italy", "RW"],
    ["Saul Coco Torino", "S. Torino", "Italy", "CB"],
    ["Jan-Niklas Beste", "J. Beste", "Germany", "LW"],
    ["Arnaud Nordin", "A. Nordin", "France", "RW"],
    ["Anthony Lozano", "A. Lozano", "Honduras", "ST"],
    ["Erhan Masovic", "E. Masovic", "Germany", "CB"],
    ["Nasser Djiga Burkina", "N. Burkina", "Burkina Faso", "CB"],
    ["Abdoulaye Doucoure", "A. Doucoure", "England", "CM"],
    ["Joe Scally Gladbach", "J. Gladbach", "Germany", "RB"],
    ["Themba Zwane", "T. Zwane", "South Africa", "CAM"],
    ["Bendeguz Bolla", "B. Bolla", "Hungary", "RB"],
    ["Zeki Amdouni Swiss", "Z. Swiss", "Switzerland", "ST"],
    ["Nikola Krstovic Lecce", "N. Lecce", "Italy", "ST"],
    ["Wouter Goes", "W. Goes", "Netherlands", "CB"],
    ["Santiago Gimenez Feyenoord", "S. Feyenoord", "Netherlands", "ST"],
    ["Enzo Crivelli", "E. Crivelli", "Switzerland", "ST"],
    ["Roberto Lopes", "R. Lopes", "Cape Verde", "CB"],
    ["Kolbeinn Sigthorsson", "K. Sigthorsson", "Iceland", "ST"],
    ["Ibrahim Sangare CIV", "I. CIV", "Ivory Coast", "CDM"],
    ["Victor Nelsson Denmark", "V. Denmark", "Denmark", "CB"],
    ["Dimitris Pelkas", "D. Pelkas", "Greece", "CAM"],
    ["Boualem Khoukhi Qatar", "B. Qatar", "Qatar", "CB"],
    ["Danel Sinani", "D. Sinani", "Germany", "CAM"],
    ["Marcelino Nunez Chile", "M. Chile", "Chile", "CM"],
    ["Nathaniel Atkinson Australia", "N. Australia", "Australia", "RB"],
    ["Ivan Provedel Lazio", "I. Lazio", "Italy", "GK"],
    ["Johnny Cardoso USA", "J. USA", "USA", "CDM"],
    ["Julimar", "Julimar", "Brazil", "LW"],
    ["Mahdi Camara", "M. Camara", "France", "CM"],
    ["Wang Dalei", "W. Dalei", "China", "GK"],
    ["Andri Gudjohnsen Elfsborg", "A. Elfsborg", "Sweden", "ST"],
    ["Torino Vanja Milinkovic-Savic Torino", "T. Torino", "Italy", "GK"],
    ["Pedro Miguel Qatar", "P. Qatar", "Qatar", "RB"],
    ["Maximiliano Meza", "M. Meza", "Argentina", "RW"],
    ["Carlos Cuesta Colombia", "C. Colombia", "Colombia", "CB"],
    ["Bryan Heynen Genk", "B. Genk", "Belgium", "CM"],
    ["Gurpreet Singh Sandhu", "G. Sandhu", "India", "GK"],
    ["Maxence Caqueret Lyon", "M. Lyon", "France", "CM"],
    ["Carlos Rodriguez Cruz Azul", "C. Azul", "Mexico", "CM"],
    ["Mohamed Ali Camara", "M. Camara", "Switzerland", "CB"],
    ["Said Benrahma Algeria", "S. Algeria", "Algeria", "LW"],
    ["Miro Tenho", "M. Tenho", "Finland", "CB"],
    ["Sadegh Moharrami Iran", "S. Iran", "Iran", "RB"],
    ["Carl Starfelt Sweden", "C. Sweden", "Sweden", "CB"],
    ["Arboleda", "Arboleda", "Brazil", "CB"],
    ["Mikael Dyrestam", "M. Dyrestam", "Guinea", "CB"],
    ["Koki Machida Union", "K. Union", "Belgium", "CB"],
    ["Ivan Sanchez", "I. Sanchez", "Spain", "CAM"],
    ["Will Hughes Jr", "W. Jr", "England", "CM"],
    ["Vincenzo Grifo Freiburg", "V. Freiburg", "Germany", "LW"],
    ["Milton Gimenez", "M. Gimenez", "Argentina", "ST"],
    ["Yuto Nagatomo Japan", "Y. Japan", "Japan", "LB"],
    ["Lazar Samardzic Atalanta", "L. Atalanta", "Italy", "CAM"],
    ["Vincent Aboubakar Cameroon", "V. Cameroon", "Cameroon", "ST"],
    ["Saleh Al-Shehri Hilal", "S. Hilal", "Saudi Arabia", "ST"],
    ["Marco Carnesecchi Atalanta", "M. Atalanta", "Italy", "GK"],
    ["Lautaro Diaz", "L. Diaz", "Brazil", "ST"],
    ["Gabriel Villamil", "G. Villamil", "Bolivia", "CM"],
    ["Jakub Piotrowski", "J. Piotrowski", "Poland", "CM"],
    ["Cristian Medina Boca", "C. Boca", "Argentina", "CM"],
    ["Jhon Duran Nassr", "J. Nassr", "Saudi Arabia", "ST"],
    ["Mathias Villasanti Paraguay", "M. Paraguay", "Paraguay", "CDM"],
    ["Rijeka Martin Zlomislic", "R. Zlomislic", "Croatia", "GK"],
    ["Malcom", "Malcom", "Saudi Arabia", "RW"],
    ["Oleksandr Tymchyk", "O. Tymchyk", "Ukraine", "RB"],
    ["Zoran Arsenic", "Z. Arsenic", "Poland", "CB"],
    ["Diego Gomez", "D. Gomez", "Paraguay", "CM"],
    ["Mohamed Hany Ahly", "M. Ahly", "Egypt", "RB"],
    ["Sead Kolasinac Bosnia", "S. Bosnia", "Bosnia and Herzegovina", "CB"],
    ["Ronwen Williams", "R. Williams", "South Africa", "GK"],
    ["Mikael Ellertsson", "M. Ellertsson", "Italy", "CM"],
    ["Blati Toure Burkina", "B. Burkina", "Burkina Faso", "CDM"],
    ["Granit Xhaka", "G. Xhaka", "Germany", "CDM"],
    ["Ibe Hautekiet", "I. Hautekiet", "Belgium", "CB"],
    ["Rafik Halliche", "R. Halliche", "Algeria", "CB"],
    ["Connor Metcalfe St Pauli", "C. Pauli", "Germany", "CM"],
    ["Daniel Maldini Monza", "D. Monza", "Italy", "CAM"],
    ["Ricky van Wolfswinkel", "R. van Wolfswinkel", "Netherlands", "ST"],
    ["Gael Kakuta", "G. Kakuta", "DR Congo", "CAM"],
    ["Denes Dibusz", "D. Dibusz", "Hungary", "GK"],
    ["Samuele Vignato", "S. Vignato", "Italy", "CAM"],
    ["Emanuel Mammana", "E. Mammana", "Argentina", "CB"],
    ["Lasha Dvali", "L. Dvali", "Georgia", "CB"],
    ["Milan Badelj", "M. Badelj", "Italy", "CDM"],
    ["Union Thiago Vecino", "U. Vecino", "Argentina", "GK"],
    ["Nathan Wood", "N. Wood", "England", "CB"],
    ["Sadio Mane Nassr", "S. Nassr", "Saudi Arabia", "LW"],
    ["Andrei Ratiu", "A. Ratiu", "Romania", "RB"],
    ["Davinson Sanchez Colombia", "D. Colombia", "Colombia", "CB"],
    ["Ahmed Yahya Iraq", "A. Iraq", "Iraq", "RB"],
    ["Guillermo Varela Uruguay", "G. Uruguay", "Uruguay", "RB"],
    ["Salomon Rondon Pachuca", "S. Pachuca", "Mexico", "ST"],
    ["Milot Rashica", "M. Rashica", "Turkey", "RW"],
    ["Emil Audero", "E. Audero", "Italy", "GK"],
    ["Ostrava Jiri Letacek", "O. Letacek", "Czech Republic", "GK"],
    ["Davinson Sanchez Galatasaray", "D. Galatasaray", "Turkey", "CB"],
    ["Valentin Gendrey", "V. Gendrey", "Germany", "RB"],
    ["Jeremias Ledesma", "J. Ledesma", "Argentina", "GK"],
    ["Edon Zhegrova Lille", "E. Lille", "France", "RW"],
    ["Yaser Asprilla Colombia", "Y. Colombia", "Colombia", "CAM"],
    ["Luciano Juba", "L. Juba", "Brazil", "LB"],
    ["Yoshinori Muto", "Y. Muto", "Japan", "ST"],
    ["Strahinja Pavlovic", "S. Pavlovic", "Italy", "CB"],
    ["Nikola Katic", "N. Katic", "Bosnia and Herzegovina", "CB"],
    ["Paul Joly", "P. Joly", "France", "RB"],
    ["Philipp Lienhart Austria", "P. Austria", "Austria", "CB"],
    ["Joel Ordonez Ecuador", "J. Ecuador", "Ecuador", "CB"],
    ["Hasan Abdulkareem Iraq", "H. Iraq", "Iraq", "CM"],
    ["Nikola Milenkovic Serbia", "N. Serbia", "Serbia", "CB"],
    ["Lorenzo Lucca Udinese", "L. Udinese", "Italy", "ST"],
    ["Florin Nita", "F. Nita", "Romania", "GK"],
    ["Jackson Tchatchoua", "J. Tchatchoua", "Italy", "RB"],
    ["Cruz Azul Kevin Mier Cruz Azul", "C. Azul", "Mexico", "GK"],
    ["Yann Karamoh", "Y. Karamoh", "Italy", "LW"],
    ["Pawel Wszolek", "P. Wszolek", "Poland", "RB"],
    ["Victor Jensen", "V. Jensen", "Netherlands", "CAM"],
    ["Nicolai Vallys", "N. Vallys", "Denmark", "RW"],
    ["Ismael Bennacer Milan", "I. Milan", "Italy", "CDM"],
    ["Edin Dzeko", "E. Dzeko", "Turkey", "ST"],
    ["Willer Ditta", "W. Ditta", "Mexico", "CB"],
    ["Vanja Milinkovic-Savic Serbia", "V. Serbia", "Serbia", "GK"],
    ["Hassan Al-Tambakti Hilal", "H. Hilal", "Saudi Arabia", "CB"],
    ["Pablo Bennevendo", "P. Bennevendo", "Mexico", "RB"],
    ["Saba Lobzhanidze Atlanta", "S. Atlanta", "USA", "RW"],
    ["Lorenzo Faravelli", "L. Faravelli", "Mexico", "CM"],
    ["Josip Sutalo Croatia", "J. Croatia", "Croatia", "CB"],
    ["Bruno Petkovic", "B. Petkovic", "Croatia", "ST"],
    ["Jahmali Waite", "J. Waite", "Jamaica", "GK"],
    ["Abdulaziz Al-Bishi Ettifaq", "A. Ettifaq", "Saudi Arabia", "CM"],
    ["Frank Magri Toulouse", "F. Toulouse", "France", "ST"],
    ["Um Won-sang", "U. Won-sang", "South Korea", "LW"],
    ["Mark McKenzie Toulouse", "M. Toulouse", "France", "CB"],
    ["Miguel Borja River", "M. River", "Argentina", "ST"],
    ["Michel Aebischer", "M. Aebischer", "Switzerland", "CM"],
    ["Konstantinos Tzolakis", "K. Tzolakis", "Greece", "GK"],
    ["Jere Uronen", "J. Uronen", "Finland", "LB"],
    ["Rayan Cherki Lyon", "R. Lyon", "France", "CAM"],
    ["Enzo Boyomo", "E. Boyomo", "Spain", "CB"],
    ["Federico Pereira", "F. Pereira", "Mexico", "CB"],
    ["Daler Kuzyaev", "D. Kuzyaev", "Russia", "CM"],
    ["Mario Stroeykens Anderlecht", "M. Anderlecht", "Belgium", "CAM"],
    ["Shu Kurata", "S. Kurata", "Japan", "CM"],
    ["Melbourne City Jamie Maclaren City", "M. City", "Australia", "ST"],
    ["Keito Nakamura Reims", "K. Reims", "France", "LW"],
    ["Seamus Coleman Jr", "S. Jr", "England", "RB"],
    ["Jhon Cordoba Krasnodar", "J. Krasnodar", "Russia", "ST"],
    ["Mika Godts Ajax", "M. Ajax", "Netherlands", "LW"],
    ["Juanmi Latasa", "J. Latasa", "Spain", "ST"],
    ["Alexander Gonzalez", "A. Gonzalez", "Venezuela", "RB"],
    ["Liu Yang", "L. Yang", "China", "LB"],
    ["Diego Polenta", "D. Polenta", "Uruguay", "CB"],
    ["Nicolai Remberg", "N. Remberg", "Germany", "CM"],
    ["Jens Petter Hauge Glimt", "J. Glimt", "Norway", "LW"],
    ["Salzburg Alexander Schlager Salzburg", "S. Salzburg", "Austria", "GK"],
    ["Javier Correa", "J. Correa", "Chile", "ST"],
    ["Mark Gillespie", "M. Gillespie", "England", "GK"],
    ["Daan Rots", "D. Rots", "Netherlands", "RW"],
    ["Nordin Jackers Brugge", "N. Brugge", "Belgium", "GK"],
    ["Al-Musrati", "Al-Musrati", "Turkey", "CDM"],
    ["Frederik Ronnow Denmark", "F. Denmark", "Denmark", "GK"],
    ["Aaron Martin", "A. Martin", "Italy", "LB"],
    ["Taher Mohamed Ahly", "T. Ahly", "Egypt", "LW"],
    ["Donny van de Beek", "D. van de Beek", "Spain", "CM"],
    ["Nicolas Fernandez", "N. Fernandez", "Argentina", "CAM"],
    ["Juan Nardoni", "J. Nardoni", "Argentina", "CM"],
    ["Pervis Estupinan", "P. Estupinan", "England", "LB"],
    ["Michael Amir Murillo Panama", "M. Panama", "Panama", "RB"],
    ["Jean-Philippe Krasso CIV", "J. CIV", "Ivory Coast", "ST"],
    ["Sandro Kulenovic", "S. Kulenovic", "Croatia", "ST"],
    ["Tiago Santos Lille", "T. Lille", "France", "RB"],
    ["Sporting KC Johnny Russell", "S. Russell", "USA", "RW"],
    ["Alexis Pena", "A. Pena", "Mexico", "CB"],
    ["Nasser Al-Dawsari Hilal", "N. Hilal", "Saudi Arabia", "CM"],
    ["Calvin Bassey Nigeria", "C. Nigeria", "Nigeria", "CB"],
    ["Nene Jagiellonia", "N. Jagiellonia", "Poland", "CAM"],
    ["Vegetti", "Vegetti", "Brazil", "ST"],
    ["Leo Ortiz", "L. Ortiz", "Brazil", "CB"],
    ["Bernard", "Bernard", "Brazil", "LW"],
    ["Benjamin Verbic", "B. Verbic", "Slovenia", "LW"],
    ["Penarol Washington Aguerre", "P. Aguerre", "Uruguay", "GK"],
    ["Telasco Segovia", "T. Segovia", "Venezuela", "CM"],
    ["Aleksandr Maksimenko", "A. Maksimenko", "Russia", "GK"],
    ["Anis Hadj Moussa Feyenoord", "A. Feyenoord", "Netherlands", "RW"],
    ["Kanu", "Kanu", "Brazil", "CB"],
    ["Uriel Antuna Cruz Azul", "U. Azul", "Mexico", "RW"],
    ["Valentino Lazaro", "V. Lazaro", "Italy", "RB"],
    ["Habib Diarra Strasbourg", "H. Strasbourg", "France", "CM"],
    ["Vitezslav Jaros", "V. Jaros", "Czech Republic", "GK"],
    ["Milan Rodic", "M. Rodic", "Serbia", "LB"],
    ["Steve Mounie Brest", "S. Brest", "France", "ST"],
    ["Fredrik Jensen", "F. Jensen", "Finland", "LW"],
    ["Filippo Terracciano Milan", "F. Milan", "Italy", "RB"],
    ["Danilo Cataldi Lazio", "D. Lazio", "Italy", "CM"],
    ["Bledian Krasniqi", "B. Krasniqi", "Switzerland", "CAM"],
    ["Liberato Cacace Empoli", "L. Empoli", "Italy", "LB"],
    ["Miles Robinson USA", "M. USA", "USA", "CB"],
    ["Michael Olunga", "M. Olunga", "Qatar", "ST"],
    ["Pedro Rodriguez Lazio", "P. Lazio", "Italy", "LW"],
    ["Monterrey Esteban Andrada", "M. Andrada", "Mexico", "GK"],
    ["Veli Mothwa", "V. Mothwa", "South Africa", "GK"],
    ["Pepe Aquino Porto", "P. Porto", "Portugal", "RW"],
    ["Etienne Vaessen", "E. Vaessen", "Netherlands", "GK"],
    ["Florian Grillitsch Austria", "F. Austria", "Austria", "CDM"],
    ["Ganso", "Ganso", "Brazil", "CAM"],
    ["Walter Benitez PSV", "W. PSV", "Netherlands", "GK"],
    ["Awer Mabil Australia", "A. Australia", "Australia", "RW"],
    ["Karim El Debes Ahly", "K. El Debes Ahly", "Egypt", "CM"],
    ["Igor Diveev", "I. Diveev", "Russia", "CB"],
    ["Adam Taggart Australia", "A. Australia", "Australia", "ST"],
    ["Alfons Sampsted", "A. Sampsted", "Iceland", "RB"],
    ["Alexander Aravena", "A. Aravena", "Chile", "LW"],
    ["Jasir Asani", "J. Asani", "Albania", "RW"],
    ["Zan Celar", "Z. Celar", "Switzerland", "ST"],
    ["Razvan Marin Romania", "R. Romania", "Romania", "CM"],
    ["Yunus Musah Milan", "Y. Milan", "Italy", "CM"],
    ["Benjamin Fredrick", "B. Fredrick", "Nigeria", "CB"],
    ["Timothe Cognat", "T. Cognat", "Switzerland", "CM"],
    ["Alex Meret Napoli", "A. Napoli", "Italy", "GK"],
    ["Mathias Kvistgaarden", "M. Kvistgaarden", "Denmark", "ST"],
    ["Hernan Barcos", "H. Barcos", "Peru", "ST"],
    ["Lucho Rodriguez", "L. Rodriguez", "Brazil", "ST"],
    ["Jean-Clair Todibo Nice", "J. Nice", "France", "CB"],
    ["David Vasco", "D. Vasco", "Brazil", "RW"],
    ["Alaves Antonio Blanco", "A. Blanco", "Spain", "CDM"],
    ["Richard Rios Colombia", "R. Colombia", "Colombia", "CM"],
    ["Aral Simsir", "A. Simsir", "Denmark", "LW"],
    ["Genoa Nicola Leali Genoa", "G. Genoa", "Italy", "GK"],
    ["Nicolas de la Cruz Uruguay", "N. de la Cruz Uruguay", "Uruguay", "CAM"],
    ["Jaka Bijol Slovenia", "J. Slovenia", "Slovenia", "CB"],
    ["Juan Soriano", "J. Soriano", "Spain", "GK"],
    ["Evann Guessand CIV", "E. CIV", "Ivory Coast", "ST"],
    ["Jeremie Boga CIV", "J. CIV", "Ivory Coast", "LW"],
    ["Issa Kabore", "I. Kabore", "Burkina Faso", "RB"],
    ["Anderlecht Colin Coosemans Anderlecht", "A. Anderlecht", "Belgium", "GK"],
    ["Robert Bozenik Slovakia", "R. Slovakia", "Slovakia", "ST"],
    ["Angel Di Maria Central", "A. Di Maria Central", "Argentina", "RW"],
    ["Kevin Alvarez America", "K. America", "Mexico", "RB"],
    ["Marc Guehi Jr", "M. Jr", "England", "CB"],
    ["Lewis Morgan", "L. Morgan", "USA", "RW"],
    ["Osame Sahraoui Heerenveen", "O. Heerenveen", "Netherlands", "LW"],
    ["Pedro Pereira", "P. Pereira", "Italy", "RB"],
    ["Alessandro Buongiorno Napoli", "A. Napoli", "Italy", "CB"],
    ["Lucas Piton", "L. Piton", "Brazil", "LB"],
    ["Omari Hutchinson Jr", "O. Jr", "England", "RW"],
    ["Andrea Belotti Como", "A. Como", "Italy", "ST"],
    ["Mohamed Drager Tunisia", "M. Tunisia", "Tunisia", "RB"],
    ["Lilian Brassier", "L. Brassier", "France", "CB"],
    ["Branco van den Boomen Ajax", "B. van den Boomen Ajax", "Netherlands", "CM"],
    ["Otavio Nassr", "O. Nassr", "Saudi Arabia", "CM"],
    ["Mory Diaw Senegal", "M. Senegal", "Senegal", "GK"],
    ["Joan Jordan", "J. Jordan", "Spain", "CM"],
    ["Alex Valera", "A. Valera", "Peru", "ST"],
    ["Facundo Garces", "F. Garces", "Spain", "CB"],
    ["Youssef En-Nesyri Fener", "Y. Fener", "Turkey", "ST"],
    ["Yoane Wissa DRC", "Y. DRC", "DR Congo", "LW"],
    ["Theo De Percin", "T. De Percin", "France", "GK"],
    ["Koji Miyoshi", "K. Miyoshi", "Germany", "RW"],
    ["Juan Cuadrado Atalanta", "J. Atalanta", "Italy", "RB"],
    ["Alvaro Montero Colombia", "A. Colombia", "Colombia", "GK"],
    ["Moritz Jenz", "M. Jenz", "Germany", "CB"],
    ["Ivan Oblyakov", "I. Oblyakov", "Russia", "CM"],
    ["Aitor Fernandez", "A. Fernandez", "Spain", "GK"],
    ["Alexis Guendouz Algeria", "A. Algeria", "Algeria", "GK"],
    ["Marko Vesovic", "M. Vesovic", "Montenegro", "RB"],
    ["Remi Matthews", "R. Matthews", "England", "GK"],
    ["Jhon Chancellor", "J. Chancellor", "Venezuela", "CB"],
    ["Matt Turner USA", "M. USA", "USA", "GK"],
    ["Lassana Coulibaly Mali", "L. Mali", "Mali", "CM"],
    ["Nick Bakker", "N. Bakker", "Netherlands", "CB"],
    ["Raul Jimenez Mexico", "R. Mexico", "Mexico", "ST"],
    ["Gonzalo Montiel River", "G. River", "Argentina", "RB"],
    ["Ianis Hagi", "I. Hagi", "Romania", "CAM"],
    ["Oscar Cardozo", "O. Cardozo", "Paraguay", "ST"],
    ["Park Ji-soo Korea", "P. Korea", "South Korea", "CB"],
    ["Mercado", "Mercado", "Brazil", "CB"],
    ["Julien De Sart", "J. De Sart", "Belgium", "CM"],
    ["Adama Traore Fulham", "A. Fulham", "England", "RW"],
    ["Saud Abdulhamid Roma", "S. Roma", "Italy", "RB"],
    ["Facundo Buonanotte Leicester", "F. Leicester", "England", "CAM"],
    ["Vincent Sierro Swiss", "V. Swiss", "Switzerland", "CM"],
    ["Nicolas Gonzalez Juve", "N. Juve", "Italy", "LW"],
    ["Jhon Lucumi Bologna", "J. Bologna", "Italy", "CB"],
    ["Edu Exposito", "E. Exposito", "Spain", "CM"],
    ["Muhannad Al-Shanqiti Ittihad", "M. Ittihad", "Saudi Arabia", "RB"],
    ["Hakon Haraldsson Iceland", "H. Iceland", "Iceland", "CAM"],
    ["Santiago Mele Uruguay", "S. Uruguay", "Uruguay", "GK"],
    ["Kerem Akturkoglu Benfica", "K. Benfica", "Portugal", "LW"],
    ["Tomas Rincon", "T. Rincon", "Venezuela", "CDM"],
    ["Nicolas Dominguez", "N. Dominguez", "England", "CM"],
    ["Miguel Terceros", "M. Terceros", "Bolivia", "CAM"],
    ["Hugo Vetlesen Brugge", "H. Brugge", "Belgium", "CM"],
    ["Fluminense Fabio Fluminense", "F. Fluminense", "Brazil", "GK"],
    ["Fabio Chiarodia", "F. Chiarodia", "Germany", "CB"],
    ["Antonio Briseno", "A. Briseno", "Mexico", "CB"],
    ["Esequiel Barco2", "E. Barco2", "Russia", "LW"],
    ["Cameron Archer Jr", "C. Jr", "England", "ST"],
    ["Isaac Kiese Thelin", "I. Thelin", "Sweden", "ST"],
    ["Nelson Oliveira", "N. Oliveira", "Portugal", "ST"],
    ["Heinz Lindner", "H. Lindner", "Austria", "GK"],
    ["Edon Zhegrova Kosovo", "E. Kosovo", "Kosovo", "RW"],
    ["Dion Drena Beljo", "D. Beljo", "Croatia", "ST"],
    ["Derrick Kohn", "D. Kohn", "Germany", "LB"],
    ["Joe Scally USA", "J. USA", "USA", "RB"],
    ["Adria Pedrosa", "A. Pedrosa", "Spain", "LB"],
    ["Victor Osimhen Nigeria", "V. Nigeria", "Nigeria", "ST"],
    ["Antonio Silva Benfica", "A. Benfica", "Portugal", "CB"],
    ["Jota Silva", "J. Silva", "England", "RW"],
    ["Chidera Ejuke Nigeria", "C. Nigeria", "Nigeria", "LW"],
    ["Carlos Acevedo", "C. Acevedo", "Mexico", "GK"],
    ["Mouez Hassen Tunisia", "M. Tunisia", "Tunisia", "GK"],
    ["Cenk Tosun", "C. Tosun", "Turkey", "ST"],
    ["AEK Rodolfo Pizarro", "A. Pizarro", "Greece", "CAM"],
    ["Dusan Tadic Serbia", "D. Serbia", "Serbia", "CAM"],
    ["Yukhym Konoplya", "Y. Konoplya", "Ukraine", "RB"],
    ["Joel Chima Fujita Japan", "J. Japan", "Japan", "CM"],
    ["Yordan Osorio", "Y. Osorio", "Italy", "CB"],
    ["Michal Skoras Poland", "M. Poland", "Poland", "RW"],
    ["Miguel Borja Colombia", "M. Colombia", "Colombia", "ST"],
    ["Edrick Menjivar", "E. Menjivar", "Honduras", "GK"],
    ["Bryan Mbeumo Cameroon", "B. Cameroon", "Cameroon", "RW"],
    ["Neco Williams Jr", "N. Jr", "England", "LB"],
    ["Abdallah Sima Brest", "A. Brest", "France", "LW"],
    ["Sekou Koita", "S. Koita", "Mali", "ST"],
    ["Alessandro Deiola Cagliari", "A. Cagliari", "Italy", "CM"],
    ["Enis Bardhi MKD", "E. MKD", "North Macedonia", "CAM"],
    ["Bartosz Slisz", "B. Slisz", "Poland", "CDM"],
    ["Ricardo Pepi USA", "R. USA", "USA", "ST"],
    ["Youri Baas Ajax", "Y. Ajax", "Netherlands", "LB"],
    ["Jose Hurtado", "J. Hurtado", "Ecuador", "RB"],
    ["Yoshimar Yotun", "Y. Yotun", "Peru", "CM"],
    ["Samuel Edozie Anderlecht", "S. Anderlecht", "Belgium", "LW"],
    ["Joel Campbell", "J. Campbell", "Costa Rica", "RW"],
    ["Titi", "Titi", "Brazil", "CB"],
    ["Abdulrahman Ghareeb Nassr", "A. Nassr", "Saudi Arabia", "LW"],
    ["Fashion Sakala", "F. Sakala", "Zambia", "ST"],
    ["Erick Pulgar Flamengo", "E. Flamengo", "Brazil", "CDM"],
    ["Tijjani Reijnders Milan", "T. Milan", "Italy", "CM"],
    ["Gustavo Sangare", "G. Sangare", "Burkina Faso", "CM"],
    ["Bright Osayi-Samuel Fener", "B. Fener", "Turkey", "RB"],
    ["Patrick Cutrone", "P. Cutrone", "Italy", "ST"],
    ["Deroy Duarte", "D. Duarte", "Cape Verde", "CM"],
    ["Qazim Laci", "Q. Laci", "Czech Republic", "CM"],
    ["Matheus Martins Botafogo", "M. Botafogo", "Brazil", "LW"],
    ["Douglas Santos Zenit", "D. Zenit", "Russia", "LB"],
    ["Fabian Schar", "F. Schar", "England", "CB"],
    ["Turki Al-Ammar Shabab", "T. Shabab", "Saudi Arabia", "CAM"],
    ["Heidenheim Kevin Muller", "H. Muller", "Germany", "GK"],
    ["Ramiz Zerrouki Algeria", "R. Algeria", "Algeria", "CDM"],
    ["Lisandro Magallan", "L. Magallan", "Argentina", "CB"],
    ["Leo Pereira Flamengo", "L. Flamengo", "Brazil", "CB"],
    ["Orkun Kokcu Benfica", "O. Benfica", "Portugal", "CM"],
    ["Neal Maupay", "N. Maupay", "France", "ST"],
    ["Simon Kjaer", "S. Kjaer", "Denmark", "CB"],
    ["Taiwo Awoniyi Nigeria", "T. Nigeria", "Nigeria", "ST"],
    ["Kodai Sano", "K. Sano", "Netherlands", "CAM"],
    ["Eldor Shomurodov Roma", "E. Roma", "Italy", "ST"],
    ["St Pauli Nikola Vasilj", "S. Vasilj", "Germany", "GK"],
    ["Bruno Mendez", "B. Mendez", "Mexico", "CB"],
    ["Jean Michael Seri CIV", "J. CIV", "Ivory Coast", "CM"],
    ["Nahitan Nandez Uruguay", "N. Uruguay", "Uruguay", "RB"],
    ["Simon Adingra CIV", "S. CIV", "Ivory Coast", "LW"],
    ["Paulo Henrique", "P. Henrique", "Brazil", "RB"],
    ["Danilho Doekhi", "D. Doekhi", "Germany", "CB"],
    ["David Min", "D. Min", "Netherlands", "ST"],
    ["Lewis Cook Jr", "L. Jr", "England", "CM"],
    ["Jesse Joronen Finland", "J. Finland", "Finland", "GK"],
    ["Benedict Hollerbach", "B. Hollerbach", "Germany", "LW"],
    ["Kaan Kairinen", "K. Kairinen", "Czech Republic", "CM"],
    ["Luis Advincula Boca", "L. Boca", "Argentina", "RB"],
    ["Alvaro Valles", "A. Valles", "Spain", "GK"],
    ["Cheick Doucoure Jr", "C. Jr", "England", "CDM"],
    ["Bahia Tomas Conechny", "B. Conechny", "Argentina", "LW"],
    ["Djordje Mihailovic", "D. Mihailovic", "USA", "CAM"],
    ["Cedric Itten", "C. Itten", "Switzerland", "ST"],
    ["Mehdi Taremi Inter", "M. Inter", "Italy", "ST"],
    ["Galeno Ahli", "G. Ahli", "Saudi Arabia", "LW"],
    ["Joel Latibeaudiere", "J. Latibeaudiere", "Jamaica", "CB"],
    ["Keanu Baccus Australia", "K. Australia", "Australia", "CDM"],
    ["Lawrence Mulenga", "L. Mulenga", "Zambia", "GK"],
    ["Guelor Kanga", "G. Kanga", "Gabon", "CM"],
    ["Reda Khadra", "R. Khadra", "France", "CAM"],
    ["Ewerton", "Ewerton", "Czech Republic", "ST"],
    ["Amas Obasogie", "A. Obasogie", "Nigeria", "GK"],
    ["Mohamed Abou Gabal", "M. Gabal", "Egypt", "GK"],
    ["Jae-sung Lee", "J. Lee", "Germany", "CAM"],
    ["Raphael Onyedika Nigeria", "R. Nigeria", "Nigeria", "CDM"],
    ["Jonathan Rowe", "J. Rowe", "France", "LW"],
    ["Rodrigo Zalazar Braga", "R. Braga", "Portugal", "CAM"],
    ["Anibal Godoy", "A. Godoy", "Panama", "CDM"],
    ["Alexandre Penetra", "A. Penetra", "Netherlands", "CB"],
    ["Gabriel Avalos", "G. Avalos", "Argentina", "ST"],
    ["Thomas Beelen Feyenoord", "T. Feyenoord", "Netherlands", "CB"],
    ["Vedat Muriqi Jr", "V. Jr", "Spain", "ST"],
    ["Mika Marmol", "M. Marmol", "Spain", "CB"],
    ["Tymoteusz Puchacz", "T. Puchacz", "Poland", "LB"],
    ["Portland Evander", "P. Evander", "USA", "CAM"],
    ["Yari Verschaeren Anderlecht", "Y. Anderlecht", "Belgium", "CAM"],
    ["Anton Salétros", "A. Salétros", "Sweden", "CM"],
    ["Cristian Casseres", "C. Casseres", "France", "CM"],
    ["Mateu Morey", "M. Morey", "Spain", "RB"],
    ["Felix Torres Ecuador", "F. Ecuador", "Ecuador", "CB"],
    ["Yazeed Abulaila", "Y. Abulaila", "Jordan", "GK"],
    ["Ardian Ismajli Albania", "A. Albania", "Albania", "CB"],
    ["Christos Zafeiris", "C. Zafeiris", "Czech Republic", "CM"],
    ["Rangers Chidiebere Nwobodo", "R. Nwobodo", "Nigeria", "CM"],
    ["Emam Ashour Ahly", "E. Ahly", "Egypt", "CAM"],
    ["Matias Soule Roma", "M. Roma", "Italy", "RW"],
    ["Jordan James Rennes", "J. Rennes", "France", "CM"],
    ["Ozan Tufan", "O. Tufan", "Turkey", "CM"],
    ["Bassam Al-Rawi Qatar", "B. Qatar", "Qatar", "CB"],
    ["Won Du-jae Korea", "W. Korea", "South Korea", "CDM"],
    ["Patrick Maswanganyi", "P. Maswanganyi", "South Africa", "CAM"],
    ["Jon Gorenc Stankovic Slovenia", "J. Slovenia", "Slovenia", "CDM"],
    ["Jesus Imaz", "J. Imaz", "Poland", "CAM"],
    ["Marton Dardai", "M. Dardai", "Hungary", "CB"],
    ["Camilo Vargas Colombia", "C. Colombia", "Colombia", "GK"],
    ["Lionel Mpasi", "L. Mpasi", "DR Congo", "GK"],
    ["Odsonne Edouard Leicester", "O. Leicester", "England", "ST"],
    ["Ivi Lopez", "I. Lopez", "Poland", "CAM"],
    ["Mathias Jensen Denmark", "M. Denmark", "Denmark", "CM"],
    ["Ben Waine", "B. Waine", "New Zealand", "ST"],
    ["Rui Silva Betis", "R. Betis", "Spain", "GK"],
    ["Hirving Lozano PSV", "H. PSV", "Netherlands", "RW"],
    ["Robin Roefs", "R. Roefs", "Netherlands", "GK"],
    ["Andrea Pinamonti Genoa", "A. Genoa", "Italy", "ST"],
    ["Federico Vinas", "F. Vinas", "Mexico", "ST"],
    ["Alessio Romagnoli Lazio", "A. Lazio", "Italy", "CB"],
    ["Jordan Ayew Ghana", "J. Ghana", "Ghana", "RW"],
    ["Argentinos Diego Rodriguez", "A. Rodriguez", "Argentina", "GK"],
    ["Frank Anguissa Napoli", "F. Napoli", "Italy", "CM"],
    ["Saul Niguez", "S. Niguez", "Spain", "CM"],
    ["Petar Ratkov", "P. Ratkov", "Austria", "ST"],
    ["Gamba Masaaki Higashiguchi", "G. Higashiguchi", "Japan", "GK"],
    ["Calvin Stengs Feyenoord", "C. Feyenoord", "Netherlands", "CAM"],
    ["Millonarios Alvaro Montero Millos", "M. Millos", "Colombia", "GK"],
    ["Montassar Talbi Tunisia", "M. Tunisia", "Tunisia", "CB"],
    ["Romero Corinthians", "R. Corinthians", "Brazil", "RW"],
    ["Moreirense Kewin Silva", "M. Silva", "Portugal", "GK"],
    ["Ike Ugbo Canada", "I. Canada", "Canada", "ST"],
    ["Universitario Sebastian Britos", "U. Britos", "Peru", "GK"],
    ["Albion Rrahmani", "A. Rrahmani", "Czech Republic", "ST"],
    ["Denis Bouanga LAFC", "D. LAFC", "USA", "LW"],
    ["Lisandro Magallan Pumas", "L. Pumas", "Mexico", "CB"],
    ["Christian Norgaard Denmark", "C. Denmark", "Denmark", "CDM"],
    ["Marcelo Flores", "M. Flores", "Mexico", "LW"],
    ["Lucas Assadi", "L. Assadi", "Chile", "CAM"],
    ["Denis Dragus", "D. Dragus", "Romania", "ST"],
    ["Nikola Vlasic Croatia", "N. Croatia", "Croatia", "CAM"],
    ["Alexander Djiku Ghana", "A. Ghana", "Ghana", "CB"],
    ["Ross Stewart Jr", "R. Jr", "England", "ST"],
    ["Rincon", "Rincon", "Brazil", "CDM"],
    ["Diadie Samassekou", "D. Samassekou", "Germany", "CDM"],
    ["Richard Rios Palmeiras", "R. Palmeiras", "Brazil", "CM"],
    ["Udinese Maduka Okoye Udinese", "U. Udinese", "Italy", "GK"],
    ["Bebe", "Bebe", "Cape Verde", "LW"],
    ["Sammie Szmodics Jr", "S. Jr", "England", "CAM"],
    ["Kim Jin-su Korea", "K. Korea", "South Korea", "LB"],
    ["Albert Gronbaek Denmark", "A. Denmark", "Denmark", "CAM"],
    ["Jose Maria Gimenez Jr", "J. Jr", "Spain", "CB"],
    ["Dennis Appiah", "D. Appiah", "France", "RB"],
    ["San Luis Andres Sanchez", "S. Sanchez", "Mexico", "GK"],
    ["Egil Selvik", "E. Selvik", "Norway", "GK"],
    ["Claudio Bravo Chile", "C. Chile", "Chile", "GK"],
    ["Folarin Balogun Monaco", "F. Monaco", "France", "ST"],
    ["Wesley Inter", "W. Inter", "Brazil", "LW"],
    ["Guillermo Martinez Pumas", "G. Pumas", "Mexico", "ST"],
    ["Erick Pulgar Chile", "E. Chile", "Chile", "CDM"],
    ["Witi", "Witi", "Portugal", "LW"],
    ["Semuel Pizzignacco", "S. Pizzignacco", "Italy", "GK"]
  ], REAL_PLAYERS_WAVE6 = [
    ["Paulo Vitor", "P. Vitor", "Portugal", "GK"],
    ["Bas Dost", "B. Dost", "Netherlands", "CM"],
    ["Diego Souza", "D. Souza", "Brazil", "ST"],
    ["Mattias Johansson", "M. Johansson", "Sweden", "CM"],
    ["Nicolai Larsen", "N. Larsen", "Denmark", "GK"],
    ["Nahuel Losada", "N. Losada", "Argentina", "GK"],
    ["Arthur Desmas", "A. Desmas", "France", "GK"],
    ["Urko Gonzalez", "U. Gonzalez", "Spain", "ST"],
    ["Mathias Jorgensen", "M. Jorgensen", "Denmark", "CB"],
    ["Simon Ngapandouetnbu", "S. Ngapandouetnbu", "Cameroon", "GK"],
    ["Kik Pierie", "K. Pierie", "Netherlands", "CB"],
    ["Yuki Ohashi", "Y. Ohashi", "Japan", "CM"],
    ["Adryelson", "Adryelson", "Brazil", "CB"],
    ["Stijn Wuytens", "S. Wuytens", "Netherlands", "LB"],
    ["Amjad Attwan", "A. Attwan", "Iraq", "GK"],
    ["Cesar", "Cesar", "Brazil", "GK"],
    ["Lucas Silva", "L. Silva", "Brazil", "CM"],
    ["Dante Vanzeir", "D. Vanzeir", "Belgium", "CM"],
    ["Wuilker Farinez", "W. Farinez", "Venezuela", "GK"],
    ["Anthony Martial", "A. Martial", "France", "CAM"],
    ["Tim Krul", "T. Krul", "Netherlands", "GK"],
    ["Goncalo Tabuaco", "G. Tabuaco", "Portugal", "GK"],
    ["Karim Ansarifard", "K. Ansarifard", "Iran", "GK"],
    ["Curtis Nelson", "C. Nelson", "England", "CB"],
    ["Harrison Ashby", "H. Ashby", "England", "LB"],
    ["Khalfan Mubarak", "K. Mubarak", "United Arab Emirates", "GK"],
    ["Mitchell Dijks", "M. Dijks", "Netherlands", "LB"],
    ["Jordi Masip", "J. Masip", "Spain", "GK"],
    ["Eden Hazard", "E. Hazard", "Belgium", "CDM"],
    ["Ricardo Velho", "R. Velho", "Portugal", "GK"],
    ["Tommy Conway", "T. Conway", "Scotland", "CM"],
    ["Nacho Vidal", "N. Vidal", "Spain", "RB"],
    ["Ryan Merlen", "R. Merlen", "Belgium", "CB"],
    ["Jose Fonte", "J. Fonte", "Portugal", "CB"],
    ["Tom Lockyer", "T. Lockyer", "England", "CB"],
    ["Adebayo Adeleye", "A. Adeleye", "Nigeria", "GK"],
    ["Djibril Sidibe", "D. Sidibe", "France", "LB"],
    ["Jonas Lossl", "J. Lossl", "Germany", "RB"],
    ["Walid Abbas", "W. Abbas", "United Arab Emirates", "GK"],
    ["Kosei Tani", "K. Tani", "Japan", "GK"],
    ["Sydney van Hooijdonk", "S. van Hooijdonk", "Netherlands", "CM"],
    ["Gaetan Coucke", "G. Coucke", "Belgium", "GK"],
    ["Ezequiel Bullaude", "E. Bullaude", "Argentina", "RB"],
    ["Marin Ljubicic", "M. Ljubicic", "Croatia", "CM"],
    ["Vladimir Darida", "V. Darida", "Germany", "ST"],
    ["Pablo Perez", "P. Perez", "Spain", "CM"],
    ["Osama Rashid", "O. Rashid", "Iraq", "GK"],
    ["Jan Thielmann", "J. Thielmann", "Germany", "CM"],
    ["Juanmi", "Juanmi", "Spain", "RW"],
    ["Robson Bambu", "R. Bambu", "Portugal", "CB"],
    ["Lucas Pirard", "L. Pirard", "Belgium", "GK"],
    ["Chris Basham", "C. Basham", "England", "CB"],
    ["Colby Bishop", "C. Bishop", "England", "ST"],
    ["Ayumu Seko", "A. Seko", "Japan", "GK"],
    ["Kim Jun-hong", "K. Jun-hong", "South Korea", "CM"],
    ["Thomas Foket", "T. Foket", "Belgium", "CB"],
    ["Alex Sorloth", "A. Sorloth", "Spain", "ST"],
    ["Cory Burke", "C. Burke", "Jamaica", "GK"],
    ["Kim Dong-jun", "K. Dong-jun", "South Korea", "GK"],
    ["Jerry Yates", "J. Yates", "England", "RM"],
    ["Andre Amaro", "A. Amaro", "Portugal", "CB"],
    ["Nathan Redmond", "N. Redmond", "England", "CM"],
    ["Sonny Perkins", "S. Perkins", "England", "CAM"],
    ["Sime Vrsaljko", "S. Vrsaljko", "Croatia", "CB"],
    ["Dawid Kownacki", "D. Kownacki", "Poland", "CM"],
    ["Aleix Febas", "A. Febas", "Spain", "RB"],
    ["Mikel Jauregizar", "M. Jauregizar", "Spain", "CM"],
    ["Bruno Brigido", "B. Brigido", "Portugal", "GK"],
    ["Bebeto", "Bebeto", "Portugal", "CB"],
    ["Daniel Iversen", "D. Iversen", "England", "GK"],
    ["Mateusinho", "Mateusinho", "Brazil", "RB"],
    ["Lucas Pratto", "L. Pratto", "Argentina", "ST"],
    ["Ryan Giles", "R. Giles", "England", "LB"],
    ["Jack Cork", "J. Cork", "England", "CM"],
    ["Daniel-Kofi Kyereh", "D. Kyereh", "Ghana", "CM"],
    ["Hugo Siquet", "H. Siquet", "Belgium", "CB"],
    ["Jerome Boateng", "J. Boateng", "Germany", "CB"],
    ["Amari'i Bell", "A. Bell", "Jamaica", "GK"],
    ["Ryan Babel", "R. Babel", "Netherlands", "CM"],
    ["Ali Salmeen", "A. Salmeen", "United Arab Emirates", "GK"],
    ["Dimitri Payet", "D. Payet", "France", "CM"],
    ["Harvey Vale", "H. Vale", "England", "CAM"],
    ["Eiji Kawashima", "E. Kawashima", "Japan", "GK"],
    ["Ignacio Laquintana", "I. Laquintana", "Uruguay", "CM"],
    ["Julian Draxler", "J. Draxler", "Germany", "CM"],
    ["Presnel Kimpembe", "P. Kimpembe", "France", "CB"],
    ["Marvin Keller", "M. Keller", "Switzerland", "GK"],
    ["Steve Zuber", "S. Zuber", "Germany", "ST"],
    ["Ryan Kent", "R. Kent", "England", "LM"],
    ["Lewis Baker", "L. Baker", "England", "CM"],
    ["Mile Skoric", "M. Skoric", "Croatia", "CB"],
    ["Sam Gallagher", "S. Gallagher", "England", "ST"],
    ["Sam Greenwood", "S. Greenwood", "England", "LM"],
    ["Lovre Kalinic", "L. Kalinic", "Croatia", "GK"],
    ["Adan", "Adan", "Portugal", "GK"],
    ["Julio Buffarini", "J. Buffarini", "Argentina", "LB"],
    ["Nicolo Cambiaghi", "N. Cambiaghi", "Italy", "CM"],
    ["Mads Emil Madsen", "M. Madsen", "Denmark", "CM"],
    ["Maycon", "Maycon", "Brazil", "CDM"],
    ["Jorge Almiron", "J. Almiron", "Argentina", "CDM"],
    ["Samuel Umtiti", "S. Umtiti", "France", "CB"],
    ["Santiago Solari", "S. Solari", "Argentina", "CM"],
    ["Xavier Chavalerin", "X. Chavalerin", "France", "CM"],
    ["Frans Dhia Putros", "F. Putros", "Iraq", "GK"],
    ["Mathieu Cafaro", "M. Cafaro", "France", "CM"],
    ["Wesley Hoedt", "W. Hoedt", "Netherlands", "CB"],
    ["Pontus Dahlberg", "P. Dahlberg", "Sweden", "GK"],
    ["Nemanja Radonjic", "N. Radonjic", "Serbia", "GK"],
    ["Lyle Taylor", "L. Taylor", "England", "ST"],
    ["Bartosz Bida", "B. Bida", "Poland", "CM"],
    ["Mark Uth", "M. Uth", "Germany", "ST"],
    ["Lee Ki-je", "L. Ki-je", "South Korea", "GK"],
    ["Nikola Storm", "N. Storm", "Belgium", "CM"],
    ["Esteban Andrada", "E. Andrada", "Argentina", "GK"],
    ["Gabriel Slonina", "G. Slonina", "USA", "GK"],
    ["Maxime Lopez", "M. Lopez", "France", "CM"],
    ["Emmanuel Agbadou", "E. Agbadou", "Ivory Coast", "GK"],
    ["Diogo Goncalves", "D. Goncalves", "Portugal", "CM"],
    ["Cristian Tello", "C. Tello", "Spain", "LW"],
    ["Victor Chust", "V. Chust", "Spain", "CB"],
    ["Damian Martinez", "D. Martinez", "Argentina", "RB"],
    ["Aurele Amenda", "A. Amenda", "Switzerland", "GK"],
    ["Trezeguet", "Trezeguet", "Egypt", "GK"],
    ["Rhys Norrington-Davies", "R. Norrington-Davies", "Wales", "GK"],
    ["Renzo Saravia", "R. Saravia", "Argentina", "LB"],
    ["Robby McCrorie", "R. McCrorie", "Scotland", "GK"],
    ["Alan Pulido", "A. Pulido", "Mexico", "CM"],
    ["Josh Bowler", "J. Bowler", "England", "CAM"],
    ["Malcom Bokele", "M. Bokele", "France", "CAM"],
    ["Robert Arboleda", "R. Arboleda", "Ecuador", "GK"],
    ["Ricardo Batista", "R. Batista", "Portugal", "GK"],
    ["Jonjo Shelvey", "J. Shelvey", "England", "CM"],
    ["Will Keane", "W. Keane", "England", "ST"],
    ["Cristian Volpato", "C. Volpato", "Italy", "CM"],
    ["El Mehdi Al Harar", "E. Mehdi Al Harar", "Morocco", "GK"],
    ["Jack Robinson", "J. Robinson", "England", "LB"],
    ["Rasmus Hojlund", "R. Hojlund", "Denmark", "GK"],
    ["Kervin Andrade", "K. Andrade", "Venezuela", "GK"],
    ["Matej Mitrovic", "M. Mitrovic", "Croatia", "CB"],
    ["Renaud Ripart", "R. Ripart", "France", "CM"],
    ["Charlie Austin", "C. Austin", "England", "ST"],
    ["Kevin Nisbet", "K. Nisbet", "Scotland", "CM"],
    ["Diogo Barbosa", "D. Barbosa", "Brazil", "LB"],
    ["Nahki Wells", "N. Wells", "England", "RM"],
    ["Willian Arao", "W. Arao", "Brazil", "CDM"],
    ["Sinan Bolat", "S. Bolat", "Belgium", "GK"],
    ["Mattia Destro", "M. Destro", "Italy", "ST"],
    ["Maximilian Bauer", "M. Bauer", "Germany", "LB"],
    ["Jose Sosa", "J. Sosa", "Argentina", "CDM"],
    ["Ben Wilson", "B. Wilson", "England", "GK"],
    ["Joao Victor", "J. Victor", "Brazil", "CB"],
    ["George Hall", "G. Hall", "England", "CDM"],
    ["Stefano Sensi", "S. Sensi", "Italy", "CDM"],
    ["Dani Martin", "D. Martin", "Spain", "GK"],
    ["Ameen Al-Dakhil", "A. Al-Dakhil", "Belgium", "CB"],
    ["Senne Lammens", "S. Lammens", "Belgium", "GK"],
    ["Davy Roef", "D. Roef", "Belgium", "GK"],
    ["Braian Ojeda", "B. Ojeda", "Paraguay", "GK"],
    ["Mehdi Benabid", "M. Benabid", "Morocco", "GK"],
    ["Alessio Zerbin", "A. Zerbin", "Italy", "CM"],
    ["Pizzi", "Pizzi", "Portugal", "CM"],
    ["Ezequiel Unsain", "E. Unsain", "Argentina", "RB"],
    ["Tiago Gouveia", "T. Gouveia", "Portugal", "LB"],
    ["Carlos Borges", "C. Borges", "Portugal", "CM"],
    ["Ahmed Basil", "A. Basil", "Iraq", "GK"],
    ["Gabriel Menino", "G. Menino", "Brazil", "CM"],
    ["Ross McCrorie", "R. McCrorie", "Scotland", "CM"],
    ["Matteo Lovato", "M. Lovato", "Italy", "CB"],
    ["Jeong Sang-bin", "J. Sang-bin", "South Korea", "CM"],
    ["Yusuf Yazici", "Y. Yazici", "Turkey", "CM"],
    ["Dorukhan Tokoz", "D. Tokoz", "Turkey", "CM"],
    ["Kieran Dowell", "K. Dowell", "England", "RB"],
    ["Fabio Quagliarella", "F. Quagliarella", "Italy", "CAM"],
    ["Luiz Felipe", "L. Felipe", "Brazil", "LB"],
    ["Alessandro Schopf", "A. Schopf", "Austria", "CM"],
    ["Lewis O'Brien", "L. O'Brien", "England", "CM"],
    ["Djamel Benlamri", "D. Benlamri", "Algeria", "GK"],
    ["Miguel Araujo", "M. Araujo", "Peru", "GK"],
    ["Oliver Dovin", "O. Dovin", "Sweden", "GK"],
    ["Davie Selke", "D. Selke", "Germany", "ST"],
    ["Kevin Akpoguma", "K. Akpoguma", "Nigeria", "CM"],
    ["Philipp Max", "P. Max", "Germany", "LB"],
    ["Lucas Perez", "L. Perez", "Spain", "RW"],
    ["Faitout Maouassa", "F. Maouassa", "France", "LB"],
    ["Tom Krauss", "T. Krauss", "Germany", "LB"],
    ["Ellis Simms", "E. Simms", "England", "RM"],
    ["Thelo Aasgaard", "T. Aasgaard", "Norway", "CM"],
    ["Erik Durm", "E. Durm", "Germany", "LB"],
    ["Karlo Letica", "K. Letica", "Croatia", "GK"],
    ["Federico Macheda", "F. Macheda", "Italy", "ST"],
    ["Mattia Zanotti", "M. Zanotti", "Italy", "LB"],
    ["Andy Robertson", "A. Robertson", "Scotland", "GK"],
    ["Jacen Russell-Rowe", "J. Russell-Rowe", "Canada", "GK"],
    ["Pape Ndiaye Souare", "P. Souare", "Senegal", "CM"],
    ["Antonio Candreva", "A. Candreva", "Italy", "CM"],
    ["Payam Niazmand", "P. Niazmand", "Iran", "GK"],
    ["Marco Bizot", "M. Bizot", "Netherlands", "GK"],
    ["Serdar Dursun", "S. Dursun", "Germany", "ST"],
    ["Josip Posavec", "J. Posavec", "Croatia", "GK"],
    ["Lovro Zvonarek", "L. Zvonarek", "Croatia", "CM"],
    ["Tobias Lawal", "T. Lawal", "Austria", "GK"],
    ["Jamaal Lascelles", "J. Lascelles", "England", "CB"],
    ["Alfred Gomis", "A. Gomis", "Senegal", "GK"],
    ["Mahmoud Abdel Rahim", "M. Rahim", "Egypt", "GK"],
    ["Cleiton", "Cleiton", "Brazil", "GK"],
    ["Mamadou Sakho", "M. Sakho", "France", "CB"],
    ["Dario Melnjak", "D. Melnjak", "Croatia", "CB"],
    ["Charles Folly", "C. Folly", "Ivory Coast", "GK"],
    ["Andrea Cistana", "A. Cistana", "Italy", "CB"],
    ["Haris Seferovic", "H. Seferovic", "Switzerland", "CM"],
    ["Marcel Halstenberg", "M. Halstenberg", "Germany", "LB"],
    ["Ezequiel Cerutti", "E. Cerutti", "Argentina", "CM"],
    ["Tiago Ilori", "T. Ilori", "Portugal", "CB"],
    ["Anthony Moris", "A. Moris", "Belgium", "CB"],
    ["Yassine Bammou", "Y. Bammou", "Morocco", "CM"],
    ["Marvin Schwabe", "M. Schwabe", "Germany", "GK"],
    ["Trigueira", "Trigueira", "Portugal", "GK"],
    ["Sambou Sissoko", "S. Sissoko", "Senegal", "CM"],
    ["Balazs Toth", "B. Toth", "Hungary", "GK"],
    ["Theo Corbeanu", "T. Corbeanu", "Canada", "GK"],
    ["Lautaro Gimenez", "L. Gimenez", "Argentina", "ST"],
    ["Gilles Sunu", "G. Sunu", "France", "RB"],
    ["Kevin Volland", "K. Volland", "Germany", "CAM"],
    ["Bader Nasser", "B. Nasser", "United Arab Emirates", "GK"],
    ["Arnaud Bodart", "A. Bodart", "Belgium", "GK"],
    ["Rafael Navarro", "R. Navarro", "Brazil", "ST"],
    ["Mitchell van Bergen", "M. van Bergen", "Netherlands", "CM"],
    ["Luciano Valente", "L. Valente", "Netherlands", "CM"],
    ["Lars Stindl", "L. Stindl", "Germany", "CM"],
    ["Ji So-yun", "J. So-yun", "South Korea", "CM"],
    ["Mohamed Ihattaren", "M. Ihattaren", "Netherlands", "CM"],
    ["Damian Szymanski", "D. Szymanski", "Poland", "CM"],
    ["Francesco Forte", "F. Forte", "Italy", "ST"],
    ["Rodrigo Moreno", "R. Moreno", "Spain", "RW"],
    ["Orjan Nyland", "O. Nyland", "Norway", "GK"],
    ["Philippe Coutinho", "P. Coutinho", "Brazil", "CM"],
    ["Lukasz Skorupski", "L. Skorupski", "Poland", "GK"],
    ["Cristian Rodriguez", "C. Rodriguez", "Uruguay", "CM"],
    ["Lucas Hoyos", "L. Hoyos", "Argentina", "GK"],
    ["Jorne Spileers", "J. Spileers", "Belgium", "CB"],
    ["Ismael El Haddad", "I. El Haddad", "Morocco", "CM"],
    ["Sergio Oliveira", "S. Oliveira", "Portugal", "CM"],
    ["Facundo Roncaglia", "F. Roncaglia", "Argentina", "RB"],
    ["Gil Dias", "G. Dias", "Portugal", "ST"],
    ["Dan James", "D. James", "England", "LM"],
    ["Leo Jardim", "L. Jardim", "Brazil", "GK"],
    ["Andre Hansen", "A. Hansen", "Norway", "GK"],
    ["Jakob Johansson", "J. Johansson", "Germany", "CDM"],
    ["Dejan Lovren", "D. Lovren", "Croatia", "GK"],
    ["Nicolas Penneteau", "N. Penneteau", "Belgium", "GK"],
    ["Danijel Subasic", "D. Subasic", "Croatia", "GK"],
    ["Michael Folorunsho", "M. Folorunsho", "Italy", "CDM"],
    ["Florian Kainz", "F. Kainz", "Germany", "CAM"],
    ["Ismaeel Mohammad", "I. Mohammad", "Qatar", "GK"],
    ["Ohi Omoijuanfo", "O. Omoijuanfo", "Norway", "CM"],
    ["Lukas Klunter", "L. Klunter", "Germany", "LB"],
    ["Baris Yilmaz", "B. Yilmaz", "Turkey", "CM"],
    ["Sten Grytebust", "S. Grytebust", "Norway", "GK"],
    ["Max Kruse", "M. Kruse", "Germany", "ST"],
    ["Dinis Almeida", "D. Almeida", "Portugal", "CB"],
    ["Kevin Paredes", "K. Paredes", "USA", "CM"],
    ["Marvin Schulz", "M. Schulz", "Germany", "RB"],
    ["Amara Diouf", "A. Diouf", "Senegal", "CM"],
    ["Kacper Tobiasz", "K. Tobiasz", "Poland", "GK"],
    ["Adrian Semper", "A. Semper", "Croatia", "GK"],
    ["Sebastien Coopman", "S. Coopman", "France", "CB"],
    ["Louie Barry", "L. Barry", "England", "CAM"],
    ["Fabio", "Fabio", "Brazil", "GK"],
    ["Olorunleke Ojo", "O. Ojo", "Nigeria", "GK"],
    ["Wesley", "Wesley", "Brazil", "CM"],
    ["Kevin Denkey", "K. Denkey", "Belgium", "CM"],
    ["Leonidas Stergiou", "L. Stergiou", "Switzerland", "GK"],
    ["Christopher Antwi-Adjei", "C. Antwi-Adjei", "Ghana", "CM"],
    ["Alvaro Odriozola", "A. Odriozola", "Spain", "RB"],
    ["Louis Schaub", "L. Schaub", "Austria", "CM"],
    ["Peter Vindahl", "P. Vindahl", "Denmark", "GK"],
    ["Perr Schuurs", "P. Schuurs", "Netherlands", "CB"],
    ["Leo Dubois", "L. Dubois", "France", "RB"],
    ["Geromel", "Geromel", "Brazil", "CB"],
    ["Nicolas Blandi", "N. Blandi", "Argentina", "ST"],
    ["Jonathan Rodriguez", "J. Rodriguez", "Uruguay", "CM"],
    ["Arnau Puigmal", "A. Puigmal", "Spain", "CM"],
    ["Frederik Ronnow", "F. Ronnow", "Germany", "GK"],
    ["Daniele Padelli", "D. Padelli", "Italy", "GK"],
    ["Samuel Costa", "S. Costa", "Portugal", "CM"],
    ["Agustin Giay", "A. Giay", "Argentina", "RB"],
    ["Koo Ja-cheol", "K. Ja-cheol", "South Korea", "CM"],
    ["Milan van Ewijk", "M. van Ewijk", "Netherlands", "LB"],
    ["Hussein Ali Al-Saedi", "H. Al-Saedi", "Iraq", "GK"],
    ["Mao Hosoya", "M. Hosoya", "Japan", "CM"],
    ["Mert Hakan Yandas", "M. Yandas", "Turkey", "CM"],
    ["Vitor Tormena", "V. Tormena", "Portugal", "CB"],
    ["Abdelali Mhamdi", "A. Mhamdi", "Morocco", "GK"],
    ["Agustin Alvarez", "A. Alvarez", "Uruguay", "CM"],
    ["Jorge Broun", "J. Broun", "Argentina", "GK"],
    ["Rui Sousa", "R. Sousa", "Portugal", "LB"],
    ["Cucho Hernandez", "C. Hernandez", "Colombia", "CM"],
    ["Frederik Alves", "F. Alves", "Denmark", "CB"],
    ["Daley Sinkgraven", "D. Sinkgraven", "Netherlands", "LB"],
    ["Timo Becker", "T. Becker", "Germany", "LB"],
    ["Sandro Wagner", "S. Wagner", "Germany", "ST"],
    ["Kilian Ludewig", "K. Ludewig", "Germany", "CB"],
    ["Mohamed Daramy", "M. Daramy", "Denmark", "CM"],
    ["Adel Al-Hosani", "A. Al-Hosani", "United Arab Emirates", "GK"],
    ["Simon Sluga", "S. Sluga", "Croatia", "GK"],
    ["Andre Moreira", "A. Moreira", "Portugal", "GK"],
    ["Lucas Janson", "L. Janson", "Argentina", "ST"],
    ["Gonzalo Martinez", "G. Martinez", "Argentina", "ST"],
    ["Bruno Zapelli", "B. Zapelli", "Argentina", "CDM"],
    ["Okan Kocuk", "O. Kocuk", "Turkey", "GK"],
    ["Alexsandro", "Alexsandro", "Brazil", "LB"],
    ["Vanderlei", "Vanderlei", "Brazil", "GK"],
    ["Macaulay Langstaff", "M. Langstaff", "England", "ST"],
    ["Luca Moro", "L. Moro", "Italy", "CAM"],
    ["Edenilson", "Edenilson", "Brazil", "CDM"],
    ["Eddie Salcedo", "E. Salcedo", "Italy", "ST"],
    ["Tomas Tavares", "T. Tavares", "Portugal", "LB"],
    ["Omid Noorafkan", "O. Noorafkan", "Iran", "GK"],
    ["Lee Chung-yong", "L. Chung-yong", "South Korea", "CM"],
    ["Chérif Dieye", "C. Dieye", "Senegal", "CM"],
    ["Hamdy Fathy", "H. Fathy", "Egypt", "GK"],
    ["Abdul Rahman Baba", "A. Baba", "Ghana", "GK"],
    ["Karim Onisiwo", "K. Onisiwo", "Austria", "CM"],
    ["Hernan Galindez", "H. Galindez", "Ecuador", "GK"],
    ["Giorgos Baldock", "G. Baldock", "Greece", "GK"],
    ["Marko Maric", "M. Maric", "Croatia", "GK"],
    ["Robbin Ruiter", "R. Ruiter", "Netherlands", "GK"],
    ["Leopold Wahlstedt", "L. Wahlstedt", "Norway", "GK"],
    ["Ivan Romero", "I. Romero", "Spain", "LW"],
    ["Franco Gonzalez", "F. Gonzalez", "Uruguay", "CM"],
    ["Allan", "Allan", "Brazil", "CDM"],
    ["Lucas Alario", "L. Alario", "Argentina", "CM"],
    ["Josh Maja", "J. Maja", "England", "RM"],
    ["Jorge Fernandes", "J. Fernandes", "Portugal", "CB"],
    ["Sam Nombe", "S. Nombe", "England", "LM"],
    ["Adria Altimira", "A. Altimira", "Spain", "CB"],
    ["Mostafa Meshaal", "M. Meshaal", "Qatar", "GK"],
    ["Robert Glatzel", "R. Glatzel", "Germany", "ST"],
    ["Leonardo Bonucci", "L. Bonucci", "Italy", "CB"],
    ["Dennis Borkowski", "D. Borkowski", "Germany", "CAM"],
    ["Josip Brekalo", "J. Brekalo", "Croatia", "CM"],
    ["Tommaso Barbieri", "T. Barbieri", "Italy", "CAM"],
    ["Luan Peres", "L. Peres", "Brazil", "CB"],
    ["Michael Ameyaw", "M. Ameyaw", "Poland", "CM"],
    ["Kota Takai", "K. Takai", "Japan", "CM"],
    ["Riccardo Marchizza", "R. Marchizza", "Italy", "LB"],
    ["Fabian Klos", "F. Klos", "Germany", "CAM"],
    ["Bruno Amione", "B. Amione", "Argentina", "CB"],
    ["Ibanez", "Ibanez", "Brazil", "CB"],
    ["Jordan Lukaku", "J. Lukaku", "Belgium", "CB"],
    ["Yimmi Chara", "Y. Chara", "Colombia", "CM"],
    ["Luca Mazzitelli", "L. Mazzitelli", "Italy", "RB"],
    ["Dogan Alemdar", "D. Alemdar", "Turkey", "GK"],
    ["Callum Elder", "C. Elder", "England", "LB"],
    ["Joshua Brenet", "J. Brenet", "Netherlands", "LB"],
    ["Alex Grimaldo", "A. Grimaldo", "Spain", "LB"],
    ["Andreas Poulsen", "A. Poulsen", "Germany", "ST"],
    ["Moussa Sylla", "M. Sylla", "Germany", "ST"],
    ["Lautaro Rivero", "L. Rivero", "Argentina", "CM"],
    ["Francesco Cassata", "F. Cassata", "Italy", "LB"],
    ["Samuel Adegbenro", "S. Adegbenro", "Sweden", "CM"],
    ["Luciano Abecasis", "L. Abecasis", "Argentina", "RB"],
    ["Francisco Trincao", "F. Trincao", "Portugal", "CM"],
    ["Tobe Leysen", "T. Leysen", "Belgium", "GK"],
    ["Marc Pubill", "M. Pubill", "Spain", "RB"],
    ["Joel Ward", "J. Ward", "England", "RB"],
    ["Dujuan Richards", "D. Richards", "Jamaica", "GK"],
    ["Kiko Casilla", "K. Casilla", "Portugal", "GK"],
    ["Leo Jaba", "L. Jaba", "Portugal", "ST"],
    ["Robert Renan", "R. Renan", "Brazil", "CB"],
    ["Lucas Verissimo", "L. Verissimo", "Brazil", "CB"],
    ["Cristian Pavon", "C. Pavon", "Argentina", "CM"],
    ["Federico Peluso", "F. Peluso", "Italy", "LB"],
    ["Pedro Raul", "P. Raul", "Brazil", "ST"],
    ["Milton Valenzuela", "M. Valenzuela", "Argentina", "RB"],
    ["Jake Cooper", "J. Cooper", "England", "CB"],
    ["Fisnik Asllani", "F. Asllani", "Germany", "ST"],
    ["Luca Waldschmidt", "L. Waldschmidt", "Germany", "CAM"],
    ["Jorge de Frutos", "J. de Frutos", "Spain", "CAM"],
    ["Damian Suarez", "D. Suarez", "Uruguay", "CM"],
    ["Gaston Pereiro", "G. Pereiro", "Uruguay", "CM"],
    ["Jordan Carrillo", "J. Carrillo", "Mexico", "CM"],
    ["Jorge", "Jorge", "Brazil", "LB"],
    ["Simone Verdi", "S. Verdi", "Italy", "CM"],
    ["Andre Gray", "A. Gray", "England", "ST"],
    ["Callum O'Hare", "C. O'Hare", "England", "CM"],
    ["Federico Bonazzoli", "F. Bonazzoli", "Italy", "ST"],
    ["Jakob Ahlmann", "J. Ahlmann", "Denmark", "CM"],
    ["Christoph Klarer", "C. Klarer", "Austria", "CM"],
    ["Cristian Arango", "C. Arango", "Colombia", "CM"],
    ["Nicolo Cudrig", "N. Cudrig", "Italy", "ST"],
    ["Lucas Esquivel", "L. Esquivel", "Argentina", "LB"],
    ["Emanuel Vignato", "E. Vignato", "Italy", "CM"],
    ["Jonathan Herrera", "J. Herrera", "Argentina", "ST"],
    ["Emiliano Papa", "E. Papa", "Argentina", "RB"],
    ["Simone Zaza", "S. Zaza", "Italy", "ST"],
    ["Abdulrahman Al-Obood", "A. Al-Obood", "Saudi Arabia", "CM"],
    ["Roberto Inglese", "R. Inglese", "Italy", "CAM"],
    ["Auston Trusty", "A. Trusty", "USA", "GK"],
    ["Josh Onomah", "J. Onomah", "England", "CM"],
    ["Christoph Kramer", "C. Kramer", "Germany", "CDM"],
    ["Kevin Lasagna", "K. Lasagna", "Italy", "ST"],
    ["Ercan Kara", "E. Kara", "Austria", "CM"],
    ["Pablo Vegetti", "P. Vegetti", "Brazil", "ST"],
    ["Luka Vuskovic", "L. Vuskovic", "Croatia", "CB"],
    ["Pote", "Pote", "Portugal", "CM"],
    ["James Hill", "J. Hill", "England", "CB"],
    ["Alberto Cerri", "A. Cerri", "Italy", "ST"],
    ["Andrea Conti", "A. Conti", "Italy", "RB"],
    ["Toni Villa", "T. Villa", "Spain", "CM"],
    ["Alberto Paloschi", "A. Paloschi", "Italy", "ST"],
    ["Andreas Schjelderup", "A. Schjelderup", "Norway", "CM"],
    ["Andre-Frank Zambo Anguissa", "A. Anguissa", "Cameroon", "GK"],
    ["Reece Burke", "R. Burke", "England", "CB"],
    ["Chidozie Awaziem", "C. Awaziem", "Nigeria", "GK"],
    ["Alessandro Sorrentino", "A. Sorrentino", "Italy", "GK"],
    ["Rogerio", "Rogerio", "Brazil", "LB"],
    ["Alfredo Talavera", "A. Talavera", "Mexico", "GK"],
    ["Jesper Hansen", "J. Hansen", "Denmark", "GK"],
    ["Muhammed Sengezer", "M. Sengezer", "Turkey", "GK"],
    ["Rodrigue Casimir Ninga", "R. Ninga", "France", "RB"],
    ["Dennis Praet", "D. Praet", "Belgium", "CDM"],
    ["Adolfo Gaich", "A. Gaich", "Argentina", "LB"],
    ["Diego Valoyes", "D. Valoyes", "Argentina", "ST"],
    ["Layvin Kurzawa", "L. Kurzawa", "France", "LB"],
    ["Yuta Nakayama", "Y. Nakayama", "Japan", "GK"],
    ["Alex Sola", "A. Sola", "Spain", "LW"],
    ["Nat Phillips", "N. Phillips", "England", "CB"],
    ["Facundo Altamirano", "F. Altamirano", "Argentina", "GK"],
    ["Francesco Caputo", "F. Caputo", "Italy", "CM"],
    ["Lorenzo Pirola", "L. Pirola", "Italy", "CB"],
    ["Diego Romero", "D. Romero", "Peru", "GK"],
    ["Tomas Handel", "T. Handel", "Portugal", "RB"],
    ["Mohamed Sobhi", "M. Sobhi", "Egypt", "GK"],
    ["Simone Bastoni", "S. Bastoni", "Italy", "LB"],
    ["Massimo Coda", "M. Coda", "Italy", "ST"],
    ["Andres Gomez", "A. Gomez", "Colombia", "CM"],
    ["Diogo Queiros", "D. Queiros", "Portugal", "CB"],
    ["Martin Aguirregabiria", "M. Aguirregabiria", "Spain", "RB"],
    ["Mark-Anthony Kaye", "M. Kaye", "Canada", "GK"],
    ["Paul Bernardoni", "P. Bernardoni", "France", "GK"],
    ["Elijah Adebayo", "E. Adebayo", "England", "RM"],
    ["Bright Arrey-Mbi", "B. Arrey-Mbi", "Germany", "CB"],
    ["Pedro Pelagio", "P. Pelagio", "Portugal", "CM"],
    ["Marlon", "Marlon", "Brazil", "CB"],
    ["Leonardo Godoy", "L. Godoy", "Argentina", "LB"],
    ["Andreas Linde", "A. Linde", "Sweden", "GK"],
    ["Ivo Grbic", "I. Grbic", "Croatia", "GK"],
    ["Joel Roca", "J. Roca", "Spain", "RB"],
    ["Julian Rijsdijk", "J. Rijsdijk", "Netherlands", "LB"],
    ["Baptiste Reynet", "B. Reynet", "France", "GK"],
    ["Ozziel Herrera", "O. Herrera", "Mexico", "CM"],
    ["Marco Nasti", "M. Nasti", "Italy", "CM"],
    ["Andre Dozzell", "A. Dozzell", "England", "CM"],
    ["Mohammed Al-Attas", "M. Al-Attas", "United Arab Emirates", "GK"],
    ["Antonio Oliveira", "A. Oliveira", "Portugal", "LB"],
    ["Kasim Nuhu", "K. Nuhu", "Ghana", "CM"],
    ["Marco Tumminello", "M. Tumminello", "Italy", "ST"],
    ["Luis Maximiano", "L. Maximiano", "Portugal", "GK"],
    ["Dele Alli", "D. Alli", "England", "CM"],
    ["Luis Rioja", "L. Rioja", "Spain", "ST"],
    ["Jon Ander Olasagasti", "J. Olasagasti", "Spain", "CM"],
    ["Tyreece Campbell", "T. Campbell", "Jamaica", "GK"],
    ["Juan Camilo Portilla", "J. Portilla", "Colombia", "CM"],
    ["Sean Morrison", "S. Morrison", "England", "CB"],
    ["Paik Seung-ho", "P. Seung-ho", "South Korea", "CM"],
    ["Rafael Ramos", "R. Ramos", "Brazil", "RB"],
    ["Erce Kardesler", "E. Kardesler", "Turkey", "GK"],
    ["Raul Garcia", "R. Garcia", "Spain", "LW"],
    ["Alessandro Zanoli", "A. Zanoli", "Italy", "RB"],
    ["Mohammed Maran", "M. Maran", "Saudi Arabia", "CM"],
    ["Viktor Claesson", "V. Claesson", "Sweden", "CM"],
    ["Jon Ander Garrido", "J. Garrido", "Spain", "RB"],
    ["Alfa Semedo", "A. Semedo", "Portugal", "CM"],
    ["Alberto Bueno", "A. Bueno", "Spain", "ST"],
    ["Sota Kawasaki", "S. Kawasaki", "Japan", "CM"],
    ["Jason Denayer", "J. Denayer", "Belgium", "CB"],
    ["Rafa Soares", "R. Soares", "Portugal", "LB"],
    ["Jean-Michael Seri", "J. Seri", "Ivory Coast", "GK"],
    ["Gillian Vandenbergh", "G. Vandenbergh", "Belgium", "GK"],
    ["Mauro Zarate", "M. Zarate", "Argentina", "CDM"],
    ["Jon Russell", "J. Russell", "Jamaica", "GK"],
    ["Denis Huseinbasic", "D. Huseinbasic", "Germany", "CAM"],
    ["Jandrei", "Jandrei", "Brazil", "GK"],
    ["Cody Drameh", "C. Drameh", "England", "LB"],
    ["Scott Wright", "S. Wright", "Scotland", "CM"],
    ["Ronald Koeman", "R. Koeman", "Netherlands", "GK"],
    ["Marco Benassi", "M. Benassi", "Italy", "CDM"],
    ["Jens Stryger Larsen", "J. Larsen", "Denmark", "CB"],
    ["Mario Suarez", "M. Suarez", "Spain", "RW"],
    ["Sontje Hansen", "S. Hansen", "Netherlands", "ST"],
    ["Lorenzo Pellizzari", "L. Pellizzari", "Italy", "LB"],
    ["Elias Cobbaut", "E. Cobbaut", "Belgium", "CB"],
    ["Mariano Andujar", "M. Andujar", "Argentina", "GK"],
    ["Rodri Sanchez", "R. Sanchez", "Spain", "RW"],
    ["Bjorn Maars Johnsen", "B. Johnsen", "Norway", "CM"],
    ["Kim Shin-wook", "K. Shin-wook", "South Korea", "CM"],
    ["Robin Quaison", "R. Quaison", "Sweden", "CM"],
    ["Sondre Brunstad Fet", "S. Fet", "Norway", "CM"],
    ["Pedro Ganchas", "P. Ganchas", "Portugal", "CB"],
    ["Zinho Vanheusden", "Z. Vanheusden", "Belgium", "CB"],
    ["Alexis Gutierrez", "A. Gutierrez", "Mexico", "CM"],
    ["Andy Polo", "A. Polo", "Peru", "GK"],
    ["Hossein Kanaani", "H. Kanaani", "Iran", "GK"],
    ["Santos", "Santos", "Brazil", "GK"],
    ["Eric Martel", "E. Martel", "Germany", "CDM"],
    ["Luciano Gondou", "L. Gondou", "Argentina", "CM"],
    ["Diego Alves", "D. Alves", "Brazil", "GK"],
    ["Chris Willock", "C. Willock", "England", "LM"],
    ["Tadeu", "Tadeu", "Brazil", "GK"],
    ["Tiago Sa", "T. Sa", "Portugal", "GK"],
    ["Fabio Blanco", "F. Blanco", "Spain", "CAM"],
    ["Benjamin Mendy", "B. Mendy", "France", "LB"],
    ["Kaj Sierhuis", "K. Sierhuis", "Netherlands", "ST"],
    ["Nicolo Turk", "N. Turk", "Italy", "GK"],
    ["Christian Fassnacht", "C. Fassnacht", "Switzerland", "CM"],
    ["Ben Hamer", "B. Hamer", "England", "GK"],
    ["Mahmoud Hassan", "M. Hassan", "Egypt", "GK"],
    ["Samuele Mulattieri", "S. Mulattieri", "Italy", "CAM"],
    ["Deian Sorescu", "D. Sorescu", "Romania", "GK"],
    ["Jetro Willems", "J. Willems", "Netherlands", "LB"],
    ["Hugo Cuypers", "H. Cuypers", "Belgium", "CM"],
    ["Noah Weisshaupt", "N. Weisshaupt", "Germany", "CM"],
    ["Marco Curto", "M. Curto", "Italy", "CB"],
    ["Pedro Aguiar", "P. Aguiar", "Portugal", "RB"],
    ["Lee Nicholls", "L. Nicholls", "England", "GK"],
    ["Marcus Bettinelli", "M. Bettinelli", "England", "GK"],
    ["Marcos Lopes", "M. Lopes", "Portugal", "LB"],
    ["Victor Froholdt", "V. Froholdt", "Denmark", "CM"],
    ["Mohamed Ounajem", "M. Ounajem", "Morocco", "CM"],
    ["Christian Benteke", "C. Benteke", "Belgium", "CM"],
    ["Leo Skiri Ostigard", "L. Ostigard", "Norway", "GK"],
    ["Kacper Kozlowski", "K. Kozlowski", "Poland", "CM"],
    ["Jony Rodriguez", "J. Rodriguez", "Spain", "LW"],
    ["Enzo Copetti", "E. Copetti", "Argentina", "ST"],
    ["David von Ballmoos", "D. von Ballmoos", "Switzerland", "GK"],
    ["Isak Pettersson", "I. Pettersson", "Sweden", "GK"],
    ["Marcos Antonio", "M. Antonio", "Brazil", "CM"],
    ["Benoit Costil", "B. Costil", "France", "GK"],
    ["Andre Gomes", "A. Gomes", "Portugal", "CM"],
    ["Antwoine Hackford", "A. Hackford", "England", "LM"],
    ["Gabriele Corbo", "G. Corbo", "Italy", "CB"],
    ["Simon Terodde", "S. Terodde", "Germany", "ST"],
    ["Karlan Grant", "K. Grant", "England", "LM"],
    ["Alex Smithies", "A. Smithies", "England", "GK"],
    ["Abdul Manaf Nurudeen", "A. Nurudeen", "Ghana", "GK"],
    ["Jacob Brown", "J. Brown", "Scotland", "CM"],
    ["Toni Silic", "T. Silic", "Croatia", "GK"],
    ["Kwon Chang-hoon", "K. Chang-hoon", "South Korea", "CM"],
    ["Rafal Gikiewicz", "R. Gikiewicz", "Poland", "GK"],
    ["Tomas Conechny", "T. Conechny", "Argentina", "CM"],
    ["Iker Losada", "I. Losada", "Spain", "CDM"],
    ["Flavius Daniliuc", "F. Daniliuc", "Austria", "GK"],
    ["Tiago Dantas", "T. Dantas", "Portugal", "CM"],
    ["Fehmi Mert Gunok", "F. Gunok", "Turkey", "GK"],
    ["Sebastian Larsson", "S. Larsson", "Sweden", "CM"],
    ["Anthony Racioppi", "A. Racioppi", "Switzerland", "GK"],
    ["Antony Silva", "A. Silva", "Paraguay", "GK"],
    ["Alex Balde", "A. Balde", "Spain", "LB"],
    ["Joao Ferreira", "J. Ferreira", "Portugal", "RB"],
    ["Nathan", "Nathan", "Brazil", "RB"],
    ["Alex Padilla", "A. Padilla", "Spain", "GK"],
    ["Thierno Ballo", "T. Ballo", "Austria", "CM"],
    ["Tiago Araujo", "T. Araujo", "Portugal", "LB"],
    ["Lee Seung-woo", "L. Seung-woo", "South Korea", "CM"],
    ["Marcus Berg", "M. Berg", "Sweden", "CM"],
    ["Mathias Villasanti", "M. Villasanti", "Paraguay", "GK"],
    ["Warner Hahn", "W. Hahn", "Netherlands", "GK"],
    ["Mads Kikkenborg", "M. Kikkenborg", "Denmark", "GK"],
    ["Bryan Linssen", "B. Linssen", "Netherlands", "ST"],
    ["Steven Defour", "S. Defour", "Belgium", "CDM"],
    ["Kwadwo Baah", "K. Baah", "Ghana", "CM"],
    ["Ze Carlos", "Z. Carlos", "Portugal", "CB"],
    ["Jacob Rasmussen", "J. Rasmussen", "Denmark", "CB"],
    ["Elias Gomez", "E. Gomez", "Argentina", "LB"],
    ["Nils Petersen", "N. Petersen", "Germany", "CAM"],
    ["Kevin", "Kevin", "Brazil", "RB"],
    ["Rui Costa", "R. Costa", "Portugal", "CM"],
    ["Felipe", "Felipe", "Brazil", "CB"],
    ["Nam Tae-hee", "N. Tae-hee", "South Korea", "CM"],
    ["Alexandre Oukidja", "A. Oukidja", "Algeria", "GK"],
    ["Javi Lopez", "J. Lopez", "Spain", "LB"],
    ["Iddrisu Baba", "I. Baba", "Ghana", "CM"],
    ["Ahmed El Shenawy", "A. El Shenawy", "Egypt", "GK"],
    ["Goncalo Paciencia", "G. Paciencia", "Portugal", "ST"],
    ["Bafetimbi Gomis", "B. Gomis", "France", "CAM"],
    ["Krystian Bielik", "K. Bielik", "Poland", "CM"],
    ["Alessandro Plizzari", "A. Plizzari", "Italy", "RB"],
    ["Lukas Nmecha", "L. Nmecha", "Germany", "ST"],
    ["Joe Bryan", "J. Bryan", "England", "LB"],
    ["Manolo Gabbiadini", "M. Gabbiadini", "Italy", "ST"],
    ["Ahmed Jamil", "A. Jamil", "United Arab Emirates", "GK"],
    ["Sam Field", "S. Field", "England", "CDM"],
    ["Salah Zakaria", "S. Zakaria", "Qatar", "GK"],
    ["Ki Sung-yueng", "K. Sung-yueng", "South Korea", "CM"],
    ["Sebastian Polter", "S. Polter", "Germany", "CAM"],
    ["Leandro Chichizola", "L. Chichizola", "Argentina", "GK"],
    ["Andros Townsend", "A. Townsend", "England", "LM"],
    ["Fer Nino", "F. Nino", "Spain", "ST"],
    ["Arthur Zagre", "A. Zagre", "France", "RB"],
    ["Anis Mehmeti", "A. Mehmeti", "England", "LM"],
    ["Mateo Pellegrino", "M. Pellegrino", "Argentina", "CM"],
    ["Matthieu Dreyer", "M. Dreyer", "France", "GK"],
    ["Josh Doig", "J. Doig", "Scotland", "CM"],
    ["Youssef Belammari", "Y. Belammari", "Morocco", "GK"],
    ["Marco Pasalic", "M. Pasalic", "Croatia", "CM"],
    ["Filip Marchwinski", "F. Marchwinski", "Poland", "CM"],
    ["Bruno Fuchs", "B. Fuchs", "Brazil", "CB"],
    ["Alvaro Vazquez", "A. Vazquez", "Spain", "RW"],
    ["Alejandro Cantero", "A. Cantero", "Spain", "CAM"],
    ["Alex Mowatt", "A. Mowatt", "England", "CM"],
    ["Jacob Rinne", "J. Rinne", "Sweden", "GK"],
    ["Pau Prim", "P. Prim", "Spain", "CDM"],
    ["Thomas Buitink", "T. Buitink", "Netherlands", "ST"],
    ["Kaiky", "Kaiky", "Brazil", "CB"],
    ["Loreintz Rosier", "L. Rosier", "Netherlands", "ST"],
    ["Sergio Padt", "S. Padt", "Netherlands", "GK"],
    ["Franco Carboni", "F. Carboni", "Argentina", "LB"],
    ["Abdessamad Ezzalzouli", "A. Ezzalzouli", "Morocco", "GK"],
    ["Fabio Depaoli", "F. Depaoli", "Italy", "LB"],
    ["Kevin Gameiro", "K. Gameiro", "France", "ST"],
    ["Gianluca Frabotta", "G. Frabotta", "Italy", "RB"],
    ["Gabri Veiga", "G. Veiga", "Spain", "CAM"],
    ["Daniel Svensson", "D. Svensson", "Sweden", "GK"],
    ["Andrew", "Andrew", "Portugal", "GK"],
    ["Ron-Robert Zieler", "R. Zieler", "Germany", "GK"],
    ["Mees de Wit", "M. de Wit", "Netherlands", "ST"],
    ["Joao Mario", "J. Mario", "Portugal", "LB"],
    ["Daniel Parejo", "D. Parejo", "Spain", "CM"],
    ["Lewis Grabban", "L. Grabban", "England", "ST"],
    ["Ki-Jana Hoever", "K. Hoever", "Netherlands", "LB"],
    ["Dedryck Boyata", "D. Boyata", "Belgium", "CB"],
    ["Jose Luis Gaya", "J. Gaya", "Spain", "ST"],
    ["Emil Hansson", "E. Hansson", "Netherlands", "ST"],
    ["Danylo Sikan", "D. Sikan", "Ukraine", "GK"],
    ["Max Johnston", "M. Johnston", "Scotland", "CM"],
    ["Lucas Orban", "L. Orban", "Argentina", "LB"],
    ["Bruno Gaspar", "B. Gaspar", "Portugal", "CB"],
    ["Rafael", "Rafael", "Brazil", "GK"],
    ["Souleymane Faye", "S. Faye", "Senegal", "CM"],
    ["Luan Pereira", "L. Pereira", "United Arab Emirates", "GK"],
    ["Bartol Franjic", "B. Franjic", "Croatia", "CB"],
    ["Leander Dendoncker", "L. Dendoncker", "Belgium", "CDM"],
    ["Giovanni Fabbian", "G. Fabbian", "Italy", "CM"],
    ["Moussa Wague", "M. Wague", "Senegal", "CM"],
    ["Marco Davide Faraoni", "M. Faraoni", "Italy", "RB"],
    ["Amin Younes", "A. Younes", "Germany", "CM"],
    ["Jon Guridi", "J. Guridi", "Spain", "CDM"],
    ["Pablo Marin", "P. Marin", "Spain", "CDM"],
    ["Pablo Paez Gavira", "P. Gavira", "Spain", "CDM"],
    ["Ewoud Pletinckx", "E. Pletinckx", "Belgium", "CB"],
    ["Raul Gudino", "R. Gudino", "Mexico", "GK"],
    ["Tim Oermann", "T. Oermann", "Germany", "CB"],
    ["Marcus Holmgren Pedersen", "M. Pedersen", "Norway", "GK"],
    ["Romain Faivre", "R. Faivre", "France", "CM"],
    ["Chris Rigg", "C. Rigg", "England", "LM"],
    ["Andre", "Andre", "Brazil", "CDM"],
    ["Pedro Henrique", "P. Henrique", "Brazil", "RB"],
    ["Mamadou Samassa", "M. Samassa", "France", "GK"],
    ["Hayden Hackney", "H. Hackney", "England", "CDM"],
    ["Yannick Cahuzac", "Y. Cahuzac", "France", "RB"],
    ["Giuseppe Sibilli", "G. Sibilli", "Italy", "LB"],
    ["Gaston Guruceaga", "G. Guruceaga", "Argentina", "GK"],
    ["Rodrigo Ribeiro", "R. Ribeiro", "Portugal", "CB"],
    ["Marko Rog", "M. Rog", "Croatia", "CB"],
    ["Gonzalo Villar", "G. Villar", "Spain", "CM"],
    ["Abdullah Ramadan", "A. Ramadan", "United Arab Emirates", "GK"],
    ["Shunsuke Mito", "S. Mito", "Japan", "CM"],
    ["Tariqe Fosu", "T. Fosu", "Ghana", "CM"],
    ["Luan Candido", "L. Candido", "Brazil", "LB"],
    ["Troy Deeney", "T. Deeney", "England", "ST"],
    ["Frederik Jakel", "F. Jakel", "Germany", "RB"],
    ["Bjorn Engels", "B. Engels", "Belgium", "CB"],
    ["Abdoulaye Seck", "A. Seck", "Senegal", "GK"],
    ["Rune Jarstein", "R. Jarstein", "Norway", "GK"],
    ["Ortwin De Wolf", "O. De Wolf", "Belgium", "GK"],
    ["Ibrahima Niane", "I. Niane", "Senegal", "CM"],
    ["Ricardo Alves", "R. Alves", "Portugal", "CB"],
    ["Elayis Tavsan", "E. Tavsan", "Netherlands", "ST"],
    ["Luke Cundle", "L. Cundle", "England", "CDM"],
    ["Zian Flemming", "Z. Flemming", "Netherlands", "ST"],
    ["Rodrigo Caio", "R. Caio", "Brazil", "CB"],
    ["Ethan Laird", "E. Laird", "England", "RB"],
    ["Roque Mesa", "R. Mesa", "Spain", "ST"],
    ["Ivan Nevistic", "I. Nevistic", "Croatia", "GK"],
    ["Tim Lemperle", "T. Lemperle", "Germany", "ST"],
    ["Mads Christiansen", "M. Christiansen", "Norway", "GK"],
    ["David Nemeth", "D. Nemeth", "Austria", "GK"],
    ["Anwar El Ghazi", "A. El Ghazi", "Netherlands", "CM"],
    ["Karl-Johan Johnsson", "K. Johnsson", "Sweden", "GK"],
    ["Hugo Mallo", "H. Mallo", "Spain", "RB"],
    ["Farid Boulaya", "F. Boulaya", "Algeria", "GK"],
    ["Tomas Palacios", "T. Palacios", "Argentina", "CB"],
    ["Toma Basic", "T. Basic", "Croatia", "CB"],
    ["Jeremy Toljan", "J. Toljan", "Germany", "RB"],
    ["Sadiq Umar", "S. Umar", "Nigeria", "CM"],
    ["Emil Hojlund", "E. Hojlund", "Denmark", "CM"],
    ["Jacob Karlstrom", "J. Karlstrom", "Norway", "GK"],
    ["Lorenzo Venuti", "L. Venuti", "Italy", "LB"],
    ["Willian", "Willian", "Brazil", "CM"]
  ], REAL_PLAYERS_WAVE7 = [
    ["Alfredo Aguilar", "A. Aguilar", "Paraguay", "GK"],
    ["Wei Zhen", "W. Zhen", "China", "CB"],
    ["Xie Wenneng", "X. Wenneng", "China", "CM"],
    ["Juan Escobar", "J. Escobar", "Paraguay", "CB"],
    ["Adam Szalai", "A. Szalai", "Hungary", "ST"],
    ["Parthib Gogoi", "P. Gogoi", "India", "ST"],
    ["Alexandru Cicaldau", "A. Cicaldau", "Romania", "CM"],
    ["Tan Long", "T. Long", "China", "RW"],
    ["Ai Kesen", "A. Kesen", "China", "ST"],
    ["Jeakson Singh", "J. Singh", "India", "CDM"],
    ["Wang Haijian", "W. Haijian", "China", "CM"],
    ["Hernesto Caballero", "H. Caballero", "Paraguay", "CM"],
    ["Liu Binbin", "L. Binbin", "China", "RW"],
    ["Oscar Romero", "O. Romero", "Paraguay", "ST"],
    ["Mohammed Dawood", "M. Dawood", "Iraq", "ST"],
    ["Alejandro Romero Gamarra", "A. Gamarra", "Paraguay", "ST"],
    ["Ishan Pandita", "I. Pandita", "India", "ST"],
    ["Pritam Kotal", "P. Kotal", "India", "CB"],
    ["Jose Carvallo", "J. Carvallo", "Peru", "GK"],
    ["Alan Browne", "A. Browne", "Ireland", "CM"],
    ["Hussein Hasan", "H. Hasan", "Iraq", "GK"],
    ["Attila Mocsi", "A. Mocsi", "Hungary", "CB"],
    ["Asish Rai", "A. Rai", "India", "RB"],
    ["Jeff Hendrick", "J. Hendrick", "Ireland", "CM"],
    ["Sivasakthi Narayanan", "S. Narayanan", "India", "ST"],
    ["Bruno Valdez", "B. Valdez", "Paraguay", "CB"],
    ["Marcelo Perez", "M. Perez", "Paraguay", "CM"],
    ["Jose Rivera", "J. Rivera", "Peru", "ST"],
    ["Mihai Roman", "M. Roman", "Romania", "CM"],
    ["Jesus Castillo", "J. Castillo", "Peru", "CM"],
    ["Yang Zexiang", "Y. Zexiang", "China", "LB"],
    ["Rowllin Borges", "R. Borges", "India", "CDM"],
    ["Daniel Paraschiv", "D. Paraschiv", "Romania", "ST"],
    ["Sam Curtis", "S. Curtis", "Ireland", "CB"],
    ["Catalin Cabuz", "C. Cabuz", "Romania", "GK"],
    ["Fernandinho Silva", "F. Silva", "China", "CAM"],
    ["Andrei Ivan", "A. Ivan", "Romania", "ST"],
    ["Deng Hanwen", "D. Hanwen", "China", "RB"],
    ["Nikhil Poojary", "N. Poojary", "India", "RB"],
    ["Zsolt Kalmar", "Z. Kalmar", "Hungary", "ST"],
    ["Prabhsukhan Singh Gill", "P. Gill", "India", "GK"],
    ["Mehtab Singh", "M. Singh", "India", "CB"],
    ["Krisztian Nemeth", "K. Nemeth", "Hungary", "ST"],
    ["Naorem Mahesh Singh", "N. Singh", "India", "CAM"],
    ["Chinglensana Singh", "C. Singh", "India", "CB"],
    ["Dominik Takac", "D. Takac", "Slovakia", "GK"],
    ["Glan Martins", "G. Martins", "India", "CDM"],
    ["Martin Tavara", "M. Tavara", "Peru", "CM"],
    ["Lalengmawia", "Lalengmawia", "India", "CM"],
    ["Brian Maher", "B. Maher", "Ireland", "GK"],
    ["Alaa Abbas", "A. Abbas", "Iraq", "ST"],
    ["Aaron Connolly", "A. Connolly", "Ireland", "ST"],
    ["Tudor Baluta", "T. Baluta", "Romania", "CM"],
    ["Adam Bogdan", "A. Bogdan", "Hungary", "GK"],
    ["Nandhakumar Sekar", "N. Sekar", "India", "RW"],
    ["Conor Hourihane", "C. Hourihane", "Ireland", "CM"],
    ["Gao Zhunyi", "G. Zhunyi", "China", "RB"],
    ["Adrian Rus", "A. Rus", "Romania", "CB"],
    ["Apuia", "Apuia", "India", "CDM"],
    ["Li Ke", "L. Ke", "China", "CDM"],
    ["Kevin Yakob", "K. Yakob", "Iraq", "CM"],
    ["Cesar Ramirez", "C. Ramirez", "Paraguay", "CM"],
    ["Horacio Calcaterra", "H. Calcaterra", "Peru", "CM"],
    ["Udanta Singh", "U. Singh", "India", "RW"],
    ["Jay Gupta", "J. Gupta", "India", "LB"],
    ["Vishal Kaith", "V. Kaith", "India", "GK"],
    ["Peter Szappanos", "P. Szappanos", "Hungary", "GK"],
    ["Max O'Leary", "M. O'Leary", "Ireland", "GK"],
    ["Safaa Hadi", "S. Hadi", "Iraq", "CM"],
    ["Han Pengfei", "H. Pengfei", "China", "CB"],
    ["Anderson Santamaria", "A. Santamaria", "Peru", "CB"],
    ["Fang Hao", "F. Hao", "China", "ST"],
    ["Balint Vecsei", "B. Vecsei", "Hungary", "CM"],
    ["Aldo Corzo", "A. Corzo", "Peru", "CB"],
    ["Angel Cayetano", "A. Cayetano", "Peru", "GK"],
    ["Saad Natiq", "S. Natiq", "Iraq", "CB"],
    ["Louis Munteanu", "L. Munteanu", "Romania", "ST"],
    ["Wu Xi", "W. Xi", "China", "CDM"],
    ["Li Lei", "L. Lei", "China", "LB"],
    ["Virgil Ghita", "V. Ghita", "Romania", "CB"],
    ["Ashique Kuruniyan", "A. Kuruniyan", "India", "LW"],
    ["Alin Tosca", "A. Tosca", "Romania", "CB"],
    ["Vikram Partap Singh", "V. Singh", "India", "CAM"],
    ["Adam Lang", "A. Lang", "Hungary", "CB"],
    ["Jonathan Afolabi", "J. Afolabi", "Ireland", "ST"]
  ], NATION_COLORS = {
    Albania: ["#e41e20", "#000000"],
    Algeria: ["#006233", "#ffffff"],
    Angola: ["#ce1126", "#000000"],
    Argentina: ["#75aadb", "#ffffff"],
    Armenia: ["#d90012", "#0033a0"],
    Australia: ["#00843d", "#ffcd00"],
    Austria: ["#ed2939", "#ffffff"],
    Belgium: ["#fdda24", "#000000"],
    Bolivia: ["#d52b1e", "#007934"],
    "Bosnia and Herzegovina": ["#002395", "#fecb00"],
    Brazil: ["#009c3b", "#ffdf00"],
    "Burkina Faso": ["#ef2b2d", "#009e49"],
    Cameroon: ["#007a5e", "#ce1126"],
    Canada: ["#d80621", "#ffffff"],
    "Cape Verde": ["#003893", "#cf2027"],
    "Central African Republic": ["#003082", "#ffce00"],
    Chile: ["#d52b1e", "#0039a6"],
    China: ["#de2910", "#ffde00"],
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
    India: ["#ff9933", "#138808"],
    Iran: ["#239f40", "#da0000"],
    Iraq: ["#ce1126", "#007a3d"],
    Ireland: ["#169b62", "#ff883e"],
    Israel: ["#0038b8", "#ffffff"],
    Italy: ["#008c45", "#0064aa"],
    "Ivory Coast": ["#f77f00", "#009e60"],
    Jamaica: ["#009b3a", "#fed100"],
    Japan: ["#bc002d", "#ffffff"],
    Jordan: ["#007a3d", "#ce1126"],
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
    Wales: ["#00ab39", "#c8102e"],
    Zambia: ["#198a00", "#ef7d00"]
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
  ], SBC_LEGENDS_2 = [
    ["Francesco Totti", "F. Totti", "Italy", "CAM", 92, 30],
    ["Ronaldo Nazário", "Ronaldo", "Brazil", "ST", 94, 25],
    ["Fabio Cannavaro", "F. Cannavaro", "Italy", "CB", 91, 32],
    ["Xavi", "Xavi", "Spain", "CM", 91, 30],
    ["Edwin van der Sar", "E. v. d. Sar", "Netherlands", "GK", 90, 34],
    ["Kaká", "Kaká", "Brazil", "CAM", 90, 25],
    ["Lilian Thuram", "L. Thuram", "France", "RB", 89, 30],
    ["Javier Zanetti", "J. Zanetti", "Argentina", "LB", 89, 32],
    ["Alessandro Nesta", "A. Nesta", "Italy", "CB", 89, 28],
    ["Patrick Vieira", "P. Vieira", "France", "CDM", 89, 28],
    ["Samuel Eto'o", "S. Eto'o", "Cameroon", "ST", 89, 27],
    ["Rivaldo", "Rivaldo", "Brazil", "LW", 89, 28],
    ["Michael Ballack", "M. Ballack", "Germany", "CM", 88, 29],
    ["Fernando Torres", "F. Torres", "Spain", "ST", 88, 25],
    ["David Villa", "D. Villa", "Spain", "ST", 88, 28],
    ["Ruud van Nistelrooy", "R. v. Nistelrooy", "Netherlands", "ST", 88, 28]
  ], CORE = CLUB_BLUEPRINTS.filter((bp) => !bp.league);
  function buildWorld() {
    var _a, _b, _c;
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
        division: bp.division || LEAGUES.indexOf(bp.league) + 1,
        founded: bp.founded,
        ground: bp.ground,
        roster: [],
        // dealt (Meridian) or generated (wave 3) at the end of buildWorld
        budget: Math.round((14 - bp.tier) * (bp.wave === 5 ? [0, 5e6, 35e5, 2e6, 15e5, 9e5, 7e5, 5e5, 4e5][bp.division] : bp.wave === 4 ? 9e5 : bp.wave === 3 ? 2e6 : 5e6) + (bp.wave === 4 || bp.wave === 5 ? 12e5 : bp.wave === 3 ? 25e5 : 6e6))
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
    let newClubs = clubs.filter((c) => {
      var _a2;
      return c.league === "Meridian League" && !((_a2 = CLUB_BLUEPRINTS.find((bp) => bp.name === c.name)) != null && _a2.wave);
    });
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
    let w5 = makeRand(WORLD_SEED ^ 5921394), w5Players = [], DIV_BASE = [0, 82, 79, 75, 71, 68, 65, 63, 61];
    for (let club of clubs) {
      if (((_c = CLUB_BLUEPRINTS.find((bp) => bp.name === club.name)) == null ? void 0 : _c.wave) !== 5) continue;
      let base = DIV_BASE[club.division] - (club.tier - 1) * 0.35;
      W3_SHAPE.forEach((pos, slot) => {
        let depth = slot % 3 === 2 ? 4 : slot % 3 === 1 ? 2 : 0, p = makePlayer(w5, pos, base - depth, club.id);
        players.push(p), w5Players.push(p), club.roster.push(p.id);
      });
      let star = makePlayer(w5, w5.pick(["ST", "CAM", "LW", "RW", "CM"]), clamp(base + 6, 60, 88), club.id);
      players.push(star), w5Players.push(star), club.roster.push(star.id);
    }
    for (let i = 0; i < 1400; i++) {
      let p = makePlayer(w5, w5.pick(W3_POOL), w5.around(71, 10), null);
      players.push(p), w5Players.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(w5Players, REAL_PLAYERS_WAVE5);
    let w6 = makeRand(WORLD_SEED ^ 7105651), w6Players = [];
    for (let i = 0; i < 700; i++) {
      let p = makePlayer(w6, w6.pick(W3_POOL), w6.around(70, 10), null);
      players.push(p), w6Players.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(w6Players, REAL_PLAYERS_WAVE6);
    let w7 = makeRand(WORLD_SEED ^ 8224117), w7Players = [];
    for (let i = 0; i < REAL_PLAYERS_WAVE7.length; i++) {
      let p = makePlayer(w7, REAL_PLAYERS_WAVE7[i][3], w7.around(64, 7), null);
      players.push(p), w7Players.push(p), freeAgents.push(p.id);
    }
    nameTheWorld(w7Players, REAL_PLAYERS_WAVE7);
    let sbc2 = makeRand(WORLD_SEED ^ 23494);
    for (let [name2, short, nation, pos, overall, age] of SBC_LEGENDS_2) {
      let p = makePlayer(sbc2, pos, overall, null);
      p.name = name2, p.short = short, p.nation = nation, p.age = age, p.nationColors = NATION_COLORS[nation] || p.nationColors, p.overall = overall;
      for (let k of Object.keys(p.stats)) p.stats[k] = clamp(Math.round(p.stats[k] + (overall - 80) * 0.6), 40, 99);
      p.rarity = "special", p.sbc = !0, p.value = marketValue(overall, age), players.push(p), sbcCards.push(p.id);
    }
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
  var WORLD = buildWorld(), variantResolver = null;
  function setVariantResolver(fn) {
    variantResolver = fn;
  }
  var getPlayer = (id) => WORLD.playersById[id] || (variantResolver && id ? variantResolver(id) : void 0), getClub = (id) => id ? WORLD.clubsById[id] : null;
  var rosterOf = (clubId) => WORLD.clubsById[clubId].roster.map(getPlayer);

  // js/data/promos.js
  var WEEK = 6048e5, weekNow = (now = Date.now()) => Math.floor(now / WEEK), DESERT = ["Saudi Arabia", "Qatar", "United Arab Emirates", "Iraq", "Egypt", "Morocco", "Algeria", "Tunisia", "Jordan", "Oman", "Kuwait", "Bahrain", "Libya"], CAMPAIGNS = [
    {
      id: "future",
      name: "Future Stars",
      blurb: "The best of the next generation, quicker and trickier.",
      colors: ["#19e3ff", "#6a1bff"],
      eligible: (p) => p.age <= 21 && p.overall >= 70 && p.position !== "GK",
      boost: 6,
      stats: { pace: 6, dribbling: 6, shooting: 4, passing: 3, physical: 2, defending: 2 }
    },
    {
      id: "desert",
      name: "Heroes of the Desert",
      blurb: "The Gulf and North Africa's finest, boosted hard.",
      colors: ["#f0b048", "#6b2b0e"],
      eligible: (p) => DESERT.includes(p.nation) && p.overall >= 66,
      boost: 8,
      stats: { pace: 5, dribbling: 5, shooting: 6, passing: 5, physical: 6, defending: 5 }
    },
    {
      id: "winter",
      name: "Winter Legends",
      blurb: "The old heads: stronger, wiser, harder to beat.",
      colors: ["#d8f1ff", "#1f3f66"],
      eligible: (p) => p.age >= 30 && p.overall >= 76,
      boost: 5,
      stats: { pace: 1, dribbling: 3, shooting: 4, passing: 6, physical: 6, defending: 6 }
    }
  ], campaignNow = (now = Date.now()) => CAMPAIGNS[weekNow(now) % CAMPAIGNS.length];
  var ICON_TIERS = [
    { id: "early", name: "Early", drop: 7 },
    { id: "peak", name: "Peak", drop: 4 },
    { id: "prime", name: "Prime", drop: 0 }
  ], PROMO_RARITY = {
    inform: { label: "In-Form", color: "#7cff6b", glow: "rgba(124,255,107,.6)" },
    totw: { label: "Team of the Week", color: "#ffe066", glow: "rgba(255,224,102,.7)" },
    future: { label: "Future Stars", color: "#19e3ff", glow: "rgba(25,227,255,.7)" },
    desert: { label: "Heroes of the Desert", color: "#f0b048", glow: "rgba(240,176,72,.7)" },
    winter: { label: "Winter Legends", color: "#d8f1ff", glow: "rgba(216,241,255,.7)" }
  };
  Object.assign(RARITY, PROMO_RARITY);
  var cap = (v) => Math.max(1, Math.min(99, Math.round(v)));
  function derive(base, id, { boost = 0, stats = {}, rarity, promo = null, label = null, tier = null }) {
    var _a;
    let st = {};
    for (let [k, v] of Object.entries(base.stats)) st[k] = cap(v + ((_a = stats[k]) != null ? _a : boost * 0.8));
    return {
      ...base,
      id,
      baseId: base.id,
      overall: cap(base.overall + boost),
      stats: st,
      rarity,
      promo,
      promoLabel: label,
      iconTier: tier,
      value: Math.round((base.value || 1e6) * (1 + Math.max(0, boost) * 0.18)),
      sbc: !1
    };
  }
  function mulberry(a) {
    return () => {
      a |= 0, a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var weekCache = /* @__PURE__ */ new Map();
  function weekPerformers(week = weekNow()) {
    if (weekCache.has(week)) return weekCache.get(week);
    let r = mulberry(week * 7919 + 17), clubs = WORLD.clubs.slice();
    for (let i = clubs.length - 1; i > 0; i--) {
      let j = Math.floor(r() * (i + 1));
      [clubs[i], clubs[j]] = [clubs[j], clubs[i]];
    }
    let scores = [];
    for (let i = 0; i + 1 < clubs.length; i += 2) {
      let [a, b] = [clubs[i], clubs[i + 1]], squad = (c) => c.roster.map((id) => WORLD.playersById[id]).filter(Boolean).sort((x, y) => y.overall - x.overall).slice(0, 11), sa = squad(a), sb = squad(b), str = (s) => s.reduce((t, p) => t + p.overall, 0) / Math.max(1, s.length), goals = (s, o) => Math.max(0, Math.round((str(s) - str(o)) / 6 + r() * 3.2 - 0.6)), ga = goals(sa, sb), gb = goals(sb, sa);
      for (let [s, gf, gc] of [[sa, ga, gb], [sb, gb, ga]]) {
        let rate = new Map(s.map((p) => [p, 5.8 + (p.overall - 70) / 25 + r() * 1.3])), pick = (w) => {
          let tot = s.reduce((t, p) => t + w(p), 0), x = r() * tot;
          for (let p of s)
            if (x -= w(p), x <= 0) return p;
          return s[0];
        };
        for (let g = 0; g < gf; g++) {
          let sc = pick((p) => (["ST", "LW", "RW", "CAM"].includes(p.position) ? 3 : p.position === "GK" ? 0 : 1) * p.stats.shooting);
          rate.set(sc, rate.get(sc) + 1);
          let as = pick((p) => (p === sc || p.position === "GK" ? 0 : 1) * p.stats.passing);
          rate.set(as, rate.get(as) + 0.5);
        }
        if (gc === 0) for (let p of s) ["GK", "CB", "LB", "RB", "CDM"].includes(p.position) && rate.set(p, rate.get(p) + 0.8);
        if (gf > gc) for (let p of s) rate.set(p, rate.get(p) + 0.3);
        for (let [p, v] of rate) scores.push({ p, rating: Math.min(10, v) });
      }
    }
    scores.sort((x, y) => y.rating - x.rating);
    let need = { GK: 1, DEF: 4, MID: 3, FWD: 3 }, line = (p) => p.position === "GK" ? "GK" : ["CB", "LB", "RB"].includes(p.position) ? "DEF" : ["CDM", "CM", "CAM", "LM", "RM"].includes(p.position) ? "MID" : "FWD", totw = [], inform = [];
    for (let sc of scores) {
      if (sc.p.rarity === "icon" || sc.p.rarity === "star" || sc.p.sbc) continue;
      let l = line(sc.p);
      if (need[l] > 0 ? (need[l] -= 1, totw.push(sc)) : inform.length < 24 && inform.push(sc), inform.length >= 24 && Object.values(need).every((n) => n <= 0)) break;
    }
    let res = { week, totw, inform };
    return weekCache.set(week, res), weekCache.size > 16 && weekCache.delete(weekCache.keys().next().value), res;
  }
  function resolve(id) {
    let [kind, a, baseId] = String(id).split(":"), base = baseId && WORLD.playersById[baseId];
    if (!base) return;
    let card;
    if (kind === "pr") {
      let c = CAMPAIGNS.find((x) => x.id === a);
      if (!c || !c.eligible(base)) return;
      card = derive(base, id, { boost: c.boost, stats: c.stats, rarity: c.id, promo: c.id, label: c.name });
    } else if (kind === "if" || kind === "tw") {
      let week = Number(a);
      if (!Number.isFinite(week)) return;
      card = derive(base, id, { boost: kind === "tw" ? 4 : 2, rarity: kind === "tw" ? "totw" : "inform", promo: kind, label: kind === "tw" ? "Team of the Week ".concat(week % 52 + 1) : "In-Form · week ".concat(week % 52 + 1) });
    } else if (kind === "ic") {
      let t = ICON_TIERS.find((x) => x.id === a);
      if (!t || base.rarity !== "icon") return;
      card = derive(base, id, { boost: -t.drop, rarity: "icon", label: "".concat(t.name, " Icon"), tier: t.id });
    } else return;
    return WORLD.playersById[id] = card, card;
  }
  setVariantResolver(resolve);
  function campaignCards(c = campaignNow()) {
    return WORLD.players.filter((p) => !p.sbc && p.rarity !== "icon" && p.rarity !== "star" && c.eligible(p)).map((p) => resolve("pr:".concat(c.id, ":").concat(p.id))).filter(Boolean);
  }
  function weekCards(kind = "inform", week = weekNow()) {
    let w = weekPerformers(week);
    return (kind === "totw" ? w.totw : w.inform).map((x) => resolve("".concat(kind === "totw" ? "tw" : "if", ":").concat(week, ":").concat(x.p.id))).filter(Boolean);
  }
  function iconTierCards(tier) {
    return tier === "prime" ? (WORLD.icons || []).map((id) => WORLD.playersById[id]).filter(Boolean) : (WORLD.icons || []).map((id) => resolve("ic:".concat(tier, ":").concat(id))).filter(Boolean);
  }

  // js/data/objectives.js
  var L = (id, metric, text, need, apex, pack, extra = {}) => ({ id, metric, text, need, apex, pack, ...extra }), LADDER = [
    /* Array order is the order the ladder is climbed. Ids are only save keys, so
       the l25-l32 rungs added later sit where they belong on the difficulty
       curve rather than at the end — an id out of sequence here is deliberate,
       and renumbering the originals would strand every save that has claimed
       them. */
    // ---- getting started: small asks, small change -------------------------
    L("l01", "played", "Play 2 Apex Division matches", 2, 800, "silver"),
    L("l02", "win", "Win an Apex Division match", 1, 1e3, "silver"),
    L("l03", "goal", "Score 5 goals in the division", 5, 1200, "silver"),
    L("l25", "played", "Play 5 Apex Division matches", 5, 1300, "keeper"),
    L("l04", "clean", "Keep a clean sheet", 1, 1400, "gold"),
    L("l05", "win", "Win 3 Apex Division matches", 3, 1800, "gold"),
    L("l06", "goal", "Score 10 goals in the division", 10, 2200, "gold"),
    L("l26", "clean", "Keep 2 clean sheets", 2, 2500, "dip"),
    // ---- finding your level ------------------------------------------------
    L("l07", "streak", "Win 3 in a row", 3, 2800, "gold"),
    L("l08", "clean", "Keep 3 clean sheets", 3, 3400, "gold"),
    L("l09", "bigwin", "Win a match by 3 goals or more", 1, 4e3, "gold"),
    L("l27", "played", "Play 15 Apex Division matches", 15, 4400, "builder"),
    L("l10", "rank", "Reach Division 7", 1, 4800, "prime", { rank: 3 }),
    L("l11", "win", "Win 8 Apex Division matches", 8, 5600, "prime"),
    L("l12", "control", "Win with 60% of the ball", 1, 6500, "prime"),
    L("l28", "bigwin", "Win 2 matches by 3 goals or more", 2, 7200, "builder"),
    // ---- the grind ---------------------------------------------------------
    L("l13", "goal", "Score 30 goals in the division", 30, 8e3, "prime"),
    L("l14", "streak", "Win 5 in a row", 5, 9500, "prime"),
    L("l29", "clean", "Keep 5 clean sheets", 5, 1e4, "prime"),
    L("l15", "rank", "Reach Division 5", 1, 11e3, "stars", { rank: 5 }),
    L("l16", "clean", "Keep 8 clean sheets", 8, 13e3, "stars"),
    L("l30", "streak", "Win 4 in a row twice over", 4, 14e3, "stars"),
    L("l17", "bigwin", "Win 4 matches by 3 goals or more", 4, 15e3, "stars"),
    L("l18", "win", "Win 20 Apex Division matches", 20, 18e3, "stars"),
    L("l31", "goal", "Score 50 goals in the division", 50, 2e4, "stars"),
    // ---- the deep end: the only objectives that pay Ultimate ----------------
    L("l19", "rank", "Reach Division 3", 1, 22e3, "stars", { rank: 7, ultimate: 3 }),
    L("l20", "streak", "Win 7 in a row", 7, 26e3, "limited", { ultimate: 4 }),
    L("l21", "goal", "Score 75 goals in the division", 75, 3e4, "limited", { ultimate: 5 }),
    L("l32", "rank", "Reach Division 2", 1, 33e3, "limited", { rank: 8, ultimate: 6 }),
    L("l22", "rank", "Reach Division 1", 1, 36e3, "limited", { rank: 9, ultimate: 8 }),
    L("l23", "win", "Win 40 Apex Division matches", 40, 44e3, "legend", { ultimate: 10 }),
    L("l24", "rank", "Reach Apex Elite", 1, 6e4, "legend", { rank: 10, ultimate: 20 })
  ], ULTIMATE_RUNGS = LADDER.filter((e) => e.ultimate).length;
  function slotFrom(entry) {
    return { ...entry, done: 0 };
  }
  function dealSlate(claimed = [], keep = []) {
    let held = new Set(keep.map((o) => o.id)), done = new Set(claimed), out = keep.slice();
    for (let e of LADDER) {
      if (out.length >= 7) break;
      done.has(e.id) || held.has(e.id) || out.push(slotFrom(e));
    }
    return out;
  }

  // js/net/api.js
  var TOKEN_KEY = "apexxi.token";
  var token = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
  }

  // js/state.js
  var START_APEX = 5e3, RESET_TAG = "econ-2curr-1", defaults = () => ({
    settings: {
      simSpeed: "normal",
      // instant | fast | normal
      commentary: !0,
      reduceMotion: !1,
      // Everything ships at the top setting. A phone that cannot hold it says so
      // in the frame rate, and the one-time prompt after the first full match
      // offers to turn it down — better than starting everyone on "safe" and
      // having nobody ever find out what the game actually looks like.
      quality: "ultra",
      // auto | low | high | ultra   (3D detail in a match)
      models: "realistic",
      // realistic | simple          (scanned mesh vs built-in figures)
      showFps: !1,
      // live frame counter in the match HUD
      graphicsAsked: !1,
      // the post-match "keep these graphics?" prompt fires once, ever
      tutorialDone: !1,
      // the guided tour runs itself once, then lives in Settings
      sound: !0,
      musicVol: 0.5,
      sfxVol: 0.9,
      // v83: the broadcast
      commVoice: !0,
      // two-voice spoken commentary (speech synthesis)
      subtitles: !0,
      // commentary subtitles
      commLang: "auto",
      // auto (the game's language) | en | ar
      pregame: "full",
      // full | short | off — the pre-match show
      broadcastGfx: !0,
      // straps, boards, pop-ups, momentum bar
      menuTheme: "auto",
      // auto | off | nationalDay | ramadan | winter
      responsiveness: 0.7
      // v84 hotfix: how quickly your player answers the stick (0–1)
    },
    club: {
      // Squad Builder progress
      // Two balances. Apex is the one you earn and spend. Ultimate is the
      // premium currency: it is displayed, it is never granted, and nothing
      // costs it yet — it is here so the save format and the HUD already know
      // about it when it does become obtainable.
      apex: START_APEX,
      ultimate: 0,
      collection: [],
      // player ids pulled from packs
      formation: "4-3-3",
      lineup: Array(11).fill(null),
      // Five seats. Stamina without a bench is a punishment with no answer to it.
      bench: Array(5).fill(null),
      packsOpened: 0,
      // A starting bundle, because the first thing the game asks for is eleven
      // players in the right positions and one pack cannot cover that. Only new
      // saves get these: an existing save brings its own `packs` through the
      // merge in loadState.
      packs: ["gold", "silver", "silver", "bronze"],
      freeAt: 0,
      // when the next free bronze unlocks; 0 = now
      challengesDone: [],
      // one-off SBCs already claimed
      /* v68 progression. All optional in old saves — loadState's merge fills
       * them from here, and progress.js tolerates their absence anyway. */
      stats: {},
      // lifetime counters achievements read (progress.js)
      achievements: {},
      // id -> { at, claimed }
      season: null,
      // { id, xp, claimed: [tier...] } for the current Season Pass
      weekend: null,
      // this weekend's tally (weekend.js)
      weekendPending: null,
      // a finished weekend whose reward is still unclaimed
      daily: null,
      // login calendar { last, streak, best, claimedOn }
      pending: [],
      // rewards waiting on the Today hub
      upgrades: {},
      // card id -> evolve level
      dupes: {},
      // card id -> duplicate pulls banked as evolve material
      events: {},
      // event week key -> { done, claimed }
      watchStats: { packs: 0, wins: 0 },
      /* The Stadium Builder (builder.js): the design that is your home ground, and up to eight kept ones. */
      stadium: { design: null, saved: [] },
      /* The club you actually take onto the pitch.
       *
       * Ultimate XI used to be called "Ultimate XI" in a fixed cyan, on every
       * save, for everybody — the one mode built entirely out of your choices had
       * no identity of its own. The shape here is exactly what `crestSVG` already
       * consumes and exactly what `makeTeam`'s custom-squad path already accepts,
       * so this is a stored preference rather than a new system: the badge draws
       * itself and the two colours are what the kit shader tints from. */
      identity: {
        name: "Ultimate XI",
        short: "UXI",
        crest: { shape: "shield", pattern: "solid", device: "star", colors: ["#41d3ff", "#0b1020"] }
      }
    },
    flags: {
      // one-off UI state that has to outlive a reload
      apology: !1,
      // show the "we reset your club" card once
      // which build's release notes this device has already been shown. Compared
      // against the newest entry in data/patchNotes.js, so a new release
      // announces itself exactly once and an existing one never does.
      notesSeen: null
    },
    meta: { reset: RESET_TAG },
    // which wipe this save has already been through
    career: null,
    // set once a career is started
    pro: null,
    // v81: the Player Career, once a player is created
    street: null,
    // v82: the Street mode: your baller, crew, tour, cosmetics
    skills: null,
    // v82: skill-game bests
    ultimate: freshUltimate()
    // Ultimate XI progression
  });
  function freshUltimate() {
    return {
      divIdx: 0,
      // index into DIVISIONS, 0 = Division 10
      progress: 0,
      // wins banked toward the next division
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      objectives: freshObjectives(),
      /* Which rungs of the ladder have been finished, and when the finished slots
         get refilled. Kept separately from the slate so the counter can read
         "6/24 done" — progress through the whole ladder, not through the seven
         currently on screen. */
      objClaimed: [],
      objRefresh: Date.now() + 216e5,
      packsOwed: 0
    };
  }
  function freshObjectives() {
    return dealSlate([]);
  }
  var LADDER_SIZE = LADDER.length;
  var state = defaults();
  var getState = () => state;

  // js/economy.js
  var GROUPS = { GK: "GK", CB: "DEF", LB: "DEF", RB: "DEF", CDM: "MID", CM: "MID", CAM: "MID", LM: "MID", RM: "MID", LW: "WNG", RW: "WNG", ST: "ST" }, BANDS = [[0, 69, "bronze"], [70, 78, "silver"], [79, 85, "gold"], [86, 89, "elite"], [90, 99, "legend"]], bandOf = (overall) => {
    var _a;
    return ((_a = BANDS.find(([lo, hi]) => overall >= lo && overall <= hi)) == null ? void 0 : _a[2]) || "bronze";
  }, kindOf = (p) => "".concat(GROUPS[p.position] || "MID", ":").concat(bandOf(p.overall)), WANT_PER_CLUB = { GK: 2, DEF: 6, MID: 6, WNG: 4, ST: 3 }, supplyCache = null;
  function supplyIndex() {
    if (supplyCache) return supplyCache;
    let have = {};
    for (let p of WORLD.players) {
      if (p.rarity === "icon" || p.sbc) continue;
      let k = kindOf(p);
      have[k] = (have[k] || 0) + 1;
    }
    let want = {};
    for (let c of WORLD.clubs) {
      let rating = WORLD.clubsById[c.id].roster.slice(0, 11).map((id) => {
        var _a;
        return ((_a = WORLD.playersById[id]) == null ? void 0 : _a.overall) || 70;
      }), avg = rating.reduce((a, b) => a + b, 0) / Math.max(1, rating.length);
      for (let [g, n] of Object.entries(WANT_PER_CLUB)) {
        let own = bandOf(Math.round(avg)), up = bandOf(Math.min(99, Math.round(avg) + 8));
        want["".concat(g, ":").concat(own)] = (want["".concat(g, ":").concat(own)] || 0) + n * 0.67, want["".concat(g, ":").concat(up)] = (want["".concat(g, ":").concat(up)] || 0) + n * 0.33;
      }
    }
    let out = {};
    for (let k of /* @__PURE__ */ new Set([...Object.keys(have), ...Object.keys(want)])) {
      let ratio = (want[k] || 1) / Math.max(1, have[k] || 1);
      out[k] = Math.max(0.6, Math.min(1.8, Math.pow(ratio, 0.35)));
    }
    return supplyCache = out, out;
  }
  var HALF_LIFE_MS = 12 * 36e5;
  function demandIndex(kind, s = getState(), now = Date.now()) {
    var _a, _b, _c;
    let m = (_a = s.club) == null ? void 0 : _a.market;
    if (!m) return 1;
    let k = Math.pow(0.5, Math.max(0, now - (m.at || now)) / HALF_LIFE_MS), buy2 = (((_b = m.buy) == null ? void 0 : _b[kind]) || 0) * k, sell = (((_c = m.sell) == null ? void 0 : _c[kind]) || 0) * k;
    return Math.max(0.7, Math.min(1.5, 1 + (buy2 - sell) * 0.04));
  }
  function price(p, s = getState()) {
    let k = kindOf(p), base = p.value || 0;
    return Math.round(base * (supplyIndex()[k] || 1) * demandIndex(k, s) / 1e3) * 1e3;
  }

  // js/data/packs.js
  var WEEK_NATIONS = ["France", "Brazil", "England", "Spain", "Argentina", "Germany", "Italy", "Portugal", "Netherlands", "Saudi Arabia", "Morocco", "Belgium"], nationOfWeek = (now = Date.now()) => WEEK_NATIONS[Math.floor(now / 6048e5) % WEEK_NATIONS.length], PACKS = [
    /* v80: the promo shelf. Each promises one card of its kind in the first slot,
       on top of gold filler, and says exactly what that slot can be. */
    { id: "campaign", cat: "promo", name: "Campaign", cost: 25e3, size: 3, variant: "campaign", odds: { bronze: 0, silver: 0, gold: 0.9, special: 0.1 }, floor: "gold", note: "3 cards · 1 campaign card", promise: "1 guaranteed card from this week's campaign", variantOdds: [["Campaign card", 1]] },
    { id: "inform", cat: "promo", name: "In-Form", cost: 18e3, size: 3, variant: "inform", odds: { bronze: 0, silver: 0, gold: 0.92, special: 0.08 }, floor: "gold", note: "3 cards · 1 in-form", promise: "1 guaranteed In-Form (1 in 8 is Team of the Week)", variantOdds: [["In-Form", 0.875], ["Team of the Week", 0.125]] },
    { id: "vault", cat: "limited", name: "Legends Vault", cost: 12e4, size: 1, limited: !0, variant: "icontier", odds: { bronze: 0, silver: 0, gold: 0, special: 1 }, note: "1 Icon · any tier", promise: "1 guaranteed Icon — Early, Peak or Prime", variantOdds: [["Early Icon (92)", 0.7], ["Peak Icon (95)", 0.25], ["Prime Icon (99)", 0.05]] },
    { id: "bronze", cat: "free", name: "Bronze", cost: 0, size: 4, odds: { bronze: 0.68, silver: 0.28, gold: 0.04, special: 0 }, note: "4 cards" },
    /* v73: SBC fodder. Six cheap bodies — bronzes and silvers — for the quick
       SBCs, priced so a pack is always worth less than the challenge it feeds. */
    { id: "fodder", cat: "standard", name: "SBC Fodder", cost: 1500, size: 6, odds: { bronze: 0.62, silver: 0.34, gold: 0.04, special: 0 }, tone: "bronze", note: "6 cards · for SBCs" },
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
    /* v73: packs by position and by age, at the Keeper pack's price point. */
    { id: "youth", cat: "standard", name: "Youth Academy", cost: 6e3, size: 3, odds: { bronze: 0.1, silver: 0.5, gold: 0.38, special: 0.02 }, filter: { maxAge: 21 }, floor: "silver", tone: "silver", note: "3 · aged 21 or under", promise: "Every card 21 or under" },
    { id: "defence", cat: "standard", name: "Back Four", cost: 6e3, size: 4, odds: { bronze: 0.1, silver: 0.5, gold: 0.38, special: 0.02 }, filter: { positions: ["CB", "LB", "RB"] }, floor: "silver", tone: "keeper", note: "4 · defenders only", promise: "Four defenders" },
    { id: "midfield", cat: "standard", name: "Engine Room", cost: 6e3, size: 3, odds: { bronze: 0.1, silver: 0.5, gold: 0.38, special: 0.02 }, filter: { positions: ["CDM", "CM", "CAM", "LM", "RM"] }, floor: "silver", tone: "silver", note: "3 · midfielders only", promise: "Three midfielders" },
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
    /* v73: a division's own pack, the nation of the week, and the biggest bulk pack in the store. */
    { id: "premier", cat: "premium", name: "Premier Pick", cost: 14e3, size: 3, odds: { bronze: 0, silver: 0.14, gold: 0.74, special: 0.12 }, filter: { leagues: ["Apex Premier Division"] }, floor: "gold", tone: "gold", note: "3 · top division only", promise: "Every card from the Apex Premier Division" },
    { id: "nations", cat: "premium", name: "Nations Week", cost: 12e3, size: 3, odds: { bronze: 0, silver: 0.2, gold: 0.7, special: 0.1 }, filter: { nationOfWeek: !0 }, floor: "gold", tone: "gold", note: "3 · one nation", promise: "This week: the nation on the shelf", weekly: !0 },
    { id: "mega", cat: "premium", name: "Mega", cost: 2e4, size: 12, odds: { bronze: 0.06, silver: 0.36, gold: 0.52, special: 0.06 }, floor: "gold", tone: "gold", note: "12 · gold min", promise: "A dozen cards in one reveal" },
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
    /* v73: four cards with a Star in them, between the Stars pack and the Icons. */
    { id: "wonder", cat: "limited", name: "Limited: Wonder", cost: 9e4, size: 4, limited: !0, guarantee: "star", odds: { bronze: 0, silver: 0, gold: 0.34, special: 0.66 }, minOverall: 84, note: "4 cards · 84+ min", promise: "1 guaranteed Star · 84+ throughout" },
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
  var packTone = (p) => p.tone || p.guarantee || p.id, RARITY_RANK = { bronze: 0, silver: 1, gold: 2, special: 3, inform: 3, totw: 4, future: 4, desert: 4, winter: 4, star: 4, icon: 5 };
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
      return (!f.nations || f.nations.includes(p.nation)) && (!f.leagues || p.clubId && f.leagues.includes((_a = WORLD.clubsById[p.clubId]) == null ? void 0 : _a.league)) && (!f.clubs || f.clubs.includes(p.clubId)) && (!f.positions || f.positions.includes(p.position)) && (!f.maxAge || p.age <= f.maxAge) && (!f.nationOfWeek || p.nation === nationOfWeek()) && (!f.minOverall || p.overall >= f.minOverall);
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
    if (wantPos && !pulls.some((x) => x.p.position === wantPos) && (pulls[0] = draw2(rollRarity(pack.odds), (p) => p.position === wantPos)), pack.variant) {
      let r = Math.random(), pool = [];
      if (pack.variant === "campaign" ? pool = campaignCards(campaignNow()) : pack.variant === "inform" ? pool = r < 0.125 ? weekCards("totw", weekNow()) : weekCards("inform", weekNow()) : pack.variant === "icontier" && (pool = iconTierCards(r < 0.7 ? "early" : r < 0.95 ? "peak" : "prime")), pool.length) {
        let fresh = pool.filter((p2) => !seen.has(p2.id)), sorted = (fresh.length ? fresh : pool).slice().sort((a, b) => a.overall - b.overall), p = sorted[Math.floor(Math.pow(Math.random(), 1.8) * sorted.length)], dup = seen.has(p.id);
        seen.add(p.id), pulls[0] = { p, dup };
      }
    }
    if (pack.guarantee) {
      let lo = wantPos ? 1 : 0, at = lo + Math.floor(Math.random() * Math.max(1, pulls.length - lo));
      pulls[at] = draw2(pack.guarantee);
    }
    return pulls;
  }
  var dupValue = (p) => Math.max(50, Math.round(price(p) / 25e3));

  // js/data/traits.js
  var TRAITS = {
    finesse: { name: "Finesse Finisher", short: "FIN", blurb: "Curled shots bend more and find the corner more often." },
    engine: { name: "Engine", short: "ENG", blurb: "Tires far more slowly and keeps sprinting late on." },
    rock: { name: "Rock at the Back", short: "RCK", blurb: "Wins more tackles, gives away fewer fouls and holds his ground in a shoulder duel." },
    quick: { name: "Quick Step", short: "QST", blurb: "Explosive over the first few metres and turns sharper at speed." },
    sweeper: { name: "Sweeper Keeper", short: "SWK", blurb: "Comes off his line to clear through balls and dives further." },
    pinged: { name: "Pinged Pass", short: "PNG", blurb: "Long passes and switches arrive quicker and truer." },
    aerial: { name: "Aerial Threat", short: "AER", blurb: "Times his jump for headers and wins more of them." },
    trickster: { name: "Trickster", short: "TRK", blurb: "Skill moves come off more often and unlock the harder ones." },
    anchor: { name: "Anchor", short: "ANC", blurb: "Reads play: intercepts passes into the space in front of the defence." },
    cannon: { name: "Cannon", short: "CAN", blurb: "Hits the ball harder from distance, with the odd knuckling strike." },
    velvet: { name: "Velvet Touch", short: "VEL", blurb: "Kills a fast pass dead — almost never a heavy first touch." },
    deadball: { name: "Dead Ball", short: "DBL", blurb: "Free kicks and corners curl and dip on to the target." }
  };
  function traitsOf(ref) {
    var _a;
    if (!ref) return [];
    if (ref._traits) return ref._traits;
    if ((_a = ref.extraTraits) != null && _a.length) {
      let base = traitsOf({ ...ref, extraTraits: null }), res2 = [...ref.extraTraits.filter((id) => TRAITS[id] && !base.some((t) => t.id === id)).map((id) => ({ id, elite: !1 })), ...base].slice(0, 4);
      try {
        Object.defineProperty(ref, "_traits", { value: res2, enumerable: !1, configurable: !0 });
      } catch {
      }
      return res2;
    }
    let s = ref.stats || {}, pos = ref.position || "CM", ovr = ref.overall || 60, out = [], add = (id, score, eliteAt) => out.push({ id, score, elite: score >= eliteAt });
    if (pos === "GK")
      add("sweeper", (s.pace || 50) + (s.passing || 50) * 0.6, 150), (s.passing || 0) > 75 && add("pinged", s.passing + 20, 108);
    else {
      let def = ["CB", "LB", "RB", "CDM"].includes(pos), att = ["ST", "LW", "RW", "CAM"].includes(pos);
      att && s.shooting >= 78 && add("finesse", s.shooting + s.dribbling * 0.3, 118), s.shooting >= 82 && s.physical >= 74 && add("cannon", s.shooting * 0.6 + s.physical * 0.6, 106), s.physical >= 80 && s.pace >= 70 && !att && add("engine", s.physical + s.pace * 0.3, 118), def && s.defending >= 80 && add("rock", s.defending + s.physical * 0.3, 118), s.pace >= 86 && add("quick", s.pace + s.dribbling * 0.2, 112), s.passing >= 82 && add("pinged", s.passing + s.dribbling * 0.1, 99), s.physical >= 80 && (pos === "ST" || pos === "CB") && add("aerial", s.physical + (pos === "ST" ? s.shooting : s.defending) * 0.3, 115), s.dribbling >= 84 && add("trickster", s.dribbling + s.pace * 0.2, 112), pos === "CDM" && s.defending >= 74 && add("anchor", s.defending + s.passing * 0.3, 112), s.dribbling >= 80 && s.passing >= 78 && add("velvet", s.dribbling * 0.6 + s.passing * 0.6, 106), s.passing >= 80 && s.shooting >= 76 && ["CM", "CAM", "LW", "RW", "LM", "RM"].includes(pos) && add("deadball", s.passing * 0.5 + s.shooting * 0.6, 104);
    }
    for (let t of out) ovr < 86 && (t.elite = !1);
    let res = out.sort((a, b) => b.score - a.score).slice(0, ovr >= 84 ? 3 : ovr >= 76 ? 2 : 1).map(({ id, elite }) => ({ id, elite }));
    try {
      Object.defineProperty(ref, "_traits", { value: res, enumerable: !1, configurable: !0 });
    } catch {
    }
    return res;
  }
  function traitLevel(ref, id) {
    let t = traitsOf(ref).find((x) => x.id === id);
    return t ? t.elite ? 1.6 : 1 : 0;
  }
  function skillStars(ref) {
    var _a;
    if (!ref || ref.position === "GK") return 1;
    let d2 = ((_a = ref.stats) == null ? void 0 : _a.dribbling) || 50, st = d2 >= 88 ? 5 : d2 >= 82 ? 4 : d2 >= 74 ? 3 : d2 >= 64 ? 2 : 1;
    return traitLevel(ref, "trickster") && st < 5 && (st += 1), st;
  }

  // js/game/skills.js
  var SKILL_MOVES = [
    { id: "ball-roll", name: "Ball roll", stars: 1, dir: "side", mod: null, combo: "Skill + sideways", fx: { t: 0.32, brake: 0.55, burst: { fwd: 0.5, side: 4.2 }, ball: "keep", freeze: 0.1 } },
    { id: "drag-back", name: "Drag back", stars: 1, dir: "back", mod: null, combo: "Skill + back", fx: { t: 0.36, brake: 0.2, burst: { fwd: 1.5, side: 0 }, turn: Math.PI, ball: "keep", freeze: 0.1 } },
    { id: "stepover", name: "Stepover", stars: 2, dir: "fwd", mod: null, combo: "Skill + forward", fx: { t: 0.42, brake: 0.35, burst: { fwd: 8, side: 0 }, ball: "keep", freeze: 0.3 } },
    { id: "feint", name: "Body feint", stars: 2, dir: "side", mod: "sprint", combo: "Skill + sideways + Sprint", fx: { t: 0.36, brake: 0.9, burst: { fwd: 1.5, side: 6.5 }, ball: "keep", freeze: 0.35 } },
    { id: "fake-shot", name: "Fake shot", stars: 3, dir: "fwd", mod: "curl", combo: "Skill + forward + Curl", fx: { t: 0.5, brake: 0.25, burst: { fwd: 3, side: 3.5 }, ball: "keep", freeze: 0.65 } },
    { id: "heel-chop", name: "Heel chop", stars: 3, dir: "side", mod: "curl", combo: "Skill + sideways + Curl", fx: { t: 0.34, brake: 0.3, burst: { fwd: 1, side: 7 }, turn: Math.PI / 2, ball: "keep", freeze: 0.4 } },
    { id: "roulette", name: "Roulette", stars: 3, dir: "back", mod: "sprint", combo: "Skill + back + Sprint", fx: { t: 0.62, brake: 0.5, burst: { fwd: 2.5, side: 2 }, ball: "keep", freeze: 0.3, spin: !0 } },
    { id: "nutmeg", name: "Nutmeg", stars: 4, dir: "fwd", mod: "sprint", combo: "Skill + forward + Sprint, a man in front", fx: { t: 0.32, brake: 1, burst: { fwd: 9, side: 2.2 }, ball: "past", freeze: 0.5 } },
    { id: "elastico", name: "Elastico", stars: 4, dir: "side", mod: "lob", combo: "Skill + sideways + Lob", fx: { t: 0.4, brake: 0.6, burst: { fwd: 2, side: 8 }, ball: "keep", freeze: 0.55 } },
    { id: "scoop-turn", name: "Scoop turn", stars: 4, dir: "back", mod: "curl", combo: "Skill + back + Curl", fx: { t: 0.5, brake: 0.35, burst: { fwd: 5, side: 0 }, turn: Math.PI, ball: "keep", freeze: 0.35, spin: !0 } },
    { id: "bridge", name: "Bridge", stars: 4, dir: "fwd", mod: "lob", combo: "Skill + forward + Lob, open grass", fx: { t: 0.3, brake: 1, burst: { fwd: 9.5, side: 3 }, ball: "past", freeze: 0.2 } },
    { id: "rainbow", name: "Rainbow flick", stars: 5, dir: "fwd", mod: "lob", combo: "Skill + forward + Lob, a man in front", fx: { t: 0.55, brake: 0.8, burst: { fwd: 6.5, side: 0 }, ball: "lift", freeze: 0.5 } },
    { id: "croqueta", name: "La croqueta", stars: 5, dir: "none", mod: null, combo: "Skill, stick centred", fx: { t: 0.3, brake: 0.7, burst: { fwd: 1, side: 5.5 }, ball: "keep", freeze: 0.5 } }
  ];
  function pickSkill(dir, mod, stars, foeAhead) {
    let allowed = (m) => m.stars <= stars, want = SKILL_MOVES.filter((m) => m.dir === dir && m.mod === mod);
    dir === "fwd" && mod === "sprint" && (want = SKILL_MOVES.filter((m) => m.id === (foeAhead ? "nutmeg" : "stepover"))), dir === "fwd" && mod === "lob" && (want = SKILL_MOVES.filter((m) => m.id === (foeAhead ? "rainbow" : "bridge")));
    let pick = want.find(allowed);
    return pick || SKILL_MOVES.filter((m) => (m.dir === dir || dir === "none" && m.dir === "side") && allowed(m)).sort((a, b) => b.stars - a.stars)[0] || SKILL_MOVES[0];
  }

  // js/game/tactics.js
  var DEF_STYLES = {
    high: { name: "High press", press: 1.35, line: 8 },
    balanced: { name: "Balanced", press: 1, line: 0 },
    deep: { name: "Deep block", press: 0.72, line: -9 }
  }, BUILD_UPS = {
    short: { name: "Short passing", passRate: 1.3, longBias: 0.2, counter: 1 },
    balanced: { name: "Balanced", passRate: 1, longBias: 0.5, counter: 1 },
    long: { name: "Long ball", passRate: 0.85, longBias: 1, counter: 1 },
    counter: { name: "Counter-attack", passRate: 0.9, longBias: 0.75, counter: 1.6 }
  }, ROLES = {
    // defenders
    "centre-back": { name: "Centre-back", pos: "DEF", has: { fwd: 0, in: 0 }, not: { fwd: 0, in: 0 } },
    "ball-playing": { name: "Ball-playing defender", pos: "DEF", has: { fwd: 3, in: 0 }, not: { fwd: 0, in: 0 }, flag: "progressive" },
    "full-back": { name: "Full-back", pos: "DEF", has: { fwd: 6, in: 0 }, not: { fwd: 0, in: 0 }, flag: "overlap" },
    "wing-back": { name: "Wing-back", pos: "DEF", has: { fwd: 14, in: -2 }, not: { fwd: -2, in: 0 }, flag: "overlap" },
    "inverted-wing-back": { name: "Inverted wing-back", pos: "DEF", has: { fwd: 8, in: 14 }, not: { fwd: 0, in: 0 } },
    // midfielders
    holding: { name: "Holding midfielder", pos: "MID", has: { fwd: -5, in: 5 }, not: { fwd: -4, in: 4 }, flag: "screen" },
    "box-to-box": { name: "Box-to-box", pos: "MID", has: { fwd: 9, in: 0 }, not: { fwd: -5, in: 0 }, flag: "runs" },
    playmaker: { name: "Playmaker", pos: "MID", has: { fwd: 2, in: 4 }, not: { fwd: 0, in: 0 }, flag: "progressive" },
    "wide-midfielder": { name: "Wide midfielder", pos: "MID", has: { fwd: 4, in: -3 }, not: { fwd: -2, in: 0 }, flag: "cross" },
    "attacking-mid": { name: "Attacking midfielder", pos: "MID", has: { fwd: 8, in: 3 }, not: { fwd: 2, in: 0 }, flag: "runs" },
    // forwards
    "advanced-forward": { name: "Advanced forward", pos: "FWD", has: { fwd: 4, in: 0 }, not: { fwd: 2, in: 0 }, flag: "runs" },
    "false-nine": { name: "False nine", pos: "FWD", has: { fwd: -11, in: 2 }, not: { fwd: -4, in: 0 }, flag: "progressive" },
    "target-man": { name: "Target man", pos: "FWD", has: { fwd: 2, in: 8 }, not: { fwd: 0, in: 4 }, flag: "target" },
    poacher: { name: "Poacher", pos: "FWD", has: { fwd: 6, in: 6 }, not: { fwd: 4, in: 2 }, flag: "poacher" },
    "inside-forward": { name: "Inside forward", pos: "FWD", has: { fwd: 5, in: 9 }, not: { fwd: 0, in: 0 }, flag: "cutin" }
  }, QUICK_TACTICS = [
    { id: "park", name: "Park the bus", set: { mentality: "defensive", defStyle: "deep", buildUp: "counter", line: 0.2, width: 0.35 } },
    { id: "defensive", name: "Defensive", set: { mentality: "defensive", defStyle: "balanced", buildUp: "balanced", line: 0.4, width: 0.45 } },
    { id: "balanced", name: "Balanced", set: { mentality: "balanced", defStyle: "balanced", buildUp: "balanced", line: 0.5, width: 0.5 } },
    { id: "attacking", name: "Attacking", set: { mentality: "attacking", defStyle: "high", buildUp: "short", line: 0.62, width: 0.62 } },
    { id: "allout", name: "All-out attack", set: { mentality: "allout", defStyle: "high", buildUp: "long", line: 0.75, width: 0.7 } }
  ], defaultTactics = () => ({ mentality: "balanced", pressing: "normal", defStyle: "balanced", buildUp: "balanced", width: 0.5, line: 0.5, roles: {}, quick: "balanced" });
  function defaultRole(ref, slot) {
    var _a, _b, _c, _d;
    let pos = (ref == null ? void 0 : ref.position) || "";
    return slot.role === "DEF" ? slot.y < 0.3 || slot.y > 0.7 ? slot.x > 0.2 ? "wing-back" : "full-back" : (((_a = ref == null ? void 0 : ref.stats) == null ? void 0 : _a.passing) || 0) >= 76 ? "ball-playing" : "centre-back" : slot.role === "MID" ? slot.y < 0.22 || slot.y > 0.78 ? "wide-midfielder" : pos === "CDM" || slot.x < 0.35 ? "holding" : pos === "CAM" || slot.x > 0.5 ? "attacking-mid" : (((_b = ref == null ? void 0 : ref.stats) == null ? void 0 : _b.passing) || 0) >= 80 ? "playmaker" : "box-to-box" : slot.role === "FWD" ? slot.y < 0.25 || slot.y > 0.75 ? "inside-forward" : (((_c = ref == null ? void 0 : ref.stats) == null ? void 0 : _c.physical) || 0) >= 82 ? "target-man" : (((_d = ref == null ? void 0 : ref.stats) == null ? void 0 : _d.pace) || 0) >= 85 ? "advanced-forward" : "poacher" : null;
  }
  function adaptFor(diff, late, atHalf) {
    if (late > 0.8)
      return diff < 0 ? { mentality: "allout", defStyle: "high", buildUp: "long", line: 0.75, width: 0.68, tempo: "fast" } : diff > 0 ? { mentality: "defensive", defStyle: "deep", buildUp: "counter", line: 0.35, width: 0.45, tempo: "slow" } : null;
    if (atHalf) {
      if (diff <= -1) return { mentality: "attacking", defStyle: "high", buildUp: "short", line: 0.62, tempo: "normal" };
      if (diff >= 2) return { mentality: "defensive", defStyle: "deep", buildUp: "counter", line: 0.4, tempo: "normal" };
      if (diff === 1) return { defStyle: "balanced", tempo: "normal" };
    }
    return null;
  }

  // js/game/field.js
  var PITCH = { w: 105, h: 68 }, FIELDS = {
    full: { id: "full", w: 105, h: 68, goalHalf: 5.5, goalHeight: 2.44, boxW: 16.5, boxHalf: 20, sixW: 5.5, sixHalf: 9.16, spot: 11, circle: 9.15, players: 11, walls: !1, offside: !0 },
    fives: { id: "fives", w: 60, h: 38, goalHalf: 2.5, goalHeight: 2.2, boxW: 8, boxHalf: 10, sixW: 3, sixHalf: 5, spot: 7, circle: 5, players: 5, walls: !1, offside: !1 },
    // futsal (v82): kick-ins, and a smaller, heavier ball that barely bounces and rolls true
    futsal: { id: "futsal", w: 42, h: 25, goalHalf: 1.5, goalHeight: 2, boxW: 6, boxHalf: 7.5, sixW: 0, sixHalf: 0, spot: 6, circle: 3, players: 5, walls: !1, offside: !1, kickIn: !0, ball: { bounce: 0.2, drag: 0.982 } },
    // the street cages (v82): walls all round, play off them; goals are small and there is no offside
    // the watch's street 1v1 (v82): a tiny walled court, one each, no keepers
    street1: { id: "street1", w: 24, h: 15, goalHalf: 1, goalHeight: 1.2, boxW: 3, boxHalf: 4, sixW: 0, sixHalf: 0, spot: 4, circle: 2, players: 1, walls: !0, offside: !1, street: !0 },
    street3: { id: "street3", w: 34, h: 22, goalHalf: 1.5, goalHeight: 1.5, boxW: 5, boxHalf: 6, sixW: 0, sixHalf: 0, spot: 6, circle: 3, players: 3, walls: !0, offside: !1, street: !0 },
    street4: { id: "street4", w: 40, h: 24, goalHalf: 1.7, goalHeight: 1.6, boxW: 5.5, boxHalf: 7, sixW: 0, sixHalf: 0, spot: 6, circle: 3, players: 4, walls: !0, offside: !1, street: !0 },
    street5: { id: "street5", w: 46, h: 28, goalHalf: 1.9, goalHeight: 1.8, boxW: 6, boxHalf: 8, sixW: 0, sixHalf: 0, spot: 6.5, circle: 3.5, players: 5, walls: !0, offside: !1, street: !0 }
  }, CY = 34, GOAL_HALF = 5.5, GOAL_HEIGHT = 2.44, BOX = { w: 16.5, half: 20 }, FIELD = { ...FIELDS.full }, SCALE = 1;
  function setField(spec = "full") {
    let f = typeof spec == "string" ? FIELDS[spec] || FIELDS.full : { ...FIELDS.full, ...spec };
    return PITCH.w = f.w, PITCH.h = f.h, CY = f.h / 2, GOAL_HALF = f.goalHalf, GOAL_HEIGHT = f.goalHeight, BOX.w = f.boxW, BOX.half = f.boxHalf, Object.assign(FIELD, f), SCALE = f.w / 105, FIELD;
  }

  // js/game/sim.js
  var PRESETS = {
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
  }, FORMATION_NAMES = Object.keys(SHAPES), SHAPES5 = {
    "1-2-1": [
      { x: 0.05, y: 0.5, role: "GK" },
      { x: 0.24, y: 0.5, role: "DEF" },
      { x: 0.46, y: 0.22, role: "MID" },
      { x: 0.46, y: 0.78, role: "MID" },
      { x: 0.7, y: 0.5, role: "FWD" }
    ],
    "2-2": [
      { x: 0.05, y: 0.5, role: "GK" },
      { x: 0.26, y: 0.3, role: "DEF" },
      { x: 0.26, y: 0.7, role: "DEF" },
      { x: 0.62, y: 0.3, role: "FWD" },
      { x: 0.62, y: 0.7, role: "FWD" }
    ],
    "2-1-1": [
      { x: 0.05, y: 0.5, role: "GK" },
      { x: 0.24, y: 0.3, role: "DEF" },
      { x: 0.24, y: 0.7, role: "DEF" },
      { x: 0.46, y: 0.5, role: "MID" },
      { x: 0.72, y: 0.5, role: "FWD" }
    ]
  }, FIVES_NAMES = Object.keys(SHAPES5), SHAPES4 = {
    "1-2": [{ x: 0.05, y: 0.5, role: "GK" }, { x: 0.28, y: 0.5, role: "DEF" }, { x: 0.58, y: 0.26, role: "FWD" }, { x: 0.58, y: 0.74, role: "FWD" }],
    "2-1": [{ x: 0.05, y: 0.5, role: "GK" }, { x: 0.26, y: 0.3, role: "DEF" }, { x: 0.26, y: 0.7, role: "DEF" }, { x: 0.62, y: 0.5, role: "FWD" }],
    diamond: [{ x: 0.05, y: 0.5, role: "GK" }, { x: 0.26, y: 0.5, role: "DEF" }, { x: 0.46, y: 0.5, role: "MID" }, { x: 0.68, y: 0.5, role: "FWD" }]
  }, SHAPES3 = {
    "1-1": [{ x: 0.05, y: 0.5, role: "GK" }, { x: 0.3, y: 0.5, role: "DEF" }, { x: 0.62, y: 0.5, role: "FWD" }],
    split: [{ x: 0.05, y: 0.5, role: "GK" }, { x: 0.45, y: 0.28, role: "MID" }, { x: 0.45, y: 0.72, role: "MID" }]
  }, SHAPES1 = { solo: [{ x: 0.3, y: 0.5, role: "FWD" }] }, SMALL = { 5: [SHAPES5, "1-2-1"], 4: [SHAPES4, "1-2"], 3: [SHAPES3, "1-1"], 1: [SHAPES1, "solo"] }, shapesFor = () => {
    var _a;
    return ((_a = SMALL[FIELD.players]) == null ? void 0 : _a[0]) || SHAPES;
  }, defaultShape = () => {
    let s = SMALL[FIELD.players];
    return s ? s[0][s[1]] : SHAPES["4-4-2"];
  };
  var SHAPE = SHAPES["4-4-2"], ROLE_OF = {
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
  }, MENTALITY = { defensive: 0.72, balanced: 1, attacking: 1.32, allout: 1.55 }, PRESSING = { low: 0.7, normal: 1, high: 1.4 }, BENCH_SIZE = 5, MAX_SUBS = 3, GRAV = 16, TUNE = { drop: 2, squeeze: 0.93, counter: !0, sweeper: !0, runs: !0, keeperDist: !0, shotRate: 0.7, tackleRate: 0.6, boxCare: 0.35 }, clamp2 = (v, lo, hi) => Math.max(lo, Math.min(hi, v)), dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), strongSide = (p) => p.ref.foot === "L" ? -1 : 1;
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
    return FIELD.players < 11 ? smallFrom(xi, FIELD.players) : xi.slice(0, 11);
  }
  function smallFrom(xi, n) {
    if (n === 5) return fivesFrom(xi);
    let role = (p) => ROLE_OF[p.position] || "MID";
    if (n === 1) return [xi.filter((p) => role(p) !== "GK").sort((a, b) => b.overall - a.overall)[0] || xi[0]];
    let gk = xi.filter((p) => role(p) === "GK").sort((a, b) => b.overall - a.overall)[0], rest = xi.filter((p) => p !== gk).sort((a, b) => b.overall - a.overall), want = n === 4 ? ["DEF", "FWD", "FWD"] : ["DEF", "FWD"], out = [gk];
    for (let r of want) {
      let i = rest.findIndex((p) => role(p) === r || r === "FWD" && role(p) === "MID");
      out.push(i >= 0 ? rest.splice(i, 1)[0] : rest.shift());
    }
    return out.filter(Boolean).slice(0, n);
  }
  function fivesFrom(xi) {
    let role = (p) => ROLE_OF[p.position] || "MID", by = (r) => xi.filter((p) => role(p) === r).sort((a, b) => b.overall - a.overall), out = [by("GK")[0], by("DEF")[0], ...by("MID").slice(0, 2), by("FWD")[0]];
    for (let p of xi.slice().sort((a, b) => b.overall - a.overall)) {
      if (out.filter(Boolean).length >= 5) break;
      out.includes(p) || (out[out.findIndex((q) => !q)] = p);
    }
    return out.filter(Boolean).slice(0, 5);
  }
  function attributesOf(ref) {
    let st = ref.stats, tr = {};
    for (let id of ["finesse", "engine", "rock", "quick", "sweeper", "pinged", "aerial", "trickster", "anchor", "cannon", "velvet", "deadball"]) {
      let l = traitLevel(ref, id);
      l && (tr[id] = l);
    }
    return {
      maxSpeed: 5.4 + st.pace / 100 * 3.8,
      // 1 is fresh, 0 is spent. A strong physical player empties slower and
      // fills faster, which is most of what the stat is for.
      stamina: 1,
      stamCost: (1.35 - st.physical / 100 * 0.6) * (tr.engine ? 1 - 0.22 * tr.engine : 1),
      /* v79: momentum. How quickly he gets up to speed (per second), and how fast
         he can swing his heading round (radians per second at a jog — much less
         at a sprint). Pace and a Quick Step buy the first; balance on the ball
         the second. */
      accel: 5.2 + st.pace * 0.045 + (tr.quick || 0) * 1.8,
      turn: 6.2 + st.dribbling * 0.035 + (tr.quick || 0) * 1.4,
      strength: st.physical + (tr.rock || 0) * 8,
      control: (st.dribbling * 0.6 + st.passing * 0.4) / 100 + (tr.velvet || 0) * 0.12,
      stars: skillStars(ref),
      tr
    };
  }
  function aggressionOf(ref) {
    let st = ref.stats, base = (st.physical * 0.5 + st.defending * 0.5 - st.dribbling * 0.35) / 100, back = ["CB", "LB", "RB", "CDM"].includes(ref.position) ? 0.16 : ref.position === "GK" ? -0.4 : 0, h = 2166136261;
    for (let ch of String(ref.id || ref.name || ""))
      h ^= ch.charCodeAt(0), h = Math.imul(h, 16777619) >>> 0;
    return clamp2(base + back + (h % 1e3 / 1e3 - 0.5) * 0.24, 0.02, 1);
  }
  function makeTeam(clubId, side, isHuman, custom = null) {
    var _a, _b, _c, _d;
    let club = getClub(clubId), n = FIELD.players, xi = ((_a = custom == null ? void 0 : custom.xi) == null ? void 0 : _a.length) === n ? custom.xi : ((_b = custom == null ? void 0 : custom.xi) == null ? void 0 : _b.length) > n && n < 11 ? smallFrom(custom.xi, n) : pickXI(clubId), SHAPE2 = defaultShape(), dir = side === 0 ? 1 : -1, players = xi.map((ref, i) => {
      var _a2, _b2, _c2;
      let s = SHAPE2[i], sx = side === 0 ? s.x : 1 - s.x, sy = side === 0 ? s.y : 1 - s.y;
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
        runUntil: 0,
        /* How willing this one is to fly in. A physical, defensive-minded player
           with little composure will lunge from further out and more often than
           a technician will — and a lunge from further out is exactly what the
           referee books people for (see `tackle`). Seeded off the card, so the
           same footballer is the same nuisance every match. */
        aggression: aggressionOf(ref),
        tRole: (((_c2 = ROLES[(_b2 = (_a2 = custom == null ? void 0 : custom.tactics) == null ? void 0 : _a2.roles) == null ? void 0 : _b2[i]]) == null ? void 0 : _c2.pos) === s.role ? custom.tactics.roles[i] : null) || defaultRole(ref, s),
        // v79: what he does inside his slot
        downT: 0,
        // seconds spent on the grass after being fouled
        cards: 0
        // yellows
      };
    }), onPitch = new Set(xi.map((r) => r.id)), bench = ((_c = custom == null ? void 0 : custom.bench) != null && _c.filter(Boolean).length ? custom.bench.filter(Boolean) : null) || rosterOf(clubId).filter((r) => !onPitch.has(r.id)).sort((a, b) => b.overall - a.overall).slice(0, BENCH_SIZE);
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
      formation: ((_d = SMALL[n]) == null ? void 0 : _d[1]) || "4-4-2",
      // a custom squad may bring an instruction with it — the Apex Division uses
      // this to make the CPU press and push up the higher you climb
      tactics: { ...defaultTactics(), ...(custom == null ? void 0 : custom.tactics) || {} },
      // v81: a career names its set-piece takers ({ pen, fk, corner }: card ids)
      takers: (custom == null ? void 0 : custom.takers) || null
    };
  }
  var namedTaker = (team, kind) => {
    var _a;
    let id = (_a = team.takers) == null ? void 0 : _a[kind];
    return id && team.players.find((p) => p.ref.id === id && p.role !== "GK" && !p.injured) || null;
  }, Match = class {
    constructor(homeId, awayId, opts = {}) {
      var _a, _b, _c, _d;
      setField(opts.field || "full"), this.field = FIELD.id, this.mode = opts.mode || "single", this.human = opts.human === null ? null : (_a = opts.human) != null ? _a : 0, this.teams = [
        makeTeam(homeId, 0, this.human === 0, opts.homeSquad || null),
        makeTeam(awayId, 1, this.human === 1, opts.awaySquad || null)
      ];
      let last2 = FIELD.players - 1;
      if ((_b = opts.seats) != null && _b.length) {
        let used = [0, 0];
        this.controllers = opts.seats.map((st) => ({ team: st.team, activeIdx: Math.max(1, last2 - used[st.team]++), charge: 0, passCharge: 0 }));
        for (let t of [0, 1]) opts.seats.some((st) => st.team === t) && (this.teams[t].isHuman = !0);
      } else this.human === null ? this.controllers = [] : this.mode === "versus" ? (this.controllers = [
        { team: 0, activeIdx: last2, charge: 0, passCharge: 0 },
        { team: 1, activeIdx: last2, charge: 0, passCharge: 0 }
      ], this.teams[1].isHuman = !0) : this.mode === "coop" ? this.controllers = [
        { team: 0, activeIdx: last2, charge: 0, passCharge: 0 },
        { team: 0, activeIdx: last2 - 1, charge: 0, passCharge: 0 }
      ] : this.controllers = [{ team: this.human, activeIdx: last2, charge: 0, passCharge: 0 }];
      this.duration = (_c = opts.duration) != null ? _c : 240, this.skill = (_d = opts.skill) != null ? _d : 1, this.momentum = 0, this.preset = PRESETS[opts.preset] || PRESETS.authentic, this.responsiveness = Number.isFinite(opts.responsiveness) ? Math.max(0, Math.min(1, opts.responsiveness)) : 0.7, this.ball = { x: PITCH.w / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null }, this.stoppages = 0, this.stoppage = null, this.pst = {}, this.t = 0, this.half = 1, this.phase = "kickoff", this.phaseT = 1.4, this.banner = "KICK OFF", this.activeIdx = 10, this.basis = null, this.charge = 0, this.feed = [], this.cues = [], this.setPiece = null, this.injuries = [], this.fouls = [0, 0], this.offsides = [0, 0], this.offsideWatch = null, this.bookings = [], this.lastOwnerTeam = null, this.kickoffSide = 1, this.resetPositions(0);
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
    /**
     * This player's appetite for a challenge right now: his own temperament,
     * lifted by a side that is behind and running out of match, and dropped
     * hard by a booking — a man on a yellow keeps his feet.
     */
    aggressionOf(p) {
      let behind = this.teams[1 - p.team].score - this.teams[p.team].score, late = Math.min(1, this.t / Math.max(1, this.duration)), chase = behind > 0 ? Math.min(0.3, behind * 0.1) * (0.35 + late) : 0, booked = p.cards > 0 ? 0.5 : 1;
      return clamp2((p.aggression + chase) * booked, 0, 1);
    }
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
    /** Street style (v82): points for skills and wall play, chained when they come quickly. Counting only. */
    styleOf(side) {
      let t = this.teams[side];
      return t.style || (t.style = { points: 0, skills: 0, walls: 0, goals: 0, stylish: 0, chain: 0, last: -99 });
    }
    styleEvent(p, kind, pts) {
      if (!FIELD.street || !p) return;
      let st = this.styleOf(p.team);
      st[kind] += 1, st.chain = this.t - st.last < 5 ? Math.min(5, st.chain + 1) : 1, st.last = this.t, st.points += pts * st.chain;
    }
    /** Count something a player did (v81). */
    tally(p, k, n = 1) {
      var _a;
      let id = (_a = p == null ? void 0 : p.ref) == null ? void 0 : _a.id;
      if (!id) return;
      let r = this.pst[id] || (this.pst[id] = { passes: 0, shots: 0, tackles: 0, saves: 0, dist: 0, on: 0, off: null, team: p.team });
      r[k] += n;
    }
    /** Minutes on the pitch for a card id, in match minutes. */
    minutesOf(id) {
      var _a;
      let r = this.pst[id];
      if (!r) return 0;
      let end = (_a = r.off) != null ? _a : this.t;
      return Math.round((end - r.on) / Math.max(1, this.duration) * 90);
    }
    isControlled(p) {
      return this.controllers.some((c) => !c.ai && this.playerOf(c) === p);
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
          p.x = p.sx * PITCH.w, p.y = p.sy * PITCH.h, p.vx = p.vy = 0, p.touchLock = p.stumble = p.holdT = p.slide = p.downT = 0, p.celebrating = !1, p.diveT = 0;
        let half = team.dir > 0;
        for (let p of team.players)
          half && p.x > PITCH.w / 2 - 2 && (p.x = PITCH.w / 2 - 2 - (p.role === "FWD" ? 3 : 8)), !half && p.x < PITCH.w / 2 + 2 && (p.x = PITCH.w / 2 + 2 + (p.role === "FWD" ? 3 : 8));
      }
      let takers = this.teams[kickoffSide].players, taker = takers.find((p) => p.role === "FWD") || takers.find((p) => p.role === "MID") || takers[takers.length - 1];
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
      this.locked && this.lockSeats(), this.parkedAny && this.repark();
      for (let team of this.teams)
        for (let p of team.players)
          p.downT > 0 && (p.downT = Math.max(0, p.downT - dt), p.vx *= 0.82, p.vy *= 0.82);
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
          this.phase === "goal" && this.resetPositions((_b = this.pendingKickoff) != null ? _b : 0), this.phase === "half" && (this.half = 2, this.resetPositions(0), this.adaptAI(!0)), this.startPlay();
        }
        return;
      }
      if (this.t += dt, this._dt = dt, this.t / Math.max(1, this.duration) > 0.8 && (this._adaptT = (this._adaptT || 0) - dt, this._adaptT <= 0 && (this._adaptT = 5, this.adaptAI(!1))), this.updateMomentum(dt), this.half === 1 && this.t >= this.duration / 2) {
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
          this.lastOwnerTeam !== null && ownHalf && (this.possessT || 0) > 2.5 && this.t - (this.lastCounterAt || -99) > 12 && (this.teams[t].counterT = 2.8 * this.buildUpOf(t).counter, this.lastCounterAt = this.t, this.cue("counter", t)), this.lastOwnerTeam = t, this.possessT = 0;
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
          p.touchLock = Math.max(0, p.touchLock - dt), p.stumble = Math.max(0, p.stumble - dt), p.slide = Math.max(0, p.slide - dt), p.skillT = Math.max(0, (p.skillT || 0) - dt), p.spinT > 0 && (p.spinT = Math.max(0, p.spinT - dt)), p.burst && (p.burst.t -= dt, p.burst.t <= 0 && (p.vx += p.burst.vx, p.vy += p.burst.vy, p.burst = null)), !this.isControlled(p) && this.think(p, dt);
      for (let team of this.teams)
        for (let p of team.players)
          this.integrate(p, dt), this.fatigue(p, dt);
      this.separate(), this.updateBall(dt), this.switchOnPossession(), this.locked && this.lockSeats(), this.parkedAny && this.repark();
    }
    /**
     * Practice (v82): take players out of the game entirely — the practice arena
     * parks the opposition bar the keeper. A parked man stands far off the
     * pitch and is put back there every step, so no AI, tackle or pickup ever
     * reaches him. Offside goes with them.
     */
    park(teamIdx, test = (p) => p.role !== "GK") {
      for (let p of this.teams[teamIdx].players) test(p) && (p.parked = !0);
      this.parkedAny = !0, this.noOffside = !0, this.repark();
    }
    repark() {
      if (this.phase !== "freekick")
        for (let t of this.teams) for (let p of t.players) p.parked && (p.x = -300, p.y = -300, p.vx = p.vy = 0);
    }
    /**
     * Player lock (v81, the Player Career): a seat with `lockId` only ever
     * steers that one footballer. Returns false when he is not on the pitch
     * (subbed off, or not picked) — the match plays on without a stick.
     */
    lockPlayer(cardId, seat = this.controllers[0]) {
      return seat ? (seat.lockId = cardId, this.locked = !0, this.lockSeats()) : !1;
    }
    lockSeats() {
      let ok = !0;
      for (let c of this.controllers) {
        if (!c.lockId) continue;
        let i = this.teams[c.team].players.findIndex((p) => p.ref.id === c.lockId);
        i >= 0 ? (c.activeIdx = i, c.benched = !1) : (c.benched = !0, ok = !1);
      }
      return ok;
    }
    /** The locked footballer, or null. */
    lockedPlayer(c = this.controllers[0]) {
      return c != null && c.lockId && this.teams[c.team].players.find((p) => p.ref.id === c.lockId) || null;
    }
    /**
     * Control follows the ball whenever your side has it — including a teammate
     * receiving your pass. Off the ball nothing moves on its own; you pick with L1/R1.
     */
    switchOnPossession() {
      let o = this.ball.owner;
      if (!o) return;
      let seats = this.controllers.filter((c) => c.team === o.team && !c.lockId);
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
      return !p || !incoming || this.cameOff(incoming.id) || p.role === "GK" && incoming.position !== "GK" ? !1 : (this.tally(p, "dist", 0), this.pst[p.ref.id].off = this.t, team.bench[benchIdx] = p.ref, p.ref = incoming, Object.assign(p, attributesOf(incoming)), p.touchLock = 0, p.stumble = 0, p.slide = 0, p.downT = 0, p.diveT = 0, p.injured = !1, p.skillT = 0, p.spinT = 0, p.burst = null, p.skillKind = null, team.subsLeft -= 1, this.tally(p, "dist", 0), this.pst[incoming.id] && (this.pst[incoming.id].on = this.t), this.cue("whistle"), !0);
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
      let pr = this.pst[p.ref.id];
      pr ? pr.dist += Math.hypot(p.vx, p.vy) * dt : this.tally(p, "dist", 0), p.slide > 0 ? (p.x += p.vx * dt, p.y += p.vy * dt, p.vx *= 0.94, p.vy *= 0.94) : (p.x += p.vx * dt, p.y += p.vy * dt), p.x = clamp2(p.x, 0.5, PITCH.w - 0.5), p.y = clamp2(p.y, 0.5, PITCH.h - 0.5);
      let sp = Math.hypot(p.vx, p.vy);
      sp > 0.6 && (p.dirX = p.vx / sp, p.dirY = p.vy / sp);
    }
    /**
     * Movement with momentum (v79).
     *
     * The old model lerped the velocity at nine per second, which let anyone
     * turn on a dime at full sprint — the single thing that most made the game
     * feel like pushing counters. Now a player's heading swings round at his own
     * turn rate, and much slower the faster he is going; asked to go back the
     * way he came at speed he plants a foot and brakes first; and he gets up to
     * speed at his own acceleration. A quick, balanced player cuts; a big one
     * carries on past you.
     */
    /**
     * The person's player (v84 hotfix). The v79 model below — a turn rate that
     * shrinks with speed, a planted foot for a sharp change — is right for the
     * CPU's players and was wrong for the one under a thumb: a 180° at a jog
     * took 1.7 s, swinging out wide, and the player felt like a brick. Here the
     * velocity chases the stick directly, so any direction, straight back
     * included, is where the player goes within a few frames; the only weight
     * left is a slight softening at full sprint. `responsiveness` (Settings →
     * Controls, 0–1) scales the rates.
     */
    driveHuman(p, dx, dy, dt, factor = 1) {
      if (p.slide > 0 || p.downT > 0) return;
      let m = Math.min(1, Math.hypot(dx, dy)), tired = 0.9 + p.stamina * 0.1, speed = p.maxSpeed * factor * tired * (p.stumble > 0 ? 0.6 : 1), L3 = Math.hypot(dx, dy) || 1, push2 = Math.max(0.35, Math.min(1, (m - 0.08) / 0.42)), tx = m > 1e-3 ? dx / L3 * speed * push2 : 0, ty = m > 1e-3 ? dy / L3 * speed * push2 : 0, R = this.responsiveness, cur = Math.hypot(p.vx, p.vy), frac = factor > 1.05 ? Math.min(1, cur / (p.maxSpeed * factor)) : 0;
      p.humanMom = (p.humanMom || 0) + (frac - (p.humanMom || 0)) * (1 - Math.exp(-(frac > (p.humanMom || 0) ? 2.5 : 4) * dt));
      let base = 16 + 18 * R, rate = m > 1e-3 ? base * (1 - p.humanMom * p.humanMom * (0.7 - 0.35 * R)) : base * 1.2, k = 1 - Math.exp(-rate * dt);
      p.vx += (tx - p.vx) * k, p.vy += (ty - p.vy) * k, p.planted = !1;
    }
    drive(p, dx, dy, dt, factor = 1) {
      if (p.slide > 0 || p.downT > 0) return;
      let m = Math.hypot(dx, dy), tired = 0.82 + p.stamina * 0.18, speed = p.maxSpeed * factor * tired * (p.stumble > 0 ? 0.45 : 1), cur = Math.hypot(p.vx, p.vy), tx = m > 1e-3 ? dx / m * speed : 0, ty = m > 1e-3 ? dy / m * speed : 0;
      if (p.planted = !1, cur > 0.6 && m > 1e-3 && p.role !== "GK") {
        let cx = p.vx / cur, cy = p.vy / cur, wx = dx / m, wy = dy / m, dot = cx * wx + cy * wy, frac = Math.min(1, cur / p.maxSpeed);
        if (dot < -0.25 && frac > 0.7)
          tx = cx * cur * 0.3, ty = cy * cur * 0.3, p.planted = !0;
        else {
          let want = Math.atan2(wy, wx), have = Math.atan2(cy, cx), da = want - have;
          for (; da > Math.PI; ) da -= Math.PI * 2;
          for (; da < -Math.PI; ) da += Math.PI * 2;
          let omega = (p.turn || 9) * (1.6 - 0.9 * frac), maxTurn = omega * dt, a = have + clamp2(da, -maxTurn, maxTurn), side = Math.abs(Math.sin(da)), v = speed;
          side > 0.05 && m < 2 * (cur / omega) * side && (v = Math.min(speed, Math.max(1.5, m * omega / (2 * side))));
          let k2 = Math.min(1, dt * (v > cur ? p.accel || 9 : 11)), nv = cur + (v - cur) * k2;
          p.vx = Math.cos(a) * nv, p.vy = Math.sin(a) * nv;
          return;
        }
      }
      let faster = tx * tx + ty * ty > cur * cur, k = Math.min(1, dt * (faster ? p.accel || 9 : 11));
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
            let push2 = (2.1 - d2) / 2, wa = 0.5;
            if (a.team !== b.team && a.role !== "GK" && b.role !== "GK") {
              let sa = a.strength || 70, sb = b.strength || 70;
              wa = clamp2(sb / (sa + sb), 0.2, 0.8), this.duel(a, b, sa, sb, d2);
            }
            a.x -= dx / d2 * push2 * 2 * wa, a.y -= dy / d2 * push2 * 2 * wa, b.x += dx / d2 * push2 * 2 * (1 - wa), b.y += dy / d2 * push2 * 2 * (1 - wa);
          }
        }
      this.protectKeeper();
    }
    /**
     * A shoulder duel between two opponents in contact (v79). Only when the ball
     * is at stake: one of them has it, or it is loose between them. The weaker
     * can stumble; a carrier who does loses it, and the ball runs on loose; and a
     * strong man arriving from behind can be penalised for the push.
     */
    duel(a, b, sa, sb, d2) {
      var _a;
      let ball = this.ball, carrier = ball.owner === a ? a : ball.owner === b ? b : null, loose = !ball.owner && dist(a, ball) < 3 && dist(b, ball) < 3;
      if (!carrier && !loose) return;
      let dt = this._dt || 1 / 60;
      if (carrier) {
        let def = carrier === a ? b : a, cs = Math.hypot(carrier.vx, carrier.vy), ds = Math.hypot(def.vx, def.vy), beaten = (def.x - carrier.x) * (carrier.dirX || 0) + (def.y - carrier.y) * (carrier.dirY || 0) < 0.3;
        if (cs > ds + 0.6 && beaten && def.downT <= 0 && Math.random() < (0.7 + this.aggressionOf(def) * 1.6) * (this.inPenaltyArea(carrier, def.team) ? TUNE.boxCare : 1) * dt) {
          this.fouls[def.team] += 1, this.cue("foul", def), carrier.downT = 1.2, carrier.downMax = 1.2, carrier.stumble = Math.max(carrier.stumble, 1.6), this.aggressionOf(def) > 0.75 && def.cards < 1 && Math.random() < 0.3 && (def.cards += 1, this.cue("card", def), this.bookings.push({ team: def.team, name: def.ref.name, minute: this.minute() })), this.inPenaltyArea(carrier, def.team) ? this.awardPenalty(1 - def.team, def) : this.awardFreeKick(1 - def.team, carrier, def);
          return;
        }
      }
      if (carrier) {
        let edge2 = Math.min(carrier.y, PITCH.h - carrier.y);
        if (edge2 < 7 && Math.random() < (1.4 - edge2 * 0.15) * dt) {
          let def = carrier === a ? b : a, off = Math.random() < 0.5 ? carrier : def;
          ball.owner = null, ball.lastTouch = off, ball.noTouch = 0.4, ball.vx = carrier.vx * 0.5, ball.vy = (carrier.y < CY ? -1 : 1) * (4 + Math.random() * 3), carrier.touchLock = 0.4, this.cue("jostle", carrier);
          return;
        }
      }
      let [weak, strong] = sa < sb ? [a, b] : [b, a], edge = Math.abs(sa - sb) / 100;
      weak.stumble <= 0 && Math.random() < (0.35 + edge * 2.2) * dt && (weak.stumble = 0.3 + edge, this.cue("jostle", weak), carrier === weak && (ball.owner = null, ball.lastTouch = weak, ball.noTouch = 0.12, ball.vx = weak.vx * 0.9 + (strong.dirX || 0) * 1.5, ball.vy = weak.vy * 0.9 + (strong.dirY || 0) * 1.5, weak.touchLock = 0.35, strong.dirX * weak.dirX + strong.dirY * weak.dirY > 0.55 && (strong.x - weak.x) * weak.dirX + (strong.y - weak.y) * weak.dirY < 0 && Math.random() < (0.35 + this.aggressionOf(strong) * 0.4 - ((_a = strong.tr) != null && _a.rock ? 0.2 : 0)) * (this.inPenaltyArea(weak, strong.team) ? TUNE.boxCare : 1) && (this.fouls[strong.team] += 1, this.cue("foul", strong), weak.downT = 0.9, weak.downMax = 0.9, this.inPenaltyArea(weak, strong.team) ? this.awardPenalty(1 - strong.team, strong) : this.awardFreeKick(1 - strong.team, weak, strong))));
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
      var _a, _b, _c;
      if (c.ai || c.benched) return;
      let p = this.playerOf(c);
      if (!p) return;
      let raw = input.axis(), B = this.basis, fwd = -raw.y, aim = B ? { x: B.rx * raw.x + B.fx * fwd, y: B.ry * raw.x + B.fy * fwd } : { x: raw.x, y: fwd };
      if (this.driveHuman(p, aim.x, aim.y, dt, input.held("sprint") ? 1.24 : 1), input.pressed("switch") && this.cycleActive(c), this.ball.owner === p) {
        if (input.held("pass") && (c.passCharge = Math.min(1, c.passCharge + dt / 0.7)), input.released("pass") && (this.pass(p, aim, !1, Math.max(0.3, c.passCharge)), c.passCharge = 0), input.pressed("through")) this.pass(p, aim, !0, 0.5);
        else if (input.pressed("lob") && !input.held("skill")) this.pass(p, aim, !0, 0.55, !0);
        else if (input.pressed("cross")) {
          let back = aim.x * this.teams[p.team].dir < -0.35;
          this.cross(p, aim, back ? "cutback" : input.held("curl") ? "driven" : "floated");
        }
        let g = (_a = input.takeGesture) == null ? void 0 : _a.call(input);
        if (g) {
          let gAim = B ? { x: B.rx * g.x + B.fx * -g.y, y: B.ry * g.x + B.fy * -g.y } : { x: g.x, y: -g.y };
          this.skillMove(p, Math.hypot(g.x, g.y) > 0.2 ? gAim : null, g.mod);
        }
        if (input.held("skill") && (c.skillMod = input.held("sprint") ? "sprint" : input.held("curl") ? "curl" : input.held("lob") ? "lob" : c.skillMod || null), input.released("skill") && (this.skillMove(p, aim, c.skillMod || null), c.skillMod = null), input.held("shoot") && (c.charge = Math.min(1, c.charge + dt / 0.85)), input.released("shoot")) {
          let curled = input.held("curl"), chip = input.held("lob");
          this.shoot(p, aim, Math.max(0.28, c.charge), {
            loft: chip ? 2.6 : curled ? 0.9 : 1,
            curl: curled ? 46 : 0,
            chip
          }), c.charge = 0;
        }
      } else
        c.charge = 0, c.passCharge = 0, (input.pressed("pass") || input.pressed("through") || input.pressed("cross") || input.pressed("shoot")) && this.tackle(p);
      this.charge = ((_b = this.controllers[0]) == null ? void 0 : _b.charge) || 0, this.passCharge = ((_c = this.controllers[0]) == null ? void 0 : _c.passCharge) || 0;
    }
    /** L1 / R1 — jump to whoever is closest to the ball, skipping the other seat's man. */
    cycleActive(c = this.controllers[0]) {
      if (!c || c.lockId) return;
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
      var _a, _b, _c;
      let shape = shapesFor()[name2];
      if (!shape || shape.length !== this.teams[teamIdx].players.length) return;
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
        if (p) {
          p.role = slot.role;
          {
            let r = (_b = (_a = team.tactics) == null ? void 0 : _a.roles) == null ? void 0 : _b[team.players.indexOf(p)];
            p.tRole = ((_c = ROLES[r]) == null ? void 0 : _c.pos) === slot.role ? r : defaultRole(p.ref, slot);
          }
          p.sx = teamIdx === 0 ? slot.x : 1 - slot.x, p.sy = teamIdx === 0 ? slot.y : 1 - slot.y;
        }
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
      var _a, _b, _c;
      let t = this.teams[teamIdx].tactics, trig = this.pressTrigger && this.pressTrigger.team === teamIdx && this.t - this.pressTrigger.t < 1.4 ? 1.35 : 1;
      return ((_a = PRESSING[t.pressing]) != null ? _a : 1) * ((_c = (_b = DEF_STYLES[t.defStyle]) == null ? void 0 : _b.press) != null ? _c : 1) * trig;
    }
    /** v79: how good the CPU's choices are — the difficulty lever, instead of better numbers. */
    decisionQuality(teamIdx) {
      return clamp2(0.66 + this.aiSkillFor(teamIdx) * 0.18, 0.7, 0.99);
    }
    buildUpOf(teamIdx) {
      return BUILD_UPS[this.teams[teamIdx].tactics.buildUp] || BUILD_UPS.balanced;
    }
    /** A person flicking to one of the five quick tactics mid-match. */
    setQuickTactic(teamIdx, id) {
      let q = QUICK_TACTICS.find((x) => x.id === id);
      return q ? (Object.assign(this.teams[teamIdx].tactics, q.set, { quick: id }), this.cue("tactic", { team: teamIdx, id, name: q.name }), !0) : !1;
    }
    /** The CPU re-reads the game: at half-time, and every few seconds in the last fifth. */
    adaptAI(atHalf) {
      let late = this.t / Math.max(1, this.duration);
      for (let [i, team] of this.teams.entries()) {
        if (team.isHuman || this.controllers.some((c) => c.team === i)) continue;
        let diff = team.score - this.teams[1 - i].score, ch = adaptFor(diff, late, atHalf);
        if (!ch) continue;
        let before = "".concat(team.tactics.mentality, "|").concat(team.tactics.defStyle);
        Object.assign(team.tactics, ch), "".concat(team.tactics.mentality, "|").concat(team.tactics.defStyle) !== before && this.cue("adapt", { team: i, ...ch });
      }
    }
    /** Only ever called at a restart, so you never lose the controlled player mid-play. */
    selectForKickoff() {
      if (!this.kickoffTaker) return;
      let seat = this.controllers.find((c) => c.team === this.kickoffSide && !c.lockId);
      if (!seat) return;
      let i = this.teams[seat.team].players.indexOf(this.kickoffTaker);
      i >= 0 && (seat.activeIdx = i), this.dedupeSeats();
    }
    /* ------------------------------- ball ------------------------------ */
    updateBall(dt) {
      var _a, _b, _c, _d, _e, _f, _g;
      let b = this.ball;
      if (b.owner) {
        let o = b.owner;
        if (b.z = 0.16, b.vz = 0, o.role === "GK") {
          if (o.holdT += dt, b.x = o.x + o.dirX * 1.1, b.y = o.y + o.dirY * 1.1, b.vx = b.vy = 0, o.holdT > (this.teams[o.team].tactics.tempo === "slow" ? 2.6 : 0.9)) {
            o.holdT = 0;
            let team = this.teams[o.team], free = team.players.filter((q) => q !== o && q.role !== "GK" && dist(q, o) < 34).map((q) => [q, this.nearestTo(1 - o.team, q)]).filter(([q, f]) => !f || dist(q, f) > 7).sort((x, y) => dist(x[0], o) - dist(y[0], o))[0];
            TUNE.keeperDist && free && Math.random() < 0.7 ? this.pass(o, { x: free[0].x - o.x, y: free[0].y - o.y }, !1, 0.45) : this.pass(o, { x: team.dir, y: (Math.random() - 0.5) * 0.5 }, !0, 0.85);
          }
          return;
        }
        let speed = Math.hypot(o.vx, o.vy), dx = b.x - o.x, dy = b.y - o.y, gap = Math.hypot(dx, dy), skill = o.ref.stats.dribbling / 100, lead = 0.85 + speed * 0.13, off = 0.34 * strongSide(o), tx = o.x + o.dirX * lead + o.dirY * off, ty = o.y + o.dirY * lead - o.dirX * off, stiff = (30 + skill * 26) * this.preset.control, damp2 = 10;
        if (b.vx += ((tx - b.x) * stiff - b.vx * damp2) * dt, b.vy += ((ty - b.y) * stiff - b.vy * damp2) * dt, b.x += b.vx * dt, b.y += b.vy * dt, o.touchT = (o.touchT || 0) - dt, o.touchT <= 0 && speed > 1.2) {
          let foe = this.nearestTo(1 - o.team, o), tight = foe && dist(o, foe) < 4 ? 0.75 : 1, push2 = (0.8 + speed * 0.26) * (1.3 - skill * 0.4);
          b.vx += o.dirX * push2, b.vy += o.dirY * push2, o.touchT = (0.3 + Math.random() * 0.16) * tight * (1.25 - skill * 0.33), this.cue("touch");
        }
        b.lastTouch = o, (b.x < 0.4 || b.x > PITCH.w - 0.4 || b.y < 0.4 || b.y > PITCH.h - 0.4) && (b.owner = null, o.touchLock = 0.3, b.vx = o.vx, b.vy = o.vy, (b.x < 0.4 || b.x > PITCH.w - 0.4) && Math.abs(b.y - CY) < GOAL_HALF + 0.3 && (b.y = CY + Math.sign(b.y - CY || 1) * (GOAL_HALF + 0.4)), this.bounds());
        return;
      }
      if (b.curl) {
        let sp = Math.hypot(b.vx, b.vy);
        if (sp > 1.5) {
          let k = b.curl * sp / 58, vx0 = b.vx, vy0 = b.vy;
          b.vx += -vy0 / sp * k * dt, b.vy += vx0 / sp * k * dt;
        }
        b.curl *= Math.pow(0.5, dt), b.z <= 0 && (b.curl = 0);
      }
      if (b.z > 0.05) {
        if (b.dip && (b.vz -= GRAV * b.dip * dt), b.knuckle) {
          let sp = Math.hypot(b.vx, b.vy) || 1;
          b.knT = (b.knT || 0) + dt;
          let w = Math.sin(b.knT * 11 + (b.knPh || 0)) * b.knuckle;
          b.vx += -b.vy / sp * w * dt, b.vy += b.vx / sp * w * dt;
        }
      } else
        b.dip = 0, b.knuckle = 0;
      b.px = b.x, b.py = b.y, b.pz = b.z, b.x += b.vx * dt, b.y += b.vy * dt, b.z += b.vz * dt, b.vz -= GRAV * dt, b.z <= 0 && (b.z = 0, b.vz < -1.2 ? (b.vz = -b.vz * ((_b = (_a = FIELD.ball) == null ? void 0 : _a.bounce) != null ? _b : 0.42), b.vx *= 0.8, b.vy *= 0.8) : b.vz = 0);
      let damp = Math.pow(b.z > 0.4 ? 0.9985 : (_d = (_c = FIELD.ball) == null ? void 0 : _c.drag) != null ? _d : 0.986, dt * 60);
      if (b.vx *= damp, b.vy *= damp, b.z === 0 && Math.hypot(b.vx, b.vy) < 0.5 && (b.vx = 0, b.vy = 0), b.noTouch = Math.max(0, (b.noTouch || 0) - dt), b.noTouch > 0) {
        this.bounds();
        return;
      }
      let best = null, bestD = 1 / 0;
      if (b.z < 2.5)
        for (let team of this.teams)
          for (let p of team.players) {
            if (p.touchLock > 0) continue;
            let r = p.role === "GK" ? (p.diveT > 0 ? 2.6 : 1.68) * Math.min(1, 0.45 + 0.55 * GOAL_HALF / 5.5) : p.slide > 0 ? 2.2 : b.z > 0.8 ? 2.15 : 1.7;
            if ((_e = p.tr) != null && _e.anchor && !b.owner && b.lastTouch && b.lastTouch.team !== p.team && b.z < 1 && (r *= 1 + 0.18 * p.tr.anchor), p.role !== "GK") {
              let outward = b.y < CY ? -b.vy : b.vy;
              Math.min(b.y, PITCH.h - b.y) < 1.6 && outward > 1.5 && (r *= 0.45);
            }
            let d2 = dist(p, b);
            d2 < r && d2 < bestD && (bestD = d2, best = p);
          }
      if (best && this.offsideWatch) {
        let w = this.offsideWatch;
        if (best.team !== w.team) this.offsideWatch = null;
        else if (w.ids.has(best)) {
          this.offsideWatch = null, this.offsides[best.team] += 1, this.cue("offside", best), this.awardFreeKick(1 - best.team, best, null);
          return;
        } else best !== b.lastTouch && (this.offsideWatch = null);
      }
      if (best) {
        let speed = Math.hypot(b.vx, b.vy), limit = best.role === "GK" ? 70 : 15 + best.ref.stats.dribbling * 0.17;
        if (speed > limit) {
          if (bestD < 1.7) {
            b.shotBy && b.shotBy.team !== best.team && (b.shotBy = null, this.cue("block", best));
            let a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 2.2, s = speed * 0.42;
            b.vx = Math.cos(a) * s, b.vy = Math.sin(a) * s, b.lastTouch = best, best.touchLock = 0.3;
          }
        } else if (best.role === "GK" && b.shotBy && best.team !== b.shotBy.team) {
          if (this.teams[b.shotBy.team].onTarget++, !this.keeperContact(best, speed)) return;
          b.shotBy = null, b.owner = best, b.lastTouch = best, best.holdT = 0, best.diveT = 0;
        } else {
          b.shotBy = null;
          let t9 = this.teams[best.team], goalX9 = t9.dir > 0 ? PITCH.w : 0, toGoal9 = Math.hypot(goalX9 - best.x, CY - best.y), attacking = best.role !== "GK" && toGoal9 < 19 && (!b.lastTouch || b.lastTouch.team === best.team || b.lastTouch.role === "GK" || !0);
          if (attacking && b.z > 1.95 && best.stars >= 4 && Math.random() < 0.3 && (best.dirX * (goalX9 - best.x) < 0 || Math.random() < 0.35)) {
            b.lastTouch = best, this.cue("bicycle", best), best.spinT = 0.7, this.shoot(best, { x: 0, y: (Math.random() - 0.5) * 1.4 }, 0.8, { loft: 0.35, placed: !0 }), this.ball.shotKind = "bicycle";
            return;
          }
          if (best.role !== "GK" && Math.hypot((t9.dir > 0 ? 0 : PITCH.w) - best.x, CY - best.y) < 20 && b.z > 0.85 && b.lastTouch && b.lastTouch.team !== best.team) {
            if (b.lastTouch = best, b.owner = null, b.noTouch = 0.2, best.touchLock = 0.3, this.cue("header"), Math.random() < 0.22 && Math.abs(best.y - CY) > 3) {
              let away = Math.sign(best.y - CY);
              b.vx = -t9.dir * (4 + Math.random() * 4), b.vy = away * (6 + Math.random() * 5), b.vz = 3 + Math.random() * 2;
            } else {
              let a = Math.atan2((Math.random() - 0.5) * 1.8, t9.dir), sp = 12 + Math.random() * 8;
              b.vx = Math.cos(a) * sp, b.vy = Math.sin(a) * sp, b.vz = 4 + Math.random() * 3;
            }
            b.shotBy = null;
            return;
          }
          if (attacking && b.z > 0.85) {
            let jump = 2.25 + (((_f = best.tr) == null ? void 0 : _f.aerial) || 0) * 0.3 + (best.ref.stats.physical - 70) / 100, timing = clamp2(1 - Math.abs(b.z - Math.min(jump, 1.9)) / 1.2, 0.2, 1);
            b.lastTouch = best, this.cue("header"), this.shoot(best, { x: 0, y: (Math.random() - 0.5) * 1.5 }, 0.5 + timing * 0.28, { loft: 0.2, placed: !0, sloppy: 1 - timing + ((_g = best.tr) != null && _g.aerial ? -0.2 : 0) });
            return;
          }
          if (attacking && b.z > 0.42 && b.z <= 0.85 && toGoal9 < 17 && Math.random() < 0.7) {
            b.lastTouch = best, this.cue("volley", best), this.shoot(best, { x: 0, y: (Math.random() - 0.5) * 1.6 }, 0.85, { loft: 0.45, placed: !0, sloppy: 0.5 }), this.ball.shotKind = "volley";
            return;
          }
          if (best.role !== "GK" && (!b.lastTouch || b.lastTouch !== best)) {
            let foe = this.nearestTo(1 - best.team, best), tight = foe && dist(foe, best) < 2.6 ? 0.28 : 0, hard = Math.max(0, speed - 9) / 19 + (b.z > 0.45 ? 0.26 : 0) + tight, heavy = clamp2(hard - (best.control || 0.7) * 0.6 * this.preset.control, 0, 0.55);
            if (Math.random() < heavy) {
              let a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 1.3, sp = Math.max(3.5, speed * (0.32 + Math.random() * 0.22));
              b.vx = Math.cos(a) * sp, b.vy = Math.sin(a) * sp, b.vz = Math.max(0, b.vz) * 0.3, b.lastTouch = best, b.noTouch = 0.22, best.touchLock = 0.4, this.pressTrigger = { team: 1 - best.team, t: this.t }, this.cue("heavyTouch", best), this.bounds();
              return;
            }
          }
          b.passer && b.passer.team !== best.team && (b.passer = null), b.owner = best, b.lastTouch = best, best.holdT = 0;
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
      let b = this.ball, R = 0.11 + 0.11, px = Number.isFinite(b.px) ? b.px : b.x, py0 = Number.isFinite(b.py) ? b.py : b.y, pz = Number.isFinite(b.pz) ? b.pz : b.z, ex = b.x, ey = b.y, ez = b.z, jump = Math.hypot(ex - px, ey - py0), sx = jump > 4 ? ex : px, sy = jump > 4 ? ey : py0, sz = jump > 4 ? ez : pz;
      for (let gx of [0, PITCH.w]) {
        if (Math.abs(b.x - gx) > 2.6 && Math.abs(sx - gx) > 2.6) continue;
        let inw = gx === 0 ? -1 : 1;
        if ((ex - gx) * inw > -0.4 && (sx - gx) * inw < 0 && Math.abs(b.vx) > 0.01) {
          let t = (gx + inw * 0.3 - sx) / (ex - sx || 1e-6);
          t > 1 && (ex = sx + (ex - sx) * t, ey = sy + (ey - sy) * t, ez = sz + (ez - sz) * t);
        }
        let dx = ex - sx, dy = ey - sy, L22 = dx * dx + dy * dy;
        for (let py of [CY - GOAL_HALF, CY + GOAL_HALF]) {
          let hx, hy, hz;
          if (L22 < 1e-8) {
            if (Math.hypot(ex - gx, ey - py) > R) continue;
            hx = ex, hy = ey, hz = ez;
          } else {
            let fx = sx - gx, fy = sy - py, bq = 2 * (fx * dx + fy * dy), cq = fx * fx + fy * fy - R * R, t;
            if (cq <= 0) t = 0;
            else {
              let disc = bq * bq - 4 * L22 * cq;
              if (disc < 0 || (t = (-bq - Math.sqrt(disc)) / (2 * L22), t < 0 || t > 1)) continue;
            }
            hx = sx + dx * t, hy = sy + dy * t, hz = sz + (ez - sz) * t;
          }
          if (hz > GOAL_HEIGHT + 0.1) continue;
          let nx = hx - gx, ny = hy - py, d2 = Math.hypot(nx, ny);
          d2 < 1e-4 ? (nx = -inw, ny = 0) : (nx /= d2, ny /= d2);
          let vn = b.vx * nx + b.vy * ny;
          if (!(vn > 0))
            return b.vx -= 2 * vn * nx, b.vy -= 2 * vn * ny, b.vx *= 0.62, b.vy *= 0.62, b.x = gx + nx * (R + 0.01), b.y = py + ny * (R + 0.01), b.z = Math.max(0, hz), b.px = b.x, b.py = b.y, b.pz = b.z, b.curl = 0, b.shotBy = null, this.cue("post"), !0;
        }
        if ((sx - gx) * inw < R && (ex - gx) * inw > -R) {
          let tx = Math.abs(ex - sx) > 1e-6 ? clamp2((gx - sx) / (ex - sx), 0, 1) : 1, cy = sy + (ey - sy) * tx, cz = sz + (ez - sz) * tx;
          if (Math.abs(cy - CY) < GOAL_HALF + 0.2 && Math.abs(cz - GOAL_HEIGHT) < 0.22 && b.vz > -40)
            return b.vz = -Math.abs(b.vz) * 0.55 - 1.2, b.vx *= 0.7, b.vy *= 0.7, b.x = gx - inw * (R + 0.02), b.y = cy, b.z = GOAL_HEIGHT - 0.24, b.px = b.x, b.py = b.y, b.pz = b.z, b.curl = 0, b.shotBy = null, this.cue("post"), !0;
        }
      }
      return !1;
    }
    bounds() {
      let b = this.ball;
      if (!b.inNet && this.hitFrame()) return;
      let attackerSide = b.lastTouch ? b.lastTouch.team : 0;
      if (!(FIELD.walls && this.walls())) {
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
    }
    /**
     * The street cage (v82): the ball comes back off the walls instead of going
     * out. Between the posts it is still a goal. A carried ball is simply held
     * at the wall. Returns true when the wall dealt with it.
     */
    walls() {
      let b = this.ball, e = 0.62, hit = !1, inMouth = Math.abs(b.y - CY) < GOAL_HALF && b.z < GOAL_HEIGHT;
      return b.y < 0.4 ? (b.y = 0.4, b.vy = Math.abs(b.vy) * e, hit = !0) : b.y > PITCH.h - 0.4 && (b.y = PITCH.h - 0.4, b.vy = -Math.abs(b.vy) * e, hit = !0), inMouth || (b.x < 0.4 ? (b.x = 0.4, b.vx = Math.abs(b.vx) * e, hit = !0) : b.x > PITCH.w - 0.4 && (b.x = PITCH.w - 0.4, b.vx = -Math.abs(b.vx) * e, hit = !0)), hit ? (b.owner && (b.vx = b.owner.vx, b.vy = b.owner.vy), b.shotBy && (this.cue("shotWide", b.shotBy), b.shotBy = null), this.wallHits = (this.wallHits || 0) + 1, b.lastTouch && !b.owner && this.styleEvent(b.lastTouch, "walls", 10), this.cue("wall"), !0) : !1;
    }
    /** Record a dead-ball restart. Called by bounds() and scoreGoal, read by whoever polls. */
    markStoppage(kind) {
      this.offsideWatch = null, this.stoppages += 1, this.stoppage = kind, this.autoSubInjured(0), this.autoSubInjured(1);
    }
    /**
     * Corner kick. Everyone is placed for the set piece, then the taker whips it
     * in when the phase timer expires.
     */
    startCorner(attacking, cornerY, cornerX) {
      let b = this.ball, atk = this.teams[attacking], def = this.teams[1 - attacking];
      b.x = cornerX < PITCH.w / 2 ? 0.6 : PITCH.w - 0.6, b.y = cornerY < CY ? 0.6 : PITCH.h - 0.6, b.z = 0, b.vx = b.vy = b.vz = 0, b.owner = null, b.curl = 0, b.shotBy = null;
      let goalX = cornerX < PITCH.w / 2 ? 0 : PITCH.w, inw = goalX < PITCH.w / 2 ? 1 : -1, taker = namedTaker(atk, "corner") || atk.players.filter((p) => p.role !== "GK").sort((a, z) => Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(z.x - b.x, z.y - b.y))[0];
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
      var _a;
      this.markStoppage("goal");
      let team = this.teams[side];
      if (FIELD.street) {
        let st = this.styleOf(side), hot = this.t - st.last < 6;
        st.points += 100 + (hot ? 50 * st.chain : 0), st.goals += 1, hot && st.chain >= 2 && (st.stylish += 1), st.chain = 0;
      }
      team.score++, (this.ball.shotBy && this.ball.shotBy.team === side || !this.ball.shotBy && ((_a = this.ball.lastTouch) == null ? void 0 : _a.team) === side) && team.onTarget++, this.ball.shotBy = null;
      let scorer = this.ball.lastTouch && this.ball.lastTouch.team === side ? this.ball.lastTouch : null, assist = this.ball.passer && this.ball.passer.team === side && this.ball.passer !== scorer ? this.ball.passer : null;
      scorer && team.scorers.push({ name: scorer.ref.name, id: scorer.ref.id, assist: (assist == null ? void 0 : assist.ref.id) || null, assistName: (assist == null ? void 0 : assist.ref.name) || null, minute: this.minute() }), this.feed.unshift("".concat(this.minute(), "'  ").concat(team.short, " — ").concat(scorer ? scorer.ref.name : "own goal")), this.banner = "GOAL", this.goalTeam = side, this.phase = "goal", this.phaseT = 4.2, this.cue("goal"), this.cue("net"), this.pendingKickoff = 1 - side, this.celebrant = scorer, this.celebT = 0, this.scorerName = scorer ? scorer.ref.name : "Own goal";
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
      b.owner = null, b.lastTouch = p, b.shotBy = null, b.noTouch = 0.13, b.curl = 0, b.dip = 0, b.knuckle = 0, b.shotId = (b.shotId || 0) + 1, b.vx = vx, b.vy = vy, b.vz = vz, b.x = clamp2(p.x + p.dirX * 1.3, 0.5, PITCH.w - 0.5), b.y = clamp2(p.y + p.dirY * 1.3, 0.5, PITCH.h - 0.5), b.z = vz > 0 ? 0.35 : b.z, p.touchLock = 0.3;
    }
    /**
     * Lofted ball forward. Inside crossing range it hangs one up in the box for a
     * header; from deeper it becomes a long diagonal to the furthest teammate in
     * range rather than a rocket at the opponent's area from your own half.
     */
    /**
     * A clearance (v79): high and long, angled towards the touchline on his own
     * side, with the error of a ball hit in a hurry. It is meant to be safe, not
     * accurate — which is why so many of them end up in the stand.
     */
    clear(p) {
      let team = this.teams[p.team], side = Math.sign(p.y - CY) || (Math.random() < 0.5 ? -1 : 1), ownX = team.dir > 0 ? 0 : PITCH.w;
      if (Math.abs(p.x - ownX) < 10 && Math.abs(p.y - CY) > GOAL_HALF + 3 && Math.random() < 0.3) {
        this.cue("clear", p), this.release(p, -team.dir * (6 + Math.random() * 6), side * (3 + Math.random() * 5), 3), this.ball.noTouch = 0.3;
        return;
      }
      let a = Math.atan2(side * (0.55 + Math.random() * 0.65), team.dir) + (Math.random() - 0.5) * 0.5, sp = 24 + Math.random() * 9 + p.ref.stats.physical * 0.04;
      this.cue("clear", p), this.release(p, Math.cos(a) * sp, Math.sin(a) * sp, 6 + Math.random() * 3), this.ball.noTouch = 0.3;
    }
    cross(p, aim, kind = "floated") {
      var _a;
      this.tally(p, "passes");
      let team = this.teams[p.team], goalX = team.dir > 0 ? PITCH.w : 0;
      if (kind === "cutback") {
        let best2 = null, bd = 1 / 0, spot = { x: goalX - team.dir * 12, y: CY };
        for (let t of team.players) {
          if (t === p || t.role === "GK") continue;
          let d2 = Math.hypot(t.x - spot.x, t.y - spot.y);
          d2 < bd && d2 < 14 && (bd = d2, best2 = t);
        }
        if (best2) {
          this.cue("cutback", p), this.noteOffside(p);
          let dx2 = best2.x + best2.vx * 0.5 - p.x, dy2 = best2.y + best2.vy * 0.5 - p.y, dd = Math.hypot(dx2, dy2) || 1, sp = clamp2(dd * 1.2 + 10, 14, 30);
          this.release(p, dx2 / dd * sp, dy2 / dd * sp), this.ball.passer = p;
          return;
        }
        kind = "driven";
      }
      let aimY = aim && Math.abs(aim.y) > 0.2 ? CY + aim.y * 9 : p.y > CY ? CY - 5 : CY + 5, RANGE = 40, tx = goalX - team.dir * 9, ty = aimY, best = null, bestD = 1 / 0;
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
      let cerr = (1.1 - p.ref.stats.passing / 100) * 14 * (kind === "driven" ? 0.7 : 1);
      tx += team.dir * (Math.random() * 1.3 - 0.3) * cerr, ty += (Math.random() - 0.5) * cerr;
      let dx = tx - p.x, dy = ty - p.y, D = Math.hypot(dx, dy) || 1, T = kind === "driven" ? clamp2(D / 27, 0.45, 1.3) : clamp2(D / 20, 0.6, 1.9);
      this.cue("cross"), this.ball.passer = p;
      let blocker = this.teams[1 - p.team].players.find((q) => q.role !== "GK" && dist(q, p) < 2.6 && (q.x - p.x) * (tx - p.x) + (q.y - p.y) * (ty - p.y) > 0);
      if (blocker && Math.random() < 0.45) {
        this.cue("block", blocker);
        let b0 = this.ball;
        this.release(p, 0, 0, 0), b0.lastTouch = blocker, b0.vx = team.dir * (4 + Math.random() * 4), b0.vy = (p.y < CY ? -1 : 1) * (4 + Math.random() * 4), b0.vz = 2 + Math.random() * 2, b0.noTouch = 0.25;
        return;
      }
      this.noteOffside(p), this.release(p, dx / T, dy / T, 0.5 * GRAV * T * (kind === "driven" ? 0.62 : 1)), this.ball.noTouch = 0.26, kind === "driven" && ((_a = p.tr) != null && _a.deadball) && (this.ball.curl = (Math.sign(CY - p.y) || 1) * 18);
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
      var _a, _b, _c, _d;
      this.tally(p, "passes");
      let team = this.teams[p.team], reach = 14 + power * 44, ax = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.x : p.dirX, ay = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.y : p.dirY, am = Math.hypot(ax, ay) || 1;
      ax /= am, ay /= am;
      let best = null, bestScore = -1 / 0;
      for (let t of team.players) {
        if (t === p) continue;
        let dx2 = t.x - p.x, dy2 = t.y - p.y, d3 = Math.hypot(dx2, dy2);
        if (d3 < 3 || d3 > reach) continue;
        let align = dx2 / d3 * ax + dy2 / d3 * ay, forward = (t.x - p.x) * team.dir / 40, wideBonus = Math.abs(t.y - CY) / CY * ((_b = (_a = team.tactics) == null ? void 0 : _a.width) != null ? _b : 0.5) * 0.9, score = align * 2.6 - d3 / 45 + forward * (through ? 1.2 : 0.5) + wideBonus + (t.role === "GK" ? -2.5 : 0) + (this.isOffside(t) ? -1.5 : 0);
        score > bestScore && (bestScore = score, best = t);
      }
      if (this.cue("pass"), this.ball.passer = p, !best) {
        let punt = (16 + power * 22) * this.preset.passSpeed;
        this.release(p, ax * punt, ay * punt);
        return;
      }
      let tx = best.x, ty = best.y;
      if (through) {
        let lead = 5 + power * 12;
        tx += team.dir * lead, ty += best.vy * 0.4 * (lead / 9);
      }
      if (this.noteOffside(p), (best.x - p.x) * team.dir < -4 && (best.role === "DEF" || best.role === "GK") && (this.pressTrigger = { team: 1 - p.team, t: this.t }), p.role !== "DEF" && p.role !== "GK" && (best.x - p.x) * team.dir > 2 && Math.random() < 0.45) {
        let third = null, td = 1 / 0;
        for (let q of team.players) {
          if (q === p || q === best || q.role === "GK" || q.role === "DEF") continue;
          let dq = dist(q, best);
          dq < td && dq < 20 && (td = dq, third = q);
        }
        third && (third.thirdUntil = 1.8, third.thirdX = this.onsideX(team, best.x + team.dir * 14, Math.random() < 0.35 ? 2.2 : 0), third.thirdY = clamp2(best.y + (third.y > best.y ? 7 : -7), 5, PITCH.h - 5));
      }
      let dx = tx - p.x, dy = ty - p.y, d2 = Math.hypot(dx, dy) || 1, foeP = this.nearestTo(1 - p.team, p), hurried = foeP && dist(foeP, p) < 2.4 ? 1.55 : 1, pinged = (_c = p.tr) != null && _c.pinged && d2 > 22 ? 1 - 0.25 * p.tr.pinged : 1, err = (100 - p.ref.stats.passing) / 100 * (0.13 + power * 0.1) * (this.weakFoot(p) ? 1.55 : 1) * (2 - this.formOf(p)) * hurried * pinged * (1 + Math.max(0, d2 - 22) / 20) * (Math.random() - 0.5) * 2, c = Math.cos(err), s = Math.sin(err), nx = (dx * c - dy * s) / d2, ny = (dx * s + dy * c) / d2, speed = clamp2((d2 * 1.35 + 9) * (0.8 + power * 0.6) * this.preset.passSpeed * ((_d = p.tr) != null && _d.pinged && d2 > 22 ? 1.06 : 1), 14, 48);
      if (lob) {
        let T = clamp2(d2 / 17, 0.7, 1.7);
        this.cue("lob", p), this.release(p, nx * (d2 / T), ny * (d2 / T), 0.5 * GRAV * T), this.ball.noTouch = 0.3;
        return;
      }
      this.release(p, nx * speed, ny * speed, power > 0.8 && d2 > 24 ? 1.6 : 0), this.ball.passKind = power > 0.8 && d2 > 24 ? "driven" : "ground";
    }
    /**
     * @param {object} opts
     *   loft  multiplier on how much the strike lifts (0 = drilled along the floor)
     *   curl  bend the flight sideways; sign picked from aim, or inward towards goal
     *   placed  a header or a set piece — no weak-foot penalty, because the ball
     *           is not at anyone's feet when it is struck
     */
    shoot(p, aim, power, opts = {}) {
      var _a, _b, _c;
      this.tally(p, "shots");
      let { loft = 1, curl = 0, placed = !1, chip = !1, sloppy = 0 } = opts, team = this.teams[p.team], dx = (team.dir > 0 ? PITCH.w : 0) - p.x, dy = CY + (aim && Math.abs(aim.y) > 0.2 ? aim.y * GOAL_HALF * 0.9 : 0) - p.y, d2 = Math.hypot(dx, dy) || 1, acc = p.ref.stats.shooting / 100, weak = !placed && this.weakFoot(p), finesse = curl ? 1 - 0.22 * (((_a = p.tr) == null ? void 0 : _a.finesse) || 0) : 1, spread = ((1.05 - acc) * 0.34 + d2 / 170 + (1 - power) * 0.07) * (weak ? 1.5 : 1) * (2 - this.formOf(p)) * finesse * (1 + sloppy * 0.8) * 1.5 * Math.min(1, 0.6 + 0.4 * GOAL_HALF / 5.5);
      {
        let angle = Math.atan2(GOAL_HALF * 2 * Math.abs(dx), d2 * d2 - GOAL_HALF * GOAL_HALF) || 0.01, foe = this.nearestTo(1 - p.team, p), close = foe && dist(p, foe) < 2 ? 0.66 : 1, xg = clamp2(0.92 * Math.exp(-d2 / 11) * Math.min(1, angle / 0.9) * close, 0.02, 0.8);
        team.xg = (team.xg || 0) + xg, xg >= 0.25 && (team.bigChances = (team.bigChances || 0) + 1, this.cue("bigChance", p));
      }
      let err = (Math.random() - 0.5) * 2 * spread, c = Math.cos(err), s = Math.sin(err), nx = (dx * c - dy * s) / d2, ny = (dx * s + dy * c) / d2;
      this.cue("shot", power);
      let speed = chip ? (13 + power * 6) * (weak ? 0.93 : 1) : (23.5 + power * 19 + acc * 6) * (weak ? 0.93 : 1) * ((_b = p.tr) != null && _b.cannon && d2 > 20 ? 1.08 : 1), rise = chip ? 7.5 + power * 3 : (1.3 + power * 8.2) * loft + (curl ? 1.2 : 0);
      if (this.release(p, nx * speed, ny * speed, rise), chip && this.cue("lob", p), !chip && !curl && power > 0.75 && (this.ball.dip = 0.25 + power * 0.2), !chip && !curl && power > 0.85 && d2 > 22 && Math.random() < ((_c = p.tr) != null && _c.cannon ? 0.45 : 0.12) && (this.ball.knuckle = 2.2 + Math.random() * 1.8, this.ball.knPh = Math.random() * 6.28, this.cue("knuckle", p)), this.ball.shotKind = null, curl) {
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
      var _a;
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
        if (this.tally(p, "tackles"), owner.touchLock = 0.55, owner.stumble = 0.35, Math.random() < 0.55) {
          let a = Math.atan2(p.dirY, p.dirX) + (Math.random() - 0.5) * 2.4, sp = 4 + Math.random() * 6;
          b.owner = null, b.lastTouch = p, b.noTouch = 0.18, b.vx = Math.cos(a) * sp, b.vy = Math.sin(a) * sp, b.vz = Math.random() < 0.3 ? 1.5 : 0, p.touchLock = 0.25;
        } else
          b.owner = p, b.lastTouch = p;
      else {
        p.stumble = 0.45 + frac * 0.7;
        let chance = (0.42 + 0.7 * this.aggressionOf(p)) * Math.pow(frac, 0.85) * ((_a = p.tr) != null && _a.rock ? 1 - 0.3 * p.tr.rock : 1) * (this.inPenaltyArea(owner, p.team) ? TUNE.boxCare : 1);
        Math.random() < chance && (this.fouls[p.team] += 1, this.cue("foul", p), owner.downT = 1.1 + frac * 0.9, owner.downMax = owner.downT, owner.vx = p.dirX * 3.4, owner.vy = p.dirY * 3.4, owner.stumble = Math.max(owner.stumble, owner.downT + 0.5), !owner.injured && Math.random() < 0.125 && this.injure(owner), frac > 0.82 && p.cards < 1 && (p.cards += 1, this.cue("card", p), this.bookings.push({ team: p.team, name: p.ref.name, minute: this.minute() })), this.inPenaltyArea(owner, p.team) ? this.awardPenalty(1 - p.team, p) : this.awardFreeKick(1 - p.team, owner, p));
      }
    }
    /** A player is hurt: he stays on, diminished, until someone takes him off. */
    injure(p) {
      p.injured = !0, p.maxSpeed *= 0.62, p.stumble = Math.max(p.stumble, 0.9), this.injuries.push({ team: p.team, name: p.ref.name, id: p.ref.id, minute: this.minute() }), this.cue("injury", p);
    }
    /** Has this player already been substituted off in this match? */
    cameOff(id) {
      var _a, _b, _c;
      return ((_c = (_b = (_a = this.pst) == null ? void 0 : _a[id]) == null ? void 0 : _b.off) != null ? _c : null) !== null;
    }
    /** The CPU brings an injured man off at the next dead ball, if it can. */
    autoSubInjured(teamIdx) {
      let team = this.teams[teamIdx];
      if (team.isHuman || team.subsLeft <= 0) return;
      let i = team.players.findIndex((q) => q.injured && q.role !== "GK");
      if (i < 0) return;
      let bench = team.bench.map((r, j) => [r, j]).filter(([r]) => r && r.position !== "GK" && !this.cameOff(r.id)).sort((a, b) => b[0].overall - a[0].overall);
      if (!bench.length) return;
      let p = team.players[i];
      this.substitute(teamIdx, i, bench[0][1]) && (p.injured = !1, this.cue("sub", p));
    }
    /**
     * Skill moves. One button, four tricks, chosen by where the stick points
     * relative to the way the player faces:
     *   sideways  — the feint: a burst across a lunging tackler
     *   forward   — stepovers: the ball stands still for a beat, then a burst
     *   backward  — the roulette: a spin with the ball glued to the foot
     *   a defender within two metres ahead — the nutmeg: through the legs
     * Every one costs legs, keeps the tackler off for its duration
     * (`skillT`, see tackle), and can fail: a heavy touch that runs away from a
     * player who is not a dribbler. `skillKind` and `spinT` are for the
     * renderer, which turns the roulette into a spin.
     */
    skillMove(p, aim, mod = null) {
      var _a;
      if (p.skillT > 0 || p.stumble > 0 || p.stamina < 0.15) return;
      let skill = p.ref.stats.dribbling / 100, b = this.ball, hasBall = b.owner === p, am = aim ? Math.hypot(aim.x, aim.y) : 0, lateral = am > 0.2 ? (aim.x * p.dirY - aim.y * p.dirX) / am : 0, along = am > 0.2 ? (aim.x * p.dirX + aim.y * p.dirY) / am : 0, foe = this.nearestTo(1 - p.team, p), foeAhead = foe && dist(p, foe) < 2.4 && (foe.x - p.x) * p.dirX + (foe.y - p.y) * p.dirY > 0.8, dir = am <= 0.2 ? "none" : Math.abs(lateral) > Math.abs(along) ? "side" : along > 0 ? "fwd" : "back", move = pickSkill(dir, mod, p.stars || 1, foeAhead);
      p.skillKind = move.id, hasBall && this.styleEvent(p, "skills", 25 + (foeAhead ? 15 : 0)), p.stamina = Math.max(0, p.stamina - 0.04);
      let over = Math.max(0, move.stars - 2) * 0.05, okP = clamp2(0.5 + skill * 0.48 + (((_a = p.tr) == null ? void 0 : _a.trickster) || 0) * 0.08 - over + ((p.stars || 1) - move.stars) * 0.03, 0.3, 0.97);
      if (hasBall && Math.random() > okP) {
        p.skillT = 0.2, p.stumble = 0.35, this.release(p, p.dirX * 6, p.dirY * 6), this.cue("skill", p);
        return;
      }
      let fx = move.fx, side = dir === "side" ? Math.sign(lateral) || 1 : Math.random() < 0.5 ? -1 : 1, q = 0.75 + skill * 0.4;
      if (p.skillT = fx.t * (0.9 + skill * 0.25), fx.spin && (p.spinT = p.skillT), fx.turn) {
        let a = Math.atan2(p.dirY, p.dirX) + (fx.turn >= Math.PI ? Math.PI : side * fx.turn);
        p.dirX = Math.cos(a), p.dirY = Math.sin(a);
      }
      p.vx *= fx.brake, p.vy *= fx.brake;
      let rx = p.dirY * -side, ry = -p.dirX * -side, bx = (p.dirX * fx.burst.fwd + rx * fx.burst.side) * q, by = (p.dirY * fx.burst.fwd + ry * fx.burst.side) * q;
      fx.burst.fwd > 5 || fx.ball !== "keep" ? p.burst = { t: Math.min(0.12, p.skillT * 0.4), vx: bx, vy: by } : (p.vx += bx, p.vy += by), hasBall && fx.ball === "past" ? (this.release(p, p.dirX * (9 + skill * 4), p.dirY * (9 + skill * 4)), b.noTouch = 0.06, b.owner = null) : hasBall && fx.ball === "lift" && (this.release(p, p.dirX * 6.5, p.dirY * 6.5, 6.2), b.noTouch = 0.55, b.owner = null), foe && dist(p, foe) < 3.4 && Math.random() < fx.freeze * (0.7 + skill * 0.5) && (foe.stumble = Math.max(foe.stumble, 0.35 + fx.freeze * 0.4)), this.cue("skill", p);
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
      let toGoal = Math.hypot(goalX - b.x, CY - b.y), shootingRange = toGoal < 32, taker = shootingRange && namedTaker(atk, "fk") || atk.players.filter((q) => q.role !== "GK").sort((x, y) => shootingRange ? y.ref.stats.shooting - x.ref.stats.shooting : dist(x, b) - dist(y, b))[0];
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
      var _a;
      let sp = this.setPiece;
      if (this.setPiece = null, this.phase = "play", this.banner = "", !sp) return;
      let p = sp.taker, atk = this.teams[p.team], goalX = atk.dir > 0 ? PITCH.w : 0, toGoal = Math.hypot(goalX - p.x, CY - p.y);
      if (this.ball.owner = p, p.touchLock = 0, toGoal < 30 && Math.abs(this.ball.y - CY) < 22) {
        let side = Math.random() < 0.5 ? -1 : 1;
        this.shoot(p, { x: atk.dir, y: side * 0.7 }, 0.78 + Math.random() * 0.2, { loft: 1.5, curl: 30 + (((_a = p.tr) == null ? void 0 : _a.deadball) || 0) * 12, placed: !0 });
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
      this.ball.owner = p, p.touchLock = 0, this.pass(p, { x: this.teams[p.team].dir, y: (CY - p.y) / PITCH.h }, !1, 0.3), FIELD.kickIn ? (this.ball.vz = 0, this.ball.z = 0) : (this.ball.vz = 3.2, this.ball.z = 1.6);
    }
    /**
     * Common set-piece bookkeeping. A person taking it gets a generous window
     * (the AI timer becomes a deadline) and the play screen shows the taker UI;
     * the CPU takes it when the short timer expires.
     */
    beginSetPiece(kind, team, taker, aiDelay) {
      let mine = (c) => {
        var _a;
        return c.team === team && !c.ai && (!c.lockId || c.lockId === ((_a = taker == null ? void 0 : taker.ref) == null ? void 0 : _a.id));
      }, human = this.controllers.some(mine);
      if (this.phaseT = human ? kind === "throwin" ? 6 : 9 : aiDelay + (this.teams[team].tactics.tempo === "slow" ? 1.4 : 0), FIELD.street && (this.phaseT = human ? 2.5 : Math.min(this.phaseT, 0.5)), human) {
        let c = this.controllers.find(mine);
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
      var _a;
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
        this.shoot(p, { x: team.dir, y: clamp2(a.y, -1, 1) }, power, { loft: toGoal < 30 ? 1.5 : 1, curl: 26 + (((_a = p.tr) == null ? void 0 : _a.deadball) || 0) * 12, placed: !0 });
      } else action === "cross" ? this.cross(p, a) : this.pass(p, a, action === "through", power);
      return sp.kind === "corner" && (this.cornerTaker = null), !0;
    }
    /** Is `pt` inside the box that `defending` is protecting? */
    inPenaltyArea(pt, defending) {
      let goalX = this.teams[defending].dir > 0 ? 0 : PITCH.w;
      return Math.abs(pt.x - goalX) < BOX.w && Math.abs(pt.y - CY) < BOX.half;
    }
    /**
     * Set a penalty. Everyone but the taker and the keeper leaves the box, the
     * ball goes on the spot, and the taker is the best finisher on the pitch —
     * which is what a manager would do and saves inventing a taker order.
     */
    awardPenalty(attacking, conceded) {
      let atk = this.teams[attacking], goalX = atk.dir > 0 ? PITCH.w : 0, spotX = goalX + (atk.dir > 0 ? -FIELD.spot : FIELD.spot), b = this.ball;
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
      let taker = namedTaker(atk, "pen") || atk.players.filter((p) => p.role !== "GK").sort((x, y) => y.ref.stats.shooting - x.ref.stats.shooting)[0];
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
      var _a, _b, _c, _d;
      let team = this.teams[p.team], b = this.ball, weHave = b.owner && b.owner.team === p.team, shift = (b.x - PITCH.w / 2) / (PITCH.w / 2) * team.dir * 13 * SCALE * (weHave ? 1.3 : 0.85) * this.mentalityOf(p.team), drop = weHave ? 0 : TUNE.drop * (2 - this.mentalityOf(p.team)), squeeze = weHave ? 1 : TUNE.squeeze, tac = team.tactics || {}, lineShift = (((_b = (_a = DEF_STYLES[tac.defStyle]) == null ? void 0 : _a.line) != null ? _b : 0) + (((_c = tac.line) != null ? _c : 0.5) - 0.5) * 16) * SCALE, k = p.role === "DEF" ? 1 : p.role === "MID" ? 0.6 : 0.3, width = weHave ? 0.84 + ((_d = tac.width) != null ? _d : 0.5) * 0.5 : squeeze, x = p.sx * PITCH.w + team.dir * (shift - drop + lineShift * k), y = CY + (p.sy * PITCH.h - CY) * width + (b.y - CY) * 0.42, role = ROLES[p.tRole];
      if (role) {
        let adj = weHave ? role.has : role.not;
        x += team.dir * adj.fwd;
        let toMid = CY - y;
        y += adj.in >= 0 ? Math.sign(toMid) * Math.min(Math.abs(toMid), adj.in) : -Math.sign(toMid || 1) * -adj.in;
      }
      if (x = clamp2(x, 3, PITCH.w - 3), p.role === "DEF" && !weHave) {
        let defs = team.players.filter((q) => q.role === "DEF"), lineX = defs.reduce((acc, q) => acc + q.sx * PITCH.w, 0) / (defs.length || 1) + team.dir * (shift - drop + lineShift);
        x = lineX + (x - lineX) * 0.25;
      }
      return p.role === "DEF" && (x = this.holdLine(team, x)), weHave && p.role !== "DEF" && b.owner !== p && (x = this.onsideX(team, x)), { x, y: clamp2(y, 3, PITCH.h - 3) };
    }
    think(p, dt) {
      var _a, _b, _c;
      if (p.role === "GK") return this.thinkGK(p, dt);
      let b = this.ball, team = this.teams[p.team];
      if (b.owner === p) return this.thinkOnBall(p, dt);
      let weHave = b.owner && b.owner.team === p.team, press = this.pressingOf(p.team), isChaser = this.chasers[p.team] === p || ((_a = this.chasers2) == null ? void 0 : _a[p.team]) === p, target = this.shapeTarget(p), goalX = team.dir > 0 ? PITCH.w : 0, triggered = this.pressTrigger && this.pressTrigger.team === p.team && this.t - this.pressTrigger.t < 1.4 && dist(p, b) < 16;
      if (!weHave && (isChaser || triggered || !b.owner && dist(p, b) < 14 * press)) {
        this.moveTo(p, b.x + b.vx * 0.25, b.y + b.vy * 0.25, dt, 1.06);
        let agg = this.aggressionOf(p), opp = this.teams[1 - p.team];
        if (b.owner && b.owner.team !== p.team && opp.counterT > 0 && dist(p, b.owner) < 2.6 && p.downT <= 0 && Math.abs(b.owner.x - PITCH.w / 2) < 30 && p.cards < 1 && Math.random() < (0.5 + agg) * dt) {
          let o = b.owner;
          this.fouls[p.team] += 1, this.cue("foul", p), o.downT = 0.8, o.downMax = 0.8, Math.random() < 0.7 && (p.cards += 1, this.cue("card", p), this.bookings.push({ team: p.team, name: p.ref.name, minute: this.minute() })), opp.counterT = 0, this.awardFreeKick(1 - p.team, o, p);
          return;
        }
        let commit = 2.3 + agg * 1.6;
        b.owner && b.owner.team !== p.team && dist(p, b.owner) < commit && Math.random() < (1.4 + agg * 2.2) * TUNE.tackleRate * this.aiSkillFor(p.team) * press * dt && this.tackle(p);
        return;
      }
      p.runT = (p.runT || Math.random() * 4) + dt;
      let jitterX = Math.sin(p.runT * 0.62 + p.num * 1.3) * 3.2, jitterY = Math.sin(p.runT * 0.83 + p.num * 2.1) * 4.4;
      if (TUNE.counter && weHave && team.counterT > 0 && p.role !== "DEF") {
        let lane = clamp2(p.sy * PITCH.h + (p.num % 2 ? 6 : -6), 5, PITCH.h - 5);
        this.moveTo(p, clamp2(target.x + team.dir * 22, 4, PITCH.w - 4), lane, dt, 1.1);
        return;
      }
      if (weHave && ((_b = ROLES[p.tRole]) == null ? void 0 : _b.flag) === "overlap" && b.owner && b.owner !== p) {
        let flank = Math.abs(b.owner.y - p.y) < 16 && Math.abs(b.owner.y - CY) > 12, advanced = (b.owner.x - PITCH.w / 2) * team.dir > 4;
        if (flank && advanced) {
          let tl = p.sy < 0.5 ? 4 : PITCH.h - 4;
          this.moveTo(p, clamp2(this.onsideX(team, b.owner.x + team.dir * 11), 4, PITCH.w - 4), tl, dt, 1.12);
          return;
        }
      }
      if (weHave && p.thirdUntil > 0) {
        p.thirdUntil -= dt, this.moveTo(p, clamp2(p.thirdX, 4, PITCH.w - 4), clamp2(p.thirdY, 4, PITCH.h - 4), dt, 1.14);
        return;
      }
      let runner = p.role === "MID" || ((_c = ROLES[p.tRole]) == null ? void 0 : _c.flag) === "runs";
      if (TUNE.runs && weHave && runner && p.role !== "DEF" && b.owner && b.owner !== p) {
        let finalThird = (b.x - PITCH.w / 2) * team.dir > 12;
        if (p.runClock = (p.runClock || 0) - dt, p.runClock <= 0 && finalThird && dist(p, b.owner) < 22 && Math.random() < 0.35 * dt && (p.runClock = 4 + Math.random() * 3, p.runUntil = 1.6, p.runY = clamp2(b.owner.y + (p.y > b.owner.y ? 9 : -9), 5, PITCH.h - 5), p.runSlack = Math.random() < 0.35 ? 2.4 : 0), p.runUntil > 0) {
          p.runUntil -= dt, this.moveTo(p, clamp2(this.onsideX(team, b.owner.x + team.dir * 16, p.runSlack || 0), 4, PITCH.w - 4), p.runY, dt, 1.12);
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
    /* ------------------------------ offside (v79) ------------------------------
     * The line is the second-last defender (the keeper usually being the last),
     * or the ball if that is further forward, and only in the opponents' half.
     * A pass or a cross notes who is beyond it at the moment it is played; if
     * one of them is the next to get the ball before a defender touches it, the
     * flag goes up and the defenders take an indirect free kick where he was. */
    offsideLine(defTeam) {
      var _a, _b;
      let t = this.teams[defTeam], own = t.dir > 0 ? 0 : PITCH.w, depth = t.players.map((q) => Math.abs(q.x - own)).sort((a, b) => a - b), second = (_b = (_a = depth[1]) != null ? _a : depth[0]) != null ? _b : 0;
      return own + (t.dir > 0 ? second : -second);
    }
    isOffside(q, lineX = null) {
      if (this.noOffside) return !1;
      let atk = this.teams[q.team], line = lineX != null ? lineX : this.offsideLine(1 - q.team), beyond = (q.x - line) * atk.dir > 0.25, pastBall = (q.x - this.ball.x) * atk.dir > 0, theirHalf = (q.x - PITCH.w / 2) * atk.dir > 0;
      return beyond && pastBall && theirHalf;
    }
    noteOffside(passer) {
      if (this.phase !== "play" || !FIELD.offside || this.noOffside) {
        this.offsideWatch = null;
        return;
      }
      let line = this.offsideLine(1 - passer.team), ids = /* @__PURE__ */ new Set();
      for (let q of this.teams[passer.team].players) q !== passer && q.role !== "GK" && this.isOffside(q, line) && ids.add(q);
      this.offsideWatch = ids.size ? { team: passer.team, ids } : null;
    }
    /** The side with the ball keeps its forwards level with the last defender (AI). */
    onsideX(team, x, slack = 0) {
      if (!FIELD.offside || this.noOffside) return x;
      let lim = this.offsideLine(1 - team.side) - team.dir * (0.8 - slack), ballLim = this.ball.x, cap2 = team.dir > 0 ? Math.max(lim, ballLim) : Math.min(lim, ballLim);
      return team.dir > 0 ? Math.min(x, cap2) : Math.max(x, cap2);
    }
    /** Defenders never collapse onto their own keeper — hold a line off the goal. */
    holdLine(team, x) {
      let gx = team.dir > 0 ? 0 : PITCH.w, MIN = 7.5 * this.preset.discipline * Math.max(0.45, SCALE);
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
      let team = this.teams[p.team], goalX = team.dir > 0 ? PITCH.w : 0, toGoal = Math.hypot(goalX - p.x, CY - p.y), foe = this.nearestTo(1 - p.team, p), pressure = foe ? dist(p, foe) : 99, bu = this.buildUpOf(p.team), q = this.decisionQuality(p.team), slow = team.tactics.tempo === "slow", ownGoalX = team.dir > 0 ? 0 : PITCH.w, fromOwn = Math.abs(p.x - ownGoalX);
      if (slow && toGoal < 30 && toGoal > 14 && pressure > 1.4 && Math.random() < 0.8) {
        let cornerY = p.y < CY ? 1.5 : PITCH.h - 1.5;
        this.moveTo(p, clamp2(goalX - team.dir * 2, 2, PITCH.w - 2), cornerY, dt, 0.55);
        return;
      }
      if (fromOwn < 32 && pressure < 3.4 && (p.role === "DEF" || p.control < 0.72) && Math.random() < (2.3 + bu.longBias * 2) * dt) {
        this.clear(p);
        return;
      }
      let sc = Math.max(0.55, SCALE);
      if (toGoal < 31 * sc && (pressure > 1.7 || toGoal < 16 * sc) && Math.random() < (3.3 - toGoal / (22 * sc)) * TUNE.shotRate * this.aiSkillFor(p.team) * (slow && toGoal > 14 ? 0.4 : 1) * dt) {
        let far = toGoal > 17, gk = this.teams[1 - p.team].players.find((q2) => q2.role === "GK"), chip = gk && Math.abs(gk.x - goalX) > 7 && toGoal < 20 && toGoal > 9 && Math.random() < 0.35 * this.aiSkillFor(p.team), post = (Math.random() < 0.62 ? Math.sign(CY - p.y) : -Math.sign(CY - p.y)) || 1;
        this.shoot(p, { x: 0, y: post * (0.35 + Math.random() * 0.55) * (team.dir > 0, 1) }, 0.55 + Math.random() * 0.45, {
          loft: chip ? 2.6 : 0.32 + Math.random() * 0.3,
          curl: !chip && far && Math.random() < 0.4 ? 30 : 0,
          chip
        });
        return;
      }
      let wideM = 20 * (PITCH.h / 68), wide = p.y < wideM || p.y > PITCH.h - wideM;
      if (wide && Math.abs(goalX - p.x) < 32 * SCALE && Math.random() < 2.2 * this.aiSkillFor(p.team) * dt && team.players.some((t) => t !== p && t.role !== "GK" && Math.abs(t.x - goalX) < 22)) {
        let kind = Math.abs(goalX - p.x) < 9 && Math.random() < 0.5 ? "cutback" : Math.random() < 0.35 ? "driven" : "floated";
        this.cross(p, null, kind);
        return;
      }
      if (TUNE.counter && team.counterT > 0 && toGoal > 26 && Math.random() < 2.4 * dt) {
        let runner = team.players.find((t) => t !== p && t.role !== "GK" && (t.x - p.x) * team.dir > 12 && dist(t, p) < 42);
        if (runner) {
          this.pass(p, { x: runner.x - p.x, y: runner.y - p.y }, !0, 0.7);
          return;
        }
      }
      if (pressure < 3.6 && Math.random() < 2.6 * bu.passRate * (slow ? 0.75 : 1) * dt) {
        if (Math.random() > q) {
          let a = (Math.random() - 0.5) * 3.2;
          this.pass(p, { x: Math.cos(a) * team.dir, y: Math.sin(a) }, !1, 0.6);
          return;
        }
        if (Math.random() < bu.longBias * 0.22 && toGoal > 30) {
          this.pass(p, { x: team.dir, y: (Math.random() - 0.5) * 0.8 }, !0, 0.9);
          return;
        }
        this.pass(p, { x: team.dir, y: (Math.random() - 0.5) * 0.6 }, toGoal > 45, 0.75);
        return;
      }
      let tx = goalX, ty = wide && Math.abs(goalX - p.x) < 60 ? clamp2(p.y + Math.sign(p.y - CY) * 2, 2.5, PITCH.h - 2.5) : CY + (p.y - CY) * 0.85;
      foe && pressure < 8 && (tx += (p.x - foe.x) * 0.5, ty += (p.y - foe.y) * 1.4), this.moveTo(p, clamp2(tx, 2, PITCH.w - 2), clamp2(ty, 3, PITCH.h - 3), dt, 1);
    }
    thinkGK(p, dt) {
      var _a, _b;
      let team = this.teams[p.team], b = this.ball, goalX = team.dir > 0 ? 0 : PITCH.w, inward = team.dir > 0 ? 1 : -1;
      if (b.owner === p) {
        this.drive(p, inward, 0, dt, 0.3);
        return;
      }
      let loose = !b.owner && b.noTouch <= 0, dGoal = Math.hypot(b.x - goalX, b.y - CY);
      if (TUNE.sweeper && loose && dGoal < 26 + (((_a = p.tr) == null ? void 0 : _a.sweeper) || 0) * 6 && b.z < 0.9 && !(b.vx * inward < -6)) {
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
        p.readId !== b.shotId && (p.readId = b.shotId, p.readErr = (Math.random() - 0.5) * 2 * (1.34 - p.ref.overall / 100) * 7.6 * (2.2 - 1.2 * Math.min(1, GOAL_HALF / 5.5)), p.reactT = 0.09 + (1.05 - p.ref.overall / 100) * 0.22), p.reactT = Math.max(0, (p.reactT || 0) - dt);
        let t = (tx - b.x) / b.vx;
        if (p.reactT <= 0 && t > 0 && t < 2.2) {
          let cross = b.y + b.vy * t + p.readErr;
          ty = cross, urgency = 1.12;
          let gap = cross - p.y, reach = (3.2 + (p.ref.overall - 70) * 0.06 + (((_b = p.tr) == null ? void 0 : _b.sweeper) || 0) * 0.35) * Math.min(1, 0.35 + 0.65 * GOAL_HALF / 5.5);
          p.diveT <= 0 && t < 0.62 && Math.abs(gap) > 0.85 && Math.abs(gap) < reach && (p.diveT = 0.75, p.diveDir = Math.sign(gap), p.diveHigh = b.z + b.vz * t > 1.15, p.vy = p.diveDir * (8.6 + p.ref.stats.defending * 0.03 + (p.ref.overall - 70) * 0.05), p.vx = inward * -0.8);
        }
      } else d2 < 13 && b.owner && b.owner.team !== p.team && (tx = goalX + inward * clamp2(d2 * 0.34, 2, 5.5), ty = b.y, urgency = 1.1);
      if (p.diveT > 0) {
        p.diveT -= dt, p.vx *= 0.94, p.vy *= 0.965;
        return;
      }
      ty = clamp2(ty, CY - GOAL_HALF - 2.5, CY + GOAL_HALF + 2.5), tx = team.dir > 0 ? clamp2(tx, 1, BOX.w - 2) : clamp2(tx, PITCH.w - BOX.w + 2, PITCH.w - 1), this.moveTo(p, tx, ty, dt, urgency);
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
      if (this.tally(gk, "saves"), speed < holdable && gk.diveT <= 0 && Math.random() < 0.36 + hands * 0.34)
        return this.cue("save"), !0;
      this.cue("save");
      let side = Math.sign(b.y - CY) || (Math.random() < 0.5 ? -1 : 1), out = speed * (0.34 + Math.random() * 0.2), tipRound = Math.random() < 0.55;
      if (tipRound)
        b.vx = -inward * (5 + Math.random() * 5), b.vy = side * out * 1.1, b.vz = 2 + Math.random() * 3, b.noTouch = 0.6;
      else {
        let wide = Math.random() < 0.62, raw = { x: inward * (wide ? 0.45 : 0.9), y: side * (wide ? 1.05 : 0.5) }, aim = this.deflectionAim(gk), w = clamp2(this.preset.deflect * (0.55 + hands * 0.5), 0, 1), dx = raw.x * (1 - w) + aim.x * w, dy = raw.y * (1 - w) + aim.y * w, m = Math.hypot(dx, dy) || 1;
        b.vx = dx / m * out, b.vy = dy / m * out, b.vz = 1.5 + Math.random() * 2.5;
      }
      return b.owner = null, b.lastTouch = gk, b.shotBy = null, b.noTouch = Math.max(b.noTouch || 0, 0.18), gk.touchLock = tipRound ? 0.8 : 0.35, this.parries = (this.parries || 0) + 1, !1;
    }
  };

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
  }, ACTIONS = ["pass", "shoot", "cross", "through", "lob", "skill", "switch", "curl", "sprint", "pause"], OVERRIDE = { keys: {}, pad: {} };
  function laid(base, over) {
    let out = { ...base };
    for (let [action, code] of Object.entries(over)) {
      for (let [k, v] of Object.entries(out)) {
        let acts = Array.isArray(v) ? v : [v];
        if (acts.includes(action)) {
          let rest = acts.filter((a) => a !== action);
          rest.length ? out[k] = rest.length === 1 ? rest[0] : rest : delete out[k];
        }
      }
      out[code] = action;
    }
    return out;
  }
  var keyMapFor = (set = "primary") => set === "primary" ? laid(KEYSETS.primary, OVERRIDE.keys) : KEYSETS[set], padMapFor = () => laid(PAD_ACTIONS, OVERRIDE.pad);
  var LAST = typeof matchMedia == "function" && matchMedia("(pointer: coarse)").matches ? "touch" : "keyboard", PAD_KIND = "xbox", deviceFns = /* @__PURE__ */ new Set(), setDevice = (d2) => {
    if (d2 !== LAST) {
      LAST = d2;
      for (let fn of deviceFns) fn(d2);
    }
  };
  typeof window < "u" && window.addEventListener && (window.addEventListener("keydown", () => setDevice("keyboard"), !0), window.addEventListener("pointerdown", (e) => {
    e.pointerType === "touch" ? setDevice("touch") : e.pointerType === "mouse" && setDevice("keyboard");
  }, !0), window.addEventListener("gamepadconnected", (e) => {
    PAD_KIND = /sony|dualsense|dualshock|playstation|054c/i.test(e.gamepad.id) ? "ps" : "xbox";
  }));
  var Input = class {
    /**
     * @param {{pad?: number|null, keys?: 'primary'|'secondary'}} opts
     *   pad  index to bind to, or null to grab the first connected one
     *   keys which keyboard set this seat uses, so two people can share one board
     */
    constructor(opts = {}) {
      var _a;
      this.padIndex = (_a = opts.pad) != null ? _a : null, this.keyMap = keyMapFor(opts.keys || "primary"), this.padMap = (opts.keys || "primary") === "primary" ? padMapFor() : PAD_ACTIONS, this.moveMap = opts.arrows ? { ...MOVE_SETS.primary, ...MOVE_SETS.secondary } : MOVE_SETS[opts.keys || "primary"], this.keys = /* @__PURE__ */ new Set(), this.touchVec = { x: 0, y: 0 }, this.touchButtons = /* @__PURE__ */ new Set(), this.pad = null, this.padName = "", this.vec = { x: 0, y: 0 }, this.now = /* @__PURE__ */ new Set(), this.was = /* @__PURE__ */ new Set(), this.heldFor = Object.fromEntries(ACTIONS.map((a) => [a, 0])), this._down = (e) => {
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
        let ax = this.pad.axes[0] || 0, ay = this.pad.axes[1] || 0, am = Math.hypot(ax, ay);
        if (am > 0.22) {
          let k = Math.min(1, (am - 0.22) / 0.78) / am;
          x += ax * k, y += ay * k;
        }
        (_a = this.pad.buttons[12]) != null && _a.pressed && (y -= 1), (_b = this.pad.buttons[13]) != null && _b.pressed && (y += 1), (_c = this.pad.buttons[14]) != null && _c.pressed && (x -= 1), (_d = this.pad.buttons[15]) != null && _d.pressed && (x += 1);
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
      if (this.pad) {
        let any = !1;
        for (let [i, a] of Object.entries(this.padMap))
          (_e = this.pad.buttons[i]) != null && _e.pressed && (fire(a), any = !0);
        (any || Math.hypot(this.pad.axes[0] || 0, this.pad.axes[1] || 0) > 0.5) && setDevice("pad");
      }
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
    /** v79: a swipe on the touch skill button — its direction (screen space) and modifier. */
    setGesture(g) {
      this.gesture = g;
    }
    takeGesture() {
      let g = this.gesture;
      return this.gesture = null, g || null;
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
  var NEAR = 0.6, MARGIN = 6, rgb = (hex) => {
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
      ty: CY * 0.82,
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
  function mulberry2(seed) {
    return () => {
      seed |= 0, seed = seed + 1831565813 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function buildCrowd() {
    let rand = mulberry2(97531), rows = 13, fans = [], bank = (kind, from, to, step) => {
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
        CY + Math.sin(a0) * 9.15,
        PITCH.w / 2 + Math.cos(a1) * 9.15,
        CY + Math.sin(a1) * 9.15,
        lw,
        LINE
      );
    }
    for (let side of [0, 1]) {
      let gx = side === 0 ? 0 : PITCH.w, inw = side === 0 ? 1 : -1, bx = gx + inw * BOX.w;
      groundLine(ctx, V, gx, CY - BOX.half, bx, CY - BOX.half, lw, LINE), groundLine(ctx, V, gx, CY + BOX.half, bx, CY + BOX.half, lw, LINE), groundLine(ctx, V, bx, CY - BOX.half, bx, CY + BOX.half, lw, LINE);
      let sx = gx + inw * 5.5;
      groundLine(ctx, V, gx, CY - 9.16, sx, CY - 9.16, lw, LINE), groundLine(ctx, V, gx, CY + 9.16, sx, CY + 9.16, lw, LINE), groundLine(ctx, V, sx, CY - 9.16, sx, CY + 9.16, lw, LINE);
    }
  }
  function drawGoals(ctx, V, quality) {
    let post = [242, 244, 250];
    for (let side of [0, 1]) {
      let gx = side === 0 ? 0 : PITCH.w, inw = side === 0 ? -1 : 1;
      if (box(ctx, V, gx, CY - GOAL_HALF, GOAL_HEIGHT / 2, 0.09, 0.09, GOAL_HEIGHT / 2, 1, 0, post), box(ctx, V, gx, CY + GOAL_HALF, GOAL_HEIGHT / 2, 0.09, 0.09, GOAL_HEIGHT / 2, 1, 0, post), box(ctx, V, gx, CY, GOAL_HEIGHT, 0.09, GOAL_HALF, 0.09, 1, 0, post), quality === "low") continue;
      let back = gx + inw * 1.9;
      poly(ctx, V, [
        back,
        CY - GOAL_HALF,
        0,
        back,
        CY + GOAL_HALF,
        0,
        back,
        CY + GOAL_HALF,
        GOAL_HEIGHT * 0.86,
        back,
        CY - GOAL_HALF,
        GOAL_HEIGHT * 0.86
      ], "rgba(226,236,250,.16)"), poly(ctx, V, [
        gx,
        CY - GOAL_HALF,
        GOAL_HEIGHT,
        back,
        CY - GOAL_HALF,
        GOAL_HEIGHT * 0.86,
        back,
        CY - GOAL_HALF,
        0,
        gx,
        CY - GOAL_HALF,
        0
      ], "rgba(226,236,250,.11)"), poly(ctx, V, [
        gx,
        CY + GOAL_HALF,
        GOAL_HEIGHT,
        back,
        CY + GOAL_HALF,
        GOAL_HEIGHT * 0.86,
        back,
        CY + GOAL_HALF,
        0,
        gx,
        CY + GOAL_HALF,
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

  // js/data/stadiums.js
  var STADIUMS = [
    // ---- Apex Premier Division ----
    { id: "forge", name: "The Forge", capacity: 62e3, size: 0.92, tiers: 2, roof: "ring", bowl: !0, seats: ["#c81e3c", "#1a1c22"], facade: "#1b1f2b", pattern: "stripes", pylons: "rim", fill: 0.93 },
    { id: "helios", name: "Helios Park", capacity: 48e3, size: 0.78, tiers: 2, roof: "cantilever", bowl: !0, seats: ["#f2b705", "#12263f"], facade: "#1d2a44", pattern: "checks", pylons: "mast", fill: 0.86 },
    { id: "blackmoor", name: "Blackmoor", capacity: 41e3, size: 0.7, tiers: 2, roof: "cantilever", bowl: !1, seats: ["#8a3ad6", "#0f0f1a"], facade: "#151428", pattern: "diagonal", pylons: "lattice", fill: 0.82 },
    { id: "verano", name: "Estadio Verano", capacity: 44e3, size: 0.74, tiers: 2, roof: "ring", bowl: !0, seats: ["#2ec4b6", "#0b132b"], facade: "#10203a", pattern: "rings", pylons: "rim", fill: 0.84 },
    { id: "kestrel", name: "Kestrel Park", capacity: 33e3, size: 0.58, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#ff7f11", "#2f3640"], facade: "#262b36", pattern: "stripes", pylons: "lattice", fill: 0.8 },
    { id: "bramble", name: "Bramble Lane", capacity: 29e3, size: 0.52, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#4f9d3a", "#d4af37"], facade: "#22301c", pattern: "checks", pylons: "lattice", fill: 0.78 },
    { id: "marisol", name: "Puerto Marisol", capacity: 36e3, size: 0.62, tiers: 2, roof: "cantilever", bowl: !0, seats: ["#ff5c8a", "#13315c"], facade: "#152742", pattern: "diagonal", pylons: "mast", fill: 0.79 },
    { id: "nordlys", name: "Nordlys Arena", capacity: 3e4, size: 0.55, tiers: 1, roof: "dome", bowl: !0, seats: ["#41d3ff", "#2b2d6e"], facade: "#1b1c48", pattern: "plain", pylons: "rim", fill: 0.88 },
    { id: "rampart", name: "The Rampart", capacity: 24e3, size: 0.44, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#6c8ea4", "#c9d6df"], facade: "#2b3a48", pattern: "stripes", pylons: "lattice", fill: 0.74 },
    { id: "cumbre", name: "Cumbre Stadium", capacity: 27e3, size: 0.49, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#ff2e88", "#150d1f"], facade: "#1c1226", pattern: "rings", pylons: "lattice", fill: 0.72 },
    // ---- Meridian League ----
    { id: "lantern", name: "The Lantern", capacity: 38e3, size: 0.66, tiers: 2, roof: "ring", bowl: !0, seats: ["#00b4d8", "#03203c"], facade: "#0a2540", pattern: "stripes", pylons: "rim", fill: 0.81 },
    { id: "cliffside", name: "Cliffside Park", capacity: 31e3, size: 0.56, tiers: 2, roof: "cantilever", bowl: !1, seats: ["#d62828", "#f1f1f1"], facade: "#3a1c1c", pattern: "checks", pylons: "lattice", fill: 0.83 },
    { id: "grove", name: "Grove Road", capacity: 22e3, size: 0.4, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#2a9d8f", "#1b1b1e"], facade: "#1c2a28", pattern: "stripes", pylons: "lattice", fill: 0.76 },
    { id: "marsh", name: "Marsh Lane", capacity: 18e3, size: 0.33, tiers: 1, roof: "none", bowl: !1, seats: ["#e9c46a", "#264653"], facade: "#2a3a40", pattern: "plain", pylons: "lattice", fill: 0.7 },
    { id: "vireo", name: "Estadio Vireo", capacity: 26e3, size: 0.47, tiers: 1, roof: "cantilever", bowl: !0, seats: ["#8ac926", "#101820"], facade: "#18231a", pattern: "diagonal", pylons: "mast", fill: 0.73 },
    { id: "weir", name: "The Weir", capacity: 2e4, size: 0.37, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#a2d2ff", "#1d3557"], facade: "#1d2f4a", pattern: "stripes", pylons: "lattice", fill: 0.71 },
    { id: "kiln", name: "Kiln Field", capacity: 16e3, size: 0.3, tiers: 1, roof: "none", bowl: !1, seats: ["#f77f00", "#3d0c02"], facade: "#3a1a10", pattern: "checks", pylons: "lattice", fill: 0.77 },
    { id: "wick", name: "Wick Green", capacity: 15e3, size: 0.28, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#adb5bd", "#212529"], facade: "#2b2f36", pattern: "stripes", pylons: "lattice", fill: 0.66 },
    { id: "lumen", name: "Lumen Dome", capacity: 34e3, size: 0.6, tiers: 2, roof: "dome", bowl: !0, seats: ["#ffd166", "#5a189a"], facade: "#2a0d4a", pattern: "rings", pylons: "rim", fill: 0.85 },
    { id: "nova", name: "Campo Nova", capacity: 19e3, size: 0.35, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#ef476f", "#073b4c"], facade: "#0e2a38", pattern: "diagonal", pylons: "mast", fill: 0.69 },
    // ---- Vanguard League ----
    { id: "steelworks", name: "Steelworks Park", capacity: 21e3, size: 0.38, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#8d99ae", "#2b2d42"], facade: "#2b2d42", pattern: "stripes", pylons: "lattice", fill: 0.74 },
    { id: "corvina", name: "Corvina Field", capacity: 14e3, size: 0.26, tiers: 1, roof: "none", bowl: !1, seats: ["#1b263b", "#e0e1dd"], facade: "#1b263b", pattern: "plain", pylons: "lattice", fill: 0.68 },
    { id: "riverside", name: "Riverside", capacity: 17e3, size: 0.31, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#48cae4", "#023e8a"], facade: "#0b2a55", pattern: "checks", pylons: "lattice", fill: 0.72 },
    { id: "acorn", name: "The Acorn", capacity: 12e3, size: 0.22, tiers: 1, roof: "none", bowl: !1, seats: ["#6a994e", "#386641"], facade: "#2a3f22", pattern: "stripes", pylons: "lattice", fill: 0.7 },
    { id: "harbour", name: "Harbour Ground", capacity: 15500, size: 0.28, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#0077b6", "#caf0f8"], facade: "#0f3a5a", pattern: "diagonal", pylons: "mast", fill: 0.66 },
    { id: "summit", name: "Summit Road", capacity: 11e3, size: 0.2, tiers: 1, roof: "none", bowl: !1, seats: ["#2d6a4f", "#d8f3dc"], facade: "#24402f", pattern: "plain", pylons: "lattice", fill: 0.64 },
    { id: "shaw", name: "Shaw Lane", capacity: 13e3, size: 0.24, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#212529", "#ffd60a"], facade: "#26282c", pattern: "stripes", pylons: "lattice", fill: 0.71 },
    { id: "cross", name: "Cross Park", capacity: 10500, size: 0.19, tiers: 1, roof: "none", bowl: !1, seats: ["#ff9f1c", "#011627"], facade: "#152030", pattern: "checks", pylons: "lattice", fill: 0.6 },
    { id: "windmere", name: "Estadio Windmere", capacity: 16500, size: 0.3, tiers: 1, roof: "cantilever", bowl: !0, seats: ["#c77dff", "#10002b"], facade: "#1e0a3a", pattern: "rings", pylons: "mast", fill: 0.62 },
    { id: "quarry", name: "The Quarry", capacity: 9e3, size: 0.16, tiers: 1, roof: "none", bowl: !1, seats: ["#bc6c25", "#283618"], facade: "#33301e", pattern: "plain", pylons: "lattice", fill: 0.65 },
    // ---- Foundation League ----
    { id: "meadow", name: "Meadow Lane", capacity: 12500, size: 0.23, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#7b2cbf", "#e0aaff"], facade: "#2a1046", pattern: "stripes", pylons: "lattice", fill: 0.66 },
    { id: "bridge", name: "Bridge Street", capacity: 9500, size: 0.17, tiers: 1, roof: "none", bowl: !1, seats: ["#9a031e", "#fb8b24"], facade: "#3a1010", pattern: "checks", pylons: "lattice", fill: 0.69 },
    { id: "stonefield", name: "Stonefield", capacity: 11500, size: 0.21, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#adb5bd", "#343a40"], facade: "#343a40", pattern: "plain", pylons: "lattice", fill: 0.58 },
    { id: "vale", name: "Vale Park", capacity: 8500, size: 0.15, tiers: 1, roof: "none", bowl: !1, seats: ["#00afb9", "#f07167"], facade: "#1d3d44", pattern: "diagonal", pylons: "lattice", fill: 0.63 },
    { id: "heath", name: "Heath Road", capacity: 1e4, size: 0.18, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#e63946", "#f1faee"], facade: "#3a1a20", pattern: "stripes", pylons: "lattice", fill: 0.67 },
    { id: "fen", name: "Fen Lane", capacity: 7500, size: 0.13, tiers: 1, roof: "none", bowl: !1, seats: ["#f4a261", "#264653"], facade: "#263a40", pattern: "plain", pylons: "lattice", fill: 0.6 },
    { id: "dunmore", name: "Dunmore Park", capacity: 9800, size: 0.18, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#40916c", "#ffffff"], facade: "#1e3a2a", pattern: "checks", pylons: "lattice", fill: 0.72 },
    { id: "lakeside", name: "Lakeside Arena", capacity: 13500, size: 0.25, tiers: 1, roof: "cantilever", bowl: !0, seats: ["#dee2e6", "#4361ee"], facade: "#1a2a6a", pattern: "rings", pylons: "mast", fill: 0.59 },
    { id: "gate", name: "Gate Ground", capacity: 8e3, size: 0.14, tiers: 1, roof: "none", bowl: !1, seats: ["#ffb703", "#023047"], facade: "#0c2a40", pattern: "stripes", pylons: "lattice", fill: 0.61 },
    { id: "colliery", name: "Colliery Row", capacity: 7e3, size: 0.12, tiers: 1, roof: "none", bowl: !1, seats: ["#3d405b", "#f2cc8f"], facade: "#33344a", pattern: "plain", pylons: "lattice", fill: 0.7 },
    // ---- Pioneer League ----
    { id: "bridgepark", name: "Bridge Park", capacity: 9e3, size: 0.16, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#1d4ed8", "#f8fafc"], facade: "#1e2a5a", pattern: "stripes", pylons: "lattice", fill: 0.68 },
    { id: "combe", name: "Combe Lane", capacity: 7200, size: 0.12, tiers: 1, roof: "none", bowl: !1, seats: ["#16a34a", "#052e16"], facade: "#14301c", pattern: "plain", pylons: "lattice", fill: 0.64 },
    { id: "mudflats", name: "The Mudflats", capacity: 6500, size: 0.11, tiers: 1, roof: "none", bowl: !1, seats: ["#0ea5e9", "#0c1a2a"], facade: "#0c1a2a", pattern: "checks", pylons: "lattice", fill: 0.7 },
    { id: "mere", name: "Mere Road", capacity: 8100, size: 0.14, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#a21caf", "#fdf4ff"], facade: "#3b0f3f", pattern: "diagonal", pylons: "lattice", fill: 0.62 },
    { id: "fallow", name: "Fallow Ground", capacity: 5800, size: 0.1, tiers: 1, roof: "none", bowl: !1, seats: ["#ca8a04", "#1c1917"], facade: "#2a2418", pattern: "plain", pylons: "lattice", fill: 0.66 },
    { id: "ironwood", name: "Ironwood Park", capacity: 7700, size: 0.13, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#57534e", "#f97316"], facade: "#2c2a28", pattern: "stripes", pylons: "lattice", fill: 0.71 },
    { id: "brookfield", name: "Brook Field", capacity: 6200, size: 0.11, tiers: 1, roof: "none", bowl: !1, seats: ["#f43f5e", "#fff1f2"], facade: "#3a1a22", pattern: "checks", pylons: "lattice", fill: 0.6 },
    { id: "heathpark", name: "Heath Park", capacity: 5400, size: 0.09, tiers: 1, roof: "none", bowl: !1, seats: ["#65a30d", "#1a2e05"], facade: "#1a2e05", pattern: "plain", pylons: "lattice", fill: 0.63 },
    { id: "moorgate", name: "Estadio Moorgate", capacity: 8800, size: 0.15, tiers: 1, roof: "cantilever", bowl: !0, seats: ["#7c3aed", "#faf5ff"], facade: "#2a1548", pattern: "rings", pylons: "mast", fill: 0.58 },
    { id: "paddock", name: "The Paddock", capacity: 4900, size: 0.08, tiers: 1, roof: "none", bowl: !1, seats: ["#b45309", "#fef3c7"], facade: "#3a2a12", pattern: "plain", pylons: "lattice", fill: 0.67 },
    // ---- Grassroots League ----
    { id: "riverton", name: "Riverton Ground", capacity: 7e3, size: 0.12, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#0369a1", "#e0f2fe"], facade: "#0c2a40", pattern: "stripes", pylons: "lattice", fill: 0.66 },
    { id: "hollow", name: "Hollow Lane", capacity: 5600, size: 0.09, tiers: 1, roof: "none", bowl: !1, seats: ["#334155", "#cbd5e1"], facade: "#242c3a", pattern: "plain", pylons: "lattice", fill: 0.6 },
    { id: "barrow", name: "Barrow Park", capacity: 6300, size: 0.11, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#dc2626", "#fef2f2"], facade: "#3a1414", pattern: "checks", pylons: "lattice", fill: 0.69 },
    { id: "copper", name: "Copper Row", capacity: 5100, size: 0.08, tiers: 1, roof: "none", bowl: !1, seats: ["#d97706", "#292524"], facade: "#2a2018", pattern: "plain", pylons: "lattice", fill: 0.65 },
    { id: "thistle", name: "Thistle Lane", capacity: 6e3, size: 0.1, tiers: 1, roof: "none", bowl: !1, seats: ["#7e22ce", "#fde68a"], facade: "#2c1444", pattern: "diagonal", pylons: "lattice", fill: 0.61 },
    { id: "acre", name: "Acre Field", capacity: 4700, size: 0.07, tiers: 1, roof: "none", bowl: !1, seats: ["#15803d", "#dcfce7"], facade: "#143220", pattern: "plain", pylons: "lattice", fill: 0.62 },
    { id: "saltire", name: "Saltire Park", capacity: 6800, size: 0.12, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#1e3a8a", "#ffffff"], facade: "#1a2a5a", pattern: "stripes", pylons: "lattice", fill: 0.7 },
    { id: "brookside", name: "Brookside Arena", capacity: 7400, size: 0.13, tiers: 1, roof: "cantilever", bowl: !0, seats: ["#0f766e", "#ccfbf1"], facade: "#0f3a34", pattern: "rings", pylons: "mast", fill: 0.57 },
    { id: "cinder", name: "Cinder Ground", capacity: 5300, size: 0.09, tiers: 1, roof: "none", bowl: !1, seats: ["#f59e0b", "#1c1917"], facade: "#2c2418", pattern: "checks", pylons: "lattice", fill: 0.64 },
    { id: "hawkrow", name: "Hawk Row", capacity: 4500, size: 0.07, tiers: 1, roof: "none", bowl: !1, seats: ["#1f2937", "#fbbf24"], facade: "#1f2937", pattern: "plain", pylons: "lattice", fill: 0.68 },
    // ---- v78: community grounds — a single stand, a rail and a fence ----
    { id: "millbrook", name: "Millbrook Rec", capacity: 1800, size: 0.03, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#1e6f5c", "#f4f1de"], facade: "#2b3a33", pattern: "stripes", pylons: "lattice", fill: 0.55 },
    { id: "ferrylane", name: "Ferry Lane", capacity: 2400, size: 0.04, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#264653", "#e9c46a"], facade: "#23313a", pattern: "plain", pylons: "lattice", fill: 0.6 },
    { id: "parish", name: "Parish Field", capacity: 1500, size: 0.03, tiers: 1, roof: "none", bowl: !1, seats: ["#6a040f", "#f4f1de"], facade: "#2f2525", pattern: "plain", pylons: "lattice", fill: 0.52 },
    { id: "coalyard", name: "Coalyard Meadow", capacity: 3200, size: 0.05, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#111827", "#f59e0b"], facade: "#1f2430", pattern: "checks", pylons: "lattice", fill: 0.62 },
    { id: "allotments", name: "The Allotments", capacity: 2e3, size: 0.03, tiers: 1, roof: "none", bowl: !1, seats: ["#2d6a4f", "#95d5b2"], facade: "#24352c", pattern: "stripes", pylons: "lattice", fill: 0.58 },
    { id: "stationrd", name: "Station Road", capacity: 3800, size: 0.06, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#1d3557", "#e63946"], facade: "#1d2433", pattern: "stripes", pylons: "lattice", fill: 0.64 },
    { id: "kilncommon", name: "Kiln Common", capacity: 1200, size: 0.02, tiers: 1, roof: "none", bowl: !1, seats: ["#7f5539", "#ede0d4"], facade: "#3a2d24", pattern: "plain", pylons: "lattice", fill: 0.5 },
    { id: "orchardpk", name: "Orchard Park", capacity: 2900, size: 0.04, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#386641", "#f2e8cf"], facade: "#27332a", pattern: "diagonal", pylons: "lattice", fill: 0.6 },
    // ---- v72: the forty clubs of the hundred-club world ----
    { id: "vantage-arena", name: "Vantage Arena", capacity: 78e3, size: 0.8, tiers: 2, roof: "ring", bowl: !0, seats: ["#0f172a", "#38bdf8"], facade: "#0f172a", pattern: "plain", pylons: "rim", fill: 0.84 },
    { id: "harbourside", name: "The Harbourside", capacity: 76200, size: 0.78, tiers: 2, roof: "ring", bowl: !0, seats: ["#7f1d1d", "#fde68a"], facade: "#7f1d1d", pattern: "checks", pylons: "rim", fill: 0.83 },
    { id: "ridgeway-park", name: "Ridgeway Park", capacity: 62700, size: 0.63, tiers: 2, roof: "cantilever", bowl: !0, seats: ["#065f46", "#a7f3d0"], facade: "#065f46", pattern: "checks", pylons: "mast", fill: 0.79 },
    { id: "stellar-dome", name: "Stellar Dome", capacity: 60900, size: 0.61, tiers: 2, roof: "cantilever", bowl: !0, seats: ["#312e81", "#c7d2fe"], facade: "#312e81", pattern: "rings", pylons: "mast", fill: 0.78 },
    { id: "haven-road", name: "Haven Road", capacity: 49200, size: 0.48, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#1d4ed8", "#fef3c7"], facade: "#1d4ed8", pattern: "checks", pylons: "mast", fill: 0.74 },
    { id: "penny-lane", name: "Penny Lane", capacity: 45600, size: 0.44, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#78350f", "#fde68a"], facade: "#78350f", pattern: "stripes", pylons: "lattice", fill: 0.73 },
    { id: "holloway-ground", name: "Holloway Ground", capacity: 39300, size: 0.37, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#4c1d95", "#f5f3ff"], facade: "#4c1d95", pattern: "rings", pylons: "lattice", fill: 0.71 },
    { id: "dune-park", name: "Dune Park", capacity: 35700, size: 0.33, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#b45309", "#fff7ed"], facade: "#b45309", pattern: "diagonal", pylons: "lattice", fill: 0.7 },
    { id: "lakeshore-stadium", name: "Lakeshore Stadium", capacity: 32100, size: 0.29, tiers: 1, roof: "cantilever", bowl: !1, seats: ["#0e7490", "#ecfeff"], facade: "#0e7490", pattern: "diagonal", pylons: "lattice", fill: 0.69 },
    { id: "cliff-road", name: "Cliff Road", capacity: 28500, size: 0.25, tiers: 1, roof: "none", bowl: !1, seats: ["#166534", "#dcfce7"], facade: "#166534", pattern: "checks", pylons: "lattice", fill: 0.67 },
    { id: "kings-field", name: "Kings Field", capacity: 25800, size: 0.22, tiers: 1, roof: "none", bowl: !1, seats: ["#1e3a8a", "#fbbf24"], facade: "#1e3a8a", pattern: "plain", pylons: "lattice", fill: 0.67 },
    { id: "norbury-park", name: "Norbury Park", capacity: 25800, size: 0.22, tiers: 1, roof: "none", bowl: !1, seats: ["#9f1239", "#fecdd3"], facade: "#9f1239", pattern: "plain", pylons: "lattice", fill: 0.67 },
    { id: "moor", name: "The Moor", capacity: 22200, size: 0.18, tiers: 1, roof: "none", bowl: !1, seats: ["#0f766e", "#99f6e4"], facade: "#0f766e", pattern: "rings", pylons: "lattice", fill: 0.65 },
    { id: "brook-lane", name: "Brook Lane", capacity: 19500, size: 0.15, tiers: 1, roof: "none", bowl: !1, seats: ["#b91c1c", "#fee2e2"], facade: "#b91c1c", pattern: "checks", pylons: "lattice", fill: 0.65 },
    { id: "vale-ground", name: "Vale Ground", capacity: 21300, size: 0.17, tiers: 1, roof: "none", bowl: !1, seats: ["#15803d", "#f0fdf4"], facade: "#15803d", pattern: "rings", pylons: "lattice", fill: 0.65 },
    { id: "bramford-road", name: "Bramford Road", capacity: 20400, size: 0.16, tiers: 1, roof: "none", bowl: !1, seats: ["#1e40af", "#dbeafe"], facade: "#1e40af", pattern: "plain", pylons: "lattice", fill: 0.65 },
    { id: "crest-park", name: "Crest Park", capacity: 19500, size: 0.15, tiers: 1, roof: "none", bowl: !1, seats: ["#7c2d12", "#fed7aa"], facade: "#7c2d12", pattern: "stripes", pylons: "lattice", fill: 0.65 },
    { id: "elm-lane", name: "Elm Lane", capacity: 18600, size: 0.14, tiers: 1, roof: "none", bowl: !1, seats: ["#3f6212", "#ecfccb"], facade: "#3f6212", pattern: "checks", pylons: "lattice", fill: 0.64 },
    { id: "hollow-field", name: "Hollow Field", capacity: 17700, size: 0.13, tiers: 1, roof: "none", bowl: !1, seats: ["#c2410c", "#ffedd5"], facade: "#c2410c", pattern: "diagonal", pylons: "lattice", fill: 0.64 },
    { id: "glen-road", name: "Glen Road", capacity: 16800, size: 0.12, tiers: 1, roof: "none", bowl: !1, seats: ["#0c4a6e", "#e0f2fe"], facade: "#0c4a6e", pattern: "rings", pylons: "lattice", fill: 0.64 },
    { id: "green-lane", name: "Green Lane", capacity: 15900, size: 0.11, tiers: 1, roof: "none", bowl: !1, seats: ["#166534", "#bbf7d0"], facade: "#166534", pattern: "plain", pylons: "lattice", fill: 0.63 },
    { id: "hurst-row", name: "Hurst Row", capacity: 15e3, size: 0.1, tiers: 1, roof: "none", bowl: !1, seats: ["#292524", "#f5f5f4"], facade: "#292524", pattern: "stripes", pylons: "lattice", fill: 0.63 },
    { id: "juniper-park", name: "Juniper Park", capacity: 14100, size: 0.09, tiers: 1, roof: "none", bowl: !1, seats: ["#5b21b6", "#ede9fe"], facade: "#5b21b6", pattern: "checks", pylons: "lattice", fill: 0.63 },
    { id: "kettle-ground", name: "Kettle Ground", capacity: 13200, size: 0.08, tiers: 1, roof: "none", bowl: !1, seats: ["#0369a1", "#f0f9ff"], facade: "#0369a1", pattern: "diagonal", pylons: "lattice", fill: 0.62 },
    { id: "langford-road", name: "Langford Road", capacity: 12300, size: 0.07, tiers: 1, roof: "none", bowl: !1, seats: ["#be123c", "#ffe4e6"], facade: "#be123c", pattern: "rings", pylons: "lattice", fill: 0.62 },
    { id: "heath-lane", name: "Heath Lane", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#4d7c0f", "#f7fee7"], facade: "#4d7c0f", pattern: "plain", pylons: "lattice", fill: 0.62 },
    { id: "nettle-park", name: "Nettle Park", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#1f2937", "#fbbf24"], facade: "#1f2937", pattern: "stripes", pylons: "lattice", fill: 0.62 },
    { id: "oakridge-ground", name: "Oakridge Ground", capacity: 16800, size: 0.12, tiers: 1, roof: "none", bowl: !1, seats: ["#14532d", "#dcfce7"], facade: "#14532d", pattern: "plain", pylons: "lattice", fill: 0.64 },
    { id: "pember-lane", name: "Pember Lane", capacity: 15900, size: 0.11, tiers: 1, roof: "none", bowl: !1, seats: ["#7f1d1d", "#fecaca"], facade: "#7f1d1d", pattern: "stripes", pylons: "lattice", fill: 0.63 },
    { id: "quarry-vale", name: "The Vale", capacity: 15e3, size: 0.1, tiers: 1, roof: "none", bowl: !1, seats: ["#44403c", "#e7e5e4"], facade: "#44403c", pattern: "checks", pylons: "lattice", fill: 0.63 },
    { id: "rosemont-park", name: "Rosemont Park", capacity: 14100, size: 0.09, tiers: 1, roof: "none", bowl: !1, seats: ["#be185d", "#fce7f3"], facade: "#be185d", pattern: "diagonal", pylons: "lattice", fill: 0.63 },
    { id: "dale-road", name: "Dale Road", capacity: 13200, size: 0.08, tiers: 1, roof: "none", bowl: !1, seats: ["#075985", "#e0f2fe"], facade: "#075985", pattern: "rings", pylons: "lattice", fill: 0.62 },
    { id: "thorn-park", name: "Thorn Park", capacity: 12300, size: 0.07, tiers: 1, roof: "none", bowl: !1, seats: ["#3730a3", "#e0e7ff"], facade: "#3730a3", pattern: "plain", pylons: "lattice", fill: 0.62 },
    { id: "underhill", name: "Underhill", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#9a3412", "#ffedd5"], facade: "#9a3412", pattern: "stripes", pylons: "lattice", fill: 0.62 },
    { id: "royal-field", name: "Royal Field", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#6d28d9", "#f5f3ff"], facade: "#6d28d9", pattern: "checks", pylons: "lattice", fill: 0.62 },
    { id: "westbrook-lane", name: "Westbrook Lane", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#0d9488", "#ccfbf1"], facade: "#0d9488", pattern: "diagonal", pylons: "lattice", fill: 0.62 },
    { id: "yew-lane", name: "Yew Lane", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#365314", "#ecfccb"], facade: "#365314", pattern: "rings", pylons: "lattice", fill: 0.62 },
    { id: "zealand-ground", name: "Zealand Ground", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#1e3a8a", "#dbeafe"], facade: "#1e3a8a", pattern: "plain", pylons: "lattice", fill: 0.62 },
    { id: "amber-park", name: "Amber Park", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#d97706", "#fffbeb"], facade: "#d97706", pattern: "stripes", pylons: "lattice", fill: 0.62 },
    { id: "fen-road", name: "Fen Road", capacity: 11400, size: 0.06, tiers: 1, roof: "none", bowl: !1, seats: ["#111827", "#f9fafb"], facade: "#111827", pattern: "checks", pylons: "lattice", fill: 0.62 },
    // ---- the eight wonders (v72): finals, and the arenas the world plays in ----
    // `wonder` grounds carry a retractable roof, giant screens over both ends,
    // an LED ribbon round the tier and pyrotechnics at kick-off and goals.
    { id: "crown", name: "The Crown", capacity: 1e5, size: 1, tiers: 2, roof: "arch", bowl: !0, seats: ["#f8fafc", "#0f172a"], facade: "#0b1020", pattern: "checks", pylons: "rim", fill: 0.98, showpiece: !0, wonder: !0, retractable: !0 },
    { id: "aurora-dome", name: "Aurora Dome", capacity: 88e3, size: 0.98, tiers: 2, roof: "dome", bowl: !0, seats: ["#22d3ee", "#0e1a2b"], facade: "#0a2030", pattern: "rings", pylons: "rim", fill: 0.97, showpiece: !0, wonder: !0, retractable: !0 },
    { id: "colosseo", name: "Colosseo Nova", capacity: 92e3, size: 0.99, tiers: 2, roof: "ring", bowl: !0, seats: ["#fbbf24", "#1c1917"], facade: "#2a2418", pattern: "diagonal", pylons: "rim", fill: 0.97, showpiece: !0, wonder: !0 },
    { id: "oasis", name: "Oasis Stadium", capacity: 84e3, size: 0.97, tiers: 2, roof: "dome", bowl: !0, seats: ["#34d399", "#052e16"], facade: "#0f2a1a", pattern: "stripes", pylons: "rim", fill: 0.96, showpiece: !0, wonder: !0, retractable: !0 },
    { id: "harbour-arena", name: "Harbour Arena", capacity: 8e4, size: 0.96, tiers: 2, roof: "arch", bowl: !0, seats: ["#60a5fa", "#0c1a3a"], facade: "#0a1a3a", pattern: "checks", pylons: "rim", fill: 0.96, showpiece: !0, wonder: !0 },
    { id: "summit-bowl", name: "Summit Bowl", capacity: 78e3, size: 0.95, tiers: 2, roof: "ring", bowl: !0, seats: ["#e2e8f0", "#1e293b"], facade: "#1a2233", pattern: "rings", pylons: "rim", fill: 0.95, showpiece: !0, wonder: !0 },
    { id: "lantern-dome", name: "The Great Lantern", capacity: 86e3, size: 0.98, tiers: 2, roof: "dome", bowl: !0, seats: ["#f472b6", "#1e0a2b"], facade: "#2a0a3a", pattern: "diagonal", pylons: "rim", fill: 0.97, showpiece: !0, wonder: !0, retractable: !0 },
    { id: "meridian-prime", name: "Meridian Prime", capacity: 95e3, size: 1, tiers: 2, roof: "arch", bowl: !0, seats: ["#a78bfa", "#0b0a1e"], facade: "#100a2a", pattern: "stripes", pylons: "rim", fill: 0.98, showpiece: !0, wonder: !0 },
    // ---- showpiece arenas: finals, the Weekend League, cup ties ----
    { id: "apex-arena", name: "Apex Arena", capacity: 9e4, size: 1, tiers: 2, roof: "arch", bowl: !0, seats: ["#f0f4ff", "#0a0d16"], facade: "#0e1220", pattern: "checks", pylons: "rim", fill: 0.97, showpiece: !0 },
    { id: "meridian", name: "Meridian Dome", capacity: 72e3, size: 0.96, tiers: 2, roof: "dome", bowl: !0, seats: ["#7af7ff", "#08111c"], facade: "#0b1a2c", pattern: "rings", pylons: "rim", fill: 0.95, showpiece: !0 },
    { id: "continental", name: "Continental Bowl", capacity: 8e4, size: 0.98, tiers: 2, roof: "ring", bowl: !0, seats: ["#ffd166", "#2b2d42"], facade: "#1a1c30", pattern: "diagonal", pylons: "rim", fill: 0.96, showpiece: !0 },
    { id: "national", name: "The National Stadium", capacity: 84e3, size: 0.99, tiers: 2, roof: "arch", bowl: !0, seats: ["#c8102e", "#f5f5f5"], facade: "#221a1e", pattern: "stripes", pylons: "rim", fill: 0.97, showpiece: !0 }
  ], STADIUM_BY_ID = Object.fromEntries(STADIUMS.map((s) => [s.id, s])), BY_NAME = Object.fromEntries(STADIUMS.map((s) => [s.name, s]));
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < String(s).length; i++)
      h ^= String(s).charCodeAt(i), h = Math.imul(h, 16777619);
    return h >>> 0;
  }
  function stadiumFor(club, { showpiece = !1 } = {}) {
    if (showpiece) {
      let pick = STADIUMS.filter((s) => showpiece === "wonder" ? s.wonder : s.showpiece);
      return pick[hashStr((club == null ? void 0 : club.id) || (club == null ? void 0 : club.name) || "final") % pick.length];
    }
    if (club != null && club.national) return nationalStadium(club.name, club.rating || 75, club.colors);
    if (!club) return STADIUM_BY_ID.forge;
    let host = { id: club.id, name: club.name, country: club.country || null }, named = club.ground && BY_NAME[club.ground];
    if (named) return { ...named, host };
    let level2 = Number.isFinite(club.level) ? club.level : 0.7, pool = STADIUMS.filter((s) => !s.showpiece && Math.abs(s.size - level2) < 0.22), base = (pool.length ? pool : STADIUMS.filter((s) => !s.showpiece))[hashStr(club.id || club.name) % (pool.length || STADIUMS.length)];
    return {
      ...base,
      id: "".concat(base.id, ":").concat(club.id || club.name),
      name: club.ground || base.name,
      host,
      seats: Array.isArray(club.colors) && club.colors.length === 2 ? [club.colors[0], club.colors[1]] : base.seats
    };
  }
  var WONDERS = STADIUMS.filter((s) => s.wonder);
  function nationalStadium(nation, rating = 75, colors = ["#ffffff", "#222222"]) {
    let h = hashStr("nat|".concat(nation)), size = Math.max(0.45, Math.min(0.98, 0.45 + (rating - 68) / 40)), roofs = ["ring", "arch", "dome", "cantilever"], pats = ["stripes", "checks", "diagonal", "rings"];
    return {
      id: "nat-".concat(nation.toLowerCase().replace(/[^a-z]+/g, "-")),
      name: "".concat(nation, " National Stadium"),
      capacity: Math.round((3e4 + size * 6e4) / 1e3) * 1e3,
      size,
      tiers: size > 0.6 ? 2 : 1,
      roof: roofs[h % 4],
      bowl: size > 0.55,
      seats: [colors[0], colors[1]],
      facade: colors[1],
      pattern: pats[(h >>> 4) % 4],
      pylons: size > 0.7 ? "rim" : "mast",
      fill: 0.85 + size * 0.12,
      national: !0
    };
  }

  // js/data/commentary.js
  var L2 = {
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
    card: [
      "Yellow card for {player}. That was reckless.",
      "{player} is booked, and he cannot complain.",
      "Into the book goes {player}.",
      "A caution for {player} — he has to be careful now.",
      "The referee reaches for his pocket. {player} is shown yellow."
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
    // v79
    offside: ["The flag is up. {player} was offside.", "Offside — {player} went too early.", "Flag. {player} strayed beyond the line.", "Offside, and a let-off for the defence."],
    volley: ["{player} meets it on the volley!", "A volley from {player}!", "He hits it first time — {player}!"],
    bicycle: ["An overhead kick from {player}!", "{player} tries the acrobatic one!", "Bicycle kick! {player} goes for the spectacular."],
    knuckle: ["That one moved in the air!", "A knuckleball from {player} — the keeper has no idea where it is going."],
    heavyTouch: ["Heavy touch from {player}.", "{player} lets it get away from him.", "Poor first touch, and they pounce."],
    tactic: ["A change of plan: {team} go to {tactic}.", "{team} switch to {tactic}."],
    adapt: ["{team} have changed things — {tactic} now.", "You can see {team} going for it now.", "{team} look to see this out."],
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
  var LINE_COUNT = Object.values(L2).reduce((n, a) => n + a.length, 0), last = /* @__PURE__ */ new Map();
  function say(key, ctx = {}) {
    let pool = L2[key];
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
  function drawThumb(canvas, st) {
    if (!canvas || !st) return;
    let g = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    g.fillStyle = "#0b1220", g.fillRect(0, 0, W, H);
    let h = 4 + Math.round(st.size * 10), [a, b] = st.seats || ["#1c3f6e", "#14335c"];
    g.fillStyle = b, g.fillRect(8, 2, W - 16, h), g.fillRect(2, 2, 6, H - 4), g.fillRect(W - 8, 2, 6, H - 4), g.fillStyle = a, g.fillRect(8, 2, W - 16, 2), g.fillRect(2, 2, 6, 2), g.fillRect(W - 8, 2, 6, 2), st.bowl && (g.fillStyle = b, g.beginPath(), g.arc(8, 2 + h, h, Math.PI, Math.PI * 1.5), g.lineTo(8, 2), g.fill(), g.beginPath(), g.arc(W - 8, 2 + h, h, Math.PI * 1.5, Math.PI * 2), g.lineTo(W - 8, 2), g.fill()), st.roof && st.roof !== "none" && (g.fillStyle = "#e5e7eb", g.fillRect(8, 1, W - 16, 1)), g.fillStyle = "#2e8845", g.fillRect(9, 3 + h, W - 18, H - 5 - h), g.strokeStyle = "rgba(255,255,255,.6)", g.lineWidth = 1, g.strokeRect(10.5, 4.5 + h, W - 21, H - 8 - h);
  }
  function playMatch(app2, awayId, onDone, level2 = "normal", opts = {}) {
    let lv = LEVELS[level2] || LEVELS.normal, homeClub = WORLD.clubs[0], awayClub = WORLD.clubsById[awayId] || WORLD.clubs[1], ground = stadiumFor(awayClub);
    app2.innerHTML = '\n    <div class="w-match">\n      <canvas id="wPitch"></canvas>\n      <div class="w-venue"><canvas id="wThumb" width="64" height="22"></canvas><span>'.concat(ground.name, '</span></div>\n      <div class="w-hud"><span id="wClock">0\'</span><b id="wScore">0 – 0</b></div>\n      <div class="w-comm" id="wComm" hidden></div>\n      <div class="w-sp" id="wSp" hidden></div>\n      <button class="w-kick" id="wKick">KICK</button>\n    </div>'), drawThumb(app2.querySelector("#wThumb"), ground);
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
    }, match = new Match(HOME_ID, awayId, { duration: DURATION, mode: "single", human: 0, preset: "authentic", skill: lv.skill, field: opts.field || "full" }), input = new Input({ keys: "primary" }), cam = makeCamera(), tighten = () => {
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
        cancelAnimationFrame(raf), window.removeEventListener("resize", onResize), (_a2 = input.destroy) == null || _a2.call(input), onDone(reward, { goals: h.score, conceded: match.teams[1].score, won, level: level2, field: opts.field || "full" });
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
      out.some((x) => x.ev === o.ev) || out.push(o);
    }
    return out.map((o) => o.id);
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
  var KEY2 = "apexxi.watch.v1", START_APEX2 = 5e3, state2 = null, token2 = null, profile = null, solo = !1, lastSync = 0, blank = () => ({
    club: { apex: START_APEX2, collection: [], packs: ["bronze"], freeAt: 0, packsOpened: 0 }
  }), readLocal = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY2)) || null;
    } catch {
      return null;
    }
  }, writeLocal = () => {
    try {
      localStorage.setItem(KEY2, JSON.stringify({ state: state2, token: token2, profile, solo }));
    } catch {
    }
  }, save = () => state2 || blank(), ready = () => !!(token2 || solo), name = () => (profile == null ? void 0 : profile.name) || "", syncLabel = () => solo ? "this watch" : lastSync ? "just now" : "phone account";
  async function boot() {
    let stored = readLocal();
    stored ? (state2 = stored.state || blank(), token2 = stored.token || null, profile = stored.profile || null, solo = !!stored.solo) : state2 = blank(), token2 && await pull();
  }
  async function pair(code) {
    var _a;
    try {
      let res = await fetch("./api/pair/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      }), body = await res.json();
      return res.ok ? (token2 = body.token, profile = body.profile, solo = !1, (_a = body.save) != null && _a.club && (state2 = { club: { ...blank().club, ...body.save.club } }), writeLocal(), { ok: !0 }) : { error: body.error || "Pairing failed." };
    } catch {
      return { error: "No connection to the game." };
    }
  }
  function goSolo() {
    solo = !0, state2 = state2 || blank(), writeLocal();
  }
  async function pull() {
    var _a;
    try {
      let res = await fetch("./api/save", { headers: { Authorization: "Bearer ".concat(token2) } });
      if (!res.ok) {
        res.status === 401 && (token2 = null, writeLocal());
        return;
      }
      let body = await res.json();
      (_a = body.save) != null && _a.club && (state2 = { ...body.save, club: { ...blank().club, ...body.save.club } }, lastSync = Date.now(), writeLocal());
    } catch {
    }
  }
  var pushT = null;
  function push() {
    writeLocal(), token2 && (clearTimeout(pushT), pushT = setTimeout(async () => {
      try {
        await fetch("./api/save", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer ".concat(token2) },
          body: JSON.stringify({ save: state2 })
        }), lastSync = Date.now();
      } catch {
      }
    }, 1200));
  }
  function stat(key) {
    state2.club.watchStats || (state2.club.watchStats = { packs: 0, wins: 0 }), state2.club.watchStats[key] = (state2.club.watchStats[key] | 0) + 1, push();
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
    let t = today2(), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10), d2 = state2.club.daily || (state2.club.daily = { last: null, streak: 0, best: 0, claimedOn: null });
    d2.last !== t && (d2.streak = d2.last === y ? d2.streak + 1 : 1, d2.last = t, d2.best = Math.max(d2.best | 0, d2.streak), push());
    let day2 = (d2.streak - 1) % 7 + 1;
    return { day: day2, streak: d2.streak, claimable: d2.claimedOn !== t, reward: DAILY[day2 - 1] };
  }
  function claimDaily() {
    let st = dailyStatus();
    return st.claimable ? (state2.club.daily.claimedOn = today2(), st.reward.apex && (state2.club.apex = (state2.club.apex || 0) + st.reward.apex), st.reward.pack && (state2.club.packs = state2.club.packs || []).push(st.reward.pack), state2.club.season || (state2.club.season = { id: null, xp: 0, claimed: [] }), state2.club.season.xp = (state2.club.season.xp | 0) + 50, push(), st.reward) : null;
  }
  function earn(apex) {
    state2.club.apex = Math.max(0, (state2.club.apex || 0) + apex), push();
  }
  function buy(pack) {
    state2.club.apex = Math.max(0, (state2.club.apex || 0) - pack.cost), pack.cost === 0 && (state2.club.freeAt = Date.now() + FREE_MS), push();
  }
  function consume(packId) {
    let i = (state2.club.packs || []).indexOf(packId);
    i >= 0 && state2.club.packs.splice(i, 1), push();
  }
  function addCards(drawn) {
    let coll = new Set(state2.club.collection || []);
    for (let { p, dup } of drawn) dup || coll.add(p.id);
    state2.club.collection = [...coll], state2.club.packsOpened = (state2.club.packsOpened || 0) + 1, state2.club.watchStats || (state2.club.watchStats = { packs: 0, wins: 0 }), state2.club.watchStats.packs = (state2.club.watchStats.packs | 0) + 1, push();
  }
  var guildCache = { at: 0, view: null };
  async function guild() {
    if (!token2) return null;
    if (Date.now() - guildCache.at < 6e4) return guildCache.view;
    try {
      let res = await fetch("./api/guild", { headers: { Authorization: "Bearer ".concat(token2) } });
      if (!res.ok) return null;
      let v = await res.json();
      return guildCache = { at: Date.now(), view: v != null && v.guild ? v : null }, guildCache.view;
    } catch {
      return null;
    }
  }
  function fivesResult(scored, conceded) {
    let f = state2.club.watchFives || (state2.club.watchFives = { played: 0, won: 0, drawn: 0, lost: 0 });
    f.played += 1, scored > conceded ? f.won += 1 : scored === conceded ? f.drawn += 1 : f.lost += 1, f.last = { scored, conceded, at: Date.now() }, writeLocal(), push();
  }
  function soloResult(scored, conceded) {
    let f = state2.club.watchSolo || (state2.club.watchSolo = { played: 0, won: 0, drawn: 0, lost: 0, best: 0 });
    f.played += 1, scored > conceded ? f.won += 1 : scored === conceded ? f.drawn += 1 : f.lost += 1, f.best = Math.max(f.best, scored), writeLocal(), push();
  }

  // js/data/cardValue.js
  function roundValue(v) {
    let x = Math.max(150, v);
    return x >= 1e4 ? Math.round(x / 500) * 500 : x >= 1e3 ? Math.round(x / 50) * 50 : Math.round(x / 10) * 10;
  }
  var valueFromPrice = (pr) => roundValue((pr || 0) / 2500), guideValue = (p) => p ? valueFromPrice(Math.round((p.value || 0) / 1e3) * 1e3) : 0;

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
    let s = save(), coll = s.club.collection || [], cards = coll.map((id) => getPlayer(id)).filter(Boolean).sort((a, b) => b.overall - a.overall), best = cards[0], packs = s.club.packs || [], bonus = claimBonus();
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
    })(), '\n    <div class="w-row"><span>Day streak</span><b>🔥 ').concat(streak(), '</b></div>\n    <p class="w-title" style="margin-top:8px">Today</p>\n    ').concat(objs.map((o) => '\n      <div class="w-obj '.concat(o.done ? "done" : "", '">\n        <span>').concat(o.text, "</span>\n        <b>").concat(o.done ? "✓" : "".concat(o.have, "/").concat(o.n), '</b>\n        <i style="width:').concat(Math.round(100 * o.have / o.n), '%"></i>\n      </div>')).join(""), '\n    <div id="wGuild"></div>\n    <div class="w-row"><span>Cards</span><b>').concat(coll.length, '</b></div>\n    <div class="w-row"><span>Packs waiting</span><b>').concat(packs.length, "</b></div>\n    ").concat(best ? '<div class="w-row"><span>Best card</span><b>'.concat(best.overall, " ").concat(best.short, '</b></div>\n      <div class="w-row"><span>Market price</span><b>◈ ').concat(guideValue(best).toLocaleString(), "</b></div>") : "", "\n    ").concat(s.club.watchSolo ? '<div class="w-row"><span>Street 1v1</span><b>'.concat(s.club.watchSolo.won, "W ").concat(s.club.watchSolo.lost, "L</b></div>") : "", "\n    ").concat((() => {
      let f = s.club.fives, w = s.club.watchFives;
      if (!f && !w) return "";
      let last2 = [f == null ? void 0 : f.last, w == null ? void 0 : w.last].filter(Boolean).sort((a, b) => b.at - a.at)[0];
      return '\n      <p class="w-title" style="margin-top:8px">Quickfire Fives</p>\n      <div class="w-row"><span>Record</span><b>'.concat(((f == null ? void 0 : f.won) | 0) + ((w == null ? void 0 : w.won) | 0), "W ").concat(((f == null ? void 0 : f.drawn) | 0) + ((w == null ? void 0 : w.drawn) | 0), "D ").concat(((f == null ? void 0 : f.lost) | 0) + ((w == null ? void 0 : w.lost) | 0), "L</b></div>\n      ").concat(last2 ? '<div class="w-row"><span>Last</span><b>'.concat(last2.scored, " – ").concat(last2.conceded, "</b></div>") : "");
    })(), "\n    ").concat(cards.length ? '<p class="w-title" style="margin-top:8px">Squad</p>\n      <div class="w-grid">'.concat(cards.slice(0, 12).map((p) => {
      var _a2;
      return '\n        <div class="w-mini" style="--rar:'.concat(((_a2 = RARITY[p.rarity]) == null ? void 0 : _a2.color) || "#888", '">\n          <b>').concat(p.overall, "</b><span>").concat(p.position, "</span><em>").concat(p.short, "</em>\n        </div>");
    }).join(""), "</div>") : "", '\n    <div class="w-row"><span>Synced</span><b>').concat(syncLabel(), "</b></div>\n  ")), guild().then((g) => {
      let el = app.querySelector("#wGuild");
      !el || !(g != null && g.guild) || (el.innerHTML = '\n      <p class="w-title" style="margin-top:8px">'.concat(g.guild.name).concat(g.rank ? " · #".concat(g.rank) : "", "</p>\n      ").concat((g.objectives || []).map((o) => '\n        <div class="w-obj '.concat(o.complete ? "done" : "", '">\n          <span>').concat(o.text, "</span>\n          <b>").concat(o.claimed ? "✓" : "".concat(o.have, "/").concat(o.need), '</b>\n          <i style="width:').concat(Math.round(100 * Math.min(1, o.have / o.need)), '%"></i>\n        </div>')).join("")));
    }), (_a = app.querySelector("#wDaily")) == null || _a.addEventListener("click", () => {
      claimDaily() && (buzz2([12, 40, 20]), clubScreen());
    });
  }
  var report = (ev, n = 1) => {
    let pay = event(ev, n);
    pay && (earn(pay), buzz2([10, 30, 10, 30, 10]));
  }, level = "normal";
  function playScreen() {
    let clubs = WORLD.clubs;
    shell('\n    <p class="w-title">Kick Off · 60 seconds</p>\n    <div class="w-chips">'.concat(Object.entries(LEVELS).map(([id, l]) => '<button class="w-chip '.concat(level === id ? "on" : "", '" data-level="').concat(id, '">').concat(l.label, "</button>")).join(""), '</div>\n    <button class="w-btn" data-pens>⚽ Penalties</button>\n    <button class="w-btn" data-fives>⚡ Quickfire Fives</button>\n    <button class="w-btn" data-solo>🏀 Street 1v1</button>\n    <p class="w-sub" style="margin-top:8px">Pick an opponent. Drag to run, tap KICK.</p>\n    ').concat(clubs.map((c) => '\n      <button class="w-btn ghost" data-club="'.concat(c.id, '" style="text-align:left">\n        ').concat(c.short, " · ").concat(c.name, "\n      </button>")).join(""), "\n  ")), app.querySelectorAll("[data-level]").forEach((el) => el.addEventListener("click", () => {
      buzz2(), level = el.dataset.level, playScreen();
    })), app.querySelector("[data-pens]").addEventListener("click", () => {
      buzz2(14);
      let opp = clubs[Math.floor(Math.random() * clubs.length)];
      playPens(app, { oppShort: opp.short, onEvent: (ev) => report(ev) }, (reward) => {
        reward && earn(reward), tab = "play", render();
      });
    }), app.querySelector("[data-fives]").addEventListener("click", () => {
      buzz2(14);
      let opp = clubs[1 + Math.floor(Math.random() * (clubs.length - 1))];
      playMatch(app, opp.id, (reward, stats) => {
        reward && earn(reward), report("match"), stats != null && stats.goals && report("goal", stats.goals), stats != null && stats.won && (report("win"), stat("wins")), fivesResult((stats == null ? void 0 : stats.goals) | 0, (stats == null ? void 0 : stats.conceded) | 0), tab = "play", render();
      }, level, { field: "fives" });
    }), app.querySelector("[data-solo]").addEventListener("click", () => {
      buzz2(14);
      let opp = clubs[1 + Math.floor(Math.random() * (clubs.length - 1))];
      playMatch(app, opp.id, (reward, stats) => {
        reward && earn(reward), report("match"), stats != null && stats.goals && report("goal", stats.goals), stats != null && stats.won && (report("win"), stat("wins")), soloResult((stats == null ? void 0 : stats.goals) | 0, (stats == null ? void 0 : stats.conceded) | 0), tab = "play", render();
      }, level, { field: "street1" });
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
