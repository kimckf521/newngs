import { HtmlLang } from '@/components/layout/HtmlLang';
import { SiteShellV1 } from '@/components/redesign-v1/SiteShellV1';

/**
 * Chinese-locale layout. Sets document.documentElement.lang = "zh" and wraps
 * every Chinese page in the site-wide v1 dark chrome (header / footer / FAB).
 */
export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang lang="zh" />
      <SiteShellV1 locale="zh">{children}</SiteShellV1>
    </>
  );
}
