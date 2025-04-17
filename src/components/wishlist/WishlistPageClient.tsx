"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/Product/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toggleWishlistItem } from "@/app/actions/WishlistActions";
import { useWishlist, WishlistItem } from "@/context/WishlistContext";
import { toast } from "sonner";

interface WishlistPageClientProps {
  initialWishlist: WishlistItem[];
}

export default function WishlistPageClient({
  initialWishlist,
}: WishlistPageClientProps) {
  const { clearWishlist, isLoading: isGlobalLoading } = useWishlist();
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Cập nhật state khi initialWishlist thay đổi (ví dụ: refresh)
  useEffect(() => {
    setWishlist(initialWishlist);
  }, [initialWishlist]);

  // Xử lý xóa sản phẩm khỏi wishlist
  const handleRemoveItem = async (productId: string) => {
    setIsRemoving((prev) => ({ ...prev, [productId]: true }));

    try {
      const result = await toggleWishlistItem(productId);

      if (result.success) {
        // Cập nhật UI
        setWishlist((prev) => prev.filter((item) => item.id !== productId));

        // Hiển thị thông báo
        toast("xóa thành công", {
          description: "Đã xóa sản phẩm khỏi danh sách yêu thích",
        });
      } else {
        toast("Có lỗi xảy ra", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast("Lỗi", {
        description: "Không thể xóa sản phẩm. Vui lòng thử lại sau.",
      });
    } finally {
      setIsRemoving((prev) => ({ ...prev, [productId]: false }));
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Xác nhận xóa sản phẩm
  const confirmDelete = (productId: string) => {
    setItemToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  // Xử lý xóa tất cả
  const handleClearAll = async () => {
    setIsClearDialogOpen(false);
    await clearWishlist();
    // Cập nhật UI (không cần thiết nếu sử dụng context)
    setWishlist([]);
  };

  // Nếu danh sách rỗng
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Heart className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Danh sách yêu thích trống</h2>
        <p className="text-gray-500 mb-6">
          Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
        </p>
        <Link href="/product">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="text-red-500 mr-2 h-5 w-5" />
            <h2 className="text-xl font-medium">
              {wishlist.length} sản phẩm trong danh sách yêu thích
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearDialogOpen(true)}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            disabled={isGlobalLoading}
          >
            {isGlobalLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Xóa tất cả
          </Button>
        </div>
      </div>

      {/* Mobile view (list) */}
      <div className="lg:hidden space-y-4">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="flex items-start p-4">
              <div className="relative h-24 w-24 flex-shrink-0 rounded overflow-hidden bg-gray-100 mr-4">
                {item.mainImage ? (
                  <Image
                    src={item.mainImage.url}
                    alt={item.mainImage.alt || item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-lg font-medium hover:text-primary"
                >
                  {item.name}
                </Link>

                <p className="text-sm text-gray-500">
                  {item.categories?.[0]?.name || ""}
                </p>

                <div className="mt-2 flex items-center">
                  <span className="text-lg font-medium">
                    {formatPrice(item.price)}
                  </span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatPrice(item.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex space-x-2">
                  <Link href={`/product/${item.slug}`}>
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Thêm vào giỏ
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(item.id)}
                    disabled={isRemoving[item.id]}
                  >
                    {isRemoving[item.id] ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view (grid) */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard {...item} />
            <button
              onClick={() => confirmDelete(item.id)}
              className="absolute top-12 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              disabled={isRemoving[item.id]}
              aria-label="Xóa khỏi yêu thích"
            >
              {isRemoving[item.id] ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Trash2 className="h-5 w-5 text-red-500" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Single item delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleRemoveItem(itemToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tất cả sản phẩm yêu thích?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích
              không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
