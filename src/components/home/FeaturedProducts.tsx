import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../shared/Product/ProductCard";

interface ProductType {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  isNew?: boolean;
  discountPercentage?: number | null;
  avgRating?: number;
  reviewCount?: number;
  brandName?: string | null;
  brandSlug?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  mainImage?: { url: string; alt: string } | null;
  images?: { url: string; alt: string }[];
}

interface FeaturedProductsProps {
  products: ProductType[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Tạo danh sách các danh mục từ sản phẩm để hiển thị trong tab
  const allCategories = products.flatMap((product) =>
    product.categories
      ? product.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        }))
      : []
  );

  // Lọc các danh mục duy nhất (dựa trên id)
  const uniqueCategories = Array.from(
    new Map(allCategories.map((cat) => [cat.id, cat])).values()
  ).slice(0, 5); // Chỉ lấy tối đa 5 danh mục cho tabs

  return (
    <div className="space-y-8">
      {/* Tab navigation */}
      {uniqueCategories.length > 1 ? (
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="all" className="px-6 py-2">
                Tất cả
              </TabsTrigger>
              {uniqueCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-6 py-2"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* All products tab */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>

          {/* Category tabs */}
          {uniqueCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products
                  .filter((product) =>
                    product.categories?.some((cat) => cat.id === category.id)
                  )
                  .map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        // No tabs if only one or no categories
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}

      {/* View all products button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/product?featured=true"
          // href="/product?sort=newest&filter=new&showFilters=true"
          className="flex items-center gap-2 px-6 py-3 text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Xem tất cả sản phẩm nổi bật <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
