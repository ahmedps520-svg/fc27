/**
 * The world outside the ground (v85).
 *
 * What the broadcast camera sees over the far roof and what the Grounds
 * gallery sees all round: a real piece of land for the stadium to stand in.
 *
 *   city       a street grid — asphalt, kerbed pavements, dashed centre lines,
 *              crossings by the ground — blocks of buildings of every size
 *              with their windows drawn in the shader (lit at night), parks
 *              with trees, street lights and parked cars near the stadium
 *   suburbs    houses along quieter streets, gardens, a lot of trees
 *   mountains  ranges built from a heightfield with ridged noise: forest on
 *              the lower slopes, bare rock where it is steep, snow on the
 *              tops; foothills with pines in front
 *   desert     dune fields, mesas on the horizon, palms and rocks, a few low
 *              sandstone buildings
 *   coast      the sea on one side, a beach and a promenade of palms, rocks
 *              at the shore, a smaller city behind, and the lighthouse
 *
 * Everything repeated is instanced, split into angular sectors so the camera's
 * frustum culls what it cannot see, and trees and rocks come in two levels of
 * detail — the near band built properly, the far band from a few triangles.
 * The quality tier scales the counts. Nothing here touches the simulation.
 */
import * as THREE from '../vendor/three.module.js';

let SECTORS = 8;          // fewer on the light tiers: fewer draw calls, coarser culling
const TAU = Math.PI * 2;

/* ------------------------------ randomness ------------------------------ */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash2(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function valueNoise(x, y, s = 0) {
  const xi = Math.floor(x); const yi = Math.floor(y); const xf = x - xi; const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf); const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s); const b = hash2(xi + 1, yi, s); const c = hash2(xi, yi + 1, s); const d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, s = 0, oct = 5) { let f = 0; let amp = 0.5; let fr = 1; for (let i = 0; i < oct; i++) { f += amp * valueNoise(x * fr, y * fr, s + i * 17); fr *= 2.03; amp *= 0.5; } return f; }
export function ridged(x, y, s = 0, oct = 5) { let f = 0; let amp = 0.55; let fr = 1; let w = 1; for (let i = 0; i < oct; i++) { let n = 1 - Math.abs(valueNoise(x * fr, y * fr, s + i * 31) * 2 - 1); n *= n; f += n * amp * w; w = Math.min(1, n * 1.6); fr *= 2.1; amp *= 0.5; } return f; }

/** Far things take on the sky's colour (baked, with the scene fog off — see terrainRing). */
function hazed(hex, x, y, centre, haze) {
  const c = new THREE.Color(hex);
  if (haze) c.lerp(haze, Math.min(0.62, Math.max(0, (Math.hypot(x - centre.x, y - centre.y) - 350) / 2600)));
  return c.getHex();
}

/** The `n` items nearest the centre — a cap never drops one side of town wholesale. */
function nearest(list, n, centre) {
  if (list.length <= n) return list;
  return list.map((it) => [(it.x - centre.x) ** 2 + (it.y - centre.y) ** 2, it]).sort((a, b) => a[0] - b[0]).slice(0, n).map((e) => e[1]);
}

/* ------------------------------ instancing ------------------------------ */
/**
 * A set of instances split into angular sectors round the centre, each its own
 * InstancedMesh with a proper bounding sphere, so frustum culling works.
 */
