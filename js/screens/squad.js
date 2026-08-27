import { getState, update, DIVISIONS, refreshObjectives, LADDER_SIZE, ULTIMATE_RUNGS } from '../state.js';
import { WORLD, getPlayer, getClub } from '../data/generator.js';
import { FORMATIONS, RARITY, POSITIONS } from '../data/pools.js';
import { CHALLENGES, challengeById, evaluate } from '../data/challenges.js';
import { PRESETS } from '../game/sim.js';
import { divisionOpponent, divisionSkill } from '../ultimate.js';
import { screenHead } from '../components/screenHead.js';
import { playerCard, radarSVG, fmtMoney } from '../components/playerCard.js';
import { crestSVG, flagSVG, CREST_PARTS } from '../components/crest.js';
import { toast, refreshCoins, navigate } from '../app.js';
import { sfx } from '../audio.js';
import { onlineView, mountOnline, mountSignIn } from './online.js';
import * as api from '../net/api.js';

export const TITLE = 'Ultimate XI';

let tab = 'club';            // club | division | online | objectives | challenges | store
let storeTab = 'packs';      // packs | locker | icons — the Store tab's own row
/* The Club tab's own three. Squad and the identity editor used to be two
   top-level tabs sitting next to each other, which put "pick your eleven" and
   "pick your badge" at the same level as "play a match" — they are both the
   same job, so they are one tab with three faces now. */
let clubTab = 'squad';       // squad | badge | name
let openChallenge = null;    // the SBC being filled in, if any
let submission = [];         // card ids staged for it

/**
 * Prices.
 *
 * These went up a long way, on the grounds that a squad used to be finished
 * inside an afternoon. A Prime pack is now most of a promotion run rather than
 * two wins, and Limited Edition is meant to be something you save for or earn,
 * not something you buy on a whim.
 *
 * The two Limited packs do not roll for their headline card, they promise it.
 * `guarantee` names a rarity that one of the cards is replaced with, whatever
 * the dice said — so a Limited: Stars pack is always exactly one 92, and an
 * Icon pack is always exactly one 99. The 12-win objective is a long way to
 * come to be told no.
 *
 * "Exactly one" is the other half of that promise: the guarantee replaces a
 * single card, and the rest of the pack rolls normally. You do not get the set.
 */
const PACKS = [
  { id: 'bronze', cat: 'free',  name: 'Bronze',  cost: 0,     size: 4, odds: { bronze: 0.68, silver: 0.28, gold: 0.04, special: 0.00 }, note: '4 cards' },
  { id: 'silver', cat: 'standard',  name: 'Silver',  cost: 2000,  size: 4, odds: { bronze: 0.32, silver: 0.52, gold: 0.15, special: 0.01 }, note: '4 cards' },
  /* Sold for what it does, not what it rolls. A squad cannot be fielded without
     a keeper, and the odds of one turning up in a four-card pack are about one
     in four — which is a long way to go for the single card the game will not
     let you play without. Two cards, one of them certainly a GK. */
  {
    id: 'keeper', cat: 'standard', name: 'Keeper', cost: 3500, size: 2,
    odds: { bronze: 0.10, silver: 0.44, gold: 0.44, special: 0.02 },
    forcePosition: 'GK',
    note: '2 cards',
    promise: '1 guaranteed goalkeeper',
  },
  /* The cheap gamble. One card, and the odds are deliberately top-heavy for the
     price — this is the pack you open because the last match paid for it, and
     the whole point is that it is over in one reveal. */
  {
    id: 'dip', cat: 'standard', name: 'Lucky Dip', cost: 5000, size: 1,
    odds: { bronze: 0.14, silver: 0.36, gold: 0.38, special: 0.12 },
    note: '1 card · high variance',
  },
  /* The Keeper pack's mirror. A squad with no striker is not blocked the way
     a squad with no keeper is, so this sells convenience rather than rescue —
     same shape, same price, the position everyone actually wants. */
  {
    id: 'striker', cat: 'standard', name: 'Striker', cost: 3500, size: 2,
    odds: { bronze: 0.10, silver: 0.44, gold: 0.44, special: 0.02 },
    forcePosition: 'ST',
    note: '2 cards',
    promise: '1 guaranteed striker',
  },
  /* Cheap bulk below Gold. Six bodies with no bronze in the bottom slot —
     bought for challenge fodder and early-save depth, not for headlines. */
  {
    id: 'stack', cat: 'standard', name: 'Silver Stack', cost: 4500, size: 6,
    odds: { bronze: 0.20, silver: 0.58, gold: 0.20, special: 0.02 },
    floor: 'silver',
    note: '6 · silver min',
  },
  { id: 'gold', cat: 'standard',    name: 'Gold',    cost: 7500,  size: 5, odds: { bronze: 0.06, silver: 0.36, gold: 0.53, special: 0.05 }, floor: 'gold', note: '5 · gold min' },
  /* The bulk option, and the only pack that pays for the gap between Gold and
     Prime. Eight cards at Gold-ish odds is worse per card than Prime and far
     better per Apex — it is the one to buy when a squad-building challenge wants
     bodies rather than a headline. */
  {
    id: 'builder', cat: 'premium', name: 'Squad Builder', cost: 15000, size: 8,
    odds: { bronze: 0.04, silver: 0.40, gold: 0.51, special: 0.05 },
    floor: 'gold', tone: 'gold',
    note: '8 · gold min',
  },
  /* The step between Gold and Prime that did not exist: three cards that are
     all at least useful (78+) without Prime's price or its special odds. */
  {
    id: 'form', cat: 'premium', name: 'Form Signing', cost: 12000, size: 3,
    odds: { bronze: 0.00, silver: 0.10, gold: 0.78, special: 0.12 },
    minOverall: 78, tone: 'gold',
    note: '3 · 78+ min',
  },
  /* A guaranteed special for less than Prime, in exchange for volume: two
     cards, one of them certainly special-or-better. The cheapest certain
     special in the store, and deliberately nothing else. */
  {
    id: 'double', cat: 'premium', name: 'Double Down', cost: 21000, size: 2,
    odds: { bronze: 0.00, silver: 0.10, gold: 0.70, special: 0.20 },
    floor: 'special', tone: 'special',
    note: '2 cards · special min',
    promise: '1 guaranteed Special',
  },
  { id: 'prime', cat: 'premium',   name: 'Prime',   cost: 30000, size: 3, odds: { bronze: 0.00, silver: 0.06, gold: 0.72, special: 0.22 }, minOverall: 82, tone: 'special', note: '3 · 82+ min' },
  /* The other end of Lucky Dip: one card, no floor, no guarantee, and odds
     that are genuinely top-heavy. It is the most volatile thing in the store —
     a quarter of the time it is the best single card you can buy without
     paying Limited money, and the rest of the time you paid Prime prices for
     one gold. Priced so that is a real decision rather than an obvious yes. */
  {
    id: 'gamble', cat: 'premium', name: 'High Roller', cost: 26000, size: 1,
    odds: { bronze: 0.00, silver: 0.00, gold: 0.74, special: 0.26 },
    minOverall: 79, tone: 'special',
    note: '1 card · 79+ min',
    promise: 'Best single-card odds in the store',
  },
  /* Eleven cards, one whole squad's worth, at odds a shade under Gold. The
     bulk option above Squad Builder — bought to fill a squad or feed a
     challenge in one go rather than to chase a headline. */
  {
    id: 'eleven', cat: 'premium', name: 'The Eleven', cost: 45000, size: 11,
    odds: { bronze: 0.00, silver: 0.33, gold: 0.60, special: 0.07 },
    floor: 'special', tone: 'gold',
    note: '11 · one special min',
  },
  {
    id: 'stars', cat: 'limited', name: 'Limited: Stars', cost: 40000, size: 3, limited: true,
    guarantee: 'star',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.55, special: 0.45 },
    note: '3 cards · 79+ min',
    promise: '1 guaranteed 92-rated Star',
  },
  {
    id: 'limited', cat: 'limited', name: 'Limited: Icons', cost: 75000, size: 3, limited: true,
    guarantee: 'icon',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.30, special: 0.70 },
    note: '3 cards · 79+ min',
    promise: '1 guaranteed 99-rated Icon',
  },
  /* One card, Limited money, no guarantee stamped on it — the odds ARE the
     promise. Sits between High Roller (26k, one card, 26% special) and the
     guaranteed Star/Icon packs: nearly always special, never certain. */
  {
    id: 'wildcard', cat: 'limited', name: 'Limited: Wildcard', cost: 55000, size: 1, limited: true,
    odds: { bronze: 0.00, silver: 0.00, gold: 0.10, special: 0.90 },
    minOverall: 86, tone: 'special',
    note: '1 card · 86+ min',
    promise: '90% special or better',
  },
  /* The top of the objective ladder pays this, and almost nothing else does.
     It is in the store so it has a stated price, but 200,000 Apex is roughly
     forty division wins — the intended way to hold one is to earn it. */
  {
    id: 'legend', cat: 'limited', name: 'Limited: Legends', cost: 200000, size: 5, limited: true,
    guarantee: 'icon',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.14, special: 0.86 },
    note: '5 cards · 84+ min',
    promise: '1 guaranteed Icon · best odds in the game',
  },
];

