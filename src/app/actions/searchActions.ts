"use server";

import prisma from "@/lib/prisma";
import { processProducts } from "@/lib/productUtils";

// export async function searchProducts(
//   query: string,
//   options?: {
//     page?: number;
//     limit?: number;
//     sort?: string;
//     filter?: string;
//     category?: string;
//     minPrice?: number;
//     maxPrice?: number;
//   }
// ) {
//   if (!query || query.trim().length === 0) {
//     return {
//       products: [],
//       pagination: {
//         currentPage: 1,
//         totalPages: 0,
//         totalItems: 0,
//         hasNextPage: false,
//         hasPrevPage: false,
//       },
//     };
//   }

//   const page = options?.page || 1;
//   const limit = options?.limit || 20;
//   const sort = options?.sort || "relevance";
//   const filter = options?.filter || "";
//   const category = options?.category || "";
//   const minPrice = options?.minPrice || 0;
//   const maxPrice = options?.maxPrice || Number.MAX_SAFE_INTEGER;

//   // Build the base query
//   const where: any = {
//     isActive: true,
//     OR: [
//       {
//         name: {
//           contains: query,
//           mode: "insensitive",
//         },
//       },
//       {
//         description: {
//           contains: query,
//           mode: "insensitive",
//         },
//       },
//       {
//         sku: {
//           contains: query,
//           mode: "insensitive",
//         },
//       },
//     ],
//   };

//   // Add price range filter
//   where.price = {
//     gte: minPrice,
//     lte: maxPrice,
//   };

//   // Add filter based on filter type
//   if (filter === "new") {
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//     where.publishedAt = { gte: thirtyDaysAgo };
//   } else if (filter === "sale") {
//     where.compareAtPrice = { not: null };
//   } else if (filter === "in-stock") {
//     where.stockQuantity = { gt: 0 };
//   }

//   // Add filter for category
//   if (category) {
//     where.categories = {
//       some: {
//         category: {
//           slug: category,
//         },
//       },
//     };
//   }

//   // Determine sorting
//   let orderBy: any = {};

//   switch (sort) {
//     case "relevance":
//       // For relevance, we keep the default ordering which is based on the search match
//       break;
//     case "newest":
//       orderBy = { publishedAt: "desc" };
//       break;
//     case "price-low":
//       orderBy = { price: "asc" };
//       break;
//     case "price-high":
//       orderBy = { price: "desc" };
//       break;
//     case "popular":
//       orderBy = { salesCount: "desc" };
//       break;
//     default:
//       // Default to relevance
//       break;
//   }

//   // Get products with search criteria
//   const products = await prisma.product.findMany({
//     where,
//     orderBy,
//     include: {
//       images: {
//         take: 1,
//         orderBy: { sortOrder: "asc" },
//       },
//       categories: {
//         include: { category: true },
//       },
//       brand: true,
//       reviews: {
//         select: { rating: true },
//       },
//     },
//     skip: (page - 1) * limit,
//     take: limit,
//   });

//   // Get total count for pagination
//   const totalCount = await prisma.product.count({ where });
//   const totalPages = Math.ceil(totalCount / limit);

//   // Process products for the response
//   const productsWithMeta = products.map((product) => {
//     const avgRating = product.reviews.length
//       ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
//         product.reviews.length
//       : 0;

//     return {
//       id: product.id,
//       name: product.name,
//       slug: product.slug,
//       price: product.price,
//       compareAtPrice: product.compareAtPrice,
//       stockQuantity: product.stockQuantity,
//       isActive: product.isActive,
//       isFeatured: product.isFeatured,
//       isDigital: product.isDigital,
//       isNew: isNewProduct(product.publishedAt),
//       discountPercentage: calculateDiscountPercentage(
//         product.price,
//         product.compareAtPrice
//       ),
//       avgRating,
//       reviewCount: product.reviews.length,
//       brandName: product.brand?.name || null,
//       brandSlug: product.brand?.slug || null,
//       categories: product.categories.map((pc) => ({
//         id: pc.category.id,
//         name: pc.category.name,
//         slug: pc.category.slug,
//       })),
//       mainImage: product.images[0]
//         ? {
//             url: product.images[0].url,
//             alt: product.images[0].altText || product.name,
//           }
//         : null,
//       hasVariants:
//         product.variants && product.variants.length > 0 ? true : false,
//     };
//   });

//   return {
//     products: productsWithMeta,
//     pagination: {
//       currentPage: page,
//       totalPages,
//       totalItems: totalCount,
//       hasNextPage: page < totalPages,
//       hasPrevPage: page > 1,
//     },
//     searchTerm: query,
//   };
// }

// For search suggestions/autocomplete

// Cập nhật hàm searchProducts để hỗ trợ nhiều filters

