'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/types';
import { Card, Icon, GradientButton } from '@/components/member/design-v1/parts';
import { listCourses, deleteCourse, type SaveMode } from '@/lib/courses/client';
import { type AdminCourse } from '@/lib/courses/types';
import { adminConsoleContent } from './adminConsole.content';
import { CourseListCard } from './CourseListCard';

/** Course list. Cards (and "新建课程") navigate to the full-page editor at
 *  /admin/courses/[id] (or /new). */
export function CoursesSection({ locale, onMode }: { locale: Locale; onMode?: (m: SaveMode) => void }) {
  const t = adminConsoleContent[locale];
  const router = useRouter();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const res = await listCourses();
    setCourses(res.courses.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    onMode?.(res.mode);
    setLoading(false);
  }
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (id: string) => router.push(`/admin/courses/${id}`);

  async function onDelete(c: AdminCourse) {
    if (!window.confirm(t.courses.confirmDel(c.name))) return;
    try {
      await deleteCourse(c.id);
    } catch {
      window.alert(t.courses.delFailed);
      return;
    }
    void refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-grotesk text-2xl font-bold text-slate-900">{t.courses.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.courses.sub}</p>
        </div>
        <GradientButton onClick={() => open('new')}>
          <Icon name="spark" className="h-4 w-4" />
          {t.courses.create}
        </GradientButton>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">…</Card>
      ) : courses.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">{t.courses.empty}</Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseListCard
              key={c.id}
              c={c}
              labels={{ ...t.courses, builtin: locale === 'zh' ? '内置' : 'Built-in' }}
              onOpen={open}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
