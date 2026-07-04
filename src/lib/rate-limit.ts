// ──────────────────────────────────────────────
// Rate limiter — Upstash Redis with in-memory fallback
// ──────────────────────────────────────────────

import { Redis } from "@upstash/redis";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
  }
  return redis;
}

// In-memory fallback store
const inMemoryStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryStore) {
      if (entry.resetAt < now) {
        inMemoryStore.delete(key);
      }
    }
  }, 300_000);
}

export function rateLimiter(options: {
  maxRequests: number;
  windowMs: number;
}): { check: (ip: string) => Promise<RateLimitResult> } {
  const { maxRequests, windowMs } = options;

  return {
    async check(ip: string): Promise<RateLimitResult> {
      const redisClient = getRedis();

      if (redisClient) {
        // Redis-based sliding window (atomic, serverless-safe)
        const key = `ratelimit:${maxRequests}:${windowMs}:${ip}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        try {
          const multi = redisClient.multi();
          multi.zremrangebyscore(key, 0, windowStart);
          multi.zadd(key, { score: now, member: `${now}:${crypto.randomUUID()}` });
          multi.zcard(key);
          multi.expire(key, Math.ceil(windowMs / 1000));
          const [, , count] = await multi.exec();

          const requestCount = (count as number) || 0;
          return {
            allowed: requestCount <= maxRequests,
            remaining: Math.max(0, maxRequests - requestCount),
            resetIn: Math.max(0, windowMs - (Date.now() - windowStart)),
          };
        } catch {
          // Redis failure — fall through to in-memory
        }
      }

      // In-memory fallback
      const now = Date.now();
      const entry = inMemoryStore.get(ip);

      if (!entry || entry.resetAt < now) {
        inMemoryStore.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
      }

      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
      }

      entry.count++;
      return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
    },
  };
}
