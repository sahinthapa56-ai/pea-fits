"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface StarRatingProps {
  /** Rating value (0-5, supports half-stars with 0.5 increments) */
  rating: number;
  /** Enable interactive hover/click to set rating */
  interactive?: boolean;
  /** Called when user clicks a star (interactive mode) */
  onChange?: (rating: number) => void;
  /** Size of stars */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Maximum number of stars (default 5) */
  max?: number;
}

// ──────────────────────────────────────────────
// Size map
// ──────────────────────────────────────────────

const sizeStyles: Record<string, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

// ──────────────────────────────────────────────
// Star SVG
// ──────────────────────────────────────────────

function StarIcon({
  filled,
  half,
  sizeClass,
  interactive,
  onClick,
  onMouseEnter,
}: {
  filled: boolean;
  half: boolean;
  sizeClass: string;
  interactive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-block",
        interactive && "cursor-pointer",
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? "Set rating" : undefined}
    >
      <svg
        className={cn(
          sizeClass,
          "transition-colors duration-150",
          filled
            ? "text-amber-400"
            : half
              ? "text-amber-400"
              : "text-neutral-200",
        )}
        viewBox="0 0 24 24"
        fill={filled || half ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={half ? 0 : 1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
      {/* Half-star overlay */}
      {half && (
        <svg
          className={cn(sizeClass, "absolute inset-0 text-amber-400")}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      )}
    </span>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function StarRating({
  rating,
  interactive = false,
  onChange,
  size = "md",
  className,
  max = 5,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const sizeClass = sizeStyles[size];

  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5",
        interactive && "relative",
        className,
      )}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Rating selector" : `Rating: ${rating} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starIndex = i + 1;
        const filled = displayRating >= starIndex;
        const half = !filled && displayRating >= starIndex - 0.5;

        return (
          <span
            key={starIndex}
            className={cn(
              "relative inline-flex",
              interactive && "cursor-pointer",
            )}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? displayRating === starIndex : undefined}
            aria-label={interactive ? `${starIndex} star${starIndex !== 1 ? "s" : ""}` : undefined}
          >
            <StarIcon
              filled={filled}
              half={half}
              sizeClass={sizeClass}
            />
          </span>
        );
      })}
    </div>
  );
}
