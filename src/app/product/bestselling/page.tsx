import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { prisma } from "@/lib/prisma";
import ProductFilter from "@/components/shared/Product/ProductFilters";
import { ProductsGrid } from "@/components/ProductGrid";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Sản phẩm bán chạy | Your Store Name",
  description: "Khám phá các sản phẩm bán chạy nhất tại cửa hàng của chúng tôi",
};

export const revalidate = 3600; // Revalidate this page every hour

interface ProductsPageProps {
  searchParams: {
    page?: string;
    perPage?: string;
    sort?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function BestSellingProductsPage({
  searchParams,
}: ProductsPageProps) {
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.perPage) || 20;
  const sort = searchParams.sort || "bestselling";

  // Fetch categories and brands for filters
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  // Basic filters - thêm điều kiện chỉ lấy sản phẩm đã bán
  const baseFilters: any = {
    isActive: true,
    orderItems: {
      some: {}, // Chỉ lấy sản phẩm có ít nhất một đơn hàng
    },
  };

  // Add category filter if provided
  if (searchParams.category) {
    baseFilters["categories"] = {
      some: {
        category: {
          slug: searchParams.category,
        },
      },
    };
  }

  // Add brand filter if provided - sửa lỗi cấu trúc
  if (searchParams.brand) {
    baseFilters["brand"] = {
      slug: searchParams.brand,
    };
  }

  // Add price range filter if provided
  if (searchParams.minPrice || searchParams.maxPrice) {
    baseFilters["price"] = {};

    if (searchParams.minPrice) {
      baseFilters["price"]["gte"] = parseFloat(searchParams.minPrice);
    }

    if (searchParams.maxPrice) {
      baseFilters["price"]["lte"] = parseFloat(searchParams.maxPrice);
    }
  }

  // Get total count for pagination
  const totalProducts = await prisma.product.count({
    where: baseFilters,
  });

  // Determine sorting - thêm xử lý cho các option sắp xếp khác
  let orderBy: any = {};
  switch (sort) {
    case "bestselling":
      orderBy = {
        orderItems: {
          _count: "desc",
        },
      };
      break;
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = {
        orderItems: {
          _count: "desc",
        },
      };
  }

  // Fetch products
  const products = await prisma.product.findMany({
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
          quantity: true, // Thêm quantity để tính chính xác số lượng bán
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
  });

  // Transform the data to match the ProductType interface
  const transformedProducts = products.map((product) => {
    // Tính tổng số lượng bán chính xác (không chỉ đếm số đơn hàng)
    const salesCount = product.orderItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isDigital: product.isDigital,
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days old or less
      discountPercentage: product.compareAtPrice
        ? Math.round(
            ((Number(product.compareAtPrice) - Number(product.price)) /
              Number(product.compareAtPrice)) *
              100
          )
        : null,
      avgRating:
        product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
      brandName: product.brand?.name || null,
      brandSlug: product.brand?.slug || null,
      categories: product.categories.map((cat) => ({
        id: cat.category.id,
        name: cat.category.name,
        slug: cat.category.slug,
      })),
      mainImage: product.images[0]
        ? {
            url: product.images[0].url,
            alt: product.images[0].altText || product.name,
          }
        : null,
      salesCount,
    };
  });

  // Sort by salesCount to ensure correct ranking for badges
  const sortedProducts = [...transformedProducts].sort((a, b) => {
    const salesA = a.salesCount || 0;
    const salesB = b.salesCount || 0;
    return salesB - salesA;
  });

  const totalPages = Math.ceil(totalProducts / perPage);

  // Cải thiện cấu trúc URL cho phân trang
  let baseUrl = `/product/bestselling?sort=${sort}`;
  if (searchParams.category) baseUrl += `&category=${searchParams.category}`;
  if (searchParams.brand) baseUrl += `&brand=${searchParams.brand}`;
  if (searchParams.minPrice) baseUrl += `&minPrice=${searchParams.minPrice}`;
  if (searchParams.maxPrice) baseUrl += `&maxPrice=${searchParams.maxPrice}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm bán chạy", href: "/product/bestselling" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">Sản phẩm bán chạy</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
          <ProductFilter
            categories={categories}
            brands={brands}
            selectedCategory={searchParams.category}
            selectedBrand={searchParams.brand}
            minPrice={searchParams.minPrice}
            maxPrice={searchParams.maxPrice}
          />
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Hiển thị {sortedProducts.length} trên {totalProducts} sản phẩm
            </p>
          </div>

          {/* Thêm xử lý khi không có sản phẩm nào */}
          {sortedProducts.length > 0 ? (
            <ProductsGrid products={sortedProducts} showRankBadges={true} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có sản phẩm nào được bán</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
