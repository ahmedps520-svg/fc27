/**
 * The transfer market (v80) — cards between players, for Apex, earned only.
 *
 * Everything is offline and honest: the other side of every trade is the
 * market itself, a set of listings that refreshes every four hours from the
 * world's cards (and the week's promos), priced around each card's market
 * value, which follows the same supply-and-demand the pack store answers to
 * (economy.js). You can search it, buy now, or bid and wait; you can list your
 * own cards and the market's buyers come for them if the price is right.
 *
 * **Price ranges.** Every card has a floor and a ceiling (half and three
 * times its market value), and nothing can be listed, bid or bought outside
 * them — so the market cannot be used to move coins around or to launder a
 * card at a silly price. A sale pays 5% to the market.
 *
 * **History.** Every card has a price line for the last fourteen days — a
 * deterministic walk around its value — with your own trades on it.
 */
import { getState, update } from './state.js';
import { bump } from './tasks.js';
import { WORLD, getPlayer } from './data/generator.js';
import { price, trade } from './economy.js';
import { valueFromPrice } from './data/cardValue.js';
import { weekCards, campaignCards, campaignNow, weekNow } from './data/promos.js';

export const SLOT_MS = 4 * 3600_000;
export const TAX = 0.05;
/** Cards at or above this rating are never listed by the market itself. */
export const ELITE = 88;
/** The market's buyers do not pay more than this multiple of value. */
export const BUYER_CAP = 1.3;
const DAY = 86_400_000;

/** A card's market value in Apex — ten times what quick-selling it pays. */
export function marketValue(p) {
  if (!p) return 0;
  return valueFromPrice(price(p));
}
export function priceRange(p) {
  const v = marketValue(p);
  return { min: Math.max(100, Math.round(v * 0.5 / 10) * 10), max: Math.round(v * 3 / 10) * 10, value: v };
}

function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const slotOf = (now) => Math.floor(now / SLOT_MS);

/** The market's own listings for a four-hour slot: deterministic, 40 of them. */
function aiListings(slot) {
  const r = rng(hash(`mkt|${slot}`));
  /* The top of the store stays pack-only: market value follows real-world
     worth, not rating, so a 90-rated special could otherwise list for a
     fraction of what the pack that promises one costs. */
  const pool = WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon' && p.overall < ELITE);
  const promo = [...weekCards('inform', weekNow(slot * SLOT_MS)), ...weekCards('totw', weekNow(slot * SLOT_MS)).slice(0, 3), ...campaignCards(campaignNow(slot * SLOT_MS)).slice(-40)].filter((p) => p.overall < ELITE);
  const out = [];
  for (let i = 0; i < 40; i++) {
    let p;
    const roll = r();
    if (roll < 0.12 && promo.length) p = promo[Math.floor(r() * promo.length)];
    else {
      // weighted towards the cards people actually trade: golds and silvers
      const want = roll < 0.55 ? 'gold' : roll < 0.8 ? 'silver' : roll < 0.93 ? 'special' : 'bronze';
      const sub = pool.filter((q) => q.rarity === want);
      p = (sub.length ? sub : pool)[Math.floor(r() * (sub.length || pool.length))];
    }
    const { min, max, value } = priceRange(p);
    const buyNow = Math.max(min, Math.min(max, Math.round(value * (0.9 + r() * 0.5) / 10) * 10));
    const start = Math.max(min, Math.round(buyNow * (0.6 + r() * 0.25) / 10) * 10);
    out.push({ id: `a${slot}-${i}`, cardId: p.id, seller: 'market', start, buyNow, bid: 0, bidder: null, ends: (slot + 1) * SLOT_MS - Math.floor(r() * 3) * 3600_000 });
  }
  return out;
}

function mkt(s) {
  if (!s.club.mkt) s.club.mkt = { mine: [], watch: [], trades: [], bought: [] };
  return s.club.mkt;
}

/**
 * Bring the market up to now: resolve ended listings and bids, and let the
 * market's buyers look at yours. Returns what happened, for a toast.
 */
