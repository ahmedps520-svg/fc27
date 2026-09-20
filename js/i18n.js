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
  'menu.today': 'اليوم', 'menu.trophies': 'الجوائز', 'menu.career': 'المسيرة', 'menu.settings': 'الإعدادات',
  'menu.ultimate': 'التشكيلة المثالية', 'menu.ultimate.blurb': 'ابنِ · ارتقِ · اكسب', 'menu.open': 'افتح ←',
  'menu.kickoff': 'انطلاق', 'menu.kickoff.blurb': 'مباشرة إلى المباراة', 'menu.play': 'العب ←',
  'menu.disclaimer': 'أسماء اللاعبين والمدربين وأندية وضع المسيرة تعود لأشخاص وأندية حقيقيين وتُستخدم دون تأييد أو ارتباط؛ أندية التشكيلة المثالية وجميع المسابقات خيالية. الشعارات والصور مرسومة وليست تشابهاً.',
  'today.kicker': 'كل يوم', 'today.title': 'اليوم', 'today.daily': 'مكافأة اليوم', 'today.claim': 'استلم', 'today.world': 'العالم', 'today.tables': 'الجداول ←',
  'quick.kicker': 'الوضع 01', 'quick.title': 'انطلاق', 'quick.sub': 'اختر ناديين والعب. لا شيء يُحفظ ولا شيء على المحك.',
  'quick.home': 'الأرض', 'quick.away': 'الضيف', 'quick.mode': 'الوضع', 'quick.length': 'المدة', 'quick.cpu': 'الحاسوب', 'quick.time': 'موعد الانطلاق', 'quick.weather': 'الطقس',
  'quick.go': 'انطلاق', 'quick.world': 'جداول الدوري · العالم ←', 'quick.stadiums': 'استعراض الملاعب ←',
  'quick.1p': 'لاعب واحد', 'quick.1p.sub': 'أنت ضد الحاسوب', 'quick.2p': 'لاعبان', 'quick.2p.sub': 'وجهاً لوجه', 'quick.coop': 'تعاون', 'quick.coop.sub': 'نفس الفريق',
  'auto': 'تلقائي', 'day': 'نهار', 'dusk': 'غسق', 'night': 'ليل', 'clear': 'صافٍ', 'cloud': 'غائم', 'rain': 'مطر',
  'easy': 'سهل', 'pro': 'محترف', 'elite': 'نخبة',
  'world.kicker': 'ستون نادياً · ست درجات', 'world.title': 'العالم', 'world.cup': 'كأس القارة', 'world.nations': 'المنتخبات',
  'world.club': 'النادي', 'world.form': 'الحالة', 'world.today': 'مباريات اليوم', 'world.play': 'العب', 'world.promotion': 'الصعود', 'world.relegation': 'الهبوط', 'world.last': 'الموسم الماضي', 'world.promoted': '▲ صعد', 'world.relegated': '▼ هبط',
  'trophies.kicker': 'الخزانة', 'trophies.title': 'غرفة الجوائز', 'trophies.hall': 'قاعة المشاهير', 'trophies.honours': 'لوحة الشرف',
  'stadiums.title': 'الملاعب', 'stadiums.sub': 'كل ملعب في العالم بتقنية ثلاثية الأبعاد. اختر واحداً وتجوّل فيه وغيّر الطقس.', 'stadiums.playhere': 'العب هنا',
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
  'common.back': 'رجوع', 'common.continue': 'متابعة', 'common.play': 'العب', 'common.open': 'افتح', 'common.close': 'إغلاق',
};

const EN = {
  'menu.today': 'Today', 'menu.trophies': 'Trophies', 'menu.career': 'Career', 'menu.settings': 'Settings',
  'menu.ultimate': 'Ultimate XI', 'menu.ultimate.blurb': 'Build · rank up · rewards', 'menu.open': 'Open →',
  'menu.kickoff': 'Kick Off', 'menu.kickoff.blurb': 'Straight into a match', 'menu.play': 'Play →',
  'menu.disclaimer': 'Player, manager and Career Mode club names are those of real people and clubs, used without endorsement or affiliation; Ultimate XI clubs and all competitions are fictional. Badges and portraits are drawn and are not likenesses.',
  'today.kicker': 'Every day', 'today.title': 'Today', 'today.daily': 'Day reward', 'today.claim': 'Claim', 'today.world': 'The World', 'today.tables': 'Tables →',
  'quick.kicker': 'Mode 01', 'quick.title': 'Kick Off', 'quick.sub': 'Pick two clubs and play. Nothing is saved, nothing is at stake.',
  'quick.home': 'HOME', 'quick.away': 'AWAY', 'quick.mode': 'Mode', 'quick.length': 'Length', 'quick.cpu': 'CPU', 'quick.time': 'Kick-off', 'quick.weather': 'Weather',
  'quick.go': 'Kick Off', 'quick.world': 'League tables · The World →', 'quick.stadiums': 'Stadium showcase →',
  'quick.1p': '1 Player', 'quick.1p.sub': 'You vs CPU', 'quick.2p': '2P Versus', 'quick.2p.sub': 'Head to head', 'quick.coop': '2P Co-op', 'quick.coop.sub': 'Same team',
  'auto': 'Auto', 'day': 'Day', 'dusk': 'Dusk', 'night': 'Night', 'clear': 'Clear', 'cloud': 'Cloud', 'rain': 'Rain',
  'easy': 'Easy', 'pro': 'Pro', 'elite': 'Elite',
  'world.kicker': 'Sixty clubs · six divisions', 'world.title': 'The World', 'world.cup': 'Continental Cup', 'world.nations': 'Nations',
  'world.club': 'Club', 'world.form': 'Form', 'world.today': "Today's fixtures", 'world.play': 'Play', 'world.promotion': 'Promotion', 'world.relegation': 'Relegation', 'world.last': 'Last season', 'world.promoted': '▲ Promoted', 'world.relegated': '▼ Relegated',
  'trophies.kicker': 'Cabinet', 'trophies.title': 'Trophy Room', 'trophies.hall': 'Hall of Fame', 'trophies.honours': 'Honours board',
  'stadiums.title': 'Stadiums', 'stadiums.sub': 'Every venue in the world, in 3D. Pick one, walk round it, change the weather.', 'stadiums.playhere': 'Play here',
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
  'common.back': 'Back', 'common.continue': 'Continue', 'common.play': 'Play', 'common.open': 'Open', 'common.close': 'Close',
};

const DICT = { en: EN, ar: AR };

export function lang() {
  try { return getState().settings.lang || 'en'; } catch { return 'en'; }
}
export const isRTL = () => lang() === 'ar';

export function t(key, vars) {
  const d = DICT[lang()] || EN;
  let s = d[key] ?? EN[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  return s;
}

/** Push the language onto the document: `lang`, `dir`, and the larger-text class. */
export function applyLanguage() {
  const s = getState().settings;
  const l = s.lang || 'en';
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('rtl', l === 'ar');
  document.documentElement.classList.toggle('large-text', !!s.largeText);
}

export function setLang(l) {
  update((s) => { s.settings.lang = LANGS[l] ? l : 'en'; });
  applyLanguage();
}
