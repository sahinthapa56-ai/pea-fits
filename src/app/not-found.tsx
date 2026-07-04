import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Page Not Found — ${SITE_NAME}`,
};

// ──────────────────────────────────────────────
// Not Found Page (404)
// ──────────────────────────────────────────────

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-background">
      <span className="text-[8rem] sm:text-[10rem] font-serif text-neutral-200 leading-none mb-4 select-none" aria-hidden="true">
        404
      </span>
      <h1 className="display-lg text-primary mb-3">Page Not Found</h1>
      <p className="body-md text-text-secondary max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Return Home
      </Link>
    </div>
  );
}
