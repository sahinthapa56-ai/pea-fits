"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

// ──────────────────────────────────────────────
// AuthProvider — wraps the app with NextAuth SessionProvider
// ──────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
