"use client";

import { useState, useCallback, useEffect } from "react";
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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  // Detect if Google OAuth is configured server-side by probing
  // the session endpoint — no Google provider means 404 on google callback
  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((providers) => setGoogleAvailable("google" in providers))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl: "/profile",
        });

        if (result?.error) {
          const errorMap: Record<string, string> = {
            CredentialsSignin: "Invalid email or password. Please try again.",
            credentials: "Invalid email or password. Please try again.",
            default: "An error occurred during sign in. Please try again.",
          };
          setError(errorMap[result.error] ?? errorMap.default);
          return;
        }

        if (result?.url) {
          router.push(result.url);
        } else {
          router.push("/profile");
        }
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

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn("google", { callbackUrl: "/profile" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in with Google. Please try again.",
      );
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
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
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <div className="flex justify-end mt-1">
            <Link
              href="/reset-password"
              className="text-xs text-neutral-500 hover:text-black transition-colors underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Keep me signed in */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 border-neutral-300 rounded focus:ring-black focus:ring-offset-1 cursor-pointer"
            {...register("remember")}
          />
          <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
            Keep me signed in
          </span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          className="bg-black text-white hover:opacity-90 rounded-xl"
        >
          Sign In
        </Button>

        {/* Google OAuth — only show when configured server-side */}
        {googleAvailable && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={handleGoogleSignIn}
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </>
        )}

        {/* Register link */}
        <p className="text-center text-sm text-neutral-500">
          No account?{" "}
          <Link
            href="/register"
            className="text-black font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Create your private suite
          </Link>
        </p>
      </form>
    </div>
  );
}
