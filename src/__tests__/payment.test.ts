import { describe, it, expect, vi, beforeEach } from "vitest";

// The payment module creates Stripe instances internally and makes real fetch
// calls. We mock those external dependencies to test the routing logic.

// Mock Stripe constructor
vi.mock("stripe", () => {
  const mockCheckoutSession = {
    id: "cs_test_mock",
    url: "https://checkout.stripe.com/mock",
  };

  const MockStripe = function MockStripe() {
    return {
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue(mockCheckoutSession),
        },
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
    };
  };

  return {
    default: MockStripe,
    Stripe: MockStripe,
  };
});

// Mock global.fetch for Khalti API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { createPaymentSession } from "@/lib/payment";

describe("Payment Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set required env vars
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
    process.env.KHALTI_SECRET_KEY = "khalti_test_mock";
  });

  describe("createPaymentSession", () => {
    const baseParams = {
      amount: 5000,
      currency: "NPR",
      orderId: "order-123",
      orderNumber: "PF-2026-0001",
      customerName: "Test User",
      customerEmail: "test@example.com",
      customerPhone: "9812345678",
      successUrl: "http://localhost:3000/success",
      cancelUrl: "http://localhost:3000/cancel",
    };

    it("routes to Stripe when provider is 'stripe'", async () => {
      const result = await createPaymentSession("stripe", baseParams);

      expect(result.id).toBe("cs_test_mock");
      expect(result.url).toBe("https://checkout.stripe.com/mock");
    });

    it("routes to Khalti when provider is 'khalti'", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pidx: "pidx_mock_123",
          payment_url: "https://khalti.com/payment/pidx_mock_123",
        }),
      });

      const result = await createPaymentSession("khalti", baseParams);

      expect(result.id).toBe("pidx_mock_123");
      expect(result.url).toBe("https://khalti.com/payment/pidx_mock_123");
      expect(result.reference).toBe("pidx_mock_123");

      // Verify Khalti API was called
      expect(mockFetch).toHaveBeenCalledWith(
        "https://khalti.com/api/v2/payment/initiate/",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("throws for unsupported provider", async () => {
      await expect(
        createPaymentSession("unknown" as any, baseParams),
      ).rejects.toThrow("Unsupported payment provider: unknown");
    });

    it("handles Khalti API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Invalid request" }),
      });

      await expect(
        createPaymentSession("khalti", baseParams),
      ).rejects.toThrow("Khalti payment initiation failed");
    });
  });
});
