"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface BackInStockFormProps {
  productSlug: string;
  variantId?: string | null;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function BackInStockForm({
  productSlug,
  variantId,
}: BackInStockFormProps) {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("Email is required");
        return;
      }

      // Basic email validation before sending
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `/api/products/${productSlug}/back-in-stock`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              ...(variantId ? { variantId } : {}),
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }

        addToast("success", "We'll email you when this item is back in stock");
        setShowForm(false);
        setEmail("");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, productSlug, variantId, addToast],
  );

  return (
    <div className="mt-4">
      {!showForm ? (
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => setShowForm(true)}
        >
          Email me when back in stock
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            error={error}
            disabled={loading}
            aria-label="Email address"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              loading={loading}
              disabled={loading}
            >
              Notify Me
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError("");
                setEmail("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
