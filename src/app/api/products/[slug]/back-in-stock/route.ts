import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limit";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const backInStockSchema = z.object({
  email: z.string().email("Valid email is required").max(255),
  variantId: z.string().optional(),
});

const backInStockLimiter = rateLimiter({ maxRequests: 10, windowMs: 60_000 });

// ──────────────────────────────────────────────
// POST /api/products/[slug]/back-in-stock
// ──────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const rateCheck = await backInStockLimiter.check(ip);
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

    // Validate body
    const body = await request.json();
    const parsed = backInStockSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { email, variantId } = parsed.data;

    // Fetch product by slug, include its variants
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Determine if out of stock
    let isOutOfStock = false;

    if (variantId) {
      // Check specific variant
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json(
          { success: false, error: "Variant not found" },
          { status: 404 },
        );
      }
      isOutOfStock = variant.stock <= 0;
    } else {
      // Check product-level stock
      isOutOfStock = !product.inStock || product.stockQuantity <= 0;
    }

    if (!isOutOfStock) {
      return NextResponse.json(
        {
          success: false,
          error: "This item is currently in stock",
        },
        { status: 400 },
      );
    }

    // Upsert the back-in-stock request
    // Note: Prisma compound unique requires variantId as string (not null)
    // so we branch on whether a variant was specified
    if (variantId) {
      await prisma.backInStockRequest.upsert({
        where: {
          email_productId_variantId: {
            email,
            productId: product.id,
            variantId,
          },
        },
        update: { isNotified: false, notifiedAt: null },
        create: {
          email,
          productId: product.id,
          variantId,
          isNotified: false,
        },
      });
    } else {
      const existing = await prisma.backInStockRequest.findFirst({
        where: { email, productId: product.id, variantId: null },
      });
      if (existing) {
        await prisma.backInStockRequest.update({
          where: { id: existing.id },
          data: { isNotified: false, notifiedAt: null },
        });
      } else {
        await prisma.backInStockRequest.create({
          data: {
            email,
            productId: product.id,
            variantId: null,
            isNotified: false,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "We'll email you when this item is back in stock",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Back-in-stock POST error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
