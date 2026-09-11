/**
 * APEX XI on the wrist.
 *
 * A separate, deliberately small app that shares the game's rules rather than
 * its screens: the same simulation, the same pack odds, the same world of
 * players — none of the phone's UI. It is served at /watch.html and is the
 * whole page, because a watch has no room for two things at once.
 *
 * What it is: three screens (Club, Kick Off, Packs), a numeric pairing flow
 * instead of a password, and a save that syncs back to the account so a pack
 * opened on the wrist is in the collection on the phone.
 *
 * What it deliberately is not: a squad editor, a market, a division ladder.
 * Those need a screen you can read a table on.
 */
import { WORLD, getClub } from '../data/generator.js';
import { PACKS, openPack, dupValue, packTone } from '../data/packs.js';
import { RARITY } from '../data/pools.js';
import { playMatch, LEVELS } from './match.js';
import { playPens } from './pens.js';
import * as daily from './daily.js';
import { openPackScreen } from './pack.js';
import * as store from './store.js';

const app = document.getElementById('wApp');
let tab = 'club';

/* A tap should feel like something on a watch — the Taptic engine is what the
 * platform uses instead of sound, and `vibrate` is the only handle a web page
 * gets on it. Absent (desktop, iOS Safari) it silently does nothing. */
export const buzz = (ms = 8) => { try { navigator.vibrate?.(ms); } catch { /* unsupported */ } };

const shell = (inner, withTabs = true) => {
  app.innerHTML = `
    <div class="w-screen" id="wScreen">${inner}</div>
    ${withTabs ? `
      <nav class="w-tabs">
        ${[['club', '◉'], ['play', '⚽'], ['packs', '▤']].map(([id, ic]) =>
          `<button class="w-tab ${tab === id ? 'on' : ''}" data-tab="${id}">${ic}</button>`).join('')}
      </nav>` : ''}`;
  app.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => {
    buzz(); tab = el.dataset.tab; render();
  }));
};

/* ------------------------------------------------------------------ *
 * Pairing
 * ------------------------------------------------------------------ */
function pairScreen(err = '') {
  shell(`
    <p class="w-title">Pair your watch</p>
    <p class="w-sub">On your phone: Ultimate XI → Online → <b>Pair a watch</b>. Enter the six digits.</p>
    <input class="w-code" id="wPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="––––––">
    <button class="w-btn" id="wPair">Pair</button>
    <button class="w-btn ghost" id="wSolo">Play without an account</button>
    ${err ? `<p class="w-err">${err}</p>` : ''}
  `, false);
  app.querySelector('#wPair').addEventListener('click', async () => {
    buzz(12);
    const code = app.querySelector('#wPin').value.replace(/\D/g, '');
    if (code.length !== 6) { pairScreen('Six digits, from the phone.'); return; }
    const r = await store.pair(code);
    if (r.error) { pairScreen(r.error); return; }
    buzz(30); tab = 'club'; render();
  });
  app.querySelector('#wSolo').addEventListener('click', () => { store.goSolo(); buzz(); render(); });
}

/* ------------------------------------------------------------------ *
 * Club — the glance
 * ------------------------------------------------------------------ */
function clubScreen() {
  const s = store.save();
  const coll = s.club.collection || [];
  const cards = coll.map((id) => WORLD.playersById[id]).filter(Boolean)
    .sort((a, b) => b.overall - a.overall);
  const best = cards[0];
  const packs = s.club.packs || [];
  const bonus = daily.claimBonus();
  if (bonus) { store.earn(bonus); buzz([10, 30, 10]); }
  const objs = daily.objectives();
  shell(`
    <p class="w-title">${store.name() || 'Your club'}</p>
    <div class="w-card">
      <div class="w-big">◈ ${(s.club.apex || 0).toLocaleString()}</div>
      <div class="w-sub">Apex balance${bonus ? ` · <b class="w-up">+${bonus} streak</b>` : ''}</div>
    </div>
    <div class="w-row"><span>Day streak</span><b>🔥 ${daily.streak()}</b></div>
    <p class="w-title" style="margin-top:8px">Today</p>
    ${objs.map((o) => `
      <div class="w-obj ${o.done ? 'done' : ''}">
        <span>${o.text}</span>
        <b>${o.done ? '✓' : `${o.have}/${o.n}`}</b>
        <i style="width:${Math.round(100 * o.have / o.n)}%"></i>
      </div>`).join('')}
    <div class="w-row"><span>Cards</span><b>${coll.length}</b></div>
    <div class="w-row"><span>Packs waiting</span><b>${packs.length}</b></div>
    ${best ? `<div class="w-row"><span>Best card</span><b>${best.overall} ${best.short}</b></div>` : ''}
    ${cards.length ? `<p class="w-title" style="margin-top:8px">Squad</p>
      <div class="w-grid">${cards.slice(0, 12).map((p) => `
        <div class="w-mini" style="--rar:${RARITY[p.rarity]?.color || '#888'}">
          <b>${p.overall}</b><span>${p.position}</span><em>${p.short}</em>
        </div>`).join('')}</div>` : ''}
    <div class="w-row"><span>Synced</span><b>${store.syncLabel()}</b></div>
  `);
}

/* Objective payouts are banked where the event happens, with a buzz so the
 * wrist knows something paid out without a screen to read. */
const report = (ev, n = 1) => {
  const pay = daily.event(ev, n);
  if (pay) { store.earn(pay); buzz([10, 30, 10, 30, 10]); }
};

