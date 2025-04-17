// "use client";

// import { useState, useCallback, memo } from "react";
// import { ShoppingBag, Check, Loader2, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { addToCart } from "@/app/actions/cartActions";
// import { toast } from "sonner";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";

// // Types
// type ButtonStatus = "idle" | "loading" | "success" | "error";
// type ButtonSize = "default" | "sm" | "lg" | "xl";
// type ButtonPlacement = "card" | "detail";

// interface ProductCardAddToCartProps {
//   productId: string;
//   name: string;
//   inStock: boolean;
//   stockQuantity?: number;
//   size?: ButtonSize;
//   className?: string;
//   showIcon?: boolean;
//   fullWidth?: boolean;
//   variantId?: string | null;
//   quantity?: number;
//   onSuccess?: () => void;
//   placement?: ButtonPlacement;
// }

// // Low stock badge component
// const LowStockBadge = memo(({ count }: { count?: number }) => (
//   <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
//     Chỉ còn {count}
//   </span>
// ));

// LowStockBadge.displayName = "LowStockBadge";

// // Button icon component
// const ButtonIcon = memo(
//   ({ status, showIcon }: { status: ButtonStatus; showIcon: boolean }) => {
//     if (!showIcon) return null;

//     switch (status) {
//       case "loading":
//         return <Loader2 className="h-4 w-4 animate-spin" />;
//       case "success":
//         return <Check className="h-4 w-4" />;
//       case "error":
//         return <AlertCircle className="h-4 w-4" />;
//       default:
//         return <ShoppingBag className="h-4 w-4" />;
//     }
//   }
// );

// ButtonIcon.displayName = "ButtonIcon";

// // Main component
// export const ProductCardAddToCart = memo(
//   ({
//     productId,
//     name,
//     inStock,
//     stockQuantity,
//     size = "default",
//     className = "",
//     showIcon = true,
//     fullWidth = false,
//     variantId = null,
//     quantity = 1,
//     onSuccess,
//     placement = "card",
//   }: ProductCardAddToCartProps) => {
//     const [status, setStatus] = useState<ButtonStatus>("idle");

//     // Derived state
//     const isLoading = status === "loading";
//     const isSuccess = status === "success";
//     const isError = status === "error";
//     const isLowStock =
//       stockQuantity !== undefined && stockQuantity <= 5 && stockQuantity > 0;

//     // Handle add to cart action
//     const handleAddToCart = useCallback(async () => {
//       if (!inStock || isLoading) return;

//       setStatus("loading");

//       try {
//         const result = await addToCart(
//           productId,
//           quantity,
//           variantId || undefined
//         );

//         if (result.success) {
//           setStatus("success");
//           toast("Đã thêm vào giỏ hàng", {
//             description: `${quantity} x ${name} đã được thêm vào giỏ hàng`,
//           });

//           // Call success callback if provided
//           if (onSuccess) {
//             onSuccess();
//           }
//         } else {
//           setStatus("error");
//           toast("Không thể thêm vào giỏ hàng", {
//             description: result.error || "Đã có lỗi xảy ra, vui lòng thử lại",
//           });
//         }
//       } catch (error) {
//         console.error("Error adding to cart:", error);
//         setStatus("error");
//         toast("Không thể thêm vào giỏ hàng", {
//           description: "Đã có lỗi xảy ra, vui lòng thử lại",
//         });
//       } finally {
//         // Reset status to idle after 2 seconds if success or error
//         // if (status !== "loading") return;

//         const resetTimer = setTimeout(() => {
//           if (status === "success" || status === "error") {
//             setStatus("idle");
//           }
//         }, 2000);

//         return () => clearTimeout(resetTimer);
//       }
//     }, [
//       inStock,
//       isLoading,
//       productId,
//       quantity,
//       variantId,
//       name,
//       onSuccess,
//       status,
//     ]);

//     // Determine button text based on state
//     const getButtonText = useCallback(() => {
//       if (isLoading) return "Đang thêm...";
//       if (isSuccess) return "Đã thêm vào giỏ";
//       if (isError) return "Thử lại";
//       if (!inStock) return "Hết hàng";

//       return placement === "detail" ? "Thêm vào giỏ hàng" : "Thêm vào giỏ";
//     }, [isLoading, isSuccess, isError, inStock, placement]);

//     // Determine button variant based on state
//     const getButtonVariant = useCallback(() => {
//       if (!inStock) return "outline";
//       if (isError) return "destructive";
//       return "default";
//     }, [inStock, isError]);

//     // Class names for the button
//     const buttonClasses = cn(
//       fullWidth && "w-full",
//       showIcon && "gap-2",
//       className,
//       "transition-all duration-300",
//       isSuccess && "bg-green-600 hover:bg-green-700"
//     );

//     // Create the button content
//     const buttonContent = (
//       <Button
//         variant={getButtonVariant()}
//         size={size}
//         disabled={isLoading || !inStock}
//         onClick={handleAddToCart}
//         className={buttonClasses}
//         aria-busy={isLoading}
//         aria-live="polite"
//       >
//         <ButtonIcon status={status} showIcon={showIcon} />
//         <span>{getButtonText()}</span>
//         {isLowStock && placement === "detail" && (
//           <LowStockBadge count={stockQuantity} />
//         )}
//       </Button>
//     );

