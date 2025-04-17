"use client";

import { getProductDetail } from "@/app/actions/productActions";
// import { getProductDetail } from "@/app/actions/Product";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Loại dữ liệu cho sản phẩm trong Quick View
export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  description?: string | null;
  sku?: string;
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
  attributeValues?: { name: string; value: string }[];
  variants?: any[];
}

// Loại dữ liệu cho context
interface ProductQuickViewContextType {
  isOpen: boolean;
  isLoading: boolean;
  product: QuickViewProduct | null;
  openQuickView: (productId: string) => Promise<void>;
  closeQuickView: () => void;
}

// Tạo context
const ProductQuickViewContext = createContext<
  ProductQuickViewContextType | undefined
>(undefined);

// Provider component
export function ProductQuickViewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<QuickViewProduct | null>(null);

  // Mở quick view và lấy dữ liệu sản phẩm
  const openQuickView = async (productId: string) => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      // Gọi API lấy thông tin chi tiết sản phẩm
      const productData = await getProductDetail(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Đóng quick view
  const closeQuickView = () => {
    setIsOpen(false);
  };

  return (
    <ProductQuickViewContext.Provider
      value={{
        isOpen,
        isLoading,
        product,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </ProductQuickViewContext.Provider>
  );
}

// Hook để sử dụng context
export function useProductQuickView() {
  const context = useContext(ProductQuickViewContext);
  if (context === undefined) {
    throw new Error(
      "useProductQuickView must be used within a ProductQuickViewProvider"
    );
  }
  return context;
}
