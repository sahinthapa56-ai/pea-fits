"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface SiteSettings {
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
}

// ──────────────────────────────────────────────
// Settings Page
// ──────────────────────────────────────────────

export default function SettingsPage() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "",
    tagline: "",
    email: "",
    phone: "",
    address: "",
    socialInstagram: "",
    socialFacebook: "",
    socialTiktok: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch settings");
      setSettings(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save settings");
      addToast("success", "Settings saved successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={fetchSettings} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-primary mb-8">Site Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* General */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">General</h2>
          <Input
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => handleChange("siteName", e.target.value)}
          />
          <Input
            label="Tagline"
            value={settings.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
            placeholder="Short brand description"
          />
        </section>

        {/* Contact */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Contact Information</h2>
          <Input
            label="Email"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <Input
            label="Phone"
            value={settings.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <Textarea
            label="Address"
            value={settings.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={3}
          />
        </section>

        {/* Social Links */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Social Media Links</h2>
          <Input
            label="Instagram URL"
            value={settings.socialInstagram}
            onChange={(e) => handleChange("socialInstagram", e.target.value)}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="Facebook URL"
            value={settings.socialFacebook}
            onChange={(e) => handleChange("socialFacebook", e.target.value)}
            placeholder="https://facebook.com/..."
          />
          <Input
            label="TikTok URL"
            value={settings.socialTiktok}
            onChange={(e) => handleChange("socialTiktok", e.target.value)}
            placeholder="https://tiktok.com/@..."
          />
        </section>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
