import { handlers } from "@/lib/auth";
import { rateLimiter } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────
// Rate limiter — credential sign-in only
// ──────────────────────────────────────────────

const signInLimiter = rateLimiter({ maxRequests: 5, windowMs: 60_000 });

// ──────────────────────────────────────────────
// Wrapped NextAuth handlers
// ──────────────────────────────────────────────

async function rateLimitedPOST(request: NextRequest) {
  // Only rate-limit the credentials callback endpoint
  const isCredentialsSignIn = request.nextUrl.pathname === "/api/auth/callback/credentials";

  if (isCredentialsSignIn) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";

    const rateCheck = await signInLimiter.check(ip);
    if (!rateCheck.allowed) {
      // Return 429 — login form will display the error
      return NextResponse.redirect(
        new URL(
          `/login?error=Too many sign-in attempts. Please try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`,
          request.url,
        ),
      );
    }
  }

  return handlers.POST(request);
}

export const GET = handlers.GET;
export const POST = rateLimitedPOST;
