"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCartStore, getSubtotal, getItemCount, type CartItem } from "@/store/cart-store";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

// ──────────────────────────────────────────────
// Bag Page
// ──────────────────────────────────────────────

export default function BagPage() {
  const { items, removeItem, updateQuantity, syncFromDB } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to sync cart from server if logged in
  useEffect(() => {
    const syncCart = async () => {
      setError(null);
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Failed to load cart");
        const result = await res.json();
        if (result.success && result.data) {
          const serverItems: CartItem[] = result.data.map((item: any) => ({
            id: item.variantId
              ? `${item.productId}-${item.variantId}`
              : item.productId,
            productId: item.productId,
            variantId: item.variantId,
            name: item.product?.name ?? "Product",
            slug: item.product?.slug ?? "",
            price:
              item.product?.isOnSale && item.product?.salePrice != null
                ? item.product.salePrice
                : item.product?.basePrice ?? 0,
            size: item.variant?.size ?? null,
            color: item.variant?.color ?? null,
            image:
              item.product?.images?.find((img: any) => img.isPrimary)?.url ??
              item.product?.images?.[0]?.url ??
              null,
            quantity: item.quantity,
            maxQuantity: Math.min(item.product?.stockQuantity ?? 10, 10),
          }));
          syncFromDB(serverItems);
        }
      } catch {
        setError("Could not load your cart. Please try again.");
      } finally {
        setLoading(false);
        setSynced(true);
      }
    };
    syncCart();
  }, [syncFromDB]);

  const subtotal = getSubtotal(items);
  const itemCount = getItemCount(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 250;
  const estimatedTotal = subtotal + shipping;

  // Loading state
  if (loading && !synced) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
          <div className="h-8 w-48 bg-neutral-100 rounded-lg mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            <div className="lg:col-span-2 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-border rounded-xl">
                  <Skeleton variant="card" className="w-24 h-32" />
                  <div className="flex-1 space-y-3">
                    <Skeleton variant="row" lines={2} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Skeleton variant="card" className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
          <h1 className="display-lg text-primary mb-8">Shopping Bag</h1>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!items.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
          <h1 className="display-lg text-primary mb-8">Shopping Bag</h1>
          <EmptyState
            icon={
              <svg className="w-16 h-16 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
            title="Your bag is empty"
            description="Looks like you haven't added anything yet. Start exploring our collections."
            actionLabel="Start Shopping"
            href="/collections"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="display-lg text-primary">Shopping Bag</h1>
          <span className="text-sm text-text-secondary">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white border border-border rounded-xl"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.slug}`}
                  className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-medium text-primary hover:underline truncate"
                  >
                    {item.name}
                  </Link>

                  {(item.size || item.color) && (
                    <p className="text-xs text-text-secondary mt-1">
                      {[item.size, item.color].filter(Boolean).join(" / ")}
                    </p>
                  )}

                  <p className="text-sm font-medium text-primary mt-auto">
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <QuantitySelector
                      value={item.quantity}
                      min={1}
                      max={item.maxQuantity}
                      onChange={(qty) => updateQuantity(item.id, qty)}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-text-secondary hover:text-editorial-red transition-colors underline underline-offset-2"
                      aria-label={`Remove ${item.name} from bag`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-xl p-6 sticky top-28">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-primary font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-primary font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-text-secondary">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-primary">Estimated Total</span>
                  <span className="font-semibold text-primary">{formatPrice(estimatedTotal)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-4">
                <label htmlFor="promo-code" className="sr-only">Promo code</label>
                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link href="/checkout" className="block mt-6">
                <Button variant="primary" size="lg" fullWidth>
                  Checkout — {formatPrice(estimatedTotal)}
                </Button>
              </Link>

              <Link
                href="/collections"
                className="block text-center text-sm text-text-secondary hover:text-primary underline underline-offset-2 transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* ── Mobile Summary (visible only on mobile, after items) ── */}
        <div className="mt-8 lg:hidden">
          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-primary font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-primary font-medium">
                  {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-primary">Estimated Total</span>
                <span className="font-semibold text-primary">{formatPrice(estimatedTotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-4">
              <Button variant="primary" size="lg" fullWidth>
                Checkout — {formatPrice(estimatedTotal)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
