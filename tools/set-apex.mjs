/**
 * Set one account's Apex balance.
 *
 * Written for the aftermath of the sell exploit fixed in v46, where a card
 * could be sold repeatedly without leaving the club. Closing the hole does not
 * unwind the balances it produced, and there was no way to correct one without
 * hand-editing the whole account database — which is exactly the sort of job
 * that goes wrong at two in the morning.
 *
 * Usage, from the repo root:
 *
 *   node tools/set-apex.mjs <name>                            # report only
 *   node tools/set-apex.mjs <name> 30000                      # still a dry run
 *   node tools/set-apex.mjs <name> 30000 --apply               # write it
 *   node tools/set-apex.mjs <name> 30000 --clear-packs --apply # and empty the locker
 *
 * **Editing the database by hand does not work, and this is why the tool
 * exists.** The save is client-authoritative: on sign-in the device compares
 * its copy with the cloud's using `saveWeight`, which scores *progress* —
 * matches, cards, packs opened — and does not look at `apex` at all. Change a
 * balance in the database and the weights come out identical, the device keeps
 * its own copy, and then pushes it back up over the correction. It looks like
 * it worked and it silently did not.
 *
 * This bumps `meta.adminRev`, which `cloudWins()` honours ahead of weight, so
 * the correction is adopted exactly once on the player's next sign-in.
 *
 * **It reads nothing and writes nothing without `--apply`.** The default is a
 * report: who the account is, what it holds now, and what would change. Run it
 * once without the flag, read the numbers, then run it again with the flag.
 *
 * It talks to whichever store the server itself would use, by calling into
 * `server/store.js` rather than reimplementing the backend selection — so it
 * cannot drift from the server's idea of where accounts live, and it needs the
 * same environment:
 *
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   the hosted database
 *   (neither set)                                        server/data/accounts.json
 *
 * On Render that means running it from a shell with the service's environment,
 * or exporting the same two variables locally. Pointing it at the wrong store
 * is the one mistake it cannot catch for you: check the backend line it prints
 * before passing `--apply`.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const store = require('../server/store.js');

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const [name, amountArg] = args.filter((a) => !a.startsWith('--'));
const apply = flags.includes('--apply');
const clearPacks = flags.includes('--clear-packs');
const amount = amountArg === undefined ? null : Number(amountArg);

if (!name) {
  console.error('usage: node tools/set-apex.mjs <name> [amount] [--clear-packs] [--apply]');
  process.exit(1);
}
if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount % 1 !== 0)) {
  console.error(`amount must be a whole number of Apex, not "${amountArg}"`);
  process.exit(1);
}

await store.load();
const status = store.status();
console.log(`backend : ${status.backend}`);
console.log(`durable : ${status.durable}`);
console.log(`accounts: ${status.accounts}`);
console.log('');

/* `accountByName` exists for exactly this and is not reachable over HTTP —
   an endpoint that took a name would be an account enumeration oracle. */
const acct = store.accountByName(name);

if (!acct) {
  console.error(`No account named "${name}".`);
  console.error('Names are matched case-insensitively, exactly as the server keys them.');
  process.exit(2);
}

const save = acct.save;
if (!save || !save.club) {
  console.error(`"${acct.name}" has no cloud save yet, so there is no balance to change.`);
  process.exit(3);
}

const club = save.club;
console.log(`account   : ${acct.name}`);
console.log(`last seen : ${new Date(acct.lastSeen).toISOString()}`);
console.log(`apex      : ${(club.apex || 0).toLocaleString()}`);
console.log(`ultimate  : ${(club.ultimate || 0).toLocaleString()}`);
console.log(`cards     : ${(club.collection || []).length}`);
console.log(`opened    : ${club.packsOpened || 0} packs, all time`);
console.log(`adminRev  : ${save.meta?.adminRev || 0}`);

/* The locker, itemised.
 *
 * Coins are only the first place exploited money goes. Spent, it becomes
 * unopened packs — which are the same value wearing a different hat, and are
 * invisible in a balance. Anyone reversing an exploit needs to see both. */
const packs = club.packs || [];
console.log(`locker    : ${packs.length} unopened`);
if (packs.length) {
  const byType = packs.reduce((a, id) => { a[id] = (a[id] || 0) + 1; return a; }, {});
  for (const [id, n] of Object.entries(byType).sort((x, y) => y[1] - x[1])) {
    console.log(`            ${String(n).padStart(5)} x ${id}`);
  }
}
console.log('');

if (amount === null && !clearPacks) {
  console.log('Nothing asked for — report only.');
  process.exit(0);
}

if (amount !== null) {
  console.log(`would set apex   : ${(club.apex || 0).toLocaleString()} -> ${amount.toLocaleString()}`);
}
if (clearPacks) {
  console.log(`would empty locker: ${packs.length} unopened packs -> 0`);
}
console.log(`would bump adminRev: ${save.meta?.adminRev || 0} -> ${(save.meta?.adminRev || 0) + 1}`);
/* Said out loud because it is the thing most likely to be forgotten: cards
   already in the collection are not touched by either flag. */
console.log('note: cards already in the collection stay in the club.');

if (!apply) {
  console.log('');
  console.log('Dry run. Re-run with --apply to write it.');
  process.exit(0);
}

if (amount !== null) club.apex = amount;
if (clearPacks) club.packs = [];
// The bump is what makes the device accept any of this — see the header.
save.meta = { ...(save.meta || {}), adminRev: (save.meta?.adminRev || 0) + 1 };
store.putSave(acct, save);
await store.shutdown();
console.log('');
console.log(`Done. ${acct.name}: ◈${(club.apex || 0).toLocaleString()}, `
  + `${(club.packs || []).length} unopened, adminRev ${save.meta.adminRev}.`);
console.log('It applies on their next sign-in, once.');
