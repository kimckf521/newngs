import { HtmlLang } from '@/components/layout/HtmlLang';

/**
 * English-locale layout. Sets document.documentElement.lang = "en" so screen
 * readers and search engines see the right language. The root <html> still
 * defaults to lang="zh" but this layout overrides it for every page under
 * /(en)/.
 */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang lang="en" />
      {children}
    </>
  );
}
