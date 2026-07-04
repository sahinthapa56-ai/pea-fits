import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limit";
import { createPaymentSession, PaymentProvider } from "@/lib/payment";
import { generateOrderNumber } from "@/lib/utils";
import { auth } from "@/lib/auth";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CheckoutBody {
  provider?: PaymentProvider;
}

// ──────────────────────────────────────────────
// Rate limiter
// ──────────────────────────────────────────────

const checkoutLimiter = rateLimiter({ maxRequests: 30, windowMs: 10 * 60 * 1000 });

// ──────────────────────────────────────────────
// POST /api/checkout
// ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const rateCheck = await checkoutLimiter.check(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetIn / 1000).toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Get full user with shipping info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        shippingAddress: true,
        shippingCity: true,
        shippingProvince: true,
        shippingZip: true,
        shippingCountry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            isOnSale: true,
            inStock: true,
            stockQuantity: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        variant: {
          select: {
            id: true,
            size: true,
            color: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 },
      );
    }

    // Parse request body for provider selection
    let body: CheckoutBody = {};
    try {
      body = await request.json();
    } catch {
      // No body is fine — default to Khalti
    }

    const paymentProvider: PaymentProvider = body.provider || "khalti";

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      variantId: string | null;
      name: string;
      size: string | null;
      color: string | null;
      sku: string | null;
      price: number;
      quantity: number;
      imageUrl: string | null;
    }> = [];

    for (const item of cartItems) {
      if (!item.product.inStock || item.product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for "${item.product.name}"` },
          { status: 400 },
        );
      }

      if (item.variant && item.variant.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient variant stock for "${item.product.name}" (${item.variant.size})` },
          { status: 400 },
        );
      }

      const itemPrice = item.variant?.price
        ? Number(item.variant.price)
        : item.product.isOnSale && item.product.salePrice
          ? Number(item.product.salePrice)
          : Number(item.product.basePrice);

      subtotal += itemPrice * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        size: item.variant?.size ?? null,
        color: item.variant?.color ?? null,
        sku: item.variant?.sku ?? null,
        price: itemPrice,
        quantity: item.quantity,
        imageUrl: item.product.images[0]?.url ?? null,
      });
    }

    // Calculate shipping from centralized config
    const { getShippingCost, FREE_SHIPPING_THRESHOLD } = await import("@/config/shipping");
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : getShippingCost(user.shippingProvince ?? "");

    // Calculate tax (13% VAT on subtotal + shipping)
    const TAX_RATE = 0.13;
    const tax = Math.round((subtotal + shippingCost) * TAX_RATE);

    // Calculate total
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            inStock: item.product.stockQuantity - item.quantity > 0,
          },
        });

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          shippingCost,
          tax,
          discount: 0,
          total,
          shippingName: user.name,
          shippingPhone: user.phone,
          shippingAddress: user.shippingAddress,
          shippingCity: user.shippingCity,
          shippingProvince: user.shippingProvince,
          shippingZip: user.shippingZip,
          shippingCountry: user.shippingCountry ?? "Nepal",
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentProvider,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    // Create payment session
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const paymentSession = await createPaymentSession(paymentProvider, {
        amount: total,
        currency: "NPR",
        orderId: order.id,
        orderNumber,
        customerName: user.name || "Customer",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
        successUrl: `${siteUrl}/orders/${order.id}?payment=success`,
        cancelUrl: `${siteUrl}/checkout?payment=cancelled`,
      });

      // Update order with payment reference
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentReference: paymentSession.reference,
          paymentDetails: JSON.stringify({ sessionId: paymentSession.id }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          order,
          payment: {
            url: paymentSession.url,
            reference: paymentSession.reference,
            provider: paymentProvider,
          },
        },
      }, { status: 201 });
    } catch (paymentError) {
      // Payment session creation failed — cancel the order
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", notes: `Payment failed: ${(paymentError as Error).message}` },
      });

      return NextResponse.json(
        { success: false, error: `Payment initiation failed: ${(paymentError as Error).message}` },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Checkout POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process checkout" },
      { status: 500 },
    );
  }
}
