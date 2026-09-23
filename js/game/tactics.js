/**
 * Tactics (v79): one system for people and for the CPU.
 *
 * A side's instructions are five things plus a role for each player:
 *
 *  - **shape**: the formation (sim.js `SHAPES`);
 *  - **defensive style**: high press, balanced or deep block — how hard it
 *    presses and where its line holds;
 *  - **build-up**: short, balanced, long ball or counter — how it moves the
 *    ball forward;
 *  - **width** and **line height**, 0..1 sliders;
 *  - **roles**: what each player does inside his slot — an inverted full-back
 *    tucks into midfield in possession, a false nine drops off the front, a
 *    target man stays central for crosses, and so on.
 *
 * The CPU runs the same instructions, adapts them at half-time from the
 * score and again late on (chasing the game, or seeing it out), and a person
 * can switch between five quick tactics in a match. Everything here is data
 * and small pure functions; `sim.js` reads them.
 */

export const DEF_STYLES = {
  high: { name: 'High press', press: 1.35, line: 8 },
  balanced: { name: 'Balanced', press: 1, line: 0 },
  deep: { name: 'Deep block', press: 0.72, line: -9 },
};

export const BUILD_UPS = {
  short: { name: 'Short passing', passRate: 1.3, longBias: 0.2, counter: 1 },
  balanced: { name: 'Balanced', passRate: 1, longBias: 0.5, counter: 1 },
  long: { name: 'Long ball', passRate: 0.85, longBias: 1, counter: 1 },
  counter: { name: 'Counter-attack', passRate: 0.9, longBias: 0.75, counter: 1.6 },
};

/* Roles. `pos` is which slots may carry it; the adjustments are in metres
   along the attack (fwd) and towards the middle (in), with and without the
   ball, plus a behaviour flag the sim looks for. */
export const ROLES = {
  // defenders
  'centre-back': { name: 'Centre-back', pos: 'DEF', has: { fwd: 0, in: 0 }, not: { fwd: 0, in: 0 } },
  'ball-playing': { name: 'Ball-playing defender', pos: 'DEF', has: { fwd: 3, in: 0 }, not: { fwd: 0, in: 0 }, flag: 'progressive' },
  'full-back': { name: 'Full-back', pos: 'DEF', has: { fwd: 6, in: 0 }, not: { fwd: 0, in: 0 }, flag: 'overlap' },
  'wing-back': { name: 'Wing-back', pos: 'DEF', has: { fwd: 14, in: -2 }, not: { fwd: -2, in: 0 }, flag: 'overlap' },
  'inverted-wing-back': { name: 'Inverted wing-back', pos: 'DEF', has: { fwd: 8, in: 14 }, not: { fwd: 0, in: 0 } },
  // midfielders
  'holding': { name: 'Holding midfielder', pos: 'MID', has: { fwd: -5, in: 5 }, not: { fwd: -4, in: 4 }, flag: 'screen' },
  'box-to-box': { name: 'Box-to-box', pos: 'MID', has: { fwd: 9, in: 0 }, not: { fwd: -5, in: 0 }, flag: 'runs' },
  'playmaker': { name: 'Playmaker', pos: 'MID', has: { fwd: 2, in: 4 }, not: { fwd: 0, in: 0 }, flag: 'progressive' },
  'wide-midfielder': { name: 'Wide midfielder', pos: 'MID', has: { fwd: 4, in: -3 }, not: { fwd: -2, in: 0 }, flag: 'cross' },
  'attacking-mid': { name: 'Attacking midfielder', pos: 'MID', has: { fwd: 8, in: 3 }, not: { fwd: 2, in: 0 }, flag: 'runs' },
  // forwards
  'advanced-forward': { name: 'Advanced forward', pos: 'FWD', has: { fwd: 4, in: 0 }, not: { fwd: 2, in: 0 }, flag: 'runs' },
  'false-nine': { name: 'False nine', pos: 'FWD', has: { fwd: -11, in: 2 }, not: { fwd: -4, in: 0 }, flag: 'progressive' },
  'target-man': { name: 'Target man', pos: 'FWD', has: { fwd: 2, in: 8 }, not: { fwd: 0, in: 4 }, flag: 'target' },
  'poacher': { name: 'Poacher', pos: 'FWD', has: { fwd: 6, in: 6 }, not: { fwd: 4, in: 2 }, flag: 'poacher' },
  'inside-forward': { name: 'Inside forward', pos: 'FWD', has: { fwd: 5, in: 9 }, not: { fwd: 0, in: 0 }, flag: 'cutin' },
};

