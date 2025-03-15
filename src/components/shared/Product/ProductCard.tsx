// "use client";
// import React from "react";
// import { ShoppingCart, Heart, Star, Tag, ExternalLink } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { formatPrice } from "@/lib/formatPrice";

// interface ProductCardProps {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compareAtPrice?: number | null;
//   stockQuantity: number;
//   isActive: boolean;
//   isFeatured: boolean;
//   isDigital: boolean;
//   images: {
//     id: string;
//     url: string;
//     alt?: string;
//     isDefault: boolean;
//   }[];
//   brand?: {
//     id: string;
//     name: string;
//     slug: string;
//   } | null;
//   categories?: {
//     category: {
//       id: string;
//       name: string;
//       slug: string;
//     };
//   }[];
//   reviews?: {
//     rating: number;
//   }[];
//   publishedAt?: Date | null;
//   onAddToCart?: (id: string) => void;
//   onAddToWishlist?: (id: string) => void;
// }

// export const ProductCard = ({
//   id,
//   name,
//   slug,
//   price,
//   compareAtPrice,
//   stockQuantity,
//   isActive,
//   isFeatured,
//   isDigital,
//   images,
//   brand,
//   categories,
//   reviews,
//   publishedAt,
//   onAddToCart,
//   onAddToWishlist,
// }: ProductCardProps) => {
//   // Find default image or first image

//   const mainImage = images.find((img) => img.isDefault) || images[0];

//   // Calculate discount percentage if there's a compare price
//   const discountPercentage =
//     compareAtPrice && compareAtPrice > price
//       ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
//       : null;

//   // Calculate average rating
//   const averageRating =
//     reviews && reviews.length > 0
//       ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
//       : 0;

//   // Get primary category if available
//   const primaryCategory =
//     categories && categories.length > 0 ? categories[0].category : null;

//   // Check if product is new (published within last 14 days)
//   const isNew = publishedAt
//     ? (new Date().getTime() - new Date(publishedAt).getTime()) /
//         (1000 * 3600 * 24) <=
//       14
//     : false;

//   // Check if product is in stock
//   const inStock = stockQuantity > 0;

//   const handleAddToCart = () => {
//     if (onAddToCart) onAddToCart(id);
//   };

//   const handleAddToWishlist = () => {
//     if (onAddToWishlist) onAddToWishlist(id);
//   };

//   if (!isActive) return null;

//   return (
//     <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
//       {/* Product badges */}
//       <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
//         {isNew && (
//           <Badge variant="default" className="bg-blue-500 text-white">
//             New
//           </Badge>
//         )}
//         {discountPercentage && discountPercentage > 0 && (
//           <Badge variant="destructive">-{discountPercentage}%</Badge>
//         )}
//         {isFeatured && (
//           <Badge variant="secondary" className="bg-purple-500 text-white">
//             Featured
//           </Badge>
//         )}
//         {isDigital && (
//           <Badge variant="outline" className="bg-gray-800 text-white">
//             Digital
//           </Badge>
//         )}
//       </div>

//       {/* Wishlist button */}
//       <button
//         className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:text-red-500"
//         onClick={handleAddToWishlist}
//         aria-label="Add to wishlist"
//       >
//         <Heart className="h-5 w-5" />
//       </button>

//       {/* Image container */}
//       <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
//         <Link href={`/products/${slug}`}>
//           <div className="h-full w-full">
//             {/* {mainImage ? (
//               <Image
//                 src={mainImage.url}
//                 alt={mainImage.alt || name}
//                 fill
//                 className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
//                 sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center bg-gray-200">
//                 <Tag className="h-12 w-12 text-gray-400" />
//               </div>
//             )} */}
//           </div>
//         </Link>

//         {/* Quick add to cart - visible on hover */}
//         <div className="absolute bottom-0 left-0 w-full translate-y-full bg-black/75 p-2 transition-transform duration-200 group-hover:translate-y-0">
//           <Button
//             variant="default"
//             className="w-full gap-2"
//             disabled={!inStock || !isActive}
//             onClick={handleAddToCart}
//           >
//             <ShoppingCart className="h-4 w-4" />
//             {inStock ? "Add to Cart" : "Out of Stock"}
//           </Button>
//         </div>
//       </div>

//       {/* Product info */}
//       <div className="flex flex-1 flex-col p-4">
//         {/* Brand and category */}
//         <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
//           {brand && <span>{brand.name}</span>}
//           {primaryCategory && <span>{primaryCategory.name}</span>}
//         </div>

//         {/* Product name */}
//         <Link href={`/products/${slug}`} className="group-hover:text-blue-600">
//           <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
//             {name}
//           </h3>
//         </Link>

//         {/* Ratings */}
//         {reviews && reviews.length > 0 && (
//           <div className="mb-2 flex items-center gap-1">
//             <div className="flex items-center">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-4 w-4 ${
//                     i < Math.floor(averageRating)
//                       ? "fill-amber-400 text-amber-400"
//                       : "fill-gray-200 text-gray-200"
//                   }`}
//                 />
//               ))}
//             </div>
//             <span className="text-xs text-gray-500">({reviews.length})</span>
//           </div>
//         )}

