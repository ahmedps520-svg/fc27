/**
 * Goal celebrations (v110, backlog #15).
 *
 * There used to be one: the scorer ran to the corner and everybody hopped
 * with their arms up. Now the scorer does one of sixteen, and a person picks
 * their own side's (Settings → Celebration; Random by default). The CPU's
 * scorers pick by who they are and how many they have scored — never from
 * Math.random, so the balance sweep is untouched.
 *
 * The sim only chooses (`p.celebKind` on the scorer). What a celebration looks
 * like is `celebPose(kind, t, moving)`, one description both renderers read:
 *
 *   lift    metres the body is off the turf
 *   lean    pitch, radians forward (a bow) or back (a knee slide)
 *   roll    radians sideways (the airplane banks)
 *   spin    extra turn about the vertical, radians
 *   flip    a full somersault's progress, radians (0 → 2π)
 *   kneel   0–1: down onto the knees
 *   belly   0–1: flat on the front, sliding
 *   armL, armR  { raise, fwd, bend }:
 *     raise  sideways, 0 hanging … 1 level with the shoulder … 2 overhead
 *     fwd    forwards, 0 hanging … 1 level in front … 2 overhead
 *     bend   the elbow, 0 straight … 1 a right angle … 2 hand at the shoulder
 *   mouth   0–1, shouting
 *
 * Names are this game's own.
 */

export const CELEBRATIONS = [
  { id: 'corner', name: 'Corner Run', blurb: 'Off to the corner flag, arms up, shouting.' },
  { id: 'kneeslide', name: 'Knee Slide', blurb: 'Down on the knees and slide, leaning back.' },
  { id: 'airplane', name: 'Airplane', blurb: 'Arms out wide, banking through the turns.' },
  { id: 'skypoint', name: 'Sky Point', blurb: 'Both arms straight up, pointing at the sky.' },
  { id: 'shush', name: 'Shush', blurb: 'A finger to the lips for the away end.' },
  { id: 'heart', name: 'Heart Hands', blurb: 'Hands together over the heart, for the home fans.' },
  { id: 'salute', name: 'Salute', blurb: 'Stand to attention and salute.' },
  { id: 'icecold', name: 'Ice Cold', blurb: 'Stop dead, arms folded, not a flicker.' },
  { id: 'spinjump', name: 'Spin Jump', blurb: 'Leap, turn in the air, land arms down and wide.' },
  { id: 'fistpump', name: 'Fist Pump', blurb: 'Pumping the fist, again and again.' },
  { id: 'bow', name: 'Take a Bow', blurb: 'A slow bow to the crowd.' },
  { id: 'robot', name: 'The Robot', blurb: 'Stiff arms, jerky turns.' },
  { id: 'cradle', name: 'Cradle', blurb: 'Rocking a baby — one for the family.' },
  { id: 'cupear', name: 'Cup the Ear', blurb: "Hand to the ear: can't hear you." },
  { id: 'bellyslide', name: 'Belly Slide', blurb: 'Dive and slide on the front across the grass.' },
  { id: 'backflip', name: 'Backflip', blurb: 'A standing backflip. Show-off.' },
];
const IDS = CELEBRATIONS.map((c) => c.id);

/** A known kind, or null. */
export const celebrationOf = (id) => (IDS.includes(id) ? id : null);

/**
 * The scorer's celebration: a person's own pick for their side, otherwise
 * one chosen by who scored and how many they have — the same player tends to
 * the same few, as real ones do.
 */
export function pickCelebration(choice, seedId = '', nth = 0) {
  const own = celebrationOf(choice);
  if (own) return own;
  let h = 2166136261;
  for (const ch of String(seedId)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const favourites = [(h >>> 0) % IDS.length, (h >>> 8) % IDS.length, (h >>> 16) % IDS.length];
  return IDS[favourites[nth % 3]];
}

const arm = (raise = 0, fwd = 0, bend = 0) => ({ raise, fwd, bend });
const REST = arm(0.08, 0.05, 0.25);
const ease = (x) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };

