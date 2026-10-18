/**
 * v191: the iPhone app's own extras — haptics and reminders — through the
 * Capacitor plugins its shell carries (app/package.json: @capacitor/haptics,
 * @capacitor/local-notifications). The native bridge puts each plugin on
 * window.Capacitor.Plugins. On the web there is no plugin: haptics fall back
 * to navigator.vibrate (Android browsers), and reminders are not offered.
 *
 * Reminders are local notifications the app schedules for itself — nothing
 * goes to a server and nothing about the player leaves the phone. They are
 * opt-in: the menu asks once, after a couple of matches (Apple's advice: ask
 * when the player can see why), and Settings → App can turn them off. All
 * three are re-planned from the save every time the app goes to the
 * background, so they always describe the state the player left it in.
 */
import { getState, update } from './state.js';
import { weekendWindow, currentWeekend, matchesLeft } from './weekend.js';
import { DAILY } from './progress.js';
import { tx, lang } from './i18n.js';

const plugin = (name) => globalThis.Capacitor?.Plugins?.[name] || null;
const native = () => globalThis.Capacitor?.isNativePlatform?.() === true;

/* ------------------------------- haptics -------------------------------- */
// each moment: steps run in order; a number is a pause (ms) between them
const FEEL = {
  goal: [['impact', 'HEAVY'], 110, ['impact', 'HEAVY'], 120, ['notification', 'SUCCESS']],
  post: [['impact', 'HEAVY']],
  bicycle: [['impact', 'HEAVY']],
  shot: [['impact', 'MEDIUM']],
  volley: [['impact', 'MEDIUM']],
  save: [['impact', 'MEDIUM']],
  foul: [['impact', 'HEAVY']],
  slide: [['impact', 'MEDIUM']],
  header: [['impact', 'LIGHT']],
  rip: [['impact', 'HEAVY']],
  step: [['impact', 'LIGHT']],
  reveal: [['notification', 'SUCCESS']],
  special: [['impact', 'HEAVY'], 90, ['notification', 'SUCCESS']],
  tap: [['selection']],
};
// the same moments as a phone browser can play them (ms on, off, on…)
const BUZZ = { goal: [70, 60, 90], post: 45, bicycle: 45, shot: 28, volley: 28, save: 30, foul: 40, slide: 30, header: 18, rip: 45, step: 14, reveal: [30, 50, 60], special: [50, 60, 90], tap: 8 };

let lastAt = -1e9;
/** Play a moment's haptic, if the player wants them and the device can. Returns whether it played. */
export function haptic(kind) {
  if (getState().settings.rumble === false) return false;
  const steps = FEEL[kind]; if (!steps) return false;
  const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  if (now - lastAt < 45 && kind !== 'goal') return false;      // a burst of cues is one feeling, not a drone
  lastAt = now;
  const H = native() ? plugin('Haptics') : null;
  if (H) {
    let delay = 0;
    for (const s of steps) {
      if (typeof s === 'number') { delay += s; continue; }
      const run = () => {
        const p = s[0] === 'impact' ? H.impact?.({ style: s[1] })
          : s[0] === 'notification' ? H.notification?.({ type: s[1] })
          : H.selectionChanged?.();
        p?.catch?.(() => {});
      };
      if (delay) setTimeout(run, delay); else run();
    }
    return true;
  }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(BUZZ[kind]); return true; } catch { return false; }
  }
  return false;
}
export const hasNativeHaptics = () => native() && !!plugin('Haptics');

/* ------------------------------ reminders ------------------------------- */
export const REMINDER_IDS = { daily: 9101, weekend: 9102, career: 9103 };
const EVENING = 18;            // reminders land at six in the evening, local time
const isoDay = (d) => d.toISOString().slice(0, 10);
/** The first local `EVENING` o'clock at or after `from`. */
function eveningFrom(from) {
  const at = new Date(from); at.setHours(EVENING, 0, 0, 0);
  if (at < from) at.setDate(at.getDate() + 1);
  return at;
}
const PACK_AR = { bronze: 'برونزية', silver: 'فضية', gold: 'ذهبية' };
/** A login reward in words: "a Gold pack and 1,000 coins" / "حزمة ذهبية و1,000 عملة". */
export function rewardText(r) {
  const ar = lang() === 'ar';
  const pack = r.pack ? (ar ? `حزمة ${PACK_AR[r.pack] || r.pack}` : `a ${r.pack[0].toUpperCase()}${r.pack.slice(1)} pack`) : '';
  const coins = r.apex ? `${r.apex.toLocaleString('en-GB')} ${ar ? 'عملة' : 'coins'}` : '';
  return [pack, coins].filter(Boolean).join(ar ? ' و' : ' and ');
}

/**
 * What to remind the player about, from the save and the clock. Pure, for
 * the tests: [{ kind, at: Date, title, body, go }].
 */
