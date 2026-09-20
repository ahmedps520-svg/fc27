/**
 * The Stadium Builder — the data half.
 *
 * A design is a handful of choices (bowl, tiers, capacity, roof, pylons,
 * colours, pitch pattern, facade, landscape, whether the club's name is
 * spelled out in the seats). `toDef` turns one into exactly the stadium
 * definition the renderer already builds every world ground from, so a
 * designed ground is drawn by the same code as The Forge, with the three
 * extras the renderer grew for it (lettering, landscape, facade style).
 *
 * Sharing: `encode` packs a design into a short code and `decode` unpacks
 * it. The code carries choices and colours only — never a name, never any
 * text. The lettering is always the *receiver's* own club name, and the
 * ground's name is theirs to pick from the list. No free text crosses
 * between players, by design.
 *
 * Career: the board funds expansions. `GROUND_LEVELS` is the ladder — each
 * step is a capacity and what it costs — and `expansionOffer` says whether
 * the board will pay for the next one or the club has to. A bigger ground
 * means a bigger gate every home match (`gateIncome`) and a fuller, louder
 * bowl (`fill` climbs with the level).
 */
import { hashStr } from './data/stadiums.js';

export const BOWLS = ['open', 'bowl'];                       // corners open, or closed into a curve
export const TIERS = [1, 2, 3];
export const ROOFS = ['none', 'cantilever', 'ring', 'arch', 'dome'];
export const PYLONS = ['lattice', 'mast', 'rim'];
export const PATTERNS = ['stripes', 'checks', 'diagonal', 'rings', 'plain'];
export const FACADES = ['concrete', 'glass', 'brick', 'mesh'];
export const LANDSCAPES = ['city', 'desert', 'coast', 'mountains'];
export const SUFFIXES = ['Stadium', 'Arena', 'Park', 'Ground', 'Dome', 'Bowl', 'Field', 'Lane', 'Road', 'Coliseum'];
export const CAP_MIN = 5000;
export const CAP_MAX = 100000;
export const CAP_STEP = 1000;

export const LABELS = {
  bowl: { open: 'Open corners', bowl: 'Closed bowl' },
  roof: { none: 'No roof', cantilever: 'Cantilever', ring: 'Full ring', arch: 'Great arch', dome: 'Dome' },
  pylons: { lattice: 'Corner pylons', mast: 'Roof masts', rim: 'Lit roof rim' },
  pattern: { stripes: 'Stripes', checks: 'Checks', diagonal: 'Diagonal', rings: 'Rings', plain: 'Plain' },
  facade: { concrete: 'Concrete', glass: 'Glass', brick: 'Brick', mesh: 'Steel mesh' },
  landscape: { city: 'City', desert: 'Desert', coast: 'Coast', mountains: 'Mountains' },
};

const clampCap = (c) => Math.round(Math.max(CAP_MIN, Math.min(CAP_MAX, Number(c) || CAP_MIN)) / CAP_STEP) * CAP_STEP;
const isHex = (h) => /^#[0-9a-f]{6}$/i.test(String(h || ''));

/** A sensible first ground in the club's colours. */
export function defaultDesign(colors = ['#41d3ff', '#0b1020']) {
  return {
    v: 1,
    suffix: 0,
    capacity: 30000,
    tiers: 2,
    bowl: 'bowl',
    roof: 'cantilever',
    pylons: 'mast',
    pattern: 'stripes',
    seats: [isHex(colors[0]) ? colors[0] : '#41d3ff', isHex(colors[1]) ? colors[1] : '#0b1020'],
    facade: '#1f2636',
    facadeStyle: 'concrete',
    landscape: 'city',
    lettering: true,
  };
}

/** Every field forced back into range — what loads from a save or a code goes through here. */
export function normalise(d, colors) {
  const base = defaultDesign(colors);
  if (!d || typeof d !== 'object') return base;
  const pick = (list, v, dflt) => (list.includes(v) ? v : dflt);
  return {
    v: 1,
    suffix: Math.max(0, Math.min(SUFFIXES.length - 1, d.suffix | 0)),
    capacity: clampCap(d.capacity ?? base.capacity),
    tiers: TIERS.includes(d.tiers) ? d.tiers : base.tiers,
    bowl: pick(BOWLS, d.bowl, base.bowl),
    roof: pick(ROOFS, d.roof, base.roof),
    pylons: pick(PYLONS, d.pylons, base.pylons),
    pattern: pick(PATTERNS, d.pattern, base.pattern),
    seats: [isHex(d.seats?.[0]) ? d.seats[0].toLowerCase() : base.seats[0], isHex(d.seats?.[1]) ? d.seats[1].toLowerCase() : base.seats[1]],
    facade: isHex(d.facade) ? d.facade.toLowerCase() : base.facade,
    facadeStyle: pick(FACADES, d.facadeStyle, base.facadeStyle),
    landscape: pick(LANDSCAPES, d.landscape, base.landscape),
    lettering: d.lettering !== false,
  };
}

