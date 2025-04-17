"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isThumbnail?: boolean;
}

interface ProductImagesProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImages({
  images,
  productName,
}: ProductImagesProps) {
  const [activeImage, setActiveImage] = useState(
    images.find((img) => img.isThumbnail) || images[0] || null
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Nếu không có ảnh
  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Không có hình ảnh</p>
      </div>
    );
  }

  // Xử lý zoom ảnh
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    setZoomPosition({ x, y });
  };

  const handleImageMouseLeave = () => {
    setIsZoomed(false);
  };

  // Chuyển đổi ảnh
  const handlePrevImage = () => {
    const currentIndex = images.findIndex((img) => img.id === activeImage?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setActiveImage(images[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = images.findIndex((img) => img.id === activeImage?.id);
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setActiveImage(images[nextIndex]);
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleImageMouseMove}
        onMouseLeave={handleImageMouseLeave}
      >
        {activeImage && (
          <div className="relative w-full h-full">
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              className={`object-contain transition-transform duration-300 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x * 100}% ${
                        zoomPosition.y * 100
                      }%`,
                    }
                  : undefined
              }
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        )}

        {/* Zoom icon */}
        <div className="absolute top-3 right-3">
          <div className="p-2 bg-white/80 rounded-full">
            <ZoomIn className="h-5 w-5 text-gray-800" />
          </div>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white/90 shadow"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white/90 shadow"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image) => (
            <button
              key={image.id}
              className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden ${
                activeImage?.id === image.id
                  ? "ring-2 ring-primary ring-offset-2"
                  : "ring-1 ring-gray-200"
              }`}
              onClick={() => setActiveImage(image)}
            >
              <Image
                src={image.url}
                alt={image.alt || productName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
