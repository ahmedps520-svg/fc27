/**
 * The broadcast's second voice and its context (v83).
 *
 * `data/commentary.js` is the play-by-play: what just happened, said fast.
 * This file is everything around it:
 *
 *   - `CO`       the co-commentator — the former player in the gantry who
 *                says why it happened, a beat after the play-by-play
 *   - `CONTEXT`  lines that only make sense because of what the match is:
 *                a derby, a final, the weather, a hat-trick, a comeback,
 *                a player in or out of form, a scoreline for the records
 *   - `AR`       all three banks again in Arabic — play-by-play, colour and
 *                context — written for the Arabic commentary, not translated
 *                line by line (the rhythm of an Arabic call is its own)
 *
 * Placeholders are the ones the play screen already fills: {player} {team}
 * {opp} {minute} {score} {keeper} {dist} {venue} {poss}, plus {goals} (the
 * player's goals today), {derby} (the fixture's name) and {weather}.
 *
 * Nothing here names a real broadcaster, commentator, competition or person.
 */

export const CO = {
  kickoff: [
    'I fancy {team} today, but it will be tight.', 'Both managers will want a quick start here.',
    'Look for the first twenty minutes — whoever wins the midfield wins this.', 'Big occasion. Nerves will settle once someone gets a touch.',
    'I think the shape of {opp} will tell us a lot early on.', 'A lot riding on this one, and you can feel it in the ground.',
  ],
  goal: [
    'Look at the movement before it — that is where the goal comes from.', 'Clinical. He did not need a second look.',
    'The defending will be looked at, but take nothing away from the finish.', 'That is a striker\'s goal. Pure instinct.',
    'You cannot give a player like that a yard. Not one.', 'Brilliant from start to finish, that.',
    'The keeper had no chance. Right in the corner.', 'I said they needed a moment of quality — there it is.',
    'Watch the run, not the finish: he was already gone.', 'Composure. That is the word.',
    'What a time to score.', 'They have been threatening that for a while.', 'Simple, but so well worked.',
    'Somebody switched off at the back, and you get punished at this level.', 'You will see that one again tonight.',
  ],
  ownGoal: [
    'Cruel. He was only trying to get something on it.', 'Nothing he can do — it comes at him at pace.',
    'Unlucky, but that is what happens when you put the ball in that area.', 'He will not want to see that again.',
  ],
  save: [
    'Top-class goalkeeping. Strong wrists.', 'Stayed big, stayed on his feet — textbook.', 'That is why you pay for a good keeper.',
    'He read it early. Positioning does half the work.', 'Brave, too. He does not care who is coming in.',
    'A save like that is worth a goal.', 'Great hands. Nothing spilled.', 'He was down so quickly for a big man.',
  ],
  post: [
    'Inches. That is all it is at this level.', 'The woodwork saves them. They are riding their luck.',
    'He could not have hit it much better.', 'You felt the whole ground gasp.', 'On another day that goes in off the post.',
  ],
  shotWide: [
    'Snatched at it. Too much hurry.', 'Should at least hit the target from there.', 'Head up, it was on for the pass.',
    'Leaning back — that is why it flew.', 'Good idea, poor execution.', 'He will know he needed to do better.',
    'Nothing wrong with having a go, though.', 'A bit ambitious, that.',
  ],
  bigChance: [
    'That is the kind of chance you have to take.', 'Oh, he will be having nightmares about that one.',
    'The best chance of the match, and it has gone.', 'I thought that was in.', 'Great build-up deserved better than that.',
  ],
  foul: [
    'Clumsy. He was never getting the ball.', 'Late, and he knows it.', 'Cynical, but it stops the break.',
    'Soft one, I thought.', 'He has left a bit on him there.', 'Smart foul, if there is such a thing.',
    'You cannot dive in like that in your own half.', 'Frustration creeping in.',
  ],
  advantage: [
    'Good awareness from the referee.', 'That is how you referee a game.', 'He can always come back for it.',
  ],
  card: [
    'He has to be careful now for the rest of the match.', 'No complaints. That was reckless.',
    'The referee had no choice.', 'That changes how he can defend.', 'A booking that could cost them later.',
    'Needless. Completely needless.', 'You could see that coming.',
  ],
  red: [
    'That changes the whole game.', 'They will have to dig in now with ten men.', 'He has let his team-mates down there.',
    'You simply cannot make that challenge.', 'The referee had no option.',
  ],
  injury: [
    'That does not look good. He landed awkwardly.', 'You never like to see that.', 'Hopefully it is only a knock.',
  ],
  sub: [
    'Fresh legs could make all the difference.', 'Interesting change, that.', 'The manager has seen something he does not like.',
    'He will want to make an impact straight away.', 'A like-for-like change.', 'That is an attacking change — they are going for it.',
  ],
  offside: [
    'Mistimed the run. Half a yard.', 'The line held well there.', 'He was just too eager.', 'Good call. Right on the line.',
    'The defence stepped up perfectly.',
  ],
  skill: [
    'Oh, lovely feet!', 'That is showboating — but it works.', 'He is enjoying himself now.', 'Nutmeg! The crowd loved that.',
    'You cannot coach that.', 'Sheer confidence.',
  ],
  counter: [
    'This is dangerous — numbers going forward.', 'They are exposed at the back here.', 'Speed kills on the break.',
    'Three against two. Pick the right pass.',
  ],
  header: [
    'Great leap. He hangs in the air.', 'Timed that jump perfectly.', 'Good contact, but he could not steer it.',
  ],
  volley: ['Technique! Hard to keep that down.', 'Sweet strike, that. Right off the laces.', 'Brave to even try it.'],
  bicycle: ['Audacious! You do not see that every week.', 'The acrobatics! Take a bow even for trying.'],
  cross: ['Needs someone attacking the near post.', 'Dangerous ball, that. Nobody gambled.', 'Whipped in with pace.'],
  freekick: ['From there? He will fancy it.', 'The wall has to jump together.', 'Great position for a left-footer.'],
  cornerKick: ['Set pieces could decide this.', 'Look at the big men going up.', 'They have looked dangerous from corners.'],
  penaltyAwarded: [
    'He has given him the chance to go down.', 'Stonewall penalty. No doubt about it.', 'Clumsy in the box — you cannot do that.',
    'The referee was right on top of it.',
  ],
  halftime: [
    'A lot for both managers to talk about in there.', 'I would like to see more tempo in the second half.',
    'The next goal is huge.', 'The shape has been good; the final ball has not.', 'Honestly, the scoreline is about fair.',
  ],
  fulltime: [
    'They deserved that. The better side on the day.', 'A fair result, I think.', 'They will be delighted with that.',
    'Plenty to work on, but a result is a result.', 'What a game to be at.', 'The manager got his tactics spot on.',
  ],
  comeback: ['Game on! They never gave up.', 'The belief is back.', 'Momentum has swung completely.'],
  lead: ['Now they can play on the counter.', 'That changes the whole match.', 'Now we see what the other side is made of.'],
  extend: ['That should be game over.', 'They are running riot here.', 'Ruthless. Absolutely ruthless.'],
  late: ['Legs are going now.', 'Game management time.', 'Every second counts from here.'],
  possession: ['Lots of the ball — they need to hurt them with it.', 'Keeping it is one thing; creating is another.'],
  momentum: ['You feel a goal coming.', 'The crowd are sucking the ball towards the goal.', 'They need to weather this storm.'],
  tactic: ['The manager has seen enough — a change of shape.', 'That is a clear message from the touchline.'],
};

