import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateSiteSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  tagline: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  socialLinks: z.string().optional().nullable(),
  shippingConfig: z.string().optional().nullable(),
  seoDefaults: z.string().optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/site-settings
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    return successResponse(settings);
  } catch (error) {
    console.error("Admin site-settings GET error:", error);
    return errorResponse("Failed to fetch site settings");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/site-settings
// ──────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = updateSiteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // Find the first settings record or create one
    const existing = await prisma.siteSettings.findFirst();
    const settings = await prisma.siteSettings.upsert({
      where: { id: existing?.id ?? "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });

    return successResponse(settings);
  } catch (error) {
    console.error("Admin site-settings PUT error:", error);
    return errorResponse("Failed to update site settings");
  }
}
