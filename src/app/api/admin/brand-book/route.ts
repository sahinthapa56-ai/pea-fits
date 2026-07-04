import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

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

const createEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

// ──────────────────────────────────────────────
// GET /api/admin/brand-book
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

    const entries = await prisma.brandBookSection.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Admin brand-book GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand book entries" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/brand-book
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const body = await request.json();
    const parsed = createEntrySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const slug = generateSlug(parsed.data.title);

    // Ensure slug uniqueness
    const existingSlug = await prisma.brandBookSection.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const entry = await prisma.brandBookSection.create({
      data: {
        ...parsed.data,
        slug: finalSlug,
      },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Admin brand-book POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand book entry" },
      { status: 500 },
    );
  }
}
