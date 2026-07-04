import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionsContent } from "./CollectionsContent";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Collections — ${SITE_NAME}`,
  description:
    "Browse the full PEA_FITS collection — architectural bodycons, tailored blazers, evening gowns, and more. Curated silhouettes for the modern woman.",
  openGraph: {
    title: `Collections — ${SITE_NAME}`,
    description:
      "Browse the full PEA_FITS collection of architectural silhouettes.",
  },
};

// ──────────────────────────────────────────────
// Collections Page (Server Component wrapper)
// ──────────────────────────────────────────────

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-200 rounded w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-neutral-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
