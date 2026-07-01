'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { initials } from '@/lib/demoAuth';
import { siteLinks } from '@/lib/siteLinks';
import { memberContent } from '../memberContent';
import { useAdminGuard } from '@/components/auth/useAdminGuard';
import { dv2, type NodeState } from './data';
import { Card, Icon, Ring, Bar, GradientButton } from './parts';

/* ================================================================== *
 * Engagement-focused "Learning Hub" (design-v2). Standalone showcase.
 * Behavioral design: streaks + loss aversion, goal-gradient XP, Zeigarnik
 * next-step, small-win daily checklist, visualized path, achievements.
 * ================================================================== */

const cleanTitle = (s: string) => s.replace(/^.*?[:：]\s*/, '');

function lessonStates(state: NodeState): NodeState[] {
  if (state === 'done') return ['done', 'done', 'done'];
  if (state === 'current') return ['done', 'current', 'todo'];
  if (state === 'locked') return ['locked', 'locked', 'locked'];
  return ['todo', 'todo', 'todo'];
}

export function MemberDesignV2({ locale }: { locale: Locale }) {
  useAdminGuard(); // admins belong in /admin, not the student portal
  const t = dv2[locale];
  const m = memberContent[locale];
  const courses = m.progress.courses;
  const quiz = locale === 'zh' ? '测验' : 'Quiz';

  const [activeId, setActiveId] = useState(courses[0].id);
  const active = courses.find((c) => c.id === activeId) ?? courses[0];
  const meta = t.courseMeta[activeId] ?? Object.values(t.courseMeta)[0];

  const [selIdx, setSelIdx] = useState(meta.currentIndex);
  const [tod, setTod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [done, setDone] = useState<boolean[]>(t.tasks.map(() => false));
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    setTod(h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening');
    // Own light palette: ignore the site's global v1-light toggle so .text-white
    // on the gradient hero / path nodes stays white here.
    document.documentElement.classList.remove('v1-light');
  }, []);

  const nodeState = (i: number): NodeState => {
    if (i < meta.completed) return 'done';
    if (i === meta.currentIndex) return 'current';
    if (i >= meta.lockFrom) return 'locked';
    return 'todo';
  };

  const switchCourse = (id: string) => {
    setActiveId(id);
    setSelIdx(t.courseMeta[id]?.currentIndex ?? 0);
  };

  const doneCount = done.filter(Boolean).length;
  const goal = t.tasks.length;
  const goalPct = (doneCount / goal) * 100;
  const allDone = doneCount === goal;
  const todayXp = t.tasks.reduce((a, task, i) => a + (done[i] ? task.xp : 0), 0);
  const currentXp = Math.min(t.baseXp + todayXp, t.xpPerLevel);
  const xpPct = (currentXp / t.xpPerLevel) * 100;
  const xpToNext = t.xpPerLevel - currentXp;

  const earned = t.achievements.filter((a) => a.earned).length;
  const firstName = (locale === 'zh' ? t.sampleName : t.sampleName.split(' ')[0]);

  const selState = nodeState(selIdx);
  const selModule = active.modules[selIdx];
  const lessons = useMemo(() => lessonStates(selState), [selState]);

  return (
    <div className={`dv2 relative min-h-screen font-sans antialiased ${dark ? 'dv2-dark' : ''}`}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-ngs-violet/[0.07] via-ngs-magenta/[0.04] to-transparent" />

      {/* Top engagement bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-[var(--dv2-topbar)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-5 py-3 sm:px-8">
          <Link href={siteLinks[locale].home} className="flex items-center gap-2.5">
            <Image src="/static/img/big_n.png" alt="NextGen Scholars" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="hidden font-grotesk text-[15px] font-bold tracking-tight text-slate-900 sm:inline">NextGen<span className="font-medium text-slate-400"> Scholars</span></span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setDark((v) => !v)} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-800">
              <Icon name={dark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-600">
              <Icon name="flame" className="h-4 w-4" stroke={2} />{t.streakCount}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ngs-gradient-soft px-3 py-1.5 text-sm font-bold text-ngs-violet">
              <Icon name="bolt" className="h-4 w-4" stroke={2} />{t.levelWord} {t.level}
            </span>
            <Link href={siteLinks[locale].member} className="grid h-9 w-9 place-items-center rounded-full bg-ngs-gradient text-sm font-bold text-white">{initials(t.sampleName)}</Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1240px] px-5 py-7 sm:px-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="font-grotesk text-2xl font-bold text-slate-900 sm:text-[1.8rem]">{t.greetings[tod]}, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">{t.motivate(t.streakCount)}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* ── Main column ───────────────────────────────── */}
          <div className="space-y-5">
            {/* Next-step hero */}
            <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-[0_18px_44px_-18px_rgba(139,47,214,0.55)]" style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}>
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
              <div className="relative">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/85">{t.pickUp}</span>
                <h3 className="mt-2 font-grotesk text-2xl font-bold leading-tight">{active.name}</h3>
                <p className="mt-1 text-sm text-white/90">{t.moduleWord} {meta.currentIndex + 1} · {cleanTitle(active.modules[meta.currentIndex].title)} · {t.lessonWord} 2</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-2 w-44 overflow-hidden rounded-full bg-white/25"><span className="block h-full rounded-full bg-white" style={{ width: `${active.progress}%` }} /></div>
                  <span className="text-sm font-semibold">{active.progress}%</span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#fff] px-5 py-2.5 text-sm font-bold text-[#0f172a] transition-transform hover:-translate-y-0.5">{t.continueBtn}<Icon name="play" className="h-3.5 w-3.5" /></button>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85"><Icon name="clock" className="h-4 w-4" />{t.estMin(15)}</span>
                </div>
              </div>
            </div>

            {/* Course switcher */}
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => {
                const on = c.id === activeId;
                return (
                  <button key={c.id} type="button" onClick={() => switchCourse(c.id)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                    <Icon name="book" className="h-4 w-4" />{c.name}
                  </button>
                );
              })}
            </div>

            {/* Learning path */}
            <Card className="p-6">
              <div className="mb-5">
                <h3 className="font-grotesk text-base font-bold text-slate-900">{t.pathTitle}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{t.pathSub}</p>
              </div>

              <div className="flex items-start gap-0 overflow-x-auto pb-2">
                {active.modules.map((mod, i) => {
                  const st = nodeState(i);
                  const sel = i === selIdx;
                  const filled = i <= meta.currentIndex;
                  return (
                    <Fragment key={mod.title}>
                      {i > 0 && <div className={`mt-[22px] h-1.5 w-7 shrink-0 rounded-full ${filled ? 'bg-ngs-gradient' : 'bg-slate-200'}`} />}
                      <button type="button" onClick={() => setSelIdx(i)} className="flex shrink-0 flex-col items-center gap-1.5 px-1">
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold transition ${
                            st === 'done' ? 'bg-emerald-500 text-white' :
                            st === 'current' ? 'bg-ngs-gradient text-white shadow-[0_8px_20px_-6px_rgba(139,47,214,0.8)]' :
                            st === 'locked' ? 'bg-slate-100 text-slate-300' :
                            'border-2 border-slate-200 bg-white text-slate-400'
                          } ${sel ? 'ring-2 ring-ngs-violet ring-offset-2' : ''} ${st === 'current' ? 'motion-safe:animate-pulse' : ''}`}
                        >
                          {st === 'done' ? <Icon name="check" className="h-5 w-5" stroke={2.4} /> : st === 'locked' ? <Icon name="lock" className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className={`text-[10px] font-semibold ${st === 'current' ? 'text-ngs-violet' : 'text-transparent'}`}>{t.nextLabel}</span>
                      </button>
                    </Fragment>
                  );
                })}
              </div>

              {/* Selected module detail */}
              <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      selState === 'done' ? 'bg-emerald-100 text-emerald-600' :
                      selState === 'current' ? 'bg-ngs-gradient-soft text-ngs-violet' :
                      selState === 'locked' ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-500'
                    }`}>{t.stateLabels[selState]}</span>
                    <h4 className="mt-2 font-grotesk text-[15px] font-bold text-slate-900">{t.moduleWord} {selIdx + 1} · {cleanTitle(selModule.title)}</h4>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">3 {t.lessonsIn}</span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {[`${t.lessonWord} 1`, `${t.lessonWord} 2`, quiz].map((ln, li) => {
                    const ls = lessons[li];
                    return (
                      <li key={ln} className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${ls === 'done' ? 'bg-emerald-500' : ls === 'current' ? 'bg-ngs-gradient' : 'bg-slate-200'}`}>
                          {ls === 'done' ? <Icon name="check" className="h-3.5 w-3.5" stroke={2.6} /> : ls === 'locked' ? <Icon name="lock" className="h-3 w-3" /> : <Icon name="play" className="h-3 w-3" />}
                        </span>
                        <span className={`flex-1 text-sm ${ls === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{ln}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4">
                  {selState === 'locked' ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"><Icon name="lock" className="h-4 w-4" />{t.locked}</span>
                  ) : (
                    <GradientButton>{selState === 'done' ? t.review : t.start}<Icon name="arrow" className="h-3.5 w-3.5" /></GradientButton>
                  )}
                </div>
              </div>
            </Card>

            {/* Today's plan (drives the daily-goal ring) */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-grotesk text-base font-bold text-slate-900">{t.planTitle}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{t.planSub}</p>
                </div>
                {todayXp > 0 && <span className="shrink-0 rounded-full bg-ngs-gradient-soft px-3 py-1 text-xs font-bold text-ngs-violet">{t.todayXp(todayXp)}</span>}
              </div>
              <div className="space-y-2">
                {t.tasks.map((task, i) => {
                  const on = done[i];
                  return (
                    <button key={task.label} type="button" aria-pressed={on} onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))} className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${on ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${on ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {on && <Icon name="check" className="h-3.5 w-3.5" stroke={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${on ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.label}</span>
                        <span className="block text-xs text-slate-400">{task.meta}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>+{task.xp}</span>
                    </button>
                  );
                })}
              </div>
              {allDone && <div className="mt-4 rounded-xl bg-ngs-gradient-soft px-4 py-3 text-center text-sm font-bold text-ngs-violet">{t.goalComplete}</div>}
            </Card>
          </div>

          {/* ── Engagement rail ───────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-[76px] lg:self-start">
            {/* Daily goal ring */}
            <Card className="flex flex-col items-center p-6 text-center">
              <Ring value={goalPct} size={128}>
                {allDone ? <span className="text-3xl">🎯</span> : <span className="font-grotesk text-2xl font-bold text-slate-900">{doneCount}<span className="text-base text-slate-400">/{goal}</span></span>}
              </Ring>
              <p className="mt-4 font-grotesk text-base font-bold text-slate-900">{t.goalTitle}</p>
              <p className="mt-0.5 text-sm text-slate-500">{allDone ? t.goalComplete : t.goalSub}</p>
            </Card>

            {/* Streak */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white"><Icon name="flame" className="h-6 w-6" stroke={2} /></span>
                <div>
                  <div className="font-grotesk text-2xl font-bold leading-none text-slate-900">{t.streakCount}</div>
                  <div className="text-xs text-slate-400">{t.streakWord}</div>
                </div>
              </div>
              <div className="mt-5 flex justify-between">
                {t.streakDays.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${d.done ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-300'} ${d.today ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
                      {d.done ? <Icon name="check" className="h-3.5 w-3.5" stroke={2.6} /> : ''}
                    </span>
                    <span className="text-[10px] text-slate-400">{d.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700">{allDone ? t.streakDone : t.streakKeep(t.streakCount)}</p>
            </Card>

            {/* Level / XP */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 font-grotesk text-base font-bold text-slate-900"><span className="grid h-8 w-8 place-items-center rounded-lg bg-ngs-gradient-soft text-ngs-violet"><Icon name="bolt" className="h-4 w-4" stroke={2} /></span>{t.levelTitle(t.level)}</h3>
                {todayXp > 0 && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">{t.todayXp(todayXp)}</span>}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Bar value={xpPct} tall />
                <span className="shrink-0 text-xs font-semibold text-slate-500">{currentXp}/{t.xpPerLevel}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{t.xpToNext(xpToNext)}</p>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-grotesk text-base font-bold text-slate-900">{t.achTitle}</h3>
                <span className="text-xs font-semibold text-slate-400">{t.achEarnedOf(earned, t.achievements.length)}</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {t.achievements.map((a) => (
                  <div key={a.name} title={a.name} className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border ${a.earned ? 'border-ngs-violet/20 bg-ngs-gradient-soft' : 'border-slate-200 bg-slate-50'}`}>
                    <span className={`text-xl ${a.earned ? '' : 'opacity-40 grayscale'}`}>{a.emoji}</span>
                    <span className={`px-0.5 text-center text-[9px] font-semibold leading-tight ${a.earned ? 'text-ngs-violet' : 'text-slate-400'}`}>{a.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Community */}
            <Card className="p-6">
              <h3 className="font-grotesk text-base font-bold text-slate-900">{t.communityTitle}</h3>
              <div className="mt-3 flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name="users" className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" /></span>
                <p className="text-sm font-medium text-slate-700">{t.learningNow(t.learnersNow)}</p>
              </div>
              <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500"><Icon name="trophy" className="h-5 w-5" stroke={1.7} /></span>
                <p className="text-sm font-medium text-slate-700">{t.rank(t.leaderboardRank)}</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
