"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OrderUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  user: OrderUser;
  items: OrderItem[];
}

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ──────────────────────────────────────────────
// Status config
// ──────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
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

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────
// Orders Page
// ──────────────────────────────────────────────

export default function OrdersPage() {
  const { addToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch orders");
      setOrders(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update order");
      addToast("success", "Order status updated");
      fetchOrders();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update order");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Orders</h1>

      {/* Filter */}
      <div className="w-full sm:w-48 mb-6">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <Skeleton variant="table" lines={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Orders will appear here when customers place them."
        />
      ) : (
        <>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-container/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Total</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        className="hover:bg-surface-container/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-primary">{order.user.name ?? "—"}</p>
                          <p className="text-xs text-text-secondary">{order.user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[order.status] ?? "outline"} size="sm">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Select
                            options={STATUS_OPTIONS.filter((o) => o.value !== "")}
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="!w-36"
                          />
                        </td>
                      </tr>
                      {expandedId === order.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-surface-container/20">
                            <div className="text-sm text-text-secondary space-y-1">
                              <p className="font-medium text-primary mb-2">Items:</p>
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                  <span>{item.name}</span>
                                  {item.size && <span className="text-xs">Size: {item.size}</span>}
                                  {item.color && <span className="text-xs">Color: {item.color}</span>}
                                  <span className="text-xs">Qty: {item.quantity}</span>
                                  <span className="text-xs">{formatPrice(item.price)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-text-secondary">
                Showing {((meta.page - 1) * meta.pageSize) + 1}–
                {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
