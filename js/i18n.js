/**
 * Two languages, one dictionary.
 *
 * `t(key)` returns the current language's string, falling back to English,
 * falling back to the key. Arabic switches the document to RTL; the layout
 * is built on flex and grid, so most of it mirrors on its own, and the
 * handful of places that do not are covered in main.css under `[dir=rtl]`.
 * Numbers stay Western digits everywhere, as football scores usually do in
 * the region's broadcasts.
 */
import { getState, update } from './state.js';

export const LANGS = { en: 'English', ar: 'العربية' };

const AR = {
  'menu.today': 'اليوم', 'menu.trophies': 'الجوائز', 'menu.career': 'المسيرة', 'menu.street': 'الشارع', 'menu.skills': 'المهارات', 'menu.settings': 'الإعدادات',
  'menu.ultimate': 'التشكيلة المثالية', 'menu.ultimate.blurb': 'ابنِ · ارتقِ · اكسب', 'menu.open': 'افتح ←',
  'menu.kickoff': 'انطلاق', 'menu.kickoff.blurb': 'مباشرة إلى المباراة', 'menu.play': 'العب ←',
  'menu.disclaimer': 'أسماء اللاعبين والمدربين وأندية المسيرة تعود لأشخاص وأندية حقيقيين وتُستخدم دون تأييد أو ارتباط؛ أندية التشكيلة المثالية وجميع المسابقات خيالية. الشعارات والصور مرسومة وليست تشابهاً.',
  'today.kicker': 'كل يوم', 'today.title': 'اليوم', 'today.daily': 'مكافأة اليوم', 'today.claim': 'استلم', 'today.world': 'العالم', 'today.tables': 'الجداول ←',
  'quick.kicker': 'الوضع 01', 'quick.title': 'انطلاق', 'quick.sub': 'اختر ناديين والعب. لا شيء يُحفظ ولا شيء على المحك.',
  'quick.home': 'الأرض', 'quick.away': 'الضيف', 'quick.mode': 'الوضع', 'quick.length': 'المدة', 'quick.cpu': 'الحاسوب', 'quick.time': 'موعد الانطلاق', 'quick.weather': 'الطقس',
  'quick.go': 'انطلاق', 'quick.world': 'جداول الدوري · العالم ←', 'quick.stadiums': 'استعراض الملاعب ←',
  'quick.1p': 'لاعب واحد', 'quick.1p.sub': 'أنت ضد الحاسوب', 'quick.2p': 'لاعبان', 'quick.2p.sub': 'وجهاً لوجه', 'quick.coop': 'تعاون', 'quick.coop.sub': 'نفس الفريق',
  'auto': 'تلقائي', 'day': 'نهار', 'dusk': 'غسق', 'night': 'ليل', 'clear': 'صافٍ', 'cloud': 'غائم', 'rain': 'مطر', 'snow': 'ثلج',
  'easy': 'سهل', 'pro': 'محترف', 'elite': 'نخبة',
  'world.kicker': 'ستون نادياً · ست درجات', 'world.title': 'العالم', 'world.cup': 'كأس القارة', 'world.nations': 'المنتخبات',
  'world.club': 'النادي', 'world.form': 'الحالة', 'world.today': 'مباريات اليوم', 'world.play': 'العب', 'world.promotion': 'الصعود', 'world.relegation': 'الهبوط', 'world.last': 'الموسم الماضي', 'world.promoted': '▲ صعد', 'world.relegated': '▼ هبط',
  'trophies.kicker': 'الخزانة', 'trophies.title': 'غرفة الجوائز', 'trophies.hall': 'قاعة المشاهير', 'trophies.honours': 'لوحة الشرف', 'trophies.cabinet': 'خزانة الألقاب', 'trophies.cabinetEmpty': 'فز بدوري أو كأس أو بطولة وسيُعرض هنا.',
  'stadiums.title': 'الملاعب', 'stadiums.sub': 'كل ملعب في العالم بتقنية ثلاثية الأبعاد. اختر واحداً وتجوّل فيه وغيّر الطقس.', 'stadiums.playhere': 'العب هنا',
  'builder.kicker': 'مصمّم الملاعب', 'builder.title': 'صمّم ملعبك', 'builder.sub': 'شكّل المدرجات، اختر السقف والأضواء، لوّن المقاعد، واختر ما يحيط بالملعب. سيكون ملعبك في التشكيلة المثالية، ويوسّعه مجلس الإدارة في المسيرة.', 'builder.for': 'الملعب لـ', 'builder.name': 'الاسم', 'builder.capacity': 'السعة', 'builder.tiers': 'الطوابق', 'builder.corners': 'الزوايا', 'builder.roof': 'السقف', 'builder.lights': 'الكشافات', 'builder.pitch': 'أرضية الملعب', 'builder.colours': 'الألوان', 'builder.seats': 'المقاعد', 'builder.facadeColour': 'الواجهة', 'builder.clubColours': 'ألوان النادي', 'builder.facade': 'الواجهة', 'builder.landscape': 'المحيط', 'builder.lettering': 'الاسم في المقاعد', 'builder.lettering.sub': 'مكتوب في المدرج البعيد', 'builder.use': 'اجعله ملعبي', 'builder.isHome': 'هذا ملعبك', 'builder.save': 'احفظ التصميم', 'builder.share': 'رمز المشاركة', 'builder.reset': 'ابدأ من جديد', 'builder.load': 'حمّل الرمز', 'builder.saved': 'التصاميم المحفوظة', 'builder.open': 'افتح', 'builder.hint': 'رمز المشاركة يحمل الشكل والألوان فقط. من يحمّله يرى اسم ناديه هو في المقاعد.', 'builder.building': 'جارٍ بناء الملعب…', 'social.guild': 'النقابة', 'social.yourGuild': 'نقابتك', 'social.joinGuild': 'انضم إلى نقابة', 'social.friends': 'الأصدقاء', 'social.live': 'مباشر الآن', 'social.live.sub': 'شاهد مباراة تُلعب الآن. المتفرجون يرون شاشة المضيف ولا يمكنهم لمس اللعبة.', 'social.create': 'أنشئ', 'social.join': 'انضم', 'social.leave': 'غادر النقابة', 'social.add': 'أضف', 'social.invite': 'ادعُ', 'social.watch': 'شاهد', 'social.objectives': 'أهداف الأسبوع', 'social.board': 'لوحة النقابات', 'social.members': 'أعضاء', 'social.nobody': 'لا أحد يلعب الآن.', 'social.spectating': 'الانضمام كمتفرج…',
  'settings.title': 'الإعدادات', 'settings.language': 'اللغة', 'settings.language.sub': 'العربية تقلب الاتجاه من اليمين إلى اليسار.',
  'settings.largeText': 'نص أكبر', 'settings.largeText.sub': 'يكبّر كل النصوص بنحو الخُمس.',
  'settings.colorSafe': 'أطقم آمنة لعمى الألوان', 'settings.colorSafe.sub': 'يُختار طقم الضيف بحيث يبقى مميزاً في كل أنواع رؤية الألوان.',
  'settings.reduceMotion': 'تقليل الحركة', 'settings.look': 'المظهر', 'settings.sound': 'الصوت', 'settings.audio': 'الصوت', 'settings.music': 'الموسيقى', 'settings.sfx': 'المؤثرات',
  'settings.access': 'سهولة الوصول', 'settings.detail': 'التفاصيل ثلاثية الأبعاد', 'settings.tutorial': 'الجولة التعليمية', 'settings.tutorial.sub': 'أعد الجولة من البداية.', 'settings.tutorial.btn': 'ابدأ الجولة',
  'off': 'إيقاف', 'low': 'منخفض', 'mid': 'متوسط', 'high': 'عالٍ', 'on': 'تشغيل',
  'pause.resume': 'استئناف المباراة', 'pause.team': 'إدارة الفريق', 'pause.subs': 'التبديلات', 'pause.facts': 'إحصاءات المباراة', 'pause.controls': 'التحكم', 'pause.sound': 'الصوت', 'pause.photo': 'وضع التصوير', 'pause.leave': 'مغادرة المباراة',
  'end.rematch': 'إعادة المباراة', 'end.quit': 'خروج', 'end.highlights': '▶ اللقطات', 'end.continue': 'أكمل الموسم', 'end.uxi': 'العودة إلى التشكيلة المثالية',
  'photo.save': 'حفظ PNG', 'photo.done': 'تم', 'photo.hint': 'اسحب للدوران · العجلة أو القرص للتكبير',
  'squad.title': 'التشكيلة المثالية', 'nav.club': 'النادي', 'nav.division': 'الدرجة', 'nav.online': 'أونلاين', 'nav.objectives': 'الأهداف', 'nav.challenges': 'SBC', 'nav.store': 'المتجر',
  'onboard.welcome': 'أهلاً بك في APEX XI', 'onboard.body': 'إليك فريقك الأول. مباراة إرشادية مدتها دقيقة تعلّمك التحكم، ثم تصل إلى لوحة اليوم ومكافآتك الأولى بانتظارك.',
  'onboard.start': 'ابدأ المباراة الإرشادية', 'onboard.skip': 'تخطَّ، أعرف الطريق',
  'guide.move': 'حرّك اللاعب بالعصا اليسرى أو WASD', 'guide.sprint': 'اضغط باستمرار على الجري (Shift / R2)', 'guide.pass': 'مرّر (X / A)', 'guide.shoot': 'سدّد (Space / B) — اضغط باستمرار للقوة', 'guide.tackle': 'دافع: اضغط تدخل عندما لا تملك الكرة', 'guide.switch': 'بدّل اللاعب (Q / L1)', 'guide.done': 'أحسنت — العب حتى صافرة النهاية',
  'match.goal': 'هدف', 'match.halfTime': 'نهاية الشوط الأول', 'match.halfNote': 'أجرِ تغييراتك، ثم ابدأ الشوط الثاني.', 'match.fullTime': 'نهاية المباراة', 'match.ftSpectating': 'نهاية المباراة · مشاهدة', 'match.ended': 'انتهت المباراة', 'match.oppLeft': 'غادر المنافس — احتُسب لك الفوز', 'match.advantage': 'أفضلية', 'match.replay': 'إعادة',
  'sp.corner': 'ركنية', 'sp.corner.how': 'صوّب بالعصا · CROSS إلى المنطقة · SHORT لزميل', 'sp.freekick': 'ركلة حرة', 'sp.freekick.how': 'صوّب بالعصا · اضغط باستمرار SHOOT للقوة · CROSS أو SHORT', 'sp.penalty': 'ركلة جزاء', 'sp.penalty.how': 'اختر الجهة بالعصا · اضغط باستمرار SHOOT — قوة أكثر، مخاطرة أكثر', 'sp.throwin': 'رمية تماس', 'sp.throwin.how': 'صوّب بالعصا · THROW قصيرة أو LONG بعيدة', 'sp.other': 'كرة ثابتة',
  'hint.skill.touch': '{skill} اسحب ← حركة مهارية', 'hint.skill.pad': 'اضغط باستمرار {skill} + العصا ← حركة مهارية', 'hint.tactics': '{key} تكتيك سريع', 'hint.lob': '{lob} كرة ساقطة فوق الدفاع', 'hint.shoot.touch': 'اسحب {shoot} ↑ ساقطة · ↔ لولبية', 'hint.shoot.pad': 'اضغط باستمرار {shoot} = قوة · {curl} = لولبية', 'hint.deadball': 'الكرات الثابتة: صوّب بالعصا', 'hint.pause': '{pause} التبديلات والتكتيك', 'hint.defend.touch': '{slide} · اضغط باستمرار {jockey} · اضغط باستمرار {press}', 'hint.defend.pad': '{shoot} تدخل انزلاقي · اضغط باستمرار {jockey} مراقبة · اضغط باستمرار {press} ضغط',
  'facts.possession': 'الاستحواذ', 'facts.shots': 'التسديدات', 'facts.onTarget': 'على المرمى', 'facts.xg': 'الأهداف المتوقعة', 'facts.bigChances': 'فرص محققة', 'facts.corners': 'الركنيات', 'facts.fouls': 'الأخطاء', 'facts.goals': 'الأهداف', 'facts.noGoals': 'لا أهداف بعد.',
  'pause.secondHalf': 'ابدأ الشوط الثاني', 'pause.select': 'اختيار', 'pause.resumeShort': 'استئناف',
  'title.career': 'المسيرة', 'title.settings': 'الإعدادات', 'title.skills': 'المهارات', 'title.street': 'الشارع', 'title.world': 'العالم', 'title.today': 'اليوم', 'title.trophies': 'غرفة الجوائز', 'title.quick': 'انطلاق', 'title.squad': 'التشكيلة المثالية', 'title.stadiums': 'الملاعب', 'title.builder': 'مصمّم الملاعب', 'title.online': 'الحساب', 'title.pro': 'مسيرة اللاعب', 'title.cup': 'كأس مخصّصة', 'title.weekend': 'تحدي نهاية الأسبوع', 'title.match': 'يوم المباراة', 'title.play': 'المباراة',
  'career.kicker': 'الوضع 03', 'career.sub': 'تولَّ نادياً حقيقياً. وتحمّل النتائج.', 'career.manager': 'وضع المدرب', 'career.chooseManager': 'اختر مدربك', 'career.chooseManager.sub': 'اسم حقيقي على خط التماس، أو اسمك أنت.', 'career.createManager': 'أنشئ مدربك', 'career.createManager.sub': 'هذا من يقف في منطقتك الفنية.', 'career.chooseClub': 'اختر ناديك', 'career.chooseClub.sub': 'كل تشكيلة حقيقية. وكذلك الجدول الذي ستُحاسَب عليه.',
  'settings.kicker': 'النظام', 'settings.sub': 'كيف تبدو اللعبة وتُسمع وتعمل على هذا الجهاز.',
  'skills.kicker': 'أوضاع سريعة', 'skills.title': 'المهارات والتدريب', 'skills.sub': 'تمارين بلوحات صدارة، وركلات ترجيح، وملعب لك وحدك.',
  'street.kicker': 'الوضع · الشارع', 'street.sub': '{name} · المستوى {lvl} · {rep} سمعة · {won}/{played} فوز', 'street.create': 'أنشئ لاعبك', 'street.create.sub': 'ثلاثة ضد ثلاثة على سطح، وخمسة على الرمل. المهارات تمنحك الأسلوب، والأسلوب يمنحك الشارع.',
  'world.kicker2': 'مئة نادٍ · ثماني درجات', 'world.sub': 'الموسم {season} · الجولة {round} من {rounds} · جولة كل يوم، صعود اثنين وهبوط اثنين',
  'trophies.earned': '{n} من {of} محقّقة', 'trophies.toCollect': '{n} بانتظار الاستلام',
  'career.continue': 'متابعة', 'career.runClub': 'أدِر نادياً', 'career.managerMode': 'وضع المدرب', 'career.f.takeClub': 'تولَّ نادياً', 'career.f.transfers': 'الانتقالات', 'career.f.touchline': 'قُد من خط التماس', 'career.start': 'ابدأ ←', 'career.bePlayer': 'كن اللاعب', 'career.playerMode': 'وضع اللاعب', 'career.f.createPlayer': 'أنشئ لاعباً', 'career.f.start17': 'ابدأ في السابعة عشرة', 'career.f.legacy': 'مباريات دولية وإرث', 'career.continueCta': 'تابع ←', 'career.createPlayerCta': 'أنشئ لاعبك ←',
  'skills.nav.drills': 'ألعاب المهارة', 'skills.nav.pens': 'ركلات الترجيح', 'skills.nav.practice': 'ساحة التدريب', 'skills.best': 'الأفضل', 'skills.loading': 'جارٍ تحميل اللوحة…', 'skills.signIn': 'سجّل الدخول (التشكيلة المثالية ← أونلاين) لتنشر نتيجتك في اللوحة.',
  'drill.slalom': 'المراوغة بين الأعلام', 'drill.slalom.blurb': 'ثماني بوابات، وساعة توقيت، وتحكّمك القريب بالكرة.', 'drill.freekicks': 'أهداف الركلات الحرة', 'drill.freekicks.blurb': 'خمس ركلات، خمسة أهداف، وحائط واحد.', 'drill.crossing': 'العرضيات', 'drill.crossing.blurb': 'أصب المنطقة المضيئة من خط المرمى. ست كرات.', 'drill.passing': 'بوابات التمرير', 'drill.passing.blurb': 'ستون ثانية. مرّر عبر البوابة التي تضيء.',
  'squad.kicker': 'الوضع 02', 'uxi.packs': 'الحزم', 'uxi.locker': 'الخزانة', 'uxi.icons': 'تبادل الأساطير', 'uxi.market': 'السوق', 'uxi.binder': 'الألبوم', 'uxi.ultimate': 'المثالية', 'uxi.squad': 'التشكيلة', 'uxi.evos': 'التطويرات', 'uxi.badge': 'شعار النادي', 'uxi.kit': 'الطقم', 'uxi.clubName': 'اسم النادي',
  'common.back': 'رجوع', 'common.continue': 'متابعة', 'common.play': 'العب', 'common.open': 'افتح', 'common.close': 'إغلاق',
};

