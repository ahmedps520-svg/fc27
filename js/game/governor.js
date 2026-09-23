/**
 * The frame-time governor (v87): drop effects before the frame rate drops.
 *
 * It watches the time each frame really took (smoothed) and moves a load
 * level up when frames stay slow and back down when they stay quick:
 *
 *   0  everything the quality tier asked for
 *   1  the post chain off (depth of field, bloom, grading, reflections)
 *   2  + shadows frozen and the nets simulated at one step
 *   3  + the picture rendered at 80% resolution
 *   4  + at 65% resolution
 *
 * Slow means worse than `down` ms for `holdDown` seconds; quick means better
 * than `up` ms for `holdUp` seconds. After a change it waits `cooldown`
 * seconds before judging again, so it never flaps between two levels. It is
 * the renderer's picture that gives way — the simulation and its timing are
 * never touched.
 */
export function createGovernor({ start = 0, max = 4, down = 38, up = 21, holdDown = 2.5, holdUp = 8, cooldown = 3 } = {}) {
  let ema = 16.7; let level = start; let overT = 0; let underT = 0; let cool = 0;
  const changes = [];
  return {
    /** One frame: its wall time in ms. Returns the new level if it moved, else null. */
    sample(frameMs) {
      const ms = Math.min(250, Math.max(1, frameMs));
      const dt = ms / 1000;
      ema += (ms - ema) * 0.08;
      if (cool > 0) { cool -= dt; return null; }
      overT = ema > down ? overT + dt : 0;
      underT = ema < up ? underT + dt : 0;
      let next = level;
      if (overT >= holdDown && level < max) next = level + 1;
      else if (underT >= holdUp && level > start) next = level - 1;
      if (next === level) return null;
      level = next; overT = 0; underT = 0; cool = cooldown;
      changes.push({ level, ema: Math.round(ema * 10) / 10 });
      return level;
    },
    level: () => level,
    ema: () => ema,
    changes: () => changes.slice(),
  };
}

/** The renderer's knobs for a load level. */
export function loadFor(level) {
  return {
    post: level < 1,
    shadows: level < 2,
    netSteps: level >= 2 ? 1 : null,
    scale: level >= 4 ? 0.65 : level >= 3 ? 0.8 : 1,
  };
}
