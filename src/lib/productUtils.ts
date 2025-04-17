// /**
//  * Xử lý dữ liệu sản phẩm thành format chuẩn
//  */
// // export function processProducts(products: any[]) {
// //   return products.map((product) => {
// //     // Tìm ảnh mặc định hoặc lấy ảnh đầu tiên
// //     const defaultImage =
// //       product.images.find((img: any) => img.isThumbnail) || product.images[0];

// //     // Tính toán % giảm giá nếu có
// //     let discountPercentage = null;
// //     if (product.compareAtPrice && product.price < product.compareAtPrice) {
// //       discountPercentage = Math.round(
// //         ((product.compareAtPrice - product.price) / product.compareAtPrice) *
// //           100
// //       );
// //     }

// //     // Tính trung bình rating
// //     const avgRating =
// //       product.reviews?.length > 0
// //         ? product.reviews.reduce(
// //             (sum: number, review: any) => sum + review.rating,
// //             0
// //           ) / product.reviews.length
// //         : 0;

// //     // Kiểm tra xem sản phẩm có phải là mới không (30 ngày gần đây)
// //     const isNew = product.publishedAt
// //       ? (new Date().getTime() - new Date(product.publishedAt).getTime()) /
// //           (1000 * 3600 * 24) <=
// //         30
// //       : false;

// //     return {
// //       id: product.id,
// //       name: product.name,
// //       slug: product.slug,
// //       sku: product.sku,
// //       description: product.description,
// //       price: product.price,
// //       compareAtPrice: product.compareAtPrice,
// //       stockQuantity: product.stockQuantity,
// //       isActive: product.isActive,
// //       isFeatured: product.isFeatured,
// //       isDigital: product.isDigital,
// //       isNew,
// //       discountPercentage,
// //       avgRating,
// //       reviewCount: product.reviews?.length || 0,
// //       brandId: product.brandId,
// //       brandName: product.brand?.name || null,
// //       brandSlug: product.brand?.slug || null,
// //       categories:
// //         product.categories?.map((pc: any) => ({
// //           id: pc.category.id,
// //           name: pc.category.name,
// //           slug: pc.category.slug,
// //         })) || [],
// //       mainImage: defaultImage
// //         ? {
// //             id: defaultImage.id,
// //             url: defaultImage.url,
// //             alt: defaultImage.altText || product.name,
// //           }
// //         : null,
// //       images:
// //         product.images?.map((img: any) => ({
// //           id: img.id,
// //           url: img.url,
// //           alt: img.altText || product.name,
// //           isThumbnail: img.isThumbnail,
// //         })) || [],
// //       // Additional properties for variants if available
// //       variants: product.variants,
// //       attributes: product.attributes,
// //       // Include reviews if available
// //       reviews: product.reviews,
// //     };
// //   });
// // }

// /**
//  * Get variant by selected attributes
//  */
// export function getVariantByAttributes(
//   variants: any[],
//   selectedAttributes: Record<string, string>
// ) {
//   if (!variants || variants.length === 0) {
//     return null;
//   }

//   // Lọc các variants dựa trên các thuộc tính đã chọn
//   const matchingVariants = variants.filter((variant) => {
//     // Kiểm tra xem variant có khớp với tất cả các thuộc tính đã chọn không
//     const attributeIds = Object.keys(selectedAttributes);

//     for (const attributeId of attributeIds) {
//       const selectedValueId = selectedAttributes[attributeId];

//       // Kiểm tra xem variant có thuộc tính này với giá trị đã chọn không
//       const hasMatch = variant.attributes.some(
//         (attr: any) =>
//           attr.attributeValue.attribute.id === attributeId &&
//           attr.attributeValue.id === selectedValueId
//       );

//       if (!hasMatch) {
//         return false;
//       }
//     }

//     return true;
//   });

//   // Trả về variant đầu tiên khớp (nếu có)
//   return matchingVariants.length > 0 ? matchingVariants[0] : null;
// }

