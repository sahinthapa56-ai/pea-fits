import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// GET /api/collections
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            items: {
              where: { product: { isActive: true } },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error("Collections GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}
