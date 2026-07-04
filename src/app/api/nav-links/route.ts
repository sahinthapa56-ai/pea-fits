import { successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// GET /api/nav-links
// Returns active nav links grouped by section
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const links = await prisma.navLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Group by section
    const grouped = links.reduce(
      (acc, link) => {
        const section = link.section;
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(link);
        return acc;
      },
      {} as Record<string, typeof links>,
    );

    return successResponse(grouped);
  } catch (error) {
    console.error("Nav-links GET error:", error);
    return errorResponse("Failed to fetch nav links");
  }
}
