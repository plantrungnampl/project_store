"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Banner, BannerType, User } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  ExternalLink,
  ImageIcon,
} from "lucide-react";

type BannerWithUser = Banner & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};

interface BannersTableProps {
  banners: BannerWithUser[];
  currentPage: number;
  totalPages: number;
  limit: number;
  sort: string;
  query: string;
  typeFilter?: BannerType;
  typeCounts: Record<string, number>;
}

// Banner type tab data 
const typeTabs = [
  { value: "all", label: "All Banners" },
  { value: "HERO", label: "Hero Banners" },
  { value: "PROMO", label: "Promo Banners" },
  { value: "CATEGORY", label: "Category Banners" },
];

export default function BannersTable({
  banners,
  currentPage,
  totalPages,
  limit,
  sort,
  query,
  typeFilter,
  typeCounts,
}: BannersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);

  // Get the current type tab
  const currentTab = typeFilter || "all";

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

  // Handle type tab change
  const handleTypeChange = (value: string) => {
    const newQueryString = createQueryString({
      type: value === "all" ? null : value,
      page: 1, // Reset to first page when changing type filter
    });
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

  // Function to get type badge color
  const getTypeBadge = (type: BannerType) => {
    switch (type) {
      case "HERO":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Hero</Badge>;
      case "PROMO":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Promo</Badge>;
      case "CATEGORY":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Category</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Format creator name
  const formatCreatorName = (user: BannerWithUser["user"]): string => {
    if (!user) return "System";
    
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  // Get tab count display
  const getTabCount = (type: string): number => {
    if (type === "all") {
      return Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
    }
    return typeCounts[type] || 0;
  };

  // Check if a banner is active (based on date range)
  const isBannerActive = (banner: Banner): boolean => {
    if (!banner.isActive) return false;
    
    const now = new Date();
    
    if (banner.startDate && new Date(banner.startDate) > now) {
      return false; // Not started yet
    }
    
    if (banner.endDate && new Date(banner.endDate) < now) {
      return false; // Already ended
    }
    
    return true;
  };

  // Format date range for display
  const formatDateRange = (startDate: Date | null, endDate: Date | null): string => {
    if (!startDate && !endDate) return "Always active";
    
    if (startDate && !endDate) {
      return `From ${formatDate(startDate)}`;
    }
    
    if (!startDate && endDate) {
      return `Until ${formatDate(endDate)}`;
    }
    
    return `${formatDate(startDate!)} - ${formatDate(endDate!)}`;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={currentTab} onValueChange={handleTypeChange}>
        <TabsList className="flex overflow-x-auto pb-px">
          {typeTabs.map((tab) => (
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
                placeholder="Search banners..."
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('title')}
                  >
                    <div className="flex items-center">
                      Banner
                      {getSortArrow('title')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center"
                  >
                    Type
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
                    onClick={() => toggleSort('sortOrder')}
                  >
                    <div className="flex items-center justify-center">
                      Order
                      {getSortArrow('sortOrder')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
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
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No banners found
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => {
                    const isActive = isBannerActive(banner);
                    
                    return (
                      <tr key={banner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                              {banner.imageUrl ? (
                                <Image
                                  src={banner.imageUrl}
                                  width={96}
                                  height={64}
                                  alt={banner.title}
                                  className="h-16 w-24 object-cover"
                                />
                              ) : (
                                <div className="h-16 w-24 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                <Link href={`/admin/banners/${banner.id}`} className="hover:underline">
                                  {banner.title}
                                </Link>
                              </div>
                              {banner.subtitle && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {banner.subtitle}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDateRange(banner.startDate, banner.endDate)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
                          {getTypeBadge(banner.type)}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
                          <Badge 
                            variant={isActive ? "default" : "outline"} 
                            className={isActive ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            {banner.sortOrder}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div>
                            {formatDate(banner.createdAt)}
                          </div>
                          <div className="text-xs">
                            by {formatCreatorName(banner.user)}
                          </div>
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
                                <Link href={`/admin/banners/${banner.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/banners/${banner.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Banner
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Preview
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * limit, (currentPage - 1) * limit + banners.length)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
