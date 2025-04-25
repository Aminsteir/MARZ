import db from "@/db/db";
import {
  Category,
  Product_Listing,
  ProductWithStats,
  Promoted_Product,
} from "@/db/models";

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

export const getProductsByCategory = async (category: string) => {
  const cat: Category = db
    .prepare("SELECT * FROM Categories WHERE category_name = ?")
    .get(category) as Category;

  if (!cat) {
    throw new Error("Category not found");
  }

  const rows = db
    .prepare(
      `SELECT
        P.*,
        COUNT(R.rating) AS review_count,
        AVG(R.rating) AS avg_rating
      FROM Product_Listings P
      LEFT JOIN Orders O
        ON O.seller_email = P.seller_email
        AND O.listing_id = P.listing_id
      LEFT JOIN Reviews R
        ON R.order_id = O.order_id
      WHERE P.category = ?
        AND P.status != 0
      GROUP BY
        P.seller_email,
        P.listing_id`,
    )
    .all(category) as (Product_Listing & {
    review_count: number;
    avg_rating: number;
  })[];

  const products: ProductWithStats[] = rows.map((row) => ({
    info: {
      seller_email: row.seller_email,
      listing_id: row.listing_id,
      category: row.category,
      product_title: row.product_title,
      product_name: row.product_name,
      product_description: row.product_description,
      quantity: row.quantity,
      product_price: row.product_price,
      status: row.status,
    },
    seller_stats: {
      review_count: row.review_count,
      avg_rating: row.avg_rating,
    },
  }));

  return products;
};

export const searchProducts = async (query: string) => {
  const likeQuery = `%${query}%`;
  const rows = db
    .prepare(
      `SELECT
        P.*,
        COUNT(R.rating) AS review_count,
        AVG(R.rating) AS avg_rating
      FROM Product_Listings P
      LEFT JOIN Orders O
        ON O.seller_email = P.seller_email
        AND O.listing_id = P.listing_id
      LEFT JOIN Reviews R
        ON R.order_id = O.order_id
      WHERE (P.product_title LIKE ? OR P.product_name LIKE ? OR P.product_description LIKE ? OR P.category LIKE ? OR P.seller_email LIKE ?)
        AND P.status != 0
      GROUP BY
        P.seller_email,
        P.listing_id`,
    )
    .all(
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
    ) as (Product_Listing & {
    review_count: number;
    avg_rating: number;
  })[];

  const products: ProductWithStats[] = rows.map((row) => ({
    info: {
      seller_email: row.seller_email,
      listing_id: row.listing_id,
      category: row.category,
      product_title: row.product_title,
      product_name: row.product_name,
      product_description: row.product_description,
      quantity: row.quantity,
      product_price: row.product_price,
      status: row.status,
    },
    seller_stats: {
      review_count: row.review_count,
      avg_rating: row.avg_rating,
    },
  }));

  return products;
};

export const promoteProduct = async (product_info: any) => {
  const { seller_email, listing_id } = product_info;

  // First, find the product listing and get its price
  const product = db
    .prepare(
      "SELECT * FROM Product_Listings WHERE seller_email = ? AND listing_id = ?",
    )
    .get(seller_email, listing_id) as Product_Listing;

  if (!product) {
    throw new Error("Product not found");
  }

  // Promotion fee: 5% of product price
  const promotionFee = product.product_price * 0.05;

  // Check if seller has enough balance
  const seller = db
    .prepare("SELECT balance FROM Sellers WHERE email = ?")
    .get(seller_email) as { balance: number };

  if (!seller) {
    throw new Error("Seller not found");
  }

  if (seller.balance < promotionFee) {
    throw new Error("Insufficient balance for promotion");
  }

  // Use transaction to ensure both db statements run
  db.transaction(() => {
    // Subtract promotion fee from seller's balance
    db.prepare("UPDATE Sellers SET balance = balance - ? WHERE email = ?").run(
      promotionFee,
      seller_email,
    );

    // Add product to Promoted_Products table
    db.prepare(
      "INSERT OR REPLACE INTO Promoted_Products (seller_email, listing_id, promotion_start_time) VALUES (?, ?, datetime('now'))",
    ).run(seller_email, listing_id);
  })();
};

export const getPromotedProductsBySeller = async (sellerEmail: string) => {
  // Get all promoted products for this seller
  const promotedProducts = db
    .prepare(
      `
      SELECT * FROM Promoted_Products WHERE seller_email = ?
    `,
    )
    .all(sellerEmail) as (Promoted_Product & {
    promotion_start_time: string;
  })[];

  return promotedProducts;
};

export const getPromotedProducts = async () => {
  // Get all promoted products for this seller
  const rows = db
    .prepare(
      `SELECT
        PL.*,
        COUNT(R.rating) AS review_count,
        AVG(R.rating) AS avg_rating
      FROM Promoted_Products PP
      JOIN Product_Listings PL
        ON PP.seller_email = PL.seller_email
        AND PP.listing_id = PL.listing_id
      LEFT JOIN Orders O
        ON O.seller_email = PL.seller_email
        AND O.listing_id = PL.listing_id
      LEFT JOIN Reviews R
        ON R.order_id = O.order_id
      WHERE PL.status != 0
      GROUP BY
        PL.seller_email,
        PL.listing_id`,
    )
    .all() as (Product_Listing & {
    review_count: number;
    avg_rating: number;
  })[];

  const promotedProducts: ProductWithStats[] = rows.map((row) => ({
    info: {
      seller_email: row.seller_email,
      listing_id: row.listing_id,
      category: row.category,
      product_title: row.product_title,
      product_name: row.product_name,
      product_description: row.product_description,
      quantity: row.quantity,
      product_price: row.product_price,
      status: row.status,
    },
    seller_stats: {
      review_count: row.review_count,
      avg_rating: row.avg_rating,
    },
  }));

  return promotedProducts;
};
