"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "default" | "text" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
  showTooltip?: boolean;
}

export default function WishlistButton({
  productId,
  variant = "icon",
  size = "md",
  className = "",
  iconOnly = false,
  showTooltip = true,
}: WishlistButtonProps) {
  const { isItemInWishlist, toggleWishlistItem } = useWishlist();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const router = useRouter();

  // Cập nhật trạng thái yêu thích khi component mount
  useEffect(() => {
    try {
      setIsFavorite(isItemInWishlist(productId));
    } catch (error) {
      // Xử lý trường hợp context chưa được khởi tạo
      console.error("WishlistContext error:", error);
    }
  }, [productId, isItemInWishlist]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(true);
      await toggleWishlistItem(productId);

      // Đảo ngược trạng thái yêu thích (optimistic update)
      const newState = !isFavorite;
      setIsFavorite(newState);

      // Hiển thị thông báo
      // toast(newState ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích", {
      //   description: newState
      //     ? "Sản phẩm đã được thêm vào danh sách yêu thích của bạn."
      //     : "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.",
      //   position: "top-right",
      // });
    } catch (error) {
      if ((error as Error).message.includes("đăng nhập")) {
        setShowLoginDialog(true);
      } else {
        toast("Có lỗi xảy ra", {
          description:
            "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setShowLoginDialog(false);
    router.push("/login");
  };

  // Xác định các variants của button
  const getButtonProps = () => {
    switch (variant) {
      case "icon":
        return {
          className: cn(
            "rounded-full transition-all duration-200",
            size === "sm" ? "p-1" : size === "lg" ? "p-2.5" : "p-2",
            isFavorite
              ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-200"
              : "bg-white text-gray-500 hover:text-red-500 hover:bg-gray-50 border-gray-200",
            "border shadow-sm",
            className
          ),
          children: (
            <>
              {isLoading ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    size === "sm"
                      ? "h-3 w-3"
                      : size === "lg"
                      ? "h-5 w-5"
                      : "h-4 w-4"
                  )}
                />
              ) : (
                <Heart
                  className={cn(
                    "transition-all duration-300",
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "fill-transparent",
                    size === "sm"
                      ? "h-3 w-3"
                      : size === "lg"
                      ? "h-5 w-5"
                      : "h-4 w-4"
                  )}
                />
              )}
            </>
          ),
        };
      case "default":
        return {
          variant: isFavorite ? "default" : "outline",
          className: cn(
            "gap-2 transition-colors duration-200",
            isFavorite
              ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
              : "hover:text-red-500 hover:border-red-200",
            className
          ),
          size: size === "sm" ? "sm" : size === "lg" ? "lg" : "default",
          children: (
            <>
              {isLoading ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    size === "sm"
                      ? "h-3 w-3"
                      : size === "lg"
                      ? "h-5 w-5"
                      : "h-4 w-4"
                  )}
                />
              ) : (
                <Heart
                  className={cn(
                    "transition-all duration-300",
                    size === "sm"
                      ? "h-3 w-3"
                      : size === "lg"
                      ? "h-5 w-5"
                      : "h-4 w-4",
                    isFavorite ? "fill-current" : "fill-transparent"
                  )}
                />
              )}
              {!iconOnly && (
                <span>{isFavorite ? "Đã yêu thích" : "Yêu thích"}</span>
              )}
            </>
          ),
        };
      case "text":
        return {
          variant: "link",
          className: cn(
            "p-0 h-auto gap-1.5 hover:no-underline",
            isFavorite ? "text-red-500" : "text-gray-500 hover:text-red-500",
            className
          ),
          size: "sm",
          children: (
            <>
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "h-3.5 w-3.5",
                    isFavorite ? "fill-current" : "fill-transparent"
                  )}
                />
              )}
              {!iconOnly && (
                <span className="text-sm">
                  {isFavorite ? "Đã thêm vào yêu thích" : "Thêm vào yêu thích"}
                </span>
              )}
            </>
          ),
        };
      case "minimal":
        return {
          variant: "ghost",
          className: cn(
            "p-0 h-auto hover:bg-transparent",
            isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500",
            className
          ),
          size: "sm",
          children: (
            <>
              {isLoading ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    size === "sm"
                      ? "h-3 w-3"
                      : size === "lg"
                      ? "h-5 w-5"
                      : "h-4 w-4"
                  )}
                />
              ) : (
                <Heart
                  className={cn(
                    "transition-all duration-300",
                    size === "sm"
                      ? "h-3 w-3"
                      : size === "lg"
                      ? "h-5 w-5"
                      : "h-4 w-4",
                    isFavorite ? "fill-current" : "fill-transparent"
                  )}
                />
              )}
            </>
          ),
        };
      default:
        return {};
    }
  };

  const buttonProps = getButtonProps();
  const button = (
    <Button
      type="button"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      {...buttonProps}
      aria-label={
        isFavorite
          ? "Xóa khỏi danh sách yêu thích"
          : "Thêm vào danh sách yêu thích"
      }
    />
  );

  return (
    <>
      {showTooltip && variant !== "default" && !iconOnly ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng nhập để sử dụng tính năng</DialogTitle>
            <DialogDescription>
              Bạn cần đăng nhập hoặc đăng ký tài khoản để thêm sản phẩm vào danh
              sách yêu thích.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
            >
              Để sau
            </Button>
            <Button type="button" onClick={handleLogin}>
              Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
