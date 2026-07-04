import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `The Story — ${SITE_NAME}`,
  description:
    "Discover the story behind PEA_FITS — from the mind of Sahin Thapa. Architectural silhouettes and effortless luxury designed in Nepal.",
  openGraph: {
    title: `The Story — ${SITE_NAME}`,
    description:
      "Discover the story behind PEA_FITS. Architectural silhouettes designed in Nepal.",
  },
};

// ──────────────────────────────────────────────
// Story Page
// ──────────────────────────────────────────────

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="py-20 lg:py-32 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] text-center">
          <span className="text-label-caps text-text-secondary mb-6 block tracking-[0.15em]">
            The Origin
          </span>
          <h1 className="display-lg text-primary mb-4 max-w-4xl mx-auto">
            {SITE_NAME}
          </h1>
          <p className="headline-lg text-text-secondary mb-3">
            From the mind of <span className="text-primary">Sahin Thapa</span>
          </p>
          <div className="max-w-2xl mx-auto mt-8">
            <p className="body-lg text-text-secondary leading-relaxed italic">
              &ldquo;At {SITE_NAME}, we don&apos;t just design garments — we sculpt confidence.
              Every curve, every seam, every silhouette is intentional.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Introduction ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="max-w-3xl mx-auto">
            <p className="body-lg text-secondary leading-relaxed mb-6">
              {SITE_NAME} was born from a singular vision: to create clothing that empowers the modern woman
              through architectural design and uncompromising quality. Founded by Sahin Thapa, the brand
              represents a fusion of structured silhouettes and fluid femininity — a study in contrasts
              that mirrors the complexity of the women who wear it.
            </p>
            <p className="body-lg text-secondary leading-relaxed">
              Based in Nepal, every piece is crafted with meticulous attention to detail, using premium
              materials sourced from around the world. From the initial sketch to the final stitch, each
              garment is a testament to the belief that fashion is not just about how you look — it&apos;s
              about how you feel.
            </p>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ── */}
      <section className="py-20 lg:py-28 bg-white border-y border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Vision */}
            <div>
              <span className="text-label-caps text-text-secondary mb-4 block tracking-[0.15em]">
                01 — Vision
              </span>
              <h2 className="headline-lg text-primary mb-6">To Redefine Luxury</h2>
              <p className="body-md text-secondary leading-relaxed">
                We envision a world where luxury is inclusive, sustainable, and deeply personal.
                {SITE_NAME} strives to be at the forefront of a new fashion paradigm — one where
                architectural precision meets emotional resonance, and where every piece tells a story
                of craftsmanship and care.
              </p>
            </div>

            {/* Mission */}
            <div>
              <span className="text-label-caps text-text-secondary mb-4 block tracking-[0.15em]">
                02 — Mission
              </span>
              <h2 className="headline-lg text-primary mb-6">Sculpting Confidence</h2>
              <p className="body-md text-secondary leading-relaxed">
                Our mission is to create garments that transform the way women feel about themselves.
                Through meticulous design, premium materials, and ethical production, we deliver pieces
                that are as empowering as they are beautiful. Every {SITE_NAME} creation is designed
                to make its wearer feel seen, strong, and unforgettable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sustainability ── */}
      <section id="sustainability" className="py-20 lg:py-28">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-label-caps text-text-secondary mb-4 block tracking-[0.15em]">
              03 — Sustainability
            </span>
            <h2 className="headline-lg text-primary mb-6">Designed to Last</h2>
            <p className="body-md text-secondary leading-relaxed">
              Sustainability is not an afterthought at {SITE_NAME} — it is woven into every decision we make.
              From responsible sourcing to mindful production, we are committed to reducing our footprint
              while maximizing our impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Ethical Production",
                description:
                  "All our garments are produced in Nepal under fair working conditions. We partner with artisans who share our commitment to quality and craftsmanship.",
              },
              {
                title: "Premium Materials",
                description:
                  "We source the finest fabrics from around the world, prioritizing quality over quantity. Every material is chosen for its durability, feel, and timeless appeal.",
              },
              {
                title: "Timeless Design",
                description:
                  "Our architectural silhouettes are designed to transcend seasons. We create pieces that remain relevant year after year, reducing the cycle of fast fashion.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">
                  {item.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credit ── */}
      <section className="py-16 bg-primary text-on-primary">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] text-center">
          <p className="text-label-caps text-white/60 mb-4 tracking-[0.15em]">
            Developed By
          </p>
          <p className="headline-lg text-white">
            SAHIN THAPA
          </p>
          <p className="text-sm text-white/60 mt-4 max-w-lg mx-auto">
            Founder & Creative Director — {SITE_NAME}
          </p>
          <div className="mt-8">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-8 py-3 border border-white text-white text-label-caps rounded-xl hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
