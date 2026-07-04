"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CmsPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

// ──────────────────────────────────────────────
// Edit CMS Page
// ──────────────────────────────────────────────

export default function EditCmsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [page, setPage] = useState<CmsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      fetchPage(resolvedId);
    });
  }, [params]);

  async function fetchPage(pageId: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/cms/pages/${pageId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch page");
      setPage(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!page || !page.title || !page.slug) {
      addToast("error", "Title and slug are required");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/cms/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      addToast("success", "Page updated successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/cms/pages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      addToast("success", "Page deleted");
      router.push("/admin/cms/pages");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Edit Page</h1>
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <Skeleton variant="row" lines={3} />
          <Skeleton variant="row" lines={8} />
          <Skeleton variant="row" lines={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Edit Page</h1>
        <ErrorState message={error} onRetry={() => id && fetchPage(id)} />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary font-serif">Edit Page</h1>
          <p className="text-sm text-text-secondary mt-1">{page.slug}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm(true)}
            className="text-error border-error hover:bg-error/5"
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              placeholder="About Us"
            />
            <Input
              label="Slug"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              placeholder="about-us"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Content</h2>
          <Input
            label="Content (JSON)"
            multiline
            rows={12}
            value={page.content}
            onChange={(e) => setPage({ ...page, content: e.target.value })}
            placeholder='[{"type":"paragraph","children":[{"text":"Your content here..."}]}]'
            hint="Enter TipTap-compatible JSON content"
          />
        </div>

        {/* SEO */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">SEO</h2>
          <div className="space-y-4">
            <Input
              label="Meta Title"
              value={page.metaTitle}
              onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
              placeholder="About Us | PEA FITS"
            />
            <Input
              label="Meta Description"
              value={page.metaDescription}
              onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
              placeholder="Learn about our story and mission"
              multiline
              rows={3}
            />
          </div>
        </div>

        {/* Publish */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Publishing</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={page.isPublished}
              onChange={(e) => setPage({ ...page, isPublished: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-primary">Published</span>
          </label>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Page" size="sm">
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this page? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            className="bg-error hover:bg-error/90"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
