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

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// PATCH /api/admin/collections/[id]
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

    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);
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
      const existingSlug = await prisma.collection.findFirst({
        where: { slug: data.slug as string, id: { not: id } },
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "A collection with this name already exists" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.collection.update({
      where: { id },
      data,
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin collections PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update collection" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/collections/[id]
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

    const existing = await prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 },
      );
    }

    // Delete associated collection items first
    await prisma.collectionItem.deleteMany({
      where: { collectionId: id },
    });

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: "Collection deleted" } });
  } catch (error) {
    console.error("Admin collections DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
