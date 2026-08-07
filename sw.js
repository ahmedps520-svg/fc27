/**
 * APEX XI service worker.
 * Precaches the whole app so it launches offline once installed, and serves
 * everything cache-first — the game has no live data to go stale.
 * Bump CACHE when files change so old assets are evicted.
 */
const CACHE = 'apexxi-v5';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/main.css',

  './js/app.js',
  './js/state.js',
  './js/padMenu.js',
  './js/fullscreen.js',
  './js/audio.js',
  './js/ultimate.js',
  './js/components/face.js',
  './js/game/net.js',
  './js/matchEngine.js',
  './js/data/pools.js',
  './js/data/generator.js',
  './js/components/playerCard.js',
  './js/components/crest.js',
  './js/game/sim.js',
  './js/game/input.js',
  './js/game/net.js',
  './js/game/render3d.js',
  './js/game/renderGL.js',
  './js/screens/splash.js',
  './js/screens/menu.js',
  './js/screens/squad.js',
  './js/screens/career.js',
  './js/screens/quickmatch.js',
  './js/screens/play.js',
  './js/screens/match.js',
  './js/screens/settings.js',

  './js/vendor/three.module.js',
  './js/vendor/jsm/postprocessing/EffectComposer.js',
  './js/vendor/jsm/postprocessing/RenderPass.js',
  './js/vendor/jsm/postprocessing/ShaderPass.js',
  './js/vendor/jsm/postprocessing/MaskPass.js',
  './js/vendor/jsm/postprocessing/Pass.js',
  './js/vendor/jsm/postprocessing/UnrealBloomPass.js',
  './js/vendor/jsm/postprocessing/OutputPass.js',
  './js/vendor/jsm/shaders/CopyShader.js',
  './js/vendor/jsm/shaders/LuminosityHighPassShader.js',
  './js/vendor/jsm/shaders/OutputShader.js',

  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // add one at a time so a single 404 cannot fail the whole install
    await Promise.all(ASSETS.map((u) => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first, cache as fallback. Cache-first would pin whatever shipped
  // first and quietly serve stale modules after every update — offline play
  // still works because every successful response is written back to the cache.
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.status === 200 && res.type === 'basic') {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      throw new Error('offline');
    }
  })());
});
