/**
 * The cinematic post pass.
 *
 * Everything expensive-looking about a modern sports broadcast that can be done
 * from a colour buffer and a depth buffer, in one shader:
 *
 *   - **Ambient occlusion.** The single biggest realism win available here.
 *     Without it a player and his shadow are the only thing tying him to the
 *     grass, and at any distance he reads as a sticker on a photograph. Contact
 *     darkening under boots, in the folds of the net and along the foot of the
 *     stands is what stops that.
 *   - **Depth of field.** A real broadcast lens has a focal plane; the far
 *     touchline and the crowd behind it are never sharp. Focus tracks the ball.
 *   - **Vignette, grain and a touch of chromatic aberration** at the edges,
 *     which is what a lens actually does and what the eye reads as "filmed"
 *     rather than "rendered".
 *
 * One pass rather than a chain of them, because each pass in a chain is another
 * full-screen read and write of a buffer that may be three times native
 * resolution on an iPad. The samples are shared: the same rotated disk drives
 * both the occlusion estimate and the bokeh.
 *
 * There is no ray tracing here and there is no way to have any — WebGL has no
 * ray query, and a browser cannot touch the hardware that would make it real
 * time. This is the screen-space family of tricks that shipped in every
 * pre-2018 console game, which is a long way from nothing.
 */
