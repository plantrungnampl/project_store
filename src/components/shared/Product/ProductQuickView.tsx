"use client";

import { useProductQuickView } from "@/context/ProductQuickViewContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Star,
  Truck,
  ShieldCheck,
  Clock,
  Loader2,
  Share2,
  ChevronRight,
  MinusCircle,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductQuickView() {
  const { isOpen, isLoading, product, closeQuickView } = useProductQuickView();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Xử lý thêm vào giỏ hàng (mô phỏng)
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      // Giả lập gọi API thêm vào giỏ hàng
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Đã thêm vào giỏ hàng", {
        description: `${quantity} x ${product.name} đã được thêm vào giỏ hàng của bạn`,
      });
    } catch (error) {
      toast.error("Lỗi khi thêm vào giỏ hàng", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Tăng số lượng
  const increaseQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // Giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Hiển thị khi đang tải
  if (isLoading || !product) {
    return (
      <Dialog open={isOpen} onOpenChange={closeQuickView}>
        <DialogContent className="sm:max-w-3xl">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Đang tải thông tin sản phẩm...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Chọn các hình ảnh để hiển thị
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.mainImage
      ? [product.mainImage]
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={closeQuickView}>
      <DialogContent className="sm:max-w-4xl h-[90vh] max-h-[800px] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>
            {product.brandName && (
              <Link
                href={`/brands/${product.brandSlug}`}
                className="text-primary hover:underline"
              >
                {product.brandName}
              </Link>
            )}
            {product.categories && product.categories.length > 0 && (
              <>
                {product.brandName && " • "}
                <Link
                  href={`/category/${product.categories[0].slug}`}
                  className="text-primary hover:underline"
                >
                  {product.categories[0].name}
                </Link>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Phần hình ảnh bên trái */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">Không có hình ảnh</span>
                </div>
              )}

              {product.discountPercentage && product.discountPercentage > 0 && (
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive">
                    -{product.discountPercentage}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image.url}
                      alt={
                        image.alt || `${product.name} thumbnail ${index + 1}`
                      }
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phần thông tin bên phải */}
          <div className="space-y-6">
            {/* Giá sản phẩm */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.price && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                </div>

                {/* Tình trạng kho */}
                {product.stockQuantity > 0 ? (
                  <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                    Còn hàng ({product.stockQuantity} sản phẩm)
                  </p>
                ) : (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    Hết hàng
                  </p>
                )}
              </div>

              {/* Đánh giá */}
              {product.avgRating !== undefined && (
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.avgRating || 0)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 fill-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm font-medium">
                      {product.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {product.reviewCount} đánh giá
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Mô tả ngắn */}
            <div>
              <h3 className="text-sm font-medium mb-2">Mô tả</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            {/* Thuộc tính sản phẩm */}
            {product.attributeValues && product.attributeValues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Đặc điểm</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  {product.attributeValues.map((attr, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-500">{attr.name}</span>
                      <span className="font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biến thể sản phẩm (nếu có) */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Lựa chọn phiên bản</h3>
                <Select onValueChange={setSelectedVariant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phiên bản" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name} - {formatPrice(variant.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Số lượng */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">
                Số lượng
              </Label>
              <div className="flex items-center mt-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-9 w-9"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <div className="w-14 mx-2 text-center">
                  <span className="text-lg font-medium">{quantity}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={product.stockQuantity <= quantity}
                  className="h-9 w-9"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs thông tin bổ sung */}
            <Tabs defaultValue="shipping" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Chi tiết</TabsTrigger>
                <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
                <TabsTrigger value="returns">Đổi trả</TabsTrigger>
              </TabsList>
              <TabsContent
                value="details"
                className="p-4 bg-gray-50 rounded-md mt-2"
              >
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">SKU</div>
                    <div>{product.sku}</div>
                    {product.brandName && (
                      <>
                        <div className="text-gray-600">Thương hiệu</div>
                        <div>{product.brandName}</div>
                      </>
                    )}
                    <div className="text-gray-600">Loại</div>
                    <div>
                      {product.categories?.[0]?.name || "Chưa phân loại"}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="shipping"
                className="p-4 bg-gray-50 rounded-md mt-2"
              >
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Vận chuyển toàn quốc</p>
                      <p className="text-gray-600">
                        Giao hàng từ 2-5 ngày làm việc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Sản phẩm chính hãng</p>
                      <p className="text-gray-600">Đảm bảo nguồn gốc xuất xứ</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="returns"
                className="p-4 bg-gray-50 rounded-md mt-2"
              >
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Đổi trả trong 7 ngày</p>
                      <p className="text-gray-600">
                        Đối với sản phẩm lỗi do nhà sản xuất
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            className="sm:flex-1 gap-2"
            onClick={closeQuickView}
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
          <WishlistButton
            productId={product.id}
            variant="default"
            className="sm:flex-1"
          />
          <Button
            className="sm:flex-1 gap-2"
            size="lg"
            disabled={product.stockQuantity <= 0 || isAddingToCart}
            onClick={handleAddToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Thêm vào giỏ
          </Button>
          <Button
            variant="default"
            className="bg-primary/90 hover:bg-primary gap-2"
            size="lg"
            onClick={() => (window.location.href = `/product/${product.slug}`)}
          >
            Xem chi tiết
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
