/**
 * The field of play (v80).
 *
 * Until now the pitch was a constant — 105 x 68, 7.32 m goals, an 18-yard box —
 * baked into every module that needed it. Small-sided football needs a smaller
 * one: five-a-side on a 60 x 38 pitch with 5 m goals, futsal on 40 x 20 with
 * 3 m goals, and (Round 12) the street cages. So the field is data now, set
 * once when a match is created (`setField`), and read live by the sim, the
 * renderers and the camera: `PITCH` is the same object everywhere and the
 * `let` bindings below are live ES-module exports, so an importer always sees
 * the current value.
 *
 * Everything that is a real-world distance on a full pitch (the penalty spot
 * at 11 m, the 9.15 m circle) is carried here too, so the lines, the wall and
 * the spot scale with the pitch.
 */

export const PITCH = { w: 105, h: 68 };

export const FIELDS = {
  full: { id: 'full', w: 105, h: 68, goalHalf: 5.5, goalHeight: 2.44, boxW: 16.5, boxHalf: 20, sixW: 5.5, sixHalf: 9.16, spot: 11, circle: 9.15, players: 11, walls: false, offside: true },
  fives: { id: 'fives', w: 60, h: 38, goalHalf: 2.5, goalHeight: 2.2, boxW: 8, boxHalf: 10, sixW: 3, sixHalf: 5, spot: 7, circle: 5, players: 5, walls: false, offside: false },
  futsal: { id: 'futsal', w: 40, h: 20, goalHalf: 1.5, goalHeight: 2, boxW: 6, boxHalf: 7.5, sixW: 0, sixHalf: 0, spot: 6, circle: 3, players: 5, walls: false, offside: false },
};

/** The live values. */
export let CY = 34;
export let GOAL_HALF = 5.5;
export let GOAL_HEIGHT = 2.44;
export const BOX = { w: 16.5, half: 20 };
export const FIELD = { ...FIELDS.full };
/** How big this pitch is against a full one (1 on a full pitch) — for scaling absolute distances. */
export let SCALE = 1;

export function setField(spec = 'full') {
  const f = typeof spec === 'string' ? (FIELDS[spec] || FIELDS.full) : { ...FIELDS.full, ...spec };
  PITCH.w = f.w; PITCH.h = f.h;
  CY = f.h / 2;
  GOAL_HALF = f.goalHalf;
  GOAL_HEIGHT = f.goalHeight;
  BOX.w = f.boxW; BOX.half = f.boxHalf;
  Object.assign(FIELD, f);
  SCALE = f.w / 105;
  return FIELD;
}
