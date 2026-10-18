/**
 * v191 — the iPhone app's haptics and reminders (js/native.js), against a
 * fake Capacitor bridge: which moments buzz, that the setting turns them off,
 * that a burst of cues is one feeling, and what gets scheduled when.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetStorage } from './_dom.mjs';
import { resetAll, getState, update } from '../../js/state.js';
import { haptic, plannedReminders, rewardText, syncReminders, enableReminders, shouldAskReminders, REMINDER_IDS } from '../../js/native.js';
import { weekendWindow } from '../../js/weekend.js';

const calls = [];
function fakeBridge({ granted = true } = {}) {
  calls.length = 0;
  const pending = new Map();
  globalThis.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      Haptics: {
        impact: async (o) => { calls.push(['impact', o.style]); },
        notification: async (o) => { calls.push(['notification', o.type]); },
        selectionChanged: async () => { calls.push(['selection']); },
      },
      LocalNotifications: {
        checkPermissions: async () => ({ display: granted ? 'granted' : 'denied' }),
        requestPermissions: async () => ({ display: granted ? 'granted' : 'denied' }),
        cancel: async ({ notifications }) => { for (const n of notifications) pending.delete(n.id); },
        schedule: async ({ notifications }) => { for (const n of notifications) pending.set(n.id, n); },
        addListener: () => ({ remove() {} }),
      },
    },
  };
  return pending;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
beforeEach(() => { resetStorage(); resetAll(); delete globalThis.Capacitor; });

test('haptics: the Taptic Engine on the app, nothing when the setting is off, one feeling per burst', async () => {
  fakeBridge();
  assert.equal(haptic('shot'), true);
  assert.deepEqual(calls, [['impact', 'MEDIUM']]);
  assert.equal(haptic('shot'), false, 'a second cue inside 45 ms is the same moment');
  await wait(60);
  assert.equal(haptic('nonsense'), false, 'an unknown moment does nothing');
  calls.length = 0; haptic('goal'); await wait(300);
  assert.deepEqual(calls, [['impact', 'HEAVY'], ['impact', 'HEAVY'], ['notification', 'SUCCESS']], 'a goal is a double thump and a success');
  update((s) => { s.settings.rumble = false; });
  await wait(60); calls.length = 0;
  assert.equal(haptic('post'), false); assert.equal(calls.length, 0, 'the Vibration switch turns them off');
});

test('the login reward reads right in words', () => {
  assert.equal(rewardText({ apex: 300 }), '300 coins');
  assert.equal(rewardText({ pack: 'gold', apex: 1000 }), 'a Gold pack and 1,000 coins');
});

test('reminders: the streak after the day turns over, Weekend League when it opens, Career after three days', () => {
  const s = getState();
  // a Wednesday afternoon, today's reward already claimed on day 3 of a streak
  const now = new Date('2026-10-14T13:00:00Z');
  s.club.daily = { last: '2026-10-14', streak: 3, best: 3, claimedOn: '2026-10-14' };
  s.career = { clubId: 'x' };
  const plan = plannedReminders(s, now, { clubName: 'Glenholt United' });
  const by = Object.fromEntries(plan.map((r) => [r.kind, r]));
  assert.ok(by.daily && by.weekend && by.career, plan.map((r) => r.kind).join());
  assert.ok(by.daily.at > new Date('2026-10-15T00:00:00Z'), 'not before the new day exists');
  assert.equal(by.daily.at.getHours(), 18);
  assert.match(by.daily.body, /Day 4: 800 coins/);
  assert.equal(by.weekend.at.getTime(), new Date(weekendWindow(now).opensAt).getTime());
  assert.ok(by.career.at - now >= 3 * 864e5 - 1);
  assert.match(by.career.title, /^Glenholt United need their manager/);
  // unclaimed in the morning: tonight, today's reward
  s.club.daily.claimedOn = '2026-10-13';
  const morning = new Date(2026, 9, 14, 9, 0, 0);
  const p2 = plannedReminders(s, morning);
  const d2 = p2.find((r) => r.kind === 'daily');
  assert.equal(d2.at.getDate(), 14); assert.equal(d2.at.getHours(), 18);
  assert.match(d2.title, /waiting/);
  // inside the window with matches left: the nudge before it closes
  const fri = new Date(weekendWindow(now).opensAt.getTime() + 3600e3);
  const w = plannedReminders(s, fri).find((r) => r.kind === 'weekend');
  assert.match(w.body, /10 matches left/);
  assert.ok(w.at < weekendWindow(fri).closesAt);
  assert.ok(plannedReminders(s, now).every((r) => r.at > now), 'nothing in the past');
});

test('reminders are opt-in: scheduled only when on and allowed; the question is asked once, after two matches', async () => {
  const pending = fakeBridge();
  await syncReminders();
  assert.equal(pending.size, 0, 'off by default');
  assert.equal(shouldAskReminders(), false, 'not before a couple of matches');
  update((s) => { s.club.stats = { matches: 2 }; });
  assert.equal(shouldAskReminders(), true);
  assert.equal(await enableReminders(), true);
  assert.equal(getState().settings.reminders, true);
  assert.ok(pending.has(REMINDER_IDS.daily) && pending.has(REMINDER_IDS.weekend), [...pending.keys()].join());
  assert.equal(shouldAskReminders(), false, 'asked once');
  // a refusal at the iOS prompt leaves them off
  resetAll(); const p2 = fakeBridge({ granted: false });
  assert.equal(await enableReminders(), false);
  assert.equal(getState().settings.reminders, false); assert.equal(p2.size, 0);
});

test('on the web there is no bridge: no reminders offered, haptics fall back or do nothing', async () => {
  delete globalThis.Capacitor;
  update((s) => { s.club.stats = { matches: 5 }; });
  assert.equal(shouldAskReminders(), false);
  assert.equal(await syncReminders(), false);
  assert.doesNotThrow(() => haptic('goal'));
});
