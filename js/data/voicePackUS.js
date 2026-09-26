/**
 * The first recorded commentary pack (v121): an American broadcast pair.
 *
 * Why its own lines: most of the written commentary names someone ("{player}
 * has a go!"), and a recording cannot say a name it was never given. So a
 * pack carries a name-free bank for every event the desk calls, and the
 * subtitle shows exactly what is heard. Keys match data/commentary.js (pbp),
 * and data/commentaryVoices.js (co, context); a key a pack leaves out simply
 * goes unspoken while the pack is on.
 *
 * The audio is generated, not recorded from anyone: Kokoro-82M (Apache-2.0),
 * voices am_michael (the caller) and af_heart (the analyst), rendered by
 * tools/voice-pack.mjs into assets/voice/us/<speaker>-<key>-<n>.mp3. Change a
 * line here and re-run the tool; the file names follow the index, so the
 * order is the contract.
 */
export const PACK_US = {
  id: 'us',
  name: 'American',
  speakers: { pbp: 'Mike', co: 'Harper' },
  voices: { pbp: 'am_michael', co: 'af_heart' },
  pbp: {
    kickoff: ['And we are underway!', 'Here we go! The ball is rolling.', 'The whistle goes, and we are live.', 'Kick-off! Let\'s play some football.'],
    secondHalf: ['We\'re back for the second half!', 'Second half, here we go.', 'The teams are back out. Forty-five to play.', 'Restart! Everything still to play for.'],
    shot: ['He lets it fly!', 'Shot!', 'Here\'s the strike!', 'Takes aim... fires!', 'He goes for goal!'],
    shotWide: ['Wide! Just wide!', 'Off target.', 'Oh, dragged it wide.', 'That one sails over.', 'Not troubling the keeper there.'],
    save: ['Saved! Great stop!', 'What a save!', 'The keeper says no!', 'Denied! Terrific goalkeeping!', 'Parried away!'],
    post: ['Off the post!', 'Woodwork! So close!', 'It rattles the crossbar!', 'Hits the frame of the goal!'],
    goal: ['GOAL! What a finish!', 'It\'s in! GOAL!', 'GOAL! Oh, you beauty!', 'They score! What a moment!', 'GOAL! Right into the back of the net!', 'He buries it! GOAL!', 'GOAL! Unstoppable!', 'And it\'s in! The crowd goes wild!'],
    ownGoal: ['Oh no! Into his own net!', 'Own goal! That\'s a disaster!', 'It goes in off the defender! Own goal!'],
    cross: ['Swung in!', 'Here comes the cross.', 'Delivered into the box!', 'Ball into the danger zone.'],
    header: ['Header!', 'He rises and heads it!', 'Gets his head on it!'],
    bigChance: ['Big chance here!', 'This is a great opportunity!', 'He\'s through!', 'Clear sight of goal!'],
    cornerKick: ['Corner kick.', 'That\'s a corner.', 'Out for a corner.', 'Corner. Bodies in the box.'],
    freekick: ['Free kick.', 'Free kick in a good area.', 'The referee gives a free kick.', 'Set piece opportunity here.'],
    penaltyAwarded: ['Penalty! The referee points to the spot!', 'It\'s a penalty!', 'Spot kick! Huge moment!'],
    throwin: ['Throw-in.', 'Out for a throw.', 'Throw-in down the line.'],
    foul: ['Foul.', 'The whistle goes. That\'s a foul.', 'He\'s brought down.', 'Late challenge, free kick.'],
    advantage: ['Advantage! Play on!', 'The referee lets it run!', 'Good advantage, keep going!'],
    card: ['Yellow card!', 'He goes into the book.', 'That\'s a booking.', 'Out comes the yellow.'],
    injury: ['A player is down.', 'He\'s hurt, and they need the trainer.', 'Stoppage for an injury.'],
    sub: ['A substitution.', 'Change coming on.', 'Fresh legs on the field.'],
    offside: ['Flag is up, offside.', 'Offside!', 'He\'s strayed offside.', 'Linesman says offside.'],
    volley: ['On the volley!', 'Hits it first time!', 'Sweet volley!'],
    bicycle: ['Bicycle kick!', 'An overhead kick! Are you kidding me?', 'Acrobatic! Over the head!'],
    knuckle: ['That one moved in the air!', 'Look at the dip on that!', 'Wobbling, dipping!'],
    heavyTouch: ['Heavy touch.', 'Lets it get away from him.', 'Poor first touch.'],
    tactic: ['A change of shape here.', 'New tactics from the bench.', 'They\'re switching things up.'],
    adapt: ['They\'ve changed the setup.', 'A tactical switch.', 'Different shape now.'],
    counter: ['They break!', 'Counterattack!', 'Here comes the break, and they\'re flying!', 'Numbers going forward!'],
    skill: ['Ooh, lovely skill!', 'What a move!', 'Nutmeg! Beautiful!', 'Look at those feet!'],
    lob: ['He tries the chip!', 'Lofted over the top!', 'The lob!'],
    tackle: ['Great tackle!', 'Won it cleanly.', 'Big challenge, and he gets the ball.', 'Stripped him of it!'],
    halftime: ['That\'s halftime.', 'The whistle blows for halftime.', 'Halftime here.', 'Into the locker rooms they go.'],
    fulltime: ['That\'s full time!', 'It\'s all over!', 'Final whistle!', 'And the referee ends it!'],
    possession: ['They\'re dominating the ball.', 'Plenty of possession here.', 'Keeping it nicely.'],
    momentum: ['They\'re pushing now.', 'Momentum is shifting.', 'The pressure is building.', 'Wave after wave.'],
    weather: ['Great conditions for football.', 'What an atmosphere.'],
    penaltyScored: ['Scores the penalty! Ice cold!', 'Right in the corner! Converted!', 'No mistake from the spot!'],
    penaltyMissed: ['Saved! The keeper guesses right!', 'Missed! Off target!', 'He\'s missed it!'],
    keeperClaim: ['Keeper claims it.', 'Safe hands.', 'Gathered by the goalkeeper.'],
    late: ['Time is running out.', 'We\'re into the final minutes.', 'The clock is ticking.'],
    comeback: ['They\'re level!', 'All square!', 'The equalizer!'],
    lead: ['They take the lead!', 'They\'re in front!', 'Now they lead!'],
    extend: ['They extend the lead!', 'Another one!', 'That doubles the cushion!'],
  },
  co: {
    kickoff: ['This should be a good one. Both teams came to play.', 'I\'m expecting a tight game today.', 'Let\'s see who blinks first.'],
    goal: ['Look at the movement before that. Textbook.', 'The keeper had no chance. None.', 'Clinical. That\'s what you want from your attackers.', 'That\'s a finish you\'ll see on the highlights all week.', 'You cannot defend that. Perfection.'],
    ownGoal: ['Cruel. He was only trying to clear it.', 'Nothing you can do about that one. Just unlucky.', 'He\'ll want to forget that one fast.'],
    save: ['Top-class goalkeeping.', 'Strong wrists. He had to be.', 'That\'s why he\'s the number one.', 'Reaction save. Incredible reflexes.'],
    post: ['Inches. That\'s all it is at this level.', 'So unlucky. Another day, that goes in.', 'The goalkeeper was beaten, too.'],
    shotWide: ['Snatched at it. Too much hurry.', 'He had more time than he thought.', 'He\'ll be disappointed with that one.'],
    bigChance: ['That\'s the kind of chance you have to take.', 'You don\'t get many of those.', 'He should score there.'],
    foul: ['Clumsy. He was never getting the ball.', 'That\'s a clear foul.', 'Mistimed it completely.'],
    advantage: ['Good awareness from the referee.', 'Smart refereeing. Let the game breathe.'],
    card: ['He has to be careful now.', 'He can\'t afford another one of those.', 'Deserved. That was reckless.'],
    injury: ['That doesn\'t look good.', 'Hopefully it\'s nothing serious.', 'He landed awkwardly there.'],
    sub: ['Fresh legs could make the difference.', 'Interesting change from the coach.', 'This could change the game.'],
    offside: ['Mistimed the run. Half a yard.', 'Right call. He was clearly off.', 'He went a fraction too early.'],
    skill: ['Oh, lovely feet!', 'That\'s pure talent right there.', 'He made that defender look silly.'],
    counter: ['This is dangerous. Numbers going forward.', 'They\'re so quick on the break.', 'Watch the space open up.'],
    header: ['Great leap. He hangs in the air.', 'Perfect timing on the jump.'],
    volley: ['Technique! So hard to keep that down.', 'You have to strike it perfectly to do that.'],
    bicycle: ['Audacious! You don\'t see that every week.', 'The confidence to even try that!'],
    cross: ['Needs someone attacking the near post.', 'Good delivery. Somebody get on the end of it.'],
    freekick: ['From there? He\'ll fancy it.', 'Great spot for a free kick.'],
    cornerKick: ['Set pieces could decide this one.', 'Big bodies going up.'],
    penaltyAwarded: ['That\'s a clear penalty.', 'Soft, but he\'s given it.', 'Huge call from the referee.'],
    halftime: ['Plenty for both coaches to talk about at the break.', 'A lot to work on in there.', 'That was an entertaining half.'],
    fulltime: ['They deserved that. The better side today.', 'What a game that was.', 'A fair result, I think.'],
    comeback: ['Game on! They never gave up.', 'The fight in this team!'],
    lead: ['Now they can play on the counter.', 'That changes everything.'],
    extend: ['That should be game over.', 'That feels like the knockout blow.'],
    late: ['Legs are going now.', 'This is where fitness matters.'],
    possession: ['Lots of the ball. They need to hurt them with it.', 'They\'re controlling this game.'],
    momentum: ['You can feel a goal coming.', 'The crowd is right behind them now.'],
    tactic: ['The coach has seen enough. Change of shape.', 'Smart adjustment.'],
  },
  context: {
    derby: ['It\'s a derby. Throw the form book out the window.', 'Bragging rights on the line today.', 'The rivalry is real, and you can feel it in here.'],
    derbyGoal: ['In a derby, of all games!', 'That\'s one the fans will remember forever.'],
    final: ['One game. One trophy. Everything else is noise.', 'It all comes down to this.', 'Winner takes all.'],
    finalWin: ['They\'re going to lift the trophy!', 'Champions! What a moment!'],
    weatherRain: ['The rain is pouring down. The ball will skid.', 'Wet night, slick field.'],
    weatherSnow: ['Snow is falling. A real winter game.', 'The snow is coming down.'],
    weatherOvercast: ['Gray skies overhead today.', 'A cool, cloudy day for football.'],
    weatherClear: ['Perfect conditions for football.', 'Beautiful day for a game.'],
    night: ['Under the lights. There\'s nothing quite like it.', 'A night game, and the place is buzzing.'],
    weatherTurn: ['The weather has turned here.', 'Conditions are changing.'],
    brace: ['That\'s his second of the game!', 'Two for him today!'],
    hatTrick: ['Hat trick! He takes the match ball home!', 'Three goals! A hat trick!'],
    opener: ['The first goal is always the hardest.', 'That breaks the deadlock.'],
    formHot: ['Watch out for the in-form man today.', 'Some of these players are on fire lately.'],
    formCold: ['He needed that. It\'s been a tough run.', 'A big weight off his shoulders.'],
    tenMen: ['Down to ten men. The whole plan changes.', 'They\'re a man short now.'],
    lateWinner: ['A late winner! Can you believe it?', 'At the death! Unbelievable!'],
    lateEqualiser: ['Level at the last!', 'A late, late equalizer!'],
    comebackWin: ['From behind to win it! What a turnaround!', 'What a comeback!'],
    cleanSheet: ['A clean sheet, too. The defense was outstanding.', 'Nothing got past them today.'],
    bigWin: ['A statement victory.', 'That\'s a thrashing.'],
    goalfest: ['What a game! Goals everywhere!', 'You couldn\'t take your eyes off that.'],
    goallessHT: ['Goalless at the break, but plenty happening.', 'No goals yet, but it\'s been lively.'],
    upset: ['An upset! Nobody gave them a chance!', 'Shock result here!'],
    topClash: ['Two of the best teams around, face to face.', 'A heavyweight clash.'],
    record: ['That\'s a record scoreline!'],
    stoppage: ['The board is up. Added time.', 'Stoppage time to be played.'],
    review: ['They\'re checking this one.', 'Let\'s see what the review says.'],
    reviewStands: ['The decision stands.', 'Call confirmed.'],
    potm: ['What a performance from the player of the match.', 'Man of the match, no question.'],
  },
};

/** Every clip the pack needs, as { speaker, bank, key, i, text, file } — the renderer's and the tests' list. */
export function packClips(pack = PACK_US) {
  const out = [];
  for (const [bank, speakerOf] of [['pbp', () => 'pbp'], ['co', () => 'co'], ['context', null]]) {
    for (const [key, lines] of Object.entries(pack[bank])) {
      lines.forEach((text, i) => {
        // context lines are said by whichever voice the director picks: render both
        const speakers = speakerOf ? [speakerOf()] : ['pbp', 'co'];
        for (const speaker of speakers) out.push({ speaker, bank, key, i, text, file: `${speaker}-${bank === 'context' ? 'cx-' : ''}${key}-${i}.mp3` });
      });
    }
  }
  return out;
}

/** The recorded packs by id (Settings → Commentators). English only — there is no Arabic pack yet. */
export const VOICE_PACKS = { us: PACK_US };
