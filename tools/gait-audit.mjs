/**
 * Gait audit (v102, backlog "feel"): how much the built-in figure's feet
 * skate. For each kind of movement a player makes — jog, sprint, backpedal,
 * sideways jockey — the rig is posed frame by frame and the planted foot (the
 * lower one) is tracked: a real runner's planted foot does not move over the
 * grass, so its speed there is the skating. Reported as a share of the body's
 * speed, before (a git revision's rig and stride timing) and after (the
 * working tree).
 *
 *   node tools/gait-audit.mjs [--before HEAD]
 */
import '../tests/unit/_dom.mjs';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BEFORE = arg('--before', 'HEAD');
mkdirSync('tests/tmp', { recursive: true });
const oldSrc = execSync(`git show ${BEFORE}:js/game/rig.js`).toString().replace("'../vendor/three.module.js'", `'${pathToFileURL(process.cwd() + '/js/vendor/three.module.js').href}'`);
writeFileSync('tests/tmp/rig-before.mjs', oldSrc);
const OLD = await import(pathToFileURL(process.cwd() + '/tests/tmp/rig-before.mjs').href);
const NEW = await import('../js/game/rig.js');
const THREE = await import('../js/vendor/three.module.js');

const MOVES = [['jog', 3, 0, 0], ['sprint', 8.5, 0, 0], ['backpedal', 3, 180, 0], ['jockey (sideways)', 2.4, 90, 180]];
function slip(R, legacy, [, speed, travel, face]) {
  const col = new THREE.Color('#d33a3a');
  const fig = R.buildPlayer(col, col, col, col, col, { height: 1, girth: 1, shoulders: 1 });
  const h = travel * Math.PI / 180; const f = face * Math.PI / 180;
  const p = { x: 0, y: 0, vx: Math.cos(h) * speed, vy: Math.sin(h) * speed, dirX: Math.cos(f), dirY: Math.sin(f), _phase: 0 };
  const dt = 1 / 120; let prev = null; let sum = 0; let n = 0;
  for (let i = 0; i < 480; i++) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (legacy) p._phase += speed * dt * 2.4;
    else { const g = R.gaitOf(p); p._phase += R.strideRate(g.sp) * Math.min(1, g.sp / 1.2) * dt; R.updateBank(p, dt); }
    R.posePlayer(fig, p, p._phase, true, 0);
    const L = fig.parts.footL.position; const Rt = fig.parts.footR.position;
    const low = L.z < Rt.z ? L : Rt; const which = L.z < Rt.z ? 'L' : 'R';
    const cur = { x: low.x, y: low.y, which };
    // only while that foot is on the grass (a boot's centre sits ~0.045–0.07 m up when it is)
    if (prev && prev.which === which && i > 60 && low.z < 0.09) { sum += Math.hypot(cur.x - prev.x, cur.y - prev.y) / dt; n += 1; }
    prev = cur;
  }
  return (sum / n) / speed;
}
console.log('\nSpeed of a foot on the grass, as a share of the body speed (0 = planted, 1 = the foot slides along with the body)\n');
console.log('move                  before   after');
for (const m of MOVES) console.log(`${m[0].padEnd(20)}  ${slip(OLD, true, m).toFixed(2).padStart(6)}  ${slip(NEW, false, m).toFixed(2).padStart(6)}`);
