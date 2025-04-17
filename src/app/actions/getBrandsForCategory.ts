"use server";

import prisma from "@/lib/prisma";

/**
 * Get brands for a specific category (or all if no category provided)
 */
export async function getBrandsForCategory(categoryId?: string) {
  try {
    if (categoryId) {
      // Lấy brands cho một category cụ thể
      const brands = await prisma.brand.findMany({
        where: {
          isActive: true,
          products: {
            some: {
              isActive: true,
              categories: {
                some: {
                  categoryId,
                },
              },
            },
          },
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                  categories: {
                    some: {
                      categoryId,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Format the response
      return {
        success: true,
        brands: brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl,
          productCount: brand._count.products,
        })),
      };
    } else {
      // Lấy tất cả brands
      const brands = await prisma.brand.findMany({
        where: {
          isActive: true,
          products: {
            some: {
              isActive: true,
            },
          },
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Format the response
      return {
        success: true,
        brands: brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl,
          productCount: brand._count.products,
        })),
      };
    }
  } catch (error) {
    console.error("Error fetching brands:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi lấy danh sách thương hiệu",
    };
  }
}

/**
 * Get brand information by slug
 */
export async function getBrandBySlug(slug: string) {
  try {
    const brand = await prisma.brand.findUnique({
      where: {
        slug,
        isActive: true,
      },
    });

    if (!brand) {
      return {
        success: false,
        error: "Không tìm thấy thương hiệu",
      };
    }

    // Get product count
    const productCount = await prisma.product.count({
      where: {
        brandId: brand.id,
        isActive: true,
      },
    });

    return {
      success: true,
      brand: {
        ...brand,
        productCount,
      },
    };
  } catch (error) {
    console.error("Error fetching brand:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi lấy thông tin thương hiệu",
    };
  }
}
