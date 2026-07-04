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

const updatePostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  author: z.string().optional(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/admin/journal/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const { id } = await params;

    const post = await prisma.journalArticle.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Journal post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Admin journal GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal post" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/admin/journal/[id]
// ──────────────────────────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const { id } = await params;

    const existing = await prisma.journalArticle.findUnique({
      where: { id },
      select: { id: true, slug: true, isPublished: true, publishedAt: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Journal post not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };

    // If title changed, update slug
    if (data.title && data.title !== existing.slug) {
      let newSlug = generateSlug(data.title as string);
      const existingSlug = await prisma.journalArticle.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      data.slug = newSlug;
    }

    // Set publishedAt when first publishing
    if (data.isPublished === true && !existing.isPublished) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.journalArticle.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin journal PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update journal post" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/journal/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const { id } = await params;

    const existing = await prisma.journalArticle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Journal post not found" },
        { status: 404 },
      );
    }

    await prisma.journalArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: "Journal post deleted" } });
  } catch (error) {
    console.error("Admin journal DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete journal post" },
      { status: 500 },
    );
  }
}
