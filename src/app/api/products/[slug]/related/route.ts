import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// GET /api/products/[slug]/related
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Find the current product to get its category
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (!product.categoryId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            size: true,
            price: true,
            stock: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: relatedProducts });
  } catch (error) {
    console.error("Related products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch related products" },
      { status: 500 },
    );
  }
}
