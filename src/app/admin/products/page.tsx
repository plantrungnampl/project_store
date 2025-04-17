import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductsTable from "@/components/admin/products/ProductsTable";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/formatPrice";

export const metadata: Metadata = {
  title: "Products Management | NextStore",
  description: "Manage your store products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; sort?: string; q?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || "createdAt:desc";
  const query = searchParams.q || "";
  const skip = (page - 1) * limit;

  // Parse sort parameter
  const [sortField, sortOrder] = sort.split(":");
  const orderBy = {
    [sortField]: sortOrder,
  };

  // Build filter conditions
  const filter = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  // Fetch products with related data
  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy,
      include: {
        brand: {
          select: {
            name: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        images: {
          where: {
            isThumbnail: true,
          },
          take: 1,
        },
      },
    }),
    prisma.product.count({
      where: filter,
    }),
  ]);

  // Format products for display
  const formattedProducts = products.map((product) => ({
    ...product,
    price: formatPrice(Number(product.price)),
    compareAtPrice: product.compareAtPrice
      ? formatPrice(Number(product.compareAtPrice))
      : null,
    category: product.categories[0]?.category.name || "-",
    brandName: product.brand?.name || "-",
    thumbnail: product.images[0]?.url || "/placeholder-product.png",
  }));

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your store products ({totalProducts} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      <ProductsTable
        products={formattedProducts}
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        sort={sort}
        query={query}
      />
    </div>
  );
}
