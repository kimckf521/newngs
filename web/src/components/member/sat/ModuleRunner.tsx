'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SatModule, SatQuestion, SatModuleResult, SatRwQuestion, SatMathQuestion } from '@/lib/sat/types';
import { isRw, isMc, isSpr } from '@/lib/sat/types';
import { gradeSpr } from '@/lib/sat/scoring';
import {
  C, SAT_FONT, TopBar, BottomNav, NavigatorPopup, ReviewPage, ToolButton, Icon, Modal, DIRECTIONS, range,
} from './shared';
import { useSatTheme, useSatLang, COMMON } from './i18n';
import { RwModule, type Highlight } from './RwModule';
import { MathModule } from './MathModule';
import { DesmosCalc } from './DesmosCalc';
import { ReferenceSheet } from './ReferenceSheet';

export function ModuleRunner({
  module, questions, sectionLabel, studentName, submitLabel, onSubmit, onExit,
}: {
  module: SatModule;
  questions: SatQuestion[];
  sectionLabel: string;
  studentName: string;
  submitLabel: string;
  onSubmit: (result: SatModuleResult) => void;
  onExit?: () => void;
}) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const t = COMMON[lang];
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
  const [menu, setMenu] = useState<null | 'help' | 'shortcuts' | 'break' | 'exit'>(null);

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
    { label: lang === 'zh' ? '说明' : 'Directions', onClick: () => setDirectionsOpen(true) },
    { label: lang === 'zh' ? '帮助' : 'Help', onClick: () => setMenu('help') },
    { label: lang === 'zh' ? '键盘快捷键' : 'Keyboard Shortcuts', onClick: () => setMenu('shortcuts') },
    { label: lang === 'zh' ? '非计划休息' : 'Unscheduled Break', onClick: () => setMenu('break') },
    { label: lang === 'zh' ? '保存并退出' : 'Save and Exit', onClick: () => setMenu('exit') },
  ];

  const rightTools =
    section === 'math' ? (
      <>
        <ToolButton icon={<Icon.calc />} label={lang === 'zh' ? '计算器' : 'Calculator'} active={calcOpen} onClick={() => setCalcOpen((v) => !v)} />
        <ToolButton icon={<Icon.ref />} label={lang === 'zh' ? '公式表' : 'Reference'} active={refOpen} onClick={() => setRefOpen((v) => !v)} />
      </>
    ) : (
      <ToolButton icon={<Icon.pencil />} label={lang === 'zh' ? '批注' : 'Annotate'} active={annotateOn} onClick={() => setAnnotateOn((v) => !v)} />
    );

  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col ${dark ? 'sat-dark' : ''}`} style={{ background: C.bg, color: C.ink, fontFamily: SAT_FONT }}>
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
        <div className="absolute left-1/2 top-[68px] z-[77] -translate-x-1/2 rounded-md border px-4 py-2 text-[13px] shadow-lg" style={{ background: C.panel, borderColor: C.border, color: C.ink }}>
          {lang === 'zh' ? '本模块还剩 5 分钟。' : '5 minutes remaining in this module.'}{' '}
          <button type="button" onClick={() => setWarn5(false)} className="font-semibold" style={{ color: C.blue }}>{lang === 'zh' ? '知道了' : 'Dismiss'}</button>
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
        nextLabel={reviewOpen ? submitLabel : t.next}
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
        <Modal title={t.directions} onClose={() => setDirectionsOpen(false)} width={640}>
          <p className="whitespace-pre-wrap">{DIRECTIONS[section]}</p>
        </Modal>
      ) : null}

      {menu === 'help' ? (
        <Modal title={t.help} onClose={() => setMenu(null)} width={560}>
          <div className="space-y-2">
            {lang === 'zh' ? (
              <>
                <p><b>导航</b> — 使用底部的<b>返回</b> / <b>下一题</b>,或打开<b>第 X / Y 题</b>跳转到任意题目并进入复查页。</p>
                <p><b>标记复查</b> — 标记一道题以便稍后回看;被标记的题目会在导航器中显示标记。</p>
                <p><b>划掉选项</b> — 打开 <b>ABC</b> 开关,然后划掉你已排除的选项。</p>
                {section === 'reading_writing'
                  ? <p><b>批注</b> — 在文章中选中文字即可高亮或添加下划线。</p>
                  : <p><b>计算器与公式表</b> — 从顶栏打开内置的 Desmos 计算器和公式参考表。</p>}
                <p><b>计时器</b> — 在顶部隐藏/显示倒计时;剩余 5 分钟时会自动显示。</p>
              </>
            ) : (
              <>
                <p><b>Navigating</b> — Use <b>Back</b> / <b>Next</b> at the bottom, or open <b>Question X of Y</b> to jump to any question and reach the review page.</p>
                <p><b>Mark for Review</b> — Flag a question to revisit; flagged questions show a marker in the navigator.</p>
                <p><b>Cross out answers</b> — Turn on the <b>ABC</b> toggle, then cross out choices you&apos;ve ruled out.</p>
                {section === 'reading_writing'
                  ? <p><b>Annotate</b> — Select text in the passage to highlight it or underline it.</p>
                  : <p><b>Calculator &amp; Reference</b> — Open the built-in Desmos calculator and the formula reference sheet from the top bar.</p>}
                <p><b>Timer</b> — Hide/show the countdown at the top; it reveals automatically with 5 minutes left.</p>
              </>
            )}
          </div>
        </Modal>
      ) : null}

      {menu === 'shortcuts' ? (
        <Modal title={lang === 'zh' ? '键盘快捷键' : 'Keyboard Shortcuts'} onClose={() => setMenu(null)} width={480}>
          <table className="w-full text-[14px]">
            <tbody>
              {(lang === 'zh'
                ? [
                    ['下一题', 'Ctrl + Alt + X'],
                    ['上一题', 'Ctrl + Alt + B'],
                    ['标记复查', 'Ctrl + Alt + V'],
                    ['打开 / 关闭导航器', 'Ctrl + Alt + G'],
                  ]
                : [
                    ['Next question', 'Ctrl + Alt + X'],
                    ['Previous question', 'Ctrl + Alt + B'],
                    ['Mark for review', 'Ctrl + Alt + V'],
                    ['Open / close navigator', 'Ctrl + Alt + G'],
                  ]
              ).map(([k, v]) => (
                <tr key={k} className="border-b last:border-0" style={{ borderColor: C.hairline }}>
                  <td className="py-1.5" style={{ color: C.ink }}>{k}</td>
                  <td className="py-1.5 text-right font-semibold tabular-nums" style={{ color: C.blue }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      ) : null}

      {menu === 'break' ? (
        <Modal title={lang === 'zh' ? '非计划休息' : 'Unscheduled Break'} onClose={() => setMenu(null)} width={520}>
          {lang === 'zh'
            ? <p>你可以暂时离开,但在真实 SAT 考试中,非计划休息期间<b>模块计时会继续走</b> —— 这段时间不会补回。关闭此窗口继续答题,或使用<b>保存并退出</b>离开考试。</p>
            : <p>You can step away, but on the real SAT the <b>module timer keeps running</b> during an unscheduled break — you don&apos;t get the time back. Close this to keep working, or use <b>Save and Exit</b> to leave the test.</p>}
        </Modal>
      ) : null}

      {menu === 'exit' ? (
        <Modal title={lang === 'zh' ? '保存并退出' : 'Save and Exit'} onClose={() => setMenu(null)} width={480} hideClose>
          {lang === 'zh'
            ? <p>确定要退出吗?这是一次练习测试,因此本模块的进度<b>不会被保存</b>。</p>
            : <p>Are you sure you want to exit? This is a practice test, so your progress in this module <b>won&apos;t be saved</b>.</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setMenu(null)} className="rounded-full px-5 py-2 text-[14px] font-bold" style={{ background: C.tint, color: C.blue }}>
              {lang === 'zh' ? '继续答题' : 'Keep Testing'}
            </button>
            <button type="button" onClick={() => { setMenu(null); (onExit ?? (() => {}))(); }} className="rounded-full px-5 py-2 text-[14px] font-bold text-white" style={{ background: C.flag }}>
              {lang === 'zh' ? '保存并退出' : 'Save and Exit'}
            </button>
          </div>
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
