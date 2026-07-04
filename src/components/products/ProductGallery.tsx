"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/index";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ProductGallery({
  images,
  productName,
  className,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    images.findIndex((img) => img.isPrimary) >= 0
      ? images.findIndex((img) => img.isPrimary)
      : 0,
  );
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedIndex];

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setZoomed(false);
  };

  // ── Mouse zoom effect (desktop only) ──
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || !zoomed) return;
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [zoomed],
  );

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) setZoomed(true);
  };

  const handleMouseLeave = () => {
    setZoomed(false);
  };

  if (!images.length) {
    return (
      <div
        role="region"
        aria-label="Product images"
        className={cn(
          "aspect-[4/5] w-full bg-neutral-100 rounded-lg flex items-center justify-center",
          className,
        )}
      >
        <svg
          className="w-16 h-16 text-neutral-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Product images" className={cn("flex flex-col gap-3", className)}>
      {/* Main image */}
      <div
        ref={imageRef}
        className="relative aspect-[4/5] w-full bg-neutral-100 rounded-lg overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-200",
            zoomed && "scale-150",
          )}
          style={
            zoomed
              ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
              : undefined
          }
          priority
          draggable={false}
        />

        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                handleThumbnailClick(
                  (selectedIndex - 1 + images.length) % images.length,
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:text-black transition-colors shadow-sm"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                handleThumbnailClick(
                  (selectedIndex + 1) % images.length,
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:text-black transition-colors shadow-sm"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {images.map((image, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={image.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-label={image.alt ?? `View image ${index + 1} of ${images.length}`}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? `${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