/**
 * How a celebration looks `t` seconds into the goal, while running to the
 * spot (`moving`) or once there. The team-mates, and the corner run, keep
 * the old cheer.
 */
export function celebPose(kind, t, moving) {
  const P = { lift: 0, lean: 0, roll: 0, spin: 0, flip: 0, kneel: 0, belly: 0, armL: REST, armR: REST, mouth: 0.5 + Math.abs(Math.sin(t * 6.5)) * 0.5 };
  const hop = Math.abs(Math.sin(t * 6.5)) * 0.22;
  const cheer = () => { const s = Math.sin(t * 5); P.lift = hop; P.armL = arm(1.55 + s * 0.12, 0.6, 0.3); P.armR = arm(1.55 - s * 0.12, 0.6, 0.3); };
  switch (kind) {
    case 'kneeslide': {
      // run in, then drop and slide leaning back, arms flung wide
      const k = ease((t - 0.9) / 0.25);
      if (t < 0.9) { P.armL = arm(0.3, 0.2, 0.5); P.armR = arm(0.3, 0.2, 0.5); break; }
      P.kneel = k; P.lean = -0.45 * k;
      P.armL = arm(1.3, 0.4, 0.2); P.armR = arm(1.3, 0.4, 0.2);
      break;
    }
    case 'airplane': {
      const w = Math.sin(t * 2.2);
      P.roll = (moving ? 0.32 : 0.12) * w; P.lean = 0.12;
      P.armL = arm(1, 0, 0); P.armR = arm(1, 0, 0);
      break;
    }
    case 'skypoint':
      if (moving) { cheer(); break; }
      P.armL = arm(0.2, 1.9, 0); P.armR = arm(0.2, 1.9, 0); P.lean = -0.1; P.mouth = 0.2;
      break;
    case 'shush':
      if (moving) { P.armR = arm(0.1, 1.1, 1.6); P.mouth = 0; break; }
      P.armR = arm(0.1, 1.15, 1.7); P.armL = arm(0.12, 0, 0.1); P.mouth = 0; P.lean = 0.04;
      break;
    case 'heart':
      if (moving) { cheer(); break; }
      P.armL = arm(0.1, 0.4, 1.05); P.armR = arm(0.1, 0.4, 1.05); P.mouth = 0.1;
      break;
    case 'salute':
      if (moving) { cheer(); break; }
      P.armR = arm(1.05, 0.35, 1.85); P.armL = arm(0.05, 0, 0); P.mouth = 0;
      break;
    case 'icecold':
      // no run, no shout: stands where he is, arms folded
      P.armL = arm(0.1, 0.3, 1.15); P.armR = arm(0.1, 0.3, 1.15); P.mouth = 0;
      break;
    case 'spinjump': {
      if (moving) { cheer(); break; }
      // every 2.2 s: a leap with a half turn, then held on landing, arms down and wide
      const c = (t % 2.2) / 2.2;
      const air = c < 0.3 ? Math.sin((c / 0.3) * Math.PI) : 0;
      P.lift = air * 0.55; P.spin = ease(c / 0.3) * Math.PI;
      P.armL = arm(c < 0.3 ? 1.6 : 0.7, 0.1, 0); P.armR = arm(c < 0.3 ? 1.6 : 0.7, 0.1, 0);
      P.kneel = c > 0.3 && c < 0.42 ? 0.25 : 0;
      break;
    }
    case 'fistpump': {
      const s = Math.max(0, Math.sin(t * 7));
      P.armR = arm(0.25, 0.4 + s * 0.9, 1.4 - s * 0.6); P.armL = arm(0.2, 0.2, 0.6); P.lift = hop * 0.5;
      break;
    }
    case 'bow':
      if (moving) { cheer(); break; }
      P.lean = 0.85 * ease(Math.sin(Math.min(1, ((t % 2.4) / 2.4)) * Math.PI) * 1.4);
      P.armR = arm(0.1, 0.45, 1.3); P.armL = arm(0.2, -0.3, 0.2); P.mouth = 0;
      break;
    case 'robot': {
      // jerky: the pose snaps between steps four times a second
      const step = Math.floor(t * 4) % 4;
      P.spin = [0, 0.35, 0, -0.35][step];
      P.armL = arm(0.1, [1, 0.2, 1, 0.6][step], [1, 1, 0.2, 1][step]);
      P.armR = arm(0.1, [0.2, 1, 0.6, 1][step], [1, 0.2, 1, 1][step]);
      P.mouth = 0;
      break;
    }
    case 'cradle': {
      if (moving) { cheer(); break; }
      const r = Math.sin(t * 3.4);
      P.spin = r * 0.3;
      P.armL = arm(0.08, 0.45 + r * 0.1, 0.85); P.armR = arm(0.08, 0.45 - r * 0.1, 0.85); P.mouth = 0.1;
      break;
    }
    case 'cupear':
      P.armL = arm(1.15, 0.25, 1.75); P.armR = arm(0.3, 0.2, 0.3); P.lean = 0.08;
      break;
    case 'bellyslide': {
      if (t < 0.9) { cheer(); break; }
      const k = ease((t - 0.9) / 0.2);
      P.belly = k; P.armL = arm(1.6, 1, 0.1); P.armR = arm(1.6, 1, 0.1);
      break;
    }
    case 'backflip': {
      if (moving) { cheer(); break; }
      // every 2.4 s: crouch, a somersault backwards, land
      const c = (t % 2.4) / 2.4;
      const f = c < 0.08 ? 0 : c < 0.4 ? (c - 0.08) / 0.32 : 1;
      P.kneel = c < 0.08 ? 0.35 : c > 0.4 && c < 0.5 ? 0.3 : 0;
      P.lift = c >= 0.08 && c < 0.4 ? Math.sin(f * Math.PI) * 0.9 : 0;
      P.flip = -f * Math.PI * 2;
      P.armL = arm(0.3, c < 0.08 ? -0.4 : 1.8, 0.1); P.armR = arm(0.3, c < 0.08 ? -0.4 : 1.8, 0.1);
      break;
    }
    case 'refcard':
      // v112: not a celebration — the referee holding a card up (game/referee.js)
      P.armR = arm(0.2, 1.95, 0); P.armL = arm(0.08, 0.05, 0.2); P.mouth = 0;
      break;
    default: cheer();
  }
  return P;
}

