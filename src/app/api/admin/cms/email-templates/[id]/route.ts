import { z } from "zod";
import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const updateEmailTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  htmlBody: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

// ──────────────────────────────────────────────
// GET /api/admin/cms/email-templates/[id]
// ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const template = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!template) {
      return errorResponse("Email template not found", 404);
    }

    return successResponse(template);
  } catch (error) {
    console.error("Admin email-templates [id] GET error:", error);
    return errorResponse("Failed to fetch email template");
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/cms/email-templates/[id]
// ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Email template not found", 404);
    }

    const body = await request.json();
    const parsed = updateEmailTemplateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Invalid input";
      return errorResponse(firstError, 400);
    }

    // If name is being changed, check uniqueness
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await prisma.emailTemplate.findUnique({
        where: { name: parsed.data.name },
      });
      if (duplicate) {
        return errorResponse("An email template with this name already exists", 409);
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(template);
  } catch (error) {
    console.error("Admin email-templates [id] PUT error:", error);
    return errorResponse("Failed to update email template");
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/email-templates/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Email template not found", 404);
    }

    await prisma.emailTemplate.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin email-templates [id] DELETE error:", error);
    return errorResponse("Failed to delete email template");
  }
}
