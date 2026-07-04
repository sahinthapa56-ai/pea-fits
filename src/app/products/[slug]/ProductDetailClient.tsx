"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ProductGallery } from "@/components/products/ProductGallery";
import { VariantSelector } from "@/components/products/VariantSelector";
import { ReviewList } from "@/components/products/ReviewList";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useToast } from "@/components/ui/Toast";
import BackInStockForm from "@/components/products/BackInStockForm";
import DOMPurify from "dompurify";
import type { Product, ProductVariant, ProductImage, Review } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ProductDetailClientProps {
  product: Product & {
    images?: {
      id: string;
      productId?: string;
      url: string;
      alt: string | null;
      isPrimary: boolean;
      sortOrder?: number;
      createdAt?: Date;
    }[];
    variants?: ProductVariant[];
    category?: { id: string; name: string; slug: string } | null;
    collection?: { id: string; name: string; slug: string } | null;
    reviews?: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      user?: { id: string; name: string | null; image: string | null } | null;
    }[];
    relatedProducts?: (Product & {
      images?: { url: string; alt: string | null; isPrimary: boolean }[];
    })[];
  };
}

// ──────────────────────────────────────────────
// ── Product Detail Client Component
// ──────────────────────────────────────────────

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem, openCart } = useCartStore();
  const { addToast } = useToast();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.find((v) => v.stock > 0)?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const variants = product.variants ?? [];
  const images = (product.images ?? []) as ProductImage[];
  const reviews = (product.reviews ?? []) as Review[];

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  // Determine display price
  const displayPrice =
    selectedVariant?.price != null
      ? Number(selectedVariant.price)
      : product.isOnSale && product.salePrice != null
        ? Number(product.salePrice)
        : Number(product.basePrice);

  const originalPrice = selectedVariant?.price != null
    ? Number(selectedVariant.price)
    : Number(product.basePrice);

  const isOnSale = product.isOnSale && product.salePrice != null;
  const savings = isOnSale ? originalPrice - displayPrice : 0;

  // ── Recently Viewed ──
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    addRecentlyViewed(product.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const maxQuantity = selectedVariant?.stock ?? product.stockQuantity ?? 10;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.inStock;

  // ── Add to Cart ──
  const handleAddToCart = () => {
    const primaryImage = images.find((img) => img.isPrimary) ?? images[0];

    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      size: selectedVariant?.size ?? null,
      color: selectedVariant?.color ?? null,
      image: primaryImage?.url ?? null,
      quantity,
      maxQuantity,
    });

    addToast("success", `${product.name} added to your bag!`);
    openCart();
  };

  // ── Breadcrumb items ──
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...(product.category
      ? [{ label: product.category.name, href: `/collections?category=${product.category.slug}` }]
      : []),
    { label: product.name, href: `/products/${product.slug}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Breadcrumb ── */}
      <div className="mx-auto px-5 lg:px-16 max-w-[1440px] pt-6 pb-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* ════════════════════════════════════
              Gallery
              ════════════════════════════════════ */}
          <div>
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* ════════════════════════════════════
              Product Info
              ════════════════════════════════════ */}
          <div className="flex flex-col">
            {/* Category / Collection labels */}
            <div className="flex items-center gap-3 mb-3">
              {product.category && (
                <Link
                  href={`/collections?category=${product.category.slug}`}
                  className="text-label-caps text-primary/60 hover:text-primary transition-colors uppercase tracking-wider text-xs"
                >
                  {product.category.name}
                </Link>
              )}
              {product.collection && (
                <>
                  <span className="text-text-secondary/40" aria-hidden="true">/</span>
                  <Link
                    href={`/collections/${product.collection.slug}`}
                    className="text-label-caps text-primary/60 hover:text-primary transition-colors uppercase tracking-wider text-xs"
                  >
                    {product.collection.name}
                  </Link>
                </>
              )}
            </div>

            {/* Product name */}
            <h1 className="headline-lg text-primary mb-2">
              {product.name}
            </h1>

            {/* Short description */}
            {product.shortDescription && (
              <p className="body-md text-text-secondary mb-4">
                {product.shortDescription}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-semibold text-primary">
                {formatPrice(displayPrice)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-lg text-text-secondary line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-sm font-medium text-error">
                    Save {formatPrice(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="mb-6">
                <VariantSelector
                  variants={variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-label-caps text-secondary uppercase mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-12 text-center text-sm font-medium text-primary" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart button */}
            <div className="mb-4">
              <Button
                size="lg"
                className="w-full"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                {inStock ? "Add to Bag" : "Out of Stock"}
              </Button>
            </div>

            {/* Back-in-stock notification */}
            {!inStock && (
              <div className="mb-4">
                <BackInStockForm
                  productSlug={product.slug}
                  variantId={selectedVariantId}
                />
              </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <p className="text-sm text-error mb-6">
                Only {selectedVariant.stock} left in stock
              </p>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-border pt-6 mt-2">
                <h2 className="text-label-caps text-primary uppercase tracking-wider mb-3">
                  Details
                </h2>
                <div
                  className="prose prose-sm text-text-secondary leading-relaxed max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              </div>
            )}

            {/* Additional info */}
            <div className="border-t border-border pt-6 mt-6 space-y-3">
              {product.material && (
                <div className="flex gap-2">
                  <span className="text-label-caps text-secondary uppercase text-xs min-w-20">
                    Fabric
                  </span>
                  <span className="text-sm text-primary">{product.material}</span>
                </div>
              )}
              {product.careInstructions && (
                <div className="flex gap-2">
                  <span className="text-label-caps text-secondary uppercase text-xs min-w-20">
                    Care
                  </span>
                  <span className="text-sm text-primary">{product.careInstructions}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════
            Reviews Section
            ════════════════════════════════════ */}
        <section className="mt-16 lg:mt-24 border-t border-border pt-10">
          <ReviewList productId={product.id} reviews={reviews} />
        </section>

        {/* ════════════════════════════════════
            Recently Viewed Section
            ════════════════════════════════════ */}
        <RecentlyViewed />

        {/* ════════════════════════════════════
            Developer Credit
            ════════════════════════════════════ */}
        <footer className="mt-16 py-6 border-t border-border text-center">
          <p className="text-xs text-text-secondary font-mono tracking-wider uppercase">
            DEVELOPED BY SAHIN THAPA
          </p>
        </footer>
      </div>
    </div>
  );
}
