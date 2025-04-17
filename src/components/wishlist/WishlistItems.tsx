"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";

import { addToCart } from "@/app/actions/cartActions";
import {
  clearWishlist,
  removeFromWishlist,
} from "@/app/actions/WishlistActions";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity: number;
    image: {
      url: string;
      alt: string;
    } | null;
    brand?: string;
    avgRating?: number;
    reviewCount?: number;
    discountPercentage?: number | null;
    categories: { name: string; slug: string }[];
  };
  addedAt: string;
}

interface WishlistItemsProps {
  initialItems: WishlistItem[];
}

export default function WishlistItems({ initialItems }: WishlistItemsProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleRemoveItem = async (itemId: string) => {
    // Update loading state
    setLoadingStates((prev) => ({ ...prev, [itemId]: true }));

    try {
      const result = await removeFromWishlist(itemId);

      if (result.success) {
        // Remove item from local state
        setItems((prev) => prev.filter((item) => item.id !== itemId));

        toast("Đã xóa sản phẩm", {
          description: "Sản phẩm đã được xóa khỏi danh sách yêu thích",
        });
      } else {
        toast("Không thể xóa sản phẩm", {
          description: "Đã có lỗi xảy ra",
        });
      }
    } catch (error) {
      toast("Lỗi", {
        description: "Đã có lỗi xảy ra khi xóa sản phẩm",
      });
    } finally {
      // Reset loading state
      setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearWishlist = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?"
      )
    ) {
      return;
    }

    setIsClearing(true);

    try {
      const result = await clearWishlist();

      if (result.success) {
        // Clear all items from local state
        setItems([]);

        toast("Đã xóa danh sách yêu thích", {
          description: "Tất cả sản phẩm đã được xóa khỏi danh sách yêu thích",
        });
      } else {
        toast("Không thể xóa danh sách yêu thích", {
          description: "Đã có lỗi xảy ra",
        });
      }
    } catch (error) {
      toast("Lỗi", {
        description: "Đã có lỗi xảy ra khi xóa danh sách yêu thích",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleAddToCart = async (productId: string, itemId: string) => {
    // Update loading state
    setLoadingStates((prev) => ({ ...prev, [`cart-${itemId}`]: true }));

    try {
      const result = await addToCart({
        productId,
        quantity: 1,
      });

      if (result.success) {
        toast("Đã thêm vào giỏ hàng", {
          description: "Sản phẩm đã được thêm vào giỏ hàng",
        });
      } else {
        toast("Không thể thêm vào giỏ hàng", {
          description: "Đã có lỗi xảy ra",
        });
      }
    } catch (error) {
      toast("Lỗi", {
        description: "Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng",
      });
    } finally {
      // Reset loading state
      setLoadingStates((prev) => ({ ...prev, [`cart-${itemId}`]: false }));
    }
  };

  // If all items have been removed, show empty state
  if (items.length === 0) {
    router.refresh(); // Refresh the page to show the empty state component

    return (
      <div className="text-center p-10 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-medium mb-4">Danh sách yêu thích trống</h2>
        <p className="text-gray-500 mb-6">
          Bạn chưa có sản phẩm nào trong danh sách yêu thích
        </p>
        <Button asChild>
          <Link href="/product">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with action button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">
          Các sản phẩm đã thích ({items.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearWishlist}
          disabled={isClearing}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          {isClearing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xóa...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa tất cả
            </>
          )}
        </Button>
      </div>

      {/* Wishlist items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative"
          >
            {/* Overlay when loading */}
            {(loadingStates[item.id] || loadingStates[`cart-${item.id}`]) && (
              <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Discount badge */}
            {item.product.discountPercentage &&
              item.product.discountPercentage > 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{item.product.discountPercentage}%
                  </span>
                </div>
              )}

            {/* Remove button */}
            <button
              className="absolute top-2 right-2 z-10 p-1 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-red-500 transition-colors"
              onClick={() => handleRemoveItem(item.id)}
              disabled={loadingStates[item.id]}
              aria-label="Xóa khỏi danh sách yêu thích"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Product image */}
            <Link
              href={`/product/${item.product.slug}`}
              className="block relative aspect-square"
            >
              {item.product.image ? (
                <Image
                  src={item.product.image.url}
                  alt={item.product.image.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </Link>

            {/* Product info */}
            <div className="p-4">
              <Link href={`/product/${item.product.slug}`} className="block">
                <h3 className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-1">
                  {item.product.name}
                </h3>
              </Link>

              {item.product.brand && (
                <p className="text-xs text-gray-500 mb-2">
                  {item.product.brand}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.product.price)}
                </span>

                {item.product.compareAtPrice &&
                  item.product.compareAtPrice > item.product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(item.product.compareAtPrice)}
                    </span>
                  )}
              </div>

              {/* Stock status */}
              <div className="mb-4">
                {item.product.stockQuantity > 0 ? (
                  <span className="text-xs text-green-600">Còn hàng</span>
                ) : (
                  <span className="text-xs text-red-600">Hết hàng</span>
                )}
              </div>

              {/* Add to cart button */}
              <Button
                onClick={() => handleAddToCart(item.product.id, item.id)}
                disabled={
                  item.product.stockQuantity <= 0 ||
                  loadingStates[`cart-${item.id}`]
                }
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
