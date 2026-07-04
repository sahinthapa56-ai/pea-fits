import type { Metadata } from "next";
import { JournalContent } from "./JournalContent";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `The Journal — ${SITE_NAME}`,
  description:
    "Explore the PEA_FITS Journal — editorial stories on fashion, design, and the art of the silhouette.",
  openGraph: {
    title: `The Journal — ${SITE_NAME}`,
    description:
      "Explore the PEA_FITS Journal — editorial stories on fashion, design, and the art of the silhouette.",
  },
};

// ──────────────────────────────────────────────
// Journal Page
// ──────────────────────────────────────────────

export default function JournalPage() {
  return <JournalContent />;
}
