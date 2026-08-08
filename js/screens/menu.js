import { getState, DIVISIONS } from '../state.js';
import { WORLD, getPlayer } from '../data/generator.js';
import { navigate, toast } from '../app.js';
import { crestSVG } from '../components/crest.js';
import { chemistryFor } from './squad.js';

export const TITLE = 'APEX XI';

/**
 * The menu is the screen the game is opened on, so it should say where you got
 * to and what is worth doing next — not just list the four places you can go.
 * Everything below the tiles is state: your division, your best card, what is
 * sitting unopened in your locker, and the objective you are closest to.
 *
 * All of it is skipped for a player with nothing yet. A row of zeroes and an
 * empty card slot is worse than the space it fills.
 */

const TILES = [
  { id: 'squad', name: 'Ultimate XI', icon: '⬢', blurb: 'Build · rank up · rewards', tone: 'a' },
  { id: 'career', name: 'Career Mode', icon: '▦', blurb: 'Season · table · transfers', tone: 'b', locked: 'Under construction' },
  { id: 'quick', name: 'Kick Off', icon: '⚡', blurb: 'Straight into a match', tone: 'c' },
  { id: 'settings', name: 'Settings', icon: '⚙', blurb: 'Speed · colour · save', tone: 'd' },
];

/** The best card in the collection — the one worth putting on the front page. */
function bestCard(collection) {
  let best = null;
  for (const id of collection) {
    const p = getPlayer(id);
    if (p && (!best || p.overall > best.overall)) best = p;
  }
  return best;
}

/** Whichever objective is nearest to done, so the next match has a point. */
function nextObjective(objectives) {
  return objectives
    .filter((o) => o.done < o.need)
    .sort((a, b) => (b.done / b.need) - (a.done / a.need))[0] || null;
}

const RARITY_SHORT = { icon: 'Icon', star: 'Star', special: 'Special', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function clubStrip(s) {
  const { collection, packs, lineup, formation } = s.club;
  // nothing to say yet — the tiles and the hero carry the screen on their own
  if (!collection.length && !packs.length && !s.ultimate.played) return '';

  const div = DIVISIONS[s.ultimate.divIdx];
  const chem = chemistryFor(lineup, formation);
  const u = s.ultimate;
  const best = bestCard(collection);
  const obj = nextObjective(u.objectives);
  const pending = packs.length;

  const record = u.played
    ? `${u.wins}W · ${u.draws}D · ${u.losses}L`
    : 'No matches yet';

  return `
    <section class="hub">
      <button class="hub-card hub-div" data-go="squad">
        <span class="hub-kicker">Apex Division</span>
        <b class="hub-big">${div.name}</b>
        <span class="hub-sub">${record}</span>
        <i class="hub-bar"><b style="width:${Math.min(100, (u.progress / div.need) * 100)}%"></b></i>
        <span class="hub-note">${u.progress}/${div.need} wins to promotion</span>
      </button>

      <button class="hub-card hub-squad" data-go="squad">
        <span class="hub-kicker">Your XI</span>
        <div class="hub-pair">
          <span><b class="hub-big">${chem.rating || '--'}</b><i>Rating</i></span>
          <span><b class="hub-big">${chem.team}</b><i>Chem</i></span>
        </div>
        <span class="hub-note">${chem.placedCount}/11 placed · ${collection.length} cards</span>
      </button>

      ${best ? `
        <button class="hub-card hub-best rar-${best.rarity}" data-go="squad">
          <span class="hub-kicker">Best card</span>
          <b class="hub-rating">${best.overall}</b>
          <span class="hub-name">${best.name}</span>
          <span class="hub-note">${best.position} · ${RARITY_SHORT[best.rarity] || best.rarity}</span>
        </button>` : ''}

      ${pending ? `
        <button class="hub-card hub-packs" data-go="squad">
          <span class="hub-kicker">Locker</span>
          <b class="hub-big">${pending}</b>
          <span class="hub-sub">pack${pending === 1 ? '' : 's'} unopened</span>
          <span class="hub-cta">Open →</span>
        </button>` : ''}

      ${obj ? `
        <button class="hub-card hub-obj" data-go="squad">
          <span class="hub-kicker">Next objective</span>
          <span class="hub-name">${obj.text}</span>
          <i class="hub-bar"><b style="width:${(obj.done / obj.need) * 100}%"></b></i>
          <span class="hub-note">${obj.done}/${obj.need} · ◈${(obj.apex ?? 0).toLocaleString()} + ${obj.pack} pack</span>
        </button>` : ''}
    </section>`;
}

export function render() {
  const s = getState();

  return `
    <section class="hero">
      <div class="hero-glow"></div>
      <h1 class="hero-title">APEX<span>XI</span></h1>
      <p class="hero-sub">${WORLD.clubs.length} clubs · ${WORLD.players.length} players</p>
      <div class="hero-stats">
        <div class="hstat"><b>${s.club.collection.length}</b><span>Cards owned</span></div>
        <div class="hstat"><b>${s.club.packsOpened}</b><span>Packs opened</span></div>
        <div class="hstat"><b>${s.ultimate.played}</b><span>Matches played</span></div>
      </div>
    </section>

    <div class="tile-grid">
      ${TILES.map((t) => `
        <button class="tile tone-${t.tone} ${t.locked ? 'is-locked' : ''}"
                ${t.locked ? `data-locked="${t.locked}" aria-disabled="true"` : `data-go="${t.id}"`}>
          <span class="tile-icon">${t.icon}</span>
          <span class="tile-name">${t.name}</span>
          <span class="tile-blurb">${t.locked || t.blurb}</span>
          <span class="tile-cta">${t.locked ? '🔒 Locked' : 'Open →'}</span>
        </button>`).join('')}
    </div>

    ${clubStrip(s)}

    <section class="league-strip">
      <span class="ls-label">Apex Premier Division</span>
      <div class="ls-badges">
        ${WORLD.clubs.map((c) => `<span title="${c.name}">${crestSVG(c.crest, c.short, 34)}</span>`).join('')}
      </div>
    </section>

    <p class="disclaimer">Clubs, leagues and competitions are fictional. Icon and Star
      cards name real footballers and are not endorsed by or affiliated with them.</p>`;
}

export function mount(root) {
  root.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
  root.querySelectorAll('[data-locked]').forEach((el) => {
    el.addEventListener('click', () => toast(`Career Mode is ${el.dataset.locked.toLowerCase()}`, 'info'));
  });
}
