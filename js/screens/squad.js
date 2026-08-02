import { getState, update, DIVISIONS } from '../state.js';
import { WORLD, getPlayer, getClub } from '../data/generator.js';
import { FORMATIONS, RARITY, POSITIONS } from '../data/pools.js';
import { playerCard, radarSVG, fmtMoney } from '../components/playerCard.js';
import { crestSVG, flagSVG } from '../components/crest.js';
import { toast, refreshCoins, navigate } from '../app.js';
import { sfx } from '../audio.js';

export const TITLE = 'Ultimate XI';

let tab = 'squad';           // squad | division | objectives

const PACKS = [
  { id: 'bronze',  name: 'Bronze',  cost: 0,    size: 4, odds: { bronze: 0.68, silver: 0.28, gold: 0.04, special: 0.00 }, note: '4 cards' },
  { id: 'silver',  name: 'Silver',  cost: 900,  size: 4, odds: { bronze: 0.32, silver: 0.52, gold: 0.15, special: 0.01 }, note: '4 cards' },
  { id: 'gold',    name: 'Gold',    cost: 2400, size: 5, odds: { bronze: 0.06, silver: 0.36, gold: 0.53, special: 0.05 }, note: '5 · gold min' },
  { id: 'prime',   name: 'Prime',   cost: 6000, size: 3, odds: { bronze: 0.00, silver: 0.06, gold: 0.72, special: 0.22 }, note: '3 · 82+ min' },
];

let selectedId = null;   // tap-to-place selection
let filter = 'all';

/* ------------------------------------------------------------------ *
 * Chemistry
 * ------------------------------------------------------------------ */
export function chemistryFor(lineup, formation) {
  const slots = FORMATIONS[formation];
  const ids = lineup.filter(Boolean);
  const placed = ids.map(getPlayer);

  const per = lineup.map((id, i) => {
    if (!id) return 0;
    const p = getPlayer(id);
    const slot = slots[i];
    const exact = p.position === slot.pos;
    const sameGroup = POSITIONS[p.position].group === POSITIONS[slot.pos].group;
    let chem = exact ? 2 : sameGroup ? 1 : 0;

    const clubMates = placed.filter((o) => o.id !== p.id && o.clubId && o.clubId === p.clubId).length;
    const nationMates = placed.filter((o) => o.id !== p.id && o.nation === p.nation).length;
    if (clubMates >= 2 || nationMates >= 3 || (clubMates >= 1 && nationMates >= 1)) chem += 1;

    return Math.max(0, Math.min(3, chem));
  });

  const team = Math.min(100, Math.round((per.reduce((a, b) => a + b, 0) / 33) * 100));
  const rating = placed.length ? Math.round(placed.reduce((s, p) => s + p.overall, 0) / placed.length) : 0;
  return { per, team, rating, placedCount: placed.length };
}

/* ------------------------------------------------------------------ *
 * Pack logic
 * ------------------------------------------------------------------ */
function rollRarity(odds) {
  const r = Math.random();
  let acc = 0;
  for (const [rarity, chance] of Object.entries(odds)) {
    acc += chance;
    if (r <= acc) return rarity;
  }
  return 'silver';
}

function drawPlayer(rarity) {
  const pool = WORLD.players.filter((p) => p.rarity === rarity);
  const src = pool.length ? pool : WORLD.players;
  return src[Math.floor(Math.random() * src.length)];
}

function openPack(pack) {
  const pulls = [];
  for (let i = 0; i < pack.size; i++) pulls.push(drawPlayer(rollRarity(pack.odds)));
  if (pack.id === 'gold' && !pulls.some((p) => p.rarity === 'gold' || p.rarity === 'special')) {
    pulls[pulls.length - 1] = drawPlayer('gold');
  }
  if (pack.id === 'prime') {
    pulls.forEach((p, i) => { if (p.overall < 82) pulls[i] = drawPlayer(Math.random() < 0.25 ? 'special' : 'gold'); });
  }
  return pulls;
}

/* ------------------------------------------------------------------ *
 * Render
 * ------------------------------------------------------------------ */
/**
 * Turn the placed line-up into a squad the match engine can field.
 * Returns null unless all eleven slots are filled.
 */
