"use client";

import { useState, useCallback, useEffect } from "react";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const STORAGE_KEY = "pea-fits-recently-viewed";
const MAX_ITEMS = 20;

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch {
      // Ignore parse / storage errors
    }
  }, []);

  /** Add a product slug to the top of the recently viewed list. */
  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or unavailable — silently ignore
      }
      return updated;
    });
  }, []);

  /** Read the current list from localStorage (useful outside React). */
  const getRecentlyViewed = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  /** Clear all recently viewed items. */
  const clearRecentlyViewed = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setRecentlyViewed([]);
  }, []);

  return {
    /** Reactive list of recently viewed product slugs (most recent first). */
    recentlyViewed,
    /** Add a product slug to the top of the list (max 20, no duplicates). */
    addRecentlyViewed,
    /** Read the current list from localStorage directly. */
    getRecentlyViewed,
    /** Clear the entire recently viewed list. */
    clearRecentlyViewed,
  } as const;
}