export function plannedReminders(s, now = new Date(), { clubName = '' } = {}) {
  const out = [];
  // 1. the login streak. The day turns over at midnight UTC (progress.js), so
  //    "tomorrow's" reward is only there once that has passed.
  const d = s.club?.daily || {};
  const today = isoDay(now);
  const claimed = d.claimedOn === today;
  const streakNow = d.last === today ? (d.streak | 0) : 0;
  if (!claimed && now.getHours() < EVENING - 1) {
    const day = (Math.max(1, streakNow) - 1) % 7;
    out.push({ kind: 'daily', at: eveningFrom(now), title: tx('Your daily reward is waiting'), body: `${tx('Day')} ${day + 1}: ${rewardText(DAILY[day])}.`, go: 'today' });
  } else {
    const turn = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const day = (claimed ? streakNow : 0) % 7;          // tomorrow carries the streak on only if today was claimed
    out.push({ kind: 'daily', at: eveningFrom(new Date(turn.getTime() + 60e3)), title: tx('Keep your streak going'), body: `${tx('Day')} ${day + 1}: ${rewardText(DAILY[day])}.`, go: 'today' });
  }
  // 2. Weekend League: when it opens, or a nudge before it closes with matches left
  const w = weekendWindow(now);
  if (!w.open) {
    out.push({ kind: 'weekend', at: new Date(w.opensAt), title: tx('Weekend League is open'), body: tx('Ten matches to climb the ranks. Rewards on Monday.'), go: 'weekend' });
  } else if (s.club) {
    const left = matchesLeft(currentWeekend(s.club, now));
    const nudge = new Date(new Date(w.closesAt).getTime() - 6 * 3600e3);
    if (left > 0 && nudge > now) out.push({ kind: 'weekend', at: nudge, title: tx('Weekend League closes soon'), body: `${left} ${tx(left === 1 ? 'match left to play.' : 'matches left to play.')}`, go: 'weekend' });
  }
  // 3. Career: a gentle word after three days away
  if (s.career) {
    const at = eveningFrom(new Date(now.getTime() + 3 * 864e5));
    out.push({ kind: 'career', at, title: clubName ? `${clubName} ${tx('need their manager')}` : tx('Your club needs its manager'), body: tx('The next match is waiting in Career.'), go: 'career' });
  }
  return out.filter((r) => r.at > now);
}

export const remindersAvailable = () => native() && !!plugin('LocalNotifications');

/** Re-plan every reminder from the save (cancel all three, schedule what applies). */
export async function syncReminders() {
  const LN = remindersAvailable() ? plugin('LocalNotifications') : null; if (!LN) return false;
  const s = getState();
  try { await LN.cancel({ notifications: Object.values(REMINDER_IDS).map((id) => ({ id })) }); } catch { /* none pending */ }
  if (s.settings.reminders !== true) return false;
  try {
    const perm = await LN.checkPermissions();
    if (perm?.display !== 'granted') return false;
    let clubName = '';
    if (s.career?.clubId) { try { clubName = (await import('./career.js')).careerClub(s.career.clubId)?.name || ''; } catch { /* no name */ } }
    const list = plannedReminders(s, new Date(), { clubName });
    if (!list.length) return true;
    await LN.schedule({ notifications: list.map((r) => ({ id: REMINDER_IDS[r.kind], title: r.title, body: r.body, schedule: { at: r.at, allowWhileIdle: true }, extra: { go: r.go } })) });
    return true;
  } catch { return false; }
}

/** Ask iOS for permission (the system prompt) and turn reminders on if given. */
export async function enableReminders() {
  const LN = remindersAvailable() ? plugin('LocalNotifications') : null; if (!LN) return false;
  let ok = false;
  try { ok = (await LN.requestPermissions())?.display === 'granted'; } catch { ok = false; }
  update((s) => { s.settings.reminders = ok; s.flags = s.flags || {}; s.flags.remindAsked = true; });
  if (ok) await syncReminders();
  return ok;
}
export async function disableReminders() {
  update((s) => { s.settings.reminders = false; });
  await syncReminders();
}

/** The menu's one-time question: only in the app, only once, only after two matches. */
export function shouldAskReminders(s = getState()) {
  return remindersAvailable() && !s.flags?.remindAsked && s.settings.reminders !== true && ((s.club?.stats?.matches | 0) >= 2);
}
export function declineReminders() { update((s) => { s.flags = s.flags || {}; s.flags.remindAsked = true; }); }

/** Wire it up once at boot: re-plan on the way to the background; a tapped reminder opens its screen. */
let wired = false;
export function initNative(navigate) {
  if (wired || !remindersAvailable()) return;
  wired = true;
  document.addEventListener('visibilitychange', () => { if (document.hidden) syncReminders(); });
  try {
    plugin('LocalNotifications').addListener?.('localNotificationActionPerformed', (e) => {
      const go = e?.notification?.extra?.go;
      if (go && ['today', 'weekend', 'career'].includes(go)) setTimeout(() => navigate(go), 300);
    });
  } catch { /* no listener */ }
  syncReminders();
}