export function ultimateSquad() {
  const s = getState();
  const ids = s.club.lineup;
  if (ids.some((id) => !id)) return null;
  const xi = ids.map(getPlayer);
  if (xi.some((p) => !p)) return null;
  return { xi, name: 'Ultimate XI', short: 'UXI', colors: ['#41d3ff', '#0b1020'] };
}

/* ------------------------------ Apex Division --------------------------- */
export function divisionView() {
  const u = getState().ultimate;
  const div = DIVISIONS[u.divIdx];
  const next = DIVISIONS[u.divIdx + 1];
  const chem = chemistryFor(getState().club.lineup, getState().club.formation);
  const ready = chem.placedCount === 11;
  const pips = Array.from({ length: div.need }, (_, i) =>
    `<i class="${i < u.progress ? 'on' : ''}"></i>`).join('');

  return `
    <section class="panel glass div-hero">
      <div class="div-badge">
        <span class="div-num">${div.id === 0 ? '★' : div.id}</span>
      </div>
      <div class="div-info">
        <span class="div-kicker">Apex Division</span>
        <b>${div.name}</b>
        <div class="div-pips">${pips}</div>
        <span class="div-need">
          ${next ? `${u.progress}/${div.need} wins to reach ${next.name}` : 'Top of the ladder — hold your rank'}
        </span>
      </div>
      <div class="div-rec">
        <div><b>${u.wins}</b><span>Won</span></div>
        <div><b>${u.draws}</b><span>Drew</span></div>
        <div><b>${u.losses}</b><span>Lost</span></div>
        <div><b>${u.streak}</b><span>Streak</span></div>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Next fixture</h2>
        <span class="tag">Win ◈${div.reward.toLocaleString()} + pack</span></header>
      <p class="hint">Opponents get stronger the higher you climb. A loss drops you back a rung.</p>
      <div class="nm-actions">
        <button class="btn primary big" id="playDivision" ${ready ? '' : 'disabled'}>
          ${ready ? 'Play match' : `Fill your XI (${chem.placedCount}/11)`}
        </button>
      </div>
    </section>`;
}

/* --------------------------------- Store -------------------------------- */
export function storeView() {
  const s = getState();
  const owned = s.club.packs;
  const counts = owned.reduce((a, id) => { a[id] = (a[id] || 0) + 1; return a; }, {});

  return `
    <section class="panel glass">
      <header class="panel-head">
        <h2>Store</h2>
        <span class="coin-chip">◈ ${s.club.coins.toLocaleString()}</span>
      </header>
      <p class="hint">Packs go straight to your locker — open them when you want.</p>
      <div class="store-grid">
        ${PACKS.map((p) => {
          const free = p.cost === 0;
          const locked = !free && p.cost > s.club.coins;
          return `
            <article class="store-pack rar-${p.id === 'prime' ? 'special' : p.id}">
              <div class="sp-art"><span class="sp-mark">UXI</span><i></i></div>
              <b class="sp-name">${p.name}</b>
              <span class="sp-note">${p.note}</span>
              <span class="sp-odds">${oddsLine(p)}</span>
              <button class="btn ${locked ? 'ghost' : 'primary'}" data-buy-pack="${p.id}" ${locked ? 'disabled' : ''}>
                ${free ? 'Claim free' : `◈ ${p.cost.toLocaleString()}`}
              </button>
            </article>`;
        }).join('')}
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head">
        <h2>Your locker <small>${owned.length}</small></h2>
        ${owned.length ? '<button class="btn primary" id="openAll">Open all</button>' : ''}
      </header>
      ${owned.length ? `
        <div class="locker">
          ${Object.entries(counts).map(([id, n]) => {
            const pack = PACKS.find((p) => p.id === id) || PACKS[0];
            return `
              <button class="locker-pack rar-${id === 'prime' ? 'special' : id}" data-open-pack="${id}">
                <span class="lp-art"><i>UXI</i></span>
                <b>${pack.name}</b>
                <span class="lp-count">×${n}</span>
                <span class="lp-cta">Open</span>
              </button>`;
          }).join('')}
        </div>` : '<p class="empty">No packs yet — buy one above or win in Apex Division.</p>'}
    </section>`;
}