export function settle(now = Date.now()) {
  const events = [];
  let soldN = 0;
  update((s) => {
    const m = mkt(s);
    const r = rng(hash(`settle|${Math.floor(now / 60000)}`));
    // your bids on the market's listings
    for (const w of m.watch) {
      if (w.done) continue;
      const p = getPlayer(w.cardId);
      const { value } = priceRange(p);
      // somebody else might want it too — likelier the further under value you bid
      if (!w.contested && now > w.at + 20 * 60_000) {
        w.contested = true;
        if (r() < Math.max(0.05, Math.min(0.7, (value - w.bid) / value + 0.15))) {
          s.club.apex += w.bid;                    // escrow back
          w.done = 'outbid'; events.push({ kind: 'outbid', card: p.name, amount: w.bid });
          continue;
        }
      }
      if (now >= w.ends) {
        w.done = 'won';
        s.club.collection.push(w.cardId);
        m.trades.push({ t: now, cardId: w.cardId, side: 'buy', amount: w.bid });
        events.push({ kind: 'won', card: p.name, amount: w.bid });
        trade(p, 'buy');
      }
    }
    m.watch = m.watch.filter((w) => !w.done || now - w.ends < DAY);
    // your listings
    for (const l of m.mine) {
      if (l.done) continue;
      const p = getPlayer(l.cardId);
      const { value } = priceRange(p);
      const hours = Math.max(0, (Math.min(now, l.ends) - (l.checked || l.at)) / 3600_000);
      l.checked = Math.min(now, l.ends);
      // buyers at buy-now: the nearer to value, the likelier each hour
      /* Nobody buys above BUYER_CAP × value: listing at the three-times ceiling
         and waiting used to sell one time in five, which made buy-and-relist a
         coin farm. */
      const perHour = l.buyNow > value * BUYER_CAP ? 0 : Math.max(0.02, Math.min(0.85, 1.35 - l.buyNow / value));
      if (hours > 0 && r() < 1 - Math.pow(1 - perHour, hours)) {
        l.done = 'sold'; l.soldFor = l.buyNow;
      } else if (now >= l.ends) {
        if (l.start <= value * 1.1 && r() < 0.8) { l.done = 'sold'; l.soldFor = Math.min(l.buyNow, Math.round(l.start * (1 + r() * 0.12) / 10) * 10); }
        else { l.done = 'unsold'; s.club.collection.push(l.cardId); events.push({ kind: 'unsold', card: p.name }); }
      }
      if (l.done === 'sold') {
        const net = Math.round(l.soldFor * (1 - TAX));
        s.club.apex += net;
        m.trades.push({ t: now, cardId: l.cardId, side: 'sell', amount: l.soldFor });
        events.push({ kind: 'sold', card: p.name, amount: l.soldFor, net });
        soldN += 1;
        trade(p, 'sell');
      }
    }
    m.mine = m.mine.filter((l) => !l.done || now - l.ends < DAY);
    if (m.trades.length > 200) m.trades.splice(0, m.trades.length - 200);
  });
  if (soldN) bump('trade', soldN);
  return events;
}

/** Search the market. Filters: text, position, rarity, minOvr, maxOvr, maxPrice, nation. */
export function search(filters = {}, now = Date.now()) {
  const s = getState();
  const bought = new Set(mkt(s).bought || []);
  const watched = new Set((mkt(s).watch || []).map((w) => w.listing));
  const list = [...aiListings(slotOf(now)), ...aiListings(slotOf(now) - 1).filter((l) => l.ends > now)]
    .filter((l) => !bought.has(l.id) && !watched.has(l.id));
  const f = filters;
  const q = (f.text || '').trim().toLowerCase();
  return list.map((l) => ({ ...l, p: getPlayer(l.cardId) })).filter(({ p, buyNow }) => p
    && (!q || p.name.toLowerCase().includes(q))
    && (!f.position || p.position === f.position)
    && (!f.rarity || p.rarity === f.rarity)
    && (!f.minOvr || p.overall >= f.minOvr)
    && (!f.maxOvr || p.overall <= f.maxOvr)
    && (!f.maxPrice || buyNow <= f.maxPrice)
    && (!f.nation || p.nation === f.nation))
    .sort((a, b) => (f.sort === 'price' ? a.buyNow - b.buyNow : b.p.overall - a.p.overall || a.buyNow - b.buyNow));
}

export function buyNow(listing, now = Date.now()) {
  const p = getPlayer(listing.cardId);
  const { min, max } = priceRange(p);
  if (listing.buyNow < min || listing.buyNow > max) return { ok: false, why: 'That price is outside the card\'s range.' };
  if (now >= listing.ends) return { ok: false, why: 'That listing has ended.' };
  const s = getState();
  if ((s.club.apex || 0) < listing.buyNow) return { ok: false, why: 'Not enough Apex.' };
  update((st) => {
    const m = mkt(st);
    st.club.apex -= listing.buyNow;
    st.club.collection.push(listing.cardId);
    m.bought.push(listing.id); if (m.bought.length > 400) m.bought.splice(0, 100);
    m.trades.push({ t: now, cardId: listing.cardId, side: 'buy', amount: listing.buyNow });
  });
  trade(p, 'buy');
  bump('trade');
  return { ok: true, card: p };
}

