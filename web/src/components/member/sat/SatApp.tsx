'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { SatQuestion, SatSkill } from '@/lib/sat/types';
import { fetchPublishedQuestions } from '@/lib/sat/client';
import { quickCounts, getStats, predictedScore, bestMockScore, configureSync, getSyncState, type SyncState, type ProgressStats, type MockScore } from '@/lib/sat/progress';
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

/* NGS brand signature — the magenta→violet→cyan "N"-mark gradient, honoured as a
 * restrained accent on the practice hub so it reads as part of NextGen Scholars.
 * (The exam runner stays a faithful white Bluebook and never uses these.) */
const NGS = {
  magenta: '#ec1c8b',
  violet: '#8b2fd6',
  cyan: '#16c8e6',
  grad: 'linear-gradient(115deg, #ec1c8b 0%, #8b2fd6 50%, #16c8e6 100%)',
} as const;

/** The /member/sat hub — one home for the full mock, skill-drill practice, and
 *  the 错题本. Holds the published question pool and routes between modes. */
export function SatApp({ formId }: { formId?: string }) {
  const { dark } = useSatTheme();
  const { lang } = useSatLang();
  const [mode, setMode] = useState<Mode>('hub');
  const [pool, setPool] = useState<SatQuestion[] | null>(null);
  const [drill, setDrill] = useState<{ qs: SatQuestion[]; title: string } | null>(null);
  const [counts, setCounts] = useState({ mistakes: 0, due: 0, vocab: 0 });
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [pred, setPred] = useState<ReturnType<typeof predictedScore>>(null);
  const [best, setBest] = useState<MockScore | null>(null);
  const [sync, setSync] = useState<SyncState>('off');

  useEffect(() => { void fetchPublishedQuestions().then(setPool); }, []);
  const refreshCounts = useCallback(() => {
    try { setCounts(quickCounts()); setStats(getStats()); setPred(predictedScore()); setBest(bestMockScore()); } catch { /* ssr */ }
  }, []);
  useEffect(() => { if (mode === 'hub') refreshCounts(); }, [mode, refreshCounts]);

  /** Launch an untimed drill on a single skill (used by the "focus area" nudge). */
  const drillSkill = (skill: SatSkill) => {
    const qs = (pool || []).filter((q) => q.skill === skill).sort(() => Math.random() - 0.5).slice(0, 10);
    if (qs.length) { setDrill({ qs, title: skillLabel(skill, lang) }); setMode('practice'); }
  };

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
  if (mode === 'dashboard') return <ProgressDashboard onBack={toHub} onPracticeSkill={drillSkill} />;
  if (mode === 'vocab') return <VocabBook onBack={toHub} />;

  // ---- hub ----
  const zh = lang === 'zh';
  const answered = stats?.totalAnswered ?? 0;
  const accuracy = stats && answered ? Math.round((stats.totalCorrect / answered) * 100) : null;
  // weakest skill with enough signal → a "focus area" nudge
  const focus = (stats?.bySkill || [])
    .filter((s) => s.attempted >= 2)
    .map((s) => ({ ...s, pct: Math.round((s.correct / s.attempted) * 100) }))
    .sort((a, b) => a.pct - b.pct)[0];

  return (
    <div className={`sat-app fixed inset-0 z-[60] overflow-y-auto ${dark ? 'sat-dark' : ''}`} style={{ background: C.bg, color: C.ink, fontFamily: SAT_FONT }}>
      {/* ambient premium backdrop — NGS brand aurora (magenta → violet → cyan) */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background:
        `radial-gradient(56rem 30rem at 8% -10%, color-mix(in srgb, ${NGS.magenta} ${dark ? 22 : 14}%, transparent), transparent 60%),` +
        `radial-gradient(52rem 32rem at 104% 2%, color-mix(in srgb, ${NGS.cyan} ${dark ? 20 : 13}%, transparent), transparent 58%),` +
        `radial-gradient(40rem 28rem at 60% 118%, color-mix(in srgb, ${NGS.violet} ${dark ? 16 : 9}%, transparent), transparent 60%)` }} />

      <div className="relative mx-auto w-[min(1040px,94vw)] px-1 py-9">
        {/* header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-[0_6px_18px_-6px_rgba(236,28,139,0.6)]" style={{ background: NGS.grad }}>
              <HIcon.logo />
            </span>
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: C.muted }}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: NGS.grad }} />
              Digital SAT<span className="font-semibold" style={{ color: C.ink }}>· NextGen Scholars</span>
            </div>
          </div>
          <div className="flex items-center gap-2"><SyncBadge state={sync} /><ThemeLangToggle /></div>
        </header>

        <h1 className="mt-6 text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[42px]" style={{ color: C.ink }}>
          {zh ? (
            <>SAT <span style={{ backgroundImage: NGS.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>练习中心</span></>
          ) : (
            <>SAT <span style={{ backgroundImage: NGS.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Practice Center</span></>
          )}
        </h1>
        <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed" style={{ color: C.muted }}>
          {zh ? '一站式备考：完整自适应模考、按考点无限刷题、错题本与数据看板。' : 'Your prep home — a faithful adaptive mock, unlimited skill drills, a mistake notebook, and a progress dashboard.'}
        </p>

        {/* live snapshot */}
        <section className="mt-7 overflow-hidden rounded-2xl border shadow-[0_24px_60px_-32px_rgba(139,47,214,0.4)]" style={{ borderColor: C.border, background: C.panel }}>
          <div className="grid gap-px sm:grid-cols-[1.15fr_2fr]" style={{ background: C.hairline }}>
            {/* predicted score */}
            <div className="flex flex-col justify-center px-6 py-5" style={{ background: NGS.grad }}>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">{zh ? '预测总分' : 'Predicted Score'}</div>
              {pred ? (
                <>
                  <div className="mt-0.5 text-[46px] font-extrabold leading-none text-white">{pred.total}</div>
                  <div className="mt-1.5 flex gap-4 text-[12px] font-semibold text-white/85">
                    <span>{zh ? '阅读写作' : 'R&W'} {pred.rw || '—'}</span><span>{zh ? '数学' : 'Math'} {pred.math || '—'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-1 text-[22px] font-extrabold leading-tight text-white">{zh ? '开始练习即可解锁' : 'Start to unlock'}</div>
                  <div className="mt-1 text-[12px] font-medium text-white/80">{zh ? `再做 ${Math.max(0, 8 - answered)} 题` : `${Math.max(0, 8 - answered)} more questions`}</div>
                </>
              )}
            </div>
            {/* stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ background: C.hairline, gap: 1 }}>
              <StatTile icon={<HIcon.flame />} value={stats?.streakDays ?? 0} label={zh ? '连续天数' : 'Day streak'} tone={(stats?.streakDays ?? 0) > 0 ? 'flame' : 'muted'} />
              <StatTile icon={<HIcon.check />} value={answered} label={zh ? '已做题' : 'Answered'} />
              <StatTile icon={<HIcon.trophy />} value={best ? best.total : '—'} label={zh ? '最高分' : 'Maximum'} tone={best ? 'flame' : 'muted'} />
              <StatTile icon={<HIcon.flag />} value={counts.mistakes} label={zh ? '待复习' : 'To review'} tone={counts.mistakes ? 'flag' : 'muted'} />
            </div>
          </div>
          {/* focus-area nudge */}
          {focus ? (
            <button type="button" onClick={() => drillSkill(focus.skill)} disabled={!pool}
              className="group flex w-full items-center gap-3 border-t px-6 py-3 text-left transition-colors disabled:opacity-60" style={{ borderColor: C.hairline, background: C.panel2 }}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style={{ background: NGS.grad }}><HIcon.spark /></span>
              <div className="min-w-0 flex-1">
                <span className="text-[13px] font-semibold" style={{ color: C.ink }}>{zh ? '建议重点：' : 'Focus area: '}</span>
                <span className="text-[13px]" style={{ color: C.muted }}>{skillLabel(focus.skill, lang)} · {focus.pct}% {zh ? '正确率' : 'correct'}</span>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[13px] font-bold" style={{ color: NGS.violet }}>{zh ? '去练' : 'Drill it'} <HIcon.arrow /></span>
            </button>
          ) : null}
        </section>

        {/* hero: full mock */}
        <button type="button" onClick={() => setMode('mock')} disabled={!pool}
          className="group relative mt-5 flex w-full items-center gap-5 overflow-hidden rounded-2xl px-7 py-6 text-left text-white shadow-[0_28px_70px_-30px_rgba(180,30,140,0.6)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: NGS.grad }}>
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)' }} />
          <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur"><HIcon.exam /></span>
          <div className="relative min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{zh ? 'Bluebook 自适应考试' : 'Adaptive Bluebook exam'}</div>
            <h2 className="mt-0.5 text-[22px] font-extrabold leading-tight">{zh ? '完整限时模考' : 'Full Mock Test'}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] font-medium text-white/85">
              <span>2 {zh ? '科目 · 自适应模块' : 'sections · adaptive'}</span><span>Desmos</span><span>{zh ? '400–1600 预估分' : '400–1600 estimated'}</span>
            </div>
          </div>
          <span className="relative flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[14px] font-bold" style={{ color: NGS.violet }}>
            {zh ? '开始' : 'Begin'} <span className="transition-transform group-hover:translate-x-0.5"><HIcon.arrow /></span>
          </span>
        </button>

        {/* tool grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ToolCard accent={NGS.cyan} icon={<HIcon.target />} title={zh ? '按考点刷题' : 'Practice by Skill'} sub={zh ? '无限时练习' : 'Untimed drills'}
            blurb={zh ? '按部分、领域、考点、难度选题，即时批改 + AI 讲解。' : 'Filter by section, domain, skill & difficulty. Instant feedback + AI explanations.'}
            stat={pool ? (zh ? `${pool.length} 题` : `${pool.length} questions`) : undefined} onClick={() => setMode('setup')} disabled={!pool} />
          <ToolCard accent={NGS.magenta} icon={<HIcon.notebook />} title={zh ? '错题本' : 'Mistake Notebook'} sub={zh ? '自动收集' : 'Auto-collected'}
            blurb={zh ? '做错的题自动归档，可筛选、重做、间隔复习。' : 'Every miss is filed away for focused review and spaced repetition.'}
            stat={counts.mistakes ? (zh ? `${counts.mistakes} 待复习${counts.due ? ` · ${counts.due} 到期` : ''}` : `${counts.mistakes} to review${counts.due ? ` · ${counts.due} due` : ''}`) : undefined}
            statTone="flag" onClick={() => setMode('notebook')} disabled={!pool} />
          <ToolCard accent={NGS.violet} icon={<HIcon.chart />} title={zh ? '数据看板' : 'Progress Dashboard'} sub={zh ? '进度与预估分' : 'Insights'}
            blurb={zh ? '各考点正确率、每题用时、进步曲线与预测分。' : 'Accuracy by skill, time per question, trends, and your predicted score.'}
            stat={accuracy == null ? undefined : (zh ? `${accuracy}% 正确率` : `${accuracy}% accuracy`)} statTone="good" onClick={() => setMode('dashboard')} />
          <ToolCard accent="#b02fc9" icon={<HIcon.vocab />} title={zh ? '生词本' : 'Vocabulary'} sub={zh ? '自测模式' : 'Self-quiz'}
            blurb={zh ? '收藏阅读中的生词，附语境，支持隐藏释义自测。' : 'Save words from passages with context; hide meanings to test yourself.'}
            stat={counts.vocab ? (zh ? `${counts.vocab} 词` : `${counts.vocab} words`) : undefined} onClick={() => setMode('vocab')} />
        </div>

        {!pool ? <p className="mt-6 text-center text-[13px]" style={{ color: C.muted }}>{zh ? '正在加载题库…' : 'Loading question bank…'}</p> : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- pieces */

function StatTile({ icon, value, label, tone = 'ink' }: { icon: ReactNode; value: ReactNode; label: string; tone?: 'ink' | 'muted' | 'good' | 'blue' | 'flag' | 'flame' }) {
  const color = tone === 'good' ? C.good : tone === 'blue' ? C.blue : tone === 'flag' ? C.flag : tone === 'flame' ? '#f59e0b' : tone === 'muted' ? C.muted : C.ink;
  return (
    <div className="flex flex-col justify-center px-4 py-4" style={{ background: C.panel }}>
      <div className="flex items-center gap-1.5" style={{ color }}>{icon}<span className="text-[22px] font-extrabold leading-none">{value}</span></div>
      <div className="mt-1 text-[11px] font-medium" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}

function ToolCard({ icon, title, sub, blurb, stat, statTone, onClick, disabled, accent }: { icon: ReactNode; title: string; sub: string; blurb: string; stat?: string; statTone?: 'flag' | 'good'; onClick: () => void; disabled?: boolean; accent: string }) {
  const statColor = statTone === 'flag' ? C.flag : statTone === 'good' ? C.good : C.blue;
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="group relative flex flex-col overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-55 hover:shadow-[0_22px_48px_-24px_rgba(139,47,214,0.42)]"
      style={{ borderColor: C.border, background: C.panel }}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 55%, #000 12%))` }}>{icon}</span>
        <span className="translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" style={{ color: C.muted }}><HIcon.arrow /></span>
      </div>
      <h3 className="mt-4 text-[16.5px] font-bold" style={{ color: C.ink }}>{title}</h3>
      <div className="text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: accent }}>{sub}</div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: C.muted }}>{blurb}</p>
      {stat ? <span className="mt-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: statColor, background: statTone === 'flag' ? C.badBg : statTone === 'good' ? C.goodBg : C.tint }}>{stat}</span> : null}
    </button>
  );
}

function SyncBadge({ state }: { state: SyncState }) {
  const map: Record<SyncState, { text: string; color: string; bg: string }> = {
    off: { text: '💾 Saved on this device · 本机保存', color: C.muted, bg: C.hover },
    syncing: { text: '☁ Syncing… · 同步中', color: C.blue, bg: C.tint },
    synced: { text: '☁ Synced · 已同步', color: C.good, bg: C.goodBg },
    error: { text: '⚠ Sync unavailable · 同步不可用', color: C.flag, bg: C.badBg },
  };
  const s = map[state];
  return <span className="hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline" style={{ color: s.color, background: s.bg }}>{s.text}</span>;
}

/* line icons (currentColor) */
const sp = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const HIcon = {
  logo: () => (<svg width="18" height="18" viewBox="0 0 24 24" {...sp}><path d="M4 7l8-4 8 4-8 4-8-4z" /><path d="M4 7v6l8 4 8-4V7" /></svg>),
  exam: () => (<svg width="26" height="26" viewBox="0 0 24 24" {...sp}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>),
  target: () => (<svg width="22" height="22" viewBox="0 0 24 24" {...sp}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>),
  notebook: () => (<svg width="22" height="22" viewBox="0 0 24 24" {...sp}><path d="M6 3h11a2 2 0 0 1 2 2v16l-4-2-4 2-4-2V5a2 2 0 0 1 2-2z" /><path d="M9 7h6M9 11h6" /></svg>),
  chart: () => (<svg width="22" height="22" viewBox="0 0 24 24" {...sp}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>),
  vocab: () => (<svg width="22" height="22" viewBox="0 0 24 24" {...sp}><path d="M12 6c-1.5-1.2-4-2-7-2v13c3 0 5.5.8 7 2 1.5-1.2 4-2 7-2V4c-3 0-5.5.8-7 2z" /><path d="M12 6v13" /></svg>),
  flame: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c1 3-1 4-2 6-1 1.6-1 3 .5 4 .6-1 .8-1.8 1.5-2.4C13 12 14 13.5 14 15a2 2 0 1 1-4 0c0-.4.1-.7.2-1C8.8 15 8 16.4 8 18a4 4 0 1 0 8 0c0-4-2-6-4-8-.6-.6-.9-1.3 0-2z" /></svg>),
  check: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...sp}><path d="M4 12l5 5L20 6" /></svg>),
  gauge: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...sp}><path d="M4 15a8 8 0 0 1 16 0" /><path d="M12 15l4-3" /></svg>),
  trophy: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...sp}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 0-3 3" /></svg>),
  flag: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...sp}><path d="M6 21V4h11l-2 4 2 4H6" /></svg>),
  spark: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...sp}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>),
  arrow: () => (<svg width="16" height="16" viewBox="0 0 24 24" {...sp}><path d="M5 12h13M13 6l6 6-6 6" /></svg>),
};
