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
  return (
    <div className="ngs-redesign flex min-h-screen flex-col bg-night font-sans text-white antialiased">
      <SiteHeaderV1 locale={locale} />
      <main className="flex-1">{children}</main>
      <FooterV1 locale={locale} />
      <ContactFabV1 locale={locale} />
    </div>
  );
}
