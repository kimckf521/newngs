'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { GlassCard, GradientText, ArrowRight } from '@/components/redesign-v1/ui';
import { initials } from '@/lib/demoAuth';
import type { AuthUser } from '@/lib/auth';
import type { MemberContent, TabKey, MemberCourse, CourseModule, SidebarItem, AdminPage } from './memberContent';

/* ------------------------------------------------------------------ *
 * Member portal panels — one per tab, all in the NGS dark/glass theme.
 * Presentational: data + callbacks come from MemberPortal.
 * ------------------------------------------------------------------ */

/* ---- Icons (24×24 stroke, inherit currentColor) -------------------- */
const Ic = ({ d, className = '' }: { d: ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    {d}
  </svg>
);
const ProfileGlyph = ({ className = '' }: { className?: string }) => <Ic className={className} d={<><circle cx="12" cy="8" r="3.6" /><path d="M5 20a7 7 0 0 1 14 0" /></>} />;
const BookGlyph = ({ className = '' }: { className?: string }) => <Ic className={className} d={<><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.5A1.5 1.5 0 0 0 5 20V4.5z" /><path d="M9 8h6M9 11h4" /></>} />;
const BagGlyph = ({ className = '' }: { className?: string }) => <Ic className={className} d={<><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>} />;

/* ================================================================== *
 * Shared sidebar (College Administration / My College / My Topics)
 * ================================================================== */
function SidebarBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="rounded-t-2xl bg-ngs-gradient px-4 py-2.5 text-center text-[13px] font-bold uppercase tracking-[0.12em] text-white">
        {title}
      </div>
      <GlassCard className="rounded-t-none">{children}</GlassCard>
    </div>
  );
}

type SidebarNav = { onNavigate: (p: AdminPage) => void; onLogout: () => void; activePage?: AdminPage };

