/**
 * Everything one player can say to another. Pre-set phrases and emotes only
 * — there is no free text anywhere between players, by design — sent as an
 * id and rendered by the receiver in their own language. The server keeps
 * the same list of ids and drops anything else.
 */
export const EMOTES = [
  { id: 'gg', en: 'Good game', ar: 'مباراة ممتعة', icon: '🤝' },
  { id: 'wow', en: 'What a goal!', ar: 'يا له من هدف!', icon: '🤩' },
  { id: 'lucky', en: 'Lucky…', ar: 'حظ…', icon: '🍀' },
  { id: 'ouch', en: 'Ouch', ar: 'آخ', icon: '😬' },
  { id: 'nice', en: 'Nice one', ar: 'أحسنت', icon: '👏' },
  { id: 'rematch', en: 'Rematch?', ar: 'إعادة؟', icon: '🔁' },
  { id: 'thanks', en: 'Thanks', ar: 'شكراً', icon: '🙏' },
  { id: 'nooo', en: 'Noooo', ar: 'لااااا', icon: '😱' },
];
export const EMOTE_IDS = new Set(EMOTES.map((e) => e.id));
export const emoteText = (id, lang = 'en') => { const e = EMOTES.find((x) => x.id === id); return e ? `${e.icon} ${e[lang] || e.en}` : ''; };
