import { adminAuth, successResponse, errorResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────
// DELETE /api/admin/cms/media/[id]
// ──────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await adminAuth();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Media not found", 404);
    }

    await prisma.media.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Admin media [id] DELETE error:", error);
    return errorResponse("Failed to delete media");
  }
}
