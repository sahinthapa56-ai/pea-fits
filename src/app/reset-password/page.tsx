"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// ──────────────────────────────────────────────
// Reset Password Page
// ──────────────────────────────────────────────

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Failed to send reset email. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif text-primary tracking-wider">
            {SITE_NAME}
          </Link>
          <p className="text-xs text-text-secondary mt-2 uppercase tracking-[0.2em]">
            Reset your password
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-primary mb-2">Check Your Email</h2>
              <p className="text-sm text-secondary">
                If an account exists with that email, we&apos;ve sent password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm text-primary underline underline-offset-2 hover:text-text-secondary transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-primary mb-2">Reset Password</h1>
              <p className="text-sm text-secondary mb-6">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-text-secondary">
                Remember your password?{" "}
                <Link href="/login" className="text-primary underline underline-offset-2 hover:text-text-secondary transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
