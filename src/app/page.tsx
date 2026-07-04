import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";
import { HomepageProducts } from "@/components/products/HomepageProducts";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { Tilt3DShell } from "@/components/ui/Tilt3DShell";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `${SITE_NAME} — Architectural Silhouettes`,
  description:
    "Architectural silhouettes and effortless luxury for the modern woman. Discover curated collections of bodycons, blazers, skirts, and gowns.",
  openGraph: {
    title: `${SITE_NAME} — Architectural Silhouettes`,
    description:
      "Architectural silhouettes and effortless luxury for the modern woman.",
    type: "website",
  },
};

// ──────────────────────────────────────────────
// Bento Grid items (placeholder data)
// ──────────────────────────────────────────────

const BENTO_ITEMS = [
  {
    id: "bento-1",
    title: "The Power Bodycon",
    subtitle: "Sculpted to command attention",
    href: "/collections?category=bodycons",
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/5] lg:aspect-auto",
    image: "/products/product-01.png",
    alt: "Silk-ribbed bodycon dress from PEA_FITS",
  },
  {
    id: "bento-2",
    title: "Tailored Blazers",
    subtitle: "Architecture for the shoulders",
    href: "/collections?category=blazers",
    span: "lg:col-span-1 lg:row-span-1",
    aspect: "aspect-[4/5]",
    image: "/products/product-02.png",
    alt: "Sculpted noir maxi dress from PEA_FITS",
  },
  {
    id: "bento-3",
    title: "Evening Gowns",
    subtitle: "For entrances worth remembering",
    href: "/collections?category=gowns",
    span: "lg:col-span-1 lg:row-span-1",
    aspect: "aspect-[4/5]",
    image: "/products/product-03.png",
    alt: "Draped halter gown from PEA_FITS",
  },
  {
    id: "bento-4",
    title: "The Archive",
    subtitle: "Past silhouettes, future classics",
    href: "/collections?filter=archive",
    span: "lg:col-span-2 lg:row-span-1",
    aspect: "aspect-[16/9] lg:aspect-auto",
    image: "/products/product-04.png",
    alt: "Silk-ribbed bodycon detail from PEA_FITS",
  },
];

// ──────────────────────────────────────────────
// Testimonials
// ──────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id: "t1",
    quote:
      "PEA_FITS has completely redefined how I think about fashion. Every piece feels like it was made for me — because it was.",
    author: "Anisha K.",
    location: "Kathmandu",
  },
  {
    id: "t2",
    quote:
      "The quality of the fabric and the precision of the tailoring is unmatched. I've never felt more confident than in a PEA_FITS gown.",
    author: "Priya S.",
    location: "Pokhara",
  },
  {
    id: "t3",
    quote:
      "From the silhouette to the stitch, every detail matters. This is what luxury should feel like.",
    author: "Rita M.",
    location: "Lalitpur",
  },
  {
    id: "t4",
    quote:
      "I wore the architectural blazer to a board meeting and received four compliments before I even sat down.",
    author: "Sneha R.",
    location: "Kathmandu",
  },
];