function oddsLine(p) {
  const parts = Object.entries(p.odds)
    .filter(([, v]) => v > 0.001)
    .map(([k, v]) => `${RARITY[k].label} ${Math.round(v * 100)}%`);
  return parts.join(' · ');
}

export function objectivesView() {
  const u = getState().ultimate;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Objectives</h2>
        <span class="tag">${u.objectives.filter((o) => o.done >= o.need).length}/${u.objectives.length} done</span></header>
      <ul class="obj-list">
        ${u.objectives.map((o) => {
          const done = o.done >= o.need;
          const pct = Math.min(100, (o.done / o.need) * 100);
          return `
            <li class="${done ? 'done' : ''}">
              <span class="obj-tick">${done ? '✓' : ''}</span>
              <div class="obj-body">
                <b>${o.text}</b>
                <i class="obj-bar"><b style="width:${pct}%"></b></i>
                <span>${Math.min(o.done, o.need)}/${o.need}</span>
              </div>
              <span class="obj-reward">◈${o.coins.toLocaleString()}<em>${o.pack} pack</em></span>
            </li>`;
        }).join('')}
      </ul>
    </section>`;
}

export function render() {
  const s = getState();
  const { formation, lineup } = s.club;
  const chem = chemistryFor(lineup, formation);

  const owned = s.club.packs.length;
  const tabs = `
    <nav class="tabs" id="uTabs">
      ${[['squad', 'Squad'], ['division', 'Apex Division'], ['objectives', 'Objectives'],
         ['store', `Store${owned ? ` <i class="tab-dot">${owned}</i>` : ''}`]]
        .map(([id, label]) => `<button class="tab ${tab === id ? 'on' : ''}" data-utab="${id}">${label}</button>`).join('')}
    </nav>`;

  if (tab === 'division') return tabs + divisionView();
  if (tab === 'objectives') return tabs + objectivesView();
  if (tab === 'store') return tabs + storeView();

  return tabs + `
    <div class="sb-head">
      <div class="sb-metrics glass">
        <div class="metric"><b class="big">${chem.rating || '--'}</b><span>Squad rating</span></div>
        <div class="metric">
          <b class="big chem-num" data-chem="${chem.team}">${chem.team}</b><span>Chemistry</span>
          <i class="chem-bar"><b style="width:${chem.team}%"></b></i>
        </div>
        <div class="metric"><b class="big">${chem.placedCount}<small>/11</small></b><span>Positions filled</span></div>
      </div>
      <div class="sb-actions">
        <label class="field">
          <span>Formation</span>
          <select id="formationSel">
            ${Object.keys(FORMATIONS).map((f) => `<option value="${f}" ${f === formation ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </label>
        <button class="btn ghost" id="autoFill">Auto fill</button>
        <button class="btn ghost" id="clearXI">Clear</button>
      </div>
    </div>

    <div class="sb-layout">
      <div class="pitch-wrap glass">
        <div class="pitch" id="pitch">
          <div class="pitch-lines">
            <span class="pl-halfway"></span><span class="pl-circle"></span>
            <span class="pl-box top"></span><span class="pl-box bottom"></span>
            <span class="pl-six top"></span><span class="pl-six bottom"></span>
          </div>
          ${FORMATIONS[formation].map((slot, i) => slotHTML(slot, i, lineup[i], chem.per[i])).join('')}
        </div>
        <p class="pitch-hint">Drag a card onto the pitch, or tap card then slot.</p>
      </div>

      <div class="sb-side">
        ${owned ? `
          <button class="mystery-pack" data-goto-store>
            <b>${owned} pack${owned > 1 ? 's' : ''} waiting</b>
            <span>Open them in the Store</span>
          </button>` : ''}

        <section class="panel glass">
          <header class="panel-head">
            <h2>Collection <small>${s.club.collection.length}</small></h2>
            <div class="chips" id="filters">
              ${['all', 'special', 'gold', 'silver', 'bronze'].map((f) => `
                <button class="chip ${filter === f ? 'on' : ''}" data-filter="${f}">${f === 'all' ? 'All' : RARITY[f].label}</button>`).join('')}
            </div>
          </header>
          <div class="collection" id="collection">${collectionHTML()}</div>
        </section>
      </div>
    </div>

    <div class="pack-overlay" id="packOverlay" hidden></div>
    <div class="detail-overlay" id="detailOverlay" hidden></div>`;
}

function slotHTML(slot, i, playerId, chem) {
  const p = playerId ? getPlayer(playerId) : null;
  const r = p ? RARITY[p.rarity] : null;
  const club = p ? getClub(p.clubId) : null;
  return `
    <div class="slot ${p ? 'filled' : ''}" data-slot="${i}"
         style="left:${slot.x}%;top:${slot.y}%${p ? `;--rar:${r.color};--rar-glow:${r.glow}` : ''}">
      ${p ? `
        <span class="slot-chem chem-${chem >= 3 ? 'hi' : chem >= 2 ? 'mid' : 'lo'}">${chem}</span>
        <span class="slot-ovr">${p.overall}</span>
        <span class="slot-crest">${club ? crestSVG(club.crest, club.short, 18) : ''}</span>
        <span class="slot-name">${p.short}</span>
        <span class="slot-pos">${slot.pos}</span>
        <button class="slot-x" data-clear="${i}" aria-label="Remove ${p.name}">×</button>
      ` : `
        <span class="slot-plus">+</span>
        <span class="slot-pos empty">${slot.pos}</span>
      `}
    </div>`;
}

function collectionHTML() {
  const s = getState();
  // anyone already on the pitch is hidden here — the list is the bench, not a duplicate
  const used = new Set(s.club.lineup.filter(Boolean));
  const items = s.club.collection
    .map(getPlayer)
    .filter((p) => p && !used.has(p.id) && (filter === 'all' || p.rarity === filter))
    .sort((a, b) => b.overall - a.overall);

  if (!s.club.collection.length) {
    return `<p class="empty">No cards yet — grab a pack from the Store.</p>`;
  }
  if (!items.length) {
    return `<p class="empty">${used.size === s.club.collection.length
      ? 'Every card you own is in the XI.'
      : `No ${RARITY[filter].label.toLowerCase()} cards left on the bench.`}</p>`;
  }

  return items.map((p) => `
    <div class="coll-item ${selectedId === p.id ? 'is-selected' : ''}"
         data-player="${p.id}" draggable="false">
      ${playerCard(p, { size: 'mini' })}
      <div class="coll-tools">
        <button class="mini-btn" data-detail="${p.id}">Info</button>
        <button class="mini-btn danger" data-sell="${p.id}">Sell ◈${Math.round(p.value / 25_000).toLocaleString()}</button>
      </div>
    </div>`).join('');
}

/* ------------------------------------------------------------------ *
 * Mount
 * ------------------------------------------------------------------ */
export function mount(root) {
  // tab bar is on every view
  root.querySelector('#uTabs')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-utab]');
    if (!b) return;
    tab = b.dataset.utab;
    navigate('squad');
  });

  if (tab === 'division') {
    root.querySelector('#playDivision')?.addEventListener('click', () => {
      const squad = ultimateSquad();
      if (!squad) return toast('Fill all 11 positions first', 'warn');
      const u = getState().ultimate;
      const div = DIVISIONS[u.divIdx];
      // opponent scales with the rung you are on
      const tier = Math.max(1, Math.min(10, 10 - u.divIdx));
      const opp = WORLD.clubs.find((c) => c.tier === tier) || WORLD.clubs[0];
      navigate('play', {
        homeId: WORLD.clubs[0].id,
        awayId: opp.id,
        duration: 240,
        skill: 0.75 + u.divIdx * 0.07,
        mode: 'single',
        ultimate: true,
        homeSquad: squad,
      });
    });
    return;
  }
  if (tab === 'objectives') return;

  if (tab === 'store') {
    // buy -> straight into the locker, never auto-opened
    root.querySelectorAll('[data-buy-pack]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pack = PACKS.find((p) => p.id === btn.dataset.buyPack);
        const s = getState();
        if (pack.cost > s.club.coins) return toast('Not enough coins', 'warn');
        if (pack.cost === 0 && s.club.packsOpened > 0 && s.club.packsOpened % 3 !== 0) {
          return toast(`Free pack in ${3 - (s.club.packsOpened % 3)} more opens`, 'warn');
        }
        update((st) => { st.club.coins -= pack.cost; st.club.packs.push(pack.id); });
        refreshCoins();
        sfx('coin');
        toast(`${pack.name} added to your locker`, 'good');
        navigate('squad');
      });
    });

    const openPacks = (ids) => {
      const pulls = [];
      for (const id of ids) {
        const pack = PACKS.find((p) => p.id === id) || PACKS[0];
        pulls.push(...openPack(pack));
      }
      update((st) => {
        for (const id of ids) {
          const i = st.club.packs.indexOf(id);
          if (i >= 0) st.club.packs.splice(i, 1);
          st.club.packsOpened += 1;
        }
        pulls.forEach((p) => { if (!st.club.collection.includes(p.id)) st.club.collection.push(p.id); });
      });
      refreshCoins();
      runPackAnimation(root, pulls, () => navigate('squad'));
    };

    root.querySelectorAll('[data-open-pack]').forEach((btn) => {
      btn.addEventListener('click', () => openPacks([btn.dataset.openPack]));
    });
    root.querySelector('#openAll')?.addEventListener('click', () => {
      const all = getState().club.packs.slice();
      if (!all.length) return;
      openPacks(all);
    });
    return;
  }

  const pitch = root.querySelector('#pitch');
  const collectionEl = root.querySelector('#collection');

  const rerenderPitch = () => {
    const s = getState();
    const chem = chemistryFor(s.club.lineup, s.club.formation);
    FORMATIONS[s.club.formation].forEach((slot, i) => {
      const el = pitch.querySelector(`[data-slot="${i}"]`);
      if (el) el.outerHTML = slotHTML(slot, i, s.club.lineup[i], chem.per[i]);
    });
    const metrics = root.querySelector('.sb-metrics');
    metrics.querySelectorAll('.metric')[0].querySelector('.big').textContent = chem.rating || '--';
    const chemEl = metrics.querySelector('.chem-num');
    chemEl.textContent = chem.team;
    chemEl.dataset.chem = chem.team;
    metrics.querySelector('.chem-bar b').style.width = `${chem.team}%`;
    metrics.querySelectorAll('.metric')[2].querySelector('.big').innerHTML = `${chem.placedCount}<small>/11</small>`;
    collectionEl.innerHTML = collectionHTML();
  };

  const place = (playerId, slotIndex) => {
    update((s) => {
      const existing = s.club.lineup.indexOf(playerId);
      if (existing >= 0) s.club.lineup[existing] = null;   // move, don't duplicate
      s.club.lineup[slotIndex] = playerId;
    });
    selectedId = null;
    rerenderPitch();
  };

  /* --- formation / bulk actions --- */
  root.querySelector('#formationSel').addEventListener('change', (e) => {
    update((s) => { s.club.formation = e.target.value; });
    pitch.innerHTML = pitch.querySelector('.pitch-lines').outerHTML +
      FORMATIONS[e.target.value].map((slot, i) => slotHTML(slot, i, getState().club.lineup[i],
        chemistryFor(getState().club.lineup, e.target.value).per[i])).join('');
    rerenderPitch();
  });

  root.querySelector('#clearXI').addEventListener('click', () => {
    update((s) => { s.club.lineup = Array(11).fill(null); });
    rerenderPitch();
    toast('Line-up cleared');
  });

  root.querySelector('#autoFill').addEventListener('click', () => {
    const s = getState();
    if (!s.club.collection.length) return toast('Open a pack first', 'warn');
    const slots = FORMATIONS[s.club.formation];
    const pool = s.club.collection.map(getPlayer).sort((a, b) => b.overall - a.overall);
    const taken = new Set();
    const next = Array(11).fill(null);
    // exact position first, then same group, then anyone left
    [(p, slot) => p.position === slot.pos,
     (p, slot) => POSITIONS[p.position].group === POSITIONS[slot.pos].group,
     () => true].forEach((test) => {
      slots.forEach((slot, i) => {
        if (next[i]) return;
        const found = pool.find((p) => !taken.has(p.id) && test(p, slot));
        if (found) { next[i] = found.id; taken.add(found.id); }
      });
    });
    update((st) => { st.club.lineup = next; });
    rerenderPitch();
    toast('Best available XI selected');
  });

  root.querySelector('[data-goto-store]')?.addEventListener('click', () => {
    tab = 'store';
    navigate('squad');
  });

  /* --- filters --- */
  root.querySelector('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('on', x.dataset.filter === filter));
    collectionEl.innerHTML = collectionHTML();
  });

  /* --- collection actions --- */
  collectionEl.addEventListener('click', (e) => {
    const detail = e.target.closest('[data-detail]');
    if (detail) return showDetail(root, getPlayer(detail.dataset.detail));

    const sell = e.target.closest('[data-sell]');
    if (sell) {
      const p = getPlayer(sell.dataset.sell);
      const coins = Math.round(p.value / 25_000);
      update((s) => {
        s.club.collection = s.club.collection.filter((id) => id !== p.id);
        s.club.lineup = s.club.lineup.map((id) => (id === p.id ? null : id));
        s.club.coins += coins;
      });
      refreshCoins();
      root.querySelector('.coin-chip').textContent = `◈ ${getState().club.coins.toLocaleString()}`;
      rerenderPitch();
      toast(`Sold ${p.name} for ◈${coins.toLocaleString()}`);
    }
  });

  /* --- slot clear + tap-to-place --- */
  pitch.addEventListener('click', (e) => {
    const x = e.target.closest('[data-clear]');
    if (x) {
      update((s) => { s.club.lineup[+x.dataset.clear] = null; });
      return rerenderPitch();
    }
    const slot = e.target.closest('[data-slot]');
    if (slot && selectedId) place(selectedId, +slot.dataset.slot);
  });

  const clearSlot = (i) => {
    update((s) => { s.club.lineup[i] = null; });
    rerenderPitch();
  };

  return attachDrag(root, place, clearSlot, () => {
    root.querySelectorAll('.coll-item').forEach((el) =>
      el.classList.toggle('is-selected', el.dataset.player === selectedId));
  });
}

