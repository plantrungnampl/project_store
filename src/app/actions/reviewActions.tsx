"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

/**
 * Get reviews for a product
 */
export async function getProductReviews(productId: string) {
  try {
    // Lấy session hiện tại
    const session = await validateRequest();
    const currentUserId = session?.user?.id;

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
      select: { id: true, slug: true },
    });

    if (!product) {
      return {
        success: false,
        error: "Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa",
      };
    }

    // Lấy tất cả reviews của sản phẩm
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true, // Chỉ lấy reviews đã được duyệt
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        helpfulMarks: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Thêm thông tin về số lượng đánh dấu hữu ích và trạng thái đánh dấu của người dùng hiện tại
    const enhancedReviews = reviews.map((review) => {
      const helpfulCount = review.helpfulMarks.length;
      const isMarkedHelpful = currentUserId
        ? review.helpfulMarks.some((mark) => mark.userId === currentUserId)
        : false;

      // Loại bỏ trường helpfulMarks để tránh gửi dữ liệu thừa về client
      const { helpfulMarks, ...reviewData } = review;

      return {
        ...reviewData,
        helpfulCount,
        isMarkedHelpful,
        canEdit: currentUserId === review.userId, // Thêm trường để kiểm tra quyền sửa
      };
    });

    // Tính toán phân phối rating
    const distribution = [0, 0, 0, 0, 0]; // 5 stars to 1 star

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[5 - review.rating]++;
      }
    });

    // Tính trung bình rating
    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            ).toFixed(1)
          )
        : 0;

    return {
      success: true,
      reviews: enhancedReviews,
      averageRating,
      totalReviews: reviews.length,
      distribution,
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi lấy đánh giá sản phẩm",
    };
  }
}

/**
 * Add a new review for a product
 */
