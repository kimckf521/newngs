'use client';

import type { SatQuestion } from '@/lib/sat/types';
import { isRw, isSpr } from '@/lib/sat/types';
import { gradeSpr, isValidSprEntry } from '@/lib/sat/scoring';
import { C, SERIF, ChoiceList, QuestionChip } from './shared';
import { useSatLang, COMMON, domLabel, skillLabel, diffLabel } from './i18n';
import { AskAI } from './AskAI';
import { useSelectionMenu } from './SelectionMenu';

/**
 * A self-contained question card with INSTANT feedback — used by skill-drill
 * practice and the mistake notebook. Single-column (passage on top for RW),
 * reveals correct/incorrect + the bilingual explanation once `revealed`.
 */
export function PracticeQuestion({
  question, number, selected, onSelect, revealed, extra, aiChosen, enableAi = true,
}: {
  question: SatQuestion;
  number?: number;
  selected?: string;
  onSelect: (v: string) => void;
  revealed: boolean;
  extra?: React.ReactNode; // e.g. a "+ vocab" affordance (top-right)
  aiChosen?: string; // the student's actual (wrong) answer, for AI context
  enableAi?: boolean;
}) {
  const { lang } = useSatLang();
  const { onContextMenu: onSelectionContextMenu, overlay: selectionOverlay } = useSelectionMenu();
  const spr = isSpr(question);
  const correctMc = !spr ? (question as { correct?: string }).correct : undefined;

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {number ? <QuestionChip n={number} /> : null}
        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: C.tint, color: C.blue }}>
          {domLabel(question.domain, lang)}
        </span>
        <span className="text-[11px]" style={{ color: C.muted }}>{skillLabel(question.skill, lang)} · {diffLabel(question.difficulty, lang)}</span>
        <div className="ml-auto">{extra}</div>
      </div>

      {isRw(question) ? (
        <div onContextMenu={onSelectionContextMenu} className="mb-4 rounded-lg border p-5 text-[16px] leading-[1.7]" style={{ borderColor: C.hairline, background: C.raised, fontFamily: SERIF, color: C.ink, whiteSpace: 'pre-wrap' }}>
          {question.passage}
          {question.passageB ? <div className="mt-4 border-t pt-4" style={{ borderColor: C.hairline }}>{question.passageB}</div> : null}
        </div>
      ) : null}

      <p onContextMenu={onSelectionContextMenu} className="text-[17px] font-semibold leading-relaxed" style={{ color: C.ink, fontFamily: isRw(question) ? undefined : SERIF }}>{question.stem}</p>

      {spr ? (
        <SprPractice value={selected || ''} onChange={onSelect} revealed={revealed} q={question as SatQuestion & { answer: { accepted: string[] } }} />
      ) : (
        <ChoiceList
          choices={(question as { choices: { id: string; text: string }[] }).choices}
          selected={selected}
          onSelect={onSelect}
          eliminatorOn={false}
          eliminated={new Set()}
          onToggleEliminate={() => {}}
          serif={isRw(question)}
          reveal={revealed}
          correct={correctMc}
        />
      )}

      {revealed && question.explanation ? (
        <div className="mt-5 rounded-lg border p-4 text-[14px] leading-relaxed" style={{ borderColor: C.border, background: C.panel2, color: C.ink, whiteSpace: 'pre-wrap' }}>
          <div className="mb-1 font-bold">{lang === 'zh' ? '解析' : 'Explanation'}</div>
          {question.explanation}
        </div>
      ) : null}

      {revealed && enableAi ? <AskAI question={question} chosen={aiChosen ?? selected} /> : null}

      {selectionOverlay}
    </div>
  );
}

function SprPractice({ value, onChange, revealed, q }: { value: string; onChange: (v: string) => void; revealed: boolean; q: SatQuestion & { answer: { accepted: string[] } } }) {
  const { lang } = useSatLang();
  const t = COMMON[lang];
  const correct = revealed ? gradeSpr(value, q.answer) : false;
  return (
    <div className="mt-4 max-w-sm">
      <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: C.muted }}>{t.enterAnswer}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={revealed}
        onChange={(e) => { if (isValidSprEntry(e.target.value)) onChange(e.target.value); }}
        className="w-full rounded-md border px-3 py-2.5 text-[18px] tabular-nums outline-none"
        style={{ borderColor: revealed ? (correct ? C.good : C.flag) : C.border, color: C.ink }}
        placeholder="e.g. 3.5 or 7/2"
      />
      {revealed ? (
        <div className="mt-2 text-[13px] font-semibold" style={{ color: correct ? C.good : C.flag }}>
          {correct ? t.correct : `${t.incorrect} — ${t.accepted}: ${q.answer.accepted.join(', ')}`}
        </div>
      ) : null}
    </div>
  );
}
