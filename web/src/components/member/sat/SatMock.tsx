'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SatForm, SatQuestion, SatModule, SatModuleResult } from '@/lib/sat/types';
import { isMc, isSpr, SECTION_LABEL } from '@/lib/sat/types';
import { routeModule2, scaleSection, scaleTotal, gradeSpr } from '@/lib/sat/scoring';
import { loadRunnerForm, saveAttempt } from '@/lib/sat/client';
import { recordMock, recordMockScore } from '@/lib/sat/progress';
import { ModuleRunner } from './ModuleRunner';
import { ResultsScreen } from './ResultsScreen';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatLang, useSatTheme } from './i18n';
import defaultBundle from './data/originalForm.json';

type Bundle = { form: SatForm; questions: SatQuestion[] };
// Default content = the NGS-authored original practice test (originalForm.json,
// 168 original items). The old sampleForm.json remains only as a tiny fixture.
const SAMPLE = defaultBundle as unknown as Bundle;

type Phase = 'home' | 'rw1' | 'rw2' | 'break' | 'math1' | 'math2' | 'results';

const STUDENT = 'Demo Student';

export function SatMock({ formId, onBack }: { formId?: string; onBack?: () => void }) {
  const { lang } = useSatLang();
  const { dark } = useSatTheme();
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

  // The final scaled score, computed once results are in — the single source of
  // truth for both the results screen and the persisted personal-best.
  const finalScore = useMemo(() => {
    if (phase !== 'results' || !bundle) return null;
    const mods = bundle.form.modules;
    const res = (mod: SatModule) => mod.questionIds.map((id) => byId.get(id)).filter(Boolean) as SatQuestion[];
    const rwMax = res(mods.rwM1).length + res(rwRoute === 'upper' ? mods.rwM2Upper : mods.rwM2Lower).length;
    const mathMax = res(mods.mathM1).length + res(mathRoute === 'upper' ? mods.mathM2Upper : mods.mathM2Lower).length;
    const rwCorrect = results.filter((r) => r.section === 'reading_writing').reduce((a, r) => a + r.operationalCorrect, 0);
    const mathCorrect = results.filter((r) => r.section === 'math').reduce((a, r) => a + r.operationalCorrect, 0);
    const rw = scaleSection('reading_writing', rwCorrect, rwRoute, rwMax);
    const math = scaleSection('math', mathCorrect, mathRoute, mathMax);
    return { rw, math, total: scaleTotal(rw, math) };
  }, [phase, bundle, byId, results, rwRoute, mathRoute]);

  // When the mock completes, feed every answered question into the progress
  // store (missed ones land in the 错题本) and persist the scaled score for the
  // hub's personal-best. Guarded so it records exactly once.
  const recordedRef = useRef(false);
  useEffect(() => {
    if (phase === 'results' && !recordedRef.current && finalScore) {
      recordedRef.current = true;
      recordMock(results, byId);
      recordMockScore(finalScore);
    }
  }, [phase, results, byId, finalScore]);

  function resolve(mod: SatModule): SatQuestion[] {
    return mod.questionIds.map((id) => byId.get(id)).filter(Boolean) as SatQuestion[];
  }

  if (!bundle) {
    return (
      <div className={`sat-app ${dark ? 'sat-dark' : ''} fixed inset-0 z-[60] grid place-items-center`} style={{ background: C.bg, color: C.muted, fontFamily: SAT_FONT }}>
        {lang === 'zh' ? '正在加载测试…' : 'Loading test…'}
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
    return <HomeScreen form={form} onStart={() => setPhase('rw1')} onBack={onBack} />;
  }

  // ---- RW Module 1 ----
  if (phase === 'rw1') {
    return (
      <ModuleRunner
        key="rw1"
        module={mods.rwM1}
        questions={resolve(mods.rwM1)}
        sectionLabel={lang === 'zh' ? '第 1 部分 · 模块 1:阅读与写作' : 'Section 1, Module 1: Reading and Writing'}
        studentName={STUDENT}
        onExit={() => { setResults([]); setPhase('home'); }}
        submitLabel={lang === 'zh' ? '下一模块' : 'Next Module'}
        onSubmit={(res) => {
          // Route to the harder/easier RW Module 2 by Module-1 performance
          // (counts all M1 items the student saw, pretest included).
          const route = routeModule2('reading_writing', res.correctCount, resolve(mods.rwM1).length);
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
        sectionLabel={lang === 'zh' ? '第 1 部分 · 模块 2:阅读与写作' : 'Section 1, Module 2: Reading and Writing'}
        studentName={STUDENT}
        onExit={() => { setResults([]); setPhase('home'); }}
        submitLabel={lang === 'zh' ? '继续' : 'Continue'}
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
        sectionLabel={lang === 'zh' ? '第 2 部分 · 模块 1:数学' : 'Section 2, Module 1: Math'}
        studentName={STUDENT}
        onExit={() => { setResults([]); setPhase('home'); }}
        submitLabel={lang === 'zh' ? '下一模块' : 'Next Module'}
        onSubmit={(res) => {
          // Route to the harder/easier Math Module 2 by Module-1 performance
          // (counts all M1 items the student saw, pretest included).
          const route = routeModule2('math', res.correctCount, resolve(mods.mathM1).length);
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
        sectionLabel={lang === 'zh' ? '第 2 部分 · 模块 2:数学' : 'Section 2, Module 2: Math'}
        studentName={STUDENT}
        onExit={() => { setResults([]); setPhase('home'); }}
        submitLabel={lang === 'zh' ? '完成测试' : 'Finish Test'}
        onSubmit={(res) => finishModule('math2', res, () => setPhase('results'))}
      />
    );
  }

  // ---- results ----
  const { rw: rwScore, math: mathScore, total } = finalScore ?? { rw: 200, math: 200, total: 400 };

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

function HomeScreen({ form, onStart, onBack }: { form: SatForm; onStart: () => void; onBack?: () => void }) {
  const { lang } = useSatLang();
  const { dark } = useSatTheme();
  const zh = lang === 'zh';
  return (
    <div className={`sat-app ${dark ? 'sat-dark' : ''} fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto px-6 py-12`} style={{ background: C.bg, color: C.ink, fontFamily: SAT_FONT }}>
      <div className="w-[min(720px,94vw)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          {onBack ? (
            <button type="button" onClick={onBack} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: C.tint, color: C.blue }}>{zh ? '‹ 练习中心' : '‹ Practice Center'}</button>
          ) : <span />}
          <ThemeLangToggle />
        </div>
        <div className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: C.blue }}>{zh ? '数字 SAT · 练习' : 'Digital SAT · Practice'}</div>
        <h1 className="mt-2 text-[34px] font-extrabold leading-tight" style={{ color: C.blueDeep }}>{form.name}</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: C.muted }}>
          {zh
            ? '忠实还原 Bluebook 考试界面——自适应模块、Desmos 计算器、参考表、标记复查、选项排除器,以及 400–1600 的预估分数。'
            : 'A faithful recreation of the Bluebook test interface — adaptive modules, the Desmos calculator, reference sheet, mark-for-review, answer eliminator, and an estimated 400–1600 score. '}
          {form.description}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <SectionCard
            title={zh ? '第 1 部分 · 阅读与写作' : 'Section 1 · Reading and Writing'}
            lines={zh ? ['2 个模块', '每个模块约 32 分钟', '短篇文章,四选一题目'] : ['2 modules', '~32 min each module', 'Short passages, 4-choice questions']} />
          <SectionCard
            title={zh ? '第 2 部分 · 数学' : 'Section 2 · Math'}
            lines={zh ? ['2 个模块', '每个模块约 35 分钟', '选择题 + 填空题 · 允许使用计算器'] : ['2 modules', '~35 min each module', 'Multiple-choice + grid-in · calculator allowed']} />
        </div>

        <div className="mt-6 rounded-lg border p-4 text-[13px] leading-relaxed" style={{ borderColor: C.border, background: C.panel2, color: C.muted }}>
          {zh ? (
            <><b style={{ color: C.ink }}>提示:</b> 与真实考试一样,模块 2 会根据你在模块 1 的表现进行自适应。分数是基于透明模型的<i>估算</i>,并非官方 College Board 换算结果。此演示卷比真实考试更短。</>
          ) : (
            <><b style={{ color: C.ink }}>Note:</b> Module 2 adapts to your Module 1 performance, exactly like the real test. Scores are an
            <i> estimate</i> based on a transparent model, not official College Board equating. This demo form is shorter than a real test.</>
          )}
        </div>

        <button type="button" onClick={onStart} className="mt-8 rounded-full px-9 py-3 text-[16px] font-bold text-white" style={{ background: C.blue }}>
          {zh ? '开始测试' : 'Begin Test'}
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
  const { lang } = useSatLang();
  const { dark } = useSatTheme();
  const zh = lang === 'zh';
  const [secs, setSecs] = useState(10 * 60);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (secs === 0) onResume(); }, [secs, onResume]);
  const m = Math.floor(secs / 60), s = secs % 60;
  return (
    <div className={`sat-app ${dark ? 'sat-dark' : ''} fixed inset-0 z-[60] grid place-items-center`} style={{ background: C.blueDeep, color: '#fff', fontFamily: SAT_FONT }}>
      <div className="text-center">
        <div className="text-[14px] font-bold uppercase tracking-[0.2em] opacity-80">{zh ? '休息' : 'Break'}</div>
        <div className="mt-3 text-[64px] font-extrabold tabular-nums">{m}:{String(s).padStart(2, '0')}</div>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed opacity-80">
          {zh
            ? '在数学部分开始前,你可以休息 10 分钟。计时结束后,下一模块会自动开始。'
            : 'You can take a 10-minute break before the Math section. The next module starts automatically when the timer ends.'}
        </p>
        <button type="button" onClick={onResume} className="mt-7 rounded-full px-8 py-2.5 text-[15px] font-bold" style={{ background: C.panel, color: C.blueDeep }}>
          {zh ? '继续测试' : 'Resume Testing'}
        </button>
      </div>
    </div>
  );
}
