"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ProductCardProps {
  product: Pick<
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
  priority?: boolean;
  className?: string;
  onQuickAdd?: (productId: string) => void;
  /** Whether the product is wishlisted */
  wishlisted?: boolean;
  /** Toggle wishlist callback */
  onToggleWishlist?: (productId: string) => void;
}

// ──────────────────────────────────────────────
// Heart icon
// ──────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ProductCard({
  product,
  priority = false,
  className,
  onQuickAdd,
  wishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary);
  const secondaryImage = product.images?.find((img) => !img.isPrimary);
  const hasHoverImage = !!secondaryImage;

  const displayPrice = Number(product.isOnSale && product.salePrice != null
    ? product.salePrice
    : product.basePrice);

  return (
    <div
      className={cn("product-card group relative flex flex-col", className)}
      data-testid="product-card"
    >
      {/* ── Image Container ── */}
      <Link
        href={`/products/${product.slug}`}
        className="image-zoom-container relative aspect-[4/5] w-full bg-neutral-100 rounded-lg overflow-hidden"
        aria-label={product.name}
      >
        {/* Primary Image */}
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              hasHoverImage && "group-hover:opacity-0",
            )}
            priority={priority}
          />
        )}

        {/* Secondary Image (hover swap) */}
        {hasHoverImage && secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt ?? `${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-image-secondary object-cover"
          />
        )}

        {/* Fallback if no image */}
        {!primaryImage && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isOnSale && (
            <Badge variant="sale" size="sm">
              Sale
            </Badge>
          )}
          {product.isNew && !product.isOnSale && (
            <Badge variant="new" size="sm">
              New
            </Badge>
          )}
        </div>

        {/* Wishlist heart button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full",
              "bg-white/80 backdrop-blur-sm shadow-sm transition-all",
              "hover:bg-white hover:scale-110",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              wishlisted ? "text-red-500" : "text-neutral-600 hover:text-red-400",
            )}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <HeartIcon filled={wishlisted} />
          </button>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Product Info ── */}
      <div className="mt-3 flex flex-col gap-1">
        {product.category && (
          <p className="text-label-caps text-text-secondary">{product.category.name}</p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-primary hover:underline underline-offset-2 transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary font-medium">
            {formatPrice(displayPrice)}
          </span>
          {product.isOnSale && product.salePrice != null && (
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(Number(product.basePrice))}
            </span>
          )}
        </div>
      </div>

      {/* ── Quick Add Button (desktop hover) ── */}
      {product.inStock && onQuickAdd && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onQuickAdd(product.id);
          }}
          className="quick-add-button absolute bottom-0 left-0 right-0 mx-3 mb-3 bg-primary text-on-primary text-label-caps py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Quick add ${product.name} to bag`}
        >
          Quick Add
        </button>
      )}

      {/* Mobile quick add (always visible) */}
      {product.inStock && !onQuickAdd && (
        <button
          type="button"
          className="mt-2 lg:hidden w-full bg-primary text-on-primary text-label-caps py-2.5 rounded-lg transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Add ${product.name} to bag`}
        >
          Add to Bag
        </button>
      )}
    </div>
  );
}
