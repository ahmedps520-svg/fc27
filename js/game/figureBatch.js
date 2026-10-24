/**
 * v199: the built figures, drawn in a handful of calls.
 *
 * A built player (rig.js `buildPlayer`) is about twenty-five meshes — thighs,
 * shins, boots, knees, hips, arms, sleeves, hands, neck, head, hair, a face —
 * each posed every frame by `posePlayer`, and each its own draw call, twice
 * over with the shadow pass. Twenty-three figures made that about 1,100 of
 * Medium's 1,400 draw calls a frame, and on a phone it is the draw calls,
 * not the triangles, that cost the frame.
 *
 * Nothing about the posing changes. The parts keep their transforms and
 * their per-frame visibility; they are moved to a layer the camera does not
 * draw (three.js skips a layer for the shadow pass too), and once a frame
 * `sync` copies each part's world matrix into one InstancedMesh per part
 * shape — every figure's left and right thighs, shins and forearms share one
 * capsule, so they are all one draw. Each part keeps its colour as the
 * instance's colour. The shirt stays its own mesh: it carries the player's
 * number and name, and on High its cloth ripple.
 *
 * Each frame the figures that are showing and near the lens are packed to the
 * front of every instanced mesh, with their colours, and `count` set to how
 * many there are — so a figure that is hidden (sent off, swapped for a
 * scanned model, between replays) or well off screen costs nothing at all,
 * as it cost nothing when three.js culled each part on its own. The margin
 * keeps a player just out of shot casting his shadow into it.
 */
import * as THREE from '../vendor/three.module.js';

const HIDDEN = 31;                   // the layer the posed parts live on; no camera draws it
const REACH = 4;                     // metres round a figure that still count as in shot (his shadow, a raised arm)
const KEEP = new Set(['torso']);     // drawn as they are: the shirt has the number on it

export function createFigureBatch(scene, capacity = 28) {
  const meshes = new Map();          // geometry → InstancedMesh
  const figs = new Map();            // rig → [[part, mesh]]
  const used = new Map();            // mesh → instances written this frame
  const frustum = new THREE.Frustum();
  const view = new THREE.Matrix4();
  const ball = new THREE.Sphere();

  /** One instanced mesh per part shape, with room for `perFigure` of it on every figure (nine limbs share the capsule). */
  function meshFor(part, perFigure) {
    let im = meshes.get(part.geometry);
    if (im) return im;
    const src = part.material;
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: src.roughness ?? 0.75, metalness: src.metalness ?? 0.02, envMapIntensity: src.envMapIntensity ?? 0.55,
    });
    im = new THREE.InstancedMesh(part.geometry, mat, capacity * perFigure);
    im.name = 'figure-batch';
    im.castShadow = true;
    im.frustumCulled = false;        // the instances span the pitch; their bounds are the whole ground anyway
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.setColorAt(0, part.material.color);          // allocates the colour buffer before the first draw compiles the shader
    im.instanceColor.setUsage(THREE.DynamicDrawUsage);
    // visible (with nothing in it) until the first sync, so the loading screen's warm-up compiles
    // its shader — hidden, it compiled the first time a figure came into view, a stall mid-match
    im.count = 0;
    meshes.set(part.geometry, im);
    scene.add(im);
    return im;
  }

  /** Take a built figure into the batch. Its parts stop drawing themselves. */
  function add(rig) {
    if (!rig?.parts || figs.has(rig) || figs.size >= capacity) return false;
    const mine = Object.entries(rig.parts).filter(([name, part]) => !KEEP.has(name) && part?.isMesh && part.material?.color).map(([, part]) => part);
    const per = new Map();
    for (const part of mine) per.set(part.geometry, (per.get(part.geometry) || 0) + 1);
    const parts = [];
    for (const part of mine) {
      parts.push([part, meshFor(part, Math.max(per.get(part.geometry), 12))]);
      part.layers.set(HIDDEN);
    }
    figs.set(rig, parts);
    return true;
  }

  /** A figure leaving the match (a substitute replacing it). */
  function remove(rig) { figs.delete(rig); }

  const shown = (o) => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };

  /** Once a frame, after posing and before drawing: `camera` decides who is near enough the shot to draw. */
  function sync(camera) {
    if (camera) {
      camera.updateMatrixWorld();
      frustum.setFromProjectionMatrix(view.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    }
    used.clear();
    for (const [rig, parts] of figs) {
      if (!shown(rig.grp)) continue;
      rig.grp.updateMatrixWorld(true);
      // the group is only a pivot (rig.js turns it about the player); the parts stand in world space, so ask the shirt where he is
      if (camera) { ball.center.setFromMatrixPosition((rig.parts.torso || rig.grp).matrixWorld); ball.radius = REACH; if (!frustum.intersectsSphere(ball)) continue; }
      for (const [part, im] of parts) {
        if (!part.visible) continue;
        const n = used.get(im) || 0;
        if (n >= im.instanceMatrix.count) continue;      // never past the end of the buffer
        im.setMatrixAt(n, part.matrixWorld);
        im.setColorAt(n, part.material.color);
        used.set(im, n + 1);
      }
    }
    for (const im of meshes.values()) {
      const n = used.get(im) || 0;
      im.count = n; im.visible = n > 0;
      if (n) { im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; }
    }
  }

  function dispose() {
    for (const im of meshes.values()) { scene.remove(im); im.material.dispose(); im.dispose?.(); }
    meshes.clear(); figs.clear();
  }

  return { add, remove, sync, dispose, get draws() { return [...meshes.values()].filter((m) => m.visible).length; }, get figures() { return figs.size; } };
}
