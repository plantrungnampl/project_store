import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg">
      <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Heart className="h-12 w-12 text-gray-400" />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Danh sách yêu thích trống
      </h2>

      <p className="text-gray-600 text-center max-w-md mb-8">
        Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá các sản
        phẩm và thêm vào danh sách những sản phẩm bạn yêu thích!
      </p>

      <Button asChild>
        <Link href="/product">Khám phá sản phẩm</Link>
      </Button>
    </div>
  );
}
