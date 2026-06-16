'use client';

import { useEffect } from 'react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We hit an unexpected error while loading this page. Please try again, or
        go back to the home page.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
