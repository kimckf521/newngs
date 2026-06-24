'use client';

import { useState } from 'react';
import type { ColorTheme, TextSize } from './types';
import { ReadingSection } from './ReadingSection';
import { ListeningSection } from './ListeningSection';
import { WritingSection } from './WritingSection';
import { SpeakingSection } from './SpeakingSection';
import { AiExaminer } from './AiExaminer';

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

  const props = { theme, size, setTheme, setSize, onExit: () => setSection('home') };

  if (section === 'reading') return <ReadingSection {...props} />;
  if (section === 'listening') return <ListeningSection {...props} />;
  if (section === 'writing') return <WritingSection {...props} />;
  if (section === 'speaking') return <SpeakingSection {...props} />;
  if (section === 'ai-examiner') return <AiExaminer {...props} />;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#f4f5f7] text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center px-6 py-12">
        <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-[#1565c0]">IELTS on computer · practice</div>
        <h1 className="text-[28px] font-bold leading-tight">Cambridge IELTS 15 — Test 1</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[#555]">
          A faithful simulation of the computer-delivered IELTS interface. Choose a section to begin. Every section is
          marked to a band score following the IELTS scheme — Listening &amp; Reading against the official answer key, and
          Writing &amp; Speaking by AI on the band descriptors (Writing feedback comes in both English and Chinese).
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSection(c.key)}
              className="group flex flex-col rounded-xl border border-[#e2e2e6] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1565c0] hover:shadow-md"
            >
              <span className="text-[28px]" aria-hidden>{c.icon}</span>
              <span className="mt-3 text-[17px] font-bold">{c.title}</span>
              <span className="mt-0.5 text-[12px] font-bold text-[#1565c0]">{c.meta}</span>
              <span className="mt-2 text-[13px] leading-relaxed text-[#666]">{c.blurb}</span>
              <span className="mt-4 text-[13px] font-bold text-[#1565c0] group-hover:underline">Start section ›</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-[12px] text-[#999]">
          Tip: use the in-test Settings for text size and colour themes. This is a practice tool — in the real exam each
          section is timed separately and the Listening audio plays only once.
        </p>
      </div>
    </div>
  );
}
