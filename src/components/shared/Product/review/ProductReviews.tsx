"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  ThumbsUp,
  Flag,
  Plus,
  Loader2,
  Check,
  AlertTriangle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  addProductReview,
  getProductReviews,
  markReviewAsHelpful,
  reportReview,
  deleteReview,
  updateReview,
} from "@/app/actions/reviewActions";

// Định nghĩa các interface
interface User {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: User;
  helpfulCount: number; // Số lượng người đánh dấu hữu ích
  isMarkedHelpful: boolean; // Người dùng hiện tại đã đánh dấu chưa
  canEdit: boolean; // Người dùng có thể sửa đánh giá này không
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: number[];
}

interface ReviewsData {
  success: boolean;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  distribution?: number[];
  error?: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: [0, 0, 0, 0, 0],
  });

  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    title: "",
    comment: "",
    rating: 5,
  });
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Session state - sẽ được populated bởi fetchUserSession
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const router = useRouter();

  // Fetch session độc lập
  const fetchUserSession = async () => {
    try {
      // Gọi API endpoint để lấy session
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setSessionLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    if (!loading) setLoading(true);
    setError("");

    try {
      const result = await getProductReviews(productId);

      if (result.success) {
        setReviews(result.reviews || []);
        setStats({
          averageRating: result.averageRating || 0,
          totalReviews: result.totalReviews || 0,
          distribution: result.distribution || [0, 0, 0, 0, 0],
        });
      } else {
        setError(result.error || "Không thể tải đánh giá sản phẩm");
      }
    } catch (error) {
      setError("Đã có lỗi xảy ra khi tải đánh giá sản phẩm");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    fetchUserSession();
    fetchReviews();
    // Không thêm fetchReviews vào dependency array để tránh infinite loop
  }, [productId]);

  // Form validation
  const validateForm = () => {
    if (!reviewForm.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề đánh giá");
      return false;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return false;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Vui lòng chọn xếp hạng từ 1 đến 5 sao");
      return false;
    }

    return true;
  };

  // Handle rating change
  const handleRatingChange = (value: number) => {
    setReviewForm((prev) => ({ ...prev, rating: value }));
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission (add new review)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Đăng nhập để đánh giá", {
        description: "Bạn cần đăng nhập để gửi đánh giá sản phẩm",
      });

      // Redirect to login
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addProductReview(productId, {
        title: reviewForm.title,
        comment: reviewForm.comment,
        rating: reviewForm.rating,
      });

      if (result.success) {
        toast.success(result.message || "Đánh giá thành công", {
          description: "Cảm ơn bạn đã đánh giá sản phẩm",
        });

        // Reset form
        setReviewForm({
          title: "",
          comment: "",
          rating: 5,
        });

        // Close dialog
        setIsAddReviewOpen(false);

        // Refresh reviews
        fetchReviews();
      } else {
        toast.error("Không thể gửi đánh giá", {
          description: result.error || "Đã có lỗi xảy ra khi gửi đánh giá",
        });
      }
    } catch (error) {
      toast.error("Lỗi", {
        description: "Đã có lỗi xảy ra khi gửi đánh giá",
      });
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening edit review dialog
  const handleOpenEditDialog = (review: Review) => {
    setEditReviewId(review.id);
    setReviewForm({
      title: review.title || "",
      comment: review.comment || "",
      rating: review.rating,
    });
    setIsEditReviewOpen(true);
  };

  // Handle form submission (edit review)
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editReviewId) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateReview(editReviewId, {
        title: reviewForm.title,
        comment: reviewForm.comment,
        rating: reviewForm.rating,
      });

      if (result.success) {
        toast.success(result.message || "Cập nhật thành công", {
          description: "Đánh giá của bạn đã được cập nhật",
        });

        // Reset form
        setReviewForm({
          title: "",
          comment: "",
          rating: 5,
        });
        setEditReviewId(null);

        // Close dialog
        setIsEditReviewOpen(false);

        // Refresh reviews
        fetchReviews();
      } else {
        toast.error("Không thể cập nhật đánh giá", {
          description: result.error || "Đã có lỗi xảy ra khi cập nhật đánh giá",
        });
      }
    } catch (error) {
      toast.error("Lỗi", {
        description: "Đã có lỗi xảy ra khi cập nhật đánh giá",
      });
      console.error("Error updating review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const result = await deleteReview(reviewToDelete);

      if (result.success) {
        toast.success(result.message || "Đã xóa đánh giá");
        fetchReviews();
      } else {
        toast.error(result.error || "Không thể xóa đánh giá");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Đã có lỗi xảy ra khi xóa đánh giá");
    } finally {
      setDeleteConfirmOpen(false);
      setReviewToDelete(null);
    }
  };

  // Handle helpful vote with optimistic update
  const handleHelpfulVote = async (reviewId: string) => {
    if (!session?.user) {
      toast.error("Đăng nhập để tiếp tục", {
        description: "Bạn cần đăng nhập để đánh dấu đánh giá là hữu ích",
      });
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }

    try {
      // Tìm đánh giá hiện tại
      const reviewIndex = reviews.findIndex((review) => review.id === reviewId);
      if (reviewIndex === -1) return;

      const currentReview = reviews[reviewIndex];

      // Cập nhật ngay lập tức để UI phản hồi nhanh (optimistic update)
      const updatedReviews = [...reviews];
      updatedReviews[reviewIndex] = {
        ...currentReview,
        helpfulCount: currentReview.isMarkedHelpful
          ? currentReview.helpfulCount - 1
          : currentReview.helpfulCount + 1,
        isMarkedHelpful: !currentReview.isMarkedHelpful,
      };

      setReviews(updatedReviews);

      // Gọi API
      const result = await markReviewAsHelpful(reviewId);

      if (!result.success) {
        // Nếu thất bại, hoàn tác cập nhật
        setReviews(reviews);
        toast.error("Không thể đánh dấu đánh giá", {
          description: result.error || "Đã có lỗi xảy ra",
        });
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      // Hoàn tác cập nhật nếu có lỗi
      fetchReviews();
      toast.error("Lỗi", {
        description: "Đã có lỗi xảy ra",
      });
    }
  };

  // Handle opening report dialog
  const handleOpenReportDialog = (reviewId: string) => {
    if (!session?.user) {
      toast.error("Đăng nhập để tiếp tục", {
        description: "Bạn cần đăng nhập để báo cáo đánh giá",
      });
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }

    setReportingReviewId(reviewId);
    setReportReason("");
    setReportDialogOpen(true);
  };

  // Handle report review submission
  const handleSubmitReport = async () => {
    if (!reportingReviewId || !reportReason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo");
      return;
    }

    try {
      const result = await reportReview(reportingReviewId, reportReason);

      if (result.success) {
        toast.success(result.message || "Đã nhận báo cáo", {
          description: "Chúng tôi sẽ xem xét báo cáo của bạn",
        });
        setReportDialogOpen(false);
      } else {
        toast.error("Không thể gửi báo cáo", {
          description: result.error || "Đã có lỗi xảy ra",
        });
      }
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error("Lỗi", {
        description: "Đã có lỗi xảy ra khi gửi báo cáo",
      });
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate percentage for rating distribution
  const calculatePercentage = (count: number) => {
    return stats.totalReviews > 0
      ? Math.round((count / stats.totalReviews) * 100)
      : 0;
  };

  // Check if the current user owns a review
  const isOwnReview = (review: Review) => {
    return session?.user?.id === review.userId;
  };

  // Check if the current user is an admin
  const isAdmin = () => {
    return session?.user?.role === "ADMIN";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Đang tải đánh giá...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchReviews}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-medium">Đánh giá sản phẩm</h3>

      {/* Rating summary */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 bg-gray-50 p-6 rounded-lg">
        {/* Average rating */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex mb-2">
            {renderStars(Math.round(stats.averageRating))}
          </div>
          <p className="text-sm text-gray-600">
            Dựa trên {stats.totalReviews} đánh giá
          </p>
        </div>

        {/* Rating distribution */}
        <div className="flex-1">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-6 text-sm text-gray-600">{star} sao</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{
                      width: `${calculatePercentage(
                        stats.distribution[5 - star]
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="w-10 text-sm text-gray-600 text-right">
                  {stats.distribution[5 - star]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add review button */}
        <div className="flex flex-col items-center justify-center">
          <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Viết đánh giá
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Đánh giá sản phẩm</DialogTitle>
                <DialogDescription>
                  Chia sẻ trải nghiệm của bạn với sản phẩm này
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitReview} className="space-y-6 py-4">
                {/* Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating">Xếp hạng</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-all"
                        onClick={() => handleRatingChange(star)}
                        aria-label={`Đánh giá ${star} sao`}
                      >
                        <Star
                          className={`h-6 w-6 transition-all ${
                            star <= reviewForm.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-gray-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề đánh giá</Label>
                  <Input
                    id="title"
                    name="title"
                    value={reviewForm.title}
                    onChange={handleInputChange}
                    placeholder="Tóm tắt đánh giá của bạn"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Nội dung đánh giá</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleInputChange}
                    placeholder="Chia sẻ chi tiết về trải nghiệm của bạn"
                    rows={5}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {reviewForm.comment.length}/1000
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddReviewOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi đánh giá"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={isEditReviewOpen} onOpenChange={setIsEditReviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sửa đánh giá</DialogTitle>
            <DialogDescription>
              Cập nhật đánh giá của bạn về sản phẩm này
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateReview} className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="edit-rating">Xếp hạng</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-all"
                    onClick={() => handleRatingChange(star)}
                    aria-label={`Đánh giá ${star} sao`}
                  >
                    <Star
                      className={`h-6 w-6 transition-all ${
                        star <= reviewForm.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Tiêu đề đánh giá</Label>
              <Input
                id="edit-title"
                name="title"
                value={reviewForm.title}
                onChange={handleInputChange}
                placeholder="Tóm tắt đánh giá của bạn"
                maxLength={100}
                required
              />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="edit-comment">Nội dung đánh giá</Label>
              <Textarea
                id="edit-comment"
                name="comment"
                value={reviewForm.comment}
                onChange={handleInputChange}
                placeholder="Chia sẻ chi tiết về trải nghiệm của bạn"
                rows={5}
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 text-right">
                {reviewForm.comment.length}/1000
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditReviewOpen(false);
                  setEditReviewId(null);
                  setReviewForm({
                    title: "",
                    comment: "",
                    rating: 5,
                  });
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật đánh giá"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review list */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-medium mb-4">
          Tất cả đánh giá ({stats.totalReviews})
        </h4>

        {reviews.length > 0 ? (
          <div className="space-y-6 divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* User avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {review.user?.avatarUrl ? (
                        <Image
                          src={review.user.avatarUrl}
                          alt={`${review.user.firstName || ""} ${
                            review.user.lastName || ""
                          }`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                          {review.user?.firstName?.[0] ||
                            review.user?.lastName?.[0] ||
                            "?"}
                        </div>
                      )}
                    </div>

                    {/* User name and date */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {review.user
                            ? `${review.user.firstName || ""} ${
                                review.user.lastName || ""
                              }`.trim()
                            : "Khách hàng ẩn danh"}
                        </p>

                        {review.isVerified && (
                          <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3 mr-1" />
                            Đã mua hàng
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>

                {/* Review content */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h4>
                  <p className="text-gray-600 whitespace-pre-line">
                    {review.comment}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-4">
                  {/* Button hữu ích */}
                  <button
                    className={`flex items-center gap-1 text-sm ${
                      review.isMarkedHelpful
                        ? "text-blue-600 font-medium"
                        : "text-gray-500 hover:text-gray-900"
                    } transition-colors`}
                    onClick={() => handleHelpfulVote(review.id)}
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${
                        review.isMarkedHelpful ? "fill-blue-600" : ""
                      }`}
                    />
                    <span>
                      Hữu ích{" "}
                      {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                    </span>
                  </button>

                  <button
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => handleOpenReportDialog(review.id)}
                  >
                    <Flag className="h-4 w-4" />
                    <span>Báo cáo</span>
                  </button>

                  {/* Edit button - only visible for own reviews */}
                  {review.canEdit && (
                    <button
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={() => handleOpenEditDialog(review)}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Sửa đánh giá</span>
                    </button>
                  )}

                  {/* Delete button - only visible for own reviews or admin */}
                  {(isOwnReview(review) || isAdmin()) && (
                    <button
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors ml-auto"
                      onClick={() => {
                        setReviewToDelete(review.id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Xóa đánh giá</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              Chưa có đánh giá nào cho sản phẩm này
            </p>
            <Button onClick={() => setIsAddReviewOpen(true)}>
              Viết đánh giá đầu tiên
            </Button>
          </div>
        )}
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Báo cáo đánh giá</DialogTitle>
            <DialogDescription>
              Vui lòng cho chúng tôi biết lý do bạn báo cáo đánh giá này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportReason">Lý do báo cáo</Label>
              <Textarea
                id="reportReason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Nhập lý do báo cáo đánh giá này"
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitReport}>Gửi báo cáo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview}>
              Xóa đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
