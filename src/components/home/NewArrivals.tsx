"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "../shared/Product/ProductCard";

interface ProductType {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  isNew?: boolean;
  discountPercentage?: number | null;
  avgRating?: number;
  reviewCount?: number;
  brandName?: string | null;
  brandSlug?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  mainImage?: { url: string; alt: string } | null;
  images?: { url: string; alt: string }[];
}

interface NewArrivalsProps {
  products: ProductType[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  const checkScroll = () => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer

    // Calculate active index based on scroll position
    const itemWidth = clientWidth / itemsPerView;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActiveIndex(newIndex);
  };

  const updateItemsPerView = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1);
    } else if (window.innerWidth < 768) {
      setItemsPerView(2);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4);
    }
  };

  useEffect(() => {
    updateItemsPerView();
    checkScroll();

    window.addEventListener("resize", () => {
      updateItemsPerView();
      checkScroll();
    });

    return () => {
      window.removeEventListener("resize", updateItemsPerView);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const itemWidth = container.clientWidth / itemsPerView;

    const scrollAmount =
      direction === "left"
        ? container.scrollLeft - itemWidth * itemsPerView
        : container.scrollLeft + itemWidth * itemsPerView;

    container.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });

    // Update state after scrolling
    setTimeout(checkScroll, 300);
  };

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const itemWidth = container.clientWidth / itemsPerView;

    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 300);
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Calculate total number of pages
  const totalPages = Math.ceil(products.length / itemsPerView);

  return (
    <div className="relative">
      {/* Navigation buttons */}
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow-md text-gray-800 hover:bg-white -ml-4 h-10 w-10 lg:h-12 lg:w-12"
          onClick={() => scroll("left")}
          aria-label="Previous products"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow-md text-gray-800 hover:bg-white -mr-4 h-10 w-10 lg:h-12 lg:w-12"
          onClick={() => scroll("right")}
          aria-label="Next products"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x scroll-smooth"
        onScroll={checkScroll}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                Math.floor(activeIndex / itemsPerView) === i
                  ? "bg-primary w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => scrollToIndex(i * itemsPerView)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* View all button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/products?sort=newest"
          className="flex items-center justify-center text-primary hover:text-primary/90 border border-primary hover:bg-primary/5 transition-colors px-6 py-2 rounded-md font-medium"
        >
          Xem tất cả sản phẩm mới
        </Link>
      </div>
    </div>
  );
}
