'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3">
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-2/5 mb-2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
