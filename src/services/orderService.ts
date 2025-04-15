import db from "@/db/db";
import { Order, Product_Listing } from "@/db/models";

export interface ProductOrder extends Order, Product_Listing {}

export const getOrdersByBuyer = async (buyer_email: string): Promise<ProductOrder[]> => {
  // Get all orders by buyer_email
  const orders: Order[] = db
    .prepare("SELECT * FROM Orders WHERE buyer_email = ?")
    .all(buyer_email) as Order[];

  if (orders.length === 0) return [];

  // Extract all unique listing_ids from the orders
  const listingIds = [...new Set(orders.map((order) => order.listing_id))];

  // Fetch all matching listings
  const placeholders = listingIds.map(() => '?').join(', ');
  const listings: Product_Listing[] = db
    .prepare(`SELECT * FROM Product_Listings WHERE listing_id IN (${placeholders})`)
    .all(...listingIds) as Product_Listing[];

  // Index listings by listing_id for quick lookup
  const listingMap: Record<number, Product_Listing> = {};
  listings.forEach((listing) => {
    listingMap[listing.listing_id] = listing;
  });

  // Combine each order with its matching listing
  const productOrders: ProductOrder[] = orders.map((order) => ({
    ...listingMap[order.listing_id],
    ...order,
  }));

  return productOrders;
};
