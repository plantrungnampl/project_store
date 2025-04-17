"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Tag,
  CreditCard,
  ShoppingBag,
  X,
  Trash2,
  CheckCircle,
  Shield,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/formatPrice";
import { applyCoupon, clearCart } from "@/app/actions/cartActions";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useCart } from "@/hooks/useCart";

// Types
interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CartData {
  id: string;
  items: any[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  currencyCode: string;
  itemCount: number;
  appliedCoupons?: AppliedCoupon[];
}

interface CartSummaryProps {
  cart: CartData;
}

// Security badge component
const SecurityBadge = memo(
  ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center text-gray-500 text-xs">
      {icon}
      <span>{text}</span>
    </div>
  )
);
SecurityBadge.displayName = "SecurityBadge";

// Summary item row component
const SummaryRow = memo(
  ({
    label,
    value,
    className,
  }: {
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className={`flex justify-between ${className || "text-gray-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
);
SummaryRow.displayName = "SummaryRow";

// Coupon item component
const CouponItem = memo(
  ({ code, amount }: { code: string; amount: number }) => (
    <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded-md">
      <div className="flex items-center">
        <Tag className="h-3.5 w-3.5 mr-2" />
        <span className="text-sm font-medium">{code}</span>
      </div>
      <span>-{formatPrice(amount)}</span>
    </div>
  )
);
CouponItem.displayName = "CouponItem";

// CouponForm component
const CouponForm = memo(
  ({
    couponCode,
    setCouponCode,
    onSubmit,
    onCancel,
    isLoading,
  }: {
    couponCode: string;
    setCouponCode: (code: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading: boolean;
  }) => (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Nhập mã giảm giá"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1"
          disabled={isLoading}
          aria-label="Mã giảm giá"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="flex-shrink-0"
          aria-label="Đóng form mã giảm giá"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isLoading || !couponCode.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Đang áp dụng...</span>
          </>
        ) : (
          <>
            <Tag className="h-4 w-4 mr-2" />
            <span>Áp dụng mã giảm giá</span>
          </>
        )}
      </Button>
    </form>
  )
);
CouponForm.displayName = "CouponForm";

// Main component
export default function CartSummary({ cart }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();
  const handleApplyCoupon = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!couponCode.trim()) {
        toast("Mã giảm giá trống", {
          description: "Vui lòng nhập mã giảm giá",
        });
        return;
      }

      setIsApplyingCoupon(true);

      try {
        const result = await applyCoupon(couponCode);

        if (result.success) {
          toast("Áp dụng mã giảm giá thành công", {
            description: `Bạn được giảm ${formatPrice(result.discount || 0)}`,
          });
          setCouponCode("");
          setShowCouponForm(false);
        } else {
          toast("Không thể áp dụng mã giảm giá", {
            description: result.error,
          });
        }
      } catch (error) {
        console.log(error);
        toast("Lỗi", {
          description: "Đã có lỗi xảy ra khi áp dụng mã giảm giá",
        });
      } finally {
        setIsApplyingCoupon(false);
      }
    },
    [couponCode]
  );

  const handleClearCart = useCallback(async () => {
    setIsClearingCart(true);

    try {
      const result = await clearCart();

      if (result.success) {
        toast("Đã xóa giỏ hàng", {
          description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng",
        });
      } else {
        toast("Không thể xóa giỏ hàng", {
          description: result.error,
        });
      }
    } catch (error) {
      console.log(error);

      toast("Lỗi", {
        description: "Đã có lỗi xảy ra khi xóa giỏ hàng",
      });
    } finally {
      setIsClearingCart(false);
      setShowClearConfirm(false);
    }
  }, []);

  const handleCheckout = useCallback(() => {
    // Prevent multiple clicks
    if (isProcessing) return;

    setIsProcessing(true);

    // Validate cart before proceeding
    if (cart.items.length === 0) {
      toast("Giỏ hàng trống", {
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
      });
      setIsProcessing(false);
      return;
    }

    // Navigate to checkout
    router.push("/checkout");
  }, [router, cart.items.length, isProcessing]);

  // Early return for empty cart
  if (cart.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Tóm tắt đơn hàng
        </h2>
        <p className="text-gray-500">Giỏ hàng của bạn hiện đang trống.</p>
        <Link href="/product">
          <Button className="w-full">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Tóm tắt đơn hàng
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Order summary */}
          <div className="space-y-3">
            <SummaryRow
              label={`Tạm tính (${cart.itemCount} sản phẩm)`}
              value={formatPrice(cart.subtotal)}
            />

            {cart.appliedCoupons && cart.appliedCoupons.length > 0 ? (
              <div className="flex flex-col gap-2 pt-1">
                {cart.appliedCoupons.map((coupon) => (
                  <CouponItem
                    key={coupon.code}
                    code={coupon.code}
                    amount={coupon.discountAmount}
                  />
                ))}
              </div>
            ) : cart.discountTotal > 0 ? (
              <SummaryRow
                label="Giảm giá"
                value={`-${formatPrice(cart.discountTotal)}`}
                className="text-green-600"
              />
            ) : null}

            {cart.taxTotal > 0 && (
              <SummaryRow
                label="Thuế (VAT)"
                value={formatPrice(cart.taxTotal)}
              />
            )}

            {cart.shippingTotal > 0 ? (
              <SummaryRow
                label="Phí vận chuyển"
                value={formatPrice(cart.shippingTotal)}
              />
            ) : (
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-sm italic">Tính ở bước thanh toán</span>
              </div>
            )}
          </div>

          {/* Divider with total */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold text-gray-900">
                Tổng cộng
              </span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(cart.grandTotal)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Đã bao gồm VAT (nếu có)
            </p>
          </div>

          {/* Coupon code */}
          <div className="pt-2">
            {showCouponForm ? (
              <CouponForm
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                onSubmit={handleApplyCoupon}
                onCancel={() => setShowCouponForm(false)}
                isLoading={isApplyingCoupon}
              />
            ) : (
              <Button
                variant="outline"
                className="w-full text-gray-600 border-dashed"
                onClick={() => setShowCouponForm(true)}
              >
                <Tag className="h-4 w-4 mr-2" />
                Sử dụng mã giảm giá
              </Button>
            )}
          </div>

          {/* Payment methods preview */}
          <div className="pt-2 space-y-3">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-600"
                  size="sm"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Phương thức thanh toán</span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="transform transition-transform duration-200 data-[state=open]:rotate-180"
                    data-state="closed"
                  >
                    <path
                      d="M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0L6 6.925l2.7-2.7c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1l-3.3 3.3c-.1.1-.3.2-.5.2Z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 py-2">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center p-2 border border-gray-200 rounded-md">
                    <div className="w-6 h-4 bg-blue-600 rounded mr-2"></div>
                    <span>Thẻ tín dụng/ghi nợ</span>
                  </div>
                  <div className="flex items-center p-2 border border-gray-200 rounded-md">
                    <div className="mr-2">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-4">
            <Button
              className="w-full gap-2 py-6"
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing || cart.items.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Thanh toán </span> <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Tiếp tục mua sắm
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearingCart}
              >
                {isClearingCart ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                <span>Xóa giỏ hàng</span>
              </Button>
            </div>
          </div>

          {/* Security badges */}
          <div className="pt-2 flex flex-wrap justify-center gap-3 border-t border-gray-100">
            <SecurityBadge
              icon={<Shield className="h-4 w-4 mr-1" />}
              text="Thanh toán an toàn"
            />
            <SecurityBadge
              icon={<CheckCircle className="h-4 w-4 mr-1" />}
              text="Bảo mật thông tin"
            />
            <SecurityBadge
              icon={<Truck className="h-4 w-4 mr-1" />}
              text="Giao hàng nhanh chóng"
            />
          </div>
        </div>
      </div>

      {/* Confirmation dialog for clearing cart */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingCart}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              disabled={isClearingCart}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isClearingCart ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                "Xóa giỏ hàng"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Loading skeleton for cart summary
export function CartSummarySkeleton() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="p-6 border-b border-gray-100">
        <Skeleton className="h-7 w-40" />
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-3 w-40 mt-2" />
        </div>

        <div className="pt-2">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="pt-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