export const CONTEXT = {
  derby: [
    'It is {derby} — form goes out of the window today.', 'Bragging rights at stake in {derby}.',
    'Nobody in this town will talk about anything else this week: it is {derby}.', 'There is no such thing as a friendly {derby}.',
    'The noise before kick-off tells you what {derby} means.', 'Families split down the middle for {derby}.',
  ],
  derbyGoal: [
    'In {derby}, of all matches!', 'That goal will be sung about for years in {derby}.', 'Half this city is bouncing.',
  ],
  final: [
    'One match. One trophy. Everything else is noise.', 'Finals are rarely pretty — but they are always memorable.',
    'The silverware is waiting in the tunnel.', 'All season has come down to this.', 'Nobody remembers the losing finalist.',
  ],
  finalWin: ['They are going to lift the trophy!', 'Champions! The celebrations can begin.', 'Silverware for {team}!'],
  weatherRain: [
    'The rain is teeming down — the ball will skid.', 'A wet surface — keepers beware.', 'Tough conditions, but the ball zips on this.',
    'The rain has not kept the crowd away.', 'Low shots in this weather. Make the keeper work.',
  ],
  weatherSnow: [
    'Snow falling at {venue} — a proper winter afternoon.', 'The orange ball would have been handy tonight.', 'Players with gloves and snoods — it is bitter out there.',
  ],
  weatherOvercast: ['Grey skies over {venue}.', 'A heavy, overcast afternoon.', 'No sun today, but a lively crowd.'],
  weatherClear: ['Perfect conditions for football.', 'A beautiful setting at {venue}.', 'The pitch looks immaculate.'],
  night: ['Under the lights at {venue} — there is nothing quite like it.', 'A night match always has a different feel.', 'The floodlights are blazing.'],
  weatherTurn: ['The weather has turned here.', 'Look at that — the conditions are changing.', 'Here comes the rain.'],
  brace: [
    'That is two for {player}!', 'A brace for {player}. What a day he is having.', '{player} doubles his tally!',
    'He is on fire — two goals now.',
  ],
  hatTrick: [
    'Hat-trick! {player} takes the match ball home!', 'Three for {player}! A hat-trick!', 'The hat-trick is complete for {player}!',
    'You will not see a better hat-trick this season.',
  ],
  opener: ['The first goal is always the hardest.', 'That opening goal changes everything.', 'The deadlock is broken.'],
  formHot: [
    '{player} has been in terrific form lately.', 'Everything {player} touches turns to gold at the moment.',
    '{player} is the man in form — watch him.', 'Confidence is flowing for {player}.',
  ],
  formCold: [
    '{player} needed that — it has been a tough run.', 'A difficult spell for {player}, this might turn it.',
    '{player} has not found his rhythm lately.',
  ],
  tenMen: ['{team} are down to ten — the whole plan changes.', 'Ten men now. They will have to dig in.', 'The red card could decide this.'],
  lateWinner: ['A late winner! Can you believe it?', 'At the death! Scenes!', 'They have snatched it at the very end!'],
  lateEqualiser: ['Level at the last!', 'They have rescued a point!', 'Just when it looked over!'],
  comebackWin: [
    'From behind to win it! What a turnaround.', 'The comeback is complete!', 'They were down, and they refused to stay down.',
  ],
  cleanSheet: ['A clean sheet as well. The defence was outstanding.', 'Nothing got past {keeper} today.', 'Solid at the back all match.'],
  bigWin: ['A statement victory.', 'That is a thrashing, pure and simple.', 'That scoreline will get attention.', 'They were a class above today.'],
  goalfest: ['What a game! Goals everywhere.', 'Defences on holiday, entertainers on the pitch.', 'The neutrals will have loved every minute.'],
  goallessHT: ['Goalless at the break, but not without incident.', 'No goals yet — someone needs to find a spark.'],
  upset: ['An upset! Nobody gave them a chance.', 'The underdogs have done it!', 'That is why we love this game.'],
  topClash: ['Two of the best sides around, face to face.', 'A heavyweight contest.', 'Quality all over the pitch today.'],
  record: ['That is a record scoreline for the save books.', 'A new record — the biggest win of the season!', 'One for the history books.'],
  milestone: [
    '{player} — that is goal number {goals} in this match.', 'Another for {player}, his {goals}th today.',
  ],
  stoppage: [
    'The board is up — {dist} minutes added.', '{dist} minutes of stoppage time.', 'The fourth official shows {dist}.',
  ],
  review: [
    'They are checking this one.', 'The review is on. Hold your breath.', 'Let us see the lines.',
    'Very tight. Could go either way.',
  ],
  reviewStands: ['The decision stands.', 'Confirmed. The on-field call is right.', 'Checked and correct.'],
  potm: ['{player} is the player of the match.', 'Player of the match: {player}. Deserved.', 'The standout today: {player}.'],
};

