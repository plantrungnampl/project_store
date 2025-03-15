// "use client";
// import { ProductList } from "@/components/shared/Product/ProductList";
// import React from "react";

// export default function Home() {
//   return (
//     <div className="container mx-auto px-4 py-8 space-y-8">
//       <div></div>
//     </div>
//   );
// }
// import { getHomePageData } from "@/app/actions/homeActions";

import FeaturedProducts from "@/components/home/FeaturedProducts";
import { getHomePageData } from "../actions/homePageActions";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import NewArrivals from "@/components/home/NewArrivals";
import PromotionBanner from "@/components/home/PromotionBanner";
import DiscountedProducts from "@/components/home/DiscountedProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import BrandShowcase from "@/components/home/BrandShowcase";

export default async function HomePage() {
  const {
    featuredProducts,
    newArrivals,
    categories,
    brands,
    discountedProducts,
    topSellingProducts,
  } = await getHomePageData();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {/* <HeroSlider /> */}

      {/* Sản phẩm nổi bật */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm nổi bật
            </h2>
            <div className="w-24 h-1 bg-primary rounded"></div>
            <p className="text-gray-600 mt-4 text-center max-w-2xl">
              Khám phá bộ sưu tập sản phẩm nổi bật với thiết kế độc đáo và chất
              lượng hàng đầu
            </p>
          </div>
          <FeaturedProducts products={featuredProducts} />
        </div>
      </section>

      {/* Danh mục sản phẩm */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Danh mục sản phẩm
            </h2>
            <div className="w-24 h-1 bg-primary rounded"></div>
            <p className="text-gray-600 mt-4 text-center max-w-2xl">
              Tìm kiếm sản phẩm phù hợp với nhu cầu của bạn thông qua các danh
              mục được sắp xếp khoa học
            </p>
          </div>
          <CategoryShowcase categories={categories} />
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm mới nhất
            </h2>
            <div className="w-24 h-1 bg-primary rounded"></div>
            <p className="text-gray-600 mt-4 text-center max-w-2xl">
              Cập nhật xu hướng mới nhất với những sản phẩm mới về kho hàng ngày
            </p>
          </div>
          <NewArrivals products={newArrivals} />
        </div>
      </section>

      {/* Banner khuyến mãi */}
      <PromotionBanner />

      {/* Sản phẩm giảm giá */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Ưu đãi hấp dẫn
            </h2>
            <div className="w-24 h-1 bg-primary rounded"></div>
            <p className="text-gray-600 mt-4 text-center max-w-2xl">
              Cơ hội sở hữu những sản phẩm chất lượng với giá ưu đãi đặc biệt
            </p>
          </div>
          <DiscountedProducts products={discountedProducts} />
        </div>
      </section>

      {/* Sản phẩm bán chạy */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm bán chạy
            </h2>
            <div className="w-24 h-1 bg-primary rounded"></div>
            <p className="text-gray-600 mt-4 text-center max-w-2xl">
              Khám phá những sản phẩm được ưa chuộng nhất tại cửa hàng của chúng
              tôi
            </p>
          </div>
          <TopSellingProducts products={topSellingProducts} />
        </div>
      </section>

      {/* Thương hiệu */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Thương hiệu nổi bật
            </h2>
            <div className="w-24 h-1 bg-primary rounded"></div>
            <p className="text-gray-600 mt-4 text-center max-w-2xl">
              Đối tác với những thương hiệu uy tín hàng đầu trên thị trường
            </p>
          </div>
          <BrandShowcase brands={brands} />
        </div>
      </section>

      {/* Newsletter Signup */}
      {/* <NewsletterSignup /> */}
    </main>
  );
}
