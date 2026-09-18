/**
 * The balance gate.
 *
 * HANDOFF's rule is that match balance is never judged by feel: the sweep is
 * how it is judged, and a change that was not meant to touch the football has
 * to leave both seeds byte-identical. This runs the two seeds and diffs them
 * against the committed goldens. A deliberate balance change re-records with
 * `--update` and says so in its commit message.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const SEEDS = [12345, 777];
const update = process.argv.includes('--update');
let failed = false;

for (const seed of SEEDS) {
  const r = spawnSync(process.execPath, ['tools/sweep.mjs', '60', String(seed)], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
  const file = `tests/golden/sweep-${seed}.txt`;
  if (update) { writeFileSync(file, r.stdout); console.log(`recorded ${file}`); continue; }
  const want = readFileSync(file, 'utf8');
  if (r.stdout === want) { console.log(`sweep ${seed}: identical`); continue; }
  failed = true;
  console.error(`sweep ${seed}: DIFFERS from ${file}\n--- golden\n${want}--- now\n${r.stdout}`);
}
process.exit(failed ? 1 : 0);
