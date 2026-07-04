import { NextRequest, NextResponse } from "next/server";
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
// GET /api/admin/users
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: Record<string, unknown> = {};
    if (search) {
      const lowerSearch = search.toLowerCase();
      where.OR = [
        { name: { contains: lowerSearch } },
        { email: { contains: lowerSearch } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: users,
      meta: { total, page, pageSize: limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
