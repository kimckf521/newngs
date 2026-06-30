'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SatForm, SatQuestion, SatModule, SatModuleResult, SatScores } from '@/lib/sat/types';
import { isMc, isSpr, isRw, DOMAIN_LABEL, SECTION_LABEL, type SatDomain } from '@/lib/sat/types';
import { gradeSpr, ROUTE_LABEL } from '@/lib/sat/scoring';
import { C, SAT_FONT } from './shared';

function gradeAnswer(q: SatQuestion, answer?: string): boolean {
  if (answer == null || answer === '') return false;
  if (isMc(q)) return answer === (q as { correct: string }).correct;
  if (isSpr(q)) return gradeSpr(answer, q.answer);
  return false;
}

function correctOf(q: SatQuestion): string {
  if (isMc(q)) return (q as { correct: string }).correct;
  if (isSpr(q)) return q.answer.accepted[0] ?? '';
  return '';
}

export function ResultsScreen({
  form, questionsById, results, scores, rwRoute, mathRoute, onPersist, onRestart,
}: {
  form: SatForm;
  questionsById: Map<string, SatQuestion>;
  results: SatModuleResult[];
  scores: SatScores;
  rwRoute: 'upper' | 'lower';
  mathRoute: 'upper' | 'lower';
  onPersist: () => void;
  onRestart: () => void;
}) {
  const [tab, setTab] = useState<'summary' | 'review'>('summary');
  useEffect(() => { onPersist(); /* once */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moduleById = useMemo(() => {
    const m = new Map<string, SatModule>();
    Object.values(form.modules).forEach((mod) => m.set(mod.id, mod));
    return m;
  }, [form]);

  // domain accuracy across all answered modules
  const domainStats = useMemo(() => {
    const stat = new Map<SatDomain, { correct: number; total: number }>();
    for (const res of results) {
      const mod = moduleById.get(res.moduleId);
      if (!mod) continue;
      for (const qid of mod.questionIds) {
        const q = questionsById.get(qid);
        if (!q) continue;
        const cur = stat.get(q.domain) || { correct: 0, total: 0 };
        cur.total += 1;
        if (gradeAnswer(q, res.answers[qid])) cur.correct += 1;
        stat.set(q.domain, cur);
      }
    }
    return Array.from(stat.entries());
  }, [results, moduleById, questionsById]);

  return (
    <div className="sat-app fixed inset-0 z-[60] flex flex-col overflow-y-auto" style={{ background: '#f4f5f8', color: C.ink, fontFamily: SAT_FONT }}>
      <header className="flex h-[60px] shrink-0 items-center justify-between px-6" style={{ background: '#fff', borderBottom: `1px solid ${C.hairline}` }}>
        <span className="text-[15px] font-bold">Score Report — {form.name}</span>
        <button type="button" onClick={onRestart} className="rounded-full px-4 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>Back to Start</button>
      </header>

      <div className="mx-auto w-[min(880px,94vw)] py-8">
        {/* total score */}
        <div className="rounded-2xl border bg-white p-7 text-center" style={{ borderColor: C.border }}>
          <div className="text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Estimated Total Score</div>
          <div className="mt-1 text-[68px] font-extrabold leading-none" style={{ color: C.blueDeep }}>{scores.total}</div>
          <div className="text-[13px]" style={{ color: C.muted }}>out of 1600</div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ScoreCard label="Reading and Writing" value={scores.rw} route={rwRoute} />
            <ScoreCard label="Math" value={scores.math} route={mathRoute} />
          </div>
          <p className="mx-auto mt-5 max-w-lg text-[12px] leading-relaxed" style={{ color: C.muted }}>
            Estimated via a transparent model (raw → 200–800 per section), not official College Board equating. The
            second module was {rwRoute === 'upper' ? 'the harder' : 'the easier'} form in RW and {mathRoute === 'upper' ? 'the harder' : 'the easier'} form in Math.
          </p>
        </div>

        {/* tabs */}
        <div className="mt-6 flex gap-2">
          {(['summary', 'review'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="rounded-full px-5 py-2 text-[14px] font-semibold capitalize"
              style={{ background: tab === t ? C.blue : '#fff', color: tab === t ? '#fff' : C.ink, border: `1px solid ${tab === t ? C.blue : C.border}` }}>
              {t === 'summary' ? 'Skills Breakdown' : 'Review Questions'}
            </button>
          ))}
        </div>

        {tab === 'summary' ? (
          <div className="mt-4 overflow-hidden rounded-xl border bg-white" style={{ borderColor: C.border }}>
            {domainStats.map(([domain, s]) => {
              const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
              return (
                <div key={domain} className="flex items-center gap-4 border-b px-5 py-3 last:border-b-0" style={{ borderColor: C.hairline }}>
                  <div className="w-56 shrink-0 text-[14px] font-semibold">{DOMAIN_LABEL[domain]}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: '#eceef3' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? '#1a8a4a' : pct >= 40 ? C.blue : C.flag }} />
                  </div>
                  <div className="w-20 shrink-0 text-right text-[13px] tabular-nums" style={{ color: C.muted }}>{s.correct}/{s.total} · {pct}%</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {results.map((res) => {
              const mod = moduleById.get(res.moduleId);
              if (!mod) return null;
              return (
                <div key={res.moduleId}>
                  <div className="mb-2 text-[14px] font-bold" style={{ color: C.blueDeep }}>
                    {SECTION_LABEL[res.section]} — Module {res.index} {res.route !== 'fixed' ? `(${ROUTE_LABEL[res.route]})` : ''}
                  </div>
                  <div className="space-y-2">
                    {mod.questionIds.map((qid, i) => {
                      const q = questionsById.get(qid);
                      if (!q) return null;
                      const yours = res.answers[qid];
                      const ok = gradeAnswer(q, yours);
                      return <ReviewCard key={qid} n={i + 1} q={q} yours={yours} ok={ok} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, route }: { label: string; value: number; route: 'upper' | 'lower' }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.border }}>
      <div className="text-[13px] font-semibold" style={{ color: C.muted }}>{label}</div>
      <div className="mt-1 text-[40px] font-extrabold leading-none" style={{ color: C.blue }}>{value}</div>
      <div className="mt-1 text-[11px]" style={{ color: C.muted }}>200–800 · {route === 'upper' ? 'harder' : 'easier'} Module 2</div>
    </div>
  );
}

function ReviewCard({ n, q, yours, ok }: { n: number; q: SatQuestion; yours?: string; ok: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-white" style={{ borderColor: C.border }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: ok ? '#1a8a4a' : C.flag }}>{ok ? '✓' : '✕'}</span>
        <span className="text-[14px] font-semibold" style={{ color: C.ink }}>Question {n}</span>
        <span className="ml-auto text-[12px]" style={{ color: C.muted }}>
          Your answer: <b style={{ color: ok ? '#1a8a4a' : C.flag }}>{yours || '—'}</b> · Correct: <b>{correctOf(q)}</b>
        </span>
      </button>
      {open ? (
        <div className="border-t px-4 py-3 text-[13px] leading-relaxed" style={{ borderColor: C.hairline, color: C.ink }}>
          {isRw(q) ? <p className="mb-2 whitespace-pre-wrap italic" style={{ color: C.muted }}>{q.passage}</p> : null}
          <p className="font-semibold">{q.stem}</p>
          {q.explanation ? <p className="mt-2" style={{ color: C.muted }}>{q.explanation}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