import * as THREE from '../vendor/three.module.js';
import { Pass, FullScreenQuad } from '../vendor/jsm/postprocessing/Pass.js';

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */`
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform mat4 uProjInv;
uniform vec2 uResolution;
uniform float uNear;
uniform float uFar;
uniform float uFocalPx;      // pixels per unit at one unit of depth
uniform float uTime;

uniform float uAoStrength;
uniform float uAoRadius;     // world units
uniform float uDofScale;     // 0 disables the bokeh entirely
uniform float uDepthValid;   // 0 when there is no depth to read this frame
uniform float uFocus;        // distance to the focal plane, world units
uniform float uGrain;
uniform float uVignette;
uniform float uAberration;
uniform float uDebug;      // 1 = show the linear depth the shader is reading

varying vec2 vUv;

/* Depth here is the non-linear window-space value the depth buffer holds. This
 * is three's own conversion; the result is negative, camera looking down -Z. */
float viewZOf(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  return (uNear * uFar) / ((uFar - uNear) * d - uFar);
}

/* Rebuild the view-space position of a pixel from its depth: fire a ray through
 * the pixel and walk it until its z matches. */
vec3 viewPosOf(vec2 uv, float vz) {
  vec4 clip = vec4(uv * 2.0 - 1.0, 0.5, 1.0);
  vec4 v = uProjInv * clip;
  vec3 ray = v.xyz / v.w;
  return ray * (vz / ray.z);
}

/* A disk of sample directions. Sunflower spacing rather than a ring, so a low
 * sample count does not band. */
const int TAPS = SAMPLE_COUNT;
const float GOLDEN = 2.39996323;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 texel = 1.0 / uResolution;
  float vz = viewZOf(vUv);
  float dist = -vz;

  if (uDebug > 0.5) {
    // Three readings of the same pixel at once, so one screenshot says where the
    // numbers actually land: red is the raw buffer value, green is that value
    // stretched across its top 2%, blue is the linear distance over 120 units.
    float raw = texture2D(tDepth, vUv).x;
    gl_FragColor = vec4(
      raw,
      clamp((raw - 0.98) * 50.0, 0.0, 1.0),
      clamp(dist / 120.0, 0.0, 1.0),
      1.0);
    return;
  }

  vec3 base = texture2D(tDiffuse, vUv).rgb;

  // No depth this frame: hand back the scene ungraded rather than inventing an
  // occlusion term out of a buffer full of zeroes. See the note in render().
  if (uDepthValid < 0.5) {
    gl_FragColor = vec4(base, 1.0);
    return;
  }

  // Sky and anything at the far plane are left alone: there is no geometry
  // there to occlude, and blurring the sky just smears the floodlights.
  bool isSky = dist >= uFar * 0.98;

  vec3 pos = viewPosOf(vUv, vz);
  /* Normals from the depth buffer's own slope. Cheaper than a normal buffer and
   * accurate enough for occlusion, which only needs the hemisphere.
   *
   * Not normalize(cross(...)), though that is what this was. The cross product
   * collapses to zero wherever the two depth slopes are parallel or flat — a
   * surface square to the camera, a run of pixels at the same depth, the
   * precision floor out near the far plane — and normalize of a zero vector is
   * 0/0. That NaN goes straight into ao, clamp is not required to launder it
   * (drivers disagree, which is why this shows on some machines and not others),
   * and col *= ao then rasterises the pixel black. A patch of NaN normals is a
   * black patch, which is the artefact being chased. */
  vec3 dpx = dFdx(pos);
  vec3 dpy = dFdy(pos);
  vec3 nRaw = cross(dpx, dpy);
  float nLen = length(nRaw);
  vec3 normal = nLen > 1e-8 ? nRaw / nLen : vec3(0.0, 0.0, 1.0);

  float rot = hash(vUv * uResolution) * 6.2831853;

  // How far the AO disk reaches on screen, kept constant in world units so a
  // player does not gain occlusion as the camera pushes in.
  float aoPx = clamp(uAoRadius * uFocalPx / max(dist, 0.001), 2.0, 64.0);

  /* Circle of confusion.
   *
   * Far field only, and not until well past the focal plane. A broadcast camera
   * covering a football match is stopped down and a long way back: the entire
   * playing surface is sharp and only the crowd behind it goes soft. The first
   * version blurred either side of the focus with no dead zone, which put a
   * seven-pixel smear across the foreground grass — the exact opposite of what
   * a real lens does here, and it read as a smeared, hazy mess. */
  float coc = 0.0;
  if (uDofScale > 0.0 && dist > uFocus) {
    float beyond = (dist - uFocus) / max(uFocus, 1.0);
    coc = clamp((beyond - 0.35) * uDofScale, 0.0, 1.0);
  }
  float dofPx = coc * 7.0;

  float ao = 0.0;
  vec3 blur = base;
  float blurWeight = 1.0;

  if (!isSky) {
    for (int i = 0; i < TAPS; i++) {
      float fi = float(i);
      float ang = fi * GOLDEN + rot;
      // sqrt keeps the samples area-uniform instead of clustering at the centre
      float r = sqrt((fi + 0.5) / float(TAPS));
      vec2 dir = vec2(cos(ang), sin(ang)) * r;

      /* ---- occlusion ---- */
      vec2 auv = vUv + dir * aoPx * texel;
      float avz = viewZOf(auv);
      vec3 apos = viewPosOf(auv, avz);
      vec3 diff = apos - pos;
      float len = length(diff);
      if (len > 0.0001) {
        float ndl = max(dot(normal, diff / len), 0.0);
        // falls off with distance, and ignores anything beyond the radius so a
        // background object cannot darken a foreground one
        float atten = 1.0 - smoothstep(uAoRadius * 0.6, uAoRadius * 1.6, len);
        ao += ndl * atten;
      }

      /* ---- bokeh ---- */
      if (dofPx > 0.5) {
        vec2 duv = vUv + dir * dofPx * texel;
        // a background sample must not bleed onto a sharp foreground subject
        float dvz = viewZOf(duv);
        float ok = step(uFocus, -dvz) + step(dist, uFocus);
        vec3 c = texture2D(tDiffuse, duv).rgb;
        blur += c * ok;
        blurWeight += ok;
      }
    }
    ao = 1.0 - clamp((ao / float(TAPS)) * uAoStrength, 0.0, 0.92);
  } else {
    ao = 1.0;
  }

  vec3 col = base;
  if (dofPx > 0.5) col = mix(base, blur / blurWeight, clamp(coc * 1.15, 0.0, 1.0));

  /* Chromatic aberration, applied radially and only towards the edges, which is
   * where a real lens shows it. Two taps, not a third pass. */
  if (uAberration > 0.0) {
    vec2 fromCentre = vUv - 0.5;
    float edge = dot(fromCentre, fromCentre) * 4.0;
    vec2 shift = fromCentre * uAberration * edge * texel * uResolution.x * 0.0016;
    col.r = texture2D(tDiffuse, vUv + shift).r;
    col.b = texture2D(tDiffuse, vUv - shift).b;
  }

  col *= ao;

  // Vignette: a soft darkening, multiplied not subtracted, so it never crushes
  // the corners to black.
  float v = 1.0 - uVignette * dot(vUv - 0.5, vUv - 0.5) * 1.9;
  col *= clamp(v, 0.0, 1.0);

  // Grain, scaled down in the highlights — film grain lives in the mid-tones,
  // and grain on a floodlight looks like a broken screen.
  if (uGrain > 0.0) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    float n = hash(vUv * uResolution + fract(uTime) * 91.7) - 0.5;
    col += n * uGrain * (1.0 - luma * 0.7);
  }

  /* Backstop: never let this pass emit a NaN.
   *
   * The normal above was one confirmed way to make one, and fixing it at source
   * is the real repair — but this pass does a lot of arithmetic on reconstructed
   * depth, and a single NaN anywhere in it turns the pixel black, which is the
   * one failure mode we are certain hurts. GLSL ES 1.0 has no isnan(), so this
   * uses the property that defines NaN: it is the only value that is neither
   * >= 0 nor < 0. A pixel that trips it falls back to the ungraded scene, which
   * is a missing bit of occlusion for one frame instead of a black hole. */
  float probe = col.r + col.g + col.b;
  if (!(probe >= 0.0) && !(probe < 0.0)) col = base;

  gl_FragColor = vec4(col, 1.0);
}`;