// /**
//  * Get available attribute combinations
//  */
// export function getAvailableAttributeCombinations(
//   variants: any[],
//   variantAttributes: any[]
// ) {
//   if (
//     !variants ||
//     variants.length === 0 ||
//     !variantAttributes ||
//     variantAttributes.length === 0
//   ) {
//     return {};
//   }

//   const availableCombinations: Record<string, Set<string>> = {};

//   // Khởi tạo sets cho mỗi attributeId
//   variantAttributes.forEach((attr) => {
//     availableCombinations[attr.id] = new Set();
//   });

//   // Duyệt qua tất cả variants active
//   variants.forEach((variant) => {
//     if (variant.isActive && variant.stockQuantity > 0) {
//       // Lấy tất cả attribute values từ variant này
//       const variantAttributeValues: Record<string, string> = {};

//       variant.attributes.forEach((attrVal: any) => {
//         const attributeId = attrVal.attributeValue.attribute.id;
//         const valueId = attrVal.attributeValue.id;
//         variantAttributeValues[attributeId] = valueId;
//       });

//       // Thêm tất cả combinations vào availableCombinations
//       Object.entries(variantAttributeValues).forEach(
//         ([attributeId, valueId]) => {
//           if (availableCombinations[attributeId]) {
//             availableCombinations[attributeId].add(valueId);
//           }
//         }
//       );
//     }
//   });

//   // Convert Sets to Arrays
//   const result: Record<string, string[]> = {};
//   Object.entries(availableCombinations).forEach(([attributeId, valueSet]) => {
//     result[attributeId] = Array.from(valueSet);
//   });

//   return result;
// }

// // Types
// export type ProductType = {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
//   sku?: string;
//   price: number;
//   compareAtPrice?: number | null;
//   stockQuantity: number;
//   isActive: boolean;
//   isFeatured: boolean;
//   isDigital: boolean;
//   isNew?: boolean;
//   isOnSale?: boolean;
//   discountPercentage?: number | null;
//   avgRating?: number;
//   reviewCount?: number;
//   brandName?: string | null;
//   brandSlug?: string | null;
//   categories?: { id?: string; name: string; slug: string }[];
//   mainImage?: { url: string; alt: string } | null;
//   images?: { url: string; alt: string }[];
//   attributeValues?: any[];
//   variants?: any[];
//   salesCount?: number;
//   relevanceScore?: number;
// };

// export type CategoryType = {
//   id: string;
//   name: string;
//   slug: string;
// };

// export type BrandType = {
//   id: string;
//   name: string;
//   slug: string;
// };

// // Helper Functions
// export function isNewProduct(publishedAt: Date | null) {
//   if (!publishedAt) return false;

//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   return new Date(publishedAt) >= thirtyDaysAgo;
// }

// export function calculateDiscountPercentage(
//   price: number | string,
//   compareAtPrice: number | string | null
// ) {
//   if (!compareAtPrice) return null;

//   const priceNum = parseFloat(price.toString());
//   const compareAtPriceNum = parseFloat(compareAtPrice.toString());

//   if (compareAtPriceNum <= priceNum) return null;

//   return Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100);
// }

// /**
//  * Xử lý và chuẩn hóa dữ liệu sản phẩm từ Prisma
//  */
// export function processProducts(products: any[]): ProductType[] {
//   return products.map((product) => {
//     // Tính đánh giá trung bình
//     const avgRating =
//       product.reviews && product.reviews.length > 0
//         ? product.reviews.reduce(
//             (sum: number, review: any) => sum + review.rating,
//             0
//           ) / product.reviews.length
//         : 0;

//     // Kiểm tra giảm giá
//     const discountPercentage = calculateDiscountPercentage(
//       product.price,
//       product.compareAtPrice
//     );

//     // Xử lý ảnh
//     const mainImage =
//       product.images && product.images.length > 0
//         ? {
//             url: product.images[0].url,
//             alt: product.images[0].altText || product.name,
//           }
//         : null;

//     const images = product.images
//       ? product.images.map((img: any) => ({
//           url: img.url,
//           alt: img.altText || product.name,
//         }))
//       : [];

//     // Xử lý danh mục
//     const categories = product.categories
//       ? product.categories.map((pc: any) => ({
//           id: pc.category?.id,
//           name: pc.category?.name,
//           slug: pc.category?.slug,
//         }))
//       : [];

