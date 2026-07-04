"use client";

import type { ElementType, ReactNode } from "react";

type Tilt3DShellProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

/**
 * Lightweight wrapper that preserves the original component API.
 * In production, enhance with @radix-ui or react-parallax-tilt.
 */
export function Tilt3DShell({
  children,
  className,
  as: Tag = "div",
  ...rest
}: Tilt3DShellProps) {
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}
