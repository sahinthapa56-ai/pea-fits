"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  detail: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ENTITY_TYPES = [
  "",
  "product",
  "order",
  "user",
  "category",
  "collection",
  "coupon",
  "page",
  "media",
  "settings",
  "navigation",
  "testimonial",
  "social",
  "email_template",
  "shipping",
  "tax",
] as const;

const ACTION_TYPES = [
  "",
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "publish",
  "unpublish",
  "activate",
  "deactivate",
] as const;

// ──────────────────────────────────────────────
// Audit Log Page
// ──────────────────────────────────────────────

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      if (entityFilter) params.set("entity", entityFilter);
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setEntries(json.data ?? []);
      if (json.pagination) setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, entityFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, entityFilter, actionFilter, fetchLogs]);

  function handleFilterChange() {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading && entries.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Audit Log</h1>
        <Skeleton variant="table" lines={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Audit Log</h1>
        <ErrorState message={error} onRetry={fetchLogs} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Audit Log</h1>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-label-caps text-secondary uppercase block mb-1.5">Entity</label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                handleFilterChange();
              }}
              className="block bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Entities</option>
              {ENTITY_TYPES.filter(Boolean).map((e) => (
                <option key={e} value={e}>
                  {e.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-caps text-secondary uppercase block mb-1.5">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                handleFilterChange();
              }}
              className="block bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.filter(Boolean).map((a) => (
                <option key={a} value={a}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {(entityFilter || actionFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEntityFilter("");
                setActionFilter("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Log Entries */}
      {entries.length === 0 ? (
        <EmptyState
          title="No log entries"
          description={
            entityFilter || actionFilter
              ? "No entries match your filters. Try clearing them."
              : "Audit log entries will appear here as actions are performed."
          }
        />
      ) : (
        <>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Timestamp</th>
                  <th className="text-left px-6 py-3 text-label-caps text-text-secondary">User</th>
                  <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Action</th>
                  <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Entity</th>
                  <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Detail</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-background/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary">{formatTimestamp(entry.timestamp)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-primary">{entry.user}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          entry.action === "delete"
                            ? "bg-red-50 text-red-700"
                            : entry.action === "create"
                              ? "bg-green-50 text-green-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary capitalize">
                        {entry.entity.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-text-secondary truncate">{entry.detail || "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-text-secondary">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? "bg-primary text-on-primary"
                          : "text-text-secondary hover:text-primary hover:bg-surface-container"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
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
