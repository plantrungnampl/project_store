"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import {
  ProductType,
  ProductFilterOptions,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_SORT,
  processProducts,
  processVariantAttributes,
  getProductQueryIncludes,
  getSortConfig,
} from "@/lib/productUtils";

type ProductsResponse = {
  products: ProductType[];
  totalProducts?: number;
  total?: number;
  totalPages?: number;
  categories?: any[];
  brands?: any[];
  category?: any;
  searchTerm?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/**
 * Lấy thông tin chi tiết của một sản phẩm dựa trên ID
 */
export async function getProductDetail(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
      include: getProductQueryIncludes(true),
    });

    if (!product) {
      throw new Error("Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa");
    }

    // Xử lý dữ liệu và áp dụng helper function
    const processedProduct = {
      ...processProducts([product])[0],
      variantAttributes: processVariantAttributes(
        product.variants,
        product.attributes
      ),
    };

    return processedProduct;
  } catch (error) {
    return handleApiError(error, "Không thể lấy thông tin sản phẩm");
  }
}

/**
 * Lấy chi tiết sản phẩm theo slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: getProductQueryIncludes(true),
    });

    if (!product) {
      return null;
    }

    // Xử lý dữ liệu và áp dụng helper function
    const processedProduct = {
      ...processProducts([product])[0],
      variantAttributes: processVariantAttributes(
        product.variants,
        product.attributes
      ),
    };

    return processedProduct;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Lấy danh sách sản phẩm với các bộ lọc và phân trang
 */
