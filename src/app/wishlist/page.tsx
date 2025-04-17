import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWishlist } from "@/app/actions/WishlistActions";
import EnhancedWishlistPage from "@/components/wishlist/EnhancedWishlistPage";
import { requireAuth } from "@/auth";

export const metadata: Metadata = {
  title: "Danh sách yêu thích | store",
  description: "Quản lý danh sách sản phẩm yêu thích của bạn tại store",
};

export default async function WishlistPage() {
  // Đảm bảo người dùng đã đăng nhập
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  // Lấy danh sách wishlist
  const wishlistData = await getWishlist();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        Danh sách yêu thích
      </h1>

      <EnhancedWishlistPage initialWishlist={wishlistData.items} />
    </div>
  );
}
