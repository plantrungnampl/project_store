"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Coupon, CouponType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Copy,
  Percent,
  Tag,
  Truck,
  Clock,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/formatPrice";

type EnhancedCoupon = Coupon & {
  isExpired: boolean;
  isActiveNow: boolean;
};

interface CouponsTableProps {
  coupons: EnhancedCoupon[];
  currentPage: number;
  totalPages: number;
  limit: number;
  sort: string;
  query: string;
  typeFilter?: CouponType;
  activeFilter?: boolean;
  typeCounts: Record<string, number>;
  activeCouponsCount: number;
  inactiveCouponsCount: number;
}

// Tab data
const statusTabs = [
  { value: "all", label: "All Coupons" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function CouponsTable({
  coupons,
  currentPage,
  totalPages,
  limit,
  sort,
  query,
  typeFilter,
  activeFilter,
  typeCounts,
  activeCouponsCount,
  inactiveCouponsCount,
}: CouponsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);

  // Get the current status tab
  let currentTab = "all";
  if (activeFilter === true) currentTab = "active";
  if (activeFilter === false) currentTab = "inactive";

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

  // Handle type filter change
  const handleTypeChange = (newType: string) => {
    const newQueryString = createQueryString({
      type: newType === "all" ? null : newType,
      page: 1, // Reset to first page when changing type filter
    });
    router.push(`${pathname}?${newQueryString}`);
  };

  // Handle status tab change
  const handleStatusChange = (value: string) => {
    let active = null;
    if (value === "active") active = "true";
    if (value === "inactive") active = "false";

    const newQueryString = createQueryString({
      active: active,
      page: 1, // Reset to first page when changing status filter
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

  // Format coupon value based on type
  const formatCouponValue = (coupon: Coupon): string => {
    switch (coupon.type) {
      case "PERCENTAGE":
        return `${coupon.value}%`;
      case "FIXED_AMOUNT":
        return formatPrice(Number(coupon.value));
      case "FREE_SHIPPING":
        return "Free Shipping";
      default:
        return `${coupon.value}`;
    }
  };

  // Function to get type badge
  const getTypeBadge = (type: CouponType) => {
    switch (type) {
      case "PERCENTAGE":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center">
            <Percent className="h-3 w-3 mr-1" />
            Percentage
          </Badge>
        );
      case "FIXED_AMOUNT":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            Fixed
          </Badge>
        );
      case "FREE_SHIPPING":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center">
            <Truck className="h-3 w-3 mr-1" />
            Shipping
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Function to get status badge
  const getStatusBadge = (coupon: EnhancedCoupon) => {
    if (coupon.isExpired) {
      return (
        <Badge
          variant="outline"
          className="text-red-600 border-red-200 dark:border-red-900/30"
        >
          Expired
        </Badge>
      );
    }

    if (!coupon.isActive) {
      return <Badge variant="outline">Inactive</Badge>;
    }

    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Active
      </Badge>
    );
  };

  // Get tab count display
  const getTabCount = (status: string): number => {
    if (status === "all") {
      return activeCouponsCount + inactiveCouponsCount;
    }
    if (status === "active") {
      return activeCouponsCount;
    }
    return inactiveCouponsCount;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={currentTab} onValueChange={handleStatusChange}>
        <TabsList className="flex overflow-x-auto pb-px">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2"
            >
              {tab.label}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {getTabCount(tab.value)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* We only need one TabsContent since all tabs show the same table, just filtered differently */}
        <TabsContent value={currentTab} className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={typeFilter || "all"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center">
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
                <span className="text-sm text-muted-foreground ml-2">
                  per page
                </span>
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
                    onClick={() => toggleSort("code")}
                  >
                    <div className="flex items-center">
                      Code
                      {getSortArrow("code")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("value")}
                  >
                    <div className="flex items-center">
                      Value
                      {getSortArrow("value")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("usageCount")}
                  >
                    <div className="flex items-center">
                      Usage
                      {getSortArrow("usageCount")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("expiresAt")}
                  >
                    <div className="flex items-center">
                      Expires
                      {getSortArrow("expiresAt")}
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
                {coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <Link
                            href={`/admin/coupons/${coupon.id}`}
                            className="hover:underline"
                          >
                            {coupon.code}
                          </Link>
                        </div>
                        {coupon.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {coupon.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getTypeBadge(coupon.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCouponValue(coupon)}
                        {coupon.minOrderAmount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Min order:{" "}
                            {formatPrice(Number(coupon.minOrderAmount))}
                          </div>
                        )}
                        {coupon.maxDiscount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Max discount:{" "}
                            {formatPrice(Number(coupon.maxDiscount))}
                          </div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {coupon.usageCount} / {coupon.usageLimit || "∞"}
                        </div>
                        {coupon.perUserLimit && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {coupon.perUserLimit} per user
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {coupon.expiresAt ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(coupon.expiresAt)}
                          </div>
                        ) : (
                          "No expiration"
                        )}
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
                              <Link href={`/admin/coupons/${coupon.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/coupons/${coupon.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Coupon
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              Delete
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
                <span className="font-medium">
                  {(currentPage - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * limit,
                    (currentPage - 1) * limit + coupons.length
                  )}
                </span>{" "}
                of <span className="font-medium">{totalPages * limit}</span>{" "}
                results
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
