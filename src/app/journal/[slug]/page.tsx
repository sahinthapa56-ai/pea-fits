"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import type { JournalArticle } from "@/types/index";

// ──────────────────────────────────────────────
// Share Button
// ──────────────────────────────────────────────

function ShareButton({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
      aria-label={`Share on ${label}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {label === "Twitter" && (
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        )}
        {label === "Facebook" && (
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        )}
        {label === "Copy Link" && (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        )}
      </svg>
      {label}
    </a>
  );
}

// ──────────────────────────────────────────────
// Journal Post Page
// ──────────────────────────────────────────────

export default function JournalPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<JournalArticle | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/journal/${slug}`);
        const result = await res.json();
        if (result.success && result.data) {
          setArticle(result.data);
          // Also fetch related posts
          const relatedRes = await fetch(`/api/journal?limit=3`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            setRelatedPosts(
              (relatedData.data ?? []).filter((a: any) => a.slug !== slug).slice(0, 3),
            );
          }
        } else {
          setError("Article not found.");
        }
      } catch {
        setError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  // Handle share copy
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-5 lg:px-16 max-w-3xl py-20">
          <Skeleton variant="row" lines={1} className="max-w-xs mb-8" />
          <Skeleton variant="row" lines={2} className="mb-4" />
          <div className="aspect-[16/9] rounded-xl bg-neutral-100 mb-8" />
          <Skeleton variant="row" lines={8} />
        </div>
      </div>
    );
  }

  // Error
  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Article Not Found</h1>
        <p className="text-sm text-text-secondary mb-6">{error ?? "This article doesn't exist."}</p>
        <Link
          href="/journal"
          className="text-sm text-primary underline underline-offset-2 hover:text-text-secondary transition-colors"
        >
          Back to The Journal
        </Link>
      </div>
    );
  }

  const featuredImage = (article as any).featuredImage;
  const category = (article as any).category;
  const author = (article as any).author;
  const content = (article as any).content || article.excerpt || "";

  return (
    <article className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <header className="bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-3xl py-12 lg:py-16">
          {/* Back link */}
          <Link
            href="/journal"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
            </svg>
            Back to The Journal
          </Link>

          {/* Category */}
          {category && (
            <span className="text-label-caps text-text-secondary mb-4 block">
              {category}
            </span>
          )}

          {/* Title */}
          <h1 className="display-lg text-primary mb-4">{article.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            {author && (
              <span>By {typeof author === "string" ? author : author.name ?? "PEA_FITS"}</span>
            )}
            <span>
              {new Date(article.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* ── Featured Image ── */}
      {featuredImage && (
        <div className="w-full bg-neutral-100">
          <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
            <div className="aspect-[21/9] max-h-[70vh] overflow-hidden">
              <img
                src={featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="mx-auto px-5 lg:px-16 max-w-3xl py-12 lg:py-16">
        <div
          className="rich-text text-secondary"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* ── Share Section ── */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Share this article
          </h3>
          <div className="flex flex-wrap gap-3">
            <ShareButton
              label="Twitter"
              url={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
            />
            <ShareButton
              label="Facebook"
              url={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
              aria-label="Copy link"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* ── Related Posts ── */}
      {relatedPosts.length > 0 && (
        <section className="py-16 lg:py-20 bg-white border-t border-border">
          <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
            <h2 className="headline-lg text-primary mb-10">More from The Journal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {relatedPosts.map((rp) => {
                const rpImage = (rp as any).featuredImage;
                return (
                  <Link
                    key={rp.id}
                    href={`/journal/${rp.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 mb-4 image-zoom-container">
                      {rpImage ? (
                        <img
                          src={rpImage}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-primary group-hover:underline underline-offset-2">
                      {rp.title}
                    </h3>
                    {rp.excerpt && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{rp.excerpt}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
