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

const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// PATCH /api/admin/categories/[id]
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

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };

    // Update slug if name changed
    if (data.name) {
      data.slug = generateSlug(data.name as string);
      const existingSlug = await prisma.category.findFirst({
        where: { slug: data.slug as string, id: { not: id } },
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "A category with this name already exists" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin categories PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/categories/[id]
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

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, _count: { select: { products: true, children: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with associated products. Remove or reassign products first." },
        { status: 400 },
      );
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with subcategories. Remove subcategories first." },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: "Category deleted" } });
  } catch (error) {
    console.error("Admin categories DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
