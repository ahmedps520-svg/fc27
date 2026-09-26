/**
 * v124 — the built figure wears the portrait's hair (components/face.js
 * `style` 0–5 and `beard`) instead of one cap for everyone.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const THREE = await import('../../js/vendor/three.module.js');
const { hairGeometry, buildPlayer } = await import('../../js/game/rig.js');
const { faceOf } = await import('../../js/components/face.js');

test('six shapes, each with and without a beard, all different and cached', () => {
  const seen = new Set();
  for (let st = 0; st < 6; st++) {
    for (const beard of [false, true]) {
      const g = hairGeometry(st, beard);
      assert.equal(hairGeometry(st, beard), g, 'built once, shared');
      const pos = g.attributes.position.array;
      for (const v of pos) assert.ok(Number.isFinite(v));
      g.computeBoundingBox();
      const b = g.boundingBox;
      // it stays on a head: nothing reaches past the shoulders or far off the crown
      assert.ok(b.max.x < 1.6 && b.min.x > -1.6 && b.max.z < 1.6 && b.min.z > -1.4, `style ${st}${beard ? '+beard' : ''} box ${JSON.stringify(b)}`);
      seen.add(`${pos.length}:${pos[0].toFixed(3)}:${b.max.z.toFixed(3)}:${b.min.z.toFixed(3)}`);
    }
    assert.ok(hairGeometry(st, true).attributes.position.count > hairGeometry(st, false).attributes.position.count, 'a beard adds to the mesh');
  }
  assert.equal(seen.size, 12, 'twelve distinct looks');
  assert.equal(hairGeometry(8), hairGeometry(2), 'styles wrap');
});

test('a figure is built with its portrait hair, as one mesh', () => {
  const c = new THREE.Color('#888');
  const look = faceOf({ id: 'p-123' });
  const rig = buildPlayer(c, c, c, c, c, { height: 1, girth: 1, shoulders: 1 }, { hairStyle: look.style, beard: look.beard });
  assert.equal(rig.parts.hair.geometry, hairGeometry(look.style, look.beard));
  const plain = buildPlayer(c, c, c, c, c, { height: 1, girth: 1, shoulders: 1 });
  assert.equal(plain.parts.hair.geometry, hairGeometry(0, false), 'no look given: the crop');
});

test('a squad has a spread of looks, not eleven of one', () => {
  const styles = new Set(); let beards = 0;
  for (let i = 0; i < 60; i++) { const f = faceOf({ id: `card-${i}` }); styles.add(f.style); beards += f.beard ? 1 : 0; }
  assert.equal(styles.size, 6);
  assert.ok(beards > 3 && beards < 30, `${beards} beards in 60`);
});
