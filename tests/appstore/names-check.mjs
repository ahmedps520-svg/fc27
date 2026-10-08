// The App Store build's names (platform.js), checked in its own process — the flag is read at load.
// Prints JSON for tests/unit/appstore-names.test.mjs.
const app = process.argv.includes('--app');
if (app) globalThis.APEX_APP_STORE = true;
await import('../unit/_dom.mjs');
const { WORLD, getPlayer } = await import('../../js/data/generator.js');
const db = await import('../../js/data/careerDb.js');
const { TIER2 } = await import('../../js/careerV2.js');
const { CHALLENGES } = await import('../../js/data/challenges.js');
const { personName } = await import('../../js/platform.js');
const { RELEASES } = await import('../../js/data/patchNotes.js');
// v186: which promo cards exist must not depend on the shown name — the two builds play each other
const { EVENT_CAMPAIGNS, CAMPAIGNS } = await import('../../js/data/promos.js');
const promoIds = Object.fromEntries([...EVENT_CAMPAIGNS, ...CAMPAIGNS].map((c) => [c.id, WORLD.players.filter((p) => c.eligible(p)).map((p) => p.id)]));
const world = WORLD.players.map((p) => [p.id, p.overall, p.position, p.clubId, p.nation, p.rarity].join('|')).join(';');
const full = new Set();
for (const p of WORLD.players) full.add(p.name);
for (const rows of Object.values(db.CAREER_SQUADS)) for (const r of rows) full.add(r[0]);
for (const m of db.REAL_MANAGERS) full.add(m.name);
const clubs = [...db.CAREER_CLUBS.map((c) => c.name), ...Object.values(TIER2).flat()];
const leagues = [...new Set(db.CAREER_CLUBS.map((c) => c.league)), ...Object.keys(TIER2)];
const byName = new Set(WORLD.players.map((p) => p.name));
const careerMissing = Object.values(db.CAREER_SQUADS).flat().map((r) => r[0]).filter((n) => !byName.has(n));
const legendNames = new Set(WORLD.sbcCards.map(getPlayer).filter(Boolean).map((p) => p.name));
const rewardsMissing = CHALLENGES.filter((c) => c.reward?.card).map((c) => personName(c.reward.card)).filter((n) => !legendNames.has(n));
console.log(JSON.stringify({
  people: [...full], clubs, leagues,
  unique: new Set(WORLD.players.map((p) => p.name)).size === WORLD.players.length,
  careerMissing, rewardsMissing, notes: RELEASES.map((r) => r.version),
  promoIds, world,
}));
