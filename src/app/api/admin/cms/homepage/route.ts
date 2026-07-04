import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const upsertHomepageSchema = z.object({
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroCtaText: z.string().optional().nullable(),
  heroCtaLink: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  announcement: z.string().optional().nullable(),
  announcementEnabled: z.boolean().optional().default(false),
  featuredSectionTitle: z.string().optional().nullable(),
  featuredCollectionId: z.string().optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/homepage
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    let config = await prisma.homepageConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.homepageConfig.create({
        data: { id: "default" },
      });
    }

    return successResponse(config);
  } catch (error) {
    console.error("Admin homepage GET error:", error);
    return errorResponse("Failed to fetch homepage config");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/homepage
// ──────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = upsertHomepageSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const config = await prisma.homepageConfig.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });

    return successResponse(config);
  } catch (error) {
    console.error("Admin homepage PUT error:", error);
    return errorResponse("Failed to update homepage config");
  }
}
