"use client";
import React, { useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Star, Tag, ExternalLink, Eye, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { cn } from "@/lib/utils";
import { useProductQuickView } from "@/context/ProductQuickViewContext";
import { toast } from "sonner";

// Memoized rating stars component
const RatingStars = memo(({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex items-center">
    {[...Array(max)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))}
  </div>
));
RatingStars.displayName = "RatingStars";

// Product image with error handling and loading state
const ProductImage = ({ image, name, sizes = "100vw" }: { 
  image?: { url: string; alt: string } | null;
  name: string;
  sizes?: string;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <Tag className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={image.url}
        alt={image.alt || name}
        fill
        className={cn(
          "object-cover object-center transition-transform duration-300 group-hover:scale-105",
          isLoading && "blur-sm"
        )}
        sizes={sizes}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
};

// Mở rộng interface từ component đã có sẵn
interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  isNew?: boolean; // Sản phẩm mới
  discountPercentage?: number | null; // % giảm giá
  avgRating?: number; // Đánh giá trung bình
  reviewCount?: number; // Số lượng đánh giá
  brandName?: string | null; // Tên thương hiệu
  brandSlug?: string | null; // Slug thương hiệu
  categories?: { id: string; name: string; slug: string }[];
  mainImage?: { url: string; alt: string } | null; // Ảnh chính
  images?: { url: string; alt: string }[];
  salesCount?: number; // Số lượng đã bán
  hasVariants?: boolean; // Có biến thể không
  variant?: "default" | "horizontal" | "minimal" | "compact";
}

export const ProductCard = ({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  stockQuantity,
  isActive,
  isFeatured,
  isDigital,
  isNew,
  discountPercentage,
  avgRating,
  reviewCount = 0,
  brandName,
  brandSlug,
  categories,
  mainImage,
  salesCount,
  hasVariants = false,
  variant = "default",
}: ProductCardProps) => {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { openQuickView } = useProductQuickView();
  const [imageError, setImageError] = useState(false);

  // Tính toán các giá trị hiển thị
  const inStock = stockQuantity > 0;

  // Primary category if available
  const primaryCategory =
    categories && categories.length > 0 ? categories[0] : null;

  // Xử lý quick view
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(id);
  };

  // Xử lý khi hình ảnh tải lỗi
  const handleImageError = () => {
    setImageError(true);
  };

  // Component hiển thị placeholder khi không có hình ảnh hoặc hình ảnh lỗi
  const ImagePlaceholder = ({ className = "" }: { className?: string }) => (
    <div
      className={`flex h-full w-full items-center justify-center bg-gray-100 ${className}`}
    >
      <ImageIcon className="h-12 w-12 text-gray-300" />
      <span className="sr-only">{name}</span>
    </div>
  );

  if (!isActive) return null;

  // Compact variant (for sidebars, mini carts)
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          {mainImage && !imageError ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt || name}
              fill
              className="object-cover object-center"
              sizes="64px"
              onError={handleImageError}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <Link href={`/product/${slug}`} className="hover:text-primary">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        <WishlistButton productId={id} variant="icon" size="sm" />
      </div>
    );
  }

  // Horizontal variant (for search results, comparison tables)
  if (variant === "horizontal") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
        <div className="relative aspect-square sm:w-48 w-full overflow-hidden rounded-md bg-gray-100">
          <Link href={`/product/${slug}`}>
            {mainImage && !imageError ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 192px"
                onError={handleImageError}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </Link>
          {/* Badges */}
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            {isNew && (
              <Badge variant="default" className="bg-blue-500 text-white">
                Mới
              </Badge>
            )}
            {discountPercentage && discountPercentage > 0 && (
              <Badge variant="destructive">-{discountPercentage}%</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {/* Brand and Category */}
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
            {brandName && (
              <Link
                href={`/brands/${brandSlug}`}
                className="hover:text-primary"
              >
                {brandName}
              </Link>
            )}
            {primaryCategory && (
              <>
                {brandName && <span>•</span>}
                <Link
                  href={`/category/${primaryCategory.slug}`}
                  className="hover:text-primary"
                >
                  {primaryCategory.name}
                </Link>
              </>
            )}
          </div>

          {/* Product name */}
          <Link href={`/product/${slug}`} className="group-hover:text-primary">
            <h3 className="mb-2 text-lg font-medium text-gray-900">{name}</h3>
          </Link>

          {/* Ratings */}
          <div className="mb-2 flex items-center gap-1">
            <RatingStars rating={avgRating || 0} />
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="mt-auto flex items-center gap-2">
            <span className="text-lg font-medium text-gray-900">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock status */}
          {!inStock && (
            <p className="mt-1 text-sm font-medium text-red-500">Hết hàng</p>
          )}
          {inStock && stockQuantity <= 5 && (
            <p className="mt-1 text-sm font-medium text-amber-600">
              Chỉ còn {stockQuantity} sản phẩm
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleQuickView}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Xem nhanh</span>
            </Button>
            <WishlistButton productId={id} variant="icon" size="sm" />
          </div>
        </div>
      </div>
    );
  }

  // Minimal variant (for related products, small cards)
  if (variant === "minimal") {
    return (
      <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-200">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <Link href={`/product/${slug}`}>
            {mainImage && !imageError ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                onError={handleImageError}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </Link>

          {discountPercentage && discountPercentage > 0 && (
            <div className="absolute left-2 top-2 z-10">
              <Badge variant="destructive">-{discountPercentage}%</Badge>
            </div>
          )}

          {/* Wishlist button */}
          <div className="absolute right-2 top-2 z-10">
            <WishlistButton productId={id} variant="icon" size="sm" />
          </div>

          {/* Quick view */}
          {/* <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickView}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div> */}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <Link href={`/product/${slug}`} className="group-hover:text-primary">
            <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2">
              {name}
            </h3>
          </Link>

          <div className="mt-auto flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default card (standard grid view)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Product badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {isNew && (
          <Badge variant="default" className="bg-blue-500 text-white">
            Mới
          </Badge>
        )}
        {discountPercentage && discountPercentage > 0 && (
          <Badge variant="destructive">-{discountPercentage}%</Badge>
        )}
        {isFeatured && (
          <Badge variant="secondary" className="bg-purple-500 text-white">
            Nổi bật
          </Badge>
        )}
        {isDigital && (
          <Badge variant="outline" className="bg-gray-800 text-white">
            Digital
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton productId={id} variant="icon" size="md" />
      </div>

      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Link href={`/product/${slug}`}>
          <div className="h-full w-full">
            {mainImage && !imageError ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                onError={handleImageError}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </Link>

        {/* Quick actions overlay - visible on hover */}
        {/* <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickView}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div> */}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand and category */}
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          {brandName && (
            <Link href={`/brands/${brandSlug}`} className="hover:text-primary">
              {brandName}
            </Link>
          )}
          {primaryCategory && (
            <Link
              href={`/category/${primaryCategory.slug}`}
              className="hover:text-primary"
            >
              {primaryCategory.name}
            </Link>
          )}
        </div>

        {/* Product name */}
        <Link href={`/product/${slug}`} className="group-hover:text-primary">
          <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
            {name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mb-2 flex items-center gap-1">
          <RatingStars rating={avgRating || 0} />
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-lg font-medium text-gray-900">
            {formatPrice(price)}
          </span>

          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock status */}
        {!inStock && (
          <p className="mt-1 text-sm font-medium text-red-500">Hết hàng</p>
        )}
        {inStock && stockQuantity <= 5 && (
          <p className="mt-1 text-sm font-medium text-amber-600">
            Chỉ còn {stockQuantity}
          </p>
        )}

        {/* Sales count */}
        {salesCount !== undefined && (
          <p className="mt-1 text-xs text-gray-500">Đã bán: {salesCount}</p>
        )}

        {/* View details link */}
        <Link
          href={`/product/${slug}`}
          className="mt-3 inline-flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
        >
          Xem chi tiết <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
