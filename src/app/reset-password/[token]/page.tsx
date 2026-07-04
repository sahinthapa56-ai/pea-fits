"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// ──────────────────────────────────────────────
// Reset Password Verification Page
// ──────────────────────────────────────────────

type PageState = "loading-token" | "expired" | "ready" | "submitting" | "success" | "error";

export default function ResetPasswordVerifyPage() {
  const params = useParams();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>("loading-token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setPageState("expired");
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
          method: "GET",
        });
        const result = await res.json();
        if (result.success) {
          setPageState("ready");
        } else {
          setPageState("expired");
        }
      } catch {
        setPageState("expired");
      }
    };

    validateToken();
  }, [token]);

  const validateForm = useCallback((): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (password.length > 128) {
      errors.password = "Password is too long";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setPageState("submitting");

    try {
      const res = await fetch(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (result.success) {
        setPageState("success");
      } else {
        setError(result.error ?? "Failed to reset password. Please try again.");
        setPageState("ready");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
      setPageState("ready");
    }
  };

  // ── Loading state ──
  if (pageState === "loading-token") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-2xl font-serif text-primary tracking-wider">
            {SITE_NAME}
          </Link>
          <p className="mt-8 text-sm text-text-secondary">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // ── Expired / invalid token ──
  if (pageState === "expired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-serif text-primary tracking-wider">
              {SITE_NAME}
            </Link>
          </div>
          <div className="bg-white border border-border rounded-xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-primary mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-secondary mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/reset-password"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-on-primary px-8 py-4 uppercase tracking-wider font-semibold text-sm hover:opacity-90 transition-all"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-serif text-primary tracking-wider">
              {SITE_NAME}
            </Link>
          </div>
          <div className="bg-white border border-border rounded-xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-primary mb-2">Password Reset Successfully</h2>
            <p className="text-sm text-secondary mb-6">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-on-primary px-8 py-4 uppercase tracking-wider font-semibold text-sm hover:opacity-90 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready (show form) ──
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif text-primary tracking-wider">
            {SITE_NAME}
          </Link>
          <p className="text-xs text-text-secondary mt-2 uppercase tracking-[0.2em]">
            Create a new password
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold text-primary mb-2">Reset Your Password</h1>
          <p className="text-sm text-secondary mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={pageState === "submitting"}>
              Reset Password
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-text-secondary">
            Remember your password?{" "}
            <Link href="/login" className="text-primary underline underline-offset-2 hover:text-text-secondary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