/* ------------------------------------------------------------------ *
 * Kick Off — the list of opponents, then the match
 * ------------------------------------------------------------------ */
let level = 'normal';
function playScreen() {
  const clubs = WORLD.clubs;
  shell(`
    <p class="w-title">Kick Off · 60 seconds</p>
    <div class="w-chips">${Object.entries(LEVELS).map(([id, l]) =>
      `<button class="w-chip ${level === id ? 'on' : ''}" data-level="${id}">${l.label}</button>`).join('')}</div>
    <button class="w-btn" data-pens>⚽ Penalties</button>
    <p class="w-sub" style="margin-top:8px">Pick an opponent. Drag to run, tap KICK.</p>
    ${clubs.map((c) => `
      <button class="w-btn ghost" data-club="${c.id}" style="text-align:left">
        ${c.short} · ${c.name}
      </button>`).join('')}
  `);
  app.querySelectorAll('[data-level]').forEach((el) => el.addEventListener('click', () => {
    buzz(); level = el.dataset.level; playScreen();
  }));
  app.querySelector('[data-pens]').addEventListener('click', () => {
    buzz(14);
    const opp = clubs[Math.floor(Math.random() * clubs.length)];
    playPens(app, { oppShort: opp.short, onEvent: (ev) => report(ev) }, (reward) => {
      if (reward) store.earn(reward);
      tab = 'play'; render();
    });
  });
  app.querySelectorAll('[data-club]').forEach((el) => el.addEventListener('click', () => {
    buzz(14);
    playMatch(app, el.dataset.club, (reward, stats) => {
      if (reward) store.earn(reward);
      report('match');
      if (stats?.goals) report('goal', stats.goals);
      if (stats?.won) { report('win'); if (stats.level === 'hard') report('hardwin'); }
      tab = 'play'; render();
    }, level);
  }));
}

/* ------------------------------------------------------------------ *
 * Packs — the stripped-down store
 * ------------------------------------------------------------------ */
/* Four packs, not seventeen: the cheap one, the everyday one, the good one and
 * the dream. A watch store that needs scrolling to compare odds is a watch
 * store nobody uses. */
const WATCH_PACKS = ['bronze', 'silver', 'dip', 'gold', 'prime'];

function packsScreen() {
  const s = store.save();
  const owned = s.club.packs || [];
  const list = WATCH_PACKS.map((id) => PACKS.find((p) => p.id === id)).filter(Boolean);
  shell(`
    <p class="w-title">Packs</p>
    <div class="w-row"><span>Balance</span><b>◈ ${(s.club.apex || 0).toLocaleString()}</b></div>
    ${owned.length ? `
      <button class="w-btn" data-open="${owned[0]}">Open ${(PACKS.find((p) => p.id === owned[0]) || {}).name || 'pack'} (${owned.length})</button>` : ''}
    ${list.map((p) => {
      const afford = (s.club.apex || 0) >= p.cost;
      const free = p.cost === 0 && Date.now() >= (s.club.freeAt || 0);
      return `
        <button class="w-btn ${afford || free ? 'ghost' : 'ghost'}" data-buy="${p.id}"
                ${afford || free ? '' : 'disabled style="opacity:.4"'}>
          ${p.name} · ${p.cost === 0 ? (free ? 'FREE' : 'soon') : `◈${p.cost.toLocaleString()}`}
          <span class="w-count"> ${p.size} card${p.size === 1 ? '' : 's'}</span>
        </button>`;
    }).join('')}
  `);
  app.querySelectorAll('[data-buy]').forEach((el) => el.addEventListener('click', () => {
    const pack = PACKS.find((p) => p.id === el.dataset.buy);
    const s2 = store.save();
    if (pack.cost === 0 && Date.now() < (s2.club.freeAt || 0)) return;
    if ((s2.club.apex || 0) < pack.cost) return;
    buzz(18);
    store.buy(pack);
    runPack(pack);
  }));
  app.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => {
    const pack = PACKS.find((p) => p.id === el.dataset.open);
    buzz(18);
    store.consume(pack.id);
    runPack(pack);
  }));
}

function runPack(pack) {
  const s = store.save();
  const seen = new Set(s.club.collection || []);
  const drawn = openPack(pack, seen);
  openPackScreen(app, pack, drawn, {
    rarity: RARITY, tone: packTone(pack), dupValue,
    onDone: (added, coins) => {
      store.addCards(drawn);
      if (coins) store.earn(coins);
      report('pack');
      if (drawn.some(({ p }) => ['gold', 'special', 'star', 'icon'].includes(p.rarity))) report('goldcard');
      tab = 'packs';
      render();
    },
  });
}

/* ------------------------------------------------------------------ */
function render() {
  if (!store.ready()) { pairScreen(); return; }
  if (tab === 'play') playScreen();
  else if (tab === 'packs') packsScreen();
  else clubScreen();
}

/* Boot never blocks on the network: a pull that fails or hangs still gets a
 * playable club from what the watch remembers. The flag tells the page's
 * error surface (watch.html) that the app is up, so late noise stays quiet. */
const BOOT_MS = 6000;
Promise.race([store.boot(), new Promise((r) => setTimeout(r, BOOT_MS))])
  .catch(() => {})
  .then(() => {
    try { render(); window.__apexWatchBooted = true; }
    catch (e) { window.__apexWatchFail?.(e?.message || String(e)); }
  });
