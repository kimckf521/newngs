'use client';

import { Card, Icon, SoftButton } from '@/components/member/design-v1/parts';
import type { AdminCourse } from '@/lib/courses/types';
import { isBuiltinCourse } from '@/lib/courses/builtin';
import { CoverPreview } from './CoverPreview';

/**
 * The admin course list card (cover + status + name + module count + edit/delete).
 * Extracted from CoursesSection so the 题库 section can show the same card for
 * courses that belong to a question bank (single source of truth).
 */
export type CourseCardLabels = { published: string; draft: string; moduleCount: (n: number) => string; edit: string; del: string; builtin?: string };

export function CourseListCard({
  c,
  labels,
  onOpen,
  onDelete,
}: {
  c: AdminCourse;
  labels: CourseCardLabels;
  onOpen: (id: string) => void;
  onDelete: (c: AdminCourse) => void;
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(139,47,214,0.45)]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(c.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(c.id); }}
        className="cursor-pointer"
      >
        <CoverPreview value={c.coverImage} />
        <div className="px-5 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.published ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              {c.published ? labels.published : labels.draft}
            </span>
            {isBuiltinCourse(c.id) && (
              <span className="rounded-full bg-ngs-violet/10 px-2 py-0.5 text-[11px] font-semibold text-ngs-violet">
                {labels.builtin ?? 'Built-in'}
              </span>
            )}
            {c.level && <span className="text-[11px] text-slate-400">{c.level}</span>}
          </div>
          <h3 className="mt-2 font-grotesk text-base font-bold leading-snug text-slate-900">{c.name}</h3>
          <p className="mt-1 text-xs text-slate-400">{labels.moduleCount(c.modules?.length || 0)}</p>
        </div>
      </div>
      <div className="flex gap-2 px-5 pb-5 pt-4">
        <SoftButton onClick={() => onOpen(c.id)} className="!px-3 !py-1.5 !text-xs">
          <Icon name="edit" className="h-3.5 w-3.5" />
          {labels.edit}
        </SoftButton>
        <button
          type="button"
          onClick={() => onDelete(c)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50"
        >
          {labels.del}
        </button>
      </div>
    </Card>
  );
}
