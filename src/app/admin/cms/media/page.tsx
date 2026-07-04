"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Media Library Page
// ──────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

export default function MediaPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/cms/media?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setItems(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMedia();
  }, [page, fetchMedia]);

  async function handleUpload() {
    if (!uploadUrl) {
      addToast("error", "Please provide a URL");
      return;
    }
    try {
      setUploading(true);
      const res = await fetch("/api/admin/cms/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadUrl }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to upload");
      addToast("success", "Media uploaded");
      setUploadOpen(false);
      setUploadUrl("");
      fetchMedia();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/cms/media?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      addToast("success", "Media deleted");
      setDeleteConfirm(null);
      fetchMedia();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading && items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Media Library</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4">
              <Skeleton variant="row" lines={1} />
              <div className="mt-2">
                <Skeleton variant="row" lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Media Library</h1>
        <ErrorState message={error} onRetry={fetchMedia} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Media Library</h1>
        <Button onClick={() => setUploadOpen(true)}>Upload Media</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Upload images to use across your site."
          actionLabel="Upload Media"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-border overflow-hidden group"
              >
                <div className="aspect-square bg-background relative overflow-hidden">
                  {item.mimeType?.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23848484' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z'/%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-primary truncate">{item.fileName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{formatSize(item.size)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(item.id)}
                    className="mt-2 text-error hover:text-error w-full"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={items.length < ITEMS_PER_PAGE}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Media" size="sm">
        <div className="space-y-4">
          <Input
            label="Image URL"
            value={uploadUrl}
            onChange={(e) => setUploadUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-text-secondary">
            Enter a publicly accessible URL to import the image into your media library.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Media" size="sm">
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this media item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="bg-error hover:bg-error/90"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
