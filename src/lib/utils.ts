import { type ClassValue, clsx } from "clsx";

/**
 * Combine class names, merging Tailwind classes intelligently.
 * Uses clsx under the hood — extend with tailwind-merge if needed.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a number as NPR currency: रु 3,400
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
 * Format a number with decimal places for precise display.
 */
export function formatPriceDecimal(price: number | string): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return "रु 0.00";

  return `रु ${numericPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate an order number: PF-2026-XXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PF-${year}-${random}`;
}

/**
 * Generate a URL-safe slug from text.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Validate a Nepali phone number (10 digits, starting with 98 or 97).
 */
export function validateNepaliPhone(phone: string): boolean {
  return /^9[78]\d{8}$/.test(phone.replace(/[\s-]/g, ""));
}

/**
 * Truncate text to a given length, appending ellipsis if trimmed.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object).
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value as object).length === 0;
  return false;
}

/**
 * Delay execution (useful for animations or rate-limiting).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse a JSON string safely, returning a fallback on failure.
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Build a URL query string from an object, skipping undefined/null values.
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ──────────────────────────────────────────────
// Nepal location data
// ──────────────────────────────────────────────

export const NEPALI_PROVINCES = [
  "Province No. 1",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
] as const;

export const NEPALI_DISTRICTS: Record<string, string[]> = {
  "Province No. 1": [
    "Taplejung", "Sankhuwasabha", "Solukhumbu", "Khotang", "Bhojpur",
    "Dhankuta", "Terhathum", "Panchthar", "Ilam", "Jhapa",
    "Morang", "Sunsari", "Udayapur", "Okhaldhunga",
  ],
  "Madhesh Province": [
    "Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi",
    "Bara", "Parsa", "Rautahat",
  ],
  "Bagmati Province": [
    "Dolakha", "Sindhupalchok", "Rasuwa", "Dhading", "Nuwakot",
    "Kathmandu", "Bhaktapur", "Lalitpur", "Kavrepalanchok",
    "Makwanpur", "Ramechhap", "Sindhuli", "Chitwan",
  ],
  "Gandaki Province": [
    "Gorkha", "Manang", "Mustang", "Myagdi", "Kaski",
    "Lamjung", "Tanahun", "Syangja", "Nawalpur", "Parbat",
    "Baglung",
  ],
  "Lumbini Province": [
    "Rupandehi", "Kapilvastu", "Palpa", "Arghakhanchi", "Gulmi",
    "Nawalparasi (West)", "Dang", "Pyuthan", "Rolpa", "Banke",
    "Bardiya", "East Rukum",
  ],
  "Karnali Province": [
    "West Rukum", "Salyan", "Surkhet", "Dailekh", "Jajarkot",
    "Dolpa", "Jumla", "Kalikot", "Mugu", "Humla",
  ],
  "Sudurpashchim Province": [
    "Bajura", "Bajhang", "Achham", "Doti", "Kailali",
    "Kanchanpur", "Dadeldhura", "Baitadi", "Darchula",
  ],
};

export interface ShippingZone {
  name: string;
  cost: number;
  districts: string[];
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: "Kathmandu Valley",
    cost: 200,
    districts: ["Kathmandu", "Lalitpur", "Bhaktapur"],
  },
  {
    name: "Outside Valley",
    cost: 500,
    districts: NEPALI_DISTRICTS["Bagmati Province"].filter(
      (d) => !["Kathmandu", "Lalitpur", "Bhaktapur"].includes(d),
    ),
  },
  {
    name: "Province No. 1",
    cost: 500,
    districts: NEPALI_DISTRICTS["Province No. 1"],
  },
  {
    name: "Madhesh Province",
    cost: 500,
    districts: NEPALI_DISTRICTS["Madhesh Province"],
  },
  {
    name: "Gandaki Province",
    cost: 500,
    districts: NEPALI_DISTRICTS["Gandaki Province"],
  },
  {
    name: "Lumbini Province",
    cost: 500,
    districts: NEPALI_DISTRICTS["Lumbini Province"],
  },
  {
    name: "Karnali Province",
    cost: 500,
    districts: NEPALI_DISTRICTS["Karnali Province"],
  },
  {
    name: "Sudurpashchim Province",
    cost: 500,
    districts: NEPALI_DISTRICTS["Sudurpashchim Province"],
  },
];

/**
 * Get shipping cost for a given district.
 */
export function getShippingCost(district: string): number {
  const zone = SHIPPING_ZONES.find((z) => z.districts.includes(district));
  return zone?.cost ?? 500;
}
