import { NextResponse } from "next/server";
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

const updateProductSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  basePrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional().nullable(),
  isOnSale: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  brand: z.string().optional().nullable(),
  tags: z.string().optional(),
  material: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().min(1),
    alt: z.string().optional().nullable(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })).optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1),
    color: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    price: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })).optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/products/[id]
// ──────────────────────────────────────────────

export async function GET(
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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, orderBy: { size: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        collections: {
          include: { collection: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/admin/products/[id]
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

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const { images, variants, ...productData } = parsed.data;

    // Generate slug if name changed
    if (productData.name) {
      let slug = generateSlug(productData.name);
      const existingSlug = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
      (productData as Record<string, unknown>).slug = slug;
    }

    const product = await prisma.$transaction(async (tx) => {
      // Update product fields
      const updated = await tx.product.update({
        where: { id },
        data: productData,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { size: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      // Handle images
      if (images) {
        // Delete existing images
        await tx.productImage.deleteMany({ where: { productId: id } });
        // Create new images
        for (const img of images) {
          await tx.productImage.create({
            data: {
              productId: id,
              url: img.url,
              alt: img.alt ?? null,
              isPrimary: img.isPrimary ?? false,
              sortOrder: img.sortOrder ?? 0,
            },
          });
        }
      }

      // Handle variants
      if (variants) {
        // Delete existing inactive variants (keep ones that might be soft-deleted)
        await tx.productVariant.deleteMany({ where: { productId: id } });
        // Create new variants
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              color: v.color ?? null,
              sku: v.sku ?? null,
              price: v.price ?? null,
              stock: v.stock ?? 0,
              isActive: v.isActive ?? true,
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin product PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/products/[id]
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

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Soft-delete: set isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: { message: "Product deactivated" } });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate product" },
      { status: 500 },
    );
  }
}
