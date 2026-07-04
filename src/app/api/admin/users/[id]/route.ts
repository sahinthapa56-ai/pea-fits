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

const updateUserSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]).optional(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional().nullable(),
});

// ──────────────────────────────────────────────
// PATCH /api/admin/users/[id]
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

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    // Prevent SUPER_ADMIN from being demoted by a regular ADMIN
    if (existing.role === "SUPER_ADMIN" && authResult.session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only a SUPER_ADMIN can modify another SUPER_ADMIN" },
        { status: 403 },
      );
    }

    // Only SUPER_ADMIN can promote a user to ADMIN or SUPER_ADMIN
    if (
      parsed.data.role &&
      parsed.data.role !== "CUSTOMER" &&
      authResult.session?.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Only a SUPER_ADMIN can assign ADMIN or SUPER_ADMIN role" },
        { status: 403 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/users/[id]
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

    // Only SUPER_ADMIN can delete users
    if (authResult.session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only SUPER_ADMIN can delete users" },
        { status: 403 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Prevent self-deletion
    if (id === authResult.session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { message: "User deleted" } });
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
