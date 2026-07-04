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

interface BrandBookSection {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Brand Book Page
// ──────────────────────────────────────────────

export default function BrandBookPage() {
  const { addToast } = useToast();

  const [sections, setSections] = useState<BrandBookSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<BrandBookSection | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/brand-book");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch brand book");
      setSections(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brand book");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

  const openAddModal = () => {
    setEditingSection(null);
    setFormTitle("");
    setFormSlug("");
    setFormContent("");
    setFormImageUrl("");
    setFormSortOrder("0");
    setModalOpen(true);
  };

  const openEditModal = (section: BrandBookSection) => {
    setEditingSection(section);
    setFormTitle(section.title);
    setFormSlug(section.slug);
    setFormContent(section.content ?? "");
    setFormImageUrl(section.imageUrl ?? "");
    setFormSortOrder(String(section.sortOrder));
    setModalOpen(true);
  };

  // Auto-generate slug
  useEffect(() => {
    if (formTitle.trim() && !editingSection) {
      setFormSlug(generateSlug(formTitle));
    }
  }, [formTitle, editingSection]);

  const handleSave = async () => {
    if (!formTitle.trim()) {
      addToast("error", "Title is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingSection
        ? `/api/admin/brand-book/${editingSection.id}`
        : "/api/admin/brand-book";
      const method = editingSection ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug || generateSlug(formTitle),
          content: formContent || null,
          imageUrl: formImageUrl || null,
          sortOrder: parseInt(formSortOrder, 10) || 0,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save section");

      addToast("success", editingSection ? "Section updated" : "Section created");
      setModalOpen(false);
      fetchSections();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section: BrandBookSection) => {
    if (!window.confirm(`Delete section "${section.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/brand-book/${section.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete section");
      addToast("success", "Section deleted");
      fetchSections();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete section");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Brand Book</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your brand guidelines and identity sections
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          Add Section
        </Button>
      </div>

      {loading ? (
        <Skeleton variant="table" lines={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSections} />
      ) : sections.length === 0 ? (
        <EmptyState
          title="No brand book sections"
          description="Create your first brand book section to document your brand identity."
          actionLabel="Add Section"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {section.imageUrl && (
                          <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0">
                            <img src={section.imageUrl} alt={section.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-primary">{section.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{section.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant={section.isActive ? "success" : "error"} size="sm">
                        {section.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(section)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="!text-error !border-error hover:!bg-error/5"
                          onClick={() => handleDelete(section)}
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
        title={editingSection ? "Edit Section" : "Add Section"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Section title"
          />
          <Input
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            hint="Auto-generated from title"
          />
          <Textarea
            label="Content"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            rows={6}
            placeholder="Write section content here..."
          />
          <Input
            label="Image URL"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
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
              {saving ? "Saving..." : editingSection ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
