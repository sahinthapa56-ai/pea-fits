import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateShippingSchema = z.object({
  freeThreshold: z.number().min(0).optional(),
  valleyCost: z.number().min(0).optional(),
  outsideValleyCost: z.number().min(0).optional(),
  provinceCosts: z.any().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/shipping
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    let config = await prisma.shippingConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.shippingConfig.create({
        data: { id: "default" },
      });
    }

    return successResponse(config);
  } catch (error) {
    console.error("Admin shipping GET error:", error);
    return errorResponse("Failed to fetch shipping config");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/shipping
// ──────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = updateShippingSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const config = await prisma.shippingConfig.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });

    return successResponse(config);
  } catch (error) {
    console.error("Admin shipping PUT error:", error);
    return errorResponse("Failed to update shipping config");
  }
}
