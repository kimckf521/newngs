'use client';

import type { SatMathQuestion } from '@/lib/sat/types';
import { isSpr } from '@/lib/sat/types';
import { gradeSpr, isValidSprEntry } from '@/lib/sat/scoring';
import { C, SERIF, ChoiceList, QuestionChip, MarkForReview, EliminatorToggle } from './shared';
import { useSatLang, COMMON } from './i18n';

export function MathModule({
  question, number, answer, onAnswer, marked, onToggleMark,
  eliminatorOn, setEliminatorOn, eliminated, onToggleEliminate, reveal,
}: {
  question: SatMathQuestion;
  number: number;
  answer?: string;
  onAnswer: (v: string) => void;
  marked: boolean;
  onToggleMark: () => void;
  eliminatorOn: boolean;
  setEliminatorOn: (v: boolean) => void;
  eliminated: Set<string>;
  onToggleEliminate: (id: string) => void;
  reveal?: boolean;
}) {
  const { lang } = useSatLang();
  const spr = isSpr(question);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[760px] px-7 py-6">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: C.hairline }}>
          <div className="flex items-center gap-3">
            <QuestionChip n={number} />
            <MarkForReview on={marked} onToggle={onToggleMark} />
          </div>
          {!spr ? <EliminatorToggle on={eliminatorOn} onToggle={() => setEliminatorOn(!eliminatorOn)} /> : null}
        </div>

        <p className="mt-5 whitespace-pre-wrap text-[18px] leading-relaxed" style={{ color: C.ink, fontFamily: SERIF }}>{question.stem}</p>

        {question.figureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={question.figureUrl} alt={question.figureAlt || ''} className="mt-4 max-h-[320px] rounded border" style={{ borderColor: C.hairline }} />
        ) : null}

        {spr ? (
          <SprInput value={answer || ''} onChange={onAnswer} reveal={reveal} question={question} />
        ) : (
          <>
            <ChoiceList
              choices={question.format === 'mc' ? question.choices : []}
              selected={answer}
              onSelect={onAnswer}
              eliminatorOn={eliminatorOn}
              eliminated={eliminated}
              onToggleEliminate={onToggleEliminate}
              reveal={reveal}
              correct={question.format === 'mc' ? question.correct : undefined}
            />
          </>
        )}

        {reveal && question.explanation ? (
          <div className="mt-5 rounded-lg border p-4 text-[14px] leading-relaxed" style={{ borderColor: C.border, background: C.panel2, color: C.ink }}>
            <div className="mb-1 font-bold">{COMMON[lang].explanation}</div>
            {question.explanation}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SprInput({
  value, onChange, reveal, question,
}: {
  value: string;
  onChange: (v: string) => void;
  reveal?: boolean;
  question: SatMathQuestion & { format: 'spr' };
}) {
  const { lang } = useSatLang();
  const t = COMMON[lang];
  const correct = reveal ? gradeSpr(value, question.answer) : false;
  return (
    <div className="mt-6 max-w-sm">
      <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: C.muted }}>{t.enterAnswer}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={reveal}
        onChange={(e) => {
          const v = e.target.value;
          if (isValidSprEntry(v)) onChange(v);
        }}
        className="w-full rounded-md border px-3 py-2.5 text-[18px] tabular-nums outline-none"
        style={{ borderColor: reveal ? (correct ? C.good : C.flag) : C.border, color: C.ink }}
        placeholder={lang === 'zh' ? '例如 3.5 或 7/2' : 'e.g. 3.5 or 7/2'}
      />
      <div className="mt-2 flex items-baseline gap-2 text-[14px]" style={{ color: C.muted }}>
        <span>{lang === 'zh' ? '答案预览：' : 'Answer Preview:'}</span>
        <span style={{ color: C.ink }}><PreviewValue raw={value} /></span>
      </div>
      {reveal ? (
        <div className="mt-2 text-[13px] font-semibold" style={{ color: correct ? C.good : C.flag }}>
          {correct
            ? t.correct
            : `${t.incorrect} — ${t.accepted}: ${question.answer.accepted.join(', ')}`}
        </div>
      ) : null}
    </div>
  );
}

/** Render the typed answer back, stacking a fraction like Bluebook's preview. */
function PreviewValue({ raw }: { raw: string }) {
  const s = (raw || '').trim();
  if (!s) return <span style={{ color: C.muted }}>—</span>;
  if (s.includes('/')) {
    const neg = s.startsWith('-');
    const body = neg ? s.slice(1) : s;
    const [n, d] = body.split('/');
    return (
      <span className="inline-flex items-center gap-1">
        {neg ? <span>−</span> : null}
        <span className="inline-flex flex-col items-center leading-none">
          <span className="px-1 text-[15px]">{n}</span>
          <span className="my-0.5 h-px w-full self-stretch" style={{ background: C.ink }} />
          <span className="px-1 text-[15px]">{d}</span>
        </span>
      </span>
    );
  }
  return <span className="text-[16px]">{s.replace('-', '−')}</span>;
}
