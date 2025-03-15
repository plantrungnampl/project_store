"use server";

import prisma from "@/lib/prisma";

export async function getHomePageData() {
  try {
    // Lấy sản phẩm nổi bật
    const featuredProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 8,
    });

    // Lấy sản phẩm mới nhất
    const newArrivals = await prisma.product.findMany({
      where: {
        isActive: true,
        publishedAt: {
          not: null,
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 8,
    });

    // Lấy danh mục nổi bật
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        level: 1, // Chỉ lấy danh mục cấp cao nhất
      },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
      take: 6,
    });

    // Lấy các thương hiệu
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      take: 8,
    });

    // Lấy sản phẩm giảm giá
    const discountedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        compareAtPrice: {
          not: null,
        },
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 4,
    });

    // Lấy sản phẩm bán chạy nhất (giả sử dựa trên orderItems)
    const topSellingProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        orderItems: {
          some: {},
        },
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
      take: 8,
    });

    // Xử lý dữ liệu để trả về format phù hợp
    return {
      featuredProducts: processProducts(featuredProducts),
      newArrivals: processProducts(newArrivals),
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        productCount: category.products.length,
      })),
      brands,
      discountedProducts: processProducts(discountedProducts),
      topSellingProducts: processProducts(topSellingProducts),
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      featuredProducts: [],
      newArrivals: [],
      categories: [],
      brands: [],
      discountedProducts: [],
      topSellingProducts: [],
    };
  }
}

// Helper function to process products into a consistent format
function processProducts(products: any[]) {
  return products.map((product) => {
    // Tìm ảnh mặc định hoặc lấy ảnh đầu tiên
    const defaultImage =
      product.images.find((img: any) => img.isThumbnail) || product.images[0];

    // Tính toán % giảm giá nếu có
    let discountPercentage = null;
    if (product.compareAtPrice && product.price < product.compareAtPrice) {
      discountPercentage = Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      );
    }

    // Tính trung bình rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce(
            (sum: number, review: any) => sum + review.rating,
            0
          ) / product.reviews.length
        : 0;

    // Kiểm tra xem sản phẩm có phải là mới không (30 ngày gần đây)
    const isNew = product.publishedAt
      ? (new Date().getTime() - new Date(product.publishedAt).getTime()) /
          (1000 * 3600 * 24) <=
        30
      : false;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isDigital: product.isDigital,
      isNew,
      discountPercentage,
      avgRating,
      reviewCount: product.reviews.length,
      brandName: product.brand?.name || null,
      brandSlug: product.brand?.slug || null,
      categories: product.categories.map((pc: any) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      mainImage: defaultImage
        ? {
            url: defaultImage.url,
            alt: defaultImage.altText || product.name,
          }
        : null,
      images: product.images.map((img: any) => ({
        url: img.url,
        alt: img.altText || product.name,
      })),
      // Thêm số lượng bán ra nếu có
      salesCount: product._count?.orderItems || 0,
    };
  });
}