const EN = {
  'menu.today': 'Today', 'menu.trophies': 'Trophies', 'menu.career': 'Career', 'menu.street': 'Street', 'menu.skills': 'Skills', 'menu.settings': 'Settings',
  'menu.ultimate': 'Ultimate XI', 'menu.ultimate.blurb': 'Build · rank up · rewards', 'menu.open': 'Open →',
  'menu.kickoff': 'Kick Off', 'menu.kickoff.blurb': 'Straight into a match', 'menu.play': 'Play →',
  'menu.disclaimer': 'Player, manager and Career club names are those of real people and clubs, used without endorsement or affiliation; Ultimate XI clubs and all competitions are fictional. Badges and portraits are drawn and are not likenesses.',
  'today.kicker': 'Every day', 'today.title': 'Today', 'today.daily': 'Day reward', 'today.claim': 'Claim', 'today.world': 'The World', 'today.tables': 'Tables →',
  'quick.kicker': 'Mode 01', 'quick.title': 'Kick Off', 'quick.sub': 'Pick two clubs and play. Nothing is saved, nothing is at stake.',
  'quick.home': 'HOME', 'quick.away': 'AWAY', 'quick.mode': 'Mode', 'quick.length': 'Length', 'quick.cpu': 'CPU', 'quick.time': 'Kick-off', 'quick.weather': 'Weather',
  'quick.go': 'Kick Off', 'quick.world': 'League tables · The World →', 'quick.stadiums': 'Stadium showcase →',
  'quick.1p': '1 Player', 'quick.1p.sub': 'You vs CPU', 'quick.2p': '2P Versus', 'quick.2p.sub': 'Head to head', 'quick.coop': '2P Co-op', 'quick.coop.sub': 'Same team',
  'auto': 'Auto', 'day': 'Day', 'dusk': 'Dusk', 'night': 'Night', 'clear': 'Clear', 'cloud': 'Cloud', 'rain': 'Rain', 'snow': 'Snow',
  'easy': 'Easy', 'pro': 'Pro', 'elite': 'Elite',
  'world.kicker': 'Sixty clubs · six divisions', 'world.title': 'The World', 'world.cup': 'Continental Cup', 'world.nations': 'Nations',
  'world.club': 'Club', 'world.form': 'Form', 'world.today': "Today's fixtures", 'world.play': 'Play', 'world.promotion': 'Promotion', 'world.relegation': 'Relegation', 'world.last': 'Last season', 'world.promoted': '▲ Promoted', 'world.relegated': '▼ Relegated',
  'trophies.kicker': 'Cabinet', 'trophies.title': 'Trophy Room', 'trophies.hall': 'Hall of Fame', 'trophies.honours': 'Honours board', 'trophies.cabinet': 'Your silverware', 'trophies.cabinetEmpty': 'Win a league, a cup or a tournament and it stands here.',
  'stadiums.title': 'Grounds', 'stadiums.sub': 'Every ground in the world, from a village rec to the giant arenas. Pick one, fly round it, change the sky.', 'stadiums.playhere': 'Play here',
  'builder.kicker': 'Stadium Builder', 'builder.title': 'Design your ground', 'builder.sub': 'Shape the bowl, pick the roof and the lights, colour the seats, choose what lies beyond the stands. It becomes your home in Ultimate XI, and the board grows it in Career.', 'builder.for': 'Ground for', 'builder.name': 'Name', 'builder.capacity': 'Capacity', 'builder.tiers': 'Tiers', 'builder.corners': 'Corners', 'builder.roof': 'Roof', 'builder.lights': 'Floodlights', 'builder.pitch': 'Pitch', 'builder.colours': 'Colours', 'builder.seats': 'Seats', 'builder.facadeColour': 'Facade', 'builder.clubColours': 'Club colours', 'builder.facade': 'Facade', 'builder.landscape': 'Landscape', 'builder.lettering': 'Name in the seats', 'builder.lettering.sub': 'picked out in the far stand', 'builder.use': 'Use as my ground', 'builder.isHome': 'This is your ground', 'builder.save': 'Save design', 'builder.share': 'Share code', 'builder.reset': 'Start again', 'builder.load': 'Load code', 'builder.saved': 'Saved designs', 'builder.open': 'Open', 'builder.hint': "A share code carries the shape and the colours only. Whoever loads it sees their own club's name in the seats.", 'builder.building': 'Building the ground…', 'social.guild': 'Guild', 'social.yourGuild': 'Your guild', 'social.joinGuild': 'Join a guild', 'social.friends': 'Friends', 'social.live': 'Live now', 'social.live.sub': "Watch a match that is being played right now. Spectators see the host's view and can never touch the game.", 'social.create': 'Create', 'social.join': 'Join', 'social.leave': 'Leave guild', 'social.add': 'Add', 'social.invite': 'Invite', 'social.watch': 'Watch', 'social.objectives': 'Weekly objectives', 'social.board': 'Guild board', 'social.members': 'members', 'social.nobody': 'Nobody is playing right now.', 'social.spectating': 'Joining as a spectator…',
  'settings.title': 'Settings', 'settings.language': 'Language', 'settings.language.sub': 'Arabic switches the layout to right-to-left.',
  'settings.largeText': 'Larger text', 'settings.largeText.sub': 'Everything about a fifth bigger.',
  'settings.colorSafe': 'Colour-safe kits', 'settings.colorSafe.sub': 'The away strip is picked to stay distinct in every kind of colour vision.',
  'settings.reduceMotion': 'Reduce motion', 'settings.look': 'Look', 'settings.sound': 'Sound', 'settings.audio': 'Audio', 'settings.music': 'Music', 'settings.sfx': 'Effects',
  'settings.access': 'Accessibility', 'settings.detail': '3D detail', 'settings.tutorial': 'Guided tour', 'settings.tutorial.sub': 'Run the tour again from the start.', 'settings.tutorial.btn': 'Start tour',
  'off': 'Off', 'low': 'Low', 'mid': 'Mid', 'high': 'High', 'on': 'On',
  'pause.resume': 'Resume Match', 'pause.team': 'Team Management', 'pause.subs': 'Substitutions', 'pause.facts': 'Match Facts', 'pause.controls': 'Controls', 'pause.sound': 'Sound', 'pause.photo': 'Photo Mode', 'pause.leave': 'Leave Match',
  'end.rematch': 'Rematch', 'end.quit': 'Quit', 'end.highlights': '▶ Highlights', 'end.continue': 'Continue the season', 'end.uxi': 'Back to Ultimate XI',
  'photo.save': 'Save PNG', 'photo.done': 'Done', 'photo.hint': 'Drag to orbit · wheel or pinch to zoom',
  'squad.title': 'Ultimate XI', 'nav.club': 'Club', 'nav.division': 'Division', 'nav.online': 'Online', 'nav.objectives': 'Objectives', 'nav.challenges': 'SBC', 'nav.store': 'Store',
  'onboard.welcome': 'Welcome to APEX XI', 'onboard.body': 'Here is your first squad. A one-minute guided match teaches the controls, then you land on the Today hub with your first rewards waiting.',
  'onboard.start': 'Start the guided match', 'onboard.skip': 'Skip, I know my way',
  'guide.move': 'Move with the left stick or WASD', 'guide.sprint': 'Hold SPRINT (Shift / R2)', 'guide.pass': 'PASS (X / A)', 'guide.shoot': 'SHOOT (Space / B) — hold for power', 'guide.tackle': 'Defend: press TACKLE when you do not have the ball', 'guide.switch': 'SWITCH player (Q / L1)', 'guide.done': 'Well played — play on to the whistle',
  'match.goal': 'GOAL', 'match.halfTime': 'HALF TIME', 'match.halfNote': 'Make your changes, then kick off the second half.', 'match.fullTime': 'Full time', 'match.ftSpectating': 'Full time · spectating', 'match.ended': 'Match ended', 'match.oppLeft': 'Opponent left — win awarded', 'match.advantage': 'Advantage', 'match.replay': 'REPLAY',
  'sp.corner': 'Corner', 'sp.corner.how': 'Aim with the stick · CROSS into the box · SHORT to a team-mate', 'sp.freekick': 'Free kick', 'sp.freekick.how': 'Aim with the stick · hold SHOOT for power · CROSS or SHORT', 'sp.penalty': 'Penalty', 'sp.penalty.how': 'Pick a side with the stick · hold SHOOT — more power, more risk', 'sp.throwin': 'Throw-in', 'sp.throwin.how': 'Aim with the stick · THROW short or LONG', 'sp.other': 'Set piece',
  'hint.skill.touch': '{skill} swipe → a trick', 'hint.skill.pad': 'hold {skill} + stick → a trick', 'hint.tactics': '{key} quick tactics', 'hint.lob': '{lob} chip it over the top', 'hint.shoot.touch': 'Flick {shoot} ↑ chip · ↔ bend', 'hint.shoot.pad': 'hold {shoot} = power · {curl} = bend', 'hint.deadball': 'Dead ball: aim with the stick', 'hint.pause': '{pause} subs &amp; tactics', 'hint.defend.touch': '{slide} · hold {jockey} · hold {press}', 'hint.defend.pad': '{shoot} slide · hold {jockey} jockey · hold {press} press',
  'facts.possession': 'Possession', 'facts.shots': 'Shots', 'facts.onTarget': 'On target', 'facts.xg': 'Expected goals', 'facts.bigChances': 'Big chances', 'facts.corners': 'Corners', 'facts.fouls': 'Fouls', 'facts.goals': 'Goals', 'facts.noGoals': 'No goals yet.',
  'pause.secondHalf': 'Start Second Half', 'pause.select': 'Select', 'pause.resumeShort': 'Resume',
  'career.kicker': 'Mode 03', 'career.sub': 'Take a real club. Live with the results.', 'career.manager': 'Manager Mode', 'career.chooseManager': 'Choose your manager', 'career.chooseManager.sub': 'A real name on the touchline, or your own.', 'career.createManager': 'Create your manager', 'career.createManager.sub': 'This is who stands in your technical area.', 'career.chooseClub': 'Choose your club', 'career.chooseClub.sub': 'Every squad is real. So is the table you will answer to.',
  'settings.kicker': 'System', 'settings.sub': 'How the game looks, sounds and runs on this device.',
  'skills.kicker': 'Quick modes', 'skills.title': 'Skills & Practice', 'skills.sub': 'Drills with leaderboards, a shootout, and a pitch to yourself.',
  'street.kicker': 'Mode · Street', 'street.sub': '{name} · level {lvl} · {rep} rep · {won}/{played} won', 'street.create': 'Create your baller', 'street.create.sub': 'Three a side on a rooftop, five on the sand. Skills win you style; style wins you the street.',
  'world.kicker2': 'A hundred clubs · eight divisions', 'world.sub': 'Season {season} · Round {round} of {rounds} · a round a day, two up and two down',
  'trophies.earned': '{n} of {of} earned', 'trophies.toCollect': '{n} to collect',
  'career.continue': 'Continue', 'career.runClub': 'Run a club', 'career.managerMode': 'MANAGER MODE', 'career.f.takeClub': 'Take a club', 'career.f.transfers': 'Transfers', 'career.f.touchline': 'Call it from the touchline', 'career.start': 'Start →', 'career.bePlayer': 'Be the player', 'career.playerMode': 'PLAYER MODE', 'career.f.createPlayer': 'Create a player', 'career.f.start17': 'Start at 17', 'career.f.legacy': 'Caps and a legacy', 'career.continueCta': 'Continue →', 'career.createPlayerCta': 'Create your player →',
  'skills.nav.drills': 'Skill games', 'skills.nav.pens': 'Penalty shootout', 'skills.nav.practice': 'Practice arena', 'skills.best': 'Best', 'skills.loading': 'Loading the board…', 'skills.signIn': 'Sign in (Ultimate XI → Online) to post to the board.',
  'squad.kicker': 'Mode 02', 'uxi.packs': 'Packs', 'uxi.locker': 'Locker', 'uxi.icons': 'Icon Exchange', 'uxi.market': 'Market', 'uxi.binder': 'Binder', 'uxi.ultimate': 'Ultimate', 'uxi.squad': 'Squad', 'uxi.evos': 'Evolutions', 'uxi.badge': 'Club Badge', 'uxi.kit': 'Kit', 'uxi.clubName': 'Club Name',
  'common.back': 'Back', 'common.continue': 'Continue', 'common.play': 'Play', 'common.open': 'Open', 'common.close': 'Close',
};

