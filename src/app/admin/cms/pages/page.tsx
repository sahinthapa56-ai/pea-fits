"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// CMS Pages List Page
// ──────────────────────────────────────────────

export default function CmsPagesListPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/pages");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setPages(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">CMS Pages</h1>
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">CMS Pages</h1>
        <ErrorState message={error} onRetry={fetchPages} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">CMS Pages</h1>
        <Link href="/admin/cms/pages/new">
          <Button>Create New Page</Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Create your first CMS page to get started."
          actionLabel="Create Page"
          href="/admin/cms/pages/new"
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Title</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Slug</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Published</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Last Updated</th>
                <th className="text-right px-6 py-3 text-label-caps text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-primary">{page.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">/{page.slug}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.isPublished
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {new Date(page.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/cms/pages/${page.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
