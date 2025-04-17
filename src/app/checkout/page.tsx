import { Metadata } from "next";
import { redirect } from "next/navigation";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getUserAddresses } from "@/app/actions/userActions";
import { validateRequest } from "@/auth";
import { getCart } from "@/app/actions/cartActions";

export const metadata: Metadata = {
  title: "Thanh toán | Cửa hàng của bạn",
  description: "Hoàn tất đơn hàng của bạn",
};

export default async function CheckoutPage() {
  // Kiểm tra trạng thái đăng nhập
  const session = await validateRequest();

  // Lấy thông tin giỏ hàng
  const cart = await getCart();

  // Kiểm tra giỏ hàng có sản phẩm không và chuyển hướng nếu trống
  if (cart?.items?.length === 0) {
    redirect("/cart");
  }

  // Lấy địa chỉ người dùng nếu đã đăng nhập
  let addresses = [];
  if (session?.user) {
    const addressResult = await getUserAddresses();
    if (addressResult.success && addressResult.addresses) {
      addresses = addressResult.addresses;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm isLoggedIn={!!session?.user} addresses={addresses} />
          </div>

          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
