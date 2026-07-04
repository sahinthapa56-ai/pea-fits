"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: RecentOrder[];
  salesChart: SalesChartEntry[];
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null };
  items: { name: string }[];
}

interface SalesChartEntry {
  date: string;
  revenue: number;
  orders: number;
}

// ──────────────────────────────────────────────
// Dashboard Page
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch stats");
      setStats(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-6 border border-border">
              <Skeleton variant="row" lines={2} />
            </div>
          ))}
        </div>
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8">Dashboard</h1>
        <ErrorState message={error} onRetry={fetchStats} />
      </div>
    );
  }

  if (!stats) return null;

  const chartMax = Math.max(...stats.salesChart.map((d) => d.revenue), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/products/new">
            <Button variant="outline" size="sm">
              Add Product
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="primary" size="sm">
              View Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          subtitle="Completed orders"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subtitle="All time"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          subtitle="Active products"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          subtitle="Registered users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            30-Day Sales Trend
          </h2>
          {stats.salesChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-text-secondary text-sm">
              No sales data available yet
            </div>
          ) : (
            <div className="h-48 relative">
              <svg
                viewBox={`0 0 ${stats.salesChart.length * 40} 200`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={200 - ratio * 180}
                    x2={stats.salesChart.length * 40}
                    y2={200 - ratio * 180}
                    stroke="#e8e8e8"
                    strokeWidth="1"
                  />
                ))}
                {stats.salesChart.map((day, i) => {
                  const barHeight = (day.revenue / chartMax) * 160;
                  return (
                    <rect
                      key={day.date}
                      x={i * 40 + 8}
                      y={200 - barHeight - 10}
                      width="24"
                      height={Math.max(barHeight, 2)}
                      rx="2"
                      fill="currentColor"
                      className="text-primary/40 hover:text-primary/70 transition-colors"
                    />
                  );
                })}
              </svg>
              <div className="flex justify-between mt-2">
                {stats.salesChart
                  .filter((_, i) => i % 5 === 0 || i === stats.salesChart.length - 1)
                  .map((day) => (
                    <span key={day.date} className="text-[10px] text-text-secondary">
                      {new Date(day.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-text-secondary hover:text-primary transition-colors"
            >
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Orders will appear here once customers start purchasing."
            />
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-3 rounded-lg hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary">
                      {order.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">
                    {order.user.name ?? order.user.email ?? "Unknown"}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(order.total)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Stat Card Component
// ──────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <p className="text-sm text-text-secondary mb-1">{title}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {subtitle && (
        <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
  );
}
