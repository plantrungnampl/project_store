"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSummary() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, cartCount, totals, isLoading, init } = useCart();
  const { subtotal, shippingTotal, taxTotal, grandTotal } = totals;
  const router = useRouter();
  console.log("item===",items)
  // Khởi tạo cart và đánh dấu mounted
  useEffect(() => {
    setIsMounted(true);
    init();
  }, [init]);

  // Kiểm tra giỏ hàng trống và chuyển hướng
  useEffect(() => {
    // Chỉ thực hiện sau khi component mounted và data đã load
    if (isMounted && !isLoading && items.length === 0) {
      setTimeout(() => {
        router.push("/cart");
      }, 100);
    }
  }, [isMounted, isLoading, items.length, router]);

  // Hiển thị skeleton loader trong lúc chờ dữ liệu
  if (!isMounted || isLoading) {
    return <OrderSummarySkeleton />;
  }

  // Không render gì nếu giỏ hàng trống (sẽ redirect)
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Đơn hàng của bạn
        </h2>
      </div>

      <div className="p-6">
        {/* Items list */}
        <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {/* Product thumbnail */}
              <div className="flex-shrink-0 relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                {item.product?.mainImage ? (
                  <Image
                    src={item.product?.mainImage.url}
                    alt={item.product?.mainImage.alt || item.product.name}
                    fill
                    className="object-cover object-center"
                    sizes="64px"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product?.slug}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-1"
                >
                  {item?.product?.name}
                </Link>

                {item.variant && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.variant.name}
                  </p>
                )}

                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {formatPrice(item.price)} x {item.quantity}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {/* Removed discount logic as it's not in useCart data */}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phí vận chuyển</span>
            {shippingTotal > 0 ? (
              <span className="font-medium">{formatPrice(shippingTotal)}</span>
            ) : (
              <span className="font-medium text-green-600">Miễn phí</span>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Thuế (VAT)</span>
            <span className="font-medium">{formatPrice(taxTotal)}</span>
          </div>

          <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-semibold">
            <span>Tổng cộng</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Promotion / Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="text-gray-600">
            <span className="font-medium">Miễn phí vận chuyển</span> cho đơn
            hàng từ 500.000đ
          </p>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader component for order summary
function OrderSummarySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
      <div className="p-6 border-b border-gray-200">
        <Skeleton className="h-7 w-40" />
      </div>

      <div className="p-6">
        {/* Items list skeleton */}
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/4 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary skeleton */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Promotion skeleton */}
        <div className="mt-6">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
