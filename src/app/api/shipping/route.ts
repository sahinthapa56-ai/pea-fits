import { NextResponse } from "next/server";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

// ──────────────────────────────────────────────
// GET /api/shipping
// ──────────────────────────────────────────────

export async function GET() {
  try {
    const rates = [
      {
        zone: "Standard",
        cost: 250,
        estimatedDays: "5-7 business days",
        description: "Standard delivery across Nepal",
      },
      {
        zone: "Express",
        cost: 600,
        estimatedDays: "2-3 business days",
        description: "Express delivery to major cities",
      },
      {
        zone: "Free",
        cost: 0,
        estimatedDays: "5-7 business days",
        description: `Free standard delivery on orders above Rs ${FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}`,
        minOrderAmount: FREE_SHIPPING_THRESHOLD,
      },
    ];

    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    console.error("Shipping GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipping rates" },
      { status: 500 },
    );
  }
}
