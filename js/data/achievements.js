/**
 * Achievements: forty-odd things worth a trophy.
 *
 * Every one is a number read off the save (`get`) against a target (`need`).
 * Nothing here is incremented by hand: the counters live in `club.stats`,
 * fed by `progress.js`, and an achievement is simply a threshold on one of
 * them — so a new achievement is a row, not a hook. `group` is the cabinet
 * shelf it sits on. Rewards are paid on claim, from the trophy room.
 */
const A = (id, group, name, blurb, need, get, apex, xp = 100, tier = 'bronze') =>
  ({ id, group, name, blurb, need, get, apex, xp, tier });

const c = (k) => (s) => (s.club.stats?.[k] | 0);
const coll = (s) => (s.club.collection || []).length;
const rarityCount = (r) => (s) => (s.club.collection || []).filter((id) => s.world?.[id]?.rarity === r).length;
const nationCount = (n) => (s) => (s.club.collection || []).filter((id) => s.world?.[id]?.nation === n).length;
const clubsRepresented = (s) => new Set((s.club.collection || []).map((id) => s.world?.[id]?.clubId).filter(Boolean)).size;

export const GROUPS = [
  ['collect', 'Collecting'], ['match', 'Matches'], ['division', 'Apex Division'], ['sbc', 'Challenges'],
  ['career', 'Career'], ['online', 'Online'], ['weekend', 'Weekend League'], ['season', 'Seasons & Events'],
  ['watch', 'Watch'], ['club', 'Club'],
];

