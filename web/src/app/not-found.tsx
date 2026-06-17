'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  // Keep the visitor in the locale they came from (English routes use the _en suffix).
  const pathname = usePathname();
  const home = pathname?.includes('_en') ? '/index_en' : '/';
  return (
    <div className="ngs-redesign relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-night px-6 text-center font-sans text-white antialiased">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-ngs-violet/20 blur-[150px]" />
      <p className="relative font-grotesk text-7xl font-bold">
        <span className="bg-ngs-gradient bg-clip-text text-transparent">404</span>
      </p>
      <h1 className="relative mt-3 font-grotesk text-3xl font-bold">Page not found</h1>
      <p className="relative mt-4 max-w-md text-white/60">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        href={home}
        className="relative mt-8 inline-flex items-center justify-center rounded-full bg-ngs-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5"
      >
        Go home
      </Link>
    </div>
  );
}
