/**
 * v190: names other players can see are checked for abuse.
 *
 * A player name, a guild name, an Ultimate XI club name and a Player Career
 * name are the only words one player can put in front of another (everything
 * else between players is a fixed emote). App Review asks that anything a
 * player writes for others be filtered, reportable and blockable; this is the
 * filter. Reports and blocks are in store.js and server.js.
 *
 * Two lists, because the naive version — look for each word anywhere in the
 * name — refuses half the Arab world: "ass" is inside Hassan, "nazi" inside
 * Nazih and Nazir, "dick" inside Dickson. Long, unmistakable words are found
 * anywhere (so "xXfuckXx" and "f_u_c_k" are caught); short ones only when they
 * stand as a word of their own between digits, dots, dashes or spaces.
 */

// found anywhere, after separators are dropped and look-alike digits read as letters
const ANYWHERE = [
  'fuck', 'shit', 'cunt', 'nigger', 'nigga', 'faggot', 'fagot', 'whore', 'bitch', 'slut', 'rapist',
  'hitler', 'pussy', 'penis', 'vagina', 'dildo', 'porn', 'wank', 'twat', 'bollock', 'retard', 'kkk',
  'sharmoota', 'sharmuta', 'sharmota', 'sharmouta', 'kosomak', 'kusomak', 'kussomak', 'kosomk', 'manyak', 'manyok',
  'gahba', 'ga7ba', 'kahba', 'zebbi',
];
// only as a whole word
const WHOLE = new Set([
  'ass', 'arse', 'fag', 'cum', 'sex', 'tits', 'anal', 'rape', 'nazi', 'nazis', 'cock', 'dick', 'spic', 'chink',
  'paki', 'kike', 'kos', 'kus', 'kuss', 'ayr', 'ayri', 'zebi', 'zibi', 'zeby', 'khara', 'shat', 'sh1t',
]);
// names that would pass for the game itself or its staff
const IMPERSONATION = ['admin', 'moderator', 'apexxi', 'apexstaff', 'apexsupport'];

// real places and surnames that contain a word from the lists above
const ALLOW = ['scunthorpe', 'penistone', 'cockburn', 'cockermouth', 'dickinson', 'dickens'];

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', 9: 'g', '@': 'a', $: 's', '!': 'i' };
const deLeet = (s) => s.replace(/[0134578@$!9]/g, (c) => LEET[c]);

/** True when a name should not be shown to other players. */
function isOffensive(name) {
  let raw = String(name || '').toLowerCase();
  if (!raw) return false;
  for (const w of ALLOW) raw = raw.split(w).join(' ');
  for (const form of [raw, deLeet(raw)]) {
    const joined = form.replace(/[^\p{L}\p{N}]/gu, '');
    if (ANYWHERE.some((w) => joined.includes(w))) return true;
    if (IMPERSONATION.some((w) => joined.startsWith(w) || joined.endsWith(w))) return true;
    for (const tok of form.split(/[^\p{L}]+/u)) if (tok && WHOLE.has(tok)) return true;
  }
  // the raw form split on digits too, so "ass69" and "69ass" are words of their own
  for (const tok of raw.split(/[^\p{L}]+/u)) if (tok && WHOLE.has(tok)) return true;
  return false;
}

module.exports = { isOffensive };