function SidebarLinks({ items, onNavigate, onLogout, activePage }: { items: readonly SidebarItem[] } & SidebarNav) {
  return (
    <ul className="divide-y divide-white/10">
      {items.map((it) => {
        const active = !!it.page && it.page === activePage;
        const cls = `group flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
          active ? 'bg-white/[0.05] text-white' : 'text-white/70 hover:text-white'
        }`;
        const arrow = (
          <ArrowRight className={active ? 'text-ngs-cyan' : 'text-white/25 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white/60'} />
        );
        return (
          <li key={it.label}>
            {it.action === 'logout' ? (
              <button type="button" onClick={onLogout} className={cls}>{it.label}{arrow}</button>
            ) : it.external ? (
              <a href={it.external} target="_blank" rel="noopener noreferrer" className={cls}>{it.label}{arrow}</a>
            ) : (
              <button type="button" onClick={() => it.page && onNavigate(it.page)} className={cls} aria-current={active ? 'page' : undefined}>{it.label}{arrow}</button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MemberSidebar({ t, onNavigate, onLogout, activePage }: { t: MemberContent } & SidebarNav) {
  return (
    <aside className="space-y-6">
      <SidebarBlock title={t.sidebar.adminTitle}>
        <SidebarLinks items={t.sidebar.adminItems} onNavigate={onNavigate} onLogout={onLogout} activePage={activePage} />
      </SidebarBlock>
      <SidebarBlock title={t.sidebar.collegeTitle}>
        <SidebarLinks items={t.sidebar.collegeItems} onNavigate={onNavigate} onLogout={onLogout} activePage={activePage} />
      </SidebarBlock>
      <SidebarBlock title={t.sidebar.topicsTitle}>
        <p className="px-4 py-4 text-sm text-white/45">{t.sidebar.topicsEmpty}</p>
      </SidebarBlock>
    </aside>
  );
}

/* ================================================================== *
 * Dashboard
 * ================================================================== */
function BigCard({ label, sub, glyph, onClick }: { label: string; sub: string; glyph: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group block w-full text-left">
      <GlassCard hover className="overflow-hidden transition duration-300 group-hover:-translate-y-1">
        <div className="bg-ngs-gradient px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white">{label}</div>
        <div className="flex flex-col items-center gap-3 px-5 py-9">
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-ngs-gradient-soft text-white ring-1 ring-white/10">
            <span className="h-10 w-10 text-white">{glyph}</span>
          </span>
          <span className="text-sm text-white/55">{sub}</span>
        </div>
      </GlassCard>
    </button>
  );
}

export function DashboardPanel({ t, user, onTab, onLogout, onNavigate }: { t: MemberContent; user: AuthUser; onTab: (k: TabKey) => void; onLogout: () => void; onNavigate: (p: AdminPage) => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[clamp(220px,22vw,272px)_1fr]">
      <MemberSidebar t={t} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="min-w-0">
        <div className="mb-8">
          <h1 className="font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{t.hello(user.name)}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{t.dashIntro}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <BigCard label={t.cards.profile} sub={t.cards.profileSub} glyph={<ProfileGlyph className="h-10 w-10" />} onClick={() => onTab('account')} />
          <BigCard label={t.cards.courses} sub={t.cards.coursesSub} glyph={<BookGlyph className="h-10 w-10" />} onClick={() => onTab('progress')} />
          <BigCard label={t.cards.orders} sub={t.cards.ordersSub} glyph={<BagGlyph className="h-10 w-10" />} onClick={() => onTab('progress')} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h2 className="font-grotesk text-base font-bold text-white">{t.bookmarks.title}</h2>
            <div className="mt-3 h-px w-full bg-white/10" />
            <p className="mt-4 text-sm text-white/45">{t.bookmarks.empty}</p>
          </GlassCard>

          <GlassCard className="flex flex-col p-6">
            <h2 className="font-grotesk text-base font-bold text-white">{t.notes.title}</h2>
            <div className="mt-3 h-px w-full bg-white/10" />
            <ul className="mt-4 flex-1 space-y-3">
              {t.notes.items.map((n) => (
                <li key={n.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-grotesk text-sm font-semibold text-white">{n.title}</p>
                    <span className="shrink-0 text-[11px] text-white/35">{n.date}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/55">{n.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white">
                <GradientText>{t.notes.seeMore}</GradientText>
                <ArrowRight className="text-ngs-cyan" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Account information
 * ================================================================== */
function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/45">{label}</span>
      <span className="flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white/85">{value || '—'}</span>
    </label>
  );
}

function TextInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/45">{label}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10"
      />
    </label>
  );
}

export function AccountPanel({ t, user }: { t: MemberContent; user: AuthUser }) {
  const parts = user.name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts.slice(1).join(' ');
  const [mobile, setMobile] = useState('');
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h1 className="mb-8 font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{t.account.title}</h1>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Avatar */}
        <GlassCard className="flex flex-col items-center gap-4 p-8">
          <div className="relative">
            <span className="grid h-36 w-36 place-items-center rounded-full bg-ngs-gradient font-grotesk text-4xl font-bold text-white shadow-[0_16px_50px_-12px_rgba(139,47,214,0.7)]">
              {initials(user.name)}
            </span>
            <button
              type="button"
              aria-label={t.account.editPhoto}
              className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-night-700 text-white/85 transition-colors hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M14 4l6 6M3 21l4-1L19 8l-3-3L4 17l-1 4z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/55">{t.account.editPhoto}</p>
        </GlassCard>

        {/* Fields */}
        <div>
          <h2 className="font-grotesk text-base font-bold text-white">{t.account.infoHeading}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ReadField label={t.account.firstName} value={first} />
            <ReadField label={t.account.lastName} value={last} />
            <div className="sm:col-span-2">
              <ReadField label={t.account.email} value={user.email} />
            </div>
            <TextInput label={t.account.mobile} value={mobile} placeholder={t.account.mobilePlaceholder} onChange={setMobile} />
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/45">{t.account.dob}</span>
              <div className="grid grid-cols-3 gap-2">
                {[t.account.sampleDob.d, t.account.sampleDob.m, t.account.sampleDob.y].map((v, i) => (
                  <span key={i} className="flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white/85">{v}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="my-7 h-px w-full bg-white/10" />

          <h2 className="font-grotesk text-base font-bold text-white">{t.account.changePassword}</h2>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
              setCur('');
              setNext('');
              setConfirm('');
            }}
          >
            <div className="flex-1"><TextInput type="password" placeholder={t.account.currentPw} value={cur} onChange={(v) => { setCur(v); setSaved(false); }} /></div>
            <div className="flex-1"><TextInput type="password" placeholder={t.account.newPw} value={next} onChange={(v) => { setNext(v); setSaved(false); }} /></div>
            <div className="flex-1"><TextInput type="password" placeholder={t.account.confirmPw} value={confirm} onChange={(v) => { setConfirm(v); setSaved(false); }} /></div>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-ngs-gradient px-7 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5"
            >
              {t.account.save}
            </button>
          </form>
          {saved && <p className="mt-3 text-xs text-ngs-cyan">{t.account.saved}</p>}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * My Course Progress
 * ================================================================== */
function CourseRow({ t, course, onOpenCourse }: { t: MemberContent; course: MemberCourse; onOpenCourse: (id: string) => void }) {
  return (
    <GlassCard className="p-6">
      <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-center">
        <div>
          <h3 className="font-grotesk text-lg font-bold text-white">{course.name}</h3>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => onOpenCourse(course.id)} className="rounded-full bg-ngs-gradient px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_-8px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5">
              {t.progress.learn}
            </button>
            {course.extras.includes('assignments') && (
              <button type="button" className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white">
                {t.progress.assignments}
              </button>
            )}
            {course.extras.includes('webinars') && (
              <button type="button" className="relative rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white">
                {t.progress.webinars}
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-ngs-gradient px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white">{t.progress.isNew}</span>
              </button>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/45">{t.progress.yourProgress}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-ngs-gradient" style={{ width: `${course.progress}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right font-grotesk text-sm font-bold"><GradientText>{course.progress}%</GradientText></span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function ProgressPanel({ t, onLogout, onOpenCourse, onNavigate }: { t: MemberContent; onLogout: () => void; onOpenCourse: (id: string) => void; onNavigate: (p: AdminPage) => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[clamp(220px,22vw,272px)_1fr]">
      <MemberSidebar t={t} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="min-w-0">
        <h1 className="font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{t.progress.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{t.progress.intro}</p>
        <div className="mt-7 space-y-4">
          {t.progress.courses.map((c) => (
            <CourseRow key={c.id} t={t} course={c} onOpenCourse={onOpenCourse} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Course Detail (module list — behind "Click to Learn")
 * ================================================================== */
function StatCircle({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        className={`grid h-24 w-24 place-items-center rounded-full font-grotesk text-3xl font-bold text-white ${
          accent ? 'bg-ngs-gradient shadow-[0_14px_44px_-12px_rgba(236,28,139,0.8)]' : 'border border-white/12 bg-white/[0.05]'
        }`}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs uppercase tracking-[0.12em] text-white/50">{label}</span>
    </div>
  );
}

const dotColor: Record<'todo' | 'passed' | 'failed', string> = {
  todo: 'bg-ngs-magenta',
  passed: 'bg-emerald-400',
  failed: 'bg-rose-500',
};

function ModuleRow({ t, module, onOpenLesson }: { t: MemberContent; module: CourseModule; onOpenLesson: () => void }) {
  const status: 'todo' | 'passed' | 'failed' = module.mcqButton === 'retry' ? 'failed' : module.progress >= 100 ? 'passed' : 'todo';
  return (
    <GlassCard className="p-5">
      <p className="font-grotesk text-[15px] font-semibold text-white">{module.title}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full bg-ngs-gradient" style={{ width: `${module.progress}%` }} />
          </div>
          <span className="w-9 shrink-0 text-right text-xs font-semibold text-white/60">{module.progress}%</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onOpenLesson} className="rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/12 transition-colors hover:bg-white/[0.12]">
            {t.courseDetail.learn}
          </button>
          <span aria-hidden title={t.courseDetail[status]} className={`h-3 w-3 shrink-0 rounded-full ${dotColor[status]}`} />
          {module.mcqButton === 'mcq' && (
            <button type="button" className="rounded-full bg-ngs-gradient px-4 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5">
              {t.courseDetail.mcq}
            </button>
          )}
          {module.mcqButton === 'retry' && (
            <button type="button" className="rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20">
              {t.courseDetail.retry}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export function CourseDetailPanel({
  t,
  course,
  onBack,
  onOpenLesson,
}: {
  t: MemberContent;
  course: MemberCourse;
  onBack: () => void;
  onOpenLesson: (moduleIndex: number) => void;
}) {
  return (
    <div className="min-w-0">
      <button type="button" onClick={onBack} className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition-colors hover:text-white">
        <ArrowRight className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
        {t.courseDetail.back}
      </button>
      <h1 className="font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{course.name}</h1>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{t.courseDetail.intro}</p>

      <GlassCard className="mt-6 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{t.courseDetail.overview}</p>
        <div className="mt-6 flex flex-wrap justify-around gap-8">
          <StatCircle value={course.modules.length} label={t.courseDetail.modules} />
          <StatCircle value={course.complete} label={t.courseDetail.complete} />
          <StatCircle value={course.assessmentsComplete} label={t.courseDetail.assessmentsComplete} accent />
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/55">
          <span className="font-semibold uppercase tracking-[0.1em] text-white/40">{t.courseDetail.statusKey}</span>
          {(['todo', 'passed', 'failed'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dotColor[s]}`} aria-hidden />
              {t.courseDetail[s]}
            </span>
          ))}
        </div>
      </GlassCard>

      <div className="mt-6 space-y-3">
        {course.modules.map((m, i) => (
          <ModuleRow key={m.title} t={t} module={m} onOpenLesson={() => onOpenLesson(i)} />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== *
 * Lesson view (behind "Learn")
 * ================================================================== */
export function LessonPanel({
  t,
  course,
  moduleIndex,
  onBackToModules,
}: {
  t: MemberContent;
  course: MemberCourse;
  moduleIndex: number;
  onBackToModules: () => void;
}) {
  const lessonModule = course.modules[moduleIndex] ?? course.modules[0];
  const lessonName = lessonModule.title.replace(/^.*?[:：]\s*/, '');
  const [expanded, setExpanded] = useState(false);
  const paras = expanded ? t.lesson.introParas : t.lesson.introParas.slice(0, 1);

  return (
    <div className="grid gap-8 lg:grid-cols-[clamp(240px,24vw,300px)_1fr]">
      {/* Left rail */}
      <aside className="space-y-4">
        <GlassCard className="overflow-hidden">
          <div className="flex items-center gap-2.5 bg-white/[0.05] px-4 py-3">
            <span className="text-ngs-cyan"><IconBookSmall /></span>
            <span className="font-grotesk text-[13px] font-bold leading-tight text-white">{course.name}</span>
          </div>
          <div className="border-t border-white/10 px-4 py-3 text-sm font-semibold text-white/85">{lessonModule.title}</div>
          <div className="border-t border-white/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">{t.lesson.yourLessons}</p>
            <p className="mt-2 text-sm text-white/75">1&nbsp; {lessonName}</p>
          </div>
          <div className="border-t border-white/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">{t.lesson.moduleProgress}</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-ngs-gradient" style={{ width: `${lessonModule.progress}%` }} />
              </div>
              <span className="text-xs font-semibold text-white/60">{lessonModule.progress}%</span>
            </div>
          </div>
        </GlassCard>
        <button type="button" onClick={onBackToModules} className="w-full rounded-full bg-ngs-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5">
          {t.lesson.viewAllModules}
        </button>
      </aside>

      {/* Lesson body */}
      <div className="min-w-0">
        <h1 className="font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{lessonModule.title}</h1>

        <h2 className="mt-7 font-grotesk text-base font-bold text-white">{t.lesson.learningOutcomes}</h2>
        <ol className="mt-3 space-y-2.5">
          {t.lesson.outcomes.map((o, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/70">
              <span className="font-grotesk text-sm font-bold text-ngs-cyan">{i + 1}.</span>
              <span>{o}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-8 font-grotesk text-base font-bold text-white">{t.lesson.introduction}</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {t.lesson.introParas.length > 1 && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-3 text-sm font-semibold text-ngs-cyan transition-opacity hover:opacity-80">
            {expanded ? t.lesson.readLess : t.lesson.readMore}
          </button>
        )}

        <div className="mt-8 flex justify-end">
          <button type="button" className="rounded-full bg-ngs-gradient px-7 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5">
            {t.lesson.firstLesson}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBookSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15.5H5.5A1.5 1.5 0 0 0 4 21V5.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12" />
    </svg>
  );
}

/* ================================================================== *
 * Visit Forums
 * ================================================================== */
export function ForumsPanel({ t }: { t: MemberContent }) {
  const [q, setQ] = useState('');
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-grotesk text-2xl font-bold text-white sm:text-[1.7rem]">{t.forums.title}</h1>
        <label className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.forums.searchPlaceholder}
            className="h-10 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-ngs-violet focus:bg-white/10"
          />
        </label>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-white/10">
          <div className="md:pr-8">
            <h2 className="font-grotesk text-lg font-bold text-white">{t.forums.groupTitle}</h2>
            <Link href="#" className="group mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white">
              {t.forums.lessonDiscussions}
              <ArrowRight className="text-ngs-cyan transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="md:pl-8">
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-white/45">{t.forums.forums}</dt>
                <dd className="mt-1 font-grotesk text-2xl font-bold"><GradientText>{t.forums.forumsCount}</GradientText></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-white/45">{t.forums.users}</dt>
                <dd className="mt-1 text-sm text-white/40">{t.forums.empty}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-white/45">{t.forums.activity}</dt>
                <dd className="mt-1 text-sm text-white/40">{t.forums.empty}</dd>
              </div>
            </dl>
            <div className="mt-5 border-t border-white/10 pt-4">
              <dt className="text-xs uppercase tracking-[0.1em] text-white/45">{t.forums.lastTopic}</dt>
              <dd className="mt-1 text-sm text-white/40">{t.forums.empty}</dd>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