/* ------------------------------------------------------------------ *
 * Pointer drag (works for mouse + touch) with tap-to-select fallback
 * ------------------------------------------------------------------ */
function attachDrag(root, place, clearSlot, refreshSelection) {
  let ghost = null;
  let dragId = null;
  let start = null;
  let dragging = false;
  let lastSlot = null;

  const cleanupGhost = () => {
    ghost?.remove();
    ghost = null;
    lastSlot?.classList.remove('drop-target');
    lastSlot = null;
  };

  const onDown = (e) => {
    const item = e.target.closest('.coll-item, .slot.filled');
    if (!item || e.target.closest('button')) return;
    dragId = item.dataset.player || getState().club.lineup[+item.dataset.slot];
    if (!dragId) return;
    start = { x: e.clientX, y: e.clientY, fromSlot: item.classList.contains('slot') ? +item.dataset.slot : null };
    dragging = false;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const onMove = (e) => {
    if (!start) return;
    const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (!dragging && dist < 7) return;
    if (!dragging) {
      dragging = true;
      const p = getPlayer(dragId);
      ghost = document.createElement('div');
      ghost.className = `drag-ghost rar-${p.rarity}`;
      ghost.style.setProperty('--rar', RARITY[p.rarity].color);
      ghost.innerHTML = `<b>${p.overall}</b><span>${p.short}</span><i>${p.position}</i>`;
      document.body.appendChild(ghost);
      document.body.classList.add('is-dragging');
    }
    e.preventDefault();
    ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    ghost.style.display = 'none';
    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-slot]');
    ghost.style.display = '';
    if (under !== lastSlot) {
      lastSlot?.classList.remove('drop-target');
      under?.classList.add('drop-target');
      lastSlot = under;
    }
  };

  const onUp = (e) => {
    window.removeEventListener('pointermove', onMove);
    document.body.classList.remove('is-dragging');
    const target = dragging
      ? document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-slot]')
      : null;
    cleanupGhost();

    if (dragging) {
      if (target) place(dragId, +target.dataset.slot);
      else if (start.fromSlot !== null) clearSlot(start.fromSlot);   // dragged off the pitch
    } else if (start.fromSlot === null) {
      selectedId = selectedId === dragId ? null : dragId;
      refreshSelection();
    }
    dragId = null;
    start = null;
    dragging = false;
  };

  root.addEventListener('pointerdown', onDown);
  return () => {
    root.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    cleanupGhost();
  };
}

