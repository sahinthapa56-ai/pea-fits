import { NextResponse } from "next/server";
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
// GET /api/admin/stats
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      revenueResult,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      salesChartData,
    ] = await Promise.all([
      // Total revenue (completed/delivered orders)
      prisma.order.aggregate({
        where: {
          paymentStatus: "COMPLETED",
          status: { in: ["DELIVERED", "SHIPPED", "CONFIRMED"] },
        },
        _sum: { total: true },
      }),
      // Total orders
      prisma.order.count(),
      // Total active products
      prisma.product.count({ where: { isActive: true } }),
      // Total customers
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { take: 1, select: { name: true } },
        },
      }),
      // Sales chart data for last 30 days
      prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: thirtyDaysAgo },
          paymentStatus: "COMPLETED",
        },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Aggregate sales data by day
    const salesByDay: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      salesByDay[key] = { revenue: 0, orders: 0 };
    }

    for (const entry of salesChartData) {
      const key = entry.createdAt.toISOString().split("T")[0];
      if (salesByDay[key]) {
        salesByDay[key].revenue += Number(entry._sum.total ?? 0);
        salesByDay[key].orders += entry._count.id;
      }
    }

    const salesChart = Object.entries(salesByDay).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: Number(revenueResult._sum.total ?? 0),
        totalOrders,
        totalProducts,
        totalCustomers,
        recentOrders,
        salesChart,
      },
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
