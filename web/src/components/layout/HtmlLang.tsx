'use client';

import { useEffect } from 'react';

/**
 * Updates `document.documentElement.lang` on mount. Used by the per-locale
 * layouts in `app/(en)/` and `app/(zh)/` because Next.js does not allow
 * nested <html> elements — the root layout owns the tag, so the only way to
 * vary `lang` per route is from the client.
 *
 * Renders nothing.
 */
export function HtmlLang({ lang }: { lang: 'en' | 'zh' }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);
  return null;
}
