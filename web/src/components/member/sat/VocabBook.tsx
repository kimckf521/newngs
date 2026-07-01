'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SatQuestion } from '@/lib/sat/types';
import { isRw, isMc } from '@/lib/sat/types';
import { addVocab, listVocab, removeVocab, setVocabDef, type VocabDef, type VocabEntry } from '@/lib/sat/progress';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, COMMON, type Lang } from './i18n';

/** 生词本 — vocabulary saved from Reading & Writing passages. Every word gets an
 *  AI-generated structured definition automatically (no button); the card shows
 *  a compact resting face that expands to the full breakdown, and follows the
 *  EN/中 language toggle. */

/* ----------------------------------------------------------- AI generation */

/** Concurrency-limited so opening a book full of not-yet-defined words doesn't
 *  fire a burst of requests (the endpoint rate-limits per IP). */
const MAX_CONCURRENT = 2;
let running = 0;
const queue: Array<() => void> = [];
function acquire(): Promise<void> {
  if (running < MAX_CONCURRENT) { running += 1; return Promise.resolve(); }
  return new Promise((res) => queue.push(() => { running += 1; res(); }));
}
function release(): void {
  running -= 1;
  queue.shift()?.();
}

/** Words with a generation currently in flight — dedups the auto-define effect
 *  (incl. React StrictMode's double-mount in dev). */
const inflight = new Set<string>();

async function fetchDef(word: string, context: string | undefined, locale: Lang): Promise<VocabDef | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 33_000); // client-side ceiling
  try {
    const res = await fetch('/api/sat-vocab', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, context: context || undefined, locale }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { def?: VocabDef };
    return data.def && (data.def.glossEn || data.def.glossZh) ? data.def : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Auto-define path — same as fetchDef but goes through the concurrency gate. */
async function autoDefine(word: string, context: string | undefined, locale: Lang): Promise<VocabDef | null> {
  await acquire();
  try { return await fetchDef(word, context, locale); }
  finally { release(); }
}

/** The sentence in `text` that contains `word` — used as the "source" line and
 *  the context we send for translation, so we never dump a whole passage. */
function sentenceWith(word: string, text?: string): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.!?"”])\s+/);
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${esc}\\b`, 'i');
  let out = sentences.find((s) => re.test(s));
  if (!out) {
    // Words-in-Context items blank the word out ("______"); use that sentence
    // with the blank filled in, so the "source" line reads naturally and the
    // context we send for definition is the right one (not an arbitrary line).
    const blank = sentences.find((s) => /_{2,}/.test(s));
    if (blank) out = blank.replace(/_{2,}/, word);
  }
  out = (out || sentences[0] || clean).trim();
  return out.length > 240 ? `${out.slice(0, 240)}…` : out;
}

/** Render `text` with each occurrence of `word` highlighted. */
function highlight(text: string, word: string): ReactNode {
  if (!text) return null;
  if (!word) return text;
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(\\b${esc}\\b)`, 'ig')); // \b so "art" doesn't light up inside "start"
  return parts.map((p, i) =>
    p.toLowerCase() === word.toLowerCase()
      ? <mark key={i} style={{ background: C.hl.yellow, color: '#1a1a1a', padding: '0 2px', borderRadius: 3 }}>{p}</mark>
      : <span key={i}>{p}</span>,
  );
}

/* ------------------------------------------------------------------ icons */

const ic = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Icon = {
  pencil: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...ic}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="M14 6l3 3" /></svg>),
  x: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...ic}><path d="M6 6l12 12M18 6L6 18" /></svg>),
  eye: () => (<svg width="22" height="22" viewBox="0 0 24 24" {...ic}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>),
  chevron: () => (<svg width="22" height="22" viewBox="0 0 24 24" {...ic}><path d="M6 9l6 6 6-6" /></svg>),
  chevronUp: () => (<svg width="15" height="15" viewBox="0 0 24 24" {...ic}><path d="M6 15l6-6 6 6" /></svg>),
  spark: () => (<svg width="14" height="14" viewBox="0 0 24 24" {...ic}><path d="M12 3l1.6 5L19 10l-5.4 2L12 17l-1.6-5L5 10l5.4-2z" /></svg>),
  volume: () => (<svg width="20" height="20" viewBox="0 0 24 24" {...ic}><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>),
};

