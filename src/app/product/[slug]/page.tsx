import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/app/actions/productActions";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import ProductTabs from "@/components/shared/Product/ProductTabs";
import ProductImages from "@/components/shared/Product/ProductImages";
import ProductDetailClient from "@/components/shared/Product/ProductDetailClient";

// Tạo metadata động cho SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
    };
  }

  return {
    title: `${product.name} | Cửa hàng của bạn`,
    description:
      product.description ||
      `Mua ${product.name} với giá tốt nhất tại cửa hàng của chúng tôi`,
    openGraph: {
      images: product.images?.length > 0 ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Lấy đường dẫn Breadcrumb từ danh mục sản phẩm
  const breadcrumbItems = [{ label: "Trang chủ", href: "/" }];

  // if (product.categories && product.categories.length > 0) {
  //   const category = product.categories[0].category;
  //   breadcrumbItems.push({
  //     label: category.name,
  //     href: `/categories/${category.slug}`,
  //   });
  // }
  if (
    product.categories &&
    product.categories.length > 0 &&
    product.categories[0]?.category
  ) {
    const category = product.categories[0].category;
    breadcrumbItems.push({
      label: category.name,
      href: `/categories/${category.slug}`,
    });
  }
  breadcrumbItems.push({
    label: product.name,
    href: `/product/${product.slug}`,
  });

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 ">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Product detail section */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"> */}
          {/* Product Images */}
          {/* <Suspense
            fallback={
              <div className="aspect-square bg-gray-100 animate-pulse rounded-lg"></div>
            }
          >
            <ProductImages images={product.images} productName={product.name} />
          </Suspense> */}

          {/* Product Info */}
          <div>
            <ProductDetailClient product={product} />
          </div>
        {/* </div> */}

        {/* Product Tabs (Description, Specifications, Reviews) */}
        {/* <div className="mb-16">
          <ProductTabs
            description={product.description}
            productId={product.id}
          />
        </div> */}

        {/* Related Products section can be added here */}
      </div>
    </div>
  );
}
