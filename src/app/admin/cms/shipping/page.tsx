"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ShippingConfig {
  freeThreshold: number;
  valleyCost: number;
  outsideValleyCost: number;
  provinceOverrides: string;
}

const defaultConfig: ShippingConfig = {
  freeThreshold: 3000,
  valleyCost: 200,
  outsideValleyCost: 500,
  provinceOverrides: JSON.stringify(
    {
      "Province No. 1": 500,
      "Madhesh Province": 500,
      "Bagmati Province (outside valley)": 500,
      "Gandaki Province": 500,
      "Lumbini Province": 500,
      "Karnali Province": 500,
      "Sudurpashchim Province": 500,
    },
    null,
    2,
  ),
};

// ──────────────────────────────────────────────
// Shipping Config Page
// ──────────────────────────────────────────────

export default function ShippingPage() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<ShippingConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/shipping");
      const json = await res.json();
      if (json.success && json.data) {
        setConfig({
          freeThreshold: json.data.freeThreshold ?? defaultConfig.freeThreshold,
          valleyCost: json.data.valleyCost ?? defaultConfig.valleyCost,
          outsideValleyCost: json.data.outsideValleyCost ?? defaultConfig.outsideValleyCost,
          provinceOverrides: json.data.provinceOverrides
            ? typeof json.data.provinceOverrides === "string"
              ? json.data.provinceOverrides
              : JSON.stringify(json.data.provinceOverrides, null, 2)
            : defaultConfig.provinceOverrides,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipping config");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      // Validate JSON
      JSON.parse(config.provinceOverrides);
      const res = await fetch("/api/admin/cms/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", "Shipping config saved");
    } catch (err) {
      if (err instanceof SyntaxError) {
        addToast("error", "Province overrides is not valid JSON");
      } else {
        addToast("error", err instanceof Error ? err.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Shipping Configuration</h1>
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <Skeleton variant="row" lines={3} />
          <Skeleton variant="row" lines={3} />
          <Skeleton variant="row" lines={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Shipping Configuration</h1>
        <ErrorState message={error} onRetry={fetchConfig} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Shipping Configuration</h1>
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
        {/* General Rates */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">General Rates</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Free Shipping Threshold (रु)"
                type="number"
                value={String(config.freeThreshold)}
                onChange={(e) => setConfig({ ...config, freeThreshold: parseFloat(e.target.value) || 0 })}
                placeholder="3000"
              />
              <Input
                label="Kathmandu Valley Cost (रु)"
                type="number"
                value={String(config.valleyCost)}
                onChange={(e) => setConfig({ ...config, valleyCost: parseFloat(e.target.value) || 0 })}
                placeholder="200"
              />
              <Input
                label="Outside Valley Cost (रु)"
                type="number"
                value={String(config.outsideValleyCost)}
                onChange={(e) => setConfig({ ...config, outsideValleyCost: parseFloat(e.target.value) || 0 })}
                placeholder="500"
              />
            </div>
          </div>
        </div>

        {/* Province Overrides */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Province Overrides</h2>
          <div>
            <label className="text-label-caps text-secondary uppercase block mb-1.5">
              Province Costs (JSON)
            </label>
            <textarea
              value={config.provinceOverrides}
              onChange={(e) => setConfig({ ...config, provinceOverrides: e.target.value })}
              rows={12}
              className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder='{"Province No. 1": 500}'
            />
            <p className="text-xs text-text-secondary mt-1.5">
              JSON object mapping province names to shipping costs. Overrides the default outside-valley cost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
