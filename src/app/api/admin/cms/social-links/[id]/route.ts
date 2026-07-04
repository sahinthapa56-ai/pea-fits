import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateSocialLinkSchema = z.object({
  platform: z.string().min(1).optional(),
  url: z.string().url("Must be a valid URL").optional(),
  sortOrder: z.number().int().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/social-links/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const link = await prisma.socialLink.findUnique({ where: { id } });
    if (!link) {
      return errorResponse("Social link not found", 404);
    }

    return successResponse(link);
  } catch (error) {
    console.error("Admin social-links [id] GET error:", error);
    return errorResponse("Failed to fetch social link");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/social-links/[id]
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Social link not found", 404);
    }

    const body = await request.json();
    const parsed = updateSocialLinkSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const link = await prisma.socialLink.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(link);
  } catch (error) {
    console.error("Admin social-links [id] PUT error:", error);
    return errorResponse("Failed to update social link");
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/social-links/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Social link not found", 404);
    }

    await prisma.socialLink.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin social-links [id] DELETE error:", error);
    return errorResponse("Failed to delete social link");
  }
}
