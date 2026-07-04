import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Size Guide — ${SITE_NAME}`,
  description:
    "Find your perfect fit with the PEA_FITS size guide. Measurements in centimetres for bust, waist, and hip for sizes XS through 2XL.",
};

// ──────────────────────────────────────────────
// Size chart data (cm)
// ──────────────────────────────────────────────

const SIZE_CHART = [
  { size: "XS", bust: "81-84", waist: "61-64", hip: "89-92" },
  { size: "S", bust: "86-89", waist: "66-69", hip: "94-97" },
  { size: "M", bust: "91-94", waist: "71-74", hip: "99-102" },
  { size: "L", bust: "97-100", waist: "76-79", hip: "104-107" },
  { size: "XL", bust: "102-107", waist: "81-86", hip: "109-114" },
  { size: "2XL", bust: "109-114", waist: "89-94", hip: "117-122" },
];

// ──────────────────────────────────────────────
// Size Guide Page
// ──────────────────────────────────────────────

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-20 bg-white border-b border-border">
        <div className="mx-auto px-5 lg:px-16 max-w-[1440px]">
          <h1 className="display-lg text-primary mb-3">Size Guide</h1>
          <p className="body-md text-text-secondary max-w-lg">
            Find your perfect fit. All measurements are in centimetres (cm).
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto px-5 lg:px-16 max-w-4xl">
          {/* Size Chart Table */}
          <div className="bg-white border border-border rounded-xl overflow-hidden mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-primary uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-primary uppercase tracking-wider">
                    Bust (cm)
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-primary uppercase tracking-wider">
                    Waist (cm)
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-primary uppercase tracking-wider">
                    Hip (cm)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-primary">{row.size}</td>
                    <td className="py-4 px-6 text-secondary">{row.bust}</td>
                    <td className="py-4 px-6 text-secondary">{row.waist}</td>
                    <td className="py-4 px-6 text-secondary">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fit Tips */}
          <div className="space-y-6">
            <h2 className="headline-lg text-primary">Fit Tips</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "How to Measure",
                  items: [
                    "Bust: Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
                    "Waist: Measure around the narrowest part of your natural waistline.",
                    "Hip: Measure around the fullest part of your hips, about 20cm below your waist.",
                  ],
                },
                {
                  title: "Finding Your Size",
                  items: [
                    "If you're between sizes, we recommend sizing up for a more comfortable fit.",
                    "Our bodycon pieces are designed for a close, sculpting fit — if you prefer a relaxed look, consider going up one size.",
                    "For blazers and outerwear, you may want to size up to allow for layering.",
                  ],
                },
                {
                  title: "Fit Variations",
                  items: [
                    "Different styles may fit differently — always check the product description for specific fit notes.",
                    "Items made from stretch fabrics will have more give than structured pieces.",
                    "Tailored pieces (blazers, structured gowns) are designed to fit true to size.",
                  ],
                },
                {
                  title: "Need Help?",
                  items: [
                    "Email us at hello@peafits.com with your measurements and we'll help you find the perfect size.",
                    "Include your height, weight, and usual size in other brands for the best recommendation.",
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-secondary leading-relaxed flex gap-2">
                        <span className="text-primary mt-1 flex-shrink-0" aria-hidden="true">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
