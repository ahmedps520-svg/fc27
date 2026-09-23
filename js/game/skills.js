/**
 * Skill moves (v79): thirteen tricks, each gated by the player's skill stars
 * (data/traits.js `skillStars`: 1–5 from dribbling, +1 for a Trickster).
 *
 * A move is picked by where the stick points *relative to the way the player
 * is facing* — forward, back, to one side, or held neutral — plus which
 * modifier is held with the skill button: sprint, curl or lob. On touch, a
 * swipe on the skill button does the same job: its direction is the stick,
 * a long swipe is the sprint modifier, a swipe with a second finger down the
 * curl one (see screens/play.js). A move the player has not got the stars
 * for falls back to the best one in the same direction that he has.
 *
 * `fx` describes what the move does, and sim.js `skillMove` applies it:
 *   t       seconds the move lasts (a lunging tackle is beaten meanwhile)
 *   brake   how much of his speed he keeps as it starts
 *   burst   {fwd, side} m/s pushed at the end, relative to the facing
 *   turn    radians the carrier's facing swings (a drag-back is π)
 *   ball    'keep' | 'past' (knocked beyond the defender) | 'lift' (over him)
 *   freeze  chance an opponent close in is sold and stumbles
 *   spin    renderer spin (roulette-style)
 */
export const SKILL_MOVES = [
  { id: 'ball-roll', name: 'Ball roll', stars: 1, dir: 'side', mod: null, combo: 'Skill + sideways', fx: { t: 0.32, brake: 0.55, burst: { fwd: 0.5, side: 4.2 }, ball: 'keep', freeze: 0.1 } },
  { id: 'drag-back', name: 'Drag back', stars: 1, dir: 'back', mod: null, combo: 'Skill + back', fx: { t: 0.36, brake: 0.2, burst: { fwd: 1.5, side: 0 }, turn: Math.PI, ball: 'keep', freeze: 0.1 } },
  { id: 'stepover', name: 'Stepover', stars: 2, dir: 'fwd', mod: null, combo: 'Skill + forward', fx: { t: 0.42, brake: 0.35, burst: { fwd: 8, side: 0 }, ball: 'keep', freeze: 0.3 } },
  { id: 'feint', name: 'Body feint', stars: 2, dir: 'side', mod: 'sprint', combo: 'Skill + sideways + Sprint', fx: { t: 0.36, brake: 0.9, burst: { fwd: 1.5, side: 6.5 }, ball: 'keep', freeze: 0.35 } },
  { id: 'fake-shot', name: 'Fake shot', stars: 3, dir: 'fwd', mod: 'curl', combo: 'Skill + forward + Curl', fx: { t: 0.5, brake: 0.25, burst: { fwd: 3, side: 3.5 }, ball: 'keep', freeze: 0.65 } },
  { id: 'heel-chop', name: 'Heel chop', stars: 3, dir: 'side', mod: 'curl', combo: 'Skill + sideways + Curl', fx: { t: 0.34, brake: 0.3, burst: { fwd: 1, side: 7 }, turn: Math.PI / 2, ball: 'keep', freeze: 0.4 } },
  { id: 'roulette', name: 'Roulette', stars: 3, dir: 'back', mod: 'sprint', combo: 'Skill + back + Sprint', fx: { t: 0.62, brake: 0.5, burst: { fwd: 2.5, side: 2 }, ball: 'keep', freeze: 0.3, spin: true } },
  { id: 'nutmeg', name: 'Nutmeg', stars: 4, dir: 'fwd', mod: 'sprint', combo: 'Skill + forward + Sprint, a man in front', fx: { t: 0.32, brake: 1, burst: { fwd: 9, side: 2.2 }, ball: 'past', freeze: 0.5 } },
  { id: 'elastico', name: 'Elastico', stars: 4, dir: 'side', mod: 'lob', combo: 'Skill + sideways + Lob', fx: { t: 0.4, brake: 0.6, burst: { fwd: 2, side: 8 }, ball: 'keep', freeze: 0.55 } },
  { id: 'scoop-turn', name: 'Scoop turn', stars: 4, dir: 'back', mod: 'curl', combo: 'Skill + back + Curl', fx: { t: 0.5, brake: 0.35, burst: { fwd: 5, side: 0 }, turn: Math.PI, ball: 'keep', freeze: 0.35, spin: true } },
  { id: 'bridge', name: 'Bridge', stars: 4, dir: 'fwd', mod: 'lob', combo: 'Skill + forward + Lob, open grass', fx: { t: 0.3, brake: 1, burst: { fwd: 9.5, side: 3 }, ball: 'past', freeze: 0.2 } },
  { id: 'rainbow', name: 'Rainbow flick', stars: 5, dir: 'fwd', mod: 'lob', combo: 'Skill + forward + Lob, a man in front', fx: { t: 0.55, brake: 0.8, burst: { fwd: 6.5, side: 0 }, ball: 'lift', freeze: 0.5 } },
  { id: 'croqueta', name: 'La croqueta', stars: 5, dir: 'none', mod: null, combo: 'Skill, stick centred', fx: { t: 0.3, brake: 0.7, burst: { fwd: 1, side: 5.5 }, ball: 'keep', freeze: 0.5 } },
];

/**
 * Which move: direction ('fwd' | 'back' | 'side' | 'none') and modifier from
 * the input, the player's stars, and whether a defender is right in front.
 */
export function pickSkill(dir, mod, stars, foeAhead) {
  const allowed = (m) => m.stars <= stars;
  let want = SKILL_MOVES.filter((m) => m.dir === dir && m.mod === mod);
  // context: forward + sprint/lob depend on whether there is a man to beat
  if (dir === 'fwd' && mod === 'sprint') want = SKILL_MOVES.filter((m) => m.id === (foeAhead ? 'nutmeg' : 'stepover'));
  if (dir === 'fwd' && mod === 'lob') want = SKILL_MOVES.filter((m) => m.id === (foeAhead ? 'rainbow' : 'bridge'));
  const pick = want.find(allowed);
  if (pick) return pick;
  // fall back: the best move in that direction he does have, else a ball roll
  const same = SKILL_MOVES.filter((m) => (m.dir === dir || (dir === 'none' && m.dir === 'side')) && allowed(m)).sort((a, b) => b.stars - a.stars);
  return same[0] || SKILL_MOVES[0];
}

/** For the controls screen. */
export const skillList = () => SKILL_MOVES.map(({ id, name, stars, combo }) => ({ id, name, stars, combo }));
