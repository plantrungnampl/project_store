import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/app/actions/productActions";
// import ProductGrid from "@/components/products/ProductGrid";
// import ProductFilters from "@/components/products/ProductFilters";
// import ProductSort from "@/components/products/ProductSort";
import { Suspense } from "react";
import ProductFilters from "./shared/Product/ProductFilters";
import { ProductsGrid } from "./ProductGrid";
import ProductSort from "./shared/Product/ProductSort";
import { Breadcrumb } from "./ui/breadcrumb";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    brands?: string;
  };
}

// Tạo metadata động cho SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await getProductsByCategory(params.slug, { limit: 1 });

  if (!category) {
    return {
      title: "Danh mục không tồn tại | Cửa hàng của bạn",
    };
  }

  return {
    title: `${category.name} | Cửa hàng của bạn`,
    description:
      category.description ||
      `Khám phá sản phẩm trong danh mục ${category.name} tại cửa hàng của chúng tôi`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  // Parse search params
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "newest";

  // Parse filter params
  const filters: Record<string, any> = {};

  if (searchParams.minPrice) {
    filters.minPrice = parseFloat(searchParams.minPrice);
  }

  if (searchParams.maxPrice) {
    filters.maxPrice = parseFloat(searchParams.maxPrice);
  }

  if (searchParams.brands) {
    filters.brands = searchParams.brands.split(",");
  }

  // Fetch products
  const { products, total, totalPages, category } = await getProductsByCategory(
    params.slug,
    {
      page,
      sort,
      filters,
    }
  );

  // If category doesn't exist, return 404
  if (!category) {
    notFound();
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Danh mục", href: "/categories" },
  ];

  if (category.parentId) {
    // TODO: Add parent category if needed
    // This would require fetching parent category info
  }

  breadcrumbItems.push({
    label: category.name,
    href: `/categories/${category.slug}`,
    // current: true,
  });

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Category header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600 max-w-4xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Product grid with filters */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="lg:w-1/4 w-full">
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
              }
            >
              <ProductFilters categoryId={category.id} filters={filters} />
            </Suspense>
          </div>

          {/* Products */}
          <div className="lg:w-3/4 w-full">
            {/* Sorting and results info */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                Hiển thị {products.length > 0 ? (page - 1) * 12 + 1 : 0} -{" "}
                {Math.min(page * 12, total)} trong {total} sản phẩm
              </p>

              <ProductSort currentSort={sort} />
            </div>

            {/* Product grid */}
            <ProductsGrid
              products={products}
              currentPage={page}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