/** The free bronze recharges on a clock — see the note at the claim site. */
const FREE_MS = 6 * 60 * 60 * 1000;
const fmtLeft = (ms) => {
  // minutes first, then split — ceiling the remainder alone yields "5h 60m"
  const mins = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

/** Limited Edition is also the reward for the hardest objective. */
export const PACK_BY_ID = (id) => PACKS.find((p) => p.id === id) || PACKS[0];

/* Which colour a pack wears in the store and the locker.
 *
 * This used to be written inline as `guarantee || (id === 'prime' ? 'special' :
 * id)`, in two places, which quietly meant "every pack must be named after a
 * rarity". Any pack that was not — Keeper, Lucky Dip, Squad Builder — fell
 * through to the default grey and looked broken next to the others. `tone` lets
 * a pack say what it wants to look like; falling back to `guarantee` then `id`
 * keeps every existing pack exactly the colour it already was. */
const packTone = (p) => p.tone || p.guarantee || p.id;

/**
 * What an Icon costs in the premium currency.
 *
 * The Limited: Icons pack hands over a *random* one. This hands over the one
 * you want, which is the only thing Apex genuinely cannot buy — and it is
 * priced so that it is a season's work at the top of the ladder rather than an
 * afternoon: an Apex Elite win pays 2, so twenty is ten wins in the hardest
 * division in the game.
 */
const ICON_PRICE = 20;

let selectedId = null;   // tap-to-place selection
let filter = 'all';      // rarity chip
let group = 'all';       // GK / DEF / MID / FWD chip
let sortBy = 'rating';   // rating | position | value | name
let pickSlot = null;     // tapping an empty slot puts the list into "fill this" mode
let pickBench = null;    // the same, for a seat on the bench

const GROUPS = [['all', 'All'], ['GK', 'GK'], ['DEF', 'Defence'], ['MID', 'Midfield'], ['FWD', 'Attack']];

const SORTS = {
  rating: (a, b) => b.overall - a.overall,
  position: (a, b) => a.position.localeCompare(b.position) || b.overall - a.overall,
  value: (a, b) => b.value - a.value,
  name: (a, b) => a.name.localeCompare(b.name),
};

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
/* Cheapest to rarest. `rarityFor` only ever returns the first four — star and
 * icon are set by hand on the named cards — but they rank above `special` so a
 * "gold or better" floor is satisfied by an Icon rather than overwritten by one. */
const RARITY_RANK = { bronze: 0, silver: 1, gold: 2, special: 3, star: 4, icon: 5 };

function rollRarity(odds) {
  const r = Math.random();
  let acc = 0;
  for (const [rarity, chance] of Object.entries(odds)) {
    acc += chance;
    if (r <= acc) return rarity;
  }
  return 'silver';
}

/**
 * Draw one card of a rarity, avoiding anyone in `seen`.
 *
 * A card you already own is worthless — the collection holds one of each — so a
 * pack that keeps handing them over is a pack that quietly gives you nothing.
 * Cards you do not have come first; only when a whole rarity is exhausted does
 * a repeat come back, and the caller pays that out in coins instead.
 */
function drawPlayer(rarity, seen, only = null) {
  const matches = (p) => p.rarity === rarity && (!only || only(p));
  let src = WORLD.players.filter(matches);
  if (!src.length) src = only ? WORLD.players.filter(only) : WORLD.players;
  const fresh = seen ? src.filter((p) => !seen.has(p.id)) : src;
  const from = fresh.length ? fresh : src;
  return from[Math.floor(Math.random() * from.length)];
}

/** The player ids a pull would be a repeat of: the collection plus this batch. */
const ownedIds = () => new Set(getState().club.collection);

const hasKeeper = (ids) => ids.some((id) => getPlayer(id)?.position === 'GK');

/**
 * @param {boolean} needGK force one goalkeeper into this pack. A squad without
 *   a keeper cannot be fielded at all, and leaving that to a 1-in-14 roll made
 *   a new player's first four packs a coin toss on whether they could play.
 * @returns {{p: object, dup: boolean}[]} one entry per card in the pack.
 */
function openPack(pack, seen = new Set(), needGK = false) {
  const draw = (rarity, only = null) => {
    const p = drawPlayer(rarity, seen, only);
    const dup = seen.has(p.id);
    seen.add(p.id);
    return { p, dup };
  };

  const pulls = [];
  for (let i = 0; i < pack.size; i++) pulls.push(draw(rollRarity(pack.odds)));

  /* `floor` and `minOverall` used to be `pack.id === 'gold'` and
   * `pack.id === 'prime'` written out longhand here. They are declared on the
   * pack now because they are not properties of those two packs, they are
   * properties any pack can want — and a store that grows by adding an id check
   * in the opener for every new pack is a store that stops growing. */
  if (pack.floor && !pulls.some((x) => RARITY_RANK[x.p.rarity] >= RARITY_RANK[pack.floor])) {
    pulls[pulls.length - 1] = draw(pack.floor);
  }
  /* The replacement has to clear the bar too. This used to redraw at rarity
   * `gold`, and gold starts at 79 — so a pack whose store note reads "82+ min"
   * was handing over 79s and 80s, and measured, only 42% of Prime packs
   * actually held to the number they were sold on. Constraining the redraw is
   * what makes the promise on the card true. */
  if (pack.minOverall) {
    pulls.forEach((x, i) => {
      if (x.p.overall < pack.minOverall) {
        pulls[i] = draw(Math.random() < 0.25 ? 'special' : 'gold',
          (p) => p.overall >= pack.minOverall);
      }
    });
  }
  // Limited Edition never hands back a bronze or a silver. An Icon is left
  // exactly as the roll found it — guaranteeing one would defeat the point.
  if (pack.limited) {
    pulls.forEach((x, i) => {
      if (x.p.rarity === 'bronze' || x.p.rarity === 'silver') {
        pulls[i] = draw(Math.random() < 0.6 ? 'special' : 'gold');
      }
    });
  }
  // Either the squad has no keeper at all (needGK) or the pack promises a
  // position outright. Same mechanism: if the roll did not produce one, the
  // first slot is redrawn constrained to it. `forcePosition` takes any
  // position now, not just GK — the Striker pack is the Keeper pack's mirror
  // and earned the generalisation.
  const wantPos = pack.forcePosition || (needGK ? 'GK' : null);
  if (wantPos && !pulls.some((x) => x.p.position === wantPos)) {
    pulls[0] = draw(rollRarity(pack.odds), (p) => p.position === wantPos);
  }
  // The promised card, last, so nothing above can overwrite it — and in a
  // Random slot, which no longer matters to the reveal — that now sorts by
  // rating so the best card lands last, see runPackAnimation. Kept random
  // anyway because nothing should depend on the guarantee sitting at a fixed
  // index. Slot 0 is skipped when a keeper was forced into it.
  if (pack.guarantee) {
    const lo = wantGK ? 1 : 0;
    const at = lo + Math.floor(Math.random() * Math.max(1, pulls.length - lo));
    pulls[at] = draw(pack.guarantee);
  }
  return pulls;
}

/** Exposed so the pack odds can be measured against the real draw code. */
export const __openPackForTest = openPack;

/**
 * What a card you already own is worth — the same as selling it.
 *
 * An Icon is valued at 250M, which at this divisor would pay 10,000 Apex for a
 * repeat. That is deliberate: pulling a second Icon should feel like a result,
 * not like the pack failed.
 */
const dupValue = (p) => Math.round(p.value / 25_000);

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
  // The bench is optional — an empty seat simply means nobody to bring on there.
  const bench = (s.club.bench || []).map((id) => (id ? getPlayer(id) : null)).filter(Boolean);
  const id = clubIdentity();
  return { xi, bench, name: id.name, short: id.short, colors: id.crest.colors, crest: id.crest };
}

/**
 * The player's own club, with every field guaranteed present.
 *
 * Saves written before identity existed have no `club.identity`, and a half-set
 * one is worse than none — a missing `crest.colors` reaches the kit shader as
 * `undefined[0]`. So this fills in from the defaults rather than trusting what
 * came out of storage.
 */
export function clubIdentity() {
  const d = { name: 'Ultimate XI', short: 'UXI',
    crest: { shape: 'shield', pattern: 'solid', device: 'star', colors: ['#41d3ff', '#0b1020'] } };
  const got = getState().club.identity || {};
  return {
    name: got.name || d.name,
    short: (got.short || d.short).slice(0, 3).toUpperCase(),
    crest: {
      shape: got.crest?.shape || d.crest.shape,
      pattern: got.crest?.pattern || d.crest.pattern,
      device: got.crest?.device || d.crest.device,
      colors: got.crest?.colors?.length === 2 ? got.crest.colors : d.crest.colors,
    },
  };
}

