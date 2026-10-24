/**
 * v199 — the built figures batched into instanced meshes (game/figureBatch.js):
 * one mesh per part shape, every visible part's world matrix and colour in it,
 * the parts themselves moved off the drawn layer, the shirt left alone,
 * hidden and off-screen figures skipped, and nothing written past a buffer.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';
import * as THREE from '../../js/vendor/three.module.js';
import { buildPlayer } from '../../js/game/rig.js';
import { createFigureBatch } from '../../js/game/figureBatch.js';

const figure = (x, y, kit = 0xd7263d) => {
  const r = buildPlayer(new THREE.Color(kit), new THREE.Color(0x151515), new THREE.Color(0xc99a74), new THREE.Color(0x1d140d), new THREE.Color(kit), { height: 1, girth: 1, shoulders: 1 });
  // a crude pose: every part somewhere on the figure, standing at (x, y)
  let i = 0;
  for (const p of Object.values(r.parts)) { p.position.set(x, y, 0.1 + (i++) * 0.07); p.scale.setScalar(0.1); }
  return r;
};

test('one mesh per part shape; each part drawn through it, in its colour; the shirt drawn as it was', () => {
  const scene = new THREE.Scene();
  const batch = createFigureBatch(scene, 4);
  const a = figure(10, 10); const b = figure(20, 10, 0x1e5bd8);
  for (const r of [a, b]) { scene.add(r.grp); assert.ok(batch.add(r)); }
  batch.sync(null);
  const ims = scene.children.filter((o) => o.isInstancedMesh);
  const shapes = new Set(Object.entries(a.parts).filter(([k]) => k !== 'torso').map(([, p]) => p.geometry));
  assert.equal(ims.length, shapes.size, 'one instanced mesh per shared shape');
  assert.ok(ims.length <= 10, `${ims.length} draws for every figure's limbs, joints, boots and hair`);
  // the parts no longer draw themselves; the shirt still does
  for (const [k, p] of Object.entries(a.parts)) assert.equal(p.layers.test(new THREE.Layers()), k === 'torso', k);
  // every visible part of both figures is in its shape's mesh, at its own world matrix
  const visible = (r) => Object.entries(r.parts).filter(([k, p]) => k !== 'torso' && p.visible).length;
  assert.equal(ims.reduce((t, m) => t + m.count, 0), visible(a) + visible(b));
  const limb = a.parts.thighL; const im = ims.find((m) => m.geometry === limb.geometry);
  const got = new THREE.Matrix4(); const found = [];
  const same = (m, n) => m.elements.every((v, j) => Math.abs(v - n.elements[j]) < 1e-5);   // stored as 32-bit floats
  for (let i = 0; i < im.count; i++) { im.getMatrixAt(i, got); if (same(got, limb.matrixWorld)) found.push(i); }
  assert.equal(found.length, 1, 'the left thigh is in the capsule mesh, where it stands');
  const c = new THREE.Color(); im.getColorAt(found[0], c);
  assert.equal(c.getHex(), limb.material.color.getHex(), 'in its own colour');
});

test('hidden figures and figures well off screen draw nothing; a substitute leaves', () => {
  const scene = new THREE.Scene();
  const batch = createFigureBatch(scene, 8);
  const near = figure(52, 34); const far = figure(900, 900); const off = figure(55, 34);
  for (const r of [near, far, off]) { scene.add(r.grp); batch.add(r); }
  off.grp.visible = false;                                   // sent off, or swapped for a scanned model
  const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 400);
  cam.up.set(0, 0, 1); cam.position.set(52, -30, 20); cam.lookAt(52, 34, 0); cam.updateMatrixWorld();
  batch.sync(cam);
  const total = () => scene.children.filter((o) => o.isInstancedMesh).reduce((t, m) => t + m.count, 0);
  const one = Object.entries(near.parts).filter(([k, p]) => k !== 'torso' && p.visible).length;
  assert.equal(total(), one, 'only the figure in shot');
  off.grp.visible = true; batch.sync(cam);
  assert.equal(total(), one * 2);
  batch.remove(off); batch.sync(cam);
  assert.equal(total(), one, 'a substitute replaced');
  // hidden parts (a hand on a far-off LOD) are left out
  near.parts.handL.visible = false; batch.sync(cam);
  assert.equal(total(), one - 1);
});

test('never past the end of a buffer, and full means full', () => {
  const scene = new THREE.Scene();
  const batch = createFigureBatch(scene, 2);
  const rs = [figure(1, 1), figure(2, 2), figure(3, 3)];
  for (const r of rs) scene.add(r.grp);
  assert.equal(batch.add(rs[0]), true); assert.equal(batch.add(rs[1]), true);
  assert.equal(batch.add(rs[2]), false, 'capacity reached');
  batch.sync(null);
  for (const m of scene.children.filter((o) => o.isInstancedMesh)) assert.ok(m.count <= m.instanceMatrix.count, `${m.count} ≤ ${m.instanceMatrix.count}`);
});
