'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ColorTheme, TextSize } from './types';
import { ReadingSection } from './ReadingSection';
import { ListeningSection } from './ListeningSection';
import { WritingSection } from './WritingSection';
import { SpeakingSection } from './SpeakingSection';
import { MistakeNotebook } from './MistakeNotebook';
import { ProgressDashboard } from './ProgressDashboard';
import { VocabBook } from './VocabBook';
import { Aurora, FaintGrid, GradientText } from '@/components/redesign-v1/ui';
import {
  bestBand, getStats, latestBands, predictedOverall, quickCounts, SKILL_LABELS, type Skill,
} from '@/lib/ielts/progress';

type Mode = 'hub' | Skill | 'library' | 'notebook' | 'dashboard' | 'vocab';
type Lang = 'zh' | 'en';

const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking'];
const SKILL_DESC: Record<Skill, { zh: string; en: string }> = {
  listening: { zh: '4 部分 · 音频', en: '4 parts · audio' },
  reading: { zh: '3 篇 · 40 题', en: '3 passages · 40 Qs' },
  writing: { zh: 'AI 批改 · 4 项评分', en: 'AI-marked · 4 criteria' },
  speaking: { zh: '指导练习 · AI 考官', en: 'guided · AI examiner' },
};

type Snap = {
  overall: number | null;
  bands: Partial<Record<Skill, number>>;
  best: number | null;
  answered: number;
  accuracy: number | null;
  streak: number;
  counts: { mistakes: number; due: number; vocab: number };
};

function readSnap(): Snap {
  const stats = getStats();
  return {
    overall: predictedOverall()?.overall ?? null,
    bands: latestBands(),
    best: bestBand(),
    answered: stats.totalAnswered,
    accuracy: stats.totalAnswered ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : null,
    streak: stats.streakDays,
    counts: quickCounts(),
  };
}
const EMPTY_SNAP: Snap = { overall: null, bands: {}, best: null, answered: 0, accuracy: null, streak: 0, counts: { mistakes: 0, due: 0, vocab: 0 } };

const band1 = (b: number | null | undefined) => (typeof b === 'number' ? b.toFixed(1) : '—');