//     // Kiểm tra sản phẩm mới
//     const isNew = isNewProduct(product.publishedAt);

//     // Kiểm tra sản phẩm đang giảm giá
//     const isOnSale =
//       product.compareAtPrice !== null &&
//       parseFloat(product.compareAtPrice.toString()) >
//         parseFloat(product.price.toString());

//     return {
//       id: product.id,
//       name: product.name,
//       slug: product.slug,
//       sku: product.sku,
//       description: product.description,
//       price: parseFloat(product.price.toString()),
//       compareAtPrice: product.compareAtPrice
//         ? parseFloat(product.compareAtPrice.toString())
//         : null,
//       stockQuantity: product.stockQuantity,
//       isActive: product.isActive,
//       isFeatured: product.isFeatured,
//       isDigital: product.isDigital,
//       isNew,
//       isOnSale,
//       discountPercentage,
//       avgRating,
//       reviewCount: product.reviews?.length || 0,
//       brandName: product.brand?.name || null,
//       brandSlug: product.brand?.slug || null,
//       categories,
//       mainImage,
//       images,
//       salesCount: product.orderItems?.length || 0,
//     };
//   });
// }

// /**
//  * Xử lý thuộc tính biến thể cho trang chi tiết sản phẩm
//  */
// export function processVariantAttributes(variants: any[], attributes: any[]) {
//   // Nhóm các thuộc tính biến thể
//   const variantAttributeMap = new Map();

//   // Lấy tất cả attribute types từ variants
//   variants.forEach((variant) => {
//     variant.attributes.forEach((attrVal: any) => {
//       const attribute = attrVal.attributeValue.attribute;
//       const attributeId = attribute.id;
//       const value = attrVal.attributeValue;

//       if (!variantAttributeMap.has(attributeId)) {
//         variantAttributeMap.set(attributeId, {
//           id: attributeId,
//           name: attribute.name,
//           displayName: attribute.displayName,
//           values: new Set(),
//         });
//       }

//       const attrGroup = variantAttributeMap.get(attributeId);
//       attrGroup.values.add(
//         JSON.stringify({
//           id: value.id,
//           value: value.value,
//           displayValue: value.displayValue,
//           colorCode: value.colorCode,
//           imageUrl: value.imageUrl,
//         })
//       );
//     });
//   });

//   // Convert to array and convert values from Set to Array
//   return Array.from(variantAttributeMap.values()).map((attr) => ({
//     ...attr,
//     values: Array.from(attr.values).map((v) => JSON.parse(v)),
//   }));
// }
import {
  isNewProduct,
  calculateDiscountPercentage,
  calculateAverageRating,
} from "./utils";

// Types
export type ProductType = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number | null;
  avgRating?: number;
  reviewCount?: number;
  brandName?: string | null;
  brandSlug?: string | null;
  categories?: { id?: string; name: string; slug: string }[];
  mainImage?: { url: string; alt: string } | null;
  images?: { url: string; alt: string }[];
  attributeValues?: any[];
  variants?: any[];
  salesCount?: number;
  relevanceScore?: number;
};

export type CategoryType = {
  id: string;
  name: string;
  slug: string;
};

export type BrandType = {
  id: string;
  name: string;
  slug: string;
};

