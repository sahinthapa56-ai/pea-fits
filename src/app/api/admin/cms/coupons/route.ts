import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createCouponSchema = z.object({
  code: z.string().min(1, "Code is required").toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0, "Value must be non-negative"),
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/coupons
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse(coupons);
  } catch (error) {
    console.error("Admin coupons GET error:", error);
    return errorResponse("Failed to fetch coupons");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/coupons
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // Check for unique code
    const existing = await prisma.coupon.findUnique({
      where: { code: parsed.data.code },
    });
    if (existing) {
      return errorResponse("A coupon with this code already exists", 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...parsed.data,
        minPurchase: parsed.data.minPurchase ?? null,
        maxDiscount: parsed.data.maxDiscount ?? null,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    return successResponse(coupon, 201);
  } catch (error) {
    console.error("Admin coupons POST error:", error);
    return errorResponse("Failed to create coupon");
  }
}
