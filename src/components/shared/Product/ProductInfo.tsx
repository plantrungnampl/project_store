"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  Share2,
  TruckIcon,
  ShieldCheck,
  Star,
  StarHalf,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getAvailableAttributeCombinations,
  findMatchingVariant,
  isAttributeCombinationAvailable,
} from "@/lib/productUtils";
import { formatPrice } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
export interface ProductVariant {
  id: string;
  sku: string;
  name?: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  images?: Array<{url: string, altText?: string}>;
  attributes: Array<{
    attributeValue: {
      id: string;
      value: string;
      displayValue: string;
      colorCode?: string;
      attribute: {
        id: string;
        name: string;
        displayName: string;
      };
    };
  }>;
}

export interface ProductAttribute {
  id: string;
  name: string;
  displayName: string;
  values: Array<{
    id: string;
    value: string;
    displayValue: string;
    colorCode?: string;
    imageUrl?: string;
  }>;
}

export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  isNew: boolean;
  discountPercentage?: number;
  avgRating?: number;
  reviewCount?: number;
  brandName?: string;
  brandSlug?: string;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  variants?: ProductVariant[];
  variantAttributes?: ProductAttribute[];
  images?: Array<{url: string, altText?: string}>;
}

interface ProductInfoProps {
  product: ProductDetails;
  actionButton: React.ReactNode;
  onVariantChange?: (variant: ProductVariant | null) => void;
  onQuantityChange?: (quantity: number) => void;
}

