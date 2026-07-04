"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  parent: { id: string; name: string; slug: string } | null;
  _count: { products: number; children: number };
}

// ──────────────────────────────────────────────
// Categories Page
// ──────────────────────────────────────────────

export default function CategoriesPage() {
  const { addToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch categories");
      setCategories(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormSortOrder("0");
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description ?? "");
    setFormSortOrder(String(cat.sortOrder));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      addToast("error", "Category name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription || null,
          sortOrder: parseInt(formSortOrder, 10) || 0,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save category");

      addToast("success", editingCategory ? "Category updated" : "Category created");
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete category");
      addToast("success", "Category deleted");
      fetchCategories();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update category");
      addToast("success", `Category ${cat.isActive ? "deactivated" : "activated"}`);
      fetchCategories();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update category");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Categories</h1>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <Skeleton variant="table" lines={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Create your first category to organize products."
          actionLabel="Add Category"
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
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-primary">{cat.name}</p>
                      {cat.parent && (
                        <p className="text-xs text-text-secondary">Parent: {cat.parent.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{cat._count.products}</td>
                    <td className="px-4 py-3">
                      <Badge variant={cat.isActive ? "success" : "error"} size="sm">
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(cat)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(cat)}
                        >
                          {cat.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="!text-error !border-error hover:!bg-error/5"
                          onClick={() => handleDelete(cat)}
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
        title={editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Category name"
          />
          <Input
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Brief description (optional)"
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
              {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
