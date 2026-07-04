import { successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// GET /api/cms-pages/[slug]
// Returns a published CmsPage by slug
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const page = await prisma.cmsPage.findUnique({
      where: { slug },
    });

    if (!page || !page.isPublished) {
      return errorResponse("Page not found", 404);
    }

    return successResponse(page);
  } catch (error) {
    console.error("Cms-pages [slug] GET error:", error);
    return errorResponse("Failed to fetch page");
  }
}