export const ACHIEVEMENTS = [
  // collecting
  A('first-card', 'collect', 'First of Many', 'Own a card.', 1, coll, 200, 50),
  A('cards-25', 'collect', 'Squad Depth', 'Own 25 cards.', 25, coll, 500),
  A('cards-50', 'collect', 'Collector', 'Own 50 cards.', 50, coll, 1000),
  A('cards-100', 'collect', 'Curator', 'Own 100 cards.', 100, coll, 2500, 150, 'silver'),
  A('cards-250', 'collect', 'Archivist', 'Own 250 cards.', 250, coll, 6000, 250, 'gold'),
  A('cards-500', 'collect', 'The Whole Album', 'Own 500 cards.', 500, coll, 15000, 400, 'gold'),
  A('first-gold', 'collect', 'Gold Standard', 'Own a Gold card.', 1, rarityCount('gold'), 400, 60),
  A('first-special', 'collect', 'Something Special', 'Own a Special card.', 1, rarityCount('special'), 1000, 100, 'silver'),
  A('first-star', 'collect', 'Starstruck', 'Own a Star card.', 1, rarityCount('star'), 2500, 150, 'silver'),
  A('first-icon', 'collect', 'Immortal', 'Own an Icon.', 1, rarityCount('icon'), 6000, 250, 'gold'),
  A('falcons-10', 'collect', 'Green Falcons', 'Own 10 Saudi internationals.', 10, nationCount('Saudi Arabia'), 3000, 150, 'silver'),
  A('all-clubs', 'collect', 'Twenty Badges', 'Own a player from every one of the 20 clubs.', 20, clubsRepresented, 4000, 200, 'silver'),
  A('packs-10', 'collect', 'Ripper', 'Open 10 packs.', 10, (s) => s.club.packsOpened | 0, 500),
  A('packs-100', 'collect', 'Pack Animal', 'Open 100 packs.', 100, (s) => s.club.packsOpened | 0, 5000, 250, 'gold'),
  // matches
  A('first-win', 'match', 'Three Points', 'Win a match.', 1, c('wins'), 300, 60),
  A('wins-10', 'match', 'Form', 'Win 10 matches.', 10, c('wins'), 1000),
  A('wins-50', 'match', 'Winning Habit', 'Win 50 matches.', 50, c('wins'), 4000, 200, 'silver'),
  A('wins-200', 'match', 'Serial Winner', 'Win 200 matches.', 200, c('wins'), 15000, 400, 'gold'),
  A('goals-100', 'match', 'Century', 'Score 100 goals.', 100, c('goals'), 3000, 150, 'silver'),
  A('hat-trick', 'match', 'Hat-trick', 'Score three or more in one match.', 1, c('hatTricks'), 800, 100),
  A('clean-10', 'match', 'Shutout', 'Keep 10 clean sheets.', 10, c('cleanSheets'), 1500, 120),
  A('bigwin-5', 'match', 'Thrashing', 'Win five matches by three or more.', 5, c('bigWins'), 1500, 120),
  A('matches-100', 'match', 'Regular', 'Play 100 matches.', 100, c('matches'), 2500, 150, 'silver'),
  // division
  A('div-7', 'division', 'Climbing', 'Reach Division 7.', 3, (s) => s.ultimate.divIdx | 0, 1000, 100),
  A('div-5', 'division', 'Contender', 'Reach Division 5.', 5, (s) => s.ultimate.divIdx | 0, 2500, 150, 'silver'),
  A('div-3', 'division', 'Elite Company', 'Reach Division 3.', 7, (s) => s.ultimate.divIdx | 0, 5000, 250, 'gold'),
  A('div-1', 'division', 'Top of the World', 'Reach Division 1.', 9, (s) => s.ultimate.divIdx | 0, 12000, 400, 'gold'),
  A('streak-5', 'division', 'Unstoppable', 'Win five division matches in a row.', 5, (s) => s.ultimate.bestStreak | 0, 2000, 150, 'silver'),
  // challenges
  A('sbc-1', 'sbc', 'Problem Solver', 'Complete a Squad-Building Challenge.', 1, c('sbcDone'), 500, 80),
  A('sbc-5', 'sbc', 'Puzzle Master', 'Complete 5 challenges.', 5, c('sbcDone'), 2500, 150, 'silver'),
  A('sbc-legend', 'sbc', 'Legend Earned', 'Earn an SBC legend card.', 1, c('sbcLegends'), 3000, 200, 'gold'),
  // career
  A('career-start', 'career', 'The Dugout', 'Start a career.', 1, c('careers'), 500, 80),
  A('career-wins-5', 'career', 'Settling In', 'Win 5 career matches.', 5, c('careerWins'), 1500, 120),
  A('career-sign', 'career', 'Deal Done', 'Sign a player in Career Mode.', 1, c('careerSigns'), 1000, 100),
  A('career-season', 'career', 'Full Season', 'Finish a career season.', 1, c('careerSeasons'), 5000, 300, 'gold'),
  // online
  A('online-1', 'online', 'Connected', 'Play an online match.', 1, c('onlineMatches'), 500, 80),
  A('online-win', 'online', 'Beat a Human', 'Win an online match.', 1, c('onlineWins'), 1000, 100),
  A('online-10', 'online', 'Rival', 'Win 10 online matches.', 10, c('onlineWins'), 4000, 200, 'silver'),
  // weekend league
  A('wl-play', 'weekend', 'Weekender', 'Play a Weekend League match.', 1, c('wlPlayed'), 500, 80),
  A('wl-gold', 'weekend', 'Gold Weekend', 'Finish a weekend with 5 wins.', 5, c('wlBest'), 3000, 200, 'silver'),
  A('wl-apex', 'weekend', 'Apex Weekend', 'Finish a weekend with 9 wins.', 9, c('wlBest'), 10000, 400, 'gold'),
  // seasons & events
  A('tier-10', 'season', 'Tier Ten', 'Reach tier 10 of a Season Pass.', 10, (s) => Math.max(s.club.stats?.bestTier | 0, Math.floor((s.club.season?.xp | 0) / 250)), 1000, 100),
  A('tier-30', 'season', 'Season Complete', 'Reach tier 30 of a Season Pass.', 30, (s) => Math.max(s.club.stats?.bestTier | 0, Math.floor((s.club.season?.xp | 0) / 250)), 8000, 400, 'gold'),
  A('event-obj', 'season', 'Event Regular', 'Complete 3 event objectives.', 3, c('eventObjectives'), 1500, 120),
  A('featured', 'season', 'Limited Edition', 'Pull a featured event card.', 1, c('featured'), 4000, 250, 'gold'),
  A('daily-7', 'season', 'One Week Straight', 'Log in 7 days in a row.', 7, (s) => s.club.daily?.best | 0, 1000, 100),
  A('daily-30', 'season', 'Habit', 'Log in 30 days in a row.', 30, (s) => s.club.daily?.best | 0, 8000, 400, 'gold'),
  // watch
  A('watch-pack', 'watch', 'Wrist Rip', 'Open a pack on the watch.', 1, (s) => s.club.watchStats?.packs | 0, 500, 80),
  A('watch-win', 'watch', 'Pocket Football', 'Win a match on the watch.', 1, (s) => s.club.watchStats?.wins | 0, 800, 100),
  // club
  A('evolve-1', 'club', 'Evolved', 'Evolve a card.', 1, c('evolves'), 500, 80),
  A('evolve-max', 'club', 'Maxed Out', 'Take a card to its final level.', 1, c('maxed'), 3000, 200, 'silver'),
  A('chem-100', 'club', 'Perfect Chemistry', 'Field an XI at 100 chemistry.', 1, c('perfectChem'), 2000, 150, 'silver'),
];

/** Every achievement with where the save stands on it. `world` is playersById. */
export function evaluateAll(state, world) {
  const s = { ...state, world };
  const done = state.club.achievements || {};
  return ACHIEVEMENTS.map((a) => {
    const have = Math.min(a.need, a.get(s) || 0);
    return { ...a, have, complete: have >= a.need, unlockedAt: done[a.id]?.at || null, claimed: !!done[a.id]?.claimed };
  });
}
