import { describe, it, expect } from "vitest";
import {
  generateSlug,
  validateNepaliPhone,
  truncate,
  isEmpty,
  generateOrderNumber,
} from "@/lib/utils";

describe("Utils", () => {
  describe("generateSlug", () => {
    it("converts text to lowercase and replaces spaces with hyphens", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      expect(generateSlug("Hello! World?")).toBe("hello-world");
      expect(generateSlug("Price: $100")).toBe("price-100");
      expect(generateSlug("What's New?")).toBe("whats-new");
    });

    it("trims leading and trailing whitespace", () => {
      expect(generateSlug("  hello world  ")).toBe("hello-world");
    });

    it("replaces underscores with hyphens", () => {
      expect(generateSlug("hello_world")).toBe("hello-world");
    });

    it("collapses multiple hyphens into one", () => {
      expect(generateSlug("hello---world")).toBe("hello-world");
      expect(generateSlug("hello   world")).toBe("hello-world");
    });

    it("removes leading and trailing hyphens", () => {
      expect(generateSlug("-hello-world-")).toBe("hello-world");
    });

    it("handles empty string", () => {
      expect(generateSlug("")).toBe("");
    });

    it("handles strings with only special characters", () => {
      expect(generateSlug("!!! ???")).toBe("");
    });
  });

  describe("validateNepaliPhone", () => {
    it("accepts valid phone numbers starting with 98", () => {
      expect(validateNepaliPhone("9812345678")).toBe(true);
    });

    it("accepts valid phone numbers starting with 97", () => {
      expect(validateNepaliPhone("9712345678")).toBe(true);
    });

    it("strips hyphens and spaces before validation", () => {
      expect(validateNepaliPhone("98-1234-5678")).toBe(true);
      expect(validateNepaliPhone("98 1234 5678")).toBe(true);
    });

    it("rejects numbers with wrong prefix (96, 99)", () => {
      expect(validateNepaliPhone("9612345678")).toBe(false);
      expect(validateNepaliPhone("9912345678")).toBe(false);
    });

    it("rejects numbers with wrong length", () => {
      expect(validateNepaliPhone("981234567")).toBe(false); // 9 digits
      expect(validateNepaliPhone("98123456789")).toBe(false); // 11 digits
    });

    it("rejects numbers with non-digit characters after stripping", () => {
      expect(validateNepaliPhone("98abcdefgh")).toBe(false);
    });

    it("rejects empty strings", () => {
      expect(validateNepaliPhone("")).toBe(false);
    });
  });

  describe("truncate", () => {
    it("returns the original string if it's shorter than the limit", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
    });

    it("returns the original string if it's exactly the limit", () => {
      expect(truncate("Hello", 5)).toBe("Hello");
    });

    it("truncates and appends ellipsis when text exceeds limit", () => {
      expect(truncate("Hello World", 5)).toBe("Hello…");
    });

    it("trims trailing spaces before ellipsis", () => {
      expect(truncate("Hello   ", 5)).toBe("Hello…");
    });

    it("handles empty string", () => {
      expect(truncate("", 5)).toBe("");
    });

    it("handles limit of 0", () => {
      expect(truncate("Hello", 0)).toBe("…");
    });
  });

  describe("isEmpty", () => {
    it("returns true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("returns true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("returns true for empty string", () => {
      expect(isEmpty("")).toBe(true);
    });

    it("returns true for whitespace-only string", () => {
      expect(isEmpty("   ")).toBe(true);
    });

    it("returns false for non-empty string", () => {
      expect(isEmpty("hello")).toBe(false);
    });

    it("returns true for empty array", () => {
      expect(isEmpty([])).toBe(true);
    });

    it("returns false for non-empty array", () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it("returns true for empty object", () => {
      expect(isEmpty({})).toBe(true);
    });

    it("returns false for non-empty object", () => {
      expect(isEmpty({ key: "value" })).toBe(false);
    });

    it("returns false for numbers and booleans", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(42)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty(true)).toBe(false);
    });
  });

  describe("generateOrderNumber", () => {
    it("starts with PF prefix", () => {
      const orderNum = generateOrderNumber();
      expect(orderNum.startsWith("PF-")).toBe(true);
    });

    it("includes the current year", () => {
      const currentYear = new Date().getFullYear();
      const orderNum = generateOrderNumber();
      expect(orderNum).toContain(`-${currentYear}-`);
    });

    it("ends with a 4-digit random number", () => {
      const orderNum = generateOrderNumber();
      const parts = orderNum.split("-");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("PF");
      expect(parts[2]).toMatch(/^\d{4}$/);
    });

    it("generates unique order numbers on successive calls", () => {
      const num1 = generateOrderNumber();
      const num2 = generateOrderNumber();
      expect(num1).not.toBe(num2);
    });

    it("has correct format PF-YYYY-NNNN", () => {
      const orderNum = generateOrderNumber();
      expect(orderNum).toMatch(/^PF-\d{4}-\d{4}$/);
    });
  });
});
