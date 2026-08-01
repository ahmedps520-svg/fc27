import { getState, update } from '../state.js';
import { WORLD, getPlayer, getClub } from '../data/generator.js';
import { FORMATIONS, RARITY, POSITIONS } from '../data/pools.js';
import { playerCard, radarSVG, fmtMoney } from '../components/playerCard.js';
import { crestSVG, flagSVG } from '../components/crest.js';
import { toast, refreshCoins } from '../app.js';

export const TITLE = 'Squad Builder';

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
export function render() {
  const s = getState();
  const { formation, lineup } = s.club;
  const chem = chemistryFor(lineup, formation);

  return `
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
        <section class="panel glass">
          <header class="panel-head">
            <h2>Packs</h2>
            <span class="coin-chip">◈ ${s.club.coins.toLocaleString()}</span>
          </header>
          <div class="pack-row">
            ${PACKS.map((p) => `
              <button class="pack-btn rar-${p.id === 'prime' ? 'special' : p.id}" data-pack="${p.id}"
                      ${p.cost > s.club.coins ? 'disabled' : ''}>
                <span class="pack-name">${p.name}</span>
                <span class="pack-note">${p.note}</span>
                <span class="pack-cost">${p.cost ? `◈ ${p.cost.toLocaleString()}` : 'FREE'}</span>
              </button>`).join('')}
          </div>
        </section>

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
  const items = s.club.collection
    .map(getPlayer)
    .filter((p) => p && (filter === 'all' || p.rarity === filter))
    .sort((a, b) => b.overall - a.overall);

  if (!s.club.collection.length) {
    return `<p class="empty">No cards yet — open the free Bronze pack.</p>`;
  }
  if (!items.length) return `<p class="empty">No ${RARITY[filter].label.toLowerCase()} cards.</p>`;

  const used = new Set(s.club.lineup.filter(Boolean));
  return items.map((p) => `
    <div class="coll-item ${used.has(p.id) ? 'in-xi' : ''} ${selectedId === p.id ? 'is-selected' : ''}"
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

  /* --- packs --- */
  root.querySelectorAll('[data-pack]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pack = PACKS.find((p) => p.id === btn.dataset.pack);
      const s = getState();
      if (pack.cost > s.club.coins) return toast('Not enough coins', 'warn');
      if (pack.cost === 0 && s.club.packsOpened > 0 && s.club.packsOpened % 3 !== 0) {
        return toast(`Free pack in ${3 - (s.club.packsOpened % 3)} more opens`, 'warn');
      }
      const pulls = openPack(pack);
      update((st) => {
        st.club.coins -= pack.cost;
        st.club.packsOpened += 1;
        pulls.forEach((p) => { if (!st.club.collection.includes(p.id)) st.club.collection.push(p.id); });
      });
      refreshCoins();
      runPackAnimation(root, pulls, () => {
        rerenderPitch();
        root.querySelector('.coin-chip').textContent = `◈ ${getState().club.coins.toLocaleString()}`;
        root.querySelectorAll('[data-pack]').forEach((b) => {
          const pk = PACKS.find((p) => p.id === b.dataset.pack);
          b.disabled = pk.cost > getState().club.coins;
        });
        root.querySelector('.panel-head h2 small').textContent = getState().club.collection.length;
      });
    });
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
function runPackAnimation(root, pulls, onDone) {
  const overlay = root.querySelector('#packOverlay');
  const best = pulls.reduce((a, b) => (b.overall > a.overall ? b : a));
  overlay.hidden = false;
  overlay.className = `pack-overlay open rar-${best.rarity}`;
  overlay.style.setProperty('--rar', RARITY[best.rarity].color);
  overlay.style.setProperty('--rar-glow', RARITY[best.rarity].glow);
  overlay.innerHTML = `
    <div class="pack-stage">
      <div class="pack-burst"></div>
      <div class="pack-rays"></div>
      <div class="walkout" id="walkout"></div>
      <div class="pack-foot">
        <span id="packCounter">1 / ${pulls.length}</span>
        <button class="btn" id="packNext">Reveal</button>
      </div>
    </div>`;

  const walkout = overlay.querySelector('#walkout');
  const counter = overlay.querySelector('#packCounter');
  const nextBtn = overlay.querySelector('#packNext');
  let index = 0;

  const showCard = () => {
    const p = pulls[index];
    overlay.style.setProperty('--rar', RARITY[p.rarity].color);
    overlay.style.setProperty('--rar-glow', RARITY[p.rarity].glow);
    overlay.classList.remove('flash');
    void overlay.offsetWidth;
    overlay.classList.add('flash');
    overlay.dataset.rarity = p.rarity;

    walkout.innerHTML = `
      <div class="walkout-card reveal-${p.rarity}">
        ${playerCard(p, { size: 'full' })}
      </div>`;
    counter.textContent = `${index + 1} / ${pulls.length}`;
    nextBtn.textContent = index === pulls.length - 1 ? 'Add to collection' : 'Next';
  };

  nextBtn.addEventListener('click', () => {
    index++;
    if (index >= pulls.length) {
      overlay.classList.remove('open');
      overlay.hidden = true;
      overlay.innerHTML = '';
      const specials = pulls.filter((p) => p.rarity === 'special').length;
      toast(specials ? `${specials} SPECIAL pulled! 🔥` : `Added ${pulls.length} players`, specials ? 'good' : 'info');
      onDone();
      return;
    }
    showCard();
  });

  showCard();
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