/** The five a person can flick between mid-match. */
export const QUICK_TACTICS = [
  { id: 'park', name: 'Park the bus', set: { mentality: 'defensive', defStyle: 'deep', buildUp: 'counter', line: 0.2, width: 0.35 } },
  { id: 'defensive', name: 'Defensive', set: { mentality: 'defensive', defStyle: 'balanced', buildUp: 'balanced', line: 0.4, width: 0.45 } },
  { id: 'balanced', name: 'Balanced', set: { mentality: 'balanced', defStyle: 'balanced', buildUp: 'balanced', line: 0.5, width: 0.5 } },
  { id: 'attacking', name: 'Attacking', set: { mentality: 'attacking', defStyle: 'high', buildUp: 'short', line: 0.62, width: 0.62 } },
  { id: 'allout', name: 'All-out attack', set: { mentality: 'allout', defStyle: 'high', buildUp: 'long', line: 0.75, width: 0.7 } },
];

export const defaultTactics = () => ({ mentality: 'balanced', pressing: 'normal', defStyle: 'balanced', buildUp: 'balanced', width: 0.5, line: 0.5, roles: {}, quick: 'balanced' });

/** A sensible role for a player in a slot: from his position, then his slot. */
export function defaultRole(ref, slot) {
  const pos = ref?.position || '';
  if (slot.role === 'DEF') {
    const wide = slot.y < 0.3 || slot.y > 0.7;
    if (!wide) return (ref?.stats?.passing || 0) >= 76 ? 'ball-playing' : 'centre-back';
    return slot.x > 0.2 ? 'wing-back' : 'full-back';
  }
  if (slot.role === 'MID') {
    const wide = slot.y < 0.22 || slot.y > 0.78;
    if (wide) return 'wide-midfielder';
    if (pos === 'CDM' || slot.x < 0.35) return 'holding';
    if (pos === 'CAM' || slot.x > 0.5) return 'attacking-mid';
    return (ref?.stats?.passing || 0) >= 80 ? 'playmaker' : 'box-to-box';
  }
  if (slot.role === 'FWD') {
    const wide = slot.y < 0.25 || slot.y > 0.75;
    if (wide) return 'inside-forward';
    if ((ref?.stats?.physical || 0) >= 82) return 'target-man';
    return (ref?.stats?.pace || 0) >= 85 ? 'advanced-forward' : 'poacher';
  }
  return null;
}

/** Roles a slot may take (for the tactics screen). */
export const rolesFor = (slotRole) => Object.entries(ROLES).filter(([, r]) => r.pos === slotRole).map(([id, r]) => ({ id, name: r.name }));

/**
 * How a CPU side changes its instructions, given the score and the clock.
 * Returns a partial tactics object (or null for no change). `late` is the
 * fraction of the match gone.
 */
export function adaptFor(diff, late, atHalf) {
  if (late > 0.8) {
    if (diff < 0) return { mentality: 'allout', defStyle: 'high', buildUp: 'long', line: 0.75, width: 0.68, tempo: 'fast' };
    if (diff > 0) return { mentality: 'defensive', defStyle: 'deep', buildUp: 'counter', line: 0.35, width: 0.45, tempo: 'slow' };
    return null;
  }
  if (atHalf) {
    if (diff <= -1) return { mentality: 'attacking', defStyle: 'high', buildUp: 'short', line: 0.62, tempo: 'normal' };
    if (diff >= 2) return { mentality: 'defensive', defStyle: 'deep', buildUp: 'counter', line: 0.4, tempo: 'normal' };
    if (diff === 1) return { defStyle: 'balanced', tempo: 'normal' };
  }
  return null;
}
