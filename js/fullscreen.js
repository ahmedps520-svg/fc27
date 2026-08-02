/**
 * Fullscreen helpers that survive Safari.
 *
 * iPhone has no Fullscreen API at all and iPad only got it recently, so
 * `el.requestFullscreen?.().catch(...)` throws: the optional call returns
 * undefined and `.catch` blows up on it. Everything here is guarded and always
 * returns a promise.
 */
export const fullscreenSupported = () =>
  typeof document !== 'undefined'
  && (document.fullscreenEnabled || document.webkitFullscreenEnabled || false);

export function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function enterFullscreen(el = document.documentElement) {
  try {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!fn) return Promise.resolve(false);
    const r = fn.call(el);
    return r && typeof r.then === 'function'
      ? r.then(() => true, () => false)
      : Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

export function exitFullscreen() {
  try {
    const fn = document.exitFullscreen || document.webkitExitFullscreen;
    if (!fn) return Promise.resolve(false);
    const r = fn.call(document);
    return r && typeof r.then === 'function'
      ? r.then(() => true, () => false)
      : Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

export function toggleFullscreen(el = document.documentElement) {
  return isFullscreen() ? exitFullscreen() : enterFullscreen(el);
}

/** Running as an installed app? Then we are already effectively fullscreen. */
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches
  || window.matchMedia('(display-mode: fullscreen)').matches
  || window.navigator.standalone === true;
