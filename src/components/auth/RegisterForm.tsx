"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ──────────────────────────────────────────────
// Password strength indicator
// ──────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (score <= 3) return { label: "Fair", color: "bg-orange-500", width: "50%" };
    if (score <= 4) return { label: "Good", color: "bg-yellow-500", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(password);

  if (password.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
      <span className="text-xs text-neutral-500 min-w-10 text-right">{strength.label}</span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        // Register the user
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Registration failed. Please try again.");
          return;
        }

        // Auto sign in after successful registration
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.error) {
          // Registration succeeded but auto-login failed — redirect to login
          router.push("/login?registered=true");
          return;
        }

        router.push("/profile");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "A network error occurred. Please check your connection and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Error banner */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* Name */}
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          error={errors.name?.message}
          aria-invalid={!!errors.name}
          {...register("name")}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          aria-invalid={!!errors.email}
          {...register("email")}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          className="bg-black text-white hover:opacity-90 rounded-xl mt-2"
        >
          Create Account
        </Button>

        {/* Login link */}
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
