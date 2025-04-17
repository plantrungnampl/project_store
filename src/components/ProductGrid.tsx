import React from "react";
import { ProductCard } from "./shared/Product/ProductCard";

interface ProductType {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  isNew?: boolean;
  discountPercentage?: number | null;
  avgRating?: number;
  reviewCount?: number;
  brandName?: string | null;
  brandSlug?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  mainImage?: { url: string; alt: string } | null;
  images?: { url: string; alt: string }[];
  salesCount?: number;
}

interface ProductsGridProps {
  products: ProductType[];
  showRankBadges?: boolean;
  emptyMessage?: string;
}

export function ProductsGrid({
  products,
  showRankBadges = false,
  emptyMessage = "Không tìm thấy sản phẩm nào",
}: ProductsGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <div key={product.id} className="relative">
          {/* Rank badges for top 3 bestselling products */}
          {showRankBadges && index < 3 && (
            <div className="absolute -top-3 -left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-lg shadow-md">
              #{index + 1}
            </div>
          )}
          <ProductCard {...product} variant="default" />
        </div>
      ))}
    </div>
  );
}