/* ------------------------------- Your club ------------------------------ *
 *
 * A UI over machinery that already existed. `crestSVG` has always built a badge
 * out of a shape, a pattern, a device and two colours, and `makeTeam` has always
 * accepted a custom squad's name and colours — those two colours are what the
 * kit shader tints every shirt from. Nothing here is a new system; it is a form
 * that writes four fields and a live badge that redraws as you touch them.
 *
 * The kit swatches are deliberately the same two colours as the crest. One
 * palette per club is how real ones work, and two separate pickers would let
 * someone build a badge that has nothing to do with the shirt they take onto
 * the pitch.
 */
const KIT_PALETTES = [
  ['#41d3ff', '#0b1020'], ['#e0294a', '#1a1c22'], ['#23c55e', '#07130c'],
  ['#ffb703', '#12263f'], ['#9d4edd', '#10101a'], ['#ff5c8a', '#13315c'],
  ['#2ec4b6', '#0b132b'], ['#ff7f11', '#2f3640'], ['#f2f4f8', '#12141a'],
  ['#b8ff3d', '#14210a'], ['#ff2e88', '#160b16'], ['#8ecae6', '#023047'],
];

/**
 * The badge, on its own page.
 *
 * A live preview beside the pickers, and every option previews *itself* wearing
 * the rest of the club — pick a shape and you see it in your colours with your
 * device on it, rather than in a vacuum.
 */
function badgeView() {
  const id = clubIdentity();
  const row = (key, opts) => `
    <div class="ci-row">
      <span class="ci-label">${key}</span>
      <div class="ci-opts">
        ${opts.map((o) => `
          <button class="ci-opt ${id.crest[key] === o ? 'on' : ''}" data-part="${key}" data-val="${o}">
            <span class="ci-badge">${crestSVG({ ...id.crest, [key]: o }, id.short, 34)}</span>
            <em>${o}</em>
          </button>`).join('')}
      </div>
    </div>`;

  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Club badge</h2></header>
      <p class="hint">Worn on the pitch, on the scoreboard, and shown to whoever
        you play online. The two colours are the kit your players run out in.</p>

      <div class="ci-top">
        <div class="ci-preview" id="ciPreview">${crestSVG(id.crest, id.short, 148)}</div>
        <div class="ci-kitnote">
          <b>${id.name}</b>
          <span>${id.short}</span>
          <p class="p-note">Change the name and the three letters on the Club Name tab.</p>
        </div>
      </div>

      <div class="ci-row">
        <span class="ci-label">colours</span>
        <div class="ci-opts">
          ${KIT_PALETTES.map(([a, b]) => `
            <button class="ci-kit ${id.crest.colors[0] === a && id.crest.colors[1] === b ? 'on' : ''}"
                    data-kit="${a}|${b}" aria-label="${a}">
              <i style="--a:${a};--b:${b}"></i>
            </button>`).join('')}
        </div>
      </div>
      ${row('shape', CREST_PARTS.shape)}
      ${row('pattern', CREST_PARTS.pattern)}
      ${row('device', CREST_PARTS.device)}
    </section>`;
}

/** The name, and the three letters the scoreboard has room for. */
function nameView() {
  const id = clubIdentity();
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Club name</h2></header>
      <p class="hint">What your side is called on the team sheet, the scoreboard
        and in an opponent\u2019s match report.</p>

      <div class="ci-top">
        <div class="ci-preview" id="ciPreview">${crestSVG(id.crest, id.short, 148)}</div>
        <div class="ci-names">
          <label class="field">
            <span>Club name</span>
            <input id="ciName" type="text" maxlength="22" value="${id.name.replace(/"/g, '&quot;')}">
          </label>
          <label class="field">
            <span>Three letters</span>
            <input id="ciShort" type="text" maxlength="3" value="${id.short}">
          </label>
          <p class="p-note">The three letters are what fits beside the score during a match.</p>
        </div>
      </div>

      <!-- what it will actually look like in the corner of the screen -->
      <div class="ci-scorebug">
        <span class="ci-sb-label">On the scoreboard</span>
        <div class="gm-bug">
          <span class="bug-team" style="--team:${id.crest.colors[0]}">
            ${crestSVG(id.crest, id.short, 20)}<b>${id.short}</b>
          </span>
          <b class="bug-score">2</b><b class="bug-score">1</b>
          <span class="bug-team" style="--team:#8a8f98">
            <b>HGT</b>${crestSVG({ shape: 'shield', pattern: 'stripes', device: 'peak',
              colors: ['#8a8f98', '#15171c'] }, 'HGT', 20)}
          </span>
          <span class="bug-clock">67\u2032</span>
        </div>
      </div>
    </section>`;
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

  /* Tell the player who they are about to face and whether they are favourite.
     The opponent is now built against their own squad rather than being a fixed
     club, and a difficulty that moves with you is worth stating out loud —
     otherwise a sudden hard match reads as the game cheating. */
  const mine = ultimateSquad();
  const myRating = mine
    ? Math.round(mine.xi.reduce((t, p) => t + p.overall, 0) / mine.xi.length) : 0;
  const opp = mine ? divisionOpponent(u.divIdx, myRating) : null;
  const oppLine = opp
    ? `Next up: <b>${opp.name}</b>, rated ${opp.rating} against your ${myRating}. `
      + (opp.rating > myRating + 1 ? 'You are the underdog here.'
        : opp.rating < myRating - 1 ? 'You should be favourite.'
          : 'Evenly matched.')
    : 'Opponents are built to match your squad, and get harder the higher you climb.';

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
      <p class="hint">${oppLine}</p>
      <p class="preset-note"><b>${PRESETS.competitive.name}</b> ${PRESETS.competitive.blurb}</p>
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

  /* Three sections behind a row, not three panels stacked.
   *
   * Packs, the locker and the Icon Exchange were one page about two thousand
   * pixels long, so buying a pack meant scrolling past twelve of them to find
   * the one you had just bought. They are separate jobs — spending, opening,
   * and the one thing Apex cannot buy — and each is short enough to fit a
   * screen on its own.
   *
   * Same shape as the Club tab's row (`#cSubs`): a rule and an underline
   * rather than pills, so two navigations stacked on top of each other read as
   * a hierarchy instead of as nine buttons. The count rides on the Locker tab
   * because "you have packs waiting" is the reason to go there. */
  const subs = `
    <nav class="subtabs" id="sSubs">
      ${[['packs', 'Packs'], ['locker', `Locker${owned.length ? ` <i class="tab-dot">${owned.length}</i>` : ''}`],
         ['icons', 'Icon Exchange']]
        .map(([id, label]) =>
          `<button class="subtab ${storeTab === id ? 'on' : ''}" data-stab="${id}">${label}</button>`).join('')}
    </nav>`;

  if (storeTab === 'locker') return subs + lockerView(owned, counts);
  if (storeTab === 'icons') return subs + iconExchangeView();

  /* Shelves, not one grid.
   *
   * Twelve identical rectangles in a wall is a spreadsheet; a shop has
   * sections. Each shelf is its own panel with a name and a one-line pitch,
   * and inside it the packs are bigger and sit in a row that scrolls sideways
   * when it must — which also means a shelf never dictates the layout of the
   * one below it. The free pack gets a shelf to itself because it is the one
   * everybody comes back for. */
  const packCard = (p) => {
    const free = p.cost === 0;
    const locked = !free && p.cost > (s.club.apex || 0);
    const freeReady = free && Date.now() >= (s.club.freeAt || 0);
    return `
      <article class="store-pack rar-${packTone(p)}">
        ${p.limited ? '<span class="sp-tag">Limited</span>' : ''}
        <div class="sp-art">
          <span class="sp-fan" aria-hidden="true"><i></i><i></i></span>
          <span class="sp-face">
            <span class="sp-mark">UXI</span>
            <span class="sp-count">×${p.size}</span>
          </span>
          <i class="sp-foil" aria-hidden="true"></i>
        </div>
        <b class="sp-name">${p.name}</b>
        <span class="sp-note">${p.note}</span>
        ${p.promise ? `<span class="sp-promise">${p.promise}</span>` : ''}
        ${p.id === 'limited' ? '<span class="sp-alt">or win 12 division matches</span>' : ''}
        <span class="sp-odds">${oddsLine(p)}</span>
        <!-- last child on purpose: the auto top margin on the button is what
             lines every price in a shelf up on one baseline -->
        <button class="btn ${locked || (free && !freeReady) ? 'ghost' : 'primary'}"
                data-buy-pack="${p.id}" ${locked ? 'disabled' : ''}>
          ${free ? (freeReady ? 'Claim free' : `Free in ${fmtLeft((s.club.freeAt || 0) - Date.now())}`)
                 : `◈ ${p.cost.toLocaleString()}`}
        </button>
      </article>`;
  };

  const SHELVES = [
    ['free', 'On the house', 'A free bronze pack, every six hours.'],
    ['standard', 'Standard', 'The everyday packs — squad filler, a keeper, a cheap gamble.'],
    ['premium', 'Premium', 'Higher floors and better odds, priced like it.'],
    ['limited', 'Limited & Icons', 'Guaranteed headline cards. The top of the store.'],
  ];

  return subs + `
    <div class="store-head">
      <h2>Packs</h2>
      <span class="coin-chip">◈ ${(s.club.apex || 0).toLocaleString()}</span>
    </div>
    ${SHELVES.map(([cat, title, blurb]) => {
      const shelf = PACKS.filter((p) => p.cat === cat);
      if (!shelf.length) return '';
      return `
        <section class="panel glass store-cat cat-${cat}">
          <header class="panel-head"><h2>${title}</h2><span class="sc-blurb">${blurb}</span></header>
          <div class="store-row">${shelf.map(packCard).join('')}</div>
        </section>`;
    }).join('')}`;
}