//     // Render with tooltip for low stock in card placement
//     if (isLowStock && placement === "card") {
//       return (
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <div className="relative">
//               {buttonContent}
//               <span className="absolute -top-2 -right-2 bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full border border-amber-300">
//                 {stockQuantity}
//               </span>
//             </div>
//           </TooltipTrigger>
//           <TooltipContent>
//             <p className="text-sm">Chỉ còn {stockQuantity} sản phẩm</p>
//           </TooltipContent>
//         </Tooltip>
//       );
//     }

//     return buttonContent;
//   }
// );

// ProductCardAddToCart.displayName = "ProductCardAddToCart";
"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { ShoppingBag, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/actions/cartActions";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { triggerCartRefresh } from "@/hooks/useCart";
import { notifyCartUpdated } from "@/context/CartContext";

// Types
type ButtonStatus = "idle" | "loading" | "success" | "error";
type ButtonSize = "default" | "sm" | "lg" | "xl";
type ButtonPlacement = "card" | "detail";

interface ProductCardAddToCartProps {
  productId: string;
  name: string;
  inStock: boolean;
  stockQuantity?: number;
  size?: ButtonSize;
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
  variantId?: string | null;
  quantity?: number;
  onSuccess?: () => void;
  placement?: ButtonPlacement;
}

// Low stock badge component
const LowStockBadge = memo(({ count }: { count?: number }) => (
  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
    Chỉ còn {count}
  </span>
));

LowStockBadge.displayName = "LowStockBadge";

// Button icon component
const ButtonIcon = memo(
  ({ status, showIcon }: { status: ButtonStatus; showIcon: boolean }) => {
    if (!showIcon) return null;

    switch (status) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <Check className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  }
);

ButtonIcon.displayName = "ButtonIcon";

// Main component
export const ProductCardAddToCart = memo(
  ({
    productId,
    name,
    inStock,
    stockQuantity,
    size = "default",
    className = "",
    showIcon = true,
    fullWidth = false,
    variantId = null,
    quantity = 1,
    onSuccess,
    placement = "card",
  }: ProductCardAddToCartProps) => {
    const [status, setStatus] = useState<ButtonStatus>("idle");

    // Derived state
    const isLoading = status === "loading";
    const isSuccess = status === "success";
    const isError = status === "error";
    const isLowStock =
      stockQuantity !== undefined && stockQuantity <= 5 && stockQuantity > 0;

    // Handle add to cart action
    const handleAddToCart = useCallback(async () => {
      if (!inStock || isLoading) return;

      setStatus("loading");

      try {
        const result = await addToCart(
          productId,
          quantity,
          variantId || undefined
        );

        if (result.success) {
          setStatus("success");
          toast("Đã thêm vào giỏ hàng", {
            description: `${quantity} x ${name} đã được thêm vào giỏ hàng`,
          });

          // Trigger cart refresh to update UI
          triggerCartRefresh();
          notifyCartUpdated();

          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setStatus("error");
          toast("Không thể thêm vào giỏ hàng", {
            description: result.error || "Đã có lỗi xảy ra, vui lòng thử lại",
          });
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        setStatus("error");
        toast("Không thể thêm vào giỏ hàng", {
          description: "Đã có lỗi xảy ra, vui lòng thử lại",
        });
      } finally {
        // Reset status to idle after 2 seconds if success or error
        const resetTimer = setTimeout(() => {
          if (status === "success" || status === "error") {
            setStatus("idle");
          }
        }, 2000);

        return () => clearTimeout(resetTimer);
      }
    }, [
      inStock,
      isLoading,
      productId,
      quantity,
      variantId,
      name,
      onSuccess,
      status,
    ]);
    useEffect(() => {
      if (status === "success" || status === "error") {
        const resetTimer = setTimeout(() => {
          setStatus("idle");
        }, 2000);

        return () => clearTimeout(resetTimer);
      }
    }, [status]);
    // Determine button text based on state
    const getButtonText = useCallback(() => {
      if (isLoading) return "Đang thêm...";
      if (isSuccess) return "Đã thêm vào giỏ";
      if (isError) return "Thử lại";
      if (!inStock) return "Hết hàng";

      return placement === "detail" ? "Thêm vào giỏ hàng" : "Thêm vào giỏ";
    }, [isLoading, isSuccess, isError, inStock, placement]);

    // Determine button variant based on state
    const getButtonVariant = useCallback(() => {
      if (!inStock) return "outline";
      if (isError) return "destructive";
      return "default";
    }, [inStock, isError]);

    // Class names for the button
    const buttonClasses = cn(
      fullWidth && "w-full",
      showIcon && "gap-2",
      className,
      "transition-all duration-300",
      isSuccess && "bg-green-600 hover:bg-green-700"
    );

    // Create the button content
    const buttonContent = (
      <Button
        variant={getButtonVariant()}
        size={size}
        disabled={isLoading || !inStock}
        onClick={handleAddToCart}
        className={buttonClasses}
        aria-busy={isLoading}
        aria-live="polite"
      >
        <ButtonIcon status={status} showIcon={showIcon} />
        <span>{getButtonText()}</span>
        {isLowStock && placement === "detail" && (
          <LowStockBadge count={stockQuantity} />
        )}
      </Button>
    );

    // Render with tooltip for low stock in card placement
    if (isLowStock && placement === "card") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              {buttonContent}
              <span className="absolute -top-2 -right-2 bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full border border-amber-300">
                {stockQuantity}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Chỉ còn {stockQuantity} sản phẩm</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  }
);

ProductCardAddToCart.displayName = "ProductCardAddToCart";
