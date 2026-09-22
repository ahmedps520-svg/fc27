/**
 * The stadiums.
 *
 * Every ground in the world is a compact definition here, and the renderer
 * builds the whole thing — terracing, tiers, roof, pylons, seats, boards,
 * pitch pattern — from these few fields. Nothing is modelled by hand; a new
 * stadium is one line. Forty club grounds, one per club, and four showpiece
 * arenas used for finals, the Weekend League and cup ties.
 *
 * Fields:
 *   size     0..1 — how big the bowl is (depth of terracing, height, capacity)
 *   tiers    1 or 2 — a second tier puts a balcony gap and a steeper upper deck
 *   roof     none | cantilever | ring | arch | dome
 *            cantilever: separate roofs over each stand, open corners
 *            ring: one continuous roof all the way round
 *            arch: cantilever roofs plus a great arch over the far stand
 *            dome: ring roof with a translucent inner rim
 *   bowl     true closes the far corners into a curve
 *   seats    two seat colours (the terraces are two-tone)
 *   facade   the colour of the back walls and roof structure
 *   pattern  stripes | checks | diagonal | rings | plain — how the pitch is mown
 *   pylons   lattice | mast | rim — tall corner pylons, short masts, or a lit roof rim
 *   fill     typical attendance, 0..1 (a match nudges it either way)
 *
 * Time and weather are not part of a stadium; `atmosphereFor` decides those per
 * match, so the same ground is seen at noon, at dusk and in the rain.
 */

