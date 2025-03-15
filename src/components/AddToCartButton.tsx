"use client";
// components/AddToCartButton.tsx
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  inStock: boolean;
}

export function AddToCartButton({ productId, inStock }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!inStock) return;

    setIsLoading(true);
    try {
      // Gọi server action để thêm vào giỏ hàng
      // await addToCart(productId);
      console.log("Thêm sản phẩm vào giỏ hàng:", productId);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      className="w-full gap-2"
      disabled={!inStock || isLoading}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-4 w-4" />
      {isLoading ? "Đang thêm..." : inStock ? "Thêm vào giỏ" : "Hết hàng"}
    </Button>
  );
}
