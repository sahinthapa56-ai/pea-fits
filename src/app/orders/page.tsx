"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: number }[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  meta?: { totalPages: number; total: number };
  error?: string;
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
// Orders Page
// ──────────────────────────────────────────────

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch orders ──
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const result: PaginatedResponse<Order> = await res.json();
      if (result.success) {
        setOrders(result.data ?? []);
      } else {
        throw new Error(result.error ?? "Failed to load orders");
      }
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  // ── Loading state (auth) ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading orders">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──
  if (status === "unauthenticated") {
    return null; // will redirect
  }

  // ── Loading state (data) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-4xl py-12 lg:py-16">
          <div className="h-8 w-48 bg-neutral-100 rounded-lg mb-8 animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-6 space-y-3">
                <div className="h-5 w-3/4 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-4xl py-12 lg:py-16">
          <h1 className="display-lg text-primary mb-8">My Orders</h1>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-4xl py-12 lg:py-16">
          <h1 className="display-lg text-primary mb-8">My Orders</h1>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm mb-2">No orders yet</p>
            <p className="text-text-secondary text-xs mb-6">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Orders list ──
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-5 lg:px-16 max-w-4xl py-12 lg:py-16">
        <h1 className="display-lg text-primary mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white border border-border rounded-xl p-6 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm text-primary">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                </span>
                <span className="font-medium text-primary">
                  रु {Number(order.total).toLocaleString("en-IN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