export function placeBid(listing, amount, now = Date.now()) {
  const p = getPlayer(listing.cardId);
  const { min, max } = priceRange(p);
  const least = Math.max(listing.start, min);
  if (amount < least) return { ok: false, why: `The lowest bid is ◈${least.toLocaleString()}.` };
  if (amount > max || amount >= listing.buyNow) return { ok: false, why: 'Buy it now instead — that bid is at or over the buy-now price.' };
  const s = getState();
  if ((s.club.apex || 0) < amount) return { ok: false, why: 'Not enough Apex.' };
  update((st) => {
    st.club.apex -= amount;                       // held until you win or are outbid
    mkt(st).watch.push({ listing: listing.id, cardId: listing.cardId, bid: amount, at: now, ends: listing.ends });
  });
  return { ok: true };
}

export function listCard(cardId, start, buyNowPrice, hours = 6, now = Date.now()) {
  const s = getState();
  const p = getPlayer(cardId);
  if (!p || !s.club.collection.includes(cardId)) return { ok: false, why: 'You do not own that card.' };
  if (s.club.lineup.includes(cardId) || (s.club.bench || []).includes(cardId)) return { ok: false, why: 'Take him out of your squad first.' };
  if (Object.values(s.club.evos || {}).some((e) => e.card === cardId)) return { ok: false, why: 'He is in the middle of an evolution.' };
  if (p.sbc) return { ok: false, why: 'SBC rewards cannot be traded.' };
  const { min, max } = priceRange(p);
  if (start < min || buyNowPrice > max || start > buyNowPrice) return { ok: false, why: `Prices must sit between ◈${min.toLocaleString()} and ◈${max.toLocaleString()}, start below buy now.` };
  update((st) => {
    st.club.collection = st.club.collection.filter((id) => id !== cardId);
    mkt(st).mine.push({ cardId, start, buyNow: buyNowPrice, at: now, ends: now + hours * 3600_000 });
  });
  return { ok: true };
}

/** Fourteen days of price for a card, oldest first, with your own trades in. */
export function history(cardId, days = 14, now = Date.now()) {
  const p = getPlayer(cardId);
  const v = marketValue(p);
  const h = hash(`hist|${cardId}`);
  const today = Math.floor(now / DAY);
  const pts = [];
  for (let d = days - 1; d >= 0; d--) {
    const day = today - d;
    const r = rng(h ^ day)();
    const wave = Math.sin(day / 3 + (h % 7)) * 0.1 + Math.sin(day / 7.3 + (h % 11)) * 0.06;
    pts.push({ day, price: Math.round(v * (1 + wave + (r - 0.5) * 0.08) / 10) * 10 });
  }
  const mine = (getState().club.mkt?.trades || []).filter((t) => t.cardId === cardId && t.t > now - days * DAY);
  return { pts, trades: mine, value: v };
}

/** SVG sparkline of `history`. */
export function historySVG(cardId, w = 260, h = 70) {
  const { pts, trades } = history(cardId);
  const lo = Math.min(...pts.map((x) => x.price)) * 0.96; const hi = Math.max(...pts.map((x) => x.price)) * 1.04;
  const X = (i) => (i / (pts.length - 1)) * (w - 8) + 4; const Y = (v) => h - 4 - ((v - lo) / Math.max(1, hi - lo)) * (h - 8);
  const line = pts.map((pt, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(pt.price).toFixed(1)}`).join(' ');
  const first = pts[0].day;
  const dots = trades.map((t) => { const i = Math.max(0, Math.min(pts.length - 1, Math.floor(t.t / DAY) - first)); return `<circle cx="${X(i)}" cy="${Y(t.amount)}" r="3" fill="${t.side === 'buy' ? '#7cff6b' : '#ff5c8a'}"/>`; }).join('');
  return `<svg class="mkt-graph" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Price over fourteen days">
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2"/>${dots}
    <text x="4" y="12" fill="currentColor" font-size="10" opacity=".7">◈${Math.round(hi).toLocaleString()}</text>
    <text x="4" y="${h - 6}" fill="currentColor" font-size="10" opacity=".7">◈${Math.round(lo).toLocaleString()}</text></svg>`;
}

/** Your best card's price — for the watch. */
export function bestCardPrice() {
  const s = getState();
  const best = s.club.collection.map(getPlayer).filter(Boolean).sort((a, b) => b.overall - a.overall)[0];
  return best ? { name: best.short || best.name, overall: best.overall, value: marketValue(best) } : null;
}
