import { describe, it, expect } from "vitest";
import {
  getShippingCost,
  getShippingZone,
  calculateTax,
  formatPrice,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COSTS,
  VAT_RATE,
} from "@/config/shipping";

describe("Shipping Config", () => {
  describe("getShippingZone", () => {
    it("returns 'valley' for Bagmati province", () => {
      expect(getShippingZone("Bagmati")).toBe("valley");
    });

    it("returns 'valley' for Kathmandu, Lalitpur, Bhaktapur", () => {
      expect(getShippingZone("Kathmandu")).toBe("valley");
      expect(getShippingZone("Lalitpur")).toBe("valley");
      expect(getShippingZone("Bhaktapur")).toBe("valley");
    });

    it("handles lowercase variants for valley districts", () => {
      expect(getShippingZone("bagmati")).toBe("valley");
      expect(getShippingZone("kathmandu")).toBe("valley");
      expect(getShippingZone("lalitpur")).toBe("valley");
      expect(getShippingZone("bhaktapur")).toBe("valley");
    });

    it("returns 'outside_valley' for ALL-CAPS variants (not in case list)", () => {
      expect(getShippingZone("KATHMANDU")).toBe("outside_valley");
      expect(getShippingZone("BAGMATI")).toBe("outside_valley");
    });

    it("returns 'outside_valley' for other provinces", () => {
      expect(getShippingZone("Province No. 1")).toBe("outside_valley");
      expect(getShippingZone("Gandaki Province")).toBe("outside_valley");
      expect(getShippingZone("Lumbini Province")).toBe("outside_valley");
    });

    it("returns 'outside_valley' for unknown province", () => {
      expect(getShippingZone("Unknown")).toBe("outside_valley");
      expect(getShippingZone("")).toBe("outside_valley");
    });
  });

  describe("getShippingCost", () => {
    it("returns valley cost (200) for Bagmati", () => {
      expect(getShippingCost("Bagmati")).toBe(200);
    });

    it("returns outside cost (500) for other provinces", () => {
      expect(getShippingCost("Gandaki Province")).toBe(500);
      expect(getShippingCost("Lumbini Province")).toBe(500);
    });

    it("returns outside cost (500) for unknown province", () => {
      expect(getShippingCost("")).toBe(500);
      expect(getShippingCost("Unknown")).toBe(500);
    });
  });

  describe("SHIPPING_COSTS", () => {
    it("has correct valley cost", () => {
      expect(SHIPPING_COSTS.valley).toBe(200);
    });

    it("has correct outside valley cost", () => {
      expect(SHIPPING_COSTS.outside_valley).toBe(500);
    });
  });

  describe("FREE_SHIPPING_THRESHOLD", () => {
    it("is set to 5000 NPR", () => {
      expect(FREE_SHIPPING_THRESHOLD).toBe(5000);
    });
  });

  describe("calculateTax", () => {
    it("calculates 13% VAT on subtotal + shipping", () => {
      const subtotal = 1000;
      const shipping = 200;
      const tax = calculateTax(subtotal, shipping);
      // 13% of (1000 + 200) = 156
      expect(tax).toBe(156);
    });

    it("returns 0 for zero subtotal and shipping", () => {
      expect(calculateTax(0, 0)).toBe(0);
    });

    it("rounds to the nearest whole number", () => {
      // 13% of 1577 = 205.01 → Math.round(205.01) = 205
      expect(calculateTax(1000, 577)).toBe(205);
    });

    it("uses correct VAT_RATE", () => {
      expect(VAT_RATE).toBe(0.13);
    });
  });

  describe("formatPrice", () => {
    it("formats a number in NPR with रु symbol", () => {
      const result = formatPrice(3400);
      expect(result).toContain("रु");
      expect(result).toContain("3,400");
    });

    it("uses en-IN locale formatting", () => {
      // Indian numbering: 1,00,000 instead of 100,000
      const result = formatPrice(100000);
      expect(result).toContain("रु");
      expect(result).toMatch(/रु\s+1,00,000/);
    });

    it("handles string input", () => {
      const result = formatPrice("3400");
      expect(result).toContain("3,400");
    });

    it("returns रु 0 for NaN", () => {
      expect(formatPrice(NaN)).toBe("रु 0");
      expect(formatPrice("not-a-number")).toBe("रु 0");
    });

    it("formats zero correctly", () => {
      expect(formatPrice(0)).toBe("रु 0");
    });
  });
});
