"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { generateSlug } from "@/lib/utils";

// ──────────────────────────────────────────────
// Edit Journal Page
// ──────────────────────────────────────────────

export default function EditJournalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (title.trim()) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const fetchEntry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/journal/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch journal entry");

      const entry = json.data;
      setTitle(entry.title);
      setSlug(entry.slug);
      setExcerpt(entry.excerpt ?? "");
      setContent(entry.content ?? "");
      setCoverImage(entry.coverImage ?? "");
      setCategory(entry.category ?? "");
      setTags(Array.isArray(entry.tags) ? entry.tags.join(", ") : "");
      setIsPublished(entry.isPublished);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load journal entry");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [id, fetchEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast("error", "Title is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        slug: slug || generateSlug(title),
        excerpt: excerpt || null,
        content: content || null,
        coverImage: coverImage || null,
        category: category || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublished,
      };

      const res = await fetch(`/api/admin/journal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? "Failed to update journal entry");
      }

      addToast("success", "Journal entry updated successfully");
      router.push("/admin/journal");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update journal entry");
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
        <ErrorState message={error} onRetry={fetchEntry} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Journal", href: "/admin/journal" },
          { label: "Edit Post" },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl font-bold text-primary mb-8">Edit Journal Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            hint="Auto-generated from title"
          />
          <Textarea
            label="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Brief summary (optional)"
          />
          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Write your post content here..."
          />
          <Input
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Fashion, Style"
            />
            <Input
              label="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. summer, trends, 2024"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-primary">Published</span>
          </label>
        </section>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? "Saving..." : "Update Post"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/journal")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
