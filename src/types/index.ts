// ──────────────────────────────────────────────
// Core Prisma types re-exported for frontend use
// ──────────────────────────────────────────────

export type {
  User,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Collection,
  CollectionItem,
  CartItem,
  Order,
  OrderItem,
  Review,
  JournalArticle,
  BrandBookSection,
  SiteSettings,
} from "@prisma/client";

// Prisma enum types re-defined locally for frontend use.
// These mirror the Prisma schema enums so we avoid cross-boundary type issues.

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export type Role =
  | "CUSTOMER"
  | "ADMIN"
  | "SUPER_ADMIN";

// ──────────────────────────────────────────────
// API response wrappers
// ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

// ──────────────────────────────────────────────
// Cart related
// ──────────────────────────────────────────────

export interface CartItemWithProduct {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    isOnSale: boolean;
    inStock: boolean;
    stockQuantity: number;
    images: {
      id: string;
      url: string;
      alt: string | null;
      isPrimary: boolean;
    }[];
  };
  variant: {
    id: string;
    size: string;
    color: string | null;
    price: number | null;
    stock: number;
  } | null;
}

// ──────────────────────────────────────────────
// Shared frontend types
// ──────────────────────────────────────────────

export interface AddressInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

export interface ShippingRate {
  zone: string;
  cost: number;
  estimatedDays: string;
}

export interface ProductFilters {
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sortBy?: "price-asc" | "price-desc" | "newest" | "name-asc" | "name-desc";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface SiteMetadata {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}
