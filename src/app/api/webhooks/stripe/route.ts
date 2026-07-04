import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyStripeWebhook } from "@/lib/payment";

// ──────────────────────────────────────────────
// POST /api/webhooks/stripe
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event;
    try {
      event = verifyStripeWebhook(body, signature, secret);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          return NextResponse.json(
            { success: false, error: "Missing orderId in session metadata" },
            { status: 400 }
          );
        }

        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "COMPLETED",
            paymentReference: session.id,
            paymentProvider: "stripe",
            status: "CONFIRMED",
          },
        });

        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const failedSession = event.data.object;
        const failedOrderId = failedSession.metadata?.orderId;

        if (failedOrderId) {
          await prisma.order.update({
            where: { id: failedOrderId },
            data: {
              paymentStatus: "FAILED",
              status: "CANCELLED",
            },
          });
        }
        break;
      }

      default:
        // Other events (e.g., `payment_intent.succeeded`) — ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
