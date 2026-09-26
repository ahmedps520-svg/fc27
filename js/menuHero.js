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
    /* v126: always WebGL. The WebGPU path drew a stand-in made of cylinders
       (three's WebGPU build cannot take the match's figures), and on most
       desktop browsers that stand-in was the footballer on the menu. */
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
    // v126: a step further back, so the scanned model's head has air above it
    camera.position.set(0, -5.3, 1.2);
    camera.lookAt(0, 0, 0.98);

    const { faceOf } = await import('./components/face.js');
    const club = player.clubId ? WORLD.clubsById[player.clubId] : null;
    const kitHex = club ? club.crest.colors[0] : (player.rarity === 'icon' ? '#7af7ff' : '#35e08a');
    const kit = new THREE.Color(kitHex);
    const look = faceOf(player);
    /* v126: on High and Ultra the menu shows the match's scanned model — the
       same footballer you play with, idling, his card's hair on his head. The
       built figure is the fallback (Medium, or the model will not load). */
    let model = null;
    if (q === 'high' || q === 'ultra') {
      try {
        const pm = await import('./game/playerModel.js');
        const m = await pm.loadPlayerModel();
        if (m && alive) model = { pm, rig: pm.makeRig(m, { kit: { shirt: kit, shorts: kit.clone().multiplyScalar(0.6), socks: kit.clone().multiplyScalar(0.8) }, ref: player, index: 0, isGK: player.position === 'GK' }) };
      } catch (e) { console.warn('[hero] scanned model unavailable:', e?.message); }
      if (!alive) { try { renderer.dispose(); } catch { /* gone */ } return; }
    }
    const figure = model ? null : rig.buildPlayer(kit, kit.clone().multiplyScalar(0.6),
      new THREE.Color(look.skin), new THREE.Color(look.hair), kit.clone().multiplyScalar(0.8),
      rig.buildFor(player, player.position), { hairStyle: look.style, beard: look.beard });
    const number = player.position === 'GK' ? 1 : player.position === 'ST' ? 9 : player.position === 'CAM' ? 10 : 7;
    if (figure) {
      figure.parts.torso.material = new THREE.MeshStandardMaterial({
        map: rig.kitTexture(kit, number, String(player.name).split(' ').pop().toUpperCase(), 256), roughness: 0.62,
      });
      scene.add(figure.grp);
    } else scene.add(model.rig.root);
    // a disc of turf to stand on
    // v126: a patch of dark turf, fading at its edge, not a bright green plate
    const discTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
      const gr = g.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(22,70,38,.95)'); gr.addColorStop(0.7, 'rgba(14,48,26,.6)'); gr.addColorStop(1, 'rgba(8,24,14,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.8, 48),
      new THREE.MeshStandardMaterial({ map: discTex, transparent: true, roughness: 1, depthWrite: false }));
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
      if (model) model.pm.poseRig(model.rig, proxy, dt);
      else {
        rig.posePlayer(figure, proxy, Math.sin(t * 1.2) * 0.12, true, 0);
        figure.grp.position.z = Math.sin(t * 1.6) * 0.006;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    canvas.classList.add('is-live');
    canvas.dataset.api = 'webgl';
    canvas.dataset.figure = model ? 'scanned' : 'built';
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
