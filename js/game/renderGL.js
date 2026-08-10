import * as THREE from '../vendor/three.module.js';
import { EffectComposer } from '../vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/jsm/postprocessing/OutputPass.js';
import { PITCH, GOAL_HALF, BOX } from './sim.js';
import { NetCloth } from './net.js';
import { faceOf } from '../components/face.js';
import { loadPlayerModel, makeRig, poseRig } from './playerModel.js';
import { CinematicPass } from './cinematic.js';

/* ------------------------------------------------------------------ *
 * WebGL renderer (three.js). Real meshes, real lights, real shadows.
 * The world is z-up to match the simulation, so the camera's up vector
 * is set accordingly and geometry is placed in sim coordinates directly.
 * ------------------------------------------------------------------ */

const CY = PITCH.h / 2;
const GOAL_H = 2.44;
const MARGIN = 6;
const STAND_FRONT_Z = 1.9;
/* The stand's front wall is fixed — it is the wall the perimeter boards lean
   against. Its depth, height and roof come from `stadiumSpec` per ground. */

const SKINS = [0xf5d0b0, 0xe2b085, 0xc68960, 0x965e3c, 0x623e28];

/* ------------------------------ the ground ------------------------------
 *
 * Every match used to be played in the same stadium: the same three stands, the
 * same height, the same roof, the same crowd, every time. One ground for a
 * whole game is the sort of thing you stop seeing after a week and never stop
 * feeling.
 *
 * `stadiumSpec` invents one from a seed. The seed is the two team names, so a
 * fixture always looks the same ground twice — and because the Apex Division
 * fields a different opponent club on every rung, climbing the ladder walks you
 * through eleven different stadiums, each bigger and louder than the last only
 * because you happen to be meeting them in that order.
 *
 * Size and attendance are drawn **independently**. A packed small ground and a
 * half-empty bowl are both real, and both more interesting than every stadium
 * being full.
 */
const SEAT_PALETTES = [
  [0x1c3f6e, 0x14335c],   // navy
  [0x7a1f2b, 0x5e1520],   // claret
  [0x1d5236, 0x143b27],   // green
  [0x4a3570, 0x352550],   // purple
  [0x8a6a1e, 0x6b5216],   // gold
  [0x2b3138, 0x1e2329],   // graphite
  [0x0e5a63, 0x0a4248],   // teal
];

const hashName = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

function stadiumSpec(seed) {
  const r = mulberry(seed || 1);
  const scale = r();                         // 0 = a small ground, 1 = a big one
  const packed = 0.42 + r() * 0.56;          // and how many of them turned up

  return {
    scale,
    /** How far back the terracing runs, and how high it climbs. */
    depth: 11 + scale * 21,
    backZ: 7 + scale * 16,
    /** Small grounds are open to the sky; anything mid-size up is covered. */
    roof: scale > 0.30,
    /** Only the genuinely big ones close their corners into a bowl. */
    bowl: scale > 0.64,
    /** Occupancy, 0..1. Independent of size on purpose. */
    fill: Math.min(0.97, packed + scale * 0.1),
    seats: SEAT_PALETTES[(r() * SEAT_PALETTES.length) | 0],
    /** Tall corner pylons, or short masts on the roof of a covered ground. */
    tallPylons: scale < 0.64,
  };
}
const HAIRS = [0x1c1614, 0x3a2618, 0x7a542a, 0x141212, 0x5a422c];
const CROWD_COLS = [
  0xced4e0, 0x3a4256, 0x962834, 0x1e283e, 0xd6b05c,
  0x5c6880, 0xb03e58, 0x28524a, 0xe8e8ec, 0x46362e,
];
const GK_KIT = 0xc6f24a;

const UP_Y = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hexOf = (c) => parseInt(String(c).replace('#', ''), 16);
function pickAwayKit(match) {
  const home = new THREE.Color(hexOf(match.teams[0].colors[0]));
  const tryCols = [match.teams[1].colors[0], match.teams[1].colors[1], '#f2f4f8', '#1b1d24'];
  for (const c of tryCols) {
    const col = new THREE.Color(hexOf(c));
    if (Math.abs(col.r - home.r) + Math.abs(col.g - home.g) + Math.abs(col.b - home.b) > 0.55) return col;
  }
  return new THREE.Color(0xf2f4f8);
}

/* --------------------------- pitch texture -------------------------
 *
 * The pitch is three textures, not one, and that split is the whole reason it
 * stopped looking like a flat green rectangle with lines drawn on it.
 *
 *  - `pitchTexture`  colour: mown stripes, wear, and the markings. Low
 *                    frequency, so it can be laid over the whole 105x68 m at a
 *                    modest resolution without looking soft.
 *  - `turfDetail`    a small tiling square of blade noise, repeated ~40 times
 *                    across the pitch. This is where the actual grass lives.
 *                    Baking blades into the colour map instead would need a
 *                    canvas around 7000 px square.
 *  - `pitchRoughness` where the mower left the grass lying towards you and
 *                    where it left it lying away. Real broadcast turf reads as
 *                    stripes because those two directions catch the floodlights
 *                    differently — it is a *specular* difference far more than a
 *                    colour one, which is what the old two-tone green missed.
 */

/** How many bands the mower leaves across the width. */
const STRIPES = 16;

