import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../shared/Product/ProductCard";

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

interface TopSellingProductsProps {
  products: ProductType[];
}

export default function TopSellingProducts({
  products,
}: TopSellingProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Sắp xếp theo số lượng bán
  const sortedProducts = [...products].sort((a, b) => {
    const salesA = a.salesCount || 0;
    const salesB = b.salesCount || 0;
    return salesB - salesA;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {sortedProducts.slice(0, 8).map((product, index) => (
          <div key={product.id} className="relative">
            {/* Số thứ tự cho top 3 sản phẩm */}
            {index < 3 && (
              <div className="absolute -top-3 -left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-lg shadow-md">
                #{index + 1}
              </div>
            )}
            <ProductCard {...product} variant="default" />
          </div>
        ))}
      </div>

      {/* Xem tất cả button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/product/bestselling?sort=bestselling"
          className="flex items-center gap-2 text-primary hover:underline font-medium transition-colors"
        >
          Xem tất cả sản phẩm bán chạy <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
