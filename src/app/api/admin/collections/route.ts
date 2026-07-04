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

const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

// ──────────────────────────────────────────────
// GET /api/admin/collections
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

    const collections = await prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error("Admin collections GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/collections
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
    const parsed = createCollectionSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const slug = generateSlug(parsed.data.name);

    const existingSlug = await prisma.collection.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "A collection with this name already exists" },
        { status: 409 },
      );
    }

    const collection = await prisma.collection.create({
      data: { ...parsed.data, slug },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ success: true, data: collection }, { status: 201 });
  } catch (error) {
    console.error("Admin collections POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create collection" },
      { status: 500 },
    );
  }
}
