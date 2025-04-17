// "use server";

// import { revalidatePath } from "next/cache";
// import prisma from "@/lib/prisma";
// import { validateRequest } from "@/auth";

// /**
//  * Get user's wishlist
//  */
// export async function getUserWishlist() {
//   try {
//     const session = await validateRequest();

//     if (!session?.user?.id) {
//       return {
//         success: false,
//         error: "Bạn cần đăng nhập để xem danh sách yêu thích",
//       };
//     }

//     // Tìm hoặc tạo wishlist cho user
//     let wishlist = await prisma.wishlist.findUnique({
//       where: {
//         userId: session.user.id,
//       },
//       include: {
//         items: {
//           include: {
//             product: {
//               include: {
//                 images: {
//                   orderBy: {
//                     sortOrder: "asc",
//                   },
//                   take: 1,
//                 },
//                 brand: true,
//                 categories: {
//                   include: {
//                     category: true,
//                   },
//                 },
//                 reviews: {
//                   select: {
//                     rating: true,
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!wishlist) {
//       // Tạo wishlist mới nếu chưa có
//       wishlist = await prisma.wishlist.create({
//         data: {
//           userId: session.user.id,
//         },
//         include: {
//           items: {
//             include: {
//               product: {
//                 include: {
//                   images: {
//                     orderBy: {
//                       sortOrder: "asc",
//                     },
//                     take: 1,
//                   },
//                   brand: true,
//                   categories: {
//                     include: {
//                       category: true,
//                     },
//                   },
//                   reviews: {
//                     select: {
//                       rating: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
//     }

//     // Format response
//     return {
//       success: true,
//       wishlist: {
//         id: wishlist.id,
//         items: wishlist.items.map((item) => {
//           const product = item.product;
//           const mainImage = product.images[0];

//           // Tính trung bình rating
//           const avgRating =
//             product.reviews.length > 0
//               ? product.reviews.reduce(
//                   (sum, review) => sum + review.rating,
//                   0
//                 ) / product.reviews.length
//               : 0;

//           // Tính % giảm giá nếu có
//           let discountPercentage = null;
//           if (
//             product.compareAtPrice &&
//             product.price < product.compareAtPrice
//           ) {
//             discountPercentage = Math.round(
//               ((product.compareAtPrice - product.price) /
//                 product.compareAtPrice) *
//                 100
//             );
//           }

//           return {
//             id: item.id,
//             product: {
//               id: product.id,
//               name: product.name,
//               slug: product.slug,
//               price: product.price,
//               compareAtPrice: product.compareAtPrice,
//               stockQuantity: product.stockQuantity,
//               image: mainImage
//                 ? {
//                     url: mainImage.url,
//                     alt: mainImage.altText || product.name,
//                   }
//                 : null,
//               brand: product.brand?.name,
//               avgRating,
//               reviewCount: product.reviews.length,
//               discountPercentage,
//               categories: product.categories.map((pc) => ({
//                 name: pc.category.name,
//                 slug: pc.category.slug,
//               })),
//             },
//             addedAt: item.createdAt,
//           };
//         }),
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching wishlist:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi lấy danh sách yêu thích",
//     };
//   }
// }

// /**
//  * Add product to wishlist
//  */
// export async function addToWishlist(productId: string) {
//   try {
//     const session = await validateRequest();

//     if (!session?.user?.id) {
//       return {
//         success: false,
//         error: "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích",
//       };
//     }

//     // Kiểm tra sản phẩm tồn tại không
//     const product = await prisma.product.findUnique({
//       where: {
//         id: productId,
//         isActive: true,
//       },
//     });

//     if (!product) {
//       return {
//         success: false,
//         error: "Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa",
//       };
//     }

//     // Tìm hoặc tạo wishlist cho user
//     let wishlist = await prisma.wishlist.findUnique({
//       where: {
//         userId: session.user.id,
//       },
//     });

//     if (!wishlist) {
//       wishlist = await prisma.wishlist.create({
//         data: {
//           userId: session.user.id,
//         },
//       });
//     }

//     // Kiểm tra sản phẩm đã có trong wishlist chưa
//     const existingItem = await prisma.wishlistItem.findUnique({
//       where: {
//         wishlistId_productId: {
//           wishlistId: wishlist.id,
//           productId,
//         },
//       },
//     });

//     if (existingItem) {
//       return {
//         success: true,
//         message: "Sản phẩm đã có trong danh sách yêu thích",
//       };
//     }

//     // Thêm sản phẩm vào wishlist
//     await prisma.wishlistItem.create({
//       data: {
//         wishlistId: wishlist.id,
//         productId,
//       },
//     });

//     revalidatePath("/wishlist");
//     revalidatePath(`/products/${product.slug}`);

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error("Error adding to wishlist:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi thêm sản phẩm vào danh sách yêu thích",
//     };
//   }
// }

// /**
//  * Remove product from wishlist
//  */
// export async function removeFromWishlist(itemId: string) {
//   try {
//     const session = await validateRequest();

//     if (!session?.user?.id) {
//       return {
//         success: false,
//         error: "Bạn cần đăng nhập để xóa sản phẩm khỏi danh sách yêu thích",
//       };
//     }

//     // Kiểm tra item tồn tại và thuộc về user
//     const item = await prisma.wishlistItem.findFirst({
//       where: {
//         id: itemId,
//         wishlist: {
//           userId: session.user.id,
//         },
//       },
//       include: {
//         product: {
//           select: {
//             slug: true,
//           },
//         },
//       },
//     });

//     if (!item) {
//       return {
//         success: false,
//         error: "Không tìm thấy sản phẩm trong danh sách yêu thích",
//       };
//     }

//     // Xóa item
//     await prisma.wishlistItem.delete({
//       where: {
//         id: itemId,
//       },
//     });

//     revalidatePath("/wishlist");
//     revalidatePath(`/products/${item.product.slug}`);

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error("Error removing from wishlist:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi xóa sản phẩm khỏi danh sách yêu thích",
//     };
//   }
// }

// /**
//  * Check if product is in wishlist
//  */
// export async function isProductInWishlist(productId: string) {
//   try {
//     const session = await validateRequest();

//     if (!session?.user?.id) {
//       return {
//         success: true,
//         isInWishlist: false,
//       };
//     }

//     // Tìm wishlist của user
//     const wishlist = await prisma.wishlist.findUnique({
//       where: {
//         userId: session.user.id,
//       },
//     });

//     if (!wishlist) {
//       return {
//         success: true,
//         isInWishlist: false,
//       };
//     }

//     // Kiểm tra sản phẩm có trong wishlist không
//     const item = await prisma.wishlistItem.findUnique({
//       where: {
//         wishlistId_productId: {
//           wishlistId: wishlist.id,
//           productId,
//         },
//       },
//     });

//     return {
//       success: true,
//       isInWishlist: !!item,
//       itemId: item?.id,
//     };
//   } catch (error) {
//     console.error("Error checking wishlist:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra",
//     };
//   }
// }

// /**
//  * Clear entire wishlist
//  */
// export async function clearWishlist() {
//   try {
//     const session = await validateRequest();

//     if (!session?.user?.id) {
//       return {
//         success: false,
//         error: "Bạn cần đăng nhập để xóa danh sách yêu thích",
//       };
//     }

//     // Tìm wishlist của user
//     const wishlist = await prisma.wishlist.findUnique({
//       where: {
//         userId: session.user.id,
//       },
//     });

//     if (!wishlist) {
//       return {
//         success: true, // No wishlist to clear
//       };
//     }

//     // Xóa tất cả items
//     await prisma.wishlistItem.deleteMany({
//       where: {
//         wishlistId: wishlist.id,
//       },
//     });

//     revalidatePath("/wishlist");

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error("Error clearing wishlist:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi xóa danh sách yêu thích",
//     };
//   }
// }
"use server";

import getUserId from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Lấy danh sách Wishlist của người dùng hiện tại
 */
export async function getWishlist() {
  try {
    // Lấy ID người dùng hiện tại
    const userId = await getUserId();

    if (!userId) {
      return { items: [], itemCount: 0 };
    }

    // Kiểm tra xem người dùng đã có wishlist chưa
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: "asc" },
                },
                categories: {
                  include: {
                    category: true,
                  },
                },
                brand: true,
                reviews: {
                  select: {
                    rating: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Nếu chưa có wishlist, tạo mới
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          items: {},
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { sortOrder: "asc" },
                  },
                  categories: {
                    include: {
                      category: true,
                    },
                  },
                  brand: true,
                  reviews: {
                    select: {
                      rating: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Xử lý dữ liệu trả về
    const wishlistItems = wishlist.items.map((item) => {
      const product = item.product;
      const avgRating = product.reviews.length
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

      // Tính toán % giảm giá nếu có
      const discountPercentage = product.compareAtPrice
        ? Math.round(
            ((parseFloat(product.compareAtPrice.toString()) -
              parseFloat(product.price.toString())) /
              parseFloat(product.compareAtPrice.toString())) *
              100
          )
        : null;

      return {
        id: product.id,
        wishlistItemId: item.id,
        name: product.name,
        slug: product.slug,
        price: parseFloat(product.price.toString()),
        compareAtPrice: product.compareAtPrice
          ? parseFloat(product.compareAtPrice.toString())
          : null,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isDigital: product.isDigital,
        isNew: isNewProduct(product.publishedAt),
        discountPercentage,
        avgRating,
        reviewCount: product.reviews.length,
        brandName: product.brand?.name || null,
        brandSlug: product.brand?.slug || null,
        categories: product.categories.map((pc) => ({
          id: pc.category.id,
          name: pc.category.name,
          slug: pc.category.slug,
        })),
        mainImage: product.images[0]
          ? {
              url: product.images[0].url,
              alt: product.images[0].altText || product.name,
            }
          : null,
        addedAt: item.createdAt,
      };
    });

    return {
      items: wishlistItems,
      itemCount: wishlistItems.length,
    };
  } catch (error) {
    console.error("Lỗi khi lấy wishlist:", error);
    throw new Error("Không thể lấy danh sách yêu thích. Vui lòng thử lại sau.");
  }
}

/**
 * Kiểm tra một sản phẩm có trong wishlist không
 * @param productId ID sản phẩm cần kiểm tra
 */
export async function isInWishlist(productId: string) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return false;
    }

    // Tìm wishlist của người dùng
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          where: { productId },
        },
      },
    });

    return wishlist?.items.length ? true : false;
  } catch (error) {
    console.error("Lỗi khi kiểm tra wishlist:", error);
    return false;
  }
}

