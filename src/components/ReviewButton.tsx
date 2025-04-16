import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewButton() {
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const submitReview = () => {
    // Handle submit logic here
    if (reviewText.trim().length <= 0) {
      return;
    } else if (rating <= 0) {
      return;
    }

    console.log("Review submitted:", { rating, reviewText });

    setShowReviewBox(false);
    setReviewText("");
    setRating(0);
  };

  return (
    <div className="mt-4">
      <button
        className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
        onClick={() => setShowReviewBox(!showReviewBox)}
      >
        Review Product
      </button>

      {showReviewBox && (
        <div className="mt-4 p-4 border rounded bg-white shadow-md w-full">
          <h3 className="text-lg font-semibold mb-2">Write a Review</h3>

          {/* Star rating */}
          <div className="flex space-x-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="text-yellow-500 hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  key={`star-${star}`}
                  size={14}
                  fill={star <= rating ? "currentColor" : "none"}
                  stroke="currentColor"
                />
              </button>
            ))}
          </div>

          {/* Textbox */}
          <textarea
            className="w-full p-2 border rounded resize-y min-h-10 max-h-96"
            rows={2}
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          {/* Submit review */}
          <button
            className="mt-3 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            onClick={submitReview}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
