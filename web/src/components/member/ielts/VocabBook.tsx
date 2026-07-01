'use client';

import { useCallback, useEffect, useState } from 'react';
import { addVocab, listVocab, removeVocab, type VocabEntry } from '@/lib/ielts/progress';

/**
 * 生词本 — the IELTS Practice Center vocabulary book. Words saved from Reading
 * passages (a "+ Save word" affordance will be wired into Reading later) collect
 * here as a review list. A "Test me" toggle hides every meaning so the student
 * can self-quiz, revealing one card at a time. Mirrors the SAT VocabBook.
 *
 * The store lives in localStorage and fires the 'ngs-ielts-progress' window event
 * on every write, so this panel re-reads on that event to stay live.
 */
export function VocabBook({ onBack, lang }: { onBack: () => void; lang: 'en' | 'zh' }) {
  const t = useCallback((en: string, zh: string) => (lang === 'zh' ? zh : en), [lang]);

  const [words, setWords] = useState<VocabEntry[]>([]);
  const [quiz, setQuiz] = useState(false);

  // form state for the inline adder
  const [newWord, setNewWord] = useState('');
  const [newNote, setNewNote] = useState('');

  const refresh = useCallback(() => setWords(listVocab()), []);

  useEffect(() => {
    refresh();
    window.addEventListener('ngs-ielts-progress', refresh);
    return () => window.removeEventListener('ngs-ielts-progress', refresh);
  }, [refresh]);

  const add = () => {
    const w = newWord.trim();
    if (!w) return;
    addVocab({ word: w, note: newNote.trim() || undefined });
    setNewWord('');
    setNewNote('');
    refresh(); // addVocab fires the event too, but refresh keeps it snappy same-tab
  };

  const inputCls =
    'rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40';
  const btnCls = 'rounded-full border border-white/20 px-3 py-1 text-xs hover:border-white/50';

  return (
    <div className="ngs-redesign fixed inset-0 z-[60] overflow-y-auto">
      <div className="relative min-h-full bg-night font-sans text-white antialiased">
        {/* top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 bg-night/80 px-6 py-4 backdrop-blur">
          <button type="button" onClick={onBack} className={btnCls}>
            ‹ {t('Back', '返回')}
          </button>
          <h1 className="font-grotesk text-lg font-bold tracking-tight">
            {t('Vocabulary', '生词本')}
          </h1>
          <span className="text-sm text-white/60">
            {words.length} {t(words.length === 1 ? 'word' : 'words', '个词')}
          </span>
          {words.length > 0 && (
            <label className="ml-auto flex cursor-pointer select-none items-center gap-2 text-sm text-white/60">
              <input
                type="checkbox"
                checked={quiz}
                onChange={(e) => setQuiz(e.target.checked)}
                className="h-4 w-4 accent-ngs-cyan"
              />
              {t('Test me (hide meanings)', '测试模式（隐藏释义）')}
            </label>
          )}
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* inline adder */}
          <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
              }}
              placeholder={t('Word', '单词')}
              className={`${inputCls} w-40`}
            />
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
              }}
              placeholder={t('Meaning / note (optional)', '释义 / 笔记（选填）')}
              className={`${inputCls} min-w-[180px] flex-1`}
            />
            <button
              type="button"
              onClick={add}
              disabled={!newWord.trim()}
              className="rounded-full border border-ngs-cyan/40 bg-ngs-cyan/10 px-4 py-2 text-sm font-semibold text-ngs-cyan hover:border-ngs-cyan/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('Add word', '添加')}
            </button>
          </div>

          {words.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
              <p className="text-white/80">
                {t('No words saved yet.', '还没有生词。')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {t(
                  'Words you save from Reading passages will collect here — a “+ Save word” button will be wired into Reading soon. Meanwhile, add words manually above.',
                  '在阅读文章里收藏的单词会汇集到这里 —— 阅读界面的“+ 收藏单词”按钮稍后接入。你也可以先在上方手动添加。',
                )}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {words.map((v) => (
                <VocabCard
                  key={v.word}
                  v={v}
                  quiz={quiz}
                  lang={lang}
                  onRemove={() => {
                    removeVocab(v.word);
                    refresh();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VocabCard({
  v,
  quiz,
  lang,
  onRemove,
}: {
  v: VocabEntry;
  quiz: boolean;
  lang: 'en' | 'zh';
  onRemove: () => void;
}) {
  const t = (en: string, zh: string) => (lang === 'zh' ? zh : en);
  const [show, setShow] = useState(false);
  const hidden = quiz && !show;

  const provenance =
    v.book && v.test != null ? t(`Cam ${v.book} · Test ${v.test}`, `剑${v.book} · Test ${v.test}`) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg font-bold text-white">{v.word}</div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-xs text-white/40 hover:text-white/80"
        >
          {t('Remove', '删除')}
        </button>
      </div>

      {hidden ? (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="mt-2 rounded-full border border-white/20 px-3 py-1 text-xs hover:border-white/50"
        >
          {t('Show', '显示释义')}
        </button>
      ) : (
        <>
          {v.note && <div className="mt-1 text-sm text-white/90">{v.note}</div>}
          {v.context && (
            <div className="mt-2 text-xs italic leading-relaxed text-white/60">
              “{v.context.length > 200 ? `${v.context.slice(0, 200)}…` : v.context}”
            </div>
          )}
        </>
      )}

      {provenance && (
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ngs-cyan">
          {provenance}
        </div>
      )}
    </div>
  );
}
