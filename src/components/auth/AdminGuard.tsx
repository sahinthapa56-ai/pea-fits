"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

// ──────────────────────────────────────────────
// AdminGuard — wraps children and only renders if user is admin
// ──────────────────────────────────────────────

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?error=Admin%20access%20required");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label="Checking access">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  // Not admin
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            You need administrator privileges to access this area.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-black underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  // Authorized — render children
  return <>{children}</>;
}