/** Speak the word aloud via the browser's built-in TTS — free, offline, no
 *  backend. No-op where the Web Speech API isn't available. */
function speakWord(word: string): void {
  try {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    synth.speak(u);
  } catch {
    /* speech unavailable — ignore */
  }
}
function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={C.hairline} strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={C.blue} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------- the screen */

export function VocabBook({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const words = useMemo(() => listVocab(), [tick]);
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col ${dark ? 'sat-dark' : ''}`} style={{ background: C.soft, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${C.hairline}`, background: C.panel }}>
        <button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {COMMON[lang].back}</button>
        <div className="text-[15px] font-bold">{lang === 'zh' ? '生词本 · Vocabulary' : 'Vocabulary · 生词本'}</div>
        <span className="text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? `${words.length} 个词` : `${words.length} words`}</span>
        <div className="ml-auto"><ThemeLangToggle /></div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-[min(760px,94vw)] py-6">
          {words.length === 0 ? (
            <div className="rounded-xl border p-10 text-center text-[14px]" style={{ background: C.panel, borderColor: C.border, color: C.muted }}>
              {lang === 'zh' ? (
                <>还没有生词。在阅读写作题里点 <b style={{ color: C.ink }}>+ 生词</b> 即可收藏，释义会自动生成。</>
              ) : (
                <>No words saved yet. In a Reading &amp; Writing question, tap <b style={{ color: C.ink }}>+ 生词</b> — the meaning is generated automatically.</>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3">
              {words.map((v) => (
                <VocabCard key={v.word} v={v} lang={lang} onChange={refresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- the card */

function VocabCard({ v, lang, onChange }: { v: VocabEntry; lang: Lang; onChange: () => void }) {
  const zh = lang === 'zh';
  const def = v.def;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  // Auto-generate a definition once, if this word doesn't have one (or a manual note) yet.
  useEffect(() => {
    if (def || v.note) return;
    const key = v.word.toLowerCase();
    // Dedup the request (StrictMode double-mount, concurrent cards). The single
    // in-flight promise resolves state unconditionally below — since the card
    // instance is stable (key={word}), that always clears THIS card's spinner,
    // even the mount that only observed the dedup.
    if (inflight.has(key)) { setBusy(true); return; }
    inflight.add(key);
    setBusy(true); setErr(false);
    autoDefine(v.word, sentenceWith(v.word, v.context) || v.context, lang).then((d) => {
      inflight.delete(key);
      if (d) setVocabDef(v.word, d);
      setBusy(false);
      if (!d) setErr(true);
      onChange(); // parent re-reads the store so the new def renders
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.word]);

  const src = sentenceWith(v.word, v.context);

  function remove() { removeVocab(v.word); onChange(); }
  async function regenerate() {
    setBusy(true); setErr(false);
    const d = await fetchDef(v.word, sentenceWith(v.word, v.context) || v.context, lang);
    setBusy(false);
    if (d) { setVocabDef(v.word, d); onChange(); } else setErr(true);
  }

  const removeBtn = (
    <button type="button" onClick={remove} aria-label={COMMON[lang].remove}
      className="grid h-8 w-8 place-items-center rounded-full border transition-colors sat-hover" style={{ borderColor: C.border, color: C.muted }}><Icon.x /></button>
  );

  /* ---- no structured def yet ---- */
  if (!def) {
    if (v.note) {
      return (
        <div className="col-span-full rounded-xl border p-4" style={{ background: C.panel, borderColor: C.border }}>
          <div className="flex items-start justify-between gap-2">
            <div className="text-[17px] font-bold" style={{ color: C.ink }}>{v.word}</div>
            {removeBtn}
          </div>
          <div className="mt-1 whitespace-pre-line text-[14px] leading-relaxed" style={{ color: C.ink }}>{v.note}</div>
          {src ? <div className="mt-2 text-[12px] italic leading-relaxed" style={{ color: C.muted }}>“{src}”</div> : null}
        </div>
      );
    }
    return (
      <div className="flex aspect-square flex-col rounded-xl border p-3.5" style={{ background: C.panel, borderColor: C.border }}>
        <div className="flex justify-end">{removeBtn}</div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="break-words px-1 text-center text-[22px] font-bold" style={{ color: C.ink }}>{v.word}</div>
          {busy ? (
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.muted }}><Spinner /> {zh ? '释义生成中…' : 'Defining…'}</div>
          ) : (
            <button type="button" onClick={regenerate} className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-bold text-white" style={{ background: C.blue }}>
              <Icon.spark /> {zh ? '生成释义' : 'Define'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---- compact resting face ---- */
  if (!open) {
    // Symmetric: the word and eye sit at the same spot in both languages; the
    // 中 gloss drops onto its own centered line, with the slot reserved in EN so
    // nothing shifts when the language toggles.
    return (
      <div className="flex aspect-square flex-col rounded-xl border p-3.5" style={{ background: C.panel, borderColor: C.border }}>
        <div className="flex justify-end">{removeBtn}</div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="break-words px-1 text-center text-[22px] font-bold leading-tight" style={{ color: C.ink }}>{v.word}</div>
          <div className="mt-1 min-h-[22px] px-1 text-center text-[15px] leading-tight" style={{ color: C.muted }}>{zh ? def.glossZh : ''}</div>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} aria-label={zh ? '展开释义' : 'Show meaning'}
              className="grid h-10 w-10 place-items-center rounded-full transition-transform hover:scale-105" style={{ background: C.tint, color: C.blue }}>
              <Icon.eye />
            </button>
            <button type="button" onClick={() => speakWord(v.word)} aria-label={zh ? '朗读单词' : 'Speak word'}
              className="grid h-10 w-10 place-items-center rounded-full border transition-colors sat-hover" style={{ borderColor: C.border, color: C.muted }}>
              <Icon.volume />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- open full face ---- */
  const label = (t: string) => <div className="mb-1 text-[11px]" style={{ color: C.muted }}>{t}</div>;
  const pills = (arr: string[], anto: boolean) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[12px]" style={{ color: C.muted }}>{anto ? '≠' : '≈'}</span>
      {arr.map((w) => (
        <span key={w} className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
          style={anto ? { background: C.hover, border: `0.5px solid ${C.border}`, color: C.muted } : { background: C.tint, color: C.blue }}>{w}</span>
      ))}
    </div>
  );

  return (
    <div className="col-span-full overflow-hidden rounded-xl border" style={{ background: C.panel, borderColor: C.border }}>
      <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[17px] font-bold" style={{ color: C.ink }}>{v.word}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => speakWord(v.word)} aria-label={zh ? '朗读单词' : 'Speak word'}
            className="grid h-8 w-8 place-items-center rounded-full border transition-colors sat-hover" style={{ borderColor: C.border, color: C.muted }}><Icon.volume /></button>
          {removeBtn}
        </div>
      </div>

      {zh ? (
        <>
          {def.glossZh ? <div className="mt-1 text-[16px] font-bold leading-snug" style={{ color: C.ink }}>{def.glossZh}</div> : null}
          {def.glossEn ? <div className="text-[13px]" style={{ color: C.muted }}>{def.glossEn}</div> : null}
        </>
      ) : (
        (def.glossEn || def.glossZh) ? <div className="mt-1 text-[16px] font-bold leading-snug" style={{ color: C.ink }}>{def.glossEn || def.glossZh}</div> : null
      )}

      {def.synonyms.length ? (
        <div className="mt-3">{label(zh ? '同义词' : 'Synonyms')}{pills(def.synonyms, false)}</div>
      ) : null}

      <div className="mt-3 border-t pt-3" style={{ borderColor: C.hairline }}>
        {def.example ? (
          <div className="mb-3">
            {label(zh ? '例句' : 'Example')}
            <p className="text-[13px] leading-relaxed" style={{ color: C.ink }}>{highlight(def.example, v.word)}</p>
            {zh && def.exampleZh ? <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: C.muted }}>{def.exampleZh}</p> : null}
          </div>
        ) : null}

        {src ? (
          <div className="mb-3">
            {label(zh ? '出处 · 你收藏时的原句' : 'Source · where you saved it')}
            <p className="text-[13px] italic leading-relaxed" style={{ color: C.ink }}>“{highlight(src, v.word)}”</p>
            {zh && def.sourceZh ? <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: C.muted }}>{def.sourceZh}</p> : null}
          </div>
        ) : null}

        {def.antonyms.length ? (
          <div className="mb-1">{label(zh ? '反义词' : 'Antonyms')}{pills(def.antonyms, true)}</div>
        ) : null}
      </div>
      </div>
      <button type="button" onClick={() => setOpen(false)}
        className="flex w-full items-center justify-center gap-1.5 border-t py-2.5 text-[13px] font-semibold transition-colors sat-hover"
        style={{ borderColor: C.hairline, background: C.panel2, color: C.muted }}>
        <Icon.chevronUp /> {zh ? '收起' : 'Collapse'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------- inline "+ 生词" */

/** Inline "+ 生词" adder shown under a revealed Reading & Writing question.
 *  Saving kicks off the AI definition in the background — no button. */
export function VocabAdd({ question }: { question: SatQuestion }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { lang } = useSatLang();
  const suggested = useMemo(() => {
    if (question.skill === 'words_in_context' && isMc(question)) {
      const c = question as { choices: { id: string; text: string }[]; correct: string };
      return c.choices.find((x) => x.id === c.correct)?.text || '';
    }
    return '';
  }, [question]);
  const [word, setWord] = useState(suggested);
  const [note, setNote] = useState('');

  if (added) return <span className="mt-3 inline-block text-[13px] font-semibold" style={{ color: C.good }}>{lang === 'zh' ? '✓ 已收藏，释义生成中' : '✓ Saved — defining'}</span>;

  if (!open) {
    return (
      <button type="button" onClick={() => { setOpen(true); setWord(suggested); }}
        className="ml-2 mt-3 inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold"
        style={{ borderColor: C.border, color: C.ink, background: C.panel }}>
        {lang === 'zh' ? '+ 生词 · 收藏单词' : '+ 生词 · Save word'}
      </button>
    );
  }

  function save() {
    const w = word.trim();
    if (!w) return;
    // Store just the sentence the word came from (blank filled for Words-in-
    // Context), not the whole passage — so the "source" line and the definition
    // context are the actual sentence, and we don't ship a full passage.
    const ctx = sentenceWith(w, isRw(question) ? question.passage : question.stem);
    addVocab({ word: w, note: note.trim() || undefined, context: ctx, questionId: question.id });
    setAdded(true);
    // Auto-generate the definition unless the student typed their own note.
    if (!note.trim()) void autoDefine(w, ctx, lang).then((d) => { if (d) setVocabDef(w, d); });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border p-3" style={{ borderColor: C.border, background: C.panel }}>
      <input value={word} onChange={(e) => setWord(e.target.value)} placeholder={lang === 'zh' ? '单词' : 'word'} className="w-40 rounded border px-2 py-1.5 text-[13px]" style={{ borderColor: C.border }} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={lang === 'zh' ? '释义（选填，留空则自动生成）' : 'meaning (optional — auto if blank)'} className="min-w-[160px] flex-1 rounded border px-2 py-1.5 text-[13px]" style={{ borderColor: C.border }} />
      <button type="button" onClick={save} className="rounded-full px-4 py-1.5 text-[13px] font-bold text-white" style={{ background: C.blue }}>{lang === 'zh' ? '保存' : 'Save'}</button>
      <button type="button" onClick={() => setOpen(false)} className="text-[12px]" style={{ color: C.muted }}>{COMMON[lang].cancel}</button>
    </div>
  );
}
