import { Suspense } from "react";
import { searchProducts } from "@/app/actions/searchActions";
import { ProductCard } from "@/components/shared/Product/ProductCard";
import { Metadata } from "next";
import SearchResultsSkeleton from "@/components/search/SearchResultsSkeleton";
import SearchSuggestions from "@/components/search/SearchSuggestions";
import SortSelector from "@/components/search/SortSelector";
import ProductFilter from "@/components/shared/Product/ProductFilters";
import Pagination from "@/components/ui/Pagination";
import { getCategories } from "../actions/catergoryActions";

// Generate metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q || "";

  return {
    title: query
      ? `Kết quả tìm kiếm cho "${query}" | ELEGANCE`
      : "Tìm kiếm | ELEGANCE",
    description: `Khám phá các sản phẩm ELEGANCE phù hợp với từ khóa "${query}". Mua sắm online dễ dàng với nhiều ưu đãi hấp dẫn!`,
  };
}

// Hàm để xử lý filters từ URL parameter
function processFilters(filterParam: string | undefined): string[] {
  if (!filterParam) return [];
  // Xử lý trường hợp filter là một chuỗi các filters được phân tách bằng dấu phẩy
  return filterParam.split(",").filter(Boolean);
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
    filter?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  const query = searchParams.q || "";

  // If no query is provided, show the search page with hero section
  if (!query) {
    return (
      <div className="min-h-[calc(100vh-300px)]">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 mb-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Tìm kiếm sản phẩm
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Khám phá hàng ngàn sản phẩm chất lượng cao với các bộ sưu tập đa
              dạng, phù hợp với mọi phong cách và nhu cầu của bạn.
            </p>
            <div className="max-w-xl mx-auto">
              <SearchSuggestions />
            </div>
          </div>
        </div>

        {/* Trending categories */}
        <div className="container mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Danh mục nổi bật
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Thời trang nữ",
                image: "/images/categories/women.jpg",
                slug: "thoi-trang-nu",
              },
              {
                name: "Thời trang nam",
                image: "/images/categories/men.jpg",
                slug: "thoi-trang-nam",
              },
              {
                name: "Giày dép",
                image: "/images/categories/shoes.jpg",
                slug: "giay-dep",
              },
              {
                name: "Túi xách",
                image: "/images/categories/bags.jpg",
                slug: "tui-xach",
              },
              {
                name: "Phụ kiện",
                image: "/images/categories/accessories.jpg",
                slug: "phu-kien",
              },
              {
                name: "Sale",
                image: "/images/categories/sale.jpg",
                slug: "sale",
              },
            ].map((category) => (
              <a
                key={category.slug}
                href={`/category/${category.slug}`}
                className="relative group overflow-hidden rounded-xl aspect-square bg-muted shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white font-medium text-lg md:text-xl text-center">
                    {category.name}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "relevance";

  // Xử lý filters - chuyển từ string thành mảng
  const filterParam = searchParams.filter || "";
  const filters = processFilters(filterParam);

  const category = searchParams.category || "";
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : 0;
  const maxPrice = searchParams.maxPrice
    ? parseInt(searchParams.maxPrice)
    : 10000000;

  // Tạo đối tượng URLSearchParams để truyền vào SortSelector
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filterParam) params.set("filter", filterParam);
  if (category) params.set("category", category);
  if (minPrice > 0) params.set("minPrice", minPrice.toString());
  if (maxPrice < 10000000) params.set("maxPrice", maxPrice.toString());
  if (page > 1) params.set("page", page.toString());

  // Fetch categories and search results
  const [categories, searchResults] = await Promise.all([
    getCategories(),
    searchProducts(query, {
      page,
      sort,
      filters, // Thay đổi filter thành filters (mảng)
      category,
      minPrice,
      maxPrice,
      limit: 12, // Products per page
    }),
  ]);

  const { products, pagination, searchTerm } = searchResults;

  // Handle no results scenario with alternative suggestions
  const showNoResults = products.length === 0;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-300px)]">
      {/* Search header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Kết quả tìm kiếm
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            <span>Tìm thấy {pagination.totalItems} kết quả cho</span>
            <span className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium">
              "{searchTerm}"
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filter sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-6 pb-4 border-b">
                Lọc sản phẩm
              </h2>
              <ProductFilter
                initialFilter={filters} // Truyền mảng filters thay vì string
                initialCategory={category}
                initialSort={sort}
                initialPriceRange={[minPrice, maxPrice]}
                categories={categories}
              />
            </div>
          </div>

          {/* Products grid */}
          <div className="md:col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-500">
                    Sắp xếp theo:
                  </span>
                  {/* Thay thế select bằng Client Component */}
                  <SortSelector currentSort={sort} searchParams={params} />
                </div>
                <p className="text-sm text-gray-500">
                  Hiển thị {products.length} trên {pagination.totalItems} sản
                  phẩm
                </p>
              </div>
            </div>

            <Suspense fallback={<SearchResultsSkeleton />}>
              {!showNoResults ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                      >
                        <ProductCard {...product} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination - cập nhật cách xây dựng URL để hỗ trợ nhiều filters */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        baseUrl={`/search?q=${encodeURIComponent(
                          query
                        )}&${new URLSearchParams({
                          ...(sort !== "relevance" ? { sort } : {}),
                          ...(filterParam ? { filter: filterParam } : {}),
                          ...(category ? { category } : {}),
                          ...(minPrice > 0
                            ? { minPrice: minPrice.toString() }
                            : {}),
                          ...(maxPrice < 10000000
                            ? { maxPrice: maxPrice.toString() }
                            : {}),
                        }).toString()}`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      Không tìm thấy kết quả
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp
                      với từ khóa "{searchTerm}"
                    </p>

                    <div className="max-w-md mx-auto">
                      <h3 className="font-medium mb-4">Bạn có thể thử:</h3>
                      <ul className="text-left space-y-2 text-gray-600 mb-8">
                        <li className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Kiểm tra lỗi chính tả
                        </li>
                        <li className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Sử dụng từ khóa ngắn hơn
                        </li>
                        <li className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Tìm kiếm với từ khóa chung hơn
                        </li>
                        <li className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Xem tất cả danh mục sản phẩm
                        </li>
                      </ul>

                      <h3 className="font-medium mb-4">Danh mục phổ biến:</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {categories.slice(0, 5).map((category) => (
                          <a
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                          >
                            {category.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
