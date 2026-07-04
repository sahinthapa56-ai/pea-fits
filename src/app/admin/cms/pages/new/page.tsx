"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { generateSlug } from "@/lib/utils";

// ──────────────────────────────────────────────
// Create CMS Page
// ──────────────────────────────────────────────

export default function NewCmsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
  });

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  }

  async function handleSave() {
    if (!form.title || !form.slug) {
      addToast("error", "Title and slug are required");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create page");
      addToast("success", "Page created successfully");
      router.push("/admin/cms/pages");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary font-serif">Create New Page</h1>
          <p className="text-sm text-text-secondary mt-1">Add a new CMS content page</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Create Page
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="About Us"
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="about-us"
              hint="URL-friendly identifier. Auto-generated from title."
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Content</h2>
          <Input
            label="Content (JSON)"
            multiline
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder='[{"type":"paragraph","children":[{"text":"Your content here..."}]}]'
            hint="Enter TipTap-compatible JSON content"
          />
        </div>

        {/* SEO */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">SEO</h2>
          <div className="space-y-4">
            <Input
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              placeholder="About Us | PEA FITS"
            />
            <Input
              label="Meta Description"
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              placeholder="Learn about our story and mission"
              multiline
              rows={3}
            />
          </div>
        </div>

        {/* Publish */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4 font-serif">Publishing</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-primary">Publish immediately</span>
          </label>
        </div>
      </div>
    </div>
  );
}
