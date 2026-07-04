import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateTestimonialSchema = z.object({
  quote: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  location: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/testimonials/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return errorResponse("Testimonial not found", 404);
    }

    return successResponse(testimonial);
  } catch (error) {
    console.error("Admin testimonials [id] GET error:", error);
    return errorResponse("Failed to fetch testimonial");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/testimonials/[id]
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Testimonial not found", 404);
    }

    const body = await request.json();
    const parsed = updateTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(testimonial);
  } catch (error) {
    console.error("Admin testimonials [id] PUT error:", error);
    return errorResponse("Failed to update testimonial");
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/testimonials/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Testimonial not found", 404);
    }

    await prisma.testimonial.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin testimonials [id] DELETE error:", error);
    return errorResponse("Failed to delete testimonial");
  }
}
