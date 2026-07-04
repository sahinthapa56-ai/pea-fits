"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Accessible label prefix, defaults to "Quantity" */
  label?: string;
}

// ──────────────────────────────────────────────
// Icons
// ──────────────────────────────────────────────

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function QuantitySelector({
  value,
  min = 1,
  max = 10,
  onChange,
  disabled = false,
  size = "md",
  className,
  label = "Quantity",
}: QuantitySelectorProps) {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  const handleDecrement = () => {
    if (!isAtMin) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (!isAtMax) onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty while typing
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    onChange(Math.max(min, Math.min(max, parsed)));
  };

  const sizeClasses = size === "sm" ? "h-8 text-sm" : "h-11 text-base";

  const btnSizeClasses = size === "sm" ? "w-8" : "w-11";

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center border border-border rounded-xl overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {/* Decrement */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isAtMin}
        aria-label="Decrease quantity"
        className={cn(
          btnSizeClasses,
          sizeClasses,
          "flex items-center justify-center border-r border-border",
          "text-primary hover:bg-surface-container transition-colors",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        )}
      >
        <MinusIcon />
      </button>

      {/* Value */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label={`${label}, ${value}`}
        className={cn(
          "w-12 text-center bg-surface text-primary font-medium",
          "border-none outline-none focus:ring-0",
          sizeClasses,
          disabled && "cursor-not-allowed",
        )}
      />

      {/* Increment */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isAtMax}
        aria-label="Increase quantity"
        className={cn(
          btnSizeClasses,
          sizeClasses,
          "flex items-center justify-center border-l border-border",
          "text-primary hover:bg-surface-container transition-colors",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        )}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
