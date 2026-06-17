import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import { SiteHeaderV1 } from './SiteHeaderV1';
import { FooterV1 } from './FooterV1';
import { ContactFabV1 } from './ContactFabV1';

/**
 * Site-wide v1 chrome. Wraps every page under (zh)/ and (en)/ in the bold
 * dark design: fixed glass header, the page content, the dark footer, and
 * the floating contact button. The `.ngs-redesign` class re-applies the
 * heading scope guard (see globals.css) so gradient-text spans inside
 * headings inherit size/weight rather than the legacy CSS.
 */
export function SiteShellV1({ locale, children }: { locale: Locale; children: ReactNode }) {
  const skipLabel = locale === 'en' ? 'Skip to content' : '跳到主要内容';
  return (
    // `lang` on the content wrapper annotates the page language server-side
    // (the root <html> stays "zh" for static rendering; an inline script also
    // corrects <html lang> client-side). Screen readers and search engines use
    // the nearest lang ancestor, so this gives English routes a correct signal.
    <div
      lang={locale === 'en' ? 'en' : 'zh-Hans'}
      className="ngs-redesign flex min-h-screen flex-col bg-night font-inter text-white antialiased"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-night focus:shadow-lg"
      >
        {skipLabel}
      </a>
      <SiteHeaderV1 locale={locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <FooterV1 locale={locale} />
      <ContactFabV1 locale={locale} />
    </div>
  );
}
