// "use client";

// import { Skeleton } from "@/components/ui/skeleton";

// export default function SearchResultsSkeleton() {
//   // Create an array of 9 items for the skeleton grid
//   const skeletonItems = Array.from({ length: 9 }, (_, i) => i);

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       {skeletonItems.map((item) => (
//         <div
//           key={item}
//           className="bg-white rounded-lg shadow-sm overflow-hidden"
//         >
//           {/* Image skeleton */}
//           <Skeleton className="h-48 w-full" />

//           {/* Content skeleton */}
//           <div className="p-4 space-y-3">
//             <Skeleton className="h-5 w-3/4" />
//             <Skeleton className="h-4 w-1/2" />
//             <div className="flex items-center justify-between pt-2">
//               <Skeleton className="h-5 w-1/3" />
//               <Skeleton className="h-9 w-24 rounded-full" />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SearchResultsSkeleton() {
  // Create an array of 9 items for the skeleton grid
  const skeletonItems = Array.from({ length: 9 }, (_, i) => i);

  return (
    <>
      {/* Sort controls skeleton */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-4 w-24 mr-2" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonItems.map((item) => (
          <div
            key={item}
            className="bg-white rounded-xl shadow-sm overflow-hidden group animate-pulse"
          >
            {/* Image skeleton with shimmer effect */}
            <div className="relative">
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
            </div>

            {/* Content skeleton */}
            <div className="p-5 space-y-4">
              {/* Title and category */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Rating */}
              <div className="flex items-center">
                <Skeleton className="h-4 w-24 mr-2" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Price and button */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Skeleton className="h-6 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-12 flex justify-center">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Add this CSS to your global.css or inline style */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .skeleton-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