export class CinematicPass extends Pass {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {object} opts
   *   samples   how many taps the shared disk takes; the whole cost lives here
   *   ao        occlusion strength, 0 disables
   *   dof       bokeh strength, 0 disables
   */
  constructor(camera, opts = {}) {
    super();
    this.camera = camera;
    this.needsSwap = true;

    this.material = new THREE.ShaderMaterial({
      name: 'CinematicPass',
      defines: { SAMPLE_COUNT: Math.max(4, opts.samples ?? 10) },
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        uProjInv: { value: new THREE.Matrix4() },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uNear: { value: camera.near },
        uFar: { value: camera.far },
        uFocalPx: { value: 800 },
        uTime: { value: 0 },
        uDepthValid: { value: 1 },
        uAoStrength: { value: opts.ao ?? 1.0 },
        uAoRadius: { value: opts.aoRadius ?? 0.55 },
        uDofScale: { value: opts.dof ?? 0 },
        uFocus: { value: 30 },
        uGrain: { value: opts.grain ?? 0.035 },
        uVignette: { value: opts.vignette ?? 0.5 },
        uAberration: { value: opts.aberration ?? 0.6 },
        uDebug: { value: opts.debug ? 1 : 0 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    });
    this.fsQuad = new FullScreenQuad(this.material);
  }

  /** Where the lens is focused, in world units from the camera. */
  setFocus(distance) {
    this.material.uniforms.uFocus.value = Math.max(1, distance);
  }

  setSize(width, height) {
    this.material.uniforms.uResolution.value.set(width, height);
  }

  render(renderer, writeBuffer, readBuffer, deltaTime) {
    const u = this.material.uniforms;
    u.tDiffuse.value = readBuffer.texture;
    // The scene was rendered into whichever buffer is currently `readBuffer`,
    // so its depth attachment is the one to sample. Taking it from a fixed
    // render target would work only on frames where the buffer parity happened
    // to line up.
    /* A frame with no depth attachment must not be allowed to guess.
     *
     * If this is ever missing, three binds a default texture in its place and
     * every sample reads as zero — which linearises to "everything is at the
     * near plane, touching everything else", so the occlusion term collapses
     * and the pass paints a dark slab across whatever region it was asked
     * about. Both composer targets are given an attachment at construction, so
     * this should never fire; the point is that when it does, the frame comes
     * out ungraded rather than black. */
    const depth = readBuffer.depthTexture || null;
    u.tDepth.value = depth;
    u.uDepthValid.value = depth ? 1 : 0;
    u.uNear.value = this.camera.near;
    u.uFar.value = this.camera.far;
    u.uProjInv.value.copy(this.camera.projectionMatrixInverse);
    /* Pixels per world unit at one unit of depth, recomputed every frame: the
     * match camera rewrites `fov` on the camera each frame to keep its framing,
     * so caching this at resize left the occlusion radius wrong at every zoom
     * level but the one the renderer happened to boot at. */
    const h = u.uResolution.value.y;
    u.uFocalPx.value = h / (2 * Math.tan((this.camera.fov * Math.PI) / 360));
    u.uTime.value += deltaTime || 0.016;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
    }
    this.fsQuad.render(renderer);
  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}