export type ProductFilterOptions = {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const DEFAULT_SORT = "newest";
export const NEW_PRODUCT_DAYS = 30;

/**
 * Xử lý và chuẩn hóa dữ liệu sản phẩm từ Prisma
 */
export function processProducts(products: any[]): ProductType[] {
  return products.map((product) => {
    // Tính đánh giá trung bình
    const avgRating =
      product.reviews && product.reviews.length > 0
        ? calculateAverageRating(product.reviews)
        : 0;

    // Kiểm tra giảm giá
    const discountPercentage = calculateDiscountPercentage(
      product.price,
      product.compareAtPrice
    );

    // Xử lý ảnh
    const mainImage =
      product.images && product.images.length > 0
        ? {
            url: product.images[0].url,
            alt: product.images[0].altText || product.name,
          }
        : null;

    const images = product.images
      ? product.images.map((img: any) => ({
          url: img.url,
          alt: img.altText || product.name,
        }))
      : [];

    // Xử lý danh mục
    const categories = product.categories
      ? product.categories.map((pc: any) => ({
          id: pc.category?.id,
          name: pc.category?.name,
          slug: pc.category?.slug,
        }))
      : [];

    // Kiểm tra sản phẩm mới
    const isNew = isNewProduct(product.publishedAt);

    // Kiểm tra sản phẩm đang giảm giá
    const isOnSale =
      product.compareAtPrice !== null &&
      parseFloat(product.compareAtPrice.toString()) >
        parseFloat(product.price.toString());

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: parseFloat(product.price.toString()),
      compareAtPrice: product.compareAtPrice
        ? parseFloat(product.compareAtPrice.toString())
        : null,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isDigital: product.isDigital,
      isNew,
      isOnSale,
      discountPercentage,
      avgRating,
      reviewCount: product.reviews?.length || 0,
      brandName: product.brand?.name || null,
      brandSlug: product.brand?.slug || null,
      categories,
      mainImage,
      images,
      salesCount: product.orderItems?.length || 0,
    };
  });
}

/**
 * Xử lý thuộc tính biến thể cho trang chi tiết sản phẩm
 */
export function processVariantAttributes(variants: any[], attributes: any[]) {
  // Nhóm các thuộc tính biến thể
  const variantAttributeMap = new Map();

  // Lấy tất cả attribute types từ variants
  variants.forEach((variant) => {
    variant.attributes.forEach((attrVal: any) => {
      const attribute = attrVal.attributeValue.attribute;
      const attributeId = attribute.id;
      const value = attrVal.attributeValue;

      if (!variantAttributeMap.has(attributeId)) {
        variantAttributeMap.set(attributeId, {
          id: attributeId,
          name: attribute.name,
          displayName: attribute.displayName,
          values: new Set(),
        });
      }

      const attrGroup = variantAttributeMap.get(attributeId);
      attrGroup.values.add(
        JSON.stringify({
          id: value.id,
          value: value.value,
          displayValue: value.displayValue,
          colorCode: value.colorCode,
          imageUrl: value.imageUrl,
        })
      );
    });
  });

  // Convert to array and convert values from Set to Array
  return Array.from(variantAttributeMap.values()).map((attr) => ({
    ...attr,
    values: Array.from(attr.values).map((v) => JSON.parse(v)),
  }));
}

/**
 * Creates standardized product query includes for consistent data fetching
 */
