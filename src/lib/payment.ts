import Stripe from "stripe";

// ──────────────────────────────────────────────
// Payment Provider Factory
// ──────────────────────────────────────────────

export interface PaymentSession {
  id: string;
  url: string | null;
  reference: string;
}

export interface PaymentConfig {
  enabled: boolean;
  provider: string;
  publicKey?: string;
}

/**
 * Create a Stripe payment session
 */
export async function createStripeSession(
  amount: number,           // in NPR (paisa-decimal handled internally)
  currency: string,
  orderId: string,
  orderNumber: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<PaymentSession> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase() === "npr" ? "usd" : currency.toLowerCase(),
          product_data: {
            name: `Order ${orderNumber}`,
          },
          unit_amount: Math.round(amount * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      orderId,
      orderNumber,
    },
  });

  return {
    id: session.id,
    url: session.url,
    reference: session.id,
  };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
  });
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// ──────────────────────────────────────────────
// Khalti Payment Integration
// ──────────────────────────────────────────────

/**
 * Create a Khalti payment request
 * Khalti API: https://docs.khalti.com/checkout/
 */
export async function createKhaltiSession(
  amount: number,          // in paisa (1 NPR = 100 paisa)
  orderId: string,
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  returnUrl: string
): Promise<PaymentSession> {
  const khaltiSecretKey = process.env.KHALTI_SECRET_KEY!;

  const response = await fetch("https://khalti.com/api/v2/payment/initiate/", {
    method: "POST",
    headers: {
      Authorization: `Key ${khaltiSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: returnUrl,
      website_url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      amount: Math.round(amount * 100), // Khalti expects paisa
      purchase_order_id: orderNumber,
      purchase_order_name: `Order ${orderNumber}`,
      customer_info: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Khalti payment initiation failed: ${error.detail || error.message || "Unknown error"}`);
  }

  const data = await response.json();

  return {
    id: data.pidx,
    url: data.payment_url,
    reference: data.pidx,
  };
}

/**
 * Verify Khalti payment status
 */
export async function verifyKhaltiPayment(pidx: string): Promise<{
  status: string;
  transactionId: string | null;
}> {
  const khaltiSecretKey = process.env.KHALTI_SECRET_KEY!;

  const response = await fetch("https://khalti.com/api/v2/payment/lookup/", {
    method: "POST",
    headers: {
      Authorization: `Key ${khaltiSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  if (!response.ok) {
    throw new Error("Failed to verify Khalti payment");
  }

  const data = await response.json();
  return {
    status: data.status, // "Completed", "Pending", "Failed", "Refunded"
    transactionId: data.transaction_id || null,
  };
}

// ──────────────────────────────────────────────
// Payment Router
// ──────────────────────────────────────────────

export type PaymentProvider = "stripe" | "khalti";

/**
 * Create a payment session using the active provider
 */
export async function createPaymentSession(
  provider: PaymentProvider,
  params: {
    amount: number;
    currency: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    successUrl: string;
    cancelUrl: string;
  }
): Promise<PaymentSession> {
  switch (provider) {
    case "stripe":
      return createStripeSession(
        params.amount,
        params.currency,
        params.orderId,
        params.orderNumber,
        params.customerEmail,
        params.successUrl,
        params.cancelUrl
      );
    case "khalti":
      return createKhaltiSession(
        params.amount,
        params.orderId,
        params.orderNumber,
        params.customerName,
        params.customerEmail,
        params.customerPhone,
        params.successUrl
      );
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
