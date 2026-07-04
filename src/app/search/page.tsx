"use client";

import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/index";

// ──────────────────────────────────────────────
// Suggested categories when search is empty
// ──────────────────────────────────────────────

const SUGGESTED_CATEGORIES = [
  { label: "New Arrivals", href: "/collections?filter=new" },
  { label: "Bodycons", href: "/collections?category=bodycons" },
  { label: "Blazers", href: "/collections?category=blazers" },
  { label: "Evening Gowns", href: "/collections?category=gowns" },
  { label: "The Archive", href: "/collections?filter=archive" },
  { label: "Accessories", href: "/collections?category=accessories" },
];

// ──────────────────────────────────────────────
// Search Page
// ──────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-200 rounded w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=20`);
      if (!res.ok) throw new Error("Search failed");
      const result = await res.json();
      if (result.success) {
        setResults(result.data ?? []);
      } else {
        throw new Error(result.error ?? "Search failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch, router, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-12 lg:py-16">
        {/* ── Search Input ── */}
        <form onSubmit={handleSubmit} role="search" aria-label="Search products">
          <div className="relative max-w-2xl mx-auto mb-12">
            <label htmlFor="search-input" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections, products, styles..."
              className="w-full px-6 py-4 bg-white border border-border rounded-xl text-lg text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              autoComplete="off"
              aria-label="Search products"
            />
            {/* Search icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </form>

        {/* ── Results ── */}
        {hasSearched && (
          <>
            <div className="mb-6">
              <p className="text-sm text-text-secondary">
                {loading
                  ? "Searching..."
                  : error
                    ? error
                    : results.length > 0
                      ? `Showing ${results.length} result${results.length === 1 ? "" : "s"} for "${initialQuery || query}"`
                      : `No results found for "${initialQuery || query}"`}
              </p>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => performSearch(query)}
                  className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <ProductGrid products={[]} loading={true} columns={4} />
            ) : results.length > 0 ? (
              <ProductGrid products={results} columns={4} />
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm mb-2">
                  We couldn&apos;t find anything for &ldquo;{initialQuery || query}&rdquo;
                </p>
                <p className="text-text-secondary text-xs">
                  Try a different search term or browse our categories below.
                </p>

                {/* Suggested categories on no results */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="px-4 py-2 text-sm border border-border rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Empty state: suggestions ── */}
        {!hasSearched && (
          <div className="text-center">
            <h2 className="text-lg font-medium text-primary mb-6">Browse Categories</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="px-6 py-3 text-sm border border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
