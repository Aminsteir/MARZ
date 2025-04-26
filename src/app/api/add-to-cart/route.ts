// API Route: /api/add-to-cart  - Add a product to buyer's shopping cart
import { addProductToCart } from "@/services/cartService";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { UserRole } from "@/db/models";

/**
 * POST handler: add product to cart (Buyer role required)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // check if the user is a Buyer (only Buyer's can add to a shopping cart)
  if (
    !session ||
    !session.user ||
    (session.user.role as UserRole) !== "Buyer"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // get Buyer's email
  const buyer_email = session.user.email;
  const body = await req.json();

  // get Seller's email and product listing
  const seller_email = body.seller_email;
  const listing_id = body.listing_id;
  const quantity = 1;

  // adding order information to the cart
  const result = await addProductToCart(
    buyer_email,
    seller_email,
    listing_id,
    quantity,
  )
    .then(() => { // successful message 
      return { msg: "Cart updated successfully", status: true }; 
    })
    .catch((err) => { // error message
      console.error("Error adding product to cart:", err);
      return { msg: err.message, status: false };
    });

  // return status of whether the product was added to the cart or not
  if (result.status) {
    return NextResponse.json({ message: result.msg }, { status: 201 });
  }

  return NextResponse.json({ message: result.msg }, { status: 500 });
}
