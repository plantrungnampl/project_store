"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSortProps {
  currentSort: string;
}

export default function ProductSort({ currentSort }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update sort parameter
    params.set("sort", value);

    // Reset to page 1 when sort changes
    params.set("page", "1");

    // Update URL with new sort
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sắp xếp theo:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="price-asc">Giá (Thấp - Cao)</SelectItem>
          <SelectItem value="price-desc">Giá (Cao - Thấp)</SelectItem>
          <SelectItem value="popular">Phổ biến nhất</SelectItem>
          <SelectItem value="name-asc">Tên (A-Z)</SelectItem>
          <SelectItem value="name-desc">Tên (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
