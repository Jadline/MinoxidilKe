import { useState } from "react";
import { useForm } from "react-hook-form";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

function Reviews({ productId, reviews = [], onAddReview, currentUser }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : null;

  const userAlreadyReviewed =
    currentUser &&
    reviews.some((r) => r.user && String(r.user._id) === String(currentUser.id));

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { comment: "", rating: 0 },
  });
  const selectedRating = watch("rating");

  const onSubmit = async (data) => {
    const rating = Number(data.rating) || selectedRating;
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating (1–5 stars).");
      return;
    }
    setSubmitting(true);
    try {
      await onAddReview({ product: productId, rating, comment: (data.comment || "").trim() });
      reset({ comment: "", rating: 0 });
      setShowReviewForm(false);
      toast.success("Review submitted.");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to submit review.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Customer Reviews</h3>

      {averageRating != null && (
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={averageRating} size="md" />
          <span className="text-sm text-gray-600">
            {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="mt-2 text-gray-500 italic">This product does not have reviews yet.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  {review.user?.firstName || "Anonymous"}
                </p>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {userAlreadyReviewed ? (
        <p className="mt-4 text-sm text-gray-600 italic">You have already reviewed this product.</p>
      ) : currentUser ? (
        <>
          <button
            type="button"
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            onClick={() => setShowReviewForm((prev) => !prev)}
          >
            {showReviewForm ? "Cancel" : "Add a Review"}
          </button>

          {showReviewForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your rating</label>
                <div className="mt-1">
                  <StarRating
                    rating={selectedRating}
                    onChange={(value) => setValue("rating", value)}
                    size="lg"
                  />
                </div>
              </div>
              <textarea
                placeholder="Write your review..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={4}
                {...register("comment", { required: "Comment is required." })}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-gray-500">Log in to leave a review.</p>
      )}
    </div>
  );
}

export default Reviews;
