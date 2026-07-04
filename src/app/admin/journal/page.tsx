"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface JournalEntry {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string | null } | null;
}

// ──────────────────────────────────────────────
// Journal Page
// ──────────────────────────────────────────────

export default function JournalPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/journal");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch journal entries");
      setEntries(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load journal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (entry: JournalEntry) => {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/journal/${entry.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete entry");
      addToast("success", "Entry deleted");
      fetchEntries();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete entry");
    }
  };

  const togglePublished = async (entry: JournalEntry) => {
    try {
      const res = await fetch(`/api/admin/journal/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !entry.isPublished }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update entry");
      addToast("success", `Entry ${entry.isPublished ? "unpublished" : "published"}`);
      fetchEntries();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update entry");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Journal</h1>
        <Link href="/admin/journal/new">
          <Button variant="primary" size="sm">
            New Post
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton variant="table" lines={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEntries} />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No journal entries"
          description="Write your first journal post."
          actionLabel="New Post"
          onAction={() => router.push("/admin/journal/new")}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-primary">{entry.title}</p>
                      {entry.category && (
                        <p className="text-xs text-text-secondary">{entry.category}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={entry.isPublished ? "success" : "warning"} size="sm">
                        {entry.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => togglePublished(entry)}>
                          {entry.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                        <Link href={`/admin/journal/${entry.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="!text-error !border-error hover:!bg-error/5"
                          onClick={() => handleDelete(entry)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
