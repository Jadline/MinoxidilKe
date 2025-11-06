import { useState } from "react";
import { useForm } from "react-hook-form";

function Reviews({ productId, reviews = [], onAddReview }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  console.log(reviews)


  const onSubmit = async (data) => {
    try {
      await onAddReview({ ...data,product:productId });
      reset();
      setShowReviewForm(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Customer Reviews</h3>

      {reviews.length === 0 ? (
        <p className="mt-2 text-gray-500 italic">
          This product does not have reviews yet.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-3">
              <p className="font-semibold">
                {review.user?.firstName || "Anonymous User"}
              </p>
              <p className="text-sm text-gray-600">{review.comment}</p>
              <p className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        onClick={() => setShowReviewForm((prev) => !prev)}
      >
        {showReviewForm ? "Cancel" : "Add a Review"}
      </button>

      {showReviewForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <textarea
            placeholder="Write your review..."
            className="w-full border p-2 rounded-md"
            {...register("comment", { required: true })}
          />
          <input
            type="number"
            placeholder="Rating (1–5)"
            min="1"
            max="5"
            className="w-full border p-2 rounded-md"
            {...register("rating", { required: true })}
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}

export default Reviews;
