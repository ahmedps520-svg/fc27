/**
 * Skinned player models.
 *
 * One glTF character is loaded once and cloned twenty-two times. Everything
 * that makes those twenty-two look like different people is done with shader
 * uniforms rather than extra assets: one texture, one program, a handful of
 * colours per player. Downloading a second character would cost megabytes;
 * this costs nothing.
 *
 * The asset is y-up and in centimetres, as everything out of Mixamo is. The
 * match is z-up and in metres, so every clone is tipped and scaled on the way
 * in — see `makeRig`.
 */
import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from '../vendor/jsm/utils/SkeletonUtils.js';

// Resolved against this module rather than the page, so the asset is found
// whatever URL the game is opened from.
const MODEL_URL = new URL('../../assets/candidates/player.glb', import.meta.url).href;

/**
 * What the match is doing, and which clip says it. Several names are listed
 * per action because the set of clips depends on what was downloaded — the
 * first one present wins, and a missing action falls back to standing.
 *
 * Only states the simulation actually publishes are listed. The asset carries
 * kicks, tackles, headers and keeper catches too, and they are one line each
 * to add here — but the match does not yet flag those moments, and building a
 * mixer action per player for a clip that can never play is pure cost.
 */
const ACTIONS = {
  idle: ['offensive_idle', 'idle'],
  run: ['jog_forward', 'run_forward', 'running'],
  keeperIdle: ['goalkeeper_idle', 'goalkeeper_idle_2_', 'offensive_idle'],
  keeperDive: ['goalkeeper_diving_save', 'goalkeeper_diving_save_2_'],
};

/**
 * There is no separate sprint clip in this set, so running is one clip played
 * faster or slower to match the ground speed. Doing it this way also cures foot
 * sliding, which a fixed-rate jog always has at every speed but one.
 *
 * The first attempt reached for `strike_foward_jog`, which is a jog *with a
 * strike in it* — so every sprinting player kicked at thin air, continuously.
 * Nothing in this file should ever map a movement state onto a clip whose name
 * contains an action.
 */
const RUN_CLIP_SPEED = 3.5;      // metres per second the jog clip reads as
const RUN_RATE = [0.75, 1.85];   // how far the playback rate may be pushed

/* ------------------------------------------------------------------ *
 * Per-player variation
 * ------------------------------------------------------------------ */

// Skin is a multiplier over the character's own texture, so these stay close
// to 1: they shade the same face rather than repaint it. Each entry is then
// nudged per player, so two men on the same base tone still are not twins.
const SKINS = [
  [1.06, 0.98, 0.92], [0.98, 0.9, 0.82], [0.86, 0.74, 0.62],
  [0.7, 0.56, 0.44], [0.55, 0.42, 0.33], [1.02, 0.92, 0.85],
  [0.78, 0.63, 0.5], [0.44, 0.33, 0.26],
];
const HAIRS = [0x1b1512, 0x2e211a, 0x5a3a22, 0x8a6236, 0x120f0e, 0x3d2a1c,
  0xa07540, 0x6b4a2e];

/**
 * Socks are the one part of a strip that is routinely not the strip colour —
 * plenty of sides play in white or black socks with a coloured shirt — so they
 * are drawn from a small set instead of being locked to the kit.
 */
const SOCKS = ['socks', 'shorts', 'white', 'black'];

/** Deterministic per-player numbers, so a given footballer is always himself. */
function traits(ref, index) {
  let h = 2166136261;
  const key = `${ref?.id || ''}${ref?.name || ''}${index}`;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // `bit` reads a small window of the hash as 0..1. Windows are chosen not to
  // overlap, or two traits would move together across the whole squad.
  const bit = (n, m) => ((h >>> n) & m) / m;

  // A tone off the list, then shifted a little warmer or cooler. Six palettes
  // over twenty-two men would put three or four on each; the jitter means the
  // ones that share a palette still do not share a face.
  const base = SKINS[h % SKINS.length];
  const warm = 0.94 + bit(3, 15) * 0.12;
  const lift = 0.93 + bit(26, 15) * 0.14;

  return {
    skin: [base[0] * warm * lift, base[1] * lift, base[2] / warm * lift],
    hair: HAIRS[(h >>> 6) % HAIRS.length],
    bald: bit(7, 15) > 0.86,
    height: 0.965 + bit(11, 31) * 0.075,
    build: 0.95 + bit(16, 15) * 0.12,
    // Face shape, as far as a rig with no facial bones allows: the head can be
    // made longer, narrower or heavier in the jaw, which is enough to tell two
    // players apart at match camera distance.
    headSize: 0.95 + bit(21, 7) * 0.1,
    headLong: 0.96 + bit(24, 7) * 0.09,
    headWide: 0.95 + bit(9, 7) * 0.1,
    // nose and brow sit on the head mesh, so they ride the head's depth axis
    noseDepth: 0.94 + bit(13, 7) * 0.13,
    neck: 0.94 + bit(18, 3) * 0.1,
    shoulders: 0.94 + bit(28, 7) * 0.13,
    legs: 0.97 + bit(15, 3) * 0.06,
    socks: SOCKS[(h >>> 12) % SOCKS.length],
    boots: BOOTS[(h >>> 19) % BOOTS.length],
  };
}

