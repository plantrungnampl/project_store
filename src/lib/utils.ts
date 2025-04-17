import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Tiện ích dùng chung cho ứng dụng
 */

// Check if a product is new (within 30 days)
export function isNewProduct(
  publishedAt: Date | null,
  daysThreshold: number = 30
): boolean {
  if (!publishedAt) return false;

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysThreshold);

  return new Date(publishedAt) >= threshold;
}

// Calculate discount percentage
export function calculateDiscountPercentage(
  price: number | string,
  compareAtPrice: number | string | null
): number | null {
  if (!compareAtPrice) return null;

  const priceNum = parseFloat(price.toString());
  const compareAtPriceNum = parseFloat(compareAtPrice.toString());

  if (compareAtPriceNum <= priceNum) return null;

  return Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100);
}

// Format price to currency
export function formatPrice(price: number | string, currency = "VND"): string {
  const numPrice = parseFloat(price.toString());

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(numPrice);
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `ORD-${year}${month}${day}-${random}`;
}

// Calculate average rating
export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (!reviews.length) return 0;

  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}

// Create slug from string
export function createSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Handle API errors
export function handleApiError(
  error: unknown,
  defaultMessage: string
): {
  success: false;
  error: string;
} {
  console.error(defaultMessage, error);

  return {
    success: false,
    error: error instanceof Error ? error.message : defaultMessage,
  };
}

// Normalize price for calculations (convert to number)
export function normalizePrice(price: any): number {
  if (price === null || price === undefined) return 0;
  return parseFloat(price.toString());
}
