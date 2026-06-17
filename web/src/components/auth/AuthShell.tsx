'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import { navbar } from '@/content/navbar';
import type { Locale } from '@/i18n/types';
import { Aurora, GradientText, CheckIcon } from '@/components/redesign-v1/ui';

/* Focused split-screen auth layout for the in-site member area. Left: a
   dark brand panel (aurora + value points). Right: the form. Top bar has a
   back-to-site link, language switch and the light/dark toggle. Uses v1
   utility classes so the .v1-light theme applies here too. */

const content = {
  en: {
    back: 'Back to site',
    eyebrow: 'NGS Member Area',
    title: (
      <>
        Your global education, <GradientText>in one place.</GradientText>
      </>
    ),
    sub: 'Sign in to follow your programmes, mentors and progress — and stay connected to the NextGen Scholars community.',
    points: ['Track your programmes & progress', 'Message your mentors directly', 'Access exclusive member resources'],
  },
  zh: {
    back: '返回网站',
    eyebrow: 'NGS 会员中心',
    title: (
      <>
        你的国际教育，<GradientText>尽在一处。</GradientText>
      </>
    ),
    sub: '登录以追踪你的课程、导师与学习进度，并与 NextGen Scholars 社区保持连接。',
    points: ['追踪课程与学习进度', '直接与导师沟通', '获取专属会员资源'],
  },
} as const;

export function AuthShell({ locale, langHref, children }: { locale: Locale; langHref: string; children: ReactNode }) {
  const t = content[locale];
  const nav = navbar[locale];
  const home = siteLinks[locale].home;

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('v1-light') ? 'light' : 'dark');
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('ngs-theme', next); } catch {}
    document.documentElement.classList.toggle('v1-light', next === 'light');
  };
  const themeLabel =
    locale === 'zh'
      ? theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
      : theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div className="ngs-redesign min-h-screen bg-night font-inter text-white antialiased">
      <header className="flex h-[72px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link href={home} className="flex items-center gap-2.5">
          <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={34} height={34} className="h-8 w-8 object-contain" priority />
          <span className="font-grotesk text-[16px] font-bold tracking-tight text-white">
            NextGen<span className="font-normal text-white/65"> Scholars</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={home} className="hidden items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white sm:inline-flex">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M15 8H2M7 3L2 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t.back}
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:text-white"
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20.5 14.8A8.2 8.2 0 0 1 9.2 3.5 7.3 7.3 0 1 0 20.5 14.8z" />
              </svg>
            )}
          </button>
          <Link href={langHref} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/50 hover:text-white">
            {nav.langSwitchLabel}
          </Link>
        </div>
      </header>

      <div className="grid lg:min-h-[calc(100vh_-_72px)] lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden overflow-hidden border-r border-white/10 bg-night-800 lg:block">
          <Aurora />
          <div className="relative flex h-full max-w-xl flex-col justify-center p-12 xl:p-16">
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-ngs-gradient" aria-hidden />
              {t.eyebrow}
            </span>
            <h2 className="mt-6 font-grotesk text-[2.3rem] font-bold leading-[1.1] tracking-[-0.01em] text-white xl:text-[2.8rem]">
              {t.title}
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70">{t.sub}</p>
            <ul className="mt-10 space-y-4">
              {t.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] text-white/80">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ngs-cyan ring-1 ring-white/10">
                    <CheckIcon />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form area */}
        <div className="flex items-center justify-center px-6 py-14 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
