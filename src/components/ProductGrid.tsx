// components/ProductGrid.tsx

import { ProductCard } from "./shared/Product/ProductCard";

// Định nghĩa type cho props
interface ProductGridProps {
  products: any[]; // Thay 'any' bằng type cụ thể của Product nếu có
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products?.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            stockQuantity={product.stockQuantity}
            isActive={product.isActive}
            isFeatured={product.isFeatured}
            isDigital={product.isDigital}
            images={product.images}
            brand={product.brand}
            categories={product.categories}
            reviews={product.reviews}
            publishedAt={product.publishedAt}
          />
        ))
      ) : (
        <p className="col-span-full text-center py-10">
          Không có sản phẩm nào để hiển thị.
        </p>
      )}
    </div>
  );
}
