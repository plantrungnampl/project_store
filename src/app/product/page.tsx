import { Suspense } from "react";
import { ProductCard } from "@/components/shared/Product/ProductCard";
import ProductFilter from "@/components/shared/Product/ProductFilters";
import Pagination from "@/components/ui/Pagination";
import { getCategories, getProducts } from "../actions/productActions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    sort?: string;
    filter?: string;
    category?: string;
    featured?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  // Extract search parameters
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "default";
  const filter = searchParams.filter || "";
  const category = searchParams.category || "";
  const featured = searchParams.featured === "true";
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : 0;
  const maxPrice = searchParams.maxPrice
    ? parseInt(searchParams.maxPrice)
    : Number.MAX_SAFE_INTEGER;

  // Fetch categories and products
  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      page,
      sort,
      filter,
      category,
      featured,
      minPrice,
      maxPrice,
      limit: 12, // Products per page
    }),
  ]);

  const { products, pagination } = productsData;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        {featured ? "Sản phẩm nổi bật" : "Tất cả sản phẩm"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter sidebar */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm">
          <ProductFilter
            initialFilter={filter}
            initialCategory={category}
            initialSort={sort}
            initialPriceRange={[
              minPrice,
              maxPrice !== Number.MAX_SAFE_INTEGER ? maxPrice : 10000000,
            ]}
            categories={categories}
          />
        </div>

        {/* Products grid */}
        <div className="md:col-span-3">
          <Suspense
            fallback={<div className="text-center py-12">Đang tải...</div>}
          >
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      baseUrl={`/product?${new URLSearchParams({
                        ...(featured ? { featured: "true" } : {}),
                        ...(sort !== "default" ? { sort } : {}),
                        ...(filter ? { filter } : {}),
                        ...(category ? { category } : {}),
                        ...(minPrice > 0
                          ? { minPrice: minPrice.toString() }
                          : {}),
                        ...(maxPrice < Number.MAX_SAFE_INTEGER
                          ? { maxPrice: maxPrice.toString() }
                          : {}),
                      }).toString()}`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-lg text-gray-600">
                  Không tìm thấy sản phẩm phù hợp.
                </p>
                <p className="text-gray-500 mt-2">
                  Vui lòng thử các bộ lọc khác.
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