/**
 * Thêm sản phẩm vào wishlist
 * @param productId ID sản phẩm cần thêm vào wishlist
 */
export async function addToWishlist(productId: string) {
  try {
    const userId = await getUserId();

    if (!userId) {
      throw new Error(
        "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích"
      );
    }

    // Tìm hoặc tạo wishlist cho người dùng
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
        },
      });
    }

    // Kiểm tra xem sản phẩm đã có trong wishlist chưa
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (existingItem) {
      // Sản phẩm đã có trong wishlist
      return {
        success: true,
        message: "Sản phẩm đã có trong danh sách yêu thích",
      };
    }

    // Thêm sản phẩm vào wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    // Cập nhật lại cache
    revalidatePath("/wishlist");
    revalidatePath("/product/[slug]");

    return {
      success: true,
      message: "Đã thêm sản phẩm vào danh sách yêu thích",
    };
  } catch (error) {
    console.error("Lỗi khi thêm vào wishlist:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Không thể thêm vào danh sách yêu thích. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Xóa sản phẩm khỏi wishlist
 * @param productId ID sản phẩm cần xóa khỏi wishlist
 */
export async function removeFromWishlist(productId: string) {
  try {
    const userId = await getUserId();

    if (!userId) {
      throw new Error("Bạn cần đăng nhập để quản lý danh sách yêu thích");
    }

    // Tìm wishlist của người dùng
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      return {
        success: false,
        message: "Không tìm thấy danh sách yêu thích",
      };
    }

    // Xóa sản phẩm khỏi wishlist
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    // Cập nhật lại cache
    revalidatePath("/wishlist");
    revalidatePath("/product/[slug]");

    return {
      success: true,
      message: "Đã xóa sản phẩm khỏi danh sách yêu thích",
    };
  } catch (error) {
    console.error("Lỗi khi xóa khỏi wishlist:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Không thể xóa khỏi danh sách yêu thích. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Toggle sản phẩm trong wishlist
 * @param productId ID sản phẩm cần toggle
 */
export async function toggleWishlistItem(productId: string) {
  try {
    const isProductInWishlist = await isInWishlist(productId);

    if (isProductInWishlist) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  } catch (error) {
    console.error("Lỗi khi toggle wishlist item:", error);
    return {
      success: false,
      message: "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.",
    };
  }
}
/**
 * Xóa toàn bộ danh sách yêu thích của người dùng
 */
export async function clearWishlist() {
  try {
    const userId = await getUserId();

    if (!userId) {
      throw new Error("Bạn cần đăng nhập để quản lý danh sách yêu thích");
    }

    // Tìm wishlist của người dùng
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      return {
        success: false,
        message: "Không tìm thấy danh sách yêu thích",
      };
    }

    // Xóa tất cả sản phẩm trong wishlist
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
      },
    });

    // Cập nhật lại cache
    revalidatePath("/wishlist");

    return {
      success: true,
      message: "Đã xóa toàn bộ danh sách yêu thích",
    };
  } catch (error) {
    console.error("Lỗi khi xóa danh sách yêu thích:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Không thể xóa danh sách yêu thích. Vui lòng thử lại sau.",
    };
  }
}
// Hàm hỗ trợ
function isNewProduct(publishedAt: Date | null) {
  if (!publishedAt) return false;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return new Date(publishedAt) >= thirtyDaysAgo;
}
