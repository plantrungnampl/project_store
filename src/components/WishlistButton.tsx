"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { validateRequest } from "@/auth";
import {
  addToWishlist,
  isProductInWishlist,
  removeFromWishlist,
} from "@/app/actions/WishlistActions";

interface WishlistButtonProps {
  productId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({
  productId,
  variant = "outline",
  size = "icon",
  className = "",
  showText = false,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { data: session } = validateRequest();
  const router = useRouter();

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlist = async () => {
      if (!session) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await isProductInWishlist(productId);

        if (result.success) {
          setIsInWishlist(result?.isInWishlist);
          if (result.itemId) {
            setItemId(result.itemId);
          }
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWishlist();
  }, [productId, session]);

  const handleWishlistAction = async () => {
    if (!session) {
      // Redirect to login if not logged in
      router.push(`/login?callbackUrl=/products?productId=${productId}`);
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist && itemId) {
        // Remove from wishlist
        const result = await removeFromWishlist(itemId);

        if (result.success) {
          setIsInWishlist(false);
          setItemId(null);
          toast("Đã xóa khỏi danh sách yêu thích", {
            description: "Sản phẩm đã được xóa khỏi danh sách yêu thích",
          });
        } else {
          toast("Không thể xóa khỏi danh sách yêu thích", {
            description: result.error || "Đã có lỗi xảy ra",
          });
        }
      } else {
        // Add to wishlist
        const result = await addToWishlist(productId);

        if (result.success) {
          // Re-check wishlist status to get the item ID
          const checkResult = await isProductInWishlist(productId);

          if (checkResult.success) {
            setIsInWishlist(checkResult.isInWishlist ?? true);
            if (checkResult.itemId) {
              setItemId(checkResult.itemId);
            }
          }

          toast("Đã thêm vào danh sách yêu thích", {
            description: "Sản phẩm đã được thêm vào danh sách yêu thích",
          });
        } else {
          toast("Không thể thêm vào danh sách yêu thích", {
            description: result.error || "Đã có lỗi xảy ra",
          });
        }
      }
    } catch (error) {
      toast("Lỗi", {
        description: "Đã có lỗi xảy ra khi cập nhật danh sách yêu thích",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${
        isInWishlist ? "text-red-500 hover:text-red-600" : ""
      }`}
      onClick={handleWishlistAction}
      disabled={isLoading || isChecking}
      aria-label={
        isInWishlist
          ? "Xóa khỏi danh sách yêu thích"
          : "Thêm vào danh sách yêu thích"
      }
    >
      {isChecking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
          {showText && (
            <span className="ml-2">
              {isInWishlist ? "Đã thích" : "Yêu thích"}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
