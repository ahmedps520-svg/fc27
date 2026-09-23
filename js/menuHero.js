/**
 * The title-screen footballer.
 *
 * Your best card stands on the menu in 3D — the built-in rig from the match,
 * in your club's colours with his number and name on the back, turning slowly
 * under a key light. Everything about it is deferred: three.js is not loaded
 * until the menu has been interactive for a moment, and not at all on a
 * device that Auto would run on Low, on a save that asked for reduced motion,
 * or where WebGL is missing — the key art is the picture then, as it always
 * was. Nothing on the menu waits for this.
 */
import { getState } from './state.js';
import { getPlayer, WORLD } from './data/generator.js';
import { resolveQuality } from './game/quality.js';

let active = null;

/** The card to show: the highest-rated player you own; failing that, the world's best. */
export function heroPlayer() {
  const s = getState();
  const owned = (s.club?.collection || []).map(getPlayer).filter(Boolean);
  const best = owned.sort((a, b) => b.overall - a.overall)[0];
  return best || WORLD.players.slice().sort((a, b) => b.overall - a.overall)[0];
}

export function mountHero(canvas) {
  disposeHero();
  const s = getState();
  if (s.settings.reduceMotion) return;
  const q = resolveQuality(s.settings.quality);
  if (q === 'min' || q === 'low') return;
  const player = heroPlayer();
  if (!player) return;
  let alive = true;
  const token = { stop: () => { alive = false; } };
  active = token;

  const start = async () => {
    if (!alive) return;
    const { pickRenderer, loadWebGPU } = await import('./game/gpu.js');
    const api = await pickRenderer();
    if (api === 'webgpu') { try { await startWebGPU(await loadWebGPU()); return; } catch (e) { console.warn('[hero] WebGPU failed, falling back to WebGL:', e?.message); if (!alive) return; } }
    let THREE; let rig;
    try {
      [THREE, rig] = await Promise.all([import('./vendor/three.module.js'), import('./game/rig.js')]);
    } catch { return; }
    if (!alive) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch { return; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xbcd0ff, 0x1a2a1a, 1.4));
    const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
    key.position.set(-2.5, -3.5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x35e08a, 1.6);
    rim.position.set(3, 2.5, 2.5);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.up.set(0, 0, 1);
    camera.position.set(0, -4.6, 1.25);
    camera.lookAt(0, 0, 0.95);

    const { faceOf } = await import('./components/face.js');
    const club = player.clubId ? WORLD.clubsById[player.clubId] : null;
    const kitHex = club ? club.crest.colors[0] : (player.rarity === 'icon' ? '#7af7ff' : '#35e08a');
    const kit = new THREE.Color(kitHex);
    const look = faceOf(player);
    const figure = rig.buildPlayer(kit, kit.clone().multiplyScalar(0.6),
      new THREE.Color(look.skin), new THREE.Color(look.hair), kit.clone().multiplyScalar(0.8),
      rig.buildFor(player, player.position));
    const number = player.position === 'GK' ? 1 : player.position === 'ST' ? 9 : player.position === 'CAM' ? 10 : 7;
    figure.parts.torso.material = new THREE.MeshStandardMaterial({
      map: rig.kitTexture(kit, number, String(player.name).split(' ').pop().toUpperCase(), 256), roughness: 0.62,
    });
    scene.add(figure.grp);
    // a disc of turf to stand on
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40),
      new THREE.MeshStandardMaterial({ color: 0x1f6b36, roughness: 0.95 }));
    scene.add(disc);

    const proxy = { x: 0, y: 0, vx: 0, vy: 0, dirX: 0, dirY: -1, celebrating: false, diveT: 0 };
    let t = 0;
    let last = performance.now();
    let raf = 0;
    const resize = () => {
      const w = canvas.clientWidth || 240;
      const h = canvas.clientHeight || 340;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const frame = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      // a slow turn, looking a little past the camera each way, and breathing
      const yaw = -Math.PI / 2 + Math.sin(t * 0.45) * 0.55;
      proxy.dirX = Math.cos(yaw); proxy.dirY = Math.sin(yaw);
      rig.posePlayer(figure, proxy, Math.sin(t * 1.2) * 0.12, true, 0);
      figure.grp.position.z = Math.sin(t * 1.6) * 0.006;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    canvas.classList.add('is-live');
    canvas.dataset.api = 'webgl';
    token.stop = () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      try { renderer.dispose(); } catch { /* gone */ }
      canvas.classList.remove('is-live');
    };
  };
  /* The WebGPU figure. three's WebGPU build is a separate module with its
     own classes, so the match rig (built on the WebGL module) cannot be
     handed to it; the figure here is built from the same proportions with
     the build's own primitives — torso, hips, head, limbs, boots — in the
     kit with the number on the back. Standard materials only, which is
     what WebGPU runs without a shader rewrite. */
  const startWebGPU = async (T) => {
    const renderer = new T.WebGPURenderer({ canvas, alpha: true, antialias: true });
    await renderer.init();
    if (!alive) { renderer.dispose(); return; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xbcd0ff, 0x1a2a1a, 1.4));
    const key = new T.DirectionalLight(0xfff1dc, 2.4); key.position.set(-2.5, -3.5, 4); scene.add(key);
    const rim = new T.DirectionalLight(0x35e08a, 1.6); rim.position.set(3, 2.5, 2.5); scene.add(rim);
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.up.set(0, 0, 1); camera.position.set(0, -4.6, 1.25); camera.lookAt(0, 0, 0.95);
    const { faceOf } = await import('./components/face.js');
    const { kitTexture } = await import('./game/rig.js');
    const club = player.clubId ? WORLD.clubsById[player.clubId] : null;
    const kitHex = club ? club.crest.colors[0] : (player.rarity === 'icon' ? '#7af7ff' : '#35e08a');
    const kit = new T.Color(kitHex);
    const look = faceOf(player);
    const mat = (c, r = 0.7) => new T.MeshStandardMaterial({ color: c, roughness: r });
    const skin = mat(new T.Color(look.skin), 0.78); const kitM = mat(kit, 0.62); const shorts = mat(kit.clone().multiplyScalar(0.6), 0.66);
    const sock = mat(kit.clone().multiplyScalar(0.8), 0.8); const boot = mat(0x14141a, 0.42); const hair = mat(new T.Color(look.hair), 0.85);
    const grp = new T.Group();
    const add = (geo, m, x, y, z, rx = Math.PI / 2, sx = 1, sy = 1, sz = 1) => { const mesh = new T.Mesh(geo, m); mesh.position.set(x, y, z); mesh.rotation.x = rx; mesh.scale.set(sx, sy, sz); grp.add(mesh); return mesh; };
    // the kit texture is a WebGL CanvasTexture; re-wrap its canvas for this build
    const number = player.position === 'GK' ? 1 : player.position === 'ST' ? 9 : player.position === 'CAM' ? 10 : 7;
    const kitTex = new T.CanvasTexture(kitTexture(new (await import('./vendor/three.module.js')).Color(kitHex), number, String(player.name).split(' ').pop().toUpperCase(), 256).image);
    kitTex.colorSpace = T.SRGBColorSpace;
    const torsoM = new T.MeshStandardMaterial({ map: kitTex, roughness: 0.62 });
    add(new T.CylinderGeometry(0.2, 0.15, 0.4, 16), torsoM, 0, 0, 1.28);
    add(new T.CylinderGeometry(0.17, 0.15, 0.16, 14), shorts, 0, 0, 1.0);
    add(new T.SphereGeometry(0.105, 16, 12), skin, 0, 0, 1.68, 0);
    add(new T.SphereGeometry(0.107, 16, 12), hair, 0, 0, 1.70, 0, 1, 1, 0.92);
    for (const sd of [-1, 1]) {
      add(new T.CapsuleGeometry(0.06, 0.34, 4, 8), skin, sd * 0.12, 0, 0.72);          // thigh
      add(new T.CapsuleGeometry(0.05, 0.32, 4, 8), sock, sd * 0.12, 0, 0.34);          // shin
      add(new T.BoxGeometry(0.1, 0.24, 0.08), boot, sd * 0.12, 0.05, 0.06, 0);         // boot
      add(new T.CapsuleGeometry(0.05, 0.26, 4, 8), kitM, sd * 0.27, 0, 1.32);          // sleeve
      add(new T.CapsuleGeometry(0.045, 0.24, 4, 8), skin, sd * 0.3, 0, 1.06);          // forearm
    }
    scene.add(grp);
    const disc = new T.Mesh(new T.CircleGeometry(0.9, 40), new T.MeshStandardMaterial({ color: 0x1f6b36, roughness: 0.95 }));
    scene.add(disc);
    let t = 0; let last = performance.now(); let raf = 0;
    const resize = () => { const w = canvas.clientWidth || 240; const h = canvas.clientHeight || 340; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize();
    const frame = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      grp.rotation.z = Math.sin(t * 0.45) * 0.55;
      grp.position.z = Math.sin(t * 1.6) * 0.006;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    canvas.classList.add('is-live');
    canvas.dataset.api = 'webgpu';
    token.stop = () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); try { renderer.dispose(); } catch { /* gone */ } canvas.classList.remove('is-live'); };
  };

  // after the menu has settled, and never in the way of first paint
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 900));
  setTimeout(() => idle(() => { start(); }), 700);
}

export function disposeHero() {
  active?.stop();
  active = null;
}
