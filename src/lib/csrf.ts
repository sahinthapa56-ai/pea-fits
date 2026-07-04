import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

export const CSRF_COOKIE_NAME = "csrf-token";
export const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_BYTES = 32; // 64 hex chars
const CSRF_MAX_AGE = 60 * 60; // 1 hour in seconds

/**
 * Route patterns that require CSRF protection on state-changing methods.
 * These are checked via pathname prefix matching.
 */
export const CSRF_PROTECTED_PATHS = [
  // Admin — all state-changing operations
  "/api/admin",
  // Auth
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/auth/google",
  // Checkout & contact
  "/api/checkout",
  "/api/contact",
  // Cart & profile
  "/api/cart",
  "/api/profile",
  // Journal (requires admin but separate from /api/admin/journal)
  "/api/journal",
  // Reviews & wishlist
  "/api/reviews",
  "/api/wishlist",
  // Newsletter (no auth, public)
  "/api/newsletter",
];

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Generate a cryptographically secure random CSRF token.
 * Uses Web Crypto API (works in Edge runtime) instead of Node.js crypto.
 */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create the cookie configuration for a CSRF token (double-submit cookie pattern).
 *
 * The cookie is intentionally NOT httpOnly so client-side JavaScript can read its
 * value and include it as the `X-CSRF-Token` request header.  The server then
 * validates that the header matches the cookie — an attacker on a different origin
 * cannot forge the header because they cannot read the cookie (same-origin policy).
 */
export function csrfCookieConfig(token: string): {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  path: string;
  maxAge: number;
} {
  return {
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // JS must be able to read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: CSRF_MAX_AGE,
  };
}

/**
 * Returns `true` when `pathname` matches one of the CSRF-protected route patterns.
 */
export function isCsrfProtectedPath(pathname: string): boolean {
  return CSRF_PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

/**
 * Returns `true` when the HTTP method changes server state.
 */
export function isStateChangingMethod(method: string): boolean {
  return STATE_CHANGING_METHODS.has(method.toUpperCase());
}

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

/**
 * Validate a CSRF token using the double-submit cookie pattern.
 *
 * Compares the `X-CSRF-Token` request header against the `csrf-token` cookie.
 * Uses a constant-time comparison to prevent timing attacks.
 */
export function validateCsrfRequest(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  // Constant-time comparison guards against timing attacks
  if (headerToken.length !== cookieToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < headerToken.length; i++) {
    result |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Ensure a CSRF cookie exists on the response.
 *
 * If the incoming request already carries a CSRF cookie its value is preserved;
 * otherwise a fresh token is generated.
 */
export function ensureCsrfCookie(
  request: NextRequest,
  response: NextResponse,
): void {
  const existing = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const token = existing ?? generateCsrfToken();
  response.cookies.set(csrfCookieConfig(token));
}

// ──────────────────────────────────────────────
// Response helpers
// ──────────────────────────────────────────────

/**
 * Build a 403 JSON response for a failed CSRF check.
 */
export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: "Invalid or missing CSRF token" },
    { status: 403 },
  );
}

/**
 * Async variant of `validateCsrfRequest` for use in route handlers that receive
 * a plain `Request` (not `NextRequest`).  Reads the cookie via `next/headers`.
 */
export async function validateCsrfRequestFromRequest(
  request: Request,
): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!headerToken || !cookieToken) {
    return false;
  }

  if (headerToken.length !== cookieToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < headerToken.length; i++) {
    result |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }
  return result === 0;
}
