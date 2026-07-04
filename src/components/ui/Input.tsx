"use client";

import React, { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  /** Render a textarea instead of input */
  multiline?: boolean;
  /** Rows for textarea */
  rows?: number;
  fullWidth?: boolean;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      multiline = false,
      rows = 3,
      fullWidth = true,
      className,
      id: externalId,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;

    const baseClasses =
      "block w-full bg-surface border rounded-lg px-4 py-3 text-primary placeholder:text-text-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-container aria-[invalid]:border-error aria-[invalid]:focus:ring-error";

    const inputClasses = cn(
      baseClasses,
      error && "border-error",
      !error && "border-border",
      "text-base",
      className,
    );

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-caps text-secondary uppercase"
          >
            {label}
          </label>
        )}

        {/* Input or Textarea */}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={inputClasses}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={inputClasses}
            {...props}
          />
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {/* Hint (only shown when no error) */}
        {hint && !error && (
          <p id={hintId} className="text-sm text-text-secondary">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
