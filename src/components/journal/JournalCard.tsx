import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface JournalCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    category?: string | null;
    publishedAt?: Date | string | null;
    author?: { name: string } | null;
  };
  className?: string;
}

// ──────────────────────────────────────────────
// Date formatter
// ──────────────────────────────────────────────

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function JournalCard({ post, className }: JournalCardProps) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className={cn(
        "group flex flex-col gap-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100 rounded-lg overflow-hidden">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        {post.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" size="sm">
              {post.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        {/* Date */}
        {post.publishedAt && (
          <time
            dateTime={new Date(post.publishedAt).toISOString()}
            className="text-label-caps text-text-secondary"
          >
            {formatDate(post.publishedAt)}
          </time>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-primary group-hover:underline underline-offset-2 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Author */}
        {post.author && (
          <p className="text-xs text-text-secondary mt-1">
            By {post.author.name}
          </p>
        )}
      </div>
    </Link>
  );
}
