'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import { Card, Icon } from '@/components/member/design-v1/parts';
import { fetchBankSummary, type BankSummary } from '@/lib/questionBank/client';
import { CoverPreview } from './CoverPreview';
import { QuestionBankPanel } from './QuestionBankPanel';

const L = {
  zh: { back: '题库', loading: '加载中…', notFound: '找不到这个题库。', books: '本', published: '已发布', draft: '草稿', updated: '更新时间', info: '题库信息', id: '题库 ID', bookCount: '书目数量', descTitle: '简介', modulesTitle: '模块', previewAsStudent: '学生视角预览' },
  en: { back: 'Question bank', loading: 'Loading…', notFound: 'Question bank not found.', books: 'books', published: 'Published', draft: 'Draft', updated: 'Updated', info: 'Bank info', id: 'Bank ID', bookCount: 'Books', descTitle: 'Overview', modulesTitle: 'Modules', previewAsStudent: 'Preview as student' },
} as const;

const BACK = '/admin?section=questionBank';

/** The student-facing practice route for each bank, so admins can jump into the
 *  student view. (member_en/sat doesn't exist yet → EN falls back to the zh route.) */
const STUDENT_ROUTE: Record<string, { en: string; zh: string }> = {
  ielts: { en: '/member_en/ielts', zh: '/member/ielts' },
  sat: { en: '/member/sat', zh: '/member/sat' },
};
const sectionTitle = 'font-grotesk text-sm font-bold text-slate-900';

/** Full-page question-bank detail: the book grid + preview, plus the bank's own
 *  overview / modules / info. Reached by clicking a card in /admin → 题库. */
// One block per skill — 听 / 说 / 读 / 写.
const SKILLS = {
  zh: [
    { key: 'listening', label: '听力' }, { key: 'speaking', label: '口语' },
    { key: 'reading', label: '阅读' }, { key: 'writing', label: '写作' },
    { key: 'tapescript', label: '听力原文' },
  ],
  en: [
    { key: 'listening', label: 'Listening' }, { key: 'speaking', label: 'Speaking' },
    { key: 'reading', label: 'Reading' }, { key: 'writing', label: 'Writing' },
    { key: 'tapescript', label: 'Tapescripts' },
  ],
} as const;

export function QuestionBankPage({ id, locale }: { id: string; locale: Locale }) {
  const [lang, setLang] = useState<Locale>(locale);
  const changeLang = (nl: Locale) => { setLang(nl); try { localStorage.setItem('ielts:lang', nl); } catch {} };
  const l = L[lang];
  const [bank, setBank] = useState<BankSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem('ielts:lang'); if (s === 'en' || s === 'zh') setLang(s as Locale); } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const b = await fetchBankSummary(id);
      if (active) { setBank(b); setLoaded(true); }
    })();
    return () => { active = false; };
  }, [id]);

  const shell = (children: ReactNode) => (
    <div className="dv1 dv1-dark min-h-screen bg-[#0a0a12] font-sans antialiased">{children}</div>
  );

  if (!loaded) return shell(<div className="p-10 text-sm text-slate-400">{l.loading}</div>);
  if (!bank)
    return shell(
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-sm text-slate-400">{l.notFound}</p>
        <Link href={BACK} className="mt-3 inline-block text-sm font-semibold text-ngs-violet hover:underline">← {l.back}</Link>
      </div>,
    );

  return shell(
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[var(--dv1-topbar)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-5 py-3 sm:px-8">
          <Link href={BACK} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            <Icon name="arrow" className="h-4 w-4 -scale-x-100" />
            {l.back}
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="truncate font-grotesk text-sm font-bold text-slate-900">{bank.name}</h1>
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${bank.published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {bank.published ? l.published : l.draft}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {STUDENT_ROUTE[bank.id] && (
              <a
                href={STUDENT_ROUTE[bank.id][lang]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-ngs-gradient px-3 py-1.5 text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5"
                title={l.previewAsStudent}
              >
                {l.previewAsStudent}
                <Icon name="arrow" className="h-3.5 w-3.5 -rotate-45" />
              </a>
            )}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
              {(['en', 'zh'] as const).map((ll) => (
                <button key={ll} type="button" onClick={() => changeLang(ll)} className={`rounded-md px-2 py-1 text-xs font-bold transition ${lang === ll ? 'bg-ngs-gradient text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {ll === 'en' ? 'EN' : '中'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1120px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {SKILLS[lang].map((s) => (
            <QuestionBankPanel key={s.key} courseId={id} locale={lang} title={s.label} skill={s.key} />
          ))}
        </div>
        <div className="space-y-6">
          {bank.cover && (
            <Card className="overflow-hidden">
              <CoverPreview value={bank.cover} />
            </Card>
          )}
          {bank.description && (
            <Card className="p-5">
              <p className={`${sectionTitle} mb-2`}>{l.descTitle}</p>
              <p className="text-[13px] leading-relaxed text-slate-500">{bank.description}</p>
            </Card>
          )}
          {bank.modules.length > 0 && (
            <Card className="p-5">
              <p className={`${sectionTitle} mb-3`}>{l.modulesTitle}</p>
              <ol className="space-y-1.5">
                {bank.modules.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-slate-600">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-ngs-gradient text-[10px] font-bold text-white">{i + 1}</span>
                    <span className="truncate">{m.title}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
          <Card className="p-5">
            <p className={`${sectionTitle} mb-3`}>{l.info}</p>
            <dl className="space-y-2 text-xs">
              {[
                { k: l.id, v: bank.id },
                { k: l.bookCount, v: `${bank.bookCount} ${l.books}` },
                { k: l.updated, v: bank.updatedAt || '—' },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between gap-3">
                  <dt className="text-slate-400">{row.k}</dt>
                  <dd className="truncate font-medium text-slate-600">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </main>
    </>,
  );
}
