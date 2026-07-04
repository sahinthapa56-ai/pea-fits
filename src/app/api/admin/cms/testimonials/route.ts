import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createTestimonialSchema = z.object({
  quote: z.string().min(1, "Quote is required"),
  author: z.string().min(1, "Author is required"),
  location: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/testimonials
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(testimonials);
  } catch (error) {
    console.error("Admin testimonials GET error:", error);
    return errorResponse("Failed to fetch testimonials");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/testimonials
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const testimonial = await prisma.testimonial.create({
      data: parsed.data,
    });

    return successResponse(testimonial, 201);
  } catch (error) {
    console.error("Admin testimonials POST error:", error);
    return errorResponse("Failed to create testimonial");
  }
}
