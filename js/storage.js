/**
 * localStorage that cannot take the game down.
 *
 * Touching `localStorage` at all throws in some places — Safari private
 * windows, a browser with site data blocked, an iframe with third-party storage
 * off — and it used to be reached bare, at import time, which turned a storage
 * policy into a blank page. Everything here degrades to memory instead: the
 * session plays normally, the save simply does not outlive the tab, and
 * `persistent` says which of the two is happening so a screen can tell the
 * player. Cloud save (when signed in) is unaffected either way.
 */
const memory = new Map();
let backing = null;
let probed = false;

function probe() {
  if (probed) return backing;
  probed = true;
  try {
    const ls = globalThis.localStorage;
    const k = '__apexxi_probe__';
    ls.setItem(k, '1');
    ls.removeItem(k);
    backing = ls;
  } catch {
    backing = null;
  }
  return backing;
}

/** True when saves will survive a reload. */
export const persistent = () => !!probe();

export function getItem(key) {
  const ls = probe();
  if (ls) { try { return ls.getItem(key); } catch { /* fall through */ } }
  return memory.has(key) ? memory.get(key) : null;
}

/** @returns {boolean} whether the value reached durable storage */
export function setItem(key, value) {
  memory.set(key, String(value));
  const ls = probe();
  if (!ls) return false;
  try { ls.setItem(key, String(value)); return true; } catch { return false; }
}

export function removeItem(key) {
  memory.delete(key);
  const ls = probe();
  if (ls) { try { ls.removeItem(key); } catch { /* nothing to do */ } }
}
