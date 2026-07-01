'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import rawTest from './data/cam15-test1-writing.json';
import type { ColorTheme, TextSize, WritingTest } from './types';
import { SettingsPanel, SIZE, THEME, TopBar, useCountdown } from './shared';
import { recordAiAttempt } from '@/lib/ielts/progress';

const test = rawTest as unknown as WritingTest;

const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

// Mirror of the server `WritingBands` shape (examiner.ts is server-only, so it
// can't be imported here). The grade route guarantees this shape.
type Bilingual = { en: string; zh: string };
type WTask = { ta?: number; tr?: number; cc: number; lr: number; gra: number; band: number; feedback: Bilingual };
type WBands = {
  task1: WTask | null;
  task2: WTask | null;
  overall: number;
  recommendations: Bilingual[];
  summary: Bilingual;
};

export function WritingSection({
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
  const [active, setActive] = useState(1);
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState(false);
  const [bands, setBands] = useState<WBands | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [timerHidden, setTimerHidden] = useState(false);

  const task = test.tasks.find((t) => t.task === active)!;
  const th = THEME[theme];
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Cut / Copy / Paste — the signature CD-IELTS editor toolbar. Native Ctrl+X/C/V
  // keep working too; these buttons mirror the real on-screen affordance.
  const sel = () => {
    const ta = taRef.current;
    return ta ? { ta, s: ta.selectionStart, e: ta.selectionEnd } : null;
  };
  const doCopy = useCallback(async () => {
    const x = sel();
    if (!x || x.s === x.e) return;
    try { await navigator.clipboard.writeText((texts[active] || '').slice(x.s, x.e)); } catch { /* clipboard blocked */ }
    x.ta.focus();
  }, [texts, active]);
  const doCut = useCallback(async () => {
    const x = sel();
    if (!x || x.s === x.e) return;
    const v = texts[active] || '';
    try { await navigator.clipboard.writeText(v.slice(x.s, x.e)); } catch { /* clipboard blocked */ }
    setTexts((t) => ({ ...t, [active]: v.slice(0, x.s) + v.slice(x.e) }));
    requestAnimationFrame(() => { x.ta.focus(); x.ta.setSelectionRange(x.s, x.s); });
  }, [texts, active]);
  const doPaste = useCallback(async () => {
    const x = sel();
    if (!x) return;
    let clip = '';
    try { clip = await navigator.clipboard.readText(); } catch { return; }
    const v = texts[active] || '';
    setTexts((t) => ({ ...t, [active]: v.slice(0, x.s) + clip + v.slice(x.e) }));
    const pos = x.s + clip.length;
    requestAnimationFrame(() => { x.ta.focus(); x.ta.setSelectionRange(pos, pos); });
  }, [texts, active]);
  const counts = useMemo(
    () => test.tasks.map((t) => ({ task: t.task, words: wordCount(texts[t.task] || ''), min: t.minWords })),
    [texts],
  );

  const runGrade = useCallback(async (answers: Record<number, string>) => {
    const t1 = test.tasks.find((t) => t.task === 1);
    const t2 = test.tasks.find((t) => t.task === 2);
    const body = {
      task1: t1 ? { prompt: t1.prompt, response: answers[1] || '', minWords: t1.minWords } : undefined,
      task2: t2 ? { prompt: t2.prompt, response: answers[2] || '', minWords: t2.minWords } : undefined,
    };
    setGrading(true);
    setGradeError(null);
    setBands(null);
    try {
      const res = await fetch('/api/ielts/grade-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'grade_failed');
      }
      const graded = (await res.json()) as WBands;
      setBands(graded);
      recordAiAttempt({ skill: 'writing', band: graded.overall, book: String(test.book), test: test.test });
    } catch (e) {
      setGradeError(
        String(e).includes('grader_unavailable')
          ? 'The AI marker is unavailable right now. Your work is safe — try grading again in a moment.'
          : 'Could not grade this attempt. Please try again.',
      );
    } finally {
      setGrading(false);
    }
  }, []);

  const submit = useCallback(() => {
    setSubmitted(true);
    const hasWriting = wordCount(texts[1] || '') > 0 || wordCount(texts[2] || '') > 0;
    if (hasWriting) void runGrade(texts);
  }, [texts, runGrade]);

  const [secs, setSecs] = useCountdown(test.timeLimitMinutes * 60, !submitted, submit);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <TopBar label={`IELTS Academic Writing — Task ${active}`} secs={secs} hidden={timerHidden} toggleHidden={() => setTimerHidden((v) => !v)} onSettings={() => setSettingsOpen(true)} onExit={onExit} />

      <div className="flex min-h-0 flex-1" style={{ background: th.bg, color: th.fg }}>
        {/* prompt */}
        <section className="min-h-0 w-[46%] overflow-y-auto border-r-2 border-[#cfcfcf] px-6 py-5" style={{ fontSize: SIZE[size], lineHeight: 1.6 }}>
          <p className="mb-2 text-[0.8em] font-bold uppercase tracking-wide opacity-70">Writing Task {task.task}</p>
          <p className="mb-3 text-[0.85em] opacity-75">You should spend about {task.minutes} minutes on this task. Write at least {task.minWords} words.</p>
          <p className="mb-4 whitespace-pre-wrap">{task.prompt}</p>
          {task.figureImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={task.figureImage} alt={task.figureAlt ?? 'Task 1 figure'} className="w-full rounded border border-current/15 bg-white" />
          ) : null}
        </section>

        {/* answer */}
        <section className="flex min-h-0 flex-1 flex-col px-6 py-5">
          <div className="mb-2 flex items-center gap-1">
            {([['Cut', doCut], ['Copy', doCopy], ['Paste', doPaste]] as const).map(([label, fn]) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void fn()}
                className="rounded border border-current/30 px-3 py-1 text-[0.8em] hover:bg-current/10"
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            ref={taRef}
            value={texts[active] || ''}
            onChange={(e) => setTexts((t) => ({ ...t, [active]: e.target.value }))}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Type your answer here…"
            className="min-h-0 flex-1 resize-none rounded border border-current/30 p-3 text-[0.95em] leading-relaxed outline-none focus:border-[#1565c0]"
            style={{ background: th.input, color: th.fg, fontSize: SIZE[size] }}
          />
        </section>
      </div>

      {/* bottom bar: word count (lower-left, as in the real test) + task tabs */}
      <footer className="flex shrink-0 items-center gap-4 border-t border-[#c8c8c8] bg-[#ececec] px-4 py-2 text-[#222]">
        <span className="shrink-0 text-[13px] font-bold tabular-nums">Word Count: {wordCount(texts[active] || '')}</span>
        <div className="flex items-center gap-1">
          {test.tasks.map((t) => (
            <button
              key={t.task}
              type="button"
              onClick={() => setActive(t.task)}
              className={`rounded border px-3 py-1 text-[12px] ${
                active === t.task ? 'border-[#1976d2] bg-[#d6e4f5] font-bold' : 'border-[#bbb] bg-white'
              }`}
            >
              Part {t.task}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => { if (window.confirm('End the test now and mark your writing?')) submit(); }}
            className="h-7 rounded bg-[#1565c0] px-3 text-[12px] font-bold text-white hover:bg-[#0f4ea0]"
          >
            End test
          </button>
        </div>
      </footer>

      {settingsOpen ? <SettingsPanel theme={theme} setTheme={setTheme} size={size} setSize={setSize} onClose={() => setSettingsOpen(false)} /> : null}

      {submitted ? (
        <WritingReport
          counts={counts}
          grading={grading}
          bands={bands}
          error={gradeError}
          onRetry={() => void runGrade(texts)}
          onKeepWriting={() => setSubmitted(false)}
          onRestart={() => {
            setTexts({});
            setBands(null);
            setGradeError(null);
            setSecs(test.timeLimitMinutes * 60);
            setActive(1);
            setSubmitted(false);
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------- assessment report ---------- */

function BandPill({ label, score }: { label: string; score?: number }) {
  return (
    <div className="rounded bg-[#eef3fb] px-2 py-1.5 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#5b6b80]">{label}</div>
      <div className="text-[16px] font-bold leading-tight text-[#0f4ea0]">{typeof score === 'number' ? score.toFixed(1) : '—'}</div>
    </div>
  );
}

function Bi({ value }: { value?: Bilingual }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      {value.en ? <p className="text-[13px] leading-relaxed text-[#333]">{value.en}</p> : null}
      {value.zh ? <p className="text-[13px] leading-relaxed text-[#555]" lang="zh">{value.zh}</p> : null}
    </div>
  );
}

function TaskCard({ n, t, words, min }: { n: 1 | 2; t: WTask; words: number; min: number }) {
  const firstLabel = n === 1 ? 'Task Achiev.' : 'Task Resp.';
  const firstScore = n === 1 ? t.ta : t.tr;
  return (
    <div className="rounded-lg border border-[#e3e3e3] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-bold">Task {n}</h4>
        <div className="flex items-center gap-3 text-[12px]">
          <span className={`tabular-nums ${words >= min ? 'text-[#1b7a32]' : 'text-[#c8102e]'}`}>
            {words} words {words >= min ? `✓` : `· under ${min}`}
          </span>
          <span className="rounded bg-[#d6e4f5] px-2 py-0.5 font-bold text-[#0f4ea0]">Band {t.band.toFixed(1)}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <BandPill label={firstLabel} score={firstScore} />
        <BandPill label="Coh./Coh." score={t.cc} />
        <BandPill label="Lexis" score={t.lr} />
        <BandPill label="Grammar" score={t.gra} />
      </div>
      <div className="mt-3">
        <Bi value={t.feedback} />
      </div>
    </div>
  );
}

function WritingReport({
  counts,
  grading,
  bands,
  error,
  onRetry,
  onKeepWriting,
  onRestart,
}: {
  counts: { task: number; words: number; min: number }[];
  grading: boolean;
  bands: WBands | null;
  error: string | null;
  onRetry: () => void;
  onKeepWriting: () => void;
  onRestart: () => void;
}) {
  const wordsOf = (n: number) => counts.find((c) => c.task === n)?.words ?? 0;
  const minOf = (n: number) => counts.find((c) => c.task === n)?.min ?? (n === 1 ? 150 : 250);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[88vh] w-[640px] flex-col rounded bg-white text-[#222] shadow-2xl" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="flex items-center justify-between border-b border-[#ddd] p-5">
          <div>
            <h3 className="text-[18px] font-bold">Writing — assessment</h3>
            <p className="mt-1 text-[13px] text-[#666]">Cambridge IELTS 15 · Academic Writing · Test 1</p>
          </div>
          {bands ? (
            <div className="rounded bg-[#d6e4f5] px-4 py-2 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#1565c0]">Overall band</div>
              <div className="text-[30px] font-bold leading-none text-[#0f4ea0]">{bands.overall.toFixed(1)}</div>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {grading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1565c0] border-t-transparent" />
              <p className="text-[14px] font-bold">Marking against the IELTS band descriptors…</p>
              <p className="text-[12px] text-[#777]">正在按照雅思评分标准批改，请稍候。</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-[14px] text-[#c8102e]">{error}</p>
              <button type="button" onClick={onRetry} className="mt-4 rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">Try grading again</button>
            </div>
          ) : bands ? (
            <div className="space-y-4">
              {bands.summary && (bands.summary.en || bands.summary.zh) ? (
                <div className="rounded-lg bg-[#f7f9fc] p-4">
                  <Bi value={bands.summary} />
                </div>
              ) : null}

              {bands.task1 ? <TaskCard n={1} t={bands.task1} words={wordsOf(1)} min={minOf(1)} /> : null}
              {bands.task2 ? <TaskCard n={2} t={bands.task2} words={wordsOf(2)} min={minOf(2)} /> : null}

              {bands.recommendations?.length ? (
                <div className="rounded-lg border border-[#e3e3e3] p-4">
                  <h4 className="mb-2 text-[14px] font-bold">How to do better next time · 下次如何提高</h4>
                  <ol className="space-y-3">
                    {bands.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1565c0] text-[11px] font-bold text-white">{i + 1}</span>
                        <Bi value={r} />
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <p className="text-[12px] leading-relaxed text-[#888]">
                AI practice estimate following the IELTS Writing band descriptors (Task Achievement/Response, Coherence &amp;
                Cohesion, Lexical Resource, Grammatical Range &amp; Accuracy; Task 2 weighted double). Not an official IELTS score.
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              <p className="text-[14px] font-bold">Nothing to mark yet</p>
              <p className="text-[13px] text-[#666]">Write at least one task, then submit for marking.</p>
              {counts.map((c) => (
                <div key={c.task} className="flex items-center justify-between rounded border border-[#eee] px-3 py-2 text-[14px]">
                  <span className="font-bold">Task {c.task}</span>
                  <span className="tabular-nums">{c.words} words</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#ddd] p-4">
          <button type="button" onClick={onKeepWriting} className="rounded border border-[#bbb] bg-[#f6f6f6] px-4 py-2 text-[13px] hover:bg-[#e2e2e2]">Keep writing</button>
          <button type="button" onClick={onRestart} className="rounded bg-[#1565c0] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0f4ea0]">Restart</button>
        </div>
      </div>
    </div>
  );
}
