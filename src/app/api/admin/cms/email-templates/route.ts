import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const createEmailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  htmlBody: z.string().min(1, "HTML body is required"),
  isActive: z.boolean().optional().default(true),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/email-templates
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
    });

    return successResponse(templates);
  } catch (error) {
    console.error("Admin email-templates GET error:", error);
    return errorResponse("Failed to fetch email templates");
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/cms/email-templates
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const parsed = createEmailTemplateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // Check for unique name
    const existing = await prisma.emailTemplate.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return errorResponse("An email template with this name already exists", 409);
    }

    const template = await prisma.emailTemplate.create({
      data: parsed.data,
    });

    return successResponse(template, 201);
  } catch (error) {
    console.error("Admin email-templates POST error:", error);
    return errorResponse("Failed to create email template");
  }
}
