import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limit";
import * as bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

const resetPasswordLimiter = rateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 });

// ──────────────────────────────────────────────
// GET /api/auth/reset-password/[token]
// Validate the token
// ──────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 },
      );
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
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

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        message: "Token is valid",
      },
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/auth/reset-password/[token]
// Reset the password
// ──────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
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

    const { token } = await params;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { password } = parsed.data;

    // Verify the token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
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

    // Hash the new password (12 rounds as specified)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and delete used token in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: verificationToken.identifier },
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
