import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^9[78]\d{8}$/, "Please enter a valid Nepali phone number")
    .optional()
    .nullable(),
  shippingAddress: z.string().max(500).optional().nullable(),
  shippingCity: z.string().max(100).optional().nullable(),
  shippingProvince: z.string().max(100).optional().nullable(),
  shippingZip: z.string().max(20).optional().nullable(),
  shippingCountry: z.string().max(100).optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/profile
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        shippingAddress: true,
        shippingCity: true,
        shippingProvince: true,
        shippingZip: true,
        shippingCountry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PATCH /api/profile
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

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat()[0] ?? "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError, fieldErrors },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        shippingAddress: true,
        shippingCity: true,
        shippingProvince: true,
        shippingZip: true,
        shippingCountry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
