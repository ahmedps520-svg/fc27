/**
 * The App Store build's original names (see platform.js). Imported first by
 * data/generator.js, so the real-player lists, the Icons and Stars are renamed
 * before the world is dealt from them. Does nothing on the web.
 */
import { APP_STORE, registerRealNames, buildPeople, personName, shortOf } from '../platform.js';
import { REAL_PLAYERS, REAL_PLAYERS_EXTRA, REAL_PLAYERS_WAVE3, REAL_PLAYERS_WAVE4, REAL_PLAYERS_WAVE5, REAL_PLAYERS_WAVE6, REAL_PLAYERS_WAVE7 } from './realPlayers.js';
import { ICONS, STARS, SAUDI_ICONS } from './pools.js';

if (APP_STORE) {
  const lists = [REAL_PLAYERS, REAL_PLAYERS_EXTRA, REAL_PLAYERS_WAVE3, REAL_PLAYERS_WAVE4, REAL_PLAYERS_WAVE5, REAL_PLAYERS_WAVE6, REAL_PLAYERS_WAVE7];
  const cards = [...ICONS, ...STARS, ...SAUDI_ICONS];
  const pairs = [...lists.flatMap((l) => l.map((r) => [r[0], r[2]])), ...cards.map((d) => [d.name, d.nation])];
  registerRealNames(pairs.map((p) => p[0]));
  buildPeople(pairs);
  for (const l of lists) for (const r of l) { r[0] = personName(r[0], r[2]); r[1] = shortOf(r[0]); }
  for (const d of cards) { d.name = personName(d.name, d.nation); d.short = shortOf(d.name); }
}