function lockerView(owned, counts) {
  return `
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
              <button class="locker-pack rar-${packTone(pack)}" data-open-pack="${id}">
                <span class="lp-art"><i>UXI</i></span>
                <b>${pack.name}</b>
                <span class="lp-count">×${n}</span>
                <span class="lp-cta">Open</span>
              </button>`;
          }).join('')}
        </div>` : '<p class="empty">No packs yet — buy one from Packs, or win in Apex Division.</p>'}
    </section>`;
}

/**
 * The Icon Exchange.
 *
 * Pick the Icon you want rather than the one a pack decided to give you. The
 * only sink for Ultimate, and the only place in the game where a specific named
 * card can be bought outright.
 */
function iconExchangeView() {
  const s = getState();
  const have = new Set(s.club.collection);
  const bank = s.club.ultimate || 0;
  const icons = WORLD.icons.map(getPlayer);

  return `
    <section class="panel glass exchange">
      <header class="panel-head">
        <h2>Icon Exchange</h2>
        <span class="coin-chip ult">✦ ${bank.toLocaleString()}</span>
      </header>
      <p class="hint">A pack gives you a random Icon. This gives you the one you
        want. Ultimate is only paid for wins in Division 1 and Apex Elite.</p>
      <div class="xchg-grid">
        ${icons.map((p) => {
          const owned = have.has(p.id);
          const afford = bank >= ICON_PRICE;
          return `
            <article class="xchg rar-icon ${owned ? 'owned' : ''}">
              <b class="xchg-ovr">${p.overall}</b>
              <span class="xchg-name">${p.name}</span>
              <span class="xchg-meta">${p.position} · ${p.nation}</span>
              ${owned
                ? '<span class="xchg-owned">In your club</span>'
                : `<button class="btn ${afford ? 'primary' : 'ghost'} xchg-buy"
                           data-buy-icon="${p.id}" ${afford ? '' : 'disabled'}>
                     ✦ ${ICON_PRICE}
                   </button>`}
            </article>`;
        }).join('')}
      </div>
    </section>`;
}

function oddsLine(p) {
  const parts = Object.entries(p.odds)
    .filter(([, v]) => v > 0.001)
    .map(([k, v]) => `${RARITY[k].label} ${Math.round(v * 100)}%`);
  return parts.join(' · ');
}

/* ---------------------------- Challenges ---------------------------- */
/** The cards staged for the open challenge, as player objects. */
const submittedCards = () => submission.map(getPlayer).filter(Boolean);

