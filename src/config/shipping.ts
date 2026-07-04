// ──────────────────────────────────────────────
// Centralized Shipping & Tax Configuration
// This replaces the scattered constants in
// constants.ts, utils.ts, and checkout/route.ts
// ──────────────────────────────────────────────

export type ShippingZone = "valley" | "outside_valley";

/**
 * Shipping zones with their display names
 */
export const SHIPPING_ZONES: Record<ShippingZone, string> = {
  valley: "Kathmandu Valley",
  outside_valley: "Outside Kathmandu Valley",
};

/**
 * Free shipping threshold (NPR)
 * Orders at or above this amount get free shipping
 */
export const FREE_SHIPPING_THRESHOLD = 5000;

/**
 * Base shipping costs (NPR)
 */
export const SHIPPING_COSTS = {
  valley: 200,
  outside_valley: 500,
} as const;

/**
 * Provinces within Kathmandu Valley
 */
const VALLEY_PROVINCES = ["Bagmati", "bagmati", "Kathmandu", "kathmandu", "Lalitpur", "lalitpur", "Bhaktapur", "bhaktapur"];

/**
 * Determine shipping zone based on province
 */
export function getShippingZone(province: string): ShippingZone {
  if (VALLEY_PROVINCES.includes(province)) return "valley";
  return "outside_valley";
}

/**
 * Get shipping cost for a given province/zone
 */
export function getShippingCost(province: string): number {
  const zone = getShippingZone(province);
  return SHIPPING_COSTS[zone];
}

/**
 * Value-Added Tax rate (13% for Nepal)
 */
export const VAT_RATE = 0.13;

/**
 * Calculate tax for a given subtotal and shipping cost
 */
export function calculateTax(subtotal: number, shippingCost: number): number {
  return Math.round((subtotal + shippingCost) * VAT_RATE);
}

/**
 * Format a price in NPR
 */
export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return "रु 0";
  return `रु ${numericPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format a price with decimal places
 */
export function formatPriceDecimal(price: number | string): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return "रु 0.00";
  return `रु ${numericPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
