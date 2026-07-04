import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional(),
  content: z.any().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/pages/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const page = await prisma.cmsPage.findUnique({ where: { id } });
    if (!page) {
      return errorResponse("Page not found", 404);
    }

    return successResponse(page);
  } catch (error) {
    console.error("Admin pages [id] GET error:", error);
    return errorResponse("Failed to fetch page");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/pages/[id]
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.cmsPage.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Page not found", 404);
    }

    const body = await request.json();
    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // If slug is being changed, check uniqueness
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const duplicate = await prisma.cmsPage.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (duplicate) {
        return errorResponse("A page with this slug already exists", 409);
      }
    }

    const page = await prisma.cmsPage.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(page);
  } catch (error) {
    console.error("Admin pages [id] PUT error:", error);
    return errorResponse("Failed to update page");
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/pages/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.cmsPage.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Page not found", 404);
    }

    await prisma.cmsPage.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin pages [id] DELETE error:", error);
    return errorResponse("Failed to delete page");
  }
}
