"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface TaxRate {
  id?: string;
  name: string;
  rate: number;
  isActive: boolean;
}

const defaultForm: TaxRate = {
  name: "",
  rate: 0,
  isActive: true,
};

// ──────────────────────────────────────────────
// Tax Config Page
// ──────────────────────────────────────────────

export default function TaxPage() {
  const { addToast } = useToast();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaxRate>(defaultForm);

  useEffect(() => {
    fetchTaxRates();
  }, []);

  async function fetchTaxRates() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/tax");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      const data = json.data ?? [];
      setTaxRates(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tax config");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(rate: TaxRate) {
    setForm({ ...rate });
  }

  async function handleSave() {
    if (!form.name || form.rate <= 0) {
      addToast("error", "Name and a positive rate are required");
      return;
    }
    try {
      setSaving(true);
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/admin/cms/tax?id=${form.id}` : "/api/admin/cms/tax";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", form.id ? "Tax rate updated" : "Tax rate created");
      setForm(defaultForm);
      fetchTaxRates();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rate: TaxRate) {
    if (!rate.id) return;
    try {
      const res = await fetch(`/api/admin/cms/tax?id=${rate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rate, isActive: !rate.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      addToast("success", `Tax rate ${rate.isActive ? "deactivated" : "activated"}`);
      fetchTaxRates();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Tax Configuration</h1>
        <Skeleton variant="table" lines={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Tax Configuration</h1>
        <ErrorState message={error} onRetry={fetchTaxRates} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Tax Configuration</h1>
      </div>

      {/* Current Tax Rates */}
      {taxRates.length === 0 ? (
        <EmptyState
          title="No tax rates configured"
          description="Add a tax rate below to get started."
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Name</th>
                <th className="text-left px-6 py-3 text-label-caps text-text-secondary">Rate</th>
                <th className="text-center px-6 py-3 text-label-caps text-text-secondary">Status</th>
                <th className="text-right px-6 py-3 text-label-caps text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map((rate) => (
                <tr key={rate.id ?? rate.name} className="border-b border-border last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-primary">{rate.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary">{rate.rate}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(rate)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rate.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {rate.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(rate)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-primary mb-6 font-serif">
          {form.id ? "Edit Tax Rate" : "Add Tax Rate"}
        </h2>
        <div className="space-y-4 max-w-md">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VAT"
          />
          <Input
            label="Rate (%)"
            type="number"
            step="0.01"
            value={String(form.rate)}
            onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
            placeholder="13"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-primary">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            {form.id && (
              <Button variant="outline" onClick={() => setForm(defaultForm)}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} loading={saving}>
              {form.id ? "Update Rate" : "Add Rate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
