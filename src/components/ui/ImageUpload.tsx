"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_SIZE } from "@/lib/constants";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
}

// ──────────────────────────────────────────────
// Upload Icon
// ──────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-10 h-10", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ImageUpload({
  onUpload,
  multiple = false,
  maxFiles = 5,
  maxSize = MAX_UPLOAD_SIZE,
  accept = "image/*",
  className,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const validateAndAdd = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        // Check type
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" is not an image file.`);
          continue;
        }
        // Check size
        if (file.size > maxSize) {
          setError(
            `"${file.name}" exceeds the ${(maxSize / 1024 / 1024).toFixed(0)} MB limit.`,
          );
          continue;
        }
        validFiles.push(file);
      }

      if (previews.length + validFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      if (validFiles.length > 0) {
        const newPreviews = validFiles.map((file) => ({
          file,
          url: URL.createObjectURL(file),
        }));
        setPreviews((prev) => [...prev, ...newPreviews]);
        onUpload(validFiles);
      }
    },
    [maxSize, maxFiles, previews.length, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        validateAndAdd(e.dataTransfer.files);
      }
    },
    [validateAndAdd],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAdd(e.target.files);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8",
          "transition-all duration-200 cursor-pointer",
          "min-h-[160px]",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-neutral-400 bg-surface",
          error ? "border-error" : "",
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <UploadIcon
          className={dragOver ? "text-primary" : "text-text-secondary"}
        />
        <p className="mt-3 text-sm text-primary font-medium">
          {dragOver ? "Drop files here" : "Drag & drop images here"}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          or click to browse
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          PNG, JPG, WebP, AVIF up to {maxSize / 1024 / 1024} MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="sr-only"
          aria-hidden="true"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Preview thumbnails */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100">
              <img
                src={preview.url}
                alt={`Upload preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:bg-red-600 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
