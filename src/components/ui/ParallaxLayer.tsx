import type { ReactNode } from "react";

type ParallaxLayerProps = {
  children?: ReactNode;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

/**
 * Lightweight wrapper that preserves the original component API.
 * In production, enhance with framer-motion or a custom parallax hook.
 */
export function ParallaxLayer({ children, className, ...rest }: ParallaxLayerProps) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