/** Capacity to the renderer's 0..1 size. 100k is the biggest bowl it draws. */
export const sizeFor = (capacity) => Math.max(0.1, Math.min(1, 0.1 + 0.9 * (clampCap(capacity) - CAP_MIN) / (CAP_MAX - CAP_MIN)));

/** The ground's name: the club's, plus the chosen word. */
export const groundName = (d, clubName) => `${clubName || 'Ultimate XI'} ${SUFFIXES[d.suffix] || SUFFIXES[0]}`;

/**
 * A stadium definition (see data/stadiums.js) from a design. `capacity`
 * overrides the design's — the career caps it at the expansion level.
 */
export function toDef(design, { clubName = 'Ultimate XI', short = 'XI', capacity = null, fill = 0.86 } = {}) {
  const d = normalise(design);
  const cap = clampCap(capacity ?? d.capacity);
  return {
    id: `custom:${hashStr(JSON.stringify(d) + clubName)}`,
    name: groundName(d, clubName),
    capacity: cap,
    size: sizeFor(cap),
    tiers: d.tiers,
    roof: d.roof,
    bowl: d.bowl === 'bowl',
    seats: d.seats,
    facade: d.facade,
    pattern: d.pattern,
    pylons: d.pylons,
    fill,
    lettering: d.lettering ? String(clubName || short).toUpperCase().slice(0, 14) : '',
    landscape: d.landscape,
    facadeStyle: d.facadeStyle,
    custom: true,
  };
}

/* ------------------------------ share codes ------------------------------
 * 15 bytes: capacity/1000 (7 bits) | tiers (2) | bowl (1) | roof (3) |
 * pylons (2) | pattern (3) | facade style (2) | landscape (2) | lettering (1)
 * | suffix (4), then three RGB colours and a checksum. Base32 with an
 * alphabet that has no 0/O or 1/I, grouped in fours for reading aloud. */
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';        // 31 symbols — base31, no lookalikes
const PREFIX = 'SB1';

function packBits(fields) {
  let big = 0n;
  for (const [value, bits] of fields) big = (big << BigInt(bits)) | BigInt(value & ((1 << bits) - 1));
  return big;
}
function unpackBits(big, widths) {
  const out = [];
  for (let i = widths.length - 1; i >= 0; i--) { out[i] = Number(big & ((1n << BigInt(widths[i])) - 1n)); big >>= BigInt(widths[i]); }
  return out;
}
const hexBytes = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const WIDTHS = [7, 2, 1, 3, 2, 3, 2, 2, 1, 4, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];

export function encode(design) {
  const d = normalise(design);
  const bytes = [...hexBytes(d.seats[0]), ...hexBytes(d.seats[1]), ...hexBytes(d.facade)];
  const fields = [
    [d.capacity / CAP_STEP, 7], [d.tiers, 2], [d.bowl === 'bowl' ? 1 : 0, 1], [ROOFS.indexOf(d.roof), 3],
    [PYLONS.indexOf(d.pylons), 2], [PATTERNS.indexOf(d.pattern), 3], [FACADES.indexOf(d.facadeStyle), 2],
    [LANDSCAPES.indexOf(d.landscape), 2], [d.lettering ? 1 : 0, 1], [d.suffix, 4],
    ...bytes.map((b) => [b, 8]),
  ];
  const sum = fields.reduce((s, [v]) => (s + v) & 255, 7);
  fields.push([sum, 8]);
  let big = packBits(fields);
  let out = '';
  while (big > 0n) { out = ALPHA[Number(big % 31n)] + out; big /= 31n; }
  out = out.padStart(24, ALPHA[0]);
  return `${PREFIX}-${out.match(/.{1,4}/g).join('-')}`;
}

