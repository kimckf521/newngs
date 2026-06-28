'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/i18n/types';
import { dv1 } from '@/components/member/design-v1/data';
import { MemberCourseCard } from '@/components/member/design-v1/MemberCourseCard';

/**
 * Shows EXACTLY what a student sees for this course — the real member-portal
 * course card (shared MemberCourseCard), fed the current edit-form state so it
 * previews unsaved edits. Rendered via a portal to <body> so it escapes the
 * admin's `.dv1-dark` scope and renders in the student's light theme.
 */
const T = {
  zh: { head: '学员端预览', note: '这就是学员在课程列表里看到的卡片；新学员进度显示为 0%。封面图不显示在该卡片上（当前设计）。', close: '关闭' },
  en: { head: 'Student preview', note: "This is the card a student sees in their course list; progress shows 0% for a new student. The cover image isn't shown on this card (current design).", close: 'Close' },
} as const;

export function CoursePreview({
  name,
  modules,
  locale,
  onClose,
}: {
  name: string;
  modules: { title: string }[];
  locale: Locale;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!mounted) return null;

  const s = dv1[locale];
  const labels = { modulesWord: s.modulesWord, completeWord: s.completeWord, continue: s.continue, viewModules: s.viewModules };
  const tt = T[locale];
  const card = {
    id: 'preview',
    name: name.trim() || (locale === 'zh' ? '未命名课程' : 'Untitled course'),
    modules: modules.filter((m) => m.title.trim()).map((m) => ({ title: m.title.trim() })),
    progress: 0,
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 font-sans antialiased" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/85">{tt.head}</span>
          <button type="button" onClick={onClose} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20">
            ✕ {tt.close}
          </button>
        </div>
        {/* .dv1 (light, NOT dv1-dark) gives the card the student-portal base palette */}
        <div className="dv1 rounded-2xl p-5">
          <MemberCourseCard c={card} labels={labels} />
        </div>
        <p className="mt-2 px-1 text-center text-[11px] leading-relaxed text-white/55">{tt.note}</p>
      </div>
    </div>,
    document.body,
  );
}
