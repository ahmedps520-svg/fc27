/**
 * Two-voice commentary (v83): a play-by-play caller and a co-commentator,
 * through the browser's own speech synthesis, with subtitles.
 *
 * Nothing is recorded or downloaded: the voices are whatever the platform
 * has. The two speakers get two different voices where the platform offers
 * two, and a different pitch and pace either way, so they never sound like
 * one man talking to himself. Arabic commentary uses an Arabic voice; where
 * the device has none it runs on subtitles alone rather than reading Arabic
 * in an English accent.
 *
 * The queue is short on purpose. Commentary that arrives after the moment it
 * describes is worse than none, so a line older than four seconds is dropped,
 * and a goal cuts in over whatever is being said.
 */
import { COMMENTARY } from '../data/commentary.js';
import { CO, CONTEXT, AR } from '../data/commentaryVoices.js';

/** Our two voices — invented people, the same in every match. */
export const SPEAKERS = {
  en: { pbp: 'Tom Hale', co: 'Nadia Farouk', pa: 'Stadium announcer' },
  ar: { pbp: 'فهد السالم', co: 'ليلى ناصر', pa: 'مذيع الملعب' },
};
const STYLE = { pbp: { rate: 1.08, pitch: 1.0 }, co: { rate: 0.96, pitch: 0.82 } };

/** The line banks for a language: { pbp, co, context }. */
export function banks(lang) {
  return lang === 'ar' ? AR : { pbp: COMMENTARY, co: CO, context: CONTEXT };
}

const lastPick = new Map();
/** A line from `bank[key]`, never the same twice running, placeholders filled. '' if none. */
export function lineFrom(bank, key, ctx = {}, tag = '') {
  const pool = bank?.[key];
  if (!pool || !pool.length) return '';
  const k = `${tag}:${key}`;
  let i = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && i === lastPick.get(k)) i = (i + 1) % pool.length;
  lastPick.set(k, i);
  return pool[i].replace(/\{(\w+)\}/g, (_, n) => (ctx[n] ?? ''));
}

/**
 * Two distinct voices for a language from the platform's list, or nulls.
 * Prefers local voices (no network round trip mid-match).
 */
export function pickVoices(voices, lang) {
  const re = lang === 'ar' ? /^ar/i : /^en/i;
  const pool = (voices || []).filter((v) => re.test(v.lang || ''));
  pool.sort((a, b) => (b.localService ? 1 : 0) - (a.localService ? 1 : 0));
  const pbp = pool[0] || null;
  const co = pool.find((v) => v !== pbp && v.name !== pbp?.name) || pbp;
  return { pbp, co };
}

/**
 * The commentary desk.
 *   lang       'en' | 'ar'
 *   voice      speak aloud
 *   subtitles  show each line with the speaker's name
 *   el         the subtitle element
 *   volume     0–1
 */
export function createDesk({ lang = 'en', voice = true, subtitles = true, el = null, volume = 0.9 } = {}) {
  const synth = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined' ? speechSynthesis : null;
  let voices = { pbp: null, co: null };
  const refreshVoices = () => { if (synth) voices = pickVoices(synth.getVoices?.() || [], lang); };
  refreshVoices();
  const onVoices = () => refreshVoices();
  synth?.addEventListener?.('voiceschanged', onVoices);
  // no platform voice for the language (or none at all, as in a headless browser): subtitles carry it
  const canSpeak = () => !!(voice && synth && voices.pbp);

  const queue = [];
  let busy = false;
  let subTimer = 0;
  let dead = false;
  const shown = [];

  function show(speaker, text) {
    shown.push({ speaker, text });
    if (shown.length > 40) shown.shift();
    if (!subtitles || !el) return;
    const who = SPEAKERS[lang]?.[speaker] || speaker;
    el.hidden = false;
    el.className = `bc-sub ${speaker}`;
    el.innerHTML = `<b>${who}</b><span></span>`;
    el.querySelector('span').textContent = text;
    clearTimeout(subTimer);
    subTimer = setTimeout(() => { if (el) el.hidden = true; }, Math.max(2200, text.length * 70));
  }

  function next() {
    if (dead || busy) return;
    const now = Date.now();
    while (queue.length && now - queue[0].at > 4000) queue.shift();
    const item = queue.shift();
    if (!item) return;
    show(item.speaker, item.text);
    if (!canSpeak()) { busy = true; setTimeout(() => { busy = false; next(); }, Math.min(2600, 700 + item.text.length * 45)); return; }
    try {
      const u = new SpeechSynthesisUtterance(item.text);
      const st = STYLE[item.speaker] || STYLE.pbp;
      u.rate = st.rate * (item.prio >= 2 ? 1.1 : 1); u.pitch = st.pitch; u.volume = volume;
      u.lang = lang === 'ar' ? 'ar-SA' : 'en-GB';
      const v = voices[item.speaker]; if (v) u.voice = v;
      busy = true;
      let settled = false;
      const done = () => { if (settled) return; settled = true; clearTimeout(guard); busy = false; setTimeout(next, item.speaker === 'pbp' ? 180 : 320); };
      // some platforms never fire onend for a cancelled or dropped utterance
      const guard = setTimeout(done, 3000 + item.text.length * 110);
      u.onend = u.onerror = done;
      synth.speak(u);
    } catch { busy = false; }
  }

  return {
    lang,
    /** Queue a line. prio 2 (a goal) interrupts; lower ones wait their turn. */
    say(speaker, text, prio = 1) {
      if (dead || !text) return;
      if (prio >= 2) {
        queue.length = 0;
        if (busy && canSpeak()) { try { synth.cancel(); } catch { /* none */ } }
        busy = false;
      } else if (queue.length >= 2) queue.shift();
      queue.push({ speaker, text, prio, at: Date.now() });
      next();
    },
    /** v87: a subtitle only — for lines another voice speaks (the stadium PA). */
    caption(speaker, text) { if (!dead && text) show(speaker, text); },
    setVoice(on) { voice = !!on; if (!on && synth) { try { synth.cancel(); } catch { /* none */ } busy = false; } },
    setSubtitles(on) { subtitles = !!on; if (!on && el) el.hidden = true; },
    /** What has been said, newest last (the tests and Match Facts read it). */
    log: () => shown.slice(),
    speaking: () => busy,
    destroy() {
      dead = true; queue.length = 0; clearTimeout(subTimer);
      synth?.removeEventListener?.('voiceschanged', onVoices);
      if (voice && synth) { try { synth.cancel(); } catch { /* none */ } }
    },
  };
}