/**
 * An arm's two segments as unit directions in his own frame — [forward,
 * outward, up], outward being away from the body on that arm's side. The
 * upper arm hangs, is raised sideways and swung forwards; the elbow then
 * folds the forearm towards the front of the body, up and in (a hand to the
 * mouth, the ear, the chest, the brow), `bend` 1 being a right angle.
 */
export function armDirs(a) {
  const ab = a.raise * Math.PI / 2; const fl = a.fwd * Math.PI / 2;
  const o = Math.sin(ab); const z0 = -Math.cos(ab);
  const u = [-z0 * Math.sin(fl), o, z0 * Math.cos(fl)];
  // the fold goes towards forward-up-and-in, whatever is left of that once the upper arm's own line is taken out
  const t = [0.6, -0.55, 0.6];
  const dot = t[0] * u[0] + t[1] * u[1] + t[2] * u[2];
  let n = [t[0] - dot * u[0], t[1] - dot * u[1], t[2] - dot * u[2]];
  const nl = Math.hypot(n[0], n[1], n[2]);
  n = nl > 1e-4 ? n.map((x) => x / nl) : [1, 0, 0];
  const b = Math.min(2, a.bend) * Math.PI / 2 * 0.9;
  const f = [u[0] * Math.cos(b) + n[0] * Math.sin(b), u[1] * Math.cos(b) + n[1] * Math.sin(b), u[2] * Math.cos(b) + n[2] * Math.sin(b)];
  return { upper: u, fore: f };
}
