// components/Navigation/HeaderContainer.tsx
import { prisma } from "@/lib/prisma";
import { Header } from "./Header";

// Đặt thời gian tái xác nhận dữ liệu
export const revalidate = 3600; // Cập nhật dữ liệu mỗi giờ

async function getCategories() {
  try {
    // Lấy các category cấp cao nhất (level 1) và đang active
    const mainCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        level: 1,
      },
      include: {
        // Lấy subcategories (level 2) cho mỗi category chính
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          // Lấy thêm subcategories cấp 3 nếu cần
          include: {
            subcategories: {
              where: {
                isActive: true,
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Xử lý trường hợp không có dữ liệu - trả về mảng mặc định
    if (!mainCategories || mainCategories.length === 0) {
      return [
        {
          name: "Sản phẩm",
          slug: "products",
          featured: [
            { name: "Sản phẩm mới", href: "/product?filter=new" },
            { name: "Xem tất cả", href: "/product" },
          ],
          subcategories: [{ name: "Tất cả sản phẩm", href: "/product" }],
        },
      ];
    }

    // Chuyển đổi dữ liệu database sang định dạng phù hợp với component Header
    const formattedCategories = mainCategories.map((category) => {
      // Tối đa 2 featured subcategories
      let featuredSubcategories = [];

      // Nếu có subcategories có thuộc tính isFeatured, ưu tiên hiển thị
      const featuredSubs = category.subcategories
        .filter((sub) => sub.isFeatured)
        .slice(0, 2)
        .map((sub) => ({
          name: sub.name,
          href: `/product?category=${sub.slug}`,
        }));

      if (featuredSubs.length > 0) {
        featuredSubcategories = featuredSubs;
      } else {
        // Mặc định hiển thị "Sản phẩm mới" và "Xem tất cả"
        featuredSubcategories = [
          {
            name: "Sản phẩm mới",
            href: `/product?category=${category.slug}&filter=new`,
          },
          { name: "Xem tất cả", href: `/product?category=${category.slug}` },
        ];
      }

      // Các subcategories thường
      const normalSubcategories = category.subcategories.map((sub) => ({
        name: sub.name,
        href: `/product?category=${sub.slug}`,
      }));

      return {
        name: category.name,
        slug: category.slug,
        featured: featuredSubcategories,
        subcategories:
          normalSubcategories.length > 0
            ? normalSubcategories
            : [
                {
                  name: `Tất cả ${category.name}`,
                  href: `/product?category=${category.slug}`,
                },
              ],
      };
    });

    return formattedCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Trả về categories mặc định trong trường hợp lỗi
    return [
      {
        name: "Sản phẩm",
        slug: "products",
        featured: [
          { name: "Sản phẩm mới", href: "/product?filter=new" },
          { name: "Xem tất cả", href: "/product" },
        ],
        subcategories: [{ name: "Tất cả sản phẩm", href: "/product" }],
      },
    ];
  }
}

export default async function HeaderContainer() {
  // Lấy categories từ database
  const categories = await getCategories();

  // Truyền categories vào Header component
  return <Header categories={categories} />;
}
