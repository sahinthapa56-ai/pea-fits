import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXT_PUBLIC_URL: z.string().url().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().refine(
    (v) => v.startsWith("sk_live_") || v.startsWith("sk_test_"),
    "STRIPE_SECRET_KEY must start with sk_live_ or sk_test_"
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().refine(
    (v) => v.startsWith("pk_live_") || v.startsWith("pk_test_"),
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_live_ or pk_test_"
  ),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),

  // Khalti
  KHALTI_SECRET_KEY: z.string().optional(),
  KHALTI_PUBLIC_KEY: z.string().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // Resend
  RESEND_API_KEY: z.string().refine(
    (v) => v.startsWith("re_"),
    "RESEND_API_KEY must start with re_"
  ),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email").optional().default("PEA FITS <noreply@peafits.com.np>"),

  // Upstash Redis
  UPSTASH_REDIS_URL: z.string().url("UPSTASH_REDIS_URL must be a valid URL").optional(),
  UPSTASH_REDIS_TOKEN: z.string().min(1, "UPSTASH_REDIS_TOKEN is required when UPSTASH_REDIS_URL is set").optional(),

  // Google OAuth
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Optional: Sentry
  SENTRY_DSN: z.string().url().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".")}: ${issue.message}`
    ).join("\n");

    throw new Error(
      `❌ Environment variable validation failed:\n${errors}\n\n` +
      "Please check your .env.local file and ensure all required variables are set correctly."
    );
  }

  return result.data;
}

let validatedEnv: Env | null = null;

export function getEnv(): Env {
  if (!validatedEnv) {
    validatedEnv = validateEnv();
  }
  return validatedEnv;
}

// Validate on import in production
if (process.env.NODE_ENV === "production") {
  validateEnv();
}
