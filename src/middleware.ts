import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import {
  isCsrfProtectedPath,
  isStateChangingMethod,
  validateCsrfRequest,
  ensureCsrfCookie,
  csrfErrorResponse,
} from "@/lib/csrf";

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get session via JWT (lightweight, no DB/Prisma/bcrypt)
  const token = await getToken({ req });

  // ── Public routes (no auth required) ──
  const publicPaths = [
    "/login",
    "/register",
    "/reset-password",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/images",
  ];

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (isPublic) {
    // Public API routes that change state still need CSRF protection
    if (isCsrfProtectedPath(pathname) && isStateChangingMethod(req.method)) {
      if (!validateCsrfRequest(req)) {
        return csrfErrorResponse();
      }
    }
    // Ensure CSRF cookie is set even on public pages so that subsequent
    // form submissions (e.g. register, contact) can include the token.
    const response = NextResponse.next();
    ensureCsrfCookie(req, response);
    return response;
  }

  // ── Protected routes ──

  // Admin routes: require admin role
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "Admin access required");
      return NextResponse.redirect(loginUrl);
    }

    // CSRF check for state-changing admin requests
    if (isStateChangingMethod(req.method)) {
      if (!validateCsrfRequest(req)) {
        return csrfErrorResponse();
      }
    }

    // Set CSRF cookie for subsequent requests
    const response = NextResponse.next();
    ensureCsrfCookie(req, response);
    return response;
  }

  // Authenticated routes: require session
  const authRequiredPaths = ["/profile", "/orders", "/checkout", "/bag"];

  const requiresAuth = authRequiredPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (requiresAuth && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CSRF check for protected API routes (cart, checkout, profile, etc.)
  if (isCsrfProtectedPath(pathname) && isStateChangingMethod(req.method)) {
    if (!validateCsrfRequest(req)) {
      return csrfErrorResponse();
    }
  }

  // Set CSRF cookie for subsequent requests
  const response = NextResponse.next();
  ensureCsrfCookie(req, response);
  return response;
}

// ──────────────────────────────────────────────
// Matcher configuration
// ──────────────────────────────────────────────

export const config = {
  matcher: [
    // Match all paths except static assets, api (except our own), and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