function sectored(group, geo, mat, items, centre, { color = true, cast = false, receive = false } = {}) {
  const buckets = Array.from({ length: SECTORS }, () => []);
  for (const it of items) {
    const a = Math.atan2(it.y - centre.y, it.x - centre.x);
    buckets[Math.floor(((a + TAU) % TAU) / TAU * SECTORS) % SECTORS].push(it);
  }
  const d = new THREE.Object3D(); const c = new THREE.Color();
  let n = 0;
  for (const list of buckets) {
    if (!list.length) continue;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((it, i) => {
      d.position.set(it.x, it.y, it.z || 0);
      d.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0);
      d.scale.set(it.sx ?? it.s ?? 1, it.sy ?? it.s ?? 1, it.sz ?? it.s ?? 1);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
      if (color && it.c !== undefined) im.setColorAt(i, c.set(it.c));
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.computeBoundingSphere();
    im.castShadow = cast; im.receiveShadow = receive;
    group.add(im);
    n += list.length;
  }
  return n;
}

/* ------------------------------- materials ------------------------------- */
/** Building skin: windows drawn from world position, so every tower gets the same-sized
 *  storeys whatever its scale; faded to an average at distance to kill the shimmer; lit at night. */
function buildingMaterial(night) {
  const mat = surf({ color: 0xffffff, roughness: 0.82, metalness: 0.05 });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uNight = { value: night ? 1 : 0 };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBPos;\nvarying vec3 vBNrm;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 bpw = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          bpw = instanceMatrix * bpw;
        #endif
        vBPos = (modelMatrix * bpw).xyz;
        vec3 bn = objectNormal;
        #ifdef USE_INSTANCING
          bn = mat3(instanceMatrix) * bn;
        #endif
        vBNrm = normalize(mat3(modelMatrix) * bn);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vBPos;
        varying vec3 vBNrm;
        uniform float uNight;
        float bHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float roof = step(0.6, vBNrm.z);
        vec2 wc = vec2(abs(vBNrm.x) > 0.5 ? vBPos.y : vBPos.x, vBPos.z);
        vec2 cell = wc / vec2(3.0, 3.4);
        vec2 fw = fwidth(cell);
        float far = smoothstep(0.25, 0.55, max(fw.x, fw.y));
        vec2 f = fract(cell);
        float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.82) * step(3.2, vBPos.z) * (1.0 - roof);
        win = mix(win, 0.34 * (1.0 - roof) * step(3.2, vBPos.z), far);
        vec3 glass = vec3(0.07, 0.09, 0.12) + diffuseColor.rgb * 0.18;
        diffuseColor.rgb = mix(diffuseColor.rgb, glass, win * 0.9);
        diffuseColor.rgb *= mix(1.0, 0.55, roof);
        float bLit = step(0.58, bHash(floor(cell) + floor(vBPos.xy / 40.0))) * win;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1.0, 0.8, 0.52) * bLit * uNight * mix(1.4, 0.6, far);`);
  };
  mat.customProgramCacheKey = () => `apex-building-${night ? 1 : 0}`;
  return mat;
}
/* On the Low and Medium tiers the land is lit with Lambert: a fraction of the per-pixel
   cost of the physical model, and at these distances nobody can tell. */
let LITE = false;
function surf(opts) {
  if (!LITE) return new THREE.MeshStandardMaterial(opts);
  const { roughness, metalness, envMapIntensity, ...rest } = opts;
  return new THREE.MeshLambertMaterial(rest);
}
const std = (color, extra = {}) => surf({ color, roughness: 0.95, ...extra });

/** A gable roof: a unit footprint (x −0.5…0.5 along the ridge, y −0.5…0.5), apex at z 1. */
function gableRoof() {
  const A = [-0.5, -0.5, 0]; const B = [0.5, -0.5, 0]; const C = [0.5, 0.5, 0]; const D = [-0.5, 0.5, 0];
  const E = [-0.5, 0, 1]; const F = [0.5, 0, 1];
  const tris = [
    A, B, F, A, F, E,          // one slope
    C, D, E, C, E, F,          // the other
    A, E, D,                   // gable ends
    B, C, F,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat()), 3));
  g.computeVertexNormals();
  return g;
}

/* -------------------------------- trees -------------------------------- */
/** Tree geometry, near and far. */
function treeParts(kind, lod) {
  const near = lod === 0;
  if (kind === 'pine') {
    const trunk = new THREE.CylinderGeometry(0.18, 0.28, 1, near ? 6 : 4).rotateX(Math.PI / 2).translate(0, 0, 0.5);
    const crown = near
      ? mergeCones([[1.0, 0.9, 0.5], [0.8, 0.9, 1.05], [0.55, 0.8, 1.55]], 8)
      : new THREE.ConeGeometry(0.9, 1.9, 5).rotateX(Math.PI / 2).translate(0, 0, 1.3);
    return { trunk, crown };
  }
  if (kind === 'palm') {
    const trunk = new THREE.CylinderGeometry(0.16, 0.26, 1, near ? 6 : 4, near ? 4 : 1).rotateX(Math.PI / 2).translate(0, 0, 0.5);
    if (near) { const p = trunk.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setX(i, p.getX(i) + Math.sin(z * 2.2) * 0.12 * z); } trunk.computeVertexNormals(); }
    const crown = near ? palmFronds() : new THREE.ConeGeometry(1.4, 0.5, 6).rotateX(-Math.PI / 2).translate(0, 0, 1.0);
    return { trunk, crown };
  }
  // deciduous
  const trunk = new THREE.CylinderGeometry(0.16, 0.24, 1, near ? 6 : 4).rotateX(Math.PI / 2).translate(0, 0, 0.5);
  const crown = near ? mergeBlobs() : new THREE.IcosahedronGeometry(0.95, 0).translate(0, 0, 1.2);
  return { trunk, crown };
}
function mergeCones(specs, seg) {
  const parts = specs.map(([r, h, z]) => new THREE.ConeGeometry(r, h, seg).rotateX(Math.PI / 2).translate(0, 0, z + h / 2));
  return mergeGeos(parts);
}
function mergeBlobs() {
  const parts = [[0, 0, 1.25, 0.95], [0.45, 0.2, 1.05, 0.7], [-0.4, -0.25, 1.1, 0.72], [0.1, -0.35, 1.55, 0.6]]
    .map(([x, y, z, r]) => new THREE.IcosahedronGeometry(r, 0).translate(x, y, z));   // 80 triangles a tree, not 320
  return mergeGeos(parts);
}
function palmFronds() {
  const parts = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.PlaneGeometry(1.8, 0.42, 3, 1);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k) + 0.9; p.setX(k, x); p.setZ(k, -0.18 * x * x); }
    g.rotateZ((i / 7) * TAU).translate(0, 0, 1.0);
    parts.push(g);
  }
  return mergeGeos(parts);
}
function mergeGeos(parts) {
  const geos = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3); const nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of geos) {
    if (!g.attributes.normal) g.computeVertexNormals();
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

/** Plant trees: [{x, y, h, kind}] → instanced, two LOD bands by distance from the centre. */
function plantTrees(group, list, centre, { night, snow, lodR = 280, haze = null }) {
  const PAL = {
    pine: { trunk: 0x4a3526, crown: snow ? 0xdfe8ee : 0x1f3d26 },
    palm: { trunk: 0x7a5a38, crown: 0x3f7a35 },
    deciduous: { trunk: 0x4d3a2a, crown: snow ? 0xd9e1e8 : 0x3d6b2e },
  };
  let n = 0;
  for (const kind of ['pine', 'palm', 'deciduous']) {
    for (const lod of [0, 1]) {
      const pick = list.filter((t) => t.kind === kind && (Math.hypot(t.x - centre.x, t.y - centre.y) < lodR ? 0 : 1) === lod);
      if (!pick.length) continue;
      const { trunk, crown } = treeParts(kind, lod);
      const tm = std(0xffffff, { fog: !haze }); const cm = std(0xffffff, { roughness: 1, fog: !haze, side: kind === 'palm' && lod === 0 ? THREE.DoubleSide : THREE.FrontSide });
      /* proportions per kind, for a tree `h` metres tall: the trunk's girth
         and how far up it goes, and the crown's size and where it sits */
      const P = {
        pine: (t) => [{ sx: t.h * 0.1, sy: t.h * 0.1, sz: t.h * 0.3, z: 0 }, { sx: t.h * 0.3, sy: t.h * 0.3, sz: t.h * 0.4, z: 0 }],
        palm: (t) => [{ sx: t.h * 0.09, sy: t.h * 0.09, sz: t.h, z: 0 }, { sx: t.h * 0.26, sy: t.h * 0.26, sz: t.h * 0.26, z: t.h - t.h * 0.26 }],
        deciduous: (t) => [{ sx: t.h * 0.12, sy: t.h * 0.12, sz: t.h * 0.55, z: 0 }, { sx: t.h * 0.33, sy: t.h * 0.33, sz: t.h * 0.33, z: t.h * 0.25 }],
      }[kind];
      const items = pick.map((t) => { const [tr] = P(t); return { x: t.x, y: t.y, z: (t.z || 0) + tr.z, sx: tr.sx, sy: tr.sy, sz: tr.sz, rz: t.rot || 0, c: hazed(PAL[kind].trunk, t.x, t.y, centre, haze) }; });
      n += sectored(group, trunk, tm, items, centre, { color: true });
      // a little variety in the greens, then the distance
      const crownItems = pick.map((t) => { const [, cr] = P(t); const base = new THREE.Color(t.tint ?? PAL[kind].crown).multiplyScalar(0.85 + ((t.x * 7.3 + t.y * 3.1) % 1 + 1) % 1 * 0.3).getHex(); return { x: t.x, y: t.y, z: (t.z || 0) + cr.z, sx: cr.sx, sy: cr.sy, sz: cr.sz, rz: t.rot || 0, c: hazed(base, t.x, t.y, centre, haze) }; });
      sectored(group, crown, cm, crownItems, centre, { color: true });
    }
  }
  return n;
}

/** Rocks: a lumpy icosahedron, shared, scattered. */
function scatterRocks(group, list, centre, color = 0x7a7470, haze = null) {
  if (!list.length) return 0;
  const near = new THREE.IcosahedronGeometry(1, 1); const far = new THREE.IcosahedronGeometry(1, 0);
  for (const g of [near, far]) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 0.75 + valueNoise(p.getX(i) * 2.1 + 5, p.getY(i) * 2.1 + p.getZ(i), 9) * 0.5; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k * 0.7); }
    g.computeVertexNormals();
  }
  const mat = std(0xffffff, { flatShading: true, fog: !haze });
  const nearL = list.filter((r) => Math.hypot(r.x - centre.x, r.y - centre.y) < 300);
  const farL = list.filter((r) => Math.hypot(r.x - centre.x, r.y - centre.y) >= 300);
  const toItem = (r) => ({ x: r.x, y: r.y, z: (r.z || 0) + r.s * 0.2, sx: r.s * (0.8 + r.k * 0.6), sy: r.s, sz: r.s, rz: r.rot, c: hazed(r.c ?? color, r.x, r.y, centre, haze) });
  sectored(group, near, mat, nearL.map(toItem), centre, { color: true });
  sectored(group, far, mat, farL.map(toItem), centre, { color: true });
  return list.length;
}

/* -------------------------------- ground -------------------------------- */
function groundDisc(group, centre, colors, R, rand, snow, hole = 0) {
  // a big disc with a painted noise texture so it is not one flat colour
  const c = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  let map = null;
  if (c) {
    c.width = c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = colors.base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = rand() < 0.5 ? colors.a : colors.b;
      g.globalAlpha = 0.08 + rand() * 0.12;
      const r = 3 + rand() * 18;
      g.beginPath(); g.arc(rand() * 512, rand() * 512, r, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    map = new THREE.CanvasTexture(c);
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(R / 90, R / 90); map.colorSpace = THREE.SRGBColorSpace;
  }
  /* open in the middle, under the stadium: the ground there is the stadium's
     own, and a disc drawn under it shaded every pixel of the pitch twice */
  const disc = new THREE.Mesh(hole > 0 ? new THREE.RingGeometry(hole, R, 72, 1) : new THREE.CircleGeometry(R, 72), surf({ color: snow ? 0xe8edf2 : 0xffffff, map, roughness: 1 }));
  disc.position.set(centre.x, centre.y, -0.32);
  disc.receiveShadow = true;
  group.add(disc);
}

/* -------------------------------- city -------------------------------- */
/**
 * A street grid. Returns the placed blocks (for the caller to add houses or
 * towers to) after laying pavements, markings, lights and cars.
 */
function streetGrid(group, { centre, keep, R, G = 64, road = 14, rand, night, near = 360, lights = true, cars = true, dashes = true, pavement = 0x8b8e93, q, skip = null, roads = false }) {
  // the light tier keeps the streets and the blocks, and leaves out the furniture
  if (q.light) { lights = false; cars = false; }
  const blocks = [];
  const n = Math.ceil(R / G);
  // the blocks the stadium stands on become its plaza, out to the middle of the streets round it
  const paved = { x0: keep.x0, x1: keep.x1, y0: keep.y0, y1: keep.y1 };
  const fringe = [];
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const bx = centre.x + i * G; const by = centre.y + j * G;
    const d = Math.hypot(bx - centre.x, by - centre.y);
    if (d > R) continue;
    const half = (G - road) / 2;
    // the stadium and its plaza keep their space
    if (bx + half > keep.x0 && bx - half < keep.x1 && by + half > keep.y0 && by - half < keep.y1) {
      paved.x0 = Math.min(paved.x0, bx - half - road / 2); paved.x1 = Math.max(paved.x1, bx + half + road / 2);
      paved.y0 = Math.min(paved.y0, by - half - road / 2); paved.y1 = Math.max(paved.y1, by + half + road / 2);
      // what is left of the block outside the plaza is a strip of green for trees
      const b0 = { x0: bx - half, x1: bx + half, y0: by - half, y1: by + half };
      for (const st of [
        { ...b0, x1: Math.min(b0.x1, keep.x0) }, { ...b0, x0: Math.max(b0.x0, keep.x1) },
        { ...b0, y1: Math.min(b0.y1, keep.y0) }, { ...b0, y0: Math.max(b0.y0, keep.y1) },
      ]) if (st.x1 - st.x0 >= 8 && st.y1 - st.y0 >= 8) fringe.push(st);
      continue;
    }
    if (skip?.(bx, by)) continue;
    blocks.push({ x: bx, y: by, w: G - road, d, i, j });
  }
  // out of town the ground is not asphalt: lay the streets themselves
  if (roads) {
    const strips = [];
    for (let i = -n - 1; i <= n; i++) {
      const line = (i + 0.5) * G;
      const len = 2 * Math.sqrt(Math.max(0, R * R - line * line));
      if (len < 10) continue;
      strips.push({ x: centre.x, y: centre.y + line, z: -0.315, sx: len, sy: road, sz: 1 });
      strips.push({ x: centre.x + line, y: centre.y, z: -0.314, sx: road, sy: len, sz: 1 });
    }
    // one mesh for every street: a single draw call
    const roadGeo = mergeGeos(strips.map((st) => new THREE.PlaneGeometry(st.sx, st.sy).translate(st.x, st.y, st.z)));
    roadGeo.computeBoundingSphere();
    // flat layers a few millimetres apart: pushed forward in depth so they never shimmer at distance
    const roadMesh = new THREE.Mesh(roadGeo, std(0x3d4045, { polygonOffset: true, polygonOffsetFactor: -0.5, polygonOffsetUnits: -1 }));
    roadMesh.receiveShadow = true;
    group.add(roadMesh);
  }
  // pavements: a kerb-high slab per block
  sectored(group, new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5), std(pavement), blocks.map((b) => ({ x: b.x, y: b.y, z: -0.32, sx: b.w, sy: b.w, sz: 0.44 })), centre, { color: false, receive: true });
  // markings: dashed centre lines down every street near enough to read, and zebra crossings by the ground
  if (dashes) {
    const dashItems = []; const zebra = [];
    for (let i = -n; i <= n; i++) {
      for (const along of ['x', 'y']) {
        const line = (along === 'x' ? centre.y : centre.x) + (i + 0.5) * G;
        for (let t = -near; t < near; t += 6) {
          const x = along === 'x' ? centre.x + t : line; const y = along === 'x' ? line : centre.y + t;
          if (x > keep.x0 - 6 && x < keep.x1 + 6 && y > keep.y0 - 6 && y < keep.y1 + 6) continue;
          if (Math.hypot(x - centre.x, y - centre.y) > near || skip?.(x, y)) continue;
          // not across the junctions
          const k = (((along === 'x' ? x - centre.x : y - centre.y) % G) + G) % G;
          if (k < road * 0.5 + 2 || k > G - road * 0.5 - 2) continue;
          dashItems.push({ x, y, z: -0.29, sx: along === 'x' ? 2.6 : 0.16, sy: along === 'x' ? 0.16 : 2.6, sz: 1 });
        }
      }
    }
    for (const b of blocks) {
      if (b.d > 240) continue;
      // a crossing on each side of the block nearest the stadium's corners
      for (let s = 0; s < 6; s++) zebra.push({ x: b.x + b.w / 2 + road / 2, y: b.y - b.w / 2 + 1.2 + s * 0.9, z: -0.285, sx: road * 0.8, sy: 0.45, sz: 1 });
    }
    const plane = new THREE.PlaneGeometry(1, 1);
    sectored(group, plane, surf({ color: 0xe9e4d2, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), nearest(dashItems, q.dashes, centre), centre, { color: false });
    sectored(group, plane, surf({ color: 0xf2f2ee, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), zebra, centre, { color: false });
  }
  // street lights along the kerbs near the ground
  if (lights) {
    const poles = []; const heads = [];
    for (const b of blocks) {
      if (b.d > near) continue;
      for (const [ox, oy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (rand() < 0.35) continue;
        const x = b.x + ox * (b.w / 2 - 0.6); const y = b.y + oy * (b.w / 2 - 0.6);
        poles.push({ x, y, z: 0, sx: 1, sy: 1, sz: 8 });
        heads.push({ x: x - ox * 1.1, y: y - oy * 1.1, z: 8, sx: 1.4, sy: 1.4, sz: 0.35 });
      }
    }
    const pl = nearest(poles, q.lights, centre); const hd = nearest(heads, q.lights, centre);
    sectored(group, new THREE.CylinderGeometry(0.09, 0.13, 1, 5).rotateX(Math.PI / 2).translate(0, 0, 0.5), std(0x3a3f46, { roughness: 0.6, metalness: 0.6 }), pl, centre, { color: false });
    sectored(group, new THREE.BoxGeometry(1, 0.4, 1), surf({ color: 0x222222, emissive: 0xffd9a0, emissiveIntensity: night ? 2.2 : 0.05 }), hd, centre, { color: false });
  }
  // parked cars along the kerbs
  if (cars) {
    const PAINT = [0xb8bcc2, 0x1d2430, 0xe8e8e8, 0x8a1c1c, 0x2a4a7a, 0x3c3c3c, 0xc9a227, 0x5a6b4a];
    const bodies = []; const cabs = [];
    for (const b of blocks) {
      if (b.d > near * 0.9) continue;
      const side = Math.floor(rand() * 4);
      const k = 2 + Math.floor(rand() * 4);
      for (let c = 0; c < k; c++) {
        const t = -b.w / 2 + 6 + c * 6 + rand() * 1.5;
        const along = side < 2;
        const off = (b.w / 2 + 2.2) * (side % 2 ? 1 : -1);
        const x = b.x + (along ? t : off); const y = b.y + (along ? off : t);
        const col = PAINT[Math.floor(rand() * PAINT.length)];
        bodies.push({ x, y, z: -0.02, sx: along ? 4.3 : 1.8, sy: along ? 1.8 : 4.3, sz: 0.85, c: col });
        cabs.push({ x, y, z: 0.8, sx: along ? 2.3 : 1.6, sy: along ? 1.6 : 2.3, sz: 0.62, c: col });
      }
    }
    const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5);
    const paint = surf({ color: 0xffffff, roughness: 0.35, metalness: 0.55 });
    sectored(group, box, paint, nearest(bodies, q.cars, centre), centre);
    sectored(group, box, surf({ color: 0xffffff, roughness: 0.2, metalness: 0.6 }), nearest(cabs, q.cars, centre).map((c) => ({ ...c, c: new THREE.Color(c.c).multiplyScalar(0.55).getHex() })), centre);
  }
  blocks.paved = paved;
  blocks.fringe = fringe;
  return blocks;
}

function cityBuildings(group, blocks, { centre, rand, night, scale, downtown, q, parkShare = 0.1, maxH = 170, lowNear = true, palette }) {
  const PAL = palette || [0xb9b4aa, 0x8f9aa6, 0xa9765a, 0xd6cdb8, 0x6f7f8f, 0xc7c2b6, 0x7d6a5a, 0x9fb3c4];
  const towers = []; const roofBits = []; const parks = []; const trees = [];
  for (const b of blocks) {
    if (b.d < 520 && rand() < parkShare) {
      parks.push({ x: b.x, y: b.y, z: 0.1, sx: b.w - 2, sy: b.w - 2, sz: 0.1 });
      const k = 6 + Math.floor(rand() * 8);
      for (let i = 0; i < k; i++) trees.push({ x: b.x + (rand() - 0.5) * (b.w - 8), y: b.y + (rand() - 0.5) * (b.w - 8), h: 6 + rand() * 5, kind: 'deciduous', rot: rand() * TAU });
      continue;
    }
    // how tall this part of town is: the stadium's own streets low, downtown high
    const dd = Math.hypot(b.x - downtown.x, b.y - downtown.y);
    const core = Math.max(0, 1 - dd / 380);
    const nearLow = lowNear ? Math.min(1, Math.max(0.35, (b.d - 60) / 260)) : 1;
    const lots = rand() < 0.4 ? 1 : rand() < 0.7 ? 2 : 4;
    const sub = lots === 1 ? [[0, 0, 1]] : lots === 2 ? [[-0.25, 0, 0.5], [0.25, 0, 0.5]] : [[-0.25, -0.25, 0.5], [0.25, -0.25, 0.5], [-0.25, 0.25, 0.5], [0.25, 0.25, 0.5]];
    for (const [ox, oy, f] of sub) {
      const w = b.w * f * (0.78 + rand() * 0.2);
      const d2 = b.w * (lots === 2 ? 0.86 : f) * (0.78 + rand() * 0.2);
      const h = Math.min(maxH, (10 + rand() * 22 + Math.pow(rand(), 2.4) * 70 * scale + core * core * (60 + rand() * 120) * scale) * nearLow);
      const x = b.x + ox * b.w; const y = b.y + oy * b.w;
      towers.push({ x, y, z: 0, sx: w, sy: d2, sz: h, c: PAL[Math.floor(rand() * PAL.length)] });
      if (b.d < 600 && rand() < 0.6 && !q.light) roofBits.push({ x: x + (rand() - 0.5) * w * 0.4, y: y + (rand() - 0.5) * d2 * 0.4, z: h, sx: 2 + rand() * 4, sy: 2 + rand() * 4, sz: 1.2 + rand() * 2.4 });
      // a stepped top on some of the tall ones
      if (h > 60 && rand() < 0.5) towers.push({ x, y, z: h, sx: w * 0.62, sy: d2 * 0.62, sz: h * (0.12 + rand() * 0.2), c: PAL[Math.floor(rand() * PAL.length)] });
    }
  }
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5);
  sectored(group, box, buildingMaterial(night), nearest(towers, q.buildings, centre), centre, { cast: false, receive: false });
  sectored(group, box, std(0x55595f, { roughness: 0.7, metalness: 0.4 }), roofBits, centre, { color: false });
  sectored(group, box, std(0x4f7a3a), parks.map((p) => ({ ...p, z: -0.3, sz: 0.52 })), centre, { color: false, receive: true });
  return { trees, count: towers.length };
}

/* ------------------------------ heightfields ------------------------------ */
/**
 * A ring of terrain from r0 to r1 round the centre, height from `heightAt`,
 * coloured by height and slope with `colourAt`. `arc` limits it to a range of
 * angles (the far side, say). Split into sectors for culling.
 */
function terrainRing(group, { centre, r0, r1, heightAt, colourAt, aSteps = 160, rSteps = 26, arc = [0, TAU], flat = true, haze = null, hazeMax = 0.62 }) {
  const [a0, a1] = arc;
  const perSector = Math.ceil(aSteps / SECTORS);
  for (let s = 0; s < SECTORS; s++) {
    const sa0 = a0 + (a1 - a0) * (s / SECTORS); const sa1 = a0 + (a1 - a0) * ((s + 1) / SECTORS);
    const cols = perSector + 1; const rows = rSteps + 1;
    const pos = new Float32Array(cols * rows * 3); const col = new Float32Array(cols * rows * 3);
    const H = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      const r = r0 + (r1 - r0) * Math.pow(j / rSteps, 1.25);
      for (let i = 0; i < cols; i++) {
        const a = sa0 + (sa1 - sa0) * (i / perSector);
        const x = centre.x + Math.cos(a) * r; const y = centre.y + Math.sin(a) * r;
        const h = heightAt(x, y, r, a);
        const k = j * cols + i;
        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = h; H[k] = h;
      }
    }
    const idx = [];
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i; const b = a + 1; const c = a + cols; const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const nrm = g.attributes.normal;
    const tmp = new THREE.Color();
    for (let k = 0; k < cols * rows; k++) {
      const slope = 1 - Math.abs(nrm.getZ(k));
      colourAt(tmp, pos[k * 3], pos[k * 3 + 1], H[k], slope);
      /* aerial perspective, baked: far land takes on the sky's colour but
         keeps its shape — the scene's fog would white it out completely at
         these distances, which is how the old mountains looked like paper */
      if (haze) {
        const dist = Math.hypot(pos[k * 3] - centre.x, pos[k * 3 + 1] - centre.y);
        tmp.lerp(haze, Math.min(hazeMax, Math.max(0, (dist - 350) / 2600)));
      }
      col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const geo = flat ? g.toNonIndexed() : g;
    if (flat) geo.computeVertexNormals();
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, surf({ vertexColors: true, roughness: 1, flatShading: flat, fog: !haze, envMapIntensity: 0.15 }));
    mesh.receiveShadow = false;
    group.add(mesh);
  }
}

/** Trees planted in rows along the green strips between the plaza and the first streets. */
function plantFringe(blocks, trees, rand, kind, lawn = null, group = null, centre = null) {
  if (lawn != null && blocks.fringe?.length) {
    sectored(group, new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5), std(lawn), blocks.fringe.map((st) => ({ x: (st.x0 + st.x1) / 2, y: (st.y0 + st.y1) / 2, z: -0.3, sx: st.x1 - st.x0, sy: st.y1 - st.y0, sz: 0.5 })), centre, { color: false, receive: true });
  }
  for (const st of blocks.fringe || []) {
    const w = st.x1 - st.x0; const h = st.y1 - st.y0;
    const along = w >= h; const len = along ? w : h; const depth = along ? h : w;
    const rows = Math.max(1, Math.min(3, Math.floor(depth / 9)));
    for (let r = 0; r < rows; r++) {
      const off = (r + 0.5) / rows;
      for (let t = 5; t < len - 4; t += 9 + rand() * 3) {
        const x = along ? st.x0 + t : st.x0 + depth * off; const y = along ? st.y0 + depth * off : st.y0 + t;
        trees.push({ x: x + (rand() - 0.5) * 2, y: y + (rand() - 0.5) * 2, h: 7 + rand() * 5, kind: typeof kind === 'function' ? kind() : kind, rot: rand() * TAU });
      }
    }
  }
}

/** Houses round the edge of each block, facing the street, a tree or two in the
 *  gardens behind. Suburbs and the mountain village share it. */
function edgeHouses(group, blocks, { centre, rand, night, snow, q, trees, walls: WALLS, roofs: ROOFS, per = 4, h: [h0, hv] = [5, 2.5], pitch = 2.6, treeKind = null }) {
  const walls = []; const roofs = [];
  for (const b of blocks) {
    for (let s = 0; s < 4; s++) {
      for (let k = 0; k < per; k++) {
        if (rand() < 0.12) continue;
        const t = -b.w / 2 + (k + 0.5) * (b.w / per);
        const inset = b.w / 2 - 6;
        const x = b.x + (s === 0 ? t : s === 1 ? inset : s === 2 ? t : -inset);
        const y = b.y + (s === 0 ? -inset : s === 1 ? t : s === 2 ? inset : t);
        const w = 7 + rand() * 3; const dd = 6.5 + rand() * 2; const h = h0 + rand() * hv;
        const rz = s % 2 ? Math.PI / 2 : 0;
        const wallC = WALLS[Math.floor(rand() * WALLS.length)];
        walls.push({ x, y, z: 0.1, sx: w, sy: dd, sz: h, rz, c: wallC });
        roofs.push({ x, y, z: 0.1 + h, sx: w * 1.08, sy: dd * 1.1, sz: pitch, rz, c: snow ? 0xeef2f6 : ROOFS[Math.floor(rand() * ROOFS.length)] });
      }
      if (rand() < 0.8) trees.push({ x: b.x + (rand() - 0.5) * (b.w - 20), y: b.y + (rand() - 0.5) * (b.w - 20), h: 7 + rand() * 6, kind: treeKind || 'deciduous', rot: rand() * TAU });
    }
    if (rand() < 0.5) trees.push({ x: b.x + (rand() - 0.5) * 10, y: b.y + (rand() - 0.5) * 10, h: 8 + rand() * 6, kind: treeKind || (rand() < 0.3 ? 'pine' : 'deciduous'), rot: rand() * TAU });
  }
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5);
  sectored(group, box, surf({ color: 0xffffff, roughness: 0.95, emissive: night ? 0x3a2a14 : 0x000000, emissiveIntensity: night ? 0.35 : 0 }), nearest(walls, q.buildings, centre), centre);
  sectored(group, gableRoof(), std(0xffffff, { roughness: 0.9 }), nearest(roofs, q.buildings, centre), centre);
  return { walls, roofs };
}

/* ----------------------------------------------------------------------- */
/**
 * Build the land round a ground.
 *   landscape   city | suburbs | mountains | desert | coast
 *   keep        { x0, x1, y0, y1 } the stadium and its plaza — nothing is built inside
 *   centre      { x, y } the centre spot
 *   quality     low | medium | high | ultra
 *   night, snow, seed, scale (0–1, the club's size), community (a small ground)
 */
export function buildLandscape({ landscape = 'city', keep, floor = null, centre, quality = 'high', night = false, snow = false, seed = 1, scale = 0.6, community = false, street = false, fogColor = 0xbfd4ee, skyColor = null }) {
  const group = new THREE.Group();
  group.name = 'landscape';
  const rand = mulberry(seed ^ 0x51a7e);
  const tier = quality === 'low' ? 0.35 : quality === 'medium' ? 0.6 : quality === 'ultra' || quality === 'cinema' ? 1.25 : 1;
  const light = quality === 'low';
  SECTORS = 8; LITE = light || quality === 'medium';            // (fewer sectors culled worse and cost more triangles than the draw calls they saved)
  const q = { light, buildings: Math.round(2600 * tier), dashes: Math.round(2400 * tier), lights: Math.round(260 * tier), cars: Math.round(360 * tier), trees: Math.round(1600 * tier), rocks: Math.round(500 * tier) };
  const trees = []; const rocks = [];
  const stats = { landscape };
  const plazaPad = street ? 10 : 18;
  const plaza = { x0: keep.x0 - plazaPad, x1: keep.x1 + plazaPad, y0: keep.y0 - plazaPad, y1: keep.y1 + plazaPad };
  // the plaza the ground stands on
  const plazaColor = landscape === 'desert' ? 0xb49c72 : landscape === 'mountains' || landscape === 'suburbs' ? 0x7c7f7c : 0x7f807c;
  // the plaza is laid once the street grid has said how far it reaches
  const layPlaza = (rect) => {
    const w = rect.x1 - rect.x0; const h = rect.y1 - rect.y0;
    let paving = null;
    if (typeof document !== 'undefined') {
      const cv = document.createElement('canvas'); cv.width = cv.height = 256;
      const g = cv.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = 214 + Math.floor(rand() * 30); g.fillStyle = `rgb(${v},${v},${v - 4})`; g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); }
      paving = new THREE.CanvasTexture(cv); paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.colorSpace = THREE.SRGBColorSpace;
      paving.repeat.set(1 / 12, 1 / 12);   // the shape's UVs are in metres
    }
    /* a frame, not a sheet: the stadium stands in the hole (its own apron is
       the ground there), so the paving is never shaded under the pitch */
    const cx = (rect.x0 + rect.x1) / 2; const cy = (rect.y0 + rect.y1) / 2;
    const outer = new THREE.Shape([[rect.x0, rect.y0], [rect.x1, rect.y0], [rect.x1, rect.y1], [rect.x0, rect.y1]].map(([x, y]) => new THREE.Vector2(x - cx, y - cy)));
    const k = floor ? { x0: Math.max(rect.x0 + 1, floor.x0 + 1), x1: Math.min(rect.x1 - 1, floor.x1 - 1), y0: Math.max(rect.y0 + 1, floor.y0 + 1), y1: Math.min(rect.y1 - 1, floor.y1 - 1) } : { x0: 0, x1: 0, y0: 0, y1: 0 };
    if (k.x1 > k.x0 && k.y1 > k.y0) outer.holes.push(new THREE.Path([[k.x0, k.y0], [k.x0, k.y1], [k.x1, k.y1], [k.x1, k.y0]].map(([x, y]) => new THREE.Vector2(x - cx, y - cy))));
    const pz = new THREE.Mesh(new THREE.ShapeGeometry(outer), std(snow ? 0xdde3ea : plazaColor, { roughness: 0.9, map: paving }));
    // under the stadium's own apron (−0.06) and the pitch, never over them
    pz.position.set(cx, cy, -0.16); pz.receiveShadow = true;
    group.add(pz);
    stats.plaza = [Math.round(w), Math.round(h)];
    paved = rect;
  };

  const GROUND = {
    city: { base: '#4a4d52', a: '#3e4146', b: '#55585c' },
    suburbs: { base: '#4d6b3a', a: '#44603a', b: '#5a7a44' },
    mountains: { base: '#4f6a3c', a: '#44603a', b: '#5d7447' },
    desert: { base: '#c8a66c', a: '#b8955c', b: '#d6b67e' },
    coast: { base: '#6f7a58', a: '#5f6b4a', b: '#7e8762' },
  }[landscape] || { base: '#4d6b3a', a: '#44603a', b: '#5a7a44' };
  groundDisc(group, centre, GROUND, 2400, rand, snow, floor ? Math.max(0, Math.min(centre.x - floor.x0, floor.x1 - centre.x, centre.y - floor.y0, floor.y1 - centre.y) - 1) : 0);

  let paved = plaza;
  const onLand = (x, y) => !(x > paved.x0 - 3 && x < paved.x1 + 3 && y > paved.y0 - 3 && y < paved.y1 + 3);
  const haze = new THREE.Color(fogColor);

  /* The horizon. The ground ends at 2.4 km, and beyond it is the sky's flat
     colour: a hard line wherever the fog and the sky differ. A tall open
     cylinder fading from the fog colour at the bottom to nothing at the top
     blends the land into the sky all the way round. */
  {
    const skirtR = 2350; const skirtH = 520;
    const g = new THREE.CylinderGeometry(skirtR, skirtR, skirtH, 64, 6, true).rotateX(Math.PI / 2).translate(centre.x, centre.y, skirtH / 2 - 20);
    const p = g.attributes.position; const cols = new Float32Array(p.count * 4);
    const top = new THREE.Color(skyColor ?? fogColor);
    for (let i = 0; i < p.count; i++) {
      const t = Math.min(1, Math.max(0, (p.getZ(i) + 20) / skirtH));
      const c2 = haze.clone().lerp(top, t);
      cols[i * 4] = c2.r; cols[i * 4 + 1] = c2.g; cols[i * 4 + 2] = c2.b; cols[i * 4 + 3] = 1 - Math.pow(t, 0.7);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 4));
    const skirt = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, side: THREE.BackSide, depthWrite: false, fog: false }));
    skirt.renderOrder = -1;
    group.add(skirt);
  }

  if (landscape === 'city' || landscape === 'coast') {
    const coast = landscape === 'coast';
    // on the coast the town keeps to the landward half; the sea has the rest
    const seaSide = (x, y) => coast && ((x - centre.x) * 0.8 + (y - centre.y) * 0.6) > 160;
    const R = coast ? 620 : 900;
    const blocks = streetGrid(group, { centre, keep: plaza, R, rand, night, q, near: coast ? 300 : 380, skip: seaSide });
    plantFringe(blocks, trees, rand, coast ? 'palm' : 'deciduous', snow ? 0xdfe6ec : 0x4f7a3a, group, centre);
    // the plaza stays tight to the ground; round it, the city's asphalt reads as the street that circles it
    layPlaza(plaza);
    const downtown = coast ? { x: centre.x - 380, y: centre.y + 300 } : { x: centre.x + 60 + rand() * 120, y: centre.y + 430 };
    const built = cityBuildings(group, blocks, { centre, rand, night, scale: coast ? 0.5 : 0.6 + scale * 0.8, downtown, q, parkShare: coast ? 0.14 : 0.1 });
    trees.push(...built.trees);
    stats.buildings = built.count; stats.blocks = blocks.length;
    // trees round the edge of the plaza, evenly spaced
    const pw = plaza.x1 - plaza.x0; const ph = plaza.y1 - plaza.y0; const per = 2 * (pw + ph);
    for (let i = 0; i < 44; i++) {
      let u = (i / 44) * per; let x; let y;
      if (u < pw) { x = plaza.x0 + u; y = plaza.y0 - 4; } else if ((u -= pw) < ph) { x = plaza.x1 + 4; y = plaza.y0 + u; } else if ((u -= ph) < pw) { x = plaza.x1 - u; y = plaza.y1 + 4; } else { u -= pw; x = plaza.x0 - 4; y = plaza.y1 - u; }
      if (!seaSide(x, y)) trees.push({ x, y, h: 6 + rand() * 3, kind: coast ? 'palm' : 'deciduous', rot: rand() * TAU });
    }
    if (coast) {
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200), surf({ color: night ? 0x0a1a2e : 0x1f5c8a, roughness: 0.18, metalness: 0.5 }));
      // the shoreline runs across the ground's far corner; the sea is everything past it
      const nx = 0.8; const ny = 0.6;
      sea.position.set(centre.x + nx * (240 + 2100), centre.y + ny * (240 + 2100), -0.2);
      sea.rotation.z = Math.atan2(ny, nx);
      group.add(sea);
      const beach = new THREE.Mesh(new THREE.PlaneGeometry(90, 2600), std(0xdcc79a));
      beach.position.set(centre.x + nx * 205, centre.y + ny * 205, -0.25); beach.rotation.z = Math.atan2(ny, nx);
      group.add(beach);
      // the promenade's palms and the rocks at the waterline
      for (let i = -40; i < 40; i++) {
        const t = i * 22; const bx = centre.x + nx * 165 - ny * t; const by = centre.y + ny * 165 + nx * t;
        if (Math.hypot(bx - centre.x, by - centre.y) < 1200 && onLand(bx, by)) trees.push({ x: bx, y: by, h: 9 + rand() * 5, kind: 'palm', rot: rand() * TAU });
        const rx = centre.x + nx * (248 + rand() * 12) - ny * (t + rand() * 10); const ry = centre.y + ny * (248 + rand() * 12) + nx * (t + rand() * 10);
        rocks.push({ x: rx, y: ry, s: 1.5 + rand() * 3.5, k: rand(), rot: rand() * TAU, c: 0x6d6a66 });
      }
      const lh = new THREE.Group();
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(3, 4.5, 34, 12).rotateX(Math.PI / 2), std(0xe8e4dc, { roughness: 0.8 }));
      tower.position.z = 17;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 4.1, 5, 12).rotateX(Math.PI / 2), std(0xb3322a));
      band.position.z = 16;
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 4, 12).rotateX(Math.PI / 2), surf({ color: 0x222831, emissive: 0xfff2c0, emissiveIntensity: night ? 2.4 : 0.2 }));
      lamp.position.z = 36;
      lh.add(tower, band, lamp);
      lh.position.set(centre.x + nx * 250 - ny * 260, centre.y + ny * 250 + nx * 260, 0);
      group.add(lh);
      stats.sea = true;
    }
  } else if (landscape === 'suburbs') {
    const blocks = streetGrid(group, { centre, keep: plaza, R: community ? 420 : 520, G: 58, road: 10, rand, night, q, near: 260, cars: true, dashes: false, pavement: 0x5a7a44, roads: true });
    plantFringe(blocks, trees, rand, 'deciduous');
    layPlaza(plaza);
    // houses round each block's edge, facing the street, gardens in the middle
    const { walls } = edgeHouses(group, blocks, { centre, rand, night, snow, q, trees,
      walls: [0xc9b8a0, 0xa8573c, 0xe0d8c8, 0x8c6a4e, 0xb9b2a6, 0xd9c7a6], roofs: [0x4a3a36, 0x6b3a2e, 0x3a3f48, 0x55463c] });
    // a wood beyond the last streets
    for (let i = 0; i < 420; i++) {
      const a = rand() * TAU; const r = 560 + rand() * 500;
      trees.push({ x: centre.x + Math.cos(a) * r, y: centre.y + Math.sin(a) * r, h: 9 + rand() * 8, kind: rand() < 0.35 ? 'pine' : 'deciduous', rot: rand() * TAU });
    }
    // a hill line on the horizon
    terrainRing(group, { centre, r0: 1150, r1: 2100, aSteps: 96, rSteps: 12, haze,
      heightAt: (x, y, r) => Math.max(0, (r - 1150) / 300) * (40 + fbm(x / 500, y / 500, seed) * 160),
      colourAt: (c, x, y, h) => c.set(snow ? 0xdfe6ec : h > 120 ? 0x4a6238 : 0x3e5a30) });
    stats.houses = walls.length;
    stats.nearHouses = walls.filter((w) => Math.hypot(w.x - centre.x, w.y - centre.y) < 250).length;
  } else if (landscape === 'mountains') {
    // foothills and a village road near, the range behind
    const village = streetGrid(group, { centre, keep: plaza, R: 230, G: 60, road: 10, rand, night, q, near: 200, cars: true, dashes: true, pavement: 0x6f7c5a, roads: true });
    plantFringe(village, trees, rand, 'pine');
    layPlaza(plaza);
    // a village of timber chalets with steep dark roofs along its streets
    stats.houses = edgeHouses(group, village, { centre, rand, night, snow, q, trees, per: 3, h: [6, 3], pitch: 3.6, treeKind: 'pine',
      walls: [0x7a5a3c, 0x8c6844, 0x6a4a30, 0xd8ccb4], roofs: [0x3a302c, 0x4a3a34, 0x2e3438] }).walls.length;
    const snowLine = snow ? 60 : 340;
    const rangeH = (x, y, r) => {
      // the range stands back — 700 m to its foot — so from the broadcast gantry its peaks
      // sit above the far roof with sky over them, rather than filling the frame
      const ramp = Math.min(1, Math.max(0, (r - 650) / 520));
      const ridge = ridged(x / 520, y / 520, seed, 6);
      const mass = fbm(x / 1100, y / 1100, seed + 3, 3);
      return ramp * ramp * (ridge * 430 + mass * 160) + Math.max(0, (r - 300) / 180) * fbm(x / 160, y / 160, seed + 9, 3) * 26 - 1;
    };
    terrainRing(group, { centre, r0: 250, r1: 2300, aSteps: quality === 'low' ? 90 : 200, rSteps: quality === 'low' ? 16 : 34, heightAt: rangeH, haze, hazeMax: 0.5,
      colourAt: (c, x, y, h, slope) => {
        const n = fbm(x / 60, y / 60, seed + 5, 2);
        const line = snowLine + (n - 0.5) * 70;
        if (h > line && slope < 0.62) return c.set(0xeef2f6);                                    // snow on anything it can lie on
        if (slope > 0.5 || h > line - 40) return c.setRGB(0.3 + n * 0.08, 0.29 + n * 0.07, 0.28 + n * 0.06);   // bare rock
        if (h > 130) return c.set(night ? 0x2c3a24 : 0x6a7a4a);                                   // alpine meadow
        return c.set(snow ? 0xdfe6ec : 0x2f4a26);                                                 // forest floor
      } });
    // pines on the lower slopes (sitting on the terrain), rocks on the steep bits
    let placed = 0;
    for (let i = 0; i < 6000 && placed < q.trees; i++) {
      const a = rand() * TAU; const r = 110 + Math.pow(rand(), 1.2) * 1100;
      const x = centre.x + Math.cos(a) * r; const y = centre.y + Math.sin(a) * r;
      if (!onLand(x, y)) continue;
      const h = rangeH(x, y, r);
      if (h > 150) continue;
      if (r < 230 && rand() < 0.6) continue;
      trees.push({ x, y, z: Math.max(-0.3, h - 0.5), h: 8 + rand() * 9, kind: 'pine', rot: rand() * TAU }); placed++;
    }
    for (let i = 0; i < q.rocks; i++) {
      const a = rand() * TAU; const r = 150 + rand() * 900;
      const x = centre.x + Math.cos(a) * r; const y = centre.y + Math.sin(a) * r;
      if (!onLand(x, y)) continue;
      rocks.push({ x, y, z: Math.max(-0.3, rangeH(x, y, r) - 0.4), s: 1 + rand() * (r > 400 ? 7 : 2.5), k: rand(), rot: rand() * TAU, c: 0x77736d });
    }
    stats.snowLine = snowLine;
  } else if (landscape === 'desert') {
    const oasis = streetGrid(group, { centre, keep: plaza, R: 260, G: 70, road: 16, rand, night, q, near: 240, cars: true, dashes: true, pavement: 0xc2ab82, roads: true });
    plantFringe(oasis, trees, rand, 'palm');
    layPlaza(plaza);
    // a few low sandstone buildings by the ground
    const low = [];
    for (let i = 0; i < 70; i++) {
      const a = rand() * TAU; const r = 110 + rand() * 160;
      const x = centre.x + Math.cos(a) * r; const y = centre.y + Math.sin(a) * r;
      if (!onLand(x, y)) continue;
      low.push({ x, y, z: 0, sx: 10 + rand() * 14, sy: 10 + rand() * 14, sz: 5 + rand() * 9, c: [0xd8c39a, 0xcdb58a, 0xe4d5b4, 0xbfa278][Math.floor(rand() * 4)] });
    }
    sectored(group, new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5), buildingMaterial(night), low, centre);
    const duneH = (x, y, r) => {
      const ramp = Math.min(1, Math.max(0, (r - 280) / 260));
      const d = ridged(x / 300 + y / 900, y / 170, seed, 4);        // stretched: dunes run in lines
      // mesas: flat-topped rock, stepping up sharply out of the sand
      const m = r > 850 ? Math.min(1, Math.max(0, (fbm(x / 380, y / 380, seed + 7, 3) - 0.52) * 30)) : 0;
      return ramp * d * 58 + m * (150 + fbm(x / 90, y / 90, seed + 8, 2) * 30) - 0.6;
    };
    terrainRing(group, { centre, r0: 240, r1: 2300, aSteps: quality === 'low' ? 80 : 180, rSteps: quality === 'low' ? 16 : 30, heightAt: duneH, flat: false, haze, hazeMax: 0.3,
      colourAt: (c, x, y, h, slope) => {
        const n = fbm(x / 80, y / 80, seed + 2, 2);
        if (h > 80 || (h > 40 && slope > 0.45)) { const band = Math.floor(h / 22) % 2 ? 0.9 : 1; return c.setRGB((0.44 + n * 0.08) * band, (0.21 + n * 0.05) * band, (0.13 + n * 0.03) * band); }   // mesa rock, in bands
        return c.setRGB(0.66 + n * 0.07 - slope * 0.14, 0.5 + n * 0.06 - slope * 0.14, 0.3 + n * 0.04);
      } });
    for (let i = 0; i < 90; i++) {
      const a = rand() * TAU; const r = 80 + rand() * 240;
      const x = centre.x + Math.cos(a) * r; const y = centre.y + Math.sin(a) * r;
      if (onLand(x, y)) trees.push({ x, y, h: 8 + rand() * 7, kind: 'palm', rot: rand() * TAU });
    }
    for (let i = 0; i < q.rocks; i++) {
      const a = rand() * TAU; const r = 90 + rand() * 1000;
      const x = centre.x + Math.cos(a) * r; const y = centre.y + Math.sin(a) * r;
      if (onLand(x, y)) rocks.push({ x, y, z: Math.max(-0.3, duneH(x, y, r) - 0.5), s: 0.8 + rand() * (r > 400 ? 6 : 2), k: rand(), rot: rand() * TAU, c: 0x9a7d5a });
    }
  }

  const treeList = nearest(trees.filter((t) => onLand(t.x, t.y)), q.trees, centre);
  stats.trees = plantTrees(group, treeList, centre, { night, snow, haze, lodR: q.light ? 110 : 280 });
  stats.rocks = scatterRocks(group, nearest(rocks, q.rocks, centre), centre, 0x7a7470, haze);
  group.userData.stats = stats;
  return { group, stats };
}
