"use client";

import Link from "next/link";

// ──────────────────────────────────────────────
// Error Page
// ──────────────────────────────────────────────

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-background">
      <div className="w-16 h-16 mb-6 rounded-full bg-red-50 flex items-center justify-center" aria-hidden="true">
        <svg className="w-8 h-8 text-editorial-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="display-lg text-primary mb-3">Something Went Wrong</h1>
      <p className="body-md text-text-secondary max-w-md mb-2">
        An unexpected error occurred. Please try again.
      </p>
      {error.message && (
        <p className="text-xs text-text-secondary max-w-md mb-8 font-mono bg-neutral-100 px-4 py-2 rounded-lg">
          {error.message}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary text-label-caps rounded-xl hover:bg-primary/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
