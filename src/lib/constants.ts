// ──────────────────────────────────────────────
// Site-wide constants
// ──────────────────────────────────────────────

/** Shipping cost within Kathmandu Valley (NPR) */
export const SHIPPING_COST_VALLEY = 200;

/** Shipping cost outside Kathmandu Valley (NPR) */
export const SHIPPING_COST_OUTSIDE = 500;

/** Order subtotal threshold for free shipping (NPR) */
export const FREE_SHIPPING_THRESHOLD = 5000;

/** Value-Added Tax rate (13%) */
export const VAT_RATE = 0.13;

/** General tax rate (same as VAT for Nepal) */
export const TAX_RATE = 0.13;

/** Site display name */
export const SITE_NAME = "PEA_FITS";

/** Prefix for order numbers */
export const ORDER_PREFIX = "PF";

/** Current operational year */
export const CURRENT_YEAR = 2026;

/** Maximum quantity of a single item in the cart */
export const MAX_CART_QUANTITY = 10;

/** Minimum quantity of a single item in the cart */
export const MIN_CART_QUANTITY = 1;

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 12;

/** Maximum file upload size (in bytes) — 5 MB */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

/** Supported image upload formats */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/** Locale for number/date formatting */
export const LOCALE = "en-IN";

/** Currency code */
export const CURRENCY = "NPR";

/** Currency symbol */
export const CURRENCY_SYMBOL = "रु";

/** Site URLs */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Routes */
export const ROUTES = {
  HOME: "/",
  SHOP: "/products",
  COLLECTIONS: "/collections",
  JOURNAL: "/journal",
  STORY: "/story",
  CONTACT: "/contact",
  SEARCH: "/search",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  ORDERS: "/orders",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_COLLECTIONS: "/admin/collections",
  ADMIN_JOURNAL: "/admin/journal",
  ADMIN_BRAND_BOOK: "/admin/brand-book",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_USERS: "/admin/users",
} as const;

/** Navigation links (primary) — per spec */
export const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/collections?filter=new" },
  { label: "The Archive", href: "/collections?filter=archive" },
  { label: "Journal", href: "/journal" },
] as const;

/** Footer column links */
export const FOOTER_SHOP_LINKS = [
  { label: "New Arrivals", href: "/collections?filter=new" },
  { label: "Collections", href: "/collections" },
  { label: "The Archive", href: "/collections?filter=archive" },
  { label: "Accessories", href: "/collections?filter=accessories" },
] as const;

export const FOOTER_INFO_LINKS = [
  { label: "The Story", href: "/story" },
  { label: "Sustainability", href: "/story#sustainability" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Journal", href: "/journal" },
] as const;

export const FOOTER_SUPPORT_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Privacy Policy", href: "/privacy" },
] as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/pea_fits",
  facebook: "https://facebook.com/peafits",
  tiktok: "https://tiktok.com/@peafits",
} as const;
