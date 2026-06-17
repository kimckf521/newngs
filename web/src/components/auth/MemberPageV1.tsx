'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import { navbar } from '@/content/navbar';
import type { Locale } from '@/i18n/types';
import { initials } from '@/lib/demoAuth';
import { getCurrentUser, logout, isRealAuth, type AuthUser } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/roles';
import { GlassCard, GradientText, ArrowRight, Aurora } from '@/components/redesign-v1/ui';

const content = {
  en: {
    welcome: (n: string) => `Welcome back, ${n.split(' ')[0]}`,
    sub: 'Here’s what’s happening in your learning journey.',
    signOut: 'Sign out',
    programmes: 'My programmes',
    viewAll: 'View all',
    complete: 'complete',
    upcoming: 'Upcoming sessions',
    join: 'Join',
    links: 'Quick links',
    demo: 'Demo member area — the data below is sample content for the front-end design.',
    progs: [
      { name: 'A-Level Mathematics', track: 'A-Level · IGCSE', progress: 72 },
      { name: 'IB Physics HL', track: 'IB Diploma', progress: 45 },
      { name: 'University Mentorship', track: 'College Readiness', progress: 30 },
    ],
    sessions: [
      { title: 'Calculus — Integration', mentor: 'with Jaydon Park', when: 'Tomorrow · 18:00' },
      { title: 'Personal Statement Review', mentor: 'with Nancy Wu', when: 'Thu · 20:00' },
    ],
    quick: (l: Locale) => [
      { label: 'Browse programmes', href: siteLinks[l].programs },
      { label: 'Admissions & fees', href: siteLinks[l].admissions },
      { label: 'Message a mentor', href: '#' },
      { label: 'Account settings', href: '#' },
    ],
  },
  zh: {
    welcome: (n: string) => `欢迎回来，${n.split(' ')[0]}`,
    sub: '看看你学习旅程中的最新动态。',
    signOut: '退出登录',
    programmes: '我的课程',
    viewAll: '查看全部',
    complete: '已完成',
    upcoming: '即将开始',
    join: '进入',
    links: '快捷入口',
    demo: '演示会员中心 —— 以下数据为前端设计的示例内容。',
    progs: [
      { name: 'A-Level 数学', track: 'A-Level · IGCSE', progress: 72 },
      { name: 'IB 物理 HL', track: 'IB 文凭', progress: 45 },
      { name: '名校升学辅导', track: '大学准备', progress: 30 },
    ],
    sessions: [
      { title: '微积分 —— 积分', mentor: '导师：Jaydon Park', when: '明天 · 18:00' },
      { title: '个人陈述评阅', mentor: '导师：Nancy Wu', when: '周四 · 20:00' },
    ],
    quick: (l: Locale) => [
      { label: '浏览课程', href: siteLinks[l].programs },
      { label: '课程与招生', href: siteLinks[l].admissions },
      { label: '联系导师', href: '#' },
      { label: '账户设置', href: '#' },
    ],
  },
} as const;

export function MemberPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const nav = navbar[locale];
  const langHref = locale === 'en' ? siteLinks.zh.member : siteLinks.en.member;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('v1-light') ? 'light' : 'dark');
    let active = true;
    void getCurrentUser().then((u) => {
      if (!active) return;
      if (!u) {
        router.replace(links.login);
        return;
      }
      setUser(u);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router, links.login]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('ngs-theme', next); } catch {}
    document.documentElement.classList.toggle('v1-light', next === 'light');
  };

  function signOut() {
    void logout().then(() => router.push(links.login));
  }

  if (!ready || !user) {
    return (
      <div className="ngs-redesign grid min-h-screen place-items-center bg-night font-sans text-white antialiased">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-ngs-violet" />
      </div>
    );
  }

  return (
    <div className="ngs-redesign min-h-screen bg-night font-sans text-white antialiased">
      {/* Member top bar */}
      <header className="border-b border-white/10 bg-night/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-page items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href={links.home} className="flex items-center gap-2.5">
            <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={32} height={32} className="h-8 w-8 object-contain" priority />
            <span className="font-grotesk text-[16px] font-bold tracking-tight text-white">
              NextGen<span className="font-normal text-white/65"> Scholars</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:text-white">
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4.2" /><path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20.5 14.8A8.2 8.2 0 0 1 9.2 3.5 7.3 7.3 0 1 0 20.5 14.8z" /></svg>
              )}
            </button>
            <Link href={langHref} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/50 hover:text-white">
              {nav.langSwitchLabel}
            </Link>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ngs-gradient text-sm font-bold text-white" aria-hidden>
              {initials(user.name)}
            </span>
            <button type="button" onClick={signOut} className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/50 hover:text-white">
              {t.signOut}
            </button>
          </div>
        </div>
      </header>

      {/* Welcome */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <Aurora />
        <div className="relative mx-auto max-w-page px-6 py-14 sm:px-8 lg:px-10">
          <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            {ROLE_LABELS[locale][user.role]}
          </span>
          <h1 className="font-grotesk text-[2.2rem] font-bold tracking-tight text-white sm:text-[2.7rem]">{t.welcome(user.name)}</h1>
          <p className="mt-3 text-white/60">{t.sub}</p>
        </div>
      </section>

      <main className="mx-auto max-w-page px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Programmes */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-grotesk text-xl font-bold text-white">{t.programmes}</h2>
              <Link href={links.programs} className="text-sm font-medium text-white/60 transition-colors hover:text-white">{t.viewAll}</Link>
            </div>
            <div className="space-y-4">
              {t.progs.map((p) => (
                <GlassCard key={p.name} className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h3 className="font-grotesk text-lg font-bold text-white">{p.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">{p.track}</p>
                    </div>
                    <span className="font-grotesk text-lg font-bold"><GradientText>{p.progress}%</GradientText></span>
                  </div>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-ngs-gradient" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/40">{p.progress}% {t.complete}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Sidebar: upcoming + quick links */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-5 font-grotesk text-xl font-bold text-white">{t.upcoming}</h2>
              <div className="space-y-4">
                {t.sessions.map((s) => (
                  <GlassCard key={s.title} className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ngs-cyan">{s.when}</p>
                    <h3 className="mt-2 font-grotesk text-[15px] font-bold text-white">{s.title}</h3>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="text-sm text-white/55">{s.mentor}</p>
                      <button type="button" className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]">{t.join}</button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-5 font-grotesk text-xl font-bold text-white">{t.links}</h2>
              <GlassCard className="divide-y divide-white/10">
                {t.quick(locale).map((q) => (
                  <Link key={q.label} href={q.href} className="group flex items-center justify-between px-5 py-4 text-sm text-white/75 transition-colors hover:text-white">
                    {q.label}
                    <ArrowRight className="text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                ))}
              </GlassCard>
            </div>
          </div>
        </div>

        {!isRealAuth() && <p className="mt-10 text-xs italic text-white/35">{t.demo}</p>}
      </main>
    </div>
  );
}
