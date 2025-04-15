import db from "@/db/db";
import { CartItem } from "@/db/models";
import { removeFromCart, getCart } from "./cartService";

// Confirms checkout: deducts inventory, adds orders, clears cart
export const confirmCheckout = async (buyer_email: string) => {
  const cart: CartItem[] = await getCart(buyer_email);

  const now = new Date().toISOString();

  for (const item of cart) {
    const product = item.product;
    const purchaseQty = item.quantity;

    // 1. Verify enough stock
    if (purchaseQty > product.quantity) {
      throw new Error(
        `Not enough stock for ${product.product_title}. Available: ${product.quantity}, Requested: ${purchaseQty}`,
      );
    }

    // 2. Deduct quantity from Product_Listings
    db.prepare(
      `UPDATE Product_Listings 
       SET quantity = quantity - ? 
       WHERE seller_email = ? AND listing_id = ?`,
    ).run(purchaseQty, product.seller_email, product.listing_id);

    // 3. Add to Orders table
    db.prepare(
      `INSERT INTO Orders 
       (seller_email, listing_id, buyer_email, date, quantity, payment) 
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      product.seller_email,
      product.listing_id,
      buyer_email,
      now,
      purchaseQty,
      product.product_price * purchaseQty,
    );

    // 4. Remove from Shopping_Cart
    await removeFromCart(buyer_email, product);
  }
};
