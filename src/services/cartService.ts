// Service functions for managing the shopping cart
import db from "@/db/db";
import { CartItem, CartItemRaw, Product_Listing } from "@/db/models";

interface CartRow {
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

  avg_rating: number;
  review_count: number;
}

/**
 * Remove all items from a buyer's shopping cart
 */
export const emptyCart = async (buyer_email: string) => {
  db.prepare("DELETE FROM Shopping_Cart WHERE buyer_email = ?").run(
    buyer_email,
  );
};

/**
 * Remove a specific product listing from the buyer's cart
 */
export const removeFromCart = async (
  buyer_email: string,
  product_listing: Product_Listing,
) => {
  db.prepare(
    "DELETE FROM Shopping_Cart WHERE buyer_email = ? AND listing_seller_email = ? AND listing_id = ?",
  ).run(buyer_email, product_listing.seller_email, product_listing.listing_id);
};

/**
 * Retrieve cart items, including product details and seller statistics, for a buyer
 */
export const getCart = async (email: string): Promise<CartItem[]> => {
  // const cartItems: result[] = db
  //   .prepare(
  //     `SELECT pl.*, sc.quantity AS cartQuantity FROM Product_Listings pl
  //     JOIN Shopping_Cart sc ON pl.seller_email = sc.listing_seller_email AND pl.listing_id = sc.listing_id
  //     WHERE sc.buyer_email = ?`,
  //   )
  //   .all(email) as result[];

  const cartRows: CartRow[] = db
    .prepare(
      `SELECT
          pl.*,
          sc.quantity AS cartQuantity,
          SR.avg_rating,
          SR.review_count
        FROM Product_Listings pl
        JOIN Shopping_Cart sc
          ON sc.listing_seller_email = pl.seller_email
          AND sc.listing_id = pl.listing_id
        LEFT JOIN (
          SELECT
            O.seller_email,
            COUNT(R.rating) AS review_count,
            AVG(R.rating) AS avg_rating
          FROM Orders O
          JOIN Reviews R
            ON R.order_id = O.order_id
          GROUP BY O.seller_email
        ) AS SR
          ON SR.seller_email = pl.seller_email
        WHERE sc.buyer_email = ?`,
    )
    .all(email) as CartRow[];

  // Map the results to the CartItem type
  const cart: CartItem[] = cartRows.map((item) => ({
    product: {
      info: {
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
      seller_stats: {
        avg_rating: item.avg_rating ?? 0,
        review_count: item.review_count ?? 0,
      },
    },
    quantity: item.cartQuantity,
  }));

  return cart;
};

/**
 * Update the quantity of an item in the cart or remove it if quantity is zero
 */
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

/**
 * Add a new product listing to the buyer's shopping cart with specified quantity
 */
export const addProductToCart = async (
  buyer_email: string,
  seller_email: string,
  listing_id: number,
  quantity: number,
) => {
  const cartItem: CartItemRaw = db
    .prepare(
      "SELECT * FROM Shopping_Cart WHERE buyer_email = ? AND listing_seller_email = ? AND listing_id = ?",
    )
    .get(buyer_email, seller_email, listing_id) as CartItemRaw;

  if (cartItem) {
    throw new Error("Item already in cart");
  }

  const product: Product_Listing = db
    .prepare(
      "SELECT * FROM Product_Listings WHERE seller_email = ? AND listing_id = ?",
    )
    .get(seller_email, listing_id) as Product_Listing;

  if (!product) {
    throw new Error("Product not found");
  }

  if (quantity > product.quantity) {
    throw new Error("Quantity exceeds available stock");
  }

  db.prepare(
    "INSERT INTO Shopping_Cart (buyer_email, listing_seller_email, listing_id, quantity) VALUES (?, ?, ?, ?)",
  ).run(buyer_email, seller_email, listing_id, quantity);
};