/* ------------------------------ Arabic ------------------------------- *
 * The same keys, their own lines. Placeholder names are left in Latin so the
 * same formatter fills them; the names come from the match. */
export const AR = {
  pbp: {
    kickoff: [
      'وانطلقت المباراة!', '{team} يبدأ اللعب.', 'صافرة البداية، على بركة الله.', 'الكرة تدور الآن في {venue}.',
      'بداية المباراة، ونتمنى لكم متعة كروية.', 'انطلق اللقاء بين {team} و{opp}.',
    ],
    secondHalf: ['انطلق الشوط الثاني والنتيجة {score}.', 'عودة الفريقين للشوط الثاني.', 'الشوط الثاني بدأ، وكل شيء ممكن.'],
    shot: [
      '{player} يسدد!', 'تسديدة من {player}!', '{player} يحاول من بعيد!', 'يسدد {player}… ', 'محاولة من {player}!',
      '{player} يطلق قذيفة من {dist} متراً!', 'تسديدة مباشرة من {player}!', '{player} يجرب حظه!',
    ],
    shotWide: [
      'خارج المرمى.', 'بعيدة عن القائم.', 'فوق العارضة!', 'تسديدة {player} تمر بجانب المرمى.', 'لم تكن دقيقة يا {player}.',
      'ضاعت الفرصة.', 'مرت الكرة بعيداً.',
    ],
    save: [
      'تصدي رائع من {keeper}!', '{keeper} يمسك الكرة بثبات.', 'يا لها من تصدٍ! {keeper}!', 'الحارس {keeper} في الموعد!',
      'أنقذها {keeper} ببراعة!', '{keeper} يبعد الخطر.', 'يد أمينة من {keeper}.', 'تصدٍ مزدوج من {keeper}!',
    ],
    post: ['القائم! القائم يرد الكرة!', 'العارضة تحرم {team} من هدف!', 'في الخشبات! يا للحظ!', 'ارتطمت بالقائم!'],
    goal: [
      'هدف! هدف! {player} يسجل!', 'جووول! {player} يهز الشباك!', 'هدف رائع من {player}! {score}!', 'في الشباك! {player}!',
      'يا سلاااام! {player} يسجل لـ{team}!', 'هدف! الكرة تعانق الشباك! {player}!', '{player} لا يرحم! هدف!',
      'هدف لـ{team}! النتيجة {score}!', 'ما أجمله من هدف! {player}!', 'يسجل {player} في الدقيقة {minute}!',
      'هدف! لا يصدق! {player}!', 'الجماهير تنفجر! هدف {player}!',
    ],
    ownGoal: ['هدف عكسي! يا للحظ السيئ!', 'في مرماه! هدف عكسي!', 'الكرة ترتد إلى الشباك… هدف عكسي!'],
    cross: ['عرضية داخل منطقة الجزاء!', 'كرة عرضية خطيرة!', 'عرضية من الجهة.', 'يرسلها عرضية!'],
    header: ['رأسية!', 'ضربة رأس!', 'يرتقي ويضرب برأسه!', 'رأسية قوية!'],
    bigChance: ['فرصة محققة!', 'يا لها من فرصة!', 'كيف ضاعت هذه؟!', 'انفراد تام!', 'فرصة ذهبية لـ{team}!'],
    cornerKick: ['ركنية لـ{team}.', 'ضربة ركنية.', '{team} يحصل على ركنية.', 'ركنية أخرى.'],
    freekick: ['ضربة حرة لـ{team}.', 'خطأ، وضربة حرة على بعد {dist} متراً.', 'ضربة حرة في مكان خطير!'],
    penaltyAwarded: ['ضربة جزاء! ضربة جزاء!', 'الحكم يشير إلى نقطة الجزاء!', 'بلنتي لـ{team}!'],
    throwin: ['رمية تماس لـ{team}.', 'رمية جانبية.'],
    foul: ['خطأ.', 'مخالفة على {player}.', 'الحكم يصفر خطأ.', 'تدخل قوي من {player}.', 'عرقلة.'],
    advantage: ['الحكم يشير بمواصلة اللعب!', 'أفضلية لـ{team}.', 'الحكم يطبق قانون الأفضلية.'],
    card: ['بطاقة صفراء لـ{player}.', 'إنذار لـ{player}.', 'الحكم يخرج البطاقة!', '{player} ينال البطاقة.'],
    red: ['بطاقة حمراء! طرد {player}!', 'الحكم يطرد {player}!', '{team} بعشرة لاعبين الآن.', 'حمراء مباشرة لـ{player}!'],
    injury: ['{player} على الأرض.', 'إصابة لـ{player}، نتمنى أن تكون بسيطة.', 'الجهاز الطبي يدخل الملعب.'],
    sub: ['تبديل في صفوف {team}.', 'تغيير لـ{team}.', 'دماء جديدة في {team}.'],
    offside: ['تسلل.', 'الراية ترتفع: تسلل.', '{player} في موقف تسلل.', 'مصيدة تسلل ناجحة.'],
    volley: ['تسديدة على الطاير!', 'فولي من {player}!', 'من الهواء مباشرة!'],
    bicycle: ['مقصية! مقصية!', 'ضربة خلفية مزدوجة! يا للجرأة!'],
    knuckle: ['كرة متراقصة!', 'الكرة تتمايل في الهواء!'],
    heavyTouch: ['لمسة ثقيلة.', 'فقد السيطرة على الكرة.'],
    tactic: ['{team} يغير أسلوبه إلى {tactic}.', 'تعديل تكتيكي من {team}.'],
    adapt: ['{team} يتأقلم مع مجريات اللعب.', 'تغيير في شكل {team}.'],
    counter: ['هجمة مرتدة!', 'مرتدة سريعة لـ{team}!', '{team} ينطلق في الهجمة المرتدة!'],
    skill: ['مهارة رائعة من {player}!', 'يراوغ {player}!', 'يا للمهارة!', '{player} يستعرض!'],
    lob: ['ساقطة!', 'كرة ساقطة فوق الحارس!', 'يحاول بالساقطة!'],
    halftime: ['نهاية الشوط الأول، والنتيجة {score}.', 'الحكم يعلن نهاية الشوط الأول.', 'استراحة بين الشوطين، {score}.'],
    fulltime: ['نهاية المباراة! {score}.', 'انتهى اللقاء، والنتيجة {score}.', 'صافرة النهاية! {team} يفوز!', 'انتهت المباراة.'],
    clock: ['الدقيقة {minute}، والنتيجة {score}.', 'مرت {minute} دقيقة.'],
    possession: ['{team} يستحوذ على الكرة بنسبة {poss}٪.', 'سيطرة واضحة لـ{team}.'],
    momentum: ['{team} يضغط بقوة.', 'الأفضلية الآن لـ{team}.', 'موجة هجومية من {team}.'],
    weather: ['أجواء مثالية لكرة القدم.', 'الأضواء مشتعلة والأرضية سريعة.'],
    penaltyScored: ['يسجلها {player} بثقة!', 'ضربة الجزاء في الشباك!', 'يخدع الحارس ويسجل!'],
    penaltyMissed: ['يتصدى {keeper} لضربة الجزاء!', 'أهدرها! ضربة جزاء ضائعة!', 'في القائم من نقطة الجزاء!'],
    keeperClaim: ['يمسكها {keeper}.', 'الحارس يخرج ويلتقط الكرة.'],
    late: ['الوقت ينفد أمام {opp}.', 'الدقائق الأخيرة، {score}.', 'نقترب من النهاية.'],
    comeback: ['التعادل! {score}!', 'عاد {team} إلى المباراة!', 'العودة بدأت!'],
    lead: ['{team} يتقدم، {score}.', 'التقدم لـ{team}!'],
    extend: ['{team} يعزز تقدمه، {score}.', 'الفارق يتسع!'],
    tackle: ['افتكاك نظيف.', 'قطع الكرة ببراعة.'],
  },
  co: {
    kickoff: ['المباراة صعبة على الطرفين.', 'من يسيطر على الوسط يحسم اللقاء.', 'البداية القوية مهمة جداً اليوم.'],
    goal: [
      'انظر إلى التحرك قبل التسديد، هنا صُنع الهدف.', 'لمسة مهاجم حقيقي.', 'لا يمكن ترك مساحة لمثل هذا اللاعب.',
      'إنهاء مثالي في الزاوية.', 'هدوء أعصاب رائع.', 'جملة تكتيكية جميلة من البداية للنهاية.',
      'الدفاع سيراجع هذه اللقطة كثيراً.', 'هدف في توقيت مثالي.', 'كان يلوح في الأفق منذ فترة.', 'سترون هذا الهدف مرات عديدة الليلة.',
    ],
    ownGoal: ['حظ عاثر، كان يحاول الإبعاد فقط.', 'لا ذنب له، الكرة جاءت بسرعة.'],
    save: ['حراسة من الطراز الرفيع.', 'قرأ الكرة مبكراً.', 'تصدٍ بقيمة هدف.', 'تمركز ممتاز من الحارس.', 'ردة فعل سريعة جداً.'],
    post: ['سنتيمترات فقط!', 'الخشبات تنقذهم.', 'لم يكن بإمكانه أن يسددها أفضل.'],
    shotWide: ['استعجل التسديد.', 'كان عليه أن يصيب المرمى على الأقل.', 'فكرة جيدة وتنفيذ ضعيف.', 'الزميل كان في وضع أفضل.'],
    bigChance: ['هذه الفرص لا تُهدر.', 'أفضل فرصة في المباراة ضاعت.', 'ظننتها هدفاً!'],
    foul: ['تدخل متأخر.', 'خطأ تكتيكي لإيقاف الهجمة.', 'تدخل متهور.', 'الإحباط بدأ يظهر.'],
    card: ['عليه الحذر الآن.', 'قرار صحيح من الحكم.', 'بطاقة قد تكلفهم لاحقاً.', 'لا داعي لهذا التدخل.'],
    red: ['هذا يغير كل شيء.', 'خذل زملاءه.', 'لم يترك للحكم خياراً.'],
    injury: ['لا نحب رؤية ذلك.', 'نتمنى له السلامة.'],
    sub: ['الأقدام الجديدة قد تصنع الفارق.', 'تغيير هجومي واضح.', 'المدرب رأى ما لا يعجبه.'],
    offside: ['تسرع في الانطلاق.', 'خط الدفاع تقدم في الوقت المناسب.'],
    skill: ['مهارة لا تُدرّس!', 'ثقة عالية بالنفس.', 'الجماهير استمتعت بهذه.'],
    counter: ['خطر داهم! أعداد كبيرة في الهجوم.', 'السرعة تقتل في المرتدات.'],
    penaltyAwarded: ['قرار صحيح بلا شك.', 'تدخل ساذج داخل المنطقة.'],
    halftime: ['الكثير للحديث عنه في غرفة الملابس.', 'الهدف القادم سيكون حاسماً.', 'النتيجة عادلة حتى الآن.'],
    fulltime: ['فوز مستحق.', 'نتيجة عادلة في رأيي.', 'المدرب نجح في قراءة المباراة.', 'يا لها من مباراة!'],
    comeback: ['الإيمان عاد!', 'الزخم انقلب تماماً.'],
    lead: ['الآن يمكنهم اللعب على المرتدات.', 'هذا الهدف يغير كل شيء.'],
    extend: ['انتهت المباراة تقريباً.', 'فريق لا يرحم!'],
    late: ['اللياقة بدأت تنفد.', 'وقت إدارة المباراة.'],
    momentum: ['أشعر أن هدفاً قادماً.', 'عليهم الصمود في هذه العاصفة.'],
    header: ['ارتقاء رائع.', 'توقيت مثالي للقفز.'],
    cross: ['تحتاج من يهاجم القائم القريب.', 'عرضية خطيرة لم يستغلها أحد.'],
  },
  context: {
    derby: ['إنها {derby}، والتاريخ لا يعترف بالمستوى.', 'في {derby} لا توجد مباراة سهلة.', 'المدينة كلها تنتظر نتيجة {derby}.', 'الأجواء مشتعلة في {derby}.'],
    derbyGoal: ['في {derby}، وما أدراك!', 'هدف سيُحكى عنه طويلاً في {derby}.'],
    final: ['مباراة واحدة، وكأس واحدة.', 'النهائيات لا تُلعب، بل تُكسب.', 'الموسم كله يُختصر في هذه الليلة.'],
    finalWin: ['الكأس لـ{team}!', 'أبطال! تبدأ الاحتفالات!'],
    weatherRain: ['المطر ينهمر، والكرة ستنزلق بسرعة.', 'أرضية مبتلة، حذارِ يا حراس المرمى.', 'الأمطار لم تمنع الجماهير من الحضور.'],
    weatherSnow: ['الثلوج تتساقط في {venue}.', 'أجواء شتوية باردة جداً.'],
    weatherOvercast: ['سماء غائمة فوق {venue}.', 'أجواء غائمة، والحماس حاضر.'],
    weatherClear: ['أجواء مثالية لكرة القدم.', 'مشهد جميل في {venue}.'],
    night: ['تحت الأضواء الكاشفة في {venue}.', 'لمباريات الليل طعم خاص.'],
    weatherTurn: ['الطقس يتغير الآن.', 'ها هو المطر يبدأ.'],
    brace: ['الهدف الثاني لـ{player}!', 'ثنائية لـ{player}! يوم رائع!'],
    hatTrick: ['هاتريك! {player} يأخذ الكرة معه إلى البيت!', 'ثلاثية لـ{player}!'],
    opener: ['الهدف الأول دائماً الأصعب.', 'افتتاح التسجيل يغير كل شيء.'],
    formHot: ['{player} في قمة مستواه مؤخراً.', 'كل ما يلمسه {player} يتحول ذهباً.'],
    formCold: ['{player} كان بحاجة لهذا.', 'فترة صعبة لـ{player}، ربما تتغير الآن.'],
    tenMen: ['{team} بعشرة لاعبين الآن.', 'البطاقة الحمراء قد تحسم اللقاء.'],
    lateWinner: ['هدف الفوز في الوقت القاتل!', 'في اللحظات الأخيرة! لا يصدق!'],
    lateEqualiser: ['التعادل في الرمق الأخير!', 'أنقذوا نقطة ثمينة!'],
    comebackWin: ['من التأخر إلى الفوز! يا لها من عودة!', 'اكتملت العودة!'],
    cleanSheet: ['وشباك نظيفة أيضاً.', 'لم يمر شيء من {keeper} اليوم.'],
    bigWin: ['فوز كاسح.', 'رسالة قوية للجميع.'],
    goalfest: ['مهرجان أهداف!', 'مباراة ممتعة للمحايدين.'],
    goallessHT: ['التعادل السلبي في الاستراحة.', 'لا أهداف حتى الآن.'],
    upset: ['مفاجأة! لم يتوقعها أحد.', 'الفريق الأضعف يفعلها!'],
    topClash: ['قمة بين اثنين من الكبار.', 'مواجهة من العيار الثقيل.'],
    record: ['نتيجة قياسية!', 'رقم قياسي جديد!'],
    milestone: ['{player} يسجل هدفه رقم {goals} اليوم.'],
    stoppage: ['الوقت بدل الضائع: {dist} دقائق.', 'الحكم الرابع يرفع اللوحة: {dist}.'],
    review: ['مراجعة الحالة.', 'الحكم يراجع اللقطة.', 'حالة دقيقة جداً.'],
    reviewStands: ['القرار صحيح.', 'تأكيد القرار.'],
    potm: ['رجل المباراة: {player}.', '{player} نجم اللقاء.'],
  },
};

const count = (bank) => Object.values(bank).reduce((n, a) => n + a.length, 0);
export const VOICE_LINE_COUNT = {
  co: count(CO), context: count(CONTEXT),
  ar: count(AR.pbp) + count(AR.co) + count(AR.context),
};
