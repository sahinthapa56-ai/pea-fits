"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Collection, Product } from "@/types/index";

// ──────────────────────────────────────────────
// Collection Detail Page
// ──────────────────────────────────────────────

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/collections?slug=${slug}`);
        const result = await res.json();
        if (result.success && result.data) {
          const col = Array.isArray(result.data) ? result.data[0] : result.data;
          setCollection(col);

          // Fetch products in this collection
          const prodRes = await fetch(`/api/products?collection=${slug}&limit=50`);
          const prodResult = await prodRes.json();
          if (prodResult.success) {
            setProducts(prodResult.data ?? []);
          }
        } else {
          setError("Collection not found.");
        }
      } catch {
        setError("Failed to load collection. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-20">
          <Skeleton variant="row" lines={2} className="max-w-xl mb-8" />
          <div className="aspect-[21/9] rounded-xl bg-neutral-100 mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Collection Not Found</h1>
        <p className="text-sm text-text-secondary mb-6">{error ?? "This collection doesn't exist."}</p>
        <Link
          href="/collections"
          className="text-sm text-primary underline underline-offset-2 hover:text-text-secondary transition-colors"
        >
          Browse all collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Collection Hero ── */}
      <section className="relative bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
            {/* Cover image */}
            <div className="w-full lg:w-1/2 aspect-[16/9] lg:aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
              <div className="w-full h-full bg-neutral-200 flex items-center justify-center" aria-hidden="true">
                <svg className="w-16 h-16 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <Link
                href="/collections"
                className="text-label-caps text-text-secondary hover:text-primary transition-colors mb-4 inline-block"
              >
                ← Back to Collections
              </Link>
              <h1 className="display-lg text-primary mb-4">{collection.name}</h1>
              {collection.description && (
                <p className="body-lg text-text-secondary leading-relaxed">
                  {collection.description}
                </p>
              )}
              <p className="mt-6 text-sm text-text-secondary">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="py-12 lg:py-16" aria-label={`${collection.name} products`}>
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <ProductGrid
            products={products}
            loading={false}
            columns={4}
            emptyMessage="No products in this collection yet."
          />
        </div>
      </section>
    </div>
  );
}
