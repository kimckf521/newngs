'use client';

import { useState } from 'react';
import type { ColorTheme, TextSize } from './types';
import { ReadingSection } from './ReadingSection';
import { ListeningSection } from './ListeningSection';
import { WritingSection } from './WritingSection';
import { SpeakingSection } from './SpeakingSection';
import { AiExaminer } from './AiExaminer';
import { GlassCard, GradientText, Aurora, FaintGrid, Kicker, ArrowRight } from '@/components/redesign-v1/ui';

type Section = 'home' | 'listening' | 'reading' | 'writing' | 'speaking' | 'ai-examiner';

const CARDS: { key: Section; title: string; meta: string; blurb: string; icon: string }[] = [
  { key: 'listening', title: 'Listening', meta: '~30 min · 40 questions · audio', blurb: 'Four parts, one continuous recording. Forms, notes, multiple choice and matching.', icon: '🎧' },
  { key: 'reading', title: 'Academic Reading', meta: '60 min · 40 questions · 3 passages', blurb: 'Split-screen passages with highlighting. True/False/Not Given, matching, gap-fill and more.', icon: '📖' },
  { key: 'writing', title: 'Academic Writing', meta: '60 min · 2 tasks · band score', blurb: 'Task 1 (150 words) and Task 2 (250 words). AI-marked on the four IELTS criteria, with feedback in English and Chinese.', icon: '✍️' },
  { key: 'speaking', title: 'Speaking', meta: '~11–14 min · 3 parts · record', blurb: 'Examiner prompts and a cue card with the real 1-min prep / 2-min talk timers. Record yourself and play it back.', icon: '🎙️' },
  { key: 'ai-examiner', title: 'AI Examiner', meta: 'live conversation · band score', blurb: 'A talking AI examiner asks, listens to your spoken answers, adapts to your level, then grades you on the IELTS criteria.', icon: '🤖' },
];

export function IeltsMockTest() {
  const [section, setSection] = useState<Section>('home');
  const [theme, setTheme] = useState<ColorTheme>('default');
  const [size, setSize] = useState<TextSize>('standard');
  const [dark, setDark] = useState(true);

  const props = { theme, size, setTheme, setSize, onExit: () => setSection('home') };

  if (section === 'reading') return <ReadingSection {...props} />;
  if (section === 'listening') return <ListeningSection {...props} />;
  if (section === 'writing') return <WritingSection {...props} />;
  if (section === 'speaking') return <SpeakingSection {...props} />;
  if (section === 'ai-examiner') return <AiExaminer {...props} />;

  return (
    <div className={`ngs-redesign fixed inset-0 z-[60] overflow-y-auto ${dark ? '' : 'v1-light'}`}>
      <div className="relative min-h-full bg-night font-sans text-white antialiased">
      <Aurora />
      <FaintGrid />

      <button
        type="button"
        onClick={() => setDark((v) => !v)}
        aria-label="Toggle theme"
        className="absolute right-5 top-5 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-white/85 backdrop-blur transition-colors hover:border-white/50 hover:text-white sm:right-8 sm:top-8"
      >
        {dark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" /></svg>
        )}
      </button>

      <div className="relative z-10 mx-auto flex min-h-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-10">
        <Kicker>IELTS on computer · practice</Kicker>
        <h1 className="mt-5 font-grotesk text-[2.4rem] font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl">
          Cambridge IELTS 15 — <GradientText>Test 1</GradientText>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
          A faithful simulation of the computer-delivered IELTS interface. Choose a section to begin. Every section is
          marked to a band score following the IELTS scheme — Listening &amp; Reading against the official answer key, and
          Writing &amp; Speaking by AI on the band descriptors (Writing feedback comes in both English and Chinese).
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map((c) => (
            <button key={c.key} type="button" onClick={() => setSection(c.key)} className="group block h-full text-left">
              <GlassCard hover className="flex h-full flex-col p-6 transition duration-300 group-hover:-translate-y-1.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ngs-gradient-soft text-2xl ring-1 ring-white/10" aria-hidden>{c.icon}</span>
                <h3 className="mt-5 font-grotesk text-lg font-bold tracking-tight text-white">{c.title}</h3>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ngs-cyan">{c.meta}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">{c.blurb}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-white">
                  <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                    Start section
                  </span>
                  <ArrowRight className="text-ngs-cyan transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </GlassCard>
            </button>
          ))}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-white/40">
          Tip: use the in-test Settings for text size and colour themes. This is a practice tool — in the real exam each
          section is timed separately and the Listening audio plays only once.
        </p>
      </div>
      </div>
    </div>
  );
}
