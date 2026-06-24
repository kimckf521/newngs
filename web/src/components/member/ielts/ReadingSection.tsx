'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import rawTest from './data/cam15-test1-reading.json';
import type { ColorTheme, Passage, QGroup, ReadingTest, TextSize } from './types';
import { scoreGroup, type Verdict } from './scoring';
import {
  BottomNav, GroupView, ResultsOverlay, SettingsPanel, SIZE, THEME, TopBar, academicReadingBand, range, useCountdown,
} from './shared';

const test = rawTest as unknown as ReadingTest;

type Highlight = { para: string; start: number; end: number };

export function ReadingSection({
  theme,
  size,
  setTheme,
  setSize,
  onExit,
}: {
  theme: ColorTheme;
  size: TextSize;
  setTheme: (t: ColorTheme) => void;
  setSize: (s: TextSize) => void;
  onExit: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(1);
  const [split, setSplit] = useState(50);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hlMode, setHlMode] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [secs, setSecs] = useCountdown(test.timeLimitMinutes * 60, !submitted, () => setSubmitted(true));
  const [timerHidden, setTimerHidden] = useState(false);

  const passageById = useMemo(() => {
    const m = new Map<number, Passage>();
    test.passages.forEach((p) => m.set(p.id, p));
    return m;
  }, []);
  const groupOfQ = useMemo(() => {
    const m = new Map<number, QGroup>();
    test.questionGroups.forEach((g) => g.questions.forEach((q) => m.set(q.n, g)));
    return m;
  }, []);
  const currentPart = groupOfQ.get(current)?.passageId ?? 1;
  const passage = passageById.get(currentPart)!;
  const partGroups = test.questionGroups.filter((g) => g.passageId === currentPart);

  const setAnswer = useCallback((n: number, v: string) => setAnswers((a) => ({ ...a, [n]: v })), []);
  const toggleFlag = useCallback((n: number) => {
    setFlagged((f) => {
      const next = new Set(f);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }, []);
  const isAnswered = useCallback(
    (n: number) => {
      const g = groupOfQ.get(n)!;
      if (g.type === 'mcq' && /\bTWO\b/i.test(g.instructions)) {
        return (answers[g.questions[0].n] || '').split(',').filter(Boolean).length >= 2;
      }
      return !!answers[n];
    },
    [answers, groupOfQ]
  );

  const splitRef = useRef<HTMLDivElement>(null);
  const onDrag = useCallback(() => {
    const el = splitRef.current;
    if (!el) return;
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setSplit(Math.min(72, Math.max(28, ((ev.clientX - r.left) / r.width) * 100)));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!hlMode) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    const startEl = (r.startContainer.parentElement as HTMLElement)?.closest('[data-para]');
    if (!startEl || startEl !== (r.endContainer.parentElement as HTMLElement)?.closest('[data-para]')) return;
    const para = startEl.getAttribute('data-para')!;
    const pre = document.createRange();
    pre.selectNodeContents(startEl);
    pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    const end = start + r.toString().length;
    if (end > start) setHighlights((h) => [...h, { para, start, end }]);
    sel.removeAllRanges();
  }, [hlMode]);

  const verdicts = useMemo<Verdict[]>(
    () => (submitted ? test.questionGroups.flatMap((g) => scoreGroup(g, answers)) : []),
    [submitted, answers]
  );
  const score = verdicts.filter((v) => v.correct).length;
  const th = THEME[theme];
  const answeredCount = range(1, 40).filter(isAnswered).length;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <TopBar label="IELTS Academic Reading" secs={secs} hidden={timerHidden} toggleHidden={() => setTimerHidden((v) => !v)} onSettings={() => setSettingsOpen(true)} onExit={onExit} />

      <div ref={splitRef} className="relative flex min-h-0 flex-1" style={{ background: th.bg, color: th.fg }}>
        <section className="min-h-0 overflow-y-auto px-6 py-5" style={{ width: `${split}%`, fontSize: SIZE[size], lineHeight: 1.7 }} onMouseUp={onMouseUp}>
          <div className="mb-3 flex items-center justify-between border-b border-current/20 pb-2 text-[0.8em] opacity-90">
            <div>
              <span className="font-bold">Part {currentPart}</span>
              <span className="ml-2">Read the passage and answer the questions.</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setHlMode(!hlMode)} className={`rounded border px-2 py-0.5 text-[12px] ${hlMode ? 'border-[#caa800] bg-[#ffe680] text-[#5a4a00]' : 'border-current/30'}`} title="Select passage text to highlight">
                Highlight {hlMode ? 'on' : 'off'}
              </button>
              <button type="button" onClick={() => setHighlights([])} className="rounded border border-current/30 px-2 py-0.5 text-[12px]">Clear</button>
            </div>
          </div>
          <h2 className="mb-1 text-[1.35em] font-bold">{passage.title}</h2>
          {passage.subtitle ? <p className="mb-3 italic opacity-80">{passage.subtitle}</p> : null}
          <div className="space-y-3">
            {passage.paragraphs.map((p, i) => {
              const key = `${passage.id}-${i}`;
              return (
                <p key={key} className="flex gap-2">
                  {p.label ? <span className="shrink-0 font-bold">{p.label}</span> : null}
                  <span data-para={key} style={{ whiteSpace: 'pre-wrap' }}>
                    {renderHighlighted(p.text, highlights.filter((h) => h.para === key), th.mark)}
                  </span>
                </p>
              );
            })}
          </div>
        </section>

        <div onPointerDown={onDrag} className="group relative w-2 shrink-0 cursor-col-resize bg-[#cfcfcf]" title="Drag to resize">
          <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
            <span className="h-10 w-[3px] rounded bg-[#8a8a8a] group-hover:bg-[#555]" />
          </div>
        </div>

        <section className="min-h-0 flex-1 overflow-y-auto px-6 py-5" style={{ width: `${100 - split}%`, fontSize: SIZE[size], lineHeight: 1.6 }}>
          {partGroups.map((g) => (
            <GroupView key={g.range} group={g} answers={answers} setAnswer={setAnswer} current={current} setCurrent={setCurrent} submitted={submitted} inputBg={th.input} fg={th.fg} />
          ))}
        </section>
      </div>

      <BottomNav
        total={40}
        parts={[['Part 1', range(1, 13)], ['Part 2', range(14, 26)], ['Part 3', range(27, 40)]]}
        current={current}
        setCurrent={setCurrent}
        isAnswered={isAnswered}
        flagged={flagged}
        toggleFlag={toggleFlag}
        onSubmit={() => setSubmitted(true)}
      />

      {settingsOpen ? <SettingsPanel theme={theme} setTheme={setTheme} size={size} setSize={setSize} onClose={() => setSettingsOpen(false)} /> : null}

      {submitted ? (
        <ResultsOverlay
          title="Reading — results"
          subtitle="Cambridge IELTS 15 · Academic Reading · Test 1"
          score={score}
          total={40}
          band={academicReadingBand(score)}
          verdicts={verdicts}
          answered={answeredCount}
          onReview={() => setSubmitted(false)}
          onRestart={() => {
            setAnswers({});
            setFlagged(new Set());
            setHighlights([]);
            setSecs(test.timeLimitMinutes * 60);
            setCurrent(1);
            setSubmitted(false);
          }}
        />
      ) : null}
    </div>
  );
}

function renderHighlighted(text: string, ranges: Highlight[], mark: string) {
  if (ranges.length === 0) return text;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((r, i) => {
    if (r.start > cursor) out.push(text.slice(cursor, r.start));
    out.push(
      <mark key={i} style={{ background: mark, color: 'inherit', padding: '0 1px' }}>
        {text.slice(r.start, r.end)}
      </mark>
    );
    cursor = Math.max(cursor, r.end);
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}
