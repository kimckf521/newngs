'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, Icon, ProgressRing, Bar, GradientButton, SoftButton } from '@/components/member/design-v1/parts';
import { siteLinks } from '@/lib/siteLinks';
import { logout } from '@/lib/auth';
import { useAdminGuard } from '@/components/auth/useAdminGuard';
import { parentData, type Child } from '@/lib/parent/sample';

/**
 * Parent portal ("家长中心") — SCAFFOLD. A parent monitors their linked
 * children's study progress (course progress, test scores, activity). Sample
 * data only; real parent↔student linking + live progress is the next phase.
 */
type SK = 'overview' | 'courses' | 'scores';

const C = {
  zh: {
    sample: '示例数据 —— 真实的家长中心会显示你已绑定孩子的真实学习数据',
    title: '家长中心',
    theme: '切换主题',
    nav: { overview: '概览', courses: '课程进度', scores: '考试成绩', logout: '退出登录' },
    children: '我的孩子',
    bind: '绑定孩子',
    bindTitle: '绑定孩子账号',
    bindHint: '输入孩子在 NGS 生成的「家庭码」,或让老师在后台帮你关联。',
    bindPh: '家庭码,如 NGS-8F3K',
    bindBtn: '绑定',
    cancel: '取消',
    grade: '年级',
    streak: '连续学习',
    days: '天',
    lastActive: '最近活跃',
    weekMin: '本周学习',
    minutes: '分钟',
    overall: '总进度',
    inProgress: '在学课程',
    latestScore: '最近成绩',
    weekActivity: '本周学习时长',
    recentScores: '最近考试',
    coursesT: '课程进度',
    modulesFmt: (d: number, tt: number) => `${d}/${tt} 模块`,
    scoresT: '考试成绩',
    th: { test: '考试', date: '日期', score: '成绩', change: '变化' },
    days7: ['一', '二', '三', '四', '五', '六', '日'],
  },
  en: {
    sample: 'Sample data — the real parent portal shows your linked children’s live study data',
    title: 'Parent Hub',
    theme: 'Toggle theme',
    nav: { overview: 'Overview', courses: 'Course progress', scores: 'Test scores', logout: 'Sign out' },
    children: 'My children',
    bind: 'Link a child',
    bindTitle: 'Link a child account',
    bindHint: 'Enter the “family code” your child generated in NGS, or ask a teacher to link you in the console.',
    bindPh: 'Family code, e.g. NGS-8F3K',
    bindBtn: 'Link',
    cancel: 'Cancel',
    grade: 'Grade',
    streak: 'Streak',
    days: 'days',
    lastActive: 'Last active',
    weekMin: 'This week',
    minutes: 'min',
    overall: 'Overall',
    inProgress: 'Courses',
    latestScore: 'Latest score',
    weekActivity: 'Study time this week',
    recentScores: 'Recent tests',
    coursesT: 'Course progress',
    modulesFmt: (d: number, tt: number) => `${d}/${tt} modules`,
    scoresT: 'Test scores',
    th: { test: 'Test', date: 'Date', score: 'Score', change: 'Change' },
    days7: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
} as const;

const navIconCls = (active?: boolean) =>
  `grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
    active ? 'bg-ngs-gradient text-white shadow-[0_6px_16px_-6px_rgba(139,47,214,0.7)]' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
  }`;
const navItemCls = (active?: boolean) =>
  `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    active ? 'bg-gradient-to-r from-ngs-magenta/10 via-ngs-violet/10 to-ngs-cyan/10 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`;

function WeekChart({ week, days7 }: { week: number[]; days7: readonly string[] }) {
  const max = Math.max(1, ...week);
  return (
    <div className="flex h-28 items-stretch gap-2">
      {week.map((m, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div className="w-full rounded-md bg-ngs-gradient" style={{ height: `${Math.max(6, (m / max) * 100)}%` }} title={`${m}`} />
          </div>
          <span className="text-[10px] text-slate-400">{days7[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function ParentPortal({ locale }: { locale: Locale }) {
  useAdminGuard(); // admins belong in /admin, not the parent portal
  const [lang, setLang] = useState<Locale>(locale);
  // Dark by default (the portal's signature look); persisted per-browser so a
  // parent who prefers light doesn't have to re-toggle each visit.
  const [dark, setDark] = useState(true);
  useEffect(() => {
    try {
      const s = localStorage.getItem('ngs:lang');
      if (s === 'en' || s === 'zh') setLang(s);
      const th = localStorage.getItem('ngs:parent-theme');
      if (th === 'light' || th === 'dark') setDark(th === 'dark');
    } catch {
      /* ignore */
    }
  }, []);
  const changeLang = (nl: Locale) => {
    setLang(nl);
    try {
      localStorage.setItem('ngs:lang', nl);
    } catch {
      /* ignore */
    }
  };
  const toggleTheme = () => {
    setDark((v) => {
      const next = !v;
      try {
        localStorage.setItem('ngs:parent-theme', next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const t = C[lang];
  const data = parentData(lang);
  const [childId, setChildId] = useState(data.children[0]?.id || '');
  const [section, setSection] = useState<SK>('overview');
  const [binding, setBinding] = useState(false);
  const child: Child | undefined = data.children.find((c) => c.id === childId) || data.children[0];

  const NAV: { key: SK; icon: string }[] = [
    { key: 'overview', icon: 'dashboard' },
    { key: 'courses', icon: 'book' },
    { key: 'scores', icon: 'flame' },
  ];

  const statTile = (label: string, value: string, sub?: string) => (
    <div className="rounded-xl bg-slate-50 p-3.5">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 font-grotesk text-lg font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );

  return (
    <div className={`dv1 ${dark ? 'dv1-dark' : ''} min-h-screen font-sans antialiased`}>
      <div className="mx-auto flex max-w-[1200px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-5 lg:flex">
          <div className="rounded-2xl bg-ngs-gradient p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{t.title}</p>
            <p className="mt-1 font-grotesk text-[15px] font-bold leading-snug">{data.parentName}</p>
          </div>

          <p className="mt-5 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.children}</p>
          <div className="space-y-1">
            {data.children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setChildId(c.id); setSection('overview'); }}
                className={navItemCls(c.id === childId)}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ngs-gradient text-xs font-bold text-white">{c.initial}</span>
                <span className="min-w-0 flex-1 truncate text-left">{c.name}</span>
                <span className="text-[11px] text-slate-400">{c.grade}</span>
              </button>
            ))}
            <button type="button" onClick={() => setBinding(true)} className={navItemCls(false)}>
              <span className={navIconCls(false)}><Icon name="user" className="h-[18px] w-[18px]" /></span>
              {t.bind}
            </button>
          </div>

          <p className="mt-5 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{child?.name}</p>
          <nav className="flex-1 space-y-1">
            {NAV.map((n) => (
              <button key={n.key} type="button" onClick={() => setSection(n.key)} className={navItemCls(section === n.key)}>
                <span className={navIconCls(section === n.key)}><Icon name={n.icon} className="h-[18px] w-[18px]" /></span>
                {t.nav[n.key]}
              </button>
            ))}
          </nav>

          <div className="space-y-1 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => void logout().then(() => { window.location.href = siteLinks[lang].login; })}
              className={navItemCls(false)}
            >
              <span className={navIconCls(false)}><Icon name="logout" className="h-[18px] w-[18px]" /></span>
              {t.nav.logout}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-[var(--dv1-topbar)] px-5 py-3 backdrop-blur-xl sm:px-8">
            <Link href={siteLinks[lang].home} className="flex items-center gap-2 lg:hidden">
              <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={26} height={26} className="h-6 w-6 object-contain" />
            </Link>
            <p className="font-grotesk text-sm font-bold text-slate-900">{t.nav[section]}</p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={t.theme}
                title={t.theme}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
              >
                <Icon name={dark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
              </button>
              <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
                {(['en', 'zh'] as const).map((ll) => (
                  <button key={ll} type="button" onClick={() => changeLang(ll)} className={`rounded-md px-2 py-1 text-xs font-bold transition ${lang === ll ? 'bg-ngs-gradient text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                    {ll === 'en' ? 'EN' : '中'}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Mobile child + section nav */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200/70 bg-white px-5 py-2.5 lg:hidden">
            {data.children.map((c) => (
              <button key={c.id} type="button" onClick={() => setChildId(c.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${c.id === childId ? 'bg-ngs-gradient text-white' : 'bg-slate-100 text-slate-500'}`}>
                {c.name}
              </button>
            ))}
            <span className="shrink-0 self-center text-slate-300">|</span>
            {NAV.map((n) => (
              <button key={n.key} type="button" onClick={() => setSection(n.key)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${section === n.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {t.nav[n.key]}
              </button>
            ))}
          </div>

          <main className="space-y-5 px-5 py-7 sm:px-8">
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] font-medium text-amber-700 ring-1 ring-amber-200">
              <Icon name="spark" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t.sample}</span>
            </div>

            {child && section === 'overview' && (
              <>
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ngs-gradient text-xl font-bold text-white">{child.initial}</span>
                      <div>
                        <h2 className="font-grotesk text-xl font-bold text-slate-900">{child.name}</h2>
                        <p className="text-sm text-slate-400">{t.grade}: {child.grade} · {t.lastActive}: {child.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-ngs-gradient-soft px-3.5 py-2 text-ngs-violet">
                      <Icon name="flame" className="h-5 w-5" />
                      <span className="font-grotesk text-lg font-bold">{child.streakDays}</span>
                      <span className="text-xs">{t.streak}{t.days}</span>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                      <ProgressRing value={child.overallProgress} size={52} stroke={6} />
                      <div>
                        <p className="text-[11px] text-slate-400">{t.overall}</p>
                        <p className="font-grotesk text-lg font-bold text-slate-900">{child.overallProgress}%</p>
                      </div>
                    </div>
                    {statTile(t.inProgress, String(child.courses.length))}
                    {statTile(t.latestScore, child.scores[0]?.score || '—', child.scores[0]?.test)}
                    {statTile(t.weekMin, `${child.weekMinutes}`, t.minutes)}
                  </div>
                </Card>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Card className="p-6">
                    <p className="font-grotesk text-sm font-bold text-slate-900">{t.weekActivity}</p>
                    <div className="mt-4">
                      <WeekChart week={child.week} days7={t.days7} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <p className="font-grotesk text-sm font-bold text-slate-900">{t.recentScores}</p>
                      <button type="button" onClick={() => setSection('scores')} className="text-xs font-semibold text-ngs-violet hover:underline">→</button>
                    </div>
                    <ul className="mt-3 divide-y divide-slate-100">
                      {child.scores.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-center justify-between py-2.5">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{s.test}</p>
                            <p className="text-[11px] text-slate-400">{s.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-grotesk text-base font-bold text-slate-900">{s.score}</span>
                            {s.delta && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">{s.delta}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </>
            )}

            {child && section === 'courses' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {child.courses.map((c) => (
                  <Card key={c.name} className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-grotesk text-base font-bold text-slate-900">{c.name}</h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{c.track}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{t.modulesFmt(c.modulesDone, c.modulesTotal)}</span>
                      <span className="font-semibold text-slate-700">{c.progress}%</span>
                    </div>
                    <Bar value={c.progress} className="mt-1.5" />
                  </Card>
                ))}
              </div>
            )}

            {child && section === 'scores' && (
              <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-[12px] uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3 font-semibold">{t.th.test}</th>
                      <th className="px-5 py-3 font-semibold">{t.th.date}</th>
                      <th className="px-5 py-3 font-semibold">{t.th.score}</th>
                      <th className="px-5 py-3 font-semibold">{t.th.change}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {child.scores.map((s, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3">
                          <span className="mr-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">{s.kind}</span>
                          <span className="font-medium text-slate-900">{s.test}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{s.date}</td>
                        <td className="px-5 py-3 font-grotesk font-bold text-slate-900">{s.score}</td>
                        <td className="px-5 py-3">
                          {s.delta ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">{s.delta}</span> : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Bind-child modal (scaffold) */}
      {binding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setBinding(false)}>
          <div className={`w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xl dv1 ${dark ? 'dv1-dark' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-grotesk text-lg font-bold text-slate-900">{t.bindTitle}</h2>
            <p className="mt-1.5 text-sm text-slate-500">{t.bindHint}</p>
            <input placeholder={t.bindPh} className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-ngs-violet/60" />
            <div className="mt-6 flex items-center justify-end gap-3">
              <SoftButton onClick={() => setBinding(false)}>{t.cancel}</SoftButton>
              <GradientButton onClick={() => setBinding(false)}>{t.bindBtn}</GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
