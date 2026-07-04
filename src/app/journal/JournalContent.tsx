"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { JournalArticle } from "@/types/index";

// ──────────────────────────────────────────────
// Journal Content
// ──────────────────────────────────────────────

export function JournalContent() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/journal?page=${page}&pageSize=12`);
      if (!res.ok) throw new Error("Failed to load journal");
      const result = await res.json();
      if (result.success) {
        setArticles(result.data ?? []);
        setTotalPages(result.meta?.totalPages ?? 1);
      } else {
        throw new Error(result.error ?? "Failed to load journal");
      }
    } catch {
      setError("Failed to load journal articles. Please try again.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="py-16 lg:py-20 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <h1 className="display-lg text-primary mb-3">The Journal</h1>
          <p className="body-md text-text-secondary max-w-lg">
            Stories on fashion, design, and the art of the silhouette.
          </p>
        </div>
      </section>

      {/* ── Article Grid ── */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary mb-4">{error}</p>
              <button
                type="button"
                onClick={() => { setError(null); setLoading(true); fetchArticles(); }}
                className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-[16/10] rounded-xl bg-neutral-100 animate-pulse" />
                  <Skeleton variant="row" lines={3} />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">No journal articles yet. Check back soon.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {articles.map((article) => {
                  const featuredImage = (article as any).featuredImage;
                  const category = (article as any).category;
                  const author = (article as any).author;

                  return (
                    <Link
                      key={article.id}
                      href={`/journal/${article.slug}`}
                      className="group flex flex-col"
                    >
                      {/* Featured Image */}
                      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 mb-4 image-zoom-container">
                        {featuredImage ? (
                          <img
                            src={featuredImage}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        {category && (
                          <span className="text-label-caps text-text-secondary mb-2">
                            {category}
                          </span>
                        )}
                        <h2 className="text-lg font-medium text-primary group-hover:underline underline-offset-2 transition-colors mb-2">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="text-sm text-secondary leading-relaxed line-clamp-2 flex-1">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-4 text-xs text-text-secondary">
                          <span>
                            {new Date(article.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {author && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{typeof author === "string" ? author : author.name ?? "PEA_FITS"}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Journal pagination">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-2 text-sm border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors"
                    aria-label="Previous page"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let p: number;
                    if (totalPages <= 5) {
                      p = i + 1;
                    } else if (page <= 3) {
                      p = i + 1;
                    } else if (page >= totalPages - 2) {
                      p = totalPages - 4 + i;
                    } else {
                      p = page - 2 + i;
                    }

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-10 h-10 text-sm rounded-lg transition-colors",
                          page === p
                            ? "bg-primary text-on-primary"
                            : "border border-border text-text-secondary hover:border-primary hover:text-primary",
                        )}
                        aria-current={page === p ? "page" : undefined}
                        aria-label={`Page ${p}`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-2 text-sm border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors"
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