/**
 * Tìm kiếm sản phẩm
 */
export async function searchProducts(
  query: string,
  {
    page = 1,
    limit = 12,
    sort = "relevance",
    filters = [], // Thay đổi filter thành filters (array)
    category = "",
    minPrice = 0,
    maxPrice = 10000000,
  }: {
    page?: number;
    limit?: number;
    sort?: string;
    filters?: string[]; // Thay đổi type thành string[]
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  try {
    if (!query.trim()) {
      return { products: [], total: 0, totalPages: 0 };
    }

    // Xây dựng điều kiện tìm kiếm
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    // Xử lý nhiều filters
    if (filters.length > 0) {
      // Biến điều kiện theo từng loại filter
      const filterConditions: any[] = [];

      if (filters.includes("new")) {
        // Sản phẩm mới (được thêm trong 30 ngày)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filterConditions.push({
          createdAt: { gte: thirtyDaysAgo },
        });
      }

      if (filters.includes("sale")) {
        // Sản phẩm đang giảm giá
        filterConditions.push({
          compareAtPrice: { not: null },
          price: { lt: Prisma.sql`compareAtPrice` },
        });
      }

      if (filters.includes("in-stock")) {
        // Sản phẩm còn hàng
        filterConditions.push({
          stockQuantity: { gt: 0 },
        });
      }

      // Nếu có điều kiện filter, thêm vào where
      if (filterConditions.length > 0) {
        where.AND = filterConditions;
      }
    }

    // Thêm các điều kiện lọc khác
    if (minPrice > 0) {
      where.price = {
        ...where.price,
        gte: minPrice,
      };
    }

    if (maxPrice < 10000000) {
      where.price = {
        ...where.price,
        lte: maxPrice,
      };
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Xác định sắp xếp
    let orderBy: any = {};
    switch (sort) {
      case "newest":
        orderBy = { publishedAt: "desc" };
        break;
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = [{ reviews: { _count: "desc" } }, { publishedAt: "desc" }];
        break;
      default:
        // default is 'relevance' - handled using custom ranking logic
        orderBy = { publishedAt: "desc" };
    }

    // Đếm tổng số sản phẩm
    const total = await prisma.product.count({ where });

    // Lấy sản phẩm với phân trang
    const products = await prisma.product.findMany({
      where,
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
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });

    const totalPages = Math.ceil(total / limit);

    // Nếu là sắp xếp theo relevance, xử lý bổ sung về độ phù hợp
    let processedProducts = processProducts(products);

    if (sort === "relevance") {
      // Logic giản đơn về ranking độ phù hợp
      processedProducts = processedProducts
        .map((product) => {
          // Đánh giá độ phù hợp (cao nếu query xuất hiện trong tên sản phẩm)
          const nameRelevance = product.name
            .toLowerCase()
            .includes(query.toLowerCase())
            ? 2
            : 0;
          // Đánh giá độ phù hợp bổ sung (thấp hơn nếu chỉ xuất hiện trong mô tả)
          const descRelevance = product.description
            ?.toLowerCase()
            .includes(query.toLowerCase())
            ? 1
            : 0;

          return {
            ...product,
            relevanceScore: nameRelevance + descRelevance,
          };
        })
        .sort((a, b) => {
          // Sắp xếp theo relevanceScore
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });
    }

    // Trả về kết quả tìm kiếm với các thông tin bổ sung
    return {
      products: processedProducts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
      },
      searchTerm: query, // Thêm searchTerm để hiển thị
      filters: filters, // Trả về filters đã áp dụng
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      products: [],
      pagination: { currentPage: 1, totalPages: 0, totalItems: 0 },
      searchTerm: query,
      filters: [],
    };
  }
}

export async function getSuggestions(query: string, limit: number = 5) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const suggestions = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: {
        take: 1,
        select: {
          url: true,
          altText: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      price: true,
    },
    take: limit,
  });

  return suggestions.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0]
      ? {
          url: product.images[0].url,
          alt: product.images[0].altText || product.name,
        }
      : null,
  }));
}

// Save search query for analytics (optional)
export async function saveSearchQuery(query: string, userId?: string) {
  // You would need to create a SearchQuery model in your Prisma schema
  // This is for future analytics
  try {
    await prisma.searchLog.create({
      data: {
        query,
        userId: userId || null,
      },
    });
  } catch (error) {
    // Just log the error, don't halt the search process
    console.error("Error saving search query:", error);
  }
}

// Helper functions
function isNewProduct(publishedAt: Date | null) {
  if (!publishedAt) return false;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return new Date(publishedAt) >= thirtyDaysAgo;
}

function calculateDiscountPercentage(
  price: number,
  compareAtPrice: number | null
) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
