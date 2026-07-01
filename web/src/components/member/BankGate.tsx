'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import { getCurrentUser } from '@/lib/auth';
import { siteLinks } from '@/lib/siteLinks';

/**
 * Access hook for a question bank. Returns whether the CURRENT user may use the
 * given bank (default `all` = open to everyone, incl. logged-out; `whitelist` =
 * only listed students). Best-effort open on any failure. A portal listing can
 * use this to HIDE banks a student can't access; BankGate uses it to block the
 * page.
 */
type Access = { loading: boolean; canAccess: boolean; mode: 'all' | 'whitelist'; loggedIn: boolean };

export function useBankAccess(bankId: string): Access {
  const [a, setA] = useState<Access>({ loading: true, canAccess: true, mode: 'all', loggedIn: false });
  useEffect(() => {
    let active = true;
    void (async () => {
      const user = await getCurrentUser().catch(() => null);
      const uid = user?.uid || '';
      let mode: 'all' | 'whitelist' = 'all';
      let canAccess = true;
      try {
        const res = await fetch(`/api/question-bank/access/mine?id=${encodeURIComponent(bankId)}&uid=${encodeURIComponent(uid)}`);
        const d = (await res.json().catch(() => null)) as { ok?: boolean; mode?: 'all' | 'whitelist'; canAccess?: boolean } | null;
        if (d?.ok) {
          mode = d.mode === 'whitelist' ? 'whitelist' : 'all';
          canAccess = !!d.canAccess;
        }
      } catch {
        /* best-effort open */
      }
      if (active) setA({ loading: false, canAccess, mode, loggedIn: !!uid });
    })();
    return () => {
      active = false;
    };
  }, [bankId]);
  return a;
}

const T = {
  zh: { checking: '正在检查访问权限…', needLogin: '该题库需要授权后才能访问,请先登录。', noAccess: '你还没有这个题库的访问权限。', contact: '如需开通,请联系你的老师。', login: '去登录', back: '返回' },
  en: { checking: 'Checking access…', needLogin: 'This bank requires authorization — please sign in.', noAccess: 'You don’t have access to this question bank yet.', contact: 'Ask your teacher to grant access.', login: 'Sign in', back: 'Back' },
} as const;

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0a0a12] px-6 text-center font-sans text-white/80 antialiased">
      <div className="max-w-sm">{children}</div>
    </div>
  );
}

/**
 * Wrap a bank's student page. If the bank is `whitelist` and the current user
 * isn't authorised (or isn't logged in), the content is blocked entirely — so an
 * unauthorised student can't reach the SAT/IELTS experience even by URL. A bank
 * left at `all` renders through untouched (preserves the ungated runner).
 */
export function BankGate({ bankId, locale = 'zh', children }: { bankId: string; locale?: Locale; children: ReactNode }) {
  const a = useBankAccess(bankId);
  const t = T[locale];

  if (a.loading) return <Screen><p className="text-sm text-white/50">{t.checking}</p></Screen>;
  if (a.canAccess) return <>{children}</>;

  return (
    <Screen>
      <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-white/5 text-2xl">🔒</div>
      <p className="mt-5 font-semibold text-white">{a.loggedIn ? t.noAccess : t.needLogin}</p>
      <p className="mt-1.5 text-sm text-white/50">{t.contact}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {!a.loggedIn && (
          <Link href={siteLinks[locale].login} className="rounded-xl bg-ngs-gradient px-4 py-2 text-sm font-semibold text-white">
            {t.login}
          </Link>
        )}
        <Link href={siteLinks[locale].member} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5">
          {t.back}
        </Link>
      </div>
    </Screen>
  );
}
