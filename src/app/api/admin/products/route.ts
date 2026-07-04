import { NextRequest, NextResponse } from "next/server";
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

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(500),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  basePrice: z.number().min(0, "Price must be non-negative"),
  salePrice: z.number().min(0).optional().nullable(),
  isOnSale: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  brand: z.string().optional().nullable(),
  tags: z.string().optional().default("[]"),
  material: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  inStock: z.boolean().optional().default(true),
  stockQuantity: z.number().int().min(0).optional().default(0),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  images: z.array(z.object({
    url: z.string().min(1),
    alt: z.string().optional().nullable(),
    isPrimary: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional().default(0),
  })).optional().default([]),
  variants: z.array(z.object({
    size: z.string().min(1),
    color: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    price: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0).optional().default(0),
  })).optional().default([]),
});

// ──────────────────────────────────────────────
// GET /api/admin/products
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
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (search) {
      const q = search.toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
      ];
    }
    if (isActive === "true") where.isActive = true;
    else if (isActive === "false") where.isActive = false;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, url: true, alt: true, isPrimary: true },
          },
          variants: {
            where: { isActive: true },
            select: { id: true, size: true, color: true, sku: true, price: true, stock: true },
          },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.product.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      meta: { total, page, pageSize: limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/products
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const authResult = await adminAuth();
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError, fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { images, variants, ...productData } = parsed.data;

    // Generate slug
    let slug = generateSlug(productData.name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
