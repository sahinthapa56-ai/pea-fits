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

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  maxUses: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

const emptyForm: Omit<Coupon, "id" | "usedCount" | "createdAt"> = {
  code: "",
  type: "percentage",
  value: 0,
  minPurchase: 0,
  maxDiscount: 0,
  maxUses: 0,
  startsAt: "",
  expiresAt: "",
  active: true,
};

// ──────────────────────────────────────────────
// Coupons Page
// ──────────────────────────────────────────────

export default function CouponsPage() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Coupon, "id" | "usedCount" | "createdAt">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/coupons");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setCoupons(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minPurchase: c.minPurchase,
      maxDiscount: c.maxDiscount,
      maxUses: c.maxUses,
      startsAt: c.startsAt?.split("T")[0] ?? "",
      expiresAt: c.expiresAt?.split("T")[0] ?? "",
      active: c.active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.code || form.value <= 0) {
      addToast("error", "Code and a positive value are required");
      return;
    }
    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/cms/coupons?id=${editingId}` : "/api/admin/cms/coupons";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", editingId ? "Coupon updated" : "Coupon created");
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/cms/coupons?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete");
      addToast("success", "Coupon deleted");
      setDeleteConfirm(null);
      fetchCoupons();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function toggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/cms/coupons?id=${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...c, active: !c.active }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      addToast("success", `Coupon ${c.active ? "deactivated" : "activated"}`);
      fetchCoupons();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Coupons</h1>
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Coupons</h1>
        <ErrorState message={error} onRetry={fetchCoupons} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Coupons</h1>
        <Button onClick={openAdd}>Create Coupon</Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          description="Create discount coupons to promote your store."
          actionLabel="Create Coupon"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Code</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Type</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Value</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Uses</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Expiry</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Status</th>
                <th className="text-right px-6 py-3 text-label-caps text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-primary">{c.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm capitalize text-primary">{c.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary">
                      {c.type === "percentage" ? `${c.value}%` : `रु ${c.value.toLocaleString("en-IN")}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-text-secondary">
                      {c.usedCount ?? 0} / {c.maxUses || "∞"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(c.id)}
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Coupon" : "Create Coupon"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER20"
            />
            <div>
              <label className="text-label-caps text-secondary uppercase block mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Value"
              type="number"
              value={String(form.value)}
              onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
              placeholder={form.type === "percentage" ? "20" : "500"}
            />
            <Input
              label="Min Purchase (रु)"
              type="number"
              value={String(form.minPurchase)}
              onChange={(e) => setForm({ ...form, minPurchase: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Max Discount (रु, 0 = unlimited)"
              type="number"
              value={String(form.maxDiscount)}
              onChange={(e) => setForm({ ...form, maxDiscount: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
            <Input
              label="Max Uses (0 = unlimited)"
              type="number"
              value={String(form.maxUses)}
              onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
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
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Coupon" size="sm">
        <p className="text-sm text-text-secondary mb-6">
          Are you sure you want to delete this coupon? This action cannot be undone.
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
