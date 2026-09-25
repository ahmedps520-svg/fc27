/**
 * Real rivalries (v119, backlog #16 — rivalries).
 *
 * The generated world has always had derbies (broadcast/context.js pairs its
 * clubs off inside each league). The real clubs that Kick Off, the Custom Cup
 * and online matches field did not: Manchester City against Manchester United
 * was just another fixture. These are the famous ones, by the clubs' ids in
 * data/countries.js, each named plainly for what it is — a city's or a
 * country's derby — rather than by any branded title.
 *
 * A derby is presentation, never balance: the ground sells out, the crowd
 * starts louder and sings more often, and the broadcast calls it. The match
 * plays out exactly as it would otherwise (the sweep does not see it).
 */
const RIVALRIES = [
  ['kc-england-mci', 'kc-england-mun', 'the Manchester derby'],
  ['kc-england-ars', 'kc-england-tot', 'the north London derby'],
  ['kc-england-che', 'kc-england-tot', 'a London derby'],
  ['kc-england-ars', 'kc-england-che', 'a London derby'],
  ['kc-england-liv', 'kc-england-mun', 'the north-west rivalry'],
  ['kc-spain-rma', 'kc-spain-atm', 'the Madrid derby'],
  ['kc-spain-rma', 'kc-spain-bar', 'the great Spanish rivalry'],
  ['kc-italy-mil', 'kc-italy-int', 'the Milan derby'],
  ['kc-italy-juv', 'kc-italy-int', 'the Italian rivalry'],
  ['kc-scotland-cel', 'kc-scotland-ran', 'the Glasgow derby'],
  ['kc-argentina-boc', 'kc-argentina-riv', 'the Buenos Aires derby'],
  ['kc-turkey-gal', 'kc-turkey-fen', 'the Istanbul derby'],
  ['kc-netherlands-aja', 'kc-netherlands-fey', 'the Dutch rivalry'],
  ['kc-portugal-slb', 'kc-portugal-scp', 'the Lisbon derby'],
  ['kc-portugal-slb', 'kc-portugal-por', 'the Portuguese rivalry'],
  ['kc-greece-oly', 'kc-greece-pao', 'the Athens derby'],
  ['kc-egypt-ahy', 'kc-egypt-zam', 'the Cairo derby'],
];
const BY_PAIR = new Map(RIVALRIES.flatMap(([a, b, name]) => [[`${a}|${b}`, name], [`${b}|${a}`, name]]));

/** The rivalry's name when these two teams (by id) are rivals, else null. */
export function rivalryOf(idA, idB) {
  if (!idA || !idB || idA === idB) return null;
  return BY_PAIR.get(`${idA}|${idB}`) || null;
}

export const RIVAL_PAIRS = RIVALRIES.map(([a, b]) => [a, b]);
