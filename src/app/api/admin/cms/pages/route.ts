import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  content: z.any().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isPublished: z.boolean().optional().default(false),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/pages
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const pages = await prisma.cmsPage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse(pages);
  } catch (error) {
    console.error("Admin pages GET error:", error);
    return errorResponse("Failed to fetch pages");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/pages
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // Check for unique slug
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return errorResponse("A page with this slug already exists", 409);
    }

    const page = await prisma.cmsPage.create({
      data: parsed.data,
    });

    return successResponse(page, 201);
  } catch (error) {
    console.error("Admin pages POST error:", error);
    return errorResponse("Failed to create page");
  }
}
