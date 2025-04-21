import db from "@/db/db";
import { CartItem } from "@/db/models";
import { getCart, emptyCart } from "./cartService";

// Confirms checkout: deducts inventory, adds orders, clears cart
export const confirmCheckout = async (
  buyer_email: string,
): Promise<number[]> => {
  const cart: CartItem[] = await getCart(buyer_email);

  // Format date as YYYY/M/D
  const now = new Date();
  const formattedDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

  const orderIds: number[] = [];

  for (const item of cart) {
    const product = item.product;
    const purchaseQty = item.quantity;
    const cost =
      Math.round(product.info.product_price * purchaseQty * 100) / 100;

    if (purchaseQty > product.info.quantity) {
      throw new Error(
        `Not enough stock for ${product.info.product_title}. Available: ${product.info.quantity}, Requested: ${purchaseQty}`,
      );
    }

    if (purchaseQty == product.info.quantity) {
      product.info.status = 2;
    }

    db.prepare(
      `UPDATE Product_Listings
            SET quantity = quantity - ?, status = ?
            WHERE seller_email = ? AND listing_id = ?`,
    ).run(
      purchaseQty,
      product.info.status,
      product.info.seller_email,
      product.info.listing_id,
    );

    const result = db
      .prepare(
        `INSERT INTO Orders
            (seller_email, listing_id, buyer_email, date, quantity, payment)
            VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        product.info.seller_email,
        product.info.listing_id,
        buyer_email,
        formattedDate,
        purchaseQty,
        cost,
      );

    orderIds.push(result.lastInsertRowid as number);

    db.prepare(`UPDATE Sellers SET balance = balance + ? WHERE email = ?`).run(
      cost,
      product.info.seller_email,
    );
  }

  await emptyCart(buyer_email);

  return orderIds;
};