/** Tiling blade noise, used as the turf's normal map. One square metre or so. */
function turfDetail(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#8080ff';                       // flat normal
  g.fillRect(0, 0, size, size);

  // Individual blades, leaning slightly, drawn as tiny tilted normals. Drawn
  // wrapped past every edge so the tile has no visible seam.
  const rand = mulberry(9137);
  g.lineWidth = 1.4;
  for (let i = 0; i < size * 5; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const lean = (rand() - 0.5) * 1.1;
    const len = 2 + rand() * 4;
    // encode the lean into R (x) and G (y) around the 128 neutral
    const r = Math.round(128 + lean * 62);
    const gg = Math.round(128 - (0.35 + rand() * 0.5) * 52);
    g.strokeStyle = `rgb(${r},${gg},235)`;
    for (const [ox, oy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
      g.beginPath();
      g.moveTo(x + ox, y + oy);
      g.lineTo(x + ox + lean * len, y + oy - len);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** Per-stripe gloss plus the worn patches, so the mow catches the lights. */
function pitchRoughness() {
  const S = 6;
  const c = document.createElement('canvas');
  c.width = Math.round(PITCH.w * S);
  c.height = Math.round(PITCH.h * S);
  const g = c.getContext('2d');
  const m = (v) => v * S;

  for (let i = 0; i < STRIPES; i++) {
    // grass lying away from you is glossy, lying towards you is matt
    g.fillStyle = i % 2 ? '#d2d2d2' : '#f0f0f0';
    g.fillRect((c.width / STRIPES) * i, 0, c.width / STRIPES + 1, c.height);
  }
  // worn ground has no gloss left in it at all
  wearPatches((x, y, r) => {
    const grad = g.createRadialGradient(m(x), m(y), 0, m(x), m(y), m(r));
    grad.addColorStop(0, 'rgba(255,255,255,.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(m(x), m(y), m(r), 0, 7); g.fill();
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}


/**
 * Where a pitch gets worn: both goalmouths, the penalty spots, the centre
 * circle, and the two touchline strips the full-backs live in. Nothing says
 * "played on" like a pitch that is not uniform, and nothing says "generated"
 * like one that is.
 *
 * @param {(x:number, y:number, r:number) => void} put called per patch, in metres
 */
function wearPatches(put) {
  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? 1 : -1;
    put(gx + inw * 3.2, CY, 8.5);            // the goalmouth
    put(gx + inw * 11, CY, 2.4);             // the penalty spot
    put(gx + inw * 16.5, CY, 4.2);           // the edge of the D
  }
  put(PITCH.w / 2, CY, 7);                   // the centre circle
  put(PITCH.w * 0.32, 4.5, 6);               // the channels the full-backs run
  put(PITCH.w * 0.68, PITCH.h - 4.5, 6);
}

function pitchTexture(detail = true) {
  const S = detail ? 22 : 12;                     // pixels per metre
  const c = document.createElement('canvas');
  c.width = Math.round(PITCH.w * S);
  c.height = Math.round(PITCH.h * S);
  const g = c.getContext('2d');
  const m = (v) => v * S;

  /* Mown stripes: flat bands, with the blend only at the seam.
     A first attempt ran a gradient across the full width of each band, which
     put a shade change down the *middle* of every stripe and made sixteen
     stripes read as thirty-two. A mower leaves each pass uniform; the only soft
     edge is where two passes meet, and it is about a boot's width wide. */
  const sw = c.width / STRIPES;
  for (let i = 0; i < STRIPES; i++) {
    g.fillStyle = i % 2 ? '#2e8845' : '#256f38';
    g.fillRect(sw * i - 1, 0, sw + 2, c.height);
  }
  const feather = m(0.35);
  for (let i = 1; i < STRIPES; i++) {
    const x = sw * i;
    const grad = g.createLinearGradient(x - feather, 0, x + feather, 0);
    grad.addColorStop(0, i % 2 ? '#256f38' : '#2e8845');
    grad.addColorStop(1, i % 2 ? '#2e8845' : '#256f38');
    g.fillStyle = grad;
    g.fillRect(x - feather, 0, feather * 2, c.height);
  }

  // worn, paler, yellower ground before anything else goes on top
  wearPatches((x, y, r) => {
    const grad = g.createRadialGradient(m(x), m(y), 0, m(x), m(y), m(r));
    grad.addColorStop(0, 'rgba(150,158,96,.34)');
    grad.addColorStop(0.6, 'rgba(140,150,92,.16)');
    grad.addColorStop(1, 'rgba(140,150,92,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(m(x), m(y), m(r), 0, 7); g.fill();
  });

  // mower arcs — the long sweeping curves a triple gang leaves behind
  g.globalAlpha = 0.028;
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = i % 2 ? '#ffffff' : '#000000';
    g.lineWidth = 2 + Math.random() * 5;
    g.beginPath();
    g.moveTo(Math.random() * c.width, 0);
    g.bezierCurveTo(Math.random() * c.width, c.height * 0.4,
      Math.random() * c.width, c.height * 0.7, Math.random() * c.width, c.height);
    g.stroke();
  }
  g.globalAlpha = 1;

  /* Two octaves of grain: patchiness, then per-texel speckle.
     The patches have to stay under about a metre. A first pass used blobs up to
     2.4 m across at four times this opacity and the pitch came out looking
     mouldy — at that scale a circle reads as a circle, not as grass. */
  g.globalAlpha = 0.05;
  for (let i = 0; i < 2200; i++) {
    const r = m(0.18 + Math.random() * 0.85);
    g.fillStyle = Math.random() < 0.5 ? '#1d6030' : '#43a05c';
    g.beginPath();
    g.arc(Math.random() * c.width, Math.random() * c.height, r, 0, 7);
    g.fill();
  }
  g.globalAlpha = 1;
  const grain = g.getImageData(0, 0, c.width, c.height);
  const px = grain.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    px[i] += n; px[i + 1] += n * 1.2; px[i + 2] += n * 0.6;
  }
  g.putImageData(grain, 0, 0);

  /* Markings.
   *
   * Painted, not drawn: a touch of blur and a hair under full white, because
   * pin-sharp pure-white vector lines were a large part of why this read as a
   * diagram. The corner arcs and the two penalty arcs were simply missing
   * before — the most conspicuous omission on the whole surface. */
  g.save();
  g.strokeStyle = 'rgba(248,252,255,.82)';
  g.fillStyle = 'rgba(248,252,255,.82)';
  g.lineWidth = Math.max(2, m(0.12));
  g.shadowColor = 'rgba(255,255,255,.35)';
  g.shadowBlur = Math.max(1, m(0.05));
  const L = 0.3;                                   // inset of the touchline

  g.strokeRect(m(L), m(L), m(PITCH.w - L * 2), m(PITCH.h - L * 2));
  g.beginPath(); g.moveTo(m(PITCH.w / 2), m(L)); g.lineTo(m(PITCH.w / 2), m(PITCH.h - L)); g.stroke();
  g.beginPath(); g.arc(m(PITCH.w / 2), m(CY), m(9.15), 0, 7); g.stroke();
  g.beginPath(); g.arc(m(PITCH.w / 2), m(CY), m(0.35), 0, 7); g.fill();

  for (const side of [0, 1]) {
    const gx = side === 0 ? L : PITCH.w - L;
    const inw = side === 0 ? 1 : -1;
    const spot = gx + inw * 11;
    g.strokeRect(side === 0 ? m(L) : m(PITCH.w - L - BOX.w), m(CY - BOX.half),
      m(BOX.w), m(BOX.half * 2));
    g.strokeRect(side === 0 ? m(L) : m(PITCH.w - L - 5.5), m(CY - 9.16),
      m(5.5), m(18.32));
    g.beginPath(); g.arc(m(spot), m(CY), m(0.3), 0, 7); g.fill();

    /* The D: a 9.15 m arc about the penalty spot, clipped to the part that
       falls outside the box — which is the only part that gets painted. */
    const boxEdge = gx + inw * BOX.w;
    const half = Math.acos(Math.abs(boxEdge - spot) / 9.15);
    const face = side === 0 ? 0 : Math.PI;
    g.beginPath();
    g.arc(m(spot), m(CY), m(9.15), face - half, face + half);
    g.stroke();

    /* Corner arcs: 1 m radius, a quarter turn, always the quarter that faces
       into the field of play. Canvas angles run from +x with +y pointing down,
       so the start angle is picked from which corner this is. */
    const left = side === 0;
    for (const top of [true, false]) {
      const cy = top ? L : PITCH.h - L;
      const from = left
        ? (top ? 0 : Math.PI * 1.5)
        : (top ? Math.PI * 0.5 : Math.PI);
      g.beginPath();
      g.arc(m(gx), m(cy), m(1), from, from + Math.PI / 2);
      g.stroke();
    }
  }
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Generic panelled ball — markings are what make the roll readable. */
function ballTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f6fa';
  g.fillRect(0, 0, c.width, c.height);

  // staggered dark panels around the equator and caps
  g.fillStyle = '#15181f';
  const blob = (cx, cy, r) => {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.82;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
  };
  for (let i = 0; i < 6; i++) blob((i + 0.5) * (c.width / 6), 34, 15);
  for (let i = 0; i < 6; i++) blob(i * (c.width / 6), 94, 15);
  blob(30, 64, 11); blob(158, 64, 11);

  // seams
  g.strokeStyle = 'rgba(20,24,32,.35)';
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.moveTo(i * (c.width / 6), 0);
    g.lineTo(i * (c.width / 6), c.height);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Night sky: gradient horizon glow with stars, used as background and IBL source. */
function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#02040a');
  grad.addColorStop(0.55, '#060c1c');
  grad.addColorStop(0.78, '#0d1a33');
  grad.addColorStop(1, '#16324d');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 1400; i++) {
    const y = Math.pow(Math.random(), 1.7) * c.height * 0.72;
    const a = 0.25 + Math.random() * 0.75;
    g.fillStyle = `rgba(220,232,255,${a * (1 - y / c.height)})`;
    const r = Math.random() < 0.06 ? 1.6 : 0.75;
    g.beginPath();
    g.arc(Math.random() * c.width, y, r, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Invented sponsors for the perimeter boards. Every name, mark and strapline
 * here is made up for this game — same rule as the clubs and players.
 */
const SPONSORS = [
  { name: 'VOLTARA', tag: 'ENERGY SYSTEMS', bg: '#0b1a3c', fg: '#4ea8ff', accent: '#9ad0ff', mark: 'bolt' },
  { name: 'KESTREL', tag: 'AIRWAYS', bg: '#12233a', fg: '#f2f6ff', accent: '#ff9c3d', mark: 'wing' },
  { name: 'NOVAFIT', tag: 'PERFORMANCE WEAR', bg: '#1b0f2e', fg: '#c9a4ff', accent: '#ff5cc8', mark: 'arc' },
  { name: 'IRONCLAD', tag: 'INSURANCE GROUP', bg: '#101a16', fg: '#7de3a8', accent: '#d8f5e4', mark: 'shield' },
  { name: 'LUMEN', tag: 'BROADBAND', bg: '#001f2b', fg: '#3fe0d0', accent: '#b9fff6', mark: 'ring' },
  { name: 'AURIC', tag: 'PRIVATE BANK', bg: '#241c07', fg: '#f0c765', accent: '#fff0c2', mark: 'diamond' },
  { name: 'TERRAFORM', tag: 'CIVIL ENGINEERING', bg: '#22160c', fg: '#ffab5e', accent: '#ffd8b0', mark: 'tri' },
  { name: 'MERIDIAN', tag: 'TIMEPIECES', bg: '#0a0d16', fg: '#dfe6f5', accent: '#9fb4d8', mark: 'ring' },
  { name: 'ZEPHYR', tag: 'ELECTRIC MOTORS', bg: '#06202a', fg: '#65e8ff', accent: '#c9f7ff', mark: 'bolt' },
  { name: 'PULSE', tag: 'SPORTS DRINK', bg: '#2b0713', fg: '#ff6b8a', accent: '#ffd0da', mark: 'arc' },
  // A touchline is 125 m long. Ten sponsors could not fill it without the run
  // tiling back on itself every few metres, which is what made the ground look
  // like one company had bought the whole stadium.
  { name: 'HALCYON', tag: 'HOTELS & RESORTS', bg: '#0d1f1c', fg: '#8fe0c4', accent: '#e6fff5', mark: 'wave' },
  { name: 'GRIDIRON', tag: 'LOGISTICS', bg: '#1a1206', fg: '#ffc94d', accent: '#3a2a08', mark: 'blocks' },
  { name: 'CASTELLAN', tag: 'PROPERTY', bg: '#0e1526', fg: '#a9c2ff', accent: '#e8efff', mark: 'crown' },
  { name: 'OBSIDIAN', tag: 'GAMING', bg: '#150a20', fg: '#b968ff', accent: '#f0dcff', mark: 'chevron' },
  { name: 'SALTWORKS', tag: 'BREWERY', bg: '#231404', fg: '#ffb45e', accent: '#fff0d8', mark: 'wave' },
  { name: 'ORBIS', tag: 'SATELLITE TV', bg: '#040c1e', fg: '#6fa8ff', accent: '#cfe2ff', mark: 'orbit' },
  { name: 'VERDANT', tag: 'GARDEN CENTRES', bg: '#0c1c0e', fg: '#8ddb63', accent: '#e2ffd4', mark: 'leaf' },
  { name: 'FLINT & CO', tag: 'MENSWEAR', bg: '#16161a', fg: '#e8e4dc', accent: '#b8a27a', mark: 'chevron' },
  { name: 'NIMBUS', tag: 'CLOUD SERVICES', bg: '#08161f', fg: '#7fdcff', accent: '#dff6ff', mark: 'orbit' },
  { name: 'ROOKWOOD', tag: 'BUILDING SOCIETY', bg: '#1b1010', fg: '#ff8b7a', accent: '#ffdcd6', mark: 'shield' },
  { name: 'AMPERSAND', tag: 'RECRUITMENT', bg: '#0a1418', fg: '#5fe0b8', accent: '#d6fff2', mark: 'ring' },
  { name: 'STARLING', tag: 'MOBILE', bg: '#1d0a17', fg: '#ff7ac0', accent: '#ffd9ee', mark: 'wing' },
  { name: 'PENNANT', tag: 'SPORTSBOOK', bg: '#0f1a0c', fg: '#bfe85a', accent: '#f0ffd0', mark: 'tri' },
  { name: 'CALDERA', tag: 'HEATING', bg: '#200c06', fg: '#ff8a3d', accent: '#ffd9bd', mark: 'bolt' },
];

function drawMark(g, kind, x, y, r, col) {
  g.fillStyle = col;
  g.strokeStyle = col;
  g.lineWidth = r * 0.28;
  g.beginPath();
  if (kind === 'bolt') {
    g.moveTo(x + r * 0.25, y - r); g.lineTo(x - r * 0.45, y + r * 0.1);
    g.lineTo(x + r * 0.05, y + r * 0.1); g.lineTo(x - r * 0.2, y + r);
    g.lineTo(x + r * 0.55, y - r * 0.15); g.lineTo(x + r * 0.05, y - r * 0.15);
    g.closePath(); g.fill();
  } else if (kind === 'shield') {
    g.moveTo(x, y - r); g.lineTo(x + r * 0.8, y - r * 0.5);
    g.quadraticCurveTo(x + r * 0.8, y + r * 0.6, x, y + r);
    g.quadraticCurveTo(x - r * 0.8, y + r * 0.6, x - r * 0.8, y - r * 0.5);
    g.closePath(); g.fill();
  } else if (kind === 'ring') {
    g.arc(x, y, r * 0.75, 0, 7); g.stroke();
  } else if (kind === 'diamond') {
    g.moveTo(x, y - r); g.lineTo(x + r * 0.75, y); g.lineTo(x, y + r);
    g.lineTo(x - r * 0.75, y); g.closePath(); g.fill();
  } else if (kind === 'tri') {
    g.moveTo(x, y - r); g.lineTo(x + r * 0.9, y + r * 0.7);
    g.lineTo(x - r * 0.9, y + r * 0.7); g.closePath(); g.fill();
  } else if (kind === 'wing') {
    g.moveTo(x - r, y + r * 0.5); g.quadraticCurveTo(x, y - r * 1.1, x + r, y - r * 0.2);
    g.quadraticCurveTo(x * 1, y + r * 0.1, x - r, y + r * 0.5);
    g.closePath(); g.fill();
  } else if (kind === 'chevron') {
    g.moveTo(x - r * 0.8, y + r * 0.65); g.lineTo(x, y - r * 0.5);
    g.lineTo(x + r * 0.8, y + r * 0.65);
    g.lineWidth = r * 0.34; g.stroke();
    g.beginPath();
    g.moveTo(x - r * 0.8, y - r * 0.05); g.lineTo(x, y - r * 1.2);
    g.lineTo(x + r * 0.8, y - r * 0.05);
    g.stroke();
  } else if (kind === 'orbit') {
    g.arc(x, y, r * 0.42, 0, 7); g.fill();
    g.beginPath();
    g.ellipse(x, y, r * 0.95, r * 0.38, -0.5, 0, 7);
    g.lineWidth = r * 0.16; g.stroke();
  } else if (kind === 'blocks') {
    const u = r * 0.62;
    g.fillRect(x - u, y - u, u * 0.82, u * 0.82);
    g.fillRect(x + u * 0.18, y - u, u * 0.82, u * 0.82);
    g.fillRect(x - u, y + u * 0.18, u * 0.82, u * 0.82);
  } else if (kind === 'leaf') {
    g.moveTo(x, y + r);
    g.quadraticCurveTo(x - r * 0.95, y - r * 0.1, x, y - r);
    g.quadraticCurveTo(x + r * 0.95, y - r * 0.1, x, y + r);
    g.closePath(); g.fill();
  } else if (kind === 'crown') {
    g.moveTo(x - r, y + r * 0.6); g.lineTo(x - r * 0.78, y - r * 0.7);
    g.lineTo(x - r * 0.34, y + r * 0.02); g.lineTo(x, y - r);
    g.lineTo(x + r * 0.34, y + r * 0.02); g.lineTo(x + r * 0.78, y - r * 0.7);
    g.lineTo(x + r, y + r * 0.6);
    g.closePath(); g.fill();
  } else if (kind === 'wave') {
    g.lineWidth = r * 0.2;
    for (let k = -1; k <= 1; k++) {
      g.beginPath();
      g.moveTo(x - r, y + k * r * 0.5);
      g.bezierCurveTo(x - r * 0.35, y + k * r * 0.5 - r * 0.42,
        x + r * 0.35, y + k * r * 0.5 + r * 0.42, x + r, y + k * r * 0.5);
      g.stroke();
    }
  } else {                                   // arc
    g.arc(x, y + r * 0.3, r * 0.85, Math.PI, 0); g.stroke();
  }
}

/**
 * The four ways a panel is laid out.
 *
 * Every board used to be drawn the same way — mark on the left, wordmark, then
 * a strapline under it — so even with ten different names the run read as one
 * advert repeated, which is exactly what a real ground does not look like. Some
 * boards are a full-bleed colour with nothing but a wordmark; some centre the
 * mark; some are split down the middle. Varying the *composition* does more for
 * the illusion than varying the names.
 *
 * Each writes into the box (x, 0, w, h) and is handed the sponsor it belongs to.
 */
const PANEL_LAYOUTS = [
  /** Mark left, wordmark and strapline stacked beside it. The classic. */
  (g, s, x, w, h) => {
    drawMark(g, s.mark, x + w * 0.085, h / 2 - h * 0.03, h * 0.24, s.fg);
    g.textAlign = 'left';
    g.font = `italic 800 ${h * 0.46}px Bahnschrift, "Arial Narrow", system-ui, sans-serif`;
    g.fillStyle = '#ffffff';
    g.fillText(s.name, x + w * 0.17, h * 0.42);
    g.font = `600 ${h * 0.17}px Inter, system-ui, sans-serif`;
    g.fillStyle = s.accent;
    g.fillText(s.tag, x + w * 0.175, h * 0.72);
  },

  /** Wordmark only, filling the board. What a big sponsor actually buys. */
  (g, s, x, w, h) => {
    g.textAlign = 'center';
    g.font = `italic 800 ${h * 0.66}px Bahnschrift, "Arial Narrow", system-ui, sans-serif`;
    g.fillStyle = '#ffffff';
    g.fillText(s.name, x + w / 2, h * 0.54, w * 0.86);
  },

  /** Split: a solid block of brand colour on the left with the mark in it. */
  (g, s, x, w, h) => {
    g.fillStyle = s.fg;
    g.fillRect(x, 0, w * 0.26, h);
    drawMark(g, s.mark, x + w * 0.13, h / 2, h * 0.28, s.bg);
    g.textAlign = 'left';
    g.font = `italic 800 ${h * 0.42}px Bahnschrift, "Arial Narrow", system-ui, sans-serif`;
    g.fillStyle = '#ffffff';
    g.fillText(s.name, x + w * 0.32, h * 0.44);
    g.font = `600 ${h * 0.16}px Inter, system-ui, sans-serif`;
    g.fillStyle = s.accent;
    g.fillText(s.tag, x + w * 0.325, h * 0.71);
  },

  /** Centred lockup: mark above a small wordmark, strapline rules either side. */
  (g, s, x, w, h) => {
    g.textAlign = 'center';
    drawMark(g, s.mark, x + w / 2, h * 0.3, h * 0.2, s.fg);
    g.font = `italic 800 ${h * 0.34}px Bahnschrift, "Arial Narrow", system-ui, sans-serif`;
    g.fillStyle = '#ffffff';
    g.fillText(s.name, x + w / 2, h * 0.74, w * 0.7);
    g.fillStyle = s.accent;
    g.globalAlpha = 0.55;
    g.fillRect(x + w * 0.08, h * 0.72, w * 0.14, 2);
    g.fillRect(x + w * 0.78, h * 0.72, w * 0.14, 2);
    g.globalAlpha = 1;
  },
];

/**
 * Perimeter LED board texture — a run of different sponsor panels.
 *
 * `panels` is however many fit the physical run, so the texture is laid end to
 * end **once** rather than tiled. That is the whole fix: the boards used to be
 * eight panels wrapped five times down a 125 m touchline, which is why the same
 * three adverts kept coming back every few metres.
 *
 * @param {number} panels how many distinct boards to draw
 * @param {number} panelPx width of each in texture pixels — chosen by the caller
 *   against the GPU's max texture size, because a run this long can otherwise
 *   ask for a canvas wider than a mobile GL context will allocate
 */
function ledTexture(seed = 1, panels = 8, panelPx = 512) {
  const rand = mulberry(seed);
  const c = document.createElement('canvas');
  c.width = panelPx * panels;
  c.height = Math.round(panelPx * 0.22);
  const g = c.getContext('2d');
  const h = c.height;

  /* Deal the sponsors out of a shuffled deck and only reshuffle when it runs
     out, so a name can never appear twice inside one pass of the list. */
  let deck = [];
  const nextSponsor = () => {
    if (!deck.length) deck = SPONSORS.slice().sort(() => rand() - 0.5);
    return deck.pop();
  };

  for (let i = 0; i < panels; i++) {
    const s = nextSponsor();
    const x = i * panelPx;

    const grad = g.createLinearGradient(x, 0, x + panelPx, h);
    grad.addColorStop(0, s.bg);
    grad.addColorStop(1, '#04060b');
    g.fillStyle = grad;
    g.fillRect(x, 0, panelPx, h);

    // accent sweep + hairline, so panels read as lit signage not flat blocks
    g.save();
    g.globalAlpha = 0.16;
    g.fillStyle = s.fg;
    g.beginPath();
    g.moveTo(x + panelPx * 0.62, 0);
    g.lineTo(x + panelPx, 0);
    g.lineTo(x + panelPx, h);
    g.lineTo(x + panelPx * 0.44, h);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = s.accent;
    g.fillRect(x, h - Math.max(2, h * 0.045), panelPx, Math.max(2, h * 0.045));

    g.save();
    g.textBaseline = 'middle';
    PANEL_LAYOUTS[Math.floor(rand() * PANEL_LAYOUTS.length)](g, s, x, panelPx, h);
    g.restore();

    // hairline seam between hoardings — real runs are separate units
    g.fillStyle = 'rgba(0,0,0,.55)';
    g.fillRect(x + panelPx - 2, 0, 2, h);
  }

  /* The LED pixel grid. A board is thousands of discrete emitters, and the fine
     dark lattice over the artwork is most of what separates one on camera from
     a printed vinyl banner. */
  g.globalAlpha = 0.14;
  g.fillStyle = '#000000';
  for (let y = 0; y < h; y += 3) g.fillRect(0, y, c.width, 1);
  g.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ------------------------------ players ----------------------------
 * Proportions are taken off a real 1.8 m footballer rather than eyeballed:
 * head a shade under 1/8 of standing height, shoulders 0.42 m across but only
 * 0.26 m front to back, waist narrower than both. The old figure was a barrel —
 * a round 0.4 m capsule for the torso, the same width from every angle, with
 * the head sunk into it — which is what made it read as a toy.
 */
const ANKLE_Z = 0.10;
const KNEE_Z = 0.50;
const HIP_Z = 0.94;
const WAIST_Z = 1.08;
const SHOULDER_Z = 1.46;
const THIGH = HIP_Z - KNEE_Z;
const SHIN = KNEE_Z - ANKLE_Z;
const UPPER_ARM = 0.30;
const FOREARM = 0.27;

// Half-widths: [across the shoulders, front to back]. Keeping the two apart is
// most of what makes a torso look like a chest instead of a drum.
const CHEST_W = 0.205;
const CHEST_D = 0.125;
const HIPS_W = 0.175;
const HIPS_D = 0.115;

// Capsules rather than bare cylinders — rounded ends read as muscle and hide
// the seams at every joint. The torso tapers, so it is a cone section instead.
const LIMB_GEO = new THREE.CapsuleGeometry(1, 1, 4, 10);
const JOINT_GEO = new THREE.SphereGeometry(1, 12, 10);
const BOOT_GEO = new THREE.BoxGeometry(1, 1, 1);
const TORSO_GEO = new THREE.CylinderGeometry(1, 0.74, 1, 16);
const HIPS_GEO = new THREE.CylinderGeometry(1, 0.9, 1, 14);
const SLEEVE_GEO = new THREE.CylinderGeometry(1, 0.82, 1, 10);

// CapsuleGeometry(1, 1) stands 3 units tall (body 1 plus two unit caps), so the
// length axis is divided through by that to span exactly a to b. The cylinders
// are a unit tall and need no such correction.
const CAPSULE_H = 3;

function segment(mesh, ax, ay, az, bx, by, bz, r, unitH = CAPSULE_H) {
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const len = Math.hypot(dx, dy, dz) || 0.001;
  mesh.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  _v.set(dx / len, dy / len, dz / len);
  _q.setFromUnitVectors(UP_Y, _v);
  mesh.quaternion.copy(_q);
  mesh.scale.set(r, len / unitH, r);
}

/**
 * A body part with an oval cross-section: same as `segment`, then rolled about
 * its own length so the wide axis lies across the player's shoulders rather
 * than wherever the maths happened to leave it.
 */
function ovalSegment(mesh, ax, ay, az, bx, by, bz, halfW, halfD, facing, unitH) {
  segment(mesh, ax, ay, az, bx, by, bz, 1, unitH);
  _q2.setFromAxisAngle(UP_Y, facing + Math.PI / 2);
  mesh.quaternion.multiply(_q2);
  mesh.scale.x = halfD;
  mesh.scale.z = halfW;
}

function buildPlayer(kitCol, shortCol, skinCol, hairCol, sockCol, build) {
  const grp = new THREE.Group();
  const mat = (c, rough = 0.72) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.02 });
  // kit fabric catches the floodlights a little; skin and turf-worn socks do not
  const kit = mat(kitCol, 0.62);
  const shorts = mat(shortCol, 0.66);
  const skin = mat(skinCol, 0.78);
  const hair = mat(hairCol, 0.85);
  const sock = mat(sockCol, 0.8);
  const boot = mat(0x14141a, 0.42);

  const add = (geo, material) => {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    grp.add(m);
    return m;
  };

  const parts = {
    thighL: add(LIMB_GEO, skin), thighR: add(LIMB_GEO, skin),
    shinL: add(LIMB_GEO, sock), shinR: add(LIMB_GEO, sock),
    footL: add(BOOT_GEO, boot), footR: add(BOOT_GEO, boot),
    kneeL: add(JOINT_GEO, skin), kneeR: add(JOINT_GEO, skin),
    hips: add(HIPS_GEO, shorts),
    torso: add(TORSO_GEO, kit),
    // arms are bare and the sleeve is its own sleeve — a kit-coloured upper arm
    // and a skin forearm put the hem at the elbow, which no shirt has
    armL: add(LIMB_GEO, skin), armR: add(LIMB_GEO, skin),
    sleeveL: add(SLEEVE_GEO, kit), sleeveR: add(SLEEVE_GEO, kit),
    foreL: add(LIMB_GEO, skin), foreR: add(LIMB_GEO, skin),
    handL: add(JOINT_GEO, skin), handR: add(JOINT_GEO, skin),
    shoulder: add(JOINT_GEO, kit),
    neck: add(LIMB_GEO, skin),
    head: add(JOINT_GEO, skin),
    hair: add(JOINT_GEO, hair),
  };
  return { grp, parts, build };
}

/**
 * Per-player build, so twenty-two people are not one person copied.
 * Seeded off the squad number and name, so a given player is always himself.
 */
function buildFor(ref, role) {
  let h = 0;
  const key = `${ref?.id || ''}${ref?.name || ''}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const r = (n) => ((h >>> (n * 5)) & 31) / 31;
  return {
    // keepers are the tall ones, as they are everywhere else
    height: (role === 'GK' ? 1.03 : 0.965) + r(0) * 0.075,
    girth: 0.92 + r(1) * 0.2,
    shoulders: 0.94 + r(2) * 0.14,
  };
}

function posePlayer(rig, p, phase, fine, celebT = 0) {
  const { parts } = rig;
  if (p.diveT > 0) { poseDive(rig, p, fine); return; }
  rig.grp.rotation.set(0, 0, 0);
  const b = rig.build || { height: 1, girth: 1, shoulders: 1 };
  const H = b.height;
  const G = b.girth;
  const cos = p.dirX;
  const sin = p.dirY;
  const face = Math.atan2(sin, cos);
  const sp = Math.hypot(p.vx, p.vy);
  const gait = Math.min(1, sp / 6.5);
  const lean = Math.min(0.14, sp / 62);
  const cheer = p.celebrating ? 1 : 0;
  // little hop while celebrating, so the whole body lifts off the turf
  const hop = cheer ? Math.abs(Math.sin(celebT * 6.5)) * 0.22 : 0;
  // the body rises and falls once per stride, as the trailing leg drives
  const bob = Math.abs(Math.sin(phase)) * 0.035 * gait;
  const wx = (f, l) => p.x + f * cos - l * sin;
  const wy = (f, l) => p.y + f * sin + l * cos;
  const lift = hop + bob;

  const hipZ = HIP_Z * H + lift;
  const shZ = SHOULDER_Z * H + lift;

  const leg = (side, ph, thigh, shin, knee, foot) => {
    const s = Math.sin(ph);
    const hipA = s * 0.68 * gait;
    const kneeA = hipA - (Math.max(0, -s) * 1.25 + 0.12) * gait - 0.08;
    const lat = side * 0.1;
    const hipF = lean;
    const kneeF = hipF + Math.sin(hipA) * THIGH * H;
    const kneeZ = hipZ - Math.cos(hipA) * THIGH * H;
    const ankF = kneeF + Math.sin(kneeA) * SHIN * H;
    const ankZ = Math.max(ANKLE_Z * 0.7, kneeZ - Math.cos(kneeA) * SHIN * H);
    segment(thigh, wx(hipF, lat), wy(hipF, lat), hipZ + 0.02,
      wx(kneeF, lat), wy(kneeF, lat), kneeZ, 0.082 * G);
    segment(shin, wx(kneeF, lat), wy(kneeF, lat), kneeZ,
      wx(ankF, lat), wy(ankF, lat), ankZ, 0.062 * G);
    knee.position.set(wx(kneeF, lat), wy(kneeF, lat), kneeZ);
    knee.scale.setScalar(0.062 * G);
    // a boot is a flat wedge along the foot, not a sausage
    foot.position.set(wx(ankF + 0.05, lat), wy(ankF + 0.05, lat), Math.max(0.035, ankZ - 0.055));
    foot.rotation.set(0, 0, face);
    foot.scale.set(0.23, 0.1, 0.07);
    foot.visible = fine;
  };

  const arm = (side, ph, upper, fore, hand, sleeve) => {
    const s = Math.sin(ph);
    // celebrating: both arms swing up and out overhead instead of pumping
    const swing = cheer ? Math.sin(celebT * 5 + side) * 0.25 : 0;
    const shA = cheer ? -2.35 + swing : s * 0.55 * gait;
    const elA = cheer ? -2.6 + swing * 0.6 : shA + 0.8 * gait + 0.22;
    // hung off the outside of the deltoid, not buried in the chest
    const lat = side * (CHEST_W * b.shoulders + 0.014);
    const out = side * (cheer ? 0.34 : CHEST_W * b.shoulders + 0.042);
    const shF = lean * 0.5;
    const elF = shF + Math.sin(shA) * UPPER_ARM * H;
    const elZ = shZ - Math.cos(shA) * UPPER_ARM * H;
    const haF = elF + Math.sin(elA) * FOREARM * H;
    const haZ = elZ - Math.cos(elA) * FOREARM * H;
    segment(upper, wx(shF, lat), wy(shF, lat), shZ, wx(elF, out), wy(elF, out), elZ, 0.049 * G);
    // the shirt sleeve covers the top half of the upper arm and stands off it
    segment(sleeve, wx(shF, lat), wy(shF, lat), shZ,
      wx(shF + (elF - shF) * 0.52, lat + (out - lat) * 0.52),
      wy(shF + (elF - shF) * 0.52, lat + (out - lat) * 0.52),
      shZ + (elZ - shZ) * 0.52, 0.056 * G, 1);
    segment(fore, wx(elF, out), wy(elF, out), elZ, wx(haF, out), wy(haF, out), haZ, 0.042 * G);
    hand.position.set(wx(haF, out), wy(haF, out), haZ - 0.02);
    hand.scale.set(0.045, 0.055, 0.032);
    hand.visible = fine;
  };

  leg(-1, phase + Math.PI, parts.thighL, parts.shinL, parts.kneeL, parts.footL);
  leg(1, phase, parts.thighR, parts.shinR, parts.kneeR, parts.footR);
  arm(-1, phase, parts.armL, parts.foreL, parts.handL, parts.sleeveL);
  arm(1, phase + Math.PI, parts.armR, parts.foreR, parts.handR, parts.sleeveR);

  const waistZ = WAIST_Z * H + lift;
  // Shorts and shirt are cone sections, and which end is which matters: the
  // geometry's wide face is at its +Y, so the wide end has to be named second
  // or the shirt comes out narrow at the shoulders and flared at the hem — a
  // dress rather than a jersey.
  ovalSegment(parts.hips, wx(lean, 0), wy(lean, 0), waistZ,
    wx(lean, 0), wy(lean, 0), hipZ - 0.12, HIPS_W * G, HIPS_D * G, face, 1);
  ovalSegment(parts.torso, wx(lean, 0), wy(lean, 0), waistZ - 0.02,
    wx(lean * 1.7, 0), wy(lean * 1.7, 0), shZ + 0.03,
    CHEST_W * b.shoulders * G, CHEST_D * G, face, 1);
  // deltoids: a flattened cap that rounds off the top of the shirt
  parts.shoulder.position.set(wx(lean * 1.7, 0), wy(lean * 1.7, 0), shZ);
  parts.shoulder.rotation.set(0, 0, face);
  parts.shoulder.scale.set(CHEST_D * G, CHEST_W * b.shoulders * G * 1.02, 0.085 * G);
  segment(parts.neck, wx(lean * 1.7, 0), wy(lean * 1.7, 0), shZ,
    wx(lean * 1.7 - 0.01, 0), wy(lean * 1.7 - 0.01, 0), shZ + 0.1 * H, 0.046);

  const hz = shZ + 0.21 * H;
  parts.head.position.set(wx(lean * 1.7 - 0.012, 0), wy(lean * 1.7 - 0.012, 0), hz);
  parts.head.rotation.set(0, 0, face);
  // a head is taller than it is wide, and deeper than it is broad
  parts.head.scale.set(0.098, 0.092, 0.112);
  parts.hair.position.set(wx(lean * 1.7 - 0.012, 0), wy(lean * 1.7 - 0.012, 0), hz + 0.022);
  parts.hair.rotation.set(0, 0, face);
  parts.hair.scale.set(0.101, 0.095, 0.104);
  parts.hair.visible = fine;
}

/**
 * Full-stretch dive: the body lays out horizontally along the dive direction,
 * arms reaching for the ball, legs trailing, and the whole figure lifts off the
 * turf through the middle of the dive.
 */
function poseDive(rig, p, fine) {
  const { parts } = rig;
  const t = 1 - Math.max(0, Math.min(1, p.diveT / 0.75));   // 0 -> takeoff, 1 -> landed
  const air = Math.sin(t * Math.PI);                        // arc through the dive
  const s = p.diveDir || 1;
  const lay = Math.min(1, t * 2.6);                         // how flat the body is

  const bodyZ = 0.34 + air * 0.55;
  const reach = 0.5 + air * 0.45;
  // lateral offsets measured out from the keeper along the dive
  const at = (o, z) => [p.x, p.y + s * o, z];

  const [hx, hy, hz] = at(-0.15 * lay, bodyZ);
  const [sx2, sy2, sz2] = at(0.5 * lay, bodyZ + 0.16 * (1 - lay * 0.5));
  // Which way the keeper is laid out. The oval cross-section used when upright
  // is dropped here: the roll that orients it is derived for a bone that is
  // roughly vertical, and a body stretched flat along the ground is the one
  // case where that does not hold. A round section cannot twist wrongly.
  const face = Math.atan2(sy2 - hy, sx2 - hx);
  const round = (CHEST_W + CHEST_D) / 2;

  ovalSegment(parts.hips, hx, hy, hz, hx, hy + s * 0.14, hz + 0.22 * (1 - lay),
    (HIPS_W + HIPS_D) / 2, (HIPS_W + HIPS_D) / 2, face, 1);
  ovalSegment(parts.torso, sx2, sy2, sz2, hx, hy, hz, round, round, face, 1);
  parts.shoulder.position.set(sx2, sy2, sz2);
  parts.shoulder.rotation.set(0, 0, face);
  parts.shoulder.scale.set(CHEST_D, CHEST_W, 0.085);

  // arms thrown out towards the ball
  for (const [u, f, hnd, sl, off] of [
    [parts.armL, parts.foreL, parts.handL, parts.sleeveL, 0.16],
    [parts.armR, parts.foreR, parts.handR, parts.sleeveR, -0.16],
  ]) {
    const e = at(0.5 * lay + reach * 0.5, sz2 + off * 0.5 + 0.05);
    const h = at(0.5 * lay + reach, sz2 + off + 0.1);
    segment(u, sx2, sy2, sz2, e[0], e[1], e[2], 0.049);
    segment(sl, sx2, sy2, sz2,
      sx2 + (e[0] - sx2) * 0.52, sy2 + (e[1] - sy2) * 0.52, sz2 + (e[2] - sz2) * 0.52, 0.068, 1);
    segment(f, e[0], e[1], e[2], h[0], h[1], h[2], 0.042);
    hnd.position.set(h[0], h[1], h[2]);
    hnd.scale.setScalar(0.05);
    hnd.visible = fine;
  }

  // legs trail behind the dive
  for (const [th, sh, kn, ft, off] of [
    [parts.thighL, parts.shinL, parts.kneeL, parts.footL, 0.11],
    [parts.thighR, parts.shinR, parts.kneeR, parts.footR, -0.11],
  ]) {
    const k = at(-0.15 * lay - 0.42, bodyZ - 0.12 + off * 0.4);
    const a = at(-0.15 * lay - 0.85, bodyZ - 0.24 + off * 0.5);
    segment(th, hx, hy + s * off * 0.5, hz, k[0], k[1], k[2], 0.082);
    segment(sh, k[0], k[1], k[2], a[0], a[1], a[2], 0.062);
    kn.position.set(k[0], k[1], k[2]);
    kn.scale.setScalar(0.062);
    ft.position.set(a[0], a[1] - s * 0.09, Math.max(0.035, a[2] - 0.03));
    ft.rotation.set(0, 0, face);
    ft.scale.set(0.23, 0.1, 0.07);
    ft.visible = fine;
  }

  const nz = sz2 + 0.1;
  segment(parts.neck, sx2, sy2, sz2, sx2, sy2 + s * 0.08, nz, 0.046);
  parts.head.position.set(sx2, sy2 + s * 0.15, nz + 0.04);
  parts.head.rotation.set(0, 0, face);
  parts.head.scale.set(0.098, 0.092, 0.112);
  parts.hair.position.set(sx2, sy2 + s * 0.17, nz + 0.07);
  parts.hair.rotation.set(0, 0, face);
  parts.hair.scale.set(0.1, 0.094, 0.088);
  parts.hair.visible = fine;
}

/* ------------------------------- main ------------------------------ */
/**
 * Test hook: hand back the raw pitch artwork so the markings and the mow can be
 * inspected flat, without a camera, a floodlight or a bloom pass in the way.
 * Nothing in the game calls this.
 */
export function __pitchCanvas() {
  return { colour: pitchTexture(true).image.toDataURL(), rough: pitchRoughness().image.toDataURL() };
}

export function createRenderer(canvas, match, quality, models = false) {
  // 'ultra' is the deliberately expensive tier: it supersamples above the native
  // pixel ratio, quadruples the shadow map, and fills the stands out properly.
  const ultra = quality === 'ultra';
  /* No MSAA above Low, and that is not a downgrade.
   *
   * Every tier above Low renders through the EffectComposer: the scene goes
   * into a render target, the passes chew on it, and OutputPass draws the
   * result as a fullscreen quad. The canvas's own multisample buffer is never
   * what you see — but the browser still allocates it, and at an iPad's native
   * resolution a 4x multisampled default framebuffer is tens of megabytes of
   * GPU memory and the bandwidth to resolve it, every frame, for nothing.
   * The composer's own antialiasing is what is actually doing the work. */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality === 'low',
    powerPreference: 'high-performance',
  });
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(ultra
    ? Math.min(3, Math.max(2, dpr))          // render above native, then downsample
    : Math.min(quality === 'low' ? 1.25 : 2, dpr));
  renderer.shadowMap.enabled = quality !== 'low';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // filmic tone mapping is what stops floodlit whites blowing out to flat grey
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const sky = skyTexture();
  scene.background = sky;
  scene.fog = new THREE.FogExp2(0x070d18, 0.0042);

  // Image-based lighting from the sky. Needs float render targets, which some
  // mobile GPUs refuse — fall back to plain lighting rather than failing to boot.
  let pmrem = null;
  try {
    pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(sky).texture;
  } catch {
    pmrem = null;
  }

  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 900);
  camera.up.set(0, 0, 1);

    /* Lifted from 0.95. The base level matters as much as the lamps do: the
     brighter the fill, the smaller the *relative* step between a floodlight
     pool and the ground beside it, and it was that step — not the absolute
     brightness — that read as four spotlights pointed at a field. */
  scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x1c3324, 1.35));
  const sun = new THREE.DirectionalLight(0xdfe8ff, 0.85);
  sun.position.set(-46, -30, 88);
  sun.target.position.set(PITCH.w / 2, CY, 0);
  scene.add(sun, sun.target);
  if (renderer.shadowMap.enabled) {
    sun.castShadow = true;
    /* 2048 at the top, not 4096. The shadow camera covers 160x140 world units,
       so 2048 is about thirteen texels per metre — past the point where more
       resolution is visible on a player-sized object, and a 4096 depth map is
       67 MB of GPU memory on a device that has to hold the composer targets,
       the bloom mip chain and a 14 MB player model at the same time. */
    const shadowRes = quality === 'low' ? 1024 : ultra ? 2048 : 1536;
    sun.shadow.mapSize.set(shadowRes, shadowRes);
    sun.shadow.bias = -0.0008;
    const c = sun.shadow.camera;
    c.left = -80; c.right = 80; c.top = 70; c.bottom = -70; c.near = 20; c.far = 220;
  }

  // ground + pitch
  const surround = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.w + MARGIN * 2 + 60, PITCH.h + MARGIN * 2 + 60),
    new THREE.MeshStandardMaterial({ color: 0x123021, roughness: 0.95 }));
  surround.position.set(PITCH.w / 2, CY, -0.02);
  surround.receiveShadow = true;
  scene.add(surround);

  const turfMat = new THREE.MeshStandardMaterial({
    map: pitchTexture(quality !== 'low'),
    /* Cut grass under floodlights is *faintly* specular — that sheen sweeping
       across the stripes is most of what separates a lit pitch from a green
       rectangle. Faintly is the operative word. At 0.74, with a roughness map
       taking the glossy stripes down to 0.41, the turf behaved like a mirror at
       grazing angles and threw a blown-out white sheet across the near corners
       of every camera angle. Grass is never that shiny. */
    roughness: 0.9,
    metalness: 0.02,
    envMapIntensity: 0.35,
  });
  /* Blade detail and the mow's gloss, on everything but the low path — this is
     the difference between grass and a green rectangle with lines on it. The
     normal map tiles roughly once per 2.6 m so individual blades stay under a
     centimetre, and its own `repeat` is independent of the colour map's. */
  if (quality !== 'low') {
    const detail = turfDetail(ultra ? 512 : 256);
    detail.repeat.set(PITCH.w / 2.6, PITCH.h / 2.6);
    turfMat.normalMap = detail;
    turfMat.normalScale = new THREE.Vector2(0.55, 0.55);
    turfMat.roughnessMap = pitchRoughness();
  }
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.w, PITCH.h), turfMat);
  turf.position.set(PITCH.w / 2, CY, 0);
  turf.receiveShadow = true;
  scene.add(turf);

  // Perimeter LED boards, touchlines only.
  //
  // The goal-end boards used to be here too, but `rotation.set(x, y, z)` applies
  // the X term last, so the Z spin only rolled the board about its own normal
  // instead of turning it to face down the pitch: at ±90° the run stood on its
  // end as an 80-unit tower behind each goal. They are gone rather than fixed —
  // the ends read better empty, and the touchline runs already carry the sponsors.
  const boards = [
    [PITCH.w / 2, -MARGIN + 1.2, PITCH.w + 20, 0],
    [PITCH.w / 2, PITCH.h + MARGIN - 1.2, PITCH.w + 20, Math.PI],
  ];
  /* One hoarding every ~5.2 m, which is what a real unit measures, and enough of
     them to cover the run **once**. The old code drew eight and wrapped them
     five times down a 125 m touchline, which is why the same three adverts kept
     coming back every few metres.

     A run that long at legible resolution is wider than a texture is allowed to
     be — some mobile GL contexts cap at 4096, and an oversized canvas comes back
     blank rather than merely soft — so the run is split into as many mesh
     segments as the limit demands, each with its own texture and its own draw of
     the sponsor deck. */
  const PANEL_M = 5.2;
  const PANEL_PX = 384;
  const maxTex = renderer.capabilities.maxTextureSize || 4096;
  const panelsPerTex = Math.max(4, Math.floor(maxTex / PANEL_PX));
  let ledSeed = 1471;

  boards.forEach(([bx, by, len, rot]) => {
    const wanted = Math.max(1, Math.round(len / PANEL_M));
    const segs = Math.ceil(wanted / panelsPerTex);
    const perSeg = Math.ceil(wanted / segs);
    const segLen = len / segs;
    for (let sgi = 0; sgi < segs; sgi++) {
      const led = ledTexture(ledSeed += 733, perSeg, PANEL_PX);
      const mat = new THREE.MeshStandardMaterial({
        map: led, emissive: 0xffffff, emissiveMap: led, emissiveIntensity: 1.15, roughness: 0.5,
      });
      const bd = new THREE.Mesh(new THREE.PlaneGeometry(segLen, 1.05), mat);
      bd.position.set(bx - len / 2 + (sgi + 0.5) * segLen, by, 0.55);
      bd.rotation.set(Math.PI / 2, 0, rot);
      scene.add(bd);
    }
  });

  // goals — frame plus a simulated net
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf6f8ff, roughness: 0.35, metalness: 0.1 });
  const netMat = new THREE.LineBasicMaterial({
    color: 0xe6eefc, transparent: true, opacity: 0.5,
  });
  const NET_DEPTH = 2.0;
  const nets = [];
  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? -1 : 1;
    for (const sy of [-GOAL_HALF, GOAL_HALF]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GOAL_H, 8), postMat);
      post.position.set(gx, CY + sy, GOAL_H / 2);
      post.rotation.x = Math.PI / 2;
      post.castShadow = true;
      scene.add(post);
    }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GOAL_HALF * 2, 8), postMat);
    bar.position.set(gx, CY, GOAL_H);
    bar.castShadow = true;
    scene.add(bar);

    // One cloth wrapped from the left post, across the back, to the right post.
    // Column 0 and the last column sit on the posts; the top row hangs off the
    // crossbar and the bottom row is staked to the ground — everything between
    // is free to billow.
    const COLS = quality === 'low' ? 13 : ultra ? 30 : 21;
    const ROWS = quality === 'low' ? 6 : ultra ? 13 : 9;
    const span = GOAL_HALF * 2;
    const perim = NET_DEPTH * 2 + span;            // left side + back + right side
    const cloth = new NetCloth(COLS, ROWS,
      (c, r) => {
        const t = (c / (COLS - 1)) * perim;
        let x;
        let y;
        if (t < NET_DEPTH) {                        // left return
          x = gx + inw * t;
          y = CY - GOAL_HALF;
        } else if (t < NET_DEPTH + span) {          // back panel
          x = gx + inw * NET_DEPTH;
          y = CY - GOAL_HALF + (t - NET_DEPTH);
        } else {                                    // right return
          x = gx + inw * (perim - t);
          y = CY + GOAL_HALF;
        }
        const rt = r / (ROWS - 1);
        // net slopes back from the bar down to the ground
        const z = GOAL_H * (1 - rt);
        return [x, y, z];
      },
      (c, r) => r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(cloth.pos, 3));
    geo.setIndex(cloth.lineIndices());
    const mesh = new THREE.LineSegments(geo, netMat);
    mesh.frustumCulled = false;
    scene.add(mesh);
    nets.push({ cloth, geo, gx, inw });
  }

  /* This ground. Seeded off the two team names so a fixture is always the same
     stadium, and different fixtures are different stadiums. */
  const VENUE = stadiumSpec(hashName(`${match.teams[0].name}|${match.teams[1].name}`));
  const SD = VENUE.depth;           // how far back the terracing runs
  const SBZ = VENUE.backZ;          // how high it climbs
  const RZ = SBZ + 4.5;             // the roof sits just above the back row

  // stands: stepped terracing rather than one flat ramp, plus roof trusses
  const standMat = new THREE.MeshStandardMaterial({ color: 0x2a3142, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x11151f, roughness: 0.85, metalness: 0.25 });
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x3a4256, roughness: 0.6, metalness: 0.5 });
  const banks = [
    { rot: 0, cx: PITCH.w / 2, cy: PITCH.h + MARGIN, len: PITCH.w + 44 },
    { rot: Math.PI / 2, cx: -MARGIN, cy: CY, len: PITCH.h + 36 },
    { rot: -Math.PI / 2, cx: PITCH.w + MARGIN, cy: CY, len: PITCH.h + 36 },
  ];
  const TERRACE_ROWS = quality === 'low' ? 8 : ultra ? 22 : 14;
  for (const bk of banks) {
    const g = new THREE.Group();
    g.position.set(bk.cx, bk.cy, 0);
    g.rotation.z = bk.rot;

    // each row is a physical step you can see the edge of
    const stepD = SD / TERRACE_ROWS;
    const stepH = (SBZ - STAND_FRONT_Z) / TERRACE_ROWS;
    for (let r = 0; r < TERRACE_ROWS; r++) {
      const z = STAND_FRONT_Z + r * stepH;
      const step = new THREE.Mesh(new THREE.BoxGeometry(bk.len, stepD, stepH + 0.5), standMat);
      step.position.set(0, stepD * (r + 0.5), z);
      step.receiveShadow = true;
      g.add(step);
    }

    const front = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.5, STAND_FRONT_Z), standMat);
    front.position.set(0, 0, STAND_FRONT_Z / 2);
    front.castShadow = true;
    g.add(front);

    // The back wall always closes the ground off. The roof does not: a small
    // ground is open terracing, and seeing the sky over the far end is most of
    // what makes it read as a smaller place than the last one.
    const back = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.8, SBZ + 1.5), roofMat);
    back.position.set(0, SD, (SBZ + 1.5) / 2);
    g.add(back);

    if (VENUE.roof) {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(bk.len, SD * 0.68, 0.55), roofMat);
      roof.position.set(0, SD * 0.68, RZ);
      roof.castShadow = true;
      g.add(roof);

      // roof trusses so the underside is not a blank slab
      if (quality !== 'low') {
        for (let i = -4; i <= 4; i++) {
          const truss = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, SD * 0.68, 0.45), trussMat);
          truss.position.set((bk.len / 9) * i, SD * 0.68, RZ - 0.55);
          g.add(truss);
        }
      }
    }
    scene.add(g);
  }

  /* Curved corners, on the big grounds only.
   *
   * A quarter-ring of terracing joining the far bank to each side, so the
   * stadium closes into a bowl instead of being three separate stands with a
   * gap you can see the night through. Built as open-ended cylinder segments —
   * one per terrace row, radius growing with depth — which is the cheapest
   * geometry that actually curves.
   *
   * Only the two *far* corners. The near touchline is deliberately open (the
   * camera lives there), so closing the near corners would put terracing in
   * front of the lens. */
  if (VENUE.bowl) {
    const stepD = SD / TERRACE_ROWS;
    const stepH = (SBZ - STAND_FRONT_Z) / TERRACE_ROWS;
    for (const [cx, cy, from] of [[0, PITCH.h, Math.PI / 2], [PITCH.w, PITCH.h, 0]]) {
      const g = new THREE.Group();
      g.position.set(cx, cy, 0);
      for (let r = 0; r < TERRACE_ROWS; r++) {
        const rad = MARGIN + (r + 0.5) * stepD;
        const z = STAND_FRONT_Z + r * stepH;
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(rad, rad, stepH + 0.5, 14, 1, true, from, Math.PI / 2),
          standMat);
        // CylinderGeometry stands along +Y; the world here is z-up
        ring.rotation.x = Math.PI / 2;
        ring.position.z = z;
        ring.receiveShadow = true;
        g.add(ring);
      }
      scene.add(g);
    }
  }

  // floodlight pylons at the corners: emissive panels plus real light
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xfff4d8, emissiveIntensity: 3.4, roughness: 0.3,
  });
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x232838, roughness: 0.7, metalness: 0.4 });
  const corners = [
    [-MARGIN - 6, -MARGIN - 6], [PITCH.w + MARGIN + 6, -MARGIN - 6],
    [-MARGIN - 6, PITCH.h + MARGIN + 6], [PITCH.w + MARGIN + 6, PITCH.h + MARGIN + 6],
  ];
  for (const [px, py] of corners) {
    /* Tall lattice pylons on an open ground, stubby masts poking over the roof
       of a covered one — which is what the two kinds of stadium actually look
       like. The *lights* are identical either way: they are the scene's main
       illumination and were tuned carefully, so only the mast varies. */
    const mastH = VENUE.tallPylons ? 34 : Math.max(8, 36 - RZ);
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, VENUE.tallPylons ? 0.9 : 0.7, mastH, 8), pylonMat);
    mast.position.set(px, py, 35 - mastH / 2);
    mast.rotation.x = Math.PI / 2;
    scene.add(mast);

    const rig = new THREE.Mesh(
      new THREE.BoxGeometry(VENUE.tallPylons ? 7 : 9, 1.2, 4.5), lampMat);
    rig.position.set(px, py, 35);
    rig.lookAt(PITCH.w / 2, CY, 0);
    scene.add(rig);

    /* Wide, soft and a good deal dimmer than it was.
     *
     * At 3200 with a 36-degree cone and a hard-ish penumbra, the two near lamps
     * overlapped into a pool that clipped to flat white along the touchline —
     * ACES rolls highlights off but it cannot rescue a value that far over, so
     * the grass detail simply stopped existing exactly where the camera spends
     * most of its time. A real rig is many lamps covering the whole surface,
     * not four hotspots, so the cone opens up and the intensity comes down. */
    /* Wide cone, gentle falloff, aimed at the middle.
     *
     * The corners used to clip to flat white. Two things caused it and only one
     * was obvious: the falloff. At decay 1.5 the pitch corner under a pylon is
     * 40 m from it against 90 m for the centre, so the near ground took three
     * times the light, and ACES cannot rescue a value that far over — the grass
     * detail stopped existing exactly where the camera spends its time. Decay
     * 0.9 flattens that ratio to about 1.9.
     *
     * Aiming the lamps diagonally across the pitch instead was tried and is
     * worse, not better: four spot axes have to land *somewhere*, and moving
     * them off the centre just relocates four hotspots onto four corners.
     *
     * The second cause was the cone. At 44 degrees, four masts 35 m up cannot
     * cover a 105 x 68 m pitch, so the *rim* of each cone fell on the grass and
     * drew a visible edge around each pool. It has to be wide enough that the
     * falloff happens off the pitch entirely. Widening costs nothing in three:
     * intensity is candela, so a broader cone spreads the lit area without
     * dimming the middle. */
    const lamp = new THREE.SpotLight(0xfff2d6, 150, 320, Math.PI / 2.9, 0.95, 0.85);
    lamp.position.set(px, py, 35);
    lamp.target.position.set(PITCH.w / 2, CY, 0);
    scene.add(lamp, lamp.target);

    /* The beam itself, hanging in the night air.
     *
     * Real volumetrics would mean marching the shadow map per pixel. This is the
     * cheap version every stadium game uses: a cone of additive geometry that
     * fades at its rim and along its length, with depth writing off so it never
     * occludes anything and never sorts against the crowd. Four of them, at the
     * cost of four transparent draws.
     *
     * It is the single most "expensive-looking" thing on the screen for the
     * least work, because a floodlit pitch at night is defined by its haze. */
    if (quality !== 'low') {
      const beamLen = 60;
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(24, beamLen, 26, 1, true),
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          uniforms: {
            uColor: { value: new THREE.Color(0xfff0cf) },
            uStrength: { value: ultra ? 0.2 : 0.13 },
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormalV;
            void main() {
              vUv = uv;
              vNormalV = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: `
            uniform vec3 uColor;
            uniform float uStrength;
            varying vec2 vUv;
            varying vec3 vNormalV;
            void main() {
              /* Brightest at the lamp, gone by the time it reaches the grass.
               *
               * This read (1.0 - vUv.y), which is the wrong way round: a cone's
               * tip sits at uv.y = 1 and the tip is the end held up at the
               * lamp, so the beam was brightest at its wide base — the end that
               * punches through the pitch. That is what put four white fans on
               * the grass under the pylons. It was invisible until the
               * floodlights stopped blowing the turf out on their own. */
              float along = pow(vUv.y, 1.9);
              // and brightest edge-on, which is what gives a cone its soft rim
              float rim = 1.0 - abs(dot(normalize(vNormalV), vec3(0.0, 0.0, 1.0)));
              gl_FragColor = vec4(uColor, along * pow(rim, 1.5) * uStrength);
            }`,
        }));
      // the cone is built along +Y with its point at the top, so it is aimed by
      // pointing that axis at the centre circle
      beam.position.set(px, py, 35);
      const dir = new THREE.Vector3(PITCH.w / 2 - px, CY - py, -35).normalize();
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      beam.translateY(-beamLen / 2);
      beam.renderOrder = 2;
      scene.add(beam);
    }
  }

  // crowd — one instanced mesh, so thousands of seats cost a single draw call
  const rand = mulberry(97531);
  const rows = quality === 'low' ? 8 : ultra ? 22 : 14;
  const step = quality === 'low' ? 1.5 : ultra ? 0.62 : 0.95;
  const seats = [];
  const bankDefs = [
    { kind: 'far', from: -22, to: PITCH.w + 22 },
    { kind: 'left', from: -18, to: PITCH.h + 18 },
    { kind: 'right', from: -18, to: PITCH.h + 18 },
  ];
  const [SEAT_A, SEAT_B] = VENUE.seats;
  const put = (x, y, z, face, r) => seats.push({
    x, y, z, face,
    seatCol: r % 3 === 0 ? SEAT_A : SEAT_B,          // two-tone seating bowl
    // Attendance is this ground's, not a fixed 82%. A half-empty big stadium
    // and a packed small one both happen, and both beat every ground being full.
    occupied: rand() < VENUE.fill,
    c: CROWD_COLS[(rand() * CROWD_COLS.length) | 0],
  });

  for (const bd of bankDefs) {
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);
      const depth = MARGIN + t * SD;
      const z = STAND_FRONT_Z + t * (SBZ - STAND_FRONT_Z) + 0.5;
      for (let u = bd.from; u < bd.to; u += step) {
        if (bd.kind === 'far') put(u, PITCH.h + depth, z, Math.PI, r);
        else if (bd.kind === 'left') put(-depth, u, z, -Math.PI / 2, r);
        else put(PITCH.w + depth, u, z, Math.PI / 2, r);
      }
    }
  }

  /* And the people in the curved corners.
   *
   * Swept round the same quarter-circles the corner terracing follows, spaced
   * by arc length so the density matches the straight banks rather than
   * bunching up on the inside rows. `face` is the angle that turns a figure —
   * authored facing +Y — to look back at the corner's centre. */
  if (VENUE.bowl) {
    for (const [cx, cy, from] of [[0, PITCH.h, Math.PI / 2], [PITCH.w, PITCH.h, 0]]) {
      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        const depth = MARGIN + t * SD;
        const z = STAND_FRONT_Z + t * (SBZ - STAND_FRONT_Z) + 0.5;
        const span = Math.PI / 2;
        const n = Math.max(3, Math.round((span * depth) / step));
        for (let i = 0; i < n; i++) {
          const a = from + span * ((i + 0.5) / n);
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          put(cx + ca * depth, cy + sa * depth, z, Math.atan2(ca, -sa), r);
        }
      }
    }
  }
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  // Actual moulded seats: a pan and a raked back, instanced across every stand.
  const seatShape = new THREE.BufferGeometry();
  {
    const pan = new THREE.BoxGeometry(0.42, 0.4, 0.08).translate(0, 0, 0.2);
    const back = new THREE.BoxGeometry(0.42, 0.09, 0.36).translate(0, -0.18, 0.4);
    const merged = [];
    for (const g2 of [pan, back]) {
      const pos = g2.attributes.position.array;
      const idx = g2.index.array;
      const base = merged.length / 3;
      for (let i = 0; i < pos.length; i++) merged.push(pos[i]);
      seatShape.userData.idx = (seatShape.userData.idx || []).concat([...idx].map((v) => v + base));
    }
    seatShape.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3));
    seatShape.setIndex(seatShape.userData.idx);
    seatShape.computeVertexNormals();
  }
  const seatMesh = new THREE.InstancedMesh(
    seatShape,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }),
    seats.length);
  seats.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z - 0.5);
    dummy.rotation.set(0, 0, s.face || 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    seatMesh.setMatrixAt(i, dummy.matrix);
    seatMesh.setColorAt(i, col.setHex(s.seatCol));
  });
  seatMesh.instanceMatrix.needsUpdate = true;
  scene.add(seatMesh);

  /* ----------------------------- spectators -----------------------------
   * People, not capsules.
   *
   * Two instanced meshes sharing one set of transforms: bodies tinted with the
   * shirt colour, heads tinted with a skin tone. One instanced mesh could not
   * do that — an instance carries a single colour — and a coloured face is
   * exactly what makes a crowd read as jellybeans.
   *
   * Everything is boxes. A seated figure is sixty triangles, so a full ultra
   * bowl is well under a million static triangles in two draw calls, which a
   * GPU does not notice. Nothing here animates; a stand full of moving people
   * would cost more than the match.
   * -------------------------------------------------------------------- */
  const taken = seats.filter((s) => s.occupied);
  {
    /** Merge a list of box geometries into one buffer. */
    const mergeBoxes = (boxes) => {
      const positions = [];
      const normals = [];
      const indices = [];
      for (const g2 of boxes) {
        const base = positions.length / 3;
        const pos = g2.attributes.position.array;
        const nrm = g2.attributes.normal.array;
        for (let i = 0; i < pos.length; i++) positions.push(pos[i]);
        for (let i = 0; i < nrm.length; i++) normals.push(nrm[i]);
        for (const v of g2.index.array) indices.push(v + base);
        g2.dispose();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      g.setIndex(indices);
      return g;
    };
    const box = (w, d, h, x, y, z) => new THREE.BoxGeometry(w, d, h).translate(x, y, z);

    /* Authored in the scene's own space — Z up, +Y the way the spectator looks
     * — which is the same convention the seats use. That means a figure can be
     * placed with the identical `rotation.set(0, 0, face)` its seat gets, and
     * cannot end up facing the car park. An earlier version built them Y-up and
     * tipped them, and the facing rotation then rolled them onto their sides. */
    const bodyParts = [
      box(0.34, 0.22, 0.40, 0, 0, 0.30),            // torso
      box(0.30, 0.30, 0.15, 0, 0.14, 0.06),         // thighs, out over the seat front
    ];
    if (quality !== 'low') {
      bodyParts.push(box(0.09, 0.11, 0.30, -0.21, 0.02, 0.28));   // arms
      bodyParts.push(box(0.09, 0.11, 0.30, 0.21, 0.02, 0.28));
      bodyParts.push(box(0.13, 0.13, 0.26, -0.09, 0.24, -0.16));  // shins
      bodyParts.push(box(0.13, 0.13, 0.26, 0.09, 0.24, -0.16));
    }
    const bodyGeo = mergeBoxes(bodyParts);
    const headGeo = mergeBoxes([
      box(0.10, 0.10, 0.10, 0, 0, 0.56),            // neck
      box(0.17, 0.17, 0.19, 0, 0.01, 0.70),         // head
    ]);

    const skinTone = new THREE.Color();
    const mat = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
    const bodies = new THREE.InstancedMesh(bodyGeo, mat(), taken.length);
    const heads = new THREE.InstancedMesh(headGeo, mat(), taken.length);
    bodies.castShadow = false;      // a stand casting shadows onto itself is invisible and not free
    heads.castShadow = false;

    taken.forEach((s, i) => {
      // A third of them are on their feet, and everyone is a slightly different
      // size and sits at a slightly different angle. Without that the stand is
      // a grid of identical dolls, which reads worse than the capsules did.
      const standing = rand() < 0.3;
      const scale = 0.88 + rand() * 0.26;
      dummy.position.set(s.x, s.y, s.z - 0.34 + (standing ? 0.3 : 0));
      dummy.rotation.set(0, 0, (s.face || 0) + (rand() - 0.5) * 0.5);
      dummy.scale.set(scale, scale, standing ? scale * 1.25 : scale);
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);
      heads.setMatrixAt(i, dummy.matrix);
      bodies.setColorAt(i, col.setHex(s.c));
      heads.setColorAt(i, skinTone.setHex(SKINS[(rand() * SKINS.length) | 0]));
    });
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    scene.add(bodies, heads);
  }

  // players
  const kitHome = new THREE.Color(hexOf(match.teams[0].colors[0]));
  const kitAway = pickAwayKit(match);
  const rigs = new Map();
  for (let t = 0; t < 2; t++) {
    for (const p of match.teams[t].players) {
      const isGK = p.role === 'GK';
      const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
      const shorts = base.clone().multiplyScalar(0.6);
      // same look the card portrait uses, so a player on the pitch matches his card
      const look = faceOf(p.ref);
      const rig = buildPlayer(
        base, shorts,
        new THREE.Color(look.skin), new THREE.Color(look.hair),
        base.clone().multiplyScalar(0.8),
        buildFor(p.ref, p.role));
      scene.add(rig.grp);
      rigs.set(p, rig);
    }
  }

  /* ------------------------- scanned players ------------------------- *
   * The built-in figures above are always built, and stay in place until the
   * model has actually arrived: a 14 MB download must never be the reason a
   * kick-off waits. When it lands the two sets swap over, and if it fails —
   * offline, or the file missing — nothing happens and the match carries on
   * looking exactly as it did.                                               */
  const modelRigs = new Map();
  let useModels = false;
  /* Resolves once there is nothing left that would visibly change the picture.
   * The loading screen waits on this, which is the whole reason it exists: the
   * match used to start on the built-in figures and swap to the scanned ones
   * mid-play, so the first ten seconds looked like a different, worse game. */
  let markReady;
  const ready = new Promise((res) => { markReady = res; });

  /* Compile every shader before the match is allowed to start.
   *
   * This is the fix for the black rectangle that flashed mid-match on iPads:
   * three builds a material's GPU program lazily, the *first time that material
   * is actually drawn*. This scene has a lot of distinct programs — the turf
   * with its normal and roughness maps, the kit-tint and skin-tint variants,
   * the instanced crowd, the boards, the light shafts, the nets, the post
   * passes — and on a tablet each one can take tens of milliseconds to compile,
   * on the main thread, in the middle of a frame.
   *
   * A frame that stalls that long is presented half-drawn: the tiles that made
   * it are there and the rest are black, with edges on the GPU's tile grid. It
   * fires again every time another variant is first *seen* — a substitute
   * entering the frustum, a replay cutting the camera somewhere new, the ball
   * hitting the net — which is why it kept happening, and somewhere different
   * each time.
   *
   * The loading screen already holds the match still and already waits on this
   * promise, so this is free: the wait was there anyway.
   */
  const warmUp = () => {
    try {
      const done = renderer.compileAsync
        ? renderer.compileAsync(scene, camera)
        : Promise.resolve(renderer.compile(scene, camera));
      done.then(markReady, markReady);
    } catch {
      markReady();          // a driver that refuses is not a reason to not play
    }
  };

  // The models path warms up once its rigs are in the scene; without them the
  // call waits until the end of construction, because the ball and the markers
  // are added after this point and their programs have to be in the batch too.
  if (models) {
    loadPlayerModel().then((model) => {
      if (!model || disposed) { warmUp(); return; }
      let index = 0;
      for (let t = 0; t < 2; t++) {
        for (const p of match.teams[t].players) {
          const isGK = p.role === 'GK';
          const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
          const rig = makeRig(model, {
            kit: {
              shirt: base,
              shorts: base.clone().multiplyScalar(0.62),
              socks: base.clone().multiplyScalar(0.82),
            },
            ref: p.ref,
            index: index++,
            isGK,
          });
          scene.add(rig.root);
          modelRigs.set(p, rig);
        }
      }
      // hide the built-in figures rather than destroying them, so quality can
      // be turned back down mid-match without rebuilding anything
      for (const rig of rigs.values()) rig.grp.visible = false;
      useModels = true;
      // compiled after the rigs are in the scene, so their programs are
      // included rather than being built on the first frame of play
      warmUp();
    }).catch(() => warmUp());
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 18),
    new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.55, metalness: 0.02 }));
  ball.castShadow = true;
  scene.add(ball);

  // one marker per seat — P1 white, P2 amber, so couch players can tell them apart
  const MARKER_COLS = [0xffffff, 0xffc63d];
  const markers = MARKER_COLS.map((col) => {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.55, 4),
      new THREE.MeshBasicMaterial({ color: col }));
    m.rotation.x = Math.PI;
    m.visible = false;
    scene.add(m);
    return m;
  });

  const fine = quality !== 'low';
  let focusDist = 40;
  let disposed = false;
  let lastNetHit = -1;

  // iOS drops the GL context under memory pressure; keep it recoverable rather
  // than letting the match freeze on a dead canvas.
  let contextLost = false;
  const onLost = (e) => { e.preventDefault(); contextLost = true; };
  const onRestored = () => { contextLost = false; };
  canvas.addEventListener('webglcontextlost', onLost, false);
  canvas.addEventListener('webglcontextrestored', onRestored, false);

  // Bloom: floodlight rigs and LED boards spill light the way stadium optics do.
  // Skipped entirely on low detail, where the extra passes are not worth it.
  let composer = null;
  let cine = null;
  if (quality !== 'low') {
    composer = new EffectComposer(renderer);

    /* The cinematic pass needs the scene's depth, and the only place that
     * exists is on the buffer the scene was rendered into. EffectComposer
     * swaps its two targets and does not reset them between frames, so which
     * one that is alternates — both get an attachment, and the pass reads
     * whichever it is handed. */
    for (const rt of [composer.renderTarget1, composer.renderTarget2]) {
      rt.depthTexture = new THREE.DepthTexture(1, 1);
      rt.depthTexture.type = THREE.UnsignedIntType;
    }

    composer.addPass(new RenderPass(scene, camera));

    // Occlusion, bokeh and the lens grade. Ultra pays for a proper sample count
    // and a focal plane; High gets the occlusion and the grade without the
    // bokeh, which is the expensive half.
    cine = new CinematicPass(camera, {
      samples: ultra ? 12 : 8,
      ao: ultra ? 1.05 : 0.9,
      aoRadius: 0.6,
      dof: ultra ? 0.85 : 0,
      grain: 0.03,
      vignette: 0.5,
      aberration: ultra ? 0.7 : 0.4,
    });
    composer.addPass(cine);

    // High threshold on purpose: only the floodlights and LED boards should
    // bloom. Lower and the lit turf itself hazes over.
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.55, 0.95);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  if (!models) warmUp();

  return {
    /** Settles when every asset that would change the picture has landed. */
    ready,
    /** Live three.js counters — draw calls, triangles, memory. Handy for profiling. */
    get info() { return renderer.info; },
    get engine() { return `three.js r${THREE.REVISION}`; },
    resize(w, h) {
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      if (composer) {
        // the attachments do not follow the colour targets on resize
        const px = renderer.getPixelRatio();
        // WebGLRenderTarget.setSize already resizes an attached depthTexture,
        // so the composer's own setSize above has done it.
        cine?.setSize(Math.round(w * px), Math.round(h * px));
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    render(m, cam, dt) {
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      camera.fov = cam.hfov / Math.max(1, camera.aspect) * 1.45;
      camera.updateProjectionMatrix();
      sun.position.set(cam.x - 46, cam.y - 20, 88);
      sun.target.position.set(cam.tx, cam.ty, 0);

      for (let t = 0; t < 2; t++) {
        for (const p of m.teams[t].players) {
          if (useModels) {
            const rig = modelRigs.get(p);
            if (rig) poseRig(rig, p, dt);
            continue;
          }
          const rig = rigs.get(p);
          if (!rig) continue;
          p._phase = (p._phase || 0) + Math.hypot(p.vx, p.vy) * dt * 2.4;
          posePlayer(rig, p, p._phase, fine, m.celebT || 0);
        }
      }
      /* Focus follows the ball, which is where a broadcast camera operator
       * would be pulling to. Eased rather than snapped: a lens that rack-focuses
       * instantly on every pass looks like a bug, not a camera. */
      if (cine) {
        const dx = m.ball.x - cam.x;
        const dy = m.ball.y - cam.y;
        const dz = (m.ball.z || 0) - cam.z;
        const want = Math.sqrt(dx * dx + dy * dy + dz * dz);
        focusDist += (want - focusDist) * Math.min(1, dt * 3.4);
        cine.setFocus(focusDist);
      }

      ball.position.set(m.ball.x, m.ball.y, (m.ball.z || 0) + 0.19);
      // Roll it. Angular speed is v/r about the axis perpendicular to travel,
      // so the ball visibly spins along the ground instead of sliding.
      {
        const vx = m.ball.vx || 0;
        const vy = m.ball.vy || 0;
        const sp = Math.hypot(vx, vy);
        if (sp > 0.05 && dt > 0) {
          _v.set(-vy / sp, vx / sp, 0);
          _q.setFromAxisAngle(_v, (sp / 0.19) * dt);
          ball.quaternion.premultiply(_q);
        }
      }

      // netting: take the strike, then keep simulating so it ripples and settles
      if (m.netHit && m.netHit.at !== lastNetHit) {
        lastNetHit = m.netHit.at;
        const h = m.netHit;
        const near = nets.reduce((a, n) =>
          (Math.abs(h.x - n.gx) < Math.abs(h.x - a.gx) ? n : a), nets[0]);
        const k = 0.016;
        near.cloth.impulse(h.x, h.y, h.z, 2.6, h.vx * k, h.vy * k, h.vz * k - 0.05);
      }
      const nd = Math.min(dt || 1 / 60, 1 / 30);
      for (const n of nets) {
        n.cloth.step(nd, quality === 'low' ? 2 : ultra ? 6 : 3);
        n.geo.attributes.position.needsUpdate = true;
      }

      const acts = m.actives || (m.active ? [m.active] : []);
      markers.forEach((mk, i) => {
        const p = acts[i];
        mk.visible = !!p;
        if (p) mk.position.set(p.x, p.y, 2.6);
      });

      if (contextLost) return;
      if (composer) composer.render();
      else renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
      for (const rig of modelRigs.values()) {
        rig.mixer.stopAllAction();
        scene.remove(rig.root);
      }
      modelRigs.clear();
      canvas.removeEventListener('webglcontextlost', onLost);
      composer?.dispose?.();
      pmrem?.dispose();
      renderer.dispose();
    },
  };
}
