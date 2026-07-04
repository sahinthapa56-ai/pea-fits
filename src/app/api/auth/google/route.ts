import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

// ──────────────────────────────────────────────
// POST /api/auth/google
// ──────────────────────────────────────────────

export async function POST() {
  try {
    await signIn("google", { redirect: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google sign-in error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate Google sign in" },
      { status: 500 },
    );
  }
}
