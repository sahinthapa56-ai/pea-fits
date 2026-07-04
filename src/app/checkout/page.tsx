"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore, getSubtotal } from "@/store/cart-store";
import { NEPALI_PROVINCES } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
}

interface FormErrors {
  [key: string]: string;
}

// ──────────────────────────────────────────────
// Step Indicator
// ──────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Shipping" },
  { num: 2, label: "Method" },
  { num: 3, label: "Payment" },
] as const;

function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <nav aria-label="Checkout progress" className="mb-10">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, idx) => (
          <li key={step.num} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep === step.num
                    ? "bg-primary text-on-primary"
                    : currentStep > step.num
                      ? "bg-green-600 text-white"
                      : "bg-neutral-200 text-neutral-500",
                )}
                aria-current={currentStep === step.num ? "step" : undefined}
              >
                {currentStep > step.num ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.num
                )}
              </span>
              <span
                className={cn(
                  "text-sm hidden sm:inline",
                  currentStep === step.num ? "text-primary font-medium" : "text-text-secondary",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn("w-8 sm:w-16 h-px", currentStep > step.num ? "bg-green-600" : "bg-border")} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ──────────────────────────────────────────────
// Checkout Page
// ──────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items } = useCartStore();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Step 1: Shipping info
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    zip: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Step 2: Shipping method
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  // Step 3: Payment method
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Pre-fill from profile if available
  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileError(null);
        try {
          const res = await fetch("/api/profile");
          if (!res.ok) throw new Error("Failed to load profile");
          const result = await res.json();
          if (result.success && result.data) {
            setShipping({
              fullName: result.data.name ?? session.user?.name ?? "",
              email: result.data.email ?? session.user?.email ?? "",
              phone: result.data.phone ?? "",
              address: result.data.shippingAddress ?? "",
              city: result.data.shippingCity ?? "",
              province: result.data.shippingProvince ?? "",
              zip: result.data.shippingZip ?? "",
            });
          }
        } catch {
          setProfileError("Could not load your profile. You can still fill in your details manually.");
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    }
  }, [session]);

  // Redirect if cart is empty
  useEffect(() => {
    if (status !== "loading" && items.length === 0) {
      router.replace("/bag");
    }
  }, [items, status, router]);

  // Loading state while auth is resolving
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading checkout">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Sign in required</h1>
        <p className="text-sm text-text-secondary mb-6">Please sign in to continue with checkout.</p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Your cart is empty</h1>
        <p className="text-sm text-text-secondary mb-6">Add some items to your bag before checking out.</p>
        <Link
          href="/collections"
          className="px-6 py-2.5 bg-primary text-on-primary text-label-caps rounded-xl hover:opacity-90 transition-colors"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal(items);
  const shippingCost = shippingMethod === "express" ? 600 : 250;
  const finalShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;
  const estimatedTotal = subtotal + finalShipping;

  // ── Step 1 validation ──
  const validateStep1 = (): boolean => {
    const errs: FormErrors = {};
    if (!shipping.fullName.trim()) errs.fullName = "Full name is required";
    if (!shipping.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errs.email = "Invalid email address";
    if (!shipping.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^9[78]\d{8}$/.test(shipping.phone.replace(/[\s-]/g, ""))) errs.phone = "Enter a valid Nepali phone number (98XXXXXXXX)";
    if (!shipping.address.trim()) errs.address = "Address is required";
    if (!shipping.city.trim()) errs.city = "City is required";
    if (!shipping.province.trim()) errs.province = "Province is required";
    if (!shipping.zip.trim()) errs.zip = "ZIP code is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToMethod = () => {
    if (validateStep1()) setStep(2);
  };

  const handleContinueToPayment = () => {
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: shipping,
          shippingMethod,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingCost: finalShipping,
          total: estimatedTotal,
        }),
      });

      const result = await res.json();
      if (result.success && result.data?.orderId) {
        router.push(`/orders/${result.data.orderId}/confirmation`);
      } else {
        setError(result.error ?? "Failed to place order. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showFreeShipping = subtotal < FREE_SHIPPING_THRESHOLD;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-5 lg:px-16 max-w-[1440px] py-8 lg:py-12">
        {/* Page heading */}
        <h1 className="display-lg text-primary mb-2">Checkout</h1>
        <p className="body-md text-text-secondary mb-8">Complete your order.</p>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* ── Form Area ── */}
          <div className="lg:col-span-2">
            {/* ════════════════════════════════════
                Step 1: Shipping Info
                ════════════════════════════════════ */}
            {step === 1 && (
              <div className="bg-white border border-border rounded-xl p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-primary mb-6">Shipping Information</h2>

                {profileError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm" role="alert">
                    {profileError}
                  </div>
                )}

                {profileLoading && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                    Loading your profile...
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="Sahin Thapa"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    error={errors.fullName}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="sahin@example.com"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      error={errors.email}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      error={errors.phone}
                    />
                  </div>
                  <Input
                    label="Address"
                    placeholder="Street, building, area"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    error={errors.address}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      placeholder="Kathmandu"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      error={errors.city}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="province" className="text-label-caps text-secondary uppercase">
                        Province
                      </label>
                      <select
                        id="province"
                        value={shipping.province}
                        onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                        className="block w-full bg-surface border border-border rounded-lg px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary text-base"
                        aria-invalid={!!errors.province}
                        aria-describedby={errors.province ? "province-error" : undefined}
                      >
                        <option value="">Select province</option>
                        {NEPALI_PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {errors.province && (
                        <p id="province-error" className="text-sm text-error" role="alert">{errors.province}</p>
                      )}
                    </div>
                    <Input
                      label="ZIP Code"
                      placeholder="44600"
                      value={shipping.zip}
                      onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                      error={errors.zip}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button variant="primary" size="lg" onClick={handleContinueToMethod}>
                    Continue to Shipping Method
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════
                Step 2: Shipping Method
                ════════════════════════════════════ */}
            {step === 2 && (
              <div className="bg-white border border-border rounded-xl p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-primary mb-6">Shipping Method</h2>

                <div className="space-y-4">
                  {/* Standard */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors",
                      shippingMethod === "standard" ? "border-primary bg-primary/5" : "border-border hover:border-neutral-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">Standard Shipping</span>
                        <span className="text-sm font-medium text-primary">
                          {showFreeShipping ? formatPrice(250) : "Free"}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">3-5 business days</p>
                    </div>
                  </label>

                  {/* Express */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors",
                      shippingMethod === "express" ? "border-primary bg-primary/5" : "border-border hover:border-neutral-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">Express Shipping</span>
                        <span className="text-sm font-medium text-primary">{formatPrice(600)}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">1-2 business days</p>
                    </div>
                  </label>
                </div>

                {showFreeShipping && (
                  <p className="text-xs text-text-secondary mt-4">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free standard shipping.
                  </p>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-text-secondary hover:text-primary underline underline-offset-2 transition-colors"
                  >
                    ← Back to Shipping
                  </button>
                  <Button variant="primary" size="lg" onClick={handleContinueToPayment}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════
                Step 3: Payment
                ════════════════════════════════════ */}
            {step === 3 && (
              <div className="bg-white border border-border rounded-xl p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-primary mb-6">Payment Method</h2>

                <div className="space-y-4">
                  {/* COD */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors",
                      paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-neutral-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 accent-black"
                    />
                    <div>
                      <span className="text-sm font-medium text-primary">Cash on Delivery</span>
                      <p className="text-xs text-text-secondary mt-1">Pay when you receive your order</p>
                    </div>
                  </label>

                  {/* Card */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors",
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-neutral-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mt-1 accent-black"
                    />
                    <div>
                      <span className="text-sm font-medium text-primary">Credit / Debit Card</span>
                      <p className="text-xs text-text-secondary mt-1">Secure payment via card</p>
                    </div>
                  </label>
                </div>

                {/* Order Summary for mobile */}
                <div className="lg:hidden mt-8 p-4 bg-neutral-50 rounded-xl">
                  <h3 className="text-sm font-medium text-primary mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-text-secondary truncate max-w-[200px]">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-primary">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border mt-3 pt-3 space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Shipping</span><span>{finalShipping === 0 ? "Free" : formatPrice(finalShipping)}</span></div>
                    <div className="flex justify-between text-sm font-semibold text-primary border-t border-border pt-2 mt-2">
                      <span>Total</span><span>{formatPrice(estimatedTotal)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-text-secondary hover:text-primary underline underline-offset-2 transition-colors"
                  >
                    ← Back to Method
                  </button>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={submitting}
                    onClick={handlePlaceOrder}
                  >
                    Place Order — {formatPrice(estimatedTotal)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order Summary Sidebar (Desktop) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-border rounded-xl p-6 sticky top-28">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary truncate">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-[10px] text-text-secondary">{[item.size, item.color].filter(Boolean).join(" / ")}</p>
                      )}
                      <p className="text-xs text-primary mt-1">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-primary">
                    {finalShipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(finalShipping)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border mt-3 pt-3">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-primary">Total</span>
                  <span className="font-semibold text-primary">{formatPrice(estimatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