export async function getProducts({
  sort = DEFAULT_SORT,
  filter = "",
  category = "",
  featured = false,
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
}: {
  sort?: string;
  filter?: string;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  try {
    // Build filter conditions
    const where: any = { isActive: true };

    // Add filter for featured products
    if (featured) {
      where.isFeatured = true;
    }

    // Add filter based on filter type
    if (filter === "new") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.publishedAt = { gte: thirtyDaysAgo };
    } else if (filter === "sale") {
      where.compareAtPrice = { not: null };
    } else if (filter === "in-stock") {
      where.stockQuantity = { gt: 0 };
    }

    // Add filter for category
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Add price range filter
    where.price = {
      gte: minPrice,
      lte: maxPrice,
    };

    // Determine sorting
    const orderBy = getSortConfig(sort);

    // Execute queries in parallel
    const [products, totalCount] = await Promise.all([
      // Fetch products with includes
      prisma.product.findMany({
        where,
        orderBy,
        include: getProductQueryIncludes(),
        skip: (page - 1) * limit,
        take: limit,
      }),

      // Get total count for pagination
      prisma.product.count({ where }),
    ]);

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);

    // Process products
    const processedProducts = processProducts(products);

    return {
      products: processedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

/**
 * Lấy sản phẩm bán chạy nhất
 */
export async function getBestsellingProducts({
  page = DEFAULT_PAGE,
  perPage = DEFAULT_LIMIT,
  sort = "bestselling",
  category,
  brand,
  minPrice,
  maxPrice,
}: {
  page?: number;
  perPage?: number;
  sort?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
}): Promise<ProductsResponse> {
  try {
    // Basic filters
    const baseFilters: any = { isActive: true };

    // Add category filter if provided
    if (category) {
      baseFilters.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Add brand filter if provided
    if (brand) {
      baseFilters.brand = {
        slug: brand,
      };
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      baseFilters.price = {};

      if (minPrice) {
        baseFilters.price.gte = parseFloat(minPrice);
      }

      if (maxPrice) {
        baseFilters.price.lte = parseFloat(maxPrice);
      }
    }

    // Determine sorting
    const orderBy = getSortConfig(sort);

    // Fetch categories and brands for filters (in parallel)
    const [totalProducts, products, categories, brands] = await Promise.all([
      // Get total count for pagination
      prisma.product.count({
        where: baseFilters,
      }),

      // Fetch products
      prisma.product.findMany({
        where: baseFilters,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          stockQuantity: true,
          isActive: true,
          isFeatured: true,
          isDigital: true,
          createdAt: true,
          publishedAt: true,
          brand: {
            select: {
              name: true,
              slug: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            take: 1,
            orderBy: {
              isThumbnail: "desc",
            },
            select: {
              url: true,
              altText: true,
            },
          },
          orderItems: {
            select: {
              id: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),

      // Fetch categories for filters
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),

      // Fetch brands for filters
      prisma.brand.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);

    // Process the products using the helper function
    const processedProducts = processProducts(products);

    // Sort by salesCount to ensure correct ranking for badges
    const sortedProducts = [...processedProducts].sort((a, b) => {
      const salesA = a.salesCount || 0;
      const salesB = b.salesCount || 0;
      return salesB - salesA;
    });

    // Revalidate the path to ensure fresh data on each request
    revalidatePath("/product/bestselling");

    return {
      products: sortedProducts,
      totalProducts,
      categories,
      brands,
    };
  } catch (error) {
    console.error("Error fetching bestselling products:", error);
    return {
      products: [],
      totalProducts: 0,
      categories: [],
      brands: [],
    };
  }
}

/**
 * Lấy danh sách sản phẩm được đề xuất
 */
export const getRecommendedProducts = cache(
  async (limit: number = 8): Promise<ProductType[]> => {
    try {
      // Get products with related data
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          publishedAt: { not: null },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: getProductQueryIncludes(),
      });

      // Use the helper function to process products
      return processProducts(products);
    } catch (error) {
      console.error("Error fetching recommended products:", error);
      return [];
    }
  }
);

/**
 * Lấy danh sách sản phẩm theo danh mục
 */
export async function getProductsByCategory(
  categorySlug: string,
  {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    sort = DEFAULT_SORT,
    filters = {},
  }: ProductFilterOptions = {}
): Promise<ProductsResponse> {
  try {
    // Tìm danh mục theo slug
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        subcategories: true,
      },
    });

    if (!category) {
      return { products: [], total: 0, totalPages: 0, category: null };
    }

    // Lấy tất cả ID của danh mục (bao gồm danh mục con)
    const categoryIds = [
      category.id,
      ...category.subcategories.map((subCat) => subCat.id),
    ];

    // Xây dựng điều kiện lọc
    const where: any = {
      isActive: true,
      categories: {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      },
    };

    // Thêm các điều kiện lọc khác nếu có
    if (filters.minPrice) {
      where.price = {
        ...where.price,
        gte: parseFloat(filters.minPrice.toString()),
      };
    }

    if (filters.maxPrice) {
      where.price = {
        ...where.price,
        lte: parseFloat(filters.maxPrice.toString()),
      };
    }

    if (filters.brands && filters.brands.length > 0) {
      where.brandId = {
        in: filters.brands,
      };
    }

    // Xác định sắp xếp
    const orderBy = getSortConfig(sort);

    // Đếm tổng số sản phẩm
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),

      // Lấy sản phẩm với phân trang
      prisma.product.findMany({
        where,
        include: getProductQueryIncludes(),
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products: processProducts(products),
      total,
      totalPages,
      category,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return { products: [], total: 0, totalPages: 0, category: null };
  }
}

/**
 * Tìm kiếm sản phẩm
 */
export async function searchProducts(
  query: string,
  {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    sort = "relevance",
    filters = {},
  }: ProductFilterOptions = {}
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
        { sku: { contains: query, mode: "insensitive" } },
      ],
    };

    // Thêm các điều kiện lọc
    if (filters.minPrice) {
      where.price = {
        ...where.price,
        gte: parseFloat(filters.minPrice.toString()),
      };
    }

    if (filters.maxPrice) {
      where.price = {
        ...where.price,
        lte: parseFloat(filters.maxPrice.toString()),
      };
    }

    if (filters.category) {
      where.categories = {
        some: {
          category: {
            slug: filters.category,
          },
        },
      };
    }

    if (filters.brands && filters.brands.length > 0) {
      where.brandId = {
        in: filters.brands,
      };
    }

    // Xác định sắp xếp (ngoại trừ "relevance" được xử lý đặc biệt)
    const orderBy =
      sort !== "relevance" ? getSortConfig(sort) : { publishedAt: "desc" };

    // Thực hiện truy vấn và đếm song song
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: getProductQueryIncludes(),
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Xử lý sản phẩm
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

    return {
      products: processedProducts,
      total,
      totalPages,
      searchTerm: query,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], total: 0, totalPages: 0 };
  }
}

/**
 * Lấy danh sách sản phẩm liên quan
 */
export const getRelatedProducts = cache(
  async (productId: string, limit: number = 4): Promise<ProductType[]> => {
    try {
      // Get original product to find related items
      const originalProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          categories: {
            select: { categoryId: true },
          },
          brand: {
            select: { id: true },
          },
        },
      });

      if (!originalProduct) {
        return [];
      }

      // Get category IDs of the original product
      const categoryIds = originalProduct.categories.map((c) => c.categoryId);
      const brandId = originalProduct.brand?.id;

      // Find products that share categories or brand with the original product
      const relatedProducts = await prisma.product.findMany({
        where: {
          id: { not: productId },
          isActive: true,
          publishedAt: { not: null },
          OR: [
            // Products with same categories
            {
              categories: {
                some: {
                  categoryId: { in: categoryIds },
                },
              },
            },
            // Products with same brand
            brandId ? { brandId } : {},
          ],
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: getProductQueryIncludes(),
      });

      // Use the helper function to process products
      return processProducts(relatedProducts);
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }
);

/**
 * Lấy danh sách tất cả danh mục
 */
export async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
