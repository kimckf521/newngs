'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { initials } from '@/lib/demoAuth';
import { siteLinks } from '@/lib/siteLinks';
import { getCurrentUser, logout } from '@/lib/auth';
import { Icon } from '@/components/member/design-v1/parts';
import { adminConsoleContent, type AdminSectionKey } from './adminConsole.content';
import { DashboardSection } from './DashboardSection';
import { CoursesSection } from './CoursesSection';
import { MembersSection } from './MembersSection';
import { CollegeSection, type CollegeSectionKey } from './college/CollegeSection';

/* The admin console reuses the design-v1 portal look (dark via `.dv1-dark`).
   Sidebar nav switches Dashboard/Courses/Members + the platform-side College
   group (学院管理); Site Editor / Live Chat / My College are links out. */
const NAV: { key: AdminSectionKey; icon: string }[] = [
  { key: 'dashboard', icon: 'dashboard' },
  { key: 'courses', icon: 'book' },
  { key: 'members', icon: 'user' },
];
// Platform-side multi-tenant management (manage all partner colleges).
const COLLEGE_NAV: { key: AdminSectionKey; icon: string }[] = [
  { key: 'colleges', icon: 'building' },
  { key: 'authorizations', icon: 'key' },
  { key: 'teachers', icon: 'user' },
  { key: 'classes', icon: 'users' },
  { key: 'assignments', icon: 'clipboard' },
  { key: 'resources', icon: 'folder' },
];
const COLLEGE_KEYS = COLLEGE_NAV.map((n) => n.key);

const navItemCls = (active?: boolean) =>
  `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    active ? 'bg-gradient-to-r from-ngs-magenta/10 via-ngs-violet/10 to-ngs-cyan/10 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`;
const navIconCls = (active?: boolean) =>
  `grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
    active ? 'bg-ngs-gradient text-white shadow-[0_6px_16px_-6px_rgba(139,47,214,0.7)]' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
  }`;

export function AdminConsole({ locale }: { locale: Locale }) {
  const t = adminConsoleContent[locale];
  const [section, setSection] = useState<AdminSectionKey>('dashboard');
  const [dark, setDark] = useState(true);
  const [profile, setProfile] = useState({ name: 'Admin', email: '' });

  useEffect(() => {
    document.documentElement.classList.remove('v1-light');
    void getCurrentUser().then((u) => {
      if (u) setProfile({ name: u.name || 'Admin', email: u.email || '' });
    });
  }, []);

  const NavBtn = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) => (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={navItemCls(active)}>
      <span className={navIconCls(active)}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      {label}
    </button>
  );
  const NavLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
    <Link href={href} className={navItemCls(false)}>
      <span className={navIconCls(false)}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      {label}
    </Link>
  );

  return (
    <div className={`dv1 min-h-screen font-sans antialiased ${dark ? 'dv1-dark' : ''}`}>
      <div className="mx-auto flex max-w-[1440px]">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-5 lg:flex">
          <Link href={siteLinks[locale].home} className="flex items-center gap-2.5 px-2">
            <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={30} height={30} className="h-7 w-7 object-contain" />
            <span className="font-grotesk text-[15px] font-bold tracking-tight text-slate-900">
              NextGen<span className="font-medium text-slate-400"> Scholars</span>
            </span>
          </Link>

          <nav className="mt-7 flex-1 space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.navGroups.main}</p>
            {NAV.map((n) => (
              <NavBtn key={n.key} icon={n.icon} label={t.nav[n.key]} active={section === n.key} onClick={() => setSection(n.key)} />
            ))}
            <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.navGroups.college}</p>
            {COLLEGE_NAV.map((n) => (
              <NavBtn key={n.key} icon={n.icon} label={t.nav[n.key]} active={section === n.key} onClick={() => setSection(n.key)} />
            ))}
            <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.navGroups.more}</p>
            <NavLink href="/admin/page-list" icon="edit" label={t.nav.siteEditor} />
            <NavLink href="/admin/inbox" icon="chat" label={t.nav.liveChat} />
            <NavLink href="/admin/my-college" icon="building" label={t.nav.myCollege} />
          </nav>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ngs-gradient text-sm font-bold text-white">{initials(profile.name)}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900">{profile.name}</p>
              <p className="truncate text-[11px] text-slate-400">{t.role}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout().then(() => { window.location.href = siteLinks[locale].login; })}
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
            >
              <Icon name="logout" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </aside>

        {/* ── Main column ─────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-[var(--dv1-topbar)] px-5 py-3 backdrop-blur-xl sm:px-8 lg:px-10">
            <Link href={siteLinks[locale].home} className="flex items-center gap-2 lg:hidden">
              <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={26} height={26} className="h-6 w-6 object-contain" />
            </Link>
            <label className="relative hidden max-w-md flex-1 sm:block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" className="h-4 w-4" />
              </span>
              <input
                placeholder={t.search}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 focus:ring-2 focus:ring-ngs-violet/15"
              />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 sm:inline-block">{t.brandTag}</span>
              <button type="button" onClick={() => setDark((v) => !v)} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-800">
                <Icon name={dark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ngs-gradient text-sm font-bold text-white">{initials(profile.name)}</span>
            </div>
          </header>

          {/* Mobile section nav */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200/70 bg-white px-5 py-2.5 lg:hidden">
            {[...NAV, ...COLLEGE_NAV].map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setSection(n.key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${section === n.key ? 'bg-ngs-gradient text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {t.nav[n.key]}
              </button>
            ))}
            <Link href="/admin/page-list" className="shrink-0 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-500">
              {t.nav.siteEditor}
            </Link>
            <Link href="/admin/inbox" className="shrink-0 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-500">
              {t.nav.liveChat}
            </Link>
          </div>

          <main className="px-5 py-7 sm:px-8 lg:px-10">
            {section === 'dashboard' && <DashboardSection locale={locale} name={profile.name} onNavigate={setSection} />}
            {section === 'courses' && <CoursesSection locale={locale} />}
            {section === 'members' && <MembersSection locale={locale} />}
            {COLLEGE_KEYS.includes(section) && <CollegeSection locale={locale} section={section as CollegeSectionKey} />}
          </main>
        </div>
      </div>
    </div>
  );
}
