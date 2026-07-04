import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Admin auth helper
// ──────────────────────────────────────────────

async function adminAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required", status: 401 };
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Admin access required", status: 403 };
  }
  return { session };
}

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const updateSettingsSchema = z.object({
  siteName: z.string().min(1).max(200).optional(),
  tagline: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  socialLinks: z.record(z.string(), z.string()).optional().nullable(),
  shippingConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  seoDefaults: z.record(z.string(), z.unknown()).optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/admin/settings
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/admin/settings
// ──────────────────────────────────────────────

export async function PATCH(request: Request) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: parsed.data as unknown as import("@prisma/client").Prisma.SiteSettingsUpdateInput,
      create: {
        id: "default",
        ...parsed.data,
      } as unknown as import("@prisma/client").Prisma.SiteSettingsCreateInput,
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Admin settings PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
