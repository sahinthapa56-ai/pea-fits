"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn, buildQueryString } from "@/lib/utils";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product, PaginatedResponse } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface FiltersState {
  category: string;
  minPrice: string;
  maxPrice: string;
  size: string;
  isOnSale: boolean;
  sort: string;
}

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Bodycons", value: "bodycons" },
  { label: "Blazers", value: "blazers" },
  { label: "Skirts", value: "skirts" },
  { label: "Gowns", value: "gowns" },
  { label: "Tops", value: "tops" },
  { label: "Accessories", value: "accessories" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

// ──────────────────────────────────────────────
// Collections Content
// ──────────────────────────────────────────────

export function CollectionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters from URL
  const [filters, setFilters] = useState<FiltersState>({
    category: searchParams.get("category") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    size: searchParams.get("size") ?? "",
    isOnSale: searchParams.get("isOnSale") === "true",
    sort: searchParams.get("sort") ?? "newest",
  });

  // Get active filter label from URL params
  const filterParam = searchParams.get("filter");
  const searchQuery = searchParams.get("search");

  // Sync filters from URL on mount
  useEffect(() => {
    setFilters({
      category: searchParams.get("category") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      size: searchParams.get("size") ?? "",
      isOnSale: searchParams.get("isOnSale") === "true",
      sort: searchParams.get("sort") ?? "newest",
    });
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    setCurrentPage(isNaN(page) ? 1 : page);
  }, [searchParams]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean | undefined | null> = {
        page: currentPage,
        pageSize: 12,
        sort: filters.sort || "newest",
      };
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.size) params.sizes = filters.size;
      if (filters.isOnSale) params.isOnSale = "true";
      if (filterParam) params[filterParam === "new" ? "isNew" : "isArchive"] = "true";
      if (searchQuery) params.search = searchQuery;

      const qs = buildQueryString(params);
      const res = await fetch(`/api/products${qs}`);
      if (!res.ok) throw new Error("Failed to load products");
      const result: PaginatedResponse<Product> = await res.json();
      if (result.success) {
        setProducts(result.data ?? []);
        setTotalPages(result.meta?.totalPages ?? 1);
      } else {
        throw new Error(result.error ?? "Failed to load products");
      }
    } catch {
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, filterParam, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL
  const updateFilters = (newFilters: FiltersState) => {
    const params: Record<string, string> = {};
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.minPrice) params.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice) params.maxPrice = newFilters.maxPrice;
    if (newFilters.size) params.size = newFilters.size;
    if (newFilters.isOnSale) params.isOnSale = "true";
    if (newFilters.sort && newFilters.sort !== "newest") params.sort = newFilters.sort;
    if (filterParam) params.filter = filterParam;
    if (searchQuery) params.search = searchQuery;

    const qs = new URLSearchParams(params).toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  // Individual filter handlers
  const setCategory = (cat: string) => {
    const next = { ...filters, category: cat };
    setFilters(next);
    setCurrentPage(1);
    updateFilters(next);
  };

  const setSize = (size: string) => {
    const next = { ...filters, size: filters.size === size ? "" : size };
    setFilters(next);
    setCurrentPage(1);
    updateFilters(next);
  };

  const setSort = (sort: string) => {
    const next = { ...filters, sort };
    setFilters(next);
    updateFilters(next);
  };

  const toggleSale = () => {
    const next = { ...filters, isOnSale: !filters.isOnSale };
    setFilters(next);
    setCurrentPage(1);
    updateFilters(next);
  };

  const clearFilters = () => {
    const cleared: FiltersState = {
      category: "",
      minPrice: "",
      maxPrice: "",
      size: "",
      isOnSale: false,
      sort: "newest",
    };
    setFilters(cleared);
    setCurrentPage(1);
    router.push(pathname);
  };

  const removeFilter = (key: keyof FiltersState) => {
    const next = { ...filters, [key]: key === "isOnSale" ? false : "" };
    setFilters(next);
    setCurrentPage(1);
    updateFilters(next);
  };

  // Pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
    const params: Record<string, string> = { page: String(page) };
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.size) params.size = filters.size;
    if (filters.isOnSale) params.isOnSale = "true";
    if (filters.sort && filters.sort !== "newest") params.sort = filters.sort;
    if (filterParam) params.filter = filterParam;
    if (searchQuery) params.search = searchQuery;

    const qs = new URLSearchParams(params).toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.size ||
    filters.isOnSale;

  const activeFilterCount = [
    filters.category,
    filters.size,
    filters.isOnSale ? "sale" : "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="py-16 lg:py-20 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <h1 className="display-lg text-primary mb-3">
            Collections
            {filterParam === "new" && (
              <span className="text-text-secondary"> — New Arrivals</span>
            )}
            {filterParam === "archive" && (
              <span className="text-text-secondary"> — The Archive</span>
            )}
            {searchQuery && (
              <span className="text-text-secondary"> — Search: &ldquo;{searchQuery}&rdquo;</span>
            )}
          </h1>
          <p className="body-md text-text-secondary max-w-lg">
            Discover pieces that define your silhouette.
          </p>
        </div>
      </section>

      <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* ════════════════════════════════════
              Sidebar Filters (Desktop)
              ════════════════════════════════════ */}
          <aside
            className="hidden lg:block w-64 flex-shrink-0"
            aria-label="Product filters"
          >
            <div className="sticky top-28 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-label-caps text-primary mb-4 uppercase tracking-wider">
                  Categories
                </h3>
                <ul className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.value}>
                      <button
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={cn(
                          "text-sm transition-colors w-full text-left",
                          filters.category === cat.value
                            ? "text-primary font-medium"
                            : "text-text-secondary hover:text-primary",
                        )}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-label-caps text-primary mb-4 uppercase tracking-wider">
                  Price Range
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    onBlur={() => updateFilters(filters)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Minimum price"
                  />
                  <span className="text-text-secondary">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    onBlur={() => updateFilters(filters)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Maximum price"
                  />
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-label-caps text-primary mb-4 uppercase tracking-wider">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center text-sm border rounded-lg transition-colors",
                        filters.size === s
                          ? "bg-primary text-on-primary border-primary"
                          : "border-border text-text-secondary hover:border-primary hover:text-primary",
                      )}
                      aria-pressed={filters.size === s}
                      aria-label={`Size ${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* On Sale Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={filters.isOnSale}
                    onClick={toggleSale}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors",
                      filters.isOnSale ? "bg-primary" : "bg-neutral-300",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                        filters.isOnSale && "translate-x-4",
                      )}
                    />
                  </button>
                  <span className="text-sm text-primary">On Sale</span>
                </label>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-text-secondary hover:text-primary underline underline-offset-2 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* ════════════════════════════════════
              Main Content
              ════════════════════════════════════ */}
          <div className="flex-1 min-w-0">
            {/* ── Top bar: mobile filter + sort ── */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-2 text-sm text-primary border border-border rounded-lg px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-filters-panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <label htmlFor="sort-select" className="text-sm text-text-secondary hidden sm:inline">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Mobile Filters Panel ── */}
            {mobileFiltersOpen && (
              <div
                id="mobile-filters-panel"
                className="lg:hidden mb-6 p-4 bg-white border border-border rounded-xl space-y-6"
              >
                {/* Categories */}
                <div>
                  <h3 className="text-label-caps text-primary mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={cn(
                          "px-3 py-1.5 text-sm border rounded-lg transition-colors",
                          filters.category === cat.value
                            ? "bg-primary text-on-primary border-primary"
                            : "border-border text-text-secondary",
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h3 className="text-label-caps text-primary mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center text-sm border rounded-lg",
                          filters.size === s
                            ? "bg-primary text-on-primary border-primary"
                            : "border-border text-text-secondary",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* On Sale */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={filters.isOnSale}
                    onClick={toggleSale}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors",
                      filters.isOnSale ? "bg-primary" : "bg-neutral-300",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                        filters.isOnSale && "translate-x-4",
                      )}
                    />
                  </button>
                  <span className="text-sm">On Sale</span>
                </label>

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-text-secondary hover:text-primary underline underline-offset-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* ── Active Filter Chips ── */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium">
                    {CATEGORIES.find((c) => c.value === filters.category)?.label ?? filters.category}
                    <button
                      type="button"
                      onClick={() => removeFilter("category")}
                      className="text-neutral-400 hover:text-primary transition-colors"
                      aria-label={`Remove category filter`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.size && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium">
                    Size {filters.size}
                    <button
                      type="button"
                      onClick={() => removeFilter("size")}
                      className="text-neutral-400 hover:text-primary transition-colors"
                      aria-label="Remove size filter"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.isOnSale && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-editorial-red/10 text-editorial-red rounded-full text-xs font-medium">
                    On Sale
                    <button
                      type="button"
                      onClick={() => removeFilter("isOnSale")}
                      className="text-editorial-red/60 hover:text-editorial-red transition-colors"
                      aria-label="Remove sale filter"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => { setError(null); setLoading(true); fetchProducts(); }}
                  className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
            {/* ── Product Grid ── */}
            <ProductGrid
              products={products}
              loading={loading}
              columns={3}
              emptyMessage={
                searchQuery
                  ? `No products found for "${searchQuery}". Try a different search term.`
                  : "No products match your filters. Try adjusting your selection."
              }
            />

            {/* ── Pagination ── */}
            {totalPages > 1 && !loading && (
              <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-2 text-sm border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors"
                  aria-label="Previous page"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "w-10 h-10 text-sm rounded-lg transition-colors",
                        currentPage === pageNum
                          ? "bg-primary text-on-primary"
                          : "border border-border text-text-secondary hover:border-primary hover:text-primary",
                      )}
                      aria-current={currentPage === pageNum ? "page" : undefined}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 text-sm border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors"
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