// Boots are the one thing footballers genuinely please themselves about.
const BOOTS = [0x101014, 0xf4f4f0, 0xe8ff3a, 0xff5a1f, 0x1c7bff, 0xff2e88, 0x22c07a];

const SOCK_COLOURS = { white: 0xf2f2ee, black: 0x1a1a1c };

/** Which colour this player's socks actually are. */
function sockColour(kit, trait) {
  if (trait.socks === 'shorts') return kit.shorts;
  if (trait.socks === 'socks') return kit.socks;
  return new THREE.Color(SOCK_COLOURS[trait.socks]);
}

/* ------------------------------------------------------------------ *
 * Painting
 *
 * The character arrives as separate meshes for shirt, shorts, socks, body,
 * boots and hair, all sharing two materials. That split is what makes a kit
 * possible at all: the garment is known from the mesh it is on, so nothing has
 * to be guessed from the pixels, and a shirt can never leak onto a face.
 * ------------------------------------------------------------------ */

/**
 * Recolour a garment, keeping the cloth's own light and shade.
 *
 * A plain material tint multiplies the texture, which turns a mid-grey strip
 * muddy and a dark one black. This takes only the texture's *brightness* and
 * puts the new colour under it, so folds, seams and shadow survive the change.
 */
function recolour(material, colour) {
  const mat = material.clone();
  mat.userData.tint = { uTint: { value: new THREE.Color(colour) } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.tint);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uTint;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        {
          float shade = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = uTint * (0.34 + shade * 0.92);
        }`);
  };
  // three keys its compiled programs by material type, and these variants are
  // the same type with different code — they need to be told apart
  mat.customProgramCacheKey = () => 'apex-tint-v2';
  return mat;
}

/** Shift a skin tone without repainting the face: a multiply, staying near 1. */
function tintSkin(material, skin) {
  const mat = material.clone();
  mat.userData.tint = { uSkin: { value: new THREE.Vector3(...skin) } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.tint);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uSkin;')
      .replace('#include <map_fragment>', '#include <map_fragment>\n\tdiffuseColor.rgb *= uSkin;');
  };
  mat.customProgramCacheKey = () => 'apex-skin-v2';
  return mat;
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */
let cached = null;

/**
 * @returns {Promise<null|{scene: THREE.Object3D, clips: Map<string, THREE.AnimationClip>, scale: number}>}
 *   null when there is no model to load — the caller then keeps the built-in
 *   figures, which is also what happens offline before the file is cached.
 */
export function loadPlayerModel() {
  if (cached) return cached;
  cached = new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const height = box.getSize(new THREE.Vector3()).y || 180;
    const clips = new Map();
    for (const clip of gltf.animations) clips.set(clip.name.toLowerCase(), clip);
    return { scene: gltf.scene, clips, scale: 1.8 / height, sourceHeight: height };
  }).catch(() => null);
  return cached;
}

const pick = (clips, names) => {
  for (const n of names) {
    const c = clips.get(n.toLowerCase());
    if (c) return c;
  }
  return null;
};

/* ------------------------------------------------------------------ *
 * A single player
 * ------------------------------------------------------------------ */
export function makeRig(model, { kit, ref, index, isGK }) {
  const trait = traits(ref, index);
  const figure = cloneSkinned(model.scene);

  /* The asset is y-up centimetres; the match is z-up metres. That correction
   * lives on an inner object rather than on the one the match drives, because
   * the two rotations do not commute: tipping the model and *then* spinning it
   * about its own axis rolls the player onto the grass instead of turning him
   * to face where he is running. Outer turns in the world, inner sits still. */
  const root = new THREE.Object3D();
  figure.rotation.set(Math.PI / 2, 0, 0);
  figure.scale.setScalar(model.scale * trait.height);
  root.add(figure);

  const strip = {
    shirt: kit.shirt,
    shorts: kit.shorts,
    socks: sockColour(kit, trait),
    boots: trait.boots,
  };

  figure.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    o.castShadow = true;
    o.frustumCulled = false;             // the bounding box is the bind pose, not the stride
    // Garments are separate meshes on the source character, named for what they
    // are. Anything unrecognised is left exactly as the artist textured it.
    const part = o.name || '';
    if (/eyelash/i.test(part)) return;
    if (/hair/i.test(part)) {
      if (trait.bald) { o.visible = false; return; }
      o.material = recolour(o.material, trait.hair);
    } else if (/shirt|jersey/i.test(part)) o.material = recolour(o.material, strip.shirt);
    else if (/short/i.test(part)) o.material = recolour(o.material, strip.shorts);
    else if (/sock/i.test(part)) o.material = recolour(o.material, strip.socks);
    else if (/shoe|boot/i.test(part)) o.material = recolour(o.material, strip.boots);
    else if (/body|skin|head/i.test(part)) o.material = tintSkin(o.material, trait.skin);
  });

  /* --------------------------- build and face --------------------------- *
   * One character mesh cannot be re-sculpted at runtime, but the bones it is
   * skinned to can be scaled, and the skin follows. That is enough for height,
   * frame and a face that is longer or wider or heavier in the nose — which is
   * what actually separates two men seen from the touchline.
   *
   * Bone axes are Mixamo's: Y runs down the bone (up the body for the spine),
   * X is across the shoulders, Z is front-to-back. Scaling is applied to the
   * bone's local scale, which the animation tracks never touch — clips write
   * position and quaternion only — so nothing here is undone by the mixer.
   * The names carry a rig-version digit that varies between Mixamo exports.  */
  const bone = (n) => figure.getObjectByName(`mixamorig${n}`)
    || figure.getObjectByName(`mixamorig5${n}`);
  const hips = bone('Hips');
  const head = bone('Head');
  const spine = bone('Spine2');
  const neck = bone('Neck');
  if (head) {
    head.scale.set(
      trait.headSize * trait.headWide,
      trait.headSize * trait.headLong,
      trait.headSize * trait.noseDepth,
    );
  }
  if (neck) neck.scale.set(1, trait.neck, 1);
  if (spine) spine.scale.set(trait.build * trait.shoulders, 1, trait.build);
  // Limbs vary in thickness but never in length: a longer thigh would lift the
  // boot off the grass, since the clip decides where the foot lands and the
  // match decides where the man is.
  for (const side of ['Left', 'Right']) {
    const leg = bone(`${side}UpLeg`);
    const arm = bone(`${side}Arm`);
    if (leg) leg.scale.set(trait.legs, 1, trait.legs);
    if (arm) arm.scale.set(trait.build, 1, trait.build);
  }

  // bound to the figure, not the wrapper: the clips address bones by name and
  // the wrapper is not part of the rig they were authored against
  const mixer = new THREE.AnimationMixer(figure);
  const actions = {};
  for (const [key, names] of Object.entries(ACTIONS)) {
    const clip = pick(model.clips, names);
    if (!clip) continue;
    const action = mixer.clipAction(clip);
    action.enabled = true;
    actions[key] = action;
  }
  // everyone starts on a different frame of the same idle, or the whole team
  // breathes in unison
  const startAt = (index % 11) / 11;

  return {
    root, mixer, actions, hips, trait, isGK,
    current: null,
    offset: startAt,
  };
}

/** Which action suits what this player is doing right now. */
export function actionFor(rig, speed, p) {
  if (p.diveT > 0) return rig.actions.keeperDive ? 'keeperDive' : 'idle';
  if (speed > 1.1) return 'run';
  return rig.isGK && rig.actions.keeperIdle ? 'keeperIdle' : 'idle';
}

/**
 * Place and animate one player for this frame.
 * @param {number} dt seconds since the last frame
 */
export function poseRig(rig, p, dt) {
  const speed = Math.hypot(p.vx, p.vy);
  const want = actionFor(rig, speed, p);

  // Walk, jog and sprint are all this one clip, taken at the rate the legs
  // would actually be turning over at that speed.
  if (want === 'run' && rig.actions.run) {
    rig.actions.run.timeScale =
      Math.min(RUN_RATE[1], Math.max(RUN_RATE[0], speed / RUN_CLIP_SPEED));
  }

  if (want !== rig.current) {
    const next = rig.actions[want] || rig.actions.idle;
    if (next) {
      const prev = rig.current && rig.actions[rig.current];
      next.reset();
      next.play();
      if (prev && prev !== next) next.crossFadeFrom(prev, 0.22, true);
      else next.fadeIn(0.15);
      if (rig.current === null) next.time = next.getClip().duration * rig.offset;
    }
    rig.current = want;
  }

  rig.mixer.update(dt);

  // The clips walk the character across the floor; the match decides where a
  // player is, so the root motion is cancelled by pinning the hips to the spot
  // the simulation put him on.
  rig.root.position.set(p.x, p.y, 0);
  // The character's own forward is -Y once it has been tipped upright, so the
  // heading is a quarter turn ahead of the direction the match is steering him.
  rig.root.rotation.z = Math.atan2(p.dirY, p.dirX) + Math.PI / 2;
  if (rig.hips) {
    rig.hips.position.x = 0;
    rig.hips.position.z = 0;
  }
}
