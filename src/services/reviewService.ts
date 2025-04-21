import db from "@/db/db";
import { Review } from "@/db/models";

export const getAverageSellerRating = async (seller_email: string) => {
  const averageRating = db
    .prepare(
      `SELECT AVG(R.rating) AS avg FROM Reviews R
      JOIN Orders O ON R.order_id = O.order_id
      WHERE seller_email = ?`,
    )
    .get(seller_email) as { avg: number };

  return averageRating.avg;
};

export const addReview = async (buyer_email: string, review: Review) => {
  const order = db
    .prepare("SELECT * FROM Orders WHERE buyer_email = ? AND order_id = ?")
    .get(buyer_email, review.order_id);

  if (!order) {
    throw new Error("Order not found");
  }

  const existingReview = db
    .prepare("SELECT * FROM Reviews WHERE order_id = ?")
    .get(review.order_id);

  if (existingReview) {
    throw new Error("Review already exists");
  }

  const result = db
    .prepare(
      `INSERT INTO Reviews (order_id, review_desc, rating) VALUES (?, ?, ?)`,
    )
    .run(review.order_id, review.review_desc, review.rating);

  return result.lastInsertRowid;
};
