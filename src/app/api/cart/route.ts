import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const addItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity is 10").default(1),
});

const updateItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity is 10"),
});

// ──────────────────────────────────────────────
// GET /api/cart
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
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
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
                isPrimary: true,
              },
            },
          },
        },
        variant: {
          select: {
            id: true,
            size: true,
            color: true,
            price: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: cartItems });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/cart
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { productId, variantId, quantity } = parsed.data;

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true, inStock: true, stockQuantity: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found or unavailable" },
        { status: 404 },
      );
    }

    if (!product.inStock || product.stockQuantity < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 },
      );
    }

    // If variant specified, verify it exists
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, productId: true, stock: true, isActive: true },
      });

      if (!variant || variant.productId !== productId || !variant.isActive) {
        return NextResponse.json(
          { success: false, error: "Variant not found or unavailable" },
          { status: 404 },
        );
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          { success: false, error: "Insufficient variant stock" },
          { status: 400 },
        );
      }
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId: variantId ?? "",
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = Math.min(existingItem.quantity + quantity, 10);
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
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
    }

    // Add new item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        variantId: variantId ?? null,
        quantity,
      },
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

    return NextResponse.json({ success: true, data: cartItem }, { status: 201 });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/cart
// ──────────────────────────────────────────────

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { itemId, quantity } = parsed.data;

    // Verify item belongs to user
    const existing = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true, product: { select: { stockQuantity: true, inStock: true } } },
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
    console.error("Cart PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart item" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/cart
// ──────────────────────────────────────────────

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: { message: "Cart cleared" } });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
