'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/types';
import { Card } from '@/components/member/design-v1/parts';
import { fetchBanks, type BankListItem } from '@/lib/questionBank/client';
import { CoverPreview } from './CoverPreview';

const L = {
  zh: {
    title: '题库',
    sub: '课程配套的题库，存放剑桥真题等题目。点开一个题库查看与预览。',
    loading: '加载中…',
    empty: '还没有题库。题库以 question_bank 表存储（例如 “ielts” 一行存放全部剑桥真题）。',
    books: '本', published: '已发布', draft: '草稿', updated: '更新于',
  },
  en: {
    title: 'Question bank',
    sub: 'The question banks behind your courses (Cambridge tests, etc.). Open one to view and preview it.',
    loading: 'Loading…',
    empty: 'No question banks yet. They live in the question_bank table (e.g. one "ielts" row holds all the Cambridge tests).',
    books: 'books', published: 'Published', draft: 'Draft', updated: 'Updated',
  },
} as const;

/** 题库 — a scalable GRID of question-bank cards. Clicking a card opens its
 *  detail page (/admin/questionbank/[id]) where the books live. */
export function QuestionBankSection({ locale }: { locale: Locale }) {
  const l = L[locale];
  const router = useRouter();
  const [banks, setBanks] = useState<BankListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const b = await fetchBanks();
      if (active) { setBanks(b); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const open = (id: string) => router.push(`/admin/questionbank/${id}`);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-grotesk text-2xl font-bold text-slate-900">{l.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{l.sub}</p>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">{l.loading}</Card>
      ) : banks.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">{l.empty}</Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {banks.map((b) => {
            return (
              <Card key={b.id} className="overflow-hidden transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(139,47,214,0.45)]">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => open(b.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(b.id); }}
                  className="cursor-pointer"
                >
                  <CoverPreview value={b.cover || undefined} />
                  <div className="px-5 pb-5 pt-5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.published ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {b.published ? l.published : l.draft}
                      </span>
                      <span className="text-[11px] text-slate-400">{b.id}</span>
                    </div>
                    <h3 className="mt-2 font-grotesk text-base font-bold leading-snug text-slate-900">{b.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {b.bookCount} {l.books}
                      {b.updatedAt ? ` · ${l.updated} ${b.updatedAt}` : ''}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
