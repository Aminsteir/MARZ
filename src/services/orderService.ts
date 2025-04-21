import { ProductOrderWStats } from "@/db/models";
import db from "@/db/db";

export const getOrdersByBuyer = async (
  buyer_email: string,
): Promise<ProductOrderWStats[]> => {
  const rows = db
    .prepare(
      `
      SELECT
        O.order_id,
        O.seller_email,
        O.listing_id,
        O.buyer_email,
        O.date,
        O.quantity AS order_quantity,
        O.payment,

        P.category,
        P.product_title,
        P.product_name,
        P.product_description,
        P.quantity AS stock_quantity,
        P.product_price,
        P.status,

        SR.review_count,
        SR.avg_rating,

        BR.rating AS buyer_rating,
        BR.review_desc AS buyer_review_desc

      FROM Orders O

      JOIN Product_Listings P
        ON P.seller_email = O.seller_email
       AND P.listing_id = O.listing_id

      LEFT JOIN (
        SELECT
          O2.seller_email,
          COUNT(R.rating) AS review_count,
          AVG(R.rating) AS avg_rating
        FROM Orders O2
        JOIN Reviews R
          ON R.order_id = O2.order_id
        GROUP BY O2.seller_email
      ) AS SR
        ON SR.seller_email = O.seller_email

      LEFT JOIN Reviews BR
        ON BR.order_id = O.order_id

      WHERE O.buyer_email = ?
      ORDER BY O.date DESC
    `,
    )
    .all(buyer_email) as Array<{
    order_id: number;
    seller_email: string;
    listing_id: number;
    buyer_email: string;
    date: string;
    order_quantity: number;
    payment: number;

    category: string;
    product_title: string;
    product_name: string;
    product_description: string;
    stock_quantity: number;
    product_price: number;
    status: number;

    review_count: number | null;
    avg_rating: number | null;

    buyer_rating: number | null;
    buyer_review_desc: string | null;
  }>;

  return rows.map(
    (r): ProductOrderWStats => ({
      order: {
        order_id: r.order_id,
        seller_email: r.seller_email,
        listing_id: r.listing_id,
        buyer_email: r.buyer_email,
        date: r.date,
        quantity: r.order_quantity,
        payment: r.payment,
      },
      product: {
        seller_email: r.seller_email,
        listing_id: r.listing_id,
        category: r.category,
        product_title: r.product_title,
        product_name: r.product_name,
        product_description: r.product_description,
        quantity: r.stock_quantity,
        product_price: r.product_price,
        status: r.status,
      },
      seller_stats: {
        review_count: r.review_count ?? 0,
        avg_rating: r.avg_rating ?? 0,
      },
      buyer_review:
        r.buyer_rating !== null
          ? {
              order_id: r.order_id,
              rating: r.buyer_rating,
              review_desc: r.buyer_review_desc ?? "",
            }
          : null,
    }),
  );
};
