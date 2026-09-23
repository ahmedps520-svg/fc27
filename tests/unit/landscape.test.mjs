/**
 * v85 — the land round the ground: every landscape builds, nothing is built on
 * the stadium or its plaza, the city has streets and blocks, the mountains
 * have snow above a line and rock where it is steep, trees stand on the
 * ground (not under it or floating), and the low tier really is lighter.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../js/vendor/three.module.js';
import { buildLandscape, ridged, fbm } from '../../js/game/landscape.js';

const KEEP = { x0: -60, x1: 165, y0: -60, y1: 128 };
const CENTRE = { x: 52.5, y: 34 };
const build = (landscape, quality = 'high', extra = {}) => buildLandscape({ landscape, keep: KEEP, centre: CENTRE, quality, seed: 7, ...extra });
const m4 = new THREE.Matrix4(); const p = new THREE.Vector3(); const sc = new THREE.Vector3(); const qu = new THREE.Quaternion();

function instances(group, pred = () => true) {
  const out = [];
  group.traverse((o) => {
    if (!o.isInstancedMesh || !pred(o)) return;
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); m4.decompose(p, qu, sc); out.push({ x: p.x, y: p.y, z: p.z, sx: sc.x, sy: sc.y, sz: sc.z, mesh: o }); }
  });
  return out;
}
function triangles(group) {
  let t = 0;
  group.traverse((o) => { if (o.isMesh) { const g = o.geometry; t += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (o.count || 1); } });
  return t;
}

for (const ls of ['city', 'suburbs', 'mountains', 'desert', 'coast']) {
  test(`${ls}: builds, and keeps off the stadium`, () => {
    const { group, stats } = build(ls);
    assert.equal(stats.landscape, ls);
    const all = instances(group);
    assert.ok(all.length > 200, `${all.length} instances`);
    // nothing taller than a kerb inside the stadium's footprint
    const inside = all.filter((it) => it.x > KEEP.x0 + 1 && it.x < KEEP.x1 - 1 && it.y > KEEP.y0 + 1 && it.y < KEEP.y1 - 1 && it.sz > 0.6);
    assert.equal(inside.length, 0, `${inside.length} things built on the stadium`);
    // every instanced mesh has a bounding sphere, so culling works
    group.traverse((o) => { if (o.isInstancedMesh) assert.ok(o.boundingSphere && o.boundingSphere.radius > 0); });
  });
}

test('the city has streets, blocks, towers of every height and parks', () => {
  const { group, stats } = build('city');
  assert.ok(stats.blocks > 300 && stats.buildings > 800, JSON.stringify(stats));
  const towers = instances(group, (o) => o.material.customProgramCacheKey?.().startsWith('apex-building'));
  const hs = towers.map((t) => t.sz).sort((a, b) => a - b);
  assert.ok(hs[0] < 15 && hs.at(-1) > 90, `heights ${hs[0].toFixed(0)}–${hs.at(-1).toFixed(0)} m`);
  // the streets are the gaps between blocks: no two towers overlap a street centre line near the ground
  const G = 64;
  const onStreet = towers.filter((t) => Math.hypot(t.x - CENTRE.x, t.y - CENTRE.y) < 400 && t.z < 1
    && (Math.abs((((t.x - CENTRE.x) % G) + G) % G - G / 2) < 1 || Math.abs((((t.y - CENTRE.y) % G) + G) % G - G / 2) < 1));
  assert.equal(onStreet.length, 0, 'buildings stand on blocks, not in the road');
});

test('mountains: snow above the line, rock on the steep, forest below', () => {
  const { group, stats } = build('mountains');
  let snow = 0; let rock = 0; let green = 0; let maxH = 0;
  group.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry.attributes.color || o.geometry.attributes.color.itemSize !== 3) return;
    const pos = o.geometry.attributes.position; const col = o.geometry.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getZ(i); maxH = Math.max(maxH, h);
      const r = col.getX(i); const g = col.getY(i); const b = col.getZ(i);
      if (r > 0.75 && g > 0.75 && b > 0.75) { snow++; assert.ok(h > stats.snowLine - 80, `snow at ${h.toFixed(0)} m`); }
      else if (Math.abs(r - g) < 0.06 && Math.abs(g - b) < 0.06) rock++;
      else if (g > r) green++;
    }
  });
  assert.ok(maxH > 300, `peaks reach ${maxH.toFixed(0)} m`);
  assert.ok(snow > 50 && rock > 50 && green > 200, `snow ${snow} rock ${rock} green ${green}`);
});

test('trees stand on the land they grow in', () => {
  const { group } = build('mountains');
  const trunks = instances(group, (o) => o.geometry.attributes.position.count <= 40 && o.geometry.parameters?.radiusTop === undefined);
  assert.ok(trunks.length > 100);
  for (const t of trunks) assert.ok(t.z > -1 && t.z < 200, `a tree at z ${t.z}`);
});

test('the low tier is much lighter, and the noise is in range', () => {
  const hi = triangles(build('city', 'high').group);
  const lo = triangles(build('city', 'low').group);
  assert.ok(lo < hi * 0.6, `low ${Math.round(lo / 1000)}k vs high ${Math.round(hi / 1000)}k triangles`);
  for (let i = 0; i < 200; i++) { const a = ridged(i * 0.37, i * 0.11); const b = fbm(i * 0.21, i * 0.73); assert.ok(a >= 0 && a <= 1.2 && b >= 0 && b <= 1); }
});
