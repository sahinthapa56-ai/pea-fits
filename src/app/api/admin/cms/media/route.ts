import { NextRequest } from "next/server";
import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createMediaSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().int().min(0, "Size must be non-negative"),
  url: z.string().min(1, "URL is required"),
  width: z.number().int().min(0).optional().nullable(),
  height: z.number().int().min(0).optional().nullable(),
  alt: z.string().optional().nullable(),
  folder: z.string().optional().nullable(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/media
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      data: media,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Admin media GET error:", error);
    return errorResponse("Failed to fetch media");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/media
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createMediaSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    const media = await prisma.media.create({
      data: parsed.data,
    });

    return successResponse(media, 201);
  } catch (error) {
    console.error("Admin media POST error:", error);
    return errorResponse("Failed to create media");
  }
}
