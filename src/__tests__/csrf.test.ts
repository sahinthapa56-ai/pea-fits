import { describe, it, expect } from "vitest";
import {
  generateCsrfToken,
  isCsrfProtectedPath,
  isStateChangingMethod,
} from "@/lib/csrf";

describe("CSRF Token", () => {
  it("generates a token of correct length (64 hex characters)", () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates unique tokens on each call", () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });

  it("generates a token that is a valid hex string", () => {
    const token = generateCsrfToken();
    // Should only contain hex characters (0-9, a-f)
    expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
  });
});

describe("isCsrfProtectedPath", () => {
  it("returns true for admin API paths", () => {
    expect(isCsrfProtectedPath("/api/admin")).toBe(true);
    expect(isCsrfProtectedPath("/api/admin/products")).toBe(true);
    expect(isCsrfProtectedPath("/api/admin/cms/shipping")).toBe(true);
  });

  it("returns true for auth state-changing paths", () => {
    expect(isCsrfProtectedPath("/api/auth/register")).toBe(true);
    expect(isCsrfProtectedPath("/api/auth/reset-password")).toBe(true);
    expect(isCsrfProtectedPath("/api/auth/logout")).toBe(true);
  });

  it("returns true for checkout, cart, and profile paths", () => {
    expect(isCsrfProtectedPath("/api/checkout")).toBe(true);
    expect(isCsrfProtectedPath("/api/cart")).toBe(true);
    expect(isCsrfProtectedPath("/api/profile")).toBe(true);
  });

  it("returns true for review, wishlist, and journal paths", () => {
    expect(isCsrfProtectedPath("/api/reviews")).toBe(true);
    expect(isCsrfProtectedPath("/api/wishlist")).toBe(true);
    expect(isCsrfProtectedPath("/api/journal")).toBe(true);
  });

  it("returns true for contact and newsletter paths", () => {
    expect(isCsrfProtectedPath("/api/contact")).toBe(true);
    expect(isCsrfProtectedPath("/api/newsletter")).toBe(true);
  });

  it("returns false for unprotected paths", () => {
    expect(isCsrfProtectedPath("/api/products")).toBe(false);
    expect(isCsrfProtectedPath("/api/testimonials")).toBe(false);
    expect(isCsrfProtectedPath("/api/nav-links")).toBe(false);
    expect(isCsrfProtectedPath("/")).toBe(false);
    expect(isCsrfProtectedPath("/api/webhooks/stripe")).toBe(false);
  });

  it("matches sub-paths with trailing slash", () => {
    expect(isCsrfProtectedPath("/api/admin/")).toBe(true);
    expect(isCsrfProtectedPath("/api/cart/add")).toBe(true);
  });
});

describe("isStateChangingMethod", () => {
  it("returns true for POST, PUT, PATCH, DELETE", () => {
    expect(isStateChangingMethod("POST")).toBe(true);
    expect(isStateChangingMethod("PUT")).toBe(true);
    expect(isStateChangingMethod("PATCH")).toBe(true);
    expect(isStateChangingMethod("DELETE")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isStateChangingMethod("post")).toBe(true);
    expect(isStateChangingMethod("Post")).toBe(true);
  });

  it("returns false for GET, HEAD, OPTIONS", () => {
    expect(isStateChangingMethod("GET")).toBe(false);
    expect(isStateChangingMethod("HEAD")).toBe(false);
    expect(isStateChangingMethod("OPTIONS")).toBe(false);
  });
});