/** The design in a code, or null when the code is not one of ours. */
export function decode(code, colors) {
  const raw = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!raw.startsWith(PREFIX) || raw.length !== PREFIX.length + 24) return null;
  let big = 0n;
  for (const ch of raw.slice(PREFIX.length)) {
    const i = ALPHA.indexOf(ch);
    if (i < 0) return null;
    big = big * 31n + BigInt(i);
  }
  const v = unpackBits(big, WIDTHS);
  const sum = v.slice(0, -1).reduce((s, x) => (s + x) & 255, 7);
  if (sum !== v[v.length - 1]) return null;
  const hex = (r, g, b) => `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  return normalise({
    capacity: v[0] * CAP_STEP, tiers: v[1], bowl: v[2] ? 'bowl' : 'open', roof: ROOFS[v[3]], pylons: PYLONS[v[4]],
    pattern: PATTERNS[v[5]], facadeStyle: FACADES[v[6]], landscape: LANDSCAPES[v[7]], lettering: !!v[8], suffix: v[9],
    seats: [hex(v[10], v[11], v[12]), hex(v[13], v[14], v[15])], facade: hex(v[16], v[17], v[18]),
  }, colors);
}

/* ------------------------------ the career ------------------------------ */
/** Capacity ladder and what each step costs. Level 0 is what a club starts with. */
export const GROUND_LEVELS = [
  { capacity: 15000, cost: 0 },
  { capacity: 22000, cost: 12_000_000 },
  { capacity: 30000, cost: 25_000_000 },
  { capacity: 40000, cost: 45_000_000 },
  { capacity: 52000, cost: 70_000_000 },
  { capacity: 65000, cost: 100_000_000 },
  { capacity: 80000, cost: 140_000_000 },
  { capacity: 100000, cost: 190_000_000 },
];
export const TICKET = 42;                    // coins a seat pays per home match

export const groundOf = (car) => car?.ground || { level: 0, income: 0, expandedSeason: 0 };
export const groundLevel = (car) => Math.max(0, Math.min(GROUND_LEVELS.length - 1, groundOf(car).level | 0));
export const groundCapacity = (car) => GROUND_LEVELS[groundLevel(car)].capacity;
/** Fuller and louder as the ground grows: a level-0 ground is three quarters full, the top one packed. */
export const groundFill = (car) => 0.74 + groundLevel(car) * 0.03;
/** What one home match pays. */
export const gateIncome = (car) => Math.round(groundCapacity(car) * groundFill(car) * TICKET);

/**
 * The next step, and who pays for it. The board funds the whole thing when
 * the club is doing what it asked (sitting at or above the target finish
 * with its patience intact); otherwise the club can pay out of its own
 * coins. One expansion a season, so the ground grows with the club rather
 * than in one summer.
 */
export function expansionOffer(car, position = null) {
  const level = groundLevel(car);
  const next = GROUND_LEVELS[level + 1];
  if (!next) return { done: true, level, capacity: groundCapacity(car) };
  const g = groundOf(car);
  const thisSeason = g.expandedSeason === car.season;
  const onTarget = position != null && car.board ? position <= car.board.finish && car.board.patience >= 0.55 : false;
  return {
    level, next: level + 1, capacity: groundCapacity(car), nextCapacity: next.capacity, cost: next.cost,
    boardPays: onTarget && !thisSeason,
    clubCanPay: !thisSeason && car.coins >= next.cost,
    thisSeason,
  };
}

/** Apply an expansion to the career slice (call inside `update`). Returns what happened. */
export function expand(car, position = null) {
  const offer = expansionOffer(car, position);
  if (offer.done || offer.thisSeason) return { ok: false, why: offer.done ? 'The ground is as big as they come.' : 'One expansion a season — the builders are already in.' };
  const g = car.ground = { ...groundOf(car) };
  if (offer.boardPays) { /* the board's money, not the club's */ }
  else if (offer.clubCanPay) car.coins -= offer.cost;
  else return { ok: false, why: `The board will not fund it while the club is below its target, and the club cannot afford ${offer.cost.toLocaleString()} itself.` };
  g.level = offer.next;
  g.expandedSeason = car.season;
  return { ok: true, boardPaid: offer.boardPays, capacity: GROUND_LEVELS[g.level].capacity };
}

/** Bank a home gate (call inside `update`, on a home fixture). */
export function bankGate(car) {
  const gate = gateIncome(car);
  car.coins += gate;
  car.ground = { ...groundOf(car), income: (groundOf(car).income || 0) + gate };
  return gate;
}
