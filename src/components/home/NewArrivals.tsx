"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "../shared/Product/ProductCard";
import { useDebounce } from "@/lib/hook";

// Define breakpoints as constants to prevent recreating them on each render
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
};

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
  // Early return if no products, preventing unnecessary work

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true); // Default to true initially
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Calculate items per view based on screen width
  const calculateItemsPerView = useCallback((width: number): number => {
    if (width < BREAKPOINTS.mobile) return 1;
    if (width < BREAKPOINTS.tablet) return 2;
    if (width < BREAKPOINTS.desktop) return 3;
    return 4;
  }, []);

  // Check scroll position and update state
  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    // Add small threshold to avoid flickering at edges
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);

    // Calculate current visible item index
    const itemWidth = clientWidth / itemsPerView;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActiveIndex(newIndex);
  }, [itemsPerView]);

  // Create debounced version of scroll update function
  const debouncedScrollHandler = useDebounce(updateScrollState, 100);

  // Handle window resize
  const handleResize = useCallback(() => {
    // SSR safety check
    if (typeof window === "undefined" || !carouselRef.current) return;

    const newItemsPerView = calculateItemsPerView(window.innerWidth);
    if (newItemsPerView !== itemsPerView) {
      setItemsPerView(newItemsPerView);
    }

    // Update scroll state immediately instead of waiting for debounce
    updateScrollState();
  }, [updateScrollState, calculateItemsPerView, itemsPerView]);

  // Setup resize observer and initial scroll check
  useEffect(() => {
    if (!carouselRef.current || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    const currentRef = carouselRef.current;
    resizeObserver.observe(currentRef);

    // Initial check
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Scroll the carousel by page
  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!carouselRef.current) return;

      const container = carouselRef.current;
      const itemWidth = container.clientWidth / itemsPerView;

      // Use Math.floor to ensure we get integer pixel values
      const scrollAmount = Math.floor(itemWidth * itemsPerView);

      // Use scrollBy for relative scrolling
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [itemsPerView]
  );

  // Scroll to specific page index
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!carouselRef.current) return;

      const container = carouselRef.current;
      const itemWidth = container.clientWidth / itemsPerView;

      container.scrollTo({
        left: Math.floor(index * itemWidth),
        behavior: "smooth",
      });
    },
    [itemsPerView]
  );

  // Calculate pagination info
  const totalPages = Math.ceil(products.length / itemsPerView);
  const currentPage = Math.floor(activeIndex / itemsPerView);
  if (!products?.length) return null;

  return (
    <div className="relative">
      {/* Navigation buttons with improved accessibility */}
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

      {/* Carousel container with accessibility improvements */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x scroll-smooth"
        onScroll={debouncedScrollHandler}
        role="region"
        aria-label="Product carousel"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex-none w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
            role="group"
            aria-label={`Product ${index + 1} of ${products.length}`}
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Pagination dots with proper ARIA attributes */}
      {totalPages > 1 && (
        <div
          className="flex justify-center gap-2 mt-6"
          role="tablist"
          aria-label="Product pages"
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              role="tab"
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentPage === i
                  ? "bg-primary w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => scrollToIndex(i * itemsPerView)}
              aria-label={`Page ${i + 1} of ${totalPages}`}
              aria-selected={currentPage === i}
              tabIndex={currentPage === i ? 0 : -1}
            />
          ))}
        </div>
      )}

      {/* View all button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/product?sort=newest&filter=new&showFilters=true"
          className="flex items-center justify-center text-primary hover:text-primary/90 border border-primary hover:bg-primary/5 transition-colors px-6 py-2 rounded-md font-medium"
          aria-label="View all new products"
        >
          Xem tất cả sản phẩm mới
        </Link>
      </div>
    </div>
  );
}
