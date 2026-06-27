'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, Icon } from '@/components/member/design-v1/parts';
import { listCourses, type SaveMode } from '@/lib/courses/client';
import type { AdminCourse } from '@/lib/courses/types';
import { adminConsoleContent, type AdminSectionKey } from './adminConsole.content';

export function DashboardSection({
  locale,
  name,
  onNavigate,
}: {
  locale: Locale;
  name: string;
  onNavigate: (s: AdminSectionKey) => void;
}) {
  const t = adminConsoleContent[locale];
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [mode, setMode] = useState<SaveMode>('local');

  useEffect(() => {
    void listCourses().then((r) => {
      setCourses(r.courses);
      setMode(r.mode);
    });
  }, []);

  const published = courses.filter((c) => c.published).length;
  const tiles: { icon: string; label: string; value: string }[] = [
    { icon: 'book', label: t.dashboard.stats.courses, value: String(courses.length) },
    { icon: 'check', label: t.dashboard.stats.published, value: String(published) },
  ];
  const recent = courses.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-grotesk text-2xl font-bold text-slate-900">{t.dashboard.greeting(name.split(' ')[0])} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">{t.dashboard.sub}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${mode === 'cloud' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
        >
          {mode === 'cloud' ? t.modeBadge.cloud : t.modeBadge.local}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {tiles.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="font-grotesk text-xl font-bold leading-tight text-slate-900">{s.value}</div>
                <div className="truncate text-xs text-slate-400">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
        <button type="button" onClick={() => onNavigate('members')} className="w-full text-left">
          <Card className="flex h-full items-center gap-3 p-5 transition hover:-translate-y-0.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ngs-gradient-soft text-ngs-violet">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <div>
              <div className="font-grotesk text-sm font-bold text-slate-900">{t.dashboard.stats.members}</div>
              <div className="text-xs font-semibold text-ngs-violet">{t.dashboard.stats.manage}</div>
            </div>
          </Card>
        </button>
        <button type="button" onClick={() => onNavigate('courses')} className="w-full text-left">
          <Card className="flex h-full items-center gap-3 p-5 transition hover:-translate-y-0.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ngs-gradient text-white">
              <Icon name="spark" className="h-5 w-5" />
            </span>
            <div className="font-grotesk text-sm font-bold text-slate-900">{t.courses.create}</div>
          </Card>
        </button>
      </div>

      <Card className="p-6">
        <h3 className="font-grotesk text-base font-bold text-slate-900">{t.dashboard.recent}</h3>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">{t.dashboard.none}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recent.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ngs-gradient-soft text-ngs-violet">
                  <Icon name="book" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">{c.name}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.published ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                >
                  {c.published ? t.courses.published : t.courses.draft}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
