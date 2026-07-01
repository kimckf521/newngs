'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SatModule, SatQuestion, SatModuleResult, SatRwQuestion, SatMathQuestion } from '@/lib/sat/types';
import { isRw, isMc, isSpr } from '@/lib/sat/types';
import { gradeSpr } from '@/lib/sat/scoring';
import {
  C, SAT_FONT, TopBar, BottomNav, NavigatorPopup, ReviewPage, ToolButton, Icon, Modal, DIRECTIONS, range,
} from './shared';
import { RwModule, type Highlight } from './RwModule';
import { MathModule } from './MathModule';
import { DesmosCalc } from './DesmosCalc';
import { ReferenceSheet } from './ReferenceSheet';

export function ModuleRunner({
  module, questions, sectionLabel, studentName, submitLabel, onSubmit,
}: {
  module: SatModule;
  questions: SatQuestion[];
  sectionLabel: string;
  studentName: string;
  submitLabel: string;
  onSubmit: (result: SatModuleResult) => void;
}) {
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [eliminated, setEliminated] = useState<Record<string, Set<string>>>({});
  const [eliminatorOn, setEliminatorOn] = useState(false);
  const [annotations, setAnnotations] = useState<Record<string, Highlight[]>>({});
  const [split, setSplit] = useState(50);

  const [navOpen, setNavOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [annotateOn, setAnnotateOn] = useState(true);
  const [calcOpen, setCalcOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [timerHidden, setTimerHidden] = useState(false);
  const [warn5, setWarn5] = useState(false);

  // per-module countdown (component is keyed per module in SatMock → resets cleanly)
  const startedAt = useMemo(() => Date.now(), []);
  const [secs, setSecs] = useState(module.timeLimitSec);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (secs === 300) { setTimerHidden(false); setWarn5(true); } // 5-min warning force-reveals
    if (secs === 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs]);

  const q = questions[index];
  const section = module.section;

  function setAnswer(v: string) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
  }
  function toggleMark() {
    setMarked((m) => { const n = new Set(m); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; });
  }
  function toggleEliminate(choiceId: string) {
    setEliminated((e) => {
      const cur = new Set(e[q.id] || []);
      if (cur.has(choiceId)) cur.delete(choiceId); else cur.add(choiceId);
      return { ...e, [q.id]: cur };
    });
  }

  function gradeOne(question: SatQuestion): boolean {
    const a = answers[question.id];
    if (a == null || a === '') return false;
    if (isMc(question)) return a === (question as SatRwQuestion | (SatMathQuestion & { format: 'mc' })).correct;
    if (isSpr(question)) return gradeSpr(a, question.answer);
    return false;
  }

  function submit() {
    const correctCount = questions.reduce((acc, question) => acc + (gradeOne(question) ? 1 : 0), 0);
    const result: SatModuleResult = {
      moduleId: module.id,
      section: module.section,
      index: module.index,
      route: module.difficultyForm,
      answers: { ...answers },
      marked: Array.from(marked),
      correctCount,
      operationalCorrect: correctCount, // demo: every item is operational
      startedAt,
      submittedAt: Date.now(),
    };
    onSubmit(result);
  }

  const answeredSet = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((question, i) => { if (answers[question.id]) s.add(i + 1); });
    return s;
  }, [answers, questions]);
  const markedSet = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((question, i) => { if (marked.has(question.id)) s.add(i + 1); });
    return s;
  }, [marked, questions]);

  function goNext() {
    if (reviewOpen) { submit(); return; }
    if (index < total - 1) setIndex(index + 1);
    else setReviewOpen(true);
  }
  function goBack() {
    if (reviewOpen) { setReviewOpen(false); setIndex(total - 1); return; }
    if (index > 0) setIndex(index - 1);
  }

  const moreItems = [
    { label: 'Directions', onClick: () => setDirectionsOpen(true) },
    { label: 'Help', onClick: () => {} },
    { label: 'Keyboard Shortcuts', onClick: () => {} },
    { label: 'Unscheduled Break', onClick: () => {} },
    { label: 'Save and Exit', onClick: () => {} },
  ];

  const rightTools =
    section === 'math' ? (
      <>
        <ToolButton icon={<Icon.calc />} label="Calculator" active={calcOpen} onClick={() => setCalcOpen((v) => !v)} />
        <ToolButton icon={<Icon.ref />} label="Reference" active={refOpen} onClick={() => setRefOpen((v) => !v)} />
      </>
    ) : (
      <ToolButton icon={<Icon.pencil />} label="Annotate" active={annotateOn} onClick={() => setAnnotateOn((v) => !v)} />
    );

  return (
    <div className="sat-app fixed inset-0 z-[60] flex flex-col" style={{ background: '#fff', color: C.ink, fontFamily: SAT_FONT }}>
      <TopBar
        sectionLabel={sectionLabel}
        secs={secs}
        hidden={timerHidden}
        toggleHidden={() => setTimerHidden((v) => !v)}
        onDirections={() => setDirectionsOpen(true)}
        rightTools={rightTools}
        moreItems={moreItems}
      />

      {warn5 ? (
        <div className="absolute left-1/2 top-[68px] z-[77] -translate-x-1/2 rounded-md border bg-white px-4 py-2 text-[13px] shadow-lg" style={{ borderColor: C.border, color: C.ink }}>
          5 minutes remaining in this module.{' '}
          <button type="button" onClick={() => setWarn5(false)} className="font-semibold" style={{ color: C.blue }}>Dismiss</button>
        </div>
      ) : null}

      {/* content */}
      {reviewOpen ? (
        <ReviewPage
          sectionLabel={sectionLabel}
          total={total}
          answered={answeredSet}
          marked={markedSet}
          onJump={(n) => { setReviewOpen(false); setIndex(n - 1); }}
          onSubmit={submit}
          submitLabel={submitLabel}
        />
      ) : isRw(q) ? (
        <RwModule
          question={q}
          number={index + 1}
          answer={answers[q.id]}
          onAnswer={setAnswer}
          marked={marked.has(q.id)}
          onToggleMark={toggleMark}
          eliminatorOn={eliminatorOn}
          setEliminatorOn={setEliminatorOn}
          eliminated={eliminated[q.id] || new Set()}
          onToggleEliminate={toggleEliminate}
          highlights={annotations[q.id] || []}
          setHighlights={(hs) => setAnnotations((a) => ({ ...a, [q.id]: hs }))}
          annotateOn={annotateOn}
          split={split}
          setSplit={setSplit}
        />
      ) : (
        <MathModule
          question={q as SatMathQuestion}
          number={index + 1}
          answer={answers[q.id]}
          onAnswer={setAnswer}
          marked={marked.has(q.id)}
          onToggleMark={toggleMark}
          eliminatorOn={eliminatorOn}
          setEliminatorOn={setEliminatorOn}
          eliminated={eliminated[q.id] || new Set()}
          onToggleEliminate={toggleEliminate}
        />
      )}

      <BottomNav
        studentName={studentName}
        current={reviewOpen ? total : index + 1}
        total={total}
        onOpenNavigator={() => setNavOpen(true)}
        onBack={goBack}
        onNext={goNext}
        backDisabled={!reviewOpen && index === 0}
        nextLabel={reviewOpen ? submitLabel : 'Next'}
      />

      {navOpen ? (
        <NavigatorPopup
          sectionLabel={sectionLabel}
          total={total}
          current={reviewOpen ? 0 : index + 1}
          answered={answeredSet}
          marked={markedSet}
          onJump={(n) => { setNavOpen(false); setReviewOpen(false); setIndex(n - 1); }}
          onReview={() => { setNavOpen(false); setReviewOpen(true); }}
          onClose={() => setNavOpen(false)}
        />
      ) : null}

      {directionsOpen ? (
        <Modal title="Directions" onClose={() => setDirectionsOpen(false)} width={640}>
          <p className="whitespace-pre-wrap">{DIRECTIONS[section]}</p>
        </Modal>
      ) : null}

      {section === 'math' && calcOpen ? <DesmosCalc onClose={() => setCalcOpen(false)} /> : null}
      {section === 'math' && refOpen ? <ReferenceSheet onClose={() => setRefOpen(false)} /> : null}

      {/* keyboard: Back/Next/Mark */}
      <KeyShortcuts onBack={goBack} onNext={goNext} onMark={toggleMark} onNav={() => setNavOpen((v) => !v)} />
      <span className="sr-only">{range(1, total).length} questions</span>
    </div>
  );
}

function KeyShortcuts({ onBack, onNext, onMark, onNav }: { onBack: () => void; onNext: () => void; onMark: () => void; onNav: () => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!(e.ctrlKey && e.altKey)) return;
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); onBack(); }
      else if (e.key === 'x' || e.key === 'X') { e.preventDefault(); onNext(); }
      else if (e.key === 'v' || e.key === 'V') { e.preventDefault(); onMark(); }
      else if (e.key === 'g' || e.key === 'G') { e.preventDefault(); onNav(); }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack, onNext, onMark, onNav]);
  return null;
}
