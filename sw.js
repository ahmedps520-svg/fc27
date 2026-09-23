/**
 * APEX XI service worker.
 *
 * Precaches the whole app so it launches offline once installed, then serves
 * network-first: the network decides what the code is, and the cache is only
 * the fallback for when there is no network.
 *
 * Bump CACHE on every release. The name is the eviction mechanism — `activate`
 * deletes every cache that is not the current one, so a new name is what
 * actually clears out an old build's bytes.
 */
const CACHE = 'apexxi-v86';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/main.css',

  './js/app.js',
  './js/state.js',
  './js/update.js',
  './js/padMenu.js',
  './js/fullscreen.js',
  './js/audio.js',
  './js/ultimate.js',
  './js/tutorial.js',
  './js/career.js',
  './js/data/careerDb.js',
  './js/components/face.js',
  './js/matchEngine.js',
  './js/data/pools.js',
  './js/data/challenges.js',
  './js/data/objectives.js',
  './js/data/generator.js',
  './js/data/realPlayers.js',
  './js/data/packs.js',
  './js/components/playerCard.js',
  './js/components/packArt.js',
  './js/components/crest.js',
  './js/components/screenHead.js',
  './js/game/sim.js',
  './js/game/field.js',
  './js/game/ratings.js',
  './js/game/drills.js',
  './js/game/streetDressing.js',
  './js/game/input.js',
  './js/game/render3d.js',
  './js/game/renderGL.js',
  './js/game/cinematic.js',
  './js/game/net.js',
  './js/storage.js',
  './js/crash.js',
  './notes.html',
  './watch.html',
  './styles/watch.css',
  './js/watch/bundle.js',
  './js/data/patchNotes.js',
  './js/screens/notes.js',
  './js/screens/splash.js',
  './js/screens/menu.js',
  './js/screens/squad.js',
  './js/screens/career.js',
  './js/screens/quickmatch.js',
  './js/screens/play.js',
  './js/screens/match.js',
  './js/screens/settings.js',
  './js/screens/shootout.js',
  './js/screens/online.js',
  './js/screens/today.js',
  './js/screens/trophies.js',
  './js/screens/weekend.js',
  './js/screens/uxiHub.js',
  './js/screens/pro.js',
  './js/screens/street.js',
  './js/screens/skills.js',
  './js/screens/careerDepth.js',
  './js/progress.js',
  './js/live.js',
  './js/weekend.js',
  './js/game/gpu.js',
  './js/game/camera.js',
  './js/game/groundDressing.js',
  './js/data/grounds.js',
  './js/data/traits.js',
  './js/game/tactics.js',
  './js/game/skills.js',
  './js/game/renderGPU.js',
  './js/tournament.js',
  './js/economy.js',
  './js/builder.js',
  './js/data/emotes.js',
  './js/data/countries.js',
  './js/onboarding.js',
  './js/kits.js',
  './js/i18n.js',
  './js/menuHero.js',
  './js/game/rig.js',
  './js/screens/world.js',
  './js/screens/stadiums.js',
  './js/screens/builder.js',
  './js/world.js',
  './js/data/stadiums.js',
  './js/evolve.js',
  './js/evolutions.js',
  './js/market.js',
  './js/binder.js',
  './js/modes.js',
  './js/tasks.js',
  './js/squadHub.js',
  './js/net/party.js',
  './js/net/partySquads.js',
  './js/screens/partyPanel.js',
  './js/careerPeople.js',
  './js/careerV3.js',
  './js/proCareer.js',
  './js/streetMode.js',
  './js/game/landscape.js',
  './js/seasonal.js',
  './js/broadcast/context.js',
  './js/broadcast/director.js',
  './js/broadcast/graphics.js',
  './js/broadcast/postmatch.js',
  './js/broadcast/pregame.js',
  './js/broadcast/voice.js',
  './js/data/commentaryVoices.js',
  './js/components/ceremony.js',
  './js/careerV2.js',
  './js/data/commentary.js',
  './js/data/achievements.js',
  './js/data/season.js',
  './js/data/liveDefault.js',
  './js/data/chemistry.js',
  './js/data/promos.js',
  './js/data/cardValue.js',
  './js/data/street.js',
  './events.json',

  './js/net/api.js',
  './js/net/socket.js',
  './js/net/config.js',
  './js/net/netplay.js',
  './js/net/p2p.js',
  './js/game/playerModel.js',

  './js/vendor/three.module.js',
  './js/vendor/jsm/loaders/GLTFLoader.js',
  './js/vendor/jsm/utils/SkeletonUtils.js',
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

  './assets/keyart.jpg',

  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // `cache: 'reload'` so installing a new worker cannot repopulate itself out
    // of the HTTP cache — precaching a stale copy of a file is exactly the bug
    // this worker exists to avoid.
    await Promise.all(ASSETS.map((u) =>
      cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    // take over immediately rather than waiting for every tab to close: a game
    // installed to a home screen is almost never fully closed
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

// lets the page ask an already-waiting worker to take over now
self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
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
      // navigations bypass the HTTP cache outright, so a home-screen launch
      // always gets the current shell
      const res = req.mode === 'navigate'
        ? await fetch(new Request(req, { cache: 'reload' }))
        : await fetch(req);
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
