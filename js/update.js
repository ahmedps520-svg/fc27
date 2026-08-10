/**
 * Update gate.
 *
 * The server hashes everything it serves into a short build id, so pushing a
 * commit changes it and nothing else does. The client remembers the build it
 * last launched on; if the server is on a different one, the title screen says
 * so and will not go any further until the player installs it.
 *
 * Why a gate rather than a silent reload: the service worker can and does swap
 * itself over in the background, but reloading a page out from under someone —
 * possibly mid-match — to deliver that is worse than asking. This way the only
 * moment the app ever restarts itself is one the player pressed a button for.
 *
 * The progress bar is theatre, and deliberately so: clearing a cache and
 * re-registering a worker takes a few hundred milliseconds and reports nothing
 * along the way. The bar is paced to look like the download it is standing in
 * for, and the real work is awaited before it is allowed to finish — so it is
 * never lying about being done.
 */

const KEY = 'apexxi.build';

/** The build this device last successfully launched, or null on a first run. */
export const knownBuild = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export function rememberBuild(build) {
  try { localStorage.setItem(KEY, build); } catch { /* private mode — ask again next time */ }
}

/**
 * Ask the server what it is serving.
 *
 * `cache: 'no-store'` matters twice over: the browser must not answer from its
 * own cache, and the service worker's network-first handler must go to the
 * network for it. A cached answer here would report the build the player
 * already has and the update would never be offered.
 *
 * @returns {Promise<{pending: boolean, build: string|null, first: boolean}>}
 *   `pending` false on any failure — offline is not a reason to block someone
 *   out of a game that runs perfectly well offline.
 */
export async function checkForUpdate() {
  try {
    const res = await fetch('api/version', { cache: 'no-store' });
    if (!res.ok) return { pending: false, build: null, first: false };
    const { build } = await res.json();
    if (!build) return { pending: false, build: null, first: false };

    const known = knownBuild();
    // A first run has nothing to compare against, so it is never an update —
    // it just records where it came in.
    if (!known) {
      rememberBuild(build);
      return { pending: false, build, first: true };
    }
    return { pending: known !== build, build, first: false };
  } catch {
    return { pending: false, build: null, first: false };
  }
}

/** What the bar says at each point along its length. */
const STAGES = [
  { until: 10, label: 'Contacting server' },
  { until: 62, label: 'Downloading update' },
  { until: 80, label: 'Unpacking files' },
  { until: 91, label: 'Verifying' },
  { until: 99, label: 'Installing' },
];

const labelAt = (pct) => (STAGES.find((s) => pct <= s.until) || STAGES[STAGES.length - 1]).label;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** How long the bar takes to fill, barring the real work running longer. */
const FILL_MS = 2600;

/** Backstop on the one step that is actually waited for. */
const UNREGISTER_TIMEOUT_MS = 2500;

/**
 * Drop the service worker, so the reload cannot be answered by the thing that
 * was serving the stale copy. This is the step that actually delivers the
 * update, and the only one worth waiting for.
 *
 * It unregisters rather than merely refreshing: a worker that is already stuck
 * is exactly what is being fixed here, so asking it nicely is the one approach
 * that cannot be relied on.
 */
async function unregisterWorkers() {
  try {
    if (!('serviceWorker' in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  } catch { /* the cache-busted reload below is still worth doing */ }
}

/**
 * Bin the cached copies. Started but deliberately **not** awaited.
 *
 * The cache holds a 14 MB character model among several hundred files and
 * deleting it took over six seconds on a tablet — long enough that waiting for
 * it made the update feel broken. Nothing depends on it finishing: the worker
 * is already gone, the reload carries a cache-busting query, and the fresh
 * worker's `activate` deletes every cache that is not its own anyway. So this
 * is left to run and the page navigates out from under it.
 */
function dropCachesInBackground() {
  try {
    if (!window.caches) return;
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {});
  } catch { /* nothing to do */ }
}

/**
 * Run the install. Resolves only by navigating away.
 *
 * @param {string} build the id to record once the old copy is gone
 * @param {(pct: number, label: string) => void} onProgress
 */
export async function installUpdate(build, onProgress) {
  // The real work starts immediately and runs underneath the animation, so the
  // bar is spending time that was going to be spent anyway.
  // Sequenced, not parallel: deleting the cache competes with the unregister
  // badly enough to push it into its own timeout, which left the bar sitting
  // at 99% for two and a half seconds looking stalled.
  const work = unregisterWorkers();
  work.then(dropCachesInBackground);

  /* Driven by the clock, not by counting steps.
   *
   * The first version advanced the bar a fixed amount per `setTimeout`, which
   * assumed the timers would fire on schedule. They do not: clearing the cache
   * stalls the main thread in bursts, timers get starved, and a bar budgeted at
   * two and a half seconds took fifty-eight. Reading the elapsed time instead
   * means a starved frame makes the bar jump rather than making the update take
   * a minute. */
  let done = false;
  let timedOut = false;
  work.then(() => { done = true; });
  wait(UNREGISTER_TIMEOUT_MS).then(() => { timedOut = true; });

  const t0 = performance.now();
  await new Promise((resolve) => {
    const tick = () => {
      const ms = performance.now() - t0;
      const e = Math.min(1, ms / FILL_MS);
      // ease-out: quick off the mark, settling as it fills, like a real transfer
      let pct = (1 - (1 - e) ** 2) * 99;

      /* Past the end of the fill the bar creeps rather than stopping.
       * Unregistering the worker turned out to take a couple of seconds on its
       * own, and a bar parked at 99% for that long reads as a hang — which is
       * the one thing an update screen must never look like. Asymptotic creep
       * says "still working" and cannot overtake the real work. */
      if (e >= 1) pct = 99 + 0.9 * (1 - Math.exp(-(ms - FILL_MS) / 2200));

      onProgress(pct, labelAt(Math.min(pct, 99)));
      if (e >= 1 && (done || timedOut)) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  onProgress(100, 'Ready');
  rememberBuild(build);
  await wait(420);

  // A fresh query string so even the navigation itself cannot be answered from
  // a cache. `replace` keeps the pre-update page out of the back stack.
  const url = new URL(window.location.href);
  url.searchParams.set('u', Date.now().toString(36));
  window.location.replace(url.toString());
}
