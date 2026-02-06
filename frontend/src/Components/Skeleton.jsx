/**
 * Skeleton loading component for better UX
 */

// Base skeleton with pulse animation
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
        </div>
        
        {/* Price */}
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

// Product list skeleton (grid)
export function ProductListSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product detail skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Image gallery skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="mt-8 lg:mt-0 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Cart item skeleton
export function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4">
      <Skeleton className="h-20 w-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

// Order history skeleton
export function OrderHistorySkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-16 w-16 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Text line skeleton
export function TextSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export default Skeleton;
