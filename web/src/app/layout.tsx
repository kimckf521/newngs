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
  title: 'NGS - NextGen Scholars',
  description: 'NextGen Scholars - 未来学者教育',
  icons: {
    icon: '/favicon.ico',
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
      <body className="font-sans text-gray-800 antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
