"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type BadgeVariant =
  | "new"
  | "sale"
  | "status"
  | "primary"
  | "outline"
  | "success"
  | "warning"
  | "error";

type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

// ──────────────────────────────────────────────
// Style maps
// ──────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  new: "bg-primary text-on-primary",
  sale: "bg-editorial-red text-white",
  status: "bg-surface-container text-secondary",
  primary: "bg-primary text-on-primary",
  outline: "bg-transparent text-primary border border-primary",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[0.625rem]",
  md: "px-2 py-0.5 text-label-caps",
  lg: "px-3 py-1 text-label-caps-lg",
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function Badge({
  variant = "primary",
  size = "md",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wider leading-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
