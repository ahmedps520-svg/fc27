/**
 * Custom Cup (v118, backlog #16): make your own knockout cup, then play it.
 *
 * No cup yet: name it, pick 4, 8 or 16 teams from any country (or nations),
 * star the one you will play as, and draw it. A cup under way: your next tie
 * and a Play button, the bracket round by round, and the champion when it is
 * done. The rules live in customCup.js; this is only the screen.
 */
import { WORLD } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { screenHead } from '../components/screenHead.js';
import { navigate, toast } from '../app.js';
import { enterFullscreen } from '../fullscreen.js';
import { countryNames, countryByName, INTERNATIONAL, internationalTeams } from '../data/countries.js';
import { cup, createCup, quitCup, yourTie, matchParams, teamById, ratingOf, roundName, CUP_SIZES, allTeams } from '../customCup.js';

export const TITLE = 'Custom Cup';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const crestOf = (tm) => crestSVG({ shape: tm.shape || 'shield', pattern: tm.national ? 'halves' : 'solid', device: 'star', colors: tm.colors }, tm.short, 30);
const teamsOf = (country) => (country === INTERNATIONAL ? internationalTeams() : (countryByName(country)?.clubs || []));

// the creator's draft, kept while the screen is re-rendered
const draft = { name: '', size: 8, ids: [], you: null, country: 'England' };

