"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import type { Review } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ReviewListProps {
  productId: string;
  reviews: Review[];
  className?: string;
}

// ──────────────────────────────────────────────
// Date formatter
// ──────────────────────────────────────────────

function formatReviewDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ──────────────────────────────────────────────
// Review Card
// ──────────────────────────────────────────────

function ReviewCard({ review }: { review: Review & { user?: { id: string; name: string | null; image: string | null } | null } }) {
  return (
    <div className="py-5 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 uppercase">
            {(review.user?.name ?? "A")[0]}
          </div>
          <span className="text-sm font-medium text-primary">
            {review.user?.name ?? "Anonymous"}
          </span>
        </div>
        <span className="text-xs text-text-secondary">
          {formatReviewDate(review.createdAt)}
        </span>
      </div>
      <StarRating rating={review.rating} size="sm" className="mb-2" />
      {review.comment && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Review Form
// ──────────────────────────────────────────────

function ReviewForm({
  productId,
  onSuccess,
  onCancel,
}: {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      addToast("error", "Please select a rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("success", "Review submitted successfully!");
        onSuccess();
        setRating(5);
        setComment("");
      } else {
        addToast("error", data.error ?? "Failed to submit review.");
      }
    } catch {
      addToast("error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="py-5 border-b border-border space-y-4">
      <h3 className="text-sm font-medium text-primary">Write a Review</h3>

      <div>
        <label className="text-label-caps text-secondary uppercase mb-2 block">
          Your Rating
        </label>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size="lg"
        />
      </div>

      <Textarea
        label="Your Review"
        placeholder="Share your thoughts about this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" loading={submitting} size="sm">
          Submit Review
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ──────────────────────────────────────────────
// ReviewList Component
// ──────────────────────────────────────────────

export function ReviewList({
  productId,
  reviews,
  className,
}: ReviewListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">
          Reviews{reviews.length > 0 ? ` (${reviews.length})` : ""}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Review form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-text-secondary text-sm">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  );
}
