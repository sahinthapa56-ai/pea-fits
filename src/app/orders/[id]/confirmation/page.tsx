"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Order } from "@/types/index";

// ──────────────────────────────────────────────
// Order Confirmation Page
// ──────────────────────────────────────────────

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const result = await res.json();
        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          setError(result.error ?? "Order not found.");
        }
      } catch {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-3xl py-20 text-center">
          <Skeleton variant="row" lines={4} className="max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Order Not Found</h1>
        <p className="text-sm text-text-secondary mb-6">{error ?? "We couldn't find this order."}</p>
        <Link
          href="/profile"
          className="text-sm text-primary underline underline-offset-2 hover:text-text-secondary transition-colors"
        >
          View your orders
        </Link>
      </div>
    );
  }

  const orderItems = (order as any).items ?? [];
  const shippingAddress = (order as any).shippingAddress ?? {};

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-5 lg:px-16 max-w-3xl py-16 lg:py-20">
        {/* ── Success Icon ── */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        {/* ── Thank You Message ── */}
        <div className="text-center mb-10">
          <h1 className="display-lg text-primary mb-3">Thank You for Your Order!</h1>
          <p className="body-md text-text-secondary max-w-md mx-auto">
            We&apos;ve received your order and will begin processing it right away. You&apos;ll receive a confirmation email shortly.
          </p>
        </div>

        {/* ── Order Details Card ── */}
        <div className="bg-white border border-border rounded-xl p-6 lg:p-8 space-y-6">
          {/* Order number & date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Order Number</p>
              <p className="text-lg font-semibold text-primary">{(order as any).orderNumber ?? order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary uppercase tracking-wider">Date</p>
              <p className="text-sm text-primary">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {orderItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
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

          {/* Shipping Details */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Shipping Details</h2>
            <div className="text-sm space-y-1 text-secondary">
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.address}</p>
              <p>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}</p>
              <p>{shippingAddress.phone}</p>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p><span className="text-text-secondary">Method:</span> <span className="text-primary font-medium">{(order as any).shippingMethod ?? "Standard"}</span></p>
              <p><span className="text-text-secondary">Payment:</span> <span className="text-primary font-medium">{(order as any).paymentMethod ?? "Cash on Delivery"}</span></p>
              <p><span className="text-text-secondary">Status:</span> <span className="text-primary font-medium">{order.status}</span></p>
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-primary">{formatPrice(String(order.total ?? 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-primary">
                  {(order as any).shippingCost ? formatPrice((order as any).shippingCost) : "Calculated at checkout"}
                </span>
              </div>
            </div>
            <div className="border-t border-border mt-3 pt-3">
              <div className="flex justify-between text-base">
                <span className="font-semibold text-primary">Total</span>
                <span className="font-semibold text-primary">{formatPrice(String(order.total ?? 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center mt-10">
          <Link href="/collections">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </Link>
          <p className="mt-4 text-sm text-text-secondary">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
