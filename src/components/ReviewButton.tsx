import { useState } from "react";
import { Star } from "lucide-react"; // Optional: use any star icon, or emoji

export default function ReviewButton() {
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  return (
    <div className="mt-4">
      <button
        className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        onClick={() => setShowReviewBox(!showReviewBox)}
      >
        review
      </button>

      {showReviewBox && (
        <div className="mt-4 p-4 border rounded bg-white shadow-md w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Write a Review</h3>

          {/* Star rating */}
          <div className="flex space-x-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="text-yellow-500 hover:scale-110 transition-transform"
              >
                {star <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>

          {/* Textbox */}
          <textarea
            className="w-full p-2 border rounded resize-none"
            rows={4}
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          {/* Submit button (optional) */}
          <button
            className="mt-3 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              // Handle submit logic here
              console.log("Review submitted:", { rating, reviewText });
              setShowReviewBox(false);
              setReviewText("");
              setRating(0);
            }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
