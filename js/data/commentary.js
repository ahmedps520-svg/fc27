/**
 * The commentary feed: what the voice in the gantry says.
 *
 * Two hundred and some lines, grouped by the moment they describe, each with
 * placeholders the match fills: {player} {team} {opp} {minute} {score} {keeper}
 * {dist}. `say(key, ctx)` picks a line at random, never the same one twice in
 * a row for that key, and formats it. Keys line up with the cues the
 * simulation raises (see sim.js `cue`) plus a few the play screen adds from
 * the clock and the stat sheet.
 */
const L = {
  kickoff: [
    'And we are under way.', '{team} get us started.', 'The referee blows and the ball is rolling.',
    'Here we go — {team} kick off.', 'First touch of the match. Let us see what we have got.',
    'The whistle goes. Ninety minutes of this, condensed.', 'Away we go at {venue}.',
  ],
  secondHalf: [
    'Second half. {score} the score, everything still to play for.', 'Back out for the second half.',
    'We go again. {team} restart it.', 'Second period under way, {score}.',
    'The sides swap ends and we restart, still {score}.',
  ],
  pass: [],   // too frequent to voice
  shot: [
    '{player} has a go!', 'Struck by {player}…', '{player} pulls the trigger!', 'Shot! {player}!',
    '{player} lets fly from {dist} metres.', 'Hit early by {player}.', '{player} shapes to shoot — and does.',
    'A sight of goal for {player}.', '{player} tries his luck.', 'Effort from {player}!',
  ],
  shotWide: [
    'Wide. {player} will want that one back.', 'Off target from {player}.', 'Dragged wide by {player}.',
    'Over the bar. {player} leans back and it climbs.', 'Not far away from {player}, but away it goes.',
    '{player} skews it wide of the far post.', 'It flashes across the face of goal and out.', 'Into the stand. {player} knew as he hit it.',
    'A yard wide. {player} holds his head.', 'High and wide from {player}.',
  ],
  save: [
    'Saved! {keeper} gets down well.', 'Good hands from {keeper}.', '{keeper} turns it away!',
    'Kept out by {keeper}.', 'What a stop from {keeper}!', '{keeper} palms it clear.', 'Strong save. {keeper} was equal to it.',
    '{keeper} stands tall and blocks it.', 'Tipped over by {keeper}!', '{keeper} gathers at the second attempt.',
    'The keeper reads it. {keeper} makes it look routine.', 'Fingertips from {keeper} — that was going in.',
  ],
  post: [
    'Off the post!', 'The woodwork! {team} so close.', 'Crossbar! It rattles the frame.', 'Against the upright and away.',
    'Inches. The post saves {opp}.', 'The bar shakes and {team} cannot believe it.',
  ],
  goal: [
    'GOAL! {player} for {team}!', '{player} scores! {score}!', 'It is in! {player} makes it {score}.',
    'GOAL {team}! {player} finishes it.', '{player}! What a finish! {score}.', 'That is a goal. {player}, {minute} minutes, {score}.',
    'In the net! {player} sends the {team} end wild.', '{player} buries it. {score}.', 'Composed by {player}. {team} lead.',
    'The keeper had no chance. {player}, {score}.', '{player}! {team} have their goal.', 'Clinical. {player} does not miss those.',
  ],
  ownGoal: ['Own goal! That is unfortunate. {score}.', 'It goes in off a defender. {score}.', 'A dreadful deflection and it is {score}.'],
  cross: [
    'Whipped in…', '{player} delivers.', 'A cross from the right.', 'Into the box from {player}.',
    'Floated towards the far post.', '{player} swings it in.', 'Driven low across the six-yard box.',
  ],
  header: ['A header!', 'Met with the head!', 'Up goes the header.', 'Powered towards goal with the head!'],
  bigChance: [
    'Big chance here!', 'This is a real opportunity for {team}.', '{player} is through!', 'One on one!',
    'He has to score here.', 'A gilt-edged chance for {player}.', 'Open goal, almost.', 'The keeper is exposed.',
  ],
  cornerKick: [
    'Corner to {team}.', '{team} win a corner.', 'A corner. Bodies into the box.', 'Set piece for {team} — a corner.',
    'The flag goes up for a corner.', '{team} will take this from the left.', 'Another corner for {team}.',
  ],
  freekick: [
    'Free kick to {team}, {dist} metres out.', 'Foul. {team} have a free kick.', 'A free kick in a dangerous area for {team}.',
    'The referee awards the free kick.', '{team} with a set piece {dist} metres from goal.', 'A wall is being built.',
    'The ball is placed. {team} to take.', 'This is shooting range.', 'Free kick. Cross or shot from here.',
  ],
  penaltyAwarded: [
    'PENALTY! The referee points to the spot.', 'Penalty to {team}!', 'He gives it. A penalty for {team}.',
    'Brought down in the box — penalty!', 'The referee has no doubt. Penalty.', 'Spot kick for {team}.',
  ],
  throwin: ['Throw-in, {team}.', 'Out for a throw.', '{team} throw.', 'A throw-in near the halfway line.', 'Long throw coming?'],
  foul: [
    'Foul by {player}.', 'That is a foul. {player} was late.', '{player} goes through the back of him.', 'A cynical one from {player}.',
    'The referee blows. {player} in the book?', 'Late, from {player}.', 'Free kick for that. {player} penalised.',
    'A clumsy challenge from {player}.', '{player} catches him. No arguments.',
  ],
  advantage: [
    'Advantage! The referee waves play on.', 'He plays the advantage — {team} keep going.', 'Arms out: advantage to {team}.',
    'Good refereeing. Play on.', 'The referee lets it run.',
  ],
  card: [
    'Yellow card for {player}. That was reckless.', '{player} is booked, and he cannot complain.',
    'Into the book goes {player}.', 'A caution for {player} — he has to be careful now.',
    'The referee reaches for his pocket. {player} is shown yellow.',
  ],
  injury: [
    '{player} is down, and he is not getting up quickly.', 'That looks like a problem for {player}.', 'The physio is on for {player}.',
    '{player} is struggling. He may not last.', 'A worry for {team} — {player} is hurt.', '{player} limps back into position.',
  ],
  sub: [
    'A change for {team}: {player} comes off.', 'Substitution. {player} makes way.', '{team} bring on fresh legs for {player}.',
    '{player} is replaced.', 'The board goes up: {player} off.',
  ],
  // v79
  offside: ['The flag is up. {player} was offside.', 'Offside — {player} went too early.', 'Flag. {player} strayed beyond the line.', 'Offside, and a let-off for the defence.'],
  volley: ['{player} meets it on the volley!', 'A volley from {player}!', 'He hits it first time — {player}!'],
  bicycle: ['An overhead kick from {player}!', '{player} tries the acrobatic one!', 'Bicycle kick! {player} goes for the spectacular.'],
  knuckle: ['That one moved in the air!', 'A knuckleball from {player} — the keeper has no idea where it is going.'],
  heavyTouch: ['Heavy touch from {player}.', '{player} lets it get away from him.', 'Poor first touch, and they pounce.'],
  tactic: ['A change of plan: {team} go to {tactic}.', '{team} switch to {tactic}.'],
  adapt: ['{team} have changed things — {tactic} now.', 'You can see {team} going for it now.', '{team} look to see this out.'],
  counter: [
    'And {team} break!', 'A counter-attack on!', '{team} are away — space to run into.', 'Turnover, and {team} go quickly.',
    'They have won it and they are off.', '{team} pour forward.', 'Numbers up for {team} on the break.',
  ],
  skill: ['Lovely feet from {player}.', 'A step-over and he is away.', 'Sold him! {player} dances past.', 'Quick feet by {player}.', '{player} shifts it and goes.'],
  lob: ['A chip over the top from {player}.', 'Lifted over the line by {player}.', 'Dinked forward.', '{player} floats one in behind.'],
  tackle: ['Won cleanly.', 'A good challenge.', 'Strong in the tackle.', 'Dispossessed.', 'He wins it back.'],
  halftime: [
    'Half time. {score}.', 'The whistle goes for the interval, {score}.', 'That is the first half done. {score}.',
    'Half time, and {team} will be the happier side.', 'Forty-five minutes gone: {score}.',
  ],
  fulltime: [
    'Full time! {score}.', 'That is it. It finishes {score}.', 'The final whistle. {score}.',
    'All over. {team} take it, {score}.', 'The referee ends it at {score}.', 'Done. {score} the final score.',
  ],
  clock: [
    '{minute} minutes played.', 'We are {minute} minutes in, {score}.', 'Coming up to {minute} minutes.', '{minute} gone. {score}.',
    'A quarter of the way in, {score}.', 'Ten to go. {score}.', 'Into the last five, {score}.', '{minute} minutes and {team} are on top.',
  ],
  possession: [
    '{team} are seeing a lot of the ball.', '{team} dominating possession.', 'Patient from {team} — keeping it.',
    '{team} have had {poss}% of the ball.', 'It is all {team} at the moment.', '{team} are passing it around nicely.',
  ],
  momentum: [
    '{team} have their tails up.', 'The pressure is building on {opp}.', '{team} are turning the screw.',
    'This is {team}\'s spell.', '{opp} cannot get out of their half.', 'Wave after wave from {team}.',
  ],
  weather: ['Perfect conditions for football.', 'The floodlights are on and the surface looks quick.', 'A good crowd in tonight.'],
  penaltyScored: ['Coolly taken. {player} scores from the spot.', 'Penalty converted by {player}.', '{player} sends the keeper the wrong way.'],
  penaltyMissed: ['Saved! {keeper} keeps the penalty out!', 'He has missed it! {player} puts the penalty wide.', 'Off the post from the spot!'],
  keeperClaim: ['Claimed by {keeper}.', '{keeper} comes and takes it.', 'Safe hands. {keeper} gathers.'],
  late: ['Time is running out for {opp}.', 'Into the closing stages, {score}.', '{team} looking to see this out.', 'Stoppage time approaches.'],
  comeback: ['{team} are level! {score}.', 'Back in it! {score}.', 'The comeback is on for {team}.'],
  lead: ['{team} edge ahead, {score}.', '{team} take the lead.', 'Advantage {team}: {score}.'],
  extend: ['{team} extend their lead, {score}.', 'Two clear now for {team}.', 'That should settle it. {score}.'],
};

export const COMMENTARY = L;
export const LINE_COUNT = Object.values(L).reduce((n, a) => n + a.length, 0);

const last = new Map();

/** Pick a line for `key` and fill it. Returns '' if the key has no lines. */
export function say(key, ctx = {}) {
  const pool = L[key];
  if (!pool || !pool.length) return '';
  let i = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && i === last.get(key)) i = (i + 1) % pool.length;
  last.set(key, i);
  return pool[i].replace(/\{(\w+)\}/g, (_, k) => (ctx[k] ?? ''));
}
