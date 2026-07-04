import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createNavLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Href is required"),
  sortOrder: z.number().int().optional().default(0),
  section: z.enum(["main", "footer_shop", "footer_info", "footer_support"]),
  isActive: z.boolean().optional().default(true),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/nav-links
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const links = await prisma.navLink.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(links);
  } catch (error) {
    console.error("Admin nav-links GET error:", error);
    return errorResponse("Failed to fetch nav links");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/nav-links
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createNavLinkSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const link = await prisma.navLink.create({
      data: parsed.data,
    });

    return successResponse(link, 201);
  } catch (error) {
    console.error("Admin nav-links POST error:", error);
    return errorResponse("Failed to create nav link");
  }
}