//         {/* Price */}
//         <div className="mt-auto flex items-center gap-2">
//           <span className="text-lg font-medium text-gray-900">
//             {formatPrice(price)}
//           </span>

//           {compareAtPrice && compareAtPrice > price && (
//             <span className="text-sm text-gray-500 line-through">
//               {formatPrice(compareAtPrice)}
//             </span>
//           )}
//         </div>

//         {/* Stock status */}
//         {!inStock && (
//           <p className="mt-1 text-sm font-medium text-red-500">Out of stock</p>
//         )}
//         {inStock && stockQuantity <= 5 && (
//           <p className="mt-1 text-sm font-medium text-amber-600">
//             Only {stockQuantity} left
//           </p>
//         )}

//         {/* View details link */}
//         <Link
//           href={`/products/${slug}`}
//           className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100"
//         >
//           View details <ExternalLink className="ml-1 h-4 w-4" />
//         </Link>
//       </div>
//     </div>
//   );
// };
"use client";
import React from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Tag,
  ExternalLink,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";

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
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
  onQuickView?: (id: string) => void;
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
  // images,
  salesCount,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  variant = "default",
}: ProductCardProps) => {
  // Tính toán các giá trị hiển thị
  const inStock = stockQuantity > 0;

  // Primary category if available
  const primaryCategory =
    categories && categories.length > 0 ? categories[0] : null;

  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(id);
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) onAddToWishlist(id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) onQuickView(id);
  };

  if (!isActive) return null;

  // Compact variant (for sidebars, mini carts)
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt || name}
              fill
              className="object-cover object-center"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <Link href={`/products/${slug}`} className="hover:text-blue-600">
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
      </div>
    );
  }

  // Horizontal variant (for search results, comparison tables)
  if (variant === "horizontal") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
        <div className="relative aspect-square sm:w-48 w-full overflow-hidden rounded-md bg-gray-100">
          <Link href={`/products/${slug}`}>
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
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
                className="hover:text-blue-600"
              >
                {brandName}
              </Link>
            )}
            {primaryCategory && (
              <>
                {brandName && <span>•</span>}
                <Link
                  href={`/categories/${primaryCategory.slug}`}
                  className="hover:text-blue-600"
                >
                  {primaryCategory.name}
                </Link>
              </>
            )}
          </div>

          {/* Product name */}
          <Link
            href={`/products/${slug}`}
            className="group-hover:text-blue-600"
          >
            <h3 className="mb-2 text-lg font-medium text-gray-900">{name}</h3>
          </Link>

          {/* Ratings */}
          {avgRating && avgRating > 0 && (
            <div className="mb-2 flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
          )}

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
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-2"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              {inStock ? "Thêm vào giỏ" : "Hết hàng"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleQuickView}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Xem nhanh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddToWishlist}>
              <Heart className="h-4 w-4" />
              <span className="sr-only">Thêm vào yêu thích</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Minimal variant (for related products, small cards)
  if (variant === "minimal") {
    return (
      <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <Link href={`/products/${slug}`}>
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </Link>

          {discountPercentage && discountPercentage > 0 && (
            <div className="absolute right-2 top-2 z-10">
              <Badge variant="destructive">-{discountPercentage}%</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <Link
            href={`/products/${slug}`}
            className="group-hover:text-blue-600"
          >
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
      <button
        className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:text-red-500"
        onClick={handleAddToWishlist}
        aria-label="Thêm vào yêu thích"
      >
        <Heart className="h-5 w-5" />
      </button>

      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Link href={`/products/${slug}`}>
          <div className="h-full w-full">
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Quick actions overlay - visible on hover */}
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="default"
            className="bg-white text-gray-900 hover:bg-gray-100"
            size="sm"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem nhanh
          </Button>
        </div>

        {/* Quick add to cart - visible on hover */}
        <div className="absolute bottom-0 left-0 w-full translate-y-full bg-black/75 p-2 transition-transform duration-200 group-hover:translate-y-0">
          <Button
            variant="default"
            className="w-full gap-2"
            disabled={!inStock || !isActive}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "Thêm vào giỏ" : "Hết hàng"}
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand and category */}
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          {brandName && <span>{brandName}</span>}
          {primaryCategory && <span>{primaryCategory.name}</span>}
        </div>

        {/* Product name */}
        <Link href={`/products/${slug}`} className="group-hover:text-blue-600">
          <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
            {name}
          </h3>
        </Link>

        {/* Ratings */}
        {avgRating && avgRating > 0 && (
          <div className="mb-2 flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

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

        {/* Sales count - Only show for bestselling products */}
        {salesCount && salesCount > 0 && (
          <p className="mt-1 text-xs text-gray-500">Đã bán: {salesCount}</p>
        )}

        {/* View details link */}
        <Link
          href={`/products/${slug}`}
          className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100"
        >
          Xem chi tiết <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
