"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Order, OrderStatus, User, Address } from "@prisma/client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Eye,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/formatPrice";

type OrderWithRelations = Order & {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  items: {
    id: string;
    quantity: number;
    total: number;
  }[];
  shippingAddress: Address | null;
};

interface OrdersTableProps {
  orders: OrderWithRelations[];
  currentPage: number;
  totalPages: number;
  limit: number;
  sort: string;
  query: string;
  statusFilter?: OrderStatus;
  statusCounts: Record<string, number>;
}

// Status tab data
const statusTabs = [
  { value: "all", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

export default function OrdersTable({
  orders,
  currentPage,
  totalPages,
  limit,
  sort,
  query,
  statusFilter,
  statusCounts,
}: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);

  // Get the current status tab
  const currentTab = statusFilter || "all";

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

  // Handle status tab change
  const handleStatusChange = (value: string) => {
    const newQueryString = createQueryString({
      status: value === "all" ? null : value,
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

  // Function to get status badge color
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Completed
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Processing
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Canceled
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
            Delivered
          </Badge>
        );
      case "ON_HOLD":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            On Hold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get tab count display
  const getTabCount = (status: string): number => {
    if (status === "all") {
      return Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    }
    return statusCounts[status] || 0;
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
                placeholder="Search by order number, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </form>

            <div className="flex items-center gap-2">
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
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("orderNumber")}
                  >
                    <div className="flex items-center">
                      Order
                      {getSortArrow("orderNumber")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("grandTotal")}
                  >
                    <div className="flex items-center">
                      Total
                      {getSortArrow("grandTotal")}
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
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date
                      {getSortArrow("createdAt")}
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
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="hover:underline"
                              >
                                #{order.orderNumber}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "item" : "items"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.user ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              <Link
                                href={`/admin/customers/${order.user.id}`}
                                className="hover:underline"
                              >
                                {order.user.firstName} {order.user.lastName}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.user.email}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.email}{" "}
                            <span className="text-xs">(Guest)</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatPrice(Number(order.grandTotal))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
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
                    (currentPage - 1) * limit + orders.length
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
