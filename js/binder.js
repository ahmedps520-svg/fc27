/**
 * The binder (v80): your card club, and the sets that fill it.
 *
 * Every card you have ever owned goes in the binder — selling one later does
 * not take it out — and the binder is organised into sets: every Icon, each
 * tier of Icon, a club's whole first team, a nation's golds, this week's Team
 * of the Week, the running campaign. Completing a set pays once: Apex, packs,
 * and for the big ones Ultimate. Progress is shown per set, so it is always
 * clear what is missing.
 */
import { getState, update } from './state.js';
import { bump } from './tasks.js';
import { WORLD, getPlayer } from './data/generator.js';
import { weekCards, weekNow, iconTierCards, campaignNow, campaignCards } from './data/promos.js';

/** Remember what you own — called by state.save, so it can never be missed. */
export function noteOwned(club) {
  if (!club) return;
  const seen = club.everOwned || (club.everOwned = {});
  for (const id of club.collection || []) if (!seen[id]) seen[id] = 1;
}

const NATIONS = ['France', 'Brazil', 'England', 'Spain', 'Argentina', 'Germany', 'Italy', 'Portugal', 'Netherlands', 'Saudi Arabia', 'Morocco', 'Belgium'];

/** Every set, with the ids that complete it and what it pays. */
export function sets(now = Date.now()) {
  const out = [];
  out.push({ id: 'icons', name: 'Every Icon', blurb: 'All the Prime Icons.', ids: (WORLD.icons || []).slice(), need: (WORLD.icons || []).length, reward: { apex: 250000, ultimate: 10 } });
  out.push({ id: 'icons-early', name: 'Early Icons', blurb: 'Five Early-tier Icons.', ids: iconTierCards('early').map((p) => p.id), need: 5, reward: { apex: 40000, packs: ['prime'] } });
  out.push({ id: 'stars', name: 'The Stars', blurb: 'Six of the Star cards.', ids: WORLD.players.filter((p) => p.rarity === 'star').map((p) => p.id), need: 6, reward: { apex: 30000, packs: ['prime'] } });
  for (const c of WORLD.clubs.slice(0, 10)) {
    const ids = c.roster.map(getPlayer).filter(Boolean).sort((a, b) => b.overall - a.overall).slice(0, 11).map((p) => p.id);
    out.push({ id: `club-${c.id}`, name: `${c.name} first team`, blurb: `The eleven best of ${c.name}.`, ids, need: 11, reward: { apex: 8000, packs: ['gold'] } });
  }
  for (const n of NATIONS) {
    const ids = WORLD.players.filter((p) => p.nation === n && !p.sbc && (p.rarity === 'gold' || p.rarity === 'special')).map((p) => p.id);
    if (ids.length >= 8) out.push({ id: `nation-${n}`, name: `${n} golds`, blurb: `Any eight gold or better from ${n}.`, ids, need: 8, reward: { apex: 6000, packs: ['gold'] } });
  }
  const wk = weekNow(now);
  out.push({ id: `totw-${wk}`, name: `Team of the Week ${wk % 52 + 1}`, blurb: 'Any three from this week\'s team. Resets weekly.', ids: weekCards('totw', wk).map((p) => p.id), need: 3, reward: { apex: 12000, packs: ['inform'] }, weekly: true });
  const c = campaignNow(now);
  out.push({ id: `camp-${c.id}-${wk}`, name: c.name, blurb: `Any four ${c.name} cards this week.`, ids: campaignCards(c).map((p) => p.id), need: 4, reward: { apex: 15000, packs: ['campaign'] }, weekly: true });
  return out;
}

export function setProgress(set, club = getState().club) {
  const seen = club.everOwned || {};
  const have = set.ids.filter((id) => seen[id] || (club.collection || []).includes(id)).length;
  const claimed = !!club.setsClaimed?.[set.id];
  return { have: Math.min(have, set.need), need: set.need, done: have >= set.need, claimed };
}

export function claimSet(setId) {
  const set = sets().find((x) => x.id === setId);
  if (!set) return { ok: false, why: 'No such set.' };
  const pr = setProgress(set);
  if (!pr.done) return { ok: false, why: 'The set is not complete.' };
  if (pr.claimed) return { ok: false, why: 'Already claimed.' };
  update((s) => {
    s.club.setsClaimed = { ...(s.club.setsClaimed || {}), [setId]: Date.now() };
    s.club.apex += set.reward.apex || 0;
    s.club.ultimate = (s.club.ultimate || 0) + (set.reward.ultimate || 0);
    for (const pk of set.reward.packs || []) s.club.packs.push(pk);
  });
  bump('set');
  return { ok: true, reward: set.reward };
}

export function binderSummary(club = getState().club) {
  const total = Object.keys(club.everOwned || {}).length;
  const all = sets();
  const done = all.filter((x) => setProgress(x, club).done).length;
  return { cards: total, sets: all.length, setsDone: done, claimable: all.filter((x) => { const p = setProgress(x, club); return p.done && !p.claimed; }).length };
}
