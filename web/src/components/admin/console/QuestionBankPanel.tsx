'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/types';
import { Card } from '@/components/member/design-v1/parts';
import { fetchBankBook, fetchBankSummary, type BankBook, type BankSummary } from '@/lib/questionBank/client';

const L = {
  zh: {
    title: '题库', linked: '已连接题库', books: '本可用', missing: '缺失', hint: '点一本书可预览内容（剑桥真题，含听/说/读/写与答案）。', hintSkill: '点一本书查看该项的题目与答案。', preview: '预览', close: '关闭', loading: '加载中…', chars: '字符', empty: '此题目暂无内容。', emptySkill: '这本书没有该项内容。' },
  en: {
    title: 'Question bank', linked: 'Bank linked', books: 'books', missing: 'missing', hint: 'Click a book to preview its content (Cambridge tests — Listening/Reading/Writing/Speaking + answers).', hintSkill: 'Click a book to view this skill — questions and answers.', preview: 'Preview', close: 'Close', loading: 'Loading…', chars: 'chars', empty: 'No content for this book yet.', emptySkill: "This book has no content for this skill." },
} as const;

const sectionTitle = 'font-grotesk text-sm font-bold text-slate-900';

/** A browsable book grid with on-demand markdown preview. With `skill` set, the
 *  preview shows only that skill's section (listening/speaking/reading/writing).
 *  Renders nothing when no bank exists. */
export function QuestionBankPanel({ courseId, locale, title, skill }: { courseId: string; locale: Locale; title?: string; skill?: string }) {
  const l = L[locale];
  const [bank, setBank] = useState<BankSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<{ book: string; loading: boolean; data: BankBook | null } | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const b = await fetchBankSummary(courseId);
      if (active) { setBank(b); setLoaded(true); }
    })();
    return () => { active = false; };
  }, [courseId]);

  // Nothing linked → render nothing (panel is opt-in per course).
  if (!loaded || !bank) return null;

  const byNum = new Map(bank.books.map((b) => [Number(b.book), b]));
  const maxBook = Math.max(20, ...bank.books.map((b) => Number(b.book)));
  const grid = Array.from({ length: maxBook }, (_, i) => i + 1);

  async function openBook(book: string) {
    setOpen({ book, loading: true, data: null });
    const data = await fetchBankBook(courseId, book, skill);
    setOpen((o) => (o && o.book === book ? { ...o, loading: false, data } : o));
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={sectionTitle}>{title || l.title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{skill ? l.hintSkill : l.hint}</p>
          </div>
          {!skill && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {l.linked} · {bank.bookCount} {l.books}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
          {grid.map((n) => {
            const meta = byNum.get(n);
            const isMissing = !meta;
            return (
              <button
                key={n}
                type="button"
                disabled={isMissing}
                onClick={() => meta && openBook(meta.book)}
                title={isMissing ? `Cambridge IELTS ${n} — ${l.missing}` : `${meta!.title} · ${meta!.chars.toLocaleString()} ${l.chars}`}
                className={`aspect-square rounded-lg border text-sm font-bold transition ${
                  isMissing
                    ? 'cursor-not-allowed border-dashed border-slate-200 text-slate-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-ngs-violet/60 hover:bg-ngs-violet/5 hover:text-ngs-violet'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(null)}>
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <p className="font-grotesk text-sm font-bold text-slate-900">
                {open.data?.title || `Cambridge IELTS ${open.book}`}
              </p>
              <button type="button" onClick={() => setOpen(null)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {open.loading ? (
                <p className="py-10 text-center text-sm text-slate-400">{l.loading}</p>
              ) : open.data && open.data.markdown.trim() ? (
                <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-slate-700">{open.data.markdown}</pre>
              ) : (
                <p className="py-10 text-center text-sm text-slate-400">{skill ? l.emptySkill : l.empty}</p>
              )}
            </div>
            <div className="border-t border-slate-200 px-5 py-2.5 text-right">
              <button type="button" onClick={() => setOpen(null)} className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                {l.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