function creatorHTML() {
  const need = draft.size - draft.ids.length;
  const ready = need === 0 && draft.you && draft.ids.includes(draft.you);
  const picked = draft.ids.map(teamById).filter(Boolean);
  return `
    <section class="panel glass cup-make">
      <header class="panel-head"><h2>Make a cup</h2></header>
      <div class="cup-row">
        <label class="field cup-name"><span>Name</span>
          <input id="cupName" maxlength="32" placeholder="The Cup" value="${esc(draft.name)}" autocomplete="off">
        </label>
        <div class="cup-size"><span class="ci-label">Teams</span>
          <div class="seg" id="cupSize">${CUP_SIZES.map((n) => `<button class="${draft.size === n ? 'on' : ''}" data-size="${n}">${n}</button>`).join('')}</div>
        </div>
      </div>
      <div class="cup-pick">
        <label class="field"><span>From</span>
          <select id="cupCountry" aria-label="Country">${countryNames().map((n) => `<option ${n === draft.country ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        </label>
        <div class="cup-chips" role="listbox" aria-label="Teams in ${esc(draft.country)}">
          ${teamsOf(draft.country).map((tm) => `
            <button class="cup-chip ${draft.ids.includes(tm.id) ? 'on' : ''}" data-add="${tm.id}" aria-pressed="${draft.ids.includes(tm.id)}" title="${esc(tm.name)}">
              ${crestOf(tm)}<b>${esc(tm.name)}</b><i>${ratingOf(tm)}</i>
            </button>`).join('')}
        </div>
      </div>
      <div class="cup-picked">
        <div class="cup-picked-head"><b>${picked.length} / ${draft.size}</b>
          <span>${need > 0 ? `${need} more` : need < 0 ? `${-need} too many` : draft.you ? 'Ready' : 'Star the team you will play as'}</span>
          <button class="btn ghost sm" id="cupFill" ${need <= 0 ? 'disabled' : ''}>Fill at random</button>
          <button class="btn ghost sm" id="cupClear" ${picked.length ? '' : 'disabled'}>Clear</button>
        </div>
        <div class="cup-list">
          ${picked.map((tm) => `
            <div class="cup-entry ${draft.you === tm.id ? 'you' : ''}">
              ${crestOf(tm)}<b>${esc(tm.name)}</b>
              <button class="cup-star" data-you="${tm.id}" aria-pressed="${draft.you === tm.id}" aria-label="Play as ${esc(tm.name)}">${draft.you === tm.id ? '★ You' : '☆'}</button>
              <button class="cup-x" data-drop="${tm.id}" aria-label="Remove ${esc(tm.name)}">✕</button>
            </div>`).join('')}
        </div>
      </div>
      <button class="btn primary big" id="cupDraw" ${ready ? '' : 'disabled'}>Draw the cup</button>
    </section>`;
}

function bracketHTML(c) {
  const tie = yourTie(c);
  const name = (id) => esc(teamById(id)?.name || '?');
  const cell = (t) => `
    <div class="cup-tie ${t.a === c.you || t.b === c.you ? 'mine' : ''}">
      <span class="${t.winner === t.a ? 'w' : ''}">${name(t.a)}</span><em>${t.winner ? `${t.ga}` : ''}</em>
      <span class="${t.winner === t.b ? 'w' : ''}">${name(t.b)}</span><em>${t.winner ? `${t.gb}` : ''}</em>
      ${t.pens ? '<small>on penalties</small>' : ''}
    </div>`;
  const next = tie ? (() => {
    const them = tie.a === c.you ? tie.b : tie.a; const me = teamById(c.you); const op = teamById(them);
    return `
      <section class="panel glass cup-next">
        <header class="panel-head"><h2>${esc(roundName(c.rounds.at(-1).length * 2))}</h2></header>
        <div class="cup-vs">${crestSVG({ shape: me.shape || 'shield', pattern: 'solid', device: 'star', colors: me.colors }, me.short, 64)}<b>${esc(me.name)}</b><span>v</span><b>${esc(op.name)}</b>${crestSVG({ shape: op.shape || 'shield', pattern: 'solid', device: 'star', colors: op.colors }, op.short, 64)}</div>
        <button class="btn primary big" id="cupPlay">Play</button>
      </section>`;
  })() : '';
  const end = c.done ? `
    <section class="panel glass cup-end">
      <h2>${c.champion === c.you ? '🏆 You won it' : `${esc(teamById(c.champion)?.name || '')} win it`}</h2>
      <p>${c.champion === c.you ? `${esc(c.name)} is yours.` : c.out ? 'You went out; the rest of the cup was played out.' : ''}</p>
      <button class="btn primary" id="cupNew">Make another cup</button>
    </section>` : '';
  return `
    ${end}${next}
    <section class="panel glass">
      <header class="panel-head"><h2>${esc(c.name)}</h2>${c.done ? '' : '<button class="btn ghost sm" id="cupQuit">Abandon</button>'}</header>
      <div class="cup-bracket">
        ${c.rounds.map((r) => `<div class="cup-round"><span class="ci-label">${esc(roundName(r.length * 2))}</span>${r.map(cell).join('')}</div>`).join('')}
      </div>
    </section>`;
}

export function render() {
  const c = cup();
  return `
    ${screenHead({ kicker: 'Kick Off', title: 'Custom Cup', sub: c ? 'Your cup, round by round.' : 'Any teams, any size. A knockout of your own.', motif: 'pitch', tone: 'c' })}
    ${c ? bracketHTML(c) : creatorHTML()}`;
}

export function mount(root) {
  const q = (s) => root.querySelector(s);
  const again = () => navigate('cup');
  /* The screen root outlives a re-render: a listener on it has to go when
     this screen does, or every re-render stacks another and one tap on a
     team adds it and takes it straight back off. */
  const off = new AbortController(); const { signal } = off;
  q('#cupName')?.addEventListener('input', (e) => { draft.name = e.target.value; });
  q('#cupCountry')?.addEventListener('change', (e) => { draft.country = e.target.value; again(); });
  root.addEventListener('click', (e) => {
    const sz = e.target.closest('[data-size]');
    if (sz) { draft.size = +sz.dataset.size; if (draft.ids.length > draft.size) draft.ids = draft.ids.slice(0, draft.size); if (!draft.ids.includes(draft.you)) draft.you = null; again(); return; }
    const add = e.target.closest('[data-add]');
    if (add) {
      const id = add.dataset.add;
      if (draft.ids.includes(id)) { draft.ids = draft.ids.filter((x) => x !== id); if (draft.you === id) draft.you = null; } else if (draft.ids.length < draft.size) { draft.ids.push(id); if (!draft.you) draft.you = id; } else { toast(`The cup is full — ${draft.size} teams`, 'warn'); return; }
      again(); return;
    }
    const you = e.target.closest('[data-you]');
    if (you) { draft.you = you.dataset.you; again(); return; }
    const drop = e.target.closest('[data-drop]');
    if (drop) { draft.ids = draft.ids.filter((x) => x !== drop.dataset.drop); if (draft.you === drop.dataset.drop) draft.you = null; again(); return; }
    if (e.target.closest('#cupFill')) {
      const pool = allTeams().filter((t) => !t.national && !draft.ids.includes(t.id));
      while (draft.ids.length < draft.size && pool.length) draft.ids.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].id);
      again(); return;
    }
    if (e.target.closest('#cupClear')) { draft.ids = []; draft.you = null; again(); return; }
    if (e.target.closest('#cupDraw')) {
      const r = createCup({ name: draft.name, ids: draft.ids, you: draft.you });
      if (r.error) { toast(r.error, 'warn'); return; }
      again(); return;
    }
    if (e.target.closest('#cupPlay')) {
      const p = matchParams([WORLD.clubs[0].id, WORLD.clubs[1].id]);
      if (!p) return;
      enterFullscreen();
      navigate('play', p);
      return;
    }
    if (e.target.closest('#cupQuit')) { if (confirm('Abandon this cup?')) { quitCup(); again(); } return; }
    if (e.target.closest('#cupNew')) { quitCup(); again(); }
  }, { signal });
  return () => off.abort();
}
