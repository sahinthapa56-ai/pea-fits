import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity is 10"),
});

// ──────────────────────────────────────────────
// DELETE /api/cart/[itemId]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { itemId } = await params;

    const existing = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart item DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from cart" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/cart/[itemId]
// ──────────────────────────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { itemId } = await params;

    const body = await request.json();
    const parsed = updateQuantitySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { quantity } = parsed.data;

    const existing = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            isOnSale: true,
            inStock: true,
            stockQuantity: true,
            images: {
              take: 1,
              orderBy: { sortOrder: "asc" },
              select: { id: true, url: true, alt: true },
            },
          },
        },
        variant: {
          select: { id: true, size: true, color: true, price: true, stock: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Cart item PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart item" },
      { status: 500 },
    );
  }
}
