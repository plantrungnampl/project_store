"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import {
  getRecommendedProducts,
  getRelatedProducts,
} from "@/app/actions/productActions";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface RecommendedProductsProps {
  productId?: string;
  useRecommended?: boolean;
  limit?: number;
  title?: string;
  className?: string;
}

// Memoize ProductCard component to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);

export default function RecommendedProducts({
  productId,
  useRecommended = false,
  limit = 4,
  title,
  className,
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loadMoreCount, setLoadMoreCount] = useState(0);

  // Intersection observer for lazy loading
  const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    rootMargin: "100px",
  });

  // Calculate items to show based on viewport
  const itemsPerPage = limit;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Memoize displayedProducts to prevent unnecessary recalculations
  const displayedProducts = visibleProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let fetchedProducts;

      if (useRecommended) {
        // Fetch popular/recommended products
        fetchedProducts = await getRecommendedProducts(limit * 2);
      } else if (productId) {
        // Fetch related products based on current product
        fetchedProducts = await getRelatedProducts(productId, limit * 2);
      } else {
        // Fallback to recommended if no product ID (shouldn't happen)
        fetchedProducts = await getRecommendedProducts(limit * 2);
      }

      setProducts(fetchedProducts);
      setVisibleProducts(fetchedProducts.slice(0, limit * 2));
      setHasMore(fetchedProducts.length > limit);
    } catch (err) {
      console.error("Error fetching recommended products:", err);
      setError("Không thể tải sản phẩm đề xuất");
    } finally {
      setLoading(false);
    }
  }, [productId, useRecommended, limit]);

  // Load more products when scrolling
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || loadMoreCount >= 3) return;
    
    setLoadingMore(true);
    try {
      let additionalProducts;
      if (useRecommended) {
        additionalProducts = await getRecommendedProducts(limit * 2);
      } else if (productId) {
        additionalProducts = await getRelatedProducts(productId, limit * 2);
      } else {
        additionalProducts = await getRecommendedProducts(limit * 2);
      }
      
      // Filter out products that are already shown
      const existingIds = new Set(products.map(p => p.id));
      const newProducts = additionalProducts.filter(p => !existingIds.has(p.id));
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setVisibleProducts(prev => [...prev, ...newProducts]);
        setLoadMoreCount(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loadMoreCount, useRecommended, productId, products, limit]);

  // Auto-scroll products effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlay && products.length > limit && !loading) {
      interval = setInterval(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, products.length, totalPages, limit, loading]);

  // Initial fetch of products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load more products when the load more element is visible
  useEffect(() => {
    if (isLoadMoreVisible && hasMore && !loading && !loadingMore) {
      loadMoreProducts();
    }
  }, [isLoadMoreVisible, hasMore, loading, loadingMore, loadMoreProducts]);

  // Reset to first page when products change
  useEffect(() => {
    setCurrentPage(0);
  }, [products]);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchProducts} 
          className="mt-3"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className || ''}`}>
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title || (useRecommended ? "Sản phẩm đề xuất" : "Sản phẩm tương tự")}
        </h2>

        {/* Navigation controls for desktop */}
        {!loading && products.length > 0 && totalPages > 1 && (
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={currentPage === 0}
              onClick={prevPage}
              aria-label="Previous page"
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={currentPage >= totalPages - 1}
              onClick={nextPage}
              aria-label="Next page"
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: limit }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Không có sản phẩm đề xuất</p>
            <Link
              href="/products"
              className="text-primary hover:underline mt-3 inline-block"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
            >
              {displayedProducts.map((product) => (
                <MemoizedProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Mobile pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 md:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  disabled={currentPage === 0}
                  onClick={prevPage}
                  onMouseEnter={() => setAutoPlay(false)}
                  onMouseLeave={() => setAutoPlay(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  disabled={currentPage >= totalPages - 1}
                  onClick={nextPage}
                  onMouseEnter={() => setAutoPlay(false)}
                  onMouseLeave={() => setAutoPlay(true)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
        
        {/* Hidden element for intersection observer to trigger loading more products */}
        {hasMore && !loading && (
          <div ref={loadMoreRef} className="h-1 w-full my-2 flex justify-center">
            {loadingMore && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
        <Link
          href="/products"
          className="text-primary hover:text-primary-dark text-sm font-medium inline-flex items-center transition-colors"
        >
          Xem tất cả sản phẩm
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
