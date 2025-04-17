"use client";

import {
  clearWishlist,
  getWishlist,
  toggleWishlistItem,
} from "@/app/actions/WishlistActions";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

// Định nghĩa kiểu dữ liệu cho WishlistItem
export interface WishlistItem {
  id: string;
  wishlistItemId: string;
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
  addedAt: Date;
}

// Định nghĩa kiểu dữ liệu cho WishlistContext
interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isItemInWishlist: (productId: string) => boolean;
  toggleWishlistItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

// Tạo Context
const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

// Provider Component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Lấy dữ liệu wishlist khi component mount
  useEffect(() => {
    fetchWishlistData();
  }, []);

  // Hàm lấy dữ liệu wishlist từ server
  const fetchWishlistData = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data.items);
      setWishlistCount(data.itemCount);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu wishlist:", error);
    }
  };

  // Kiểm tra sản phẩm có trong wishlist không
  const isItemInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.id === productId);
  };

  // Toggle sản phẩm trong wishlist
  const handleToggleWishlistItem = async (productId: string) => {
    setLoadingItems((prev) => new Set([...prev, productId]));

    try {
      const result = await toggleWishlistItem(productId);

      if (result.success) {
        // Cập nhật state
        if (isItemInWishlist(productId)) {
          // Nếu sản phẩm đã có trong wishlist, xóa nó đi
          setWishlist((prev) => prev.filter((item) => item.id !== productId));
          setWishlistCount((prev) => prev - 1);
        } else {
          // Lấy lại toàn bộ danh sách để có thông tin đầy đủ của sản phẩm mới thêm
          await fetchWishlistData();
        }

        // Hiển thị thông báo
        toast("Thành công.", {
          description: result.message,
        });
      } else {
        // Hiển thị thông báo lỗi
        toast("Có lỗi xảy ra. Vui lòng thử lại sau.", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi khi toggle wishlist item:", error);
      toast("Có lỗi xảy ra. Vui lòng thử lại sau.", {
        description: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Xóa toàn bộ danh sách yêu thích
  const handleClearWishlist = async () => {
    setIsLoading(true);
    try {
      const result = await clearWishlist();

      if (result.success) {
        // Cập nhật state
        setWishlist([]);
        setWishlistCount(0);

        // Hiển thị thông báo
        toast("thành công", {
          description: result.message,
        });
      } else {
        // Hiển thị thông báo lỗi
        toast("Có lỗi xảy ra", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh sách yêu thích:", error);
      toast("Có lỗi xảy ra", {
        description: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Làm mới danh sách wishlist
  const refreshWishlist = async () => {
    setIsLoading(true);
    try {
      await fetchWishlistData();
    } finally {
      setIsLoading(false);
    }
  };

  // Giá trị cung cấp cho context
  const value: WishlistContextType = {
    wishlist,
    wishlistCount,
    isItemInWishlist,
    toggleWishlistItem: handleToggleWishlistItem,
    clearWishlist: handleClearWishlist,
    isLoading,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Custom hook để sử dụng context
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
