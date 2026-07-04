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

interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImage: string;
  announcement: string;
  announcementEnabled: boolean;
  featuredSectionTitle: string;
  featuredCollectionId: string;
}

const defaultConfig: HomepageConfig = {
  heroTitle: "",
  heroSubtitle: "",
  heroCtaText: "",
  heroCtaLink: "",
  heroImage: "",
  announcement: "",
  announcementEnabled: false,
  featuredSectionTitle: "",
  featuredCollectionId: "",
};

// ──────────────────────────────────────────────
// Homepage Editor Page
// ──────────────────────────────────────────────

export default function HomepagePage() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<HomepageConfig>(defaultConfig);
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
      const res = await fetch("/api/admin/cms/homepage");
      const json = await res.json();
      if (json.success && json.data) {
        setConfig({ ...defaultConfig, ...json.data });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load homepage config");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", "Homepage config saved successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Homepage Config</h1>
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <Skeleton variant="row" lines={3} />
          <Skeleton variant="row" lines={3} />
          <Skeleton variant="row" lines={2} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Homepage Config</h1>
        <ErrorState message={error} onRetry={fetchConfig} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Homepage Config</h1>
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      {/* Hero Section */}
      <section className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-6 font-serif">Hero Section</h2>
        <div className="space-y-4">
          <Input
            label="Hero Title"
            value={config.heroTitle}
            onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
            placeholder="Welcome to PEA FITS"
          />
          <Input
            label="Hero Subtitle"
            value={config.heroSubtitle}
            onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
            placeholder="Premium fashion for the modern wardrobe"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CTA Button Text"
              value={config.heroCtaText}
              onChange={(e) => setConfig({ ...config, heroCtaText: e.target.value })}
              placeholder="Shop Now"
            />
            <Input
              label="CTA Button Link"
              value={config.heroCtaLink}
              onChange={(e) => setConfig({ ...config, heroCtaLink: e.target.value })}
              placeholder="/collections/all"
            />
          </div>
          <Input
            label="Hero Image URL"
            value={config.heroImage}
            onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      </section>

      {/* Announcement Bar */}
      <section className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-6 font-serif">Announcement Bar</h2>
        <div className="space-y-4">
          <Input
            label="Announcement Text"
            value={config.announcement}
            onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
            placeholder="Free shipping on orders over रु 3,000"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.announcementEnabled}
              onChange={(e) => setConfig({ ...config, announcementEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-primary">Enable Announcement Bar</span>
          </label>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-primary mb-6 font-serif">Featured Section</h2>
        <div className="space-y-4">
          <Input
            label="Featured Section Title"
            value={config.featuredSectionTitle}
            onChange={(e) => setConfig({ ...config, featuredSectionTitle: e.target.value })}
            placeholder="Featured Collection"
          />
          <Input
            label="Featured Collection ID"
            value={config.featuredCollectionId}
            onChange={(e) => setConfig({ ...config, featuredCollectionId: e.target.value })}
            placeholder="clx..."
          />
        </div>
      </section>
    </div>
  );
}
