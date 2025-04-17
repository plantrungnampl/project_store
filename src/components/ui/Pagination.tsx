// import React from "react";
// import { Button } from "@/components/ui/button";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
// } from "lucide-react";

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   siblingsCount?: number;
// }

// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
//   siblingsCount = 1,
// }) => {
//   // Function to generate page numbers array with dots
//   const generatePagination = () => {
//     // If total pages is less than 7, show all pages
//     if (totalPages <= 7) {
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     }

//     // Calculate range
//     const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
//     const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

//     // Should show dots when there's more than 1 page number hidden
//     const shouldShowLeftDots = leftSiblingIndex > 2;
//     const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

//     // Default page numbers array
//     const range = [];

//     // Handle left side
//     if (shouldShowLeftDots) {
//       range.push(1);
//       range.push("...");
//     } else {
//       // Show first 3 pages
//       for (let i = 1; i <= leftSiblingIndex; i++) {
//         range.push(i);
//       }
//     }

//     // Add siblings
//     for (
//       let i = shouldShowLeftDots ? leftSiblingIndex : leftSiblingIndex + 1;
//       i <= rightSiblingIndex;
//       i++
//     ) {
//       range.push(i);
//     }

//     // Handle right side
//     if (shouldShowRightDots) {
//       range.push("...");
//       range.push(totalPages);
//     } else {
//       // Show last 3 pages
//       for (let i = rightSiblingIndex + 1; i <= totalPages; i++) {
//         range.push(i);
//       }
//     }

//     return range;
//   };

//   const pages = generatePagination();

//   return (
//     <nav aria-label="Pagination" className="flex justify-center items-center">
//       <ul className="flex items-center gap-1">
//         {/* First page */}
//         <li>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => onPageChange(1)}
//             disabled={currentPage === 1}
//             aria-label="Trang đầu tiên"
//             className="h-9 w-9"
//           >
//             <ChevronsLeft className="h-4 w-4" />
//           </Button>
//         </li>

//         {/* Previous page */}
//         <li>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => onPageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             aria-label="Trang trước"
//             className="h-9 w-9"
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>
//         </li>

//         {/* Page numbers */}
//         {pages.map((page, i) => (
//           <li key={i}>
//             {page === "..." ? (
//               <span className="px-3 py-2 text-gray-500">...</span>
//             ) : (
//               <Button
//                 variant={currentPage === page ? "default" : "outline"}
//                 size="icon"
//                 onClick={() => typeof page === "number" && onPageChange(page)}
//                 aria-current={currentPage === page ? "page" : undefined}
//                 aria-label={`Trang ${page}`}
//                 className="h-9 w-9"
//               >
//                 {page}
//               </Button>
//             )}
//           </li>
//         ))}

//         {/* Next page */}
//         <li>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => onPageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             aria-label="Trang sau"
//             className="h-9 w-9"
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </li>

//         {/* Last page */}
//         <li>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => onPageChange(totalPages)}
//             disabled={currentPage === totalPages}
//             aria-label="Trang cuối cùng"
//             className="h-9 w-9"
//           >
//             <ChevronsRight className="h-4 w-4" />
//           </Button>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default Pagination;
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Always show first page
    pageNumbers.push(1);

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after page 1 if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Construct URL for a specific page
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center space-x-2">
      {/* Previous page button */}
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)}>
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="icon" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <Button key={`ellipsis-${index}`} variant="outline" disabled>
              ...
            </Button>
          );
        }

        return (
          <Link key={`page-${page}`} href={getPageUrl(page as number)}>
            <Button variant={currentPage === page ? "default" : "outline"}>
              {page}
            </Button>
          </Link>
        );
      })}

      {/* Next page button */}
      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)}>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="icon" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