const DICT = { en: EN, ar: AR };

/* v169: short labels translated by their English text, where a key per row
   would only repeat the English (Settings rows, table headers). */
const AR_TEXT = {
  "Support": "الدعم",
  "Bugs and ideas.": "الأعطال والأفكار.",
  "What's new": "ما الجديد",
  "Every change, newest first.": "كل تغيير، الأحدث أولاً.",
  "Version": "الإصدار",
  "Build": "البناء",
  "Quote it in a bug report.": "اذكره في بلاغ العطل.",
  "Force update": "فرض التحديث",
  "Reload the latest build.": "أعد تحميل أحدث بناء.",
  "Scroll check": "فحص التمرير",
  "If the mouse wheel misbehaves.": "إن لم تعمل عجلة الفأرة كما يجب.",
  "Sim speed": "سرعة المحاكاة",
  "Full commentary": "تعليق كامل",
  "Spoken commentary": "تعليق صوتي",
  "Subtitles": "الترجمة النصية",
  "Commentators": "المعلقون",
  "On-screen graphics": "رسومات الشاشة",
  "Audio": "الصوت",
  "Music": "الموسيقى",
  "Effects": "المؤثرات",
  "One-handed touch": "لمس بيد واحدة",
  "Touch buttons": "أزرار اللمس",
  "Sprint": "الجري",
  "Goal celebration": "احتفال الهدف",
  "Battery saver": "توفير البطارية",
  "30 fps, lighter picture.": "30 إطاراً، صورة أخف.",
  "Keep the frame rate": "حافظ على معدل الإطارات",
  "Trims effects when a match stutters.": "يخفّف المؤثرات عند تقطّع المباراة.",
  "Reduce motion": "تقليل الحركة",
  "3D detail": "التفاصيل ثلاثية الأبعاد",
  "Camera": "الكاميرا",
  "Renderer": "المحرّك الرسومي",
  "Show FPS": "إظهار معدل الإطارات",
  "Apex": "أبكس",
  "Ultimate": "المثالية",
  "Back up": "نسخ احتياطي",
  "Restore from a file": "استعادة من ملف",
  "Backed up first.": "تُنسخ احتياطياً أولاً.",
  "Automatic backups": "نسخ احتياطية تلقائية",
  "Daily, last three.": "يومياً، آخر ثلاث.",
  "Reset save": "إعادة ضبط الحفظ",
  "Stick deadzone": "المنطقة الميتة للعصا",
  "Raise it if your player drifts.": "ارفعها إن انجرف لاعبك.",
  "Stick response": "استجابة العصا",
  "Left quick · right fine.": "يساراً سريعة · يميناً دقيقة.",
  "Vibration": "الاهتزاز",
  "Pads and Android phones.": "وحدات التحكم وهواتف أندرويد.",
  "Squad rating": "تقييم التشكيلة",
  "Chemistry": "الانسجام",
  "Positions filled": "المراكز المشغولة",
  "Formation": "الخطة",
  "Auto fill": "ملء تلقائي",
  "Clear": "مسح",
  "Nation": "المنتخب",
  "P": "لعب",
  "W": "ف",
  "D": "ت",
  "L": "خ",
  "GD": "الفارق",
  "Pts": "نقاط",
  "Match": "المباراة",
  "Controls": "التحكم",
  "Graphics": "الرسومات",
  "Controller": "وحدة التحكم",
  "Save": "الحفظ",
  "App": "التطبيق",
  "Career sim": "محاكاة المسيرة",
  "Broadcast": "البث",
  "Sound": "الصوت",
  "Performance": "الأداء",
  "Button map": "خريطة الأزرار",
  "Controller layout": "تخطيط وحدة التحكم",
  "Credits": "الاعتمادات",
  "Commentary language": "لغة التعليق",
  "Game language": "لغة اللعبة",
  "Normal": "عادية",
  "Fast": "سريعة",
  "Instant": "فورية",
  "Defaults": "الافتراضي",
  "New": "جديد",
  "Updated": "محدّث",
  "Back": "عاد",
  "Event": "حدث",
  "Limited": "محدود",
  "Promo": "العروض",
  "On the house": "مجاناً",
  "every 6 h": "كل 6 ساعات",
  "Standard": "العادية",
  "Premium": "المميزة",
  "better odds": "فرص أفضل",
  "Limited & Icons": "المحدودة والأساطير",
  "guaranteed": "مضمونة",
  "Packs": "الحزم",
  "Claim free": "استلم مجاناً",
  "Free in": "مجاناً بعد",
  "Odds": "الاحتمالات",
  "or 12 division wins": "أو 12 فوزاً في الدرجة",
  "Possession": "الاستحواذ",
  "Shots": "التسديدات",
  "On target": "على المرمى",
  "Expected goals": "الأهداف المتوقعة",
  "Big chances": "فرص محققة",
  "Passes": "التمريرات",
  "Tackles won": "افتكاك الكرة",
  "Saves": "التصديات",
  "Distance (km)": "المسافة (كم)",
  "Bookings": "الإنذارات",
  "Sent off": "الطرد",
  "Player of the match": "رجل المباراة",
  "Dressing room": "غرفة الملابس",
  "Ratings": "التقييمات",
  "Stats": "الإحصاءات",
  "Momentum": "مجريات اللعب",
  "on": "على المرمى",
  "Share the result card": "شارك بطاقة النتيجة",
  "Keep these goals": "احفظ هذه الأهداف",
  "Your goals": "أهدافك",
  "Goal": "هدف",
  "Remove": "إزالة",
  "Not enough of the match to draw.": "لم يُلعب ما يكفي من المباراة للرسم.",
};
export function tx(en) { return lang() === 'ar' ? AR_TEXT[en] ?? en : en; }

export function lang() {
  try { return getState().settings.lang || 'en'; } catch { return 'en'; }
}
export const isRTL = () => lang() === 'ar';

export function t(key, vars) {
  const d = DICT[lang()] || EN;
  let s = d[key] ?? EN[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), () => String(v));
  return s;
}

/** Push the language onto the document: `lang`, `dir`, and the larger-text class. */
export function applyLanguage() {
  const s = getState().settings;
  const l = s.lang || 'en';
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('rtl', l === 'ar');
  // v87: text size is a scale (S/M/L/XL); an old save's "larger text" reads as L
  const scale = s.textScale && s.textScale !== 1 ? s.textScale : s.largeText ? 1.15 : 1;
  document.documentElement.classList.toggle('large-text', scale > 1);
  document.documentElement.style.setProperty('--ui-scale', String(scale));
}

export function setLang(l) {
  update((s) => { s.settings.lang = LANGS[l] ? l : 'en'; });
  applyLanguage();
}
