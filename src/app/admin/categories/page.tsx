import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categories Management | NextStore",
  description: "Manage your product categories",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    q?: string;
    parentId?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || "sortOrder:asc";
  const query = searchParams.q || "";
  const parentId = searchParams.parentId || null;
  const skip = (page - 1) * limit;

  // Parse sort parameter
  const [sortField, sortOrder] = sort.split(":");
  const orderBy = {
    [sortField]: sortOrder,
  };

  // Build filter conditions
  let filter: any = {};

  if (query) {
    filter.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (parentId) {
    filter.parentId = parentId;
  } else if (parentId === null && !searchParams.parentId) {
    // Only show top-level categories by default (when parentId is not specified)
    filter.parentId = null;
  }

  // Fetch categories with related data
  const [categories, totalCategories, allCategories] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        subcategories: {
          select: { id: true },
        },
        products: {
          select: { productId: true },
        },
      },
    }),
    prisma.category.count({
      where: filter,
    }),
    // Get all parent categories for the dropdown
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        level: true,
        parentId: true,
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
  ]);

  const totalPages = Math.ceil(totalCategories / limit);

  // Build a parent categories map for the dropdown
  const parentCategoriesMap = allCategories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories ({totalCategories} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Link>
        </Button>
      </div>

      <CategoriesTable
        categories={categories}
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        sort={sort}
        query={query}
        parentId={parentId}
        parentCategoriesMap={parentCategoriesMap}
      />
    </div>
  );
}
