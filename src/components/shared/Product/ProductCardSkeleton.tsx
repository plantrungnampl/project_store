import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  featured?: boolean;
  className?: string;
}

export function ProductCardSkeleton({
  featured = false,
  className,
}: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm overflow-hidden",
        featured ? "md:col-span-2 md:row-span-2" : "",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="relative pt-[100%]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content skeletons */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />

        <div className="flex items-center mt-1">
          <Skeleton className="h-3.5 w-20" />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>

        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}

export function ProductCardGridSkeleton({ count = 4, featured = false }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} featured={featured && index === 0} />
      ))}
    </div>
  );
}
