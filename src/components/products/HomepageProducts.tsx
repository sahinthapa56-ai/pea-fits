"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Product } from "@/types/index";

// ──────────────────────────────────────────────
// HomepageProducts — fetches trending/newest products
// ──────────────────────────────────────────────

export function HomepageProducts() {
  const [products, setProducts] = useState<
    (Pick<
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
    })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?sort=newest&limit=8");
        const result = await res.json();
        if (result.success) {
          setProducts(result.data ?? []);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-64 sm:w-72 flex-shrink-0">
            <Skeleton variant="card" />
          </div>
        ))}
      </>
    );
  }

  if (!products.length) {
    return (
      <p className="text-text-secondary text-sm py-8">
        Products coming soon.
      </p>
    );
  }

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="w-64 sm:w-72 flex-shrink-0">
          <ProductCard product={product} />
        </div>
      ))}
    </>
  );
}
