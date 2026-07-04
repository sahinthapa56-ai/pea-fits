import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const addWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// ──────────────────────────────────────────────
// GET /api/profile/wishlist
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

    const wishlistItems = await prisma.wishlistItem.findMany({
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
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: wishlistItems });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/profile/wishlist
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

    const parsed = addWishlistSchema.safeParse(body);
    if (!parsed.success) {
      const error =
        parsed.error.flatten().fieldErrors.productId?.[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error },
        { status: 400 },
      );
    }

    const { productId } = parsed.data;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Product already in wishlist" },
        { status: 409 },
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
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
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: wishlistItem }, { status: 201 });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}
