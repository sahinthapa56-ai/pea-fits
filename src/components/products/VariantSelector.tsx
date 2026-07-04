"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
  className?: string;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  className,
}: VariantSelectorProps) {
  // Group variants by color
  const colorGroups = new Map<string, ProductVariant[]>();
  const sizes = new Set<string>();

  variants.forEach((v) => {
    const color = v.color ?? "default";
    if (!colorGroups.has(color)) colorGroups.set(color, []);
    colorGroups.get(color)!.push(v);
    if (v.size) sizes.add(v.size);
  });

  const uniqueColors = Array.from(colorGroups.keys());
  const uniqueSizes = Array.from(sizes).sort();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Color Swatches */}
      {uniqueColors.length > 0 && (
        <div>
          <h3 className="text-label-caps text-secondary uppercase mb-3">
            Color{selectedVariant?.color ? `: ${selectedVariant.color}` : ""}
          </h3>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Color selection">
            {uniqueColors.map((color) => {
              const variantsInColor = colorGroups.get(color)!;
              const isSelected = selectedVariantId
                ? variantsInColor.some((v) => v.id === selectedVariantId)
                : false;
              const allOutOfStock = variantsInColor.every((v) => v.stock <= 0);

              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Color: ${color}${allOutOfStock ? " (out of stock)" : ""}`}
                  disabled={allOutOfStock}
                  onClick={() => {
                    // Select the first in-stock variant of this color
                    const inStock = variantsInColor.find((v) => v.stock > 0);
                    onSelect(inStock?.id ?? variantsInColor[0].id);
                  }}
                  className={cn(
                    "relative w-9 h-9 rounded-full border-2 transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isSelected ? "border-primary scale-110" : "border-border hover:scale-105",
                    allOutOfStock && "opacity-40 cursor-not-allowed",
                  )}
                  title={color}
                >
                  <span
                    className="block w-full h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Buttons */}
      {uniqueSizes.length > 0 && (
        <div>
          <h3 className="text-label-caps text-secondary uppercase mb-3">
            Size{selectedVariant?.size ? `: ${selectedVariant.size}` : ""}
          </h3>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size selection">
            {uniqueSizes.map((size) => {
              // Find variants matching selected color and size
              const matchingVariants = selectedVariant?.color
                ? variants.filter(
                    (v) => v.size === size && v.color === selectedVariant.color,
                  )
                : variants.filter((v) => v.size === size);

              const variant = matchingVariants[0];
              const isSelected = selectedVariant?.size === size;
              const outOfStock = variant ? variant.stock <= 0 : true;
              const stockStatus = variant
                ? variant.stock > 10
                  ? "In Stock"
                  : variant.stock > 0
                    ? `Only ${variant.stock} left`
                    : "Out of Stock"
                : "Unavailable";

              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Size ${size} - ${stockStatus}`}
                  disabled={outOfStock || !variant}
                  onClick={() => variant && onSelect(variant.id)}
                  className={cn(
                    "relative min-w-[3rem] px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface text-primary border-border hover:border-primary",
                    (outOfStock || !variant) &&
                      "opacity-40 cursor-not-allowed text-text-secondary line-through",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Stock status for selected variant */}
          {selectedVariant && (
            <p
              className={cn(
                "mt-2 text-xs",
                selectedVariant.stock > 0
                  ? "text-green-600"
                  : "text-error",
              )}
            >
              {selectedVariant.stock > 10
                ? "In Stock"
                : selectedVariant.stock > 0
                  ? `Only ${selectedVariant.stock} left`
                  : "Out of Stock"}
            </p>
          )}
        </div>
      )}

      {/* No variants */}
      {variants.length === 0 && (
        <p className="text-sm text-text-secondary">
          No size or color options available.
        </p>
      )}
    </div>
  );
}
