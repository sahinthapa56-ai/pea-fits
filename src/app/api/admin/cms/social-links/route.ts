import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createSocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Must be a valid URL"),
  sortOrder: z.number().int().optional().default(0),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/social-links
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const links = await prisma.socialLink.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(links);
  } catch (error) {
    console.error("Admin social-links GET error:", error);
    return errorResponse("Failed to fetch social links");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/social-links
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createSocialLinkSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const link = await prisma.socialLink.create({
      data: parsed.data,
    });

    return successResponse(link, 201);
  } catch (error) {
    console.error("Admin social-links POST error:", error);
    return errorResponse("Failed to create social link");
  }
}
