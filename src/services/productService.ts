import db from "@/db/db";
import { Product_Listing } from "@/db/models";

export const listProduct = async (listingInfo: any) => {
  const listing_id = (
    db
      .prepare(
        "SELECT COALESCE(MAX(listing_id), 0) + 1 AS next_id FROM Product_Listings WHERE seller_email = ?",
      )
      .get(listingInfo.email) as { next_id: number }
  ).next_id;

  try {
    db.prepare(
      "INSERT INTO Product_Listings (seller_email, listing_id, category, product_title, product_name, product_description, quantity, product_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      listingInfo.email,
      listing_id,
      listingInfo.category,
      listingInfo.title,
      listingInfo.name,
      listingInfo.description,
      parseInt(listingInfo.quantity),
      parseInt(listingInfo.price),
      1,
    );
  } catch (err) {
    console.log("Database Error:", err.message);
  }
};
