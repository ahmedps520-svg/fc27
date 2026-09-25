import * as THREE from '../vendor/three.module.js';
import { EffectComposer } from '../vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/jsm/postprocessing/OutputPass.js';
import { PITCH, GOAL_HALF, GOAL_HEIGHT, BOX } from './sim.js';
import { NetCloth } from './net.js';
import { faceOf } from '../components/face.js';
import { loadPlayerModel, makeRig, poseRig, setCelebClock } from './playerModel.js';
import { createReferee, updateReferee } from './referee.js';
import { GLTFLoader } from '../vendor/jsm/loaders/GLTFLoader.js';
import { buildLandscape } from './landscape.js';
import { CinematicPass } from './cinematic.js';
import { kitTexture, buildPlayer, buildFor, posePlayer, gaitOf, strideRate, updateBank } from './rig.js';
import { groundProfile } from '../data/grounds.js';
import { dressGround } from './groundDressing.js';
import { dressStreet, courtTexture } from './streetDressing.js';
import { ShaderPass } from '../vendor/jsm/postprocessing/ShaderPass.js';
import { pickAwayHex } from '../kits.js';

/* ------------------------------------------------------------------ *
 * WebGL renderer (three.js). Real meshes, real lights, real shadows.
 * The world is z-up to match the simulation, so the camera's up vector
 * is set accordingly and geometry is placed in sim coordinates directly.
 * ------------------------------------------------------------------ */

import { CY, FIELD, SCALE } from './field.js';
import { GOAL_HEIGHT as GOAL_H } from './field.js';
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
    roofStyle: scale > 0.30 ? 'cantilever' : 'none',
    tiers: scale > 0.6 ? 2 : 1,
    lettering: '', landscape: 'city', facadeStyle: 'concrete',
    facade: 0x2a3142,
    pattern: 'stripes',
    pylons: scale < 0.64 ? 'lattice' : 'mast',
    name: '',
    ...profileFields({ id: `seed-${seed}`, capacity: Math.round(8000 + scale * 60000), pylons: scale < 0.64 ? 'lattice' : 'mast', pattern: 'stripes' }),
  };
}

/**
 * A spec from a stadium definition (data/stadiums.js) — the v70 path. The
 * definition says what the ground *is*; the seed only nudges the attendance,
 * so the same ground is the same ground every visit and never quite as full.
 */
function specFromDef(def, seed) {
  const r = mulberry(seed || 1);
  const scale = Math.max(0, Math.min(1, def.size));
  return {
    scale,
    depth: 11 + scale * 21,
    backZ: 7 + scale * 16,
    roof: def.roof !== 'none',
    roofStyle: def.roof || 'none',
    bowl: !!def.bowl,
    tiers: Math.min(3, Math.max(1, def.tiers | 0)) || 1,
    fill: Math.min(0.98, Math.max(0.3, (def.fill ?? 0.8) + (r() - 0.5) * 0.16)),
    /* The builder's extras (data/builder.js): a name spelled out in the seats
       of the far stand, what surrounds the ground, and what its outside is
       made of. World grounds leave them unset and get the city. */
    lettering: String(def.lettering || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 14),
    landscape: def.landscape || 'city',
    facadeStyle: def.facadeStyle || 'concrete',
    seats: (def.seats || ['#1c3f6e', '#14335c']).map(hexOf),
    facade: hexOf(def.facade || '#2a3142'),
    pattern: def.pattern || 'stripes',
    pylons: def.pylons || (scale < 0.64 ? 'lattice' : 'mast'),
    tallPylons: (def.pylons || (scale < 0.64 ? 'lattice' : 'mast')) === 'lattice',
    name: def.name || '',
    ...profileFields(def),
  };
}

/* v78: what kind of ground this is (data/grounds.js) — the class decides how
   much of it gets built, the rest dresses it. A club's own mowing pattern
   wins over the ground's; the builder's landscape wins over the region's. */
function profileFields(def) {
  const pr = groundProfile(def, def.host || null);
  return {
    klass: def.street ? 'street' : pr.klass,
    // v82: a street cage carries its surface and its walls
    street: def.street ? { surface: def.surface, cage: def.cage, sand: !!def.sand } : null,
    cage: def.street ? def.cage : null,
    landscape: def.landscape || pr.landscape,
    floodlights: pr.floodlights,
    goalStyle: pr.goalStyle,
    grass: pr.grass,
    orientation: pr.orientation,
    pattern: def.host ? pr.pattern : (def.pattern || pr.pattern),
    pylons: pr.floodlights === 'side' ? 'side' : (def.pylons || pr.floodlights),
  };
}

/* ------------------------------ atmosphere ------------------------------
 * Time of day and weather, resolved to the handful of numbers the scene
 * needs: sky, fill light, key light, fog, whether the floodlights are on and
 * whether the pitch is wet. `atmosphereFor` in data/stadiums.js decides the
 * words; this turns them into light. */
