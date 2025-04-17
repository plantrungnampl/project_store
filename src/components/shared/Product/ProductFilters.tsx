"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ProductFilterProps {
  initialFilter?: string | string[];
  initialCategory?: string;
  initialSort?: string;
  initialPriceRange?: [number, number];
  categories?: { id: string; name: string; slug: string }[];
}

export default function ProductFilter({
  initialFilter = [],
  initialCategory = "",
  initialSort = "relevance",
  initialPriceRange = [0, 10000000],
  categories = [],
}: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Convert initialFilter to array if it's a string
  const initialFilters = Array.isArray(initialFilter)
    ? initialFilter
    : initialFilter
    ? [initialFilter]
    : [];

  // Use array of filters instead of single filter
  const [filters, setFilters] = useState<string[]>(initialFilters);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [priceRange, setPriceRange] =
    useState<[number, number]>(initialPriceRange);

  // Ensure price range is valid - min <= max
  const setPriceRangeWithValidation = (values: [number, number]) => {
    // Always ensure the first value is <= second value
    if (values[0] <= values[1]) {
      setPriceRange(values);
    } else {
      // If min > max, set max to min
      setPriceRange([values[0], values[0]]);
    }
  };

  // Check if featured products are requested
  const featured = searchParams.get("featured") === "true";

  // Check if a filter value is active
  const isFilterActive = (value: string) => filters.includes(value);

  // Toggle a filter value
  const toggleFilter = (value: string, checked: boolean) => {
    if (checked) {
      setFilters((prev) => [...prev, value]);
    } else {
      setFilters((prev) => prev.filter((f) => f !== value));
    }
  };

  // Apply filters
  const applyFilters = () => {
    // Initialize query params
    const params = new URLSearchParams();

    // Keep featured flag if it's already there
    if (featured) params.set("featured", "true");

    // Add all active filters
    if (filters.length > 0) {
      // For compatibility with existing code, we'll use a comma-separated list
      params.set("filter", filters.join(","));
    }

    // Set other filters
    if (category) params.set("category", category);
    if (sort !== "relevance") params.set("sort", sort); // Only add if not default

    // Add price range values if different from default
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 10000000)
      params.set("maxPrice", priceRange[1].toString());

    // Reset to page 1 when filters change
    params.set("page", "1");

    // Preserve search query if present
    const query = searchParams.get("q");
    if (query) params.set("q", query);

    // Navigate with the new params
    router.push(`${pathname}?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters([]);
    setCategory("");
    setSort("relevance");
    setPriceRange([0, 10000000]);

    const params = new URLSearchParams();
    if (featured) params.set("featured", "true");

    // Preserve search query if present
    const query = searchParams.get("q");
    if (query) params.set("q", query);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Sắp xếp</h3>
        <RadioGroup value={sort} onValueChange={setSort} className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="relevance" id="sort-relevance" />
            <Label htmlFor="sort-relevance">Mặc định</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest">Mới nhất</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-low" id="sort-price-low" />
            <Label htmlFor="sort-price-low">Giá tăng dần</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-high" id="sort-price-high" />
            <Label htmlFor="sort-price-high">Giá giảm dần</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="popular" id="sort-popular" />
            <Label htmlFor="sort-popular">Phổ biến nhất</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Lọc theo</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-new"
              checked={isFilterActive("new")}
              onCheckedChange={(checked) =>
                toggleFilter("new", checked === true)
              }
            />
            <Label htmlFor="filter-new">Sản phẩm mới</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-sale"
              checked={isFilterActive("sale")}
              onCheckedChange={(checked) =>
                toggleFilter("sale", checked === true)
              }
            />
            <Label htmlFor="filter-sale">Đang giảm giá</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-stock"
              checked={isFilterActive("in-stock")}
              onCheckedChange={(checked) =>
                toggleFilter("in-stock", checked === true)
              }
            />
            <Label htmlFor="filter-stock">Còn hàng</Label>
          </div>
        </div>
      </div>

      {/* Categories filter */}
      {categories && categories.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Danh mục</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${cat.id}`}
                  checked={category === cat.slug}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCategory(cat.slug);
                    } else if (category === cat.slug) {
                      setCategory("");
                    }
                  }}
                />
                <Label htmlFor={`category-${cat.id}`}>{cat.name}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Khoảng giá</h3>
        <Slider
          value={priceRange}
          min={0}
          max={10000000}
          step={100000}
          onValueChange={(value) =>
            setPriceRangeWithValidation(value as [number, number])
          }
          className="mb-6"
        />
        <div className="flex justify-between text-sm">
          <span>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(priceRange[0])}
          </span>
          <span>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(priceRange[1])}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button onClick={applyFilters} className="w-full">
          Áp dụng bộ lọc
        </Button>
        <Button onClick={resetFilters} variant="outline" className="w-full">
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}
