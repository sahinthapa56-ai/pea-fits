import { NextRequest, NextResponse } from "next/server";
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

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  author: z.string().optional().default("PEA_FITS"),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/admin/journal
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;
    const status = searchParams.get("status"); // "published" | "draft"

    const where: Record<string, unknown> = {};
    if (status === "published") where.isPublished = true;
    else if (status === "draft") where.isPublished = false;

    const [posts, total] = await Promise.all([
      prisma.journalArticle.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.journalArticle.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: posts,
      meta: { total, page, pageSize: limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    console.error("Admin journal GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal posts" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/journal
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
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { title, isPublished, tags, ...rest } = parsed.data;

    // Generate slug
    let slug = generateSlug(title);
    const existingSlug = await prisma.journalArticle.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.journalArticle.create({
      data: {
        title,
        slug,
        ...rest,
        tags: JSON.stringify(tags ?? []),
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error("Admin journal POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create journal post" },
      { status: 500 },
    );
  }
}
