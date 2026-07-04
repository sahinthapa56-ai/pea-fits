type SkeletonVariant = "text" | "card" | "row" | "table";

export function Skeleton({
  variant = "text",
  lines = 1,
  className = "",
}: {
  variant?: SkeletonVariant;
  lines?: number;
  className?: string;
}) {
  if (variant === "table") {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-zinc-800 rounded flex-1" />
            <div className="h-4 bg-zinc-800 rounded flex-1" />
            <div className="h-4 bg-zinc-800 rounded flex-1" />
            <div className="h-4 bg-zinc-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-zinc-800 rounded"
            style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`animate-pulse bg-zinc-800 rounded ${className}`}>
        <div className="aspect-[4/5] bg-zinc-700 rounded" />
      </div>
    );
  }

  // variant === "text"
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-zinc-800 rounded"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group animate-pulse">
      <div className="aspect-[4/5] bg-zinc-800 rounded-lg mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-800 rounded w-1/2" />
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/5] bg-zinc-800 rounded-lg" />
        <div className="space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-3/4" />
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
          <div className="h-4 bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
          <div className="h-10 bg-zinc-800 rounded w-1/3 mt-6" />
        </div>
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-zinc-800 rounded-xl p-6 space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-zinc-800 pb-4">
          <div className="w-20 h-20 bg-zinc-800 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-1/4" />
            <div className="h-3 bg-zinc-800 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
