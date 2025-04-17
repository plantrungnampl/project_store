"use client";

import { useRouter } from "next/navigation";

interface SortSelectorProps {
  currentSort: string;
  searchParams: URLSearchParams;
}

export default function SortSelector({
  currentSort,
  searchParams,
}: SortSelectorProps) {
  const router = useRouter();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);

    if (newSort !== "relevance") {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }

    // Giữ nguyên trang hiện tại
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="bg-gray-50 border border-gray-200 rounded-md text-sm px-3 py-1.5"
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="relevance">Liên quan nhất</option>
      <option value="newest">Mới nhất</option>
      <option value="price-low">Giá tăng dần</option>
      <option value="price-high">Giá giảm dần</option>
      <option value="popular">Phổ biến nhất</option>
    </select>
  );
}
