/**
 * The reason to come back tomorrow.
 *
 * A watch game lives or dies on the glance: three small things to do today, a
 * streak that grows for showing up, both paid in the same Apex the packs cost.
 * This is watch-local on purpose — it is about *this* wrist's habit, not the
 * account — so it keeps its own key and never rides along in the cloud save.
 * The Apex it pays out does go through the store, which is what syncs.
 */
const KEY = 'apexxi.watch.daily.v1';

/* Every objective is a counter over one event the game already emits. Text is
 * written for 160 pixels: short, no clauses. */
const POOL = [
  { id: 'play1',  ev: 'match',    n: 1, text: 'Play a match',        pay: 250 },
  { id: 'play2',  ev: 'match',    n: 2, text: 'Play 2 matches',      pay: 450 },
  { id: 'goal2',  ev: 'goal',     n: 2, text: 'Score 2 goals',       pay: 400 },
  { id: 'goal4',  ev: 'goal',     n: 4, text: 'Score 4 goals',       pay: 700 },
  { id: 'win1',   ev: 'win',      n: 1, text: 'Win a match',         pay: 500 },
  { id: 'pack1',  ev: 'pack',     n: 1, text: 'Open a pack',         pay: 250 },
  { id: 'pack2',  ev: 'pack',     n: 2, text: 'Open 2 packs',        pay: 450 },
  { id: 'pen3',   ev: 'pengoal',  n: 3, text: 'Score 3 penalties',   pay: 350 },
  { id: 'penw',   ev: 'penwin',   n: 1, text: 'Win a shootout',      pay: 500 },
  { id: 'save1',  ev: 'pensave',  n: 1, text: 'Save a penalty',      pay: 300 },
  { id: 'hard1',  ev: 'hardwin',  n: 1, text: 'Win on Hard',         pay: 900 },
  { id: 'gold1',  ev: 'goldcard', n: 1, text: 'Pull a gold card',    pay: 400 },
];

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);

let d = null;

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
const write = () => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private or full */ } };

/* Three objectives a day, the same three all day, different tomorrow: a
 * seeded pick from the date so a reload never re-rolls them. */
function pickFor(date) {
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const list = POOL.slice();
  const out = [];
  while (out.length < 3 && list.length) {
    h = (h * 1103515245 + 12345) >>> 0;
    const i = h % list.length;
    const o = list.splice(i, 1)[0];
    if (out.some((x) => x.ev === o.ev)) continue;      // three different things, not two ways to count goals
    out.push(o.id);
  }
  return out;
}

/**
 * Called on boot and on every render — rolls the day over if it has changed.
 * Returns whether a streak bonus is waiting to be shown (first visit today).
 */
export function tick() {
  d = d || read() || { date: '', streak: 0, ids: [], prog: {}, done: [], bonus: 0 };
  const t = today();
  if (d.date === t) return false;
  d.streak = d.date === yesterday() ? d.streak + 1 : 1;
  d.date = t;
  d.ids = pickFor(t);
  d.prog = {};
  d.done = [];
  d.bonus = 100 * Math.min(7, d.streak);                // day one 100, capped at a week: 700
  write();
  return true;
}

export const streak = () => (tick(), d.streak);

/** The unclaimed streak bonus, if any; claiming zeroes it. */
export function claimBonus() {
  tick();
  const b = d.bonus || 0;
  d.bonus = 0;
  write();
  return b;
}

export function objectives() {
  tick();
  return d.ids.map((id) => {
    const o = POOL.find((x) => x.id === id);
    const have = Math.min(o.n, d.prog[o.ev] || 0);
    return { ...o, have, done: d.done.includes(id), complete: have >= o.n };
  });
}

/**
 * Report an event. Returns the Apex newly earned by objectives it completed,
 * so the caller can bank it (and buzz).
 */
export function event(ev, n = 1) {
  tick();
  d.prog[ev] = (d.prog[ev] || 0) + n;
  let pay = 0;
  for (const id of d.ids) {
    const o = POOL.find((x) => x.id === id);
    if (o.ev !== ev || d.done.includes(id) || (d.prog[ev] || 0) < o.n) continue;
    d.done.push(id);
    pay += o.pay;
  }
  write();
  return pay;
}
