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

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  active: boolean;
  sortOrder: number;
}

const emptyForm: Omit<Testimonial, "id"> = {
  quote: "",
  author: "",
  location: "",
  rating: 5,
  active: true,
  sortOrder: 0,
};

// ──────────────────────────────────────────────
// Testimonials Page
// ──────────────────────────────────────────────

export default function TestimonialsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/testimonials");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setItems(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditingId(item.id);
    setForm({
      quote: item.quote,
      author: item.author,
      location: item.location,
      rating: item.rating,
      active: item.active,
      sortOrder: item.sortOrder,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.quote || !form.author) {
      addToast("error", "Quote and author are required");
      return;
    }
    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/cms/testimonials?id=${editingId}` : "/api/admin/cms/testimonials";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", editingId ? "Testimonial updated" : "Testimonial created");
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/cms/testimonials?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      addToast("success", "Testimonial deleted");
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function toggleActive(item: Testimonial) {
    try {
      const res = await fetch(`/api/admin/cms/testimonials?id=${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, active: !item.active }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      addToast("success", `Testimonial ${item.active ? "deactivated" : "activated"}`);
      fetchItems();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Testimonials</h1>
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Testimonials</h1>
        <ErrorState message={error} onRetry={fetchItems} />
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Testimonials</h1>
        <Button onClick={openAdd}>Add Testimonial</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Add customer testimonials to build trust."
          actionLabel="Add Testimonial"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Quote</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Author</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Location</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Rating</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Active</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Order</th>
                <th className="text-right px-6 py-3 text-label-caps text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-primary truncate">&ldquo;{item.quote}&rdquo;</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary">{item.author}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{item.location || "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-primary">{item.rating}/5</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-text-secondary">{item.sortOrder}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(item.id)}
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Testimonial" : "Add Testimonial"} size="lg">
        <div className="space-y-4">
          <Input
            label="Quote"
            multiline
            rows={3}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            placeholder="The quality is exceptional..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Jane Doe"
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Kathmandu"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-caps text-secondary uppercase block mb-1.5">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} / 5</option>
                ))}
              </select>
            </div>
            <Input
              label="Sort Order"
              type="number"
              value={String(form.sortOrder)}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-primary">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Testimonial" size="sm">
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this testimonial? This action cannot be undone.
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
