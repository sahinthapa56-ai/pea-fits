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

interface NavLink {
  id: string;
  section: string;
  label: string;
  href: string;
  sortOrder: number;
}

const SECTIONS = ["main", "footer_shop", "footer_info", "footer_support"] as const;
const SECTION_LABELS: Record<string, string> = {
  main: "Main Navigation",
  footer_shop: "Footer — Shop",
  footer_info: "Footer — Info",
  footer_support: "Footer — Support",
};

const emptyForm: Omit<NavLink, "id"> = {
  section: "main",
  label: "",
  href: "",
  sortOrder: 0,
};

// ──────────────────────────────────────────────
// Navigation Page
// ──────────────────────────────────────────────

export default function NavigationPage() {
  const { addToast } = useToast();
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<NavLink, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/nav-links");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setLinks(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load nav links");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(link: NavLink) {
    setEditingId(link.id);
    setForm({ section: link.section, label: link.label, href: link.href, sortOrder: link.sortOrder });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.label || !form.href) {
      addToast("error", "Label and URL are required");
      return;
    }
    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/cms/nav-links?id=${editingId}` : "/api/admin/cms/nav-links";
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
      const res = await fetch(`/api/admin/cms/nav-links?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      addToast("success", "Link deleted");
      setDeleteConfirm(null);
      fetchLinks();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const grouped = SECTIONS.reduce(
    (acc, section) => {
      acc[section] = links
        .filter((l) => l.section === section)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return acc;
    },
    {} as Record<string, NavLink[]>,
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Navigation Links</h1>
        <Skeleton variant="table" lines={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Navigation Links</h1>
        <ErrorState message={error} onRetry={fetchLinks} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Navigation Links</h1>
        <Button onClick={openAdd}>Add Link</Button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="No nav links yet"
          description="Create your first navigation link to get started."
          actionLabel="Add Link"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const sectionLinks = grouped[section] ?? [];
            if (sectionLinks.length === 0) return null;
            return (
              <div key={section} className="bg-surface rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 font-serif">
                  {SECTION_LABELS[section]}
                </h2>
                <div className="space-y-2">
                  {sectionLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{link.label}</p>
                        <p className="text-xs text-text-secondary truncate">{link.href}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-text-secondary">Order: {link.sortOrder}</span>
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
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Link" : "Add Link"}>
        <div className="space-y-4">
          <div>
            <label className="text-label-caps text-secondary uppercase block mb-1.5">Section</label>
            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {SECTION_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Shop"
          />
          <Input
            label="URL"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            placeholder="/collections/all"
          />
          <Input
            label="Sort Order"
            type="number"
            value={String(form.sortOrder)}
            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
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
          Are you sure you want to delete this navigation link? This action cannot be undone.
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
