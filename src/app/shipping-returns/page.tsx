import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Shipping & Returns — ${SITE_NAME}`,
  description:
    "Learn about PEA_FITS shipping policy, delivery times, and return process. Free shipping on orders above रु 15,000 within Nepal.",
};

// ──────────────────────────────────────────────
// Shipping & Returns Page
// ──────────────────────────────────────────────

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-20 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <h1 className="display-lg text-primary mb-3">Shipping & Returns</h1>
          <p className="body-md text-text-secondary max-w-lg">
            Everything you need to know about delivery and returns.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto px-5 lg:px-16 max-w-3xl">
          {/* Shipping */}
          <div className="mb-16">
            <h2 className="headline-lg text-primary mb-6">Shipping Policy</h2>

            <div className="space-y-6 text-sm text-secondary leading-relaxed">
              <p>
                We offer delivery across all provinces of Nepal. Orders are processed within 1-3 business days
                after payment confirmation.
              </p>

              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Shipping Rates
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-primary">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-primary">Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-primary">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 text-secondary">Standard Shipping</td>
                      <td className="py-3 px-4 text-primary">रु 250</td>
                      <td className="py-3 px-4 text-secondary">3-5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-secondary">Express Shipping</td>
                      <td className="py-3 px-4 text-primary">रु 600</td>
                      <td className="py-3 px-4 text-secondary">1-2 business days</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-secondary">Free Shipping</td>
                      <td className="py-3 px-4 text-green-600">Free</td>
                      <td className="py-3 px-4 text-secondary">3-5 business days (on orders above रु 15,000)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mt-8 mb-3">
                Processing Time
              </h3>
              <p>
                All orders are processed within 1-3 business days. During peak seasons or promotional periods,
                processing may take slightly longer. You will receive a confirmation email once your order has
                been shipped, along with tracking information.
              </p>

              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mt-8 mb-3">
                Delivery Areas
              </h3>
              <p>
                We deliver to all 7 provinces of Nepal, including Kathmandu Valley and remote districts.
                Delivery times may vary depending on your location and the shipping method selected.
              </p>
            </div>
          </div>

          {/* Returns */}
          <div>
            <h2 className="headline-lg text-primary mb-6">Returns & Exchanges</h2>

            <div className="space-y-6 text-sm text-secondary leading-relaxed">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Return Policy
              </h3>
              <p>
                We accept returns within <strong>7 days</strong> of delivery for unworn, unwashed items in
                their original packaging with all tags attached. Items must be free of any stains, odours,
                or signs of wear.
              </p>

              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mt-8 mb-3">
                Non-Returnable Items
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sale or clearance items</li>
                <li>Accessories (earrings, hair accessories, etc.)</li>
                <li>Intimate apparel (lingerie, bodysuits)</li>
                <li>Items damaged due to improper use</li>
              </ul>

              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mt-8 mb-3">
                How to Initiate a Return
              </h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Contact us at <a href="mailto:hello@peafits.com" className="text-primary underline underline-offset-2">hello@peafits.com</a> within 7 days of receiving your order.</li>
                <li>Include your order number and reason for return.</li>
                <li>Our team will provide you with the return address and instructions.</li>
                <li>Pack the item securely with all original packaging and tags.</li>
                <li>Ship the item back to us. Return shipping costs are borne by the customer unless the item is defective or incorrect.</li>
              </ol>

              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mt-8 mb-3">
                Refunds
              </h3>
              <p>
                Once we receive and inspect the returned item, we will process your refund within 5-7 business days.
                Refunds are issued to the original payment method. Shipping charges are non-refundable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
