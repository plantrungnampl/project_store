/**
 * Format price with currency
 *
 * @param price - Price to format
 * @param currency - Currency code (default: VND)
 * @param locale - Locale for formatting (default: vi-VN)
 * @returns Formatted price string
 */
export function formatPrice(
  price: number | string,
  currency: string = "VND",
  locale: string = "vi-VN"
): string {
  // Convert string price to number if needed
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // Format the price
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // For VND, we typically don't show decimal places
    minimumFractionDigits: currency === "VND" ? 0 : 2,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(numericPrice);
}

/**
 * Format discount percentage
 *
 * @param original - Original price
 * @param current - Current/discounted price
 * @returns Discount percentage string (e.g. "20%")
 */
export function formatDiscount(original: number, current: number): string {
  if (original <= current) return "";

  const discount = Math.round(((original - current) / original) * 100);
  return `${discount}%`;
}
