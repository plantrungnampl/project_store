// app/products/page.tsx
import { getProducts } from "@/app/actions/Product";
import { ProductGrid } from "@/components/ProductGrid";

export default async function ProductsPage() {
  const { products } = await getProducts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Sản phẩm của chúng tôi</h1>
      <ProductGrid products={products} />
    </div>
  );
}
