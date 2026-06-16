import { HtmlLang } from '@/components/layout/HtmlLang';

/**
 * Chinese-locale layout. Sets document.documentElement.lang = "zh".
 * The root <html> already defaults to "zh" so this is mostly a safety net
 * for in-app navigation between locales.
 */
export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang lang="zh" />
      {children}
    </>
  );
}