// ──────────────────────────────────────────────
// Homepage Component
// ──────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ════════════════════════════════════════
          Hero Section
          ════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-neutral-100 overflow-hidden"
        aria-label="Hero banner"
      >
        {/* Full-bleed product image as hero visual */}
        <Image
          src="/products/hero-backshot.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" aria-hidden="true" />

        <Tilt3DShell
          className="relative z-10 mx-auto px-5 lg:px-16 max-w-[1440px] w-full text-center py-28 lg:py-40"
        >
          <span className="inline-block text-label-caps text-white/70 mb-6 tracking-[0.15em]">
            PEA_FITS — Est. 2024
          </span>
          <h1 className="display-lg text-white max-w-4xl mx-auto mb-6 drop-shadow-sm">
            Architectural Silhouettes
          </h1>
          <p className="body-lg text-white/80 max-w-xl mx-auto mb-10 drop-shadow-sm">
            Effortless luxury for the modern woman. Every curve, every cut — designed to make an entrance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black text-label-caps rounded-xl hover:bg-white/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              Explore Collections
            </Link>
            <Link
              href="/journal"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/40 text-white text-label-caps rounded-xl hover:bg-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              Read the Journal
            </Link>
          </div>
          <p className="mt-12 text-sm text-white/60 italic font-serif drop-shadow-sm">
            &ldquo;Designed for the woman who commands the room before she enters it.&rdquo;
          </p>
        </Tilt3DShell>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Bento Grid Section
          ════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-background" aria-labelledby="bento-heading">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="mb-12 text-center">
            <h2 id="bento-heading" className="headline-lg text-primary mb-3">
              Curated for You
            </h2>
            <p className="body-md text-text-secondary max-w-md mx-auto">
              Each collection is a study in form, fabric, and function.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {BENTO_ITEMS.map((item) => (
              <Tilt3DShell
                key={item.id}
                as="a"
                href={item.href}
                className={`group relative ${item.span} ${item.aspect} bg-neutral-200 rounded-xl overflow-hidden`}
                aria-label={`Browse ${item.title}`}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.subtitle}</p>
                </div>
              </Tilt3DShell>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Trending Now Section
          ════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="trending-heading">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 id="trending-heading" className="headline-lg text-primary mb-2">
                Trending Now
              </h2>
              <p className="body-md text-text-secondary">
                The silhouettes everyone&apos;s talking about.
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden sm:inline-flex text-label-caps text-primary hover:underline underline-offset-4 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Horizontally scrollable product row */}
        <div className="overflow-x-auto pb-4 -mx-5 lg:-mx-16 px-5 lg:px-16">
          <div className="flex gap-5 min-w-max">
            <HomepageProducts />
          </div>
        </div>

        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] mt-6 sm:hidden">
          <Link
            href="/collections"
            className="inline-flex text-label-caps text-primary hover:underline underline-offset-4 transition-colors"
          >
            View All Collections →
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Editorial Banner Section
          ════════════════════════════════════════ */}
      <section
        className="py-20 lg:py-28 bg-neutral-100 relative overflow-hidden"
        aria-label="Editorial banner"
      >
        <ParallaxLayer
          className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200"
          aria-hidden={true}
        />
        <Tilt3DShell className="mx-auto px-5 lg:px-16 max-w-[1440px] text-center relative z-10">
          <span className="text-label-caps text-text-secondary mb-6 block tracking-[0.15em]">
            The PEA_FITS Editorial
          </span>
          <blockquote className="max-w-3xl mx-auto">
            <p className="display-lg text-primary leading-tight mb-8 italic">
              &ldquo;Designed for the woman who commands the room before she enters it.&rdquo;
            </p>
          </blockquote>
          <Link
            href="/journal"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Read the Journal
          </Link>
        </Tilt3DShell>
      </section>

      {/* ════════════════════════════════════════
          Testimonials Section
          ════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-background" aria-labelledby="testimonials-heading">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="mb-12 text-center">
            <h2 id="testimonials-heading" className="headline-lg text-primary mb-3">
              From Our Community
            </h2>
            <p className="body-md text-text-secondary max-w-md mx-auto">
              Hear from the women who wear PEA_FITS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <Tilt3DShell
                key={t.id}
                as="div"
                className="bg-white border border-border rounded-xl p-6 flex flex-col"
              >
                <div className="mb-4 flex gap-1" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1">
                  <p className="text-sm text-secondary leading-relaxed italic mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <div className="border-t border-border pt-3 mt-auto">
                  <p className="text-sm font-medium text-primary">{t.author}</p>
                  <p className="text-xs text-text-secondary">{t.location}</p>
                </div>
              </Tilt3DShell>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Instagram / Social Feed Section
          ════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="social-heading">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <div className="mb-10 text-center">
            <h2 id="social-heading" className="headline-lg text-primary mb-2">
              @peafits
            </h2>
            <p className="body-md text-text-secondary">
              Follow us on Instagram for daily inspiration.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {[
              "/products/product-05.png",
              "/products/product-06.png",
              "/products/product-07.png",
              "/products/product-08.png",
              "/products/product-09.png",
              "/products/product-01.png",
              "/products/product-02.png",
              "/products/product-03.png",
            ].map((img, i) => (
              <Tilt3DShell
                key={i}
                as="a"
                href="https://instagram.com/pea_fits"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-neutral-100 rounded-xl overflow-hidden"
                aria-label={`PEA_FITS Instagram post ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`PEA_FITS Instagram post ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </Tilt3DShell>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Newsletter Section
          ════════════════════════════════════════ */}
      {/* ════════════════════════════════════════
          Newsletter
          ════════════════════════════════════════ */}
      <section className="py-20 px-5 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-heading-lg text-primary mb-4">Join the Inner Circle</h2>
          <p className="text-body mb-8 text-text-secondary">
            Be the first to know about new collections, exclusive drops, and member-only events.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
          <p className="mt-4 text-xs text-text-secondary">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
