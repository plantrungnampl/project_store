import { BannerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CategoryBanners, HeroBanner, PromoBanner } from "./Banner";

// Helper function để lấy banner theo loại
const getBanners = unstable_cache(
  async (type: BannerType) => {
    try {
      const currentDate = new Date();

      // Lấy các banner đang active và nằm trong khoảng thời gian hiển thị
      const banners = await prisma.banner.findMany({
        where: {
          type,
          isActive: true,
          // Banner có startDate hoặc không có startDate
          AND: [
            {
              OR: [{ startDate: null }, { startDate: { lte: currentDate } }],
            },
            {
              OR: [{ endDate: null }, { endDate: { gte: currentDate } }],
            },
          ],
        },
        orderBy: { sortOrder: "asc" },
      });

      return banners;
    } catch (error) {
      console.error(`Error fetching ${type} banners:`, error);
      return [];
    }
  },
  ["banners"], // cache key prefix
  { revalidate: 3600 } // revalidate every hour
);

// Component cho Hero Banners
export async function HeroBannerContainer() {
  const banners = await getBanners(BannerType.HERO);

  // Nếu không có banner, không hiển thị gì
  if (banners.length === 0) {
    return null;
  }

  // Chuyển đổi dữ liệu để phù hợp với component
  const bannerData = banners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle || "",
    description: banner.description || "",
    cta: banner.ctaText,
    ctaLink: banner.ctaLink,
    image: banner.imageUrl,
    mobileImage: banner.mobileImageUrl || banner.imageUrl,
    color: banner.color || "bg-blue-50",
    textColor: banner.textColor || "text-gray-900",
    position: (banner.position as "left" | "right" | undefined) || "left",
    buttonVariant:
      (banner.buttonVariant as
        | "default"
        | "secondary"
        | "outline"
        | "ghost"
        | undefined) || "default",
  }));

  return <HeroBanner banners={bannerData} />;
}

// Component cho Promo Banners
export async function PromoBannerContainer() {
  const banners = await getBanners(BannerType.PROMO);

  // Nếu không có banner, không hiển thị gì
  if (banners.length === 0) {
    return null;
  }

  // Lấy banner đầu tiên
  const banner = banners[0];

  // Chuyển đổi dữ liệu
  const bannerData = {
    id: banner.id,
    title: banner.title,
    description: banner.description || "",
    buttonText: banner.ctaText,
    buttonLink: banner.ctaLink,
    image: banner.imageUrl,
    backgroundColor: banner.color || "bg-primary",
    textColor: banner.textColor || "text-white",
  };

  return <PromoBanner data={bannerData} />;
}

// Component cho Category Banners
export async function CategoryBannerContainer() {
  const banners = await getBanners(BannerType.CATEGORY);

  // Nếu không có banner, không hiển thị gì
  if (banners.length === 0) {
    return null;
  }

  // Chuyển đổi dữ liệu
  const categoryBanners = banners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    image: banner.imageUrl,
    link: banner.ctaLink,
    isActive: banner.isActive,
    sortOrder: banner.sortOrder,
  }));

  return <CategoryBanners categories={categoryBanners} />;
}
