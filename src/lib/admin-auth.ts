import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type AdminAuthSuccess = {
  authorized: true;
  response: undefined;
  session: Session;
};

type AdminAuthFailure = {
  authorized: false;
  response: NextResponse;
  session: null;
};

type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

/**
 * Admin role required — gated by the user's role field.
 * Returns the session if authorized, or a 401/403 response.
 */
export async function adminAuth(): Promise<AdminAuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 } as const,
      ),
      session: null,
    };
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 } as const,
      ),
      session: null,
    };
  }

  return {
    authorized: true as const,
    response: undefined,
    session,
  };
}

/**
 * Standard success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard error response
 */
export function errorResponse(error: string, status = 500) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Extract IP from request headers
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown"
  );
}
