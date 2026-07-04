import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimiter } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", async () => {
    const limiter = rateLimiter({ maxRequests: 5, windowMs: 60_000 });
    const ip = "allow-within-127.0.0.1";

    // First 4 requests should all be allowed
    for (let i = 0; i < 4; i++) {
      const result = await limiter.check(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(1);
    }
  });

  it("blocks requests that exceed the limit", async () => {
    const limiter = rateLimiter({ maxRequests: 3, windowMs: 60_000 });
    const ip = "block-exceed-127.0.0.1";

    // First 3 requests should be allowed
    expect((await limiter.check(ip)).allowed).toBe(true);
    expect((await limiter.check(ip)).allowed).toBe(true);
    expect((await limiter.check(ip)).allowed).toBe(true);

    // 4th request should be blocked
    const result = await limiter.check(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets the counter after the window expires", async () => {
    const limiter = rateLimiter({ maxRequests: 2, windowMs: 60_000 });
    const ip = "reset-window-127.0.0.1";

    // Use up both requests
    expect((await limiter.check(ip)).allowed).toBe(true);
    expect((await limiter.check(ip)).allowed).toBe(true);

    // Third request should be denied
    expect((await limiter.check(ip)).allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(60_001);

    // After window expires, a new request should be allowed
    const result = await limiter.check(ip);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("returns the correct remaining count and reset time", async () => {
    const limiter = rateLimiter({ maxRequests: 5, windowMs: 60_000 });
    const ip = "remaining-test-127.0.0.1";

    const result1 = await limiter.check(ip);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(4);
    expect(result1.resetIn).toBeGreaterThan(0);
    expect(result1.resetIn).toBeLessThanOrEqual(60_000);

    const result2 = await limiter.check(ip);
    expect(result2.remaining).toBe(3);
  });

  it("tracks different IPs separately", async () => {
    const limiter = rateLimiter({ maxRequests: 2, windowMs: 60_000 });

    // IP A uses its first request
    expect((await limiter.check("192.168.1.1")).allowed).toBe(true);
    expect((await limiter.check("192.168.1.1")).allowed).toBe(true);
    // IP A should now be blocked
    expect((await limiter.check("192.168.1.1")).allowed).toBe(false);

    // IP B should still have its full quota
    expect((await limiter.check("192.168.1.2")).allowed).toBe(true);
    expect((await limiter.check("192.168.1.2")).allowed).toBe(true);
    expect((await limiter.check("192.168.1.2")).allowed).toBe(false);
  });
});
