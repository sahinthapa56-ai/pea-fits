import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateCouponSchema = z.object({
  code: z.string().min(1).toUpperCase().optional(),
  type: z.enum(["percentage", "fixed"]).optional(),
  value: z.number().min(0).optional(),
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/coupons/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return errorResponse("Coupon not found", 404);
    }

    return successResponse(coupon);
  } catch (error) {
    console.error("Admin coupons [id] GET error:", error);
    return errorResponse("Failed to fetch coupon");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/coupons/[id]
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Coupon not found", 404);
    }

    const body = await request.json();
    const parsed = updateCouponSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // If code is being changed, check uniqueness
    if (parsed.data.code && parsed.data.code !== existing.code) {
      const duplicate = await prisma.coupon.findUnique({
        where: { code: parsed.data.code },
      });
      if (duplicate) {
        return errorResponse("A coupon with this code already exists", 409);
      }
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startsAt !== undefined) {
      updateData.startsAt = parsed.data.startsAt
        ? new Date(parsed.data.startsAt)
        : null;
    }
    if (parsed.data.expiresAt !== undefined) {
      updateData.expiresAt = parsed.data.expiresAt
        ? new Date(parsed.data.expiresAt)
        : null;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return successResponse(coupon);
  } catch (error) {
    console.error("Admin coupons [id] PUT error:", error);
    return errorResponse("Failed to update coupon");
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/coupons/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Coupon not found", 404);
    }

    await prisma.coupon.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin coupons [id] DELETE error:", error);
    return errorResponse("Failed to delete coupon");
  }
}