/* ------------------------------------------------------------------ *
 * Pack opening animation
 * ------------------------------------------------------------------ */
/**
 * Staged pack reveal. Each pull walks out one clue at a time — nationality,
 * then position, then club — before the card itself drops. Tap or press to skip
 * straight to the card.
 */
function runPackAnimation(root, pulls, onDone) {
  // the Store tab has no overlay in its markup — make one when it is needed
  let overlay = root.querySelector('#packOverlay') || document.querySelector('#packOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'packOverlay';
    document.body.appendChild(overlay);
  }
  const best = pulls.reduce((a, b) => (b.overall > a.overall ? b : a));
  overlay.hidden = false;
  overlay.className = `pack-overlay open rar-${best.rarity}`;
  overlay.style.setProperty('--rar', RARITY[best.rarity].color);
  overlay.style.setProperty('--rar-glow', RARITY[best.rarity].glow);
  overlay.innerHTML = `
    <div class="pack-stage">
      <div class="pack-burst"></div>
      <div class="pack-rays"></div>
      <div class="plinths" id="plinths">
        <div class="plinth" data-step="0"><span class="pl-label">Nation</span><div class="pl-slot"></div></div>
        <div class="plinth" data-step="1"><span class="pl-label">Position</span><div class="pl-slot"></div></div>
        <div class="plinth" data-step="2"><span class="pl-label">Club</span><div class="pl-slot"></div></div>
      </div>
      <div class="walkout" id="walkout"></div>
      <div class="pack-foot">
        <span id="packCounter">1 / ${pulls.length}</span>
        <button class="btn" id="packNext">Skip</button>
        ${pulls.length > 1 ? '<button class="btn ghost" id="packSkipAll">Skip all</button>' : ''}
      </div>
    </div>`;

  const stage = overlay.querySelector('.pack-stage');
  const plinths = overlay.querySelector('#plinths');
  const walkout = overlay.querySelector('#walkout');
  const counter = overlay.querySelector('#packCounter');
  const nextBtn = overlay.querySelector('#packNext');

  let index = 0;
  let timers = [];
  let revealed = false;
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  const slots = () => [...plinths.querySelectorAll('.plinth')];

  const showCard = (p) => {
    revealed = true;
    sfx('reveal', p.rarity);
    plinths.classList.add('done');
    overlay.classList.remove('flash');
    void overlay.offsetWidth;
    overlay.classList.add('flash');
    walkout.innerHTML = `
      <div class="walkout-card reveal-${p.rarity}">${playerCard(p, { size: 'full' })}</div>`;
    nextBtn.textContent = index === pulls.length - 1 ? 'Add to collection' : 'Next';
    nextBtn.classList.add('primary');
  };

  const runReveal = () => {
    clearTimers();
    revealed = false;
    const p = pulls[index];
    const club = getClub(p.clubId);

    overlay.style.setProperty('--rar', RARITY[p.rarity].color);
    overlay.style.setProperty('--rar-glow', RARITY[p.rarity].glow);
    overlay.dataset.rarity = p.rarity;
    counter.textContent = `${index + 1} / ${pulls.length}`;
    nextBtn.textContent = 'Skip';
    nextBtn.classList.remove('primary');

    walkout.innerHTML = '';
    plinths.classList.remove('done');
    const [a, b, c] = slots();
    slots().forEach((s) => { s.classList.remove('lit'); s.querySelector('.pl-slot').innerHTML = ''; });

    sfx('packRise', 2600);
    at(260, () => {
      a.classList.add('lit');
      a.querySelector('.pl-slot').innerHTML = `${flagSVG(p.nationColors, 46)}<em>${p.nation}</em>`;
      sfx('packStep', 0);
    });
    at(1050, () => {
      b.classList.add('lit');
      b.querySelector('.pl-slot').innerHTML = `<strong>${p.position}</strong>`;
      sfx('packStep', 1);
    });
    at(1840, () => {
      c.classList.add('lit');
      c.querySelector('.pl-slot').innerHTML =
        `${club ? crestSVG(club.crest, club.short, 44) : ''}<em>${club ? club.name : 'Free Agent'}</em>`;
      sfx('packStep', 2);
    });
    at(2680, () => showCard(p));
  };

  const close = () => {
    clearTimers();
    overlay.classList.remove('open');
    overlay.hidden = true;
    overlay.innerHTML = '';
    const specials = pulls.filter((p) => p.rarity === 'special').length;
    toast(specials ? `${specials} SPECIAL pulled!` : `Added ${pulls.length} players`, specials ? 'good' : 'info');
    onDone();
  };

  /**
   * Skip the whole run. The cards are already banked before the reveal starts,
   * so this just needs to stop the show — but dumping a dozen pulls with no
   * feedback is useless, so lay them all out first.
   */
  const showSummary = () => {
    clearTimers();
    const order = { special: 0, gold: 1, silver: 2, bronze: 3 };
    const sorted = pulls.slice().sort((a, b) =>
      (order[a.rarity] - order[b.rarity]) || (b.overall - a.overall));
    const tally = ['special', 'gold', 'silver', 'bronze']
      .map((r) => [r, pulls.filter((p) => p.rarity === r).length])
      .filter(([, n]) => n > 0)
      .map(([r, n]) => `<span class="ps-tag rar-${r}">${n} ${RARITY[r].label}</span>`)
      .join('');
    const best = sorted[0];

    overlay.style.setProperty('--rar', RARITY[best.rarity].color);
    overlay.style.setProperty('--rar-glow', RARITY[best.rarity].glow);
    overlay.innerHTML = `
      <div class="pack-summary">
        <span class="ps-kicker">Pack results</span>
        <h3>${pulls.length} player${pulls.length > 1 ? 's' : ''} added</h3>
        <div class="ps-tally">${tally}</div>
        <div class="ps-grid">
          ${sorted.map((p) => `<div class="ps-card">${playerCard(p, { size: 'mini' })}</div>`).join('')}
        </div>
        <button class="btn primary" id="psDone">Done</button>
      </div>`;
    sfx('reveal', best.rarity);
    overlay.querySelector('#psDone').addEventListener('click', close);
  };

  const advance = () => {
    if (!revealed) { clearTimers(); showCard(pulls[index]); return; }   // skip to the card
    index++;
    if (index >= pulls.length) { close(); return; }
    runReveal();
  };

  nextBtn.addEventListener('click', advance);
  overlay.querySelector('#packSkipAll')?.addEventListener('click', showSummary);
  stage.addEventListener('click', (e) => { if (!e.target.closest('button')) advance(); });
  runReveal();
}

