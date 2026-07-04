import React from "react";
import { cn } from "@/lib/utils";
import { ProductCard, type ProductCardProps } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ProductGridProps {
  products: ProductCardProps["product"][];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  emptyMessage?: string;
  onQuickAdd?: (productId: string) => void;
  /** Set of wishlisted product IDs */
  wishlistIds?: Set<string>;
  /** Toggle wishlist callback */
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

// ──────────────────────────────────────────────
// Column style map
// ──────────────────────────────────────────────

const columnStyles: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ProductGrid({
  products,
  columns = 4,
  loading = false,
  emptyMessage = "No products found.",
  onQuickAdd,
  wishlistIds,
  onToggleWishlist,
  className,
}: ProductGridProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div
        className={cn("grid gap-5 md:gap-6", columnStyles[columns], className)}
        aria-label="Loading products"
        role="status"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!products.length) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Try adjusting your filters or check back later for new arrivals."
        className={className}
      />
    );
  }

  // Product grid
  return (
    <div className={cn("grid gap-5 md:gap-6", columnStyles[columns], className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          onQuickAdd={onQuickAdd}
          wishlisted={wishlistIds?.has(product.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}
