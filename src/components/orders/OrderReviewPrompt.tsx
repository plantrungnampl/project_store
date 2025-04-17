'use client'

import { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface OrderReviewPromptProps {
  orderNumber: string;
  products: Product[];
  className?: string;
}

export default function OrderReviewPrompt({ orderNumber, products, className }: OrderReviewPromptProps) {
  const [reviewedProducts, setReviewedProducts] = useState<Record<string, boolean>>({});
  
  // Theo dõi các sản phẩm đã được đánh giá
  const handleProductReviewed = (productId: string) => {
    setReviewedProducts(prev => ({
      ...prev,
      [productId]: true
    }));
  };
  
  // Lọc ra các sản phẩm chưa được đánh giá
  const unreviewed = products.filter(product => !reviewedProducts[product.id]);
  
  // Nếu tất cả sản phẩm đã được đánh giá, hiển thị thông báo cảm ơn
  if (unreviewed.length === 0 && products.length > 0) {
    return (
      <div className={cn("bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8", className)}>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cảm ơn bạn đã đánh giá!
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Ý kiến của bạn rất quan trọng và giúp người dùng khác đưa ra quyết định mua hàng.
          </p>
        </div>
      </div>
    );
  }
  
  // Nếu không có sản phẩm nào, không hiển thị component
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 md:p-6 mb-8 transition-all", className)}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-yellow-50 mb-4">
        Đánh giá sản phẩm
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Chia sẻ trải nghiệm của bạn bằng cách đánh giá các sản phẩm đã mua!
      </p>
      
      <div className="space-y-4">
        {unreviewed.slice(0, 3).map((product) => (
          <div key={product.id} className="flex items-center justify-between space-x-2 border-b dark:border-gray-700 pb-3 last:border-0">
            <div className="flex items-center space-x-3">
              {product.image && (
                <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden relative flex-shrink-0">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    width={40}
                    height={40}
                    className="object-cover"
                    onError={(e) => {
                      // Fallback khi ảnh lỗi
                      (e.target as HTMLImageElement).src = '/images/placeholder.png';
                    }}
                  />
                </div>
              )}
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base line-clamp-1">
                {product.name}
              </span>
            </div>
            <Link 
              href={`/product/${product.slug}/review?order=${orderNumber}`} 
              onClick={() => handleProductReviewed(product.id)}
              className="flex-shrink-0"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-1 bg-white dark:bg-gray-800">
                <Star className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Đánh giá</span>
                <span className="inline md:hidden">Đánh giá</span>
              </Button>
            </Link>
          </div>
        ))}
        
        {unreviewed.length > 3 && (
          <div className="text-center pt-2">
            <Link href={`/profile/orders/${orderNumber}?review=true`}>
              <Button variant="link" size="sm" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
                Xem thêm {unreviewed.length - 3} sản phẩm
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}