import Link from "next/link";
// import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
}

interface DiscountedProductsProps {
  products: ProductType[];
}

export default function DiscountedProducts({
  products,
}: DiscountedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Sắp xếp theo % giảm giá cao nhất
  const sortedProducts = [...products].sort((a, b) => {
    const discountA = a.discountPercentage || 0;
    const discountB = b.discountPercentage || 0;
    return discountB - discountA;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sản phẩm giảm giá lớn nhất */}
        {sortedProducts[0] && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-100 to-teal-100 p-8 shadow-sm">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white">
                -{sortedProducts[0].discountPercentage}%
              </span>
            </div>

            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Ưu đãi hấp dẫn nhất
            </h3>
            <h4 className="mb-6 text-2xl font-bold text-gray-900">
              {sortedProducts[0].name}
            </h4>

            <div className="mb-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                }).format(sortedProducts[0].price)}
              </span>
              {sortedProducts[0].compareAtPrice && (
                <span className="text-xl font-medium text-gray-500 line-through">
                  {Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(sortedProducts[0].compareAtPrice)}
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <Button asChild>
                <Link href={`/product/${sortedProducts[0].slug}`}>
                  Mua ngay
                </Link>
              </Button>
              <Button variant="outline">
                <Link href="/product?filter=sale">Xem thêm ưu đãi</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Hiển thị 3 sản phẩm giảm giá tiếp theo theo dạng list */}
        <div className="flex flex-col justify-between space-y-4">
          {sortedProducts.slice(1, 4).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {product.discountPercentage && (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                  -{product.discountPercentage}%
                </div>
              )}

              <div className="flex-1">
                <Link
                  href={`/product/${product.slug}`}
                  className="hover:text-primary"
                >
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                </Link>

                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-gray-900">
                    {Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      minimumFractionDigits: 0,
                    }).format(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                      }).format(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>

              <Button size="sm" variant="outline" asChild>
                <Link href={`/product/${product.slug}`}>Xem</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Xem tất cả button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/product?filter=sale"
          className="inline-flex items-center gap-2 rounded-md border border-primary px-6 py-3 text-primary hover:bg-primary/5 transition-colors"
        >
          Xem tất cả sản phẩm giảm giá <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
