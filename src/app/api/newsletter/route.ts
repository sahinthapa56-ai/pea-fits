import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limit";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
});

const newsletterLimiter = rateLimiter({ maxRequests: 5, windowMs: 60_000 });

// ──────────────────────────────────────────────
// POST /api/newsletter
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const rateCheck = await newsletterLimiter.check(ip);
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
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Check for duplicate
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: "This email is already subscribed" },
          { status: 409 },
        );
      }

      // Re-activate if previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true },
      });

      return NextResponse.json({
        success: true,
        data: { message: "Subscription re-activated successfully" },
      });
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json(
      { success: true, data: { message: "Successfully subscribed to newsletter" } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe. Please try again." },
      { status: 500 },
    );
  }
}
