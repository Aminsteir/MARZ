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

  const productListing: Product_Listing = {
    seller_email: listingInfo.email,
    listing_id,
    category: listingInfo.category,
    product_title: listingInfo.title,
    product_name: listingInfo.name,
    product_description: listingInfo.description,
    quantity: parseInt(listingInfo.quantity),
    product_price: parseFloat(listingInfo.price),
    status: 1,
  };

  try {
    db.prepare(
      "INSERT INTO Product_Listings (seller_email, listing_id, category, product_title, product_name, product_description, quantity, product_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      productListing.seller_email,
      productListing.listing_id,
      productListing.category,
      productListing.product_title,
      productListing.product_name,
      productListing.product_description,
      productListing.quantity,
      productListing.product_price,
      productListing.status,
    );
  } catch (err) {
    console.log("Database Error:", err.message);
  }
};
