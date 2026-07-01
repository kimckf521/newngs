'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import { initials } from '@/lib/demoAuth';
import { getCurrentUser, logout, type AuthUser } from '@/lib/auth';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { siteLinks } from '@/lib/siteLinks';
import { memberContent } from '../memberContent';
import { dv1, type SectionKey } from './data';
import { Card, Icon, ProgressRing, Bar, GradientButton, SoftButton } from './parts';
import { MemberCourseCard } from './MemberCourseCard';

/* ================================================================== *
 * Student portal — modern light "app dashboard" (the default at /student).
 * Auth-gated with the real logged-in user; course/note data is still sample.
 * ================================================================== */

const NAV_MAIN: { key: SectionKey; icon: string }[] = [
  { key: 'dashboard', icon: 'dashboard' },
  { key: 'courses', icon: 'book' },
  { key: 'account', icon: 'user' },
  { key: 'forums', icon: 'chat' },
];

export function MemberDesignV1({ locale }: { locale: Locale }) {
  const t = dv1[locale];
  const m = memberContent[locale];
  const [section, setSection] = useState<SectionKey>('dashboard');
  const [dark, setDark] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const loginHref = siteLinks[locale].login;

  // Gate the portal: redirect to login when signed out, bounce admins to their
  // own /admin console, otherwise load the real user. (Checking here — before
  // setReady — keeps admins from flashing the student portal on the way out.)
  useEffect(() => {
    let active = true;
    void getCurrentUser().then((u) => {
      if (!active) return;
      if (!u) { router.replace(loginHref); return; }
      if (u.role === 'admin') { router.replace('/admin'); return; }
      setUser(u);
      setReady(true);
    });
    return () => { active = false; };
  }, [router, loginHref]);

  // This design ships its own palette (light + .dv1-dark); ignore the site's
  // global v1-light toggle so .text-white on gradient cards stays white here.
  useEffect(() => {
    document.documentElement.classList.remove('v1-light');
  }, []);

  function signOut() { void logout().then(() => router.push(loginHref)); }

  if (!ready || !user) {
    return (
      <div className={`dv1 ${dark ? 'dv1-dark' : ''} grid min-h-screen place-items-center font-sans antialiased`}>
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-ngs-violet" />
      </div>
    );
  }

  const profile = { name: user.name, email: user.email, role: user.role };
  const courses = m.progress.courses;
  const overall = Math.round(courses.reduce((a, c) => a + c.progress, 0) / Math.max(1, courses.length));

  const NavItem = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? 'bg-gradient-to-r from-ngs-magenta/10 via-ngs-violet/10 to-ngs-cyan/10 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${active ? 'bg-ngs-gradient text-white shadow-[0_6px_16px_-6px_rgba(139,47,214,0.7)]' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'}`}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      {label}
    </button>
  );

  return (
    <div className={`dv1 min-h-screen font-sans antialiased ${dark ? 'dv1-dark' : ''}`}>
      <div className="mx-auto flex max-w-[1440px]">
        {/* ── Sidebar (desktop) ───────────────────────────────── */}
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-5 lg:flex">
          <Link href={siteLinks[locale].home} className="flex items-center gap-2.5 px-2">
            <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={30} height={30} className="h-7 w-7 object-contain" />
            <span className="font-grotesk text-[15px] font-bold tracking-tight text-slate-900">
              NextGen<span className="font-medium text-slate-400"> Scholars</span>
            </span>
          </Link>

          <nav className="mt-7 flex-1 space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.navGroups.main}</p>
            {NAV_MAIN.map((n) => (
              <NavItem key={n.key} icon={n.icon} label={t.nav[n.key]} active={section === n.key} onClick={() => setSection(n.key)} />
            ))}
            <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.navGroups.more}</p>
            <NavItem icon="folder" label={t.nav.resources} />
            <NavItem icon="help" label={t.nav.help} />
          </nav>

          {/* Profile + logout */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ngs-gradient text-sm font-bold text-white">{initials(profile.name)}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900">{profile.name}</p>
              <p className="truncate text-[11px] text-slate-400">{ROLE_LABELS[locale][profile.role]}</p>
            </div>
            <button type="button" onClick={signOut} aria-label={t.logout} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700">
              <Icon name="logout" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </aside>

        {/* ── Main column ─────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-[var(--dv1-topbar)] px-5 py-3 backdrop-blur-xl sm:px-8 lg:px-10">
            <Link href={siteLinks[locale].home} className="flex items-center gap-2 lg:hidden">
              <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={26} height={26} className="h-6 w-6 object-contain" />
            </Link>
            <label className="relative hidden max-w-md flex-1 sm:block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" className="h-4 w-4" /></span>
              <input placeholder={t.search} className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 focus:ring-2 focus:ring-ngs-violet/15" />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 sm:inline-block">{t.brandTag}</span>
              <button type="button" onClick={() => setDark((v) => !v)} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-800">
                <Icon name={dark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
              </button>
              <button type="button" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-800">
                <Icon name="bell" className="h-[18px] w-[18px]" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ngs-magenta" />
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ngs-gradient text-sm font-bold text-white">{initials(profile.name)}</span>
            </div>
          </header>

          {/* Mobile section nav */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200/70 bg-white px-5 py-2.5 lg:hidden">
            {NAV_MAIN.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setSection(n.key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${section === n.key ? 'bg-ngs-gradient text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {t.nav[n.key]}
              </button>
            ))}
          </div>

          <main className="px-5 py-7 sm:px-8 lg:px-10">
            {section === 'dashboard' && <DashboardSection t={t} m={m} courses={courses} overall={overall} name={profile.name} />}
            {section === 'courses' && <CoursesSection t={t} courses={courses} />}
            {section === 'account' && <AccountSection t={t} profile={profile} locale={locale} />}
            {section === 'forums' && <ForumsSection t={t} />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Dashboard
 * ================================================================== */
type T = (typeof dv1)['en'];
type M = (typeof memberContent)['en'];
type Course = M['progress']['courses'][number];

function DashboardSection({ t, m, courses, overall, name }: { t: T; m: M; courses: Course[]; overall: number; name: string }) {
  const top = courses[0];
  const statIcons = ['book', 'check', 'clock', 'flame'];
  const toneStyle: Record<string, string> = {
    live: 'bg-ngs-magenta/10 text-ngs-magenta',
    task: 'bg-amber-100 text-amber-600',
    class: 'bg-cyan-100 text-cyan-600',
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-grotesk text-2xl font-bold text-slate-900 sm:text-[1.7rem]">{t.greeting(name.split(' ')[0])} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">{t.greetingSub}</p>
      </div>

      {/* Row A: hero + ring */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-ngs-gradient p-7 text-white shadow-[0_18px_44px_-18px_rgba(139,47,214,0.6)] lg:col-span-2">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/85">{t.continueLearning}</span>
            <h3 className="mt-2 font-grotesk text-2xl font-bold leading-tight">{top.name}</h3>
            <p className="mt-1 text-sm text-white/85">{t.module}</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 w-44 overflow-hidden rounded-full bg-white/25"><span className="block h-full rounded-full bg-white" style={{ width: `${top.progress}%` }} /></div>
              <span className="text-sm font-semibold">{top.progress}%</span>
            </div>
            <button type="button" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#fff] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition-transform hover:-translate-y-0.5">
              {t.resume} <Icon name="play" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Card className="flex flex-col items-center justify-center p-7 text-center">
          <div className="relative">
            <ProgressRing value={overall} />
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-grotesk text-3xl font-bold text-slate-900">{overall}%</span>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">{t.overall}</p>
          <p className="text-xs text-slate-400">{t.coursesInProgress(courses.length)}</p>
        </Card>
      </div>

      {/* Row B: stat tiles */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {t.stats.map((s, i) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name={statIcons[i]} className="h-5 w-5" /></span>
              <div className="min-w-0">
                <div className="font-grotesk text-xl font-bold leading-tight text-slate-900">{s.value}</div>
                <div className="truncate text-xs text-slate-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Row C: courses + upcoming */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-grotesk text-base font-bold text-slate-900">{t.myCourses}</h3>
            <span className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-ngs-violet">{t.viewAll}<Icon name="arrow" className="h-3.5 w-3.5" /></span>
          </div>
          <div className="space-y-4">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ngs-gradient-soft text-ngs-violet"><Icon name="book" className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Bar value={c.progress} className="max-w-[220px]" />
                    <span className="shrink-0 text-xs font-semibold text-slate-500">{c.progress}%</span>
                  </div>
                </div>
                <button type="button" className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 sm:inline-flex">{t.continue}<Icon name="arrow" className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-grotesk text-base font-bold text-slate-900">{t.upcoming}</h3>
          <div className="space-y-3">
            {t.upcomingItems.map((it) => (
              <div key={it.title} className="flex gap-3">
                <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneStyle[it.tone]}`}><Icon name={it.tone === 'task' ? 'check' : it.tone === 'live' ? 'spark' : 'calendar'} className="h-[18px] w-[18px]" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{it.title}</p>
                  <p className="truncate text-xs text-slate-400">{it.meta}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{it.when}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row D: notes + advisor */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-grotesk text-base font-bold text-slate-900">{t.recentNotes}</h3>
            <span className="cursor-pointer text-sm font-semibold text-ngs-violet">{t.seeMore}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {m.notes.items.map((n) => (
              <div key={n.title} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{n.date}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{n.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ngs-gradient opacity-40 blur-2xl" />
          <div className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><Icon name="help" className="h-5 w-5" /></span>
            <h3 className="mt-4 font-grotesk text-lg font-bold">{t.helpCardTitle}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">{t.helpCardBody}</p>
            <GradientButton className="mt-5">{t.helpCardCta}<Icon name="arrow" className="h-3.5 w-3.5" /></GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Courses
 * ================================================================== */
function CoursesSection({ t, courses }: { t: T; courses: Course[] }) {
  return (
    <div>
      <h1 className="font-grotesk text-2xl font-bold text-slate-900 sm:text-[1.7rem]">{t.coursesTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">{t.coursesSub}</p>
      <div className="mt-5 flex gap-2">
        {t.filters.map((f, i) => (
          <span key={f} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${i === 0 ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-500'}`}>{f}</span>
        ))}
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {courses.map((c) => (
          <MemberCourseCard
            key={c.id}
            c={c}
            labels={{ modulesWord: t.modulesWord, completeWord: t.completeWord, continue: t.continue, viewModules: t.viewModules }}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== *
 * Account
 * ================================================================== */
function ReadField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <div className="flex h-11 items-center rounded-xl bg-slate-100 px-3.5 text-sm text-slate-600">{value}</div>
    </div>
  );
}

function AccountSection({ t, profile, locale }: { t: T; profile: { name: string; email: string; role: Role }; locale: Locale }) {
  const [mobile, setMobile] = useState('');
  const [prefs, setPrefs] = useState(t.prefs.map((p) => p.on));
  const [saved, setSaved] = useState(false);
  const parts = profile.name.trim().split(/\s+/);
  const input = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ngs-violet/60 focus:ring-2 focus:ring-ngs-violet/15';
  return (
    <div>
      <h1 className="font-grotesk text-2xl font-bold text-slate-900 sm:text-[1.7rem]">{t.accountTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">{t.accountSub}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile card */}
        <Card className="h-fit p-6 text-center">
          <div className="relative mx-auto w-fit">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-ngs-gradient font-grotesk text-3xl font-bold text-white">{initials(profile.name)}</span>
            <button type="button" aria-label="Edit" className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-800"><Icon name="edit" className="h-4 w-4" /></button>
          </div>
          <h2 className="mt-4 font-grotesk text-lg font-bold text-slate-900">{profile.name}</h2>
          <span className="mt-1 inline-block rounded-full bg-ngs-gradient-soft px-3 py-0.5 text-xs font-semibold text-ngs-violet">{ROLE_LABELS[locale][profile.role]}</span>
          <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-left text-sm">
            <p className="flex items-center justify-between gap-3"><span className="text-slate-400">{t.email}</span><span className="truncate font-medium text-slate-700">{profile.email}</span></p>
            <p className="flex items-center justify-between gap-3"><span className="text-slate-400">{t.memberSince}</span><span className="font-medium text-slate-700">{t.memberSinceVal}</span></p>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Editable details — read-only fields visually distinct from editable ones */}
          <Card className="p-6">
            <h3 className="font-grotesk text-base font-bold text-slate-900">{t.accountTitle}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ReadField label={t.firstName} value={parts[0] ?? '—'} />
              <ReadField label={t.lastName} value={parts.slice(1).join(' ') || <span className="text-slate-400">{t.notSet}</span>} />
              <div className="sm:col-span-2"><ReadField label={t.email} value={profile.email} /></div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">{t.mobile}</span>
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder={t.mobilePlaceholder} className={input} />
              </label>
              <ReadField label={t.dob} value={<span className="text-slate-400">{t.notSet}</span>} />
            </div>
          </Card>

          {/* Change password */}
          <Card className="p-6">
            <h3 className="font-grotesk text-base font-bold text-slate-900">{t.changePassword}</h3>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-3"
              onSubmit={(e) => { e.preventDefault(); setSaved(true); }}
            >
              <input type="password" placeholder={t.currentPw} className={input} onChange={() => setSaved(false)} />
              <input type="password" placeholder={t.newPw} className={input} onChange={() => setSaved(false)} />
              <input type="password" placeholder={t.confirmPw} className={input} onChange={() => setSaved(false)} />
            </form>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h3 className="font-grotesk text-base font-bold text-slate-900">{t.prefsTitle}</h3>
            <div className="mt-4 divide-y divide-slate-100">
              {t.prefs.map((p, i) => (
                <div key={p.label} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-400">{p.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[i]}
                    onClick={() => setPrefs((arr) => arr.map((v, j) => (j === i ? !v : v)))}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${prefs[i] ? 'bg-ngs-gradient' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${prefs[i] ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <GradientButton onClick={() => setSaved(true)}>{t.save}</GradientButton>
            {saved && <span className="text-sm font-medium text-emerald-600">{t.saved} ✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Forums
 * ================================================================== */
function ForumsSection({ t }: { t: T }) {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-grotesk text-2xl font-bold text-slate-900 sm:text-[1.7rem]">{t.forumsTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.forumsSub}</p>
        </div>
        <div className="flex gap-2.5">
          <label className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" className="h-4 w-4" /></span>
            <input placeholder={t.forumSearch} className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-ngs-violet/60 focus:ring-2 focus:ring-ngs-violet/15 sm:w-56" />
          </label>
          <GradientButton>{t.newTopic}</GradientButton>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {t.boards.map((b) => (
          <Card key={b.name} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ngs-gradient-soft text-ngs-violet"><Icon name="chat" className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1">
              <h3 className="font-grotesk text-base font-bold text-slate-900">{b.name}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{b.desc}</p>
            </div>
            <div className="flex shrink-0 items-center gap-6 sm:gap-8">
              <div className="text-center"><div className="font-grotesk text-lg font-bold text-slate-900">{b.topics}</div><div className="text-[11px] text-slate-400">{t.topics}</div></div>
              <div className="text-center"><div className="font-grotesk text-lg font-bold text-slate-900">{b.replies}</div><div className="text-[11px] text-slate-400">{t.replies}</div></div>
              <div className="hidden text-center sm:block"><div className="text-sm font-semibold text-slate-700">{b.last}</div><div className="text-[11px] text-slate-400">{t.latest}</div></div>
              <Icon name="arrow" className="h-4 w-4 text-slate-300" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
