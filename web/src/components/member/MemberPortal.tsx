'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { siteLinks } from '@/lib/siteLinks';
import { navbar } from '@/content/navbar';
import type { Locale } from '@/i18n/types';
import { initials } from '@/lib/demoAuth';
import { getCurrentUser, logout, isRealAuth, type AuthUser } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/roles';
import { Aurora } from '@/components/redesign-v1/ui';
import { memberContent, type TabKey } from './memberContent';
import { DashboardPanel, AccountPanel, ProgressPanel, ForumsPanel } from './MemberPanels';

/* ------------------------------------------------------------------ *
 * Member portal shell: auth gate, top bar, four-tab nav, active panel.
 * Tabs swap content in place (client state) to mirror the source LMS,
 * rendered entirely in the NGS premium dark/glass theme.
 * ------------------------------------------------------------------ */

const TAB_ORDER: TabKey[] = ['dashboard', 'account', 'progress', 'forums'];

function TabIcon({ tab }: { tab: TabKey }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (tab) {
    case 'dashboard':
      return <svg {...common}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>;
    case 'account':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5h.01" /></svg>;
    case 'progress':
      return <svg {...common}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.5A1.5 1.5 0 0 0 5 20V4.5z" /><path d="M9 8h6" /></svg>;
    case 'forums':
      return <svg {...common}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5V6a1 1 0 0 1 1-1z" /></svg>;
  }
}

export function MemberPortal({ locale }: { locale: Locale }) {
  const t = memberContent[locale];
  const links = siteLinks[locale];
  const nav = navbar[locale];
  const langHref = locale === 'en' ? siteLinks.zh.member : siteLinks.en.member;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [tab, setTab] = useState<TabKey>('dashboard');

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
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try { localStorage.setItem('ngs-theme', nextTheme); } catch {}
    document.documentElement.classList.toggle('v1-light', nextTheme === 'light');
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

  let panel: ReactNode;
  switch (tab) {
    case 'account':
      panel = <AccountPanel t={t} user={user} />;
      break;
    case 'progress':
      panel = <ProgressPanel t={t} onLogout={signOut} />;
      break;
    case 'forums':
      panel = <ForumsPanel t={t} />;
      break;
    default:
      panel = <DashboardPanel t={t} user={user} onTab={setTab} onLogout={signOut} />;
  }

  return (
    <div className="ngs-redesign min-h-screen bg-night font-sans text-white antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-night/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-page items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href={links.home} className="flex items-center gap-2.5">
            <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={30} height={30} className="h-7 w-7 object-contain" priority />
            <span className="hidden font-grotesk text-[15px] font-bold tracking-tight text-white sm:inline">
              NextGen<span className="font-normal text-white/65"> Scholars</span>
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:text-white">
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4.2" /><path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20.5 14.8A8.2 8.2 0 0 1 9.2 3.5 7.3 7.3 0 1 0 20.5 14.8z" /></svg>
              )}
            </button>
            <Link href={langHref} className="hidden rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/50 hover:text-white sm:inline-block">
              {nav.langSwitchLabel}
            </Link>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ngs-gradient text-xs font-bold text-white" aria-hidden title={ROLE_LABELS[locale][user.role]}>
              {initials(user.name)}
            </span>
            <button type="button" onClick={signOut} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/50 hover:text-white">
              {t.signOut}
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <nav className="mx-auto max-w-page px-2 sm:px-6 lg:px-8" aria-label={t.tabs.dashboard}>
          <div className="flex gap-1 overflow-x-auto">
            {TAB_ORDER.map((k) => {
              const activeTab = k === tab;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  aria-current={activeTab ? 'page' : undefined}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-3 text-[13px] font-semibold transition-colors sm:text-sm ${
                    activeTab ? 'text-white' : 'text-white/55 hover:text-white/85'
                  }`}
                >
                  <TabIcon tab={k} />
                  {t.tabs[k]}
                  {activeTab && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ngs-gradient" />}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Welcome glow band */}
      <div className="relative isolate overflow-hidden border-b border-white/10">
        <Aurora />
        <div className="relative mx-auto flex max-w-page items-center gap-3 px-6 py-5 sm:px-8 lg:px-10">
          <span className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            {ROLE_LABELS[locale][user.role]}
          </span>
          <span className="text-sm text-white/55">{t.tabs[tab]}</span>
        </div>
      </div>

      <main className="mx-auto max-w-page px-5 py-10 sm:px-8 lg:px-10">
        {panel}
        {!isRealAuth() && <p className="mt-10 text-xs italic text-white/35">{t.demo}</p>}
      </main>
    </div>
  );
}
