import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Sign In — ${SITE_NAME}`,
  description:
    "Sign in to your PEA_FITS account to access your private suite, manage orders, and save your favorites.",
  openGraph: {
    title: `Sign In — ${SITE_NAME}`,
    description: "Access your PEA_FITS member suite.",
  },
};

// ──────────────────────────────────────────────
// Login Page
// ──────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left: Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-black">
              {SITE_NAME}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">Welcome back</p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* ── Right: Brand Image Placeholder ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-100 items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-80 h-80 bg-neutral-200 rounded-2xl flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-300 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-400">
                Your private suite for exclusive access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