export const STADIUMS = [
  // ---- Apex Premier Division ----
  { id: 'forge',      name: 'The Forge',        capacity: 62000, size: 0.92, tiers: 2, roof: 'ring',       bowl: true,  seats: ['#c81e3c', '#1a1c22'], facade: '#1b1f2b', pattern: 'stripes',  pylons: 'rim',     fill: 0.93 },
  { id: 'helios',     name: 'Helios Park',      capacity: 48000, size: 0.78, tiers: 2, roof: 'cantilever', bowl: true,  seats: ['#f2b705', '#12263f'], facade: '#1d2a44', pattern: 'checks',   pylons: 'mast',    fill: 0.86 },
  { id: 'blackmoor',  name: 'Blackmoor',        capacity: 41000, size: 0.70, tiers: 2, roof: 'cantilever', bowl: false, seats: ['#8a3ad6', '#0f0f1a'], facade: '#151428', pattern: 'diagonal', pylons: 'lattice', fill: 0.82 },
  { id: 'verano',     name: 'Estadio Verano',   capacity: 44000, size: 0.74, tiers: 2, roof: 'ring',       bowl: true,  seats: ['#2ec4b6', '#0b132b'], facade: '#10203a', pattern: 'rings',    pylons: 'rim',     fill: 0.84 },
  { id: 'kestrel',    name: 'Kestrel Park',     capacity: 33000, size: 0.58, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#ff7f11', '#2f3640'], facade: '#262b36', pattern: 'stripes',  pylons: 'lattice', fill: 0.80 },
  { id: 'bramble',    name: 'Bramble Lane',     capacity: 29000, size: 0.52, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#4f9d3a', '#d4af37'], facade: '#22301c', pattern: 'checks',   pylons: 'lattice', fill: 0.78 },
  { id: 'marisol',    name: 'Puerto Marisol',   capacity: 36000, size: 0.62, tiers: 2, roof: 'cantilever', bowl: true,  seats: ['#ff5c8a', '#13315c'], facade: '#152742', pattern: 'diagonal', pylons: 'mast',    fill: 0.79 },
  { id: 'nordlys',    name: 'Nordlys Arena',    capacity: 30000, size: 0.55, tiers: 1, roof: 'dome',       bowl: true,  seats: ['#41d3ff', '#2b2d6e'], facade: '#1b1c48', pattern: 'plain',    pylons: 'rim',     fill: 0.88 },
  { id: 'rampart',    name: 'The Rampart',      capacity: 24000, size: 0.44, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#6c8ea4', '#c9d6df'], facade: '#2b3a48', pattern: 'stripes',  pylons: 'lattice', fill: 0.74 },
  { id: 'cumbre',     name: 'Cumbre Stadium',   capacity: 27000, size: 0.49, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#ff2e88', '#150d1f'], facade: '#1c1226', pattern: 'rings',    pylons: 'lattice', fill: 0.72 },
  // ---- Meridian League ----
  { id: 'lantern',    name: 'The Lantern',      capacity: 38000, size: 0.66, tiers: 2, roof: 'ring',       bowl: true,  seats: ['#00b4d8', '#03203c'], facade: '#0a2540', pattern: 'stripes',  pylons: 'rim',     fill: 0.81 },
  { id: 'cliffside',  name: 'Cliffside Park',   capacity: 31000, size: 0.56, tiers: 2, roof: 'cantilever', bowl: false, seats: ['#d62828', '#f1f1f1'], facade: '#3a1c1c', pattern: 'checks',   pylons: 'lattice', fill: 0.83 },
  { id: 'grove',      name: 'Grove Road',       capacity: 22000, size: 0.40, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#2a9d8f', '#1b1b1e'], facade: '#1c2a28', pattern: 'stripes',  pylons: 'lattice', fill: 0.76 },
  { id: 'marsh',      name: 'Marsh Lane',       capacity: 18000, size: 0.33, tiers: 1, roof: 'none',       bowl: false, seats: ['#e9c46a', '#264653'], facade: '#2a3a40', pattern: 'plain',    pylons: 'lattice', fill: 0.70 },
  { id: 'vireo',      name: 'Estadio Vireo',    capacity: 26000, size: 0.47, tiers: 1, roof: 'cantilever', bowl: true,  seats: ['#8ac926', '#101820'], facade: '#18231a', pattern: 'diagonal', pylons: 'mast',    fill: 0.73 },
  { id: 'weir',       name: 'The Weir',         capacity: 20000, size: 0.37, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#a2d2ff', '#1d3557'], facade: '#1d2f4a', pattern: 'stripes',  pylons: 'lattice', fill: 0.71 },
  { id: 'kiln',       name: 'Kiln Field',       capacity: 16000, size: 0.30, tiers: 1, roof: 'none',       bowl: false, seats: ['#f77f00', '#3d0c02'], facade: '#3a1a10', pattern: 'checks',   pylons: 'lattice', fill: 0.77 },
  { id: 'wick',       name: 'Wick Green',       capacity: 15000, size: 0.28, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#adb5bd', '#212529'], facade: '#2b2f36', pattern: 'stripes',  pylons: 'lattice', fill: 0.66 },
  { id: 'lumen',      name: 'Lumen Dome',       capacity: 34000, size: 0.60, tiers: 2, roof: 'dome',       bowl: true,  seats: ['#ffd166', '#5a189a'], facade: '#2a0d4a', pattern: 'rings',    pylons: 'rim',     fill: 0.85 },
  { id: 'nova',       name: 'Campo Nova',       capacity: 19000, size: 0.35, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#ef476f', '#073b4c'], facade: '#0e2a38', pattern: 'diagonal', pylons: 'mast',    fill: 0.69 },
  // ---- Vanguard League ----
  { id: 'steelworks', name: 'Steelworks Park',  capacity: 21000, size: 0.38, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#8d99ae', '#2b2d42'], facade: '#2b2d42', pattern: 'stripes',  pylons: 'lattice', fill: 0.74 },
  { id: 'corvina',    name: 'Corvina Field',    capacity: 14000, size: 0.26, tiers: 1, roof: 'none',       bowl: false, seats: ['#1b263b', '#e0e1dd'], facade: '#1b263b', pattern: 'plain',    pylons: 'lattice', fill: 0.68 },
  { id: 'riverside',  name: 'Riverside',        capacity: 17000, size: 0.31, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#48cae4', '#023e8a'], facade: '#0b2a55', pattern: 'checks',   pylons: 'lattice', fill: 0.72 },
  { id: 'acorn',      name: 'The Acorn',        capacity: 12000, size: 0.22, tiers: 1, roof: 'none',       bowl: false, seats: ['#6a994e', '#386641'], facade: '#2a3f22', pattern: 'stripes',  pylons: 'lattice', fill: 0.70 },
  { id: 'harbour',    name: 'Harbour Ground',   capacity: 15500, size: 0.28, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#0077b6', '#caf0f8'], facade: '#0f3a5a', pattern: 'diagonal', pylons: 'mast',    fill: 0.66 },
  { id: 'summit',     name: 'Summit Road',      capacity: 11000, size: 0.20, tiers: 1, roof: 'none',       bowl: false, seats: ['#2d6a4f', '#d8f3dc'], facade: '#24402f', pattern: 'plain',    pylons: 'lattice', fill: 0.64 },
  { id: 'shaw',       name: 'Shaw Lane',        capacity: 13000, size: 0.24, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#212529', '#ffd60a'], facade: '#26282c', pattern: 'stripes',  pylons: 'lattice', fill: 0.71 },
  { id: 'cross',      name: 'Cross Park',       capacity: 10500, size: 0.19, tiers: 1, roof: 'none',       bowl: false, seats: ['#ff9f1c', '#011627'], facade: '#152030', pattern: 'checks',   pylons: 'lattice', fill: 0.60 },
  { id: 'windmere',   name: 'Estadio Windmere', capacity: 16500, size: 0.30, tiers: 1, roof: 'cantilever', bowl: true,  seats: ['#c77dff', '#10002b'], facade: '#1e0a3a', pattern: 'rings',    pylons: 'mast',    fill: 0.62 },
  { id: 'quarry',     name: 'The Quarry',       capacity: 9000,  size: 0.16, tiers: 1, roof: 'none',       bowl: false, seats: ['#bc6c25', '#283618'], facade: '#33301e', pattern: 'plain',    pylons: 'lattice', fill: 0.65 },
  // ---- Foundation League ----
  { id: 'meadow',     name: 'Meadow Lane',      capacity: 12500, size: 0.23, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#7b2cbf', '#e0aaff'], facade: '#2a1046', pattern: 'stripes',  pylons: 'lattice', fill: 0.66 },
  { id: 'bridge',     name: 'Bridge Street',    capacity: 9500,  size: 0.17, tiers: 1, roof: 'none',       bowl: false, seats: ['#9a031e', '#fb8b24'], facade: '#3a1010', pattern: 'checks',   pylons: 'lattice', fill: 0.69 },
  { id: 'stonefield', name: 'Stonefield',       capacity: 11500, size: 0.21, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#adb5bd', '#343a40'], facade: '#343a40', pattern: 'plain',    pylons: 'lattice', fill: 0.58 },
  { id: 'vale',       name: 'Vale Park',        capacity: 8500,  size: 0.15, tiers: 1, roof: 'none',       bowl: false, seats: ['#00afb9', '#f07167'], facade: '#1d3d44', pattern: 'diagonal', pylons: 'lattice', fill: 0.63 },
  { id: 'heath',      name: 'Heath Road',       capacity: 10000, size: 0.18, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#e63946', '#f1faee'], facade: '#3a1a20', pattern: 'stripes',  pylons: 'lattice', fill: 0.67 },
  { id: 'fen',        name: 'Fen Lane',         capacity: 7500,  size: 0.13, tiers: 1, roof: 'none',       bowl: false, seats: ['#f4a261', '#264653'], facade: '#263a40', pattern: 'plain',    pylons: 'lattice', fill: 0.60 },
  { id: 'dunmore',    name: 'Dunmore Park',     capacity: 9800,  size: 0.18, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#40916c', '#ffffff'], facade: '#1e3a2a', pattern: 'checks',   pylons: 'lattice', fill: 0.72 },
  { id: 'lakeside',   name: 'Lakeside Arena',   capacity: 13500, size: 0.25, tiers: 1, roof: 'cantilever', bowl: true,  seats: ['#dee2e6', '#4361ee'], facade: '#1a2a6a', pattern: 'rings',    pylons: 'mast',    fill: 0.59 },
  { id: 'gate',       name: 'Gate Ground',      capacity: 8000,  size: 0.14, tiers: 1, roof: 'none',       bowl: false, seats: ['#ffb703', '#023047'], facade: '#0c2a40', pattern: 'stripes',  pylons: 'lattice', fill: 0.61 },
  { id: 'colliery',   name: 'Colliery Row',     capacity: 7000,  size: 0.12, tiers: 1, roof: 'none',       bowl: false, seats: ['#3d405b', '#f2cc8f'], facade: '#33344a', pattern: 'plain',    pylons: 'lattice', fill: 0.70 },
  // ---- Pioneer League ----
  { id: 'bridgepark',  name: 'Bridge Park',       capacity: 9000,  size: 0.16, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#1d4ed8', '#f8fafc'], facade: '#1e2a5a', pattern: 'stripes',  pylons: 'lattice', fill: 0.68 },
  { id: 'combe',       name: 'Combe Lane',        capacity: 7200,  size: 0.12, tiers: 1, roof: 'none',       bowl: false, seats: ['#16a34a', '#052e16'], facade: '#14301c', pattern: 'plain',    pylons: 'lattice', fill: 0.64 },
  { id: 'mudflats',    name: 'The Mudflats',      capacity: 6500,  size: 0.11, tiers: 1, roof: 'none',       bowl: false, seats: ['#0ea5e9', '#0c1a2a'], facade: '#0c1a2a', pattern: 'checks',   pylons: 'lattice', fill: 0.7 },
  { id: 'mere',        name: 'Mere Road',         capacity: 8100,  size: 0.14, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#a21caf', '#fdf4ff'], facade: '#3b0f3f', pattern: 'diagonal', pylons: 'lattice', fill: 0.62 },
  { id: 'fallow',      name: 'Fallow Ground',     capacity: 5800,  size: 0.10, tiers: 1, roof: 'none',       bowl: false, seats: ['#ca8a04', '#1c1917'], facade: '#2a2418', pattern: 'plain',    pylons: 'lattice', fill: 0.66 },
  { id: 'ironwood',    name: 'Ironwood Park',     capacity: 7700,  size: 0.13, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#57534e', '#f97316'], facade: '#2c2a28', pattern: 'stripes',  pylons: 'lattice', fill: 0.71 },
  { id: 'brookfield',  name: 'Brook Field',       capacity: 6200,  size: 0.11, tiers: 1, roof: 'none',       bowl: false, seats: ['#f43f5e', '#fff1f2'], facade: '#3a1a22', pattern: 'checks',   pylons: 'lattice', fill: 0.6 },
  { id: 'heathpark',   name: 'Heath Park',        capacity: 5400,  size: 0.09, tiers: 1, roof: 'none',       bowl: false, seats: ['#65a30d', '#1a2e05'], facade: '#1a2e05', pattern: 'plain',    pylons: 'lattice', fill: 0.63 },
  { id: 'moorgate',    name: 'Estadio Moorgate',  capacity: 8800,  size: 0.15, tiers: 1, roof: 'cantilever', bowl: true,  seats: ['#7c3aed', '#faf5ff'], facade: '#2a1548', pattern: 'rings',    pylons: 'mast',    fill: 0.58 },
  { id: 'paddock',     name: 'The Paddock',       capacity: 4900,  size: 0.08, tiers: 1, roof: 'none',       bowl: false, seats: ['#b45309', '#fef3c7'], facade: '#3a2a12', pattern: 'plain',    pylons: 'lattice', fill: 0.67 },
  // ---- Grassroots League ----
  { id: 'riverton',    name: 'Riverton Ground',   capacity: 7000,  size: 0.12, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#0369a1', '#e0f2fe'], facade: '#0c2a40', pattern: 'stripes',  pylons: 'lattice', fill: 0.66 },
  { id: 'hollow',      name: 'Hollow Lane',       capacity: 5600,  size: 0.09, tiers: 1, roof: 'none',       bowl: false, seats: ['#334155', '#cbd5e1'], facade: '#242c3a', pattern: 'plain',    pylons: 'lattice', fill: 0.6 },
  { id: 'barrow',      name: 'Barrow Park',       capacity: 6300,  size: 0.11, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#dc2626', '#fef2f2'], facade: '#3a1414', pattern: 'checks',   pylons: 'lattice', fill: 0.69 },
  { id: 'copper',      name: 'Copper Row',        capacity: 5100,  size: 0.08, tiers: 1, roof: 'none',       bowl: false, seats: ['#d97706', '#292524'], facade: '#2a2018', pattern: 'plain',    pylons: 'lattice', fill: 0.65 },
  { id: 'thistle',     name: 'Thistle Lane',      capacity: 6000,  size: 0.10, tiers: 1, roof: 'none',       bowl: false, seats: ['#7e22ce', '#fde68a'], facade: '#2c1444', pattern: 'diagonal', pylons: 'lattice', fill: 0.61 },
  { id: 'acre',        name: 'Acre Field',        capacity: 4700,  size: 0.07, tiers: 1, roof: 'none',       bowl: false, seats: ['#15803d', '#dcfce7'], facade: '#143220', pattern: 'plain',    pylons: 'lattice', fill: 0.62 },
  { id: 'saltire',     name: 'Saltire Park',      capacity: 6800,  size: 0.12, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#1e3a8a', '#ffffff'], facade: '#1a2a5a', pattern: 'stripes',  pylons: 'lattice', fill: 0.7 },
  { id: 'brookside',   name: 'Brookside Arena',   capacity: 7400,  size: 0.13, tiers: 1, roof: 'cantilever', bowl: true,  seats: ['#0f766e', '#ccfbf1'], facade: '#0f3a34', pattern: 'rings',    pylons: 'mast',    fill: 0.57 },
  { id: 'cinder',      name: 'Cinder Ground',     capacity: 5300,  size: 0.09, tiers: 1, roof: 'none',       bowl: false, seats: ['#f59e0b', '#1c1917'], facade: '#2c2418', pattern: 'checks',   pylons: 'lattice', fill: 0.64 },
  { id: 'hawkrow',     name: 'Hawk Row',          capacity: 4500,  size: 0.07, tiers: 1, roof: 'none',       bowl: false, seats: ['#1f2937', '#fbbf24'], facade: '#1f2937', pattern: 'plain',    pylons: 'lattice', fill: 0.68 },
  // ---- v78: community grounds — a single stand, a rail and a fence ----
  { id: 'millbrook',   name: 'Millbrook Rec',     capacity: 1800,  size: 0.03, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#1e6f5c', '#f4f1de'], facade: '#2b3a33', pattern: 'stripes',  pylons: 'lattice', fill: 0.55 },
  { id: 'ferrylane',   name: 'Ferry Lane',        capacity: 2400,  size: 0.04, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#264653', '#e9c46a'], facade: '#23313a', pattern: 'plain',    pylons: 'lattice', fill: 0.6 },
  { id: 'parish',      name: 'Parish Field',      capacity: 1500,  size: 0.03, tiers: 1, roof: 'none',       bowl: false, seats: ['#6a040f', '#f4f1de'], facade: '#2f2525', pattern: 'plain',    pylons: 'lattice', fill: 0.52 },
  { id: 'coalyard',    name: 'Coalyard Meadow',   capacity: 3200,  size: 0.05, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#111827', '#f59e0b'], facade: '#1f2430', pattern: 'checks',   pylons: 'lattice', fill: 0.62 },
  { id: 'allotments',  name: 'The Allotments',    capacity: 2000,  size: 0.03, tiers: 1, roof: 'none',       bowl: false, seats: ['#2d6a4f', '#95d5b2'], facade: '#24352c', pattern: 'stripes',  pylons: 'lattice', fill: 0.58 },
  { id: 'stationrd',   name: 'Station Road',      capacity: 3800,  size: 0.06, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#1d3557', '#e63946'], facade: '#1d2433', pattern: 'stripes',  pylons: 'lattice', fill: 0.64 },
  { id: 'kilncommon',  name: 'Kiln Common',       capacity: 1200,  size: 0.02, tiers: 1, roof: 'none',       bowl: false, seats: ['#7f5539', '#ede0d4'], facade: '#3a2d24', pattern: 'plain',    pylons: 'lattice', fill: 0.5 },
  { id: 'orchardpk',   name: 'Orchard Park',      capacity: 2900,  size: 0.04, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#386641', '#f2e8cf'], facade: '#27332a', pattern: 'diagonal', pylons: 'lattice', fill: 0.6 },
  // ---- v72: the forty clubs of the hundred-club world ----
  { id: 'vantage-arena', name: 'Vantage Arena', capacity: 78000, size: 0.8, tiers: 2, roof: 'ring', bowl: true, seats: ['#0f172a', '#38bdf8'], facade: '#0f172a', pattern: 'plain', pylons: 'rim', fill: 0.84 },
  { id: 'harbourside', name: 'The Harbourside', capacity: 76200, size: 0.78, tiers: 2, roof: 'ring', bowl: true, seats: ['#7f1d1d', '#fde68a'], facade: '#7f1d1d', pattern: 'checks', pylons: 'rim', fill: 0.83 },
  { id: 'ridgeway-park', name: 'Ridgeway Park', capacity: 62700, size: 0.63, tiers: 2, roof: 'cantilever', bowl: true, seats: ['#065f46', '#a7f3d0'], facade: '#065f46', pattern: 'checks', pylons: 'mast', fill: 0.79 },
  { id: 'stellar-dome', name: 'Stellar Dome', capacity: 60900, size: 0.61, tiers: 2, roof: 'cantilever', bowl: true, seats: ['#312e81', '#c7d2fe'], facade: '#312e81', pattern: 'rings', pylons: 'mast', fill: 0.78 },
  { id: 'haven-road', name: 'Haven Road', capacity: 49200, size: 0.48, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#1d4ed8', '#fef3c7'], facade: '#1d4ed8', pattern: 'checks', pylons: 'mast', fill: 0.74 },
  { id: 'penny-lane', name: 'Penny Lane', capacity: 45600, size: 0.44, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#78350f', '#fde68a'], facade: '#78350f', pattern: 'stripes', pylons: 'lattice', fill: 0.73 },
  { id: 'holloway-ground', name: 'Holloway Ground', capacity: 39300, size: 0.37, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#4c1d95', '#f5f3ff'], facade: '#4c1d95', pattern: 'rings', pylons: 'lattice', fill: 0.71 },
  { id: 'dune-park', name: 'Dune Park', capacity: 35700, size: 0.33, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#b45309', '#fff7ed'], facade: '#b45309', pattern: 'diagonal', pylons: 'lattice', fill: 0.7 },
  { id: 'lakeshore-stadium', name: 'Lakeshore Stadium', capacity: 32100, size: 0.29, tiers: 1, roof: 'cantilever', bowl: false, seats: ['#0e7490', '#ecfeff'], facade: '#0e7490', pattern: 'diagonal', pylons: 'lattice', fill: 0.69 },
  { id: 'cliff-road', name: 'Cliff Road', capacity: 28500, size: 0.25, tiers: 1, roof: 'none', bowl: false, seats: ['#166534', '#dcfce7'], facade: '#166534', pattern: 'checks', pylons: 'lattice', fill: 0.67 },
  { id: 'kings-field', name: 'Kings Field', capacity: 25800, size: 0.22, tiers: 1, roof: 'none', bowl: false, seats: ['#1e3a8a', '#fbbf24'], facade: '#1e3a8a', pattern: 'plain', pylons: 'lattice', fill: 0.67 },
  { id: 'norbury-park', name: 'Norbury Park', capacity: 25800, size: 0.22, tiers: 1, roof: 'none', bowl: false, seats: ['#9f1239', '#fecdd3'], facade: '#9f1239', pattern: 'plain', pylons: 'lattice', fill: 0.67 },
  { id: 'moor', name: 'The Moor', capacity: 22200, size: 0.18, tiers: 1, roof: 'none', bowl: false, seats: ['#0f766e', '#99f6e4'], facade: '#0f766e', pattern: 'rings', pylons: 'lattice', fill: 0.65 },
  { id: 'brook-lane', name: 'Brook Lane', capacity: 19500, size: 0.15, tiers: 1, roof: 'none', bowl: false, seats: ['#b91c1c', '#fee2e2'], facade: '#b91c1c', pattern: 'checks', pylons: 'lattice', fill: 0.65 },
  { id: 'vale-ground', name: 'Vale Ground', capacity: 21300, size: 0.17, tiers: 1, roof: 'none', bowl: false, seats: ['#15803d', '#f0fdf4'], facade: '#15803d', pattern: 'rings', pylons: 'lattice', fill: 0.65 },
  { id: 'bramford-road', name: 'Bramford Road', capacity: 20400, size: 0.16, tiers: 1, roof: 'none', bowl: false, seats: ['#1e40af', '#dbeafe'], facade: '#1e40af', pattern: 'plain', pylons: 'lattice', fill: 0.65 },
  { id: 'crest-park', name: 'Crest Park', capacity: 19500, size: 0.15, tiers: 1, roof: 'none', bowl: false, seats: ['#7c2d12', '#fed7aa'], facade: '#7c2d12', pattern: 'stripes', pylons: 'lattice', fill: 0.65 },
  { id: 'elm-lane', name: 'Elm Lane', capacity: 18600, size: 0.14, tiers: 1, roof: 'none', bowl: false, seats: ['#3f6212', '#ecfccb'], facade: '#3f6212', pattern: 'checks', pylons: 'lattice', fill: 0.64 },
  { id: 'hollow-field', name: 'Hollow Field', capacity: 17700, size: 0.13, tiers: 1, roof: 'none', bowl: false, seats: ['#c2410c', '#ffedd5'], facade: '#c2410c', pattern: 'diagonal', pylons: 'lattice', fill: 0.64 },
  { id: 'glen-road', name: 'Glen Road', capacity: 16800, size: 0.12, tiers: 1, roof: 'none', bowl: false, seats: ['#0c4a6e', '#e0f2fe'], facade: '#0c4a6e', pattern: 'rings', pylons: 'lattice', fill: 0.64 },
  { id: 'green-lane', name: 'Green Lane', capacity: 15900, size: 0.11, tiers: 1, roof: 'none', bowl: false, seats: ['#166534', '#bbf7d0'], facade: '#166534', pattern: 'plain', pylons: 'lattice', fill: 0.63 },
  { id: 'hurst-row', name: 'Hurst Row', capacity: 15000, size: 0.1, tiers: 1, roof: 'none', bowl: false, seats: ['#292524', '#f5f5f4'], facade: '#292524', pattern: 'stripes', pylons: 'lattice', fill: 0.63 },
  { id: 'juniper-park', name: 'Juniper Park', capacity: 14100, size: 0.09, tiers: 1, roof: 'none', bowl: false, seats: ['#5b21b6', '#ede9fe'], facade: '#5b21b6', pattern: 'checks', pylons: 'lattice', fill: 0.63 },
  { id: 'kettle-ground', name: 'Kettle Ground', capacity: 13200, size: 0.08, tiers: 1, roof: 'none', bowl: false, seats: ['#0369a1', '#f0f9ff'], facade: '#0369a1', pattern: 'diagonal', pylons: 'lattice', fill: 0.62 },
  { id: 'langford-road', name: 'Langford Road', capacity: 12300, size: 0.07, tiers: 1, roof: 'none', bowl: false, seats: ['#be123c', '#ffe4e6'], facade: '#be123c', pattern: 'rings', pylons: 'lattice', fill: 0.62 },
  { id: 'heath-lane', name: 'Heath Lane', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#4d7c0f', '#f7fee7'], facade: '#4d7c0f', pattern: 'plain', pylons: 'lattice', fill: 0.62 },
  { id: 'nettle-park', name: 'Nettle Park', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#1f2937', '#fbbf24'], facade: '#1f2937', pattern: 'stripes', pylons: 'lattice', fill: 0.62 },
  { id: 'oakridge-ground', name: 'Oakridge Ground', capacity: 16800, size: 0.12, tiers: 1, roof: 'none', bowl: false, seats: ['#14532d', '#dcfce7'], facade: '#14532d', pattern: 'plain', pylons: 'lattice', fill: 0.64 },
  { id: 'pember-lane', name: 'Pember Lane', capacity: 15900, size: 0.11, tiers: 1, roof: 'none', bowl: false, seats: ['#7f1d1d', '#fecaca'], facade: '#7f1d1d', pattern: 'stripes', pylons: 'lattice', fill: 0.63 },
  { id: 'quarry-vale', name: 'The Vale', capacity: 15000, size: 0.1, tiers: 1, roof: 'none', bowl: false, seats: ['#44403c', '#e7e5e4'], facade: '#44403c', pattern: 'checks', pylons: 'lattice', fill: 0.63 },
  { id: 'rosemont-park', name: 'Rosemont Park', capacity: 14100, size: 0.09, tiers: 1, roof: 'none', bowl: false, seats: ['#be185d', '#fce7f3'], facade: '#be185d', pattern: 'diagonal', pylons: 'lattice', fill: 0.63 },
  { id: 'dale-road', name: 'Dale Road', capacity: 13200, size: 0.08, tiers: 1, roof: 'none', bowl: false, seats: ['#075985', '#e0f2fe'], facade: '#075985', pattern: 'rings', pylons: 'lattice', fill: 0.62 },
  { id: 'thorn-park', name: 'Thorn Park', capacity: 12300, size: 0.07, tiers: 1, roof: 'none', bowl: false, seats: ['#3730a3', '#e0e7ff'], facade: '#3730a3', pattern: 'plain', pylons: 'lattice', fill: 0.62 },
  { id: 'underhill', name: 'Underhill', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#9a3412', '#ffedd5'], facade: '#9a3412', pattern: 'stripes', pylons: 'lattice', fill: 0.62 },
  { id: 'royal-field', name: 'Royal Field', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#6d28d9', '#f5f3ff'], facade: '#6d28d9', pattern: 'checks', pylons: 'lattice', fill: 0.62 },
  { id: 'westbrook-lane', name: 'Westbrook Lane', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#0d9488', '#ccfbf1'], facade: '#0d9488', pattern: 'diagonal', pylons: 'lattice', fill: 0.62 },
  { id: 'yew-lane', name: 'Yew Lane', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#365314', '#ecfccb'], facade: '#365314', pattern: 'rings', pylons: 'lattice', fill: 0.62 },
  { id: 'zealand-ground', name: 'Zealand Ground', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#1e3a8a', '#dbeafe'], facade: '#1e3a8a', pattern: 'plain', pylons: 'lattice', fill: 0.62 },
  { id: 'amber-park', name: 'Amber Park', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#d97706', '#fffbeb'], facade: '#d97706', pattern: 'stripes', pylons: 'lattice', fill: 0.62 },
  { id: 'fen-road', name: 'Fen Road', capacity: 11400, size: 0.06, tiers: 1, roof: 'none', bowl: false, seats: ['#111827', '#f9fafb'], facade: '#111827', pattern: 'checks', pylons: 'lattice', fill: 0.62 },
  // ---- the eight wonders (v72): finals, and the arenas the world plays in ----
  // `wonder` grounds carry a retractable roof, giant screens over both ends,
  // an LED ribbon round the tier and pyrotechnics at kick-off and goals.
  { id: 'crown',      name: 'The Crown',              capacity: 100000, size: 1.0,  tiers: 2, roof: 'arch',  bowl: true, seats: ['#f8fafc', '#0f172a'], facade: '#0b1020', pattern: 'checks',   pylons: 'rim', fill: 0.98, showpiece: true, wonder: true, retractable: true },
  { id: 'aurora-dome', name: 'Aurora Dome',           capacity: 88000,  size: 0.98, tiers: 2, roof: 'dome',  bowl: true, seats: ['#22d3ee', '#0e1a2b'], facade: '#0a2030', pattern: 'rings',    pylons: 'rim', fill: 0.97, showpiece: true, wonder: true, retractable: true },
  { id: 'colosseo',   name: 'Colosseo Nova',          capacity: 92000,  size: 0.99, tiers: 2, roof: 'ring',  bowl: true, seats: ['#fbbf24', '#1c1917'], facade: '#2a2418', pattern: 'diagonal', pylons: 'rim', fill: 0.97, showpiece: true, wonder: true },
  { id: 'oasis',      name: 'Oasis Stadium',          capacity: 84000,  size: 0.97, tiers: 2, roof: 'dome',  bowl: true, seats: ['#34d399', '#052e16'], facade: '#0f2a1a', pattern: 'stripes',  pylons: 'rim', fill: 0.96, showpiece: true, wonder: true, retractable: true },
  { id: 'harbour-arena', name: 'Harbour Arena',       capacity: 80000,  size: 0.96, tiers: 2, roof: 'arch',  bowl: true, seats: ['#60a5fa', '#0c1a3a'], facade: '#0a1a3a', pattern: 'checks',   pylons: 'rim', fill: 0.96, showpiece: true, wonder: true },
  { id: 'summit-bowl', name: 'Summit Bowl',           capacity: 78000,  size: 0.95, tiers: 2, roof: 'ring',  bowl: true, seats: ['#e2e8f0', '#1e293b'], facade: '#1a2233', pattern: 'rings',    pylons: 'rim', fill: 0.95, showpiece: true, wonder: true },
  { id: 'lantern-dome', name: 'The Great Lantern',    capacity: 86000,  size: 0.98, tiers: 2, roof: 'dome',  bowl: true, seats: ['#f472b6', '#1e0a2b'], facade: '#2a0a3a', pattern: 'diagonal', pylons: 'rim', fill: 0.97, showpiece: true, wonder: true, retractable: true },
  { id: 'meridian-prime', name: 'Meridian Prime',     capacity: 95000,  size: 1.0,  tiers: 2, roof: 'arch',  bowl: true, seats: ['#a78bfa', '#0b0a1e'], facade: '#100a2a', pattern: 'stripes',  pylons: 'rim', fill: 0.98, showpiece: true, wonder: true },
  // ---- showpiece arenas: finals, the Weekend League, cup ties ----
  { id: 'apex-arena',  name: 'Apex Arena',           capacity: 90000, size: 1.00, tiers: 2, roof: 'arch',  bowl: true, seats: ['#f0f4ff', '#0a0d16'], facade: '#0e1220', pattern: 'checks',   pylons: 'rim', fill: 0.97, showpiece: true },
  { id: 'meridian',    name: 'Meridian Dome',        capacity: 72000, size: 0.96, tiers: 2, roof: 'dome',  bowl: true, seats: ['#7af7ff', '#08111c'], facade: '#0b1a2c', pattern: 'rings',    pylons: 'rim', fill: 0.95, showpiece: true },
  { id: 'continental', name: 'Continental Bowl',     capacity: 80000, size: 0.98, tiers: 2, roof: 'ring',  bowl: true, seats: ['#ffd166', '#2b2d42'], facade: '#1a1c30', pattern: 'diagonal', pylons: 'rim', fill: 0.96, showpiece: true },
  { id: 'national',    name: 'The National Stadium', capacity: 84000, size: 0.99, tiers: 2, roof: 'arch',  bowl: true, seats: ['#c8102e', '#f5f5f5'], facade: '#221a1e', pattern: 'stripes',  pylons: 'rim', fill: 0.97, showpiece: true },
];

export const STADIUM_BY_ID = Object.fromEntries(STADIUMS.map((s) => [s.id, s]));
const BY_NAME = Object.fromEntries(STADIUMS.map((s) => [s.name, s]));

/** FNV-1a, so the choice of ground and weather never depends on Math.random. */
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * The ground a club plays at.
 *
 * World clubs name theirs (`ground` on the blueprint); that name is the key.
 * Any other club — a Career club, an opponent invented for the Apex ladder —
 * is dealt one by hash so it always gets the same ground, sized by how big a
 * club it is (`level`, 0..1), and it takes the club's own colours in the seats
 * so the stand reads as *theirs* and not as somebody else's ground borrowed.
 */
export function stadiumFor(club, { showpiece = false } = {}) {
  if (showpiece) {
    // finals go to the wonders; the four older arenas keep the Weekend League
    const pick = STADIUMS.filter((s) => (showpiece === 'wonder' ? s.wonder : s.showpiece));
    return pick[hashStr(club?.id || club?.name || 'final') % pick.length];
  }
  if (club?.national) return nationalStadium(club.name, club.rating || 75, club.colors);
  if (!club) return STADIUM_BY_ID.forge;
  // who plays here travels with the ground, so the renderer can dress it for them (v78)
  const host = { id: club.id, name: club.name, country: club.country || null };
  const named = club.ground && BY_NAME[club.ground];
  if (named) return { ...named, host };
  const level = Number.isFinite(club.level) ? club.level : 0.7;
  const pool = STADIUMS.filter((s) => !s.showpiece && Math.abs(s.size - level) < 0.22);
  const base = (pool.length ? pool : STADIUMS.filter((s) => !s.showpiece))[hashStr(club.id || club.name) % (pool.length || STADIUMS.length)];
  return { ...base, id: `${base.id}:${club.id || club.name}`, name: club.ground || base.name, host,
    seats: Array.isArray(club.colors) && club.colors.length === 2 ? [club.colors[0], club.colors[1]] : base.seats };
}

/**
 * Time of day and weather for one match, from a seed. Night is the most
 * common because floodlit football is what the game was tuned on, but a
 * third of matches are played in daylight and about one in five in rain.
 * A caller can force any part of it (Kick Off lets you choose).
 */
export function atmosphereFor(seed, force = {}, { month = null, warm = false } = {}) {
  const h = hashStr(`atmo|${seed}`);
  const a = (h & 0xff) / 255;
  const b = ((h >>> 8) & 0xff) / 255;
  const c = ((h >>> 16) & 0xff) / 255;
  const d = ((h >>> 24) & 0xff) / 255;
  const time = force.time || (a < 0.22 ? 'day' : a < 0.38 ? 'dusk' : 'night');
  let weather = force.weather || (b < 0.18 ? 'rain' : b < 0.36 ? 'overcast' : 'clear');
  /* v78: winter. December to February (month 11, 0, 1) a cold ground can
     see snow — one match in nine — and a clear winter night is often
     frosted. `warm` grounds (the desert) never do. Months are 0-based. */
  const winter = !warm && month != null && (month === 11 || month === 0 || month === 1);
  if (winter && !force.weather && d < 0.11) weather = 'snow';
  const frost = force.frost ?? (winter && weather === 'clear' && time === 'night' && d > 0.45);
  return {
    time,
    weather,
    /** 0..1: how hard the rain (or snow) falls / how heavy the overcast is */
    intensity: 0.4 + c * 0.6,
    wet: weather === 'rain',
    frost,
  };
}

export const TIME_LABEL = { day: 'Afternoon', dusk: 'Dusk', night: 'Night' };
export const WEATHER_LABEL = { clear: 'Clear', overcast: 'Overcast', rain: 'Rain', snow: 'Snow' };

/** The wonders: the eight landmark grounds for finals. */
export const WONDERS = STADIUMS.filter((s) => s.wonder);

/**
 * A national stadium for every nation with a team: sized by the nation's
 * strength, in the flag's colours, its roof and pattern dealt by hash. The
 * nation's name is the ground's name with the country's word for it kept
 * plain — "Stadium" — so it reads the same in every language.
 */
export function nationalStadium(nation, rating = 75, colors = ['#ffffff', '#222222']) {
  const h = hashStr(`nat|${nation}`);
  const size = Math.max(0.45, Math.min(0.98, 0.45 + (rating - 68) / 40));
  const roofs = ['ring', 'arch', 'dome', 'cantilever'];
  const pats = ['stripes', 'checks', 'diagonal', 'rings'];
  return {
    id: `nat-${nation.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    name: `${nation} National Stadium`,
    capacity: Math.round((30000 + size * 60000) / 1000) * 1000,
    size, tiers: size > 0.6 ? 2 : 1,
    roof: roofs[h % 4], bowl: size > 0.55,
    seats: [colors[0], colors[1]], facade: colors[1],
    pattern: pats[(h >>> 4) % 4], pylons: size > 0.7 ? 'rim' : 'mast',
    fill: 0.85 + (size * 0.12), national: true,
  };
}
