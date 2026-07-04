"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: number }[];
}

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    isOnSale: boolean;
    inStock: boolean;
    images: { id: string; url: string; alt: string | null }[];
  };
  createdAt: string;
}

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
}

// ──────────────────────────────────────────────
// Status Badge
// ──────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800",
      )}
    >
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────
// Tabs
// ──────────────────────────────────────────────

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "settings", label: "Settings" },
  { id: "wishlist", label: "Wishlist" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ──────────────────────────────────────────────
// Profile Page Component
// ──────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("orders");

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Address state
  const [address, setAddress] = useState({
    shippingAddress: "",
    shippingCity: "",
    shippingProvince: "",
    shippingZip: "",
    shippingCountry: "Nepal",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // ── Redirect if not authenticated ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const result = await res.json();
      if (result.success && result.data) {
        setProfile(result.data);
        setSettingsForm({
          name: result.data.name ?? "",
          phone: result.data.phone ?? "",
          email: result.data.email ?? "",
        });
        setAddress({
          shippingAddress: result.data.shippingAddress ?? "",
          shippingCity: result.data.shippingCity ?? "",
          shippingProvince: result.data.shippingProvince ?? "",
          shippingZip: result.data.shippingZip ?? "",
          shippingCountry: result.data.shippingCountry ?? "Nepal",
        });
      } else {
        setProfileError(result.error ?? "Failed to load profile");
      }
    } catch {
      setProfileError("Failed to load profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const result = await res.json();
      if (result.success) {
        setOrders(result.data ?? []);
      } else {
        setOrdersError(result.error ?? "Failed to load orders");
      }
    } catch {
      setOrdersError("Failed to load orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ── Fetch wishlist ──
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/wishlist");
      const result = await res.json();
      if (result.success) {
        setWishlist(result.data ?? []);
      } else {
        setWishlistError(result.error ?? "Failed to load wishlist");
      }
    } catch {
      setWishlistError("Failed to load wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchProfile();
    fetchOrders();
    fetchWishlist();
  }, [status, fetchProfile, fetchOrders, fetchWishlist]);

  // ── Save settings ──
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMessage(null);
    setSettingsError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: settingsForm.name, phone: settingsForm.phone || null }),
      });
      const result = await res.json();
      if (result.success) {
        setSettingsMessage("Profile updated successfully");
        setProfile(result.data);
        await update();
      } else {
        setSettingsError(result.error ?? "Failed to update profile");
      }
    } catch {
      setSettingsError("Failed to update profile. Please try again.");
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Save address ──
  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMessage(null);
    setAddressError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const result = await res.json();
      if (result.success) {
        setAddressMessage("Address updated successfully");
      } else {
        setAddressError(result.error ?? "Failed to update address");
      }
    } catch {
      setAddressError("Failed to update address. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  // ── Remove wishlist item ──
  const removeWishlistItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/profile/wishlist/${itemId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setWishlist((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch {
      // Silently fail
    }
  };

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading profile">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading your suite...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  // ── Render ──
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Member Suite</h1>
              <p className="text-sm text-neutral-500 mt-1">
                Welcome back, {profile?.name ?? session?.user?.name ?? "Member"}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-neutral-500 hover:text-black underline underline-offset-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 -mb-px" role="tablist" aria-label="Profile sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div role="tabpanel" id="panel-orders" aria-labelledby="tab-orders">
            <h2 className="text-lg font-semibold mb-6">Order History</h2>

            {ordersLoading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              </div>
            )}

            {ordersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {ordersError}
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-neutral-500 text-sm">No orders yet</p>
                <Link href="/collections" className="inline-block mt-4 text-sm text-black underline underline-offset-2">
                  Start shopping
                </Link>
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-neutral-200 rounded-lg p-4 sm:p-6 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm text-black">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="font-medium text-black">
                        रु {Number(order.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {activeTab === "addresses" && (
          <div role="tabpanel" id="panel-addresses" aria-labelledby="tab-addresses">
            <h2 className="text-lg font-semibold mb-6">Shipping Address</h2>

            {profileLoading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              </div>
            )}

            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {profileError}
              </div>
            )}

            {addressMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
                {addressMessage}
              </div>
            )}

            {addressError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
                {addressError}
              </div>
            )}

            {!profileLoading && (
              <form onSubmit={saveAddress} className="max-w-lg space-y-4">
                <Input
                  label="Address"
                  placeholder="Street, building, area"
                  value={address.shippingAddress}
                  onChange={(e) => setAddress((a) => ({ ...a, shippingAddress: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Kathmandu"
                    value={address.shippingCity}
                    onChange={(e) => setAddress((a) => ({ ...a, shippingCity: e.target.value }))}
                  />
                  <Input
                    label="Province"
                    placeholder="Bagmati Province"
                    value={address.shippingProvince}
                    onChange={(e) => setAddress((a) => ({ ...a, shippingProvince: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP / Postal Code"
                    placeholder="44600"
                    value={address.shippingZip}
                    onChange={(e) => setAddress((a) => ({ ...a, shippingZip: e.target.value }))}
                  />
                  <Input
                    label="Country"
                    value={address.shippingCountry}
                    onChange={(e) => setAddress((a) => ({ ...a, shippingCountry: e.target.value }))}
                  />
                </div>
                <Button type="submit" variant="primary" size="md" loading={addressSaving}>
                  Save Address
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && (
          <div role="tabpanel" id="panel-settings" aria-labelledby="tab-settings">
            <h2 className="text-lg font-semibold mb-6">Account Settings</h2>

            {profileLoading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              </div>
            )}

            {settingsMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
                {settingsMessage}
              </div>
            )}
            {settingsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
                {settingsError}
              </div>
            )}

            {!profileLoading && (
              <form onSubmit={saveSettings} className="max-w-lg space-y-4">
                <Input
                  label="Full Name"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm((s) => ({ ...s, name: e.target.value }))}
                />
                <Input
                  label="Email"
                  type="email"
                  value={settingsForm.email}
                  disabled
                  hint="Email cannot be changed"
                />
                <Input
                  label="Phone"
                  placeholder="98XXXXXXXX"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm((s) => ({ ...s, phone: e.target.value }))}
                  hint="Nepali mobile number (98XXXXXXXX or 97XXXXXXXX)"
                />
                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md" loading={settingsSaving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* Password Change Link */}
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h3 className="text-base font-medium mb-2">Password</h3>
              <p className="text-sm text-neutral-500 mb-4">
                To change your password, use the password reset option.
              </p>
              <Link
                href="/reset-password"
                className="text-sm text-black underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Reset password
              </Link>
            </div>
          </div>
        )}

        {/* ── Wishlist Tab ── */}
        {activeTab === "wishlist" && (
          <div role="tabpanel" id="panel-wishlist" aria-labelledby="tab-wishlist">
            <h2 className="text-lg font-semibold mb-6">My Wishlist</h2>

            {wishlistLoading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              </div>
            )}

            {wishlistError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {wishlistError}
              </div>
            )}

            {!wishlistLoading && !wishlistError && wishlist.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <p className="text-neutral-500 text-sm">Your wishlist is empty</p>
                <Link href="/collections" className="inline-block mt-4 text-sm text-black underline underline-offset-2">
                  Browse products
                </Link>
              </div>
            )}

            {!wishlistLoading && !wishlistError && wishlist.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-neutral-100 flex items-center justify-center">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.images[0].alt ?? item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/products/${item.product.slug}`} className="block">
                        <h3 className="text-sm font-medium text-black hover:underline">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-black mt-1">
                        रु{" "}
                        {(
                          item.product.isOnSale && item.product.salePrice
                            ? item.product.salePrice
                            : item.product.basePrice
                        ).toLocaleString("en-IN")}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-black text-white hover:opacity-90 text-xs"
                          disabled={!item.product.inStock}
                        >
                          {item.product.inStock ? "Add to Bag" : "Out of Stock"}
                        </Button>
                        <button
                          onClick={() => removeWishlistItem(item.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${item.product.name} from wishlist`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
