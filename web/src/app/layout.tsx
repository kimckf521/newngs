import type { Metadata } from 'next';
import { Albert_Sans, Josefin_Sans, Fraunces, Space_Grotesk } from 'next/font/google';
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

// Fraunces — editorial serif for the redesigned display headings. Gives the
// site the established, premium feel a tech-gradient sans alone can't. Exposed
// as a CSS variable and only consumed by the redesigned components, so legacy
// pages are unaffected.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Space Grotesk — geometric display sans for the bold "v1" alternate design.
// Exposed as a CSS variable; only the redesign-v1 components consume it.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
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
      className={`${albertSans.variable} ${josefinSans.variable} ${fraunces.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
