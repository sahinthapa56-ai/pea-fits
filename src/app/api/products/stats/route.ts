import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// GET /api/products/stats
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const [
      total,
      onSale,
      newProducts,
      outOfStock,
      lowStock,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, isOnSale: true } }),
      prisma.product.count({ where: { isActive: true, isNew: true } }),
      prisma.product.count({ where: { isActive: true, inStock: false } }),
      prisma.product.count({ where: { isActive: true, stockQuantity: { gt: 0, lte: 5 } } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        onSale,
        newProducts,
        outOfStock,
        lowStock,
      },
    });
  } catch (error) {
    console.error("Product stats GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product stats" },
      { status: 500 },
    );
  }
}
