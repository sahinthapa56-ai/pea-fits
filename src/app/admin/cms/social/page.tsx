"use client";

import React, { useEffect, useState } from "react";
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

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const PLATFORMS = ["instagram", "facebook", "tiktok", "twitter", "youtube"] as const;

const emptyForm: Omit<SocialLink, "id"> = {
  platform: "instagram",
  url: "",
};

// ──────────────────────────────────────────────
// Social Links Page
// ──────────────────────────────────────────────

export default function SocialPage() {
  const { addToast } = useToast();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SocialLink, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/social");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setLinks(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load social links");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(link: SocialLink) {
    setEditingId(link.id);
    setForm({ platform: link.platform, url: link.url });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.url) {
      addToast("error", "URL is required");
      return;
    }
    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/cms/social?id=${editingId}` : "/api/admin/cms/social";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", editingId ? "Link updated" : "Link created");
      setModalOpen(false);
      fetchLinks();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/cms/social?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      addToast("success", "Social link deleted");
      setDeleteConfirm(null);
      fetchLinks();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Social Links</h1>
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Social Links</h1>
        <ErrorState message={error} onRetry={fetchLinks} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Social Links</h1>
        <Button onClick={openAdd}>Add Link</Button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="No social links yet"
          description="Add links to your social media profiles."
          actionLabel="Add Link"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Platform</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">URL</th>
                <th className="text-right px-6 py-3 text-label-caps text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-primary capitalize">{link.platform}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary truncate block max-w-xs">{link.url}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(link)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(link.id)}
                        className="text-error hover:text-error"
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
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Link" : "Add Link"}>
        <div className="space-y-4">
          <div>
            <label className="text-label-caps text-secondary uppercase block mb-1.5">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://instagram.com/peafits"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Link" size="sm">
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this social link? This action cannot be undone.
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
