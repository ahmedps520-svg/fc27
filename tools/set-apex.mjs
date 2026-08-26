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
 *   node tools/set-apex.mjs <name>                 # show the account, change nothing
 *   node tools/set-apex.mjs <name> 30000           # still a dry run
 *   node tools/set-apex.mjs <name> 30000 --apply   # write it
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

const [name, amountArg, ...flags] = process.argv.slice(2);
const apply = flags.includes('--apply');
const amount = amountArg === undefined ? null : Number(amountArg);

if (!name) {
  console.error('usage: node tools/set-apex.mjs <name> [amount] [--apply]');
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
console.log(`packs     : ${(club.packs || []).length} unopened`);
console.log('');

if (amount === null) {
  console.log('No amount given — nothing to do.');
  process.exit(0);
}

console.log(`would set apex: ${(club.apex || 0).toLocaleString()} -> ${amount.toLocaleString()}`);
/* Said out loud because it is the thing most likely to be forgotten: coins are
   only half of what an exploit buys. The squad it paid for is still there. */
console.log('note: this changes the balance only. Cards already bought stay in the club.');

if (!apply) {
  console.log('');
  console.log('Dry run. Re-run with --apply to write it.');
  process.exit(0);
}

club.apex = amount;
store.putSave(acct, save);
await store.shutdown();
console.log('');
console.log(`Done. ${acct.name} now holds ◈${amount.toLocaleString()}.`);
