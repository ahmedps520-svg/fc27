/**
 * Bundle the watch app into one classic script.
 *
 * The phone loads ES modules straight from `js/` and that is the right call
 * for a phone. A watch is not a phone: its web viewer is a stripped WebKit
 * that gives no console, no error dialog and no way to know which of fifteen
 * module fetches failed or which line of modern syntax it choked on — the
 * page is simply black. So the watch gets one file, in syntax old enough to
 * be boring (Safari 12), loaded as a plain script. Nothing else changes; the
 * bundle is built from the same `js/watch/app.js` and the same rules.
 *
 * The output (`js/watch/bundle.js`) is committed, the way `assets/manager.glb`
 * is, so the served site stays zero-dependency. Rebuild after any change to
 * the watch or to something it imports (sim, generator, packs, render3d):
 *
 *   npx -y esbuild@0.28 js/watch/app.js --bundle --format=iife \
 *     --target=safari12 --supported:destructuring=true --minify-syntax \
 *     --outfile=js/watch/bundle.js
 *
 * or just `node tools/build-watch.mjs`, which runs exactly that.
 */
import { spawnSync } from 'node:child_process';

const args = ['-y', 'esbuild@0.28', 'js/watch/app.js', '--bundle', '--format=iife',
  '--target=safari12', '--supported:destructuring=true', '--minify-syntax',
  '--charset=utf8', '--outfile=js/watch/bundle.js'];
const r = spawnSync('npx', args, { stdio: 'inherit' });
process.exit(r.status ?? 1);
