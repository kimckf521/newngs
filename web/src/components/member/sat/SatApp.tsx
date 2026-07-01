'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SatQuestion, SatSkill } from '@/lib/sat/types';
import { fetchPublishedQuestions } from '@/lib/sat/client';
import { quickCounts, configureSync, getSyncState, type SyncState } from '@/lib/sat/progress';
import { getCurrentUser } from '@/lib/auth';
import { C, SAT_FONT, ThemeLangToggle } from './shared';
import { useSatTheme, useSatLang, skillLabel } from './i18n';
import { SatMock } from './SatMock';
import { PracticeSetup } from './PracticeSetup';
import { PracticeRunner } from './PracticeRunner';
import { MistakeNotebook } from './MistakeNotebook';
import { ProgressDashboard } from './ProgressDashboard';
import { VocabBook } from './VocabBook';

type Mode = 'hub' | 'mock' | 'setup' | 'practice' | 'notebook' | 'dashboard' | 'vocab';

/** The /member/sat hub — one home for the full mock, skill-drill practice, and
 *  the 错题本. Holds the published question pool and routes between modes. */
export function SatApp({ formId }: { formId?: string }) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const [mode, setMode] = useState<Mode>('hub');
  const [pool, setPool] = useState<SatQuestion[] | null>(null);
  const [drill, setDrill] = useState<{ qs: SatQuestion[]; title: string } | null>(null);
  const [counts, setCounts] = useState({ mistakes: 0, due: 0, vocab: 0 });
  const [sync, setSync] = useState<SyncState>('off');

  useEffect(() => { void fetchPublishedQuestions().then(setPool); }, []);
  const refreshCounts = useCallback(() => { try { setCounts(quickCounts()); } catch { /* ssr */ } }, []);
  useEffect(() => { if (mode === 'hub') refreshCounts(); }, [mode, refreshCounts]);

  // Cross-device sync: if the student is signed in, pull+merge their cloud
  // progress and mirror future changes. Guests stay local-only.
  useEffect(() => {
    let active = true;
    const onSync = () => { if (active) { setSync(getSyncState()); refreshCounts(); } };
    window.addEventListener('ngs-sat-sync', onSync);
    void (async () => {
      const user = await getCurrentUser().catch(() => null);
      if (active && user?.uid) await configureSync(user.uid);
    })();
    return () => { active = false; window.removeEventListener('ngs-sat-sync', onSync); };
  }, [refreshCounts]);

  const toHub = () => setMode('hub');

  if (mode === 'mock') return <SatMock formId={formId} onBack={toHub} />;
  if (mode === 'setup') return <PracticeSetup pool={pool || []} onBack={toHub} onStart={(qs, title) => { setDrill({ qs, title }); setMode('practice'); }} />;
  if (mode === 'practice') return <PracticeRunner questions={drill?.qs || []} title={drill?.title || 'Practice'} onExit={toHub} />;
  if (mode === 'notebook') return <MistakeNotebook pool={pool || []} onBack={toHub} onPractice={(qs, title) => { setDrill({ qs, title }); setMode('practice'); }} />;
  if (mode === 'dashboard') return (
    <ProgressDashboard
      onBack={toHub}
      onPracticeSkill={(skill: SatSkill) => {
        const qs = (pool || []).filter((q) => q.skill === skill).sort(() => Math.random() - 0.5).slice(0, 10);
        if (qs.length) { setDrill({ qs, title: skillLabel(skill, lang) }); setMode('practice'); }
      }}
    />
  );
  if (mode === 'vocab') return <VocabBook onBack={toHub} />;

  // ---- hub ----
  const zh = lang === 'zh';
  return (
    <div className={`sat-app fixed inset-0 z-[60] flex flex-col items-center overflow-y-auto px-6 py-12 ${dark ? 'sat-dark' : ''}`} style={{ background: C.bg, color: C.ink, fontFamily: SAT_FONT }}>
      <div className="w-[min(860px,94vw)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: C.blue }}>Digital SAT · NextGen Scholars</div>
          <div className="flex items-center gap-2">
            <SyncBadge state={sync} />
            <ThemeLangToggle />
          </div>
        </div>
        <h1 className="mt-2 text-[32px] font-extrabold leading-tight" style={{ color: C.blueDeep }}>{zh ? 'SAT 练习中心' : 'SAT Practice Center'}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed" style={{ color: C.muted }}>
          {zh ? '完整自适应模考、按考点无限时刷题、或复习错过的题目。' : 'Take a full adaptive mock, drill any skill untimed, or review the questions you’ve missed.'}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ModeCard icon="📝" title={zh ? '完整限时模考' : 'Full Mock Test'} zh={zh ? 'Bluebook 自适应考试' : '完整限时模考'}
            blurb={zh ? '忠实还原的自适应 Bluebook 考试 — 限时、内置 Desmos、400–1600 预估分。' : 'The faithful adaptive Bluebook exam — timed, Desmos, 400–1600 estimated score.'} onClick={() => setMode('mock')} />
          <ModeCard icon="🎯" title={zh ? '按考点刷题' : 'Practice by Skill'} zh={zh ? '无限时练习' : '按考点刷题'}
            blurb={zh ? '按部分、领域、考点和难度选题。无限时，即时给出答案与解析。' : 'Pick a section, domain, skill and difficulty. Untimed, with instant answers and explanations.'} onClick={() => setMode('setup')} disabled={!pool} />
          <ModeCard icon="📕" title={zh ? '错题本' : 'Mistake Notebook'} zh={zh ? '自动收集错题' : '错题本'}
            blurb={zh ? '你做错的每一题都会被自动收集，方便集中复习和重做。' : 'Every question you miss, auto-collected for focused review and re-practice.'} onClick={() => setMode('notebook')} disabled={!pool}
            badge={counts.mistakes ? `${counts.mistakes}${counts.due ? (zh ? ` · ${counts.due} 待复习` : ` · ${counts.due} due`) : ''}` : undefined} />
          <ModeCard icon="📊" title={zh ? '数据看板' : 'Progress Dashboard'} zh={zh ? '进度与预估分' : '数据看板'}
            blurb={zh ? '各考点正确率、每题用时、随时间的进步曲线，以及预测分数。' : 'Accuracy by skill, time per question, progress over time, and a predicted score.'} onClick={() => setMode('dashboard')} />
          <ModeCard icon="📚" title={zh ? '生词本' : 'Vocabulary'} zh={zh ? '自测模式' : '生词本'}
            blurb={zh ? '从阅读文章中收藏的单词，支持自测模式进行自我检测。' : 'Words you save from Reading passages, with a test-me mode for self-quizzing.'} onClick={() => setMode('vocab')}
            badge={counts.vocab ? `${counts.vocab}` : undefined} />
        </div>

        {!pool ? <p className="mt-6 text-[13px]" style={{ color: C.muted }}>{zh ? '正在加载题库…' : 'Loading question bank…'}</p> : null}
      </div>
    </div>
  );
}

