"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandProps {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
}

interface BrandShowcaseProps {
  brands: BrandProps[];
}

export default function BrandShowcase({ brands }: BrandShowcaseProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tự động scroll mượt mà cho brands
  useEffect(() => {
    if (!scrollContainerRef.current || brands.length <= 5) return;

    let scrolling = true;
    const scrollAmount = 0.5; // Tốc độ scroll (pixels/frame)
    let animationFrameId: number;

    const scroll = () => {
      if (!scrollContainerRef.current || !scrolling) return;

      const container = scrollContainerRef.current;

      // Nếu đã scroll đến cuối, reset về đầu
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += scrollAmount;
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    // Bắt đầu scroll animation
    animationFrameId = requestAnimationFrame(scroll);

    // Dừng animation khi hover vào
    const handleMouseEnter = () => {
      scrolling = false;
      cancelAnimationFrame(animationFrameId);
    };

    // Tiếp tục animation khi mouse leave
    const handleMouseLeave = () => {
      scrolling = true;
      animationFrameId = requestAnimationFrame(scroll);
    };

    const container = scrollContainerRef.current;
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [brands.length]);

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-8 pb-6 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Duplicate brands for infinite scroll effect */}
        {[...brands, ...brands].map((brand, index) => (
          <Link
            key={`${brand.id}-${index}`}
            href={`/brands/${brand.slug}`}
            className="flex-none group flex flex-col items-center transition-transform hover:-translate-y-1"
          >
            <div className="w-32 h-32 flex items-center justify-center mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-all group-hover:shadow-md">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={100}
                  height={100}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                />
              ) : (
                <div className="text-xl font-bold text-gray-800 text-center">
                  {brand.name}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/brands"
        className="self-center mt-6 text-primary hover:text-primary-700 font-medium flex items-center gap-1"
      >
        Xem tất cả thương hiệu
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
