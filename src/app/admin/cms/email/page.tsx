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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  active: boolean;
}

// ──────────────────────────────────────────────
// Email Templates Page
// ──────────────────────────────────────────────

export default function EmailTemplatesPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ subject: string; htmlBody: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/cms/email-templates");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setTemplates(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email templates");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(template: EmailTemplate) {
    setEditingId(template.id);
    setEditForm({ subject: template.subject, htmlBody: template.htmlBody });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function handleSave(template: EmailTemplate) {
    if (!editForm) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/cms/email-templates?id=${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...template, ...editForm }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      addToast("success", "Template saved");
      setEditingId(null);
      setEditForm(null);
      fetchTemplates();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(template: EmailTemplate) {
    try {
      const res = await fetch(`/api/admin/cms/email-templates?id=${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...template, active: !template.active }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      addToast("success", `Template ${template.active ? "deactivated" : "activated"}`);
      fetchTemplates();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Email Templates</h1>
        <Skeleton variant="table" lines={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8 font-serif">Email Templates</h1>
        <ErrorState message={error} onRetry={fetchTemplates} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary font-serif">Email Templates</h1>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          title="No email templates"
          description="Email templates will appear once configured."
        />
      ) : (
        <div className="space-y-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-surface rounded-xl border border-border overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/30">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-primary">{template.name}</h3>
                  <span className="text-xs text-text-secondary">Subject: {template.subject}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(template)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-text-secondary"
                    }`}
                  >
                    {template.active ? "Active" : "Inactive"}
                  </button>
                  {editingId === template.id ? (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSave(template)} loading={saving}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => startEdit(template)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Edit area */}
              {editingId === template.id && editForm && (
                <div className="p-6 space-y-4">
                  <Input
                    label="Subject"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    placeholder="Order Confirmation"
                  />
                  <div>
                    <label className="text-label-caps text-secondary uppercase block mb-1.5">
                      HTML Body
                    </label>
                    <textarea
                      value={editForm.htmlBody}
                      onChange={(e) => setEditForm({ ...editForm, htmlBody: e.target.value })}
                      rows={15}
                      className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="<html>...</html>"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
