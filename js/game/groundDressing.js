/**
 * What is round the pitch (v78).
 *
 * The stands make a ground big; this makes it a *place*: corner flags that
 * move in the wind, the dugouts and the technical areas, the tunnel, the
 * people who work the match — ballboys, stewards facing the crowd,
 * photographers crouched behind the goals, the camera crews — and, at
 * half-time, the groundstaff out with their forks while the sprinklers run.
 * Around the smaller grounds it builds what they have instead of a bowl: a
 * rail, a grass bank and the perimeter fence; side masts where a ground has
 * them; the suburbs outside. The weather's leftovers live here too: puddles
 * in heavy rain, snow falling and piled along the touchlines, and flares
 * (smoke and light only) in the ends at a goal.
 *
 * Everything is instanced or merged — the whole of it is a couple of dozen
 * draw calls — and everything is built once; `update` only moves what moves.
 */
import * as THREE from '../vendor/three.module.js';

const PITCH = { w: 105, h: 68 };
const CY = PITCH.h / 2;

/** Merge geometries (any mix of indexed and not) into one non-indexed buffer. */
function merge(parts) {
  const pos = []; const nrm = [];
  for (const p0 of parts) {
    const p = p0.index ? p0.toNonIndexed() : p0;
    if (!p.attributes.normal) p.computeVertexNormals();
    pos.push(...p.attributes.position.array); nrm.push(...p.attributes.normal.array);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}
const box = (w, d, h, x, y, z) => new THREE.BoxGeometry(w, d, h).translate(x, y, z);

/* A standing figure, z-up, facing +y: the same convention as the crowd. */
const figureGeo = () => merge([
  box(0.13, 0.14, 0.82, -0.1, 0, 0.41), box(0.13, 0.14, 0.82, 0.1, 0, 0.41),    // legs
  box(0.42, 0.24, 0.62, 0, 0, 1.13),                                            // torso
  box(0.1, 0.12, 0.58, -0.27, 0, 1.12), box(0.1, 0.12, 0.58, 0.27, 0, 1.12),     // arms
  box(0.2, 0.21, 0.24, 0, 0.01, 1.58),                                          // head
]);
/* Crouching: a photographer on one knee behind the goal, lens forward. */
const crouchGeo = () => merge([
  box(0.4, 0.5, 0.2, 0, -0.05, 0.1), box(0.14, 0.14, 0.45, 0.12, 0.2, 0.22),
  box(0.42, 0.26, 0.55, 0, -0.05, 0.62), box(0.2, 0.21, 0.24, 0, 0.02, 1.02),
  new THREE.CylinderGeometry(0.07, 0.09, 0.5, 8).rotateX(0).translate(0, 0.38, 0.95),   // long lens along +y
]);

export function dressGround(ctx) {
  const { scene, VENUE, match, atmo, LIGHT, lo, potato, ultra, surfaceAt = () => 0, MARGIN = 6, SD = 20, GAP_D = 0, rand = Math.random } = ctx;
  const group = new THREE.Group();
  scene.add(group);
  const night = LIGHT.flood > 0;
  const snow = atmo.weather === 'snow';
  const rain = atmo.weather === 'rain';
  const klass = VENUE.klass || 'bowl';
  const community = klass === 'community';
  const small = community || klass === 'town';
  const home = match.teams[0].colors || ['#ffffff', '#222222'];
  const updates = [];
  // wind: stronger in rain and at the small, open grounds
  const wind = (rain ? 1.3 : snow ? 0.9 : 0.6) * (small ? 1.25 : 1) * (0.8 + rand() * 0.4);

  /* ------------------------------ corner flags ------------------------------ */
  {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
    const flagMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(home[0]), roughness: 0.8, side: THREE.DoubleSide });
    const flags = [];
    for (const [x, y] of [[0, 0], [PITCH.w, 0], [0, PITCH.h], [PITCH.w, PITCH.h]]) {
      const z0 = surfaceAt(Math.min(Math.max(x, 0.5), PITCH.w - 0.5), Math.min(Math.max(y, 0.5), PITCH.h - 0.5));
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.55, 6).rotateX(Math.PI / 2), poleMat);
      pole.position.set(x, y, z0 + 0.775);
      const geo = new THREE.PlaneGeometry(0.45, 0.34, 8, 2).rotateX(Math.PI / 2).translate(0.225, 0, 0);
      const flag = new THREE.Mesh(geo, flagMat);
      flag.position.set(x, y, z0 + 1.38);
      flag.userData.base = geo.attributes.position.array.slice();
      group.add(pole, flag);
      flags.push(flag);
    }
    let t = 0;
    const heading = rand() * Math.PI * 2;
    updates.push((m, dt) => {
      t += dt || 0;
      for (const [i, f] of flags.entries()) {
        const pos = f.geometry.attributes.position; const base = f.userData.base;
        for (let k = 0; k < pos.count; k++) {
          const bx = base[k * 3];                       // 0 at the pole .. 0.45 at the tip
          const along = bx / 0.45;
          const flap = Math.sin(t * (5 + wind * 3) - along * 6 + i) * 0.07 * wind * along;
          pos.setXYZ(k, bx * (1 - 0.08 * wind * along), flap + base[k * 3 + 1], base[k * 3 + 2] - along * along * 0.06 * (1.4 - wind));
        }
        pos.needsUpdate = true;
        f.rotation.z = heading + Math.sin(t * 0.4 + i) * 0.35 * wind;
      }
    });
  }

  /* ------------------ dugouts, technical areas and the tunnel ------------------ */
  if (!potato) {
    const shellMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(VENUE.facade || 0x2a3142).multiplyScalar(1.1), roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe2f5, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.32, side: THREE.DoubleSide });
    const seatMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(home[0]).multiplyScalar(0.8), roughness: 0.6 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4f7fb, transparent: true, opacity: 0.8 });
    for (const side of [-1, 1]) {
      const cx = PITCH.w / 2 + side * 12;
      const dug = new THREE.Group();
      dug.add(new THREE.Mesh(box(5.2, 1.5, 0.12, 0, 0, 0.06), shellMat));                  // floor
      dug.add(new THREE.Mesh(box(5.2, 0.1, 1.9, 0, -0.7, 0.95), shellMat));                 // back
      dug.add(new THREE.Mesh(box(0.08, 1.5, 1.9, -2.6, 0, 0.95), glassMat));                // ends
      dug.add(new THREE.Mesh(box(0.08, 1.5, 1.9, 2.6, 0, 0.95), glassMat));
      // a curved perspex roof
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 5.2, 12, 1, true, 0, Math.PI / 2).rotateZ(Math.PI / 2), glassMat);
      roof.position.set(0, 0.85, 0.3); roof.rotation.x = Math.PI;
      dug.add(roof);
      dug.add(new THREE.Mesh(box(4.8, 0.45, 0.45, 0, -0.35, 0.45), seatMat));               // the bench
      dug.position.set(cx, -MARGIN + 2.2, -0.06);
      group.add(dug);
      // the technical area: a dashed box on the apron in front of it
      const w = 9; const d = 2.1; const y0 = -MARGIN + 3.1;
      for (let i = 0; i < 18; i++) {
        const along = (i / 18) * (w * 2 + d * 2);
        let x, y, rot = 0;
        if (along < w) { x = cx - w / 2 + along; y = y0 + d; } else if (along < w + d) { x = cx + w / 2; y = y0 + d - (along - w); rot = Math.PI / 2; } else if (along < w * 2 + d) { x = cx + w / 2 - (along - w - d); y = y0; } else { x = cx - w / 2; y = y0 + (along - w * 2 - d); rot = Math.PI / 2; }
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.09), lineMat);
        dash.position.set(x, y, -0.045); dash.rotation.z = rot;
        group.add(dash);
      }
    }
    // the tunnel: a telescopic walkway in the club's colours, out to the touchline
    const tunMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(home[0]).multiplyScalar(0.45), roughness: 0.7, side: THREE.DoubleSide });
    const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4.8, 16, 1, true, -Math.PI / 2, Math.PI), tunMat);
    tunnel.rotation.set(0, 0, 0); tunnel.position.set(PITCH.w / 2, -MARGIN + 0.4, 0);
    group.add(tunnel);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 6, 16, Math.PI), new THREE.MeshStandardMaterial({ color: new THREE.Color(home[1] || '#ffffff'), roughness: 0.5 }));
    hoop.rotation.x = Math.PI / 2; hoop.position.set(PITCH.w / 2, -MARGIN + 2.8, 0);
    group.add(hoop);
  }

  /* ------------------------ the people who work the match ------------------------ */
  const people = [];                 // [x, y, face, colour, kind]
  const personAt = (x, y, face, col, kind = 'stand', scale = 1) => people.push({ x, y, face, col, kind, scale });
  if (!potato) {
    // ballboys: two down each touchline, one behind each goal, in bibs
    const bib = snow ? 0xff7a1a : 0x2a8cff;
    for (const x of [PITCH.w * 0.25, PITCH.w * 0.75]) {
      personAt(x, -MARGIN + 1.8, 0, bib, 'stand', 0.82);
      personAt(x, PITCH.h + MARGIN - 1.8, Math.PI, bib, 'stand', 0.82);
    }
    for (const x of [-3.4, PITCH.w + 3.4]) personAt(x, CY + 14 * (x < 0 ? 1 : -1), x < 0 ? -Math.PI / 2 : Math.PI / 2, bib, 'stand', 0.82);
    // photographers: crouched along the goal line either side of each goal
    if (!lo) {
      for (const end of [0, 1]) {
        const x = end === 0 ? -2.2 : PITCH.w + 2.2;
        for (const dy of [-19, -15, -11, 11, 15, 19]) personAt(x, CY + dy + (rand() - 0.5), end === 0 ? -Math.PI / 2 : Math.PI / 2, rand() < 0.5 ? 0x1b1d22 : 0x33363d, 'crouch');
      }
    }
    // stewards in hi-vis, facing the crowd
    const vis = 0xd9f22a;
    const stewards = community ? 5 : small ? 8 : 14;
    for (let i = 0; i < stewards; i++) {
      const f = (i + 0.5) / stewards;
      if (community || i % 3 !== 2) personAt(community ? PITCH.w / 2 - 22 + f * 44 : -8 + f * (PITCH.w + 16), PITCH.h + MARGIN - 0.5, 0, vis);
      else personAt(i % 2 ? -MARGIN + 0.6 : PITCH.w + MARGIN - 0.6, 6 + f * (PITCH.h - 12), i % 2 ? Math.PI / 2 : -Math.PI / 2, vis);
    }
    // camera crews: one on the halfway line, one behind each goal, one on each 18-yard line
    for (const [x, y, face] of [[PITCH.w / 2 + 3, -MARGIN + 1.2, 0], [-4.2, CY - 9, -Math.PI / 2], [PITCH.w + 4.2, CY + 9, Math.PI / 2], [16.5, -MARGIN + 1.2, 0], [PITCH.w - 16.5, -MARGIN + 1.2, 0]]) {
      personAt(x, y, face, 0x2d3036, 'camera');
    }
  }
  if (people.length) {
    const stand = figureGeo(); const crouch = crouchGeo();
    const camGeo = merge([box(0.45, 0.7, 0.4, 0, 0.3, 1.55), new THREE.CylinderGeometry(0.03, 0.03, 1.4, 5).rotateX(Math.PI / 2).translate(0, 0.3, 0.7)]);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const d = new THREE.Object3D(); const col = new THREE.Color();
    for (const [kind, geo] of [['stand', stand], ['crouch', crouch], ['camera', stand]]) {
      const list = people.filter((p) => p.kind === kind);
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((p, i) => {
        d.position.set(p.x, p.y, -0.06); d.rotation.set(0, 0, p.face); d.scale.setScalar(p.scale || 1); d.updateMatrix();
        im.setMatrixAt(i, d.matrix); im.setColorAt(i, col.setHex(p.col));
      });
      group.add(im);
      if (kind === 'camera') {
        const cams = new THREE.InstancedMesh(camGeo, new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.4, metalness: 0.5 }), list.length);
        list.forEach((p, i) => { d.position.set(p.x, p.y, -0.06); d.rotation.set(0, 0, p.face); d.scale.setScalar(1); d.updateMatrix(); cams.setMatrixAt(i, d.matrix); });
        group.add(cams);
      }
    }
  }

  /* ------------------ the rail, the bank and the fence (small grounds) ------------------ */
  if (small && !potato) {
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.4, metalness: 0.6 });
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 5).rotateX(Math.PI / 2).translate(0, 0, 0.55);
    const rails = [];
    // a pitch-side rail round three sides (the near side has the boards); community grounds have it everywhere but the stand
    const runs = [[-MARGIN + 1, -MARGIN + 1, -MARGIN + 1, PITCH.h + MARGIN - 1], [PITCH.w + MARGIN - 1, -MARGIN + 1, PITCH.w + MARGIN - 1, PITCH.h + MARGIN - 1]];
    if (community) {
      runs.push([-MARGIN + 1, PITCH.h + MARGIN - 1, PITCH.w / 2 - 24, PITCH.h + MARGIN - 1]);
      runs.push([PITCH.w / 2 + 24, PITCH.h + MARGIN - 1, PITCH.w + MARGIN - 1, PITCH.h + MARGIN - 1]);
    }
    const posts = [];
    for (const [x0, y0, x1, y1] of runs) {
      const len = Math.hypot(x1 - x0, y1 - y0);
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 5), railMat);
      rail.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
      rail.position.set((x0 + x1) / 2, (y0 + y1) / 2, 1.08);
      rails.push(rail);
      for (let k = 0; k <= Math.floor(len / 2.5); k++) posts.push([x0 + ((x1 - x0) * k * 2.5) / len, y0 + ((y1 - y0) * k * 2.5) / len]);
    }
    group.add(...rails);
    const postIM = new THREE.InstancedMesh(postGeo, railMat, posts.length);
    const d = new THREE.Object3D();
    posts.forEach(([x, y], i) => { d.position.set(x, y, -0.06); d.updateMatrix(); postIM.setMatrixAt(i, d.matrix); });
    group.add(postIM);
    if (community) {
      // grass banks behind the goals, standing room for the crowd that is not in the stand
      const bankMat = new THREE.MeshStandardMaterial({ color: snow ? 0xe6edf4 : night ? 0x13301d : 0x3f7a3c, roughness: 1 });
      for (const end of [0, 1]) {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(9, PITCH.h + 24, 3.2), bankMat);
        bank.position.set(end === 0 ? -MARGIN - 7 : PITCH.w + MARGIN + 7, CY, -1.1);
        bank.rotation.y = end === 0 ? 0.28 : -0.28;
        group.add(bank);
      }
      // the perimeter fence: green mesh panels on posts, and a hedge line behind
      const fenceMat = new THREE.MeshStandardMaterial({ color: 0x2e5a3a, roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const hedgeMat = new THREE.MeshStandardMaterial({ color: snow ? 0xdfe7ee : night ? 0x0c1f12 : 0x2c5a2a, roughness: 1 });
      const X0 = -MARGIN - 14; const X1 = PITCH.w + MARGIN + 14; const Y0 = -MARGIN - 10; const Y1 = PITCH.h + MARGIN + 16;
      for (const [x0, y0, x1, y1] of [[X0, Y0, X0, Y1], [X1, Y0, X1, Y1], [X0, Y1, X1, Y1]]) {
        const len = Math.hypot(x1 - x0, y1 - y0);
        const f = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.4), fenceMat);
        f.rotation.set(Math.PI / 2, Math.atan2(y1 - y0, x1 - x0), 0);
        f.position.set((x0 + x1) / 2, (y0 + y1) / 2, 1.2);
        const hedge = new THREE.Mesh(new THREE.BoxGeometry(len, 2.2, 2.6), hedgeMat);
        hedge.rotation.z = Math.atan2(y1 - y0, x1 - x0);
        hedge.position.set((x0 + x1) / 2 + (x0 === x1 ? Math.sign(x0 - PITCH.w / 2) * 2.5 : 0), (y0 + y1) / 2 + (y0 === y1 ? 2.5 : 0), 1.3);
        group.add(f, hedge);
      }
    }
  }

  /* ------------------------------ side floodlight masts ------------------------------ */
  if (VENUE.pylons === 'side' && !potato) {
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: 0.6, metalness: 0.5 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d8, emissiveIntensity: 3.2 * Math.max(0.05, LIGHT.flood), roughness: 0.3 });
    const H = community ? 18 : 24;
    const farY = PITCH.h + MARGIN + (community ? 9 : SD + GAP_D + 4);
    // three down the far side; on the camera side only at the corners, never across the shot
    const spots = [[8, farY], [PITCH.w / 2, farY], [PITCH.w - 8, farY], [-MARGIN - 6, -MARGIN - 8], [PITCH.w + MARGIN + 6, -MARGIN - 8]];
    for (const [x, y] of spots) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, H, 8).rotateX(Math.PI / 2), mastMat);
      mast.position.set(x, y, H / 2);
      const head = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 1.6), lampMat);
      head.position.set(x, y, H + 0.4);
      head.lookAt(PITCH.w / 2, CY, 0);
      group.add(mast, head);
    }
  }

  /* ------------------------------ the suburbs ------------------------------ */
  if (VENUE.landscape === 'suburbs' && !potato) {
    const houseR = ctx.landRand || rand;
    const n = lo ? 60 : 160;
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5);
    const roofGeo = new THREE.CylinderGeometry(0.72, 0.72, 1, 3).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).scale(1, 1, 0.55).translate(0, 0, 1.18);
    const walls = new THREE.InstancedMesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, emissive: night ? 0x3a2a14 : 0x000000, emissiveIntensity: night ? 0.35 : 0 }), n);
    const roofs = new THREE.InstancedMesh(roofGeo, new THREE.MeshStandardMaterial({ color: snow ? 0xeef2f6 : 0xffffff, roughness: 0.9 }), n);
    const trees = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), new THREE.MeshStandardMaterial({ color: snow ? 0xdfe6ec : night ? 0x0c1a10 : 0x2f5e2c, roughness: 1 }), n);
    const d = new THREE.Object3D(); const c = new THREE.Color();
    const WALLS = [0xc9b8a0, 0xa8573c, 0xe0d8c8, 0x8c6a4e, 0xb9b2a6];
    const ROOFS = [0x4a3a36, 0x6b3a2e, 0x3a3f48, 0x55463c];
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.02 + houseR() * 0.96) * (houseR() < 0.8 ? 1 : -0.35);
      const r = (community ? 70 : 110) + houseR() * 170;
      const x = PITCH.w / 2 + Math.cos(a) * r * 1.2; const y = CY + Math.sin(a) * r;
      const w = 7 + houseR() * 5; const dd = 6 + houseR() * 3; const h = 5 + houseR() * 3;
      const face = Math.round(houseR() * 4) * (Math.PI / 2);
      d.position.set(x, y, -0.5); d.rotation.set(0, 0, face); d.scale.set(w, dd, h); d.updateMatrix();
      walls.setMatrixAt(i, d.matrix); walls.setColorAt(i, c.setHex(WALLS[i % WALLS.length]));
      roofs.setMatrixAt(i, d.matrix); roofs.setColorAt(i, c.setHex(ROOFS[i % ROOFS.length]));
      const tr = 2.2 + houseR() * 2.5;
      d.position.set(x + 7, y + 4, tr + 1.5); d.rotation.set(0, 0, 0); d.scale.set(tr, tr, tr * 1.2); d.updateMatrix();
      trees.setMatrixAt(i, d.matrix);
    }
    for (const im of [walls, roofs, trees]) { im.frustumCulled = false; group.add(im); }
  }

  /* ------------------------------ weather leftovers ------------------------------ */
  // puddles: standing water in the hollows when it is really coming down
  if (rain && (atmo.intensity || 0) > 0.62 && !potato) {
    const puddleMat = new THREE.MeshStandardMaterial({ color: 0x1a2a2e, roughness: 0.04, metalness: 0.75, transparent: true, opacity: 0.55, envMap: scene.environment, depthWrite: false });
    const spots = [[4, CY], [PITCH.w - 4, CY], [11, CY + 3], [PITCH.w - 11, CY - 3], [PITCH.w / 2, CY], [30, 12], [75, 56], [20, 50], [88, 18]];
    for (const [x, y] of spots) {
      const n = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < n; k++) {
        const px = x + (rand() - 0.5) * 5; const py = y + (rand() - 0.5) * 5;
        const p = new THREE.Mesh(new THREE.CircleGeometry(1, 20), puddleMat);
        p.scale.set(0.6 + rand() * 1.6, 0.4 + rand() * 0.9, 1); p.rotation.z = rand() * Math.PI;
        p.position.set(px, py, surfaceAt(px, py) + 0.015);
        p.renderOrder = 1;
        group.add(p);
      }
    }
  }
  // snow: cleared snow banked along the touchlines, and flakes in the air round the play
  let flakes = null;
  if (snow && !potato) {
    const pileMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    for (const [x, y, len, rot] of [[PITCH.w / 2, -1.6, PITCH.w, 0], [PITCH.w / 2, PITCH.h + 1.6, PITCH.w, 0], [-1.6, CY, PITCH.h, Math.PI / 2], [PITCH.w + 1.6, CY, PITCH.h, Math.PI / 2]]) {
      const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, len, 8, 1).rotateZ(Math.PI / 2).scale(1, 1, 0.45), pileMat);
      pile.rotation.z = rot; pile.position.set(x, y, -0.05);
      group.add(pile);
    }
    const N = lo ? 1500 : ultra ? 7000 : 4000;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (rand() - 0.5) * 90; pos[i * 3 + 1] = (rand() - 0.5) * 70; pos[i * 3 + 2] = rand() * 30; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    flakes = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: lo ? 0.16 : 0.12, transparent: true, opacity: 0.85, depthWrite: false }));
    flakes.frustumCulled = false;
    group.add(flakes);
    let t = 0;
    updates.push((m, dt, cam) => {
      t += dt || 0;
      flakes.position.set(cam?.tx ?? PITCH.w / 2, cam?.ty ?? CY, 0);
      const a = g.attributes.position.array;
      for (let i = 0; i < N; i++) {
        a[i * 3 + 2] -= (dt || 0) * (1.1 + (i % 7) * 0.12);
        a[i * 3] += Math.sin(t * 0.8 + i) * 0.01 * wind;
        if (a[i * 3 + 2] < 0) a[i * 3 + 2] += 30;
      }
      g.attributes.position.needsUpdate = true;
    });
  }

  /* --------------------- half-time: the groundstaff and the sprinklers --------------------- */
  if (!potato) {
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x2f5d3a, roughness: 0.9 });
    const staff = [];
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(figureGeo(), staffMat);
      s.visible = false;
      s.userData.path = { x0: 12 + i * 24, y0: 6 + rand() * 10, dir: rand() < 0.5 ? 1 : -1 };
      group.add(s);
      staff.push(s);
    }
    // six sprinkler heads, each throwing a turning arc of droplets
    const SPR = [[20, 17], [20, 51], [PITCH.w / 2, 17], [PITCH.w / 2, 51], [PITCH.w - 20, 17], [PITCH.w - 20, 51]];
    const DROPS = lo ? 90 : 220;
    const dpos = new Float32Array(SPR.length * DROPS * 3);
    const dvel = new Float32Array(SPR.length * DROPS * 3);
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const drops = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xdff1ff, size: 0.09, transparent: true, opacity: 0.7, depthWrite: false }));
    drops.frustumCulled = false; drops.visible = false;
    group.add(drops);
    const noSpray = rain || snow || !!atmo.frost;
    let ht = 0; let spin = 0;
    updates.push((m, dt) => {
      const half = m.phase === 'half';
      ht = half ? ht + (dt || 0) : 0;
      for (const s of staff) {
        s.visible = half && ht > 1.5;
        if (!s.visible) continue;
        const p = s.userData.path;
        const walk = ((ht - 1.5) * 0.9) % (PITCH.h - 12);
        s.position.set(p.x0 + Math.sin(ht * 0.3 + p.x0) * 2, p.dir > 0 ? p.y0 + walk : PITCH.h - p.y0 - walk, surfaceAt(p.x0, 30));
        s.rotation.z = p.dir > 0 ? 0 : Math.PI;
      }
      drops.visible = half && !noSpray && ht > 0.5;
      if (!drops.visible) return;
      spin += (dt || 0) * 0.9;
      const a = dg.attributes.position.array;
      for (let si = 0; si < SPR.length; si++) {
        const [sx, sy] = SPR[si];
        for (let k = 0; k < DROPS; k++) {
          const i = (si * DROPS + k) * 3;
          if (a[i + 2] <= 0 || (dvel[i] === 0 && dvel[i + 1] === 0)) {
            // relaunch from the head along the current jet angle
            const ang = spin * (si % 2 ? 1 : -1) + si + (k / DROPS) * 0.35;
            const sp = 6 + (k % 9) * 0.55;
            a[i] = sx; a[i + 1] = sy; a[i + 2] = 0.35;
            dvel[i] = Math.cos(ang) * sp; dvel[i + 1] = Math.sin(ang) * sp; dvel[i + 2] = 3.2 + (k % 5) * 0.3;
          }
          a[i] += dvel[i] * dt; a[i + 1] += dvel[i + 1] * dt; a[i + 2] += dvel[i + 2] * dt;
          dvel[i + 2] -= 9.8 * dt;
        }
      }
      dg.attributes.position.needsUpdate = true;
    });
  }

  /* ------------------------ flares in the ends (visual only) ------------------------ */
  let flareSpots = [];
  const FL = lo ? 0 : ultra ? 900 : 500;
  let flare = null;
  if (FL) {
    const fp = new Float32Array(FL * 3); const fa = new Float32Array(FL);
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    fg.setAttribute('aLife', new THREE.BufferAttribute(fa, 1));
    const fmat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uCol: { value: new THREE.Color(0xff3a2a) } },
      vertexShader: `attribute float aLife; varying float vL;
        void main() { vL = aLife; vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp((6.0 + (1.0 - aLife) * 38.0) * 60.0 / max(1.0, -mv.z), 1.0, 64.0);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uCol; varying float vL;
        void main() { vec2 c = gl_PointCoord - 0.5; float d = dot(c, c);
          if (vL <= 0.0 || d > 0.25) discard;
          float core = smoothstep(0.25, 0.0, d);
          // a hot pink-red core near the flare, turning to grey smoke as it rises
          vec3 col = mix(vec3(0.55, 0.52, 0.5), uCol * 2.2, smoothstep(0.55, 1.0, vL));
          gl_FragColor = vec4(col * core, core * clamp(vL, 0.0, 1.0) * 0.55); }`,
    });
    flare = new THREE.Points(fg, fmat);
    flare.frustumCulled = false;
    group.add(flare);
    const vel = new Float32Array(FL * 3);
    let burn = 0; let next = 0;
    updates.push((m, dt) => {
      if (m.phase === 'goal' && burn <= 0 && flareSpots.length) burn = 9;
      burn -= dt || 0;
      const a = fg.attributes.position.array; const life = fg.attributes.aLife.array;
      for (let i = 0; i < FL; i++) {
        if (life[i] > 0) {
          life[i] -= (dt || 0) * 0.28;
          a[i * 3] += vel[i * 3] * dt; a[i * 3 + 1] += vel[i * 3 + 1] * dt; a[i * 3 + 2] += vel[i * 3 + 2] * dt;
          vel[i * 3] += wind * 0.3 * dt;
        } else if (burn > 0 && next <= 0) {
          const sp = flareSpots[i % flareSpots.length];
          a[i * 3] = sp[0] + (rand() - 0.5) * 0.6; a[i * 3 + 1] = sp[1] + (rand() - 0.5) * 0.6; a[i * 3 + 2] = sp[2] + 1;
          vel[i * 3] = (rand() - 0.5) * 0.6; vel[i * 3 + 1] = (rand() - 0.5) * 0.6; vel[i * 3 + 2] = 1.2 + rand() * 1.4;
          life[i] = 1;
          next = 0.004;
        }
        next -= (dt || 0) / FL;
      }
      fg.attributes.position.needsUpdate = true; fg.attributes.aLife.needsUpdate = true;
    });
  }

  return {
    group,
    /** Where the fans who light flares stand — the renderer knows the seats. */
    setFlareSpots(spots) { flareSpots = spots || []; },
    update(m, dt, cam) { for (const u of updates) u(m, dt, cam); },
    dispose() {
      group.traverse((o) => { o.geometry?.dispose?.(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => mt.dispose?.()); });
      scene.remove(group);
    },
  };
}
