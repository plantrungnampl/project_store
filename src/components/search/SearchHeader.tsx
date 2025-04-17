"use client";

import { Header } from "@/components/layout/Header";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchInput from "./SearchInput";

export default function SearchHeader() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [expanded, setExpanded] = useState(false);

  // Khi cuộn xuống, thu nhỏ header tìm kiếm mở rộng
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Header bình thường cho các trang khác
  // if (!query && !expanded) {
  //   return <Header />;
  // }

  // Header tùy chỉnh cho trang tìm kiếm có query
  return (
    <>
      {/* <Header /> */}

      {/* Phần tìm kiếm mở rộng */}
      <div className="bg-white border-b shadow-sm py-4 px-4 md:px-0">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <SearchInput
              className="w-full"
              placeholder="Tìm kiếm sản phẩm..."
            />
          </div>

          {query && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm justify-center">
              <span>Kết quả cho: </span>
              <span className="font-medium text-primary">
                &quot;{query}&quot;
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