/* ------------------------------------------------------------------ *
 * Player detail overlay (radar + meta)
 * ------------------------------------------------------------------ */
export function showDetail(scope, p) {
  let overlay = (scope || document).querySelector?.('#detailOverlay') || document.querySelector('#detailOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'detailOverlay';
    overlay.className = 'detail-overlay';
    document.body.appendChild(overlay);
  }
  const club = getClub(p.clubId);
  overlay.hidden = false;
  overlay.classList.add('open');
  overlay.innerHTML = `
    <div class="detail-card glass rar-${p.rarity}" style="--rar:${RARITY[p.rarity].color};--rar-glow:${RARITY[p.rarity].glow}">
      <button class="close-x" data-close aria-label="Close">×</button>
      <div class="detail-top">
        <div class="detail-id">
          <b class="detail-ovr">${p.overall}</b>
          <span class="detail-pos">${p.position}</span>
          <span class="pc-rar-tag static">${RARITY[p.rarity].label}</span>
        </div>
        <div class="detail-name">
          <h3>${p.name}</h3>
          <p>${club ? crestSVG(club.crest, club.short, 22) : ''} ${club ? club.name : 'Free Agent'}</p>
          <p>${flagSVG(p.nationColors, 22)} ${p.nation} · ${p.age} years · ${fmtMoney(p.value)}</p>
        </div>
      </div>
      <div class="detail-body">
        ${radarSVG(p.stats, 210)}
        <div class="detail-stats">
          ${Object.entries(p.stats).map(([k, v]) => `
            <div class="dstat"><span>${k}</span><b>${v}</b><i><b style="width:${v}%"></b></i></div>`).join('')}
        </div>
      </div>
    </div>`;
  const close = () => { overlay.classList.remove('open'); overlay.hidden = true; overlay.innerHTML = ''; };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('[data-close]')) close();
  });
}
