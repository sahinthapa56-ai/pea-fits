"use client";

import { useEffect } from "react";

// ──────────────────────────────────────────────
// JSON-LD Schema Component
// ──────────────────────────────────────────────

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    // Remove any existing PEA-FITS JSON-LD scripts
    document.querySelectorAll('script[data-peafits="true"]').forEach((el) => el.remove());

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-peafits", "true");
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data]);

  return null;
}

// ──────────────────────────────────────────────
// Schema Builders
// ──────────────────────────────────────────────

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PEA FITS",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://peafits.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://peafits.com"}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "",
    contactType: "customer service",
  },
  sameAs: [
    "https://instagram.com/peafits",
    "https://facebook.com/peafits",
    "https://tiktok.com/@peafits",
  ],
};

export function productSchema(product: {
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  currency?: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "NPR",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://peafits.com"}/products/${product.slug}`,
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
