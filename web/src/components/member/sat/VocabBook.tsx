'use client';

import { useMemo, useState } from 'react';
import type { SatQuestion } from '@/lib/sat/types';
import { isRw, isMc } from '@/lib/sat/types';
import { addVocab, listVocab, removeVocab } from '@/lib/sat/progress';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, COMMON } from './i18n';

/** 生词本 — vocabulary saved from Reading & Writing passages / Words-in-Context
 *  items. A simple review list with an optional "test me" mode that hides the
 *  notes so the student can self-quiz. */
export function VocabBook({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const words = useMemo(() => listVocab(), [tick]);
  const { dark } = useSatTheme();
  const { lang } = useSatLang();

  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col ${dark ? 'sat-dark' : ''}`} style={{ background: C.soft, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: `1px solid ${C.hairline}`, background: C.panel }}>
        <button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {COMMON[lang].back}</button>
        <div className="text-[15px] font-bold">{lang === 'zh' ? '生词本 · Vocabulary' : 'Vocabulary · 生词本'}</div>
        <span className="text-[12px]" style={{ color: C.muted }}>{lang === 'zh' ? `${words.length} 个词` : `${words.length} words`}</span>
        {words.length ? (
          <label className="flex items-center gap-2 text-[13px]" style={{ color: C.muted }}>
            <input type="checkbox" checked={quiz} onChange={(e) => setQuiz(e.target.checked)} /> {lang === 'zh' ? '测试模式（隐藏释义）' : 'Test me (hide meanings)'}
          </label>
        ) : null}
        <div className="ml-auto"><ThemeLangToggle /></div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-[min(760px,94vw)] py-6">
          {words.length === 0 ? (
            <div className="rounded-xl border p-10 text-center text-[14px]" style={{ background: C.panel, borderColor: C.border, color: C.muted }}>
              {lang === 'zh' ? (
                <>还没有生词。在阅读写作题里点 <b style={{ color: C.ink }}>+ 生词</b> 即可收藏。</>
              ) : (
                <>No words saved yet. In a Reading &amp; Writing question, tap <b style={{ color: C.ink }}>+ 生词</b> to add a word here.</>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {words.map((v) => (
                <VocabCard key={v.word} v={v} quiz={quiz} onRemove={() => { removeVocab(v.word); setTick((t) => t + 1); }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VocabCard({ v, quiz, onRemove }: { v: ReturnType<typeof listVocab>[number]; quiz: boolean; onRemove: () => void }) {
  const [show, setShow] = useState(false);
  const { lang } = useSatLang();
  const hidden = quiz && !show;
  return (
    <div className="rounded-lg border p-4" style={{ background: C.panel, borderColor: C.border }}>
      <div className="flex items-start justify-between">
        <div className="text-[17px] font-bold" style={{ color: C.blueDeep }}>{v.word}</div>
        <button type="button" onClick={onRemove} className="text-[12px]" style={{ color: C.muted }}>{COMMON[lang].remove}</button>
      </div>
      {hidden ? (
        <button type="button" onClick={() => setShow(true)} className="mt-2 rounded border px-3 py-1 text-[12px] font-semibold" style={{ borderColor: C.border, color: C.blue }}>{lang === 'zh' ? '显示释义' : 'Show meaning'}</button>
      ) : (
        <>
          {v.note ? <div className="mt-1 text-[14px]" style={{ color: C.ink }}>{v.note}</div> : null}
          {v.context ? <div className="mt-2 text-[12px] italic leading-relaxed" style={{ color: C.muted }}>“{v.context.length > 160 ? v.context.slice(0, 160) + '…' : v.context}”</div> : null}
        </>
      )}
    </div>
  );
}

/** Inline "+ 生词" adder shown under a revealed Reading & Writing question. */
export function VocabAdd({ question }: { question: SatQuestion }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { lang } = useSatLang();
  const suggested = useMemo(() => {
    if (question.skill === 'words_in_context' && isMc(question)) {
      const c = (question as { choices: { id: string; text: string }[]; correct: string });
      return c.choices.find((x) => x.id === c.correct)?.text || '';
    }
    return '';
  }, [question]);
  const [word, setWord] = useState(suggested);
  const [note, setNote] = useState('');

  if (added) return <span className="mt-3 inline-block text-[13px] font-semibold" style={{ color: C.good }}>{lang === 'zh' ? '✓ 已收藏到生词本' : '✓ Saved to 生词本'}</span>;

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
    if (!word.trim()) return;
    addVocab({ word: word.trim(), note: note.trim() || undefined, context: isRw(question) ? question.passage : question.stem, questionId: question.id });
    setAdded(true);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border p-3" style={{ borderColor: C.border, background: C.panel }}>
      <input value={word} onChange={(e) => setWord(e.target.value)} placeholder={lang === 'zh' ? '单词' : 'word'} className="w-40 rounded border px-2 py-1.5 text-[13px]" style={{ borderColor: C.border }} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={lang === 'zh' ? '释义 / 笔记（选填）' : 'meaning / note (optional)'} className="min-w-[160px] flex-1 rounded border px-2 py-1.5 text-[13px]" style={{ borderColor: C.border }} />
      <button type="button" onClick={save} className="rounded-full px-4 py-1.5 text-[13px] font-bold text-white" style={{ background: C.blue }}>{lang === 'zh' ? '保存' : 'Save'}</button>
      <button type="button" onClick={() => setOpen(false)} className="text-[12px]" style={{ color: C.muted }}>{COMMON[lang].cancel}</button>
    </div>
  );
}
