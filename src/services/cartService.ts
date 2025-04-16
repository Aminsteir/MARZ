import db from "@/db/db";
import { CartItem, CartItemRaw, Product_Listing } from "@/db/models";

export const emptyCart = async (buyer_email: string) => {
  db.prepare("DELETE FROM Shopping_Cart WHERE buyer_email = ?").run(
    buyer_email,
  );
};

export const removeFromCart = async (
  buyer_email: string,
  product_listing: Product_Listing,
) => {
  db.prepare(
    "DELETE FROM Shopping_Cart WHERE buyer_email = ? AND listing_seller_email = ? AND listing_id = ?",
  ).run(buyer_email, product_listing.seller_email, product_listing.listing_id);
};

// Query db for all products in the cart (using "IN" and nested query)
// This is more efficient than querying for each product individually
export const getCart = async (email: string): Promise<CartItem[]> => {
  interface result {
    seller_email: string;
    listing_id: number;
    category: string;
    product_title: string;
    product_name: string;
    product_description: string;
    quantity: number;
    product_price: number;
    status: number;

    cartQuantity: number;
  }

  const cartItems: result[] = db
    .prepare(
      `SELECT pl.*, sc.quantity AS cartQuantity FROM Product_Listings pl
      JOIN Shopping_Cart sc ON pl.seller_email = sc.listing_seller_email AND pl.listing_id = sc.listing_id
      WHERE sc.buyer_email = ?`,
    )
    .all(email) as result[];

  // Map the results to the CartItem type
  const cart: CartItem[] = cartItems.map((item) => ({
    product: {
      seller_email: item.seller_email,
      listing_id: item.listing_id,
      category: item.category,
      product_title: item.product_title,
      product_name: item.product_name,
      product_description: item.product_description,
      quantity: item.quantity,
      product_price: item.product_price,
      status: item.status,
    },
    quantity: item.cartQuantity,
  }));

  return cart;
};

export const updateCart = async (
  buyer_email: string,
  seller_email: string,
  listing_id: number,
  newQuantity: number,
) => {
  const cartItem: CartItemRaw = db
    .prepare(
      "SELECT * FROM Shopping_Cart WHERE buyer_email = ? AND listing_seller_email = ? AND listing_id = ?",
    )
    .get(buyer_email, seller_email, listing_id) as CartItemRaw;

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  const product: Product_Listing = db
    .prepare(
      "SELECT * FROM Product_Listings WHERE seller_email = ? AND listing_id = ?",
    )
    .get(seller_email, listing_id) as Product_Listing;

  if (!product) {
    throw new Error("Product not found");
  }

  if (newQuantity > product.quantity) {
    throw new Error("Quantity exceeds available stock");
  }

  if (newQuantity <= 0) {
    await removeFromCart(buyer_email, product);
    return;
  }

  db.prepare(
    "UPDATE Shopping_Cart SET quantity = ? WHERE buyer_email = ? AND listing_seller_email = ? AND listing_id = ?",
  ).run(newQuantity, buyer_email, seller_email, listing_id);
};
