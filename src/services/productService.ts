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

export const getProduct = async (sellerEmail: string, listingId: number) => {
  const product: Product_Listing = db
    .prepare(
      "SELECT * FROM Product_Listings WHERE seller_email = ? AND listing_id = ?",
    )
    .get(sellerEmail, listingId) as Product_Listing;

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const updateProduct = async (productInfo: any) => {
  const product: Product_Listing = {
    seller_email: productInfo.seller_email,
    listing_id: parseInt(productInfo.listing_id),
    category: productInfo.category,
    product_title: productInfo.product_title,
    product_name: productInfo.product_name,
    product_description: productInfo.product_description,
    quantity: parseInt(productInfo.quantity),
    product_price: parseFloat(productInfo.product_price),
    status: parseInt(productInfo.status),
  };

  if (product.quantity <= 0) {
    product.status = 2; // Out of stock/Sold
  } else if (product.status === 2) {
    product.status = 1; // Reset status to active if quantity > 0
  }

  // If the product is not active (status !== 1), remove it from the shopping cart
  if (product.status !== 1) {
    db.prepare(
      "DELETE FROM Shopping_Cart WHERE listing_seller_email = ? AND listing_id = ?",
    ).run(product.seller_email, product.listing_id);
  }

  db.prepare(
    "UPDATE Product_Listings SET category = ?, product_title = ?, product_name = ?, product_description = ?, quantity = ?, product_price = ?, status = ? WHERE seller_email = ? AND listing_id = ?",
  ).run(
    product.category,
    product.product_title,
    product.product_name,
    product.product_description,
    product.quantity,
    product.product_price,
    product.status,
    product.seller_email,
    product.listing_id,
  );
};

export const getProductsBySeller = async (sellerEmail: string) => {
  const products: Product_Listing[] = db
    .prepare("SELECT * FROM Product_Listings WHERE seller_email = ?")
    .all(sellerEmail) as Product_Listing[];

  return products;
};
