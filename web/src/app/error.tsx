'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="ngs-redesign relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-night px-6 text-center font-sans text-white antialiased">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-ngs-magenta/20 blur-[150px]" />
      <h1 className="relative font-grotesk text-4xl font-bold">Something went wrong</h1>
      <p className="relative mt-4 max-w-md text-white/60">
        We hit an unexpected error while loading this page. Please try again, or go back to the home page.
      </p>
      <div className="relative mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-ngs-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(236,28,139,0.7)] transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
