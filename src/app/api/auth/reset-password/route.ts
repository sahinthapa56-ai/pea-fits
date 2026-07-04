import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import * as bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

const resetPasswordLimiter = rateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 });

// ──────────────────────────────────────────────
// POST /api/auth/reset-password
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const rateCheck = await resetPasswordLimiter.check(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetIn / 1000).toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const body = await request.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid input";
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase().trim(),
        token: resetToken,
        expires: resetExpires,
      },
    });

    // Build reset URL (path-based token — handled by src/app/reset-password/[token]/page.tsx)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password/${resetToken}`;

    // Send email via Resend (with dev console.log fallback)
    const sent = await sendPasswordResetEmail(email, user.name, resetUrl);

    if (!sent && process.env.NODE_ENV !== "development") {
      console.error(`Failed to send reset email to ${email}. Token: ${resetToken}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/auth/reset-password/confirm
// ──────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const rateCheck = await resetPasswordLimiter.check(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetIn / 1000).toString() } },
      );
    }

    const body = await request.json();
    const parsed = resetConfirmSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { token, email, password } = parsed.data;

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase().trim(),
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token. Please request a new one." },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and delete used token in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: email.toLowerCase().trim() },
        data: { hashedPassword },
      });

      await tx.verificationToken.delete({
        where: { token: verificationToken.token },
      });
    });

    return NextResponse.json({
      success: true,
      data: { message: "Password reset successfully. You can now sign in with your new password." },
    });
  } catch (error) {
    console.error("Reset password confirm error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