function lightingFor(atmo) {
  const L = lightingBase(atmo);
  /* v78: snow is overcast light off a white pitch — a paler, denser fog and a
     touch less exposure, or the whole frame clips. */
  if (atmo?.weather === 'snow') {
    const night = (atmo.time || 'night') === 'night';
    L.fog = [night ? 0x2a3140 : 0xc9d1dc, night ? 0.0052 : 0.004];
    L.exposure *= night ? 0.8 : 0.9;
    L.beams *= 0.35;                      // the air is full of snow; the beams would turn it to a white sheet
    L.haze = false;
    L.bg = night ? 0x1a2030 : 0xaab4c2;
    L.grade = { ...(L.grade || {}), saturation: 0.82, temperature: -0.35 };
  }
  return L;
}
function lightingBase(atmo) {
  const time = atmo?.time || 'night';
  const weather = atmo?.weather || 'clear';
  const rain = weather === 'rain';
  const dull = weather === 'overcast' || rain || weather === 'snow';
  if (time === 'day') {
    return dull
      ? { grade: { gain: [0.96, 0.98, 1.02], saturation: 0.85, temperature: -0.25 }, hemi: [0xaab6c8, 0x36493c, 1.45 * (rain ? 0.9 : 1)], sun: [0xdde4ee, 1.25, [-30, -50, 120]], fog: [rain ? 0x6f7887 : 0x8e98a6, rain ? 0.0046 : 0.003], flood: 0.45, beams: 0, exposure: 1.02, bg: rain ? 0x5f6a78 : 0x7d8796 }
      : { grade: { gain: [1.02, 1.0, 0.98], saturation: 1.08, temperature: 0.12 }, hemi: [0xbfd8ff, 0x3a5a3a, 1.6], sun: [0xfff2dc, 2.6, [-30, -45, 120]], fog: [0xbfd4ee, 0.0018], flood: 0, beams: 0, exposure: 1.0, bg: 0x9fc3ee };
  }
  if (time === 'dusk') {
    return { grade: { lift: [0.01, 0, 0], gain: [1.06, 0.98, 0.9], saturation: 1.12, temperature: 0.45 }, godrays: !dull, hemi: [dull ? 0xb08a90 : 0xf0a070, 0x2a3324, 1.3], sun: [dull ? 0xd0a090 : 0xffa860, dull ? 0.9 : 1.8, [-120, -30, 30]], fog: [rain ? 0x3a3038 : 0x4a2f3a, rain ? 0.0045 : 0.0028], flood: 0.8, beams: 0.5, exposure: 1.08, bg: 0x5a3a4a };
  }
  return { grade: { lift: [0, 0, 0.012], gamma: [1, 1, 0.97], gain: [0.98, 1.0, 1.06], saturation: 1.04, temperature: -0.3 }, haze: true, hemi: [0x9fc0ff, 0x1c3324, 1.35 * (rain ? 0.92 : 1)], sun: [0xdfe8ff, 0.85, [-46, -30, 88]], fog: [rain ? 0x0a1018 : 0x070d18, rain ? 0.0062 : 0.0042], flood: 1, beams: 1, exposure: 1.14, bg: 0x070d18 };
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
/* The away strip: chosen so it never clashes with the home shirt — and, when
   the player has asked for colour-safe kits (`match.vision`), never clashes
   for a deutan, protan or tritan viewer either. See js/kits.js. */
function pickAwayKit(match) {
  return new THREE.Color(hexOf(pickAwayHex(match.teams[0].colors[0], match.teams[1].colors, match.vision || 'normal')));
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

/**
 * How the pitch was mown. Draws the two-tone pattern into a canvas of W x H
 * pixels, in the two colours given, with a soft seam of `feather` pixels.
 *   stripes  — sixteen bands across the width, the classic
 *   checks   — stripes both ways, the chequerboard the big grounds cut
 *   diagonal — bands at a slant, mown corner to corner
 *   rings    — concentric circles out from the centre spot
 *   plain    — a single cut, only the faintest banding
 */
function mow(g, W, H, pattern, colA, colB, feather) {
  const band = (i, n, vertical) => {
    const sw = (vertical ? W : H) / n;
    g.fillStyle = i % 2 ? colA : colB;
    if (vertical) g.fillRect(sw * i - 1, 0, sw + 2, H); else g.fillRect(0, sw * i - 1, W, sw + 2);
  };
  const seams = (n, vertical) => {
    const sw = (vertical ? W : H) / n;
    for (let i = 1; i < n; i++) {
      const x = sw * i;
      const grad = vertical ? g.createLinearGradient(x - feather, 0, x + feather, 0)
        : g.createLinearGradient(0, x - feather, 0, x + feather);
      grad.addColorStop(0, i % 2 ? colB : colA);
      grad.addColorStop(1, i % 2 ? colA : colB);
      g.fillStyle = grad;
      if (vertical) g.fillRect(x - feather, 0, feather * 2, H); else g.fillRect(0, x - feather, W, feather * 2);
    }
  };
  if (pattern === 'plain') {
    g.fillStyle = colA; g.fillRect(0, 0, W, H);
    g.globalAlpha = 0.28;
    for (let i = 0; i < STRIPES; i++) band(i, STRIPES, true);
    g.globalAlpha = 1;
    return;
  }
  if (pattern === 'diagonal') {
    g.save();
    g.translate(W / 2, H / 2);
    g.rotate(-0.42);
    const D = Math.hypot(W, H);
    const n = STRIPES + 6;
    const sw = D / n;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? colA : colB;
      g.fillRect(-D / 2 + sw * i - 1, -D / 2, sw + 2, D);
    }
    for (let i = 1; i < n; i++) {
      const x = -D / 2 + sw * i;
      const grad = g.createLinearGradient(x - feather, 0, x + feather, 0);
      grad.addColorStop(0, i % 2 ? colB : colA);
      grad.addColorStop(1, i % 2 ? colA : colB);
      g.fillStyle = grad;
      g.fillRect(x - feather, -D / 2, feather * 2, D);
    }
    g.restore();
    return;
  }
  if (pattern === 'rings') {
    g.fillStyle = colB; g.fillRect(0, 0, W, H);
    const R = Math.hypot(W, H) / 2;
    const n = 14;
    for (let i = n; i >= 1; i--) {
      g.fillStyle = i % 2 ? colA : colB;
      g.beginPath(); g.arc(W / 2, H / 2, (R / n) * i, 0, 7); g.fill();
    }
    return;
  }
  for (let i = 0; i < STRIPES; i++) band(i, STRIPES, true);
  seams(STRIPES, true);
  if (pattern === 'checks') {
    // the cross-cut, laid over the first at a third of its strength so both
    // directions read and neither wins
    g.globalAlpha = 0.34;
    for (let i = 0; i < 8; i++) band(i, 8, false);
    g.globalAlpha = 1;
  }
}

/** Weld a couple of small indexed geometries into one. */
function mergeGeos(...parts) {
  const positions = []; const normals = []; const uvs = []; const indices = [];
  for (const g of parts) {
    const base = positions.length / 3;
    const pos = g.attributes.position.array;
    const nrm = g.attributes.normal.array;
    const uv = g.attributes.uv?.array;
    for (let i = 0; i < pos.length; i++) positions.push(pos[i]);
    for (let i = 0; i < nrm.length; i++) normals.push(nrm[i]);
    if (uv) for (let i = 0; i < uv.length; i++) uvs.push(uv[i]);
    for (const v of g.index.array) indices.push(v + base);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  if (uvs.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  out.setIndex(indices);
  return out;
}

/** Which way a mow pattern's bands run: 0 across the width, 1 along it, 2 diagonal, 3 rings. */
function pattern2Axis(pattern) {
  return pattern === 'rings' ? 3 : pattern === 'diagonal' ? 2 : 0;
}

/**
 * Tiling blade noise: the turf's normal map, and the matching height map the
 * parallax walks through. One square metre or so.
 *
 * The height map is the reason the pitch stops being a picture. A normal map
 * alone only changes how a flat surface is *shaded*; a height map lets the
 * shader offset what you see along the view direction, so the blades slide
 * across each other as the camera moves and the troughs between them go dark.
 * That parallax is what the eye reads as depth.
 */
function turfDetail(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const hc = document.createElement('canvas');
  hc.width = hc.height = size;
  const hg = hc.getContext('2d');
  hg.fillStyle = '#404040';                      // the floor between the blades
  hg.fillRect(0, 0, size, size);
  hg.lineCap = 'round';
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
    // the same blade in the height map: bright at the tip, fading to the floor
    const tip = 150 + Math.round(rand() * 95);
    hg.lineWidth = 1.6;
    for (const [ox, oy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
      g.beginPath();
      g.moveTo(x + ox, y + oy);
      g.lineTo(x + ox + lean * len, y + oy - len);
      g.stroke();
      const grad = hg.createLinearGradient(x + ox, y + oy, x + ox + lean * len, y + oy - len);
      grad.addColorStop(0, 'rgb(74,74,74)');
      grad.addColorStop(1, `rgb(${tip},${tip},${tip})`);
      hg.strokeStyle = grad;
      hg.beginPath();
      hg.moveTo(x + ox, y + oy);
      hg.lineTo(x + ox + lean * len, y + oy - len);
      hg.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  const hTex = new THREE.CanvasTexture(hc);
  hTex.wrapS = hTex.wrapT = THREE.RepeatWrapping;
  hTex.anisotropy = 8;
  return { normal: tex, height: hTex };
}

/** Per-stripe gloss plus the worn patches, so the mow catches the lights. */
function pitchRoughness(pattern = 'stripes') {
  const S = 6;
  const c = document.createElement('canvas');
  c.width = Math.round(PITCH.w * S);
  c.height = Math.round(PITCH.h * S);
  const g = c.getContext('2d');
  const m = (v) => v * S;

  // grass lying away from you is glossy, lying towards you is matt
  mow(g, c.width, c.height, pattern, '#d2d2d2', '#f0f0f0', m(0.35));
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
function wearPatches(put0) {
  const put = (x, y, r) => put0(x, y, r * Math.max(0.45, SCALE));   // v80: smaller pitch, smaller patches
  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? 1 : -1;
    put(gx + inw * 3.2, CY, 8.5);            // the goalmouth
    put(gx + inw * FIELD.spot, CY, 2.4);     // the penalty spot
    put(gx + inw * BOX.w, CY, 4.2);          // the edge of the D
  }
  put(PITCH.w / 2, CY, 7);                   // the centre circle
  put(PITCH.w * 0.32, 4.5, 6);               // the channels the full-backs run
  put(PITCH.w * 0.68, PITCH.h - 4.5, 6);
}

function pitchTexture(detail = true, pattern = 'stripes', wet = false, opts = {}) {
  const { seasonWear = 0, lineFade = 0, frost = false, snow = false } = opts;
  const S = detail ? 22 : 12;                     // pixels per metre
  const c = document.createElement('canvas');
  c.width = Math.round(PITCH.w * S);
  c.height = Math.round(PITCH.h * S);
  const g = c.getContext('2d');
  const m = (v) => v * S;

  /* Mown bands: flat, with the blend only at the seam.
     A first attempt ran a gradient across the full width of each band, which
     put a shade change down the *middle* of every stripe and made sixteen
     stripes read as thirty-two. A mower leaves each pass uniform; the only soft
     edge is where two passes meet, and it is about a boot's width wide.
     Rain darkens and cools the whole surface. */
  /* The two bands are not one green at two brightnesses. Grass mown away from
     you shows the pale underside of the blade and reads cooler and lighter;
     mown towards you it shows the dark face and reads warmer and deeper. Two
     different greens, a real step apart, is what a televised pitch looks like
     — and what the old pair (a 10% brightness step on one hue) did not. */
  mow(g, c.width, c.height, pattern,
    wet ? '#2c7b42' : '#3d9a4e',          // away from the camera: lighter, yellower
    wet ? '#134a26' : '#1c6530',          // towards it: deep and slightly blue
    m(0.35));

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

  /* v78: the season shows. Late in a season the goalmouths and the centre
     circle are bare earth, not merely paler grass, and the channels the
     full-backs run are thinned out. `seasonWear` is 0 on the opening day. */
  if (seasonWear > 0.05) {
    wearPatches((x, y, r) => {
      const n = Math.round(4 + seasonWear * 18);
      for (let k = 0; k < n; k++) {
        const px2 = x + (Math.random() - 0.5) * r * 1.3; const py2 = y + (Math.random() - 0.5) * r * 1.1;
        const rr = r * (0.12 + Math.random() * 0.3) * (0.6 + seasonWear);
        const grad = g.createRadialGradient(m(px2), m(py2), 0, m(px2), m(py2), m(rr));
        grad.addColorStop(0, `rgba(${wet ? '88,66,42' : '122,98,62'},${0.25 + seasonWear * 0.45})`);
        grad.addColorStop(0.7, `rgba(${wet ? '88,66,42' : '130,112,70'},${0.1 + seasonWear * 0.2})`);
        grad.addColorStop(1, 'rgba(130,112,70,0)');
        g.fillStyle = grad;
        g.beginPath(); g.arc(m(px2), m(py2), m(rr), 0, 7); g.fill();
      }
    });
  }
  /* Frost on a winter night: a pale, cold bloom over everything, heaviest in
     the shade of the stands at the edges. Snow: the pitch is white, and the
     lines are brushed clear down to the grass. */
  if (frost || snow) {
    g.globalAlpha = snow ? 0.9 : 0.34;
    g.fillStyle = snow ? '#eef3f8' : '#d8e6f4';
    g.fillRect(0, 0, c.width, c.height);
    // texture in it: drifts in the snow; in frost only a fine, even sparkle (blotches read as a rash)
    g.globalAlpha = snow ? 0.18 : 0.07;
    for (let i = 0; i < (snow ? 1600 : 5000); i++) {
      g.fillStyle = Math.random() < 0.5 ? '#ffffff' : (snow ? '#c9d4e0' : '#b6c9da');
      g.beginPath(); g.arc(Math.random() * c.width, Math.random() * c.height, m(snow ? 0.2 + Math.random() * 1.1 : 0.05 + Math.random() * 0.12), 0, 7); g.fill();
    }
    if (frost) {
      // the edges stay frosted longest
      const edge = g.createLinearGradient(0, 0, 0, c.height);
      edge.addColorStop(0, 'rgba(225,238,250,.28)'); edge.addColorStop(0.18, 'rgba(225,238,250,0)');
      edge.addColorStop(0.82, 'rgba(225,238,250,0)'); edge.addColorStop(1, 'rgba(225,238,250,.28)');
      g.globalAlpha = 1; g.fillStyle = edge; g.fillRect(0, 0, c.width, c.height);
    }
    g.globalAlpha = 1;
  }

  /* Markings.
   *
   * Painted, not drawn: a touch of blur and a hair under full white, because
   * pin-sharp pure-white vector lines were a large part of why this read as a
   * diagram. The corner arcs and the two penalty arcs were simply missing
   * before — the most conspicuous omission on the whole surface. */
  g.save();
  // paint fades a little on grounds that do not re-mark every week (v78); in snow the lines are cleared to the grass
  const lineCol = snow ? `rgba(46,120,62,${0.92 - lineFade * 0.3})` : `rgba(248,252,255,${0.82 - lineFade * 0.34})`;
  g.strokeStyle = lineCol;
  g.fillStyle = lineCol;
  g.lineWidth = Math.max(2, m(0.12));
  g.shadowColor = 'rgba(255,255,255,.35)';
  g.shadowBlur = Math.max(1, m(0.05));
  const L = 0.3;                                   // inset of the touchline

  g.strokeRect(m(L), m(L), m(PITCH.w - L * 2), m(PITCH.h - L * 2));
  g.beginPath(); g.moveTo(m(PITCH.w / 2), m(L)); g.lineTo(m(PITCH.w / 2), m(PITCH.h - L)); g.stroke();
  g.beginPath(); g.arc(m(PITCH.w / 2), m(CY), m(FIELD.circle), 0, 7); g.stroke();
  g.beginPath(); g.arc(m(PITCH.w / 2), m(CY), m(0.35), 0, 7); g.fill();

  for (const side of [0, 1]) {
    const gx = side === 0 ? L : PITCH.w - L;
    const inw = side === 0 ? 1 : -1;
    const spot = gx + inw * FIELD.spot;
    g.strokeRect(side === 0 ? m(L) : m(PITCH.w - L - BOX.w), m(CY - BOX.half),
      m(BOX.w), m(BOX.half * 2));
    if (FIELD.sixW > 0) g.strokeRect(side === 0 ? m(L) : m(PITCH.w - L - FIELD.sixW), m(CY - FIELD.sixHalf),
      m(FIELD.sixW), m(FIELD.sixHalf * 2));
    g.beginPath(); g.arc(m(spot), m(CY), m(0.3), 0, 7); g.fill();

    /* The D: a 9.15 m arc about the penalty spot, clipped to the part that
       falls outside the box — which is the only part that gets painted. */
    const boxEdge = gx + inw * BOX.w;
    const half = Math.acos(Math.min(1, Math.abs(boxEdge - spot) / FIELD.circle));
    const face = side === 0 ? 0 : Math.PI;
    g.beginPath();
    g.arc(m(spot), m(CY), m(FIELD.circle), face - half, face + half);
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
  // worn paint: small gaps where the line has scuffed away
  if (lineFade > 0.1 && !snow) {
    g.save();
    g.globalCompositeOperation = 'source-atop';
    const gaps = Math.round(lineFade * 900);
    for (let i = 0; i < gaps; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(40,110,55,.35)' : 'rgba(30,90,45,.3)';
      g.fillRect(Math.random() * c.width, Math.random() * c.height, m(0.25 + Math.random() * 0.5), m(0.25 + Math.random() * 0.5));
    }
    g.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Generic panelled ball — markings are what make the roll readable. */
function ballTexture(winter = false) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  // v78: the winter ball — orange, so it shows against a white pitch
  g.fillStyle = winter ? '#ff6a13' : '#f4f6fa';
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

/**
 * The sky, by time and weather. Night is a horizon glow with stars; day is
 * blue with a sun and a scatter of cloud; overcast and rain are grey; dusk is
 * the band of orange under a darkening top. Used as the background and as the
 * light source for reflections, so a grey day genuinely lights the pitch grey.
 */
function skyTexture(atmo) {
  const time = atmo?.time || 'night';
  const weather = atmo?.weather || 'clear';
  const dull = weather !== 'clear';
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  /* v85: the middle row of this texture is the horizon, and it is painted in
     (nearly) the fog's colour — the far land fades to the fog, so a sky that
     was still mid-blue at the horizon drew a hard band round every ground. */
  if (time === 'day' && !dull) {
    grad.addColorStop(0, '#2a62c4'); grad.addColorStop(0.3, '#5f9be6'); grad.addColorStop(0.44, '#9cc3ee'); grad.addColorStop(0.5, '#c2d6ee'); grad.addColorStop(1, '#dbe9f7');
  } else if (time === 'day') {
    const dark = weather === 'rain';
    grad.addColorStop(0, dark ? '#4c5563' : '#6f7a8a'); grad.addColorStop(0.42, dark ? '#646e7c' : '#8a95a4'); grad.addColorStop(0.5, dark ? '#6f7887' : '#8e98a6'); grad.addColorStop(1, dark ? '#8a929e' : '#c0c8d2');
  } else if (time === 'dusk') {
    grad.addColorStop(0, '#141d4a'); grad.addColorStop(0.3, dull ? '#4a3a52' : '#6a3a6a'); grad.addColorStop(0.44, dull ? '#8a5a58' : '#c8623f'); grad.addColorStop(0.5, dull ? '#5a4048' : '#7a4040'); grad.addColorStop(1, dull ? '#3a2f38' : '#4a2f3a');
  } else {
    grad.addColorStop(0, '#02040a'); grad.addColorStop(0.35, '#060c1c'); grad.addColorStop(0.46, '#0d1a33'); grad.addColorStop(0.5, '#0b1526'); grad.addColorStop(1, '#070d18');
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);

  const cloud = (n, alpha, col) => {
    for (let i = 0; i < n; i++) {
      const x = Math.random() * c.width;
      const y = c.height * (0.2 + Math.random() * 0.5);
      const w = 40 + Math.random() * 140;
      const h = w * (0.25 + Math.random() * 0.2);
      const rg = g.createRadialGradient(x, y, 0, x, y, w);
      rg.addColorStop(0, `rgba(${col},${alpha})`);
      rg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = rg;
      g.save(); g.translate(x, y); g.scale(1, h / w); g.beginPath(); g.arc(0, 0, w, 0, 7); g.fill(); g.restore();
    }
  };
  if (time === 'day' && !dull) {
    // the sun, low enough to be in frame over the far stand
    const sx = c.width * 0.62;
    const sy = c.height * 0.34;
    const sun = g.createRadialGradient(sx, sy, 0, sx, sy, 90);
    sun.addColorStop(0, 'rgba(255,250,230,1)'); sun.addColorStop(0.12, 'rgba(255,245,210,.9)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = sun; g.beginPath(); g.arc(sx, sy, 90, 0, 7); g.fill();
    cloud(18, 0.55, '255,255,255');
  } else if (time === 'day') {
    cloud(40, 0.35, weather === 'rain' ? '70,78,90' : '120,130,145');
    cloud(24, 0.3, weather === 'rain' ? '140,148,160' : '200,206,214');
  } else if (time === 'dusk') {
    cloud(14, 0.4, dull ? '90,70,80' : '255,150,90');
  }
  if (time !== 'night') {
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

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

export function __pitchCanvas() {
  return { colour: pitchTexture(true).image.toDataURL(), rough: pitchRoughness().image.toDataURL() };
}

/**
 * How many pixels the scene may actually be rendered at, before the composer's
 * targets stop fitting in a graphics card.
 *
 * **This is the black-flicker fix, and it is the first one grounded in a
 * reproduction rather than a theory** — the flash was reported on Ultra only,
 * on desktop and iPad alike, which is the case HANDOFF had already written down
 * as "memory or bandwidth, cap the Ultra pixel ratio".
 *
 * Ultra asked for `max(2, dpr)` — *at least* twice the CSS size, whatever the
 * display, so an ordinary 1x desktop monitor still supersampled 2x. That number
 * then gets squared into memory, twice over:
 *
 * - `EffectComposer` keeps **two** full-size targets and they are `HalfFloat`,
 *   so eight bytes a pixel, not four.
 * - Both carry a 32-bit `DepthTexture` for the cinematic pass.
 * - `UnrealBloomPass` adds a mip chain on top.
 *
 * At 1440p that is 5120x2880 a target: ~236 MB for the pair, ~470 MB with
 * depth. At 4K it is 7680x4320 and over a gigabyte. Allocations that size
 * either fail outright — an incomplete framebuffer draws nothing, which is a
 * black region — or evict something else and thrash, which is a black region
 * that moves around and comes back. Both match the report.
 *
 * Two ceilings, and the hardware one is not negotiable:
 *
 * 1. **`maxTextureSize`.** A target wider than the driver allows does not
 *    allocate at all. Plenty of GPUs report 8192, and a 5K or ultrawide screen
 *    at 2x sails past it.
 * 2. **A pixel budget.** 9 MP keeps 1080p at the full 2x it was tuned for,
 *    pulls 1440p back to ~1.55x, and lands 4K at about native — which is
 *    exactly the "cap at native" the handoff predicted, arrived at by a rule
 *    rather than by picking a number per resolution.
 */
const MAX_RENDER_PIXELS = 9e6;

const cssSize = (canvas) => ({
  w: canvas.clientWidth || canvas.width || window.innerWidth || 1280,
  h: canvas.clientHeight || canvas.height || window.innerHeight || 720,
});

function safeRatio(renderer, want, { w, h }) {
  // Some drivers report enormous limits they cannot really back with memory,
  // so 8192 is the ceiling regardless of what the card claims.
  const maxDim = Math.max(2048, Math.min(renderer.capabilities?.maxTextureSize || 4096, 8192));
  let r = Math.min(want, Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, w * h)));
  // Never render so far below native that the picture turns to mush; the hard
  // limit below still wins over this floor.
  r = Math.max(0.75, r);
  return Math.min(r, maxDim / Math.max(1, w), maxDim / Math.max(1, h));
}

export function createRenderer(canvas, match, quality, models = false) {
  // 'ultra' is the deliberately expensive tier: it supersamples above the native
  // pixel ratio, quadruples the shadow map, and fills the stands out properly.
  const cinema = quality === 'cinema';
  const ultra = quality === 'ultra' || cinema;     // cinema is Ultra with everything on
  /* 'medium' (v70) sits between Low and High: the post passes and the beams
   * stay, at fewer samples and a native pixel ratio, with a lighter crowd and
   * a smaller shadow map. It is what a modern phone is dealt automatically. */
  const med = quality === 'medium';
  /* Where and when. The match screen sets `match.venue` from the stadium
   * definitions; anything that does not (the perf harness, an old caller)
   * gets the seeded ground and a clear night, exactly as before. */
  const atmo = match.venue?.atmo || { time: 'night', weather: 'clear', intensity: 0.5, wet: false };
  const LIGHT = lightingFor(atmo);
  const wet = !!atmo.wet;
  const snow = atmo.weather === 'snow';          // v78
  const frost = !!atmo.frost && !snow;
  /* 'min' is Ultra Low: the tier for hardware that Low still stutters on.
   * `potato` is what it goes further on; `lo` is everything Low already
   * skips, which Ultra Low skips too — one flag, so a future gate cannot
   * accidentally include min in the fancy path by testing !== 'low'. */
  const potato = quality === 'min';
  const lo = quality === 'low' || potato;
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
  // v87: what the frame governor has taken away (see game/governor.js)
  let load = { post: true, shadows: true, netSteps: null, scale: 1 };
  let lastSize = null;
  const wantRatio = potato
    ? Math.min(0.8, dpr)                     // sub-native and stretched: the potato win
    : cinema
      ? Math.min(3, Math.max(2.5, dpr))      // Ultra+: three times native where the budget allows
    : ultra
      ? Math.min(3, Math.max(2, dpr))        // render above native, then downsample
      : Math.min(quality === 'low' ? 1.25 : med ? 1.5 : 2, dpr);
  const startRatio = safeRatio(renderer, wantRatio, cssSize(canvas));
  renderer.setPixelRatio(startRatio);
  {
    /* Said out loud once, because "what is it actually rendering at" is the
     * first question worth asking about a graphics report and there is no way
     * to answer it from the outside. Costs one line at kick-off. */
    const { w, h } = cssSize(canvas);
    console.info('[apexxi] %s: %dx%d css, ratio %s (wanted %s) -> %dx%d, maxTex %d',
      quality, w, h, startRatio.toFixed(2), wantRatio.toFixed(2),
      Math.round(w * startRatio), Math.round(h * startRatio),
      renderer.capabilities?.maxTextureSize || 0);
  }
  renderer.shadowMap.enabled = !lo;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // filmic tone mapping is what stops floodlit whites blowing out to flat grey
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = LIGHT.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const sky = skyTexture(atmo);
  scene.background = sky;
  scene.fog = new THREE.FogExp2(LIGHT.fog[0], LIGHT.fog[1]);

  // Image-based lighting from the sky. Needs float render targets, which some
  // mobile GPUs refuse — fall back to plain lighting rather than failing to boot.
  let pmrem = null;
  try {
    pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(sky).texture;
  } catch {
    pmrem = null;
  }

  // v85: 3 km out — the landscape reaches the horizon (at 900 m the far land and the mountains were cut off)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 3000);
  camera.up.set(0, 0, 1);

    /* Lifted from 0.95. The base level matters as much as the lamps do: the
     brighter the fill, the smaller the *relative* step between a floodlight
     pool and the ground beside it, and it was that step — not the absolute
     brightness — that read as four spotlights pointed at a field. */
  scene.add(new THREE.HemisphereLight(LIGHT.hemi[0], LIGHT.hemi[1], LIGHT.hemi[2]));
  const sun = new THREE.DirectionalLight(LIGHT.sun[0], LIGHT.sun[1]);
  const SUN_OFF = LIGHT.sun[2];
  sun.position.set(SUN_OFF[0], SUN_OFF[1], SUN_OFF[2]);
  sun.target.position.set(PITCH.w / 2, CY, 0);
  scene.add(sun, sun.target);
  /* Light on the people. The sun and the hemisphere light the ground well
     and left the figures flat: a rim light from behind the far stand
     separates a player from the turf, and a soft fill from the camera side
     lifts the shadowed half of a face and a shirt. Neither casts shadows. */
  const rim = new THREE.DirectionalLight(0xdfe9ff, LIGHT.flood > 0 ? 1.1 : 0.55);
  rim.position.set(PITCH.w / 2, PITCH.h + 70, 38);
  rim.target.position.set(PITCH.w / 2, CY, 1);
  const fill = new THREE.DirectionalLight(0xfff1dc, LIGHT.flood > 0 ? 0.42 : 0.28);
  fill.position.set(PITCH.w / 2, -60, 30);
  fill.target.position.set(PITCH.w / 2, CY, 1);
  scene.add(rim, rim.target, fill, fill.target);
  if (renderer.shadowMap.enabled) {
    sun.castShadow = true;
    /* 2048 at the top, not 4096. The shadow camera covers 160x140 world units,
       so 2048 is about thirteen texels per metre — past the point where more
       resolution is visible on a player-sized object, and a 4096 depth map is
       67 MB of GPU memory on a device that has to hold the composer targets,
       the bloom mip chain and a 14 MB player model at the same time. */
    const shadowRes = quality === 'low' || med ? 1024 : ultra ? 2048 : 1536;
    sun.shadow.mapSize.set(shadowRes, shadowRes);
    sun.shadow.bias = -0.0008;
    const c = sun.shadow.camera;
    c.left = -80; c.right = 80; c.top = 70; c.bottom = -70; c.near = 20; c.far = 220;
  }

  // ground + pitch
  const surround = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.w + MARGIN * 2 + 60, PITCH.h + MARGIN * 2 + 60),
    new THREE.MeshStandardMaterial({ color: wet ? 0x0d2418 : 0x123021, roughness: wet ? 0.7 : 0.95 }));
  surround.position.set(PITCH.w / 2, CY, -0.06);
  surround.receiveShadow = true;
  scene.add(surround);

  /* This ground. From the stadium definition when the match screen supplied
     one; otherwise seeded off the two team names so a fixture is always the
     same stadium, and different fixtures are different stadiums. */
  const venueSeed = hashName(`${match.teams[0].name}|${match.teams[1].name}`);
  const VENUE = match.venue?.stadium ? specFromDef(match.venue.stadium, venueSeed) : stadiumSpec(venueSeed);
  // v78: a big game sells out, whatever the ground usually draws
  if (match.venue?.bigGame) VENUE.fill = 0.99;
  /* v78: the ground faces its own way, so the sun comes round with it — at one
     ground the far stand throws its shadow across the pitch in the late
     afternoon, at another the sun is behind the camera. Night keeps its tuned
     moon; only the sun moves. */
  if (atmo.time !== 'night') {
    const a = ((VENUE.orientation || 0) * Math.PI) / 180;
    const [sx, sy] = SUN_OFF;
    SUN_OFF[0] = sx * Math.cos(a) - sy * Math.sin(a);
    SUN_OFF[1] = sx * Math.sin(a) + sy * Math.cos(a);
    sun.position.set(SUN_OFF[0], SUN_OFF[1], SUN_OFF[2]);
  }

  let turfHeight = null;                 // the blade height map the parallax walks through
  // v78: how far through the season (wear), how well the lines are kept, winter
  const seasonWear = Math.max(0, Math.min(1, match.venue?.seasonWear ?? 0.15));
  const STREET = VENUE.klass === 'street';
  const turfMap = STREET
    ? courtTexture(VENUE.street.surface, { circle: FIELD.circle, spot: FIELD.spot, boxW: FIELD.boxW, boxHalf: FIELD.boxHalf, goalHalf: FIELD.goalHalf })
    : pitchTexture(!lo, VENUE.pattern, wet, { seasonWear, lineFade: VENUE.grass?.lineFade || 0, frost, snow });
  const turfMat = new THREE.MeshStandardMaterial({
    // v78: snow is white but not a light source — under floodlights a full-albedo pitch blooms the whole frame out
    color: snow ? new THREE.Color().setScalar(LIGHT.flood > 0 ? 0.5 : 0.82) : 0xffffff,
    map: turfMap,
    /* Cut grass under floodlights is *faintly* specular — that sheen sweeping
       across the stripes is most of what separates a lit pitch from a green
       rectangle. Faintly is the operative word. At 0.74, with a roughness map
       taking the glossy stripes down to 0.41, the turf behaved like a mirror at
       grazing angles and threw a blown-out white sheet across the near corners
       of every camera angle. Grass is never that shiny. */
    /* Wet grass is the exception: rain leaves a film that mirrors the
       floodlights, and that sheen is most of what says "raining" once the
       drops themselves are too fine to see. */
    roughness: wet ? 0.8 : 0.9,
    metalness: wet ? 0.03 : 0.02,
    envMapIntensity: wet ? 0.45 : 0.35,
  });
  /* Blade detail and the mow's gloss, on everything but the low path — this is
     the difference between grass and a green rectangle with lines on it. The
     normal map tiles roughly once per 2.6 m so individual blades stay under a
     centimetre, and its own `repeat` is independent of the colour map's. */
  if (!lo) {
    const detail = turfDetail(ultra ? 512 : 256);
    detail.normal.repeat.set(PITCH.w / 2.6, PITCH.h / 2.6);
    detail.height.repeat.copy(detail.normal.repeat);
    turfMat.normalMap = detail.normal;
    turfMat.normalScale = new THREE.Vector2(0.95, 0.95);
    turfMat.roughnessMap = pitchRoughness(VENUE.pattern);
    turfHeight = detail.height;
  }

  /* The pitch is a surface, not a picture.
   *
   * Two things stop it reading as a photograph laid on the floor. The first
   * is here: the plane is subdivided and displaced, with a crown down the
   * middle (every real pitch is convex — it is how they drain) and a metre-
   * scale undulation on top of it. A couple of centimetres is enough; what
   * sells it is that the far touchline is no longer a mathematically straight
   * line and the light slides across the humps as the camera moves.
   *
   * The second is in the shader below: parallax through the blade height map,
   * so the grass has thickness you can look *into* at a grazing angle.
   */
  const segX = potato ? 1 : lo ? 52 : med ? 105 : 210;
  const segY = potato ? 1 : lo ? 34 : med ? 68 : 136;
  const turfGeo = new THREE.PlaneGeometry(PITCH.w, PITCH.h, segX, segY);
  /* The height of the turf at a point on the pitch, so the ball, the players,
     the goals and the markers stand on the crowned surface instead of inside
     it (v77: the v76 crown buried the ball by up to a quarter of a metre in
     the middle of the pitch). Flat at 0 on the potato tier. */
  let surfaceAt = () => 0;
  if (!potato) {
    const pos = turfGeo.attributes.position;
    const nz = mulberry(venueSeed ^ 0x9ea55);
    // three octaves of value noise, sampled off a small lattice
    const lat = [];
    for (let i = 0; i < 4096; i++) lat.push(nz() * 2 - 1);
    const at = (x, y, f) => {
      const gx = x * f; const gy = y * f;
      const x0 = Math.floor(gx); const y0 = Math.floor(gy);
      const fx = gx - x0; const fy = gy - y0;
      const h = (a, b) => lat[(((a * 73856093) ^ (b * 19349663)) >>> 0) % lat.length];
      const sx = fx * fx * (3 - 2 * fx); const sy = fy * fy * (3 - 2 * fy);
      return (h(x0, y0) * (1 - sx) + h(x0 + 1, y0) * sx) * (1 - sy)
           + (h(x0, y0 + 1) * (1 - sx) + h(x0 + 1, y0 + 1) * sx) * sy;
    };
    const endTaper = (x) => { const e = Math.min(1, Math.min(x, PITCH.w - x) / 9); return e * e * (3 - 2 * e); };
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + PITCH.w / 2;
      const y = pos.getY(i) + PITCH.h / 2;
      // the crown: 9 cm up the middle, tapering to nothing at the touchlines
      /* tapered away over the last 9 m before each goal line (v77), so the
         goal mouth sits level with the frame instead of 16 cm up it */
      const crown = Math.cos(((y / PITCH.h) - 0.5) * Math.PI) * 0.16 * endTaper(x);
      const undulate = at(x, y, 0.045) * 0.055 + at(x, y, 0.12) * 0.022 + at(x, y, 0.4) * 0.008;
      /* Lifted clear of the apron. The undulation is signed, so without this
         the hollows dipped under the dark surround plane and it showed
         through the pitch as a black patch with an organic edge — which is
         exactly what it looked like. */
      pos.setZ(i, 0.09 + crown + undulate);
    }
    surfaceAt = (x, y) => {
      if (x < 0 || x > PITCH.w || y < 0 || y > PITCH.h) return 0;
      const crown = Math.cos(((y / PITCH.h) - 0.5) * Math.PI) * 0.16 * endTaper(x);
      return 0.09 + crown + at(x, y, 0.045) * 0.055 + at(x, y, 0.12) * 0.022 + at(x, y, 0.4) * 0.008;
    };
    turfGeo.computeVertexNormals();
  }

  /* Depth, not a picture.
   *
   * Two things run in this one shader hook.
   *
   * **The stripes are lit, not painted.** A mown stripe is the same grass
   * lying in opposite directions; what you see is the two lies catching the
   * light differently. Painting it into the colour map alone is why the pitch
   * read as a flat sheet with lighter bars on it — the bars never changed as
   * the camera moved because nothing about them was lit. So the surface
   * normal is tilted along the band direction, one way in the odd bands and
   * the other in the even ones, in world space, and the bands match the
   * colour map's.
   *
   * **The blades have thickness.** The view direction is marched a few steps
   * through the blade height map and the normal map is sampled where it comes
   * out, so at a grazing angle you look *into* the grass: the near blades
   * slide over the far ones and the troughs between them go dark. That
   * parallax, plus the displaced surface above, is what the eye reads as
   * depth — a normal map on its own only ever shades a flat plane.
   *
   * The pitch is one plane lying in world XY, which is the one case where
   * tangent space and world space agree, so the march needs no tangent frame:
   * the offset is just the view direction's XY over its Z.
   */
  {
    const uStripe = { value: new THREE.Vector4(
      pattern2Axis(VENUE.pattern),                    // 0 = across the width, 2 = diagonal, 3 = rings
      PITCH.w / STRIPES,                              // band width in metres
      lo ? 0.5 : 0.72,                                // how hard the light separates them
      VENUE.pattern === 'checks' ? 1 : 0) };
    const uTurfH = { value: turfHeight };
    // apparent blade depth, in the blade map's own uv (one tile is 2.6 m across)
    const uPara = { value: turfHeight && !snow ? (ultra ? 0.018 : 0.013) * Math.min(1.5, VENUE.grass?.length || 1) : 0 };   // longer grass, deeper blades (v78)
    const steps = ultra ? 6 : med ? 3 : 4;
    const prev = turfMat.onBeforeCompile;
    turfMat.onBeforeCompile = (sh) => {
      prev?.(sh);
      sh.uniforms.uStripe = uStripe;
      sh.uniforms.uTurfH = uTurfH;
      sh.uniforms.uPara = uPara;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vTurfPos;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTurfPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
          #define STEPS ${steps}
          uniform vec4 uStripe; uniform sampler2D uTurfH; uniform float uPara; varying vec3 vTurfPos;
          vec2 vTurfUvP; float vTurfShade;`)
        .replace('#include <normal_fragment_maps>', `
          vTurfShade = 1.0;
          #ifdef USE_NORMALMAP
          {
            vec3 vdir = normalize(cameraPosition - vTurfPos);
            // how far along the surface a ray of sight travels per metre of depth
            vec2 slide = vdir.xy / max(0.12, abs(vdir.z));
            float depth = 0.0;
            float h = 1.0;
            vec2 uvP = vNormalMapUv;
            // march until the height map comes up to meet the ray
            for (int i = 0; i < STEPS; i++) {
              h = texture2D(uTurfH, uvP).r;
              float want = 1.0 - depth;
              if (h >= want) break;
              depth += 1.0 / float(STEPS);
              uvP = vNormalMapUv - slide * depth * uPara;
            }
            vTurfUvP = uvP;
            vTurfShade = mix(0.72, 1.0, clamp(h + 0.15, 0.0, 1.0));
          }
          #endif
          #include <normal_fragment_maps>`);
      // resample the normal map at the parallaxed uv, then lay the stripe lie on top
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <lights_fragment_begin>', `
          {
            #ifdef USE_NORMALMAP
            vec3 mapN = texture2D(normalMap, vTurfUvP).xyz * 2.0 - 1.0;
            mapN.xy *= normalScale;
            normal = normalize(vec3(normal.xy + mapN.xy * 0.9, normal.z));
            #endif
            float band = uStripe.x < 0.5 ? vTurfPos.x
                       : uStripe.x < 2.5 ? (vTurfPos.x + vTurfPos.y) * 0.7071
                       : length(vTurfPos.xy - vec2(${(PITCH.w / 2).toFixed(2)}, ${(PITCH.h / 2).toFixed(2)}));
            // -1 in one band, +1 in the next, softened across the seam
            float lie = clamp(sin(band * 6.2831853 / max(0.5, uStripe.y * 2.0)) * 3.0, -1.0, 1.0);
            vec3 dirW = uStripe.x < 0.5 ? vec3(0.0, 1.0, 0.0) : normalize(vec3(-0.7071, 0.7071, 0.0));
            // the normal here is in view space, so the world-space lie has to come with it
            normal = normalize(normal + normalize((viewMatrix * vec4(dirW, 0.0)).xyz) * lie * uStripe.z * 0.42);
            if (uStripe.w > 0.5) {
              float lie2 = clamp(sin(vTurfPos.y * 6.2831853 / max(0.5, ${(PITCH.h / 8).toFixed(2)} * 2.0)) * 3.0, -1.0, 1.0);
              normal = normalize(normal + normalize((viewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz) * lie2 * uStripe.z * 0.2);
            }
            // the troughs between the blades sit in their own shadow
            diffuseColor.rgb *= vTurfShade;
          }
          #include <lights_fragment_begin>`);
    };
    /* A plain string, not a chain onto the default: three's own
       `customProgramCacheKey` reads `this.onBeforeCompile.toString()`, and
       capturing it off the material loses its `this`. */
    const stripeKey = `apexTurf-${VENUE.pattern}${lo ? '-lo' : ''}${turfHeight ? '-p' : ''}`;
    turfMat.customProgramCacheKey = () => stripeKey;
  }

  /* Grass you can see past.
   *
   * Everything above still describes a surface. What finally stops the near
   * field reading as a photograph is grass with actual geometry in it: a
   * field of crossed cards a few centimetres tall that catch the light
   * individually and, because they stand out of the plane, break the
   * silhouette of what is behind them.
   *
   * Only near the camera. Each instance is scaled to nothing beyond a radius
   * in the vertex shader, so the ones across the pitch cost a transform and
   * no fill at all, and the whole field is one draw call. `uEye` follows the
   * camera every frame.
   */
  let tufts = null;
  // v78: blade length and density are the ground's — a community pitch is shaggier and thinner; snow buries them
  const GL_LEN = VENUE.grass?.length || 1;
  if (!lo && !potato && !snow && !STREET) {
    const N = Math.round((ultra ? 30000 : med ? 10000 : 18000) * (VENUE.grass?.density || 1));
    /* v78: a tuft is a fan of five tapered blades, not two crossed cards —
       close up in the Dynamic and Pro cameras a rectangle reads as a scrap
       of paper, a spike reads as grass. */
    const tuftGeo = (() => {
      const pos = [];
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + 0.3;
        const ox = Math.cos(a) * 0.035; const oy = Math.sin(a) * 0.035;
        const px = -Math.sin(a) * 0.018; const py = Math.cos(a) * 0.018;
        const h = 0.13 + (k % 3) * 0.025;
        const tx = ox + Math.cos(a) * 0.05; const ty = oy + Math.sin(a) * 0.05;
        pos.push(ox - px, oy - py, 0, ox + px, oy + py, 0, tx, ty, h);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(pos.length).fill(0), 3));
      return g;
    })();
    /* Every normal points at the sky.
     *
     * A blade card stands vertically, so its true normal is horizontal, and a
     * sun overhead lights it at almost exactly nothing — a field of them comes
     * out as a black mass. Lighting the cards with the *ground's* normal is
     * the standard answer: they then take the same light the turf does and
     * read as grass standing in it rather than as cardboard on edge. */
    {
      const nrm = tuftGeo.attributes.normal;
      for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 0, 1);
      nrm.needsUpdate = true;
    }
    const tuftMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.92, side: THREE.DoubleSide,
    });
    const uEye = { value: new THREE.Vector3() };
    const uReach = { value: ultra ? 34 : 26 };
    tuftMat.onBeforeCompile = (sh) => {
      sh.uniforms.uEye = uEye; sh.uniforms.uReach = uReach;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uEye; uniform float uReach; attribute float aTuft;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          {
            vec3 root = instanceMatrix[3].xyz;
            float d = distance(root.xy, uEye.xy);
            /* Shrinking the whole way out rather than standing full height to
               a radius and then stopping: the flat plateau made a solid
               carpet with a visible circular edge where it ended, which is
               worse than no grass at all. */
            transformed *= 1.0 - smoothstep(1.5, uReach, d);
            // and a lean, so the field is not a lawn of identical spikes
            transformed.x += transformed.z * sin(aTuft * 6.2831) * 0.35;
            transformed.y += transformed.z * cos(aTuft * 6.2831) * 0.35;
          }`);
      /* Double-sided cards flip their normal on the back face, which turned the
         sky normal into a ground normal on half the blades and drew them black
         (v78, seen close up in the Dynamic camera). The sky is the sky from
         either side. */
      sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
          normal = normalize(vNormal);`);
    };
    tuftMat.customProgramCacheKey = () => 'apexTuft2';
    tufts = new THREE.InstancedMesh(tuftGeo, tuftMat, N);
    tufts.castShadow = false;
    tufts.receiveShadow = false;
    tufts.frustumCulled = false;
    const tr = mulberry(venueSeed ^ 0x77a55);
    const d3 = new THREE.Object3D();
    const tc = new THREE.Color();
    const lean = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = tr() * PITCH.w;
      const y = tr() * PITCH.h;
      d3.position.set(x, y, surfaceAt(x, y));
      d3.rotation.set(0, 0, tr() * Math.PI);
      d3.scale.set(0.75 + tr() * 0.6, 0.75 + tr() * 0.6, (0.75 + tr() * 0.6) * GL_LEN);
      d3.updateMatrix();
      tufts.setMatrixAt(i, d3.matrix);
      lean[i] = tr();
      /* Coloured off the stripe it stands in, so the mow runs through the 3D
         grass as well as the texture rather than sitting underneath it. */
      const band = Math.floor((x / PITCH.w) * STRIPES) % 2;
      // a shade brighter than the texture under them: a blade catches more
      // light than the floor it grows out of, and a mass of them that reads
      // darker than the pitch looks like a stain rather than like grass
      tc.setHex(band ? 0x4a9f58 : 0x2a743d).multiplyScalar(0.82 + tr() * 0.22);
      tufts.setColorAt(i, tc);
    }
    tuftGeo.setAttribute('aTuft', new THREE.InstancedBufferAttribute(lean, 1));
    tufts.instanceMatrix.needsUpdate = true;
    scene.add(tufts);
    tufts.userData.uEye = uEye;
  }

  const turf = new THREE.Mesh(turfGeo, turfMat);
  turf.position.set(PITCH.w / 2, CY, 0);
  turf.receiveShadow = true;
  scene.add(turf);

  /* ---------------------------- pitch wear ----------------------------
   * The surface changes as the match goes on. The ball's path is tallied on
   * a coarse grid and every thirty seconds of play the busiest cells get a
   * scuff painted into the colour map — paler, browner, a little torn — so
   * the second half is played on a pitch that shows the first. The upload
   * is one canvas texture every thirty seconds, which nothing notices. */
  /* ------------------------- grass under the boots -------------------------
   * A small canvas (one texel per 25 cm) that every boot and the ball print
   * into each frame, fading back over a few seconds, used as the turf's bump
   * map: the grass lies down where the play just was and stands back up.
   * Costs a 420x272 canvas upload a frame on High and above — about the
   * price of one small texture — and nothing on Low. */
  const trample = !lo ? document.createElement('canvas') : null;
  let trampleTex = null;
  let trampleCtx = null;
  if (trample) {
    trample.width = 420; trample.height = 272;
    trampleCtx = trample.getContext('2d');
    trampleCtx.fillStyle = '#808080'; trampleCtx.fillRect(0, 0, trample.width, trample.height);
    trampleTex = new THREE.CanvasTexture(trample);
    turfMat.bumpMap = trampleTex;
    turfMat.bumpScale = wet ? 0.035 : 0.025;
    turfMat.needsUpdate = true;
  }
  const trampleStep = (m, dt) => {
    if (!trampleCtx) return;
    const g = trampleCtx;
    // fade back towards flat
    g.globalAlpha = Math.min(0.5, (dt || 0) * 1.6);
    g.fillStyle = '#808080'; g.fillRect(0, 0, trample.width, trample.height);
    g.globalAlpha = 1;
    const S = trample.width / PITCH.w;
    for (let t = 0; t < 2; t++) for (const p of m.teams[t].players) {
      if (Math.hypot(p.vx || 0, p.vy || 0) < 0.8) continue;
      g.fillStyle = 'rgba(70,70,70,.55)';
      g.beginPath(); g.ellipse(p.x * S, p.y * S, 1.6, 1.0, Math.atan2(p.dirY || 0, p.dirX || 1), 0, 7); g.fill();
    }
    if ((m.ball.z || 0) < 0.3) { g.fillStyle = 'rgba(60,60,60,.5)'; g.beginPath(); g.arc(m.ball.x * S, m.ball.y * S, 1.1, 0, 7); g.fill(); }
    trampleTex.needsUpdate = true;
  };

  const wearGrid = new Float32Array(21 * 14);
  let wearClock = 0;
  const wearCanvas = turfMap.image;
  const wearCtx = wearCanvas?.getContext ? wearCanvas.getContext('2d') : null;
  const paintWear = () => {
    if (!wearCtx) return;
    const S = wearCanvas.width / PITCH.w;
    let painted = 0;
    for (let i = 0; i < wearGrid.length; i++) {
      if (wearGrid[i] < 1.2) continue;
      const gx = (i % 21 + 0.5) * (PITCH.w / 21);
      const gy = (Math.floor(i / 21) + 0.5) * (PITCH.h / 14);
      const n = Math.min(6, Math.round(wearGrid[i]));
      for (let k = 0; k < n; k++) {
        const x = gx + (Math.random() - 0.5) * 5; const y = gy + (Math.random() - 0.5) * 5;
        const r = 0.35 + Math.random() * 0.9;
        const grad = wearCtx.createRadialGradient(x * S, y * S, 0, x * S, y * S, r * S);
        grad.addColorStop(0, wet ? 'rgba(96,78,52,.34)' : 'rgba(150,146,92,.3)');
        grad.addColorStop(1, 'rgba(150,146,92,0)');
        wearCtx.fillStyle = grad;
        wearCtx.beginPath(); wearCtx.arc(x * S, y * S, r * S, 0, 7); wearCtx.fill();
        painted++;
      }
      wearGrid[i] *= 0.35;
    }
    if (painted) turfMap.needsUpdate = true;
  };

  /* ----------------------- reflections on a wet pitch -----------------------
   * Ultra only, and only in the rain: the scene is drawn a second time from
   * the camera mirrored in the pitch plane, into a half-size target, and the
   * turf shader mixes that in where the surface is wet and the view grazes it.
   * A real planar reflection, so the floodlights, stands and players are all
   * in it — the one thing a screen-space trick cannot promise. */
  let reflect = null;
  if (ultra && wet) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
    const mirrorCam = new THREE.PerspectiveCamera();
    mirrorCam.up.set(0, 0, 1);
    const uRefl = { value: rt.texture };
    const uReflMat = { value: new THREE.Matrix4() };
    const uWet = { value: 0.16 };          // wet grass, not marble: a hint of the lights, never a mirror
    const beforeWet = turfMat.onBeforeCompile;
    turfMat.onBeforeCompile = (sh) => {
      beforeWet?.(sh);
      sh.uniforms.uRefl = uRefl; sh.uniforms.uReflMat = uReflMat; sh.uniforms.uWet = uWet;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform mat4 uReflMat; varying vec4 vReflUv; varying vec3 vWorldPos;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wp = modelMatrix * vec4(transformed, 1.0); vWorldPos = wp.xyz; vReflUv = uReflMat * wp;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D uRefl; uniform float uWet; varying vec4 vReflUv; varying vec3 vWorldPos;')
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
          {
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            float fres = pow(1.0 - clamp(viewDir.z, 0.0, 1.0), 3.0);
            vec2 ruv = vReflUv.xy / vReflUv.w;
            if (ruv.x > 0.0 && ruv.x < 1.0 && ruv.y > 0.0 && ruv.y < 1.0) {
              vec3 refl = texture2D(uRefl, ruv).rgb;
              gl_FragColor.rgb = mix(gl_FragColor.rgb, refl, clamp(fres * uWet, 0.0, 0.13));
            }
          }`);
    };
    const wetKey = `apexWetTurf-${VENUE.pattern}`;
    turfMat.customProgramCacheKey = () => wetKey;
    reflect = { rt, mirrorCam, uReflMat };
  }

  // Perimeter LED boards, touchlines only.
  //
  // The goal-end boards used to be here too, but `rotation.set(x, y, z)` applies
  // the X term last, so the Z spin only rolled the board about its own normal
  // instead of turning it to face down the pitch: at ±90° the run stood on its
  // end as an 80-unit tower behind each goal. They are gone rather than fixed —
  // the ends read better empty, and the touchline runs already carry the sponsors.
  // v78: the near run has a gap on the halfway line where the tunnel comes out
  const boards = STREET ? [] : [
    [(-10 + PITCH.w / 2 - 2) / 2, -MARGIN + 1.2, PITCH.w / 2 - 2 + 10, 0],
    [(PITCH.w / 2 + 2 + PITCH.w + 10) / 2, -MARGIN + 1.2, PITCH.w / 2 - 2 + 10, 0],
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
  /* v78: the boards animate. Every so often — and at every goal — the whole
     run switches from the sponsors to a scrolling sequence in the home
     club's colours with its short name, the way a stadium's LED ribbon does. */
  const boardMats = [];
  let ledClock = 0; let ledClub = false;
  const clubLed = (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 64;
    const g = c.getContext('2d');
    const [a, b] = [match.teams[0].colors?.[0] || '#ffffff', match.teams[0].colors?.[1] || '#111111'];
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? a : b; g.fillRect(i * 128, 0, 128, 64);
      g.fillStyle = i % 2 ? b : a; g.font = 'bold 40px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(match.teams[0].short || match.teams[0].name || 'HOME').slice(0, 4).toUpperCase(), i * 128 + 64, 34);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
    return t;
  })();

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
      boardMats.push({ mat, ads: led, reps: Math.max(1, Math.round(segLen / 10)) });
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
  /* v78: three shapes of goal. A box frame (the rear stands at three quarters
     of the bar), a deep one (a longer net hung almost at full height at the
     back — the modern stadium goal) and a stanchion goal (the back of the net
     pulled low to the ground on sloping stays — the old ground's goal). */
  const GOAL_STYLE = VENUE.goalStyle || 'box';
  const NET_DEPTH = GOAL_STYLE === 'deep' ? 2.7 : GOAL_STYLE === 'stanchion' ? 2.25 : 2.0;
  const nets = [];
  /* The frame.
   *
   * A goal is the one piece of furniture on the pitch every camera angle
   * frames, and at 6 cm of radius the posts read as wire from the halfway
   * line — thinner on screen than the paint of the six-yard box. Real posts
   * are 12 cm across, and a broadcast lens makes them look heavier than that,
   * so these are drawn heavier still: it is the silhouette people recognise.
   *
   * Behind them is a second, lighter frame — two rear uprights and a bar
   * across them — because a net with nothing to hang from is a curtain, and
   * because it is what gives the goal its depth from an angle. */
  const POST_R = 0.105;
  const REAR_R = 0.055;
  const REAR_H = GOAL_H * (GOAL_STYLE === 'deep' ? 0.94 : GOAL_STYLE === 'stanchion' ? 0.3 : 0.72);   // the back of the net stands lower than the bar
  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? -1 : 1;
    for (const sy of [-GOAL_HALF, GOAL_HALF]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(POST_R, POST_R, GOAL_H, 12), postMat);
      post.position.set(gx, CY + sy, GOAL_H / 2);
      post.rotation.x = Math.PI / 2;
      post.castShadow = true;
      scene.add(post);
      // the rear upright, and the stay that runs back to it along the ground
      const rear = new THREE.Mesh(new THREE.CylinderGeometry(REAR_R, REAR_R, REAR_H, 8), postMat);
      rear.position.set(gx + inw * NET_DEPTH, CY + sy, REAR_H / 2);
      rear.rotation.x = Math.PI / 2;
      rear.castShadow = true;
      scene.add(rear);
      const stay = new THREE.Mesh(new THREE.CylinderGeometry(REAR_R * 0.8, REAR_R * 0.8, NET_DEPTH, 6), postMat);
      stay.position.set(gx + inw * NET_DEPTH / 2, CY + sy, 0.05);
      stay.rotation.z = Math.PI / 2;
      scene.add(stay);
      // and the top rail, sloping from the crossbar back down to the rear post
      const runLen = Math.hypot(NET_DEPTH, GOAL_H - REAR_H);
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(REAR_R * 0.85, REAR_R * 0.85, runLen, 6), postMat);
      rail.position.set(gx + inw * NET_DEPTH / 2, CY + sy, (GOAL_H + REAR_H) / 2);
      rail.rotation.z = Math.PI / 2;
      rail.rotation.y = Math.atan2(GOAL_H - REAR_H, NET_DEPTH) * (inw > 0 ? 1 : -1);
      rail.castShadow = true;
      scene.add(rail);
    }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(POST_R, POST_R, GOAL_HALF * 2 + POST_R * 2, 12), postMat);
    bar.position.set(gx, CY, GOAL_H);
    bar.castShadow = true;
    scene.add(bar);
    const rearBar = new THREE.Mesh(new THREE.CylinderGeometry(REAR_R, REAR_R, GOAL_HALF * 2, 8), postMat);
    rearBar.position.set(gx + inw * NET_DEPTH, CY, REAR_H);
    rearBar.castShadow = true;
    scene.add(rearBar);

    // One cloth wrapped from the left post, across the back, to the right post.
    // Column 0 and the last column sit on the posts; the top row hangs off the
    // crossbar and the bottom row is staked to the ground — everything between
    // is free to billow.
    const COLS = potato ? 9 : quality === 'low' ? 13 : ultra ? 30 : 21;
    const ROWS = potato ? 4 : quality === 'low' ? 6 : ultra ? 13 : 9;
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
        /* The top edge is the frame, and the frame is not level: the side
           panels hang off the rail that slopes from the crossbar back to the
           rear post, and the back panel hangs off the rear bar. Below that
           the net falls to the ground with a belly in it — cord bags out, and
           a curtain pulled flat from bar to floor was most of why this looked
           like a sheet of board. */
        const back = t >= NET_DEPTH && t < NET_DEPTH + span;
        const along = back ? 1 : Math.min(1, (t < NET_DEPTH ? t : perim - t) / NET_DEPTH);
        const topZ = GOAL_H + (REAR_H - GOAL_H) * along;
        const belly = Math.sin(rt * Math.PI) * 0.16 * (back ? 1 : 0.4);
        const z = topZ * (1 - rt);
        return [x + inw * belly, y, z];
      },
      (c, r) => r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(cloth.pos, 3));
    geo.setIndex(cloth.lineIndices());
    const mesh = new THREE.LineSegments(geo, netMat);
    mesh.frustumCulled = false;
    scene.add(mesh);
    nets.push({ cloth, geo, gx, inw });

    /* The roof. There was no top on the net at all — a ball over the bar flew
       through where the netting should be and you could see the crowd through
       the goal from above. It hangs from the crossbar at the front and the
       rear bar at the back, pinned along both and down the two side rails,
       and sags between them under its own weight. */
    const rCols = COLS;
    const rRows = potato ? 3 : quality === 'low' ? 4 : ultra ? 8 : 6;
    const roof = new NetCloth(rCols, rRows,
      (c, r) => {
        const u = c / (rCols - 1);
        const v = r / (rRows - 1);
        const y = CY - GOAL_HALF + u * span;
        const x = gx + inw * NET_DEPTH * v;
        // level with the crossbar at the front, the rear bar at the back, with a sag between
        const z = GOAL_H + (REAR_H - GOAL_H) * v - Math.sin(v * Math.PI) * 0.12;
        return [x, y, z];
      },
      (c, r) => r === 0 || r === rRows - 1 || c === 0 || c === rCols - 1);
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(roof.pos, 3));
    rGeo.setIndex(roof.lineIndices());
    const rMesh = new THREE.LineSegments(rGeo, netMat);
    rMesh.frustumCulled = false;
    scene.add(rMesh);
    nets.push({ cloth: roof, geo: rGeo, gx, inw });
  }

  const SD = VENUE.depth;           // how far back the terracing runs
  const SBZ = VENUE.backZ;          // how high it climbs
  const RZ = SBZ + 4.5;             // the roof sits just above the back row

  // stands: stepped terracing rather than one flat ramp, plus roof trusses
  const standMat = new THREE.MeshStandardMaterial({ color: VENUE.facade, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(VENUE.facade).multiplyScalar(0.45), roughness: 0.85, metalness: 0.25 });
  const trussMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(VENUE.facade).multiplyScalar(1.3), roughness: 0.6, metalness: 0.5 });
  /* Two tiers: the terracing above `TIER_SPLIT` of the depth is pushed back
     and up, leaving a balcony gap, so the upper deck reads as a separate
     structure — which is what makes a big ground look big rather than merely
     tall. `terraceAt` maps a 0..1 depth fraction to its actual position and
     is shared with the seats and the crowd, so people sit where the steps are. */
  /* Three tiers (the builder's biggest bowls) are the same idea twice: two
     balconies, each pushing everything above it back and up by one gap. */
  const SPLITS = VENUE.tiers === 3 ? [0.4, 0.72] : VENUE.tiers === 2 ? [0.55] : [];
  const TIER_SPLIT = SPLITS[0] ?? 0.55;
  const TIER_GAP = SPLITS.length ? { d: 2.2, z: 3.0 } : { d: 0, z: 0 };
  // the total the whole structure grows by — what the roof, the back wall and the shell clear
  const GAP_D = TIER_GAP.d * SPLITS.length;
  const GAP_Z = TIER_GAP.z * SPLITS.length;
  const terraceAt = (t) => {
    let up = 0;
    for (const sp of SPLITS) if (t >= sp) up += 1;
    return {
      depth: MARGIN + t * SD + up * TIER_GAP.d,
      z: STAND_FRONT_Z + t * (SBZ - STAND_FRONT_Z) + up * TIER_GAP.z,
    };
  };
  /* v78: a community ground is one stand on the far side, half the length of
     the pitch, and nothing at the ends but a rail, a grass bank and the
     fence (groundDressing.js builds those). */
  const COMMUNITY = VENUE.klass === 'community';
  const COMM_LEN = 46;
  const banks = STREET ? [] : COMMUNITY
    ? [{ rot: 0, cx: PITCH.w / 2, cy: PITCH.h + MARGIN, len: COMM_LEN }]
    : [
      { rot: 0, cx: PITCH.w / 2, cy: PITCH.h + MARGIN, len: PITCH.w + 44 },
      { rot: Math.PI / 2, cx: -MARGIN, cy: CY, len: PITCH.h + 36 },
      { rot: -Math.PI / 2, cx: PITCH.w + MARGIN, cy: CY, len: PITCH.h + 36 },
    ];
  const TERRACE_ROWS = potato ? 4 : quality === 'low' ? 8 : ultra ? 22 : med ? 11 : 14;
  const RZ2 = RZ + GAP_Z;           // the roof clears the upper tier(s)
  for (const bk of banks) {
    const g = new THREE.Group();
    g.position.set(bk.cx, bk.cy, 0);
    g.rotation.z = bk.rot;

    // each row is a physical step you can see the edge of
    const stepD = SD / TERRACE_ROWS;
    const stepH = (SBZ - STAND_FRONT_Z) / TERRACE_ROWS;
    for (let r = 0; r < TERRACE_ROWS; r++) {
      const at = terraceAt((r + 0.5) / TERRACE_ROWS);
      const step = new THREE.Mesh(new THREE.BoxGeometry(bk.len, stepD, stepH + 0.5), standMat);
      step.position.set(0, at.depth - MARGIN, at.z - stepH * 0.5);
      step.receiveShadow = true;
      // v78: on High and above the stands throw their shadow across the pitch as the sun comes round
      step.castShadow = !lo && !med && atmo.time !== 'night';
      g.add(step);
    }
    for (const split of SPLITS) {
      // the balcony: a wall at the front of the upper deck, and the slab under it
      const below = terraceAt(split - 1e-4);
      const at = { depth: below.depth + TIER_GAP.d, z: below.z + TIER_GAP.z };
      const wall = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.6, TIER_GAP.z + 0.8), standMat);
      wall.position.set(0, at.depth - MARGIN + TIER_GAP.d - 0.3, at.z + TIER_GAP.z / 2 - 0.2);
      wall.castShadow = true;
      g.add(wall);
      const slab = new THREE.Mesh(new THREE.BoxGeometry(bk.len, TIER_GAP.d + 0.6, 0.5), roofMat);
      slab.position.set(0, at.depth - MARGIN + TIER_GAP.d / 2, at.z + TIER_GAP.z - 0.4);
      g.add(slab);
    }

    const front = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.5, STAND_FRONT_Z), standMat);
    front.position.set(0, 0, STAND_FRONT_Z / 2);
    front.castShadow = true;
    g.add(front);

    // The back wall always closes the ground off. The roof does not: a small
    // ground is open terracing, and seeing the sky over the far end is most of
    // what makes it read as a smaller place than the last one.
    const backH = SBZ + 1.5 + GAP_Z;
    const back = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.8, backH), roofMat);
    back.position.set(0, SD + GAP_D, backH / 2);
    back.castShadow = !lo && atmo.time !== 'night';
    g.add(back);

    if (VENUE.roof) {
      /* The roof, by style. A cantilever is a slab out over the back two
         thirds; a ring or a dome runs the full depth and, below, closes the
         corners too; an arch is a cantilever with the far stand's roof hung
         off a great bow. The dome adds a translucent inner rim that lets the
         sky through over the front rows. */
      const full = VENUE.roofStyle === 'ring' || VENUE.roofStyle === 'dome';
      const cover = full ? 0.86 : 0.68;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(bk.len, SD * cover, 0.55), roofMat);
      roof.position.set(0, SD + GAP_D - SD * cover / 2, RZ2);
      roof.castShadow = true;
      g.add(roof);
      if (VENUE.roofStyle === 'dome') {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(bk.len, SD * 0.22, 0.3),
          new THREE.MeshStandardMaterial({ color: 0xdfe8f5, roughness: 0.4, transparent: true, opacity: 0.42, side: THREE.DoubleSide }));
        rim.position.set(0, SD + GAP_D - SD * cover - SD * 0.11, RZ2 - 0.4);
        g.add(rim);
      }
      // roof trusses so the underside is not a blank slab
      if (!lo) {
        for (let i = -4; i <= 4; i++) {
          const truss = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, SD * cover, 0.45), trussMat);
          truss.position.set((bk.len / 9) * i, SD + GAP_D - SD * cover / 2, RZ2 - 0.55);
          g.add(truss);
        }
      }
      /* Lit roof rim: the pylon style of the modern bowl, a run of lamps along
         the leading edge of every roof instead of masts in the corners. */
      if (VENUE.pylons === 'rim') {
        const rimLamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d8, emissiveIntensity: LIGHT.flood > 0 ? 3 : 0.2, roughness: 0.3 });
        const n = potato ? 4 : 10;
        for (let i = 0; i < n; i++) {
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.9), rimLamp);
          lamp.position.set(-bk.len / 2 + (bk.len / n) * (i + 0.5), SD + GAP_D - SD * cover + 0.6, RZ2 - 0.7);
          g.add(lamp);
        }
      }
      if (VENUE.roofStyle === 'arch' && bk.rot === 0 && !potato) {
        // the bow over the far stand, leaning back over the roof
        const R = bk.len * 0.42;
        const arch = new THREE.Mesh(new THREE.TorusGeometry(R, 1.1, 10, 48, Math.PI),
          new THREE.MeshStandardMaterial({ color: 0xe8ecf4, roughness: 0.35, metalness: 0.6, emissive: 0xffffff, emissiveIntensity: LIGHT.flood > 0 ? 0.25 : 0.02 }));
        arch.position.set(0, SD + GAP_D - 2, RZ2 - 2);
        arch.rotation.x = Math.PI / 2 - 0.35;
        scene.add(arch);
        arch.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), bk.rot);
        arch.position.add(new THREE.Vector3(bk.cx, bk.cy, 0));
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
  if (VENUE.bowl && !COMMUNITY && !STREET) {
    const stepH = (SBZ - STAND_FRONT_Z) / TERRACE_ROWS;
    for (const [cx, cy, from] of [[0, PITCH.h, Math.PI / 2], [PITCH.w, PITCH.h, 0]]) {
      const g = new THREE.Group();
      g.position.set(cx, cy, 0);
      for (let r = 0; r < TERRACE_ROWS; r++) {
        const at = terraceAt((r + 0.5) / TERRACE_ROWS);
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(at.depth, at.depth, stepH + 0.5, 14, 1, true, from, Math.PI / 2),
          standMat);
        // CylinderGeometry stands along +Y; the world here is z-up
        ring.rotation.x = Math.PI / 2;
        ring.position.z = at.z - stepH * 0.5;
        ring.receiveShadow = true;
        g.add(ring);
      }
      // a ring or dome roof closes over the corners as well
      if (VENUE.roofStyle === 'ring' || VENUE.roofStyle === 'dome') {
        const inner = MARGIN + SD * 0.14;
        const outer = MARGIN + SD + GAP_D;
        const cap = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 14, 1, from, Math.PI / 2), roofMat);
        cap.position.z = RZ2;
        cap.material.side = THREE.DoubleSide;
        g.add(cap);
      }
      scene.add(g);
    }
  }

  /* ------------------------------ outside ------------------------------
   * What a broadcast camera sees over the far roof: the stadium's own
   * outer shell — a ring of facade blocks with lit windows behind the back
   * walls — and the town beyond it, a skyline of towers on a far ring.
   * Both are boxes: the shell is one instanced mesh, the skyline another,
   * and the silhouette is what sells it, not the detail. */
  if (!potato) {
    /* What the outside is made of. Concrete is the plain shell; glass is a
       lighter, mirror-ish skin; brick warms the colour and roughens it; mesh
       is a metal lattice, darker and shinier. */
    const FS = VENUE.facadeStyle;
    const shellColor = new THREE.Color(VENUE.facade).multiplyScalar(FS === 'glass' ? 1.5 : FS === 'mesh' ? 0.55 : 0.8);
    if (FS === 'brick') shellColor.lerp(new THREE.Color(0x8a4632), 0.55);
    if (FS === 'glass') shellColor.lerp(new THREE.Color(0x9fc4e8), 0.45);
    const shellMat = new THREE.MeshStandardMaterial({
      color: shellColor,
      roughness: FS === 'glass' ? 0.18 : FS === 'mesh' ? 0.35 : FS === 'brick' ? 1 : 0.9,
      metalness: FS === 'glass' ? 0.6 : FS === 'mesh' ? 0.8 : 0,
      envMap: FS === 'glass' || FS === 'mesh' ? scene.environment : null,
    });
    const winMat = new THREE.MeshStandardMaterial({ color: 0x1a2030, emissive: 0xffe9b0, emissiveIntensity: LIGHT.flood > 0 ? 0.9 : 0.05, roughness: 0.6 });
    const outer = MARGIN + SD + GAP_D + 2;
    const shellH = SBZ + GAP_Z + 2;
    const blocks = [];
    // three sides (the near touchline stays open for the camera)
    const sides = COMMUNITY || STREET ? [] : [
      { x0: -outer, x1: PITCH.w + outer, y: PITCH.h + outer, along: 'x' },
      { x: -outer, y0: -MARGIN, y1: PITCH.h + outer, along: 'y' },
      { x: PITCH.w + outer, y0: -MARGIN, y1: PITCH.h + outer, along: 'y' },
    ];
    const shellR = mulberry(venueSeed ^ 0x5e11);
    for (const sd of sides) {
      const len = sd.along === 'x' ? sd.x1 - sd.x0 : sd.y1 - sd.y0;
      const n = Math.max(3, Math.round(len / 9));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const h = shellH * (0.7 + shellR() * 0.45);
        const w = len / n;
        if (sd.along === 'x') blocks.push([sd.x0 + t * len, sd.y, w, 3, h]);
        else blocks.push([sd.x, sd.y0 + t * len, 3, w, h]);
      }
    }
    const shell = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), shellMat, blocks.length);
    const win = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), winMat, blocks.length);
    const d2 = new THREE.Object3D();
    blocks.forEach(([x, y, w, d, h], i) => {
      d2.position.set(x, y, h / 2); d2.scale.set(w, d, h); d2.rotation.set(0, 0, 0); d2.updateMatrix();
      shell.setMatrixAt(i, d2.matrix);
      // a band of lit glazing a little proud of the wall, two thirds of the way up
      d2.position.set(x, y, h * 0.66); d2.scale.set(w * 0.86, d + 0.3, Math.max(0.8, h * 0.12)); d2.updateMatrix();
      win.setMatrixAt(i, d2.matrix);
    });
    scene.add(shell, win);

    /* v85: the land round the ground — streets and blocks, mountains, dunes,
       the sea — built in game/landscape.js from the venue's landscape. */
    const land = buildLandscape({
      landscape: VENUE.landscape || 'city',
      keep: { x0: -outer - 4, x1: PITCH.w + outer + 4, y0: -outer - 4, y1: PITCH.h + outer + 4 },
      // the stadium's own ground (the surround): the land leaves a hole there rather than draw under it
      floor: { x0: -MARGIN - 30, x1: PITCH.w + MARGIN + 30, y0: CY - PITCH.h / 2 - MARGIN - 30, y1: CY + PITCH.h / 2 + MARGIN + 30 },
      centre: { x: PITCH.w / 2, y: CY },
      quality, night: LIGHT.flood > 0, snow: atmo.weather === 'snow' || !!atmo.frost,
      seed: venueSeed, scale: VENUE.scale ?? 0.6, community: COMMUNITY, street: STREET, fogColor: LIGHT.fog[0], skyColor: LIGHT.bg,
    });
    scene.add(land.group);
  }

  /* -------------------------------- the tifo --------------------------------
   * A banner the home end holds up at kick-off: the club's colours and its
   * initials across the lower tier of the far stand, raised for the first
   * half minute and then lowered (the match screen calls `gl.tifo(false)`,
   * or it fades on its own). Drawn on a canvas, so it is whatever the club
   * is, and never a photograph of anything. */
  let tifoMesh = null;
  if (!potato && !COMMUNITY && !STREET) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 256;
    const g = c.getContext('2d');
    const [ca, cb] = [match.teams[0].colors[0], match.teams[0].colors[1] || '#ffffff'];
    g.fillStyle = ca; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = cb;
    for (let i = 0; i < 8; i++) if (i % 2) g.fillRect((c.width / 8) * i, 0, c.width / 8, c.height);
    g.globalAlpha = 0.82; g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, c.height * 0.22, c.width, c.height * 0.56); g.globalAlpha = 1;
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 150px "Bahnschrift", "Arial Black", system-ui, sans-serif';
    g.fillText(String(match.teams[0].short || 'XI').toUpperCase(), c.width / 2, c.height / 2 + 8);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const at0 = terraceAt(0.02); const at1 = terraceAt(Math.min(0.5, TIER_SPLIT - 0.03));
    const w = PITCH.w * 0.5;
    const h = Math.hypot(at1.depth - at0.depth, at1.z - at0.z);
    tifoMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, transparent: true, opacity: 1, side: THREE.DoubleSide }));
    tifoMesh.position.set(PITCH.w / 2, PITCH.h + (at0.depth + at1.depth) / 2, (at0.z + at1.z) / 2 + 1.2);
    tifoMesh.rotation.x = Math.PI / 2 - Math.atan2(at1.z - at0.z, at1.depth - at0.depth);
    tifoMesh.visible = false;
    scene.add(tifoMesh);
  }
  let tifoT = -1;                    // seconds the tifo has been up; -1 = down

  /* Seat lettering: the builder's name for the ground, spelled out in the
     seats of the far stand's top tier the way clubs pick out their name in
     a different colour of plastic. A canvas with big block letters, laid
     flat on the terracing so the crowd sits on top of it. Unlit, so it is as
     readable under floodlights as at noon. */
  if (VENUE.lettering && !potato) {
    const c = document.createElement('canvas');
    c.width = 2048; c.height = 256;
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = VENUE.seats[1] ? '#' + VENUE.seats[1].toString(16).padStart(6, '0') : '#ffffff';
    // the two seat colours may be close; white always reads
    const [ra, ga, ba] = [VENUE.seats[0] >> 16 & 255, VENUE.seats[0] >> 8 & 255, VENUE.seats[0] & 255];
    const [rb, gb, bb] = [VENUE.seats[1] >> 16 & 255, VENUE.seats[1] >> 8 & 255, VENUE.seats[1] & 255];
    if (Math.abs(ra - rb) + Math.abs(ga - gb) + Math.abs(ba - bb) < 160) g.fillStyle = '#f4f6fa';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 190px "Bahnschrift", "Arial Black", system-ui, sans-serif';
    g.fillText(VENUE.lettering, c.width / 2, c.height / 2 + 10);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const top = SPLITS.length ? SPLITS[SPLITS.length - 1] : 0.35;
    const at0 = terraceAt(top + 0.04); const at1 = terraceAt(0.96);
    const w = PITCH.w * 0.62;
    const h = Math.hypot(at1.depth - at0.depth, at1.z - at0.z);
    const letters = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, depthWrite: false }));
    letters.position.set(PITCH.w / 2, PITCH.h + (at0.depth + at1.depth) / 2, (at0.z + at1.z) / 2 + 0.55);
    letters.rotation.x = Math.PI / 2 - Math.atan2(at1.z - at0.z, at1.depth - at0.depth);
    letters.renderOrder = 2;
    scene.add(letters);
    /* And the same name as a lit sign along the top of the far stand's back
       wall, under the roof — the seat mosaic is mostly people on a full
       night, and the sign is what you read from the far touchline. */
    const signH = 2.6;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.w * 0.5, signH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false }));
    const backTop = SBZ + 1.5 + GAP_Z;
    sign.position.set(PITCH.w / 2, PITCH.h + MARGIN + SD + GAP_D - 0.45, backTop - signH * 0.5 - 0.3);
    sign.rotation.x = Math.PI / 2;
    sign.renderOrder = 2;
    scene.add(sign);
  }

  /* ------------------------------ the wonders ------------------------------
   * The eight landmark grounds carry what the others do not: two giant
   * screens over the ends showing the score and the clock (a canvas
   * redrawn every second), an LED ribbon round the tier balcony scrolling
   * the two clubs' colours, a roof that closes over the first minute when
   * it rains (or opens when it clears), and pyrotechnics at kick-off. */
  const WONDER = !!match.venue?.stadium?.wonder;
  const screens = [];
  let ribbonTex = null;
  let roofSlabs = null;
  let roofClosed = 0;                 // 0 open .. 1 closed
  let screenClock = 0;
  if (WONDER && !potato) {
    const mk = () => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 192;
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      return { c, g: c.getContext('2d'), tex };
    };
    for (const end of [0, 1]) {
      const sc = mk();
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 9.75),
        new THREE.MeshStandardMaterial({ map: sc.tex, emissive: 0xffffff, emissiveMap: sc.tex, emissiveIntensity: 1.2, roughness: 0.6 }));
      const x = end === 0 ? -MARGIN - SD * 0.5 - GAP_D : PITCH.w + MARGIN + SD * 0.5 + GAP_D;
      mesh.position.set(x, CY, SBZ + GAP_Z + 7);
      mesh.rotation.set(Math.PI / 2, end === 0 ? Math.PI / 2 : -Math.PI / 2, 0);
      // a dark frame behind it
      const frame = new THREE.Mesh(new THREE.BoxGeometry(27.5, 11, 0.8), new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 0.6, metalness: 0.4 }));
      frame.position.copy(mesh.position); frame.rotation.copy(mesh.rotation); frame.position.x += end === 0 ? -0.5 : 0.5;
      scene.add(frame, mesh);
      screens.push(sc);
    }
    // the ribbon: a thin emissive band at the balcony on the three banks, scrolling
    {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 32;
      const g = c.getContext('2d');
      const [a, b] = match.teams.map((t) => t.colors[0]);
      for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 64, 0, 64, 32); }
      g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 20px system-ui, sans-serif'; g.textBaseline = 'middle';
      for (let i = 0; i < 4; i++) g.fillText(`${match.teams[0].name.toUpperCase()}  ·  ${match.teams[1].name.toUpperCase()}   `, i * 256 + 8, 16);
      ribbonTex = new THREE.CanvasTexture(c); ribbonTex.colorSpace = THREE.SRGBColorSpace; ribbonTex.wrapS = THREE.RepeatWrapping;
      const ribMat = new THREE.MeshStandardMaterial({ map: ribbonTex, emissive: 0xffffff, emissiveMap: ribbonTex, emissiveIntensity: 0.9, roughness: 0.6 });
      const at = terraceAt(TIER_SPLIT);
      for (const bk of banks) {
        const rib = new THREE.Mesh(new THREE.PlaneGeometry(bk.len, 0.9), ribMat.clone());
        rib.material.map = ribbonTex; rib.material.emissiveMap = ribbonTex;
        rib.material.map.repeat.set(bk.len / 40, 1);
        const g2 = new THREE.Group(); g2.position.set(bk.cx, bk.cy, 0); g2.rotation.z = bk.rot;
        rib.position.set(0, at.depth - MARGIN + TIER_GAP.d - 0.62, at.z + TIER_GAP.z + 0.3);
        rib.rotation.x = Math.PI / 2;
        g2.add(rib); scene.add(g2);
      }
    }
    // a retractable roof: two slabs that meet over the centre when closed
    if (match.venue.stadium.retractable) {
      const slabMat = new THREE.MeshStandardMaterial({ color: 0xcfd6e2, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.85 });
      const w = PITCH.w + MARGIN * 2 + 30; const d = (PITCH.h + MARGIN * 2 + 30) / 2;
      roofSlabs = [0, 1].map((i) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, 0.6), slabMat);
        m.position.set(PITCH.w / 2, i === 0 ? CY - d / 2 : CY + d / 2, RZ2 + 6);
        m.userData.home = m.position.y;
        m.userData.open = i === 0 ? CY - d * 1.5 : CY + d * 1.5;
        scene.add(m);
        return m;
      });
      roofClosed = atmo.weather === 'rain' ? 1 : 0;
    }
  }
  const paintScreens = (m) => {
    for (const sc of screens) {
      const { g, c, tex } = sc;
      g.fillStyle = '#05070e'; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '800 96px "Bahnschrift", "Arial Black", system-ui, sans-serif';
      g.fillText(`${m.teams[0].score}  -  ${m.teams[1].score}`, c.width / 2, 78);
      g.font = '700 34px system-ui, sans-serif';
      g.fillStyle = '#9fe6b3';
      g.fillText(`${m.teams[0].short}   ${m.minute()}'   ${m.teams[1].short}`, c.width / 2, 150);
      g.fillStyle = match.teams[0].colors[0]; g.fillRect(0, 0, 18, c.height);
      g.fillStyle = match.teams[1].colors[0]; g.fillRect(c.width - 18, 0, 18, c.height);
      tex.needsUpdate = true;
    }
  };
  if (screens.length) paintScreens(match);
  let pyroDone = false;

  // floodlight pylons at the corners: emissive panels plus real light
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xfff4d8, emissiveIntensity: 3.4, roughness: 0.3,
  });
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x232838, roughness: 0.7, metalness: 0.4 });
  const corners = [
    [-MARGIN - 6, -MARGIN - 6], [PITCH.w + MARGIN + 6, -MARGIN - 6],
    [-MARGIN - 6, PITCH.h + MARGIN + 6], [PITCH.w + MARGIN + 6, PITCH.h + MARGIN + 6],
  ];
  lampMat.emissiveIntensity = 3.4 * Math.max(0.05, LIGHT.flood);
  for (const [px, py] of corners) {
    /* Tall lattice pylons on an open ground, stubby masts poking over the roof
       of a covered one — which is what the two kinds of stadium actually look
       like. A lit roof rim has no masts at all. The *lights* are identical
       either way: they are the scene's main illumination at night and were
       tuned carefully, so only the mast varies; by day they are simply off. */
    if (VENUE.pylons !== 'rim' && VENUE.pylons !== 'side' && !STREET) {   // side masts are built by groundDressing.js
      const mastH = VENUE.tallPylons ? 34 : Math.max(8, 36 - RZ2);
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
    }

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
    const lamp = new THREE.SpotLight(0xfff2d6, 150 * LIGHT.flood, 320, Math.PI / 2.9, 0.95, 0.85);
    lamp.position.set(px, py, 35);
    lamp.target.position.set(PITCH.w / 2, CY, 0);
    if (LIGHT.flood > 0) scene.add(lamp, lamp.target);

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
    if (!lo && LIGHT.beams > 0) {
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
            uStrength: { value: (ultra ? 0.2 : 0.13) * LIGHT.beams * (atmo.weather === 'rain' ? 1.35 : 1) },
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
              float along = pow(max(vUv.y, 0.0), 1.9);
              /* Brightest edge-on, which is what gives a cone its soft rim.
               *
               * Clamped, and the clamp is the black-flicker fix. The
               * interpolated normal is re-normalised per pixel, and where the
               * cone faces the camera abs(dot) lands a rounding error *above*
               * one — so rim was -1e-7, and pow of a negative base is NaN in
               * GLSL. This material is additive: NaN + scene = NaN, and a NaN
               * pixel rasterises black. The failing pixels are the triangles
               * of the cone that happen to face the lens that frame — a
               * hard-edged dark wedge, on the goalmouth the beams cross,
               * gone the next frame when the rounding lands the other way.
               * Ultra saw it most because it runs the beams strongest and
               * supersamples the most pixels through the condition. */
              float rim = clamp(1.0 - abs(dot(normalize(vNormalV), vec3(0.0, 0.0, 1.0))), 0.0, 1.0);
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

  /* Night haze: a stack of three faint additive planes over the pitch, lit
     by the floodlights' colour, that the beams read *through* — the air a
     stadium at night has, rather than the vacuum a scene has. Cheap: three
     transparent quads. */
  if (LIGHT.haze && !lo) {
    const hazeMat = new THREE.MeshBasicMaterial({ color: 0x2a3550, transparent: true, opacity: atmo.weather === 'rain' ? 0.09 : 0.055, blending: THREE.AdditiveBlending, depthWrite: false });
    for (let i = 0; i < 3; i++) {
      const hz = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.w + 80, PITCH.h + 80), hazeMat);
      hz.position.set(PITCH.w / 2, CY, 6 + i * 9);
      hz.renderOrder = 1;
      scene.add(hz);
    }
  }

  // crowd — one instanced mesh, so thousands of seats cost a single draw call
  const rand = mulberry(97531);
  const crowdU = {
    uTime: { value: 0 },
    uWave: { value: -1 },        // -1: no wave running
    uJump: { value: 0 },
    uExcite: { value: 0.3 },
    uSide: { value: 0.5 },       // who scored: 0 home, 1 away — the other end sits on its hands
  };
  let waveT = -1;                // seconds into the current wave, -1 idle
  let wasGoal = false; const prevScore = [0, 0];
  let waveNext = 25 + rand() * 30;
  let jumpT = 0;
  // Ultra Low keeps *a* crowd — an empty bowl reads as broken, not as fast —
  // but a very sparse one: a few hundred figures instead of thousands.
  const rows = potato ? 3 : quality === 'low' ? 8 : ultra ? 22 : med ? 11 : 14;
  const step = potato ? 3.0 : quality === 'low' ? 1.5 : ultra ? 0.62 : med ? 1.2 : 0.95;
  const seats = [];
  const bankDefs = STREET ? [] : COMMUNITY
    ? [{ kind: 'far', from: PITCH.w / 2 - COMM_LEN / 2 + 1, to: PITCH.w / 2 + COMM_LEN / 2 - 1 }]
    : [
      { kind: 'far', from: -22, to: PITCH.w + 22 },
      { kind: 'left', from: -18, to: PITCH.h + 18 },
      { kind: 'right', from: -18, to: PITCH.h + 18 },
    ];
  const [SEAT_A, SEAT_B] = VENUE.seats;
  /* Rain puts the crowd in coats: the palette darkens and the colours thin
     out, which is a small thing that the eye reads before it reads the rain. */
  const crowdCols = atmo.weather === 'rain' ? CROWD_COLS.map((c) => (c & 0xfefefe) >> 1) : CROWD_COLS;
  /* `along` is where a seat sits on a walk round the ground, 0..1 — the left
     bank, the far bank, then the right — which is the path the wave takes. */
  /* Club colours in the stands. The home end (the middle of the far bank
     and the left side) is mostly in the home kit; the away corner (far
     right) is the away kit; everywhere else is coats and scarves. Hex
     colours are darkened a touch so a white kit is not a white wall. */
  const homeCol = new THREE.Color(hexOf(match.teams[0].colors[0])).multiplyScalar(0.85).getHex();
  const homeAlt = new THREE.Color(hexOf(match.teams[0].colors[1] || match.teams[0].colors[0])).multiplyScalar(0.85).getHex();
  const awayCol = pickAwayKit(match).clone().multiplyScalar(0.85).getHex();
  /* v78: a proper away end. On a three-sided ground the visitors have the far
     half of the right-hand end (0.72..0.86 round the walk), fenced off from
     the home fans by a few empty rows either side; at a community ground
     they are the right-hand end of the one stand. Nearly all in their colours. */
  const AWAY = COMMUNITY ? [0.6, 0.66] : [0.72, 0.86];
  const GAP = COMMUNITY ? 0.012 : 0.028;
  const inAway = (along) => along > AWAY[0] && along < AWAY[1];
  const inGap = (along) => (along > AWAY[0] - GAP && along <= AWAY[0]) || (along >= AWAY[1] && along < AWAY[1] + GAP);
  const sectionCol = (along, r) => {
    const roll = rand();
    if (inAway(along)) return roll < 0.9 ? awayCol : crowdCols[(rand() * crowdCols.length) | 0];
    // far bank centre: 0.42..0.58 along; left bank: 0..0.32; away corner: 0.64..0.7
    if (along > 0.42 && along < 0.58) return roll < 0.72 ? (roll < 0.5 ? homeCol : homeAlt) : crowdCols[(r * 7 + 3) % crowdCols.length];
    if (along < 0.32) return roll < 0.45 ? homeCol : crowdCols[(rand() * crowdCols.length) | 0];
    return roll < 0.12 ? homeCol : crowdCols[(rand() * crowdCols.length) | 0];
  };
  const put = (x, y, z, face, r, along = 0) => seats.push({
    x, y, z, face, along,
    seatCol: r % 3 === 0 ? SEAT_A : SEAT_B,          // two-tone seating bowl
    // Attendance is this ground's, not a fixed 82%. A half-empty big stadium
    // and a packed small one both happen, and both beat every ground being full.
    occupied: !inGap(along) && rand() < (inAway(along) ? Math.min(0.97, VENUE.fill + 0.12) : VENUE.fill),
    c: sectionCol(along, r),
  });

  for (const bd of bankDefs) {
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);
      const at = terraceAt(t);
      const depth = at.depth;
      const z = at.z + 0.5;
      for (let u = bd.from; u < bd.to; u += step) {
        const f = (u - bd.from) / (bd.to - bd.from);
        if (bd.kind === 'far') put(u, PITCH.h + depth, z, Math.PI, r, 0.34 + f * 0.32);
        else if (bd.kind === 'left') put(-depth, u, z, -Math.PI / 2, r, f * 0.32);
        else put(PITCH.w + depth, u, z, Math.PI / 2, r, 1 - f * 0.32);
      }
    }
  }

  /* And the people in the curved corners.
   *
   * Swept round the same quarter-circles the corner terracing follows, spaced
   * by arc length so the density matches the straight banks rather than
   * bunching up on the inside rows. `face` is the angle that turns a figure —
   * authored facing +Y — to look back at the corner's centre. */
  if (VENUE.bowl && !COMMUNITY && !STREET) {
    for (const [cx, cy, from] of [[0, PITCH.h, Math.PI / 2], [PITCH.w, PITCH.h, 0]]) {
      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        const at = terraceAt(t);
        const depth = at.depth;
        const z = at.z + 0.5;
        const span = Math.PI / 2;
        const n = Math.max(3, Math.round((span * depth) / step));
        for (let i = 0; i < n; i++) {
          const a = from + span * ((i + 0.5) / n);
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const f = (i + 0.5) / n;
          put(cx + ca * depth, cy + sa * depth, z, Math.atan2(ca, -sa), r, cx === 0 ? 0.32 + f * 0.02 : 0.66 + f * 0.02);
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
    if (!lo) {
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
    /* The crowd moves.
     *
     * Not by re-uploading thirty thousand matrices a frame: the two instanced
     * materials get a few lines of vertex shader and four uniforms. Every
     * figure sways on its own phase; a wave travels round the ground when the
     * match screen asks for one (`uWave` is where it is, 0..1 along the walk
     * round the bowl); a goal lifts everybody (`uJump`). Cost: nothing that a
     * static crowd did not already cost. */
    /* v73: every seat its own person. `aCrowd` is (phase, place round the
       bowl, section): section 1 is the home end, 0 the away corner, 0.5 the
       neutral seats. A goal is celebrated by the end that scored — each
       person rising on their own beat (`stagger`), half the seated standing
       up, the other end sitting still — and heads turn on their own slow
       phase the whole match, which is what makes a stand look inhabited
       rather than swaying like wheat. All of it is vertex math on the two
       instanced meshes; nothing is uploaded per frame. */
    const mat = (isHead = false) => {
      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = crowdU.uTime;
        sh.uniforms.uWave = crowdU.uWave;
        sh.uniforms.uJump = crowdU.uJump;
        sh.uniforms.uExcite = crowdU.uExcite;
        sh.uniforms.uSide = crowdU.uSide;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', `#include <common>
            uniform float uTime; uniform float uWave; uniform float uJump; uniform float uExcite; uniform float uSide;
            attribute vec3 aCrowd;`)
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            {
              float ph = aCrowd.x * 6.2831;
              float w = mix(aCrowd.z, 1.0 - aCrowd.z, uSide);          // does this seat care who scored
              float sway = sin(uTime * 1.6 + ph) * (0.012 + uExcite * 0.03);
              float d = abs(aCrowd.y - uWave);
              d = min(d, 1.0 - d);
              float wave = uWave < 0.0 ? 0.0 : max(0.0, 1.0 - d * 14.0);
              float stagger = smoothstep(aCrowd.x * 0.5, aCrowd.x * 0.5 + 0.25, uJump);
              float jump = uJump * w * stagger * (0.55 + 0.45 * sin(uTime * 9.0 + ph * 1.7));
              float stand = stagger * w * 0.22 * (1.0 - step(0.55, aCrowd.x));   // half the seated get up
              float lift = wave * 0.5 + jump * 0.32 + stand;
              float fidget = sin(uTime * 0.7 + ph * 3.0) * 0.006;
              transformed.x += sway + fidget;
              transformed.z += lift * (0.3 + 0.7 * step(0.0, transformed.z));
              ${isHead ? `
              // heads turn to follow play, each on its own slow clock
              float turn = sin(uTime * 0.45 + ph * 2.3) * 0.28 * (0.6 + uExcite * 0.8);
              float cs = cos(turn), sn = sin(turn);
              transformed.xy = vec2(transformed.x * cs - transformed.y * sn, transformed.x * sn + transformed.y * cs);` : ''}
            }`);
      };
      m.customProgramCacheKey = () => (isHead ? 'apexCrowdHead' : 'apexCrowdAnim');
      return m;
    };
    const bodies = new THREE.InstancedMesh(bodyGeo, mat(false), taken.length);
    const heads = new THREE.InstancedMesh(headGeo, mat(true), taken.length);
    bodies.castShadow = false;      // a stand casting shadows onto itself is invisible and not free
    heads.castShadow = false;
    const crowdAttr = new Float32Array(taken.length * 3);
    const sectionOf = (along) => (inAway(along) ? 0 : (along > 0.42 && along < 0.58) || along < 0.32 ? 1 : 0.5);
    taken.forEach((s, i) => { crowdAttr[i * 3] = rand(); crowdAttr[i * 3 + 1] = s.along || 0; crowdAttr[i * 3 + 2] = sectionOf(s.along || 0); });
    const crowdBuf = new THREE.InstancedBufferAttribute(crowdAttr, 3);
    bodyGeo.setAttribute('aCrowd', crowdBuf);
    headGeo.setAttribute('aCrowd', crowdBuf);

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

    /* Ultra: arms. A third instanced mesh — two raised forearms — on a third
       of the crowd, waving on their own phase and thrown up on a goal. The
       same crowd uniforms drive it, with an extra term so the arms swing
       further than the body sways; at Ultra the stand is thirty thousand
       individually moving people, not a texture. */
    if (ultra) {
      const armGeo = mergeBoxes([box(0.08, 0.08, 0.34, -0.2, 0.02, 0.62), box(0.08, 0.08, 0.34, 0.2, 0.02, 0.62)]);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
      armMat.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = crowdU.uTime; sh.uniforms.uWave = crowdU.uWave; sh.uniforms.uJump = crowdU.uJump; sh.uniforms.uExcite = crowdU.uExcite; sh.uniforms.uSide = crowdU.uSide;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', `#include <common>
            uniform float uTime; uniform float uWave; uniform float uJump; uniform float uExcite; uniform float uSide; attribute vec3 aCrowd;`)
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            {
              float ph = aCrowd.x * 6.2831;
              float w = mix(aCrowd.z, 1.0 - aCrowd.z, uSide);
              float d = abs(aCrowd.y - uWave); d = min(d, 1.0 - d);
              float wave = uWave < 0.0 ? 0.0 : max(0.0, 1.0 - d * 14.0);
              float up = clamp(uJump * 1.3 * w + wave + uExcite * 0.4, 0.0, 1.0);
              float sway = sin(uTime * 3.2 + ph) * 0.12 * up;
              // hinge at the elbow height: the hand end swings, the elbow stays
              float hand = smoothstep(0.5, 0.8, position.z);
              transformed.x += sway * hand;
              transformed.z += (up * 0.3 + uJump * 0.32) * hand + uJump * 0.32 * (1.0 - hand);
              transformed.z -= (1.0 - up) * 0.25 * hand;   // arms down when nothing is happening
            }`);
      };
      armMat.customProgramCacheKey = () => 'apexCrowdArms';
      const armed = taken.filter((_, i) => i % 3 === 0);
      const arms = new THREE.InstancedMesh(armGeo, armMat, armed.length);
      const armAttr = new Float32Array(armed.length * 3);
      const indexOf = new Map(taken.map((s, i) => [s, i]));
      armed.forEach((s, i) => {
        const j = indexOf.get(s);
        bodies.getMatrixAt(j, dummy.matrix);
        arms.setMatrixAt(i, dummy.matrix);
        arms.setColorAt(i, skinTone.setHex(SKINS[(rand() * SKINS.length) | 0]));
        armAttr[i * 3] = crowdAttr[j * 3]; armAttr[i * 3 + 1] = crowdAttr[j * 3 + 1]; armAttr[i * 3 + 2] = crowdAttr[j * 3 + 2];
      });
      armGeo.setAttribute('aCrowd', new THREE.InstancedBufferAttribute(armAttr, 3));
      arms.instanceMatrix.needsUpdate = true;
      arms.castShadow = false;
      scene.add(arms);
    }
  }

  // players
  const kitHome = new THREE.Color(hexOf(match.teams[0].colors[0]));
  const kitAway = pickAwayKit(match);
  const rigs = new Map();
  /* One player's figure. Built again when a substitute takes the slot: the
     look (skin, hair, build) and the name on the shirt are baked in, and the
     man coming on used to run out as the man he replaced. */
  const simpleRig = (p, t, shirtNo) => {
    const isGK = p.role === 'GK';
    const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
    const shorts = base.clone().multiplyScalar(0.6);
    // same look the card portrait uses, so a player on the pitch matches his card
    const look = faceOf(p.ref);
    const rig = buildPlayer(
      base, shorts,
      new THREE.Color(look.skin), new THREE.Color(look.hair),
      base.clone().multiplyScalar(0.8),
      buildFor(p.ref, p.role), { face: !lo && !med });
    /* The number and the name on the back — on every tier but Ultra Low,
       where a texture per shirt is twenty-two textures too many. */
    if (!potato) {
      const no = p.ref?.number || (isGK ? 1 : shirtNo + 1);
      const surname = String(p.ref?.name || p.ref?.short || '').split(' ').pop().toUpperCase();
      rig.parts.torso.material = new THREE.MeshStandardMaterial({
        map: kitTexture(base, no, surname, lo ? 128 : 256), roughness: 0.62, metalness: 0.02,
      });
      /* Cloth, on High and Ultra: the shirt's hem and back ripple with the
         player's speed — a few sine terms in the vertex shader on the
         lower half of the torso, driven by a per-player speed uniform. */
      if (!lo && !med) {
        const uSpeed = { value: 0 };
        const mat = rig.parts.torso.material;
        mat.onBeforeCompile = (sh) => {
          sh.uniforms.uTime = crowdU.uTime; sh.uniforms.uSpeed = uSpeed;
          sh.vertexShader = sh.vertexShader
            .replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uSpeed;')
            .replace('#include <begin_vertex>', `#include <begin_vertex>
              {
                float hem = smoothstep(0.55, -0.5, position.y);       // 1 at the hem, 0 at the shoulders
                float w = sin(uTime * 14.0 + position.x * 6.0) * 0.35 + sin(uTime * 9.0 + position.z * 8.0) * 0.25;
                float amp = (0.02 + uSpeed * 0.035) * hem;
                transformed += normalize(vec3(position.x, 0.0, position.z)) * (w * amp);
              }`);
        };
        mat.customProgramCacheKey = () => 'apexClothKit';
        rig.cloth = uSpeed;
      }
    }
    rig.refId = p.ref?.id; rig.shirtNo = shirtNo;
    return rig;
  };
  for (let t = 0; t < 2; t++) {
    let shirtNo = 1;
    for (const p of match.teams[t].players) {
      const rig = simpleRig(p, t, shirtNo);
      shirtNo++;
      scene.add(rig.grp);
      rigs.set(p, rig);
    }
  }

  /* ------------------------- flags and scarves (v78) -------------------------
   * Flags on poles waving over the home end and the away block, in each
   * side's colours; and scarves held up over heads before kick-off and
   * through a goal (the renderer's `uScarf`, driven from the match phase).
   * Two instanced meshes, all motion in the vertex shader. */
  const scarfU = { value: 0 };
  if (!lo && !potato && taken.length) {
    const nFlags = ultra ? 70 : med ? 26 : 44;
    const flagGeo = new THREE.PlaneGeometry(1.3, 0.85, 6, 1).rotateX(Math.PI / 2).translate(0.65, 0, 2.45);
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.9, 4).rotateX(Math.PI / 2).translate(0, 0, 1.45);
    const waveMat = (extra = '') => {
      const mt = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, side: THREE.DoubleSide });
      mt.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = crowdU.uTime; sh.uniforms.uScarf = scarfU;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uScarf;')
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            ${extra}`);
      };
      return mt;
    };
    const flags = new THREE.InstancedMesh(flagGeo, waveMat(`{
              float ph = float(gl_InstanceID) * 1.7;
              float along = transformed.x / 1.3;
              transformed.y += sin(uTime * 4.0 - along * 5.0 + ph) * 0.18 * along;
              transformed.x += sin(uTime * 0.8 + ph) * 0.25 * along;       // swung by the arm below
            }`), nFlags);
    const poles = new THREE.InstancedMesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 }), nFlags);
    const pool = taken.filter((st) => inAway(st.along || 0) || (st.along > 0.42 && st.along < 0.58) || st.along < 0.3);
    const d = new THREE.Object3D(); const c = new THREE.Color();
    for (let i = 0; i < nFlags; i++) {
      const st = pool[Math.floor(rand() * pool.length)] || taken[0];
      const away = inAway(st.along || 0);
      const cols = away ? [awayCol, awayCol] : [homeCol, homeAlt];
      d.position.set(st.x, st.y, st.z - 0.3); d.rotation.set(0, 0, (st.face || 0) + (rand() - 0.5) * 0.8); d.scale.setScalar(0.9 + rand() * 0.3); d.updateMatrix();
      flags.setMatrixAt(i, d.matrix); poles.setMatrixAt(i, d.matrix);
      flags.setColorAt(i, c.setHex(cols[i % 2]));
    }
    scene.add(flags, poles);
    // scarves: a quarter of the ends, held up at arm's length
    const nScarf = Math.min(taken.length, ultra ? 3000 : 1200);
    const scarfGeo = new THREE.BoxGeometry(1.1, 0.03, 0.17).translate(0, 0.05, 0);
    const scarves = new THREE.InstancedMesh(scarfGeo, waveMat(`{
              float ph = float(gl_InstanceID) * 2.3;
              transformed *= uScarf;
              transformed.z += 0.95 + 0.4 * uScarf + sin(uTime * 3.0 + ph) * 0.04;
              transformed.x += sin(uTime * 2.2 + ph + transformed.x) * 0.03;
            }`), nScarf);
    const ends = taken.filter((st) => inAway(st.along || 0) || st.along < 0.3 || (st.along > 0.42 && st.along < 0.58));
    for (let i = 0; i < nScarf; i++) {
      const st = ends[Math.floor(rand() * ends.length)] || taken[0];
      const away = inAway(st.along || 0);
      d.position.set(st.x, st.y, st.z - 0.34); d.rotation.set(0, 0, st.face || 0); d.scale.setScalar(1); d.updateMatrix();
      scarves.setMatrixAt(i, d.matrix);
      scarves.setColorAt(i, c.setHex(away ? awayCol : (i % 3 ? homeCol : homeAlt)));
    }
    scarves.frustumCulled = false;
    scene.add(scarves);
  }

  /* ---------------------------- round the pitch ----------------------------
   * v78: flags, dugouts, the tunnel, the people who work the match, fences and
   * banks at the small grounds, side masts, the suburbs, puddles, snow, the
   * half-time groundstaff and sprinklers, and flares. groundDressing.js. */
  const dressing = STREET ? dressStreet({ scene, VENUE, atmo, lo }) : dressGround({
    scene, VENUE, match, atmo, LIGHT, lo, potato, ultra, surfaceAt, MARGIN, SD, GAP_D, rand: mulberry(venueSeed ^ 0xd7e55),
  });
  {
    // flares are lit in the away block and in the heart of the home end
    const spots = [];
    const pick = (test, n) => { const pool = taken.filter((st) => test(st.along || 0)); for (let i = 0; i < n && pool.length; i++) { const st = pool[(i * 7919) % pool.length]; spots.push([st.x, st.y, st.z]); } };
    pick(inAway, 4);
    pick((a) => a > 0.46 && a < 0.54, 3);
    dressing.setFlareSpots(spots);
  }

  /* --------------------------- the manager --------------------------- *
   * Manager Career puts a figure in the technical area: the same simple rig
   * as the players, dressed in a suit (trouser-coloured shorts and socks,
   * jacket-coloured shirt), posed by the match screen through
   * `match.managerFig` — position, facing, walk phase and a pose name. The
   * player pose function already knows how to stand, stride and raise both
   * arms, which covers idle, prowling the touchline and celebrating; that is
   * the honest extent of V1's acting range. */
  let mgrRig = null;
  if (match.managerFig) {
    const look = match.managerLook?.look || {};
    const suit = new THREE.Color(look.suit || '#1c222e');
    mgrRig = buildPlayer(
      suit, suit.clone().multiplyScalar(0.92),
      new THREE.Color(look.skin || '#e9bd95'), new THREE.Color(look.hair || '#3a2a1a'),
      suit.clone().multiplyScalar(0.85),
      { height: (match.managerLook?.height || 182) / 183, girth: 1.06, shoulders: 1.05 });
    // a suit, not a kit: trousers to the ankle, so the bare thighs and the
    // sock-shins the player rig assumes are all suit fabric here
    const trouser = new THREE.MeshStandardMaterial({ color: suit.clone().multiplyScalar(0.9), roughness: 0.8 });
    for (const part of ['thighL', 'thighR', 'shinL', 'shinR', 'kneeL', 'kneeR',
      'armL', 'armR', 'foreL', 'foreR']) {
      if (mgrRig.parts[part]) mgrRig.parts[part].material = trouser;
    }
    scene.add(mgrRig.grp);
  }
  const mgrProxy = { x: 0, y: 0, vx: 0, vy: 0, dirX: 1, dirY: 0, celebrating: false, stumble: 0, holdT: 0 };

  /* v112: the referee (game/referee.js) — moved by the renderer from what the
     match already knows, never by the simulation. All in black; the built
     figure on Low/Medium, the model once it has loaded on High/Ultra. Not on
     the street, where nobody referees anything. */
  const refState = STREET ? null : createReferee(match);
  const REF_KIT = '#151515';
  let refRig = null; let refModel = null;
  if (refState) {
    const k = new THREE.Color(REF_KIT);
    refRig = buildPlayer(k, k.clone(), new THREE.Color('#c99a74'), new THREE.Color('#1d140d'), k.clone(), { height: 1.01, girth: 1, shoulders: 1 });
    scene.add(refRig.grp);
  }
  const refCard = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.105),
    new THREE.MeshBasicMaterial({ color: 0xffd21f, side: THREE.DoubleSide, toneMapped: false }));
  refCard.visible = false; scene.add(refCard);
  const _hand = new THREE.Vector3();

  /* A supplied manager model replaces the built figure.
   *
   * Drop a glTF binary at assets/manager.glb (checked in, or hosted next to
   * the game) and it is loaded here, scaled to ~1.85m, tipped from the usual
   * y-up into the match's z-up, and stood where the built figure stands. Its
   * first animation clip loops as the idle. Absence is the normal state — the
   * load failing is silent and the suit rig carries on. */
  let mgrModel = null;
  let mgrMixer = null;
  let mgrActions = null;      // clip name -> AnimationAction
  let mgrClip = '';           // the clip currently playing
  if (match.managerFig) {
    new GLTFLoader().load(new URL('../../assets/manager.glb', import.meta.url).href, (gltf) => {
      /* Scale by measurement, not by faith: exporters disagree about units and
       * about node scales baked into the armature, so the model is added, its
       * real world height measured, and the correction applied — twice, since
       * the first fix changes what the second measures. Ends at 1.85m of
       * manager whatever the file thought a metre was. */
      // a model whose textures did not arrive is a white ghost (v73's CSP bug): keep the suit rig instead
      let textured = true;
      gltf.scene.traverse((n) => { if (n.isMesh) { const ms = Array.isArray(n.material) ? n.material : [n.material]; if (ms.some((mm) => mm && !mm.map && mm.color && mm.color.getHex() === 0xffffff)) textured = false; } });
      if (!textured) return;
      const holder = new THREE.Group();
      gltf.scene.rotation.x = Math.PI / 2;              // y-up asset, z-up world
      gltf.scene.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.frustumCulled = false; } });
      holder.add(gltf.scene);
      const bounds = new THREE.Box3();
      for (let pass = 0; pass < 2; pass++) {
        holder.updateMatrixWorld(true);
        bounds.setFromObject(holder);
        const h = Math.max(0.01, bounds.max.z - bounds.min.z);
        gltf.scene.scale.multiplyScalar(1.85 / h);
      }
      holder.updateMatrixWorld(true);
      bounds.setFromObject(holder);
      gltf.scene.position.z = -bounds.min.z;            // feet on the turf
      scene.add(holder);
      mgrModel = holder;
      if (gltf.animations?.length) {
        mgrMixer = new THREE.AnimationMixer(gltf.scene);
        mgrActions = new Map();
        for (const clip of gltf.animations) mgrActions.set(clip.name, mgrMixer.clipAction(clip));
        // the acting range shipped with the model: idle/walk/run/shout/celebrate/stomp
        (mgrActions.get('idle') || gltf.animations[0] && mgrMixer.clipAction(gltf.animations[0])).play();
        mgrClip = mgrActions.has('idle') ? 'idle' : (gltf.animations[0]?.name || '');
      }
      if (mgrRig) { scene.remove(mgrRig.grp); mgrRig = null; }
    }, undefined, () => { /* no model supplied — the suit rig stands in */ });
  }
  /** Crossfade the manager model to a clip, with graceful fallbacks. */
  const mgrPlay = (want) => {
    if (!mgrActions) return;
    const name = mgrActions.has(want) ? want : mgrActions.has('idle') ? 'idle' : mgrClip;
    if (name === mgrClip || !name) return;
    const from = mgrActions.get(mgrClip);
    const to = mgrActions.get(name);
    to.reset().play();
    if (from) from.crossFadeTo(to, 0.28, false);
    mgrClip = name;
  };

  /* ------------------------- scanned players ------------------------- *
   * The built-in figures above are always built, and stay in place until the
   * model has actually arrived: a 14 MB download must never be the reason a
   * kick-off waits. When it lands the two sets swap over, and if it fails —
   * offline, or the file missing — nothing happens and the match carries on
   * looking exactly as it did.                                               */
  const modelRigs = new Map();
  let loadedModel = null;
  const modelRig = (p, t, index) => {
    const isGK = p.role === 'GK';
    const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
    const rig = makeRig(loadedModel, {
      kit: {
        shirt: base,
        shorts: base.clone().multiplyScalar(0.62),
        socks: base.clone().multiplyScalar(0.82),
      },
      ref: p.ref,
      index,
      isGK,
    });
    rig.refId = p.ref?.id; rig.index = index;
    return rig;
  };
  let useModels = false;
  /* Resolves once there is nothing left that would visibly change the picture.
   * The loading screen waits on this, which is the whole reason it exists: the
   * match used to start on the built-in figures and swap to the scanned ones
   * mid-play, so the first ten seconds looked like a different, worse game. */
  let markReady;
  // v87: real progress for the loading bar — scene built, models in, shaders compiled
  let progress = 0.35;
  const ready = new Promise((res) => { markReady = () => { progress = 1; res(); }; });

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
    progress = Math.max(progress, 0.7);
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
      loadedModel = model;
      let index = 0;
      for (let t = 0; t < 2; t++) {
        for (const p of match.teams[t].players) {
          const rig = modelRig(p, t, index++);
          scene.add(rig.root);
          modelRigs.set(p, rig);
        }
      }
      if (refState) {
        const k = new THREE.Color(REF_KIT);
        refModel = makeRig(model, { kit: { shirt: k, shorts: k.clone(), socks: k.clone() }, ref: refState.ref, index: 23, isGK: false });
        scene.add(refModel.root);
        refModel.hand = refModel.figure.getObjectByName('mixamorigRightHand') || refModel.figure.getObjectByName('mixamorig5RightHand');
      }
      // hide the built-in figures rather than destroying them, so quality can
      // be turned back down mid-match without rebuilding anything
      for (const rig of rigs.values()) rig.grp.visible = false;
      if (refRig) refRig.grp.visible = false;
      useModels = true;
      // compiled after the rigs are in the scene, so their programs are
      // included rather than being built on the first frame of play
      warmUp();
    }).catch(() => warmUp());
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 18),
    new THREE.MeshStandardMaterial({ map: ballTexture(snow), roughness: 0.55, metalness: 0.02 }));
  ball.castShadow = true;
  scene.add(ball);

  // one marker per seat — P1 white, P2 amber, P3 cyan, P4 pink (v91: four at one screen)
  const MARKER_COLS = [0xffffff, 0xffc63d, 0x3fd8ff, 0xff5fa8];
  const markers = MARKER_COLS.map((col) => {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.55, 4),
      new THREE.MeshBasicMaterial({ color: col }));
    m.rotation.x = Math.PI;
    m.visible = false;
    scene.add(m);
    return m;
  });

  /* v109: the set-piece aim guide (sim.setPieceGuide). A ground arrow along
     the stick, in the colour of the button being held, and — when the kick
     can be a shot — a band in the goal mouth as wide as the strike can stray
     at the power held so far, with a line where it is aimed. */
  const GUIDE_COL = { pass: 0x3ea8ff, through: 0xffc02e, cross: 0xff8b3d, shoot: 0xff4d4d };
  const guideMat = (op) => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false });
  const guide = new THREE.Group(); guide.visible = false; scene.add(guide);
  const shaftGeo = new THREE.PlaneGeometry(1, 0.42); shaftGeo.translate(0.5, 0, 0);
  const shaft = new THREE.Mesh(shaftGeo, guideMat(0.8)); guide.add(shaft);
  const tipShape = new THREE.Shape(); tipShape.moveTo(0, -0.8); tipShape.lineTo(1.5, 0); tipShape.lineTo(0, 0.8); tipShape.lineTo(0, -0.8);
  const tip = new THREE.Mesh(new THREE.ShapeGeometry(tipShape), guideMat(0.9)); guide.add(tip);
  const bandGeo = new THREE.PlaneGeometry(1, 1); bandGeo.rotateY(Math.PI / 2);   // spans y (width) and z (height)
  const band = new THREE.Mesh(bandGeo, guideMat(0.34)); band.visible = false; scene.add(band);
  const aimLine = new THREE.Mesh(bandGeo, guideMat(0.95)); aimLine.visible = false; scene.add(aimLine);

  /* ------------------------------- rain -------------------------------
   * Streaks, not drops: at broadcast distance rain is a field of short
   * falling lines catching the floodlights. One LineSegments mesh, every
   * streak wrapped through a box that follows the camera's target, moved by
   * a single time uniform — so it costs one draw call and no CPU. Ultra Low
   * has no rain; the wet pitch and the grey sky carry the weather there. */
  let rainMesh = null;
  const rainU = { uTime: { value: 0 }, uCentre: { value: new THREE.Vector3(PITCH.w / 2, CY, 0) } };
  /* The weather can turn. `match.venue.atmo.change` (set by the match
     screen from the fixture's seed) names a minute and a target — rain
     arriving over a dry second half, or clearing — and the renderer lerps
     the rain's density, the turf's wet sheen and the fog over half a minute
     of match time. The sky and the lights stay: a shower does not change the
     hour. The rain mesh is always built when a change is possible. */
  const weatherChange = atmo.change || null;
  const rainPossible = atmo.weather === 'rain' || weatherChange?.to === 'rain';
  let rainLevel = atmo.weather === 'rain' ? 1 : 0;      // 0..1 how hard it is raining now
  if (rainPossible && !potato) {
    const N = ultra ? 7000 : quality === 'low' ? 1200 : med ? 2600 : 4200;
    const pos = new Float32Array(N * 2 * 3);
    const seed = new Float32Array(N * 2);
    const rr = mulberry(4242);
    for (let i = 0; i < N; i++) {
      const x = rr(), y = rr(), z = rr(), sp = 0.7 + rr() * 0.6;
      for (let e = 0; e < 2; e++) {
        pos[(i * 2 + e) * 3] = x; pos[(i * 2 + e) * 3 + 1] = y; pos[(i * 2 + e) * 3 + 2] = z + e * 0.02;
        seed[i * 2 + e] = sp;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(seed, 1));
    rainMesh = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...rainU, uAlpha: { value: (0.09 + atmo.intensity * 0.14) * rainLevel } },
      vertexShader: `
        uniform float uTime; uniform vec3 uCentre; attribute float aSpeed; varying float vA;
        void main() {
          // a 70 x 70 x 34 m box of rain over the target, wrapped in every axis
          vec3 p = position;
          float fall = fract(p.z - uTime * aSpeed * 0.8);
          vec3 w = vec3((p.x - 0.5) * 70.0, (p.y - 0.5) * 70.0, fall * 34.0) + vec3(uCentre.xy, 0.0);
          // a little wind, and the streak leans with it
          w.x += fall * 3.0;
          vA = smoothstep(0.0, 0.08, fall) * (1.0 - smoothstep(0.9, 1.0, fall));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(w, 1.0);
        }`,
      fragmentShader: `
        uniform float uAlpha; varying float vA;
        void main() { gl_FragColor = vec4(0.78, 0.85, 0.95, uAlpha * vA); }`,
    }));
    rainMesh.frustumCulled = false;
    rainMesh.renderOrder = 3;
    rainMesh.visible = rainLevel > 0;
    scene.add(rainMesh);
  }
  const dryRough = 0.9; const wetRough = 0.8;
  const dryEnv = 0.35; const wetEnv = 0.45;
  const weatherStep = (m, dt) => {
    if (!weatherChange) return;
    const minute = m.minute?.() ?? 0;
    const target = minute >= weatherChange.minute ? (weatherChange.to === 'rain' ? 1 : 0) : (atmo.weather === 'rain' ? 1 : 0);
    if (Math.abs(target - rainLevel) < 0.001) return;
    rainLevel += Math.sign(target - rainLevel) * Math.min(Math.abs(target - rainLevel), (dt || 0) / 30);
    if (rainMesh) { rainMesh.visible = rainLevel > 0.01; rainMesh.material.uniforms.uAlpha.value = (0.09 + atmo.intensity * 0.14) * rainLevel; }
    turfMat.roughness = dryRough + (wetRough - dryRough) * rainLevel;
    turfMat.envMapIntensity = dryEnv + (wetEnv - dryEnv) * rainLevel;
    if (scene.fog) scene.fog.density = LIGHT.fog[1] * (1 + rainLevel * 0.4);
  };

  /* ------------------------- fireworks and confetti -------------------------
   * For finals and trophies. One Points cloud for the shells and their
   * sparks, one for confetti, both driven by attributes the CPU updates for
   * a few hundred particles — cheap, and only alive while a show is on. */
  const FX_N = potato ? 0 : ultra ? 1400 : 700;
  const fx = { pos: new Float32Array(FX_N * 3), vel: new Float32Array(FX_N * 3), life: new Float32Array(FX_N), col: new Float32Array(FX_N * 3), kind: new Uint8Array(FX_N), alive: 0, show: 0, nextShell: 0 };
  let fxPoints = null;
  if (FX_N) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(fx.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(fx.col, 3));
    geo.setAttribute('aLife', new THREE.BufferAttribute(fx.life, 1));
    fxPoints = new THREE.Points(geo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      uniforms: { uScale: { value: 1 } },
      vertexShader: `attribute float aLife; varying vec3 vC; varying float vL; uniform float uScale;
        void main() { vC = color; vL = aLife; vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (aLife > 0.0 ? (2.0 + 6.0 * min(1.0, aLife)) : 0.0) * uScale * 300.0 / max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; varying float vL;
        void main() { vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.1, length(d)); gl_FragColor = vec4(vC, a * min(1.0, vL)); }`,
    }));
    fxPoints.frustumCulled = false;
    fxPoints.visible = false;
    scene.add(fxPoints);
  }
  const fxSpawn = (x, y, z, vx, vy, vz, r, g, b, life, kind) => {
    if (fx.alive >= FX_N) return;
    // reuse the first dead slot
    let i = -1;
    for (let k = 0; k < FX_N; k++) if (fx.life[k] <= 0) { i = k; break; }
    if (i < 0) return;
    fx.pos[i * 3] = x; fx.pos[i * 3 + 1] = y; fx.pos[i * 3 + 2] = z;
    fx.vel[i * 3] = vx; fx.vel[i * 3 + 1] = vy; fx.vel[i * 3 + 2] = vz;
    fx.col[i * 3] = r; fx.col[i * 3 + 1] = g; fx.col[i * 3 + 2] = b;
    fx.life[i] = life; fx.kind[i] = kind; fx.alive++;
  };
  const fxBurst = (x, y, z) => {
    const hue = Math.random();
    const c = new THREE.Color().setHSL(hue, 0.9, 0.6);
    const n = ultra ? 90 : 50;
    for (let k = 0; k < n; k++) {
      const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1); const sp = 9 + Math.random() * 7;
      fxSpawn(x, y, z, Math.sin(ph) * Math.cos(th) * sp, Math.sin(ph) * Math.sin(th) * sp, Math.cos(ph) * sp, c.r, c.g, c.b, 1.4 + Math.random() * 0.8, 1);
    }
  };
  const fxStep = (dt) => {
    if (!fxPoints) return;
    if (fx.show > 0) {
      fx.show -= dt;
      fx.nextShell -= dt;
      if (fx.nextShell <= 0) {
        fx.nextShell = 0.35 + Math.random() * 0.5;
        const x = 10 + Math.random() * (PITCH.w - 20); const y = PITCH.h + 10 + Math.random() * 20;
        // a rising shell that bursts near the top
        fxSpawn(x, y, 8, 0, 0, 26 + Math.random() * 8, 1, 0.9, 0.6, 1.1 + Math.random() * 0.3, 2);
        // confetti over the pitch
        for (let k = 0; k < (ultra ? 10 : 5); k++) {
          const c = new THREE.Color().setHSL(Math.random(), 0.85, 0.6);
          fxSpawn(20 + Math.random() * (PITCH.w - 40), 10 + Math.random() * (PITCH.h - 20), 22 + Math.random() * 6, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, -1, c.r, c.g, c.b, 6 + Math.random() * 4, 3);
        }
      }
    }
    let alive = 0;
    for (let i = 0; i < FX_N; i++) {
      if (fx.life[i] <= 0) continue;
      const k = fx.kind[i];
      fx.life[i] -= dt * (k === 3 ? 0.35 : 1);
      if (k === 2 && fx.life[i] <= 0.15) { fxBurst(fx.pos[i * 3], fx.pos[i * 3 + 1], fx.pos[i * 3 + 2]); fx.life[i] = 0; fx.alive--; continue; }
      const drag = k === 3 ? 0.9 : k === 4 ? 0.9 : 0.985;
      fx.vel[i * 3] *= drag; fx.vel[i * 3 + 1] *= drag;
      fx.vel[i * 3 + 2] = k === 3 ? -1.4 + Math.sin(fx.life[i] * 7 + i) * 0.6 : fx.vel[i * 3 + 2] * drag - 9.8 * dt * (k === 1 ? 0.6 : k === 4 ? 0.9 : 0.2);
      if (k === 3) { fx.vel[i * 3] += Math.sin(fx.life[i] * 5 + i) * 0.4 * dt; }
      fx.pos[i * 3] += fx.vel[i * 3] * dt; fx.pos[i * 3 + 1] += fx.vel[i * 3 + 1] * dt; fx.pos[i * 3 + 2] += fx.vel[i * 3 + 2] * dt;
      if (fx.pos[i * 3 + 2] < 0.05) { fx.life[i] = 0; fx.alive--; continue; }
      alive++;
    }
    fx.alive = alive;
    fxPoints.visible = alive > 0;
    if (alive) {
      fxPoints.geometry.attributes.position.needsUpdate = true;
      fxPoints.geometry.attributes.color.needsUpdate = true;
      fxPoints.geometry.attributes.aLife.needsUpdate = true;
    }
  };

  /* ------------------------- dust and splash ----------------------------
   * Sprinting boots kick up dust on a dry pitch and splash on a wet one; the
   * ball throws a spray when it lands in the rain. The same pool as the
   * fireworks (kind 4), so it costs nothing extra to draw. */
  const bootFx = (m, dt) => {
    if (!FX_N || potato || lo) return;
    for (let t = 0; t < 2; t++) for (const p of m.teams[t].players) {
      const sp = Math.hypot(p.vx || 0, p.vy || 0);
      if (sp < 5.2 || Math.random() > dt * 9) continue;
      const c = wet ? [0.75, 0.82, 0.92] : [0.62, 0.56, 0.42];
      fxSpawn(p.x - (p.dirX || 0) * 0.3, p.y - (p.dirY || 0) * 0.3, 0.05, (Math.random() - 0.5) * 0.8 - (p.dirX || 0) * 1.2, (Math.random() - 0.5) * 0.8 - (p.dirY || 0) * 1.2, 0.6 + Math.random() * (wet ? 1.4 : 0.8), c[0], c[1], c[2], wet ? 0.35 : 0.6, 4);
    }
    if (wet && (m.ball.z || 0) < 0.25 && Math.hypot(m.ball.vx || 0, m.ball.vy || 0) > 4 && Math.random() < dt * 20) {
      for (let k = 0; k < 3; k++) fxSpawn(m.ball.x, m.ball.y, 0.1, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 1 + Math.random() * 1.5, 0.8, 0.86, 0.95, 0.35, 4);
    }
  };

  const fine = !lo;
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
  let afterimage = null;
  let godrays = null;
  if (!lo) {
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
      samples: ultra ? 12 : med ? 5 : 8,
      ao: ultra ? 1.05 : med ? 0.75 : 0.9,
      aoRadius: 0.6,
      dof: ultra ? 0.85 : 0,
      grain: 0.03,
      vignette: 0.5,
      aberration: ultra ? 0.7 : 0.4,
    });
    cine.setGrade(LIGHT.grade || {});
    composer.addPass(cine);

    /* God rays at dusk: the low sun behind the far stand throws shafts
       through the roof structure. A screen-space radial blur of the bright
       pixels towards the sun's projected position, added back at low
       strength — the classic technique, one pass, only when the sun is low
       and in frame. Not on Medium. */
    if (LIGHT.godrays && !med) {
      godrays = new ShaderPass({
        uniforms: { tDiffuse: { value: null }, uSun: { value: new THREE.Vector2(0.5, 0.2) }, uStrength: { value: 0 }, uDecay: { value: 0.96 } },
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uSun; uniform float uStrength; uniform float uDecay; varying vec2 vUv;
          void main() {
            vec4 base = texture2D(tDiffuse, vUv);
            if (uStrength <= 0.0) { gl_FragColor = base; return; }
            vec2 d = (vUv - uSun) / 40.0;
            vec2 uv = vUv; float w = 1.0; vec3 acc = vec3(0.0);
            for (int i = 0; i < 40; i++) { uv -= d; vec3 c = texture2D(tDiffuse, uv).rgb; float l = dot(c, vec3(0.3, 0.59, 0.11)); acc += c * smoothstep(0.75, 1.4, l) * w; w *= uDecay; }
            gl_FragColor = vec4(base.rgb + acc * uStrength / 12.0, 1.0);
          }`,
      });
      composer.addPass(godrays);
    }

    // High threshold on purpose: only the floodlights and LED boards should
    // bloom. Lower and the lit turf itself hazes over.
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.55, 0.95);
    composer.addPass(bloom);

    /* Motion blur for replays: the previous frame is kept and blended under
       the new one, which smears anything that moved — the cheap, honest
       version of the effect, and the one a slowed-down replay is flattered
       by. `damp` 0 is off (the pass then just copies), and it is only turned
       up while a replay or the celebration cut is running. */
    afterimage = {
      damp: { value: 0 },
      prev: new THREE.WebGLRenderTarget(1, 1),
    };
    const blend = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, tPrev: { value: afterimage.prev.texture }, uDamp: afterimage.damp },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform sampler2D tPrev; uniform float uDamp; varying vec2 vUv;
        void main() { vec4 a = texture2D(tDiffuse, vUv); vec4 b = texture2D(tPrev, vUv); gl_FragColor = mix(a, b, uDamp); }`,
    });
    blend.enabled = false;             // switched on with the replay; two fullscreen passes are not free
    composer.addPass(blend);
    afterimage.blend = blend;
    // copy the blended result into the history buffer for the next frame
    afterimage.copy = new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main() { gl_FragColor = texture2D(tDiffuse, vUv); }',
    });
    afterimage.copy.renderToScreen = false;
    afterimage.copy.needsSwap = false;
    afterimage.copy.enabled = false;
    composer.addPass(afterimage.copy);
    composer.addPass(new OutputPass());
  }

  if (afterimage) {
    // the copy pass draws the composed frame into the history target
    afterimage.copy.render = function (renderer2, writeBuffer, readBuffer) {
      this.uniforms.tDiffuse.value = readBuffer.texture;
      renderer2.setRenderTarget(afterimage.prev);
      this.fsQuad.render(renderer2);
      renderer2.setRenderTarget(null);
    };
  }
  let replayMode = 0;                // 0 live, 1 replay (DOF + motion blur on)

  if (!models) warmUp();

  return {
    /** Settles when every asset that would change the picture has landed. */
    ready,
    /** Live three.js counters — draw calls, triangles, memory. Handy for profiling. */
    get info() { return renderer.info; },
    /** The scene graph, for the perf harness to switch parts off and time the rest. */
    get scene() { return scene; },
    /** 0–1: how much of what the loading screen waits on has arrived. */
    get progress() { return progress; },
    get engine() { return `three.js r${THREE.REVISION}`; },
    resize(w, h) {
      /* Recompute the ratio, because the budget is a function of the size and
       * this is the only place the size changes. Dragging a window onto a 4K
       * screen, or turning a tablet, is exactly how a session that started
       * inside the budget ends up outside it.
       *
       * The composer has to be told separately: it captured the ratio at
       * construction and multiplies its own targets by that copy, so leaving it
       * behind would resize the canvas and not the buffers it draws into. */
      lastSize = { w, h };
      const r = safeRatio(renderer, wantRatio, { w, h }) * load.scale;
      if (r !== renderer.getPixelRatio()) {
        renderer.setPixelRatio(r);
        composer?.setPixelRatio(r);
      }
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
      const px = renderer.getPixelRatio();
      afterimage?.prev.setSize(Math.round(w * px), Math.round(h * px));
      reflect?.rt.setSize(Math.round(w * px * 0.5), Math.round(h * px * 0.5));
    },
    /** v87: the frame governor's knobs (game/governor.js loadFor). */
    setLoad(next) {
      const scaleChanged = next.scale !== load.scale;
      load = { ...load, ...next };
      renderer.shadowMap.autoUpdate = load.shadows;
      if (!load.shadows) renderer.shadowMap.needsUpdate = true;   // one last map, then frozen
      if (scaleChanged && lastSize) this.resize(lastSize.w, lastSize.h);
    },
    get load() { return { ...load }; },
    /** Replay mode: depth of field and motion blur on the post chain. */
    setReplay(on) {
      replayMode = on ? 1 : 0;
      if (cine) cine.material.uniforms.uDofScale.value = on ? (ultra ? 1.1 : med ? 0 : 0.75) : (ultra ? 0.85 : 0);
      if (afterimage) {
        const blur = on && !med;
        afterimage.damp.value = blur ? 0.55 : 0;
        afterimage.blend.enabled = blur;
        afterimage.copy.enabled = blur;
      }
    },
    /** A fireworks and confetti show for `seconds`. */
    fireworks(seconds = 8) { fx.show = Math.max(fx.show, seconds); fx.nextShell = 0; },
    /** Raise or lower the home end's banner. */
    tifo(up) { if (tifoMesh) { tifoMesh.visible = !!up; tifoMesh.material.opacity = 1; tifoT = up ? 0 : -1; } },
    /**
     * Photo mode: render once more and hand back a PNG blob, with a CSS
     * filter baked in by drawing through a 2D canvas. No preserveDrawingBuffer
     * needed because the read happens in the same task as the draw.
     */
    snapshot(m, cam, filter = 'none') {
      this.render(m, cam, 0);
      const out = document.createElement('canvas');
      out.width = canvas.width; out.height = canvas.height;
      const g = out.getContext('2d');
      g.filter = filter || 'none';
      g.drawImage(canvas, 0, 0);
      return new Promise((res) => out.toBlob(res, 'image/png'));
    },
    render(m, cam, dt) {
      camera.position.set(cam.x, cam.y, cam.z);
      // the grass in front of the camera follows the camera
      if (tufts) tufts.userData.uEye.value.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      // a phone in landscape is wider than 16:9; keep the 16:9 vertical field and show more of the sides, rather than zooming in
      camera.fov = cam.hfov / Math.min(Math.max(1, camera.aspect), 16 / 9) * 1.45;
      camera.updateProjectionMatrix();
      if (atmo.time === 'night') {
        sun.position.set(cam.x - 46, cam.y - 20, 88);
        sun.target.position.set(cam.tx, cam.ty, 0);
      } else {
        // the real sun does not follow the camera; its shadow frustum does
        sun.position.set(cam.tx + SUN_OFF[0], cam.ty + SUN_OFF[1], SUN_OFF[2]);
        sun.target.position.set(cam.tx, cam.ty, 0);
      }

      /* The crowd's mood. Sways harder as the game gets tense, jumps at a
         goal, and every half a minute or so somebody starts a wave that goes
         once round the ground — only while the ball is in play, and only if
         the match screen has not put one on already through `m.crowdWave`. */
      {
        const step = Math.min(dt || 0, 0.1);
        crowdU.uTime.value += step;
        const goal = m.phase === 'goal';
        // who scored: the end that did celebrates, the other sits on its hands
        if (goal && !wasGoal) crowdU.uSide.value = m.teams[0].score > prevScore[0] ? 0 : m.teams[1].score > prevScore[1] ? 1 : 0.5;
        if (!goal) { prevScore[0] = m.teams[0].score; prevScore[1] = m.teams[1].score; }
        wasGoal = goal;
        jumpT = goal ? Math.min(1, jumpT + step * 2.2) : Math.max(0, jumpT - step * 0.8);
        crowdU.uJump.value = jumpT;
        // scarves up for the kick-off and through a goal, down again in open play
        const scarfWant = m.phase === 'kickoff' || goal ? 1 : 0;
        scarfU.value += (scarfWant - scarfU.value) * Math.min(1, step * 2.5);
        // v78: a near miss, a save or a bad foul brings the ground up off its seats for a moment
        m.crowdStir = Math.max(0, (m.crowdStir || 0) - step * 0.6);
        crowdU.uExcite.value += (((m.excitement ?? 0.3) + (goal ? 0.6 : 0) + (m.crowdStir || 0) * 0.8) - crowdU.uExcite.value) * Math.min(1, step * 3);
        if ((m.crowdStir || 0) > 0.5 && !goal) jumpT = Math.max(jumpT, (m.crowdStir - 0.5) * 0.5);
        if (waveT < 0) {
          waveNext -= step;
          if (waveNext <= 0 && m.phase === 'play' && !potato) { waveT = 0; }
        } else {
          waveT += step;
          crowdU.uWave.value = waveT / 11;          // eleven seconds round the bowl
          if (waveT >= 11) { waveT = -1; waveNext = 40 + rand() * 50; crowdU.uWave.value = -1; }
        }
      }
      if (rainMesh) {
        rainU.uTime.value += Math.min(dt || 0, 0.1);
        rainU.uCentre.value.set(cam.tx, cam.ty, 0);
      }
      // the tifo comes down on its own after half a minute
      if (tifoMesh && tifoT >= 0) {
        tifoT += dt || 0;
        if (tifoT > 26) tifoMesh.material.opacity = Math.max(0, 1 - (tifoT - 26) / 3);
        if (tifoT > 29) { tifoMesh.visible = false; tifoT = -1; }
      }
      // pitch wear: tally where the ball is, paint every thirty seconds of play
      if (wearCtx && m.phase === 'play') {
        const gx = Math.max(0, Math.min(20, Math.floor((m.ball.x / PITCH.w) * 21)));
        const gy = Math.max(0, Math.min(13, Math.floor((m.ball.y / PITCH.h) * 14)));
        wearGrid[gy * 21 + gx] += (dt || 0) * 1.6;
        wearClock += dt || 0;
        if (wearClock > 30) { wearClock = 0; paintWear(); }
      }
      /* v78: divots. A slide or a tackle tears a strip out of the turf where it
         happened — a dark, torn scrape along the direction of the challenge,
         painted straight into the colour map (the match screen queues them
         from the sim's cues in `m.divots`). More on a wet pitch. */
      if (wearCtx && m.divots?.length) {
        const S = wearCanvas.width / PITCH.w;
        for (const dv of m.divots.splice(0)) {
          if (!Number.isFinite(dv.x) || !Number.isFinite(dv.y)) continue;
          const n = wet ? 3 : 2;
          for (let k = 0; k < n; k++) {
            const len = (wet ? 1.2 : 0.7) + Math.random() * 0.6;
            wearCtx.save();
            wearCtx.translate((dv.x + (Math.random() - 0.5) * 0.6) * S, (dv.y + (Math.random() - 0.5) * 0.6) * S);
            wearCtx.rotate(dv.a ?? Math.random() * Math.PI);
            wearCtx.fillStyle = wet ? 'rgba(62,44,28,.55)' : 'rgba(96,78,50,.45)';
            wearCtx.beginPath(); wearCtx.ellipse(0, 0, len * S * 0.5, 0.14 * S, 0, 0, 7); wearCtx.fill();
            wearCtx.restore();
          }
        }
        turfMap.needsUpdate = true;
      }
      fxStep(Math.min(dt || 0, 0.05));
      bootFx(m, Math.min(dt || 0, 0.05));
      if (WONDER) {
        screenClock += dt || 0;
        if (screenClock > 1) { screenClock = 0; paintScreens(m); }
        if (ribbonTex) ribbonTex.offset.x -= (dt || 0) * 0.06;
        if (roofSlabs) {
          const want = rainLevel > 0.3 ? 1 : 0;
          roofClosed += (want - roofClosed) * Math.min(1, (dt || 0) * 0.08);
          for (const sl of roofSlabs) sl.position.y = sl.userData.open + (sl.userData.home - sl.userData.open) * roofClosed;
        }
        if (!pyroDone && m.phase === 'play') { pyroDone = true; fx.show = Math.max(fx.show, 4); fx.nextShell = 0; }
        if (m.phase === 'goal' && fx.show < 1) { fx.show = 3; }
      }
      if (!lo && m.phase !== 'end') trampleStep(m, dt);
      dressing.update(m, dt || 0, cam);
      {
        // the boards: sponsors, then 7 s of club colours every 30 s, and through a goal
        ledClock += dt || 0;
        const club = m.phase === 'goal' || (ledClock % 30) > 23;
        if (club !== ledClub) {
          ledClub = club;
          for (const b of boardMats) {
            b.mat.map = club ? clubLed : b.ads; b.mat.emissiveMap = b.mat.map;
            b.mat.needsUpdate = true;
          }
          clubLed.repeat.set(boardMats[0]?.reps || 4, 1);
        }
        if (club) clubLed.offset.x = (clubLed.offset.x + (dt || 0) * 0.35) % 1;
      }
      weatherStep(m, dt);
      if (godrays) {
        // the sun's place on screen: project the low sun; strength fades as it leaves the frame
        _v.set(cam.tx + SUN_OFF[0] * 3, cam.ty + SUN_OFF[1] * 3, SUN_OFF[2] * 3).project(camera);
        const sx = _v.x * 0.5 + 0.5; const sy = _v.y * 0.5 + 0.5;
        const inFrame = _v.z < 1 && sx > -0.3 && sx < 1.3 && sy > -0.3 && sy < 1.3;
        godrays.uniforms.uSun.value.set(sx, sy);
        godrays.uniforms.uStrength.value += ((inFrame ? (cinema ? 0.55 : 0.4) : 0) - godrays.uniforms.uStrength.value) * Math.min(1, (dt || 0) * 2);
      }
      // cloth: each shirt knows how fast its player is moving
      if (!lo && !med) {
        for (const [p, rig] of rigs) if (rig.cloth) rig.cloth.value = Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 7);
      }

      for (let t = 0; t < 2; t++) {
        for (const p of m.teams[t].players) {
          // a substitute has come on in this slot: dress him as himself
          const simple = rigs.get(p);
          if (simple && simple.refId !== p.ref?.id) {
            scene.remove(simple.grp);
            simple.parts.torso.material.map?.dispose?.();
            const fresh = simpleRig(p, t, simple.shirtNo);
            fresh.grp.visible = !useModels;
            scene.add(fresh.grp); rigs.set(p, fresh);
          }
          if (useModels) {
            let rig = modelRigs.get(p);
            if (rig && rig.refId !== p.ref?.id && loadedModel) {
              rig.mixer.stopAllAction(); scene.remove(rig.root);
              rig = modelRig(p, t, rig.index); scene.add(rig.root); modelRigs.set(p, rig);
            }
            if (rig) {
              // v87: animation LOD — distance from the lens, and whether he is in front of it at all
              const dx = p.x - cam.x; const dy = p.y - cam.y;
              const d2 = dx * dx + dy * dy;
              const ahead = dx * (cam.tx - cam.x) + dy * (cam.ty - cam.y) > 0;
              let every = !ahead ? 4 : d2 > 70 * 70 ? 3 : d2 > 45 * 45 ? 2 : 1;
              if (!load.shadows && every > 1) every += 1;          // the governor is already shedding work
              if (replayMode) every = 1;                           // a replay is the one time everything is looked at
              setCelebClock(m.celebT); poseRig(rig, p, dt, every);
              rig.root.position.z += surfaceAt(p.x, p.y);
            }
            continue;
          }
          const rig = rigs.get(p);
          if (!rig) continue;
          // v102: a real cadence (longer strides as he speeds up), and the body tipped into a turn;
          // the feet step on their own (rig.js), in whatever direction he moves
          { const g = gaitOf(p); p._phase = (p._phase || 0) + strideRate(g.sp) * Math.min(1, g.sp / 1.2) * dt; updateBank(p, dt); }
          rig.groundZ = surfaceAt(p.x, p.y);
          posePlayer(rig, p, p._phase, fine, m.celebT || 0);
        }
      }
      if (refState) {
        // the replay is the tape's world, not his; he stands down for it and for the final whistle
        const live = !replayMode && m.phase !== 'end';
        if (live) updateReferee(refState, m, dt);
        const fig = useModels && refModel ? refModel : null;
        if (fig) {
          fig.root.visible = live;
          if (live) { setCelebClock(0); poseRig(fig, refState, dt, 1); fig.root.position.z += surfaceAt(refState.x, refState.y); }
        } else if (refRig) {
          refRig.grp.visible = live;
          if (live) {
            const g = gaitOf(refState); refState._phase += strideRate(g.sp) * Math.min(1, g.sp / 1.2) * dt; updateBank(refState, dt);
            refRig.groundZ = surfaceAt(refState.x, refState.y);
            posePlayer(refRig, refState, refState._phase, fine, 0);
          }
        }
        refCard.visible = live && !!refState.card;
        if (refCard.visible) {
          const hand = fig ? fig.hand : refRig?.parts.handR;
          if (hand) { hand.getWorldPosition(_hand); refCard.position.set(_hand.x, _hand.y, _hand.z + 0.09); }
          else refCard.position.set(refState.x, refState.y, 2.35);
          refCard.lookAt(camera.position);
        }
      }
      if (mgrRig && m.managerFig) {
        const f = m.managerFig;
        mgrProxy.x = f.x; mgrProxy.y = f.y;
        mgrProxy.dirX = f.dirX; mgrProxy.dirY = f.dirY;
        const walking = f.walk > 0;
        mgrProxy.vx = walking ? f.dirX * 1.8 : 0;
        mgrProxy.vy = 0;
        mgrProxy.celebrating = f.pose === 'celebrate' || f.pose === 'shout';
        posePlayer(mgrRig, mgrProxy, f.walk, true, f.poseT || 0);
      }
      if (mgrModel && m.managerFig) {
        const f = m.managerFig;
        mgrModel.position.set(f.x, f.y, 0);
        /* Yaw is smoothed toward the requested facing rather than snapped —
         * the snap was the "he just looked at the camera" bug: for one frame
         * between facings the interpolation of raw atan2 values swept through
         * the -y (lens-facing) half. Turning through the shortest arc, and
         * only ever between pitch-facing and the two walk profiles, keeps his
         * eyes on the football. */
        /* +π/2, not -π/2: this asset's rest forward is -y (it faced the lens
         * at yaw 0), so the offset flips it — idle now faces the pitch. */
        const wantYaw = Math.atan2(f.dirY, f.dirX) + Math.PI / 2;
        let cur = mgrModel.rotation.z;
        let diff = wantYaw - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        mgrModel.rotation.z = cur + diff * Math.min(1, dt * 7);
        // the pose the match screen asked for, translated into the model's clips
        mgrPlay(
          f.pose === 'celebrate' ? 'celebrate'
          : f.pose === 'slump' ? 'stomp'
          : f.pose === 'head' ? 'stomp'
          : f.pose === 'shout' ? 'shout'
          : f.walk > 0 ? 'walk' : 'idle');
        mgrMixer?.update(dt);
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

      ball.position.set(m.ball.x, m.ball.y, (m.ball.z || 0) + 0.19 + surfaceAt(m.ball.x, m.ball.y));
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
        const k = 0.021;
        // both panels of that goal — a ball into the back of it shakes the roof too
        for (const n of nets) {
          if (n.gx !== near.gx) continue;
          n.cloth.impulse(h.x, h.y, h.z, 2.8, h.vx * k, h.vy * k, h.vz * k - 0.05);
        }
      }
      const nd = Math.min(dt || 1 / 60, 1 / 30);
      for (const n of nets) {
        n.cloth.step(nd, load.netSteps || (potato ? 1 : quality === 'low' ? 2 : ultra ? 6 : 3));
        n.geo.attributes.position.needsUpdate = true;
      }

      const acts = m.actives || (m.active ? [m.active] : []);
      markers.forEach((mk, i) => {
        const p = acts[i];
        // not over the celebration, the half-time and full-time shots, or a replay
        // ...nor from a close camera (Pro, a penalty, a free kick at goal), where it is a white slab in the shot
        const near = p && Math.hypot(cam.x - p.x, cam.y - p.y, cam.z) < 16;
        mk.visible = !!p && !near && m.phase !== 'goal' && m.phase !== 'half' && m.phase !== 'end' && !replayMode;
        if (p) mk.position.set(p.x, p.y, 2.6 + surfaceAt(p.x, p.y));
      });

      {
        const g = !replayMode && m.setPiece && m.setPieceGuide ? m.setPieceGuide() : null;
        guide.visible = !!g; band.visible = aimLine.visible = !!g?.goal;
        if (g) {
          const col = g.shot ? GUIDE_COL.shoot : (GUIDE_COL[g.action] ?? 0xffffff);
          shaft.material.color.setHex(col); tip.material.color.setHex(col);
          guide.position.set(g.x, g.y, surfaceAt(g.x, g.y) + 0.04);
          guide.rotation.set(0, 0, Math.atan2(g.dir.y, g.dir.x));
          shaft.scale.set(Math.max(0.5, g.len - 1.5), 1, 1); shaft.position.x = 0.4;
          tip.position.x = 0.4 + Math.max(0.5, g.len - 1.5);
          if (g.goal) {
            const inset = g.goal.x > PITCH.w / 2 ? -0.06 : 0.06;   // just in front of the line, facing the taker
            const w = Math.max(0.5, g.goal.spread * 2);
            const lo = Math.max(-GOAL_HALF, g.goal.y - PITCH.h / 2 - w / 2); const hi = Math.min(GOAL_HALF, g.goal.y - PITCH.h / 2 + w / 2);
            band.scale.set(1, Math.max(0.2, hi - lo), GOAL_HEIGHT); band.position.set(g.goal.x + inset, PITCH.h / 2 + (lo + hi) / 2, GOAL_HEIGHT / 2);
            band.material.color.setHex(g.shot ? GUIDE_COL.shoot : 0xffffff);
            aimLine.scale.set(1, 0.16, GOAL_HEIGHT); aimLine.position.set(g.goal.x + inset * 1.5, g.goal.y, GOAL_HEIGHT / 2);
          }
        }
      }

      if (contextLost) return;
      /* `info` is reset by every render call, so through the composer it would
         only ever describe the final fullscreen quad. Accumulate across the
         passes and reset here, once a frame, so the counters mean the frame. */
      renderer.info.autoReset = false;
      renderer.info.reset();
      if (reflect && load.post) {
        // the mirrored view: same lens, position and aim flipped in z
        const mc = reflect.mirrorCam;
        mc.fov = camera.fov; mc.aspect = camera.aspect; mc.near = camera.near; mc.far = camera.far;
        mc.position.set(cam.x, cam.y, -cam.z);
        mc.lookAt(cam.tx, cam.ty, -cam.tz);
        mc.updateProjectionMatrix();
        mc.updateMatrixWorld();
        // texture matrix: clip space -> 0..1
        reflect.uReflMat.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
          .multiply(mc.projectionMatrix).multiply(mc.matrixWorldInverse);
        turf.visible = false; if (rainMesh) rainMesh.visible = false;
        renderer.setRenderTarget(reflect.rt);
        renderer.render(scene, mc);
        renderer.setRenderTarget(null);
        turf.visible = true; if (rainMesh) rainMesh.visible = true;
      }
      if (composer && load.post) composer.render();
      else renderer.render(scene, camera);
    },
    /** `keepContext`: the caller builds a new renderer on this same canvas
     *  (the stadium builder). A forced context loss there is permanent — the
     *  canvas hands the same, lost context to the next renderer — so it is
     *  left alive for the next one to reuse. */
    dispose({ keepContext = false } = {}) {
      try { dressing.dispose(); } catch { /* already gone */ }
      disposed = true;
      for (const rig of modelRigs.values()) {
        rig.mixer.stopAllAction();
        scene.remove(rig.root);
      }
      modelRigs.clear();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      /* v87: the leak. Geometries, materials and kit textures shared at module
       * level (the body parts, the kit cache) are handed to every match's
       * renderer, and three.js hangs a 'dispose' listener on each for each
       * renderer that uploads it — so a shared geometry kept every old
       * renderer, its context, canvas and whole scene alive: about 2 MB a
       * match. Disposing everything the scene used fires those listeners and
       * lets the old renderer go; the shared pieces simply upload again next
       * match. */
      try {
        const geos = new Set(); const mats = new Set(); const texs = new Set();
        const takeTex = (v) => { if (v && v.isTexture) texs.add(v); };
        scene.traverse((o) => {
          if (o.geometry) geos.add(o.geometry);
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            if (!m) continue;
            mats.add(m);
            for (const v of Object.values(m)) takeTex(v);
            if (m.uniforms) for (const u of Object.values(m.uniforms)) takeTex(u?.value);
          }
        });
        takeTex(scene.background); takeTex(scene.environment);
        for (const g of geos) g.dispose();
        for (const m of mats) m.dispose();
        for (const t of texs) t.dispose();
      } catch { /* a half-built scene still goes */ }
      composer?.dispose?.();
      afterimage?.prev.dispose();
      reflect?.rt.dispose();
      pmrem?.dispose();
      renderer.dispose();
      if (!keepContext) { try { renderer.forceContextLoss(); } catch { /* already lost */ } }
    },
  };
}
