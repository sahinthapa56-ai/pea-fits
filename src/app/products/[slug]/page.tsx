import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Fetch product data on the server for SSR ──

async function getProductData(slug: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ── Dynamic metadata for SEO ──

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (!product) {
    return {
      title: "Product Not Found — PEA_FITS",
      description: "The requested product could not be found.",
    };
  }

  const images = product.images ?? [];
  const ogImage = images.find((img: any) => img.isPrimary) ?? images[0];

  return {
    title: `${product.name} — PEA_FITS`,
    description: product.shortDescription ?? product.description?.slice(0, 160) ?? "",
    openGraph: {
      title: `${product.name} — PEA_FITS`,
      description: product.shortDescription ?? "",
      images: ogImage ? [{ url: ogImage.url, alt: ogImage.alt ?? product.name }] : [],
    },
  };
}

// ── Server Component wrapper (SSR) ──

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-primary mb-2">Product Not Found</h1>
          <p className="text-text-secondary">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
