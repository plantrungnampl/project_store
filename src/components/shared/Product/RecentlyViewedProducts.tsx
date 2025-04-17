'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ProductCardSkeleton } from '@/components/shared/Skeleton/ProductCardSkeleton';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  discountedPrice?: number;
  category?: {
    name: string;
  };
}

interface RecentlyViewedProductsProps {
  currentProductId?: string;
}

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_PRODUCTS = 4;

export default function RecentlyViewedProducts({ currentProductId }: RecentlyViewedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get recently viewed products from localStorage
    const getRecentlyViewedProducts = () => {
      if (typeof window === 'undefined') return [];
      
      try {
        const storedProducts = localStorage.getItem(STORAGE_KEY);
        return storedProducts ? JSON.parse(storedProducts) : [];
      } catch (error) {
        console.error('Failed to parse recently viewed products:', error);
        return [];
      }
    };

    const recentlyViewed = getRecentlyViewedProducts();
    
    // Filter out the current product if provided
    const filteredProducts = currentProductId 
      ? recentlyViewed.filter((p: Product) => p.id !== currentProductId)
      : recentlyViewed;
    
    setProducts(filteredProducts);
    setLoading(false);
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Bạn chưa xem sản phẩm nào gần đây.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.slice(0, MAX_PRODUCTS).map((product) => (
        <Link 
          href={`/product/${product.slug}`} 
          key={product.id}
          className="group rounded-lg overflow-hidden border bg-card text-card-foreground shadow hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-square overflow-hidden bg-white">
            <Image
              src={product.images[0] || '/placeholder-product.png'}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium line-clamp-2 text-sm mb-1">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">
                {formatPrice(product.discountedPrice || product.price)}
              </span>
              {product.discountedPrice && (
                <span className="text-xs line-through text-muted-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.category && (
              <div className="mt-1 text-xs text-muted-foreground">
                {product.category.name}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
