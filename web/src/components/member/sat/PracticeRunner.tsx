'use client';

import { useMemo, useRef, useState } from 'react';
import type { SatQuestion } from '@/lib/sat/types';
import { recordAnswer } from '@/lib/sat/progress';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, COMMON } from './i18n';
import { PracticeQuestion } from './PracticeQuestion';

/**
 * Untimed skill-drill runner: one question at a time, INSTANT feedback +
 * explanation after each "Check". Every answer flows through the progress store
 * (feeding the 错题本, dashboard, and spaced repetition). No timer, no
 * mark-for-review — this is focused practice, not a mock.
 */
export function PracticeRunner({
  questions, title, onExit, renderExtra,
}: {
  questions: SatQuestion[];
  title: string;
  onExit: () => void;
  renderExtra?: (q: SatQuestion, revealed: boolean) => React.ReactNode;
}) {
  const { lang } = useSatLang();
  const t = COMMON[lang];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const shownAt = useRef<number>(Date.now());

  const total = questions.length;
  const q = questions[index];
  const isChecked = q ? checked.has(q.id) : false;
  const answered = q ? Boolean(answers[q.id]) : false;

  function check() {
    if (!q || !answered) return;
    const ms = Date.now() - shownAt.current;
    const wasCorrect = recordAnswer(q, answers[q.id], 'practice', ms);
    setChecked((s) => new Set(s).add(q.id));
    if (wasCorrect) setCorrectIds((s) => new Set(s).add(q.id));
  }
  function next() {
    if (index < total - 1) { setIndex(index + 1); shownAt.current = Date.now(); }
    else setDone(true);
  }

  const summary = useMemo(() => ({ correct: correctIds.size, total: checked.size }), [correctIds, checked]);

  if (!total) {
    return (
      <Shell title={title} onExit={onExit}>
        <div className="grid flex-1 place-items-center text-[15px]" style={{ color: C.muted }}>{lang === 'zh' ? '没有符合此筛选条件的题目。' : 'No questions match this selection.'}</div>
      </Shell>
    );
  }

  if (done) {
    const pct = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
    const missed = questions.filter((x) => checked.has(x.id) && !correctIds.has(x.id));
    return (
      <Shell title={title} onExit={onExit}>
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>{lang === 'zh' ? '练习完成' : 'Practice complete'}</div>
          <div className="mt-2 text-[56px] font-extrabold leading-none" style={{ color: pct >= 70 ? C.good : pct >= 40 ? C.blue : C.flag }}>{summary.correct}/{summary.total}</div>
          <div className="text-[14px]" style={{ color: C.muted }}>{lang === 'zh' ? `正确率 ${pct}%` : `${pct}% correct`}</div>
          {missed.length ? (
            <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
              {lang === 'zh' ? (
                <>已将 {missed.length} 题加入你的 <b style={{ color: C.ink }}>错题本 (Mistake Notebook)</b> 以供复习。</>
              ) : (
                <>{missed.length} added to your <b style={{ color: C.ink }}>Mistake Notebook (错题本)</b> for review.</>
              )}
            </p>
          ) : (
            <p className="mt-4 text-[14px]" style={{ color: C.good }}>{lang === 'zh' ? '全部答对 — 没有题目加入错题本。🎉' : 'Perfect set — nothing added to your notebook. 🎉'}</p>
          )}
          <button type="button" onClick={onExit} className="mt-7 rounded-full px-8 py-2.5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            {t.done}
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={title} onExit={onExit} progress={`${index + 1} / ${total}`} score={lang === 'zh' ? `正确 ${correctIds.size}` : `${correctIds.size} correct`}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <PracticeQuestion
          question={q}
          number={index + 1}
          selected={answers[q.id]}
          onSelect={(v) => { if (!isChecked) setAnswers((a) => ({ ...a, [q.id]: v })); }}
          revealed={isChecked}
          extra={renderExtra?.(q, isChecked)}
        />
      </div>
      <footer className="flex h-[64px] shrink-0 items-center justify-between px-5" style={{ borderTop: `1px solid ${C.hairline}`, background: C.panel }}>
        <div className="text-[13px]" style={{ color: C.muted }}>{isChecked ? (correctIds.has(q.id) ? (lang === 'zh' ? '✓ 正确' : '✓ Correct') : (lang === 'zh' ? '✕ 错误 — 查看解析' : '✕ Incorrect — see the explanation')) : ''}</div>
        {!isChecked ? (
          <button type="button" onClick={check} disabled={!answered}
            className="rounded-full px-8 py-2.5 text-[14px] font-bold text-white disabled:opacity-40" style={{ background: C.blue }}>
            {t.check}
          </button>
        ) : (
          <button type="button" onClick={next} className="rounded-full px-8 py-2.5 text-[14px] font-bold text-white" style={{ background: C.blue }}>
            {index < total - 1 ? t.nextQuestion : t.finish}
          </button>
        )}
      </footer>
    </Shell>
  );
}

function Shell({ title, onExit, progress, score, children }: { title: string; onExit: () => void; progress?: string; score?: string; children: React.ReactNode }) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col ${dark ? 'sat-dark' : ''}`} style={{ background: C.bg, color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center justify-between px-5" style={{ borderBottom: `1px solid ${C.hairline}` }}>
        <button type="button" onClick={onExit} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>‹ {lang === 'zh' ? '退出' : 'Exit'}</button>
        <div className="text-[14px] font-bold" style={{ color: C.ink }}>{title}</div>
        <div className="flex items-center gap-3 text-[13px]" style={{ color: C.muted }}>
          {score ? <span>{score}</span> : null}
          {progress ? <span className="rounded-md px-2 py-1 font-semibold" style={{ background: C.hover, color: C.ink }}>{progress}</span> : <span className="w-14" />}
          <ThemeLangToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
