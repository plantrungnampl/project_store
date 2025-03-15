"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const bannerData = [
  {
    id: 1,
    title: "Summer Collection 2025",
    subtitle: "Discover the latest trends and styles",
    description: "Up to 40% off on selected items. Limited time offer.",
    cta: "Shop Now",
    ctaLink: "/collections/summer",
    image: "/api/placeholder/1200/600",
    color: "bg-blue-50",
    textColor: "text-blue-950",
    position: "left", // image position
  },
  {
    id: 2,
    title: "Exclusive Designer Pieces",
    subtitle: "Elevate your wardrobe",
    description: "Discover our premium selection curated by top designers.",
    cta: "View Collection",
    ctaLink: "/collections/designer",
    image: "/api/placeholder/1200/600",
    color: "bg-amber-50",
    textColor: "text-amber-950",
    position: "right",
  },
  {
    id: 3,
    title: "New Season Accessories",
    subtitle: "Complete your look",
    description: "The perfect finishing touches for every outfit.",
    cta: "Explore Now",
    ctaLink: "/collections/accessories",
    image: "/api/placeholder/1200/600",
    color: "bg-emerald-50",
    textColor: "text-emerald-950",
    position: "left",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnimating) {
        handleSlideChange((currentSlide + 1) % bannerData.length);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [currentSlide, isAnimating]);

  const handleSlideChange = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    // Reset animation state after transition completes
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    const index = currentSlide === 0 ? bannerData.length - 1 : currentSlide - 1;
    handleSlideChange(index);
  };

  const handleNext = () => {
    const index = (currentSlide + 1) % bannerData.length;
    handleSlideChange(index);
  };

  const handleTouchStart = (e: React.TouchEvent): void => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      handleNext();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      handlePrev();
    }
  };

  const currentBanner = bannerData[currentSlide];

  return (
    <div
      className="relative overflow-hidden w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel container */}
      <div
        className={cn(
          "relative w-full transition-all duration-500 ease-in-out",
          currentBanner.color
        )}
        style={{ minHeight: "500px" }}
      >
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Content side */}
            <div
              className={cn(
                "order-2",
                currentBanner.position === "right" ? "md:order-1" : "md:order-2"
              )}
            >
              <div className="max-w-xl mx-auto md:mx-0 text-center md:text-left">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm md:text-base font-medium uppercase tracking-wide">
                      {currentBanner.subtitle}
                    </h3>
                    <h2
                      className={cn(
                        "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
                        currentBanner.textColor
                      )}
                    >
                      {currentBanner.title}
                    </h2>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                    {currentBanner.description}
                  </p>
                  <div className="pt-2">
                    <Link href={currentBanner.ctaLink}>
                      <Button size="lg" className="rounded-full px-8">
                        {currentBanner.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Image side */}
            <div
              className={cn(
                "order-1",
                currentBanner.position === "right" ? "md:order-2" : "md:order-1"
              )}
            >
              <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
                <Image
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200 z-10"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {bannerData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Export a Hero Banner with promotional message
export function PromoBanner() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Special Offer | Limited Time Only
            </h2>
            <p className="text-primary-foreground/80 max-w-md">
              Get an extra 15% off your first order when you sign up for our
              newsletter.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button variant="secondary" className="rounded-full font-medium">
                Subscribe
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative h-[250px] rounded-xl overflow-hidden">
              <Image
                src="/api/placeholder/800/500"
                alt="Special Promotion"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white text-black font-bold text-xl p-4 rounded-full transform rotate-12">
                  15% OFF
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a Category Banner Grid
export function CategoryBanners() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Women's Collection",
            image: "/api/placeholder/600/800",
            link: "/category/women",
          },
          {
            title: "Men's Collection",
            image: "/api/placeholder/600/800",
            link: "/category/men",
          },
          {
            title: "Accessories",
            image: "/api/placeholder/600/800",
            link: "/category/accessories",
          },
        ].map((category, index) => (
          <Link key={index} href={category.link}>
            <div className="group relative h-[350px] overflow-hidden rounded-xl">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 w-full">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.title}
                  </h3>
                  <span className="inline-flex items-center text-sm text-white font-medium group-hover:underline">
                    Shop Now <ChevronRight size={16} className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
