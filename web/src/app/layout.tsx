import type { Metadata } from 'next';
import { Albert_Sans, Josefin_Sans, Inter } from 'next/font/google';
import './globals.css';

// Albert Sans — body text. Multiple weights so we can pick what we need.
const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-albert-sans',
  display: 'swap',
});

// Josefin Sans — secondary headings (the legacy CSS uses it for h3 in
// .section-font-style). next/font does not have Cal Sans, so we reuse
// Josefin Sans for both heading slots and let the Tailwind theme map them.
const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-josefin-sans',
  display: 'swap',
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
  title: 'NextGen Scholars — International Education Parents Trust',
  description:
    'NextGen Scholars (未来学者) connects ambitious students with mentors from the world’s leading universities and global industry leaders — a trustworthy, world-class international education without borders.',
  applicationName: 'NextGen Scholars',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: 'NextGen Scholars',
    title: 'NextGen Scholars — International Education Parents Trust',
    description:
      'A trustworthy, world-class international education — connecting ambitious students with mentors from the world’s leading universities.',
    url: 'https://nextgenscholars.asia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextGen Scholars — International Education Parents Trust',
    description:
      'A trustworthy, world-class international education — connecting ambitious students with mentors from the world’s leading universities.',
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
        {/* Apply the saved light/dark choice before paint to avoid a flash.
            Default (no class) is the dark v1 design. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('ngs-theme')==='light'){document.documentElement.classList.add('v1-light')}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
