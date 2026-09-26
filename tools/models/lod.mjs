/**
 * The scanned player's lighter level of detail (v132).
 *
 *   (in a scratch dir) npm i @gltf-transform/core @gltf-transform/functions meshoptimizer
 *   node tools/models/lod.mjs [ratio=0.22]
 *
 * Reads assets/candidates/player.glb (non-indexed, ~39k visible triangles a
 * player) and writes assets/candidates/player-lod1.glb: the same meshes,
 * welded and simplified with meshoptimizer, and nothing else — no textures,
 * no animations. The game keeps the full file's skeleton, clips and materials
 * and only swaps each skinned mesh's geometry (same attributes, same bind
 * pose), so the lighter figure moves and is dressed exactly like the full one.
 * Eyelashes are dropped outright: at the distance this is drawn they are
 * sub-pixel.
 */
import { NodeIO } from '@gltf-transform/core';
import { weld, simplify, prune, dedup } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const ratio = Number(process.argv[2] || 0.22);
const io = new NodeIO();
const doc = await io.read('assets/candidates/player.glb');
const root = doc.getRoot();
const tris = () => root.listNodes().filter((n) => n.getMesh() && !/eyelash/i.test(n.getName()))
  .reduce((a, n) => a + n.getMesh().listPrimitives().reduce((b, p) => b + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);
const before = tris();
for (const a of root.listAnimations()) { for (const c of a.listChannels()) c.dispose(); for (const sm of a.listSamplers()) { sm.getInput()?.dispose(); sm.getOutput()?.dispose(); sm.dispose(); } a.dispose(); }
for (const n of root.listNodes()) if (n.getMesh() && /eyelash|^Ch38_Hair$/i.test(n.getName())) { n.getMesh().dispose(); }
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.004, lockBorder: true }),
  dedup(), prune({ keepAttributes: true }),
);
// textures go after the transforms, so prune keeps the UVs the game's materials read
for (const t of root.listTextures()) t.dispose();
await io.write('assets/candidates/player-lod1.glb', doc);
console.log(`visible triangles a player: ${before} → ${tris()} (ratio ${ratio})`);
