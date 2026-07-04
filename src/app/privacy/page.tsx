import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
  description: `Read the ${SITE_NAME} privacy policy to understand how we collect, use, and protect your personal information.`,
};

// ──────────────────────────────────────────────
// Privacy Policy Page
// ──────────────────────────────────────────────

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-20 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <h1 className="display-lg text-primary mb-3">Privacy Policy</h1>
          <p className="body-md text-text-secondary max-w-lg">
            How we handle your data and protect your privacy.
          </p>
          <p className="text-xs text-text-secondary mt-4">Last updated: January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto px-5 lg:px-16 max-w-3xl">
          <div className="prose prose-sm max-w-none text-secondary space-y-6">
            <h2 className="headline-lg text-primary">1. Introduction</h2>
            <p className="text-sm leading-relaxed">
              {SITE_NAME} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
              or make a purchase from us.
            </p>

            <h2 className="headline-lg text-primary">2. Information We Collect</h2>
            <p className="text-sm leading-relaxed">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Personal Identification Information:</strong> Name, email address, phone number, shipping address, billing address.</li>
              <li><strong>Account Information:</strong> Username, password, order history, wishlist items.</li>
              <li><strong>Payment Information:</strong> Credit/debit card details (processed securely by our payment partners — we do not store full card numbers).</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies, and usage data.</li>
            </ul>

            <h2 className="headline-lg text-primary">3. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To process and fulfil your orders, including shipping and payment processing.</li>
              <li>To communicate with you about your orders, account, and inquiries.</li>
              <li>To send you marketing communications (with your consent) about new collections, promotions, and editorial content.</li>
              <li>To improve our website, products, and customer experience.</li>
              <li>To comply with legal obligations and prevent fraud.</li>
            </ul>

            <h2 className="headline-lg text-primary">4. Data Sharing and Disclosure</h2>
            <p className="text-sm leading-relaxed">
              We do not sell your personal information to third parties. We may share your data with trusted service providers who
              assist us in operating our website and conducting our business, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Payment processors (e.g., eSewa, Fonepay)</li>
              <li>Shipping and logistics partners</li>
              <li>Email and communication platforms</li>
              <li>Analytics and marketing tools</li>
            </ul>
            <p className="text-sm leading-relaxed">
              These service providers are contractually obligated to keep your information confidential and use it only for the
              purposes for which we disclose it to them.
            </p>

            <h2 className="headline-lg text-primary">5. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal information against
              unauthorised access, alteration, disclosure, or destruction. All sensitive data is transmitted using SSL/TLS encryption.
            </p>

            <h2 className="headline-lg text-primary">6. Your Rights</h2>
            <p className="text-sm leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your data (subject to legal retention requirements).</li>
              <li>Withdraw consent for marketing communications at any time.</li>
              <li>Lodge a complaint with a data protection authority.</li>
            </ul>

            <h2 className="headline-lg text-primary">7. Cookies</h2>
            <p className="text-sm leading-relaxed">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and
              understand where our visitors come from. You can control cookie preferences through your browser settings.
            </p>

            <h2 className="headline-lg text-primary">8. Third-Party Links</h2>
            <p className="text-sm leading-relaxed">
              Our website may contain links to third-party websites (e.g., social media platforms, payment gateways). We are not
              responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2 className="headline-lg text-primary">9. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <p className="text-sm leading-relaxed">
              Email: <a href="mailto:hello@peafits.com" className="text-primary underline underline-offset-2">hello@peafits.com</a>
            </p>

            <h2 className="headline-lg text-primary">10. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy
              on this page and updating the &ldquo;Last updated&rdquo; date at the top.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
