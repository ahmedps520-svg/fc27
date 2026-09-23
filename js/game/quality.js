/**
 * Which quality tier a device gets (moved out of render3d.js in v87, so the
 * menu's hero can ask without downloading the renderer and the simulation).
 */
/**
 * Which tier a device is dealt when the setting is Auto.
 *
 * Five tiers now: min (Ultra Low), low, medium, high, ultra. Ultra is never
 * chosen automatically — it is only ever an explicit request. The GPU name,
 * where the browser will say it, is the best single signal: a phone with a
 * recent Adreno or Apple GPU runs Medium at 30 fps and Low is a waste of it;
 * an older Mali or a PowerVR does not. Core count alone is a poor signal
 * (plenty of desktops report 4), so it only trips at the very low end.
 *
 * @param {string} setting  the saved setting: auto | min | low | medium | high | ultra
 * @param {{gpu?:string, touch?:boolean, small?:boolean, cores?:number, memory?:number}} [env]
 *        overrides for tests; read from the browser when absent
 */
/**
 * Phone, tablet or desktop — what the settings screen offers depends on it.
 * A phone is a touch device whose shorter screen side is under 600 CSS px;
 * a tablet is any other touch device.
 */
export function deviceClass() {
  if (typeof window === 'undefined') return 'desktop';
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (!touch) return 'desktop';
  const short = Math.min(window.screen?.width || window.innerWidth, window.screen?.height || window.innerHeight);
  return short < 600 ? 'phone' : 'tablet';
}

export function resolveQuality(setting, env = null) {
  // v74: the old Ultra is gone from the menus and Ultra+ is called Ultra; a
  // save that still says 'ultra' means the top tier, 'min' means Low
  if (setting === 'ultra') setting = 'cinema';
  if (setting === 'min') setting = 'low';
  if (['high', 'low', 'medium', 'cinema'].includes(setting)) return setting;
  // Auto on a phone is Performance (Medium), the one tier tuned for it
  if (!env && deviceClass() === 'phone') return 'medium';
  const e = env || readEnv();
  const gpu = classifyGPU(e.gpu || '');
  const weak = (e.cores || 8) <= 2 || (e.memory || 8) <= 2;
  if (weak) return gpu === 'strong' ? 'low' : 'min';
  if (gpu === 'strong') return e.touch || e.small ? 'medium' : 'high';
  if (gpu === 'weak') return 'low';
  // unknown GPU: fall back to the form factor, as before
  return e.touch || e.small ? (gpu === 'mid' ? 'medium' : 'low') : 'high';
}

/** What the browser will tell us; wrapped so the classifier can be tested. */
function readEnv() {
  let gpu = '';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    else if (gl) gpu = String(gl.getParameter(gl.RENDERER) || '');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { /* no GL, no name */ }
  return {
    gpu,
    touch: window.matchMedia('(pointer: coarse)').matches,
    small: Math.min(window.innerWidth, window.innerHeight) < 760,
    cores: navigator.hardwareConcurrency || 8,
    memory: navigator.deviceMemory || 8,
  };
}

/**
 * strong: a desktop GPU or a recent flagship phone; mid: a capable phone;
 * weak: an old or budget mobile GPU; unknown: nothing recognisable said.
 */
export function classifyGPU(name) {
  const n = String(name).toLowerCase();
  if (!n) return 'unknown';
  if (/swiftshader|llvmpipe|software|basic render/.test(n)) return 'weak';
  if (/nvidia|geforce|rtx|gtx|quadro/.test(n)) return 'strong';
  if (/radeon|amd/.test(n) && !/vega 3|vega 6|610|620/.test(n)) return 'strong';
  if (/apple m\d|apple gpu|apple a1[5-9]|apple a2\d/.test(n)) return 'strong';
  if (/apple a1[2-4]/.test(n)) return 'mid';
  if (/apple a\d\b|apple a1[01]/.test(n)) return 'weak';
  if (/apple/.test(n)) return 'mid';                // an Apple GPU it will not name: modern enough
  if (/intel/.test(n)) return /arc|iris xe|iris plus/.test(n) ? 'strong' : /uhd|iris/.test(n) ? 'mid' : 'weak';
  const adreno = n.match(/adreno[^\d]*(\d{3})/);
  if (adreno) { const v = +adreno[1]; return v >= 730 ? 'strong' : v >= 640 ? 'mid' : 'weak'; }
  const mali = n.match(/mali-?g(\d{2,3})/);
  if (mali) { const v = +mali[1]; return v >= 710 || (v >= 76 && v < 100) ? 'mid' : 'weak'; }
  if (/immortalis|xclipse|samsung/.test(n)) return 'mid';
  if (/mali|powervr|videocore|vivante|tegra/.test(n)) return 'weak';
  return 'unknown';
}

