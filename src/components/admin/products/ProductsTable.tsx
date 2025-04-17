"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Product, Brand } from "@prisma/client";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Edit,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

type FormattedProduct = Product & {
  brandName: string;
  category: string;
  thumbnail: string;
};

interface ProductsTableProps {
  products: FormattedProduct[];
  currentPage: number;
  totalPages: number;
  limit: number;
  sort: string;
  query: string;
}

export default function ProductsTable({
  products,
  currentPage,
  totalPages,
  limit,
  sort,
  query,
}: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);

  // Function to update URL with new search params
  const createQueryString = (params: Record<string, string | number | null>) => {
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

  // Sort helpers
  const getSortArrow = (field: string) => {
    if (!sort.startsWith(field)) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sort.endsWith("asc") ? 
      <ChevronRight className="ml-2 h-4 w-4" /> : 
      <ChevronLeft className="ml-2 h-4 w-4" />;
  };

  const toggleSort = (field: string) => {
    const currentSort = sort.split(':');
    const currentField = currentSort[0];
    const currentDirection = currentSort[1];
    
    if (currentField === field) {
      // Toggle direction
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      handleSortChange(`${field}:${newDirection}`);
    } else {
      // New field, default to desc
      handleSortChange(`${field}:desc`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-[300px]"
          />
        </form>
        
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={handleLimitChange}
          >
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
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Product
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('price')}
              >
                <div className="flex items-center">
                  Price
                  {getSortArrow('price')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('stockQuantity')}
              >
                <div className="flex items-center">
                  Stock
                  {getSortArrow('stockQuantity')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created
                  {getSortArrow('createdAt')}
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={product.thumbnail}
                          width={40}
                          height={40}
                          alt={product.name}
                          className="h-10 w-10 object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <Link href={`/admin/products/${product.id}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{product.price}</div>
                    {product.compareAtPrice && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        {product.compareAtPrice}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{product.stockQuantity}</div>
                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                      <div className="text-xs text-amber-600 dark:text-amber-400">Low stock</div>
                    )}
                    {product.stockQuantity === 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400">Out of stock</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={product.isActive ? "default" : "outline"} className="capitalize">
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {product.isFeatured && (
                      <Badge variant="secondary" className="ml-2 capitalize">
                        Featured
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/products/${product.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * limit, products.length + (currentPage - 1) * limit)}
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
