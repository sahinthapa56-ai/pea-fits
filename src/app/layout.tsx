import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Suspense } from "react";

// ──────────────────────────────────────────────
// Fonts
// ──────────────────────────────────────────────

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// ──────────────────────────────────────────────
// Default Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Architectural Silhouettes`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Architectural silhouettes and effortless luxury for the modern woman. Discover curated collections of bodycons, blazers, skirts, and gowns.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Architectural Silhouettes`,
    description:
      "Architectural silhouettes and effortless luxury for the modern woman.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Architectural Silhouettes`,
    description:
      "Architectural silhouettes and effortless luxury for the modern woman.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ──────────────────────────────────────────────
// Root Layout
// ──────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${hankenGrotesk.variable} scroll-smooth`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE_NAME} Journal`}
          href="/journal/rss.xml"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="skip-to-content"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
