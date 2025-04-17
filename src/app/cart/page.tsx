"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { Package2, Minus, Plus, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  // Track client-side mounting state
  const [isMounted, setIsMounted] = useState(false);

  const { items, cartCount, totals, isLoading, init, updateItem, removeItem } =
    useCart();
  const { subtotal, shippingTotal, taxTotal, grandTotal } = totals;

  // Set mounted state and initialize cart
  useEffect(() => {
    setIsMounted(true);
    init();
  }, [init]);

  // Show skeleton loader during hydration/loading
  if (!isMounted || isLoading) {
    return <CartPageSkeleton />;
  }

  // Show empty cart view
  if (!items.length) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <Package2 className="h-16 w-16 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-semibold mb-2">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-muted-foreground mb-6">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </p>
          <Button asChild>
            <Link href="/product">Bắt đầu mua sắm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-8">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                  {item?.image ? (
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <Package2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-base font-medium">
                        <Link
                          href={`/product/${item.slug}`}
                          className="hover:underline"
                        >
                          {item.name}
                        </Link>
                      </h3>
                      {item.variant && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.variant.name}
                        </p>
                      )}
                      {item.sku && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                    <p className="text-base font-medium">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={
                          item.quantity >=
                            (item.variant?.stockQuantity ||
                              item.product?.stockQuantity) || isLoading
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Xoá
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Tạm tính ({cartCount} sản phẩm)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển</span>
                <span>
                  {shippingTotal === 0
                    ? "Miễn phí"
                    : formatPrice(shippingTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Thuế</span>
                <span>{formatPrice(taxTotal)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            <Button asChild className="w-full mt-6" disabled={isLoading}>
              <Link href="/checkout">Tiến hành thanh toán</Link>
            </Button>

            <div className="mt-4 text-center">
              <Link
                href="/product"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader component for cart page
function CartPageSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex gap-4 p-4 rounded-lg border bg-card"
              >
                <Skeleton className="h-24 w-24 flex-shrink-0 rounded-md" />

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-40 mb-4" />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>

            <Skeleton className="h-10 w-full mt-6" />

            <div className="mt-4 text-center">
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
