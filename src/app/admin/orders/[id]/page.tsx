"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, formatPriceDecimal } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OrderItemDetail {
  id: string;
  name: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
  product: { id: string; name: string; slug: string; images: { url: string }[] } | null;
}

interface OrderUserDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  paymentMethod: string | null;
  notes: string | null;
  couponCode: string | null;
  createdAt: string;
  updatedAt: string;
  user: OrderUserDetail;
  items: OrderItemDetail[];
}

// ──────────────────────────────────────────────
// Status config
// ──────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const statusColors: Record<string, "success" | "warning" | "error" | "primary" | "outline"> = {
  DELIVERED: "success",
  SHIPPED: "success",
  CONFIRMED: "primary",
  PROCESSING: "warning",
  PENDING: "warning",
  CANCELLED: "error",
  REFUNDED: "error",
};

const paymentColors: Record<string, "success" | "warning" | "error" | "primary" | "outline"> = {
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "error",
  REFUNDED: "outline",
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ──────────────────────────────────────────────
// Order Detail Page
// ──────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch order");
      setOrder(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [id, fetchOrder]);

  const handleStatusUpdate = async (field: "status" | "paymentStatus", value: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update order");
      addToast("success", "Order updated successfully");
      fetchOrder();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={fetchOrder} />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNumber },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">{order.orderNumber}</h1>
          <p className="text-sm text-text-secondary mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[order.status] ?? "outline"} size="md">
            {order.status}
          </Badge>
          <Badge variant={paymentColors[order.paymentStatus] ?? "outline"} size="md">
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Order items & summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Order Items</h2>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    {item.product?.images[0] ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">—</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary">{item.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      {item.sku && <span>SKU: {item.sku}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-primary">{formatPriceDecimal(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-primary">{formatPriceDecimal(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="text-primary">{formatPriceDecimal(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Discount</span>
                  <span className="text-error">-{formatPriceDecimal(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span className="text-primary">Total</span>
                <span className="text-primary text-lg">{formatPriceDecimal(order.total)}</span>
              </div>
            </div>
            {order.couponCode && (
              <p className="text-xs text-text-secondary mt-2">Coupon: {order.couponCode}</p>
            )}
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-primary mb-2">Notes</h2>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Right column — Customer info & status updates */}
        <div className="space-y-6">
          {/* Status Updates */}
          <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-primary">Update Status</h2>
            <div>
              <Select
                label="Order Status"
                options={STATUS_OPTIONS}
                value={order.status}
                onChange={(e) => handleStatusUpdate("status", e.target.value)}
              />
            </div>
            <div>
              <Select
                label="Payment Status"
                options={PAYMENT_STATUS_OPTIONS}
                value={order.paymentStatus}
                onChange={(e) => handleStatusUpdate("paymentStatus", e.target.value)}
              />
            </div>
            {saving && <p className="text-xs text-text-secondary">Saving...</p>}
          </section>

          {/* Customer Info */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-3">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="text-primary font-medium">{order.user.name ?? "—"}</p>
              <p className="text-text-secondary">{order.user.email}</p>
              {order.user.phone && <p className="text-text-secondary">{order.user.phone}</p>}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-primary mb-3">Shipping Address</h2>
            <div className="space-y-1 text-sm text-text-secondary">
              {order.shippingName && <p className="text-primary font-medium">{order.shippingName}</p>}
              {order.shippingPhone && <p>{order.shippingPhone}</p>}
              {order.shippingAddress && <p>{order.shippingAddress}</p>}
              {order.shippingCity && <p>{order.shippingCity}</p>}
              {order.shippingProvince && <p>{order.shippingProvince}</p>}
              {order.shippingZip && <p>{order.shippingZip}</p>}
              {order.shippingCountry && <p>{order.shippingCountry}</p>}
              {!order.shippingAddress && <p className="italic">No shipping address provided</p>}
            </div>
          </section>

          {/* Payment Info */}
          {order.paymentMethod && (
            <section className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-primary mb-3">Payment</h2>
              <p className="text-sm text-text-secondary">{order.paymentMethod}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
