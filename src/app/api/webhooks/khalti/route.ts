import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyKhaltiPayment } from "@/lib/payment";

// ──────────────────────────────────────────────
// POST /api/webhooks/khalti
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pidx, purchase_order_id } = body;

    if (!pidx || !purchase_order_id) {
      return NextResponse.json(
        { success: false, error: "Missing pidx or purchase_order_id" },
        { status: 400 }
      );
    }

    // Verify the payment status with Khalti API
    const verification = await verifyKhaltiPayment(pidx);

    // Find order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber: purchase_order_id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (verification.status === "Completed") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "COMPLETED",
          paymentReference: pidx,
          paymentProvider: "khalti",
          status: "CONFIRMED",
          paymentDetails: verification.transactionId
            ? JSON.stringify({ transactionId: verification.transactionId })
            : undefined,
        },
      });
    } else if (verification.status === "Failed" || verification.status === "Refunded") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: verification.status === "Refunded" ? "REFUNDED" : "FAILED",
          status: verification.status === "Refunded" ? "REFUNDED" : "CANCELLED",
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Khalti webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
