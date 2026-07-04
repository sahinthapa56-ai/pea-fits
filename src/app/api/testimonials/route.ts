import { successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// GET /api/testimonials
// Returns active testimonials ordered by sortOrder
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(testimonials);
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return errorResponse("Failed to fetch testimonials");
  }
}
