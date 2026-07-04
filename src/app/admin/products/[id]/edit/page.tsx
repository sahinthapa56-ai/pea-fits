"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { generateSlug } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface VariantRow {
  key: string;
  id?: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  stock: string;
  isActive?: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string | null;
  basePrice: number;
  salePrice: number | null;
  isOnSale: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  material: string | null;
  careInstructions: string | null;
  stockQuantity: number;
  inStock: boolean;
  brand: string | null;
  tags: string;
  isActive: boolean;
  images: { id: string; url: string; alt: string | null; isPrimary: boolean; sortOrder: number }[];
  variants: { id: string; size: string; color: string | null; sku: string | null; price: number | null; stock: number; isActive: boolean }[];
  category: { id: string; name: string; slug: string } | null;
}

let variantKeyCounter = 1000;
function nextVariantKey() {
  return `v-${++variantKeyCounter}`;
}

// ──────────────────────────────────────────────
// Edit Product Page
// ──────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [existingImages, setExistingImages] = useState<ProductData["images"]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/products/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch product");

      const p: ProductData = json.data;
      setName(p.name);
      setSlug(p.slug);
      setDescription(p.description ?? "");
      setShortDescription(p.shortDescription ?? "");
      setCategoryId(p.categoryId ?? "");
      setBasePrice(String(p.basePrice));
      setSalePrice(p.salePrice ? String(p.salePrice) : "");
      setIsOnSale(p.isOnSale);
      setIsNew(p.isNew);
      setMaterial(p.material ?? "");
      setCareInstructions(p.careInstructions ?? "");
      setStockQuantity(String(p.stockQuantity));
      setIsFeatured(p.isFeatured);
      setIsTrending(p.isTrending);
      setIsBestSeller(p.isBestSeller);
      setBrand(p.brand ?? "");
      setTags(p.tags);
      setIsActive(p.isActive === undefined ? true : p.isActive);
      setExistingImages(p.images ?? []);
      setVariants(
        (p.variants ?? []).map((v) => ({
          key: nextVariantKey(),
          id: v.id,
          size: v.size,
          color: v.color ?? "",
          sku: v.sku ?? "",
          price: v.price ? String(v.price) : "",
          stock: String(v.stock),
          isActive: v.isActive,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data ?? []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProduct(), fetchCategories()]);
  }, [id, fetchProduct, fetchCategories]);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (name.trim()) {
      setSlug(generateSlug(name));
    }
  }, [name]);

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { key: nextVariantKey(), size: "", color: "", sku: "", price: "", stock: "0" },
    ]);
  };

  const removeVariant = (key: string) => {
    setVariants((prev) => prev.filter((v) => v.key !== key));
  };

  const updateVariant = (key: string, field: keyof VariantRow, value: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)),
    );
  };

  const handleUpload = useCallback((files: File[]) => {
    setNewImages((prev) => [...prev, ...files]);
  }, []);

  const removeExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast("error", "Product name is required");
      return;
    }
    if (!basePrice || parseFloat(basePrice) < 0) {
      addToast("error", "Valid base price is required");
      return;
    }

    setSaving(true);
    try {
      // Build images array: keep existing ones that weren't removed, plus new ones
      const imagesPayload = [
        ...existingImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
        ...newImages.map((file) => ({
          url: URL.createObjectURL(file),
          alt: file.name,
          isPrimary: false,
          sortOrder: 0,
        })),
      ];

      const body = {
        name: name.trim(),
        description: description || null,
        shortDescription: shortDescription || null,
        categoryId: categoryId || null,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        isOnSale,
        isNew,
        isFeatured,
        isTrending,
        isBestSeller,
        material: material || null,
        careInstructions: careInstructions || null,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        brand: brand || null,
        tags: tags || "[]",
        isActive,
        images: imagesPayload,
        variants: variants
          .filter((v) => v.size.trim())
          .map((v) => ({
            id: v.id,
            size: v.size.trim(),
            color: v.color || null,
            sku: v.sku || null,
            price: v.price ? parseFloat(v.price) : null,
            stock: parseInt(v.stock, 10) || 0,
            isActive: true,
          })),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? "Failed to update product");
      }

      addToast("success", "Product updated successfully");
      router.push("/admin/products");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={fetchProduct} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Products", href: "/admin/products" },
          { label: "Edit Product" },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl font-bold text-primary mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Basic Info */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Basic Information</h2>
          <Input label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          <Textarea label="Short Description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: "", label: "No category" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Base Price (Rs) *" type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
            <Input label="Sale Price (Rs)" type="number" min="0" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-primary">On Sale</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-primary">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-primary">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-primary">Trending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-primary">Best Seller</span>
            </label>
          </div>
        </section>

        {/* Details */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Material" value={material} onChange={(e) => setMaterial(e.target.value)} />
            <Input label="Stock Quantity" type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
          </div>
          <Textarea label="Care Instructions" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. PEA FITS" />
            <Input label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. summer, limited, luxury" />
          </div>
        </section>

        {/* Status */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Status</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-primary">Active (uncheck to archive)</span>
          </label>
        </section>

        {/* Variants */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              + Add Variant
            </Button>
          </div>
          {variants.map((variant, index) => (
            <div key={variant.key} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-lg bg-surface-container/30 border border-border">
              <Input label="Size" value={variant.size} onChange={(e) => updateVariant(variant.key, "size", e.target.value)} placeholder="e.g. S, M, L" />
              <Input label="Color" value={variant.color} onChange={(e) => updateVariant(variant.key, "color", e.target.value)} placeholder="e.g. Black" />
              <Input label="SKU" value={variant.sku} onChange={(e) => updateVariant(variant.key, "sku", e.target.value)} placeholder="Optional" />
              <Input label="Price (Rs)" type="number" min="0" value={variant.price} onChange={(e) => updateVariant(variant.key, "price", e.target.value)} placeholder="Override" />
              <div className="flex items-end gap-2">
                <Input label="Stock" type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(variant.key, "stock", e.target.value)} />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(variant.key)} className="p-2 text-text-secondary hover:text-error transition-colors mb-1" aria-label={`Remove variant ${index + 1}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Images */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Images</h2>
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-surface-container">
                  <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <ImageUpload onUpload={handleUpload} multiple maxFiles={10} />
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? "Saving..." : "Update Product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
