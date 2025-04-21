"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ProductOrderWStats, Review } from "@/db/models";
import ReviewBar from "@/components/ReviewBar";
import { Star } from "lucide-react";

function OrderComponent({ order }: { order: ProductOrderWStats }) {
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const submitReview = async () => {
    if (rating <= 0) {
      return;
    }

    const body: Review = {
      order_id: order.order.order_id,
      rating: rating,
      review_desc: reviewText,
    };

    const response = await fetch("/api/add-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {
      return null;
    });

    if (!response) return;

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || "Unable to submit review");
      return;
    }

    alert("Successfully submitted review");
    window.location.reload();

    setShowReviewBox(false);
    setReviewText("");
    setRating(0);
  };

  return (
    <div className="border p-4 rounded shadow h-fit">
      <h2 className="text-xl font-semibold">{order.product.product_title}</h2>
      <p>{order.product.product_description}</p>
      <p className="text-sm text-gray-500">Price: ${order.order.payment}</p>
      <div className="flex flex-row gap-1 w-full">
        <p className="text-sm text-gray-500">
          Seller: {order.product.seller_email}
        </p>
        <ReviewBar
          rating={order.seller_stats.avg_rating}
          count={order.seller_stats.review_count}
        />
      </div>
      <p className="text-sm text-gray-500">Quantity: {order.order.quantity}</p>
      <p className="text-sm text-gray-500">{order.order.date}</p>
      {order.buyer_review !== null ? (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Rating: {order.buyer_review.rating}
          </p>
          <p className="text-sm text-gray-500">
            Review: {order.buyer_review.review_desc}
          </p>
        </div>
      ) : (
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
                    onClick={() => setRating(star)}
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
      )}
    </div>
  );
}

export default function BuyerDash() {
  const router = useRouter();

  const [orders, setOrders] = useState<ProductOrderWStats[]>([]); // Store orders

  useEffect(() => {
    // Fetch Order History
    const fetchOrders = async () => {
      const res = await fetch("/api/order-history");

      if (!res.ok) {
        setOrders([]);
        return;
      }

      const orders = (await res.json()).data as ProductOrderWStats[];
      console.log(orders);
      // orders.sort(
      //   (a, b) => new Date(b.order.date).getTime() - new Date(a.order.date).getTime(),
      // );
      setOrders(orders);
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col w-full justify-center items-center p-4">
      <h1 className="text-2xl font-bold mt-6">Buyer Dashboard</h1>

      {/* Navigation buttons */}
      <div className="flex flex-row w-full justify-center items-center mt-4 gap-4">
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          Shop Products
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          View Cart
        </button>
        <button
          onClick={() => router.push("/update-profile")}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-40 cursor-pointer"
        >
          Update Profile
        </button>
      </div>

      {/* Past Orders Display */}
      <h1 className="text-xl font-bold mt-6 w-full text-left border-b border-black pb-2">
        Past Orders
      </h1>
      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order, i) => (
          <OrderComponent order={order} key={i} />
        ))}
      </div>
    </div>
  );
}