export default function ProductInfo({
  product,
  actionButton,
  onVariantChange,
  onQuantityChange,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [showVariantWarning, setShowVariantWarning] = useState(false);

  // Memoized calculations
  const hasVariants = useMemo(
    () => product.variants && product.variants.length > 0,
    [product.variants]
  );

  // Sửa cách tính stockQuantity để đảm bảo luôn có giá trị hợp lệ
  const stockQuantity = useMemo(() => {
    if (hasVariants) {
      if (selectedVariant) {
        return selectedVariant.stockQuantity;
      } else {
        // Nếu có variants nhưng chưa chọn variant, hiển thị 0
        return 0;
      }
    } else {
      return product.stockQuantity || 0; // Đảm bảo không trả về undefined/null
    }
  }, [hasVariants, selectedVariant, product.stockQuantity]);

  // Sửa lại cách tính isInStock để rõ ràng hơn
  const isInStock = useMemo(() => {
    if (hasVariants) {
      // Với sản phẩm có variants, cần chọn variant và variant đó phải có stockQuantity > 0
      return !!selectedVariant && selectedVariant.stockQuantity > 0;
    } else {
      // Với sản phẩm không có variants, chỉ cần kiểm tra stockQuantity
      return (product.stockQuantity || 0) > 0;
    }
  }, [hasVariants, selectedVariant, product.stockQuantity]);

  const displayPrice = useMemo(
    () => (selectedVariant ? selectedVariant.price : product.price),
    [selectedVariant, product.price]
  );

  const displayComparePrice = useMemo(
    () =>
      selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice,
    [selectedVariant, product.compareAtPrice]
  );

  const discountPercentage = useMemo(() => {
    if (product.discountPercentage) return product.discountPercentage;

    if (displayComparePrice && displayPrice < displayComparePrice) {
      return Math.round(
        ((displayComparePrice - displayPrice) / displayComparePrice) * 100
      );
    }

    return null;
  }, [product.discountPercentage, displayPrice, displayComparePrice]);

  // Determine available variants and their combinations
  const availableCombinations = useMemo(() => {
    if (!hasVariants || !product.variants || !product.variantAttributes) {
      return new Map();
    }

    // Only consider variants that are in stock
    const inStockVariants = product.variants.filter(
      (v) => v.stockQuantity > 0 && v.isActive
    );

    return getAvailableAttributeCombinations(
      inStockVariants,
      product.variantAttributes
    );
  }, [hasVariants, product.variants, product.variantAttributes]);

  // Find a default in-stock variant on initial load
  useEffect(() => {
    if (
      hasVariants &&
      product.variants &&
      Object.keys(selectedAttributes).length === 0
    ) {
      // Find first variant that is in stock
      const inStockVariant = product.variants.find(
        (v) => v.stockQuantity > 0 && v.isActive
      );

      if (inStockVariant && inStockVariant.attributes) {
        // Extract attributes from this variant to pre-select them
        const defaultAttributes: Record<string, string> = {};

        inStockVariant.attributes.forEach((attr) => {
          if (attr.attributeValue?.attribute?.id) {
            defaultAttributes[attr.attributeValue.attribute.id] =
              attr.attributeValue.id;
          }
        });

        // Only set if we found valid attributes
        if (Object.keys(defaultAttributes).length > 0) {
          setSelectedAttributes(defaultAttributes);
          setSelectedVariant(inStockVariant);
        }
      }
    }
  }, [hasVariants, product.variants]);

  // Find matching variant when attributes change
  useEffect(() => {
    if (
      hasVariants &&
      product.variants &&
      Object.keys(selectedAttributes).length > 0
    ) {
      const variant = findMatchingVariant(selectedAttributes, product.variants);
      setSelectedVariant(variant || null);

      // Show warning if the selected combination doesn't match any variant
      if (
        product.variantAttributes &&
        Object.keys(selectedAttributes).length ===
          product.variantAttributes.length &&
        !variant
      ) {
        setShowVariantWarning(true);
      } else {
        setShowVariantWarning(false);
      }
    }
  }, [
    selectedAttributes,
    hasVariants,
    product.variants,
    product.variantAttributes,
  ]);

  // Notify parent when variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // Notify parent when quantity changes
  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(quantity);
    }
  }, [quantity, onQuantityChange]);

  // Handler when attribute selection changes
  const handleAttributeChange = useCallback(
    (attributeId: string, valueId: string) => {
      setSelectedAttributes((prev) => ({
        ...prev,
        [attributeId]: valueId,
      }));
    },
    []
  );

  // Quantity handlers
  const decreaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    if (!hasVariants || selectedVariant) {
      setQuantity((prev) => (prev < stockQuantity ? prev + 1 : prev));
    }
  }, [hasVariants, selectedVariant, stockQuantity]);

  // Render rating stars
  const renderRatingStars = useCallback((rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <StarHalf
                key={i}
                className="h-4 w-4 fill-amber-400 text-amber-400"
              />
            );
          } else {
            return <Star key={i} className="h-4 w-4 text-gray-300" />;
          }
        })}
      </div>
    );
  }, []);

  // Check if a specific attribute value is available
  const isAttributeValueAvailable = useCallback(
    (attributeId: string, valueId: string) => {
      // If no attributes selected yet, all options with available variants should be enabled
      if (Object.keys(selectedAttributes).length === 0) {
        return availableCombinations.get(attributeId)?.has(valueId) || false;
      }

      // For subsequent selections, check based on previous selections
      const tempAttributes = { ...selectedAttributes, [attributeId]: valueId };

      // For the current attribute being selected, filter other attributes
      // to check if this selection would lead to a valid combination
      if (product.variantAttributes) {
        for (const attr of product.variantAttributes) {
          // Skip the current attribute being selected
          if (attr.id === attributeId) continue;

          // If this attribute is not selected yet, skip
          if (!tempAttributes[attr.id]) continue;

          // Check if the combination of current selection + this attribute is valid
          const attributeExists = availableCombinations
            .get(attr.id)
            ?.has(tempAttributes[attr.id]);
          if (!attributeExists) return false;
        }
      }

      return availableCombinations.get(attributeId)?.has(valueId) || false;
    },
    [availableCombinations, selectedAttributes, product.variantAttributes]
  );

  // Get the action button but potentially disabled
  const actionButtonWithCheck = useMemo(() => {
    // Clone the action button but with disabled state if needed
    if (hasVariants && !selectedVariant) {
      // Find the original button and clone it with disabled prop
      const originalButton = actionButton as React.ReactElement;

      if (originalButton) {
        return React.cloneElement(originalButton, {
          disabled: true,
          title: "Vui lòng chọn biến thể sản phẩm",
        });
      }
    }

    return actionButton;
  }, [actionButton, hasVariants, selectedVariant]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Header - Brand and badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {product.brandName && (
          <Link
            href={`/brands/${product.brandSlug}`}
            className="text-sm font-medium text-gray-600 hover:text-primary"
          >
            {product.brandName}
          </Link>
        )}

        <div className="flex flex-wrap gap-2">
          {product.isNew && (
            <Badge variant="default" className="bg-blue-500">
              Mới
            </Badge>
          )}
          {discountPercentage && (
            <Badge variant="destructive">-{discountPercentage}%</Badge>
          )}
          {product.isFeatured && (
            <Badge variant="secondary" className="bg-purple-500 text-white">
              Nổi bật
            </Badge>
          )}
          {product.isDigital && (
            <Badge variant="outline" className="bg-gray-800 text-white">
              Digital
            </Badge>
          )}
        </div>
      </div>

      {/* Product title */}
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

      {/* Rating and reviews */}
      {product.avgRating && product.avgRating > 0 && (
        <div className="flex items-center gap-2">
          {renderRatingStars(product.avgRating)}
          <span className="text-sm text-gray-600">
            ({product.reviewCount || 0} đánh giá)
          </span>
        </div>
      )}

      {/* Product SKU */}
      <div className="text-sm text-gray-500">
        Mã sản phẩm: {selectedVariant ? selectedVariant.sku : product.sku}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-gray-900">
          {formatPrice(displayPrice)}
        </span>

        {displayComparePrice && displayComparePrice > displayPrice && (
          <span className="text-xl text-gray-500 line-through">
            {formatPrice(displayComparePrice)}
          </span>
        )}
      </div>

      {/* Short description */}
      {product.description && (
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>
            {product.description.length > 200
              ? product.description.substring(0, 200) + "..."
              : product.description}
          </p>
        </div>
      )}

      <Separator />

      {/* Warning when variant combination is invalid */}
      {showVariantWarning && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-800 border border-red-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tổ hợp thuộc tính đã chọn không có sẵn. Vui lòng chọn tổ hợp khác.
          </AlertDescription>
        </Alert>
      )}

      {/* Show guidance message if has variants */}
      {hasVariants &&
        product.variantAttributes &&
        product.variantAttributes.length > 0 && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>
              Vui lòng chọn{" "}
              {product.variantAttributes
                .map((attr) => attr.displayName.toLowerCase())
                .join(" và ")}{" "}
              để tiếp tục.
            </p>
          </div>
        )}

      {/* Variant selection */}
      {product.variantAttributes && product.variantAttributes.length > 0 && (
        <div className="space-y-4">
          {product.variantAttributes.map((attribute) => (
            <div key={attribute.id}>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                {attribute.displayName}
              </Label>

              <RadioGroup
                value={selectedAttributes[attribute.id] || ""}
                onValueChange={(value) =>
                  handleAttributeChange(attribute.id, value)
                }
                className="flex flex-wrap gap-2"
              >
                {attribute.values.map((value) => {
                  const isAvailable = isAttributeValueAvailable(
                    attribute.id,
                    value.id
                  );

                  return (
                    <div key={value.id} className="relative">
                      <RadioGroupItem
                        id={`${attribute.id}-${value.id}`}
                        value={value.id}
                        className="sr-only"
                        disabled={!isAvailable}
                      />
                      <Label
                        htmlFor={`${attribute.id}-${value.id}`}
                        className={`
                          flex items-center justify-center 
                          min-w-[3rem] h-10 px-3 
                          rounded-md border
                          ${
                            selectedAttributes[attribute.id] === value.id
                              ? "border-primary bg-primary/10 text-primary"
                              : isAvailable
                              ? "border-gray-200 hover:border-gray-300 cursor-pointer"
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                          } 
                          transition-colors relative
                        `}
                      >
                        {value.colorCode ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: value.colorCode }}
                            />
                            <span>{value.displayValue}</span>
                          </div>
                        ) : (
                          value.displayValue
                        )}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 border-t border-red-500 rotate-45 transform origin-center"></div>
                          </div>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="space-y-4">
        {/* Stock info */}
        <div>
          {isInStock ? (
            <span className="text-sm text-green-600 font-medium">
              {stockQuantity > 10
                ? "Còn hàng"
                : `Chỉ còn ${stockQuantity} sản phẩm`}
            </span>
          ) : hasVariants && !selectedVariant ? (
            <span className="text-sm text-gray-600 font-medium">
              Vui lòng chọn phiên bản để xem tình trạng kho
            </span>
          ) : (
            <span className="text-sm text-red-600 font-medium">Hết hàng</span>
          )}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <Label htmlFor="quantity" className="font-medium">
            Số lượng:
          </Label>

          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={decreaseQuantity}
              disabled={quantity <= 1 || !isInStock}
            >
              -
            </Button>
            <div className="h-10 w-14 flex items-center justify-center border-y border-gray-200">
              {quantity}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-l-none"
              onClick={increaseQuantity}
              disabled={
                !isInStock ||
                (hasVariants && !selectedVariant) ||
                quantity >= stockQuantity
              }
            >
              +
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Action button (Add to Cart) */}
          <div className="flex-1">{actionButtonWithCheck}</div>

          {/* Wishlist button */}
          <Button variant="outline" size="lg" className="gap-2">
            <Heart className="h-5 w-5" />
            <span className="hidden sm:inline">Yêu thích</span>
          </Button>

          {/* Share button */}
          <Button variant="outline" size="icon" className="h-12 w-12">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <TruckIcon className="h-5 w-5 text-gray-600" />
          <div>
            <p className="font-medium text-gray-900">Miễn phí vận chuyển</p>
            <p className="text-sm text-gray-600">Cho đơn hàng từ 500.000đ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-gray-600" />
          <div>
            <p className="font-medium text-gray-900">Bảo hành 12 tháng</p>
            <p className="text-sm text-gray-600">
              Đổi trả miễn phí trong 7 ngày
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      {product.categories && product.categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600">
          <span>Danh mục:</span>
          {product.categories.map((category, index) => (
            <span key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="text-primary hover:underline"
              >
                {category.name}
              </Link>
              {index < (product.categories?.length || 0) - 1 && ", "}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