function challengesView() {
  const s = getState();
  const doneIds = new Set(s.club.challengesDone || []);

  if (!openChallenge) {
    return `
      <section class="panel glass">
        <header class="panel-head"><h2>Squad-Building Challenges</h2></header>
        <p class="hint">Submit eleven cards that meet the conditions. They are
          spent — this is what a duplicate is really for.</p>
        <div class="sbc-list">
          ${CHALLENGES.map((c) => {
            const done = doneIds.has(c.id) && !c.repeatable;
            return `
              <article class="sbc ${done ? 'done' : ''}">
                <div class="sbc-body">
                  <b>${c.name}</b>
                  <span class="sbc-brief">${c.brief}</span>
                  <ul class="sbc-reqs">${c.reqs.map((r) => `<li>${r.text}</li>`).join('')}</ul>
                </div>
                <div class="sbc-side">
                  <span class="sbc-reward">◈ ${c.reward.apex.toLocaleString()}</span>
                  ${c.reward.ultimate ? `<span class="sbc-reward ult">✦ ${c.reward.ultimate}</span>` : ''}
                  <span class="sbc-pack">${c.reward.pack} pack</span>
                  ${done
                    ? '<span class="sbc-tick">Completed</span>'
                    : `<button class="btn primary" data-sbc="${c.id}">Start</button>`}
                  ${c.repeatable ? '<span class="sbc-rep">Repeatable</span>' : ''}
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>`;
  }

  const cards = submittedCards();
  // Chemistry needs a formation to score against; the challenge is about the
  // set rather than the shape, so it is measured in the club's own formation.
  const chem = chemistryFor(
    [...submission, ...Array(11).fill(null)].slice(0, 11), s.club.formation);
  const { rows, ok } = evaluate(openChallenge, cards, chem);

  return `
    <section class="panel glass">
      <header class="panel-head">
        <h2>${openChallenge.name}</h2>
        <button class="btn ghost" id="sbcBack">Back</button>
      </header>
      <p class="hint">${openChallenge.brief}</p>

      <div class="sbc-check">
        ${rows.map((r) => `
          <div class="sbc-row ${r.ok ? 'ok' : ''}">
            <i></i><span>${r.text}</span><b>${r.got}/${r.need}</b>
          </div>`).join('')}
      </div>

      <div class="sbc-tray" id="sbcTray">
        ${Array.from({ length: 11 }, (_, i) => {
          const p = cards[i];
          const r = p ? RARITY[p.rarity] : null;
          return `
            <div class="bslot ${p ? 'filled' : ''}" ${p ? `data-unsubmit="${p.id}"` : ''}
                 ${p ? `style="--rar:${r.color};--rar-glow:${r.glow}"` : ''}>
              ${p ? `
                <span class="bslot-ovr">${p.overall}</span>
                <span class="bslot-name">${p.short}</span>
                <span class="bslot-pos">${p.position}</span>`
                : '<span class="slot-plus">+</span><span class="bslot-pos empty">Empty</span>'}
            </div>`;
        }).join('')}
      </div>

      <div class="sbc-actions">
        <button class="btn ${ok ? 'primary' : 'ghost'}" id="sbcSubmit" ${ok ? '' : 'disabled'}>
          ${ok ? 'Submit and claim' : `${cards.length}/11 — conditions not met`}
        </button>
        <button class="btn ghost" id="sbcClear">Clear</button>
      </div>
      <p class="setting-note warn">Submitting spends these cards permanently.</p>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Your collection <small>${s.club.collection.length}</small></h2></header>
      <div class="collection" id="sbcPool">${sbcPoolHTML()}</div>
    </section>`;
}

function sbcPoolHTML() {
  const s = getState();
  const staged = new Set(submission);
  const items = s.club.collection
    .map(getPlayer)
    .filter((p) => p && !staged.has(p.id))
    .sort(SORTS[sortBy] || SORTS.rating);
  if (!items.length) return '<p class="empty">Nothing left to submit.</p>';
  return items.map((p) => `
    <div class="coll-card" data-submit="${p.id}">${playerCard(p, { size: 'mini' })}</div>`).join('');
}

export function objectivesView() {
  /* Refill before drawing, so opening the tab is what makes a due refresh
     happen. There is no timer running in the background — the clock is stored
     and compared on sight, which also means it works after the app has been
     shut for a week. */
  let refreshed = false;
  update((st) => { refreshed = refreshObjectives(st.ultimate); });
  const u = getState().ultimate;
  const claimed = (u.objClaimed || []).length;

  const left = Math.max(0, (u.objRefresh || 0) - Date.now());
  const hrs = Math.floor(left / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  const anyDone = u.objectives.some((o) => o.done >= o.need);

  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Objectives</h2>
        <span class="tag">${claimed}/${LADDER_SIZE} done</span></header>
      <p class="hint">Seven at a time out of ${LADDER_SIZE}, and they get harder and pay
        better the further down you go. The deepest ${ULTIMATE_RUNGS} are the only
        objectives in the game that pay Ultimate.</p>

      <!-- The climb, as one bar. The per-objective bars say how a slot is
           going; this says how the *ladder* is going, which is the thing the
           rewards are actually attached to and the only place the shape of the
           whole run is visible. -->
      <div class="obj-climb" role="img"
           aria-label="${claimed} of ${LADDER_SIZE} objectives complete">
        <i style="width:${(claimed / LADDER_SIZE) * 100}%"></i>
        ${ULTIMATE_RUNGS ? `<u style="left:${((LADDER_SIZE - ULTIMATE_RUNGS) / LADDER_SIZE) * 100}%"
             title="Ultimate rewards start here"></u>` : ''}
      </div>

      <div class="obj-clock ${anyDone ? 'is-due' : ''}">
        <span class="oc-dot"></span>
        <b>${hrs}h ${String(mins).padStart(2, '0')}m</b>
        <span>${anyDone
          ? 'until your finished objectives are replaced'
          : 'until the next refresh — finish some to get new ones'}</span>
      </div>
      ${refreshed ? '<p class="obj-fresh">New objectives dealt.</p>' : ''}

      <ul class="obj-list">
        ${u.objectives.map((o) => {
          const done = o.done >= o.need;
          const pct = Math.min(100, (o.done / o.need) * 100);
          /* "Nearly" is the whole reason to look at this list. An objective at
             80% is the one worth playing one more match for, and it used to
             read exactly like one at 5% — same row, same bar, no emphasis. */
          const close = !done && pct >= 70;
          const left = o.need - Math.min(o.done, o.need);
          return `
            <li class="${done ? 'done' : ''} ${close ? 'close' : ''}">
              <span class="obj-tick">${done ? '✓' : ''}</span>
              <div class="obj-body">
                <b>${o.text}</b>
                <i class="obj-bar"><b style="width:${pct}%"></b></i>
                <span>${done ? 'Complete — replaced at the next refresh'
                    : close
                      ? `${Math.min(o.done, o.need)}/${o.need} — ${left} to go`
                      : `${Math.min(o.done, o.need)}/${o.need}`}</span>
              </div>
              <span class="obj-reward">
                ◈${(o.apex ?? 0).toLocaleString()}
                ${o.ultimate ? `<b class="obj-ult">✦ ${o.ultimate}</b>` : ''}
                <em>${PACK_BY_ID(o.pack).name}</em>
              </span>
            </li>`;
        }).join('')}
      </ul>
    </section>`;
}

/**
 * Shown once, the first time the mode is opened after a save wipe.
 *
 * A player who opens Ultimate XI and finds an empty club and no money will
 * assume the game lost their save, which is worse than being told. It says what
 * happened, why, and what they have been given to start again with.
 */
function apologyCard() {
  if (!getState().flags?.apology) return '';
  return `
    <section class="panel glass apology" id="apologyCard">
      <header class="panel-head"><h2>We reset your club — sorry</h2></header>
      <p>Apex XI now runs on two currencies, and packs cost a lot more than they
         did. Squads built under the old prices were worth several times what a
         new one costs to assemble, so every Ultimate XI club has been wiped back
         to the start — yours included. Career mode is untouched.</p>
      <ul class="ap-list">
        <li><b>◈ 5,000 Apex</b> to start with</li>
        <li><b>A Silver pack</b> in your locker</li>
        <li><b>A free Bronze pack</b> in the store, as always</li>
      </ul>
      <p class="ap-note">Apex is earned from matches — more for winning, more
         again for the division you are in and how much of the ball you had.
         Ultimate is the second currency; nothing costs it yet.</p>
      <button class="btn primary" id="apologyOk">Start again</button>
    </section>`;
}

export function render() {
  const s = getState();
  const { formation, lineup } = s.club;
  const bench = s.club.bench || Array(5).fill(null);
  const chem = chemistryFor(lineup, formation);

  const owned = s.club.packs.length;

  /* The banner reports the ladder rather than repeating the screen's name back
     at you: which rung you are on and the record that got you there is the one
     thing worth carrying above every tab in this mode. */
  const u = s.ultimate;
  const div = DIVISIONS[u.divIdx];
  const head = screenHead({
    kicker: 'Mode 02',
    title: 'Ultimate XI',
    sub: `${div.name} · ${u.wins}W ${u.draws}D ${u.losses}L`
       + `${u.streak >= 2 ? ` · ${u.streak} in a row` : ''}`,
    motif: 'ladder', tone: 'a',
  });

  /* The dock. The mode's navigation is a bar along the bottom edge — icon
   * over label, the shape every mobile football game trains thumbs on — and
   * it is the same six buttons it always was: same ids, same handler, same
   * `data-utab`, so the tutorial and the pad both keep working. Only the CSS
   * knows it moved. */
  const TAB_ICON = {
    club: '<path d="M7.5 3.5h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><circle cx="12" cy="10.4" r="1.5"/><path d="M12 12.4c1.9 0 3.4 1.5 3.4 3.4h-6.8c0-1.9 1.5-3.4 3.4-3.4z"/>',
    division: '<path d="M7 20V5M17 20V5M7 8.5h10M7 12.5h10M7 16.5h10"/>',
    online: '<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8M12 3.6c2.6 2.2 4 5.1 4 8.4s-1.4 6.2-4 8.4c-2.6-2.2-4-5.1-4-8.4s1.4-6.2 4-8.4z"/>',
    objectives: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.2"/>',
    challenges: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M12 13v3.2M9 20h6M9.6 16.2h4.8L15 20H9z"/>',
    store: '<path d="M6 8.5h12l-1 11a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
  };
  const tabIcon = (id) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TAB_ICON[id]}</svg>`;

  const tabs = head + `
    <nav class="tabs" id="uTabs">
      ${[['club', 'Club'], ['division', 'Division'], ['online', 'Online'],
         ['objectives', 'Objectives'], ['challenges', 'Challenges'],
         ['store', `Store${owned ? ` <i class="tab-dot">${owned}</i>` : ''}`]]
        .map(([id, label]) => `<button class="tab ${tab === id ? 'on' : ''}" data-utab="${id}">${tabIcon(id)}<span>${label}</span></button>`).join('')}
    </nav>`;

  // the apology sits above whichever tab is open, so it cannot be missed by
  // landing on the store instead of the squad
  const sorry = apologyCard();

  if (tab === 'online') return tabs + sorry + onlineView();
  if (tab === 'division') return tabs + sorry + divisionView();
  if (tab === 'objectives') return tabs + sorry + objectivesView();
  if (tab === 'challenges') return tabs + sorry + challengesView();
  if (tab === 'store') return tabs + sorry + storeView();

  /* The Club tab's second row.
   *
   * Deliberately a different shape from the row above it — a rule and an
   * underline rather than pills — so two navigations stacked on top of each
   * other read as a hierarchy instead of as fourteen buttons. */
  const sub = `
    <nav class="subtabs" id="cSubs">
      ${[['squad', 'Squad'], ['badge', 'Club Badge'], ['name', 'Club Name']]
        .map(([id, label]) =>
          `<button class="subtab ${clubTab === id ? 'on' : ''}" data-ctab="${id}">${label}</button>`).join('')}
    </nav>`;

  if (clubTab === 'badge') return tabs + sorry + sub + badgeView();
  if (clubTab === 'name') return tabs + sorry + sub + nameView();

  return tabs + sorry + sub + `
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
        <p class="pitch-hint">Tap an empty slot to see who can play there, or drag a card onto the pitch.</p>

        <!-- Five seats. Three of them can come on in a match; a keeper can only
             be replaced by a keeper, so it is worth carrying one. -->
        <div class="bench-strip">
          <span class="bench-label">Bench</span>
          <div class="bench-slots" id="bench">
            ${bench.map((id, i) => benchHTML(i, id)).join('')}
          </div>
        </div>
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
            <label class="field inline">
              <span>Sort</span>
              <select id="collSort">
                ${[['rating', 'Rating'], ['position', 'Position'], ['value', 'Value'], ['name', 'Name']]
                  .map(([v, l]) => `<option value="${v}" ${sortBy === v ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </label>
          </header>
          <div class="chips" id="filters">
            ${['all', 'icon', 'star', 'special', 'gold', 'silver', 'bronze'].map((f) => `
              <button class="chip ${filter === f ? 'on' : ''}" data-filter="${f}">${f === 'all' ? 'All' : RARITY[f].label}</button>`).join('')}
          </div>
          <div class="chips" id="groupFilters">
            ${GROUPS.map(([g, label]) => `
              <button class="chip ${group === g ? 'on' : ''}" data-group="${g}">${label}</button>`).join('')}
          </div>
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

function benchHTML(i, playerId) {
  const p = playerId ? getPlayer(playerId) : null;
  const r = p ? RARITY[p.rarity] : null;
  return `
    <div class="bslot ${p ? 'filled' : ''}" data-bench="${i}"
         ${p ? `style="--rar:${r.color};--rar-glow:${r.glow}"` : ''}>
      ${p ? `
        <span class="bslot-ovr">${p.overall}</span>
        <span class="bslot-name">${p.short}</span>
        <span class="bslot-pos">${p.position}</span>
        <button class="slot-x" data-bclear="${i}" aria-label="Remove ${p.name}">×</button>
      ` : '<span class="slot-plus">+</span><span class="bslot-pos empty">SUB</span>'}
    </div>`;
}

/** How well a player suits a slot: 0 exact, 1 same group, 2 out of position. */
const fitFor = (p, slotPos) =>
  (p.position === slotPos ? 0 : POSITIONS[p.position].group === POSITIONS[slotPos].group ? 1 : 2);

function collectionHTML() {
  const s = getState();
  // anyone already named — on the pitch or on the bench — is hidden here
  const used = new Set([...s.club.lineup, ...(s.club.bench || [])].filter(Boolean));
  const slot = pickSlot === null ? null : FORMATIONS[s.club.formation][pickSlot];

  let items = s.club.collection
    .map(getPlayer)
    .filter((p) => p && !used.has(p.id)
      && (filter === 'all' || p.rarity === filter)
      && (group === 'all' || POSITIONS[p.position].group === group));

  // Filling a slot: whoever can play there comes first, best fit then best player.
  items = slot
    ? items.sort((a, b) => fitFor(a, slot.pos) - fitFor(b, slot.pos) || b.overall - a.overall)
    : items.sort(SORTS[sortBy] || SORTS.rating);

  const banner = slot
    ? `<div class="coll-banner">
         <b>Pick a ${slot.pos}</b>
         <button class="mini-btn" data-cancel-pick>Cancel</button>
       </div>`
    : '';

  if (!s.club.collection.length) {
    return `<p class="empty">No cards yet — grab a pack from the Store.</p>`;
  }
  if (!items.length) {
    const narrowed = filter !== 'all' || group !== 'all';
    return banner + `<p class="empty">${narrowed
      ? 'Nothing on the bench matches those filters.'
      : 'Every card you own is in the XI.'}</p>`;
  }

  return banner + items.map((p) => {
    const fit = slot ? fitFor(p, slot.pos) : null;
    return `
    <div class="coll-item ${selectedId === p.id ? 'is-selected' : ''} ${fit === 2 ? 'is-misfit' : ''}"
         data-player="${p.id}" draggable="false">
      ${playerCard(p, { size: 'mini' })}
      ${slot ? `<span class="coll-fit fit-${fit}">${fit === 0 ? 'Fits' : fit === 1 ? 'Near' : 'Out of position'}</span>` : ''}
      <div class="coll-tools">
        <button class="mini-btn" data-detail="${p.id}">Info</button>
        <button class="mini-btn danger" data-sell="${p.id}">Sell ◈${dupValue(p).toLocaleString()}</button>
      </div>
    </div>`;
  }).join('');
}

/* ------------------------------------------------------------------ *
 * Mount
 * ------------------------------------------------------------------ */
export function mount(root) {
  // Dismissing clears the flag for good: it is an explanation, not a nag.
  root.querySelector('#apologyOk')?.addEventListener('click', () => {
    update((s) => { s.flags.apology = false; });
    root.querySelector('#apologyCard')?.remove();
  });

  // tab bar is on every view
  root.querySelector('#uTabs')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-utab]');
    if (!b) return;
    tab = b.dataset.utab;
    pickSlot = null;
    navigate('squad');
  });

  // the Store tab's own row
  root.querySelector('#sSubs')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-stab]');
    if (!b) return;
    storeTab = b.dataset.stab;
    navigate('squad');
  });

  // and the Club tab's own row
  root.querySelector('#cSubs')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ctab]');
    if (!b) return;
    clubTab = b.dataset.ctab;
    pickSlot = null;
    navigate('squad');
  });

  /* Your club.
   *
   * The badge redraws in place rather than through a re-render, because a
   * re-render would tear the text field out from under whoever is typing in it.
   * Everything writes straight to state — there is no Save button, and nothing
   * here can be invalid enough to need one. */
  if (tab === 'club' && clubTab !== 'squad') {
    const preview = root.querySelector('#ciPreview');
    const nameEl = root.querySelector('#ciName');
    const shortEl = root.querySelector('#ciShort');

    const repaint = () => {
      const id = clubIdentity();
      if (preview) preview.innerHTML = crestSVG(id.crest, id.short, 148);
      /* Every option previews itself against the rest of the club rather than
         in isolation, so picking a shape shows it in your colours with your
         device on it. Written through innerHTML on a wrapper: crestSVG returns
         a string with leading whitespace, so parsing it and grabbing the first
         *node* hands back the whitespace rather than the badge. */
      root.querySelectorAll('[data-part]').forEach((b) => {
        const slot = b.querySelector('.ci-badge');
        if (slot) slot.innerHTML = crestSVG({ ...id.crest, [b.dataset.part]: b.dataset.val }, id.short, 34);
      });
      // the Club Name page previews the in-match scoreboard, so it follows too
      const bug = root.querySelector('.ci-scorebug .bug-team');
      if (bug) bug.innerHTML = `${crestSVG(id.crest, id.short, 20)}<b>${id.short}</b>`;
    };

    root.querySelector('.panel')?.addEventListener('click', (e) => {
      const part = e.target.closest('[data-part]');
      if (part) {
        update((s) => { s.club.identity = { ...clubIdentity(), crest: { ...clubIdentity().crest, [part.dataset.part]: part.dataset.val } }; });
        root.querySelectorAll(`[data-part="${part.dataset.part}"]`)
          .forEach((x) => x.classList.toggle('on', x === part));
        repaint();
        return;
      }
      const kit = e.target.closest('[data-kit]');
      if (kit) {
        const colors = kit.dataset.kit.split('|');
        update((s) => { s.club.identity = { ...clubIdentity(), crest: { ...clubIdentity().crest, colors } }; });
        root.querySelectorAll('[data-kit]').forEach((x) => x.classList.toggle('on', x === kit));
        repaint();
      }
    });

    nameEl?.addEventListener('input', () => {
      const v = nameEl.value.trim() || 'Ultimate XI';
      update((s) => { s.club.identity = { ...clubIdentity(), name: v }; });
    });
    shortEl?.addEventListener('input', () => {
      // three letters is what the scoreboard and the badge have room for
      shortEl.value = shortEl.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);
      const v = shortEl.value || 'UXI';
      update((s) => { s.club.identity = { ...clubIdentity(), short: v }; });
      repaint();
    });
    return;
  }

  if (tab === 'online') {
    return api.isSignedIn()
      ? mountOnline(root, { rerender: () => navigate('squad') })
      : mountSignIn(root, () => navigate('squad'));
  }

  if (tab === 'division') {
    root.querySelector('#playDivision')?.addEventListener('click', () => {
      const squad = ultimateSquad();
      if (!squad) return toast('Fill all 11 positions first', 'warn');
      const u = getState().ultimate;
      /* The opponent is built to measure against the squad you are actually
         fielding — see divisionOpponent. Fielding a real club here is what made
         the ladder a walkover: the best club in the world is an 86, so every
         rung was beatable by collecting rather than by playing. */
      const rating = Math.round(
        squad.xi.reduce((t, p) => t + p.overall, 0) / squad.xi.length);
      const opp = divisionOpponent(u.divIdx, rating);
      navigate('play', {
        homeId: WORLD.clubs[0].id,
        awayId: WORLD.clubs[1].id,
        /* Three minutes, not four. Four was long enough to drag, and shorter
           than this stops being a football match: measured over 40 matches a
           side, 240s gives 2.38 goals with 10% goalless, 180s gives 1.85 with
           5%, and 120s collapses to 1.20 with a quarter of matches finishing
           0-0 — which trades "boring because it is long" for "boring because
           nothing happened". */
        duration: 180,
        skill: divisionSkill(u.divIdx),
        mode: 'single',
        ultimate: true,
        homeSquad: squad,
        awaySquad: opp,
      });
    });
    return;
  }
  if (tab === 'objectives') return;

  if (tab === 'challenges') {
    const refresh = () => navigate('squad');

    root.querySelector('.sbc-list')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sbc]');
      if (!b) return;
      openChallenge = challengeById(b.dataset.sbc);
      submission = [];
      refresh();
    });

    root.querySelector('#sbcBack')?.addEventListener('click', () => {
      openChallenge = null;
      submission = [];
      refresh();
    });
    root.querySelector('#sbcClear')?.addEventListener('click', () => { submission = []; refresh(); });

    root.querySelector('#sbcPool')?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-submit]');
      if (!card || submission.length >= 11) return;
      submission.push(card.dataset.submit);
      refresh();
    });
    root.querySelector('#sbcTray')?.addEventListener('click', (e) => {
      const slot = e.target.closest('[data-unsubmit]');
      if (!slot) return;
      submission = submission.filter((id) => id !== slot.dataset.unsubmit);
      refresh();
    });

    root.querySelector('#sbcSubmit')?.addEventListener('click', () => {
      const c = openChallenge;
      const cards = submittedCards();
      const chem = chemistryFor([...submission, ...Array(11).fill(null)].slice(0, 11),
        getState().club.formation);
      if (!c || !evaluate(c, cards, chem).ok) return toast('Conditions not met', 'warn');

      const spent = new Set(submission);
      update((st) => {
        // the cards are gone, and gone from the XI and the bench with them
        st.club.collection = st.club.collection.filter((id) => !spent.has(id));
        st.club.lineup = st.club.lineup.map((id) => (spent.has(id) ? null : id));
        st.club.bench = (st.club.bench || []).map((id) => (spent.has(id) ? null : id));
        st.club.apex += c.reward.apex;
        if (c.reward.ultimate) st.club.ultimate = (st.club.ultimate || 0) + c.reward.ultimate;
        if (c.reward.pack) st.club.packs.push(c.reward.pack);
        if (!Array.isArray(st.club.challengesDone)) st.club.challengesDone = [];
        if (!st.club.challengesDone.includes(c.id)) st.club.challengesDone.push(c.id);
      });
      refreshCoins();
      sfx('coin');
      toast(`${c.name} complete — ◈${c.reward.apex.toLocaleString()}`
        + `${c.reward.ultimate ? ` · ✦${c.reward.ultimate}` : ''} · ${c.reward.pack} pack`);
      openChallenge = null;
      submission = [];
      refresh();
    });
    return;
  }

  if (tab === 'store') {
    // buy -> straight into the locker, never auto-opened
    root.querySelectorAll('[data-buy-pack]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pack = PACKS.find((p) => p.id === btn.dataset.buyPack);
        const s = getState();
        if (pack.cost > (s.club.apex || 0)) return toast('Not enough Apex', 'warn');
        /* The free pack is a timer, not a ratio. The old gate was
         * `packsOpened % 3` — but *claiming* never increments packsOpened,
         * only opening does, so whenever the count sat on a multiple of three
         * the button could be pressed forever and bank a bronze per click. A
         * timestamp cannot be farmed by not opening things. */
        if (pack.cost === 0 && Date.now() < (s.club.freeAt || 0)) {
          return toast(`Next free pack in ${fmtLeft((s.club.freeAt || 0) - Date.now())}`, 'warn');
        }
        update((st) => {
          st.club.apex -= pack.cost;
          if (pack.cost === 0) st.club.freeAt = Date.now() + FREE_MS;
          st.club.packs.push(pack.id);
        });
        refreshCoins();
        sfx('coin');
        toast(`${pack.name} added to your locker`, 'good');
        navigate('squad');
      });
    });

    const openPacks = (ids) => {
      // one running set across the batch, so ten packs can't hand over the same
      // card ten times
      const seen = ownedIds();
      let needGK = !hasKeeper(getState().club.collection);
      const drawn = [];
      for (const id of ids) {
        const pack = PACKS.find((p) => p.id === id) || PACKS[0];
        const pulls = openPack(pack, seen, needGK);
        if (pulls.some((x) => x.p.position === 'GK')) needGK = false;
        drawn.push(...pulls);
      }
      const coins = drawn.filter((x) => x.dup).reduce((sum, x) => sum + dupValue(x.p), 0);

      update((st) => {
        for (const id of ids) {
          const i = st.club.packs.indexOf(id);
          if (i >= 0) st.club.packs.splice(i, 1);
          st.club.packsOpened += 1;
        }
        drawn.forEach(({ p }) => { if (!st.club.collection.includes(p.id)) st.club.collection.push(p.id); });
        st.club.apex += coins;
      });
      refreshCoins();
      runPackAnimation(root, drawn, coins, () => navigate('squad'));
    };

    root.querySelectorAll('[data-open-pack]').forEach((btn) => {
      btn.addEventListener('click', () => openPacks([btn.dataset.openPack]));
    });
    root.querySelector('#openAll')?.addEventListener('click', () => {
      const all = getState().club.packs.slice();
      if (!all.length) return;
      openPacks(all);
    });

    /* The Icon Exchange lives on the store tab, so its listener has to be bound
     * inside this branch — the branch returns, and a listener attached after it
     * simply never ran. That is why the first version of this looked correct
     * and bought nothing. */
    root.querySelector('.xchg-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-buy-icon]');
      if (!btn) return;
      const p = getPlayer(btn.dataset.buyIcon);
      const st0 = getState();
      if ((st0.club.ultimate || 0) < ICON_PRICE) return toast('Not enough Ultimate', 'warn');
      if (st0.club.collection.includes(p.id)) return toast(`${p.name} is already yours`, 'info');
      update((st) => {
        st.club.ultimate -= ICON_PRICE;
        st.club.collection.push(p.id);
      });
      refreshCoins();
      sfx('reveal');
      toast(`${p.name} joins your club`);
      navigate('squad');
    });

    return;
  }

  const pitch = root.querySelector('#pitch');
  const benchEl = root.querySelector('#bench');
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
    if (benchEl) {
      benchEl.innerHTML = (s.club.bench || []).map((id, i) => benchHTML(i, id)).join('');
      if (pickBench !== null) {
        benchEl.querySelector(`[data-bench="${pickBench}"]`)?.classList.add('is-picking');
      }
    }
    collectionEl.innerHTML = collectionHTML();
    // slots are re-rendered wholesale, so the highlight has to go back on
    if (pickSlot !== null) pitch.querySelector(`[data-slot="${pickSlot}"]`)?.classList.add('is-picking');
  };

  const placeBench = (playerId, seat) => {
    update((s) => {
      // a player can be in exactly one place: pull him out of wherever he was
      const inXI = s.club.lineup.indexOf(playerId);
      if (inXI >= 0) s.club.lineup[inXI] = null;
      const onBench = s.club.bench.indexOf(playerId);
      if (onBench >= 0) s.club.bench[onBench] = null;
      s.club.bench[seat] = playerId;
    });
    selectedId = null;
    pickBench = null;
    rerenderPitch();
  };

  const place = (playerId, slotIndex) => {
    update((s) => {
      const existing = s.club.lineup.indexOf(playerId);
      if (existing >= 0) s.club.lineup[existing] = null;   // move, don't duplicate
      const onBench = (s.club.bench || []).indexOf(playerId);
      if (onBench >= 0) s.club.bench[onBench] = null;      // ...including off the bench
      s.club.lineup[slotIndex] = playerId;
    });
    selectedId = null;
    pickSlot = null;
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

  root.querySelector('#groupFilters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-group]');
    if (!b) return;
    group = b.dataset.group;
    root.querySelectorAll('[data-group]').forEach((x) => x.classList.toggle('on', x.dataset.group === group));
    collectionEl.innerHTML = collectionHTML();
  });

  root.querySelector('#collSort').addEventListener('change', (e) => {
    sortBy = e.target.value;
    collectionEl.innerHTML = collectionHTML();
  });

  /* --- collection actions --- */
  collectionEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-cancel-pick]')) return endPick();

    const detail = e.target.closest('[data-detail]');
    if (detail) return showDetail(root, getPlayer(detail.dataset.detail));

    // filling a named slot: one tap on a card puts them straight in it
    const card = e.target.closest('[data-player]');
    if (card && !e.target.closest('button')) {
      if (pickSlot !== null) {
        const slotIndex = pickSlot;
        pickSlot = null;
        pitch.querySelectorAll('.is-picking').forEach((el) => el.classList.remove('is-picking'));
        return place(card.dataset.player, slotIndex);
      }
      if (pickBench !== null) {
        const seat = pickBench;
        pickBench = null;
        return placeBench(card.dataset.player, seat);
      }
    }

    const sell = e.target.closest('[data-sell]');
    if (sell) {
      /* Pay for the card **only if it was actually there to remove**.
       *
       * This used to credit the coins unconditionally and remove the id with a
       * `filter`, which is a no-op once the card is gone. So a second click on
       * the same button — trivial with an auto-clicker, and possible by hand on
       * a stale button — removed nothing and paid in full, again, and again.
       * Someone reached three million Apex that way.
       *
       * The check and the credit are now the same statement inside one
       * `update`: the amount is decided by whether the splice happened, so
       * there is no window between "is it still mine" and "pay me" for a
       * second click to slip into. `paid` staying zero is the signal that this
       * click sold nothing, and it then does nothing at all — no coins, no
       * toast, no sound, so a held-down button is silent rather than lucrative.
       *
       * Cards are unique in `collection` (both the pack opener and the Icon
       * Exchange check `includes` before pushing), so removing one index is
       * removing the card, not one of several copies. */
      const p = getPlayer(sell.dataset.sell);
      if (!p) return;
      let paid = 0;
      update((s) => {
        const at = s.club.collection.indexOf(p.id);
        if (at === -1) return;
        s.club.collection.splice(at, 1);
        s.club.lineup = s.club.lineup.map((id) => (id === p.id ? null : id));
        s.club.bench = (s.club.bench || []).map((id) => (id === p.id ? null : id));
        paid = Math.round(p.value / 25_000);
        s.club.apex += paid;
      });
      if (!paid) return;
      refreshCoins();
      const chip = root.querySelector('.coin-chip');
      if (chip) chip.textContent = `◈ ${getState().club.apex.toLocaleString()}`;
      rerenderPitch();
      toast(`Sold ${p.name} for ◈${paid.toLocaleString()}`);
    }
  });

  /* --- slot clear + tap-to-place --- */
  const endPick = () => {
    pickSlot = null;
    pickBench = null;
    root.querySelectorAll('.is-picking').forEach((el) => el.classList.remove('is-picking'));
    collectionEl.innerHTML = collectionHTML();
  };

  benchEl?.addEventListener('click', (e) => {
    const x = e.target.closest('[data-bclear]');
    if (x) {
      update((s) => { s.club.bench[+x.dataset.bclear] = null; });
      return rerenderPitch();
    }
    const seat = e.target.closest('[data-bench]');
    if (!seat) return;
    const i = +seat.dataset.bench;
    if (selectedId) return placeBench(selectedId, i);
    if (!getState().club.bench[i]) {
      pickBench = pickBench === i ? null : i;
      pickSlot = null;
      root.querySelectorAll('.is-picking').forEach((el) => el.classList.remove('is-picking'));
      if (pickBench !== null) seat.classList.add('is-picking');
      collectionEl.innerHTML = collectionHTML();
      collectionEl.scrollTop = 0;
    }
  });

  pitch.addEventListener('click', (e) => {
    const x = e.target.closest('[data-clear]');
    if (x) {
      update((s) => { s.club.lineup[+x.dataset.clear] = null; });
      return rerenderPitch();
    }
    const slot = e.target.closest('[data-slot]');
    if (!slot) return;
    const i = +slot.dataset.slot;
    if (selectedId) return place(selectedId, i);
    // an empty slot asks the collection "who can play here?"
    if (!getState().club.lineup[i]) {
      pickSlot = pickSlot === i ? null : i;
      pitch.querySelectorAll('.is-picking').forEach((el) => el.classList.remove('is-picking'));
      if (pickSlot !== null) slot.classList.add('is-picking');
      collectionEl.innerHTML = collectionHTML();
      collectionEl.scrollTop = 0;
    }
  });

  const clearSlot = (i) => {
    update((s) => { s.club.lineup[i] = null; });
    rerenderPitch();
  };

  const detachDrag = attachDrag(root, place, clearSlot, () => {
    root.querySelectorAll('.coll-item').forEach((el) =>
      el.classList.toggle('is-selected', el.dataset.player === selectedId));
  });
  // leaving the screen ends "fill this slot" — coming back to a stale pick,
  // possibly one that has since been filled, would just be confusing
  return () => { pickSlot = null; detachDrag(); };
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
 * Staged pack reveal. One card walks out — the best pull in the pack — one clue
 * at a time: nationality, then position, then club, before the card itself
 * drops. Tap or press to skip straight to the card.
 *
 * Only the best card is shown. A twelve-card pack used to make you sit through
 * eleven cards you did not care about to reach the one you did, and the ones in
 * front were, by construction, the worst of them. Everything is still added and
 * every duplicate is still paid out — the locker has the full list — but the
 * reveal is now the moment, not the queue.
 */
function runPackAnimation(root, drawn, coins, onDone) {
  /* Worst first, best last.
   *
   * The reveal used to run in draw order, so the 92 could walk out first and
   * leave three bronzes to sit through afterwards — the pack peaked and then
   * apologised for four cards. Sorting by rating turns the same pull into a
   * climb, and the card everything has been building towards is the one still
   * on screen when it ends.
   *
   * This is why `openPack` puts a guaranteed card in a random slot: that was
   * there to stop the reveal always ending on the same beat, which was the
   * right worry for an unsorted order and is the wrong one now. The order is
   * decided here, at the point the cards are shown, and the pull itself is
   * untouched — nothing about what you got changes, only what gets a stage.
   *
   * `drawn` is sorted alongside, because `dup` is looked up by index and the
   * two lists have to keep pointing at the same card. */
  const order = drawn
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (a.d.p.overall - b.d.p.overall) || (a.i - b.i));
  drawn = order.map((o) => o.d);
  const pulls = drawn.map((x) => x.p);
  const isDup = (i) => !!drawn[i].dup;
  const dupCount = drawn.filter((x) => x.dup).length;

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
    <!-- The rip. A pack you never touch is a slideshow; this one sits in your
         hand first — breathing, foil catching the light — and does not open
         until you tear it. One rip per opening, however many cards follow. -->
    <div class="pack-rip" id="packRip" role="button" aria-label="Rip the pack open">
      <div class="rip-pack">
        <span class="rip-fan" aria-hidden="true"><i></i><i></i></span>
        <div class="rip-face">
          <i class="rip-strip"></i>
          <span class="rip-mark">UXI</span>
          <span class="rip-count">×${pulls.length}</span>
        </div>
        <i class="rip-flash" aria-hidden="true"></i>
      </div>
      <span class="rip-hint">Tap to rip it open</span>
    </div>
    <div class="pack-stage" hidden>
      <div class="pack-burst"></div>
      <div class="pack-rays"></div>
      <div class="plinths" id="plinths">
        <div class="plinth" data-step="0"><span class="pl-label">Nation</span><div class="pl-slot"></div></div>
        <div class="plinth" data-step="1"><span class="pl-label">Position</span><div class="pl-slot"></div></div>
        <div class="plinth" data-step="2"><span class="pl-label">Club</span><div class="pl-slot"></div></div>
      </div>
      <div class="walkout" id="walkout"></div>
      <div class="pack-foot">
        <span id="packCounter">${pulls.length > 1 ? `Best of ${pulls.length}` : 'Your pull'}</span>
        <button class="btn" id="packNext">Skip</button>
      </div>
    </div>`;

  const stage = overlay.querySelector('.pack-stage');
  const plinths = overlay.querySelector('#plinths');
  const walkout = overlay.querySelector('#walkout');
  const counter = overlay.querySelector('#packCounter');
  const nextBtn = overlay.querySelector('#packNext');

  // worst-first sort means the best pull is the last entry, and it is the only
  // one that gets a reveal
  let index = pulls.length - 1;
  let timers = [];
  let revealed = false;
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  const slots = () => [...plinths.querySelectorAll('.plinth')];

  /* The moments that deserve fireworks get them: special and above shakes the
     stage and drops confetti in the pull's colours. Bronze does not — if every
     card explodes, none of them do. */
  const celebrate = (p) => {
    if (document.documentElement.classList.contains('reduce-motion')) return;
    if (p.rarity !== 'special' && p.rarity !== 'star' && p.rarity !== 'icon') return;
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.innerHTML = Array.from({ length: 44 }, (_, i) => {
      const w = (6 + Math.random() * 7).toFixed(0);
      const col = ['var(--rar)', '#ffffff', 'var(--accent)', 'var(--rar-glow)'][i % 4];
      return `<i style="left:${(Math.random() * 100).toFixed(1)}%;width:${w}px;height:${Math.round(w * 0.45)}px;`
        + `background:${col};animation-delay:${(Math.random() * 0.35).toFixed(2)}s;`
        + `animation-duration:${(1.1 + Math.random() * 0.9).toFixed(2)}s;`
        + `rotate:${Math.floor(Math.random() * 360)}deg"></i>`;
    }).join('');
    stage.appendChild(conf);
    at(2200, () => conf.remove());
  };

  const showCard = (p) => {
    revealed = true;
    sfx('reveal', p.rarity);
    plinths.classList.add('done');
    overlay.classList.remove('flash');
    void overlay.offsetWidth;
    overlay.classList.add('flash');
    celebrate(p);
    walkout.innerHTML = `
      <div class="walkout-card reveal-${p.rarity}">${playerCard(p, { size: 'full' })}
        ${isDup(index) ? `<span class="dup-tag">Already yours · ◈${dupValue(p).toLocaleString()}</span>` : ''}
      </div>`;
    nextBtn.textContent = 'Add to collection';
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
    const added = pulls.length - dupCount;
    if (specials) toast(`${specials} SPECIAL pulled!`, 'good');
    else if (coins) toast(`Added ${added} · ${dupCount} already yours for ◈${coins.toLocaleString()}`, 'info');
    else toast(`Added ${added} player${added === 1 ? '' : 's'}`, 'info');
    onDone();
  };

  const advance = () => {
    if (!revealed) { clearTimers(); showCard(pulls[index]); return; }   // skip to the card
    close();
  };

  nextBtn.addEventListener('click', advance);
  stage.addEventListener('click', (e) => { if (!e.target.closest('button')) advance(); });

  /* The rip, then the show. Reduce Motion tears instantly; everyone else gets
     the strip peeling off and the pack bursting before the first plinth. */
  const rip = overlay.querySelector('#packRip');
  let ripped = false;
  const doRip = () => {
    if (ripped) return;
    ripped = true;
    const instant = document.documentElement.classList.contains('reduce-motion');
    sfx('reveal', 'silver');
    rip.classList.add('ripping');
    at(instant ? 0 : 620, () => {
      rip.remove();
      overlay.querySelector('.pack-stage').hidden = false;
      runReveal();
    });
  };
  rip.addEventListener('click', doRip);
  rip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') doRip(); });
  rip.tabIndex = 0;
  rip.focus?.();
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