function SyncBadge({ state }: { state: SyncState }) {
  const map: Record<SyncState, { text: string; color: string; bg: string }> = {
    off: { text: '💾 Saved on this device · 本机保存', color: C.muted, bg: C.hover },
    syncing: { text: '☁ Syncing… · 同步中', color: C.blue, bg: C.tint },
    synced: { text: '☁ Synced to your account · 已同步到账号', color: C.good, bg: C.goodBg },
    error: { text: '⚠ Sync unavailable · 同步不可用', color: C.flag, bg: C.badBg },
  };
  const s = map[state];
  return <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: s.color, background: s.bg }}>{s.text}</span>;
}

function ModeCard({ icon, title, zh, blurb, onClick, disabled, badge, soon }: { icon: string; title: string; zh: string; blurb: string; onClick: () => void; disabled?: boolean; badge?: string; soon?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="group relative flex flex-col rounded-xl border p-5 text-left transition-shadow disabled:opacity-55 hover:shadow-[0_18px_40px_-20px_rgba(50,77,199,0.4)]"
      style={{ borderColor: C.border, background: C.panel }}>
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl text-[22px]" style={{ background: C.tint }}>{icon}</span>
        {badge ? <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: C.flag }}>{badge}</span> : null}
        {soon ? <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" style={{ background: C.hover, color: C.muted }}>soon</span> : null}
      </div>
      <h3 className="mt-4 text-[17px] font-bold" style={{ color: C.ink }}>{title} <span className="text-[14px] font-semibold" style={{ color: C.muted }}>· {zh}</span></h3>
      <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: C.muted }}>{blurb}</p>
    </button>
  );
}
