import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.next();
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

    return NextResponse.next();
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

  return NextResponse.next();
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