export async function addProductReview(
  productId: string,
  data: {
    title: string;
    comment: string;
    rating: number;
  }
) {
  try {
    // Kiểm tra đầu vào
    if (
      !productId ||
      !data.title.trim() ||
      !data.comment.trim() ||
      data.rating < 1 ||
      data.rating > 5
    ) {
      return {
        success: false,
        error: "Dữ liệu đánh giá không hợp lệ",
      };
    }

    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để đánh giá sản phẩm",
      };
    }

    // Kiểm tra sản phẩm tồn tại không
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa",
      };
    }

    // Kiểm tra xem người dùng đã mua sản phẩm này chưa (để đánh dấu verified)
    const hasPurchasedProduct = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ["COMPLETED", "DELIVERED"] },
        },
      },
    });

    const isVerified = !!hasPurchasedProduct;

    // Luôn tạo đánh giá mới (không cập nhật cái cũ)
    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        title: data.title,
        comment: data.comment,
        rating: data.rating,
        isVerified, // Đánh dấu là verified nếu người dùng đã mua sản phẩm
        isApproved: true, // Auto-approve for simplicity
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      review: newReview,
      message: "Đã thêm đánh giá thành công",
    };
  } catch (error) {
    console.error("Error adding product review:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi thêm đánh giá sản phẩm",
    };
  }
}
/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  data: {
    title: string;
    comment: string;
    rating: number;
  }
) {
  try {
    // Kiểm tra đầu vào
    if (
      !reviewId ||
      !data.title.trim() ||
      !data.comment.trim() ||
      data.rating < 1 ||
      data.rating > 5
    ) {
      return {
        success: false,
        error: "Dữ liệu đánh giá không hợp lệ",
      };
    }

    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật đánh giá",
      };
    }

    // Kiểm tra đánh giá tồn tại và thuộc về người dùng hiện tại
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
      include: {
        product: {
          select: { slug: true },
        },
      },
    });

    if (!review) {
      return {
        success: false,
        error:
          "Không tìm thấy đánh giá hoặc bạn không có quyền sửa đánh giá này",
      };
    }

    // Cập nhật đánh giá
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        title: data.title,
        comment: data.comment,
        rating: data.rating,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/product/${review.product.slug}`);

    return {
      success: true,
      review: updatedReview,
      message: "Đã cập nhật đánh giá thành công",
    };
  } catch (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật đánh giá",
    };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xóa đánh giá",
      };
    }

    // Kiểm tra review tồn tại và thuộc về user hoặc là admin
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        OR: [
          { userId: session.user.id },
          { userId: session.user.id, user: { role: "ADMIN" } },
        ],
      },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!review) {
      return {
        success: false,
        error:
          "Không tìm thấy đánh giá hoặc bạn không có quyền xóa đánh giá này",
      };
    }

    // Xóa review
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    revalidatePath(`/products/${review.product.slug}`);

    return {
      success: true,
      message: "Đã xóa đánh giá thành công",
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi xóa đánh giá",
    };
  }
}

/**
 * Mark a review as helpful
 */
// export async function markReviewAsHelpful(reviewId: string) {
//   try {
//     const session = await validateRequest();

//     if (!session?.user?.id) {
//       return {
//         success: false,
//         error: "Bạn cần đăng nhập để đánh dấu đánh giá là hữu ích",
//       };
//     }

//     // Kiểm tra review tồn tại
//     const review = await prisma.review.findUnique({
//       where: { id: reviewId },
//       include: { product: { select: { slug: true } } },
//     });

//     if (!review) {
//       return {
//         success: false,
//         error: "Không tìm thấy đánh giá",
//       };
//     }

//     // Kiểm tra xem người dùng đã đánh dấu đánh giá này là hữu ích chưa
//     const existingMark = await prisma.reviewHelpful.findFirst({
//       where: {
//         reviewId,
//         userId: session.user.id,
//       },
//     });

//     // Nếu đã đánh dấu rồi, bỏ đánh dấu (toggle)
//     if (existingMark) {
//       await prisma.reviewHelpful.delete({
//         where: { id: existingMark.id },
//       });

//       revalidatePath(`/product/${review.product.slug}`);

//       return {
//         success: true,
//         message: "Đã bỏ đánh dấu đánh giá là hữu ích",
//         action: "removed",
//       };
//     }
//     // Nếu chưa đánh dấu, thêm mới
//     else {
//       await prisma.reviewHelpful.create({
//         data: {
//           reviewId,
//           userId: session.user.id,
//         },
//       });

//       revalidatePath(`/product/${review.product.slug}`);

//       return {
//         success: true,
//         message: "Đã đánh dấu đánh giá là hữu ích",
//         action: "added",
//       };
//     }
//   } catch (error) {
//     console.error("Error marking review as helpful:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi đánh dấu đánh giá",
//     };
//   }
// }
/**
 * Mark a review as helpful
 */
export async function markReviewAsHelpful(reviewId: string) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để đánh dấu đánh giá là hữu ích",
      };
    }

    // Kiểm tra review tồn tại
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { slug: true } },
        helpfulMarks: true,
      },
    });

    if (!review) {
      return {
        success: false,
        error: "Không tìm thấy đánh giá",
      };
    }

    // Kiểm tra xem người dùng đã đánh dấu đánh giá này là hữu ích chưa
    const existingMark = await prisma.reviewHelpful.findFirst({
      where: {
        reviewId,
        userId: session.user.id,
      },
    });

    let newHelpfulCount = review.helpfulMarks.length;
    let isMarkedHelpful = false;

    // Nếu đã đánh dấu rồi, bỏ đánh dấu (toggle)
    if (existingMark) {
      await prisma.reviewHelpful.delete({
        where: { id: existingMark.id },
      });

      newHelpfulCount -= 1;
      isMarkedHelpful = false;
    }
    // Nếu chưa đánh dấu, thêm mới
    else {
      await prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId: session.user.id,
        },
      });

      newHelpfulCount += 1;
      isMarkedHelpful = true;
    }

    revalidatePath(`/products/${review.product.slug}`);

    return {
      success: true,
      message: isMarkedHelpful
        ? "Đã đánh dấu đánh giá là hữu ích"
        : "Đã bỏ đánh dấu đánh giá là hữu ích",
      action: isMarkedHelpful ? "added" : "removed",
      helpfulCount: newHelpfulCount,
      isMarkedHelpful,
    };
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi đánh dấu đánh giá",
    };
  }
}
/**
 * Report a review
 */
export async function reportReview(reviewId: string, reason: string) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để báo cáo đánh giá",
      };
    }

    if (!reason || reason.trim() === "") {
      return {
        success: false,
        error: "Vui lòng cung cấp lý do báo cáo",
      };
    }

    // Kiểm tra review tồn tại
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { slug: true } } },
    });

    if (!review) {
      return {
        success: false,
        error: "Không tìm thấy đánh giá",
      };
    }

    // Kiểm tra xem người dùng đã báo cáo đánh giá này chưa
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId,
        userId: session.user.id,
      },
    });

    if (existingReport) {
      // Cập nhật báo cáo hiện có
      await prisma.reviewReport.update({
        where: { id: existingReport.id },
        data: {
          reason,
          status: "PENDING", // Đặt lại trạng thái thành PENDING
          updatedAt: new Date(),
        },
      });
    } else {
      // Tạo báo cáo mới
      await prisma.reviewReport.create({
        data: {
          reviewId,
          userId: session.user.id,
          reason,
          status: "PENDING",
        },
      });
    }

    revalidatePath(`/product/${review.product.slug}`);

    return {
      success: true,
      message: "Đã gửi báo cáo thành công",
    };
  } catch (error) {
    console.error("Error reporting review:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi báo cáo đánh giá",
    };
  }
}
