"use client";

import React, { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type RecentlyViewedProduct = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "basePrice"
  | "salePrice"
  | "isOnSale"
  | "isNew"
  | "inStock"
  | "stockQuantity"
> & {
  images?: {
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }[];
  category?: { name: string; slug: string } | null;
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch product data for each recently viewed slug
  useEffect(() => {
    if (recentlyViewed.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);

    Promise.all(
      recentlyViewed.map(async (slug) => {
        try {
          const res = await fetch(`/api/products/${slug}`);
          if (!res.ok) return null;
          const json = await res.json();
          return json.success ? (json.data as RecentlyViewedProduct) : null;
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      setProducts(results.filter(Boolean) as RecentlyViewedProduct[]);
      setLoading(false);
    });
  }, [recentlyViewed]);

  // Don't render anything if there are no recently viewed items
  if (recentlyViewed.length === 0) return null;

  return (
    <section className="mt-16 lg:mt-24 border-t border-border pt-10">
      <h2 className="text-2xl font-semibold text-primary mb-6">
        Recently Viewed
      </h2>

      {loading && products.length === 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[220px] aspect-[4/5] bg-neutral-100 rounded-lg animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin -mx-5 lg:-mx-16 px-5 lg:px-16">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[220px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
