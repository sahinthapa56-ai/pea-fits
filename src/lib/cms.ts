// ──────────────────────────────────────────────
// CMS Data Fetching Wrapper
// Fetches CMS data with in-memory caching
// ──────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 300_000; // 5 minutes

/**
 * Fetch CMS data with caching
 */
export async function getCmsData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = CACHE_TTL
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  const data = await fetcher();
  cache.set(key, { data, expiry: Date.now() + ttl });
  return data;
}

/**
 * Clear the CMS cache (call when admin saves changes)
 */
export function clearCmsCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// ──────────────────────────────────────────────
// CMS API Fetchers
// ──────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Get active nav links grouped by section
 */
export async function getNavLinks() {
  return getCmsData("nav-links", () => fetchApi<any[]>("/api/nav-links"));
}

/**
 * Get active testimonials
 */
export async function getTestimonials() {
  return getCmsData("testimonials", () => fetchApi<any[]>("/api/testimonials"));
}

/**
 * Get a published CMS page by slug
 */
export async function getCmsPage(slug: string) {
  return getCmsData(`page:${slug}`, () => fetchApi<any>(`/api/cms-pages/${slug}`));
}

/**
 * Get homepage config
 */
export async function getHomepageConfig() {
  return getCmsData("homepage", async () => {
    // Try fetching from the public homepage endpoint,
    // else fall back to null
    const data = await fetchApi<any>("/api/cms/homepage-config");
    // If the public endpoint doesn't exist yet, use the admin endpoint
    // (this consolidates after DB seeding)
    return data;
  });
}

/**
 * Get site settings
 */
export async function getSiteSettings() {
  return getCmsData("site-settings", async () => {
    const { prisma } = await import("@/lib/prisma");
    const settings = await prisma.siteSettings.findFirst();
    return settings;
  });
}
