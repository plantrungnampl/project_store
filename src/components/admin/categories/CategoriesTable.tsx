"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Edit,
  Trash2,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  FolderTree,
  Tag,
  Plus,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { formatDate } from "@/lib/formatPrice";

type CategoryWithRelations = Category & {
  parent: {
    id: string;
    name: string;
  } | null;
  subcategories: {
    id: string;
  }[];
  products: {
    productId: string;
  }[];
};

interface CategoriesTableProps {
  categories: CategoryWithRelations[];
  currentPage: number;
  totalPages: number;
  limit: number;
  sort: string;
  query: string;
  parentId: string | null;
  parentCategoriesMap: Record<string, any>;
}

export default function CategoriesTable({
  categories,
  currentPage,
  totalPages,
  limit,
  sort,
  query,
  parentId,
  parentCategoriesMap,
}: CategoriesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);

  // Function to update URL with new search params
  const createQueryString = (
    params: Record<string, string | number | null>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    });

    return newSearchParams.toString();
  };

  // Handle search input change
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newQueryString = createQueryString({
      q: searchQuery || null,
      page: 1, // Reset to first page on new search
    });
    router.push(`${pathname}?${newQueryString}`);
  };

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    const newQueryString = createQueryString({ sort: newSort });
    router.push(`${pathname}?${newQueryString}`);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: string) => {
    const newQueryString = createQueryString({
      limit: parseInt(newLimit),
      page: 1, // Reset to first page when changing limit
    });
    router.push(`${pathname}?${newQueryString}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newQueryString = createQueryString({ page: newPage });
    router.push(`${pathname}?${newQueryString}`);
  };

  // Handle parent change
  const handleParentChange = (newParentId: string) => {
    const newQueryString = createQueryString({
      parentId: newParentId === "all" ? null : newParentId,
      page: 1, // Reset to first page when changing parent filter
    });
    router.push(`${pathname}?${newQueryString}`);
  };

  // Sort helpers
  const getSortArrow = (field: string) => {
    if (!sort.startsWith(field))
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sort.endsWith("asc") ? (
      <ChevronRight className="ml-2 h-4 w-4" />
    ) : (
      <ChevronLeft className="ml-2 h-4 w-4" />
    );
  };

  const toggleSort = (field: string) => {
    const currentSort = sort.split(":");
    const currentField = currentSort[0];
    const currentDirection = currentSort[1];

    if (currentField === field) {
      // Toggle direction
      const newDirection = currentDirection === "asc" ? "desc" : "asc";
      handleSortChange(`${field}:${newDirection}`);
    } else {
      // New field, default to desc
      handleSortChange(`${field}:desc`);
    }
  };

  // Build breadcrumb trail for parent category navigation
  const buildBreadcrumbTrail = (
    categoryId: string | null
  ): Array<{ id: string | null; name: string }> => {
    const trail: Array<{ id: string | null; name: string }> = [
      { id: null, name: "Root Categories" },
    ];

    if (!categoryId) return trail;

    let currentCategoryId = categoryId;
    let depth = 0; // Prevent infinite loops
    const maxDepth = 10;

    while (currentCategoryId && depth < maxDepth) {
      const category = parentCategoriesMap[currentCategoryId];
      if (!category) break;

      trail.push({ id: category.id, name: category.name });
      currentCategoryId = category.parentId;
      depth++;
    }

    return trail.reverse();
  };

  const breadcrumbTrail = buildBreadcrumbTrail(parentId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-[300px]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex items-center space-x-1 text-sm">
            {breadcrumbTrail.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    index === breadcrumbTrail.length - 1
                      ? "font-medium pointer-events-none"
                      : "hover:underline"
                  }
                  onClick={() => handleParentChange(item.id || "all")}
                  disabled={index === breadcrumbTrail.length - 1}
                >
                  {item.name}
                </Button>
              </div>
            ))}
          </nav>

          <div className="flex items-center ml-auto">
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-2">per page</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center">
                  Category
                  {getSortArrow("name")}
                </div>
              </th>
              <th
                scope="col"
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort("slug")}
              >
                <div className="flex items-center">
                  Slug
                  {getSortArrow("slug")}
                </div>
              </th>
              <th
                scope="col"
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center cursor-pointer"
                onClick={() => toggleSort("sortOrder")}
              >
                <div className="flex items-center justify-center">
                  Sort Order
                  {getSortArrow("sortOrder")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center"
              >
                Products
              </th>
              <th
                scope="col"
                className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort("updatedAt")}
              >
                <div className="flex items-center">
                  Updated
                  {getSortArrow("updatedAt")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            width={40}
                            height={40}
                            alt={category.name}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center">
                            <Tag className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="hover:underline"
                          >
                            {category.name}
                          </Link>
                        </div>
                        {category.parent && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Parent: {category.parent.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {category.slug}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
                    <Badge
                      variant={category.isActive ? "default" : "outline"}
                      className="capitalize"
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {category.sortOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      {category.products.length}
                    </span>
                    {category.subcategories.length > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                        {category.subcategories.length} subcategories
                      </span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(category.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/categories/${category.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Category
                          </Link>
                        </DropdownMenuItem>
                        {category.subcategories.length === 0 ? (
                          <DropdownMenuItem>
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                            <span className="text-red-600">Delete</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <Trash2 className="h-4 w-4 mr-2 opacity-50" />
                            <span className="opacity-50">
                              Delete (Has subcategories)
                            </span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/categories/new?parentId=${category.id}`}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subcategory
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleParentChange(category.id)}
                        >
                          <FolderTree className="h-4 w-4 mr-2" />
                          View Subcategories
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * limit + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                currentPage * limit,
                (currentPage - 1) * limit + categories.length
              )}
            </span>{" "}
            of <span className="font-medium">{totalPages * limit}</span> results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