export function IeltsMockTest() {
  const [mode, setMode] = useState<Mode>('hub');
  const [theme, setTheme] = useState<ColorTheme>('default');
  const [size, setSize] = useState<TextSize>('standard');
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('zh');
  // Seed empty so SSR and first client render match; populate after mount.
  const [snap, setSnap] = useState<Snap>(EMPTY_SNAP);

  const refresh = useCallback(() => setSnap(readSnap()), []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const h = () => refresh();
    window.addEventListener('ngs-ielts-progress', h);
    return () => window.removeEventListener('ngs-ielts-progress', h);
  }, [refresh]);

  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en);
  const sectionProps = { theme, size, setTheme, setSize, onExit: () => { setMode('hub'); refresh(); } };
  const panelProps = { lang, onBack: () => { setMode('hub'); refresh(); } };

  if (mode === 'listening') return <ListeningSection {...sectionProps} />;
  if (mode === 'reading') return <ReadingSection {...sectionProps} />;
  if (mode === 'writing') return <WritingSection {...sectionProps} />;
  if (mode === 'speaking') return <SpeakingSection {...sectionProps} />;
  if (mode === 'notebook') return <MistakeNotebook {...panelProps} />;
  if (mode === 'dashboard') return <ProgressDashboard {...panelProps} />;
  if (mode === 'vocab') return <VocabBook {...panelProps} />;
  if (mode === 'library') return <LibraryPanel lang={lang} onBack={() => setMode('hub')} onPick={(s) => setMode(s)} />;

  const subBands = `L ${band1(snap.bands.listening)} · R ${band1(snap.bands.reading)} · W ${band1(snap.bands.writing)} · S ${band1(snap.bands.speaking)}`;
  const stats: { icon: string; value: string; label: string }[] = [
    { icon: '🔥', value: String(snap.streak), label: t('连续天数', 'Day streak') },
    { icon: '✅', value: String(snap.answered), label: t('已做题', 'Answered') },
    { icon: '🏆', value: band1(snap.best), label: t('最高分', 'Best band') },
    { icon: '🚩', value: String(snap.counts.mistakes), label: t('待复习', 'To review') },
  ];
  const tools: { key: Extract<Mode, 'library' | 'notebook' | 'dashboard' | 'vocab'>; icon: string; zh: string; en: string; meta: string }[] = [
    { key: 'library', icon: '📚', zh: '题库', en: 'Library', meta: t('Cam 15 · Test 1', 'Cam 15 · Test 1') },
    { key: 'notebook', icon: '📓', zh: '错题本', en: 'Notebook', meta: t(`按题型 · ${snap.counts.due} 到期`, `by type · ${snap.counts.due} due`) },
    { key: 'dashboard', icon: '📊', zh: '数据看板', en: 'Dashboard', meta: snap.accuracy == null ? t('题型正确率', 'Accuracy by type') : t(`正确率 ${snap.accuracy}%`, `${snap.accuracy}% correct`) },
    { key: 'vocab', icon: '📖', zh: '生词本', en: 'Vocabulary', meta: t(`${snap.counts.vocab} 词`, `${snap.counts.vocab} words`) },
  ];

  return (
    <div className={`ngs-redesign fixed inset-0 z-[60] overflow-y-auto ${dark ? '' : 'v1-light'}`}>
      <div className="relative min-h-full bg-night font-sans text-white antialiased">
        <Aurora />
        <FaintGrid />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 lg:px-8">
          {/* top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ngs-gradient-soft text-lg ring-1 ring-white/10" aria-hidden>🎧</span>
              <h1 className="font-grotesk text-xl font-bold tracking-tight text-white sm:text-2xl">
                IELTS <GradientText>备考中心</GradientText> · Practice Center
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-[11px] text-white/45 sm:flex">
                <span aria-hidden>💾</span> {t('本机保存', 'Saved on this device')}
              </span>
              <div className="flex overflow-hidden rounded-full border border-white/20 text-[11px]">
                <button type="button" onClick={() => setLang('en')} className={`px-2.5 py-1 ${lang === 'en' ? 'bg-white/15 font-bold text-white' : 'text-white/60'}`}>EN</button>
                <button type="button" onClick={() => setLang('zh')} className={`px-2.5 py-1 ${lang === 'zh' ? 'bg-white/15 font-bold text-white' : 'text-white/60'}`}>中</button>
              </div>
              <button
                type="button"
                onClick={() => setDark((v) => !v)}
                aria-label="Toggle theme"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/5 text-white/85 transition-colors hover:border-white/50 hover:text-white"
              >
                {dark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* header stats */}
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-6">
            <div className="col-span-2 rounded-2xl bg-ngs-gradient-soft p-5 ring-1 ring-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ngs-cyan">{t('预测总分', 'Predicted overall')}</div>
              {snap.overall == null ? (
                <>
                  <div className="mt-1 font-grotesk text-2xl font-bold leading-tight text-white">{t('完成两项技能即解锁', 'Attempt two skills')}</div>
                  <div className="mt-1 text-[12px] text-white/55">{t('做完任意两个科目后显示预测分', 'Finish any two sections to see a predicted band')}</div>
                </>
              ) : (
                <>
                  <div className="mt-0.5 font-grotesk text-[2.6rem] font-bold leading-none text-white">{snap.overall.toFixed(1)}</div>
                  <div className="mt-2 text-[12px] font-semibold tracking-wide text-white/70">{subBands}</div>
                </>
              )}
            </div>
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-base" aria-hidden>{s.icon}</div>
                <div className="mt-1 font-grotesk text-2xl font-bold leading-none text-white">{s.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-white/45">{s.label}</div>
              </div>
            ))}
          </div>

          {/* skill cards */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {SKILLS.map((s) => (
              <button key={s} type="button" onClick={() => setMode(s)} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-ngs-cyan/40 hover:bg-white/[0.07]">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-ngs-gradient-soft text-lg ring-1 ring-white/10" aria-hidden>{SKILL_LABELS[s].icon}</span>
                  <span className="font-grotesk text-lg font-bold text-white">{band1(snap.bands[s])}</span>
                </div>
                <div className="mt-3 text-[15px] font-bold text-white">{SKILL_LABELS[s].zh} <span className="text-white/70">{SKILL_LABELS[s].en}</span></div>
                <div className="mt-1 text-[11px] text-white/45">{lang === 'zh' ? SKILL_DESC[s].zh : SKILL_DESC[s].en}</div>
              </button>
            ))}
          </div>

          {/* tool cards */}
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tools.map((tool) => (
              <button key={tool.key} type="button" onClick={() => setMode(tool.key)} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]">
                <div className="text-lg" aria-hidden>{tool.icon}</div>
                <div className="mt-2 text-[13px] font-bold text-white">{tool.zh} <span className="text-white/60">{tool.en}</span></div>
                <div className="mt-1 text-[11px] text-white/45">{tool.meta}</div>
              </button>
            ))}
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-white/35">
            {t(
              '提示：阅读与听力对照官方答案自动判分，写作与口语由 AI 依据评分标准打分。进度只保存在本机浏览器。',
              'Tip: Reading & Listening are auto-marked against the answer key; Writing & Speaking are AI-graded on the band descriptors. Progress is saved on this device only.',
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- test library (scaffold — one bundled test today) ---------- */

function LibraryPanel({ lang, onBack, onPick }: { lang: Lang; onBack: () => void; onPick: (s: Skill) => void }) {
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en);
  return (
    <div className="ngs-redesign fixed inset-0 z-[60] overflow-y-auto">
      <div className="relative min-h-full bg-night font-sans text-white antialiased">
        <Aurora />
        <FaintGrid />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-10">
          <button type="button" onClick={onBack} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/50">‹ {t('返回', 'Back')}</button>
          <h2 className="mt-5 font-grotesk text-2xl font-bold tracking-tight">{t('题库', 'Test library')}</h2>
          <p className="mt-1.5 text-sm text-white/55">{t('选择一套剑桥真题开始练习。', 'Pick a Cambridge test to sit.')}</p>

          <div className="mt-6 rounded-2xl border border-ngs-cyan/30 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">Cambridge IELTS 15 · Test 1</div>
                <div className="mt-0.5 text-[12px] text-white/50">{t('已就绪 · 四科可练', 'Ready · all four skills')}</div>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">{t('可练', 'Ready')}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <button key={s} type="button" onClick={() => onPick(s)} className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold hover:border-ngs-cyan/50 hover:bg-white/5">
                  {SKILL_LABELS[s].icon} {SKILL_LABELS[s].zh} {lang === 'en' ? SKILL_LABELS[s].en : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-[13px] text-white/55">
            <div className="font-bold text-white/80">{t('更多真题接入中', 'More tests coming')}</div>
            <p className="mt-1.5">{t(
              'Cambridge IELTS 1–21 的题目已在题库数据库中，正在接入选题器（阅读/听力自动判分、听力音频与听力原文）。',
              'Cambridge IELTS 1–21 already live in the question-bank database; the picker (auto-marked Reading/Listening, audio and tapescripts) is being wired in.',
            )}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
