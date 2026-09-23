/**
 * The street cage (v82): what stands round a street court instead of a
 * stadium — posts, a mesh (or low boards), the odd floodlight pole, and on
 * the night venues a neon strip along the top rail. Same interface as
 * groundDressing.js (`update`, `dispose`, `setFlareSpots`) so the renderer
 * can use either.
 */
import * as THREE from '../vendor/three.module.js';
import { PITCH } from './field.js';

/** A court surface: flat colour, a faint grain, painted lines. */
export function courtTexture(surface, { circle = 3, spot = 6, boxW = 5, boxHalf = 6, goalHalf = 1.6 } = {}) {
  const S = 24;
  const c = document.createElement('canvas');
  c.width = Math.round(PITCH.w * S); c.height = Math.round(PITCH.h * S);
  const g = c.getContext('2d');
  g.fillStyle = surface.base; g.fillRect(0, 0, c.width, c.height);
  // two-tone halves, like a court painted in two coats
  g.fillStyle = surface.alt; g.fillRect(0, 0, c.width / 2, c.height);
  // grain
  const n = Math.round(c.width * c.height * (surface.grain || 0.05) / 40);
  for (let i = 0; i < n; i++) {
    g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)';
    g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2);
  }
  const m = (v) => v * S;
  g.strokeStyle = surface.line; g.lineWidth = m(0.1);
  g.strokeRect(m(0.2), m(0.2), c.width - m(0.4), c.height - m(0.4));
  g.beginPath(); g.moveTo(c.width / 2, m(0.2)); g.lineTo(c.width / 2, c.height - m(0.2)); g.stroke();
  g.beginPath(); g.arc(c.width / 2, c.height / 2, m(circle), 0, Math.PI * 2); g.stroke();
  g.fillStyle = surface.line;
  g.beginPath(); g.arc(c.width / 2, c.height / 2, m(0.15), 0, Math.PI * 2); g.fill();
  for (const side of [0, 1]) {
    const x0 = side ? c.width - m(0.2) : m(0.2);
    const dir = side ? -1 : 1;
    // a D-shaped area, as courts have
    g.beginPath();
    g.arc(x0, c.height / 2, m(boxW), -Math.PI / 2, Math.PI / 2, side === 1);
    g.stroke();
    g.beginPath(); g.arc(x0 + dir * m(spot), c.height / 2, m(0.12), 0, Math.PI * 2); g.fill();
    void boxHalf; void goalHalf;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Build the cage round the court. */
export function dressStreet({ scene, VENUE, atmo, lo }) {
  const cage = VENUE.cage || { h: 3, post: '#222', mesh: '#999' };
  const group = new THREE.Group();
  const H = cage.h;
  const W = PITCH.w; const D = PITCH.h;
  const IN = 0.6;                                  // walls stand just outside the lines
  const postMat = new THREE.MeshStandardMaterial({ color: cage.post, roughness: 0.6, metalness: 0.4 });
  // the mesh: a transparent diamond grid, or solid boards when the wall is low
  const low = H < 1.5;
  let meshMat;
  if (low) meshMat = new THREE.MeshStandardMaterial({ color: cage.mesh, roughness: 0.8 });
  else {
    const t = document.createElement('canvas'); t.width = t.height = 64;
    const g = t.getContext('2d');
    g.strokeStyle = cage.mesh; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 64); g.moveTo(64, 0); g.lineTo(0, 64); g.stroke();
    const tex = new THREE.CanvasTexture(t);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    meshMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.7, metalness: 0.3 });
    meshMat.userData.tex = tex;
  }
  const panel = (x, y, len, rot) => {
    const geo = new THREE.PlaneGeometry(len, H);
    if (!low && meshMat.map) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 1.2, uv.getY(i) * H / 1.2); }
    const m = new THREE.Mesh(low ? new THREE.BoxGeometry(len, 0.12, H) : geo, meshMat);
    if (low) { m.position.set(x, y, H / 2); m.rotation.z = rot; }
    else { m.position.set(x, y, H / 2); m.rotation.order = 'ZYX'; m.rotation.set(Math.PI / 2, 0, rot); }   // stood up (z is up), then turned to its side
    group.add(m);
  };
  // long sides and the two ends (the ends have the goal openings, the mesh runs above and beside them)
  panel(W / 2, -IN, W + IN * 2, 0);
  panel(W / 2, D + IN, W + IN * 2, 0);
  panel(-IN, D / 2, D + IN * 2, Math.PI / 2);
  panel(W + IN, D / 2, D + IN * 2, Math.PI / 2);
  // posts every ~4 m
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, H + 0.2, 6);
  postGeo.rotateX(Math.PI / 2);
  const posts = [];
  for (let x = -IN; x <= W + IN + 0.01; x += (W + IN * 2) / Math.max(2, Math.round(W / 4))) posts.push([x, -IN], [x, D + IN]);
  for (let y = -IN; y <= D + IN + 0.01; y += (D + IN * 2) / Math.max(2, Math.round(D / 4))) posts.push([-IN, y], [W + IN, y]);
  const inst = new THREE.InstancedMesh(postGeo, postMat, posts.length);
  const mtx = new THREE.Matrix4();
  posts.forEach(([x, y], i) => { mtx.makeTranslation(x, y, (H + 0.2) / 2); inst.setMatrixAt(i, mtx); });
  group.add(inst);
  // the neon strip along the top rail at night
  if (cage.neon) {
    const neon = new THREE.MeshBasicMaterial({ color: cage.neon });
    const rail = (x, y, len, rot) => { const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.08), neon); r.position.set(x, y, H + 0.1); r.rotation.z = rot; group.add(r); };
    rail(W / 2, -IN, W + IN * 2, 0); rail(W / 2, D + IN, W + IN * 2, 0);
    rail(-IN, D / 2, D + IN * 2, Math.PI / 2); rail(W + IN, D / 2, D + IN * 2, Math.PI / 2);
  }
  // four light poles at the corners (lit at dusk and night)
  if (!lo || atmo?.time !== 'day') {
    const poleMat = new THREE.MeshStandardMaterial({ color: '#2b3038', roughness: 0.5, metalness: 0.5 });
    const headMat = new THREE.MeshBasicMaterial({ color: atmo?.time === 'day' ? '#cfd6df' : '#fff6d8' });
    for (const [x, y] of [[-IN - 1.5, -IN - 1.5], [W + IN + 1.5, -IN - 1.5], [-IN - 1.5, D + IN + 1.5], [W + IN + 1.5, D + IN + 1.5]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 9, 8), poleMat);
      pole.rotation.x = Math.PI / 2; pole.position.set(x, y, 4.5); group.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.6), headMat);
      head.position.set(x, y, 9.1); group.add(head);
    }
  }
  scene.add(group);
  return {
    update() {},
    setFlareSpots() {},
    dispose() {
      scene.remove(group);
      group.traverse((o) => { o.geometry?.dispose?.(); });
      postMat.dispose(); meshMat.userData.tex?.dispose?.(); meshMat.dispose();
    },
  };
}
