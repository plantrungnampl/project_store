import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: any[];
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
  categorySlug?: string;
}

export default function ProductGrid({
  products,
  currentPage,
  totalPages,
  searchQuery,
  categorySlug,
}: ProductGridProps) {
  // Build pagination URLs
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());

    if (searchQuery) {
      return `/search?q=${encodeURIComponent(
        searchQuery
      )}&${params.toString()}`;
    } else if (categorySlug) {
      return `/categories/${categorySlug}?${params.toString()}`;
    } else {
      return `/product?${params.toString()}`;
    }
  };

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-gray-600 mb-8">
          {searchQuery
            ? `Không có kết quả cho tìm kiếm "${searchQuery}"`
            : "Không có sản phẩm nào trong danh mục này"}
        </p>
        <Link href="/product">
          <Button>Xem tất cả sản phẩm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2">
            {/* Previous page */}
            {currentPage > 1 && (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-gray-600 transition-colors border rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Trước
              </Link>
            )}

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, current page, and 1 page before/after current
                  const shouldShow =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(currentPage - page) <= 1;

                  // Show ellipsis instead of all pages
                  if (!shouldShow) {
                    // But only show one ellipsis between ranges
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-600"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Link
                      key={page}
                      href={buildPageUrl(page)}
                      className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </Link>
                  );
                }
              )}
            </div>

            {/* Next page */}
            {currentPage < totalPages && (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-gray-600 transition-colors border rounded-md hover:bg-gray-100"
              >
                Tiếp
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// import React from "react";
// import { ProductCard } from "@/components/shared/Product/ProductCard";

// interface ProductType {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compareAtPrice?: number | null;
//   stockQuantity: number;
//   isActive: boolean;
//   isFeatured: boolean;
//   isDigital: boolean;
//   isNew?: boolean;
//   discountPercentage?: number | null;
//   avgRating?: number;
//   reviewCount?: number;
//   brandName?: string | null;
//   brandSlug?: string | null;
//   categories?: { id: string; name: string; slug: string }[];
//   mainImage?: { url: string; alt: string } | null;
//   images?: { url: string; alt: string }[];
//   hasVariants?: boolean;
// }

// interface ProductGridProps {
//   products: ProductType[];
//   className?: string;
// }

// const ProductGrid: React.FC<ProductGridProps> = ({
//   products,
//   className = "",
// }) => {
//   return (
//     <div
//       className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
//     >
//       {products.map((product) => (
//         <ProductCard key={product.id} {...product} />
//       ))}
//     </div>
//   );
// };

// export default ProductGrid;
