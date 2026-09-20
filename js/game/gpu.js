/**
 * Which graphics API to draw with.
 *
 * WebGPU where the browser has it and the player has not turned it off;
 * WebGL2 everywhere else, automatically. The match renderer is WebGL2 only
 * for now — it is built on custom GLSL (the turf, the crowd, the beams, the
 * post chain) that has no WebGPU equivalent until it is rewritten in TSL —
 * so today the WebGPU path draws the title-screen player and the stadium
 * showcase's figure, and the match falls back to WebGL2 on every device.
 * `three.webgpu.js` (three r170's self-contained WebGPU build, MIT) is
 * loaded only when it will be used: it is 1.7 MB and never precached.
 */
import { getState } from '../state.js';

let probe = null;
/** 'webgpu' | 'webgl' — resolved once per session. */
export async function pickRenderer() {
  if (probe) return probe;
  probe = (async () => {
    const want = getState().settings.renderer || 'auto';
    if (want === 'webgl') return 'webgl';
    if (typeof navigator === 'undefined' || !navigator.gpu) return 'webgl';
    try {
      const adapter = await navigator.gpu.requestAdapter();
      return adapter ? 'webgpu' : 'webgl';
    } catch { return 'webgl'; }
  })();
  return probe;
}

/** The WebGPU three build, loaded on demand. */
export const loadWebGPU = () => import('../vendor/three.webgpu.js');

/** What the settings screen shows. */
export function describeRenderer() {
  const want = getState().settings.renderer || 'auto';
  const has = typeof navigator !== 'undefined' && !!navigator.gpu;
  if (want === 'webgpu') return `Matches on the WebGPU renderer (beta: the core scene only, none of the WebGL2 effects yet)${has ? '' : ' — this browser has no WebGPU, so it runs on that renderer\'s WebGL2 backend'}`;
  if (!has) return 'WebGL2 (this browser has no WebGPU)';
  return want === 'webgl' ? 'WebGL2 (WebGPU turned off)' : 'WebGPU for the menu and showcase figure · WebGL2 for the match';
}
