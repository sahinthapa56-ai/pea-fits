import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateNavLinkSchema = z.object({
  label: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  section: z.enum(["main", "footer_shop", "footer_info", "footer_support"]).optional(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/nav-links/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const link = await prisma.navLink.findUnique({ where: { id } });
    if (!link) {
      return errorResponse("Nav link not found", 404);
    }

    return successResponse(link);
  } catch (error) {
    console.error("Admin nav-links [id] GET error:", error);
    return errorResponse("Failed to fetch nav link");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/nav-links/[id]
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.navLink.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Nav link not found", 404);
    }

    const body = await request.json();
    const parsed = updateNavLinkSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const link = await prisma.navLink.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(link);
  } catch (error) {
    console.error("Admin nav-links [id] PUT error:", error);
    return errorResponse("Failed to update nav link");
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/nav-links/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.navLink.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Nav link not found", 404);
    }

    await prisma.navLink.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin nav-links [id] DELETE error:", error);
    return errorResponse("Failed to delete nav link");
  }
}
