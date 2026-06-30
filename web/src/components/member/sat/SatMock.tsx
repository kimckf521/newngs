'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SatForm, SatQuestion, SatModule, SatModuleResult } from '@/lib/sat/types';
import { isMc, isSpr, SECTION_LABEL } from '@/lib/sat/types';
import { routeModule2, scaleSection, scaleTotal, gradeSpr } from '@/lib/sat/scoring';
import { loadRunnerForm, saveAttempt } from '@/lib/sat/client';
import { ModuleRunner } from './ModuleRunner';
import { ResultsScreen } from './ResultsScreen';
import { C, SAT_FONT } from './shared';
import sampleBundle from './data/sampleForm.json';

type Bundle = { form: SatForm; questions: SatQuestion[] };
const SAMPLE = sampleBundle as unknown as Bundle;

type Phase = 'home' | 'rw1' | 'rw2' | 'break' | 'math1' | 'math2' | 'results';

const STUDENT = 'Demo Student';

export function SatMock({ formId }: { formId?: string }) {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [phase, setPhase] = useState<Phase>('home');
  const [results, setResults] = useState<SatModuleResult[]>([]);
  const [rwRoute, setRwRoute] = useState<'upper' | 'lower'>('upper');
  const [mathRoute, setMathRoute] = useState<'upper' | 'lower'>('upper');
  const [attemptId] = useState(() => `att-${Math.floor(Date.now() / 1000).toString(36)}`);

  // Load cloud form if requested, else the bundled demo.
  useEffect(() => {
    let active = true;
    (async () => {
      if (formId && formId !== SAMPLE.form.id) {
        const cloud = await loadRunnerForm(formId);
        if (active && cloud) { setBundle(cloud); return; }
      }
      if (active) setBundle(SAMPLE);
    })();
    return () => { active = false; };
  }, [formId]);

  const byId = useMemo(() => {
    const m = new Map<string, SatQuestion>();
    bundle?.questions.forEach((q) => m.set(q.id, q));
    return m;
  }, [bundle]);

  function resolve(mod: SatModule): SatQuestion[] {
    return mod.questionIds.map((id) => byId.get(id)).filter(Boolean) as SatQuestion[];
  }

  if (!bundle) {
    return (
      <div className="sat-app fixed inset-0 z-[60] grid place-items-center" style={{ background: '#fff', color: C.muted, fontFamily: SAT_FONT }}>
        Loading test…
      </div>
    );
  }
  const form = bundle.form;
  const mods = form.modules;

  function finishModule(key: Phase, result: SatModuleResult, next: () => void) {
    setResults((r) => [...r, result]);
    next();
  }

  // ---- home ----
  if (phase === 'home') {
    return <HomeScreen form={form} onStart={() => setPhase('rw1')} />;
  }

  // ---- RW Module 1 ----
  if (phase === 'rw1') {
    return (
      <ModuleRunner
        key="rw1"
        module={mods.rwM1}
        questions={resolve(mods.rwM1)}
        sectionLabel="Section 1, Module 1: Reading and Writing"
        studentName={STUDENT}
        submitLabel="Next Module"
        onSubmit={(res) => {
          const route = routeModule2(res.correctCount, resolve(mods.rwM1).length);
          setRwRoute(route);
          finishModule('rw1', res, () => setPhase('rw2'));
        }}
      />
    );
  }

  // ---- RW Module 2 (routed) ----
  if (phase === 'rw2') {
    const mod = rwRoute === 'upper' ? mods.rwM2Upper : mods.rwM2Lower;
    return (
      <ModuleRunner
        key="rw2"
        module={mod}
        questions={resolve(mod)}
        sectionLabel="Section 1, Module 2: Reading and Writing"
        studentName={STUDENT}
        submitLabel="Continue"
        onSubmit={(res) => finishModule('rw2', res, () => setPhase('break'))}
      />
    );
  }

  // ---- break ----
  if (phase === 'break') {
    return <BreakScreen onResume={() => setPhase('math1')} />;
  }

  // ---- Math Module 1 ----
  if (phase === 'math1') {
    return (
      <ModuleRunner
        key="math1"
        module={mods.mathM1}
        questions={resolve(mods.mathM1)}
        sectionLabel="Section 2, Module 1: Math"
        studentName={STUDENT}
        submitLabel="Next Module"
        onSubmit={(res) => {
          const route = routeModule2(res.correctCount, resolve(mods.mathM1).length);
          setMathRoute(route);
          finishModule('math1', res, () => setPhase('math2'));
        }}
      />
    );
  }

  // ---- Math Module 2 (routed) ----
  if (phase === 'math2') {
    const mod = mathRoute === 'upper' ? mods.mathM2Upper : mods.mathM2Lower;
    return (
      <ModuleRunner
        key="math2"
        module={mod}
        questions={resolve(mod)}
        sectionLabel="Section 2, Module 2: Math"
        studentName={STUDENT}
        submitLabel="Finish Test"
        onSubmit={(res) => finishModule('math2', res, () => setPhase('results'))}
      />
    );
  }

  // ---- results ----
  const rwMods = mods;
  const rwMax = resolve(rwMods.rwM1).length + resolve(rwRoute === 'upper' ? rwMods.rwM2Upper : rwMods.rwM2Lower).length;
  const mathMax = resolve(rwMods.mathM1).length + resolve(mathRoute === 'upper' ? rwMods.mathM2Upper : rwMods.mathM2Lower).length;
  const rwCorrect = results.filter((r) => r.section === 'reading_writing').reduce((a, r) => a + r.operationalCorrect, 0);
  const mathCorrect = results.filter((r) => r.section === 'math').reduce((a, r) => a + r.operationalCorrect, 0);
  const rwScore = scaleSection('reading_writing', rwCorrect, rwRoute, rwMax);
  const mathScore = scaleSection('math', mathCorrect, mathRoute, mathMax);
  const total = scaleTotal(rwScore, mathScore);

  return (
    <ResultsScreen
      form={form}
      questionsById={byId}
      results={results}
      scores={{ rw: rwScore, math: mathScore, total }}
      rwRoute={rwRoute}
      mathRoute={mathRoute}
      onPersist={() =>
        void saveAttempt({
          id: attemptId,
          formId: form.id,
          studentName: STUDENT,
          status: 'completed',
          rwRoute,
          mathRoute,
          modules: results,
          scores: { rw: rwScore, math: mathScore, total },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
      onRestart={() => { setResults([]); setPhase('home'); }}
    />
  );
}

/* ---- helper: count correct for a grading-aware tally (used by ResultsScreen too) ---- */
export function isQuestionCorrect(q: SatQuestion, answer?: string): boolean {
  if (answer == null || answer === '') return false;
  if (isMc(q)) return answer === (q as { correct: string }).correct;
  if (isSpr(q)) return gradeSpr(answer, q.answer);
  return false;
}

/* ----------------------------------------------------------------- home */

function HomeScreen({ form, onStart }: { form: SatForm; onStart: () => void }) {
  return (
    <div className="sat-app fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto px-6 py-12" style={{ background: '#fff', color: C.ink, fontFamily: SAT_FONT }}>
      <div className="w-[min(720px,94vw)]">
        <div className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: C.blue }}>Digital SAT · Practice</div>
        <h1 className="mt-2 text-[34px] font-extrabold leading-tight" style={{ color: C.blueDeep }}>{form.name}</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: C.muted }}>
          A faithful recreation of the Bluebook test interface — adaptive modules, the Desmos calculator, reference sheet,
          mark-for-review, answer eliminator, and an estimated 400–1600 score. {form.description}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <SectionCard title="Section 1 · Reading and Writing" lines={['2 modules', '~32 min each module', 'Short passages, 4-choice questions']} />
          <SectionCard title="Section 2 · Math" lines={['2 modules', '~35 min each module', 'Multiple-choice + grid-in · calculator allowed']} />
        </div>

        <div className="mt-6 rounded-lg border p-4 text-[13px] leading-relaxed" style={{ borderColor: C.border, background: '#f7f8fb', color: C.muted }}>
          <b style={{ color: C.ink }}>Note:</b> Module 2 adapts to your Module 1 performance, exactly like the real test. Scores are an
          <i> estimate</i> based on a transparent model, not official College Board equating. This demo form is shorter than a real test.
        </div>

        <button type="button" onClick={onStart} className="mt-8 rounded-full px-9 py-3 text-[16px] font-bold text-white" style={{ background: C.blue }}>
          Begin Test
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: C.border }}>
      <div className="text-[15px] font-bold" style={{ color: C.ink }}>{title}</div>
      <ul className="mt-2 space-y-1 text-[13px]" style={{ color: C.muted }}>
        {lines.map((l) => <li key={l}>• {l}</li>)}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- break */

function BreakScreen({ onResume }: { onResume: () => void }) {
  const [secs, setSecs] = useState(10 * 60);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (secs === 0) onResume(); }, [secs, onResume]);
  const m = Math.floor(secs / 60), s = secs % 60;
  return (
    <div className="sat-app fixed inset-0 z-[60] grid place-items-center" style={{ background: C.blueDeep, color: '#fff', fontFamily: SAT_FONT }}>
      <div className="text-center">
        <div className="text-[14px] font-bold uppercase tracking-[0.2em] opacity-80">Break</div>
        <div className="mt-3 text-[64px] font-extrabold tabular-nums">{m}:{String(s).padStart(2, '0')}</div>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed opacity-80">
          You can take a 10-minute break before the Math section. The next module starts automatically when the timer ends.
        </p>
        <button type="button" onClick={onResume} className="mt-7 rounded-full bg-white px-8 py-2.5 text-[15px] font-bold" style={{ color: C.blueDeep }}>
          Resume Testing
        </button>
      </div>
    </div>
  );
}
