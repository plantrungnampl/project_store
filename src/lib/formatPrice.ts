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
/**
 * Hàm định dạng ngày tháng với nhiều tùy chọn
 * @param date - Đối tượng Date cần định dạng
 * @param format - Chuỗi định dạng (mặc định: 'yyyy-MM-dd')
 * @param locale - Ngôn ngữ sử dụng cho định dạng (mặc định: 'vi-VN')
 * @returns Chuỗi ngày đã được định dạng
 */
export function formatDate(
  date: Date,
  format: string = "yyyy-MM-dd",
  locale: string = "vi-VN"
): string {
  // Xử lý ngày không hợp lệ
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Ngày không hợp lệ");
  }

  // Các thành phần ngày tháng
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Định dạng bằng Intl.DateTimeFormat nếu định dạng là 'locale'
  if (format === "locale") {
    return new Intl.DateTimeFormat(locale).format(date);
  }

  // Thay thế các chuỗi định dạng
  return format
    .replace(/yyyy/g, year.toString())
    .replace(/yy/g, year.toString().slice(-2))
    .replace(/MM/g, month.toString().padStart(2, "0"))
    .replace(/M/g, month.toString())
    .replace(/dd/g, day.toString().padStart(2, "0"))
    .replace(/d/g, day.toString())
    .replace(/HH/g, hours.toString().padStart(2, "0"))
    .replace(/H/g, hours.toString())
    .replace(/mm/g, minutes.toString().padStart(2, "0"))
    .replace(/m/g, minutes.toString())
    .replace(/ss/g, seconds.toString().padStart(2, "0"))
    .replace(/s/g, seconds.toString());
}
