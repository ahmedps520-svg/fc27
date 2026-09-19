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
import { resolveQuality } from './game/render3d.js';

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
    token.stop = () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      try { renderer.dispose(); } catch { /* gone */ }
      canvas.classList.remove('is-live');
    };
  };
  // after the menu has settled, and never in the way of first paint
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 900));
  setTimeout(() => idle(() => { start(); }), 700);
}

export function disposeHero() {
  active?.stop();
  active = null;
}
