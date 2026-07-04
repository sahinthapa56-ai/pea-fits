"use client";

import React, {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

// ──────────────────────────────────────────────
// Chevron icon
// ──────────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4 pointer-events-none", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder,
      error,
      hint,
      fullWidth = true,
      className,
      id: externalId,
      value,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const selectId = externalId ?? autoId;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint && !error ? `${selectId}-hint` : undefined;

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-label-caps text-secondary uppercase"
          >
            {label}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              "block w-full appearance-none bg-surface border rounded-lg pl-4 pr-10 py-3",
              "text-primary placeholder:text-text-secondary",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-container",
              "aria-[invalid]:border-error aria-[invalid]:focus:ring-error",
              error ? "border-error" : "border-border",
              "text-base cursor-pointer",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="text-text-secondary" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p id={errorId} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="text-sm text-text-secondary">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
