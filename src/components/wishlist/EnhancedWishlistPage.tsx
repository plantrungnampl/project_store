"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  EyeIcon,
  Share2,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistItem, useWishlist } from "@/context/WishlistContext";
import { toggleWishlistItem } from "@/app/actions/WishlistActions";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnhancedWishlistPageProps {
  initialWishlist: WishlistItem[];
}

export default function EnhancedWishlistPage({
  initialWishlist,
}: EnhancedWishlistPageProps) {
  const {
    clearWishlist,
    isLoading: isGlobalLoading,
    refreshWishlist,
  } = useWishlist();
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("date-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [quickViewItem, setQuickViewItem] = useState<WishlistItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isMovingToCart, setIsMovingToCart] = useState<Record<string, boolean>>(
    {}
  );

  // Cập nhật state khi initialWishlist thay đổi (ví dụ: refresh)
  useEffect(() => {
    setWishlist(initialWishlist);
  }, [initialWishlist]);

  // Sắp xếp sản phẩm
  useEffect(() => {
    let sortedItems = [...wishlist];

    switch (sortOrder) {
      case "price-asc":
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedItems.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "date-asc":
        sortedItems.sort(
          (a, b) =>
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        );
        break;
      case "date-desc":
        sortedItems.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        break;
    }

    setWishlist(sortedItems);
  }, [sortOrder]);

  // Xử lý xóa sản phẩm khỏi wishlist
  const handleRemoveItem = async (productId: string) => {
    setIsRemoving((prev) => ({ ...prev, [productId]: true }));

    try {
      const result = await toggleWishlistItem(productId);

      if (result.success) {
        // Cập nhật UI
        setWishlist((prev) => prev.filter((item) => item.id !== productId));

        // Xóa khỏi các sản phẩm đã chọn
        setSelectedItems((prev) => prev.filter((id) => id !== productId));

        // Hiển thị thông báo
        // toast("Thành công", {
        //   description: "Đã xóa sản phẩm khỏi danh sách yêu thích",
        // });
      } else {
        toast("Lỗi", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast("Lỗi", {
        description: "Không thể xóa sản phẩm. Vui lòng thử lại sau.",
      });
    } finally {
      setIsRemoving((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Xử lý chọn tất cả sản phẩm
  const handleSelectAll = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map((item) => item.id));
    }
  };

  // Xử lý chọn sản phẩm riêng lẻ
  const handleSelectItem = (productId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Xử lý xóa nhiều sản phẩm
  const handleRemoveSelected = async () => {
    for (const productId of selectedItems) {
      await handleRemoveItem(productId);
    }
  };

  // Xử lý xóa tất cả
  const handleClearAll = async () => {
    setIsClearDialogOpen(false);
    await clearWishlist();
    setWishlist([]);
    setSelectedItems([]);
  };

  // Xử lý thêm vào giỏ hàng
  // const handleAddToCart = async (productId: string) => {
  //   setIsMovingToCart((prev) => ({ ...prev, [productId]: true }));

  //   try {
  //     // Giả vờ gọi API thêm vào giỏ hàng
  //     await new Promise((resolve) => setTimeout(resolve, 800));

  //     // Hiển thị thông báo
  //     toast("Thành công", {
  //       description: "Đã thêm sản phẩm vào giỏ hàng",
  //     });

  //     // Giả vờ đã thêm vào giỏ hàng
  //   } catch (error) {
  //     toast("Lỗi", {
  //       description: "Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.",
  //     });
  //   } finally {
  //     setIsMovingToCart((prev) => ({ ...prev, [productId]: false }));
  //   }
  // };

  // Hiển thị quick view
  const handleQuickView = (item: WishlistItem) => {
    setQuickViewItem(item);
    setIsQuickViewOpen(true);
  };

  // Tính tổng giá trị wishlist
  const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0);

  // Nếu danh sách rỗng
  if (wishlist.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Danh sách yêu thích trống</h2>
          <p className="text-gray-500 mb-8">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá cửa
            hàng và thêm những sản phẩm bạn yêu thích vào đây.
          </p>
          <div className="space-y-4 w-full">
            <Link href="/product" className="w-full">
              <Button className="w-full gap-2">
                <ShoppingBag className="h-5 w-5" />
                Tiếp tục mua sắm
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={refreshWishlist}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với thông tin và hành động */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-white p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-red-50 p-3 rounded-full mr-4">
                <Heart className="text-red-500 h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Danh sách yêu thích</h2>
                <p className="text-gray-500 text-sm">
                  {wishlist.length} sản phẩm • Tổng giá trị:{" "}
                  {formatPrice(totalValue)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa đã chọn ({selectedItems.length})
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Qua Email</DropdownMenuItem>
                  <DropdownMenuItem>Sao chép liên kết</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearDialogOpen(true)}
                className="text-red-500 border-red-200 hover:bg-red-50"
                disabled={isGlobalLoading}
              >
                {isGlobalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa tất cả
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                selectedItems.length === wishlist.length && wishlist.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Chọn tất cả
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center mr-2">
              <label htmlFor="sort-order" className="text-sm mr-2">
                Sắp xếp:
              </label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Mới nhất</SelectItem>
                  <SelectItem value="date-asc">Cũ nhất</SelectItem>
                  <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                  <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex bg-gray-100 rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View danh sách */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="flex items-center h-full self-center">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                    />
                  </div>

                  <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    {item.mainImage ? (
                      <Image
                        src={item.mainImage.url}
                        alt={item.mainImage.alt || item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {item.discountPercentage && item.discountPercentage > 0 && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5">
                        -{item.discountPercentage}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          {item.brandName && (
                            <Link
                              href={`/brands/${item.brandSlug}`}
                              className="hover:text-primary"
                            >
                              {item.brandName}
                            </Link>
                          )}
                          {item.categories?.[0] && (
                            <>
                              <span>•</span>
                              <Link
                                href={`/category/${item.categories[0].slug}`}
                                className="hover:text-primary"
                              >
                                {item.categories[0].name}
                              </Link>
                            </>
                          )}
                        </div>

                        <Link
                          href={`/product/${item.slug}`}
                          className="text-lg font-medium hover:text-primary"
                        >
                          {item.name}
                        </Link>

                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill={
                                  i < Math.floor(item.avgRating || 0)
                                    ? "currentColor"
                                    : "none"
                                }
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                            <span className="text-xs text-gray-500">
                              ({item.reviewCount || 0})
                            </span>
                          </div>

                          {item.stockQuantity > 0 ? (
                            <Badge
                              variant="outline"
                              className="text-emerald-600 bg-emerald-50 border-emerald-200"
                            >
                              Còn hàng
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-red-600 bg-red-50 border-red-200"
                            >
                              Hết hàng
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xl font-semibold">
                            {formatPrice(item.price)}
                          </span>
                          {item.compareAtPrice &&
                            item.compareAtPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.compareAtPrice)}
                              </span>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Đã thêm vào:{" "}
                          {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {/* <Button
                        size="sm"
                        onClick={() => handleAddToCart(item.id)}
                        disabled={
                          isMovingToCart[item.id] || !item.stockQuantity
                        }
                        className="gap-2"
                      >
                        {isMovingToCart[item.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                        {item.stockQuantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                      </Button> */}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickView(item)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem nhanh</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving[item.id]}
                              className="text-gray-700 hover:text-red-500 hover:border-red-200"
                            >
                              {isRemoving[item.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa khỏi danh sách</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl shadow-sm overflow-hidden border hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {item.mainImage ? (
                    <Image
                      src={item.mainImage.url}
                      alt={item.mainImage.alt || item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Selection checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    className="bg-white border-gray-300 rounded-md"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  {item.isNew && <Badge className="bg-blue-500">Mới</Badge>}
                  {item.discountPercentage && item.discountPercentage > 0 && (
                    <Badge variant="destructive">
                      -{item.discountPercentage}%
                    </Badge>
                  )}
                </div>

                {/* Quick actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleQuickView(item)}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    {/* <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAddToCart(item.id)}
                      disabled={isMovingToCart[item.id] || !item.stockQuantity}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      {isMovingToCart[item.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                    </Button> */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isRemoving[item.id]}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      {isRemoving[item.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <div className="truncate">
                    {item.brandName || item.categories?.[0]?.name || ""}
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-amber-400 mr-1"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{item.avgRating?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>

                <Link
                  href={`/product/${item.slug}`}
                  className="block text-sm font-medium line-clamp-2 hover:text-primary"
                >
                  {item.name}
                </Link>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    {item.compareAtPrice &&
                      item.compareAtPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                  </div>

                  {item.stockQuantity > 0 ? (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 bg-emerald-50 border-emerald-200"
                    >
                      Còn hàng
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-red-600 bg-red-50 border-red-200"
                    >
                      Hết hàng
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick view sheet */}
      <Sheet open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full">
          {quickViewItem && (
            <div className="h-full flex flex-col">
              <SheetHeader>
                <SheetTitle>{quickViewItem.name}</SheetTitle>
                <SheetDescription>
                  {quickViewItem.brandName && `${quickViewItem.brandName} • `}
                  {quickViewItem.categories?.[0]?.name}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6">
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-md mb-6">
                  {quickViewItem.mainImage ? (
                    <Image
                      src={quickViewItem.mainImage.url}
                      alt={quickViewItem.mainImage.alt || quickViewItem.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">
                        {formatPrice(quickViewItem.price)}
                      </span>
                      {quickViewItem.compareAtPrice &&
                        quickViewItem.compareAtPrice > quickViewItem.price && (
                          <span className="text-base text-gray-500 line-through">
                            {formatPrice(quickViewItem.compareAtPrice)}
                          </span>
                        )}
                    </div>

                    {quickViewItem.discountPercentage &&
                      quickViewItem.discountPercentage > 0 && (
                        <Badge variant="destructive">
                          -{quickViewItem.discountPercentage}%
                        </Badge>
                      )}
                  </div>

                  <Separator />

                  {/* Tabs for product info */}
                  <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Thông tin</TabsTrigger>
                      <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">SKU</div>
                        <div>SKU123456</div>

                        <div className="text-gray-500">Thương hiệu</div>
                        <div>{quickViewItem.brandName || "N/A"}</div>

                        <div className="text-gray-500">Tình trạng</div>
                        <div>
                          {quickViewItem.stockQuantity > 0
                            ? `Còn hàng (${quickViewItem.stockQuantity})`
                            : "Hết hàng"}
                        </div>

                        <div className="text-gray-500">Đánh giá</div>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mr-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill={
                                  i < Math.floor(quickViewItem.avgRating || 0)
                                    ? "currentColor"
                                    : "none"
                                }
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({quickViewItem.reviewCount || 0})
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-4">
                        {/* Placeholder product description */}
                        Sản phẩm chất lượng cao với thiết kế hiện đại và tinh
                        tế. Phù hợp cho mọi nhu cầu sử dụng hàng ngày.
                      </p>
                    </TabsContent>
                    <TabsContent value="shipping" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-full">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              Bảo hành chính hãng
                            </h4>
                            <p className="text-xs text-gray-500">
                              Sản phẩm được bảo hành 12 tháng
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-50 p-2 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              Đổi trả miễn phí
                            </h4>
                            <p className="text-xs text-gray-500">
                              Đổi trả trong vòng 7 ngày
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-50 p-2 rounded-full">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              Thanh toán an toàn
                            </h4>
                            <p className="text-xs text-gray-500">
                              Nhiều phương thức thanh toán
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                {/* <Button
                  className="w-full gap-2"
                  onClick={() => handleAddToCart(quickViewItem.id)}
                  disabled={
                    isMovingToCart[quickViewItem.id] ||
                    !quickViewItem.stockQuantity
                  }
                >
                  {isMovingToCart[quickViewItem.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  {quickViewItem.stockQuantity > 0
                    ? "Thêm vào giỏ hàng"
                    : "Hết hàng"}
                </Button> */}

                <Link
                  href={`/product/${quickViewItem.slug}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full gap-2">
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tất cả sản phẩm yêu thích?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích
              không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
