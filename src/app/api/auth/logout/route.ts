import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

// ──────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 },
    );
  }
}
