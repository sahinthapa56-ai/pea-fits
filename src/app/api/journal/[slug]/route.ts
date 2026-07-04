import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const updatePostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
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
// GET /api/journal/[slug]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const post = await prisma.journalArticle.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Journal post not found" },
        { status: 404 },
      );
    }

    // Only show published posts to non-admin users
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
    if (!post.isPublished && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Journal post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Journal post GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal post" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/journal/[slug]
// ──────────────────────────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    const { slug } = await params;

    const existing = await prisma.journalArticle.findUnique({
      where: { slug },
      select: { id: true, publishedAt: true },
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

    // Update slug if title changed
    if (data.title) {
      data.slug = generateSlug(data.title as string);
      // Ensure slug uniqueness
      const existingSlug = await prisma.journalArticle.findFirst({
        where: { slug: data.slug as string, id: { not: existing.id } },
      });
      if (existingSlug) {
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }

    // Set publishedAt when publishing
    if (data.isPublished === true && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.journalArticle.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Journal post PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update journal post" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/journal/[slug]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    const { slug } = await params;

    const existing = await prisma.journalArticle.findUnique({
      where: { slug },
      select: { id: true, publishedAt: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Journal post not found" },
        { status: 404 },
      );
    }

    await prisma.journalArticle.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Journal post DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete journal post" },
      { status: 500 },
    );
  }
}
