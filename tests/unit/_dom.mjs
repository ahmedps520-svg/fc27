/**
 * The smallest browser the modules under test need. Imported first by any test
 * whose subject touches localStorage, so the same stub serves them all.
 */
const store = new Map();
globalThis.localStorage ??= {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window ??= globalThis;
globalThis.navigator ??= { vibrate: () => true, onLine: true };
export const resetStorage = () => store.clear();