export function getProductQueryIncludes(includeFullDetails = false) {
  const baseIncludes = {
    images: {
      orderBy: { sortOrder: "asc" },
      take: includeFullDetails ? undefined : 2,
    },
    brand: {
      select: {
        name: true,
        slug: true,
        id: includeFullDetails ? true : undefined,
      },
    },
    categories: {
      include: {
        category: {
          select: {
            name: true,
            slug: true,
            id: includeFullDetails ? true : undefined,
          },
        },
      },
    },
    reviews: {
      where: { isApproved: true },
      select: { rating: true },
    },
  };

  if (includeFullDetails) {
    return {
      ...baseIncludes,
      variants: {
        where: { isActive: true },
        include: {
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
          images: true,
        },
      },
      attributes: {
        include: {
          attribute: true,
          attributeValue: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    };
  }

  return baseIncludes;
}

/**
 * Creates sort configurations based on sort parameter
 */
export function getSortConfig(sort: string) {
  switch (sort) {
    case "newest":
      return { publishedAt: "desc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "popular":
      return [{ reviews: { _count: "desc" } }, { publishedAt: "desc" }];
    case "bestselling":
      return { orderItems: { _count: "desc" } };
    default:
      return { publishedAt: "desc" };
  }
}
// Thêm hàm này vào cuối file lib/productUtils.ts

/**
 * Tính toán các tổ hợp thuộc tính sản phẩm còn hàng
 * @param variants Danh sách các biến thể sản phẩm
 * @param attributes Danh sách các thuộc tính sản phẩm
 * @returns Map chứa các tổ hợp thuộc tính còn hàng
 */
export function getAvailableAttributeCombinations(
  variants: any[],
  attributes: any[]
): Map<string, Set<string>> {
  // Tạo Map để lưu trữ các tổ hợp thuộc tính còn trong kho
  const availableCombinations = new Map<string, Set<string>>();

  // Khởi tạo Map với tất cả các thuộc tính
  attributes.forEach((attribute) => {
    availableCombinations.set(attribute.id, new Set<string>());
  });

  // Chỉ xử lý các biến thể còn hàng (stockQuantity > 0)
  const inStockVariants = variants.filter(
    (variant) => variant.stockQuantity > 0 && variant.isActive
  );

  // Với mỗi biến thể còn hàng, tìm các tổ hợp thuộc tính
  inStockVariants.forEach((variant) => {
    if (!variant.attributes) return;

    // Duyệt qua các thuộc tính của biến thể
    variant.attributes.forEach((attrVal: any) => {
      if (!attrVal.attributeValue?.attribute) return;

      const attributeId = attrVal.attributeValue.attribute.id;
      const valueId = attrVal.attributeValue.id;

      // Thêm giá trị thuộc tính vào Set
      if (availableCombinations.has(attributeId)) {
        availableCombinations.get(attributeId)?.add(valueId);
      }
    });
  });

  return availableCombinations;
}

/**
 * Kiểm tra xem một tổ hợp thuộc tính có khả dụng (còn hàng) không
 * @param selectedAttributes Các thuộc tính đã chọn
 * @param variants Danh sách các biến thể sản phẩm
 * @returns true nếu tổ hợp thuộc tính còn hàng
 */
export function isAttributeCombinationAvailable(
  selectedAttributes: Record<string, string>,
  variants: any[]
): boolean {
  // Nếu không có thuộc tính nào được chọn, return true
  if (Object.keys(selectedAttributes).length === 0) {
    return true;
  }

  // Lọc các biến thể còn hàng
  const inStockVariants = variants.filter(
    (variant) => variant.stockQuantity > 0 && variant.isActive
  );

  // Tìm các biến thể phù hợp với các thuộc tính đã chọn
  const matchingVariants = inStockVariants.filter((variant) => {
    // Nếu không có thuộc tính, bỏ qua
    if (!variant.attributes) return false;

    // Kiểm tra từng thuộc tính đã chọn
    return Object.entries(selectedAttributes).every(
      ([attributeId, valueId]) => {
        // Tìm thuộc tính tương ứng trong biến thể
        return variant.attributes.some(
          (attrVal: any) =>
            attrVal.attributeValue?.attribute?.id === attributeId &&
            attrVal.attributeValue?.id === valueId
        );
      }
    );
  });

  return matchingVariants.length > 0;
}

/**
 * Tìm biến thể phù hợp với các thuộc tính đã chọn
 * @param selectedAttributes Các thuộc tính đã chọn
 * @param variants Danh sách các biến thể
 * @returns Biến thể phù hợp hoặc undefined
 */
export function findMatchingVariant(
  selectedAttributes: Record<string, string>,
  variants: any[]
): any | undefined {
  // Nếu không có thuộc tính nào được chọn, return undefined
  if (Object.keys(selectedAttributes).length === 0) {
    return undefined;
  }

  // Tìm biến thể phù hợp với tất cả các thuộc tính đã chọn
  return variants.find((variant) => {
    if (!variant.attributes) return false;

    // Tất cả các thuộc tính đã chọn phải khớp
    const allAttributesMatch = Object.entries(selectedAttributes).every(
      ([attributeId, valueId]) => {
        return variant.attributes.some(
          (attrVal: any) =>
            attrVal.attributeValue?.attribute?.id === attributeId &&
            attrVal.attributeValue?.id === valueId
        );
      }
    );

    // Số lượng thuộc tính phải giống nhau
    const attributeCountMatches =
      Object.keys(selectedAttributes).length === variant.attributes.length;

    return allAttributesMatch && attributeCountMatches;
  });
}
