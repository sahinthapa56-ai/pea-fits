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

const updateEntrySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// PATCH /api/admin/brand-book/[id]
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

    const existing = await prisma.brandBookSection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Brand book entry not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateEntrySchema.safeParse(body);
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
      const existingSlug = await prisma.brandBookSection.findFirst({
        where: { slug: data.slug as string, id: { not: id } },
      });
      if (existingSlug) {
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }

    const updated = await prisma.brandBookSection.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin brand-book PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand book entry" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/brand-book/[id]
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

    const existing = await prisma.brandBookSection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Brand book entry not found" },
        { status: 404 },
      );
    }

    await prisma.brandBookSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: "Brand book entry deleted" } });
  } catch (error) {
    console.error("Admin brand-book DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand book entry" },
      { status: 500 },
    );
  }
}
