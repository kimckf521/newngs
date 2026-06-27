'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { siteLinks } from '@/lib/siteLinks';
import { completeOAuthLogin, postLoginDest } from '@/lib/auth';
import type { Locale } from '@/i18n/types';

const content = {
  en: { signingIn: 'Signing you in…', failed: 'Sign-in failed, returning…' },
  zh: { signingIn: '正在登录…', failed: '登录失败，正在返回…' },
} as const;

/**
 * Completes a WeChat (OAuth) login after the provider redirects back here:
 * completeOAuthLogin() exchanges the ?code=&state= for a session (single
 * awaited verifyOAuth), then we route to the member area, or back to login on
 * failure.
 */
export function OAuthCallback({ locale }: { locale: Locale }) {
  const t = content[locale];
  const links = siteLinks[locale];
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const user = await completeOAuthLogin();
        if (cancelled) return;
        if (user) {
          router.replace(postLoginDest(user, links.member));
        } else {
          setFailed(true);
          router.replace(links.login);
        }
      } catch {
        if (cancelled) return;
        setFailed(true);
        router.replace(links.login);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [links.member, links.login, router]);

  return (
    <div className="ngs-redesign grid min-h-screen place-items-center bg-night font-sans text-white antialiased">
      <div className="flex flex-col items-center gap-4">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-ngs-violet" />
        <p className="text-sm text-white/60">{failed ? t.failed : t.signingIn}</p>
      </div>
    </div>
  );
}
