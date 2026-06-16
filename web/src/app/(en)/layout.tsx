import { HtmlLang } from '@/components/layout/HtmlLang';
import { SiteShellV1 } from '@/components/redesign-v1/SiteShellV1';

/**
 * English-locale layout. Sets document.documentElement.lang = "en" and wraps
 * every English page in the site-wide v1 dark chrome (header / footer / FAB).
 */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang lang="en" />
      <SiteShellV1 locale="en">{children}</SiteShellV1>
    </>
  );
}
