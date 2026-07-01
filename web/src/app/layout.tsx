import type { Metadata } from 'next';
import { Albert_Sans, Josefin_Sans, Inter } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationLd, webSiteLd } from '@/lib/jsonLd';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

// Albert Sans — body text. Multiple weights so we can pick what we need.
const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-albert-sans',
  display: 'swap',
  // The live v1 site uses Inter only; Albert is consumed solely by the /redesign
  // preview route (+ dead legacy). preload:false keeps it available there but
  // drops it from the render-blocking <link rel=preload> on every page.
  preload: false,
});

// Josefin Sans — secondary headings (the legacy CSS uses it for h3 in
// .section-font-style). next/font does not have Cal Sans, so we reuse
// Josefin Sans for both heading slots and let the Tailwind theme map them.
const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-josefin-sans',
  display: 'swap',
  // Only the /redesign preview (+ dead legacy) uses it — don't preload on live.
  preload: false,
});

// Inter — the unified sans for the v1 design system (homepage, inner pages,
// auth, error pages). Headings, sub-headings and body all use Inter for a
// clean, minimalist single-family type system. Variable font = all weights.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nextgenscholars.asia'),
  title: {
    // Pages that don't call `pageSeo()` (utility/auth pages) get the brand
    // appended via this template; `pageSeo()` sets an absolute title so it is
    // never double-branded.
    default: 'NextGen Scholars — International Education Parents Trust',
    template: '%s — NextGen Scholars',
  },
  description:
    'NextGen Scholars (未来学者) connects ambitious students with mentors from the world’s leading universities and global industry leaders — a trustworthy, world-class international education without borders.',
  applicationName: 'NextGen Scholars',
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: '/',
    languages: {
      en: '/index_en',
      'zh-CN': '/',
      'x-default': '/index_en',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'NextGen Scholars',
    title: 'NextGen Scholars — International Education Parents Trust',
    description:
      'A trustworthy, world-class international education — connecting ambitious students with mentors from the world’s leading universities.',
    url: '/',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'NextGen Scholars 未来学者' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextGen Scholars — International Education Parents Trust',
    description:
      'A trustworthy, world-class international education — connecting ambitious students with mentors from the world’s leading universities.',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'NextGen Scholars 未来学者' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh"
      suppressHydrationWarning
      className={`${albertSans.variable} ${josefinSans.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        {/* Before paint: (1) apply the saved light/dark choice to avoid a flash
            (default = dark v1 design); (2) correct <html lang> for the current
            locale. The root tag is statically rendered as lang="zh" to keep ISR
            static output; English routes (path contains "_en") are switched to
            "en" here so crawlers/screen readers that render JS see the right
            language. The per-locale content also carries lang on its wrapper. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement;if(localStorage.getItem('ngs-theme')==='light'){d.classList.add('v1-light')}d.lang=/_en(\\/|$)/.test(location.pathname)?'en':'zh-Hans';}catch(e){}})();",
          }}
        />
        <JsonLd data={[organizationLd(), webSiteLd()]} />
        {children}
      </body>
    </html>
  );
}
