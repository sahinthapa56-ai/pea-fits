import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateTaxSchema = z.object({
  name: z.string().min(1).optional(),
  rate: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/tax
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    let config = await prisma.taxConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.taxConfig.create({
        data: { id: "default" },
      });
    }

    return successResponse(config);
  } catch (error) {
    console.error("Admin tax GET error:", error);
    return errorResponse("Failed to fetch tax config");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/tax
// ──────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = updateTaxSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const config = await prisma.taxConfig.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });

    return successResponse(config);
  } catch (error) {
    console.error("Admin tax PUT error:", error);
    return errorResponse("Failed to update tax config");
  }
}
