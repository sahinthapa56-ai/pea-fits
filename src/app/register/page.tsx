import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Create Account — ${SITE_NAME}`,
  description:
    "Create your PEA_FITS account and unlock your private shopping suite with exclusive access to collections, orders, and favorites.",
  openGraph: {
    title: `Create Account — ${SITE_NAME}`,
    description: "Join PEA_FITS and unlock your private suite.",
  },
};

// ──────────────────────────────────────────────
// Register Page
// ──────────────────────────────────────────────

export default function RegisterPage() {
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
            <p className="mt-2 text-sm text-neutral-500">
              Create your private suite
            </p>
          </div>

          <RegisterForm />
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-400">
                Join the community of discerning collectors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
