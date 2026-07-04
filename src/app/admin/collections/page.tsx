"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { items: number };
}

// ──────────────────────────────────────────────
// Collections Page
// ──────────────────────────────────────────────

export default function CollectionsPage() {
  const { addToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/collections");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch collections");
      setCollections(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const openAddModal = () => {
    setEditingCollection(null);
    setFormName("");
    setFormDescription("");
    setFormImage("");
    setFormSortOrder("0");
    setModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormDescription(col.description ?? "");
    setFormImage(col.image ?? "");
    setFormSortOrder(String(col.sortOrder));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      addToast("error", "Collection name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingCollection
        ? `/api/admin/collections/${editingCollection.id}`
        : "/api/admin/collections";
      const method = editingCollection ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription || null,
          image: formImage || null,
          sortOrder: parseInt(formSortOrder, 10) || 0,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save collection");

      addToast("success", editingCollection ? "Collection updated" : "Collection created");
      setModalOpen(false);
      fetchCollections();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (col: Collection) => {
    if (!window.confirm(`Delete collection "${col.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/collections/${col.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete collection");
      addToast("success", "Collection deleted");
      fetchCollections();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete collection");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Collections</h1>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          Add Collection
        </Button>
      </div>

      {loading ? (
        <Skeleton variant="table" lines={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCollections} />
      ) : collections.length === 0 ? (
        <EmptyState
          title="No collections"
          description="Create your first collection to group products."
          actionLabel="Add Collection"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Products</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {col.image && (
                          <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0">
                            <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-primary">{col.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{col.slug}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{col._count.items}</td>
                    <td className="px-4 py-3">
                      <Badge variant={col.isActive ? "success" : "error"} size="sm">
                        {col.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(col)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="!text-error !border-error hover:!bg-error/5"
                          onClick={() => handleDelete(col)}
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

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCollection ? "Edit Collection" : "Add Collection"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Collection name"
          />
          <Textarea
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
          />
          <Input
            label="Image URL"
            value={formImage}
            onChange={(e) => setFormImage(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Sort Order"
            type="number"
            min="0"
            value={formSortOrder}
            onChange={(e) => setFormSortOrder(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {saving ? "Saving..." : editingCollection ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
