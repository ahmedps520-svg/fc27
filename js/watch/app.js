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
import { playMatch } from './match.js';
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
  const best = coll.map((id) => WORLD.playersById[id]).filter(Boolean)
    .sort((a, b) => b.overall - a.overall)[0];
  const packs = s.club.packs || [];
  shell(`
    <p class="w-title">${store.name() || 'Your club'}</p>
    <div class="w-card">
      <div class="w-big">◈ ${(s.club.apex || 0).toLocaleString()}</div>
      <div class="w-sub">Apex balance</div>
    </div>
    <div class="w-row"><span>Cards</span><b>${coll.length}</b></div>
    <div class="w-row"><span>Packs waiting</span><b>${packs.length}</b></div>
    ${best ? `<div class="w-row"><span>Best card</span><b>${best.overall} ${best.short}</b></div>` : ''}
    <div class="w-row"><span>Synced</span><b>${store.syncLabel()}</b></div>
  `);
}

/* ------------------------------------------------------------------ *
 * Kick Off — the list of opponents, then the match
 * ------------------------------------------------------------------ */
function playScreen() {
  const clubs = WORLD.clubs.slice(0, 6);
  shell(`
    <p class="w-title">Kick Off · 60 seconds</p>
    <p class="w-sub">Drag to run. Tap the ball button to shoot or pass.</p>
    ${clubs.map((c) => `
      <button class="w-btn ghost" data-club="${c.id}" style="text-align:left">
        ${c.short} · ${c.name}
      </button>`).join('')}
  `);
  app.querySelectorAll('[data-club]').forEach((el) => el.addEventListener('click', () => {
    buzz(14);
    playMatch(app, el.dataset.club, (reward) => {
      if (reward) store.earn(reward);
      tab = 'play'; render();
    });
  }));
}

/* ------------------------------------------------------------------ *
 * Packs — the stripped-down store
 * ------------------------------------------------------------------ */
/* Four packs, not seventeen: the cheap one, the everyday one, the good one and
 * the dream. A watch store that needs scrolling to compare odds is a watch
 * store nobody uses. */
const WATCH_PACKS = ['bronze', 'silver', 'gold', 'prime'];

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
          <span class="w-count"> ${p.size} cards</span>
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

store.boot().then(render);
