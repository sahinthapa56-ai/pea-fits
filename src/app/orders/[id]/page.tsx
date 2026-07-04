"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn, formatPrice } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    province: string;
    zip: string;
    phone: string;
  };
}

// ──────────────────────────────────────────────
// Status Badge
// ──────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800",
      )}
    >
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────
// Order Detail Page
// ──────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status: authStatus } = useSession();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Order not found");
        throw new Error("Failed to load order");
      }
      const result = await res.json();
      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        setError(result.error ?? "Order not found.");
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message === "Order not found"
          ? err.message
          : "Failed to load order details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (authStatus === "authenticated" && orderId) {
      fetchOrder();
    }
  }, [authStatus, orderId, router, fetchOrder]);

  // ── Loading (auth) ──
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading order">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") return null;

  // ── Loading (data) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-3xl py-12 lg:py-16">
          <div className="h-7 w-48 bg-neutral-100 rounded-lg animate-pulse mb-8" />
          <div className="bg-white border border-border rounded-xl p-6 lg:p-8 space-y-4">
            <div className="h-5 w-3/4 bg-neutral-100 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-neutral-100 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-neutral-100 rounded animate-pulse" />
            <div className="border-t border-border pt-4">
              <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── 404 / Error state ──
  if (error || !order) {
    const is404 = error === "Order not found";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            {is404 ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            )}
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">
          {is404 ? "Order Not Found" : "Something Went Wrong"}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {is404
            ? "The order you're looking for doesn't exist or has been removed."
            : error ?? "We couldn't load this order."}
        </p>
        <div className="flex gap-3">
          {!is404 && (
            <button
              type="button"
              onClick={fetchOrder}
              className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
            >
              Try Again
            </button>
          )}
          <Link
            href="/orders"
            className="px-6 py-2.5 border border-border text-primary text-label-caps rounded-xl hover:bg-neutral-50 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderItems = order.items ?? [];
  const shipping = order.shippingAddress ?? {};

  // ── Success ──
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-5 lg:px-16 max-w-3xl py-12 lg:py-16">
        {/* Back link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
          </svg>
          Back to Orders
        </Link>

        <div className="bg-white border border-border rounded-xl p-6 lg:p-8 space-y-6">
          {/* Order number & status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Order</p>
              <p className="text-lg font-semibold text-primary">{order.orderNumber}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="text-sm text-text-secondary">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* Items */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Items</h2>
            <div className="space-y-3">
              {orderItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-14 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{item.name ?? "Product"}</p>
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          {shipping.fullName && (
            <div className="border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Shipping</h2>
              <div className="text-sm space-y-1 text-secondary">
                <p>{shipping.fullName}</p>
                <p>{shipping.address}</p>
                <p>{shipping.city}, {shipping.province} {shipping.zip}</p>
                <p>{shipping.phone}</p>
              </div>
            </div>
          )}

          {/* Payment summary */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-primary">{formatPrice(order.subtotal ?? order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-primary">
                  {order.shippingCost ? formatPrice(order.shippingCost) : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Method</span>
                <span className="text-primary font-medium">{order.shippingMethod ?? "Standard"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Payment</span>
                <span className="text-primary font-medium">{order.paymentMethod ?? "Cash on Delivery"}</span>
              </div>
            </div>
            <div className="border-t border-border mt-3 pt-3">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-primary">Total</span>
                <span className="font-semibold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
